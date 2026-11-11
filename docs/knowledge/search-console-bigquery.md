# Search Console × BigQuery の知見

Search Console の BigQuery バルクエクスポート（`searchdata_*` テーブル）を集計するときの落とし穴。知見は cycle-300 で得たもの。

## 平均掲載順位の算式（`sum_position` は0起点）

`sum_position` は **0起点**（0 が検索結果の最上位）。したがって平均掲載順位は:

```sql
ROUND(SAFE_DIVIDE(SUM(sum_position), SUM(impressions)) + 1, 1) AS avg_position
```

**`+ 1` を落とすと Search Console UI より一律 1 小さい値**になる。差分・方向は変わらないので前後比較の結論は覆らないが、絶対値を語る記述はすべて誤りになる。リポジトリ内でこの算式を使う `scripts/analytics-report.ts` と `analyze-bigquery` スキルの参照・ショートカットは `+ 1` を含む形で書かれている。

根拠: 確認（cycle-300・2026-07-30）: [Table guidelines and reference – Search Console Help](https://support.google.com/webmasters/answer/12917991)。cycle-300 では `+ 1` を落とした算式で集計しており、複数サイクルの記録の順位値が1小さくなっていた（当時の記録の補正は B-617）。
