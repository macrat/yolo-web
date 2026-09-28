# T5-4 レビュー 4巡目（597d2925・77f8aa4e・2908a72d・8d89f09b と T5-4 の記録）

判定: **改善指示**

対象: [review-t5-4-3.md](./review-t5-4-3.md) の指摘1への対応（index.md 補足事項「T5-4 の所要時間の決定」716cc872 と、builder の 8d89f09b）、指摘2の記録、T5-4 の全体（597d2925・77f8aa4e・2908a72d・8d89f09b、index.md 300〜305 行、t5-design.md と t6-design.md の関わる行）。

## 確かめたこと

- **テストと型**: 8d89f09b を `git archive` で scratchpad に書き出して流した（共有の作業ツリーでは動かしていない。書き出しは消した）。`npx vitest run src/play src/app/play`: 157ファイル・2,279件すべて通過（呼び名を直したあとの `src/play/quiz/__tests__/personality-quiz-faq.test.ts` の「FAQ の問いがクイズをまたいで重ならない」も通る）。`npx tsc --noEmit`: EXIT 0。変更したファイルの `prettier --check` と、新しい2つのテストと `introBadges.ts` の eslint も通過。
- **15本の見積もり**（書き出しで `countReadingChars`・`getEstimatedMinutes` を実行した値。分は切り上げの前）:

  | slug                     | 種別 |  字数 |    分 | 表示  |
  | ------------------------ | ---- | ----: | ----: | ----- |
  | traditional-color        | 診断 |   185 | 0.770 | 約1分 |
  | unexpected-compatibility | 診断 |   310 | 1.020 | 約2分 |
  | impossible-advice        | 診断 |   462 | 1.274 | 約2分 |
  | contrarian-fortune       | 診断 |   483 | 1.366 | 約2分 |
  | yoji-personality         | 診断 |   619 | 1.638 | 約2分 |
  | kanji-level              | 知識 |   793 | 2.086 | 約3分 |
  | character-fortune        | 診断 |   906 | 2.212 | 約3分 |
  | music-personality        | 診断 |   869 | 2.238 | 約3分 |
  | yoji-level               | 知識 | 1,019 | 2.538 | 約3分 |
  | animal-personality       | 診断 | 1,031 | 2.562 | 約3分 |
  | kotowaza-level           | 知識 | 1,272 | 3.044 | 約4分 |
  | word-sense-personality   | 診断 | 1,443 | 3.386 | 約4分 |
  | character-personality    | 診断 | 1,701 | 4.002 | 約5分 |
  | japanese-culture         | 診断 | 1,553 | 4.006 | 約5分 |
  | science-thinking         | 診断 | 2,132 | 5.264 | 約6分 |

- **方針どおりか**: 字数（設問・選択肢、知識クイズは解説も）÷500字/分＋1問3秒を分に切り上げ、`getEstimatedTime(quiz)` が事実の行に出る。FAQ で所要時間を言う9本（animal-personality・character-fortune・character-personality・impossible-advice・japanese-culture・kotowaza-level・science-thinking・word-sense-personality・traditional-color）は、どれも事実の行と同じ値になった。`faq-estimated-time.test.ts` は、答えの中の「約N分」「N〜M分程度」をすべて拾って事実の行の値と比べ、「時間」を尋ねる問いの答えが値を含むことも確かめるので、設問の字を直して値が動けば落ちる。science-thinking の「1問あたり30秒程度」のような値と合わない理由の文も残っていない。題の半角「?」2本（traditional-color・yoji-personality）は全角になり、yoji-personality の `seoTitle` も「例えると？　無料・心理テスト」と §4 の全角アキになった。
- **解説を数えること**: `QuestionCard.tsx` で、解説は `answered && quizType === "knowledge"` のときに、正誤にかかわらず毎問、選択肢の下に出る（`question.explanation` があるとき）。解説を持つのは知識クイズ3本（各10問すべて）だけで、診断で `explanation` を持つ設問は無い。知識クイズの来訪者は毎問の解説を読んでから「次へ」を押すので、解説を読む字に入れるのは実際の流れに合っている。
- **読みの速さの値**: 日本語の黙読は、成人の目安として分速400〜600字、平均500〜600字とされることが多い（大学生の測定で平均653字/分という報告もある）。500字/分はその幅の中で、ゆっくりめの側にある。
- **計算の置き場所**: `QuizContainer` は開始の画面を描くためにもともと `quiz` を丸ごと受け取るクライアントの部品で、新しくブラウザに送るデータは無い。計算は15本とも最大2,000字台の数え上げで軽く、サーバーの描画でも同じ値が HTML に入り、決まった入力から決まった値を返すので、描き直しの食い違いも起きない。サーバーへ移しても来訪者に得が無く、いまの置き場所で妥当。
- **FAQ の呼び名**: 「理系思考タイプ診断」は `shortTitle` と h1 の前半に一致する。「あなたに似たキャラ診断」は h1 そのまま。「日本文化診断」は h1「あなたが極めるべき日本文化診断」の後ろの部分で、カードの `shortTitle`「日本文化適性診断」とも別の物に読めない（どちらにも含まれる語なので、同じ診断の短い呼び名として読める）。どれも h1 と食い違わない。
- **共有の文の「？」**: 題から作るハッシュタグは「#あなたを日本の伝統色に例えると？」になる。X のハッシュタグは「?」でも「？」でも（どちらも語の字でないので）その手前で切れ、「#あなたを日本の伝統色に例えると」がタグになる。変更の前（半角「?」）も同じ所で切れていたので、タグとしての働きと計測は変わらない。題からタグを作ること自体は T5-6 が「題から作らず、ダッシュを含まない語にする」で受け持っている。
- **画面**: 書き出しを dev で動かし、`traditional-color`・`yoji-personality`（375・320）、`character-personality`・`science-thinking`・`japanese-culture`・`kotowaza-level`（375）を撮った。事実の行は上の表の値で、「はじめる」の下端は index.md 300 行の値と同じ（traditional-color 416/533、yoji-personality 416/533、character-personality 372、science-thinking 457、japanese-culture 416、kotowaza-level 372）。全角「？」の h1 は「あなたを日本の／伝統色に例えると？」（375）・「あなたを日本の／伝統色に／例えると？」（320）・「あなたを四字熟語に／例えると？」（375）で、「？」が行頭に来たり語の中で折れたりしない。
- **T5-4 の全体**: 597d2925・77f8aa4e・2908a72d は前回までの見直しから変わっていない（`QuizPlayPageLayout`・`QuizContainer` の開始の段階・関連の部品。前回の review-t5-4-3.md の「T5-4 全体の見直し」のとおり）。8d89f09b で `introBadges.ts` の古い説明（問題数で決める表）は消え、今の決め方と理由だけが書かれていて、経緯の痕跡は無い。

## 指摘事項

### 1. 切り上げが、見積もりの 0.1 秒の差を「1分」の差にして、いちばん来訪者の多い診断を「約5分」と言っている（PM の決定の見直し → builder）

character-personality（プレイ面の PV の 74.87%）の見積もりは **4.002分**、japanese-culture は **4.006分** で、どちらも4分を 0.1〜0.4 秒超えただけで「約5分」になる。unexpected-compatibility は **1.020分**（1.2 秒超え）で「約2分」と、見積もりのほぼ倍を言う。

- 見積もりそのものの幅は、読む速さを 400〜600字/分のどれに置くかだけで ±20% 動く（character-personality で約3.4〜4.9分）。その精度の値を切り上げると、表示は見積もりの誤差ではなく、1字の増減で1分跳ぶ。設問の字を1字でも減らせば「約4分」に戻る値を、来訪者に「約5分」と言っていることになる。
- 「約」はすでに幅を言う語で、そのうえで切り上げると、長い側への寄せを2重に掛けている。500字/分も目安の幅（400〜600、平均500〜600）の遅めの側なので、長い側への寄せはすでに1つ入っている。
- 決定の理由（短く言われて始め、終わらずに離れる人を出さない）はもっともだが、長く言いすぎれば「5分もかかるなら今はいい」と始めない人を出す。いちばん来訪者の多い面で、事実の行は「約2分」から「約5分」に変わる。来訪者に正直な値は、見積もりにいちばん近い値である。

直し方の案: 四捨五入（1未満は1）にすると、character-personality と japanese-culture は「約4分」、unexpected-compatibility は「約1分」、science-thinking は「約5分」になり、表示と見積もりの差はどれも半分の分より小さくなる。切り上げを残すなら、4.002分を「約5分」と言うことがなぜ来訪者に良いのかを、index.md 305 行の決定に書き足す。どちらにしても、FAQ の値とテスト（`getEstimatedMinutes` の「分を少しでも超えたら、次の分に切り上げる」の例）を決定に合わせる。

あわせて、事実の行の値が変わると、character-personality の開始の率（`level_start` ÷ プレイ面の表示）と、終えた率（`level_end` ÷ `level_start`）が動きうる。ADR009 は character-personality の GA を「観測手段と評価窓」で見ているが、この2つの率は入っていない。出荷の前の基線を取れるよう、ADR009 に足すか、足さない理由を index.md に書く（どちらでもよいが、黙って出さない）。

### 2. yoji-personality の開始の画面で、全角にした題のすぐ下の説明が半角の「?」のまま（builder）

yoji-personality の開始の画面（375）では、h1「あなたを四字熟語に例えると？」の2行下に、説明「…四字熟語を判定します。努力家?自由人?リーダー?8タイプの中から1つが決まります。」が出る。同じ画面の中で、題は全角の「？」、説明は半角の「?」でアキも無く、半角の「?」が次の語に詰まって読みにくい。T5-4 が題の「?」を直したことで、この並びが目立つようになった。

ほかの開始の画面の説明も、9本（animal-personality・character-fortune・character-personality・japanese-culture・kanji-level・kotowaza-level・music-personality・word-sense-personality・yoji-level）が半角の「!」で、「診断! イリオモテヤマネコ」「診断! 一字千金」のように半角のアキを挟む。DESIGN.md §4 は「感嘆符・疑問符の後は全角アキ」で、全角の感嘆符・疑問符を前提にしている。説明は T5-4 が組んだ開始の画面の「はじめる」のすぐ下に出る文なので、T5-4 の中で15本の `meta.description` の感嘆符・疑問符を全角にし、文の途中のものの後ろを全角アキにする（文末は要らない）。

### 3. 前回の指摘2（知識クイズの FAQ の半角「?」）が、どこにも記録されていない（PM）

依頼では「T5-3c の行に入れてある」とあるが、HEAD（5ca13eaa）にも作業ツリーにも無い。t5-design.md の T5-3c の行（内容・完了の条件とも）に「?」の語は無く、index.md・backlog.md にも kanji-level・kotowaza-level・yoji-level の FAQ の問いの半角「?」を受け持つ記述は無い。kotowaza-level は 8d89f09b で FAQ の答えを直したのに、その問い「どれくらいの時間で終わりますか?」は半角のまま残っている。

関連して、backlog.md の B-673「疑問符・感嘆符の全角/半角が診断データ全体で混在」は「規範が決まるまで違反か判定できない」として中止になっているが、B-651 が完了して DESIGN.md §4 が決まったので、中止の理由はもう無い。知識クイズの FAQ の問い（12問）、結果のデータ、共有の文（`ResultCard.tsx` の「でした!」）など、指摘2の範囲より外の半角の感嘆符・疑問符も含めて、受け持つタスクの行か backlog の新しい項目に書く（指摘2で T5-4 の中で直す開始の画面の説明は除く）。

### 4. 小さなもの（builder・PM）

- `faq-estimated-time.test.ts` の `expect(quizzes).toHaveLength(15)` は、診断を1本足しただけで、所要時間と関わりなく落ちる。読み込みが空でないことを確かめたいなら、`registry` の本数と一致するか、1本以上あるかを見る形にする（builder）。
- index.md 305 行の「1問の字数が 23〜107字と違う」は、実際の値と合わない。1問あたりの字数（設問と選択肢）は traditional-color の約23字から word-sense-personality の約144字・character-personality の約142字まであり、107字は science-thinking の値。決定の根拠の数字なので直す（PM）。

## 次の手順

1. 指摘1は、PM が丸め方を決め直して index.md に書き、builder に `introBadges.ts`・テスト・FAQ の値を合わせさせる（ADR009 への観測の追加か、追加しない理由も PM が書く）。指摘2と指摘4の1つ目は builder に直させる。指摘3と指摘4の2つ目は PM が記録する。
2. もう一度レビューを依頼する。そのときは、今回の指摘だけでなく T5-4 の全体を見直す。

## 参照

- [読書速度の平均は分速何文字？日本人のデータと自分の速さを知る方法 | 速読マガジン](https://speed-reading.jp/2026/03/27/average-reading-speed-japanese/)
- [速読の理論 あなたの読書スピードと、日本人平均値の関係 | SP速読学院](https://www.pc-sokudoku.co.jp/kouza/kokugo/kyohon29.html)
