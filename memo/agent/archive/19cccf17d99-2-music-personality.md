---
id: "19cccf17d99"
subject: "タスク2: 音楽性格診断（music-personality）の実装"
from: "pm"
to: "builder"
created_at: "2026-03-08T19:15:04.345+09:00"
tags:
  - cycle-73
  - q01
reply_to: null
---

音楽性格診断の実装を依頼する。

## 参照メモ（必読）
- 19ccce157ba: 元の実装計画（コンテンツデータ全文含む）
- 19ccce9d9e4: 修正済み計画（ポイント配分修正、スラグ修正、相性テキスト改善等）
- 19ccced87ae: 再レビュー結果（A評価、注意事項含む）

上記3つのメモを順番に読み、計画に従って実装すること。
修正済み計画（19ccce9d9e4）に記載された変更は、元の計画（19ccce157ba）に上書きして適用すること。

## 重要な注意事項
- **スラグは music-personality**（q01-は付けない。Ownerの明示的な指示）
- 技術制約は .claude/rules/coding-rules.md を直接読むこと
- 既存のクイズフレームワーク（src/quiz/types.ts, src/quiz/_components/）を活用すること
- 既存のQ43系診断の実装パターン（src/quiz/data/contrarian-fortune.ts 等）を参考にすること
  - ※注: Q43スラグ修正タスクが並行で実行中のため、ファイルが q43-contrarian-fortune.ts のままの可能性あり。その場合もパターンの参考にはなる
- badges.tsへのコンテンツID追加（"quiz-music-personality"）も含むこと
- registryへの登録も含むこと

## 実装スコープ
1. **データファイル**: src/quiz/data/music-personality.ts
   - QuizDefinition（メタ情報、10問の質問、8タイプの結果）
   - 相性マトリクス（36通り）+ getCompatibility関数
2. **相性UIコンポーネント**: src/quiz/_components/CompatibilitySection.tsx + CSS
3. **友達招待ボタン**: src/quiz/_components/InviteFriendButton.tsx + CSS
4. **QuizContainer拡張**: resultExtra prop（または同等の汎用的な仕組み）を追加
5. **ページ側の相性連携**: /quiz/[slug]/page.tsx でsearchParamsのrefを処理
6. **結果ページの相性表示**: /quiz/[slug]/result/[resultId]ページで相性パラメータ対応
7. **OGP画像**: 個人結果OGP + 相性結果OGP（動的生成推奨）
8. **badges.ts**: コンテンツID追加
9. **registry.ts**: 登録追加
10. **テスト**: ポイント集計、相性マトリクス、タイプ偏りチェック

## 完了条件
- npm run lint && npm run format:check && npm run test && npm run build がすべて成功すること
- /quiz/music-personality にアクセスして診断が正常に動作すること
- 相性機能（?ref=typeId）が正常に動作すること
- 全8タイプの結果ページが表示されること

