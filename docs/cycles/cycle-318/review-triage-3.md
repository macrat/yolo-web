# レビュー: 実機に頼る項目の振り分け 第3回

- 対象: [device-triage.md](./device-triage.md)・[device-triage-reveal.md](./device-triage-reveal.md)・[device-triage-fixes.md](./device-triage-fixes.md)・[device-triage-sources.md](./device-triage-sources.md)、[index.md](./index.md) の「作業内容」と「検討した他の選択肢」
- 主の木 `/home/user/yolo-web`、ブランチ `design-rollout`、HEAD 0a6c5915
- 照らしたもの: 第2回（[review-triage-2.md](./review-triage-2.md)）の冒頭と同じもの。加えて次のもの。
  - コード: `src/app/play/[slug]/page.tsx`・`page.module.css`、`src/app/play/music-personality/page.tsx`、`QuizPlayPageLayout.tsx`、`SiteFrame.module.css`、`Section.module.css`、`globals.css`、`src/lib/reveal.ts`、nakamawake・kanji-kanaru の `GameContainer.tsx`、`DESIGN.md` 410行、cycle-316 の t5a-design.md・carryover-tasks.md、`docs/backlog.md` の B-620・B-623
  - 外部: Pointer Events Level 3 §8.2、WebKit bug 261185・255708
  - 試した結果: Next 16.3 の `next build` で小さなアプリを組み、Chromium で開いた（後述）

## 判定: 改善指示

第2回の指摘8件は、7件が閉じた。指摘7は一部が残る。経緯の堆積と `tmp/` への言及は無い。どのファイルも 40,000 バイト以下である（device-triage.md は 39,354 バイトで、上限に近い）。

D1 の (b') は、技術的に成り立つ。来訪者の得からも妥当である。ただし、根拠に挙げた事実のうち2つが、実際の仕組みと違う（指摘2・3）。D4 は、iOS の `svh` の実装に頼っている。それなのに、そのことを残りの危険として挙げていない（指摘1）。

## 第2回の指摘の閉じ具合

| 指摘                   | 状態       | 見たこと                                                                                                                                                                                                               |
| ---------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 D1 の覆う範囲        | 閉じた     | 4つの案を比べ、(b') を選んでいる。失うものに、初めの倍率での拡大も入った。7章・fixes.md・T5a-7 の点（ヘッダ・余白・フッタ、ほかのページの対）もそろっている                                                            |
| 2 `revealFocusedFrame` | 閉じた     | reveal.md の表は、`kind` を持つ `ResultBox` だけになった。`kind` を持たないものは変わらない、とも書いてある。index.md の作業内容6にも反映された（storybook の扱いは指摘7）                                             |
| 3 fixes.md の漏れ      | 閉じた     | 3-1・3-2・7章の T5a-3 の行・5章の §8 の文・D1 のスキルの文が入った。引いている元の文は、t5a-design.md の 141・158・276行と `DESIGN.md` 410行に、そのまま見つかった（8章の項目2の漏れは指摘8）                          |
| 4 直しの担当と時点     | 閉じた     | 作業内容4で、builder が主の木で T5a-2 と並べて入れる。T5a-1 の前に入れる。backlog の行は PM が起こす。fixes.md・6章とも合っている                                                                                      |
| 5 決まったことの書き方 | 閉じた     | 6章の最後の文は消えた。reveal.md 1章は、決まったこととして書いてある                                                                                                                                                   |
| 6 D4 の式と試験        | 閉じた     | 式は (ア) で書かれている。読み方（`height: 100vh; height: 100svh` の見えない箱）も書いてある。拡大したときの試験が足され、試験は6つになった。この6つ目は (ア) と (イ) を見分けられる（visualViewport の無い枝は指摘5） |
| 7 index.md の GA の数  | 一部が残る | 「WebKit」で括る書き方は直った。しかし Android の数が 30.4% で、device-triage.md 1章（27.7%）と合わず、出自も無い（指摘6）                                                                                             |
| 8 細かい事実           | 閉じた     | T9 の分け方・t5a-measure.md への1文の置き場所（0章の終わり）・`font-variant-emoji`・sources 15行・D8 の 21.6 が、どれも直っている                                                                                      |

## D1 (b') を確かめたこと

- **CSS Modules**: `src/app/play/[slug]/page.module.css` を読み込んでいるのは `QuizPlayPageLayout.tsx` だけである（19行）。Next 16.3 の `next build` は Turbopack で組む（下の指摘2）。そこで、小さなアプリを `next build` で組んで確かめた。`:root:has(.box) { touch-action: manipulation; }` は止まらずに通り、出力は `:root:has(.p-module__37q2Da__box){touch-action:manipulation}` だった。Chromium での `html` の計算値は次のとおりだった。
  - 箱のあるページ: `manipulation`
  - 箱の無いページを直に開いたとき: `auto`
  - 箱のあるページからリンクで移ったとき（クライアントの遷移で、CSS は読み込まれたまま残る）: `auto`
  - 戻ったとき: 再び `manipulation`
- **`:has()` の対応**: Safari 15.4・Chrome 105 から使える（sources のとおり）。古いブラウザでは規則が効かず、今と同じに戻るだけなので、害は無い。
- **根の値は送りに効くか**: Pointer Events 3 §8.2 は、拡大の身ぶりについて、触れた要素から文書の要素（`html`）までの各要素の `touch-action` に合うかを見る、と定める。パンについては、いちばん近い送れる要素までしか見ない。したがって、2度の押しの拡大は、根の値で止まる。途中に送れる要素（`ProgressBar` の `overflow: hidden` など）があっても変わらない（指摘3）。
- **覆う経路**: 診断のプレイ面は `/play/[slug]`（全クイズ。ゲームは固定の経路）と `/play/music-personality` の2つである。どちらも `QuizPlayPageLayout` を使う。`QuizContainer` を使うのもこの部品だけなので、15本をすべて覆う。結果のページ（`/play/<slug>/result/…`）は覆わない。結果のページでは、押した点の下が入れ替わらないので、それでよい。
- **箱で包む影響**: `.main` は `padding-inline` を持つだけで、子の並びを決めない。`Section` の罫線（`.section + .section`、`calc(50% - 50vw)`）は兄弟の関係と、包む要素の幅で決まる。余白の無い箱で包む限り、変わらない。`main >` や `:first-child` に頼る規則も、このページには無い。
- **来訪者の得と失うもの**: ページのどこから始まる2打目も拡大にならない。この得は、iOS の 58.9% に届く。失うのは、診断のページでの2度の押しの拡大と、それを戻す身ぶりで、つまむ拡大は残る。2度の押しが害になるページだけに限っており、妥当である。

## 指摘

### 1. D4 は iOS の `svh` の実装に頼るが、その残りを (iii) に挙げていない（中）

D4 の (i) の下端は、「`100svh` の箱の高さが、ツールバーを出した高さに等しい」ことに頼る。これは端末（エンジン）の実装に頼ることで、WebKit には次の不具合がある。

- **WebKit bug 261185**「[iOS] svh/dvh units are unexpectedly equal when Safari tab bar is not visible」: 2023年11月に直った。それより前の iOS では、ツールバーが縮むと `svh` も大きくなり、`min` が `visualViewport` の高さに戻る。
- **WebKit bug 255708**: アプリの中の Safari（SFSafariViewController。device-triage.md 1章の 4.9%）で、ビューポートの単位が誤った大きさになる。まだ直っていない。iOS 26.1 でも、`100dvh` と `100svh` に数 px の差が残ると書かれている。
- iOS 26 の Safari は、タブバーの置き方（コンパクトなど）を変え、`innerHeight` などの値も変わったと報告されている。

外れたときのふるまいは2通りある。

- `svh` が大きく読めるとき: 今と同じふるまいに戻るだけで、悪くはならない。
- `svh` が小さく読めるとき: 送りが余計に増える。まとまりが「画面より高い」と判じられると、4-5 の帯を上端から 8px に置く形に移りうる。

D4 の「(iii) の残り」は上端だけを挙げており、この依存が見えない。

- 直し:
  - D4 の (iii) の残りに、「小さいビューポートの高さが、iOS の版やアプリの中の Safari で、ツールバーを出した高さと違いうること」と、上の2つの外れ方を足す。
  - sources の「一次資料で決まらないこと」に、2つの bug を出自として足す。
  - 7章の T9 の行と、fixes.md の T9 の文の「見張る危険」に、このことを足す。
  - 5章の見張りは、D4 の残りとしてすでに受けている。そのため、見張る数を足す必要は無い。

### 2. sources の「このリポジトリで確かめたこと」は、使っていない組み方の道具で確かめている（小）

sources 20行は、Next.js が同梱する `postcss-modules-local-by-default`（webpack の経路）で確かめたと書く。しかし、このリポジトリの `npm run build` は `next build` で、Next 16.3 では Turbopack（Lightning CSS）が CSS Modules を組む。`turbopack.root` の外を指すシンボリックリンクで、`TurbopackInternalError` が出たことからも、既定が Turbopack だと分かる。結論は変わらない（上の「D1 (b') を確かめたこと」のとおり、Turbopack でも通り、効く）。ただし、根拠が実際の経路を指していない。

- 直し: 20行を、Turbopack の `next build` で組んだ結果（出力の規則の形と、Chromium での根の計算値。ほかのページとクライアントの遷移のあとで `auto`）に書き換える。

### 3. D1 の「根の値が送りまで届く」の根拠が違う（小）

D1 の組み方は、「`html` と `body` は `overflow-x: clip` で送れる要素にならないので、根の値は画面の送りまで届く（推論）」と書く。これは、MDN の「最初の送れる要素まで」に合わせた読みである。しかし Pointer Events 3 §8.2 では、この「送れる要素まで」はパンの決まりである。拡大は、文書の要素までのすべての要素の値を見る。

> A direct manipulation interaction for zooming is supported if it conforms to the touch-action property of each element between the hit tested element and the document element of the top-level browsing context.

したがって、根の値が効くのは `overflow-x: clip` のおかげではない。仕様がそう定めているので、推論でもない。途中に送れる要素があっても覆いは崩れない。このことは (b') の強い支えになる。

- 直し:
  - D1 の組み方の文を、Pointer Events 3 §8.2 を引く形に書き換え、「（推論）」を外す。
  - sources に Pointer Events 3 §8.2 を足す。
  - MDN の要約の「（最初の送れる要素まで）」は、パンのことだと分かる書き方にする。

### 4. T5a-7 の D1 の対に、クライアントの遷移のあとを入れる（小）

App Router では、診断のページから移ったあとも、そのページの CSS モジュールは読み込まれたまま残る。根の規則が漏れるとすれば、この経路である（たとえば、あとで誰かが `:has()` を外した形に書き換えたとき）。T5a-7 の対は、`/blog` と `/tools` を直に開くだけである。

- 直し: T5a-7（ii）の対に、「診断のページからヘッダのリンクで `/blog` に移ったあと、根の値が `auto` であること」を足す。

### 5. D4: `visualViewport` が無いときの式が決まっていない（小）

D4 の式と fixes.md のスキルの文は、`visualViewport` があるときだけを書く。reveal.md 3章の5つ目の試験（「`visualViewport` が無い」）の期待する値が、`{ top: 0, bottom: innerHeight }`（いまの `reveal.ts` 29行）なのか、`{ top: 0, bottom: min(innerHeight, 小さいビューポートの高さ) }` なのかが読めない。

- 直し: 無いときの式を D4・reveal.md 3章・fixes.md のスキルの文に1つ書き、試験の期待する値をそれに合わせる。
  - おすすめ: `{ top: 0, bottom: min(innerHeight, 小さいビューポートの高さ) }`。読んだ高さが 0 以下なら `innerHeight` を使う。2つの枝を同じ形にでき、7章の T5a-3 の行の「`visualViewport` に落とす」とも合う。

### 6. index.md「検討した他の選択肢」の Android の数（小）

「iOS 58.9%・Android 30.4%」の 30.4% は、device-triage.md 1章に無い。1章にあるのは Android の Chrome（mobile）の 27.7% で、ほかの文書にも 30.4% は見つからない。

- 直し: 次のどちらかにする。「約9割」も、数に合わせて直す。
  - 1章の 27.7% を使う。合わせて 86.6% なので、「8割半ば」などとする。
  - Android の全体の数を GA で取り、出自とともに 1章に足してから引く。

### 7. index.md の順と、作業内容6の範囲（小）

- 作業内容の冒頭の「順は「振り分け → T5a-2 → T5a-1 → T5a-3」」に、4（fixes.md の直し）が入っていない。「実施する作業」の並びでも、直しの行が T5a-1 の行のあとにある。作業内容4は「T5a-2 と並べて、T5a-1 の前」なので、順の文と「実施する作業」の並びをそれに合わせる。
- 作業内容6の「`kind` を持つ `ResultBox`（age-calculator・json-formatter）」は、reveal.md 2章の表にある storybook（`StorybookContent.tsx` 1438・1456行）を抜かしている。完了の条件の「既存の試験が通る」の範囲として、storybook も入れるか、来訪者の面に限ると書く。

### 8. fixes.md: t5a-design.md 8章「PM が足す行」の2が、実機の確かめのまま残る（小）

fixes.md は、8章の「PM が足す行」の1（T6 の行の `touch-action` の文を消す）と3（T9 の行の文に替わる）を扱う。しかし2の引用文（639行）は、「iOS の Safari の実機で、知識クイズの各問と最終問のあとの「次へ」を二度押しし、FAQ が開かないことを確かめる。」のまま残る。carryover-tasks.md の T9 の行は、T9 が `grep -rn "実機" … t5a-design.md` で拾う項目を挙げており、この文も拾われる。D9 の結論（T5a-7 の測りで閉じる）と食い違う。

- 直し: fixes.md の「文書のあいだの道筋」で、「PM が足す行」の2も、下の T9 の行の文（B-623 は T5a-7 の二度打ちの測りで閉じる）に替わる、と書く。

## 確かめたこと（合っていたもの）

- fixes.md が引く t5a-design.md の文はどれも、今のファイルにそのままある（22・141・158・181・183・257・268・276・316・374・393・444・445・532・612・635行）。carryover-tasks.md の T6・T9 の行の文と、`DESIGN.md` 410行の §8 の文も同じである。
- t5a-design.md で「T9」「実機」「`touch-action`」「`visualViewport`」を含む行は、8章の「PM が足す行」の2（指摘8）を除いて、すべて fixes.md の直しの案が覆っている。
- D4 の6つの試験と index.md の作業内容6は、次の点で合っている: 既存の試験が通ること、変わる所を単体試験で固めること、確かめを単体試験で行う理由（Chromium では `100svh` が `innerHeight` に等しい）。
- D3 の13の宣言の数と、比べる計算値の一覧（`font-variant-emoji` を含む）。
- nakamawake 172〜177行と kanji-kanaru 295〜297行の、面の中の同じ計算。
- 3つのファイルに、経緯の堆積（「第n回」「前は」など）と `tmp/` への言及は無い。

## PM への依頼

1. planner に、上の 1〜8 をすべて直させる。対象は device-triage.md・device-triage-reveal.md・device-triage-fixes.md・device-triage-sources.md と、index.md の作業内容・検討した他の選択肢である。device-triage.md は 39,354 バイトで上限に近いので、足すときは、ほかの文を締めるか、詳しいことを sources・reveal に寄せる。
2. 直したら、もう一度レビューを依頼する。そのときは、今回の指摘だけでなく、文書の全体を見直す範囲にする。

## 出典

- [Pointer Events Level 3 §8.2](https://www.w3.org/TR/pointerevents3/#determining-supported-direct-manipulation-behavior)
- [WebKit bug 261185](https://bugs.webkit.org/show_bug.cgi?id=261185)
- [WebKit bug 255708](https://bugs.webkit.org/show_bug.cgi?id=255708)
