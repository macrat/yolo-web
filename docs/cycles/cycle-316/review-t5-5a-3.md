# T5-5a の第3回レビュー（0d946b90・24a26d7d・10ab73f3）

判定: **改善指示**

対象: T5-5a の全体。0d946b90（本体）・24a26d7d（第1回の直し）・10ab73f3（review-t5-5a-2.md の指摘 1・2 と、`?with=` の相性の共有リンクの直し）。あわせて f226f5ab・7a23313c の記録（t5-design.md の T5-5a・T5-5b の行、index.md の T5-5a の判断と `?with=` の件）。

見た資料: review-t5-5a.md・review-t5-5a-2.md、t5-design.md（10-2 の T5-5a・T5-5b の行、5-c、457 行の相性の置き場所）、index.md、アンチパターン集（implementation・workflow）、builder の画像 `tmp/screenshots/t55a-with/`（`result-*`・`clip-*`・`flow-*`）。

## 確かめたこと

- HEAD（0cfb3a8a。10ab73f3 のあとは記録と別タスクのコミットだけ）を scratchpad に書き出して確かめた。`npx vitest run src/play src/app/play` は 157 ファイル・2,291 件すべて通る（builder の言う yoji-kimeru の1件は、この時点では通った）。`npm run build` は通る。自分のサーバーを起こし、下の題・robots・canonical を実物で読んだあと、PID で止めて書き出しを消した。
- 指摘 1（`CompatibilityDisplay` の置き場所）: `src/play/quiz/_components/CompatibilityDisplay.tsx` と試験が `CompatibilitySection` の隣に移り、`[slug]` のディレクトリには相性の部品が残っていない。使う5本（animal・character-personality・music・character-fortune・`[slug]`）の import はすべて新しい場所を読む。
- 指摘 2（character-fortune の誘い）: リンク先は `/play/character-fortune?ref=${resultId}` になり、誤った注記「searchParams処理不要」は消えた。`clip-result-cf-with-375.png` で、読みもの → 相性 → 「お前と相性がいいのは誰だ?…」→「診断して相性を見てみる」→ すべてのタイプ（6）の順で、同じ行き先のリンクは続かない。
- `?with=` の相性（範囲外として挙げた件）: 実物で次を確かめた。5本の規則はそろっている。
  - `/play/japanese-culture/result/sado?with=shodo`: 題「茶道タイプ——… x 書道タイプ——… - 静寂の求道者」、`noindex, follow`、canonical は `/result/sado`。
  - `/play/japanese-culture/result/sado?with=zzz`: 相性を出さず、題はタイプのページと同じ。
  - `/play/character-fortune/result/commander?with=professor`: 題「… x … - 行動力と知識の核融合」、`noindex, follow`、canonical は `/result/commander`。`?with=` 無しは `index, follow`。
  - animal（`nihon-zaru?with=hondo-tanuki`）と music（正しくない `?with=` は無視して `index, follow`）も同じ形。japanese-culture は詳しい読みものを持たないので、`?with=` 無しでも `noindex` で、これは前からの規則（詳しい読みものを持つタイプだけ載せる）のまま。
  - 相性の表は character-fortune が 6 タイプで 21 組、japanese-culture が 7 タイプで 28 組で、同じタイプどうしも含めて欠けが無い。正しい2つのタイプなら必ず相性が出る。
- 受け取った人の流れ（`flow-jc-*`・`flow-cf-*`）: 解き終えた画面の相性の区画の共有のリンクを開くと、結果のページに同じ相性の名前と説明が出る。共有の文の「相性は「…」でした!」の約束は果たされるようになった。
- `ResultPageShell` の変更（ルートが中身を渡したときに「このタイプについて」を置き、すべてのタイプは詳しい読みものを持つときだけ）: 専用のルート9本はすべて詳しい読みものが無いと `notFound()` するので、変更で見え方が変わるのは `[slug]` だけである（AP-I14）。`[slug]` は「詳しい読みものか相性のどちらかがあるとき」だけ中身を渡すので、空のセクションは出ない。japanese-culture の `?with=` のページで「このタイプについて」の中身が相性だけになる形は、t5-design.md 457 行の「相性の区画は読みもののセクションの最後の小見出し」に従った結果で、h3 を h2 のない所に置くより見出しの段が正しい。見出しの言い方が相性だけの中身に合うかは、下の指摘 4 で T7 に渡す。
- `[slug]` に相性の対応表（`COMPATIBILITY_BY_SLUG`）を置く形: 妥当と判断する。japanese-culture は variant の読みものを持たず、専用のルートを作ると `[slug]` の題・読みもの・誘いを丸ごと写すことになり、ずれの元になる。表にしておけば、`[slug]` が描く診断に相性の共有を足すときも1行で済む。専用の4本はそれぞれ自分のデータを直に読む形で、`[slug]` だけが表を持つのは「描く診断が1つか複数か」の違いに沿っている。ただし表の説明の文に誤りがある（指摘 3）。

## 指摘

### 1. japanese-culture の `?with=` のページで、「このタイプについて」のすぐ下に細い罫線が出る【builder】

`clip-result-jc-with-375.png`・`clip-result-jc-with-1280.png`・`result-jc-with-375-dark.png` で、h2「このタイプについて」の直下に `CompatibilitySection` の上の罫線（`.section` の `border-top` と `margin-top: 32px`）が出ている。詳しい読みものがあるページでは、セクションの見出しのすぐ下の小見出しは線を持たない（`ResultReading.module.css` の `.sectionHeading + .reading > .heading:first-child`。DESIGN.md §5 の「見出しがすでに切れ目なので線を持たない」）。相性がセクションの最初に来るのはこのページだけなので、ここだけ見出しの下に線が二重の区切りとして残り、ほかの結果のページと区切りの規則が食い違う。

- 相性の区画がセクションの最初に来たときも、読みものの最初の小見出しと同じく線と上の余白を持たないようにする。どの部品で持つかは builder が決めてよいが、`[slug]` の page だけの例外の指定で消すのではなく、「セクションの見出しのすぐ下の区画は線を持たない」という1つの規則として置く。
- 直したあと、japanese-culture の `?with=` のページ（375・1280・375 ダーク）と、相性が読みもののあとに来るページ（character-fortune・animal の `?with=`）の両方を撮って、後者の線が残ることも確かめる。

### 2. 読みもののあとの誘いの上の余白が、5本の結果のページで2通りある【builder】

builder の気づき（character-fortune の相性の誘いの上が 32、animal が 24）を確かめた。読みもの・相性のあとに置く締めくくりの誘いの上の余白は、animal・character-personality・music が `--space-24`、character-fortune（`.compatibilitySection`）と `[slug]`（`.cta2Section`）が `--space-32` である。どれも「読みもののセクションの最後の、細い罫線で分けた誘い」という同じ役目なので、1つの値にそろえる。

- 値は `--space-24` にそろえる。5本のうち3本がすでにこの値で、相性の区画の共有のボタンの下には知らせの行（`ShareButtons` の `.notice`。1行分の高さをいつも取る）が空いて続くので、32 だと画像で「結果をコピー」から罫線までが約 80〜90px 空き、ページの中でいちばん大きな穴に見える（`clip-result-cf-with-375.png`・`clip-result-jc-with-1280.png`）。
- 直すのは character-fortune と `[slug]` の `page.module.css` の2か所で、animal など3本は触らない。

### 3. `COMPATIBILITY_BY_SLUG` の説明の文が事実と合わない【builder】

説明は「相性を持ち、結果のページをこのルートが描く診断。相性を持つほかの診断は、専用のルートが相性を出す。」だが、word-sense-personality は相性の表（`getCompatibility`）を持ち、結果のページを `[slug]` が描くのに、この表に入っていない。読んだ人が「word-sense-personality の入れ忘れ」と読み違える。表に入れる条件は「解き終えた画面が相性の共有リンク（`?with=`）を作る」ことなので、その条件で書き直す（例:「解き終えた画面が相性の共有のリンクを作る診断のうち、結果のページをこのルートが描くもの」）。

### 4. 「このタイプについて」の中が相性だけになる場合を、T7 の見直しの項目に入れる【PM】

index.md の T7 の項目は「このタイプについて」の言い方を「読みものの主語がタイプでない診断（色・キャラ・存在）」について見直すと書いているが、japanese-culture の `?with=` のページでは、中身が2人のタイプの相性だけになる。T7 がこの場合も見て言い方を決められるよう、項目に足す。あわせて、`ResultPageShell` をこの形に変えた判断（「ルートが中身を渡したときに区画を置く」）を index.md の T5-5a の判断の行に一言残す。

## 範囲の外で見つけたこと（PM へ。T5-5a の判定には含めない）

- **相性の共有リンクを受け取った人に、相性がすぐには見えない。** 題とリンクの預かり（OG）の説明は相性を言うが、ページの中の相性は、375px で japanese-culture が上から約 1,150px、character-fortune が約 1,800px（読みものをすべて通ったあと）にあり、animal はさらに深い。最初の画面にはタイプ名と「あなたはどのタイプ?」の誘いと説明しか無く、「相性は「…」でした!」を見て開いた人が、相性がどこにあるかを知らずに離れうる。相性を読みものの最後に置くのは t5-design.md 457 行（T4 の並びのまま）で決めたことで、5本に同じく効くので、T5-5a の直しでは動かさなかった。`?with=` 付きで開いたときに相性をページの頭の近く（誘いの前後）に出すかを、T5-6（結果のページ）か backlog で決めてほしい。
- **相性の題の後ろが切れる。** 相性のページの題は「A x B - 相性名」の順で、japanese-culture と animal はタイプ名が「——」の続く長い名前なので、題が 50〜60 字になる（例「茶道タイプ——静寂を愛する「一期一会」の達人 x 書道タイプ——一画に魂を込める「道」の探求者 - 静寂の求道者」）。X や LINE の預かりの表示では後ろが切れ、いちばん伝えたい相性名が見えない。前からの規則で5本に共通なので、上と一緒に扱いを決めてほしい。
- **結果のページの誘いに `?ref=` があるのは character-fortune だけ。** animal・music・character-personality・japanese-culture の結果のページの誘いは `?ref=` を持たず、共有のリンクから来た人が解いても、共有した人との相性は出ない。character-fortune は誘いの文が相性を約束するので今回直したが、ほかの診断でも「友だちの結果から解くと相性が見られる」ほうが来訪者の楽しみになる。backlog の候補。
- word-sense-personality の相性の表は、どの画面からも使われていない。使うか消すかを backlog で決める。

## PM への指示

1. 指摘 1・2・3 を builder に直させる（`[slug]` と character-fortune の page と、相性の区画の組み方の3つは触るファイルが重なるので、1つのタスクにまとめてよい）。直したあと、japanese-culture と character-fortune の `?with=` のページと、animal の `?with=` のページを 375・1280・375 ダークで撮って、罫線と余白を確かめさせる。指摘 4 は PM が index.md に書く。範囲の外の件は、扱いを決めて記録する。
2. 直したあと、もう一度レビューを依頼する。前回までの指摘だけでなく、全体を見直す。
