# T5-4 レビュー 5巡目（b1c966c2 と T5-4 の全体）

判定: **改善指示**

対象: [review-t5-4-4.md](./review-t5-4-4.md) の指摘への対応（index.md 補足「T5-4 の所要時間の決定」と「約物の全角化のタイプ名の判断」、ADR009 の「診断の開始と終えた率」、builder の b1c966c2）と、T5-4 の全体（597d2925・77f8aa4e・2908a72d・8d89f09b・b1c966c2 と記録）。

## 確かめたこと

- **書き出しでの検査**: HEAD（2aa5e7df）を scratchpad に `git archive` で書き出し、`node_modules` は `cp -al`。`npm run build` は EXIT 0。`npx vitest run src/play src/app/play src/components/ShareButtons` は 159ファイル・2,330件すべて通過、`npx tsc --noEmit` は EXIT 0、`src/play/quiz/data/*.ts` の `prettier --check` と新しい試験・`introBadges.ts` の eslint も通過。`next start` は自分の PID だけを止め、書き出しは消した。
- **丸め（指摘1）**: `Math.max(1, Math.round(seconds / 60))` で、決定（四捨五入・1分未満は1分）どおり。前回の表の値で、character-personality 4.002分・japanese-culture 4.006分は「約4分」、unexpected-compatibility 1.020分は「約1分」、science-thinking 5.264分は「約5分」になり、表示と見積もりの差はどれも半分の分より小さい。試験の例（2.5分→3、4.002分→4、1分未満→1）も決定に合い、`introBadges.ts` の説明は今の決め方と理由だけで、経緯の痕跡は無い。`faq-estimated-time.test.ts` は `toHaveLength(15)` をやめ、FAQ の値が事実の行と同じことを通る試験で確かめている。ADR009 の「診断の開始と終えた率」は `level_start`・`level_end`（`src/lib/analytics.ts` が送る名前）で書かれ、「約2分から約4分」も四捨五入の値と合う。
- **全角アキの規則（指摘2）と §4**: `src/play/quiz/data` の21ファイルの「？」「！」の直後の字を全部数えた。全角アキ 117、文字列の終わり 247、閉じ括弧 301 で、それ以外（句読点・約物の連なり・その他の字）は0。§4 の「感嘆符・疑問符の後は全角アキ」に対し、閉じ括弧の前（「「大丈夫？」と」）・文字列の終わりに置かないのは、JIS X 4051 の組み方どおりで正しい。鉤括弧の中の文の途中（「「大丈夫？　少し休む？」」「「お化け屋敷やろう！　俺が脅かし役やる！」」）にはアキが入り、半角空白を挟んでいた「診断! イリオモテヤマネコ」も「診断！　イリオモテヤマネコ」になった。「！？」の連なりはデータに無く、試験は連なりの中にアキを求めない。開始の画面の説明（yoji-personality「努力家？　自由人？　リーダー？　8タイプ」）も直った。タイプ名2つの全角化は PM の判断の記録どおり。
- **punctuation-width.test.ts は意味のある試験か**: 書き出しで yoji-personality の「努力家？　」を「努力家?」に変えると「半角の「?」「!」を持たない」が落ち、「努力家？」（アキを消す）に変えると「文の途中の「？」「！」の後ろは全角アキ」が落ちた（戻すと通る）。さらに、データのファイルの文字列リテラルのうち「？」「！」を含むものが、試験の集める文字列（3,620本）にすべて入っていることを確かめた（エクスポートされない表からしか届かない文字列の取りこぼしは0）。
- **X の文字数とタグ**: twitter-text 3（X の公式の数え方のライブラリ）で、相性の共有の文の全組み合わせと結果の共有の文を URL 付きで数え、最長は 269（character-personality の同じタイプどうしの相性。280 以内）で builder の報告と一致した。`extractHashtags` は「でした！　#言葉の感覚診断 #yolosnet」から `言葉の感覚診断`・`yolosnet` を、「#あなたを日本の伝統色に例えると？ #yolosnet」から `あなたを日本の伝統色に例えると`・`yolosnet` を取り出す。twitter-text のタグの前の境（`hashtagBoundary`）は「行頭か、タグの字（`hashtagAlphaNumeric`: 字・数字と `hashtagSpecialChars` の限られた字）でも `&` でもない字」で、U+3000 はどちらにも入らないので、全角アキの後ろの「#」はタグとして働く（前の半角空白と同じ）。
- **折れ（320・375 の既定と 200%）**: `next start` の書き出しを Chromium（/opt/pw-browsers）で開き、15本すべてについて、開始の画面・全設問（知識クイズは解説の出た状態も）・解き終えた画面の「？」「！」を含む字の並びを1字ずつの位置で行に分け、行頭の全角アキと「？」「！」だけの行を数えた。行頭の全角アキは4つの条件のどれでも0（「！」「？」と全角アキのあいだは行分割の規則で折れず、アキは前の行の終わりに付く）。撮った画面（`t55-*.png`）でも、設問「急に予定が変わった！／あなたの最初の／リアクションは？」（320）、「すごく嬉しいことがあった！／最初のリアクションは？」（375）、選択肢「「お化け屋敷やろう！　俺が脅かし／役やる！」」（320）、yoji-personality の説明（320・375・200%）で、見苦しい折れは無い。「？」だけの行は、h1 の 200%（「例えると／？」「科学者型／？」。§4 が 200% で受け入れる文節の中の折れ）と、FAQ の問い（下の「補足」）だけだった。本文の説明の 320px で「リーダ／ー？　8タイプ」、200% で「リ／ーダー？」と長音符が行頭に来るが、本文は §4 の「通常の禁則処理で折る」側で、規則の範囲にある。
- **T5-4 の全体**: 597d2925・77f8aa4e・2908a72d・8d89f09b は前回までの見直しから変わっていない。「はじめる」の位置は b1c966c2 で動かない（変わったのは約物の幅とアキで、事実の行・一文・ボタンの高さは同じ）。結果のページ10本の共有の文は t5-design.md の T5-6 の行に、規則・直した後の形・試験の置き方まで書かれている。

## 指摘事項

### 1. 解き終えた画面の招待の文が半角の「!」のまま（builder）

決定は「診断のデータと**共有の文**の疑問符・感嘆符を全角に」で、b1c966c2 は `ResultCard`・`CompatibilitySection`・`FudaActions` の結果の共有の文を直した。しかし同じ解き終えた画面で友達に送る招待の文（`InviteFriendButton` の `inviteText`。`navigator.share` の title か、コピーでそのまま相手に渡る）が、次の6か所で半角の「!」のまま残っている。

- `src/play/quiz/_components/ResultCard.tsx` 226・238 行「日本の固有種診断で相性を調べよう!」（b1c966c2 が「でした！」に直した同じファイル）
- `src/play/quiz/_components/CharacterPersonalityContent.tsx` 26 行「似たキャラ診断で相性を調べよう!」（PV の 74.87% の character-personality の解き終えた画面）
- `MusicPersonalityContent.tsx` 72・83 行、`JapaneseCultureResultExtra.tsx` 67・78 行、`CharacterFortuneResultExtra.tsx` 67・78 行、`ScienceThinkingResultExtra.tsx` 27 行

同じ画面の2つの共有の文で「でした！」と「調べよう!」が混ざり、受け取った人の画面でも約物がそろわない。どれも文末の「!」なので、全角にするだけでよい（アキは要らない）。部品の試験がこの文を見ているなら合わせる。`src/app/play/character-personality/result/[resultId]/page.tsx` 32 行の `INVITE_TEXT` は結果のページなので、指摘2で T5-6 に渡す。

### 2. 約物の残りに受け持ちが無く、B-673 が古い理由で中止のまま（PM）

前回の指摘3は「指摘2の範囲より外の半角の感嘆符・疑問符も、受け持つタスクの行か backlog の新しい項目に書く」だった。PM は範囲を広げて T5-4 で `src/play/quiz/data` と共有の文を直す決定にし、これはよいが、決定の外に残るものに受け持ちが無い。backlog.md の B-673 も「規範が決まるまで違反か判定できない」の理由のまま【中止】で、index.md の「B-673 が待っていた規範は §4 で決まった」と食い違っている。

残っているもの（`src` の、和文に続く半角の「?」「!」を ripgrep で拾った）:

- 結果のページの見える文: `ctaText`「あなたはどのタイプ? 診断してみよう」ほか（`src/app/play/{[slug],animal-personality,music-personality,traditional-color,character-personality,character-fortune,yoji-personality}/result/[resultId]/page.tsx`）と、character-personality の結果のページの `INVITE_TEXT`。T5-6 の行は共有の文だけを挙げているので、この2つを T5-6 の行に足す。
- 診断の外: `src/play/registry.ts`（今日のユーモア運勢の説明「どんな形?」）、`src/play/games/registry.ts`（「推理しよう!」など4本。一覧とゲームの説明に出る）、`src/humor-dict/data.ts`、`src/data/yoji-data.json`。
- 三点リーダ: §4 は「……」だが、`src/play/quiz/data` に「...」が80か所ある（「ーん...ちなみに」「逆から考えると...」など）。

B-673 を、決まった規範とこの残りの範囲で書き直して起こす（または新しい項目にして B-673 の理由を直す）。ゲーム・運勢・辞典のものをこのサイクルの面のタスク（T5-19・T5-20 など）に入れるか backlog に回すかは PM が決めてよいが、どこにも書かれていない状態は残さない。

## 補足（指摘ではない）

- FAQ の問いが「？」を全角にしたことで、1つの文節として組まれている間（T5-3c の前）は、375px の既定で「音楽性格タイプは何種類ありますか／？」「回答を変えると結果も変わりますか／？」、320px で「占いとして信頼できますか／？」「診断は何問で終わりますか／？」のように「？」だけの行が出る（半角の「?」では幅が足りて入っていたものがある）。index.md の T5-3b の決定 (5) が受け入れた途中の状態（行頭の約物・1字の行）と同じ種類で、T5-3c が文節の並びで渡せば消え、T5-26 が数える。T5-3c の完了のときに、この4本が直ったことを撮って確かめる。

## 次の手順

1. 指摘1は builder に直させる。指摘2は PM が t5-design.md の T5-6 の行と backlog.md（B-673）に書く。
2. もう一度レビューを依頼する。そのときは、今回の指摘だけでなく T5-4 の全体を見直す。

## 参照

- [twitter-text `hashtagBoundary.js`](https://github.com/twitter/twitter-text/blob/master/js/src/regexp/hashtagBoundary.js)・[`hashtagSpecialChars.js`](https://github.com/twitter/twitter-text/blob/master/js/src/regexp/hashtagSpecialChars.js)・[`validHashtag.js`](https://github.com/twitter/twitter-text/blob/master/js/src/regexp/validHashtag.js)
- [JIS X 4051 に基づく日本語組版の要件（W3C JLReq）](https://www.w3.org/TR/jlreq/)
