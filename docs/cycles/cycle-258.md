---
id: 258
description: 辞典FAQ・メタ説明文に残る確定誤情報（漢字80字・四字熟語101語）の是正。ハードコードを実データ長(.length)算出に置き換え、本番の誤情報を解消する。
started_at: 2026-06-21T21:04:55+0900
completed_at: null
---

# サイクル-258

このサイクルでは、辞典ページの本番に残存している**確定誤情報**を是正する（B-536）。漢字辞典のFAQと辞典トップのメタ説明文は「漢字80字」、四字熟語辞典のFAQ・メタ説明文は「四字熟語101語」とハードコードされているが、実データはそれぞれ **2136字・400語**。来訪者に間違った収録数を見せ続けている状態（憲法ルール2/4違反）を解消する。

cycle-257 の完了処理（C-2）で検出された既存バグ。本文・一覧ページの収録数は既に `.length` 動的算出で正しく表示されているが、**メタ description と FAQ 回答文だけが古いハードコードのまま取り残されていた**。同種は B-409（grep件数2139 ≠ 配列件数2136 の轍）と同型のため、今回も grep ではなく配列 `.length` を一次情報とする。

## 実施する作業

- [ ] `src/dictionary/_lib/dictionary-meta.ts` の kanji FAQ 回答を是正（「小学校で学習する教育漢字を中心に80字」→ 実データに即した枠組み＋`getAllKanji().length` 由来の件数）
- [ ] `src/dictionary/_lib/dictionary-meta.ts` の yoji FAQ 回答を是正（「101語」→ `getAllYoji().length` 由来の件数。カテゴリ数10は実データ確認済で維持）
- [ ] `src/app/(legacy)/dictionary/yoji/page.tsx` のメタ description 3箇所（description / openGraph / twitter）の「101語」を `.length` 算出に置換
- [ ] `src/app/(legacy)/dictionary/page.tsx` のメタ description 3箇所（description / openGraph / twitter）の「漢字80字、四字熟語101語、伝統色250色、ユーモア定義30語」を全件 `.length` 算出に置換
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` で退行が無いことを確認（テストの 2136 期待値も整合）
- [ ] 変更を reviewer でレビュー（コード整合）＋ FAQ・メタ文言の事実正確性を点検し、指摘に対応
- [ ] Playwright で漢字辞典詳細・四字熟語辞典トップ/詳細の FAQ と表示を目視確認（誤情報が消えたこと）

## 作業計画

### 目的

本番に出ている確定誤情報を消し、来訪者に正しい収録数を伝える。あわせて、同じ取り残しが二度と起きないよう、収録数は表示・メタ・FAQ のすべてで**データ長（`.length`）を一次情報**とする構造に揃える。「80字」「101語」という古い数値は、辞典が小規模だった初期（cycle-251以前）の名残であり、現在の規模（漢字=常用漢字2136字・四字熟語400語）と食い違っている。数字が小さく見えること自体が、競合に対する実際の充実度を過小に伝える来訪者価値の毀損でもある。

### 作業内容

調査で確定した誤情報の分布（実データ: 漢字 `kanji-data.json`=2136件、四字熟語 `yoji-data.json`=400件、伝統色=250件、ユーモア=30件。後二者は現状正しい）:

1. **`src/dictionary/_lib/dictionary-meta.ts`（最も影響大: FAQPage JSON-LD ＋本文として全詳細ページに露出）**
   - kanji FAQ（L14）: 「小学校で学習する教育漢字を中心に80字を収録しています。…」
     - 数値だけでなく**枠組みも誤り**。2136字は「小学校中心」ではなく**常用漢字全体**。漢字トップ(`kanji/page.tsx`)のメタが既に採用している正しい枠組み「常用漢字2,136字」に合わせて回答文ごと書き直す。件数は `getAllKanji().length` 由来にする。
   - yoji FAQ（L45）: 「現在101語を収録しています。…10のカテゴリに分類…」→ 件数を `getAllYoji().length` 由来に。カテゴリ「10」は実データの distinct category 数が10で正しいため維持。
   - 実装: 当ファイルの全消費者（`sitemap.ts`・各 detail `page.tsx`）はサーバー/ビルド時のみ。`getAllKanji`/`getAllYoji` を import しても client bundle は肥大化せず、`kanji.ts`/`yoji.ts` は `dictionary-meta.ts` を import しないため循環も無い（確認済）。モジュール冒頭で件数を算出し、FAQ 回答をテンプレートリテラルで構成する。

2. **`src/app/(legacy)/dictionary/yoji/page.tsx`** メタ description 3箇所（L14/18/26）の「101語」→ `getAllYoji().length` 算出。本文（L52）は既に `{allYoji.length}` で正しい。

3. **`src/app/(legacy)/dictionary/page.tsx`** メタ description 3箇所（L14/28/37）の集約文「漢字80字、四字熟語101語、伝統色250色、ユーモア定義30語」を、4種すべて `.length` 算出のテンプレートリテラルに置換（kanji/yoji は誤りの是正、colors/humor は現状正しいが、同一文字列を動的化する以上ハードコードのまま残すのは不整合かつ次の B-536 を生むため一括で `.length` 化）。本文の各 `{xxxCount}字収録` は既に正しい。

注: 漢字トップ(`kanji/page.tsx`)のメタ・本文は既に「2,136字」「`{allKanji.length}`」で**正しいため変更不要**。

### 検討した他の選択肢と判断理由

- **数値だけハードコードで差し替える（80→2136, 101→400）**: 却下。再びデータ拡充時に取り残される（B-409/B-536 と同型の再発）。CLAUDE.md の B-536 注記どおり `.length` 由来にする。
- **kanji FAQ を「80→2136」と数字だけ直す**: 却下。「小学校で学習する教育漢字を中心に」という**枠組み自体が現データと不整合**（2136=常用漢字全体）。数字を直しても文意が誤ったまま。回答文ごと是正する。
- **正しい colors(250)/humor(30) も含め全辞典の収録数を一気に `.length` 化（colors/page.tsx の250など）**: 本サイクルでは見送り。`colors/page.tsx` のタイトル/説明の「250色」、`dictionary-meta.ts` の colors `valueProposition`「250色」、ツール `traditional-color-palette/meta.ts`「250色」等は**現状正しい**ハードコード。誤情報の緊急是正（kanji/yoji）と、その自然な影響範囲（同一文字列に同居する集約メタ）に絞り、現状正しい予防的置換は別 backlog（P4）に切り出してタスクを肥大化させない。
- **ブログ記事の「80字」「101語」も直す**: 却下。`2026-02-19`「漢字を50→80字に拡充」等は**執筆時点で真だった歴史的記録**。後から書き換えるのは記録の改竄であり誠実さに反する（憲法ルール3 の精神）。本番の現在進行形の事実主張（辞典の収録数表示）のみを是正対象とする。

### 計画にあたって参考にした情報

- 実データ件数の一次確認: `node -e` で `kanji-data.json`=2136 / `yoji-data.json`=400 / `traditional-colors.json`=250、`src/humor-dict/data.ts` の slug 数=30 を実測。
- 誤情報分布: `grep` で `src/app/(legacy)/dictionary/**` と `dictionary-meta.ts` を全走査。
- 消費経路・循環・client境界: `dictionary-meta.ts` の import 元（`sitemap.ts`・detail pages＝全てサーバー）、`kanji.ts`/`yoji.ts` が meta を import しないことを確認。
- 本件は外部仕様（SEO機能・ブラウザAPI・Schema.org・第三者プラットフォーム）への依存を含まない内部データ整合の是正のため、外部一次資料の再確認は不要。FAQPage JSON-LD は既存実装(`generateFaqPageJsonLd`)を流用するのみで仕様判断を伴わない。

## キャリーオーバー

- **現状正しいが予防的に `.length` 化すべきハードコード収録数**（P4・別 backlog 起票）: `colors/page.tsx` の「250色」（title/description/og/twitter 計4箇所）、`dictionary-meta.ts` colors `valueProposition`「250色」、`tools/traditional-color-palette/meta.ts`「250色」など。現状は正しいため緊急性は低いが、B-409/B-536 と同型の再発予兆。

## 補足事項

- MCP（GA4・BigQuery・Playwright）を使うサブエージェントは foreground で実行する（CLAUDE.md 規則）。
- 作業は小さく密結合な是正（同一の「ハードコード収録数→`.length`」パターン）のため、実装は builder 1名に集約し、reviewer でコード整合と文言の事実正確性を点検する。
- FAQ 回答は FAQPage JSON-LD として Google にインデックスされるため、誤情報の是正はそのまま SEO 上もプラス（虚偽の構造化データの解消）。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
