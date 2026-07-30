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
--      例 "033b2dd-20260727"）。出荷境界の切り分けに使える。
--   ※ `ab_variant` / `experiment_id` は **載せない**（archive/visitor-value-
--      measurement.md 論点4「主要イベントに限定」を採用）。
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
--                     <FROM> = 20260731   (B-613 出荷日以降にすること)
--                     <TO>   = 20260809
--                   ※出荷日より前を含めると question_answered が無い run が
--                     混ざる。SECTION 2 の runs_no_answer_observed で検出できる。
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
--   level_end=2）が必要な理由: 最終問の question_answered と level_end は
--   **同一の回答ハンドラ内で連続送出される**ため event_timestamp が同値になりうる
--   （実測: 二重発火した level_end の最小間隔は 0 マイクロ秒）。ord を入れないと
--   同値行の順序が不定になる。
--   限界: run1 の level_end と run2 の level_start が同一 timestamp になった場合は
--   ord が level_start(0) を先に置くため level_end が run2 に落ちる。二度のクリックが
--   同一マイクロ秒に入る必要があり実際には起きないが、原理的な穴として記録する。
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
--   と定義する。answered_q は q について単調非増加＝生存曲線になる。
--   二重発火（同じ question_number が 2 行）は MAX / COUNT(DISTINCT) で自然に
--   吸収される。これは仮定ではなく実測上の必要事項——実測(窓 20260713-20260728)で
--   quiz-character-personality の 221 完走 run のうち **3 run (1.4%) が level_end を
--   2 回**送っており（間隔 0〜175,412 マイクロ秒・1 run は同一イベントバンドル）、
--   回答ハンドラの二重発火は本番で現に起きている。
--
--   「at_risk」を「saw（設問を見た）」と呼ばない理由: knowledge クイズ(3本)は
--   回答後に解説を挟み「次へ」を押して初めて次設問が現れる（QuestionCard の
--   answered 分岐）。question_answered だけでは「解説画面で離脱した」と
--   「次設問を見たが答えなかった」を区別できない。したがって本 SQL が測るのは
--   **「q-1 を答えた人が q を答えたか」**であって「q を見たか」ではない。
--   personality(12本)は回答即遷移なので両者は一致する。
--
-- ----------------------------------------------------------------------------
-- 不変条件（SECTION 3 が機械的に検査する）
-- ----------------------------------------------------------------------------
--   (1) 1 <= question_number <= question_total          … 1 起点規約
--   (2) MIN(question_number) = 1                        … 0 起点混入の検出
--   (3) answered_distinct = answered_max                … 番号の飛びが無い
--   (4) question_total = 実装の questionCount           … SECTION 3 の期待値表と一致
--   (5) content_id ごとに question_total は単一値
-- ============================================================================


-- ============================================================================
-- SECTION 1 : 設問別 離脱ハザード（主クエリ）
-- ----------------------------------------------------------------------------
-- 出力列:
--   content_id      : quiz-<slug>
--   question_number : 1 起点の設問番号
--   at_risk         : q-1 を答えた run 数（q=1 は level_start を持つ run 数）
--   answered        : q を答えた run 数
--   dropoff_pct     : この設問で落ちた割合 = 100*(1 - answered/at_risk)
--   survival_pct    : 開始 run に対する到達率 = 100*answered/(q=1 の at_risk)
--
-- 読み方: dropoff_pct が突出した question_number が離脱の局在。survival_pct は
--   ファネル全体の形（緩やかに減るのか、特定の設問で崖があるのか）を見る。
--   at_risk が小さい行（<20 目安）は率を読まない——1 件が 5pt 以上動く。
-- ============================================================================
WITH src AS (
  SELECT
    CONCAT(
      user_pseudo_id, '|',
      CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)
    ) AS sid,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_id')   AS content_id,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_type') AS content_type,
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
tagged AS (
  SELECT *,
    COUNTIF(event_name='level_start') OVER (
      PARTITION BY sid, content_id ORDER BY ts, ord
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS run_no
  FROM ev
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
),
per_q AS (
  SELECT content_id, q AS question_number,
    COUNTIF(IF(q=1, has_start OR IFNULL(answered_max,0) >= 1, IFNULL(answered_max,0) >= q-1)) AS at_risk,
    COUNTIF(IFNULL(answered_max,0) >= q) AS answered
  FROM axis
  GROUP BY content_id, q
)
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
ORDER BY content_id, question_number;


-- ============================================================================
-- SECTION 2 : run サマリ（分母の健全性・リトライ・完走）
-- ----------------------------------------------------------------------------
-- SECTION 1 の分母が信用できるかを確かめるためのクエリ。既存系列
-- (level_start / level_end の件数) と再構成した run の対応を見る。
--
-- 出力列:
--   runs                    : 再構成した run 数
--   runs_with_start         : level_start を含む run 数（= level_start の件数と一致すべき）
--   orphan_runs             : level_start を欠く run 数（run_no=0）
--   runs_with_end           : level_end を含む run 数（level_end **件数** とは
--                             一致しない。二重発火分だけ件数の方が多い＝実測 224 件 vs 221 run）
--   runs_completed          : answered_max = q_total の run 数（= 最終問まで答えた）
--   runs_no_answer_observed : question_answered が 1 件も無い run 数
--                             （出荷前のデータが窓に混ざっていれば大きくなる）
--   avg_last_answered       : 最後に答えた設問番号の平均
--   duplicate_answer_rows   : 同一 run・同一 question_number の重複行数（二重発火）
--   runs_with_gap           : answered_distinct <> answered_max の run 数
--                             （番号の飛び。二重クリックで setCurrentIndex が
--                               2 回進むと発生しうる＝下記 SECTION 3 の注記参照）
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
totals AS (
  SELECT content_id, MAX(qt) AS q_total
  FROM tagged WHERE event_name='question_answered' AND qt IS NOT NULL GROUP BY content_id
),
runs AS (
  SELECT sid, content_id, run_no,
    LOGICAL_OR(event_name='level_start') AS has_start,
    LOGICAL_OR(event_name='level_end')   AS has_end,
    MAX(IF(event_name='question_answered' AND qn BETWEEN 1 AND qt, qn, NULL))   AS answered_max,
    COUNT(DISTINCT IF(event_name='question_answered' AND qn BETWEEN 1 AND qt, qn, NULL)) AS answered_distinct,
    COUNTIF(event_name='question_answered' AND qn BETWEEN 1 AND qt)             AS answered_rows
  FROM tagged
  GROUP BY sid, content_id, run_no
)
SELECT
  r.content_id,
  ANY_VALUE(tt.q_total)                       AS q_total,
  COUNT(*)                                    AS runs,
  COUNTIF(r.has_start)                        AS runs_with_start,
  COUNTIF(NOT r.has_start)                    AS orphan_runs,
  COUNTIF(r.has_end)                          AS runs_with_end,
  COUNTIF(r.answered_max = tt.q_total)        AS runs_completed,
  COUNTIF(r.answered_max IS NULL)             AS runs_no_answer_observed,
  ROUND(AVG(r.answered_max), 2)               AS avg_last_answered,
  SUM(r.answered_rows - r.answered_distinct)  AS duplicate_answer_rows,
  COUNTIF(r.answered_max IS NOT NULL AND r.answered_distinct <> r.answered_max) AS runs_with_gap
FROM runs r
LEFT JOIN totals tt USING (content_id)   -- question_answered が皆無でも run を数える
GROUP BY r.content_id
ORDER BY runs DESC;


-- ============================================================================
-- SECTION 3 : 計装の健全性点検（不変条件の機械検査）
-- ----------------------------------------------------------------------------
-- 出荷直後に必ず 1 回実行する。verdict が PASS 以外なら計装かクエリが壊れている。
-- 「0 起点混入」は目視でなくここで検出する（AP-I01: 形式的な充足確認で
-- 済ませない ＝ 逆に、機械が検査できることは機械に検査させる）。
--
-- 期待 questionCount は 2026-07-30 に src/play/quiz/registry.ts を tsx で走査した
-- 実装値（15本・meta.questionCount と questions.length が全本一致）。
-- クイズを追加・改訂したらこの表を更新する。
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
  SELECT sid, content_id, content_type, question_id, run_no, qn, qt
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
    WHEN c.min_question_number <> 1                   THEN 'FAIL: min(number) <> 1'
    WHEN c.violation_number_gt_total > 0              THEN 'FAIL: number > total'
    WHEN c.distinct_totals_seen <> 1                  THEN 'FAIL: total が単一値でない'
    WHEN c.question_total_seen <> e.expected_total    THEN 'FAIL: total が実装 questionCount と不一致'
    ELSE 'PASS'
  END AS verdict
FROM checks c
LEFT JOIN expected e USING (content_id)
ORDER BY c.answer_rows DESC;
-- 注: duplicate_pairs > 0 と rows_in_orphan_run > 0 は FAIL にしない。どちらも
--     本番で実在する正常な雑音であり（二重発火は実測 1.4% の完走 run・orphan run も
--     実測 1 件）、SECTION 1 の MAX / COUNT(DISTINCT) で吸収済み。率が跳ねたときに
--     気づくための観測列として出す。
--     runs_with_gap（SECTION 2）が 0 でない場合は別問題——回答が 1 問飛ばされた
--     ことを意味し、来訪者に返る診断結果からも 1 問分の回答が落ちている疑いがある
--     （handleAnswer に二重発火ガードが無いことに由来。B-613 のスコープ外だが
--       instrumentation-design.md §5 に記録し backlog へ起票する）。


-- ============================================================================
-- SECTION 4 : 合成データによる自己検証（期待値は手計算・実行して PASS を確認）
-- ----------------------------------------------------------------------------
-- SECTION 1〜3 のロジックを、実データに依存せず検証する。events_* を参照しない
-- ので、いつでも・question_answered の実データが無くても実行できる。
-- SECTION 1 のロジックを変更したら**必ずここも実行して全 PASS を確認する**。
--
-- 合成シナリオ（content_id='q3'・q_total=3 / 'qbad' は不変条件違反の隔離用）:
--   S1 s1  完走                     : start, q1, q2, q3, end
--   S2 s2  途中離脱                 : start, q1
--   S3 s3  はじめるだけ             : start のみ
--   S4 s4  離脱後リトライ完走       : start, q1 / start, q1, q2, q3, end  (2 run)
--   S5 s5  二重発火                 : start, q1, q1, q2, q3, end
--   S6 s6  level_start 欠落(orphan) : q1, q2
--   S7 s7  不変条件違反(qbad)       : start, q=0, q=1, q=4  (total=3)
--
-- 手計算した期待値（本文の定義から導出）:
--   q3 q1: at_risk 7 (s1,s2,s3,s4r1,s4r2,s5,s6) / answered 6 (s3 以外) / 14.3%
--   q3 q2: at_risk 6 (max>=1)                   / answered 4 (s1,s4r2,s5,s6) / 33.3%
--   q3 q3: at_risk 4 (max>=2: s1,s4r2,s5,s6)    / answered 3 (s1,s4r2,s5)    / 25.0%
--   qbad(違反行を除外後) q1: 1/1/0%  q2: 1/0/100%  q3: at_risk 0 → NULL
--   run サマリ q3: runs 7 / with_start 6 / orphan 1 / with_end 3 / completed 3
--                  / no_answer 1 / avg_last_answered 2.17 / dup 1 / gap 0
--   健全性 q3  : rows 14 / lt_1 0 / gt_total 0 / dup_pairs 1 / orphan_rows 2
--   健全性 qbad: rows 3  / lt_1 1 / gt_total 1 / dup_pairs 0
-- ============================================================================
WITH src AS (
  SELECT * FROM UNNEST([
    STRUCT('s1' AS sid, 'q3' AS content_id, 'level_start' AS event_name, 100 AS ts,
           CAST(NULL AS INT64) AS qn, CAST(NULL AS INT64) AS qt),
    ('s1','q3','question_answered',110,1,3),
    ('s1','q3','question_answered',120,2,3),
    ('s1','q3','question_answered',130,3,3),
    ('s1','q3','level_end',130,NULL,NULL),
    ('s2','q3','level_start',200,NULL,NULL),
    ('s2','q3','question_answered',210,1,3),
    ('s3','q3','level_start',300,NULL,NULL),
    ('s4','q3','level_start',400,NULL,NULL),
    ('s4','q3','question_answered',410,1,3),
    ('s4','q3','level_start',500,NULL,NULL),
    ('s4','q3','question_answered',510,1,3),
    ('s4','q3','question_answered',520,2,3),
    ('s4','q3','question_answered',530,3,3),
    ('s4','q3','level_end',530,NULL,NULL),
    ('s5','q3','level_start',600,NULL,NULL),
    ('s5','q3','question_answered',610,1,3),
    ('s5','q3','question_answered',611,1,3),   -- 二重発火（同一 timestamp 近傍）
    ('s5','q3','question_answered',620,2,3),
    ('s5','q3','question_answered',630,3,3),
    ('s5','q3','level_end',630,NULL,NULL),
    ('s6','q3','question_answered',700,1,3),   -- level_start 欠落 → run_no=0
    ('s6','q3','question_answered',710,2,3),
    ('s7','qbad','level_start',800,NULL,NULL),
    ('s7','qbad','question_answered',810,0,3), -- 0 起点混入
    ('s7','qbad','question_answered',820,1,3),
    ('s7','qbad','question_answered',830,4,3)  -- total 超過
  ])
),
ev AS (
  SELECT *, CASE event_name WHEN 'level_start' THEN 0 WHEN 'question_answered' THEN 1 ELSE 2 END AS ord
  FROM src
),
tagged AS (
  SELECT *,
    COUNTIF(event_name='level_start') OVER (
      PARTITION BY sid, content_id ORDER BY ts, ord
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS run_no
  FROM ev
),
totals AS (
  SELECT content_id, MAX(qt) AS q_total
  FROM tagged WHERE event_name='question_answered' AND qt IS NOT NULL GROUP BY content_id
),
runs AS (
  SELECT sid, content_id, run_no,
    LOGICAL_OR(event_name='level_start') AS has_start,
    LOGICAL_OR(event_name='level_end')   AS has_end,
    MAX(IF(event_name='question_answered' AND qn BETWEEN 1 AND qt, qn, NULL))   AS answered_max,
    COUNT(DISTINCT IF(event_name='question_answered' AND qn BETWEEN 1 AND qt, qn, NULL)) AS answered_distinct,
    COUNTIF(event_name='question_answered' AND qn BETWEEN 1 AND qt)             AS answered_rows
  FROM tagged GROUP BY sid, content_id, run_no
),
axis AS (
  SELECT r.content_id, r.run_no, r.has_start, r.answered_max, q
  FROM runs r JOIN totals tt USING (content_id), UNNEST(GENERATE_ARRAY(1, tt.q_total)) AS q
),
per_q AS (
  SELECT content_id, q AS question_number,
    COUNTIF(IF(q=1, has_start OR IFNULL(answered_max,0) >= 1, IFNULL(answered_max,0) >= q-1)) AS at_risk,
    COUNTIF(IFNULL(answered_max,0) >= q) AS answered
  FROM axis GROUP BY content_id, q
),
run_summary AS (
  SELECT r.content_id,
    COUNT(*) AS runs,
    COUNTIF(r.has_start) AS runs_with_start,
    COUNTIF(NOT r.has_start) AS orphan_runs,
    COUNTIF(r.has_end) AS runs_with_end,
    COUNTIF(r.answered_max = tt.q_total) AS runs_completed,
    COUNTIF(r.answered_max IS NULL) AS runs_no_answer_observed,
    ROUND(AVG(r.answered_max), 2) AS avg_last_answered,
    SUM(r.answered_rows - r.answered_distinct) AS duplicate_answer_rows,
    COUNTIF(r.answered_max IS NOT NULL AND r.answered_distinct <> r.answered_max) AS runs_with_gap
  FROM runs r LEFT JOIN totals tt USING (content_id) GROUP BY r.content_id
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
    COUNTIF(a.qn < 1) AS violation_number_lt_1,
    COUNTIF(a.qn > a.qt) AS violation_number_gt_total,
    COUNTIF(a.run_no = 0) AS rows_in_orphan_run,
    IFNULL(MAX(d.dup_pairs), 0) AS duplicate_pairs
  FROM answers a LEFT JOIN dups d USING (content_id) GROUP BY a.content_id
),
-- 手計算した期待値との突合（assertion 表）
assertions AS (
  SELECT 'S1 q3 q1 at_risk'   AS assertion, 7    AS expected, CAST((SELECT at_risk  FROM per_q WHERE content_id='q3' AND question_number=1) AS FLOAT64) AS actual UNION ALL
  SELECT 'S1 q3 q1 answered',   6,    CAST((SELECT answered FROM per_q WHERE content_id='q3' AND question_number=1) AS FLOAT64) UNION ALL
  SELECT 'S1 q3 q2 at_risk',    6,    CAST((SELECT at_risk  FROM per_q WHERE content_id='q3' AND question_number=2) AS FLOAT64) UNION ALL
  SELECT 'S1 q3 q2 answered',   4,    CAST((SELECT answered FROM per_q WHERE content_id='q3' AND question_number=2) AS FLOAT64) UNION ALL
  SELECT 'S1 q3 q3 at_risk',    4,    CAST((SELECT at_risk  FROM per_q WHERE content_id='q3' AND question_number=3) AS FLOAT64) UNION ALL
  SELECT 'S1 q3 q3 answered',   3,    CAST((SELECT answered FROM per_q WHERE content_id='q3' AND question_number=3) AS FLOAT64) UNION ALL
  SELECT 'S1 qbad q1 answered', 1,    CAST((SELECT answered FROM per_q WHERE content_id='qbad' AND question_number=1) AS FLOAT64) UNION ALL
  SELECT 'S1 qbad q2 answered', 0,    CAST((SELECT answered FROM per_q WHERE content_id='qbad' AND question_number=2) AS FLOAT64) UNION ALL
  SELECT 'S1 qbad q3 at_risk',  0,    CAST((SELECT at_risk  FROM per_q WHERE content_id='qbad' AND question_number=3) AS FLOAT64) UNION ALL
  SELECT 'S2 q3 runs',          7,    CAST((SELECT runs                    FROM run_summary WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S2 q3 runs_with_start',6,   CAST((SELECT runs_with_start         FROM run_summary WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S2 q3 orphan_runs',   1,    CAST((SELECT orphan_runs             FROM run_summary WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S2 q3 runs_with_end', 3,    CAST((SELECT runs_with_end           FROM run_summary WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S2 q3 runs_completed',3,    CAST((SELECT runs_completed          FROM run_summary WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S2 q3 no_answer',     1,    CAST((SELECT runs_no_answer_observed FROM run_summary WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S2 q3 avg_last',      2.17, CAST((SELECT avg_last_answered       FROM run_summary WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S2 q3 dup_rows',      1,    CAST((SELECT duplicate_answer_rows   FROM run_summary WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S2 q3 runs_with_gap', 0,    CAST((SELECT runs_with_gap           FROM run_summary WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S3 q3 answer_rows',   14,   CAST((SELECT answer_rows             FROM health WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S3 q3 dup_pairs',     1,    CAST((SELECT duplicate_pairs         FROM health WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S3 q3 orphan_rows',   2,    CAST((SELECT rows_in_orphan_run      FROM health WHERE content_id='q3') AS FLOAT64) UNION ALL
  SELECT 'S3 qbad lt_1',        1,    CAST((SELECT violation_number_lt_1   FROM health WHERE content_id='qbad') AS FLOAT64) UNION ALL
  SELECT 'S3 qbad gt_total',    1,    CAST((SELECT violation_number_gt_total FROM health WHERE content_id='qbad') AS FLOAT64)
)
SELECT
  assertion, expected, actual,
  IF(ABS(actual - expected) < 0.005, 'PASS', 'FAIL') AS verdict
FROM assertions
ORDER BY IF(ABS(actual - expected) < 0.005, 1, 0), assertion;
