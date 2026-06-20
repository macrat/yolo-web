> cycle-255 B-525 のベースライン計測。GA4 BigQuery `analytics_524708437`、窓 2026-05-23〜06-18。来訪者価値 A/B テスト基盤の "before" ベースラインとして次サイクル以降も参照される恒久資料（設計判断は `docs/visitor-value-measurement.md`）。

# 計測現状の棚卸し (cycle-255 / B-525 足場固め)

調査日: 2026-06-20 / 調査担当: 計測在庫サブエージェント
目的: 「来訪者価値を測りながら変える A/B テスト基盤」の足場として、**何が今測れるか**と**実トラフィック量(A/B検出力評価の入力)**を実データで確定する。

すべての数値は GA4 BigQuery エクスポート (BigQuery) または GA4 MCP で取得。クエリ/レポート出所を各所に併記。**読み取り専用 (SELECT のみ)、データ書き換えなし。**

---

## 0. 前提の検証結果

| 項目                     | 値                                                  | 確認方法                                                                                                                 |
| ------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| GA4 プロパティ ID        | **524708437**                                       | `mcp__google-analytics__get_account_summaries` → `properties/524708437` (display_name: yolo-web)。cycle-254 記録と一致。 |
| BigQuery プロジェクト    | `yolo-web-gcp`                                      | analyze-bigquery skill                                                                                                   |
| BigQuery データセット    | `analytics_524708437` (**実在を確認**)              | `INFORMATION_SCHEMA.TABLES` クエリ成功                                                                                   |
| events\_ テーブル範囲    | **events_20260328 〜 events_20260618** (82テーブル) | 下記クエリ Q0                                                                                                            |
| **重要: 最新利用可能日** | **2026-06-18** (06-19 のテーブルはまだ存在しない)   | 同上                                                                                                                     |
| pseudonymous*users*      | 〜20260618                                          | 同上                                                                                                                     |

> **注意**: タスク指定の直近28日窓は 2026-05-23〜2026-06-19 だが、**06-19 のエクスポートは未生成**。本レポートの BigQuery 集計は実在範囲 **2026-05-23〜2026-06-18 (26日分)** を用いた。値は「直近約4週間」として解釈すること。06-19 を含めたい場合は GA4 MCP (run_report) で別途取得可能 (MCP は 2026-02-14 以降)。

**Q0 (テーブル範囲)**

```sql
SELECT MIN(table_name) min_t, MAX(table_name) max_t, COUNT(*) n
FROM `yolo-web-gcp.analytics_524708437.INFORMATION_SCHEMA.TABLES`
WHERE table_name LIKE 'events_2%'
-- → min=events_20260328, max=events_20260618, n=82
```

`bq` CLI はこの環境の PATH に存在しない。クエリは analyze-bigquery skill の `scripts/query.ts` (`npx tsx .claude/skills/analyze-bigquery/scripts/query.ts "<SQL>"`) 経由で実行した。

---

## A. 計測在庫 (何が今測れるか)

### A-1. データセット/テーブル実在

上記 Q0 のとおり `analytics_524708437.events_*` が 03-28 以降日次で実在。問題なくクエリ可能。

### A-2. 来訪者価値指標は現状データから算出可能か → **4指標すべて算出可能。実値を提示**

直近窓 2026-05-23〜2026-06-18 (26日)。セッションは `user_pseudo_id + ga_session_id` で定義。

| 指標                                               | 実値                    | 算出可否  | 定義/注記                                                                                                                     |
| -------------------------------------------------- | ----------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 直帰率 (bounce)                                    | **42.7%**               | ✅ 取れる | `session_engaged != '1'` (engaged でない) セッションの割合。GA4 標準の bounce = 非エンゲージ。                                |
| 平均エンゲージメント時間                           | **119.2 秒/セッション** | ✅ 取れる | `engagement_time_msec` をセッション合算→平均。                                                                                |
| 回遊深さ (pages/session)                           | **1.43 PV/セッション**  | ✅ 取れる | page_view 数 / セッション数。                                                                                                 |
| 多ページ遷移率 (補助)                              | **20.4%**               | ✅ 取れる | 2 ページ以上見たセッション割合。                                                                                              |
| より深いコンテンツへの遷移率 (/play 着地→次ページ) | **21.1%**               | ✅ 取れる | /play/\* に着地したセッションのうち、同セッションで 2 ページ以上見た割合 (95 着地中 20)。クイズ結果表示や別ページ遷移の代理。 |

**Q-A2 (価値指標)**

```sql
WITH s AS (
  SELECT
    CONCAT(user_pseudo_id, CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    MAX((SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='session_engaged')) AS engaged,
    COUNTIF(event_name='page_view') AS pv,
    SUM((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='engagement_time_msec')) AS eng_ms
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260523' AND '20260618'
  GROUP BY sid
)
SELECT COUNT(*) sessions,
  ROUND(100*COUNTIF(engaged!='1' OR engaged IS NULL)/COUNT(*),1) bounce_rate_pct,
  ROUND(AVG(eng_ms)/1000,1) avg_engagement_sec,
  ROUND(AVG(pv),2) pages_per_session,
  ROUND(100*COUNTIF(pv>=2)/COUNT(*),1) multi_page_session_pct
FROM s;
-- → 225, 42.7, 119.2, 1.43, 20.4
```

**Q-A2b (/play 着地→次ページ遷移率)**

```sql
WITH pv AS (
  SELECT CONCAT(user_pseudo_id, CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) sid,
    REGEXP_REPLACE(REGEXP_REPLACE((SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='page_location'), r'https?://[^/]+',''), r'[?#].*$','') path,
    event_timestamp
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260523' AND '20260618' AND event_name='page_view'),
land AS (SELECT sid, ARRAY_AGG(path ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] landing, COUNT(*) pv_in_session FROM pv GROUP BY sid)
SELECT COUNTIF(landing LIKE '/play/%') play_landing_sessions,
  COUNTIF(landing LIKE '/play/%' AND pv_in_session>=2) play_landing_advanced,
  ROUND(100*COUNTIF(landing LIKE '/play/%' AND pv_in_session>=2)/NULLIF(COUNTIF(landing LIKE '/play/%'),0),1) play_advance_rate_pct
FROM land;
-- → 95, 20, 21.1
```

> **インラインクイズ結果の重要な含意**: 多くのクイズ結果は同一ページ内 (インライン) に表示されるため、「結果到達」は**ページ遷移ではなく `level_end` イベント**で測るのが正しい代理指標 (A-2 の遷移率はあくまで別ページ移動の代理)。B 章 §3 参照。

### A-3. リリース識別子 / 実験・バリアント識別パラメータ → **存在しない (明記)**

直近窓に出現する **event_params キーの全一覧**を取得 (Q-A3)。結果:
`achievement_id, batch_ordering_id, batch_page_id, campaign, content_id, content_type, debug_mode, engaged_session_event, engagement_time_msec, entrances, ga_session_id, ga_session_number, ignore_referrer, item_id, level_name, medium, method, page_location, page_referrer, page_title, percent_scrolled, session_engaged, source, surface, term, variant`

- **`release` / `build_id` / `commit` / `experiment` / `experiment_id` といったリリース識別子は皆無**。デプロイを区別する手段は現状なし。
- `variant` というキーは存在するが、これは **toolbox タイル専用** (`src/lib/analytics.ts` の `tile_first_interaction` / `toolbox_tile_add/remove` で送る「タイルのバリアント」) であり、**A/B 実験のアーム識別子ではない**。実データ上も `variant` は `tile_first_interaction` に 1 件付くのみ (Q-A3b)。A/B バリアント割当の用途には**そのまま使えない (別パラメータ設計が必要)**。
- **カスタムディメンション/メトリクスは 0 件登録** (`get_custom_dimensions_and_metrics` → 空)。つまり仮に `variant` を送っても、GA4 標準レポート/探索では**ディメンションとして集計できない** (BigQuery 直クエリなら可)。A/B 基盤を作るなら「アーム識別パラメータの新設 + GA4 カスタムディメンション登録」がセットで必要。

```sql
-- Q-A3: SELECT DISTINCT ep.key FROM events_*, UNNEST(event_params) ep WHERE _TABLE_SUFFIX BETWEEN '20260523' AND '20260618'
-- Q-A3b: variant 付きイベントは tile_first_interaction/full が 1 件のみ
```

### A-4. GA4 property annotations → **使えるが、デプロイ注釈は 0 件**

`mcp__google-analytics__list_property_annotations(524708437)` は応答する。返ってきたのは **1 件のみ**:

- `Source Platform dimension update` (2026-06-10, system_generated=true) — GA4 自身が付けた仕様変更注釈。

**過去にデプロイ/リリースを記録した手動注釈は存在しない**。A/B やリリースの境界日を記録する手段として annotations は利用可能だが、現状は未活用。

---

## B. 実トラフィック量 (A/B 検出力評価の入力) — 直近約4週間 (2026-05-23〜2026-06-18, 26日)

### B-1. サイト全体

| 指標                                          | 値      |
| --------------------------------------------- | ------- |
| ページビュー (PV)                             | **321** |
| セッション                                    | **225** |
| アクティブユーザー (≈ユニーク user_pseudo_id) | **201** |

```sql
-- Q-B1
SELECT
  COUNT(DISTINCT CONCAT(user_pseudo_id, CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING))) sessions,
  COUNT(DISTINCT user_pseudo_id) users,
  COUNTIF(event_name='page_view') pageviews
FROM `yolo-web-gcp.analytics_524708437.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260523' AND '20260618';
-- → 225, 201, 321
```

> **検出力の文脈で最重要な事実**: サイト全体で **26日あたり 225 セッション / 約8.6 セッション/日**。トラフィックは極めて少ない。A/B の検出力評価はこの絶対量に強く制約される (B-4)。

### B-2. ページパス別 PV / ランディングセッション (上位、Q-B2)

着地は「セッション内の最初の page_view のパス」で定義。

| path                                                    | PV  | 着地セッション |
| ------------------------------------------------------- | --- | -------------- |
| /play/character-personality                             | 47  | 37             |
| / (トップ)                                              | 34  | 32             |
| /play/word-sense-personality                            | 26  | 22             |
| /play/traditional-color                                 | 15  | 11             |
| /blog/character-counting-guide                          | 12  | 12             |
| /play/yoji-level                                        | 10  | 10             |
| /blog (一覧)                                            | 9   | 0              |
| /tools (一覧)                                           | 8   | 1              |
| /blog/http-status-code-guide-for-rest-api               | 8   | 2              |
| /tools/traditional-color-palette                        | 8   | 6              |
| /tools/keigo-reference                                  | 7   | 7              |
| /blog/mermaid-gantt-colon-trap-and-render-testing       | 6   | 6              |
| /play/science-thinking                                  | 6   | 3              |
| /play/kotowaza-level                                    | 5   | 3              |
| /play/kanji-kanaru                                      | 4   | 1              |
| /play/yoji-personality                                  | 4   | 1              |
| /play/animal-personality                                | 3   | 1              |
| /play/character-fortune                                 | 3   | 2              |
| /play (一覧)                                            | 2   | 1              |
| /play/japanese-culture                                  | 3   | 2              |
| /play/music-personality                                 | 1   | 1              |
| /play/impossible-advice                                 | 1   | 0              |
| /play/nakamawake                                        | 2   | 1              |
| (dictionary/\* 各語は 1〜5 PV と細分化、合計でも小さい) |     |                |

```sql
-- Q-B2: 上記 A-2b と同じ pv CTE を使い、path 別に PV / DISTINCT sid / 着地数を集計し PV 降順 LIMIT 60
```

> **重要な発見 (タスク前提の補正)**: タスクが挙げた「実在クイズ slug」一覧 (character-personality / animal-personality / traditional-color / yoji-personality / impossible-advice / contrarian-fortune / unexpected-compatibility / music-personality / character-fortune) は `src/app/(legacy)/play/<slug>/` の**名前付きディレクトリ**だが、**実トラフィック上位の `word-sense-personality` `yoji-level` `science-thinking` `kotowaza-level` `japanese-culture` `kanji-level` は名前付きディレクトリが存在せず、`play/[slug]` 動的ルートで配信**されている。最初の実 A/B 対象を選ぶ際は、ディレクトリ構成ではなく**この実 URL/トラフィック表**を一次情報にすべき。

### B-3. /play 配下クイズ: 着地セッション数 と level_start/level_end (結果到達の代理)

着地セッション (Q-B3a, /result 除外) と level イベント (Q-B3b, content_id 別) を突き合わせ。`level_start`/`level_end` の content_id は `quiz-<slug>` 形式。

| /play slug                        | 着地セッション | level_start (events / sessions) | level_end (events / sessions) | 結果到達率の目安 (end_sess / 着地) |
| --------------------------------- | -------------- | ------------------------------- | ----------------------------- | ---------------------------------- |
| character-personality             | 37             | 38 / 31                         | 31 / 30                       | 30/37 ≈ 81%                        |
| word-sense-personality            | 22             | 22 / 19                         | 18 / 18                       | 18/22 ≈ 82%                        |
| traditional-color                 | 11             | 6 / 5                           | 3 / 3                         | 3/11 ≈ 27%                         |
| yoji-level                        | 10             | 6 / 6                           | 2 / 2                         | 2/10 ≈ 20%                         |
| science-thinking                  | 3              | 4 / 4                           | 3 / 3                         | — (小)                             |
| kotowaza-level                    | 3              | 3 / 3                           | (kanji-level 1)               | — (小)                             |
| japanese-culture                  | 2              | 4 / 1                           | 3 / 1                         | — (小)                             |
| character-fortune                 | 2              | 2 / 2                           | 1 / 1                         | — (小)                             |
| yoji-personality                  | 1              | 3 / 3                           | 2 / 2                         | — (小)                             |
| animal-personality                | 1              | 3 / 2                           | 3 / 2                         | — (小)                             |
| impossible-advice                 | 1              | 1 / 1                           | 1 / 1                         | — (小)                             |
| contrarian-fortune                | (着地ほぼ0)    | 1 / 1                           | 1 / 1                         | — (小)                             |
| music / nakamawake / kanji-kanaru | 1前後          | game系含む                      | game系含む                    | — (小)                             |

```sql
-- Q-B3b: level_start/level_end を content_id, content_type 別に COUNT(*) と DISTINCT セッションで集計
SELECT event_name,
  (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_id') content_id,
  (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_type') content_type,
  COUNT(*) events,
  COUNT(DISTINCT CONCAT(user_pseudo_id, CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING))) sessions
FROM `yolo-web-gcp.analytics_524708437.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260523' AND '20260618' AND event_name IN ('level_start','level_end')
GROUP BY event_name, content_id, content_type ORDER BY events DESC;
```

**示唆**: `level_end`(結果到達) はインラインクイズ結果を「見たセッション」の最良の代理。上位2クイズ (character-personality, word-sense-personality) が `level_end` セッションのほぼ全量 (30+18=48) を占め、結果到達率も 80%超と高い。**A/B のコンバージョン的指標 (結果到達 / 共有 / 評価) を載せられるのは事実上この2クイズだけ**で、それ以外は週次イベント数が一桁未満。

### B-4. A/B 2分割時の各アームのセッション概算 (検出力評価の直接入力)

2アーム均等割 (50/50) を仮定。1日あたり = 26日値 ÷ 26。各アーム = ÷ 2。

| サーフェス                            | 28日着地/対象セッション | 1日あたり | **1アーム/日** | **1アーム/28日**                      |
| ------------------------------------- | ----------------------- | --------- | -------------- | ------------------------------------- |
| サイト全体 (全セッション)             | 225                     | 8.7       | **4.3**        | **≈121** (※28日換算: 225/26×28/2≈121) |
| / (トップ着地)                        | 32                      | 1.2       | **0.6**        | **≈17**                               |
| /play/character-personality (着地)    | 37                      | 1.4       | **0.7**        | **≈20**                               |
| 〃 (level_start到達 31 sess)          | 31                      | 1.2       | **0.6**        | **≈17**                               |
| /play/word-sense-personality (着地)   | 22                      | 0.85      | **0.42**       | **≈12**                               |
| 〃 (level_start到達 19 sess)          | 19                      | 0.73      | **0.37**       | **≈10**                               |
| /play/traditional-color (着地)        | 11                      | 0.42      | **0.21**       | **≈6**                                |
| /play/yoji-level (着地)               | 10                      | 0.38      | **0.19**       | **≈5**                                |
| /tools/keigo-reference (着地)         | 7                       | 0.27      | **0.13**       | **≈4**                                |
| /blog/character-counting-guide (着地) | 12                      | 0.46      | **0.23**       | **≈6**                                |

(28日換算列は 26日実測を 28/26 倍して 2 で割った概算。**推測**: 将来トラフィックが現状並みと仮定した外挿。)

> 計算根拠の元数値はすべて B-1〜B-3 の実測。割付・日割り・28日外挿は算術 (推測ラベル該当)。

**検出力の含意 (最初の実 A/B 選定への直接示唆)**:

- 最大流入の単一クイズ `character-personality` でも **1アームあたり月20セッション程度**。`word-sense-personality` は月10前後。
- この規模では、結果到達率や直帰率のような**比率指標で意味のある MDE (最小検出可能効果) を有意水準5%・検出力80%で検出するには、現実的に数百〜千セッション/アームが必要**であり、月数十セッションでは**数ヶ月〜年単位**かかる。標準的な比率2群検定では、ベースライン50%・MDE 10pt 絶対でもアームあたり約400必要 → 現状の `character-personality` で約20/月なら**理論上 約20ヶ月**。
- 現実的な対応として基盤設計時に検討すべき: (a) /play 配下クイズ群を**横断プールして1つの実験**にする (個別 slug では量が足りない)、(b) 連続量指標 (エンゲージメント時間・スクロール深さ) を主要指標にして比率より検出力を稼ぐ、(c) 効果量の大きい大胆な変更に絞る、(d) **ベイズ/逐次評価**で「有意になるまで回す」運用にする (固定 n を前提にしない)。いずれにせよ**1クイズ単独・短期での古典的固定 n A/B は非現実的**であることがデータから明確。

---

## まとめ (基盤設計への引き継ぎ事項)

1. **測れる**: 価値指標4種 (直帰率42.7% / 平均エンゲージ119.2秒 / 1.43PV/セッション / /play着地→次ページ21.1%) は BigQuery で算出済み。結果到達は `level_end` イベントが最良の代理。
2. **足りない**: リリース/実験識別子が**ゼロ**。`variant` は toolbox 専用で流用不可。カスタムディメンション 0 件。→ **A/B アーム識別パラメータの新設 + GA4 カスタムディメンション登録 + (任意で) annotations へのデプロイ注釈運用**が基盤の必須要素。
3. **量が致命的に少ない**: 全体 8.7 セッション/日。最大クイズでも 1アーム約20セッション/月。**1クイズ単独の古典的固定 n A/B は数ヶ月〜年かかり非現実的**。プール化・連続量指標・逐次/ベイズ評価を前提に設計すべき。
4. **対象選定の一次情報**: トラフィック上位は character-personality と word-sense-personality (後者は `play/[slug]` 動的ルート)。ディレクトリ構成ではなく B-2/B-3 の実測表を A/B 対象選定の根拠にすること。
5. **データ窓の注意**: BigQuery エクスポートは 06-18 まで (06-19 未生成)。28日ぴったりが必要なら GA4 MCP (02-14 以降) を併用。
