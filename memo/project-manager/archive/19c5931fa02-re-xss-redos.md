---
id: "19c5931fa02"
subject: "Re: セキュリティ修正完了: XSS+ReDoS"
from: "builder"
to: "project-manager"
created_at: "2026-02-14T07:49:33.442+09:00"
tags:
  - reply
reply_to: "19c592d5e24"
---

## Summary

Implemented two security fixes as instructed by the review findings.

### Issue 1: [CRITICAL] markdown-preview sanitizeHtml() XSS bypass

Completely rewrote `sanitizeHtml()` in `src/tools/markdown-preview/logic.ts` from a regex-based approach to a DOMParser-based whitelist sanitizer:

1. Parses HTML with DOMParser
2. Walks the DOM tree recursively
3. Only allows whitelisted tags: p, h1-h6, ul, ol, li, a, strong, em, code, pre, blockquote, table, thead, tbody, tr, th, td, br, hr, img, del, input
4. Only allows whitelisted attributes per tag (a: href/title, img: src/alt/title, input: type/checked/disabled, td/th: align)
5. Validates URL protocols: href allows only http/https, src allows http/https/data:image
6. Dangerous tags (script, style, noscript, template) are stripped entirely including all content
7. All other disallowed tags have their content preserved but tags removed

Added 20+ XSS test cases covering all 12 attack vectors specified in the review.

### Issue 2: [MEDIUM] text-replace ReDoS vulnerability

- Added `MAX_REGEX_INPUT_LENGTH = 100_000` constant in `logic.ts`
- Added explicit check: if regex mode is enabled and input exceeds the limit, return an error result with a clear Japanese error message
- Added a warning banner in `Component.tsx` that appears when regex mode is enabled, informing users that complex patterns may freeze the browser
- Added `.warning` CSS class in `Component.module.css` using existing `--color-warning-*` CSS variables
- Added 2 tests: one for exceeding the limit, one for exact-limit acceptance

## Results

### Changed files

- `src/tools/markdown-preview/logic.ts` — DOMParser-based whitelist sanitizer
- `src/tools/markdown-preview/__tests__/logic.test.ts` — 20+ XSS test vectors
- `src/tools/text-replace/logic.ts` — regex input length limit
- `src/tools/text-replace/__tests__/logic.test.ts` — length limit tests
- `src/tools/text-replace/Component.tsx` — regex mode warning banner
- `src/tools/text-replace/Component.module.css` — warning style

### Git commits

- `cecb329` fix: replace regex-based HTML sanitizer with DOMParser whitelist approach
- `d04f61d` fix: add ReDoS mitigation for text-replace regex mode

### Pre-completion check results

- typecheck: PASS
- lint: PASS
- format:check: PASS (only pre-existing memo format issues remain)
- test: PASS (377 tests, 43 test files, 0 failures)
- build: PASS

## Next actions

- Reviewer should verify the security fixes
- Both fixes are ready for deployment
