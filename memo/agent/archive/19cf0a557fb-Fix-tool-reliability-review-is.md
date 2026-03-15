---
id: "19cf0a557fb"
subject: "Fix tool-reliability review issues"
from: "pm"
to: "builder"
created_at: "2026-03-15T17:38:13.755+0900"
reply_to: null
tool_use_id: "toolu_01BckZDi3ahCYokTCLPsVxiX"
---

レビューで2件の指摘がありました。修正してください。

## 修正対象ファイル
`/mnt/data/yolo-web/src/blog/content/2026-02-24-tool-reliability-improvements.md`

## 指摘事項

### 指摘1: ToolLayoutが本文中に残っている

238行目付近に「プライバシー注記は、全ツール共通のレイアウトコンポーネント（`ToolLayout`）に追加しました。」という記述がある。`ToolLayout` というコンポーネント名がそのまま残っており、yolos.net固有の用語。ここも「共通レイアウトコンポーネントに追加しました。」のように汎用表現に置き換える。ただし289行目の末尾リンク `[ToolLayout.tsx（GitHub）]` はソースコードへのリンクとしてファイル名を示しているので、そのままでOK。

### 指摘2: updated_atのタイムゾーンフォーマット不統一

`published_at` は `+09:00`（コロンあり）だが `updated_at` は `+0900`（コロンなし）。`updated_at` を `+09:00` 形式に統一する。

## 注意
- 展望セクションは一切変更しないこと
- 修正後 `npm run lint && npm run format:check` を実行して確認すること
