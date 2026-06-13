---
id: 235
description: B-355 実績システムの存続検討 — 新コンセプト「日常の傍にある道具」と実績システム（バッジ／ストリーク）の整合をコード実測と GA 実測に基づいて評価し、存続か撤去かを判断して B-338（Phase 9.1）のスコープを確定する
started_at: 2026-06-12T23:40:20+0900
completed_at: 2026-06-13T09:38:25+0900
---

# サイクル-235

このサイクルでは、実績システム（ゲームクリアでバッジ獲得・ストリーク追跡・`/achievements` ページ）を新コンセプト「日常の傍にある道具（と、ちょっとした息抜き）」のもとで存続させるか撤去するかを判断する（B-355）。

実績システムは旧コンセプト（占い・診断・ゲーム中心）期に作られたゲーミフィケーション機構で、現行の docs/site-concept.md には実績・バッジ・ストリークへの言及が一切ない（grep 実測）。一方で `(new)/layout.tsx` にも AchievementProvider / StreakBadge が組み込まれており、デザイン移行（Phase 9.1 = B-338）はこの存続判断を待ってブロックされている。Phase 9 の先には P1 の Phase 11（legacy 撤去）が控えるため、この判断を先送りするほど移行計画全体が停滞する。

## 実施する作業

- [x] T-1: 実績システムの現状棚卸し（コード実測）— Explore エージェントが完了（grep/読解の実測ベース・パスと行番号付き）。本体 `src/lib/achievements/`（9 ファイル + テスト 6 + CSS 2）＋ページ `(legacy)/achievements/`（19 ファイル）＝**計 36 ファイル・約 3,400 行**。バッジ 14 個（first-use〜total-1000）・対象 20 コンテンツは**すべて遊び系**（ゲーム 4・クイズ/診断 14・運勢 1・ユーモア辞典 1。**道具＝ツールは 1 つも対象でない**）。localStorage キー `yolos-achievements`。組み込み: 両 layout の AchievementProvider・Header の StreakBadge・Footer 2 種の「実績」リンク・sitemap・trust-levels.ts・bundle-budget ホワイトリスト。トリガーは recordPlay 呼び出し 7 ファイル（GameContainer×4・QuizContainer・DailyFortuneCard・humor-dict RecordPlay）。共有コードは getTodayJst（本体は crossGameProgress.ts 側＝保持必須）と trackAchievementUnlock（analytics.ts・呼び出し元は実績のみ＝撤去時削除可）のみで、ゲームの StatsModal/統計とは独立
- [x] T-2: 利用実態の実測（BigQuery / GA4）— 観測可能な全期間（GA4 MCP: 2026-02-14〜03-27 + BigQuery: 2026-03-28〜06-11 の計約 17 週）で実測完了。(1) `/achievements` は全期間で **6 PV・約 4 ユーザー**（BigQuery 期間 74 日では 2 PV・2 ユーザー、流入は両方ともサイト内回遊〔/play/word-sense-personality・ブログ記事〕で検索流入ゼロ）。Search Console は**全期間で表示 0・クリック 0**。(2) `unlock_achievement` は計 107 件・約 66 ユーザーだが、内訳（BigQuery 期間）は first-use 62 件（初回利用で自動付与）+ quiz-first 34 件（診断/クイズ初完了）+ **streak-3 が 1 件のみ**。streak-7 以上・ゲーム固有バッジの獲得は 0。発火元はすべて /play セクション（大半が診断系）。(3) トリガー元コンテンツの PV は BigQuery 期間 74 日でゲーム 4 件計 25 PV（nakamawake 9・kanji-kanaru 7・irodori 5・yoji-kimeru 4）・daily fortune 1 PV。level_start は 130 件・78 ユーザー（診断系含む /play 全体）
- [x] T-3: 判断ドキュメントの作成 — **撤去（②）と判断**。評価軸 4 つ（コンセプト整合・ターゲット寄与・利用実態・コスト）すべてが撤去を支持し、中間案 ③（道具向け再設計）は実質新機能開発で現コードの延命理由にならないと整理。詳細は「作業計画 > 判断（T-3 の結論）」参照。付随発見: 本番 `/achievements` に表示バグ現存（生 ID 3 件表示・Playwright 実機確認）
- [x] T-4: reviewer による判断レビュー — r1: 承認（撤去判断は妥当・事実関係は根幹まで実測再現済み）＋ should-fix 1 件（fortuneStore.ts:16 の getTodayJst import 張り替えが B-338 スコープに必要＝「切り分けほぼ不要」の精緻化）・nit 2 件（件数基準の明示・B-432 順序調整の中身）→ PM が全件反映（fortuneStore の import は PM も grep で独立確認）。r2: **承認（残指摘ゼロ）**。reviewer は GA 実測（BigQuery 独立クエリで PV・unlock_achievement 内訳を再現）・コード棚卸し（36 ファイル・badges.ts・共有コード）・表示バグ（本番 Playwright 実機 + content-names.ts 突合）・B-338 スコープ網羅性（独立 grep）・devil's advocate（ストリーク機構の反復利用層への訴求可能性）まで独立検証済み
- [x] T-5: 判断結果の反映 — docs/design-migration-plan.md Phase 9.1 に「② 撤去採用（cycle-235）・スコープ SSoT は cycle-235.md・旧 URL は標準 404（当初案の 410/リダイレクトを実測根拠で上書き）」を追記し、① 存続案を不採用として打ち消し。backlog の B-338 を Deferred → Queued へ移動（着手条件の B-355 完了 + B-488 完了が達成）し、タイトルを「実績システムの撤去」に確定・スコープ SSoT・B-432 順序・表示バグ現存による早期着手推奨を Notes に記載
- [x] T-6: ブログ記事化の要否判断 — **今は書かない**と判断。題材自体には読者価値がある（「ゲーミフィケーションを入れれば使われる」という通説への実測の反証: バッジ 97 件中 96 件が自動付与・実績ページは 17 週で 6 PV・ストリーク到達者 1 人）が、物語がまだ「撤去を決めた」までで完結していない。B-338（撤去実施）完了時に「作った → 測った → 消した」の完結した学びとして書く方が読者の持ち帰りが大きい（cycle-234 T-8 と同じ判断構造）。B-338 の Notes にブログ化判断の引き継ぎを記載
- [x] T-7: 4 ゲート確認（`npm run lint && npm run format:check && npm run test && npm run build`）— 全通過（test 342 ファイル・5616 件 passed・build 成功。本サイクルの変更はドキュメントのみ）

## 作業計画

### 目的

B-338（移行計画 Phase 9.1: 実績システムへの対応）のスコープを確定し、デザイン移行 Phase 9 → 11（P1: legacy 撤去）への道を開く。判断そのものは来訪者に見えないが、判断の中身は来訪者価値に直結する: 実績システムが「気に入った道具を繰り返し使っている人」（targets）の喜びに寄与しているなら撤去は価値の毀損であり、誰にも使われていないなら存続はサイトの自己定義（道具のサイト）を濁らせ、保守コストを来訪者価値に向かわない場所に固定する。だから印象ではなくコード実測と GA 実測で決める。

### 作業内容

1. **現状棚卸し（T-1）**: kickoff 時の予備調査で確認済みの範囲——`src/lib/achievements/`（Provider/Toast/StreakBadge/badges/engine/storage 等 + テスト）、`(legacy)/achievements` ページ一式、`(new)/layout.tsx`・`(legacy)/layout.tsx` への Provider 組み込み、Header の StreakBadge、Footer の「実績」リンク、実績トリガー呼び出し元（ゲーム 4 件・クイズ・daily fortune・humor-dict の RecordPlay）——を起点に、依存の全列挙を grep で完成させる。
2. **利用実態の実測（T-2）**: analyze-bigquery スキルで `/achievements` の PV・流入と、実績トリガー元コンテンツの利用量を実測する。BigQuery のデータは 2026-03-28 以降のため、それ以前は GA4 MCP（2026-02-14〜）を併用する。実績の獲得は `trackAchievementUnlock`（analytics.ts）経由で GA4 の `unlock_achievement` イベントとして送信されている（**計画当初の「GA イベントがない」想定は T-1/T-2 の実測で誤りと判明・訂正済み**）ため、「実績ページを見に来る人」「実績を獲得している人」「実績の対象となる遊びをする人」の三面から実測する。
3. **判断（T-3）**: 評価軸は (a) site-concept との整合（道具コア・息抜き 1 割以下・「単発で使い捨てない」設計思想）、(b) targets 5 種への寄与、(c) 利用実態、(d) 存続させる場合の移行・保守コスト（B-338 ①）と撤去する場合の作業範囲（B-338 ②・関連 URL の 410/リダイレクト）。選択肢は移行計画の ①② に加え、中間案（例: ゲーム内統計は残して全サイト横断のバッジ機構だけ撤去する等）が実測から浮かべば明示して比較する。
4. **反映（T-5）**: 判断結果を本ドキュメントと backlog（B-338 Notes）・design-migration-plan.md に反映する。B-338 の実施自体は次サイクル以降（本サイクルは判断のみ。コード変更はしない）。

### 判断（T-3 の結論）: 撤去 — 移行計画 Phase 9.1 の ② を B-338 のスコープとする

評価軸ごとの結果（すべて T-1/T-2 の実測に基づく）:

- **(a) site-concept との整合: 不整合。** 現行コンセプト「日常の傍にある道具」に実績・バッジ・ストリークへの言及はない（grep 実測）。実績の対象 20 コンテンツはすべて遊び系で、サイトのコアである道具は 1 つも対象でない。バッジ体系の中核（「今日の全制覇」「一週間全制覇」= 1 日に診断 14 種を全部受けることを称える等）は旧コンセプト（占い・診断中心）の回遊促進装置であり、「息抜きは全体の 1 割以下・診断/占いは将来的に整理する」という現方針と真っ向から衝突する。StreakBadge は全ページの Header に常駐しており、サイトの顔の一部として旧コンセプトを発信し続けている。
- **(b) ターゲット 5 種への寄与: なし。** 最も近い「気に入った道具を繰り返し使っている人」にとっても、道具が 1 つも対象でない現実装は無関係。道具の反復利用の支援は道具箱（Phase 10・トップ `/`）が既に担っている。
- **(c) 利用実態: 観測上ほぼゼロ。** `/achievements` は観測可能な全期間（約 17 週）で 6 PV・約 4 ユーザー・全て内部回遊・検索面の存在感ゼロ（SC 表示 0）。獲得バッジは BigQuery 期間（74 日）の 97 件中 96 件が初回利用の自動付与（first-use/quiz-first）で、実績システムを「目当てに」通った形跡はストリーク 3 日到達の 1 件のみ。streak-7 以上・全制覇系・累計系バッジの獲得者は 74 日間で 0 人。
- **(d) コスト比較: 存続が高くつく。** 存続 = 36 ファイル・約 3,400 行の (new)/ 移行 + **現存する表示バグの修正**（本番 `/achievements` の「今日の進捗」に `quiz-character-personality`・`fortune-daily`・`humor-dictionary` が生 ID のまま表示されている = content-names.ts のマッピング欠落・Playwright 実機確認）+ 20 コンテンツ分の対応表の継続管理。撤去 = T-1 棚卸しで影響範囲が確定済みで、共有コードの切り分けは 1 箇所のみ（getTodayJst の本体は crossGameProgress.ts 側で保持され、撤去対象外の `src/play/fortune/fortuneStore.ts:16` が実績側の re-export ラッパ `@/lib/achievements/date` 経由で import しているため、直参照への張り替えが 1 行必要〔T-4 レビュー should-fix・PM 実測確認済み〕。ゲームの StatsModal/統計は独立）。
- **中間案 ③（道具向けに実績を再設計）は「存続」ではない**: 対象もバッジ体系も UI も全て作り直しになるため実質新機能開発であり、現コード 3,400 行の延命理由にならない。道具の反復利用を支援する仕組みの必要性は、B-510（道具箱利用計測の初回分析）以降のデータで判断するのが筋。

B-338（撤去実施）のスコープ: 移行計画 ② の列挙（`src/lib/achievements/` 一式・`(legacy)/achievements/` ページ・Header/Footer のリンク・recordPlay 呼び出し 7 ファイル・localStorage キー）に加え、T-1 棚卸しで判明した以下を含める — sitemap.ts のエントリ・`src/lib/trust-levels.ts` のエントリ（**B-432〔trust-levels 完全削除〕との順序調整: B-432 を先に実施すればファイルごと消えるため B-338 側の対応は不要になる。B-338 を先に実施する場合のみエントリ削除が必要**）・bundle-budget.test.ts のホワイトリスト・meta.ts（ACHIEVEMENTS_LAST_MODIFIED）・analytics.ts の trackAchievementUnlock・`src/play/fortune/fortuneStore.ts` の getTodayJst import を `@/play/games/shared/_lib/crossGameProgress` 直参照へ張り替え（fortuneStore は撤去対象外の現役コード）・テスト 7 ファイル。旧 URL `/achievements` の扱いは**リダイレクト不実装（標準 404）を推奨**: 検索流入 0・SC 表示 0・内部リンクは撤去と同時に消えるため実害が想定されず、cycle-233 で確立した「実害なき旧 URL にリダイレクトを積まない」（AP-P23 の文脈）に従う。B-338 実施時点の GA で 404 着地が観測されたら再判断する。

### 検討した他の選択肢と判断理由

| 案        | 内容                                          | 判断                                                                                                                                                                        |
| --------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1（採用） | B-355 実績システムの存続検討                  | cycle-234 の選択肢検討で「次サイクル以降の有力候補」と明記済み。Phase 9.1（B-338）のブロッカーであり、その先に P1 の Phase 11 が控える。判断タスクで 1 サイクル規模。       |
| 2         | B-342〜348 cheatsheet ブログ転換（Phase 9.2） | いつでも着手可能で B-355 と独立。ただし 7 件の転換は複数サイクルに渡るため、先に 9.1 の判断を済ませて Phase 9 全体の残量を確定させる方が移行計画の見通しが良い。            |
| 3         | B-310 ヘッダーナビ体系の再設計                | P2。実績システムの存続判断は Header（StreakBadge）/ Footer（実績リンク）の構成に直接影響するため、B-355 を先に済ませる方がナビ再設計の前提が固まる。順序としても B-355 先。 |
| 4         | B-510 道具箱計測データの初回分析              | 着手条件（デプロイから 2 週間・2026-06-26 目安）未達。サンプル不足のまま分析しても判断を誤る。                                                                              |
| 5         | B-502 タイルレジストリ／型契約の再設計        | 着手トリガー（B-497 系の並行作業で必要になった時点）が来ていない。                                                                                                          |

### 計画にあたって参考にした情報

- docs/cycles/cycle-234.md（選択肢検討・案 4 として B-355 を有力候補と明記。GA/SC 実測: サイト全体は週 46〜264 PV、検索流入の主力は診断・辞典系の個別コンテンツ直行）
- docs/design-migration-plan.md Phase 9.1（① 存続なら `/achievements` を (new)/ へ移行 / ② 撤去なら実績システム全体削除 + 関連 URL は 410 またはリダイレクト）
- docs/site-concept.md（実績・バッジ・ストリークへの言及なし＝grep 実測。息抜きは全体の 1 割以下の補完要素・既存の診断・占いは将来的に整理する方針）
- docs/targets/（5 ターゲット定義。「気に入った道具を繰り返し使っている人」が実績と最も接点を持ちうる）
- kickoff 時のコード予備調査（grep/find 実測）: `src/lib/achievements/` 12 ファイル + `__tests__` 6 件、`(legacy)/achievements` ページ一式、両 layout への組み込み、Header/Footer のリンク、トリガー元（games 4・quiz・fortune・humor-dict）
- docs/backlog.md（B-338 着手条件: B-355 完了 + B-488 完了〔達成済み〕）

## レビュー結果

### 判断レビュー（T-4・reviewer・2 ラウンド）

- r1: **承認（撤去判断は妥当）** + should-fix 1 件・nit 2 件。reviewer は GA 実測（BigQuery 独立クエリで `/achievements` 2 PV・unlock_achievement 内訳 62/34/1 を完全再現）・コード棚卸し（36 ファイル・badges.ts 20 コンテンツ遊び系のみ・共有コード切り分け）・表示バグ（本番 Playwright 実機 + content-names.ts×badges.ts 突合で 3 件の生 ID 欠落を確認）・B-338 スコープ網羅性（独立 grep で全列挙と突合）・判断ロジック（devil's advocate として「ストリーク機構が『気に入った道具を繰り返し使っている人』に訴求しうる」存続論を立てて実測で棄却）を独立検証。should-fix: fortuneStore.ts:16 が実績側 re-export ラッパ経由で getTodayJst を import しており「切り分けほぼ不要」は不正確（B-338 スコープに張り替え追加）。nit: 件数基準の明示・B-432 順序調整の中身。→ PM が全件反映（fortuneStore は PM も grep で独立確認）。
- r2: **承認（残指摘ゼロ）**。3 件の反映を独立検証（date.ts を参照する非撤去対象が fortuneStore のみであることを grep 再確認）し、全体見直しでも整合性破綻なし。

### T-5/T-6 反映レビュー（同 reviewer・1 ラウンド）

- **承認（残指摘ゼロ）**。三者間整合（migration-plan / backlog / cycle doc で旧 URL 扱い・スコープ SSoT・B-432 順序・fortuneStore 張り替えの 4 項目が一致）、B-488 完了の独立確認、T-6 判断の devil's advocate（「今書くべき理由」を探したが、サイクル自身が明記する 404 着地観測時の再判断シナリオを踏まえると未完結公開は訂正リスクを伴うと結論）、4 ゲートの独立再実行（test 342 ファイル・5616 passed の完全一致）まで確認。

### コンテンツレビュー

- 該当なし（T-6 でブログを今は書かないと判断。判断理由は「実施する作業」T-6 参照）。

### ワークフロー AP チェック（cycle-completion 手順 4・fresh reviewer・1 ラウンド)

- **承認（AP-WF01〜16 逐条チェックで実害となる該当事項なし・修正不要）**。reviewer が注意深く見た 3 点も実体確認で問題なしと判定: (a) AP-WF08 近傍——PM 自身が T-2/T-3/T-5 を実施したが、別個の reviewer が BigQuery 独立クエリ・独立 grep で一次検証しており自作自演レビューになっていない（cycle-233 と同型の判断サイクル構成）。(b) AP-WF10——T-4 と T-5/T-6 反映レビューの同 reviewer 連続起用は同一テーマ継続の許容範囲。(c) B-392 誤削除しかけ——kickoff コミットの diff に B-392 が -/+ とも現れないことを確認し、commit 前復元で成果物への実害ゼロ。三者間整合・recordPlay 呼び出し元・fortuneStore import も reviewer が独立再現。

## キャリーオーバー

- B-338「移行計画 Phase 9.1: 実績システムの撤去」が着手可能になった（本サイクルの判断の帰結として backlog Queued へ移動済み・タイトルとスコープ確定）。本番 `/achievements` の表示バグ（「今日の進捗」に生 ID 3 件表示・content-names.ts のマッピング欠落）は撤去で解消されるため個別の修正タスクは起こさず、B-338 の早期着手推奨の根拠として Notes に記載した。
- B-338 完了時に「ゲーミフィケーションを実測で見直して撤去した話」のブログ化を判断する（T-6 の判断の引き継ぎ・B-338 Notes に記載済み）。

## 補足事項

- kickoff 時の backlog 整理: Deferred → Queued の移動該当なし（B-510 の着手条件 2026-06-26 目安は未達。その他は cycle-234 から状況変化なし）。Queued → Deferred の移動: B-324・B-313 を Deferred へ移動（「着手前に B-510 の判断を経ること」が条件であり、B-510 自体が Deferred のため現時点で着手不能。着手条件を「B-510 の判断完了後」と明記）。B-355 を Queued → Active へ。
- kickoff の backlog 編集時、sed の行番号指定ミスで B-392 の行を誤削除しかけた（B-324/B-313 の削除を意図した `sed '63d;64d'` が、先行する削除による行繰り上がりで B-313/B-392 に当たった)。直後の `git diff` での削除対象検証で発見し、git の原本から B-392 を復元済み（最終状態は prettier・grep で整合確認済み）。教訓: 複数行削除は 1 コマンドにまとめるか、行番号でなく内容マッチで行う。
- 本サイクルはコード変更なしの判断サイクル（cycle-233 と同型）。成果物はドキュメント 3 件（cycle-235.md・design-migration-plan.md・backlog.md）の更新のみ。
- 計画当初の想定誤り 1 件を実測で訂正: 「実績獲得は GA イベントがない」は誤りで、`trackAchievementUnlock` 経由の `unlock_achievement` が GA4 に送信されていた（このイベントデータが判断の重要な根拠になった——イベントは存在するが中身は初回自動付与がほぼ全てで、エンゲージメントの証拠ではなかった）。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
