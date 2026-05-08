---
id: 183
description: B-334 Phase 4.3（ブログ一覧の新デザイン移行）を実施する。`/blog`、`/blog/page/[page]`、`/blog/category/[category]`、`/blog/category/[category]/page/[page]`、`/blog/tag/[tag]`、`/blog/tag/[tag]/page/[page]` の 6 ルートを `(new)/` 配下に移行し、DESIGN.md に準拠した新デザインと、タイトル + description + タグ + カテゴリ表示名 + シリーズ表示名（5 系統）を横断するキーワード検索（`?q=`、300ms debounce）+ カテゴリ静的ルート維持型のフィルタを実装する。記事詳細（`/blog/[slug]`）は Phase 6 のスコープとして本サイクルでは触らない。Phase 4 の 3 サイクル目。
started_at: "2026-05-07T19:42:26+0900"
completed_at: "2026-05-08T01:01:41+0900"
---

# サイクル-183

このサイクルでは、デザイン移行計画 Phase 4 のうち **Phase 4.3（ブログ一覧）** を実施する。`/blog` 一覧および派生ルート（ページネーション・カテゴリ・タグ計 6 ルート）を `src/app/(new)/` 配下に移行し、新デザイン体系（DESIGN.md）に沿って再設計したうえで、ブログ一覧内の絞り込み機能（タイトル + description + タグ + カテゴリ表示名 + シリーズ表示名の 5 系統を対象とするキーワード検索 + 既存のカテゴリ別 URL ルーティング）を追加する。

Phase 4 全体（4.1 ツール / 4.2 遊び / 4.3 ブログ / 4.4 トップ）は Owner 指示によりサブフェーズごとに独立サイクルとして実施する。本サイクルは Phase 4 の 3 番目のサイクルとなる（4.1 は cycle-181、4.2 は cycle-182 で完了）。

本サイクルの来訪者向け変化は、ブログ一覧の新デザイン適用と検索流入後のページ内絞り込み手段の追加。検索流入で /blog に着地した M1c（AIの日記を読み物として楽しむ人）が興味のあるテーマや書き手の癖でドリルダウンでき、M1b（リピーター）が「前に読んだあの記事」をキーワードで思い出せる状態になる。記事詳細ページ（`/blog/[slug]`）への遷移先は Phase 6 まで legacy 側のままだが、来訪者から見て URL は不変・遷移は問題なく成立する。

なお、Phase 4.3 はサブルート数が多い（一覧本体・ページネーション・カテゴリ × 2 系統・タグ × 2 系統の計 6 ルート、`generateStaticParams` で生成される URL は **41 URL**）。本サイクルでは 6 ルート全てを移行スコープに含む。判断の根拠は §作業内容 と §検討した他の選択肢で詳述する。`/blog/[slug]`（記事詳細）と OGP 画像（B-387）は明示的にスコープ外。

> **規模の数値根拠（実体集計を一次情報源とする方針）**: URL 件数・タグ p2 数などの数値はすべて `npx tsx -e 'import { getAllBlogPosts } from "src/blog/_lib/blog"; ...'` による実体集計を一次情報源として採用する。**【重要 / 事後訂正】**: B-334-3-5 の builder が AP-WF12 に従って実体確認した結果、**実体は「タグ p2 = 3 タグ（設計パターン 21 / Web開発 17 / Next.js 15）」「合計 41 URL」**であり、当初計画段階の reviewer-r1 CR-1 で採用した「タグ p2 = 6 / 合計 44 URL」（researcher レポート 3 由来）は誤集計だった。researcher レポート 1 の元の集計（「タグ p2 = 3 / 合計 41 URL」）が実体と一致していたが、レビュー時に**最新レポート優先で吸収する**判断を機械的に適用した結果、より正確だった旧集計を捨ててしまった（AP-WF12 再発、§違反予防チェック §AP-WF12 補に追記）。本ファイルでは **実体に基づき「タグ p2 = 3」「合計 41 URL」**で記述している。

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

- [x] B-334-3-1: ルート移行（`(legacy)/blog/` 配下の一覧系 6 ルート + `layout.tsx` を `(new)/blog/` に `git mv`。**B-334-3-2 と同 commit（commit A）内で**新コンポーネント（B-334-3-2 で実装する `BlogListView` 新版 + `BlogFilterableList` + `BlogGrid` + `BlogCard` 新版）への参照差し替え。詳細は §B-334-3-1 / §10 commit 粒度）
- [x] B-334-3-2: BlogListView（Server）/ BlogFilterableList（Client）/ BlogGrid / BlogCard / `newSlugsHelper.ts` / `searchFilter.ts` 等の新規コンポーネント・ヘルパー設計と DESIGN.md 準拠の新デザイン適用、Suspense ラップ、`react-hooks/purity` 回避のための純関数外出し
- [x] B-334-3-3: カテゴリ・タグナビ + キーワード検索 UI の実装（**B-334-3-2 完了後に同一 builder へ直列依頼**）。タイトル + description + タグ + カテゴリ表示名 + シリーズ表示名の 5 系統を横断する `?q=` 検索、`buildCategoryHref` / `buildTagHref` でのキーワード引き継ぎ、空状態 `role="status"`、ページネーションへの `?q=` 引き継ぎ、aria-current 統一
- [x] B-334-3-4: NEW バッジ判定ロジック（積集合方式）と `published_at` 降順の単一グリッド適用（**B-334-3-3 完了後に同一 builder へ直列依頼**）。`published_at` （ハイフン区切り）対応の `calculateNewSlugs` 実装
- [x] B-334-3-5: テスト整備（フィルター・検索・NEW・ページネーション・不正パラメータ・タグページ noindex 閾値・generateStaticParams 整合等の振る舞いテスト）。**(a) 純関数テスト**は B-334-3-2 と並行可能（別 builder 可）、**(b) コンポーネント振る舞いテスト**は B-334-3-4 完了後に同一 builder へ直列
- [x] B-334-3-6: PM 自身による視覚検証（8 シナリオ × 4 パターン = 32 枚。シナリオ内訳と観測対象は §B-334-3-6 を参照）と完了基準チェック
- [x] B-334-3-7: `next.config.ts` の `redirects()` に `/blog/tag/[tag]/page/1` → `/blog/tag/[tag]` を追記（既存ギャップの解消、B-334-3-1 と独立して並行可）

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
  - → 設計要件: 既存 URL（`/blog`、`/blog/category/[cat]`、`/blog/tag/[tag]`、`/blog/page/[n]` 等）を保持。新デザイン下でも sitemap に掲載済みの 41 URL（generateStaticParams 生成数、内訳は §完了基準 §ルート・基本動作）が動作する。
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
- **なぜ**: `useSearchParams` を使うフィルタ部分のみ Client Component に閉じ、ページ本体（`generateStaticParams`、metadata、Breadcrumb JSON-LD など）は Server Component に保つ。Suspense ラップは Next.js が要求する仕様要件（欠落するとビルド失敗）。Server Component に閉じれば 41 URL の静的生成も維持できる。
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
    - `(legacy)/blog/__tests__/pagination-redirect.test.ts`: import パスを `(new)/blog/...` に追従。`generateStaticParams` の整合検証は新版でも維持。**タグ p2 が 3 タグ（設計パターン 21 / Web開発 17 / Next.js 15）全てで生成されることを観測対象として assertion に含める**（実体集計、`getAllBlogPosts()` で確認）。カテゴリ p2 が dev-notes / ai-workflow の 2 つで生成されることも assertion 対象。
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
  - **Pagination 配下の 44px 全状態確認（M-1 / B-388 関連）**: シナリオ 2（/blog/page/2）で Pagination 配下の `pageItem` 全状態（通常リンク / `aria-current="page"` の active / `disabled` の前リンクなど無効状態）について `getBoundingClientRect()` で 44px 以上を観測。本サイクルでは BlogFilterableList 側の個別上書きによる応急処置で対応している関係で、Pagination 本体修正（B-388）への送り出しが正しく機能していることを視覚で担保する。
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
  - **静的生成で 41 URL がインデックス可能なメリット vs クエリパラメータ方式で動的フィルタになるメリット**: tools・play の場合は記事数が少なく（34 / 20）静的生成の SEO 価値が薄かった。blog は 59 記事 + 33 タグ = 多くのテーマ別コンテキストがあり、静的 URL の SEO 価値が大きい。
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
  - **commit C（4446aa63）**: `next.config.ts` のリダイレクト追記 **+ 9 ファイルの `git mv`**（page.tsx 6 個 + テスト 2 個 + `(legacy)/blog/layout.tsx` 1 個。B-334-3-7 が B-334-3-1 のサブ作業を侵食。なお `(new)/blog/layout.tsx` はその後 fccb3bcf で MN-3 対応として削除されたため現状は存在しない）
  - **commit A（587359c6）**: 新コンポーネント実装と参照差し替え（git mv は含まず）
  - **commit A-fix（fccb3bcf）**: レビュー指摘 M-1（Pagination 44px）と MINOR の修正
  - 本サイクル中の本番停止級バグへの rollback は、当初計画の「commit A 単独 revert」では機能せず、**commit A + commit C を併せて revert する必要がある**（commit C を残したまま commit A を revert すると、ルートは `(new)/blog/` 配下にあるが新コンポーネント実装が消えてビルド不能になる）。タグページのみの部分 rollback が不可能な点は当初計画通り。
  - 本件は AP-WF13（並行アサイン時のスコープ越境）に該当し、`docs/anti-patterns/workflow.md` に予防策を追記済み。今後は builder への指示文に「他のファイルは触らない」を明示することで再発を予防する。本サイクルでは案 B（計画書の rollback 戦略を実態に合わせて改訂）を採用し、`git rebase` での commit 再構成は行わない（既に push 前で main に未公開のため、追加リスクの導入を避ける判断）。

### 完了基準

以下がすべて満たされた時点で Phase 4.3 完了とする（**観測可能な形のみで列挙**）。

#### ルート・基本動作

- 6 ルートで合計 **41 URL** が `(new)/blog/` 配下のソースから配信されている（researcher レポート 3 §3 / §タグ別件数表より集計、内訳は下記）。`src/app/(new)/blog/...` に各 page.tsx が存在し、`src/app/(legacy)/blog/page.tsx` 等は git 上で削除済み。`(legacy)/blog/[slug]/` および `(legacy)/blog/[slug]/__tests__/` は残置。
  - `/blog`: 1
  - `/blog/page/[2-5]`: 4（59 件 / 12 件 / ページ = 5 ページ → page/2〜5 の 4 URL）
  - `/blog/category/[cat]`: 5（dev-notes / ai-workflow / site-updates / tool-guides / japanese-culture）
  - `/blog/category/[cat]/page/[n]`: 2（dev-notes 23 件 → p2、ai-workflow 16 件 → p2 の計 2 URL。残りカテゴリは 12 件未満で p2 なし）
  - `/blog/tag/[tag]`: 26（`MIN_POSTS_FOR_TAG_PAGE = 3` 以上のタグ）
  - `/blog/tag/[tag]/page/[n]`: **3**（12 件以上のタグ = 設計パターン 21 / Web開発 17 / Next.js 15 の **3 タグ**全てで p2 が生成される。`getAllBlogPosts()` 実体集計、AIエージェント 8 / 失敗と学び 8 / ワークフロー 7 などはいずれも 12 件未満で p2 非生成）
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

- カテゴリリンク・タグリンク（人気タグ + タグページ内）・検索入力・**ページネーションリンク（通常 / active / disabled の全状態）**の計算スタイルで `min-height` が 44px 以上（DevTools / `getBoundingClientRect()` で確認）。Pagination 本体（`src/components/Pagination/Pagination.module.css`）の修正は B-388 のスコープのため、本サイクルでは BlogFilterableList 側の `:global` セレクタ相当で個別上書きする（AP-I02 抵触の継承）。
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

#### テスト整備（B-334-3-5 必須要件）

下記の test assertion 群が `pagination-redirect.test.ts` / `tag-page.test.ts` / 新規作成する `BlogFilterableList.test.tsx` / `BlogCard.test.tsx` / `searchFilter.test.ts` / `newSlugsHelper.test.ts` のいずれかに含まれていること。具体の書き方は B-334-3-5 担当の builder 判断（AP-WF03 抵触回避）。

- **`searchFilter.ts` の `filterPostsByKeyword` 8 項目**: §B-334-3-5 (a) (i)〜(viii) の全項目（タイトル/description/tags/カテゴリ表示名/シリーズ表示名でのヒット、`series` が null の記事はシリーズ表示名でヒットしない、大文字小文字不区別、空キーワード全件、ヒットなしで 0 件）。
- **`newSlugsHelper.ts` の `calculateNewSlugs` 5 項目**: §B-334-3-5 (a) (i)〜(v) の全項目（30 日 × 上位 5 件の積集合、30 日境界、5 件以下、降順、ハイフン区切り `published_at` のパース）。
- **`pagination-redirect.test.ts` の追加 case（B-334-3-7 連動）**: `/blog/tag/[tag]/page/1` → `/blog/tag/[tag]` の 308 リダイレクト assertion。`next.config.ts` の `paginationRedirects` を spy して該当エントリの存在を検証する形でも、redirect 関数の戻り値を直接検証する形でもよい（builder 判断）。
- **`generateStaticParams` の数値整合 assertion**: タグ p2 が **3 タグ**（設計パターン / Web開発 / Next.js）全てで生成されること、カテゴリ p2 が **2 カテゴリ**（dev-notes / ai-workflow）で生成されること、`/blog/page/[page]` が p2〜p5 の **4 個**を返すこと（`getAllBlogPosts()` 実体集計、41 URL の内訳と一致）。

### 計画にあたって参考にした情報

- **researcher レポート 1**: `./tmp/research/2026-05-07-blog-listing-routes-phase-4-3-research.md` — 6 ルートの実装と振る舞い、OGP の不在、`/blog/tag/[tag]/page/1` リダイレクト未定義のギャップ、共有コンポーネント `BlogListView` の責務、ナビゲーションでの `/blog` リンク経路、テストファイル一覧。**【事後訂正】**: 本レポートの集計「タグ p2 = 3 / 合計 41 URL」は実体（`getAllBlogPosts()`）と一致していたが、レポート 3 が「タグ p2 = 6 / 合計 44 URL」と異なる集計を出していたため、reviewer-r1 CR-1 で「最新優先」原則に従いレポート 3 を採用した。これは AP-WF12 再発で、B-334-3-5 builder の AP-WF12 実体確認で訂正された（実体は「タグ p2 = 3 / 合計 41 URL」）。本計画書は実体集計を一次情報源として採用。
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

| 予防対象（出典）                                                                | 本計画での予防策                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **AP-P01**（仮定の定量的実測の先送り）                                          | NEW バッジ閾値（30 日 / 5 件積集合）は cycle-181/182 で確立済み。本サイクルでは researcher レポート 3 §4 で直近 30 日 5 件を実測済みのため初期表示の妥当性を計画段階で確認できている。検索対象フィールド選定も yaml `search_intents` の実体から導出。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **AP-P02**（都合の悪いデータの無視）                                            | カテゴリ URL ルーティング維持の判断（§検討した他の選択肢 §1）で「クエリパラメータ方式の利点」も明示し、SEO リスクと UX 一貫性のトレードオフを並べた上で判断根拠を記載。検索対象フィールド選定でも description 除外パターン / slug 含めるパターン / 本文含めるパターンを棄却理由付きで列挙。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **AP-P03**（現状所与の計画）                                                    | 59 記事は今後も増加する前提で、ページネーション維持・タグページ静的生成維持・SEO URL 保持を判断。100 記事到達時にも同設計で破綻しないか確認（59 → 100 でクライアントサイドフィルタの計算量は変わらず、静的生成 URL 数も大きく増えない）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **AP-P04**（Owner 発言の無検証採用）                                            | Owner 指示は受けていない。D-12（タイトル全文 + タグ + カテゴリ最低基準）は Owner 発言ではなく backlog 記載の確定要件。description を加える判断は yaml から PM が独立に導出。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **AP-P05**（前サイクル反射）                                                    | cycle-181 の 21 件 + cycle-182 の R2 同型再発を「踏襲すべきパターン」として吸収し、極端な反射（cycle-182 と全く違う方式に振る等）はしていない。サイト内一貫性は M1b/M1c の `likes` から独立に導出。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **AP-P06**（既存調査・コンテンツ重複の検証）                                    | researcher レポート 3 本を全文確認。重複・矛盾なし。過去意思決定（cycle-181 R5 で確立した `<Link>` + `aria-current`、cycle-182 で確立した検索対象フィールドの shortTitle 含める判断 = blog では shortTitle が存在しないため適用外）の経緯と根拠を確認済み。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **AP-P07**（来訪者起点 / UI 認知モデル）                                        | §来訪者価値で yaml フィールド → ニーズ → 設計要件 → 実装方式の 3 段推論を全 5 ターゲットについて記述。UI コンポーネントは「来訪者の認知モデル = タブ」から先に決め、`<Link>` + `aria-current` を採用（cycle-181 R5 と整合）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **AP-P08**（ゼロベース検討の限定）                                              | 6 論点（カテゴリ URL アーキテクチャ / 検索対象フィールド / ページネーション + 検索の URL 設計 / 既存コンポーネント処遇 / スコープ / a11y / リダイレクトギャップ / dead code / 視覚検証シナリオ）について全てゼロベース検討し、棄却案も明記。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **AP-P09**（goal の読み替え）                                                   | ゴールは「higher page views by providing the best value for visitors」。SEO スコア向上を理由にカテゴリ URL 維持を選んだのではなく、「M1d/M1e の検索流入経路を保持する = 来訪者価値」として導出（§検討した他の選択肢 §1）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **AP-P10**（高評価の無批判採用）                                                | 該当なし。確信度ラベルは使っていない。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **AP-P11**（過去 AI 決定の不可侵化）                                            | cycle-181/182 の決定（タブ的ナビ、debounce 300ms、検索対象フィールドの選定）は本サイクルでも踏襲するが、それは「現時点で来訪者価値最大」という独立評価に基づく。blog 固有の再判断（カテゴリ URL 維持、検索対象に description 含める、検索中ページネーション無効化）は cycle-181/182 と異なる判断を本サイクル独立に下している。                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **AP-P12**（過去失敗の分析なし同種施策）                                        | 該当なし。本サイクルは新規施策（blog 一覧の新デザイン移行）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **AP-P13**（フレームワーク先行）                                                | 該当なし。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **AP-P14**（調査範囲の恣意的限定）                                              | researcher レポート 3 本でブログ全体を網羅。隠れた候補（記事本文検索）も §検討した他の選択肢 §2 で棄却理由付きで言及。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **AP-P15**（成功体験への引きずり）                                              | cycle-181/182 のパターン踏襲は明示的判断。blog 固有の差分（59 記事の規模、タグの複数値、SEO URL の SEO 価値、`published_at` のフィールド名差異）は本サイクル独立に判断。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **AP-P16**（複合条件の片側未確認）                                              | researcher レポート 3 本 + `ls`（`src/app/(legacy)/blog/` 配下確認）+ `grep`（BlogListView/BlogCard 参照箇所確認）+ `Read`（next.config.ts、BlogListView.tsx、BlogCard.tsx）で実体確認済み。直近 30 日記事数 = researcher レポート + B-334-3-4 で再記載。タスク列挙時に「他タスクの状態」を実体確認: B-386 / B-387 は `docs/backlog.md` の Active セクションで Queued であることを確認。                                                                                                                                                                                                                                                                                                                                                                                                   |
| **AP-I01**（来訪者観点のレビュー欠落）                                          | 完了基準を観測可能な記述（grep / DevTools / テストで証明可能）のみで列挙。来訪者観点は §来訪者価値 + §視覚検証で扱う。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **AP-I02**（場当たり的回避）                                                    | カテゴリ・タグ・検索入力・ページネーションリンクの 44px 個別上書きは AP-I02 抵触の継承。理由: B-386（Button/Input 本体修正）はサイト全体に影響する独立タスクで、本サイクルで前倒しすると AP-WF07（独立タスク混在）抵触リスク。継承を §B-334-3-3 a11y / §検討 §6 で明記し、キャリーオーバーで再記録。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **AP-I03**（バンドルサイズ無視）                                                | 記事本文を検索対象に含める案を棄却（§検討 §2）。バンドルサイズ増を回避。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **AP-I04**（指標の直接最適化）                                                  | 該当なし。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **AP-I05**（来訪者目的を妨げるコンテンツ追加）                                  | ヒーロー領域は最小化（h1 + 簡潔リード）。「いかがでしたか」型の煽り文言を入れない（M1c の dislikes 直接対応）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **AP-I06**（前回への反射的反対）                                                | 該当なし。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **AP-I07**（Next.js layout / CSS / production ビルド固有のバグ）                | Suspense ラップを完了基準に明記。`react-hooks/purity` 制約への適合（newSlugs を Server で計算して prop で渡す）も明記。Playwright での本番ビルド検証は `npm run build` 通過 + 視覚検証（dev サーバー）で代替。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **AP-I08**（DESIGN.md 未定義の表現追加）                                        | Lucide アイコン採用は本サイクル選択不可（DESIGN.md §3 改訂相当のため builder 個別判断不可）。識別性不足が判明した場合は description 行数増等の DESIGN.md 範囲内での補強案を builder が選択。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **AP-W01〜AP-W09**（記事執筆系）                                                | 本サイクルは記事執筆を含まないため発火範囲は限定的。ただし、ヒーローのリード文・カテゴリ説明文・空状態文言は M1c の dislikes（定型的締め、絵文字、誇張）に該当しないよう builder に「淡々と機能を伝える」方向のみ指示し、具体文言は委ねる。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **AP-WF01**（早く完了させたいバイアス）                                         | 各タスクのレビュー記録をサイクルドキュメントに残す。B-334-3-1〜B-334-3-7 ごとにレビュー結果を本ファイルに記録する手順を完了基準で要求。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **AP-WF02**（来訪者目線レビュー欠落）                                           | reviewer への指示は「来訪者観点」を最優先とする。技術正確性チェックは付帯。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **AP-WF03**（builder への literal 指示）                                        | 各タスクは「何を / なぜ / 最終状態」止まり。JSX 構造・CSS クラス名・assertion 文言・テストコードの literal は記述していない。focus-visible 値も DESIGN.md §2 規約準拠と表現。Lucide アイコン採用は builder 判断不可・PM escalation 必須として明記。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **AP-WF04**（完了通知の検証なし採用）                                           | 構造的変更（旧 BlogListView 削除 → 新 BlogListView 配置 → 6 ルートからの参照切替）は同 commit 内アトミックを要求し、grep で旧コンポーネント参照ゼロを確認することを完了基準に明記。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **AP-WF05**（4 パターン視覚確認漏れ）                                           | B-334-3-6 で **32 枚（8 シナリオ × 4 パターン）**の視覚検証を PM 自身に課し、観測対象を事前列挙（NEW / 同一カテゴリ識別性 / カテゴリ間の見え方差 (MJ-5) / タグページエンコード / ページネーション複合 / 検索中ページネーション無効化 / ヒット件数表示 (MJ-1) / ダークモード視認性）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **AP-WF06**（事実情報の事前確認なし）                                           | 全事実情報（59 記事、5 カテゴリ、33 タグ、26 静的タグ、16 noindex 解除タグ、直近 30 日 5 件、5 ページ、**41 URL**（タグ p2 = 3、`getAllBlogPosts()` 実体集計）、`published_at` ハイフン区切り、タイトル最大 69 文字、description 77〜164 文字、人気タグ Top 8、カテゴリ別件数 23/16/8/7/5、タグ別件数 21/17/15/11/10/9/9/8/8/8/7/...、`/blog/tag/[tag]/page/1` 未定義、**シリーズ 3 種 27 記事 + シリーズ専用 URL の不在**（MJ-B 対応で追加実測））は researcher レポート 3 本 + 計画段階 Bash 実測 + B-334-3-5 builder の `getAllBlogPosts()` 実体集計で事前確認済み。**【事後訂正】 reviewer-r1 CR-1 でレポート 3 由来の「タグ p2 = 6 / 44 URL」を採用したが、実体は「タグ p2 = 3 / 41 URL」だった**。AP-WF12 補参照。                                                                   |
| **AP-WF07**（独立タスクの一括委任 / 並行不能タスクの並行アサイン両方向）        | タスクリストを B-334-3-1 〜 B-334-3-7 + dead code 整理に分割。**B-334-3-2/3/4 は同一ファイル変更を含むため並行不能、同一 builder 直列依頼**（または 1 builder で一括）。**B-334-3-1 と B-334-3-7 は触るファイル独立で並行可**。AP-WF07 例外条件（cycle-182 で確立）を「実施する作業」冒頭で明記。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **AP-WF08**（PM のサブエージェント代行）                                        | 該当なし。本計画書執筆は PM の責務。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **AP-WF09**（チェックリスト形式通過）                                           | 違反予防チェック表に書いた予防策を、計画書本文の事実記述と完了基準に対応付け。「ターゲット主要/副次のラベル整合性」を grep で点検（cycle-182 R3 同型再発防止: 本ファイル内で「M1c」「主要ターゲット」「副次ターゲット」が一貫して登場するか）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **AP-WF10**（SendMessage 連続）                                                 | 該当なし。タスクごとに新エージェント。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **AP-WF11**（PM 通読・並べ読み）                                                | 視覚検証は PM 自身が実施し、並べ読み成果物（4 列テーブル）を `./tmp/cycle-183/visual-check.md` に残す。reviewer 承認を PM 判断の代用にしない。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **AP-WF12**（事実情報の実体確認）                                               | 計画書に書いた全事実情報（ファイルパス、ディレクトリ構造、件数、リダイレクト定義の有無、フィールド名、フィールド型、他タスクの Backlog 状態）を `ls`/`grep`/`Read`/researcher レポートで実体確認。Next.js `permanentRedirect()` のステータスコードは 308（cycle-181 違反 19 教訓 + `docs/knowledge/nextjs.md` 確認済み）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **AP-WF12 補（researcher レポート間の数値矛盾を「最新優先」だけで吸収しない）** | 複数の researcher レポートで同一指標の数値が矛盾する場合、**「最新優先」だけで吸収せず、必ず実体集計（コード/コマンド）で再確認する**。本サイクルでは reviewer-r1 CR-1 でレポート 1（旧集計：タグ p2 = 3 / 合計 41 URL）とレポート 3（最新集計：タグ p2 = 6 / 合計 44 URL）の矛盾を「最新優先」でレポート 3 採用と判断したが、**B-334-3-5 builder の `getAllBlogPosts()` 実体集計で「実体はタグ p2 = 3 / 合計 41 URL」と判明し、レポート 1 が正しかった**。新しいレポートが詳細であっても集計ミスを含みうる。**教訓**: 「複数レポートが矛盾したら最新を採る」は短絡で、`grep` / `find` / `getAllBlogPosts()` 等で**実体を直接集計し直す**のが唯一の正解。本サイクルでは事後訂正で計画書全体の数値を実体に揃えた。検索ヒット件数も PM 推測ではなく Bash 実測を計画段階で実行（MJ-1 対応）。 |

### 実装後の視覚確認

PM 自身による Playwright MCP 経由の視覚検証（B-334-3-6）を 2026-05-08 に実施した。

- **撮影総数**: 8 シナリオ × {w360, w1280} × {light, dark} = **32 枚**（網羅完了）
- **保存先**: `./tmp/cycle-183/screenshots/`（リポジトリ未追跡、サイクル完了で削除可）
- **並べ読み成果物**: `./tmp/cycle-183/visual-check.md`（4 列テーブル: 観測対象 / 計画 / 実装 / 判定、15 項目）

主な観測結果:

- **NEW バッジ**: シナリオ 1（/blog 初期）で上位 5 カードに NEW バッジ赤色ラベル表示、badges 行 min-height で h2 位置揃い ✓
- **ページネーション全状態 44px（M-1 修正の検証）**: シナリオ 2 で `getBoundingClientRect` 実測、`pageItem` 全 7 個（前へ / 1〜5 / 次へ、active / 通常 / disabled の各状態）が height = 44 を達成 ✓
- **5 系統検索**: シナリオ 6（/blog?q=Next.js）で 15 件ヒット（実体集計と一致）、`[aria-live="polite"]` で「15 件ヒット」表示 ✓
- **空状態の二重表示防止（MJ-C 対応）**: シナリオ 8（/blog?q=zzzzz）で `role="status"` メッセージ表示、`[aria-live]` ヒット件数要素は **DOM 不在**（0 件時の構造的二重表示回避を検証） ✓
- **a11y セット**: filterButton / tagPill / searchInput / pageItem の各 height = 44px。aria-current="page" がカテゴリリンクに付与（シナリオ 1 「すべて」、シナリオ 3 「開発ノート」、シナリオ 7 「開発ノート」など） ✓
- **カテゴリ間の見え方差（MJ-5 対応）**: シナリオ 3 (dev-notes 23 件 / 2 ページ) と シナリオ 4 (japanese-culture 5 件 / 1 ページ) を比較。カード等高 / badges 行 min-height / カテゴリラベル色差が一貫 ✓
- **タグページ仕様**: シナリオ 5 で URL のパーセントエンコーディング、タグヘッダー（パンくず + タグ名 + 説明）、カテゴリナビ非表示、人気タグ非表示、page/2 への動線（21 件 / 12 件）を確認 ✓
- **ダークモード視認性**: 全 16 枚の dark で DESIGN.md トークン経由で背景・前景・accent が描画、NEW バッジ赤・カウントバッジ淡色とも視認可能 ✓
- **WCAG 2.4.5 Multiple Ways**: (i) Header「ブログ」/ (ii) Footer「ブログ一覧」を全 32 枚で視認確認。(iii) トップ動線と (iv) sitemap.xml は既存実装で確認（後者はテストでカバー）

**判定**: 完了基準（§ルート・基本動作 / §デザイン適用 / §フィルター・検索 / §NEW バッジ・ソート / §a11y / §視覚検証 / §リダイレクト整合 / §テスト整備）すべてが実装と整合し、視覚検証の観測必須要素もクリア。**修正が必要な事項なし**。サイクル完了に進む。

## レビュー結果

### 計画フェーズ（4 ラウンド、すべて解消・承認）

| Round   | 日時       | reviewer                     | 指摘                                                                                                                                                                                                                                                                                                                                               | 対応 commit                 |
| ------- | ---------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Plan-R1 | 2026-05-07 | reviewer (a2a3a44405a8cb568) | **CRITICAL 1**: タグ p2 数値（41 URL → 44 URL に訂正、ただし**事後判明で逆方向の誤訂正**）／**MAJOR 5**: 検索ヒット件数の根拠不足、空状態文言 literal、M1d/M1e 動線記述、rollback 戦略欠落、視覚検証カテゴリカバレッジ／**MINOR 6**: 並行可否表形式化、line-clamp literal、fake timers 注記、toLowerCase literal、unknown-tag 404 条件、AP-WF12 補 | planner (aa6dc2695064acaba) |
| Plan-R2 | 2026-05-07 | reviewer                     | **MAJOR 3**: 33 タグ密集の事実誤認、シリーズ表示名の検討漏れ、ヒット件数 0 件時の二重表示問題（MJ-A/B/C）／**MINOR 4**: BlogListView テスト粒度、視覚確認セクション事前作成、commit 粒度配置、縦スクロール見積り                                                                                                                                   | planner (aa79c88a12c1eb7ac) |
| Plan-R3 | 2026-05-07 | reviewer                     | **MAJOR 2**: シリーズ表示名 5 系統への波及修正漏れ（5 箇所）、B-334-3-1 単独記述問題／**MINOR 4**: MobileToc.test.tsx 言及漏れ、Bash 実測表の列割、searchFilter 配置、M1d の search_intents 導出                                                                                                                                                   | planner (a7f034ca6f059a9cb) |
| Plan-R4 | 2026-05-07 | reviewer (aeeafd4d965e7aa61) | **承認**（残存指摘ゼロ）                                                                                                                                                                                                                                                                                                                           | 計画確定 commit `6fdb96fc`  |

### 実装フェーズ（3 ラウンド、すべて解消・承認）

| Round   | 日時       | reviewer                     | 指摘                                                                                                                                                                                                                                      | 対応 commit                                                                                                           |
| ------- | ---------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Impl-R1 | 2026-05-07 | reviewer (a6ba2b9478f471c3d) | **MAJOR 2**: M-1 Pagination 44px 不足、M-2 commit 構成と rollback 戦略の不整合（builder-B のスコープ越境、AP-WF13 該当）／**MINOR 5**: BlogCard onClick 削除、layout.tsx 削除、空状態文言、空 .header ルール、activeCategory 型 narrowing | builder commit `fccb3bcf`（コード修正）+ PM commit `e8c19c4b`（M-2 ドキュメント対応 + AP-WF13 新規追加 + B-388 起票） |
| Impl-R2 | 2026-05-07 | reviewer (a7cc8f622ecd8ddeb) | **MINOR 5**: m-A〜m-E（commit C 内訳補正、テスト整備の完了基準明示、seo-coverage.test.ts 配置メモ、Pagination 全状態 44px 確認、BlogListView テスト粒度）                                                                                 | PM commit `9afae9bb`                                                                                                  |
| Impl-R3 | 2026-05-07 | reviewer (a777bf5e2f1d5cfbf) | **承認**（残存指摘ゼロ）                                                                                                                                                                                                                  | B-334-3-5 着手                                                                                                        |

### B-334-3-5 + 数値訂正フェーズ（1 ラウンド、承認）

| Round   | 日時       | reviewer                     | 指摘                                                                                                                                                                                | 対応 commit                                                                            |
| ------- | ---------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Test-R1 | 2026-05-07 | reviewer (a974d953c41b0bd6b) | **承認**（残存指摘ゼロ）／重要発見: B-334-3-5 builder の AP-WF12 実体確認で「タグ p2 = 3 / 合計 41 URL」が判明し、Plan-R1 CR-1 の訂正が逆方向だったと判明（詳細は §AP-WF12 補参照） | builder commit `9fb860fc`（テスト）+ PM commit `b1860bf7`（数値訂正 + AP-WF12 補追記） |

### B-334-3-6（PM 自身による視覚検証）

| Round     | 日時       | 検証者                                             | 結果                                                                                                                  | 対応 commit       |
| --------- | ---------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Visual-R1 | 2026-05-08 | PM 自身（メインエージェント、Playwright MCP 経由） | 8 シナリオ × 4 = 32 枚撮影、観測対象 15 項目すべて満たすと判定。並べ読み成果物 `./tmp/cycle-183/visual-check.md` 作成 | commit `3bc91b52` |

### 完了処理フェーズ（cycle-completion §4 アンチパターンチェック）

| Round   | 日時       | reviewer                     | 指摘                                                                                                                                                                | 対応 commit                                        |
| ------- | ---------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Done-R1 | 2026-05-08 | reviewer (aac83ac0ad5d66dab) | **MAJOR 2**: レビュー結果セクション未記入、reviewer 側の数値検証義務 AP 不在／**MINOR 3**: AP-WF06/12 射程の重なり、数値訂正の grep 証跡、WCAG 2.4.5 (iii) 文面整理 | 本セクション記入 + AP-WF14 新規追加（後続 commit） |

## キャリーオーバー

本サイクル内で完了できなかった作業はない。以下は本サイクルで発見された別 backlog 項目および後続サイクルへの申し送り（`/docs/backlog.md` および `docs/anti-patterns/workflow.md` に記載済み）。

- **B-388（新規起票、Pagination 本体の 44px 化）**: cycle-183 R1 で発見。`Pagination.module.css` L24 の `pageItem` が 36px 角で、cycle-181 (/tools) / cycle-182 (/play) でも同型ギャップが残置。本サイクルでは BlogFilterableList 側で個別上書き（`[class*="pageItem"] { min-height: 44px }`）の応急処置済み。本筋は Pagination 本体修正で全ページ統一。B-386（Button/Input 44px）と一括で実施しても良い。
- **Phase 4.4（B-334-4 = トップ移行）への申し送り**:
  - 本サイクルで確立したパターン（4 層アーキテクチャ + 5 系統検索 + ヒット件数 ≥1 件時のみ表示 + 0 件時 `role="status"` 一本 + `::after` overlay によるカード全体クリッカブル + `aria-current="page"` + 44px 個別上書き継承）をトップ一覧でも踏襲する。
  - トップは Phase 9.2（B-336）で道具箱化される予定で、Phase 4.4 の現行トップ移行と Phase 9.2 のスコープが連動する。Phase 4.4 着手時に Phase 9.2 との関係を再評価。
  - commit 戦略は本サイクルで確立した「ルート移行 + 新コンポーネント実装を同 commit にまとめる」をトップでも踏襲。同時に AP-WF13（並行 builder のスコープ越境）に注意し、builder への指示文に「他のファイルは触らない」を明示する。
- **AP-WF12 補（複数 researcher レポート間の数値矛盾を「最新優先」だけで吸収しない）**: 本サイクルで再発し、`docs/anti-patterns/workflow.md` の AP-WF12 末尾に予防策を追記済み。後続サイクルで矛盾発見時は実体集計（`getAllBlogPosts()` / `grep -c` 等）で再確認する。
- **AP-WF13（並行アサインのスコープ越境禁止）**: 本サイクルで初出、`docs/anti-patterns/workflow.md` に新規追加。後続サイクルで並行 builder を立てる際は「触ってはならないファイル」を指示文に明示する。

## 補足事項

- **`(legacy)/__tests__/seo-coverage.test.ts` の配置**: 本テストファイルは `(legacy)/__tests__/` 配下にあるが、L146 / L222 / L235 / L265 等で `@/app/(new)/blog/...` を import している（cycle-183 commit A で path 追従済み）。**ファイル配置は `(legacy)/` 配下に残置するが、import は `(new)/` を参照する** 構造で、Phase 10.2（B-337 = legacy 撤去）でファイルごと再整理される予定。本サイクルでは触らない。
- **数値訂正の grep 証跡（2026-05-08 完了処理時）**: `grep -n "44 URL\|タグ p2 = 6\|p2 6\|6 タグ" docs/cycles/cycle-183.md` で 6 箇所がヒットするが、**いずれも「事後訂正の説明文脈」として旧値を意図的に残している記述**（L18 冒頭注記、L90 数値とは無関係の「3 件以上」記述、L522 researcher レポート 1 注記、L581 AP-WF06 行、L588 AP-WF12 補行、L618 Plan-R1 ラウンド表）。**採用数値としての旧値「タグ p2 = 6 / 44 URL」は残存ゼロ**を確認した。
- **AP-WF14 の新規追加（Done-R1 対応）**: cycle-completion §4 のアンチパターンチェックで reviewer-aac83ac0ad5d66dab が指摘した MAJOR-2「reviewer 側の数値検証義務 AP の不在」を受け、`docs/anti-patterns/workflow.md` に AP-WF14 を新規追加。AP-WF12 補の対称形として、reviewer が数値・件数の指摘を採用する際の独立検証義務を明文化。後続サイクルから運用される。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。

## 補修計画（v4、情報設計再考）

### §0 問題の再定義

Owner からの 3 度の指摘を時系列で再掲する。

- **指摘 1**: 「絞り込みに使えないタグは何のために存在するのですか？ タグとカテゴリの使い分けの観点からもよく考えてください」
- **指摘 2**: 「現状を整理するだけでは足りません。将来書くブログ記事との兼ね合いも考える必要があります。今ある記事でルールを決めてしまうと、今後新しい分野の記事を書けなくなります。今あるタグを消してしまうと、将来書く記事を束ねることができなくなります。将来のことを考慮して最適な対応を検討してください」
- **指摘 3 (核心)**: 「Owner 指摘 1 は、UI 上にクリックできる要素とできない要素を同じ見た目で並べることを危惧したものです。また、**タグもカテゴリも『束ねる』ために用意されたものであり、読者が混乱しないかを危惧したもの**でもあります。記事数が少ないタグを消せという指示ではありません。**planner の提案はすべてタグ機能とカテゴリ機能の両方を残すものだけで、いずれもこの質問への回答になっていません**」

これまでに検討された 7 案 (A: span 化 / B: 削除 / C: UI 非表示 / D: しきい値変更 / E: 統合表示 / F: 育成中表示 / G: ハイブリッド) は、**いずれも「タグ機能とカテゴリ機能の両方を読者向け束ね手段として残す」前提に立っており、Owner 指摘 3 の「両方が束ねる役割を持つことの読者の混乱」に直接答えていない**。本 v4 では、**両機能を残す前提を疑うところから**ゼロベースで選択肢を列挙する。

#### 現状の事実（実体集計、AP-WF12 準拠）

- 記事 59 件 / カテゴリ 5 種 (`ai-workflow` 16, `dev-notes` 23, `site-updates` 8, `tool-guides` 7, `japanese-culture` 5) / タグ 33 種
- タグ別記事数の分布:
  - **5 件以上 (URL 公開・インデックス対象)**: 16 タグ (設計パターン 21 / Web 開発 17 / Next.js 15 / SEO 11 / 新機能 10 / オンラインツール 9 / UI 改善 9 / 失敗と学び 8 / AI エージェント 8 / TypeScript 8 / ワークフロー 7 / サイト運営 7 / ゲーム 7 / 日本語 7 / リファクタリング 5 / 舞台裏 5)
  - **3〜4 件 (URL 公開・noindex)**: 10 タグ (Claude Code / パフォーマンス / 伝統色 / ワークフロー連載 / 漢字 / セキュリティ / チートシート / 正規表現 / 四字熟語 / テキスト処理)
  - **1〜2 件 (URL なし、404 になる)**: 7 タグ (RSS 2 / スケジュール 2 / YAML 1 / DevOps 1 / 設定ファイル 1 / React 1 / アクセシビリティ 1)
- **現状の UI 上の事故**: `BlogCard.tsx` (該当ループ・タグ pill 描画ブロック) は frontmatter の全タグを `<Link href="/blog/tag/${tag}">` として描画している。**`TagList.tsx`** (同様にタグ pill を `<Link href>` で出力する独立コンポーネント) も同じく無条件にリンクを描画しており、**ブログ記事詳細ページ `/blog/[slug]/page.tsx` のヘッダー (タイトル直下) でも `TagList` が呼び出されている**。つまり 7 タグ (RSS / スケジュール / YAML / DevOps / 設定ファイル / React / アクセシビリティ) は、**カード一覧でも・記事詳細ヘッダーでも、見た目はクリック可能なリンクだが、クリックすると 404** になる。これが Owner 指摘 1 の直接の対象。
  - 該当の事実は v4 R1 レビューで指摘されたもの。`grep -n` ではなくファイルの **見出し名・コンポーネント名** で参照している (行番号は変動するため)。本サイクル補修のスコープには **記事詳細の TagList も自動的に含まれる** (TagList コンポーネント自体に対して修正を加えれば、それを呼び出す記事詳細ページにも自動波及するため)。
- **役割の重複の事実**: カテゴリリンクとタグリンクは、いずれも「クリック → そのテーマの記事一覧 (絞り込み結果) に遷移」という同型の挙動をしている。読者の認知モデル上、両方が「束ねる」UI として並列している。
- **しきい値定数の所在 (MIN-1 修正、AP-WF12 実体確認)**: 本サイクル以降の cycle-184 でしばしば言及する `MIN_POSTS_FOR_TAG_PAGE = 3` は **集約 export ではなく、2 ファイルにローカル定義された定数**である。具体的には:
  - `src/app/(new)/blog/tag/[tag]/page.tsx` L14 で `const MIN_POSTS_FOR_TAG_PAGE = 3;`
  - `src/app/(new)/blog/tag/[tag]/page/[page]/page.tsx` L14 で同じく `const MIN_POSTS_FOR_TAG_PAGE = 3;`

  一方 `MIN_POSTS_FOR_TAG_INDEX = 5` のほうは `src/blog/_lib/blog.ts` L64 で `export` されている (集約 export)。cycle-184 で「`MIN_POSTS_FOR_TAG_PAGE` の処遇判断 (削除 or 保持)」を扱う際は、**2 ファイル × ローカル定数の両方を削除する** ことが具体スコープになる (集約 export のように 1 箇所で完結しない)。本ホットフィックスでは `getTagsWithMinPosts(3)` をリテラルで呼び出すか、これらローカル定数を import 元として参照するかは builder 判断に委ねる (cycle-184 で削除する範囲が変わるためトレードオフあり)。

#### v4 で問い直す論点

「タグ機能とカテゴリ機能のどちらか、あるいは統合する」という根本的な情報設計の見直しを正面から扱う。`docs/anti-patterns/planning.md` AP-P03 (現状所与計画の禁止) と AP-P08 (ゼロベース検討の限定禁止) に従い、**現状の構造を所与とせず、将来 5 年・記事数 200 件規模に到達した時点での保守性まで含めて評価する**。

### §1 選択肢列挙（ゼロベース）

各案について「採用時の挙動」「利点」「欠点」「タグ機能の存続有無」「カテゴリ機能の存続有無」「Owner 指摘 1/2/3 への応答」を整理する。コードレベルの実装は後続エージェントの判断に委ねる。

**列挙の構造について (m-1)**: 以下に「X1 / X2 / X3 / X4 / X5 / X6 / X7 / X8」の見出しで 8 ブロックを並べるが、**実質的な独立設計判断軸は 5 つ** (X1 / X2 / X3 / X4 / X7) である。X5 / X6 は X1 と挙動上ほぼ同一で「同じ判断を別の運用観点 (退避 / 編集者向け責務分離) で言い換えたサブ視点」として整理される。X8 は v1〜v3 で検討した過去 7 案 (A〜G) を Owner 指摘 3 整合性で再評価する括りで、「新規の独立案」ではない。比較表 (§2) は実質 5 案で構成する。

#### 案 X1: タグ UI 完全廃止 + frontmatter 残置 (タグの内部メタデータ化)

- **タグ機能**: 公開 UI からは完全廃止 (タグページ・タグリンク・人気タグ・タグヘッダー・タグ別 sitemap entry 全廃)。frontmatter の `tags` フィールドは残し、5 系統キーワード検索の検索対象として内部利用のみ継続。将来の RSS / 構造化データ / 関連記事推薦などの内部用途のために保持。
- **カテゴリ機能**: 維持 (5 カテゴリの URL・descriptions・絞り込み UI すべてそのまま)。
- **採用時の挙動**:
  - カードからタグ pill が消える (カテゴリラベル + 日付 + タイトル + description + NEW バッジのみ)
  - 人気タグ Top 8 が消える
  - タグページ (`/blog/tag/[tag]` 26 URL + p2 3 URL) が削除される
  - 検索 5 系統には引き続き tags 配列が含まれるため、「失敗」「Next.js」などの打鍵語で記事を探せる動線は残る
  - 既存タグ URL は 410 Gone or `/blog?q=タグ名` への 301 リダイレクトで吸収
- **利点**: 読者から見える「束ね」軸がカテゴリ単一になり、Owner 指摘 3 の役割重複問題が**構造的に解消**する。クリック可能要素と不可要素の混在も発生しない (Owner 指摘 1 直接解消)。タグは frontmatter で自由追加できるため将来の新分野記事も縛られない (Owner 指摘 2 充足)。情報設計が最も単純で 5 年後も保守容易。
- **欠点**: SEO インデックス済みのタグ URL 16 件 (5 件以上タグ) を失う。これらは外部から検索流入があり得る経路で、301 リダイレクトしても順位再評価まで時間がかかる。M1c が「書き手の癖を辿る」ためのテーマ別ドリルダウン UI が消える (ただし検索で代替可)。M1d/M1e の補助動線も同様。
- **Owner 指摘への応答**:
  - 1: クリック可不可の混在が**構造的に発生しない** (タグ pill そのものを描画しない)
  - 2: frontmatter 自由度を保持。新分野の記事は既存タグに縛られず新規タグを自由に追加できる
  - 3: 束ねる UI 軸が単一化し、読者の混乱を**情報設計レベルで解消**

#### 案 X2: カテゴリ廃止 + タグ統一

- **タグ機能**: 拡張・公開 UI 維持。カテゴリの代替として「主要タグ」概念を導入する変種もあり得る。
- **カテゴリ機能**: 廃止。`/blog/category/[cat]` URL を 5 件削除し、各記事のカテゴリ表示も廃止。
- **採用時の挙動**:
  - カードからカテゴリラベルが消える
  - カテゴリナビが消える (タグナビのみ)
  - 33 タグ全部にフラットにアクセスする UI に切替
- **利点**: 軸が「タグ」の 1 系統に統一。柔軟性高い。
- **欠点**: 5 カテゴリは curated description 付きで主要 nav として機能しており、これを失うと M1c/M1d/M1e が**全体俯瞰**できなくなる。33 タグのフラット空間は「気配を掴む」M1c の体験と相性が悪い。SEO 観点でも、5 カテゴリ URL の SEO 価値は強い (`/blog/category/dev-notes` などは記事数も多くインデックスされている)。`docs/design-migration-plan.md` Phase 2 の道具箱化計画 (B-336) でもカテゴリ概念に依存する箇所があるため波及が大きい。
- **Owner 指摘への応答**:
  - 1: 解消 (タグだけになるので混在しない、ただし<3 件タグの 404 問題は別途対処要)
  - 2: タグは自由追加可
  - 3: 束ねる軸は 1 系統になるが、軸の方を「タグ」にしたことで主要分類の curated 性が失われる (新しい混乱の種)

#### 案 X3: カテゴリとタグの階層統合 (Topic ツリー化)

- **タグ機能/カテゴリ機能**: 両方とも統合され、新しい「トピック」の階層として再設計。例: 主軸 5 トピック、副軸として各トピック配下の sub-topic。
- **採用時の挙動**:
  - 全記事の frontmatter を再設計 (`category` と `tags` を `topic` / `subtopic` に置き換え)
  - 全タグページ・全カテゴリページの URL 体系を `/blog/topic/[t]/[s]` のような階層構造に再構築
- **利点**: 整理された情報設計
- **欠点**: 大規模な構造変更で実装コスト極大。AP-P03 違反の懸念 (現状 5 カテゴリ + 33 タグの分類で構造を固めると、将来書く新分野記事を縛る)。新しいトピック追加時のメタデータ再分類コストが恒久的に発生。SEO 観点でも全 URL 構造変更で短期的に大量の流入損失。
- **Owner 指摘への応答**:
  - 1: 解消
  - 2: **悪化**。階層構造はむしろ拡張の自由度を下げる
  - 3: 役割重複は解消するが、別の問題 (硬直した分類) を生む

#### 案 X4: タグ UI を残し、URL を /blog?q=タグ名 への検索クエリに変換

- **タグ機能**: 公開 UI は維持。ただし「束ねる」役割は廃止し、「検索キーワードのショートカット」として位置付ける。クリックすると `/blog?q=タグ名` の検索結果ページに遷移。タグページ `/blog/tag/[tag]` は廃止 (301 リダイレクトで `/blog?q=タグ名` に吸収)。
- **カテゴリ機能**: 維持 (5 カテゴリの URL・descriptions・絞り込み UI そのまま)。
- **採用時の挙動**:
  - カードのタグ pill は引き続き描画。クリック先は `/blog?q=タグ名`
  - 人気タグ Top 8 も同様に検索クエリへ変換
  - タグページ・タグヘッダー・`getTagsWithMinPosts` などタグ URL 関連実装一式廃止
  - 5 系統検索が tags を対象に含むため、検索結果はタグページとほぼ同等の記事集合になる
  - <3 件タグも 1〜2 件タグも、すべてクリック可能で検索結果に遷移する (404 が発生しない)
- **利点**:
  - **役割が明確に分離**: カテゴリ = 公式分類 (5 種、curated)、タグ = 検索キーワードのショートカット (自由追加可、33+ 種)。クリック挙動も別 (カテゴリ → 静的 URL ナビ、タグ → 検索クエリ)
  - 全タグが等価にクリック可能で、404 / 混在問題が**構造的に解消**
  - 検索ヒット件数表示がそのまま機能するため「何件の記事に該当するか」が読者に伝わる
  - frontmatter のタグ自由度を保持 (Owner 指摘 2 直接対応)
- **欠点**: SEO インデックス済みタグ URL 16 件を失うのは X1 と同じ。**`/blog?q=タグ名` は `/blog` の canonical=/blog で集約され (CRIT-3 修正、`src/app/(new)/blog/page.tsx` 実体確認: `canonical: ${BASE_URL}/blog` のみ設定、`noindex` 設定なし)、Google 側でクエリ変種が重複扱いとして吸収されるため、独立インデックスは生まれない**。結果として「タグ単位での記事一覧」のインデックス機会が消える点は同じ。タグの「束ね」役割を完全には廃止していないため、Owner 指摘 3 への直球回答という意味では X1 より弱い (タグも「テーマで束ねる」体験を提供することは続く)。ただし、URL 単一系統 (`/blog?q=...` 1 種類) で動作することで「カテゴリ = 静的分類遷移、タグ = 検索クエリ」という **挙動の差** が読者に明確化されるため、混乱は X1 より程度問題で残るが、案 X1 の「タグ機能を全廃する」より M1c/M1d/M1e の体験劣化が小さい。
- **Owner 指摘への応答**:
  - 1: クリック可不可の混在が**構造的に発生しない** (全タグが検索結果へ遷移)
  - 2: frontmatter 自由度を保持
  - 3: タグの役割が「束ねる UI」から「検索キーワードのショートカット」に格下げされ、束ねる軸はカテゴリに一本化される。タグはその下位の補助手段として位置付けられる

#### 案 X5: 役割の明確な分離 (カテゴリ = 公開束ね / タグ = 内部メタデータのみ・UI 非表示)

- **タグ機能**: UI から完全非表示 (X1 とほぼ同じ)。frontmatter `tags` は 5 系統検索の対象として内部利用のみ。
- **カテゴリ機能**: 維持。
- **採用時の挙動**: X1 と実質同じ。違いは「将来タグ UI を復活させる余地を意図的に残す」点で、実装上の一時退避という位置付け。
- **利点/欠点**: X1 とほぼ同じ。
- **Owner 指摘への応答**: X1 と同じ。
- **位置付け**: X1 を「永続的な情報設計判断」として採用するのに対し、X5 は「とりあえずタグ UI を退避し、後で必要があれば復活させる暫定判断」。本サイクルでは X1 と統合して扱う。

#### 案 X6: 公開アクセス vs 編集・運用での責務分離

- **タグ機能**: 編集者・運用者向けの内部分類として維持。公開 UI には出ない。
- **カテゴリ機能**: 公開向けの主分類として維持。
- 案 X1 と実質同じ (公開 UI 上の挙動は同一)。
- **位置付け**: X1 の「frontmatter は内部利用」を「編集者・運用者が記事を内部管理する道具」として明示するための観点。X1 と統合して扱う。

#### 案 X7 (創意工夫): カテゴリ単独運用 + タグはサイト内検索のサジェスト・内部リンクとして活用

- **タグ機能**: UI から非表示 + 検索入力欄のサジェストとして提示 (打鍵時にタグ候補を補完) + 関連記事推薦の内部シグナルとして活用。
- **カテゴリ機能**: 維持。
- **採用時の挙動**:
  - カードからタグ pill が消える (X1/X4 と同じ)
  - 検索入力欄にフォーカスすると、過去のタグから抽出したサジェスト一覧が表示 (例: 「ワークフロー」「失敗と学び」などの候補)
  - 検索結果は tags 配列も対象として返す (5 系統検索のまま)
- **利点**: タグの「テーマ別ドリルダウン」体験を「検索サジェスト」として保ちつつ、UI 上の混乱を解消。読者は「束ねる軸は何か」を意識せず、自然な検索動線でタグの恩恵を受ける。
- **欠点**: サジェスト UI 実装コスト追加 (本来 X1/X4 で完結する施策に機能追加)。サジェスト UI の設計判断が増える。ただし Phase 5 (B-331) の横断検索実装で類似の UI 設計が必要になるため、Phase 5 へ統合する形で本サイクル外の課題として送り出す選択肢あり。
- **Owner 指摘への応答**:
  - 1, 2, 3 すべて X1 と同様に解消。さらにタグの内部活用を読者に届ける動線を設計。

#### 案 X8 (前回までの 7 案を Owner 指摘 3 整合性で再評価)

- 案 A (span 化) / D (しきい値変更) / E (統合表示) / F (育成中表示) / G (ハイブリッド): いずれも「タグ機能とカテゴリ機能の両方を公開束ね手段として残す」前提のため、Owner 指摘 3 への回答にならない。**棄却**。
- 案 B (削除) / C (UI 非表示) は X1 / X5 / X6 に吸収される。
- **案 G (ハイブリッド) の定義と X4 / X7 との差 (m-2 補)**: G は v1〜v3 で「クリック可能タグ (>=3 件) は `<Link>` で `/blog/tag/[tag]` に遷移、<3 件は span 表示で非リンク化」とする折衷案として検討された。X4 と異なるのは「クリック先が静的タグページ URL `/blog/tag/[tag]` のままで、`/blog?q=...` 検索化への転換を行わない」点。X7 と異なるのは「タグ pill UI を残し、サジェスト UI 等の代替動線を導入しない」点。G は「タグの束ねる役割」をそのまま残すため Owner 指摘 3 への直接回答にならず、また「クリック可不可が同一見た目で混在」という Owner 指摘 1 の最初の指摘構造とも一部重複する (span と Link の視覚区別を施しても挙動差を読者が予測しづらい点で v1 で棄却済み)。本 v4 では棄却を再確認する。

### §2 比較表

6 軸 + ターゲット yaml 作用で評価する。評価記号: ◎(極めて良い) / ○(良い) / △(課題あり) / ×(悪い) / ―(該当しない)。

| 軸                                  | X1 タグ UI 廃止               | X2 カテゴリ廃止           | X3 階層統合       | X4 タグ→検索化                | X7 サジェスト化               |
| ----------------------------------- | ----------------------------- | ------------------------- | ----------------- | ----------------------------- | ----------------------------- |
| 読者の混乱                          | ◎ (軸が単一)                  | ○ (軸単一だが粗)          | △ (新硬直)        | ○ (挙動差で分離)              | ◎ (UI 単一 + サジェスト)      |
| タグ・カテゴリの機能重複            | ◎ (重複構造的に解消)          | ◎ (同左)                  | ◎ (統合)          | ○ (役割再定義)                | ◎ (UI 上の重複ゼロ)           |
| 将来の記事追加への耐性              | ◎ (frontmatter 自由)          | ◎ (同左)                  | × (硬直)          | ◎ (frontmatter 自由)          | ◎ (frontmatter 自由)          |
| SEO 影響                            | △ (16 タグ URL 喪失)          | × (5+16 喪失)             | × (全壊)          | △ (16 タグ URL 喪失)          | △ (16 タグ URL 喪失)          |
| 実装コスト                          | ○ (小)                        | × (大)                    | × (極大)          | ○ (小〜中)                    | △ (サジェスト UI 追加)        |
| 設計の素直さ (5 年保守)             | ◎ (最も単純)                  | △ (curated 喪失)          | × (硬直)          | ○ (役割明示)                  | ○ (検索集約)                  |
| ----                                | ----                          | ----                      | ----              | ----                          | ----                          |
| **M1c likes (書き手の癖)**          | △ (タグ束ね消失、検索で代替)  | △ (curated 消失)          | △ (硬直)          | ○ (タグ→検索で束ね保持)       | ○ (サジェストで体験保持)      |
| **M1c dislikes (定型)**             | ◎ (装飾減)                    | ―                         | ―                 | ―                             | ―                             |
| **M1b likes (一貫)**                | ○ (URL 不変主軸)              | × (主軸変更)              | × (URL全変)       | ○ (主軸 URL 不変)             | ○ (主軸 URL 不変)             |
| **M1b dislikes (リダイレクト断絶)** | △ (16 URL→検索リダイレクト要) | × (21 URL リダイレクト要) | × (全 URL 再構築) | △ (16 URL→検索リダイレクト要) | △ (16 URL→検索リダイレクト要) |
| **M1d likes (カテゴリ動線)**        | ○ (カテゴリ維持)              | × (カテゴリ消失)          | △ (再構築)        | ○ (カテゴリ維持)              | ○ (カテゴリ維持)              |
| **M1e likes (具体ノウハウ)**        | ○ (description+検索)          | △                         | ―                 | ○ (タグ→検索でドリル可)       | ○ (サジェストで技術語の補完)  |

総合判断: **X1 / X4 / X7 が三つの有力候補**。X2 と X3 は SEO・体験ともに損失が大きく棄却。

### §3 最適案の選定と理由

ターゲット yaml フィールドからの 3 段推論で導出する。

#### 主要ターゲット M1c (AI の日記を読み物として楽しむ人)

- yaml `likes`「書き手の癖や語り方が記事をまたいで一貫しており、個として認識できること」 → ニーズ: テーマ別ドリルダウンができること → 設計要件: 「失敗と学び」「ワークフロー連載」のような書き手の癖を表すラベルで記事をまとめて読みたい
- 上記要件は (a) 5 系統キーワード検索が tags 配列を対象に含むことで、検索動線で代替可能 / (b) ただし「打鍵せずに気配で発見する」体験は X1 / X7 のいずれでも担保される必要がある
- yaml `interests`「AI が書く文章がどこまで人間の読み物に近づけているのかを見ること」 → 設計要件: 一覧 UI 上の言葉数や装飾を最小化し、書き手の言葉そのものに視線が向く
- 上記要件は X1 (装飾最小、UI 上の重複軸ゼロ) が最も整合する

#### 副次ターゲット M1b / M1d / M1e

- M1b `likes`「サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること」 → ニーズ: ナビ動線が単純で予測可能 → X1 / X4 / X7 いずれも、カテゴリ動線維持で M1b のブックマーク経路を守る
- M1b `dislikes`「URL が変更されたコンテンツにリダイレクトが設定されておらずたどり着けなくなること」 → 設計要件: 廃止する URL (タグページ 26+3) は 301 リダイレクトで吸収する。**この実装が必須**
- M1d / M1e `interests` 技術ノウハウ → 設計要件: カテゴリページ (`dev-notes`, `ai-workflow`) で関連記事に到達できる動線が維持される必要 → X1 / X4 / X7 いずれもカテゴリは維持
- M1d / M1e の補助動線として「タグ単位でのドリルダウン」が現状あったが、これは検索 (X1) または検索クエリ化されたタグリンク (X4) で代替できる

##### M1d / M1e の search_intents と廃止対象タグ URL の対応 (M-5 補)

ターゲット yaml の `search_intents` を引用し、廃止対象タグページ URL との対応を明示する。

**ラベル整合 (MAJ-1 修正)**: 本サイクル前半の M1d/M1e 定義 (L110-131 の見出し) と整合させ、**M1d = AIエージェントやオーケストレーションに興味があるエンジニア / M1e = Webサイト製作を学びたいエンジニア** を採用する (v4 R2 レビューで M1d/M1e ラベル逆転が指摘されたため、cycle-183 前半に揃えた)。

- **M1d (AIエージェントやオーケストレーションに興味があるエンジニア) の search_intents (yaml 実体)**:
  - "Claude Code 使い方" → `/blog/tag/Claude Code` (現状 3〜4 件、noindex 設定で URL 公開のタグ)
  - "AIエージェント ワークフロー" → `/blog/tag/AIエージェント` か `/blog/tag/ワークフロー` (いずれも 5 件以上の URL 公開・インデックス対象タグ)
  - "AI オーケストレーション 実践" → カテゴリ `ai-workflow` か検索
  - "Claude Code マルチエージェント" → 同上
  - "AIエージェント 自動化" → 同上
- **M1e (Webサイト製作を学びたいエンジニア) の search_intents (yaml 実体)**:
  - "Next.js 設計パターン" → `/blog/tag/Next.js`、`/blog/tag/設計パターン` のいずれかにヒット可能性 (現状はいずれも 5 件以上の URL 公開タグ)
  - "Git チートシート" → `/blog/tag/チートシート` (現状 3〜4 件、noindex 設定で URL 公開のタグ)
  - "正規表現 チートシート" → 同上
  - "Markdown 書き方" → カテゴリ `dev-notes` か検索でヒット (タグページに対応無し)
  - "CSS レイアウト ベストプラクティス" → カテゴリ `dev-notes` か検索でヒット
- **読み取り**: M1d/M1e の search_intents には「タグページ URL に近接するクエリ」が複数存在する (Next.js / 設計パターン / チートシート / Claude Code / AI エージェント / ワークフロー)。X1 採用でこれらタグページが廃止されると、検索エンジンからの直接流入経路が一部失われる可能性がある。一方、複合語クエリ ("Next.js 設計パターン" のような複数語) はタグページ URL より記事個別ページや `/blog?q=...` 検索結果のほうが SEO 上自然なランディング先である可能性が高い。
- **AP-P01 予防 (M-4 補)**: 上記の理論的分析だけで X1 採用判断を確定させると AP-P01 (定量実測の先送り) に抵触する。**cycle-184 着手前の必須前提として、Google Analytics で `/blog/tag/*` 配下の直近 90 日 PV を実測する**。観測値の解釈基準:
  - 月数 PV 程度 (タグ全体で 10〜30 PV/月) → SEO 影響軽微。301 リダイレクト先は `/blog?q=タグ名` で簡単に吸収。X1 採用に揺るぎなし
  - 月数百 PV (タグ全体で 100〜500 PV/月) → 中程度の流入があり、リダイレクト先設計を慎重に。タグごとに流入量を見て、上位タグはカテゴリページに 1:1 マッピング、下位は `/blog?q=...` で吸収などの段階対応を検討
  - 月数千 PV 以上 → 重大流入。X1 と X4 の比較を再検討する余地あり (X4 ならタグ pill UI を残しつつ URL を検索クエリ化することで、Google 検索ランディング先としての記事内タグ pill を経由した周遊を維持できる)
- 上記実測は cycle-184 の planner / PM が冒頭で必ず実施する着手条件。本サイクル (cycle-183 補修) のホットフィックスでは GA 実測は不要 (UI フィルタはタグページ URL の存在自体には触れず、`<3 件タグ` のリンク描画を抑止するだけのため)

#### Owner 指摘 3 への直球回答度

- X1: タグの「束ねる」役割を**廃止**。束ねる軸はカテゴリ単一に。**最も直球**
- X4: タグの「束ねる」役割を「検索キーワードのショートカット」として再定義。**部分的に残置**
- X7: タグの「束ねる」役割を **検索サジェストとして UI から明示的に切り離す**。X1 + 補助動線

#### 採用案

**X1 (タグ UI 完全廃止 + frontmatter 残置) を採用する**。理由:

1. **Owner 指摘 3 への最も直球な回答**: 「タグもカテゴリも『束ねる』ために用意されたものであり、読者が混乱する」という危惧に対し、束ねる軸を**情報設計レベルで単一化**する。X4 / X7 は「タグの役割を再定義」する案だが、Owner の問いの根幹は「両方が必要なのか」であり、X1 がそれに対する明確な「カテゴリのみが必要」という答え。
2. **設計の素直さが 5 年後の保守性に直結**: 記事数が 100 〜 200 件に増えた時、X1 は変わらず単純。X4 はタグ数が 100+ に膨らんだ時の検索結果の品質管理が必要になる。X7 はサジェスト UI の品質管理が恒久課題。
3. **AP-P03 (現状所与計画の禁止) 整合**: 現状の 33 タグを所与とせず、frontmatter 自由度を残すことで将来追加される新分野記事のタグを縛らない。Owner 指摘 2 と整合。
4. **AP-P07 (来訪者起点) 整合**: M1c の主要 likes / interests は X1 で十分担保される (検索動線 + カテゴリ動線)。タグ UI が消えることで `dislikes`「定型的な装飾」とも整合。
5. **実装コストが小さい**: タグ関連 UI の削除と URL リダイレクト追加が主作業で、新規実装は最小。
6. **検索による代替動線が既に存在**: 5 系統キーワード検索が tags 配列を対象に含むため、M1c の「テーマで読み返す」体験は検索打鍵で代替できる。タグ表示名 33 種は短く・固有名詞的で打鍵しやすい (例: 「失敗」「ワークフロー」「Next.js」)。
   - **(a) 認知コスト差の認識 (MAJ-4 補強)**: ただし「タグ pill を見て気配で発見してタップ」と「能動的に検索ボックスを開いてタグ名を打鍵」では認知コストが大きく異なる。特に M1c の `device_preferences` は smartphone / tablet を含むため、モバイル UI で能動的検索は閾値が高い。タグ表示名が短く固有名詞的であっても、「どんなタグがあるかを思い出す」記憶コストが追加で発生する点は X1 の弱点として認める。
   - **(b) 定量条件 (MAJ-4 補強、cycle-184 着手前必須)**: 上記の弱点が現実にどれだけ問題化しているかを判断するため、cycle-184 着手前に **既存 5 系統検索の利用率を GA で実測する**。具体的には `/blog?q=*` 流入の発生数と `/blog` 全体流入の比率を直近 90 日で算出。利用率が一定閾値 (cycle-184 planner が PV 規模と組み合わせて設定) 以上であれば「読者は既に能動検索を活用している」と判定でき X1 採用の根拠が強まる。利用率がそれ以下なら「タグ pill による受動的発見」への依存が高い可能性があり、X4 (タグ pill 残置 + 検索クエリ化) への切替も再評価対象。これは §6 U-1 の複合条件 (PV 規模 × 検索利用率) と連動する。

X4 / X7 を**棄却**する理由:

- X4: タグの役割を「検索キーワードのショートカット」として再定義する案だが、結局「タグ pill をクリックする」体験が残るため Owner 指摘 3 の「両方が束ねる UI として並列」という構造は名目上残る。挙動差 (静的 URL ナビ vs 検索クエリ) は読者から見れば違いを意識しない可能性が高く、「カテゴリとタグは何が違うのか」という問いを完全には解消しない。
- X7: 検索サジェスト UI の追加実装が必要で、Phase 5 (B-331) の横断検索実装と機能スコープが重複する。サジェスト UI の品質設計は単独サイクルで扱うべき独立課題で、本サイクルの補修としては規模が大きすぎる。X1 が「タグ UI 廃止」だけで Owner の問いに答えられるなら、X7 への拡張は Phase 5 着手時に再検討すれば足りる。

##### X1 vs X4 比較の補強 (M-1 補)

R1 で「X4 棄却理由が定性的すぎる / 比較が非対称」との指摘があったため、両案を「読者にとっての混乱の質」を軸に再評価する。

1. **「混乱」の質の違い**:
   - X1 の場合: 軸は「カテゴリ」のみ。読者は「カテゴリ = 記事を束ねる軸」というシンプルな認知モデルを持つ。タグ pill が消えるため「タグとは何か / カテゴリと何が違うのか」という問いが**そもそも生じない**。
   - X4 の場合: タグ pill は残るが、クリック挙動が `/blog?q=...` (検索結果) に変わる。読者は (a) カテゴリリンク = 静的分類遷移 (b) タグリンク = 検索クエリのショートカット という**2 種類の挙動の違い**を学習する必要がある。挙動差を視覚的に伝えるためにタグ pill のスタイルを変える (例: `#` prefix を付ける、ホバー時に「検索: '失敗'」のヒントを出す、フォントウェイトを下げる等) ことで、混乱を抑える設計余地はある。
2. **M1c の「テーマ別ドリルダウン」体験との整合**:
   - X1 ではタグでの束ねが消失し、検索打鍵で代替する設計。「打鍵せずに気配で発見する」体験は劣化する (`likes` の M1c 個別認識ニーズへの対応が弱まる)。
   - X4 ではタグ pill が残り、クリック → 検索結果でタグ単位の記事束を提示できる。M1c の「気配で発見する」体験は維持される (タグ pill が一覧 UI 上に提示されているため)。**X4 の M1c 整合度は X1 より高い**ことを認める。
3. **SEO 観点**:
   - X1 / X4 とも「タグページ URL の SEO 価値を失う」のは同じ (X4 でも `/blog/tag/[tag]` を 301 で `/blog?q=...` に流すが、**`/blog?q=...` は canonical=/blog でクエリ変種が Google 側で重複扱いとして吸収されるため、独立インデックスは生まれない** (CRIT-3 修正、`/blog/page.tsx` の metadata は `canonical: ${BASE_URL}/blog` のみで noindex は未設定。実体は canonical 集約による吸収))。
   - 違いは X4 が「タグ pill UI のクリック流入」という内部リンクの行き先を保つ点。サイト内回遊指標 (`pages per session`) では X4 のほうが有利な可能性。
4. **不可逆性の評価**:
   - X4 → X1 への移行: タグ pill コンポーネント削除 + リダイレクト先を `/blog` トップに変える、の単純作業。**容易**。
   - X1 → X4 への移行: タグ pill コンポーネント復活 + 全カードへの再配置 + リダイレクト先設計の再構築。**やや手間だが不可能ではない**。両者の不可逆性は当初想定したほど非対称ではない。
5. **それでも X1 を採用する根拠 (再整理)**:
   - 最終決定理由は「Owner 指摘 3 への直球度」。Owner は「両機能が束ねる役割を持つことの読者の混乱」を直接の論点として提示しており、X4 はその論点を「役割を再定義する」ことで側面から回避する応答にとどまる。X1 は「タグの束ね役割を廃止する」直接応答である。
   - また、X1 ではフィード `<category>` 出力 (§6 U-6 参照) や getRelatedPosts のスコアリングなど **frontmatter `tags` を内部利用しつづける道は残る**ため、タグの完全消滅ではなく「公開 UI からの撤去」という性質を強調できる。
   - 残るリスク (M1c 体験劣化 / SEO 流入損失) は cycle-184 着手前の GA 実測で大きさを定量化したうえで、影響大なら **X4 への切り替えも cycle-184 計画段階で再評価する** (X4 への戻しが不可逆ではないことを上で確認済み)。本 v4 の「X1 採用」は cycle-183 補修の前提として位置付け、cycle-184 で実測値に基づき最終確定する形にゆるめる。

#### Owner 指摘 1 / 2 / 3 がどう反映されているか

- **指摘 1 (クリック可不可の混在)**: タグ pill そのものを描画しない設計のため、構造的に発生しない。
- **指摘 2 (将来の記事との兼ね合い)**: frontmatter `tags` フィールドを残し、新分野記事のタグを自由に追加できる状態を保つ。検索 5 系統が tags を対象に含むため、新タグも検索動線で読者に届く。
- **指摘 3 (両機能の重複)**: 公開束ね軸を**カテゴリ単一**にすることで、情報設計レベルで重複を解消。

### §4 採用案のスコープ判断

採用案 X1 は **情報設計レベルの変更** であり、cycle-183 (Phase 4.3 ブログ一覧の新デザイン移行) のスコープを超える。判断の根拠:

1. **cycle-183 は既に completed_at が記録された完了サイクル**であり、本 v4 計画は Owner からの追加指摘に応じる「補修計画」として末尾追記されている。本来のサイクル目的 (新デザイン移行) は達成済み。
2. **X1 の影響範囲は広範**: タグページ 26 + p2 3 = 29 URL の削除と 301 リダイレクト整備、`BlogCard` / `TagList` / `BlogFilterableList` / 6 ルート全ての参照変更、5 系統検索の `tags` 含有確認、テスト群の更新、視覚検証 32 枚の再撮影が必要。
3. **適切なサイクル分離**: Phase 4.3 の「デザイン移行」と「タグ機能廃止」は本来別の意思決定軸。後者は独立サイクル (cycle-184 として起票) で正面から扱うのが筋。

#### スコープ分割

**cycle-183 の補修として本サイクル内で対応する範囲 (ホットフィックス)**:

- **Owner 指摘 1 の即時解消**: クリックすると 404 になる 7 タグ (RSS / スケジュール / YAML / DevOps / 設定ファイル / React / アクセシビリティ) の表示問題を最小修正で解消する。**最小修正の方針判断は cycle-184 で X1 を採用することを前提**にして、ホットフィックスは「X1 への移行までの一時しのぎ」として最も簡素な手段を選ぶ。具体的には次のいずれか (実装担当者が判断):
  - (i) `BlogCard.tsx` および **`TagList.tsx` の両方** で、frontmatter `tags` 配列をカード描画時に「URL が公開されているタグ (>=3 件のタグ集合) のみ」にフィルタしてから `<Link>` を描画する。表示は `getTagsWithMinPosts(3)` を呼んで集合と照合。これにより 7 タグ (1〜2 件タグ) が UI から消え、404 リンクが構造的に発生しなくなる
  - (ii) または、クリッカブル区別を視覚的に分離する案 (span 化等) は v1 で Owner 指摘 1 が出ているため**不採用**
  - (i) 案を採用した場合の副作用: 1〜2 件タグの記事 (YAML 等) のカードでは `tags` 表示数が減る。これは本サイクル限りの一時状態で、cycle-184 で X1 採用と共にすべてのタグ pill が消えるため、長期的な体験劣化にはならない
- **本ホットフィックスのスコープ波及範囲 (C-1 補)**: `TagList.tsx` を修正することで、それを呼び出す **記事詳細ページ `/blog/[slug]/page.tsx` ヘッダーのタグ表示** にもフィルタが自動波及する。すなわち本サイクルのホットフィックスは「カード一覧の TagList」と「記事詳細の TagList」の両方に同じ修正を一度に適用する。記事詳細ページの page.tsx 自体には変更を入れない (TagList コンポーネント側の修正で十分)
- **次サイクル (cycle-184) の予告と参照**: 本ファイル内で「本サイクルでは応急処置のみ。情報設計レベルの判断 (タグ UI 廃止) は cycle-184 で扱う」と明示し、`docs/backlog.md` に B-389 として起票する (起票内容は本ファイル §4 cycle-184 スコープ + §6 U-1〜U-6 を要約。**本計画書の確定および R1 修正受領のタイミングで PM が cycle-completion 時に backlog.md への実書き込みを行う**。本計画書には「B-389 の記述案」を以下に明記しておくため、cycle-184 の planner はこれをそのまま着手指示として参照できる)

**cycle-184 (新規サイクル) で扱う範囲 (本格対応)**:

- X1 採用に伴う全実装変更:
  1. `BlogCard.tsx` / `TagList.tsx` から tag pill UI 削除 (記事詳細ヘッダーから自動波及して消える)
  2. `BlogFilterableList.tsx` から人気タグ Top 8 セクション削除
  3. タグページ用ルート (`/blog/tag/[tag]` / `/blog/tag/[tag]/page/[page]`) の削除 (29 URL)
  4. `next.config.ts` への 301 リダイレクト追加: `/blog/tag/:tag` および `/blog/tag/:tag/page/:n` → `/blog?q=:tag` (X1 採用時のリダイレクト先は検索結果ページ。タグ pill そのものが消えるが、過去外部リンクから遷移する読者を救済する経路として `/blog?q=タグ名` は最も自然)
  5. `sitemap.ts` からタグ系 URL 削除
  6. テスト群更新 (`pagination-redirect.test.ts`, `tag-page.test.ts`, `BlogCard.test.tsx`, `BlogFilterableList.test.tsx`, **`src/app/(legacy)/blog/[slug]/__tests__/page.test.tsx`** にタグ pill 表示の検証が含まれている場合はそれも更新)
  7. 視覚検証の再実施 (32 枚 → タグページがなくなるため少なくなる、シナリオ再設計)
  8. `TAG_DESCRIPTIONS` / `getTagsWithMinPosts` / `MIN_POSTS_FOR_TAG_PAGE` / `MIN_POSTS_FOR_TAG_INDEX` の処遇判断 (削除 or 保持) を builder 判断に委ねる
- 5 系統検索の `tags` 含有を維持 (frontmatter のタグは検索動線で生き続ける)
- 関連 backlog: B-388 (Pagination 44px 本体修正、本サイクルで応急処置済み) は cycle-184 で前倒し対応するか別サイクルかを cycle-184 の PM が判断

##### B-389 起票内容の記述案 (C-2 補)

backlog.md の Queued セクションに以下の内容で起票する。本計画書承認時に PM が cycle-completion 処理として実書き込みを行う。

- **ID**: B-389
- **Title**: ブログのタグ UI 完全廃止 (X1 採用)
- **Priority**: P2 (Phase 4.3 補修の継続課題で、cycle-183 ホットフィックスの長期化を防ぐため次サイクル最優先で着手)
- **Target Cycle**: cycle-184 (次サイクル最優先)
- **Notes**:
  - cycle-183 §補修計画 v4 で採択された X1 (タグ UI 完全廃止 + frontmatter 残置) の本体実装。cycle-183 はホットフィックス (>=3 件タグのみ表示) で 404 リンク混在を一時解消した状態のため、cycle-184 で本格対応に移行することが前提。**ホットフィックスが長期化すると「タグの可視性は記事数で決まる」という暗黙ルールが常態化し Owner 指摘 2 と矛盾するため、cycle-184 で必ず着手する**
  - **着手前の必須条件 (AP-P01 予防)**: GA で `/blog/tag/*` 配下の直近 90 日 PV を実測。月数 PV / 数百 PV / 数千 PV のレンジで X1 採用の最終判定を行う (cycle-183 §3 M-4 補参照)。実測値が月数千 PV を超える場合は X4 への切り替えも再評価対象
  - **スコープ 8 項目** (cycle-183 §4 採用案のスコープ判断より): (1) BlogCard / TagList の tag pill UI 削除、(2) BlogFilterableList の人気タグ Top 8 削除、(3) タグページルート 29 URL 削除、(4) `next.config.ts` への 301 リダイレクト整備、(5) sitemap.ts からのタグ系 URL 削除、(6) テスト群更新 (記事詳細 page.test.tsx も含む)、(7) 視覚検証再実施、(8) TAG_DESCRIPTIONS / MIN_POSTS_FOR_TAG_PAGE 等の処遇判断
  - **運用ルール 6 項目** (cycle-183 §6 U-1〜U-6): U-1 リダイレクト先方針、U-2 TAG_DESCRIPTIONS の処遇、U-3 frontmatter `tags` 規約の writing.md / CLAUDE.md 追記、U-4 design-migration-plan.md Phase 2/7/9 との整合確認、U-5 並行 builder のスコープ越境禁止継承、**U-6 フィード `<category>` 出力の処遇判断 (`src/lib/feed.ts` の `category: post.tags.map(...)` を `post.category` 単独 / tags + category 両方 / 削除のいずれにするか)**
  - **触らない範囲**: frontmatter の `tags` フィールド自体は残す (getRelatedPosts のスコアリング、5 系統検索、フィード `<category>`、将来の構造化データ等の内部利用が継続)
  - **ホットフィックス巻き戻し**: cycle-183 で `BlogCard.tsx` / `TagList.tsx` に追加されたフィルタロジック (`getTagsWithMinPosts(3)` 集合との照合) は cycle-184 でタグ pill UI 自体を削除する際に同時撤去 (フィルタ条件ではなく描画ループ自体が消える)。cycle-183 のコード/コメントに `// TODO(cycle-184/B-389): X1 採用時に削除` を残す指示を本計画書から builder に伝達済み

### §5 採用案の実装方針 (cycle-183 補修ホットフィックスの基本設計)

**前提**: 本セクションは cycle-183 補修 (ホットフィックス) のみを扱い、X1 本体の実装方針は cycle-184 で改めて計画する。

#### B-389-h1 (本サイクル補修): 404 タグの非表示化

- **何を**: `BlogCard.tsx` および `TagList.tsx` の **両方** で、描画する `tags` 配列を「`/blog/tag/[tag]` の URL が存在するタグ (>=3 件のタグ)」のみにフィルタしてから `<Link>` を描画する。`TagList.tsx` を修正することで **記事詳細ページ `/blog/[slug]/page.tsx` ヘッダーのタグ表示** にも自動波及する (記事詳細 page.tsx 自体には変更を入れない)
- **なぜ**: Owner 指摘 1 の即時解消。クリックすると 404 になる 7 タグ (影響記事 **6 記事** / 低件数タグの pill 描画インスタンス **9 個分**、カード一覧と記事詳細ヘッダーの両方で発生) を UI から消すことで、「クリックできるように見えて遷移できない」現象を構造的になくす。**数値の根拠 (CRIT-2 修正、AP-WF12 実体再集計)**: `npx tsx -e "getAllBlogPosts()"` で 1〜2 件タグ集合 = `RSS / スケジュール / YAML / DevOps / 設定ファイル / React / アクセシビリティ` を含む記事を抽出した結果、**ユニーク記事数は 6**、**タグ pill のインスタンス総数は 9**（同一記事が複数の低件数タグを持つケースがあるため記事数とインスタンス数が異なる）
- **最終状態**:
  - `BlogCard` / `TagList` のタグ pill 描画ループの直前に、`getTagsWithMinPosts(3)` で取得した URL 公開タグの集合と照合してフィルタ
  - 該当タグが 1 つもないカード/記事詳細はタグ行ごと非表示 (現状の「`tags.length > 0` ガード」を「フィルタ後の長さ > 0」に置換)
  - 人気タグ Top 8 は元々 frontmatter から `getTagsWithMinPosts(3)` 経由で取得しているため挙動変更なし
  - 5 系統キーワード検索の対象は「frontmatter の全タグ」のまま維持 (検索ヒットは UI 表示と独立、変更不要)
  - **TODO コメント追加 (C-3 補 / MAJ-3 修正、builder MUST 要件)**: フィルタ追加箇所のコード直前に `// TODO(cycle-184/B-389): X1 採用時にタグ pill UI ごと削除` の TODO コメントを **必ず** 残す。これは builder への MUST 要件であり、推測形 ("残されているはず") ではなく **本計画書から builder への明示指示**である。`BlogCard.tsx` と `TagList.tsx` の両方のフィルタ追加箇所に同一の TODO コメントを置くこと。cycle-184 planner はこの TODO を `grep -rn "TODO(cycle-184/B-389)" src/` で発見し、該当ファイルを削除/書き換えする手順で本格対応に移行できる
- **触らない範囲**:
  - タグページ自体の URL 構造、人気タグ Top 8 の動作、`getTagsWithMinPosts` / `MIN_POSTS_FOR_TAG_PAGE` / `TAG_DESCRIPTIONS` 等の API
  - **frontmatter の `tags` フィールド (M-3 補)**: 本ホットフィックスでも cycle-184 X1 本体でも frontmatter `tags` 自体は削除しない。理由: (a) `getRelatedPosts` (`src/blog/_lib/blog.ts`) のスコアリングで「共有タグ数 × 3 + 同カテゴリ +10」のロジックに使われている (関数挙動を保つには tags が必要)、(b) 5 系統キーワード検索の対象として `searchFilter` ロジックが tags 配列を参照、(c) フィード (`src/lib/feed.ts` の `feed.addItem` 内 `category: post.tags.map(...)`) で `<category>` 要素として出力。これら 3 用途は「内部メタデータとしての `tags`」が継続使用される根拠であり、cycle-184 planner が「frontmatter tags も消す」と誤読しないよう本項目に明示する
  - **記事本文 (`src/blog/content/`) (m-4 補)**: ブログ本文中に `/blog/tag/` への直接リンクはゼロ件 (cycle-183 R2 修正時に `grep -rn "/blog/tag/" src/blog/content/` で確認、結果 0 件)。記事本文には触らない
- **実装上の注意 (builder 判断に委ねる)**:
  - **フィルタ集合の取得タイミング (MAJ-2 修正、必須要件)**: **必ず Server Component で `getTagsWithMinPosts(3)` を計算し、結果の Set / Array を props として `BlogCard` / `TagList` に渡す**。「Client Component 側で都度計算」の選択肢は採用してはならない。理由: `getTagsWithMinPosts` は `src/blog/_lib/blog.ts` 内に定義されており、同モジュールは `node:fs` (frontmatter のファイル読み込み) に依存する **Server-only** 実装である。Client Component 内 (`"use client"` 付きファイル) で呼び出すとビルド時に `Module not found: Can't resolve 'node:fs'` 等のエラーで失敗する。`BlogCard` は `BlogGrid` 配下で多数描画されるため Set を上位 (Server Component の page.tsx もしくは BlogFilterableList 経由) から prop で渡すのが性能上も自然
  - 視覚的に「タグ行が空のカード/記事詳細」が出る場合 (1〜2 件タグしか持たない記事)、行ごと非表示にする (badges 行 min-height は NEW バッジで揃うため影響軽微) か、タグ無し時の視覚的代替を設けないか。後者を推奨 (X1 採用時に全カードからタグが消えるため、本ホットフィックスでも「タグ行ごと消える」状態に慣らしておく)
- **テスト**:
  - 1〜2 件タグの記事 (例: YAML タグを持つ記事 = `2026-05-05-yaml-implicit-type-conversion-quote-everything.md`、React タグを持つ記事 = `2026-05-04-scroll-lock-reference-counter-for-multiple-components.md`) のカードに、当該タグの `<a>` が存在しないことを assertion
  - 3 件以上タグ (例: チートシート、Next.js) のカードには `<a>` が存在する
  - 検索 5 系統テストで、1〜2 件タグの記事が「YAML」検索でヒットすることは維持 (検索対象は UI フィルタと独立)
  - **既存テスト `src/app/(legacy)/blog/[slug]/__tests__/page.test.tsx` への影響有無 (C-1 補)**: builder は実装着手前に同テストファイルを Read し、TagList のレンダリング検証 (タグ pill が出ていることのアサーション、特定タグ名が DOM に含まれることのアサーション) が含まれるかを確認する。含まれる場合は本ホットフィックス対応として、1〜2 件タグの記事をスナップショット対象としているケースが壊れないよう、テストデータを 3 件以上タグの記事に差し替えるか、フィルタ後の表示を期待値とするように修正する

#### 視覚検証 (PM 自身による)

- 視覚検証は **最低 6 枚** とする (R1 指摘に基づき記事詳細を追加):
  - **シナリオ A: ブログ一覧カード一覧** (既存 32 枚のうち、タグ表示の影響を受けるシナリオ 1, 3, 6 等のカード並び) を w360 light + w1280 light の **2 枚** 再撮影
  - **シナリオ B: 記事詳細ページのヘッダー (TagList 描画箇所) (C-1 補, m-3 補)** を以下 4 枚撮影:
    - `/blog/yaml-implicit-type-conversion-quote-everything` (YAML タグを含む記事) を w360 light + w360 dark + w1280 light + w1280 dark の組み合わせから最低 2 枚 (light + dark を 1 viewport で揃える、または light のみ w360 / w1280 の 2 枚で代替可)
    - `/blog/scroll-lock-reference-counter-for-multiple-components` (React タグを含む記事) を w360 light + w1280 light の 2 枚
    - 上記計 4 枚で「YAML タグ pill が消えていること」「React タグ pill が消えていること」を確認
- 並べ読み成果物 (Before/After 比較) を作成し、404 タグが UI 上で消えていることを確認
- ダーク テーマも 1 枚以上含める (上記の dark バリエーションで担保、不足する場合は追加撮影)
- スクリーンショット保存先と並べ読み成果物は `./tmp/cycle-183-r2/` 配下

#### コミット粒度

- 1 commit (タグフィルタ追加 + テスト追加 + 視覚検証ログ + TODO コメント) を本サイクル補修コミットとして追加
- rollback は単一 commit revert で対応可能

### §6 リスク・運用ルール

#### cycle-183 補修ホットフィックスのリスク

- **R-1: cycle-184 で X1 を採用しない判断に振れた場合 / ホットフィックスが長期化した場合 (C-3 補)**: 本ホットフィックスで <3 件タグが UI から消えた状態が長期化する。これは「タグの可視性は記事数で決まる」という暗黙ルールの常態化を意味し、Owner 指摘 2 (将来の新分野記事を縛らない) と整合しない。**歯止め策 (期限・SLA)**:
  - **(i) backlog B-389 への最優先指示**: backlog.md に B-389 を起票する際、Notes 欄に「**cycle-184 で必ず着手すること (次サイクル最優先)**」と明示記載 (本計画書 §4 の B-389 記述案で既に反映済み)
  - **(ii) コードに TODO コメントを残す指示**: ホットフィックス実装の `BlogCard.tsx` / `TagList.tsx` のフィルタ追加箇所に `// TODO(cycle-184/B-389): X1 採用時にタグ pill UI ごと削除` を残す (本計画書 §5 「最終状態」で builder への指示として既に反映済み)
  - **(iii) PM 引き継ぎ (cycle-completion 処理)**: cycle-183 の cycle-completion / キャリーオーバー記述に「次サイクル最優先 = B-389」を明示し、cycle-184 の PM が立ち上がり時に最初に確認できる位置に置く
  - **(iv) cycle-184 着手前の前提条件として GA 実測を要求 (M-4 補)**: §3 M-4 補で記述した通り、`/blog/tag/*` 直近 90 日 PV を実測してから X1 採用の最終判断を行う。X1 不採用に振れた場合 (X4 への切替判断含む) は、ホットフィックス自体を巻き戻す前提で cycle-184 の計画書を組む
- **R-2: 5 系統検索の tags 含有が誤って外れる**: ホットフィックス実装時に、UI フィルタの実装ミスで検索対象まで巻き込まれて狭まると、M1c の「タグ語で検索する」動線が壊れる。**予防策**: 検索 5 系統のテスト (現存) を再実行し、1〜2 件タグの記事 (例: YAML) が検索でヒットすることを assertion として明示
- **R-3: 記事詳細ページ (`/blog/[slug]/page.tsx`) の挙動退行 (C-1 補)**: TagList コンポーネントを修正することで自動波及する記事詳細ヘッダーのタグ pill 消失が、既存の記事詳細テスト (`page.test.tsx`) や視覚的な見栄え (タイトル直下のメタ情報行と並ぶ位置のレイアウト) を予期せず壊す可能性。**予防策**: §5 視覚検証シナリオ B で記事詳細ヘッダーを最低 4 枚撮影、§5 テスト項目に既存 page.test.tsx への影響有無の事前確認を含める

#### cycle-184 (X1 本体) で扱うべき運用ルール

cycle-184 計画段階で改めて検討する事項を、本ファイルから後続サイクルへの申し送りとして記録する:

- **U-1: 廃止する URL のリダイレクト方針**: タグページ 26 件 + p2 3 件 = 29 URL の 301 リダイレクト先を `/blog?q=タグ名` (検索結果) にするか、`/blog/category/[cat]` のうち最も多い記事を含むカテゴリにマッピングするか、`/blog` トップにするかを判断。**前提の訂正 (CRIT-3 修正)**: `/blog?q=...` は `/blog/page.tsx` の metadata で `canonical: ${BASE_URL}/blog` が設定されており (`noindex` ではない)、Google 側でクエリ変種が canonical 集約により重複扱いとして吸収される。すなわち `/blog?q=...` 自体が独立にインデックスされる経路はなく、SEO 上は `/blog` (200 OK) と等価に扱われる。そのため SEO 観点では `/blog` トップ・`/blog?q=タグ名` どちらに流しても結果はほぼ同じ。来訪者体験では `/blog?q=タグ名` のほうが「タグ pill をクリック → そのテーマの記事一覧へ」の期待に近いが、X1 採用ではタグ pill 自体が消えるため流入元は外部の旧タグ URL リンクのみ。判断軸: (a) 外部から旧タグ URL に直接来た読者がタグ名のテーマを期待していると考えるか (→ `/blog?q=タグ名`)、(b) サイト構造を理解して `/blog` トップから自分で探し直してもらうか (→ `/blog`)。**複合条件 (MAJ-4 補)**: 単一閾値 (月数千 PV 等) のみではなく、**サイト内検索 (`?q=...`) の利用率も判断軸に加える**。具体的には GA で `/blog?q=*` 流入の発生割合を測り、利用率が **n% 未満** (cycle-184 planner が PV 規模と組み合わせて閾値設定) であれば「読者は能動的検索を使わない」と判定して `/blog` トップへの redirect を優先、利用率がそれ以上なら `/blog?q=タグ名` を優先。**着手条件**: cycle-184 着手前に (i) `/blog/tag/*` 配下の直近 90 日 PV、(ii) `/blog` トップ vs `/blog?q=*` の流入比率、の 2 点を GA で実測し、流入規模と検索利用率の複合判定で最終方針を決める (M-4 補参照)
- **U-2: TAG_DESCRIPTIONS の処遇**: タグ UI 廃止に伴い不要になるが、将来 X7 (サジェスト) や Phase 5 (横断検索) でサジェスト文言として再利用する可能性がある。削除でも archive ファイルに退避でもよい。判断は cycle-184
- **U-3: frontmatter の `tags` フィールド名規約**: 本サイクル時点で「frontmatter は内部利用のみ」となるため、新規記事執筆時のタグ追加ルールを `docs/anti-patterns/writing.md` または `CLAUDE.md` に追記する。ルール例: 「frontmatter `tags` は記事内容を端的に表す名詞 3〜6 個を任意に追加してよい。記事数を意識せず自由に追加できる。`tags` は将来の検索動線・関連記事推薦・フィードの `<category>` 出力・getRelatedPosts スコアリングの内部シグナルとして機能する」。**補足 (m-4 補)**: ブログ本文 (`src/blog/content/`) 内に `/blog/tag/` への直接リンクは無し (cycle-183 r2 で `grep -rn "/blog/tag/" src/blog/content/` 確認、結果 0 件) のため、X1 採用時に本文修正は不要
- **U-4: 道具箱化 (Phase 9.2) との関係**: タグ UI 廃止が Phase 7 / 9 の道具箱概念と衝突しないかを `docs/design-migration-plan.md` Phase 2 / 7 / 9 の記述と照合し、必要な範囲で同計画書を更新する
- **U-5: AP-P03 / AP-WF13 の継承**: cycle-183 で確立した「並行 builder のスコープ越境禁止」ルールを cycle-184 でも踏襲。複数ファイルにまたがる削除作業を 1 builder に集約することで AP-WF07 / AP-WF13 違反を防ぐ
- **U-6: フィード `<category>` 出力の処遇判断 (M-2 補)**: 現状 `src/lib/feed.ts` の `buildFeed()` 内 `feed.addItem({ ..., category: post.tags.map((tag) => ({ name: tag })) })` で、各記事のフィード項目に **frontmatter `tags` 配列を `<category>` として出力** している (RSS 2.0 / Atom 1.0 両方)。X1 採用後、UI からタグを廃止するときに、この `<category>` 出力をどう扱うかを cycle-184 で判断:
  - 選択肢 A: **削除** (UI と一貫性を保ち、`<category>` 出力を完全になくす)
  - 選択肢 B: **`post.category` 単独に変更** (カテゴリのみ `<category>` として出力。RSS フィード購読者にもカテゴリ単位の分類を提供)
  - 選択肢 C: **tags + category 両方を出す** (内部メタデータとしての `tags` の価値を RSS 購読者にも開く。フィードリーダー側でフィルタリングに使える)
  - 推奨判断軸: フィード購読者の存在実態 (GA `/feed` `/feed/atom` のアクセスログで判断)、RSS リーダーが `<category>` をどう扱うか (大半は表示しないが、フィード分類のメタとして機能する)、X1 の方針との一貫性 (公開 UI で消すなら RSS でも消すのが筋、ただし内部メタデータの位置付けを RSS には残す解釈もあり得る)
  - cycle-184 の builder スコープに含めるか、別 backlog (B-389 のサブタスク) として切り出すかも cycle-184 planner が判断

#### v4 で確認したアンチパターンチェック

- **AP-P01 (定量実測の先送り)**: タグ別記事数・カテゴリ別件数は §0 で実体集計済み。検索ヒット件数は cycle-183 §B-334-3-3 で Bash 実測済み (流用可)
- **AP-P02 (都合の悪いデータの無視)**: X1 の SEO 損失 (16 タグ URL のインデックス喪失) を欠点として明記。X4 / X7 の利点も §1 / §2 で公平に評価
- **AP-P03 (現状所与計画)**: 将来 100〜200 記事規模での保守性まで評価軸に含めた (§2 設計の素直さ)
- **AP-P07 (来訪者起点)**: §3 でターゲット yaml フィールドからの 3 段推論で導出
- **AP-P08 (ゼロベース検討の限定)**: 「両機能を残す前提」を疑うところから 7 案 + 創意工夫 1 案を列挙
- **AP-WF03 (literal 指示)**: コード literal は記述していない。実装方針は「何を / なぜ / 最終状態」止まり
- **AP-WF12 (事実情報の実体確認)**: 全タグ別件数を `getAllBlogPosts()` 経由で実体集計。**タグ別記事数の分布確認 (MIN-2 修正、再集計実施日時とコマンド記録)**:
  - **再集計実施**: 2026-05-08 (v4 R2 修正フェーズ)
  - **コマンド**: `npx tsx -e "import { getAllBlogPosts } from 'src/blog/_lib/blog'; const posts = getAllBlogPosts(); const tagCount = new Map(); for (const p of posts) for (const t of p.tags||[]) tagCount.set(t, (tagCount.get(t)||0)+1); /* バケット集計 */"`
  - **結果**: 総記事 59 件 / 総タグ 33 種 / **>=5 件: 16 タグ**（設計パターン 21, Web開発 17, Next.js 15, SEO 11, 新機能 10, オンラインツール 9, UI改善 9, 失敗と学び 8, AIエージェント 8, TypeScript 8, ワークフロー 7, サイト運営 7, ゲーム 7, 日本語 7, リファクタリング 5, 舞台裏 5）/ **3〜4 件: 10 タグ**（Claude Code 4, パフォーマンス 4, 伝統色 4, ワークフロー連載 4, 漢字 4, セキュリティ 3, チートシート 3, 正規表現 3, 四字熟語 3, テキスト処理 3）/ **1〜2 件: 7 タグ**（RSS 2, スケジュール 2, YAML 1, DevOps 1, 設定ファイル 1, React 1, アクセシビリティ 1）/ **影響記事**: 6 / **pill インスタンス**: 9
  - **AP-WF14 運用記録 (R2 reviewer 誤集計の経緯)**: v4 R2 レビュー (reviewer) は CRITICAL 1 として「タグ別件数の実体乖離 (失敗と学び 15 / AI エージェント 15 / ワークフロー 14 が正しい)」を指摘した。PM が `npx tsx -e 'getAllBlogPosts()'` で **独立に再集計** したところ、reviewer の数値は誤りで、計画書の数値（失敗と学び 8 / AIエージェント 8 / ワークフロー 7、Claude Code 4 / ワークフロー連載 4、>=5: 16 / 3-4: 10 / 1-2: 7）が実体と一致することを確認。**この件は計画書の修正不要 (false positive)** と PM が独立検証で判定した。AP-WF14 は「reviewer 側に独立実体集計の作法を求める」AP だが、本件は **PM 側の独立検証で AP-WF14 の機能 (誤集計の検出) を発火させた事例**。reviewer が独立検証を怠った結果ではなく、reviewer も実体集計を試みたが集計ロジックに別の誤りが混入した可能性が高い (具体的な誤集計の原因は cycle-183 の範囲外、cycle-184 で再発した場合に追究)。本サイクルでは PM が独立検証で false positive と判定し、計画書数値の正当性を確認したことを記録する。
- **v4 R1 修正で追加確認した一次情報 (m-5 補)**:
  - `BlogCard.tsx` のタグ pill 描画箇所 (`post.tags.length > 0` ガード + `post.tags.map((tag) => <Link href={\`/blog/tag/${tag}\`}>...)` ループ部分) を Read で確認 (行番号は変動するためファイル名 + コンポーネント名で参照、本サイクル時点ではタグ pill 描画は単一ブロック)
  - `TagList.tsx` のタグ pill 描画箇所 (`tags.map((tag) => <Link href={\`/blog/tag/${tag}\`}>{tag}</Link>)` ループ部分) を Read で確認 (TagList コンポーネントは単一の描画ブロックで構成)
  - `src/app/(legacy)/blog/[slug]/page.tsx` で `TagList` が import され、`<TagList tags={post.tags} />` として記事詳細ヘッダーで描画されていることを Read で確認
  - `src/lib/feed.ts` の `buildFeed()` 内で `category: post.tags.map((tag) => ({ name: tag }))` として各記事のタグが `<category>` 出力されていることを Read で確認
  - `src/blog/_lib/blog.ts` の `getRelatedPosts` 関数で「共有タグ数 × 3 (`SCORE_PER_SHARED_TAG`) + 同カテゴリ +10 (`SCORE_SAME_CATEGORY`)」のスコアリングが行われていることを Read で確認
  - ブログ本文 `src/blog/content/*.md` 内に `/blog/tag/` への直接リンクが含まれないことを `grep -rn "/blog/tag/" src/blog/content/` で確認 (結果 0 件)
  - 1〜2 件タグを持つ記事として `2026-05-05-yaml-implicit-type-conversion-quote-everything.md` (YAML タグを含む) と `2026-05-04-scroll-lock-reference-counter-for-multiple-components.md` (React タグを含む) の存在を `grep -lE` で確認
- **AP-WF13 (並行アサインのスコープ越境)**: cycle-184 への申し送りに含めた
- **AP-WF14 (reviewer の独立実体集計)**: v4 R1 で reviewer から CRITICAL 3 + MAJOR 5 + MINOR 5 の指摘 (記事詳細スコープの抜け / B-389 起票 / フィードの category 出力 / GA 実測の必要性 / search_intents 引用 等) を受け、本修正版で各指摘について Read による一次情報確認を経たうえで反映
