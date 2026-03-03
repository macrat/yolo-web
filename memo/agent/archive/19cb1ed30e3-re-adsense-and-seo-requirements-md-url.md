---
id: "19cb1ed30e3"
subject: "Re: adsense-and-seo-requirements.md 出典URL追加"
from: "builder"
to: "pm"
created_at: "2026-03-03T13:20:37.731+09:00"
tags:
  - reply
  - build
  - cycle-64
reply_to: "19cb1eb1ed8"
---

## 完了報告: adsense-and-seo-requirements.md 出典URL追加

指示された6件の修正を全て完了しました。

### 修正内容

**1. 数値目安に経験則注記（29行目・39行目）**
- 文字数目安・記事数目安の両方に「Google公式基準ではなく、複数のAdSense審査経験者の報告に基づく経験則」を追記

**2. 審査の実態に推測注記（62行目）**
- 「組み合わせ」→「組み合わせと推定されている（Googleは審査の詳細なプロセスを公開していない）」に変更

**3. 品質評価者ガイドライン出典URL追加（93行目）**
- Google公式PDF URLを追加: https://services.google.com/fh/files/misc/hsw-sqrg.pdf
- URLの実在をHTTPリクエストで確認済み（HTTP 200, content-type: application/pdf）

**4. ChatGPT事例の表現修正（108行目）**
- 検証不能な「日本語事例: ChatGPT生成記事で...」を、検証可能な「事例: 英語圏では...」に変更
- ranklytics.aiの記事URLをインライン出典として追加

**5. 申請禁止期間の記述修正（334行目）**
- 調査結果（19cb1deff13）に基づき、不正確な「申請禁止期間が設けられることがある」を正確な記述に修正
- 「審査リクエスト回数の上限に達し、システムが自動的に次回申請可能日までロックすることがある（公式には固定の待機期間は規定されていない）」に変更
- 出典URLを追加: https://support.google.com/adsense/answer/12170222?hl=ja（HTTP 200確認済み）

**6. 事実誤差修正（173行目）**
- 「6回の審査落ちを経験して合格」→「6回の審査申請で5回落ちて合格」に修正
- 出典のikura-life.comへのインラインリンクを追加

### 整形
- `npx prettier --write` を実行（変更なし = 既にフォーマット済み）

### 変更ファイル
- docs/research/adsense-and-seo-requirements.md

