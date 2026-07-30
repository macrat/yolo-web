# Search Console — BigQuery Reference

## Dataset

`searchconsole`

## Tables

| Table                        | Description                                                              |
| ---------------------------- | ------------------------------------------------------------------------ |
| `searchdata_url_impression`  | URL-level search impressions (query, URL, clicks, impressions, position) |
| `searchdata_site_impression` | Site-level search impressions (aggregated)                               |
| `ExportLog`                  | Export metadata                                                          |

## Key columns (searchdata_url_impression)

| Column              | Type    | Description                                                                                                                                   |
| ------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| data_date           | DATE    | Date of the search data                                                                                                                       |
| query               | STRING  | Search query                                                                                                                                  |
| url                 | STRING  | Full URL that appeared in search                                                                                                              |
| impressions         | INTEGER | Number of times shown in search results                                                                                                       |
| clicks              | INTEGER | Number of clicks from search results                                                                                                          |
| sum_position        | FLOAT   | Sum of **zero-based** positions. 平均順位 = SUM(sum_position)/SUM(impressions) **+ 1**（公式定義。+1 を忘れると SC UI より 1 小さい値になる） |
| search_type         | STRING  | `WEB`, `IMAGE`, `VIDEO`, etc.                                                                                                                 |
| device              | STRING  | `DESKTOP`, `MOBILE`, `TABLET`                                                                                                                 |
| country             | STRING  | 3-letter country code (e.g., `jpn`)                                                                                                           |
| is_anonymized_query | BOOL    | True if query is anonymized for privacy                                                                                                       |

## Common query patterns

### Top search queries by clicks

```sql
SELECT query, SUM(clicks) AS clicks, SUM(impressions) AS impressions,
       ROUND(SUM(clicks) / SUM(impressions) * 100, 1) AS ctr,
       ROUND(SUM(sum_position) / SUM(impressions) + 1, 1) AS avg_position
FROM `searchconsole.searchdata_url_impression`
WHERE data_date BETWEEN '2026-03-01' AND '2026-03-31'
  AND NOT is_anonymized_query
GROUP BY query
ORDER BY clicks DESC
```

### Top pages by clicks

```sql
SELECT REGEXP_REPLACE(url, r'https?://[^/]+', '') AS page_path,
       SUM(clicks) AS clicks, SUM(impressions) AS impressions
FROM `searchconsole.searchdata_url_impression`
WHERE data_date BETWEEN '2026-03-01' AND '2026-03-31'
GROUP BY page_path
ORDER BY clicks DESC
```

### Daily search performance

```sql
SELECT data_date, SUM(clicks) AS clicks, SUM(impressions) AS impressions
FROM `searchconsole.searchdata_url_impression`
WHERE data_date BETWEEN '2026-03-01' AND '2026-03-31'
GROUP BY data_date
ORDER BY data_date
```

### Average position (correct calculation)

```sql
ROUND(SUM(sum_position) / SUM(impressions) + 1, 1) AS avg_position
```

Note: `sum_position` is pre-summed per row and **zero-based**。平均順位は `SUM(sum_position)/SUM(impressions) + 1`（Search Console 公式: support.google.com/webmasters/answer/12917991 ・2026-07-30 確認）。**+1 を落とすと UI と 1 ずれる**（cycle-300 で実際に発生）。
