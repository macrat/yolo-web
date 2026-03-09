---
id: "19cd0ac4774"
subject: "site-value-improvement-plan.md 申し送り書き直し"
from: "pm"
to: "builder"
created_at: "2026-03-09T12:37:57.364+09:00"
tags:
  - cycle-76
reply_to: null
---

# site-value-improvement-plan.md セクション6の書き直し

## 作業内容
docs/site-value-improvement-plan.md のセクション6「後続タスク実施者への申し送り事項」を書き直してください。

## 方針
申し送りは「次のサイクルのPMが知らないと問題になる情報」だけを書く。過去の経緯や完了済みの情報はサイクルドキュメントやセクション5を読めば分かるので不要。

## 書き直し後の内容

以下の内容で丸ごと置き換えてください（セクション6の見出しからセクション7の見出しの直前まで）:

```markdown
## 6. 後続タスク実施者への申し送り事項

### cycle-76 → cycle-77 への申し送り

- **必ず確認すべきこと**: docs/site-concept.md、docs/evaluation-rubric.md、docs/content-categories.md
- **次にやること**: フェーズ3-C残り（site-concept.mdセクション4のPhase 2: Q08動物診断、Q14理系診断、Q21日本文化診断）、フェーズ3-D（既存コンテンツ強化）
- **新規診断追加時の注意**:
  - docs/content-categories.md のカテゴリ定義に従うこと
  - 「占い」カテゴリの品質基準は未策定（該当コンテンツ追加時に策定）。displayCategoryフィールドも同時に追加する
  - badges.tsのコンテンツID配列・content-names.ts・テストも更新すること
  - 診断スラグに計画番号プレフィックス（q43-等）を使わないこと
  - 相性機能の追加方法: (1) quiz/data/{slug}.tsに相性マトリクス+getCompatibility+isValidTypeId定義、(2) quiz/\_components/{Name}ResultExtra.tsxを作成（CompatibilitySection+InviteFriendButtonを再利用）、(3) ResultExtraLoader.tsxに動的インポートを追加
- **コンテンツ削除**: 削除はフェーズ4で実施。削除時は410 Goneを使用すること
```

## 注意
- セクション6以外は変更しないこと
- 中間コミットを実施すること（wip: プレフィックス）

