# B-613 設問単位の計装 設計書（cycle-301）

- 作成日: 2026-07-30 / 改訂: 2026-07-30（レビュー指摘 Blocker 1・Major 5・Minor 11 の全対応）
- 対象: `src/play/quiz/_components/QuizContainer.tsx` / `src/lib/analytics.ts` / `docs/sql/quiz-question-dropoff.sql`（新規）
- 実 SQL: [`docs/sql/quiz-question-dropoff.sql`](../../sql/quiz-question-dropoff.sql)（本設計書と対で読む。**4 SECTION すべてを実行して検証済み**＝§4。改訂後に再実行し合成データ **51 assertion 全 PASS**）
- 起点となった問題: [cycle-300/observation.md §3・§3-1・§7](../cycle-300/observation.md)
- 前提として読む: [cycle-301/index.md §E](./index.md)（**B-620＝二重発火の是正は既に実装・コミット済み**。本設計書は B-620 後の世界を前提にする）

---

## 0. 改訂履歴（何を指摘され、何をどう変えたか）

| #       | 指摘                                                                                                                                                              | 対応                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Blocker | 出荷境界の「計装なしクライアント」が設問1の離脱率と全設問の `survival_pct` を系統的に歪める。SQL ヘッダは `<FROM>` に出荷日を推奨していて自分のヘッダの論理と矛盾 | (1) `<FROM>` の推奨を**出荷日の翌日**に変更し「出荷日を含めるな」を実測値付きで明記。(2) **`release` による run 単位フィルタ**を SECTION 1 に実装（SECTION 2 は既存系列と突合するため全 run を保持し、計装済み列を別に出す）。(3) SECTION 2 に `runs_no_answer_instrumented`・`runs_uninstrumented_release`・`runs_no_answer_by_release`（release 別内訳）を追加。(4) C8 の誤った診断文を「release で弁別する」に書き換え。(5) C10 に「`dropoff_pct(q=1)` を読む前に汚染が0であることを確認」を追加。(6) §6「builder は触らない」の一文を改訂（誰が直すのかを明示）。合成データ S10 で「除外しなければ q1 の離脱が 10.7pt 偽に上振れる」ことを assertion 化 |
| M-1     | B-620（二重発火の是正）を前提にしていない。出荷直後に偽になる記述が5箇所                                                                                          | §5-2 を「回帰観測手段」に読み替え・SQL SECTION 2 の `runs_with_end` 注記を**時点付き**に・SQL SECTION 3 の `runs_with_gap` の帰属先を「修正が不完全」に・C5 を「B-620 の変更分を除いて同一」に・§3 案 H に「段差は B-620 が同サイクルで作る＝§5-6 に記録」を追記。§6 に AP-WF07（`QuizContainer.tsx` を B-613 C2 と B-614 S1 が共に触る＝**直列**）を明記                                                                                                                                                                                                                                                                                                   |
| M-2     | `bounce_pct` の副作用が抜けている（engagement より影響が大きい）                                                                                                  | §5-1 に `bounce_pct` を追加（実測: 「はじめる」を押したのに `engaged!='1'` の quiz セッション **31件**・サイト全体 688 セッションで **36.5%→32.0%＝最大 4.5pt**）。注記の宛先に `ab-value-metrics.sql` の `bounce_pct` と GA4 UI/MCP の `bounceRate`/`engagementRate`/`eventCount` を追加。`scripts/analytics-report.ts` の `engaged_pv` が影響を受けない理由（イベント別刻印 vs セッション MAX）も明記                                                                                                                                                                                                                                                     |
| M-3     | 85.2% は「副作用が小さくない根拠」にならない。「大きさは事前に確定できない」も誤り                                                                                | 85.2% の役割を「**配分**が根本的に変わる（イベント別に分離集計する技法が影響を受ける）」に限定。段差の大きさは**上下限を自分で測って**書いた（影響セッション 33/294・下限 0・仮定別上限 +1.4〜+7.9秒）                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| M-4     | 「事前登録指標であるエンゲージ時間」は事実でない（ADR001 に engagement/bounce は0件）                                                                             | ADR001 を grep して0件を確認し、「ADR001 の事前登録指標ではないが `ab-value-metrics.sql` が価値指標の SSoT として持つ指標」に修正。ADR001 経過記録への注意喚起の追記は残す                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| M-5     | 出荷後の計装検証が追跡されていない                                                                                                                                | **B-622**（`docs/backlog.md`・期日=B-613 出荷+2日・合格条件 C7〜C11）を §5-3・§7 で参照。ADR001「次回確認時にやること」への1行追記が必要である旨を D1 の作業として明記                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| m-1     | `ord` タイブレークの説明が誤り（`run_no` は `COUNTIF(level_start)` の累積なので `question_answered`/`level_end` の相対順序は無関係）                              | SQL ヘッダと §4-3 を訂正。発火点を分岐前に置く理由を「**両 type で確実に1回発火させるため**」に変更。C4 も差し替え。`ord` が実際に守るケース（`level_start` の同時刻衝突）を **S8** として合成データに追加（穴の側も回帰記録）                                                                                                                                                                                                                                                                                                                                                                                                                              |
| m-2     | SECTION 4 の assertion が主要出力列を通っていない（AP-WF09: 達成していない網羅性の主張）                                                                          | `dropoff_pct` / `survival_pct` / `dropoff_excess_pt` / `verdict`（CASE 分岐順序）/ release フィルタを通す assertion を追加。23 → **51 assertion**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| m-3     | `at_risk` の定義がヘッダと実装で食い違う                                                                                                                          | ヘッダと §4-3 の定義文を実装（`has_start OR answered_max>=1`＝orphan run を含む）に合わせ、`runs_with_start` と一致しないことを明記                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| m-4     | C10 の「`survival_pct` が単調非増加」は構造上必ず成立し情報を持たない                                                                                             | 落として、**`dropoff_excess_pt`（そのコンテンツの中央値からの乖離）**を SECTION 1 に新設し「段差の位置を読む」に置き換えた                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| m-5     | `min_question_number <> 1` を FAIL にするのは低 n で偽アラーム                                                                                                    | SECTION 3 の verdict を **WARN に降格**（`qn<1` の FAIL とは重大度が違う）。CASE 順序で FAIL が WARN に隠れないことを合成データ（qnull）で assertion 化                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| m-6     | SECTION 3 の `expected` 表（15行のハードコード）に機械強制が無い                                                                                                  | §2-7 に **T8**（`registry.ts` と SQL の表を突合する単体テスト）を追加し、SQL のコメントからも参照                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| m-7     | 内部参照が解決しない（§5-2 が「下記 §5-3」と書くが §5-3 は別の話）                                                                                                | 「**B-620 として起票済み・修正も完了**」に実体で書き直した                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| m-8     | `docs/knowledge/` を参照していない（AP-P06）                                                                                                                      | `docs/knowledge/2026-07-12-research-and-verification-techniques.md` の2知見（エンゲージ秒はセッション合計／モバイルは最終ビーコンが届かず「即離脱」と「計測欠落」を区別できない）を §5-1 と `runs_no_answer_observed` の解釈に反映。SQL ヘッダにも参照を入れた                                                                                                                                                                                                                                                                                                                                                                                              |
| m-9     | 量の見積りが直近の実勢より低い                                                                                                                                    | §2-6 に注記。実測: 窓平均 22.3 starts/日 に対し **07-22〜07-29 は 28.4/日**・末日 38/37。中央推定は同スケールで **約287件/日**（末日水準なら約380件/日）。上限判定には影響しない                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| m-10    | SECTION 1 は `totals` を INNER JOIN するので `question_answered` が皆無のコンテンツが行ごと消える                                                                 | SQL ヘッダ「恒久的な読み方の注意 (a)」に明記（SECTION 2 で実在を確認する）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| m-11    | §2-7 T1 の assertion の書き方 literal 指定は AP-WF03 に寄る                                                                                                       | 検証内容（5個ちょうど・禁止キーの不在）だけを述べ、書き方は builder に委ねた                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

**改訂で SQL を再実行した結果**（§4 に詳述）: 合成データ **51 assertion 全 PASS**／実データ（窓 20260713-20260728）で SECTION 1・2・3 が構文・型ともエラーなく実行され、SECTION 2 の再構成が既知値（`level_start` 311・`level_end` 224＝221 run + 二重発火3）と**改訂後も一致**。

---

## 1. 要件（何が読めれば成功か）

cycle-300 で確定したのは「完走率 85.3%→72.0% の低下は**設問途中の離脱**である」ことまでで、**どの設問で止まっているかは読めない**。`level_start`/`level_end` の2イベントしかなく設問インデックスの次元が無い。設問遷移で URL も変わらない（`QuizContainer` の state 遷移）ため `page_view` でも代替できない。

本計装の成功条件は次の4つ。

- **R1**: 任意の期間窓について、コンテンツ別・設問番号別に「その設問を答える機会まで来た人数」と「実際に答えた人数」と「そこで落ちた割合」が **BigQuery のクエリだけで**出る。
- **R2**: **GA4 管理画面での操作（カスタムディメンション登録など）を一切必要としない。** 管理画面の操作は AdSense と同型の「PM のツール外の外部行為」であり（[cycle-301/index.md](./index.md) 補足・cycle-300 §5）、それを前提にすると読めないまま終わる。
- **R3**: 既存の `level_start`/`level_end` 系列と既存クエリ（`docs/sql/ab-value-metrics.sql`・cycle-300 の再現クエリ）を**壊さない**。ADR001 の +4週観測が既存系列の連続性に依存している。
- **R4**: 読み取り結果が**リトライ・二重発火・`level_start` 欠落**によって歪まない。これは仮定ではなく実測上の要求である（§2-4・§4-2）。

**要件と内部文書が衝突した場合は要件を優先する**（AP-P34: 内部文書は改訂可能な仮説であって岩盤ではない）。本設計では実際の衝突は1件だけ見つかり、§2-3 で解消した。

---

## 2. 設計

### 2-1. イベント名: 新規カスタムイベント `question_answered` を1種だけ追加

| 項目                 | 決定                                                   |
| -------------------- | ------------------------------------------------------ |
| イベント名           | `question_answered`                                    |
| 既存イベントへの変更 | **なし**（`level_start`/`level_end` は一字も触らない） |

**根拠**:

- **名前の衝突なし（実測確認）**: `question_answered` は現行コードベースに1件も無く（`grep -rn "question_answered" src/ docs/ scripts/` → 0件・2026-07-30）、GA4 側の既存イベント名11種（`page_view`・`session_start`・`first_visit`・`user_engagement`・`level_start`・`level_end`・`scroll`・`tile_first_interaction`・`share`・`click`・`save`／窓 20260713-20260729 実測）とも衝突しない。
- **イベント名の種類数に上限がない**（web ストリーム。仕様値・[GA4 収集上限](https://support.google.com/analytics/answer/9267744)。index.md で一次確認済み）ので、新規1種の追加は上限リスクを持たない。
- **既存イベントへの相乗りを却下した理由**: `level_start`/`level_end` に `question_number` を足すと、既存の完走率クエリ（`COUNTIF(event_name='level_end')`）の意味が変わりうる。R3 に反する。
- **`level_up` の流用を却下した理由**: GA4 の推奨イベント `level_up` は「レベルが上がった」という達成の意味を持ち、「設問に答えた」とは意味が違う。推奨イベント名に別の意味を負わせると、将来 GA4 UI の標準レポートで誤って解釈される。カスタムイベント名で意味を明示するほうが安い。

### 2-2. 発火点: `QuizContainer.handleAnswer` の1箇所

**決定**: `handleAnswer` の中、`quiz.meta.type === "personality"` の分岐に**入る前**に1回だけ送る。`handleNext` には置かない。

**実コードで確認した根拠（`QuizContainer.tsx:92-123` / `QuestionCard.tsx:53-67`・2026-07-30 精読）**:

`handleAnswer` が両フローで呼ばれることは、PM の前提を鵜呑みにせず実コードで確かめた。**結論は「両フローで呼ばれる」で正しい**が、理由は「共通経路だから」という漠然としたものではない。正確には次の構造による。

- `QuestionCard.handleSelect` は選択肢クリック時に **`quizType` に関係なく `onAnswer(choiceId)` を呼ぶ**（`QuestionCard.tsx:58`）。`quizType === "knowledge"` の分岐（`setAnswered(true)`）は `onAnswer` の**呼び出しの後**にあり、呼ぶか否かを分岐させていない。
- `QuizContainer.handleAnswer` の前半（`question` の取得・`newAnswer` の構築・`setAnswers`）は **type 分岐の外**にあり全 type で実行される。分岐しているのは「回答後に進むか否か」だけ（personality は即遷移・knowledge は `handleNext` 待ち）。

したがって `handleAnswer` の**先頭**に置けば、personality 12本と knowledge 3本の**両方**で「設問に回答した」瞬間に1回だけ発火する。

**`handleNext` に置かない理由**: `handleNext` は knowledge のみの「次へ」であり、personality では呼ばれない。ここに置くと personality が丸ごと落ちる。また `handleNext` は「回答」ではなく「解説を読み終えた」の意味なので、`question_answered` の意味と合わない。

**分岐前に置く理由（改訂: 根拠を訂正した）**: 理由は「**両 type（personality / knowledge）で確実に1回発火させるため**」である。`handleAnswer` の前半は type 分岐の外にあり全 type で実行されるので、分岐前に置けば片方の type が落ちる実装ミスが構造的に起きない。

当初の設計はこれを「読み取りクエリのタイブレーク `ord` が `question_answered` → `level_end` の送出順を前提にしているから」と説明していたが、**これは誤りだった**。`run_no` は `COUNTIF(event_name='level_start')` の累積なので、`question_answered` と `level_end` の相対順序は run 分割の結果を変えない（最終問で両者の `event_timestamp` が同値になっても同じ run に入る）。実際に SECTION 4 の `ord` を入れ替えて実行し、全 assertion が PASS することを確認した。`ord` が実際に効くのは **`level_start` が他イベントと同一 timestamp で衝突する場合だけ**である（§4-3・SQL ヘッダ・合成データ S8）。発火点を分岐前に置く判断自体は妥当なので変えないが、根拠を差し替える——**「正しい実装を不合格にしうる基準」（C4）を、誤った根拠のまま合格条件に残さない。**

**「設問表示」イベントを入れない理由**: personality では回答→次設問表示が同一 React コミットで完結する（`setCurrentIndex` の直後に `key={question.id}` で `QuestionCard` が再マウント）ため、`question_displayed(n+1)` は `question_answered(n)` と情報が完全に重複し、イベント量を倍にして得るものがない。

**ただし knowledge では重複しない（限界として記録）**: knowledge は回答後に解説を挟み「次へ」を押して初めて次設問が現れる。よって `question_answered` だけでは「解説画面で離脱した」と「次設問を見たが答えなかった」を区別できない。**この限界を受け入れる**。理由は (a) 本計装の目的は cycle-300 が特定した personality の離脱局在であり、(b) knowledge 3本の n は窓 20260713-20260728 実測で `quiz-kanji-level` 3・`quiz-yoji-level` 2・`quiz-kotowaza-level` 1 開始しかなく、イベントを増やしても読めるようにはならない。**読み取りクエリの指標名を「見た（saw）」ではなく「その設問を答える機会まで来た（at_risk）」にすることで、測っていないものを測ったと書かない**（§4-3 で先行設計からの変更点として明記）。

### 2-3. パラメータ: 5個

| param             | 型     | 値                                                   | 名前の長さ | 値の最大長                            |
| ----------------- | ------ | ---------------------------------------------------- | ---------- | ------------------------------------- |
| `content_id`      | string | `quiz-<slug>`（`contentIdForQuiz` の戻り値）         | 10         | 29（`quiz-unexpected-compatibility`） |
| `content_type`    | string | `"diagnosis"` \| `"quiz"`                            | 12         | 9                                     |
| `question_number` | number | **1 起点**の設問番号（`currentIndex + 1`）           | 15         | —                                     |
| `question_total`  | number | `quiz.questions.length`                              | 14         | —                                     |
| `question_id`     | string | `quiz.questions[currentIndex].id`（`"q1"`〜`"q20"`） | 11         | 3                                     |

**GA4 上限との照合（仕様値・[GA4 収集上限](https://support.google.com/analytics/answer/9267744)。index.md で一次確認済み）**: 1イベントあたりパラメータ **25個**（本イベントは自前5個＋gtag 自動付与）・param 名 **40字**（最長 15字）・値 **100字**（最長 29字）。いずれも大きく下回る。

**`release` は自動で乗る（実測確認）**: `release` は `gtag('config', ...)` で全イベントに自動付与される設計で（`docs/archive/visitor-value-measurement.md` 論点4・`scripts/generate-release-id.ts`）、**本番で現に機能している**——窓 20260726-20260729 に `release` = `033b2dd-20260727`(726件)・`2f53c57-20260726`(197件) 等が実測された。よって `question_answered` にも自動で乗り、**出荷境界を release_id で切れる**。設計側で何もしなくてよい。

**この道具を、副作用の説明だけでなく主クエリの汚染除去に使う（改訂で追加）**: 当初の設計は `release` を §5-1 の「エンゲージ時間の段差の切り分け」にしか使っておらず、**汚染が実際に効く SECTION 1 には適用していなかった**。出荷直後は旧バンドル（キャッシュ）を掴んだ来訪者が `level_start` を送るが `question_answered` を送らないため、そのまま集計すると `at_risk(q=1)` の分母に `answered=0` として入り、**設問1の `dropoff_pct` を偽に押し上げ、全設問の `survival_pct` を押し下げる**。実測（release 別 `level_start`・`quiz-%` 限定・2026-07-30 自分で再実行）:

| 日付     | 当日リリース            | 旧バンドル                                       | 旧の比率  |
| -------- | ----------------------- | ------------------------------------------------ | --------- |
| 20260726 | `2f53c57-20260726` 22件 | `9608ddd-20260725` 9件                           | **29.0%** |
| 20260727 | `033b2dd-20260727` 19件 | `fd088fa-20260726` 12件 + `a841f58-20260726` 3件 | **44.1%** |

したがって SQL は (a) `<FROM>` を**出荷日の翌日**にし、(b) それでも残る旧バンドルを **run 単位の `release` フィルタ**で落とす（`instrumented_releases` = 窓内で `question_answered` を1件でも送った release。run 内の全イベントがその集合に属するときだけ SECTION 1 に入れる）。日付比較にしないのは、**同一日に複数リリースが出る**ため（実測: 20260724 だけで5 release・16日で45 release）出荷コミット前の同日ビルドを弁別できないから。詳細は SQL ヘッダ「出荷境界の汚染除去」。

**`level_name` を送らない理由**: `level_start`/`level_end` は `level_name` と `content_id` に**同じ値**を入れている（`analytics.ts:130-133`）。GA4 推奨イベントの慣習に合わせた歴史的な二重化で、情報量はゼロ。新規イベントに引き継がない。

**`ab_variant`/`experiment_id` を送らない理由と、それが生む衝突の解消**: `docs/archive/visitor-value-measurement.md` 論点4 は「`ab_variant`/`experiment_id` は A/B の効果に関わる**主要イベントに限定**して付与し、全イベント無差別付与はしない（結果を見ていないセッションに arm を載せても主 KPI のノイズになる）」としている。**この方針は採用する**（archive＝もはや利用しない文書だが、この判断は今も来訪者価値の測定精度に効くため採る）。

ただしこれは **R1 と衝突しうる**——B-612（同時期対照）で「arm 別の離脱局在」を読みたくなったとき、`question_answered` に arm が無ければ読めない。**衝突は解消できる**: `ab_variant` は同一セッションの `level_end` に必ず乗り、`question_answered` は同じ `sid`（`user_pseudo_id`+`ga_session_id`）を共有する。よって `ab-value-metrics.sql` が既に使っている
`(ARRAY_AGG(ab_variant IGNORE NULLS ORDER BY event_timestamp LIMIT 1))[SAFE_OFFSET(0)]`
でセッション代表 arm を作り、`sid` で `question_answered` に join すれば arm 別に読める。**イベントに arm を載せずに arm 別に読める**ので、文書の方針と R1 は両立する。→ B-612 の設計時にこの経路を使うこと。

**B-612 への制約（重要）**: 将来の A/B は **両 arm で `question_answered` を発火させなければならない**。片 arm だけに計装を入れると §5 の engagement 副作用が arm 間の系統差になり、主 KPI（結果到達後のエンゲージ時間）が計装の差で汚染される。

**選んだ選択肢・回答内容・結果を送らない（プライバシー）**: `choiceId`・`answers`・判定結果（`result.id`）は**一切送らない**。理由は憲法ルール2（来訪者を危険にさらさない）と `analytics.ts:264-265` に既に明文化されている規律（「Tile input/output content is never sent」）の一貫適用。診断の回答列は「その人がどう答えたか」という個人的な内容であり、離脱局在を読むという目的に不要。目的に不要な個人的内容は送らない。`question_id` は「どの設問か」であって「どう答えたか」ではないので、この線を越えない。

**`question_id` は今日は冗長だが入れる**: 実測（`registry.ts` を tsx 走査・2026-07-30）で全15本の設問 id は `q1`..`qN` の連番であり、今日は `question_id === "q" + question_number` が恒真＝情報量ゼロ。それでも入れるのは、**将来 設問を挿入・並べ替えたときに `question_number` が黙って別の設問を指すようになるのを検出・復元するため**。位置に固定した系列は内容の変更で静かに壊れるが、内容に紐づく id が併記されていれば後から突合できる。param 上限には余裕があり（25 中 5 使用）コストはゼロ。

### 2-4. 起点規約: 1 起点

**決定**: `question_number` は **1 起点**。`question_number = 1` が1問目。不変条件 **1 ≤ question_number ≤ question_total**。

**語彙で固定する**: `number` は 1 起点・`index` は 0 起点。`currentIndex` は 0 起点のまま（React state の意味を変えない）。**`currentIndex + 1` の変換は送信直前の1箇所（`handleAnswer` 内の呼び出し引数）だけで行う**。この変換をヘルパや `analytics.ts` の中に散らすと、どちらの起点で来た値なのかが呼び出し側から見えなくなる。

**なぜ 1 起点か**:

- 来訪者が画面で見ている数字と一致する。`ProgressBar` は `current={currentIndex + 1}` を受け（`QuizContainer.tsx:186`）「1 / 12」と表示している。読み取り結果の「7問目で落ちている」が、来訪者が見た「7 / 12」とそのまま対応する。
- BigQuery 側で `GENERATE_ARRAY(1, question_total)` と素直に噛み合う。0 起点だと `total` との関係が `0..total-1` になり、`number > total` という単純な不変条件検査が書けない。

**0 起点混入は「気をつける」ではなく機械で検出する**（AP-P01/AP-I01: 形式的な充足確認を実体の代わりにしない。裏返せば、機械が検査できることは機械に検査させる）。二重の防壁を置く。

1. **テスト側**（§2-7 のテスト T3・T6）: 1問目の回答が `question_number: 1` を送ることと、全設問で `1 ≤ n ≤ total` が成り立つことを assert する。0 起点にすると T3 が落ちる。
2. **クエリ側**（`quiz-question-dropoff.sql` SECTION 3）: `violation_number_lt_1`（`qn < 1`）を **FAIL** として判定する。`min_question_number <> 1` は **WARN**（改訂で降格）——低 n（15本中12本は16日で run 1〜15 しかない）＋モバイルの離脱時ビーコン欠落で q1 の1件が落ちるだけでも成立し、`qn < 1` の「確実な 0 起点混入」とは重大度が違う。FAIL にすると存在しないバグを追わせる。さらに `runs_with_gap`（`answered_distinct <> answered_max`）が、0 起点混入で生じる番号のずれを別経路で捕まえる（12問完走なら distinct=12 だが max=11 になり不一致になる）。
3. **表そのものの機械強制**（§2-7 の T8・改訂で追加）: SECTION 3 の期待値表（15行の `questionCount` ハードコード）は、手で直すことが唯一の担保という状態にしない。`registry.ts` と SQL の表を突合する単体テストを1本置く。**本項の原則（機械が検査できることは機械に検査させる）の適用が SQL 側のハードコードに及んでいなかった**のを是正する。

### 2-5. 適用範囲: 診断12本＋知識クイズ3本＝15本すべて

**実数は自分で数えた（実装値・`src/play/quiz/registry.ts` を `npx tsx` で走査・2026-07-30）**。PM から当初「全10診断＋知識クイズ」と伝えられたが誤りで、実体は**15本**。`meta.questionCount` と `questions.length` は**全15本で一致**（不一致0）。設問 id は全本 `q1`..`qN` の連番・重複なし・最大3文字。選択肢は全本4択。

| slug                      | type        | questionCount | 設問 id |
| ------------------------- | ----------- | ------------: | ------- |
| kanji-level               | knowledge   |            10 | q1..q10 |
| kotowaza-level            | knowledge   |            10 | q1..q10 |
| yoji-level                | knowledge   |            10 | q1..q10 |
| impossible-advice         | personality |             7 | q1..q7  |
| traditional-color         | personality |             8 | q1..q8  |
| yoji-personality          | personality |             8 | q1..q8  |
| contrarian-fortune        | personality |             8 | q1..q8  |
| unexpected-compatibility  | personality |             8 | q1..q8  |
| character-fortune         | personality |             8 | q1..q8  |
| music-personality         | personality |            10 | q1..q10 |
| animal-personality        | personality |            10 | q1..q10 |
| word-sense-personality    | personality |            10 | q1..q10 |
| **character-personality** | personality |        **12** | q1..q12 |
| japanese-culture          | personality |            18 | q1..q18 |
| science-thinking          | personality |            20 | q1..q20 |

合計設問数 **157**（実装値）。`QuizContainer` は全15本の共通経路なので、`handleAnswer` の1箇所の変更で全面に効く。

この表は `quiz-question-dropoff.sql` SECTION 3 の `expected` テーブルにそのまま埋め込んであり、**送られてきた `question_total` が実装の `questionCount` と一致しないと FAIL になる**。クイズを追加・改訂したら SQL 側の表も更新する（SQL のコメントに明記済み）。

### 2-6. 量: 約 +225件/日（サイト全体で約2倍・BigQuery 日次上限の約 0.05%）

すべて窓 **20260713-20260728（16日）**の実測から導いた（**推定値**。生成元は下記の実測値）。

| 値                                                               | ラベル | 生成元                                             |
| ---------------------------------------------------------------- | ------ | -------------------------------------------------- |
| サイト全体のイベント数 3,421件／16日 = **213.8件/日**            | 実測値 | `events_*` の全行 COUNT                            |
| `quiz-%` の `level_start` **356件**・`level_end` **256件**／16日 | 実測値 | `content_id LIKE 'quiz-%'` で集計                  |
| `question_answered` 下限 **187.9件/日**                          | 推定値 | Σ(ends × questionCount)/16。完走者は全問答えたはず |
| `question_answered` 中央 **224.8件/日**                          | 推定値 | 上に加え、離脱者は平均で半分答えたと仮定           |
| `question_answered` 上限 **261.8件/日**                          | 推定値 | Σ(starts × questionCount)/16。全員が完走した場合   |

- **サイト全体の増加倍率**: (213.8 + 224.8) / 213.8 = **約 2.05倍**（推定値）。上限ケースでも (213.8+261.8)/213.8 = 2.22倍。
- **BigQuery 日次エクスポート上限との比**: 標準プロパティの上限は **1,000,000 イベント/日**（仕様値・[BigQuery Export 上限](https://support.google.com/analytics/answer/9823238) を 2026-07-30 に一次確認。超過が続くと日次エクスポートが**停止**し過去分も再処理されない）。増加分 224.8/1,000,000 = **0.022%**、変更後のサイト合計 438.6/1,000,000 = **0.044%**（上限ケースで 475.6 = **0.048%**）。**3桁以上の余裕があり、上限リスクはない。**
- **B-614 との相互作用**: B-614 が完走率を上げれば量は上限側（262件/日）へ寄る。上限ケースでも 0.048% なので影響しない。

**「クイズセッションのイベント数が約7倍」という言い方は不正確なので訂正する**（先行設計からの訂正）。正しくは:

- **クイズのファネルイベント**は、完走した `character-personality` の1 run で `level_start`+`level_end` の **2件 → 14件（7.0倍）**（実装値からの算術）。
- **セッション全体のイベント数**は **6.22件 → 約18.2件（約2.9倍）**（実測値 6.22 + 推定値）。窓 20260713-20260728 で `level_start`(quiz-%) を持つセッション294件の平均イベント数は **6.22件**（`page_view`・`session_start`・`user_engagement`・`scroll` 等を含む・実測値）。

「7倍」は分母がファネルイベントに限った数字で、セッションのイベント数ではない。§5 の engagement 副作用を論じるときは**セッション全体（2.9倍）**が効く分母なので、混同すると副作用の大きさを誤る。

**上の推定は直近の実勢より低い（改訂で追加した注記）**: 224.8件/日は窓 20260713-20260728 の平均（`quiz-%` の `level_start` 356件/16日 = **22.3 starts/日**）から出したが、開始数は増えている。実測（`level_start`・`quiz-%`・日別・2026-07-30 自分で再実行）:

| 期間              | 平均 starts/日 | 末日                     |
| ----------------- | -------------: | ------------------------ |
| 20260713-20260728 |           22.3 | —                        |
| 20260722-20260729 |       **28.4** | 38（07-28）/ 37（07-29） |

同じ比率でスケールすると `question_answered` は中央 **約287件/日**（下限 240・上限 334）、末日水準（37-38 starts/日）なら **約380件/日**（上限 441）になる（いずれも推定値）。**上限判定（1,000,000件/日）には影響しない**（最も多いケースでも 0.09% 未満）が、後続が 224.8 を期待値として使うとずれるので記録する。

### 2-7. テスト

`.claude/rules/testing.md` の規約（`__tests__/<name>.test.ts(x)`・Vitest + jsdom + @testing-library/react）に従う。既存 `src/lib/__tests__/analytics.test.ts` と `src/play/quiz/_components/__tests__/QuizContainer.*.test.tsx` の作法をそのまま踏襲する（`analytics.test.ts` は `window.gtag` を `vi.fn()` に差し替え、`toHaveBeenCalledWith("event", "<name>", {...})` で params 全体を突合する形式）。

| ID  | 置き場                                            | 検証内容                                                                                                                                                                                                                                                                                                                    |
| --- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | `src/lib/__tests__/analytics.test.ts`             | `question_answered` が送る params が**自前5個ちょうど**であること（余分なキーが1つでもあれば落ちる形にする）と、`level_name`・`ab_variant`・`experiment_id`・`choice_id` の**キーが存在しない**こと。書き方（完全一致 assert とするか個別にキーの不在を見るか）は既存 `analytics.test.ts` の流儀に合わせて builder が決める |
| T2  | 同上                                              | `window.gtag` 未定義でも例外を投げず no-op（既存 track* と同じ保証）                                                                                                                                                                                                                                                        |
| T3  | `QuizContainer.questionAnswered.test.tsx`（新規） | **personality**: 1問目の選択肢クリックで `question_number: 1`・`question_id: "q1"` が送られる（**1 起点の回帰テスト**。0 起点にすると落ちる）                                                                                                                                                                               |
| T4  | 同上                                              | **personality**: 全 N 問に順に回答すると `question_answered` が N 回・番号は 1..N の昇順で送られ、`level_end` は**最終問の後に1回だけ**送られる                                                                                                                                                                             |
| T5  | 同上                                              | **knowledge**: 選択肢クリックの時点で `question_answered` が発火し、その後の「次へ」クリックで**追加の `question_answered` が発火しない**（`handleNext` に置く実装を落とすテスト）                                                                                                                                          |
| T6  | 同上                                              | **不変条件**: 発火した全イベントについて `1 ≤ question_number ≤ question_total` かつ `question_total === quiz.questions.length` かつ `question_id === quiz.questions[question_number-1].id`                                                                                                                                 |
| T7  | 同上                                              | **リトライ**: 結果画面の「もう一度挑戦」→「はじめる」の後、`level_start` が再度発火し `question_number` が 1 に戻る（run 分割の前提が実装側で成立していることの確認）                                                                                                                                                       |

| T8 | 新規（例: `src/play/quiz/__tests__/questionDropoffSql.test.ts`） | **SQL の期待値表と実装の突合**（改訂で追加・m-6）: `docs/sql/quiz-question-dropoff.sql` SECTION 3 の `expected` テーブルに並ぶ `content_id`/`questionCount` の組が、`registry.ts` の全クイズと**双方向に一致**する（SQL 側の欠落・余剰・数値相違をすべて落とす）。置き場・パース方法は builder が決める |

T5 と T3 が、発火点と起点という2つの決定を機械で守らせる要のテスト。T8 は、クイズを追加・改訂したときに **SQL 側の表の更新漏れ**が静かに残るのを防ぐ（更新漏れは SECTION 3 で `FAIL: total が実装 questionCount と不一致` として出るが、それは**出荷後にデータが出てから**しか分からない）。

---

## 3. 検討したが採らなかった案とその理由

| 案                                                                       | 却下理由                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. `level_up` を流用する**                                             | GA4 推奨イベント `level_up` は「レベルが上がった」という達成の意味。「設問に答えた」に別の意味を負わせると GA4 UI の標準レポートで誤解される。カスタムイベント名で意味を明示するほうが安い                                                                                                                                                                                                                                                                                                                                                                           |
| **B. `level_start`/`level_end` に `question_number` を足して相乗りする** | 既存の完走率クエリ（`COUNTIF(event_name='level_end')`）の意味が変わりうる。ADR001 +4週の観測が既存系列の連続性に依存している（R3 違反）                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **C. 「設問表示」イベント（`question_displayed`）も併せて入れる**        | personality では回答→次設問表示が同一 React コミットで完結し `question_answered(n)` と情報が完全重複。イベント量を倍にして得るものがない。knowledge では重複しないが n が読める規模になく（3本合計で開始6件/16日・実測値）、増やしても読めない                                                                                                                                                                                                                                                                                                                       |
| **D. 設問ごとに URL を変える（`?q=3` 等）して `page_view` で読む**       | 来訪者に無関係な履歴エントリを12個積み、戻るボタンの挙動を壊す。来訪者価値を計測の都合で下げる（CLAUDE.md 意思決定原則に反する）。かつ PV が12倍に膨らんで既存の PV 系指標（`pages_per_session`）を破壊する（R3 違反）                                                                                                                                                                                                                                                                                                                                               |
| **E. `choiceId`（選んだ選択肢）も送って設問の難所を分析する**            | プライバシー。回答内容は目的（離脱局在）に不要。憲法ルール2 と `analytics.ts` の既存規律（tile の input/output は送らない）の一貫適用                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **F. GA4 のカスタムディメンションに登録して探索レポートで読む**          | 管理画面操作は PM のツール外の外部行為（R2 違反）。BigQuery の `event_params` は**登録なしでもエクスポートされる**（`docs/archive/visitor-value-measurement.md` 論点4 が `docs/research/2026-06-visitor-metrics-baseline.md` A-3 で一次確認済み・index.md でも GA4 BigQuery スキーマ文書で再確認）。よって登録は不要。後付け登録も可能（過去データの `event_params` は残る）                                                                                                                                                                                         |
| **G. セッション単位で最大設問番号を集計する（run に分割しない）**        | 実測で13.0%のセッション×クイズ組が2回以上開始しており（§4-2）、2回目の q1 が1回目の離脱を打ち消して**離脱が過小に見える**（R4 違反）                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **H. `handleAnswer` に二重発火ガードを入れて計装をきれいにする**         | 二重発火は実在するが（§4-2）、ガードの追加は `level_end` の発火条件を変えるため既存系列に段差を作る（R3 違反）。かつ「回答の取りこぼし」という**来訪者に返る結果そのものの不具合**の可能性があり、計装タスクに混ぜて独立レビューなしに触るべきではない。→ **B-613 のスコープからは外したまま、別タスク B-620 として同一サイクル内で是正済み**（`QuestionCard.tsx` の `answerSubmittedRef`・cycle-301 §E）。**したがって「段差を作らない」という却下理由はサイクル全体としては成立していない**——段差は B-620 が作る。段差の存在は §5-6 に記録した（無記録で入れない） |

---

## 4. 読み取りクエリとその検証結果

実 SQL は [`docs/sql/quiz-question-dropoff.sql`](../../sql/quiz-question-dropoff.sql)（全文・書式は `docs/sql/ab-value-metrics.sql` に合わせた: ヘッダに役割／実行方法／`<FROM>`・`<TO>` パラメータ／SECTION ごとに独立した SELECT）。4 SECTION 構成。

| SECTION | 役割                                                                                                                                                                                                                                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | **設問別 離脱ハザード（主クエリ）** — `at_risk` / `answered` / `dropoff_pct` / `survival_pct` / `dropoff_excess_pt`。**計装済み run のみ**（`release` フィルタ）                                                                                                                                                    |
| 2       | **run サマリ** — 分母の健全性。`runs_with_start`/`orphan_runs`/`runs_with_end`/`runs_completed`/`duplicate_answer_rows`/`runs_with_gap` ＋ 出荷境界の列（`runs_no_answer_instrumented`/`runs_uninstrumented_release`/`runs_no_answer_by_release`）。**全 run**（既存系列と突合するため release フィルタを掛けない） |
| 3       | **計装の健全性点検** — 不変条件を機械検査し `PASS`/`WARN`/`FAIL` を返す（0 起点混入・param 欠落・`total` 不一致）                                                                                                                                                                                                   |
| 4       | **合成データによる自己検証** — `events_*` を参照せず、手計算の期待値と突合して assertion ごとに `PASS`/`FAIL` を返す                                                                                                                                                                                                |

### 4-1. 検証(a): 合成データ — **改訂後に再実行・51 assertion すべて PASS**

`npx tsx .claude/skills/analyze-bigquery/scripts/query.ts --file <SECTION 4>` を実行した（2026-07-30・改訂後に再実行）。SECTION 4 は `events_*` を参照せず SQL 内リテラルの合成データだけで動くので、**将来いつでも再実行できる**（`question_answered` の実データが無くてもよい）。合成シナリオは当初の7つに、改訂で**5つ追加して12**にした。

| #       | シナリオ                          | 合成データ                                                                                                                                                                                 |
| ------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S1      | 完走                              | `start, q1, q2, q3, end`                                                                                                                                                                   |
| S2      | 途中離脱                          | `start, q1`                                                                                                                                                                                |
| S3      | はじめるだけ                      | `start` のみ                                                                                                                                                                               |
| S4      | 離脱後リトライ完走                | `start, q1` / `start, q1, q2, q3, end`（2 run）                                                                                                                                            |
| S5      | 二重発火                          | `start, q1, q1, q2, q3, end`                                                                                                                                                               |
| S6      | `level_start` 欠落                | `q1, q2`（orphan run）                                                                                                                                                                     |
| S7      | 不変条件違反                      | `start, q=0, q=1, q=4`（total=3・別 content `qbad` で隔離）                                                                                                                                |
| **S8**  | **`ord` の検査（新規・m-1）**     | `qtie`: (a) `level_start` と `q1` が**同一 ts**（`ord` が守っているケース＝同一 run に入るべき）／(b) run1 の `end` と run2 の `start` が同一 ts（**原理的な穴**＝`end` が run2 に落ちる） |
| **S9**  | **param 欠落（新規）**            | `qnull`: `question_id` が NULL・かつ `min(qn)=2` → **FAIL が WARN より優先**されることの検査                                                                                               |
| **S10** | **旧バンドル（新規・Blocker）**   | `q3` に `start` のみ・`question_answered` を一度も送らない release の run を1本追加 → `release` フィルタで除外されるべき                                                                   |
| **S11** | **registry 未登録（新規）**       | `qnew`: 期待値表に無い `content_id` → `FAIL: unknown content_id`                                                                                                                           |
| **S12** | **`min(number)<>1`（新規・m-5）** | `qwarn`: q1 のビーコンだけ欠落（`q2, q3` のみ）→ **WARN**（FAIL ではない）・`runs_with_gap`=1                                                                                              |

手計算した期待値と実行結果（**51 件すべて PASS**。代表を抜粋）:

| assertion                                                                                                             | 期待（手計算） |   実行結果 | 判定 |
| --------------------------------------------------------------------------------------------------------------------- | -------------: | ---------: | ---- |
| q3 設問1 `at_risk` / `answered`                                                                                       |          7 / 6 |      7 / 6 | PASS |
| q3 設問2 `at_risk` / `answered`                                                                                       |          6 / 4 |      6 / 4 | PASS |
| q3 設問3 `at_risk` / `answered`                                                                                       |          4 / 3 |      4 / 3 | PASS |
| **q3 `dropoff_pct`（設問1/2/3）**                                                                                     | 14.3/33.3/25.0 |         同 | PASS |
| **q3 `survival_pct`（設問1/2/3）**                                                                                    | 85.7/57.1/42.9 |         同 | PASS |
| **q3 `dropoff_excess_pt`（設問1/2）**                                                                                 |    -10.7 / 8.3 |         同 | PASS |
| qbad（違反行除外後）設問1/2 `answered`                                                                                |          1 / 0 |      1 / 0 | PASS |
| qbad 設問3 `at_risk`（分母0）／`dropoff_pct` が NULL                                                                  |       0 / NULL |   0 / NULL | PASS |
| **qbad 設問1 `dropoff_excess_pt`（`IGNORE NULLS` の検査）**                                                           |          -50.0 |      -50.0 | PASS |
| **S10 q3 設問1 `at_risk` が旧バンドルで膨らまない**                                                                   |              7 |          7 | PASS |
| q3 `runs` / `runs_with_start` / `orphan_runs`                                                                         |      8 / 7 / 1 |  8 / 7 / 1 | PASS |
| q3 `runs_with_end` / `runs_completed`                                                                                 |          3 / 3 |      3 / 3 | PASS |
| **q3 `runs_no_answer_observed` / `_instrumented` / `uninstrumented`**                                                 |      2 / 1 / 1 |  2 / 1 / 1 | PASS |
| **q3 `runs_no_answer_by_release` に旧 release が出る**                                                                |             真 |         真 | PASS |
| q3 `avg_last_answered` / `duplicate_answer_rows` / `runs_with_gap`                                                    |   2.17 / 1 / 0 |         同 | PASS |
| **qwarn `runs_with_gap`**                                                                                             |              1 |          1 | PASS |
| **qtie `runs` / `orphan_runs`**（`ord` が同 ts を割らない）                                                           |          3 / 0 |      3 / 0 | PASS |
| **qtie: s9 の `level_end` が落ちる `run_no`**（正しくは 1）                                                           |              2 |          2 | PASS |
| q3 `answer_rows` / `dup_pairs` / `orphan_rows`                                                                        |     14 / 1 / 2 | 14 / 1 / 2 | PASS |
| qbad `violation_number_lt_1` / `_gt_total`                                                                            |          1 / 1 |      1 / 1 | PASS |
| **`verdict`: q3=PASS / qtie=PASS / qbad=lt_1 優先 / qnull=missing param 優先 / qnew=unknown content_id / qwarn=WARN** |  6件すべて一致 |       一致 | PASS |

**確認できたこと**: リトライが2つの独立した run に分かれる（S4）／二重発火が `MAX`・`COUNT(DISTINCT)` で吸収され率を歪めない（S5）／`level_start` 欠落 run が捨てられずに数えられる（S6 → `orphan_runs`=1）／0起点と total 超過の行が主クエリから除外され SECTION 3 で検出される（S7）／`at_risk`=0 の設問が行として残り率が NULL になる（欠落で隠れない）／**主クエリの最終出力（`SAFE_DIVIDE`・`ROUND`・survival の分母となる `MAX(...) OVER (PARTITION BY content_id)`・`PERCENTILE_CONT ... IGNORE NULLS`）と `verdict` の CASE 分岐順序まで assertion を通した**（改訂前は中間 CTE までしか通っておらず、ヘッダの「SECTION 1〜3 のロジックを検証する」は達成していない網羅性の主張だった＝AP-WF09）。

**S10 が示していること（Blocker の核心）**: 旧バンドルの run を除外しなければ `q3` 設問1 は `at_risk` 8 / `answered` 6 → `dropoff_pct` **25.0%** になる。除外すれば 7 / 6 → **14.3%**。合成データでも **10.7pt** の差が付く。実データの出荷当日は旧バンドルが 29〜44% あるので、この歪みは 30〜40pt になりうる。

### 4-2. 検証(b): 実 `events_*` — **実行済み。既知値と完全一致、かつ既知値の内訳まで再構成できた**

窓 **20260713-20260728**（cycle-300 §3-1 と同一窓）で SECTION 1・2・3 を実 `events_*` に対して実行した（2026-07-30）。**構文・型は3 SECTION すべてエラーなく通った。**

**run 分割の再構成が既知値と一致した（`quiz-character-personality`）**:

| 項目               | 既知値（cycle-300 §3-1） |          SECTION 2 の再構成 | 一致                                    |
| ------------------ | -----------------------: | --------------------------: | --------------------------------------- |
| `level_start` 件数 |                      311 | `runs_with_start` = **311** | ✅ 完全一致                             |
| `level_end` 件数   |                      224 |   `runs_with_end` = **221** | ⚠️ 差3 → **内訳まで説明できた（下記）** |

`runs_with_end` が 221 なのはクエリの誤りではなく、**`level_end` が二重発火している run が3件あるため**。追加で調べたところ:

| 1 run あたりの `level_end` 件数 | run 数 | イベント数 |
| ------------------------------: | -----: | ---------: |
|                               0 |     91 |          0 |
|                               1 |    218 |        218 |
|                               2 |  **3** |          6 |
|                            合計 |    312 |    **224** |

**218×1 + 3×2 = 224** で既知値と**ぴったり合う**。つまり 224 という既知値は「221 run のうち3 run が2回送った」ものであり、再構成は既知値を**完全に説明できている**。2回の間隔は最小 0マイクロ秒・最大 175,412マイクロ秒（=175ms）・平均 58.5ms で、うち1 run は**同一イベントバンドル**に入っていた（同一 tick 送出の証拠）。

**全クイズ横断の突合も一致**: `runs_with_start` 合計 **356** = `quiz-%` の `level_start` 実測 356件（完全一致・`level_start` の二重発火は0）。`runs_with_end` 合計 **253** + 二重発火の3件 = **256** = `level_end` 実測 256件（完全一致）。`orphan_runs` 合計 **1** = `level_end` を持つが `level_start` を持たないセッション×クイズ組の実測1件（完全一致）。

**リトライの実在（先行設計の数値を自分で測り直した）**: 窓 20260713-20260728・`quiz-%` で、セッション×クイズの組は **309**。うち `level_start` を持つのは **308**（1組は `level_end` のみ＝orphan）。`level_start` を **2回以上**持つのは **40組**＝308 の **13.0%**、最大 **4回**。先行設計の「308 のうち 40（13%）」は正しい（母数の取り方だけ明確化した）。**run 分割は必要**。

**`release` フィルタを入れた後も既知値の再現は崩れていない（改訂後の再実行・2026-07-30）**: SECTION 2 は release フィルタを run 系集計に**掛けない**設計にしたので、`runs_with_start` = **311**・`runs_with_end` = **221**・`orphan_runs` = **1** は改訂後も同値だった（既知値 224 = 218×1 + 3×2 の説明も不変）。出荷前の窓では `instrumented_releases` が空になるため `runs_uninstrumented_release` = `runs`（312）・`runs_no_answer_instrumented` = 0 と出る——「この窓には計装済み run が1本も無い＝まだ読めない」が数字で出るのが正しい挙動である。

**主クエリの全経路を実データ規模で1回通した（改訂後の追加検証）**: SECTION 1 は本番に `question_answered` が無いため 0 行しか返せない。そこで**同窓の `level_end` を `question_answered`（qn=1・qt=2）に見立てた置換版**を tmp で作って実行し、`GENERATE_ARRAY`・window 関数・`release` フィルタ・`PERCENTILE_CONT` を含む全経路が実データ 16 日分でエラーなく走ること、`quiz-character-personality` で `at_risk(q=1)`=311・`answered`=220（`release` フィルタが除外したのは 312 run 中 **1 run** だけ）と読めることを確認した。フィルタが実データ規模で過剰に除外しないことの確認でもある。**これは置換版であって `question_answered` の実データ検証ではない**（設問別の数値検証は §4-3 のとおり出荷後）。

### 4-3. 検証の限界（実行していないこと・honest な記録）

- **SECTION 1 と SECTION 3 は実データでは「0行」を返した。** `question_answered` が本番にまだ存在しないため（SECTION 1 は `totals` が空で INNER JOIN が全落ち、SECTION 3 は `answers` が空）。**構文・型・実行可能性は確認できたが、設問別の数値そのものは実データで検証できていない。** 実データでの数値検証は出荷後に §7 の合格条件で行う。設問別ロジックの正しさは §4-1 の合成データ検証で担保している。
- **`ord` の役割を訂正した（改訂・m-1）**: `run_no` は `COUNTIF(level_start)` の累積なので、`question_answered` と `level_end` の相対順序は結果に影響しない（`ord` を入れ替えて SECTION 4 を実行し全 assertion PASS を確認した）。`ord` が実際に守っているのは **`level_start` が同一 `event_timestamp` で他イベントと衝突する場合だけ**で、これは合成データに1件も無かったので **S8 として追加した**——(a) `level_start` と `question_answered` が同 ts のとき answer が `run_no=0`（orphan）に落ちて run が割れるのを防ぐ側と、(b) run1 の `level_end` と run2 の `level_start` が同 ts のとき `level_end` が run2 に落ちる**原理的な穴**の側を、両方 assertion にした（後者は「正しくは run1」と明記した回帰記録）。実データでは該当0件。
- **`at_risk` の定義を実装に合わせた（改訂・m-3）**: 実装は `has_start OR answered_max >= 1` で **orphan run も含む**。したがって `at_risk(q=1)` は SECTION 2 の `runs_with_start`（全 run・フィルタなし）と一致しない。ヘッダの「q=1 は level_start を持つ run 数」という記述は誤りだったので直した。
- **knowledge の解説画面での離脱は原理的に読めない**（§2-2）。`at_risk` は「その設問を答える機会まで来た」であって「設問を見た」ではない。
- **先行設計からの変更点（指標名）**: 先行設計は `saw_q` / `answered_q` / `hazard_pct` としていた。`saw_q` を **`at_risk`** に改名した。理由は上記——knowledge では「見た」を観測していないのに `saw` と名づけると、測っていないものを測ったことにしてしまう（AP-P02 の「測度が問いに答えているか」）。`hazard_pct` は **`dropoff_pct`** に改め、`survival_pct`（開始 run に対する到達率）を追加した。ハザードと生存の両方を出さないとファネルの形（緩やかな減衰か特定設問の崖か）が読めない。
- **`runs_with_gap` を新設した**（先行設計に無い）。`answered_distinct <> answered_max` を検出する。0 起点混入の第2の検出経路であり、かつ§5-2 の「回答が1問飛ぶ」不具合の観測手段になる。

---

## 5. 副作用と、他ドキュメント／SQL に必要な注記

### 5-1. `avg_engagement_sec` に出荷境界の不連続が入りうる（**必ず注記する**）

**機序（先行設計の説明を訂正した）**: `engagement_time_msec` は「前回のイベント送出からの**増分**」としてイベントに乗る。したがってイベント数が増えても**セッション合計はおおむね保存される**——「flush 頻度が上がるから値が増える」という説明は不正確。実際の不連続の源は**取りこぼしの減少**である: 最後のイベント送出後・離脱までの区間はどのイベントにも乗らずに失われる。イベントが細かく入ると、この未 flush の末尾が短くなり、**捕捉される合計が増える方向**に動く。

**この副作用が小さくない根拠（実測値・窓 20260713-20260728）**:

| 指標                                                                             |    実測値 |
| -------------------------------------------------------------------------------- | --------: |
| `level_start`(quiz-%) を持つセッション数                                         |       294 |
| 1セッションあたり平均イベント数                                                  |      6.22 |
| うち `engagement_time_msec` を載せているイベント数                               |      3.01 |
| 平均エンゲージ時間                                                               |   182.3秒 |
| **`engagement_time_msec` 合計のうち `level_start`/`level_end` が運んでいる割合** | **85.2%** |

**85.2% が示していること（改訂で役割を限定した）**: この数字が示すのは「**エンゲージ時間のイベント間の配分**が `level_start`/`level_end` に集中している」ことである。したがって `question_answered` が1 run あたり最大20件（`science-thinking`）挟まると、**配分は根本的に変わる**——「`level_end` の前後で分離集計して結果画面の滞在を読む」ような**イベント別に engagement を切り出す技法は、出荷前後で意味が変わる**（この技法は `docs/knowledge/2026-07-12-research-and-verification-techniques.md` が「エンゲージ秒はセッション合計であり面ごとの滞在ではない——局面の滞在はイベントのタイムスタンプ前後で分離集計しないと読めない」として記録している当のもの）。

**ただし 85.2% は「セッション合計の段差が大きい」根拠にはならない**（改訂・M-3）。`avg_engagement_sec` は `SUM(eng_ms)` のセッション合計であり、配分が変わっても合計は変わらない——本節の前段が自分でそう書いている。**当初の設計は前段（合計は保存される）と後段（85.2% だから小さくない）が論理的に接続していなかった。** 段差の源は取りこぼしの減少だけなので、大きさは「取りこぼしがあるセッションが何本あるか」で決まる。**「事前に確定できない」も誤りだった**——確定できる部分は確定する。

**段差の大きさ（自分で測った上下限・窓 20260713-20260728）**:

| 値                                                                                                                  |                                                      実測値 |
| ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------: |
| サイト全体のセッション数 / 平均エンゲージ                                                                           |                                           688 / **113.9秒** |
| クイズセッション数 / 平均エンゲージ                                                                                 |                                               294 / 182.3秒 |
| **末尾が失われているクイズセッション**（セッション最終イベントが quiz `level_start`＝離脱時ビーコンが届いていない） | **33**（294 の 11.2%）。平均エンゲージ 16.2秒・中央値 3.3秒 |
| `level_end` に到達しなかったクイズセッション（参考・上限側の母数）                                                  |                                   55。平均エンゲージ 20.2秒 |
| 完走 run の `level_start`→`level_end` 実時間（中央値 / 平均）                                                       |                                           164.4秒 / 206.2秒 |

- **下限は 0**（方向は「増える」だが、末尾が取れるようになる保証はない。モバイルは離脱時のビーコン自体が届かないので `question_answered` も届かないことがある——同じ knowledge 文書の2番目の知見）。
- **上限は仮定次第**（推定値）: 影響を受ける 33 セッションが、追加で 30秒 記録されるなら **+1.4秒（+1.3%）**／完走者中央値の半分（82.2秒）なら **+3.9秒（+3.5%）**／中央値まるごと（164.4秒）なら **+7.9秒（+6.9%）**。完走者の末尾は `level_end` が既に運んでいるので、**完走セッションは影響を受けない**（ここが上限を小さく抑える）。
- レビュー報告値「末尾が失われている quiz セッション 35/294・平均記録エンゲージ 5.2秒 → +1.5秒程度＝約1.3%」は、**定義が特定できず自分では再現できなかった**（近い定義で 33 セッション・平均 16.2秒・中央値 3.3秒、同時刻タイを含める定義で 37 セッション）。**「レビュー報告値・自分では未再現」としてラベルする**。結論（1〜2% 程度が現実的な線）は自分の上下限の中に入る。

**`bounce_pct` の段差はエンゲージ時間より大きい（改訂で追加・M-2）**: `docs/sql/ab-value-metrics.sql` の SECTION 1/2 は `bounce_pct = 100*COUNTIF(engaged!='1' OR engaged IS NULL)/COUNT(*)`（`engaged` はセッション内 `MAX(session_engaged)`）で直帰を出している。`session_engaged` は**送信時点のセッション状態としてイベントごとに刻印される**ので、回答中にイベントが1つでも飛べば `'1'` を持つイベントが生まれ、セッションは非直帰に転ぶ。実測（自分で再実行・窓 20260713-20260728）:

| 値                                                              |    実測値 |
| --------------------------------------------------------------- | --------: |
| サイト全体のセッション数 / うち直帰                             | 688 / 251 |
| `bounce_pct`（現状）                                            | **36.5%** |
| 「はじめる」を押したのに `engaged != '1'` の quiz セッション    |  **31件** |
| 上記31件がすべて非直帰に転んだ場合の `bounce_pct`（上限ケース） | **32.0%** |

→ **最大 4.5pt の段差**。31件は「回答中に送るイベントが1つも無いため10秒超の滞在が残らず直帰として記録されている」セッションであり、`question_answered` が入れば大半が非直帰側へ動く。エンゲージ時間の段差（1〜3%）より**相対的に大きい**ので、注記の主役はこちらである。

**非対称に注意（後続が取り違えないために）**: `scripts/analytics-report.ts` の `engaged_pv` は **`page_view` 行の `session_engaged`** を見ているので**影響を受けない**（回答中のイベントは `page_view` ではない）。同じ `session_engaged` を使っていても、**イベント別に刻印を読む集計（影響なし）とセッション MAX を取る集計（影響あり）で挙動が分かれる**。

**必要な注記（builder ではなく PM が書く。D1 の ADR001 更新と同時に）**:

1. **`docs/sql/ab-value-metrics.sql` のヘッダ**: B-613 出荷日を境に、クイズを含むセッションの **`bounce_pct`（SECTION 1/2・最大 4.5pt）**・`avg_engagement_sec`（SECTION 1）・`avg_eng_ms`/`avg_ln_eng_ms`（SECTION 3・**主 KPI**）に計装由来の段差が入りうる。出荷日を跨ぐ窓で前後比較してはならない。**切り分けの手段は実在する**——`release` が全イベントに乗っているので `release_id` 別（SECTION 2）で境界を特定できる。
2. **GA4 UI / GA4 MCP（`mcp__google-analytics__*`）経由で読む指標**: `bounceRate` / `engagementRate` / `eventCount` も同じ理由で出荷日に段差が入る（`eventCount` はクイズセッションで約2.9倍）。BigQuery の SQL だけを直しても、UI/MCP で読む人には伝わらないので注記に含める。
3. **ADR001（`docs/ADR/open/2026-08-10-ADR001-サイト刷新`）の経過記録**: エンゲージ時間・直帰率は **ADR001 の事前登録指標ではない**（`grep -riE "engagement|エンゲ|直帰|bounce"` で ADR001 は **0件**。事前登録されているのは診断完走率・診断開始率・クイズ完走率・save/share・CLS/モバイル比率・SC 指標）。**ただし `ab-value-metrics.sql` が価値指標の SSoT として持つ指標**であり、08-10 に ADR001 を読む人がそれらに触りうるので、注意喚起は ADR001 の経過記録に残す価値がある。「刷新とは無関係な計器変更が 07-31 前後で入った」ことと「『エンゲージ時間／直帰率が改善した』を刷新や B-614 の効果に帰属させてはならない」ことを書く。**cycle-300 で CLS の無言脱落を戒めた同じ規律で、これを黙って落とさない。**（当初の設計は同じ内容を「**事前登録指標である**エンゲージ時間」と書いていた。原典を確認せず制度的な重みのあるラベルを貼るのは AP-P34 後半・AP-P16・AP-WF12 と同根なので、確認して直した。）
4. **B-612（同時期対照）の設計制約**: 両 arm で `question_answered` を発火させること（§2-3）。

**なぜ副作用を承知で出荷するか**: 離脱局在は 08-10 の期日制約を持ち（入れなければ「読めない」で確定する）、エンゲージ時間と直帰率は `release_id` で境界を切り分けられる。**読めなくなるもの（局在）と、注記で救えるもの（エンゲージ・直帰の連続性）を較べて、前者を採る。** 代価は上記の注記で明示的に記録する。

### 5-2. 回答ハンドラの二重発火 → **B-620 として起票済み・修正も完了済み**（改訂で前提を更新）

§4-2 で、`quiz-character-personality` の 221 完走 run のうち **3 run（1.4%）が `level_end` を2回**送っていることを実測した（最小間隔 0マイクロ秒・1 run は同一イベントバンドル＝同一 tick）。

**機序（発見時点）**: `QuestionCard.handleSelect` の二重クリックガード `if (answered) return;` は **knowledge のときだけ `answered` が true になる**ため、**personality には実質ガードが無かった**。最終問で選択肢を素早く2度叩くと `handleAnswer` が2回走り `trackContentEnd` が2回発火する。最終問以外で起きると `setCurrentIndex((prev) => prev + 1)` が2回走って設問が**1問飛び**、`setAnswers` は捕捉した `answers` を使うので**回答が1問分失われ**、`determineResult` に渡らないので**来訪者に返る診断結果そのものが変わる**。計装の問題ではなく成果物の問題。

**現在の状態（2026-07-30 に実体確認）**: **B-620 として起票され、修正も完了している**——`QuestionCard.tsx` に `useRef` によるマウント単位の同期ロック `answerSubmittedRef` が入り（`git show HEAD:src/play/quiz/_components/QuestionCard.tsx` で確認）、`answered` state は knowledge の表示関心専用として残された。詳細は [cycle-301/index.md §E](./index.md)。当初の設計は「backlog に新規起票（下記 §5-3）」と書いていたが §5-3 は参照切れドキュメントの節であり**内部参照が解決していなかった**ので、実体で書き直した。

**本設計での扱い（B-620 後に読み替えた）**:

- **B-613 のスコープでは触らない**（§3 の案 H）。B-620 は独立したタスク・独立したレビューとして処理される（AP-WF15 の(c)）。B-613 の builder は `handleAnswer` の既存挙動を一切変えない。
- **読み取り側は二重発火に耐える設計を維持する**（`MAX`/`COUNT(DISTINCT)`）。B-620 で発生源が塞がれた後も残す——**耐性を外すと、修正が不完全だった場合に率が静かに歪む**。
- **観測の意味が変わった**: SECTION 2 の `duplicate_answer_rows` と `runs_with_gap` は、当初は「未修正の不具合の実在と頻度を初めて直接測る」ためのものだった。**B-620 で対象は既に消えているので、これらは「B-620 の修正が有効であることの回帰観測手段」になる**——出荷後に非0が出たら、意味するのは「不具合が実在する」ではなく「**修正が不完全、または別経路**」である。別経路の候補は index.md §E が記録した残存リスク（再マウント後＝例えば175ms後に届いた2回目のタップが、新しい `QuestionCard` の fresh な ref で受け付けられ、次設問の選択肢を押す）。
- **期待値**: B-620 出荷後は `duplicate_answer_rows` = 0・`runs_with_gap` = 0・`runs_with_end` = `level_end` 件数（一致）。

### 5-3. 出荷後にしか検証できない部分の追跡（**B-622**・改訂で追加・M-5）

設問別の数値は出荷後しか検証できない（SECTION 1/3 は実データで0行＝§4-3）。放置すると 08-10 に「読めない」と判明する。**PM が B-622 として起票済み**（`docs/backlog.md`・2026-07-30 に実体確認）:

> B-622 | B-613出荷後の計装健全性検査 | P1 | 期日=B-613出荷+2日。設問別の数値は出荷後しか検証できず(SECTION1/3は現状0行)、放置すると08-10に「読めない」と判明する。合格条件はinstrumentation-design.md C7〜C11。

- **合格条件は §7 の C7〜C11**（本改訂で C7・C8・C10・C11 を更新した）。
- **ADR001 の「次回確認時にやること」にも1行入れる必要がある**（B-622 を 08-10 より前に実施すること・未実施なら局在は読めないこと）。**ADR001 の編集は PM が行う**（D1 と同時）。設計側からは「必要である」ことの明記までを行う。

### 5-4. 参照切れドキュメント（事実の記録のみ）

- `docs/visitor-value-measurement.md` は不在（実体は `docs/archive/visitor-value-measurement.md` へ移動済み）。**B-619 として起票済み**（cycle-301 index.md キャリーオーバー）。
- `docs/experiments.md` は不在（`ls` で確認・2026-07-30）。
- **B-619 のスコープは実測より狭い（PM へ）**: B-619 は「5ファイル8行」（src 7行＋scripts 1行）としているが、`docs/` 側にも参照が残っている——`docs/sql/ab-value-metrics.sql` 1行・`docs/research/2026-06-visitor-metrics-baseline.md` 1行・`docs/research/2026-06-27-ab-arm-recording-verification.md` 1行・`docs/backlog.md` 1行。**合計 9ファイル12行**（`docs/archive/` 自身と `docs/cycles/` を除く・2026-07-30 grep 実測）。B-619 の対象を広げること。
- **新規 SQL では参照切れを作らない**: `docs/sql/quiz-question-dropoff.sql` は `docs/archive/visitor-value-measurement.md`（archive のパス）と `docs/cycles/cycle-301/instrumentation-design.md` を正しいパスで参照している。

### 5-5. archive 文書の採否（無条件に従わない）

`docs/archive/visitor-value-measurement.md` は「もはや利用しないが将来参照する価値がある知見」の位置づけなので、現行方針として無条件には従わず1件ずつ採否を決めた。

| 論点4 の記述                                                                      | 採否                                                                                                             |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| BigQuery 集計にカスタムディメンション登録は不要（登録せず BigQuery で読む）       | **採用**。R2 と一致し、index.md の GA4 スキーマ文書の一次確認とも一致                                            |
| `ab_variant`/`experiment_id` は主要イベントに限定（全イベント無差別付与はしない） | **採用**。§2-3。R1 との衝突は sid join で解消できることを確認したうえで採った                                    |
| `release` は全イベント共通に付与（gtag config 経由）                              | **採用（既に実装済みで実測確認）**。設計側の作業は不要                                                           |
| 主 KPI は「結果到達後のエンゲージ時間」                                           | **参照するが、本計装がこの KPI を汚しうる点を §5-1 で明記した**。文書に従うことが KPI を守ることにならないケース |

### 5-6. 本サイクルが既存系列に作る段差の一覧（無記録で入れない）

B-613 単体では `level_start`/`level_end` を一字も触らないが、**サイクル全体では既存系列に段差が入る**。§3 の案 H が「ガード追加は段差を作るから却下」と書いた当のものを、B-620 が同一サイクル内で実施しているためである。段差を記録せずに 08-10 を迎えると、cycle-300 の SC 平均順位（+1 欠落）と同型の事故になる。

| 段差                                                          | 原因      | 現れ方                                                                                                                          |
| ------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `level_end` の件数が run 数に一致するようになる               | **B-620** | 出荷前は二重発火分だけ件数が多かった（実測 224件 vs 221 run）。出荷後は一致する。**完走率の分子が最大 1.4% 下がる**（実測相当） |
| `bounce_pct` が最大 4.5pt 下がる                              | **B-613** | §5-1（`session_engaged` のイベント別刻印）                                                                                      |
| `avg_engagement_sec` が数% 上がりうる                         | **B-613** | §5-1（末尾の取りこぼしの減少・上限 +6.9%）                                                                                      |
| クイズセッションのイベント数が約2.9倍                         | **B-613** | §2-6。GA4 UI/MCP の `eventCount` に直接出る                                                                                     |
| 回答フェーズの UI（上部要素の退避・選択の即時フィードバック） | **B-614** | 完走率そのものを動かす意図的な変更（帰属は AP-P31 のため前後比較で行わない＝C13）                                               |

**向きに注意**: B-620 は完走率（`level_end` 件数 / `level_start` 件数）を**下げる**方向に効く。窓 20260713-20260728 の `quiz-character-personality` で計算すると 224/311 = 72.0% → 221/311 = **71.1%（-0.9pt）**（実測値からの算術）。つまり B-614 の改善効果は、この計器変更のぶんだけ**過小に見える**。08-10 に「完走率が思ったほど上がっていない」と読むときは、まず -0.9pt 相当の計器変更を差し引いて考える（そして帰属そのものは前後比較では行わない＝C13）。

---

## 6. builder への実装手順の骨子（コードは書かない）

1. **`src/lib/analytics.ts` に `trackQuestionAnswered` を追加する。**
   - パラメータは**オブジェクト1個**で受ける（5個は位置引数だと呼び出し側で読めない）。`trackTileFirstInteraction` / `TileFirstInteractionParams` の先例に倣い、専用の `interface` を宣言する（コーディング原則5「型エイリアスよりインターフェース」）。
   - フィールドは `content_id` / `content_type` / `question_number` / `question_total` / `question_id` の5個。**すべて必須**（optional にしない＝GA に `key: undefined` を送る余地を作らない。`withAbContext`/`buildTileParams` が守っている既存規律）。
   - `sendGaEvent("question_answered", {...})` に委譲する。SSR ガードと gtag 未定義ガードは `sendGaEvent` が既に持っているので自前で書かない。
   - JSDoc に「なぜ」を書く（コーディング原則4）: 1 起点であること・回答内容は送らないこと・`ab_variant` を載せない理由・`docs/cycles/cycle-301/instrumentation-design.md` への参照。
2. **`QuizContainer.handleAnswer` の先頭で1回呼ぶ。**
   - `question` は既に取得済み（`const question = quiz.questions[currentIndex]`）。`question_id` はその `question.id`。
   - `question_number` は **`currentIndex + 1`**。この `+1` は**この呼び出し引数の中だけ**に書く（変換箇所を1つに固定する＝§2-4）。
   - `question_total` は **`quiz.questions.length`**（`quiz.meta.questionCount` ではない。`ProgressBar` の `total` と同じ値を使い、UI と計装で同じものを数える。両者が全15本で一致することは確認済みだが、実際にフローを規定しているのは `questions.length`）。
   - **`quiz.meta.type` の分岐に入る前**に置く（§2-2。personality と knowledge の**両 type で確実に1回発火させる**ため。結果として最終問の送出順は `question_answered` → `level_end` になるが、SQL の run 分割はこの順序に依存していない＝§2-2 の訂正）。
   - `useCallback` の依存配列に `contentId`・`contentType` が既に入っていることを確認する（現状入っている）。新たに参照するのは既存の依存だけなので依存配列の変更は不要な見込みだが、lint の `exhaustive-deps` に従う。
   - **`handleAnswer` の既存の挙動は一切変えない**（`answered` ガードの追加・`trackContentEnd` の移動・`setAnswers` の変更はいずれもしない。R3／§5-2）。
3. **テストを追加する**（§2-7 の T1〜T8）。`analytics.test.ts` に T1・T2、新規 `src/play/quiz/_components/__tests__/QuizContainer.questionAnswered.test.tsx` に T3〜T7、**T8（SQL の期待値表と `registry.ts` の突合）は別ファイル**（SQL を読むだけで React に依存しないため）。
4. **`npm run lint && npm run format:check && npm run test && npm run build` を全緑にする。** 基線は取得済み・全緑（`tmp/cycle301-gates-baseline.log`・テスト 5543 passed・静的4138ページ）なので、失敗は本変更に帰属できる。
5. **ローカルで実機発火確認**（cycle-301 C4）。**本番 GA を汚染しない**こと——cycle-300 §7 の教訓で、`gtag` の no-op 化はページ読込後にしか効かず初期 `page_view` は送出済みになる。ローカル（`npm run dev` / `npm run build && npm run start`）で行い、`window.gtag` を差し替えるか Playwright の `browser_network_requests` で `collect` へのリクエストを照合する。確認すべきは「1問目で `question_number: 1` が出る」「12問目の後に `question_answered`(12) → `level_end` の順で出る」「送信 params に選択肢・回答が含まれていない」の3点。

**作業順序の制約（AP-WF07・改訂で明記）**: B-613 の C2 は `src/play/quiz/_components/QuizContainer.tsx` を触り、**B-614 の S1（回答フェーズの摩擦低減）も同じファイルを触る**。したがって **B-613 C2 と B-614 S1 は並行不能**である。別エージェントに並行アサインすると競合する。**同一 builder に直列で依頼する**（どちらを先にしてもよいが、同時に走らせない）。index.md の C2 にも同じ制約が書かれている。

**やらないこと / 誰が直すのか**:

- **`docs/sql/quiz-question-dropoff.sql` は builder は触らない。** 本 SQL は設計書と対で作成・検証されており、変更が必要になった場合は**設計側（本設計書の改訂を担当するエージェント）が直し、SECTION 4 を実行して全 PASS を確認したうえで**設計書の改訂履歴に記録する。実際に本改訂ではレビュー指摘を受けて設計側が SQL を改訂し、51 assertion 全 PASS と実データでの既知値再現を確認した（§4）。**「検証済みだから触らない」ではなく「触るのは設計側で、触ったら必ず SECTION 4 を再実行する」が正しい規約**である（当初の一文は前者に読めた）。
- ただし **§2-7 T8（`registry.ts` と SQL の期待値表を突合する単体テスト）は builder が書く**。SQL 本体は変更しない（読むだけ）。
- `level_start`/`level_end` と `analytics.ts` の既存関数は触らない。`QuestionCard.tsx` も触らない（B-620 の担当領域）。

---

## 7. 実装後に検証すべきこと（合格条件）

**出荷直前（ローカル・§6-5）**

- [ ] C1: `question_answered` が personality（`character-personality` で12回）と knowledge（`kanji-level` で10回）の**両方**で発火する。片方でも0なら不合格。
- [ ] C2: 1問目が `question_number: 1`（**0 なら不合格**）、最終問が `question_number === question_total`。
- [ ] C3: 送信 params が**ちょうど5個の自前キー**＋gtag 自動付与のみ。`choice_id`・回答内容・`result_id` が**1つも無い**（あれば不合格）。
- [ ] C4（改訂）: 最終問で `question_answered`(最終番号) と `level_end` が**両方**発火する。**順序は合否の条件にしない**——SQL の run 分割は両者の相対順序に依存していない（§2-2 の訂正・SECTION 4 で `ord` を入れ替えて全 PASS を確認済み）。当初の C4 は誤った前提で「正しい実装を不合格にしうる基準」だった。
- [ ] C5（改訂）: `level_start`/`level_end` の発火回数・params が、**B-620 の変更分を除いて**変更前と同一（R3）。B-620 により二重タップ時の `level_end` は 2回→1回になるので、**そこは「同一でない」が正しい**。B-613 の変更（`analytics.ts` への関数追加と `handleAnswer` からの呼び出し1行）が既存2イベントに影響していないことを見る。
- [ ] C6: 4ゲート（lint / format:check / test / build）全緑。テスト数が基線 5543 から**増えている**（T1〜T8 が実際に追加されている証拠。B-620 で 5550 になっているので、B-613 の基線はその時点の値を使う）。

**出荷後 1〜2日（実データ・BigQuery エクスポートは翌日以降に出る）— 追跡は B-622（§5-3）**

- [ ] C7（改訂）: `quiz-question-dropoff.sql` **SECTION 3 の `verdict` に `FAIL` の行が1つも無い**。1行でも FAIL なら計装を直す。とくに `violation_number_lt_1`（`qn < 1`）が FAIL なら 0 起点混入で読み取りは無意味。**`WARN: min(number) <> 1` は FAIL ではない**——低 n とモバイルのビーコン欠落でも起きるので、出たら `runs_with_start` と `runs_no_answer_by_release` を見て原因を弁別する（存在しないバグを追わない）。
- [ ] C8（改訂）: SECTION 2 で **`runs_no_answer_instrumented`（計装済み release に限った「1問も答えていない run」）がほぼ0**。`runs_no_answer_observed`（全 run）は出荷直後は**大きくて当然**で、主因は発火漏れではなく**旧バンドル**である（出荷当日の `level_start` の 29〜44% が旧バンドル＝§2-3 の実測）。**旧バンドル由来か発火漏れかは `runs_no_answer_by_release` の内訳で弁別する**——計装済み release に集まっていれば発火漏れ、旧 release に集まっていれば汚染。あわせて `runs_with_start` が同窓の `level_start` 件数と一致することを確認する。
- [ ] C9: SECTION 2 で **personality のみ**について `runs_completed ≒ runs_with_end`（knowledge は構造的にずれるので混ぜない＝§2-2 / SQL の注記）。
- [ ] C10（改訂）: SECTION 1 が `character-personality` について設問1〜12の**12行すべて**を返す（行が欠けていれば `question_total` か `GENERATE_ARRAY` の前提が崩れている）。**`dropoff_pct(q=1)` を読む前に、その窓の `runs_no_answer_observed` が 0 であること（または `release` フィルタで除外済みであることを `runs_uninstrumented_release` と内訳で確認できること）を確かめる**——ここを飛ばすと設問1の離脱率が偽に上振れし、B-614 の効果の読み取りが歪む。**「`survival_pct` が単調非増加」は落とした**（`answered(q)=COUNTIF(answered_max>=q)` は定義上必ず単調非増加なので検査として情報を持たない）。代わりに **`dropoff_excess_pt`** で段差の位置を読む（`at_risk` が20未満の行は読まない＝C12）。
- [ ] C11（改訂）: SECTION 4（合成データ自己検証）が引き続き **51 assertion 全 PASS**（SQL を触っていれば必ず再実行する）。

**08-10（ADR001 +4週）の読み取り時**

- [ ] C12: `at_risk` が20未満の行では率を読まない（1件で5pt以上動く）。`character-personality` は開始19.4/日（実測値・cycle-300 §3-1）なので10日で約190 run＝設問1の `at_risk` は読める規模、末尾の設問は分母が減るので注意。
- [ ] C13: 読み取り結果を**改善後（B-614 適用後）の設計に対するもの**として書く。改善前の局在は恒久的に取得できない（index.md の判断・ADR001 に記録）。**B-614 の効果への帰属には使わない**（AP-P31：前後比較では分離できない）。
- [ ] C14: `avg_engagement_sec` 系の指標を出荷日を跨いで比較していない（§5-1）。
- [ ] C15: `duplicate_answer_rows` と `runs_with_gap` を読み、§5-2 の不具合の実在と頻度を記録する。

---

## 8. 付録

### 8-1. 事実の一覧（値・ラベル・生成元）

すべて 2026-07-30 に取得。BigQuery は `npx tsx .claude/skills/analyze-bigquery/scripts/query.ts`（`.claude/skills/analyze-bigquery/SKILL.md` の手段）、コードは `Read` と `npx tsx` による `registry.ts` 走査。

| 値                                                                                                                             | ラベル        | 生成元                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------- | ---------------------------------------------------------------------------- |
| クイズ総数 **15**（personality 12・knowledge 3）                                                                               | 実装値        | `src/play/quiz/registry.ts` を `npx tsx` で走査                              |
| 総設問数 **157**・`questionCount` と `questions.length` の不一致 **0本**                                                       | 実装値        | 同上                                                                         |
| 設問 id は全15本 `q1`..`qN`・重複0・最大3文字・全問4択                                                                         | 実装値        | 同上                                                                         |
| `character-personality` の設問数 **12**                                                                                        | 実装値        | 同上                                                                         |
| 最長 `content_id` = `quiz-unexpected-compatibility`（29字）                                                                    | 実装値        | 同上 + `contentIdForQuiz`                                                    |
| GA4 既存イベント名 **11種**（`question_answered` は不在）                                                                      | 実測値        | `events_*` 窓 20260713-20260729 の `GROUP BY event_name`                     |
| `question_answered` のコード内出現 **0件**                                                                                     | 実測値        | `grep -rn "question_answered" src/ docs/ scripts/`                           |
| `quiz-character-personality` `level_start` **311** / `level_end` **224**（窓 20260713-20260728）                               | 実測値        | `events_*`。cycle-300 §3-1 の既知値と一致                                    |
| 同窓 `level_end` の内訳 = 218 run×1回 + **3 run×2回** = 224                                                                    | 実測値        | run 再構成クエリ                                                             |
| 二重発火の間隔 最小 **0µs** / 最大 **175,412µs** / 平均 **58.5ms**・1 run は同一イベントバンドル                               | 実測値        | 同上                                                                         |
| `quiz-%` `level_start` 合計 **356** / `level_end` 合計 **256**（16日）                                                         | 実測値        | `events_*`                                                                   |
| セッション×クイズの組 **309**（`level_start` あり **308** / orphan **1**）・`level_start` 2回以上 **40組=13.0%**・最大 **4回** | 実測値        | `events_*` を sid×content_id で集計                                          |
| サイト全体イベント **3,421件/16日 = 213.8件/日**                                                                               | 実測値        | `events_*` 全行 COUNT                                                        |
| クイズセッション **294**・平均イベント **6.22件**・エンゲージ載せ **3.01件**・平均エンゲージ **182.3秒**                       | 実測値        | `events_*` を sid 集計                                                       |
| `engagement_time_msec` 合計のうち `level_start`/`level_end` が運ぶ割合 **85.2%**                                               | 実測値        | 同上                                                                         |
| `release` が本番稼働中（例 `033b2dd-20260727` 726件）                                                                          | 実測値        | `events_*` 窓 20260726-20260729                                              |
| `question_answered` 追加量 下限 **187.9** / 中央 **224.8** / 上限 **261.8** 件/日                                              | 推定値        | 上記 starts/ends 実測 × 実装 `questionCount`                                 |
| サイト全体の増加倍率 **約2.05倍**（上限ケース 2.22倍）                                                                         | 推定値        | (213.8+224.8)/213.8                                                          |
| クイズファネルイベント 完走1 run で **2→14件（7.0倍）**                                                                        | 実装値        | 算術（2 + 12）                                                               |
| セッション全体イベント **6.22→約18.2件（約2.9倍）**                                                                            | 実測値+推定値 | 6.22（実測）+ 12（実装値）                                                   |
| GA4 param 上限: 1イベント **25個** / 名 **40字** / 値 **100字**・イベント名の種類数は web で無制限                             | 仕様値        | <https://support.google.com/analytics/answer/9267744>（index.md で一次確認） |
| BigQuery 日次エクスポート上限 **1,000,000 イベント/日**（超過継続でエクスポート停止・過去分は再処理されない）                  | 仕様値        | <https://support.google.com/analytics/answer/9823238>（2026-07-30 一次確認） |
| 上限に対する比: 増加分 **0.022%** / 変更後合計 **0.044%**（上限ケース 0.048%）                                                 | 推定値        | 上記実測・推定値から算術                                                     |
| `docs/visitor-value-measurement.md` / `docs/experiments.md` ともに不在                                                         | 実測値        | `ls`                                                                         |
| 参照切れ **9ファイル12行**（B-619 の「5ファイル8行」より広い）                                                                 | 実測値        | `grep -rn "docs/visitor-value-measurement.md"`（archive/cycles 除く）        |
| 4ゲートの変更前基線: 全緑・テスト **5543 passed**・静的 **4138ページ**                                                         | 実測値        | `tmp/cycle301-gates-baseline.log`（index.md D3）                             |

### 8-2. アンチパターン逐条確認

`docs/anti-patterns/planning.md`（AP-P01〜P34）と `implementation.md`（AP-I01〜I13）を1項目ずつ言葉にして確認した。

**planning.md**

- **AP-P01（根幹の仮定を実測せず先送りしていないか）**: 該当なし。本設計が依拠する数はすべて出荷前に測った——対象15本と `questionCount`（`registry.ts` 走査）、リトライ13.0%（BigQuery）、量 224.8件/日（BigQuery）、engagement の85.2%（BigQuery）、既知値 311/224 の再現（BigQuery）。SQL は**実行して**検証した。**「実装フェーズで検証する」に回したのは1点だけ**——SECTION 1/3 の設問別数値の実データ検証で、これは `question_answered` が存在しない今は原理的に不可能。§4-3 で「未検証」と明記し §7 の C7〜C11 で合格条件に落とした。
- **AP-P02（自案を否定するデータを探したか・検証の強度を都合で変えていないか）**: 意識的に自案を壊しにいった。(a) 既知値 224 と再構成 221 の**差3を見逃さず**追跡し、二重発火という自分の設計の前提を揺るがす事実を掘り出した（掘らずに「ほぼ一致」で済ませるのが最も誘惑的だった）。(b) 発火点は「共通経路だから両フローで取れる」というPMの説明を鵜呑みにせず `QuestionCard.handleSelect` まで下りて、`onAnswer` が分岐の**前**にあることを確認した。(c) 量の推定は下限だけでなく**上限も**出した（自案に不利な側）。(d) 指標名 `saw_q` を **`at_risk` に改名**したのは、まさに「測度が問いに答えているか」を網羅性とは別に問うた結果。
- **AP-P03（現状を所与にしていないか）**: 該当なし。`registry.ts` に将来クイズが増えることを前提に、`question_total` をイベントに載せて**コンテンツ側の設問数を SQL にハードコードしない**設計にした（SECTION 3 の期待値表だけは意図的にハードコードし、更新が必要なことをコメントに明記）。
- **AP-P04（Owner 発言を検証せず前提にしていないか）**: 該当なし。本タスクは PM 経由。PM の「決定事項」は**すべて実コード・実データに当てて再検証**し、3点（対象数15本・指標名 `saw_q`→`at_risk`・「7倍」の分母・0.047%の内訳）を訂正した。
- **AP-P05（前回の失敗への反射で正反対に振れていないか）**: 該当なし。cycle-300 の AP-P31 事故（前後比較で帰属）への反応として「計装を入れない」にも「A/B にする」にも振れていない。計装は入れ、帰属には使わない（C13）と分離した。
- **AP-P06（既存調査・過去の意思決定を参照したか）**: 実施。`docs/archive/visitor-value-measurement.md` 論点4/5（GA4 スキーマ・ディメンション登録の要否）、`docs/sql/ab-value-metrics.sql`（書式・セッション代表 arm の作法）、cycle-300 §3/§3-1/§7 を参照した。§5-4 で archive の各記述の採否を1件ずつ判定した。
- **AP-P07（運営者目線・実装容易さで決めていないか）**: 該当なし。案 D（URL を設問ごとに変える）は**実装が容易**で `page_view` で読めるが、来訪者の履歴を12個汚し戻るボタンを壊すため却下した。実装容易さを理由に採らなかった側の記録。
- **AP-P08（ゼロベース検討を対象限定していないか）**: 該当なし。イベント名・発火点・パラメータ・起点・読み取りの5層それぞれで代替案を出した（§3 に8案）。
- **AP-P09（Goal を SEO 等に読み替えていないか）**: 該当なし。本計装の目的は「12問を答えきれない人がどこで諦めているかを知る」＝来訪者価値の直接改善のための道具。
- **AP-P10（根拠なき高評価を採用していないか）**: 該当なし。「23 assertion 全 PASS」は自分が手計算した期待値との突合であり、外部の高評価ラベルではない。実データ検証の**限界**を §4-3 に明記して評価を膨らませていない。
- **AP-P11（過去の AI 判断を変更不可の制約にしていないか）**: 該当なし。先行設計エージェントの決定を4点変更した（§4-3・§2-6）。
- **AP-P12（過去の同種施策の失敗を分析したか）**: 実施。cycle-300 §7 の「計器の意味の訂正」（完走率は「結果を受け取れた率」ではなく「最終問まで回答した率」）が、まさに計器の意味を取り違えた失敗。本設計はその再発を避けるため、`at_risk` が「見た」ではないことを SQL のヘッダと §2-2 に明記した。
- **AP-P13（フレームワーク先行になっていないか）**: 該当なし。ファネル分析の一般論から入らず、`handleAnswer` の実コードと `events_*` の実データから設計した。
- **AP-P14（調査範囲を恣意的に限定していないか）**: 該当なし。対象を `character-personality` に絞らず15本すべてを走査した（PM の「全10診断」を鵜呑みにすれば絞っていた）。
- **AP-P15（直近の成功体験で優遇していないか）**: 該当なし。
- **AP-P16（数値に一次確認とラベルを付けたか）**: 実施。§8-1 に全数値の（実測値／仕様値／実装値／推定値）ラベルと生成元を併記した。「検証済み」と書いたものは**すべて実行した**（§4）。実行できなかったものは §4-3 に「未検証」と書いた。
- **AP-P17（3案以上を比較したか）**: 実施。§3 に8案（A〜H）の却下理由。
- **AP-P18（指摘の背後の問いの構造を言語化したか）**: 実施。PM の「鵜呑みにせず自分で検証せよ」という指示の背後の問いは「先行エージェントの結論が**どの一次情報に接地しているか**が失われている」ことだと読み、決定の再掲ではなく**接地の再構築**（実コードの行番号・実クエリの実行結果）を成果物の中心に置いた。
- **AP-P19（外部仕様を一次資料で再確認したか）**: 実施。GA4 の param 上限（index.md の一次確認を引用）と、**index.md に無かった** BigQuery 日次エクスポート上限 1,000,000 を <https://support.google.com/analytics/answer/9823238> で新たに一次確認した（先行設計はこの数値を典拠なしに使っていた）。
- **AP-P20（過度に具体的な計画になっていないか）**: 該当なし。§6 は「どこに何を置くか」と「なぜ」に留め、**コードは書いていない**。関数シグネチャの具体形は builder に委ねた。
- **AP-P21（固定枠に膨張側と操作側が同居していないか）**: 該当なし（UI 変更を含まない）。B-614 側の論点。
- **AP-P22（目的が派生作業にすり替わっていないか）**: 確認済み。派生元（cycle-300 §3-1 の「残る問い＝どの設問番号で落ちているか」）に遡り、本設計の要件 R1 がそれと一致することを確認した。目的は「イベントを追加すること」ではなく「離脱局在が読めること」なので、読み取りクエリの検証を成果物の核（§4）に置いた。
- **AP-P23（期間集計値と現在の状態を組み合わせて因果を主張していないか）**: 該当なし。窓 20260713-20260728 の値を、その窓での事実としてのみ使った。二重発火の3件は日付でなく run 構造から特定した。
- **AP-P24（同一領域の過去の設計判断を打ち消していないか）**: 確認済み。`analytics.ts` に確立された規律を4つ特定し、すべて踏襲した——(1) `key: undefined` を GA に送らない、(2) input/output コンテンツは送らない、(3) SSR/gtag 未定義で no-op、(4) `content_id` を join キーに統一。`level_name` の二重化だけは意図的に引き継がなかった（理由を §2-3 に明記）。
- **AP-P25（constitution Goal との整合を最初に問うたか）**: 実施。案 D（URL 変更）は「技術的には page_view で読めて安い」が、来訪者の履歴と戻るボタンを壊すため Goal 起点で最初に落とした。案 E（`choiceId` 送信）も「分析価値はある」が憲法ルール2 で最初に落とした。技術的分析を積み上げる前に落としている。
- **AP-P26（小サンプルのイベントを人間の行動と解釈していないか）**: 該当あり・対処済み。二重発火3件と orphan run 1件を「人間の行動」と断定していない。二重発火は `engagement` を伴うクイズ完走セッション内の事象で、かつ**同一イベントバンドル**という機械的証拠を添えた。orphan run 1件は「原因はセッション跨ぎか計測欠落」と両方を挙げ断定していない。cycle-300 §7 の検証由来イベント（07-30 に数件）が窓に混ざる前提も index.md 補足で承知している——本設計の窓は 20260713-20260728 で 07-30 を含まない。
- **AP-P27（未完了の作業が実害を出しているのに放置していないか）**: 該当あり・記録した。§5-2 の「回答が1問飛ぶ」疑いは来訪者に実害（誤った診断結果）が返る可能性がある。**放置せず** backlog 起票を §5-3 で PM に引き渡し、出荷後に頻度を測る手段（`runs_with_gap`）も同時に用意した。B-613 のスコープに混ぜないのは AP-WF15 の独立レビュー要請による。
- **AP-P28（実装コストを理由に本質的品質を妥協していないか）**: 該当なし。むしろ逆方向に検討した——SECTION 4（合成データ自己検証・23 assertion）と SECTION 3（機械的な不変条件検査）は「クエリを1本書く」より明らかに手間だが、0 起点混入や二重発火が**静かに数値を歪める**性質のものなので、機械検査を用意する側を選んだ。
- **AP-P29（先例の構造を実コードで確認したか）**: 実施。「`analytics.ts` の既存 track* と同型だから」で済ませず、`trackTileFirstInteraction`/`TileFirstInteractionParams`（オブジェクト引数の先例）と `withAbContext`/`buildTileParams`（undefined を送らない先例）を実際に読み、§6 で参照した。
- **AP-P30（現状追認していないか）**: 実施。`level_name` の二重化は「今そうなっているから」を理由に引き継がず、偶発（GA4 推奨イベントの慣習に合わせた歴史的経緯）と判定して落とした。`answered` ガードが personality に無いことも「今そうなっているから正しい」とせず、不具合の疑いとして起票に回した。
- **AP-P31（低トラフィックで A/B を却下していないか・前後比較を A/B の代替にしていないか）**: 該当なし。本設計は A/B の可否を判断していない（B-612 の領域）。むしろ §2-3 で「イベントに arm を載せずに sid join で arm 別に読める経路」を用意し、C13 で「本計装の読み取りを B-614 の効果帰属に使わない」と明示して前後比較への転用を先に封じた。
- **AP-P32（内部語彙の地位と出自を確認したか）**: 実施。`docs/archive/visitor-value-measurement.md` の各記述を「検証済みの結論」（ディメンション登録不要＝A-3 で一次確認済み）と「戦略的判断」（arm を主要イベントに限定）に分けて扱い、§5-4 に採否を明記した。後者は改訂可能な仮説として扱い、R1 と衝突しうることを認めたうえで解消経路を示した。
- **AP-P33（一律変換で少数の面の中身を壊していないか）**: 該当あり・対処済み。「`QuizContainer` 1箇所の変更で15本すべてに効く」は一律変換であり、母集団を **personality 12本 / knowledge 3本**に分割して差を確認した。結果、knowledge は「解説→次へ」の1段があるため `at_risk` の意味が personality と**同じでない**ことが判明し、指標名の変更（§4-3）と SQL の注記（SECTION 2 の整合チェックに knowledge を混ぜない）に反映した。分割せず均質に扱えば knowledge の数値を personality と同じ意味で読む誤りが入っていた。
- **AP-P34（「正典」等で仮説を岩盤に格上げしていないか／他者の権威ラベルを貼っていないか）**: 遵守した。archive 文書を「正典」扱いせず1件ずつ採否を判定し（§5-4）、R1 と衝突する箇所は衝突として明記した。PM の「決定事項」も権威として扱わず4点訂正した。**逆に、自分の推論に PM やレビュアーのラベルを貼っていない**——§4-2 の 224=218+3×2 は自分が実行したクエリの出力であり、cycle-300 の記述を典拠として引いたのは既知値 311/224 の側だけ（それも自分で再実行して一致を確認した）。

**implementation.md**

- **AP-I01（lint/test/build の通過や形式確認で「完了」としていないか）**: 遵守した。SQL は「書いた」で終わらせず**実行**し、期待値と突合した（§4）。実データで検証**できなかった**部分を §4-3 に明記した。来訪者目線の確認としては、案 D/E を来訪者の履歴・プライバシーの観点で落とし、§5-2 で「来訪者に返る診断結果が変わる疑い」を計装の都合より重く扱った。「0 起点に気をつける」で済ませず機械検査（テスト T3/T6・SQL SECTION 3）に落としたのも本項の適用。
- **AP-I02（オプショナル追加や個別ハードコードで回避していないか）**: 遵守した。5個の param はすべて必須（optional にしない）。`question_total` をイベントに載せることでコンテンツ別の設問数を SQL にハードコードせずに済ませた。SECTION 3 の期待値表だけは意図的なハードコードで、目的（実装との不一致検出）と更新義務をコメントに明記した。
- **AP-I03（Core Vitals・バンドルサイズを無視していないか）**: 確認済み。追加は既存 `analytics.ts` への関数1つと `QuizContainer` からの呼び出し1行のみ。新規依存なし・巨大データの static import なし。`analytics.ts` は既に `QuizContainer` が import しているのでバンドルへの追加は関数本体分のみ（数十バイト規模）。実行時コストは1クリックあたり `window.gtag` 呼び出し1回で、既存の `level_start`/`level_end` と同じ経路。
- **AP-I04（指標を直接の目的にして構成を決めていないか）**: 該当なし。本作業は計測の追加そのものであり、指標を上げるために来訪者向けの構成を変えていない（UI の変更はゼロ）。
- **AP-I05（来訪者の目的に無関係なコンテンツを追加していないか）**: 該当なし。来訪者に見える変化はゼロ。
- **AP-I06（前回の指摘に対して反対の極端に振れていないか）**: 該当なし。
- **AP-I07（jsdom 単体テストで検出できない領域を Playwright で検証するか）**: 該当あり・対処済み。本変更は CSS・レイアウト・スタッキング・layout root に触らないので本項の典型2パターンには当たらない。ただし**gtag は `window` 依存で jsdom ではモックにしかならない**ため、実際に GA へ送出されるかは単体テストでは分からない。§6-5 でローカル実機（Playwright の `browser_network_requests` で `collect` を照合）による発火確認を必須にした。かつ**本番 GA を汚染しない**手順（cycle-300 §7 の教訓＝no-op 化はページ読込後にしか効かない）を明記した。
- **AP-I08（DESIGN.md に未定義の視覚表現を追加していないか）**: 該当なし。視覚表現の変更ゼロ。
- **AP-I09（依存される側→依存する側の commit 順序になっているか）**: 該当あり。`analytics.ts`（依存される側＝`trackQuestionAnswered` の実体）を `QuizContainer`（依存する側）より先に、または**1 commit にまとめる**。§6 の手順1→2 の順がこれに対応する。中間コミットでビルドが壊れない。
- **AP-I10（インラインスタイルから CSS Modules の `@keyframes` を参照していないか）**: 該当なし。CSS に触らない。
- **AP-I11（`setTimeout`/`setInterval` の ID を ref に保持し cleanup しているか）**: 該当なし。タイマーを使わない。`trackQuestionAnswered` は同期的に `window.gtag` を呼ぶだけで、unmount 後に発火する非同期処理を作らない。
- **AP-I13（撤去時に識別子の一括 grep を通したか）**: 該当なし（撤去を含まない）。ただし**追加側で同じ規律を先に効かせた**——`question_answered`・`question_number`・`question_total` を `src/ docs/ scripts/` に対して grep して0件（衝突なし）を確認し、GA4 側の既存イベント名11種とも照合した。
