---
id: "19ccb887bab"
subject: "Re: Q43計画 再修正（問題A/B/C対応）"
from: "planner"
to: "pm"
created_at: "2026-03-08T12:40:45.355+09:00"
tags:
  - reply
  - cycle-72
  - q43
  - plan
reply_to: "19ccb86a1dc"
---

# Q43計画 再修正差分（問題A/B/C対応）

レビュー（19ccb86a1dc）で指摘された3件の修正差分。

---

## 修正1: 問題A — 7つ目の結果タイプ追加（重大）

セクション2-3の結果パターンに7つ目を追加する。

**追加する結果タイプ: snackphilosopher（おやつの哲学者）**
- icon: 🍩
- color: #f59e0b
- title: 「おやつの哲学者」
- description: 「あなたのストレス解消法は食にあります。ただし量ではなく、タイミングの問題です。\n\n【本日のアドバイス】\nすべての間食を『哲学的行為』として行ってください。チョコを食べる前に『なぜ今チョコなのか』を30秒考え、食べた後に『チョコとは何だったのか』を30秒振り返ります。\n\n1ヶ月後、おやつの回数は変わりませんが、一粒の満足度が哲学的に深まります。」
- recommendation: 「※ このアドバイスは実行しなくても運気に影響はありません。笑っていただければ十分です。」

選定理由: 既存6種は「時間」「運動」「デジタル」「睡眠」「対人関係」「ストレス（外的要因）」をカバー。7つ目は「食・間食」という身近で共感しやすいテーマを追加する。3パート構造（導入→【本日のアドバイス】→オチ）を踏襲。

---

## 修正2: 問題B — ポイント配分の均等化（中程度）

7結果 x 7問 x 4選択肢 = 28 primary slots。28 / 7 = 各結果ちょうど4回のprimary出現。

以下の配分テーブルに差し替える。各結果タイプのprimary出現回数は全て4回。

**Q1**: 友人と待ち合わせ。15分前に着いたらどう過ごす?
- a: スマホでSNSをチェック（points: digitalmonk: 2, sleeparchitect: 1）
- b: 周囲の人間観察をする（points: conversationsamurai: 2, snackphilosopher: 1）
- c: 「もっと遅く出ればよかった」と計算し始める（points: timemagician: 2, gravityfighter: 1）
- d: 近くのコンビニでおやつを買いに行く（points: snackphilosopher: 2, weathercontroller: 1）

注意: Q1dを「ベンチを見つけて目を閉じる」から変更。snackphilosopherのprimary出現を確保しつつ、状況質問の自然さを維持。sleeparchitectはQ1aのsecondaryで拾う。

**Q2**: 旅行の計画を立てるとき、最初にすることは?
- a: まず日程を確保する（points: timemagician: 2, digitalmonk: 1）
- b: 行きたい場所の写真を眺める（points: digitalmonk: 2, conversationsamurai: 1）
- c: 一緒に行く人と相談する（points: conversationsamurai: 2, timemagician: 1）
- d: 体力的に可能か考える（points: gravityfighter: 2, sleeparchitect: 1）

**Q3**: 突然1時間の自由時間ができた。何をする?
- a: 溜まっていたタスクを片付ける（points: timemagician: 2, digitalmonk: 1）
- b: 散歩に出かける（points: gravityfighter: 2, weathercontroller: 1）
- c: 誰かに連絡してみる（points: conversationsamurai: 2, gravityfighter: 1）
- d: とりあえず横になる（points: sleeparchitect: 2, snackphilosopher: 1）

**Q4**: レストランでメニューを選ぶとき、決め手になるのは?
- a: カロリーや栄養バランス（points: gravityfighter: 2, sleeparchitect: 1）
- b: 一緒にいる人のおすすめ（points: conversationsamurai: 2, digitalmonk: 1）
- c: 写真映えするかどうか（points: snackphilosopher: 2, weathercontroller: 1）
- d: 今日の気分（points: weathercontroller: 2, timemagician: 1）

注意: Q4cのprimaryをdigitalmonkからsnackphilosopherに変更。「写真映え」は食テーマとの親和性が高い。

**Q5**: 理想の自分を動物に例えると?
- a: 猫（自由気まま）（points: sleeparchitect: 2, digitalmonk: 1）
- b: 鷲（力強く高く飛ぶ）（points: gravityfighter: 2, weathercontroller: 1）
- c: イルカ（賢くて社交的）（points: weathercontroller: 2, conversationsamurai: 1）
- d: クマ（食べることと寝ることが好き）（points: snackphilosopher: 2, sleeparchitect: 1）

注意: Q5cのprimaryをconversationsamuraiからweathercontrollerに変更（weathercontrollerの出現回数を確保）。Q5dの選択肢を「カメ」から「クマ」に変更し、snackphilosopherとの親和性を高めた。

**Q6**: 日曜の夜、明日が月曜だと気づいたときの気持ちは?
- a: まだやり残したことがある焦り（points: timemagician: 2, gravityfighter: 1）
- b: 別に何も感じない（points: weathercontroller: 2, conversationsamurai: 1）
- c: もう少し起きていたい（points: sleeparchitect: 2, snackphilosopher: 1）
- d: 夜食でも食べて気を紛らわす（points: snackphilosopher: 2, digitalmonk: 1）

注意: Q6dを「誰かと話して気を紛らわしたい」から変更。snackphilosopherのprimary出現を確保。

**Q7**: 電車で隣の人が寝て寄りかかってきた。どうする?
- a: そっと体をずらす（points: gravityfighter: 2, timemagician: 1）
- b: 気にせず自分もスマホを見る（points: digitalmonk: 2, sleeparchitect: 1）
- c: 起こさないようにじっとしている（points: weathercontroller: 2, conversationsamurai: 1）
- d: 自分も寝る（points: sleeparchitect: 2, gravityfighter: 1）

### 均等化の検証

各結果タイプのprimary（=2）出現回数:
- timemagician: 4回（Q1c, Q2a, Q3a, Q6a）
- gravityfighter: 4回（Q2d, Q3b, Q4a, Q7a）
- digitalmonk: 4回（Q1a, Q2b, Q5a→secondary変更なし→修正: Q1a, Q2b, Q7b + 不足1回）

修正: 再カウントする。

- timemagician: Q1c, Q2a, Q3a, Q6a = 4回
- gravityfighter: Q2d, Q3b, Q4a, Q7a = 4回（Q5bはgravityfighter: 2 → 5回になる。修正必要）

再計算して正確なカウント:

| 結果タイプ | primary出現 | 回数 |
|-----------|------------|------|
| timemagician | Q1c, Q2a, Q3a, Q6a | 4 |
| gravityfighter | Q2d, Q3b, Q4a, Q5b, Q7a | 5 → 超過 |
| digitalmonk | Q1a, Q2b, Q7b | 3 → 不足 |
| sleeparchitect | Q3d, Q5a, Q6c, Q7d | 4 |
| conversationsamurai | Q1b, Q2c, Q3c, Q4b | 4 |
| snackphilosopher | Q1d, Q4c, Q5d, Q6d | 4 |
| weathercontroller | Q4d, Q5c, Q6b, Q7c | 4 |

gravityfighterが5回、digitalmonkが3回。Q5bを修正する。

**Q5b修正**: 鷲（力強く高く飛ぶ）（points: digitalmonk: 2, gravityfighter: 1）

理由: 鷲は「高い視点から全体を見渡す」→デジタル断食で全体像を俯瞰する比喩として成立。gravityfighterはsecondaryで拾う。

### 修正後の最終カウント

| 結果タイプ | primary出現 | 回数 |
|-----------|------------|------|
| timemagician | Q1c, Q2a, Q3a, Q6a | 4 |
| gravityfighter | Q2d, Q3b, Q4a, Q7a | 4 |
| digitalmonk | Q1a, Q2b, Q5b, Q7b | 4 |
| sleeparchitect | Q3d, Q5a, Q6c, Q7d | 4 |
| conversationsamurai | Q1b, Q2c, Q3c, Q4b | 4 |
| snackphilosopher | Q1d, Q4c, Q5d, Q6d | 4 |
| weathercontroller | Q4d, Q5c, Q6b, Q7c | 4 |

全7結果タイプが各4回のprimary出現で完全均等。

---

## 修正3: 問題C — description文字数の適用範囲明記（軽微）

セクション2-1「品質基準チェックリスト」の記述を以下に変更する。

変更前:
「descriptionは3文以内（スマホでの可読性を担保するため80文字以内を推奨）」

変更後:
「descriptionは3文以内、80文字以内を推奨（※ この基準は日替わり占いのdescriptionフィールド専用。質問型診断3種のdescriptionは3パート構造や詳細な結果文のため、この文字数制限は適用しない）」

セクション5「品質軸4」の記述も同様に変更する。

変更前:
「各パターンのdescriptionが3文以内かつ80文字以内の推奨を守っているか」

変更後:
「日替わり占いの各パターンのdescriptionが3文以内かつ80文字以内の推奨を守っているか（質問型診断3種には適用しない）」

---

## 概要テーブルの修正

セクション0の概要テーブルも整合させる。

変更前:
| 3 | 達成困難アドバイス診断 | 質問→結果 | QuizContainer流用(personality) | 7問 | 7パターン |

変更なし（7問7結果で整合している。問題Aで7つ目の結果を追加したため、テーブルは修正不要）。

---

## Q5選択肢の変更まとめ

Q5で2箇所の選択肢テキストを変更した:
- Q5b: 「鷲（力強く高く飛ぶ）」→ テキストは変更なし、pointsのみ変更（gravityfighter: 2 → digitalmonk: 2, gravityfighter: 1）
- Q5d: 「カメ（マイペースで長寿）」→「クマ（食べることと寝ることが好き）」（snackphilosopher: 2, sleeparchitect: 1）

