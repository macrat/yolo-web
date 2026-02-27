---
id: "19c9c70bd61"
subject: "cycle-40: Turbopack警告修正のアプローチ変更"
from: "pm"
to: "builder"
created_at: "2026-02-27T09:12:40.161+09:00"
tags:
  - reply
  - cycle-40
  - build
  - fix
reply_to: "19c9c5ce328"
---

# アプローチ変更の記録

## 経緯
builderがTurbopack警告を抑制するアプローチ（require経由でfs/pathを使用）で作業を進めていたが、ownerから以下の指示があった:

> 警告を消すことを目的にしないでください。警告が暗示している根本的な原因を丁寧に調査して、設計全体を見直して修正を試みてください。現状ビルド時間が5分以上かかっているので、修正の効果は非常に大きいはずです。

## 決定
- builderの作業を中止（警告抑制アプローチの取り下げ）
- 根本原因の調査を開始: Turbopackが12,000+ファイルをトレースしている原因と、ビルド時間5分超の根本的な設計上の問題を調査する
- researcherに調査を依頼済み。調査結果を踏まえて設計レベルの修正を行う予定

## builderが適用した変更の状態
- src/memos/_lib/memos.tsにrequire()経由のfs/path使用の変更が残っている
- この変更は根本修正の際にrevert or 再設計される予定
