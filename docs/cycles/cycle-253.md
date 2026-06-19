---
id: 253
description: デザイン移行 Phase 8.2 の第一弾として、クイズ共通プレイ画面（共通動的ルート [slug] + music-personality）を (new)/ デザインへ移行する。流入上位の診断・クイズが着地するプレイ画面を新デザインの枠組みに揃え、cycle-252 で放置されていた「診断から来た来訪者が回遊するとデザインが割れる」体験を、最も見られている面から解消する。あわせて遊び群の共有コンポーネント web を破綻なく段階移行するための旧→新トークンブリッジを確立する。
started_at: "2026-06-19T19:24:53+0900"
completed_at: null
---

# サイクル-253

このサイクルでは、デザイン移行計画 **Phase 8.2（遊び群の (new)/ デザイン移行）の第一弾**として、**クイズの共通プレイ画面**を新デザインへ移行する。

cycle-252 の振り返りで明確になったとおり、このサイトの流入の大部分は `(legacy)/play/` 配下の診断・クイズが占めている。実測（GA4 直近28日）でも `/play/character-personality`(47)・`/play/word-sense-personality`(26)・`/play/traditional-color`(15)・`/play/yoji-level`(10) と、上位はすべて遊び群。これらはいずれも自前の `page.tsx` を持たず、**共通動的ルート `/play/[slug]` → `QuizPlayPageLayout` がプレイ画面を描画している**。つまり共通プレイ画面を1つ移行すれば、流入が着地する面を一度にすべて新デザインに揃えられる。これ以上レバレッジの高い起点はない。

## なぜやるか（来訪者の所在）

検索から `/play/character-personality` 等に直接着地した来訪者は、いま旧デザインのプレイ画面を最初に目にする。そこからヘッダー経由で道具箱（トップ）・ツール・ブログ（すべて新デザイン）へ回遊すると、ヘッダー・フッター・色・角丸が突然切り替わる。来訪者にとってこれは「同じサイトなのに途中で見た目が変わる＝壊れている／信頼できない」という体験で、cycle-252 の振り返りが「放置した実害」と記録したものそのものだ。

最も多く見られているプレイ画面の枠組みを新デザインに揃えることで、検索着地の第一印象を新デザインに統一し、回遊時のデザイン断裂を上流から減らす。

## 実施する作業

- [ ] 移行戦略の確定と文書化（トークンブリッジ方式・共有コンポーネント web の段階移行方針）
- [ ] 旧→新トークンブリッジを `globals.css`（(new) 側）に追加（遊び群共有コンポーネントが使う旧 `--color-*` を DESIGN.md のトークン対応表に従って新トークン値へエイリアス。`:root` と `:root.dark` 両方）
- [ ] ブリッジが Phase 11.5「旧トークン互換 全撤去」の対象であることをコメントで明記
- [ ] ルートグループ分割の事前ビルド検証（`(new)/play/[slug]/page.tsx` と `(legacy)/play/[slug]/result/` の共存がビルド可能か最初に確認）
- [ ] `(legacy)/play/[slug]/` のプレイ画面ファイル（`page.tsx`・`opengraph-image.tsx`・`page.module.css`）を `(new)/play/[slug]/` へ移動（`result/` サブツリーは legacy に残す）
- [ ] `(legacy)/play/music-personality/` のプレイ画面ファイルを `(new)/play/music-personality/` へ移動（`result/` サブツリーは legacy に残す。QuizPlayPageLayout を共有するため [slug] と同時移行が必須）
- [ ] `QuizPlayPageLayout` の新デザイン化：`@/components/common/{Breadcrumb,FaqSection,ShareButtons}` を `@/components/*`（新版）へ差し替え
- [ ] `QuizPlayPageLayout` から `TrustLevelBadge` の import と JSX を撤去（`meta.trustLevel` フィールド自体は B-432 の一括削除方針に従い本サイクルでは削除しない）
- [ ] `QuizPlayPageLayout` / `[slug]/page.module.css` を DESIGN.md 準拠で再設計（Panel に収める・最上位コンテナに `max-width: 1200px; margin: 0 auto` をハードコード・余白・タイポ・a11y）
- [ ] `page.module.css` の import パスを新ディレクトリ参照へ修正
- [ ] テスト調整（移動したルートのテストパス・import 修正、`QuizPlayPageLayout` テストの追従）
- [ ] Playwright 視覚確認：移行したプレイ画面を主要クイズ複数（character-personality / word-sense-personality / traditional-color / music-personality 等）で w360・w1280 × light・dark 撮影し、移行前と「同等以上」かを評価
- [ ] Playwright 退行確認：legacy に残る結果ページ・ゲーム・daily がブリッジ追加により破綻していないことを確認（共有コンポーネントの旧トークンは old-globals.css 側で従来どおり解決されるため不変のはずだが実機確認する）
- [ ] レビュー依頼と指摘対応
- [ ] backlog.md 更新（キャリーオーバーの登録）

## 作業計画

### 目的

デザイン移行 Phase 8.2 の第一弾として、流入が着地するクイズ共通プレイ画面を (new)/ デザインへ移行し、検索着地〜回遊のデザイン断裂を最も見られている面から解消する。あわせて、遊び群の共有コンポーネント web を後続サイクルで破綻なく段階移行するための基盤（トークンブリッジ）を確立する。

### 作業内容

#### アーキテクチャ上の前提（調査で確定した事実）

- プレイ画面は共通動的ルート `(legacy)/play/[slug]/page.tsx` が描画し、`QuizPlayPageLayout`（`src/play/quiz/_components/QuizPlayPageLayout.tsx`）を呼ぶ。流入上位の character-personality / word-sense-personality / traditional-color / yoji-level 等は**すべてこの共通ルート経由**で、自前 `page.tsx` を持たない。
- `QuizPlayPageLayout` の消費者は2つだけ：`[slug]/page.tsx` と `music-personality/page.tsx`。後者は専用 `page.tsx` を持つが同じ共有レイアウトを使うため、レイアウト移行時に同時移動が必須（片方を legacy に残すと共有コンポーネントが (new) トークンを参照できず／逆も成立せず破綻する）。
- プレイ画面サブツリー（`QuizContainer`・`RelatedQuizzes`・`RecommendedContent`・`ResultNextContent`）と `ResultPageShell` は、**legacy に残る結果ページ・ゲーム・daily からも広く共有されている**。特に `RecommendedContent` は遊び群ほぼ全ルートの普遍的依存。これらを (new) トークンへ書き換えると legacy 残存ページが一斉に破綻する。→ これが「プレイ画面だけを綺麗に切り出せない」根本理由であり、B-295 が「B-522 の過程で方針再検討」と注記して見越していた問題。
- ルートグループ分割の実績：現在すでに `(new)/play/page.tsx`（一覧）と `(legacy)/play/[slug]/...` がルートグループをまたいで共存しビルドできている。`(new)/play/[slug]/page.tsx` を足し `(legacy)/play/[slug]/result/` を残す分割は、この一段深い適用にあたる（ただしビルドで事前確認する）。

#### 採用する移行戦略：旧→新トークンブリッジ

523箇所の旧 `--color-*` 参照を本サイクルで全置換するのは過大で、共有コンポーネントの破綻リスクも高い。代わりに **`globals.css`（(new) 側）に旧 `--color-*` トークンを新デザイン値のエイリアスとして定義する**。これにより：

- 共有コンポーネントは旧トークンのまま (new) 配下で**新デザインの色値**で正しく描画される（legacy 側は old-globals.css の従来定義で不変）。
- 移行を「ルートが (new) 配下に来る」と「コンポーネントを本格再設計する」に分離でき、後続サイクルで遊び群を段階移行できる。
- 移行計画 Phase 11.5 は「旧トークン互換が残っていれば全撤去」と明記しており、この過渡的ブリッジは計画が想定済みの手段。コメントで Phase 11.5 撤去対象と明記する。

旧→新の対応は **DESIGN.md のトークン対応表を一次資料**とする（Explore の概算ではなく DESIGN.md を確認して各旧トークンに正しい新トークンを割り当てる。例：`--color-text-muted` の移行先は新側に `--fg-muted` が存在しないため `--fg-soft`/`--fg-softer` のいずれが適切か DESIGN.md で確認する）。

#### 本サイクルで本格再設計する範囲 / ブリッジに委ねる範囲

- **本格再設計**：ページ章立て＝`QuizPlayPageLayout` のチャーム（共通コンポーネントの新版差し替え・TrustLevelBadge 撤去・Panel/max-width/余白/a11y）と `[slug]/page.module.css`。
- **ブリッジに委ねる（本サイクルは色のみ新化）**：`QuizContainer` 等の内側サブツリー。本格的な構造再設計（角丸・ボタン状態・スペーシングの DESIGN.md 完全準拠）は後続サイクルへ。ただしレビューで「移行前と同等以上／新チャームと内側が著しく不整合」と判断されたら本サイクルで内側も是正する。

#### 本サイクルのスコープ外（明示的に後続へ）

- 結果ページ群（共通 `[slug]/result` ＋ Type C 専用結果8本）の移行 → `ResultPageShell` 共有のため別サイクル。
- ゲーム4種（`GameLayout`）・daily の移行。
- 共有コンポーネントの本格再設計（構造レベルの DESIGN.md 準拠）。
- **タイル化**：遊びのタイル化方針は B-295（GameLayout 等ゼロベース再設計）/B-493（ゲーム単一タイル化）で未確定であり、道具箱（日常の道具のダッシュボード）に多段フローの診断タイルを置く是非は独立した設計判断を要する。Phase 8.2 の「タイル化に馴染まないコンテンツは詳細ページのデザイン移行のみ」に倣い、本サイクルはデザイン移行のみ行いタイル定義は付けない。タイル化方針の決定は後続サイクルで扱う。

### 検討した他の選択肢と判断理由

1. **遊び群を一括移行する案** — 共有コンポーネント web が破綻なく動くには魅力的だが、20ルート・60 CSS ファイル・523トークン・15+コンポーネントを1サイクルで触ることになり「タスクは小さく」に反し、検証面も過大。却下。
2. **523トークンを本サイクルで全置換する案** — 本格的だが過大かつ高リスク。ブリッジで色を新化しつつ段階的に本格再設計する方が、来訪者価値（プレイ画面の新チャーム化）を早く・安全に届けられる。却下。
3. **プレイ画面と結果ページを同時移行（1クイズ完結）する案** — 来訪者の旅程を完全に揃えられるが、プレイ画面は共通 `[slug]` 共有・結果は `ResultPageShell` 共有のため、結果まで含めると全クイズ・ゲームへ連鎖し一括移行と同義になる。却下。
4. **新ツール追加など別系統の作業** — cycle-252 の判断ミス（進行中の移行を放置して新機能に飛んだ）を繰り返すことになる。却下。

### 計画にあたって参考にした情報

- `docs/cycles/cycle-252.md`「サイクル完了後の振り返り — タスク選択の判断ミス」：流入上位が legacy 遊び群に集中し、回遊でデザインが割れる実害を放置した記録。本サイクルの起点。
- GA4 実測（プロパティ 524708437・2026-05-22〜2026-06-18・28日間）：`/play/` 配下 PV 上位＝character-personality(47)・word-sense-personality(26)・traditional-color(15)・yoji-level(10)・kotowaza-level(6)・science-thinking(6)。上位はすべて共通 `[slug]` 経由のクイズ。
- `docs/design-migration-plan.md`：Phase 8.2 のスコープ・「1ページ移行の標準手順」・Phase 11.5「旧トークン互換 全撤去」。
- コード調査：`QuizPlayPageLayout`/`ResultPageShell`/`QuizContainer`/`RecommendedContent` 等の消費者 grep により共有関係を確定。`globals.css`・`old-globals.css` に既存ブリッジが無いことを確認。
- `docs/knowledge/css-modules.md`（`:root.dark` の `:global` 化）、`docs/knowledge/tile-architecture.md`（タイル化の確立パターン・本サイクルは未適用）。

#### 外部仕様への依存

本サイクルの判断は外部仕様（外部の当事者が変更可能な SEO 機能・Schema.org・サードパーティプラットフォーム等）には依存しない。依拠するのは Next.js Route Group のフレームワーク挙動と CSS 標準のみで、ルートグループ分割の可否は計画段階の WebFetch ではなく実機ビルドで検証する（実施作業の最初のチェック項目）。

## キャリーオーバー

（実施・レビュー後に確定。想定される後続作業は以下。すべて B-522 の傘下として継続）

- 結果ページ群（共通 `[slug]/result` ＋ Type C 専用結果8本）の (new)/ 移行。
- ゲーム4種（`GameLayout`）・daily の (new)/ 移行。
- 遊び群共有コンポーネント（`QuizContainer`・`RecommendedContent` 等）の構造レベル本格再設計（現状はトークンブリッジで色のみ新化）。
- 遊びコンテンツのタイル化方針の決定（B-295/B-493 と統合）。
- 旧→新トークンブリッジの撤去（Phase 11.5）。

## 補足事項

- 移行は「1ページ移行の標準手順」（design-migration-plan.md）に従う。ステップ6（TrustLevelBadge 撤去）は import/JSX 撤去のみ行い、`trustLevel` フィールド削除は B-432 の一括方針に従い本サイクルでは行わない。
- 作業は適切な粒度でサブエージェントに委譲し、作業後は必ず reviewer のレビューを受ける。

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
