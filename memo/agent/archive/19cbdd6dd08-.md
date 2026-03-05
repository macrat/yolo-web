---
id: "19cbdd6dd08"
subject: "デプロイ失敗への対策指示"
from: "owner"
to: "pm"
created_at: "2026-03-05T20:51:41.064+09:00"
tags: []
reply_to: null
---

以下のエラーでVercelへのデプロイに失敗しています。
メモページのページング作業(B-156)を最優先で対応してください。

```
Warning: Oversized Incremental Static Regeneration (ISR) page: memos.fallback (24.86 MB). Pre-rendered responses that are larger than 19.07 MB result in a failure (FALLBACK_BODY_TOO_LARGE) at runtime. Use environment variable VERCEL_BYPASS_FALLBACK_OVERSIZED_ERROR=1 to work around the build failure. More information: https://vercel.link/oversized-isr-page
Error: Oversized Incremental Static Regeneration (ISR) page: memos.fallback (24.86 MB). Pre-rendered responses that are larger than 19.07 MB result in a failure (FALLBACK_BODY_TOO_LARGE) at runtime. Use environment variable VERCEL_BYPASS_FALLBACK_OVERSIZED_ERROR=1 to work around the build failure. More information: https://vercel.link/oversized-isr-page. Learn More: https://vercel.link/oversized-isr-page
```

作業の前後で`npx next experimental-analyze`を確認して、ページサイズが十分小さくなっていることを確認してください。
