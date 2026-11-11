# T5-3b PART 2（共有の部品と型）の第1回レビュー（80223ce3）

判定: **承認**

対象: 80223ce3 の44ファイル（`src/lib/phrased-name.ts` への `PhrasedName`・`phrasedNameText` の移し、`Button` の `phrases`、`CopyButton` の区切り、一覧の選択肢を `name` の1欄にする型の変更と定義・読む所・試験の移し、`GuessInput` の送信の面と unit-converter の「入れ替え」の `PhrasedText`、kanji-kanaru の `GuessInput` の `label` の `PhrasedName`）。照らした計画は t5-design.md の 10-2 の T5-3b の行、4-g の「区切りの渡し方」と「一覧の選択肢の区切り」、10-4、index.md の「T5-3b の PM の決定」、review-t5-3b-plan-8.md の「実装で確かめること」。

## 確かめたこと

HEAD（f10b9e6b）を `git archive` で scratchpad に書き出し、`node_modules` が無いことを確かめてから `cp -al` して走らせた。80223ce3 が触った44ファイルは、HEAD までのあとのコミットで変わっていない（`git diff 80223ce3 HEAD` が空）。見た目は、80223ce3 とその親のビルドを並べて `next start` で比べた（両方の `src` がそれぞれのコミットと同じことを確かめた）。

- **全体の vitest と型の検査**: `npm run generate:release-id` のあと `npx vitest run` で 392 ファイルのうち 390 が通り 2 が飛ぶ（6370 件が通る）。`npx tsc --noEmit` は0件。変えた44ファイルの `eslint` と `prettier --check` も通る。
- **型の排他**: `Button.test.tsx` の `@ts-expect-error` を外すと、その行（`phrases` と `children` を両方渡す）が TS2322 で落ちる。別に試した `<Button phrases={…}>字</Button>` と、どちらも渡さない `<Button />` も落ち、`<Button phrases={…} />` と `<Button>計算</Button>` は通る。`ComponentPropsWithRef<"button">` から `children` を除いてから `ButtonFace` を足しているので、排他は属性の側からも崩れない。
- **一覧の選択肢の移し**: 定義（`tool-list.ts`・`play-list.ts`・`blog-list.ts`・`humor-list.ts`・`src/dictionary/_lib/*-list.ts`・keigo-reference と yoji-search の `logic.ts`・`palette-list.ts`・storybook の `samples.ts`）は字をそのまま `name` に移しただけ。並びの鍵（`TOOL_KINDS`・`PLAY_KINDS` の `order`）・種別の突き合わせ（`browseItems`・`BrowsableList` の `kindOptions`）・開閉のラベル（`ListControls` の `selectedText`）・件数の行の並び順（`BrowsableList`・`KeigoReferenceTile` の `sortLabel`）は、どれも `phrasedNameText(….name)` を通る。review-t5-3b-plan-8.md の「実装で確かめること」の1の4試験（`BrowsableList.test.tsx`・`color-list.test.ts`・keigo-reference と traditional-color-palette の試験）も同じコミットに入っている。src の中に `BrowseChoice` の `label` を読む所は残っていない。試験は区切りの並びの名前を渡したときの折れと、鍵・開閉のラベル・読み上げの名前が1続きの字になることを確かめている。
- **一覧の画面が前と同じ字か**: `/tools`・`/play`・`/dictionary/{yoji,kanji,colors}`・`/blog`・keigo-reference・yoji-search・traditional-color-palette を、320px の 200% と 1280px で開閉のボタンを開き2つ目のラジオボタンを選んで、ラジオボタンの名前と中身の HTML、`legend`、開閉のボタンの字と `aria-label`、ライブリージョンの字、行の頭を前と後で取った。18組とも、CSS モジュールのハッシュを除いて同じだった。
- **CopyButton の升の幅**: `CopyButton` を使う24か所のうち、道具21本と色の辞典の詳細（`toki`・`sakura`）と storybook を 320px の既定・200%、375px、1280px で測った。156個のボタンで、ボタン・升・見えない箱3つ（「コピー」「コピー済み」「コピー失敗」）の幅と高さが前と同じだった。違いは markdown-preview の「HTMLをコピー」の 129.28 → 129.27px（0.01px の丸め）と、password-generator の 200% の縦の位置（出したパスワードが乱数で2行か3行になるため。撮った画面で確かめた）だけ。hash-generator は入力のあとに別に測り、4つとも同じ。ルートの字は 200% で 32px。color-converter の 320px・200% の3つと、`toki` の 320px・200% のはみ出し（ボタン 113.5px・升 105.5px。index.md にある T5-3b の前からのもので T5-12 の受け持ち）も前と同じ値だった。
- **面の折れ方**: コピーのボタンの面は、business-email・password-generator・number-base-converter・dummy-text・色の辞典の詳細の4つの幅で測った48個とも、計算値の `line-break` が前の `auto` から `strict` になり、面の HTML は前と同じ切れ目（「メール<wbr>全文を<wbr>コピー」「コピー<wbr>済み」）を持つ。kanji-kanaru・yoji-kimeru の「送信」「送信中……」と unit-converter の「入れ替え」の span は `strict`・`keep-all`・`anywhere` になり、ボタンの幅と高さ（186×63.59、181.59×63.59）は前と同じ。変わったのは折れ方だけで、来訪者に見える形は変わらない。
- **CSS**: `.phrased` の `overflow-wrap: anywhere` を、見えない箱だけ `.copy > .reserve` の `break-word` で上書きしている。特異度が `.phrased` より高いので、CSS モジュールの読み込み順によらず、升の最小の幅が「いちばん長い文節」のまま保たれる。面の側は `anywhere` になるが、升の幅は見えない箱が決めるので、上の測りのとおり変わらない。
- **`PhrasedName` の置き場所**: `src/lib/phrased-name.ts` は何も読み込まない純粋なモジュールで、`list-browse.ts`・`tool-list.ts`・`play-list.ts` は CSS モジュールを読む部品のファイルに依存しない（「実装で確かめること」の4）。`phrasedNameText` の単体テストも `src/lib/__tests__` に移っている。
- **ツギハギ**: 消した `renderFace`・`.face`・`selectedLabel` は残っていない。`Button`・`renderPhrasedName`・`PhrasedName`・`CopyButton` の `targetPhrases` の説明は、2文節以上の名前と面を区切りの並びで渡すと言う今の形で書かれていて、「以前は」のような経緯の跡は無い。`CopyButton` の自前の `<wbr>` は無く、それを確かめる試験もある。
- **スキルとの合い方**: `frontend-design` スキルの「2文節以上の名前と面は、区切りの並びで渡す」が挙げる `Button` の `phrases`（`children` と排他）・`targetPhrases`・一覧の選択肢の `name` は、HEAD のコードとそろった（review-t5-3b-part1-1.md・part1-2.md が PART 2 のレビューに回した点）。

## 指摘

なし。

## 指摘にしないが、T5-3b の完了までに要ること

- スキルは `GuessInput` の `label` を `PhrasedName` と書くが、HEAD の yoji-kimeru の `GuessInput` の `label` はまだ狭まっていない。PART 3 で狭めたあと、T5-3b の完了のレビューでスキルとそろうことを確かめる。
- 10-2 の T5-3b の行は、`CopyButton` の升の幅と高さを測って並べ、面の字と升を撮って記録に残すことを完了の条件にしている。builder が測った48か所の値は、まだ cycle のドキュメントに無い。T5-3b の記録に書く（このレビューの値を添えてもよい）。

## PM への依頼

指摘は無いので、PART 2 は承認とする。T5-3b 全体の完了のレビューは、PART 3 を終えたあとに別に依頼してください。
