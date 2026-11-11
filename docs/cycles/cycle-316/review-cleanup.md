# レビュー: ゲームで共有する部品の片付け（2a1b03a・14c3fc6）

対象: 2a1b03a（ダイアログのためだけの部品と h1 の印を消し、`revealControl` を `src/lib/reveal.ts` へ移し、イロドリも離れるときに取り置きを外す）と 14c3fc6（ダイアログの CSS と、`copyText` の `container` の引数を消す）。依頼の元は index.md の「ゲームで共有する部品」の行。

## 確かめたこと

### 1. 残骸の網羅 grep（AP-I13）

作業ツリーと `HEAD` の両方で、次の語をまとめて grep した（`src`・`docs/*.md`・`docs/knowledge`・`docs/anti-patterns`・`DESIGN.md`・`.claude`。cycle 文書・ADR・ブログ記事の本文は除く）。

`dialog|ダイアログ|モーダル|showModal|backdrop|scroll-lock|GAME_TITLE|gameTitle|CountdownTimer|countdown|GameDialog|useDialog|revealControl|shared/_lib/revealControl|VIEWPORT_BOTTOM_GAP|tabIndex={-1}|restoreFocus|returnFocus|parentElement|container`（`container` は `copyText` の呼び出しと ShareButtons に絞って読んだ）

ヒントの判定:

- `revealControl`: 呼び出しは5箇所（kanji-kanaru・yoji-kimeru の GameContainer と GameResult・nakamawake 2箇所・irodori 2箇所）で、どれも `@/lib/reveal` から読む。テストのモックも `@/lib/reveal` に揃っている。旧パスを指すものは無い。→ 残骸なし
- `tabIndex={-1}`: ResultBox・ListStatus・SiteFrame の main・Slider・クイズの QuestionCard・yoji-kimeru の GameResult の意味の区画。どれも別の機能（結果や見出しへのフォーカスの移し先）。→ 偽陽性
- `モーダル`: `StorybookContent.tsx:509`（DESIGN の角丸の説明の一語）と 2026-02-22 のブログ記事。ブログ記事は当時の記録なので対象外。Storybook の一語は角丸 0px の適用範囲の例示で、ゲームの部品の残骸ではない。→ 偽陽性
- `overflow: hidden`・`parentElement`・`NextPuzzleTime`/`nextPuzzleTime`: どれも別の機能（CountdownTimer の後継の NextPuzzleTime を含む）。→ 偽陽性
- `dialog`・`ダイアログ`・`GAME_TITLE`・`gameTitle`・`CountdownTimer`・`GameDialog`・`useDialog`・`showModal`: `src` の本体・docs・DESIGN.md・SKILL.md に0件。→ 残骸なし
- `copyText(`: 呼び出しはすべて引数1つ。`tsc --noEmit` も通る。→ 残骸なし
- CrossCategoryBanner・crossCategoryItems のコメントは、ダイアログの前提を外した言い方に書き直されていて、経緯の跡は無い。

### 2. `revealControl` の振る舞い（前と後の実測）

前（a9c5981 = 2a1b03a の親）と後（4bd0e43。2つのコミットを含む）を、それぞれ4つのゲームと base64 だけを残した本番ビルドにし、同じ手順で比べた（worktree は1つずつ作って消した。スクリプトは `tmp/cycle-316/review-cleanup/`）。`window.scrollBy` を包んで、1操作ごとに送った量と `scrollY` を記録した。

- 手順: キーボードだけで遊ぶ。漢字カナール・四字キメルは6回外して終える。ナカマワケは語を Space で選び、チェックを Enter で押す（4回外して終える）。イロドリは明度を PageUp、決定・次の問題へを Enter で5問。
- 型: 自然に遊ぶ型と、各操作の前にフォーカスを置いたまま画面を先頭へ戻し、次に使うコントロールを画面の外に出す型（`revealControl` が必ず働く）の2つ。
- 幅: 320（高さ 568）と 1280（高さ 800）。それぞれ2回。

結果: 4ゲーム × 2幅 × 2型 × 2回 = 32 通りのすべてで、各操作の送った量（小数第2位まで）と `scrollY` の並びが前と後で完全に一致した。`revealControl` が働いた回数の例: 先頭へ戻す型の 320px で、漢字カナール 6回、四字キメル 7回（終えたときの GameResult の送りを含む）、ナカマワケ 7回（4つ目を選んだときと、チェックのあと）、イロドリ 8回。1280px では、漢字カナール 2回、四字キメル 4回、ナカマワケとイロドリは画面に収まるので 0回（前も 0回）。

コードの読みでも、旧実装の「距離が0なら送らない」は `scrollInstantly` が受け持ち、丸めをしない点も同じ。新しいテストの「端数の距離を丸めずに送る」がそれを押さえている。

### 3. クリップボードの API を拒まれたときのコピー

`navigator.clipboard.writeText` を必ず reject させて確かめた。

- 4つのゲームの結果の区画の中の「結果をコピー」（ShareButtons）: 32 通りのすべてで「コピーしました」が出て、`copy` のときに選ばれていた文は結果の文そのもの（漢字カナール 121 字・四字キメル 106 字・ナカマワケ 81 字・イロドリ 91 字）。写す欄は前は押したボタンの並び（DIV）、後は body に置かれ、どちらでも写せた。押したあとの `scrollY` の動きは 0、フォーカスは押したボタンに戻り、body に textarea は残らない。
- base64 の CopyButton（320・1280）: 前も後も「コピー」→「コピー済み」になり、写した文は `44GT44KT44Gr44Gh44Gv`（「こんにちは」の Base64）。

### 4. 描画と console

4つのゲームは、初めての来訪（何も無い状態から遊び終えるまで）と、遊び終えたあとの開き直し（reload）の両方で、結果と共有の区画を出した。開き直したときの位置も前と後で同じ。console の誤りと pageerror は、ページを絞ったビルドで消した道（`/blog`・`/dictionary`・`/play/daily` などの RSC の先読み）の 404 だけで、前と後で同じ。それを除くと0件。

### 5. テスト

- `npx vitest run src/lib src/play/games src/components/ShareButtons src/components/CopyButton src/test/design-gate.test.ts`: 78 ファイル・1093 件がすべて通る。`tsc --noEmit` も通る。
- 移した `revealControl` のテストは、旧テストの10件（visualViewport あり・なし、ちょうど下端、上へ出たとき、context の3通り）をすべて引き継ぎ、端数の1件を足している。旧テストの「innerHeight を画面の下端にする」は、ファイルの先頭で visualViewport を外し innerHeight を与える形で、ほかの各テストが押さえている。
- イロドリの「離れるときに取り置きを外す」は、style を置いて unmount すると消えることを確かめるテストが付いていて、ほかの3本と同じ形。
- 消したテスト（GameDialog・useDialog・GameLayout の h1 の印・globals.css の dialog・`copyText` の置く所・ShareButtons の置く所）は、どれも消した機能だけを確かめていたもので、残る機能の穴にはならない。ShareButtons の拒まれたときのテストは残り、`execCommand("copy")` と知らせを確かめている。

## 指摘

### Critical

なし。

### Major

なし。

### Minor

**m-1. `src/test/design-gate.test.ts` の ALLOWLIST に、どのファイルにも無い宣言を許す行が10件残っている。**
このコミットは ALLOWLIST から消したファイル（ResultModal・HowToPlayModal・StatsModal・旧スピナー）の行を消したが、残った「ゲームの駒・結果の色見本など、中身に和色（--wairo-\*）を敷く宣言」の10件（KanjiKanaru.module.css の3件・SolvedGroups.module.css の4件・YojiKimeru.module.css の3件）も、いまのファイルには `--wairo` の宣言が1つも無い（`git grep wairo HEAD -- src/play/games` は0件。`cellClose`・`legendChipClose`・`cellPresent`・`distributionBarHighlight` も design-gate の外に0件）。四字キメルの行の上の「cellCorrect/legendChipCorrect は…」という注釈も、もう無いセレクタを説明している。index.md は「和色を許す行は T4-19 で片付ける」としているが、同じ一覧の同じ種類の死んだ行を半分だけ消した状態は、読む人に「この宣言はまだある」と思わせる（AP-I13 の (3)、CLAUDE.md のツギハギ禁止）。消すのは10件の行と2つの注釈だけで、T4-19 を待つ理由が無い。ここで消すか、少なくとも T4-19 の記述に「このコミットのあと残った10件」と明記する。前者を勧める。

**m-2. `.claude/skills/frontend-design/SKILL.md:107` が、`src/lib/reveal.ts` に移った `revealControl` を挙げていない。**
この行は「操作のあとの送り（§8）は `src/lib/reveal.ts` の関数で組み、面ごとに書かない」として `revealResult` と ResultBox の送りを挙げるが、DESIGN.md §8（401行目）の「次に使うコントロールが画面の外に出たら、それが画面に入るまで送る」にあたる `revealControl` が抜けている。ゲームの中に閉じていたときは挙げない理由があったが、共有の `src/lib` に移したいま、次に推測の盤や選ぶ操作を作る builder が面ごとに送りを書く入口になる。`revealControl(control, context?)` の使いどころ（次に使うコントロールと、一緒に見せたいもの）を1文足す。

**m-3. `src/play/games/_components/new/` と `src/play/games/shared/_components/new/` の `new` が、終わった移行の名残になっている。**
このコミットで `shared/_components` の直下の `useDialog.ts` が消え、`shared/_components` は `new/` だけ、`_components` も `new/` だけになった。「新しい」と対になる古いものがもう無いので、名前が移行の途中だった経緯だけを伝える（ツギハギ禁止の「経緯の跡」）。`src/dictionary/_components/new/` も同じ形なので、ゲームの2つだけを動かすか、辞典と合わせて T5 以降の片付けに回すかを PM が決め、回すならキャリーオーバーと backlog に載せる。

## アンチパターンの確認（docs/anti-patterns/implementation.md）

- AP-I01（来訪者の体験で見たか）: 来訪者から見える変化は無いはずの片付けなので、見える振る舞い（送りの量・位置・コピーの成否と知らせ・開き直し）を前と後で数値で比べ、変わっていないことを確かめた。該当なし。
- AP-I02（場当たりの回避）: `container` の引数は、ダイアログという原因ごと無くなったので外すのが根本の形。該当なし。
- AP-I03（バンドル・Core Vitals）: 部品を消しただけで増えるものは無い。開き直しの位置も同じ。該当なし。
- AP-I04（指標の直接最適化）: 該当なし。
- AP-I05（目的に無関係な追加）: 足したものはイロドリの取り置きの外しと、移したテストだけ。該当なし。
- AP-I06（反対の極端）: 該当なし。
- AP-I07（jsdom で見えない挙動）: 送りとコピーを本番ビルドの Chromium で確かめた。該当なし。
- AP-I08（DESIGN.md に無い表現）: 見た目の追加は無い。`body:has(dialog[open]) { overflow: hidden }` を消したが、`dialog` はサイトのどこにも無い（`src` に0件）。該当なし。
- AP-I09（コミットの順序）: 2a1b03a は呼び出しの移し替えと消去を同じコミットで行い、14c3fc6 は `copyText` の引数と唯一の呼び出し元を同じコミットで変えている。中間でも型が通る。該当なし。
- AP-I10（@keyframes の参照）: 該当なし。
- AP-I11（タイマーの後始末）: CountdownTimer を消し、残る NextPuzzleTime のタイマーの後始末はそのテストが確かめている。イロドリの unmount の後始末が足された。該当なし。
- AP-I13（撤去の網羅 grep）: 上の「1.」のとおり網羅 grep を通した。部品の残骸は無いが、design-gate の ALLOWLIST に死んだ行が残る（m-1）。**該当あり（m-1）**。
- AP-I14（共有の部品の見た目の変更）: ShareButtons と `copyText` は共有の部品だが、見た目は変えていない。使う面のうちゲームの4本と CopyButton の base64 で、拒まれたときのコピーを確かめた。ブログや診断の ShareButtons は同じ関数を通り、置く所が body に戻っただけ（ダイアログの外なので前から body で写せる形）。該当なし。

## 作業の進め方（docs/anti-patterns/workflow.md）

- AP-WF01（最後の修正のあとのレビュー）: このレビューがそれにあたる。m-1〜m-3 を直したら、もう一度レビューを受ける。
- AP-WF05（UI の変更の撮影）: 見た目の変更は無く、振る舞いは数値で前後を比べた。
- AP-WF09（形式的な通過）: 各項目を実測か grep の結果で判断した。
- AP-WF13（スコープ越え）: 2つのコミットは index.md の片付けの範囲に収まる。イロドリの取り置きの外しは、ほかの3本とそろえる小さな直しで、テストが付いている。
- その他の項目: 該当する作業は無い。

## 判定

**改善指示**。Critical・Major はなく、`revealControl` の振る舞い、拒まれたときのコピー、4つのゲームの描画は前と変わらないことを実測で確かめた。ただし Minor が3件ある（m-1 死んだ ALLOWLIST の行、m-2 SKILL.md の送りの一覧の抜け、m-3 `new/` の名残の扱い）。builder に m-1・m-2 を直させ（m-3 は PM が決めて、直すか記録する）、指摘の箇所だけでなく全体を見直すレビューをもう一度受けること。
