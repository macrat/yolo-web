# ADR002: 持ち帰れる札の記号化（character-personality 結果面・face-scoped）

- 状態: **失効（expired）——2026-07-14 撤回。賭けが論理的に破綻しており有効でない（下記「失効理由」）。** cycle-280 で機能（札画像・save/share 計測）は出荷済みだが、それを正当化していた本 ADR の賭けは無効。観測（07-27／08-24）は行わない（破綻した賭けの観測は結果がどう出ても使い道がない＝ADR README §観測の規律／`quiz_result_visual_v1` の轍）。
- **何によって失効したか**: 外部の観測や別 ADR ではなく、**PM 自身の論理批判**により、この賭けが (a) 既知の事実（結果は読まれていない）と矛盾する前提に立ち、(b) 反証不能に設計され、(c) 主指標がトートロジー近似で「共有したい欲求」を測っていない、と判明したため。詳細は下記「失効理由」および `docs/cycles/cycle-280.md` の事故記録（6度目）。
- 起票日: 2026-07-13 ／ 出荷予定日: 2026-07-13（cycle-280。出荷は cycle-completion で実施するため、**実出荷日に合わせて必要なら本ディレクトリ先頭日付＝次回確認日を調整する**。本書は事前登録＝出荷前の起票である）
- 決定・仮説: **診断結果を「画像単体で店号（yolos.net）・品名・タイプ名が読める札」として保存／共有できるようにすれば、character-personality の save／share が 0 から立ち上がる。** 賭けの本体は `docs/site-concept.md` が「未検証の賭け」と明記する **『独自記号のシェア可能性』**——AI が与えた記号（札）を来訪者が自分のものとして持ち帰り、他者に見せることが実際に起きるか。フェーズ R（ADR001）が入れたのは札・印・共有の器（UI）であり、本 ADR はその中身（持ち帰れる実物＝札画像と、それを測る save／share 計測）を character-personality の**本人向け結果面（ResultCard）に閉じて**実在させる賭け。**face-scoped**（`docs/rebuild-plan.md` §1(d) の面単位インライン実験。ADR001 の「R 全体をサイト全面の SC 方向読みで読む」建てとは別建て——独立変数を面に閉じ、独自イベントの 0→非0 で読む）。
- 根拠:
  - 実測（`docs/cycles/cycle-280.md`・GA4 28日窓 2026-06-15〜07-12）: share イベントは全サイトで 2 件のみ・**character-personality からは 0 件**。save は**未実装**（イベント・保存ボタンともゼロ）。character-personality は直近28日クリックの 69.4% を占める最大の成長エンジンで、その結果面に「持ち帰れる記号」の実物が存在しない＝概念の約束と現実の最大の乖離。
  - `docs/site-concept.md`「共有できる記号」節（『独自記号のシェア可能性』を未検証の賭けと明記）。
  - `DESIGN.md` §4「札」（店号・品名・記号面・タイプ名・印の視覚言語）。
  - 外部仕様: Web Share API Level 2 のファイル共有は実装依存（"Limited availability"）ゆえ `navigator.canShare({files})` の**特徴検出が必須**、非対応時はダウンロード等へフォールバック（cycle-280.md 参考情報・[MDN Navigator.canShare()]／[caniuse web-share]）。
  - 実装設計の正典: `docs/cycles/cycle-280.md`（C-b／B-551）。

## 失効理由（2026-07-14・PM の全責任における撤回）

この賭けは論理的に成立していない。義務の源は constitution（Goal・Rule 4）と CLAUDE.md（決定原則）であり、以下はわたし自身の論理分析による判断である。

1. **主指標がトートロジー近似**: save は「ボタンが無かったから」0 だった。計測器（ボタン＋イベント）を新設した以上「0→非0」はほぼ構造的に保証され、数タップでも非0になる。これは仮説の主張「人が共有したいか」を検証しない——測っているのは「新しいボタンが押せる状態になったか」である。
2. **因果の向きが逆（都合のいい非・原因への介入）**: 「share=0 → 動線が無いから」と置いたが、確立知見（cycle-134/136/137/142・cycle-273）は「share=0 の原因は結果が見せたくなる価値に達していない／読まれていない」。より確からしい既知原因を排除せず、都合のいい機械的原因に介入した。
3. **前提が既知の事実と矛盾**: 成功には「人が結果を見せたいと思う」ことが要るが、cycle-278 T1 の実測で結果表示後の滞在は中央値10〜20秒＝ほぼ読まれていない。「読んでいないものは共有されない」。成功条件の前提が上流で絶たれている。
4. **撤退基準がヌルを成果物に誤帰属しループを再生産**: 「率が0なら『札を主アクションに据える』設計判断を撤回・再設計」とした。だが 0 のとき疑うべきは需要不在・上流（未読）であって札のデザインではない。失敗しても自分（成果物）を指し直す＝機械的すり替えのループを永続させる構造。
5. **反証不能（負けようのない賭け）**: 「第一の成果は指標に依存せず成立」と書き、ヌルは交絡（ADR001・OGP・iOS・小n）で先回りして言い訳できるようにした。どの結果でも仮説が反証されない＝実験でも賭けでもない。
6. **命題とのずれ**: site-concept の本命題は「独自の記号が『共有できる記号』に育つか」。指標は「ボタンが押されたか」で、代理として弱すぎる（非0でも「記号が共有に値するものへ育った」ことは言えない）。
7. **統計的に解釈不能**: 月100〜200セッション規模で「0からの立ち上がり」は一桁計数、好奇心タップとノイズから区別できない。指標(3)は多重交絡。

→ この賭けは cycle-273 が「最初から間違っているのが火を見るより明らか」として撤回した賭けと構造まで同一（結果面のシェアを機械的問題にすり替える6度目の反復）。**観測せず失効させる。** 出荷済みの save/share イベントはコードに残る（将来、価値の問い＝B-545 に正面から取り組む有効な賭けが立ったときの計測基盤として使いうる）が、本 ADR の賭けは無効。

> 以下「観測手段／評価窓／撤退基準」以降は、**破綻した賭けが何であったかの記録**として残す（実行しない）。指標・SQL・評価窓は無効。

## 観測手段と評価窓 ／ 撤退基準（【無効】破綻した賭けの記録として保存）

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
- **(iv) 「送る側」と「受け取る側」を取り違えない／札は需要を作らない**: 本賭けが直接動かせるのは **送る側の摩擦**だけである——「URL か余白ごとのスクショしかない」状態を、持ち帰れる一枚の札と明快なボタンに変えて**見せやすさ**を上げた。指標(1)(2)（surface='fuda' の save/share）は、この**送る側の行動（ボタンが押されたか）そのもの**を測る。一方、OG リンクプレビュー（受け取る側の CTR）は指標(3)にしか効かず、ボタン押下を駆動しない（(ii)）——この2つを混同して「札化＝シェア増」と読まないこと。より根本的には、**札は「見せたい」という需要そのものを作れない**。したがって確定読みで指標(1)(2)が実質0なら、それは「札の出来が悪い」ではなく「**そもそも診断結果を他者に見せたい需要が薄い**」＝ site-concept が『未検証の賭け』とする共有ループ仮説が弱い、と読むのが第一候補（札は既存の需要の障壁を下げるだけで、需要の有無を試す実験である）。札のデザイン改善で挽回できる問題と、需要不在の問題を、確定読みで取り違えないこと。

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
- 2026-07-14 **失効（観測せず撤回）**。cycle-280 完了後の点検（オーナーの問いが引き金・判断は PM の全責任）で、賭けが論理的に破綻していると判明。上記「失効理由」7点。expired へ移動。

## 結果・学び

- **負けの学び（勝ちと同粒度で）**: 「share=0 を、持ち帰れる成果物と保存/共有ボタンと計測で埋める」という発想は、share=0 の原因（結果体験の価値不足・未読）に触れない機械的すり替えだった。記録（cycle-273 §176/178）が「装飾A/Bでもシェアボタンの位置でも計測の動作確認でもない・もう一度やったら6度目の同じ怠慢」と名指ししていた反復を、kickoff で過去記録を読まずに（AP-WF12・知見未参照）犯した。
- **論理の学び**: 「新設イベントが0から立ち上がるか」は、その機能を新設した以上ほぼ自明に非0になりうるため、欲求・価値の検証にならない。賭けを立てるときは「どの観測結果なら仮説が反証されるか」を先に問い、反証不能・自己言及的な撤退基準（失敗を成果物の責に帰す）を排除する。
- **本丸は開いたまま**: B-545（結果体験を最高の価値にする）は cycle-268 から開き、cycle-273 で「唯一の問い」と確認され、cycle-279 でデザインの皮の移行をもって「完了」と記録されたが、価値の中身は未着手。次に賭けを立てるなら、機械的動線・計測・装飾ではなく、結果体験そのものの価値（読むに値するか・そもそも読まれているか）に正面から向かう。

<!--
参照リンク（本文中の略記）:
[MDN Navigator.canShare()]: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/canShare
[caniuse web-share]: https://caniuse.com/web-share
-->
