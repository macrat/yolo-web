---
id: 94
description: メモシステム廃止ステップ2-3 — /memos/feedの廃止と/memosページのGitHubリダイレクト化
started_at: "2026-03-15T20:35:17+09:00"
completed_at: "2026-03-15T21:43:47+09:00"
---

# サイクル-94

Owner指示（メモ19cf104dff5）に基づくメモシステム廃止の第2・第3ステップ。/memos/feedを410 Goneに変更し、/memosの全ページをGitHubへのリダイレクトで置き換える。また、cycle-93のキャリーオーバーであるブログ記事内の`/memos/feed`への言及にも対応する。

## 実施する作業

- [x] タスク1: /memos/feedを廃止して410 Goneを返すようにする
- [x] タスク2: /memosページを廃止して、すべてのページをGitHubへのリダイレクトで置き換える
- [x] タスク3: ブログ記事内の`/memos/feed`への言及に廃止済みである旨を追記する（cycle-93キャリーオーバー。当時の状況を尊重し、元の記述は削除しない）

## 作業計画

### 前提情報

- **GitHubリダイレクト用コミットハッシュ**: `6f35080` — 残存メモファイルを記録用にコミットした最終コミット。このコミット時点でmemo/ディレクトリに全5008件のメモファイルが存在する。メモディレクトリが将来削除されてもこのコミットハッシュを使えばGitHub上でファイルを閲覧できる。
- **メモIDとファイルパスのマッピング**: メモファイルは `memo/{partition}/{status}/{id}-{rest}.md` の命名規則に従い、IDの重複はない。IDからファイル名のプレフィックスで一意にファイルパスを特定できる。
- **feedライブラリとsanitize-htmlライブラリ**: どちらもブログフィード (`src/lib/feed.ts`) やHTML sanitize (`src/lib/sanitize.ts`) で使用されているため、パッケージ自体は削除しない。
- **ブログ記事の追記ルール**: `docs/site-value-improvement-plan.md` の「修正時の原則」に従い、当時の状況は変更せず追記で補足する。追記には日付と経緯を明記し、`updated_at`を更新する。

### タスク1: /memos/feedの廃止（410 Gone）

#### サブタスク1-1: フィードルートを410 Goneに変更

builderに以下を実施させる:

- `src/app/memos/feed/route.ts` を書き換え、410 Goneレスポンスを返すようにする（レスポンスボディに廃止の旨を記載）
- `src/app/memos/feed/atom/route.ts` も同様に410 Goneに変更
- `src/lib/feed-memos.ts` を削除
- `src/lib/__tests__/feed-memos.test.ts` を削除
- `src/app/memos/feed/__tests__/memo-feed.test.ts` を書き換え、410 Goneが返ることをテストする内容に変更
- builderには `.claude/rules/coding-rules.md` を直接読ませること

完了後: reviewerにレビューを依頼 → 指摘対応 → 中間コミット

### タスク2: /memosページの廃止（GitHubリダイレクト）

#### サブタスク2-1: メモIDからGitHub URLへのマッピング生成

builderに以下を実施させる:

- `memo/`ディレクトリを走査し、メモIDからGitHub上のファイルパスへのマッピングを生成するスクリプトを作成する（または既存の `scripts/build-memo-index.ts` を参考にワンショットスクリプトとして実行する）
- 出力形式: `src/memos/_data/memo-path-map.json` — `{ "メモID": "memo/{partition}/{status}/{id}-{rest}.md" }` のJSON
- コミットハッシュ `6f35080` を定数として保持し、GitHub URLは `https://github.com/macrat/yolo-web/blob/6f35080/{ファイルパス}` の形式で組み立てる
- **方針**: マッピングJSONは `src/memos/_data/memo-path-map.json` にコミットし、route handlerからサーバーサイドでのみ読み込む（クライアントバンドルには含めない）
- builderには `.claude/rules/coding-rules.md` を直接読ませること

完了後: reviewerにレビューを依頼 → 指摘対応 → 中間コミット

#### サブタスク2-2: メモページをGitHubリダイレクトに置き換え

builderに以下を実施させる:

- `/memos` (一覧ページ): `https://github.com/macrat/yolo-web/tree/6f35080/memo` への301リダイレクトに変更
- `/memos/[id]` (個別メモ): サブタスク2-1で生成したマッピングを使い、対応するGitHub URLへの301リダイレクトに変更。IDが見つからない場合は404を返す
- `/memos/thread/[id]` (スレッド): スレッドIDはルートメモのIDと同じなので、個別メモと同じマッピングで対応するGitHub URLへの301リダイレクトに変更
- 各ページの既存コンポーネント・レイアウトファイルを削除し、route handlerまたはシンプルなリダイレクト実装に置き換える
  - 削除対象: `src/app/memos/page.tsx`, `src/app/memos/layout.tsx`, `src/app/memos/layout.module.css`, `src/app/memos/page.module.css`, `src/app/memos/[id]/page.tsx`, `src/app/memos/[id]/page.module.css`, `src/app/memos/[id]/loading.tsx`, `src/app/memos/[id]/loading.module.css`, `src/app/memos/thread/[id]/page.tsx`, `src/app/memos/thread/[id]/page.module.css`, `src/app/memos/thread/[id]/loading.tsx`, `src/app/memos/thread/[id]/loading.module.css`
- builderには `.claude/rules/coding-rules.md` を直接読ませること

完了後: reviewerにレビューを依頼 → 指摘対応 → 中間コミット

#### サブタスク2-3: フィーチャー層とテスト・参照の整理

builderに以下を実施させる:

- `src/memos/_lib/memos.ts` を削除（ただしサブタスク2-2のリダイレクトでマッピング読み込みに使用する場合は残す）
- `src/memos/_lib/memos-shared.ts` を削除（同上）
- `src/memos/_components/` ディレクトリごと削除（MemoCard, MemoFilter, MemoDetail, MemoThreadView, RelatedBlogPosts, RoleBadge および関連する `.module.css` ファイルを含む）
- `src/memos/__tests__/` ディレクトリごと削除
- `src/components/common/Footer.tsx` 35行目の `{ href: "/memos", label: "メモ" }` を削除
- `src/app/__tests__/seo-coverage.test.ts` からメモ関連のテスト（/memos静的メタデータ、/memos/[id]動的メタデータ、/memos/thread/[id]動的メタデータ）を削除
- `src/__tests__/bundle-budget.test.ts` 63行目の `"/memos": 15 * 1024` を削除
- `src/lib/seo.ts` から `generateMemoPageMetadata`, `generateMemoPageJsonLd`, `MemoMetaForSeo` を削除
- `src/lib/__tests__/seo.test.ts` からメモ関連テスト（464-517行目、785-800行目付近）を削除
- `src/lib/pagination.ts` から `MEMOS_PER_PAGE` 定数を削除
- `src/components/common/__tests__/Pagination.test.tsx` の105-113行目付近にあるメモURL（`/memos?page=`）を使用したテストケースを、メモ以外のURL（例: `/tools?page=`）に修正する
- `scripts/build-memo-index.ts` を削除（memo-index.jsonの生成元）
- `.generated/memo-index.json` を削除（またはgitignoreで管理されている場合は生成を停止するだけ）
- `package.json` の `generate:static-assets` スクリプトから `tsx scripts/build-memo-index.ts &&` を削除する
- builderには `.claude/rules/coding-rules.md` を直接読ませること

完了後: reviewerにレビューを依頼 → 指摘対応 → 中間コミット

### タスク3: ブログ記事への廃止追記

#### サブタスク3-1: rss-feed-and-pagination記事への追記

builderに以下を実施させる:

- 対象: `src/blog/content/2026-02-25-rss-feed-and-pagination.md`
- 272行目の `[メモRSSフィード](/memos/feed)` — リンクは廃止済みページへのリンクなので、リンクテキストの直後に追記で「このフィードは2026年3月に廃止されました」旨を補足する。元のリンク自体は削除しない（当時の状況を尊重）
- 89-90行目のテーブル内エンドポイント説明は当時の事実記述なので変更不要
- 246行目の代替案比較テーブルも当時の設計判断の記録なので変更不要
- `updated_at` を現在日時（2026-03-15）で更新
- `docs/site-value-improvement-plan.md` の追記ルールに従うこと
- builderには `.claude/rules/coding-rules.md` を直接読ませること

完了後: reviewerにレビューを依頼 → 指摘対応 → 中間コミット

#### サブタスク3-2: nextjs-route-handler-static記事への追記

builderに以下を実施させる:

- 対象: `src/blog/content/2026-03-03-nextjs-route-handler-static-and-bundle-budget-test.md`
- 80行目、82-84行目、116行目、128行目、221行目のメモフィード関連の言及は、技術解説・設計判断の文脈であり当時の事実記述
- 記事末尾または適切な位置に、メモフィードが2026年3月に廃止された旨の追記を加える（記事本文の技術解説は当時の事実としてそのまま残す）
- `updated_at` を現在日時（2026-03-15）で更新
- `docs/site-value-improvement-plan.md` の追記ルールに従うこと
- builderには `.claude/rules/coding-rules.md` を直接読ませること

完了後: reviewerにレビューを依頼 → 指摘対応 → 中間コミット

### 全体完了後

- `npm run lint && npm run format:check && npm run test && npm run build` を実行して全体の整合性を確認
- 問題があれば修正
- サイクルドキュメントの「実施する作業」チェックリストを更新

## レビュー結果

計画レビュー:

- 1回目: 7件指摘（301/308の選択、削除対象漏れ4件、マッピング方針の曖昧さ、JSDoc未記載）
- 2回目: 指摘なし、承認

タスク1, 2-1, 3-1, 3-2:

- 1回目: 指摘なし、承認

タスク2-2:

- 1回目: 1件指摘（/memos/route.tsのforce-dynamic→force-static）
- 修正後: サブタスク2-3と合わせて再レビュー

タスク2-3 + 2-2修正:

- 1回目: 1件指摘（Pagination.tsxのJSDocコメント内メモ参照の残存）
- 修正後: デッドコード調査を追加実施し、MEMO_TRUST_LEVEL/MEMO_TRUST_NOTE、buildUrlプロパティ、markdown.tsコメント等も削除

## キャリーオーバー

## 補足事項

- `scripts/install-hooks.sh` のmemo-lint処理、`scripts/memo.ts`、`scripts/memo-lint.ts`、`scripts/spawner/`、`scripts/memo/` 配下はステップ5（別サイクル）で削除予定のため本サイクルでは対象外とする。

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
