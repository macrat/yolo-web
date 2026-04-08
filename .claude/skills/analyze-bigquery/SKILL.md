---
name: analyze-bigquery
description: Analyzes yolos.net data using BigQuery. Covers GA4 analytics (pageviews, referrers, user behavior) and Search Console (search queries, impressions, clicks). Use when analyzing site traffic, search performance, or user engagement data. Prefer this over GA4 MCP (mcp__google-analytics__run_report) because BigQuery provides richer raw data with SQL flexibility. However, BigQuery GA4 data starts from 2026-03-28 while GA4 MCP has data from 2026-02-14, so use GA4 MCP when older data is needed.
---

# BigQuery Data Analysis

Project: `yolo-web-gcp`, authenticated via `GOOGLE_APPLICATION_CREDENTIALS`.

## Datasets

**GA4 Analytics**: Pageviews, events, referrers, user behavior → See [reference/ga4.md](reference/ga4.md)
**Search Console**: Search queries, impressions, clicks, positions → See [reference/searchconsole.md](reference/searchconsole.md)

## Running queries

Execute any SQL query:

```bash
npx tsx .claude/skills/analyze-bigquery/scripts/query.ts "SELECT ..."
npx tsx .claude/skills/analyze-bigquery/scripts/query.ts --file query.sql
```

## GA4 shortcuts

```bash
# Page PV ranking (default: 12 weeks)
.claude/skills/analyze-bigquery/scripts/pageview-ranking.sh [--weeks N] [--from YYYYMMDD] [--to YYYYMMDD]

# Daily PV history (default: 4 weeks)
.claude/skills/analyze-bigquery/scripts/pageview-daily.sh [--weeks N] [--from YYYYMMDD] [--to YYYYMMDD]

# Referrer ranking (default: 12 weeks)
.claude/skills/analyze-bigquery/scripts/referrer-ranking.sh [--weeks N] [--from YYYYMMDD] [--to YYYYMMDD]

# Channel group ranking (default: 12 weeks)
.claude/skills/analyze-bigquery/scripts/channel-ranking.sh [--weeks N] [--from YYYYMMDD] [--to YYYYMMDD]

# Weekly PV trend (default: 12 weeks)
.claude/skills/analyze-bigquery/scripts/pageview-weekly.sh [--weeks N] [--from YYYYMMDD] [--to YYYYMMDD]

# Landing page ranking, organic only (default: 12 weeks, use --all-channels for all)
.claude/skills/analyze-bigquery/scripts/landing-page-ranking.sh [--weeks N] [--from YYYYMMDD] [--to YYYYMMDD] [--all-channels]
```

## Search Console shortcuts

```bash
# Search query ranking by clicks (default: 12 weeks)
.claude/skills/analyze-bigquery/scripts/search-query-ranking.sh [--weeks N] [--from YYYY-MM-DD] [--to YYYY-MM-DD]

# Page ranking by clicks (default: 12 weeks)
.claude/skills/analyze-bigquery/scripts/search-page-ranking.sh [--weeks N] [--from YYYY-MM-DD] [--to YYYY-MM-DD]

# Daily search performance (default: 4 weeks)
.claude/skills/analyze-bigquery/scripts/search-daily.sh [--weeks N] [--from YYYY-MM-DD] [--to YYYY-MM-DD]
```

Note: SC scripts use `YYYY-MM-DD` date format (DATE type), GA4 scripts use `YYYYMMDD` (STRING type).

## Adding new shortcuts

If you find yourself running the same query repeatedly, add a new shortcut script to `scripts/`. Follow the existing scripts as templates: accept `--weeks`, `--from`, `--to` options and call `query.ts` for execution.
