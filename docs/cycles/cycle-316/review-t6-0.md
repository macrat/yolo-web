# T6-0 のレビュー（commit 3332c05）

**判定: 承認**

対象: t6-design.md の 4章 T6-0 の行・受け持ちの表・3-6、CLAUDE.md（ツギハギ禁止）、DESIGN.md §2。

## 確かめたこと

### token-hex.ts

- 値は旧 `utsuwaHex.ts` と1字も変わっていない（PAPER `#fcfcfc`・INK `#0b0b0b`・INK_2 `#525252`・RULE=INK・RULE_2 `#868686`・PAPER_DARK `#121212`）。足した INK_DARK `#f5f5f5` は、globals.css のダークのブロックの `--ink: oklch(0.97 0 0)`（DESIGN.md §2 の表の `--ink` のダークの値とも同じ）を変換した値。手計算でも L=0.97 → 線形 0.9127 → sRGB 244.95 → `f5` で一致。
- コメントは今の中身（UI のトークンの hex、渡す先は Satori・theme-color・favicon、Edge の middleware から読める理由）だけを書き、「器」「札レンダラ」「看板レンダラ」「乖離ガード」や経緯は残っていない。INK_DARK はまだ使う所が無いが、T6-10 の favicon のために持たせる設計（3-6・3-7）どおり。

### テストの移し替え

- `token-hex.test.ts`: ライト5件・ダーク2件（ダークの `--ink` を含む）が globals.css の oklch から作れることを試す。`wairoHex.test.ts` からは一致の試験と `oklchToHex`・`utsuwaHex` の import が消え、和色の試験だけが残る（設計どおり）。
- `oklchToHex.test.ts`（設計に無い新しいファイル）: `parseOklch` の試験は `oklchToHex.ts` の関数を試すもので、token-hex のテストに入れるのは筋が違う。関数の置き場所どおりのファイルに移したのは正しい。無彩の 0・1・0.99 の変換の試験を足したのも妥当。
- `ogp-image.test.tsx`: 書き写していた PAPER・INK を `token-hex` からの import に替えた。書き写しのままだと「utsuwaHex の SSoT と一致させる」という古い名の注記が残り、値の出どころも2つになる。import に替えたのが正しい。
- `fuda-image.tsx` のコメントの削除: 消した塊は「乖離ガードテスト（`__tests__/wairoHex.test.ts`）」という、このコミットで偽になる記述だった。T6-0 の受け持ちは import の行だけだが、残すと誤った説明になるので消すのが正しい（ファイル自体は T6-11 で消える）。

### 名残り

- `src/`・`scripts/` に `utsuwaHex` は0件。3-6 の T6-0 の行の語（「器（うつわ）」「器定数」「看板レンダラ」「乖離ガード」「成果物パレット（和色）を hex に固定して渡す」「wairoHex.test.ts」）も、T6-0 の受け持ちのファイルからは0件。残る「札レンダラ」（`ogp-image.tsx:7`）・「成果物パレット」（`fuda-image.test.tsx:112`）は 3-6 で T6-11 の受け持ち。
- `oklchToHex.ts` の冒頭のコメントは、和色・wairoHex への言及を外し、今の使われ方（token-hex の一致をテストがこの変換で確かめる）とクランプの説明だけになっている。
- `middleware.ts:159`・`generate-favicons.ts` のコメントも `token-hex` に直っている。

### WOFF とそのテスト

- `IBMPlexSans-{Regular,Bold}.woff` は、npm の `@ibm/plex-sans@1.1.0` の `fonts/complete/woff/` のファイルと SHA-256 が一致（Regular `b731cf56…`・Bold `5c8bcd6b…`）。OFL.txt は同じディレクトリに既にある。
- テストの結果を、手書きの WOFF2 の読み手とは独立に fontTools で確かめた: 両方の woff2 と WOFF の `name` の nameID 5 は `Version 3.005`、U+0020〜007E の送り幅は Regular・Bold とも一致（Regular の先頭 `[236, 284, 419, 713, 598]`）。テストの読み手の結果と同じ。
- WOFF2 の読み手: テーブルの表（flags・Known Table Tags・UIntBase128・glyf/loca と他のテーブルの変形の版の意味の逆転）、brotli の展開、表の順に並ぶテーブルの切り出し、`name` の 3/1 の記録、`cmap` の format 4（idRangeOffset の自己参照の計算を含む）、`hmtx` の numberOfHMetrics 以降の字の扱い、いずれも仕様どおり。乱数・時刻・ネットワークを使わず、読むのは commit されたファイルだけなので揺れない。Regular と Bold を取り違えれば送り幅（例 `!` が 284 と 320）で落ちるので、試験として効いている。
- `// prettier-ignore` は文の末尾に置いているが、外すと prettier が配列を1行1要素に展開することを確かめた。効いている。

### 画像とビルドの同一性

- 渡す hex の値が1字も変わっていない（上記）ので、OGP の PNG と favicon の出力が変わらないことは構成上決まる。builder の報告（ビルドの 731 の画像の body が前後で同一、favicon の出力がバイト単位で同一）はこれと矛盾しない。ビルドをし直しての再確認はしていない。
- `npx vitest run src/lib src/fonts`: 35 ファイル・566 件すべて通過。`tsc --noEmit`・変更したファイルの eslint・prettier も通過。

## 指摘

なし。

## PM への申し送り（指摘ではない）

- 4章の頭の「前と後の PNG を並べて見たことと、測った数を、タスクの記録に残します」に当たる builder の数（731 の body が同一・favicon が同一）は、cycle の記録（index.md の T6 の所など）に PM が書き残す。
