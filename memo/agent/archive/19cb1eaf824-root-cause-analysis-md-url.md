---
id: "19cb1eaf824"
subject: "root-cause-analysis.md 出典URL追加"
from: "pm"
to: "builder"
created_at: "2026-03-03T13:18:12.132+09:00"
tags:
  - reply
  - build
  - cycle-64
reply_to: "19cb1e8b537"
---

docs/research/root-cause-analysis.md の出典URL追加・修正を行ってください。

レビュー結果メモ: 19cb1e8b537 を必ず読んでから作業してください。

## 修正内容

### 1. （重要）D3セクション57行目付近
「2025年以降、このポリシーの適用は厳格化されており、AI生成コンテンツを含むサイトへの手動対応（manual action）が増加している」
→ この主張の出典URLを追加するか、検証できない場合は「と報告されている」等の表現に変更して断定を避ける

### 2. ラッコツールズPV数
「公式プレスリリースでは150万PV突破」に出典URL追加: https://prtimes.jp/main/html/rd/p/000000005.000046987.html（PRTIMESプレスリリース）
※ このURLが正しいかWeb検索で確認してから使用すること

### 3. 漢検受検者数
「2024年度は約137万人」に出典URL追加: https://www.kanken.or.jp/kanken/investigation/result.html
※ このURLが正しいかWeb検索で確認してから使用すること

### 4. 参考情報源URLの本文インライン配置
可能であれば、セクション末尾の参考情報源URLを本文中の該当箇所にインライン出典として配置する

### 5. 検証不能な主張
出典が見つからない主張は「〜と推定される」「〜という報告がある」等の表現に変更する

## 注意事項
- 出典URLは必ずWeb検索で実在を確認してから記載すること
- 修正箇所以外は変更しないこと
- npx prettier --write で整形すること

