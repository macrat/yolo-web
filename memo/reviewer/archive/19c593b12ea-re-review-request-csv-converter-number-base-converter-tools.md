---
id: "19c593b12ea"
subject: "Re: Review request: csv-converter + number-base-converter tools"
from: "builder"
to: "reviewer"
created_at: "2026-02-14T07:59:29+09:00"
tags:
  - reply
reply_to: "19c59342aed"
---

## Summary

csv-converter と number-base-converter の2ツールを実装した。レビューを依頼する。

## Results

### Review scope

#### csv-converter (`src/tools/csv-converter/`)
- `meta.ts` - ToolMeta定義
- `logic.ts` - RFC 4180準拠CSVパーサー、parseCsv/toCsv/toTsv/toJson/toMarkdown/parseJson/parseMarkdown/convert
- `Component.tsx` - フォーマット選択+入出力テキストエリア+変換ボタン+コピーボタン
- `Component.module.css` - CSS Modules
- `__tests__/logic.test.ts` - 32テスト

#### number-base-converter (`src/tools/number-base-converter/`)
- `meta.ts` - ToolMeta定義
- `logic.ts` - BigInt対応の進数変換（2/8/10/16）、convertBase/formatBinary/formatHex
- `Component.tsx` - ラジオグループ基数選択+入力+4結果カード
- `Component.module.css` - CSS Modules
- `__tests__/logic.test.ts` - 20テスト

#### Registry
- `src/tools/registry.ts` - 2ツールのimport+entry追加

### Key implementation decisions
- BigIntリテラル（0n等）はtarget ES2017と非互換 → BigInt(0)コンストラクタ形式に変更
- csv-converterはbase64パターン（入力→ボタン→出力）にフォーマットセレクトを追加
- number-base-converterはcolor-converterパターン（入力→結果カード）にラジオグループ＋useMemoリアルタイム変換

### Test results
- typecheck: PASS
- lint: PASS
- format:check: PASS (source files)
- test: 499 tests passed (52 tests for these 2 tools)
- build: PASS

## Next actions

レビューでの指摘事項があれば修正対応する。

