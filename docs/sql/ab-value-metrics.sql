-- ============================================================================
-- ab-value-metrics.sql
-- yolos.net A/B・リリース別 来訪者価値指標 恒久クエリ (B-525 / cycle-255)
-- ============================================================================
--
-- 一次規範: docs/visitor-value-measurement.md 論点5「指標定義 SSoT と BigQuery
--           比較クエリ設計」。指標定義の検証済み正本は
--           docs/research/2026-06-visitor-metrics-baseline.md の Q-A2 / Q-A2b。
--
-- 役割: 価値指標4種(直帰率・平均エンゲージ秒・PV/セッション・結果到達セッション
--       数)を ab_variant 別 / release 別に算出し、連続量主 KPI(結果到達後の
--       エンゲージ時間)のベイズ用素データも出す。指標定義の SSoT は本 SQL。
--
-- 実行: 各クエリ(SECTION)は独立した SELECT 文。1 セクションずつ実行する。
--       npx tsx .claude/skills/analyze-bigquery/scripts/query.ts "<SQL>"
--       (SELECT のみ・読取専用。憲法ルール2・skill 制約)
--
-- ----------------------------------------------------------------------------
-- パラメータ (実行時に置換する)
-- ----------------------------------------------------------------------------
--   <FROM> / <TO> : 集計期間窓。events_YYYYMMDD の YYYYMMDD 文字列。
--                   _TABLE_SUFFIX BETWEEN '<FROM>' AND '<TO>' で適用。
--                   例(直近窓・ベースライン整合確認に使用):
--                     <FROM> = 20260523
--                     <TO>   = 20260618   (06-19 以降のエクスポートは未生成のことがある)
--
-- ----------------------------------------------------------------------------
-- 軸の切替 (ab_variant 別 / release 別)
-- ----------------------------------------------------------------------------
--   本ファイルは ab_variant 別を既定の集計軸とする。release 別に切り替えるには
--   各 SELECT で次の2点を変える(各セクション内のコメントにも明示):
--     (1) GROUP/SELECT のキーを ab_variant -> release_id に差し替える。
--     (2) ab_variant 別では実験対象セッションに限定するため
--         「WHERE ab_variant IS NOT NULL」を付ける。release 別では全セッション
--         を見る(デプロイ前後の指標連続性=回帰検出)ので、この WHERE を外す。
--
-- ----------------------------------------------------------------------------
-- セッション代表値の取り方 (論点5)
-- ----------------------------------------------------------------------------
--   ab_variant / release は各イベントの event_params に載る。セッション内で最初に
--   観測した非 NULL 値を代表値とする:
--     (ARRAY_AGG(<col> IGNORE NULLS ORDER BY event_timestamp LIMIT 1))[SAFE_OFFSET(0)]
--   arm はセッション内一貫の設計(同一来訪者=同一 arm)なので代表化で十分。
--
-- ----------------------------------------------------------------------------
-- 現状(cycle-255 仕込み直後)の前提
-- ----------------------------------------------------------------------------
--   ab_variant を送るイベントは本番未実装 -> ab_variant は全行 NULL(集計は
--   1 グループにまとまる)。release も未注入のため release_id も全行 NULL。
--   実装投入後に自然に arm/release 別へ分かれる。指標定義(直帰/エンゲージ/PV)は
--   現行データでも Q-A2 ベースライン値(直帰42.7% / 119.2秒 / 1.43PV)と一致する。
-- ============================================================================


-- ============================================================================
-- SECTION 1 : 価値指標4種 (ab_variant 別)
-- ----------------------------------------------------------------------------
-- 検証(窓 20260523-20260618): ab_variant=NULL の1行に集約され
--   sessions=225, bounce_pct=42.7, avg_engagement_sec=119.2,
--   pages_per_session=1.43, sessions_reached_results=59
-- が出る。ベースライン Q-A2(直帰42.7/エンゲージ119.2/1.43PV)と一致。
-- (※ ab_variant 全 NULL のため、下の「実験対象限定 WHERE」は今は全行を落とす。
--    検証目的では WHERE を外して実行する。本番で arm 投入後は WHERE を有効化する。)
-- ============================================================================
WITH base AS (
  SELECT
    CONCAT(
      user_pseudo_id,
      CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)
    ) AS sid,
    event_name,
    event_timestamp,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='session_engaged')      AS engaged,
    (SELECT ep.value.int_value    FROM UNNEST(event_params) ep WHERE ep.key='engagement_time_msec') AS eng_ms,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='ab_variant')           AS ab_variant,
    -- experiment_id は将来の複数実験(同時稼働)に備えて base CTE で抽出だけしておく。
    -- 現状は単一実験(例: quiz_result_visual_v1)のため SECTION 1 の GROUP BY は
    -- ab_variant のまま。複数実験稼働時は sess CTE で同様に代表化し、
    -- GROUP BY experiment_id, ab_variant に拡張する。
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='experiment_id')        AS experiment_id,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='release')              AS release_id
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '<FROM>' AND '<TO>'
),
sess AS (
  SELECT
    sid,
    -- セッション代表 arm / release(最初に観測した非 NULL 値)
    (ARRAY_AGG(ab_variant IGNORE NULLS ORDER BY event_timestamp LIMIT 1))[SAFE_OFFSET(0)] AS ab_variant,
    (ARRAY_AGG(release_id IGNORE NULLS ORDER BY event_timestamp LIMIT 1))[SAFE_OFFSET(0)] AS release_id,
    MAX(engaged)                       AS engaged,
    COUNTIF(event_name='page_view')    AS pv,
    SUM(eng_ms)                        AS eng_ms,
    COUNTIF(event_name='level_end')    AS reached_results
  FROM base
  GROUP BY sid
)
SELECT
  ab_variant,                                                              -- ← release 別にするなら release_id に差し替え
  COUNT(*)                                                  AS sessions,
  ROUND(100*COUNTIF(engaged!='1' OR engaged IS NULL)/COUNT(*),1) AS bounce_pct,
  ROUND(AVG(eng_ms)/1000,1)                                AS avg_engagement_sec,
  ROUND(AVG(pv),2)                                         AS pages_per_session,
  COUNTIF(reached_results>0)                               AS sessions_reached_results
FROM sess
-- 注: `level_start` は arm 確定前（useAbVariant の useEffect 内で
-- 確定するため、useEffect 連鎖の順序によっては）発火しうる best-effort。
-- `level_end` は arm 確定後で必ず arm が乗る。`sess` の代表 arm 抽出は
-- `ARRAY_AGG(ab_variant IGNORE NULLS ORDER BY event_timestamp LIMIT 1)` で
-- 非対称を吸収している（start に arm が無くても end の arm でセッション代表が
-- 決まる）。また personality 系クイズ以外（knowledge: yoji-level など）には
-- QuizContainer 側で arm を載せない設計のため、ここでは混入しない。
WHERE ab_variant IS NOT NULL          -- 実験対象セッションに限定。【release 別集計時 or 検証時は、この行を削除する】
GROUP BY ab_variant                   -- ← release 別にするなら release_id
ORDER BY ab_variant;                  -- ← release 別にするなら release_id


-- ============================================================================
-- SECTION 2 : 価値指標4種 (release 別)
-- ----------------------------------------------------------------------------
-- SECTION 1 の release 別版(デプロイ前後の指標連続性チェック=回帰検出)。
-- 全セッションを見る(実験対象限定 WHERE を付けない)。
--
-- release_id=NULL 行の解釈(運用上重要):
--   本番投入後も release_id=NULL の行は残りうる。意味は次のいずれか:
--   (a) release 注入前にエクスポートされたヒット(導入日より古いテーブル)、
--   (b) CDN/ブラウザキャッシュで古い JS バンドルを掴んだままのセッション
--       (release 定数を持たないコードで gtag を撃った)、
--   (c) `release` パラメータが落ちる経路(将来の計測ミス)。
--   いずれもデプロイ境界の比較対象としては「不明」グループ。NULL 行を新リリースと
--   混同しないこと。導入日以降に NULL が著増しているなら (b)(c) を疑い、減衰しない
--   なら (b) のキャッシュ残存を時系列で確認する。
--
-- 検証(窓 20260523-20260618): release_id=NULL の1行に集約され
--   sessions=225, bounce_pct=42.7, avg_engagement_sec=119.2,
--   pages_per_session=1.43, sessions_reached_results=59。ベースライン一致。
-- ============================================================================
WITH base AS (
  SELECT
    CONCAT(
      user_pseudo_id,
      CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)
    ) AS sid,
    event_name,
    event_timestamp,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='session_engaged')      AS engaged,
    (SELECT ep.value.int_value    FROM UNNEST(event_params) ep WHERE ep.key='engagement_time_msec') AS eng_ms,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='release')              AS release_id
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '<FROM>' AND '<TO>'
),
sess AS (
  SELECT
    sid,
    (ARRAY_AGG(release_id IGNORE NULLS ORDER BY event_timestamp LIMIT 1))[SAFE_OFFSET(0)] AS release_id,
    MAX(engaged)                       AS engaged,
    COUNTIF(event_name='page_view')    AS pv,
    SUM(eng_ms)                        AS eng_ms,
    COUNTIF(event_name='level_end')    AS reached_results
  FROM base
  GROUP BY sid
)
SELECT
  release_id,
  COUNT(*)                                                  AS sessions,
  ROUND(100*COUNTIF(engaged!='1' OR engaged IS NULL)/COUNT(*),1) AS bounce_pct,
  ROUND(AVG(eng_ms)/1000,1)                                AS avg_engagement_sec,
  ROUND(AVG(pv),2)                                         AS pages_per_session,
  COUNTIF(reached_results>0)                               AS sessions_reached_results
FROM sess
GROUP BY release_id
ORDER BY sessions DESC;


-- ============================================================================
-- SECTION 3 : 連続量主 KPI のベイズ用素データ (ab_variant 別)
-- ----------------------------------------------------------------------------
-- 主 KPI = 「結果到達後のエンゲージ時間」(論点3-ii)。
-- 結果到達セッション(level_end が発火したセッション)に限定し、セッション合算
-- エンゲージ時間(eng_ms)を arm 別に集計。事後分布の計算は集計値から別途
-- (外部 DB 不要)。エンゲージ時間は右に歪むため対数変換 LN(eng_ms+1) の
-- 平均・分散も併せて出す(正規近似ベイズで使う / 論点3-iii 推奨)。
--
-- 出力列:
--   n_sessions    : arm 別の到達セッション数(ベイズの n)
--   avg_eng_ms    : 生スケール平均(参考・効果量の直感用)
--   stddev_eng_ms : 生スケール標準偏差
--   avg_ln_eng_ms : 対数変換後の平均(正規近似ベイズの主入力)
--   var_ln_eng_ms : 対数変換後の標本分散(同上)
--
-- 検証(窓 20260523-20260618, WHERE ab_variant IS NOT NULL を外して実行):
--   ab_variant=NULL, n_sessions=59, avg_eng_ms≈230356, avg_ln_eng_ms≈12.1045,
--   var_ln_eng_ms≈0.5052。到達59は SECTION1 の sessions_reached_results と一致。
--
-- release 別に切り替えるには ab_variant -> release_id(代表値 CTE も差し替え)、
-- WHERE の「ab_variant IS NOT NULL」を外す。
-- ============================================================================
WITH base AS (
  SELECT
    CONCAT(
      user_pseudo_id,
      CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)
    ) AS sid,
    event_name,
    event_timestamp,
    (SELECT ep.value.int_value    FROM UNNEST(event_params) ep WHERE ep.key='engagement_time_msec') AS eng_ms,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='ab_variant')           AS ab_variant
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '<FROM>' AND '<TO>'
),
sess AS (
  SELECT
    sid,
    (ARRAY_AGG(ab_variant IGNORE NULLS ORDER BY event_timestamp LIMIT 1))[SAFE_OFFSET(0)] AS ab_variant,
    SUM(eng_ms)                     AS eng_ms,
    COUNTIF(event_name='level_end') AS reached_results
  FROM base
  GROUP BY sid
)
SELECT
  ab_variant,                                           -- ← release 別にするなら release_id
  COUNT(*)                          AS n_sessions,
  ROUND(AVG(eng_ms),1)              AS avg_eng_ms,
  ROUND(STDDEV(eng_ms),1)           AS stddev_eng_ms,
  ROUND(AVG(LN(eng_ms+1)),4)        AS avg_ln_eng_ms,
  ROUND(VAR_SAMP(LN(eng_ms+1)),4)   AS var_ln_eng_ms
FROM sess
WHERE reached_results > 0           -- 結果到達セッションのみ(主 KPI の母集団)
  AND eng_ms IS NOT NULL
  AND ab_variant IS NOT NULL        -- 実験対象に限定。【release 別 or 検証時はこの行を削除】
GROUP BY ab_variant                 -- ← release 別にするなら release_id
ORDER BY ab_variant;                -- ← release 別にするなら release_id

-- ----------------------------------------------------------------------------
-- ベイズ計算手順の最小例(本 SQL の出力をそのまま使う擬似コード):
--   arm A, B それぞれ (n_A, m_A=avg_ln_eng_ms, v_A=var_ln_eng_ms) を取る。
--   弱情報事前 + 標本平均の正規近似で、平均の事後は
--     mu_A ~ Normal(m_A, v_A / n_A)、mu_B ~ Normal(m_B, v_B / n_B)。
--   独立とみなせるので差は Normal(m_B-m_A, v_A/n_A + v_B/n_B) で近似。
--   P(B>A) = 1 - Phi( (m_A - m_B) / sqrt(v_A/n_A + v_B/n_B) )  (Phi は標準正規 CDF)。
--   論点3-iii の判定閾値(P(優越) ≥ 0.95) と最小観測数(各 arm ≥ 50)で読む。
