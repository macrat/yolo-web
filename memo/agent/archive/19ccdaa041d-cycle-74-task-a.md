---
id: "19ccdaa041d"
subject: "cycle-74 Task A: キャラ占いクイズデータ作成"
from: "pm"
to: "builder"
created_at: "2026-03-08T22:36:37.405+09:00"
tags:
  - cycle-74
  - q25
  - task-a
reply_to: null
---

cycle-74 Task A: キャラ占いクイズデータの作成を実施せよ。

## 背景
計画メモ 19ccd9e493c のセクション2〜4およびセクション5「Task A」を参照。
Task A-pre（相性コンポーネント汎用化）は完了済み。CompatibilityEntry 型は src/quiz/types.ts からインポートできる。

## 作業内容

### 新規ファイル作成: src/quiz/data/character-fortune.ts

以下を含むクイズデータファイルを作成する:

#### 1. QuizDefinition
- slug: character-fortune
- title: キャラ占い（または builder が判断した適切なタイトル）
- description: 適切な説明文
- type: personality
- questionCount: 8
- icon: 🔮
- accentColor: #8b5cf6
- publishedAt: 2026-03-08
- trustLevel: generated
- trustNote: スコア計算は正確です。キャラクターと占い結果はAIが創作したエンターテインメントです。
- keywords: 適切なキーワード

#### 2. 8問の質問
質問テーマ設計方針（計画セクション3）を厳守:
- ありきたりな診断サイトの質問を避ける
- 質問シチュエーション自体にユーモアや意外性を含める
- 8問のうち少なくとも半数は非日常的なシチュエーション
- 質問を読むだけでくすっと笑えること
- 各質問4択
- 良い例: 「突然タイムスリップしたら」「宇宙人が友達になりたがっている」「魔法で1日だけ動物になれるとしたら」
- 悪い例: 「休日の過ごし方は?」「旅行の計画方法は?」

#### 3. 6体のキャラクター（結果）
計画セクション2のキャラ設計に従う。キャラ名は builder が最終決定する。

命名基準（厳守）:
- 名前だけで「何それ?」と興味を引くこと
- LoveType16の「宇宙規模の心配性」レベルの面白さ
- 性格の意外な一面やあるあるネタを名前に組み込む
- 悪い例: 全力キャプテン、ふわふわ姫、感性のカンバス
- 良い方向性: 性格の意外な具体エピソードを名前にする、日常の「あるある」を誇張する

各キャラのdescriptionはキャラの一人称セリフ形式で書く（地の文ではなく、キャラが語りかける形式）。

| ID | 方向性 | 口調 | 性格 | テーマカラー | アイコン絵文字 |
|----|--------|------|------|-------------|--------------|
| commander | 情熱リーダー系 | 体育会系「〜だぜ\!」 | 情熱的・行動派 | #e11d48 | 🔥 |
| professor | 知的好奇心＋食い意地系 | 学者口調「〜であるぞ」 | 知的好奇心・食いしん坊・天然 | #2563eb | 🧪 |
| dreamer | おっとり夢見がち系 | おっとり敬語「〜ですわ」 | 夢見がち・優しい・芯が強い | #d946ef | ✨ |
| trickster | ひねくれ知恵者系 | 軽い口調「〜っしょ」 | ひねくれ者・知恵者 | #f59e0b | 🃏 |
| guardian | 心配性・慎重派系 | 慎重語「〜かもしれないね」 | 心配性・計画派 | #059669 | 🛡️ |
| artist | 感受性・独創系 | 詩的口調「〜って、美しいよね」 | 感受性豊か・独創的 | #7c3aed | 🎨 |

#### 4. スコアリング
personality型スコアリングを使用:
- 各選択肢に points として6キャラIDへのポイントを割り振る
- 主ポイント: 2pt（1キャラ）、副ポイント: 1pt（1〜2キャラ）
- 各キャラに均等に主ポイントが回るよう設計

#### 5. 相性マトリクス
- 21組（6C2 = 15 + 同キャラ6組 = 21）の相性データ
- CompatibilityEntry 型は @/quiz/types からインポート
- getCompatibility 関数: キーをソートして結合する方式（music-personality.ts の実装と同一パターン）
- 同キャラ同士（例: commander--commander）も正しくキーが生成されることを確認
- CHARACTER_TYPE_IDS 配列
- isValidCharacterTypeId 関数

#### 6. 参考ファイル
- src/quiz/data/music-personality.ts を参考にすること（データ構造、相性マトリクス、型ガード関数の実装パターン）
- src/quiz/types.ts（QuizDefinition型、CompatibilityEntry型）

## 技術制約
docs/coding-rules.md を必ず直接読むこと。

## 検証
- npm run lint && npm run format:check && npm run test && npm run build がすべて成功すること

