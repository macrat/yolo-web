# frontmatter `tags` フィールド 残置 vs 削除 検証レポート

**調査日**: 2026-05-08  
**対象サイクル**: cycle-184（B-389 タグ UI 完全廃止の前提判断）  
**調査者**: research agent

---

## 0. 調査前提

cycle-183 §補修計画 v4 は「frontmatter `tags` を残置し、`getRelatedPosts` スコアリング・5 系統キーワード検索・RSS `<category>` 出力・`getPlayRecommendationsForBlog` の内部シグナルとして継続利用する」と判断した。Owner から「この残置判断の根拠を実体で再検証せよ」との指示を受けた。

---

## 1. `getRelatedPosts` スコアリングの実体

### 関数定義（実体確認済み）

`src/blog/_lib/blog.ts` の `getRelatedPosts` は以下のスコアリングを実装している。

- 同カテゴリ: +10
- 共有タグ 1 件ごと: +3
- スコア 0 の記事は除外（完全無関係コンテンツを非表示）
- 同シリーズ記事は除外（SeriesNav に委譲）

最大 3 件を返す。`RelatedArticles` コンポーネントが `/blog/[slug]/page.tsx` の 1 箇所のみで呼ばれ、記事詳細ページ末尾に表示されている。

### タグ削除時の精度低下試算（59 記事全体）

全 59 記事を対象に `with_tags`（同カテゴリ+10 + 共有タグ×3）と `without_tags`（同カテゴリ+10 のみ）の上位 3 件を比較した結果：

| 一致数          | 記事数 | 割合 |
| --------------- | ------ | ---- |
| 3/3（完全一致） | 22     | 37%  |
| 2/3             | 15     | 25%  |
| 1/3             | 14     | 24%  |
| 0/3（完全入替） | 8      | 14%  |

**平均一致数: 1.86/3**。全 59 記事中 37 記事（63%）でタグ削除により推薦結果が変わる。

### サンプル 5 件の質的評価

| 記事                          | with_tags 上位3件                                  | without_tags 上位3件                     | 一致 |
| ----------------------------- | -------------------------------------------------- | ---------------------------------------- | ---- |
| Next.js静的ツール設計パターン | 伝統色辞典・Layout共通化・URL設計                  | 伝統色辞典・ダークモード・サイト内検索   | 1/3  |
| AIエージェント7人チーム記録   | ツール構築舞台裏・コンテンツ戦略・チートシート選定 | コンテンツ戦略・ツール構築・チートシート | 3/3  |
| 文字数カウントガイド          | JSON整形・正規表現・cronガイド                     | cronガイド・JSON整形・正規表現           | 3/3  |
| 四字熟語の覚え方              | 漢字力診断・文字数カウント・伝統色辞典             | **0件**                                  | 0/3  |
| AIマルチエージェント失敗事例  | コンテンツ戦略・ツール構築・チートシート           | 同上                                     | 3/3  |

### japanese-culture カテゴリの致命的ケース

`japanese-culture` カテゴリ全 5 記事が全て `series=japanese-culture` に属するため、同シリーズ除外ルールにより互いに推薦候補から除外される。タグスコアリングだけが異カテゴリ記事をすくい上げる唯一のシグナルとなっており、タグ削除時は「関連記事 0 件」になる。

例：「日本語パズルゲームで毎日脳トレ」

- with_tags: [6] 漢字力診断、[3] 文字数カウント、伝統色辞典、ツール30個拡充...（5件ヒット）
- without_tags: **0 件**（スコア > 0 の記事がない）

### GA で関連記事 UI が実際に使われているか

直近 90 日のブログ記事詳細ページ PV を GA で確認した。上位記事（workflow-simplification 20PV、how-we-built 18PV、workflow-skill 17PV 等）は一定の閲覧があるため、RelatedArticles が表示されている。ただし関連記事クリック自体の GA イベントは取得していないため、クリック率は不明。

---

## 2. 5 系統キーワード検索における `tags` の貢献度

### 検索ロジック（実体確認済み）

`src/blog/_components/searchFilter.ts` は以下の 5 系統を対象に部分一致検索する：

1. `post.title`
2. `post.description`
3. `post.tags.join(" ")`
4. カテゴリ表示名（`CATEGORY_LABELS[post.category]`）
5. シリーズ表示名（`SERIES_LABELS[post.series]`、series あり記事のみ）

### タグだけがヒット源になるケース

59 記事・33 タグ全件を対象に「タグにあってタイトル・description・カテゴリ表示名・シリーズ表示名のいずれにも含まれないタグ」を抽出した結果、**延べ 137 件**のタグ使用がタグのみヒット源になり得る。件数の多い主要タグ：

| タグ             | タグのみで差別化する記事数 |
| ---------------- | -------------------------- |
| 設計パターン     | 19記事                     |
| Web開発          | 16記事                     |
| 新機能           | 10記事                     |
| UI改善           | 9記事                      |
| オンラインツール | 8記事                      |
| 失敗と学び       | 8記事                      |
| TypeScript       | 8記事                      |

### GA 検索語との照合

直近 90 日の GA 実測検索語（29 件、最大 4 イベント）は「も」「わか」「わかる」「バンド」「模」等の入力途中文字列・非完成形が大半。完成した語は「四字熟語」「文字数」「漢字」「分かる」程度。

- **「四字熟語」**: タイトルに 2 記事・description に 3 記事が含まれるため、タグを外してもヒット数不変
- **「漢字」**: タイトルに 2 記事・description に 3 記事があるが、「四字熟語の覚え方」1 記事はタグのみでヒット（タイトル・description に「漢字」なし）
- **「w」（入力途中）**: タグ「Web開発」を経由して 12 記事追加ヒット。ただし「w」単体は意図した完成形検索語ではなく、ヒット数増加は副作用的

**評価**: GA 実測検索語 29 件のうちタグを外すことで実際のヒット件数が変わるのは「漢字」1 件（1 記事差）と「w」（入力途中語）のみ。意図した完成形検索語でタグ検索が決定的に貢献しているケースは確認できない。ただし GA 検索語サンプル自体が 29 件と極小であり、実態を代表しているとは言い難い。

---

## 3. 維持管理コストの実体

### 記事あたりのタグ数

| タグ数 | 記事数 |
| ------ | ------ |
| 0      | 7記事  |
| 1〜3   | 21記事 |
| 4〜5   | 31記事 |
| 6+     | 0記事  |

平均 3.4 タグ/記事。最大 5 タグ。

### 表記ゆれ

33 ユニークタグ中、類似タグは「ワークフロー」vs「ワークフロー連載」1 組のみ。明確な表記ゆれは観察されない。1 回使用タグが 5 件（YAML、DevOps、React、設定ファイル、アクセシビリティ）。

### 執筆ガイドラインでのタグ命名規約

`docs/anti-patterns/writing.md` にタグ命名規約の記述はなし。CLAUDE.md にも記述なし。タグの一貫性維持は暗黙のルールのみ。

### コスト評価

AI が記事を生成する構造では、タグ付け判断も AI が行う。cycle-183 §U-3 では「frontmatter `tags` の運用ルール追記」を B-389-9-2 タスクとして定義しており、cycle-184 で docs 整備予定。維持管理コストは「AI が各記事生成時に既存 33 タグとの整合を判断するコスト」であり、人的コストは小さいが LLM コンテキスト消費は発生する。

---

## 4. 「表示されている」誤解リスクの実体

### frontmatter 記述と UI の不一致

B-389 実装後（cycle-184 完了時点）のブログ記事詳細ページでは：

- `series` フィールド → `SeriesNav` コンポーネントで UI に表示される
- `description` フィールド → ブログカード・OGP 等で表示される
- `tags` フィールド → **UI に一切表示されない**（TagList 削除後）
- `related_tool_slugs` フィールド → PlayRecommendBlock で間接的に関連ゲーム表示に活用

このうち `tags` だけが「frontmatter に書いてあるが UI にまったく表示されない」状態になる。

### 現実的な誤解シナリオ

AI 執筆者が記事を生成する際、frontmatter の `tags: ["TypeScript", "設計パターン"]` を見て「これらが UI でどこかに表示されている」と誤解するリスクがある。実際に cycle-183 §AP-I01 では「タイトルに YAML とあるのにタグ欄に YAML が出ない」という認知的不整合が記録されている（UI で YAML タグが非表示になったことへの混乱）。タグ UI 廃止後はさらに「全タグが UI に出ない」状態となり、誤解リスクが高まる。

ただし `related_tool_slugs` も UI に直接表示されないが混乱が起きていないことを考えると、「内部シグナル専用フィールド」という文書化で誤解は防げる可能性がある。

---

## 5. 削除する場合の影響範囲

### frontmatter 変更

59 記事すべてに `tags:` フィールドが存在。`sed -i '/^tags:/d'` 一括削除で対応可能（1 コマンド、ただし配列が複数行になっている記事がないかの事前確認が必要）。全 59 記事の tags フィールドは `tags: [...]` 形式で 1 行に収まっていることを確認済み。

### コード変更（削除時）

| ファイル                               | 変更内容                                                                                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/blog/_lib/blog.ts`                | `BlogFrontmatter.tags`・`BlogPostMeta.tags` 型削除、`getRelatedPosts` 内 sharedTagCount 計算削除、`getAllTags`・`getPostsByTag`・`getTagsWithMinPosts` 削除（B-389 既定） |
| `src/blog/_components/searchFilter.ts` | `post.tags.join(" ")` の検索ターゲット行削除                                                                                                                              |
| `src/play/recommendation.ts`           | `getPlayRecommendationsForBlog(post.tags)` → `getPlayRecommendationsForBlog([])` になりフォールバック 2 件固定になる                                                      |
| `src/lib/seo.ts`                       | `keywords: post.tags` 削除（SEO メタキーワード）                                                                                                                          |
| `src/lib/search/build-index.ts`        | `keywords: post.tags` 削除                                                                                                                                                |
| `src/lib/feed.ts`                      | B-389 で既定削除                                                                                                                                                          |
| テスト: `blog-tags.test.ts`            | ファイルごと削除                                                                                                                                                          |
| テスト: `related-posts.test.ts`        | タグ関連スコアリング assertion 削除                                                                                                                                       |
| テスト: `searchFilter.test.ts`         | tags 検索関連 assertion 削除                                                                                                                                              |
| テスト: `seo.test.ts`                  | keywords assertion 修正                                                                                                                                                   |

### `getPlayRecommendationsForBlog` の影響

tags を空配列で渡すと `score > 0` のコンテンツが 0 件になり、`getFallbackRecommendations` による固定 2 件（PLAY_FEATURED_ITEMS の先頭 2 件）を返すようになる。記事のテーマと無関係なコンテンツが推薦される状態になる。日本語パズル記事から四字熟語クイズが推薦される等の有意義なマッチングが失われる。

---

## 6. 結論（推奨案）

### 推奨: **(A) 残置**

以下の根拠により、cycle-183 §6 v4 の「残置」判断を維持することを推奨する。

**残置の根拠（実体確認による）**：

1. **`getRelatedPosts` への影響が実質的**: 59 記事中 63%（37 記事）で推薦結果が変わり、14%（8 記事）で上位 3 件が完全入れ替わる。特に `japanese-culture` カテゴリ全 5 記事が同一シリーズのため、タグなしでは関連記事が 0 件になるという致命的ケースが確認された。

2. **`getPlayRecommendationsForBlog` の精度劣化**: タグ削除により全記事がフォールバック 2 件固定となり、テーマ一致レコメンドが機能しなくなる。

3. **検索への貢献は限定的だが実在する**: タグのみヒット源になるケースは 137 件（延べ）存在し、特に「Web開発」「設計パターン」「失敗と学び」等の主要タグは多数記事でタイトル・description 外のヒット源として機能する。

4. **削除コストが残置コストを上回る可能性**: 59 記事の frontmatter 変更 + 型定義・ロジック・テスト・`seo.ts`・`search/build-index.ts`・`recommendation.ts` の変更は、B-389 本体スコープに加えて有意な追加作業量になる。

**誤解リスクへの対処策（残置の場合）**:

`docs/anti-patterns/writing.md` または CLAUDE.md に「`tags` フィールドは内部メタデータ専用。UI には表示されないが `getRelatedPosts`・5 系統検索・`getPlayRecommendationsForBlog` の内部シグナルとして機能する」を追記する（cycle-183 §U-3 / B-389-9-2 で既定）。

**残置で不整合が残るフィールドの比較**:

- `related_tool_slugs`: UI 直接表示なし → 混乱報告なし
- `tags`: UI 直接表示なし（廃止後）→ ガイドライン明記で対処可能

### cycle-184 スコープへの影響

「残置」採用の場合、追加タスクなし。cycle-184 の B-389 スコープ（タグ UI 削除・TagList/タグページ/サイトマップ/リダイレクト整備）はそのまま実施し、B-389-9-2（frontmatter `tags` 運用ルール追記）を通常通り含める。

「削除」採用の場合、以下の追加タスクが必要：

- B-389-X: 59 記事 frontmatter から `tags:` 削除
- B-389-X: `BlogPostMeta.tags`・`BlogFrontmatter.tags` 型削除
- B-389-X: `searchFilter.ts` から tags 検索系統削除
- B-389-X: `getPlayRecommendationsForBlog` のシグネチャ変更またはフォールバック拡充
- B-389-X: `seo.ts`・`search/build-index.ts` の `keywords` 対応変更
- B-389-X: `related-posts.test.ts`・`searchFilter.test.ts`・`seo.test.ts` のタグ関連 assertion 削除・修正

---

## 実体確認に使ったコマンド

```
Read /mnt/data/yolo-web/src/blog/_lib/blog.ts
Read /mnt/data/yolo-web/src/blog/_components/searchFilter.ts
Read /mnt/data/yolo-web/src/play/recommendation.ts
Read "/mnt/data/yolo-web/src/app/(legacy)/blog/[slug]/page.tsx"
Read /mnt/data/yolo-web/docs/anti-patterns/writing.md

grep -rn "getRelatedPosts\|RelatedArticles" src/ --include="*.ts" --include="*.tsx"
grep -h "^tags:" src/blog/content/*.md | sort | uniq -c | sort -rn
grep -h "^category:" src/blog/content/*.md | sort | uniq -c | sort -rn

python3 (frontmatter解析: タグ vs タイトル/description 照合、全59記事)
python3 (getRelatedPosts シミュレーション: with_tags vs without_tags、全59記事)
python3 (GA検索語 vs タグ名照合分析)
python3 (タグ記述パターン統計: 件数・表記ゆれ)

GA API run_report: /blog/tag/* 90日PV (実測: 4行 = 合計4PV)
GA API run_report: /blog/* 上位20件 90日PV
GA API run_report: searchTerm 90日イベント数 (29件)
```
