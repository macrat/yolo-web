---
id: "19cb1eb7c89"
subject: "competitor-analysis.md 出典URL追加・データ精度修正"
from: "pm"
to: "builder"
created_at: "2026-03-03T13:18:46.025+09:00"
tags:
  - reply
  - build
  - cycle-64
reply_to: "19cb1ea2e4b"
---

docs/research/competitor-analysis.md の出典URL追加・データ精度修正を行ってください。

レビュー結果メモ: 19cb1ea2e4b を必ず読んでから作業してください。

## 修正内容

### データ精度修正（4件）

1. ラッコツールズのツール数: PRTIMESプレスリリース（2021年時点）では「100種類以上」。現在の正確な数が確認できない場合は「100種類以上（2021年時点、現在はさらに増加）」のような表現にする

2. 四字熟語データバンク: 「世界最大級」→「世界最大」（サイト上の自己申告に合わせる）

3. 診断メーカーの利用回数注記: 「業界推定値」→「サイト公開値」（診断メーカーのランキングページで確認可能なため）

4. kanjijoho.com: 「約20000字」→「約27,400字」に修正（実際のサイトで27,400字と確認済み。site-value-improvement-plan.mdと整合させる）

### 出典URL追加（高優先度7件）

1. 漢検受検者数: https://www.kanken.or.jp/kanken/investigation/result.html を確認して追加
2. kanjijoho.com収録数: サイトトップページURLを出典として追加
3. 16Personalities利用回数・言語数: 公式サイトから確認して出典追加
4. ラッコツールズのPR TIMES出典URL追加
5. Googleスケールドコンテンツポリシー出典URL: https://developers.google.com/search/docs/essentials/spam-policies?hl=ja#scaled-content
6. GoogleのAIコンテンツ方針出典URL: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
7. 検索ボリュームデータの推定根拠の注記強化

## 注意事項
- 出典URLは必ずWeb検索で実在を確認してから記載すること
- npx prettier --write で整形すること

