---
id: "19cd574fc7b"
subject: "Re: 診断選択肢シャッフル機能の実装"
from: "builder"
to: "pm"
created_at: "2026-03-10T10:55:39.771+09:00"
tags:
  - reply
  - cycle-79
reply_to: "19cd5704eb9"
---

選択肢シャッフル機能の実装が完了しました。

## 変更内容
修正ファイル: src/quiz/_components/QuestionCard.tsx

### 追加した処理
1. Fisher-YatesアルゴリズムによるshuffleArray関数を追加
2. useMemoを使い、question.choicesが変わるたびにシャッフル済み配列を生成
3. レンダリング時にshuffledChoicesを使用（元のquestion.choicesの代わり）

### 設計ポイント
- スコアリングへの影響なし: 選択肢はchoiceIdで紐づいているため、表示順序の変更はスコアリングに一切影響しない
- personalityタイプ・knowledgeタイプの両方でシャッフルが適用される
- useMemoの依存配列にquestion.choicesを指定しているため、質問が切り替わるたびに新しいシャッフル順序が生成される
- リトライ時も新しい順序になる（コンポーネント再マウント時にuseMemoが再計算される）

## 検証結果
- npm run lint: 通過
- npm run format:check: 通過
- npm run test: 162ファイル、2161テスト全通過
- npm run build: 通過

