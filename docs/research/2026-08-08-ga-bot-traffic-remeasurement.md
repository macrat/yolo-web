# GAのボット混入の再実測（B-635）: 計器のどの列が壊れ、どの列が生き残っているか

- 調査日: 2026-08-08（B-635）
- 目的: cycle-302 レビューの副産物として記録された「直近28日の 33.0% がデータセンター由来」という主張を、BigQuery の生ログで**独立に測り直し**、(a) 数値が再現するか (b) 方法論が妥当か (c) **どの指標が壊れ、どの指標が生きているか**を確定する。
- データ: GA4 BigQuery `yolo-web-gcp.analytics_524708437.events_*`。実行は `npx tsx .claude/skills/analyze-bigquery/scripts/query.ts --file <sql>`。
- 本ドキュメントの位置づけ: **cycle-302 の記述の訂正版**。初出は `docs/cycles/cycle-302/review-log.md:133`（M-9）および `:1094`（副産物）。`docs/cycles/` は失敗サイクルの記録として**無改変で残す方針**のため、あちらは直さない。**訂正はここが正**。
- 再現性について: 本文には SQL のコードブロックが 22 個あり、**うち「クエリ」として載せた 21 個はすべて単体で実行できる完全な形**にしてある（`WITH` の共通部分は毎回書き下している。元は `tmp/*.sql` にあり、`tmp/` は追跡外で消えるため移した）。**唯一の例外は §3 の `CASE` 式で、これはクエリではなく他のクエリに埋め込む式の断片である**（単体では実行できない）。21 個は本文から逐語で抜き出して実際に実行し、**21 個すべてが通ることを数えて確認した**。ただし、本文中で「上の SQL の◯◯を差し替えると」と**散文で説明している派生クエリ**（§4-5 の葉パス書き出し、§5-3 の Direct 内訳、§7 の非SG指紋、§8-1 のイベント別内訳）は、ブロックとしては載せていない。**本文の数値はすべて本調査で実行し直して得たもの**であり、伝聞をそのまま写したものではない。確かめられなかったことは §7 に明記する。

---

## 0. 用語（先に固定する。ここを曖昧にすると結論が反転する）

**`session_engaged` はイベント単位に刻まれる。** したがって「エンゲージ」には**2つの数え方**があり、値がまったく違う。本ドキュメントでは常にどちらかを明示する。

| 呼び方               | 定義                                                            | このボットに対する挙動    |
| -------------------- | --------------------------------------------------------------- | ------------------------- |
| **セッション単位**   | `MAX(IF(session_engaged='1',1,0))` でセッションに畳む           | **ボットが 93.5% 通る**   |
| **`page_view` 単位** | `page_view` 行の `session_engaged='1'` を数える（`engaged_pv`） | **ボットは1件も通らない** |

理由は §8-1 で実測する。**単位を言わずに「engaged」と書いてはいけない。**

---

## 1. 結論（先に）

1. **混入は「疑い」ではなく実測済みの事実。** 直近28日窓（`20260710`–`20260806`・以下「窓C」）で **4,902 セッション中 3,608（73.60%）がシンガポール帰属**、PV/セッション 1.000。
2. **急増は進行中。** 日次のシンガポール帰属セッションは 8/4=17 → **8/5=370** → **8/6=3,020**。GA4 エクスポートは 8/6 までしか無いため、8/7 以降は未観測。なお**小規模な混入は7月から続いており**（→ §4-2）、8/5 に始まったのは急増のほうである。
3. **定型レポートの `engaged_pv` 列は無事だった。** `scripts/analytics-report.ts:122` が数える `page_view` 単位の `engaged_pv` は、**シンガポール由来が全セクションで 0 件**（窓C全体で 605 件、すべて非SG）。**ただしこれは「列が強い」からではなく、このボットが1セッション1PVしか撃たないからである**（→ §8-1）。また `engaged_pv` はセクションによって人間の PV の 12.5%〜68.5% しか拾わないので、**これに切り替えれば済むわけでもない**（→ §5-4）。
4. **壊れているのは生カウントの列。** 全体合計 PV／日別・週別 PV／セッション数／国別／チャネル別／**セッション単位のエンゲージメント率**。加えて、**PM が自分でセクション別に集計したときの生 PV**（`/dictionary/kanji/*` は生 PV の **95.7%** がシンガポール由来）。
5. **定型レポートの「上位ページ PV Top20」は、この窓ではたまたま無事。** **ボットが押し上げて入り込んだページは1本も無い**（生 PV 順位と SG 除外順位を全パスで突き合わせ、20位以内の22行すべてを数えて確認）。ただし理由は「ボットの出す PV が小さいから」ではない——生 PV は**人間＋ボットの合算**で、実際 `/blog/markdown-cheatsheet` はボットの4PVで 32位→23位 まで上がり、**しきい値 9PV まで残り 1PV** だった（→ §5-5）。保証ではない。
6. **「データセンター由来」とは断定できない。** GA4 エクスポートに IP / ASN フィールドが**存在しない**（→ §6）。言えるのは「実在の来訪トラフィックではない」まで。

---

## 2. 窓の同定（なぜこの3つの窓か）

**cycle-302 には窓が2つある。** 混同しないよう先に分離する。

| 窓                                    | 期間                  | 総セッション | 出所                                                                                |
| ------------------------------------- | --------------------- | -----------: | ----------------------------------------------------------------------------------- |
| **窓A**（`:133` M-9 の窓）            | `20260707`–`20260803` |    **1,435** | `docs/cycles/cycle-302/ga-context.md:6,11,12` に日付・定義・総数が明記されている    |
| **窓B**（`:1094` の窓）               | `20260709`–`20260805` |    **1,859** | 日付の記録が無いため、本調査が同定した（下記）                                      |
| **窓C**（最新エクスポート日から28日） | `20260710`–`20260806` |    **4,902** | GA4 エクスポートの最新が `events_20260806` なので、そこを終端に28日を取るとこうなる |

- **窓A は記録されている。** `ga-context.md:6` に「集計期間: 2026-07-07 〜 2026-08-03（28日間）」、`:12` に「期間内の総セッション数 = 1,435」とあり、`review-log.md:133`（M-9）の書き出し「GA の 1,435 セッションに対する」と一致する。実測でも同窓で総セッション 1,435・Linux 234 と再現した（→ §4-2）。
- **窓B は日付が記録されていなかった。** `review-log.md:1082` に「日本31セッション」等の内訳が独立に記録されており、そこに現れる**「日本のみ n=1,185」と完全一致する窓を探して同定**した。`20260709`–`20260805` で日本 1,185・シンガポール 614（33.03%）となり、`:1094` の記述（シンガポール614・33.0%）と一致する。
- **窓C** の GA4 エクスポート最新テーブルは `events_20260806`。08-07 / 08-08 は**未着**。
- **窓C は「定型レポートを今日実行したときの窓」とは一致しない。** `scripts/analytics-report.ts:65-66` は `const to = new Date()` / `from = to - 28日` と**実行時のローカル時刻**で窓を決めるので、2026-08-08 に実行すると `_TABLE_SUFFIX BETWEEN '20260711' AND '20260808'` になる（存在するテーブルは `20260711`–`20260806` まで）。**窓Cより開始が1日遅い。** 本ドキュメントの数値を定型レポートの出力と突き合わせるときは、この1日のずれを織り込むこと。

```sql
-- エクスポートの範囲を確認する
SELECT MAX(_TABLE_SUFFIX) AS max_suffix, MIN(_TABLE_SUFFIX) AS min_suffix
FROM `analytics_524708437.events_*`
```

実測: `max_suffix = 20260806`, `min_suffix = 20260328`。

**窓B と窓C は1日ずらしただけで比較可能なはずが、まったく違う姿を返す。** それ自体が混入の証拠になっている。以降、断りが無ければ「28日窓」は窓Cを指す。

---

## 3. 数え方の定義

- **セッション**: `CONCAT(user_pseudo_id, '.', ga_session_id)` の distinct。
  `.claude/skills/analyze-bigquery/scripts/channel-ranking.sh:35` の慣行に合わせている。
- **国の帰属**: セッション内の最初のイベントの国。
  `ARRAY_AGG(country ORDER BY event_timestamp LIMIT 1)[OFFSET(0)]`。
  1セッションが複数国のイベントを持つことがあるため（→ §4-3）、単純な `GROUP BY geo.country` だと二重計上になる。
- **PV**: `COUNTIF(event_name = 'page_view')`。
- **パス**: `page_location` からドメインと `?`/`#` 以降を除去したもの。
- **セクション**: 本ドキュメントのセクション別集計はすべて**次の CASE 式で統一**している（末尾スラッシュ無しの一覧ページも各セクションに含める）。

```sql
CASE
  WHEN path LIKE '/dictionary/kanji/%'  THEN '/dictionary/kanji/*'
  WHEN path LIKE '/dictionary/yoji/%'   THEN '/dictionary/yoji/*'
  WHEN path LIKE '/dictionary/colors/%' THEN '/dictionary/colors/*'
  WHEN path LIKE '/dictionary%'         THEN '/dictionary(other)'
  WHEN path LIKE '/blog%'               THEN '/blog*'
  WHEN path LIKE '/play%'               THEN '/play*'
  WHEN path LIKE '/tools%'              THEN '/tools*'
  ELSE '(other)'
END
```

> 分岐の順序と `/%` か `%` かで数値が変わる。例えば `/dictionary`（末尾スラッシュ無し）や `/blog`（一覧ページ）を含めるかで、窓Cのシンガポール由来 PV は `/dictionary(other)` が **33パス/40PV**（上の CASE）と **32パス/39PV**（`/dictionary/%` の排他版）、`/blog*` が **117パス/195PV** と **116パス/193PV** に割れる。**セクション別の数字を引用するときは、必ずこの CASE とセットで引用すること。** 本ドキュメントの数字はすべて上の CASE で測っている。

---

## 4. 方法論の妥当性検証（本調査で再実行済み）

「数え方のバグで大きく見えているだけ」ではないことを、独立な5経路で確かめた。

> **注意**: §4-2 は窓A・窓Bで測っている（cycle-302 の記述の検算だから）。§4-1・§4-3・§4-4 は**窓Bと窓Cの両方**を載せる。窓によって値が大きく動く項目があるため（とくに §4-3）、**片方の窓の値をもう片方に流用してはいけない**。§4-5 は窓C。

### 4-1. 別経路の計器が同じ数を出すか（`session_start` 突き合わせ・NULL 点検）

```sql
-- 窓を差し替えて2回実行する
WITH e AS (
  SELECT CONCAT(user_pseudo_id,'.',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    event_name, user_pseudo_id,
    (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS gsid
  FROM `analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260710' AND '20260806'   -- 窓B は '20260709' AND '20260805'
), s AS (
  SELECT sid, COUNTIF(event_name='session_start') AS n_ss FROM e GROUP BY sid
)
SELECT COUNT(*) AS sessions,
  (SELECT COUNTIF(event_name='session_start') FROM e) AS ss_events,
  COUNTIF(n_ss=0) AS sessions_without_ss, COUNTIF(n_ss>1) AS sessions_with_multiple_ss,
  (SELECT COUNTIF(user_pseudo_id IS NULL) FROM e) AS null_user_pseudo_id,
  (SELECT COUNTIF(gsid IS NULL) FROM e) AS null_ga_session_id
FROM s
```

| 項目                       |     窓B |     窓C |
| -------------------------- | ------: | ------: |
| セッション（§3 の定義）    |   1,859 |   4,902 |
| `session_start` イベント数 |   1,859 |   4,906 |
| `session_start` を持たない |       4 |       3 |
| `session_start` を2つ持つ  |       4 |       7 |
| `user_pseudo_id` が NULL   | **0件** | **0件** |
| `ga_session_id` が NULL    | **0件** | **0件** |

- **別経路の計器がほぼ同じ数を出す**（窓Cで 4,906 対 4,902、差 0.08%）。桁違いのズレは無い。
- **窓Bの「1,859 対 1,859」の完全一致は偶然である。** 内訳を見れば分かるとおり、`session_start` を持たないセッション4件と、2つ持つセッション4件が**たまたま打ち消し合っている**。一致を「厳密な恒等式」として引用してはいけない。
- **NULL 崩壊バグは踏んでいない。** `CONCAT` は引数に1つでも NULL があると全体が NULL になるが、両方とも NULL は0件だった。

### 4-2. 都市欠損の分布（**cycle-302 の誤りの訂正点**）

```sql
-- 窓B（20260709–20260805）でシンガポール帰属セッションを OS 別に見る
WITH e AS (
  SELECT CONCAT(user_pseudo_id,'.',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    event_timestamp, geo.country AS country, geo.city AS city, device.operating_system AS os
  FROM `analytics_524708437.events_*` WHERE _TABLE_SUFFIX BETWEEN '20260709' AND '20260805'
), s AS (
  SELECT sid,
    ARRAY_AGG(country ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS country,
    ARRAY_AGG(city ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS city,
    ARRAY_AGG(os ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS os
  FROM e GROUP BY sid
)
SELECT os, COUNT(*) AS sessions, COUNTIF(city='' OR city IS NULL) AS city_empty,
  ROUND(COUNTIF(city='' OR city IS NULL)*100/COUNT(*),1) AS pct_empty
FROM s WHERE country='Singapore' GROUP BY os ORDER BY sessions DESC
```

実測（窓B・シンガポール帰属 614 セッション）:

| OS        | セッション | city 空 | 空の割合 |
| --------- | ---------: | ------: | -------: |
| Macintosh |        364 |       9 |     2.5% |
| Linux     |        237 |     237 | **100%** |
| Windows   |         12 |      11 |    91.7% |
| Android   |          1 |       1 |     100% |

都市の値そのもので数えても同じ: `city = 'Singapore'` 356 セッション（58.0%）/ 空文字 258 セッション（42.0%）。`(not set)` は0件。

> **訂正**: cycle-302 は「city空」を**シンガポール流入全体の性質**として書いた（`review-log.md:1094`）。実際には **42%（258/614）だけ**である。100% なのは **SG かつ Linux の部分集合（237セッション）**であって、多数派の Macintosh（364セッション）は `city = Singapore` を返す。

**誤りの発生源は `review-log.md:133`（M-9）である。** ただし `:133` 自体は、その窓（窓A）では正しい。

```sql
-- 窓A（20260707–20260803）で M-9 の3つの数字を検算する
WITH e AS (
  SELECT CONCAT(user_pseudo_id,'.',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    event_timestamp, geo.country AS country, geo.city AS city, device.operating_system AS os
  FROM `analytics_524708437.events_*` WHERE _TABLE_SUFFIX BETWEEN '20260707' AND '20260803'
), s AS (
  SELECT sid,
    ARRAY_AGG(country ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS country,
    ARRAY_AGG(city ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS city,
    ARRAY_AGG(os ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS os
  FROM e GROUP BY sid
)
SELECT COUNT(*) AS total_sessions, COUNTIF(os='Linux') AS linux_all,
  COUNTIF(os='Linux' AND country='Singapore' AND (city='' OR city IS NULL)) AS linux_sg_cityempty,
  ROUND(100*COUNTIF(os='Linux' AND country='Singapore' AND (city='' OR city IS NULL))/COUNTIF(os='Linux'),1) AS pct
FROM s
```

実測: 総セッション **1,435** / Linux（全国）**234** / うち「シンガポール発かつ都市不明」**215** = **91.9%**。**M-9 が書いた3つの数字がすべて同時に一致する**ので、`:133` の窓が窓Aであることは確定する。

つまり `:133` の「Linux 234セッション・91.9%が都市不明のシンガポール発」は、**234 = 全 Linux セッション**を分母にした**部分集合についての正しい記述**である。それが同ファイル `:1094` の要約で**シンガポール流入全体の性質に一般化**されて誤りになった。

**本調査の 237 と `:133` の 234 は、窓が違うだけでなく分母の集合が違う**（237 = 窓Bの「SG かつ Linux」、234 = 窓Aの「全 Linux」）。窓Bの全 Linux は 256 である。**SG かつ Linux に限れば city 空は窓Bでも 100%** であり、91.9% にはならない。

**この Linux 由来の小規模混入は 7 月から続いている**（窓Aで 234 セッション中 215）。8/5 に始まったのは急増であって混入そのものではない。

**「7月開始」は窓Aの観測だけに頼らず、エクスポート全期間で確かめられる。** 窓を切らずに月別で数えると、混入の始点がはっきり出る:

```sql
-- エクスポート全期間（20260328–20260806）。セッションを「最初のイベントの月」に帰属させる
WITH e AS (
  SELECT CONCAT(user_pseudo_id,'.',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    event_timestamp, event_date, geo.country AS country
  FROM `analytics_524708437.events_*`
), s AS (
  SELECT sid,
    ARRAY_AGG(event_date ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS d,
    ARRAY_AGG(country ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS country
  FROM e GROUP BY sid
)
SELECT SUBSTR(d,1,6) AS ym, COUNT(*) AS sessions, COUNTIF(country='Singapore') AS sg
FROM s GROUP BY ym ORDER BY ym
```

実測（全期間・全月を列挙。除外・抜粋なし）:

| 月        | 総セッション | シンガポール帰属 |
| --------- | -----------: | ---------------: |
| 2026-03   |           25 |            **0** |
| 2026-04   |          260 |            **0** |
| 2026-05   |          265 |            **0** |
| 2026-06   |          392 |            **0** |
| 2026-07   |        1,321 |          **221** |
| 2026-08\* |        3,869 |        **3,443** |

\* 2026-08 は 08-06 までの6日分。

**エクスポート開始（3/28）から 6 月末までシンガポール帰属は 1 件も無く、7 月に 221 件現れ、8 月の6日間で 3,443 件に達している。** 「7月開始」は窓Aだけでなく全期間で裏付けられる。

### 4-3. 複数国にまたがるセッションは何なのか（**窓で激変する項目**）

```sql
-- 窓を差し替えて2回実行する
WITH e AS (
  SELECT CONCAT(user_pseudo_id,'.',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    geo.country AS country
  FROM `analytics_524708437.events_*` WHERE _TABLE_SUFFIX BETWEEN '20260710' AND '20260806'
), s AS (
  SELECT sid, COUNT(DISTINCT country) AS n_countries FROM e GROUP BY sid
)
SELECT COUNT(*) AS sessions, COUNTIF(n_countries>1) AS multi_country_sessions,
  ROUND(COUNTIF(n_countries>1)*100/COUNT(*),1) AS pct
FROM s
```

実測: **窓B 344 / 1,859 = 18.5%**、**窓C 3,267 / 4,902 = 66.6%**。**同じ指標が窓を1日ずらすと3.6倍になる。** 片方の値を「サイトの性質」として引用してはいけない。

副次的に現れる国が実在の来訪かを、サイト全体（帰属を通さない生イベント）で確かめる:

```sql
SELECT geo.country AS country, COUNT(*) AS events,
  COUNTIF(event_name='session_start') AS session_start_events,
  COUNTIF(event_name='page_view') AS page_view_events
FROM `analytics_524708437.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260709' AND '20260805'
  AND geo.country IN ('Brazil','Ukraine','Bangladesh','Argentina')
GROUP BY country ORDER BY events DESC
```

実測（窓B）:

| 国         | イベント | session_start | page_view |
| ---------- | -------: | ------------: | --------: |
| Brazil     |       66 |         **0** |     **0** |
| Ukraine    |       37 |         **0** |     **0** |
| Bangladesh |       21 |         **0** |     **0** |
| Argentina  |       17 |         **0** |     **0** |

**サイト全体で `session_start` も `page_view` も1件も無い。** つまりこれらは「ブラジルから来た訪問者」ではなく、**既存セッションの途中で IP がローテートした断片**である。国別の分母を国名の素朴な `GROUP BY` で作ると、この断片が実在の国として現れてしまう。

**逆方向の取りこぼしは起きていない。** 窓Cで「非シンガポール帰属なのに Singapore のイベントを含むセッション」を数えると **4,902 中 1 件**だった。§5 の「SG除外」列が、ローテーションでボットを取り逃している心配は無い。

### 4-4. 帰属ルールを変えても結論が動かないか（感度分析）

「最初のイベントの国」というルールが結論を作っているのではないことを、`session_start` の国に切り替えて確認する。

```sql
-- 窓を差し替えて2回実行する
WITH e AS (
  SELECT CONCAT(user_pseudo_id,'.',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    event_timestamp, geo.country AS country, event_name
  FROM `analytics_524708437.events_*` WHERE _TABLE_SUFFIX BETWEEN '20260710' AND '20260806'
), s AS (
  SELECT sid,
    ARRAY_AGG(country ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS c_first,
    ARRAY_AGG(IF(event_name='session_start', country, NULL) IGNORE NULLS ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS c_ss
  FROM e GROUP BY sid
)
SELECT COUNTIF(c_first='Singapore') AS sg_by_first_event,
  COUNTIF(c_ss='Singapore') AS sg_by_session_start,
  COUNTIF(IFNULL(c_ss,c_first)='Singapore') AS sg_by_session_start_with_fallback,
  COUNTIF(c_first='Japan') AS jp_by_first_event,
  COUNTIF(c_ss='Japan') AS jp_by_session_start
FROM s
```

| 帰属ルール                                 | 窓B: 日本 | 窓B: SG | 窓C: SG |
| ------------------------------------------ | --------: | ------: | ------: |
| 最初のイベントの国（本文の標準）           |     1,185 |     614 |   3,608 |
| `session_start` の国                       |     1,185 |     612 |   3,606 |
| `session_start` の国（無い場合は最初の国） |     1,185 |     615 |   3,609 |

**振れ幅は窓Bで 0.16pt（612〜615 / 1,859）、窓Cで 0.06pt（3,606〜3,609 / 4,902）。結論は帰属ルールに依存していない。**

### 4-5. シンガポール流入は「閲覧」なのか「全数列挙」なのか

```sql
-- 窓C。シンガポール帰属セッションの page_view を、踏まれたパス単位に畳む
WITH e AS (
  SELECT CONCAT(user_pseudo_id,'.',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    event_timestamp, geo.country AS country, event_name,
    REGEXP_REPLACE(REGEXP_REPLACE((SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='page_location'), r'https?://[^/]+',''), r'[?#].*$','') AS path
  FROM `analytics_524708437.events_*` WHERE _TABLE_SUFFIX BETWEEN '20260710' AND '20260806'
), s AS (
  SELECT sid, ARRAY_AGG(country ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS country FROM e GROUP BY sid
), sgpv AS (
  SELECT e.path FROM e JOIN s USING (sid) WHERE s.country='Singapore' AND e.event_name='page_view'
), byp AS (SELECT path, COUNT(*) AS c FROM sgpv GROUP BY path)
SELECT SUM(c) AS sg_pageviews, COUNT(*) AS distinct_paths, MAX(c) AS max_pv_per_path,
  COUNTIF(c=1) AS paths_hit_once
FROM byp
```

実測: **PV 3,609 が 3,214 個の異なるパスに分散**。1パスあたり最大 6PV、**2,870 パスは1回きり**。

**3,214 という数はサイトの実 URL 空間とほぼ同じ大きさである。** `curl -s https://yolos.net/sitemap.xml | grep -c "<loc>"` = **572** だが、**572 は sitemap の登録件数であってサイトの総 URL 数ではない**。`/dictionary/kanji/[char]` と `/dictionary/yoji/[word]` は sitemap に載らない動的ルートで、`src/data/kanji-data.json` = **2,136 件**、`src/data/yoji-data.json` = **400 件**ある（`src/app/sitemap.ts` は colors / humor は列挙するが kanji / yoji の個別ページは列挙しない）。実 URL 数は少なくとも **572 + 2,136 + 400 = 3,108**。

上の `sgpv` を §3 の CASE でセクションに畳むと、内訳はこうなる:

```sql
-- 窓C。シンガポール帰属セッションの page_view を §3 の CASE でセクションに畳む
WITH e AS (
  SELECT CONCAT(user_pseudo_id,'.',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    event_timestamp, geo.country AS country, event_name,
    REGEXP_REPLACE(REGEXP_REPLACE((SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='page_location'), r'https?://[^/]+',''), r'[?#].*$','') AS path
  FROM `analytics_524708437.events_*` WHERE _TABLE_SUFFIX BETWEEN '20260710' AND '20260806'
), s AS (
  SELECT sid, ARRAY_AGG(country ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS country FROM e GROUP BY sid
), sgpv AS (
  SELECT e.path FROM e JOIN s USING (sid) WHERE s.country='Singapore' AND e.event_name='page_view'
)
SELECT CASE
    WHEN path LIKE '/dictionary/kanji/%'  THEN '/dictionary/kanji/*'
    WHEN path LIKE '/dictionary/yoji/%'   THEN '/dictionary/yoji/*'
    WHEN path LIKE '/dictionary/colors/%' THEN '/dictionary/colors/*'
    WHEN path LIKE '/dictionary%'         THEN '/dictionary(other)'
    WHEN path LIKE '/blog%'               THEN '/blog*'
    WHEN path LIKE '/play%'               THEN '/play*'
    WHEN path LIKE '/tools%'              THEN '/tools*'
    ELSE '(other)' END AS section,
  COUNT(DISTINCT path) AS distinct_paths, COUNT(*) AS pv
FROM sgpv GROUP BY section ORDER BY distinct_paths DESC
```

| セクション             | 踏まれた distinct パス |    PV |
| ---------------------- | ---------------------: | ----: |
| `/dictionary/kanji/*`  |              **2,343** | 2,512 |
| `/dictionary/yoji/*`   |                    409 |   499 |
| `/dictionary/colors/*` |                    256 |   268 |
| `/blog*`               |                    117 |   195 |
| `/tools*`              |                     35 |    57 |
| `/dictionary(other)`   |                     33 |    40 |
| `/play*`               |                     18 |    33 |
| （その他）             |                      3 |     5 |

**`/dictionary/kanji/*` の 2,343 が実在の漢字ページ 2,136 を上回るのは、このバケツが索引ルートも飲み込んでいるからである。** `src/app/dictionary/kanji/` には `[char]` のほかに `radical/[radical]` / `grade/[grade]` / `stroke/[count]` の索引ルートがある。踏まれた 2,343 パスを分けると:

```sql
-- 窓C。シンガポール帰属セッションの page_view を漢字セクションに絞り、ルートの種類ごとに数える
WITH e AS (
  SELECT CONCAT(user_pseudo_id,'.',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    event_timestamp, geo.country AS country, event_name,
    REGEXP_REPLACE(REGEXP_REPLACE((SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='page_location'), r'https?://[^/]+',''), r'[?#].*$','') AS path
  FROM `analytics_524708437.events_*` WHERE _TABLE_SUFFIX BETWEEN '20260710' AND '20260806'
), s AS (
  SELECT sid, ARRAY_AGG(country ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS country FROM e GROUP BY sid
), sgpv AS (
  SELECT e.path FROM e JOIN s USING (sid) WHERE s.country='Singapore' AND e.event_name='page_view'
)
SELECT CASE
    WHEN path LIKE '/dictionary/kanji/radical/%'  THEN 'radical'
    WHEN path LIKE '/dictionary/kanji/stroke/%'   THEN 'stroke'
    WHEN path LIKE '/dictionary/kanji/grade/%'    THEN 'grade'
    WHEN path LIKE '/dictionary/kanji/category/%' THEN 'category'
    WHEN REGEXP_CONTAINS(path, r'^/dictionary/kanji/[^/]+/?$') THEN 'leaf(漢字1字のページ)'
    ELSE 'other' END AS kind,
  COUNT(DISTINCT path) AS distinct_paths
FROM sgpv WHERE path LIKE '/dictionary/kanji/%' GROUP BY kind ORDER BY distinct_paths DESC
```

| 種類                    | distinct パス |
| ----------------------- | ------------: |
| leaf（漢字1字のページ） |     **2,114** |
| `radical/*`             |           196 |
| `stroke/*`              |            24 |
| `grade/*`               |             7 |
| `category/*`            |             2 |

**漢字の葉ページは 2,114 / 実在 2,136 = 99.0% が踏まれている。** 超過分は 404 でも削除済みパスでもなく、実在する索引ルートだった。

**さらに、踏まれた葉パス 2,114 件を全件 `src/data/kanji-data.json`（2,136 件）と突き合わせると、実在しない漢字は 0 件だった。** 上の SQL の末尾の集計を `SELECT DISTINCT path FROM sgpv WHERE REGEXP_CONTAINS(path, r'^/dictionary/kanji/[^/]+/?$')`（＝ leaf の条件そのもの）に差し替えて 2,114 件を書き出し、`/dictionary/kanji/` を除いた文字を `character` フィールドの集合（2,136 件）と照合した。**照合したのは 2,114 件全件で、集合に無かったのは 0 件。** つまり**ボットは URL を推測で生成しているのではなく、実在する URL 空間を知った上で列挙している**（架空 URL への 404 アクセスがゼロ）。全数列挙という読みは、この2つの分解でむしろ強まる。

デバイス指紋:

```sql
-- 窓C。シンガポール帰属セッションを OS/ブラウザ/チャネルで割る
WITH e AS (
  SELECT CONCAT(user_pseudo_id,'.',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    event_timestamp, geo.country AS country,
    device.operating_system AS os, device.web_info.browser AS browser,
    IFNULL(session_traffic_source_last_click.cross_channel_campaign.default_channel_group,'(not set)') AS channel
  FROM `analytics_524708437.events_*` WHERE _TABLE_SUFFIX BETWEEN '20260710' AND '20260806'
), s AS (
  SELECT sid,
    ARRAY_AGG(country ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS country,
    ARRAY_AGG(os ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS os,
    ARRAY_AGG(browser ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS browser,
    ARRAY_AGG(channel ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS channel
  FROM e GROUP BY sid
)
SELECT country, os, browser, channel, COUNT(*) AS sessions
FROM s WHERE country='Singapore' GROUP BY 1,2,3,4 ORDER BY sessions DESC LIMIT 8
```

実測（窓C・シンガポール 3,608）:

| OS        | ブラウザ | チャネル       | セッション |
| --------- | -------- | -------------- | ---------: |
| Macintosh | Chrome   | Direct         |  **3,375** |
| Linux     | Chrome   | Direct         |        227 |
| Linux     | Chrome   | Unassigned     |          3 |
| Windows   | Chrome   | Direct         |          2 |
| Android   | Opera    | Organic Search |          1 |

**3,608 中 3,375（93.5%）が Macintosh / Chrome / Direct の単一指紋。**

> **紛らわしい一致に注意**: この 3,375 と、§5-3 に出てくる「セッション単位でエンゲージ判定されたシンガポールのセッション数 3,375」は**別物**である。どちらも 3,608 の 93.5% になるのは偶然で、集合としては一致しない（前者はデバイス指紋、後者はエンゲージ判定）。

---

## 5. 影響範囲の切り分け

判定の基準は「シンガポール帰属セッションを除いたときに値が変わるか」。

> **前提の限界**: 「シンガポール帰属＝ボット」は近似である。非SG側にも同じ指紋が残っており（→ §7）、逆にシンガポール帰属 3,608 の中に実在の来訪者が数件混じっている可能性も否定していない。以下の表の見出しは「ボット比率」ではなく**「SG帰属比率」**として読むこと。SG ≒ ボットと見なせる根拠は §4-5 にある。

### 5-1. 実測値サマリ（窓B・窓C）

```sql
-- 窓の日付だけ差し替えて2回実行する
WITH e AS (
  SELECT CONCAT(user_pseudo_id,'.',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    event_timestamp, geo.country AS country, event_name
  FROM `analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260709' AND '20260805'   -- もう一方は '20260710' AND '20260806'
), s AS (
  SELECT sid,
    ARRAY_AGG(country ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS country,
    COUNTIF(event_name='page_view') AS pv
  FROM e GROUP BY sid
)
SELECT country, COUNT(*) AS sessions,
  ROUND(COUNT(*) * 100 / SUM(COUNT(*)) OVER (), 2) AS pct,
  SUM(pv) AS pageviews,
  ROUND(SAFE_DIVIDE(SUM(pv), COUNT(*)), 3) AS pv_per_session,
  SUM(COUNT(*)) OVER () AS total_sessions
FROM s GROUP BY country ORDER BY sessions DESC LIMIT 10
```

| 指標                         |  窓B（07/09–08/05） |  窓C（07/10–08/06） |
| ---------------------------- | ------------------: | ------------------: |
| 総セッション                 |           **1,859** |           **4,902** |
| シンガポール                 |   **614（33.03%）** | **3,608（73.60%）** |
| 日本                         | **1,185（63.74%）** | **1,233（25.15%）** |
| シンガポールの PV/セッション |           **0.997** |           **1.000** |

### 5-2. 日次（急増が進行中であることの証拠）

```sql
-- セッションを「最初のイベントの日」に帰属させて日別に数える
WITH e AS (
  SELECT event_date, CONCAT(user_pseudo_id,'.',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    event_timestamp, geo.country AS country
  FROM `analytics_524708437.events_*` WHERE _TABLE_SUFFIX BETWEEN '20260720' AND '20260806'
), s AS (
  SELECT sid, ARRAY_AGG(event_date ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS d,
    ARRAY_AGG(country ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS country
  FROM e GROUP BY sid
)
SELECT d, COUNT(*) AS sessions, COUNTIF(country='Singapore') AS sg, COUNTIF(country='Japan') AS jp
FROM s GROUP BY d ORDER BY d
```

実測（抜粋。7/20–7/31 の日本は 30〜70 の幅で推移している）:

| 日付  | 総セッション | シンガポール | 日本 |
| ----- | -----------: | -----------: | ---: |
| 08/01 |           79 |           17 |   57 |
| 08/02 |           73 |            5 |   67 |
| 08/03 |          101 |           14 |   87 |
| 08/04 |           86 |           17 |   67 |
| 08/05 |      **424** |      **370** |   49 |
| 08/06 |    **3,106** |    **3,020** |   82 |

**8/5 に急増が始まり、8/6 に一桁上がっている。収束していない。** 日本帰属セッションは 49〜87 の範囲に留まり、**通常の変動幅を超える動きが無い**（日本帰属が人間であることを本調査で検証したわけではない → §7）。

### 5-3. 壊れている指標

```sql
-- 窓C。合計・PV/セッション・エンゲージ（セッション単位）を SG あり/なしで比べる
WITH e AS (
  SELECT CONCAT(user_pseudo_id,'.',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    event_timestamp, geo.country AS country, event_name,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='session_engaged') AS engaged
  FROM `analytics_524708437.events_*` WHERE _TABLE_SUFFIX BETWEEN '20260710' AND '20260806'
), s AS (
  SELECT sid, ARRAY_AGG(country ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS country,
    COUNTIF(event_name='page_view') AS pv,
    MAX(IF(engaged='1',1,0)) AS engaged_session
  FROM e GROUP BY sid
)
SELECT COUNT(*) AS sessions_all, COUNTIF(country!='Singapore') AS sessions_ex_sg,
  SUM(pv) AS pv_all, SUM(IF(country!='Singapore', pv, 0)) AS pv_ex_sg,
  ROUND(SUM(pv)/COUNT(*),3) AS pv_per_session_all,
  ROUND(SUM(IF(country!='Singapore', pv, 0))/COUNTIF(country!='Singapore'),3) AS pv_per_session_ex_sg,
  ROUND(100*SUM(engaged_session)/COUNT(*),1) AS engaged_rate_all,
  ROUND(100*SUM(IF(country!='Singapore', engaged_session, 0))/COUNTIF(country!='Singapore'),1) AS engaged_rate_ex_sg,
  SUM(IF(country='Singapore', engaged_session, 0)) AS sg_engaged_sessions
FROM s
```

| 指標（窓C）                              |    報告値 |    SG除外 |                                      |
| ---------------------------------------- | --------: | --------: | ------------------------------------ |
| セッション                               |     4,902 |     1,294 | **3.79倍に水増し**                   |
| PV（生カウント）                         |     5,474 |     1,865 | **2.94倍に水増し**                   |
| PV/セッション                            |     1.117 |     1.441 | 逆に**過小**                         |
| **エンゲージメント率（セッション単位）** | **85.6%** | **63.6%** | **「うまくいっている」方向へ壊れる** |

**セッション単位のエンゲージメント率は 85.6% と報告されるが、実態は 63.6% である。** シンガポール側は 3,375/3,608 = **93.5% がエンゲージ判定**されている。ボットが「よく読んでいる訪問者」として計上されるため、**指標は良い方向へ壊れる**。これが最も危険な壊れ方である。（※ **`page_view` 単位の `engaged_pv` はこれとまったく違う挙動をする** → §0・§8-1）

チャネル別:

```sql
-- 窓C。上の e / s に channel を足したもの
WITH e AS (
  SELECT CONCAT(user_pseudo_id,'.',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    event_timestamp, geo.country AS country,
    IFNULL(session_traffic_source_last_click.cross_channel_campaign.default_channel_group,'(not set)') AS channel
  FROM `analytics_524708437.events_*` WHERE _TABLE_SUFFIX BETWEEN '20260710' AND '20260806'
), s AS (
  SELECT sid, ARRAY_AGG(country ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS country,
    ARRAY_AGG(channel ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS channel
  FROM e GROUP BY sid
)
SELECT channel, COUNT(*) AS sessions_all, COUNTIF(country!='Singapore') AS sessions_ex_sg,
  ROUND(100*COUNT(*)/SUM(COUNT(*)) OVER (),1) AS pct_all,
  ROUND(100*COUNTIF(country!='Singapore')/SUM(COUNTIF(country!='Singapore')) OVER (),1) AS pct_ex_sg
FROM s GROUP BY channel ORDER BY sessions_all DESC LIMIT 8
```

| チャネル       |  報告 |     報告% | SG除外 |   SG除外% |
| -------------- | ----: | --------: | -----: | --------: |
| Direct         | 3,688 | **75.2%** |     84 |  **6.5%** |
| Organic Search | 1,201 | **24.5%** |  1,200 | **92.7%** |
| Organic Social |     6 |      0.1% |      6 |      0.5% |
| Unassigned     |     5 |      0.1% |      2 |      0.2% |
| Referral       |     2 |      0.0% |      2 |      0.2% |

**チャネル構成は完全に反転している。** 「Direct が主流入」という読みは実態と真逆で、実際は **Organic Search が 92.7%**。cycle-302 の M-9 が「Direct 23.28% は過大」と書いたのと同じ現象が、規模を1桁上げて再発している。

> **残った Direct 84 セッションも、そのまま「人間の直接流入」ではない。** 上の SQL に `os` / `browser` を足し `WHERE country!='Singapore' AND channel='Direct'` で割ると、**日本 33・非日本 51** に分かれ、非日本側の上位は 米国 Linux/Chrome 11・中国 Android Webview 10・中国 Windows/Chrome 7・中国 Linux/Chrome 3（いずれも PV/セッション 1.00）——**§7 に挙げた「非SG側に残る同じ指紋」31 セッションは、全部この Direct 84 の中にいる**。SG を除外しても Direct は残るが、その 37%（31/84）は同型の疑いが濃い。

### 5-4. セクション別の生 PV は壊れている。`engaged_pv` にはこのボットが入らないが、代替にはならない

```sql
-- 窓C。§3 の CASE でセクションに畳み、生 PV・SG由来・engaged_pv を並べる
WITH e AS (
  SELECT CONCAT(user_pseudo_id,'.',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    event_timestamp, geo.country AS country, event_name,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='session_engaged') AS engaged,
    REGEXP_REPLACE(REGEXP_REPLACE((SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='page_location'), r'https?://[^/]+',''), r'[?#].*$','') AS path
  FROM `analytics_524708437.events_*` WHERE _TABLE_SUFFIX BETWEEN '20260710' AND '20260806'
), s AS (
  SELECT sid, ARRAY_AGG(country ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS country FROM e GROUP BY sid
), pv AS (
  SELECT e.path, e.engaged, s.country FROM e JOIN s USING (sid) WHERE e.event_name='page_view'
)
SELECT
  CASE
    WHEN path LIKE '/dictionary/kanji/%'  THEN '/dictionary/kanji/*'
    WHEN path LIKE '/dictionary/yoji/%'   THEN '/dictionary/yoji/*'
    WHEN path LIKE '/dictionary/colors/%' THEN '/dictionary/colors/*'
    WHEN path LIKE '/dictionary%'         THEN '/dictionary(other)'
    WHEN path LIKE '/blog%'               THEN '/blog*'
    WHEN path LIKE '/play%'               THEN '/play*'
    WHEN path LIKE '/tools%'              THEN '/tools*'
    ELSE '(other)' END AS section,
  COUNT(*) AS pv_all, COUNTIF(country='Singapore') AS pv_sg,
  COUNTIF(engaged='1') AS engaged_pv, COUNTIF(country='Singapore' AND engaged='1') AS engaged_pv_sg
FROM pv GROUP BY section ORDER BY pv_all DESC
```

実測（窓C）:

| セクション             | 生 PV | SG由来 | SG帰属比率 | 生PVの過大率 | `engaged_pv` | うち SG由来 |
| ---------------------- | ----: | -----: | ---------: | -----------: | -----------: | ----------: |
| `/dictionary/kanji/*`  | 2,626 |  2,512 |  **95.7%** |   **23.0倍** |           50 |       **0** |
| `/play*`               | 1,422 |     33 |       2.3% |       1.02倍 |          416 |       **0** |
| `/dictionary/yoji/*`   |   572 |    499 |  **87.2%** |    **7.8倍** |           50 |       **0** |
| `/blog*`               |   355 |    195 |  **54.9%** |    **2.2倍** |           51 |       **0** |
| `/dictionary/colors/*` |   295 |    268 |  **90.8%** |   **10.9倍** |            5 |       **0** |
| `/tools*`              |    88 |     57 |  **64.8%** |    **2.8倍** |           11 |       **0** |
| （その他・`/` など）   |    68 |      5 |       7.4% |       1.08倍 |           21 |       **0** |
| `/dictionary(other)`   |    48 |     40 |  **83.3%** |    **6.0倍** |            1 |       **0** |
| **合計**               | 5,474 |  3,609 |      65.9% |       2.94倍 |      **605** |       **0** |

**2つのことが同時に言える。**

- **生 PV でセクション別に集計すると壊れる。** 辞典は最大 23 倍、ブログ 2.2 倍、ツール 2.8 倍に膨らむ。「どの辞典項目が人気か」「どの記事を磨くか」を生 PV で判断すると、ほぼノイズを読むことになる。
- **`engaged_pv` 列にはこのボットが1件も入っていない。** 全セクションで SG 由来の `engaged_pv` が **0**。定型レポートが指示するとおり `engaged_pv` を基準にすれば、**この窓でもセクション別の順位づけの当たりは付く**。

  **ただし `engaged_pv` は「人間の PV を一様に縮小した列」ではない。** 非SG（人間側）の生 PV に対する捕捉率がセクションで大きく違う:

  | セクション             | 人間の生PV | `engaged_pv` |    捕捉率 |
  | ---------------------- | ---------: | -----------: | --------: |
  | `/dictionary/yoji/*`   |         73 |           50 | **68.5%** |
  | `/dictionary/kanji/*`  |        114 |           50 |     43.9% |
  | `/tools*`              |         31 |           11 |     35.5% |
  | （その他）             |         63 |           21 |     33.3% |
  | `/blog*`               |        160 |           51 |     31.9% |
  | `/play*`               |      1,389 |          416 |     29.9% |
  | `/dictionary/colors/*` |         27 |            5 |     18.5% |
  | `/dictionary(other)`   |          8 |            1 | **12.5%** |
  | **合計**               |  **1,865** |      **605** | **32.4%** |

  捕捉率は 12.5%〜68.5% と **5.5倍**開く。具体的な害として、**`engaged_pv` では kanji（50）と yoji（50）が互角に見えるが、人間の生 PV では kanji 114 対 yoji 73 で 1.56 倍の差がある。** セクションを横断して大小を比べる用途では、`engaged_pv` は生 PV とは別方向のバイアスを持ち込む。母数が 605 と小さいことと合わせて、**「`engaged_pv` に切り替えれば済む」わけではない**（→ §7）。

`/play*` の SG 比率が 2.3% と低いのは「人間が繰り返し訪れるから」ではなく、**分母の大きさの違い**による（すべて窓C・実測）。

|              | 踏まれた `/play*` の distinct パス | `/play*` の PV |
| ------------ | ---------------------------------: | -------------: |
| 人間（非SG） |                             **53** |          1,389 |
| ボット（SG） |                             **18** |             33 |

**人間の需要は `/play` に集中していて、非SGの PV を持つ 1,265 セッションのうち 986（78%）がここに落ちる。** 一方ボットは 18 パスしか踏まず、1パスあたり平均 1.8 回（33/18）しか取らないので 33 PV しか積み上がらない。分母が大きく分子が小さいため、比率が 2.3% に留まる。（sitemap 上の `/play/<slug>` は 20 本。人間の 53 パスにはこれに `/play` 一覧や結果ページ等が加わる。）

### 5-5. 定型レポートの「上位ページ PV Top20」は、この窓ではたまたま無事

`scripts/analytics-report.ts:112-124` の Top20 は**生 `pageviews` で降順に並べる**（`ORDER BY pageviews DESC LIMIT 20`）。壊れている列でソートしているので、原理的にはボットに乗っ取られうる。**しかし実際には1本も入ってこなかった。**

```sql
-- scripts/analytics-report.ts:112-124 と同一のクエリを窓Cで実行する
WITH pv AS (
  SELECT
    REGEXP_REPLACE(REGEXP_REPLACE((SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='page_location'), r'https?://[^/]+',''), r'[?#].*$','') AS page_path,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='session_engaged') AS engaged
  FROM `analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260710' AND '20260806' AND event_name='page_view'
)
SELECT page_path, COUNT(*) AS pageviews, COUNTIF(engaged='1') AS engaged_pv
FROM pv GROUP BY page_path ORDER BY pageviews DESC LIMIT 20
```

実測: Top20 は `/play/character-personality`(1,074) を筆頭に `/play`・`/`・`/blog/*`・`/tools/yoji-search`・`/dictionary/yoji/自己中心`(24PV・**8位**) などで占められる。**20位のしきい値は 9PV**（9PV のページが4本あるので、`RANK()` で数えると「20位以内」は 22 行になる）。

汚染の有無は目視ではなく、生 PV 順位と SG 除外 PV 順位を**全パスで**突き合わせて判定する:

```sql
-- 窓C。生 PV・SG由来 PV・SG除外 PV を全パスで並べ、両方の順位を付ける
WITH e AS (
  SELECT CONCAT(user_pseudo_id,'.',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    event_timestamp, geo.country AS country, event_name,
    REGEXP_REPLACE(REGEXP_REPLACE((SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='page_location'), r'https?://[^/]+',''), r'[?#].*$','') AS path
  FROM `analytics_524708437.events_*` WHERE _TABLE_SUFFIX BETWEEN '20260710' AND '20260806'
), s AS (
  SELECT sid, ARRAY_AGG(country ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS country FROM e GROUP BY sid
), pv AS (
  SELECT e.path, s.country FROM e JOIN s USING (sid) WHERE e.event_name='page_view'
), agg AS (
  SELECT path, COUNT(*) AS pv_all, COUNTIF(country='Singapore') AS pv_sg,
    COUNTIF(country!='Singapore') AS pv_ex_sg FROM pv GROUP BY path
), r AS (
  SELECT path, pv_all, pv_sg, pv_ex_sg,
    RANK() OVER (ORDER BY pv_all DESC) AS rank_all,
    RANK() OVER (ORDER BY pv_ex_sg DESC) AS rank_ex_sg
  FROM agg
)
SELECT * FROM r WHERE rank_all <= 40 ORDER BY rank_all, pv_ex_sg DESC
```

**`rank_all <= 20` の 22 行を全部数えると、`rank_ex_sg > 20` になる行は 0 件。** つまり**ボットが押し上げて Top20 に入り込んだページは1本も無い**（22 行の SG 由来 PV は最大でも 3）。

**ただし理由を「ボットが1パスあたり最大6PV しか出さないから」と説明してはいけない。** ページの生 PV は**人間＋ボットの合算**なので、ボット単独の上限はしきい値と直接比べられない（人間4PV＋ボット4PV で 8PV まで積み上がる）。しきい値のすぐ下では実際にこうなっていた（上の結果からの**抜粋**）:

| パス                                  | 生 PV | SG由来 |  人間 | 報告順位 | SG除外順位 |
| ------------------------------------- | ----: | -----: | ----: | -------: | ---------: |
| `/blog/regex-cheatsheet`              |     8 |  **5** |     3 |       23 |     **37** |
| `/blog/markdown-cheatsheet`           |     8 |  **4** |     4 |       23 |     **32** |
| `/blog/choosing-html-tags-by-meaning` |     8 |      3 |     5 |       23 |         27 |
| `/blog/tag/サイト運営`                |     6 |  **6** | **0** |       32 |    **239** |

**`/blog/markdown-cheatsheet` はボットの4PVで 32位→23位 まで押し上げられ、しきい値 9PV まで残り 1PV だった。** `/blog/regex-cheatsheet` はさらに極端で、人間3PVに対しボット5PVで 37位→23位。`/blog/tag/サイト運営` に至っては**人間の PV が0**、6PV すべてがボットで 239位→32位である。

**したがって Top20 が無事だったのは「ボットの出す PV が構造的に小さいから」ではなく、「ボットが多く踏んだページの人間側 PV がたまたま低かったから」である。実測上の余裕は 3PV ではなく 1PV しかない。** 「しきい値が7PV以上なら安全」のような一般化は成り立たない——ボット6PV＋人間3PV で 9PV に届く。

> **「辞典が Top20 に出ない」という意味ではない。** `/dictionary/yoji/自己中心` は人間の需要で8位に入っているし、`/dictionary/kanji/急` は 9PV でちょうど20位のしきい値に並ぶ（`LIMIT 20` のタイ切り次第で出入りする）。**しきい値が 9PV まで下がっている窓では、人間の PV が3〜4しかないページでもボットの上乗せだけで 8PV まで来る。** 混入がもう少し濃い日が続けば Top20 は容易に汚染される。§1-5 の「たまたま無事」はこの意味である。

上位の**順位の細部も動く**（同じ結果からの**抜粋**。`pv_sg` 列は省略）:

| パス                             | 報告 PV | SG除外 PV |       報告順位 |      除外後順位 |
| -------------------------------- | ------: | --------: | -------------: | --------------: |
| `/blog/sql-cheatsheet`           |      39 |        36 |              5 |               5 |
| `/blog/html-tags-cheatsheet`     |      38 |        36 |              6 | **5（同順位）** |
| `/tools/yoji-search`             |      16 |        15 |              9 |               9 |
| `/blog/character-counting-guide` |      16 |        14 |              9 |          **10** |
| `/play/traditional-color`        |      15 |        14 | **11（圏外）** |  **10（圏内）** |

- 5位/6位は除外後に**同値 36 になり順位が消える**。
- `/blog/character-counting-guide`（14）は `/tools/yoji-search`（15）の**下に落ちる**。
- `/play/traditional-color` が**10位タイに入り、上位10の顔ぶれが変わる**。

**したがって「Top20 の顔ぶれは概ね保たれるが、順位の細部と絶対値は信用できない」までしか言えない。** 絶対値の過大率はページによって 8%（`/blog/sql-cheatsheet` 39→36）から 23 倍（辞典個別ページ）まで開く。

> Search Console 由来の指標（impressions / clicks / position）は GA4 とは別経路で収集されるため、この混入の影響を受けないと**推論できる**。ただし**本調査ではこれを実測していない**（→ §7）。

---

## 6. 「データセンター由来」は主張できない

cycle-302 は「33.0% が**データセンター由来**」と書いたが、**この主張を GA4 エクスポートのデータで裏付けることはできない**。

```sql
SELECT column_name, data_type FROM `analytics_524708437.INFORMATION_SCHEMA.COLUMNS`
WHERE table_name='events_20260806'
  AND (LOWER(column_name) LIKE '%ip%' OR LOWER(column_name) LIKE '%asn%'
       OR LOWER(column_name) LIKE '%network%' OR LOWER(column_name) LIKE '%domain%')
```

実測: **0行**。トップレベル列の全リストにも IP / ASN / ネットワーク事業者に相当する列は無い（`event_date, event_timestamp, event_name, event_params, ..., device, geo, ..., session_traffic_source_last_click, publisher, ...`）。`.claude/skills/analyze-bigquery/reference/ga4.md` にも該当フィールドの記載は無い。

**したがって GA4 単体で言えるのは「実在の来訪トラフィックではない」までである。** その根拠は、IP でも ASN でもなく §4-5 の**行動パターン**（実在 URL 空間 3,108 に対して 3,214 パスをほぼ1回ずつ・2,870パスは1回きり・単一デバイス指紋 93.5%・PV/セッション 1.000）と §4-3（副次国の `page_view` 0件）である。ホスティング事業者を特定したいなら、GA4 ではなく**サーバ／CDN のアクセスログ**という別の計器が要る。

---

## 7. 確かめられなかったこと・限界

- **8/7 以降は未観測。** GA4 エクスポートが `events_20260806` までのため、急増がまだ続いているのか止まったのかは分からない。**判断の前に必ず再測すること。**
- **GA4 プロパティ側の設定を一切確認していない。** 本調査が確かめたのは `scripts/analytics-report.ts` というスクリプト1本と BigQuery の生データだけである。GA4 には管理画面側に「既知ボット（IAB リスト）の自動除外」「内部トラフィック除外」「データフィルタ」があり、**これらが有効か無効か、何を落としているかは未確認**。
- **「シンガポール帰属＝ボット」は近似であり、両方向に誤差がある。**
  - **非SG側に同じ指紋が残っている。** §4-5 のデバイス指紋の SQL の `WHERE country='Singapore'` を `WHERE country NOT IN ('Singapore','Japan')` に変えて実測すると: 米国 Linux/Chrome/Direct 11セッション（PV/セッション 1.00）、中国 Android Webview/Direct 10（1.00）、中国 Windows/Chrome/Direct 7（1.00）、中国 Linux/Chrome/Direct 3（1.00）。**この4群で 31 セッション = SG除外 1,294 の 2.4%**（非SG非日本の全セッションは 61 = 4.7%）。§5 の「SG除外」列はこれを含んだままである。
  - **SG帰属 3,608 の中に実在の来訪者が混じっている可能性**も否定していない（Android/Opera/Organic Search 1件など）。
- **日本帰属セッションが人間であることは検証していない。** §5-2 で「日本側に通常の変動幅を超える動きが無い」と書いたのは、量の観察であって人間性の検証ではない。
- **Search Console 側が無傷であることは実測していない。** §5-5 の記述は「別経路だから影響しないはず」という**推論**である。
- **`category/*` の2パスだけは実在ルートに対応しない**（`src/app/dictionary/kanji/` に該当ルートが無い）。404 を返しているかは HTTP で確かめていない。件数が2なので結論には影響しない。
- **原典が残っていない値が2つある。** 「3,608 中 3,188 が engaged」と「`session_start` 帰属で日本 1,187」は、`docs/` 全体を grep しても該当箇所が**0件**である。
  - **これらは cycle-302 由来ではない。** 3,608 は窓C（08-06 まで）でしか出ない値で、cycle-302 のエクスポート最新は `20260803`（`ga-context.md:9`）、窓Aのシンガポール帰属は **257 セッション**（実測）。cycle-302 は 3,608 に到達できない。**B-635 の本作業（08-08）の途中で `tmp/` に書かれ、消えた作業メモに由来する**と考えるのが妥当である。
  - 3,188 は本調査で内容を特定した: **SG かつ Macintosh/Chrome/Direct（3,375）かつセッション単位エンゲージ（3,375）の積集合ちょうど**（片側差 187 ずつ）。SG 全体のエンゲージ判定は 3,375 である。
  - **1,187 は再現できなかった。** 本調査では2通りの実装どちらでも**日本 1,185**（シンガポールは 612 / 615）。結論は変わらないが、1,187 という値は出ていない。
- **発生源（誰が・どこから）は特定していない。** §6 のとおり GA4 に IP/ASN が無いため。
- **`engaged_pv` は「ボットが混ざらない列」ではあるが「人間の需要に比例する列」ではない。** §5-4 のとおり捕捉率がセクションで 12.5%〜68.5% と 5.5 倍開くため、セクション横断の大小比較には使えない。この歪みの原因（面ごとの `scroll` / 滞在の出やすさの違いと推測）は**測っていない**。
- **除外の実装方法は未検討。** 本ドキュメントは「何が壊れているか」の切り分けまでで、対処（GA4 管理画面のフィルタか、`scripts/analytics-report.ts` 側のクエリ除外か、両方か）は選定していない。

---

## 8. 計器の現状（なぜ通り抜けたのか、どこは持ちこたえたのか）

### 8-1. `engaged_pv` は持ちこたえた。ただし「列が強い」からではない

`scripts/analytics-report.ts` は AP-P26（`docs/anti-patterns/planning.md:80`）を受けて、ボットへの歯止めを明示している:

```
:13   * 注意 (AP-P26): page_view の生カウントにはボット・プリフェッチ等が混ざる。
:14   * 人間の行動として解釈するときは engaged 列 (user_engagement を伴うセッション由来) を基準にすること。
:122      SELECT page_path, COUNT(*) AS pageviews, COUNTIF(engaged = '1') AS engaged_pv
:179    "(注: ... 人間の需要として解釈するときは engaged_pv とSearch Consoleのクリックを基準にすること)"
```

**実装（`:122`）は、このボットに対して完全に機能した。**

> **一方 `:14` の括弧書きの定義文は壊れている側を指している。** 「`user_engagement` を**伴うセッション由来**」は §0 の**セッション単位**の読みであり、その単位ではボットが 93.5% 通る。実装が `page_view` 単位だったので結果的に助かっただけで、**このコメントを読んで自分でクエリを書く人はセッション単位で数えにいく**。除外の実装を決めるときに、このコメントの定義文も同時に直すこと。

```sql
-- 窓C。engaged を「page_view 行」と「セッション単位」の2通りで数え分ける
WITH e AS (
  SELECT CONCAT(user_pseudo_id,'.',CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING)) AS sid,
    event_timestamp, geo.country AS country, event_name,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='session_engaged') AS engaged
  FROM `analytics_524708437.events_*` WHERE _TABLE_SUFFIX BETWEEN '20260710' AND '20260806'
), s AS (
  SELECT sid, ARRAY_AGG(country ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS country FROM e GROUP BY sid
), j AS ( SELECT e.*, s.country AS sess_country FROM e JOIN s USING (sid) )
SELECT
  COUNTIF(event_name='page_view') AS pv_all,
  COUNTIF(event_name='page_view' AND engaged='1') AS engaged_pv_all,
  COUNTIF(event_name='page_view' AND sess_country='Singapore') AS pv_sg,
  COUNTIF(event_name='page_view' AND sess_country='Singapore' AND engaged='1') AS engaged_pv_sg,
  COUNTIF(event_name='page_view' AND sess_country='Singapore' AND engaged IS NULL) AS pv_sg_engaged_null,
  COUNTIF(event_name='user_engagement' AND sess_country='Singapore') AS ue_sg,
  COUNTIF(event_name='user_engagement' AND sess_country='Singapore' AND engaged='1') AS ue_sg_engaged,
  COUNTIF(event_name='scroll' AND sess_country='Singapore') AS scroll_sg,
  COUNTIF(event_name='scroll' AND sess_country='Singapore' AND engaged='1') AS scroll_sg_engaged
FROM j
```

イベント別の全内訳は、上の `j` を `SELECT event_name, COUNT(*), COUNTIF(engaged='1') FROM j WHERE sess_country='Singapore' GROUP BY event_name` で出せる。

実測: `pv_all` 5,474 / `engaged_pv_all` **605** / `pv_sg` 3,609 / **`engaged_pv_sg` 0** / `pv_sg_engaged_null` 0（＝SG の `page_view` 行は**全件が `session_engaged='0'`**）/ `ue_sg` 3,424 / `ue_sg_engaged` 3,287。

**イベント別に `session_engaged` の付き方を測ると、こうなっている**（窓C・SG帰属）:

| event_name        |  件数 | `'1'` |
| ----------------- | ----: | ----: |
| `user_engagement` | 3,424 | 3,287 |
| `scroll`          | 2,115 | 1,966 |
| `level_end`       |     1 |     1 |
| `page_view`       | 3,609 | **0** |
| `first_visit`     | 3,609 | **0** |
| `session_start`   | 3,609 | **0** |

`session_engaged` は**イベント単位**に刻まれる。**`page_view` に `'1'` が付かず、後続の `user_engagement` / `scroll` には付く**——という分布が実測できた事実である。GA4 の既知の挙動（engagement が積算されてから `'1'` が立つ）に照らせば「`page_view` が積算前に発火するから」と説明できるが、**その因果自体は本調査では測っていない**。いずれにせよ集計上の帰結は変わらない:

- **`page_view` 行で数える `engaged_pv`** → ボットは**1件も通らない**。
- **`MAX()` でセッションに畳んだエンゲージ判定** → 後続イベントの `'1'` を拾うので、ボットが **93.5% 通る**（§5-3 のエンゲージメント率が壊れるのはこれ）。

> **したがって「`engaged` を捨てろ」という結論は誤りである。** 正しくは「**`page_view` 単位で使え、セッション単位で使うな**」。同じ `session_engaged` が、集計単位を変えるだけで 0% と 93.5% に割れる。

**ただし、これを「`engaged_pv` はボットに強い列だ」と一般化してはいけない。** 持ちこたえたのは、**このボットが1セッションにつき `page_view` を1発しか撃たないから**である（窓C・実測: SG 3,608 セッションのうち **3,601 がちょうど1PV**、2PV は4件、0PV は3件）。しかもこのボットは `scroll` を 2,115 件出し、**うち 1,966 件には `session_engaged='1'` が付いている**——engagement 自体は積算されている。**2発目以降の `page_view` を撃つクローラなら `engaged_pv` を素通りする。** §1-5 の Top20 と同じく、これは構造的な保証ではなく、この個体の性質である。

### 8-2. 国別の除外は本当に無い

```
$ grep -cn "" scripts/analytics-report.ts
186
$ grep -niE "country|geo|filter" scripts/analytics-report.ts
（出力なし）
```

定型レポートに**国や地域による除外は存在しない**。したがって「どこから来ているのか」を定型レポートで切り分けることはできない。

> **自戒**: 当初この検証は `grep -niE "country|geo|bot|filter"` で行い、「ボット除外の語が1つも無い＝歯止めが無い」と結論した。**二重に誤りだった**——(a) ASCII の `bot` しか探しておらず**日本語の「ボット」を取り逃した**（`:13`・`:179` に存在する）、(b) そもそも**語の有無は機能の有無ではない**。歯止めは `engaged_pv` という**列の形**で実装されていた。**日本語コメントのコードベースで ASCII 語だけを grep して「存在しない」と結論してはいけないし、grep で機能の有無を判定してもいけない。** さらに (c) 語を見つけた後も、**その語の定義文が正しいかまでは確かめていなかった**（→ §8-1 の `:14` の件）。

### 8-3. 「異常が見えなかった」わけではない

定型レポートには「日別PV」「チャネル別セッション」が含まれる。実測すると日別 PV は 8/4=100 → **8/5=433** → **8/6=3,135**、チャネル別は Direct 75.2%。**見れば異常として目に飛び込む。**

見えないのは「異常があること」ではなく「**その原因（どの国・どの指紋か）と、除外する手立て**」である。CLAUDE.md は「UX に影響しうる判断の前に必ず GA を見よ」と定めている。**規定どおり動いた PM は、異常には気づけるが、切り分ける道具を持っていない。** これが B-635 を P1 に上げた理由である。

---

## 参照

- 初出（**訂正対象・無改変で保存**）: `docs/cycles/cycle-302/review-log.md:133`（M-9・窓Aについては正しい）、`:1082`（窓Bの内訳）、`:1094`（全体への誤った一般化）
- 窓Aの定義: `docs/cycles/cycle-302/ga-context.md:6`（集計期間）・`:11`（セッション定義）・`:12`（総セッション数）
- 計器: `scripts/analytics-report.ts`（`:13-14`・`:112-124`・`:179`）、`.claude/skills/analyze-bigquery/SKILL.md`、`.claude/skills/analyze-bigquery/reference/ga4.md`
- 既存のアンチパターン: `docs/anti-patterns/planning.md:80`（AP-P26）
- セッション定義の慣行: `.claude/skills/analyze-bigquery/scripts/channel-ranking.sh:35`
- URL 空間の実数: `src/app/sitemap.ts`、`src/data/kanji-data.json`、`src/data/yoji-data.json`
- 再利用可能な技術知見の切り出し先: `docs/knowledge/ga4-bigquery.md`
- backlog: B-635
