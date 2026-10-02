WITH pv AS (
  SELECT user_pseudo_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key='ga_session_id') sid,
    event_timestamp ts,
    REGEXP_EXTRACT((SELECT value.string_value FROM UNNEST(event_params) WHERE key='page_location'), r'https?://[^/]+(/[^?#]*)') path
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260328' AND '20260928' AND event_name='page_view'
), seq AS (
  SELECT *, LEAD(path) OVER (PARTITION BY user_pseudo_id, sid ORDER BY ts) next_path,
    LEAD(ts) OVER (PARTITION BY user_pseudo_id, sid ORDER BY ts) next_ts FROM pv
), ends AS (
  SELECT user_pseudo_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key='ga_session_id') sid,
    event_timestamp ts,
    REGEXP_EXTRACT((SELECT value.string_value FROM UNNEST(event_params) WHERE key='page_location'), r'https?://[^/]+(/[^?#]*)') path
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260328' AND '20260928' AND event_name='level_end'
), g AS (
  SELECT s.*, EXISTS(SELECT 1 FROM ends e WHERE e.user_pseudo_id=s.user_pseudo_id AND e.sid=s.sid AND e.path=s.path AND e.ts>=s.ts AND (s.next_ts IS NULL OR e.ts<s.next_ts)) finished
  FROM seq s WHERE REGEXP_CONTAINS(path, r'^/play/(kanji-kanaru|yoji-kimeru|nakamawake|irodori)/?$')
)
SELECT finished,
  CASE WHEN next_path IS NULL THEN 'exit'
       WHEN REGEXP_CONTAINS(next_path, r'^/play/(kanji-kanaru|yoji-kimeru|nakamawake|irodori)/?$') AND next_path=path THEN 'same'
       WHEN REGEXP_CONTAINS(next_path, r'^/play/(kanji-kanaru|yoji-kimeru|nakamawake|irodori)/?$') THEN 'other_daily'
       WHEN REGEXP_CONTAINS(next_path, r'^/play/?$') THEN 'play_index'
       WHEN STARTS_WITH(next_path, '/play/') THEN 'other_play'
       WHEN STARTS_WITH(next_path, '/blog') THEN 'blog'
       WHEN STARTS_WITH(next_path, '/dictionary') THEN 'dict'
       ELSE CONCAT('other:', next_path) END dest,
  COUNT(*) n
FROM g GROUP BY 1,2 ORDER BY 1,3 DESC
