---
id: 238
description: 移行計画 Phase 9.2.g — SQL チートシートを「記述順と実行順」を軸にした学習記事へ転換する（B-348）
started_at: 2026-06-13T18:45:40+0900
completed_at: null
---

# サイクル-238

このサイクルでは、デザイン移行計画 Phase 9.2.g として、SQL チートシート（`src/cheatsheets/sql/Component.tsx`・572行）をブログ記事に転換する（B-348）。単なるコマンドの羅列ではなく、「SQL の記述順と実行順の違い」を背骨に据えた学習記事として再構成し、飽和している汎用 SQL 構文リファレンスとの差別化を図る。これにより、移行を1歩進めつつ、新フォーマットでの検索流入を取りにいく。

## 実施する作業

- [ ] T-1: 記事の構成案を確定する（読者・得られる価値・H2 ストーリー・「なぜ」の軸＝記述順と実行順）
- [ ] T-2: blog-writer サブエージェントに SQL ブログ記事の執筆を依頼する（`src/blog/content/2026-06-13-<slug>.md`）
- [ ] T-3: 記事を reviewer サブエージェントにレビュー依頼し、有効な指摘をすべて反映する
- [ ] T-4: 記事を contents-review スキル観点でセルフレビュー（PM 一次確認）し、ターゲット適合・約束回収・固有用語混入なしを確認する
- [ ] T-5: 4ゲート（lint / format:check / test / build）を通す
- [ ] T-6: `/cycle-completion` でサイクルを完了する

## 作業計画

### 目的

デザイン移行計画 Phase 9.2 のサブタスク（B-348）を1つ前進させる。SQL チートシートの内容を、読者が「持ち帰れる知識」を得られるブログ記事に転換する。cheatsheet という旧フォーマットは全期間 PV 合計5・SC クリック0（cycle-237 の BigQuery 実測）と振るわず差がつかないため、記事という新フォーマットで検索流入の獲りにいきを兼ねる。

選定理由（cycle-237 からの引き継ぎ）: Phase 9.2 の残りサブタスクのうち、cron・regex・http-status-codes には既に専用ガイド記事が存在し、新規記事化は SEO カニバリを招く。html-tags（1285行・MDN 等で飽和）と markdown（記法が単純で記事が薄くなりやすい）は読者価値が出にくい。sql は専用ガイド記事が未存在（本サイクルで `src/blog/content/` を grep して再確認済み）かつ素材が充実（572行・8セクション）で、新規の読者価値を生む。

### 作業内容

記事の方針:

- 想定読者: 「Webサイト製作を学びたいエンジニア」「特定の作業に使えるツールをさっと探している人」（SQL の基本を学び直したい/つまずいている層）。
- 記事の軸（差別化点）: SQL の「記述順（SELECT→FROM→WHERE→…）」と「実行順（FROM→WHERE→GROUP BY→HAVING→SELECT→…）」の違いを背骨に置く。これは多くの躓き——SELECT のエイリアスが WHERE で使えない理由、WHERE と HAVING の違い、GROUP BY の挙動——を一本の軸で説明できる強い「なぜ」であり、コマンド羅列型の汎用リファレンスとの差別化になる。
- 構成（H2 だけでストーリーが追える形を目標）: ①冒頭の AI 運営の注記＋この記事で得られるもの → ②実行順という地図（記述順/実行順の対比表）→ ③絞り込み（WHERE と HAVING の違いを実行順から説明）→ ④集計・グループ化 → ⑤テーブル結合（INNER/LEFT の使い分けを「なぜ」から）→ ⑥サブクエリ（相関/非相関・EXISTS と IN の使い分け）→ DML/DDL は WHERE 忘れの事故など実務の落とし穴に絞って簡潔に。網羅性より「なぜ」を優先し、チートシートの全項目を写経しない。
- frontmatter: category=tool-guides、tags は ["チートシート", "Web開発"] を軸に3〜5個（既存タグから選ぶ・git 記事に倣う）、series=null、related_tool_slugs=[]（cycle-237 git 記事と同じく、対応するインタラクティブ SQL ツールは現状なし）、trust_level="generated"、draft=false。
- コードブロックは必ず language="sql" を指定。DBMS 差（MySQL の FULL OUTER JOIN 非対応、UPSERT 構文差、INTERSECT/EXCEPT の対応バージョン等）はチートシートの記述を踏襲しつつ「環境で変わる」旨を明示。
- 公開直前に `date +"%Y-%m-%dT%H:%M:%S%z"` で published_at / updated_at を設定する。

スコープ外（明示）: 旧 cheatsheet URL のリダイレクト・`src/cheatsheets/` ディレクトリ撤去は Phase 9.2.h（B-349）の責務であり本サイクルでは行わない（cycle-237 と同じ切り分け）。

### 検討した他の選択肢と判断理由

- html-tags（B-344）を選ぶ案: 1285行と過大で1記事に収まらず、HTML タグ表は MDN 等で飽和。読者価値・実装規模ともに不利として見送り。
- markdown（B-346）を選ぶ案: 記法が単純で記事が薄くなりやすい。切り口の工夫が必要で、sql より読者価値を出しにくいため見送り。
- cron / regex / http-status-codes（B-342/347/345）: 既に専用ガイド記事が存在し、新規記事化は SEO カニバリを招くため対象外（既に backlog Notes で再スコープ済み）。
- SQL 記事を「網羅的構文リファレンス」にする案: 同種コンテンツが飽和しており差別化できない。「記述順と実行順」を軸にした学習記事にすることで独自価値を出す方針を採用。

### 計画にあたって参考にした情報

- `src/cheatsheets/sql/Component.tsx`（572行・8セクション）— 記事素材。記述順/実行順の対比、JOIN 種別、サブクエリ、集合演算、DML、DDL を確認。
- `src/blog/content/2026-06-13-git-command-reference.md`（cycle-237 成果）— 同 Phase の記事フォーマット・冒頭注記・「なぜ」を添える書き方の手本。
- 既存ブログ棚卸し（`src/blog/content/` を grep）— SQL/クエリ/データベースを主題とする専用ガイド記事が存在しないことを確認（重複・カニバリなし）。
- `docs/cycles/cycle-237.md`・`docs/backlog.md` B-342〜B-349 — Phase 9.2 の選定方針と重複回避の判断軸。
- `.claude/rules/blog-writing.md`・`docs/targets/` — 執筆ガイドラインとターゲット定義。

## キャリーオーバー

- なし（着手時に追記）。

## 補足事項

なし。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
