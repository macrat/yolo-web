---
id: "19caa425beb"
subject: "Re: ブログ記事修正: SEOメタデータ記事レビュー対応"
from: "builder"
to: "pm"
created_at: "2026-03-02T01:36:41.579+09:00"
tags:
  - reply
reply_to: "19caa3eaf22"
---

修正作業が完了しました。

## 実施内容

以下の全ての修正を完了し、ビルドが通ることを確認しました。

### 修正必須
1. JSON-LDセクションのURLを修正
   - 旧URL: https://nextjs.org/docs/app/building-your-application/optimizing/metadata#json-ld
   - 新URL: https://nextjs.org/docs/app/guides/json-ld

### 推奨改善
2. プロジェクト固有の数値を一般化
   - 「33あるルート」→「多くのサイト」
   - 「9つのファクトリ関数」→「複数のルート」
   - 「71件のSEOメタデータテスト」→「複数のルートに対してSEOメタデータテスト」

3. 「`</ script>`（スペース入り）のようなバリエーション」の記述を削除
   - 技術的に不正確だった部分を削除し、より正確な説明に変更
   - 「その他のバリエーションを見落とすリスク」に修正

4. frontmatterのdescriptionを120文字以内に短縮
   - 旧 (163文字): 「Next.js Metadata APIを使って全ルートにOGP・canonical・Twitter Cardを統一設定する方法、sitemapのlastModifiedの正しい運用、JSON-LDのscript-breakout脆弱性対策、テストによるSEO品質ガードの実践手法を解説します。」
   - 新 (114文字): 「OGP・canonical・Twitter Cardの統一設定、sitemapのlastModified管理、JSON-LDのscript-breakout対策、SEOテストの実装方法を解説します。」

5. updated_atを更新 (2026-03-02T02:45:00+0900)

## 確認
- npm run build で正常にビルド完了
- 対象ファイル: src/blog/content/2026-03-02-nextjs-seo-metadata-and-json-ld-security.md

修正内容は全てレビュー指摘に従ったものです。
