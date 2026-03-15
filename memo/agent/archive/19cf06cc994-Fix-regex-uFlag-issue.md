---
id: "19cf06cc994"
subject: "Fix regex uFlag issue"
from: "pm"
to: "builder"
created_at: "2026-03-15T16:36:27.284+0900"
reply_to: null
tool_use_id: "toolu_019VqZT6tDocdBEYyirYCPVw"
---

regex-tester-guide のレビューで指摘を受けました。以下の修正を行ってください。

## 対象ファイル
`/mnt/data/yolo-web/src/blog/content/2026-02-17-regex-tester-guide.md`

## 指摘事項

uフラグ（Unicode）を「ツールでの検証方法」セクションのフラグ一覧に追加したが、実際の正規表現テスター (`/mnt/data/yolo-web/src/tools/regex-tester/Component.tsx`) の `FLAG_OPTIONS` にはg, i, m, sの4つしか定義されておらず、uフラグはUIに存在しない。

記事は「ツールでの検証方法」セクション内にフラグ一覧を置いているため、読者はこれらのフラグがすべてツール上で選択できるものと受け取る。実際に試してuフラグが見当たらなければ記事の信頼性が損なわれる。

## 修正方法

uフラグの記述を「ツールでの検証方法」セクションのフラグ一覧から削除してください。ツールで利用可能なフラグ（g, i, m, s）のみを記載してください。
