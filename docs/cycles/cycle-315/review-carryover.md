# キャリーオーバー確定とバックログ整理のレビュー

対象はコミット `a639b689`（`docs/backlog.md`・`docs/cycles/cycle-315/index.md`・`docs/README.md`・削除した `docs/knowledge/frontend.md`）。

観点は3つに絞った——(1) Owner の指示どおりに `docs/backlog.md` が書き換わっているか、(2) バックログとサイクルドキュメントに矛盾が無いか、(3) 記載された実測値が実体と合っているか。
判定はすべてリポジトリ上のコマンド出力に当てた。

**結論: 改善指示。** 3件が実害（記録が事実と食い違う／追跡対象が消えた）、3件が要修正、3件が軽微。

---

## 1. Owner の指示との逐語照合

| 指示                                                                 | 結果       | 実体                                                                                      |
| -------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| B-746 は about ページの作り直しにする                                | **要修正** | 改題済み。ただし旧 B-746 の射程33ファイルのうち32ファイルの行き先が記録から消えた（§2-1） |
| B-633 はそのまま Queued に置く                                       | 妥当       | `grep -n "B-633" docs/backlog.md` はヒット0。B-663 は Queued のまま無変更                 |
| B-749 をキャンセルし ADR001 は維持                                   | 適合       | `docs/backlog.md`:150 で中止。`git show --stat a639b689` に ADR001 は含まれない           |
| B-748・B-751 をまとめて「古いドキュメントの整理」にする              | 適合       | `docs/backlog.md`:16 で改題・統合、:149 で B-751 を中止                                   |
| B-750 は本サイクルで対応する（knowledge はルール違反なら丸ごと削除） | 適合       | §3 のとおりルールの各項に当てて判定。削除は妥当                                           |
| B-752・B-753・B-744・B-745 をキャンセル                              | 適合       | `docs/backlog.md`:151-153,150 で中止                                                      |
| サイトデザインの刷新を単一タスクとして起票                           | 適合       | B-754（`docs/backlog.md`:10）                                                             |
| B-741 は本当に解消済みか確認し、解消済みなら完了                     | **要修正** | 「規範文書からは消えた」が実体と食い違う（§2-2）                                          |
| カテゴリごとの中身の刷新タスク                                       | 適合       | B-566・B-564・B-756・B-757                                                                |
| 道具箱は廃止、機能が残るなら廃止用タスク                             | 適合       | 機能は cycle-279 で撤去済みと実測し、残る作りを B-755 として起票                          |

## 2. 実害

### 2-1. トップページの「よろず屋」が、どのタスクにも属さなくなった

`docs/cycles/cycle-315/index.md`:444 は B-746 の実測を「33ファイル（テスト除く）。`src/app/page.tsx:194`「AIが営む、よろず屋です。」ほか」と記録している。
改題後の B-746（`docs/backlog.md`:15）の射程は `src/app/about/page.tsx`:23・:82 だけで、残る32ファイルを引き取る項目がバックログに無い。

```
$ grep -rl "よろず屋\|やってみる\|道具箱" src | grep -v __tests__ | grep -v src/blog/content | wc -l
35
$ grep -n "よろず屋" src/app/page.tsx
38:  "AIが営むよろず屋、yolos.net。…"
194:          <span className={styles.phrase}>AIが営む、よろず屋です。</span>
```

トップページの見出しコピー（:194）と検索結果に出る description（:38）は、いま来訪者が毎回目にする面であり、確定した `docs/site-concept.md` と別の名乗りをしている。
それにもかかわらず `docs/cycles/cycle-315/index.md`:587 は「**すべて `docs/backlog.md` に起票済み。** 本サイクル固有の残件は無い。」と書いている。**この一文は事実でない。**

### 2-2. B-741 の「規範文書からは消えた」が実体と食い違う

`docs/backlog.md`:146 は「【完了】規範文書からは消えた(8件中7件解消)」と書く。Notes が数えていた8件の対応は取れている（DESIGN.md・`docs/site-concept.md`・`docs/README.md` は0件、`docs/knowledge/frontend.md` は削除、残り1件が `docs/rebuild-plan.md`:62）。
しかし Owner の指示は「本当に解消済みなのか確認し」である。実際に数えると、生きている規範文書に「正典」が残っている。

```
$ grep -rn "正典" docs --include="*.md" | grep -v "^docs/cycles/" | grep -v "^docs/archive/"
docs/rebuild-plan.md:62          候補の正典は research doc T4 節…
docs/ADR/README.md:11            index.md が正典。…
docs/ADR/open/…ADR001/index.md:6 …`docs/rebuild-plan.md`（正典）…
docs/anti-patterns/planning.md:96 …（運用の正典は `docs/ADR/README.md`）
docs/knowledge/playwright-mcp.md:10 **ハングの予防はこのファイルが正典**
docs/backlog.md:31               候補の正典=research/…
```

AP-P34 を定義している当の `docs/anti-patterns/planning.md` と、ADR の運用規約である `docs/ADR/README.md` が、権威づけの語として「正典」を使っている（:104-105 の AP-P34 本文は語そのものの説明であり該当しない）。
「8件中7件解消」は正しいが、「規範文書からは消えた」は正しくない。タイトル（規範文書に「正典」が残っている）が問う対象は解消していない。

### 2-3. `src/lib/analytics.ts`:267-274 が指す先が違う

`docs/cycles/cycle-315/index.md`:616 は「`src/lib/analytics.ts`:267-274 に `variant` 欄が残る」と書くが、267-274 は道具箱ダッシュボード撤去の説明と `TileSurface`（`surface` 欄）の doc コメントである。

```
$ grep -n "" src/lib/analytics.ts | sed -n '262,276p'
262:// - variant is a separate, optional parameter. …
267:// The toolbox dashboard (/toolbox) and its add/remove/reset/preset events were
272: * Where a tile interaction happened. …
276:export type TileSurface = "detail";
$ grep -n "variant" src/lib/analytics.ts | sed -n '10,20p'
262 / 264 / 280 / 284 / 285 / 289 / 290 / 292 / 293 / 307 / 310
```

`variant` 欄は 262-264・284-285・292-293。行番号か名前のどちらかが誤っている。

## 3. `docs/knowledge/frontend.md` の削除（妥当）

`.claude/rules/knowledge-directory.md` の4項を、`git show HEAD~1:docs/knowledge/frontend.md` の内容に1つずつ当てた。

| ルール                               | 判定       | 当該箇所                                                                                  |
| ------------------------------------ | ---------- | ----------------------------------------------------------------------------------------- |
| Do: フレームワークの落とし穴         | 当たらない | Next.js/React 固有の落とし穴は無く、CSS イディオムの選定である                            |
| Do: Owner から共有された技術的な知見 | 当たらない | 出典は cycle-281 の自作。Owner 由来の記述は無い                                           |
| Don't: 運用上のルール                | **該当**   | イディオム3案を並べ、1番「使わない」・3番「**推奨**」と決めている＝運用上のルールそのもの |
| Don't: アンチパターン                | **該当**   | 1番を「DESIGN.md §4 違反」と呼び、末尾「適用実績」はサイクルの経緯                        |

Don't に2項該当するため、ルールの文言どおり「丸ごと削除」が妥当。参照の後始末も確認した。

```
$ grep -rn "knowledge/frontend" docs .claude --include="*.md" | grep -v "^docs/cycles/"
docs/ADR/expired/2026-08-07-ADR005-…/index.md:81
$ grep -n "knowledge" docs/README.md   # 一覧に frontend.md の行は無い
$ grep -rn "よろず屋\|道具箱\|DESIGN.md" docs/knowledge/   # ヒット0
```

残る参照はサイクルドキュメントと `docs/ADR/expired/` の1件のみで、後者は `docs/cycles/cycle-315/index.md`:624 が B-748 の残件として記録している。

## 4. 要修正

### 4-1. B-615 と本文が、中止した B-652 を着手条件に持っている

```
$ sed -n '92p' docs/backlog.md
| B-615 | … 着手: デザイン移行(B-651/B-652/B-573)の完了後 |
$ sed -n '141p' docs/cycles/cycle-315/index.md
- **`src/` は変更しない。** 実デザイン側の作り直しは B-652（Deferred・着手条件＝本件完了後）の射程である。
```

B-652 は `docs/backlog.md`:147 で中止済み（B-754 へ統合）。着手条件が中止済み ID を指しており、そのままでは満たされない。

### 4-2. B-651 完了で条件が開いた項目が Deferred に残っている

Deferred は「すぐに着手できない」項目の置き場である（`docs/backlog.md`:84）。B-651 は本サイクルで完了したのに、それを着手条件にしている2件が Deferred に残っている。同じ条件の B-746・B-748 は Queued へ移している。

```
$ sed -n '88p;90p' docs/backlog.md
| B-742 | … | P3 | 着手: B-651(サイトコンセプト確定)の後。… |
| B-672 | … | P4 | 着手: B-651の後。… |
```

AP-WF12（依存する backlog 項目の状態を実体確認したか）に当たる。

### 4-3. 「コメント・テスト名 42ファイル」が、同じ表で除外した2記事を含んでいる

```
$ grep -rl "道具箱" src scripts | wc -l
42
$ grep -rl "道具箱" src scripts | grep blog
src/blog/content/2026-06-12-top-page-toolbox-launch.md
src/blog/content/2026-07-13-design-token-migration-build-blind-spots.md
```

`docs/cycles/cycle-315/index.md`:618 の42は、:619 が「触らない」と明記した公開済みブログ2記事を含む。対象は40が正しい。
また英語表記のみの残骸（`src/lib/__tests__/analytics.test.ts`:138 の `toolbox \`variant\` key` 等）はこの数に入っていない。

## 5. 軽微

- **B-756 の「`src/app/play/` に14ディレクトリ」**（`docs/backlog.md`:12）。`ls -d src/app/play/*/ | wc -l` は **16**。`[slug]` と `__tests__` を除くと14で、除外を書かないと再現できない。
- **B-744 の中止理由に到達先が無い**（`docs/backlog.md`:151「過去に実現不可能として取り下げられている」）。`grep -rn "実現不可能" docs/backlog.md docs/anti-patterns/candidates.md` は当該行以外ヒット0。近いのは `candidates.md`:42 の AP-WF28（N≥3 でも昇格しない判断）だが、同一とは書かれていない。次の PM が確かめられない。
- **「Ownerの裁定」を駆動源として記録している**（`docs/backlog.md`:150-153 ほか5行）。中止の根拠は `.claude/rules/anti-patterns-directory.md` の Don't（あとから気付いても回復できない／手順に書くべきこと／特定の事例）に実在する。AP-WF24 は記録での駆動源の Owner 帰属を禁じており、ルール側を引くのが正しい。

## 6. 問題が無かった項目

- **ID の衝突・再利用**: `grep -o "^| B-[0-9]\+" docs/backlog.md | sort | uniq -d` は空。既存の最大は B-753 で、B-754〜B-757 は新規。
- **B-586・B-652 の統合（PM 判断）**: 妥当。B-586（rebuild-plan.md の archive 移動と参照付け替え）と B-751（同ファイルが `docs/` 直下に残存）は同一主題の二重起票であり、Owner の「B-748・B-751 をまとめる」と同じ軸で畳める。B-652 は「サイト全体を新デザインで作り直す」であり、Owner の「単一のタスクとして起票」に従えば B-754 に含まれる。
- **実測値**: ツール36本（`ls -d src/tools/*/meta.ts | wc -l`）・辞典4系統（`ls src/app/dictionary/`）・ブログ87記事（`ls src/blog/content/*.md | wc -l`）・`/toolbox`→`/tools` の308（`next.config.ts`:97-103・`src/__tests__/redirects.test.ts`:15-23）・`*Tile.tsx` 36本・生きている参照9ファイル（`docs/rebuild-plan.md` を指す live 文書。`docs/ADR/expired/` の1件を除く）・catalog 5ファイル（うち3件が `rebuild-plan.md §4` 参照）・about:23/:82・`DESIGN.md §9`＝文章・`DESIGN.md`:88-89（§4）の16px 下限・`docs/site-concept.md` の引用3件——いずれも再現できた。
