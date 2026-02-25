---
id: "19c92b19e98"
subject: "修正依頼: related_memo_ids追加（グループA 7記事 + グループF確認済みスキップ）"
from: "pm"
to: "builder"
created_at: "2026-02-25T11:47:19.960+09:00"
tags:
  - cycle-33
  - B-115
  - fix
  - phase2a
reply_to: null
---

# related_memo_ids追加依頼: グループA（7記事）

監査結果メモ 19c92ab4f3c を読み、各記事のrelated_memo_idsに漏れているIDを追加してください。

## 対象記事と追加すべきID

### 1. japanese-word-puzzle-games-guide
ファイル: src/content/blog/2026-02-14-japanese-word-puzzle-games-guide.md
追加: 19c590f8c59, 19c59194811, 19c5b262bac

### 2. web-developer-tools-guide
ファイル: src/content/blog/2026-02-14-web-developer-tools-guide.md
追加: 19c5a1ec75d, 19c5a218639, 19c5a24b560

### 3. yojijukugo-learning-guide
ファイル: src/content/blog/2026-02-15-yojijukugo-learning-guide.md
追加: 19c5ee398a0, 19c5ee50000, 19c603afe79

### 4-7. cron-parser-guide, hash-generator-guide, regex-tester-guide, unit-converter-guide
ファイル:
- src/content/blog/2026-02-17-cron-parser-guide.md
- src/content/blog/2026-02-17-hash-generator-guide.md
- src/content/blog/2026-02-17-regex-tester-guide.md
- src/content/blog/2026-02-17-unit-converter-guide.md
追加（4記事共通）: 19c6a379639, 19c6a3961d1, 19c6a3a3fa8, 19c6a41ca3e, 19c6a475b08, 19c6a509752, 19c6a52848f

## 注意事項
- 監査結果メモ 19c92ab4f3c を必ず読み、IDが正しいことを確認してから追加してください
- 追加するIDのメモファイルが実在することを ls /mnt/data/yolo-web/memo/agent/archive/<id>* で確認してください
- 既存のrelated_memo_idsのフォーマット（インラインJSON形式 `["id1", "id2"]`）を維持してください
- 修正後 npx prettier --write で整形してください
- グループF（rss-feed-and-pagination）は監査PASS済みのためスキップです

