# T5-22b のレビュー（1回目。作業ツリーの未コミットの21ファイル）

## 判定: 承認

完了の条件を満たし、対象のルートに漏れは無く、正しいページのメタデータと静的生成は変わらない。直すべき指摘はありません。

## 完了の条件（t5-design.md の T5-22b の行）

本番ビルド（HEAD に21ファイルを重ねた書き出し、`next start`）を Chromium で開き、読み込みのあと（networkidle ＋ 0.8 秒）の `document.title` と `meta[name="robots"]` を数えた。

| URL                                                                                                                                          | 状態 | サーバーの HTML                                       | 読み込みのあと                   |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ----------------------------------------------------- | -------------------------------- |
| 条件の5つ（`/zz-not-exist`・`/dictionary/kanji/zz`・`/play/zz`・`/tools/zz`・`/blog/zz`）                                                    | 404  | 「ページが見つかりません \| yolos.net」・`noindex` ×1 | 同じ                             |
| `/dictionary/{colors,humor,yoji}/zz`                                                                                                         | 404  | 同上                                                  | 同じ                             |
| 見つからない結果: `/play/zz/result/x`・`/play/kanji-level/result/zz`・専用の結果のルート9本の `/play/*/result/zz`                            | 404  | 同上                                                  | 同じ                             |
| 正しいページ16本（ブログ1・辞典4（`/dictionary/kanji/山` を含む）・`/play/kanji-level`・`/play/kanji-level/result/advanced`・専用の結果9本） | 200  | それぞれの題・robots が1つ・canonical が1つ           | 同じ（題も robots も変わらない） |

結果のページの robots は、読みものを持つタイプの `index, follow` と、持たない `kanji-level/result/advanced` の `noindex, follow` のどちらも元のまま。加えて、`/blog`・`/play`・`/dictionary/kanji` からクライアントの遷移（`router.push`）で `/blog/zz`・`/play/contrarian-fortune/result/zz`・`/dictionary/kanji/zz` に移ったときも、題は「ページが見つかりません | yolos.net」、robots は `noindex` の1つ、h1 は「ページが見つかりません」だった。

## 対象のルートの漏れ

- `src/app` の `generateMetadata` を持つ全ファイルを読んだ。該当なしで `{}` や既定を返すのは今回の16本だけで、どれも `notFound()` に変わった（`play/[slug]/result/[resultId]` の2か所を含む）。
- 一覧のルート（`blog`・`dictionary`・`play`・`tools` の `page/[page]`・`category`・`tag`・`grade`・`radical`・`stroke`）は、`generateMetadata` の中の `resolvePage`・`resolveScope` が該当なしで `notFound()` を呼ぶので、もとから同じ形。`storybook/list/[sample]` は `dynamicParams = false`。
- 残る `return {}` は `src/app/play/music-personality/page.tsx` の1つだけ。これは固定の slug の専用ルートで、URL から該当なしに至る道が無いので対象外でよい（このファイルは T6-3 が触る）。
- `play/[slug]` は `generateMetadata` が `playContentBySlug`、本体が `quizBySlug` を引く。前者にあって後者にも専用のディレクトリにも無い slug があると、本体が 404 なのに題が付く食い違いが出るが、全20件を調べて該当は0件だった。

## 静的生成とメタデータへの影響

- `notFound()` は該当があるときは通らないので、正しいページの戻り値は変わらない（上の表で確かめた）。
- ビルドは 4107/4107 ページを生成し、`Route (app)` の表は builder の直す前のビルド（`t522b-build-before.log`）と行ごとに同じ（SSG・Dynamic の区分も変わらない）。`generateStaticParams` は該当のある値しか返さず、`dynamicParams` の既定（true）のままなので、該当なしは要求のときに描かれ、404 になる。
- `notFound()` の戻り値は `never` なので、以降の `post`・`result` などの絞り込みは効き、`tsc --noEmit` は通る。

## 試験

- 4本の試験が `rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404")` で待つ形は、Next.js の公式の説明（`notFound` の API リファレンスに「`NEXT_HTTP_ERROR_FALLBACK;404` error を投げる」とある）に書かれた値で、同じリポジトリの `src/lib/__tests__/list-pages.test.ts` とも同じ形。`notFound` を差し替えず本物を呼ぶので、差し替えの文字列（`NEXT_NOT_FOUND`）に頼る他の試験より確かめる範囲が広い。
- 試験の名前（「notFound を呼ぶ」）は中の expect と一致する。
- 他の12本は、もとから「該当なしで `{}` を返す」ことを試していなかったので、今回試験が無くても後退ではない。

## `docs/knowledge/nextjs.md` §13

- 見出しを「題と robots は `not-found.tsx` とページの `generateMetadata` の両方で決まる」に広げ、2つの道を箇条に並べ、対処・根拠の順で書く。ほかの節（何が起きるか → 対処 → 根拠）と同じ形。
- 対処は再利用できる事実（`{}` を返さず `notFound()` を呼ぶ・ブラウザで読み込みのあとの題と robots を数える）で、経緯は置いていない。根拠は「実測（cycle-316 …）」と種別とサイクルを書き、docs/README.md の knowledge の運用ルールに合う。
- 「サーバーの HTML だけを見る確かめ方では見つからない」は、この不具合が T5-22 の HTML の確かめで漏れた理由そのもので、次に同じ確かめ方をする人に効く。

## 動かしたもの

- 書き出し（scratchpad の新しいディレクトリ、HEAD ＋ 21ファイル、`node_modules` が無いことを確かめて `cp -al`）で `npm run build`（成功）・`tsc --noEmit`（エラー0）・`vitest run src/app/play src/app/blog src/app/dictionary`（26ファイル 209件 成功）・21ファイルの `prettier --check` と `eslint`（どちらも0件）。
- 作業ツリーには、21ファイルの外に `src/app/play/__tests__/page.test.tsx` の未コミットの変更（別の担当）があったので、書き出しではそれを HEAD に戻して除いた。
- サーバーは自分の起こした `npm exec`・`sh`・`next-server` の PID だけを止め、書き出しは消した。

## 範囲の外で気づいたこと（今回の判定には入れない）

- `/dictionary/{kanji,yoji,colors}/%25`・`/blog/%25` のように、動的ルートの値が `%` を含む URL は、Next.js 自身が「failed to decode param」で 500 を返す（動的ルートでない `/tools/%25`・`/%25` は 404）。ページのコードに入る前の Next.js の動きで、今回の変更とは無関係。必要なら別のタスクで扱う。
