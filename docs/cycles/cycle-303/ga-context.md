# cycle-303 の計画根拠となった GA4 実測（一次証拠）

> 判断の一次証拠を git 管理外（`tmp/`）に置かないため、サイクルディレクトリに保存する。
> 取得: 2026-08-09。データソース: BigQuery GA4 `yolo-web-gcp.analytics_524708437.events_*`。
> 集計期間（直近28日・連続）: **2026-07-11 〜 2026-08-07**（`_TABLE_SUFFIX BETWEEN '20260711' AND '20260807'`）。
> セッション定義: `user_pseudo_id` + `ga_session_id`（`ga_session_id IS NOT NULL`）で1セッション。国はセッション内 `MAX(geo.country)` で確定。

## ボット塊（シンガポール）の扱い

`geo.country='Singapore'` の塊が存在（全数 Direct・ほぼ全 desktop・辞典クロール署名・city 空欄・平均PV1.0）。過去サイクル（cycle-302 review-log・B-635 起票）と整合。**除外前/除外後を併記**する。

| 指標       | 除外前(全体) | シンガポール(除外対象) | 除外後(非SG) |
| ---------- | ------------ | ---------------------- | ------------ |
| セッション | 4,939        | 2,649 (53.6%)          | 2,290        |
| pageviews  | 5,449        | 2,648                  | 2,801        |

- 8/6 に page_view が 3,135 のスパイク（うち SG 3,021 / Japan 109）＝ほぼ全て SG ボット由来。
- 注: `geo.country` を event 単位や null-session を含めて数えると SG 比率は最大72.7%まで振れる。上表はセッション定義を統一した確定値。

## 1. セクション別（page_location 第1階層）※ sessions・engaged・平均engage秒は全体（除外前）値

| セクション         | PV(全体) | PV(除外後) | PV(SG) | sessions | engaged | 平均engage秒/session |
| ------------------ | -------- | ---------- | ------ | -------- | ------- | -------------------- |
| 診断 `/play`       | 1,408    | **1,385**  | 23     | 1,061    | 174     | **136.7**            |
| 辞典 `/dictionary` | 3,542    | 1,133      | 2,409  | 3,432    | 25      | 19.6                 |
| ブログ `/blog`     | 341      | 177        | 164    | 299      | 29      | 20.4                 |
| ツール `/tools`    | 89       | 40         | 49     | 82       | 8       | 24.0                 |
| トップ `/`         | 61       | 59         | 2      | 56       | 9       | 6.0                  |
| その他             | 8        | 7          | 1      | 7        | 6       | 28.1                 |

**要点**: 診断はボット混入ほぼゼロ（SG 23）で、平均エンゲージ 136.7秒/セッションが他を圧倒。辞典 PV の約68%が SG 由来。

## 2. pageviews 上位ページ（全体・除外前）— 診断部分の抜粋

| #   | path                         | PV     |
| --- | ---------------------------- | ------ |
| 1   | /play/character-personality  | 1,132  |
| 3   | /play/word-sense-personality | **53** |
| 7   | /play/music-personality      | 31     |
| 12  | /play/traditional-color      | 14     |
| 13  | /play/character-fortune      | 14     |
| 14  | /play/yoji-personality       | 12     |
| 15  | /play/science-thinking       | 10     |
| 17  | /play/japanese-culture       | 9      |
| 18  | /play/yoji-level             | 8      |

**要点**: character-personality（cycle-295 で結果先行是正済み）が断トツ1位。**次いで word-sense-personality（53 PV）が診断内で最も見られている未是正の personality 診断**。cycle-297 triage の優先順（word-sense→music→…）とも一致。

## 3. 流入チャネル・デバイス（除外後・非SG）

- チャネル: Organic Search 1,245（google 1,038 / bing 101 / yahoo 98 / openai 9）／ Direct 1,036 ／ Referral 9。SG は全数 Direct。
- デバイス: desktop 55.1% / mobile 43.0% / tablet 1.8%。

## SQL（全文）

主要な2本を全文で残す。残りは取得時の `tmp/*.sql`（`sec.sql`=セクション別・`top.sql`=上位ページ・`chan2.sql`=チャネル・`dev2.sql`=デバイス・`geoc2.sql`=国別・`split.sql`=SG除外前後・`spike.sql`=日次スパイク・`final.sql`=総計）に対応。

### セクション別（sec.sql）

```sql
WITH base AS (
  SELECT
    user_pseudo_id,
    (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS sid,
    event_name,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='session_engaged') AS eng,
    (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='engagement_time_msec') AS etime,
    REGEXP_REPLACE(REGEXP_REPLACE((SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='page_location'), r'https?://[^/]+',''), r'[?#].*$','') AS path
  FROM `analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260711' AND '20260807'
),
labeled AS (
  SELECT *,
    CASE
      WHEN path LIKE '/blog%' THEN '1 ブログ /blog'
      WHEN path LIKE '/play%' THEN '2 診断 /play'
      WHEN path LIKE '/dictionary%' THEN '3 辞典 /dictionary'
      WHEN path LIKE '/tools%' THEN '4 ツール /tools'
      WHEN path='/' OR path='' THEN '5 トップ /'
      ELSE '6 その他'
    END AS section
  FROM base
)
SELECT
  section,
  COUNTIF(event_name='page_view') AS pageviews,
  COUNT(DISTINCT IF(event_name='page_view', FORMAT('%s-%d', user_pseudo_id, sid), NULL)) AS sessions,
  COUNT(DISTINCT IF(event_name='page_view' AND eng='1', FORMAT('%s-%d', user_pseudo_id, sid), NULL)) AS engaged_sessions,
  ROUND(SUM(etime)/1000/NULLIF(COUNT(DISTINCT FORMAT('%s-%d', user_pseudo_id, sid)),0),1) AS avg_eng_sec_per_session
FROM labeled
GROUP BY section
ORDER BY section
```

### 総計・SG除外前後（final.sql）

```sql
WITH ev AS (
  SELECT
    user_pseudo_id,
    (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS sid,
    event_name, geo.country AS country, device.category AS device,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='session_engaged') AS eng,
    COALESCE(collected_traffic_source.manual_medium, traffic_source.medium) AS med,
    COALESCE(collected_traffic_source.manual_source, traffic_source.source) AS src,
    REGEXP_REPLACE(REGEXP_REPLACE((SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='page_location'), r'https?://[^/]+',''), r'[?#].*$','') AS path
  FROM `analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260711' AND '20260807'
),
sess AS (
  SELECT user_pseudo_id, sid,
    MAX(country) AS country, MAX(device) AS device, MAX(eng) AS eng,
    MAX(med) AS med, MAX(src) AS src
  FROM ev WHERE sid IS NOT NULL GROUP BY user_pseudo_id, sid
)
SELECT
  'TOTALS' AS metric,
  COUNT(*) AS all_sessions,
  COUNTIF(country='Singapore') AS sg_sessions,
  COUNTIF(country!='Singapore' OR country IS NULL) AS nonsg_sessions,
  ROUND(100*COUNTIF(country='Singapore')/COUNT(*),1) AS sg_pct,
  COUNTIF(eng='1') AS engaged_all,
  COUNTIF(eng='1' AND (country!='Singapore' OR country IS NULL)) AS engaged_nonsg
FROM sess
```
