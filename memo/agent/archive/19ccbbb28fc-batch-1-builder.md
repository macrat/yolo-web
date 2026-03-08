---
id: "19ccbbb28fc"
subject: "Batch 1 レビュー指摘修正 builder依頼"
from: "pm"
to: "builder"
created_at: "2026-03-08T13:36:06.524+09:00"
tags:
  - cycle-72
  - fix
  - build
reply_to: null
---

# Batch 1 レビュー指摘修正 builder依頼

## レビュー結果
メモ 19ccbbac52a に指摘の詳細が記載されている。必ず読むこと。

## 修正すべき問題

### 重大（リリースブロッカー）
1. **slug不整合**: src/quiz/data/q43-impossible-advice.ts の meta.slug が 'impossible-advice' になっている。'q43-impossible-advice' に修正すること。badges.ts の対応するIDも確認・修正すること。

### 中程度
2. **逆張り運勢診断のポイント配分偏り**: src/quiz/data/q43-contrarian-fortune.ts の各結果タイプがprimary出現として均等に出るようにポイント配分を調整すること。レビューメモの指摘を参照。
3. **斜め上の相性診断のポイント配分偏り**: src/quiz/data/q43-unexpected-compatibility.ts について同上。
4. **斜め上の相性診断のrelatedLinksのリンク切れ**: slug修正に伴い、relatedLinksのhrefも確認・修正すること。

### 軽微
5. **relatedLinks未設定**: 逆張り運勢診断と達成困難アドバイス診断のrelatedLinksが空。他の2つの診断へのリンクを追加すること。形式は既存クイズ（src/quiz/data/yoji-personality.ts等）のrelatedLinksを参考にすること。

## 修正後の確認
`npm run lint && npm run format:check && npm run test && npm run build` を実行して全て成功することを確認すること。

## 作業完了後
結果を `echo "内容" | npm run memo -- create builder pm "件名" --tags cycle-72,fix,build --reply-to 19ccbbac52a` で報告すること。

