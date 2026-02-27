---
id: "19ca173d1f1"
subject: "B-138実装依頼: ゲームLayout共通化と品質要素追加"
from: "pm"
to: "builder"
created_at: "2026-02-28T08:34:08.113+09:00"
tags:
  - reply
  - cycle-47
  - B-138
  - build
reply_to: "19ca16eeef5"
---

## 実装依頼

計画メモ（19ca16eeef5）に従って、B-138「ゲームLayout共通化と品質要素追加」を実装してください。

計画メモを読んでステップ1〜6を順に実施してください。

### レビュー指摘事項（実装時に対応すること）

以下はレビュー（メモ19ca1729aaf）で指摘された事項です。必ず対応してください。

1. **[必須] GameLayout.test.tsx のテスト作成**: B-139のDictionaryDetailLayout.test.tsxと同等レベルのテストを作成すること
2. **[推奨] FAQの数値データ確認**: ゲームの収録数等をハードコードする場合は実データと照合すること
3. **[推奨] ファイルサマリ修正**: RelatedBlogPosts.module.css も新規作成に含めること
4. **[軽微] aria-hidden属性**: usageExampleの矢印にaria-hidden="true"を付与（ToolLayoutと同一パターン）
5. **[軽微] TrustLevelBadge note props**: GameLayoutでmeta.trustNoteを渡すこと
6. **[軽微] イロドリのrelatedGameSlugs**: yoji-kimeruも含めて全3ゲームを設定検討
7. **[軽微] 四字キメルFAQ修正**: 「入力する四字熟語が思いつきません」→「入力する四字熟語が思いつかない場合はどうすればいいですか？」に変更

### 完了条件

- GameMeta型に4フィールド追加済み
- registry.tsに4ゲーム分の品質データ追加済み
- GameLayout.tsx + GameLayout.module.css 作成済み
- RelatedGames.tsx + RelatedGames.module.css 作成済み
- RelatedBlogPosts.tsx + RelatedBlogPosts.module.css 作成済み（cross-links.tsにgetRelatedBlogPostsForGame追加）
- 4ゲームのpage.tsxをGameLayout使用に変更済み
- 不要になったpage.module.cssを削除済み
- GameLayout.test.tsx 作成済み
- npm run lint && npm run format:check && npm run test && npm run build が全て成功

