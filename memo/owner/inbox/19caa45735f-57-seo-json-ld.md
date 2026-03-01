---
id: "19caa45735f"
subject: "サイクル-57完了報告: SEOメタデータ改善とJSON-LDセキュリティ対策"
from: "pm"
to: "owner"
created_at: "2026-03-02T01:40:04.191+09:00"
tags:
  - cycle-57
  - report
reply_to: null
---

## サイクル-57 完了報告

### 完了したタスク

#### B-148: SEOメタデータ改善（sitemap lastModified・OGP/canonical）
- **#14 robots.tsフォールバックURL修正**: `src/app/robots.ts` のローカルBASE_URL定義を削除し、`@/lib/constants` からインポートするよう修正
- **#18 sitemap lastModified修正**: `new Date()` 固定を廃止し、コンテンツの実際の公開日を使用するよう全面書き換え
  - GameMeta/DictionaryMetaに`publishedAt`フィールドを追加
  - リスト系ページは配下コンテンツの最新日時を使用
  - 静的ページは定数で管理
- **#20 OGP/canonical/twitter全ルート追加**: 全33ルートにopenGraph.url/canonical/twitterメタデータを追加
  - seo.tsの9つのファクトリ関数にtwitter追加
  - トップページにmetadata export追加
  - 辞典ページのcanonicalを相対パスから絶対パスに統一
- **#21 SEOテスト71件追加**: 
  - seo-coverage.test.ts（新規）: 24テスト（静的16+動的8ルートのメタデータ検証）
  - seo.test.ts拡充: 45+テスト（7つの未テストファクトリ関数 + safeJsonLdStringify）
  - seo-cheatsheet.test.ts: 2テスト追加
  - sitemap.test.ts: 5テスト追加

#### B-149: JSON-LD script-breakout対策
- `safeJsonLdStringify`関数を`src/lib/seo.ts`に追加（JSDocコメント付き）
- 全14ファイルの`JSON.stringify(jsonLd)`を`safeJsonLdStringify(jsonLd)`に移行
- テスト5件追加（通常変換、`</script>`エスケープ、ネスト対象、空オブジェクト/配列）

### 成果物（作成・変更したファイル）

**新規作成:**
- `src/app/__tests__/seo-coverage.test.ts` - SEOカバレッジテスト

**変更したファイル:**
- `src/lib/seo.ts` - twitter追加（9ファクトリ）+ safeJsonLdStringify追加
- `src/app/robots.ts` - フォールバックURL修正
- `src/app/sitemap.ts` - lastModified全面書き換え
- `src/app/page.tsx` - metadata export追加
- `src/games/types.ts` - publishedAt追加
- `src/games/registry.ts` - publishedAt値追加
- `src/dictionary/_lib/types.ts` - publishedAt追加
- `src/dictionary/_lib/dictionary-meta.ts` - publishedAt値追加
- 33 page.tsxファイル - openGraph/canonical/twitter追加
- 14ファイル - JSON-LD safeJsonLdStringify移行
- `src/lib/__tests__/seo.test.ts` - 45+テスト追加
- `src/lib/__tests__/seo-cheatsheet.test.ts` - 2テスト追加
- `src/app/__tests__/sitemap.test.ts` - 5テスト追加

**ブログ記事:**
- `src/blog/content/2026-03-02-nextjs-seo-metadata-and-json-ld-security.md` - 新規作成

### テスト結果サマリー

- テストファイル: 139 passed (139)
- テスト数: 1,763 passed (1,763)
- lint: clean
- format: clean
- build: 成功

### レビュー結果サマリー

- 実装レビュー1回目（19caa12a368）: Approve（軽微指摘1件: JSDocコメント追加→対応済み）
- 最終レビュー（19caa23cab0）: Approve（指摘事項なし）
- ブログ記事レビュー1回目（19caa3e5e7e）: Conditional Approve（URL修正1件必須+推奨3件→対応済み）
- ブログ記事再レビュー（19caa447ca1）: Approve（指摘事項なし）

### 未完了・キャリーオーバー

- なし

### 補足

- ownerからの依頼（B-159: ツール・チートシートのダイナミックインポート廃止）はowner指示により非優先とし、Queuedに登録済み

