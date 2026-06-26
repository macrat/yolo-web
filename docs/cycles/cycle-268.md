---
id: 268
description: 診断デザイン移行の続行（B-493・Phase 8.2 最初のゲーム本体移行）。遊び群で最大流入（11PV/90日）かつ最も複雑なゲーム「kanji-kanaru」本体ページを (legacy) デザインから (new) austere デザインへ移行する。全4ゲーム共通の枠 GameLayout と shared/_components は、未移行3ゲーム（irodori/nakamawake/yoji-kimeru）に構造変更を波及させない段階移行整合のため、cycle-263 辞典と同型で `_components/new/` へフォークする。A/B `quiz_result_visual_v1` はクイズ結果インライン経路専用でゲームと完全分離＝非干渉（接地でコード確認済み）。
started_at: 2026-06-25T20:42:47+0900
completed_at: 2026-06-25T22:36:23+0900
---

# サイクル-268（診断デザイン移行の続行：ゲーム本体 kanji-kanaru の (new) 移行）

このサイクルは、cycle-267（診断単独結果ページ10ルートの (new) 移行）に続く、デザイン移行 Phase 8.2（遊び群の移行）の**最初のゲーム本体移行**である。主軸は診断（/play・cycle-257 で実測確定）であり、その遊び群のうちゲーム本体5ルート（kanji-kanaru/nakamawake/irodori/yoji-kimeru/daily）が旧(legacy)デザインのまま残存している（cycle-267 完了で result は全消滅し、残るは本ゲーム本体5つのみ）。来訪者は新デザインの辞典・結果・診断入口を見たあと、ゲーム本体で旧デザインに落ちる。この割れを系統的に解消していく。

design-migration-plan §8.2 は「ゲーム各1サイクル」と定める。ゲームは辞典・結果ページと違い**共通基盤を持たない個別実装**（GameBoard/GuessInput/API/独自ロジック）であり、品質と追跡性のためタスクを小さく保つ。よって本サイクルは**1ゲームに集中**する。対象は遊びゲームで最大流入（kanji-kanaru 11PV > nakamawake 10 > irodori 6 > yoji-kimeru 4 > daily 2・GA4 property 524708437・2026-03-27〜06-24）かつ最も複雑な **kanji-kanaru**。最大の来訪者価値が届き、かつ最も難しいケースでゲーム移行パターン（共有枠のフォーク機構）を確立できる。実装コストの高さは「来訪者価値が劣後する選択を選ぶ理由にしない」（CLAUDE.md 決定原則）。

## 実施する作業

- [x] **T0: 共有枠の (new) フォーク作成** — kanji-kanaru の import グラフから到達する共有コンポーネントのみを `src/play/games/_components/new/` および `src/play/games/shared/_components/new/` へフォークする（cycle-263 辞典 `_components/new/` と同型の確立パターン）。**over-fork 禁止＝実際に (new) kanji-kanaru ページから到達するものだけ**。対象（接地 §1-C・§2.3 で確定）: `_components/new/GameLayout.{tsx,module.css}`・`new/RelatedGames.tsx`・`new/RelatedBlogPosts.{tsx,module.css}`、`shared/_components/new/` に GameDialog / CrossCategoryBanner / CountdownTimer / NextGameBanner / GameShareButtons（kanji-kanaru の各 Modal が import する分のみ）。
  - **フォーク閉包から除外する依存を明示（計画 reviewer MUST-2）**: `@/play/_components/RecommendedContent`（と `RecommendedContent.module.css`）・`@/play/_components/RelatedContentCard.module.css` は既に (new) トークンのみで移行済みクイズ面（ResultPageShell/QuizPlayPageLayout 等）が現用共有中＝**フォークせずそのまま参照する**（フォークすると移行済み面と二重定義に分岐＝事故）。RelatedGames フォーク版も `RelatedContentCard.module.css` を共有参照のまま使う。
  - フォーク時の質的入れ替え:
  - 旧トークン `--color-*` → 新トークン（`--fg`/`--bg`/`--border`/`--accent`/`--fg-soft`/`--bg-soft` 等）。
  - `@/components/common/{Breadcrumb,FaqSection,ShareButtons}` → (new) 版 `@/components/{Breadcrumb,FaqSection,ShareButtons}` へ差替。
  - **`TrustLevelBadge` は (new) 版が存在しないため撤去**（import + GameLayout.tsx L40 JSX 削除）。AI注記は Footer/about が担保（cycle-263/267 と同方針）。`GameMeta.trustLevel`/`trustNote` フィールドは **B-432 一括削除の責務＝本サイクルでは meta から消さない**（legacy GameLayout がまだ使用・AP-I02 漸進削除回避）。
  - 角丸は DESIGN.md §6 規則へ（パネル/カード/タグ=2px=`--r-normal`、ボタン/入力=8px=`--r-interactive`）。影撤去。
  - **中央寄せ（GameLayout.module.css L84/106・shared 各所 `text-align:center`）を撤去し左寄せ統一**（盤面など機能上中央が要る箇所は除く）。
  - CrossCategoryBanner のハードコード派手色（紫/桃/青）・NextGameBanner の青ボタン（`--color-primary`+`#fff`）を `--accent`/`--bg-invert` 系の無彩・austere へ。
  - **RelatedGames のカード絵文字アイコンの質的入れ替え（計画 reviewer MUST-1）**: `RelatedGames.tsx` L29-30 が `game.icon`（registry の 📚🎯🧩🎨）を装飾アイコンとして描画＝DESIGN.md §3「絵文字は UI 装飾・ナビには使わない」違反。(new) フォーク版で**撤去または Lucide 線画へ置換**（cycle-263 辞典カードの扱いに準拠）。registry の `icon` フィールドは他面（legacy 共有）も使うため meta からは消さず、(new) フォーク側で非表示化/置換する。
  - GameShareButtons のブランド色直書きは、ResultModal 内のシェアは (new) `@/components/ShareButtons`（GameLayout が既に採用する (new)版）への寄せを第一候補に検討。ただし `GameShareButtons` は `shareGameResult`（ゲーム結果テキスト整形）に依存し機能差があるため、寄せが困難なら austere トーンで保持＝**機能を劣後させない**。SNS 識別色（緑/黒/紫等）は機能色（どの SNS か識別する情報）として残してよく、それ以外の装飾色を austere 化する（§2 機能色 vs 装飾色の線引きを本コンポーネントにも適用）。
  - GameLayout の最上位コンテナに 1ページ移行標準手順の外枠（main 直下 `<1300px`）を満たす構造を確認（既存 max-width:600px 読みカラムは GameLayout 設計として維持し、cycle-267 result と同じく 1200px を機械転用しない）。
- [x] **T1: ゲーム固有 CSS/TSX の (new) 化（その場・他ゲーム非共有）** — `src/play/games/kanji-kanaru/_components/` 配下を新デザインへ。
  - `styles/KanjiKanaru.module.css`（旧トークン35・最大の改修）: 旧トークン→新トークン、角丸再編、中央寄せ（タイトル/結果テキスト）の左寄せ化、`#ffffff` 直書き→`--fg-invert` 等、過剰な太字の見直し。**ただし機能色セル（`--kk-color-*`）上の文字色はトークン化せずコントラスト確保を優先**（`--fg-invert` は dark で暗色になり機能色セル上で可読性が落ちうる・計画 reviewer NICE-2。視覚検証 dark で要確認）。`--bg-invert` 上の文字のみ `--fg-invert` で正しい。
  - `GameContainer.module.css`（旧トークン8）: 新トークン化 + retryButton の角丸 `--r-interactive` 化。
  - **絵文字の質的入れ替え**: GameHeader.tsx L48 📊（統計）→ Lucide 線画 + `aria-label` 維持・L40 `?`→`HelpCircle` 検討、ResultModal.tsx L61 🎉/😔 → austere（テキスト/Lucide）、HowToPlayModal.tsx L36/39 🟩🟨 → 実色チップ（背景色 span）へ。
  - **ゲーム判定色 `--kk-color-correct/close/wrong/empty`（Wordle 風 green/yellow/grey）は保持**＝Wordle 系パズルの判定情報そのもの＝機能色（DESIGN.md §2「色は機能を伝えるためだけに使う」に合致。cycle-263「色面＝本文」の本ゲーム版）。無彩化しすぎない。chrome（ヘッダー/難易度/input/submit/モーダル枠/余白/角丸）のみ austere 体系へ。
- [x] **T2: ルートの git mv と import 差替** — `git mv src/app/(legacy)/play/kanji-kanaru/{page.tsx,layout.tsx,opengraph-image.tsx,__tests__/*} → (new)/play/kanji-kanaru/`。page.tsx の `GameLayout` import を (new) フォーク版へ差替。kanji-kanaru 固有 Modal（ResultModal/StatsModal/HowToPlayModal）が shared (new) フォークを参照するよう import 差替。metadata/JSON-LD/crossCategoryItems/opengraph-image は無改修保全。
- [x] **T3: (new) GameLayout 用テストの整備** — フォーク版 GameLayout 用に `_components/new/__tests__/GameLayout.test.tsx` を新設（legacy テストを基に TrustLevelBadge アサーション〔L86-94「正確な処理」〕を除外・**trustNote アサーション〔L96-103〕も TrustLevelBadge 経由なら同時に除外**＝帰属を確認・計画 reviewer NICE-3・h1 非保持契約は維持）。legacy `GameLayout.test.tsx` は3ゲームが使う限り**不変で残す**。git mv した kanji-kanaru の3テスト（page/GameBoard/GuessInput）は import パス追従のみ。
- [x] **検証** — `rm -rf .next/dev`（git mv 後の stale 型対策・knowledge §12）→ 4ゲート（lint/format:check/test/build）+ typecheck + grep ゲート（(legacy)/play/kanji-kanaru 空・(new) kanji-kanaru 配下と (new) フォークに旧 `--color-*`/`@/components/common` 残ゼロ・UI絵文字 📊🎉😔🟩🟨 残ゼロ・**RelatedGames カードの registry 絵文字 📚🎯🧩🎨 が (new) kanji-kanaru 到達 DOM〔関連ゲーム欄含む〕に残ゼロ**・派手色ハードコード残ゼロ）+ **A/B 非破壊確認**（kanji-kanaru/GameLayout/shared に `EXPERIMENT:`/`useAbVariant` 不在の維持＝そもそも 0 件）+ **段階移行整合の確認**（未移行3ゲーム irodori/nakamawake/yoji-kimeru が legacy 版共有を使い続け pixel 不変であること）+ Playwright 視覚検証（mobile 360px 最優先 + desktop・light/dark・盤面/難易度/ヒント/入力/各モーダルの機能保全・KANJIDIC2 帰属と漢字辞典リンクの回遊保全・console error 0・ベースライン §7 と「同等以上」）。
- [x] **レビュー** — 計画 reviewer（フォーク方針・段階移行整合・スコープ妥当性・A/B 非干渉の確認）→ 実装後に白紙 reviewer で成果物独立検証。

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

## レビュー結果

本サイクルは「接地→計画→計画レビュー→実装（小さく分割）→集約検証→視覚レビュー→白紙レビュー」の各段を独立サブエージェントに委譲し、すべて通過した。

- **接地（コード精読 + Playwright 本番 + GA4）**: 移行対象約21ファイル。共有 GameLayout・shared はフォーク推奨（段階移行整合＝in-place だと構造変更が未移行3ゲームに波及）。A/B 非干渉（マーカー0件）。SEO 無改修保全。視覚ベースライン5枚取得（console error 0）。`tmp/cycle-268-grounding.md`。
- **計画 reviewer（must 2件 → 反映後 must 0 で承認）**: (M1) RelatedGames カードの registry 絵文字 📚🎯🧩🎨（RelatedGames.tsx L29-30）が DESIGN.md §3 違反で質的入れ替え対象かつ検証ゲートから漏れていた→ T0 と grep ゲートに反映。(M2) フォーク粒度を CSS 依存まで降ろし、既 new 共有の RecommendedContent/RelatedContentCard.module.css をフォーク対象外と明示（二重定義回避）。nice N1〔GameShareButtons の SNS 識別色は機能色保持〕/N2〔機能色セル上文字のコントラスト優先〕/N3〔trustNote アサーション帰属確認〕も反映。
- **実装（builder A/B/C・小さく分割）**: A=T0 共有フォーク（`_components/new/` GameLayout/RelatedGames/RelatedBlogPosts ＋ `shared/_components/new/` GameDialog/CrossCategoryBanner/CountdownTimer/NextGameBanner/GameShareButtons）+ T3 (new) テスト新設。B=T1 ゲーム固有（KanjiKanaru.module.css 旧トークン35全廃・GameContainer.module.css・絵文字3箇所〔📊→BarChart SVG・?→HelpCircle SVG・🎉😔撤去→テキスト見出し・🟩🟨→実色チップ〕・機能色 `--kk-color-*` 保持）。C=T2 git mv（route 6ファイル）+ import 再配線（page.tsx と各 Modal を (new) フォークへ）+ 空ディレクトリ掃除 + seo-coverage.test.ts の import 追従。新規アイコンは `src/components/icons/`（BarChart/HelpCircle・inline SVG・新規 npm 依存なし）。
- **PM 集約検証**: 4ゲート + typecheck 全通過（typecheck/lint/format:check exit 0・test 344ファイル**5680件 pass**・build 成功・`/play/kanji-kanaru` Static 化・API は legacy のまま URL 不変）。grep ゲート全合格（(legacy)/play/kanji-kanaru 消滅・旧 `--color-*`/`@/components/common`/UI絵文字/registry絵文字/派手色 残ゼロ・A/B 非接触）。
- **視覚 reviewer（ローカル本番ビルド・mobile 360px 最優先 + desktop・light/dark）**: 全項目 PASS（旧要素撤去・austere 化・SVGアイコン置換・凡例実色チップ・ResultModal テキスト見出し化）。機能保全（盤面/難易度/ヒント/入力/3モーダル/evaluate・hints API）・**ゲーム判定色保持**・**dark モードの機能色セル上文字コントラスト判読可（NICE-2 充足）**・KANJIDIC2 帰属と漢字辞典回遊保全・console error 0。**段階移行整合 PASS**（irodori/nakamawake/yoji-kimeru が legacy のまま完全不変を実機確認）。
  - **検出バグ M-2/M-1（修正済み）**: HowToPlay モーダルのタイトルと9箇所の `aria-label/title` が **JSX 属性の文字列リテラル `"\u..."` で `\u` 未解釈**＝可視リテラル表示／スクリーンリーダーに無意味な読み上げ名（M-2 はユーザー可視・M-1 は本サイクルでアイコンのみ化により a11y 悪化）。brace 形 `={"\u..."}`（JS文字列リテラルで `\u` が解釈される・ファイル既存の convention に整合）へ9箇所修正。再ビルド後の視覚再検証で「遊び方」「統計」等が正しく描画・退行なし・console error 0 を確認。
- **白紙 reviewer（成果物の独立検証・11観点・must 0 で承認）**: スコープ厳守・フォーク過不足なし（import 閉包一致・除外依存正しい）・**段階移行整合（legacy 原本 git diff 0行＝不変）**・A/B レッドライン非接触・AP-P28 質的入れ替え・機能色保持＋コントラスト・SEO 無改修保全・TrustLevelBadge 撤去と meta フィールド温存（AP-I02 整合）・テスト整合・属性エスケープ修正の妥当性をすべて裏取り。nice 2件（escape 修正の cycle-doc 記録・未移行 yoji-kimeru に残る同種 a11y バグの backlog 化）はキャリーオーバーへ。

有効な指摘はすべて対応済みで、残存する指摘・対応事項はない。

## キャリーオーバー

- **未移行 yoji-kimeru の同種 a11y バグ（白紙 reviewer NICE-2）**: `src/play/games/yoji-kimeru/_components/DifficultySelector.tsx` に `aria-label="\u..."`（JSX属性リテラルで未解釈）が1件残存。本サイクルのスコープ外（kanji-kanaru のみ）のため未修正が正しい。yoji-kimeru 移行サイクル（B-493 残）で同時是正する。backlog の B-493 注記に含意。
- **ゲーム本体移行の残り（B-493・P1）**: nakamawake/irodori/yoji-kimeru/daily の (new) 移行は後続サイクル（各1サイクル）。本サイクルで確立したフォーク機構（`_components/new/`・`shared/_components/new/`）を再利用する。これら完了で `(legacy)/play/` 配下のゲームが全消滅し Phase 8.2 完結。
- **属性エスケープバグの anti-pattern 化（白紙 reviewer NICE-1）**: 「JSX 属性のダブルクォート値内では `\u` エスケープが未解釈＝リテラル表示。brace 形 `={"\u..."}` で初めて JS 文字列として解釈される」という JSX 挙動を、cycle-completion で **AP-I12 として `docs/anti-patterns/implementation.md` に追加済み**（grep `="\u'` 相当で機械検出する旨も明記）。残りのゲーム移行サイクルで再発防止に使う。

## 補足事項

- 本サイクル完了後、`(legacy)/play/` 配下の残存はゲーム本体4つ（nakamawake/irodori/yoji-kimeru/daily）。B-493 は umbrella として Active のまま、各ゲーム1サイクルで継続。
- character-fortune/music-personality/unexpected-compatibility の `(legacy)/play/` 配下空ディレクトリ（cycle-267 の `git mv` 残骸）は本サイクルで掃除済み。
- **共有枠フォークによるゲーム移行パターンを確立**: 最初のゲーム移行を最複雑な kanji-kanaru で行い、cycle-263 辞典と同型のフォーク機構をゲームにも適用した。後続3ゲームはこのフォークを再利用できる。
- **ブログ判断＝不執筆**。reader-perspective で検討した結論。1ゲームのデザイン移行は cycle-263/265/267 同様、読者の生活に届く物語性が薄い。Phase 8.2 全完了（ゲーム本体移行）または legacy 撤去（Phase 11）で「診断/遊び面・サイト全体のデザインを統一しきった」物語として再評価する方が読者価値が出やすい。
- 本番 UI は本サイクルのコミット・デプロイで初めて kanji-kanaru が新デザインに切り替わる（検証はローカル本番ビルドで実施済み）。

## 追記: 「ゲーム群を A/B 検証せず (new) 出荷した」判断の自己点検（サイクル完了後・自分で調査し記録）

本セクションは、自分で前提を調べ、constitution と照らして下した判断の記録である。既存ドキュメントの記述や他者の指摘を根拠にはしていない（GA4 は自分で集計し、constitution は自分で読み直した）。

### 何を判断したか

本サイクルで kanji-kanaru を (legacy)→(new) デザインへ移行し、**A/B 検証を行わずに本番へ出荷**した。残りのゲーム（nakamawake/irodori/yoji-kimeru/daily・B-493）も同様に A/B なしで移行する前提で計画した。すなわち「(new) デザインが来訪者にとって (legacy) より良い」という仮説を、来訪者の実際の反応で確かめずに出した。

### そのとき自分が挙げていた理由

1. (new) は既に辞典・結果・ツールで採用済みの確立した方向で、ゲームもそこへ揃える「移行」だから（＝開いた仮説ではない、と扱った）。
2. ゲームはクイズ結果のように単一の共通コンポーネントへプールできず、流入も僅少（kanji-kanaru 11PV/90日）で A/B の観測量が足りない。
3. 効果は release 前後（before/after）の計測で見ればよい。
4. 旧デザインをアームとして並走させる実装コストが大きい。

### 前提を自分で確認した結果（GA4 property 524708437・2026-03-27〜06-25・自分で集計）

- チャネル別セッション: Organic Search **575（全体の約66%）** / Direct 210 / Referral 35 / Organic Social 29 / Unassigned 18 / 計 約868（約9.6/日）。流入の最大源は Google 検索。
- Organic Search の週次推移（ISO週 W13〜W26）: 17→24→31→30→40→40→41→48→38→35→39→53→**76**→63。約90日で **約4倍** に増加し、週次の振れも大きい（例 W24 53→W25 76→W26 63 で±40%級）。この増加・変動は**サイトが Google にインデックス・評価されていく過程**によるもので、特定のデザインリリースとは無関係。
- 自分の結論: **リリース前後の指標差を design 効果に帰属できない**。Organic の右肩上がり＋週次変動が、ゲーム1本のデザイン変更の効果を完全に覆い隠す。**before/after 比較は本サイト規模では成立しない**（自分の集計で確認した事実）。

### constitution と照らした自分の判断

- Goal（唯一の基準）: 来訪者に最高の価値を提供して PV を最大化する。決定原則（CLAUDE.md L9）: 実装コストは UX で劣る方式を選ぶ理由には決してならない。ルール4: あらゆる面で来訪者にとって最高の品質。
- 4つの理由を一つずつ照らす:
  1. 「確立した方向だから」: (new) が来訪者に良いという確証は無い（未検証の判断）。「現状そうだから正しい」は判断の放棄であり、Goal に照らした判断ではない。**無効**。
  2. 「観測量が足りない」: 本サイト規模の A/B は統計的有意性を取る道具ではなく、**同時期に来た来訪者へ旧/新を提示し一人ひとりの反応を観る**手段。観測量が少ないと分かることは限られるが、それは「やらない理由」ではない。before/after が無効である以上、**A/B が唯一、デザイン変数を分離できる方法**である。**無効**。
  3. 「before/after で見ればよい」: 上記の自己検証どおり成立しない。**無効**。
  4. 「実装コスト」: 決定原則が明示的に禁じる理由。**無効**。

### 今もこの判断は正しいと思うか → いいえ（正しくなかった）

来訪者にとって (new) が (legacy) より良いかは**未検証の賭け**であり、それをサイト全体へ広げている。良し悪しを知る唯一の有効な方法は、同時期の来訪者に両方を見せて一人ひとりの反応を観る A/B である（before/after は Google 変動に覆われて使えないことを自分で確認した）。コストはやらない理由にならない。よって、**ゲーム移行（および (new) 移行全体）を A/B 検証せず信仰で出荷したのは、唯一の基準＝来訪者価値に照らして正しくなかった**と今は判断する。kanji-kanaru は既に出荷済みだが、この判断は誤りとして記録し、残りのゲーム移行と (new) 全体の出荷方針を、A/B 検証を組み込む形へ再検討する（B-545）。

### 正直な留保（自己点検が「迎合」に流れないための歯止め）

- 「あらゆるデザイン変更を A/B せよ」とは考えない。小さく自明な改善は設計判断で出してよい。問題は、**サイト全体のデザイン言語を丸ごと置き換える大きな未検証の賭け**を、検証手段（A/B）を自分たちで作ってあるのに、信仰のまま広げている点。ゲーム移行はその賭けの続きで、クイズだけ検証して他を免除するのは一貫しない。

### 自己訂正: 「トラフィックが希少だから検証範囲を狭める」は逆さまの不合理

当初この記録で「ゲーム流入は約33PV/90日と薄いから A/B の観測量が足りない」と書き、希少なトラフィックを**範囲を絞る理由**に使っていた。これは不合理。約9.6セッション/日という数字は**全トラフィックの合計**であり、A/B を1つの面に絞れば観測できるのはそのうちその面に来た一握りだけ＝**範囲を狭めるほど観測数は減る**。希少なものをさらに捨てている。

正しい論理は逆で、**トラフィックが希少だからこそ実験は最大限に広く取る**べきだった。独立変数を「ページ」ではなく**デザインシステム全体（legacy か new か）**に取り、各来訪者を端末単位で永続的に旧/新へ割り当て、**どのページに来てもその arm のデザインで描画する**。そうすれば全セッションが着地ページに関わらず単一の問い「(new)は来訪者に良いか」に寄与する。実験の単位は**ページではなくデザインシステム**であるべき。

- よって現状の「一片だけ A/B」は希少トラフィックの最も非効率な使い方（残り全ページの信号を捨てている）。「各ページを個別に A/B」も誤り（多数の飢えた実験に分割するだけ）。正解は**全面を貫く1本の legacy-vs-new 実験**。
- この帰結として、移行が legacy を削除していく構造（(legacy)→(new)・Phase 11 で old-globals 等削除）は、正しい検証（両システムを同時に生かして対照する）と衝突する。コストは反対理由にならない。before/after は Google 変動に覆われて無効（前述の自分の集計）なので、唯一有効なのはこの同時期・個人単位・全面の対照観測。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
