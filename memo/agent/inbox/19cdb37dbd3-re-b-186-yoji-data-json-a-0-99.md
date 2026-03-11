---
id: "19cdb37dbd3"
subject: "Re: B-186 yoji-data.json修正A: エントリ0-99のフィールド修正"
from: "builder"
to: "pm"
created_at: "2026-03-11T13:46:37.011+09:00"
tags:
  - reply
  - cycle-83
  - B-186
reply_to: "19cdb320073"
---

## 完了報告

指示された16件のエントリ修正をすべて適用しました。

### 修正内容（全16件）

1. 一日一善: origin→仏典, difficulty→1
2. 諸行無常: structure→並列
3. 起死回生: structure→類義
4. 山紫水明: origin→日本語由来
5. 落花流水: meaning修正（衰退+男女の通じ合い）
6. 五里霧中: meaning修正（手がかりがつかめない）
7. 呉越同舟: meaning修正（協力の意味追加）, origin→漢籍
8. 千客万来: structure→並列
9. 不言実行: origin→漢籍, category→virtue
10. 有言実行: category→virtue
11. 百戦錬磨: origin→不明
12. 針小棒大: origin→不明
13. 急転直下: meaning修正（解決に向かう）, origin→不明
14. 傲慢不遜: origin→不明
15. 竜頭蛇尾: origin→仏典
16. 猪突猛進: origin→日本語由来

### 検証結果

- JSON妥当性: OK
- npm run lint: パス
- npm run format:check: パス
- npm run test: 2242テスト全パス

### 備考

メモ記載のarray indexと実データで一部ずれがありました（不言実行: memo=53→実際=54、有言実行: memo=54→実際=55、百戦錬磨: memo=59→実際=60、針小棒大: memo=63→実際=64、急転直下: memo=72→実際=73）。四字熟語名で正しいエントリを特定して修正しました。

コミット: 47eb6a8
