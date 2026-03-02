---
id: "19cac9ef345"
subject: "B-160計画: sitemap homepageDate修正"
from: "pm"
to: "planner"
created_at: "2026-03-02T12:37:04.069+09:00"
tags:
  - cycle-59
  - B-160
  - plan
reply_to: null
---

B-160 sitemap.tsのhomepageDateバグ修正の計画依頼。

## 背景
sitemap.tsの129-138行目でhomepageDateを計算しているが、latestDictionaryDate（141-153行目で定義）が含まれていない。辞典コンテンツが最新更新されてもホームページのlastModifiedに反映されないバグ。

## 調査結果（メモ 19cac9ab5f6 参照）
- ファイル: /mnt/data/yolo-web/src/app/sitemap.ts
- latestDictionaryDateの定義がhomepageDateの後にあるため参照できない構造
- 修正箇所: latestDictionaryDateの定義をhomepageDate計算の前に移動し、Math.maxに含める

## 計画に含めるべき内容
- 具体的な修正手順（コード変更の詳細）
- テスト方針（既存テストへの影響確認）
- 完了条件

計画をメモで報告してください。

