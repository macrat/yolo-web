# T4-4b の2巡目のレビュー（見出しの文を直す）

- 対象: コミット 1c63898
- 照らしたもの: [review-t4-4b.md](./review-t4-4b.md)（前回の指摘）、[t4-design.md](./t4-design.md) の「T4-4b のレビューを受けた PM の決定」、`DESIGN.md` §4・§7、`docs/anti-patterns/implementation.md`・`workflow.md`
- 自分で確かめたこと: 差分の全体、1c63898 を worktree に取り出して `tsc --noEmit`（生成物の release-id が無いことによる1件のほかは通過。ビルドのあとに生成される）、関係するテスト 82 ファイル 1560 件（通過）、変えたファイルの eslint・prettier（通過）、本番ビルド（`npm run build` → `next start`）での word-sense-personality の結果のページの題・og:title・twitter:title、OGP 画像（word-sense-personality の warm-empathy。builder の撮った8枚と読みを持たない yoji-personality の前後も見た）、解き終えた画面を 360px で同点が出るまで遊んで撮った同点の開示、builder の比べた記録（`tmp/cycle-316/t4-4b-3/compare.json`・`diffs.json`・`compare.mjs`）

## 判定: 改善指示

前回の Major-1 と Minor-1 は直り、Minor-2 は PM の決定どおり T6 に渡っています。来訪者に見える問題は見つからず、Major はありません。ただし、読みの形が誤ったときに黙って読みが消えることと、word-sense-personality のページの題が実際に通る分かれ道にテストが無いことなど、Minor が4件あります。

## 前回の指摘

- **Major-1（OGP と共有の文から読みが外れた）**: 直った。`resultNameWithReading` を1つだけ置き、結果のページの題・og:title・twitter:title・共有の文、解き終えた画面の共有の文・同点の開示・解説へのリンクがどれもこれを使う。本番ビルドで、ページの題は「和顔愛語（わがんあいご）タイプ | yolos.net」、og:title と twitter:title は「和顔愛語（わがんあいご）タイプ」。OGP 画像はタイトルの下に「わがんあいご」が添わる。description は `result.description` で、word-sense-personality の説明はタイプ名を含まないので、変える所が無い。
- **Minor-1（無い文を例に引くコメントとテスト）**: 直った。`phrase-breaks.ts` の例は「藍色(あいいろ)」と「Unix タイムスタンプ／変換ツール」に、テストの入力は「カテゴリから探す（10）」と「Unix タイムスタンプ変換ツール」になり、どれもサイトにある文である。
- **Minor-2（OGP の「——」の隙間）**: PM の決定どおり T6 に渡っている。蒸し返さない。

## 見てほしいと言われた点

- **`reading` の形 `{ word, kana }`**: 読みを差し込む位置をデータで決める形は筋が通っていて、「タイプ」の前という決め打ちより他のクイズに広げやすい。見出し・一覧・OGP が使うのは `kana` だけで、`word` を使うのは `resultNameWithReading` だけ。ただし、`word` が title に無いと `replace` が何もせず、見出しの下には読みが出るのに、題・共有の文・同点の開示からは黙って読みが消える。いまの8件は word-sense-personality のデータのテストと `resultName.test.ts` が守っているが、ほかのクイズが読みを持ったときは守られない（Minor-1）。
- **読みを持たないクイズの文が変わらないこと**: 変わらない。`resultNameWithReading` は `reading` が無ければ title をそのまま返し、`reading` を持つのは word-sense-personality の8件だけ（型の上でも grep でも確認）。builder の比べた記録でも、word-sense-personality 以外の結果のページ 125 件は題・og:title・twitter:title・description・共有の文が1字も変わっていない。OGP 画像も yoji-personality の前後が同じバイト数で、読みを持たない画像は変わらない。ただし、解き終えた画面の比べ方には記録の読み違えがある（Minor-4）。
- **OGP 画像の読みの見え方**: よい。タイトル（明朝・80px・墨）のすぐ下 8px に読み（ゴシック・30px・INK_2）、その下 28px にクイズ名が来る。読みとクイズ名は同じ大きさと色だが、タイトルへの近さで読みがタイトルに付き、クイズ名が別の段に見える。画面の包みで名前の下に読みを添える形とも同じ。8タイプとも4字＋「タイプ」の7字で、折れもはみ出しも無い。
- **`page.test.ts` から消したテストの代わり**: 消したのはソースの文字列を grep するテストで、代わりに `page.test.tsx` で `generateMetadata` を呼んで題・og:title・共有の文を確かめるようになり、振る舞いを見るぶん前より強い。ただし、代わりのテストが通るのは「クイズ名を添える」分かれ道だけで、word-sense-personality の8件が実際に通る「長さの上限でクイズ名を省く」分かれ道で読みが付くことを確かめるテストが無い（Minor-2）。
- **同点の開示の見え方**: 360px で「【花鳥風月（かちょうふうげつ）タイプ】と【抱腹絶倒（ほうふくぜっとう）タイプ】が同じくらい強く出ています。」と「抱腹絶倒（ほうふくぜっとう）タイプの解説を見る」を確かめた。本文の組みなので語や丸括弧の中でも折れるが、本文の通常の折り返しで、見出しの規定（§4）には掛からない。リンクの名前に読みが入るが、これは §7 の「行の一覧」ではなく文のリンクで、PM の決定（見出し以外のどこでもタイプ名と一緒に出す）どおり。

## 指摘

### Minor-1: `word` が title に無いとき、読みが黙って消える

`resultNameWithReading` は `title.replace(reading.word, …)` で、`word` が title に無ければ title をそのまま返す。見出しの下と一覧には `kana` が出るので、画面では読みがあるのに、共有の文・ページの題・同点の開示だけ読みが消え、誰も気づかない。いまの8件は `resultName.test.ts` と word-sense-personality のデータのテストが守るが、どちらも word-sense-personality だけを見ている。

直し方: 登録されたすべてのクイズについて「`reading` を持つ結果は title が `reading.word` を含む」を確かめるテストを1つ置く（`registry` の全クイズを回す）。`resultName.test.ts` の word-sense-personality だけを回すテストは、これに置き換える。

### Minor-2: word-sense-personality のページの題が通る分かれ道にテストが無い

`generateMetadata` は、題が全角30字相当を超えるとクイズ名を省き、`resultName` だけにする。word-sense-personality の8件はすべてこちらを通る（「和顔愛語（わがんあいご）タイプ | yolos.net」）。ところが `page.test.tsx` の読みを持つ例は短いクイズ名（「言葉診断」）で、クイズ名を添える側しか通らない。省く側を `result.title` に戻しても、どのテストも落ちない。

直し方: `page.test.tsx` に、読みを持ち、クイズ名が長くて省く側を通る例を1つ足し、題が「和顔愛語（わがんあいご）タイプ | yolos.net」の形になることを確かめる。

### Minor-3: OGP の主部のコメントが読みを書いていない

`src/lib/ogp-image.tsx` の主部のコメントは「品名（明朝・墨）を上下中央・左揃えで大きく立てる。副題はその下（ゴシック・INK_2）。」のままで、品名と副題のあいだに読みが入ることを言っていない。コメントだけを読むと、副題が品名のすぐ下に来ると読める。「品名のすぐ下に読み（ある時だけ）、その下に副題」と、並びをそのまま書く。

### Minor-4: 解き終えた画面の比べ方が、同じ結果どうしを比べていない

builder は「全129件の結果のページと解き終えた画面を比べ、変わったのは word-sense-personality の8件だけ」と報告したが、`diffs.json` には12件あり、残りの4件は解き終えた画面（word-sense-personality・animal-personality・yoji-personality・traditional-color）である。`compare.mjs` は「最初の選択肢を選び続ける」と書いてあるが、設問や選択肢の並びが回ごとに変わるので、前と後で別の結果（例: animal-personality はヤマネとアマミノクロウサギ）になり、URL のポートも違う。つまり解き終えた画面は、読みを持たないクイズで文が変わらないことの証拠になっていない。

結論は正しい（読みを持たない結果は title をそのまま返すことと、`ResultCard.test.tsx` の「読みを持たないタイプの共有の文は、title のまま」で確かめられる）。直すのは記録で、サイクルの記録には「結果のページ 125 件は1字も変わらない。解き終えた画面は結果が回ごとに変わるので比べられず、単体テストで確かめた」と、実際にしたことのとおりに書く。

## 範囲の外で見つけたこと（PM への申し送り）

word-sense-personality の遊びのページは、説明で「友達との相性診断もできます!」と言い、よくある質問で「結果ページから友達のタイプとの相性を確認できます。8タイプの組み合わせによる36通りの相性パターンが用意されています。」と答えている。ところが、この診断には相性を見る画面も友達を誘うボタンも無い（`extractWithParam` が `with` を受けるのは music-personality だけで、`?with=humor-wit` を付けた結果のページにも相性は出ない）。データには36通りの相性の文があるが、どこからも使われていない。来訪者に、無い機能を約束している。T4-4b の差分の問題ではないので、ここでは直さず、backlog に積むか、今のサイクルのどこかで扱うかを PM が決める（説明とよくある質問から相性の約束を外すか、相性の画面を作るか）。

## 次の手順

builder に Minor-1〜Minor-4 を直させ（Minor-4 はサイクルの記録の直し）、直したあとに、前回の指摘だけでなく全体を見直すレビューをもう一度受けてください。範囲の外で見つけたことは、PM が扱いを決めて記録してください。
