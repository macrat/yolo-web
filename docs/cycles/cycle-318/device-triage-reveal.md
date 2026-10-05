# 画面の範囲を変える案と影響（device-triage.md D4）

[device-triage.md](./device-triage.md) D4 は、送りが使う「画面の範囲」を `{ top: offsetTop, bottom: offsetTop + min(visualViewport.height, 小さいビューポートの高さ) }` にする（`offsetTop` は `visualViewport.offsetTop`）。`visualViewport` が無いときは `{ top: 0, bottom: min(innerHeight, 小さいビューポートの高さ) }` で、2つの枝を同じ形にする。ここには、その範囲をどこまで変えるかの案の比べと、変えたときにふるまいが変わる面を置く。

## 1. 案

| 案                                                                                                                                        | 来訪者の得                                                                                                                                                      | 失うもの                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **(a)** `src/lib/reveal.ts` の `visibleRange()` を変え、nakamawake・kanji-kanaru の面の中の同じ計算も `visibleRange()` を使う形にそろえる | 道具の結果・ゲームのコントロール・結果のボックスも、ツールバーが出たときに下に隠れない。サイトの「画面」の定義が1つのまま（DESIGN.md §8 の送りの文が1つで済む） | ツールバーが縮んでいるとき、画面の下のツールバーの高さの帯にあるものを、これまでは送らなかったのに送るようになる（下の 2章）                                                      |
| **(b)** 診断の送りだけが使う範囲を別に持ち、ほかの面は変えない                                                                            | ほかの面の動きは変わらない                                                                                                                                      | 道具とゲームでは、ツールバーが出ると送った先の下が隠れる形が残る。「画面」の定義がサイトに2つでき、§8 の文と `frontend-design` スキルの送りの項を、面によって分けて書くことになる |

**(a) に決まっている**。ツールバーが出て下が隠れる害は、診断に限らず送りを使うどの面でも同じに起き、得も同じに届く。失うものは、ツールバーが縮んでいるときに送りが少し増えることで、送った先は「見せるものが丸ごと入った画面」で変わらない。(b) は、同じ害を道具とゲームに残したまま、定義を2つに割る。

- **そろえる作業は T5a-3 が受け持つ。** `visibleRange()` を変えた時点で、nakamawake と kanji-kanaru は1つのゲームの中に古い範囲と新しい範囲が並ぶ（kanji-kanaru では、入力の欄は `revealControl` の新しい範囲で、結果のボックスは面の中の古い計算で送る）。別のタスクに回すと、そのあいだ食い違いが残る。
- T5a-3 が触るファイルは、`src/lib/reveal.ts`・`src/lib/__tests__/reveal.test.ts`・`src/play/games/nakamawake/_components/GameContainer.tsx`・`src/play/games/kanji-kanaru/_components/GameContainer.tsx` である。
- T5a-3 は、道具とゲームと `kind` を持つ `ResultBox` のふるまいを変える。出荷は `design-rollout` の1回なので、来訪者に届く時点は変わらない。

## 2. ふるまいが変わる面

変わるのは、小さいビューポートの高さが `visualViewport` の高さより低いときだけである。iOS の Safari と Android の Chrome で、送られてツールバーが縮んだときに当たる（推論）。ツールバーが出ている状態とデスクトップでは、2つの高さは等しく、何も変わらない（推論）。変わるときは、画面の下端がツールバーの高さの分だけ上に来たとみなし、その帯にあるものを画面の外として送る。

| 関数と使う所                                                                                                                                                                                                                                                                                                          | 変わるふるまい                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `revealResult`: `src/tools/base64/Base64Tile.tsx` 142行・`src/tools/age-calculator/AgeCalculatorTile.tsx` 119行・`src/tools/json-formatter/JsonFormatterTile.tsx` 129行                                                                                                                                               | 結果の下端が帯にあれば、結果を見せる送りが起きる                                                         |
| `revealControl`: yoji-kimeru（`GameContainer.tsx` 340行・`GameResult.tsx` 65行）・nakamawake（`GameContainer.tsx` 258・266行）・irodori（`GameContainer.tsx` 253・256行）・kanji-kanaru（`GameContainer.tsx` 290行）                                                                                                  | 次に使うコントロールが帯にあれば、その下端を帯の上 8px まで送る                                          |
| `revealFocusedFrame`: `kind` を持つ `ResultBox` だけが呼ぶ（`src/components/ResultBox/index.tsx` 101行の `kind ?` と 106〜118行）。`kind` を渡すのは age-calculator の表（`AgeCalculatorTile.tsx` 195行）・json-formatter のコード（`JsonFormatterTile.tsx` 190行）・storybook（`StorybookContent.tsx` 1438・1456行） | キーボードで中身の区画に着いたとき、着く前にリングの辺が帯にあったら、見えていなかったとみなして送り直す |
| 面の中の同じ計算（T5a-3 が `visibleRange()` に替える）: nakamawake `GameContainer.tsx` 172〜177行の `visibleRange()`（`revealFocusedWord`・`revealResultHead` が使う）・kanji-kanaru `GameContainer.tsx` 295〜297行（結果のボックスの送り）                                                                           | 上の行と同じ。そろえれば、ゲームの中の送りがどれも同じ範囲で決まる                                       |

`kind` を持たない `ResultBox`（日替わり・占い・診断の `ResultCard`・ゲーム4本の結果・base64・char-count・qr-code）のふるまいは変わらない。

## 3. 読み方と確かめ方の限り

- 小さいビューポートの高さは、`height: 100vh; height: 100svh` を持つ見えない箱の `getBoundingClientRect().height` で読む。`svh` が効かないエンジンでは `100vh` になる。
- 下端は「`100svh` がツールバーを出した高さに等しい」ことに頼る。iOS の版やアプリの中の Safari（4.9%）では、これが外れうる（WebKit bug 261185・255708。[device-triage-sources.md](./device-triage-sources.md) の「一次資料で決まらないこと」）。大きく読めるときは、今と同じふるまいに戻るだけで悪くならない。小さく読めるときは送りが余計に増え、まとまりが「画面より高い」と判じられると、4-5 の帯を上端から 8px に置く形に移りうる。device-triage.md D4 は、これを (iii) の残りとして 5章で見張る。
- コンテナの Chromium にはツールバーが無く、`100svh` は `innerHeight` に等しい。この変更は、どの面の測りでも値を変えない。確かめられるのは単体試験だけである。
- jsdom では、見えない箱は組まれず、高さが 0 になる。そのまま小さいほうを取ると範囲の高さが 0 になり、送りを使うほかの面の試験とふるまいが崩れる。そこで、読んだ高さが 0 以下のときは小さいほうを取らず、`visualViewport` の高さ（`visualViewport` が無ければ `innerHeight`）をそのまま使う。

T5a-3 の単体試験に入れるもの（6つ）: 小さいビューポートが `visualViewport` より低い・高い・等しい、読んだ高さが 0（範囲は `{ top: offsetTop, bottom: offsetTop + visualViewport.height }`）、`visualViewport` が無い（小さいビューポートが `innerHeight` より低いとき範囲は `{ top: 0, bottom: 小さいビューポートの高さ }`、読んだ高さが 0 のとき `{ top: 0, bottom: innerHeight }`）、`offsetTop` が 0 でなく `offsetTop + visualViewport.height` が小さいビューポートの高さを超える（つまんで拡大したとき。下端が `offsetTop + min(…)` になり、小さいビューポートの高さで切られないこと）。道具とゲームの既存の試験がそのまま通ること。
