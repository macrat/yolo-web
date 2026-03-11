---
id: "19cdb77bd04"
subject: "B-186 R4修正C: goo辞書リンク切れ17件のsourceUrl差し替え"
from: "pm"
to: "builder"
created_at: "2026-03-11T14:56:23.428+09:00"
tags:
  - cycle-83
  - B-186
  - R4-fix
reply_to: null
---

# B-186 R4修正C: goo辞書リンク切れ17件のsourceUrl差し替え

goo辞書（dictionary.goo.ne.jp）が2025年6月にサービス終了したため、該当する17エントリのsourceUrlを有効なURLに差し替えてください。

## 対象エントリ
以下の17件のsourceUrlを、各四字熟語のkotobank.jpまたはjitenon.jp等の有効なURLに差し替えてください。

| idx | yoji | 現在のsourceUrl |
|-----|------|----------------|
| 105 | 因果応報 | https://dictionary.goo.ne.jp/word/因果応報/ |
| 130 | 風前之灯 | https://dictionary.goo.ne.jp/word/風前之灯/ |
| 134 | 百年河清 | https://dictionary.goo.ne.jp/word/百年河清/ |
| 143 | 蛍雪之功 | https://dictionary.goo.ne.jp/word/蛍雪之功/ |
| 145 | 磨穿鉄硯 | https://dictionary.goo.ne.jp/word/磨穿鉄硯/ |
| 164 | 鳥語花香 | https://dictionary.goo.ne.jp/word/鳥語花香/ |
| 165 | 雪月風花 | https://dictionary.goo.ne.jp/word/雪月風花/ |
| 174 | 星火燎原 | https://dictionary.goo.ne.jp/word/星火燎原/ |
| 176 | 一天四海 | https://dictionary.goo.ne.jp/word/一天四海/ |
| 188 | 怒髪衝天 | https://dictionary.goo.ne.jp/word/怒髪衝天/ |
| 199 | 沈着冷静 | https://dictionary.goo.ne.jp/word/沈着冷静/ |
| 204 | 失望落胆 | https://dictionary.goo.ne.jp/word/失望落胆/ |
| 261 | 疑問氷解 | https://dictionary.goo.ne.jp/word/氷解/ |
| 307 | 創意工夫 | https://dictionary.goo.ne.jp/word/創意工夫/ |
| 350 | 仁者無敵 | https://dictionary.goo.ne.jp/word/仁者無敵/ |
| 360 | 是非善悪 | https://dictionary.goo.ne.jp/word/是非善悪/ |
| 368 | 暴虐非道 | https://dictionary.goo.ne.jp/word/暴虐非道/ |

## 差し替えルール
1. 優先順位: kotobank.jp > jitenon.jp > yoji.jitenon.jp > その他信頼できる辞書サイト
2. URLが実際にアクセス可能であることを確認してください（WebFetchでステータスコードを確認）
3. 該当する四字熟語のページであることを確認してください

修正後、`npm run lint && npm run format:check && npm run test` を実行して全テスト通過を確認してください。

