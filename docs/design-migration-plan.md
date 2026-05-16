# デザイン移行計画

新デザインシステムへ既存全ページを段階的に移行する計画書。各 Phase を 1 つの Claude Code セッション = 1 サイクルで実施する単位とする。Phase は逐次進行。並行は前提にしない。Phase 内のサブタスクも逐次。

## 目的

- `(legacy)/` 配下の全ページを新コンポーネント体系（`src/components/` 直下）へ移行
- 移行と同時に、コア機能「道具箱」のタイル化対応を進める
- 移行完了時に `src/app/(legacy)/`、`src/app/old-globals.css`、`src/components/common/` を完全に削除
- 各ページの来訪者体験を損なわず、視覚的・機能的に同等以上の状態で完了する
- 来訪者から見える「デザイン混在期間」を最小化する。来訪者からは見えない作業（判断・基盤実装）を可能な限り前倒しし、可視のデザイン切替が始まる時点を遅らせる

## 移行アーキテクチャ

Route Group「複数 root layout」パターンを土台にする：

```
src/app/
├── (legacy)/  旧デザイン: layout.tsx → old-globals.css + src/components/common/
└── (new)/     新デザイン: layout.tsx → globals.css + src/components/
```

各 Route Group が独立した root layout を持つ。**移行は 1 ページずつ `git mv (legacy)/foo/ (new)/foo/` で開始し、その後デザイン適用作業が続く**。各ルートが独立しているため、移行済みページに旧スタイル / 旧コンポーネントが漏れることはない。

`metadata` は `src/lib/site-metadata.ts` の `sharedMetadata` を両 layout から import する。値の変更は `sharedMetadata` 1 か所のみで完結するよう一元化されている。

`(new)/` 配下のページは既定でインデックス対象（`sharedMetadata` の `robots: index=true`）。検索エンジンに公開したくないページは、そのページの `page.tsx` で `metadata` export または `generateMetadata` を使い `robots: { index: false, follow: ... }` を返す（既存パターン、例：`src/app/(legacy)/blog/tag/[tag]/page.tsx`）。`page.tsx` がインタラクティブで `"use client"` となる場合は、`page.tsx` を server component に保ち interactive 部分を子の client component に分離する（実例：`src/app/(new)/storybook/page.tsx` + `StorybookContent.tsx`）。

## Phase 一覧

### Phase 1: 着手前判断

後続全 Phase のスコープを確定する判断を行う。来訪者から見える変化はない。

サブタスクを順に：

- **1.1** 検索方針判断
  - 新デザインに横断検索（ブログ・ツール・遊び・辞典が混ざって出る）を作るかを判断
  - 候補（**二択**）: ① 新デザインに横断検索を作る（Phase 5 で実装）/ ② 新デザインに横断検索を作らない（Phase 5 をスキップ）
  - ツール内・遊び内の絞り込みは Phase 4 の通常スコープで必須実装され、本判断とは独立
  - 判断結果が Phase 5（① のとき新 search 実装）の着手要否を決める。Phase 4 の一覧設計は本判断とは独立に進められる
  - **判断結果（2026-05-01 cycle-174 / 2026-05-11 cycle-186 で再判断）**: ② 新デザインに横断検索を作らない（Phase 5 = B-331 をスキップ、(legacy) の横断検索は Phase 10.2 で自然消滅）
  - **要旨**: cycle-174 では当初 ① 採用と確定したが、cycle-186 中に PM が一次資料（`https://developers.google.com/search/blog/2024/10/sitelinks-search-box`）を WebFetch で確認した結果、cycle-174 ① 採用根拠の中位メリット A-13（SearchAction による Google sitelinks searchbox SEO 便益）が **2024-11-21 に Google により正式廃止** されていることが判明。cycle-174 ① 採用は A-13 を含む 6 項目の中項目総和で成立していたが、A-13 を除いた残 5 項目（A-7 / A-4 / A-5 / A-1-2 / A-6）はいずれも cycle-174 本文自身が「中項目で別手段による代替可能性あり」と認める弱点を持つ。一方サイトデザイン切替（Phase 6/7/8/9/10.2）は全来訪者・全ページ訪問に直接効くため、CLAUDE.md L9 Decision Making Principle「If the better UX option is achievable, it must be chosen」に従い ② 転換を確定。なお A-13（SearchAction による Google サイトリンク検索ボックス）は 2024-11-21 廃止により実在しない便益であった（「独立ページ実装が前提の条件付き便益」との旧記述は廃止済み便益を前提としているため無効）。
  - **詳細**: cycle-174.md（① 採用根拠と廃止判明後の撤回追記）/ cycle-186.md（② 転換の判断構造）
  - **参照**: 判断の詳細と経緯（cycle-172 / cycle-173 の失敗認定を含む）は `docs/cycles/cycle-174.md`「### 判断」セクション参照。失敗認定の詳細は `docs/cycles/cycle-172.md` / `docs/cycles/cycle-173.md` 参照

- **1.2** 既存コンテンツ整理の方針確定（B-315 連動）
  - 辞典・cheatsheets・achievements を「移行 or 削除」で個別判断する **当初の方針は失敗認定で破棄**（2026-05-01 Owner 指摘）
  - 代替方針: **全コンテンツ移行 + cheatsheets を blog 記事として再編**。個別の選別判断はせず、来訪者の動線と内部リンクを保全することを優先する
  - 具体スコープ: (a) 辞典 4 系統（kanji / yoji / colors / humor）の dictionary トップ + 各サブルートを移行、(b) achievements を移行、(c) cheatsheets 7 系統をブログ記事に書き換えて blog 配下に統合し cheatsheets ディレクトリは撤去
  - データ資産の活用案（漢字検索ツール / 四字熟語検索ツール 等のインタラクティブツール化）は別 backlog として後付け検討（移行完了後に独立した機能追加として扱う）
  - **判断結果（cycle-172, 2026-04-30）**: 当初は 19 単位を判断（移行 8 / 削除 11 / 保留 0）したが、kanji-kanaru 連動の事実誤認、yoji→kanji 内部リンク未検討、ツール化選択肢の欠落により失敗認定。詳細は `docs/cycles/cycle-172.md`「失敗サイクル認定」セクション参照。

**完了基準**: 1.1 は ② 採用（横断検索を作らない）が確定済み（cycle-174 で当初 ① を確定し、cycle-186 で ② に再判断）。1.2 は「全移行 + cheatsheets ブログ化」方針が確定済み（本セクション）であり、Phase 8（B-338）の実施スコープに引き継がれる。

### Phase 2: 道具箱の基盤整備（来訪者向け非公開、概念定義 + 型契約のみ）

道具箱機能の **タイル概念定義** と **型契約** を確立する。来訪者から見える変化はない。実装系（`Tile` コンポーネント / DnD / 編集モード切替 / localStorage 永続化 / Undo / モーダル等）は本 Phase の対象外。それらは Phase 7 で揃う実タイル群を観察した上で、Phase 9 で設計・実装する（後述 Phase 9 全体留意参照）。

サブタスクを順に：

- **2.1** 設計判断

  検討して決定すること：
  1. **道具箱の URL 構成**
     - トップ `/` 自体を道具箱として動作させる（「日常の傍にある道具」のコンセプトに即している、初回来訪体験を最短にできる）
     - 専用 URL を持つ（例：`/dashboard`、`/toolbox`）
     - 複数道具箱を作れるようにし、それぞれを個別 URL で持つ（例：`/toolbox/[id]`）
     - cycle-167 で構想にある「シェア用 URL（base64 エンコード）」との組み合わせ方
     - トップを採用する場合は、Phase 4.4 で移行する現行トップ内容を Phase 9.2 でどう扱うかの戦略も併せて検討する（別ページに移す / 統合する / 廃棄する）
     - 検討材料：「日常の傍にある道具」のコンセプト、初回来訪者のオンボーディング、SEO、複数端末からの利用、将来的な複数道具箱対応の拡張余地

  2. **メタ型構造の見直し**
     - 既存の `ToolMeta` / `PlayMeta` のように、ツールと遊びコンテンツを別々のメタ型として分離したまま扱うか、すべてを「タイル」という統一概念に揃えて単一構造（例：`ToolboxItem` のような汎用型）にするかを検討する
     - すべてをタイルとして扱うコンセプトを踏まえると単一構造のほうが扱いやすくなる可能性がある。逆にツールと遊びでデータ・操作モデルが大きく異なる場合は分離が望ましい
     - Phase 4 の一覧ページ移行は本 Phase の決定後に行うため、メタ型を後方互換に縛らずに自由に再設計してよい。一覧ページは新メタ型を前提に作れる

  3. **ツールとタイルが 1 対多になり得るか**
     - あるツールが詳細ページで高度な機能を持つときに、道具箱のタイルとしては別の簡素な UI を持たせる判断（スマートフォンの「アプリ本体」と「ホーム画面ウィジェット」の関係性）が必要になり得るかを検討する。たとえば「複雑な入出力を持つツールをタイルではプリセット 1 種類に固定する」「結果表示だけの軽量タイルを別途作る」「同じツールに用途別の複数タイル種類を用意する」などのケースが現実的にあり得るか
     - 1 つでも 1 対多が必要なケースがあるなら、メタ型インタフェースは「タイル用のコンポーネント参照を、詳細ページの本体コンポーネントと別に指定できる、複数指定もできる」形にする（1 対多サポート）。1 対 1 で十分なら単一参照で済む
     - 実際のツール群（age-calculator 等 34 種、遊び 20 種）を一巡して「1 対多が必要なケースが存在するか」を確認した上で決定する。推測だけで結論を出さない

- **2.2** タイル概念定義 + 型契約
  - **タイル概念の定義**: 道具箱内に並ぶ「タイル」は、来訪者が **道具箱内で完結して機能を使えるコンパクトな UI 単位**。タイルに対する来訪者の操作（入力・閲覧・実行）はタイル内で閉じ、ページ遷移を伴わない設計を前提とする。Phase 2.1 #3 で示される通り、(a) 1 対 1（詳細ページ本体をそのままタイル化）/ (b) 1 対多（タイル用の簡素な別 UI、すなわちスマートフォンの「アプリ本体（詳細ページ）」と「ホーム画面ウィジェット（タイル）」の関係性）/ (c) 複数バリエーション（用途別に複数タイル種類）の 3 形態が想定される。**いずれの形態でも『タイルは道具箱内で完結する UI 単位であり、操作がタイル内で閉じる』という性質は不変項として成立する**。具体的にどの形態を採るかは Phase 2.1 #3 の判断結果による。
  - **型契約の整備**: 2.1 の決定（メタ型統合 / 分離 + 1 対多サポート可否）に従って、メタ型に「タイルとして表示するためのインタフェース」を追加する。具体型名（例：`Tileable` / `TileComponent`）は Phase 2.1 結果に基づき本 Phase サイクル内で確定する。
  - **検証**: 型レベル（`tsc`）と単体テスト（vitest）で行う。実コンポーネント（DnD / 編集 / 永続化 / モーダル）は本 Phase の対象外。Storybook 表示や hidden URL での視覚検証は本 Phase で行わない（実タイル不在の段階で視覚検証してもダッシュボード本体評価にはならない）。

**完了基準**: Phase 2.1 の 3 つの設計判断（URL 構成 / メタ型構造 / 1 対多サポート可否）が **本 Phase サイクル内で確定** している（後続 Phase へ送らない）。Phase 2.2 で「タイル概念定義」が本文に書かれている（次サイクル PM が読んでも『タイル = ナビゲーションカード』と誤読しない粒度）。型契約がメタ型に追加され、`tsc` と関連単体テスト（型契約に対するテスト）が通る。来訪者向けの道具箱ページは本 Phase ではまだ存在しない。

**注**: 「不変項として『タイルは道具箱内で完結する UI、ナビゲーションカードではない』が成立する」という記述（Phase 2.2 タイル概念定義の中段）を理由に、Phase 2.1 #3 の形態判断（1 対 1 / 1 対多 / 複数バリエーション）を Phase 7 へ送ってはならない。形態判断は本 Phase の責務であり、本判断の保留は Phase 2.1 完了基準違反となる。

### Phase 3: 静的 + リダイレクト先行

来訪者から見える「デザイン混在期間」がここから始まる。低リスクのページを最初に切替える。

サブタスクを順に：

- **3.1** 静的ページ移行：`/about`、`/privacy`、`/not-found`、`/feed`（RSS）、`/feed/atom`（Atom）

- **3.2** リダイレクト専用ディレクトリの移動：`/memos`、`/memos/[id]`、`/memos/feed`、`/memos/feed/atom`、`/memos/thread/[id]`
  - リダイレクトのみのため UI 移行はなく、ディレクトリを `(new)/` へ移すだけ

**完了基準**: 上記すべての URL が `(new)/` 配下で動作。`(legacy)/` には残らず、Playwright 視覚確認で旧と同等以上の見た目と動作。

### Phase 4: 一覧・トップ移行

リスト系で新デザインのリスト/カード系パターンを確立してから、それを集約する形でトップを移行する。Phase 2.1 で決定した新メタ型を前提に実装する。

サブタスクを順に：

- **4.1** ツール一覧：`/tools`、`/tools/page/[page]`
- **4.2** 遊び一覧：`/play`
- **4.3** ブログ一覧：`/blog`、`/blog/page/[page]`、`/blog/category/[category]`、`/blog/tag/[tag]`
- **4.4** トップ：`/`

② 採用（cycle-186 で再判断）のため、各リスト内絞り込み（4.1 ツール / 4.2 遊び / 4.3 ブログ / 4.4 トップ）は Phase 4 で実装済み（cycle-181〜185 で完了）。横断検索 UI 結線は **実施しない**（cycle-186 で Phase 5 = B-331 をスキップ確定）。Phase 4 で用意した Header の actions スロット / 検索アイコン枠 / Cmd+K 受け口は、(new) Route Group では未結線のまま Phase 10.2 まで維持される。Phase 10.2 で (legacy) 全廃と一体で旧 SearchModal/SearchTrigger も撤去され、横断検索機能はサイトから自然消滅する。

トップ（4.4）は現行のトップ内容を新デザインに移行する。Phase 2.1 で「URL=トップ」を採用した場合は Phase 9.2 でこれを道具箱に置き換える。それまではトップは現行内容のまま動く。

**Phase 5 着手の前提として Phase 4 のヘッダー設計に含める要素**（cycle-181〜185 完了時点の設計記録）:

- 新ヘッダーの actions スロットでの検索トリガー（アイコン）配置構造
- モバイル Header での検索アイコン枠（1 枠分、44px）
- Cmd+K / Ctrl+K キーバインドの受け口
- これらは Phase 4 で構造のみ用意し、実際の検索 UI との結線は Phase 5 で実施する予定だった

**2026-05-11 cycle-186 で ② 転換により Phase 5 着手不要となったため**、上記 actions スロット / 検索アイコン枠 / Cmd+K 受け口は未結線のまま Phase 10.2 まで維持される。Phase 5 結線責務は消滅し、Phase 10.2 で (legacy) Route Group 全廃と一体で旧 search 群ごと撤去される。

**a11y 配慮の責務（A-6 を Phase 4 担当が引き継ぐ）**:

- A-6（アクセシビリティ観点での検索到達手段増加）は中評価のため、検索を a11y 経路として強く頼ることはできない
- グローバルナビ / 一覧 / サイトマップ / タグで複数経路（WCAG 2.4.5 Multiple Ways）を Phase 4 標準スコープを超えて丁寧に作る責務を Phase 4 担当が負う
- 横断検索に依存しない複数経路を整備すること（`aria-current`、focus-visible、コントラスト 4.5:1、タップターゲット 44px を含む）

**完了基準**: 4 つの主要セクションが `(new)/` 配下で動作し、Header / Footer の動線が新版に統一される（cycle-181〜185 で達成済み）。リンク先（記事詳細、ツール詳細など）は移行済みの新ページ or 未移行の legacy ページのいずれでも崩れない。ヘッダーに検索トリガーアイコン枠と Cmd+K 受け口が実装されている（2026-05-11 cycle-186 で ② 転換確定により、Phase 5 での結線は不要となり未結線のまま Phase 10.2 まで維持）。

### Phase 5: 検索の実装（cycle-186 で ② 転換 — 実施しない）

**2026-05-11 cycle-186 で ② 転換**: Phase 1.1 が ② 再判断（cycle-186 で確定）となったため、Phase 5 は **実施しない**。Phase 4 で用意した Header の actions スロット / 検索アイコン枠 / Cmd+K 受け口は (new) Route Group では未結線のまま Phase 10.2 まで維持される。

旧 `src/components/search/` の SearchModal / SearchTrigger / SearchInput / SearchResults / useSearch / highlightMatches / SearchModal.module.css 等および `src/lib/analytics.ts` 内の search 関連関数（trackSearchModalOpen / trackSearchModalClose / trackSearchResultClick / trackSearchAbandoned / trackSearch）はすべて Phase 10.2 で (legacy) Route Group 全廃と一体で撤去される（自然消滅、新規実装作業不要）。

**過去の Phase 5 章内容（cycle-174 で確定した実装方針）**: モーダル/独立ページ/両立 の判断 / `src/lib/search/` 共有層 / B-340 計測接続 / SearchAction 条件付き便益 などはすべて cycle-186 中の ② 転換により無効化された。詳細経緯は `docs/cycles/cycle-186.md`、cycle-174 の撤回追記は `docs/cycles/cycle-174.md` 末尾の「2026-05-11 cycle-186 にて全面撤回（② 転換）」参照。

**完了基準**: Phase 5 は実施しないため、完了基準は「Phase 1.1 が ② に再判断されていること」「本セクションの記述が ② 転換と整合していること」のみ。

### Phase 6: ブログ詳細移行

サブタスク：

- **6.1** `/blog/[slug]`：記事 100+ 件のテンプレ移行

ブログ系（一覧 → 詳細）が Phase 4 → Phase 6 で完結する。

**完了基準**: すべての記事が `(new)/` 配下で表示でき、Article JSON-LD、目次、シェアボタン、関連記事などの既存機能が移行後も動作する。

### Phase 7: ツール・遊び詳細 + タイル化（同時実施）

各コンテンツを 1 つずつ「詳細ページ移行 + タイル定義」を同サイクルで実施。「2 回の作り直し」を避けるための同時実施。

ツール / 遊びそれぞれの順序は、GA4 ページビュー高い順 + 構造単純な順を基本に決定する。

サブタスクを順に：

- **7.1** ツール群の移行 + タイル化（34 ルート、各 1 サイクル）
  - 対象：age-calculator / base64 / bmi-calculator / business-email / byte-counter / char-count / color-converter / cron-parser / csv-converter / date-calculator / dummy-text / email-validator / fullwidth-converter / hash-generator / html-entity / image-base64 / image-resizer / json-formatter / kana-converter / keigo-reference / line-break-remover / markdown-preview / number-base-converter / password-generator / qr-code / regex-tester / sql-formatter / text-diff / text-replace / traditional-color-palette / unit-converter / unix-timestamp / url-encode / yaml-formatter

- **7.2** 遊び群の移行 + タイル化判断（20 ルート + result ページ、各 1 サイクル）
  - ゲーム（4 種）：irodori / kanji-kanaru / nakamawake / yoji-kimeru
  - クイズ（15 種）：animal-personality / character-fortune / character-personality / contrarian-fortune / impossible-advice / japanese-culture / kanji-level / kotowaza-level / music-personality / science-thinking / traditional-color / unexpected-compatibility / word-sense-personality / yoji-level / yoji-personality
  - 占い（1 種）：daily（`/play/daily` として共通ルートに既存）
  - 共通ルート：`/play/[slug]`、`/play/[slug]/result`、`/play/[slug]/result/[resultId]`

各サイクルで実施する内容：

1. ロジックの CSS Module を新トークンに置換
2. 詳細ページ（`/tools/<slug>` など）を `(new)/` 配下に移動し DESIGN.md に従ってデザイン適用（後述「1 ページ移行の標準手順」参照）
3. **タイル化対象なら、Phase 2.2 の型契約に沿って単独表示可能なタイルウィジェットを実装する**: タイルは道具箱内で完結する機能を提供するコンパクトな UI（ナビゲーションカードではない）。Phase 2.1 #3 の判断結果（1 対 1 / 1 対多 / 複数バリエーション）に応じて、(a) 詳細ページ本体をそのままタイル化、(b) タイル用に別コンポーネントを新設、(c) 複数バリエーションを用意 のいずれかを採る。
4. タイル化対象なら Phase 2.2 で確立した型契約を埋める（タイル用コンポーネント参照、推奨サイズ、入出力 placeholder 等）。
5. **単独レンダリング検証**: 各タイルが `/storybook` または対応する詳細ページ内で単独表示できることを Playwright で確認する（道具箱機構への組み込みは Phase 9 で行うため、本 Phase ではタイル単体での視覚・動作を検証する）。タイル化に馴染まないコンテンツ（ブログ的な遊びなど）は詳細ページのデザイン移行のみ行いタイル定義は付けない。

**完了基準**: 各コンテンツが `(new)/` 配下で動作し、タイル対応対象は `/storybook` または詳細ページ内でタイル単体として動作確認できる。各ロジックの CSS Module から旧 `--color-*` トークン参照が消えている。

### Phase 8: 既存コンテンツ整理の実施

Phase 1.2 の方針「全移行 + cheatsheets ブログ化」に従って実施。Phase 7 同様、各サブタスクは独立した移行単位 = 各 1 サイクルで実施する。

サブタスク（並行可、ただし 8.3.b〜8.3.e は 8.3.a の後）：

- **8.1** 実績システムへの対応（B-338、判断は別途 B-355 で実施）
  - 新コンセプト「日常の傍にある道具」と実績システム（ゲームクリアでバッジ獲得 / ストリーク追跡）の整合を B-355 で評価
  - ① 存続: `/achievements` を `(new)/` へ移行（標準手順）
  - ② 撤去: 実績システム全体（`src/lib/achievements/`、`StreakBadge`、`AchievementProvider`、Header / Footer の関連リンク、各ゲームからの実績トリガー、localStorage `yolos-achievements` キー、`/achievements` ページ）を削除し、関連 URL は 410 Gone またはトップへリダイレクト
- **8.2** cheatsheets を blog 記事として再編
  - **8.2.a** `cron` をブログ記事に転換（B-342）
  - **8.2.b** `git` をブログ記事に転換（B-343）
  - **8.2.c** `html-tags` をブログ記事に転換（B-344）
  - **8.2.d** `http-status-codes` をブログ記事に転換（B-345）
  - **8.2.e** `markdown` をブログ記事に転換（B-346）
  - **8.2.f** `regex` をブログ記事に転換（B-347）
  - **8.2.g** `sql` をブログ記事に転換（B-348）
  - **8.2.h** `src/cheatsheets/` と `(legacy)/cheatsheets/` ディレクトリ撤去 + 旧 URL から blog 記事へのリダイレクト設定（B-349、8.2.a〜g 完了後）
- **8.3** 辞典 4 系統を `(new)/` へ移行
  - **8.3.a** dictionary トップ `/dictionary`（B-350）
  - **8.3.b** `colors` 系（トップ + 詳細 + category）（B-351、8.3.a 後）
  - **8.3.c** `humor` 系（トップ + 詳細）（B-352、8.3.a 後）
  - **8.3.d** `kanji` 系（トップ + 動的サブルート + 詳細）（B-353、8.3.a 後）。kanji-kanaru ↔ kanji 辞典の双方向クロスリンク維持
  - **8.3.e** `yoji` 系（トップ + category + 詳細）（B-354、8.3.a + 8.3.d の後）。yoji 詳細から kanji 詳細への内部リンク維持

**ツール化（漢字検索ツール / 四字熟語検索ツール 等）は本 Phase の対象外**。データ資産（kanji-data.json 2,136 字、yoji-data.json 400 語等）を活かしたインタラクティブツール化は、移行完了後に独立した機能追加として別 backlog（B-341）で扱う。

各サブタスクは Phase 3〜7 と同じ「1 ページ移行の標準手順」に従う。テンプレート駆動のコンテンツ（kanji 2,136 字、yoji 400 語等）はテンプレート 1 件改修で大量の動的サブルートを一括移行できる。

**完了基準**: 8.1〜8.3 のすべてのサブタスクが完了し、各ルートが `(new)/` 配下で動作する（cheatsheets は blog 記事として再編済みで旧 URL がリダイレクト）。`(legacy)/dictionary/`・`(legacy)/cheatsheets/`・`(legacy)/achievements/` ディレクトリと `src/cheatsheets/` が残らない。yoji 詳細から kanji 詳細への内部リンク、kanji 詳細と kanji-kanaru の双方向リンクなどが移行後も機能する。

### Phase 9: 道具箱機能の本実装と公開

**Phase 9 全体留意（ダッシュボード本体実装の責務）**

Phase 7 完了時点で、各タイルはスタンドアロン表示可能な状態まで実装されている（型契約に沿ったコンパクトな UI 単位）。一方、ダッシュボード本体（並び替え / 編集モード切替 / localStorage 永続化 / Undo / モーダル / 多タイル管理機構などの代表的な機能要素を含む。具体的な内訳と UI 形式は Phase 7 完了後の実物観察に基づき本サイクル PM が判断する）の **設計と実装** は **Phase 9.2「公開」の着手前まで** に本 Phase 内で完了させる必要がある。Phase 9.1（プリセット）/ 9.3（ツール間連携）/ 9.4（シェア）の各サブタスクは本責務をスコープに含まない（9.1 は既存のテンプレート設計に集中する）。

実物観察前にダッシュボード本体の形式を計画書で固定すれば、cycle-175 / 176 / 177 と同型の派生規則化を再生産する蓋然性がある。よって本計画書は形式を固定しない: ダッシュボード本体の実装形式（Phase 9.2 と一体実装するか / Phase 9.2 着手前に独立サブタスクとして切り出すか）は本 Phase 着手サイクルの PM が、Phase 7 で揃った実タイル群を観察した上で判断する。判断は将来サイクル PM の責務であり、形式判断の不在を理由に Phase 9.2 着手を遅延させてよい根拠ではない（実物が揃った時点で当該サイクル PM が判断を確定する責務を負う）。

サブタスクを順に：

- **9.1** 構築済み道具箱テンプレート（B-312）
  - ペルソナ別プリセット（文章を書く人向け・プログラマー向け等）
  - オンボーディング動線
  - 9.2 で default content として組み込む形で利用する

- **9.2** 道具箱ページの本公開
  - Phase 2.1 で決まった URL に道具箱ページを配置
  - 9.1 のテンプレートを default content として組み込み、初回来訪者に空状態を見せない
  - URL=トップの場合：Phase 4.4 で移行した現行トップ内容を、Phase 2.1 で決めた戦略に従って別ページに移す / 統合する / 廃棄する
  - URL=専用の場合：Phase 2 の hidden 検証用ページを正式公開状態にアップグレード（noindex 解除など）

- **9.3** ツール間の入出力連携（B-324）
  - タイル間の入力元選択 UI、型システム

- **9.4** シェア機能（B-313）
  - タイル配置 + 設定の base64 エンコードによる URL シェア
  - Phase 2.1 で決めた URL 構成と整合させる

**完了基準**: 道具箱ページが来訪者に公開されている（default content 付き）。来訪者が「テンプレートから道具箱を作る → カスタマイズする → URL でシェアする」フローを実行できる。

### Phase 10: 撤去・統合

厳密に直列で実施。前段が完了していないと壊れる。

サブタスクを順に：

- **10.1** API ルート移行：`(legacy)/api/` 配下（`kanji-kanaru/evaluate`、`kanji-kanaru/hints`、`quiz/compatibility`、`yoji-kimeru/evaluate`、`yoji-kimeru/puzzle`）を `(new)/api/` へ `git mv`

- **10.2** legacy 撤去
  - `src/app/(legacy)/` 削除
  - `src/app/old-globals.css` 削除
  - `src/components/common/` 削除
  - `CLAUDE.md` の `## Notes` セクションにある `(legacy)` / `(new)` ディレクトリの意味メモを削除（撤去後は意味メモ自体が無意味になるため）
  - `src/components/search/`（旧版）の Search\*.tsx / useSearch.ts / highlightMatches.tsx / 各 module.css をすべて削除。② 採用（cycle-186 で再判断）により新版 `src/components/Search*/` は実装されていないため、撤去対象は旧版のみ。
  - `src/lib/analytics.ts` 内の search 関連関数（trackSearchModalOpen / trackSearchModalClose / trackSearchResultClick / trackSearchAbandoned / trackSearch）も同時に撤去。② 採用により新版 components で接続される予定はなく、(legacy) と一体で消える。
  - `public/search-index.json` の生成スクリプト（`scripts/build-search-index.ts`）および `src/lib/search/{build-index,types}.ts` についても、② 採用で使用箇所が (legacy) のみとなるため、(legacy) 撤去と同時にすべて撤去。`/search-index.json` の生成も停止。
  - `package.json` の `prebuild` / `predev` / `pretest` から `generate:static-assets` 呼び出しを外す（または `generate:static-assets` スクリプト自体を削除）。Phase 10.2 時点で `generate:static-assets` が `tsx scripts/build-search-index.ts` のみで構成される場合（現状そうなっている）、後者（スクリプト自体の削除）の方が単純で副作用がない。`generate:static-assets` が他のステップを含む場合は前者の対応を採ること。
  - 旧 `src/components/common/Header.tsx` から `SearchTrigger` を直接 import している箇所も legacy 撤去と一体で消える。
  - 現サイトに `/search` 等の検索専用ルートは存在しないため、ルート単位の 410 / リダイレクト設定は不要（② 採用により独立ページは作られない）。

  **2026-05-11 cycle-186 で ② 転換**: 撤去範囲が当初の cycle-174 計画より広がった（cycle-174 計画では新版残置を想定していたが、② 採用で新版が存在しないため、search 機能全体が一括撤去）。詳細は `docs/cycles/cycle-186.md` および cycle-174 撤回追記参照。

- **10.3** Route Group 解除
  - `(new)/` 配下のすべて（`layout.tsx`、各ページ、`api/` 等）を `src/app/` 直下に `git mv`
  - `(new)/` ディレクトリ自体を削除
  - 個別ページの `metadata` export（noindex 等）が新場所でも機能するか確認

- **10.4** layout 統合
  - `GoogleAnalytics`、`AchievementProvider`、`WebSite JSON-LD`、`sharedMetadata` を `src/app/layout.tsx` 単一に集約
  - `src/lib/site-metadata.ts` は import 元が一本化されるが、ファイル自体は維持しても削除しても可

- **10.5** globals.css 後始末
  - legacy 関連のコメント削除
  - 旧トークン互換が残っていれば全撤去
  - `.scroll-locked` クラスは `globals.css` のみに残す
  - DESIGN.md §7「暫定対応」セクション削除

- **10.6** 計画書アーカイブ
  - `docs/design-migration-plan.md` → `docs/archive/design-migration-plan.md`
  - 移行完了でこのドキュメントの役割は終了。将来参照のため archive で保管

**完了基準**: `grep -rE "legacy|old-globals|components/common|\(new\)|\(legacy\)" src/` が空。`docs/design-migration-plan.md` が存在せず、`docs/archive/design-migration-plan.md` が存在する。`npm run lint && npm run format:check && npm run test && npm run build` がすべて成功。

## 1 ページ移行の標準手順

各ページごとに以下を順に実施。Phase 7 ではタイル対応のステップ 7 が追加される。

1. **依存コンポーネントの確認**: そのページが import している `@/components/common/*` を grep で列挙し、新版が存在するか確認。存在しなければ、共通化すべきかページ密接として扱うべきかを判断
2. **`git mv (legacy)/foo/ (new)/foo/`**: ファイル / ディレクトリを丸ごと移動
3. **import パス修正**: ページ内の `@/components/common/*` を `@/components/*` に置換
4. **CSS Module 内のトークン置換**: `--color-*` 系（旧）→ `--bg` / `--fg` / `--accent` 系（新）に置換。`:root.dark` を使っている箇所は `:global(:root.dark)` に修正（CSS Modules のスコープ問題、`docs/knowledge/css-modules.md` 参照）
5. **DESIGN.md に従ったデザイン適用**: トークン置換だけでは新デザインにならない。`/frontend-design` Skill と `DESIGN.md` を参照し、レイアウト（Panel に収める、余白、グリッド）、タイポ、ボタン / フォームの状態スタイル、ホバー / フォーカス、アイコン（Lucide 系）、a11y（タップターゲット 44px、`focus-visible`、`aria-current`、コントラスト 4.5:1）を新デザイン体系に合わせて再設計する。旧 UI の構造をそのまま維持するのではなく、必要に応じて構造そのものを変える
6. **TrustLevelBadge の撤去**: そのページが `@/components/common/TrustLevelBadge` を import していたら、import 行と `<TrustLevelBadge />` JSX を削除し、対応する `meta.ts` の `trustLevel` フィールドも削除する。撤去判断の根拠は cycle-180 の B-333-2 「execution 結果」を参照（Owner 指摘 + 実態調査により全廃決定。constitution Rule 3 は Footer の AI 注記で完全充足、badge は冗長）。**コンポーネント本体（`src/components/common/TrustLevelBadge.{tsx,module.css}`）と `src/lib/trust-levels.ts` は cycle-193（2026-05-17）で全件撤去済み。**この手順 6 自体は各ページの移行時には不要になったが、記録のため残す
7. **（Phase 7 のみ）タイル対応**: 詳細ページとタイルの UI 関係性を Phase 2.2 の指針に沿って判断し、必要に応じて表示用コンポーネントの分離 or 共用を行う。Phase 2.2 で確立したメタ型にタイル定義を追加
8. **テスト調整**: 移動後のテストパスや import が壊れていないか確認、`npm test` を当該ファイル範囲で実行
9. **視覚確認**: Playwright で w360 / w1280 のライト / ダーク両モードのスクリーンショットを取り、移行前と比較。移行前と「同等以上」（コンセプトに沿った改善）になっているかを評価。Phase 7 ではタイルとしての表示も道具箱ページで確認
10. **コミット**: 1 ページ 1 コミットを基本（差分が大きい場合は適切に分割）

## 検証方法

### 共通コンポーネント単体（`/storybook` 運用ルール）

`/storybook` は **共通コンポーネント専用** のカタログ。特定コンテンツ / カテゴリ固有のコンポーネント（ブログ記事のレイアウト、特定ツールの UI など）は置かない。

- 共通コンポーネントを追加したら、必ず `/storybook` のページに対応セクションを追加する。一覧から漏れた新コンポーネントは品質確認の網をすり抜ける
- 各セクションで以下を満たすこと：
  - ライト / ダーク両モードで視覚的に成立している
  - DESIGN.md と整合する見た目（`-soft` 背景の border は `-strong`、フォーム要素の border は `--border-strong` 等）
  - ロジックがあるコンポーネントは `/storybook` 上でクリック等の動作確認ができる（controlled state 等）
- 各 Phase 完了時に `/storybook` 全体を Playwright で撮影し、ライト / ダーク両モードで破綻がないことを確認

### ページ単位

- Playwright で `/foo` を w360 / w1280 のライト / ダーク両モードで撮影
- DOM に旧 `src/components/common/` 由来の class（`Header-module__Pzgc7q__*` 等のハッシュ）が一切出ない
- WCAG コントラスト 4.5:1 以上
- タップターゲット 44px 以上（`min-height` で確保）
- `focus-visible` スタイル
- ナビゲーションには `aria-current="page"`
- 構造化データ（記事は Article、パンくずは BreadcrumbList、サイトは WebSite）
- 既存テスト（vitest）が pass
- `npm run build` が通り、該当ルートが正しく生成される
- production ビルドの実機検証で GA4 計測動作

### 段階的移行の整合性確認

各 Phase で「移行済みページと未移行ページが同時に存在しても、それぞれ意図したデザインで動く」状態を維持する。具体的に毎 Phase 完了時に：

- 移行直後、移行したページは新スタイル、未移行ページは旧スタイルのまま動く
- 共通リンク（Header / Footer の動線）が両方のページから機能する
- ブラウザの戻る・進むで両方のページを行き来しても破綻しない

## アンチパターン回避

以下を、ページ移行ごとの検証で必ず確認：

- **AP-I07** (Next.js layout の body style と useEffect の競合)：`(new)/layout.tsx` の `<body style={...}>` を React が管理するため、`useEffect` で `document.body.style.*` を直書きしても次の reconciliation で消える。クラス操作 / data 属性で切替し CSS で定義
- **AP-I08** (fixed オーバーレイ背後の static 操作要素)：`position: fixed` + z-index のオーバーレイの背後に static の操作要素を置くと、要素がタップ不能になる。`position: relative; z-index: <overlay より大>` で前面化。Playwright の `document.elementFromPoint` で実機検証
- **AP-I09** (jsdom 単体テストの限界)：jsdom 単体テストは layout / CSS スタッキング / production ビルド由来のバグを検出できない。layout 依存・CSS レイアウト・production 挙動に関わるものは Playwright 本番ビルド実機検証を必須化

詳細は `docs/anti-patterns/implementation.md` 参照。移行中に新発見次第、同ファイルに追加していく。

## metadata 管理ルール

- `src/lib/site-metadata.ts` の `sharedMetadata` を両 layout から import
- 値変更は `sharedMetadata` のみ更新する一元化運用。片方の layout だけ更新する形は不整合の元
- `(new)/` 配下に追加するページは既定でインデックス対象（`sharedMetadata` の `robots: index=true`）
- noindex にしたい場合は、そのページの `page.tsx` 自身で `metadata` export または `generateMetadata` を使い `robots: { index: false, follow: ... }` を返す（既存パターン、例：`src/app/(legacy)/blog/tag/[tag]/page.tsx`）
- ページがインタラクティブで `"use client"` となる場合は `page.tsx` を server component に保ち、interactive 部分を子の client component に分離する（実例：`src/app/(new)/storybook/page.tsx` + `StorybookContent.tsx`）

## `.scroll-locked` クラスの扱い

- 移行中は `globals.css`（新側）と `old-globals.css`（旧側）の両方に同一定義 `.scroll-locked { overflow: hidden; }` を持つ
- Phase 10.2 で `old-globals.css` 撤去時に旧定義は同時に消え、`globals.css` 側のみで継続動作

## ロールバック条件

以下のいずれかを観測したら当該ページの移行コミットを `git revert`：

- 視覚的崩れ（レイアウト破綻、テキスト溢れ、色のコントラスト不足）
- アクセシビリティ低下（screen reader 操作の阻害、キーボード操作不能）
- WCAG コントラスト比 4.5:1 を下回る箇所の発生
- パフォーマンス低下（Lighthouse スコア悪化、Core Web Vitals 悪化）
- テスト失敗（既存テスト破壊）
- 来訪者影響（GA4 で当該ページの離脱率急増等）

ロールバック時の影響範囲は変更内容によって異なる。デザイン適用がトークン置換のみで完結している場合は `git revert` で実質元に戻るが、レイアウト構造を変えていたり、ページ密接コンポーネントを新規実装していたり、共通コンポーネントの API を変えていたりする場合は、関連するファイルの整合確認や追加の手戻り作業が必要になる。`(legacy)/` と `(new)/` が独立しているため、ディレクトリ位置だけは戻しやすい。

## コミット粒度

- 1 ページ 1 コミットを基本
- 共通コンポーネント追加（移行中に必要が判明した場合）は別コミット
- 巻き込み修正は別コミット
- コミットメッセージで「何を移行したか」「何を残したか」を明示

## 完了の定義

- `src/app/(legacy)/` ディレクトリが存在しない
- `src/app/old-globals.css` が存在しない
- `src/components/common/` が存在しない
- `src/app/(new)/` が `src/app/` 直下に統合されている（Route Group 解消）
- `docs/design-migration-plan.md` が `docs/archive/design-migration-plan.md` に移動されている
