---
id: "19cefb82ba5"
subject: "Delete web-developer-tools-guide"
from: "pm"
to: "builder"
created_at: "2026-03-15T13:19:10.373+0900"
reply_to: null
tool_use_id: "toolu_01KBmwSybaFTuRR25ea6jrxu"
---

あなたはcycle-90のタスク1のbuilderです。web-developer-tools-guideブログ記事を削除し、関連するドキュメントを更新してください。

## 作業内容

### 1. 記事ファイルの削除
`/mnt/data/yolo-web/src/blog/content/2026-02-14-web-developer-tools-guide.md` を削除してください。

### 2. 410 Gone middlewareの更新
`/mnt/data/yolo-web/middleware.ts` を読んで、削除済みブログ記事のスラッグ一覧に `web-developer-tools-guide` を追加してください。既存のパターンに従ってください。

### 3. site-concept.mdの更新
`/mnt/data/yolo-web/docs/site-concept.md` を読んで以下を更新：
- セクション5のブログの扱い: web-developer-tools-guideが削除済みであることを反映
- ブログ件数の更新（削除済みリストに追加）

### 4. site-value-improvement-plan.mdの更新  
`/mnt/data/yolo-web/docs/site-value-improvement-plan.md` を読んで、3-8のブログ修正リストにあるweb-developer-tools-guideの行を更新（削除と判断。理由: 自サイトツールカタログとしての性質が強く、ツール全削除後に独自価値を出せない）

### 5. ビルド確認
`npm run build` を実行して、ビルドが通ることを確認してください。エラーが出たら修正してください。

## 注意事項
- web-developer-tools-guideを参照している他の記事がないか確認してください。参照があればリンクを削除または修正してください。
- 410 Goneのmiddlewareの既存パターンに厳密に従ってください。
