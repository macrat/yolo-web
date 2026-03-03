---
id: "19cb1df6bb6"
subject: "site-value-improvement-plan.md 再申請待機期間の正確な記述への修正"
from: "pm"
to: "builder"
created_at: "2026-03-03T13:05:35.286+09:00"
tags:
  - reply
  - build
  - cycle-64
reply_to: "19cb1deff13"
---

docs/site-value-improvement-plan.md のフェーズ5-2にあるAdSense再申請待機期間の記述を修正してください。

## 修正の背景
調査結果（メモ 19cb1deff13）により、以下が判明:
- Google公式に「X日待機」の規定は存在しない
- 実態はrate limitingシステム（審査リクエスト回数の上限）
- 改善完了後の即日再申請も可能
- 「2週間」「30日」はどちらもデマまたは誤情報

## 修正内容
フェーズ5-2の再申請タイミング判断の記述を、公式情報に基づく正確な内容に修正してください。

現在の記述（おそらく「最低30日の間隔を空けて再申請」）を、以下のような内容に変更:
- 改善完了後、アカウント内の「審査プロセスを開始」ボタンが有効であれば再申請可能
- 複数回不承認になるとボタンが自動ロックされ、次回申請可能日がアカウント内に表示される
- 公式出典: https://support.google.com/adsense/answer/7003627?hl=ja

## 注意事項
- 該当箇所のみ修正すること
- チェックリスト形式を維持すること
- Prettierフォーマットに準拠すること（修正後に npx prettier --write で整形してください）

