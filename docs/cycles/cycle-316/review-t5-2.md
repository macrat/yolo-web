# T5-2 レビュー（ページの頭の位置: 最初のセクションの上の余白を 16 / 24 に）

- 対象: c7bcdd3「T5-2: first section starts 16/24px below the top rule」（`src/components/Section/Section.module.css`・`src/components/Section/__tests__/Section.test.tsx`）
- 照合: t5-design.md の T5-2 の行と 4章の案 C（頭の余白を 24 / 16 にそろえる）、DESIGN.md §5「ページの割り方」（T5-1 で確定した段落）、CLAUDE.md のツギハギ禁止、docs/anti-patterns/implementation.md・workflow.md

## 判定: 承認

## 確かめたこと

### CSS

- `.section` の上の余白を `--section-start-space`（16px、`45rem` 以上で 24px）、下の余白を `--section-space`（32 / 48）に分けた。`.section + .section` は上の余白 0 のままで、罫線の下の余白は `::before` の `margin-block-end: var(--section-space)` が持つ。セクションのあいだは「前のセクションの下 32/48 + 罫線 + 32/48」で、DESIGN.md §5 の「罫線の上下にそれぞれ 32px（45rem 以上で 48px）」と一致する。変わったのは最初のセクションの上だけ。
- トークンは `--space-16/24/32/48` がそれぞれ 16/24/32/48px（globals.css）。
- 先頭のコメントは今の形だけを述べ、経緯や以前の値の痕跡がない（ツギハギなし）。DESIGN.md §5 の段落と同じことを言っている。
- `Section` を使うのは `ListPage`（一覧のページ）と storybook（`StorybookContent.tsx`・`ListSampleView.tsx`）だけで、上の余白を前提に打ち消す自前の余白を持つ所はない（`ListPage.module.css` は `gap` だけ）。

### 試験

- 追加した試験は、狭い画面と `(min-width: 45rem)` の中の宣言を分けて読み、16/24・32/48・2つ目からの上 0 を確かめる。`declarationsOf` に media の引数を足した形は、既存の呼び出し（@media の外のルール）の意味を変えない。
- scratchpad の t52-after のコピーで `vitest run src/components/Section` を実行し 4/4 通過（共有の木ではビルドも試験もしていない）。

### 測り（t52-measure-before/after.json）

- 9ページ（一覧8つと `/blog/category/dev-notes`）× 6表示のすべてで、パンくずの上端 − 上端の下端が 375px 以下で 16、1280px で 24。375px は 95→79、1280px は 111→87、320px は 139→123（上端が2行で 107）。報告の数値と一致し、T5-2 の完了の条件（16 / 24、上端が1行の幅で 79 / 87）を満たす。
- 字の大きさ 200%（既定の字 32px）では `45rem` = 1440px を超えないため 1280px でも 16（113.89→97.89）。rem の区切りどおりの振る舞いで、DESIGN.md §5 と食い違わない。
- T3 の一覧の最初の画面の条件: ブログの一覧・分類・タグの最初の行（題名の1行目・行の下端）は、どの表示でも 16 または 24 だけ上がった（例 `/blog` 375: 634.78→618.78、1280: 698.78→674.78）。悪くなった所はない。はみ出しは前後とも 0、横スクロールも前後とも無し。

### 見た目（来訪者の目で）

- builder の撮影から、`/blog` 375（前後）、`/tools` 1280（前後）、`/dictionary/yoji/category/society` 375 の 200%、`/play` 375 ダーク、`/blog/tag/オンラインツール` 320、`/dictionary/kanji` 1280 の 200% を見た。上端の罫線とパンくずのあいだが詰まり、見出しと一覧が上に寄って、最初の画面に入る中身が増えた。罫線にパンくずが貼り付いて見えることはなく、パンくずと h1 の関係も変わらない。ダーク・200% でも崩れはない。
- builder の撮影には storybook が無かったため、t52-before/after のビルドを別のポートで起こし、`/storybook` と `/storybook/list/11` を 375・1280・375 ダークで撮って測った。h1 の上端は 95→79（375）、111→87（1280）で、一覧のページと同じ位置になった。2つ目のセクションの罫線の上下の余白も変わらない。storybook の古い形（字形・枠など）は T5-24 の範囲で、この変更によるものではない。

## 指摘事項

なし。

（参考・対応不要）builder の撮影の組に storybook が含まれていなかった。`Section` を使う面を撮影の組にすべて入れておくと、同じ部品を触る次のタスクで確かめ漏れが起きにくい。今回はレビューで補って確かめ、問題はなかった。
