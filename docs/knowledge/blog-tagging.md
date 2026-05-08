# ブログ タグ運用ルール

このドキュメントは、yolos.net のブログ記事に付与する「タグ」の運用ルールを定める。

---

## 1. カテゴリとタグの使い分け

| 項目   | カテゴリ                              | タグ                           |
| ------ | ------------------------------------- | ------------------------------ |
| 値の数 | 単一（記事に1つだけ）                 | 複数（記事に3〜5個）           |
| 種類   | 5種類固定（変更は慎重に）             | 可変（テーマに応じて追加可能） |
| URL化  | 全カテゴリが `/blog/category/[id]` に | **3件以上のタグだけ** URL化    |
| 役割   | 主たる束ね（記事の主テーマ）          | 横断的テーマでの束ね           |

カテゴリはすべての記事でURLとして機能する「主たる分類」。タグは「特定の技術・テーマに関心がある読者が横断的に読める記事群」を束ねるものであり、1〜2件しかない場合はそのタグで記事を束ねることができない。束ねられないタグに読者を誘導しても価値がなく、運用ノイズになる。

---

## 2. しきい値: MIN_POSTS_FOR_TAG_PAGE = 3

タグページ（`/blog/tag/[tag]`）を生成するには、そのタグが付いた記事が **3件以上** 必要。この閾値は `src/blog/_lib/blog.ts` で `MIN_POSTS_FOR_TAG_PAGE` として定義されており、タグページのルート生成に使われている。

1〜2件のタグは以下の問題を引き起こす：

- タグページが生成されず、タグリンクが404になる可能性がある
- 読者にとって「そのタグで読める記事一覧」が薄く、価値が低い

**ルール: タグは3件以上の記事に付与されていることを前提とする。**

---

## 3. 新タグ追加時のルール

1. 推奨タグリスト（`docs/blog-writing-rules.md` や `.claude/rules/blog-writing.md` 参照）に既存タグがないか確認する
2. 類似した既存タグで代替できないか検討する（例: 「設定ファイル」より「DevOps」ではなく「Web開発」）
3. **3件以上の記事に付与できる見込みがある場合のみ** 新タグを作成する
4. 1〜2件に留まる見込みなら、既存タグに吸収するか使わない

---

## 4. 既存タグの整理タイミング

- **記事追加・削除のたびに** タグの件数を確認する
- 低件数（1〜2件）タグが発生したら、タグを削除して別の既存タグに吸収するか、タグ自体を廃止する
- 確認コマンド:

```bash
npx tsx -e '
import { getAllBlogPosts } from "./src/blog/_lib/blog";
const posts = getAllBlogPosts();
const all = new Map();
for (const p of posts) for (const t of (p.tags||[])) all.set(t, (all.get(t)||0)+1);
const sorted = [...all.entries()].sort((a,b)=>b[1]-a[1]);
console.log("Total:", sorted.length);
console.log("All >= 3:", sorted.every(([,c])=>c>=3));
console.log("Min count:", Math.min(...sorted.map(([,c])=>c)));
console.log("Tags:", JSON.stringify(sorted));
'
```

---

## 5. 2026-05-08 (cycle-183) の整理記録

サイクル-183 の実装で、タグページURL化（3件以上）の閾値との矛盾が顕在化した。初回の補修（commit `94e33929`）では「3件未満のタグは `<span>` にして404を防ぐ」という対症療法を採ったが、Owner の指摘で根本対応になっていないことが判明した。

「絞り込みに使えないタグは何のために存在するのか」という問いに対して、答えは「束ねるべき他記事がないタグはタグの本来機能を果たさず、運用ノイズ」。span化で画面に残すより、**そもそも存在させないのが正解**。

span化コミットを revert（`git revert 94e33929`）し、1〜2件しかなかった以下7タグを6記事のfrontmatterから削除した：

| 削除タグ         | 出現数 | 削除した記事                                                                 |
| ---------------- | ------ | ---------------------------------------------------------------------------- |
| YAML             | 1      | yaml-implicit-type-conversion-quote-everything                               |
| DevOps           | 1      | yaml-implicit-type-conversion-quote-everything                               |
| 設定ファイル     | 1      | yaml-implicit-type-conversion-quote-everything                               |
| React            | 1      | scroll-lock-reference-counter-for-multiple-components                        |
| アクセシビリティ | 1      | scroll-lock-reference-counter-for-multiple-components                        |
| RSS              | 2      | nextjs-route-handler-static-and-bundle-budget-test / rss-feed-and-pagination |
| スケジュール     | 2      | cron-expression-pitfalls-dom-dow-parseint / cron-parser-guide                |

結果: タグ総数 33 → 26、全タグが3件以上（最小3件）に整理。
