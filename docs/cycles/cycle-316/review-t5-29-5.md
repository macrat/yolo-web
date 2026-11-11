# T5-29 レビュー 第5回（片仮名の続きの中の語の頭）

## 判定

**approved**

第4回の指摘1（注記の 120 行目が開き括弧「（」で終わる）は直っていて、直した跡も残っていない。第4回から変わったのは `src/lib/word-starts.ts` の注記の2行だけで、区切りの決め方・試験・文書は変わっていない。よって第3回の比べと測り（`src/` の前と後の比べ 42 件、2語をつないだ比べ、来そうな名前、email-validator の h1 の測りと撮影）はそのまま当てはまる。

## 確かめたこと

### 第4回の指摘1

直っている。120 行目は「…、単位の頭」で終わり、121 行目は「（続きの頭か、続きの前からかかる語との境目「省エネ|モード」）だけを返す。」で始まる。

- 第4回で写した索引（`rv529r4/index`）から `word-starts.ts` を取り出して作業ツリーと比べた。違うのは 120・121 行目だけで、「（」が 120 行目の終わりから 121 行目の頭へ移っただけである。字は1字も変わらず、コードの行も変わっていない。
- `src/` の `.ts`・`.tsx`・`.css` の注記で、行が「（」「「」「『」で終わる所は無くなった（`grep -P '^\s*(\*|//).*[（「『]\s*$'`）。
- 行の頭の「（」は、同じファイルの 67 行目・90 行目と同じ形で、禁則にも合う。
- 表示の幅（全角を2で数える）は、118〜121 行目が 111・118・114・76 になった。段落のほかの行（101〜122）とそろい、段落の最後の行だけが短い。

### 第4回から変わったのが注記だけであること

- `src/lib/phrase-breaks.ts`・`src/lib/__tests__/word-starts.test.ts`・`src/lib/__tests__/phrase-breaks.test.ts` は、第4回の写しの索引にあるものと1字も違わない。更新の時刻も 23:34 のままである。
- `word-starts.ts` を全体で読み直した。注記の中身・定数・関数は第3回・第4回で読んだものと同じで、前の決め方の跡や、直した所の跡は無い。

### 検査

| 検査                                                   | 結果                  |
| ------------------------------------------------------ | --------------------- |
| vitest（phrase-breaks・word-starts、`--maxWorkers=2`） | 2ファイル・61件が通る |
| `prettier --check src/lib/word-starts.ts`              | 通る                  |
| `eslint src/lib/word-starts.ts`                        | 通る                  |

## 指摘

無し。

## アンチパターン

- **implementation.md**: AP-I13（前の形の跡）は、第4回の指摘1が直って当てはまらなくなった。ほかの項目は第3回の判断が変わらない（コードが変わっていないため）。
- **workflow.md**: AP-WF01（直したあと全体を見直す）は、`word-starts.ts` の全体を読み直し、ほかの3つのソースが変わっていないことを確かめた。AP-WF14（報告を写さない）は、builder の「字は変えていない」を第4回の写しとの比べで確かめた。

## T5-29 の行だけをステージする

第4回のコマンドがそのまま使える。作業ツリーの3つの文書には、今も T5-29 の行（DESIGN.md 109、SKILL.md 46・129、knowledge 71）と、ほかのタスクの行（DESIGN.md 111、SKILL.md 52・141、knowledge 68）が並んでいる。

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
git diff --cached --stat   # 7ファイル・294 行の追加・68 行の削除
git diff --cached -U0 -- DESIGN.md .claude/skills/frontend-design/SKILL.md docs/knowledge/playwright-mcp.md | grep '^@@'
# @@ -46・@@ -129（SKILL.md）、@@ -109（DESIGN.md）、@@ -71（knowledge）だけ
git diff -U0 -- DESIGN.md .claude/skills/frontend-design/SKILL.md docs/knowledge/playwright-mcp.md | grep '^@@'
# ステージしていない側に @@ -52・@@ -141（SKILL.md）、@@ -111（DESIGN.md）、@@ -68（knowledge）が残る
```

本物の索引を写した索引（`GIT_INDEX_FILE`）で試した。写す前の索引にステージされた変更は無かった。ステージされたのは7ファイル・294 行の追加・68 行の削除で、3つの文書の塊は T5-29 の4つだけ、ほかのタスクの4つはステージされない側に残った。作った `t529.patch` は、第4回のものと `index` の行（作業ツリーの側の blob。ほかのタスクの行が変わったため）のほかは1字も違わない。4つのソースはステージしたものと作業ツリーのファイルが一致した。本物の索引は触っていない。

## 使ったもの

`/tmp/claude-0/-home-user-yolo-web/7ec6fd95-5319-581a-b78e-9e5ca394946c/scratchpad/rv529r5/`（写しの索引 `index` と `t529.patch`）。比べのもとは第4回の `rv529r4/index`・`rv529r4/t529.patch`。
