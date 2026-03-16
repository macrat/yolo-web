---
task: cycle-98 タスク2
description: Q10キャラクター性格診断 — 質問・スコアリング設計書
created_at: "2026-03-17"
updated_at: "2026-03-17"
---

# Q10 キャラクター性格診断 — 質問・スコアリング設計書

## 0. 設計前提

### キャラクターIDと4軸ベクトル（タスク1より）

| #   | ID                   | 主        | 副        | A(Action) | S(Social) | P(Percep) | E(Energy) |
| --- | -------------------- | --------- | --------- | --------- | --------- | --------- | --------- |
| 1   | blazing-strategist   | commander | professor | +1        | +1        | +1        | +1        |
| 2   | blazing-poet         | commander | dreamer   | +1        | +1        | -1        | +1        |
| 3   | blazing-schemer      | commander | trickster | +2        | +1        | 0         | +2        |
| 4   | blazing-warden       | commander | guardian  | +1        | +2        | 0         | +1        |
| 5   | blazing-canvas       | commander | artist    | +1        | +1        | 0         | +2        |
| 6   | dreaming-scholar     | professor | dreamer   | -1        | -1        | +1        | -1        |
| 7   | contrarian-professor | professor | trickster | 0         | 0         | +2        | 0         |
| 8   | careful-scholar      | professor | guardian  | -1        | 0         | +1        | -1        |
| 9   | academic-artist      | professor | artist    | -1        | 0         | +1        | 0         |
| 10  | star-chaser          | dreamer   | trickster | 0         | -1        | -1        | 0         |
| 11  | tender-dreamer       | dreamer   | guardian  | -1        | -1        | -1        | -1        |
| 12  | dreaming-canvas      | dreamer   | artist    | -1        | -2        | -2        | 0         |
| 13  | clever-guardian      | trickster | guardian  | 0         | 0         | +1        | 0         |
| 14  | creative-disruptor   | trickster | artist    | +1        | 0         | 0         | +1        |
| 15  | gentle-fortress      | guardian  | artist    | -1        | 0         | 0         | -1        |
| 16  | ultimate-commander   | commander | commander | +2        | +2        | 0         | +2        |
| 17  | endless-researcher   | professor | professor | -1        | 0         | +2        | -1        |
| 18  | eternal-dreamer      | dreamer   | dreamer   | -1        | -2        | -2        | 0         |
| 19  | ultimate-trickster   | trickster | trickster | +1        | 0         | +1        | +1        |
| 20  | ultimate-guardian    | guardian  | guardian  | -2        | +1        | 0         | -2        |
| 21  | ultimate-artist      | artist    | artist    | 0         | -1        | -1        | +1        |
| 22  | data-fortress        | guardian  | professor | -2        | +1        | +1        | -2        |
| 23  | vibe-rebel           | artist    | trickster | 0         | -1        | 0         | +1        |
| 24  | guardian-charger     | guardian  | commander | -1        | +1        | 0         | -1        |

### #12と#18のベクトル重複について

#12(dreaming-canvas)と#18(eternal-dreamer)は4軸ベクトルが同一(-1,-2,-2,0)。方式Bの直接ポイント方式を使用するため、スコアリング上は各IDへ直接配分する。配点設計では以下の性格の違いを意識的に反映する:

- **#12 dreaming-canvas（dreamer×artist）**: 感性と映像的妄想の重ね塗り。視覚・感性的イメージが中心。Q9-b（感覚的記憶）にprimary。
- **#18 eternal-dreamer（dreamer×dreamer）**: 妄想の目的化・行動不全。先延ばし・脱行動型。Q12-b（ぼんやりした未来像）にprimary。

---

## 1. 質問一覧（12問4択）

### Q25との重複チェック

Q25使用済みシチュエーション（使用禁止）:
タイムスリップ（戦国時代）、宇宙人との遭遇、魔法で動物になる、文化祭の出し物会議、100万円が降ってくる、RPG転生、友人の借金相談、世界の終わりの過ごし方

---

### Q1: 朝の目覚め方

**主測定軸**: Action（active vs reflective）
**副測定軸**: Energy（burst vs steady）

**質問文**: 休日の朝8時、アラームなしで目覚めた。あなたがまず取る行動は?

| 選択肢 | テキスト                                                                      | 測定方向 |
| ------ | ----------------------------------------------------------------------------- | -------- |
| Q1-a   | 「よし今日も動くか!」とベッドから飛び起きて、そのまま外に出る計画を立て始める | A+ E+    |
| Q1-b   | スマホを手に取り、気になってたことをとりあえず調べ始める                      | A+ P+    |
| Q1-c   | もう少しだけ...と布団にくるまって、頭の中で今日やりたいことを想像する         | A-       |
| Q1-d   | 「今日は何もしなくていい日だ」とじわじわ確認してから、ゆっくり体を起こす      | A- E-    |

---

### Q2: 買い物の判断

**主測定軸**: Action（active vs reflective）
**副測定軸**: Perception（logical vs sensory）

**質問文**: ネットで気になるアイテムを見つけた。購入ボタンの前でどうする?

| 選択肢 | テキスト                                                         | 測定方向 |
| ------ | ---------------------------------------------------------------- | -------- |
| Q2-a   | 「欲しい!」と感じたらもうポチっている。後で理由を考える          | A+ P-    |
| Q2-b   | レビューと比較サイトを見て、スプレッドシートに整理してから決める | A- P+    |
| Q2-c   | 値段と機能を5分で確認して「まあいけるでしょ」と購入する          | A+ P+    |
| Q2-d   | 「本当に必要?」と自問して、1日置いて翌日また考える               | A- P+    |

---

### Q3: 集団での立ち位置

**主測定軸**: Social（outward vs inward）
**副測定軸**: Action（active vs reflective）

**質問文**: 初めて参加するグループイベント。あなたの動き方は?

| 選択肢 | テキスト                                                 | 測定方向 |
| ------ | -------------------------------------------------------- | -------- |
| Q3-a   | まず全員に話しかけて、場の空気を把握しようとする         | S+ A+    |
| Q3-b   | 隅っこで様子を観察してから、気が合いそうな人に声をかける | S- A-    |
| Q3-c   | 仲いい人の隣をキープして、その人越しに輪を広げる         | S+ A-    |
| Q3-d   | 一人でいても全然平気。むしろ観察が楽しい                 | S- A中   |

---

### Q4: 問題解決のスタイル

**主測定軸**: Perception（logical vs sensory）
**副測定軸**: Action（active vs reflective）

**質問文**: 仕事/学校でトラブルが発生した。まず何をする?

| 選択肢 | テキスト                                                 | 測定方向 |
| ------ | -------------------------------------------------------- | -------- |
| Q4-a   | 原因を構造的に整理してから、解決策を順番に考える         | P+ A-    |
| Q4-b   | 「とにかく動きながら考えよう」と行動を始める             | P- A+    |
| Q4-c   | 「なんかこっちじゃない気がする」という直感で方向を決める | P- A中   |
| Q4-d   | 思いつく限り手を打って、うまくいった道を広げる           | P- E+    |

---

### Q5: エネルギーの使い方

**主測定軸**: Energy（burst vs steady）
**副測定軸**: Action（active vs reflective）

**質問文**: 1週間の締切がある大きな課題。あなたの取り組み方は?

| 選択肢 | テキスト                                              | 測定方向 |
| ------ | ----------------------------------------------------- | -------- |
| Q5-a   | 最後の2日間で全力を出す。それまでは頭の中で熟成させる | E+ A-    |
| Q5-b   | 毎日少しずつコツコツ進める。急ぎすぎると質が落ちる    | E- A中   |
| Q5-c   | 最初の3日で一気に片付けて、残りは余裕を楽しむ         | E+ A+    |
| Q5-d   | 計画表を作って、均等なペースで進める                  | E- A-    |

---

### Q6: 感情の処理

**主測定軸**: Social（outward vs inward）
**副測定軸**: Action / Perception（選択肢により異なる）

**質問文**: 嬉しいことがあった! あなたの最初のリアクションは?

| 選択肢 | テキスト                                                 | 測定方向 |
| ------ | -------------------------------------------------------- | -------- |
| Q6-a   | すぐ誰かに話したい。LINEかけるか直接会いに行く           | S+ A+    |
| Q6-b   | 一人でじっくり噛みしめる。この感情、大切にしたい         | S- P-    |
| Q6-c   | 「なぜ嬉しいのか」を分析しながら日記に書く               | S- P+    |
| Q6-d   | 家族や近くにいる人にだけ伝える。広めたいわけじゃないけど | S+ A中   |

---

### Q7: 創造的な作業

**主測定軸**: Perception（logical vs sensory）
**副測定軸**: Energy（burst vs steady）

**質問文**: 自由に何かを作っていい時間が3時間ある。あなたのアプローチは?

| 選択肢 | テキスト                                             | 測定方向 |
| ------ | ---------------------------------------------------- | -------- |
| Q7-a   | まず構成や設計図を考えてから、手を動かす             | P+ E-    |
| Q7-b   | 気分で手を動かし始めて、完成形は後から決まる         | P- E+    |
| Q7-c   | 「こういうのを作りたい」というイメージを先に固める   | P- E中   |
| Q7-d   | 過去に似たものを調べてから、自分なりの改良点を加える | P+ E中   |

---

### Q8: リスクへの姿勢

**主測定軸**: Energy（burst vs steady）
**副測定軸**: Social（outward vs inward）

**質問文**: 「リターンは大きいがリスクもある」という選択肢が目の前に。あなたは?

| 選択肢 | テキスト                                               | 測定方向 |
| ------ | ------------------------------------------------------ | -------- |
| Q8-a   | リスクを細かく書き出して、対策を全部考えてから判断する | E-       |
| Q8-b   | 「やってみてダメだったら次」くらいの気持ちで飛び込む   | E+ A+    |
| Q8-c   | 信頼できる人に相談してから決める                       | S+ E-    |
| Q8-d   | 「失敗したらどう面白いか」まで想像してからGO           | E+ P-    |

---

### Q9: 記憶の仕方

**主測定軸**: Perception（logical vs sensory）
**副測定軸**: Social（outward vs inward）

**質問文**: 旅先で素敵な景色を見た。あなたの記録の仕方は?

| 選択肢 | テキスト                                                   | 測定方向 |
| ------ | ---------------------------------------------------------- | -------- |
| Q9-a   | 写真を撮って、場所と状況をメモに残す                       | P+ A-    |
| Q9-b   | 目に焼き付けて、体に記憶させる。写真より本物               | P- S-    |
| Q9-c   | 「この光、あの映画のシーンみたいだ」と物語に変換して覚える | P- S-    |
| Q9-d   | SNSに投稿して、誰かと感動を共有したい                      | S+ E+    |

---

### Q10: 他者との関わり

**主測定軸**: Social（outward vs inward）
**副測定軸**: Energy（burst vs steady）

**質問文**: 久しぶりに会う人がいる。どんな気持ちになる?

| 選択肢 | テキスト                                               | 測定方向 |
| ------ | ------------------------------------------------------ | -------- |
| Q10-a  | ワクワク! 話したいことが山ほどある                     | S+ E+    |
| Q10-b  | 普通に楽しみ。まあ会ってみれば盛り上がるでしょ         | S中 E中  |
| Q10-c  | 少し緊張するが、話し始めれば大丈夫                     | S- E-    |
| Q10-d  | その人のことを事前にいろいろ思い出して、心の準備をする | S- P+    |

---

### Q11: ルーティンと変化

**主測定軸**: Action（active vs reflective）
**副測定軸**: Energy（burst vs steady）

**質問文**: いつも通りのやり方と、新しいやり方が選べる。あなたは?

| 選択肢 | テキスト                                          | 測定方向 |
| ------ | ------------------------------------------------- | -------- |
| Q11-a  | 新しい方を即試す。失敗しても知見になるから        | A+ E+    |
| Q11-b  | いつも通りが安心。変化にはエネルギーがいる        | A- E-    |
| Q11-c  | 「本当に新しいやり方の方がいいの?」とまず検証する | A- P+    |
| Q11-d  | 気分で決める。その日の直感に従う                  | A中 P-   |

---

### Q12: 将来の計画

**主測定軸**: Energy（burst vs steady）
**副測定軸**: Perception（logical vs sensory）

**質問文**: 5年後の自分について考えるとき、どんなイメージが浮かぶ?

| 選択肢 | テキスト                                                 | 測定方向 |
| ------ | -------------------------------------------------------- | -------- |
| Q12-a  | 具体的なマイルストーンが思い浮かぶ。逆算で計画を立てたい | E- P+    |
| Q12-b  | ぼんやりした景色が浮かぶ。詳細より「雰囲気」が先         | E中 P-   |
| Q12-c  | 「あの時やっておけばよかった」を減らしたいと思う         | E- A-    |
| Q12-d  | ワクワクする未来像が次々と浮かんでくる。絞れない         | E+ P-    |

---

## 2. 配分表（全48選択肢のPrimary/Secondary配分）

各選択肢のprimary(2pt)対象2体とsecondary(1pt)対象2体。

### Q1（主軸: Action, 副軸: Energy）

| 選択肢 | 測定方向 | Primary(2pt)                        | Secondary(1pt)                           |
| ------ | -------- | ----------------------------------- | ---------------------------------------- |
| Q1-a   | A+ E+    | blazing-schemer, ultimate-commander | blazing-warden, blazing-poet             |
| Q1-b   | A+ P+    | ultimate-trickster, clever-guardian | blazing-strategist, contrarian-professor |
| Q1-c   | A-       | dreaming-canvas, ultimate-artist    | eternal-dreamer, star-chaser             |
| Q1-d   | A- E-    | ultimate-guardian, data-fortress    | gentle-fortress, guardian-charger        |

### Q2（主軸: Action, 副軸: Perception）

| 選択肢 | 測定方向 | Primary(2pt)                             | Secondary(1pt)                   |
| ------ | -------- | ---------------------------------------- | -------------------------------- |
| Q2-a   | A+ P-    | blazing-poet, creative-disruptor         | blazing-canvas, vibe-rebel       |
| Q2-b   | A- P+ 高 | endless-researcher, contrarian-professor | gentle-fortress, data-fortress   |
| Q2-c   | A+ P+    | blazing-strategist, ultimate-trickster   | blazing-schemer, blazing-warden  |
| Q2-d   | A- P+ 低 | careful-scholar, dreaming-scholar        | academic-artist, eternal-dreamer |

### Q3（主軸: Social, 副軸: Action）

| 選択肢 | 測定方向 | Primary(2pt)                        | Secondary(1pt)                    |
| ------ | -------- | ----------------------------------- | --------------------------------- |
| Q3-a   | S+ A+    | ultimate-commander, blazing-warden  | blazing-schemer, blazing-canvas   |
| Q3-b   | S- A-    | dreaming-canvas, eternal-dreamer    | dreaming-scholar, tender-dreamer  |
| Q3-c   | S+ A-    | ultimate-guardian, guardian-charger | blazing-strategist, data-fortress |
| Q3-d   | S- A中   | vibe-rebel, star-chaser             | clever-guardian, ultimate-artist  |

### Q4（主軸: Perception, 副軸: Action）

| 選択肢 | 測定方向 | Primary(2pt)                           | Secondary(1pt)                    |
| ------ | -------- | -------------------------------------- | --------------------------------- |
| Q4-a   | P+ A- 高 | contrarian-professor, careful-scholar  | endless-researcher, data-fortress |
| Q4-b   | P- A+    | blazing-schemer, ultimate-commander    | blazing-canvas, dreaming-canvas   |
| Q4-c   | P- A中   | tender-dreamer, blazing-poet           | star-chaser, ultimate-artist      |
| Q4-d   | P- E+    | creative-disruptor, ultimate-trickster | star-chaser, blazing-poet         |

### Q5（主軸: Energy, 副軸: Action）

| 選択肢 | 測定方向 | Primary(2pt)                       | Secondary(1pt)                      |
| ------ | -------- | ---------------------------------- | ----------------------------------- |
| Q5-a   | E+ A-    | blazing-canvas, creative-disruptor | ultimate-artist, vibe-rebel         |
| Q5-b   | E- A中   | gentle-fortress, guardian-charger  | careful-scholar, endless-researcher |
| Q5-c   | E+ A+    | blazing-warden, blazing-strategist | ultimate-commander, blazing-poet    |
| Q5-d   | E- A-    | endless-researcher, tender-dreamer | clever-guardian, ultimate-guardian  |

### Q6（主軸: Social, 副軸: Perception）

| 選択肢 | 測定方向 | Primary(2pt)                        | Secondary(1pt)                         |
| ------ | -------- | ----------------------------------- | -------------------------------------- |
| Q6-a   | S+ A+    | blazing-warden, blazing-canvas      | blazing-strategist, ultimate-commander |
| Q6-b   | S- P-    | dreaming-canvas, vibe-rebel         | eternal-dreamer, contrarian-professor  |
| Q6-c   | S- P+    | dreaming-scholar, academic-artist   | ultimate-trickster, careful-scholar    |
| Q6-d   | S+ A中   | guardian-charger, ultimate-guardian | blazing-warden, data-fortress          |

### Q7（主軸: Perception, 副軸: Energy）

| 選択肢 | 測定方向 | Primary(2pt)                          | Secondary(1pt)                      |
| ------ | -------- | ------------------------------------- | ----------------------------------- |
| Q7-a   | P+ E-    | careful-scholar, academic-artist      | dreaming-scholar, gentle-fortress   |
| Q7-b   | P- E+    | ultimate-artist, vibe-rebel           | creative-disruptor, eternal-dreamer |
| Q7-c   | P- E中   | star-chaser, tender-dreamer           | dreaming-canvas, endless-researcher |
| Q7-d   | P+ E中   | contrarian-professor, clever-guardian | academic-artist, ultimate-trickster |

### Q8（主軸: Energy, 副軸: Social）

| 選択肢 | 測定方向 | Primary(2pt)                        | Secondary(1pt)                         |
| ------ | -------- | ----------------------------------- | -------------------------------------- |
| Q8-a   | E-       | data-fortress, gentle-fortress      | eternal-dreamer, ultimate-guardian     |
| Q8-b   | E+ A+    | blazing-schemer, ultimate-commander | creative-disruptor, ultimate-trickster |
| Q8-c   | S+ E-    | blazing-warden, guardian-charger    | data-fortress, ultimate-guardian       |
| Q8-d   | E+ P-    | blazing-canvas, blazing-poet        | creative-disruptor, vibe-rebel         |

### Q9（主軸: Perception, 副軸: Social）

| 選択肢 | 測定方向     | Primary(2pt)                             | Secondary(1pt)                     |
| ------ | ------------ | ---------------------------------------- | ---------------------------------- |
| Q9-a   | P+ A-        | endless-researcher, contrarian-professor | academic-artist, dreaming-scholar  |
| Q9-b   | P- S- 感覚的 | ultimate-trickster, eternal-dreamer      | dreaming-canvas, tender-dreamer    |
| Q9-c   | P- S- 物語的 | star-chaser, ultimate-artist             | blazing-poet, vibe-rebel           |
| Q9-d   | S+ E+        | blazing-strategist, blazing-warden       | blazing-canvas, ultimate-commander |

### Q10（主軸: Social, 副軸: Energy）

| 選択肢 | 測定方向 | Primary(2pt)                           | Secondary(1pt)                        |
| ------ | -------- | -------------------------------------- | ------------------------------------- |
| Q10-a  | S+ E+    | blazing-strategist, ultimate-commander | blazing-schemer, blazing-warden       |
| Q10-b  | S中 E中  | clever-guardian, contrarian-professor  | academic-artist, blazing-strategist   |
| Q10-c  | S- E-    | tender-dreamer, gentle-fortress        | dreaming-scholar, guardian-charger    |
| Q10-d  | S- P+    | dreaming-scholar, academic-artist      | clever-guardian, contrarian-professor |

### Q11（主軸: Action, 副軸: Energy）

| 選択肢 | 測定方向 | Primary(2pt)                        | Secondary(1pt)                         |
| ------ | -------- | ----------------------------------- | -------------------------------------- |
| Q11-a  | A+ E+    | blazing-schemer, ultimate-trickster | blazing-canvas, creative-disruptor     |
| Q11-b  | A- E-    | ultimate-guardian, data-fortress    | guardian-charger, tender-dreamer       |
| Q11-c  | A- P+    | endless-researcher, careful-scholar | contrarian-professor, dreaming-scholar |
| Q11-d  | A中 P-   | ultimate-artist, vibe-rebel         | clever-guardian, star-chaser           |

### Q12（主軸: Energy, 副軸: Perception）

| 選択肢 | 測定方向 | Primary(2pt)                        | Secondary(1pt)                      |
| ------ | -------- | ----------------------------------- | ----------------------------------- |
| Q12-a  | E- P+    | data-fortress, gentle-fortress      | careful-scholar, endless-researcher |
| Q12-b  | E中 P-   | eternal-dreamer, star-chaser        | dreaming-canvas, ultimate-artist    |
| Q12-c  | E- A-    | ultimate-guardian, guardian-charger | gentle-fortress, tender-dreamer     |
| Q12-d  | E+ P-    | blazing-canvas, creative-disruptor  | blazing-poet, vibe-rebel            |

---

## 3. 均等性検証表（最終確定版）

計算検証済み。全48選択肢×{primary2体, secondary2体}の配分を集計した結果。

| #   | ID                   | Primary(P) | Secondary(S) | 合計pt | 判定 |
| --- | -------------------- | ---------- | ------------ | ------ | ---- |
| 1   | blazing-strategist   | 4          | 4            | 12     | OK   |
| 2   | blazing-poet         | 3          | 5            | 11     | OK   |
| 3   | blazing-schemer      | 4          | 3            | 11     | OK   |
| 4   | blazing-warden       | 5          | 4            | 14     | OK   |
| 5   | blazing-canvas       | 4          | 5            | 13     | OK   |
| 6   | dreaming-scholar     | 3          | 5            | 11     | OK   |
| 7   | contrarian-professor | 5          | 4            | 14     | OK   |
| 8   | careful-scholar      | 4          | 3            | 11     | OK   |
| 9   | academic-artist      | 3          | 4            | 10     | OK   |
| 10  | star-chaser          | 4          | 4            | 12     | OK   |
| 11  | tender-dreamer       | 4          | 4            | 12     | OK   |
| 12  | dreaming-canvas      | 3          | 4            | 10     | OK   |
| 13  | clever-guardian      | 3          | 4            | 10     | OK   |
| 14  | creative-disruptor   | 4          | 4            | 12     | OK   |
| 15  | gentle-fortress      | 4          | 4            | 12     | OK   |
| 16  | ultimate-commander   | 5          | 3            | 13     | OK   |
| 17  | endless-researcher   | 4          | 4            | 12     | OK   |
| 18  | eternal-dreamer      | 3          | 5            | 11     | OK   |
| 19  | ultimate-trickster   | 5          | 3            | 13     | OK   |
| 20  | ultimate-guardian    | 5          | 3            | 13     | OK   |
| 21  | ultimate-artist      | 4          | 4            | 12     | OK   |
| 22  | data-fortress        | 4          | 5            | 13     | OK   |
| 23  | vibe-rebel           | 4          | 5            | 13     | OK   |
| 24  | guardian-charger     | 5          | 3            | 13     | OK   |

**合計**: Primary = 96 (48選択肢×2), Secondary = 96 (48選択肢×2)

**均等性チェック**:

- Primary スロット数: 全体が3〜5の範囲内 ✓
- Secondary スロット数: 全体が3〜5の範囲内 ✓
- 合計ポイント: 全体が10〜14の範囲内 ✓

---

## 4. 軸カバレッジ表

| 軸                                     | 主測定として使用する質問 | 質問数  |
| -------------------------------------- | ------------------------ | ------- |
| Action（行動: active vs reflective）   | Q1, Q2, Q11              | **3問** |
| Social（社交: outward vs inward）      | Q3, Q6, Q10              | **3問** |
| Perception（知覚: logical vs sensory） | Q4, Q7, Q9               | **3問** |
| Energy（エネルギー: burst vs steady）  | Q5, Q8, Q12              | **3問** |

各軸を主軸として測定する質問が3問（要件: 最低3問）を満たす。

---

## 5. タスク7実装用の配分データ（検証済み）

QuizDefinitionの `points: Record<string, number>` フィールドに直接使用するデータ。

```typescript
// Q1
{ id: "q1-a", points: { "blazing-schemer": 2, "ultimate-commander": 2, "blazing-warden": 1, "blazing-poet": 1 } }
{ id: "q1-b", points: { "ultimate-trickster": 2, "clever-guardian": 2, "blazing-strategist": 1, "contrarian-professor": 1 } }
{ id: "q1-c", points: { "dreaming-canvas": 2, "ultimate-artist": 2, "eternal-dreamer": 1, "star-chaser": 1 } }
{ id: "q1-d", points: { "ultimate-guardian": 2, "data-fortress": 2, "gentle-fortress": 1, "guardian-charger": 1 } }

// Q2
{ id: "q2-a", points: { "blazing-poet": 2, "creative-disruptor": 2, "blazing-canvas": 1, "vibe-rebel": 1 } }
{ id: "q2-b", points: { "endless-researcher": 2, "contrarian-professor": 2, "gentle-fortress": 1, "data-fortress": 1 } }
{ id: "q2-c", points: { "blazing-strategist": 2, "ultimate-trickster": 2, "blazing-schemer": 1, "blazing-warden": 1 } }
{ id: "q2-d", points: { "careful-scholar": 2, "dreaming-scholar": 2, "academic-artist": 1, "eternal-dreamer": 1 } }

// Q3
{ id: "q3-a", points: { "ultimate-commander": 2, "blazing-warden": 2, "blazing-schemer": 1, "blazing-canvas": 1 } }
{ id: "q3-b", points: { "dreaming-canvas": 2, "eternal-dreamer": 2, "dreaming-scholar": 1, "tender-dreamer": 1 } }
{ id: "q3-c", points: { "ultimate-guardian": 2, "guardian-charger": 2, "blazing-strategist": 1, "data-fortress": 1 } }
{ id: "q3-d", points: { "vibe-rebel": 2, "star-chaser": 2, "clever-guardian": 1, "ultimate-artist": 1 } }

// Q4
{ id: "q4-a", points: { "contrarian-professor": 2, "careful-scholar": 2, "endless-researcher": 1, "data-fortress": 1 } }
{ id: "q4-b", points: { "blazing-schemer": 2, "ultimate-commander": 2, "blazing-canvas": 1, "dreaming-canvas": 1 } }
{ id: "q4-c", points: { "tender-dreamer": 2, "blazing-poet": 2, "star-chaser": 1, "ultimate-artist": 1 } }
{ id: "q4-d", points: { "creative-disruptor": 2, "ultimate-trickster": 2, "star-chaser": 1, "blazing-poet": 1 } }

// Q5
{ id: "q5-a", points: { "blazing-canvas": 2, "creative-disruptor": 2, "ultimate-artist": 1, "vibe-rebel": 1 } }
{ id: "q5-b", points: { "gentle-fortress": 2, "guardian-charger": 2, "careful-scholar": 1, "endless-researcher": 1 } }
{ id: "q5-c", points: { "blazing-warden": 2, "blazing-strategist": 2, "ultimate-commander": 1, "blazing-poet": 1 } }
{ id: "q5-d", points: { "endless-researcher": 2, "tender-dreamer": 2, "clever-guardian": 1, "ultimate-guardian": 1 } }

// Q6
{ id: "q6-a", points: { "blazing-warden": 2, "blazing-canvas": 2, "blazing-strategist": 1, "ultimate-commander": 1 } }
{ id: "q6-b", points: { "dreaming-canvas": 2, "vibe-rebel": 2, "eternal-dreamer": 1, "contrarian-professor": 1 } }
{ id: "q6-c", points: { "dreaming-scholar": 2, "academic-artist": 2, "ultimate-trickster": 1, "careful-scholar": 1 } }
{ id: "q6-d", points: { "guardian-charger": 2, "ultimate-guardian": 2, "blazing-warden": 1, "data-fortress": 1 } }

// Q7
{ id: "q7-a", points: { "careful-scholar": 2, "academic-artist": 2, "dreaming-scholar": 1, "gentle-fortress": 1 } }
{ id: "q7-b", points: { "ultimate-artist": 2, "vibe-rebel": 2, "creative-disruptor": 1, "eternal-dreamer": 1 } }
{ id: "q7-c", points: { "star-chaser": 2, "tender-dreamer": 2, "dreaming-canvas": 1, "endless-researcher": 1 } }
{ id: "q7-d", points: { "contrarian-professor": 2, "clever-guardian": 2, "academic-artist": 1, "ultimate-trickster": 1 } }

// Q8
{ id: "q8-a", points: { "data-fortress": 2, "gentle-fortress": 2, "eternal-dreamer": 1, "ultimate-guardian": 1 } }
{ id: "q8-b", points: { "blazing-schemer": 2, "ultimate-commander": 2, "creative-disruptor": 1, "ultimate-trickster": 1 } }
{ id: "q8-c", points: { "blazing-warden": 2, "guardian-charger": 2, "data-fortress": 1, "ultimate-guardian": 1 } }
{ id: "q8-d", points: { "blazing-canvas": 2, "blazing-poet": 2, "creative-disruptor": 1, "vibe-rebel": 1 } }

// Q9
{ id: "q9-a", points: { "endless-researcher": 2, "contrarian-professor": 2, "academic-artist": 1, "dreaming-scholar": 1 } }
{ id: "q9-b", points: { "ultimate-trickster": 2, "eternal-dreamer": 2, "dreaming-canvas": 1, "tender-dreamer": 1 } }
{ id: "q9-c", points: { "star-chaser": 2, "ultimate-artist": 2, "blazing-poet": 1, "vibe-rebel": 1 } }
{ id: "q9-d", points: { "blazing-strategist": 2, "blazing-warden": 2, "blazing-canvas": 1, "ultimate-commander": 1 } }

// Q10
{ id: "q10-a", points: { "blazing-strategist": 2, "ultimate-commander": 2, "blazing-schemer": 1, "blazing-warden": 1 } }
{ id: "q10-b", points: { "clever-guardian": 2, "contrarian-professor": 2, "academic-artist": 1, "blazing-strategist": 1 } }
{ id: "q10-c", points: { "tender-dreamer": 2, "gentle-fortress": 2, "dreaming-scholar": 1, "guardian-charger": 1 } }
{ id: "q10-d", points: { "dreaming-scholar": 2, "academic-artist": 2, "clever-guardian": 1, "contrarian-professor": 1 } }

// Q11
{ id: "q11-a", points: { "blazing-schemer": 2, "ultimate-trickster": 2, "blazing-canvas": 1, "creative-disruptor": 1 } }
{ id: "q11-b", points: { "ultimate-guardian": 2, "data-fortress": 2, "guardian-charger": 1, "tender-dreamer": 1 } }
{ id: "q11-c", points: { "endless-researcher": 2, "careful-scholar": 2, "contrarian-professor": 1, "dreaming-scholar": 1 } }
{ id: "q11-d", points: { "ultimate-artist": 2, "vibe-rebel": 2, "clever-guardian": 1, "star-chaser": 1 } }

// Q12
{ id: "q12-a", points: { "data-fortress": 2, "gentle-fortress": 2, "careful-scholar": 1, "endless-researcher": 1 } }
{ id: "q12-b", points: { "eternal-dreamer": 2, "star-chaser": 2, "dreaming-canvas": 1, "ultimate-artist": 1 } }
{ id: "q12-c", points: { "ultimate-guardian": 2, "guardian-charger": 2, "gentle-fortress": 1, "tender-dreamer": 1 } }
{ id: "q12-d", points: { "blazing-canvas": 2, "creative-disruptor": 2, "blazing-poet": 1, "vibe-rebel": 1 } }
```

---

## 6. #12と#18の配点差異の確認

| キャラ              | Primary選択肢     | Secondary選択肢              | 特徴的な質問                                                                             |
| ------------------- | ----------------- | ---------------------------- | ---------------------------------------------------------------------------------------- |
| #12 dreaming-canvas | Q1-c, Q3-b, Q6-b  | Q4-b, Q7-c, Q9-b, Q12-b      | Q6-b「一人でじっくり噛みしめる」でprimary（感性的感情処理 = artist副の特徴）             |
| #18 eternal-dreamer | Q3-b, Q9-b, Q12-b | Q1-c, Q2-d, Q6-b, Q7-b, Q8-a | Q9-b「目に焼き付けて体に記憶させる」でprimary（感覚記憶純粋型 = dreamer×dreamer の特徴） |

- Q6-b: dreaming-canvas のみprimary（S-P-の内向感情処理 = dreamer×artist で感情を感性的に吸収）。eternal-dreamerはsecondary（妄想は先延ばしの動機ではなく感情体験もそこに向かう）
- Q9-b: eternal-dreamer のみprimary（感覚記憶を妄想の素材として蓄積するdreamer×dreamer の特徴）。dreaming-canvasはsecondary（視覚的記憶もするが絵画的イメージとして変換する）
- Q12-b: eternal-dreamer のみprimary（ぼんやりした未来像・先延ばし型は#18の特徴）
- Q3-b: 両者ともprimary（内向的・孤立的グループ行動は共通特徴）
- Primary共有: Q3-b の1スロットのみ（共有率33%）。両者それぞれが2スロット以上の exclusive primaryを持ち、明確に異なる性格を表現

---

## 7. 主副逆転ペアの配点差異の確認

| ペア                                      | 差別化ポイント                                                               | 配点差異                                                                                                                                           |
| ----------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| #4 blazing-warden vs #24 guardian-charger | 「前進が本能でついつい守る」vs「守るために必要な時だけ前に出る」             | blazing-wardenはQ3-a(S+A+)でprimary。guardian-chargerはQ3-c(S+A-)でprimary。A+の選択肢はblazingwardenに、A-guardianはguardian-chargerに分配        |
| #8 careful-scholar vs #22 data-fortress   | 「論理的確認による安全構築」vs「不安からデータ収集して安心を得る」           | careful-scholarはQ7-a(P+E-)でprimary、data-fortressはQ8-a(E-)でprimary。「設計・確認」はcareful-scholar、「リスク対策」はdata-fortressに重みを置く |
| #14 creative-disruptor vs #23 vibe-rebel  | 「計算して逆張り、感性で仕上げる」vs「感性で動いたら結果的に逆張りになった」 | creative-disruptorはQ5-a(E+A-)でprimary（burst感ある行動）、vibe-rebelはQ3-d, Q11-d でprimary（自然体の内向性）。同じ選択肢に両方primaryなし       |

---

## 8. タスク7への引き継ぎ事項

1. **スコアリング方式**: 方式B（直接ポイント方式）。既存のanimal-personality、music-personalityと同一の `points: Record<string, number>` 形式を使用
2. **実装ファイル**: `src/quiz/data/character-personality.ts` に12問のquestion定義を記述。セクション5のデータをそのまま使用できる
3. **CHARACTER_PERSONALITY_TYPE_IDS**: 24体のIDを配列として export する（タスク1の設計書にID一覧あり）
4. **相性マトリクス**: 別ファイル `src/quiz/data/character-personality-compatibility.ts` に分割（タスク6で制作）
5. **getCompatibility関数**: character-fortune.tsと同じパターンで実装する
6. **技術制約**: `.claude/rules/coding-rules.md` を直接参照すること

---

## 9. 設計根拠の注記

### Q25との差別化

Q25で使用されたシチュエーション（戦国時代タイムスリップ、宇宙人、魔法で動物変身、文化祭、100万円、RPG転生、借金相談、世界の終わり）をすべて回避し、日常的かつ具体的な場面（目覚め・買い物・イベント参加・トラブル対応・課題取り組み・感情処理・創作・リスク判断・旅の記録・再会・ルーティン・将来計画）を採用した。

### ユーモラスな質問設計

「ポチっている」「頭の中で熟成させる」「もう少しだけ...と布団にくるまって」などのユーモラスな言い回しを選択肢テキストに組み込み、Q25のトーンとの一貫性を保った。

### 均等性確保の方法論

単純なベクトルスコア順位による割り当てでは特定キャラ（命令系統ベクトルが極端な体）への集中が避けられないため、各体が必ず3〜5回primaryを得るよう制約を設けた上で手動設計を実施。Pythonスクリプトで全48選択肢の集計を行い、全24体が許容範囲（P: 3-5, S: 3-5, Total: 10-14）に収まることをプログラム的に検証済み。
