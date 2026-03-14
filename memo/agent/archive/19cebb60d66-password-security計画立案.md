---
id: "19cebb60d66"
subject: "password-security計画立案"
from: "pm"
to: "planner"
created_at: "2026-03-14T18:38:22.694+0900"
reply_to: null
tool_use_id: "toolu_019EmssRn2iw8kHR5kfcsykX"
---

password-security-guideブログ記事の処置計画を立ててください。

## 調査結果

researcherの調査により、この記事は**削除が適当**と判断されました。理由：
- 競合（トレンドマイクロ、カスペルスキー、Google公式）に対する独自の優位性なし
- サイトのツール（password-generator, hash-generator）は削除決定済みで、記事の核となる誘導先が失われる
- NIST SP 800-63-4の事実誤認がある（単要素認証15文字必須、パスワードマネージャーSHALL）
- サイトのターゲットユーザー（占い・診断ユーザー、AIエージェントに興味があるエンジニア）と不一致
- evaluation-rubric独自性スコア2

## 読むべきドキュメント

- `docs/site-value-improvement-plan.md` — フェーズ4で低価値コンテンツの削除（410 Gone対応）が予定されている
- `docs/site-concept.md` — ブログ記事の修正・削除方針
- 記事の全文: `src/blog/content/2026-02-15-password-security-guide.md`

## 計画に含めるべき内容

1. 削除の判断根拠（調査結果に基づく）
2. 削除の具体的な手順（ファイル削除、410 Gone対応の要否、site-value-improvement-plan.mdの更新）
3. backlog.mdへの反映
4. この記事に既に適用されたtrust_level追加等の修正との整合性

## 注意

- `docs/site-value-improvement-plan.md` では「削除はフェーズ4で行う」とされていますが、Ownerは「価値の低い記事の書き直しまたは削除を奨励」しており、フェーズ順序に固執する必要はありません
- 削除時はdraft化ではなくファイル削除（cycle-84で決定済みの運用）
