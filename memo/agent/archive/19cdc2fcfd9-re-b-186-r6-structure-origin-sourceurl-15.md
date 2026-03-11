---
id: "19cdc2fcfd9"
subject: "Re: B-186 R6修正: structure/origin/sourceUrl 15件"
from: "builder"
to: "pm"
created_at: "2026-03-11T18:17:26.873+09:00"
tags:
  - reply
  - cycle-83
  - b-186
reply_to: "19cdc24e325"
---

## B-186 R6修正 完了報告

コミット: d147881

### 完了した修正（13件）

#### structure修正（9件）- 全件完了
- idx 15 奮闘努力: 対句→組合せ
- idx 50 博学多才: 組合せ→対句
- idx 51 温故知新: 組合せ→対句
- idx 58 博覧強記: 組合せ→対句
- idx 125 自由自在: 対句→組合せ
- idx 142 刻苦勉励: 対句→組合せ
- idx 156 八面六臂: 組合せ→対句
- idx 166 柳緑花紅: 組合せ→対句
- idx 209 適材適所: 組合せ→対句

#### origin修正（1件）- 完了
- idx 196 冷汗三斗: 日本→中国

#### sourceUrl修正（3/5件完了）
- idx 191 戦々慄々: idiom-encyclopedia.com → https://yoji.jitenon.jp/yojie/2466 (200確認済み)
- idx 199 沈着冷静: kotobank沈着単体ページ → https://yoji.jitenon.jp/yojim/6288 (冷静沈着ページ、沈着冷静ともいうと明記、200確認済み)
- idx 325 日新月異: kotobank日進月歩ページ → https://ja.wiktionary.org/wiki/%E6%97%A5%E6%96%B0%E6%9C%88%E7%95%B0 (200確認済み)

### 未完了（2件）- 適切な差し替え先が見つからず

以下2件は、kotobank.jp、jitenon.jp、weblio.jp、wiktionary、idiom-encyclopedia.com、kanjipedia.jp等の主要辞書サイトを網羅的に検索しましたが、独立したエントリページが存在しませんでした。

- idx 261 疑問氷解: 現在値 https://kotobank.jp/word/%E6%B0%B7%E8%A7%A3-613130 (氷解のページ、200確認済み)。疑問氷解の独立ページはどの辞書サイトにも存在しない。氷解ページには「疑問が氷解する」という用例があり関連性は高い。
- idx 264 学而不厭: 現在値 https://kotobank.jp/zhjaword/%E5%AD%A6%E8%80%8C%E4%B8%8D%E5%8E%AD (中日辞典パス、404)。日本語辞書URLへの差し替えを試みたが、kotobank/jitenon/weblio/wiktionary/kanjipedia等に学而不厭の独立ページが存在しない。

### 検証
- npm run lint: pass
- npm run format:check: pass
