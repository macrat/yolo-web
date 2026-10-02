WITH pv AS (
  SELECT user_pseudo_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key='ga_session_id') sid,
    event_timestamp ts,
    REGEXP_EXTRACT((SELECT value.string_value FROM UNNEST(event_params) WHERE key='page_location'), r'https?://[^/]+(/[^?#]*)') path
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260328' AND '20260928' AND event_name='page_view'
), seq AS (
  SELECT *, LEAD(path) OVER (PARTITION BY user_pseudo_id, sid ORDER BY ts) next_path FROM pv
)
SELECT RTRIM(path,'/') p, RTRIM(next_path,'/') np, COUNT(*) v, COUNT(DISTINCT user_pseudo_id) u
FROM seq WHERE RTRIM(path,'/') IN ('/play/yoji-personality')
GROUP BY p,np HAVING np LIKE '/play/%' OR np IS NULL ORDER BY p, v DESC
