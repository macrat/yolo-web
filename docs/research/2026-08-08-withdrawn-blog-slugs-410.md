# 公開後に取り下げたブログ記事のうち 410 登録簿に無いスラッグの全数調査

- 目的: `src/middleware.ts` の `DELETED_BLOG_SLUGS`（410 Gone + 「このコンテンツは終了しました」ページを返す登録簿）に対して、**登録漏れのまま素の 404 を返している旧記事 URL** を全数で特定する。
- 実施: 2026-08-08 / PM。
- 抽出方法（再現手順）: `git log --diff-filter=D --name-only` で `src/blog/content/*` と旧パス `src/content/blog/*` の削除済み Markdown を全履歴から列挙 → 現存スラッグ・登録済みスラッグを除外 → 残った候補ごとに `git show <commit>:<path>` で **各コミット時点の front matter の `draft:` を実読**し、`draft: false` で main に載っていた区間を確定した。
- 判定根拠: `src/blog/_lib/blog.ts:175,228` が `draft === true` の記事を公開集合から除外する。したがって **`draft: false` で main にある = 一覧・sitemap・RSS/Atom に出ていた**。`src/app/blog/[slug]/page.tsx:47` は未知スラッグに `notFound()` を返し、`next.config.ts` に `/blog/<slug>` 単位のリダイレクトは1件も無い（確認済み。`/blog/` 配下の redirect は `page/1`・`category`・`tag` のみ）。**登録漏れ = 汎用 404** で確定。

## 結論

**19 件**。いずれも `draft: false` で main に載った後に取り下げられ、現在 `DELETED_BLOG_SLUGS` に無い。

比較の基準: **既に登録済みの先例 `site-name-yolos-net` / `tools-expansion-27` の露出は 16 分**（2026-02-18 17:01→17:17）。それでも 410 登録されている。**19 件のうち 18 件がこの先例より長い**（唯一の例外は `feature-rationale-expires` の 4 分）。

| #   | スラッグ                                             | 露出（`draft:false` で main にあった時間） | 公開             | 終了             |
| --- | ---------------------------------------------------- | ------------------------------------------ | ---------------- | ---------------- |
| 1   | `site-search-069-percent-decision`                   | **3日03時間**                              | 2026-04-30 22:39 | 2026-05-04 01:39 |
| 2   | `claude-code-dynamic-workflows-34-tools-rebuild`     | 14時間56分                                 | 2026-06-05 09:31 | 2026-06-06 00:27 |
| 3   | `minimal-design-functional-color-vs-decoration`      | 14時間18分                                 | 2026-06-27 02:07 | 2026-06-27 16:25 |
| 4   | `rank-high-but-no-click`                             | 13時間27分                                 | 2026-06-16 01:40 | 2026-06-16 15:07 |
| 5   | `why-i-removed-the-cheatsheets`                      | 12時間32分                                 | 2026-06-14 23:52 | 2026-06-15 12:24 |
| 6   | `content-trust-level-removal`                        | 7時間51分                                  | 2026-05-17 06:55 | 2026-05-17 14:46 |
| 7   | `ai-rule-firing-conditions-vs-documentation`         | 6時間58分                                  | 2026-05-13 02:17 | 2026-05-13 09:15 |
| 8   | `design-skill-single-source-of-truth`                | 5時間02分                                  | 2026-04-27 05:55 | 2026-04-27 10:57 |
| 9   | `measuring-without-measuring-ab-foundation`          | 4時間37分                                  | 2026-06-21 06:20 | 2026-06-21 10:57 |
| 10  | `toc-anchor-single-source-of-truth-concurrency-race` | 2時間54分                                  | 2026-07-20 14:00 | 2026-07-20 16:54 |
| 11  | `parallel-agents-cross-batch-duplication`            | 2時間46分                                  | 2026-06-18 18:47 | 2026-06-18 21:33 |
| 12  | `design-migration-is-not-color-swap`                 | 2時間02分                                  | 2026-06-19 22:24 | 2026-06-20 00:26 |
| 13  | `i-kept-giving-myself-a-passing-grade`               | 1時間56分                                  | 2026-06-03 17:32 | 2026-06-03 19:28 |
| 14  | `free-seo-keyword-research-guide`                    | 40分                                       | 2026-04-05 18:16 | 2026-04-05 18:56 |
| 15  | `silent-wrong-answers-emoji-char-count`              | 38分                                       | 2026-06-03 16:37 | 2026-06-03 17:15 |
| 16  | `ai-agent-three-shortcut-patterns`                   | 36分                                       | 2026-03-19 08:52 | 2026-03-19 09:28 |
| 17  | `ai-slop-and-the-absent-writer`                      | 22分                                       | 2026-06-25 07:11 | 2026-06-25 07:33 |
| 18  | `string-number-conversion-pitfalls-ssot`             | 19分                                       | 2026-06-03 15:59 | 2026-06-03 16:18 |
| 19  | `feature-rationale-expires`                          | 4分                                        | 2026-07-21 12:08 | 2026-07-21 12:12 |

「終了」は削除コミット、または削除より前に `draft: true` へ戻したコミット（`design-skill-single-source-of-truth`・`i-kept-giving-myself-a-passing-grade`・`silent-wrong-answers-emoji-char-count`・`string-number-conversion-pitfalls-ssot`・`why-i-removed-the-cheatsheets` の5件）のいずれか早い方。

**取りこぼしの起点は 2026-03-19**（#16）で、以降 4 か月以上にわたり同じ抜けが反復している。特定サイクルの事故ではない。

## 着手時に判断が要る点（未検証・未決）

1. **19 件それぞれの現在の検索流入・被リンクの有無は未調査**（GA4 / Search Console を参照していない）。410 は即時 de-index シグナルなので、いま流入が残っている URL に打つかどうかは**着手時に必ず実測してから**決める必要がある。
2. **`ai-slop-and-the-absent-writer`（#17）だけは 410 が最適とは限らない**。同一内容の後継記事 `removing-ai-slop-and-the-absent-writer` が現存する（2026-06-25 07:53 に新スラッグで作成）。実質はスラッグ変更であり、**後継への 301/308 リダイレクトのほうが来訪者価値・被リンク価値ともに高い可能性**がある。`/toolbox`→`/tools`（`next.config.ts` の cycle-279 コメント）と同じ判断軸。
3. **残り 18 件には後継が無い**（記事ごと取り下げ）ため、既存の先例どおり 410 が素直な選択肢。
4. **再発防止**は本調査の範囲外。取り下げのたびに登録簿へ足す運用が 4 か月間機能していないため、機構側の手当ての要否は別途判断が要る。

## 参考: 候補から除外したもの

- **公開されずに消えたため対象外**（`draft: true` のまま削除、`/blog/<slug>` が生きたことが一度もない）: `character-as-alignment`・`llm-character-over-rules`・`tests-green-but-filtered-subset-shrank-to-empty`・`double-tap-guard-passes-tests`・`japanese-table-min-content-column-floor` の5件。
- **`memo-system-rise-and-fall`**: `git log --no-renames` では削除に見えるが、実体は日付プレフィックスの改名（`2026-03-15-` → `2026-03-16-`）でスラッグは不変・記事は現存。死んだ URL ではない。
