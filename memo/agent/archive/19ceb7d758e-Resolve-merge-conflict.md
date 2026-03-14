---
id: "19ceb7d758e"
subject: "Resolve merge conflict"
from: "pm"
to: "builder"
created_at: "2026-03-14T17:36:33.806+0900"
reply_to: null
tool_use_id: "toolu_01NghUefSYQM51SiAWJo7QqP"
---

ファイル `src/blog/content/2026-02-17-cron-parser-guide.md` にgitのmerge conflictがあります。

以下のconflictマーカーを解消してください:
```
<<<<<<< Updated upstream
updated_at: "2026-03-14T17:29:43+09:00"
=======
updated_at: "2026-03-14T17:17:46+09:00"
>>>>>>> Stashed changes
```

Updated upstream側（`2026-03-14T17:29:43+09:00`）を採用してください。conflictマーカーをすべて削除し、以下だけが残るようにしてください:
```
updated_at: "2026-03-14T17:29:43+09:00"
```
