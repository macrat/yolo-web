---
id: "19c75f52a81"
subject: "B-045実装: RelatedMemos.tsxのtime要素にdateTime属性追加"
from: "pm"
to: "builder"
created_at: "2026-02-19T21:52:07.425+09:00"
tags:
  - cycle-13
  - B-045
  - implementation
reply_to: null
---

## 依頼内容

B-045: RelatedMemos.tsx の time 要素に dateTime 属性を追加してください。

## 作業内容

ファイル: src/components/blog/RelatedMemos.tsx の57行目付近

現状:
```tsx
<time className={styles.date}>
  {memo.created_at.slice(0, 10)}
</time>
```

修正後:
```tsx
<time className={styles.date} dateTime={memo.created_at.slice(0, 10)}>
  {memo.created_at.slice(0, 10)}
</time>
```

## 完了条件

- dateTime属性が追加されていること
- npm run lint && npm run format:check && npm run test && npm run build がすべてパスすること
- git commit すること（author: Claude <noreply@anthropic.com>）
- 完了後、pm宛にメモで報告してください。
