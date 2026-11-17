# T6 設計のレビュー（9巡目）

対象: `git show HEAD -- docs/cycles/cycle-316/t6-design.md`（e6b1cd51。画像の値を `page.tsx` の `generateMetadata` で作り、`src/lib/seo.ts`・`src/play/seo.ts` には型だけで渡す形と、T5 のページのタスクとの順序）

## 判定: 改善指示

方針（画像の値は `page.tsx` で作り、共有のメタデータの関数には `ShareOpenGraphImage` 型で渡す）は正しく、T6-2 のブログで既にこの形で組まれている（`src/app/blog/[slug]/page.tsx:48`・`src/lib/seo.ts:7,68,82`）。4章の頭の表の新しい行の順序も、t5-design.md 10-1 と食い違わない（T5-22b → T5-6・T5-9・T5-13・T5-15、T5-5a → T5-22b → T5-6 → T6-4、`[slug]/result` を含め結果のページ10本）。T5 は `seo.ts`・`play/seo.ts` を触らない（t5-design.md 10章に無い）ことも確かめた。

ただし、次の4点は builder の取り違え・衝突につながるので直すこと。

### 1. `src/play/seo.ts` がクライアントの部品から読まれるという事実が誤り（3-2「b の組み方」2つ目の項目・4章の頭の表の `seo.ts` の行）

- `src/lib/seo.ts` の連鎖は正しい: `"use client"` の `src/app/storybook/StorybookContent.tsx:17` → `src/components/Breadcrumb/index.tsx:7` → `src/lib/seo.ts`。
- `src/play/seo.ts` の連鎖は存在しない。`src/play/games/shared/_lib/crossCategoryItems.ts` を import しているのは4本のゲームの `page.tsx`（サーバー）だけで（`src/app/play/{kanji-kanaru,irodori,nakamawake,yoji-kimeru}/page.tsx`）、`GameContainer.tsx`・`GameResult.tsx` は計算済みの配列を props で受け取り、`import type { ItemListItem } from "@/components/ItemList"` を読むだけ。`crossCategoryItems.ts` の頭のコメントも「各ゲームの page.tsx（サーバー）で呼び、遊びの登録と分類の語をクライアントに持ち込まない」と書いている。`src/` のすべての `"use client"` のファイルから値の import（`import type` を除く）をたどった結果、`src/play/seo.ts` に届くものは0件だった。
- 直し方: `play/seo.ts` についての理由を事実に合わせる（例: 「`generatePlayMetadata` も `src/lib/seo.ts` の関数と同じ形にそろえ、画像の値を作る所を `page.tsx` の1か所にする」）。4章の頭の表の `seo.ts` の行の「クライアントの部品から読まれるので」も、`src/lib/seo.ts` についてだけ言う形にする。誤った理由のままだと、T6-3 の builder が確かめて食い違いに迷うか、誤った説明をコードのコメントに書き写す。

### 2. 4章の頭の表「画像のルートを持つページのディレクトリ」の行が、変更後の設計と矛盾している

「同じディレクトリの `page.tsx` を T6 が触るのは、上の行のブログの JSON-LD だけ」とあるが、この変更で T6-3（ユーモア辞典・`/play/[slug]`・`/play/music-personality`）・T6-4（結果10本）・T6-5（伝統色）・T6-7（索引・分類・ページ送り・タグ）・T6-8（漢字・四字熟語）も `page.tsx` の `generateMetadata` を触る。この行を、上の各行（T5 との順序）を指す形に書き直す。

### 3. 4章の受け持ちの表に、T6 が触る `page.tsx` とテストが載っていない

t5-design.md 10章の頭の決まりで、並行作業中は「自分の受け持ちのファイルだけをパスで名指ししてコミットする」。受け持ちの表に無いファイルは名指しから漏れやすい。

- T6-3 の行: `src/app/dictionary/humor/[slug]/page.tsx`・`src/app/play/[slug]/page.tsx`・`src/app/play/music-personality/page.tsx`・`src/lib/__tests__/seo-humor-dict.test.ts`（`generateHumorDictEntryMetadata` の引数が変わる）が無い。
- T6-5 の行: `src/app/dictionary/colors/[slug]/page.tsx` と `src/lib/__tests__/seo.test.ts`（`generateColorPageMetadata` の呼び出し5か所）が無い。
- T6-8 の行: `src/app/dictionary/{kanji/[char],yoji/[yoji]}/page.tsx` と `src/lib/__tests__/seo.test.ts`（`generateKanjiPageMetadata`・`generateYojiPageMetadata`）が無い。`seo.test.ts` は T6-2・T6-5・T6-8 が触るので、`seo.ts` と同じく並行させない旨をそろえる。
- T6-2 の行: `src/app/blog/[slug]/page.tsx` を「JSON-LD の `image`。T5-15 と並行させない」とだけ書いていて、`generateMetadata` と T5-22b が抜けている（頭の表と合わせる）。
- T6-4 の行: 「T5-5a → T5-6 のあと」に T5-22b が抜けている（頭の表・T6-4 のタスクの行は T5-22b を含む）。

### 4. t5-design.md 側に T6 の `page.tsx` の重なりが無い（このファイルの外。PM への申し送り）

t5-design.md 10-1「T6 と重なるもの（t6-design.md 4章と同じ向き）」と 10-4 の受け持ちの表には、T6-3（ユーモア辞典・`play/[slug]`）・T6-4（結果10本）・T6-5（伝統色）・T6-8（漢字・四字熟語）の `page.tsx` との順序が無い（10-4 は結果のページを「T5-5a → T5-6」、辞典の詳細を「T5-9」、ユーモア辞典を「T5-13」とだけ書く）。T5 の builder は t5-design.md だけを読むので、片側だけの取り決めでは並行を防げない。planner に t5-design.md 10-1・10-4 へ同じ順序を足させること。

## 確かめたこと

- `rg` と、`src/` の `"use client"` のファイルから値の import をたどるスクリプトで、`src/lib/seo.ts` に届くのは `StorybookContent.tsx → Breadcrumb` の1本、`src/play/seo.ts` に届くものは0件。
- `generate*Metadata` の呼び出し元（`page.tsx` とテスト）を `rg` で洗った（3 の漏れの根拠）。
- t5-design.md 10-1（678行の T5-22b の依存）・10-2（718行の T5-22b の16ファイル）・10-4 と、t6-design.md 4章の頭の表の新しい行を突き合わせた。
