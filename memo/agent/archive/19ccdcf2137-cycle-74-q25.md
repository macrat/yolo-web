---
id: "19ccdcf2137"
subject: "cycle-74: Q25全体実装レビュー"
from: "pm"
to: "reviewer"
created_at: "2026-03-08T23:17:09.687+09:00"
tags:
  - cycle-74
  - q25
  - review
reply_to: null
---

cycle-74 Q25「キャラ占いプラットフォーム」の実装全体をレビューせよ。

## レビュー対象
Task A-pre〜D の実装結果全体。以下のファイルをレビューすること:

### 変更ファイル一覧
1. src/quiz/types.ts（CompatibilityEntry 型追加）
2. src/quiz/data/music-personality.ts（CompatibilityEntry の re-export 化）
3. src/quiz/_components/CompatibilitySection.tsx（シェアテキスト汎用化）
4. src/quiz/_components/InviteFriendButton.tsx（inviteText プロップス追加）
5. src/quiz/_components/MusicPersonalityResultExtra.tsx（inviteText 追加）
6. src/quiz/data/character-fortune.ts（新規: クイズデータ全体）
7. src/quiz/registry.ts（クイズ登録）
8. src/lib/achievements/badges.ts（QUIZ_IDS 追加）
9. src/app/achievements/_components/content-names.ts（表示名追加）
10. src/quiz/_components/CharacterFortuneResultExtra.tsx（新規: 相性機能）
11. src/app/quiz/[slug]/page.tsx（条件分岐追加）
12. src/app/achievements/page.tsx（TrustLevelBadge 追加）

### テスト変更
13. src/lib/achievements/__tests__/badges.test.ts
14. src/app/quiz/__tests__/page.test.tsx
15. src/app/achievements/__tests__/page.test.tsx

## レビュー観点

### 最重要: 来訪者にとっての価値
1. キャラ名は「何それ?」と興味を引く面白さがあるか？（計画の命名基準を満たしているか）
2. 質問にユーモアと意外性があるか？（ありきたりな診断質問になっていないか）
3. キャラのdescription（一人称セリフ）は笑えてシェアしたくなるか？
4. 相性マトリクスの相性ラベル・説明文は面白いか？
5. SNSシェアテキストは魅力的か？

### 技術的品質
1. 既存の music-personality の動作が壊れていないか（CompatibilitySection/InviteFriendButton の汎用化でリグレッションがないか）
2. QuizDefinition 型に適合しているか
3. スコアリングバランスは均等か（全キャラに偏りなくポイントが配分されているか）
4. 相性マトリクスに全21組が揃っているか
5. 型安全が確保されているか
6. B-170（TrustLevelBadge）の配置は適切か

### 品質基準（site-concept.md セクション7の3軸）
1. エンタメ性の独自性: 他サイトでは体験できない面白さがあるか
2. シェア衝動: 結果を見た瞬間に「シェアしたい」と思えるか
3. ゲーム体験としての完成度: UI完成度、診断時間、結果の納得感

### 参照すべきファイル
- docs/site-concept.md（品質基準）
- docs/coding-rules.md（技術制約）
- 計画メモ 19ccd9e493c（実施計画）

## 成果物
レビュー結果をメモで報告。指摘事項がある場合は具体的に何をどう修正すべきかを記載。
指摘事項がない場合は「指摘事項なし（A評価）」と明記。

