---
id: 303
description: "B-606 の1本目として、来訪者トラフィック上位（診断内PV2位）の「強い本人性」診断 word-sense-personality を結果先行で再設計する。現状は回答が割れると結果が答えでなく results 配列順で決まり（results[0]=elegant-precise へ +6.11pt・同点依存率 27.79%）、診断が診断していない。**当初『公正タイブレーク』を採ったがオーナー指摘で破棄——『タイブレーク語が中心＝壊れた枠』（cycle-294/incident-2）。** 本筋は cycle-295 の方法論に沿い、タイプ定義と設問・配点を『回答が結果を決める』よう設計し直し、同点が設計上ほとんど生じないようにすること。1診断ずつ（cycle-297 triage）。"
started_at: 2026-08-09T07:23:24+0900
completed_at: null
---

<!-- index.md には計画・チェックリスト・完了サマリだけを書く。実測ログ・候補比較・レビュー経過は同ディレクトリの別ファイル（design.md・review-log.md 等）へ分割してここからリンクする。 -->

# サイクル-303

来訪者は診断で **136秒**、実際に手を動かして自分を知ろうとしている（GA 実測・後述）。その診断のひとつ word-sense-personality には、**回答が割れたとき結果が「答え」ではなく `quiz.results` の配列の並び順で決まる**欠陥が残っている。136秒かけて答えたのに、その答えが結果に届いていないなら、それは雑な道具を渡して来訪者を裏切ることだ。このサイクルは、その1本を根から直す。

## なぜこれを今やるのか（芯）

- **来訪者価値の本体は診断にある**（GA 実測・直近28日・SGボット塊を除いた実像）: 診断 `/play` の実 PV 1,385・engaged 174・**平均エンゲージ 136.7秒/セッション**。他セクション（辞典19.6秒・ブログ20.4秒）を圧倒し、ここだけボット混入がほぼゼロ。→ [ga-context.md](./ga-context.md)
- **word-sense-personality は B-606 の是正キュー最優先**。cycle-297 triage が「強い本人性 + タイブレーク（高優先）」群の筆頭に置き、**トラフィック×可視性で word-sense(51)→music(32)→…** の順を明示（`docs/cycles/cycle-297/triage.md`）。GA 実測でも診断内で character-personality（1,132 PV・cycle-295 で是正済み）に次ぐ **第2位（53 PV）**。
- **欠陥は実コードで確認済み**（`src/play/quiz/scoring.ts:90-100`）: 汎用 `determineResult` が strict `>` で同点を `results[0]` に落とす。word-sense はこの偏りが **+6.11pt（elegant-precise）で全10診断中最大**、同点依存率 **27.79%**。QuizContainer は character-personality と science-thinking のみ専用判定へ分岐し、word-sense は汎用経路（`QuizContainer.tsx:200-208`）なので該当する。
- **是正の型が確立済み**: cycle-295（B-589）で character-personality の結果先行を G1〜G5 で再設計し出荷（恣意決着 36〜46%→1.6%・到達不能タイプ回復）。この方法論を典拠にできる（`docs/cycles/cycle-295/design.md`）。
- **constitution Rule 4**（every aspect で最高品質）: triage が明記するとおり「エンタメだから放置してよい」は採らない。唯一の判断基準は constitution。

### B-576（最上位 P1）を今回選ばなかった理由

- **急性の実害が既に消えている**: cycle-302 の E0 で禁止色（青）は除去済み（favicon の朱ドットは `#E87A65`・CR 3.568→6.135）。可読性も壊れていない（cycle-302 baseline 暫定所見）。残るのは「新デザインと図像が揃っていない」品質ギャップで、破損ではない。
- **B-583〈印の要否・字〉未決に依存**し、その未決を favicon 出荷の圧の下で決めることが cycle-283/299/302 の3度の失敗の根そのもの。放置しても劣化しない（別の店の名札が出続ける類の劣化ではなく、既に禁止色は消えている）。B-583 を独立サイクルで先に決めてから B-576 を再着手するのが筋。
- **来訪者価値の所在**（GA 実測）が診断に明確に偏っている。CLAUDE.md の決定原則（来訪者価値の最大化）に照らし、いま最も人々のためになるのは診断の結果先行を1本根治すること。

## 実施する作業

- [x] **P1a. 実測（欠陥の実在確認）**（planner + reviewer2名で独立再現済み）: word-sense-personality（10問4択・8型）の同点依存率 27.79%・elegant 先頭偏り +6.11pt・出現6.15倍・dead=0 を悉皆（4^10）で実測。→ [design.md](./design.md) §0〜§2。
- [~] **P1b. 是正方針の設計【差し替え済み】**: 当初「公正タイブレーク（案①）」を採用したが、**オーナー指摘により破棄**——「タイブレークという語が中心に来た時点で壊れた枠」（`cycle-294/incident-2.md`）。**本筋は結果先行の再設計**（タイプが先・設問がそこへ判別・同点が設計上ほとんど生じない）。経緯＝[course-correction.md](./course-correction.md)。→ 再設計は **P1c** で行う。
- [x] **P1c. 結果先行の再設計【設計フレームワーク承認】**（planner 2巡 + reviewer）: V1（純single-signal＋反同点重み）は「重みが同点消去の本体＝隠れたタイブレーク」でレビュー却下→ **V2** で確定。V2＝(A) 固定影結合を廃した内容接地の配点（主signal強度2/3＋文が実際に帯びる時だけの近傍nuance）、(B) 隣接3対を各3問で直接対決させる incidence 改修、(C) 真の残余同点（実測21%）を主タイプは決定的に保ちつつ**同格で正直に開示**。悉皆実測 G1=8/8・dead=0・同点27.79%→21.39%・出現6.15→1.74倍。**フレームワーク健全（差し戻し不要）**・調律重み排除を reviewer が独立確認。→ [redesign-v2.md](./redesign-v2.md)。content 是正3件（V-2/V-3/V-5）は P2 の builder が対応。
- [ ] **P2a. 実装: 診断データの再設計**（builder + reviewer）: `word-sense-personality.ts` を redesign-v2.md A-3/B-1 で実装（incidence改修・40択の書き直し・内容接地の配点）。V-2/V-3 の content 是正を反映。**最終データで G1=8/8・dead=0・同点率・出現を悉皆再実測**し redesign-v2.md を実測値へ更新（目標に向けて撫でない）。決定性（同じ回答→同じ結果）保持。typeId・title・結果本文・相性36は不変。
- [ ] **P2b. 実装: 真の同点の開示機構**（builder + reviewer）: `scoring.ts` に `getTiedTypeIds`（`determineResult` は不変）、`QuizContainer.tsx` で co-types を計算、`ResultCard.tsx` に同点時のみ同格併記の開示ブロック（X>Y を暗示しないコピー・V-5）。第三者ページ・OGP・SEO・相性は単一 typeId のまま不変。
- [ ] **P3. 検証**（reviewer/harness）: 実装後の最終コードで全ゲートを悉皆再実測し、`redesign-v2.md`／`review-log.md` に前後比較を残す。回帰ガード（`reachability.test.ts` に同点率の悉皆退行ガード追加）で欠陥が赤→緑になることを示す。
- [ ] **P4. 視覚確認**: 開示ブロックのある結果ページを `take-screenshot` で前後確認（単独勝者・2型同点・3型同点の3ケース）。独立レビュー。
- [ ] **P5. ブログ判断**: 読者（自診断を作る人・結果の公正さに関心のある人）にとって価値があるかを読者視点で判断し、価値があれば blog-writer で執筆・独立レビュー。無ければ書かない理由を記録。
- [ ] **P6. キャリーオーバー整理**: B-606 の残り診断（music→yoji→animal→character-fortune＋娯楽くじ群）の状態を backlog に反映。

## 作業計画

### 目的

word-sense-personality を受けた来訪者の**回答が、その人の結果を決める**ようにする。現状は同点時に results 配列順（elegant-precise が +6.11pt 有利）で決まり、回答が割れた来訪者の結果が本人の答えを反映しない。これを是正し、「これがあなた」という本人性の約束を裏切らない道具にする。

### 作業内容

汎用 `determineResult`（`scoring.ts`）の配列順タイブレーク欠陥に対し、word-sense-personality を対象に実測 → 比例した是正の設計 → 実装 → 実測検証 → 回帰ガード、の順で進める。是正の深さは P1 の実測結果に基づいて決める（tiebreak 単独／開示 UX／G1〜G5 再設計）。1診断ずつ（cycle-297 の申し送り）。作業は planner・builder・reviewer に分割して委譲し、各段でレビューを通す。

### 検討した他の選択肢と判断理由

- **B-576（favicon/OGP 再設計・最上位 P1）**: 不採用。理由は上記「B-576 を今回選ばなかった理由」。急性の実害が消えており、未決の B-583 に依存し、圧の下での即断が3度の失敗の根。来訪者価値の所在は診断。
- **B-603/B-607（character-personality の後続）**: 不採用（今回は）。#1 ページ（1,132 PV）だが、その中核判定は cycle-295 で結果先行に是正済み。B-603 は「測定面を誤り判定撤回」の再判定で分析寄り、B-607 は逆順フォールバックの縁の和らげで可視性が低い。結果先行の生の欠陥が残るのは word-sense 側。
- **B-606 を10診断まとめて**: 不採用。cycle-297 が「束ねたのはスコープ判断を欠いた引き継ぎだった」と自己批判し「1診断ずつ」を申し送っている。CLAUDE.md の「Keep task smaller」にも従う。
- **共有 `determineResult` のタイブレークだけを全8診断へ一括修正**: P1 で検討する候補の一つ（安く広い是正）。ただし triage は「単独では出現率不均衡が残り根治にならない」と指摘。word-sense を対象に、この一括修正で足りるか G1〜G5 相当の再設計まで要るかを実測で判断する。

### 計画にあたって参考にした情報

- **GA4 実測（BigQuery raw・2026-08-09 取得・直近28日 2026-07-11〜08-07）**: SGボット塊（全体の約54%）を除いた実像で診断が来訪者価値の本体（平均エンゲージ 136.7秒）。生 SQL と数値＝[ga-context.md](./ga-context.md)（サイクルディレクトリに保存・一次証拠を git 管理外に置かない）。
- `src/play/quiz/scoring.ts:58-101`（2026-08-09 実査）: 汎用 `determineResult` の strict `>` 配列順タイブレーク。character-personality/science-thinking のみ専用判定（`QuizContainer.tsx:200-208`）。
- `docs/cycles/cycle-297/triage.md`（B-606 の根の分析・全10診断の実測一覧・重篤度3階層・優先順・「1診断ずつ」の申し送り）。
- `docs/cycles/cycle-295/design.md`・`docs/cycles/cycle-295/index.md`・`verification.md`（結果先行再設計 G1〜G5 の確立済み方法論。※ character-personality 専用の測度・写像であり、word-sense には構造が異なるため機械的に流用せず、方法論として参照する）。
- `src/play/quiz/data/word-sense-personality.ts`（806行・12問4択・結果タイプ群。P1 で現物を精読する）。
- **外部仕様への依存**: 無し。本サイクルは内部の診断判定ロジックのみを対象とし、SEO 機能・ブラウザ API・Schema.org・サードパーティプラットフォームに依存しない。よって一次資料確認は不要。

### 期限が来た ADR・Deferred の確認結果（kickoff 手順 2・3）

- `docs/ADR/open/2026-08-10-ADR001-サイト刷新`: 先頭日付 2026-08-10 は**今日（08-09）より未来**のため開かない（手順2の規定どおり）。次サイクル以降の観測対象。
- Deferred の着手日付き項目（B-565/B-615=2026-08-10・B-629=2026-08-14 ほか）: いずれも着手日が未来のため今日は Queued へ移動しない。
- Queued→Deferred へ戻す必要のある項目は無し。

## キャリーオーバー

- （サイクル進行に応じて記載）

## 補足事項

- MCP ツール（GA/BigQuery・Playwright）を使うサブエージェントは foreground で実行する（CLAUDE.md）。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run typecheck && npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する（exit 0）。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
