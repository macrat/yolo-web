# cycle-294 調査結果: 性格診断の同点タイブレーク実害計測

本サイクルの一次計測は使い捨ての分析スクリプトで行った(下記「方法」に手順を自己完結で記載)。
到達不能タイプの有無は恒久ガード `src/play/quiz/__tests__/reachability.test.ts` として常時再現・回帰検出できる。
実判定経路は `src/play/quiz/_components/QuizContainer.tsx:198-201` と同一(science-thinking のみ独自判定 `determineScienceThinkingResult`、他11診断は汎用 `determineResult`)。

## 方法

各 personality 診断の全回答パターン(各設問で選んだ選択肢の直積)を、実判定経路と同じ関数
(`determineResult`、science-thinking のみ `determineScienceThinkingResult`)に通して測定した。

- 組合せ数 ≤ 500,000 の診断は**全列挙**(悉皆=厳密)。
- 超える診断は**決定的サンプリング 500,000**(固定シード mulberry32。Math.random を使わないため再実行で同値。結果に mode を明記=silent cap 禁止)。**標本行の数値は推定値**(悉皆でない)。
- 指標:
  - **勝者分布**(各タイプの勝ち数)
  - **同点率**(top score を2タイプ以上が共有した組合せの割合)
  - **真の到達不能**(一度も top に絡めないタイプ)/ **tie-loser**(公平なら勝ちうるのに配列順で恒常敗退するタイプ)
  - **配列順による最大分布歪み**(現行シェア − 同点を等分した公平シェア の最大絶対差[%pt]。配列順タイブレークだけが生む偏りを、配点構造由来の偏りから分離する指標)

## 結果一覧

| 診断                     | 判定    | タイプ数 | 組合せ     | mode     | 同点率 | 到達不能 | 最大歪み(%pt) | 歪む先                   |
| ------------------------ | ------- | -------- | ---------- | -------- | ------ | -------- | ------------- | ------------------------ |
| traditional-color        | 汎用    | 8        | 65,536     | 全列挙   | 27.5%  | なし     | 3.77          | ai(先頭)                 |
| yoji-personality         | 汎用    | 8        | 65,536     | 全列挙   | 26.1%  | なし     | 4.35          | shoshikantetsu(先頭)     |
| impossible-advice        | 汎用    | 7        | 16,384     | 全列挙   | 25.6%  | なし     | 4.32          | timemagician(先頭)       |
| contrarian-fortune       | 汎用    | 8        | 65,536     | 全列挙   | 26.6%  | なし     | 4.56          | reverseoptimist(先頭)    |
| unexpected-compatibility | 汎用    | 8        | 65,536     | 全列挙   | 26.1%  | なし     | 4.90          | vendingmachine(先頭)     |
| music-personality        | 汎用    | 8        | 1,048,576  | 標本50万 | 24.0%  | なし     | 3.87          | festival-pioneer(先頭)   |
| character-fortune        | 汎用    | 6        | 65,536     | 全列挙   | 22.6%  | なし     | 4.59          | commander(先頭)          |
| animal-personality       | 汎用    | 12       | 1,048,576  | 標本50万 | 31.5%  | なし     | 3.83          | nihon-zaru(先頭)         |
| science-thinking         | 独自5軸 | 10       | 1.1e12     | 標本50万 | 0%     | なし     | 0(軸ベース)   | —                        |
| japanese-culture         | 汎用    | 7        | 6.9e10     | 標本50万 | 17.4%  | なし     | 3.46          | sado(先頭)               |
| character-personality    | 汎用    | 24       | 16,777,216 | 標本50万 | 36.2%  | なし     | 2.14          | blazing-strategist(先頭) |
| word-sense-personality   | 汎用    | 8        | 1,048,576  | 標本50万 | 27.8%  | なし     | 6.08          | elegant-precise(先頭)    |

> **mode 列について**: この列は同点率・分布歪みを測る一次計測(使い捨てスクリプト)の列挙規模(悉皆 or 50万標本)を指す。上限500,000のため 1,048,576 の3診断(music/animal/word-sense)は「標本50万」。一方、恒久ガード `reachability.test.ts` は上限110万(`EXHAUSTIVE_CAP=1,100,000`)で同3診断を**悉皆**確認する(別ツール・別境界)。よって「到達不能」列の厳密さは reachability.test.ts が担保し、本表の mode とは独立。

## 判明した事実

1. **到達不能タイプは全12診断で検出されなかった。** B-589が懸念した「配列順タイブレークで永久に選ばれないタイプ」は無い。どのタイプも多数の非同点組合せで単独勝ちしている。tie-loser も無い。
   - 確度の区別: 組合せ ≤ 110万(実装 `EXHAUSTIVE_CAP=1,100,000`)の診断(小規模6本 + music/animal/word-sense=各1,048,576)は**悉皆列挙で厳密確認**。character-personality(1670万)・japanese-culture(690億)・science-thinking(1.1兆)は**50万標本で未検出**(悉皆不可のため厳密証明ではなく高確度)。現状の最小勝者 academic-artist でも 0.52%(=50万標本で期待約2600ヒット)なので、恒常敗退の見落としリスクは実務上無視できる。
2. **science-thinking は正常。** 独自の5軸判定(`determineScienceThinkingResult`。最上位軸×2位軸の組で決定、タイブレークはアルファベット順)により同点率0%・10タイプ全到達。
   - **重要な偽陽性の記録**: 当初 harness が全診断に汎用 `determineResult` を適用したところ、science-thinking は「全回答で einstein 固定」と出た。これは science-thinking の points キーが**軸(theory等)**で result id(einstein等)ではないため `points[result.id]` が全て0→全同点→配列先頭 einstein になる harness の誤りだった。実判定経路(`QuizContainer.tsx`)を確認し `determineScienceThinkingResult` に差し替えて是正。**計測harnessは「サイトが実際に通る判定関数」を呼ばねば無意味**という教訓(anti-pattern候補)。
3. **汎用11診断の配列順タイブレークは、集計上、配列先頭タイプに +2.1〜6.1%pt のシェアを与える**(最悪 word-sense-personality の elegant-precise=6.08pt)。ただし**個々の来訪者は常に「同点=等しくトップの一つ」を受け取る**=個別の実害なし。判定は決定的で、同じ回答→同じ結果(シェア/再受験の再現性が保たれる)。

## 判断: 判定ロジックは変更しない(是正不要)+ 恒久ガードを追加

- **来訪者への実害がない**: 同点になる2タイプはスコアが等しく、どちらも妥当なトップ。配列順で先頭を選んでも、来訪者は正しいトップタイプの一つを受け取る。
- **集計上の偏りは来訪者に不可視**で、個々の体験を損なわない。ここで answer-hash 等の不透明なタイブレークを導入するのは、見えない集計均一化のために可読性・検証容易性を犠牲にする過剰一般化(constitution: 一般化より個別具体・雑な道具を渡さない)。来訪者価値を増やさない。
- **ランダム化は却下**: 再現性(同じ回答→同じ結果=シェア/再受験)を壊し、UXを悪化させる。
- **本当の将来リスクは別にある**: データ編集で「配点源のない孤児タイプ」や「恒常敗退タイプ」が生まれること(2. の偽陽性が示した種類の事故)。これを恒久的に防ぐ**回帰ガード(テスト)**を追加する。これが来訪者の診断の健全性を将来にわたり守る最も価値ある成果物。

### 追加した恒久ガード(`src/play/quiz/__tests__/reachability.test.ts`)

- **孤児タイプゼロ(全汎用personality診断)**: 各 result id に正の配点を与える choice が最低1つ存在する(必要条件)。→「タイプを足したが配点を繋ぎ忘れた」事故を検出。
- **全タイプ到達 — 悉皆(組合せ ≤ 110万=実装 `EXHAUSTIVE_CAP`)**: 小規模6本 + music/animal/word-sense(各1,048,576)を全列挙し、全タイプが実際に勝てることを厳密確認(恒常敗退も検出。決定的・非flaky)。
- **全タイプ到達 — 決定的サンプリング(組合せ > 110万)**: character-personality(1670万)・japanese-culture(690億)を固定シード mulberry32 で50万標本抽出し到達性を確認(悉皆不可のため高確度検出。厳密証明ではない)。**玄関 character-personality もこの層でガードされる。**
- **science-thinking の専用到達性ガード**: 独自判定は手書きの `AXIS_PAIR_TO_TYPE`(10タイプに10エントリ)/`FALLBACK_MAP` に依存し「タイプを足したがマッピングを繋ぎ忘れて到達不能」事故に汎用診断以上に脆弱。実判定 `determineScienceThinkingResult` で決定的サンプリングし10タイプ全到達を確認する専用テストを設けた(汎用の孤児/悉皆チェックは points が軸ベースのため非該当)。
- テスト実行時間: 単体で約33秒(重いケースは per-test timeout 60秒。全体suiteは並列のため影響軽微)。

## 一次計測の再現(方法の要約)

到達不能タイプの有無は恒久ガード `src/play/quiz/__tests__/reachability.test.ts` で常時再現できる(悉皆＋決定的サンプリング)。同点率・分布歪みの一次計測は使い捨てスクリプトで実施したもので、アルゴリズムは上記「方法」に自己完結で記述している(registry から `meta.type === "personality"` を抽出し、`QuizContainer.tsx:198-201` と同じ分岐で各回答パターンの勝者・同点・公平シェア差を集計。標本行は固定シード mulberry32・50万標本の推定値)。同型の再実装で同じ結論(到達不能ゼロ)が得られる。
