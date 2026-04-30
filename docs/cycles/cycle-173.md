---
id: 173
description: "サイト内検索の計測強化実装（B-340）。`src/lib/analytics.ts` に search_result_click / search_modal_open / search_modal_close / 検索→離脱の各イベントを追加し、cycle-172 で保留となった Phase 1.1（B-339）再判断の 30 日データ蓄積を開始可能にする。"
started_at: "2026-04-30T23:17:15+0900"
completed_at: null
---

# サイクル-173

このサイクルでは **B-340: サイト内検索の計測強化実装** を実施する。cycle-172 で Phase 1.1（サイト内検索の方針判断）が「現状計測では判断根拠不足」として保留判定となり、再判断（B-339）には `search_result_click` 等の追加イベント実装と 30 日以上のデータ蓄積が必要になった。本サイクルは前者（計測強化）を完了させ、30 日のデータ蓄積タイマーを開始させることが目的。

migration plan の Phase 1.1 が止まっている間、Phase 4・5・2 系の後続タスク（B-334 / B-331 / B-309 等）はすべて Blocked 状態にある。計測強化が遅れるほど移行全体が遅延するため、本サイクルは critical path 上の最速着手として位置づける。

## 実施する作業

### 1. 事前確認（実装着手前）

- [ ] `docs/research/2026-04-30-site-search-usage-analysis.md` の §7（再判断条件）と §6 を読み、追加イベントが「(a)/(b)/(c) のどれを支持するためのデータか」をエージェントが説明できる状態にする。
- [ ] `src/lib/analytics.ts` 現状実装（`sendGaEvent` の SSR / `gtag` 未ロード防御、`trackSearch` の trim 前処理）を確認し、追加関数も同じ前処理・防御規約に揃える方針を確定する。
- [ ] `src/components/search/SearchModal.tsx` と `src/components/search/SearchTrigger.tsx` を読み、既存の `CloseReason = "navigation" | "dismiss"` の閉じ経路、および `SearchModal.handleClose` を経由しない 2 つの直接閉鎖経路を確認する: (1) popstate 経路（`SearchTrigger.tsx` L154-163 の `handlePopState` 内で `setIsOpen(false)`）、(2) Cmd+K toggle close 経路（`SearchTrigger.tsx` L107-137 の Cmd+K ハンドラで `prev=true` のとき `setIsOpen((prev) => !prev)` の戻り値が `false` になり、focus 復元と `focusOriginRef` クリアを直接実行）。後述の「`search_modal_close` の発火経路と `close_reason` の取り扱い」セクションで採用案を確定済みのため、それに沿って差分の小さい改修方針であることを再検証する。
- [ ] `src/components/search/SearchResults.tsx` を読み、既存 `onSelect: () => void` には URL/query が渡っていないこと（L125 `onClick={onSelect}`、`SearchModal.tsx` L187 で `() => handleClose("navigation")` として渡っている）を確認する。後述「`search_result_click` の発火点」セクションの採用案に沿って、必要なシグネチャ拡張または親へのコールバック追加の規模を見積もる。
- [ ] `src/components/search/useSearch.ts` の `performSearch` 内 `trackSearch` 発火点（150ms デバウンス後の `q.trim()` が空でなく Fuse 結果が得られたタイミング）を確認し、「検索を実行した／実行していない」の境界をコードレベルで特定する。同ファイルの `clearSearch` が `setQueryState("")` を実行することと、`SearchModal.handleClose` が `clearSearch()` を `onClose(reason)` より先に呼ぶ順序を確認する（abandoned 判定タイミングに直接影響）。
- [ ] `src/lib/__tests__/analytics.test.ts` の現状（既存 `trackSearch` テストに加筆するのみで破壊変更なし）と、`src/components/search/__tests__/SearchModal.test.tsx` の現状（`window.gtag` のスタブが現状のテストファイルに存在しないこと）を確認し、後者では全テスト共通で `window.gtag` スタブを `beforeEach` で導入する必要があることを把握する。
- [ ] `src/lib/search/build-index.ts` を読み、`SearchDocument.url` が常にサイト内パス（`/tools/...`、`/play/...` など）として生成されていることを確認する。これにより `result_url` パラメータが内部コンテンツのみを送ることが構造的に保証されているが、念のため実装側でも `URL` オブジェクトでパスのみを抽出するなどの防御を入れる方針が妥当であることを確認する。

### 2. 仕様確定（本計画書で確定済みの採用案を実装エージェントに引き継ぐ）

以下はすべて本計画書「作業内容」セクションで確定済み。実装エージェントは確定内容に従って実装するのみで、再検討は不要（変更が必要な場合は計画修正サイクルに戻すこと）。

- [x] 新規 GA4 イベントの命名・パラメータ・発火タイミング → 本ファイル「4 種の追加イベント仕様」表で確定
- [x] `close_reason` の値域 → 6 値（escape / backdrop / close_button / popstate / navigation / cmd_k）で確定（「`search_modal_close` の発火経路と `close_reason` の取り扱い」セクション採用案 B' を参照）
- [x] popstate 経路の発火点 → SearchTrigger 側に直接発火点を追加。実装方式は (ii) ref 経由の計測専用メソッド公開（パターン β）で確定。
- [x] Cmd+K toggle close 経路の発火点 → SearchTrigger 側の Cmd+K ハンドラの `prev=true` 分岐内、`focusOriginRef` クリアより前に直接発火点を追加（経由は popstate と同じ ref 経由の計測専用メソッド）。
- [x] `search_result_click` の発火経路と引数の流し方 → `SearchResults.onSelect` を `(url: string) => void` に拡張（採用案 A）
- [x] abandoned 判定方針 → `useSearch` の `getHasSearched()` で判定、`hadAnyInputRef` で `had_query` を確定（「`had_query` の確定定義と clearSearch 順序問題」採用案 B）
- [x] フラグリセット責務 → `useSearch` 側に `resetTracking()` メソッドを生やし、`SearchModal` の `useEffect([isOpen, ...])` 内 `isOpen=true` 分岐で `resetTracking()` を呼ぶ単一実装に確定（後述「フラグのリセット責務と useEffect cleanup の整合」セクション参照）。
- [x] `handleClose` 内（および ref 経由計測専用メソッド内）の発火順序 → 1) abandoned 判定 → 2) `trackSearchModalClose` → 3) abandoned なら `trackSearchAbandoned` → 4)（handleClose 経路のみ）`clearSearch()` & `onClose(reason)` で確定。
- [x] `search_term` の PII 扱い → trim のみ（既存 `trackSearch` と同等）で確定
- [x] `result_url` の扱い → サイト内パスのみ。`new URL(url, location.origin)` でパース → `.pathname + .search + .hash` を抽出する防御的実装を必須化

### 3. 実装（後段サブエージェントに委譲）

- [ ] `src/lib/analytics.ts` に 4 種の関数（`trackSearchModalOpen` / `trackSearchModalClose` / `trackSearchResultClick` / `trackSearchAbandoned` ※命名は実装エージェントが GA4 標準に沿って最終決定）を追加する。
- [ ] `SearchTrigger.tsx` の `openModal` および Cmd+K による open トグル経路で `trackSearchModalOpen` を発火する（既存の Cmd+K ハンドラの `prev=false` 分岐で `setIsOpen(true)` を返す直前に発火）。
- [ ] `SearchModal.tsx` の `handleClose` 経路（cancel/ESC、バックドロップ click、✕ ボタン、Enter による navigation）で `trackSearchModalClose` を `close_reason` 付きで発火する。abandoned 判定（後述の確定方針）もここで実施し、該当時のみ `trackSearchAbandoned` を発火する。
- [ ] `SearchModal.tsx` から、popstate / Cmd+K toggle close 用の「計測専用メソッド」を `useImperativeHandle` で ref 経由公開する（後述「popstate 経路と Cmd+K toggle close 経路の発火統一について」採用パターン β）。当該メソッドは abandoned 判定 → `trackSearchModalClose({ close_reason })` → 必要なら `trackSearchAbandoned` を呼ぶのみで、`setIsOpen` 変更や `onClose` 呼び出しは行わない。**ref 公開の実装パターン（React 19.2.4 を使用しているため確定）**:
  - 本プロジェクトの React バージョンは `package.json` で `react: 19.2.4` / `react-dom: 19.2.4`（実態確認済み）。React 19 では `forwardRef` 不要で `ref` を通常の prop として受け取れる。
  - **採用シグネチャ**: `function SearchModal({ ref, isOpen, onClose }: SearchModalProps & { ref?: React.Ref<SearchModalHandle> })` の形で props 経由で ref を受け取る（React 19 の新方式）。`forwardRef` は使用しない。
  - **ref ハンドル型定義**: `export type SearchModalHandle = { recordCloseAndAbandonedTracking: (reason: CloseReasonValue) => void }` を `SearchModal.tsx` から export する。`CloseReasonValue` は本計画で確定した GA4 用 6 値の union 型 `"escape" | "backdrop" | "close_button" | "popstate" | "navigation" | "cmd_k"`（`SearchModal.tsx` 内既存の `CloseReason` とは別の型として新設し、既存 `CloseReason` は focus restoration 用に温存する — L144 採用案 B' の設計に準拠）。
  - **`useImperativeHandle` の使用**: `SearchModal` 内で `useImperativeHandle(ref, () => ({ recordCloseAndAbandonedTracking: (reason) => { /* abandoned 判定 → trackSearchModalClose → trackSearchAbandoned */ } }), [/* 依存配列は getHasSearched/getHadAnyInput を含む */])` を呼ぶ。
  - **SearchTrigger 側の受け方**: `const searchModalRef = useRef<SearchModalHandle>(null);` を宣言し、JSX で `<SearchModal ref={searchModalRef} isOpen={isOpen} onClose={...} />` と渡す。popstate ハンドラと Cmd+K ハンドラ内で `searchModalRef.current?.recordCloseAndAbandonedTracking("popstate" | "cmd_k")` を呼ぶ。
  - **不採用（React 18 以下相当の `forwardRef`）**: 本プロジェクトは React 19 のため `forwardRef` の使用は不要。React 19 の方式で統一する。
- [ ] popstate 経路（`SearchTrigger.tsx` L154-163 の `handlePopState` 内）の `setIsOpen(false)` の **直前** に、上記 ref 経由計測メソッドを `close_reason: "popstate"` で呼ぶ。**確定する実装順序**: 現行は `closedByPopState = true; setIsOpen(false); ...focus 復元` の順だが、計測呼び出しを差し込む際は **(1) `closedByPopState = true;` → (2) `searchModalRef.current?.recordCloseAndAbandonedTracking("popstate");` → (3) `setIsOpen(false);` → (4) focus 復元（`focusOriginRef.current` を HTMLElement なら focus → `focusOriginRef.current = null`）** の順とする。`closedByPopState = true` を先頭に置く理由は、`useEffect` cleanup（L167-187）が `closedByPopState` を見て `history.back()` を抑制する条件に使われており、計測呼び出し中に万一例外が発生しても cleanup の判定が壊れないようにするため。計測呼び出しを `setIsOpen(false)` より前に置く理由は、`setIsOpen(false)` 後に `useEffect` cleanup が走り `clearSearch()` が呼ばれるが、`hasSearchedRef` / `hadAnyInputRef` は ref のため `clearSearch` の影響を受けない（L177 で構造的に保証済み）ものの、計測 → state 更新の順序を明示しておく方が後段の保守性が高いため。
- [ ] Cmd+K toggle close 経路（`SearchTrigger.tsx` L118-133 の Cmd+K ハンドラ内の `prev=true` 分岐）の `setIsOpen((prev) => !prev)` の戻り値で `false` を返す **前** に、ref 経由計測メソッドを `close_reason: "cmd_k"` で呼ぶ。`setIsOpen` の updater 関数内で副作用呼び出しを行うのは React の慣例に反するため、ref 経由メソッドは `setIsOpen` の updater 外で呼ぶ。**採用パターン（A）**: Cmd+K ハンドラ先頭で `isEditableTarget` チェック後・`setIsOpen` 呼び出し前に `const willClose = isOpen;` を取得し、`if (willClose) { searchModalRef.current?.recordCloseAndAbandonedTracking("cmd_k"); }` を `setIsOpen((prev) => !prev)` の **直前** に挿入する。`setIsOpen` の updater 内の focus 復元処理（L122-131）と `focusOriginRef.current = null`（L130）は現行のまま据え置く（差分最小・既存責務分担維持を優先）。**不採用パターン（B）**: `setIsOpen((prev) => !prev)` を `setIsOpen(!isOpen)` に書き換え、計測・focus 復元・state 更新を順次実行する設計純度優先案 — 却下理由: updater 形式から非 updater 形式への変更は React の closure 問題を再導入するリスクがあり（現行の updater 形式は `prev` を確実に最新値で受けるための設計）、かつ focus 復元ロジックを updater 外に取り出す再構成が必要で差分が大きくなる。本サイクルの方針「差分最小・既存責務分担維持」（L166）と整合しない。
- [ ] `SearchResults.tsx` の Link `onClick` と `SearchModal.tsx` の Enter キー選択経路の両方で `trackSearchResultClick({ search_term, result_url })` を発火する。実装方針は後述「`search_result_click` の発火点と引数の流し方」採用案 A で確定済み: `SearchResults.onSelect` のシグネチャを `(url: string) => void` に拡張し、計測呼び出しは `SearchModal` 側に集約する。
- [ ] `useSearch.ts` の `performSearch` で `trackSearch` が実行されたことを SearchModal 側に観測可能にする（戻り値に `getHasSearched(): boolean` を追加。既存 `trackSearch` の挙動・引数は変更しない）。同時に、後述「`had_query` の確定定義」に沿って「モーダル開〜閉までに 1 文字でも入力された痕跡があったか」を保持する `hadAnyInputRef` 相当のフラグも `useSearch` 内に立て、`getHadAnyInput(): boolean` で戻り値経由で参照可能にする。
- [ ] `useSearch.ts` に `resetTracking()` メソッドを追加し、戻り値経由で公開する。`hasSearchedRef` と `hadAnyInputRef` の両方を false に戻す責務のみを持つ。`SearchModal.tsx` の `useEffect([isOpen, ...])` の `isOpen=true` 分岐で `resetTracking()` を呼び、open のたびにフラグが初期化されることを保証する。

### 4. テスト

- [ ] `src/lib/__tests__/analytics.test.ts` に新規 4 関数の単体テスト（gtag に正しいイベント名・パラメータが渡る／SSR・gtag 未ロード時に no-op）を追加する。既存テストは加筆のみで破壊的変更なし。
- [ ] `src/components/search/__tests__/SearchModal.test.tsx` の冒頭で `window.gtag` をスタブする `beforeEach`/`afterEach` を新規導入する（現状のテストファイルにスタブはなく、計測コードを追加した時点で全テストが副作用で gtag を呼び始めるため）。
- [ ] `src/components/search/__tests__/SearchModal.test.tsx` に以下のシナリオを追加する（SearchModal.handleClose 経路のみ検証可能）:
  - 「モーダル開→閉（一文字も入力せず）で `search_abandoned` が `had_query=false` で発火」
  - 「モーダル開→1 文字入力→ 150ms 経過前に閉→ `search_abandoned` が `had_query=true` で発火」（境界シナリオ）
  - 「モーダル開→空白のみ入力（例: スペース 5 文字）→閉 で `search_abandoned` が `had_query=true` で発火」（[新-軽4] 採用案: `q.length` 判定に基づく挙動の境界確認）
  - 「モーダル開→検索（150ms 経過後 `trackSearch` が発火）→閉 で `search_abandoned` が発火しない」
  - 「結果クリックで `search_result_click` が `search_term` と `result_url` 付きで記録される」
  - 「Enter キー選択でも `search_result_click` が `search_term` と `result_url` 付きで記録される」
  - 「ESC / バックドロップ / ✕ で閉じた時の `search_modal_close` の `close_reason` がそれぞれ正しい値（escape / backdrop / close_button / navigation）で発火」
- [ ] `src/components/search/__tests__/SearchTrigger.test.tsx`（既存ファイル — 実態確認済み）に以下のシナリオを追加する。これらは `SearchModal` 単独テストでは検証できない、SearchTrigger 経由の直接閉鎖経路。
  - 「Cmd+K で開→ Cmd+K で閉（toggle close）で `search_modal_close` が `close_reason: "cmd_k"` で発火し、未検索なら `search_abandoned` も発火する」
  - 「モーダル開→ブラウザ戻るボタン（popstate）で閉で `search_modal_close` が `close_reason: "popstate"` で発火し、未検索なら `search_abandoned` も発火する」
  - 「Cmd+K で開→ `trackSearchModalOpen` が 1 回発火する」（重複発火しないことの確認）
  - いずれも `window.gtag` を `beforeEach` でスタブし、計測呼び出し → `setIsOpen(false)` の **順序** を確認する（計測がフラグリセット前に呼ばれることを保証）。
- [ ] 既存 SearchModal テスト（onClose 呼び出し回数の assert を持つもの）について、`window.gtag` 呼び出し回数の assert が新規追加されたコードによって増えても、既存 assert（`onClose` の呼び出し回数）は影響を受けないことを確認する。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべてパスすることを確認する。

### 5. ドキュメント・backlog 更新

- [ ] **30 日タイマーの起点を確定する手順を実行する**: 本サイクルのデプロイ完了後、GA4 リアルタイムレポートで `search_modal_open` イベントが受信されることを以下の手順で確認する。(1) 自分（PM）が本番サイトのトップページを開き、Cmd+K か検索ボタンで検索モーダルを開く。(2) GA4 リアルタイムレポートで `search_modal_open` が観測されることを確認する。(3) **観測された日（= 本番反映の確認日）を 30 日タイマーの起点とする**。リアルタイムレポートで観測できなかった場合のフォールバックとして、24 時間後に GA4 通常レポート（探索 → カスタム）で `search_modal_open` の発生件数 ≥ 1 を確認し、最初に件数 ≥ 1 となった日付を起点とする。
- [ ] `docs/research/2026-04-30-site-search-usage-analysis.md` の末尾に「§ 計測強化の実装記録」セクションを追加し、(a) 実装した GA4 イベントの一覧と各パラメータ、(b) **GA4 初観測日（= 30 日タイマー起点）** 、(c) 推奨再評価日（起点 +30 日以上）、(d) 再判断時に確認すべき GA4 のディメンション・指標 を明記する。これにより 30 日後の B-339 担当エージェントが本研究文書を見るだけで判断手順を再開できる。
- [ ] `docs/backlog.md` の B-339 Notes に、(a) GA4 初観測日（= 30 日タイマー起点）、(b) 推奨再評価日（起点 +30 日以上）、(c) 起点を確定するための GA4 確認手順への参照、を追記する。
- [ ] `docs/backlog.md` の B-340 を Done に遷移させる。
- [ ] cycle-173 のキャリーオーバー欄に B-339 の再判断時に必要な情報（GA4 初観測日、推奨再評価日、再判断時に確認すべき GA4 ディメンション）を残す。

### 6. 受け入れ確認

- [ ] 上記すべてのチェックが入っており、`/cycle-completion` 前のチェックリスト（ファイル末尾）も全項目満たしている。
- [ ] reviewer のレビューを受け、指摘事項がすべてクローズされている。

## 作業計画

### 目的

cycle-172 で Phase 1.1（サイト内検索の方針判断）が「現状計測ではデータ不足」として保留判定された。判断材料を構造的に取得不能な現状を打破するため、本サイクルで GA4 計測を強化し、B-339（再判断）が前提とする「30 日以上のデータ蓄積」のタイマーを起点 0 で開始させる。これにより Blocked 状態にある後続タスク（B-339 / B-331 / B-334 / B-309 ほか）の解凍へ向けた最速着手を実現する。

#### 想定利用者

- 直接的: PM・後段の実装/レビューエージェント（本サイクルおよび 30 日後の B-339 担当）
- 間接的: 30 日後の再判断結果に応じて変更される検索 UI／一覧 UI に到達する全来訪者

#### 本サイクルが提供する価値

- 来訪者には**この時点では直接の体験変化は無い**（バックグラウンドの計測追加のみ）。
- ただし本サイクルの完了によって、Phase 1.1 の保留が「期限付き保留」に変わり、検索維持・分割・撤去のいずれが来訪者価値を最大化するかを根拠ある判断で確定できるようになる。これは結果的に検索 UI の質を最大化する道筋であり、constitution §4（quality > quantity）に合致する。

#### 完成の定義

1. `src/lib/analytics.ts` に 4 種の検索関連イベント関数（モーダル開・モーダル閉・結果クリック・検索なし離脱）が追加され、gtag に正しい event_name とパラメータが渡る単体テストが通る。
2. 検索モーダルの全閉鎖経路 6 種（ESC / バックドロップ / ✕ / popstate / 結果選択（navigation）/ Cmd+K toggle close）で `search_modal_close` が `close_reason` 付きで発火し、結果クリック・Enter 選択で `search_result_click` が発火し、abandoned 該当時に `search_abandoned` が発火する。
3. 既存 `trackSearch`（150ms デバウンス、`search_term` パラメータ）の挙動・引数・送信内容に変更がない。
4. PII の扱いが既存 `trackSearch` と同等（trim のみ）であり、追加された `result_url` 送信もサイト内パスに限定されている（`SearchDocument.url` がサイト内パスのみであることに加え、実装側で `URL` オブジェクト等での防御を行う）。
5. `search_term` を持つ完成クエリのセッションで `search_result_click` が同一セッション内に観測可能なデータ構造になっている（`docs/research/2026-04-30-site-search-usage-analysis.md` §7 質的閾値の前提を満たす）。
6. ドキュメント・backlog の更新が以下の 3 点について完了している:
   1. `docs/backlog.md` の B-339 Notes に GA4 初観測日（= 30 日タイマー起点）と推奨再評価日が追記されている。
   2. `docs/backlog.md` の B-340 が Done に遷移している。
   3. `docs/research/2026-04-30-site-search-usage-analysis.md` に「§ 計測強化の実装記録」セクションが追加され、実装イベント一覧・GA4 初観測日・推奨再評価日・再判断時に確認すべき GA4 ディメンションが記載されている。
7. `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。

### 作業内容

#### 4 種の追加イベント仕様（後段実装エージェント向け基本設計）

GA4 の命名規約（`recommended events` 準拠と snake_case）に従い、いずれもカスタムイベントとして実装する。関連イベントは "search\_" プレフィックスでグルーピングする。

| 関数（仮称）             | 発火 event_name       | パラメータ                                                                                                                 | 発火タイミング                                                                                                                                    |
| ------------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trackSearchModalOpen`   | `search_modal_open`   | なし（`from_path` 等の追加可否は実装エージェントの判断に委ねる。GA4 の `page_location` 自動付与で代替可能なら不要）        | `SearchTrigger.openModal` および Cmd+K による open トグル経路で `setIsOpen(true)` 直前                                                            |
| `trackSearchModalClose`  | `search_modal_close`  | `close_reason: "escape" \| "backdrop" \| "close_button" \| "popstate" \| "navigation" \| "cmd_k"`（6 値、後述の採用案 B'） | 全閉鎖経路: cancel イベント (ESC) / バックドロップ click / ✕ ボタン / popstate / Enter または click による navigation / Cmd+K による toggle close |
| `trackSearchResultClick` | `search_result_click` | `search_term: string`（trim 済）, `result_url: string`（サイト内パス、`URL` オブジェクトでパス抽出して防御）               | 結果リンクの click または Enter キーでの選択時                                                                                                    |
| `trackSearchAbandoned`   | `search_abandoned`    | `had_query: boolean`（後述「`had_query` の確定定義」採用案 B: モーダル開〜閉までに 1 文字でも入力痕跡があったか）          | モーダル閉のうち、`search` イベントが一度も発火していないケース（後述の判定参照）                                                                 |

**注意**:

- GA4 の `search` は推奨イベントで `search_term` がパラメータ予約語として登録されているが、これは recommended event の枠内での扱いであり、独自イベントで `search_term` をそのまま使うことは衝突しない。GA4 は recommended event 以外も自由に登録可能で、本プロジェクトでは既に `level_start` / `unlock_achievement` などを混在運用している。
- `close_reason` を 6 値に拡張するのは既存 `CloseReason = "navigation" | "dismiss"` の二値より分析粒度を上げるための積極的判断（後述「`search_modal_close` の発火経路と `close_reason` の取り扱い」参照）。

#### `search_modal_close` の発火経路と `close_reason` の取り扱い

実態確認（`SearchModal.tsx` L42-49 / L91-97 / L102-109 / L113-133 / L173-182、`SearchTrigger.tsx` L107-137 / L141-188）の結果、閉鎖経路は **6 つ**あり、うち以下の 2 経路は `SearchModal.handleClose` を経由せず `SearchTrigger` 側で `setIsOpen(false)` を直接呼ぶ:

1. **popstate 経路**: `SearchTrigger.tsx` L154-163 の `handlePopState` 内で `setIsOpen(false)` を呼ぶ。`SearchModal` の `useEffect` cleanup 経由で `dialog.close()` と `clearSearch()` が走る。
2. **Cmd+K toggle close 経路**: `SearchTrigger.tsx` L107-137 の Cmd+K ハンドラ内、`prev=true` 分岐で `setIsOpen((prev) => !prev)` の戻り値が `false` になり、focus 復元と `focusOriginRef` クリアを直接実行（L124-130）。`useEffect` cleanup 経由で popstate と同様の処理が走る。

残り 4 経路（cancel/ESC、バックドロップ click、✕ ボタン、Enter または click による navigation）は `SearchModal.handleClose` を経由する。

- **採用案 B'（採用）: `close_reason` を 6 値に拡張する**
  - 値: `"escape" | "backdrop" | "close_button" | "popstate" | "navigation" | "cmd_k"`
  - 既存 `CloseReason = "navigation" | "dismiss"` は focus restoration の判定に使われているだけで、GA4 の `close_reason` とはレイヤが別。`CloseReason` 自体の定義は変更せず、各閉鎖発火点で個別に `close_reason` 値を渡して `trackSearchModalClose` を呼ぶ実装とする。
  - 採用理由: 30 日後の B-339 再判断で「ESC / Cmd+K / ✕ / バックドロップ / popstate / navigation」の比率は来訪者の操作習熟度・PC vs モバイル比率の代理指標になり得る。とくに「Cmd+K で開閉する」のはキーボードショートカット熟練度の強い指標で、ESC と区別できることが分析価値を持つ。dismiss 二値に潰すと再判断時に粒度不足で再計測が必要になるリスクがある。
  - **Cmd+K toggle close を ESC に集約しない理由**: ESC は「キャンセルしたい」明示的離脱、Cmd+K toggle close は「同じショートカットでトグル開閉している」操作であり、意図が異なる可能性が高い。`escape` に集約すると再判断時に「同じ ESC でも実は Cmd+K の方だった」を区別できず、判断材料を 1 つ失う。1 値追加の実装コストはごく軽微（enum 値追加 + 1 発火点）であり、解釈容易性のメリットが上回る。
  - **Cmd+K toggle close を意図的にスキップしない理由**: スキップすると「`search_modal_open` 件数 ≠ `search_modal_close` 件数」となり、データ整合性が崩れる。Cmd+K で開いて Cmd+K で閉じるパワーユーザーの abandoned 率も把握できなくなる。
- **不採用案 A: 既存 `CloseReason` 二値に従い `close_reason: "dismiss" | "navigation"` のみとする**
  - 却下理由: 上記の通り再判断時の粒度不足リスク。
- **不採用案 B: `cmd_k` を `escape` に集約する**
  - 却下理由: 上記「Cmd+K toggle close を ESC に集約しない理由」のとおり。
- **不採用案 C: Cmd+K toggle close 経路の発火を意図的にスキップする**
  - 却下理由: 上記「Cmd+K toggle close を意図的にスキップしない理由」のとおり。

**popstate 経路と Cmd+K toggle close 経路の発火統一について**:

両経路はいずれも `SearchTrigger` 側で `setIsOpen(false)` を直接呼ぶ点で共通しており、同じ仕組みで計測する。

- **採用案: SearchTrigger 側に直接発火点を追加し、ref 経由で SearchModal の計測専用メソッドを呼ぶ（パターン β を採用）**
  - `SearchModal` 側に `useImperativeHandle` で「計測専用メソッド `recordCloseAndAbandonedTracking(closeReason)`」を 1 つ公開する。このメソッドは: (1) `getHasSearched()` で abandoned 判定、(2) `trackSearchModalClose({ close_reason })` を発火、(3) abandoned なら `trackSearchAbandoned({ had_query: getHadAnyInput() })` を発火 — のみを行う。**`setIsOpen` 変更や `onClose` 呼び出しは行わない**。
  - SearchTrigger 側は popstate ハンドラと Cmd+K ハンドラ（close 分岐）の両方で、`setIsOpen(false)` の **直前** に上記 ref メソッドを呼ぶ。`close_reason` はそれぞれ `"popstate"` / `"cmd_k"` を渡す。
  - これにより `useSearch` インスタンスは引き続き `SearchModal` 内部に閉じたまま、計測のみ SearchTrigger から触れる。Phase 5 でも `SearchModal` を新 view に差し替えれば自動的に新 view の計測が動く（ロジック層の責務は移動しない）。
- **不採用パターン α（`handleClose("popstate")` 全体を呼ぶ ref）**:
  - 却下理由: `onClose("popstate")` 経由で SearchTrigger に新たな reason 値が伝わるが、SearchTrigger は popstate 経路で既に `setIsOpen(false)` を直接呼んでおり競合する。state 更新の二重実行や focus 復元の二重実行リスクが発生する。
- **不採用パターン γ（SearchTrigger 側の `setIsOpen(false)` をやめ、popstate ハンドラから ref 経由 `handleClose` に完全置き換え）**:
  - 却下理由: `SearchModal.handleClose` 経由になると `onClose("popstate")` のようなコールバックを SearchTrigger 側に呼ぶ責務が SearchModal に発生し、SearchTrigger ↔ SearchModal の制御フローが現状より複雑化する。focus 復元責務も SearchTrigger 側にあり、handleClose 経由にすると `onClose` の reason 値で focus 動作を分岐させる必要が生じる。差分の小ささ vs 設計純度のトレードオフで、本サイクルは「差分最小・既存責務分担維持」を優先。
- **不採用案 (i) `useSearch` を SearchTrigger 側に巻き上げ**:
  - 却下理由: `useSearch` の責務がモーダル view 層に閉じている現設計を壊す。`SearchModal` が props 経由で `useSearch` の全戻り値を受け取る構造になり、Phase 5 の view 差し替え時に props 契約も再設計しなくてはならない。
- **不採用案: `SearchModal.handleClose` 経由に経路統一する設計変更**
  - 却下理由: popstate ハンドラは `useEffect` のクリーンアップ周辺で `closedByPopState` フラグを管理しており、ここに `SearchModal` への参照を持ち込むと SearchTrigger ↔ SearchModal の依存関係が双方向になり破壊的変更になる。GA4 計測のためにアーキテクチャを大きく変えるべきではない。

**SearchTrigger 直接経路（popstate / Cmd+K toggle close）での発火順序（明示）**:

1. SearchTrigger 側で「閉じる」と確定したタイミング（popstate ハンドラ先頭、または Cmd+K ハンドラ内 `prev=true` 確認直後）。
2. ref 経由 `recordCloseAndAbandonedTracking(closeReason)` を呼ぶ → 内部で `getHasSearched()` 読取 → `trackSearchModalClose` → 必要なら `trackSearchAbandoned` を発火（**この時点では state は変更されていないため、`useSearch` のフラグは確実に「閉じる前の状態」を保持している**）。
3. `setIsOpen(false)` を呼ぶ。
4. SearchModal の `useEffect([isOpen, ...])` が走り、`dialog.close()` と `clearSearch()` が実行される。`hasSearchedRef` / `hadAnyInputRef` は ref（state ではない）なので `clearSearch()` の影響を **受けない**（`clearSearch` は `setQueryState("")` / `setResults([])` / debounce timer クリアのみで、ref には触れない）。
5. 次回 open 時に `useEffect([isOpen, ...])` の `isOpen=true` 分岐で `resetTracking()` が呼ばれ、両 ref が初期化される。

#### `search_result_click` の発火点と引数の流し方

実態確認（`SearchResults.tsx` L19・L125、`SearchModal.tsx` L184-190、`SearchModal.handleKeyDown` L113-133）の結果、現行 `SearchResults.onSelect` は引数なしの `() => void` で、クリックされた `item` の URL も query も親に伝わらない。Enter キー経路は `SearchModal.handleKeyDown` 内で `flatItems[activeIndex].url` と `query` の両方が手元にあるため発火可能。

- **採用案 A（採用）: `SearchResults.onSelect` を `(url: string) => void` に拡張し、`SearchModal` 側で `query` と組み合わせて `trackSearchResultClick` を呼ぶ**
  - `SearchResults.tsx` の `onClick={onSelect}` を `onClick={() => onSelect(item.document.url)}` に変更。
  - `SearchModal.tsx` の `onSelect={() => handleClose("navigation")}` を `onSelect={(url) => { trackSearchResultClick({ search_term: query.trim(), result_url: url }); handleClose("navigation"); }}` に変更（`close_reason: "navigation"` の `search_modal_close` も `handleClose` 内で発火）。
  - 採用理由: 計測責務を `SearchModal` 側に集約でき、`SearchResults` 側に analytics を import させない。Phase 5 の view/logic 分離（後述「migration plan Phase 5 との整合」）でも view 側の責務が薄く保てる。
  - Enter キー経路は `SearchModal.handleKeyDown` 内で `trackSearchResultClick({ search_term: query.trim(), result_url: item.url })` を `handleClose("navigation")` 直前に呼ぶ。
- **不採用案 B: `SearchResults` 内で `trackSearchResultClick` を直接呼ぶ**
  - 却下理由: view 層の責務が増え、Phase 5 で view を新デザイン用に再実装する際に計測コードも再実装する必要が生じる。Phase 5 の「ロジック層を共有、view を別実装」方針と相反する。

#### 「検索を実行せず閉じた」の判定方針（採用案）

採用: **「`search` イベント発火フラグ」をモーダル開〜閉のスコープでクライアント側に保持し、閉時にフラグが立っていなければ `search_abandoned` を発火する**。

- 実装場所: `useSearch` の戻り値に `getHasSearched(): boolean` および `getHadAnyInput(): boolean` を追加する（ref 内部参照を避けて React 流儀の関数経由で公開する）。両者の内部実装は `hasSearchedRef.current` / `hadAnyInputRef.current` を返すだけ。
- `hasSearchedRef` のフラグ立ては `useSearch.performSearch` 内、`trackSearch(q)` 呼び出しと同じ条件分岐（`q.trim()` 非空かつ `fuseRef.current` 存在）で `hasSearchedRef.current = true` を書く。
- **フラグリセット責務（確定）**: `useSearch` 側に `resetTracking(): void` メソッドを生やし、戻り値経由で公開する。`resetTracking` は `hasSearchedRef.current = false` と `hadAnyInputRef.current = false` の 2 行のみ。`SearchModal` の `useEffect([isOpen, loadIndex, clearSearch, resetTracking])` の `isOpen=true` 分岐で `resetTracking()` を呼ぶ単一実装に確定する（[新-重3] R1 N3 残課題への対応）。
- **フラグが `clearSearch` の影響を受けないことの保証**: `hasSearchedRef` / `hadAnyInputRef` は ref であり state ではない。`clearSearch()` の現実装は `setQueryState("")` / `setResults([])` / debounce timer クリアのみで ref には触れない。本サイクルでも `clearSearch` は変更しないため、`useEffect([isOpen, ...])` cleanup 時の `clearSearch()` 呼び出しがフラグを破壊することはない。これは SearchTrigger 直接経路（popstate / Cmd+K toggle close）でも、計測 → `setIsOpen(false)` → useEffect cleanup の `clearSearch()` の順序になっても、計測時点でフラグが正しい値を保持していることを構造的に保証する。

#### `had_query` の確定定義と clearSearch 順序問題

実態確認（`SearchModal.tsx` L42-49 の `handleClose`）の結果、`clearSearch()` が `onClose(reason)` より前に呼ばれており、`clearSearch` は `setQueryState("")` を実行する（`useSearch.ts` L149-155）。このため、close 時に `query` を直接読んで abandoned 判定をすると常に空文字になってしまう。

- **採用案 B（採用）: `useSearch` 側に `hadAnyInputRef` を立てて「モーダル開〜閉までに 1 文字でも入力されたか」を二値で記録する**
  - フラグ立ては `useSearch.setQuery(q)` 内、`q.length > 0` の場合に `hadAnyInputRef.current = true` を立てる（`q.trim().length` ではなく `q.length` で判定し、空白のみの入力も「入力痕跡あり」としてカウントする）。
  - **`q.length` 判定の挙動仕様（[新-軽4] 確定）**: 「スペース 5 文字だけ入力 → 閉じる」のような **空白のみ入力 → 閉じる** ケースは、`trackSearch` の発火条件が `q.trim()` 非空のため `search` イベントは発火せず、`hadAnyInputRef.current = true` で `had_query=true` の `search_abandoned` が発火する。これは「入力欄に触ったが検索意図を確定させずに離脱した」シグナルとして再判断時に有用（IME 確定前の文字や、間違って入力した空白も同列に扱う）。`q.trim().length` で判定すると「キーボード操作したが何も検索しなかった」と「画面を眺めただけ」が同じ `had_query=false` に潰れてしまうため、`q.length` 判定の方が分析価値が高い。
  - フラグはモーダル open 時にリセットする（上記 `resetTracking()` で `hasSearchedRef` と同じタイミングで両方初期化）。
  - `getHadAnyInput()` を `useSearch` の戻り値経由で公開し、`SearchModal.handleClose` および ref 経由計測メソッド内で `trackSearchAbandoned({ had_query: getHadAnyInput() })` として読む。
  - これにより `clearSearch()` の呼び出し順序に依存せずに `had_query` を確定できる（ref は state でないので `clearSearch` の影響を受けない）。
- **不採用案 A: `handleClose` 内で `clearSearch` 呼び出し前に query を退避してイベント発火を完結させる**
  - 却下理由: 順序依存の保守性が悪く、将来 `handleClose` のリファクタで意図せず壊れるリスクがある。Ref ベースの記録（採用案 B）の方が頑健。
- **不採用案 C: `q.trim().length > 0` で判定する**
  - 却下理由: 上記「`q.length` 判定の挙動仕様」のとおり、空白のみ入力を `had_query=false` に潰すと再判断時の分析粒度が落ちる。

**`handleClose` 内の発火順序（明示）** — 4 経路（cancel/ESC、バックドロップ click、✕ ボタン、Enter または click による navigation）に適用:

1. `getHasSearched()` を読み、abandoned 判定を行う。
2. `trackSearchModalClose({ close_reason })` を発火。
3. abandoned の場合は `trackSearchAbandoned({ had_query: getHadAnyInput() })` を発火。
4. その後で `clearSearch()` を呼び `onClose(reason)` を呼ぶ（既存順序を維持）。

**SearchTrigger 直接経路（popstate / Cmd+K toggle close）の発火順序** — 上記「popstate 経路と Cmd+K toggle close 経路の発火統一について」セクション末尾の 5 ステップを参照。要点は「ref 経由計測メソッド呼び出し（中身は handleClose 経路の 1〜3 と同じ） → `setIsOpen(false)` → `useEffect` cleanup で `clearSearch()`」の順序。ref はこの順序で破壊されないことが保証されている。

##### 「数文字打って閉じた」の境界（質問の明確化）

`docs/research/2026-04-30-site-search-usage-analysis.md` で確認したとおり、`trackSearch` は 150ms デバウンスのため「数文字打ってすぐ閉じた（150ms 経過前）」場合は **`search` イベントは発火していない** ＝ abandoned として扱う。この場合 `had_query=true`（入力痕跡あり）となる。

- 「150ms を超えて入力後に閉じた」場合は `search` 発火済み＝ abandoned ではない。
- 「全く入力せず閉じた」場合は `had_query=false` で abandoned。
- 「1 文字入力 → 全削除 → 閉じる」場合は `hadAnyInputRef` が立つため `had_query=true` で abandoned（採用案 B の定義に従う）。再判断（B-339）時に「入力したが思い直してやめた」を「最初から検索する気がなかった」と区別したい場合に有効。

再判断（B-339）時には「`search` 発火セッションのうち `search_result_click` が無いセッション」を別途集計することで、「検索したが結果に満足せず離脱した」を分析できる。`search_abandoned` イベントは「そもそも `search` 行動まで到達しなかったセッション」を分析対象とするためのものと整理する。

#### migration plan Phase 5 との整合（将来の二重発火防止）

`docs/design-migration-plan.md` Phase 5.1 は「既存の検索ロジック（Fuse.js、`/search-index.json` の fetch、結果整形、GA4 計測）を `src/lib/search/` 配下に切り出して新旧で共有する」と明記されている。本サイクルで増やす発火点が、Phase 5 の view 層再実装時に二重発火点を生まない設計にしておく必要がある。

**ロジック層（`useSearch`）に集約する発火**:

- `trackSearch` 既存発火（変更なし）
- `getHasSearched()` / `getHadAnyInput()` / `resetTracking()` のフラグ管理（`useSearch` 内部に閉じる。両 ref は `clearSearch` の影響を受けず、`resetTracking` のみがリセット責務を持つ）

**view 層に置く発火（`SearchModal` / `SearchTrigger`）**:

- `trackSearchModalOpen`（open 経路は view が知っている責務）
- `trackSearchModalClose`（close 経路の種別は view が知っている責務）
- `trackSearchResultClick`（クリック・Enter は view が知っている責務）
- `trackSearchAbandoned`（close 時に `useSearch` のフラグを参照して view が判定）

Phase 5 の view 再実装時は、新 view が同じ `useSearch` を呼び、view 層の発火点 4 種を新 view 内に再実装する。ロジック層は共有されるため `trackSearch` の二重発火は構造的に発生しない。view 層 4 種は新旧 view が同時に存在する期間が無い（`(legacy)/` ↔ `(new)/` のいずれか一方のみが各ページで動作）ため二重発火は起きない。本セクションを残すことで Phase 5 担当エージェントが移行時に「どこに発火点があるか」を一目で把握できる。

#### PII 配慮

- `search_term` は trim のみ（既存 `trackSearch` と同等）。トリム以外の正規化や匿名化は行わない（既存と挙動を揃え、再判断時の比較可能性を確保する）。
- `result_url` はサイト内パス（`/path/...`）のみを送信する。実態確認（`src/lib/search/build-index.ts` を Read）の結果、`SearchDocument.url` は `/tools/${slug}` / `/play/${slug}` / `/cheatsheets/${slug}` / `/dictionary/...` / `/blog/...` 等のサイト内パスのみで生成されており、外部 URL は構造的に混入し得ない。それでも送信前に `new URL(url, location.origin)` でパース → `.pathname + .search + .hash` のみ抽出する防御的実装を入れる（将来インデックス生成側に変更が入った場合の安全弁）。
- 追加するイベントは「クエリ文字列が PII を含む可能性」について、現状の `search` イベントと同等のリスクプロファイルに留まる（新たなリスク増は無い）ことを明記する。

#### 既存 `trackSearch` への影響

- 引数・戻り値・呼び出しタイミングを変更しない。
- `useSearch` 内部の発火点（`performSearch` の中）も変更しない。
- 「`search` 発火フラグ」を追加で観測する手段を `useSearch` に追加するのみとする（既存の挙動には副作用を与えない）。

#### イベント命名の一貫性チェック

- 既存: `search` / `level_start` / `level_end` / `unlock_achievement` / `share` / `content_rating`
- 新規: `search_modal_open` / `search_modal_close` / `search_result_click` / `search_abandoned`
- 規則: snake_case で統一。関連イベントは前置詞でグルーピング（既存の "level\_" 系と同様に "search\_" 系を新設）。本サイクルの新規 4 種はこの規則に準拠している。

#### テスト方針

- 単体テスト（`src/lib/__tests__/analytics.test.ts`）: 既存 `trackSearch` のテスト構造（gtag stub → 関数呼出 → 引数検証 / SSR と gtag 未定義での no-op 検証）に揃える。
- 統合テスト（`src/components/search/__tests__/SearchModal.test.tsx`）: 既存 `HTMLDialogElement.showModal` モック構造をそのまま活用し、`window.gtag` を stub して以下のシナリオでイベント順序を assert する。
  - 開→閉（未入力）/ 開→入力→閉 / 開→空白のみ入力→閉 / 開→検索完了→閉 / 開→結果クリック / 開→Enter / ESC・バックドロップ・✕ それぞれの `close_reason` 検証。
- 統合テスト（`src/components/search/__tests__/SearchTrigger.test.tsx`、既存ファイル — 実態確認済み）: `window.gtag` を stub して、SearchModal 単独では検証できない以下の経路を検証する。
  - Cmd+K toggle close で `close_reason: "cmd_k"` の `search_modal_close` が発火する。
  - popstate（`window.dispatchEvent(new PopStateEvent("popstate"))` または history.back シミュレーション）で `close_reason: "popstate"` の `search_modal_close` が発火する。
  - 上記いずれも、計測呼び出しが `setIsOpen(false)` の前に行われていること（ref は計測時点で正しい値を保持していること）を、未検索状態で開いて閉じた場合に `search_abandoned` が同 tick で発火することによって検証する。
- jsdom の限界（AP-I09: layout / CSS / production 由来のバグは jsdom で検出不能）を踏まえ、本サイクルの計測ロジックは「DOM の見た目」ではなく「関数呼び出しの有無・順序」を検証するため jsdom で十分。Playwright での視覚検証は本サイクルでは不要。

#### ドキュメント・backlog の更新（要点）

- `docs/research/2026-04-30-site-search-usage-analysis.md` の末尾に「§ 計測強化の実装記録」セクションを追加し、実装イベント名・**GA4 初観測日（= 30 日タイマー起点）**・推奨再評価日を記録する（具体手順は「実施する作業 §5」参照）。
- `docs/backlog.md` の B-339 Notes に GA4 初観測日と推奨再評価日（起点 +30 日以上）を明記する。
- `docs/backlog.md` の B-340 を Done に遷移させる。

### 検討した他の選択肢と判断理由

#### 「検索なし離脱」の判定方法

- **案 A: モーダル開時刻を保持し、close 時に経過時間で判定**
  - 短時間で閉じた=実行せず離脱と推定。
  - 却下理由: 「短時間でも入力した／結果を眺めた」と「何もせず閉じた」を区別できない。判定が時間しきい値依存になり恣意的。
- **案 B（採用）: `search` 発火フラグをモーダルスコープで保持**
  - 「検索行動を起こしたか」を二値で確実に判定可能。150ms 未満の入力で閉じた場合も `had_query` で識別できる。
- **案 C: GA4 側で `search_modal_open` と `search` の有無を後付け分析**
  - 実装は最小だが、abandoned セッション数を取り出すのに毎回 funnel 設定が必要で再判断時のコストが高い。実装コスト vs 分析コストのトレードオフで採用案 B より劣る。

#### `search_modal_close` と `search_abandoned` の関係

- **案 A: `search_modal_close` の `close_reason` 値に "abandoned" を含める**
  - イベント数を増やさず一元管理できる。
  - 却下理由: `close_reason` の 6 値（escape / backdrop / close_button / popstate / navigation / cmd_k）と abandoned は直交軸（abandoned はクローズ経路のサブ概念ではなく「検索行動の有無」軸）。混在させると分析時に「ESC で閉じた中で abandoned だったもの」を集計しづらい。
- **案 B（採用）: `search_modal_close` は常に発火し、abandoned 該当時のみ追加で `search_abandoned` を発火する**
  - 関心の分離が保てる。GA4 側で `search_abandoned` の単純カウントで abandoned セッション数が分かり、`search_modal_close` のカウントで全閉鎖数が分かり、`close_reason` × `search_abandoned` のクロスで「どの閉じ方で abandoned が多いか」も分析可能。
  - cycle-172 で確定したスコープ「4 種のイベント」とも一致する。

#### `search_term` の長さ上限・サニタイズ

- **案 A: 100 文字で truncate、URL/メアド/数字列を mask**
  - PII 流出リスクを下げる。
  - 却下理由: 既存 `trackSearch` がそれをやっていない。本サイクルで追加実装側だけ強化すると「同じクエリが `search` と `search_result_click` で異なる文字列で記録される」状況が生まれ、再判断時のセッション内マッチングが破綻する。PII 強化は別タスクで `trackSearch` と一緒に実施すべき。
- **採用: 既存 `trackSearch` と同じく trim のみ**
  - 一貫性を最優先。PII 強化が必要なら別 backlog として起票する余地を残す（本サイクルではスコープクリープ防止のため起票しない）。

#### `search_result_click` の発火場所

クリック・Enter 両経路で発火する点は確定。発火点の責務分担と引数の流し方は「`search_result_click` の発火点と引数の流し方」セクションで確定済み（`SearchResults.onSelect` を `(url: string) => void` に拡張、計測責務は `SearchModal` 側に集約）。詳細は同セクション参照。

#### イベント追加のスコープ

- **案 A: 本サイクルで「search_input_focus」など補助イベントも追加**
  - 却下理由: cycle-172 で確定したスコープは 4 種（AP-P02、スコープクリープ防止）。再判断に必要十分なイベントは 4 種で揃っており、追加すれば 30 日後の判断材料は増えるが「判断不能」を脱するという目的は既に満たせる。
- **採用: 確定スコープ（4 種）に厳密に限定**

### アンチパターン照合

- **AP-P01（前提の未実測先送り）**: 本サイクルは「計測強化が必要」という cycle-172 の前提実測（90/180 日 GA4 データ）に基づく作業であり、新たな仮定は導入していない。OK。
- **AP-P02（自分の戦略を否定するデータの確認）**: 本サイクルの戦略は「データ不足を解消する」のみで、特定の方針（a/b/c）を支持していない。再判断時にバイアスを持ち込まないよう、`search_abandoned` を独立イベントとして残し中立性を確保。OK。
- **AP-P06（既存調査の参照）**: `docs/research/2026-04-30-site-search-usage-analysis.md` を起点とし、cycle-172 のキャリーオーバー文も確認済み。OK。
- **AP-P09（ゴールの読み替え）**: 本サイクルのゴールは「来訪者価値最大化のための判断材料を取得可能にする」であり、SEO や運営者都合に読み替えていない。OK。
- **AP-I02（場当たり的回避）**: `useSearch` への「search 発火フラグ」追加は、既存 `trackSearch` の発火条件と同じ判定で立てるため、別ロジックの二重実装にならない。OK。
- **AP-I09（jsdom の限界）**: 本サイクルの追加機能は CSS/layout/production 由来ではないため、jsdom + Vitest で十分検証可能。Playwright は本サイクルでは不要と判断。OK。

### 計画にあたって参考にした情報

- `docs/research/2026-04-30-site-search-usage-analysis.md`（判断根拠と要件、特に §7 再判断条件・質的閾値）
- `docs/cycles/cycle-172.md`（保留判定とキャリーオーバー）
- `docs/backlog.md` B-339 / B-340（前提条件と着手条件）
- `src/lib/analytics.ts`（既存イベント実装の規約）
- `src/components/search/SearchModal.tsx` / `SearchTrigger.tsx` / `useSearch.ts` / `SearchResults.tsx`（既存挙動と発火点）
- `src/lib/__tests__/analytics.test.ts` / `src/components/search/__tests__/SearchModal.test.tsx`（既存テスト構造）
- `docs/anti-patterns/planning.md` / `docs/anti-patterns/implementation.md`（AP-P01/P02/P06/P09、AP-I02/I09 を確認）
- GA4 イベント命名規約（snake_case、`recommended events` への準拠と独自イベントの混在運用）

## レビュー結果

### 計画フェーズ（R1〜R4）

**R1（重大 4 / 軽微 6）**

- [N1] `close_reason` 値と発火経路の不整合（既存 `CloseReason` の二値では 5 経路を区別不能、popstate は handleClose を経由しない）
- [N2] `trackSearchResultClick` の引数伝達漏れ（`SearchResults.onSelect` が URL/query を伝えない）
- [N3] `had_query` 取得タイミングと `clearSearch` 順序問題、フラグリセット責務未確定
- [N4] 30 日タイマー起点が一意でない
- [m1] `< 150ms` 境界テスト未列挙
- [m2] `result_url` のサイト内パス限定根拠の実態確認弱
- [m3] 既存 analytics テストの破壊範囲記述が逆
- [m4] migration plan Phase 5 との将来衝突未記述
- [m5] 完成の定義 6 を 3 項目に分割
- [m6] テンプレ整合（指摘なし）
- 全項目対応。pass せず R2 へ。

**R2（重大 3 / 軽微 4）**

- [新-重1] Cmd+K toggle close 経路が計画から脱落（実態は閉鎖経路 6 つ）
- [新-重2] popstate 経路の ref 経由 close handler の API 契約未定義
- [新-重3] `useEffect` cleanup と計測発火順序、フラグリセット責務の整合
- [新-軽1〜4] 派生整合性問題
- 全項目対応。pass せず R3 へ。

**R3（軽微 3）**

- [R3-軽1] Cmd+K toggle close の確定パターン未明示 → パターン A 採用
- [R3-軽2] popstate 経路での `closedByPopState = true` との順序未明示 → 4 ステップ確定
- [R3-軽3] SearchModal の ref 公開方式未明示 → React 19.2.4 確認の上 props 経由を採用
- 全項目対応。pass せず R4 へ。

**R4: pass**（R3 軽微 3 件すべてクローズ確認、新規指摘なし）

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

## 補足事項

- 本サイクルは B-340 のみで、B-339（再判断）の着手は 30 日以上のデータ蓄積後となる。本サイクル完了後、推奨再評価日を backlog の B-339 に記載する。
- 計測強化のスコープは cycle-172 で確定済み（`docs/research/2026-04-30-site-search-usage-analysis.md` 参照）。新たな計測項目を本サイクル内で追加することはしない（スコープクリープ防止）。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
