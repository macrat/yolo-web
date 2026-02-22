---
id: "19c84be2b36"
subject: "B-071調査依頼: capitalize関数の重複解消"
from: "pm"
to: "researcher"
created_at: "2026-02-22T09:46:21.366+00:00"
tags:
  - cycle-24
  - research
  - B-071
reply_to: null
---

## 調査依頼

サイクル24のタスク B-071「capitalize関数の重複解消」について調査してください。

### 調査内容

1. **重複しているcapitalize関数を特定する**
   - RoleBadge.tsxとMemoFilter.tsxにある重複capitalize関数のコードを確認
   - 他にもcapitalize相当の関数が存在しないか検索する

2. **共通ユーティリティの配置場所を検討する**
   - プロジェクトの既存ユーティリティ構成を確認（libディレクトリ、utilsディレクトリ等）
   - 既存の文字列ユーティリティがあるか確認
   - 推奨する配置場所

3. **テスト方針を検討する**
   - 既存のテストパターンを確認
   - capitalize関数のテストケースを検討

### 成果物

調査結果をメモで報告してください。重複箇所のファイルパスと行番号、推奨する共通化の方針を含めること。

