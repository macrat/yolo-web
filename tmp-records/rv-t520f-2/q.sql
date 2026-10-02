WITH m AS (SELECT * FROM UNNEST([
STRUCT('kanji-level' AS slug, ['kotowaza-level','daily','yoji-personality'] AS nxt, ['kotowaza-level','yoji-level'] AS rel, ['daily','yoji-personality','kanji-kanaru'] AS rec, ['kotowaza-level','yoji-level'] AS newrel),
STRUCT('kotowaza-level' AS slug, ['yoji-level','daily','yoji-personality'] AS nxt, ['kanji-level','yoji-level'] AS rel, ['daily','yoji-personality','kanji-kanaru'] AS rec, ['yoji-level','kanji-level'] AS newrel),
STRUCT('traditional-color' AS slug, ['yoji-personality','daily','kanji-level'] AS nxt, ['yoji-personality','impossible-advice','contrarian-fortune'] AS rel, ['daily','kanji-level','kanji-kanaru'] AS rec, ['yoji-personality','character-fortune','character-personality'] AS newrel),
STRUCT('yoji-level' AS slug, ['kotowaza-level','daily','yoji-personality'] AS nxt, ['kanji-level','kotowaza-level'] AS rel, ['daily','yoji-personality','yoji-kimeru'] AS rec, ['kotowaza-level','kanji-level'] AS newrel),
STRUCT('yoji-personality' AS slug, ['traditional-color','daily','yoji-level'] AS nxt, ['traditional-color','impossible-advice','contrarian-fortune'] AS rel, ['daily','yoji-level','yoji-kimeru'] AS rec, ['traditional-color','character-fortune','character-personality'] AS newrel),
STRUCT('impossible-advice' AS slug, ['contrarian-fortune','daily','kanji-level'] AS nxt, ['traditional-color','yoji-personality','contrarian-fortune'] AS rel, ['daily','kanji-level','kanji-kanaru'] AS rec, ['contrarian-fortune','yoji-personality','unexpected-compatibility'] AS newrel),
STRUCT('contrarian-fortune' AS slug, ['impossible-advice','daily','kanji-level'] AS nxt, ['traditional-color','yoji-personality','impossible-advice'] AS rel, ['daily','kanji-level','kanji-kanaru'] AS rec, ['impossible-advice','unexpected-compatibility','yoji-personality'] AS newrel),
STRUCT('unexpected-compatibility' AS slug, ['contrarian-fortune','daily','kanji-level'] AS nxt, ['traditional-color','yoji-personality','impossible-advice'] AS rel, ['daily','kanji-level','kanji-kanaru'] AS rec, ['contrarian-fortune','music-personality','character-fortune'] AS newrel),
STRUCT('music-personality' AS slug, ['unexpected-compatibility','daily','kanji-level'] AS nxt, ['traditional-color','yoji-personality','impossible-advice'] AS rel, ['daily','kanji-level','kanji-kanaru'] AS rec, ['unexpected-compatibility','character-fortune','animal-personality'] AS newrel),
STRUCT('character-fortune' AS slug, ['character-personality','daily','kanji-level'] AS nxt, ['traditional-color','yoji-personality','impossible-advice'] AS rel, ['daily','kanji-level','kanji-kanaru'] AS rec, ['character-personality','traditional-color','yoji-personality'] AS newrel),
STRUCT('animal-personality' AS slug, ['unexpected-compatibility','daily','kanji-level'] AS nxt, ['traditional-color','yoji-personality','impossible-advice'] AS rel, ['daily','kanji-level','kanji-kanaru'] AS rec, ['unexpected-compatibility','music-personality','character-fortune'] AS newrel),
STRUCT('science-thinking' AS slug, ['traditional-color','daily','kanji-level'] AS nxt, ['traditional-color','yoji-personality','impossible-advice'] AS rel, ['daily','kanji-level','kanji-kanaru'] AS rec, ['traditional-color','yoji-personality','impossible-advice'] AS newrel),
STRUCT('japanese-culture' AS slug, ['unexpected-compatibility','daily','kanji-level'] AS nxt, ['traditional-color','yoji-personality','impossible-advice'] AS rel, ['daily','kanji-level','kanji-kanaru'] AS rec, ['unexpected-compatibility','music-personality','character-fortune'] AS newrel),
STRUCT('character-personality' AS slug, ['character-fortune','daily','kanji-level'] AS nxt, ['traditional-color','yoji-personality','impossible-advice'] AS rel, ['daily','kanji-level','kanji-kanaru'] AS rec, ['character-fortune','traditional-color','yoji-personality'] AS newrel),
STRUCT('word-sense-personality' AS slug, ['yoji-personality','daily','kotowaza-level'] AS nxt, ['traditional-color','yoji-personality','impossible-advice'] AS rel, ['daily','kotowaza-level','yoji-kimeru'] AS rec, ['yoji-personality','traditional-color','unexpected-compatibility'] AS newrel)
])),
pv AS (
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
  SELECT DISTINCT user_pseudo_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key='ga_session_id') sid,
    event_timestamp ts,
    REGEXP_EXTRACT((SELECT value.string_value FROM UNNEST(event_params) WHERE key='page_location'), r'https?://[^/]+(/[^?#]*)') path
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260328' AND '20260928' AND event_name='level_end'
), g AS (
  SELECT s.*, REGEXP_EXTRACT(s.path, r'^/play/([a-z-]+)/?$') slug,
    REGEXP_EXTRACT(s.next_path, r'^/play/([a-z-]+)/?$') nslug,
    EXISTS(SELECT 1 FROM ends e WHERE e.user_pseudo_id=s.user_pseudo_id AND e.sid=s.sid AND RTRIM(e.path,'/')=RTRIM(s.path,'/') AND e.ts>=s.ts AND (s.next_ts IS NULL OR e.ts<s.next_ts)) finished
  FROM seq s
), q AS (
  SELECT g.*, m.nxt, m.rel, m.rec, m.newrel FROM g JOIN m ON g.slug=m.slug
)
SELECT finished,
  CASE
    WHEN next_path IS NULL THEN 'z_exit'
    WHEN nslug = slug THEN 'y_same'
    WHEN STARTS_WITH(next_path, CONCAT('/play/', slug, '/result')) THEN 'x_ownresult'
    WHEN nslug IS NULL OR nslug='' THEN 'w_other'
    WHEN nslug IN UNNEST(nxt) AND nslug IN UNNEST(rel) THEN 'a_next_and_rel'
    WHEN nslug IN UNNEST(nxt) AND nslug IN UNNEST(rec) THEN 'b_next_and_rec'
    WHEN nslug IN UNNEST(nxt) THEN 'c_next_only'
    WHEN nslug IN UNNEST(rel) THEN 'd_rel_only'
    WHEN nslug IN UNNEST(rec) THEN 'e_rec_only'
    ELSE 'f_none' END dest,
  COUNT(*) views, COUNT(DISTINCT user_pseudo_id) users,
  COUNTIF(nslug IN UNNEST(newrel)) views_to_newrel,
  COUNT(DISTINCT IF(nslug IN UNNEST(newrel), user_pseudo_id, NULL)) users_to_newrel,
  COUNTIF(nslug='daily') to_daily
FROM q GROUP BY 1,2 ORDER BY 1,2
