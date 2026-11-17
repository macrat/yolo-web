# T5-29 レビュー 第4回（片仮名の続きの中の語の頭）

## 判定

**changes-needed**

第3回の指摘1（index.md の事実）は直っている。指摘2（注記の折り返し）は行の幅がそろったが、折り返し直した所の行末に開き括弧「（」が1字だけ残った。`src/` の注記で行末に開き括弧を置くのはこの1か所だけで、機械的に幅で折った跡が見える。区切りの決め方・試験・文書は第3回から変わっておらず、第3回の比べと測りはそのまま当てはまる。

## 確かめたこと

### 第3回の指摘1（index.md の「公開中の見出し」）

直っている。`git grep "公開中の見出し" HEAD -- docs/cycles/cycle-316/index.md` は何も出さない。直したのは 7b2982c4 で、358 行目は「片仮名の続きの中を辞書が刻んだ「リング」で割る誤り（「フィルタ／リング／パイプライン」など）は、HEAD からあるが同じ関数の同じ種類なので T5-29 で直す。記事の本文の見出しは区切らないので、いま来訪者に見える見出しと名前には無いが、区切る見出しや名前に入れば出る（review-t5-29-2.md の指摘5で事実を正した）」になった。第3回の比べ（変わる所は本文の行・表のセル・試験の文だけ）と合い、決めたこと（T5-29 で直す）はそのままである。サイクルの文書なので、正したことを書き添える形でよい。

### 第3回から変わったのが注記だけであること

- `src/lib/word-starts.ts` を、第3回で写した `rv529r3/word-starts.ts`（2026-09-29 23:43）と比べた。違うのは 120・121 行目の2行だけで、字は1字も変わらず、折り返す所が「単位の頭（続きの頭か、続きの前から｜かかる語との境目」から「単位の頭（｜続きの頭か、」に移っただけである。コードの行は変わっていない。
- `src/lib/phrase-breaks.ts` は、第3回で写した `rv529r3/pb-t529-save.ts` と1字も違わない。2つの試験のファイルの更新の時刻（23:34）は第3回のレビューの文書（23:54）より前で、変わっていない。
- よって第3回の `src/` の前と後の比べ（42 件）・2語をつないだ比べ（4つの種）・来そうな名前・email-validator の h1 の測りと撮影は、そのまま当てはまる。

### 検査

| 検査                                                   | 結果                              |
| ------------------------------------------------------ | --------------------------------- |
| vitest（phrase-breaks・word-starts、`--maxWorkers=2`） | 2ファイル・61件が通る             |
| `prettier --check src/lib/word-starts.ts`              | 通る                              |
| `eslint src/lib/word-starts.ts`                        | 通る                              |
| 注記の行の表示の幅（全角を2で数える）                  | 118〜121 行目は 111・118・116・74 |

### `word-starts.ts` を全体で読み直した

折り返し直した段落（118〜121 行目）のほかに、直した跡は無い。各段落の行の幅は 101〜122 に収まり、段落の最後の行だけが短い。注記の中身・定数・関数は第3回で読んだものと同じで、前の決め方の跡も残っていない。残る跡は下の指摘1の1か所だけである。

## 指摘

### 1. 注記の 120 行目が開き括弧「（」で終わる

`src/lib/word-starts.ts` 120〜121 行目:

```
 * 「デザイン|トークン」）。単位が1つなら、続きの中に語の頭は無く（「レン|ダ|リング」→「レンダリング」）、単位の頭（
 * 続きの頭か、続きの前からかかる語との境目「省エネ|モード」）だけを返す。
```

括弧の中身が次の行へ送られ、開き括弧だけが行末に残っている。行末の開き括弧は、どちらの行の語に付くのかを読み違えさせる禁則の破れで、このサイトの DESIGN.md §4 も見出しで避ける形である。`src/` の `.ts`・`.tsx`・`.css` の注記で行が「（」か「「」で終わるのはこの1か所だけ（`grep -P '^\s*(\*|//).*[（「]\s*$'`）で、幅に合わせて機械的に折り返した跡に見える。ツギハギ禁止（CLAUDE.md）の、読む人に直した所が見える形に当たる。

builder が「（」を 121 行目の頭へ移す（120 行目は「…、単位の頭」で終わり、121 行目は「（続きの頭か、…」で始まる）。幅は 120 行目が約 114、121 行目が約 76 になり、ほかの行とそろったままである。字は変えない。

## アンチパターン

- **implementation.md**: AP-I13（前の形の跡）に当たるのは指摘1の1か所だけ。ほかの項目は第3回の判断が変わらない（コードが変わっていないため）。
- **workflow.md**: AP-WF01（直したあと全体を見直す）は、今回も `word-starts.ts` の全体を読み直して指摘1を見つけた。AP-WF14（報告を写さない）は、builder の「111/118/117/74」を測り直した（120 行目は全角の数え方で 116。指摘に関わる差ではない）。AP-WF27（事実の誤りを残さない）は、index.md の事実が直ったことを HEAD で確かめた。

## T5-29 の行だけをステージする

第3回は「DESIGN.md と SKILL.md はファイルごと足せばよい」と書いたが、今は T5-32（DESIGN.md 111 行目・SKILL.md 52 行目・knowledge 68 行目）と T5-20d（SKILL.md 141 行目）の未コミットの行が同じファイルにあるので、ファイルごとに足してはならない。T5-29 の行（DESIGN.md 109、SKILL.md 46・129、knowledge 71）だけを次のとおりステージする。

```sh
cd /home/user/yolo-web
hunks() { f=$1; shift; git diff -U0 -- "$f" | awk -v keep=" $* " '
  /^diff --git /{hdr=1} hdr&&!/^@@/{print; next}
  /^@@/{hdr=0; split($2,a,","); on=index(keep," " substr(a[1],2) " ")>0}
  on{print}'; }
{ hunks DESIGN.md 109
  hunks .claude/skills/frontend-design/SKILL.md 46 129
  hunks docs/knowledge/playwright-mcp.md 71; } > tmp/t529.patch
git apply --cached --unidiff-zero --check tmp/t529.patch && git apply --cached --unidiff-zero tmp/t529.patch
git add src/lib/word-starts.ts src/lib/phrase-breaks.ts \
  src/lib/__tests__/word-starts.test.ts src/lib/__tests__/phrase-breaks.test.ts
git diff --cached --stat   # 7ファイル・294 行の追加・68 行の削除（指摘1を直しても行の数は変わらない）
git diff --cached -U0 -- DESIGN.md .claude/skills/frontend-design/SKILL.md docs/knowledge/playwright-mcp.md | grep '^@@'
# @@ -46 +46 @@・@@ -129 +129 @@（SKILL.md）、@@ -109 +109 @@（DESIGN.md）、@@ -71 +71 @@（knowledge）だけ
git diff -U0 -- DESIGN.md .claude/skills/frontend-design/SKILL.md docs/knowledge/playwright-mcp.md | grep '^@@'
# ステージしていない側に @@ -52・@@ -141（SKILL.md）、@@ -111（DESIGN.md）、@@ -68（knowledge）が残る
```

`awk` はファイルの頭の行（`diff --git` から最初の `@@` まで）を通し、`@@ -N` の N が指定した行の塊だけを通す。頭の行を最初の `@@` までに限るので、消した行が「-- 」で始まっても頭の行と取り違えない。ファイルごと足すのは `src/lib/word-starts.ts`・`src/lib/phrase-breaks.ts`・`src/lib/__tests__/word-starts.test.ts`・`src/lib/__tests__/phrase-breaks.test.ts` の4つ（`word-starts.ts` と試験の1つは未追跡の新しいファイル）。

写しの索引（`GIT_INDEX_FILE`）で上のとおり試した。ステージされたのは7ファイル・294 行の追加・68 行の削除で、3つの文書の塊は T5-29 の4つだけ、残りの4つはステージされない側に残った。ステージした4行は作業ツリーの行と一致し、4つのソースは作業ツリーのファイルと一致した。本物の索引は触っていない。指摘1を直したあとも同じコマンドでよい。

## 使ったもの

`/tmp/claude-0/-home-user-yolo-web/7ec6fd95-5319-581a-b78e-9e5ca394946c/scratchpad/rv529r4/`（写しの索引 `index` と `t529.patch`）。比べのもとは第3回の `rv529r3/word-starts.ts`・`rv529r3/pb-t529-save.ts`。
