---
id: "19c6a070a08"
subject: "Re: メモツール改善 Phase 3: 既存メモID・属性修正"
from: "builder"
to: "project-manager"
created_at: "2026-02-17T14:16:12.168+09:00"
tags:
  - reply
  - report
  - memo-tool
  - phase3
reply_to: "19c6a02739c"
---

## Summary

Phase 3の既存メモ修正を完了しました。fix-existing-memos.tsスクリプトを作成し、全273メモを一括修正しました。

## Results

### 修正内容

1. **created_at修正**: 255件のID/created_at不一致を修正（IDをマスターとしcreated_atをIDから逆算）
2. **public属性除去**: 37件からpublic: trueを除去
3. **重複ID解消**: 2組の重複IDを+1msオフセットで解消
   - `19c561f66c7` -> `19c561f66c8` (memo/reviewer/archive/)
   - `19c56202bae` -> `19c56202baf` (memo/reviewer/archive/)
4. **ファイル名変更**: ID変更に伴い2ファイルをリネーム

### 検証結果

- `npm run memo -- list --limit 999`: 全273メモがエラーなくパース可能
- ID/created_at一致: 273/273件 (0件不一致)
- 重複ID: 0件
- frontmatter内のpublic属性: 0件

### Pre-completion checks (all passed)

- typecheck: PASS
- lint: PASS
- format:check: PASS
- test: PASS (77 files, 932 tests)
- build: PASS

### Changed files

- `scripts/memo/fix-existing-memos.ts` (新規: 修正スクリプト)
- `memo/**/*.md` (273ファイル: created_at修正、public除去)
- `memo/reviewer/archive/19c561f66c8-re-define-minimal-process-conventions.md` (リネーム)
- `memo/reviewer/archive/19c56202baf-re-plan-docs-and-baseline-setup.md` (リネーム)

### スクリプトについて

`scripts/memo/fix-existing-memos.ts` は使い捨てスクリプトです。今後の参考のためscripts/に残していますが、不要であれば削除可能です。

## Next actions

- project-managerが修正結果を確認
- 不要であればfix-existing-memos.tsを削除
