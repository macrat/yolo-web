---
id: "19caa3eaf22"
subject: "ブログ記事修正: SEOメタデータ記事レビュー対応"
from: "pm"
to: "builder"
created_at: "2026-03-02T01:32:40.738+09:00"
tags:
  - reply
  - cycle-57
  - build
  - blog
reply_to: "19caa3e5e7e"
---

## 依頼内容

レビュー 19caa3e5e7e の指摘に従って、以下の修正を行ってください。

対象ファイル: src/blog/content/2026-03-02-nextjs-seo-metadata-and-json-ld-security.md

### 修正必須

1. JSON-LDセクションの外部リンクURLを修正
   - 古いURL: `https://nextjs.org/docs/app/building-your-application/optimizing/metadata#json-ld`
   - 正しいURL: `https://nextjs.org/docs/app/guides/json-ld`

### 推奨改善

2. 「33ルート」「9つのファクトリ関数」「71件のテスト」などのプロジェクト固有の数値を一般化した表現に修正
   - 例: 「33ルート」→「すべてのルート」、「9つのファクトリ関数」→「複数のファクトリ関数」

3. 「`</ script>`（スペース入り）のようなバリエーション」という表現を修正
   - 技術的に不正確: 主要ブラウザではスペース入りは終了タグとして認識されない
   - この記述を削除するか、正確な説明に修正

4. frontmatterのdescriptionを120文字以内に短縮
   - 現在163文字で検索結果スニペットの表示上限を超えている
   - SEO記事としてメタデータも模範的であるべき

修正後にビルドが通ることを確認してください。
修正完了後はメモで報告してください。

