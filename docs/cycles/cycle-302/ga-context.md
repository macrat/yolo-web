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
