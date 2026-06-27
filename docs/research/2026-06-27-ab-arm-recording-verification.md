# cycle-272 検証: A/B実験 `quiz_result_visual_v1` の arm 記録 (GA4→BigQuery)

検証日: 2026-06-27 / 対象期間: 2026-06-20〜2026-06-26 (`_TABLE_SUFFIX '20260620'〜'20260626'`)
データセット: `analytics_524708437` (GA4 property 524708437) / events\_\* テーブル
実行形: `npx tsx .claude/skills/analyze-bigquery/scripts/query.ts "<SQL>"` (読取のみ)

---

## 結論（先に）

**arm 記録は実在し、正常に機能している。** 「唯一の答えの仕組みが壊れている」事実は無い。

- event_params のキー名は設計通り `experiment_id` / `ab_variant`（実データで確認、別名 `variant` 等は無し）。
- 両 arm A / B が分かれて記録され、6/21〜6/26 の全日で両 arm が毎日出ている。
- experiment_id の値は厳密に `quiz_result_visual_v1`。partial tagging（片側だけ NULL）は 0 件。

唯一の注意点（壊れてはいないが coverage leak）: 実験対象の personality 系（GA content_type=`diagnosis`）の
level_end のうち **約 20.8%（10/48）が arm 未確定（null-arm フォールバック）で無タグ発火**している。
これはコード側 `QuizContainer.tsx` のコメントで既知の「arm は useEffect 内で確定するため初期 render で
ab===undefined のまま level_end が発火しうる」事象が実データで観測されたもの。設計上 level_end は arm 必須の
主 KPI 発火点なので、ここは取りこぼしとして cycle-272 で意識すべき。

---

## SQL と生結果

### Q1. level_end の event_params キー一覧（キー名の実体確認）

```sql
SELECT ep.key AS param_key, COUNT(*) AS occurrences,
  COUNT(DISTINCT CASE WHEN ep.value.string_value IS NOT NULL THEN 1 END) AS has_str,
  COUNT(DISTINCT CASE WHEN ep.value.int_value IS NOT NULL THEN 1 END) AS has_int
FROM `analytics_524708437.events_*`, UNNEST(event_params) ep
WHERE _TABLE_SUFFIX BETWEEN '20260620' AND '20260626' AND event_name='level_end'
GROUP BY param_key ORDER BY occurrences DESC
```

生結果（抜粋・要点）:

- 全 level_end イベント = **54 件**（level_name/content_id/ga_session_id 等の普遍パラメータが全て 54）
- `ab_variant`: occurrences=**38**, string_value
- `experiment_id`: occurrences=**38**, string_value
- `success`: string_value（boolean が文字列で入っている。今回の主題には無関係）
- **`variant` という別名キーは level_end に存在しない**（ab_variant / experiment_id のみ）

→ キー名は設計（`docs/visitor-value-measurement.md` 論点4）と完全一致。

### Q2. arm 別の分布 + experiment_id 値 + distinct session

```sql
SELECT
  (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='experiment_id') AS experiment_id,
  (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='ab_variant') AS ab_variant,
  COUNT(*) AS level_end_events,
  COUNT(DISTINCT (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id')) AS distinct_sessions
FROM `analytics_524708437.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260620' AND '20260626' AND event_name='level_end'
GROUP BY experiment_id, ab_variant ORDER BY level_end_events DESC
```

生結果:
| experiment_id | ab_variant | level_end_events | distinct_sessions |
|---|---|---|---|
| quiz_result_visual_v1 | A | 22 | 20 |
| (null) | (null) | 16 | 13 |
| quiz_result_visual_v1 | B | 16 | 16 |

→ experiment_id は `quiz_result_visual_v1` のみ。partial tagging（experiment_id だけ／ab_variant だけ）の行は無い。

### Q3. content_id × tag 状態（無タグの内訳切り分け）

```sql
SELECT
  (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_type') AS content_type,
  (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_id') AS content_id,
  CASE WHEN (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='ab_variant') IS NULL
       THEN 'untagged' ELSE 'tagged' END AS tag_state,
  COUNT(*) AS events
FROM `analytics_524708437.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260620' AND '20260626' AND event_name='level_end'
GROUP BY content_type, content_id, tag_state ORDER BY content_type, content_id, tag_state
```

生結果:
| content_type | content_id | tag_state | events |
|---|---|---|---|
| diagnosis | quiz-animal-personality | tagged | 2 |
| diagnosis | quiz-character-personality | tagged | 30 |
| diagnosis | quiz-character-personality | **untagged** | **9** |
| diagnosis | quiz-science-thinking | tagged | 1 |
| diagnosis | quiz-word-sense-personality | tagged | 5 |
| diagnosis | quiz-word-sense-personality | **untagged** | **1** |
| game | kanji-kanaru | untagged | 1 |
| quiz | quiz-kanji-level | untagged | 3 |
| quiz | quiz-kotowaza-level | untagged | 1 |
| quiz | quiz-yoji-level | untagged | 1 |

### Q4. 日次タイムライン（記録の継続性）

```sql
SELECT event_date,
  (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='ab_variant') AS ab_variant,
  COUNT(*) AS events
FROM `analytics_524708437.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260620' AND '20260626' AND event_name='level_end'
  AND (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='experiment_id')='quiz_result_visual_v1'
GROUP BY event_date, ab_variant ORDER BY event_date, ab_variant
```

生結果（A,B 件数）:

- 0621: A=4 B=4 / 0622: A=3 B=2 / 0623: A=4 B=1 / 0624: A=3 B=1 / 0625: A=1 B=3 / 0626: A=7 B=5
- 0620 はタグ付き 0 件（実験デプロイは ~6/20、稼働開始は 6/21 から観測）。

---

## 解釈

### コードの仕組み（事実確認済み）

- `src/lib/analytics.ts` `withAbContext()`: ab が undefined ならキー自体を payload から省く（`key:undefined` を GA に送らない）。
  ab があれば `ab_variant` と `experiment_id` を string で付与。→ BigQuery のキー名一致はここ由来。
- `src/play/quiz/_components/QuizContainer.tsx`: `isExperimentSubject = quiz.meta.type === "personality"` かつ
  `resultArm !== null` のときだけ ab を level_end に載せる。personality 系は GA に content_type=`diagnosis` で記録される。

### カバレッジ計算

- 全 level_end = 54。タグ付き = 38（70.4%）、無タグ = 16（29.6%）。
- 無タグ 16 件の内訳:
  - **実験対象外で正しく無タグ = 6 件**: game kanji-kanaru(1) + quiz-kanji-level(3) + quiz-kotowaza-level(1) + quiz-yoji-level(1)。
    knowledge 系クイズ・ゲームは設計上 arm を載せない（QuizContaink のコメント通り、KPI 希釈防止）。これは正常。
  - **実験対象（diagnosis）なのに無タグ = 10 件**: quiz-character-personality(9) + quiz-word-sense-personality(1)。
    これが null-arm フォールバック（resultArm 未確定で level_end 発火）。
- 実験対象 diagnosis の level_end = 48 件（tagged 38 + untagged 10）。
  → **arm タグ率（対象内）= 38/48 = 79.2%、取りこぼし = 10/48 = 20.8%**。

### 異常の有無

- 「壊れている」異常（キー名違い・片 arm のみ・全部 NULL・experiment_id 不一致）は **無し**。
- 指摘できる弱点は 1 点のみ: **対象クイズの level_end の ~21% が arm 未確定で無タグ**。
  特に主力の quiz-character-personality で 9/39 = 23% が無タグ。これは A/B 分析の分母から落ちるが、
  両 arm 公平に落ちるためバイアスというより検出力（サンプル目減り）の問題。cycle-272 で改善余地として記録。
