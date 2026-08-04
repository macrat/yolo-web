# cycle-302 GA コンテキスト（サイト識別アイコン再設計の計画用）

- データソース: BigQuery GA4 raw `analytics_524708437.events_*`（project `yolo-web-gcp`）
- 実行方法: `npx tsx .claude/skills/analyze-bigquery/scripts/query.ts "<SQL>"`
- 取得日: 2026-08-04
- **集計期間: 2026-07-07 〜 2026-08-03（28日間）**
  - テーブル実在範囲を実測して決定:
    `SELECT MIN(_TABLE_SUFFIX), MAX(_TABLE_SUFFIX), COUNT(*) FROM analytics_524708437.events_*`
    → min=`20260328` / max=`20260803` / events=`13233`
  - 最新日が 20260803 のため、直近28日は 20260707〜20260803。
- **セッション定義**: `(user_pseudo_id, event_params.ga_session_id)` の distinct 組。
- **期間内の総セッション数 = 1,435 / 総ユーザー数（user_pseudo_id）= 1,318**
- ⚠️ **小標本である**。全体1,435セッションで、再訪関連の分子は 31〜128 と二桁台。
  比率は数十セッションの増減で数ポイント動くため、意思決定は「桁感」までにとどめること。

---

## 1. 再訪の実態

### 1-a. セッション単位（ga_session_number）

```sql
WITH sess AS (
  SELECT
    user_pseudo_id,
    (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS ga_session_id,
    MAX((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_number')) AS ga_session_number
  FROM `analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260707' AND '20260803'
  GROUP BY 1,2
)
SELECT
  COUNT(*) AS sessions_total,
  COUNTIF(ga_session_number >= 2) AS sessions_returning,
  COUNTIF(ga_session_number = 1) AS sessions_first,
  COUNTIF(ga_session_number IS NULL) AS sessions_null_num,
  ROUND(SAFE_DIVIDE(COUNTIF(ga_session_number >= 2), COUNT(*))*100, 2) AS pct_returning_sessions,
  COUNT(DISTINCT user_pseudo_id) AS users_total,
  COUNT(DISTINCT IF(ga_session_number >= 2, user_pseudo_id, NULL)) AS users_with_returning_session
FROM sess
```

生出力:

```json
[
  {
    "sessions_total": 1435,
    "sessions_returning": 128,
    "sessions_first": 1307,
    "sessions_null_num": 0,
    "pct_returning_sessions": 8.92,
    "users_total": 1318,
    "users_with_returning_session": 73
  }
]
```

| 指標                                | 分子 / 分母   | 比率      |
| ----------------------------------- | ------------- | --------- |
| ga_session_number >= 2 のセッション | 128 / 1,435   | **8.92%** |
| ga_session_number = 1 のセッション  | 1,307 / 1,435 | 91.08%    |
| 2回目以降のセッションを持つユーザー | 73 / 1,318    | 5.54%     |

`ga_session_number` が NULL のセッションは 0 件（欠損による過小評価はない）。

### 1-b. ユーザー単位（複数日訪問・first_touch）

```sql
WITH u AS (
  SELECT
    user_pseudo_id,
    COUNT(DISTINCT event_date) AS active_days,
    COUNT(DISTINCT (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id')) AS sessions,
    MIN(user_first_touch_timestamp) AS first_touch,
    MIN(event_timestamp) AS first_event
  FROM `analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260707' AND '20260803'
  GROUP BY 1
)
SELECT
  COUNT(*) AS users_total,
  COUNTIF(active_days >= 2) AS users_2plus_days,
  ROUND(COUNTIF(active_days >= 2)/COUNT(*)*100,2) AS pct_users_2plus_days,
  COUNTIF(active_days >= 3) AS users_3plus_days,
  COUNTIF(sessions >= 2) AS users_2plus_sessions,
  ROUND(COUNTIF(sessions >= 2)/COUNT(*)*100,2) AS pct_users_2plus_sessions,
  COUNTIF(first_touch IS NULL) AS users_null_first_touch,
  COUNTIF(first_touch < UNIX_MICROS(TIMESTAMP('2026-07-07T00:00:00+09:00'))) AS users_first_touch_before_period,
  ROUND(COUNTIF(first_touch < UNIX_MICROS(TIMESTAMP('2026-07-07T00:00:00+09:00')))/COUNT(*)*100,2) AS pct_preexisting_users
FROM u
```

生出力:

```json
[
  {
    "users_total": 1318,
    "users_2plus_days": 31,
    "pct_users_2plus_days": 2.35,
    "users_3plus_days": 7,
    "users_2plus_sessions": 67,
    "pct_users_2plus_sessions": 5.08,
    "users_null_first_touch": 4,
    "users_first_touch_before_period": 11,
    "pct_preexisting_users": 0.83
  }
]
```

| 指標                                               | 分子 / 分母    | 比率      |
| -------------------------------------------------- | -------------- | --------- |
| **期間内に2日以上訪れたユーザー**                  | **31 / 1,318** | **2.35%** |
| 期間内に3日以上訪れたユーザー                      | 7 / 1,318      | 0.53%     |
| 期間内に2セッション以上のユーザー                  | 67 / 1,318     | 5.08%     |
| 期間開始前に初回接触があったユーザー（既存訪問者） | 11 / 1,318     | 0.83%     |
| user_first_touch_timestamp が NULL                 | 4 / 1,318      | 0.30%     |

補足: 1-a の「再訪セッション 8.92%」と 1-b の「既存訪問者 0.83%」の差は、
再訪のほぼ全量が **同一28日期間内での2回目以降**（多くは同日内の複数セッション）であることを示す。
28日をまたいで戻ってくるユーザーは 11人 / 1,318人 と極小。

---

## 2. ブラウザ内訳（セッション）

```sql
WITH sess AS (
  SELECT
    user_pseudo_id,
    (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS sid,
    ANY_VALUE(device.web_info.browser) AS browser
  FROM `analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260707' AND '20260803'
  GROUP BY 1,2
)
SELECT IFNULL(browser,'(null)') AS browser, COUNT(*) AS sessions,
  ROUND(COUNT(*)/SUM(COUNT(*)) OVER ()*100,2) AS pct,
  SUM(COUNT(*)) OVER () AS total_sessions
FROM sess GROUP BY 1 ORDER BY sessions DESC LIMIT 12
```

生出力（分母 total_sessions = 1435）:

| #   | browser          | sessions | pct        |
| --- | ---------------- | -------- | ---------- |
| 1   | Chrome           | 781      | 54.43%     |
| 2   | **Safari**       | **449**  | **31.29%** |
| 3   | Edge             | 123      | 8.57%      |
| 4   | Safari (in-app)  | 40       | 2.79%      |
| 5   | Android Webview  | 32       | 2.23%      |
| 6   | Firefox          | 4        | 0.28%      |
| 7   | Samsung Internet | 3        | 0.21%      |
| 8   | (null)           | 1        | 0.07%      |
| 8   | Amazon Silk      | 1        | 0.07%      |
| 8   | Opera            | 1        | 0.07%      |

合計 = 781+449+123+40+32+4+3+1+1+1 = 1,435（全件が上位10件に収まる）。

**Safari 比率 = 449 / 1,435 = 31.29%**。`Safari (in-app)` を含めると 489 / 1,435 = **34.08%**。

### 2-b. Safari の OS 内訳（SVG favicon の prefers-color-scheme 判断用）

```sql
WITH sess AS (
  SELECT user_pseudo_id,
    (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS sid,
    ANY_VALUE(device.web_info.browser) AS browser,
    ANY_VALUE(device.operating_system) AS os
  FROM `analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260707' AND '20260803'
  GROUP BY 1,2
)
SELECT IFNULL(browser,'(null)') AS browser, IFNULL(os,'(null)') AS os, COUNT(*) AS sessions,
  ROUND(COUNT(*)/(SELECT COUNT(*) FROM sess)*100,2) AS pct, (SELECT COUNT(*) FROM sess) AS total
FROM sess WHERE browser LIKE 'Safari%' GROUP BY 1,2 ORDER BY sessions DESC
```

生出力:

| browser         | os        | sessions | pct（/1,435） |
| --------------- | --------- | -------- | ------------- |
| Safari          | iOS       | 400      | 27.87%        |
| Safari          | Macintosh | 48       | 3.34%         |
| Safari (in-app) | iOS       | 40       | 2.79%         |
| Safari          | (null)    | 1        | 0.07%         |

ブラウザのタブに favicon を表示する **デスクトップ Safari（Macintosh）は 48 / 1,435 = 3.34%**。
Safari 全体 31.29% のうち大半（400/449 = 89.1%）は iOS。

---

## 3. OS / デバイスカテゴリ内訳（セッション）

```sql
WITH sess AS (
  SELECT user_pseudo_id,
    (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS sid,
    ANY_VALUE(device.operating_system) AS os,
    ANY_VALUE(device.category) AS cat
  FROM `analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260707' AND '20260803'
  GROUP BY 1,2
)
SELECT 'os' AS dim, IFNULL(os,'(null)') AS value, COUNT(*) AS sessions,
       ROUND(COUNT(*)/(SELECT COUNT(*) FROM sess)*100,2) AS pct, (SELECT COUNT(*) FROM sess) AS total
FROM sess GROUP BY 2
UNION ALL
SELECT 'category', IFNULL(cat,'(null)'), COUNT(*),
       ROUND(COUNT(*)/(SELECT COUNT(*) FROM sess)*100,2), (SELECT COUNT(*) FROM sess)
FROM sess GROUP BY 2
ORDER BY dim, sessions DESC
```

生出力（分母 = 1,435）:

**device.operating_system**

| #   | os        | sessions | pct        |
| --- | --------- | -------- | ---------- |
| 1   | **iOS**   | **472**  | **32.89%** |
| 2   | Android   | 381      | 26.55%     |
| 3   | Linux     | 234      | 16.31%     |
| 4   | Windows   | 205      | 14.29%     |
| 5   | Macintosh | 89       | 6.20%      |
| 6   | Chrome OS | 52       | 3.62%      |
| 7   | (null)    | 2        | 0.14%      |

合計 = 472+381+234+205+89+52+2 = 1,435。

**device.category**

| #   | category | sessions | pct    |
| --- | -------- | -------- | ------ |
| 1   | mobile   | 817      | 56.93% |
| 2   | desktop  | 581      | 40.49% |
| 3   | tablet   | 35       | 2.44%  |
| 4   | smart tv | 2        | 0.14%  |

合計 = 817+581+35+2 = 1,435。

**iOS 比率 = 472 / 1,435 = 32.89%**（apple-touch-icon の対象規模の上限。
実際の「ホーム画面に追加」実行数は GA4 raw では計測できない）。

---

## 4. 流入チャネル（セッション）

```sql
WITH sess AS (
  SELECT user_pseudo_id,
    (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS sid,
    ANY_VALUE(IFNULL(session_traffic_source_last_click.manual_campaign.source, '(not set)')) AS src,
    ANY_VALUE(IFNULL(session_traffic_source_last_click.manual_campaign.medium, '(not set)')) AS med,
    ANY_VALUE(IFNULL(session_traffic_source_last_click.cross_channel_campaign.default_channel_group,'(not set)')) AS chg
  FROM `analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260707' AND '20260803'
  GROUP BY 1,2
)
SELECT 'source_medium' AS dim, CONCAT(src,' / ',med) AS value, COUNT(*) AS sessions,
       ROUND(COUNT(*)/(SELECT COUNT(*) FROM sess)*100,2) AS pct, (SELECT COUNT(*) FROM sess) AS total
FROM sess GROUP BY 2
UNION ALL
SELECT 'channel_group', chg, COUNT(*),
       ROUND(COUNT(*)/(SELECT COUNT(*) FROM sess)*100,2), (SELECT COUNT(*) FROM sess)
FROM sess GROUP BY 2
ORDER BY dim, sessions DESC
```

生出力（分母 = 1,435）:

**source / medium（全8件。上位8件を求められたが、実在する組み合わせがちょうど8件）**

| #   | source / medium                     | sessions | pct    |
| --- | ----------------------------------- | -------- | ------ |
| 1   | google / organic                    | 878      | 61.18% |
| 2   | (not set) / (not set)               | 338      | 23.55% |
| 3   | bing / organic                      | 113      | 7.87%  |
| 4   | yahoo / organic                     | 84       | 5.85%  |
| 5   | t.co / referral                     | 9        | 0.63%  |
| 6   | openai / organic                    | 9        | 0.63%  |
| 7   | openai / (not set)                  | 3        | 0.21%  |
| 8   | service.smt.docomo.ne.jp / referral | 1        | 0.07%  |

合計 = 878+338+113+84+9+9+3+1 = 1,435。
`(not set) / (not set)` は GA4 の default_channel_group では Direct として扱われている。

**default_channel_group（GA4 標準チャネルグループ）**

| #   | channel_group      | sessions  | pct        |
| --- | ------------------ | --------- | ---------- |
| 1   | **Organic Search** | **1,084** | **75.54%** |
| 2   | **Direct**         | **334**   | **23.28%** |
| 3   | **Organic Social** | **9**     | **0.63%**  |
| 4   | Unassigned         | 7         | 0.49%      |
| 5   | Referral           | 1         | 0.07%      |

合計 = 1084+334+9+7+1 = 1,435。

- **organic search = 1,084 / 1,435 = 75.54%**
- **direct = 334 / 1,435 = 23.28%**
- **social = 9 / 1,435 = 0.63%**（Organic Social。`t.co / referral` の9件が実体。
  Paid Social は 0 件）

検索エンジン内訳（organic 1,084 の内訳、source ベース）:
google 878（全体 61.18% / organic 内 81.0%）、bing 113、yahoo 84、openai 9。

---

## 数値サマリ（そのまま計画に転記可）

| 問い                                         | 実測値 | 分子/分母     |
| -------------------------------------------- | ------ | ------------- |
| 再訪セッション比率                           | 8.92%  | 128 / 1,435   |
| 2日以上訪れたユーザー比率                    | 2.35%  | 31 / 1,318    |
| 28日をまたぐ既存訪問者比率                   | 0.83%  | 11 / 1,318    |
| Safari 比率（全体）                          | 31.29% | 449 / 1,435   |
| Safari 比率（デスクトップ = Macintosh のみ） | 3.34%  | 48 / 1,435    |
| iOS 比率                                     | 32.89% | 472 / 1,435   |
| モバイル比率                                 | 56.93% | 817 / 1,435   |
| Organic Search 比率                          | 75.54% | 1,084 / 1,435 |
| うち Google                                  | 61.18% | 878 / 1,435   |
| Direct 比率                                  | 23.28% | 334 / 1,435   |
| Social 比率                                  | 0.63%  | 9 / 1,435     |

**小標本の注意**: 再訪関連（31件・73人・128セッション）と Social（9セッション）は特に分子が小さい。
Social 9件は誤差レベルであり、「OGP の効果を実測で評価できる規模ではない」と扱うべき。

---

## 追記（2026-08-04）: Search Console の露出と bot 点検

計画レビューの指摘 2 点（①「検索結果面の露出」を GA の Organic Search セッションで測っていた ②
1,435 セッションに人間性の点検が無い＝AP-P26）に対する実測。すべて下記クエリの実出力に基づく。

- データソース: BigQuery `searchconsole.searchdata_site_impression`（Search Console バルクエクスポート）
  ＋ GA4 raw `analytics_524708437.events_*`
- 実行方法: `npx tsx .claude/skills/analyze-bigquery/scripts/query.ts "<SQL>"`
- 取得日: 2026-08-04

### A. 期間のズレ（先に実測）

```sql
SELECT MIN(data_date) AS min_date, MAX(data_date) AS max_date,
       COUNT(*) AS row_count, COUNT(DISTINCT data_date) AS n_days
FROM `searchconsole.searchdata_site_impression`
```

生出力: `min_date=2026-03-27` / `max_date=2026-08-02` / `row_count=33979` / `n_days=129`

**Search Console 側は 2026-08-03 が未着（SC の反映遅延）**。したがって GA の 28 日
（2026-07-07〜2026-08-03）と完全には揃わない。
**本追記の SC 集計期間は実際に取れた 2026-07-07〜2026-08-02（27日間・欠損日 0）**とし、
比較する GA の数値も**同じ 27 日で取り直した**（下記 A-2）。既存の本文（第1〜4章）は 28 日のままで、
数値が異なるのはこの 1 日差による。

集計対象日が 27 日そろっていることの確認（日別出力の日数）:

```sql
SELECT COUNT(DISTINCT data_date) AS n_days, MIN(data_date) AS min_d, MAX(data_date) AS max_d,
       SUM(impressions) AS impressions, SUM(clicks) AS clicks,
       ROUND(SAFE_DIVIDE(SUM(clicks),SUM(impressions))*100,2) AS ctr_pct,
       ROUND(SAFE_DIVIDE(SUM(sum_top_position),SUM(impressions))+1,1) AS avg_position
FROM `searchconsole.searchdata_site_impression`
WHERE data_date BETWEEN '2026-07-07' AND '2026-08-02'
```

生出力:

```json
[
  {
    "n_days": 27,
    "min_d": "2026-07-07",
    "max_d": "2026-08-02",
    "impressions": 64616,
    "clicks": 959,
    "ctr_pct": 1.48,
    "avg_position": 11.0
  }
]
```

#### A-2. 同一 27 日での GA 側の再取得（比較用）

```sql
WITH sess AS (
  SELECT user_pseudo_id,
    (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS sid,
    ANY_VALUE(IFNULL(session_traffic_source_last_click.cross_channel_campaign.default_channel_group,'(not set)')) AS chg,
    ANY_VALUE(IFNULL(session_traffic_source_last_click.manual_campaign.source,'(not set)')) AS src,
    SUM(IFNULL((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='engagement_time_msec'),0)) AS eng_msec
  FROM `analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260707' AND '20260802'
  GROUP BY 1,2
)
SELECT COUNT(*) AS sessions_all,
       COUNTIF(chg='Organic Search') AS organic_all,
       COUNTIF(chg='Organic Search' AND src='google') AS google_organic_all,
       COUNTIF(chg='Organic Search' AND eng_msec>=10000) AS organic_ge10s,
       COUNTIF(chg='Organic Search' AND src='google' AND eng_msec>=10000) AS google_organic_ge10s
FROM sess
```

生出力:

```json
[
  {
    "sessions_all": 1334,
    "organic_all": 997,
    "google_organic_all": 802,
    "organic_ge10s": 615,
    "google_organic_ge10s": 518
  }
]
```

---

### 1. Search Console の impressions（露出の正しい分母）

#### 1-a. サイト計（2026-07-07〜2026-08-02・27日）

| 指標                    | 実測値     | 分子 / 分母                            |
| ----------------------- | ---------- | -------------------------------------- |
| **impressions（露出）** | **64,616** | —                                      |
| **clicks**              | **959**    | —                                      |
| **CTR**                 | **1.48%**  | 959 / 64,616                           |
| 平均掲載順位            | 11.0       | (Σsum_top_position / Σimpressions) + 1 |

search_type 内訳（同期間）:

```sql
SELECT search_type, SUM(impressions) AS impressions, SUM(clicks) AS clicks,
       ROUND(SAFE_DIVIDE(SUM(clicks),SUM(impressions))*100,2) AS ctr_pct
FROM `searchconsole.searchdata_site_impression`
WHERE data_date BETWEEN '2026-07-07' AND '2026-08-02'
GROUP BY search_type ORDER BY impressions DESC
```

生出力: `WEB: impressions=64604 / clicks=959 / ctr=1.48` ・ `IMAGE: impressions=12 / clicks=0 / ctr=0`
→ 露出はほぼ全量が WEB 検索。以降の数値は search_type を絞らない合計（=64,616）を使う。

#### 1-b. デバイス別 impressions

```sql
SELECT device, SUM(impressions) AS impressions,
       ROUND(SUM(impressions)/SUM(SUM(impressions)) OVER ()*100,2) AS imp_pct,
       SUM(clicks) AS clicks,
       ROUND(SUM(clicks)/SUM(SUM(clicks)) OVER ()*100,2) AS click_pct,
       ROUND(SAFE_DIVIDE(SUM(clicks),SUM(impressions))*100,2) AS ctr_pct,
       ROUND(SAFE_DIVIDE(SUM(sum_top_position),SUM(impressions))+1,2) AS avg_position
FROM `searchconsole.searchdata_site_impression`
WHERE data_date BETWEEN '2026-07-07' AND '2026-08-02'
GROUP BY device ORDER BY impressions DESC
```

生出力:

| device     | impressions | imp_pct    | clicks  | click_pct  | CTR       | 平均順位 |
| ---------- | ----------- | ---------- | ------- | ---------- | --------- | -------- |
| **MOBILE** | **43,070**  | **66.66%** | **705** | **73.51%** | **1.64%** | 9.17     |
| DESKTOP    | 19,130      | 29.61%     | 207     | 21.58%     | 1.08%     | 15.42    |
| TABLET     | 2,416       | 3.74%      | 47      | 4.90%      | 1.95%     | 8.51     |

合計 = 43,070+19,130+2,416 = 64,616 / 705+207+47 = 959（サイト計と一致）。

**主たる面がモバイルであることの裏取り**: 露出の **66.66%（43,070 / 64,616）がモバイル**、
タブレットを含めると **70.39%（45,486 / 64,616）**。クリックではさらに偏り、
**モバイルが 73.51%（705 / 959）**。GA のセッション側 mobile 56.93%（817/1,435）より
**SC 側のほうがモバイル偏重が強い**（GA 側は後述の Linux/Direct 非人間トラフィックが desktop に
計上されて薄まっているため。bot を除くとモバイル比率は 70.19% まで上がる → 2-e）。

#### 1-c. 「露出はクリックの何倍か」（同一期間・同一 27 日）

| 分子（露出）          | 分母                                    | 倍率         |
| --------------------- | --------------------------------------- | ------------ |
| SC impressions 64,616 | SC clicks 959                           | **67.4 倍**  |
| SC impressions 64,616 | GA Organic Search セッション 997        | **64.8 倍**  |
| SC impressions 64,616 | GA google/organic セッション 802        | **80.6 倍**  |
| SC impressions 64,616 | GA 全セッション 1,334                   | **48.4 倍**  |
| SC impressions 64,616 | GA Organic かつ滞在10秒以上 615（→2-d） | **105.1 倍** |

**計画が「露出」として使っていた GA Organic Search 1,084（28日）/ 997（27日）は、
実際の露出 64,616 の 1.5% にすぎない。** 露出の正しい分母は 64,616 であり、
「検索結果面で見られている回数」は来訪数のおよそ 65 倍のオーダーである。

参考: SC clicks 959（Google のみ）に対し GA の google/organic セッションは 802（= SC clicks の 83.6%）。
差分は「クリック ≠ セッション」（JS 未実行・計測前離脱・1セッション内の複数クリック）で説明がつく範囲。

---

### 2. GA4 の bot／自己トラフィック点検（AP-P26）

以下は**既存本文と揃えるため 28 日（2026-07-07〜2026-08-03・分母 1,435）**で集計。

#### 2-a. engagement の実在（セッション単位）

```sql
WITH sess AS (
  SELECT user_pseudo_id,
    (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS sid,
    COUNTIF(event_name='user_engagement') AS ue_events,
    SUM(IFNULL((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='engagement_time_msec'),0)) AS eng_msec,
    MAX(IFNULL((SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='session_engaged'),'0')) AS sess_engaged,
    COUNTIF(event_name='page_view') AS pageviews
  FROM `analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260707' AND '20260803'
  GROUP BY 1,2
)
SELECT COUNT(*) AS sessions_total,
       COUNTIF(ue_events>0) AS has_user_engagement_event,
       COUNTIF(eng_msec>0) AS has_engagement_time_msec,
       COUNTIF(ue_events>0 OR eng_msec>0) AS has_either,
       COUNTIF(sess_engaged='1') AS session_engaged_1,
       COUNTIF(pageviews>=2) AS pv_2plus,
       ROUND(COUNTIF(ue_events>0)/COUNT(*)*100,2) AS pct_ue,
       ROUND(COUNTIF(eng_msec>0)/COUNT(*)*100,2) AS pct_eng_msec,
       ROUND(COUNTIF(ue_events>0 OR eng_msec>0)/COUNT(*)*100,2) AS pct_either,
       ROUND(COUNTIF(sess_engaged='1')/COUNT(*)*100,2) AS pct_sess_engaged
FROM sess
```

生出力:

```json
[
  {
    "sessions_total": 1435,
    "has_user_engagement_event": 779,
    "has_engagement_time_msec": 1118,
    "has_either": 1146,
    "session_engaged_1": 908,
    "pv_2plus": 213,
    "pct_ue": 54.29,
    "pct_eng_msec": 77.91,
    "pct_either": 79.86,
    "pct_sess_engaged": 63.28
  }
]
```

| 判定基準                                         | 分子 / 分母       | 比率       |
| ------------------------------------------------ | ----------------- | ---------- |
| `user_engagement` イベントあり                   | 779 / 1,435       | 54.29%     |
| `engagement_time_msec` > 0 あり                  | 1,118 / 1,435     | 77.91%     |
| **どちらか一方でもあり（=「engagement あり」）** | **1,146 / 1,435** | **79.86%** |
| `session_engaged='1'`                            | 908 / 1,435       | 63.28%     |
| page_view 2件以上                                | 213 / 1,435       | 14.84%     |

裏返すと **289 セッション（20.14%）は engagement の痕跡がまったく無い**。

#### 2-b. engagement ありに絞ったときのチャネル比率

```sql
WITH sess AS (
  SELECT user_pseudo_id,
    (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS sid,
    ANY_VALUE(IFNULL(session_traffic_source_last_click.cross_channel_campaign.default_channel_group,'(not set)')) AS chg,
    COUNTIF(event_name='user_engagement')>0
      OR SUM(IFNULL((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='engagement_time_msec'),0))>0 AS has_eng,
    COUNTIF(event_name='user_engagement')>0 AS has_ue
  FROM `analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260707' AND '20260803'
  GROUP BY 1,2
)
SELECT chg, COUNT(*) AS sessions_all,
       ROUND(COUNT(*)/SUM(COUNT(*)) OVER ()*100,2) AS pct_all,
       COUNTIF(has_eng) AS sessions_eng,
       ROUND(COUNTIF(has_eng)/SUM(COUNTIF(has_eng)) OVER ()*100,2) AS pct_eng,
       COUNTIF(has_ue) AS sessions_ue,
       ROUND(COUNTIF(has_ue)/SUM(COUNTIF(has_ue)) OVER ()*100,2) AS pct_ue_only,
       SUM(COUNT(*)) OVER () AS tot_all, SUM(COUNTIF(has_eng)) OVER () AS tot_eng,
       SUM(COUNTIF(has_ue)) OVER () AS tot_ue
FROM sess GROUP BY 1 ORDER BY sessions_all DESC
```

生出力（分母: 全 1,435 / engagement あり 1,146 / user_engagement イベントあり 779）:

| channel_group  | 全体 (n/1,435) | 全体%  | engagement あり (n/1,146) | eng%       | user_engagement のみ (n/779) | ue%    |
| -------------- | -------------- | ------ | ------------------------- | ---------- | ---------------------------- | ------ |
| Organic Search | 1,084          | 75.54% | **914**                   | **79.76%** | 579                          | 74.33% |
| Direct         | 334            | 23.28% | **217**                   | **18.94%** | 191                          | 24.52% |
| Organic Social | 9              | 0.63%  | 8                         | 0.70%      | 3                            | 0.39%  |
| Unassigned     | 7              | 0.49%  | 6                         | 0.52%      | 5                            | 0.64%  |
| Referral       | 1              | 0.07%  | 1                         | 0.09%      | 1                            | 0.13%  |

**engagement ありに絞ると Organic Search は 75.54% → 79.76% に上がり、Direct は 23.28% → 18.94% に下がる。**
つまり engagement の無いセッションは Direct 側に偏って存在している。

#### 2-c. OS 別（Linux の扱い）

```sql
-- 2-b と同じ sess CTE で os = ANY_VALUE(IFNULL(device.operating_system,'(null)')) を取り、
SELECT os, COUNT(*) AS sessions_all,
       ROUND(COUNT(*)/SUM(COUNT(*)) OVER ()*100,2) AS pct_all,
       COUNTIF(has_eng) AS sessions_eng,
       ROUND(COUNTIF(has_eng)/SUM(COUNTIF(has_eng)) OVER ()*100,2) AS pct_eng,
       ROUND(COUNTIF(has_eng)/COUNT(*)*100,2) AS eng_rate_within_os,
       COUNTIF(has_ue) AS sessions_ue,
       ROUND(COUNTIF(has_ue)/SUM(COUNTIF(has_ue)) OVER ()*100,2) AS pct_ue,
       SUM(COUNT(*)) OVER () AS tot_all, SUM(COUNTIF(has_eng)) OVER () AS tot_eng
FROM sess GROUP BY 1 ORDER BY sessions_all DESC
```

生出力:

| os        | 全体 (n/1,435) | 全体%      | eng あり (n/1,146) | eng%       | OS内 eng 率 | ue あり (n/779) | ue%    |
| --------- | -------------- | ---------- | ------------------ | ---------- | ----------- | --------------- | ------ |
| iOS       | 472            | 32.89%     | 411                | 35.86%     | 87.08%      | 309             | 39.67% |
| Android   | 381            | 26.55%     | 295                | 25.74%     | 77.43%      | 73              | 9.37%  |
| **Linux** | **234**        | **16.31%** | **194**            | **16.93%** | 82.91%      | 177             | 22.72% |
| Windows   | 205            | 14.29%     | 129                | 11.26%     | 62.93%      | 117             | 15.02% |
| Macintosh | 89             | 6.20%      | 65                 | 5.67%      | 73.03%      | 58              | 7.45%  |
| Chrome OS | 52             | 3.62%      | 51                 | 4.45%      | 98.08%      | 45              | 5.78%  |
| (null)    | 2              | 0.14%      | 1                  | 0.09%      | 50.00%      | 0               | 0.00%  |

**「engagement あり（>0ms）」で絞っても Linux は 16.31% → 16.93% とほとんど動かない**（むしろ微増）。
つまり `engagement_time_msec > 0` は人間性の判定として弱すぎる。そこで Linux の中身を実測した。

#### 2-d. Linux セッションの正体（0 秒判定では落ちない非人間トラフィック）

```sql
-- sess CTE に chg / browser / eng_msec を持たせ、os='Linux' のみ
SELECT os, chg, browser, COUNT(*) AS sessions,
       APPROX_QUANTILES(eng_msec,2)[OFFSET(1)] AS median_eng_msec
FROM sess WHERE os='Linux' GROUP BY 1,2,3 ORDER BY sessions DESC
```

生出力:

| os    | channel    | browser | sessions | median_eng_msec |
| ----- | ---------- | ------- | -------- | --------------- |
| Linux | Direct     | Chrome  | 230      | 3,856           |
| Linux | Unassigned | Chrome  | 3        | 1,913           |
| Linux | Direct     | Firefox | 1        | 0               |

→ **Linux 234 セッションのうち Organic Search は 0 件**（234 件すべて Direct / Unassigned）。

Linux と他 OS の滞在・回遊の比較:

```sql
SELECT IF(os='Linux','Linux','other') AS grp, COUNT(*) AS sessions,
       APPROX_QUANTILES(eng_msec,2)[OFFSET(1)] AS median_eng_msec,
       ROUND(AVG(eng_msec)) AS mean_eng_msec,
       COUNTIF(eng_msec>=10000) AS sess_ge10s,
       ROUND(COUNTIF(eng_msec>=10000)/COUNT(*)*100,2) AS pct_ge10s,
       ROUND(AVG(pv),2) AS avg_pv
FROM sess GROUP BY 1
```

生出力:

```json
[
  {
    "grp": "other",
    "sessions": 1201,
    "median_eng_msec": 27366,
    "mean_eng_msec": 115355,
    "sess_ge10s": 696,
    "pct_ge10s": 57.95,
    "avg_pv": 1.48
  },
  {
    "grp": "Linux",
    "sessions": 234,
    "median_eng_msec": 3856,
    "mean_eng_msec": 4786,
    "sess_ge10s": 32,
    "pct_ge10s": 13.68,
    "avg_pv": 0.99
  }
]
```

地理内訳:

```sql
SELECT country, city, COUNT(*) AS sessions FROM sess WHERE os='Linux'
GROUP BY 1,2 ORDER BY sessions DESC LIMIT 10
```

生出力（上位）: Singapore / city 空 = **215**、United States / 空 = 8、China / 空 = 3、
United States / Los Angeles = 2、Japan / Suginami City = 2、他 1 件ずつ。

**Linux 234 セッションの特徴（すべて実測値）**:

| 特徴                       | Linux                 | Linux 以外             |
| -------------------------- | --------------------- | ---------------------- |
| Organic Search の割合      | **0 / 234 = 0%**      | 1,084 / 1,201 = 90.26% |
| 滞在時間の中央値           | **3.9 秒**            | 27.4 秒                |
| 滞在 10 秒以上の割合       | **13.68%**            | 57.95%                 |
| セッションあたり page_view | **0.99**              | 1.48                   |
| 都市不明のシンガポール発   | **215 / 234 = 91.9%** | —                      |

→ 「Direct 100% ／ Chrome ／ 1 セッション 1 PV ／ 中央値 3.9 秒 ／ 都市不明のシンガポール（データセンター）」
という組み合わせは、**人間の閲覧ではなく自動アクセス（監視・プレビュー生成・未知ボット等）と見るのが妥当**。
`engagement_time_msec > 0` は満たしてしまうため、**AP-P26 の点検を「0 秒か否か」で行うと素通りする**。

#### 2-e. より厳しい人間性フィルタでのチャネル／OS／デバイス比率

`eng_msec >= 10 秒`（および 30 秒）で絞った場合:

```sql
SELECT chg,
       COUNTIF(eng_msec>=10000) AS sess_ge10s,
       ROUND(COUNTIF(eng_msec>=10000)/SUM(COUNTIF(eng_msec>=10000)) OVER ()*100,2) AS pct_ge10s,
       COUNTIF(eng_msec>=30000) AS sess_ge30s,
       ROUND(COUNTIF(eng_msec>=30000)/SUM(COUNTIF(eng_msec>=30000)) OVER ()*100,2) AS pct_ge30s,
       COUNTIF(os<>'Linux') AS sess_excl_linux,
       ROUND(COUNTIF(os<>'Linux')/SUM(COUNTIF(os<>'Linux')) OVER ()*100,2) AS pct_excl_linux
FROM sess GROUP BY 1 ORDER BY sess_ge10s DESC
```

生出力（分母: ≥10秒 728 / ≥30秒 594 / Linux除外 1,201）:

| channel_group  | 全体%  | eng>0% | **≥10秒 (n/728)** | **≥30秒 (n/594)** | Linux除外 (n/1,201) |
| -------------- | ------ | ------ | ----------------- | ----------------- | ------------------- |
| Organic Search | 75.54% | 79.76% | **675 = 92.72%**  | **578 = 97.31%**  | 1,084 = 90.26%      |
| Direct         | 23.28% | 18.94% | 48 = 6.59%        | 12 = 2.02%        | 103 = 8.58%         |
| Organic Social | 0.63%  | 0.70%  | 2 = 0.27%         | 1 = 0.17%         | 9 = 0.75%           |
| Unassigned     | 0.49%  | 0.52%  | 2 = 0.27%         | 2 = 0.34%         | 4 = 0.33%           |
| Referral       | 0.07%  | 0.09%  | 1 = 0.14%         | 1 = 0.17%         | 1 = 0.08%           |

OS 別（同じ ≥10秒フィルタ）:

| os        | 全体 (n/1,435) | 全体%      | ≥10秒 (n/728) | ≥10秒%    |
| --------- | -------------- | ---------- | ------------- | --------- |
| iOS       | 472            | 32.89%     | 295           | 40.52%    |
| Android   | 381            | 26.55%     | 242           | 33.24%    |
| **Linux** | **234**        | **16.31%** | **32**        | **4.40%** |
| Windows   | 205            | 14.29%     | 74            | 10.16%    |
| Macintosh | 89             | 6.20%      | 39            | 5.36%     |
| Chrome OS | 52             | 3.62%      | 45            | 6.18%     |
| (null)    | 2              | 0.14%      | 1             | 0.14%     |

デバイスカテゴリ別:

| category | 全体 (n/1,435) | 全体%  | eng>0 (n/1,146) | eng%   | ≥10秒 (n/728) | ≥10秒%     |
| -------- | -------------- | ------ | --------------- | ------ | ------------- | ---------- |
| mobile   | 817            | 56.93% | 673             | 58.73% | **511**       | **70.19%** |
| desktop  | 581            | 40.49% | 439             | 38.31% | 190           | 26.10%     |
| tablet   | 35             | 2.44%  | 32              | 2.79%  | 26            | 3.57%      |
| smart tv | 2              | 0.14%  | 2               | 0.17%  | 1             | 0.14%      |

**Linux は 16.31% → 4.40% に落ち、Organic Search は 75.54% → 92.72% に上がる。**
モバイル比率も 56.93% → 70.19% に上がり、**SC の impressions におけるモバイル比 66.66% とほぼ一致する**。

---

### 結論

1. **「検索結果面の露出」の正しい分母は Search Console の impressions = 64,616（27日）**であり、
   GA の Organic Search セッション（997／27日）ではない。**露出はクリックの約 67 倍**（64,616 / 959）、
   GA の Organic セッション基準でも約 65 倍。計画が「露出」と呼んでいた数値は実際の露出の約 1.5%。
2. **露出の主たるデバイスはモバイル**: impressions の 66.66%（43,070 / 64,616）、クリックの 73.51%（705 / 959）。
3. **「主たる面は検索結果である」という判断は bot を除いても維持される。むしろ強まる。**
   Organic Search 比率は 75.54%（無処理・1,084/1,435）→ 79.76%（engagement あり・914/1,146）
   → 92.72%（滞在10秒以上・675/728）→ 97.31%（滞在30秒以上・578/594）と、
   人間性フィルタを厳しくするほど単調に上昇する。
4. ただし **1,435 セッションには非人間トラフィックが有意に混じっている**。Linux 234 セッション（16.31%）は
   Organic 0 件・Direct 100%・1セッション1PV・滞在中央値 3.9 秒・91.9% が都市不明のシンガポール発で、
   自動アクセスと見るのが妥当。**Direct 334 のうち少なくとも 230 件（68.9%）は Linux/Direct/Chrome の同種**。
   → 既存本文の「Direct 23.28%」は人間の直接来訪としては過大評価であり、
   滞在10秒以上に絞った 6.59%（48/728）のほうが実態に近い。
5. **⚠️ 小標本である。** SC 側は impressions 64,616 と十分な量があるが、
   GA 側の分子は依然として二〜三桁台（≥10秒フィルタ後の Direct 48件、Organic Social 2件、Referral 1件）。
   Social / Referral は誤差レベルで、比率を論拠にしてはならない。
   また Linux を bot と断定する判断も間接証拠（滞在・PV・地理・チャネル）に基づく推定であり、
   IP レベルの確証は GA4 raw では取得できない。
