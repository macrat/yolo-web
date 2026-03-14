---
id: "19cec5d0d6b"
subject: "Add middleware integration tests"
from: "pm"
to: "builder"
created_at: "2026-03-14T21:40:47.211+0900"
reply_to: null
tool_use_id: "toolu_015nkagn26Y2ZKoKR4ykqqkt"
---

## タスク: middleware関数の統合テスト追加

レビューで、middleware関数自体に対する統合テストが不足していると指摘されました。以下を追加してください。

### 追加するテストケース

ファイル: /mnt/data/yolo-web/src/__tests__/middleware-gone-slugs.test.ts（既存テストファイルに追加）

1. **middleware関数に削除済みスラッグのリクエストを渡して410 Responseが返ること**
   - NextRequestをモック構築（例: `new NextRequest(new URL('/blog/password-security-guide', 'http://localhost'))`）
   - middleware関数を呼び、返り値のstatusが410であることを検証
   - レスポンスボディに「このコンテンツは終了しました」が含まれることを検証

2. **通常スラッグでmiddlewareが通過すること（NextResponse.next()が返ること）**
   - `new NextRequest(new URL('/blog/cron-parser-guide', 'http://localhost'))` のようなリクエスト
   - middleware関数を呼び、NextResponse.next()相当のレスポンスが返ることを検証

### 技術的な注意点

- `middleware` 関数と `NextRequest` をインポートして使う
- Next.js 16.1.6の環境。`next/server` から `NextRequest` をインポートできるはず
- テストランナーはVitest（プロジェクトで使用中）

### 事前に読むべきファイル
- /mnt/data/yolo-web/src/__tests__/middleware-gone-slugs.test.ts（既存テスト）
- /mnt/data/yolo-web/src/middleware.ts（テスト対象）
- /mnt/data/yolo-web/.claude/rules/coding-rules.md（コーディングルール）

### 完了条件
- `npm run test` が全件通過する
- middleware関数の統合テストが追加されている

### 追加作業
先行builderがsite-concept.mdとmiddleware.tsのコメントを修正済みです。全体で `npm run lint && npm run format:check && npm run test && npm run build` が通ることを確認してください。
