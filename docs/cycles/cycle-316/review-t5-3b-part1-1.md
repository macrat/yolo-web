# T5-3b PART 1（数え方の関数・check:phrased-names・frontend-design スキル）の第1回レビュー（011ec106）

判定: **改善指示**

対象: 011ec106 の `src/test/unphrased-names.ts`・`src/test/__tests__/unphrased-names.test.ts`・`src/test/check-phrased-names.test.ts`・`package.json` の scripts・`.claude/skills/frontend-design/SKILL.md`。照らした計画は t5-design.md の 4-g（「2文節以上を拾う数え方」と見る位置・2つの分け方）と 10-2 の T5-3b の行、10章の頭の「名前と面の区切りの規則」（review-t5-3b-plan-8.md で承認）。

## 確かめたこと

HEAD（e4329da4。011ec106 との差は docs の2ファイルだけ）を scratchpad に書き出し、`node_modules` が無いことを確かめてから `cp -al` して走らせた。

- **全体の vitest**: `npx vitest run` で 391 ファイルのうち 384 が通り、2 が飛び（`check-phrased-names.test.ts` を含む）、5 が落ちた。5つはどれも `@/lib/generated/release-id` が無いことによるもので（`npm test` なら `pretest` が作る生成物。`npx` で直に走らせたため）、`npm run generate:release-id` のあとにその5ファイルを走らせると 68 件がすべて通った。合わせて全ファイルが通り、`CHECK_PHRASED_NAMES` の無いふだんの走りでは数え方が何も数えずに飛ぶことも確かめた。`npx tsc --noEmit` は0件、変更した3つの `.ts` の `eslint` と5ファイルの `prettier --check` も通る。
- **`npm run check:phrased-names` を実際に**: `PHRASED_NAMES_PATHS=src/tools/base64` で、字で渡すもの2（`RadioGroup` の `legend`「変換の向き」、`Checkbox` の `label`「URL-safe形式で出力」）と値で渡すもの1（`Field` の `label` の `text.inputLabel`）を出し、終わりのコードは 1。`PHRASED_NAMES_REPORT_ONLY=1` を足すと同じ出力で 0。出力は「数えたパス」「字で渡すもの（直すもの）: N」「値で渡すもの（…測るもの）: N」「字で渡した名前と面: N」の見出しの下に `パス:行:字  位置  「字か式」  理由` が1行ずつ並び、受け持ちのタスクが記録に写し、始めと終わりをファイルと字で突き合わせるのに使える。失敗のときは vitest のアサーションの差分にも同じ行が出る。
- **`src/` の全体**: 字で渡すもの 119、値で渡すもの 55、字で渡した名前と面 295（計画の 293・116・53 に近い）。字で渡すもの 119 件をすべて読み、誤検知は無かった（どれも 4-g の見る位置の、2文節以上のコードに書いた字）。三項の枝（html-entity の `label` の2件）、同じファイルの `const` の選択肢（fullwidth-converter・image-resizer・line-break-remover の `options`）、素の `legend`（storybook）も拾えている。
- **見落としの抜き取り**: `src/` の素の `<legend>`・`<summary>` をすべて grep し、部品の中の受け渡し（`RadioGroup`・`Accordion`）のほかは storybook の3つと regex-tester の「フラグ」で、どれも数えられている（1文節のものは返さない）。`Slider` の `items`（irodori の `HslSliders`。関数の中の `const` の並び）も解いて見ている。`showTarget` を持つ `CopyButton` は、`targetPhrases` を渡した business-email を返さず、storybook の `target="メール全文"` を返す。値で渡すもの 55 件もすべて読んだ（下の指摘1のほかは 4-g の分け方どおり）。
- **単体テスト**: T5-3b の行が挙げる見る位置のそれぞれ、1文節・区切りの並び・受け取らない部品の `label`・部品の中の受け渡し・禁則を満たさない並び・値で渡すものの各種が、どれも試されている。
- **スキル**: 「実装の技術」の折り所の作り方は、データの文は `splitIntoPhrases` がサーバーで分け、コードの文は書き手が同じ決め方で並びを書く、と読める形になった。区切りの渡し方・`check:phrased-names` の2つの分け方・走らせ方・`followsPhraseRules` の試験が書かれ、「機械で確かめる」の表にも1行ある。経緯の痕跡（「以前は」「T5-3b で」など）は無い。

## 指摘

### 1. 同じファイルに書いた字を、変数の鍵で引くと「値」に落ちる（直す）

`resolveLocalValue` は `OBJ.key` と `ARR[0]` は解くが、`OBJ[変数]` と `useMemo` が返すオブジェクトを解かない。そのため、同じファイルに書いた決まった字が「字で渡すもの」に入らず、理由「値」の値で渡すものになる。HEAD の実例:

- `src/tools/base64/Base64Tile.tsx:178` の `label={text.inputLabel}`（`const text = DIRECTION_TEXT[direction]`。同じファイルの「エンコードするテキスト」「デコードするBase64」）
- `src/tools/fullwidth-converter/FullwidthConverterTile.tsx:167` の `label={OPTION_LABELS[key]}`（同じファイルの「記号・スペース」など）
- `src/tools/percent-calculator/PercentCalculatorTile.tsx:148`・`:163` の `{modeConfig.labelA}`・`{modeConfig.labelB}`（`useMemo` が返す同じファイルの「もとの値 X」「変化前 A」など）

4-g はコードに書いた決まった文を書き手が並びで書くものとし、値で渡すものを「ほかのモジュールの定数やデータ、`.map`、差し込み、字と式を含む要素、広げた props、サーバーで区切る文」と挙げる。同じファイルの `const` の字はこのどれでもなく、関数自身も `OBJ.key` なら字として見ている。鍵が変数になるだけで (a) の数から外れると、受け持ちのタスク（T5-18）は「エンコードするテキスト」を文字列のまま残しても (a) が0になり、(b) の測りでしか止まらない。

直し方: 鍵が字でない `ElementAccessExpression` の相手が同じファイルの `const` のオブジェクトか並びなら、そのすべての値（要素）を枝として見る（`Record` の値のどれもが名前になりうるので）。`useMemo` の最初の引数の関数が返す式も枝として見る（`returnedExpressions` がすでにある）。単体テストに両方を足し、`src/` を数え直す。

### 2. 理由「値」が何を測るかを言わない（直す）

値で渡すもの 55 件のうち 12 件の理由が「値」で、4-g の分け方のどれかを言わない。指摘1の3つのほかは、`.map` で作った同じファイルの並び（kanji-kanaru・yoji-kimeru の `DIFFICULTY_OPTIONS`、`HARMONY_RADIO_OPTIONS`、unit-converter・business-email の `categoryOptions`。`valueReason` に渡すのが名前で、解いた初期化子でないため「並びを .map して渡すもの」にならない）と、区切りを受け取らない部品の props（`PaginationButtons` の `label`、`DisclosureRow` の `name`・`description`）である。受け持ちのタスクは、出力の理由を見て、どの状態を開いて測るか、どこで並びを渡すかを決めるので、`valueReason` を解いた先の式で決め、部品の props は「区切りを受け取らない部品の props」と出す。

### 3. スキルの BudouX の例が、書いた1〜5では外れない（直す）

「実装の技術」の頭は「BudouX は語を割ることがある（「ひらが|な → カタカナ」）ので、書き手は……1〜5 の足し引きに照らして決める」と書くが、1〜5 のうち BudouX の境目を外すのは「中点で並べた平仮名の語の中」（1）と「漢字か片仮名を含む語の中」（5）だけで、矢印の前の平仮名だけの語「ひらがな」の中の境目はどちらにも当たらない。数え方の出力も理由に「2文節以上（ひらが／な／ → カタカナ）」と BudouX の分け方を出すので（storybook・kana-converter の3件）、次の作り手がこれを写しても1〜5に反しないと読める。§4 の規則の芯（語の中で折らない）を1〜5の前に1文で置くか、例を1〜5で外れるものにするかして、書き手が「語の中の境目は外す」と読めるようにする。あわせて、出力の理由の括弧は「splitIntoPhrases の分け方」であって書くべき並びではないと分かる言い方にする（例: `2文節以上（splitIntoPhrases: …）`）。

### 4. `.tsx` の無いパスを渡すと、黙って0件で通る（直す）

`collectFiles` はファイルを直に渡したとき `.tsx` でなければ空を返し、何も言わない。受け持ちのタスクが `src/lib/share-labels.ts` のような `.ts` を渡したり、`.tsx` の無いディレクトリを渡したりすると、「字で渡すもの: 0」で通り、そのまま (a) の記録になる。出力に数えたファイルの数を出し、渡したパスのどれかから `.tsx` が1つも出なければ失敗させる（`REPORT_ONLY` でも知らせる）。

### 5. スキルの「名前の props」に `Slider` が入っている（直す）

「`Field`・`Checkbox`・`Radio`・`RadioGroup`・`Slider`・…の名前の props（`PhrasedName`）」とあるが、`Slider` の名前は props でなく `items` の要素の `label` で、`RadioGroup` の選択肢の `label` も同じ形である。書き手が `<Slider label=…>` を探さないよう、「`RadioGroup` の `options` と `Slider` の `items` の要素の `label`」を選択肢の並びとして分けて書く。

## 指摘にしないが、T5-3b の完了までに要ること

- 4-g の「B を当てる数」は「T5-3b が関数を作ったときの数を記録し直す」としているので、指摘1・2を直したあとの数え直しの値（字で渡すもの・値で渡す所と、受け持ちごとの内訳）で 4-g の数と内訳を書き直す。いまの差（字 116 → 119、値 53 → 55。`SeriesNav`・`DisclosureRow`・`WordGrid` が要素ごと・props ごとに2件になるなど）は数え方の細かさで、関数の出力のほうに合わせればよい。
- スキルは `Button` の `phrases` と `Checkbox`・`Radio`・`Accordion`・`GuessInput` の `PhrasedName` を前提に書かれているが、HEAD の `Button` にまだ `phrases` は無い。PART 2 でそろうので、T5-3b の完了のレビューでスキルとコードが合っていることを確かめる。
- `npm run check:phrased-names -- <パス>` と位置引数を足すと、vitest はそれを試験のファイルの絞り込みに使い、数えるのは既定の `src` になる。スキルに環境変数で渡すと書いてあるので足りるが、指摘4で数えたファイルの数を出せば取り違えにも気づける。

## PM への依頼

指摘が5つあるので、builder に直させ、直したあとにもう一度レビューを依頼してください。そのときは、この指摘だけでなく PART 1 の全体（数え方の関数・単体テスト・`check:phrased-names`・スキル）を見直す対象にしてください。
