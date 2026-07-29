# 出荷直前ベースライン（ADR001 サイト刷新）

- 取得日時: 2026-07-13 12:02 JST
- 対象期間: 2026-06-15 〜 2026-07-12（出荷前日までの28日間）
- データソース:
  - Search Console: BigQuery export `searchconsole.searchdata_url_impression`（URL単位・実データ。MCP専用ツールは無く、GA4代替でもなくSCのBigQueryエクスポートそのものを直接集計）
  - GA4: BigQuery export `analytics_524708437.events_*`（イベントデータそのもの。`mcp__google-analytics__*` はToolSearchで検索したが本セッションでは見つからず、`analyze-bigquery` スキル経由のBigQuery直接クエリで取得）
- 取得ツール: `.claude/skills/analyze-bigquery/scripts/query.ts`（BigQuery、プロジェクト `yolo-web-gcp`）
- 欠損項目:
  - **375px幅相当（モバイル）のCLS**: 取得不可。web-vitals/CLSを送信する計装がコードベースに存在しない（`grep`で該当イベント無し）。代わりにGA4 `device.category='mobile'` のセッション/PVを代替指標として記録。
  - **札保存（save）イベント**: `src/lib/analytics.ts` に保存専用イベントは実装されておらず、`share`イベントのみ存在。該当期間の`share`は全サイトで**2件**のみ（後述）。
  - **ゲームのlevel_start**: 4ゲーム（irodori/kanji-kanaru/nakamawake/yoji-kimeru）はコード上`trackContentEnd`のみを呼び`trackContentStart`を呼ばない設計（`GameContainer.tsx`各ファイル確認済み）。そのためGA4上のゲームlevel_startは常に0——欠損ではなく設計上の仕様。
  - AdSense関連指標: 本タスクのスコープ外につき取得せず（ADR記載の通り出荷後の対応）。

## 1. Search Console — カテゴリ別（サイト全体・28日合計）

集計方法: `REGEXP_REPLACE(url, r'https?://[^/]+', '')` でパス化し、`/`=top、`/tools*`=tools、`/play*`=play、`/dictionary*`=dictionary、`/blog*`=blogに分類。平均掲載順位は `SUM(sum_position)/SUM(impressions)`。

| カテゴリ            | 表示回数(impressions) | クリック(clicks) |       CTR | 平均掲載順位 |
| ------------------- | --------------------: | ---------------: | --------: | -----------: |
| dictionary          |                16,864 |               23 |     0.14% |         9.89 |
| play                |                 4,634 |              334 |     7.21% |         6.15 |
| blog                |                   863 |               20 |     2.32% |         7.63 |
| tools               |                   785 |                9 |     1.15% |        19.84 |
| top（`/`のみ）      |                     8 |                1 |    12.50% |         6.13 |
| other（未分類パス） |                    12 |                0 |     0.00% |        33.92 |
| **サイト全体合計**  |            **23,166** |          **387** | **1.67%** |     **9.41** |

## 2. Search Console — 記名クエリ「似てるキャラ診断」群（トリップワイヤ監視の基点）

対象: `/play/character-personality` に対する、クエリ文字列に「似て」「似た」または（「キャラ」かつ「診断」）を含む非匿名化クエリ（distinct 73クエリ）。

| 指標                  |    値 |
| --------------------- | ----: |
| 表示回数(impressions) | 3,101 |
| クリック(clicks)      |   222 |
| CTR                   | 7.16% |
| 平均掲載順位          |  5.86 |

参考: 上位個別クエリ（表示回数順・抜粋）

| クエリ                                 | クリック | 表示回数 |    CTR | 平均掲載順位 |
| -------------------------------------- | -------: | -------: | -----: | -----------: |
| あなたに最も近いアニメキャラ診断       |       61 |      855 |  7.13% |          4.9 |
| 自分に似てるキャラクター診断           |       38 |      638 |  5.96% |          5.5 |
| 似てるキャラ診断                       |       33 |      452 |  7.30% |          5.4 |
| あなたに最も近い アニメキャラ診断 無料 |       22 |      140 | 15.71% |          3.8 |
| あなた っ ぽい アニメキャラ診断        |        9 |      128 |  7.03% |          8.7 |
| 似ているキャラクター診断               |       13 |      110 | 11.82% |          5.0 |

`/play/character-personality`ページ全体（このクエリ群以外も含む）: クリック272・表示回数3,788（参考値）。

## 3. GA4 — カテゴリ別 セッション/PV（28日合計）

集計方法: `page_view`イベントの`page_location`をパス化し、上記と同じカテゴリ分類。セッションは `user_pseudo_id + ga_session_id` のユニーク数。

| カテゴリ           |        PV | セッション |
| ------------------ | --------: | ---------: |
| play               |       653 |        374 |
| dictionary         |       138 |        109 |
| blog               |       138 |        128 |
| top                |        45 |         41 |
| tools              |        36 |         35 |
| other              |        13 |         12 |
| **サイト全体合計** | **1,023** |    **681** |

## 4. GA4 — 診断・ゲームの開始/完了イベント（level_start / level_end）

| content_type |             level_start | level_end |         level_end/level_start |
| ------------ | ----------------------: | --------: | ----------------------------: |
| diagnosis    |                     343 |       288 |                         84.0% |
| quiz         |                      22 |        19 |                         86.4% |
| game         | 0（計装なし・設計仕様） |        11 |                      算出不可 |
| **合計**     |                 **365** |   **318** | **87.1%**（game除く分母のみ） |

`level_end`の`success`パラメータ内訳（全content_type合計）: true 314 / false 4。診断・クイズは`QuizContainer.tsx`実装上つねに`success=true`で送信されるため、false 4件はすべてゲーム（勝敗判定あり）由来。

参考: 診断・クイズをlevel_name別に見た代表値（"似てるキャラ診断"の中身＝`quiz-character-personality`）

| level_name                    | level_start | level_end |
| ----------------------------- | ----------: | --------: |
| quiz-character-personality    |         238 |       203 |
| quiz-word-sense-personality   |          34 |        23 |
| quiz-music-personality        |          14 |        12 |
| quiz-traditional-color        |          10 |        10 |
| quiz-yoji-level               |           9 |         7 |
| quiz-animal-personality       |           8 |         7 |
| quiz-kanji-level              |           8 |         8 |
| quiz-science-thinking         |           8 |         8 |
| quiz-yoji-personality         |           7 |         7 |
| quiz-unexpected-compatibility |           6 |         6 |
| quiz-contrarian-fortune       |           6 |         5 |
| quiz-kotowaza-level           |           5 |         4 |
| quiz-impossible-advice        |           4 |         2 |
| quiz-character-fortune        |           6 |         4 |
| quiz-japanese-culture         |           2 |         1 |

（ゲームのlevel_end内訳: kanji-kanaru 4, irodori 2, nakamawake 1, yoji-kimeru 4)

## 5. GA4 — デバイス種別（375px幅=モバイルの代替指標）

CLS自体は計装が無く取得不可のため、モバイル比率を代替指標として記録。

| device.category |        PV | セッション |
| --------------- | --------: | ---------: |
| desktop         |       575 |        320 |
| mobile          |       409 |        346 |
| tablet          |        38 |         14 |
| smart tv        |         1 |          1 |
| **合計**        | **1,023** |    **681** |

モバイルPV比率: 40.0%（409/1,023）。モバイルセッション比率: 50.8%（346/681）。

## 6. GA4 — share（共有）イベント

該当期間の全件（n=2、実測。捏造・推測なし）:

| event_date | method    | content_type | item_id                |
| ---------- | --------- | ------------ | ---------------------- |
| 2026-07-07 | web_share | diagnosis    | quiz-music-personality |
| 2026-07-10 | web_share | game         | yoji-kimeru            |

札保存（save）専用イベントは存在しないため取得対象外（上記「欠損項目」参照）。
