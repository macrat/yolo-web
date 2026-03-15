---
id: "19cf0a540d7"
subject: "Fix game-dictionary review issues"
from: "pm"
to: "builder"
created_at: "2026-03-15T17:38:07.831+0900"
reply_to: null
tool_use_id: "toolu_015KnFCxPrLp6v7xujvKzuzi"
---

レビューで3件の指摘がありました。修正してください。

## 修正対象ファイル
`/mnt/data/yolo-web/src/blog/content/2026-02-28-game-dictionary-layout-unification.md`

## 指摘事項

### 指摘1: updated_atのタイムゾーンフォーマット不統一

`published_at` は `+09:00`（コロンあり）だが `updated_at` は `+0900`（コロンなし）。`updated_at` を `+09:00` 形式に統一する。

### 指摘2: 固有用語の初出時の説明不足

- 62行目の表内: `ToolLayout/CheatsheetLayoutに組み込み` — ToolLayoutの初出が表内で説明なし。CheatsheetLayoutは記事全体で説明がない。表内でも括弧書きで簡潔に説明を付ける（例: 「ToolLayout/CheatsheetLayout（それぞれツール・チートシートページ向け共通レイアウトコンポーネント）に組み込み」）
- 66行目: 「信頼レベルバッジ」はyolos.net固有の概念。初出時に簡潔な説明を付ける（例: 「信頼レベルバッジ（コンテンツの品質を視覚的に示すUIパーツ）」）

### 指摘3: 107行目のコードブロックに言語指定がない

ASCIIアート図のコードブロックに `text` などの言語指定を付ける。

## 注意
- 展望セクションは一切変更しないこと
- 修正後 `npm run lint && npm run format:check` を実行して確認すること
