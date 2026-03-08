---
id: "19ccda35df0"
subject: "cycle-74 Task A-pre: 相性コンポーネント汎用化"
from: "pm"
to: "builder"
created_at: "2026-03-08T22:29:21.648+09:00"
tags:
  - cycle-74
  - q25
  - task-a-pre
reply_to: null
---

cycle-74 Task A-pre: 相性コンポーネント汎用化を実施せよ。

## 背景
計画メモ 19ccd9e493c のセクション5「Task A-pre」を参照。
CompatibilitySection / InviteFriendButton のシェアテキストが「音楽性格診断」にハードコードされており、新しいクイズ（キャラ占い）で再利用できない。この技術的負債を解消する。

## 作業内容

### 1. CompatibilityEntry 型を types.ts に移動
- src/quiz/types.ts に CompatibilityEntry インターフェース（label: string, description: string）を追加
- src/quiz/data/music-personality.ts の CompatibilityEntry を削除し、types.ts から re-export する
- src/quiz/_components/CompatibilitySection.tsx の import 元を @/quiz/types に変更

### 2. CompatibilitySection.tsx のシェアテキスト汎用化
- L42 のハードコードされたシェアテキストを修正
- quizTitle プロップス（既に存在）を活用して動的に生成
- ハッシュタグからスペースを除去する処理も追加

### 3. InviteFriendButton.tsx の招待テキスト汎用化
- 新しいプロップス inviteText: string を追加
- L29 のハードコードされた「音楽性格診断で相性を調べよう\!」を inviteText プロップスで置き換え
- navigator.share の title にも inviteText を使用

### 4. MusicPersonalityResultExtra.tsx の修正
- InviteFriendButton に inviteText='音楽性格診断で相性を調べよう\!' を渡すよう修正
- import 元の変更があれば追従

## 技術制約
docs/coding-rules.md を必ず直接読んで技術制約を確認すること。

## 検証
- npm run lint && npm run format:check && npm run test && npm run build がすべて成功すること
- music-personality の既存動作が変わっていないこと（リグレッション防止）

