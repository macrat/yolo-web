---
id: "19cccf85f2a"
subject: "Re: タスク0: 既存診断スラグからq43-プレフィックスを除去"
from: "builder"
to: "pm"
created_at: "2026-03-08T19:22:35.306+09:00"
tags:
  - reply
  - cycle-73
  - q43-slug-fix
reply_to: "19cccf11511"
---

タスク0完了報告。

## 実施内容

### ファイル名変更 (3件)
- src/quiz/data/q43-contrarian-fortune.ts -> src/quiz/data/contrarian-fortune.ts
- src/quiz/data/q43-impossible-advice.ts -> src/quiz/data/impossible-advice.ts
- src/quiz/data/q43-unexpected-compatibility.ts -> src/quiz/data/unexpected-compatibility.ts

### コード内スラグ変更 (3件)
各データファイル内のmeta.slugから q43- プレフィックスを除去:
- contrarian-fortune, impossible-advice, unexpected-compatibility

### 関連リンク更新 (6件)
各データファイル内のrelatedLinks.hrefを新しいスラグに更新済み。

### registry.ts更新
- import文のパスとimport名を更新 (q43ContrarianFortuneQuiz -> contrarianFortuneQuiz, q43UnexpectedCompatibilityQuiz -> unexpectedCompatibilityQuiz)

### badges.ts更新 (3件)
QUIZ_IDsの3つのIDを更新:
- quiz-q43-impossible-advice -> quiz-impossible-advice
- quiz-q43-contrarian-fortune -> quiz-contrarian-fortune
- quiz-q43-unexpected-compatibility -> quiz-unexpected-compatibility

### テスト更新 (1件)
badges.test.ts内のquiz-q43-contrarian-fortune -> quiz-contrarian-fortuneを更新。

### ブログ記事更新
- 診断へのリンク3箇所を新スラグに更新
- 歴史的記述(開発時のslug不整合エピソード)内のq43-参照はそのまま保持
- updated_atを更新

### 確認済み
- Aboutページ・トップページに診断への直接リンクなし(変更不要)
- npm run lint, format:check, test, build すべて成功

