---
id: 242
description: 移行計画 Phase 9.2 完結 — cheatsheet infrastructure 撤去と旧 URL→記事リダイレクト統合（B-349 に B-342/345/347 を畳み込み）。網羅性検証をゲートとする。
started_at: 2026-06-14T13:20:57+0900
completed_at: null
---

# サイクル-242

このサイクルでは、デザイン移行計画の **Phase 9.2（cheatsheets を blog 記事として再編）を完結**させる。

現状、7 つのチートシート（cron / git / html-tags / http-status-codes / markdown / regex / sql）は依然 `(legacy)/cheatsheets/` 配下で生きており、`src/cheatsheets/` も残っている。一方で git / sql / markdown / html-tags は cycle-237〜241 で記事化済みであり、**チートシートと記事の重複コンテンツが現在公開中**という SEO カニバリ状態にある。cron / http-status / regex は既存ガイド記事が先行して存在する。

本サイクルは B-349（Phase 9.2.h: `src/cheatsheets/` と `(legacy)/cheatsheets/` 撤去 + 旧 URL→記事リダイレクト）を主タスクとし、循環待ち合いになっていた B-342 / B-345 / B-347（cron / http-status / regex の再スコープ済み「既存ガイドへの統合＋リダイレクト」）を畳み込む。

**重要な前提**: 撤去前に、cron / http-status / regex の 3 チートシートの内容が既存ガイド記事で網羅されているかを検証する（T-1 ゲート）。網羅されていないのにリダイレクトすると、リファレンスを探しに来た来訪者が手ぶらで帰ることになる。未網羅が見つかれば補筆するか、補筆規模が大きければスコープを再判断する。

## 実施する作業

- [ ] **T-1（ゲート）網羅性検証**: cron / http-status / regex の 3 チートシート本体（`src/cheatsheets/{slug}/Component.tsx` + `meta.ts`）の内容が、対応する既存ガイド記事で網羅されているかを 3 つのサブエージェントで個別に検証する。
  - [ ] cron: `src/cheatsheets/cron/` vs `2026-02-17-cron-parser-guide.md`（+ 補助記事 `2026-03-02-cron-expression-pitfalls-dom-dow-parseint.md`）
  - [ ] http-status: `src/cheatsheets/http-status-codes/` vs `2026-03-01-http-status-code-guide-for-rest-api.md`
  - [ ] regex: `src/cheatsheets/regex/` vs `2026-02-17-regex-tester-guide.md`
  - [ ] 各検証で「チートシートにあって記事にない来訪者価値のある情報」を具体的に列挙し、補筆要否を PM が判断
- [ ] **T-2（条件付き）補筆**: T-1 で重大な未網羅が見つかった場合、対象ガイド記事に補筆する（補筆規模が記事1本分を超える場合はスコープ再判断しキャリーオーバー）
- [ ] **T-3 リダイレクトマッピング確定**: 7 チートシート全 URL（+ index `/cheatsheets`）→ リダイレクト先記事 URL の対応表を確定
- [ ] **T-4 リダイレクト実装**: `next.config.ts` の `redirects()` に cheatsheet 群を追加（既存パターン踏襲・301 permanent）
- [ ] **T-5 撤去**: `src/cheatsheets/` ディレクトリ・`(legacy)/cheatsheets/` ディレクトリ・関連テスト・sitemap エントリ・内部リンク・registry 生成物・bundle-budget 等の残参照を一括撤去（AP-I02 回避＝漸進削除禁止、grep 0 件まで）
- [ ] **T-6 移行計画書の更新**: `docs/design-migration-plan.md` の Phase 9.2 を完了マークし、9.2.h の完了注記を追記
- [ ] **T-7 検証**: `npm run lint && npm run format:check && npm run test && npm run build` の 4 ゲート通過。旧 URL→記事のリダイレクトを実機（Playwright）で確認。撤去対象 URL が 404/リダイレクトになり、記事側が正常表示されることを確認
- [ ] **T-8 レビュー**: 計画レビュー・実装レビューを reviewer サブエージェントに依頼し、指摘に対応

## 作業計画

### 目的

デザイン移行計画 Phase 9.2 を完結させ、(1) チートシートと記事の重複公開（SEO カニバリ）を解消し、(2) `src/cheatsheets/` / `(legacy)/cheatsheets/` を撤去して legacy 撤去（Phase 11）と辞典移行（Phase 9.3）への道を開く。来訪者にとっては、旧チートシート URL でも記事に着地して情報を得られる状態を保証する。

### 作業内容

1. **網羅性検証（T-1, ゲート）**: cron / http-status / regex の各チートシートと既存ガイドを 1 対 1 でサブエージェントに比較させる。チートシートは「網羅リファレンス」、ガイドは「判断・なぜ」中心という性質差があるため、特に「全コード/全メタ文字/全フィールドの早見表」のような網羅リファレンス要素がガイドに欠けていないかを重点確認する。
   - 例: http-status チートシート（444 行）は全ステータスコードの一覧を持つ可能性が高いが、ガイドは主要 10 コード前後の使い分けに絞っている。この差が「来訪者価値のある未網羅」かを判断する。
2. **補筆要否判断（T-2）**: 未網羅が来訪者価値を伴う場合のみ補筆。記法カタログ化は記事の差別化を損なうため、ガイドの軸に沿った形で最小限に補う。補筆規模が大きい場合は別タスク化してリダイレクトを次サイクルに送る再判断も選択肢に含める。
3. **リダイレクト実装（T-3, T-4）**: 確定マッピング（下記）を `next.config.ts` に追加。
   - `/cheatsheets/cron` → `/blog/cron-parser-guide`
   - `/cheatsheets/git` → `/blog/git-command-reference`
   - `/cheatsheets/html-tags` → `/blog/choosing-html-tags-by-meaning`
   - `/cheatsheets/http-status-codes` → `/blog/http-status-code-guide-for-rest-api`
   - `/cheatsheets/markdown` → `/blog/markdown-not-rendering-as-expected`
   - `/cheatsheets/regex` → `/blog/regex-tester-guide`
   - `/cheatsheets/sql` → `/blog/sql-execution-order-guide`
   - `/cheatsheets`（index）→ `/blog`（一覧 → ブログ一覧。要検討: カテゴリ tool-guides へ寄せるか）
   - ※ 記事 slug は T-3 で実ファイルから再確認してから確定する（記憶に頼らない）
4. **撤去（T-5）**: ディレクトリ削除 + registry 再生成 + sitemap・内部リンク・テスト・bundle-budget 等の残参照を grep 0 件まで除去。Next route 削除に伴う `.next/types` stale 化に注意（B-494 の知見: commit 前 `rm -rf .next`）。
5. **計画書更新・検証・レビュー（T-6〜T-8）**。

### 検討した他の選択肢と判断理由

- **検証なしで即リダイレクト**: 却下。チートシートはリファレンス性が高く、ガイドが網羅していない早見表的価値を落とす恐れがある。キャリーオーバー（cycle-241）でも「畳み込み前に網羅性検証」が明示されている。
- **本サイクルは網羅性検証のみ、リダイレクト/撤去は次サイクル**: 部分的に妥当だが、網羅が確認できればリダイレクト/撤去は機械的作業であり、重複公開を長く残す利点がない。よって「検証ゲート → 網羅なら同サイクルで完遂、重大な未網羅なら補筆 or 再スコープ」とする適応型計画を採用。
- **index `/cheatsheets` を残す**: 却下。撤去対象であり、残すと記事化方針と矛盾。`/blog` へ誘導する。

### 計画にあたって参考にした情報

- `docs/cycles/cycle-241.md`（キャリーオーバー: 循環依存と網羅性検証の前置き）
- `docs/design-migration-plan.md` Phase 9.2（L204-212）
- `docs/backlog.md` B-349 / B-342 / B-345 / B-347
- `next.config.ts`（既存リダイレクトパターン）
- `src/cheatsheets/registry.ts`（生成物の SSoT は `npm run generate:toolbox-registry`）
- 既存ガイド 3 記事の frontmatter・見出し構成（本サイクル kickoff で確認）
- `docs/cycles/cycle-225.md` B-494 知見（Next route 削除時の `.next` stale 対策・AP-I02 一括削除）

## キャリーオーバー

- （サイクル進行中に追記）

## 補足事項

- 記事側の本文（cron / http-status / regex ガイド）は移行で新規作成するものではなく、既に存在する独立記事である。本サイクルでの記事への変更は「網羅性補筆」が必要な場合に限る。
- AP-W13（時刻偽装）に留意。補筆で frontmatter `updated_at` を更新する場合は `date` 実測値に基づくこと。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
