# cycle-303 設計: word-sense-personality の結果先行是正

> ## ⚠ §3〜§5 の「案①＝公正タイブレーク」採用は破棄された（2026-08-09・オーナー指摘）
>
> 「タイブレークという語が中心に来た時点で、後付け割り振りの壊れた枠に入っている」（`cycle-294/incident-2.md` §7）。
> 案①はこの壊れた枠そのもので、同点27.79%の来訪者の結果を「答え」でなく決着ロジックで裁くにすぎない。
> 是正の本筋は**結果先行の再設計**（タイプが先・設問がそこへ判別・同点が設計上生じない）に差し替えた。
> 経緯と理由＝**[course-correction.md](./course-correction.md)**。
> **本書で今も有効なのは §0〜§2（欠陥の実在を示す実測）のみ。** §3 の案②は将来候補として §6 の扱いを維持。§4・§5 は参照しない。

> P1（実測と是正方針の設計）の成果物。すべての数値は planner が `src/play/quiz/scoring.ts` の実判定
> `determineResult` / `calculatePersonalityPoints` を tsx で import し、悉皆空間 4^10 = 1,048,576 を
> 全数列挙して実測（決定的・silent cap なし）。§1・§2 の実測は reviewer 2名が独立に再現済み。

## 0. 重要な事実訂正（現物確認）

- 申し送りは「**12問4択**（4^12≈1,677万）」だが、`word-sense-personality.ts` の現物は **10問4択**（q1〜q10）。悉皆空間は **4^10 = 1,048,576**。全数悉皆で実測した（サンプリング不要）。806行という行数は結果本文・36相性エントリを含むため。

## 1. 現物の構造要約

- **タイプ数**: 8（`results` 配列順＝タイブレークの優先順）:
  `elegant-precise`(0), `warm-empathy`(1), `creative-playful`(2), `logical-clear`(3), `poetic-sensory`(4), `bold-impact`(5), `humor-wit`(6), `gentle-indirect`(7)
- **配点型**（`types.ts`）: 各 `choice.points: Record<typeId, number>`。全40選択肢が「主(2点)×1タイプ + 副(1点)×1タイプ」。判定は汎用 `determineResult`（`QuizContainer.tsx:200-208` は character-personality と science-thinking のみ専用判定へ分岐、word-sense は汎用経路）。
- **主配点(2点)供給**: 全8タイプが厳密に5回ずつ（対称・既存テストが不変条件として固定）。
- **副配点(1点)供給の非対称**（＝欠陥の構造的根）:

| タイプ           | 副(+1)供給 | 主(+2)供給 | 理論最大点 |
| ---------------- | ---------: | ---------: | ---------: |
| elegant-precise  |      **8** |          5 |     **15** |
| warm-empathy     |      **8** |          5 |     **15** |
| gentle-indirect  |          7 |          5 |     **15** |
| creative-playful |          5 |          5 |         14 |
| humor-wit        |          5 |          5 |         14 |
| poetic-sensory   |          3 |          5 |         11 |
| logical-clear    |      **2** |          5 |         11 |
| bold-impact      |      **2** |          5 |         11 |

申し送りの「elegant-precise=8 vs bold-impact=2（4倍差）」を再現。**先頭タイプ(elegant-precise)は「配列先頭」と「副点供給最大(8)」の二重優位**を持つ。

## 2. 実測（悉皆 N=1,048,576・実 `determineResult` 使用）

### (a) 同点依存率・先頭偏り — triage を厳密再現

- **同点依存率 = 27.79%**（291,416 / 1,048,576）。triage の 27.79% と一致。
- **先頭偏り**（各タイプが同点タイブレークで実際に得た勝ち数 − 公正配分 1/k の期待値、対全標本%）:

| idx | type             | 同点勝ち | 公正期待 |        偏り |
| --: | ---------------- | -------: | -------: | ----------: |
|   0 | elegant-precise  |  113,119 |   49,084 | **+6.11pt** |
|   1 | warm-empathy     |   82,671 |   47,589 |     +3.35pt |
|   2 | creative-playful |   65,810 |   44,855 |     +2.00pt |
|   6 | humor-wit        |    5,377 |   44,810 |     −3.76pt |
|   7 | gentle-indirect  |    **0** |   41,259 |     −3.93pt |

`elegant-precise` の **+6.11pt** は triage の値と一致（全10診断中最大）。**gentle-indirect は同点勝ちが構造上ゼロ**（配列最後尾）。

### (b) 理想回答者テスト（到達性）

各タイプ T を各設問で最大化する正直回答（reachability.test.ts の `analyzeHonest` と同一手法）:

- **honest-unreachable(dead)=0・honest-tie-only=0**。全8タイプが正直回答で strict 単独勝者（T総合点 11〜15 が他型を strict に上回り、`determineResult` 勝者も一致）。triage の「wakakusa 是正後の全型 strict」と整合。→ **dead type は無い＝案③の主動機（到達性回復）は word-sense には存在しない**。

### (c) 出現率（実判定勝者分布）

| type             |    出現率 |
| ---------------- | --------: |
| elegant-precise  |    27.93% |
| warm-empathy     |    22.74% |
| creative-playful |    13.55% |
| gentle-indirect  |    12.19% |
| humor-wit        |     7.81% |
| poetic-sensory   |     6.35% |
| bold-impact      |     4.89% |
| logical-clear    | **4.54%** |

**最大/最小 = 6.15倍**（elegant 27.93% / logical 4.54%）。triage の「約6.2倍」を再現。

### (d) 追加実測: 6.15倍のうち「配列順」由来はどれだけか

公正な（配列順に依存しない）タイブレークに置換した場合の出現率を悉皆で再計算:

- **どんな対称タイブレークでも到達する公正期待**: 最大/最小 = **3.92倍**（elegant 21.82% / logical 5.56%）。**系統的先頭偏りは完全消滅**。
- 残る **3.92倍は純粋に構造由来**（副点供給 8対2）＝配列順とは無関係。**出現率不均衡の主因は配列順ではなく副点非対称**。

→ **結論の核**: 「結果が回答でなく配列順で決まる」欠陥（＝案の対象）は、配点非対称ではなく **同点27.79%の決着ロジック**にある。公正タイブレークでこれは**根絶**する。残る3.92倍は「型の的の広さ」の差であり、個々の来訪者は依然「自分の回答が指す型」を受け取る（＝結果先行ではない）。

## 3. 3案の来訪者価値比較

| 観点                       | 案①公正タイブレーク                                                                                                                       | 案②同点の開示UX                                                          | 案③G1〜G5再設計                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| **結果先行(配列順)の是正** | **完全**（配列順を判定から除去）                                                                                                          | 完全（同点を隠さず開示）                                                 | 完全                                                                           |
| **来訪者が受ける差分**     | 同点回答者(27.79%)の結果が**回答依存**に変わる。うち約42%は「最も多く1位に選んだ型」が勝つ（意味的）、約58%は対称ハッシュで決定（不可視） | 同点回答者に「X型とY型のあいだ」を提示。単一型の断定体験が消える         | 出現率も均す（が6.15→3.92の残差は副点由来で均一化は cycle-295 が撤回済み目標） |
| **到達性(dead)**           | 変化なし（strict勝者は不変）＝全型到達を維持                                                                                              | 同左                                                                     | dead回復が売りだが word-sense に dead は無い(実測(b))                          |
| **決定性/再現性**          | 保持（回答→常に同結果・シェア/再受験再現）                                                                                                | 保持                                                                     | 保持                                                                           |
| **コスト**                 | 小（判定関数1つ）                                                                                                                         | 中〜大（結果ページ・detailedContent・相性・シェア・SEOを二型対応に改修） | 最大（cycle-295 は同型6構造で不能性解析に到達）                                |
| **波及**                   | 共有 `determineResult`＝他8診断へ（実測済み・下§5）                                                                                       | word-sense UI局所（ただし全診断の同点にも波及検討要）                    | word-sense局所                                                                 |
| **PV53への比例**           | 比例                                                                                                                                      | 過大                                                                     | 過大                                                                           |

**案③が不比例な決定的理由**:

1. **到達性という主動機が word-sense に無い**（実測(b): dead=0, tie-only=0）。cycle-295 の③は「dead 2タイプ回復」が中核だったが、word-sense にはその病巣が無い。
2. **③の追加目標（出現率均一化）は cycle-295 自身が取り下げた ill-posed 目標**。cycle-295 の結論は「一様測度に同型フロア G4c を課すこと自体が G4a と原理的に相反＝基準の問題」で **G4c を撤回**して出荷した。よって「6.15→均一」を③で追う根拠は cycle-295 の到達点と矛盾する。残差3.92倍（副点8対2）は来訪者が1回のプレイで知覚しない構造属性。
3. **CLAUDE.md の決定原則**（より良いUXが可能ならコストで劣位を選ばない）に照らしても、③は①より**良い来訪者体験を生まない**——「自分の回答が結果を決める」という体験は①で完全達成され、③の追加分は非目標（均一化）に向く。よって①は「コストで妥協した劣位案」ではなく**目標を満たす比例案**。
4. **cycle-297 の申し送り**（1診断ずつ・最小サイクル）。③は B-589 スケールで、PV 53 に対し過大。

**案②を今回採らない理由**: 約58%の同点は「回答が真に対称」で、その場合「X型とY型のあいだ」は最も正直——②には本質的な価値がある。だが全結果面（detailedContent 8種の variant・36相性・シェア画像・SEO index）が単一型キーで組まれており、二型化は PV 53 に不比例な広範改修。**将来 B-606 で単一型の断定を弱めない方針を保つ限りの有力な後続候補**として backlog へ送る（③より軽く、②の方が誠実）。

## 4. 決定: 案①（意味のある→対称な決定的タイブレーク）

配列順タイブレークを、**回答から導ける対称・決定的・意味のある決着**へ差し替える。チェーン:

1. **同点集合を score 最大の全タイプで作る**（`quiz.results` の並び順を判定に一切使わない）。
2. **主選択回数(primaryPickCount)** 最大で絞る＝「その型を自分が2点の1位として選んだ回数」。主供給は全型5回で対称。**意味的**（あなたが最も強く選んだ型が勝つ）。実測: 同点の**41.64%**をここで一意化。
3. なお同点なら **対称決定的ハッシュ**（回答の正準直列化 `sort(questionId)→"qid:choiceId"連結` の FNV-1a）で、**typeId昇順に整列した同点部分集合**から選ぶ。配列順に非依存＝先頭偏りを残さない。残り約58%（全体の約16%）をここで決定。真に対称な同点なので不可視な公正決着が誠実。

**この決定の実測効果（word-sense 悉皆）**:

- 先頭偏り +6.11pt → **消滅**（elegant 出現率 27.93% → 19.43%）。
- 最大/最小 6.15倍 → **2.76倍**（一様ハッシュの3.92倍より良い＝主選択回数が「elegant が副点のおこぼれで勝つ」構造を意味的に打ち消すため）。
- 到達性・決定性・再現性は保持。

## 5. 実装仕様（builder 向け）

### 変更ファイル/関数

- **`src/play/quiz/scoring.ts` の `determineResult`（personality 分岐 90-100行）のみ**。`calculatePersonalityPoints` は不変。
- ヘルパを追加（同ファイル内、非公開でよい）:
  - `computePrimaryPickCounts(questions, answers): Record<string, number>` — 各回答の選択肢の「値2のキー」を集計。
  - `fnv1a(s: string): number` — 依存なしの安定ハッシュ。
  - `canonicalAnswerKey(answers): string` — `[...answers].sort(by questionId).map(a=>`${qid}:${cid}`).join("|")`。**決定性の要**（配列到着順に非依存＝シェア/再受験で同一）。

### 判定ロジック（擬似コード）

```
points = calculatePersonalityPoints(questions, answers)
max = maximum of (points[r.id] ?? 0) over quiz.results
tied = quiz.results filter score === max        // 配列順は集合作成にのみ使用、決着には使わない
if tied.length === 1: return tied[0]
prim = computePrimaryPickCounts(questions, answers)
bestPrim = max over tied of (prim[t.id] ?? 0)
tied2 = tied filter (prim === bestPrim)
if tied2.length === 1: return tied2[0]
sorted = tied2 sorted by id (asc)               // 正準・配列順非依存
h = fnv1a(canonicalAnswerKey(answers))
return sorted[h % sorted.length]
```

knowledge 分岐は不変。**typeId・title は改名しない**（資産）。

### 共有 vs word-sense限定（推奨: 共有）

- **共有 `determineResult` を直接変更することを推奨**。理由: (i) 実測で**全8汎用診断が dead type 0 のまま**（下表）＝到達性を退行させない（strict勝者は不変ゆえ構造的に安全）、(ii) 他7診断も同一の配列順欠陥を持ち cycle-297 が是正対象と確定済み＝共有修正は来訪者価値が広い、(iii) QuizContainer に word-sense専用分岐を足す複雑化を避けられる。index.md P1 が要求する「波及の明記」を本節で満たす。「1診断ずつ」は重い G1〜G5 再設計の話であり、共有タイブレーク差し替え（cycle-297・index.md が候補として明示）には当たらない。
- 代替（オーナーが厳格な word-sense限定を求める場合）: `determineResult` に任意の `tiebreak?: "array" | "fair"` を足し、QuizContainer で word-sense のみ `"fair"` を渡す。ただし7診断に欠陥を残すため非推奨。

### 波及実測（全汎用 personality 診断・悉皆 or ≤200万、japanese-cultureのみ規模超で悉皆除外）

| slug                     | 同点率 | results[0] 現→公正            | 最大/最小 現→公正 | dead(現/公正) |
| ------------------------ | -----: | ----------------------------- | ----------------- | ------------: |
| word-sense-personality   |  27.8% | elegant 27.93→19.43%          | 6.15→2.76         |           0/0 |
| animal-personality       |  31.6% | nihon-zaru 12.05→7.67%        | 4.02→2.30         |           0/0 |
| music-personality        |  24.0% | festival-pioneer 16.88→12.97% | 1.70→1.17         |           0/0 |
| yoji-personality         |  26.1% | shoshikantetsu 16.49→12.23%   | 1.81→1.09         |           0/0 |
| traditional-color        |  27.3% | ai 12.15→8.04%                | 1.39→**3.31**     |           0/0 |
| contrarian-fortune       |  26.6% | reverseoptimist 17.70→13.02%  | 2.75→1.47         |           0/0 |
| unexpected-compatibility |  26.1% | vendingmachine 20.27→14.76%   | 2.55→1.32         |           0/0 |
| impossible-advice        |  25.6% | timemagician 16.08→12.44%     | 2.45→1.35         |           0/0 |

- **全診断で results[0] の先頭優位が消える／dead type は発生しない**。
- **traditional-color のみ最大/最小が 1.39→3.31 に上がる**が、これは退行ではない: (i) 到達性(dead=0)は保持、(ii) **出現率均一は目標ではない**（cycle-295 が G4c を撤回）。現行の1.39は「配列順が偶然分布を均していた」産物で、公正化により各来訪者が自分の主選択に沿う型を受け取るようになった結果。この1点を明記して builder/reviewer の誤検知を防ぐこと。
- japanese-culture（4^18＝687億）は悉皆不可。既存 reachability.test.ts の決定的サンプリング(N=50万)ガードがそのまま dead=0 を担保（タイブレーク変更は strict勝者を動かさないので標本ガードで十分）。

### 決定性・再現性の担保

- 判定は `(points, primaryPickCounts, canonicalAnswerKeyのハッシュ)` のみに依存。**同じ回答→常に同じ結果**（配列到着順にも非依存）。シェア/再受験で再現。乱数・時刻・環境非依存。

### 追加/更新する回帰テスト（赤→緑）

`src/play/quiz/__tests__/reachability.test.ts`（または `scoring.test.ts`）に:

1. **配列順非依存ガード（欠陥の核を直撃・現行で赤）**: word-sense の `results` を逆順にした複製 quiz を作り、悉皆（4^10）または決定的サンプルで `determineResult(quiz,a).id === determineResult(quizReversed,a).id` を全回答で assert。**現行コードは同点で不一致→赤／修正後は一致→緑**。これが「結果先行(配列順で決まる)」の直接的回帰ガード。
2. **意味的タイブレークの didactic 例（現行で赤）**: elegant と warm-empathy が同点で warm を主選択多数にする回答で、**現行は elegant-precise（配列順）→修正後は warm-empathy（主選択多数）** を assert（回答は builder が実データで確定）。
3. **決定性ガード**: 同一回答を配列順シャッフルして渡しても同一 id を返す（`canonicalAnswerKey` の正準性を固定）。
4. **既存の理想回答者ガード（reachability.test.ts）は緑のまま**（strict勝者不変）＝退行なしの確認。

### UI（P4）

結果ページは単一 `result` を受け取る構造のまま（`QuizContainer.tsx:199-208` の分岐は不変、判定の中身だけ変わる）。**表示コンポーネントは無変更**＝スクショ前後差分は原理的に生じない。P4 は「UI 不変・理由=判定ロジックのみの変更」を記録すれば足る（案②を選ばないため frontend-design 参照は不要）。

## 6. 未解決の論点

- **案②（同点開示UX）を後続 backlog へ**: 約58%の同点は真に対称で「X型とY型のあいだ」が最も誠実。単一型断定を弱めない範囲で、③より軽く誠実な将来候補。B-606 の残り診断是正時に横断検討。
- **共有変更のスコープ承認**: 「1診断ずつ」との整合を reviewer に明示的に確認（本設計は共有＝全8同時是正を推奨し波及を実測提示済み）。厳格限定を求めるなら §5 の param 分岐へ縮退。
- **残差3.92倍（副点8対2）**: 是正しない（G4c 撤回・PV53 に不比例）。将来 word-sense を③相当で触るなら副点対称化で低減可能だが本サイクル対象外。
