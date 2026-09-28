# T5-3b PART 1（数え方の関数・check:phrased-names・frontend-design スキル）の第2回レビュー（224b13b3）

判定: **改善指示**

対象: 224b13b3 の `src/test/unphrased-names.ts`・`src/test/__tests__/unphrased-names.test.ts`・`src/test/check-phrased-names.test.ts`・`.claude/skills/frontend-design/SKILL.md`・`docs/cycles/cycle-316/t5-design.md` の 4-g の数。前回（review-t5-3b-part1-1.md）の指摘1〜5が直ったかと、PART 1 の全体を見た。

## 確かめたこと

HEAD を scratchpad に書き出し、`node_modules` が無いことを確かめてから `cp -al` し、`npm run generate:release-id` のあとに走らせた。

- **全体の vitest**: `npx vitest run` で 392 ファイル（下の試しのファイル1つを含む）のうち 390 が通り、2 が飛んだ（`check-phrased-names.test.ts` を含む）。落ちたものは無い。`npx tsc --noEmit` は0件、変更した3つの `.ts` の `eslint` と5ファイルの `prettier --check` も通る。
- **`npm run check:phrased-names` を実際に**:
  - `src` の全体（`PHRASED_NAMES_REPORT_ONLY=1`）: 数えた `.tsx` 369、字で渡すもの 126（51ファイル）、値で渡すもの 50、字で渡した名前と面 303。終わりのコードは 0。
  - `PHRASED_NAMES_PATHS=src/tools/base64`: 字で渡すもの4（`DIRECTION_TEXT[direction]` の先の「エンコードするテキスト」「デコードするBase64」を含む）、値で渡すもの0で、終わりのコードは 1。
  - `PHRASED_NAMES_PATHS=src/tools/percent-calculator,src/lib/share-labels.ts`: 頭に「数える .tsx が無いパス: src/lib/share-labels.ts」を出し、`targetsWithoutFiles` の比べで落ちる（終わりのコード 1）。`useMemo` の `switch` が返す「もとの値 X」「割合 Y（%）」「全体 B」も字で渡すものに出る。
  - `PHRASED_NAMES_PATHS=src/components/Button`: 数えた `.tsx` 1、どれも0で通る。
- **前回の指摘**:
  1. 変数の鍵の添字と `useMemo` を解くようになり、base64・fullwidth-converter・percent-calculator の7件が字で渡すものに移った。単体テストも両方にある。直った。
  2. 値で渡すもの 50 件に理由「値」は無い。50 件をすべて読み、`.map`（`DIFFICULTY_OPTIONS`・`HARMONY_RADIO_OPTIONS`・`categoryOptions`）、区切りを受け取らない部品の props（`DisclosureRow` の `name`・`description`）、部品が関数に渡す引数（`PaginationButtons` の `renderItem` の `label`）、ほかのモジュールの関数（`ListControls` の `controlsLabel(...)`）、同じファイルの関数（`CopyButton` の `facePhrases(status)`）と、どれも実際のコードに合っていた。直った。
  3. スキルに「どの折り所も語の中には置かない（§4）」と外し方、出力の括弧が `splitIntoPhrases` の分け方で書く並びではないことが入り、出力も `2文節以上（splitIntoPhrases の分け方: …）` になった。直った（例の書き方は下の指摘2）。
  4. `.tsx` の無いパスは失敗し、`REPORT_ONLY` では頭で知らせる。数えた `.tsx` の数も出る。単体テストもある。直った。
  5. スキルの名前の props が部品ごとの props 名になり、選択肢の並び（`RadioGroup` の `options`・`Slider` の `items`）が分かれた。4-g の見る位置と合う。直った。
- **誤検知**: 字で渡すもの 126 件をすべて読み、どれも 4-g の見る位置の、2文節以上のコードに書いた字だった。
- **見落とし**: `src` の `.tsx` で `label=`・`legend=`・`summary=`・`title=`・`heading=` に字を書いた行をすべて grep し、数え方が見ない部品（`BrowsableList` の `label`、`QuizContainer` の進み具合、ゲームの結果の `title` など）はどれも 4-g が「どちらにも出さない」とする区切りを受け取らない部品か見出しの側だった。試しの `.tsx`（`r2/src/test/probe`。書き出しとともに消した）で、`?.`・並びの数の添字・`useMemo` が別の `const` を引くもの・`Slider` の `items` の `const`・素の `label` の中の `input` と字・禁則を満たさない `phrases` を当て、どれも期待どおりに出た。1つ、下の指摘1の穴を見つけた。
- **4-g の数**: 出力から数え直し、2文節以上 126（51ファイル）＝道具 86（31本。素の `<label>` 29）＋storybook 19＋一覧の探す欄 7＋道具の外 14、ボタンの面 17、値で渡す所 50 の受け持ちの内訳（T5-18 23・T5-7 10・T5-3b 7・T5-24 3・T5-3a 2・T5-15 2・T5-3c／T5a／T5-20e 1ずつ）が、どれも出力と一致した。
- **スキル**: 経緯の痕跡（「以前は」「T5-3b で」など）は無く、「機械で確かめる」の表の行と「実装の技術」の項が同じことを言っている。

## 指摘

### 1. 字の鍵が相手のオブジェクトに見つからないと、名前の位置がどちらの出力からも消える（直す）

`memberValues` は、字の鍵のプロパティが見つからないと `[]` を返す（`return property ? [property] : [];`。並びの添字の外れも同じ）。`resolveLocalValues` はそれを「なりうる値が無い」と受け取るので、その位置は字で渡すものにも値で渡すものにも出ない。`findProperty` は広げたプロパティ（`...BASE`）の中を見ないため、次のような書き方で起きる。

```tsx
const BASE = { label: "もとの値 X" };
const CONFIG = { ...BASE, placeholder: "3000" };
// 字で渡すもの 0・値で渡すもの 0
<Field label={CONFIG.label}>{() => null}</Field>;
```

鍵が変数のときの `{}`（値が1つも無い）も同じく消える。HEAD の `src` では、見つからないときに解けない扱い（`undefined`）へ変えて数え直しても出力が1字も変わらないので、いま消えている位置は無い。ただし数え方の約束は「見る位置は必ずどちらかに出る」で、T5-26 はこの関数を `src/` の全体に当て続ける。共通の設定を広げて足す `const` は道具で書きやすい形で、書いた名前が黙って数えから外れると (a) の0も (b) の測りもすり抜ける。

直し方: 字の鍵が見つからないとき、相手が広げたプロパティか広げた要素を持つとき、鍵が変数で値が1つも無いときは `undefined`（解けない）を返し、その式を値で渡すものに出す。広げた先が同じファイルの `const` なら、そこまで解いてもよい。単体テストに「広げたオブジェクトの字の鍵」を足す。

### 2. スキルの外し方の例が、書いた手順の結果になっていない（直す）

「語の中の境目を外し（「ひらがな → |カタカナ」）」とあるが、`splitIntoPhrases` の「ひらが／な／ → カタカナ」から語の中の境目を外すと「ひらがな| → カタカナ」で、折り所が矢印の後ろへ移るのは外すことの結果でも1〜5のどれかでもない。次の作り手は、矢印を前の語に付ける規則がどこかにあると読むか、自分の並びとの違いに迷う。しかも名前の中の空白は `keep-all` でも折り所なので、並びを `["ひらがな → ", "カタカナ"]` にしても「ひらがな / → カタカナ」と折れうる。例は手順の結果どおり「ひらがな| → カタカナ」にする（矢印の置き場を決めたいなら、その規則を §4 と1〜5に足し、空白を折れない空白にする組み方まで書く。どちらにするかは builder が決めてよいが、例と手順を合わせる）。

## 指摘にしないこと

- 名前の出るファイルの一部しか渡さないで `targetsWithoutFiles` で落ちたとき、落ちる試験の名は「字で渡す2文節以上の名前と面が無い」のままだが、出力の頭の「数える .tsx が無いパス」とアサーションの差分にパスが出るので、取り違えは起きない。
- 前回の「完了までに要ること」の2つ目（スキルが前提にする `Button` の `phrases` と各部品の `PhrasedName` がコードとそろうか）は、PART 2 のコミット（80223ce3）でそろったように見えるが、PART 2 のレビューの範囲なので、そちらで確かめる。

## PM への依頼

指摘が2つあるので、builder に直させ、直したあとにもう一度レビューを依頼してください。そのときは、この指摘だけでなく PART 1 の全体（数え方の関数・単体テスト・`check:phrased-names`・スキル・4-g の数）を見直す対象にしてください。
