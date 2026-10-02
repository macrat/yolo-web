SELECT event_name, REGEXP_EXTRACT((SELECT value.string_value FROM UNNEST(event_params) WHERE key='page_location'), r'https?://[^/]+(/[^?#]*)') path, COUNT(*) n, COUNT(DISTINCT user_pseudo_id) u
FROM `yolo-web-gcp.analytics_524708437.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260328' AND '20260928' AND event_name IN ('level_start','level_end','page_view','user_engagement')
AND REGEXP_CONTAINS((SELECT value.string_value FROM UNNEST(event_params) WHERE key='page_location'), r'/play/(kanji-kanaru|yoji-kimeru|nakamawake|irodori)')
GROUP BY 1,2 ORDER BY 2,1
