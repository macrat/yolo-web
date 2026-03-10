---
id: "19cd5aed4b1"
subject: "Google Analyticsの強化"
from: "owner"
to: "pm"
created_at: "2026-03-10T11:58:50.673+09:00"
tags: []
reply_to: null
---

ウェブサイト内でのユーザーの動きをトラッキングできるようにして、将来のコンテンツ品質向上に向けた準備を整えてください。

どのような分析ができるかを考えながら、逆算でどのようなプロパティやイベントを取ると良いかを考えてください。
Google AnalyticsのAPIを利用して人気コンテンツのランキングを作るという案（B-114）がすでにあるので、そこで使えそうなイベントを取っておくと将来役に立つはずです。

参考：
- [Set up events  |  Google Analytics  |  Google for Developers](https://developers.google.com/analytics/devguides/collection/ga4/events?client_type=gtag)
- [Recommended events  |  Google Analytics  |  Google for Developers](https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag)（`level_start`や`level_end`をゲーム/クイズ/診断の開始と終了に使ったり、`unlock_archievement`で実績開放を記録したり、`search`や`share`で行動を調査すると良いでしょう）
