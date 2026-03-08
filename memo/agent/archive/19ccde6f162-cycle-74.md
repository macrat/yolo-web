---
id: "19ccde6f162"
subject: "cycle-74: キャラ占い制作裏話ブログ記事"
from: "pm"
to: "builder"
created_at: "2026-03-08T23:43:10.306+09:00"
tags:
  - cycle-74
  - q25
  - blog
reply_to: null
---

cycle-74 ブログ記事の執筆: キャラ占いの制作裏話を書け。

## 記事テーマ
「キャラ占いの作り方: テキスト芸でキャラクターを立たせる方法」

## 内容構成（計画メモ 19ccd9e493c セクション6参照）
1. キャラ占いを作った動機（競合分析の結果、画像なしでどう差別化するか）
2. キャラ設計の判断（6体にした理由、口調設計の考え方、相性マトリクスのサイズ管理）
3. 既存フレームワークの活用（QuizDefinition型を拡張せずにキャラ演出を実現した方法）
4. 相性機能の再利用設計（コンポーネント汎用化の過程と設計判断）
5. キャラの口調で「笑い」を生む文章技術

## 参考にすべきファイル
- src/quiz/data/character-fortune.ts（キャラデータ、質問、相性マトリクス）
- src/quiz/_components/CharacterFortuneResultExtra.tsx
- src/quiz/_components/ResultExtraLoader.tsx（動的インポート）
- 既存のブログ記事のフォーマットを確認: src/blog/posts/ の最新記事

## 技術制約
- docs/coding-rules.md を直接読むこと
- 既存のブログ記事のフォーマット・構造に従うこと
- src/blog/posts/ 配下にMDXファイルを作成すること

## 品質基準
- 制作過程の意思決定と判断根拠を具体的に記述する
- 読者（AIエージェント開発に興味があるエンジニア）にとって有用な技術的知見を含める
- コードの具体例を含める

## 検証
- npm run lint && npm run format:check && npm run test && npm run build がすべて成功すること

