# T5-3c レビュー 第2回

対象: 未コミットの T5-3c の分の全体（`src/components/FaqSection/{index.tsx,FaqSection.module.css,__tests__/FaqSection.test.tsx}`、`src/lib/faq-phrases.ts` とその試験、`src/lib/phrase-dashes.ts` とその試験、使う側の4つの器（`QuizPlayPageLayout.tsx`・`ToolPageLayout/{index.tsx,ToolPageLayout.module.css,__tests__/ToolPageLayout.test.tsx}`・`GameLayout.{tsx,module.css}` と試験・`DictionaryDetailLayout.tsx`）、`src/app/storybook/{page.tsx,StorybookContent.tsx}`、`src/play/quiz/data/music-personality.ts`、`.claude/skills/frontend-design/SKILL.md` の 5 の文、`docs/content-quality-requirements.md` の FAQ の所）。第1回の指摘 1〜5 の直しと、全体の見直し。

確かめ方: HEAD（a7affdad）を `git archive` で書き出し（node_modules が無いことを確かめて `cp -al` で足した）、上のファイルを重ねた。SKILL.md は 5 の文の hunk だけを重ねた（`DataTable` の行は T5-8 の分なので重ねていない）。`npm run generate:release-id` と `npm run build`（通った。4040 ページ）、vitest の全体（`--maxWorkers=2`。397 ファイル・6465 件が通り、1 件は skip）、`tsc --noEmit`（0）、対象の eslint（0。CSS は対象外の警告だけ）と prettier（通った）、`npm run check:phrased-names` を走らせた。本番ビルドを `next start` で配り、Chromium（`/opt/pw-browsers/chromium-1194`）で、FAQ を持つ 59 ページ（道具 36・診断とクイズ 15・ゲーム 4・辞典 4（漢字「左」「一」・四字熟語「一期一会」・色「toki」））の 206 問を、320・375・1280 の既定と 320 の 200%（プロファイルの `default_font_size: 32`）で測り、11 ページを4つの組みで撮った。ダークは yoji-kimeru（1280）と byte-counter（375）を撮った。builder の前と後の撮り比べ（`t5-3c-builder/out3/` の 59 ページと一覧の画像）も見た。撮ったものと測った値は `/tmp/claude-0/-home-user-yolo-web/7ec6fd95-5319-581a-b78e-9e5ca394946c/scratchpad/rv-t53c-2/out/`（`m.json` と png）にある。書き出しは消した。

## 判定

**改善指示**（指摘 1）

## 第1回の指摘の直し

- **指摘1（ゲームと道具の FAQ の上の区切り）**: 直った。`GameLayout` と `ToolPageLayout` は、FAQ があるときだけ `.faqSection` の `div` で包み、その器がほかの補助の区画に使っている区切りと同じ規則を当てる（`.faqSection` を `.shareSection` などと同じ規則にまとめた。道具は細い線と上の 24px、ゲームはそれに上の 32px）。測った値は、4つの組みのどれでも、道具 36 本は上の注記から 16px（`.layout` の `gap`）・1px の線・見出しまで 25px、ゲーム 4 本は上の帰属表示（kanji-kanaru・yoji-kimeru）か盤の区画（irodori・nakamawake）から 32px・1px の線・見出しまで 25px。第1回の「見出しの上端が上の要素に 0px で接する」は消え、下の「このゲームを勧める」「このツールが便利だったらシェア」と同じ区切りで並ぶ（`_play_kanji-kanaru-1280-100.png`・`_play_irodori-375-100.png`・`_tools_age-calculator-375-100.png`）。`FaqSection` 自身は線も上の余白も持たないままで、面ごとのセクションが区切る形（t5-design.md 4-b）は保たれ、T5-17・T5-20b がセクションに組むときに器の区切りごと置き換わる。診断は `Section` の全幅の罫線だけ、辞典は上の `article` から 32px で、線が2本になる所は無い。
- **指摘2（music-personality の問い）**: 直った。「好きなジャンルやアーティストは結果に関係しますか？」は、1280 で1行、375 で「好きなジャンルやアーティストは／結果に関係しますか？」、320 で「好きなジャンルや／アーティストは結果に関係／しますか？」になり、丸括弧の中の折れも行頭の「ィ」も無い（`_play_music-personality-320-100.png`）。「関係／しますか？」は 5 の「〜する」の頭の切れ目で、§4 の折り所である。200% は「アーティスト／は結果に関係」と、1行に入らない文節（243px に対し 222px）の中で折れ、§4 の受け入れの範囲。答え（「この診断は好きなジャンルやアーティストではなく、音楽の「聴き方・楽しみ方・人との共有のしかた」に注目しています。…」）は、問いの語をそのまま受けて「関係しない」ことと、何に注目するかを答えており、問いと答えが合い、読んで自然である。前の問いの「音楽の趣味」を「好きなジャンルやアーティスト」に言い換えたので、括弧で補っていた中身は失われていない。JSON-LD の問いも新しい字になっている。古い字を参照する所は `src/`・`docs/`（第1回のレビューを除く）に無い。
- **指摘3（漢字の辞典の「？」だけの行）**: 直った。index.md の「T5-3c から T5-9 へ」は、`KANJI_DICTIONARY_META` の FAQ で漢字の詳細の 2,136 ページすべてに出ることと、「左」「一」で確かめたことを書いている。測り直しても、320 の既定の「？」だけの行・1字の行・禁則の破れ・語の中の折れ（文節 191px に対し名前の幅 174px）は、この2ページのこの1問だけで、その記録と合う。
- **指摘4（JSON-LD と元の問いが同じ字かの試験）**: 直った。`faq-phrases.test.ts` が道具・ゲーム・クイズと診断・辞典の meta の FAQ のすべてを回し、区切りをつなぐと元の問いに戻ることと `followsPhraseRules` を満たすことを確かめる（完了の条件 (c) も満たす）。本番のページでも、59 ページのどれも FAQPage は1つで、JSON-LD の問いと見えている問い（語結合子を除く）は 206 問すべて一致し、語結合子・折れない空白・タグを含まない。
- **指摘5（区画の名前）**: 直った。`<section aria-labelledby="faq-heading">` と、`PhrasedText` の h2 の `id="faq-heading"` が本番の HTML に出ており、区画の名前は見出しの「よくある質問」になる。`id` は1つの定数で、FAQ は1ページに1つだけ置く（どのページも FaqSection は1つで、ほかに同じ `id` を使う所は無い）。試験（`FaqSection`・`ToolPageLayout`・`GameLayout`）と `content-quality-requirements.md` の記述も合わせてある。

## 全体を見直して問題の無かったこと

- **問いの折れ**: 語の中の折れ（1行に入る文節の中の折れ）は、375 と 1280 で 0、320 の既定で 0（上の漢字の1問は1行に入らない文節）。1字の行・禁則の破れ・「？」だけの行は、320 の既定で漢字の2ページの1問だけ（T5-9 へ引き継ぎ済み）、375 と 1280 で 0。character-personality の「24タイプもあるのですか？　どれになるかは…」は、全角の空白の後ろで行が替わるだけで、語は割れていない。200% は1行に入らない文節の中の折れが 146、1字の行 49・禁則の破れ 48・「？」だけの行 44 で、第1回と同じく §4 が 200% で受け入れる範囲。t5-design.md の完了の条件にあった「診断の FAQ の問いで「？」だけの行が0（375 の music-personality・320 の contrarian-fortune・impossible-advice）」は、どれも 0 になった。
- **見出しの段と間隔**: FAQ の見出しは 1280 で 46.72px、320・375 で 23.84px、200% で 47.68px（§4 のセクションの見出し）。見出しと最初の問いのあいだは、どのページも 16px。
- **props と使う側**: `FaqSection` は `faq: readonly PhrasedFaqEntry[]` だけを受け、空なら何も描かない。区切りは `phraseFaq`（`server-only` の `splitIntoPhrases` を使う）が4つの器と storybook の `page.tsx` で作る。器の側は `faq.length > 0` で包みの `div` ごと出さないので、FAQ の無い面に線だけが残ることは無い。
- **phrase-dashes**: 語の中の1つの「-」の後ろに、後ろが数字でも語結合子を置く（`(?<=[^\s-]-)(?=[^\s-])`）。「a - b」「-x」と「--」の扱いは変わらない。byte-counter の「UTF-8」は 320・375 のどちらでも割れない（ダークの `dark_tools_byte-counter-375.png` でも同じ）。スキルの 5 の文と `phrase-dashes.ts` の注記は今の規則だけを書いている。
- **`check:phrased-names`**: 対象のファイルで字で渡すものは storybook の見本の 18 で、T5-24 の受け持ち（第1回と同じ）。値で渡すものの `FaqSection` の `entry.question` は上の 59 ページで測った。
- **ダーク**: 見出し・三角・問いの字と、器の区切りの線は地と区別でき、ライトと同じ組み。
- **ツギハギ**: 器の CSS の注記（「このツールについて・FAQ・シェアは…」「FAQ と、このゲームを…」）、`FaqSection` の説明、`faq-phrases.ts` の注記、`content-quality-requirements.md` の FAQ の節は、どれも今の形だけを書いている。同じ文書のチートシート・`ToolLayout.tsx`・`CheatsheetLayout.tsx` の古い節は B-783 で受け持たれている。

## 指摘

### 1. 道具と辞典のページで、FAQ の見出しがページの h1 より大きい途中の状態が、記録されていない（minor）

FAQ の見出しを §4 のセクションの見出しの段にしたので、h1 がまだ §4 の主見出しになっていない面では、見出しの大きさが逆になる。

| 面                   | 幅と文字    | FAQ の h2 | ページの h1 | 同じ面のほかの補助の見出し                        |
| -------------------- | ----------- | --------- | ----------- | ------------------------------------------------- |
| 道具（36本）         | 1280 の既定 | 46.72px   | 25px        | 「このツールについて」「このツールが…シェア」17px |
| 道具（36本）         | 375 の既定  | 23.84px   | 20px        | 同上                                              |
| 道具（36本）         | 320 の 200% | 47.68px   | 40px        | 同上                                              |
| 辞典の詳細（すべて） | 1280 の既定 | 46.72px   | 25px        | 「関連ゲーム」など小さい見出し                    |

1280 の道具のページでは、「よくある質問」が道具の名前の h1 の約 1.9 倍で、すぐ上の「このツールについて」の約 2.7 倍になり、見出しの大小で読む来訪者には FAQ がページの主題に見える（`_tools_age-calculator-1280-100.png`・`_dictionary_kanji_%E5%B7%A6-1280-100.png`）。

h1 と補助の区画の見出しを §4 の段で組むのは、道具は T5-17（「h1 を §4」「4-b のセクションで組む」）、辞典は 7-a の h1 を組むタスク（T5-10 から）の受け持ちで、どれも出荷の前に終わるので、途中の状態として受け入れてよい。ただし、T5-4 が「FAQ の線が2本に見え見出しが 17.6px のまま → T5-3c」と書いたのと同じく、T5-3c が作ったこの途中の状態と受け持ちは index.md に残す必要がある。いまは index.md にも t5-design.md にも無く、T5-17・T5-10 の完了の条件でこの逆転が確かめられる保証が無い。

直し方: index.md の T5-3c の記録に、「T5-3c の途中の状態と受け持ち: FAQ の見出しを §4 のセクションの見出しにしたので、道具のページ（36本）と辞典の詳細のページで、FAQ の見出しが h1 と、同じ面のほかの補助の見出しより大きい（上の値）→ 道具は T5-17、辞典は h1 を §4 で組むタスク（7-a）」の形で、測った値と受け持ちを書く。受け持ちのタスクが h1 を組んだあとに、FAQ の見出しより h1 が大きいことを確かめる。

## 次に

指摘 1 を直させ（index.md の記録なので PM か builder）、直したあと、今回の指摘だけでなく全体を見直すレビューを依頼する。
