# T5-32 レビュー（2回目。全体の見直し。「1字だけの行」の数え方）

判定: **承認（approved）**

対象: 作業ツリーの未コミットの T5-32 の3つの hunk（`DESIGN.md` 111行目、`.claude/skills/frontend-design/SKILL.md` 52行目、`docs/knowledge/playwright-mcp.md` 68行目）。同じファイルのほかの hunk（`DESIGN.md` 109 は T5-29、`SKILL.md` 46・129 は T5-29、141 は T5-20d、`playwright-mcp.md` 71 は T5-29）は見ていない。

## 確かめたこと

1. **1回目の指摘が直っているか。** 直っている。
   - 指摘1: SKILL.md 52行目は「1字だけの行（字が2つ以上の要素で、字が1つだけの行。その字がどの文節の字かは問わない）」、playwright-mcp.md 68行目は「1字だけの行は、字が2つ以上の要素で、行に分けたあとの字の数（コードポイントの数）が1の行である。」になり、「要素の字の全体が1字のもの（「藍」）は数えない」の言い直しは消えた。条件は1度だけ書かれ、「字が2字以上」の重なりも「字が2つ以上」に直っている。
   - 指摘2: DESIGN.md 111行目は、太字の規則の中で「見出しに1字だけの行（2字以上の見出しで、字が1つだけの行）」と語の意味を決め、あとに足した例外の文（「見出しの全体が1字のとき…当たらない」）は無い。理由の文「1字だけの行はその字を前の語から切り離して読ませ」は残り、全体が1字の見出しには切り離される前の語が無いことが、同じ理由から読み取れる。
   - 3か所とも、特定の色の名前や事例を持ち出さず、始めから語をこう決めていたと読める。ツギハギの跡は無い。
2. **目的に合うか。** index.md の補足事項（T5-12・T5-20d のレビューを受けた PM の決定 (1)）が求める「見出しの全体が1字のものは数えない」が、3つのファイルのどれでも成り立つ。伝統色の1字の名前の36ページの h1 は、DESIGN.md の規則にも、スキルの数え方にも、knowledge の書き方の要点にも当たらない。
3. **3つのファイルどうし、コード・テストとの一致。** 食い違いは無い。
   - SKILL.md の手順2は字をコードポイントごとに数え、knowledge 68行目も「コードポイントの数」で数える。SKILL.md の「字が2つ以上の要素」と knowledge の「字が2つ以上の要素」は同じ条件である。
   - `src/lib/phrase-breaks.ts` の `followsPhraseRules` は `phrases.length > 1` のときだけ最後の1字の文節を拒み、1文節の名前はその字の数によらず通す。DESIGN.md 110行目（最後の1字の文節を前につなぐ）と 111行目の新しい定義のどちらとも合う。`src/lib/__tests__/phrase-breaks.test.ts` の `followsPhraseRules` の例（「ことわざビギナ|ー」「座右の|銘と|し|て」を拒む）も2文節以上だけで、定義と食い違わない。
   - 語を使うだけの箇所（SKILL.md 68・69・110行目、DESIGN.md 113・305行目、`phrase-breaks.ts` 14・266行目の注記、`WordGrid.module.css` 19行目）を `docs/`（`docs/cycles/` を除く）・`.claude/`・`src/`・`scripts/`・`DESIGN.md` で「1字だけの行」「1字の行」「1字だけで行」で探して見直した。どれも2字以上の文字列の中の1字の行を言っており、新しい定義に従って読んでも意味が変わらない。数え方を別に書いた古い記述は無い。
4. **「2字以上の見出し」と「字が2つ以上の要素」の言い方の違い。** このままでよい。そろえなくてよい。
   - DESIGN.md §4 の111行目は見出しについての規則なので、主語は見出しである。コントロールの名前は「見出しと同じ規則で折る」でこの規則を受け継ぐので、DESIGN.md に「要素」という測る側の語を持ち込む要は無い。
   - スキルと knowledge は、見出し・コントロールの名前・名前に括弧で数を添えたものを、測る要素として同じ手順で数える。そこで「見出し」と書くと、コントロールの名前や索引の語で条件が抜けたように読めるので、「要素」がふさわしい。
   - 「字」の数え方も同じである。DESIGN.md の「2字」と、スキル・knowledge の「字が2つ」（コードポイントで数える）は、どれも同じ条件を指す。「2字以上」と「2つ以上」の違いは、1回目の指摘1で「字が2字以上」の重なりを避けたことから来るもので、DESIGN.md の側には「字」が重ならないので「2字以上」のままが自然である。
5. **段に上げるコマンド。** 1回目のコマンドは、今もちょうど3つの hunk だけを選ぶ。`.git/index` の写しを `GIT_INDEX_FILE` に渡して走らせ、次を確かめた。
   - 3つの `git apply --cached --unidiff-zero` はどれも通る。
   - `git diff --cached -U0` の hunk は `DESIGN.md` の `@@ -111 +111 @@`、`SKILL.md` の `@@ -52 +52 @@`、`playwright-mcp.md` の `@@ -68 +68 @@` の3つだけで、3ファイル・3行の置き換え。
   - 作業ツリーに残るのは `DESIGN.md` 109、`SKILL.md` 46・129・141、`playwright-mcp.md` 71 の5つ。
   - 本当の索引（`.git/index`）には何も上がっていない。
   - どの hunk も1行の置き換えなので、ほかのタスクの hunk が先にコミットされても、頭の `-111`・`-52`・`-68` は変わらない。

```bash
cd /home/user/yolo-web
pick() { git diff -U0 -- "$1" | awk -v h="$2" '/^diff --git/||/^index /||/^--- /||/^\+\+\+ /{print;next} /^@@ /{keep=($2==h)} keep'; }
pick DESIGN.md -111 | git apply --cached --unidiff-zero -
pick .claude/skills/frontend-design/SKILL.md -52 | git apply --cached --unidiff-zero -
pick docs/knowledge/playwright-mcp.md -68 | git apply --cached --unidiff-zero -
git diff --cached -U0   # 3つの hunk だけであることを確かめる
```

6. **アンチパターン。** `docs/anti-patterns/workflow.md`・`implementation.md` に当たるものは無い。文書だけのタスクで、ほかのタスクの hunk には触れていない（AP-WF13）。

## 指摘

無し。

## PM へ（指摘ではない）

- 1文節で1字の名前（「藍」）を `followsPhraseRules` が通すことを直接たしかめるテストは無い（`phrase-breaks.test.ts` の例はどれも2文節以上、`ColorDetail.test.tsx` の見出しの確かめは h1 の文節の並びを `followsPhraseRules` に渡していない）。コードは今の定義どおりに動くので T5-32 を止める理由ではないが、この定義を守るテスト（`expect(followsPhraseRules(["藍"])).toBe(true)` のようなもの）を、次に `phrase-breaks.ts` に触れるタスクで足すかを判断してほしい。

## 次に

指摘は無いので、上のコマンドで3つの hunk だけを段に上げてコミットしてよい。
