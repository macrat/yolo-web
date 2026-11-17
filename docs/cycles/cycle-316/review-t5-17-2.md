# T5-17 レビュー 2回目（道具のページの頭と ErrorBoundary）

## 判定

**changes-needed**

1回目の指摘1（email-validator の h1 の語の中の折れ）は T5-29 の受け持ちで、ここでは数えない。それとは別に、指摘5の直しが足りない（下の指摘1）ので、「T5-29 待ちの承認」にはできない。

## 確かめたこと

HEAD（fff3d31f）を `git archive` で書き出し、`node_modules` が無いことを確かめてから `cp -al` で張り、T5-17 の14ファイル（`ToolPageLayout` の index・CSS・`TileInteractionTracker`・試験2本、`ErrorBoundary` の2本と新しい試験、`RelatedTools` の2本、`RelatedBlogPosts` の2本、`types.ts`・`share-image-content.ts`）だけを重ねて `npm run generate:release-id` を走らせた。確かめたあと、書き出しと `.next` は消した。

| 検査                                                                                                    | 結果                                                     |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| vitest（`src/tools`・`src/app/tools`・`RelatedTools`・`RelatedBlogPosts`・`Section`、`--maxWorkers=2`） | 91ファイル・2099件が通る                                 |
| `tsc --noEmit`                                                                                          | 通る                                                     |
| eslint・prettier（T5-17 のファイル）                                                                    | 通る                                                     |
| `next build`                                                                                            | 通る                                                     |
| `npm run check:phrased-names`                                                                           | 落ちるが、T5-17 のファイルは1件も含まない（1回目と同じ） |

### 1回目の指摘の直し

- **指摘2（「h1 の下」「ゾーン3」）**: 直っている。`share-image-content.ts` は「副題に道具の短い説明を添える」に、`types.ts` は `shortDescription` が一覧と関連ツールの行・画像の副題・「このツールについて」の最初の段落に出ること、`howItWorks` が短い説明に続く段落に出ることを書いている。HEAD との差分は注記だけ。ただし、書き直した注記の「50字ほど」が事実と合わない（指摘2）。
- **指摘4（試験の名前の howItWorks）**: 直っている。試験の名前・変数（`aboutIdx`）・注記が「このツールについて」とセクションの `aria-labelledby` を指す。
- **指摘5（ErrorBoundary の試験）**: 試験は足されたが、見た目の崩れの一部しか捕まえない（指摘1）。書き出しで次の変異を1つずつ入れ、試験を走らせてから戻した。

| 変異                                                             | 試験                |
| ---------------------------------------------------------------- | ------------------- |
| `.text` に `border: 1px solid var(--rule)`                       | 落ちる              |
| `.heading` に `color: var(--accent)`                             | 落ちる              |
| `.heading` の大きさを `--text-heading` に                        | 落ちる              |
| 知らせの `div` にクラスを付ける                                  | 落ちる              |
| `.text` に `background-color: var(--paper-2)`                    | 落ちる              |
| h2 から `className={styles.heading}` を外す                      | **通る**（5件とも） |
| `p` から `className={styles.text}` を外す                        | **通る**            |
| `.text` に `font-size: var(--text-small)`・`color: var(--ink-2)` | **通る**            |

### 動くコードが1回目から変わっていないこと

1回目のレビュー（11:44）のあとに変わった T5-17 のファイルは、`types.ts`・`share-image-content.ts`・`ToolPageLayout.test.tsx`・`ErrorBoundary.test.tsx` の4つ（11:47）だけで、前の2つは HEAD との差分が注記だけ、後の2つは試験。`index.tsx`・CSS・`TileInteractionTracker`・`ErrorBoundary`・`RelatedTools`・`RelatedBlogPosts` は 10:54 のまま。

ただ HEAD が 1回目の cec09cbf から fff3d31f に進み、T5-7 が `ListControls`・`ListStatus`・`KeigoReferenceTile` を変えた。道具のページに届く変更なので、本番のビルドを `next start` で配信し、`/opt/pw-browsers/chromium-1194` の Chromium で測り直した（200% は CDP の `Page.setFontSizes` で 32px）。

- **全36本 × 320・375・1280・320 200%（144面）**: h1 より大きいか同じ大きさの見出しは0。横のはみ出しは0。2つ目のセクションはどれも「このツールについて」で、段落は3つ。2つ目からのセクションは 3px の罫線を持つ。h1 は 33.28（320・375）・65.28（1280）・66.56（320 200%）。
- **パンくずの上端**: 375 で 79、1280 で 87（1回目と同じ）。
- **最初の操作の上端（375）**: base64 327.9・email-validator 325.5・keigo-reference 253.3・yoji-search 294.5・char-count 236 で、1回目と一致する。T5-7 の変更はこの数に響いていない。
- **h1 の折れ**: email-validator の 375 の「メールアドレスバリ／データー」は残っている（T5-29 待ち）。ほかの名前は文節の切れ目で折れる。
- **スクリーンショット**: char-count の 375 ライトと 1280 ダーク、email-validator の 375、kana-converter の 375 ダークを撮って見た。1回目の見立てと変わらない。

よって、1回目のブラウザでの計測はそのまま使える。

### 残りの言い回しの grep

T5-17 のファイルと `src/tools`・`src/app/tools`・`RelatedTools`・`RelatedBlogPosts` で「h1 の下」「ゾーン」「以前は」「従来」「旧」「変更前」「shareSection」「data-section」「便利だったら」などを探した。見つかったのは道具の中身の語（bmi-calculator の `meterZone*`、`FileDropZone`、text-diff の「変更前テキスト」）だけで、組み方の過去を言う残りは無い。

## 指摘

### 1. ErrorBoundary の試験が、見出しと本文のクラスが外れる崩れを捕まえない

1回目の指摘5は、知らせの見た目を試験で守ることを求めた。いまの試験は、CSS の中身と、知らせの `div` にクラスが無いことを見るが、h2 と本文に `styles.heading`・`styles.text` が付いていることを見ない。上の表のとおり、h2 から `className={styles.heading}` を外すと、見出しは h2 の既定（セクションの見出し、375 で 23.84px）になり、小見出しの段（17px）より大きく立つのに、5件とも通る。本文から `styles.text` を外すと本文の幅の制限が消える。`.text` に `--text-small`・`--ink-2` を足して前の「補助の文」の見た目に戻しても通る。

直し方: `PhrasedText`・`ListControls`・`Accordion` の試験と同じく `ErrorBoundary.module.css` の `styles` を読み込み、h2 が `styles.heading`、本文の `p` が `styles.text` を持つことを確かめる。CSS の試験で `.text` が `font-size`・`color` を持たない（本文の大きさと色に任せる）ことと、`max-width: var(--measure)` を持つことも確かめる。直したら、上の表の変異をもう一度入れて、どれも落ちることを確かめる。

### 2. `types.ts` の「50字ほど」が、いまの短い説明の長さと合わない

`shortDescription` の注記は「短い説明（50字ほど）」と書く。道具の `meta.ts` の短い説明は14〜38字で、多くは20字前後である（いちばん長いのが hash-generator の38字）。HEAD にある英語の注記「~50 chars for cards」の数を引き写したもので、どの試験や文書も50字を決めていない。T5-18 はこの注記を読んで、36本の短い説明を段落として読める文に書き直す（index.md の T5-17 のレビューを受けた決定 (2)）。注記が50字を目安に見せると、一覧の行・画像の副題・段落のどれでも長すぎる説明を招く。数を事実に合わせる（「40字まで」など、一覧の行と画像の副題に収まる長さを確かめて書く）か、数を消して「一覧の1行で読める長さ」のように役目で言う。

### 3. `ErrorBoundary` の状態の `error` を誰も読まない

`ErrorBoundaryState` は `error: Error | null` を持ち、`getDerivedStateFromError` が入れるが、`render` も試験も読まない。T5-17 の前からのものだが、T5-17 はこのファイルの描き方を組み直したので、読まない状態を残さず `hasError` だけにする（ツギハギの残りは見つけた所で直す）。

## 1回目の指摘1（T5-29 待ち）

email-validator の h1 は、375 の既定の文字サイズでまだ「メールアドレスバリ／データー」と折れる。T5-29 のあと、T5-17 の完了の条件としてここを確かめる。

## 入れるファイル（T5-17 のコミット）

直したあとのコミットに入れるのは次の14ファイルと、このレビューの記録。

- `src/tools/_components/ToolPageLayout/index.tsx`
- `src/tools/_components/ToolPageLayout/ToolPageLayout.module.css`
- `src/tools/_components/ToolPageLayout/TileInteractionTracker.tsx`
- `src/tools/_components/ToolPageLayout/__tests__/ToolPageLayout.test.tsx`
- `src/tools/_components/ToolPageLayout/__tests__/TileInteractionTracker.test.tsx`
- `src/tools/_components/ErrorBoundary.tsx`
- `src/tools/_components/ErrorBoundary.module.css`
- `src/tools/_components/__tests__/ErrorBoundary.test.tsx`
- `src/components/RelatedTools/index.tsx`
- `src/components/RelatedTools/RelatedTools.module.css`
- `src/components/RelatedBlogPosts/index.tsx`（T5-20b と同じ中身。先にレビューを通ったほうのコミットに入れる）
- `src/components/RelatedBlogPosts/RelatedBlogPosts.module.css`（同上）
- `src/tools/types.ts`
- `src/tools/_lib/share-image-content.ts`
- `docs/cycles/cycle-316/review-t5-17.md`・`docs/cycles/cycle-316/review-t5-17-2.md`

`src/components/RelatedBlogPosts/__tests__/RelatedBlogPosts.test.tsx` の変更は T5-20b のもので、HEAD の試験も T5-17 の `RelatedBlogPosts` で通る。`RelatedBlogPosts` の2つを T5-17 のコミットに入れるなら、`Section` として描くことを確かめるこの試験も一緒に入れる。

## アンチパターン（implementation.md）

- **AP-I01**: 当てはまる所は無い。来訪者の目で36本 × 4条件を測り直し、画面も見た。残る体験の問題は T5-29（h1 の折れ）と T5-18（「このツールについて」の重複）に振ってある。
- **AP-I02**: 当てはまらない。個別の道具を名前で分ける分岐は無い。
- **AP-I03**: 当てはまらない。重いデータの読み込みは足していない。
- **AP-I04**: 当てはまらない。
- **AP-I05**: 当てはまらない。道具の本体が h1 のすぐ下にある。
- **AP-I06**: 当てはまらない。1回目の指摘への直しは、指摘の範囲に収まっている。
- **AP-I07**: 本番のビルドを Playwright で測った。見た目の守りを jsdom の試験だけに頼る所（ErrorBoundary）は、試験がクラスの付き方を見ていない（指摘1）。
- **AP-I08**: 当てはまらない。使っているのは DESIGN.md のトークンと `Section` だけ。
- **AP-I09**: 未コミット。`RelatedBlogPosts` を T5-20b と重ねて持つ扱いは上の「入れるファイル」のとおり。
- **AP-I10**: 当てはまらない（アニメーションは無い）。
- **AP-I11**: 当てはまらない（タイマーは無い）。
- **AP-I13**: 撤去した識別子（`.error`・`styles.content`・`className` の prop・`.howItWorks*`・`.shareSection*`・`data-section`）を grep し、残りは無い。読まれない状態の `error` が残る（指摘3）。
- **AP-I14**: `ToolPageLayout`・`RelatedTools`・`RelatedBlogPosts` を使う36本を4条件で独立に測った。ゲームと storybook は1回目のとおり（storybook は T5-24）。

## 作業の進め方（workflow.md）

- **AP-WF05**: 画面を撮って見た。`take.ts` は入っている Playwright と `/opt/pw-browsers` の Chromium の版が合わず起動しないので、同じ Chromium を直に指定して撮った。
- **AP-WF14**: 1回目と builder の数を写さず、最初の操作・h1・罫線を取り直した。
