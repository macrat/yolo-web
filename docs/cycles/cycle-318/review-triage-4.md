# レビュー: 実機に頼る項目の振り分け 第4回

- 対象: [device-triage.md](./device-triage.md)・[device-triage-reveal.md](./device-triage-reveal.md)・[device-triage-fixes.md](./device-triage-fixes.md)・[device-triage-sources.md](./device-triage-sources.md)、[index.md](./index.md) の「実施する作業」・作業内容・「検討した他の選択肢」・参考情報
- 主の木 `/home/user/yolo-web`、ブランチ `design-rollout`、HEAD e35814cd
- 照らしたもの: 第3回（[review-triage-3.md](./review-triage-3.md)）と、`git diff 0a6c5915 e35814cd`。加えて次のもの。
  - コード: `src/lib/reveal.ts`（`visibleRange()` を使う所の全部）、`src/components/ResultBox/index.tsx`、nakamawake・kanji-kanaru の `GameContainer.tsx`、道具3本の `revealResult` の行、`StorybookContent.tsx`、`ProgressBar.module.css`、`package.json`（`build` は `next build`、Next 16.3.0）
  - 外部: WebKit bug 261185・255708（REST で状態とコメントをすべて読んだ）、Pointer Events Level 3 の本文、MDN `touch-action`、CSS Values 4・CSS Fonts 4・Core-AAM 1.2 の日付

## 判定: 改善指示

第3回の指摘8件は、すべて閉じた。経緯の堆積は無い。`tmp/` は、index.md の作業内容1の理由の文（照会の作業ファイルが追われない）にだけ出て、出典としての言及は無い。device-triage.md は 39,955 バイトで、Read 1回で全236行が返った。

ただし、第3回の指摘1で足した「`svh` の実装」の残りは、根拠の読みに誤りがあり、そのため見張りの仕組みと合っていない（指摘1）。第3回のレビューの書き方（「アプリの中の Safari（SFSafariViewController。1章の 4.9%）」）が誤りの元で、文書はそれを写している。

## 第3回の指摘の閉じ具合

| 指摘                    | 状態   | 見たこと                                                                                                                                                                                                     |
| ----------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 D4 の `svh` の残り    | 閉じた | D4 の (iii)・reveal.md 3章・sources・5章・7章の T9・fixes.md の T9 の文に入った。2つの bug の状態は書かれたとおり（261185 は RESOLVED FIXED、2023-11-13。255708 は NEW、最後の変更 2025-12-05）。中身は指摘1 |
| 2 sources の組み方      | 閉じた | Turbopack の `next build` の結果に書き換わった。`package.json` の `build` は `next build` で、Next は 16.3.0                                                                                                 |
| 3 根の値の根拠          | 閉じた | D1 の組み方は §8.2 を引き、「（推論）」は消えた。sources の引用は、仕様の本文と一字一句合う。MDN の要約もパンの決まりと分かる書き方になった                                                                  |
| 4 遷移のあとの対        | 閉じた | T5a-7（ii）に、ヘッダのリンクで `/blog` に移ったあとの `auto` が入った                                                                                                                                       |
| 5 `visualViewport` 無し | 閉じた | D4・reveal.md の冒頭と3章・fixes.md のスキルの文・7章の T5a-3 の行が同じ式で、試験の期待する値も書かれた                                                                                                     |
| 6 index.md の Android   | 閉じた | 参考情報に OS 別の数（iOS 1,687・Android 870）が出自とともに入り、89.3% は算術で合う。ただし device-triage.md 1章には無い（指摘3）                                                                           |
| 7 順と作業内容6         | 閉じた | 順の文と「実施する作業」の並びが合い、作業内容6に storybook の見本が入った                                                                                                                                   |
| 8 「PM が足す行」の2    | 閉じた | fixes.md の「文書のあいだの道筋」が、2も T9 の行の文に替わると書く                                                                                                                                           |

## 指摘

### 1. 「`svh` の実装」の残りの根拠が違い、5章の見張りにも届かない（中）

D4 の (iii)・reveal.md 3章・sources は、「アプリの中の Safari（4.9%）では `100svh` がツールバーを出した高さと違いうる」として、bug 255708 を根拠にし、5章で見張ると書く。次の3つが合わない。

- **4.9% は SFSafariViewController ではない（と言えない）**: 1章の「アプリの中の Safari」は GA のブラウザの分類「Safari (in-app)」で、UA に `Safari/` の印が無い iOS の WebKit をまとめたものである。LINE・Instagram・Facebook のアプリの中のブラウザは WKWebView で、これに入る。bug 255708 は SFSafariViewController の不具合で、WKWebView には当たらない。日本の来訪者の 4.9% のうちどれだけが SFSafariViewController かは、GA では分からない。
- **bug 255708 は `svh` の不具合ではない**: 題は「lvh/vh viewport units are incorrectly sized relative to the small viewport」で、誤るのは `vh`・`lvh` である。コメント9（2024-07）は、SFSafariViewController でも「`99svh` has the correct size」と書く。iOS 26.1 のコメント17（2025-11-20）の「`100dvh` が `100svh` より少し大きい（663px と 657px）」は、どちらの単位が誤っているかを言っていない。sources の「`svh` が小さく読める向きで、送りが数 px 増える」は、確かめていない読みである。D4 の式は `svh` が効くエンジンでは `100vh` を使わないので、`vh` の誤りは当たらない。
- **5章の数は、この残りを拾わない**: 5章の終えた率は iOS の Safari（mobile）と Android の Chrome に分けたもので、「Safari (in-app)」は入らない。入れても、4.9% は 28日で `level_start` が数十回にとどまり、線を越えることはない。残る iOS の Safari の側は bug 261185 の古い版（iOS 17.4 より前）で、`svh` が大きく読める向きなので、reveal.md 3章のとおり「今と同じふるまいに戻るだけで悪くならない」。見張っても拾うべき害が無い。

害の大きさから見ても、`svh` が小さく読める場合の害は「送りが数 px 増える」で、D3 と同じく終えた率に出ない。文書自身の決め方（終えた率に出ないものは見張らずに受け入れる）に従えば、この残りは見張らない側に入る。

- 直し:
  - D4 の (iii) の `svh` の箇条を、「`100svh` がツールバーを出した高さに等しいことに頼る。iOS 17.4 より前の Safari では大きく読めうるが、今と同じふるまいに戻るだけである。アプリの中のブラウザ（SFSafariViewController・WKWebView）での値は確かめられない。害は送りの数 px で終えた率に出ないので、見張らずに受け入れる」という中身にする。「（4.9%）」を外す。
  - reveal.md 3章の2つ目の箇条を同じ中身にし、最後の文（「5章で見張る」）を「見張らずに受け入れる」に替える。
  - sources の bug 255708 の箇条を、「誤るのは `vh`・`lvh` で、`svh` はコメント9で正しいとされる。iOS 26.1 の 6px の差は、どちらの単位の誤りかが分からない。GA の「Safari (in-app)」は WKWebView のアプリの中のブラウザを含むので、この bug が当たる来訪者の割合は分からない」にする。
  - 5章の「見張るもの」から「`svh` が誤って読まれる」を外し、「見張らずに受け入れるもの」に D4 の `svh` の残りを足す。
  - 7章の T9 の行と、fixes.md の carryover-tasks.md の T9 の文で、`svh` の残りを「見張る危険」から「見張らずに受け入れた危険」へ移す。

### 2. D4 の中で、残りの数と行き先が食い違う（小）

- D4 の振り分けの行（115行）は「残り（上端）を (iii)」のままで、(iii) の残りが2つある（120行）ことと合わない。
- D4 の行き先の T9・T10（130行）は「上端の扱いを受け入れた危険として記録し、5章で見張る」で、`svh` の残りが無い。7章の T9 の行は `svh` を挙げている。

- 直し: 指摘1を入れたあとの分け方で、振り分けの行（「残り（上端と `svh` の実装）を (iii)」）と、行き先の T9・T10 の文（上端は見張る、`svh` の実装は見張らずに受け入れる）をそろえる。

### 3. Android の全体の数が device-triage.md 1章に無い（小）

index.md の参考情報は、OS 別の Android 30.4%（870）を挙げ、「要約と留保は device-triage.md に写す」と書く。しかし 1章の表には Android の Chrome（mobile）27.7% しか無い。作業内容1は、GA の照会の要約をこの文書に写すと定めている。また、D4 の「害と得」はツールバーが出入りする端末として Android の Chrome 27.7% だけを挙げるが、アドレスバーが出入りするのは Android のほかのブラウザ（Samsung Internet など）も同じである。

- 直し: 1章の表の Android の行を「Android（OS）30.4%（870）。うち Chrome（mobile）27.7%」にする。D4 の「害と得」は Android の 30.4% を使う（「iOS 58.9% と Android 30.4%」）。

### 4. index.md の「外部仕様への依存」が `touch-action` だけを挙げる（小）

計画は、T5a-3 で画面の範囲を `100svh` の読みに頼る形に変える（作業内容6）。この依存（CSS Values 4 の小さいビューポートと、WebKit の `svh` の実装）と、D1 が頼る Pointer Events 3 §8.2 は、参考情報の「外部仕様への依存」に無い。あとのサイクルが外部仕様の変わり目を見直すとき（`docs/anti-patterns/planning.md` の AP-P19）、ここから辿れない。

- 直し: 「外部仕様への依存」に、「振り分けが頼る仕様と、一次資料で決まらないことは device-triage-sources.md にある（`touch-action` の §8.2・`svh`・`:has()` など）」の1行を足す。いまの2つの箇条は残してよい。

## 確かめたこと（合っていたもの）

- `visibleRange()` を使うのは `reveal.ts` の `revealResult`・`revealControl`・`revealFocusedFrame`（144・159行）だけで、面の中の同じ計算は nakamawake 172〜177行と kanji-kanaru 295〜297行の2つだけである。reveal.md 2章の表の行番号（Base64Tile 142・AgeCalculatorTile 119・JsonFormatterTile 129、yoji-kimeru 340・65、nakamawake 258・266、irodori 253・256、kanji-kanaru 290、ResultBox 101・106〜118、`kind` を渡す 195・190・1438・1456）は、どれも今のコードと合う。
- Pointer Events Level 3 は 2026-06-30 の勧告で、§8.2 のパンと拡大の2つの文は sources の引用と同じである。`manipulation` の値の定義（2度の押しの拡大を起こしてはならない）も、D1 の読みと合う。
- MDN `touch-action` は Baseline Widely available で、2019年9月から使える（index.md のとおり）。CSS Values 4 は 2024-03-12 の作業草案、CSS Fonts 4 は 2026-09-13 の作業草案、Core-AAM 1.2 は 2026-09-23 の公開で、sources の日付と合う。
- bug 255708 のコメント5は、bug 261185 の直しが iOS 17.4 で出たと書く。sources の書き方（Apple の文書では確かめていない）のとおりである。
- `ProgressBar.module.css` 26行に `overflow: hidden` がある。
- 4つのファイルと index.md のあいだで、D4 の式・`visualViewport` が無いときの式・0 以下の扱い・6つの試験・T5a-3 の触るファイル・storybook の扱い・作業の順は、どれも合っている。

## PM への依頼

1. planner に、上の 1〜4 をすべて直させる。対象は device-triage.md・device-triage-reveal.md・device-triage-fixes.md・device-triage-sources.md と、index.md の参考情報である。device-triage.md は 39,955 バイトで、40,000 バイトまで 45 バイトしかない。指摘1は D4 の `svh` の箇条を短くできるが、指摘3で足す分と合わせて、上限を越えないよう、ほかの文を締めるか詳しいことを sources・reveal に寄せる。
2. 直したら、もう一度レビューを依頼する。そのときは、今回の指摘だけでなく、文書の全体を見直す範囲にする。

## 出典

- [WebKit bug 261185](https://bugs.webkit.org/show_bug.cgi?id=261185)
- [WebKit bug 255708](https://bugs.webkit.org/show_bug.cgi?id=255708)
- [Pointer Events Level 3 §8.2](https://www.w3.org/TR/pointerevents3/#determining-supported-direct-manipulation-behavior)
- [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)
- [Apple Developer Forums: SFSafariViewController user agent](https://developer.apple.com/forums/thread/12986)
- [google/model-viewer Discussion #1915（SNS のアプリの中のブラウザ）](https://github.com/google/model-viewer/discussions/1915)
