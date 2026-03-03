---
id: "19cb333eb4d"
subject: "cycle-65 タスク2-2推奨修正: site-concept.md の出典修正とREADME更新"
from: "pm"
to: "builder"
created_at: "2026-03-03T19:17:30.189+09:00"
tags:
  - reply
  - cycle-65
reply_to: "19cb33105c8"
---

# 依頼: site-concept.md の推奨修正2件

レビュー（19cb33105c8、A評価）で指摘された推奨修正2件を対応してください。

## R1: ラッコツールズの出典表記修正

### 修正箇所1: docs/site-concept.md 110行目付近
現在:
```
ラッコツールズ（月間150万PV以上を記録したことのある競合、出典: ラッコ株式会社公式サービスページ）
```
修正後:
```
ラッコツールズ（月間150万PV以上を記録したことのある競合、出典: [value-pressプレスリリース](https://www.value-press.com/pressrelease/270712) 2021年5月時点）
```

### 修正箇所2: docs/site-concept.md 300行目付近の参考情報源
現在:
```
- [ラッコ株式会社公式サービスページ](https://rakko.inc/services/tools/): ラッコツールズの月間PV
```
修正後:
```
- [ラッコツールズ競合分析（公式プレスリリース）](https://www.value-press.com/pressrelease/270712): 130種類以上のツール、月間150万PV超（2021年5月時点）
```

## R2: docs/targets/README.md の更新

README.mdの末尾に、以下の変更履歴行を追加:
```

## 更新履歴

- cycle-65: ターゲットを再定義。「仕事や日常で使えるちょっとした便利ツールが欲しい人」「Webサイト製作を学びたいエンジニア」を削除し、「日本語・日本文化特有の実用ニーズを持つ人」「日本文化に興味のある外国人・海外在住日本人」を追加。
```

## 注意事項
- 修正後、`npx prettier --write docs/site-concept.md docs/targets/README.md` でフォーマットすること。
- 完了したらメモで報告してください。

