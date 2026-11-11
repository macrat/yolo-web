# レビュー: T5-27 の行の第3回

対象: コミット `e4329da4` の docs/cycles/cycle-316/t5-design.md の T5-27 の行・10-4 の `src/play/registry.ts` ほかの行と、index.md の T9 の (3) の見出しの字。あわせて T5-27 の行・10-1・10-4 の全体を見直した。前提は [review-t5-27-plan-2-and-t5-4-7.md](./review-t5-27-plan-2-and-t5-4-7.md) の指摘 A-1〜A-5。基準は DESIGN.md §4、docs/anti-patterns の planning.md・implementation.md・workflow.md。

## 判定

**改善指示**（指摘1・2。どちらも行の1句を直せば済む小さなもの）

## 確かめたこと

- **表が壊れていないか**: `npx prettier --check` は t5-design.md・index.md で通る。`\|` を除いて縦線を数え、10-2 の T5 の行はどれも4本、10-4 の行はどれも3本でそろう。T5-27 の行のセルの中に、逃がしていない縦線は無い。
- **疑問符・感嘆符の39**: TypeScript の構文木から文字列リテラル・テンプレートの字・JSX の字を取り（コメントは入らない）、`.json` は値の文字列を取って、`src/` の全体（`__tests__`・`*.test.*`・生成物を除く）を弱い判定（和文の字に接する半角の「?」「!」、文の途中で後ろにアキの無い「？」「！」）で数えた。結果のページ10本 18（`character-personality` が3、6本が2、`contrarian-fortune`・`impossible-advice`・`unexpected-compatibility` が1で、shareText 10・ctaText 7・`INVITE_TEXT` 1 に分かれる）、`_components` 10（`ResultCard` 2・`CharacterFortuneResultExtra` 2・`JapaneseCultureResultExtra` 2・`MusicPersonalityContent` 2・`CharacterPersonalityContent` 1・`ScienceThinkingResultExtra` 1）、`src/play/registry.ts` 1、`src/play/games/registry.ts` 6、`yoji-data.json` 2、`humor-dict/data.ts` 1 で38。ブログの記事の front matter の `title`・`description` を YAML として読むと、当たるのは `2026-02-23-yoji-quiz-themes.md` の `description` の1つだけ。合わせて39で、行と一致した。試験 (2) の強い判定（和文を含む文字列に半角の「?」「!」）を直すファイルに掛けると37で、弱い判定の38から全角の「仲間分けしよう！日本語」の1つを除いた数と合う。強い判定だけが拾う余計な字は無い。
- **三点リーダー**: 同じ構文木の取り方で数えた。
  - `src/play/quiz/data`（`__tests__` を除く）の文字列の中の「...」は64で、ファイルごとの内訳（24・20・13・3・2・2）も行と一致した。スプレッド構文は構文木で文字列に入らないので、数に入らない。
  - 1字の「…」は8で、行と一致した。
  - 行が名指す道具の12ファイルの「...」は18で、行と一致した（`RegexTesterTile.tsx` 324行の「...他 N 件のマッチ」を含む）。
  - 直す前の記録の「「...」82・1字の「…」8」は 64＋18 と 8 で合う。ただし試験のファイルを入れると合わない（指摘1）。
  - 12ファイルの外の道具の `*Tile.tsx` に、欧文の中の「...」が2つある（指摘2）。
  - そのほかの `src/` の「...」は `PaginationNav.tsx` の `ELLIPSIS_LABEL`（ページ送りの印で、範囲の外）だけ。1字の「…」は `QrCodeTile`（範囲の外）・`html-entity/logic.ts` の `hellip` の値・画像の生成器と `unphrased-names.ts` の切り詰めの印で、どれも行の範囲の外として扱ってよい。`kanji-data.json` の「made in...」は英語の意味の欄である。
- **下の誘い**: `.cta2Link` で `{ctaText}` を描くのは、行が名指す9本の `page.tsx` だった（`character-fortune` は持たない）。`npm run check:phrased-names` はどちらの誘いも拾わず、「4-g の数え方はこの位置を見ない」も事実どおり。`PhrasedText` は要素の中を文の字と `<wbr>` だけにするので、上と下で同じ並びを渡せば同じ所で折れる。
- **全角アキが行末に来たときの中寄せ**: 誘いを「タイプ？　」の後ろで折ると、全角アキが1行目の終わりに残る。中寄せの箱でこれがずれないかを、`/opt/pw-browsers/chromium-1194` で確かめた（180px の中寄せの箱で、区切りの並びを `<wbr>` でつないだもの）。全角アキは行末でぶら下がり、1行目は見える字だけで中寄せになる（左右のアキは8px と -8px で、アキの無い場合と同じ位置）。見た目の心配は無い。
- **前回の指摘への対応**:
  - A-1: 数が「文字列の中の「...」64（6ファイル、内訳あり）」になり、スプレッド構文16を範囲の外とし、一律の置き換えをしない旨が入った。記録の数も82になった。直った。
  - A-2: 上の `.tryButton` と9本の `.cta2Link` の両方を `PhrasedText` で組むと書かれた。並びは共有の文の関数と同じ `.ts` の1か所に置き、`page.tsx` に直に書かず、(c) の試験で確かめる形になった。撮る対象と「語の中の折れ・1字だけの行・行頭の「？」が0」も下の誘いに掛かり、10-4 の `resultShareText.ts` の行にも「誘いの区切りの並び」が載った。直った。
  - A-3: 試験 (1) の範囲から `__tests__`・`*.test.*`・fixtures が外れ、理由も書かれた。(1) については直った（(3) に同じことが要る。指摘1）。
  - A-4: 「...他 N 件のマッチ」を「……他 N 件のマッチ」にすると決まり、数が18、`regex-tester` が3になった。直った。
  - A-5: 「違反を持つ文字列の数で39」と単位が書かれ、index.md の T9 の (3) の見出しの字も「「！」「？」」になった。直った。
- **10-1・10-4 の全体**: 10-1 の「約物」の依存（T5-5a・T5-5b・T5-3d・T5a・T5-22b・T5-6・T5-18 の12本 → T5-27、T6-4・T6-6 と並行させない）と、「T5-25c → T5-27 → T5-26」は、10-4 の `ResultCard.*`（T5a のあと、T6-6 と並行させない）・`ResultPageShell.*`（T5-5a → T5-6 → T5-27）・結果のページ10本（T5-6 のあと、T6-4 と並行させない）・道具の12本（T5-18 → T5-27）の各行と食い違わない。新しいファイル（`resultShareText.ts`・`visitor-punctuation.test.ts`）と `punctuation-width.test.ts` も T5-27 の受け持ちに載っている。

## 良い所

- **数が、試験の取り方と同じ単位で書かれた。** 疑問符・感嘆符は違反を持つ文字列、三点リーダーは字で数えると書かれた。数えるのも構文木の文字列だけなので、builder は直す前の木で試験を走らせ、そのまま行と照らせる。
- **上と下の誘いが同じ並びから組まれる。** 同じ文が同じページの2か所で違う所で折れる状態が無くなる。並びを1か所に置くので、片方だけ直す食い違いも起きない。

## 指摘

### 指摘1（planner、小。T5-27 の完了の条件）: 試験のファイルを外す指定が (1) にしか掛かっておらず、(3) を書かれたとおりに掛けると `src/play/quiz/data/__tests__` の「...」9 を拾う

(3) の範囲は「`src/play/quiz/data` と上の道具の12ファイル」である。`src/play/quiz/data/__tests__` には、失敗の文言に「...」を持つ試験が7ファイルで9つある。

- `contrarian-fortune-traits-advice-quality.test.ts` 41・57行
- `impossible-advice-traits-advice-quality.test.ts` 52・66行
- `character-fortune-…`・`music-personality-…`・`traditional-color-…`・`unexpected-compatibility-…`・`yoji-personality-traits-advice-quality.test.ts` に1つずつ

どれも `…slice(0, N)}..."` の形である。`src/play/quiz/data` の下を全部見る試験にすると、直す前の数は91になり、記録の82と合わない。直したあとも、試験のファイルの字で失敗する。前回の A-3 と同じ種類の穴で、builder がその場で例外を足すことになる。

直し方: 試験のファイル（`__tests__`・`*.test.*`・fixtures）を外す指定を (1) の括弧から出し、字を取る規則の所（「字は、`.ts`・`.tsx` では…」の文）に移して、(1)〜(3) のすべてに掛ける。

### 指摘2（planner、小。T5-27 の行の三点リーダーの範囲）: 12ファイルの外の道具の `*Tile.tsx` に、欧文の中の「...」が2つあり、範囲の内か外かが書かれていない

行は「道具のページの「...」18」と言うが、道具の `*Tile.tsx` の文字列の「...」は20ある。名指しの外の2つは次のとおり。

- `src/tools/image-base64/ImageBase64Tile.tsx` 338行の placeholder「data:image/png;base64,iVBOR... または Base64文字列を貼り付け」
- `src/tools/password-generator/PasswordGeneratorTile.tsx` 202行の「記号 (!@#$...)」

どちらも欧文（Base64 の見本の切れ端と、記号の並び）の中の省略で、和文の三点リーダーの規則を当てる所ではない。範囲の外で良い。しかし行の「範囲の外」は、`QrCodeTile` の「…」・ページ送りの印・スプレッド構文の3つだけを挙げる。道具の `*Tile.tsx` を数えた builder は20を見て、名指しの漏れか外したものかを行から判断できない。後者は疑問符・感嘆符の判定 (1) の所で「和文の字に接しない」例として挙がっているが、三点リーダーの範囲では触れられていない。

直し方: 行の「範囲の外」に「欧文の中の「...」（`ImageBase64Tile` の見本の「iVBOR...」、`PasswordGeneratorTile` の「記号 (!@#$...)」）」を足す。「道具のページの「...」18」は「名指す12ファイルの「...」18」と読めるように書く。

## 実装で確かめれば足りること（指摘ではない）

- **`CTA_TEXT` を読む試験**: `contrarian-fortune`・`impossible-advice`・`unexpected-compatibility` の `page.tsx` は `CTA_TEXT` を export し、それぞれのページの試験が読み込んで `CTA_TEXT.length` を確かめている。並びを `.ts` に移すと、この読み込みと字数の試験（全角アキで字数が変わる）を書き直すことになる。
- **誘いの文を字のまま持つ試験**: `ResultPageShell.test.tsx` と結果のページの試験（`[slug]`・animal・character-personality・character-fortune）は、「あなたはどのタイプ? 診断してみよう」を字のまま探している。「テストが通る」の条件で直る。
- **登録の説明を字のまま持つ試験**: `src/app/play/daily/__tests__/page.test.tsx` 37・44行は、`src/play/registry.ts` の説明「…どんな形?」を字のまま持つ。T5-27 は T5-25c のあと（ほかの面のタスクがすべて終わったあと）なので、並行の心配は無い。これも「テストが通る」の条件で直る。
- **375px で誘いが1行に収まるか**: 「？ 」（半角の疑問符と空白）が「？　」になり、幅がおよそ 1em 増える。「あなたはどの四字熟語？　診断してみよう」は、375px で2行に折れるかもしれない。行の撮る条件（文節で折れる・行頭の「？」が0）と、T5-6 の「最初の画面に入る」を満たせばよい。
- **並びを置くモジュールの名**: 10-4 は `src/play/quiz/resultShareText.ts` に共有の文の関数と誘いの並びの両方を置く。名が中身の片方しか言わないので、実装のときに両方を言う名（結果のページの文、など）にしてよい。

## PM への依頼

1. 指摘1・2を planner に直させる（t5-design.md の T5-27 の行の2か所）。
2. 直したら、もう一度レビューを依頼する。そのときは今回の指摘だけでなく、T5-27 の行・10-1・10-4 の全体を見直させる。

## 参照

- [DESIGN.md](../../../DESIGN.md) §4「約物」
- [JIS X 4051 に基づく日本語組版の要件（W3C JLReq）](https://www.w3.org/TR/jlreq/)
