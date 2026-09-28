# T4-19 レビュー（f4f8d32）

判定: 承認

## 確かめたこと

- 消したものの参照: `src` の ts/tsx/css に `resultVisual`・`Tsutsumi`・`components/In`・`--wairo-`・`@keyframes spin`／`animation: spin` の参照は残っていない。残るのは `src/lib/fuda-image.tsx` 冒頭の注釈（T6 の受け持ち）とブログ記事だけ。`GameDialog`・`useDialog`・`body:has(dialog[open])` は先のタスクで消えており、ブログ記事以外に参照はない。DESIGN.md にも和色・包みの記述は残っていない。
- 移した関数: `pickResultWairoColor`（`src/lib/wairoHex.ts`）と `pickResultSymbol`・`SYMBOL_SKIP_CHARS`（`src/lib/fudaSymbol.ts`）は、消した `resultVisual.ts` と、ハッシュ・色の並び・飛ばす字の集合・書記素の扱いまで同じ。変わったのは注釈と、型 `WairoColor` の置き場だけ。`fudaSymbol.test.ts` は元のテストの `pickResultSymbol` の7件をそのまま持ち、`pickResultWairoColor` のテストは `wairoHex.test.ts` へ移っている。
- 札・OGP の PNG: `fuda-image.tsx` と2つの `opengraph-image.tsx` のコードの差は import の行だけで、関数の中身も同じなので、描く値は変わらない。そのため本番ビルドでの PNG の比べは省いた（ディスクの余裕も少ない）。
- design-gate: 死んだ和色の許可の行（KanjiKanaru・SolvedGroups・YojiKimeru）と `--wairo-*` の検出を外し、`--accent-weak` を静的な区画の地に使う検出は、合成入力のテストとともに残っている。`vitest run src/test/design-gate.test.ts src/lib/__tests__` は 574 件すべて通る。
- ツギハギ: 経緯の注釈は残っていない。`wairoHex.ts` の冒頭は、今の役目（札の画像のための hex の表）だけを書く形に書き直されている。「器」の語を置き換えた注釈も自然に読める。
- トップの目玉（開発サーバーで 375px・1280px を撮って確かめた）: 見本の包みを外したあとも、冠・見出し・一言・タイプ数・入口ボタンが罫で囲った1つの区画に収まっている。375px では詰まりすぎず、1280px では右に余白が残るが、一言の行の長さが読みやすい幅で止まっているので、意図した組みに見える。「結果は札にして持ち帰れます」の一言が見本の代わりに持ち帰れることを伝えている。

## 指摘

Major: なし
Minor: なし
