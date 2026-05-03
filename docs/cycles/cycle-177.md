---
id: 177
description: "ダッシュボード機能フェーズ1（B-309）の継続。cycle-175 / cycle-176 の連続事故認定により UI/UX 層（C 分類: Tile / TileGrid / ToolboxShell / AddTileModal）は cycle-176 開始前状態へ復元済み。基盤層（A 分類: registry codegen 拡張 / TileDefinition slug ベース lazy loader / scroll-lock MobileNav 移行 / useToolboxConfig SSR throw / storage 整合性救済）は再利用可能な形で保持されている。本サイクルでは cycle-176 PM の派生規則化（揺れアニメ不採用 / アニメ最小限）と誤った結びつけ（iOS ジグル批評 / M1b dislikes との接続）を継承せず、DESIGN.md §4 サブセクションの沈黙領域（アニメーション採否）を独立 UI/UX 調査からやり直す。計画書前提セクション・観点リストを cycle-176 から継承せず再構築する。"
started_at: "2026-05-03T21:26:15+0900"
completed_at: null
---

# サイクル-177

ダッシュボード機能フェーズ1（B-309 / docs/design-migration-plan.md Phase 2）の継続を行う。cycle-175 / cycle-176 の連続事故を踏まえ、UI/UX 層をゼロベースで再設計し、来訪者にとって本当に役立つ道具箱としての公開可能な状態を目指す。

## 実施する作業

### A 群: 前提整理（独立検証）

- [ ] A-1. cycle-176 計画書 L70-110 の前提 14 項目を原典（DESIGN.md / docs/targets/ / docs/design-migration-plan.md / docs/research/）と突き合わせて (a)/(b)/(c) に分類した結果を、本計画書「前提として固定する設計判断（cycle-177 独立検証版）」セクションの内容と齟齬がないことを PM が読み合わせて確認する。
- [ ] A-2. B 分類資産（`tmp/cycle-176-review-criteria.md` / `tmp/cycle-176-d2-instruction.md` / `tmp/cycle-176-reviewer-prompt-template.md` / `tmp/cycle-176-bundle-baseline.md`）を Read で内容確認し、**B 分類資産の構造流用方針（観点リスト構造の流用 + 観点 12 派生規則部分の除外）を `tmp/cycle-177-meta-review.md` に PM 名で確認記録する**（「ゼロ再起草」選択肢は「検討した他の選択肢」セクションで既に不採用理由付きで結論済みのため、ここでは再判断しない）。**さらに、B 分類観点リスト 14 観点を D-1 観点リストの 22 項目（v4 で確定、本計画書 D 群実施計画参照）にどうマッピングするか（流用 / 改変 / 除外 / 新規追加）の対応表を同 `tmp/cycle-177-meta-review.md` に作成する**。D-1 起草（D-1 タスク）はこの対応表完成に依存する。
- [ ] A-3. A 分類成果物（`src/lib/toolbox/{types,registry,tile-loader,storage,useToolboxConfig,initial-default-layout,FallbackTile}.ts(x)` および `src/lib/scroll-lock.ts` / `scripts/generate-toolbox-registry.ts`）を Read して、cycle-177 の C 群実装が依拠する公開 API・契約（`getAllTileables` / `getTileableBySlug` / `getTileComponent` / `TileComponentProps` / `useToolboxConfig` / `loadConfig` / `saveConfig` / `repairTiles` / `acquireScrollLock` / `releaseScrollLock` / `INITIAL_DEFAULT_LAYOUT`）が現存することを確認する。
- [ ] A-4. **前提と原典の整合性メタチェックを独立 reviewer エージェントに依頼する**。reviewer の専任タスクは以下: 「計画書の前提セクション・検討した他の選択肢セクションの各項目について、引用元（DESIGN.md / docs/research / docs/targets / docs/design-migration-plan.md / cycle-175 / cycle-176）を Read で実体確認し、(a) 引用文言が原典と一致するか、(b) 論理的接続が成立するか、(c) cycle-176 PM の派生規則化または誤った結びつけが混入していないかを独立判断する」。**事前資料**: B-1 / B-2 で作成した `tmp/cycle-177-design-section-4-review.md`（§4 一次情報固定）を reviewer に渡す。reviewer は §4 一次情報固定を参照しつつ計画書全体メタチェックを行う（B-2 照合メモ = §4 一次情報固定、A-4 メタレビュー = 計画書全体）。**追加判定事項**: 「§4 本文と矛盾しない範囲の静的視覚補助（削除ボタン / ↑↓ボタン / 背景の薄い変化）」が実際に §4 本文と矛盾しないかを reviewer が独立判定する。**研究レポートとの突き合わせ**: D-1 観点リスト（v4 で WCAG 達成基準カバレッジを SC 2.4.3 / SC 3.2.1 まで再点検済み）と研究レポート §4-1 表（`docs/research/2026-05-03-customizable-dashboard-ux-best-practices-synthesis.md`）の WCAG 達成基準カバレッジが整合しているか reviewer が確認する。reviewer は結果を `tmp/cycle-177-meta-review.md` に直接書く。PM は reviewer 結果を読み、計画書修正が必要な箇所を特定する（PM 単独チェックではない、AP-WF08 で禁止される「自分が書いたものを自分でレビューする構造」を避ける）。実施タイミング: 計画書 v4 完成後、cycle-execution 着手前。AP-WF11（PM 自身の通読確認）も並行して実施するが、独立 reviewer の判断が一次情報。

### B 群: DESIGN.md §4 沈黙領域の独立判断

- [ ] B-1. DESIGN.md §4 サブセクション（L69-78）を Read で全文確認し、§4 が **明示している規定** と **沈黙している領域**（アニメーション採否・transition・モード遷移時の視覚フィードバック）を分離した照合メモを `tmp/cycle-177-design-section-4-review.md` に作成する（cycle-176 PM の派生規則「揺れアニメ不採用 / アニメ最小限」を §4 規約として呼ぶ過ちを再発させないための一次情報固定）。
- [ ] B-2. 沈黙領域（編集モード進入時の視覚フィードバック / 並び替え中の transition / Edit↔Done 切替時の遷移演出）について、本サイクルでは沈黙領域に派生規則を作らず、Phase 2 検証ルートでは **§4 本文（L69-78）に書かれている視覚要素のみを使う**。§4 が沈黙している揺れアニメは **DESIGN.md §4 改定独立タスク（B-357）と B-356 揺れアニメ採否独立調査の双方が完了するまで本サイクルでは取り扱わない**（builder にも委ねない）。採用する視覚要素は §4 本文 L69-78 が許可する以下のみ: (a) ドラッグ中の `box-shadow: var(--shadow-dragging)`、(b) 編集モードのアクセント色（`--accent` 系トークン、§4 L74 で許可）、(c) ドラッグハンドルの `grab` / `grabbing` カーソル（§4 L75）、(d) 編集モード中タイル本体クリック禁止の `pointer-events: none`（§4 L76）。これに加えて §4 本文と矛盾しない範囲の静的視覚補助（削除ボタン表示、↑↓ボタン表示、背景の薄い変化）は §4 が禁止していない領域として実装可（§4 と矛盾しないかの最終判定は A-4 メタチェック reviewer に委ねる）。照合メモ `tmp/cycle-177-design-section-4-review.md` は A-4 reviewer の事前資料として参照されることを想定する。
- [ ] B-3. B-2 の結論に基づき、観点リスト（後述 D-1）で「§4 本文（L69-78）に書かれている視覚要素のみを使っているか」観点を立てる。揺れアニメ採否・transition・モード遷移演出は §4 本文に書かれていないため本サイクル観点に含めない（採否判断は B-356 + B-357 で別サイクル化）。

### C 群: UI/UX 層の構築（builder 1 タスク = 1 サブエージェント）

- [ ] C-1. Tile コンテナコンポーネント（FallbackTile を内包する Tile コンテナ）を実装する。**Phase 2 スコープでは tile-loader.ts の契約により全 slug が FallbackTile を返すため（前提 A-FallbackTile スコープ参照）、C-1 のスコープは FallbackTile を内包する Tile コンテナの状態管理 + 表示構造 + メタ情報の周辺表示のみ**。**メタ情報の取得経路**: Tile コンテナが `getTileableBySlug(slug)` を呼んで `Tileable` から `displayName` / `shortDescription` / `icon` / `accentColor` を取得し、FallbackTile の周囲に表示する（FallbackTile.tsx 自体は現状維持で slug 表示のみ）。スコープ: 状態（通常 / 編集中 / ドラッグ中 / 空きスロット）、サイズ規約（small/medium/large、`INITIAL_DEFAULT_LAYOUT` の size 値と整合）、§4 本文規定（DESIGN.md L69-78）の遵守、タップターゲット 44px 以上、`getTileComponent(slug)` 経由のコンポーネント解決、`isEditing` プロップ受領。**使用モード時のタイル本体クリック挙動**: `Tileable.href` が存在する場合は href 遷移（Phase 2 では FallbackTile しか出ないため、遷移先はツール詳細ページ既存実装）、存在しない場合は `currentTarget` フォーカス + `aria-disabled` 表示。Phase 7 でタイル内実機能が追加されたら各 Tile が `onClick` を override する。**FallbackTile が表示するメタ情報の優先度原則**: `displayName` を主、`shortDescription` は補助以下とする（Phase 7 で各タイル本体が実装されたときに M1a「説明より入力欄が先」原則を継承させるための表示優先度の規約）。道具本体の機能（入力欄・計算ロジック等）は本サイクルでは実装しない（Phase 7 / B-314 で扱う）。
- [ ] C-2. TileGrid コンポーネントを実装する。`@dnd-kit/core` + `@dnd-kit/sortable` で並び替え、`sortableKeyboardCoordinates` でキーボード代替、状態の受け渡し境界（render props / context）を含む。モバイル w360 でファーストビュー 8 タイル以上が成立する密度（前提として独立採用）。`aria-live` でドラッグ完了通知。**WCAG SC 2.5.7 単一ポインター代替**: 採用は **方式 α（編集モード時に各タイル隅に「↑」「↓」ボタンを常時表示）**。理由: (1) 視覚的に「並び替えられる」アフォーダンスが明確、(2) タップで完結、(3) `aria-label` で a11y 対応容易、(4) フォーカス時のみ表示する方式 β よりタイル密度との衝突予測が容易、(5) キーボード代替のみの方式 γ では単一ポインター代替を満たさない。ボタンサイズは WCAG SC 2.5.8 に従い 24px 以上、推奨 44px。**完了条件**: 「w360 small タイル編集モードで全ボタン（ドラッグハンドル / 削除 / ↑ / ↓）が視認可能 + タップ可能」を含める。**密度衝突時の優先順位**: (1) 密度を維持（前提 B-密度 = w360 で 8 タイル以上を満たす）、(2) ボタンサイズを WCAG SC 2.5.8 最低（24px）まで下げる、(3) それでも収まらない場合は方式 β（フォーカス時オーバーレイ）に切り替えて再評価する。**(3) への切り替え判断は builder ではなく PM の判断を経る**（builder は (3) 該当時に PM へ判断材料を返し、PM が reviewer 判断材料として渡してから決定）。
- [ ] C-3. ToolboxShell コンポーネントを実装する。Edit / Done モード分離（`aria-pressed` で状態通知）、Edit ボタン 1 タップで即遷移、削除時の Undo バナー（**8 秒以上 15 秒以下** の範囲で builder が選択、確認ダイアログなし）、操作排他（編集中はタイル本体クリック無効、使用中は並び替え無効）、`useToolboxConfig` フック経由の状態管理を含む。`dynamic({ ssr: false })` 配置を使用側で強制（B-4 SSR throw を尊重）。
- [ ] C-4. AddTileModal コンポーネントを実装する。`getAllTileables()` 経由で tools / play / cheatsheets を一覧化、検索 / 絞り込みは M1a/M1b dislikes（targets/\*.yaml）と矛盾しない範囲、絵文字を使わずに Lucide スタイルの線画アイコンのみ使用（DESIGN.md §3 L51-58）、trustLevel の表示、追加ボタンのタップターゲット 44px 以上。**M1a「説明より入力欄が先」原則**: 候補リストは `displayName` + アイコン中心、`shortDescription` は補助。説明テキストでタイル全体を埋めない。
- [ ] C-5. 検証ルート `/toolbox-preview` を構築する。Header / Footer 共有（既存 `(new)/layout.tsx`）、`metadata.robots: { index: false, follow: false }` で noindex + nofollow、サイト動線（Header / Footer のリンク）には追加しない。**`nofollow` 設定意図**: 検証ルート内のリンク（`Tileable.href` 経由でツール詳細ページへの遷移リンクが発生する可能性）をクローラーが辿らないようにするため。`index: false` のみでは内部リンクのクロール抑止が不十分（Google は noindex ページ内のリンクを通常クロール対象とする挙動を取りうる）。**SSR 設計**: SSR 段階では「道具箱を読み込み中」の skeleton（静的 HTML）+ meta タイトルのみを出力し、Layout Shift を最小化する。CSR 後に ToolboxShell が hydrate され、FallbackTile が表示される。ToolboxShell は `dynamic({ ssr: false })` で配置し、tile-loader.ts の `ssr: false` 契約と整合させる。初回 SSR で `INITIAL_DEFAULT_LAYOUT` の構造を見せる必要はない（Phase 2 完了基準には含まれない）。**URL = `/toolbox-preview` を採用する独立判断根拠**: (1) noindex / nofollow / hidden URL の用途を URL 名から推測しにくく、来訪者の偶発到達を最小化する、(2) Phase 9.2 で `/` への切替時に URL 撤去を行う前提で命名（toolbox-preview = Phase 2 期間限定）、(3) 既存の `/storybook` セクションと用途が異なるため別ルートとする、(4) sitemap / robots.txt / Header / Footer 動線に追加しない方針と整合。cycle-176 で同名ルートが構想されていた事実は参考情報として記載するが、独立判断の根拠としない。
- [ ] C-6. `/storybook` セクションへの追加（Tile / TileGrid / ToolboxShell / AddTileModal の状態網羅）。**bundle-budget の対象を分離する**: (a) **共通バンドル（rootMainFiles + polyfillFiles）**: cycle-176 ベースライン（共通バンドル 157.0 KB gzip / 511.0 KB raw、`tmp/cycle-176-bundle-baseline.md` 参照）を **override しない**。(b) **`/toolbox-preview` ルート固有バンドル**: 上限なし、ただし「過度に重くしない」という定性目標。具体上限は本サイクルでは設定せず、計測値を `tmp/cycle-177-bundle-baseline.md` に記録して Phase 7 着手時の参照値とする。ToolboxShell は `dynamic({ ssr: false })` で遅延ロードされるため、ルート固有バンドルへの影響が中心。状態網羅で共通バンドル上限を超える場合はコンポーネント分割 / 遅延ロード / セクション分割で対応する（cycle-175 失敗経路の回避）。

### D 群: 視覚検証 + 来訪者目線評価

- [ ] D-1. 観点リスト `tmp/cycle-177-review-criteria.md` を起草する。観点ごとに検証手段（視覚 / 機能 / 両方）を明記し、原典（DESIGN.md L番号 / targets ファイルパス + フィールド名 / 研究レポートパス + 該当ページ）への引用元を観点ごとに付ける。「§4 本文規定（L69-78）の遵守」観点と「§4 本文に書かれている視覚要素のみを使っているか」観点を別立てする（B-3 の結論を反映）。M1a / M1b の dislikes 各項を targets/\*.yaml から直接引用して観点化する。**着手依存**: A-2 で PM が作成する B 分類観点 → D-1 観点マッピング表（`tmp/cycle-177-meta-review.md`）の完成を着手条件とする。
- [ ] D-2. Playwright で `/toolbox-preview` を w360 / w768 / w1280 のライト / ダーク両モードで撮影する。撮影状態として：通常モード初期 / 編集モード入り直後 / ドラッグ中 / 削除直後（Undo バナー表示中）/ Undo 適用後 / Undo 期間経過後 / AddTileModal 開閉。撮影画像は `tmp/cycle-177-screenshots/` に保存する。
- [ ] D-3. D-2 撮影画像と機能観点（Playwright シナリオ / 手動操作）を D-1 観点リストで通し評価する。観点ごとに合否を `tmp/cycle-177-review-result.md` に文書化する。合否未文書化は完了不可。
- [ ] D-4. 観点不適合があれば C 群へ差し戻す。reviewer 依頼テンプレート（`tmp/cycle-177-reviewer-prompt.md`）に観点リストファイルの絶対パスを含める。

### E 群: 最終確認

- [ ] E-1. `npm run lint && npm run format:check && npm run test && npm run build` の全成功を確認する。
- [ ] E-2. design-migration-plan.md Phase 2 完了基準（URL 確定 / メタ型確定 / 1 対多サポート確定 / タイル対応インタフェース / 基盤コードと検証用環境で動作 / 来訪者向け公開はしない）の各項目が cycle-177 成果物で満たされていることを点検し、`tmp/cycle-177-phase2-completion-check.md` に対応関係を文書化する。
- [ ] E-3. 検証ルート `/toolbox-preview` が noindex かつ sitemap 非含、robots.txt 非追加、Header / Footer 動線非追加であることを `grep` / `Read` で実体確認する。
- [ ] E-4. キャリーオーバーと申し送り（Phase 9.1 B-312 / Phase 9.2 B-336）を整理する。本サイクルで使う検証用「初期デフォルトプリセット」は B-312 で再設計される暫定であることを明記する。

## 作業計画

### 目的

design-migration-plan.md Phase 2「道具箱の基盤実装（来訪者向け非公開）」を完了させる。直接の受益者は以下の二者である（targets/\*.yaml から原文引用）。サブターゲット 3 件（S 系: AI 日記読み物 / エンジニア系 2 件）は道具箱機能の主対象ではないため本サイクルでは観点化しない。

- **M1a「特定の作業に使えるツールをさっと探している人」** — likes / dislikes は targets/\*.yaml 参照。
- **M1b「気に入った道具を繰り返し使っている人」** — likes / dislikes は targets/\*.yaml 参照。

#### Phase 2 で達成する範囲（本サイクル到達点）

本サイクル cycle-177 は **「カスタマイズ操作の動作確認」と「Phase 7 への基盤の橋渡し」** に範囲を正直に限定する。

- **Phase 2 完了基準の全項目を検証ルート `/toolbox-preview` で示せる状態**: URL 確定 / メタ型確定 / 1 対多サポート確定 / タイル対応インタフェース / 基盤コードと検証用環境で動作 / 来訪者向け公開はしない。
- **A 分類基盤層（registry codegen / tile-loader / scroll-lock / useToolboxConfig SSR throw / storage repairTiles）の上に、UI/UX 層（Tile / TileGrid / ToolboxShell / AddTileModal）が cycle-176 PM の派生規則を継承せずに構築されている状態**。
- **タイルの並び・追加・削除のカスタマイズ操作が検証ルートで動作する状態**。タイル本体は FallbackTile（slug 名と最小限の表示）で動作確認する（前提 A-FallbackTile スコープ参照）。
- 来訪者向け公開は Phase 9 で行うため、本サイクルでは行わない（検証ルートは noindex）。

#### Phase 2 で達成しない範囲（Phase 7 / B-314 で達成）

- **M1a likes「ページを開いた瞬間に入力欄が見えて、すぐ使い始められること」の完全達成**は本サイクルで実現しない。tile-loader.ts の Phase 2 契約により全タイルが FallbackTile を返すため、入力欄を持つタイル本体は実装されない。これは Phase 7（B-314）で各ツールごとにタイル実機能が実装されたときに完成する。
- **M1a dislikes「ツール冒頭に長い解説記事が挟まっていて、すぐ使えないこと」の完全回避**も同様に Phase 7 で完成する。本サイクルでは FallbackTile 表示の `displayName` 主・`shortDescription` 補助以下の優先度規約を C-1 / C-4 に固定し、Phase 7 タイル本体実装が継承する。
- **M1b の操作シーケンス安定性（Edit ボタン 1 タップ → 並び替え → Done で戻る）の動作確認は本サイクルで実施する**が、長期的な「久しぶりに開いても前回と同じ手順」の達成は localStorage 永続化基盤（A-5 完了済み）と Phase 7 タイル本体実装の組み合わせで完成する。

### 作業内容

#### 前提として固定する設計判断（cycle-177 独立検証版）

cycle-176 計画書 L70-110 の前提セクションをそのまま継承しない。各前提を原典で独立検証した結果として再構築する。

##### (A) 過去の決定を本サイクルでも維持する事項（独立検証済み）

| 識別子                                          | 内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 独立検証の根拠                                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **前提 A-URL**                                  | 道具箱の最終公開 URL = `/`（トップ）。本サイクル中の検証ルートは noindex の `/toolbox-preview` で動かす。                                                                                                                                                                                                                                                                                                                                                                                                                     | `docs/design-migration-plan.md` Phase 2.1 (L62-71) で 1.「日常の傍にある道具」コンセプトとの親和性、2. 初回到達体験最短化、3. Phase 9.2 で実切替する手順が定義されている。本サイクルで再評価しても同結論。                                                                                                                |
| **前提 A-メタ型統合**                           | Tileable 基底型（静的フィールド + adapter）を統合構造として維持する。コンポーネント参照は型に持たない。                                                                                                                                                                                                                                                                                                                                                                                                                       | `src/lib/toolbox/types.ts` で実装済み。`getAllTileables()` で tools 34 種 / play 20 種 / cheatsheets 7 種が単一型で取得できる。design-migration-plan.md Phase 2.1 メタ型構造判断の「単一構造」と整合。                                                                                                                    |
| **前提 A-1対多枠**                              | `TileLoaderOptions.variantId?` で Phase 7 の 1 対多サポート枠を確保。本サイクルでは `DEFAULT_VARIANT_ID = "default"` を全タイルに適用。                                                                                                                                                                                                                                                                                                                                                                                       | `src/lib/toolbox/tile-loader.ts` で実装済み。design-migration-plan.md Phase 2.1 (L77-80) の「1 つでも 1 対多が必要なケースがあるなら、メタ型インタフェースは枠を確保」と整合。                                                                                                                                            |
| **前提 A-自動学習禁止**                         | 自動学習・利用履歴順並び替えは採用しない。手動配置のみ。                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `docs/research/2026-05-03-toolbox-auto-learning-vs-manual-ux-research.md` で M1b dislikes（「以前と同じ入力なのに結果や挙動が前回と変わっていること」「慣れた操作手順が突然変わること」）との直接矛盾が確定済み。本サイクルでも独立確認した。                                                                             |
| **前提 A-基盤層保持**                           | A 分類基盤層（B-1〜B-5: registry codegen / tile-loader / scroll-lock / useToolboxConfig SSR throw / storage repairTiles）はそのまま再利用する。                                                                                                                                                                                                                                                                                                                                                                               | `tmp/research/2026-05-03-cycle-177-foundation.md` §1 で全ファイルの存在と公開 API が確認済み。本サイクルで C 群が依拠する基盤として維持する。                                                                                                                                                                             |
| **前提 A-FallbackTile スコープ**                | Phase 2 では tile-loader.ts の契約に従い全タイルが FallbackTile を返す。検証ルート `/toolbox-preview` で動作確認する範囲は「タイルの存在 / 並び / 追加 / 削除 / 編集モード遷移 / Undo」に限定する。道具本体の機能（入力欄・計算ロジック等）は Phase 7（B-314）まで実装しない。                                                                                                                                                                                                                                                | `tmp/research/2026-05-03-cycle-177-foundation.md` L40-41「Phase 2 では全 slug に対して FallbackTile を返す設計で、Phase 3 以降で slug ごとの動的 import に切り替える想定」/ `src/lib/toolbox/tile-loader.ts` L156-169 / `src/lib/toolbox/FallbackTile.tsx`。本サイクルでは Phase 7 範囲を達成しないことを正直に明示する。 |
| **前提 A-INITIAL_DEFAULT_LAYOUT slug 差し替え** | 現状の `INITIAL_DEFAULT_LAYOUT` は fixture-\* 暫定 slug 5 件（`fixture-small-1` / `fixture-small-2` / `fixture-medium-1` / `fixture-medium-2` / `fixture-large-1`）を持つ。検証ルートで `getTileableBySlug("fixture-small-1")` は undefined を返すため、Tile コンテナは displayName を取得できず slug 名のみのフォールバック表示になる。Phase 2 検証では実 slug（例: `age-calculator` / `password-generator` 等）に差し替えて被り検査を満たすプリセットに変更する（具体的な実 slug 選定は C-6 暫定プリセット 6-8 件で行う）。 | `src/lib/toolbox/initial-default-layout.ts` L59-67（fixture-\* slug 5 件の現状）/ `src/lib/toolbox/types.ts` の `getTileableBySlug` シグネチャ / 前提 C-暫定プリセット。                                                                                                                                                  |

##### (B) 本サイクルでの設計制約（独立判断の結果）

| 識別子                                           | 内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 独立判断の根拠                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **前提 B-モード分離**                            | 並び替え UI = 明示的な Edit / Done モード分離 + ドラッグ操作 + 単一ポインター代替（「↑」「↓」ボタン等）+ 削除時 Undo + a11y 経路。**Edit ボタンが必要となる動機**: 研究レポート §1-3「誤操作リスク」表より、明示的ボタン型は「View モードでは操作できないため誤操作が発生しない」（誤操作リスク = 低）。また §5-2 案 A 利点欄「誤操作保護が高い（View モードでは変更不可）」と整合する。M1b の利用シナリオ「気に入った道具を再カスタマイズしたい場面」の頻度は本サイクル時点では推定根拠が不十分なため、将来の利用ログで観測する別 backlog（B-355 起票時に併せて検討）として申し送る。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `docs/research/2026-05-03-customizable-dashboard-ux-best-practices-synthesis.md` §1-2 / §1-3 表 / §5-2 案 A 比較表より、誤操作リスク低・落ち着いたトーン整合・M1b 適合高を満たす唯一の案（明示的 2 モード分離型の利点 = 通常時は誤操作リスク低、Edit 時のみ並び替え）。同 §3-3 で WCAG 2.5.7 単一ポインター代替の必要性を確認。 |
| **前提 B-密度**                                  | モバイル w360 で 8 タイル以上が成立する密度。タブレット / PC では明らかに高密度（具体列数は builder 判断）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | site-concept.md「ブラウザのホームに設定して反射的に開く」想定 / `docs/research/2026-05-03-dashboard-toolbox-individual-ux-deep-dive.md`（業界相場）/ M1a likes「ページを開いた瞬間に入力欄が見えて、すぐ使い始められること」と整合。                                                                                            |
| **前提 B-Undo**                                  | 削除安全策 = Undo バナー方式（確認ダイアログなし）。**最低秒数**: 研究レポート §5-2 案 A の参考値「5 秒間 Undo バナー」を最低限とする。**具体秒数の決定**: 8 秒以上 15 秒以下の値を推奨候補（参考値）として示すが、最終秒数は **builder が来訪者目線で判断する**（M1b の誤削除リカバリーシナリオ (1) 編集中に気づく / (2) モード離脱後に気づく の両方をカバーできること、M1b の落ち着いたトーン整合（バナー長居の押しつけ感を避ける）を満たすこと、を builder 判断基準とする）。M1b dislike「慣れた操作手順が突然変わる」（操作シーケンス）を毀損しない。8 秒や 15 秒の上下限は本サイクルでは独立調査根拠を作れないため、builder 判断に委ねる（AP-P01「計画の根幹にある仮定の定量検証」違反リスクを下げる）。                                                                                                                                                                                                                                                                                                                                                                              | `docs/research/2026-05-03-customizable-dashboard-ux-best-practices-synthesis.md` §5-2 案 A 評価（参考値 5 秒）/ 同 §1-2 / NN/g「確認ダイアログは頻出すると無視される」。                                                                                                                                                        |
| **前提 B-単一削除**                              | 本サイクルでは単一削除のみ。複数選択削除は Phase 2 範囲外。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Phase 2 完了基準（URL / メタ型 / 1 対多 / 動作確認）に複数削除は含まれない。Undo の単位を「直前の単一削除」に固定することで C-3 の Undo 動作を客観検証可能にする。                                                                                                                                                              |
| **前提 B-bundle-budget**                         | bundle-budget の対象を分離する。**(a) 共通バンドル（rootMainFiles + polyfillFiles）**: cycle-176 ベースライン（共通バンドル 157.0 KB gzip / 511.0 KB raw、`tmp/cycle-176-bundle-baseline.md` L41-44 参照）を **override しない**（cycle-175 で override を選んで失敗した教訓）。**(b) `/toolbox-preview` ルート固有バンドル**: 上限なし、ただし「過度に重くしない」という定性目標。具体上限は本サイクルでは設定せず、計測値を `tmp/cycle-177-bundle-baseline.md` に記録して Phase 7 着手時の参照値とする。ToolboxShell は `dynamic({ ssr: false })` で遅延ロードされるため、ルート固有バンドルへの影響が中心。共通バンドル上限超過時は実装範囲を見直す（コンポーネント分割 / 遅延ロード / storybook 状態網羅戦略の見直し）。                                                                                                                                                                                                                                                                                                                                                               | cycle-175 で「/storybook 上限を override する」を選んで失敗した教訓 / M1a likes「すぐ使い始められること」/ M1b dislike「動作が重くなること」と整合。共通バンドルとルート固有バンドルを分離することで、Phase 2 検証ルートに必要な ToolboxShell 機能の実装余地を確保しつつ、サイト全体への影響を防ぐ。                            |
| **前提 B-視覚フィードバック方針（§4 本文準拠）** | **Phase 2 検証ルートでは DESIGN.md §4 本文（L69-78）が明示している視覚要素のみを採用する**。§4 本文が許可する要素を引用列挙: (a) ドラッグ中の `box-shadow: var(--shadow-dragging)`（§4 L73）、(b) 編集モードのアクセント色（`--accent` 系トークン、§4 L74）、(c) ドラッグハンドルの `grab` / `grabbing` カーソル（§4 L75）、(d) 編集モード中タイル本体クリック禁止の `pointer-events: none`（§4 L76）。**§4 本文に書かれていない視覚要素（揺れアニメ / transition / モード遷移演出 等）は §4 改定独立タスク（B-357）と B-356 揺れアニメ採否独立調査の双方が完了するまで本サイクルでは扱わない**（builder にも委ねない）。**§4 本文と矛盾しない範囲の静的視覚補助**（削除ボタン / ↑↓ボタン / 背景の薄い変化）は §4 が禁止していない領域として実装可（A-4 メタチェック reviewer による §4 矛盾判定済みであること）。これらの組み合わせで NN/g「2 つ以上の冗長な視覚的指標」要件を満たす（研究レポート §2-2 パターン 2 / §2-7 パターン 2 ハンドル+ボタン+背景変化の組み合わせ）。`prefers-reduced-motion: reduce` 対応はドラッグ中の他要素 transition（dnd-kit デフォルト）に対して適用する。 | DESIGN.md §4 L69-78 本文（一次情報）/ `tmp/cycle-177-design-section-4-review.md`（B-1 / B-2 で作成する §4 一次情報固定メモ）/ `docs/research/2026-05-03-customizable-dashboard-ux-best-practices-synthesis.md` §2-2 / §2-7 / §3-3 NN/g。                                                                                        |
| **前提 B-§4 規約遵守**                           | DESIGN.md §4 本文（L69-78）の規定（ドラッグ中 box-shadow のみ・ドラッグ中 opacity 禁止・編集モードのアクセント色許可・grab/grabbing カーソルはハンドルのみ・編集モード中タイル本体クリック禁止に pointer-events: none）を遵守する。本文に存在しない事項（アニメーション採否など）は §4 規約として参照しない。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **前提 B-検証ルート非公開性**                    | 検証ルートは `/toolbox-preview`（または同等の hidden URL）で `metadata.robots: { index: false, follow: false }` を設定。Header / Footer 動線・sitemap・robots.txt に追加しない。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | design-migration-plan.md Phase 2 完了基準「来訪者向けの道具箱ページはまだ公開しない」と整合。Phase 9.2 で `/` への実切替時に noindex 解除する手順は cycle-176 申し送りに残されている。                                                                                                                                          |

##### (C) 本サイクル内で実施する事項

| 識別子                        | 内容                                                                                                                                                                                                                                                                                                                       | 完了条件                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **前提 C-UI/UX 層構築**       | C-1〜C-6 を実施し、検証ルートで全状態が動作する。                                                                                                                                                                                                                                                                          | C-1〜C-6 完了 + D-3 観点合否文書化。                                                         |
| **前提 C-観点リスト独立起草** | D-1 観点リストは cycle-176 PM の派生規則を継承せず再起草する。B 分類資産の構造（観点ごとの検証手段マッピング）は流用してよいが、観点 12 の「揺れアニメ不採用」は除外し、「§4 本文（L69-78）に書かれている視覚要素のみを使っているか」を観点として立てる（§4 本文に書かれていない揺れアニメ等は本サイクル観点に含めない）。 | `tmp/cycle-177-review-criteria.md` 存在 + 観点ごとの検証手段ラベル + 引用元明記。            |
| **前提 C-暫定プリセット**     | 検証用「初期デフォルトプリセット」は本サイクル限定の暫定とし、B-312 で再設計される前提で扱う。M1a dislike「似たようなツールが並んで迷わせる」を避ける機能種別の被り検査を行う。                                                                                                                                            | プリセット定義に被り検査を通過したコメントを残す。Phase 9.1 申し送りに「再設計前提」を明記。 |

#### A. 前提整理の実施計画

- A-1 / A-2 / A-3 / A-4 は **実装着手前の最終チェック**（cycle-execution の起点で実施）として位置づける。計画書本体（前提セクション）と齟齬がないことを PM 自身が読み合わせる（AP-WF11）。前提セクションの cycle-176 14 項目を機械的に転記せず、原典 Read 結果で再構築する。
- A-4 のメタチェックは **独立 reviewer エージェント**に依頼する（PM 単独チェックではない、AP-WF08「自分が書いたものを自分でレビューする構造」の回避）。reviewer 専任タスク: 「計画書の前提セクション・検討した他の選択肢セクションの各項目について、引用元（DESIGN.md / docs/research / docs/targets / docs/design-migration-plan.md / cycle-175 / cycle-176）を Read で実体確認し、(a) 引用文言が原典と一致するか、(b) 論理的接続が成立するか、(c) cycle-176 PM の派生規則化または誤った結びつけが混入していないかを独立判断する」。reviewer は結果を `tmp/cycle-177-meta-review.md` に直接書く。PM は reviewer 結果を読み、計画書修正が必要な箇所を特定する。実施タイミング: 計画書 v4 完成後、cycle-execution 着手前。AP-WF11（PM 通読）も並行で実施するが、独立 reviewer の判断が一次情報。

#### B. DESIGN.md §4 沈黙領域の独立判断の実施計画

- B-1 で §4 本文と沈黙領域を分離した照合メモを `tmp/cycle-177-design-section-4-review.md` に作成。「§4 が明示している規定」「§4 が沈黙している事項」を独立判断の出発点として固定する。本ファイルは A-4 メタチェック reviewer の事前資料として参照される（B-2 = §4 一次情報固定、A-4 = 計画書全体メタチェック の分担）。
- B-2 で本サイクルの取り扱いを判断（「検討した他の選択肢と判断理由」B-2 参照）。本サイクルでは **選択肢 X（§4 本文準拠）** を採る: §4 本文（L69-78）に書かれている視覚要素のみを Phase 2 検証ルートで使う。§4 本文に書かれていない視覚要素（揺れアニメ / transition / モード遷移演出）は §4 改定独立タスク（B-357）と B-356 揺れアニメ採否独立調査の双方が完了するまで本サイクルでは取り扱わない（builder にも委ねない）。§4 本文と矛盾しない範囲の静的視覚補助（削除ボタン / ↑↓ボタン / 背景の薄い変化）は §4 が禁止していない領域として実装可（A-4 reviewer による §4 矛盾判定済みであること）。
- B-3 で観点リストに「§4 本文（L69-78）に書かれている視覚要素のみを使っているか」を観点として立てる（D-1 観点 17）。揺れアニメ採否・transition・モード遷移演出は §4 本文に書かれていないため本サイクル観点に含めない（B-356 + B-357 の別サイクル完結後に観点化）。

#### C. UI/UX 層の構築の実施計画

- 各 C タスク = 1 builder サブエージェントで分解（CLAUDE.md「Keep task smaller」）。並列着手は B-2（slug ベース lazy loader）に依存しない C 群（C-2 の DnD / C-3 の Edit/Done モード）から。
- builder への指示は「ターゲットと提供価値」「目的」「制約」「観点」「完了条件」「注意点」のみを記述し、型シグネチャ・JSX 全文・CSS クラス全定義は記述しない（AP-WF03）。
- 制約として明記する事項（builder 指示書共通）：
  - DESIGN.md §4 本文（L69-78）の規定遵守（§4 本文をそのまま引用、派生規則を §4 と呼ばない）
  - 前提 B-視覚フィードバック方針（§4 本文準拠）: §4 本文（L69-78）に書かれている視覚要素のみを使う。§4 本文が許可しない視覚要素（揺れアニメ / transition / モード遷移演出 等）は実装しない（B-357 §4 改定独立タスク + B-356 揺れアニメ採否独立調査の双方完了まで本サイクルで取り扱わない）。§4 本文と矛盾しない範囲の静的視覚補助（削除ボタン / ↑↓ボタン / 背景の薄い変化）は実装可（A-4 reviewer による §4 矛盾判定済みであること）。
  - WCAG 2.2 SC 2.5.7（ドラッグの単一ポインター代替・本サイクルは方式 α「↑」「↓」ボタン常時表示を採用）/ SC 2.5.8（タップターゲット 24px 以上、削除ボタン 44px 以上推奨）/ SC 2.4.7（フォーカス可視）/ SC 4.1.3（aria-live でモード変化通知）/ SC 2.1.1（キーボード操作）
  - `prefers-reduced-motion: reduce` でドラッグ中 transition も瞬間化（dnd-kit `transition` プロップで制御）
  - `useToolboxConfig` の SSR throw を尊重した `dynamic({ ssr: false })` 配置
  - `getTileComponent(slug)` 経由のコンポーネント解決（基盤層 API）
  - 絵文字禁止 / Lucide 系線画アイコンのみ（DESIGN.md §3 L51-58）
  - 既存パターン（`src/play/quiz/_components/ResultExtraLoader.tsx` / `ResultCard.tsx` の slug → next/dynamic）と整合
  - FallbackTile 表示メタ情報の優先度規約: Tile / AddTileModal で `displayName` を主、`shortDescription` は補助以下（Phase 7 で各タイル本体実装が継承する規約。Phase 2 では FallbackTile しか出ないため「入力欄プレビュー」は実装範囲外）
  - Undo バナー秒数: 研究レポート §5-2 案 A の参考値「5 秒間 Undo バナー」を最低限とし、最終秒数は builder が来訪者目線で判断（推奨候補 8〜15 秒、判断基準は前提 B-Undo 参照）
- C-5 検証ルートは `/toolbox-preview` を採用（独立判断根拠は C-5 タスクに記載。cycle-176 で同名ルートが構想されていた事実は参考情報、独立判断の根拠としない）。Header / Footer は既存 `(new)/layout.tsx` を共有。SSR 段階では「道具箱を読み込み中」の skeleton（静的 HTML）+ meta タイトルのみを出力し、CSR 後に ToolboxShell が hydrate される（C-5 タスク本体参照）。
- C-6 storybook は既存 `/storybook` セクションに「Toolbox」セクションを追加。bundle-budget は対象を分離する: 共通バンドル（cycle-176 ベースライン 157.0 KB gzip / 511.0 KB raw、`tmp/cycle-176-bundle-baseline.md` L41-44 参照）を override しない（cycle-175 失敗の教訓）。`/toolbox-preview` ルート固有バンドルは上限なし（定性目標のみ）、計測値を `tmp/cycle-177-bundle-baseline.md` に記録して Phase 7 着手時の参照値とする。

#### D. 視覚検証 + 来訪者目線評価の実施計画

- D-1 観点リスト起草で B 分類観点リストの構造（検証手段マッピング）を流用しつつ、観点 12 派生規則部分を除外。観点ごとに「原典への引用元」を明記（targets/\*.yaml の dislike 文言、研究レポートの該当ページ、DESIGN.md の L番号、design-migration-plan.md Phase 2 の項目など）。
- D-1 観点リストに含める最低項目：
  1. M1a dislikes 各項（targets ファイルから直接引用）
  2. M1b dislikes 各項（targets ファイルから直接引用）
  3. モバイル w360 でのファーストビュータイル数（前提 B-密度）
  4. PC / タブレット / モバイル各 viewport の密度整合
  5. WCAG 2.5.7 単一ポインター代替（「↑」「↓」ボタン等）の機能成立
  6. WCAG 2.5.8 タップターゲット 24-44px
  7. WCAG 2.4.7 フォーカス可視
  8. WCAG 4.1.3 ステータスメッセージ（aria-live でモード変化通知）
  9. WCAG 2.1.1 キーボード操作（dnd-kit Keyboard Sensor）
  10. `prefers-reduced-motion: reduce` 時の動作（編集モード入り / ドラッグ中 transition）
  11. 操作排他（編集中タイル本体クリック無効 / 使用中並び替え無効）
  12. Undo の確定動作（Undo 期間経過後に確定 + Undo 適用で復元）
  13. 初期デフォルトプリセットに M1a dislike「似たようなツールが並んで迷わせる」が混入していない
  14. 編集モードの儀式性（編集開始までのタップ数 = 1）
  15. ライト / ダーク両モードでの視覚整合
  16. **DESIGN.md §4 本文規定（L69-78）の遵守**（§4 本文の規定のみ、派生規則は含めない）
  17. **§4 本文（L69-78）に書かれている視覚要素のみを使っているか**（§4 本文が許可していない視覚要素 = 揺れアニメ / transition / モード遷移演出 等が混入していないか）
  18. **WCAG SC 2.4.11 Focus Not Obscured (Minimum)**: 編集モード時のドラッグハンドル / 「↑」「↓」ボタンがフォーカスされたとき、Undo バナー（C-3）や AddTileModal（C-4）でフォーカス対象が隠れないこと
  19. **WCAG SC 1.4.13 Content on Hover or Focus**: 「↑」「↓」ボタンに hover ツールチップを採用しない方針を確認（採用しないことを明記する）。採用する場合は dismissible / hoverable / persistent 3 要件を満たす設計が必要となるが、本サイクルでは採用しない
  20. **WCAG SC 2.4.3 フォーカス順序 (Level A)**: 編集モード時のフォーカス順序が論理的か（タイル本体 → ドラッグハンドル → 削除 → ↑ → ↓ など、視覚順序と一致するか）
  21. **WCAG SC 3.2.1 フォーカス時 (Level A)**: フォーカス時に予期しないコンテキスト変化（モーダル自動展開・モード自動切替 等）がないか
  22. **使用モード時のタイル本体クリック挙動**: `Tileable.href` が存在する場合は href 経由で詳細ページに遷移すること（C-1 タスク参照、Phase 2 では FallbackTile しか出ないため遷移先はツール詳細ページ既存実装）
  - **観点 18（前 v2）「前提の根拠妥当性メタ観点」は A-4 メタチェック（独立 reviewer）に集約したため、D-1 観点リストからは削除**。D-1 観点 16/17 は実装側の §4 規約遵守 / §4 本文視覚要素準拠を確認する観点として維持。
  - **観点番号は 22 項目で確定**。研究レポート §4-1 表（`docs/research/2026-05-03-customizable-dashboard-ux-best-practices-synthesis.md`）の WCAG 達成基準カバレッジとの突き合わせは A-4 メタチェック reviewer に依頼する（観点リスト独立起草 D-1 完了後、A-4 reviewer が研究レポート §4-1 表との抜けがないかを判定）。
- D-2 撮影は最小限の状態網羅（通常モード初期 / 編集モード入り直後 / ドラッグ中 / 削除直後 Undo バナー / **Undo バナー表示中の編集モードフォーカス（観点 18 SC 2.4.11 検証用）** / Undo 適用後 / Undo 経過後 / AddTileModal 開閉）× viewport 3 種 × ライト / ダークの組み合わせ。
- D-3 評価は撮影画像（視覚観点）と機能観点（Playwright シナリオ / 手動操作）を分離して実施。reviewer 依頼テンプレートに観点リストの絶対パスを含める（cycle-176 PM のテンプレート構造を流用、観点ファイルパスのみ更新）。
- D-4 観点不適合があれば C 群へ差し戻す。差し戻し時は不適合観点と再現手順を builder に伝える（AP-WF06: 事実情報の事前確認）。

#### E. 最終確認の実施計画

- E-1: 全 4 コマンドが exit 0 になることを PM が直接確認する（AP-WF04）。warnings は内容を確認し本サイクル変更由来でないことを `tmp/cycle-177-lint-warnings.md` に文書化する。
- E-2: Phase 2 完了基準の各項目に対する cycle-177 成果物の対応を `tmp/cycle-177-phase2-completion-check.md` で 1 対 1 に対応付ける：
  - 「URL=`/` で確定」← 前提 A-URL（最終公開 URL は `/`、本サイクル検証ルートは noindex の `/toolbox-preview`、Phase 9.2 で実切替）
  - 「メタ型構造（統合 / 分離）が決まっている」← 前提 A-メタ型統合 + `src/lib/toolbox/types.ts`
  - 「ツールとタイルが 1 対多になり得るかが決まっている」← 前提 A-1対多枠 + `tile-loader.ts` の `variantId?`
  - 「決定に応じたタイル対応インタフェースがメタ型に入っている」← `getTileComponent()` + `TileComponentProps`
  - 「基盤コードと検証用環境で動作確認できる」← C-5 検証ルート + D-3 観点合否文書
  - 「来訪者向けの道具箱ページはまだ公開しない」← E-3 の noindex / sitemap 非含 / robots.txt 非追加 / 動線非追加の実体確認
- E-3: noindex 確認は `Read` で `src/app/(new)/toolbox-preview/page.tsx`（または同等パス）の `metadata` を確認。sitemap は `src/app/sitemap.ts` を `Read` / `grep` で対象 URL 不在を確認。**robots は `src/app/robots.ts` を `Read` し、`disallow` 配列に `/toolbox-preview` が追加されていないことを確認**（noindex メタタグで制御するため robots.txt の disallow には追加しない方針）。Header / Footer は `grep` で対象 URL の link 不在を確認。
- E-4: キャリーオーバーは以下を含む。E-4 では PM が `docs/backlog.md` への新規項目起票（B-356 / B-357）と B-336 着手条件追記を行う責務がある（cycle-execution フェーズで実施する）：
  - **新規 backlog `B-356`: 揺れアニメ採否の独立調査（番号予約済み）**: cycle-176 留意点 5 が要求する独立調査題材。Phase 2 スコープでは完結できないため、Phase 9.2（B-336）公開前までに別サイクルで以下を実施する: (1) 揺れあり / 揺れなしの両プロトタイプを実装、(2) 来訪者目線で比較、(3) `prefers-reduced-motion: reduce` 対応コストを見積もる、(4) パフォーマンス実測（多数タイル同時アニメーション時）、(5) コンセプト「日常の傍にある道具」との整合を独立判断。**着手条件**: なし（独立タスク）。**Phase 9.2（B-336）の着手前に完了している必要がある**（M1b dislike「慣れた操作手順が突然変わる」回避のため、Phase 2 公開構成と Phase 9.2 公開構成を一致させる）。E-4 で `docs/backlog.md` に B-356 として起票する。
  - **新規 backlog `B-357`: DESIGN.md §4 改定独立タスク（番号予約）**: §4 サブセクションの沈黙領域（アニメーション採否 / transition / モード遷移演出）を §4 本文に追記するか否か、追記する場合の規約文を独立判断する。実施内容: (1) 沈黙領域の追記要否を独立判断、(2) 追記する場合の規約文を起草、(3) Owner レビュー、(4) 改定後 §4 を SSoT として確定。**着手条件**: なし（独立タスク）。**Phase 9.2（B-336）の着手前に完了している必要がある**（B-357 結果次第で B-356 揺れアニメ採否の判断材料が変化する可能性があるため B-357 → B-356 の順を推奨だが、両者は独立に進められる）。E-4 で `docs/backlog.md` に B-357 として起票する。
  - **番号予約根拠**: `docs/backlog.md` を Read した結果、現状最大番号は B-355、B-356 / B-357 が次の空き番号として確保できる。
  - **B-336（Phase 9.2）の着手条件追加**: E-4 で `docs/backlog.md` の B-336 行 Notes 欄に着手条件として「**B-356 揺れアニメ採否独立調査の完了 + B-357 DESIGN.md §4 改定独立タスクの完了**」を追記する。これにより Phase 9.2 公開は規約改定経路 + 独立調査経路の二重ゲートを通過しないと不可となり、PM が独自判断で先送りできない構造を作る（既存着手条件「B-312 完了 + Phase 7（B-314）完了」に追加する形）。
  - **Phase 9.1（B-312）への申し送り**: 本サイクルの暫定プリセットを正式版として継承しない。ペルソナ別プリセット（文章を書く人向け / プログラマー向け 等）を独立に設計する。
  - **Phase 9.2（B-336）への申し送り**: cycle-176 申し送り（既存ユーザの慣れに対する移行設計 / 初期表示の同一性 / 同一 URL の意味変化への影響評価）をそのまま継承。検証ルート `/toolbox-preview` から `/` への切替手順を整備する必要がある。**B-356（揺れアニメ独立調査）+ B-357（§4 改定）の完了状態を Phase 9.2 公開前に確認する**（B-356 / B-357 結果が「揺れアニメ採用」の場合は Phase 9.2 公開前に Tile / TileGrid に揺れアニメを追加する実装サイクルが追加で必要となる）。
  - **新規 AP 追加候補（cycle-176 留意点）**: 候補 1（事故対応中の工数優先誘惑）/ 候補 2（事故対応中の公式ドキュメント汚染）の追加要否を E-4 で独立判断する。本サイクルは事故サイクルではないため候補の発生条件を満たさないが、追加判断自体は cycle-177 PM の独立判断対象。

### 検討した他の選択肢と判断理由

#### B-2 沈黙領域の取り扱い: 選択肢 X / X-old / V / Y / Z / W

- **選択肢 X（採用、v4 で確定）**: **§4 本文に書かれている視覚要素のみを Phase 2 検証ルートで使う**。§4 本文（DESIGN.md L69-78）が許可する 4 要素 (a) `box-shadow: var(--shadow-dragging)`、(b) `--accent` 系トークン、(c) `grab` / `grabbing` カーソル（ハンドルのみ）、(d) `pointer-events: none`（編集モード中タイル本体）に加え、§4 本文と矛盾しない範囲の静的視覚補助（削除ボタン / ↑↓ボタン / 背景の薄い変化）を実装する。**§4 本文に書かれていない視覚要素（揺れアニメ / transition / モード遷移演出）は §4 改定独立タスク（B-357）と B-356 揺れアニメ採否独立調査の双方が完了するまで本サイクルでは取り扱わない**（builder にも委ねない）。
  - **採用理由（cycle-176 留意点 1 が定める正規二択 = builder 委任 / 規約改定 以外の第三の道として）**:
    1. **規約準拠を根拠に立てる**: 本選択肢は「規約に書かれているもののみを使う」立て付けであり、PM の独自判断軸（「Phase 2 スコープに必要 / 不要」）を完全に排除する。cycle-176 PM が DESIGN.md §4 を派生規則化した構造（規約沈黙領域に PM 判断を入れる）と同型ではなく、規約沈黙領域は §4 改定 + B-356 の二重ゲートで処理する。
    2. **二重ゲート構造で Phase 9.2 公開前に確実に検討される**: 揺れアニメ採否は §4 改定経路（B-357）と B-356 独立調査経路の双方を通過しないと実装できない構造を E-4 で作る。PM が独自判断で先送りできない。
    3. **Phase 9.2 での切替リスクが軽減される**: Phase 2 実装と Phase 9.2 公開実装の差分は「§4 本文に書かれていない要素」に限定されるため、その差分は B-356 + B-357 二重ゲートで採否判定済みになっており、M1b dislike「慣れた操作手順が突然変わる」のリスク管理が明示的になる。
    4. **NN/g「2 つ以上の冗長な視覚的指標」要件**: §4 本文許可 4 要素 + 静的補助（ハンドル + 削除ボタン + ↑↓ボタン + アクセント色 + 背景薄変化）の組み合わせで揺れアニメなしでもモード認識は十分に成立する（研究レポート §2-2 / §2-7 / §3-3）。
    5. **WCAG 配慮コスト**: §4 本文準拠の組み合わせは `prefers-reduced-motion: reduce` への追加実装が不要であり、Phase 2 完了基準を本サイクル内で満たせる。

- **選択肢 X-old（不採用、v3 で採用していた案）**: 「Phase 2 スコープに基づく積極的判断」として「Phase 2 スコープに必要 / 不要」を PM 判断軸とし、静的視覚変化の組み合わせのみを採用する。
  - **不採用理由**: 「Phase 2 スコープに必要 / 不要」の判断が PM の独自判断であり、cycle-176 PM が DESIGN.md §4 を派生規則化した構造（規約沈黙領域に PM 判断を入れる）と同型と判明した。「責任明示」「積極的判断」という表現で同じ構造を再生させてしまう。v4 では「§4 本文に書かれているもののみ使う」立て付け（選択肢 X）に転換し、PM 独自判断軸を完全に削除する。

- **選択肢 V（不採用、前 v2 で採った第四の道）**: 「本サイクル内では揺れアニメ採否を判断しない」と書き、結果として本サイクルでは実装されない構造に留める。
  - **不採用理由**: 実質的に消極的決定（不採用）と同じ結果になる AP-WF09「用語を変えて実質同じことをしていないか」違反構造。cycle-176 留意点 1 が定める正規二択（builder に委ねる / 規約改定で明文化する）にも該当しない第四の道であり、責任主体を曖昧にする。

- **選択肢 Y（不採用、v4 で部分採用に変化）**: 独立調査で沈黙領域を埋める提案を行い、Owner / DESIGN.md 改定の議論を経て規約化する。
  - **不採用理由（単独案としては不採用）**: §4 改定は本サイクルのスコープ外（B-309 の主目的は UI/UX 層構築）。改定判断には UI/UX 調査結果に加えて DESIGN.md 全体の整合性レビューが必要で、本サイクルで完結できない。**ただし v4 では選択肢 X の二重ゲート構造の一部として B-357 §4 改定独立タスクを E-4 で起票する**（Y を独立タスク化して X と組み合わせる構造）。

- **選択肢 Z（不採用）**: 揺れアニメ採否を個別実装で builder に委ねる。
  - **不採用理由**: builder 単独の判断では「派手な揺れ vs 静的のみ」のような二択になりやすく、サイクル横断の品質一貫性が損なわれる。独立調査題材として cycle-176 留意点 5 が要求しているのは PM レベルでの独立判断であり、builder 委任は留意点を満たさない。

- **選択肢 W（不採用）**: 揺れアニメと静的視覚変化を並列実装し、本サイクル内で実機比較する。
  - **不採用理由**: (1) Phase 2 スコープ（基盤層と検証用環境で動作）を超える。(2) 単一検証ルートで両方の表示を切替えられる UI を実装する複雑性が C 群スコープを膨張させ、`/toolbox-preview` の用途（基盤の動作確認）を歪める。(3) `prefers-reduced-motion` 対応コストの実測 / パフォーマンス実測 / コンセプト整合の独立判断は B-356 で腰を据えて行うほうが結論の質が高い。

#### 編集モード起動方式の選択肢

- **採用**: 案 A（明示的 2 モード分離型・シンプルハンドル方式）。研究レポート §5-2 比較表で M1b 適合「高」、誤操作リスク「低」を満たす。本サイクル選択肢 X（§4 本文準拠）と整合する純粋採用。
- **本サイクル取り扱わない**: 案 B（揺れアニメ方式）。揺れアニメ採用は §4 本文（DESIGN.md L69-78）に書かれていないため本サイクルでは取り扱わない（採否判断は §4 改定独立タスク B-357 + B-356 揺れアニメ採否独立調査で実施）。揺れ表現自体が悪いという判断ではなく、規約沈黙領域に PM 独自判断を入れない立て付け（B-2 選択肢 X）に従う。
- **不採用**: 案 C（セミシームレス型）。「意図せず長押しで編集モード入り」の誤操作リスク（同 §5-2 案 C 欠点欄）が M1b dislike「慣れた操作手順が突然変わる」と整合しない。
- **不採用**: 案 D（常時編集可能型）。「毎日開く場所で誤ってレイアウトが変わる」リスクが M1b の安心感を損なう（同 §5-2 案 D 適合評価）。

#### 単一ポインター代替の方式選択肢（WCAG SC 2.5.7）

- **採用**: 方式 α（編集モード時に各タイル隅に「↑」「↓」ボタンを常時表示）。理由: (1) 視覚的に「並び替えられる」アフォーダンスが明確、(2) タップで完結、(3) `aria-label` で a11y 対応容易、(4) フォーカス時のみ表示する方式 β よりタイル密度との衝突予測が容易、(5) WCAG SC 2.5.8 に従いボタンサイズ 24px 以上（推奨 44px）。
- **不採用**: 方式 β（編集モード時にタイルフォーカスでオーバーレイメニュー表示）。フォーカス時のみ表示するためモバイルでアフォーダンスが伝わりにくい。タイル密度との衝突予測が困難。
- **不採用**: 方式 γ（キーボード代替のみ + 操作説明テキスト）。WCAG SC 2.5.7 の単一ポインター代替を満たさない（キーボードはポインターではない）。

#### Undo 方式の選択肢

- **採用**: Undo バナー方式（確認ダイアログなし、最低秒数 = 研究レポート §5-2 案 A の参考値「5 秒間」、最終秒数は builder が来訪者目線で判断）。**8 秒や 15 秒の上下限を本サイクルで固定しない理由**: 8 秒下限・15 秒上限の根拠を本サイクル内で独立調査として作れないため、固定すると AP-P01「計画の根幹にある仮定の定量検証」違反のリスクがある。代わりに builder 判断基準（M1b 誤削除リカバリーシナリオ (1) 編集中に気づく / (2) モード離脱後に気づく の両方をカバーすること、M1b の落ち着いたトーン整合）を渡す。8〜15 秒は推奨候補（参考値）として残す。
- **不採用**: 確認ダイアログ方式（NN/g「確認ダイアログは頻出すると無視される」、M1b の儀式回避と矛盾）。
- **不採用**: 削除即確定方式（誤削除からのリカバリー手段なし、`localStorage` 永続化のため復元困難）。

#### 検証ルート URL 選択肢の独立判断根拠

- **採用**: `/toolbox-preview`。独立判断根拠: (1) noindex / nofollow / hidden URL の用途を URL 名から推測しにくく、来訪者の偶発到達を最小化、(2) Phase 9.2 で `/` への切替時に URL 撤去を行う前提で命名（toolbox-preview = Phase 2 期間限定）、(3) 既存 `/storybook` セクションと用途が異なるため別ルート、(4) sitemap / robots.txt / Header / Footer 動線に追加しない方針と整合。cycle-176 で同名ルートが構想されていた事実は参考情報として残すが、独立判断の根拠としない。
- **不採用**: `/storybook` 内のセクションのみ（理由: storybook は単体カタログで、複数コンポーネント統合の動作確認には不十分。検証ルートは独立した `/toolbox-preview` で構築する）。
- **不採用**: 直接 `/` を上書き（理由: Phase 9 まで現行 `/` を毀損しない原則と矛盾）。

#### 観点リストの起草方式

- **採用**: B 分類観点リスト構造（検証手段マッピング）を流用しつつ、観点 12 派生規則を除外し、「§4 本文規定（L69-78）の遵守」観点と「§4 本文に書かれている視覚要素のみを使っているか」観点を別立てする方式。**判断主体・基準**: A-2 で PM が B 分類資産（`tmp/cycle-176-review-criteria.md` 等）を Read し、本方式採用を `tmp/cycle-177-meta-review.md` に PM 名で確認記録する。判断基準は (a) 構造部分（検証手段ラベル / reviewer プロンプトテンプレート）に派生規則が混入していないことを Read で確認、(b) 観点 12 派生規則（揺れアニメ不採用）部分のみを除外する具体的削除箇所を明示すること。
- **不採用**: ゼロから完全再起草。理由: B 分類資産の構造部分（観点ごとの検証手段ラベル / reviewer プロンプトテンプレート）は cycle-176 PM のコンテキスト下で作成されたが、構造自体に派生規則を含まないため流用しても誤りは混入しない。観点 12 のみ修正すれば足り、ゼロからの再起草は工数優先ではなく単純な労力浪費になる（A-2 では再判断しない、本欄で結論済み）。
- **不採用**: B 分類資産をそのまま流用。理由: 観点 12 に派生規則「揺れアニメ不採用」が含まれており、cycle-177 でそのまま流用すると派生規則が暗黙継承される（cycle-176.md L506）。

### 計画にあたって参考にした情報

#### 一次情報（原典 Read 済み）

- `/mnt/data/yolo-web/DESIGN.md` L1-126（特に §1 / §2 / §3 / §4 + サブセクション L69-78 / §5 / §6）
- `/mnt/data/yolo-web/docs/design-migration-plan.md` L55-89（Phase 2 全体）+ L1-379（Phase 全体の整合）
- `/mnt/data/yolo-web/docs/targets/特定の作業に使えるツールをさっと探している人.yaml`（M1a 全文）
- `/mnt/data/yolo-web/docs/targets/気に入った道具を繰り返し使っている人.yaml`（M1b 全文）
- `/mnt/data/yolo-web/docs/cycles/cycle-175.md`（事故報告 / 次サイクル留意点 L1152-1194）
- `/mnt/data/yolo-web/docs/cycles/cycle-176.md`（前提セクション L70-110 / 事故報告 L366-636 / cycle-177 への申し送り L625-636 / Phase 9.1 申し送り L621-623 / Phase 9.2 申し送り L611-619）
- `/mnt/data/yolo-web/docs/anti-patterns/planning.md` AP-P01 / AP-P04 / AP-P11 / AP-P14 / AP-P16
- `/mnt/data/yolo-web/docs/anti-patterns/workflow.md` AP-WF02 / AP-WF03 / AP-WF04 / AP-WF06 / AP-WF09 / AP-WF11 / AP-WF12

#### 調査レポート（Read 済み）

- `/mnt/data/yolo-web/tmp/research/2026-05-03-cycle-177-foundation.md`（保持基盤層 API / 削除 UI/UX 層 / Phase 2 完了基準対応 / 14 項目 (a)/(b)/(c) 分類 / AP-P01 / AP-WF06 適用示唆）
- `/mnt/data/yolo-web/docs/research/2026-05-03-customizable-dashboard-ux-best-practices-synthesis.md`（4 案 A/B/C/D 比較表 / WCAG 2.2 関連達成基準 / `prefers-reduced-motion` / NN/g 冗長視覚指標）
- `/mnt/data/yolo-web/docs/research/2026-05-03-home-screen-reorder-ux-deep-dive.md`（iOS ジグル批評は「並び替え操作の煩雑さ」批判であり「揺れ表現自体」批判ではない事実確認）
- `/mnt/data/yolo-web/docs/research/2026-05-03-dashboard-toolbox-individual-ux-deep-dive.md`（Notion 公式の使用面と編集の分離 / iOS 27 Undo / 業界相場密度）
- `/mnt/data/yolo-web/docs/research/2026-05-03-toolbox-auto-learning-vs-manual-ux-research.md`（M1b dislikes と自動学習の直接矛盾）

#### 実装コード（Read 済み）

- `/mnt/data/yolo-web/src/lib/toolbox/types.ts` / `registry.ts` / `tile-loader.ts` / `storage.ts` / `useToolboxConfig.ts` / `initial-default-layout.ts` / `FallbackTile.tsx`
- `/mnt/data/yolo-web/src/lib/scroll-lock.ts`
- `/mnt/data/yolo-web/scripts/generate-toolbox-registry.ts`

## レビュー結果

<!-- 作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。 -->

## キャリーオーバー

<!-- このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。 -->

## 補足事項

なし

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
