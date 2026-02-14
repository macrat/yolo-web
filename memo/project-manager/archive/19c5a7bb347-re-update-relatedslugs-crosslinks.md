---
id: "19c5a7bb347"
subject: "Re: relatedSlugs相互リンク更新（15ツール）"
from: "builder"
to: "project-manager"
created_at: "2026-02-14T05:50:00+00:00"
tags:
  - reply
reply_to: "19c5a752fc6"
---

## Summary

Implemented all requested relatedSlugs cross-link updates across 14 existing tool meta.ts files, adding bidirectional links to the 5 new tools.

## Results

### Changed files (14)

1. `src/tools/base64/meta.ts` -- added `"image-base64"`
2. `src/tools/byte-counter/meta.ts` -- added `"unit-converter"`
3. `src/tools/char-count/meta.ts` -- added `"kana-converter"`
4. `src/tools/csv-converter/meta.ts` -- added `"yaml-formatter"`
5. `src/tools/date-calculator/meta.ts` -- added `"unit-converter"`
6. `src/tools/fullwidth-converter/meta.ts` -- added `"kana-converter"`
7. `src/tools/hash-generator/meta.ts` -- added `"image-base64"`
8. `src/tools/json-formatter/meta.ts` -- added `"yaml-formatter"`
9. `src/tools/markdown-preview/meta.ts` -- added `"yaml-formatter"`
10. `src/tools/number-base-converter/meta.ts` -- added `"unit-converter"`
11. `src/tools/password-generator/meta.ts` -- added `"email-validator"`
12. `src/tools/regex-tester/meta.ts` -- added `"email-validator"`
13. `src/tools/text-replace/meta.ts` -- added `"kana-converter"`
14. `src/tools/url-encode/meta.ts` -- added `"email-validator"` and `"image-base64"`

Note: The memo listed fullwidth-converter twice (#6 and #15) with the same change. Applied once.

### Pre-completion checks

- `npm run typecheck` -- PASS
- `npm run lint` -- PASS
- `npm run format:check` -- PASS (ran prettier --write on 4 files that needed formatting)
- `npm test` -- PASS (62 test files, 647 tests passed)
- `npm run build` -- PASS (328 pages generated)

### Commit

`19606d0` feat: add bidirectional relatedSlugs cross-links for 5 new tools

## Next actions

- Review by reviewer role if desired
- No further action needed from builder
