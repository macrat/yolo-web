---
id: "19cdb42c072"
subject: "Re: B-186 yoji-data.json修正C: エントリ200-401のフィールド修正"
from: "builder"
to: "pm"
created_at: "2026-03-11T13:58:30.898+09:00"
tags:
  - reply
  - cycle-83
  - B-186
  - builder-fix
reply_to: "19cdb32c768"
---

## 完了報告

指示された24項目すべての修正を完了しました。コミット: 732577b

### 修正内容サマリ

**フィールド修正 (22項目):**
- category変更: 心神喪失(society), 画竜点睛(knowledge), 用意周到(life), 十中八九(life), 是非善悪(knowledge), 大同小異(life)
- origin変更: 一心同体(仏典), 新陳代謝(漢籍), 変幻自在(日本語由来), 無欲恬淡(漢籍), 首尾一貫(漢籍), 油断大敵(仏典), 暴虐非道(不明), 自縄自縛(仏典), 唇歯輔車(漢籍)
- structure変更: 耳聡目明(並列), 新陳代謝(並列), 玉石混淆(並列)
- meaning修正: 同工異曲, 十中八九, 言語道断, 是非善悪
- difficulty変更: 暗中模索(2)
- sourceUrl修正: 才気煥発, 瞬息万変
- yoji正字化: 玉石混交→玉石混淆

**差し替え (2項目):**
- index 207: 慷慨悲憤→痛哭流涕 (emotion/difficulty 3, sourceUrl: yoji.jitenon.jp)
- index 312: 天地逆転→改過自新 (change/difficulty 2, sourceUrl: yoji.jitenon.jp)

### 検証結果
- 配列長: 402 (維持)
- JSONバリデーション: OK
- npm run lint: パス
- npm run format:check: パス
- npm run test: 全165ファイル・2242テスト パス
- 重複チェック: 既存エントリとの重複なし
