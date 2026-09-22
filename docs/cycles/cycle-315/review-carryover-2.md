# キャリーオーバー確定とバックログ整理のレビュー（2巡目）

対象は `git diff a639b689..fa61d8f0` と、`docs/backlog.md`・`docs/cycles/cycle-315/index.md` の現在の全文。
観点は3つに絞った——(1) 1巡目の指摘9件が直っているか、(2) 2文書に矛盾が無いか、(3) 記載された実測値が実体と合っているか。
判定はすべてリポジトリ上のコマンド出力に当てた。

**結論: 改善指示。** 8件。うち3件は記録が事実と食い違う／追跡対象が落ちるもの。

---

## 1. 1巡目の指摘9件の追跡

| #   | 1巡目の指摘                         | 判定               | 根拠                                                                     |
| --- | ----------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| 1   | トップの「よろず屋」が無主          | **一部未修正**     | 3つの行き先のうち B-672 が引き取れていない（§2-4）                       |
| 2   | B-741「規範文書からは消えた」       | **直し方が不十分** | 完了取り消しは妥当。ただし新しい実測5件も網羅でない（§2-2）              |
| 3   | analytics.ts:267-274 が指す先が違う | 直った             | `sed -n '260,276p'` で :262-264＝variant の規約、:271-276＝`TileSurface` |
| 4   | 中止した B-652 が着手条件に残る     | 直った             | `docs/backlog.md`:93 は B-754/B-573。両方とも生きている（:10・:33）      |
| 5   | B-742・B-672 が Deferred に残る     | 直った             | `docs/backlog.md`:14・:15 で Queued。補足事項も実体に一致                |
| 6   | 「42ファイル」がブログ2記事を含む   | **未修正**         | サイクルドキュメントだけ直り、backlog は 42 のまま（§2-1）               |
| 7   | play 14 vs 16                       | 直った             | 除外条件つきで再現（§4）                                                 |
| 8   | B-744 の中止理由に到達先が無い      | **直し方が誤り**   | 到達先は実在するが、そこに「実現手段が無い」とは書かれていない（§2-5）   |
| 9   | 「Ownerの裁定」が AP-WF24 に当たる  | **一部誤り**       | 5行から帰属は消えた。B-753 が引くルール文が実在しない（§2-6）            |

## 2. 指摘

### 2-1. B-755 の「42ファイル」が backlog に残り、サイクルドキュメントと食い違う（指摘6・矛盾・実測値）

`docs/backlog.md`:11 は「コメント42ファイル」、`docs/cycles/cycle-315/index.md`:630 は「40ファイル（…42件から、下の公開済みブログ2記事を除いた数）」。
同じ対象の件数が2文書で相反しており、B-755 に着手する次の PM はどちらを射程とすべきか判定できない。

```
$ grep -rl "道具箱" src scripts | wc -l
42
$ grep -rl "道具箱" src scripts | grep blog
src/blog/content/2026-06-12-top-page-toolbox-launch.md
src/blog/content/2026-07-13-design-token-migration-build-blind-spots.md
```

同じ index.md:631 が「公開済みブログ2記事｜記録なので触らない」と明記している。正しいのは 40。

### 2-2. B-741 の実測5件が `grep` で再現できない（指摘2・実測値）

`docs/backlog.md`:18 は「実測=5件(ADR/README.md:11・anti-patterns/planning.md:96・ADR001:6・knowledge/playwright-mcp.md:10・rebuild-plan.md:62)」と書く。
5件はいずれも実在する。しかし履歴（`docs/cycles/`・`docs/archive/`）を除いた全文検索は、同じ用法をもう1件出す。

```
$ grep -rn "正典" docs --include="*.md" | grep -v "^docs/cycles/" | grep -v "^docs/archive/"
...
docs/anti-patterns/candidates.md:15  …ハング自体の予防は `docs/knowledge/playwright-mcp.md` が正典。
docs/backlog.md:34                   候補の正典=research/2026-07-11-market-research-cycle278.md T4節
docs/research/2026-07-16-character-personality-scoring-analysis.md:79 分割モデル（∀版・これが正典）
```

`docs/anti-patterns/candidates.md`:15 は、**数えている `docs/anti-patterns/planning.md`:96 と同じディレクトリの、同じ「Xが正典」という権威づけの用法**である。
一方を数えて他方を数えない基準は書かれておらず、5件は網羅ではない。`docs/backlog.md`:34（生きている B-562 の Notes）も同型。

index.md:640「B-741 を完了にしかけた誤り」は、この誤りを「列挙された8件が網羅である保証を確かめず、リストを所与にして数え合わせただけだった」と記録している。
**新しい5件も、1巡目のレビューが示した6行のうち5行を採っただけで、自分で網羅を確かめていない。** 同じ型の3度目である。

### 2-3. B-656 の状態が2文書で相反する（矛盾）

```
$ sed -n '155p' docs/backlog.md
| B-656 | 店語彙の内部識別子・コメントの整理 | 312 | 【中止】…規範が決まるまで違反か判定できない。… |
$ sed -n '313p' docs/cycles/cycle-315/index.md
| QS-3 | B-656 を再開するのか中止のままにするのか | **対応する（実施済み）。** …B-656 を P4 で Queued へ戻した |
```

本サイクルの `6a3ee1b4`（「中止済みの B-656 を Done/Cancel へ差し戻す」）で backlog 側は中止へ戻ったが、index.md:313 は「Queued へ戻した」と書いたまま残っている。
生きているタスクか中止済みかが2文書で逆であり、どちらが正しいか文面からは決まらない。

### 2-4. B-746 の射程の行き先のうち、B-672 が backlog 側で引き取っていない（指摘1）

index.md:600 は「コメント・テスト名に残る旧コンセプトの語 → B-672（ソースコードのコメントに経緯が残っている）」と割り振る。
しかし B-672 の Notes は射程を別のものとして書いている。

```
$ sed -n '15p' docs/backlog.md
| B-672 | ソースコードのコメントに経緯が残っている | P4 | B-651完了で着手条件を満たした。実測=`cycle-NNN`参照が201ファイル359箇所。存在しない§番号を引く参照も同種。詳細cycle-312 |
$ grep -n "よろず屋" src/app/page.module.css src/app/dictionary/colors/page.module.css
src/app/page.module.css:2:  * トップページ（よろず屋の店先）— DESIGN.md フェーズ R・作り直し版。
src/app/page.module.css:36: * text-wrap: balance で「AIが営む、よろず屋です。」が…
src/app/dictionary/colors/page.module.css:2: * 伝統色辞典トップ（よろず屋の店構え）— DESIGN.md フェーズ R で新デザインへ変換。
```

`cycle-NNN` 参照でも `§` 参照でもないコメントが実在する。B-672 を backlog だけ読んで着手する PM は、この語に手を付けない。
index.md:596 の「無主になったものは無い」は、backlog 側の射程と突き合わせると成立していない。

### 2-5. B-744 の中止理由「実現手段が無い」が、到達先の記録に書かれていない（指摘8）

到達先の2点は裏付く——B-646 は同主題（チェックリストの改竄）で、cycle-307 で中止されている。

```
$ sed -n '238p' docs/backlog.md
| B-646 | cycle終了時チェックリストの改竄防止フック | 307 | 【中止】推測起票(実体未調査)。… |
$ sed -n '121p' docs/cycles/cycle-307/incident-1.md
- **不足A（チェックリスト改竄防止フック）は誤り**: …「TEMPLATE 正規項目と一致」を強制するフックはこの既存ワークフローを壊す。
  禁じるべきは項目の**差し替え/書き換え**であって補足の追記ではないが、初稿はその区別を実体確認せず粗い機構を提案した。→ B-646 中止。
```

裏付かないのは「実現手段が無い」である。§7-6 が退けたのは **TEMPLATE 正規項目との一致強制という特定の粗い機構**であり、
同じ行が「**禁じるべきは項目の差し替え/書き換え**」と、B-744 が対象にしているものを名指しで肯定している。
さらに §7-6 の「真相」は AP-WF28（既存ルールの不遵守であって不足ではない）であって、実現不可能性ではない。
`docs/cycles/cycle-315/index.md`:659 の「過去に実現不可能として取り下げられている」も同じ誤りを載せている。

### 2-6. B-753 の中止理由が引く Don't が、当のルールに存在しない（指摘9）

```
$ sed -n '154p' docs/backlog.md
| B-753 | … | 315 | 【中止】ルールや手順に既に書かれていることは書かないという`.claude/rules/anti-patterns-directory.md`のDon'tに当たる |
$ grep -n "Don't" .claude/rules/anti-patterns-directory.md
**Don't**: 「どのような手順でやるべきか」を記録する。
**Don't**: 特定の状況に特化した具体的な事例を記録する。
**Don't**: あとから気付いても回復できないようなアンチパターンを記録する。
```

3つの Don't のどれも「ルールや手順に既に書かれていることは書かない」ではない。
同じ文言は `docs/cycles/cycle-315/index.md`:589 にも「`.claude/rules/anti-patterns-directory.md` の Don't に当たる」として載っている。
1巡目が「ルール側を引くのが正しい」と言ったのは、実在する条文を引くことであって、実在しない条文を作ることではない。
（B-745・B-752 が引く「あとから気付いても回復できない」は実在する。B-752 の「発言の偽造は AP-WF27 が既に扱う」も `docs/anti-patterns/workflow.md`:56 の「実際には存在しない発言や指示を事実として書いていないか？」で裏付く。）

### 2-7. AP-WF27 の扱いが2文書で正反対になっている（矛盾）

```
$ sed -n '153p' docs/backlog.md
| B-752 | Ownerの発言を偽造した型が`docs/anti-patterns/`に無い | 315 | 【中止】…発言の偽造はAP-WF27が既に扱う |
$ sed -n '385,386p' docs/cycles/cycle-315/index.md
**incident-5 は既存のアンチパターン集が捉えていない型である**（…）。
… 覆っていないことまでは確かめた。**追加そのものは未了である。**
$ sed -n '56p' docs/anti-patterns/workflow.md
- AP-WF27: …実際には存在しない発言や指示を事実として書いていないか？
```

backlog は「既存が扱う（だから中止）」、index.md は「既存は捉えていない／追加は未了」と書く。
実体は AP-WF27 が明文で扱っており、**index.md:385-386 の側が事実に反する**。
この未了の記述は index.md:587「**すべて `docs/backlog.md` に起票済み。** 本サイクル固有の残件は無い。」とも両立しない。

### 2-8. 「B-741 を完了にしかけた誤り」の末尾1文が記録で裏付かない（AP-WF27）

節の事実関係は裏付く——8件の列挙は `git show a639b689^:docs/backlog.md` の B-741 Notes と逐語で一致し、
その列挙を書いたのは cycle-314 のコミット（`git log -S"knowledge/frontend.md 1件" -- docs/backlog.md` → `b5c1b244`「docs(cycle-314): 完了点検2巡目の14件に対応する」）である。表の5行もすべて実在する。

裏付かないのは最後の1文（index.md:654）。

> 本サイクルは「リストがいつ作られたかを確かめずに所与にした」型で一度止められており

本サイクルの事故記録は incident-1〜5 で、この型のものは無い。最も近い incident-3 は「失効した計画書をスキルの括弧書きから引いた」であって、リストでも「いつ作られたか」でもない。
記録で裏付かない経緯を事実として書いている（AP-WF27）。

## 3. 矛盾の有無（目的2）の全件確認

上記 §2-1・§2-3・§2-7 以外に、2文書が相反する箇所は見つからなかった。照合した対（ID・実測・状態）は次のとおり。

- B-746 の射程（backlog:17 の about 限定 ↔ index:594 の射程変更の節）: 整合。index:444 の T8 表の33ファイルは、その節が明示的に引き取っている。
- B-754（backlog:10 ↔ index:598・:608）: 「来訪者が読む文言」が両方に入った。整合。
- B-741（backlog:18 の Queued・5件 ↔ index:611・:640 の節）: 状態は整合（件数の問題は §2-2）。
- B-615（backlog:93 ↔ index:141）: どちらも B-652 を生きた着手条件にしていない。整合。
- B-742・B-672 の Queued 化（backlog:14・:15 ↔ index:612・補足事項）: 整合。
- 中止済み ID の参照: `grep -n "B-652\|B-586\|B-751" docs/backlog.md` の生存側ヒットは B-754:10 と B-748:19 の「統合」の記録のみで、着手条件には現れない。

## 4. 実測値の検算（目的3）

| 記載                                                           | 結果       | コマンド                                                                                                    |
| -------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| B-756「14面（`[slug]`・`__tests__` を除く）」                  | 一致       | `ls -d src/app/play/*/ \| wc -l`＝16、除外後14                                                              |
| B-755「`*Tile.tsx` 36本」                                      | 一致       | `find src -name "*Tile.tsx" \| wc -l`＝36                                                                   |
| B-755「コメント 40/42ファイル」                                | **不一致** | §2-1                                                                                                        |
| GA「analytics.ts:260-264 の variant・:271-276 の TileSurface」 | 一致       | `sed -n '260,276p' src/lib/analytics.ts`                                                                    |
| B-741「5件」                                                   | **不一致** | §2-2                                                                                                        |
| B-746「about:23・:82」                                         | 一致       | `grep -n よろず屋 src/app/about/page.tsx`                                                                   |
| B-754「page.tsx:38 の description・:194 の見出し」             | 一致       | `grep -n よろず屋 src/app/page.tsx`                                                                         |
| B-672「201ファイル359箇所」                                    | 一致       | `grep -rl "cycle-[0-9]\{2,3\}" src --include=*.ts --include=*.tsx --include=*.css \| wc -l`＝201、行数359   |
| B-742「:122/:205」                                             | 一致       | `sed -n '122p;205p' docs/character.md` の両方に「診断を主軸に」                                             |
| B-748「生きている参照9ファイル」                               | 一致       | `grep -rl rebuild-plan docs .claude` から cycles・archive・ADR/expired を除いて9                            |
| B-748「catalog 5ファイル」                                     | 一致       | `grep -rln ターゲット .claude/skills/new-cycle-idea/catalog/ \| wc -l`＝5（うち3件が rebuild-plan 参照）    |
| B-757「87記事」・B-566「36本」・B-564「4系統」                 | 一致       | `ls src/blog/content/*.md \| wc -l`＝87、`ls -d src/tools/*/meta.ts \| wc -l`＝36、`ls src/app/dictionary/` |
| B-646 が同主題・cycle-307 で中止                               | 一致       | `docs/backlog.md`:238・`docs/cycles/cycle-307/incident-1.md`:117-121                                        |
