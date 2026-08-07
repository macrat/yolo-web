# GA4 Analytics — BigQuery Reference

## Dataset

`analytics_524708437`

## Tables

- `events_YYYYMMDD` — Daily event data (sharded by date)
- `pseudonymous_users_YYYYMMDD` — Pseudonymous user data

Use wildcard `events_*` with `_TABLE_SUFFIX BETWEEN 'YYYYMMDD' AND 'YYYYMMDD'` for date ranges.

## Key columns (events table)

| Column                   | Type     | Description                                                                      |
| ------------------------ | -------- | -------------------------------------------------------------------------------- |
| event_date               | STRING   | Date in YYYYMMDD format                                                          |
| event_name               | STRING   | Event type: `page_view`, `session_start`, `first_visit`, `user_engagement`, etc. |
| event_params             | RECORD[] | Array of {key, value} pairs. Access via UNNEST.                                  |
| traffic_source           | RECORD   | First-touch: source, medium, name                                                |
| collected_traffic_source | RECORD   | Session-level: manual_source, manual_medium, etc.                                |
| device                   | RECORD   | category, operating_system, browser, etc.                                        |
| geo                      | RECORD   | country, region, city, etc.                                                      |
| user_pseudo_id           | STRING   | Anonymous user identifier                                                        |

## Useful event_params keys

Extract with: `(SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = '<key>')`

| Key                  | Type         | Description                              |
| -------------------- | ------------ | ---------------------------------------- |
| page_location        | string_value | Full URL                                 |
| page_title           | string_value | Page title                               |
| page_referrer        | string_value | Referrer URL                             |
| source               | string_value | Traffic source (google, bing, etc.)      |
| medium               | string_value | Traffic medium (organic, referral, etc.) |
| session_engaged      | string_value | "1" if engaged session                   |
| engagement_time_msec | int_value    | Engagement time in ms                    |

## Common query patterns

### Page path extraction (strip domain and query string)

```sql
REGEXP_REPLACE(
  REGEXP_REPLACE(
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'page_location'),
    r'https?://[^/]+', ''
  ),
  r'\?.*$', ''
) AS page_path
```

### Filter by date range

```sql
FROM `analytics_524708437.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260301' AND '20260331'
```

### Page views only

```sql
AND event_name = 'page_view'
```
