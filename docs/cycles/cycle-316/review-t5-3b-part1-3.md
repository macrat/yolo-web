# T5-3b PART 1（数え方の関数・check:phrased-names・frontend-design スキル）の第3回レビュー（092c42e2）

判定: **改善指示**

対象: 092c42e2 の `src/test/unphrased-names.ts`・`src/test/__tests__/unphrased-names.test.ts`・`.claude/skills/frontend-design/SKILL.md` と、PART 1 の全体（`src/test/check-phrased-names.test.ts`・`npm run check:phrased-names`・t5-design.md の 4-g の数）。前回（review-t5-3b-part1-2.md）の指摘1・2が直ったかと、PART 1 の全体を見た。

## 確かめたこと

作業の木には別のタスクの変更があるので、HEAD を `git archive` で scratchpad に書き出し、`node_modules` が無いことを確かめてから `cp -al` し、`npm run generate:release-id` のあとに走らせた。

- **試験と型**: `npx vitest run src/test` は 3 ファイルのうち 2 が通り 1 が飛ぶ（`check-phrased-names.test.ts`）。59 件が通り、落ちたものは無い。`npx tsc --noEmit` は0件。変えた `.ts` の `eslint` と、変えた3ファイルの `prettier --check` も通る。
- **`npm run check:phrased-names` を実際に**:
  - `src` の全体（`PHRASED_NAMES_REPORT_ONLY=1`）: 数えた `.tsx` 331、字で渡すもの 126、値で渡すもの 50、字で渡した名前と面 303。終わりのコードは 0。同じ木で1つ前のコミットの `unphrased-names.ts` に差し替えて走らせた出力と、時刻の行のほかは1字も違わない（HEAD の `src` では、今回の直しで出る所も消える所も無い）。
  - `PHRASED_NAMES_PATHS=src/tools/base64`: 字で渡すもの4、値で渡すもの0で、終わりのコードは 1。
  - `PHRASED_NAMES_PATHS=src/tools/percent-calculator,src/lib/share-labels.ts`: 頭に「数える .tsx が無いパス: src/lib/share-labels.ts」を出し、終わりのコードは 1。字で渡すもの 7。
  - `PHRASED_NAMES_PATHS=src/components/Button`: 数えた `.tsx` 1、どれも0で通る。
  - `PHRASED_NAMES_PATHS=src/app/storybook`: 数えた `.tsx` 5、字で渡すもの 19、値で渡すもの 3（4-g と T5-24 の行の数と合う）。
- **前回の指摘1**: 試しの `.tsx` を書き出しの中に置いて当てた（確かめたあと消した）。広げたオブジェクトの字の鍵（`CONFIG.label`）、広げたあとに同じ鍵を書いたもの、getter を持つオブジェクト、広げた要素を持つ並びの添字、外れた添字（`HOLES[3]`）、無い鍵（`LABELS.c`）、字を計算した鍵（`{ ["label"]: … }`）、何も返さない `useMemo`、広げた組（`kindGroup={{ ...G, legend: … }}`）、広げた選択肢（`{ ...O }`）は、どれも値で渡すものに出た。数の鍵（`NUM[1]`）と変数の鍵（`LABELS[k]`）は字まで解け、字で渡すものに出た。単体テストもある。直った。
- **前回の指摘2**: 書き出しの中で `splitIntoPhrases("ひらがな → カタカナ")` を走らせると `["ひらが","な"," → カタカナ"]` で、スキルの「ひらが|な| → カタカナ」と合い、語の中の境目を外した「ひらがな| → カタカナ」は手順の結果どおりになった。空白が `keep-all` でも折り所になること（`word-break: keep-all` は字と字のあいだの折りを止めるだけで、空白の折り所は残る）と、「ひらがな → |カタカナ」とも折れることも正しい。「半角|カナ」を外したのは、例を1つにしただけで、書いたことは減っていない。直った。
- **スキルの全体**: 経緯の痕跡は無い。「機械で確かめる」の表の行・「2文節以上の名前と面は、区切りの並びで渡す」・「`npm run check:phrased-names` で数える」が同じことを言い、`splitIntoPhrases` の実際の分け方（「エンコード・|デコード」「Base64|エンコード」「ひらがな・|カタカナ」）とも合う。

## 指摘

### 1. 広げた props が、名前の props のほかの見る位置（選択肢の並び・組・組の並び）を黙って数えから外す（直す）

`checkElement` は、見る props が JSX に無いとき、広げた props を「広げて渡す props」として出すのを名前の props の表だけで行う（`if (table === NAME_PROPS) recordSpread(position);`）。選択肢の並び（`RadioGroup` の `options`・`Slider` の `items`・`BrowsableList` の `sorts`）、組（`ListControls` の `kindGroup`・`sortGroup`、`BrowsableList` の `kindGroup`）、組の並び（`ListControls` の `filterGroups`）を広げた props で渡すと、どちらの出力にも出ない。

```tsx
// 値で渡すもの 2（どちらも `searchLabel`）。`RadioGroup` は何も出ない。
<BrowsableList {...LIST} />
<ListControls {...LIST} />
<RadioGroup legend="並べ替え" {...P} />
```

HEAD の `src` でも起きている。`src/app/storybook/list/ListSampleView.tsx` の `<BrowsableList {...sample.list} />` は `searchLabel` の1つだけが値で渡すものに出て、`samples.ts` の `kindGroup`（「カテゴリ」「学年」と選択肢の名前）と `sorts`（「読みの五十音順」「やさしい順」「画数順」）はどちらの出力にも無い。T5-3b の行が数え方に求めるのは「広げた props を『値で渡すもの』として位置ごとに返す」で、前回の指摘1の直しが守った約束（見る位置は必ずどちらかに出る）がここで破れている。T5-24 は `samples.ts` を手で直して (c) の試験にかけると書いているので、この見本の名前が来訪者の前で直らずに残るわけではないが、T5-26 がこの関数を `src/` の全体に当て続けるとき、道具や一覧が選択肢の並びや組を広げて渡すと、書いた名前が (a) の0も (b) の測りもすり抜ける。

あわせて、同じ種類の穴がもう1つある。字を書いたあとに広げると、広げた値が字を上書きするのに、数え方は書いた字だけを見て、広げた値を出さない。

```tsx
const LOCAL = { label: "新しい順に並べる" };
// 字で渡すもの 0・値で渡すもの 0（画面の名前は「新しい順に並べる」）
<RadioGroup legend="並べ替え" options={[{ value: "b", label: "古い", ...LOCAL }]} />
<Field label="名前" {...P}>{() => null}</Field>
```

`checkChoice` は名前の欄が見つかればそれだけを見て、広げたプロパティを見ない。`checkElement` も、名前の props が書いてあれば、そのあとの広げた props を見ない（`checkGroup` は広げたものを持つ組をすべて値で渡すものに出すので、選択肢と組とで扱いもそろっていない）。HEAD の `src` にこの書き方は無い（名前の欄の後ろに広げる書き方を grep で探して0）。

直し方: 広げた props は、その部品の見る位置（名前の props・選択肢の並び・組・組の並び）のうち、広げたものより後ろに書かれていない位置のすべてに、位置ごとに値で渡すものとして出す。選択肢と組のオブジェクトも、名前の欄より後ろに広げたプロパティがあれば値で渡すものに出す（名前の欄が広げたものより後ろにあれば、その字を見てよい）。単体テストに「選択肢の並びと組を広げた props で渡す」「字の後ろに広げる」を足す。直すと `src` の全体の値で渡すものは `ListSampleView.tsx` の分（`BrowsableList` の `kindGroup` と `sorts`）だけ増える見込みなので、数え直し、t5-design.md の 4-g の数と受け持ちの内訳（この見本は T5-24）と T5-24 の行の「値で渡す所（いま 3）」を、出力に合わせて直す。

## 指摘にしないこと

- 広げたあとに同じ鍵を書いたオブジェクトの鍵（`{ ...BASE, label: "エンコードするテキスト" }` の `.label`）や、広げたものを持つ組の、後ろに書いた `legend` の字は、字まで解けるのに値で渡すものに出る。見る位置は消えず、(b) の測りで拾えるので、安全側の扱いとして受け入れる（上の指摘1の直しで、名前の欄が広げたものより後ろにある選択肢の字を見るなら、同じ考えで組と `const` の鍵にもそろえてよい）。
- 広げた `const` の鍵が解けないとき、理由が「状態や変数」と出る。根の名前が同じファイルの変数であることは正しく、位置と式も出るので、測る人が取り違えることは無い。

## PM への依頼

指摘が1つあるので、builder に直させ、直したあとにもう一度レビューを依頼してください。そのときは、この指摘だけでなく PART 1 の全体（数え方の関数・単体テスト・`check:phrased-names`・スキル・4-g の数）を見直す対象にしてください。
