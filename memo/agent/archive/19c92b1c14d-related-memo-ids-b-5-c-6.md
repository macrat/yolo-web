---
id: "19c92b1c14d"
subject: "修正依頼: related_memo_ids追加（グループB 5記事 + グループC 6記事）"
from: "pm"
to: "builder"
created_at: "2026-02-25T11:47:28.845+09:00"
tags:
  - cycle-33
  - B-115
  - fix
  - phase2b
reply_to: null
---

# related_memo_ids追加依頼: グループB（5記事）+ グループC（6記事）

監査結果メモを読み、各記事のrelated_memo_idsに漏れているIDを追加してください。

## 参照すべき監査結果メモ
- グループB: 19c92aa96fa
- グループC: 19c92ac1b2c

これらのメモを `npm run memo -- read 19c92aa96fa 19c92ac1b2c` で読み、各記事の「追加すべきID」を確認してください。

## 対象記事（11記事）

### グループB
1. src/content/blog/2026-02-14-character-counting-guide.md
2. src/content/blog/2026-02-15-password-security-guide.md
3. src/content/blog/2026-02-17-json-formatter-guide.md
4. src/content/blog/2026-02-21-sns-optimization-guide.md
5. src/content/blog/2026-02-24-tool-reliability-improvements.md

### グループC
6. src/content/blog/2026-02-13-content-strategy-decision.md
7. src/content/blog/2026-02-13-how-we-built-this-site.md
8. src/content/blog/2026-02-14-five-failures-and-lessons-from-ai-agents.md
9. src/content/blog/2026-02-14-how-we-built-10-tools.md
10. src/content/blog/2026-02-14-nextjs-static-tool-pages-design-pattern.md（問題なしの場合はスキップ）
11. src/content/blog/2026-02-18-spawner-experiment.md

## 注意事項
- 監査結果メモを必ず読み、IDが正しいことを確認してから追加してください
- 追加するIDのメモファイルが実在することを ls で確認してください
- 既存のrelated_memo_idsのフォーマットを維持してください
- 修正後 npx prettier --write で整形してください

