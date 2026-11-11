# T6 の作業の記録

t6-design.md 4章が求める、タスクごとの画像の比較と測った数を残す。

## T6-0（3332c05）

- 変更の前と後で `next build` し、`.next/server/app` の画像の body（731件）の sha256 がすべて一致した。
- `scripts/generate-favicons.ts` の出力（`favicon.ico`・`icon.svg`・`apple-touch-icon.png`）が変更の前後でバイト単位で一致した（出力はコミットしていない）。
- レビュー: [review-t6-0.md](./review-t6-0.md)（承認）。

## T6-2

- ブログの `src/app/blog/[slug]/twitter-image.tsx` の削除は、担当がステージしたものが T5 の設計のコミット 106e161 に入った。T6-2 のレビューの範囲には 106e161 のこの削除を含める。
- 代替テキストは案 b にした。案 a（`generateImageMetadata`）は、動的なルートの下ではビルドが画像を書き出さなかった（Next 16.3 は Route Handler の `generateStaticParams` を最後の段しか集めず、`generateImageMetadata` に `params` が渡らない。ブログの画像は0枚、最初の要求で 7.7 秒）。案 b は、Route Handler `src/app/blog/[slug]/opengraph-image/route.tsx` が画像を描き、ページの `generateMetadata` が同じ中身から `openGraph.images`（記事ごとの代替テキスト）を渡す。
- Route Handler の設定は `dynamic = "force-static"`・`dynamicParams = false`・`revalidate = false`・`generateStaticParams`（記事の slug をすべて並べる）。`GET` はクエリを読まず、無い記事は `notFound()`。
- 画像の URL は `/blog/{slug}/opengraph-image?v={版}`。版は、`ShareImageContent` と枠の寸法のモジュール（`share-image-frame.ts`。描き方の版の値 `SHARE_IMAGE_VERSION` を含む）の値を、それぞれキーの名前の順に並べた JSON をつないだ字の sha256 の頭16字。`og:image`・`twitter:image`・JSON-LD の `image` は、どれも `shareOpenGraphImage` の同じ値を使う。
- `seo.ts` はクライアントの部品（Breadcrumb）から読まれるので、画像はページの `generateMetadata` で作って `generateBlogPostMetadata` に渡す（`seo.ts` は `share-image` の型だけを読む）。
- ブログの `ShareImageContent` を作る関数（`blogShareImageContent`）は `src/blog/_lib/share-image-content.ts` に置いた。`seo.ts` はフィーチャーから型だけを読む決まりで、`share-image` も `server-only` なので、画像の Route Handler とページの両方が読める、ブログの側のファイルにした（このファイルは `share-image` から型だけを読む）。
- `twitter-image.tsx` は置かない。Next 16 は `og:image` から `twitter:image` を同じ URL と代替テキストで出す。
- 別の書き出しでのビルドで、記事の画像の `.body` は86枚、`twitter-image` は0枚。86本すべてで `og:image`・`twitter:image`・JSON-LD の `image` が同じ `?v` 付きの URL で、どれも 200・PNG・`.body` とバイト単位で同じ。代替テキストは記事ごとに画像に書いた字と同じ。無い記事と下書きの記事の画像は 404。`?v` の値は別のプロセスで計算し直しても同じ。書体の取得先を壊すとビルドが止まる（`Error occurred prerendering page "/blog/…/opengraph-image"`、exit 1）。
- 行の折り方を画面の見出しと同じ単位（文節の切れ目・空白の後ろ・閉じ括弧の直後。丸括弧の中では割らない）にして、長い題の段が上がった（直す前は 86823f9 の描き方で組んだ値）:

| ブログの題                                                    | 直す前（文節を丸ごと1単位）     | 直した後          |
| ------------------------------------------------------------- | ------------------------------- | ----------------- |
| 69字（nextjs-global-not-found-for-multiple-root-layouts）     | 48px・2行                       | 72px・3行         |
| 67字（nextjs-seo-metadata-and-json-ld-security）              | 48px・3行                       | 56px・3行         |
| 63字（scroll-lock-reference-counter-for-multiple-components） | 56px・3行                       | 64px・3行         |
| 63字（admonition-gfm-alert-support）                          | 56px・3行                       | 56px・3行（同じ） |
| git-command-cheatsheet                                        | 72px・3行（1行目が「Git」だけ） | 96px・2行         |

- 名前の段と描く時間（試しの入力）。描く時間は、5つの書体とどの段も通る1枚と、名前を Zen Antique で組む1枚の2枚を描いて温めたあと、同じ入力を3回描いて PNG に書き出すまでの CPU の時間（`process.cpuUsage`）のいちばん短い値:

| 入力                                             | 選んだ段 | 行                                               | 描く時間（CPU） |
| ------------------------------------------------ | -------- | ------------------------------------------------ | --------------- |
| 69字のブログの題                                 | 72px     | 3行                                              | 88ms            |
| 67字の SEO の題                                  | 56px     | 3行                                              | 77ms            |
| git-command-cheatsheet                           | 96px     | 2行（画面の h1 と同じ所で折れる）                | 33ms            |
| dark-mode-toggle（1段上では単位が1行に入らない） | 64px     | 2行                                              | 34ms            |
| 診断のタイプ名の最長（guardian-charger・35字）   | 72px     | 3行                                              | 62ms            |
| 鉤括弧を含むタイプ名（30字）                     | 84px     | 3行                                              | 42ms            |
| 締切1時間前…画家（28字）                         | 84px     | 3行                                              | 46ms            |
| Supercalifragilistic…                            | 64px     | 3行（語の中だけで折れる）                        | 103ms           |
| 纁（Zen Antique にも BIZ UDGothic にも無い字）   | 96px     | 1行、Noto Sans JP（モジュールが取る5つ目の書体） | 34ms            |
| 𠮟る（Zen Antique に無い字）                     | 96px     | 1行、BIZ UDGothic                                | 19ms            |
| エゾシカ——                                       | 96px     | 3行、ダッシュは1本の線                           | 40ms            |
| 10問中8問正解・漢字マスター                      | 96px     | 数字の結果は1行                                  | 28ms            |
| 72点・Bランク                                    | 96px     | 数字の結果は1行                                  | 23ms            |

- 数字の結果と名前の字の高さは 122px と 87px（1.40倍）。空白は PNG に残る。ブログの86本の題はすべて3行以内で枠に収まり、副題は切れない。1行に収まらない単位は、割れない字の組（行の頭に置かない字と空白は前の字に、行の終わりに置かない字の後ろの字はその字に付けた並び）の境で割り、1行に収まらない組だけを字で割る（禁則の判定は `phrase-breaks.ts` の1か所）。

## T6-3

- 共通の画像のルートを新しい描き方（`share-image.tsx`）に移した。1ページだけのルート（道具36本・privacy・daily・ゲーム4本の42ファイル）は規約のファイル `opengraph-image.tsx` のままで、`alt` を `shareImageAlt(content)`、`size` を `share-image-frame.ts` の値から作る。privacy は名前「プライバシーポリシー」だけにし、副題の「yolos.net」（上端のサイト名の繰り返し）を無くした。
- 中身を作る関数を面ごとに1つ置いた（どれも `share-image` から型だけを読む）:
  - 道具: `toolShareImageContent`（`src/tools/_lib/share-image-content.ts`）。補助情報「ツール」・名前（h1 の `name`）・副題（h1 の下の `shortDescription`）。
  - 遊び: `playShareImageContent`（`src/play/share-image-content.ts`）。補助情報は `resolveDisplayCategory` の「診断」「クイズ」「運勢」「パズル」、名前は `title`、副題は `shortDescription`。ゲームも同じ関数を使うので、画像の副題だけのための `GameMeta.ogpSubtitle` を消した。
  - ユーモア辞典: `humorShareImageContent`（`src/humor-dict/_lib/share-image-content.ts`）。補助情報「ユーモア辞典」・名前（見出し語）・読み・副題（定義）。
- b の形（Route Handler。`force-static`・`dynamicParams = false`・`revalidate = false`、無い id は `notFound()`）で2つ組んだ:
  - `src/app/dictionary/humor/[slug]/opengraph-image/route.tsx`（30語）。`page.tsx` の `generateMetadata` が画像の値を作り、`generateHumorDictEntryMetadata` に型だけで渡す。
  - `src/app/play/[slug]/opengraph-image/route.tsx`（`getAllQuizSlugs()` の15本。music-personality を含み、`contentType` が quiz でなければ 404）。`/play/[slug]` と `/play/music-personality` の `page.tsx` が画像の値を作り、`generatePlayMetadata` に型だけで渡す。`/play/daily` は渡さず、自分の規約のファイルを使う。`generatePlayMetadata` は `twitter.images` の明示をやめ、使う所の無かった `overrides` の引数も外した。
- `twitter-image.tsx` 38本（道具36本・privacy・ユーモア辞典）を消し、`src/app/tools/__tests__/page-coverage.test.ts` の `REQUIRED_FILES` を `page.tsx` と `opengraph-image.tsx` にした。ユーモア辞典の画像の試験は、Route Handler の `GET` とページの `openGraph.images` を試す形に書き直した。
- 消した `play/[slug]/opengraph-image.tsx` だけが使っていた `getAllPlaySlugs`（`src/play/registry.ts`）とその試験を消した。20本の数とゲームの slug は、`allPlayContents` の試験が確かめている。
- 画像に書く87の中身（道具36・診断とクイズ15・daily・ゲーム4・ユーモア30・privacy）を実際の書体で描き、4書体に無い字は0件、副題を切った画像も0件（代替テキストが画像の字と一致する）。

完了の条件ごとの測り（HEAD にこのタスクの変更を重ねた本番のビルドを `next start` で配信して測った）:

1. ビルド（exit 0）・`tsc --noEmit`・eslint・prettier・vitest の全件（390ファイル・6360件、1件は skip）が通る。
2. 4書体の字: 上の87の中身で、描けない字は0件。
3. 変更の前（fc9b08c のビルド）と後の PNG を並べて見た組: ブログの69字の題（nextjs-global-not-found-for-multiple-root-layouts）と markdown-cheatsheet・道具の base64 と char-count・`/play/character-personality`・`/play/science-thinking`・`/play/music-personality`・daily・irodori・kanji-kanaru・ユーモア辞典の monday・privacy。どれも、上下の横の罫線が x=0〜1199 で途切れず、左右の縦の線が上端から下端まで通り、上下 15px の帯の字の画素が0、中身の枠の右（x>1098）へはみ出す画素が0。空白（「root layoutで not-found.tsx」、science-thinking の副題の全角の空白）は PNG に残る。400px に縮めた PNG で名前・補助情報・サイト名が読める。
4. `/play/science-thinking` は 84px の2行で「理系思考タイプ診断 —｜あなたはどの科学者型？」と折れ、「科学者型？」は1行に収まる。
5. 移したルートで `ogp-image.tsx` を import するものは0件。
6. `src/app` の `twitter-image.tsx` はルートの1本だけ。ビルドの `twitter-image.body` は154枚から1枚になった。
7. 道具36・privacy・プレイ面20・ユーモア辞典30・ブログ86の173ページのすべてで、`twitter:card` が `summary_large_image`、`og:image` と `twitter:image` が同じ URL と同じ代替テキスト（例「yolos.net 診断 音楽性格診断 音楽の聴き方であなたの性格タイプを診断。友達との相性も！」）で、`og:image`・`twitter:image`・ブログの JSON-LD の `image` の URL はどれも 200 と image/png を返した。
8. ビルドの `.body` はユーモア辞典30枚、プレイ面20枚（診断とクイズの15本と、daily・ゲーム4本の規約のファイル）。無い語・無い診断の画像の URL は 404。
9. `/play/music-personality` の `og:image`（`/play/music-personality/opengraph-image?v=4032da9e67ef81de`）は 200 の PNG で `.body` とバイト単位で同じ。PNG は補助情報「診断」・名前「音楽性格診断」・副題の画像である。
10. `/play/daily` の `og:image` は daily の規約のファイルの画像（Next が付ける hash の URL `/play/daily/opengraph-image?cbe29d0d59b98511`）のままで、中身は新しい描き方の「運勢／今日のユーモア運勢」。

## T6-9

- irodori の結果の画像（`src/play/games/irodori/_lib/share.ts`）を、来訪者の端末の Canvas のまま、`share-image-frame.ts` の枠の寸法で描き直した（3-5 の a）。1200×630、地 `PAPER`、字 `INK`・`INK_2`、線 `RULE`・`RULE_2`（`token-hex.ts`）。左の列に補助情報「イロドリ #{番号}の結果」・合計点（数字の結果、`NUMERIC_SIZE`）・ランクとその言葉、右に画面の結果と同じ形の表（見出し「問・お題・回答・点数」は太字、問の番号も太字、点数は右揃え、行と列を `RULE_2` の細い線で区切る）。見本の1辺は中身の枠の縦から決め、5問で 56px。回答の無い問は「記録なし」。
- 組み方は2つ判断した（レビューで妥当とされた）。表を合計点の下でなく右に置いた。中身の縦 422px のうち左の列が 267px を使い、見出しと5行の表を 36px の字で下に入れる余地が無いため。問は、画面の表と同じく「問」の見出しの下に番号を置いた。
- 「画像を保存」は、画像を描いて落としたあとに `trackSave("irodori", "game", "download", "fuda")` を送る。押下は3つの守りで、1度の保存のつもりの押下を1回に数える: ダブルクリック・トリプルクリックの2度目以降（`event.detail` が2以上）は、描き終えたあとに届いても捨てる。描いているあいだ（書体の読み込みを待つ）の押下は ref で捨て、`finally` で外す（キーボードの押下と描くのが遅い端末のため）。キーを押し続けたときの繰り返しの keydown（`event.repeat`）は、ボタンを押させない。キーを離して改めて押した Enter は、間が短くても2度目の保存として受ける。キーボードにはダブルクリックのような「1つの動作の2度目」の印が無い。時間で区切ると、1枚目のファイルを受け取れなかった人（落ちたことに気づかなかった・保存の確かめを閉じた）がすぐに押し直したとき、その押下を捨てて、手元に画像が残らない。捨ててはいけないのはこの押し直しで、2枚目が落ちても、落ちたファイルの数と `save` の数は一致する（1枚目を描き終える前の押下は ref の守りが捨てる）。**この出荷から、irodori の `save` は `surface="fuda"` を持って送られる。**
- **T6-6 への引き継ぎ**: `src/lib/analytics.ts` の `ShareSurface` の説明は、HEAD では「`"fuda"` は character-personality の札（result card）の保存と共有」「ゲームなど（games/fortune/dictionary）は `surface` を省く」と言っている。T6-9 をコミットした時点から T6-6 が終わるまで、この2つの文は実際（irodori の保存が `"fuda"` を送る）と食い違う。`analytics.ts` は T6-6 の受け持ち（4章の頭の表。T5-15・T5-25b と並行させない）なので T6-9 では触らず、T6-6 が 3-1 の文（「結果の画像の保存と共有を指す。診断・クイズの結果の画像と、irodori の結果の画像の保存（`content_type="game"`・`content_id="irodori"`）を含む。…」）に書き換える。T6-6 は出荷の前に終える。
- 共有の文の試験（`share.test.ts`）を、足した画像の試験と同じく日本語の名前と実の字に書き直し、ハッシュタグの行を2度試していた1件を消した。
- 描く前の書体の読み込みは、並びの書体ごとに、その書体が組む字だけを渡す。U+0000-007F は和文の並びより前の書体（IBM Plex Sans）、ほかの字は和文の並び（見出しは Zen Antique が先頭）で、この分け方（`splitByFontRange`）を、書体の読み込み（`fontLoadRequests`）と行の基線を決める所（`drawText`）の両方が使う。字を分けずに渡すと、Zen Antique が描かない数字のファイル（`U+0-FF`、16,032 バイト）を取りに行き、そのあいだ最初の保存を待たせていた（第3回のレビューの指摘1）。
- 表の行の高さは見本の1辺そのもの（5問で 56px）。問は常に5つで、行の字の高さ 50px より見本が大きい。

完了の条件ごとの測り（HEAD にこのタスクの変更を重ねた本番のビルドを `next start` で配信し、`/opt/pw-browsers` の Chromium 1194 で測った）:

1. ビルド（exit 0）・`tsc --noEmit`・eslint・prettier・vitest の全件が通る（HEAD 12d53461 にこのタスクの4ファイルを重ね、ビルドのあとに `--maxWorkers=2` で流した: 397ファイルのうち396ファイルが通り1ファイルがスキップ、6461件のうち6460件が通り1件がスキップ。irodori は6ファイル・100件がすべて通る）。行の高さを見本の1辺にした前後で、4例の PNG はバイト単位で同じ。
2. 変更の前（HEAD の `share.ts` を束ねて Chromium で描いたもの）と後の PNG を、1-5 の5問の例（お題 `#0d5661`・`#ab3b3a`・`#c3d825`・`#8b81c3`・`#fcfaf2`、点 94・90・76・60・40）・問4と問5に回答の無い例・全問 100点・全問 0点で並べて見た。前は4例とも1問目のお題と5問目の回答が画像の外に出て、端の点も切れていた。
3. 見本の矩形の座標（中身の枠は x=102〜1098・y=90〜576）: 5問の例は10枚が x=805〜968・y=191〜543、回答の無い例は8枚（と「記録なし」2つ）が x=731〜894、全問 100点は x=784〜947、全問 0点は x=813〜976 で、どれも枠の中。字の箱もすべて x=102〜1098・y=123〜540 に入る。
4. どの見本も、中央の画素が渡した色で、四隅の画素が細い枠の `#868686`（角丸が無い）。見本の上に字は無い（単体テストで字の箱と見本の重なりが0）。見本の外に彩度のある画素は0。上下 15px の帯に、字も横の罫線も無い。
5. 枠の線: 4例とも、横の太い線が y=84〜89・576〜581、縦の太い線が x=56〜61・1138〜1143 で、同じビルドの `blog/markdown-cheatsheet/opengraph-image.body` と同じ。
6. 合計点: 数字を IBM Plex Sans、「点」を Zen Antique で描く。同じ「72点」を T6-2 の描き方（`renderShareImage`）で描いた PNG と比べ、字の箱は 280×121px と 280×122px（左端 x=111・右端 x=390 は同じ）、行の箱の上端から字の上端までは 20px と 20.5px。Web フォントの読み込みを止めると、「点」は `--font-ja-heading-fallback` の並び（BIZ UDGothic が先頭）で描かれ、字の箱は同じ並びで描いた「点」と同じ 117×133px。
7. 実際の操作（行に書いたもののほかは、幅 390px で、書体を読み終えてから押した）: 5問を解き終えた画面から「画像を保存」を押すと `irodori-222.png` が1枚落ち、`save` が1回 `{content_id:"irodori", content_type:"game", method:"download", surface:"fuda"}` で送られた。押し方ごとの落ちた枚数と `save` の数（どれも保存のあいだの書体の取得は0）:

   | 押し方                                                                                                                                                                           | 落ちた枚数 | `save` |
   | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ |
   | `dblclick()`（幅 390px・1280px）                                                                                                                                                 | 1          | 1      |
   | 1度クリックし、150ms・300ms おいて同じ所を `clickCount: 2` で押した（人のダブルクリックの間。第5回のレビューも同じ間で1枚・1回を測った: [review-t6-9-5.md](./review-t6-9-5.md)） | 1          | 1      |
   | `click({ clickCount: 3 })`                                                                                                                                                       | 1          | 1      |
   | 同じ瞬間の2度の `.click()`                                                                                                                                                       | 1          | 1      |
   | Enter を押し続けた（繰り返しの keydown 4つ）                                                                                                                                     | 1          | 1      |
   | Space を1度                                                                                                                                                                      | 1          | 1      |
   | Space を押し続けた（繰り返しの keydown 6つ。離したときに1度だけ押される）                                                                                                        | 1          | 1      |
   | 押して、1秒後にもう1度押した（クリック・Enter・Space）                                                                                                                           | 2          | 2      |
   | Enter を離して 60ms 後にもう1度押した                                                                                                                                            | 2          | 2      |
   | 書体のファイルを止めて、クリック・ダブルクリック                                                                                                                                 | 1          | 1      |
   | 書体のファイルを 1.5 秒遅らせて、クリック・ダブルクリック                                                                                                                        | 1          | 1      |

   守り（`detail` の判定・繰り返しの keydown の判定）を外すと、それぞれの単体テストが落ちることも確かめた。

8. 描く時間: 1枚 12〜20ms（ページで最初の1枚は約 70ms）。
9. 書体の取得: 結果が出て書体を読み終えたあとに「画像を保存」を押すと、書体のファイルの取得は0。字を分けずに渡していた版は、同じ画面で Zen Antique の `U+0-FF` のファイル（`c938a31bc0b7eb0b….woff2`）を1つ取得していた。書体のファイルを止めたとき・1.5秒遅らせたときも、1枚が落ちて `save` が1回送られ、止めたときの「点」は `--font-ja-heading-fallback` の並びと同じ 117×133px の字で描かれた。
10. 名前と面の区切り: `npm run check:phrased-names` の字で渡すものは、触った4ファイルで0（始めと終わりで同じ）。値で渡すものは `GameContainer.tsx` の「画像を保存」（`SHARE_LABELS.saveImage.phrases`）で、T5-3b の受け持ち（T6-9 は書き換えていない）。ランクの文を手で分けた並び（`rankPhrases`）は、5つのランクとも `followsPhraseRules` を満たすことを試験で確かめる。

- レビュー:
  - [review-t6-9-1.md](./review-t6-9-1.md)（改善指示: 押し続けたときの重なり・試験の書き方の継ぎ目・この記録。対応した）。
  - [review-t6-9-2.md](./review-t6-9-2.md)（改善指示: 押下を捨てる守りのコメントが逆の意味に読める。対応した）。
  - [review-t6-9-3.md](./review-t6-9-3.md)（改善指示: 書体の読み込みが描かない書体のファイルを取る・表の行の高さの起こらない分岐。対応した）。
  - [review-t6-9-4.md](./review-t6-9-4.md)（改善指示: 書体の取得が無くなって描き終えるのが早くなり、ダブルクリックで2枚落ちた・頭のコメントの Canvas の読み込みの説明が事実と違う。対応した）。
  - [review-t6-9-5.md](./review-t6-9-5.md)（改善指示: この記録の試験の件数・`dblclick({ delay })` の説明・判断の理由。対応した）
  - [review-t6-9-6.md](./review-t6-9-6.md)（改善指示: この一覧に第5回が無い・測り7の前置きが表の一部と合わない。PM が記録を直した）
