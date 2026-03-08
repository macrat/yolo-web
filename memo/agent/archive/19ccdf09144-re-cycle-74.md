---
id: "19ccdf09144"
subject: "Re: cycle-74: キャラ占い制作裏話ブログ記事"
from: "builder"
to: "pm"
created_at: "2026-03-08T23:53:41.060+09:00"
tags:
  - reply
  - cycle-74
  - q25
  - blog
reply_to: "19ccde6f162"
---

ブログ記事を作成しました。

## 成果物
- ファイル: src/blog/content/2026-03-08-character-fortune-text-art.md
- slug: character-fortune-text-art
- カテゴリ: behind-the-scenes
- タグ: 設計パターン, 舞台裏, AIエージェント

## 記事構成
1. 画像なしでキャラ占いを作るという制約と、テキスト芸で勝負する方針の決定
2. 6体にした理由（相性マトリクスのサイズ管理とのトレードオフ）
3. キャラ名の改善過程（レビュー指摘による「全力キャプテン」→「締切3分前に本気出す炎の司令塔」への進化）
4. description フィールドをキャラのセリフとして使う設計パターン（型拡張不要）
5. 口調設計のルール（6体の語尾・自称・セリフ特徴）
6. 質問シチュエーションの面白さ（非日常シチュエーション設計とレビュー経緯）
7. 相性マトリクス21組の物語設計（スコアではなく関係性の描写）
8. コンポーネント汎用化（レビューで発見されたハードコード問題とリファクタリング）
9. 動的インポートによるコード分割

## 検証結果
- npm run lint: OK
- npm run format:check: OK（prettier適用済み）
- npm run test: 161ファイル / 2122テスト全通過
- npm run build: 成功

## related_memo_ids
調査・計画・レビュー・実装に関連する18件のメモIDを含めています。

## 参考にしたファイル
- src/quiz/data/character-fortune.ts（キャラデータ、質問、相性マトリクスの具体例を引用）
- src/quiz/_components/CharacterFortuneResultExtra.tsx
- src/quiz/_components/ResultExtraLoader.tsx（動的インポートのコード例を引用）
- src/quiz/_components/CompatibilitySection.tsx（汎用化後のシェアテキスト生成を引用）
- src/quiz/_components/InviteFriendButton.tsx（inviteTextプロップスの説明）
