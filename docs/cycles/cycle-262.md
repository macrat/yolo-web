---
id: 262
description: B-350 デザイン移行計画 Phase 9.3.a「dictionary トップ `/dictionary` の (new) デザイン体系への移行」。cycle-261（B-539）でデザインシステムを診断中心へ再適合し B-350 の前提が整ったため、辞典トップを標準1ページ移行手順で (new)/ へ移す。辞典は診断を支える「文化層」だが、移行対象はトップ index ページであり、cycle-261 の方向決定（拡張は診断タッチポイントに限定・辞典本文/道具の austere 基調は維持）に従い、診断の視覚言語拡張（結果固有色・象徴絵文字）は適用せず標準の (new) austere 基調で移行する。本サイクルはトップ1ページのみ（colors/humor/kanji/yoji 系統は B-351〜354 で後続）。
started_at: 2026-06-22T22:59:57+0900
completed_at: null
---

# サイクル-262

このサイクルでは **B-350（デザイン移行計画 Phase 9.3.a: dictionary トップ移行）** を実施する。

`(legacy)/dictionary/page.tsx`（`/dictionary` トップ）を、`(new)/` の新デザイン体系へ移行する。これは `docs/design-migration-plan.md` の Phase 9.3.a に相当し、辞典4系統（colors / humor / kanji / yoji）移行（B-351〜B-354・現在 Deferred で本タスク待ち）の先頭に位置する。本タスク完了でそれらの着手条件が解放される。

## 位置づけと前提

- **なぜ今か**: cycle-261（B-539）でデザインシステムを診断中心コンセプトへ再適合し、設計3文書の宙吊り注記を解消した。cycle-261 の計画は「B-350 は B-539 後に実施」と順序を明示しており、その前提が満たされた。デザイン体系の統一と legacy 撤去（Phase 11）に向けたコード健全化は道具箱の地位と無関係に価値があり、辞典移行は概念非依存（cycle-259 で要否確認済 = 実施）。
- **重要な設計判断（austere 基調で移行・診断拡張は適用しない）**: 辞典は site-concept の3層では診断を支える「文化層」だが、cycle-261 の方向決定（cycle-261.md L126-129）は「拡張・改訂は**診断のタッチポイントに限定**し、道具・**辞典本文**・道具箱の austere な基調は維持する」と明記している。したがって辞典トップの移行は、結果固有色・象徴絵文字・伝統色アイデンティティといった診断の視覚言語拡張を**適用しない**。既に移行済みの index ページ（`/tools`・`/blog`）と同じ標準 (new) austere 基調（無彩トークン・Lucide 線画・絵文字不使用・Panel・8px グリッド）に揃える。伝統色辞典への「橋渡し」の視覚設計は診断面の話であって辞典トップ自身の役割ではない。
- **スコープはトップ1ページのみ**: 移行計画は 9.3.a（トップ）→ 9.3.b〜e（各系統）を**各1サイクル**で分割する方針。本サイクルは `/dictionary` トップだけを移行する。`colors`/`humor`/`kanji`/`yoji` の各 index・詳細は legacy に残置し、後続サイクル（B-351〜354）で移行する。

## 移行スコープの確認（接地済みの技術判断）

計画時に現物を確認した結果、以下を確定した:

- 対象は `src/app/(legacy)/dictionary/page.tsx`（99行）と `page.module.css`。import している共通コンポーネントは `@/components/common/Breadcrumb` の1つのみ。`TrustLevelBadge` は不使用（撤去対象なし）。
- 収録数は既に `getAllKanji().length` 等の動的算出（cycle-258 B-536 で是正済み）。ハードコード件数は無い。
- `(legacy)/dictionary/layout.tsx` は `max-width` ラッパー div のみで、4系統サブルートが共有している。**トップ `page.tsx` だけを `(new)/dictionary/page.tsx` へ移すと、layout.tsx は legacy に残り、未移行のサブルート（colors/humor/kanji/yoji）が引き続きそれを使う**ため壊れない。新トップ側は標準手順どおり最上位コンテナに `max-width: 1200px; margin: 0 auto` を自前で記載する（`var(--max-width)` は (new) では未定義のため使わない）。
- トップは hero（h1＋説明文）＋4枚のセクションカード（各系統への Link・glyph アイコン「漢/四/色/笑」・説明・収録数）で構成。移行後も4系統へのリンク先は未移行の legacy ページのままで崩れないこと（段階移行の整合性）を検証する。

## 実施する作業

- [ ] **1. 接地（現状の来訪者体験の把握）**
  - [ ] 1a. GA で `/dictionary` トップおよび辞典各系統の流入・回遊を確認（来訪者が辞典トップをどう使っているか。直接着地か回遊起点か）。foreground サブエージェントで実施
  - [ ] 1b. 現状 `/dictionary` トップを Playwright でスクショ（w360/w1280・light/dark）。移行前の基準として保存
- [ ] **2. 移行設計の確定**
  - [ ] 2a. 参照パターン確認: 移行済み index ページ（`/tools`・`/blog`）の (new) 実装・`/frontend-design` SKILL・`DESIGN.md`（特に index/カードのパターン・BreadcrumbList 構造化データの既存パターン）を確認
  - [ ] 2b. austere 基調での移行方針を確定（診断拡張は不適用・glyph アイコンの扱い＝絵文字不使用方針との整合・Panel/カードの新パターンへの再設計）
- [ ] **3. 移行実装（builder サブエージェント）**
  - [ ] 3a. `git mv (legacy)/dictionary/page.tsx (new)/dictionary/page.tsx`＋`page.module.css`。import パス `@/components/common/Breadcrumb`→`@/components/Breadcrumb`（新版存在確認）
  - [ ] 3b. CSS Module トークン置換（旧 `--color-*`→新トークン・`:root.dark`→`:global(:root.dark)`）＋ DESIGN.md に従いデザイン適用（Panel/カード・タイポ・Lucide・絵文字不使用・角丸規約・a11y: 44px/focus-visible/aria-current/コントラスト4.5:1・max-width 1200px 自前ラッパー）
  - [ ] 3c. 構造化データ確認（BreadcrumbList JSON-LD を既存移行済みページと同パターンで担保）。metadata は sharedMetadata 整合
- [ ] **4. 検証**
  - [ ] 4a. `npm run lint && npm run format:check && npm run test && npm run build` が全て成功
  - [ ] 4b. Playwright で移行後 `/dictionary` を w360/w1280・light/dark でスクショし移行前と比較（同等以上）。合格条件: 旧 `components/common` 由来ハッシュ class 不在・コントラスト4.5:1・タップ44px・focus-visible・aria-current・w1900 で main 直下幅<1300px
  - [ ] 4c. 段階移行の整合性: 未移行サブ系統（colors/humor/kanji/yoji）が legacy のまま破損しない・4枚カードのリンク先が動く・Header/Footer 動線・戻る/進むで破綻なし
- [ ] **5. レビュー（白紙 reviewer）**
  - [ ] 5a. 成果物レビュー（移行の同等以上・austere 基調遵守＝診断拡張の誤混入が無い・段階移行整合・a11y・構造化データ）。指摘対応
- [ ] **6. 完了処理（`/cycle-completion`）**

## 作業計画

### 目的

`/dictionary` トップを新デザイン体系へ移行し、来訪者体験を損なわず（視覚的・機能的に同等以上で）デザイン混在を一歩解消する。同時に、Deferred で待機している辞典4系統移行（B-351〜354）の着手条件を解放する。最終的な来訪者価値は「辞典という文化層が、サイト全体と一貫した上質な見た目で、診断来訪者が安心して回遊できる入口になること」。

### 作業内容

上記「実施する作業」のとおり。要点は3つ。

1. **接地を先に**（作業1）。抽象論で進めず、現状の `/dictionary` を GA と実スクショで掴んでから移行する（標準手順 step9 の before/after 比較の基準作り）。
2. **austere 基調を守る**（作業2b・3）。辞典トップは文化層だが診断面ではない。cycle-261 の方向決定（拡張は診断タッチポイント限定・辞典本文は austere 維持）に従い、結果固有色・象徴絵文字などの診断拡張を**持ち込まない**。移行済み `/tools`・`/blog` index と同じ標準 (new) パターンに揃える。
3. **スコープをトップ1ページに限定**（タスクを小さく保つ）。サブ系統は legacy 残置で壊さず、後続サイクルへ。`page.tsx` だけ git mv し layout.tsx は legacy に残す（サブルートが共有しているため）。

タスクはサブエージェントへ小さく委譲する（移行実装は builder・レビューは白紙 reviewer）。MCP（GA・Playwright）を使うサブエージェントは foreground で起動する（CLAUDE.md）。

### 検討した他の選択肢と判断理由

- **B-540（AP集 規約準拠クリーンアップ）を先にやる**: 不採用。P1 だがプロセス文書整備で来訪者価値の連鎖から遠い。cycle-261 で設計システムの再適合が完了した今、その設計体系を下位ページへ展開する移行チェーン（B-350→351〜354）を進める方が、来訪者の見る画面に直結し、legacy 撤去（Phase 11）にも前進する。B-540 は単独で別サイクル。
- **辞典4系統を一気に移行する**: 不採用。移行計画が 9.3.a→b〜e を各1サイクルに分割する方針（タスクを小さく保つ原則・トレーサビリティ）。一度に複数系統を触ると品質と検証粒度が落ちる。本サイクルはトップのみ。
- **トップに診断の視覚言語拡張（伝統色アイデンティティ・象徴絵文字等）を適用する**: 不採用。cycle-261 の方向決定で「拡張は診断タッチポイントに限定・辞典本文/道具/道具箱の austere 基調は維持」と明記済み。辞典トップは index であって診断面ではない。診断拡張を持ち込むと、cycle-261 が引いた歯止め（規約緩和の診断面限定）を自ら破る逸脱になる。
- **ブログを書く**: 本サイクルでは原則不執筆の方向（後述・補足事項）。1ページ移行は来訪者に見える変化が局所的で、読者価値のある学びになりにくい。完了後の状態を見て再判断する。

### 計画にあたって参考にした情報

- `docs/design-migration-plan.md`（Phase 9.3.a の定義・「1 ページ移行の標準手順」step1-10・段階移行整合性の検証項目）
- `docs/cycles/cycle-261.md`（B-539 方向決定。特に L126-129「拡張は診断タッチポイント限定・辞典本文/道具/道具箱の austere 基調は維持」＝本サイクルが austere で移行する根拠）
- `docs/cycles/cycle-259.md`（辞典移行は概念非依存で実施＝要否確認済）・`docs/site-concept.md`（診断中心3層・辞典＝文化層）
- 現物確認: `src/app/(legacy)/dictionary/page.tsx`（99行・import は common/Breadcrumb のみ・収録数は .length 動的算出・TrustLevelBadge 不使用）、`src/app/(legacy)/dictionary/layout.tsx`（max-width ラッパーのみ・4系統共有）
- `/frontend-design` SKILL・`/DESIGN.md`（新デザイン体系・index/カードパターン・絵文字不使用・a11y）／実装は実施フェーズで参照

**外部仕様への依存**: 本サイクルの主作業（既存 index ページの (new) 移行）は内部デザインシステムに閉じる。唯一の外部仕様接点は BreadcrumbList JSON-LD（Schema.org / Google 構造化データ仕様）と OGP/Twitter カードだが、いずれも既に移行済みページ（blog/tools/トップ）で確立済みのパターンを**踏襲するのみ**で、新規の外部仕様依存判断を導入しない。OGP は `sharedMetadata` 経由で一元化済み。よって一次資料の新規事前確認は不要と判断する（新規の構造化データを設計する場合のみ既存パターン準拠を確認する）。

## キャリーオーバー

- （計画時点）なし。辞典4系統（colors/humor/kanji/yoji）の移行は本サイクルのスコープ外の既存下流タスク（B-351〜354・Deferred）であり、本タスク完了で着手条件が解放される。

## 補足事項

- ブログ判断: 本サイクルでは原則不執筆の方向。1ページのデザイン移行は来訪者に見える変化が局所的で、読者にとっての学び・楽しさになりにくい（過去の移行サイクルも同様に不執筆）。完了後に読者価値があるか再判断する。
- 本サイクルは設計拡張ではなく既存方針（移行計画 Phase 9.3.a）の実行。新規の設計判断は最小限（austere 基調の遵守確認のみ）。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない（B-350 は本サイクル完了で Done へ移動）。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
