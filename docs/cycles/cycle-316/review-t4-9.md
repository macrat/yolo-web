# T4-9 のレビュー（コミット baac5eb）

対象: 描かれない値（`accentColor`・伝統色診断を除く診断の結果の `color`・`icon`（`QuizResult`・`QuizMeta`・`GameMeta`・`PlayContentMeta`）・`coreSentence`）を、型・データ・写し・相性の API・部品・テストから外す変更（87ファイル）。

確かめたもの: t4-design.md の 3-7 と T4-9 の行、index.md の T4-9 の覚え書き（`coreSentence` と見出しの書体のテスト）、backlog の B-578（「クイズデータに描画されない色の値が残っていない」）、`docs/anti-patterns/implementation.md`・`workflow.md`。本番のビルドを変更前（baac5eb~1）と変更後（baac5eb）で1つずつ作り、ページの字と画素、ビルド時に描かれる画像を比べた。

## 完了の条件

| 条件                                                              | 結果                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/` の `accentColor` が0件（ブログ記事のコードの例を除く）     | 満たす。`grep -rn accentColor src/ scripts/` は `src/blog/content/2026-02-22-game-infrastructure-refactoring.md` だけ                                                                                                                                                                                                                                         |
| `color` を持つ診断の結果が伝統色診断だけ                          | 値としては満たす。`src/play/quiz/__tests__/registry.test.ts` に「結果そのものが色である診断だけが color を持つ」テストが足され、通る。ただしデータのファイルのコメントに、消した色の hex と色の作り方が残る（Major-1）                                                                                                                                        |
| `icon` が4つの型とデータに0件                                     | 満たす。`src/play/quiz/types.ts`・`src/play/types.ts`・`src/play/games/types.ts`・`src/play/registry.ts`・`src/play/games/registry.ts`・`src/play/quiz/data/` に `icon` は無い。残る `icon` は `site-metadata.ts`（favicon）・`markdown-extensions.ts`（GFM Alert）・`ogp-image.test.tsx` の `@ts-expect-error`（受け取らないことを固定するもの）で、別の機能 |
| 相性の API が友だちの結果の名前を変更前と同じく返す（単体テスト） | 満たす。`route.test.ts` が `myType`・`friendType` を `toEqual({ title: "…" })` で具体の名前と照らす。形が `{ title }` だけになったことも同時に固定している。通ることを確かめた                                                                                                                                                                                |
| B-578 の条件を満たす                                              | 満たさない。Major-1 のとおり、`character-personality-results-batch2.ts`・`batch3.ts` に、描かれない色の値（hex）がコメントとして残る                                                                                                                                                                                                                          |

`coreSentence` は `src/` に0件で、index.md の覚え書きのとおりテスト（ContrarianFortuneContent・contrarian-fortune の2つのデータのテスト）も一緒に消えている。

## 見た目が変わらないこと

- 変更前と変更後の本番のビルドで、次の16の URL を幅375・占いの種を `localStorage` で同じ値に固定して開き、`document.body.innerText` と全体のスクリーンショットを比べた。**字も PNG のバイト列もすべて同じ**だった: `/`・`/play`・`/play/daily`・character-personality の結果（相性つき・なし）・yoji-personality・unexpected-compatibility・traditional-color・music-personality（相性つき）・animal-personality（相性つき）の結果・`/play/kanji-kanaru`・`/play/irodori`・`/play/character-personality`・`/play/contrarian-fortune`・札の画像の2つの URL。
- ビルド時に描かれる画像（`.next/server/app` の `*image*.body`、OGP と札の731枚）の md5 は、変更前と変更後ですべて同じだった（変更前に1枚多いのは、わたしが確かめのために変更前のサーバーで開いた未知の id `nope` の札が後から描かれたもので、比べる対象の外）。
- 消した2つのテストの塊について: 変更前のコードで `result.color` を読んでいたのは、伝統色診断の OGP（`colorOverride`）と結果のページの色見本、`ResultCard` の色見本（`variant === "traditional-color"` のときだけ）、`OtherTypesNav`（`showSwatch` のときだけで、渡すのは `TraditionalColorContent` だけ）だけだった。yoji-personality の OGP（`opengraph-image.tsx`）は `title` と `subtitle` しか渡さず、「OGP画像用」というテストの名は変更前からすでに事実と合っていなかった。unexpected-compatibility の WCAG の塊が前提にしていた `color-mix(in srgb, typeColor 70%, white)` の見出しは CSS に無く（`type-color` の grep は0件）、`icon` も `CompatibilitySection` の型にあっただけで描かれていなかった。消してよい。上の画素と画像の一致が、これを裏づける。

## 札の画像が 404 になるという builder の報告

再現しない。本番のビルド（変更前・変更後の両方）で:

- `/play/character-personality/result/blazing-strategist/fuda-image` は `200 image/png`。
- 結果のページを開いたうえでページの中から `fetch` しても（`FudaActions.tsx:79` と同じ相対 URL）、`200 image/png`。
- 経路は `src/app/play/character-personality/result/[resultId]/fuda-image/route.ts`（`force-static`・`generateStaticParams` で24タイプ）で、ビルドの出力にも24件の `●` として出て、`.next/server/app/.../fuda-image.body` と `.meta`（status 200・`image/png`）が作られている。未知の id（`nope`）と末尾の `/` つきも 200 だった。
- `middleware.ts` の `matcher` は `/blog/:path*` だけで、この経路にかからない。

したがって本番の不具合ではない。builder の 404 は、確かめた側の問題（ほかのエージェントのサーバーやビルドし直し中の `.next` に当たった、`<id>` を実在しない形で組んだ、など）と考えられる。確かめ方の誤りで「前も後も 404 なので変わらない」と結論したのは、確かめとして成り立っていない（Minor-5）。

## /play/daily の字数が 474 から 475 に変わったこと

変更のせいでも日付のせいでもない。`src/play/fortune/logic.ts:57` は `localStorage` に種が無いと `Math.random()` で種を作るので、新しいブラウザの文脈ごとに違う運勢が出る。種を固定すると、変更前と変更後の字（471字）も画素も同じだった。種を固定しない文脈では、同じ日・同じビルドでも 367字と375字のように変わる。

## 見出しの書体のテスト（`heading-font-coverage.test.ts`）

意味がある。`ResultCard`（クライアントの部品）が見出しの書体の属性なしで描くものを見ると:

- 相性の名前は、解き終えた画面（`placement: "solvedScreen"`）で `<Heading>{compatibility.label}</Heading>` と属性なしで描かれる（`CompatibilitySection.tsx:65`）。これを確かめるテストはほかに無く、新しい守りになる。
- 読みものの小見出しは `solvedScreenReadingHeadings` で全件を挙げており、属性なしで描かれる経路に合っている。
- 設問文は `src/lib/__tests__/zen-antique-charset.test.ts` のインラインスナップショット（「診断とクイズの設問」: []）と重なる。ただしスナップショットは `-u` で黙って更新されうるのに対し、こちらは「空であること」を断言するので、重なっても害は無い。
- タイプ名はサーバーで `headingFontAttr` を作って渡している（`solvedScreenHeadings.ts`）ので、この表に入らないのは正しい。

弱い点は Minor-3 に書く。

## 指摘

### Critical

なし。

### Major

**Major-1: 消した色の値と、その作り方のコメントがデータに残る（AP-I13・B-578・ツギハギ禁止）**

`color` の値だけを消し、その値を説明していたコメントを残している。

- `src/play/quiz/data/character-personality-results-batch2.ts:4-13`: 「Archetypes and base colors: commander = #e11d48 …」「Colors are blended from the two component archetypes (primary × 0.7 + secondary × 0.3). Same-type reinforcement uses a deepened version of the archetype color.」
- `src/play/quiz/data/character-personality-results-batch3.ts:10-17`: 「Color blending reference (Q25 archetype colors): commander = #e11d48 …」
- 同 `:23`・`:47`・`:71`・`:95`: `// color: artist純粋 → #7c3aed そのまま`・`// color: guardian=#059669とprofessor=#2563eb の中間 → #1a7a8f（青緑）` など、もう存在しない結果の色の決め方。

このファイルの結果にはもう `color` が無いので、これらは読む人に「どこかでこの色を使っている」と思わせる誤りのコメントであり、B-578 の「描画されない色の値が残っていない」にもそのまま当たる（旧青 hex の `#2563eb` を含む）。T4-9 の完了の条件の「B-578 の条件を満たす」を満たしていない。batch2 の見出しのコメントは色の段落を消し、アーキタイプの一覧が色以外の意味で要るならそれだけを残す。batch3 は4か所の `// color:` の行と冒頭の「Color blending reference」の段落を消す。直したあと、`grep -rnE "#[0-9a-fA-F]{6}|colou?r" src/play/quiz/data/ --include=*.ts`（伝統色診断を除く）で、残りが0件か、色の値でない偽陽性だけであることを確かめる。

### Minor

**Minor-1: 中身の無くなった確かめが残る（AP-I13 の (3)）**

- `src/play/quiz/_components/__tests__/ResultCard.test.tsx:471-478`「包み・印・記号面・「診断完了」・絵文字を持たない」の `expect(screen.queryByText("🦊")).not.toBeInTheDocument()`: 🦊 は同じ変更で `typeResult` から消した `icon` の値で、もう入力のどこにも無いので必ず通る。絵文字を描かないことは型から `icon` が消えたことで保証されるので、この行を消す。
- `src/play/quiz/_components/__tests__/RelatedQuizzes.test.tsx:112-118`「does not render emoji icons」の `📖`・`🈵`: データから `icon` を消したので、同じく入力に無い字を探すだけになった。テストごと消すか、描く部品が絵文字を受け取る道が無いことを別の形で確かめる。
- `ResultCard.test.tsx:1373`「result.color が未設定の場合、キャッチコピーがインラインスタイルを持たないこと」: キャッチコピーを色で塗る処理は既に無く、直前のテスト（`container.querySelector("[style]")` が null）が同じことをより強く確かめている。重複なので消す。

**Minor-2: テストの名とモックに、消した概念が残る**

- `src/play/__tests__/color-utils.test.ts:51`「占い系の紫系色(#6c5ce7)に対して白(#ffffff)を返す」: 変更で直前の「accentColorとして実際に使われる色のテスト」のコメントは消したが、テストの名が「占い系」の色という、もう無い役目を言っている。「紫(#6c5ce7)」のように色だけで言う。
- `ResultCard.test.tsx` の impossible-advice・unexpected-compatibility のモック（`:317`・`:323`・`:342`・`:348`）と、yoji・unexpected-compatibility などの結果のフィクスチャ（`:425`・`:1336`・`:1405`・`:1472`・`:1507`・`:1547`）は、実データではもう持てない `color` を持たせている。「色を持つ結果を渡されても伝統色以外では色見本を描かない」ことを試すフィクスチャ（`:425` など）は意図があるので残してよいが、その意図の無いモック（`vi.mock` のデータ）の `color` は、実データと違う形を示すので消す。

**Minor-3: 相性の表の一覧が手で書かれている**

`heading-font-coverage.test.ts` は相性の表を6つ `import` して並べる。今の6つ（`export const compatibilityMatrix` を持つデータの全件）とは一致するが、相性を持つ診断を足したときにこの一覧に足し忘れても、テストは黙って通る。`registry` から相性を持つ診断を引けるならそこから作るか、`src/play/quiz/data/` で `compatibilityMatrix` を持つファイルの数とこの表の数が一致することを確かめる1行を足す。

**Minor-4: 伝統色だけという条件が2か所に重なる**

`ResultCard.tsx:463-464`（`variant === "traditional-color" ? result.color : undefined`）と `OtherTypesNav` の `showSwatch` は、どの結果が色を持ちうるかを部品の側でも決めている。今は型の説明（「結果そのものが色である診断だけが持つ」）と registry のテストが、データの側でそれを保証する。部品の側の条件は害は無いが、同じ決まりが3か所にあることになる。データの `color` の有無だけで色見本を出すようにそろえるか、残すなら今のままでよいかを PM が決める（直さなくても来訪者に見える差は無い）。

**Minor-5: 札の画像の確かめが成り立っていない**

上に書いたとおり、札の画像は本番で 200 を返す。builder は 404 を「前も後も同じ」として扱ったが、来訪者の保存と共有を支える経路が 404 と観測されたなら、その時点で原因を突き止めるべきだった（確かめ方の誤りが、変更の影響を見る確かめそのものを空にしている）。次の確かめでは、`/play/character-personality/result/blazing-strategist/fuda-image` が `200 image/png` であることを、自分で起こしたサーバー（自分の PID・自分の worktree）で確かめ、結果を記録に残す。

## アンチパターンの点検（implementation.md）

- AP-I01: 来訪者に見えるものは変えない変更なので、来訪者の体験は「変わらないこと」で評価した。16の URL の字と画素、731枚の画像が同じで、体験は損なわれない。一方、データのコメントの誤り（Major-1）は来訪者でなく後の作り手を誤らせる。
- AP-I02: 値を消す本来の直し方で、オプショナルな抜け道は足していない。`color` を任意のまま伝統色に限るのは設計（3-7）どおり。Minor-4 は重なりの整理の話。
- AP-I03: 消すだけで、バンドルは減る方向。静的な import の追加はテストだけ。
- AP-I04・AP-I05・AP-I06: 当たらない（指標のための配置やコンテンツの足しは無い）。
- AP-I07: 本番のビルドで確かめた（画素・画像・札の経路）。
- AP-I08: 視覚表現の追加は無い。
- AP-I09: 1つのコミットにまとまっており、途中の状態は無い。
- AP-I10・AP-I11: 当たらない（アニメーションとタイマーに触れていない）。
- AP-I13: 当たる。わたしの一括の grep（`accentColor`・`coreSentence`・`icon`・`\.icon`・`icon=`・`resultIcon`・`type-color`・`typeColor`・`resultColor`・`result.color`・`accent`・`絵文字`・`#[0-9a-f]{6}`・`colou?r` を `src/`・`scripts/` で）で、Major-1 のコメントと Minor-1・Minor-2 のテストの残りが見つかった。それ以外のヒット（`--accent` のトークン、favicon、GFM Alert、`ogp-image.test.tsx` の `@ts-expect-error`、伝統色の実データと部品、irodori と伝統色パレットの `result.colors`）は別の機能か偽陽性。
- AP-I14: 共有の部品（`ResultCard`・`CompatibilitySection`・`CompatibilityDisplay`）への変更は受け取らない prop を外すだけで、見た目の指定には触れていない。念のため使う面の代表を画素で比べ、同じだった。

workflow.md: 確かめ方の誤り（札の 404 を原因を見ずに「前後同じ」とした）は Minor-5 に書いた。

## 判定

**改善指示**。Major-1 で B-578 と T4-9 の完了の条件が満たされておらず、Minor-1〜5 もある。builder に Major-1 と Minor-1〜3 を直させ（Minor-4 は PM が決める）、そのあと、前回の指摘だけでなく全体を見直すレビューをもう一度依頼すること。
