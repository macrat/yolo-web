# 振り分けを受けて PM が直す所（device-triage.md 6章）

[device-triage.md](./device-triage.md) の振り分けを受けて、ほかの文書を直す場所と、置く文の案である。t5a-design.md・carryover-tasks.md・t5a-measure.md は、振り分けの文書では書き換えていない。PM が振り分けの承認のあとに直す。どの文も案で、PM がまわりの文ごと書き直してよい。

## D1（`touch-action` の範囲）

- **t5a-design.md 4-4 の「`touch-action: manipulation`」の箇条**を、次にする。
  > **`touch-action: manipulation`**: 2打目が拡大にならないよう、診断・クイズのページの中身の全体（`QuizPlayPageLayout` が並べるものを包む箱）に掛ける。2打目は入れ替わった先のどこからでも触れ始め、値は触れが始まった要素の祖先から効くからである。`manipulation` はつまむ拡大を残す（§12 の拡大を妨げない）。扱いは cycle-318/device-triage.md D1。
- **t5a-design.md 4-12 の「解き終えた画面の `touch-action`」の箇条**を消す。解き終えた画面もページの箱が覆う。
- **t5a-design.md 7章**: T5a-4 の行の中身に「ページの中身を包む箱と `touch-action`（4-4）」を、触るファイルに `src/app/play/[slug]/page.module.css` を足す。T5a-6 の行の中身から「`touch-action`」を消す。
- **t5a-design.md 8章「PM が足す行」の1と、carryover-tasks.md の T6 の行**から、「あわせて、解き終えた画面の押す所（「もう一度挑戦する」・保存・共有）に `touch-action: manipulation` を掛ける（…t5a-design.md 4-4）。」の文を消す。
- **backlog**（起こすかを PM が決める）:
  > ゲーム（irodori・kanji-kanaru・yoji-kimeru・nakamawake）のページの中身の全体に `touch-action: manipulation` を掛ける。押した点の下が入れ替わる操作（決定・推測）の2打目が拡大にならないため（cycle-318/device-triage.md D1）。

## D2（hover の線）

- **t5a-design.md 4-2 の「hover」の箇条**の最後の文「iOS の Safari のふるまいは T9 の実機で見る。」を、次にする。
  > iOS の Safari で次の問の行に線が残るかは確かめず、見た目だけの差として受け入れる（cycle-318/device-triage.md D2）。
- **backlog**（起こすかを PM が決める）:
  > サイト全体の hover の線を `@media (hover: hover)` に限るかを決める。指で押したあと、入れ替わった先の行に線が残って選ばれたと読み違えないため（cycle-318/device-triage.md D2）。

## D3（`button` と `span` の字）

- **t5a-design.md 4-4 の「添えた字の要素」の箇条の前**に、次を足す。
  > **答えたあとの字の箱は、ブラウザが `button` に掛ける既定と同じ値を持つ**: `font` の一括指定が戻す値と、字間・語間・字の変形・字下げ（13の宣言。cycle-318/device-triage.md D3）。`Button` と共有する規則には書かない。祖先が字形を決めても、押す前と同じ字で組まれる。
- **t5a-design.md 4-4 の「WebKit の `button` は中に名前の無い箱を…」の箇条**の「T9 の iOS の Safari の実機で確かめる（8章）。」を、次にする。
  > Chromium で計算値と行の一致を測り、WebKit の内側の箱の差は受け入れる（cycle-318/device-triage.md D3）。
- **t5a-design.md 7章の T5a-5 の行**の中身に「答えたあとの字の `span` の既定の値（4-4）」を足す。

## D4（画面の範囲）

- **t5a-design.md 4-5 の「どれだけ」**の「画面（`visualViewport` の範囲）」を、次にする。
  > 画面（`visualViewport` の範囲。下端はツールバーを出した小さいビューポート（`100svh`）より下にしない。cycle-318/device-triage.md D4）
- **t5a-design.md 5章の `frontend-design` スキルの送りの項**に、次の文を足す。
  > 画面の範囲は `visibleRange()` が、`visualViewport` と小さいビューポート（`100svh`）の小さいほうで決める。ツールバーが出ても、見せたものの下が隠れない。
- **t5a-design.md 7章の T5a-3 の行**の触るファイルに、`src/play/games/nakamawake/_components/GameContainer.tsx`・`src/play/games/kanji-kanaru/_components/GameContainer.tsx` を足す（[device-triage-reveal.md](./device-triage-reveal.md)）。

## D5（2打目のずれ）

- **t5a-design.md 4-9 の「100 の出自」**の「T9 で、実機の二度押しの2打目のずれを記録する」を、「T5a-7 が、2打目をずらす走査で近似する（cycle-318/device-triage.md D5）」にする。
- **t5a-design.md 4-9 の診断の答えのあとの箇条**の「150ms より後の2打目が次の問に落ちる数は T9 と 6章 条件7 で記録し」の「T9 と」を「device-triage.md D5 の走査と」にする。
- **t5a-design.md 4-12 の B-620 の箇条**の「T9 で二度打ちを記録し」を、「T5a-7 が条件7 と device-triage.md D5 の走査で二度打ちを記録し」にする。

## D6・D7（VoiceOver）

- **t5a-design.md 4-7** の「VoiceOver が `tabIndex=-1` の行の説明を読むかは T9 の実機で確かめる。」を、次にする。
  > VoiceOver が説明を読むかは確かめずに受け入れ、Chromium のアクセシビリティの木で説明を確かめる（cycle-318/device-triage.md D6）。
- **t5a-design.md 4-2 の「読み上げ」の箇条**の「T9 で VoiceOver の実機で診断の流れを聞く（8章）。」を、次にする。
  > VoiceOver の読み方は確かめずに受け入れ、Chromium のアクセシビリティの木で見出しの名前を確かめる（cycle-318/device-triage.md D7）。

## 文書のあいだの道筋

- **t5a-design.md 1-1 の表**の「iOS の Safari での二度打ち・押した形の見え方・送りを T9 の実機で確かめる」を、「iOS の Safari での二度打ち・押した形の見え方・送りの扱いは cycle-318/device-triage.md に従う」にする。
- **t5a-design.md 6章の冒頭の「測りの共通の決まり」**の最後に、次を足す。
  > cycle-318/device-triage.md 7章の T5a-7 の行が足す測りも、この章の条件に含める。
- **t5a-design.md 8章の「実機に頼る項目」の段落**の最後に、「振り分けの結果と行き先は cycle-318/device-triage.md にある。」を足す。「PM が足す行」の3（T9 の行に足す文）は、下の T9 の行の文に替わる。
- **carryover-tasks.md の T9 の行**の「B-623（知識クイズの最終問のあと「次へ」の2打目が FAQ を開く）は T5a が直す（…）。iOS の Safari の実機で、知識クイズの各問と最終問のあとの「次へ」を二度押しし、FAQ が開かないことを確かめる。」を、次にする。
  > B-623（知識クイズの最終問のあと「次へ」の2打目が FAQ を開く）は T5a が直し（問の区画を低くしない・着地の選び方。t5a-design.md 4-5・4-9）、T5a-7 の二度打ちの測りで閉じる（cycle-318/device-triage.md D9）。
- **carryover-tasks.md の T9 の行**の「新しい回答の画面を二度打ちし（cycle-301 の再現手順）、設問が飛ぶかを記録する（B-620 の判断材料）。あわせて、…を確かめる（t5a-design.md 8章）。」を、次にする。
  > 回答の画面の実機に頼る項目（t5a-design.md 8章）は、cycle-318/device-triage.md の振り分けに従い、実機の確かめは行わない。受け入れた危険（D1 の残り・D2・D3・D4 の上端・D5・D6・D7）を T9 の記録に写す。
