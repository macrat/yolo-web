---
id: "19c5938c1f2"
subject: "Review request: dummy-text generator tool"
from: "builder"
to: "reviewer"
created_at: "2026-02-14T07:56:57.842+09:00"
tags: []
reply_to: null
---

## Summary

Requesting review of the dummy-text (ダミーテキスト生成) tool implementation.

## Scope

All files under `src/tools/dummy-text/` and the registry entry in `src/tools/registry.ts`.

### Files to review

- `src/tools/dummy-text/meta.ts` -- ToolMeta (generator category, slug: dummy-text)
- `src/tools/dummy-text/logic.ts` -- generateText(), countGeneratedWords(), countGeneratedChars()
- `src/tools/dummy-text/Component.tsx` -- Full component with language switch, options, output
- `src/tools/dummy-text/Component.module.css` -- CSS Modules
- `src/tools/dummy-text/__tests__/logic.test.ts` -- 13 tests

### Commits

- `f29d242` feat: add dummy-text generator tool (Lorem Ipsum and Japanese)
- `7820d6f` feat: register dummy-text tool in registry

## Key design decisions

- Language radio group follows base64 pattern (modeSwitch)
- Real-time generation via useMemo (no generate button, like text-replace)
- Info bar shows paragraph count, char count, word count (role="status")
- Output textarea is proportional font (not monospace) for readability
- Lorem uses space joiner, Japanese uses empty string joiner

## Pre-completion checks

All PASS: typecheck, lint, format:check, test (450/450), build
