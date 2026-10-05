# レビュー: 実機に頼る項目の振り分け 第5回

- 対象: [device-triage.md](./device-triage.md)・[device-triage-reveal.md](./device-triage-reveal.md)・[device-triage-fixes.md](./device-triage-fixes.md)・[device-triage-sources.md](./device-triage-sources.md)、[index.md](./index.md)
- 主の木 `/home/user/yolo-web`、ブランチ `design-rollout`、HEAD b4b8db54
- 照らしたもの: 第4回（[review-triage-4.md](./review-triage-4.md)）と、`git diff e35814cd b4b8db54`。加えて次のもの。
  - 外部: WebKit bug 255708（REST でコメント0〜18をすべて読んだ）・261185（状態）、GA の「Safari (in-app)」の分類、SFSafariViewController の UA
  - コード: `src/lib/reveal.ts` の `visibleRange()`、`QuestionCard.tsx`・`QuizContainer.tsx` の 3章の行番号、`Slider.module.css`、`globals.css` の 241〜244・332〜339行、`default-metadata.js` 26行と `src/lib/site-metadata.ts` の `sharedViewport`

## 判定: 承認

第4回の指摘4件は、すべて閉じた。新しい事実の誤り、理屈の食い違い、行き先の漏れ、ファイルのあいだの食い違いは見つからなかった。device-triage.md は 39,960 バイトで、Read 1回で全236行が返った。経緯の堆積は無い。`tmp/` は、index.md の作業内容1の理由の文（照会の作業ファイルが追われない）にだけ出て、出典としての言及は無い。

## 第4回の指摘の閉じ具合

| 指摘                              | 状態   | 見たこと                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 `svh` の残りの根拠と見張り      | 閉じた | D4 の (iii)・reveal.md 3章・sources・5章・7章の T9・fixes.md の T9 の文が、どれも「見張らずに受け入れる」にそろった。「（4.9%）」は D4 と reveal.md から消えた。sources の bug 255708 の箇条は、コメント0（誤るのは `vh`・`lvh`）・コメント9（2024-07-16、「`99svh` has the correct size」）・コメント17（2025-11-20、663px と 657px、どちらの誤りかを言わない）と、一字ずつ照らして合う |
| 2 D4 の中の残りの数と行き先       | 閉じた | 振り分けの行が「残り（上端と `svh` の実装）」になり、行き先の T9・T10 が「上端は見張る、`svh` の実装は見張らない」になった。7章の T9 の行・5章と合う                                                                                                                                                                                                                                     |
| 3 Android の全体の数              | 閉じた | 1章の表が「Android（OS）30.4%（870）。うち Chrome（mobile）27.7%」になり、D4 の「害と得」が Android 30.4% を使う。870 ÷ 2,862 = 30.4%、1,687 ÷ 2,862 = 58.9%（算術）で、index.md の参考情報と合う                                                                                                                                                                                        |
| 4 index.md の「外部仕様への依存」 | 閉じた | 参考情報に、Pointer Events 3 §8.2・CSS Values 4 の `svh` と WebKit の実装・`:has()` と、一次資料で決まらないことが sources にある、という1行が入った。T5a-3 が `100svh` の読みに頼ることも書かれ、AP-P19 の見直しでここから辿れる                                                                                                                                                        |

## 全体の見直しで確かめたこと（合っていたもの）

- bug 255708 は NEW、最後の変更 2025-12-05。bug 261185 は RESOLVED FIXED、最後の変更 2023-11-13。コメント5は、bug 261185 の直しが iOS 17.4 で出たと書く。sources の書き方と合う。
- reveal.md 3章の「iOS 17.4 より前の Safari では `svh` が大きく読めうるが、今と同じふるまいに戻るだけ」は、`min(visualViewport.height, 小さいビューポートの高さ)` で大きいほうが捨てられることから正しい。D4 の式は `height: 100vh; height: 100svh` で `svh` が効くエンジンでは `vh` を使わないので、bug 255708 の `vh` の誤りが当たらないという読みも正しい。
- GA の「Safari (in-app)」は、iOS のアプリに埋め込まれた WebView（UA に Safari の印が無いもの）を分ける分類である。SFSafariViewController の UA がいまの iOS で Safari と同じかは一次資料で確かめられなかったので、sources の「WKWebView を含むので、この bug が当たる来訪者の割合は分からない」という控えた書き方が正しい。1章の表の「アプリの中の Safari」は GA の分類名の訳で、sources の同じ箇条が「1章の 4.9%」と結んでいるので、読み違えの道は残っていない。
- 3章から消えた「`sharedViewport` は `themeColor` だけを決める」は、消しても事実の文は変わらない（`default-metadata.js` 26行が `width: 'device-width'`、`sharedViewport` は `themeColor` だけ）。
- 3章の行番号（`QuestionCard.tsx` 43〜46・54〜68・105〜115行、`QuizContainer.tsx` 89・98〜119・203行、`Slider.module.css` 59行、`globals.css` 241〜244・332〜339行）は今のコードと合う。`reveal.ts` の `visibleRange()` は今も `visualViewport` の高さを使う。
- 5章の標準誤差は、基線の回数（776・577 と 448・311）から二項の近似で約 3.8 ポイント、56日で約 2.7 ポイントになり、書かれた値と合う。
- 4つのファイルと index.md のあいだで、D4 の式・`visualViewport` が無いときの式・0 以下の扱い・6つの試験・T5a-3 の触るファイル・見張る危険と見張らない危険の分け方（5章・7章の T9・fixes.md の T9 の文）・WebKit の割合（63.6% と約 64%）・iOS と Android の割合（89.3%）は、どれも合っている。

## PM への申し送り（指摘ではない）

- device-triage.md は 39,960 バイトで、40,000 バイトまで 40 バイトしかない。承認のあとにこの文書を直すことがあれば、詳しいことを sources・reveal・fixes に寄せる。
- index.md の「レビュー結果」の表に、振り分けの行（5回、承認、[review-triage.md](./review-triage.md)〜[-5](./review-triage-5.md)）を足す。

## 出典

- [WebKit bug 255708](https://bugs.webkit.org/show_bug.cgi?id=255708)
- [WebKit bug 261185](https://bugs.webkit.org/show_bug.cgi?id=261185)
- [Safari (in-app) as reported by Google Analytics](http://www.jongales.com/blog/2013/02/13/safari-in-app-as-reported-by-google-analytics/)
- [Apple Developer Forums: SFSafariViewController user agent](https://developer.apple.com/forums/thread/12986)
