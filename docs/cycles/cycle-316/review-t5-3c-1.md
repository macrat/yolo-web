# T5-3c レビュー 第1回

対象: 未コミットの T5-3c の分（`src/components/FaqSection/{index.tsx,FaqSection.module.css,__tests__/FaqSection.test.tsx}`、新しい `src/lib/faq-phrases.ts` とその試験、使う側の4つの器（`QuizPlayPageLayout.tsx`・`ToolPageLayout/index.tsx`・`GameLayout.tsx`・`DictionaryDetailLayout.tsx`）、`src/app/storybook/{page.tsx,StorybookContent.tsx}`、`src/lib/phrase-dashes.ts` とその試験、`.claude/skills/frontend-design/SKILL.md` の 5 の文、`docs/content-quality-requirements.md` の FAQ の所）。

確かめ方: HEAD（5f9110b6）を `git archive` で書き出し（node_modules が無いことを確かめて `cp -al` で足した）、上のファイルを重ねた。SKILL.md は 5 の文の hunk だけを重ねた（`DataTable` の行は T5-8 の分なので重ねていない）。`npm run generate:release-id` と `npm run build`（通った）、vitest の全体（`--maxWorkers=2`。397 ファイル・6464 件が通り、1 件は skip）、`tsc --noEmit`（0）、対象の eslint（0）と prettier（通った）を走らせた。本番ビルドを `next start` で配り、Chromium（`/opt/pw-browsers/chromium-1194`）で、FAQ を持つ 59 ページ（道具 36・診断とクイズ 15・ゲーム 4・辞典 4（漢字「左」「一」・四字熟語「一期一会」・色「toki」））の 206 問を、320・375・1280 の既定と 320 の 200%（プロファイルの `default_font_size: 32`）で測った。ダークは道具（375）・診断（375）・ゲーム（1280）を撮った。撮ったものと測った値は `/tmp/claude-0/-home-user-yolo-web/7ec6fd95-5319-581a-b78e-9e5ca394946c/scratchpad/rv-t53c-1/out/`（`m.json` と png）にある。書き出しは消した。

## 判定

**改善指示**（指摘 5）

## 確かめて問題の無かったこと

- **props と使う側**: `FaqSection` は `faq: readonly PhrasedFaqEntry[]`（問いは区切りの並び）だけを受け、空なら何も描かない。区切りは `phraseFaq`（`server-only` の `splitIntoPhrases` を使う）が器の中で作り、4つの器と storybook の `page.tsx` がどれもそれを通して渡す。`FaqEntry` を `@/components/FaqSection` から読む所は残っていない（`tsc` が 0）。`src/lib` から部品の型を `import type` で読む形は、T5-3a の `index-phrases.ts` と同じで、クライアントに区切りの関数は入らない。
- **JSON-LD**: 59 ページのどれも FAQPage は1つで、問いの字は見えている問いの字（語結合子を除く）と同じで、語結合子・折れない空白・タグを含まない。byte-counter の JSON-LD の問いも「UTF-8」のまま。つないだ字が元の字と同じかは、道具・ゲーム・診断・辞典の meta の 203 問すべてに `phraseFaq` をかけて `phrasedNameText` でつなぎ、元の字と一致することを vitest の上で確かめた（試験のファイルは書き出しの中だけに置いて消した）。
- **見出しと上の線**: FAQ の見出しは 1280 で 46.72px（2.92rem）、320・375 で 23.84px（1.49rem）、200% で 47.68px。§4 のセクションの見出しの段で、どのページでも同じ。FAQ の `section` の上の線は 0px で、診断のページでは `Section` の全幅の罫線だけが引かれ、T5-4 の「線が2本」は消えた。見出しと最初の問いのあいだは 16px。
- **問いの折れ**（語の中の折れ・1字だけの行・禁則の破れ）: 375 と 1280 の既定は 0。320 の既定は、語の中の折れが 3・1字の行が 2・禁則の破れが 3 で、どれも下の指摘 2・3 の2問から出る（builder の測りの「前」は、320 の既定で語の中の折れ 192）。200% は、文節が1行に入らないことから出る折れが 144、1字の行と禁則の破れが 49 ずつで、§4 が 200% で受け入れる範囲。1行に入る文節の中で折れたのは traditional-color-palette の「無彩色（鉛・／灰・黒など）を…」の1つで、丸括弧の一続き（10字）が 200% の1行に入らないので、これも受け入れの範囲。
  - 200% で「？」だけの行は、前の 29 から 44 に増えた（「変わりますか／？」のように、6字で1行が埋まる文節の最後の「？」があふれる）。語結合子を「？」の前に置いても Chromium は `overflow-wrap: anywhere` の折りでそこを割った（試した）ので、組み方では防げない。§4 の 200% の受け入れの範囲なので、指摘にはしない。
- **phrase-dashes の直し**: 語の中の1つの「-」の後ろに、後ろが数字でも語結合子を置くようにした。正規表現は `(?<=[^\s-]-)(?=[^\s-])` で、空白の隣の「-」（「a - b」）と、前に字の無い「-」（「-x」「x -5」）は変えない。「--」の扱いも変わらない。試験は「UTF-8」「ISO-8601」を足し、元に戻る試験の文にも「UTF-8」を足した。byte-counter の「対応している／エンコーディングは／UTF-8だけですか？」は、320 の既定で「UTF-／8」と割れなくなった（`m.json`）。問いの span には語結合子が1つ入り、選んで Ctrl+C で写すと、text/plain は「対応しているエンコーディングはUTF-8だけですか？」と一致し、text/plain・text/html とも語結合子は 0 だった。
- **スキルの文**: 5 の「語の中の1つの「-」の後ろにも、後ろが数字のとき（「UTF-8」）を含めて語結合子を置き、…」は、前の「数字の前には置かない」の文を置き換えて1つの規則として読める。§4 の本文（DESIGN.md 109 行）は数字の前を分けて書いていないので、直す所は無い。`docs/knowledge/` にも数字の前の例外を書いた所は無かった。
- **`check:phrased-names`**（この7ファイル）: 字で渡すものは 19 → 18（storybook の `Accordion` の長いラベルを区切りの並びにした分）。残る 18 は storybook の見本で T5-24 の受け持ち。値で渡すものは 3 で、`FaqSection` の `entry.question` は上の 59 ページで測った。
- **ダーク**: 見出し・三角・開いた答えの字は地と区別でき、ライトと同じ組み。
- **ツギハギ**: `FaqSection.module.css` の頭の注記、`FaqSection` の説明、`phrase-dashes.ts` の注記、`content-quality-requirements.md` の FAQ の節は、どれも今の形だけを書いている。

## 指摘

### 1. ゲームのページで、FAQ の見出しが上の中身に接している。道具のページでも FAQ だけが区切りを失った（major）

`.section` の `margin-top: 2rem`・`padding-top: 1.5rem`・`border-top` を外したので、`Section` で包まれていない3つの器では、FAQ の上の切れ目が何も無くなった。

- **ゲーム（4本とも、どの幅でも）**: 見出しの上端と上の要素の下端のあいだが **0px**。kanji-kanaru・yoji-kimeru では帰属表示（「漢字辞典で漢字の読み方・意味を調べる」）の行のすぐ下に、irodori・nakamawake ではゲームの区画（「2026年9月29日の問題（#222）」）のすぐ下に、1280 で 46.72px の「よくある質問」が貼り付く（`game-kanji-kanaru-1280-100.png`・`game-irodori-375-100.png`・`dark-game-1280.png`）。見出しが上の補助情報の続きに見え、どこからが FAQ かを来訪者が見分けにくい。前は 32px あけて線を引いていた。
- **道具（36本）**: 上のプライバシーの注記（14px）から 16px（`.layout` の `gap`）で、線が無い。すぐ下の「このツールが便利だったらシェア」と上の「このツールについて」は細い線と 24px で区切られたままなので、補助の情報の中で FAQ だけが区切りを持たず、「このツールについて」の続きに見える（`tool-age-calculator-1280-100.png`・`-375-100.png`）。
- 辞典は、上の `article` の下の余白で 32px あき、下の共有の線も残るので、読み分けられる（`dict-colors-toki-1280-100.png`）。受け入れてよい。

t5-design.md 4-b の「FaqSection の上の自前の線は、セクションの罫線に置き換わって消えます」は、その面がセクションに組まれた後の形で、T5-17（道具）・T5-20b（ゲーム）がセクションに組むまでは、線に替わるものが無い。直し方: `FaqSection` は線も上の余白も持たないまま（面ごとのセクションが区切る形を保つ）、`GameLayout` と `ToolPageLayout` の側で、FAQ をそれぞれの器が今ほかの補助の区画に使っている区切り（ゲームは `.shareSection` と同じ上の余白と細い線、道具は `.howItWorksSection`・`.shareSection` と同じ細い線と 24px）で置く。T5-17・T5-20b がセクションに組むときに、その区切りごと置き換わる。直したあと、FAQ を持つ 59 ページを前と後で撮り比べる（AP-I14）。

### 2. music-personality の問いが、320 の既定で丸括弧の中で割れ、行頭に「ィ」が来る（major）

「音楽の趣味（ジャンルや好きなアーティスト）は関係しますか？」が、320 の既定で「音楽の趣味／（ジャンルや好きなアーテ／ィスト）は関係しますか？」になる（`quiz-music-personality-320-100.png`）。丸括弧の一続きが1行に入らないので、その中で割れ、行頭に小書きの仮名が来る。前も同じ所で割れていたので後戻りではないが、§4 は既定の文字サイズで「丸括弧の一続きの中の折れ」と「禁則の破れ（小書きの仮名）」を作らないとし、組み方で避けられないときは「言い回しは折れない形に変える」と決めている。FAQ の問いの折れは T5-3c の受け持ちで、index.md の完了の条件 (b) の記録にも、この件は無い。

直し方: `src/play/quiz/data/music-personality.ts` の問いを、丸括弧を使わない言い回しにする（例「好きなジャンルやアーティストは結果に関係しますか？」。答えと合うかを確かめる）。直したあと、320・375 の既定と 200% で測る。JSON-LD の問いも同じ字に変わる。

### 3. 漢字の辞典の「？」だけの行は、「左」だけでなく漢字の詳細のすべてのページに出る（minor）

「漢字の画数や読みが間違っている場合はどうすればいいですか？」は、320 の既定で「…どうすればいいですか／？」になり、「？」だけの行ができる。この問いは `KANJI_DICTIONARY_META.faq`（`src/dictionary/_lib/dictionary-meta.ts`）で、漢字の詳細のすべてのページ（ビルドで 2,136）が同じ FAQ を持つ。「一」でも同じ折れを測った。index.md の「T5-3c から T5-9 へ」は「漢字「左」の FAQ の問い」と書いていて、1ページの件に読める。

前は同じ幅で3問とも語の中で割れていた（「どん／な」「どこか／ら」「間／違って」）ので、全体では良くなっている。T5-9 で器の自前の余白を外したあとに測る、という引き継ぎの中身はそのままでよい。直し方: index.md のその行を、漢字の詳細のすべてのページ（`KANJI_DICTIONARY_META` の FAQ）の件と分かる書き方にする。

### 4. JSON-LD が元の問いと同じ字であることを、試験が1例でしか確かめていない（minor）

`FaqSection` は、区切りの並びをつないだ字で JSON-LD を出す。これが検索に出す問いと同じ字になるのは、`splitIntoPhrases` が字を足しも欠きもしないからで、`faq-phrases.test.ts` はそれを「基準日を変更すると…」の1問でしか確かめていない。上で 203 問すべてが一致することを確かめたが、あとから足す FAQ（空白や記号を含む問い）で崩れても、試験は落ちない。

直し方: `faq-phrases.test.ts` に、道具・ゲーム・診断・辞典の meta の FAQ のすべてを回し、`phrasedNameText(phraseFaq(faq)[i].question)` が元の問いと同じで、並びが `followsPhraseRules` を満たすことを確かめる試験を足す（T5-3a の `index-phrases.test.ts` が一覧の語のすべてを回すのと同じ形）。

### 5. FAQ の区画の名前が「FAQ」で、見出し「よくある質問」と違う（minor）

`<section aria-label="FAQ">` は、読み上げのランドマークの一覧で「FAQ」（日本語の読み上げでは「エフエーキュー」）と読まれ、区画の中の見出しは「よくある質問」と読まれる。同じ区画を2つの名前で呼ぶことになる。診断のページでは `Section` の中に入れ子になり、名前の無い外の `section` の中に「FAQ」の区画がある。T5-3c は `FaqSection` の組みを書き換え、`content-quality-requirements.md` にも `section[aria-label="FAQ"]` と書き直したので、ここで揃えるのがよい。

直し方: 区画の名前を見出しから取る（`aria-labelledby` で h2 を指す）。`content-quality-requirements.md` の記述と試験もそれに合わせる。

## 次に

指摘 1〜5 を builder に直させ、直したあと、今回の指摘だけでなく全体を見直すレビューを依頼する。
