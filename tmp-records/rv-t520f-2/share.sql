SELECT
  COUNTIF(REGEXP_CONTAINS(p, r'^/play/(kanji-level|kotowaza-level|traditional-color|yoji-level|yoji-personality|impossible-advice|contrarian-fortune|unexpected-compatibility|music-personality|character-fortune|animal-personality|science-thinking|japanese-culture|character-personality|word-sense-personality)/?$')) play_face,
  COUNTIF(REGEXP_CONTAINS(p, r'^/play/[a-z-]+/result/')) result_pages,
  COUNTIF(STARTS_WITH(p,'/play')) play_all,
  COUNT(*) total
FROM (SELECT REGEXP_EXTRACT((SELECT value.string_value FROM UNNEST(event_params) WHERE key='page_location'), r'https?://[^/]+(/[^?#]*)') p
  FROM `yolo-web-gcp.analytics_524708437.events_*` WHERE _TABLE_SUFFIX BETWEEN '20260328' AND '20260928' AND event_name='page_view')
