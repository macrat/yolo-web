-- ============================================================================
-- quiz-question-dropoff.sql
-- yolos.net 診断・クイズの設問単位 離脱局在 恒久クエリ (B-613 / cycle-301)
-- ============================================================================
--
-- 役割: 「何問目で止まったか」を BigQuery だけで読む。cycle-300 §3-1 で
--       完走率(level_end/level_start)が 85.3%→72.0% に落ちたことは分かったが、
--       設問インデックスの次元が無く離脱の局在が読めなかった。本 SQL は
--       B-613 で追加する `question_answered` イベントを読み、設問別の
--       ハザード(「q-1 まで答えた人のうち q を答えなかった割合」)を出す。
--
-- 前提となる計装（設計は docs/cycles/cycle-301/instrumentation-design.md）:
--   event_name = 'question_answered'
--   params     = content_id / content_type / question_number / question_total
--                / question_id
--   起点規約   = question_number は **1 起点**。不変条件 1 <= number <= total。
--   発火点     = QuizContainer.handleAnswer（設問に回答した時・1箇所）
--   ※ `release` は gtag config 経由で全イベントに自動付与される（実測確認済み・
--      例 "033b2dd-20260727"）。**本 SQL は出荷境界の汚染除去にこれを使う**（下記）。
--   ※ `ab_variant` / `experiment_id` は **載せない**（archive/visitor-value-
--      measurement.md 論点4「主要イベントに限定」を採用）。arm 別に読むときは
--      sid join（設計 §2-3）。
--
-- 実行: 各 SECTION は独立した SELECT 文。1 SECTION ずつ実行する。
--       npx tsx .claude/skills/analyze-bigquery/scripts/query.ts --file <file>
--       (SELECT のみ・読取専用。憲法ルール2・skill 制約)
--
-- ----------------------------------------------------------------------------
-- パラメータ (実行時に置換する)
-- ----------------------------------------------------------------------------
--   <FROM> / <TO> : 集計期間窓。events_YYYYMMDD の YYYYMMDD 文字列。
--                   例(B-613 出荷後の読み取り窓 = ADR001 +4週 ≒ 2026-08-10):
--                     <FROM> = 20260801   (**出荷日の翌日**。出荷 2026-07-31 の場合)
--                     <TO>   = 20260809
--
--   ★ <FROM> に**出荷日そのものを入れてはならない**。出荷当日は「はじめる」を
--     押した来訪者の 3〜4 割が旧バンドル（キャッシュ）で、question_answered を
--     一度も送らない。実測(release 別 level_start・quiz-% 限定):
--       20260726: 当日リリース 2f53c57-20260726 = 22 / 旧 9608ddd-20260725 = 9
--                 → 旧バンドル 29%
--       20260727: 当日リリース 033b2dd-20260727 = 19 /
--                 旧 fd088fa-20260726 = 12 + a841f58-20260726 = 3 → 旧バンドル 44%
--     この run は level_start はあるが question_answered が無いため、素朴に
--     集計すると at_risk(q=1) の分母に answered=0 として入り、**設問1の
--     dropoff_pct を偽に押し上げ、全設問の survival_pct を押し下げる**
--     （survival は q=1 の at_risk を分母にする）。10日窓でも q1 に数 pt、
--     出荷当日だけなら 30〜40pt の偽の上振れになる。
--
--   ★ 出荷日を外しても旧バンドルは残る（CDN/ブラウザキャッシュ）。そのため
--     SECTION 1 は **release による run 単位のフィルタ**を必ず通す（下記）。
--
-- ----------------------------------------------------------------------------
-- 出荷境界の汚染除去: release による run 単位フィルタ
-- ----------------------------------------------------------------------------
--   `instrumented_releases` = 窓内で question_answered を1件でも送った release。
--   run 内の**全イベント**がその集合の release を持つとき、その run を
--   「計装済み run」(run_instrumented) とし、SECTION 1 はこれだけを集計する。
--
--   なぜ日付比較（release 末尾の YYYYMMDD >= 出荷日）にしないか: 同一日に
--   複数リリースが出る。実測（窓 20260713-20260728・quiz-% の level_start /
--   level_end に現れた release の異なる値は 45＝うち 1 つは NULL なので 44
--   リリース。ビルド日が 20260724 のものだけで 6 リリース）。日付粒度では
--   「出荷コミットより前に同日ビルドされたバンドル」を弁別できない。
--   question_answered の実在で定めれば、その弁別が自動で効く（自己校正）。
--
--   残る偏り（正直に記録する）: 計装済みだが窓内で question_answered が
--   1件も出なかった release（極小トラフィック）の run は丸ごと除外される。
--   除外は分子と分母の両方から起きるので率は壊れないが、その release の
--   「q1 で落ちた人」が消えるため **q1 の離脱はわずかに過小**に出る。
--   SECTION 2 の `runs_uninstrumented_release` と `runs_no_answer_by_release`
--   を見て、除外された run が旧バンドル由来であることを確認すること。
--
--   出荷前の窓に対して実行すると `instrumented_releases` は空になり、
--   SECTION 1 は 0 行・SECTION 2 は `runs_uninstrumented_release = runs` に
--   なる。「まだ読めない」が数字で出るのが正しい挙動。
--
-- ----------------------------------------------------------------------------
-- 中核概念: run（1回の挑戦）
-- ----------------------------------------------------------------------------
--   セッション×コンテンツは 1 回の挑戦とは一致しない。実測(窓 20260713-20260728・
--   quiz-% 限定)では セッション×クイズの組 309 のうち 40 組(=level_start を持つ
--   308 組の 13.0%)が level_start を 2 回以上持ち、最大 4 回だった。結果画面の
--   「もう一度挑戦」(handleRetry)は intro に戻すため、再挑戦は必ず新しい
--   level_start を伴う。したがって設問番号を素朴にセッション単位で集計すると
--   2 回目の挑戦の q1 が 1 回目の離脱を打ち消して**離脱が過小に見える**。
--
--   そこで `level_start` を境界として窓関数でセッション×コンテンツ内を run に
--   分割する（run_no = その行までに観測した level_start の累積数）。
--
--   run_no = 0 の run（= level_start より前に question_answered がある run）は
--   **orphan run** と呼ぶ。level_start の欠落（セッション跨ぎ・計測欠落）で実在する
--   ——実測でも quiz-character-personality に level_end だけを持つ run が 1 件あった。
--   捨てずに数え、SECTION 2/3 で件数を可視化する。
--
--   ORDER BY のタイブレーク `ord`（level_start=0 / question_answered=1 /
--   level_end=2）が効くのは **level_start が他イベントと同一 event_timestamp に
--   なった場合だけ** である。run_no は `COUNTIF(level_start)` の累積なので、
--   question_answered と level_end の相対順序は結果を変えない（最終問で両者が
--   同値 timestamp になっても run 分割は不変。SECTION 4 で ord を入れ替えても
--   全 assertion が PASS することを確認済み）。
--   ord が実際に守っているケース: level_start と同一 timestamp の
--   question_answered があるとき、ord が無いと answer が level_start より前に
--   並びうる＝run_no=0（orphan run）に落ちて run が2つに割れる。ord=0 を
--   level_start に与えることでこれを防ぐ（SECTION 4 の S8 で検査）。
--   限界: run1 の level_end と run2 の level_start が同一 timestamp になった場合は
--   ord が level_start(0) を先に置くため level_end が run2 に落ちる。二度のクリックが
--   同一マイクロ秒に入る必要があり実際には起きない（実データで該当0件）が、
--   原理的な穴として SECTION 4 の S8 に回帰記録として残してある。
--
-- ----------------------------------------------------------------------------
-- 中核概念: 生存曲線としての answered_max
-- ----------------------------------------------------------------------------
--   `answered_max` = その run で回答が観測された最大の question_number。
--   回答は必ず 1 から順に進むため（currentIndex は +1 ずつ）、
--   「q を答えた」⟺「answered_max >= q」が成り立つ。よって
--     at_risk_q  = COUNTIF(answered_max >= q-1)   … q を答える機会まで到達した run
--     answered_q = COUNTIF(answered_max >= q)     … 実際に q を答えた run
--     dropoff_q  = 1 - answered_q / at_risk_q
--   と定義する。answered_q は q について単調非増加＝生存曲線になる
--   （※ 定義上必ず単調非増加なので、単調性そのものは検査の意味を持たない。
--      読むべきは「どこに段差があるか」＝ dropoff_excess_pt）。
--
--   at_risk(q=1) の実装は `has_start OR answered_max >= 1` である。つまり
--   **level_start を持つ run に加えて、level_start を欠くが1問以上答えた run
--   （orphan run）も含む**。したがって at_risk(q=1) は SECTION 2 の
--   `runs_with_start`（全 run・release フィルタなし）と一致しない。
--
--   二重発火（同じ question_number が 2 行）は MAX / COUNT(DISTINCT) で自然に
--   吸収される。これは仮定ではなく実測上の必要事項——実測(窓 20260713-20260728)で
--   quiz-character-personality の 221 完走 run のうち **3 run (1.4%) が level_end を
--   2 回**送っており（間隔 0〜175,412 マイクロ秒・1 run は同一イベントバンドル）、
--   回答ハンドラの二重発火は本番で現に起きていた。**この機序は B-620 で是正中——
--   第1段（QuestionCard.tsx の answerSubmittedRef）は実装済みだが、レビュー2巡目で
--   不完全と判定され第2段(E3b: 親 QuizContainer の冪等化ほか)が未完である
--   （cycle-301 §E / review-log.md 2巡目・2026-07-30 22:00 時点）**。吸収ロジックは
--   残す——観測された二重発火は「まだ塞がっていない経路」の指標になる。
--
--   「at_risk」を「saw（設問を見た）」と呼ばない理由: knowledge クイズ(3本)は
--   回答後に解説を挟み「次へ」を押して初めて次設問が現れる（QuestionCard の
--   answered 分岐）。question_answered だけでは「解説画面で離脱した」と
--   「次設問を見たが答えなかった」を区別できない。したがって本 SQL が測るのは
--   **「q-1 を答えた人が q を答えたか」**であって「q を見たか」ではない。
--   personality(12本)は回答即遷移なので両者は一致する。
--
-- ----------------------------------------------------------------------------
-- 恒久的な読み方の注意
-- ----------------------------------------------------------------------------
--   (a) SECTION 1 は `totals`（question_answered から作る設問数表）を INNER JOIN
--       するため、**窓内に question_answered が1件も無いコンテンツは行ごと消える**。
--       低 n では「全員が q1 で落ちた」と「そのコンテンツのデータが無い」が
--       SECTION 1 だけでは区別できない。コンテンツの実在は SECTION 2（LEFT JOIN・
--       question_answered が皆無でも run を数える）で確認する。
--   (b) at_risk が小さい行（<20 目安）は率を読まない——1 件が 5pt 以上動く。
--   (c) モバイルは離脱時の最終ビーコンが届かないことが多く、「答えなかった」と
--       「計測が欠けた」を区別できない（docs/knowledge/2026-07-12-research-and-
--       verification-techniques.md）。runs_no_answer_observed / min_question_number
--       の異常を「発火漏れ」と決めつける前に、この欠落と release を確認する。
--
-- ----------------------------------------------------------------------------
-- 不変条件（SECTION 3 が機械的に検査する）
-- ----------------------------------------------------------------------------
--   (1) 1 <= question_number <= question_total          … 1 起点規約 (FAIL)
--   (2) MIN(question_number) = 1                        … 0 起点混入の疑い (WARN)
--   (3) answered_distinct = answered_max                … 番号の飛びが無い
--   (4) question_total = 実装の questionCount           … SECTION 3 の期待値表と一致
--   (5) content_id ごとに question_total は単一値
-- ============================================================================


-- ============================================================================
-- SECTION 1 : 設問別 離脱ハザード（主クエリ）
-- ----------------------------------------------------------------------------
-- 出力列:
--   content_id        : quiz-<slug>
--   question_number   : 1 起点の設問番号
--   at_risk           : q-1 を答えた run 数（q=1 は has_start OR answered_max>=1。
--                       orphan run を含むので runs_with_start とは一致しない）
--   answered          : q を答えた run 数
--   dropoff_pct       : この設問で落ちた割合 = 100*(1 - answered/at_risk)
--   survival_pct      : 開始 run に対する到達率 = 100*answered/(q=1 の at_risk)
--   dropoff_excess_pt : dropoff_pct - そのコンテンツの dropoff_pct 中央値。
--                       「崖」の位置を機械的に浮かせる列（survival の単調性は
--                       定義上必ず成立するので検査にならない＝そちらは読まない）
--
-- 対象は **計装済み run のみ**（release フィルタ。ヘッダ参照）。出荷境界の
-- 旧バンドル run を分母から外さないと q1 の dropoff が偽に上振れる。
--
-- 読み方: dropoff_excess_pt が大きく正の question_number が離脱の局在。
--   survival_pct はファネル全体の減衰の形を見る。at_risk<20 の行は読まない。
-- ============================================================================
WITH src AS (
  SELECT
    CONCAT(
      user_pseudo_id, '|',
      CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)
    ) AS sid,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_id')   AS content_id,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_type') AS content_type,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='release')      AS release_id,
    event_name,
    event_timestamp AS ts,
    -- gtag は整数値を int_value に入れるが、将来の送り方の変化（小数化・文字列化）で
    -- 静かに NULL 化しないよう double_value も拾う。string_value は拾わない
    -- （型が崩れたら SECTION 3 の null_question_number で気づけるべきなので、
    --   ここで隠蔽しない）。
    COALESCE(
      (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='question_number'),
      CAST((SELECT ep.value.double_value FROM UNNEST(event_params) ep WHERE ep.key='question_number') AS INT64)
    ) AS qn,
    COALESCE(
      (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='question_total'),
      CAST((SELECT ep.value.double_value FROM UNNEST(event_params) ep WHERE ep.key='question_total') AS INT64)
    ) AS qt
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '<FROM>' AND '<TO>'
    AND event_name IN ('level_start', 'question_answered', 'level_end')
),
ev AS (
  SELECT *, CASE event_name WHEN 'level_start' THEN 0 WHEN 'question_answered' THEN 1 ELSE 2 END AS ord
  FROM src
  WHERE content_id LIKE 'quiz-%'   -- ゲーム(裸 slug)・占い(fortune-*)を除外
),
instrumented_releases AS (
  -- 計装が乗っているバンドルを実測で定める（ヘッダ「出荷境界の汚染除去」）。
  SELECT DISTINCT release_id FROM ev
  WHERE event_name='question_answered' AND release_id IS NOT NULL
),
ev2 AS (
  SELECT e.*, (ir.release_id IS NOT NULL) AS ev_instrumented
  FROM ev e LEFT JOIN instrumented_releases ir USING (release_id)
),
tagged AS (
  SELECT *,
    COUNTIF(event_name='level_start') OVER (
      PARTITION BY sid, content_id ORDER BY ts, ord
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS run_no
  FROM ev2
),
totals AS (
  -- content_id ごとの設問数。SECTION 3 (5) で単一値であることを検査する。
  SELECT content_id, MAX(qt) AS q_total
  FROM tagged
  WHERE event_name='question_answered' AND qt IS NOT NULL
  GROUP BY content_id
),
runs AS (
  SELECT sid, content_id, run_no,
    LOGICAL_OR(event_name='level_start') AS has_start,
    LOGICAL_OR(event_name='level_end')   AS has_end,
    -- run 内の全イベントが計装済み release なら計装済み run。1つでも旧バンドル
    -- （または release 欠落）が混ざる run は SECTION 1 の集計から外す。
    LOGICAL_AND(ev_instrumented)         AS run_instrumented,
    -- 不変条件 (1) を満たす行だけを集計に入れる。違反行は SECTION 3 が報告する。
    MAX(IF(event_name='question_answered' AND qn BETWEEN 1 AND qt, qn, NULL))   AS answered_max,
    MIN(IF(event_name='question_answered' AND qn BETWEEN 1 AND qt, qn, NULL))   AS answered_min,
    COUNT(DISTINCT IF(event_name='question_answered' AND qn BETWEEN 1 AND qt, qn, NULL)) AS answered_distinct,
    COUNTIF(event_name='question_answered' AND qn BETWEEN 1 AND qt)             AS answered_rows
  FROM tagged
  GROUP BY sid, content_id, run_no
),
axis AS (
  -- run × 設問番号(1..q_total) の全格子。at_risk=0 の設問も行として残し、
  -- 「読めなかった」ことを NULL で明示する（行の欠落で隠さない）。
  SELECT r.content_id, r.run_no, r.has_start, r.answered_max, q
  FROM runs r
  JOIN totals tt USING (content_id), UNNEST(GENERATE_ARRAY(1, tt.q_total)) AS q
  WHERE r.run_instrumented          -- ★ 出荷境界の旧バンドル run を除外
),
per_q AS (
  SELECT content_id, q AS question_number,
    COUNTIF(IF(q=1, has_start OR IFNULL(answered_max,0) >= 1, IFNULL(answered_max,0) >= q-1)) AS at_risk,
    COUNTIF(IFNULL(answered_max,0) >= q) AS answered
  FROM axis
  GROUP BY content_id, q
),
per_q_out AS (
  SELECT
    content_id,
    question_number,
    at_risk,
    answered,
    ROUND(100 * (1 - SAFE_DIVIDE(answered, at_risk)), 1) AS dropoff_pct,
    ROUND(100 * SAFE_DIVIDE(
      answered,
      MAX(IF(question_number=1, at_risk, NULL)) OVER (PARTITION BY content_id)
    ), 1) AS survival_pct
  FROM per_q
)
SELECT
  *,
  -- 中央値からの乖離。IGNORE NULLS を落とすと at_risk=0 の行（dropoff_pct NULL）が
  -- 中央値を汚すので必須（SECTION 4 の qbad で検査している）。
  ROUND(
    dropoff_pct - PERCENTILE_CONT(dropoff_pct, 0.5 IGNORE NULLS) OVER (PARTITION BY content_id),
    1
  ) AS dropoff_excess_pt
FROM per_q_out
ORDER BY content_id, question_number;


-- ============================================================================
-- SECTION 2 : run サマリ（分母の健全性・リトライ・完走・出荷境界）
-- ----------------------------------------------------------------------------
-- SECTION 1 の分母が信用できるかを確かめるためのクエリ。既存系列
-- (level_start / level_end の件数) と再構成した run の対応を見る。
--
-- ★ 出力の run 系集計は **release フィルタを掛けていない**（全 run）。
--   既存系列との突合（下記の整合チェック）を成立させるため。計装済みだけを
--   見たい列は *_instrumented / *_uninstrumented_release として別に出す。
--
-- 出力列:
--   runs                        : 再構成した run 数（全 run）
--   runs_with_start             : level_start を含む run 数（= level_start の件数と一致すべき）
--   orphan_runs                 : level_start を欠く run 数（run_no=0）
--   runs_with_end               : level_end を含む run 数。**level_end の件数とは
--                                 一致しうる／しないが、意味が違う**——二重発火した
--                                 run では件数の方が多くなる。B-620（二重発火の
--                                 是正・cycle-301 §E）**出荷前**の実測では
--                                 quiz-character-personality が 224 件 vs 221 run
--                                 だった。**B-620 の第2段(E3b)完了後は一致するはず**。
--                                 第1段だけの時点では別 task の2回タップが残るため
--                                 一致しないことがある（どちらの時点の窓を読んでいるか
--                                 を E3b の出荷日で確認する）。
--   runs_completed              : answered_max = q_total の run 数（= 最終問まで答えた）
--   runs_no_answer_observed     : question_answered が 1 件も無い run 数（全 run）。
--                                 出荷境界では**旧バンドル由来**が主因になる。
--   runs_no_answer_instrumented : 上のうち計装済み release の run。**発火漏れの
--                                 指標はこちら**（旧バンドルを除いた残り）。
--   runs_uninstrumented_release : 計装済みでない release を含む run 数（＝除外された run）。
--                                 出荷前の窓では runs と同数になる。
--   runs_no_answer_by_release   : runs_no_answer_observed の release 別内訳（上位8件）。
--                                 旧バンドル由来か発火漏れかを **release で弁別**する。
--   avg_last_answered           : 最後に答えた設問番号の平均
--   duplicate_answer_rows       : 同一 run・同一 question_number の重複行数（二重発火）。
--                                 B-620 の第2段(E3b)完了後は 0 であるべき。
--   runs_with_gap               : answered_distinct <> answered_max の run 数（番号の飛び）
--
-- 整合チェック: personality(12本)は最終問の question_answered と level_end が
--   同一ハンドラ内で連続送出されるため runs_completed ≒ runs_with_end になるべき。
--   大きく乖離したら発火点かクエリのどちらかが壊れている。
--   **knowledge(3本)は例外で runs_completed > runs_with_end になりうる**——最終問に
--   回答した後さらに「次へ」を押さないと level_end が出ないため、「全問答えたが
--   結果を見ていない」run が構造的に存在する。knowledge を混ぜて整合を読まない。
-- ============================================================================
WITH src AS (
  SELECT
    CONCAT(
      user_pseudo_id, '|',
      CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)
    ) AS sid,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_id') AS content_id,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='release')    AS release_id,
    event_name,
    event_timestamp AS ts,
    COALESCE(
      (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='question_number'),
      CAST((SELECT ep.value.double_value FROM UNNEST(event_params) ep WHERE ep.key='question_number') AS INT64)
    ) AS qn,
    COALESCE(
      (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='question_total'),
      CAST((SELECT ep.value.double_value FROM UNNEST(event_params) ep WHERE ep.key='question_total') AS INT64)
    ) AS qt
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '<FROM>' AND '<TO>'
    AND event_name IN ('level_start', 'question_answered', 'level_end')
),
ev AS (
  SELECT *, CASE event_name WHEN 'level_start' THEN 0 WHEN 'question_answered' THEN 1 ELSE 2 END AS ord
  FROM src WHERE content_id LIKE 'quiz-%'
),
instrumented_releases AS (
  SELECT DISTINCT release_id FROM ev
  WHERE event_name='question_answered' AND release_id IS NOT NULL
),
ev2 AS (
  SELECT e.*, (ir.release_id IS NOT NULL) AS ev_instrumented
  FROM ev e LEFT JOIN instrumented_releases ir USING (release_id)
),
tagged AS (
  SELECT *,
    COUNTIF(event_name='level_start') OVER (
      PARTITION BY sid, content_id ORDER BY ts, ord
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS run_no
  FROM ev2
),
totals AS (
  SELECT content_id, MAX(qt) AS q_total
  FROM tagged WHERE event_name='question_answered' AND qt IS NOT NULL GROUP BY content_id
),
runs AS (
  SELECT sid, content_id, run_no,
    LOGICAL_OR(event_name='level_start') AS has_start,
    LOGICAL_OR(event_name='level_end')   AS has_end,
    LOGICAL_AND(ev_instrumented)         AS run_instrumented,
    -- run を代表する release（最初に観測したもの）。内訳の集計キーに使う。
    (ARRAY_AGG(release_id IGNORE NULLS ORDER BY ts, ord LIMIT 1))[SAFE_OFFSET(0)] AS run_release,
    MAX(IF(event_name='question_answered' AND qn BETWEEN 1 AND qt, qn, NULL))   AS answered_max,
    COUNT(DISTINCT IF(event_name='question_answered' AND qn BETWEEN 1 AND qt, qn, NULL)) AS answered_distinct,
    COUNTIF(event_name='question_answered' AND qn BETWEEN 1 AND qt)             AS answered_rows
  FROM tagged
  GROUP BY sid, content_id, run_no
),
no_answer_by_release AS (
  -- 「question_answered が 1 件も無い run」を release 別に数える。
  -- 出荷直後に runs_no_answer_observed が大きいとき、それが旧バンドル由来か
  -- 発火漏れかを、この内訳で弁別する（発火漏れなら計装済み release に集まる）。
  SELECT content_id,
    STRING_AGG(FORMAT('%s:%d', IFNULL(run_release, '(null)'), c), ' / '
               ORDER BY c DESC, run_release LIMIT 8) AS runs_no_answer_by_release
  FROM (
    SELECT content_id, run_release, COUNT(*) AS c
    FROM runs
    WHERE answered_max IS NULL
    GROUP BY content_id, run_release
  )
  GROUP BY content_id
),
summary AS (
  SELECT
    r.content_id,
    ANY_VALUE(tt.q_total)                       AS q_total,
    COUNT(*)                                    AS runs,
    COUNTIF(r.has_start)                        AS runs_with_start,
    COUNTIF(NOT r.has_start)                    AS orphan_runs,
    COUNTIF(r.has_end)                          AS runs_with_end,
    COUNTIF(r.answered_max = tt.q_total)        AS runs_completed,
    COUNTIF(r.answered_max IS NULL)             AS runs_no_answer_observed,
    COUNTIF(r.answered_max IS NULL AND r.run_instrumented) AS runs_no_answer_instrumented,
    COUNTIF(NOT r.run_instrumented)             AS runs_uninstrumented_release,
    ROUND(AVG(r.answered_max), 2)               AS avg_last_answered,
    SUM(r.answered_rows - r.answered_distinct)  AS duplicate_answer_rows,
    COUNTIF(r.answered_max IS NOT NULL AND r.answered_distinct <> r.answered_max) AS runs_with_gap
  FROM runs r
  LEFT JOIN totals tt USING (content_id)   -- question_answered が皆無でも run を数える
  GROUP BY r.content_id
)
SELECT s.*, n.runs_no_answer_by_release
FROM summary s
LEFT JOIN no_answer_by_release n USING (content_id)
ORDER BY s.runs DESC;


-- ============================================================================
-- SECTION 3 : 計装の健全性点検（不変条件の機械検査）
-- ----------------------------------------------------------------------------
-- 出荷直後に必ず 1 回実行する。verdict が FAIL の行があれば計装かクエリが
-- 壊れている。WARN は「壊れているとは断定できないが読む前に理由を確かめる」印。
-- 「0 起点混入」は目視でなくここで検出する（AP-I01: 形式的な充足確認で
-- 済ませない ＝ 逆に、機械が検査できることは機械に検査させる）。
--
-- 期待 questionCount は 2026-07-30 に src/play/quiz/registry.ts を tsx で走査した
-- 実装値（15本・meta.questionCount と questions.length が全本一致）。
-- クイズを追加・改訂したらこの表を更新する。
-- ★ この表と registry.ts の突合は**単体テストで機械強制する**
--   （instrumentation-design.md §2-7 T8）。手で直すことが唯一の担保という
--   状態にしない——同設計 §2-4 が立てた「機械が検査できることは機械に検査
--   させる」の適用を、SQL 側のハードコードにも掛ける。
-- ============================================================================
WITH expected AS (
  SELECT * FROM UNNEST([
    STRUCT('quiz-kanji-level' AS content_id, 10 AS expected_total),
    ('quiz-kotowaza-level', 10), ('quiz-yoji-level', 10),
    ('quiz-traditional-color', 8), ('quiz-yoji-personality', 8),
    ('quiz-impossible-advice', 7), ('quiz-contrarian-fortune', 8),
    ('quiz-unexpected-compatibility', 8), ('quiz-music-personality', 10),
    ('quiz-character-fortune', 8), ('quiz-animal-personality', 10),
    ('quiz-science-thinking', 20), ('quiz-japanese-culture', 18),
    ('quiz-character-personality', 12), ('quiz-word-sense-personality', 10)
  ])
),
src AS (
  SELECT
    CONCAT(
      user_pseudo_id, '|',
      CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)
    ) AS sid,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_id')   AS content_id,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_type') AS content_type,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='question_id')  AS question_id,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='release')      AS release_id,
    event_name,
    event_timestamp AS ts,
    COALESCE(
      (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='question_number'),
      CAST((SELECT ep.value.double_value FROM UNNEST(event_params) ep WHERE ep.key='question_number') AS INT64)
    ) AS qn,
    COALESCE(
      (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='question_total'),
      CAST((SELECT ep.value.double_value FROM UNNEST(event_params) ep WHERE ep.key='question_total') AS INT64)
    ) AS qt
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '<FROM>' AND '<TO>'
    AND event_name IN ('level_start', 'question_answered', 'level_end')
),
ev AS (
  SELECT *, CASE event_name WHEN 'level_start' THEN 0 WHEN 'question_answered' THEN 1 ELSE 2 END AS ord
  FROM src WHERE content_id LIKE 'quiz-%'
),
tagged AS (
  SELECT *,
    COUNTIF(event_name='level_start') OVER (
      PARTITION BY sid, content_id ORDER BY ts, ord
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS run_no
  FROM ev
),
answers AS (
  SELECT sid, content_id, content_type, question_id, release_id, run_no, qn, qt
  FROM tagged WHERE event_name='question_answered'
),
dups AS (
  SELECT content_id, COUNT(*) AS dup_pairs FROM (
    SELECT content_id, sid, run_no, qn FROM answers
    GROUP BY content_id, sid, run_no, qn HAVING COUNT(*) > 1
  ) GROUP BY content_id
),
checks AS (
  SELECT
    a.content_id,
    COUNT(*)                                   AS answer_rows,
    COUNT(DISTINCT a.release_id)               AS distinct_releases_seen,
    COUNTIF(a.qn IS NULL)                      AS null_question_number,
    COUNTIF(a.qt IS NULL)                      AS null_question_total,
    COUNTIF(a.question_id IS NULL)             AS null_question_id,
    COUNTIF(a.content_type IS NULL)            AS null_content_type,
    COUNTIF(a.qn < 1)                          AS violation_number_lt_1,
    COUNTIF(a.qn > a.qt)                       AS violation_number_gt_total,
    MIN(a.qn)                                  AS min_question_number,
    MAX(a.qn)                                  AS max_question_number,
    COUNT(DISTINCT a.qt)                       AS distinct_totals_seen,
    MAX(a.qt)                                  AS question_total_seen,
    COUNTIF(a.run_no = 0)                      AS rows_in_orphan_run,
    IFNULL(MAX(d.dup_pairs), 0)                AS duplicate_pairs
  FROM answers a LEFT JOIN dups d USING (content_id)
  GROUP BY a.content_id
)
SELECT
  c.*,
  e.expected_total,
  CASE
    WHEN e.expected_total IS NULL                     THEN 'FAIL: unknown content_id (registry 更新漏れ?)'
    WHEN c.null_question_number > 0
      OR c.null_question_total > 0
      OR c.null_question_id > 0
      OR c.null_content_type > 0                      THEN 'FAIL: missing param'
    WHEN c.violation_number_lt_1 > 0                  THEN 'FAIL: number < 1 (0 起点混入)'
    WHEN c.violation_number_gt_total > 0              THEN 'FAIL: number > total'
    WHEN c.distinct_totals_seen <> 1                  THEN 'FAIL: total が単一値でない'
    WHEN c.question_total_seen <> e.expected_total     THEN 'FAIL: total が実装 questionCount と不一致'
    -- min(number) <> 1 は WARN。qn<1（確実な 0 起点混入）と重大度が違う——
    -- 低 n＋モバイルのビーコン欠落で q1 の 1 件が落ちるだけでも成立する
    -- （15本中12本は16日で run 1〜15 しかない）。FAIL にすると存在しないバグを
    -- 追わせる。WARN が出たら runs_with_start と runs_no_answer_by_release を見る。
    WHEN c.min_question_number <> 1                   THEN 'WARN: min(number) <> 1 (欠落でも起きる。qn<1 とは別物)'
    ELSE 'PASS'
  END AS verdict
FROM checks c
LEFT JOIN expected e USING (content_id)
ORDER BY c.answer_rows DESC;
-- 注: duplicate_pairs > 0 と rows_in_orphan_run > 0 は FAIL にしない。どちらも
--     本番で実在する雑音であり（orphan run は実測 1 件）、SECTION 1 の
--     MAX / COUNT(DISTINCT) で吸収済み。率が跳ねたときに気づくための観測列。
--     ただし duplicate_pairs は B-620（二重発火の是正・答えの欠落を伴う欠陥）の
--     第2段(E3b)完了後は 0 が期待値なので、0 でなければ修正の不完全を疑う。
--     runs_with_gap（SECTION 2）が 0 でない場合も同様——回答が 1 問飛ばされた
--     ことを意味し、来訪者に返る診断結果からも 1 問分の回答が落ちている疑いがある。
--     **B-620 の第1段（QuestionCard.tsx の answerSubmittedRef）以後に非 0 が出るなら、
--     帰属先は「ガードが無いこと」ではなく「まだ塞がっていない経路」である**——
--     実ブラウザ検証で確認された経路は (a) 別 task で届く 2 回目の実タップ
--     （0〜500ms のすべての間隔で設問が飛ぶ）と (b) knowledge の「次へ」(onNext) の
--     無ガード。どちらも第2段(E3b)の対象。cycle-301 review-log.md 2巡目を参照。


-- ============================================================================
-- SECTION 4 : 合成データによる自己検証（期待値は手計算・実行して PASS を確認）
-- ----------------------------------------------------------------------------
-- SECTION 1〜3 のロジックを、実データに依存せず検証する。events_* を参照しない
-- ので、いつでも・question_answered の実データが無くても実行できる。
-- SECTION 1〜3 のロジックを変更したら**必ずここも実行して全 PASS を確認する**。
--
-- 検証範囲（ヘッダの網羅性の主張はここで担保する）:
--   per_q / run_summary / health の中間値だけでなく、SECTION 1 の最終出力
--   （SAFE_DIVIDE・ROUND・survival の分母となる MAX(...) OVER (PARTITION BY
--   content_id)・PERCENTILE_CONT IGNORE NULLS）と SECTION 3 の verdict の
--   CASE 分岐順序、および release による run 単位フィルタまで通す。
--
-- 合成シナリオ（'q3' は q_total=3。他は検査目的ごとに content を隔離）:
--   S1  s1  完走                     : start, q1, q2, q3, end
--   S2  s2  途中離脱                 : start, q1
--   S3  s3  はじめるだけ             : start のみ（計装済み release）
--   S4  s4  離脱後リトライ完走       : start, q1 / start, q1, q2, q3, end  (2 run)
--   S5  s5  二重発火                 : start, q1, q1, q2, q3, end
--   S6  s6  level_start 欠落(orphan) : q1, q2
--   S7  s7  不変条件違反(qbad)       : start, q=0, q=1, q=4  (total=3)
--   S8  s8  ord が守るケース(qtie)   : start と q1 が**同一 ts** → 同一 run に入るべき
--       s9  ord の原理的な穴(qtie)   : run1 の end と run2 の start が同一 ts
--   S9  s11 param 欠落(qnull)        : question_id が NULL → FAIL が WARN より優先
--   S10 s10 旧バンドル(q3)           : start のみ・question_answered を送らない release
--   S11 s12 registry 未登録(qnew)    : expected 表に無い content_id
--   S12 s13 min(number)<>1 (qwarn)   : q1 のビーコン欠落 → WARN（FAIL ではない）
--
-- 手計算した期待値（本文の定義から導出）:
--   q3 q1: at_risk 7 (s1,s2,s3,s4r1,s4r2,s5,s6) / answered 6 (s3 以外) / 14.3%
--          ※ s10（旧バンドル）は release フィルタで除外される。除外しなければ
--            at_risk 8 / dropoff 25.0% になり **設問1の離脱が 10.7pt 偽に上振れる**。
--   q3 q2: at_risk 6 (max>=1)                   / answered 4 (s1,s4r2,s5,s6) / 33.3%
--   q3 q3: at_risk 4 (max>=2: s1,s4r2,s5,s6)    / answered 3 (s1,s4r2,s5)    / 25.0%
--   q3 survival: 85.7 / 57.1 / 42.9   excess(中央値 25.0): -10.7 / 8.3 / 0.0
--   qbad(違反行を除外後) q1: 1/1/0%  q2: 1/0/100%  q3: at_risk 0 → 率は NULL
--          excess: 中央値は IGNORE NULLS で 50.0 → q1 の excess は -50.0
--   qtie: runs 3 / orphan 0（ord が同 ts の start→answer を同一 run に保つ）/
--         with_end 2 / s9 の end は run_no=2 に落ちる（＝原理的な穴の回帰記録。
--         正しくは run_no=1 に属する）
--   run サマリ q3: runs 8 / with_start 7 / orphan 1 / with_end 3 / completed 3
--                  / no_answer 2（s3 + s10）/ no_answer_instrumented 1（s3 のみ）
--                  / uninstrumented 1（s10）/ avg_last_answered 2.17 / dup 1 / gap 0
--   健全性 q3  : rows 14 / lt_1 0 / gt_total 0 / dup_pairs 1 / orphan_rows 2 / PASS
--   健全性 qbad: rows 3  / lt_1 1 / gt_total 1 → verdict は lt_1 が優先
-- ============================================================================
WITH src AS (
  SELECT * FROM UNNEST([
    STRUCT('s1' AS sid, 'q3' AS content_id, 'level_start' AS event_name, 100 AS ts,
           CAST(NULL AS INT64) AS qn, CAST(NULL AS INT64) AS qt, 'newrel-20260801' AS rel),
    ('s1','q3','question_answered',110,1,3,'newrel-20260801'),
    ('s1','q3','question_answered',120,2,3,'newrel-20260801'),
    ('s1','q3','question_answered',130,3,3,'newrel-20260801'),
    ('s1','q3','level_end',130,NULL,NULL,'newrel-20260801'),
    ('s2','q3','level_start',200,NULL,NULL,'newrel-20260801'),
    ('s2','q3','question_answered',210,1,3,'newrel-20260801'),
    ('s3','q3','level_start',300,NULL,NULL,'newrel-20260801'),
    ('s4','q3','level_start',400,NULL,NULL,'newrel-20260801'),
    ('s4','q3','question_answered',410,1,3,'newrel-20260801'),
    ('s4','q3','level_start',500,NULL,NULL,'newrel-20260801'),
    ('s4','q3','question_answered',510,1,3,'newrel-20260801'),
    ('s4','q3','question_answered',520,2,3,'newrel-20260801'),
    ('s4','q3','question_answered',530,3,3,'newrel-20260801'),
    ('s4','q3','level_end',530,NULL,NULL,'newrel-20260801'),
    ('s5','q3','level_start',600,NULL,NULL,'newrel-20260801'),
    ('s5','q3','question_answered',610,1,3,'newrel-20260801'),
    ('s5','q3','question_answered',611,1,3,'newrel-20260801'),   -- 二重発火（同一 timestamp 近傍）
    ('s5','q3','question_answered',620,2,3,'newrel-20260801'),
    ('s5','q3','question_answered',630,3,3,'newrel-20260801'),
    ('s5','q3','level_end',630,NULL,NULL,'newrel-20260801'),
    ('s6','q3','question_answered',700,1,3,'newrel-20260801'),   -- level_start 欠落 → run_no=0
    ('s6','q3','question_answered',710,2,3,'newrel-20260801'),
    -- S10: 旧バンドル。question_answered を一度も送らない release の run。
    --      これを除外しないと at_risk(q=1) の分母に answered=0 として入る。
    ('s10','q3','level_start',750,NULL,NULL,'oldrel-20260730'),
    ('s7','qbad','level_start',800,NULL,NULL,'newrel-20260801'),
    ('s7','qbad','question_answered',810,0,3,'newrel-20260801'), -- 0 起点混入
    ('s7','qbad','question_answered',820,1,3,'newrel-20260801'),
    ('s7','qbad','question_answered',830,4,3,'newrel-20260801'), -- total 超過
    -- S8: level_start と question_answered が同一 ts（ord が守っているケース）
    ('s8','qtie','level_start',900,NULL,NULL,'newrel-20260801'),
    ('s8','qtie','question_answered',900,1,2,'newrel-20260801'),
    ('s8','qtie','question_answered',910,2,2,'newrel-20260801'),
    ('s8','qtie','level_end',910,NULL,NULL,'newrel-20260801'),
    -- S8b: run1 の level_end と run2 の level_start が同一 ts（原理的な穴）
    ('s9','qtie','level_start',1000,NULL,NULL,'newrel-20260801'),
    ('s9','qtie','question_answered',1010,1,2,'newrel-20260801'),
    ('s9','qtie','level_end',1100,NULL,NULL,'newrel-20260801'),
    ('s9','qtie','level_start',1100,NULL,NULL,'newrel-20260801'),
    ('s9','qtie','question_answered',1110,1,2,'newrel-20260801'),
    -- S9: param 欠落（question_id が NULL）。min(qn)=2 でもあるので FAIL/WARN の優先順を検査する
    ('s11','qnull','level_start',1200,NULL,NULL,'newrel-20260801'),
    ('s11','qnull','question_answered',1210,2,3,'newrel-20260801'),
    -- S11: expected 表に無い content_id
    ('s12','qnew','level_start',1300,NULL,NULL,'newrel-20260801'),
    ('s12','qnew','question_answered',1310,1,3,'newrel-20260801'),
    -- S12: q1 のビーコンだけ欠落 → min(number)=2（WARN であって FAIL ではない）
    ('s13','qwarn','level_start',1400,NULL,NULL,'newrel-20260801'),
    ('s13','qwarn','question_answered',1410,2,3,'newrel-20260801'),
    ('s13','qwarn','question_answered',1420,3,3,'newrel-20260801')
  ])
),
expected AS (
  -- SECTION 3 の期待値表の合成版（qnew は意図的に含めない）
  SELECT * FROM UNNEST([
    STRUCT('q3' AS content_id, 3 AS expected_total),
    ('qbad', 3), ('qtie', 2), ('qnull', 3), ('qwarn', 3)
  ])
),
ev AS (
  SELECT *,
    CASE event_name WHEN 'level_start' THEN 0 WHEN 'question_answered' THEN 1 ELSE 2 END AS ord,
    -- 実装では question_id = 'q'||question_number・content_type='quiz' が恒真
    -- （設計 §2-3）。合成データではその規則から導出し、param 欠落の分岐を
    -- 検査する content_id='qnull' だけ question_id を NULL にする。
    IF(content_id='qnull', NULL,
       IF(event_name='question_answered', CONCAT('q', CAST(qn AS STRING)), NULL)) AS question_id,
    'quiz' AS content_type
  FROM src
),
instrumented_releases AS (
  SELECT DISTINCT rel FROM ev WHERE event_name='question_answered' AND rel IS NOT NULL
),
ev2 AS (
  SELECT e.*, (ir.rel IS NOT NULL) AS ev_instrumented
  FROM ev e LEFT JOIN instrumented_releases ir USING (rel)
),
tagged AS (
  SELECT *,
    COUNTIF(event_name='level_start') OVER (
      PARTITION BY sid, content_id ORDER BY ts, ord
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS run_no
  FROM ev2
),
totals AS (
  SELECT content_id, MAX(qt) AS q_total
  FROM tagged WHERE event_name='question_answered' AND qt IS NOT NULL GROUP BY content_id
),
runs AS (
  SELECT sid, content_id, run_no,
    LOGICAL_OR(event_name='level_start') AS has_start,
    LOGICAL_OR(event_name='level_end')   AS has_end,
    LOGICAL_AND(ev_instrumented)         AS run_instrumented,
    (ARRAY_AGG(rel IGNORE NULLS ORDER BY ts, ord LIMIT 1))[SAFE_OFFSET(0)] AS run_release,
    MAX(IF(event_name='question_answered' AND qn BETWEEN 1 AND qt, qn, NULL))   AS answered_max,
    COUNT(DISTINCT IF(event_name='question_answered' AND qn BETWEEN 1 AND qt, qn, NULL)) AS answered_distinct,
    COUNTIF(event_name='question_answered' AND qn BETWEEN 1 AND qt)             AS answered_rows
  FROM tagged GROUP BY sid, content_id, run_no
),
axis AS (
  SELECT r.content_id, r.run_no, r.has_start, r.answered_max, q
  FROM runs r JOIN totals tt USING (content_id), UNNEST(GENERATE_ARRAY(1, tt.q_total)) AS q
  WHERE r.run_instrumented
),
per_q AS (
  SELECT content_id, q AS question_number,
    COUNTIF(IF(q=1, has_start OR IFNULL(answered_max,0) >= 1, IFNULL(answered_max,0) >= q-1)) AS at_risk,
    COUNTIF(IFNULL(answered_max,0) >= q) AS answered
  FROM axis GROUP BY content_id, q
),
per_q_out AS (
  SELECT content_id, question_number, at_risk, answered,
    ROUND(100 * (1 - SAFE_DIVIDE(answered, at_risk)), 1) AS dropoff_pct,
    ROUND(100 * SAFE_DIVIDE(answered,
      MAX(IF(question_number=1, at_risk, NULL)) OVER (PARTITION BY content_id)), 1) AS survival_pct
  FROM per_q
),
final_q AS (
  -- SECTION 1 の最終 SELECT と同一
  SELECT *,
    ROUND(dropoff_pct - PERCENTILE_CONT(dropoff_pct, 0.5 IGNORE NULLS) OVER (PARTITION BY content_id), 1) AS dropoff_excess_pt
  FROM per_q_out
),
no_answer_by_release AS (
  SELECT content_id,
    STRING_AGG(FORMAT('%s:%d', IFNULL(run_release,'(null)'), c), ' / '
               ORDER BY c DESC, run_release LIMIT 8) AS runs_no_answer_by_release
  FROM (
    SELECT content_id, run_release, COUNT(*) AS c
    FROM runs WHERE answered_max IS NULL GROUP BY content_id, run_release
  ) GROUP BY content_id
),
run_summary AS (
  -- SECTION 2 の最終 SELECT と同一
  SELECT s.*, n.runs_no_answer_by_release FROM (
    SELECT r.content_id,
      COUNT(*) AS runs,
      COUNTIF(r.has_start) AS runs_with_start,
      COUNTIF(NOT r.has_start) AS orphan_runs,
      COUNTIF(r.has_end) AS runs_with_end,
      COUNTIF(r.answered_max = tt.q_total) AS runs_completed,
      COUNTIF(r.answered_max IS NULL) AS runs_no_answer_observed,
      COUNTIF(r.answered_max IS NULL AND r.run_instrumented) AS runs_no_answer_instrumented,
      COUNTIF(NOT r.run_instrumented) AS runs_uninstrumented_release,
      ROUND(AVG(r.answered_max), 2) AS avg_last_answered,
      SUM(r.answered_rows - r.answered_distinct) AS duplicate_answer_rows,
      COUNTIF(r.answered_max IS NOT NULL AND r.answered_distinct <> r.answered_max) AS runs_with_gap
    FROM runs r LEFT JOIN totals tt USING (content_id) GROUP BY r.content_id
  ) s LEFT JOIN no_answer_by_release n USING (content_id)
),
answers AS (SELECT * FROM tagged WHERE event_name='question_answered'),
dups AS (
  SELECT content_id, COUNT(*) AS dup_pairs FROM (
    SELECT content_id, sid, run_no, qn FROM answers
    GROUP BY content_id, sid, run_no, qn HAVING COUNT(*) > 1
  ) GROUP BY content_id
),
health AS (
  SELECT a.content_id,
    COUNT(*) AS answer_rows,
    COUNTIF(a.qn IS NULL) AS null_question_number,
    COUNTIF(a.qt IS NULL) AS null_question_total,
    COUNTIF(a.question_id IS NULL) AS null_question_id,
    COUNTIF(a.content_type IS NULL) AS null_content_type,
    COUNTIF(a.qn < 1) AS violation_number_lt_1,
    COUNTIF(a.qn > a.qt) AS violation_number_gt_total,
    MIN(a.qn) AS min_question_number,
    COUNT(DISTINCT a.qt) AS distinct_totals_seen,
    MAX(a.qt) AS question_total_seen,
    COUNTIF(a.run_no = 0) AS rows_in_orphan_run,
    IFNULL(MAX(d.dup_pairs), 0) AS duplicate_pairs
  FROM answers a LEFT JOIN dups d USING (content_id) GROUP BY a.content_id
),
final_health AS (
  -- SECTION 3 の verdict CASE と同一（分岐順序まで含めて検査する）
  SELECT c.*, e.expected_total,
    CASE
      WHEN e.expected_total IS NULL                     THEN 'FAIL: unknown content_id (registry 更新漏れ?)'
      WHEN c.null_question_number > 0
        OR c.null_question_total > 0
        OR c.null_question_id > 0
        OR c.null_content_type > 0                      THEN 'FAIL: missing param'
      WHEN c.violation_number_lt_1 > 0                  THEN 'FAIL: number < 1 (0 起点混入)'
      WHEN c.violation_number_gt_total > 0              THEN 'FAIL: number > total'
      WHEN c.distinct_totals_seen <> 1                  THEN 'FAIL: total が単一値でない'
      WHEN c.question_total_seen <> e.expected_total     THEN 'FAIL: total が実装 questionCount と不一致'
      WHEN c.min_question_number <> 1                   THEN 'WARN: min(number) <> 1 (欠落でも起きる。qn<1 とは別物)'
      ELSE 'PASS'
    END AS verdict
  FROM health c LEFT JOIN expected e USING (content_id)
),
-- 手計算した期待値との突合（assertion 表）
assertions AS (
  SELECT 'S1 q3 q1 at_risk' AS assertion, 7 AS expected, CAST((SELECT at_risk FROM final_q WHERE content_id='q3' AND question_number=1) AS FLOAT64) AS actual UNION ALL
  SELECT 'S1 q3 q1 answered', 6, CAST((SELECT answered FROM final_q WHERE content_id='q3' AND question_number=1) AS FLOAT64) UNION ALL
  SELECT 'S1 q3 q2 at_risk', 6, CAST((SELECT at_risk FROM final_q WHERE content_id='q3' AND question_number=2) AS FLOAT64) UNION ALL
  SELECT 'S1 q3 q2 answered', 4, CAST((SELECT answered FROM final_q WHERE content_id='q3' AND question_number=2) AS FLOAT64) UNION ALL
  SELECT 'S1 q3 q3 at_risk', 4, CAST((SELECT at_risk FROM final_q WHERE content_id='q3' AND question_number=3) AS FLOAT64) UNION ALL
  SELECT 'S1 q3 q3 answered', 3, CAST((SELECT answered FROM final_q WHERE content_id='q3' AND question_number=3) AS FLOAT64) UNION ALL
  SELECT 'S1 q3 q1 dropoff_pct', 14.3, (SELECT dropoff_pct FROM final_q WHERE content_id='q3' AND question_number=1) UNION ALL
  SELECT 'S1 q3 q2 dropoff_pct', 33.3, (SELECT dropoff_pct FROM final_q WHERE content_id='q3' AND question_number=2) UNION ALL
  SELECT 'S1 q3 q3 dropoff_pct', 25.0, (SELECT dropoff_pct FROM final_q WHERE content_id='q3' AND question_number=3) UNION ALL
  SELECT 'S1 q3 q1 survival_pct', 85.7, (SELECT survival_pct FROM final_q WHERE content_id='q3' AND question_number=1) UNION ALL
  SELECT 'S1 q3 q2 survival_pct', 57.1, (SELECT survival_pct FROM final_q WHERE content_id='q3' AND question_number=2) UNION ALL
  SELECT 'S1 q3 q3 survival_pct', 42.9, (SELECT survival_pct FROM final_q WHERE content_id='q3' AND question_number=3) UNION ALL
  SELECT 'S1 q3 q1 dropoff_excess_pt', -10.7, (SELECT dropoff_excess_pt FROM final_q WHERE content_id='q3' AND question_number=1) UNION ALL
  SELECT 'S1 q3 q2 dropoff_excess_pt', 8.3, (SELECT dropoff_excess_pt FROM final_q WHERE content_id='q3' AND question_number=2) UNION ALL
  SELECT 'S1 qbad q1 answered', 1, CAST((SELECT answered FROM final_q WHERE content_id='qbad' AND question_number=1) AS FLOAT64) UNION ALL
  SELECT 'S1 qbad q2 answered', 0, CAST((SELECT answered FROM final_q WHERE content_id='qbad' AND question_number=2) AS FLOAT64) UNION ALL
  SELECT 'S1 qbad q3 at_risk', 0, CAST((SELECT at_risk FROM final_q WHERE content_id='qbad' AND question_number=3) AS FLOAT64) UNION ALL
  SELECT 'S1 qbad q3 dropoff_pct IS NULL', 1, CAST(IF((SELECT dropoff_pct FROM final_q WHERE content_id='qbad' AND question_number=3) IS NULL, 1, 0) AS FLOAT64) UNION ALL
  SELECT 'S1 qbad q1 survival_pct', 100.0, (SELECT survival_pct FROM final_q WHERE content_id='qbad' AND question_number=1) UNION ALL
  SELECT 'S1 qbad q2 survival_pct', 0.0, (SELECT survival_pct FROM final_q WHERE content_id='qbad' AND question_number=2) UNION ALL
  SELECT 'S1 qbad q1 dropoff_excess_pt (IGNORE NULLS の検査)', -50.0, (SELECT dropoff_excess_pt FROM final_q WHERE content_id='qbad' AND question_number=1) UNION ALL
  SELECT 'S10 q3 q1 at_risk が旧バンドルで膨らまない', 7, CAST((SELECT at_risk FROM final_q WHERE content_id='q3' AND question_number=1) AS FLOAT64) UNION ALL
  SELECT 'S2 q3 runs', 8, CAST((SELECT runs FROM run_summary WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S2 q3 runs_with_start', 7, CAST((SELECT runs_with_start FROM run_summary WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S2 q3 orphan_runs', 1, CAST((SELECT orphan_runs FROM run_summary WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S2 q3 runs_with_end', 3, CAST((SELECT runs_with_end FROM run_summary WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S2 q3 runs_completed', 3, CAST((SELECT runs_completed FROM run_summary WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S2 q3 runs_no_answer_observed', 2, CAST((SELECT runs_no_answer_observed FROM run_summary WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S2 q3 runs_no_answer_instrumented', 1, CAST((SELECT runs_no_answer_instrumented FROM run_summary WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S2 q3 runs_uninstrumented_release', 1, CAST((SELECT runs_uninstrumented_release FROM run_summary WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S2 q3 no_answer 内訳に旧 release が出る', 1, CAST(IF(STRPOS((SELECT runs_no_answer_by_release FROM run_summary WHERE content_id='q3'), 'oldrel-20260730') > 0, 1, 0) AS FLOAT64) UNION ALL
  SELECT 'S2 q3 avg_last', 2.17, (SELECT avg_last_answered FROM run_summary WHERE content_id='q3') UNION ALL
  SELECT 'S2 q3 dup_rows', 1, CAST((SELECT duplicate_answer_rows FROM run_summary WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S2 q3 runs_with_gap', 0, CAST((SELECT runs_with_gap FROM run_summary WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S2 qwarn runs_with_gap', 1, CAST((SELECT runs_with_gap FROM run_summary WHERE content_id='qwarn') AS FLOAT64) UNION ALL
  SELECT 'S8 qtie runs（ord が同 ts の start→answer を割らない）', 3, CAST((SELECT runs FROM run_summary WHERE content_id='qtie') AS FLOAT64) UNION ALL
  SELECT 'S8 qtie orphan_runs', 0, CAST((SELECT orphan_runs FROM run_summary WHERE content_id='qtie') AS FLOAT64) UNION ALL
  SELECT 'S8 qtie q1 at_risk', 3, CAST((SELECT at_risk FROM final_q WHERE content_id='qtie' AND question_number=1) AS FLOAT64) UNION ALL
  SELECT 'S8 qtie q2 answered', 1, CAST((SELECT answered FROM final_q WHERE content_id='qtie' AND question_number=2) AS FLOAT64) UNION ALL
  SELECT 'S8 qtie 穴: s9 の level_end が落ちる run_no（正しくは 1）', 2, CAST((SELECT MAX(run_no) FROM runs WHERE content_id='qtie' AND sid='s9' AND has_end) AS FLOAT64) UNION ALL
  SELECT 'S3 q3 answer_rows', 14, CAST((SELECT answer_rows FROM final_health WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S3 q3 dup_pairs', 1, CAST((SELECT duplicate_pairs FROM final_health WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S3 q3 orphan_rows', 2, CAST((SELECT rows_in_orphan_run FROM final_health WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S3 qbad lt_1', 1, CAST((SELECT violation_number_lt_1 FROM final_health WHERE content_id='qbad') AS FLOAT64) UNION ALL
  SELECT 'S3 qbad gt_total', 1, CAST((SELECT violation_number_gt_total FROM final_health WHERE content_id='qbad') AS FLOAT64) UNION ALL
  SELECT 'S3 q3 verdict = PASS', 1, CAST(IF((SELECT verdict FROM final_health WHERE content_id='q3')='PASS', 1, 0) AS FLOAT64) UNION ALL
  SELECT 'S3 qtie verdict = PASS', 1, CAST(IF((SELECT verdict FROM final_health WHERE content_id='qtie')='PASS', 1, 0) AS FLOAT64) UNION ALL
  SELECT 'S3 qbad verdict は lt_1 が gt_total より優先', 1, CAST(IF(STARTS_WITH((SELECT verdict FROM final_health WHERE content_id='qbad'), 'FAIL: number < 1'), 1, 0) AS FLOAT64) UNION ALL
  SELECT 'S3 qnull verdict は missing param が WARN より優先', 1, CAST(IF(STARTS_WITH((SELECT verdict FROM final_health WHERE content_id='qnull'), 'FAIL: missing param'), 1, 0) AS FLOAT64) UNION ALL
  SELECT 'S3 qnew verdict = FAIL unknown content_id', 1, CAST(IF(STARTS_WITH((SELECT verdict FROM final_health WHERE content_id='qnew'), 'FAIL: unknown content_id'), 1, 0) AS FLOAT64) UNION ALL
  SELECT 'S3 qwarn verdict = WARN（FAIL ではない）', 1, CAST(IF(STARTS_WITH((SELECT verdict FROM final_health WHERE content_id='qwarn'), 'WARN:'), 1, 0) AS FLOAT64)
)
SELECT
  assertion, expected, actual,
  -- actual が NULL（行が消えた・列名を間違えた）のときに PASS にしないこと。
  IF(actual IS NOT NULL AND ABS(actual - expected) < 0.005, 'PASS', 'FAIL') AS verdict
FROM assertions
ORDER BY IF(actual IS NOT NULL AND ABS(actual - expected) < 0.005, 1, 0), assertion;
