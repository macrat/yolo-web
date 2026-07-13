# ADR002: 持ち帰れる札の記号化（character-personality 結果面・face-scoped）

- 状態: 実験中（open）——cycle-280 で出荷予定
- 起票日: 2026-07-13 ／ 出荷予定日: 2026-07-13（cycle-280。出荷は cycle-completion で実施するため、**実出荷日に合わせて必要なら本ディレクトリ先頭日付＝次回確認日を調整する**。本書は事前登録＝出荷前の起票である）
- 決定・仮説: **診断結果を「画像単体で店号（yolos.net）・品名・タイプ名が読める札」として保存／共有できるようにすれば、character-personality の save／share が 0 から立ち上がる。** 賭けの本体は `docs/site-concept.md` が「未検証の賭け」と明記する **『独自記号のシェア可能性』**——AI が与えた記号（札）を来訪者が自分のものとして持ち帰り、他者に見せることが実際に起きるか。フェーズ R（ADR001）が入れたのは札・印・共有の器（UI）であり、本 ADR はその中身（持ち帰れる実物＝札画像と、それを測る save／share 計測）を character-personality の**本人向け結果面（ResultCard）に閉じて**実在させる賭け。**face-scoped**（`docs/rebuild-plan.md` §1(d) の面単位インライン実験。ADR001 の「R 全体をサイト全面の SC 方向読みで読む」建てとは別建て——独立変数を面に閉じ、独自イベントの 0→非0 で読む）。
- 根拠:
  - 実測（`docs/cycles/cycle-280.md`・GA4 28日窓 2026-06-15〜07-12）: share イベントは全サイトで 2 件のみ・**character-personality からは 0 件**。save は**未実装**（イベント・保存ボタンともゼロ）。character-personality は直近28日クリックの 69.4% を占める最大の成長エンジンで、その結果面に「持ち帰れる記号」の実物が存在しない＝概念の約束と現実の最大の乖離。
  - `docs/site-concept.md`「共有できる記号」節（『独自記号のシェア可能性』を未検証の賭けと明記）。
  - `DESIGN.md` §4「札」（店号・品名・記号面・タイプ名・印の視覚言語）。
  - 外部仕様: Web Share API Level 2 のファイル共有は実装依存（"Limited availability"）ゆえ `navigator.canShare({files})` の**特徴検出が必須**、非対応時はダウンロード等へフォールバック（cycle-280.md 参考情報・[MDN Navigator.canShare()]／[caniuse web-share]）。
  - 実装設計の正典: `docs/cycles/cycle-280.md`（C-b／B-551）。

## 観測手段と評価窓 ／ 撤退基準

### 指標（すべて出荷日以降・character-personality に限定）

- **(1) save率 = save ÷ level_end**（content_id='quiz-character-personality'）。持ち帰れる実物が使われているか。
- **(2) share率（fuda）= share（surface='fuda'）÷ level_end**。札そのものの共有が起きているか（surface='text'／'invite' とは分けて読む）。
- **(3) 共有経由の新規流入**: `/play/character-personality/result/` への外部リファラ／direct 着地の**増分**（方向読みのみ・下記の誤帰属ガードを厳守）。

### 評価窓（両日を先に固定する）

- **読み始め = 2026-07-27**（出荷+2週）。
- **確定読み = 2026-08-24**（出荷+6週）。
- **両日を先に固定する理由**: `quiz_result_visual_v1`（A/B）が「読む予定を決めないまま出荷し、結果を読まれずに撤去された」轍（ADR001 経過記録・2026-07-12）を回避するため。読み始めは方向確認、撤退／継続の判断は確定読みで下す。

### 撤退基準

**確定読み（2026-08-24）で、save率・share率（fuda）がともに実質 0（発火が偶発水準）なら、「札を主アクションに据える」という設計判断を撤回し、再設計または格下げ（結果面の主動線から外す）する。**

「偶発水準」の目安（双方向ガード込み・下記の交絡を踏まえ機械的には決めない）:

| 指標                                               | 確定読み（2026-08-24）の値                                                 | 判定                                                                                                                        |
| -------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| save率 = save ÷ level_end                          | 実質 0（save 総数が 5 件未満、かつ率が 1% 未満＝自己操作・単発テストの域） | **撤退**: 「札を主アクションに据える」設計判断を撤回。ResultCard の主動線から札の保存／共有を格下げ、または記号設計を再検討 |
| save率                                             | 非 0（率が偶発を超え、継続的な複数ユーザ発火）                             | **継続**: C-b の磨き込み（タイプ名・カード設計の A/B 等）へ                                                                 |
| share率（fuda）= share(surface='fuda') ÷ level_end | 実質 0（同上の偶発水準）                                                   | 撤退側の材料（AI の与えた記号が「他者に見せる」まで至っていない）                                                           |
| share率（fuda）                                    | 非 0                                                                       | 継続（バイラルループの起点が立ち上がった兆候）                                                                              |

### GA4 を撤退基準に使うことの逸脱明記

ADR の観測規律（`docs/ADR/README.md`）では、数値の撤退基準を置けるのは Search Console（外部母集団）側であり、**GA4 は小 n・計測欠落を疑い単独の kill 根拠にしない**のが原則である。本件はこの原則からの**意図的な逸脱**であり、以下の理由で許容する: 本 ADR の判定は既存指標の削除ではなく、**新設イベント（save／fuda share）の 0→非0 の存在確認**であり、「札を主アクションに据える」という**設計判断の妥当性**を問うもの。母集団比較でなく「実物が使われているか否か」の存在判定ゆえ、GA4 の独自イベントで読むのが適切。ただし小 n の限界は残るため、偶発水準の閾値は幅を持たせ、双方向ガードを厳守する。

### 双方向ガード（上振れ・下振れとも因果を断定しない）

- **(i) ADR001（R 切替）との交絡**: 本 ADR の出荷は ADR001 のデザイン一斉切替の観測窓（読み始め 2026-07-27）と同時期に走る。character-personality の指標変動を札化単独の効果に帰属できない。
- **(ii) 札化された OG のリンクプレビュー CTR 独立変動**: タスク B で OG 画像（リンクプレビュー）も同じ札画像へ刷新済み。OG が第三者のタイムライン上でクリックされやすく／されにくくなること自体が、**save／share と独立に**指標(3)（共有経由の新規流入）を動かしうる。指標(3) は誤帰属しやすい——「札を保存・共有した人が増えた」のか「プレビューのクリック率が変わった」のかを分離できないため、方向読みにとどめる。
- **(iii) iOS の「保存」が共有シート経由になる問題**: iOS ではアンカー download 非対応環境が多く、「保存」ボタンが `navigator.share({files})`（method='web_share_files'）経由になる。ユーザの意図（保存）と発火イベント（save/web_share_files、あるいは共有シートでの実際の行き先）がずれうるため、save と fuda share の切り分けは iOS 分で曖昧になる。method 別内訳を必ず併読する。

## 次回確認時にやること（2026-07-27・出荷+2週＝読み始め）

**先に判定表（上記「撤退基準」表）を確認し**、下記 SQL を出荷日（20260713）以降で実行して指標(1)(2)(3)を埋める。読み始めは方向確認、撤退／継続の確定は 2026-08-24。

計測契約（cycle-280 実装の確定事実）:

- `level_end`: event_params に `content_id`（='quiz-character-personality'）・`content_type` を持つ。
- `save`（新設）: `content_id`・`content_type`・`method`（'web_share_files'|'download'）・`surface`（'fuda'）。
- `share`: 既存の `item_id` を温存しつつ `content_id`（=item_id と同値・dual-write）・`method`（'web_share'|'clipboard' 等）・`surface`（'fuda'|'invite'|'text'）を持つ。
- content_id 正典値 = `contentIdForQuiz('character-personality')` = `'quiz-character-personality'`。

### SQL-1: save率・share率（fuda）＝指標(1)(2)（実行可能・出荷日以降）

```sql
-- character-personality の level_end / save / share を出荷日以降で集計し、
-- save率・share率(fuda) を算出する。実行: SELECT のみ・読取専用。
--   npx tsx .claude/skills/analyze-bigquery/scripts/query.ts "<SQL>"
WITH base AS (
  SELECT
    event_name,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'content_id') AS content_id,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'method')     AS method,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'surface')    AS surface
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  -- 出荷日(20260713)以降。確定読み時は上限を 20260824 付近に固定して窓を閉じる。
  WHERE _TABLE_SUFFIX BETWEEN '20260713' AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
)
SELECT
  COUNTIF(event_name = 'level_end')                                       AS level_end,
  COUNTIF(event_name = 'save')                                            AS save_total,
  COUNTIF(event_name = 'save'  AND method  = 'download')                  AS save_download,
  COUNTIF(event_name = 'save'  AND method  = 'web_share_files')           AS save_web_share_files,
  COUNTIF(event_name = 'share' AND surface = 'fuda')                      AS share_fuda,
  COUNTIF(event_name = 'share' AND surface = 'invite')                    AS share_invite,
  COUNTIF(event_name = 'share' AND surface = 'text')                      AS share_text,
  ROUND(SAFE_DIVIDE(COUNTIF(event_name = 'save'),
                    COUNTIF(event_name = 'level_end')) * 100, 2)          AS save_rate_pct,      -- 指標(1)
  ROUND(SAFE_DIVIDE(COUNTIF(event_name = 'share' AND surface = 'fuda'),
                    COUNTIF(event_name = 'level_end')) * 100, 2)          AS share_fuda_rate_pct -- 指標(2)
FROM base
-- level_end / save / share すべて content_id を持つ(share は cycle-280 の dual-write)。
-- fuda/text/invite いずれも character-personality 結果面なら content_id は同値。
WHERE content_id = 'quiz-character-personality';
```

### SQL-2: 共有経由の新規流入＝指標(3)（方向読みのみ・誤帰属ガード必須）

```sql
-- /play/character-personality/result/ への外部リファラ / direct 着地を出荷日以降で
-- チャネル別に数える。※ 双方向ガード(ii): OG(リンクプレビュー)の札化が save/share と
-- 独立に着地を動かしうるため、これは方向読み専用。save/share の因果に帰属しない。
WITH pv AS (
  SELECT
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'page_location') AS loc,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'page_referrer') AS ref,
    traffic_source.source AS source,
    traffic_source.medium AS medium
  FROM `yolo-web-gcp.analytics_524708437.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260713' AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
    AND event_name = 'page_view'
)
SELECT
  CASE
    WHEN medium = 'referral'
      OR (ref IS NOT NULL AND NOT REGEXP_CONTAINS(ref, r'yolos\.net')) THEN 'external_referral'
    WHEN medium IN ('(none)') OR source = '(direct)' OR medium IS NULL  THEN 'direct'
    ELSE CONCAT(IFNULL(source, '(null)'), '/', IFNULL(medium, '(null)'))
  END      AS channel,
  COUNT(*) AS landings
FROM pv
WHERE REGEXP_CONTAINS(loc, r'/play/character-personality/result/')
GROUP BY channel
ORDER BY landings DESC;
```

## 経過記録

- 2026-07-13 起票（cycle-280・出荷前の事前登録）。

## 結果・学び

（クローズ時に記入。負けの記録は勝ちと同粒度で。撤退時は「札を主アクションに据える」設計判断の撤回理由と再設計方針を残す）

<!--
参照リンク（本文中の略記）:
[MDN Navigator.canShare()]: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/canShare
[caniuse web-share]: https://caniuse.com/web-share
-->
