# cycle-319 計画のレビュー（第1回）

- 対象: [index.md](./index.md) の「実施する作業」「作業計画」、`docs/backlog.md` の Active の行（HEAD 62de3571）
- 判定: **改善指示（要修正）**

## 確かめたこと

- 範囲と順: split-plan.md 7 の2行目の順（T5a-5 → T5a-6 → T5a-4 → T5a-7）、t5a-design.md 7章の触るファイル・前に要るもの・「同じファイルは1つずつ触る」と食い違いは無い。T5a-5 と T5a-6 を並べない理由も 7章のとおり。
- T5-3c: 4deae9a7 は `src/play/quiz/_components/QuizPlayPageLayout.tsx` を変えている（FAQ を `phraseFaq` で渡す8行）。「T5a-4 が待つ T5-3c の変更は 4deae9a7 で入っており、順の上では始められる」は正しい。decisions-t5-1.md の「T5-3c の途中の状態」は道具と辞典の詳細の h1 と FAQ の見出しの大きさの話で、T5a-4 の前提に関わらない。T5-3c が最後の指摘のあとレビュー無しで閉じたこと（cycle-316 index.md 104・110行）も T5a-4 の着手を妨げない。
- device-triage.md 7章: T5a-5 に D3・D6、T5a-6 に D1・D9 を渡す書き方は表と合う。
- 担当の起こし方: T5a-5・T5a-6 は担当の木、`docs/cycles/` だけを書く planner と builder は主の木で、コミットは PM。起こす前のコミットと、`git status --short`・`git rev-parse HEAD` を別々の呼び出しで打つことは `.claude/rules/delegation.md` と cycle-318 の補足事項に合う。builder が `docs/cycles/` だけを書くときに主の木で書く形は cycle-318 の計画の 3・4 と同じで、規則の2つ目の箇条（記録だけを書く担当）に当たる。
- backlog の Active の行: 62de3571 で B-754 を Queued から Active に移しただけで、split-plan.md 1 の運用と合う。Queued に重複は無い。
- cycle-318 のレビューの回数: index.md の表では 3＋5＋3＋9＋2＋3＋2＋7＝34回、点検の7回を足すと41回。「計30回を超えた」は記録と合う。
- GA: BigQuery（`analytics_524708437.events_*`、20260922〜20261019、page_view、`/play/<15本の slug>` と末尾の `/` だけ）で数え直した。合計 2,537、iOS 1,358・Android 828・Macintosh 174・Chrome OS 92・Windows 72・Linux 13、character-personality 2,180（85.9%）。どれも計画の数と一致する。

## 指摘

### 1. preventScroll の振り分けの前提が一次資料と合わない（重い）

計画は「Chrome for Android が `focus()` の `preventScroll` を持たないことが分かった」と書き（目的の3段落目・「実施する作業」の1行目・description）、Android の 32.6% を危険の重みに挙げ、crbug について「bug の頁は入らないと読めず、中身は確かめていない」と書く。確かめると次のとおりだった。

- **bug は入らずに読める。** `curl -sS "https://issues.chromium.org/action/issues/41453122"` が本文を JSON で返し、`/opt/pw-browsers/chromium` で頁を開いても全文（コメント16件）が読める。
- **bug の中身は、文字を入れる要素の話である。** 題は「preventScroll of element.focus doesn't work on Chrome/Android」。報告者は「When showing software keyboard, preventScroll option is ignored.」と書いた。#6 で Chromium の開発者が「When the on-screen keyboard appears, we call scroll into view on any focused editable element.」と説明した。#10 で Won't Fix (Obsolete) になった。#16 は「It's not so much about IME as about text input」と書く。#9 によると、Firefox for Android の `version_added: false`（bugzil.la/1544660）も同じ型である。
- **Blink の `focus()` は、Android でも `preventScroll` を見る。** Chromium の main の `third_party/blink/renderer/core/dom/element.cc` を読んだ。`Element::UpdateSelectionOnFocus` は、編集できない要素では `if (!options->preventScroll())` のときだけ `ScrollRectToVisible` を呼ぶ。このファイルに `IS_ANDROID` の分かれは無い。文字盤の側の `WebFrameWidgetImpl::ScrollFocusedEditableElementIntoView`（`core/frame/web_frame_widget_impl.cc`）は、`preventScroll` なら戻り、`!WebElement(element).IsEditable() && !edit_context` でも戻る。
- 設計がフォーカスを置くのは、問の見出し（h2）・押した行（`li`、`tabIndex=-1`）・「はじめる」・結果のボックスで、どれも編集できない要素である。上の一次資料からは、Android の Chrome がこれらで `preventScroll` を無視するとは読めない。MDN の互換性のデータの `false` は、文字を入れる要素で文字盤が出たときの送りを指したものである。

つまり、計画の「分かった」は互換性のデータの印1つを読んだだけで、書いてある事実の裏付けが無い。このまま planner に渡すと、誤った前提が振り分けの文書と次のサイクルに伝わる（AP-WF06）。

直し方の案:

- 目的の3段落目・description・「実施する作業」の1行目・作業内容の1・「検討した他の選択肢」の3つ目・参考の情報の MDN の行を、上の事実に合わせて書き直す。参考の情報には、bug の題・#6・#10・#16 の要旨と、element.cc・web_frame_widget_impl.cc の該当の箇所を書く。
- そのうえで、振り分けのタスクを残すかを PM が決め直す。前提が崩れると、実機に頼る項目は見当たらない。タスクを外すなら、上の確かめを参考の情報に置けば足りる。残すなら、「編集できない要素への `focus({preventScroll:true})` が Android の Chromium で送らないことを、一次資料（上の2ファイルと bug）で確かめて記録する」という小さい形にし、Android の 32.6% を危険の重みとして書かない。どちらを選んでも、作業の順（T5a-5 の前）はそのままでよい。T5a-5 がフォーカスを集める形（4-7）を組む前に終わるからである。

### 2. 「スマートフォンが約86%」が GA の数と合わない（中）

約86%は OS 別の iOS＋Android（1,358＋828＝2,186、86.2%）で、iPad などのタブレットを含む。BigQuery の `device.category` で数えると、mobile 2,064（81.4%）・tablet 122（4.8%）・desktop 351（13.8%）だった。また、cycle-318 の照会は iOS 58.9%＋Android 30.4%＝89.3% なので、「cycle-318 の照会と同じく、スマートフォンが約86%」も合わない。目的の2段落目の「10人のうち8〜9人が、片手の親指で1問ずつ押して進む」のうち「片手の親指」は、どの数にも裏付けが無い推論である。

直し方の案: 「診断のプレイ面の閲覧の 81.4% がスマートフォン（GA の端末の区分 mobile。タブレットを足すと 86.2%）」と書き、cycle-318 の比較は「iOS＋Android は 86.2%（cycle-318 の照会では 89.3%）」と書く。「片手の親指で」は消す。

### 3. T5a-5 の完了の条件が、共有の部品 `Button` の撮り比べを落としている（中）

t5a-design.md 7章の T5a-5 は `src/components/Button/Button.module.css` を触る（`.button` の箱の宣言と `.variantDefault` の下線の3つの宣言を、共有の規則に切り出す。「`Button` の見え方は変えない」）。`.claude/skills/frontend-design/SKILL.md` 124行は、共有の部品の見た目に関わる指定を変えたら「その部品を使うすべてのページを、変える前と後で撮り比べる」と定め、代表の数ページに絞らないこと、`src/` を `grep` して洗い出すこと、幅（320・375・1280px）と文字サイズ（既定・200%）ごとに押したあとの状態も開いて画素で比べることを求める。`from "@/components/Button"` を読み込むのは34ファイルで、道具15本・ゲーム・`ShareButtons`・`CopyButton`・`ListStatus`・storybook などに及ぶ。計画の T5a-5 の撮影は診断の画面だけで、それ以外の画面の撮り比べが無い（AP-WF05）。

直し方の案: T5a-5 の完了の条件に、「`Button` を使うすべてのページを、前（主の木の HEAD）と後（担当の木）で、SKILL.md 124行の幅と文字サイズで画素で比べ、差が0であること（差が出たら記録して原因を直す）」を足す。

### 4. T5a-5 の「フォーカスの試験（4-7 の「試験」）」に T5a-6 の送りが混ざる（軽い）

4-7 の「試験」は、送りの関数が結果の着地の量で呼ばれることと、やり直したあと送りが起きることを含む。着地と送りは T5a-6 が組むので、T5a-5 の時点ではこの部分を満たせない。このままでは、builder が T5a-5 の範囲を読み違えるか、T5a-6 の作りを先取りする。

直し方の案: T5a-5 は 4-7 の「試験」のうちフォーカスの部分を受け持つと書く。マウントのときに何もしないこと、やり直したあとにフォーカスが移ること、150ms のあとに次の問の見出しへ移ること、結果のボックスへ移ることである。送りの関数の呼び方と量は T5a-6 の `QuizContainer.reveal`・`intro` の試験に入れる、と分けて書く。

### 5. T5a-5 の完了の条件に、6章の条件9・10 の静的な確かめが無い（軽い）

4-11 の片付けは T5a-5 の範囲である。6章の条件9（`fadeIn` と `@keyframes` が0）と条件10（`QuestionCard.module.css` に `--radius`・`outline: none`・`.resultPhase` が0）は、`grep` で終わる確かめである。T5a-7 に送ると、T5a-5 のレビューがこれを見ない。

直し方の案: T5a-5 の完了の条件に条件9・10 を足す。どちらも T5a-7 の測りを先取りしない、静的な確かめである。

### 6. backlog の B-624 の行の理由が古い（軽い。依頼の範囲の外）

B-624 の行は「押したボタンがdisabledになるため」と書く。t5a-design.md 1-2 によると、T2 で答えた行はボタンでない字になり、フォーカスは「次へ」へ移るようになった。B-624 は「`preventScroll` で送らないので『次へ』が画面の外だと見えない・読み上げが正誤と解説を飛ばす」という形で残っている。

直し方の案: B-624 の Notes の理由を、t5a-design.md 1-2 の表の B-624 の行に合わせて書き直す。

## アンチパターンとの照合

- AP-P19（外部仕様の一次資料の確かめ）・AP-P16 と AP-WF12（事実を確かめずに書く）: 指摘1。互換性のデータの印1つを「分かった」と書いた。impl_url の bug は読めたのに「読めない」と書いて、中身を確かめなかった。
- AP-P01（根幹の仮定を確かめないまま先へ送る）: 指摘1。確かめていない前提の上に、新しいタスクと Android の 32.6% という危険の重みを置いた。
- AP-WF06（サブエージェントに確かめていない事実を渡す）: 指摘1。作業内容の1は、この前提のまま planner を起こす。
- AP-WF05（すべての画面の撮影）: 指摘3。
- AP-WF12（数の出自）: 指摘2。OS の区分を端末の区分として書いた。

## 次の手順

指摘はすべて計画の文の直しなので、planner に直させ、全体の見直しを含めてもう一度レビューを受けてください。
