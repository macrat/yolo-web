# T5-3b のレビュー（16a25412）

判定: **改善指示**

対象: 16a25412「T5-3b: one phrase-break mechanism outside headings; shared dash function; control names break by phrase」

見た資料: t5-design.md（10-2 の T5-3b の行、4-g・4-h・4-i、10 章の頭と 10-1）、DESIGN.md §4（コントロールの名前、`line-break: strict`）、frontend-design スキルの「見出しとコントロールの名前の折り方を測る」と「実装の技術」、CLAUDE.md（ツギハギ禁止）、index.md「補足事項」末尾の T5-3b の PM の決定 (1)〜(4)、アンチパターン集（implementation・workflow）。

## 確かめたこと

- HEAD を scratchpad に書き出して（`r53b-head`、生成物の `release-id.ts` だけ写した）、`vitest run src/components src/lib/__tests__/phrase-dashes.test.ts` が 45 ファイル・397 件すべて通る。`tsc --noEmit` はエラー 0。変えた 19 ファイルは eslint のエラー 0、prettier の差分 0。
- `<wbr>` を組む所: 親のコミットと HEAD で `git grep "<wbr"` を比べ、増えていない（受け入れの条件を満たす）。ダッシュを前の語に付ける組み方は `src/lib/phrase-dashes.ts` の `joinDashes` の1つだけで、`PhrasedText` はそれを使い、`PhrasedText` の中の元の実装は消えている。2つ目の仕組みは無い。
- 設計の行の中身: `PhrasedText` が `span`・`p`・`th`・`td` でも組め、`Accordion` の `summary`・`Field`・`RadioGroup`（見出しと選択肢）・`Checkbox`・`Slider`・`ListControls`・`FileDropZone` が区切りの並びを受け取る。どれも文字列を渡す使う側を変えずに済み（`tsc` が通る）、storybook も触っていない。`Field` の「（必須）」は名前の後ろの1つの文節になる。`FileDropZone` の括弧の案内は、面の字の下の補助情報の行へ出た。
- `Field` の型: `{ label: PhrasedName; required?: boolean } | { label: ReactNode; required?: false }` で、必須のときに要素の名前を渡すことを型で禁じている。「（必須）」を文節として足すには名前の字が要るので、筋が通る。
- 読み上げ: `Slider` の知らせと字の幅の見積もり、`ListControls`・`Slider` の `key` は `phrasedNameText` で元の文を使う。`FileDropZone` の `aria-describedby` は面の字・案内・補助情報・エラーの順で、前と同じ字を読む（括弧が消えただけ）。入力の名前は `aria-labelledby` で見えるラベルのまま。Chromium が `<wbr>` ごとに名前へ空白を足す件は PM の決定 (4) のとおりで、名前に見える語は保たれる（WCAG 2.5.3 に反しない）。
- builder の実測（`t53b-measure-before/after.json` を前後で並べ直した）: age-calculator の「生年月日（必須）」は 200% の 320px で「生年月日（必/須）」（語の中 1・括弧の中 1）→「生年月日／（必須）」（0・0）。image-base64・image-resizer の面の字は、既定の 320px で「ファイルを選ぶ（ここにファ／イルを…）」（語の中 1・括弧の中 1）→「ファイルを選ぶ」1行と案内「ここにファイルを落としても／選べます」（0・0）、200% の 320px で語の中 4・括弧の中 3・禁則 1 → すべて 0。受け入れの条件を満たす。補助情報の行（「PNG, JPEG, GIF, WebP 対応（最大／10MB）」）の折れは PM の決定 (2) で T5-18 に回っている。
- スクリーンショット（`t53b-shot-*`）: 既定の 320px で、面の字「ファイルを選ぶ」が1行になり、案内と補助情報が `--ink-2` の小さい字で続く。欠け・はみ出しは無い。200% の age-calculator で「（必須）」が次の行に文節ごと送られている。
- テスト: 部品ごとに `<wbr>` の位置・文節で折るクラス・読み上げの名前（元の文）を確かめ、手で書いた並びを `followsPhraseRules` に通している。`joinDashes` の単体テストは「—」「──」「--」・空白の無いダッシュ・文の頭・続く空白・字を消さないことを押さえる。意味のあるテストになっている。

## 指摘

### 1. 文字列で渡したコントロールの名前が `line-break: strict` にならない（§4 とスキルの測り方に反する）【builder】

`renderPhrasedName` は文字列をそのまま返すので、文字列で渡した名前（`Field` の必須でない名前・`FileDropZone` の「画像ファイル」・`RadioGroup` の「変換の向き」と選択肢・`Checkbox` など）は、`keep-all` も `line-break: strict` も持たない。builder の実測でも、image-base64 の「画像ファイル」「変換の向き」「画像 → Base64」は `lineBreak: "auto"` だった。

- DESIGN.md §4 は「見出しとコントロールの名前は、行頭の禁則を厳しい側で組む（`line-break: strict`）」とし、スキルの「見出しとコントロールの名前の折り方を測る」の1は、コントロールの名前で `line-break` が `strict` であることを確かめる手順になっている。いまのままだと、この手順で文字列の名前がどれも落ちる。
- PM の決定 (1) で `strict` を `PhrasedText` だけが持つ（T5-25c は `globals.css` で掛けない）ことになったので、文字列の名前に `strict` を掛ける所がどこにも無くなった。4-g が「区切りは文字列1つでも受け取れるようにする（1文節のラベルは区切りが要らない）」としたのは区切り（`<wbr>`）の話で、禁則を外してよいという意味ではない。
- 来訪者の損: 文字列の名前が1行に収まらないとき（200% の狭い画面）、通常の禁則で折れ、小書きの仮名や長音符が行の頭に来うる（前の実測で「ここにファ／イル」が出ていたのと同じ折れ方）。
- `ChoiceRow` の `.label` は文字列の名前をいまも `word-break: auto-phrase`（Chromium だけで効く）で折っていて、スキルの「実装の技術」7 の「auto-phrase に頼らない」とも食い違う。区切りの並びを渡した名前だけが `PhrasedText` で、文字列の名前は `auto-phrase` という、同じ部品の名前に2通りの折り方が残っている。

直し方の向き: 文字列の名前も、区切りの無い1つの文節として同じ `PhrasedText` の `span` で組む（`<wbr>` は増えず、`keep-all`・`overflow-wrap: anywhere`・`line-break: strict` が掛かる。1文節の名前なら見え方は変わらず、禁則だけが厳しくなる）。そのうえで `ChoiceRow` の `auto-phrase` が要るかを見直す（要素を名前に渡す使う側が残るかを確かめる）。`PhrasedName` の説明と `renderPhrasedName` の説明・テストも合わせて直す。直したあと、同じ3ページで `lineBreak` と折れを測り直す。

### 2. `src/lib/phrase-dashes.ts` と試験に、見えない字がそのまま書かれている【builder】

`NO_BREAK_SPACE = " "`（U+00A0 の生の字）・`WORD_JOINER = "⁠"`（U+2060 の生の字）と、試験の `NBSP`・`WJ` が、エスケープでなく字そのもので書かれている（`od -c` で `302 240`・`342 201 240` を確かめた）。切り出す前の `PhrasedText` と、いまの `PhrasedText` の試験は `" "`・`"⁠"` で書いている。生の字は画面で見分けられず、読む人にも差分のレビューにも、普通の空白や空の文字列と区別がつかない。`" "`・`"⁠"` に戻す。

### 3. `phrase-dashes.ts` の説明が、まだ無い使い手を今のことのように書いている【builder】

「区切りを組む PhrasedText と、Markdown の見出しを HTML の文字列で組む所の両方が使う」とあるが、HEAD で `joinDashes` を使うのは `PhrasedText` だけで、`src/lib/markdown.ts` はまだ使っていない（T5-16 で使う）。ファイルは今の状態だけを書く（CLAUDE.md のツギハギ禁止）。「サーバーでもブラウザでも動く」の理由付けは残してよいが、使い手の列挙は今の使い手に合わせ、markdown.ts の分は T5-16 が使うときに書く。

### 4. `PhrasedTag` の `p` に使い手が無い【builder】

足した要素のうち、`span` は今回の部品が、`th`・`td` は T5-8 が使う予定だが、`p` はどの部品にも設計のどのタスクにも使い手が無い。使う所が出るまで足さない（出たときにそのタスクが足す）。説明の「見出しの外で文節で折るもの（コントロールの名前・リンク・表のセル）」にも `p` に当たるものが無い。

### 5. ボタンの面の字に §4 の折り方を当てるタスクが無くなっている【PM・計画】

§4 は「コントロールの名前（ボタンの面の字と、…）は見出しと同じ規則で折る」とするが、`Button` の面の字はいま `word-break: auto-phrase` で、`line-break` は `auto`（builder の実測でも age-calculator の「今日に設定」「計算」が `auto-phrase`・`auto`）。t5-design の T5-25c の行は「見出しとコントロールの名前に `line-break: strict` を掛ける」だったが、PM の決定 (1) でそれを `globals.css` でやらないことになり、ボタンの面の字に `keep-all`・`strict`（と区切りの並び）を当てるタスクがどこにも無くなった。T5-3b の行の範囲外なので builder の直しではなく、PM がどのタスクで扱うか（`Button` が区切りの並びを受け取るか、文字列の面の字を1文節の `PhrasedText` で組むか。指摘 1 の直し方と揃えるのがよい）を決めて t5-design に書く。あわせて、T5-25c の行の「見出しとコントロールの名前に `line-break: strict` を掛ける」は決定 (1) と食い違ったまま残っているので、T5-25c の builder が行だけを読んで重ねて掛けないよう、行を直す。

## 気づいたが指摘にしないこと

- `line-break: strict` を `PhrasedText` に足したので、見出しすべてに掛かる（AP-I14 の共有の部品の変更）。ただ `keep-all` の下では和字どうしのあいだが折り所にならず、文節の中の折れは `overflow-wrap: anywhere` が作るので、`strict` が効くのは空白と一部の約物の前後だけで、見出しの見え方はほぼ変わらない。全ページの撮り比べは T5-26 の取り直しで足りると判断した。
- `FileDropZone` の案内（文節で折る）と補助情報（通常の禁則）が同じ見た目の2行で続き、折り方がそろわない。補助情報の行は PM の決定 (2) で T5-18 が直す。
- `Accordion`・`RadioGroup`・`Checkbox` の型 `ReactNode | readonly string[]` は、`readonly string[]` が `ReactNode` に含まれるので型としては `ReactNode` と同じだが、区切りの並びを受けることを読み手に示すので、そのままでよい。

## PM への依頼

1. 指摘 1〜4 を builder に直させる。指摘 5 は PM が計画（t5-design）を直し、planner にさせる場合はそのレビューも受ける。
2. 直したあと、もう一度レビューを依頼する。そのときは今回の指摘だけでなく、コミット全体を見直させる。
