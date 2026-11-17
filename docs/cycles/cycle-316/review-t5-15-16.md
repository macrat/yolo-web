# T5-15 レビュー（16回目。ブログの記事の枠と目次）

判定: **承認**

15回目の指摘1（`CollapsibleTOC.test.tsx` の `document.elementFromPoint` の戻し方とコメント）への直しを確かめ、そのうえで T5-15 のすべてのファイルを初めから読み直した。13回目の指摘1（見出しの書体が届く前後の h1 の行の数）は、index.md の「T5-28 を立てる」のとおり T5-28 が受け持つので、ここでは扱わない。

## T5-15 のファイル（PM がパスを指定してコミットするための一覧）

作業ツリーには、ほかのタスクの未コミットのファイルが並んでいる。T5-15 のものは次の19で、ほかのパスは含めない。

1. `DESIGN.md`（差分は §5 の目次の段の1ハンクだけ）
2. `src/app/blog/[slug]/page.tsx`
3. `src/app/blog/[slug]/page.module.css`
4. `src/app/blog/[slug]/__tests__/page.test.tsx`
5. `src/blog/_components/CollapsibleTOC.tsx`
6. `src/blog/_components/CollapsibleTOC.module.css`
7. `src/blog/_components/TableOfContents.tsx`
8. `src/blog/_components/TableOfContents.module.css`
9. `src/blog/_components/SeriesNav.tsx`
10. `src/blog/_components/SeriesNav.module.css`
11. `src/blog/_components/RelatedArticles.tsx`
12. `src/blog/_components/__tests__/CollapsibleTOC.test.tsx`（新しいファイル）
13. `src/blog/_components/__tests__/TableOfContents.test.tsx`
14. `src/blog/_components/__tests__/SeriesNav.test.tsx`
15. `src/blog/_components/__tests__/RelatedArticles.test.tsx`
16. `src/blog/_components/__tests__/MobileToc.test.tsx`（削除。`git rm` で入れる）
17. `src/lib/analytics.ts`
18. `src/lib/__tests__/analytics.test.ts`
19. `docs/knowledge/browser-layout-and-scrolling.md`（新しいファイル）

このレビューのファイル（`review-t5-15-16.md`）と、まだコミットされていない `review-t5-15-15.md` も、T5-15 の記録として同じときに入れてよい。

## 15回目の写しとの差

15回目の写し（scratchpad の `rv15-t515-snapshot.tar`、18ファイル）を展開し、作業ツリーの同じパスと1つずつ `cmp` で比べた。違うのは `src/blog/_components/__tests__/CollapsibleTOC.test.tsx` だけで、ほかの17（`DESIGN.md` と知見のファイルを含む）はバイトで同じ。動くコード（`.tsx` の処理と CSS）は15回目から変わっていないので、15回目のビルドとブラウザでの測り（86 記事・197 表で 1280 の横に送る表 0、読み始め・開いた一覧・留まった目次の画面）はそのまま効く。ビルドはし直していない。

`CollapsibleTOC.test.tsx` の差は次のとおり。

- `const originalElementFromPoint = document.elementFromPoint;` とそのコメントを消し、`placeElementFromPoint(hit)` を足した。`Object.defineProperty(document, "elementFromPoint", { value: hit, configurable: true, writable: true })` で置く。
- `beforeEach` と「画面の高さが目次を留める条件をまたいだとき」の `placeParagraph` の代入を、この関数に替えた。
- `afterEach` の戻しを `delete (document as { elementFromPoint?: unknown }).elementFromPoint;` にした。

15回目の HEAD（d015a148）から今の HEAD（c61db30b）までのコミットは2つで、どちらも `docs/cycles/cycle-316/index.md` に1行ずつ足しただけ。`src/` と `DESIGN.md` には触れていない。

## 15回目の指摘の直し

**指摘1（直った）**:

- コメントは「document.elementFromPoint を置く。jsdom はこれを持たないので、試験が置き、試験のあとで取り除く（afterEach）。」で、事実と合う。vitest の jsdom の環境で、何も置かない試験のファイルから `"elementFromPoint" in document` を読むと `false` だった。
- 置くときは `configurable: true` で定義し、`afterEach` で `delete` する。`delete` は `document` の上の自前のプロパティを消すので、元の「無い」状態に戻る。
- 書き出しの中で、このファイルの写しの最後（すべての `describe` とその `afterEach` のあと）に確かめの試験を1つ足して走らせた。`"elementFromPoint" in document` は `false`、自前のプロパティも無かった。同じ所で `requestAnimationFrame` は jsdom の本物に、`innerWidth` は既定の 1024 に戻っていた。確かめの試験は、走らせたあとで消した。
- 置く所は2か所（`beforeEach` の `() => null` と `placeParagraph` の `() => paragraph`）で、どちらも同じ関数を通る。`writable: true` なので、同じ試験の中で置き直しても通る。

## 読み直して確かめたこと

`CollapsibleTOC.tsx`・`.module.css`・`TableOfContents.*`・`SeriesNav.*`・`RelatedArticles.tsx`・`page.tsx`・`page.module.css`・4つの試験・`analytics.ts` とその試験の差分・`DESIGN.md` の差分・知見のファイルを、全部読み直した。

- `CollapsibleTOC.tsx`: 閉じているあいだの読んでいた所の記憶と戻し（`readPlace`・`restorePlace`、2フレームの戻し直し、`restoring` のあいだは覚え直さない）、開いているあいだの `matchMedia` の `change` での上端への送り、開くクリックの捕捉での送り、blur・Escape・項目の選択での閉じ方は、JSDoc・DESIGN.md §5 の目次の段・知見のファイルの1〜3項と食い違わない。`requestAnimationFrame` の ID は `frame` に持ち、effect の後始末で `cancelAnimationFrame` し、受け手も外している。
- `CollapsibleTOC.module.css`: 留める条件（`(min-height: 500px)`）は、部品の `STICKY_MEDIA_QUERY` と、ページの送りを止める規則の条件と同じで、試験がどちらも CSS から読んで確かめている。
- `page.tsx`: 記事の頭・目次・連載の案内・本文を1つのセクションに置き、共有・関連記事・前後の記事を別のセクションにしている。T5-15 の行の条件（パンくずと h1 のあいだ 16px、補助情報の字の大きさ、計測に渡す slug）は試験が見ている。
- `SeriesNav.tsx`: 開閉のラベルはサーバーで区切った並び（`seriesPhrases`・`positionPhrases`）で組んでいる。
- `analytics.ts`: `trackTocOpen`・`trackTocJump` のイベントの形は、11章の決定と T5-15 の行（`content_type: "blog"`、`content_id` に slug、`section_id`・`section_level`）と一致する。
- コメントと試験の名前に、経緯の書き方（前は・変えた・名残）は無い。知見のファイルの「根拠」にある、前のレビューの測りと直す前の形の数は、知見のファイルが自分で決めた書き方（実測の根拠と、対照・使えない形）どおりで、ツギハギにはあたらない。

### 指摘にしなかったもの

- `CollapsibleTOC.test.tsx` の `afterEach` は、`window.gtag` を消さず、`value: undefined` のプロパティにする（このファイルの確かめの試験では、あとに `"gtag" in window` が `true` で残った）。`elementFromPoint` と同じく、元の「無い」状態には戻っていない。それでも指摘にはしない。これは `src/lib/__tests__/analytics.test.ts` の `afterEach` と同じ、このリポジトリで決まった形である。送る側の `sendGaEvent` は `if (!window.gtag) return;` で「無い」と「undefined」を同じに扱うので、「gtag の無い環境でも」の試験は来訪者の環境と同じ道を通る。事実と違うことを言うコメントも無い。vitest はファイルごとに環境を分けるので、ほかのファイルにも漏れない。
- 共有のセクションだけが `aria-labelledby` を持ち、関連記事と前後の記事のセクションは持たない。前後の記事は中の `nav` が「前後の記事（時系列順）」という名前を持ち、関連記事は一覧が見出しの名前を持つので、読み上げで場所を見失わない（5回目のレビューが確かめたとおり）。

## 試験と検査

HEAD（c61db30b）を scratchpad の自分だけのサブディレクトリ（`rv16/ex`）に `git archive HEAD | tar -x` で書き出した。`node_modules` が無いことを確かめてから `cp -al` で置いた。そのうえで上の18のパスを作業ツリーのものに重ねて1つずつ `cmp` で一致を確かめ、`MobileToc.test.tsx` を消し、`npm run generate:release-id` を走らせた。終えたあと、書き出しと写しの展開を消した。サーバーは立てていない。

- `npx vitest run --maxWorkers=2 src/blog src/app/blog src/lib/__tests__/analytics.test.ts`: 18 ファイル・225 件のうち、224 件が通った。落ちた1件は `page.test.tsx` の「記事の JSON-LD の image と openGraph.images の url が、同じ画像の URL であること」で、60 秒の上限を越えた時間切れだった。このときの機械の負荷は、4 コアで load average 28 前後だった。この試験は記事の本文を Shiki で組むので、初めの1回が重い。`src/app/blog` だけを走らせ直すと、3 ファイル・25 件がすべて通った。`CollapsibleTOC`・`TableOfContents`・`SeriesNav`・`RelatedArticles`・`analytics` の試験は、1回目の走りで通っている。
- `npx tsc --noEmit`: 終了コード 0。
- `npx eslint "src/app/blog/[slug]" src/blog src/lib/analytics.ts src/lib/__tests__/analytics.test.ts`: 終了コード 0。
- `npx prettier --check`（T5-15 のコードのパス、`src/blog/_components/__tests__/*.tsx`、`DESIGN.md`、知見のファイル）: 通る。
- 撤去の残骸: `MobileToc`・`contentColumn`・`articleAside` を `src/`・`DESIGN.md`・`docs/*.md`・`.claude/` で grep した。当たるのは 2026-05-13 のブログ記事（`grid-column-and-dom-order`）の本文だけで、当時の記録なので対象外。

## アンチパターンの点検（docs/anti-patterns/implementation.md）

- **AP-I01（来訪者の体験を独立に見たか）**: 該当なし。今回の変更は試験の中だけで、来訪者の画面は15回目から変わらない。15回目が本番のビルドで、86 記事の表を 1280 で開き、目次の読み始め・開いた一覧・留まった目次をライトとダークで撮って、来訪者の目で見ている。動くコードが同じことは `cmp` で確かめた。
- **AP-I02（場当たりの回避）**: 該当なし。直しは、置いたものを試験のあとで取り除く形に、置き方ごとそろえたもの。個別のケースの決め打ちではない。
- **AP-I03（Core Vitals・バンドル）**: 該当なし。動くコードは変わっていない。目次の部品はクライアントの小さな部品で、大きなデータの静的な import は無い。
- **AP-I04（指標を直接の目的に）**: 該当なし。`toc_open`・`toc_jump` は目次が使われているかを読むための計測で、置き方や見た目を指標のために変えていない。
- **AP-I05（目的に無関係なもの）**: 該当なし。目次は記事の章へ移る道で、留めるのは閉じた形だけ。
- **AP-I06（反対の極端）**: 該当なし。直しは戻し方とコメントに限られ、ほかの置き換え（`vi.stubGlobal`）の形はそのまま。
- **AP-I07（jsdom で見えないもの）**: 該当なし。留める・送りを止める・回したときの戻しは、前の回までに本番のビルドの Chromium で測ってある。動くコードは変わっていない。jsdom の試験は、座標が要る所を `getBoundingClientRect` と `elementFromPoint` の置き換えで与えている。そのことはコメントが書いている。
- **AP-I08（DESIGN.md に無い表現）**: 該当なし。目次のボックス・`--paper` の地・hover の線は、DESIGN.md の §5・§6 にある。
- **AP-I09（コミットの順）**: 該当なし（未コミット）。コミットのときは、`MobileToc.test.tsx` の削除と `CollapsibleTOC` まわりを同じコミットに入れる。`analytics.ts` の2つの関数を使うのは `CollapsibleTOC.tsx` なので、2つを分けるなら `analytics.ts` を先にする。上の19のパスを1つのコミットにまとめれば、順を気にしなくてよい。
- **AP-I10（`@keyframes` の参照）**: 該当なし。インラインのアニメーションは無い。
- **AP-I11（タイマーの後始末）**: 該当なし。`setTimeout`・`setInterval` は無い。`requestAnimationFrame` は `frame` に持ち、effect の後始末で `cancelAnimationFrame` し、受け手も外している。
- **AP-I13（撤去の残骸）**: 該当なし。上の grep のとおり。
- **AP-I14（共有の部品の撮り比べ）**: 該当なし。共有の部品（`Accordion`・`Section`・`Prose`・`ItemList` など）の指定は、T5-15 では変えていない。

作業の進め方（docs/anti-patterns/workflow.md）:

- 今回の依頼は、記事と表の数を渡さず、「15回目から動くコードは変わっていない」という前提も `cmp` で確かめさせる形だった。AP-WF06・AP-WF14 の件は繰り返されていない。
- AP-WF01 について: この判定は T5-15 の最後の直し（試験のファイル）までを見ている。コミットの前に T5-15 のファイルをさらに変えるなら、もう1度レビューが要る。

## 指摘事項

なし。

## PM への連絡（判定には関わらない）

- 読んでいる途中で、トラスト面の検知（`.claude/hooks/trust-guard.sh`）が `.claude/skills/frontend-design/SKILL.md` の変更を知らせた。作業ツリーの差分は1行の追加で、記事の外の表を `DataTable`（`src/components/DataTable`、作業ツリーにまだコミットされていないディレクトリがある）で組む決まりを足している。T5-15 のファイルではなく、ほかのタスクの作業に見える。注入のような指示は含まれていない。どのタスクの変更か、PM が確かめてからコミットしてください。
- t5-design.md の T5-15 の行の完了の条件は「87記事・197表」と書いている。公開している記事は 86（md の 87 本のうち、下書きが1本）で、14回目と15回目が数えた数も 86 記事・197 表である。この行はサイクルの文書なので T5-15 の指摘にはしないが、完了の記録には 86 記事・197 表と書いてください。
- 全体の試験の走りは、機械の負荷で T5-15 の外の試験や `page.test.tsx` の重い1件が時間切れになることがある。コミットの前の検査は、負荷の低いときに走らせてください。
