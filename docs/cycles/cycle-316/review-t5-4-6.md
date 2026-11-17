# T5-4 レビュー 6巡目（前回の指摘の受け持ちと T5-4 の全体）

判定: **改善指示**

対象: [review-t5-4-5.md](./review-t5-4-5.md) の指摘への PM の対応（c4285b4f の T5-27 の新設、0b6b82ac の T5-27 への三点リーダーの追加・T5-3c の完了の条件・backlog.md の B-673）と、T5-4 の全体（597d2925・77f8aa4e・2908a72d・8d89f09b・b1c966c2 と記録）。

T5-4 のコードと、T5-4 が直した面は承認できる状態にある。残る指摘は1つで、T5-27 の行（t5-design.md）に書き足すだけの記録の直しである。builder の作業は要らない。

## 確かめたこと

- **T5-27 の名指しと数（前回の指摘1・2）**: HEAD（e8afa17f）の `src` を ripgrep で数え、T5-27 の行の数とすべて一致した。
  - 結果のページ10本の `shareText` 10（`[slug]`・animal・music・traditional-color・character-personality・character-fortune・yoji・unexpected-compatibility・contrarian-fortune・impossible-advice）、`ctaText` 7、character-personality の `INVITE_TEXT` 1。
  - `src/play/quiz/_components` の招待の文 10（`CharacterPersonalityContent.tsx` 1・`CharacterFortuneResultExtra.tsx` 2・`JapaneseCultureResultExtra.tsx` 2・`MusicPersonalityContent.tsx` 2・`ScienceThinkingResultExtra.tsx` 1・`ResultCard.tsx` 2）。前回の指摘1の10か所がすべて名指しされている。
  - `src/play/registry.ts` 1、`src/play/games/registry.ts` 5、`src/data/yoji-data.json` 2、`src/humor-dict/data.ts` 1。合計 37 で、行の「上の37か所」と合う。
  - `src/play/quiz/data` の「...」80（10ファイル）。
  - この外で和文に続く半角の「?」「!」は、`src/play/quiz/types.ts` のコメント1つだけ（来訪者は読まない）。ブログの記事の本文を範囲の外にする判断は index.md 補足にある。
  - ファイルの受け持ちの表（`ResultCard.*`・招待の文の部品・結果のページ10本・registry ほか）に T5-27 と順（T6-4・T6-6 と並行させない）が書かれ、依存の順（T5-25c → T5-27 → T5-26）も書かれている。完了の条件は、直す前の木で違反を数えて拾い漏れを確かめる形で、試験の判定を `punctuation-width.test.ts` と共有する。前回の指摘2の求めた「どこにも書かれていない状態を残さない」は、半角の「?」「!」については満たされた。
- **T5-3c の完了の条件**: 「診断の FAQ の問いで「？」だけの行が0（375px の既定で music-personality の2本、320px の既定で contrarian-fortune・impossible-advice。撮って確かめる）」が入った。前回の補足の4本と合う。
- **B-673**: 「【中止】DESIGN.md §4 で規範が決まり、cycle-316 の T5-4（診断のデータ）と T5-27（来訪者が読むほかの文）で直す」。ほかの項目にまとめたものを【中止】にする書き方は B-775 と同じで、index.md の補足とも食い違わない。
- **T5-4 のコード**: b1c966c2 の後、T5-4 が触ったもの（開始の画面・`introBadges.ts`・診断のデータ・共有の文・`punctuation-width.test.ts`・`faq-estimated-time.test.ts`）に変更は無い（b1c966c2..HEAD の `src/play/quiz`・`src/app/play` の差分は T5-5a と RadarChart のもので、開始の画面に届かない）。HEAD を scratchpad に `git archive` で書き出して `npx vitest run src/play/quiz src/app/play` を走らせ、101ファイル・1,653件すべて通過した（書き出しは消した。サーバーは動かしていない）。前回までの見直し（所要時間の四捨五入と FAQ の値の一致、約物の全角とアキ、X の文字数とハッシュタグ、320・375・200% の折れ、「はじめる」の位置）の結論は、コードが変わっていないのでそのまま成り立つ。

## 指摘事項

### 1. 三点リーダーの受け持ちが「...」だけで、1字の「…」と道具の「...」が残る（PM）

DESIGN.md §4 は「三点リーダは「……」」と決めている。T5-27 は `src/play/quiz/data` の「...」80か所を「……」にし、完了の条件を「「...」が0」にしたが、次の2つが受け持ちの外に残る。

- **診断のデータの1字の「…」7か所**: `character-personality-results-batch1.ts` 147・149 行（「でも違う解釈だと…」「でも別の見方をすると…」）、`science-thinking.ts` 925 行（「それってつまり…」）、`character-personality-compatibility.ts` 78・105 行、`contrarian-fortune.ts` 348・392 行（「でも飛行機が…」「実は…」）。いまデータには「……」6・「…」7・「...」80 が混ざっていて、T5-27 の後は「……」86 と「…」7 になり、同じ診断の中で三点リーダーの長さがそろわないまま、試験も通ってしまう。T5-4 の決定の範囲（疑問符・感嘆符）の外で、前回の私の指摘2が「...」しか数えていなかった取りこぼしでもある。T5-27 の行に「…」7か所を足し、試験は「...」と、「……」の外にある1字の「…」の両方を違反に数えるようにする。T9 の (3) が聞く「解釈だと…」と」の例も、直した後の字に合わせる。
- **道具のページの「...」17か所（12ファイル）**: 入力欄の placeholder（「変換するテキストを入力...」「ここにテキストを入力してください...」ほか）と、処理中の表示（`RegexTesterTile.tsx`「処理中...」、`MarkdownPreviewTile.tsx`「読み込み中...」）。来訪者が読む字だが、T5-27・T5-17・T5-18 のどの行にも無い。T5-27 に入れるか、T5-18 の道具ごとの行に入れるか、backlog に回すかは PM が決めてよい。どこにも書かれていない状態は残さない。

どちらも T5-4 のコードを止めるものではなく、t5-design.md の記録の直しだけで済む。

## 補足（指摘ではない）

- `QrCodeTile.tsx` の長い文を切って添える「…」と、DESIGN.md のカードの副題を切る「…」は、文の中の三点リーダーではなく省略の印なので、上の指摘には入れていない。
- 結果のページの試験（`page.test.tsx`・`page.test.ts`）が「あなたは?」「あなたはどのタイプ? 診断してみよう」を文字のまま固定している。T5-27 の builder は、共有の文の関数に合わせてこれらも書き換えることになる（行の「`[slug]` の注記は関数に合わせて書き直す」と同じ扱い）。

## 次の手順

1. 指摘1は PM が t5-design.md の T5-27 の行（と、決めた受け持ち先の行）に書く。
2. もう一度レビューを依頼する。そのときは、今回の指摘だけでなく T5-4 の全体を見直す。

## 参照

- [DESIGN.md](../../../DESIGN.md) §4「約物」
- [JIS X 4051 に基づく日本語組版の要件（W3C JLReq）](https://www.w3.org/TR/jlreq/)（三点リーダーは2つ続けて使う）
