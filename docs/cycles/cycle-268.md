---
id: 268
description: 診断デザイン移行の続行（B-493・Phase 8.2 最初のゲーム本体移行）。遊び群で最大流入（11PV/90日）かつ最も複雑なゲーム「kanji-kanaru」本体ページを (legacy) デザインから (new) austere デザインへ移行する。全4ゲーム共通の枠 GameLayout と shared/_components は、未移行3ゲーム（irodori/nakamawake/yoji-kimeru）に構造変更を波及させない段階移行整合のため、cycle-263 辞典と同型で `_components/new/` へフォークする。A/B `quiz_result_visual_v1` はクイズ結果インライン経路専用でゲームと完全分離＝非干渉（接地でコード確認済み）。
started_at: 2026-06-25T20:42:47+0900
completed_at: null
---

# サイクル-268（診断デザイン移行の続行：ゲーム本体 kanji-kanaru の (new) 移行）

このサイクルは、cycle-267（診断単独結果ページ10ルートの (new) 移行）に続く、デザイン移行 Phase 8.2（遊び群の移行）の**最初のゲーム本体移行**である。主軸は診断（/play・cycle-257 で実測確定）であり、その遊び群のうちゲーム本体5ルート（kanji-kanaru/nakamawake/irodori/yoji-kimeru/daily）が旧(legacy)デザインのまま残存している（cycle-267 完了で result は全消滅し、残るは本ゲーム本体5つのみ）。来訪者は新デザインの辞典・結果・診断入口を見たあと、ゲーム本体で旧デザインに落ちる。この割れを系統的に解消していく。

design-migration-plan §8.2 は「ゲーム各1サイクル」と定める。ゲームは辞典・結果ページと違い**共通基盤を持たない個別実装**（GameBoard/GuessInput/API/独自ロジック）であり、品質と追跡性のためタスクを小さく保つ。よって本サイクルは**1ゲームに集中**する。対象は遊びゲームで最大流入（kanji-kanaru 11PV > nakamawake 10 > irodori 6 > yoji-kimeru 4 > daily 2・GA4 property 524708437・2026-03-27〜06-24）かつ最も複雑な **kanji-kanaru**。最大の来訪者価値が届き、かつ最も難しいケースでゲーム移行パターン（共有枠のフォーク機構）を確立できる。実装コストの高さは「来訪者価値が劣後する選択を選ぶ理由にしない」（CLAUDE.md 決定原則）。

## 実施する作業

- [ ] **T0: 共有枠の (new) フォーク作成** — kanji-kanaru の import グラフから到達する共有コンポーネントのみを `src/play/games/_components/new/` および `src/play/games/shared/_components/new/` へフォークする（cycle-263 辞典 `_components/new/` と同型の確立パターン）。**over-fork 禁止＝実際に (new) kanji-kanaru ページから到達するものだけ**。対象（接地 §1-C・§2.3 で確定）: `_components/new/GameLayout.{tsx,module.css}`・`new/RelatedGames.tsx`・`new/RelatedBlogPosts.{tsx,module.css}`、`shared/_components/new/` に GameDialog / CrossCategoryBanner / CountdownTimer / NextGameBanner / GameShareButtons（kanji-kanaru の各 Modal が import する分のみ）。フォーク時の質的入れ替え:
  - 旧トークン `--color-*` → 新トークン（`--fg`/`--bg`/`--border`/`--accent`/`--fg-soft`/`--bg-soft` 等）。
  - `@/components/common/{Breadcrumb,FaqSection,ShareButtons}` → (new) 版 `@/components/{Breadcrumb,FaqSection,ShareButtons}` へ差替。
  - **`TrustLevelBadge` は (new) 版が存在しないため撤去**（import + GameLayout.tsx L40 JSX 削除）。AI注記は Footer/about が担保（cycle-263/267 と同方針）。`GameMeta.trustLevel`/`trustNote` フィールドは **B-432 一括削除の責務＝本サイクルでは meta から消さない**（legacy GameLayout がまだ使用・AP-I02 漸進削除回避）。
  - 角丸は DESIGN.md §6 規則へ（パネル/カード/タグ=2px=`--r-normal`、ボタン/入力=8px=`--r-interactive`）。影撤去。
  - **中央寄せ（GameLayout.module.css L84/106・shared 各所 `text-align:center`）を撤去し左寄せ統一**（盤面など機能上中央が要る箇所は除く）。
  - CrossCategoryBanner のハードコード派手色（紫/桃/青）・NextGameBanner の青ボタン（`--color-primary`+`#fff`）を `--accent`/`--bg-invert` 系の無彩・austere へ。
  - GameShareButtons のブランド色直書きは、ResultModal 内のシェアは (new) `@/components/ShareButtons`（GameLayout が既に採用する (new)版）への寄せを第一候補に検討。困難なら austere トーンで保持。
  - GameLayout の最上位コンテナに 1ページ移行標準手順の外枠（main 直下 `<1300px`）を満たす構造を確認（既存 max-width:600px 読みカラムは GameLayout 設計として維持し、cycle-267 result と同じく 1200px を機械転用しない）。
- [ ] **T1: ゲーム固有 CSS/TSX の (new) 化（その場・他ゲーム非共有）** — `src/play/games/kanji-kanaru/_components/` 配下を新デザインへ。
  - `styles/KanjiKanaru.module.css`（旧トークン35・最大の改修）: 旧トークン→新トークン、角丸再編、中央寄せ（タイトル/結果テキスト）の左寄せ化、`#ffffff` 直書き→`--fg-invert` 等、過剰な太字の見直し。
  - `GameContainer.module.css`（旧トークン8）: 新トークン化 + retryButton の角丸 `--r-interactive` 化。
  - **絵文字の質的入れ替え**: GameHeader.tsx L48 📊（統計）→ Lucide 線画 + `aria-label` 維持・L40 `?`→`HelpCircle` 検討、ResultModal.tsx L61 🎉/😔 → austere（テキスト/Lucide）、HowToPlayModal.tsx L36/39 🟩🟨 → 実色チップ（背景色 span）へ。
  - **ゲーム判定色 `--kk-color-correct/close/wrong/empty`（Wordle 風 green/yellow/grey）は保持**＝Wordle 系パズルの判定情報そのもの＝機能色（DESIGN.md §2「色は機能を伝えるためだけに使う」に合致。cycle-263「色面＝本文」の本ゲーム版）。無彩化しすぎない。chrome（ヘッダー/難易度/input/submit/モーダル枠/余白/角丸）のみ austere 体系へ。
- [ ] **T2: ルートの git mv と import 差替** — `git mv src/app/(legacy)/play/kanji-kanaru/{page.tsx,layout.tsx,opengraph-image.tsx,__tests__/*} → (new)/play/kanji-kanaru/`。page.tsx の `GameLayout` import を (new) フォーク版へ差替。kanji-kanaru 固有 Modal（ResultModal/StatsModal/HowToPlayModal）が shared (new) フォークを参照するよう import 差替。metadata/JSON-LD/crossCategoryItems/opengraph-image は無改修保全。
- [ ] **T3: (new) GameLayout 用テストの整備** — フォーク版 GameLayout 用に `_components/new/__tests__/GameLayout.test.tsx` を新設（legacy テストを基に TrustLevelBadge アサーション〔L86-94「正確な処理」〕を除外・h1 非保持契約は維持）。legacy `GameLayout.test.tsx` は3ゲームが使う限り**不変で残す**。git mv した kanji-kanaru の3テスト（page/GameBoard/GuessInput）は import パス追従のみ。
- [ ] **検証** — `rm -rf .next/dev`（git mv 後の stale 型対策・knowledge §12）→ 4ゲート（lint/format:check/test/build）+ typecheck + grep ゲート（(legacy)/play/kanji-kanaru 空・(new) kanji-kanaru 配下と (new) フォークに旧 `--color-*`/`@/components/common` 残ゼロ・UI絵文字 📊🎉😔🟩🟨 残ゼロ・派手色ハードコード残ゼロ）+ **A/B 非破壊確認**（kanji-kanaru/GameLayout/shared に `EXPERIMENT:`/`useAbVariant` 不在の維持＝そもそも 0 件）+ **段階移行整合の確認**（未移行3ゲーム irodori/nakamawake/yoji-kimeru が legacy 版共有を使い続け pixel 不変であること）+ Playwright 視覚検証（mobile 360px 最優先 + desktop・light/dark・盤面/難易度/ヒント/入力/各モーダルの機能保全・KANJIDIC2 帰属と漢字辞典リンクの回遊保全・console error 0・ベースライン §7 と「同等以上」）。
- [ ] **レビュー** — 計画 reviewer（フォーク方針・段階移行整合・スコープ妥当性・A/B 非干渉の確認）→ 実装後に白紙 reviewer で成果物独立検証。

## 作業計画

### 目的

主軸（診断/遊び群）のゲーム本体のうち最大流入の kanji-kanaru を (new) austere デザインへ移行し、辞典・結果・診断入口で確立した新デザイン語彙（無彩・左寄せ・border-left 見出し・新トークン）に揃える。来訪者が新デザインのサイトを回遊する中でゲーム本体だけ旧デザインに落ちる割れを解消する。Phase 8.2 の最初のゲーム移行として、共有枠フォークによるゲーム移行パターンを確立し、後続3ゲーム（B-493 残）が再利用できる基盤を作る。タイル化（道具箱専用・Phase 8 のタイル化判断）は本サイクルのスコープ外（backlog B-493 注記どおり P3 据置）。

### 作業内容

**移行対象（接地で確定した事実・`tmp/cycle-268-grounding.md` が SSoT）:**

- 約21ファイル: ルート git mv 6（page/layout/opengraph-image/**tests**×3）+ ゲーム固有 CSS/TSX 質的改修 約6 + 共有フォーク約8 + (new) テスト新設1。
- ゲームロジック・UI は `src/play/games/kanji-kanaru/`（route group 非依存）。ルート側（`src/app/(legacy)/play/kanji-kanaru/`）は薄いラッパー。
- 旧デザインの質的要素: 青系プライマリ（`#2563eb`/`--color-primary`）、AIトラストバッジ、絵文字（📊🎉😔🟩🟨、関連ゲームカードの絵文字アイコン）、CrossCategoryBanner の紫/桃/青ハードコード装飾色、ブランド色シェアボタン、角丸6〜12px、全面中央寄せ。

**最重要論点＝共有 GameLayout / shared の扱い: フォーク採用（接地 §2.3 の推奨を PM 承認）。**

- 判断の芯: in-place 移行でも**色は両立する**（old-globals.css が旧 `--color-*` に加え新トークン `--fg`/`--bg` 等を L59-89 で実定義済み・cycle-253 由来）。しかし**構造的変更（角丸2px・影撤去・中央寄せ解除・絵文字撤去・派手色撤去）が未移行3ゲームに即時波及し、段階移行整合（他系統は自分のサイクルまで不変）を破る**。これは移行計画が禁じる半移行状態。よって cycle-263 辞典フォークと同型で、kanji-kanaru が import する共有のみを `_components/new/`・`shared/_components/new/` へフォークする。
- フォークは過剰にしない＝(new) kanji-kanaru ページの import グラフ閉包に限る。後続3ゲームのサイクルがこのフォークを再利用し、3ゲーム移行完了で legacy 共有が全消費者を失い Phase 11 で撤去される（cycle-263→264 で実証済みの機構）。
- kanji-kanaru 固有 Modal（ResultModal/StatsModal/HowToPlayModal）は `src/play/games/kanji-kanaru/_components/` にあり非共有＝その場改修でよい。これらが shared (new) フォークを参照するよう import を差替える。

**移行方針（1ページ移行の標準手順・design-migration-plan に準拠）:**

1. (new) 共有フォーク作成（新トークン + austere 構造 + 絵文字/中央寄せ/派手色の質的入れ替え + TrustLevelBadge 撤去 + (new) 版 Breadcrumb/FaqSection/ShareButtons 差替）。
2. ゲーム固有 CSS/TSX をその場で新化（盤面判定色 `--kk-color-*` は保持・chrome のみ austere 化）。
3. `git mv (legacy)/play/kanji-kanaru → (new)/play/kanji-kanaru`、page.tsx と各 Modal の import を (new) フォークへ差替。
4. (new) GameLayout 用テスト新設、`rm -rf .next/dev` → 4ゲート。
5. Playwright で w360/w1280 × light/dark を撮りベースライン（§7）と「同等以上」を確認。**未移行3ゲームの legacy 不変も実機確認**。
6. 「トークン置換だけの上塗り」は禁止（AP-P28）。絵文字・派手色・中央寄せの撤去はメタファーの質的入れ替えであり、確立済みの新デザイン語彙（無彩・左寄せ・縦罫線/border-left 見出し）に揃える。

**A/B との関係（接地でコード確認済み・完全に無関係）:**

- 走行中 A/B `quiz_result_visual_v1` の arm 分岐は**クイズ結果のインライン経路（`src/play/quiz/`）にのみ**存在。kanji-kanaru・GameLayout・shared に `EXPERIMENT:`/`useAbVariant`/`quiz_result_visual` マーカーは 0 件。ゲーム（`src/play/games/`）とコード上分離。本サイクルは A/B 実験面に一切触れない。

**SEO/メタデータ保全（接地 §4・無改修で保全可）:**

- metadata（buildGamePageMetadata・canonical=`/play/kanji-kanaru`）・JSON-LD（buildGameJsonLd・VideoGame schema）・OG画像（opengraph-image.tsx・共通基盤 createOgpImageResponse）・BreadcrumbList JSON-LD（(new) Breadcrumb が自動出力）・h1（GameHeader 内・GameLayout は h1 非保持）は git mv で URL 不変＝無改修保全。

### 検討した他の選択肢と判断理由

- **共有 GameLayout/shared を in-place で移行する**: 不採用。色は両立するが、構造的変更が未移行3ゲームに即時波及し段階移行整合を破る（半移行状態が3ゲームの各サイクルまで本番に残る）。移行計画が禁じるパターン。
- **5ゲームを1サイクルでまとめて移行する**: 不採用。ゲームは共通基盤を持たない個別実装で、§8.2「ゲーム各1サイクル」かつ CLAUDE.md「タスクは小さく・1コンテンツ1エージェント」に反する。品質と追跡性のため1ゲームに集中。
- **より単純なゲーム（daily/irodori）を先に移行してパターンを確立する**: 不採用。最大流入（kanji-kanaru 11PV）が最大の来訪者価値で、決定原則は実装コスト（複雑さ）を劣後選択の理由にしない。最も難しいケースでフォーク機構を確立すれば後続は再利用で楽になる。品質はサブエージェント分割と全項目 Playwright 検証で担保。
- **GameLayout のゼロベース再設計（B-295）を本サイクルで行う**: 不採用。B-295 は Deferred の独立タスク。本サイクルはデザイン移行（トークン+質的語彙の入れ替え）に限定し、レイアウトの再設計は混ぜない（スコープ肥大の回避）。
- **タイル化を同時に行う**: 不採用。タイル化は道具箱専用の判断で backlog B-493 注記どおり P3 据置。デザイン移行と分離する。

### 計画にあたって参考にした情報

- 接地サブエージェント（コード精読 + Playwright 本番 dev `:3000` + GA4 確認・`tmp/cycle-268-grounding.md` が SSoT）: 移行対象約21ファイル / 共有 GameLayout・shared はフォーク推奨（段階移行整合）/ A/B 非干渉（マーカー0件）/ SEO 無改修保全 / 視覚ベースライン5枚取得（console error 0）/ ゲーム判定色は機能色として保持。
- GA4 property 524708437（2026-03-27〜06-24）: 遊びゲームの流入 kanji-kanaru 11 > nakamawake 10 > irodori 6 > yoji-kimeru 4 > daily 2。
- `docs/design-migration-plan.md` §8.2（遊び群移行＝ゲーム各1サイクル・1ページ移行の標準手順・Phase 11 撤去）/ `DESIGN.md`（§2 色は機能のみ・§3 絵文字/太字・§6 角丸規則・§7 診断視覚言語は知識クイズに一律適用しない）/ `.claude/skills/frontend-design/SKILL.md`。
- `docs/cycles/cycle-263.md`（共有コンポーネントを `_components/new/` へフォークし後続が再利用する確立パターン）/ cycle-267.md（直前の result 移行・1200px 機械転用回避・A/B 非交絡）。
- `docs/knowledge/nextjs.md` §12（route group をまたぐ git mv 後の `.next/dev` stale 型対策＝`rm -rf .next/dev`）。

**外部仕様への依存**: 本サイクルは kanji-kanaru の (new) 移行で内部デザインシステムに閉じる。JSON-LD（Schema.org VideoGame）・OGP は既存の移行済みパターンを踏襲するのみ（metadata 生成は無改修）。新規の外部仕様依存判断を導入しないため、一次資料の新規事前確認は不要と判断。

## キャリーオーバー

（サイクル進行中に記録）

## 補足事項

- 本サイクル完了後、`(legacy)/play/` 配下の残存はゲーム本体4つ（nakamawake/irodori/yoji-kimeru/daily）。B-493 は umbrella として Active のまま、各ゲーム1サイクルで継続。
- character-fortune/music-personality/unexpected-compatibility の `(legacy)/play/` 配下空ディレクトリ（cycle-267 の `git mv` 残骸）は本サイクルで掃除する。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
