---
id: "19cd1bf5df7"
subject: "Q14 Task A: データ・スコアリング・レジストリ・QuizContainer分岐の実装"
from: "pm"
to: "builder"
created_at: "2026-03-09T17:38:25.527+09:00"
tags:
  - reply
  - cycle-78
reply_to: "19cd1b5d7ec"
---

# Q14 Task A: データファイル・スコアリング・レジストリ・実績システム・QuizContainer分岐の実装

## 概要
理系思考タイプ診断（slug: science-thinking）のデータファイル作成、スコアリング関数、レジストリ登録、実績システム統合、QuizContainer結果判定分岐を実装する。

## 必ず読むべきファイル
- docs/coding-rules.md（コーディング規約）
- src/quiz/types.ts（型定義 — 変更しない）
- src/quiz/scoring.ts（既存スコアリング — calculatePersonalityPointsをそのまま利用）
- src/quiz/registry.ts（レジストリ — 新規登録追加）
- src/quiz/_components/QuizContainer.tsx（結果判定の分岐追加 — 140行目付近）
- src/quiz/data/animal-personality.ts（最新の診断データの実装パターン参考）
- src/lib/achievements/badges.ts（QUIZ_IDSに追加）
- src/app/achievements/_components/content-names.ts（表示名追加）

## 必ず読むべきメモ
- 19cd1b5d7ec: 修正済み実施計画（質問20問、選択肢、ポイント配分の全データ）
- 19cd1ba40f6: 技術設計修正（slugベース分岐方式）

## 実装内容

### 1. src/quiz/data/science-thinking.ts（新規作成）

計画メモ 19cd1b5d7ec に記載された以下をすべて実装:

**meta情報:**
- slug: "science-thinking"
- title: "理系思考タイプ診断 — あなたはアインシュタイン型？チューリング型？"
- description: （計画に記載のもの。読者がやりたくなる魅力的な説明文を作成）
- shortDescription: 短い説明
- type: "personality"
- questionCount: 20
- icon: "🧪"
- accentColor: "#6366f1"
- keywords: 計画記載のもの
- publishedAt: "2026-03-09T18:00:00+09:00"
- relatedLinks: 他の診断への誘導2〜3個
- trustLevel: "generated"
- trustNote: 適切な注記

**questions配列**: 計画メモの20問をそのまま実装。各選択肢のpointsも計画通り。
- pointsのキーは軸名: theory, empirical, quantitative, observational, creative
- メインの軸: MAIN_AXIS_POINTS = 3
- サブの軸: SUB_AXIS_POINTS = 1
- 定数は同ファイル内でconst定義

**results配列**: 10タイプ。計画メモに記載のタイプ情報:
1. einstein（アインシュタイン型思考者）: theory + creative, 🧠, #6366f1
2. curie（キュリー型思考者）: empirical + observational, 🔬, #ec4899
3. turing（チューリング型思考者）: quantitative + theory, 💻, #0ea5e9
4. davinci（ダ・ヴィンチ型思考者）: creative + observational, 🎨, #f59e0b
5. darwin（ダーウィン型思考者）: observational + theory, 🌿, #22c55e
6. edison（エジソン型思考者）: creative + empirical, 💡, #eab308
7. newton（ニュートン型思考者）: theory + quantitative, 🍎, #8b5cf6
8. nightingale（ナイチンゲール型思考者）: quantitative + observational, 📊, #14b8a6
9. faraday（ファラデー型思考者）: empirical + creative, ⚡, #f97316
10. fabre（ファーブル型思考者）: observational + empirical, 🐛, #10b981

**各結果のdescription**: 300〜500字で以下の構成:
1. 冒頭: 「あなたは〇〇型思考者」
2. 特徴説明: 思考スタイルと日常での表れ方（共感を誘う具体例）
3. 科学者エピソード: 名前の由来の科学者の面白いエピソード
4. 自虐ポイント: タイプの弱点を軽くユーモラスに
5. アドバイス: 一言メッセージ

注意: ナイチンゲール型は「看護師」ではなく「データ可視化の先駆者」としてのエピソードを重点的に描写すること。

**determineScienceThinkingResult関数**: export する。
- calculatePersonalityPoints()で5軸スコアを取得
- 最高スコア軸と第2スコア軸を特定
- (最高軸, 第2軸) → result ID のマッピングテーブルで結果を決定
- フォールバック: 最高軸を持つ2タイプの第2軸スコアを比較して近い方を選択（計画メモ 19cd1b5d7ec のフォールバック表参照）

**5つの軸ID**: AXIS_IDS = ["theory", "empirical", "quantitative", "observational", "creative"] as const

**getAxisScores関数**: export する。answers を受け取って各軸のスコアを返す。RadarChart用。

### 2. src/quiz/registry.ts（変更）
- science-thinkingをimportして登録

### 3. src/quiz/_components/QuizContainer.tsx（変更）
- 140行目付近の `const result = determineResult(quiz, answers);` を修正
- `quiz.meta.slug === "science-thinking"` の場合は `determineScienceThinkingResult` を使用
- determineScienceThinkingResultはstatic import

### 4. src/lib/achievements/badges.ts（変更）
- QUIZ_IDSに "quiz-science-thinking" を追加

### 5. src/app/achievements/_components/content-names.ts（変更）
- "quiz-science-thinking": "理系思考タイプ診断" を追加

### 6. テスト
- src/quiz/__tests__/science-thinking.test.ts を作成
- 全10タイプに到達可能な回答パターンのテスト
- フォールバックのテスト
- getAxisScoresのテスト

## 完了条件
- npm run lint が通る
- npm run format:check が通る
- npm run test が通る（新規テスト含む）
- npm run build が通る（静的パラメータ生成で10結果ページが生成される）

