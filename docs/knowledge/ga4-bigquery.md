# GA4 × BigQuery の知見

`analytics_524708437.events_*`（GA4 BigQuery エクスポート）を読むときの、繰り返し効く注意点。
Search Console 側の知見は `search-console-bigquery.md` にある。
`engagement_time_msec` の読み方（セッション合計であり局面の滞在ではない）は `2026-07-12-research-and-verification-techniques.md` の「GA4 の『エンゲージ秒』はセッション合計であり、面ごとの滞在ではない」にある。

## `session_engaged` は「イベント単位」に刻まれる。集計単位を言わずに engaged を語ってはいけない

同じ窓・同じデータでも、数え方で値がまったく変わる。

| 数え方                                                | 意味                                             |
| ----------------------------------------------------- | ------------------------------------------------ |
| `page_view` 行の `session_engaged='1'` を数える       | `scripts/analytics-report.ts` の `engaged_pv` 列 |
| `MAX(IF(session_engaged='1',1,0))` でセッションに畳む | GA4 UI の「エンゲージメント率」に近い            |

**実測例（2026-08）**: 全数列挙型のクローラは `page_view` 行では**全件 `'0'`**（`engaged_pv` に1件も乗らない）が、`MAX()` で畳むと**93.5% がエンゲージ判定**になる。`'1'` が付いていたのは後続の `user_engagement`（3,424件中3,287）・`scroll`（2,115件中1,966）で、`page_view` / `first_visit` / `session_start` には0件だった。

- **セッション単位のエンゲージメント率はボットで水増しされる。** しかも「良い方向」に壊れるので気づきにくい。**AP-P26 の点検を「セッションに `user_engagement` があるか」で行うと、この型のボットは全部通る。**
- **`page_view` 単位の `engaged_pv` はこの型のボットを落とせた。ただし「列が強い」からではない。** 落とせたのは**このクローラが1セッションにつき `page_view` を1発しか撃たなかったから**（3,608セッション中3,601がちょうど1PV）。engagement 自体は `scroll` で積算されているので、**2発目以降の `page_view` を撃つクローラなら素通りする。** 恒久の防御と見なさないこと。
- **`engaged_pv` は「人間の需要に比例する列」でもない。** 2026-08 の実測で、人間の生 PV に対する捕捉率が面によって 12.5%〜68.5% と 5.5倍 開いた。面をまたいで大小を比べる用途には使えない。

## IP / ASN / ネットワーク事業者の列は存在しない

`INFORMATION_SCHEMA.COLUMNS` を `%ip%` / `%asn%` / `%network%` / `%domain%` で引いて0行。したがって GA4 単体で「データセンター由来」「特定の事業者から」は**主張できない**。言えるのは行動パターンから導く「実在の来訪トラフィックではない」まで。ホスティング事業者の特定にはサーバ／CDN のアクセスログという別の計器が要る。

## `CONCAT(user_pseudo_id, '.', ga_session_id)` は NULL 崩壊する

どちらかが NULL だとセッションキー全体が NULL になり、静かにセッションが消える。セッション数を語る前に両方の NULL 件数を数えること。`session_start` のイベント数と突き合わせるのも有効（ただし1セッションが `session_start` を0個や2個持つことがあるので、完全一致は期待しないこと）。

## 1セッションが複数国のイベントを持つ

素朴な `GROUP BY geo.country` は同じセッションを複数国に二重計上する。国別はセッション単位に畳んでから帰属させること（`ARRAY_AGG(country ORDER BY event_timestamp LIMIT 1)[OFFSET(0)]`）。

副次的に現れる国は `session_start` も `page_view` も0件の「セッション途中の IP ローテーション断片」であることが多く、実在の流入ではない。**割合は状況で大きく動く**（2026-08 の実測で、窓を1日ずらすだけで 18.5% → 66.6%）ので、率を引用するときは必ず窓とセットで書くこと。

## `device.browser` は全件 NULL。正しくは `device.web_info.browser`

cycle-302 で判明。**なお `.claude/skills/analyze-bigquery/reference/ga4.md` は現在も `device | RECORD | category, operating_system, browser, etc.` と書いており、`web_info.browser` に触れていない。** 参照文書を読んだだけでは同じ穴に落ちる。

## `sitemap.xml` の件数はサイトの総 URL 数ではない

`src/app/sitemap.ts` は kanji / yoji の個別ページを列挙しない（動的ルート）。実 URL 数は sitemap の件数より大幅に多い。「sitemap より多くのパスが踏まれている＝架空の URL を叩いている」と読むと誤る。件数は都度実測すること。

## ボットを疑うときに見る軸

`engaged` 以外に、次の軸が実際に効いた（2026-08）。

- 国・地域の偏り（セッション単位に畳んでから）
- OS / `device.web_info.browser` / チャネルの指紋の集中度
- PV/セッション（全数列挙型は 1.00 に貼り付く）
- **踏まれた distinct パス数を、サイトの実 URL 数と比べる**（全数列挙なら同オーダーになり、1パスあたりの PV が 1 に近づく）
