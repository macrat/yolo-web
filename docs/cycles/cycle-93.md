---
id: 93
description: メモシステム廃止ステップ1 — ブログのrelated_memo_ids機能削除とメモリンクのGitHub置換
started_at: "2026-03-15T19:33:16+09:00"
completed_at: null
---

# サイクル-93

Ownerの指示（メモ19cf104dff5）に基づき、メモシステム廃止の第1ステップとしてブログ関連の変更を行う。具体的には、ブログの`related_memo_ids`機能の削除と、ブログ記事内の`/memos/`ページへのリンクをGitHubへのリンクに置き換える。

## 実施する作業

- [ ] タスク1: ブログの`related_memo_ids`機能を削除する（フロントマター定義、表示コンポーネント、型定義など）
- [ ] タスク2: ブログ記事内の`/memos/`ページへのリンクをGitHubへのリンクに置き換える

## 作業計画

### 目的

メモシステム廃止の第1ステップとして、ブログに残るメモ関連の機能とリンクを整理する。具体的には以下の2つを達成する：

1. `related_memo_ids`機能の完全削除 -- メモシステムへの依存をブログから取り除き、将来的なメモシステム廃止に備える
2. ブログ記事内の`/memos/`リンクをGitHubリンクに置換 -- メモページが廃止されてもリンク切れを起こさず、読者が参照情報にアクセスし続けられるようにする

### 作業内容

#### タスク1: `related_memo_ids`機能の削除

タスク1は編集対象が多いため、以下の3つのサブタスクに分割して順番に進める。各サブタスクはビルダーサブエージェントに委譲し、完了後にレビュアーサブエージェントでレビューする。

**サブタスク1-A: コンポーネントと型定義の削除**

以下をまとめて実施する（コードの依存関係が密結合しているため一括で行う）：

- `src/blog/_components/RelatedMemos.tsx` を削除
- `src/blog/_components/RelatedMemos.module.css` を削除
- `src/blog/_lib/blog.ts` の `BlogFrontmatter`（行53）と `BlogPostMeta`（行67）から `related_memo_ids` フィールドを削除。`getAllBlogPosts()`（行106-108）と `getBlogPostBySlug()`（行155-157）のフロントマター解析コードを削除
- `src/app/blog/[slug]/page.tsx` の RelatedMemos インポート（行24）と `<RelatedMemos ...>` 呼び出し（行118付近）を削除
- `src/lib/cross-links.ts` から `getRelatedMemosForBlogPost`関数、`memoToPosts`逆引き関連処理（`buildBlogReferenceIndex`内のmemo関連ループ、`BlogReferenceIndex`の`memoToPosts`フィールド）、`getRelatedBlogPostsForMemo`関数を削除。`getPublicMemoById`のインポートも削除
- `src/app/memos/[id]/page.tsx` の `generateStaticParams` 内の `post.related_memo_ids` 参照（行36）を削除

**サブタスク1-B: テストとフィクスチャの修正**

- `src/lib/__tests__/cross-links.test.ts` から `related_memo_ids`フィールドを持つモックデータ、`getRelatedMemosForBlogPost`・`getRelatedBlogPostsForMemo`のテストケースを削除
- `src/lib/__tests__/fixtures/sample-blog-post.md` の行9から `related_memo_ids` を削除
- `src/blog/_components/__tests__/SeriesNav.test.tsx` の行16の `related_memo_ids: []` を削除
- `src/app/__tests__/page.test.tsx` の行15の `related_memo_ids: []` を削除

サブタスク1-Bの完了後、`npm run lint && npm run format:check && npm run test && npm run build` を実行し、ビルドが通ることを確認する。

**サブタスク1-C: ブログ記事フロントマターとドキュメントの更新**

- 全50件のブログ記事の `related_memo_ids` 行をフロントマターから削除
- `.claude/rules/blog-writing.md` の行62の `related_memo_ids` 定義と行73の言及を削除

ブログ記事は1つのサブエージェントで全件を処理する（フロントマターの1行削除という機械的な作業であるため、分割するメリットが小さい）。

サブタスク1-A、1-B、1-Cの全完了後に中間コミットを行う。

#### タスク2: ブログ記事内の`/memos/`リンクをGitHubリンクに置換

タスク1とタスク2は同じブログ記事を編集する可能性があるため、タスク1を完了してからタスク2に着手する。

10件のブログ記事内の`/memos/{id}`リンクを`https://github.com/macrat/yolo-web/blob/{commit_hash}/{file_path}`形式のGitHubリンクに置き換える。

`/memos/feed`への言及（`2026-02-25-rss-feed-and-pagination.md`）は、個別メモへのリンクではなくフィードURLの説明テキストであるため、このタスクでは変更しない。ただし、ステップ2でフィード廃止時に対応が必要なのでキャリーオーバーに記載する。

タスク2でリンクを変更する記事は`updated_at`を更新する（サイト内リンクのURL変更に該当するため）。

**サブタスク2-A〜C: リンク置換（3バッチ、各3記事）**

以下の9件のブログ記事について、3記事ずつ3バッチに分けてサブエージェントを起動しリンクを置換する。各サブエージェントには対象記事のファイルパス、置換対象のメモID、対応するGitHubリンクURLを渡す。

バッチ1:

- `2026-02-18-site-rename-yolos-net.md` -- 2箇所
- `2026-02-28-traditional-color-palette-tool.md` -- 2箇所
- `2026-02-18-japanese-traditional-colors-dictionary.md` -- 2箇所

バッチ2:

- `2026-02-13-content-strategy-decision.md` -- 2箇所
- `2026-02-13-how-we-built-this-site.md` -- 2箇所
- `2026-02-18-tools-expansion-10-to-30.md` -- 1箇所

バッチ3:

- `2026-02-14-how-we-built-10-tools.md` -- 4箇所
- `2026-02-14-five-failures-and-lessons-from-ai-agents.md` -- 5箇所
- `2026-02-14-nextjs-static-tool-pages-design-pattern.md` -- 1箇所

GitHubリンクのマッピング（ `/memos/{メモID}` を以下のURLに置換）：

| メモID      | GitHubリンク                                                                                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 19c69aaed4f | `https://github.com/macrat/yolo-web/blob/932a4b4d0deb8fcb258ad9bf14fe50db0ea37473/memo/agent/archive/19c69aaed4f-update-site-name.md`                            |
| 19c6a077b3e | `https://github.com/macrat/yolo-web/blob/932a4b4d0deb8fcb258ad9bf14fe50db0ea37473/memo/agent/archive/19c6a077b3e-re-yolos-net.md`                                |
| 19ca2843141 | `https://github.com/macrat/yolo-web/blob/6296c9f54c04c0226d318427da5a3f64d2171d15/memo/agent/archive/19ca2843141-re-b-085.md`                                    |
| 19c85be20b1 | `https://github.com/macrat/yolo-web/blob/582ec591c92c97ce05f421c17e2232743ee55cab/memo/agent/archive/19c85be20b1-4.md`                                           |
| 19c6af8ae9f | `https://github.com/macrat/yolo-web/blob/932a4b4d0deb8fcb258ad9bf14fe50db0ea37473/memo/agent/archive/19c6af8ae9f-re-b-015.md`                                    |
| 19c6c170c9d | `https://github.com/macrat/yolo-web/blob/932a4b4d0deb8fcb258ad9bf14fe50db0ea37473/memo/agent/archive/19c6c170c9d-b-015-phase-1-complete.md`                      |
| 19c565ee77e | `https://github.com/macrat/yolo-web/blob/932a4b4d0deb8fcb258ad9bf14fe50db0ea37473/memo/agent/archive/19c565ee77e-research-high-pv-content-strategy.md`           |
| 19c56793c85 | `https://github.com/macrat/yolo-web/blob/932a4b4d0deb8fcb258ad9bf14fe50db0ea37473/memo/agent/archive/19c56793c85-research-ai-blog-memo-archive-seo.md`           |
| 19c561b1e88 | `https://github.com/macrat/yolo-web/blob/932a4b4d0deb8fcb258ad9bf14fe50db0ea37473/memo/agent/archive/19c561b1e88-plan-docs-and-baseline-setup.md`                |
| 19c562ee74c | `https://github.com/macrat/yolo-web/blob/932a4b4d0deb8fcb258ad9bf14fe50db0ea37473/memo/agent/archive/19c562ee74c-review-memo-management-tool-plan.md`            |
| 19c56628f5e | `https://github.com/macrat/yolo-web/blob/932a4b4d0deb8fcb258ad9bf14fe50db0ea37473/memo/agent/archive/19c56628f5e-plan-tools-collection-implementation.md`        |
| 19c56765ae2 | `https://github.com/macrat/yolo-web/blob/932a4b4d0deb8fcb258ad9bf14fe50db0ea37473/memo/agent/archive/19c56765ae2-re-tools-collection-implementation-complete.md` |
| 19c5679cebb | `https://github.com/macrat/yolo-web/blob/932a4b4d0deb8fcb258ad9bf14fe50db0ea37473/memo/agent/archive/19c5679cebb-review-tools-collection-implementation.md`      |
| 19c5770cea7 | `https://github.com/macrat/yolo-web/blob/932a4b4d0deb8fcb258ad9bf14fe50db0ea37473/memo/agent/archive/19c5770cea7-re-fix-cicd-vercel-deploy.md`                   |
| 19c576e66a8 | `https://github.com/macrat/yolo-web/blob/932a4b4d0deb8fcb258ad9bf14fe50db0ea37473/memo/agent/archive/19c576e66a8-re-fix-ci-lint-failure.md`                      |
| 19c5931fa02 | `https://github.com/macrat/yolo-web/blob/932a4b4d0deb8fcb258ad9bf14fe50db0ea37473/memo/agent/archive/19c5931fa02-re-xss-redos.md`                                |

**サブタスク2-D: GitHubリンクのアクセス確認**

全16個のGitHubリンクに対してHTTPアクセスを行い、200が返ることを確認する。アクセスできないリンクがあれば、コミットハッシュやファイルパスを修正する。

**サブタスク2-E: 最終ビルド確認**

`npm run lint && npm run format:check && npm run test && npm run build` を実行し、すべてが成功することを確認する。

タスク2の全完了後に中間コミットを行う。

#### 作業順序のまとめ

1. サブタスク1-A（コード変更） → レビュー
2. サブタスク1-B（テスト修正） → ビルド確認 → レビュー
3. サブタスク1-C（ブログ記事フロントマター・ドキュメント） → レビュー
4. 中間コミット
5. サブタスク2-A〜C（リンク置換、3バッチ） → 各バッチ後にレビュー
6. サブタスク2-D（アクセス確認）
7. サブタスク2-E（最終ビルド確認）
8. 中間コミット

### 検討した他の選択肢と判断理由

1. **タスク1とタスク2を並列で進める案** -- 同じブログ記事を両タスクで編集する可能性があるため、競合を避けてタスク1を先に完了させてからタスク2に着手する順序とした。

2. **ブログ記事のフロントマター削除を記事ごとに個別サブエージェントで行う案** -- `related_memo_ids`行の削除は完全に機械的な作業（行の削除のみ）であり、50件を個別エージェントで処理するオーバーヘッドが大きすぎる。1つのサブエージェントで一括処理する。

3. **GitHubリンクをmainブランチの最新コミットに向ける案** -- Ownerの指示で特定のコミットハッシュが指定されている。特定コミットにすることでファイルが将来移動・削除されてもリンク切れしない利点がある。

4. **`/memos/feed`リンクもこのステップで対応する案** -- Ownerの指示によりステップ2の範囲とされている。スコープを守り、キャリーオーバーに記録する。

5. **`updated_at`を更新するかどうか** -- `.claude/rules/blog-writing.md`のルールにより、タスク1の`related_memo_ids`フロントマター削除は「related_memo_ids変更」として更新不要。タスク2のリンクURL変更は「サイト内リンクのURL変更」に該当し更新が必要。

### 計画にあたって参考にした情報

- `src/blog/_lib/blog.ts` -- `BlogFrontmatter`と`BlogPostMeta`の型定義、フロントマター解析ロジックの確認
- `src/blog/_components/RelatedMemos.tsx` -- 削除対象コンポーネントの依存関係確認
- `src/lib/cross-links.ts` -- memo関連関数の範囲と、tool関連関数（残す）との境界の確認
- `src/app/blog/[slug]/page.tsx` -- RelatedMemosの使用箇所の確認
- `src/app/memos/[id]/page.tsx` -- `related_memo_ids`参照箇所の確認
- `.claude/rules/blog-writing.md` -- フロントマター仕様と`updated_at`更新ルールの確認
- `.claude/rules/coding-rules.md`（`docs/coding-rules.md`は存在せず、`.claude/rules/coding-rules.md`にある） -- コーディング原則の確認
- gitリモートURL -- GitHubリポジトリが `macrat/yolo-web` であることの確認

## レビュー結果

<作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。>

## キャリーオーバー

- `/memos/feed`への言及はステップ2で対応: `2026-02-25-rss-feed-and-pagination.md` 内の `/memos/feed` への言及（フィードURLの説明テキスト）は、個別メモへのリンクではないためこのサイクルでは変更しない。また、`2026-03-03-nextjs-route-handler-static-and-bundle-budget-test.md` 内にも `/memos/feed` と `/memos/feed/atom` への言及がある（フィードルートの静的化に関する技術的説明）。いずれもステップ2でフィード廃止時に対応が必要。

## 補足事項

<追加で補足しておくべきことがあれば記載する。とくに無い場合は「なし」と記載する。>

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
