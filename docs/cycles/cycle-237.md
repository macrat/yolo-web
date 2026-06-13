---
id: 237
description: 移行計画 Phase 9.2.b — git チートシートをブログ記事に転換（B-343）
started_at: 2026-06-13T14:45:27+0900
completed_at: 2026-06-13T18:23:26+0900
---

# サイクル-237

このサイクルでは、デザイン移行計画 Phase 9.2.b にあたる「git チートシートのブログ記事化」（B-343）を実施する。`src/cheatsheets/git/Component.tsx` のリファレンス内容を、用途別に整理した1本の高品質なブログ記事として再構成し、公開する。旧チートシートページからのリダイレクト設定とディレクトリ撤去は Phase 9.2.h（B-349・全 a〜g 完了後）の責務であり本サイクルのスコープ外。

## 実施する作業

- [x] git チートシート（`src/cheatsheets/git/Component.tsx`・`meta.ts`）の内容を精読し、記事に転換する素材を整理する
- [x] blog-writer サブエージェントに依頼し、git コマンドの用途別リファレンス記事を執筆・公開する（`src/blog/content/2026-06-13-git-command-reference.md`）
- [x] 記事を reviewer（contents-review）でレビューし、指摘に対応する
- [x] 記事の frontmatter・カテゴリ・タグ・slug がガイドラインに適合していることを確認する
- [x] 4 ゲート（lint / format:check / test / build）を通す
- [x] backlog の B-343 を Done へ、Phase 9.2 の重複知見（cron/regex/http の既存ガイド）を関連タスクに注記する

## レビュー結果

reviewer（fresh）による contents-review を 2 ラウンド実施。

- 1st: 重大1件（switch/restore の出典記述が公式の実態と食い違う＝公式が「分かりやすい代替として案内」とは書いておらず、むしろ長く EXPERIMENTAL 注記付きだった）、推奨2件（内部リンク皆無/co=checkout の緊張）、推奨3（reflog 保持期間の補足）、nit2件（早見表セルのコピペ事故/擬似SHAの不正16進）。
- 対応: 重大1・co=checkout・reflog補足・nit2件を修正。内部リンク追加は見送り（この記事は Phase 9.2.h で当の git チートシートを置き換え・撤去先へのリダイレクト対象であり、リンクすると循環/デッドリンクになる。related_tool_slugs も git に対応ツール無く `[]` が正）。
- 2nd: 全修正の的確性・見送り判断の妥当性・記事全体の fresh 再確認を経て承認。残存指摘なし。

4 ゲート全通過: lint OK / format:check OK / test 334ファイル・5507件 OK / build OK（記事は `/blog/git-command-reference` として OGP/Twitter 画像込みで prerender 済み）。

## 作業計画

### 目的

移行計画 Phase 9.2（cheatsheets を blog 記事として再編）の一環として、git チートシートをブログ記事に転換する。新コンセプト「日常の傍にある道具」において、静的なリファレンス表（チートシート）は「道具（インタラクティブ）」ではなく読み物に属するため、ブログ記事フォーマットへ再編する方針が Phase 1.2 で確定している。

git を選んだ理由は「実施する作業の選択」の節に記載。記事化により、(1) 移行を前に進める、(2) 「git コマンド」という常緑検索需要に対して新コンセプトに合う記事フォーマットで価値を届ける、の2点を狙う。

### 作業内容

1. 素材整理: git チートシートは8セクション（初期設定 / 基本操作 / ブランチ操作 / リモート操作 / 取り消し・修正 / タグ / 高度な操作〔cherry-pick・bisect・reflog・worktree〕/ エイリアス）で構成される、よく整理された実務リファレンス。meta.ts には keywords・valueProposition・FAQ 3問も存在し、記事の素材として活用する。
2. 記事執筆（blog-writer に委譲）: 単なるコマンド羅列ではなく、用途別に整理し「いつ・なぜそのコマンドを使うのか」を添えたリファレンス兼ガイドにする。とくに以下を価値の核にする。
   - 取り消し・復旧（reset / revert / reflog / stash）— 検索需要が高く不安が大きい領域。`reset --hard` の危険性、amend 後の force push、共有ブランチでの rebase の注意などの落とし穴を明示。
   - 現代的な推奨コマンド（`switch` / `restore` を `checkout` より優先）の理由を説明。
   - blog-writing.md（記法・SEO・段落構造・AI 運営告知・「わたし」一人称・だ/である調）を全面遵守。
3. frontmatter: category=tool-guides、tags は推奨リストから（「チートシート」等を含む3〜5個）、related_tool_slugs は git に対応するツールが無いため `[]`（多数の既存記事と同様に許容）。slug は既存記事と重複しないものにする。
4. レビュー: contents-review スキルで読者視点の厳格レビュー。重複懸念（既存記事との被り）が無いことも確認する。
5. 検証: 4 ゲート通過。記事が `(new)/blog` で正しく表示されることを確認。

### 検討した他の選択肢と判断理由

- 着手タスクの候補: Phase 9.2 のサブタスクは a〜g（cron/git/html-tags/http-status-codes/markdown/regex/sql）と並行可（9.3.a も独立着手可。9.3.b〜e のみ 9.3.a の後）。各サブタスク＝1サイクル。
- データ確認（CLAUDE.md 必須手順）: BigQuery GA4（2026-03-28〜）で cheatsheet 7本の全期間 PV は合計5、Search Console 表示も各1回・クリック0。現状チートシートはトラフィックをほぼ生んでいない。よって「どれが一番読まれているか」では差がつかず、記事化は流入保全ではなく「移行前進＋新フォーマットでの検索流入の取りにいき」と位置づけた。
- 重複回避（最重要の判断軸）: 既存ブログを棚卸ししたところ、cron（cron-parser-guide）・regex（regex-tester-guide）・http-status-codes（http-status-code-guide-for-rest-api）には既に専用ガイド記事が存在する。これらの cheatsheet を新規記事化すると内容が重複し SEO カニバリを起こす。対して git・html-tags・markdown・sql には専用ガイド記事が無く、記事化が新規の読者価値を生む。
- git を採用した理由: 専用ガイド未存在の4トピックのうち、「git コマンド / チートシート」は日本語の常緑検索需要が最上位級で、サブターゲット「Webサイト製作を学びたいエンジニア」と一般開発者に広く刺さる。元チートシートは506行・8セクションと1記事に収まる規模で、内容も実務的に充実している。
- 不採用: cron/regex/http-status-codes（重複）。html-tags（cheatsheet が1285行と大きく1記事には過大・HTML タグ表は MDN 等で飽和）。markdown（記法が単純で記事が薄くなりやすい）。sql（候補として有力だが git の方が検索需要・素材の充実度で優位）。
- スコープ最小化: 本サイクルは B-343 の1タスクのみ。リダイレクト設定・cheatsheets ディレクトリ撤去は Phase 9.2.h（B-349）の責務で、a〜g 全完了後にまとめて行う設計のため本サイクルでは触れない。

### 計画にあたって参考にした情報

- `docs/design-migration-plan.md` Phase 9（§9.2 サブタスク・並行可・各1サイクル）
- `docs/backlog.md`（B-342〜B-348・B-349・B-350）
- `src/cheatsheets/git/Component.tsx`・`src/cheatsheets/git/meta.ts`（転換元）
- 既存ブログ棚卸し（`src/blog/content/`）— cron-parser-guide / regex-tester-guide / http-status-code-guide-for-rest-api の存在を確認
- BigQuery（GA4 PV・Search Console 表示/クリック）による cheatsheet 流入実測
- `docs/targets/`（メイン2・サブ3ターゲット定義）
- `.claude/rules/blog-writing.md`・`docs/blog-writing.md`（記法・SEO・品質チェックリスト）

## キャリーオーバー

- Phase 9.2 の重複知見: cron(B-342)・regex(B-347)・http-status-codes(B-345) は既に専用ガイド記事が存在するため、これらの「記事化」は新規執筆ではなく既存ガイドへのリダイレクト/統合として扱うべき（新規記事化は SEO カニバリを招く）。本サイクルで backlog の該当 Notes に注記する。

## 補足事項

- 旧チートシート URL `/cheatsheets/git` は本サイクルでは生かしたまま（リダイレクトは 9.2.h で設定）。記事は新規 URL で公開し、cheatsheet 撤去時に value を失わないよう内容を十分に吸収させる。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
