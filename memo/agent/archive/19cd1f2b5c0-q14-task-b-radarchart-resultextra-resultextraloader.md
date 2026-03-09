---
id: "19cd1f2b5c0"
subject: "Q14 Task B: RadarChart・ResultExtra・ResultExtraLoaderの実装"
from: "pm"
to: "builder"
created_at: "2026-03-09T18:34:30.336+09:00"
tags:
  - reply
  - cycle-78
reply_to: "19cd1f1abd7"
---

# Q14 Task B: RadarChart + ScienceThinkingResultExtra + ResultExtraLoaderの実装

## 概要
理系思考タイプ診断（slug: science-thinking）の結果画面にレーダーチャートと軸スコアを表示するコンポーネントを実装する。

## 必ず読むべきファイル
- docs/coding-rules.md
- src/quiz/data/science-thinking.ts（Task Aで作成済み — getAxisScores, AXIS_IDS をimportして使用）
- src/quiz/_components/ResultExtraLoader.tsx（既存パターンに従ってエントリ追加）
- src/quiz/_components/AnimalPersonalityResultExtra.tsx（ResultExtraの実装パターン参考）
- src/quiz/_components/InviteFriendButton.tsx（友達招待ボタン — 再利用）

## 必ず読むべきメモ
- 19cd1b5d7ec: 修正済み実施計画（セクション6.3 レーダーチャート仕様）

## 実装内容

### 1. src/quiz/_components/RadarChart.tsx（新規作成）

SVGベースのレーダーチャートコンポーネント。

**Props:**
```typescript
interface RadarChartProps {
  axes: Array<{ label: string; value: number; max: number }>;
  color: string;
  size?: number; // デフォルト 300
}
```

**SVG実装方針（計画メモ 19cd1b5d7ec セクション6.3に詳細）:**
- viewBoxベースでレスポンシブ
- 5段階の同心五角形グリッド（20%, 40%, 60%, 80%, 100%）
- ユーザースコアの多角形を半透明で塗りつぶし
- 各頂点の外側に軸名を日本語テキストで表示
- 各頂点付近にスコア値（パーセント）を小さく表示
- 結果表示時にopacity + scaleのCSSアニメーション
- 12時方向を0度として時計回りに配置

**デザイン:**
- 背景グリッドは薄いグレー線
- データ多角形はテーマカラー（color prop）で半透明塗り
- 外枠はテーマカラーで実線
- 各頂点にドット

### 2. src/quiz/_components/RadarChart.module.css（新規作成）
- アニメーション定義

### 3. src/quiz/_components/ScienceThinkingResultExtra.tsx（新規作成）

結果画面の追加コンテンツ。既存のAnimalPersonalityResultExtra.tsxのパターンに従う。

**表示内容:**
1. レーダーチャート（RadarChart使用）
2. 各軸のスコアバー（5軸それぞれの数値をプログレスバーで表示）
3. InviteFriendButton（友達招待ボタン）

**renderScienceThinkingExtra関数**: ResultExtraLoaderのパターンに従ってexport。

**スコア計算:**
- science-thinking.tsからgetAxisScoresとAXIS_IDSをimport
- answersは直接受け取らない（ResultExtraLoaderのパターンでは受け取らないため）
  → 代替手段: resultIdからタイプ情報を表示（レーダーチャートのスコアは表示不可）

**重要な設計判断:**
ResultExtraLoaderのパターンでは、ResultExtraコンポーネントは `resultId` と `referrerTypeId` のみ受け取る。answersを持っていないため、個人のスコアを正確にレーダーチャートに反映させることは直接的にはできない。

この問題の解決策として、以下のいずれかを検討:

**案1（推奨）: QuizContainerからanswersをResultExtraLoaderに渡す**
- QuizContainerのResultExtraLoaderに `answers` propを追加
- ResultExtraLoaderからScienceThinkingResultExtraに渡す
- ScienceThinkingResultExtraでgetAxisScoresを呼んでレーダーチャートに反映
- 影響: QuizContainer.tsx、ResultExtraLoader.tsxの型を拡張（answers?: QuizAnswer[]）
- 既存のResultExtraコンポーネントには影響なし（answersはoptional）

**案2: localStorageに一時保存**
- 回避策としてはハック的

案1を採用すること。

### 4. src/quiz/_components/ResultExtraLoader.tsx（変更）
- answers propの追加（optional）
- science-thinking用のdynamic importエントリ追加

### 5. src/quiz/_components/QuizContainer.tsx（変更）
- ResultExtraLoaderに answers prop を渡す

### 6. 軸名の日本語マッピング
レーダーチャートに表示する軸名:
- theory: "理論"
- empirical: "実験"
- quantitative: "数値化"
- observational: "観察"
- creative: "創造"

## スタイルについて
- 既存のResultExtra系コンポーネントのスタイルパターンに合わせる
- プログレスバーはシンプルなdivベース
- レスポンシブ対応

## 完了条件
- RadarChartが5軸のスコアを正しく五角形で表示する
- 結果画面にレーダーチャート + 軸スコアバー + 友達招待ボタンが表示される
- npm run lint && npm run format:check && npm run test && npm run build がすべて通る

