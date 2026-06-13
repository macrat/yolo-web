---
id: 236
description: B-338 実績システムの撤去（移行計画 Phase 9.1 ②）— cycle-235 で確定した撤去判断を実施する。実績システム本体 36 ファイルと全組み込み箇所を削除し、本番 /achievements の表示バグを撤去で解消。完了時に「ゲーミフィケーションを実測で見直して撤去した話」のブログ化を判断する
started_at: 2026-06-13T10:54:31+0900
completed_at: 2026-06-13T14:07:17+0900
---

# サイクル-236

このサイクルでは、実績システム（バッジ・ストリーク・`/achievements` ページ）を撤去する（B-338 = 移行計画 Phase 9.1 ②）。

撤去の判断は cycle-235（B-355）で確定済み。評価軸 4 つ（コンセプト整合・ターゲット寄与・利用実態・コスト）すべてが撤去を支持した（`/achievements` は約 17 週で 6 PV・SC 表示 0・獲得バッジ 97 件中 96 件が初回自動付与・ストリーク到達者 1 人のみ・対象 20 コンテンツはすべて遊び系で道具ゼロ）。本番 `/achievements` には来訪者に見える表示バグ（「今日の進捗」に生 ID 3 件表示）が現存しており、撤去によってこれも解消される。スコープの SSoT は docs/cycles/cycle-235.md「判断（T-3 の結論）」。

## 実施する作業

- [x] T-1: 撤去スコープの最終確認（kickoff 時に grep で実測済み・cycle-235 SSoT と一致を確認）と builder への指示書作成 — (new)/(legacy) で Header/Footer が別実装（new=`@/components/Header`/`Footer` index、legacy=`@/components/common/`）と判明。StreakBadge は (new) layout actions と legacy common/Header の 2 箇所。humor-dict RecordPlay は (legacy)/dictionary/humor/[slug]/page.tsx で使用。すべて SSoT と一致
- [x] T-2: 撤去の実施（builder へ委任）— 削除 38 ファイル・編集 24 ファイル。本体削除＋全組み込み解除＋recordPlay 解除 7 ファイル（GA level_end 等の併存機能は保持）＋fortuneStore 張り替え＋関連テスト整理。陳腐化コメント 2 件（about/page.tsx・global-not-found.js）も解消
- [x] T-3: 残存参照ゼロの検証と 4 ゲート — grep1（lib/achievements / StreakBadge / AchievementProvider / useAchievements / recordPlay / trackAchievementUnlock / unlock_achievement / yolos-achievements）= **0 件**。grep2（/achievements・実績）はブログ本文の「track record」用法・データ辞書のみで実績システム参照ゼロ。4 ゲート全通過（lint OK・format OK・test 333 ファイル 5498 件 passed・build EXIT=0・/achievements ルートなし・sitemap.xml に achievements 0 件）
- [x] T-4: Playwright 実機検証（本番ビルドをローカル起動）— 全項目 OK: トップ Header に実績バッジなし・レイアウト無崩れ／新旧 Footer に「実績」リンクなし／`/achievements` 標準 404（curl でも 404 確認）／nakamawake ゲーム正常（カード操作可・コンソールエラー 0）／運勢カード正常表示（fortuneStore 張り替えの破損なし）。スクショは tmp/cycle-236/
- [x] T-5: reviewer によるレビュー — **承認（指摘ゼロ）**。reviewer が 5 観点を実体確認: 撤去網羅性（独立 grep で 0 件・sitemap/trust-levels/bundle-budget の残存なし）、非対象コードの無傷性（fortuneStore 張り替えの挙動同一性・各 GameContainer で recordPlay のみ除去し trackContentEnd 等を保持・依存配列の過不足なし・layout のラップ解除後の配置を実機確認）、方針遵守（標準 404・localStorage 掃除コード不追加・StatsModal 不変・feature-preserving）、ドキュメント三者間整合、テスト（独立再実行で 333 ファイル 5498 件 passed・4 ゲート全通過）
- [x] T-6: ブログ記事化の判断と執筆 — **書くと判断し公開**。物語が「作った→測った→消した」で完結した今、具体データ（17週6PV・バッジ97件中96件が初回自動付与・ストリーク到達1人）を伴う「ゲーミフィケーションを入れれば使われる、という通説への実測の反証」は読者の持ち帰りが大きい。記事 `src/blog/content/2026-06-13-gamification-built-measured-removed.md`（dev-notes・想定読者=機能追加を迷う個人開発者）。blog-writer 執筆 → contents-review（reviewer が一次資料突合・AP-W チェック・実機確認で「公開可」・指摘ゼロ）→ PM 自身も読後に読者価値を独立判断し公開決定。published_at は実時刻で設定
- [x] T-7: ドキュメント反映 — design-migration-plan.md Phase 9.1 に完了注記・backlog（B-338 → Done・Active 空・最古 Done〔cycle-231 B-312〕削除・B-432 Notes に /achievements エントリ削除済みを追記・B-341 を着手条件達成で Deferred → Queued 移動）
- [x] T-8: 4 ゲート最終確認と /cycle-completion — 全通過（lint OK・format:check OK・test 333 ファイル 5498 件 passed/8 skipped・build EXIT=0・新記事 `/blog/gamification-built-measured-removed` がビルド成果に存在・`/achievements` ルートなし）

## 作業計画

### 目的

旧コンセプト（占い・診断・ゲーム中心）期のゲーミフィケーション機構を撤去し、(1) 本番 `/achievements` に現存する来訪者に見える表示バグを解消する、(2) 全ページ Header に常駐する StreakBadge が発信し続けている旧コンセプトを止め、サイトの自己定義（日常の傍にある道具）を明瞭にする、(3) 移行計画 Phase 9.1 を完了させ、P1 の Phase 11（legacy 撤去）への道を 1 つ進める。誰にも使われていない機構（実測済み）の存続は、保守コストを来訪者価値に向かわない場所に固定する——撤去こそが来訪者のためになる。

### 作業内容

撤去対象（kickoff 時の grep 実測で cycle-235 SSoT と一致を確認済み）:

1. **本体削除**: `src/lib/achievements/` 一式（17 ファイル: 実装 9 + テスト 6 + CSS 2）・`src/app/(legacy)/achievements/` 一式（19 ファイル）
2. **layout 組み込み解除**: `(legacy)/layout.tsx`・`(new)/layout.tsx` の AchievementProvider
3. **Header/Footer**: `src/components/common/Header.tsx` の StreakBadge（+ Header.test.tsx）・`src/components/Footer/index.tsx` と `src/components/common/Footer.tsx` の「実績」リンク
4. **sitemap**: `src/app/sitemap.ts` の ACHIEVEMENTS_LAST_MODIFIED import・parseRequiredDate 呼び出し・`/achievements` エントリ
5. **trust-levels**: `src/lib/trust-levels.ts:41` の `"/achievements"` エントリ 1 行（B-432〔trust-levels 完全削除〕は独立タスクとして残し、本サイクルではエントリ削除のみ）
6. **bundle-budget**: `src/__tests__/bundle-budget.test.ts:85` のホワイトリストエントリ
7. **analytics**: `src/lib/analytics.ts` の trackAchievementUnlock（呼び出し元は実績のみ＝削除可・cycle-235 実測）
8. **recordPlay 呼び出し解除（7 ファイル）**: GameContainer×4（irodori / kanji-kanaru / nakamawake / yoji-kimeru）・QuizContainer・DailyFortuneCard・humor-dict RecordPlay（RecordPlay はコンポーネント自体が実績記録専用のため、呼び出し元ページごと整理。各テストも更新）
9. **fortuneStore 張り替え**: `src/play/fortune/fortuneStore.ts:16` の getTodayJst import を `@/lib/achievements/date`（re-export ラッパ）から `@/play/games/shared/_lib/crossGameProgress`（本体）への直参照に変更（fortuneStore は撤去対象外の現役コード。fortuneStore.test.ts も追従）
10. **その他テスト**: `(legacy)/play/daily/__tests__/page.test.tsx` 等、achievements を参照するテストの更新

方針:

- **旧 URL `/achievements` は標準 404**（リダイレクト・410 とも実装しない。cycle-235 で実測根拠から確定済み。B-338 実施時点の GA で 404 着地が観測されたら再判断）
- **localStorage キー `yolos-achievements` の掃除コードは追加しない**: 読み書きするコードが消えれば書き込みは止まり、来訪者のブラウザに残る既存データ（数 KB）は実害がない。実害なきもののためにコードを積まない（cycle-233 で確立した判断と同じ筋）
- **ゲームの StatsModal / 統計は撤去対象外**（実績と独立・cycle-235 T-1 実測）。recordPlay 解除がゲーム本体の動作に影響しないことを実機で確認する
- ルート削除を伴うため、build 前に `rm -rf .next`（docs/knowledge: route 削除で .next/types が stale 化する）
- 撤去は相互依存する 1 つのアトミックな変更（engine を消せば呼び出し元が壊れる）のため、builder 1 名に詳細チェックリスト付きで委任し、PM が 4 ゲートと grep で独立検証する

### 検討した他の選択肢と判断理由

| 案        | 内容                                          | 判断                                                                                                                                                |
| --------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1（採用） | B-338 実績システムの撤去                      | cycle-235 で判断確定・着手条件達成済み。本番に来訪者に見える表示バグが現存しており早期着手が推奨されている。P1 の Phase 11 のブロッカー連鎖の先頭。 |
| 2         | B-338 + B-432 を同時実施                      | B-432（trustLevel 完全削除）は独立タスクで、B-338 側は trust-levels.ts のエントリ 1 行削除で足りる。サイクルは最小限の原則に従い B-338 単独とする。 |
| 3         | B-342〜348 cheatsheet ブログ転換（Phase 9.2） | B-338 と独立で並行可だが、表示バグ現存の B-338 の方が来訪者への実害解消として優先度が高い。                                                         |
| 4         | B-510 道具箱計測データの初回分析              | 着手条件（デプロイから 2 週間・2026-06-26 目安）未達。                                                                                              |

### 計画にあたって参考にした情報

- docs/cycles/cycle-235.md「判断（T-3 の結論）」（撤去スコープの SSoT・fortuneStore 張り替えの根拠・旧 URL 標準 404 の根拠・実測データ）
- docs/design-migration-plan.md Phase 9.1（② 撤去採用の完了注記・旧 URL 標準 404）
- kickoff 時の grep/find 実測（2026-06-13）: `src/lib/achievements/` 17 ファイル・`(legacy)/achievements/` 19 ファイル・recordPlay 呼び出し元・sitemap.ts L24/130/216・trust-levels.ts L41・bundle-budget.test.ts L85・analytics.ts L54・achievements を import する非撤去対象（fortuneStore ほか）——すべて cycle-235 の棚卸しと一致
- docs/backlog.md（B-338 Notes: スコープ SSoT・早期着手推奨・ブログ化判断の引き継ぎ）

## キャリーオーバー

- 持ち越しの未完了作業はなし。B-338 は完了し backlog Done へ移動済み。
- 派生して backlog に反映した項目: (1) B-432〔trustLevel/trust-levels.ts 完全削除〕の Notes に「`/achievements` エントリは本サイクルで削除済み・残りエントリの一括削除がスコープ」を追記、(2) B-341〔辞典データのインタラクティブツール化検討〕を着手条件（B-338 完了）達成により Deferred → Queued へ移動。
- 移行計画の残: Phase 9.1 完了により Phase 9 の残は 9.2（cheatsheet ブログ転換 B-342〜349）・9.3（dictionary 移行 B-350〜354）。その先に P1 の Phase 11（legacy 撤去 B-337）。

## 補足事項

- kickoff 時の backlog 整理: Deferred → Queued の移動該当なし（B-510 の着手条件 2026-06-26 目安は未達・B-324/B-313 はその後続・他も条件未達）。Queued → Deferred の移動該当なし。B-338 を Queued → Active へ。完了時に B-338 → Done・B-341 を Deferred → Queued へ。
- localStorage キー `yolos-achievements` に残る既存データを消すクリーンアップコードはあえて追加しなかった（読み書きコード消失で書き込みは止まり、既存データ数 KB は実害なし。「実害なきもののためにコードを積まない」cycle-233 と同じ筋）。この判断は公開したブログ記事でも読者向けの教訓として扱った。
- コミット時に `.next/dev/types/validator.ts` の stale 型で pre-commit の typecheck が 2 回失敗した。原因はレビュー用にサブエージェントが起動した next サーバが `.next` を再生成し続けていたこと。next プロセス停止 + `rm -rf .next` で解消（ルート削除を含むサイクルでの既知挙動・docs/knowledge の Dynamic Workflows 運用知見②と同型）。成果物への影響はなし。
- 旧 URL `/achievements` はリダイレクト・410 とも実装せず標準 404（実機確認済み）。B-338 実施後の GA で 404 着地が観測されたら再判断する（cycle-235 の方針どおり）。

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
