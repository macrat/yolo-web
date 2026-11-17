# T5-8（記事の外の表の共有の部品 `DataTable`）のレビュー（4巡目）

対象: コミットしていない T5-8 の変更の全体。3巡目の Minor-1〜3 の直しだけでなく、全体を見直した。照らしたもの: `CLAUDE.md`、`docs/constitution.md`、`DESIGN.md` §4・§5、frontend-design のスキル、t5-design.md の T5-8 の行、review-t5-8-1.md〜3.md、`docs/anti-patterns/implementation.md`・`workflow.md`。

## 判定: 承認

3巡目の3つの指摘は、どれも直っている。3巡目のあとの動きの変更は、この3つだけだった。

- 開いた行を閉じると、見える幅の値が枠から外れる。
- 閉じたまま幅を変えても、古い値は残らない。
- 開き直すと、そのときの幅の値が付く。

記事の197表は、6条件のどれでも HEAD と1つも変わらない。指摘は無い。

## T5-8 のファイル（PM がコミットするもの）

- `src/components/DataTable/index.tsx`（新規）
- `src/components/DataTable/DataTable.module.css`（新規）
- `src/components/DataTable/__tests__/DataTable.test.tsx`（新規）
- `src/lib/scroll-frame.ts`
- `src/lib/__tests__/scroll-frame.test.ts`
- `.claude/skills/frontend-design/SKILL.md` の、`DataTable` の1項（141行目の1行の追加）の差分の塊だけ

SKILL.md の `git diff` は、いまも2つの塊を持つ。

- `@@ -120,7 +120,7 @@`: Web フォントの項。ほかのタスク（T5-28）の変更で、T5-8 に含めない。
- `@@ -138,6 +138,7 @@`: `DataTable` の項。これが T5-8 の変更。

T5-8 の塊だけを載せる手順は次のとおり（対話の `git add -p` はこの環境で使えない）。

```sh
git diff .claude/skills/frontend-design/SKILL.md > tmp/skill.diff
{ sed -n '1,4p' tmp/skill.diff; awk '/^@@ -138,/{p=1} p' tmp/skill.diff; } > tmp/skill-datatable.patch
git apply --cached --check tmp/skill-datatable.patch
git apply --cached tmp/skill-datatable.patch
git diff --cached .claude/skills/frontend-design/SKILL.md
```

- 最後の `git diff --cached` が、`DataTable` の項の1行の追加だけを示すことを確かめる。
- 残りの5つのファイルは、パスを指定して `git add` する。
- この手順で作ったパッチは、今の索引に対して `git apply --cached --check` が通ることを確かめた（索引は変えていない）。

作業ツリーのほかの変更は、ほかのタスクのもので T5-8 に含めない。たとえば `DESIGN.md`・`src/app/globals.css`・`src/lib/phrase-breaks.ts`・`src/middleware.ts`・ToolPageLayout・RelatedTools がそうである。`DataTable` と `scroll-frame.ts` は `phrase-breaks.ts` を読み込まないので、それを含めずにコミットしても壊れない。

レビューの途中で HEAD が 74f945de から f2224871 に進んだ（T5-20b と文書）。進んだ分は T5-8 のファイルに触れない。

## 確かめたこと

`git archive HEAD`（74f945de）を scratchpad の自分の下の書き出しに展開した。node_modules が無いことを確かめてから、`cp -al` で入れた。

重ねたのは、上の5つのファイルと、SKILL.md の `DataTable` の塊だけのパッチである。そのあと `npm run generate:release-id` を流した。重ねた5つのファイルは、測り終えた時点でも作業ツリーのものと同じだった。

- `tsc --noEmit`: エラー0。
- `eslint .`: 0。
- `prettier --check .`: すべて整形済み。
- `vitest run --maxWorkers=2`（`DataTable`・`scroll-frame`・`Prose`・`ResultBox`・`markdown`・`markdown-extensions`）: 6ファイル・142件がすべて通った。3巡目の141件に、開いてから閉じる試験の1件が足された。
  - 初めの一括の実行では、`markdown.test.ts` の `beforeAll` の温め（60秒）が時間切れになった。そのときの機械の負荷の平均は29（4コア）だった。
  - `markdown` だけを流し直すと、2ファイル・87件がすべて通った。
- `npm run build`: 通った。試しのページ `/zz-dt` は書き出しにだけ置いた。

`next start` をポート 4417 で `setsid` で動かし、`/opt/pw-browsers/chromium-1194` の Chromium で測った。200% は CDP の `Page.setFontSizes`（standard 32）で作り、ルートの字が 32px であることを記録した。

測り終えたあと、自分のサーバーのプロセスグループだけを `kill -- -PGID` で止めた。そのあと `.next` と書き出しを消した。

### 1. 3巡目の指摘の直し

**Minor-1（開いた行のセルの2つの印）**:

- 開いた行のセルは `data-detail` だけを持ち、`styles.detail` は部品のどこにも残っていない。
- CSS は `.table [data-detail]` で選ぶ。詳細度は直す前の `.table .detail` と同じ (0,2,0) なので、`.table :is(th, td)` の `keep-all` に勝つ。
- 本番のビルドの 320px で開いた行のセルの属性を読むと、`colspan` と `data-detail` だけだった。計算値は `word-break: normal`・`overflow-wrap: anywhere` で、中身の箱は `position: sticky` だった。

**Minor-2（閉じても見える幅が残る）**: `layoutTable` は、開いた行が無ければ `removeProperty("--frame-visible-width")` で外す。関数のコメントも「開いた行が無くなれば外す」と約束を足している。

部品の試験「開いてから閉じた表は、見える幅を持たない」を足していることも確かめた。書き出しで `else` の `removeProperty` の3行を消すと、この試験だけが落ちた（`expected '79px' to be ''`）。ほかの32件は通った。戻したあと、作業ツリーのファイルと同じであることを `cmp` で確かめた。

**Minor-3（コメントの1行だけが長い）**: 部品のコメントの3段落目は、全角を2と数えて 111・107 桁に折り直され、ほかの段落（107〜110 桁）とそろう。

### 2. 3巡目からの動きの変更が3つだけか

3巡目のレビューが書き出しに残した `scroll-frame.ts`（`r3-t58/sf-new.ts`）と、いまのファイルを `diff` で比べた。違いは次の2つだけだった。

- コメントの1行
- `else { removeProperty }` の2行

`index.tsx` と `DataTable.module.css` は通して読み直した。3巡目の指摘の直し（印を属性だけにした所・セレクタ・コメントの折り直し）のほかに、動きの違いは見当たらない。試験の数は、足した1件のぶんだけ増えた。

### 3. 開いて閉じ、幅を変える（本番のビルド）

試しのページに、敬語の4行・4列の表を2つ置いた。行の頭のボタンで行を開け閉めする。

- 表 a: 枠で横に送る表。
- 表 b: `ResultBox kind="table"` の中の `inBox` の表。

320・375px のそれぞれで、既定と 200% について、表ごとに次の順で枠の `--frame-visible-width` を読んだ。

1. 開く
2. 最後まで送る
3. 閉じる
4. 閉じたまま、もう一方の幅（375↔320）に変える
5. 閉じたまま 600px に変える
6. 600px で開く
7. 元の幅に戻す
8. 閉じる

| 条件        | 開く（見える幅と同じ値） | 閉じる | 閉じたまま 375↔320 | 閉じたまま 600px | 600px で開く | 元の幅に戻す（開いたまま） | 閉じる |
| ----------- | ------------------------ | ------ | ------------------ | ---------------- | ------------ | -------------------------- | ------ |
| 320px・既定 | a 244・b 244             | 無し   | 無し               | 無し             | a 546・b 524 | a 244・b 244               | 無し   |
| 320px・200% | a 244・b 244             | 無し   | 無し               | 無し             | a 546・b 524 | a 244・b 244               | 無し   |
| 375px・既定 | a 321・b 299             | 無し   | 無し               | 無し             | a 546・b 524 | a 321・b 299               | 無し   |
| 375px・200% | a 299・b 299             | 無し   | 無し               | 無し             | a 524・b 524 | a 299・b 299               | 無し   |

- どの値も、そのときの送る区画の中身の幅（線と余白の内側）と等しい。
- 開いた行の中身の箱の幅も、見える幅と等しかった。
- Range で取った文の字の左右の端は、送る区画の中身の端から 0px だった。最後まで送ったときだけ、200% で ±0.2px ずれた。これは送る量の端数による画素未満のずれである。
- 320px・既定の表 a を撮った。開いた行の文は枠の見える幅の中で折れ、右が切れずに読める。
- 375px・既定の表 a は、4字の下限まで細くして収まる表で、送らない。開いた行はその幅で折れ、値は付く。
- どの条件でも、ページのエラーとコンソールのエラーは0だった。

### 4. 記事の表（HEAD と同じか）

draft を除き表を持つ60記事の197表を、6条件（320・375・1280px × 既定・200%）で開いた（のべ1,182表）。60記事は `src/blog/content` から数え直した。HTML の `<table` は197で、`table-scroll` の枠も197だった。

各ページで、まず本番のスクリプトが組んだ状態を取った。次に組んだ印を外し、HEAD の `scroll-frame.ts` から取った `createFrameLayout` で組み直した状態を取った。比べたのは次のとおりである。

- 枠: 送る印・`tabindex`・`role`・名前・`style` の属性
- 表: `width`・`table-layout`・表の幅
- 先頭の行のセルの幅（指定と実際）
- 細くした印を持つセルの数

| 条件         | 横に送る表 | 細くした列を持つ表 | HEAD との食い違い | `--frame-visible-width` を持つ枠 |
| ------------ | ---------- | ------------------ | ----------------- | -------------------------------- |
| 320px・既定  | 36         | 133                | 0                 | 0                                |
| 320px・200%  | 188        | 6                  | 0                 | 0                                |
| 375px・既定  | 22         | 125                | 0                 | 0                                |
| 375px・200%  | 148        | 42                 | 0                 | 0                                |
| 1280px・既定 | 0          | 0                  | 0                 | 0                                |
| 1280px・200% | 0          | 7                  | 0                 | 0                                |

- 数は3巡目と同じだった。
- ページのエラーは0だった。
- 足した `removeProperty` は記事の枠にも毎回走る。それでも、3つの早見表の記事（30枠）で、枠が `style` の属性を持たない（`null`）ままであることを確かめた。空の `style=""` を作らない。

### 5. コードと文書を読み直す

T5-8 の5つのファイルを通して読み直した。SKILL.md は `DataTable` の項を読み直した。

- `layoutTable` のコメントは、組み直しを飛ばす条件・中身が変わったとき・幅0の枠・見える幅の付け外しを、いまの動きのとおりに言っている。
- `visibleWidth` のコメントは、`data-detail` の印の名で開いた行を指し、CSS と同じ印を使う。
- 部品の試験の組み（jsdom の幅の決まり）は、冒頭のコメントのとおりに働いている。新しい試験も、閉じたあとに値が `""` であることを、開いたときの `79px` と対にして確かめている。
- コメントに経緯（直す前の形・巡の番号）は残っていない。ツギハギは無い。
- SKILL.md の `DataTable` の項は、`index.tsx` の部品のコメントと食い違わない。
- 部品の型の説明（`DataTableRow.detail`）の「表の見える幅で折り、横に送っても見える左端に留まる」は、上の3.の測りと合う。

### 記録（指摘ではない）

- 測ったのは Chromium だけである。表のセルの中の `position: sticky` を Firefox と Safari で確かめることは、3巡目の記録のとおり、敬語早見表を `DataTable` に移す T5-18 の keigo-reference のタスクに申し送る。
- 部品の型の説明を除くと、いちばん長いコメントの行は `contentKey` の説明の1行目（114 桁）である。これは `scroll-frame.ts` のコメント（〜113 桁）と同じ幅の内で、段落の途中で折り残した跡ではない。

## アンチパターンの確かめ（`docs/anti-patterns/implementation.md`）

| 項目   | 結果                                                                                                                                                                                                                                                                                          |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AP-I01 | 当てはまらない。値の読み取りだけでなく、320px で開いた行を撮り、文が見える幅の中で右を切らさずに読めることを来訪者の目で見た。閉じて幅を変えたあとに開き直しても、そのときの幅で読めることも確かめた。                                                                                        |
| AP-I02 | 当てはまらない。直しは、見える幅を付ける1か所の対（付ける・外す）と、印を1つにしたことだけである。場合分けや、使う面ごとの指定を足していない。                                                                                                                                                |
| AP-I03 | 当てはまらない。記事に配る組み方の文に足されたのは `else` の1枝（十数バイト）である。レイアウトの測り直しは増えない。                                                                                                                                                                         |
| AP-I04 | 当てはまらない。指標のための組みは無い。                                                                                                                                                                                                                                                      |
| AP-I05 | 当てはまらない。中身を足していない。                                                                                                                                                                                                                                                          |
| AP-I06 | 当てはまらない。値を外すのは開いた行が無いときだけで、開いた行があるときの付け方は変えていない（3.の表で、開くたびにそのときの幅が付く）。                                                                                                                                                    |
| AP-I07 | 当てはまらない。jsdom の試験に加えて、本番のビルドを Playwright の Chromium で、開く・閉じる・幅を変える順に測った。                                                                                                                                                                          |
| AP-I08 | 当てはまらない。色・大きさ・動きを足していない。`--frame-visible-width` は組むときの幅で、デザインのトークンではない。                                                                                                                                                                        |
| AP-I09 | 当てはまる恐れがある（3巡目と同じ）。SKILL.md はほかのタスクの変更と同じファイルにあるので、上の手順で `DataTable` の塊だけを載せる。T5-8 の中の依存（`scroll-frame.ts` の `layoutTable`・`FRAME_LAYOUT_DEFINE`・`LAYOUT_PREVIOUS_TABLE` → `DataTable`）は、1つのコミットに入れれば壊れない。 |
| AP-I10 | 当てはまらない。インラインのスタイルから `@keyframes` を参照していない（`frame-reveal` は同じ CSS Modules の中で使う）。                                                                                                                                                                      |
| AP-I11 | 当てはまらない。タイマーを持たない。`document.fonts.ready` と ResizeObserver は、後始末で止める（`active` と `disconnect`）。                                                                                                                                                                 |
| AP-I13 | 当てはまらない。撤去は、開いた行のセルのクラス `detail` だけである。`src/components/DataTable` を `styles.detail` と `.detail` で grep し、残りが0であることを確かめた（`.detailContent` は別の印）。                                                                                         |
| AP-I14 | 当てはまらない。共有の `scroll-frame.ts` の変更は、記事の197表を6条件で HEAD と比べて、食い違いが0件だった。`CopyButton`・`PhrasedText`・`ResultBox` は変えていない。`DataTable` を使う面はまだ無い。                                                                                         |

`docs/anti-patterns/workflow.md` も照らした。

- builder が示したファイルの組は `git status` と合っていた。
- レビューの途中で HEAD が進んだ。ほかのタスクの変更（`phrase-breaks.ts` など）も作業ツリーにあるので、コミットはパスを指定し、SKILL.md は塊を選ぶ（AP-WF07 の、同じファイルを並行して触る形）。
- 網羅を言う所（60記事・197表・のべ1,182表・4条件×2表）は、数を数えて書いた（AP-WF09・AP-WF14）。

## PM への依頼

1. T5-8 を上の「T5-8 のファイル」のとおりにコミットする。SKILL.md は `DataTable` の塊だけを載せ、`git diff --cached` で1行の追加だけであることを確かめる。
2. ほかのタスク（Web フォント・T5-28）と SKILL.md を並行して触ったことは、3巡目の依頼のとおり、サイクルドキュメントに記録する。
