# cycle-295 設計土台: 6アーキタイプの主軸×副軸(A1)

`/play/character-personality`(全PVの31%)の判定を「6アーキタイプの主軸×副軸」へ再設計するための**設計土台**。
本文書の内容はすべて**現物を開いて読み、コード註の逐語を典拠として引用**している(推測で埋めていない)。

**読んだ現物(典拠ファイル)**:

- `docs/research/2026-07-16-character-personality-scoring-analysis.md` §2
- `src/play/quiz/data/character-personality.ts`(冒頭コメント §型内訳・全12問の配点)
- `src/play/quiz/data/character-personality-results-batch1.ts`(#1〜#10)
- `src/play/quiz/data/character-personality-results-batch2.ts`(#11〜#20)
- `src/play/quiz/data/character-personality-results-batch3.ts`(#21〜#24)
- `src/play/quiz/data/character-personality-compatibility.ts`(構造把握のみ)

各 result のコード註を1件ずつ確認した(下の§2の写像表がその逐語)。

---

## 1. 6アーキタイプの行動的定義(24タイプの結果本文から帰納)

各定義は**発明でなく本文からの復元**である。根拠タイプ名と、その `archetypeBreakdown` / `behaviors` の逐語(ファイル+コード註)を併記する。
帰納にあたっては、そのアーキタイプを**主軸または同型**に持つタイプ本文を優先し、副軸で現れる記述で補強した。

### commander(司令塔・行動)

**定義**: 「考えてから動く」より先に体が動く即断即行。前に立って人を巻き込み、走りながら軌道修正する推進力。速さと熱量で場を動かすが、計画は後追いになりがち。

- 典拠 `character-personality-results-batch2.ts` `// #16 commander × commander (同型強化)` ultimate-commander の archetypeBreakdown 逐語:「あなたの行動力とリーダーシップが極限まで強まると、『考えてから動く』という選択肢そのものが思考から消える。疲れに気づく前に次の一手が出る純粋な推進力と、動きながら修正し続ける高速の判断力。」／behaviors:「『計画を立てよう』という話になってから5分後には既に動き出している。」
- 典拠 `character-personality-results-batch1.ts` `// #1: blazing-strategist — commander × professor` archetypeBreakdown:「爆発的に走り出す行動力と…」／`// #4: blazing-warden — commander × guardian`:「前に出て引っ張るリーダーシップ…速さよりも『全員でゴールする』」(巻き込み・先頭で牽引の側面)

### professor(博士・分析)

**定義**: 物事を構造で切り分け、根拠を積み上げ、検証・記録・調査を止めない。「もう少し調べてから」「念のためもう一度」が反射になり、十分という状態に到達しない。準備は長いが精度は高い。

- 典拠 `character-personality-results-batch2.ts` `// #17 professor × professor (同型強化)` endless-researcher の archetypeBreakdown 逐語:「あなたの分析力と知識欲が極限まで強まると、『十分な情報量』という概念が消えていく。調べれば調べるほど『まだ知らないことがある』という感覚が強まり、知識を集めること自体が目的になる。」／behaviors:「『もう少し調べてから』と言っているうちに、一番詳しい人になっている。」
- 典拠 `character-personality-results-batch1.ts` `// #8: careful-scholar — professor × guardian`:「理論を緻密に組み立てる分析力…」／`// #1` 副軸 professor:「状況を冷静に切り分ける鋭い分析眼」

### dreamer(夢想家・内省)

**定義**: 行動より先に頭の中で世界を精巧に構築する。現実を物語・妄想へ変換し、脳内での旅・設計・想像に時間を費やす。想像の解像度が高く、現実がもどかしくなる。内向きに世界を味わう。

- 典拠 `character-personality-results-batch2.ts` `// #18 dreamer × dreamer (同型強化)` eternal-dreamer の archetypeBreakdown 逐語:「あなたの感性と想像力が極限まで強まると、現実と妄想の境界線が溶けていく。行き先も持ち物も出会う人も精巧に組み上げた脳内世界は、現実よりも解像度が高い。」／behaviors:「『いつか○○に行きたい』と言いながら、脳内では既に帰りのフライトまで決まっている。」
- 典拠 `character-personality-results-batch2.ts` `// #11 dreamer × guardian` tender-dreamer:「やわらかい想像力」／`// #12 dreamer × artist` dreaming-canvas:「夢見る想像力…現実を物語に変換する感性」

### trickster(策略家・逆張り)

**定義**: 王道を反射的に疑い、抜け道・別解・裏を探す。素直に受け取らず深読みし、実験や逆張りで斜め上へ進む。機転とリスク察知が鋭く、複雑化を厭わない(むしろ楽しむ)。

- 典拠 `character-personality-results-batch2.ts` `// #19 trickster × trickster (同型強化)` ultimate-trickster の archetypeBreakdown 逐語:「あなたの機転と深読み本能が極限まで強まると、『素直に受け取る』という選択肢が思考から消える。裏を読んでさらにその裏を読む多重解析が無意識に走り続け…」
- 典拠 `character-personality-results-batch2.ts` `// #14 trickster × artist` creative-disruptor:「王道への反射的な疑問…」／`// #13 trickster × guardian` clever-guardian:「鋭いリスク察知眼と、見つけた穴を放置できない保護本能」／`character-personality-results-batch1.ts` `// #3` 副軸:「抜け道を一瞬で見抜く策略眼」

### guardian(守護者・備え)

**定義**: リスクを先読みして備え、周囲の様子・顔色を確認して守る。「念のため」の想定範囲が広く、備えても「足りているか」が終わらない。堅実さと保護本能で、周囲に安心を供給する。

- 典拠 `character-personality-results-batch2.ts` `// #20 guardian × guardian (同型強化)` ultimate-guardian の archetypeBreakdown 逐語:「あなたの堅実さと保護本能が極限まで強まると、『十分な備え』という状態が永遠に訪れなくなる。想定範囲が広がるほど新たなリスクが見えてくるため、慌てない安定感と永遠に続く『足りてるかな?』が共存する。」／behaviors:「晴れ予報の日でも『念のため』と傘を2本持って出かける。」
- 典拠 `character-personality-results-batch3.ts` `// #22 — guardian × professor` data-fortress:「誰かを守りたいという本能」／`// #24 — guardian × commander` guardian-charger:「誰かを守りたい本能と、ここぞで踏み込む決断力」

### artist(芸術家・感性)

**定義**: 感覚のアンテナが鋭く、微細な差(色・角度・空気)に気づく。言語化より創作で表現し、妥協しない美意識で「まだ違う」を繰り返す。理屈より本能・直感で動く。

- 典拠 `character-personality-results-batch3.ts` `// #21 — artist × artist (同型強化)` ultimate-artist の archetypeBreakdown 逐語:「鋭い感性と妥協しない批評眼が、あなたの中で二重に増幅されている。『美しい』と『まだ違う』が同時に鳴り響くから、完成への渇望と不完全さへの感度が互いを高め合い、終わりのない追求へと駆り立てられる。」／behaviors:「言葉で説明しようとすると『うーん、違う』とつまって、作品を見せる方が早い。」
- 典拠 `character-personality-results-batch3.ts` `// #23 — artist × trickster` vibe-rebel:「研ぎ澄まされた感性と、とっさにひらめく直感」／`character-personality-results-batch1.ts` `// #9` 副軸:「色や感触で味わう感性」

---

## 2. 24タイプ = 主軸×副軸 の完全な対応表(コード註の逐語が典拠)

全24 result の `id` を、各ファイルのコード註に基づき (主軸, 副軸) の順序対へ写像した。**「逐語」列は実ファイルのコメント原文**。

| #   | typeId               | 主軸      | 副軸      | 区分 | 典拠ファイル | コード註 逐語                                           |
| --- | -------------------- | --------- | --------- | ---- | ------------ | ------------------------------------------------------- |
| 1   | blazing-strategist   | commander | professor | 異型 | batch1       | `// #1: blazing-strategist — commander × professor`     |
| 2   | blazing-poet         | commander | dreamer   | 異型 | batch1       | `// #2: blazing-poet — commander × dreamer`             |
| 3   | blazing-schemer      | commander | trickster | 異型 | batch1       | `// #3: blazing-schemer — commander × trickster`        |
| 4   | blazing-warden       | commander | guardian  | 異型 | batch1       | `// #4: blazing-warden — commander × guardian`          |
| 5   | blazing-canvas       | commander | artist    | 異型 | batch1       | `// #5: blazing-canvas — commander × artist`            |
| 6   | dreaming-scholar     | professor | dreamer   | 異型 | batch1       | `// #6: dreaming-scholar — professor × dreamer`         |
| 7   | contrarian-professor | professor | trickster | 異型 | batch1       | `// #7: contrarian-professor — professor × trickster`   |
| 8   | careful-scholar      | professor | guardian  | 異型 | batch1       | `// #8: careful-scholar — professor × guardian`         |
| 9   | academic-artist      | professor | artist    | 異型 | batch1       | `// #9: academic-artist — professor × artist`           |
| 10  | star-chaser          | dreamer   | trickster | 異型 | batch1       | `// #10: star-chaser — dreamer × trickster`             |
| 11  | tender-dreamer       | dreamer   | guardian  | 異型 | batch2       | `// #11 dreamer × guardian`                             |
| 12  | dreaming-canvas      | dreamer   | artist    | 異型 | batch2       | `// #12 dreamer × artist`                               |
| 13  | clever-guardian      | trickster | guardian  | 異型 | batch2       | `// #13 trickster × guardian`                           |
| 14  | creative-disruptor   | trickster | artist    | 異型 | batch2       | `// #14 trickster × artist`                             |
| 15  | gentle-fortress      | guardian  | artist    | 異型 | batch2       | `// #15 guardian × artist`                              |
| 16  | ultimate-commander   | commander | commander | 同型 | batch2       | `// #16 commander × commander (同型強化)`               |
| 17  | endless-researcher   | professor | professor | 同型 | batch2       | `// #17 professor × professor (同型強化)`               |
| 18  | eternal-dreamer      | dreamer   | dreamer   | 同型 | batch2       | `// #18 dreamer × dreamer (同型強化)`                   |
| 19  | ultimate-trickster   | trickster | trickster | 同型 | batch2       | `// #19 trickster × trickster (同型強化)`               |
| 20  | ultimate-guardian    | guardian  | guardian  | 同型 | batch2       | `// #20 guardian × guardian (同型強化)`                 |
| 21  | ultimate-artist      | artist    | artist    | 同型 | batch3       | `// #21 — artist × artist (同型強化: 純粋アーティスト)` |
| 22  | data-fortress        | guardian  | professor | 逆順 | batch3       | `// #22 — guardian × professor (論理的守護者)`          |
| 23  | vibe-rebel           | artist    | trickster | 逆順 | batch3       | `// #23 — artist × trickster (野生の芸術家)`            |
| 24  | guardian-charger     | guardian  | commander | 逆順 | batch3       | `// #24 — guardian × commander (前に出る守護者)`        |

### 内訳の検算

- **15の異型組**(C(6,2)・主≠副): #1〜#15。
  - commander×{professor,dreamer,trickster,guardian,artist} = #1〜#5(5組)
  - professor×{dreamer,trickster,guardian,artist} = #6〜#9(4組)
  - dreamer×{trickster,guardian,artist} = #10〜#12(3組)
  - trickster×{guardian,artist} = #13,#14(2組)
  - guardian×{artist} = #15(1組)
  - 計 5+4+3+2+1 = **15** ✓(C(6,2)=15 と一致)
- **同型強化6**(X×X): #16〜#21 = commander/professor/dreamer/trickster/guardian/artist の6つ。**6** ✓
- **逆順3**: #22 guardian×professor / #23 artist×trickster / #24 guardian×commander。
  - `docs/research/2026-07-16-...md` §2 の逐語:「逆順 3(#22 guardian×professor / #23 artist×trickster / #24 guardian×commander は #8/#14/#4 の順序違い)」
  - 実ファイルで確認: #22 は #8 `professor × guardian` の順序違い、#23 は #14 `trickster × artist` の順序違い、#24 は #4 `commander × guardian` の順序違い。研究 §2 の記述と**一致**。**3** ✓
- **合計 15+6+3 = 24** ✓(24 typeId すべてに写像先あり・重複なし)

### 36の順序対の被覆(取りこぼしゼロの確認)

順序対は 6主軸×6副軸 = **36**。内訳: 同型6(対角) + 異型30(=6×5)。

- **同型6**(commander×commander … artist×artist): #16〜#21 が直接写像 → **6/6 直接被覆**。
- **異型30 のうち直接写像がある18**: 15の異型組(#1〜#15)+逆順3(#22/#23/#24)= **18の順序対に直接 typeId が存在**。
  - このうち3つの無順序組 {professor,guardian}・{trickster,artist}・{commander,guardian} は**両方向とも**直接 typeId を持つ:
    - (professor,guardian)=#8 / (guardian,professor)=#22
    - (trickster,artist)=#14 / (artist,trickster)=#23
    - (commander,guardian)=#4 / (guardian,commander)=#24
- **残る12の順序対は直接 typeId が無い → 逆順で引く**(順序対 (P,S) が無ければ (S,P) を引く=研究 §2「無ければ逆順で引く」の実装意図)。**逆順フォールバックで引くべき12対**:

  | 直接 typeId が無い順序対(主,副) | 逆順で引く先(直接 typeId)                     |
  | ------------------------------- | --------------------------------------------- |
  | (professor, commander)          | #1 blazing-strategist (commander×professor)   |
  | (dreamer, commander)            | #2 blazing-poet (commander×dreamer)           |
  | (trickster, commander)          | #3 blazing-schemer (commander×trickster)      |
  | (artist, commander)             | #5 blazing-canvas (commander×artist)          |
  | (dreamer, professor)            | #6 dreaming-scholar (professor×dreamer)       |
  | (trickster, professor)          | #7 contrarian-professor (professor×trickster) |
  | (artist, professor)             | #9 academic-artist (professor×artist)         |
  | (trickster, dreamer)            | #10 star-chaser (dreamer×trickster)           |
  | (guardian, dreamer)             | #11 tender-dreamer (dreamer×guardian)         |
  | (artist, dreamer)               | #12 dreaming-canvas (dreamer×artist)          |
  | (guardian, trickster)           | #13 clever-guardian (trickster×guardian)      |
  | (artist, guardian)              | #15 gentle-fortress (guardian×artist)         |

- **被覆の検算**: 同型6(直接) + 異型直接18 + 逆順フォールバック12 = **36/36**。**取りこぼし(写像先の無い順序対)ゼロ** ✓
  - これは研究 §2「36 の順序対すべてが実在タイプへ写像できる=取りこぼしゼロ」と一致。
  - **注意(判定設計への含意)**: 上記12対は「主軸と副軸が入れ替わっても同じ typeId に落ちる」。研究 §3 の逆順フォールバックが同点を無償一意化する効果(約9pt)は、この12対で主副が入れ替わっても結果が同じになる性質に由来する。

---

## 3. type-slot の非対称表(主軸/副軸ごとのタイプ数)

各アーキタイプが**主軸**になっているタイプ数を、異型・同型・逆順で区別して数えた(§2 の写像表から集計)。

| アーキタイプ | 主軸: 異型 | 主軸: 同型 | 主軸: 逆順  | **主軸 計** | 該当 typeId                                                                                  |
| ------------ | ---------- | ---------- | ----------- | ----------- | -------------------------------------------------------------------------------------------- |
| commander    | 5 (#1-5)   | 1 (#16)    | 0           | **6**       | blazing-strategist/poet/schemer/warden/canvas, ultimate-commander                            |
| professor    | 4 (#6-9)   | 1 (#17)    | 0           | **5**       | dreaming-scholar, contrarian-professor, careful-scholar, academic-artist, endless-researcher |
| dreamer      | 3 (#10-12) | 1 (#18)    | 0           | **4**       | star-chaser, tender-dreamer, dreaming-canvas, eternal-dreamer                                |
| trickster    | 2 (#13-14) | 1 (#19)    | 0           | **3**       | clever-guardian, creative-disruptor, ultimate-trickster                                      |
| guardian     | 1 (#15)    | 1 (#20)    | 2 (#22,#24) | **4**       | gentle-fortress, ultimate-guardian, data-fortress, guardian-charger                          |
| artist       | 0          | 1 (#21)    | 1 (#23)     | **2**       | ultimate-artist, vibe-rebel                                                                  |
| **計**       | **15**     | **6**      | **3**       | **24**      |                                                                                              |

- **主軸 計の検算**: 6+5+4+3+4+2 = **24** ✓(異型15 + 同型6 + 逆順3 = 24 ✓)
- **非対称の実数**: commander が主軸 = **6タイプ**で最多、artist が主軸 = **2タイプ**で最少(**3倍**の開き)。
  - `character-personality.ts` 冒頭コメントは「blazing-_: commander primary (5 types)」と記すが、これは異型5(blazing-_)のみの数で、同型 ultimate-commander を含めると commander 主軸は6。同ファイルは ultimate-commander を同型ダブルとして別掲している。本表は**同型・逆順を含めた実数6**を採る。
  - **設計上の含意**(index.md §注意と整合): 主軸タイプ数が非対称なので「各アーキタイプが主軸になれる機会の均等化」は到達性(G4)を保証しない。commander 主軸6タイプ側は機会が均等でも各タイプが薄まり、artist 主軸2タイプ側は各タイプが濃くなる。

### 参考: 副軸ごとのタイプ数(非対称は主軸と鏡像)

| アーキタイプ | 副軸となるタイプ数 | 該当#                                               |
| ------------ | ------------------ | --------------------------------------------------- |
| commander    | 2                  | #16(同型), #24(逆順・guardian×commander)            |
| professor    | 3                  | #1, #17(同型), #22(逆順・guardian×professor)        |
| dreamer      | 3                  | #2, #6, #18(同型)                                   |
| trickster    | 5                  | #3, #7, #10, #19(同型), #23(逆順・artist×trickster) |
| guardian     | 5                  | #4, #8, #11, #13, #20(同型)                         |
| artist       | 6                  | #5, #9, #12, #14, #15, #21(同型)                    |
| **計**       | **24**             |                                                     |

- **副軸 計の検算**: 2+3+3+5+5+6 = **24** ✓
- **主軸+副軸の総出現(24×2=48)の検算**: commander 6+2=8 / professor 5+3=8 / dreamer 4+3=7 / trickster 3+5=8 / guardian 4+5=9 / artist 2+6=8 → 合計 **48** ✓
  - dreamer は総出現7で最少、guardian は9で最多。**主軸で多いアーキタイプほど副軸で少ない**逆相関がある(commander 主6/副2、artist 主2/副6)。これは異型15組が C(6,2) の各組を1回ずつ持ち、逆順3が {guardian×professor / artist×trickster / guardian×commander} に偏る構造に由来。

---

## 4. academic-artist / clever-guardian の現状(研究 §1「本人に永久に届かない2タイプ」)

`docs/research/2026-07-16-...md` §1 の逐語:「本人に永久に届かない 2 タイプ(測度非依存・最も鋭い事実): `academic-artist`… `clever-guardian`…」。この2タイプが本設計の写像でどの (主,副) に対応するか:

| typeId              | #   | (主軸, 副軸)              | 区分 | 典拠コード註                                         |
| ------------------- | --- | ------------------------- | ---- | ---------------------------------------------------- |
| **academic-artist** | #9  | **(professor, artist)**   | 異型 | batch1 `// #9: academic-artist — professor × artist` |
| **clever-guardian** | #13 | **(trickster, guardian)** | 異型 | batch2 `// #13 trickster × guardian`                 |

- **academic-artist = professor 主軸 × artist 副軸**。professor は主軸5タイプ側(混みやすい)、artist は副軸6タイプ側(最も混む副軸)。研究 §1 は「上限8点で `dreaming-scholar`・`careful-scholar` と同点、配列 index 8 対 5 で負ける」と記す=同じ professor 主軸(#6 dreaming-scholar・#8 careful-scholar)との同点に配列順で敗れる構造。
- **clever-guardian = trickster 主軸 × guardian 副軸**。trickster は主軸最少3タイプ、guardian は副軸5タイプ側。研究 §1 は「上限9点で `contrarian-professor` と同点、index 12 対 6 で負ける」と記す。
- 本設計(6アーキタイプ得点→主軸×副軸)では、この2タイプは (professor,artist) / (trickster,guardian) の**直接 typeId** なので、6アーキタイプ得点で professor>artist / trickster>guardian の順が立てば逆順フォールバックを経ずに到達しうる。**現行の到達不能は「24タイプ直接配点+配列順タイブレーク」機構の産物**であり、主軸×副軸機構では原理的に別ルートで到達可能になる(実際の到達率は C/D で設問設計・TH と往復して検証=本文書のスコープ外)。

---

## 5. 現行の選択肢配点の構造(参考情報・再現対象ではない)

本タスクは再設計の土台作りであり**現行配点(24タイプ直接配点)の再現ではない**。構造のみ記す。

- `character-personality.ts` 冒頭コメント逐語:「Scoring: method B (direct point allocation). Each choice awards 2pt (primary × 2 types) + 1pt (secondary × 2 types).」=各選択肢が **24タイプIDに直接** 2点×2タイプ + 1点×2タイプ を配る(6アーキタイプへの配点ではない)。
- 全12問×4択=48選択肢が、それぞれ4つの typeId に加点(2,2,1,1)。研究 §5 はこれを「各選択肢の点を構成アーキタイプへ配ると 48中30で単一アーキタイプが過半=設計意図(主軸×副軸)はデータに実在し実行時に捨てられている」と分析。
- **現行判定の欠陥**(研究 §1・index.md):トップ同点が一様測度で36.20%(一貫度80%で46.4%)発生し、`scoring.ts` の strict `>` で `results` 配列の若い順に決着。2タイプが本人に届かない。
- 本設計では選択肢配点を**6アーキタイプ得点**へ振り直し、主軸×副軸で判定する(C1)。現行の48×4=192エントリの直接配点は土台にしない(index.md:「cycle-284 §5 の既存設問固定・配点振り直し案は同じ壊れた枠なので採らない」)。

---

## 検算まとめ

| 検算項目                                                                         | 結果                          |
| -------------------------------------------------------------------------------- | ----------------------------- |
| 異型15 + 同型6 + 逆順3                                                           | = **24** ✓                    |
| 24 typeId すべてに (主,副) 写像先あり・重複なし                                  | ✓(§2表 全24行)                |
| 36順序対の被覆(同型6直接 + 異型18直接 + 逆順12フォールバック)                    | = **36/36・取りこぼしゼロ** ✓ |
| type-slot 主軸 計(6+5+4+3+4+2)                                                   | = **24** ✓                    |
| type-slot 副軸 計(2+3+3+5+5+6)                                                   | = **24** ✓                    |
| 主軸+副軸 総出現                                                                 | = **48** ✓                    |
| 研究 §2「逆順3=#8/#14/#4の順序違い」                                             | 実ファイルと**一致** ✓        |
| academic-artist=(professor,artist)=#9 / clever-guardian=(trickster,guardian)=#13 | 実コード註で確認 ✓            |

**矛盾・不明**: 発見されなかった。唯一の表記差は §3 に記した通り、`character-personality.ts` 冒頭コメントの「commander primary (5 types)」が**異型5のみ**を数え同型 ultimate-commander を別掲している点(実数は同型込みで6)。これは矛盾ではなく分類の粒度差であり、本文書は同型・逆順を含む実数を採用した。

---

## A3 feasibility(go/no-go の事前検算)

**結論: NO-GO。** N=12・4択(および N=16/20/24/30 まで拡張しても)、A2 制約下で **G4a・G4b・G4c・G5 を同時に満たす配点設計・閾値 TH は存在しない**。存在証明は得られず、代わりに**「4ゲートが相反する TH レジームに分裂し窓が交わらない」という構造的不能**を実測で確定した。不能の根が「同型6タイプの機構 × 対称な一様測度 M」の過剰適合にあるため、**B の重い設問再設計に着手せず、同型6構造の再考(下記選択肢)を先に判断すべき**。

### 検証方法(自己完結・再現手順)

- **測度 M・判定規則は index.md 受け入れ基準の凍結定義をそのまま実装**(cycle-295 で凍結。数値を見てから物差しを動かしていない)。
  - a∈R^6 を各成分 iid Uniform(0,1) で S 標本。各選択肢 signal = その配点ベクトルそのもの(正規化なし)。確率 c で argmax(signal·a)(選択肢同点は seeded 一様)、確率 1−c で一様ランダム。**c∈{1.0, 0.85, 0.0(一様)}**。
  - 集計6得点→1位=主軸/2位=副軸→**主副 gap ≥ TH なら同型(主×主)、未満なら主×副**→§2写像(順序対が無ければ逆順)→typeId。
- **同点処理に配列順バイアスを入れない**: 得点1位/2位に整数同点があるとき、**回答由来規準(得点・主副・gap・逆順フォールバック)を尽くしてなお最終 typeId 候補が2以上残る回答**を G5 の「恣意決着」単位として数える(候補集合サイズ≥2)。ヒストグラム用の1点選択のみ seeded 一様抽選(配列順に依存しない)。逆順フォールバックで主副入替が同一 typeId に落ちる同点は候補集合サイズ1=非恣意として正しく除外している。
- **決定的シード** `seed=20250723`。標本数 **S=探索60,000 / 検証300,000〜400,000**(silent cap なし・全出力に S を明記)。
- **探索件数(実数)**:
  - パラメトリック掃引(構造化 blend 設計): N∈{12,16,20} × (hi,lo)∈{(4,2),(3,3),(5,1),(3,2),(4,1),(2,2)} × TH全域 = **1,134 (設計,TH) 点**を評価。
  - 窓検定 W2: N∈{12,16,20,24,30} × (hi,lo)∈{(5,1),(4,2),(4,1),(3,2)} で各 TH全域を掃引し「c=1 で異型≥1% かつ 一様で同型≥0.2%」を検定 = **20 設計**、いずれも不成立。
  - 自由設計の局所探索(A2準拠=各選択肢は sum=6・厳密単峰=明確な主signal を持つ任意整数6ベクトル): N=12 と N=16 で各 **8 リスタート × 40 反復 = 320 変異評価/N**(hill-climb)。**到達上限は 2/4 ゲート**(4/4 は一度も出現せず)。
  - コード(`./tmp/c295_*.py`)は消えてよいが上記の手法・件数・シードで再現可能。

### 提示した最良の合成配点設計(存在証明の候補=A2 準拠・全量)

4ゲート中 {G4a, G4b} を通す最良点。**A2(a) 各選択肢は1アーキタイプを主signal(主=5点)**・**A2(d) 全選択肢の総配点=6 で均一**(現行データの不変量と一致)。

- **配点テンプレート**: 各選択肢 = 主アーキタイプに5点 + 副アーキタイプに1点(sum=6)。例 Q1選択肢: `dreamer5+trickster1`, `trickster5+guardian1`, `guardian5+artist1`, `artist5+dreamer1`。
- **出題構造**: 12問 = K6 から完全マッチング {commander–trickster, professor–guardian, dreamer–artist} を除いた12の「除外ペア」。各問は除外2アーキタイプを除く4つを4択の主signalに割当て、副signalは同問の次アーキタイプへ巡回付与(各アーキタイプが主8回・副8回で均衡)。全12問(主+副):

  | Q   | 選択肢1   | 選択肢2   | 選択肢3   | 選択肢4   |
  | --- | --------- | --------- | --------- | --------- |
  | 1   | drea+tric | tric+guar | guar+arti | arti+drea |
  | 2   | prof+tric | tric+guar | guar+arti | arti+prof |
  | 3   | prof+drea | drea+tric | tric+arti | arti+prof |
  | 4   | prof+drea | drea+tric | tric+guar | guar+prof |
  | 5   | comm+tric | tric+guar | guar+arti | arti+comm |
  | 6   | comm+drea | drea+guar | guar+arti | arti+comm |
  | 7   | comm+drea | drea+tric | tric+guar | guar+comm |
  | 8   | comm+prof | prof+guar | guar+arti | arti+comm |
  | 9   | comm+prof | prof+tric | tric+arti | arti+comm |
  | 10  | comm+prof | prof+drea | drea+arti | arti+comm |
  | 11  | comm+prof | prof+drea | drea+guar | guar+comm |
  | 12  | comm+prof | prof+drea | drea+tric | tric+comm |

- この設計は**存在証明にはならない**(4ゲート同時充足に至らない)。以下の窓検定が示す通り、いかなる TH でも全ゲートは通らない。

### 各ゲートの実測値(構造化設計・S=400,000・TH窓の非交差)

**TH レジームの分裂(決定的所見)**:

| ゲート                                     | 満たす TH 範囲          | binding な測度・タイプ                                                                                                                                 |
| ------------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **G4a**(c=1.0 と c=0.85 で全24タイプ≥1.0%) | **TH ≥ 20**             | c=1.0 の異型フロア。binding は creative-disruptor/guardian-charger/vibe-rebel/blazing-warden(=**逆順対を持つ単一順序対タイプ**=type-slot 非対称の産物) |
| **G4b**(c=0.85 で最大/最小比≤10×)          | TH ≥ 14(TH≥20 で比3.66) | —                                                                                                                                                      |
| **G4c**(一様で全24タイプ≥0.2%)             | **TH ≤ 17**             | 一様の**同型6タイプ**(0.066〜0.071%)                                                                                                                   |
| **G5**(最悪 c で恣意率≤5%)                 | **TH ≤ 2**              | 一様の恣意率(≈14%)                                                                                                                                     |

- **窓が交わらない**: G4a は TH≥20 を要求、G4c は TH≤17、G5 は TH≤2。**共通解なし**(実測確定)。
- **G4a 動作点 TH=20 の24タイプ実測(S=400,000)**:
  - c=1.0: min **1.076%**(creative-disruptor) / max **10.314%**(同型) / 比 9.59 / 被覆 **24/24** / 恣意 **0.88%** → G4a○ G4b○
  - c=0.85: min **1.677%**(blazing-warden) / max 6.133% / 比 **3.66** / 被覆24/24 / 恣意 1.53%
  - c=0.0(一様): 同型6タイプ **0.066〜0.071%**(G4c フロア0.2%を**約3倍下回る**)/ 恣意 **14.04%**(G5 上限5%を**約2.8倍超過**)→ **G4c✗ G5✗**
- **G1(到達性)は○**: TH を掃引した和で **24/24 が c=1.0 で到達可能**。機構は全タイプに届く——**不成立は「量的フロアの同時充足」であって到達性そのものではない**。

### 不能の構造的理由(なぜ N を増やしても届かないか)

同型判定は「主副 gap ≥ TH」=**1アーキタイプが突出する事象**。ここに3つの凍結ゲートが相反する要求を課す:

1. **G1 が同型に大きな gap を要求**: 純アーキタイプ本人(a が1成分に集中)が同型に届くには、同型領域が最大 gap 側を含む必要 → TH は c=1.0 gap 分布の内部に置かざるを得ない。
2. **c=1.0 は集中 → 大 gap → 同型過多**。type-slot 非対称が生む**単一順序対の異型6タイプ**(guardian-charger 等)を ≥1%(G4a)に保つには、同型が食い尽くさないよう **TH を高く**する必要(実測 TH≥20)。
3. **一様 c=0 は対称・ランダム → 小 gap → P(gap≥TH) が希少**。G4c は一様でも同型6が各≥0.2%(=P(gap≥TH)≳1.2%)を要求 → **TH を低く**する必要(実測 TH≤17)。**2 と 3 が矛盾**。
4. **G5 が追い打ち**: G4a を満たす高 TH では一様回答者の大半が異型判定になり、異型は2位アーキタイプの厳密同点に敏感 → 一様の恣意率 ≈14%。TH を下げ全員同型にすれば恣意は≈2.5%に落ちるが今度は G4a が崩れる。**G5 と G4a も相反する TH を要求**。
5. **N を増やすと悪化する(改善しない)**: c=1.0 の集中は N とともに鋭くなり(gap 拡大)G4a に必要な TH が上がる一方、一様 gap 分布は自スケールに対し拡散のまま → 一様同型が**さらに速く**消える。実測で N=20/24/30 は W2 をより大きなマージンで不成立。**「玄関で設問を伸ばせば届く」問題ではない**——index.md A3 のルーブリック通り、これは**24タイプ/6同型構造の(対称一様測度に対する)過剰適合の兆候**であり、**同型6構造の再考へ倒すべき**シグナル。

### go/no-go の判断材料(B 着手前の分岐)

- **NO-GO(N=12・現行の6同型×主副×gap機構のまま)**。設問数拡張でも不成立(悪化)。
- binding は **(a) G4c/G5=一様測度での同型6タイプと恣意率**、**(b) G4a=type-slot 非対称が生む単一順序対の異型6タイプ**。
- **B 着手前に検討すべき代替(同型6構造の再考)**:
  1. **一様フロア(G4c)を同型に課さない/別基準にする**——同型は本来「強い一貫性」の産物で、ランダム回答者に≥0.2%を求めるのは機構と矛盾。受け入れ基準の再交渉(オーナー判断)。
  2. **同型を gap 閾値でなく別経路で判定**(例: 主軸得点の絶対水準・特定設問群の一致率)——「gap≥TH」を捨てれば G1↔G4c↔G5 の TH 三すくみが解ける可能性。
  3. **24タイプ=6同型+18異型 の構成比を見直す**(同型を減らす/主副対称化して type-slot 非対称を解消)。ただし typeId・title は資産(不変制約)ゆえ写像の作り替えに留める。
  4. G5 の一様恣意率は整数同点由来——判定粒度(総配点 T の増大では不変=同点は等号なのでスケール不変)ではなく**設問間の非対称配点で同点確率自体を下げる**設計余地はあるが、実測では G4 との両立に至らず。

**移送性の注記**: 提示設計は A2(a)(d) を満たす実装可能な形だが4ゲートを通らないので、この spike からは **B へ移送すべき「go の設計」は存在しない**。次アクションは B ではなく、上記代替の可否をオーナー/PM が判断すること。

---

## 候補A 検証(A3′ 独立検証 + gap非依存の同型判定)

**A3 の NO-GO を前任コード(`tmp/c295_*.py`)を一切参照せずゼロから独立再実装して検証し、続けて候補A(gap非依存の同型判定)が凍結全ゲートを同時充足しうるかを反証可能に探索した記録。** 結論を先に:**(1) A3独立検証は前任数値と一致(=バグではない)**、**(2) 候補Aでも全ゲート同時充足設計は存在しない(binding=G4c⟷G4a)。ただし G5 は反同点配点で解けることを新たに実証(前任が impossibility に括った G5 は設計で解ける問題)**、**(3) 残る障害は「一様測度の同型フロア G4c と現実的測度の異型フロア G4a」の相反=機構非依存の原理的障害=設計でなく基準/測度の問題**。

### 手法・再現情報(自己完結)

- **独立実装**: `tmp/c295b_core.py`(測度M・24写像・判定・恣意判定)/`c295b_repro.py`(A3再現)/`c295b_candA.py`(候補A機構)/`c295b_tradeoff.py`(G4a⟷G4cトレードオフ)/`c295b_robust.py`(頑健性)。numpy ベクトル化。**決定的シード base=20250723**(cごと・機構ごとにオフセット加算)。標本 **S=200,000〜400,000**(全出力にS明記・silent cap なし)。
- **測度M(index.md 受け入れ基準の凍結定義に忠実)**: a∈R^6 iid Uniform(0,1)。各選択肢 signal=生配点ベクトル。確率 c で argmax(signal·a)、確率1−c で一様。c∈{1.0, 0.85, 0.0}。
- **恣意判定(G5)**: 得点ベクトルの整数同点で最終 typeId 候補集合サイズ≥2 の割合。iso(gap/水準充足で主軸一意)は非恣意。異型で1位同点(tied-max 部分集合→逆順フォールバックで畳めるか事前計算 `SUBSET_ARB`)・2位同点は候補≥2=恣意。
- **探索件数(実数・(設計,パラメータ)点)**: A3再現=TH 0〜30 の **32点**。候補A本探索=5配点スキーム×2機構(abs/count)×閾値掃引= **216点**。トレードオフ=count 8 + abs 11 = **19点**。頑健性=4設計×count 5P + N=12/24 掃引= **43点**。**合計 約310点**、各点で c∈{1.0,0.85,0.0} の3測度を評価。**候補Aで全ゲート(G4a∧G4b∧G4c∧G5)同時充足した点=0件**。

### (1) A3 独立検証の結果 — **前任と一致(バグではない)**

TH=20 構造化設計(各選択肢=主5+副1・sum=6・12問で各アーキタイプ主8/副8均衡)、S=400,000:

| 測度                   | 独立再実装(本タスク)         | 前任 A3 記載値             | 判定                                                |
| ---------------------- | ---------------------------- | -------------------------- | --------------------------------------------------- |
| c=1.0 min              | **1.083%**(guardian-charger) | 1.076%(creative-disruptor) | 一致(min≈1.08%・binding は逆順対の単一順序対タイプ) |
| c=1.0 max / 比         | 10.305% / **9.51**           | 10.314% / 9.59             | 一致                                                |
| c=1.0 恣意率           | **0.90%**                    | 0.88%                      | 一致                                                |
| c=0.85 min / 比 / 恣意 | 1.671% / **3.66** / 1.52%    | 1.677% / 3.66 / 1.53%      | 一致                                                |
| 一様 同型6タイプ       | **0.066〜0.071%**            | 0.066〜0.071%              | **完全一致**                                        |
| 一様 恣意率            | **14.04%**                   | 14.04%                     | **完全一致**                                        |

TH窓の非交差も再現: **G4a は TH≥20 / G4b は TH≥14 / G4c は TH≤17 / G5 は TH≤2** で共通解なし(独立掃引で確定)。→ **A3 の NO-GO は前任のバグではなく、gap≥TH 機構の構造的性質**。

### (2) 候補A: gap非依存の同型判定 — **全ゲート同時充足せず。ただし G5 は解けた**

同型 X×X を gap≥TH でなく別 signal で判定する案を実装・評価:

- **案a(主軸絶対得点 ≥ L で同型)= 案b(主軸/総得点 ≥ r で同型)**: 総配点は 12×T 固定(A2(d))なので **案a と案b は数学的に同一**(r·12T = L)。実装は abs 機構1本に集約。
- **案c(主signalが同一アーキタイプの設問数 ≥ k で同型)**: 各選択肢の主signal(hi点側)の被選択回数を集計し最大が k 以上で同型。
- **反同点配点(G5対策)**: A2(a)(d) を保ったまま(各選択肢1主signal・総配点 T 均一)、**問ごとに hi を分散**(例 T=30 で hi∈{29,26,23,20,17,…})させ整数同点確率を下げた設計を併用。T12/T20/T30/T30b の4種。

**主要な新発見 — G5 は反同点配点で解ける**: gap機構では一様恣意率が TH に依らず ≈14%(TH≤2 でしか G5 を満たせず G4a と両立不能)だったが、**count/abs 機構 × 高解像反同点配点では一様恣意率が ≈3%(全 P で ≤5%)に低下し G5 を常に満たす**。**前任が impossibility の binding に括った G5 は、実は「整数同点の設計問題」であって反同点配点で解消できる**(前任 §A3 の binding(a) のうち「G5=恣意率」の部分は撤回されるべき)。

**しかし G4c⟷G4a が残り両立不能**(count機構・T=30 高解像・S=300,000、P=同型判定閾値):

| P(count) | c=1.0 同型総% | c=1.0 異型min | 一様 同型min | 一様 異型min | 一様恣意 | G4a   | G4b | G4c | G5  |
| -------- | ------------- | ------------- | ------------ | ------------ | -------- | ----- | --- | --- | --- |
| 5        | 98.97%        | **0.003%**    | 2.694%       | 2.375%       | 2.94%    | ✗     | ✗   | ○   | ○   |
| 6        | 91.11%        | **0.123%**    | 0.403%       | 2.693%       | 2.98%    | ✗     | ✗   | ○   | ○   |
| 7        | 69.46%        | 0.650%        | **0.033%**   | 2.738%       | 3.09%    | ✗     | ○   | ✗   | ○   |
| 8        | 40.98%        | 1.396%        | **0.001%**   | 2.754%       | 3.09%    | **○** | ○   | ✗   | ○   |

- **P を緩める(小)と** 一様で同型が立つ(G4c○)が、c=1.0 でも同型が 91〜99% に膨れ **18異型が枯れる**(異型min 0.003〜0.12% ≪ 1%=G4a✗)。
- **P を締める(大)と** G4a○(異型min 1.4%)だが、一様同型が 0.001%(G4c✗・フロア0.2%を**200倍下回る**)。
- **中間 P は存在しない**: P=6→8 の間で G4a と G4c は入れ替わり、両立窓は開かない。abs 機構も同様(P=135 で G4c○/G4a✗、以降 G4a を満たす P は一様同型 0% で G4c✗)。

**頑健性(悉皆確認・両立0件)**: 4配点設計(T12/T20/T30/T30b)× count P=4〜8 で **G4a∧G4c を満たす点は0**。決定要因は比 **R = P_iso(c=1)/P_iso(uniform)**:P を締めるにつれ **R = 1.6× → 6× → 35× → 305× → 4800×** と発散し、一様で同型を立てる緩さ(R小)では c=1.0 の同型が過多、c=1.0 で異型を残す締め(R大)では一様同型が消える。**N拡張(12→24)は壁を狭めず広げる**(N=24 で P=9: 一様同型0.71%/c1異型min 0.004%、P=15: G4a○/一様同型0%)——集中が N で鋭くなり R がさらに増大(前任「N増で悪化」を独立に再現)。

### (3) 決定的な問い — **設計でなく一様測度ゲートが原理的障害**

**問い**: 一様で同型6各≥0.2%(G4c)かつ一様恣意率≤5%(G5)を、現実的測度の G4a(異型≥1%)と両立させることは、同型判定の機構を問わず原理的に不能か。

**答え(数値の根拠つき)**:

1. **G5(一様恣意率≤5%)は機構でなく配点解像度の問題で、解ける**——反同点配点で 14%→3% に落ち全 P で充足(上表)。よって G5 を impossibility に含めるのは誤り。**この部分は「設計で解ける問題」**。

2. **G4c⟷G4a は機構非依存で両立不能=一様測度ゲートそのものが障害**。核心の直観「同型=1アーキタイプの突出=一様ランダムでは希少」は**どの同型判定機構でも成り立つ**。一般性の論拠:
   - 同型集合 I(=「同型」と判定する回答領域)は、**G1(純アーキタイプ本人=a が1成分集中 の回答者は同型に届く)と同型タイプの意味(「あなたの◯◯が極限まで強まると」)により、突出度について単調(dominance set)**でなければならない。非単調な I(突出していない回答を同型と呼ぶ)は G1 と意味論を壊す。
   - 単調な I が**対称な一様測度で質量 ≥1.2%(=6同型×0.2%)を捕える**なら、集中した c=1.0 測度では同じ I が **R=35〜4800倍**の質量を捕える(実測)。つまり P(I|c=1) が 40〜99% に達し、**18異型に残る質量が G4a の下限(各≥1%=計≥18%、さらに type-slot 非対称の単一順序対タイプはより希少)を割る**。
   - R は測度対 (一様, c=1.0) と設計解像度で決まり、**解像度を上げる(N・T)ほど増大**する。ゆえに機構(gap/abs/count/その他の単調判定)をどう選んでも、G4c を満たす緩さと G4a を満たす締めは同一閾値軸上で**逆向き**に要求し、窓が開かない。

3. **結論**: これは **「設計(同型判定機構)で解ける問題」ではなく「一様測度に同型フロア G4c を課すこと自体が G4a と原理的に相反する=基準/測度の問題」**。同型は定義上「強い一貫性の産物」であり、**6アーキタイプ対称・タイプ事前分布なしの一様測度**(index.md で凍結)に対して同型≥0.2% を課すのは、機構の巧拙で回避できない矛盾。→ 候補A は **NO-GO**。次は候補B(G4c=一様同型フロアの妥当性を独立審査で問い直す)または候補C(6同型構成比の見直し)。**機構の追加探索(候補A)は打ち切ってよい**。

**go/no-go**: 候補A=**NO-GO**(全ゲート同時充足0件/約310点探索)。ただし副産物として **G5 は反同点配点で解決可能**と判明(binding から G5 を外せる)。残る binding は **G4c(一様同型フロア)⟷G4a(現実的測度の異型フロア)** の一点。**これは設計で閉じない=基準の問題**。移送すべき「go の設計」はやはり存在しない。
