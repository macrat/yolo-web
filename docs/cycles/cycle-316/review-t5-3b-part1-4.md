# T5-3b PART 1（数え方の関数・check:phrased-names・frontend-design スキル）の第4回レビュー（b57ae1f5）

判定: **改善指示**

対象: b57ae1f5 の `src/test/unphrased-names.ts`・`src/test/__tests__/unphrased-names.test.ts`・t5-design.md の 4-g と T5-24 の行の数と、PART 1 の全体（`src/test/check-phrased-names.test.ts`・`npm run check:phrased-names`・`.claude/skills/frontend-design/SKILL.md`）。前回（review-t5-3b-part1-3.md）の指摘1が直ったかと、PART 1 の全体を見た。同じコミットの T5-15 の行の1文は別のレビューの対象なので見ていない。

## 確かめたこと

作業の木には別のタスクの変更があるので、HEAD（f10b9e6b。b57ae1f5 のあとは T6-3 の `.ts` の片付けだけ）を `git archive` で scratchpad の新しいディレクトリに書き出し、`node_modules` が無いことを確かめてから `cp -al` し、`npm run generate:release-id` のあとに走らせた。書き出しは終わりに消した。

- **試験と型**: `npx vitest run src/test` は 3 ファイルのうち 2 が通り 1 が飛ぶ（`check-phrased-names.test.ts`）。61 件が通り、落ちたものは無い。`npx tsc --noEmit` は0件。変えた `.ts` 2つの `eslint` と、変えた3ファイルの `prettier --check` も通る。
- **`npm run check:phrased-names` を実際に**:
  - `src` の全体（`PHRASED_NAMES_REPORT_ONLY=1`）: 数えた `.tsx` 331、字で渡すもの 126、値で渡すもの 52、字で渡した名前と面 303。終わりのコードは 0。同じ木で 5e42cd99 の `unphrased-names.ts` に差し替えた出力との差は、値で渡すものの数（50 → 52）と `ListSampleView.tsx:19:9` の `` `BrowsableList` の `sorts` の名前 `` と `` `BrowsableList` の `kindGroup` `` の2行と、時刻の行だけ。前回の見込みどおりで、ほかに出る所も消える所も無い。
  - `PHRASED_NAMES_PATHS=src/app/storybook`: 数えた `.tsx` 5、字で渡すもの 19、値で渡すもの 5（`ListSampleView.tsx` の `{...sample.list}` が `searchLabel`・`sorts`・`kindGroup` の3つ）。T5-24 の行の「いま 19」「いま 5。一覧の見本の `{...props}` の3つを含む」と合う。
  - `PHRASED_NAMES_PATHS=src/tools/base64`: 字で渡すもの4、値で渡すもの0で、終わりのコードは 1。
  - `PHRASED_NAMES_PATHS=src/tools/percent-calculator,src/lib/share-labels.ts`: 頭に「数える .tsx が無いパス: src/lib/share-labels.ts」を出し、字で渡すもの 7 で、終わりのコードは 1。
  - `PHRASED_NAMES_PATHS=src/components/Button`: 数えた `.tsx` 1、どれも0で通る。
- **4-g の受け持ちの内訳**: 23+10+7+5+2+2+1+1+1 = 52 で、値で渡すものの数と合う。
- **前回の指摘1**: 試しの `.tsx` を書き出しの中に置いて当てた（確かめたあと消した）。
  - 名前の props の後ろで広げた props（`<Field {...P} label="名前" {...Q}>`）は `Q` が値で渡すものに出る。
  - 広げた props で選択肢の並びと組を渡すもの（`<RadioGroup legend="並べ替え" options={[…]} {...P} />`）は、`legend` と `options` の名前の2つが出る。
  - 選択肢の名前の欄の後ろで広げた値（`{ label: "赤", ...O }`）と、組の並びの中の組の `legend` の後ろで広げた値（`filterGroups={[{ legend: "色の系統", ...G, options: [] }]}`）は、どちらも値で渡すものに出る。
  - 名前の欄が広げた値より後ろにある選択肢（`{ ...O, label: "古い順に並べる" }`）は、その字を字で渡すものに出して、値で渡すものには出さない（前回の「指摘にしないこと」で許した、字を見てよい扱い）。
  - 単体テストの2件（位置ごとに出すことと、名前の欄より後ろで広げたものだけを出すこと）も、この振る舞いを押さえている。`attribute` が同じ名前の属性の後ろ（効くほう）を取るようにしたのも正しい。

  名前の props・選択肢の並び・組・組の並びについては直った。

- **`Button` の面**: 子を書いた `Button` は広げた props を見ない。`Button` の型が `phrases` と `children` を一緒に受けない（`children?: never` / `phrases?: never`）ので、子を書いた `Button` に `phrases` を広げると型で落ちる。広げた props が面を変えることは無く、この扱いで正しい。
- **スキル**: b57ae1f5 で変わっていない。前回に見た内容のままで、経緯の痕跡は無い。

## 指摘

### 1. `CopyButton` の広げた props を、3つの属性の「いちばん後ろ」と比べるので、広げた props が `showTarget` や `targetPhrases` を運ぶと見る位置が黙って消える（直す）

`CopyButton` の面は、`showTarget`・`targetPhrases`・`target` の3つの属性で決まる。どれも広げた props で上書きできる。ところが `recordSpread(["target", "targetPhrases", "showTarget"], position)` が使う `spreadOverAttributes` は、3つのうち**いちばん後ろ**に書いた属性より後ろで広げたときだけ、広げた props を出す。広げたものより後ろに3つのうち1つでも書けば、残りの2つが広げた props から来ても出ない。

書き出しの中で当てた結果:

```tsx
const P = a > 1 ? { showTarget: true } : {};
const Q = { targetPhrases: ["別の", "名前"] };

// 字で渡すもの 0・値で渡すもの 0。P が showTarget を運ぶと、面は「メールの全文をコピー」になる。
<CopyButton {...P} target="メールの全文" />
// 字で渡すもの「メールの全文」だけ。Q の targetPhrases が面を決めるのに、値で渡すものに出ない。
<CopyButton showTarget {...Q} target="メールの全文" />
```

1つ目は、どちらの出力にも出ない。前回の指摘1の直しが守るはずの約束（見る位置は必ずどちらかに出る）が、`CopyButton` の面で破れている。2つ目は、前回の指摘1の後半（書いた字だけを見て、実際に面を決める広げた値を出さない）と同じ種類の穴である。`spreadOverAttributes` のコメント（「名前の属性のどれよりも後ろで広げた props」）が言うとおりの振る舞いだが、その決め方が、1つの面を複数の属性で決める `CopyButton` には合っていない。ほかの呼び出し（名前の props・選択肢の並び・組・組の並び・`Button` の `phrases`）は属性を1つしか渡さないので、この違いが出ない。

HEAD の `src` に、広げた props を渡す `CopyButton` は無い（`<CopyButton` 47か所のどれも広げていない）ので、いまの出力の数は変わらない。ただ、T5-26 がこの関数を `src/` の全体に当て続けるあいだに、道具の側でコピーのボタンを包んで props を広げる書き方が入ると、そのボタンの面が (a) の0も (b) の測りもすり抜ける。

直し方: 広げた props は、渡した属性の**どれか1つ**でもその後ろで広げていれば（書いていない属性は、どこで広げても後ろとみなす）出す。つまり「いちばん後ろの属性」でなく「いちばん前の属性」（書いていないものがあればそれ）と比べる。`spreadOverAttributes` のコメントもこの決め方に合わせて書き直す。単体テストに、上の2つの `CopyButton` が値で渡すものに出ることと、3つとも広げたものより後ろに書いた `CopyButton` は出ないことを足す。直しても HEAD の `src` の出力は変わらない見込みなので、4-g の数は変わらないはずだが、`src` の全体を走らせ直して確かめる。

### 2. 4-g の数の出どころのコミットが、その数を再現できない（直す）

4-g は「5e42cd99 の `src/` を、T5-3b の関数（`npm run check:phrased-names`）で数えた」と書き、値で渡すものを 52 とする。だが 5e42cd99 を取り出して `npm run check:phrased-names` を走らせると、その `src/test/unphrased-names.ts` は直す前の関数なので、値で渡すものは 50 になる（上の差し替えで確かめた）。52 は b57ae1f5 の関数で数えた数である。書いてあるとおりに読み手が再現すると数が合わず、どちらが正しいかで迷う。

直し方: 数えた木を、数え方の関数を含めて1つのコミットで言えるようにする。指摘1の直しのコミットで数え直すなら、その直前のコミット（指摘1を直す前の関数ではなく、直した関数で数えたことが分かる書き方）を名指すか、「〈コミット〉の `src/` を、〈コミット〉の `src/test/unphrased-names.ts` で数えた」と、関数のコミットも書く。

## 指摘にしないこと

- 選択肢の名前の欄を `label` と `name` の2つから探し、`spreadsOverKeys` は2つのうちいちばん後ろと比べる。`CopyButton` と同じ形の決め方だが、選択肢の型はどれも名前の欄を1つしか持たない（`RadioGroup` と `Slider` は `label`、`BrowseChoice`・`BrowseSort` は `name`）ので、2つを1つのオブジェクトに書くと余分なプロパティとして型で落ちる。この違いは出ないので、指摘1と同じ直し方に合わせるかは builder の判断に任せる。
- `BrowsableList` を広げた props で渡したとき、組の位置が `` `BrowsableList` の `kindGroup` ``（`legend` と `options` に分けない）で出る。組のオブジェクトの中が見えないのだから1つにまとめるのは自然で、測る人が取り違えることも無い。

## PM への依頼

指摘が2つあるので、builder に直させ、直したあとにもう一度レビューを依頼してください。そのときは、この指摘だけでなく PART 1 の全体（数え方の関数・単体テスト・`check:phrased-names`・スキル・4-g と T5-24 の行の数）を見直す対象にしてください。
