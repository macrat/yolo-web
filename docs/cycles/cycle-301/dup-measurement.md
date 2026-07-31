# イベント二重発火の BigQuery 測定記録（cycle-301・2026-07-31 実施）

このファイルは、`docs/ADR/open/2026-08-10-ADR001-サイト刷新/index.md` の §(b-1) と §(c) が根拠にしている
BigQuery 測定の**クエリ本文・窓・数値・定義**を、git 追跡下に保全するための記録である。

- 実行日: 2026-07-31
- 実行手段: BigQuery（プロジェクト `yolo-web-gcp` / データセット `analytics_524708437` / テーブル `events_*`）
- 元のクエリ置き場: `tmp/dupmeasure/*.sql`（`.gitignore` の `tmp/*` により**追跡外**）。本ファイルに全文を転記してある。
- **このファイルは測定の記録であり、解釈・提言は書かない。** 解釈は ADR 側にある。

---

## 0. 用語と共通の定義

以降のすべての数値は、次の定義に従う。読む前に必ずここを読むこと。

| 語                            | 定義                                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **セッション（`sid`）**       | `CONCAT(user_pseudo_id, '\|', ga_session_id)`（`\|` はパイプ文字1個）。GA4 のセッション単位。                                                                            |
| **セッション×コンテンツの組** | `(sid, content_id)` の相異なる組。**1人の1セッション内で同じクイズを何度リトライしても 1 組に畳み込まれる。**                                                            |
| **連続ペア**                  | 同一の `(sid, content_id)` 内で時刻順に並べたイベント列の、隣り合う2件。`LAG(ts) OVER (PARTITION BY sid, content_id ORDER BY ts)`。n 件のイベントからは n-1 ペアが出る。 |
| **間隔（gap）**               | 連続ペアの後件と前件の `event_timestamp` の差。BigQuery の `event_timestamp` はマイクロ秒。本記録では秒に換算して書く。                                                  |
| **スコープ**                  | `content_id LIKE 'quiz-%'`。`src/play/quiz/registry.ts` の `quizEntries` **全15本**が対象で、特定の1本に絞っていない。                                                   |
| **run**                       | 1回のクイズ通しプレイ。**本ファイルの測定1・測定2はどちらも run 単位ではない**（§5 参照）。                                                                              |

### `_TABLE_SUFFIX` は JST の暦日である

`events_YYYYMMDD` の `YYYYMMDD`（= `_TABLE_SUFFIX`）は **GA4 プロパティのタイムゾーンである JST の暦日**であり、UTC の暦日ではない。
これは `m0_sanity.sql`（§1）で、窓内の各日についてテーブルが存在すること・`min_ts_utc` / `max_ts_utc` が
JST 暦日の境界（前日 15:00:00 UTC 〜 当日 14:59:59 UTC）に収まることを確認して確定させた。

したがって本ファイルに現れる `20260615` 等の日付は**すべて JST の暦日**である。
（`m0_sanity.sql` の日別出力そのものは転記していない。§1 の SQL をそのまま再実行すれば再現できる。）

---

## 1. M0: sanity（窓の健全性とタイムゾーンの確認）

**目的**: 窓 JST 20260615〜20260730 に日次テーブルが欠けていないこと、`quiz-%` のイベントが存在すること、
`_TABLE_SUFFIX` が JST 暦日であることの確認。

```sql
-- M0: sanity. 窓内のテーブル存在・イベント件数・タイムゾーン確認
SELECT
  _TABLE_SUFFIX AS d,
  COUNTIF(event_name='level_start') AS level_start_all,
  COUNTIF(event_name='level_start'
    AND (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_id') LIKE 'quiz-%') AS level_start_quiz,
  COUNTIF(event_name='level_end'
    AND (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_id') LIKE 'quiz-%') AS level_end_quiz,
  MIN(FORMAT_TIMESTAMP('%F %T', TIMESTAMP_MICROS(event_timestamp))) AS min_ts_utc,
  MAX(FORMAT_TIMESTAMP('%F %T', TIMESTAMP_MICROS(event_timestamp))) AS max_ts_utc
FROM `yolo-web-gcp.analytics_524708437.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260615' AND '20260730'
GROUP BY d ORDER BY d
```

**結果**: 窓内の各日にテーブルが存在し、`min_ts_utc` / `max_ts_utc` は JST 暦日の境界に収まった。→ §0 の確定に用いた。

---

## 2. 測定1: `level_start` の連続ペア間隔分布

### 2-1. 窓と分母・分子の定義

| 項目               | 定義                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **窓**             | **JST 2026-06-15 〜 2026-07-30**（`_TABLE_SUFFIX BETWEEN '20260615' AND '20260730'`）。単一の窓・前後比較なし。        |
| **対象イベント**   | `event_name = 'level_start'` かつ `content_id LIKE 'quiz-%'`                                                           |
| **母集団（分母）** | **連続ペア 114 件**。「セッション×コンテンツの組」709 組ではなく、**組の中で隣り合う `level_start` 2件の並び**の個数。 |
| **分子**           | そのペアのうち、間隔が指定帯に入るものの個数                                                                           |

**この測定の分母は「イベント行数（823）」でも「組の数（709）」でもなく「連続ペア（114）」である。**
823 行のうち、同一組で2回目以降に発火した分が 823 − 709 = 114 で、これが連続ペア数と一致する。

### 2-2. SQL: `m1_gaps.sql`（主測定）

```sql
-- 測定1: 同一セッション×同一コンテンツにおける「連続する level_start」の時間間隔分布
-- 窓: JST 2026-06-15 〜 2026-07-30 (_TABLE_SUFFIX = JST日。M0で確認済み)
WITH starts AS (
  SELECT
    CONCAT(user_pseudo_id, '|',
      CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_id') AS content_id,
    event_timestamp AS ts
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260615' AND '20260730'
    AND event_name = 'level_start'
),
q AS (SELECT * FROM starts WHERE content_id LIKE 'quiz-%'),
pairs AS (
  SELECT sid, content_id, ts,
    LAG(ts) OVER (PARTITION BY sid, content_id ORDER BY ts) AS prev_ts
  FROM q
),
gaps AS (
  SELECT sid, content_id, (ts - prev_ts) AS gap_us
  FROM pairs WHERE prev_ts IS NOT NULL
)
SELECT
  (SELECT COUNT(*) FROM q)                             AS level_start_rows_total,
  (SELECT COUNT(DISTINCT CONCAT(sid,'#',content_id)) FROM q) AS pairs_sid_content_total,
  COUNT(*)                                             AS consecutive_pairs,
  COUNTIF(gap_us < 1000000)                            AS pairs_lt_1s,
  COUNTIF(gap_us < 5000000)                            AS pairs_lt_5s,
  COUNTIF(gap_us < 30000000)                           AS pairs_lt_30s,
  COUNTIF(gap_us = 0)                                  AS pairs_eq_0us,
  MIN(gap_us)/1e6                                      AS min_gap_sec,
  APPROX_QUANTILES(gap_us, 100)[OFFSET(25)]/1e6        AS p25_gap_sec,
  APPROX_QUANTILES(gap_us, 100)[OFFSET(50)]/1e6        AS median_gap_sec,
  APPROX_QUANTILES(gap_us, 100)[OFFSET(75)]/1e6        AS p75_gap_sec,
  MAX(gap_us)/1e6                                      AS max_gap_sec
FROM gaps
```

**結果**:

| 列                        | 値            |
| ------------------------- | ------------- |
| `level_start_rows_total`  | **823** 行    |
| `pairs_sid_content_total` | **709** 組    |
| `consecutive_pairs`       | **114** ペア  |
| `pairs_lt_1s`             | **1** 件      |
| `pairs_lt_5s`             | **1** 件      |
| `min_gap_sec`             | **0.0071** 秒 |
| `p25_gap_sec`             | **19.8** 秒   |
| `median_gap_sec`          | **56.20** 秒  |
| `p75_gap_sec`             | **122.5** 秒  |
| `max_gap_sec`             | **1742** 秒   |

SQL が返す `pairs_lt_30s`・`pairs_eq_0us` の2列は、この記録に実測値として転記していない。
§2-3 のバケット分布から `pairs_lt_30s` = 1+0+0+0+7+28 = **36**、
`min_gap_sec` > 0 から `pairs_eq_0us` = **0** が導けるが、これらは**導出値であって転記した実測値ではない**。

### 2-3. SQL: `m1_hist.sql`（バケット分布）

```sql
-- 測定1 補助: 間隔のバケット分布 + 7ms ペアのセッション全イベント列
WITH starts AS (
  SELECT
    CONCAT(user_pseudo_id, '|',
      CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_id') AS content_id,
    event_timestamp AS ts
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260615' AND '20260730' AND event_name='level_start'
),
q AS (SELECT * FROM starts WHERE content_id LIKE 'quiz-%'),
gaps AS (
  SELECT (ts - LAG(ts) OVER (PARTITION BY sid, content_id ORDER BY ts)) AS gap_us
  FROM q
)
SELECT CASE
  WHEN gap_us < 500000    THEN 'a: <0.5s'
  WHEN gap_us < 1000000   THEN 'b: 0.5-1s'
  WHEN gap_us < 2000000   THEN 'c: 1-2s'
  WHEN gap_us < 5000000   THEN 'd: 2-5s'
  WHEN gap_us < 10000000  THEN 'e: 5-10s'
  WHEN gap_us < 30000000  THEN 'f: 10-30s'
  WHEN gap_us < 60000000  THEN 'g: 30-60s'
  WHEN gap_us < 300000000 THEN 'h: 1-5min'
  ELSE 'i: >5min' END AS bucket,
  COUNT(*) AS n
FROM gaps WHERE gap_us IS NOT NULL GROUP BY bucket ORDER BY bucket
```

**結果**（合計 = 114）:

| バケット  | n       |
| --------- | ------- |
| a: <0.5s  | **1**   |
| b: 0.5-1s | **0**   |
| c: 1-2s   | **0**   |
| d: 2-5s   | **0**   |
| e: 5-10s  | **7**   |
| f: 10-30s | **28**  |
| g: 30-60s | **26**  |
| h: 1-5min | **42**  |
| i: >5min  | **10**  |
| **合計**  | **114** |

`a: <0.5s` の 1 件は §2-4 の 0.0071 秒（7ms）ペアそのものである。
したがって **「0.1〜0.5 秒帯」に該当するペアは 0 件**（この帯は上のバケット境界と一致しないため、
`<0.5s` の唯一の要素が 7ms であることから導かれる）。この 0 件の解釈の限界は §6 に書く。

### 2-4. SQL: `m1_detail.sql`（最小側20ペアと正確な中央値）

```sql
-- 測定1 詳細: 最小側20ペア + 正確な中央値
WITH starts AS (
  SELECT
    CONCAT(user_pseudo_id, '|',
      CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_id') AS content_id,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='release')    AS release_id,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='engagement_time_msec') AS eng,
    device.category AS dev,
    event_timestamp AS ts, event_bundle_sequence_id AS bundle
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260615' AND '20260730'
    AND event_name = 'level_start'
),
q AS (SELECT * FROM starts WHERE content_id LIKE 'quiz-%'),
pairs AS (
  SELECT sid, content_id, dev, ts, bundle,
    LAG(ts)     OVER (PARTITION BY sid, content_id ORDER BY ts) AS prev_ts,
    LAG(bundle) OVER (PARTITION BY sid, content_id ORDER BY ts) AS prev_bundle
  FROM q
)
SELECT content_id, dev, (ts-prev_ts)/1e6 AS gap_sec, bundle, prev_bundle,
  (bundle = prev_bundle) AS same_bundle,
  FORMAT_TIMESTAMP('%F %T', TIMESTAMP_MICROS(prev_ts)) AS prev_utc,
  PERCENTILE_CONT((ts-prev_ts), 0.5) OVER ()/1e6 AS exact_median_sec_allpairs
FROM pairs WHERE prev_ts IS NOT NULL
ORDER BY gap_sec ASC LIMIT 20
```

**結果**: 最小の間隔は **0.0071 秒（7,085 マイクロ秒 = 7ms）**の 1 ペアのみ。
正確な中央値（`PERCENTILE_CONT`）は **56.20 秒**で、`APPROX_QUANTILES` の値と一致した。

### 2-5. SQL: `m1_session.sql`（7ms ペアが起きたセッションの全イベント列）

```sql
-- 7ms ペアが起きたセッションの quiz イベント全列（二重発火かリトライかの判別）
WITH e AS (
  SELECT
    CONCAT(user_pseudo_id,'|',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_id') AS content_id,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='release') AS rel,
    (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='engagement_time_msec') AS eng_ms,
    event_name, event_timestamp AS ts, event_bundle_sequence_id AS bundle, device.category AS dev
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260626' AND '20260628'
)
SELECT event_name, content_id, rel, eng_ms, dev, bundle,
  FORMAT_TIMESTAMP('%F %T', TIMESTAMP_MICROS(ts)) AS utc,
  MOD(ts, 1000000) AS us_frac,
  (ts - LAG(ts) OVER (PARTITION BY sid ORDER BY ts))/1e6 AS d_sec
FROM e
WHERE sid = (
  SELECT sid FROM (
    SELECT sid, content_id, ts, (ts - LAG(ts) OVER (PARTITION BY sid, content_id ORDER BY ts)) AS g
    FROM e WHERE event_name='level_start' AND content_id LIKE 'quiz-%'
  ) WHERE g = 7085 LIMIT 1)
ORDER BY ts
```

（このクエリだけ窓が `20260626`〜`20260628` に絞られている。7ms ペアが起きた日の前後だけを見るため。
`g = 7085` は §2-4 で判明したマイクロ秒差をハードコードしたもので、**他の窓では該当行が無く空になる**。）

**結果**: 同一セッション内で `user_engagement` も **0.44ms 差**および **3.29ms 差**で重複していた。
（この事実を根拠に ADR は当該ペアを transport 層のアーティファクトと判定している。判定そのものは ADR 側の記述。）

### 2-6. SQL: `m1_ue.sql`（対照＝サイトコードが発火させないイベントの基準線）

```sql
-- 対照: サイトコードが発火させない user_engagement の「連続イベント間隔」分布
-- （<1s の重複が transport/export 由来で普遍的に起きているかの基準線）
WITH e AS (
  SELECT
    CONCAT(user_pseudo_id,'|',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    event_name, event_timestamp AS ts
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260615' AND '20260730'
    AND event_name IN ('user_engagement','page_view','session_start')
),
g AS (
  SELECT event_name, (ts - LAG(ts) OVER (PARTITION BY sid, event_name ORDER BY ts)) AS gap_us
  FROM e
)
SELECT event_name, COUNT(*) AS consecutive_pairs,
  COUNTIF(gap_us < 1000000) AS lt_1s, COUNTIF(gap_us < 10000) AS lt_10ms,
  ROUND(100*SAFE_DIVIDE(COUNTIF(gap_us < 1000000), COUNT(*)),2) AS pct_lt_1s
FROM g WHERE gap_us IS NOT NULL GROUP BY event_name ORDER BY event_name
```

**分母の定義が測定1本体と違う点に注意**: このクエリの `PARTITION BY` は `(sid, event_name)` であって
`(sid, content_id)` ではない。**`content_id` によるスコープ（`quiz-%`）も掛かっていない。**
つまり「サイト全体・そのイベント名の、セッション内連続ペア」が分母である。

**結果**（1秒未満率）:

| event_name        | 連続ペア | <1s | pct_lt_1s  |
| ----------------- | -------- | --- | ---------- |
| `page_view`       | 643      | 79  | **12.29%** |
| `user_engagement` | 258      | 33  | **12.79%** |

比較対象として並べた `level_start`（quiz-%・§2-2 の分母）の1秒未満率は **1/114 = 0.88%**。

**この 0.88% と 12.29% / 12.79% は分母の作り方が違う**（前者は `(sid, content_id)` 分割かつ `quiz-%` 限定、
後者は `(sid, event_name)` 分割かつ全サイト）。同一定義の比率同士の比較ではない。

---

## 3. 測定2: `level_end` の重複率（出荷前後の2窓）

### 3-1. 窓と分母・分子の定義

| 項目                  | 定義                                                                                                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **窓 A（出荷前）**    | **JST 2026-06-15 〜 2026-07-12**（`_TABLE_SUFFIX BETWEEN '20260615' AND '20260712'`）                                                                                                                                                       |
| **窓 B（出荷後）**    | **JST 2026-07-13 〜 2026-07-28**（`_TABLE_SUFFIX BETWEEN '20260713' AND '20260728'`）                                                                                                                                                       |
| **対象イベント**      | `event_name = 'level_end'` かつ `content_id LIKE 'quiz-%'`（全15本）                                                                                                                                                                        |
| **分母（287 / 252）** | **`level_end` を1件以上持つ「セッション×コンテンツの組」の個数**。窓 A = **287 組**、窓 B = **252 組**。**run 数ではない。イベント行数でもない。ユーザー数でもない。** 同一セッションで同じクイズを2回完走した来訪者は 1 組に畳み込まれる。 |
| **分子（緩い定義）**  | その組のうち、`level_end` を **2件以上**持つものの個数                                                                                                                                                                                      |
| **分子（厳密定義）**  | その組のうち、**間隔が1秒未満の `level_end` 連続ペアを1つ以上**持つものの個数（§3-4）                                                                                                                                                       |

**窓 A と窓 B は連続しておらず、07-29・07-30 は測定2 の窓に含まれない**（測定1 の窓は 07-30 まで含む）。
測定1 と測定2 で窓が違うので、両者の数値を直接足したり比べたりしてはならない。

### 3-2. SQL: `m2_end.sql`（緩い定義の重複率）

```sql
-- 測定2: 完了イベント(level_end)の二重発火率（同一セッション×同一コンテンツ）
-- 窓A(出荷前) JST 20260615-20260712 / 窓B(出荷後) JST 20260713-20260728
WITH e AS (
  SELECT
    CASE WHEN _TABLE_SUFFIX BETWEEN '20260615' AND '20260712' THEN 'A_pre'
         WHEN _TABLE_SUFFIX BETWEEN '20260713' AND '20260728' THEN 'B_post' END AS win,
    CONCAT(user_pseudo_id,'|',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_id') AS content_id
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260615' AND '20260728'
    AND event_name = 'level_end'
),
q AS (SELECT * FROM e WHERE content_id LIKE 'quiz-%' AND win IS NOT NULL),
per_pair AS (SELECT win, sid, content_id, COUNT(*) AS n_end FROM q GROUP BY win, sid, content_id)
SELECT win,
  COUNT(*)                 AS denom_pairs_with_ge1_end,   -- 分母
  COUNTIF(n_end >= 2)      AS numer_pairs_with_ge2_end,   -- 分子
  ROUND(100*SAFE_DIVIDE(COUNTIF(n_end>=2), COUNT(*)), 2) AS pct,
  SUM(n_end)               AS total_level_end_rows,
  MAX(n_end)               AS max_end_per_pair
FROM per_pair GROUP BY win ORDER BY win
```

**結果**:

| 窓                | 分母（組） | 分子（2件以上の組） | 率        |
| ----------------- | ---------- | ------------------- | --------- |
| A_pre（〜07-12）  | **287**    | **12**              | **4.18%** |
| B_post（07-13〜） | **252**    | **4**               | **1.59%** |

Fisher 正確確率検定（両側）: **p = 0.125**。

### 3-3. SQL: `m2_gaps.sql`（重複した `level_end` の間隔の一覧）

```sql
-- 測定2 補助: 重複 level_end の連続ペア間隔（二重発火 vs リトライ完走の判別）
WITH e AS (
  SELECT
    CASE WHEN _TABLE_SUFFIX BETWEEN '20260615' AND '20260712' THEN 'A_pre'
         WHEN _TABLE_SUFFIX BETWEEN '20260713' AND '20260728' THEN 'B_post' END AS win,
    CONCAT(user_pseudo_id,'|',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_id') AS content_id,
    event_timestamp AS ts
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260615' AND '20260728' AND event_name='level_end'
),
q AS (SELECT * FROM e WHERE content_id LIKE 'quiz-%' AND win IS NOT NULL),
g AS (SELECT win, (ts - LAG(ts) OVER (PARTITION BY win, sid, content_id ORDER BY ts)) AS gap_us FROM q)
SELECT win, COUNT(*) AS dup_gap_pairs,
  COUNTIF(gap_us < 1000000) AS lt_1s, COUNTIF(gap_us < 10000) AS lt_10ms,
  COUNTIF(gap_us BETWEEN 1000000 AND 60000000) AS s1_to_60s,
  COUNTIF(gap_us > 60000000) AS gt_60s,
  MIN(gap_us)/1e6 AS min_sec, MAX(gap_us)/1e6 AS max_sec,
  STRING_AGG(CAST(ROUND(gap_us/1e6,3) AS STRING), ', ' ORDER BY gap_us) AS all_gaps_sec
FROM g WHERE gap_us IS NOT NULL GROUP BY win ORDER BY win
```

**結果**（`all_gaps_sec`・単位は秒。ここでの1件1件は「組」ではなく**連続ペア**である）:

- **窓 A（20 ペア）**: `0, 0, 0, 0, 0, 0, 14.6, 15.0, 27.7, 27.8, 30.0, 40.1, 43.1, 60.1, 60.7, 71.7, 73.6, 75.5, 80.9, 1673.3`
- **窓 B（4 ペア）**: `0, 0, 0.175, 715.1`

窓 A の 20 ペアは 12 組から、窓 B の 4 ペアは 4 組から出ている（§3-2 の分子と対応。
1 組が3件以上の `level_end` を持てばペアは組より多くなる）。

### 3-4. SQL: `m2_strict.sql`（厳密定義＝「1秒未満に絞る」の演算定義）

```sql
-- 測定2 厳密版: 「1秒未満の間隔で level_end が連続した」組の割合（リトライ完走を除いた真の二重発火）
WITH e AS (
  SELECT
    CASE WHEN _TABLE_SUFFIX BETWEEN '20260615' AND '20260712' THEN 'A_pre'
         WHEN _TABLE_SUFFIX BETWEEN '20260713' AND '20260728' THEN 'B_post' END AS win,
    CONCAT(user_pseudo_id,'|',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_id') AS content_id,
    event_timestamp AS ts
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260615' AND '20260728' AND event_name='level_end'
),
q AS (SELECT * FROM e WHERE content_id LIKE 'quiz-%' AND win IS NOT NULL),
g AS (SELECT win, sid, content_id, (ts - LAG(ts) OVER (PARTITION BY win, sid, content_id ORDER BY ts)) AS gap_us FROM q),
per_pair AS (
  SELECT win, sid, content_id,
    COUNTIF(gap_us IS NOT NULL) AS extra_ends,
    COUNTIF(gap_us < 1000000)   AS extra_ends_sub1s
  FROM g GROUP BY win, sid, content_id
)
SELECT win,
  COUNT(*) AS denom_pairs_with_ge1_end,
  COUNTIF(extra_ends >= 1)       AS numer_any_dup,
  COUNTIF(extra_ends_sub1s >= 1) AS numer_sub1s_dup,
  ROUND(100*SAFE_DIVIDE(COUNTIF(extra_ends>=1), COUNT(*)),2)       AS pct_any_dup,
  ROUND(100*SAFE_DIVIDE(COUNTIF(extra_ends_sub1s>=1), COUNT(*)),2) AS pct_sub1s_dup
FROM per_pair GROUP BY win ORDER BY win
```

**「リトライ完走を除いた1秒未満に絞る」の演算定義**（ADR §(c) が使っている数値の作り方）:

1. 窓・`sid`・`content_id` で分割し、`level_end` を時刻順に並べて `LAG` で連続ペアの間隔 `gap_us` を取る。
2. **組ごとに** `extra_ends_sub1s = COUNTIF(gap_us < 1000000)` を数える（1秒 = 1,000,000 マイクロ秒）。
3. 分子 = `extra_ends_sub1s >= 1` の**組の数**。分母 = §3-1 と同じ「`level_end` を1件以上持つ組」の数。

**すなわち「絞る」とは、組を数える／数えないの判定条件を「重複が1件でもある」から「1秒未満の重複が1件でもある」に
差し替える操作**であり、分母は変わらない（287 / 252 のまま）。
1組の中に1秒未満のペアが複数あっても、その組は 1 と数える（比率ではなく組数）。

**結果**:

| 窓                | 分母（組） | 緩い分子 | 緩い率 | 厳密分子（<1s） | 厳密率    |
| ----------------- | ---------- | -------- | ------ | --------------- | --------- |
| A_pre（〜07-12）  | **287**    | 12       | 4.18%  | **4**           | **1.39%** |
| B_post（07-13〜） | **252**    | 4        | 1.59%  | **3**           | **1.19%** |

厳密定義での Fisher 正確確率検定（両側）: **p = 1.00**。

（§3-3 の間隔一覧と照合すると、窓 A の 20 ペアのうち 14 ペアは 14 秒以上離れており、
これらは1秒未満の条件に入らない。窓 B は `0, 0, 0.175` の3ペアが1秒未満。）

---

## 4. 測定が「測っていないこと」

以下は本ファイルのどの数値についても成り立つ制約である。**08-10 にこれらの数値を読むときは必ず併せて読むこと。**

1. **届かなかったイベントは数えられない。** BigQuery にあるのは GA4 に到達した行だけである。
   とくに**モバイルの離脱時ビーコン欠落**（ページを閉じる際の送出が完了しない）で失われた `level_end` は
   分母にも分子にも現れない。「重複が少ない」ことは「欠落が少ない」ことを一切含意しない。
2. **セッション×コンテンツの組はリトライを畳み込む。** 同一セッションで同じクイズを2回通しプレイした来訪者は 1 組である。
   したがって測定2 の分母 287 / 252 は run 数より小さい。
3. **n が小さい。** 測定1 の連続ペアは 114、測定2 の分子は最大でも 12 で、厳密定義では 4 と 3 である。
   分子が1件動くだけで率が 0.3〜0.4pt 動く粒度である。
4. **窓の端でセッションが切れる。** `_TABLE_SUFFIX` の境界（JST 0時）をまたぐセッションは、
   窓の先頭日・末尾日で途中から／途中までしか入らない。とくに測定2 は窓 A と窓 B が
   07-12 / 07-13 で隣接しているため、その日をまたぐセッションは両窓に分断されて入る。
5. **`ga_session_id` に依存する。** Cookie 削除・ITP によるセッション ID の再発行があると、
   同一人物の連続行動が別の `sid` に割れる。割れたぶんは連続ペアとして数えられない
   （＝重複の見かけを**減らす**方向にはたらく）。

---

## 5. 単位の違う数値の並置についての注意

**ADR には分子がどちらも 3 である別々の数値が登場する。母集団がまったく違うので、混同してはならない。**

| 数値                    | 出典                                       | 分母の実体                                                           | スコープ                                 | 窓                     |
| ----------------------- | ------------------------------------------ | -------------------------------------------------------------------- | ---------------------------------------- | ---------------------- |
| **3 run / 221（1.4%）** | `cycle-301/instrumentation-design.md` §4-2 | **run**（1回の通しプレイ）。`level_end` を持つ run の数 = 221        | **`quiz-character-personality` 1本のみ** | JST 20260713〜20260728 |
| **3 / 252（1.19%）**    | 本ファイル §3-4（`m2_strict.sql`・窓 B）   | **セッション×コンテンツの組**。`level_end` を1件以上持つ組の数 = 252 | **`quiz-%` 全15本**                      | JST 20260713〜20260728 |

**この2つは別の量である。** 窓は同じだが、

- 分母の単位が違う（run vs セッション×コンテンツの組。後者はリトライを畳み込む）
- 対象コンテンツの範囲が違う（1本 vs 15本）
- 分子の条件が違う（前者は「最終問で `level_end` が2回」、後者は「1秒未満の `level_end` 連続ペアを持つ組」）

分子がどちらも 3 なのは偶然であり、**同じ 3 件の事象を指しているとは限らない。**
一方をもう一方の裏づけとして引いてはならず、率（1.4% と 1.19%）を並べて「一致した」と読んでもならない。

---

## 6. 0 件の解釈の限界（rule of three）

測定1 で「連続ペア 114 件中、0.1〜0.5 秒帯が **0 件**」という結果が出た（§2-3）。

**0/114 は「起きていない」の証明ではない。** 観測されなかっただけで、真の発生率が 0 である必要はない。

### rule of three による 95% 上側信頼限界

n 回の試行で事象が 0 回観測されたとき、真の発生率 p の**片側 95% 上側限界は近似的に 3/n**（rule of three）。

- n = 114 のとき **3 / 114 = 0.02632 = 約 2.63%**
- 近似ではなく厳密に解くと、上側限界 p は `(1 − p)^114 = 0.05` を満たす p、すなわち
  **1 − 0.05^(1/114) = 0.02594 = 約 2.59%**

したがって **95% 上側限界はおよそ 2.6%** である。

**読み方**: この窓・この定義のもとで、0.1〜0.5 秒帯の連続ペアが起きる真の率は
**2.6% 以下だとしか言えない**（0 だとは言えない）。連続ペア 114 件に対して 2.6% は約 3 件に相当する。
つまり「真の率が 2.6% でも、114 件を観測して 0 件になることは 5% の確率で起こりうる」という意味である。

同じ計算を測定2 の分子にも当てはめる場合、n は 287 または 252 であり、
0 件だったわけではない（4 件・3 件）ので rule of three はそのままでは使えない。

---

## 7. 元ファイルの対応表

| 本ファイルの節 | 元ファイル                      | 役割                                    |
| -------------- | ------------------------------- | --------------------------------------- |
| §1             | `tmp/dupmeasure/m0_sanity.sql`  | 窓の健全性・タイムゾーン確認            |
| §2-2           | `tmp/dupmeasure/m1_gaps.sql`    | 測定1 主測定（分布のサマリ）            |
| §2-3           | `tmp/dupmeasure/m1_hist.sql`    | 測定1 バケット分布                      |
| §2-4           | `tmp/dupmeasure/m1_detail.sql`  | 測定1 最小側20ペア・正確な中央値        |
| §2-5           | `tmp/dupmeasure/m1_session.sql` | 7ms ペアのセッション全イベント列        |
| §2-6           | `tmp/dupmeasure/m1_ue.sql`      | 対照（`page_view` / `user_engagement`） |
| §3-2           | `tmp/dupmeasure/m2_end.sql`     | 測定2 緩い定義の重複率                  |
| §3-3           | `tmp/dupmeasure/m2_gaps.sql`    | 測定2 重複間隔の一覧                    |
| §3-4           | `tmp/dupmeasure/m2_strict.sql`  | 測定2 厳密定義（1秒未満）               |

`tmp/` は git 追跡外なので、上記の元ファイルは将来失われうる。**本ファイルの SQL が正本である。**
