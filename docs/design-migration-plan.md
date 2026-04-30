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
  - GA4 で legacy search の利用率と検索ワードの傾向を分析
  - 横断的サイト内検索（ブログ・ツール・遊び・辞典が混ざって出る）が新サイトで必要かを判断
  - 候補：(a) 横断検索を維持 / (b) カテゴリ別検索に分割（一覧ページ内に絞り込みを埋め込む等）/ (c) 検索撤去
  - 判断結果が Phase 4（(b) のとき一覧ページに統合）と Phase 5（(a) のとき新 search 実装）のスコープを決める
  - **判断結果（cycle-172, 2026-04-30）**: **保留** — `trackSearch` のみの現状計測では (a)/(b)/(c) の選択根拠が不足。過去 90 日の `search` 発火セッションは 5 件（全体の 0.69%）、180 日拡張でも同値、`page_referrer` ベースの遷移先追跡は GA4 Data API の event-sequence 制約で取得不可。`search_result_click` 等の計測強化を実装し 30 日以上のデータ蓄積後に中立に再判断する。詳細は `docs/research/2026-04-30-site-search-usage-analysis.md` 参照。

- **1.2** 既存コンテンツ整理の方針確定（B-315 連動）
  - 辞典・cheatsheets・achievements を「移行 or 削除」で個別判断
  - 判断結果が Phase 8 のスコープを決める
  - **判断結果（cycle-172, 2026-04-30、19 単位）**: 移行 8 / 削除 11 / 保留 0。**移行**: dictionary トップ、colors 系 3 単位、humor 系 2 単位、yoji 系 2 単位（合計 8）。**削除**: kanji 系 2 単位、cheatsheets 8 単位、achievements 1 単位（合計 11）。詳細は `docs/research/2026-04-30-legacy-content-migration-decision.md` 参照。Phase 8 着手前の引継ぎ事項として、cheatsheets のツール統合可能性（cycle-167 L379 の示唆）の判断、cheatsheets リダイレクト方式（`/` 一律 or 410 Gone）の確定、achievements の StreakBadge 残留判断などが含まれる。

**完了基準**: 1.1 の選択肢 (a)/(b)/(c) が確定し、1.2 の各コンテンツの方針（移行 / 削除）が確定している。

### Phase 2: 道具箱の基盤実装（来訪者向け非公開）

道具箱機能の基盤コードを実装する。来訪者から見える変化はない。

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
     - 実際のツール群（age-calculator 等 30 種、遊び 13 種）を一巡して「1 対多が必要なケースが存在するか」を確認した上で決定する。推測だけで結論を出さない

- **2.2** 基盤実装
  - `Tile` コンポーネント実装（`src/components/Tile/`）：サイズ・配置の規約、ドラッグハンドル、編集モード切替
  - ドラッグ＆ドロップによるタイル配置 UI
  - localStorage によるレイアウト永続化
  - 2.1 の決定に従ってメタ型に「タイルとして表示するためのインタフェース」を追加（タイル用コンポーネント参照、推奨サイズ、入出力型の placeholder 等）
  - 動作検証は hidden な URL（`page.tsx` の `metadata.robots: { index: false, follow: false }` で noindex）または `/storybook` 内のセクションで行う。**来訪者向け公開はしない**

**完了基準**: 道具箱の URL が 1 つに決まっている。メタ型構造（統合 / 分離）が決まっている。ツールとタイルが 1 対多になり得るかが決まっている。決定に応じたタイル対応インタフェースがメタ型に入っている。基盤コードと検証用環境で動作確認できる。来訪者向けの道具箱ページはまだ公開しない。

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

Phase 1.1 で (b) を選んだ場合は、4.1〜4.3 の各リストに検索 / 絞り込みを埋め込む。

トップ（4.4）は現行のトップ内容を新デザインに移行する。Phase 2.1 で「URL=トップ」を採用した場合は Phase 9.2 でこれを道具箱に置き換える。それまではトップは現行内容のまま動く。

**完了基準**: 4 つの主要セクションが `(new)/` 配下で動作し、Header / Footer の動線が新版に統一される。リンク先（記事詳細、ツール詳細など）は移行済みの新ページ or 未移行の legacy ページのいずれでも崩れない。

### Phase 5: 検索の実装

Phase 1.1 の結果による：

- 1.1=(a)：本 Phase で 5.1 を実施
- 1.1=(b)：Phase 4 で済んでいるため本 Phase はスキップ
- 1.1=(c)：本 Phase はスキップ

サブタスク：

- **5.1** 新 search 実装（1.1=(a) のときのみ）
  - 既存の検索ロジック（Fuse.js、`/search-index.json` の fetch、結果整形、GA4 計測）を `src/lib/search/` 配下に切り出して新旧で共有する
  - 新デザイン用 view（Lucide 系アイコン、新ヘッダー余白に合った配置）を `src/components/Search*/` に新規実装
  - `(new)` Header の actions スロットへ結線
  - 旧 `src/components/search/` は当面据え置き、Phase 10 で legacy と同時に削除

検索のみロジックとデザインを別ファイルに分離する。理由：UI のみが新旧で異なり、ロジック層は不変なため。一般的な共通コンポーネントには適用しない（共通コンポーネントは新旧で別実装を基本とする）。

**完了基準**: 新側 Header に新 search が結線され、Cmd+K / Ctrl+K で開く。検索結果から legacy / 新側どちらのページにも正しく遷移する。GA4 `trackSearch` が動作。

### Phase 6: ブログ詳細移行

サブタスク：

- **6.1** `/blog/[slug]`：記事 100+ 件のテンプレ移行

ブログ系（一覧 → 詳細）が Phase 4 → Phase 6 で完結する。

**完了基準**: すべての記事が `(new)/` 配下で表示でき、Article JSON-LD、目次、シェアボタン、関連記事などの既存機能が移行後も動作する。

### Phase 7: ツール・遊び詳細 + タイル化（同時実施）

各コンテンツを 1 つずつ「詳細ページ移行 + タイル定義」を同サイクルで実施。「2 回の作り直し」を避けるための同時実施。

ツール / 遊びそれぞれの順序は、GA4 ページビュー高い順 + 構造単純な順を基本に決定する。

サブタスクを順に：

- **7.1** ツール群の移行 + タイル化（30 ルート、各 1 サイクル）
  - 対象：age-calculator / base64 / bmi-calculator / business-email / byte-counter / char-count / color-converter / cron-parser / csv-converter / date-calculator / dummy-text / email-validator / fullwidth-converter / hash-generator / html-entity / image-base64 / image-resizer / json-formatter / kana-converter / keigo-reference / line-break-remover / markdown-preview / number-base-converter / password-generator / qr-code / regex-tester / sql-formatter / text-diff / text-replace / traditional-color-palette / unit-converter / unix-timestamp / url-encode / yaml-formatter

- **7.2** 遊び群の移行 + タイル化判断（13 ルート + result ページ、各 1 サイクル）
  - 個別ゲーム：animal-personality / character-fortune / character-personality / contrarian-fortune / impossible-advice / irodori / kanji-kanaru / music-personality / nakamawake / traditional-color / unexpected-compatibility / yoji-kimeru / yoji-personality
  - 共通ルート：`/play/daily`、`/play/[slug]`、`/play/[slug]/result`、`/play/[slug]/result/[resultId]`

各サイクルで実施する内容：

1. ロジックの CSS Module を新トークンに置換
2. 詳細ページ（`/tools/<slug>` など）を `(new)/` 配下に移動し DESIGN.md に従ってデザイン適用（後述「1 ページ移行の標準手順」参照）
3. タイル化対象なら、Phase 2.2 で決まった枠組みに沿ってタイル UI を実装する。1 対多サポートが採用された場合は、そのツールについて詳細ページ本体と共用するか / タイル用に別コンポーネントを新設するか / 複数バリエーションを用意するかを判断する。1 対 1 のみの場合は詳細ページの本体をそのままタイルとして使う
4. タイル化対象なら Phase 2.2 で確立したメタ型のタイル対応インタフェースに沿ってタイル定義を埋める
5. タイル化に馴染まないコンテンツ（ブログ的な遊びなど）は詳細ページのデザイン移行のみ行いタイル定義は付けない

**完了基準**: 各コンテンツが `(new)/` 配下で動作し、タイル対応対象は道具箱ページから実コンテンツとしてタイル配置できる。各ロジックの CSS Module から旧 `--color-*` トークン参照が消えている。

### Phase 8: 既存コンテンツ整理の実施

Phase 1.2 で確定した方針に従って実施。

サブタスクを順に：

- **8.1** `/achievements`（単一ページ）
- **8.2** cheatsheets（7 ルート：cron / git / html-tags / http-status-codes / markdown / regex / sql）
- **8.3** 辞典（最大規模、12+ ルート：colors 系・humor 系・kanji 系・yoji 系）

「削除」と決まったルートは UI 移行せず削除のみ。「移行」と決まったルートは Phase 3〜6 と同じ手順で `(new)/` へ移行。

**完了基準**: 8.1〜8.3 の各ルートが「移行された」か「削除された」かのいずれかになっており、`(legacy)/` 配下に該当ディレクトリが残らない。

### Phase 9: 道具箱機能の本実装と公開

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
  - `src/components/search/`（旧版）削除（Phase 1.1=(a) で新版が `src/components/Search*/` に存在する場合のみ。1.1=(b) / (c) では新版自体がないので legacy と一緒に消えるだけ）

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

各ページごとに以下を順に実施。Phase 7 ではタイル対応のステップ 6 が追加される。

1. **依存コンポーネントの確認**: そのページが import している `@/components/common/*` を grep で列挙し、新版が存在するか確認。存在しなければ、共通化すべきかページ密接として扱うべきかを判断
2. **`git mv (legacy)/foo/ (new)/foo/`**: ファイル / ディレクトリを丸ごと移動
3. **import パス修正**: ページ内の `@/components/common/*` を `@/components/*` に置換
4. **CSS Module 内のトークン置換**: `--color-*` 系（旧）→ `--bg` / `--fg` / `--accent` 系（新）に置換。`:root.dark` を使っている箇所は `:global(:root.dark)` に修正（CSS Modules のスコープ問題、`docs/knowledge/css-modules.md` 参照）
5. **DESIGN.md に従ったデザイン適用**: トークン置換だけでは新デザインにならない。`/frontend-design` Skill と `DESIGN.md` を参照し、レイアウト（Panel に収める、余白、グリッド）、タイポ、ボタン / フォームの状態スタイル、ホバー / フォーカス、アイコン（Lucide 系）、a11y（タップターゲット 44px、`focus-visible`、`aria-current`、コントラスト 4.5:1）を新デザイン体系に合わせて再設計する。旧 UI の構造をそのまま維持するのではなく、必要に応じて構造そのものを変える
6. **（Phase 7 のみ）タイル対応**: 詳細ページとタイルの UI 関係性を Phase 2.2 の指針に沿って判断し、必要に応じて表示用コンポーネントの分離 or 共用を行う。Phase 2.2 で確立したメタ型にタイル定義を追加
7. **テスト調整**: 移動後のテストパスや import が壊れていないか確認、`npm test` を当該ファイル範囲で実行
8. **視覚確認**: Playwright で w360 / w1280 のライト / ダーク両モードのスクリーンショットを取り、移行前と比較。移行前と「同等以上」（コンセプトに沿った改善）になっているかを評価。Phase 7 ではタイルとしての表示も道具箱ページで確認
9. **コミット**: 1 ページ 1 コミットを基本（差分が大きい場合は適切に分割）

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
