# Search Console × BigQuery の知見

## 平均掲載順位の算式（`sum_position` は0起点）

Search Console の BigQuery バルクエクスポートの `sum_position` は **0起点**（0 が検索結果の最上位）。したがって平均掲載順位は:

```sql
ROUND(SAFE_DIVIDE(SUM(sum_position), SUM(impressions)) + 1, 1) AS avg_position
```

**`+ 1` を落とすと Search Console UI より一律 1 小さい値**になる（差分・方向は変わらないので前後比較の結論は覆らないが、絶対値を語る記述はすべて誤りになる）。

- 一次資料: [Table guidelines and reference – Search Console Help](https://support.google.com/webmasters/answer/12917991)（2026-07-30 確認）
- 実際に発生: cycle-300 で `+1` を落とした算式が `analyze-bigquery` のスキル参照・ショートカット2本・`scripts/analytics-report.ts`（定型レポート）に入り、複数サイクルの記録の順位値が1小さくなっていた。是正済み（残存ゼロを grep で実測）。過去 docs の値の補正は B-617。
