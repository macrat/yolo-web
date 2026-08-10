# cycle-306 接地(grounding)

来訪前に潜在来訪者が見る「サイトの顔」を来訪者価値から是正するための事実の接地。憶測でなく実測・実見・一次資料。

## 1a. GA4 流入構成(OGPはシェアチャネルとして生きているか)

- 手段: `analyze-bigquery`(BigQuery GA4エクスポート)。対象期間 2026-07-13〜08-10(直近28日)。
- 生値: Direct 3,643(75.2%)/ Organic Search 1,191(24.6%)/ Organic Social 5(0.10%)/ Referral 2(0.04%)。
- **ボット補正(B-635: Direct 3,643の大半がSingapore等DC由来)後の日本・人間近似**: Organic Search 約96.2% / Direct 2.8% / Social 0.4% / Referral 0.16%。
- Referral/SNSシェア経路: t.co(X短縮)28日で **1PVのみ**。はてブ/facebook/直接のx.com=出現なし。
- **結論**: 実トラフィックはほぼ検索経由(≈96%)。**OGPがシェアチャネルとして流入を生む実測はほぼゼロ**(cycle-283の判断が現在も成立)。
  - 効果配分への含意: (i) OGP印の露出はシェア経由でほぼ無い=印の判断はcraft/誠実さの判断であり測定トラフィックの判断ではない(過投資しない)。(ii) **faviconは検索結果に出る=実来訪者の約96%がそこでクリックを判断する高露出の顔**。craftのエネルギーはfaviconへ。

## 1b. 現状の顔の実見(潜在来訪者目線)

- **OGP器面(印=試)** `tmp/cycle-306/ogp-A-current-shi.png`: 紙/墨で上品だが、朱の「試」が唯一の色で視線を集め、副題「実験的Webサイト」と重なって「試作/暫定」の気配を渡す。クリックを迷う人の中身への信頼を静かに削る(cycle-282:125の指摘を実物で確認)。
- **OGP器面(印なし)** `tmp/cycle-306/ogp-B-noseal.png`: 静かで清潔・信頼できる顔。信頼を削る要素なし。やや汎用的(差し色が消える)だが破綻はない。
- **現行favicon** `tmp/cycle-306/favicon-current-grid.png`: 暗地・サンセリフ白y・ドット。16pxで存在感はあるが**紙/墨/明朝の新しい顔と完全に不一致**=検索結果で別サイトの汎用ダークアイコンに見える(旧ブランドの残存・B-576)。

## 1c. 名前の由来・店主張の文言scan(付託(c)(d))

来訪者可視面を横断scan(サブエージェント)。

- **(c) 由来の偽装=1件該当**: `src/app/about/page.tsx:88`「名前の由来」節「よろず——ジャンルを問わず、いろいろなものを扱う**店**、という意味です」。由来語「よろず」(=万事・あらゆるもの)を**店業態として説明=偽装**。公開ブログ `src/blog/content/2026-02-18-site-rename-yolos-net.md` は「よろず=万事・あらゆるもの」と正しく記述しており、**サイト内で矛盾**。→ 是正対象(cycle-283(c)が名指しした「来訪者に由来を偽る」そのもの)。
- **(d) 店フレーミング=2件**: `src/app/page.tsx:198`「店主は人ではなくAIです」、`src/app/about/page.tsx:97`「店の品書きは、大きく四つです」。
  - 判断: site-concept.md:15 が「よろず屋の店主がAIであることは注意書きではなく**個性**」と明記。これらは**オーナー承認の個性**であり自己貶めでも信頼毀損でもない(「試作/見本」の烙印とは質が違う)。→ **維持**(過剰解体を避ける)。
- 該当なしを確認した主要面: ルート共通metadata・Footer・404/410・構造化データ・OGP文言(SHOP_NAME="yolos.net"・「屋/店」の文字はOGPに出ない)。

## 外部仕様の一次資料確認(2026-08-10)

- Googleは検索結果にfaviconを表示(正方形・48×48px以上推奨・保証なし): https://developers.google.com/search/docs/appearance/favicon-in-search
- Next.js App Router(v16.3.0) icon規約: `favicon.ico`は静的ファイル(コード生成不可)、`icon`/`apple-icon`は`next/og`のImageResponse(=OGPと同じSatori技術)でコード生成でき静的最適化される: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
  - 含意: 16-32pxの可読性は別craft(明朝細部は潰れる)=標章は単純・太めに。apple-touch-icon(180)はiOSが全面角丸マスクをかけるため朱を全面ブリードさせるのが良い。
