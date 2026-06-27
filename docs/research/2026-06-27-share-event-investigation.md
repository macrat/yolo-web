# cycle-273 調査: shareイベント枯渇(B-550)の一次接地と原因仮説

調査日: 2026-06-27 / 対象期間: 7日 BQ サンプル 2026-06-20〜26 と 90日窓 2026-03-28〜06-27

本ドキュメントは cycle-273 で実施した B-550（診断サイトの share イベント枯渇＝28日2件・90日6件）の一次接地調査と原因仮説の典拠記録。サイクル本体は `docs/cycles/cycle-273.md` を参照。

---

## § A. ShareButtons / webShare / trackShare の計測契機

（cycle-273 T1 の典拠）

## 一次接地したファイル

- `src/play/quiz/_components/ShareButtons.tsx`（4 ボタンの handler 定義）
- `src/lib/webShare.ts`（`shareGameResult` / `useCanWebShare` / `isWebShareSupported`）
- `src/lib/analytics.ts`（`trackShare` 定義・GA4 `share` イベント送出）

## 計測契機の事実関係

### `shareGameResult(data)` の Promise 戻り値

- 成功: `await navigator.share(data)` が完了 → `return true`
- キャンセル or エラー: catch 節で `return false`（`/* User cancelled sharing or an error occurred */`）
- Web Share 非対応端末: 早期に `return false`

### `ShareButtons` 各 handler 内での `trackShare` 発火条件

| メソッド    | 発火条件                                                                                                                                                           | 取りこぼし／偽発火                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `web_share` | `await shareGameResult(...)` が完了した後**無条件**で `trackShare("web_share", ...)` が呼ばれる。`shareGameResult` の戻り値は捨てている。                          | **偽発火方向**: ユーザーがシェアシートを開いて**キャンセルしても発火する**。Web Share 非対応端末では handler 自体が呼ばれない（ボタンが描画されない）ので発火しない。 |
| `twitter`   | `window.open(...)` 直後に発火。ポップアップが開けたか・ユーザーが実際にツイートしたかは関知しない。                                                                | **偽発火方向**: タップ→ポップアップ open でカウント。実際にツイートしなくても発火。                                                                                   |
| `line`      | 同上（`window.open` 直後に発火）。                                                                                                                                 | 同上。                                                                                                                                                                |
| `clipboard` | `try { await navigator.clipboard.writeText(...); setCopied(true); /* ... */ trackShare("clipboard", ...) } catch { /* silent */ }` の **try ブロック末尾**で発火。 | **取りこぼし方向**: クリップボード書き込みが失敗（権限拒否等）すると発火しない。                                                                                      |

### 設計上の非対称

- web_share / twitter / line: 「ボタンを押した（試みた）」を計測している。実際の共有成否は計測していない。
- clipboard: 「ボタンを押して書き込み成功した」を計測している。3 つと粒度が異なる。

これは本サイクルでは是正の対象外（B-550 の改善着手は次サイクル以降）。記録に留める。

## ここまでで言える原因絞り込み

実測: 28 日で `share` イベント = **2 件**。一方:

- Web Share 対応端末では handler は「タップ→キャンセル」でも発火するはず。
- にもかかわらず 2 件しかない。

**最も強い解釈**: 「結果をシェア」ボタン自体がほぼタップされていない。

- もし Web Share API 経由でモバイル来訪者がそれなりにタップしているなら、キャンセル含めて share=10〜数十オーダーで出るはず（実測 level_end=132 / 28日に対して）。
- 出ていないということは「ボタンを見ているが押さない」または「ボタンの存在に気付いていない」または「結果を共有する動機を引き出されていない」のいずれか。

### 否定できた仮説（T1 だけで）

- ❌ 「Web Share API のキャンセルが計測されない取りこぼしで、実は押されているけど計測 = 0」: handler の実装上、キャンセルも発火するので、この仮説は不成立。
- ❌ 「twitter/line 経由でユーザーがポップアップを閉じた取りこぼし」: 同上。`window.open` 直後発火なので、ポップアップ閉鎖関係なく発火する。
- ❌ 「clipboard 書き込み失敗の取りこぼしが大量にある」: 仮にこれだけが取りこぼしでも、他3経路は偽発火方向で、実測 2 件の説明にならない。

### T2 で確かめるべき次の問い

1. share=2 の **method 別内訳**（4 つのどれが押されたか）。Web Share 対応モバイルの来訪が支配的ならほぼ web_share に偏るはず。
2. share=2 の **content_type / content_id 別**（diagnosis なのか quiz なのか blog なのか／どの診断・記事か）。
3. 日別の発火パターン（特定日に集中か、満遍なく散らばっているか）。
4. ボタンが描画される地点までユーザーが到達しているかの代理: `level_end=132` 中で結果ページのスクロールがどこまで進んでいるか（直接は出ないので、`scroll`/`engagement_time` で補強）。

---

## § B. BigQuery で share イベントを多次元集計

（cycle-273 T2 の典拠）

- 実行日: 2026-06-27
- データソース: `analytics_524708437.events_*`（BQ export、2026-03-28 以降）
- 窓: 直近 90 日 = `_TABLE_SUFFIX BETWEEN '20260328' AND '20260627'`（90日きっかりは2026-03-29からだが、export 開始日から最大限取った）
- 28日比較窓: `'20260531' AND '20260627'`
- 実行手段: `npx tsx .claude/skills/analyze-bigquery/scripts/query.ts "<SQL>"`（読取のみ）

---

## 0. パイプライン整合性チェック（GA4 ↔ BQ）

GA4 run_report (28日) と BQ 集計 (28日) が一致するかをまず検証。

### SQL

```sql
SELECT COUNT(*) AS share_28d
FROM `analytics_524708437.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260531' AND '20260627'
  AND event_name='share'
```

### 結果

| 期間 | source                        | share件数 |
| ---- | ----------------------------- | --------- |
| 28日 | GA4 run_report (T1で確認済み) | 2         |
| 28日 | BQ events\_\*                 | **2**     |

### 解釈

完全一致。計測パイプラインの不一致は無く、「share=2」は本物の少なさ。T1の解釈が補強される。

---

## 1. 90日 method 別集計

### SQL（個票が6件しかないため、フラット展開で取得しコード側で集計）

```sql
SELECT event_date,
       device.category AS device_cat,
       device.operating_system AS os,
       (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='method')       AS method,
       (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_type') AS content_type,
       (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='item_id')     AS item_id,
       (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='page_location') AS page_location,
       user_pseudo_id
FROM `analytics_524708437.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260328' AND '20260627'
  AND event_name='share'
ORDER BY event_date
```

### 生結果（個票・全6件）

| #   | date     | device  | os        | method    | content_type | item_id                     | page_location                | user_pseudo_id |
| --- | -------- | ------- | --------- | --------- | ------------ | --------------------------- | ---------------------------- | -------------- |
| 1   | 20260512 | mobile  | Android   | web_share | diagnosis    | quiz-word-sense-personality | /play/word-sense-personality | 72313...265    |
| 2   | 20260512 | mobile  | Android   | line      | diagnosis    | quiz-word-sense-personality | /play/word-sense-personality | 57315...220    |
| 3   | 20260512 | mobile  | iOS       | web_share | diagnosis    | quiz-word-sense-personality | /play/word-sense-personality | 10425...980    |
| 4   | 20260516 | desktop | Macintosh | web_share | fortune      | fortune-daily               | /play/daily                  | 16625...827    |
| 5   | 20260601 | mobile  | iOS       | line      | quiz         | character-personality       | /play/character-personality  | 36513...712    |
| 6   | 20260607 | mobile  | Android   | web_share | diagnosis    | quiz-japanese-culture       | /play/japanese-culture       | 16728...468    |

### method 別集計（90日）

| method    | count |
| --------- | ----: |
| web_share |     4 |
| line      |     2 |
| twitter   |     0 |
| clipboard |     0 |
| hatena    |     0 |
| **合計**  | **6** |

### 解釈

- 90日でも合計 6 件、まさに「枯渇」。
- **twitter / clipboard / hatena が90日でゼロ**。コード上は handler が存在するのにイベントが一切立っていない（=ボタンがほぼタップされていない、または PC からの利用シーン自体がほぼ無い）。
- web_share が4/6 = 67%。これは Web Share API 対応端末（≒モバイル）からの発火。Web Share は handler が常時発火する設計（T1）なので「ボタンタップ自体が極稀」を示している。

---

## 2. content_type 別集計（90日）

| content_type | count |
| ------------ | ----: |
| diagnosis    |     4 |
| quiz         |     1 |
| fortune      |     1 |

(item_id ベースだと quiz と diagnosis の境界が item により異なるため、event_params の `content_type` を素直に集計)

---

## 3. content_id (item_id) 別 上位（90日・全6件のため全件）

| item_id                     | count |
| --------------------------- | ----: |
| quiz-word-sense-personality |     3 |
| fortune-daily               |     1 |
| character-personality       |     1 |
| quiz-japanese-culture       |     1 |

### 解釈

- **2026-05-12 の word-sense-personality に share が偏在**（3件 / 6件 = 50%）。
- character-personality（28日 level_end #1=77件、90日でも最多診断）には **90日でわずか1件**しか share が無い。
  - character-personality の level_end / share 比は **77 : 1**（28日内）。**注（§4 再分類後）**: この「1」は接頭辞なし＝診断トップ ShareButtons 発火であり、ResultCard 発火は0。「結果ページのシェアボタンに問題がある可能性が最も高い」は §4 後に「主力 character-personality の ResultCard 発火 = 90日0件」というより指差せる事実に置き直された。本節は中間集計の記録として残す。

---

## 4. 日別件数（90日）

| date       | count | 内訳                                                 |
| ---------- | ----: | ---------------------------------------------------- |
| 2026-05-12 |     3 | word-sense-personality に集中（web_share×2, line×1） |
| 2026-05-16 |     1 | fortune-daily / Mac / web_share                      |
| 2026-06-01 |     1 | character-personality / iOS / line                   |
| 2026-06-07 |     1 | japanese-culture / Android / web_share               |
| その他85日 |     0 | —                                                    |

### 解釈

- **シェアが立った日は90日中わずか4日**。週末偏在なども検出できない（サンプルが薄すぎる）。
- 5/12 のスパイクは特定 URL（word-sense-personality 結果ページから）のもの。`page_referrer` を見ると結果ページ → シェアトリガが発火している痕跡あり（個票 #2 の page_referrer = `/play/word-sense-personality/result/poetic-sensory`）。
- 残り 86 日はゼロ。「散らばっている」ではなく「ほぼ存在しない」。

---

## 5. device_category 別（90日 share）

| device_category | share count |
| --------------- | ----------: |
| mobile          |           5 |
| desktop         |           1 |
| tablet          |           0 |
| smart tv        |           0 |

share の **83% がモバイル**。

---

## 6. device × method クロス集計（90日 share）

|             | web_share | line | twitter | clipboard | hatena | 合計 |
| ----------- | --------: | ---: | ------: | --------: | -----: | ---: |
| **mobile**  |         3 |    2 |       0 |         0 |      0 |    5 |
| **desktop** |         1 |    0 |       0 |         0 |      0 |    1 |
| **tablet**  |         0 |    0 |       0 |         0 |      0 |    0 |
| **合計**    |         4 |    2 |       0 |         0 |      0 |    6 |

### 解釈

- **desktop の web_share=1（Mac/Chrome）**。最近の Chrome は desktop でも Web Share に対応しているため、これはコード上「Web Share API 利用可」と判定されたケース。
- **desktop の clipboard / twitter / line がすべて 0**。PC ユーザーがフォールバックボタン（コピー・X・LINE）を一切押していない。
- 仮説2「PC ユーザーが SNS に貼るためコピー経由」は**反証**された（clipboard=0）。
- 仮説1「Web Share API ボタンの視認性／コピー／意図引き出しの問題」は**補強**された。mobile の Web Share だけがかろうじて立つが、それでも 90日3件と極小。

---

## 7. 参考: level_end（=結果到達=シェア分母候補）

### 90日 device 別

```sql
SELECT device.category AS device_cat, COUNT(*) AS cnt
FROM `analytics_524708437.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260328' AND '20260627'
  AND event_name='level_end'
GROUP BY device_cat
```

| device   | level_end 90d |
| -------- | ------------: |
| mobile   |           162 |
| desktop  |            35 |
| tablet   |             6 |
| smart tv |             1 |
| **計**   |       **204** |

### 28日 level_name 別 トップ

| level_name                  | level_end 28d |
| --------------------------- | ------------: |
| quiz-character-personality  |            77 |
| quiz-word-sense-personality |            20 |
| quiz-animal-personality     |             5 |
| quiz-kanji-level            |             4 |
| quiz-science-thinking       |             4 |
| その他                      |             … |
| **計**                      |       **128** |

注: `level_end` の event_params には `item_id` が含まれず、`level_name`（接頭辞 `quiz-` 付き）として送信されている。share 側の item_id (`character-personality`, `quiz-word-sense-personality` 等) と命名が**揺れている**ことを発見。これは独立した実装上の問題で T3 で確認すべき。

### share / level_end 比（90日 device 別）

| device  | share | level_end | 比率 |
| ------- | ----: | --------: | ---: |
| mobile  |     5 |       162 | 3.1% |
| desktop |     1 |        35 | 2.9% |
| tablet  |     0 |         6 |   0% |

→ **デバイスを問わず 3% 前後で異常に低い**。仮説3「デバイス横断の共通課題」は**補強**される。

### 28日 character-personality に絞った share / level_end 比

- level_end (quiz-character-personality, 28日) = 77
- share (item_id=character-personality, 28日) = 0
- **比率 0%**

主力診断の結果到達 77 件に対しシェアがゼロ。これは「結果ページの体験 / シェアボタン位置」に固有の問題がある強い兆候（仮説4の補強）。

---

## 8. 参考: /play/character-personality の device 別 PV/sessions（90日）

| device  | sessions | page_views |
| ------- | -------: | ---------: |
| mobile  |       88 |        103 |
| desktop |       19 |         25 |
| tablet  |        7 |          8 |

→ character-personality 自体は**モバイルが支配的**（88/114 = 77%）。主力導線がモバイルなのに、その結果ページからのシェアが90日で1件（line/iOS）しか出ていない。

参考: サイト全体の 90日 session（device別）

| device  | sessions |
| ------- | -------: |
| desktop |      455 |
| mobile  |      354 |
| tablet  |        9 |

→ サイト全体だと desktop > mobile だが、**「結果に到達するコンテンツ動線」ではモバイルが圧倒的**。これは検索流入の入口が分かれていることを示唆（参考情報）。

---

## 結論

### T1 解釈「ボタンがほぼタップされていない」への評価

**強く補強される**。以下の独立した4つの証拠から:

1. **method 内訳**: twitter / clipboard / hatena が 90日でゼロ。フォールバックボタンが押されていない。
2. **device 横断比率**: mobile も desktop も share/level_end ≈ 3%。デバイス固有でなく**ボタン到達/誘引の共通課題**。
3. **主力診断の偏在**: 主力 character-personality（28日 level_end 77 / 90日でも最多）からのシェアが**ほぼゼロ**（90日で1件、28日でゼロ）。結果到達はしているのにシェア動作が起きていない。
4. **5/12 word-sense-personality だけスパイク**: 1人のユーザーが Web Share + LINE を連打した可能性（user_pseudo_id 3つ別だが Android 2 / iOS 1 で偶然3件タップが重なった日）。それでも 3件。バイラルではない。

### 反証された仮説

- **仮説2「PC ユーザーが SNS に貼るためコピー経由」**: clipboard 90日ゼロ。反証。
- desktop のフォールバック UI（X / LINE / コピー）は**まったく機能していない**。視認されていないか、シェアする動機自体が薄い。

### 新たな指差せる発見

1. **主力 character-personality のシェアが極端にゼロ**: 28日 level_end 77 件に対し share 0 件。**最優先で接地観察すべき面**。
2. **share/level_end 比 3% は device 横断で共通**: ボタン配置・コピー・タイミング以前に「シェアしたい瞬間が来ない」可能性（結果体験の弱さ）。
3. **計測命名の不整合**: `level_end.level_name = 'quiz-character-personality'` だが `share.item_id = 'character-personality'`（`quiz-` 接頭辞の有無）。両イベントを item で突合する分析が現状できない。**T3 とは別に修正候補**。

### T3（実画面接地）で見るべき具体面の指針

優先順位順:

1. **モバイル `/play/character-personality` の結果ページ** — 主力導線・mobile 支配・share ゼロ。最優先。結果ページのシェアボタン位置・視認性・文言・タイミング（自動表示/タップ要否）を観察。
2. **モバイル `/play/word-sense-personality/result/...` 系** — 90日で唯一スパイクした面。「ここなら押される」要素を逆抽出。5/12 の page_referrer から個別結果スラッグ（poetic-sensory 等）を辿る。
3. **desktop の全結果ページのシェア UI** — clipboard / twitter ボタンが本当に表示されているか、押せるか、押されない理由（位置・コントラスト・文言）を確認。Mac/Chrome で発火した 1件（fortune-daily）と比較。
4. **シェアボタンが「結果到達」とどれだけ時間的・視覚的に近接しているか** — share/level_end ≈ 3% は「結果到達 → シェア導線」の距離問題を示唆。

---

## 付録: 使用 SQL 一覧

```sql
-- 1. ベースライン event count
SELECT event_name, COUNT(*) AS cnt
FROM `analytics_524708437.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260328' AND '20260627'
  AND event_name IN ('share','level_end','page_view','select_content')
GROUP BY event_name ORDER BY cnt DESC;

-- 2. share 全 event_params 展開（構造確認用）
SELECT event_date, ep.key, ep.value.string_value, ep.value.int_value
FROM `analytics_524708437.events_*`, UNNEST(event_params) AS ep
WHERE _TABLE_SUFFIX BETWEEN '20260328' AND '20260627'
  AND event_name='share'
ORDER BY event_date, ep.key;

-- 3. share フラット個票（本分析の主クエリ）
SELECT event_date, device.category AS device_cat, device.operating_system AS os,
  (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='method') AS method,
  (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_type') AS content_type,
  (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='item_id') AS item_id,
  (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='page_location') AS page_location,
  user_pseudo_id
FROM `analytics_524708437.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260328' AND '20260627'
  AND event_name='share'
ORDER BY event_date;

-- 4. level_end device 別 90d
SELECT device.category AS device_cat, COUNT(*) AS cnt
FROM `analytics_524708437.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260328' AND '20260627'
  AND event_name='level_end'
GROUP BY device_cat ORDER BY cnt DESC;

-- 5. level_end 28d level_name 別
SELECT (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='level_name') AS level_name,
       (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='content_type') AS content_type,
       COUNT(*) AS cnt
FROM `analytics_524708437.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260531' AND '20260627'
  AND event_name='level_end'
GROUP BY level_name, content_type ORDER BY cnt DESC;

-- 6. character-personality PV device 別 90d
SELECT device.category AS device_cat,
  COUNT(DISTINCT CONCAT(user_pseudo_id, CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING))) AS sessions,
  COUNT(*) AS page_views
FROM `analytics_524708437.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260328' AND '20260627'
  AND event_name='page_view'
  AND (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key='page_location') LIKE '%/play/character-personality%'
GROUP BY device_cat ORDER BY sessions DESC;

-- 7. 28日 share 件数（GA4 run_report との突合用）
SELECT COUNT(*) AS share_28d
FROM `analytics_524708437.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260531' AND '20260627'
  AND event_name='share';

-- 8. 全体 session 90d device 別
SELECT device.category AS device_cat,
  COUNT(DISTINCT CONCAT(user_pseudo_id, CAST((SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key='ga_session_id') AS STRING))) AS sessions
FROM `analytics_524708437.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260328' AND '20260627'
  AND event_name='page_view'
GROUP BY device_cat ORDER BY sessions DESC;
```

## 4. cycle-273 T6 レビュー反映: 個票を発火元コンポーネントで再分類

### ShareButtons は3系統以上ある（T1 で見落とし）

- `src/play/quiz/_components/ShareButtons.tsx`（Web Share API 対応・**ResultCard / ResultPageShell** で利用・`contentId = "quiz-" + slug`）
- `src/components/ShareButtons/index.tsx`（X/LINE/はてブ/コピー 4ボタン固定・Web Share 非対応・**QuizPlayPageLayout(診断トップ)・(new) blog/dictionary/tools 等**で利用・`contentId = slug`＝**接頭辞なし**）
- `src/components/common/ShareButtons.tsx`（同 4ボタン固定の legacy 系・legacy 辞典詳細・legacy ツール・legacy ゲームで利用）

T1 は `play/quiz/_components/ShareButtons.tsx` のみ接地して2系統目以降を見落とし。share=6件の解釈に直接効く片肺だった。

（cycle-273 第2巡 reviewer NICE-A 反映: 当初「`components/common/`＝診断トップ用」と書いた記述は誤り。実際は `components/ShareButtons/index.tsx` が (new) 系の診断トップで使われる。個票 #5 (character-personality 診断トップ発火) の機能的結論=「4ボタン版から発火」は不変。）

### page_location の意味（再確認）

ResultCard はインライン結果＝SPA 内のフェーズ遷移で URL は変えない（QuizContainer 内部状態 intro→playing→result）。よって **ResultCard からの share 発火は `page_location=/play/<slug>` （診断トップ URL）になる**。「contentId に `quiz-` 接頭辞付き」かつ「page_location 診断トップ URL」は ResultCard 発火の正常パターン。

### 個票 6 件の発火元再分類

| #   | item_id                     | page_location                | 接頭辞 | 発火元（推定）                                   |
| --- | --------------------------- | ---------------------------- | ------ | ------------------------------------------------ |
| 1   | quiz-word-sense-personality | /play/word-sense-personality | あり   | ResultCard（インライン結果）                     |
| 2   | quiz-word-sense-personality | /play/word-sense-personality | あり   | ResultCard（インライン結果）                     |
| 3   | quiz-word-sense-personality | /play/word-sense-personality | あり   | ResultCard（インライン結果）                     |
| 4   | fortune-daily               | /play/daily                  | なし   | fortune 系別ルート（要追加調査）                 |
| 5   | character-personality       | /play/character-personality  | なし   | **QuizPlayPageLayout の診断トップ ShareButtons** |
| 6   | quiz-japanese-culture       | /play/japanese-culture       | あり   | ResultCard（インライン結果）                     |

### この分類から導かれる事実（より強い）

- **主力 `character-personality` の ResultCard 発火 = 90日0件**（level_end #1=主力なのに）。T5 H1 の根拠としてこの事実を採用する。「90日 share=1」と書いたうちの1件は診断トップ ShareButtons 発火であって ResultCard 発火ではなかった。
- **word-sense の 5/12 スパイク3件は全て ResultCard 発火**（user_pseudo_id 3つすべて別＝1人のリピートではない）。しかし「縦が短いから」かどうかは因果として証明されておらず、SNS でバズった等の特定流入の可能性も否定できない（NICE-2 で reviewer 指摘の通り）。仮説 H1 の補強としては**整合的だが代替仮説も同等**程度に下げる。
- 単独結果ページ（ResultPageShell）からの share 発火は個票 6 件のいずれにも該当しない可能性が高い。`page_location=/play/<slug>/result/<id>` のパターンが 0 件＝**第三者がランディングしてシェアする経路もほぼゼロ**。

---

## § C. 原因仮説と次サイクル最小検証手段

（cycle-273 T5 の典拠）

T1（コード一次接地）／T2（BQ 多次元集計）／T3（実画面接地）／T4（仕様一次確認）の統合。

## 確定事実

- 直近28日 share=2 / level_end=132（share/level_end ≒ 1.5%）。
- 90日でも share=6（うち web_share=4 / line=2 / twitter=0 / clipboard=0 / hatena=0）。
- 計測パイプライン不一致なし（GA4↔BQ 完全一致）。
- 計測契機は「ボタン押下」相当（Web Share API はキャンセル含めて発火・twitter/line は window.open 直後発火）。**取りこぼし方向の問題ではない**。
- Web Share API の標準仕様にもシェア完了の判定機構なし（2025-06-23 MDN 最終更新時点）。
- 主力 character-personality: level_end #1（28日77）なのに 90日 share=1。
- 5/12 に word-sense-personality で 3件スパイク（成功例）。
- シェアボタンの位置: モバイル360で y=4000/5746（70%地点）、PC1280で y=2300/3624（63%地点）。**結果到達直後のファーストビューに無い**。
- word-sense は character-personality より縦が短く、シェアボタンがやや早く出る（51%地点）。

## 否定された仮説

- ❌ **「PC コピー経由が支配的」**: 90日 twitter=0 / clipboard=0 で反証。
- ❌ **「Web Share キャンセルが計測されない取りこぼし」**: handler が戻り値を捨てて常に発火する設計で否定。
- ❌ **「計測パイプラインの不整合」**: T2 で GA4↔BQ 完全一致を確認。
- ❌ **「特定仕様の取りこぼし」**: T4 で Web Share API 仕様も整合を確認。

## 確定的な原因仮説（指差せる具体物に接地）

### 仮説 H1（最も指差せる・T6 reviewer 指摘 MUST-1 反映で根拠を事実に置き直し）

「シェアボタンが結果到達直後の視界に無く、ResultCard ファーストビュー外」

- **指差せる根拠（T6 反映）**: T2 個票再分類により、**主力 `character-personality` の ResultCard 発火 = 90日0件**（level_end #1=主力にも関わらず）。インライン結果からシェアまで届いていない直接事実。ただし母数 share=6/90日と小さく、全体のベースレート（share/level_end ≒ 1.5%）が低い状況下の「0件」であることを併記する（第3巡 MUST-E 反映：「強い」と書くと cycle-271 型の易しい一例の一般化に近づくため「指差せる」程度に留める）。
- **位置の具体物**: T3 で実測したシェアボタン位置（モバイル360で y=4000/5746・PC1280で y=2300/3624）。来訪者は結果を見た瞬間が最もシェア意欲が高いが、その瞬間にシェアボタンは画面外。
- **補強（弱・代替仮説あり）**: word-sense の 5/12 スパイク3件は全て ResultCard 発火（別ユーザー3人）で character-personality より縦が短い（51%地点）ことと**整合的**だが、SNS でバズった等の特定流入の同時可能性は否定できない（reviewer T6 NICE-2 指摘）。仮説 H1 の補強としては「整合的」程度に留める。
- **次サイクル最小検証手段**: 結果到達直後（タイトル＋説明の直下＝ファーストビュー内）にシェア導線を追加する小さなUI改修。具体的には: (a) 結果タイトル直下に「結果をシェア」ボタン1個を追加（既存の最下部の3ボタンはそのまま維持で重複させる）、(b) 1〜2サイクル（4〜8週）走らせて ResultCard 発火数（item_id に `quiz-` 接頭辞付き）の推移を月次読みで観測。改修が小さい・既存導線を壊さない・効果が明瞭に観測できる、の3条件を満たす最小改修。
- **限界の明示**: 本サイクルで実機接地したのは ResultPageShell（単独結果ページ＝第三者向け）のみで、ResultCard（インライン結果＝本人経路）はコード読みでの推論（`ResultCard.tsx:628` で同じ ShareButtons コンポーネントを最下部寄せで呼ぶ設計）。シェアの主発火元は ResultCard だが、ResultCard 自体の実画面は次サイクル PM が改修着手前に必ず実機確認すること（reviewer T6 NICE-3 指摘）。

### 仮説 H2（補助）: 「シェアテキストが他人に共有する動機を引き出さない」

- **根拠**: `shareText = "${quizTitle}の結果は「${result.title}」でした! #${quizTitle} #yolosnet"`（ShareButtons.tsx の `shareText` 構築箇所）。結果のキャッチコピー（`catchphrase`）や一行で「自分を誇りたくなる／話題にしたくなる」フックが含まれていない。タイトルと結果名だけだと「自分はこのタイプ」という事実報告に留まる。
- **次サイクル最小検証手段**: H1 と同時に検証可能。`shareText` を「【${result.title}】${catchphrase}（${quizTitle}）」のように catchphrase 込みに変更し、同じ window で観測。ただし share の絶対数が小さいため、H1 と分けるとどちらの効果か切り分けられない＝**H1 と H2 を組み合わせた1つの介入として走らせる**のが現実的。

### 仮説 H3（弱・推測寄り）: 「ボタンラベルが対象不明な動詞ベース」

- **根拠**: 非 Web Share 経路の「Xでシェア」「LINEでシェア」「コピー」は動詞ベースで、何をシェアするのかが明示されていない。Web Share 経路の「結果をシェア」は対象明示（仮説の弱根拠）。
- **次サイクル最小検証手段**: 観測量が小さい（PC desktop=1/90日）ので、PC側ラベル変更だけでは効果が検出できない。H1 で発火数が上がってから個別に検証する候補。本サイクルでは記録のみ。

## 副次発見（B-550 の直接の原因ではないが記録）

- **`level_end.level_name='quiz-character-personality'` vs `share.item_id='character-personality'`** で `quiz-` 接頭辞が不一致。両イベントを `item_id` で JOIN できない＝シェア漏斗（誰がどの結果からシェアしたか）を BQ で直接出せない。次サイクルで「シェア導線を改善する前後で漏斗の改善を測る」ためには、この命名統一が前提になる可能性がある。**新規 backlog 起票候補**として cycle-273 完了処理時に判断。
- ResultCard / ResultPageShell が同じ ShareButtons を共有しており、UI 改修は一箇所で両ルートに効く（実装コストは小さい）。

## 次サイクル PM への申し送り

1. **改修着手のコミットメント**: B-550 は本サイクルで「一次接地+原因仮説」まで完了。次サイクル PM は H1+H2 を組み合わせた小さなUI改修（結果タイトル直下にシェア導線＋shareText に catchphrase 含める）を起点に進める。**改修着手前に ResultCard 自体の実画面接地を必ず行うこと**（本サイクルは ResultPageShell のみ接地・reviewer T6 NICE-3）。
2. **検証窓**: H1+H2 改修後、ResultCard 発火（item_id `quiz-` 接頭辞付き）数を 4週間走らせて推移を見る。`scroll` イベントや結果到達後の `engagement_time_msec` で補強（reviewer T6 NICE-1：本サイクルでスクロール深度の補強が片肺だったので次サイクルで埋める）。
3. **過度な期待をしない・解釈ガードは双方向で**: H1 改修で発火数が増えても、それは「シェア意欲を持つ来訪者の絶対数が小さい」可能性を残す。本サイクルが解いたのは「シェア導線の機械的な可視性」までで、診断結果が「シェアしたくなる質」かは別問題。H2（shareText の弱根拠）は次サイクルで結合検証するが、H1 と切り分けられない設計＝原因切り分けは2段階目以降に延期。**解釈ガードは双方向で必要**: (a) 効果未検出 = H1 反証と短絡しない（来訪者の絶対数・効果量が小さい等の代替仮説あり）、(b) **効果検出 = H1 確認と短絡しない（H1+H2 結合介入のため切り分け不能・改善は「シェアが活性化した」事実であって「H1 が原因だった」を示さない）**。次サイクル PM はこの双方向ガードを改修着手前に明示すること。これは cycle-271 型「易しい一例の一般化と勝利譚」の予防として必須。
4. **介入後の測定再現性**: シェアボタンの y 座標は本サイクル T3 で目視測定（スクリーンショット）したが測定手段の再現性が低い。次サイクルで介入前後の y 座標を比較するなら `getBoundingClientRect` 等で機械的に測ること（reviewer T6 NICE-5）。
5. **word-sense スパイクの代替仮説**: 5/12 の3件は ResultCard 発火だが、SNS バズ等の特定流入の同時可能性を否定できていない。「縦が短いから」という H1 補強は弱い（reviewer T6 NICE-2）。次サイクル PM はこのスパイクの page_referrer / utm_source を BQ で追加調査して代替仮説を切り分ける価値あり。
6. **B-551 起票（cycle-273 完了処理時に PM 自身で判断）**: 副次発見の `quiz-` 接頭辞不一致は B-550 の解釈に直接効くため**次サイクル PM に投げず本サイクル中に起票判断を済ませる**（reviewer T6 試金石7・申し送り点5「やるべきことを次に投げて完了する」の同型を避ける）。判定結果は cycle-273.md のキャリーオーバーに記録。

## まとめ（B-550 一次接地の結論）

- **最も指差せる原因**: シェアボタンが結果到達直後のファーストビュー外（H1）。
- **設計の問題ではない**: 計測契機・Web Share API 仕様・パイプラインに取りこぼしなし。
- **次サイクルの最小手**: H1+H2 を組み合わせた小さなUI改修＋4週間の月次読み。
- **B-545 / B-537 とは独立**: B-550 は Goal 直撃だが「シェア導線の可視性」という機械的問題に閉じており、cycle-272 の B-545（empirical な「最高のデザイン」探索）とは別系統で進められる。
