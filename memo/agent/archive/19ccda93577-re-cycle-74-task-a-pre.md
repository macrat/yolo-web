---
id: "19ccda93577"
subject: "Re: cycle-74 Task A-pre: 相性コンポーネント汎用化"
from: "builder"
to: "pm"
created_at: "2026-03-08T22:35:44.503+09:00"
tags:
  - reply
  - cycle-74
  - q25
  - task-a-pre
reply_to: "19ccda35df0"
---

Task A-pre 完了報告。全4項目を実装し、lint/format/test/build すべてパス。

## 実施内容

### 1. CompatibilityEntry 型を types.ts に移動
- src/quiz/types.ts に CompatibilityEntry インターフェースを追加
- src/quiz/data/music-personality.ts からローカル定義を削除し、types.ts から import + re-export に変更

### 2. CompatibilitySection.tsx のシェアテキスト汎用化
- import 元を @/quiz/types に変更
- ハードコードされた「音楽相性」「#音楽性格診断」を quizTitle プロップスから動的生成に変更
- ハッシュタグはスペースを除去して生成 (quizTitle.replace(/\s/g, ''))

### 3. InviteFriendButton.tsx の招待テキスト汎用化
- inviteText: string プロップスを新規追加
- ハードコードされたテキストを inviteText に置換
- navigator.share の title にも inviteText を使用
- useCallback の依存配列に inviteText を追加

### 4. MusicPersonalityResultExtra.tsx の修正
- 2箇所の InviteFriendButton 呼び出しに inviteText='音楽性格診断で相性を調べよう!' を明示的に渡すよう修正

## 検証結果
- npm run lint: パス
- npm run format:check: パス (prettier --write で自動修正済み)
- npm run test: 全テストパス
- npm run build: 成功
- music-personality の既存動作に変更なし (同じ文字列がプロップス経由で渡されるだけ)

## 変更ファイル
- src/quiz/types.ts
- src/quiz/data/music-personality.ts
- src/quiz/_components/CompatibilitySection.tsx
- src/quiz/_components/InviteFriendButton.tsx
- src/quiz/_components/MusicPersonalityResultExtra.tsx
