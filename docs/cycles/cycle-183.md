---
id: 183
description: B-334 Phase 4.3（ブログ一覧の新デザイン移行）を実施する。`/blog`、`/blog/page/[page]`、`/blog/category/[category]`、`/blog/category/[category]/page/[page]`、`/blog/tag/[tag]`、`/blog/tag/[tag]/page/[page]` の 6 ルートを `(new)/` 配下に移行し、DESIGN.md に準拠した新デザインと、タイトル + description + タグ + カテゴリ表示名 + シリーズ表示名（5 系統）を横断するキーワード検索（`?q=`、300ms debounce）+ カテゴリ静的ルート維持型のフィルタを実装する。記事詳細（`/blog/[slug]`）は Phase 6 のスコープとして本サイクルでは触らない。Phase 4 の 3 サイクル目。
started_at: "2026-05-07T19:42:26+0900"
completed_at: null
---

# サイクル-183

このサイクルでは、デザイン移行計画 Phase 4 のうち **Phase 4.3（ブログ一覧）** を実施する。`/blog` 一覧および派生ルート（ページネーション・カテゴリ・タグ計 6 ルート）を `src/app/(new)/` 配下に移行し、新デザイン体系（DESIGN.md）に沿って再設計したうえで、ブログ一覧内の絞り込み機能（タイトル + description + タグ + カテゴリ表示名 + シリーズ表示名の 5 系統を対象とするキーワード検索 + 既存のカテゴリ別 URL ルーティング）を追加する。

Phase 4 全体（4.1 ツール / 4.2 遊び / 4.3 ブログ / 4.4 トップ）は Owner 指示によりサブフェーズごとに独立サイクルとして実施する。本サイクルは Phase 4 の 3 番目のサイクルとなる（4.1 は cycle-181、4.2 は cycle-182 で完了）。

本サイクルの来訪者向け変化は、ブログ一覧の新デザイン適用と検索流入後のページ内絞り込み手段の追加。検索流入で /blog に着地した M1c（AIの日記を読み物として楽しむ人）が興味のあるテーマや書き手の癖でドリルダウンでき、M1b（リピーター）が「前に読んだあの記事」をキーワードで思い出せる状態になる。記事詳細ページ（`/blog/[slug]`）への遷移先は Phase 6 まで legacy 側のままだが、来訪者から見て URL は不変・遷移は問題なく成立する。

なお、Phase 4.3 はサブルート数が多い（一覧本体・ページネーション・カテゴリ × 2 系統・タグ × 2 系統の計 6 ルート、`generateStaticParams` で生成される URL は **44 URL**）。本サイクルでは 6 ルート全てを移行スコープに含む。判断の根拠は §作業内容 と §検討した他の選択肢で詳述する。`/blog/[slug]`（記事詳細）と OGP 画像（B-387）は明示的にスコープ外。

> **規模の数値根拠（researcher レポート整合の方針）**: URL 件数・タグ p2 数などの数値はすべて researcher レポート 3（`tmp/research/2026-05-07-blog-metadata-distribution-survey.md`、最新かつ実体集計付き）を一次情報源として採用する。researcher レポート 1 の旧集計（「タグ p2 = 3」「合計 41 URL」）はレポート 3 の最新統計（「タグ p2 = 6」「合計 44 URL」）と矛盾するため、**より新しく詳細なレポート 3 を採用しレポート 1 の古い数値は採用しない**。詳細内訳は §完了基準 §ルート・基本動作。

## 実施する作業

> **タスク間の独立性と並行可否の方針（表）**: 全体順序の概略は **B-334-3-1 → B-334-3-2 → B-334-3-3 → B-334-3-4 → B-334-3-5 → B-334-3-6 → B-334-3-7** の直列。詳細マトリクスは下表。
>
> | タスク       | 主な編集ファイル                                                                 | 直列必須の前提タスク       | 並行可能なタスク               | 同一 builder 必須の理由                                             |
> | ------------ | -------------------------------------------------------------------------------- | -------------------------- | ------------------------------ | ------------------------------------------------------------------- |
> | B-334-3-1    | `src/app/(legacy)/blog/` → `(new)/blog/`（git mv）                               | なし（先行）               | B-334-3-7（触るファイル独立）  | —                                                                   |
> | B-334-3-2    | `BlogListView.tsx` / `BlogCard.tsx` / `BlogFilterableList.tsx` / 各 CSS（新版）  | B-334-3-1                  | B-334-3-5(a)（純関数テスト）   | 3-2/3/4 は同一ファイル群を重複編集するため別 builder で並行不能     |
> | B-334-3-3    | 同上（カテゴリ・タグナビ + 検索 UI 追加）                                        | B-334-3-2（同一 builder）  | B-334-3-5(a)                   | 同上                                                                |
> | B-334-3-4    | 同上（NEW バッジロジックと並び順）                                               | B-334-3-3（同一 builder）  | B-334-3-5(a)                   | 同上                                                                |
> | B-334-3-5(a) | `newSlugsHelper.ts` / `searchFilter.ts` の純関数テスト                           | B-334-3-2 の関数シグネチャ | B-334-3-2/3/4（別 builder 可） | —（別 builder で並行可）                                            |
> | B-334-3-5(b) | `BlogListView.test.tsx` / `BlogFilterableList.test.tsx` / `BlogCard.test.tsx` 等 | B-334-3-4                  | なし                           | コンポーネント全体の振る舞いテストは実装完了後に同一 builder へ直列 |
> | B-334-3-6    | （視覚検証、コード変更なし）                                                     | B-334-3-5                  | なし                           | PM 自身が実施                                                       |
> | B-334-3-7    | `next.config.ts`                                                                 | なし（先行）               | B-334-3-1（触るファイル独立）  | —                                                                   |
>
> 補足:
>
> - 3-2/3/4 を別 builder で並行アサインすると同一ファイル競合が発生する。これは AP-WF07 が想定する「独立タスクの一括委任」とは逆方向の構造（同一ファイルの並行編集回避）であり、cycle-182 で workflow.md に追記された AP-WF07 の例外条件に従う。
> - 1 builder にまとめて 3-2 + 3-3 + 3-4 を一括依頼するのが最も安全。
> - 3-5(a) は外出し関数のテストのみで、3-2 が関数シグネチャを確定した直後から別 builder で着手可能。
>
> 旧 `BlogListView.tsx` / `BlogCard.tsx` / `TagList.tsx` は legacy 6 ルート全てから import されているため、本サイクル中の新旧並走リスクを避けるため、**ルート移行（B-334-3-1）と新コンポーネント実装（B-334-3-2）を同 commit（commit A）にまとめてアトミックに切替える**。タスク ID 単位ではなく commit 単位で「移行 + 新コンポーネント参照差替え」を 1 トランザクションとして扱う設計（詳細は §10 commit 粒度と rollback 戦略を参照）。B-334-3-2 で実装される新コンポーネント（`BlogListView` 新版 + `BlogFilterableList` + `BlogGrid` + `BlogCard` 新版）を、同 commit 内で 6 ルート全てが参照する。旧 3 ファイルは同 commit 内で同名上書きにより置換される（詳細は §B-334-3-2 末尾を参照）。

- [ ] B-334-3-1: ルート移行（`(legacy)/blog/` 配下の一覧系 6 ルート + `layout.tsx` を `(new)/blog/` に `git mv`。**B-334-3-2 と同 commit（commit A）内で**新コンポーネント（B-334-3-2 で実装する `BlogListView` 新版 + `BlogFilterableList` + `BlogGrid` + `BlogCard` 新版）への参照差し替え。詳細は §B-334-3-1 / §10 commit 粒度）
- [ ] B-334-3-2: BlogListView（Server）/ BlogFilterableList（Client）/ BlogGrid / BlogCard / `newSlugsHelper.ts` / `searchFilter.ts` 等の新規コンポーネント・ヘルパー設計と DESIGN.md 準拠の新デザイン適用、Suspense ラップ、`react-hooks/purity` 回避のための純関数外出し
- [ ] B-334-3-3: カテゴリ・タグナビ + キーワード検索 UI の実装（**B-334-3-2 完了後に同一 builder へ直列依頼**）。タイトル + description + タグ + カテゴリ表示名 + シリーズ表示名の 5 系統を横断する `?q=` 検索、`buildCategoryHref` / `buildTagHref` でのキーワード引き継ぎ、空状態 `role="status"`、ページネーションへの `?q=` 引き継ぎ、aria-current 統一
- [ ] B-334-3-4: NEW バッジ判定ロジック（積集合方式）と `published_at` 降順の単一グリッド適用（**B-334-3-3 完了後に同一 builder へ直列依頼**）。`published_at` （ハイフン区切り）対応の `calculateNewSlugs` 実装
- [ ] B-334-3-5: テスト整備（フィルター・検索・NEW・ページネーション・不正パラメータ・タグページ noindex 閾値・generateStaticParams 整合等の振る舞いテスト）。**(a) 純関数テスト**は B-334-3-2 と並行可能（別 builder 可）、**(b) コンポーネント振る舞いテスト**は B-334-3-4 完了後に同一 builder へ直列
- [ ] B-334-3-6: PM 自身による視覚検証（8 シナリオ × 4 パターン = 32 枚。シナリオ内訳と観測対象は §B-334-3-6 を参照）と完了基準チェック
- [ ] B-334-3-7: `next.config.ts` の `redirects()` に `/blog/tag/[tag]/page/1` → `/blog/tag/[tag]` を追記（既存ギャップの解消、B-334-3-1 と独立して並行可）

## 作業計画

### 目的

`/blog`、`/blog/page/[page]`、`/blog/category/[category]`、`/blog/category/[category]/page/[page]`、`/blog/tag/[tag]`、`/blog/tag/[tag]/page/[page]` の 6 ルートと共有 `layout.tsx` を `(new)/` 配下に移行し、DESIGN.md に準拠した新デザインを適用する。同時に、現状の BlogListView に欠けていた**キーワード検索（タイトル + description + タグ + カテゴリ表示名 + シリーズ表示名の 5 系統を対象、`?q=`、300ms debounce）**を追加し、既存のカテゴリ別静的ルート（`/blog/category/[cat]`）とタグ別静的ルート（`/blog/tag/[tag]`）はそのまま維持して新デザイン下に持ち込む。aria-current の付与、人気タグおよびページネーションの 44px タップターゲット、複数到達経路の明文化など a11y 配慮も Phase 4 の責務として完成させる。

加えて、`/blog/tag/[tag]/page/1` → `/blog/tag/[tag]` のリダイレクト未定義（既存ギャップ）を `next.config.ts` で解消する（既に外部から踏まれている可能性のある URL の 404 化を防ぐ）。

`/blog/[slug]`（記事詳細）は Phase 6（B-335）スコープのため本サイクルでは触らない。一覧 → 詳細リンク先は legacy 側のままだが、URL は不変なので来訪者から見た体験は崩れない。OGP 画像（B-387）も別 backlog のため本サイクルで作らない。

cycle-181 で記録された 21 件の事故報告書、および cycle-182 が R2 で同型再発を起こしながら R3 で確立した「fact-check.md 経由の事実情報転記」「観測対象の事前列挙」「AP-WF07 例外条件の冒頭明示」「視覚検証は PM 自身が実施」のパターンを踏襲する。

### 来訪者価値

論理導出: 「ターゲット yaml のフィールド → ニーズ → 設計要件 → 実装方式」を明示する。ブログ一覧は /tools・/play と来訪者特性が異なる（読み物への動線として機能する）ため、ターゲット選定をゼロから再分析する。

#### 主要 / 副次ターゲット選定の再分析

「主要 / 副次」は二択ではなく、**動線の起点別に独立要件を導出**する（cycle-182 で確立した方式）。yaml フィールドから「/blog 一覧ページに到達する経路」を機械的に書き出すと:

| ターゲット                                                        | /blog 一覧への主動線（yaml から導出）                                                                                                                               | 一覧経由の頻度                                         |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| M1a（特定の作業に使えるツールをさっと探している人）               | yaml の `search_intents` は実用ツール系クエリのみ。`/blog` は `interests` と直接接続しない                                                                          | ほぼ非経由。Header「ブログ」リンクの偶発的クリックのみ |
| M1b（気に入った道具を繰り返し使っている人）                       | (i) ブックマーク → 個別記事に直接 / (ii) ヘッダーナビ「ブログ」→ /blog で全体俯瞰 / (iii) 過去に読んだ記事をキーワードで再到達                                      | (i) は一覧非経由。(ii)(iii) は時々                     |
| M1c（AIの日記を読み物として楽しむ人）                             | yaml の `search_intents`「AI 日記」「AI ブログ 個人」「AI エッセイ」「ChatGPT 日記」「AI 運営 サイト」のすべてが `/blog` を着地点とする検索クエリ                   | **流入の主経路として一覧を経由する**（一覧が玄関口）   |
| M1d（AIエージェントやオーケストレーションに興味があるエンジニア） | `search_intents`「Claude Code 使い方」「AIエージェント ワークフロー」等は記事詳細（`ai-workflow` カテゴリの個別記事）に直接ヒットする可能性が高い。一覧経由は補助的 | 一覧は副経路（カテゴリ絞り込みで関連記事を探す用途）   |
| M1e（Webサイト製作を学びたいエンジニア）                          | `search_intents`「Next.js 設計パターン」「Markdown 書き方」等は `dev-notes`/`tool-guides` カテゴリの個別記事にヒットする可能性が高い。一覧経由は補助的              | 一覧は副経路（同上）                                   |

**結論**: /blog 一覧の**主要ターゲットは M1c（AIの日記を読み物として楽しむ人）**、副次として M1b の「俯瞰用途」+ M1d/M1e の「カテゴリでの周辺記事探索」を支える。この結論は yaml の `search_intents` フィールドを機械的に走査して導出された（PM の感覚ではない）。M1c の `search_intents` 5 個全てが /blog 着地クエリで、これは他のターゲットには見られない強い動線シグナル。

サイト内一貫性は M1b の `likes`「サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること」、および M1c の `likes`「書き手の癖や語り方が記事をまたいで一貫しており、個として認識できること」（一貫性への高感度）から共通要件として独立に導出される。/tools・/play で確立した「タブ的フィルタ + キーワード検索 + 単一グリッド」の規約と整合させることで、両ターゲット共通の一貫性要件を満たす。

#### M1c（AIの日記を読み物として楽しむ人）— 主要ターゲット

- `interests`「AI が自分の視点で書く、等身大の日々の記録や試行錯誤」「記事を書いた AI の『中の人らしさ』」:
  - → 設計要件: 検索流入で /blog に着地した直後、ファーストビューで「複数の記事カードが並び、それぞれにタイトル・短い要約・タグが見える」状態で、書き手の言葉遣いや観察対象の細部が**カード単位で滲む**こと。1 記事だけのヒーロー扱いは M1c の興味（一気に複数を眺めて気配を掴む）と相性が悪い。
  - → 実装方式: 単一グリッド + カード内に `description`（77〜164 文字）を 3 行クランプで表示し、タイトルだけでなく書き出しのトーンが見えるようにする。
- `likes`「作業や出来事の具体的な細部が書かれており、そこに視点が宿っていること」「書き手の癖や語り方が記事をまたいで一貫しており、個として認識できること」:
  - → 設計要件: タグ（「失敗と学び」「Claude Code」「ワークフロー連載」など 33 種）でドリルダウンできる動線を残し、書き手のテーマ性を辿れる経路を確保する。
  - → 実装方式: 既存の `/blog/tag/[tag]` 静的ルートを維持し、新デザインに移行する。3 件以上のタグが個別ページを持つ構造（26 タグ）は来訪者にとっての「テーマで読み返す」動線として機能しているため、URL を壊さない。
- `dislikes`「『いかがでしたか』『まとめると』のような、AI に頻出する定型的な締め方」「絵文字や『！』の多用で感情を演出しようとする文章」:
  - → 設計要件: 一覧ページ自体のヒーローバナーやリード文も「定型的な煽り」を含めない。装飾絵文字・「！」を使わない。
  - → 実装方式: DESIGN.md §3 の絵文字禁止と整合。リード文は淡々とサイトの内容を述べる方向で（具体文言は builder 判断）。
- `search_intents`「AI 日記」「AI ブログ 個人」「AI エッセイ」「ChatGPT 日記」「AI 運営 サイト」:
  - → 設計要件: ページ内検索でのキーワード打鍵（「日記」「エッセイ」「失敗」など）が、タイトル・description・タグ・カテゴリ表示名のいずれかを横断して当たる。M1c がページ内で再検索する際の打鍵語と検索対象フィールドのズレを最小化する。
  - → 実装方式: `?q=` で `title` + `description` + `tags`（配列要素を join 検索） + `CATEGORY_LABELS[post.category]`（カテゴリ表示名「開発ノート」「AIワークフロー」等） + `SERIES_LABELS[post.series]`（シリーズ表示名「AIエージェント運用記」「Next.js実践ノート」「日本語・日本文化」、`post.series` がある記事のみ）の 5 系統を横断検索。slug および `series` の id 文字列は対象に含めない（M1c の打鍵語と乖離する）。

#### M1b（気に入った道具を繰り返し使っている人）— 副次ターゲット（俯瞰用途・記事再訪）

- `doesnt_know`「このサイトにある他のツールの全体像」 + `interests`「自分の興味に合わせて最適な道具を選ぶこと・整えること」:
  - → 設計要件: /blog 一覧でも全体俯瞰が可能（カテゴリ件数表示、人気タグ表示）。M1b は時々ヘッダー「ブログ」を踏んで全体把握する。
  - → 実装方式: カテゴリナビにカウントバッジ表示（旧 BlogListView と同様）。人気タグ Top 8 を「フィルタ未適用かつタグページでない」場合のみ表示する条件は維持。
- `likes`「サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること」「ブックマークしたURLを開けばすぐ目的のツールが表示されること」:
  - → 設計要件: 既存 URL（`/blog`、`/blog/category/[cat]`、`/blog/tag/[tag]`、`/blog/page/[n]` 等）を保持。新デザイン下でも sitemap に掲載済みの 44 URL（generateStaticParams 生成数、内訳は §完了基準 §ルート・基本動作）が動作する。
  - → 実装方式: ルート構造を維持。`git mv` のみでデザインを差し替える。
- `dislikes`「URLが変更されたコンテンツにリダイレクトが設定されておらずたどり着けなくなること」:
  - → 設計要件: `/blog/tag/[tag]/page/1` も含めて、過去に外部リンクされた可能性のある URL を漏れなくハンドルする。
  - → 実装方式: B-334-3-7 で `/blog/tag/[tag]/page/1` → `/blog/tag/[tag]` のリダイレクトを追記（既存の `/blog/page/1` および `/blog/category/:cat/page/1` と同型）。

#### M1d（AIエージェントやオーケストレーションに興味があるエンジニア）— 副次ターゲット（カテゴリでの探索）

- `interests`「Claude Code などの AI ツールの基本的な使い方」「AIエージェントの実例・運用ノウハウ」:
  - → 設計要件: `ai-workflow` カテゴリ（16 記事）に直接動線を伸ばす経路として、カテゴリリンクとカウント表示を維持する価値がある。一覧 UI 上では、カードに**カテゴリラベル**（`AIワークフロー` 等）と**主要タグ**（「Claude Code」「AIエージェント」「ワークフロー連載」等）が見えることで、M1d が「自分の関心領域に該当する記事か」を一瞥で判別できる。
  - → 実装方式: `BlogCard` にカテゴリラベルを表示。タグは `TagList` で記事ごとに最大 N 個表示（N は builder 判断、人気順 or 出現順は frontmatter の配列順踏襲）。
- `dislikes`「実体験のない抽象論や体裁だけ整えた記事」:
  - → 設計要件: カードの description（77〜164 文字）が**冒頭の具体性で「中身がある記事か」を判定可能な情報量**を持っていること。1〜2 行の煽り文ではなく具体的な観察を冒頭に置く 3 行クランプが必要。
  - → 実装方式: `BlogCard` で description を 3 行クランプ表示（短すぎると判定不能、長すぎるとカードが縦長すぎる）。
- `search_intents`「Claude Code 使い方」「AIエージェント ワークフロー」「Claude Code 自動化」等:
  - → 設計要件: これらの打鍵語は記事詳細（`ai-workflow` カテゴリの個別記事）に直接ヒットする可能性が主だが、外部検索エンジン経由で `/blog/category/ai-workflow` に着地する経路も存在しうる。M1d がカテゴリページに着地した直後、(i) URL が壊れず保持されていること、(ii) 着地後に「Claude Code」「ワークフロー」等のキーワードで再検索して関連記事に絞り込めること、の両方を満たす必要がある。
  - → 実装方式: §検討 §1 で採用したカテゴリ静的ルート維持により URL 保持を担保し、§B-334-3-3 のキーワード検索（5 系統）で再検索を可能にする。`SERIES_LABELS` には「AIエージェント運用記」が含まれるため、シリーズ表示名を検索対象に含めることで、M1d が「AIエージェント 運用」のような連載横断の語で検索しても、シリーズ所属記事 13 件を一括で掬える。
- → 既存 URL の SEO 整合性: 既存のカテゴリ別 URL（`/blog/category/ai-workflow` 等）は SEO インデックス済みであり、検索流入経路として保持されている可能性が高い。詳細は §検討した他の選択肢 §1。

#### M1e（Webサイト製作を学びたいエンジニア）— 副次ターゲット（カテゴリでの探索）

- `interests`「Next.js / React / TypeScript の実装ノウハウ」「個人開発の試行錯誤」 + `likes`「自分のプロジェクトに取り入れられる具体的なノウハウやアイデア」:
  - → 設計要件: `dev-notes` カテゴリ（23 記事）が主要な動線。M1e が「具体ノウハウのある記事か」を**カード時点で判定**できること。タイトル + description だけでなく、技術用語（「hydration」「Suspense」「Next.js」等）が**タグまたは description に**現れていることが識別性の鍵。
  - → 実装方式: `BlogCard` で description 3 行クランプを必須にし、タグ表示で技術キーワードを補強。タイトル前方一致型のスコアリングは Phase 5 横断検索（B-331）に委ねる。
- `dislikes`「実装コードが省略されすぎていてコピペで動かない記事」「結論ありきで根拠のない記事」:
  - → 設計要件: 一覧から記事詳細への遷移コストが低いこと。カード全体がクリッカブルで、タイトル / カテゴリ / タグ / description のどこをクリックしても遷移できる（builder が `<a>` ネスト回避と両立する形で実装）。
  - → 実装方式: B-334-3-2 の `BlogCard` 設計（カード全体を `<Link>` でラップするか、`<article>` 内の主要領域を `<Link>` でカバーするか）で吸収。タグリンクとのネスト回避は HTML 仕様上必須なので builder 判断を委譲。
- → 既存 URL の SEO 整合性: M1d と同じ。`/blog/category/dev-notes` の SEO インデックス保持は §検討した他の選択肢 §1 を参照。

#### サイト内一貫性（M1b / M1c 共通の `likes` から導出）

- M1b `likes`「サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること」: yaml に明示。
- M1c `likes`「書き手の癖や語り方が記事をまたいで一貫しており、個として認識できること」: 一貫性への感度は高い。
- → 設計要件: /tools・/play で確立したフィルタ UI 規約（`<Link>` + `aria-current="page"` + `data-active`、debounce 300ms 検索、`role="status"` 空状態、カード等高、badges 行 min-height）を /blog でも踏襲する。
- → 実装方式: cycle-181/182 のパターンを継承（具体は §作業内容）。

### 作業内容

各タスクは「何を達成するか」「なぜそうするか」「どんな最終状態を目指すか」で記述する。JSX/CSS の literal は指定しない（builder の判断余地を残す）。

#### B-334-3-1: ルート移行

- **何を**:
  - 6 ルート（`page.tsx` / `page/[page]/page.tsx` / `category/[category]/page.tsx` / `category/[category]/page/[page]/page.tsx` / `tag/[tag]/page.tsx` / `tag/[tag]/page/[page]/page.tsx`）と `layout.tsx` を `(legacy)/blog/` から `(new)/blog/` へ `git mv` で移動。
  - 移動と同 commit 内で、各 page.tsx の import を旧 `BlogListView` から新 `BlogListView`（B-334-3-2 で実装）に切替える。各 page.tsx の責務（`generateStaticParams` / `generateMetadata` / `getAllBlogPosts` 呼び出し / Breadcrumb JSON-LD など）はそのまま新ルートに持ち込む。
  - `(legacy)/blog/__tests__/pagination-redirect.test.ts` と `tag-page.test.ts` の import パスを `(new)/blog/...` に追従。新構造の振る舞いに対する追加テストは B-334-3-5 で行う。
- **なぜ**: 6 ルートが共通の `BlogListView` を参照する構造のため、ルート移行とコンポーネント差し替えを別 commit に分けると新旧並走中に「旧コンポーネントが新ルートから参照される」「新コンポーネントが旧ルートから参照される」といった整合不能状態が発生する。アトミックに差し替える。
- **最終状態**:
  - 6 ルートが `(new)/blog/` 配下から HTTP 200 を返す。URL は不変。
  - `layout.tsx` は現状 passthrough（`<>{children}</>`）のため `(new)/blog/layout.tsx` に移すか、`(new)/layout.tsx` の共通レイアウトに吸収して削除するかは builder 判断（現状で固有スタイルを持たないため、削除しても来訪者に影響なし。cycle-182 同様 `(new)/play/layout.tsx` は置かなかった先例あり）。
  - `(legacy)/blog/__tests__/` の 2 テストは新ルートを参照するように更新。テスト assertion 自体は新構造（B-334-3-2 以降の振る舞い）に追従するため、本タスクでは import 追従のみ。本格的な assertion 書き換えは B-334-3-5。
  - `(legacy)/blog/[slug]/` および `(legacy)/blog/[slug]/__tests__` は **触らない**（Phase 6 スコープ）。
  - `src/app/sitemap.ts` の参照は登録ロジック（`getAllBlogPosts()` 等）経由のため変更不要（cycle-181 と同様）。
- **触らない範囲（事実、`ls` で実体確認済み）**:
  - `src/app/(legacy)/blog/[slug]/`（記事詳細、Phase 6 スコープ）
  - `src/app/(legacy)/blog/[slug]/__tests__/`
  - `src/blog/_lib/blog.ts` 内の関数群（`getAllBlogPosts`、`getPostsByTag`、`getTagsWithMinPosts`、`ALL_CATEGORIES`、`CATEGORY_LABELS`、`CATEGORY_DESCRIPTIONS`、`TAG_DESCRIPTIONS`、`MIN_POSTS_FOR_TAG_INDEX` など）。新コンポーネントからもそのまま使う。
  - `src/blog/content/` 配下の記事 59 件（frontmatter 構造を変更しない）。

#### B-334-3-2: 新デザイン適用とコンポーネント設計

- **何を**: `BlogListView`（Server Component）→ `<Suspense>` ラップ → `BlogFilterableList`（Client Component）→ `BlogGrid` → `BlogCard` の 4 層に分割する（cycle-181 ToolsListView / cycle-182 PlayListView と同型）。配置場所は `src/blog/_components/`（既存の同名ファイルを置換える）。
- **なぜ**: `useSearchParams` を使うフィルタ部分のみ Client Component に閉じ、ページ本体（`generateStaticParams`、metadata、Breadcrumb JSON-LD など）は Server Component に保つ。Suspense ラップは Next.js が要求する仕様要件（欠落するとビルド失敗）。Server Component に閉じれば 44 URL の静的生成も維持できる。
- **最終状態**:
  - **Suspense ラップ**: `BlogListView` 内で `<Suspense>` を使って `BlogFilterableList` をラップする（cycle-181/182 で確立済みの構造）。
  - **責務の境界**:
    - `BlogListView`: 各 page.tsx から呼ばれ、`posts` / `currentPage` / `totalPages` / `basePath` / `activeCategory` / `allPosts` / `tagHeader` を受け取り、ヒーロー（タイトル・description）、`<Suspense>` でラップした `BlogFilterableList`、`Pagination` を描画する。`Pagination` は既存の `src/components/Pagination/index.tsx`（new 側）を使う。`src/components/common/Pagination.tsx`（legacy 側）への参照は新コンポーネントから切る。
    - `BlogFilterableList`（"use client"）: カテゴリナビ + キーワード検索入力 + `BlogGrid` を描画。タグページ（`tagHeader` 指定時）はカテゴリナビではなくタグヘッダー（パンくず + タグ名 + タグ説明）を出す。人気タグは「フィルタ未適用かつタグページでない」場合のみ表示。`?q=` のローカル state + 300ms debounce + `router.replace` で URL に反映。
    - `BlogGrid`: `role="list"` グリッド。各カードに `role="listitem"`。
    - `BlogCard`: カテゴリラベル / 日付 / 読了時間 / タイトル / description（3 行クランプ） / NEW バッジ / TagList を描画。カード全体を `<Link>` でクリッカブルにするか、`<article>` 内の一部のみ `<Link>` に留めるかは builder 判断（タグリンクと記事リンクのネスト回避が論点。HTML 仕様上 `<a>` の中に `<a>` は不可）。
  - **タイポグラフィ**: 16px 以上、行間 1.7、絵文字なし、Lucide アイコンも原則なし（DESIGN.md §3）。タイトルは最大 69 文字、description は 77〜164 文字を想定（researcher レポート 3 §10）。**カード高さが揃う制御方式は builder が選択**（行数クランプ・最大高さ指定・グリッド整列のいずれでも、観測可能な等高が達成されればよい）。
  - **トークン使用**: `--bg`/`--fg`/`--fg-soft`/`--border`/`--accent`/`--accent-soft`/`--accent-strong`/`--r-normal`（カード）/`--r-interactive`（ボタン・入力）。
  - **NEW バッジヘルパー外出し**: `src/blog/_components/newSlugsHelper.ts` を新設し、`calculateNewSlugs(posts: BlogPostMeta[], now: number): ReadonlySet<string>` を純関数として定義。`BlogPostMeta` の日時フィールドは `published_at`（ハイフン区切り、文字列型）であることに注意（tools/play は `publishedAt` キャメルケース）。本タスクでは関数シグネチャと空実装を先に確定し、ロジックの本実装は B-334-3-4 で完成させる（B-334-3-5 (a) の純関数テストを別 builder に並行依頼可能にする前提）。
  - **検索フィルタ純関数の外出し**: `src/blog/_components/searchFilter.ts` を新設（cycle-181 の `src/tools/_components/newSlugsHelper.ts` / cycle-182 の `src/play/_components/newSlugsHelper.ts` と同じ「`_components/` 直下にヘルパー純関数を配置」の習慣に揃える、`find src/{tools,play} -name "newSlugsHelper*"` で実体確認済み。ファイル名は builder 判断で多少の調整可だが、配置場所は `src/blog/_components/` 直下を維持）。`filterPostsByKeyword(posts, keyword): BlogPostMeta[]` を純関数として定義。タイトル + description + タグ配列 + カテゴリ表示名（`CATEGORY_LABELS`）+ シリーズ表示名（`SERIES_LABELS`、`post.series` がある記事のみ）の **5 系統**を横断検索。大文字小文字不区別。空キーワードは全件返す。`shortTitle` 等は frontmatter に存在しないため対象外。slug および `series` の id 文字列も対象外（M1c の打鍵語と乖離。詳細は §検討した他の選択肢 §2）。本タスクでは関数シグネチャと空実装を先に確定し、ロジック本実装は B-334-3-3 で完成させる。
  - **カード等高**: `height: 100%; box-sizing: border-box;` を採用（cycle-181 R3-1 / cycle-182 で確立）。
  - **badges 行 min-height**: NEW バッジの有無で見出し位置がズレないよう、バッジ行に固定 min-height を設ける（cycle-181 R3-4）。バッジ有無の混在を視覚検証で確認。
  - **既存ファイルの処遇**: 既存の `src/blog/_components/BlogListView.tsx` / `BlogCard.tsx` / `TagList.tsx` / `BlogListView.module.css` / `BlogCard.module.css` / `TagList.module.css` は本サイクル中に**置換える**（同名ファイルを上書き）。理由: (i) 6 ルート全てが新コンポーネントを参照するように B-334-3-1 で切替えるため、旧版を別名で残しておく必要がない、(ii) 別名 `BlogListViewNew.tsx` 等で新版を作ると旧名のまま残る BlogListView.tsx を削除する別 commit が必要になり整合タイミングが複雑化、(iii) git の履歴は同名ファイルでも `git log -p` で追えるため移行履歴は失われない。`MermaidRenderer.tsx` / `RelatedArticles.tsx` / `SeriesNav.tsx` / `TableOfContents.tsx` は記事詳細ページ用のため**触らない**。**`src/blog/_components/__tests__/MobileToc.test.tsx`**（本体ファイル `MobileToc.tsx` は `_components/` 直下に存在せず、孤立テストの可能性あり、`ls` で実体確認済み）も記事詳細ページ用のため**触らない**（本体ファイルの所在および孤立判定の調査は Phase 6 = B-335 のスコープに含まれる）。
  - **既存テスト `src/blog/_components/__tests__/BlogListView.test.tsx` の処遇**: 旧 BlogListView の構造（カテゴリ Link、人気タグリスト、Pagination）を直接 assertion しているため、import パス追従だけでは全テストが落ちる可能性が高い。**本サイクルでは BlogListView.test.tsx 旧版を削除し、B-334-3-5 で新構造に対する `BlogListView.test.tsx` / `BlogFilterableList.test.tsx` / `BlogCard.test.tsx` を新規作成する**（cycle-182 で `(legacy)/play/__tests__/page.test.tsx` を廃止した先例と同じ判断）。`TagList.test.tsx` は新 TagList の振る舞いに整合する範囲で残置（builder が確認）。

#### B-334-3-3: カテゴリ・タグナビとキーワード検索 UI

- **何を**:
  - 単一グリッドの上に、カテゴリ絞り込みナビ（`<Link>` ベース）とキーワード検索入力（`@/components/Input`）を配置する。
  - タグページ（`/blog/tag/[tag]`、`/blog/tag/[tag]/page/[n]`）では、カテゴリナビの代わりにタグヘッダー（パンくず + タグ名 + タグ説明）を出し、キーワード検索入力は維持する。
  - 人気タグ Top 8（フィルタ未適用かつタグページでない時のみ表示）を維持。
- **なぜ**: M1c の `search_intents`（「AI 日記」「AI エッセイ」等）が `/blog` 着地後にページ内で再検索する打鍵語に直結する。M1b/M1d/M1e の補助動線（カテゴリで探索、タグでテーマ別ドリルダウン）は既存 URL 維持で担保する。サイト内一貫性は cycle-181/182 と同型 UI で。
- **最終状態（カテゴリ絞り込み）**:
  - 「すべて / 開発ノート / AIワークフロー / サイト更新 / ツールガイド / 日本語・文化」の 6 リンク（`CATEGORY_LABELS` の表示名を踏襲）。各リンクには記事件数バッジを表示（旧 BlogListView 踏襲）。
  - 実装は `<Link href="/blog/category/[cat]">` + `aria-current="page"` + `data-active="true"`（cycle-181 R5 / cycle-182 で確立した方針）。**`?category=` クエリパラメータ方式には変更しない**（理由は §検討した他の選択肢 §1）。
  - 「すべて」リンクは `/blog`（`activeCategory === undefined`）。
  - 検索キーワードがある状態でカテゴリリンクをクリックすると、遷移先 URL の query string に `?q=...` を引き継ぐ（`buildCategoryHref(category, currentKeyword)` 相当）。
  - aria-current は active 時のみ付与。data-active も同時に付与（CSS 制御用）。
- **最終状態（タグナビ・タグページ）**:
  - 人気タグ Top 8 リンクは現行同様、フィルタ未適用かつタグページでない時のみ表示。各リンクは `<Link href="/blog/tag/[tag]">`（生のタグ名、Next.js が自動でパーセントエンコード）。
  - タグページでは `tagHeader` を表示（`<Breadcrumb>` 風: ブログ → タグ → タグ名 + 説明）。
  - タグページでも `?q=` 検索は機能する（タグ絞り込み済みの結果に対してさらにキーワード検索）。
  - 検索キーワードがある状態でタグリンクをクリックすると、`?q=...` を引き継ぐ（`buildTagHref(tag, currentKeyword)` 相当）。
  - **タグリンクの 44px タップターゲット**: 一覧ページで密集するのは (a) 人気タグ Top 8 のリンク群と (b) 各 BlogCard 内の TagList（記事あたり平均 3.95 タグ）の 2 種類のみ。タグ全件 33 タグを 1 画面にリストする UI は本サイクルで作らない。これら **(a) 人気タグ Top 8 のリンク群および (b) 各 BlogCard 内の TagList の各タグリンク**に `min-height: 44px` を個別 CSS クラスで保証する。なお、タグページ内のタグリンク（隣接タグ・関連記事内のタグ等）が将来追加された場合も同方針を継承する。B-386 を待たず本サイクルで個別上書き（AP-I02 抵触の継承、cycle-181/182 と同方針）。
- **最終状態（キーワード検索）**:
  - 入力欄は `@/components/Input` を使う（DESIGN.md §5）。配置はカテゴリ絞り込みナビの近傍。
  - URL パラメータ: `?q=...`。空文字は `?q=` を付けない。
  - 入力反映: ローカル state は即時、URL は 300ms debounce で `router.replace`（cycle-181 R4 / cycle-182 で確立）。`router.push` は履歴汚染、debounce なしはキーストローク取りこぼし & Playwright デッドロックを引き起こす。
  - URL → state 追従の `useEffect` も実装（ブラウザ戻る対応、cycle-181 R3-2 で確立）。
  - **検索対象フィールド（PM 決定）**: `title` + `description` + `tags`（配列要素を join 検索） + `CATEGORY_LABELS[post.category]`（カテゴリ表示名） + `SERIES_LABELS[post.series]`（シリーズ表示名、`post.series` が存在する記事のみ）の **5 系統**。`slug` / `series`（id 文字列） / `series_order` / `related_tool_slugs` は対象外。理由は §検討した他の選択肢 §2 を参照。大文字小文字不区別（実装方式は builder 判断）。
  - **検索結果のページネーション挙動（PM 決定、計画段階の Bash 実測に基づく）**: ページネーション中（例: `/blog/page/3`）にキーワード検索を行うと、フィルタ結果は「page slice 後の 12 件のみ」を対象にすると来訪者に「ヒット数が少ない」「期待した記事が見つからない」と誤解させる。**キーワード検索が効いている間（`?q=` がある間）は、ページネーションを無効化し、フィルタ後全件を 1 ページに表示する**。`?q=` がない場合は通常のページネーション動作。
  - **検索ヒット件数の実測（Bash で 59 記事の title + description + tags + カテゴリ表示名を結合した検索対象テキストに対し `grep -c -i` で集計）**:

    | 検索語         | ヒット件数 | 検索語            | ヒット件数 |
    | -------------- | ---------: | ----------------- | ---------: |
    | 設計           |     **34** | 失敗              |         10 |
    | AI             |         20 | 学び              |          9 |
    | サイト         |         19 | 更新 / TypeScript |          8 |
    | ツール         |         17 | テスト / Claude   |          6 |
    | ワークフロー   |         16 | レビュー / ブログ |          2 |
    | 実装 / Next.js |         15 | デザイン          |          1 |

    > 表記の補足: 「実装 / Next.js」「更新 / TypeScript」「テスト / Claude」「レビュー / ブログ」は**同件数の 2 語を `/` で区切って圧縮表記**している（例: 「実装」「Next.js」は両方とも 15 件ヒット）。該当行のヒット件数は両方の検索語に共通の値。

    最大ヒットは「設計」34 件（59 記事の 58%）、中央値は約 15 件。代表的な打鍵語でのヒットは 15〜20 件のバンドが厚く、「設計」「AI」のような汎用大ヒット語ではカードが 30 枚以上 1 ページ縦並びとなり、画面長大化リスクがある。なおシリーズ表示名（5 系統目、MJ-B 対応で追加）を加えても、Bash 実測では「実践ノート」9 件 / 「運用記」13 件 / 「日本語・日本文化」5 件で**いずれも最大値 34 件を更新しない**ため、ヒット件数の上振れ想定は変更不要。

  - **画面長大化への対応（実測に基づく追加要件）**:
    1. **ヒット件数表示はヒット 1 件以上の時のみ表示（MJ-C 対応）**: 検索ヒット件数を画面上部（カードグリッドの直前）に明示的に表示する。表示条件は **`?q=` がある かつ ヒット件数 ≥ 1** の場合のみ。**0 件時は件数表示要素を描画せず、空状態 status メッセージに情報を一本化する**（後述「0 件時の表示方針」）。文言・レイアウトは builder 判断。観測可能性: ヒット ≥ 1 件時に件数を含む数値表示要素が可視で存在し、`aria-live="polite"` の更新通知で入力に応じて再読み上げされること。
    2. **ページネーション無効化の方針は維持**: ヒット件数が 34 件に達するケースでも、検索中はページネーションを噛ませず縦スクロールに任せる（来訪者の認知モデル「全件中のヒットを一覧したい」と整合）。スコアリング（タイトル前方一致優先 / タグ完全一致優先）は本サイクルでは**採用しない**（理由: 59 記事規模では全件可視性のほうが優先で、ランキング操作は来訪者の予測可能性を下げる。M1c の `dislikes`「定型的な誇張」とは別軸だが、検索結果に並び替えロジックを持ち込むと「なぜこの順序なのか」の説明責任が発生する。Phase 5 横断検索 B-331 の Fuse.js 導入時に再検討）。
    3. **検索結果は `published_at` 降順を維持**: フィルタ前のソート順をそのまま継承（B-334-3-4 で実装）。来訪者が「最新の関連記事から眺める」モデルに合致。

- **0 件時の表示方針（MJ-C 対応、選択肢 (a) を採用）**:
  - **採用案**: ヒット件数表示は **>0 件の時のみ** 出し、**0 件時は件数表示を非表示にして空状態メッセージ 1 本に集約する**。
  - **`aria-live` 配置**: 件数表示には `aria-live="polite"` を付与（≥1 件時の入力に応じた件数更新を読み上げ）、空状態メッセージには `role="status"` を付与（暗黙の `aria-live="polite"` 相当）。**両者は同時には DOM に存在しない**ため、二重読み上げは構造的に発生しない（条件分岐で片方のみ描画）。
  - **棄却した案**:
    - **案 (b)（件数表示は常に出し、空状態と併存。`aria-live` は片方のみ付与で重複読み上げ回避）**: 0 件時に「ヒット件数 0 件」「該当記事はありません」が画面上に並ぶことになり、視覚的にも冗長で来訪者に「同じ情報が 2 回出ている」違和感を与える。`aria-live` を片方に絞ってもスクリーンリーダー以外（晴眼者・タッチ操作者）には冗長性が残る。
    - **案 (c)（件数表示と空状態を 1 つの UI 要素に統合）**: 「ヒット 0 件・◯◯を試してみてください」のような複合メッセージは、ヒット ≥ 1 件時のミニマルな件数表示（例: 「15 件」）と 0 件時の長文空状態（次アクション提示込み）が同一要素として実装上ぎこちない。文言の主従関係も曖昧になる。
  - **採用理由（来訪者価値・実装の素直さ・a11y の三軸）**:
    - **来訪者価値**: 0 件時は「件数の絶対値（0）」より「次に何をすればよいか」が来訪者にとって優先情報。空状態 status に集約することで、視線が次アクションに誘導される。
    - **実装の素直さ**: 件数表示と空状態の責務が「ヒットがある時の状況把握」と「ヒットがない時の救済導線」で明確に分かれ、条件分岐が 1 箇所で済む。
    - **a11y**: 二重読み上げが構造的に発生しない（DOM に同時存在しない）。`role="status"` と `aria-live="polite"` は別要素で意味的に独立。

- **空状態**: `role="status"` 付きメッセージで (i) 該当記事が 0 件であること、(ii) 次に取れるアクション（キーワードを変える / カテゴリを切り替える / タグを外す のいずれか以上）が伝わる文言を表示する。具体文言は builder 判断（M1c の `dislikes`「定型的な締め方」を回避するため、PM は literal を確定しない）。タグページ + 0 件の場合は文脈に合った自然な日本語にしてもよい（builder 判断）。0 件時はヒット件数表示は描画しない（上記「0 件時の表示方針」）。
- **a11y**:
  - `<nav aria-label="カテゴリで絞り込む">` でカテゴリナビをラップ。`<nav aria-label="人気タグ">` で人気タグをラップ。
  - 全インタラクティブ要素に `min-height: 44px`（カテゴリリンク、タグリンク、検索入力、ページネーションリンク）を個別上書きで保証（B-386 未着手のため）。
  - focus-visible は DESIGN.md §2 末尾のフォーカススタイル規約に準拠。
  - **`<Pagination>` の a11y**: 既存の `src/components/Pagination/index.tsx` の a11y（`aria-label`、`aria-current="page"`、リンクの 44px）を builder が確認し、不足があれば本タスクで個別ページ側 CSS で上書き（コンポーネント本体の修正は B-386 系の別サイクル）。

#### B-334-3-4: NEW バッジと並び順

- **NEW バッジ判定方式**: cycle-181/182 と同じ「上位 5 件 × 直近 30 日の積集合」を採用する。
  - 上位 5 件: `published_at` 降順で先頭 5 件。
  - 30 日条件: `now - new Date(published_at).getTime() < 30 日`。
  - 両方を満たすスラッグ集合を Server Component で `Date.now()` を渡して計算し、Client Component に prop で渡す（`react-hooks/purity` 回避策）。
- **理由**: cycle-181/182 でこの判定方式の妥当性は検証済み（陳腐化防止 + 大量追加時の過多防止 + 中身の更新停止時の自動消失）。サイト全体での NEW バッジ意味の一貫性（M1b の `likes`「サイト内の操作性・トーンの一貫性」、M1c の `likes`「書き手の癖の一貫性」）も担保される。
- **追加頻度の実測**: researcher レポート 3 §4 で確認済み。直近 30 日以内の記事は **5 件**（2026-04-22〜2026-05-05）。`stop-piling-rules-give-ai-its-wish.md`、`nextjs-multiple-root-layouts-for-gradual-design-migration.md`、`scroll-lock-reference-counter-for-multiple-components.md`、`nextjs-global-not-found-for-multiple-root-layouts.md`、`yaml-implicit-type-conversion-quote-everything.md`。**5 件 × 30 日の積集合で 5 件全てに NEW バッジが付く想定**。視覚検証では実機で確認可能（cycle-181/182 と異なり、視覚検証時の Date 巻き戻し手段は不要。なお、テストでは別途 fake timers で 30 日境界条件を再現する。§B-334-3-5 のモック方針を参照）。
- **並び順**: 全件を `published_at` 降順で表示する。
  - 理由（M1c 主要 / 動線整合）: M1c が検索流入で /blog に着地した直後、まだページ内検索/フィルタを使う前のファーストビューで**最新の記事から順に並ぶことで、書き手の「いまの言葉」「最近の試行錯誤」がまず視界に入る**。これは M1c の `interests`「AI が自分の視点で書く、等身大の日々の記録や試行錯誤」と直接接続する。書き手の「現在進行形の観察」がまず提示されることで、M1c の `likes`「淡々と自分の観察を積み重ねる語り口」が時間軸付きで見える。
  - サイト内一貫性: cycle-181/182 と並び順を揃え、M1b の一貫性要件を担保。
  - 副次への影響: M1d/M1e は外部検索からの直接着地が主動線で、一覧ソート順の影響は副次的。
- **既存挙動との差分**: 旧 BlogListView は `getAllBlogPosts()` の返り値順（ライブラリ側で publishedAt 降順）に依存。新版でも `published_at` 降順は維持。フィルタ後のソートが安定して降順であることを B-334-3-5 でテスト。

#### B-334-3-5: テスト整備

- **何を**: cycle-181/182 で確立したテスト構成を踏襲し、新コンポーネント単位で振る舞いテストを書く。
- **対象テスト項目（builder が assertion 文言と書き方を判断、PM は「何を確認すべきか」止まり）**:
  - **(a) 純関数テスト（B-334-3-2 と並行可能）**:
    - `newSlugsHelper.ts` の `calculateNewSlugs(posts, now)`: (i) 30 日以内 × 上位 5 件の積集合が正しく計算される、(ii) 30 日超過のものは除外（境界 = 30 日ジャストでの境界条件）、(iii) 公開記事が 5 件以下のとき全件返る、(iv) 上位 5 件の選定が `published_at` 降順、(v) `published_at` がハイフン区切り文字列でも正しくパースされる。
    - `searchFilter.ts` の `filterPostsByKeyword`: (i) タイトルに含まれる場合ヒット、(ii) description に含まれる場合ヒット、(iii) tags 配列のいずれかに含まれる場合ヒット、(iv) カテゴリ表示名（`CATEGORY_LABELS`）に含まれる場合ヒット（例: 「開発」で `dev-notes` の記事がヒット）、(v) **シリーズ表示名（`SERIES_LABELS`）に含まれる場合ヒット（例: 「実践ノート」で `nextjs-deep-dive` シリーズの記事がヒット、`series` が null の記事はシリーズ表示名でヒットしない）**、(vi) 大文字小文字不区別（「next.js」と「Next.js」が等価）、(vii) 空キーワードで全件返る、(viii) どこにも含まれない場合 0 件。
  - **(b) コンポーネント振る舞いテスト（B-334-3-4 完了後に同一 builder へ直列）**:
    - `BlogFilterableList`: フィルタナビ表示、カテゴリリンク href、初期状態で「すべて」が `aria-current="page"`、`activeCategory` 指定時のフィルタリング、`?q=` での検索フィルタリング、カテゴリ + キーワード併用（積集合）、検索の大文字小文字不区別、空結果時の `role="status"`、debounce 後の `router.replace` 呼び出し、カテゴリリンク href にキーワード引き継ぎ（`buildCategoryHref`）、タグリンク href にキーワード引き継ぎ（`buildTagHref`）、人気タグ表示の出現条件（フィルタ未適用かつ非タグページのみ）、タグページで `tagHeader` 表示。
    - `BlogCard`: カテゴリラベル / 日付 / 読了時間 / タイトル / description / NEW バッジ有無 / TagList。`isNew` prop が true のときバッジ表示、false のとき非表示。
    - `BlogListView`: Server Component の単体テストは Vitest + RTL では async 制約があり書きづらいため、テスト方針は cycle-181/182 を踏襲する（具体は builder 判断、Server Component で書きづらい部分は型検査と `BlogFilterableList` 側のテストで補う）。本タスクのスコープとしては「Server から `BlogFilterableList` へ props（newSlugs 等）が渡るかどうか」「Pagination が表示される条件（totalPages > 1）」を、**実用的に検証できる粒度で**カバーする（型検査 + 部分的に Pagination 周辺の振る舞い、または BlogFilterableList 側で props の表現を確認、等）。
    - `Pagination` 既存の挙動（new 側）に対して、blog 一覧でのリンク構造（`/blog/page/[n]`、`/blog/category/[cat]/page/[n]`、`/blog/tag/[tag]/page/[n]` 各 basePath での生成）を検証する程度。
  - **既存テストの追従**:
    - `(legacy)/blog/__tests__/pagination-redirect.test.ts`: import パスを `(new)/blog/...` に追従。`generateStaticParams` の整合検証は新版でも維持。**タグ p2 が 6 タグ（設計パターン / Web開発 / Next.js / AIエージェント / 失敗と学び / ワークフロー）全てで生成されることを観測対象として assertion に含める**（researcher レポート 3 §3 の最新統計に整合）。カテゴリ p2 が dev-notes / ai-workflow の 2 つで生成されることも assertion 対象。
    - `(legacy)/blog/__tests__/tag-page.test.ts`: import パスを `(new)/blog/...` に追従。`getTagsWithMinPosts(3)` および noindex 閾値（`MIN_POSTS_FOR_TAG_INDEX = 5`）の検証を維持。
    - **B-334-3-7 で追加されるリダイレクト**（`/blog/tag/[tag]/page/1` → `/blog/tag/[tag]`）に対する単体テストも本タスクで追加する（`pagination-redirect.test.ts` への追加 case として、または別ファイル）。
  - **`__tests__/BlogListView.test.tsx` 旧版**: B-334-3-2 で削除済み。新版は本タスクで新規作成。
- **モック方針**: `vi.mock("next/navigation", ...)` で `useSearchParams` / `useRouter` をモック（cycle-181/182 と同型）。`Date.now()` を fake timers で固定し、NEW バッジ判定の境界条件を再現する。
- **AP-WF03 防止**: PM は assertion 文言・テストコードの literal を指示しない。「何を確認すべきか」だけを伝え、書き方は builder が判断。

#### B-334-3-6: 視覚検証と完了基準チェック

- **何を**: 完了直前に PM 自身で Playwright MCP 経由の視覚検証を実施し、結果を本ファイルに記録する。
- **検証シナリオ（8 シナリオ × 4 パターン = 32 枚、MJ-5 対応で japanese-culture を追加）**:
  1. **/blog 初期状態**（フィルタ未適用、`/blog`）: 4 枚。観測対象は (i) 直近 30 日の 5 件 NEW バッジが見える状態、(ii) カテゴリナビ 6 リンクのカウントバッジ、(iii) 人気タグ Top 8 表示、(iv) ページネーション「2/3/4/5」リンク。
  2. **/blog/page/2**: 4 枚。観測対象は (i) ページネーションの「前」「1」「3」「4」「5」「次」リンクが正しく描画されるか、(ii) アクティブページ（2）の視覚と aria-current、(iii) カード等高、(iv) 2 ページ目のカードの NEW バッジ非表示（30 日以内 5 件が 1 ページ目に集約されているため 2 ページ目には NEW なし）。
  3. **/blog/category/dev-notes**（23 記事 / 2 ページ、最大カテゴリ）: 4 枚。観測対象は (i) カテゴリ絞り込み中ヘッダーの description（`CATEGORY_DESCRIPTIONS["dev-notes"]`）、(ii) アクティブリンクの `aria-current="page"`、(iii) 同一カテゴリ連続時のカード識別性（タイトル + description + tags でドリルダウン可能か）、(iv) 「すべて」リンクの非アクティブ状態、(v) **dev-notes 系カテゴリラベル色がカードに正しく描画されている**。
  4. **/blog/category/japanese-culture**（5 記事 / 1 ページ、最小カテゴリ、MJ-5 対応）: 4 枚。観測対象は (i) **カテゴリ件数が少ない（5 件）状態でもカード等高が崩れない**、(ii) **badges 行 min-height が NEW バッジなしのカードでも h2 位置を揃える**、(iii) **dev-notes と異なるカテゴリラベル色がカード描画に反映されている**、(iv) タイトル文字数の最大値が 69 文字に近いカードでも見出し領域の表示制御が破綻しない、(v) ページネーション UI が非表示（1 ページのみ）、(vi) タグ分布が dev-notes と異なる（「日本語」「漢字」「伝統色」等）状態でカード上のタグ表示が破綻しないこと。
  5. **/blog/tag/[設計パターン]**（21 記事、URL は `%E8%A8%AD%E8%A8%88%E3%83%91%E3%82%BF%E3%83%BC%E3%83%B3` のパーセントエンコード）: 4 枚。観測対象は (i) タグヘッダー（パンくず + タグ名「設計パターン」+ タグ説明）、(ii) タグページではカテゴリナビが非表示、(iii) 人気タグ非表示、(iv) ページネーション（21 件 / 12 件 = 2 ページ、page/2 への動線あり）。
  6. **/blog?q=Next.js**（キーワード検索結果あり）: 4 枚。観測対象は (i) ヒット件数の妥当性（researcher レポート 3 §3 で `Next.js` タグの 15 件 + タイトル/description に含まれる記事を合算した数前後）、(ii) ヒット結果が `published_at` 降順、(iii) 入力欄の現在値表示、(iv) 検索中はページネーション無効（B-334-3-3 仕様）、(v) カテゴリリンク href に `?q=Next.js` が引き継がれる。
  7. **/blog/category/dev-notes?q=hydration**（カテゴリ + キーワード併用、ヒットあり）: 4 枚。観測対象は (i) 両条件 AND 適用、(ii) アクティブリンクが `dev-notes`、(iii) カテゴリリンク href にキーワード引き継ぎ。
  8. **/blog?q=zzzzz**（空状態 0 件）: 4 枚。観測対象は (i) `role="status"` 付きメッセージが描画され、0 件である旨と次のアクション（キーワード変更 / カテゴリ切替 / タグを外す のいずれか以上）が伝わる文言になっていること、(ii) カテゴリナビは表示維持（フィルタ操作可能）、(iii) 入力欄の現在値表示、(iv) **ヒット件数表示要素は DOM に存在しない（描画されない）**（MJ-C 対応、0 件時は空状態メッセージに情報を一本化）、(v) 視覚的に同じ「0 件」情報が冗長表示されていないこと。
  - 合計: **32 枚**（8 シナリオ × {w360, w1280} × {light, dark}）。
- **観測必須要素**（cycle-181 R3-4 / R4-2 / cycle-182 同型事故再発防止のため、明示的にリストアップ）:
  - **NEW バッジ視覚**: シナリオ 1 で 5 件全部が画面内に見える状態を w1280 で 1 枚以上撮影。バッジ位置 / 色 / box-sizing が崩れていないこと、badges 行の min-height によりバッジ有無で h2 位置が揃うこと。
  - **同一カテゴリ連続時の識別性**: シナリオ 3（dev-notes 23 件、2 ページ）で必ず確認。タイトル + description + tags でドリルダウン可能か。識別性不足が判明した場合は B-334-3-2 の補強案（description 行数増、tags の表示優先順位調整等）を builder が選択。Lucide アイコン採用は本サイクルでは選択不可（DESIGN.md §3 改訂相当のためサイクル内で扱わない）。
  - **カテゴリ間の見え方差（MJ-5 対応）**: シナリオ 3（dev-notes 23 件、最大）と シナリオ 4（japanese-culture 5 件、最小）の比較で、カテゴリラベル色 / タグ分布 / タイトル文字数最大値の違いがあっても、カード等高（`height: 100%`）と badges 行 min-height が一貫して機能することを観測。NEW バッジなし状態（japanese-culture）と NEW バッジあり状態（/blog 初期）の両方で h2 位置の縦揃いを確認。
  - **タグページの URL エンコード**: シナリオ 5 で URL バーが `/blog/tag/%E8%A8%AD%E8%A8%88%E3%83%91%E3%82%BF%E3%83%BC%E3%83%B3` になっていること、ページコンテンツが「設計パターン」タグの記事 21 件を表示していることを確認。
  - **ページネーション複合状態**: シナリオ 2（/blog/page/2）でページネーション UI の前後リンク・現在ページ表示を観測。`/blog/category/[cat]/page/[n]` および `/blog/tag/[tag]/page/[n]` も builder のテストでカバー（視覚は w1280 light の 1 枚を `/blog/category/dev-notes/page/2` で別途撮影、シナリオ 3 と兼用してもよい）。
  - **検索中のページネーション無効化**: シナリオ 6（/blog?q=Next.js）でページネーション UI が非表示または無効状態であることを観測（B-334-3-3 仕様）。
  - **ヒット件数表示の検証（MJ-1 / MJ-C 対応）**: シナリオ 6（/blog?q=Next.js, 実測 15 件以上）でヒット件数表示が画面上部に可視で存在し、入力に応じて更新されることを観測。シナリオ 8（/blog?q=zzzzz, 0 件）では**逆にヒット件数表示要素が描画されておらず、空状態メッセージのみが画面に出ていることを観測**（MJ-C 対応の選択案 (a) の検証）。
  - **ダークモード**: 全シナリオで {light, dark} を撮るため自動でカバー。NEW バッジ・カウントバッジの色が背景から識別可能か確認。
- **チェック観点**: DESIGN.md §3 絵文字なし、§4 Panel ベース、§2 トークン使用、a11y（focus-visible、コントラスト 4.5:1、44px タップターゲット）、カード等高、badges 行の高さ揃い、空状態の文言、タグページの noindex（5 件未満タグでの `<meta name="robots" content="noindex">` 出力）。
- **AP-WF11 / AP-WF05 対策**: 並べ読み成果物として「計画書のリスト」「実装に存在する要素」「差分」「判定」を `./tmp/cycle-183/visual-check.md` に 4 列テーブルで残す。スクリーンショットは `./tmp/cycle-183/screenshots/` に保存し、サイクル終了時に不要なものを削除する（`./tmp/` はリポジトリ未追跡）。

#### B-334-3-7: `/blog/tag/[tag]/page/1` リダイレクト追記

- **何を**: `next.config.ts` の `redirects()` の `paginationRedirects` 配列に `{ source: "/blog/tag/:tag/page/1", destination: "/blog/tag/:tag", permanent: true }` を追加。
- **なぜ**: researcher レポート 1 §1 で「`/blog/tag/[tag]/page/1` は `next.config.ts` に存在せず、本番ビルドで 404 になる」ことが実体確認されている。`/blog/page/1` および `/blog/category/:cat/page/1` は既に同じパターンで定義済みのギャップ。タグページが既に外部リンクされている可能性（researcher レポート 1 §10 で sitemap には `/blog/tag/[tag]` p1 のみ記載されているが、Web 上の手作業リンクは `/page/1` 形式である可能性）に対する保険。M1b の `dislikes`「URLが変更されたコンテンツにリダイレクトが設定されておらずたどり着けなくなること」に直接対応。
- **最終状態**:
  - `/blog/tag/{any-tag}/page/1` への HTTP リクエストが `/blog/tag/{any-tag}` に 308 永続リダイレクト（Next.js の `permanent: true` は HTTP 308、cycle-181 違反 19 で 301 と 308 の混同が起きた知識ベース `docs/knowledge/nextjs.md` を踏襲）。
  - 既存の `/blog/page/1`、`/blog/category/:cat/page/1` のリダイレクトは変更しない。
  - ユニットテスト（`pagination-redirect.test.ts`）に追加 case を含める（B-334-3-5 の対象）。
- **依存関係**: B-334-3-1 と独立（触るファイルが `next.config.ts` のみで blog 配下と被らない）。先行・並行どちらでも可。

### 検討した他の選択肢と判断理由

#### 1. カテゴリ / タグの URL アーキテクチャ → 既存の静的ルート（URL ルーティング）を維持

- **採用**: `/blog/category/[category]` および `/blog/tag/[tag]` を静的生成のまま維持し、`?category=` / `?tag=` クエリパラメータ方式には変更しない。
- **理由（来訪者価値起点）**:
  - **SEO インデックスされた既存 URL の保持（M1b/M1d/M1e の `likes` から導出）**: sitemap.xml に登録されている `/blog/category/[cat]` × 5 と `/blog/tag/[tag]` × 16（5 件以上タグ）の計 21 URL は外部検索エンジンにインデックス済みの可能性が高く、これらを失うと検索流入経路が消える。M1d の `search_intents`「Claude Code 使い方」「AIエージェント ワークフロー」が `ai-workflow` カテゴリページに着地している場合、URL を消すと 308 リダイレクトしても rel=canonical の再評価まで時間がかかり、その間検索順位が落ちる。M1e の `search_intents`「Next.js 設計パターン」も同様。
  - **M1c の `likes`「書き手の癖が記事をまたいで一貫しており、個として認識できること」との整合**: タグページ（「失敗と学び」「ワークフロー連載」等）は M1c が「特定テーマで連続して読む」動線として機能している。タグ別に独立 URL があることで、外部メディア・SNS から「このタグの全記事」をリンクで紹介してもらえる可能性が残る。
  - **静的生成で 44 URL がインデックス可能なメリット vs クエリパラメータ方式で動的フィルタになるメリット**: tools・play の場合は記事数が少なく（34 / 20）静的生成の SEO 価値が薄かった。blog は 59 記事 + 33 タグ = 多くのテーマ別コンテキストがあり、静的 URL の SEO 価値が大きい。
- **棄却した代替**:
  - **クエリパラメータ方式（`?category=X&tag=Y`）に統一**: tools/play との UX 一貫性は得られるが、SEO インデックスされた 21 URL を失うリスクと、308 リダイレクト後も検索順位の一時的な低下が避けられない。M1d/M1e への影響が大きい。
  - **クエリパラメータ方式 + 旧 URL は 308 リダイレクト**: 同上の検索順位リスク。クエリ方式へ移行する積極的便益（来訪者の「即時フィルタ」体験）は、blog の 59 記事規模では「フィルタしてもページネーションは必要」という構造のため部分的にしか得られない（クエリパラメータ方式でも `?category=X&page=N` のような複合 URL になり、URL が短くなるわけではない）。
  - **ハイブリッド（カテゴリは静的ルート維持、タグはクエリパラメータ化）**: 一貫性が崩れ、来訪者の認知モデルが二重化する。

#### 2. キーワード検索の対象フィールド → タイトル + description + タグ + カテゴリ表示名 + シリーズ表示名

- **採用**: `title` + `description` + `tags`（配列要素を join） + `CATEGORY_LABELS[post.category]`（カテゴリ表示名） + `SERIES_LABELS[post.series]`（シリーズ表示名、`post.series` がある記事のみ）の **5 系統**を横断検索。`slug` / `series`（id 文字列） / `series_order` / `related_tool_slugs` は対象外。
- **理由（来訪者の打鍵語起点）**:
  - **M1c の `search_intents`「AI 日記」「AI ブログ 個人」「AI エッセイ」「ChatGPT 日記」「AI 運営 サイト」**: これらは title または description に含まれる語句として捕捉されるべき。`description` が 77〜164 文字で全 59 件に存在する（researcher レポート 3 §8）ため、検索対象として情報量が十分。
  - **M1c の `likes`「書き手の癖や語り方が記事をまたいで一貫しており、個として認識できること」**: タグ（「失敗と学び」「Claude Code」「ワークフロー連載」等）はテーマ性を表現するため、タグでヒットすることが M1c の興味と直接接続する。
  - **カテゴリ表示名を含める理由**: M1c が「開発」「AI」「日本」のような大きな括りで検索した時、`CATEGORY_LABELS["dev-notes"]` = 「開発ノート」、`CATEGORY_LABELS["ai-workflow"]` = 「AIワークフロー」、`CATEGORY_LABELS["japanese-culture"]` = 「日本語・文化」がヒットすれば、カテゴリ単位での全記事に到達できる。slug（英数字「dev-notes」等）は M1c の打鍵語として現実的でないので対象外。
  - **シリーズ表示名を含める理由（MJ-B 対応、新規追加）**: 実体集計（researcher レポート 3 §9 + 計画段階 Bash 実測）では、3 シリーズ（`SERIES_LABELS`: 「AIエージェント運用記」 13 記事 / 「日本語・日本文化」 5 記事 / 「Next.js実践ノート」 9 記事、合計 27 / 59 記事）が連載として運用されている。記事詳細（`/blog/[slug]`）に SeriesNav が出る一方、シリーズ専用 URL は存在しないため、**M1c が「このサイトの連載シリーズ単位で読み返したい」と思った時、ページ内検索のキーワード打鍵が唯一のシリーズ束ね手段**になる。シリーズ表示名（短文・固有名詞・3 種のみ）を検索対象に含めると、「実践ノート」「運用記」「日本語・日本文化」のような打鍵語でシリーズ所属の全記事を一括掬える。実装は `post.series` がある記事に限り `SERIES_LABELS[post.series]` を検索対象テキストに連結するだけで済み、複雑度は低い。
  - **シリーズ表示名追加によるヒット件数への影響（MJ-1 整合確認）**: シリーズ表示名は記事のフィールドで「Next.js実践ノート」「AIエージェント運用記」「日本語・日本文化」の 3 種のみ（合計対象記事 27 件）。Bash 実測上、「Next.js」（既にタイトル/タグで 15 件）に「Next.js実践ノート」9 件を連結しても重複が大半で**ヒット件数の最大値（「設計」34 件）を更新しない**。M1c の主要打鍵語（「日記」「エッセイ」「失敗」「学び」等）はシリーズ表示名と語彙が独立で件数増は無し。ヒット件数表示の上限想定は変更不要。
  - **D-12 引き継ぎ**: backlog B-334 Notes に「ブログ一覧の絞り込み実装範囲は『タグのみ』ではなく、タイトル全文 + タグ + カテゴリの組み合わせを最低基準として Phase 4 設計時に検討する」と明記。本判断はこれを満たし、description / シリーズ表示名を加えることで M1c の打鍵語の捕捉精度を上げる。
- **棄却した代替**:
  - **タイトル + タグ + カテゴリのみ（description 除外）**: D-12 の最低基準は満たすが、description（77〜164 文字、全 59 件存在）に含まれる固有語（「hydration」「multiple root layouts」など）が検索できなくなる。M1d/M1e のエンジニア層が打つ技術用語の捕捉率が下がる。
  - **slug を含める**: ASCII slug（「nextjs-hydration-mismatch-seeded-random」等）は M1c/M1b の打鍵語と乖離。日本語クエリでは絶対にヒットせず、英語クエリでも title/description に同じ語が含まれていることが多くノイズが増える。
  - **シリーズ表示名を対象外にする（=「シリーズ詳細は SeriesNav 経由が優れる」論拠）**: 棄却。SeriesNav は記事詳細ページに到達してから初めて見える UI で、一覧から「シリーズで読みたい」意図を持つ M1c には届かない。シリーズ単独 URL も存在しないため、検索対象に含めない場合 M1c は「連載名から全記事を辿る手段」を失う。実装コストが軽いため含める判断のほうが来訪者価値が高い。
  - **`series` の id 文字列（「ai-agent-ops」「nextjs-deep-dive」等）を含める**: M1c の打鍵語と乖離（slug と同型の理由）。表示名のみを対象に。
  - **本文（記事の Markdown 全文）を含める**: バンドルサイズ激増（59 記事の本文 = 数百 KB の客先送信）+ クライアントサイドフィルタの計算コスト増。本文検索は Phase 5 の横断検索（B-331、Fuse.js + `/search-index.json` fetch）で扱うべき領域で、本サイクルのページ内絞り込みのスコープを超える。

#### 3. ページネーションと絞り込みの URL 設計 → 検索中はページネーション無効、それ以外は静的 URL 構造維持

- **採用**: `?q=` キーワード検索が効いている間はページネーション無効化（フィルタ後全件を 1 ページ表示）、`?q=` がない場合は通常の静的ページネーション（`/blog/page/[n]`、`/blog/category/[cat]/page/[n]`、`/blog/tag/[tag]/page/[n]`）。
- **理由**:
  - **来訪者の認知モデル**: キーワードでフィルタした結果が「ページの中の 12 件のうち 0 件ヒット」では、来訪者は「全件中のヒット数」を期待しており UX が破綻する。
  - **実装の単純さ**: 検索中は全件を memory で持って Array.filter で絞るだけ。59 記事規模では問題ない。
  - **SEO**: 検索中の URL は `?q=` 付きで、Googlebot に対しては `<link rel="canonical">` で `/blog`（または `/blog/category/[cat]`）に正規化することでインデックス化を避ける（builder が確認・実装、現行の各 page.tsx の canonical を引き継ぐ）。
- **画面長大化への補強（計画段階の Bash 実測に基づく）**: 「設計」34 件・「AI」20 件・「サイト」19 件のような汎用語では 1 ページに 30 枚前後のカードが縦並びになる。**ヒット件数の上部表示**を完了基準に組み込み、来訪者が状況を把握できるようにする（詳細は §B-334-3-3 の「画面長大化への対応」）。スコアリング（タイトル前方一致優先 / タグ完全一致優先）は Phase 5 横断検索（B-331、Fuse.js）でまとめて扱うため本サイクルでは採用しない。
- **縦スクロール長の見積もり（MN-D 対応、M1c の「眺める」体験への許容性検証）**:
  - 仮定: BlogCard 1 枚の高さは概ね 200〜260px（カテゴリラベル + 日付 + 読了時間 + タイトル 1〜2 行 + description 3 行クランプ + NEW バッジ行 + TagList 1 行 + 余白）。w360 mobile で 1 列縦並び、w1280 desktop で 2〜3 列グリッド（カラム数は builder 判断）。
  - **最大ヒット 34 件時（「設計」）**: w360 で 200px × 34 = **約 6,800px**、ヒーロー / カテゴリナビ / 検索入力 / ヒット件数表示を加えると約 7,200px ≒ **w360 mobile で約 11〜12 画面分のスクロール**（viewport 高さ 640〜700px 換算）。w1280 で 2 列なら 17 行 × 200px = 3,400px ≒ **3〜4 画面分**。
  - **中央値 15 件時（「実装」「Next.js」など）**: w360 で 200px × 15 = **約 3,000px** ≒ **5〜6 画面分**。w1280 で 2 列なら 8 行 × 200px = 1,600px ≒ **2 画面分**。
  - **比較: フィルタ未適用時（59 件・5 ページネーション）の 1 ページ目**: w360 で 200px × 12 = 2,400px ≒ **4 画面分**。
  - **M1c の「眺める」体験への許容性**: M1c の `interests`「AI が自分の視点で書く、等身大の日々の記録や試行錯誤」「記事を書いた AI の『中の人らしさ』」は、**気配を掴むためにある程度の数を眺める**動線で、scroll を厭わない。ヒット 15〜20 件のバンドが厚い（w360 で 5〜7 画面分）のは「眺める」体験として**許容範囲内**と判断する根拠は M1c の `dislikes` に「縦スクロール長」「ページ移動の少なさ」を否定する項目が無いこと、および `likes`「作業や出来事の具体的な細部が書かれており、そこに視点が宿っていること」が「カードを 1 つずつ確認したい」志向と整合することによる。
  - **34 件時の最悪ケースについて**: w360 で 11〜12 画面分は確かに長いが、(i) ヒット件数表示で「34 件ある」が冒頭で分かるため来訪者は心積もりができる、(ii) 「設計」のような汎用語を打った M1c は「広く捕まえたい」意図のため全件可視性を優先する、(iii) ページネーションを噛ませると「34 件中 12 件しか見えない」状態になり M1c の認知モデル（全件中のヒットを一覧したい）と乖離する、の 3 点から**ページネーション再導入は採用しない**。本判断は §3 の主結論を補強する。
  - **将来 100 記事を超えた場合**: 同じ汎用語で 50 件超のヒットになる可能性がある。その時点でスコアリング（B-331 / Fuse.js）と組み合わせた絞り込み導線を検討する。本サイクルの 59 記事規模では、上記 (i)〜(iii) の根拠で許容できる。
- **棄却した代替**:
  - **検索中もページネーション維持（`?q=...&page=N`）**: 来訪者の認知モデル（全件中のヒット）と乖離し、ページ移動でヒット内訳が変わる UX を生む。Bash 実測で代表打鍵語の最大ヒットが 34 件（59 記事の 58%）と判明したため、`?q=...&page=N` 構造に分割すると「34 件中 12 件しか見えない」状態が常態化し、認知コストが増す。
  - **検索中はクエリパラメータ方式に切替（`/blog?category=X&q=Y`）**: 静的 URL 維持の判断（§1）と矛盾するため棄却。
  - **検索結果の上限カット（上位 N 件のみ表示し下に「キーワードを絞ってください」のヒント）**: 「設計」「AI」のような大ヒット語で恣意的にカットすると、来訪者が「自分の意図と関係ない順序で切られた」と感じ、M1c の `dislikes`「定型的な誇張」とは別軸だが予測可能性が下がる。本サイクルでは採用せず、ヒット件数表示で「多い」状況を伝える方向。

#### 4. 既存 BlogListView.tsx / BlogCard.tsx の処遇 → 同名ファイルで上書き置換

- **採用**: `src/blog/_components/BlogListView.tsx` / `BlogCard.tsx` / `TagList.tsx` を新版で上書き置換。別名（`BlogListViewNew.tsx` 等）を作らない。
- **理由**:
  - **6 ルート全てが新コンポーネントを参照する切替を B-334-3-1 で同 commit 内に行うため、旧版を別名で残す必要がない**。並走期間がゼロ。
  - **git の履歴は同名ファイルでも追える**: `git log -p src/blog/_components/BlogListView.tsx` で過去の実装は復元可能。
  - **dead code 防止**: 別名で新版を作ると、旧名のまま残る BlogListView.tsx の削除コミットが別途必要になり、整合タイミングが複雑化する。
- **棄却した代替**:
  - **新版を別名（`BlogFilterableList` 等）で作り、旧 `BlogListView` を段階的に置換**: cycle-181 のツール側でこの方式は採られなかった（既存 `BlogListView`（当時の `ToolsListView` ではなくブログ用の旧 `BlogListView`）への参照は皆無で、新規作成のみ）。本サイクルでは旧 `BlogListView` が 6 ルートから参照されているため、新旧並走期間が必ず発生し、整合不能リスクが高い。
  - **BlogListView を改修して並走を回避**: 内部実装が大幅に変わる（4 層分割、Suspense 導入、Client Component 化）ため、改修というより全書き換えに等しい。同じこと。

#### 5. タスクの粒度と本サイクル内のスコープ → 6 ルート全てを本サイクルで完了

- **採用**: 6 ルート + 共通コンポーネント置換を本サイクル内で完了させる。サイクル分割しない。
- **理由**:
  - **共通 BlogListView を介して 6 ルートが連動する構造**: BlogListView を新版に切替えた瞬間、旧版を参照しているルートはビルドが落ちる。タグだけ後続サイクル送りにすると、新 BlogListView が「タグページモード」をサポートしないか、旧 BlogListView を残しつつ新版を別名で作る必要がある。後者は §4 で棄却済み。
  - **規模の見積り**: cycle-181 が 1 ルート + ページネーション + Header 改修 + 多数の追加修正で 1 サイクル、cycle-182 が 1 ルート（/play 単体）で 1 サイクル。本サイクルは 6 ルートだが、ロジックは 1 つの BlogListView + page.tsx 6 枚で page.tsx 側のロジック変更は最小（import 切替と `tagHeader` / `activeCategory` prop の渡し方のみ）。BlogListView 新版の設計と実装は cycle-181/182 のパターン継承で大半が機械的。視覚検証は 8 シナリオ × 4 = 32 枚に増えるが PM 自身による作業として許容範囲。
  - **リスクの非対称性**: 「途中まで移行・カテゴリ/タグだけ legacy 残置」状態が中間 commit でも生じない設計（§4）のため、「本サイクル内で全部やれない」リスクは「BlogListView 新版の実装で時間を食う」場合に限られる。その場合の fallback は、(i) 視覚検証を翌日に回して PM が一晩寝かせる、(ii) reviewer 指摘対応のラウンドが伸びるが本サイクル内で完了させる、(iii) どうしても無理なら本サイクル中に残作業を「翌サイクル B-334-4-X として明示し、その間は新 BlogListView が `tagHeader` モード未対応 → タグページのみ legacy 残置」状態を作る最後の手段。**(iii) は計画段階で禁止**（cycle 内で全部完了する前提で進め、もし時間が足らないと判断したら計画書を更新して reviewer に再レビュー依頼する）。
- **棄却した代替**:
  - **本サイクルは /blog 本体 + ページネーションのみ、カテゴリ/タグは後続**: §4 で棄却した「BlogListView 新旧並走」が必須となり実装が複雑化。中途半端な状態のサイクル commit が発生し、Phase 4.3 完了の宣言が分割される。
  - **/blog 本体のみ、ページネーション・カテゴリ・タグは別々のサイクル**: 同上の理由 + サイクル数が増えすぎてコスパが悪い。

#### 6. a11y の責務（A-6 Phase 4 引き継ぎ）→ Phase 4 標準スコープを超えた配慮を本サイクルで完成

- **採用**: design-migration-plan.md L126-L131 に記載の Phase 4 a11y 責務（複数到達経路、aria-current、focus-visible、コントラスト 4.5:1、タップターゲット 44px）を本サイクルで完成させる。
- **具体策**:
  - **複数到達経路（WCAG 2.4.5 Multiple Ways）**: Header ナビ「ブログ」、Footer リンク「ブログ」、トップページ「最新ブログ記事 3 件 + すべて見る」、sitemap.xml の 4 経路を確認・記録。これは cycle-181 で `/tools` に対して既に確認済みのフォーマットを踏襲。
  - **aria-current**: カテゴリリンク（active 時）、タグリンク（タグページ active 時）、ページネーション現在ページに `aria-current="page"` を付与。data-active も同時付与（CSS 制御用）。
  - **focus-visible**: DESIGN.md §2 末尾のフォーカススタイル規約に準拠（具体値は builder 判断）。全インタラクティブ要素（カードリンク、カテゴリリンク、タグリンク、検索入力、ページネーションリンク）に適用。
  - **コントラスト 4.5:1**: DESIGN.md トークン（`--bg`/`--fg`/`--accent`/`--fg-soft`）使用で設計上担保。視覚検証で目視確認。
  - **タップターゲット 44px**: カテゴリリンク、タグリンク（人気タグ Top 8 + タグページの内部リンク）、検索入力、ページネーションリンクすべてに `min-height: 44px` を個別 CSS クラスで保証（B-386 が未着手のため、コンポーネント本体ではなく利用側で個別上書き、AP-I02 抵触の継承）。
- **棄却した代替**:
  - **B-386 を本サイクルで前倒し対応**: スコープ肥大、独立タスクの混在による品質リスク（cycle-181/182 と同じ判断）。Button/Input コンポーネント本体の修正は全サイト規模の影響があり、別サイクルで扱うべき。

#### 7. `/blog/tag/[tag]/page/1` リダイレクトの扱い → 本サイクル内で追記

- **採用**: B-334-3-7 として本サイクルで `next.config.ts` に追記。
- **理由**:
  - 既存ギャップ（`/blog/page/1` と `/blog/category/:cat/page/1` は定義済みでタグだけ抜けている）の解消は数行の追記で完了し、コストが極めて低い。
  - タグページが既に外部リンクされている可能性に対する保険として価値がある。M1b の `dislikes`「URLが変更されたコンテンツにリダイレクトが設定されておらずたどり着けなくなること」に直接対応。
  - 本タスク自体は他タスクと触るファイルが完全独立（`next.config.ts` のみ）で並行可。
- **棄却した代替**:
  - **別 backlog（B-334-4 等）に切り出す**: 本サイクル中に追記すれば 1 行（ユニットテスト含めて 10 行程度）で済むものを backlog に積むと管理コストの方が高い。

#### 8. dead code 整理 → 旧 BlogListView 系コンポーネントは新版で上書き置換、旧 `__tests__/BlogListView.test.tsx` は廃止

- **採用**: `BlogListView.tsx` / `BlogCard.tsx` / `TagList.tsx` および対応 CSS は新版で上書き（§4 で採用済み）。`__tests__/BlogListView.test.tsx` 旧版は削除し、新構造のテストを B-334-3-5 で新規作成。
- **理由**: §4 + cycle-182 の `(legacy)/play/__tests__/page.test.tsx` 廃止と同じ判断。旧構造を直接 assertion しているため、新構造に対してリネーム + 縮減版を残しても重複・形骸化する。
- **棄却した代替**:
  - **旧テストを残しつつ新テストを追加**: 旧テストが新版の構造で通らないため、import パス追従だけでは全テスト落ちる。
  - **旧テストの assertion を機械的に新構造に書き換える**: 構造が大きく変わるため書き換えは新規作成と同等のコストで、AP-WF03（PM の literal 指示）抵触リスクが高い。

#### 9. 視覚検証のシナリオ設計 → 8 シナリオ × 4 パターン = 32 枚

- **採用**: cycle-182 の 5 シナリオ × 4 = 20 枚を踏襲しつつ、ブログ固有の追加（ページネーション 2 ページ目、タグページ）を 2 シナリオ加え、さらに reviewer 指摘 MJ-5 を踏まえてカテゴリ間の見え方差を観測するために最小カテゴリ japanese-culture を 1 シナリオ追加し、合計 8 × 4 = 32 枚とする。
- **理由**: ブログは tools/play にないページネーション + タグページ + カテゴリ + ページネーション複合があるため、シナリオ数が増える。さらに 5 カテゴリの記事数差（最大 23 件 / 最小 5 件）が大きく、カードレイアウトの観測機会をカバーするため japanese-culture を独立シナリオ化する。32 枚は PM 自身が作業として許容できる規模（cycle-182 の 20 枚から +12 枚）。
- **棄却した代替**:
  - **5 シナリオ維持（ページネーションとタグページを 1 シナリオ内に詰め込む）**: 観測対象が混ざり、識別性検証の質が落ちる。cycle-181 で「観測対象を独立に列挙する」ことが事故防止に有効と確立されたため、シナリオを増やす方向で。
  - **10 シナリオ以上に増やす**: PM の視覚検証作業時間が肥大化し、AP-WF11（PM 自身の通読）が形骸化するリスク。32 枚で必要な観測対象は網羅できる。

#### 10. commit 粒度と rollback 戦略

- **commit 粒度の方針（rollback 戦略の前提）**: 本サイクルは 6 ルートをアトミック切替えする構造のため、視覚検証で問題が出た場合の rollback 単位を明確にする目的で、commit を以下の 3 つに分割する（builder 判断で多少の分解は可）。
  1. **commit A（ルート移行 + コンポーネント全書き換え）**: B-334-3-1 + B-334-3-2 + B-334-3-3 + B-334-3-4 を 1 commit にまとめる。理由: BlogListView 新版・page.tsx 移行・カテゴリ/検索 UI・NEW バッジロジックは互いに参照し合うため、途中状態でビルドが通らない。アトミックさを優先。
  2. **commit B（テスト追加）**: B-334-3-5 を別 commit。理由: テストだけを後で revert / 修正するケースに対応。テスト失敗が判明した時に、commit A 自体は revert せず builder 修正で対応可能。
  3. **commit C（リダイレクト追記）**: B-334-3-7 を別 commit。理由: `next.config.ts` のみの変更で、commit A と完全独立。並行実装可能。
- **rollback 戦略（視覚検証で本番停止級バグが見つかった場合）**:
  - **発覚タイミング 1: ローカル視覚検証中（push 前）**: builder 修正で対応。`git reset --soft HEAD~1` で commit A をやり直し、修正版で再 commit。reviewer 再レビューを経てから push。
  - **発覚タイミング 2: 視覚検証完了後（merge 後）**: `git revert <commit A の SHA>` で commit A だけを巻き戻すことで、6 ルート全体を一括で legacy 構造に戻せる（旧 `BlogListView.tsx` / `BlogCard.tsx` / `TagList.tsx` および `(legacy)/blog/` 配下が git 履歴から自動復元される）。commit B（テスト）と commit C（リダイレクト）は独立しているため、必要に応じて選択的に revert。**commit を 3 つに分けた最大の理由**: 1 commit にすると revert 時にリダイレクト追記やテスト追加までロールバックされてしまうため。
  - **発覚タイミング 3: 「タグだけ legacy に戻す」のような部分 rollback**: 本サイクルの設計上、6 ルートは共通 `BlogListView` を参照するため、タグだけ部分的に legacy へ戻すことは**できない**（§検討した他の選択肢 §4 で棄却済みの「新旧並走」が必要になるため）。タグページに重大な問題が見つかった場合は commit A 全体を revert し、修正版で再着手する方針。これは「アトミック切替えの代償」として計画段階で受容する。
  - **rollback 後の対応**: revert 後は cycle-183 を「未完了」状態に戻し、原因調査 + 修正計画 + reviewer 再レビューを経て再着手する。Phase 4.3 完了宣言は出さない。
- **【実態の commit 構成（事後注記）】**: 実装フェーズで B-334-3-7 担当 builder が指示外で 6 ルートの `git mv`（本来は B-334-3-1 のスコープ）も commit C に含めて先行コミットしたため、当初計画と commit 構成が一部入れ替わった。実態は次の通り。
  - **commit C（4446aa63）**: `next.config.ts` のリダイレクト追記 **+ 6 ルートと 2 テストの `git mv`**（B-334-3-7 が B-334-3-1 のサブ作業を侵食）
  - **commit A（587359c6）**: 新コンポーネント実装と参照差し替え（git mv は含まず）
  - **commit A-fix（fccb3bcf）**: レビュー指摘 M-1（Pagination 44px）と MINOR の修正
  - 本サイクル中の本番停止級バグへの rollback は、当初計画の「commit A 単独 revert」では機能せず、**commit A + commit C を併せて revert する必要がある**（commit C を残したまま commit A を revert すると、ルートは `(new)/blog/` 配下にあるが新コンポーネント実装が消えてビルド不能になる）。タグページのみの部分 rollback が不可能な点は当初計画通り。
  - 本件は AP-WF13（並行アサイン時のスコープ越境）に該当し、`docs/anti-patterns/workflow.md` に予防策を追記済み。今後は builder への指示文に「他のファイルは触らない」を明示することで再発を予防する。本サイクルでは案 B（計画書の rollback 戦略を実態に合わせて改訂）を採用し、`git rebase` での commit 再構成は行わない（既に push 前で main に未公開のため、追加リスクの導入を避ける判断）。

### 完了基準

以下がすべて満たされた時点で Phase 4.3 完了とする（**観測可能な形のみで列挙**）。

#### ルート・基本動作

- 6 ルートで合計 **44 URL** が `(new)/blog/` 配下のソースから配信されている（researcher レポート 3 §3 / §タグ別件数表より集計、内訳は下記）。`src/app/(new)/blog/...` に各 page.tsx が存在し、`src/app/(legacy)/blog/page.tsx` 等は git 上で削除済み。`(legacy)/blog/[slug]/` および `(legacy)/blog/[slug]/__tests__/` は残置。
  - `/blog`: 1
  - `/blog/page/[2-5]`: 4（59 件 / 12 件 / ページ = 5 ページ → page/2〜5 の 4 URL）
  - `/blog/category/[cat]`: 5（dev-notes / ai-workflow / site-updates / tool-guides / japanese-culture）
  - `/blog/category/[cat]/page/[n]`: 2（dev-notes 23 件 → p2、ai-workflow 16 件 → p2 の計 2 URL。残りカテゴリは 12 件未満で p2 なし）
  - `/blog/tag/[tag]`: 26（`MIN_POSTS_FOR_TAG_PAGE = 3` 以上のタグ）
  - `/blog/tag/[tag]/page/[n]`: **6**（12 件以上のタグ = 設計パターン 21 / Web開発 17 / Next.js 15 / AIエージェント 15 / 失敗と学び 15 / ワークフロー 14 の **6 タグ**全てで p2 が生成される。researcher レポート 3 §3 より）
- `/blog` URL に対して HTTP 200 が返る。`/blog/page/2`、`/blog/category/dev-notes`、`/blog/tag/設計パターン` 等の代表 URL も 200。`/blog/tag/[unknown-tag]`（存在しないタグ、または 3 件未満で `MIN_POSTS_FOR_TAG_PAGE = 3` を満たさないタグ）は `notFound()` で 404（既存挙動維持）。
- `(legacy)/blog/__tests__/pagination-redirect.test.ts` および `tag-page.test.ts` は新ルートを参照するように更新され、テストが通る。
- 旧 `src/blog/_components/BlogListView.tsx` / `BlogCard.tsx` / `TagList.tsx` および対応 CSS / `__tests__/BlogListView.test.tsx` 旧版は **新版で上書き or 削除済み**（git 上）。新版が同名ファイルで存在し、6 ルート全てが新版を参照している（`grep -rn "import.*BlogListView" src/app/(new)/blog/` で全 6 ルートがヒット、`grep -rn "import.*BlogListView" src/app/(legacy)/blog/` のヒットは `[slug]/` 配下を除いてゼロ）。
- `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する（特に Suspense ラップ要件、`react-hooks/purity` 制約への適合を確認）。

#### デザイン適用

- ブログ一覧・カード・ヒーロー・フィルター UI に絵文字が一切含まれない。Lucide アイコンも原則使われていない。
- カード CSS が `--bg`/`--fg`/`--fg-soft`/`--border`/`--accent` 系トークンを使用している。フィルターリンク CSS が `--r-interactive` を使用し、active 状態が `data-active="true"` セレクターで表現されている。
- カード等高（`height: 100%; box-sizing: border-box;`）が `BlogCard` CSS に存在する。
- badges 行に固定 min-height が設定されている（NEW バッジ有無で h2 位置がズレない）。
- タイトル（最大 69 文字想定）と description（77〜164 文字想定）でカード高さが揃う表示制御が施されている（実装方式は builder 判断、観測可能な等高が成立していること）。
- `BlogListView` で `Suspense` が import され、`BlogFilterableList` が `<Suspense>` でラップされている。

#### フィルター・検索の振る舞い

- `/blog` 初期状態で「すべて」リンクに `aria-current="page"` が付与される。`/blog/category/[cat]` で対応カテゴリリンクに `aria-current="page"` が付与される。
- 不正カテゴリ（`/blog/category/invalid-cat`）は `notFound()` 動作（既存挙動維持）。
- `/blog/tag/[tag]` でタグヘッダー（パンくず + タグ名 + タグ説明）が表示され、カテゴリナビは非表示。人気タグも非表示。
- 検索入力に文字を入力後 300ms 以内に URL に `?q=...` が反映される（debounce 動作）。`?q=` の値が入力欄に表示される（URL → state 追従）。
- `?q=` がある間はページネーション UI が無効（フィルタ後全件 1 ページ表示）。
- **ヒット件数の表示（MJ-1 / MJ-C 対応）**: `?q=` があり**かつ ヒット件数 ≥ 1** の時のみ、画面上部（カードグリッドの直前）にヒット件数を含む数値表示要素が可視で存在する。`aria-live="polite"` 等の更新通知が付与され、入力に応じてリアルタイムに更新される。**ヒット 0 件時は件数表示要素は DOM に描画されない**（空状態メッセージに情報を一本化、§B-334-3-3「0 件時の表示方針」を参照）。具体文言・レイアウトは builder 判断。
- `?q=` でヒット 0 件の場合、`role="status"` 付きメッセージが表示され、(i) 該当記事が 0 件であること、(ii) 来訪者が次に取れるアクション（キーワードを変える / カテゴリを切り替える / タグを外す のいずれか以上）が伝わる文言になっている。**この時、ヒット件数表示要素は画面上に存在しない**（MJ-C 対応で 0 件時の二重表示を構造的に回避）。具体文言は builder 判断（M1c の `dislikes`「定型的な締め方」を踏まえ、テンプレートに陥らないよう builder が選定）。
- カテゴリリンクおよびタグリンクの href にキーワード（`?q=...`）が引き継がれる。
- カテゴリ + キーワード併用（`/blog/category/dev-notes?q=hydration`）が AND 条件で動作する。

#### NEW バッジ・ソート

- カードの並び順が `published_at` 降順になっている（フィルタ適用後も降順維持）。
- NEW バッジが「上位 5 件 × 直近 30 日」の積集合に対してのみ表示される（テストで証明）。現時点（2026-05-07）では 5 件全部に NEW バッジが付く想定（researcher レポート 3 §4 で確認）。

#### a11y / WCAG

- カテゴリリンク・タグリンク（人気タグ + タグページ内）・検索入力・ページネーションリンクの計算スタイルで `min-height` が 44px 以上（DevTools / `getBoundingClientRect()` で確認）。
- focus-visible 時に DESIGN.md §2 末尾規約に準拠したアウトラインが描画される。
- `<nav aria-label="カテゴリで絞り込む">` および `<nav aria-label="人気タグ">` がそれぞれナビを内包している。
- WCAG 2.4.5: `/blog` への到達経路が **(i) Header ナビ「ブログ」、(ii) Footer リンク「ブログ」、(iii) トップページ最新記事 3 件 + 「すべて見る」、(iv) sitemap.xml** の 4 経路で確認できる（記録は本ファイル「実装後の視覚確認」欄に残す）。
- タグページの noindex（5 件未満タグ）は既存実装ロジック（`MIN_POSTS_FOR_TAG_INDEX = 5`）を維持し、`<meta name="robots" content="noindex">` が出力される。

#### 視覚検証（PM 自身による）

- 8 シナリオ × 4 パターン = **32 枚**のスクリーンショット（{初期 / page/2 / category/dev-notes / category/japanese-culture / tag/設計パターン / ?q=Next.js / category/dev-notes?q=hydration / ?q=zzzzz} × {w360, w1280} × {light, dark}）を `./tmp/cycle-183/screenshots/` に保存し、本ファイル「実装後の視覚確認」欄に確認結果を記録する。
- 観測必須要素（B-334-3-6 で列挙）: NEW バッジ視覚（5 件全部、視覚検証時の Date 巻き戻しは不要、ただしテストでは fake timers で 30 日境界を再現）、同一カテゴリ連続時の識別性、カテゴリ間の見え方差（MJ-5、dev-notes / japanese-culture 比較）、タグページの URL エンコード、ページネーション複合状態、検索中のページネーション無効化、ヒット件数表示（MJ-1）、ダークモード視認性。
- 並べ読み成果物（4 列: 計画リスト / 実装存在 / 差分 / 判定）を `./tmp/cycle-183/visual-check.md` に残す。

#### リダイレクト整合

- `/blog/tag/[tag]/page/1` への HTTP リクエストが `/blog/tag/[tag]` に 308 永続リダイレクトされる（`next.config.ts` 追記、ユニットテストで証明）。
- 既存の `/blog/page/1`、`/blog/category/:cat/page/1` リダイレクトは変更されず動作する。
- `(legacy)/blog/__tests__/pagination-redirect.test.ts` に新リダイレクトの case が追加されテストが通る。

### 計画にあたって参考にした情報

- **researcher レポート 1**: `./tmp/research/2026-05-07-blog-listing-routes-phase-4-3-research.md` — 6 ルートの実装と振る舞い、OGP の不在、`/blog/tag/[tag]/page/1` リダイレクト未定義のギャップ、共有コンポーネント `BlogListView` の責務、ナビゲーションでの `/blog` リンク経路、テストファイル一覧。**注意**: 本レポートには「タグ p2 = 3 / 合計 41 URL」という古い集計が含まれるが、これはレポート 3（最新かつ実体集計付き）の「タグ p2 = 6 / 合計 44 URL」と矛盾するため、**本計画書では一律レポート 3 の数値を採用**している。
- **researcher レポート 2**: `./tmp/research/2026-05-07-phase43-blog-list-design-migration-pattern-analysis.md` — cycle-181 (/tools) と cycle-182 (/play) で確立したパターン、ブログ固有の再判断点、4 層アーキテクチャ、newSlugsHelper 外出しパターン、a11y 責務、視覚検証手順、dead code 整理判断基準、タスクの並行/直列判断（AP-WF07 例外条件）。
- **researcher レポート 3**: `./tmp/research/2026-05-07-blog-metadata-distribution-survey.md` — 59 記事 / 5 カテゴリ / 33 タグの実体、frontmatter のフィールド名（`category` 単数 / `published_at` ハイフン区切り）、タイトル最大 69 文字 / description 77〜164 文字、直近 30 日 5 件、ページネーション 5 ページ、シリーズ分布（3 シリーズ / 27 記事、§9）。
- **計画段階の追加 Bash 実測**: 検索ヒット件数の上限実測（59 記事の title + description + tags + カテゴリ表示名を結合し `grep -c -i` で集計、最大「設計」34 件 / 中央値約 15 件、§B-334-3-3 の表）、シリーズ表示名追加時のヒット件数差分実測（「実践ノート」9 / 「運用記」13 / 「日本語・日本文化」5、いずれも 34 件を更新せず、§検討 §2 / §B-334-3-3）、シリーズ id と表示名のマッピング（`SERIES_LABELS` in `src/blog/_lib/blog.ts`）、シリーズ専用 URL の不在（`find src/app -path "*series*"` で 0 ヒット、§検討 §2 のシリーズ表示名採用根拠）。
- `docs/cycles/cycle-181.md`（Phase 4.1 ツール一覧の確立パターン、21 件の事故報告書、R5 で確立した `<Link>` + `aria-current` 方針、debounce 300ms + `router.replace`、空状態 `role="status"`、カード等高、AP-I02 個別上書き継承）
- `docs/cycles/cycle-182.md`（Phase 4.2 遊び一覧、cycle-181 の事故から学んだ計画段階予防、fact-check.md による事実情報転記、AP-WF07 例外条件の冒頭明示、視覚検証 5 シナリオ × 4 パターン = 20 枚、ターゲット主要/副次の yaml 動線起点導出）
- `docs/design-migration-plan.md` Phase 4 セクション L104-L132（4.3 範囲、a11y 責務 = WCAG 2.4.5 + aria-current + focus-visible + コントラスト + 44px、ヘッダー設計の前提）
- `docs/targets/AIの日記を読み物として楽しむ人.yaml`（M1c、主要ターゲット = 一覧の玄関口）
- `docs/targets/気に入った道具を繰り返し使っている人.yaml`（M1b、副次ターゲット = 俯瞰用途・記事再訪）
- `docs/targets/AIエージェントやオーケストレーションに興味があるエンジニア.yaml`（M1d、副次ターゲット = カテゴリでの探索）
- `docs/targets/Webサイト製作を学びたいエンジニア.yaml`（M1e、副次ターゲット = カテゴリでの探索）
- `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`（M1a、本サイクルでは主・副次いずれにも該当しないことを yaml の `search_intents` から確認）
- `docs/anti-patterns/planning.md`（AP-P01 / 04 / 07 / 08 / 14 / 16）
- `docs/anti-patterns/implementation.md`（AP-I02 — B-386 個別上書き継承の根拠）
- `docs/anti-patterns/workflow.md`（AP-WF01 / 02 / 03 / 05 / 07 / 09 / 11 / 12）
- `docs/anti-patterns/writing.md`（記事執筆向けだが、本サイクル該当範囲は限定的、§違反予防チェック参照）
- `docs/knowledge/nextjs.md`（Route Group 移行、useSearchParams + Suspense、`permanentRedirect()` の HTTP 308、cycle-181 違反 19 教訓）
- `DESIGN.md`（§2 カラートークン、§3 タイポ・絵文字禁止・アイコン原則禁止、§4 Panel 規約、§5 コンポーネント使用義務）
- `docs/backlog.md` B-334（Phase 4.3 スコープと D-12 / A-6 引き継ぎ）、B-386（Button/Input 44px、Queued 状態）、B-387（OGP 棚卸し、Queued 状態）
- `next.config.ts`（既存リダイレクト定義の確認、L29-L48 の paginationRedirects）
- 現行実装: `src/blog/_components/BlogListView.tsx` / `BlogCard.tsx` / `TagList.tsx`、`src/app/(legacy)/blog/page.tsx` および 5 つの派生ルート
- 参照実装: `src/tools/_components/ToolsListView.tsx` / `ToolsFilterableList.tsx` / `ToolsGrid.tsx` / `ToolCard.tsx` / `newSlugsHelper.ts` / `categoryLabels.ts`（cycle-181 完成形）、`src/play/_components/` 同等ファイル群（cycle-182 完成形）

### 違反予防チェック（計画着手時の自己確認）

`docs/anti-patterns/{planning,implementation,writing,workflow}.md` の全項目を 1 つずつ確認し、本計画で発火しうるものを列挙して予防策を計画に織り込む。

| 予防対象（出典）                                                         | 本計画での予防策                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AP-P01**（仮定の定量的実測の先送り）                                   | NEW バッジ閾値（30 日 / 5 件積集合）は cycle-181/182 で確立済み。本サイクルでは researcher レポート 3 §4 で直近 30 日 5 件を実測済みのため初期表示の妥当性を計画段階で確認できている。検索対象フィールド選定も yaml `search_intents` の実体から導出。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **AP-P02**（都合の悪いデータの無視）                                     | カテゴリ URL ルーティング維持の判断（§検討した他の選択肢 §1）で「クエリパラメータ方式の利点」も明示し、SEO リスクと UX 一貫性のトレードオフを並べた上で判断根拠を記載。検索対象フィールド選定でも description 除外パターン / slug 含めるパターン / 本文含めるパターンを棄却理由付きで列挙。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **AP-P03**（現状所与の計画）                                             | 59 記事は今後も増加する前提で、ページネーション維持・タグページ静的生成維持・SEO URL 保持を判断。100 記事到達時にも同設計で破綻しないか確認（59 → 100 でクライアントサイドフィルタの計算量は変わらず、静的生成 URL 数も大きく増えない）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **AP-P04**（Owner 発言の無検証採用）                                     | Owner 指示は受けていない。D-12（タイトル全文 + タグ + カテゴリ最低基準）は Owner 発言ではなく backlog 記載の確定要件。description を加える判断は yaml から PM が独立に導出。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **AP-P05**（前サイクル反射）                                             | cycle-181 の 21 件 + cycle-182 の R2 同型再発を「踏襲すべきパターン」として吸収し、極端な反射（cycle-182 と全く違う方式に振る等）はしていない。サイト内一貫性は M1b/M1c の `likes` から独立に導出。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **AP-P06**（既存調査・コンテンツ重複の検証）                             | researcher レポート 3 本を全文確認。重複・矛盾なし。過去意思決定（cycle-181 R5 で確立した `<Link>` + `aria-current`、cycle-182 で確立した検索対象フィールドの shortTitle 含める判断 = blog では shortTitle が存在しないため適用外）の経緯と根拠を確認済み。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **AP-P07**（来訪者起点 / UI 認知モデル）                                 | §来訪者価値で yaml フィールド → ニーズ → 設計要件 → 実装方式の 3 段推論を全 5 ターゲットについて記述。UI コンポーネントは「来訪者の認知モデル = タブ」から先に決め、`<Link>` + `aria-current` を採用（cycle-181 R5 と整合）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **AP-P08**（ゼロベース検討の限定）                                       | 6 論点（カテゴリ URL アーキテクチャ / 検索対象フィールド / ページネーション + 検索の URL 設計 / 既存コンポーネント処遇 / スコープ / a11y / リダイレクトギャップ / dead code / 視覚検証シナリオ）について全てゼロベース検討し、棄却案も明記。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **AP-P09**（goal の読み替え）                                            | ゴールは「higher page views by providing the best value for visitors」。SEO スコア向上を理由にカテゴリ URL 維持を選んだのではなく、「M1d/M1e の検索流入経路を保持する = 来訪者価値」として導出（§検討した他の選択肢 §1）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **AP-P10**（高評価の無批判採用）                                         | 該当なし。確信度ラベルは使っていない。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **AP-P11**（過去 AI 決定の不可侵化）                                     | cycle-181/182 の決定（タブ的ナビ、debounce 300ms、検索対象フィールドの選定）は本サイクルでも踏襲するが、それは「現時点で来訪者価値最大」という独立評価に基づく。blog 固有の再判断（カテゴリ URL 維持、検索対象に description 含める、検索中ページネーション無効化）は cycle-181/182 と異なる判断を本サイクル独立に下している。                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **AP-P12**（過去失敗の分析なし同種施策）                                 | 該当なし。本サイクルは新規施策（blog 一覧の新デザイン移行）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **AP-P13**（フレームワーク先行）                                         | 該当なし。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **AP-P14**（調査範囲の恣意的限定）                                       | researcher レポート 3 本でブログ全体を網羅。隠れた候補（記事本文検索）も §検討した他の選択肢 §2 で棄却理由付きで言及。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **AP-P15**（成功体験への引きずり）                                       | cycle-181/182 のパターン踏襲は明示的判断。blog 固有の差分（59 記事の規模、タグの複数値、SEO URL の SEO 価値、`published_at` のフィールド名差異）は本サイクル独立に判断。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **AP-P16**（複合条件の片側未確認）                                       | researcher レポート 3 本 + `ls`（`src/app/(legacy)/blog/` 配下確認）+ `grep`（BlogListView/BlogCard 参照箇所確認）+ `Read`（next.config.ts、BlogListView.tsx、BlogCard.tsx）で実体確認済み。直近 30 日記事数 = researcher レポート + B-334-3-4 で再記載。タスク列挙時に「他タスクの状態」を実体確認: B-386 / B-387 は `docs/backlog.md` の Active セクションで Queued であることを確認。                                                                                                                                                                                                                                                                                                                                                                                                              |
| **AP-I01**（来訪者観点のレビュー欠落）                                   | 完了基準を観測可能な記述（grep / DevTools / テストで証明可能）のみで列挙。来訪者観点は §来訪者価値 + §視覚検証で扱う。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **AP-I02**（場当たり的回避）                                             | カテゴリ・タグ・検索入力・ページネーションリンクの 44px 個別上書きは AP-I02 抵触の継承。理由: B-386（Button/Input 本体修正）はサイト全体に影響する独立タスクで、本サイクルで前倒しすると AP-WF07（独立タスク混在）抵触リスク。継承を §B-334-3-3 a11y / §検討 §6 で明記し、キャリーオーバーで再記録。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **AP-I03**（バンドルサイズ無視）                                         | 記事本文を検索対象に含める案を棄却（§検討 §2）。バンドルサイズ増を回避。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **AP-I04**（指標の直接最適化）                                           | 該当なし。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **AP-I05**（来訪者目的を妨げるコンテンツ追加）                           | ヒーロー領域は最小化（h1 + 簡潔リード）。「いかがでしたか」型の煽り文言を入れない（M1c の dislikes 直接対応）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **AP-I06**（前回への反射的反対）                                         | 該当なし。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **AP-I07**（Next.js layout / CSS / production ビルド固有のバグ）         | Suspense ラップを完了基準に明記。`react-hooks/purity` 制約への適合（newSlugs を Server で計算して prop で渡す）も明記。Playwright での本番ビルド検証は `npm run build` 通過 + 視覚検証（dev サーバー）で代替。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **AP-I08**（DESIGN.md 未定義の表現追加）                                 | Lucide アイコン採用は本サイクル選択不可（DESIGN.md §3 改訂相当のため builder 個別判断不可）。識別性不足が判明した場合は description 行数増等の DESIGN.md 範囲内での補強案を builder が選択。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **AP-W01〜AP-W09**（記事執筆系）                                         | 本サイクルは記事執筆を含まないため発火範囲は限定的。ただし、ヒーローのリード文・カテゴリ説明文・空状態文言は M1c の dislikes（定型的締め、絵文字、誇張）に該当しないよう builder に「淡々と機能を伝える」方向のみ指示し、具体文言は委ねる。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **AP-WF01**（早く完了させたいバイアス）                                  | 各タスクのレビュー記録をサイクルドキュメントに残す。B-334-3-1〜B-334-3-7 ごとにレビュー結果を本ファイルに記録する手順を完了基準で要求。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **AP-WF02**（来訪者目線レビュー欠落）                                    | reviewer への指示は「来訪者観点」を最優先とする。技術正確性チェックは付帯。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **AP-WF03**（builder への literal 指示）                                 | 各タスクは「何を / なぜ / 最終状態」止まり。JSX 構造・CSS クラス名・assertion 文言・テストコードの literal は記述していない。focus-visible 値も DESIGN.md §2 規約準拠と表現。Lucide アイコン採用は builder 判断不可・PM escalation 必須として明記。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **AP-WF04**（完了通知の検証なし採用）                                    | 構造的変更（旧 BlogListView 削除 → 新 BlogListView 配置 → 6 ルートからの参照切替）は同 commit 内アトミックを要求し、grep で旧コンポーネント参照ゼロを確認することを完了基準に明記。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **AP-WF05**（4 パターン視覚確認漏れ）                                    | B-334-3-6 で **32 枚（8 シナリオ × 4 パターン）**の視覚検証を PM 自身に課し、観測対象を事前列挙（NEW / 同一カテゴリ識別性 / カテゴリ間の見え方差 (MJ-5) / タグページエンコード / ページネーション複合 / 検索中ページネーション無効化 / ヒット件数表示 (MJ-1) / ダークモード視認性）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **AP-WF06**（事実情報の事前確認なし）                                    | 全事実情報（59 記事、5 カテゴリ、33 タグ、26 静的タグ、18 noindex 解除タグ、直近 30 日 5 件、5 ページ、**44 URL**（タグ p2 = 6 を含む、レポート 3 採用）、`published_at` ハイフン区切り、タイトル最大 69 文字、description 77〜164 文字、人気タグ Top 8、カテゴリ別件数 23/16/8/7/5、タグ別件数 21/17/15/15/15/14/...、`/blog/tag/[tag]/page/1` 未定義、**シリーズ 3 種 27 記事 + シリーズ専用 URL の不在**（MJ-B 対応で追加実測））は researcher レポート 3 本（特にレポート 3）と Bash 実行（`ls`、`grep`、`Read`、`find`）で事前確認済み。**計画書に書いた数値はすべて researcher レポート 3 + Bash 実測からの転記**で、PM の記憶に基づく数値はゼロ。検索ヒット件数の最大値（「設計」34 件）も Bash 実測で確認（MJ-1 対応）。シリーズ表示名追加時のヒット件数差分も Bash 実測で確認（MJ-B 対応）。 |
| **AP-WF07**（独立タスクの一括委任 / 並行不能タスクの並行アサイン両方向） | タスクリストを B-334-3-1 〜 B-334-3-7 + dead code 整理に分割。**B-334-3-2/3/4 は同一ファイル変更を含むため並行不能、同一 builder 直列依頼**（または 1 builder で一括）。**B-334-3-1 と B-334-3-7 は触るファイル独立で並行可**。AP-WF07 例外条件（cycle-182 で確立）を「実施する作業」冒頭で明記。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **AP-WF08**（PM のサブエージェント代行）                                 | 該当なし。本計画書執筆は PM の責務。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **AP-WF09**（チェックリスト形式通過）                                    | 違反予防チェック表に書いた予防策を、計画書本文の事実記述と完了基準に対応付け。「ターゲット主要/副次のラベル整合性」を grep で点検（cycle-182 R3 同型再発防止: 本ファイル内で「M1c」「主要ターゲット」「副次ターゲット」が一貫して登場するか）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **AP-WF10**（SendMessage 連続）                                          | 該当なし。タスクごとに新エージェント。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **AP-WF11**（PM 通読・並べ読み）                                         | 視覚検証は PM 自身が実施し、並べ読み成果物（4 列テーブル）を `./tmp/cycle-183/visual-check.md` に残す。reviewer 承認を PM 判断の代用にしない。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **AP-WF12**（事実情報の実体確認）                                        | 計画書に書いた全事実情報（ファイルパス、ディレクトリ構造、件数、リダイレクト定義の有無、フィールド名、フィールド型、他タスクの Backlog 状態）を `ls`/`grep`/`Read`/researcher レポートで実体確認。Next.js `permanentRedirect()` のステータスコードは 308（cycle-181 違反 19 教訓 + `docs/knowledge/nextjs.md` 確認済み）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **AP-WF12 補（researcher レポート間の数値矛盾を最新優先で吸収）**        | 複数の researcher レポートで同一指標の数値が矛盾する場合、**より最新かつ詳細な調査を採用し、古い数値は採用しない**。本サイクルではレポート 1（旧集計：タグ p2 = 3 / 合計 41 URL）とレポート 3（最新集計：タグ p2 = 6 / 合計 44 URL）が矛盾していたため、レポート 3 を一次情報源として採用。計画書の冒頭・§完了基準・§参考情報の 3 箇所でその採用方針と内訳を明記し、後続の builder / reviewer が古い数値を参照しないようにする。検索ヒット件数も PM 推測ではなく Bash 実測を計画段階で実行（MJ-1 対応）。                                                                                                                                                                                                                                                                                             |

### 実装後の視覚確認

<!-- 実施時に記録: B-334-3-6 で PM 自身が Playwright MCP で実施した視覚検証の結果（8 シナリオ × 4 パターン = 32 枚のスクリーンショット保存先、観測対象ごとの判定、並べ読み成果物 (4 列テーブル) の所在、WCAG 2.4.5 4 経路の記録、修正が必要な事項等）をここに記録する。書式は cycle-181 / cycle-182 を踏襲。 -->

## レビュー結果

<作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。>

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

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
