---
id: 185
description: B-334 Phase 4.4「トップ `/` の `(new)/` 配下への移行」。`src/app/(legacy)/page.tsx`（旧コンセプト「占い・診断パーク」前提のトップ）を新デザインシステムに沿って `src/app/(new)/page.tsx` として移行し、Phase 5（B-331 検索コンポーネント実装）以降が動ける土台を整える。本サイクルではトップの**新デザインへの移行**のみを対象とし、新コンセプト「日常の傍にある道具」への本文書き換えと道具箱化（タイル並び替え・編集モード等）は Phase 9.2（B-336）のスコープとして温存する。
started_at: "2026-05-10T20:28:34+0900"
completed_at: null
---

# サイクル-185

このサイクルでは、新デザイン移行 Phase 4 の最終サブフェーズである Phase 4.4（トップ `/` の `(new)/` 配下への移行）を実施する。cycle-181 で Phase 4.1（/tools）、cycle-182 で Phase 4.2（/play）、cycle-183 で Phase 4.3（/blog）が完了し、トップ `/` だけが `(legacy)/` に残っている状態。Phase 5 以降（B-331 検索コンポーネント実装、B-335 ブログ詳細移行、…）はすべて「Phase 4（B-334）完了」を着手条件とするため、本サイクルで Phase 4.4 を完了させて Phase 4 全体を閉じることが本サイクルの目的。

## 実施する作業

- [x] **B-334-4-1: ルート移行（`git mv`）と事前確認** （commit `52d99ae4`、reviewer 承認）
  - [x] **事前確認 1（依存 grep）**: 後述「事前確認結果」の 4 点（`@/components/common/*` 直接 import = 0 件 / TrustLevelBadge 使用 = 0 件 / FortunePreview 依存先 / PlayContentTabs 依存先）を builder 自身で再 grep し、PM 記載値と一致することを確認
  - [x] **事前確認 2（layout 並べ読み 4 列テーブル）**: `(legacy)/layout.tsx` と `(new)/layout.tsx` の「項目 / legacy / new / 差分メモ」4 列テーブルを `./tmp/cycle-185-layout-diff.md` として作成。観点はメタデータ（`sharedMetadata` の双方適用）/ provider 群（GoogleAnalytics / AchievementProvider / ThemeProvider）/ Header の actions（StreakBadge / ThemeToggle 有無）/ CSS（globals.css / old-globals.css）/ JSON-LD（`generateWebSiteJsonLd` 双方適用）。このテーブルを B-334-4-3 のチェック根拠とする
  - [x] `(legacy)/page.tsx` / `page.module.css` / `opengraph-image.tsx` / `twitter-image.tsx` / `__tests__/page.test.tsx` を `(new)/` 配下へ `git mv`
  - [x] `(legacy)/_components/FortunePreview.tsx` および `FortunePreview.module.css` を `src/play/fortune/_components/` 配下へ移動（フィーチャ密結合のため）
  - [x] `(legacy)/_components/PlayContentTabs.tsx` および `PlayContentTabs.module.css` を `src/play/_components/` 配下へ移動（複数 play コンテンツを束ねるためフィーチャトップ層が自然）
  - [x] import パス修正（`(legacy)/page.module.css` への直接依存解除を含む。事前確認で `@/components/common/*` 直接 import が page.tsx 自身には 0 件と確認されたため、当該置換は対象外）
  - [x] TrustLevelBadge は事前確認で使用 0 件と確認済み。「対象外」と作業ログに記録
- [x] **B-334-4-2: 新デザイン適用（DESIGN.md 準拠の再設計）** （commit `ef4bfc81` + 修正 `6b30cfa2`、reviewer 承認）
  - [ ] 各セクション（Hero / PlayContentTabs / FortunePreview / 開発の舞台裏ブログ）に新トークン・新コンポーネント（Panel など）を適用。Section 4（開発の舞台裏ブログ）は **`BlogCard` を流用しない**（X10 採用。素朴な 3 行カード構造維持）
  - [ ] PlayContentTabs のカードスタイルを `(legacy)/page.module.css` から PlayContentTabs 自身の CSS Module へ分離
  - [ ] **CSS 変数の解決元切替に伴う実体確認**: `(legacy)/layout.tsx` は `old-globals.css`、`(new)/layout.tsx` は `globals.css` を import している。Phase 4.4 移行で `page.module.css` が参照する CSS 変数の解決元が切り替わる。**置換後に参照する `--bg`/`--fg`/`--accent`/`--muted`/`--border` 等の新変数が `globals.css` ですべて定義されていることを実体確認**（不在なら停止して PM に報告）。`old-globals.css` のみで定義されていた変数を新コードが参照すると、ライト/ダークの片方だけで崩れる事故が起き得るため、**ライト/ダーク両方で実体確認**する
  - [ ] CSS Modules の `--color-*` → `--bg`/`--fg`/`--accent` 置換、`:root.dark` → `:global(:root.dark)` 修正
  - [ ] a11y: 44px タップターゲット個別上書き継承、`focus-visible`、コントラスト 4.5:1
  - [ ] **PlayContentTabs のセマンティクス（PM 判断・確定）**: URL 非同期（現行 `useState<TabId>`）を維持し、ARIA tab パターン（`role="tablist"` / `role="tab"` / `aria-selected` / `aria-controls` / `role="tabpanel"` / `aria-labelledby`）を採用する。現行コードが既に当該 ARIA 属性を持っているため、新デザイン適用後も同属性を欠落させないこと。判断根拠は §検討した他の選択肢 X7 を参照
- [x] **B-334-4-3: メタデータの整備** （reviewer 承認、コード変更なし）
  - [x] `(new)/page.tsx` の `metadata` export が機能することを確認（description / openGraph / twitter は旧コンセプト「占い・診断パーク」のまま **触らない**）→ `(new)/page.tsx` L19-40 で `Metadata` 型注釈付きで宣言、L22 / L26 / L35 の文言は旧コンセプトのまま不変、`npm run build` でルート `/` が `○ (Static)` として正常 prerender 確認済み
  - [x] `generateWebSiteJsonLd()` の description（`src/lib/seo.ts`）も Phase 9.2 まで **触らない** ことを確認 → `src/lib/seo.ts` L184-185 の description「笑える占い・性格診断がいっぱいの占い・診断パーク。AIが運営する実験サイトで…」が不変、本サイクルの 3 commit (`52d99ae4` / `ef4bfc81` / `6b30cfa2`) で `src/lib/seo.ts` への変更ゼロ
  - [x] **layout 親メタデータ等価性の実体確認**: `(legacy)/layout.tsx` L10/L12 と `(new)/layout.tsx` L11/L13 の双方が `import { sharedMetadata } from "@/lib/site-metadata"` + `export const metadata: Metadata = sharedMetadata` で完全等価。双方とも `generateWebSiteJsonLd()` を `<script type="application/ld+json">` に注入。OGP / Twitter / canonical / robots / metadataBase 等価性は構造的に保証される。`tmp/cycle-185-layout-diff.md` の 4 列テーブルで根拠記録済み（UI 層差分は等価性に影響なしと明記）
- [x] **B-334-4-4: テスト更新** （commit `c0f45ddb`、reviewer 承認 + Blocking 1 件への対応として PM 判断記録を追記）
  - [x] `(new)/__tests__/page.test.tsx` の import パス・依存コンポーネント参照を新構造へ修正（B-334-4-1 / B-334-4-2 で完了済み、本タスクで再確認）
  - [x] **CSS 文字列マッチ assertion の意味再表現（壊れたら削除を禁ずる）**: 3 件中 1 件（7-4）は DOM 階層検証に再表現済み。残る 2 件（7-6 系）は **C 案（CSS 文字列マッチ現状維持）を採用** → §PM 判断ログ参照
    - 7-4: dailyBadge is a direct child of featuredCard → **DOM 階層検証で再表現済み**（`querySelectorAll("[class*='featuredCardTitleRow']")` 内に `[class*='dailyBadge']` が 0 件であることを確認）
    - 7-6: seeAllLink padding is at least 0.6rem vertical → **C 案採用（CSS 文字列マッチ現状維持）**
    - 7-6: mobile featuredCardCta has increased padding and font-size → **C 案採用（CSS 文字列マッチ現状維持）**
  - [x] 主要 assertion（メタデータ存在 / 各セクションのレンダリング / 44px タップターゲット / ARIA tab パターン `role="tablist"` / `role="tab"` / `aria-selected="true"`/`"false"` / `role="tabpanel"` + `aria-labelledby`）が機能していることを確認。`role="status"` 空状態は PlayContentTabs に該当する経路がデフォルト 6 件存在のため対象外
  - [x] **追加 assertion**: Panel-in-Panel 解消保証（`FortunePreview.module.css` の `.card` ブロックに `border-left/right/bottom/radius` がないこと、`border-top: 5px` のアクセント帯のみ残存）

#### PM 判断ログ（B-334-4-4 reviewer 指摘 Blocking 1 件への対応）

reviewer は計画書 L168-170 が 7-6 系 2 件について「`getComputedStyle` または class 存在以外の検証方法（要素ロール + 構造的位置関係 / 実測サイズ / DOM 階層関係）で再表現」と指示していたのに対し、builder が C 案（CSS 文字列マッチ現状維持）を採用した点を Blocking として指摘した。PM 判断として以下を確定:

- **jsdom 環境制約の実体**: jsdom は CSS Modules を `getComputedStyle` で解決しない（class 名は hash されるため `.seeAllLink` のような固定 selector で値を取れない）。計画書 L169 の「実測検証」は本プロジェクトの test 環境では実装困難。
- **直接値であることの実体確認**: `(new)/page.module.css` `.seeAllLink` の `padding: 0.6rem 1.5rem`、`PlayContentTabs.module.css` `.featuredCardCta` モバイル用 `font-size: 0.75rem` は **直接値**で書かれており、トークン参照ではない（`var(--space-*)` 等を使っていない）。
- **「壊れたら削除」防止としての機能**: CSS 文字列マッチでも、padding 値や font-size 値を変える変更は検出される。`0.6rem` の値が `0.4rem` に下げられたり、`font-size: 0.75rem` が削除された場合、test は失敗する。意味としての 44px タップターゲット保証 / mobile タップ領域確保は維持される。
- **将来トークン化時の再表現申し送り**: もし将来 `padding` や `font-size` が `var(--space-*)` 等のトークン参照に切り替わった場合、CSS 文字列マッチは false negative になる可能性がある。その時点で `getComputedStyle` ベース or DOM 構造ベースの再表現を行う。本サイクルではトークン未化のため C 案で十分と判断。

PM として C 案を承認する。本判断は AP-WF11（PM 並べ読み・判断記録の成果物化）に従い、cycle-185.md に明文化することでトレーサビリティを維持する。

- [x] **B-334-4-5: 視覚検証（PM 自身が `take-screenshot` skill で実施）** （reviewer Major 3 件指摘 → `git worktree` で移行前撮影を取り直し、対照記述に書き直して対応。詳細は `tmp/cycle-185-visual-review.md`）
  - [x] **必須（AP-WF05 N × 4 ルール準拠）**: ページ全体（縦長スクロール含む） × w360 / w1280 × light / dark = 4 枚を撮影 → 移行前後 8 枚（4 ペア）を `tmp/cycle-185-screenshots/{before/,}` に保存
  - [ ] **推奨（事故防止の追加観点）**: 各セクション（Hero / PlayContentTabs / FortunePreview / 開発の舞台裏ブログ）のファーストビュー時の見た目を確認するため、セクション 4 つを区切って同 4 パターンで撮影（合計 16 枚追加） → **省略**（必須撮影で 4 セクションすべて画像内に収まるため、追加 16 枚は冗長と判断）
  - [x] **移行前後比較**: 主軸は **着手前撮影**。**着手前撮影は本サイクルでは取り忘れたが**、commit 後の `git worktree add /mnt/data/yolo-web-pre 2a53f933` で kickoff commit を別 worktree に展開、port 3001 で起動して撮影することで復旧した。次サイクルから運用ルールに昇格（§キャリーオーバー参照）
  - [x] 移行前後で「同等以上」（コンセプトに沿った改善）を満たしているかを評価 → 視覚差分 7 件（ピル全廃 / 角丸 2 値統一 / Panel-in-Panel 解消 / dark hover 対称化 / Footer トークン適用 / Header actions slot 追加 / バッジ形状統一）を実体観察し、3 軸（魅力度 / シンプルさ / わかりやすさ）すべてで「同等以上」と判定
  - [x] **OGP / Twitter 画像の実機表示確認**: `/opengraph-image-xge9u7` `/twitter-image-xge9u7` ともに 200 OK + 31065 bytes + 画像崩れなしを確認
  - [x] AP-I01 補強の 3 軸（魅力度 / シンプルさ / わかりやすさ）の 1 文評価を作業ログに残す → `tmp/cycle-185-visual-review.md` の §AP-I01 補強の 3 軸評価セクションに記載
- [x] **B-334-4-6: a11y 完了基準の確認（WCAG 2.4.5 Multiple Ways）** （reviewer 承認、観察 commit `3cfa0cf3` + PM 判断 commit `07485a39`、`tmp/cycle-185-a11y-review.md` に結果記録）
  - [x] トップへの複数経路（Header ロゴ / Footer / sitemap.xml / 直接 URL）が新デザインで機能していることを確認・記録 → Header ロゴ ✅ / sitemap.xml ✅ / 直接 URL ✅ / Footer `/` リンクは以下参照
  - [x] **Footer の `/` リンクの判断軸**: Footer に `/` への明示的 Link が存在するかを確認 → **存在しない**（21 リンクすべてを Playwright で実体確認）。PM 判断として **(a) 充足とみなす** を採用：Header ロゴ（慣例的ホームナビ）+ sitemap.xml + 直接 URL の 3 経路で WCAG 2.4.5 を充足とみなす。Footer への追加は scope creep のため不採用。
  - [x] A-6 中評価対応として、検索を a11y 経路として強く頼らない設計が維持されていることを確認 → Header ナビ（ツール/遊び/ブログ/サイト紹介）+ Footer 21 リンクで検索非依存の複数経路が維持されている ✅
  - [x] **Header actions slot 差分の機能確認**: StreakBadge は streak >= 1 時に表示（streak=0 は by-design 非表示）、ThemeToggle は常時表示。localStorage に正規フォーマットで streak.current=5 を仕込んで再確認済み ✅
  - [x] **Header actions slot の a11y 観測**: StreakBadge ✅（44x44px / `aria-label` 動的設定）、ThemeToggle ⚠️（52x28px / `role="switch"` + `aria-label` ✅ / `focus-visible` ✅ / タップターゲット高さ 28px は既存実装の問題）、検索ボタン desktop ⚠️（32x32px）/ mobile ✅（44x44px）— 実装変更は Phase 5 以降の申し送り
- [ ] **B-334-4-7: 完了基準の通過確認**
  - [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功
  - [ ] `npm run build` 出力の First Load JS（ルート `/`）が移行前と同等以下であることを実測値で確認。悪化していたら PM に報告
  - [ ] `(legacy)/page.tsx` / `_components/FortunePreview.tsx` / `_components/PlayContentTabs.tsx` / `opengraph-image.tsx` / `twitter-image.tsx` / `__tests__/page.test.tsx` / `page.module.css` が `(legacy)/` 配下から消えていることを `ls` で実体確認
  - [ ] **B-334 ライフサイクル整合性の実体確認**: `grep -n 'B-334' docs/backlog.md` で B-334 が Active セクションから消え Done セクションに移動していることを実体確認（実際の昇格処理は `/cycle-completion` で行うが、Phase 4.4 完了をもって B-334 全体が Done に上がるべき状態であることを cycle-185 PM の責務として確認する）
  - [ ] Phase 4 完了によって Queued へ昇格すべき Deferred 項目（B-310 / B-331 / B-335 等）のリストアップ（実際の昇格は `/cycle-completion` で実施）

## 作業計画

### 目的

- **何のために、誰のためにやるのか**: トップ `/` は M1a（初回来訪者）と M1b（リピーター）双方の最重要入口。Phase 4 完了は Phase 5（B-331 検索コンポーネント結線）/ Phase 6（B-335 ブログ詳細移行）/ Phase 7（B-314 ツール・遊び詳細）/ Phase 8（cheatsheets ブログ化、辞典移行）等の着手条件であり、Phase 4.4 が残っている限りこれら後続 Phase が起動できない。本サイクルで Phase 4.4 = `(legacy)/page.tsx` の `(new)/page.tsx` への移行を完了させ、Phase 4 全体を閉じることが本サイクルの目的。
- **ターゲットの likes/dislikes との対応**:
  - 旧トップのコンテンツ（占い・診断パークのコピー）はそのまま動かす方針。コピーレベルの likes/dislikes 対応（M2 / M3 のニーズへの再適応など）は Phase 9.2（B-336）のスコープ。本サイクルではコピー書き換えに踏み込まない（cycle-180 申し送り / design-migration-plan.md L117 で確立済み）。
  - 「新デザイン体系に乗せる」ことで M1b dislikes「URL が変更されたコンテンツにリダイレクトが設定されておらず辿り着けなくなる」「慣れた操作手順が突然変わる」が起きないよう、URL 不変・既存セクション構造維持を保証する。

### 作業内容

タスクは Phase 4.1〜4.3 で確立した「主タスク = 1 builder = 1 commit」原則と命名規則 `B-334-4-{連番}` を踏襲する。スコープ境界（Phase 4.4 でやること / Phase 9.2 で待つこと）を作業中も常に参照できるよう、各タスク内で明示する。

#### タスク並行可否マトリクス

| タスク                   | 主な編集ファイル                                                                                                            | 直列必須の前提                                                                              | 並行可能なタスク                             | 担当                                                             |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------- |
| B-334-4-1 ルート移行     | `(legacy)/page.tsx` → `(new)/page.tsx` ほか移送対象一式、`_components/FortunePreview.*`、`_components/PlayContentTabs.*`    | （初手）                                                                                    | なし                                         | builder（同一）                                                  |
| B-334-4-2 新デザイン適用 | `(new)/page.tsx`、`(new)/page.module.css`、`PlayContentTabs.tsx`、`PlayContentTabs.module.css`、`FortunePreview.module.css` | B-334-4-1 完了（移送後の新パスでないと編集できない）                                        | なし                                         | builder（同一）                                                  |
| B-334-4-3 メタデータ整備 | `(new)/page.tsx`（metadata 確認のみ）、`./tmp/cycle-185-layout-diff.md` 参照                                                | B-334-4-1 完了（移送後でないと親 layout が確定しない）                                      | なし（B-334-4-2 と編集対象が重なるため直列） | builder（同一）                                                  |
| B-334-4-4 テスト更新     | `(new)/__tests__/page.test.tsx`                                                                                             | B-334-4-2 完了（DOM 構造 / class 名が確定してから assertion を再表現する必要がある）        | なし                                         | builder（同一）                                                  |
| B-334-4-5 視覚検証       | （撮影成果物のみ）                                                                                                          | B-334-4-4 まで完了（移行後の表示が安定してから撮影）                                        | なし                                         | **PM 自身**（Playwright MCP 経由で foreground sub-agent に委任） |
| B-334-4-6 a11y 確認      | （観測ログのみ）                                                                                                            | B-334-4-2 以降完了（複数経路と Header actions slot が新デザイン適用後でないと確認できない） | B-334-4-5 と一部並行可（観測対象が異なる）   | **PM 自身**                                                      |
| B-334-4-7 完了基準       | （確認のみ。`backlog.md` を含む）                                                                                           | B-334-4-1〜4-6 完了                                                                         | なし                                         | builder + PM                                                     |

**並行可否の方針（PM 判断）**: B-334-4-1 から B-334-4-4 までは **同一の `(new)/page.tsx` / `(new)/page.module.css` / `(new)/__tests__/page.test.tsx` への変更が交錯**するため、すべて **同一 builder で直列実行**する。AP-WF10「タスク粒度の適切性」の観点で見ると、1 builder で 4 タスク連続は通常やや多いが、本サイクルの Phase 4.4 は (a) ファイル単位の編集が完全に重なる、(b) 工程順（移送 → 適用 → メタデータ確認 → テスト更新）が因果的に逆転不可能、(c) 並行化のために中断点を作るとレビューラウンドが増える、という 3 点で「同一 builder 直列」が最適。B-334-4-5 / B-334-4-6 は **PM 自身が実施**（builder の作業ではない）であり、Playwright MCP / `take-screenshot` skill を foreground sub-agent 経由で利用する。B-334-4-7 は完了確認のため builder + PM の協働。

#### スコープ境界の再確認（cycle-184 事故の再発防止）

| スコープ                                                      | Phase 4.4（本サイクル） | Phase 9.2（B-336） |
| ------------------------------------------------------------- | ----------------------- | ------------------ |
| `(legacy)/page.tsx` → `(new)/page.tsx` への `git mv`          | 対象                    | 対象外             |
| 新デザインへの適用（Panel / トークン / Suspense / a11y 等）   | 対象                    | 対象外             |
| FortunePreview / PlayContentTabs のフィーチャ層への移送       | 対象                    | 対象外             |
| トップのコンテンツ（現「占い・診断パーク」）の書き換え        | 対象外                  | 対象               |
| 新コンセプト「日常の傍にある道具」への切替                    | 対象外                  | 対象               |
| 道具箱化（タイル並び替え・編集モード・localStorage 永続化）   | 対象外                  | 対象               |
| `metadata.description` / `generateWebSiteJsonLd()` の文言更新 | 対象外                  | 対象               |
| about / Header / Footer のコンセプト切替                      | 対象外                  | 対象               |

#### B-334-4-1: ルート移行（`git mv`）と事前確認

##### 事前確認結果（PM が実体確認済み・builder が再 grep で一致を検証する）

PM が `grep -rn` および `Read` で実体確認した結果、以下が確定している。builder は同等の grep を実行して一致を検証したうえで作業に着手すること（不一致なら停止して PM に報告）。これにより builder が grep に時間を溶かすのを防ぐ。

1. **`@/components/common/*` の直接 import 件数（`(legacy)/page.tsx` 自身）**: 0 件。`(legacy)/page.tsx` は `@/components/common/*` から直接 import していない（dictionary 配下が使っているのは別件・本サイクル対象外）。したがって標準手順「common 撤去」のうち page.tsx 本体に対する置換作業は対象 0 件。
2. **TrustLevelBadge 使用件数（`(legacy)/page.tsx` および `_components/FortunePreview.tsx` / `PlayContentTabs.tsx`）**: 0 件。標準手順「TrustLevelBadge 撤去」は対象 0 件のため「対象外」とログに記録するのみ。
3. **`FortunePreview.tsx` の依存先**: `react`（`useSyncExternalStore`）/ `next/link` / `@/play/fortune/fortuneStore`（および同モジュール経由の関連 export）/ `@/play/fortune/_components/StarRating` / 自身の CSS Module。フィーチャ密結合のため `src/play/fortune/_components/` への移送が自然。
4. **`PlayContentTabs.tsx` の依存先**: `react`（`useState`）/ `next/link` / `@/play/types`（`PlayContentMeta`）/ `@/play/paths`（`getContentPath`）/ `@/play/color-utils`（`getContrastTextColor`）/ `../page.module.css`（`import cardStyles from "../page.module.css"`）/ 自身の CSS Module（`import styles from "./PlayContentTabs.module.css"`）。`cardStyles` 経由で参照される **`(legacy)/page.module.css` のカードクラス 10 種**（`featuredCard` / `featuredCardIcon` / `featuredCardIconWrapper` / `featuredCardTitleRow` / `featuredCardTitle` / `featuredCardMeta` / `featuredCardQuestionCount` / `featuredCardDescription` / `featuredCardCta` / `dailyBadge`）に密結合しているため、B-334-4-2 で **PlayContentTabs 自身の CSS Module に分離** する必要がある。

##### layout 並べ読み 4 列テーブルの作成（cycle-180 Major-2 同型事故の予防）

`(legacy)/layout.tsx` と `(new)/layout.tsx` の差分を「項目 / legacy / new / 差分メモ」4 列テーブルで `./tmp/cycle-185-layout-diff.md` に成果物として残す。観点は最低でも以下:

- `metadata` export（双方とも `sharedMetadata`（`src/lib/site-metadata.ts`）を適用 → OGP / Twitter / canonical / robots / keywords / metadataBase が等価）
- JSON-LD（双方とも `generateWebSiteJsonLd()` を `<script type="application/ld+json">` で注入 → JSON-LD 等価）
- provider 群（`ThemeProvider` / `AchievementProvider` / `GoogleAnalytics`）の有無と順序
- `Header` の actions slot（new 側のみ `StreakBadge` + `ThemeToggle` を渡す）
- `Footer`（双方）
- CSS（legacy: `../old-globals.css` / new: `@/app/globals.css`）

このテーブルは B-334-4-3「layout 親メタデータ等価性の実体確認」のチェック根拠になるため、Phase 4 完了後も `./tmp/` に残し、cycle 完了処理時にキャリーオーバーで参照可能にする（破棄しても支障はないが、次サイクルで Phase 7 統合を扱う場合に再利用できる）。

##### 移送ファイル一覧

- `src/app/(legacy)/page.tsx` → `src/app/(new)/page.tsx`
- `src/app/(legacy)/page.module.css` → `src/app/(new)/page.module.css`（B-334-4-2 で大幅改修するが、まず移送）
- `src/app/(legacy)/opengraph-image.tsx` → `src/app/(new)/opengraph-image.tsx`
- `src/app/(legacy)/twitter-image.tsx` → `src/app/(new)/twitter-image.tsx`
- `src/app/(legacy)/__tests__/page.test.tsx` → `src/app/(new)/__tests__/page.test.tsx`
- `(legacy)/_components/FortunePreview.tsx` および `FortunePreview.module.css` を `src/play/fortune/_components/` 配下へ移送（既に `@/play/fortune/fortuneStore` 等を import しており、フィーチャ内同居が自然。`docs/knowledge/nextjs-directory-architecture` に沿う）
- `(legacy)/_components/PlayContentTabs.tsx` および `PlayContentTabs.module.css` を `src/play/_components/` 配下へ移送（複数の play コンテンツを束ねるためフィーチャトップ層が自然）
- import パス修正（`(legacy)/page.module.css` への直接 import 解除。`@/components/common/*` の直接 import は事前確認 1 のとおり page.tsx 自身には 0 件のため当該置換は対象外）

#### B-334-4-2: 新デザイン適用（DESIGN.md 準拠の再設計）

旧 4 セクション構造（Hero / PlayContentTabs / FortunePreview / 開発の舞台裏ブログ）は維持し、新デザイン体系に乗せ替える。design-migration-plan.md L298 の「旧 UI の構造をそのまま維持するのではなく、必要に応じて構造そのものを変える」は許容範囲だが、トップは「複合ランディング」であり一覧ではないため、Phase 4.1〜4.3 で確立した 4 層アーキテクチャ（ListView / FilterableList / Grid / Card）を機械的に当てはめない（X1 で詳述）。

- **Section 1（Hero）（PM 判断・確定）**: 新トークン適用 + CTA 動線見直し。**Panel 化はしない**（X8 を参照）。Hero は来訪者が最初に視認する装飾的ランディング要素であり、Panel（カード型の枠）に入れると Hero 自体が小さく見えコンセプト訴求が弱まる。Phase 4.1〜4.3 でも Hero は Panel 外配置で統一されている。背景グラデーションや余白で領域を表現し、Panel は中身の繰り返し要素（カード群）にのみ使う。**CTA 動線**は現行（占い・診断パークへの導線）を維持し、新コンセプト切替は Phase 9.2 で扱う。
- **Section 2（PlayContentTabs）**: タブ UI を新デザイン体系で再実装。`(legacy)/page.module.css` のカードクラス群（`featuredCard` / `featuredCardIconWrapper` 等の 10 種、事前確認 4 のとおり）への密結合を解消し、`PlayContentTabs.module.css` に分離。
  - **タブのセマンティクス（PM 判断・確定）**: 現行が URL 非同期（`useState<TabId>`）であり、トップ共有時にタブ位置保持の必要性は低い（M1a 初回来訪者 / M1b リピーターの認知モデル上、タブはランディングセクション内の表示切替であり共有・ブックマーク対象になり得ない）。本サイクルでも **URL 非同期を維持** し、ARIA tab パターン（`role="tablist"` / `role="tab"` / `aria-selected` / `aria-controls` / `role="tabpanel"` / `aria-labelledby`）を採用する。これは Phase 4.1〜4.3 のフィルタ（URL 同期 + `aria-current="page"`）とは異なるセマンティクスで、来訪者の認知モデル上の差異（フィルタ = 一覧の絞り込み = 共有・ブックマーク対象 / タブ = ランディングセクション内の表示切替 = 共有不要）に基づく。現行コードが既に当該 ARIA 属性を持っている（`PlayContentTabs.tsx` L105-129 で `role="tablist"` / `role="tab"` / `aria-selected` / `aria-controls` / `role="tabpanel"` / `aria-labelledby` を実装済み）ため、新デザイン適用後も当該属性を **欠落させないこと**。
  - 不採用案として「PlayContentTabs を Phase 4.1〜4.3 と揃えて URL 同期化する」がある（X7 を参照）。
- **Section 3（FortunePreview）（PM 判断・確定）**: 新トークン適用 + Panel 化する（X9 を参照）。FortunePreview は「占いの結果プレビュー + CTA」というカード性の強い情報のため、Panel に入れて他セクションと視覚的に揃える。`fortuneStore` の hydration 挙動（`useSyncExternalStore`）は **絶対に壊さないこと**。具体的には `useSyncExternalStore` の subscribe / getSnapshot / getServerSnapshot の 3 引数構造を維持し、SSR 時の `getServerSnapshot` を欠落させない。
- **Section 4（開発の舞台裏ブログ）（PM 判断・確定）**: **`BlogCard` を流用しない**。現状の素朴な 3 行カード構造（`<h3>` + `formatDate` + description）を維持し、**新トークン適用と `:global(:root.dark)` 修正のみで再描画**する。判断根拠は X10 を参照。`BlogCard` の冒頭コメントが「`/blog` 一覧専用、詳細ページの関連表示には RelatedArticles を使う」と明示しており、トップ流用は設計意図と齟齬する。また現行 `BlogCardProps.post` は `slug / title / description / published_at / readingTime / tags` のみ（カバー画像フィールドは存在しない）であり、`href` も内部 `/blog/${slug}` 固定で差し替え不可（destructive 変更が前提となる）。
- **CSS Modules**: `--color-*` → `--bg`/`--fg`/`--accent` 系の置換、`:root.dark` → `:global(:root.dark)` 修正（`docs/knowledge/css-modules.md` 準拠）
- **a11y**: 44px タップターゲット（Button/Input が B-386 未完のため個別 CSS 上書きを Phase 4.1〜4.3 同様に継承）、`focus-visible`、コントラスト 4.5:1。
- **設計上の制約**: 4 セクション構造を維持するのは、Phase 9.2 でトップを道具箱化する際の出発点としての形を残すため。構造を解体すると Phase 9.2 の「現行トップ内容を別ページに移す / 統合する / 廃棄する」判断（design-migration-plan.md L239）が壊れる。

#### B-334-4-3: メタデータの整備

- `(new)/page.tsx` の `metadata` export 文言は **旧コンセプト「占い・診断パーク」のまま維持**（Phase 9.2 まで待つ。cycle-180 申し送り L735 で確立）。本サイクルでは触らない。
- `metadata` export が `(new)/` 側で正しく機能することを確認のみ。
- `generateWebSiteJsonLd()` の description（`src/lib/seo.ts`）も Phase 9.2 まで触らない。これは layout レベルで全ページに適用されるため、`(legacy)/layout.tsx` と `(new)/layout.tsx` の双方が呼んでいる構造を変更しない。
- 検索流入経路（`title` / `keywords`）は不変原則を踏襲（Phase 4.1〜4.3 と同方針）。
- **`opengraph-image.tsx` / `twitter-image.tsx` の取り扱い（PM 判断・確定）**: **文言・配色とも変更しない**（X4 の不採用根拠と整合）。Phase 9.2 でコンセプト切替と同時に文言・配色を一括更新する。本サイクルは `git mv` のみ。OGP/Twitter 画像は Next.js の Metadata API が自動でルートと紐づけるため、`(legacy)/` から `(new)/` へ物理移動するだけで配信パスは不変（`/opengraph-image` / `/twitter-image` のまま）。
- **layout 親メタデータ等価性の実体確認（cycle-180 Major-2 同型事故予防）**: Phase 4.4 で `(legacy)/page.tsx` から `(new)/page.tsx` に物理移動した瞬間、Next.js Metadata API の親が `(legacy)/layout.tsx` から `(new)/layout.tsx` に切り替わる。トップは SNS シェア影響が大きいため、親メタデータが OGP / Twitter / canonical 観点で完全等価であることを実体確認する。
  - 確認方法: B-334-4-1 で作成した `./tmp/cycle-185-layout-diff.md` の「項目 / legacy / new / 差分メモ」テーブルに基づき、`metadata` export と JSON-LD が双方とも `sharedMetadata`（`src/lib/site-metadata.ts`）と `generateWebSiteJsonLd()` を同じく適用していることを再確認する。
  - 既知の差分は OGP / canonical / Twitter には影響しない（Header の actions slot に `StreakBadge` + `ThemeToggle` を入れるか / CSS が `globals.css` か `old-globals.css` か）。これらは UI 層の差分であり、メタデータ等価性には無関係。差分テーブルにこの旨を明記する。

#### B-334-4-4: テスト更新

- `(new)/__tests__/page.test.tsx` の旧 import パス（`(legacy)/page.tsx` → `(new)/page.tsx`）と依存コンポーネント参照を修正。
- 旧テスト 488 行のうち、移行で意味を失う assertion（例: `(legacy)/_components/` への直接参照、`(legacy)/page.module.css` のクラス名直接検査）を新構造に合わせて修正。
- **CSS 文字列マッチ assertion の意味再表現（44px タップターゲット保証 / dailyBadge 位置の事故防止）**: 現行 `__tests__/page.test.tsx` には新構造で意味を失うが **本来の検証意図は新構造でも維持されるべき** assertion が 3 件ある。新デザインで「class 名が消える」「padding 値が変わる」場合に「壊れたから削除」してしまうと、44px タップターゲット保証や dailyBadge 位置の保証が欠落する事故になる。以下 3 件は **assertion の意味を新構造で再表現** すること。CSS 文字列マッチではなく、`getComputedStyle` または class 存在以外の検証方法（要素ロール + 構造的位置関係 / 実測サイズ / DOM 階層関係）で再表現する。
  - **7-4「dailyBadge is a direct child of featuredCard, not inside featuredCardTitleRow」**: 「毎日更新バッジが、カードのタイトル行の中ではなくカード直下に位置する」ことを保証する assertion。新構造では DOM 階層関係（バッジ要素がタイトル行要素の子孫ではないこと）として再表現する。
  - **7-6「seeAllLink padding is at least 0.6rem vertical to ensure 44px tap target」**: 「もっと見る」リンクの 44px タップターゲットを保証する assertion。新構造では `getComputedStyle(linkElement)` で `padding-top + padding-bottom + line-height` ≥ 44px を実測検証するか、または対応する 44px タップターゲット class を継承していることを構造的に検証する。
  - **7-6「mobile featuredCardCta has increased padding and font-size」**: モバイル幅でカード CTA のタップ領域が確保されていることを保証する assertion。新構造でも同等の検証を `matchMedia` モック + `getComputedStyle` で行うか、モバイル用 class の付与を構造的に検証する。
  - 「壊れたから削除」は **明示的に禁止** する。新構造で再表現できない場合は PM に報告して再判断を仰ぐ。
- 主要 assertion: メタデータの存在、各セクション（Hero / PlayContentTabs / FortunePreview / Blog Top3）のレンダリング、`role="status"` 空状態（PlayContentTabs に該当する場合のみ）、ARIA tab パターン（`role="tablist"` / `role="tab"` / `aria-selected`）、44px タップターゲット、dailyBadge 位置、mobile タップ領域。
- 旧テストの「メタデータが『占い・診断』テーマを含み『ツール』を含まない」assertion は **Phase 9.2 で書き替えになる前提の現状維持** とし、本サイクルでは保持する。

#### B-334-4-5: 視覚検証（PM 自身による実施）

AP-WF05 の N × 4 ルールに準拠する。N = 1（ページ全体を 1 ページとして扱う）が必須、追加でセクションごとの 4 パターン撮影を推奨する。

- **必須（AP-WF05 N × 4 ルール準拠）**: ページ全体（縦長スクロールを含む） × w360 / w1280 × light / dark = **4 枚**
- **推奨（事故防止の追加観点）**: 各セクション（Hero / PlayContentTabs / FortunePreview / 開発の舞台裏ブログ）のファーストビュー時の見た目を確認するため、セクション 4 つを区切って同 4 パターン（w360 / w1280 × light / dark）で撮影することも推奨（合計 16 枚追加）。各セクションが画面トップに来た時のスクロール位置で撮影することで、セクション単位のレイアウト崩れ（カード等高 / 余白 / グラデーション境界）を早期発見できる。
- **移行前後比較の手順（主軸 = 着手前撮影）**: `/take-screenshot` skill の運用ルールに従う。**主軸は移行作業着手前に旧状態を撮影しておくこと**。`git stash` による事後復元は取り忘れた場合の例外フローとして区別する。
  1. **着手前撮影（主軸）**: B-334-4-1 着手前に PM が旧 URL（`/`）の現状を 4 パターン（必須 4 枚 / 推奨込みで最大 20 枚）撮影し保管
  2. B-334-4-1 〜 B-334-4-4 を実施
  3. **移行後撮影**: 同 URL（`/`）で同 4 パターン再撮影
  4. 4 ペア × 必要枚数で並べて比較
- **例外フロー（取り忘れた場合のみ）**: 着手前撮影を取り忘れたまま移行作業に入ってしまった場合、`git stash` で移行差分を退避 → 旧状態を再現して撮影 → `git stash pop` で移行差分を復元する事後手順を取る。これは主軸ではなくあくまで例外であり、原則は手順 1 で先撮りする。
- 移行前後で「同等以上」（コンセプトに沿った改善）を満たしているか評価。
- AP-I01 補強の 3 軸（魅力度 / シンプルさ / わかりやすさ）の 1 文評価を計画書または作業ログに記録。
- 観測必須項目（cycle-181〜183 共通 + 本サイクル特有）: カード等高 / 44px タップターゲット / ARIA tab パターン（`aria-selected` のスタイル反映）/ 空状態 `role="status"`（該当時）/ Hero グラデーション or 新デザイン Hero の見た目 / ダークモード時のコントラスト / **Header actions slot に表示される `StreakBadge` / `ThemeToggle`（`(legacy)/layout.tsx` では非表示だったが `(new)/layout.tsx` では表示される。Phase 4.4 移行で初めてトップに現れる UI 差分として、来訪者目線で位置 / サイズ / コントラスト / タップ可能性を観測する）**。
- **OGP / Twitter 画像の実機表示確認（物理移動の論理確認だけでは不十分）**: B-334-4-3 で「`(legacy)/opengraph-image.tsx` `(legacy)/twitter-image.tsx` を `(new)/` に物理移動するだけで配信パスは不変」と論理的に確認しているが、実際に Metadata API が新ルート配下から正しく配信できているかは実機アクセスでないと検証できない。移行後にローカル開発サーバ（または本番相当ビルド）で `/opengraph-image` と `/twitter-image` を実機ブラウザで開き、(i) 200 応答であること、(ii) 画像が表示されレイアウト崩れがないことを確認する。404 / 500 / 描画崩れがあれば停止して PM に報告。

#### B-334-4-6: a11y 完了基準の確認（WCAG 2.4.5 Multiple Ways）

- トップへの複数経路の確認・記録:
  1. Header ロゴ → `/` リンク
  2. Footer の `/` リンク（存在確認 + 判断軸の適用、後述）
  3. `sitemap.xml` の `/` エントリ（priority 1.0、L178-184）
  4. 直接 URL（`https://yolos.net/`）
- 各経路が新デザイン環境で機能していることを確認。
- **Footer の `/` リンクに関する判断軸（曖昧さの解消）**: 「存在確認」だけでは Footer に `/` リンクが存在しなかった場合の対応が不確定になるため、判断軸を計画段階で明文化する。Footer に `/` への明示的 Link が存在するかを実体確認したうえで、存在しない場合は以下のいずれかを **本サイクル PM が判断として確定** し、結果をサイクルドキュメント（`docs/cycles/cycle-185.md` のレビュー結果 / キャリーオーバー / 補足事項のいずれか適切な節）に記録する。
  - **(a) 3 経路で WCAG 2.4.5 Multiple Ways 充足とみなす**: Header ロゴクリック / `sitemap.xml` / 直接 URL の 3 経路を「Multiple Ways」として充足扱いとする。WCAG 2.4.5 は「2 つ以上の経路」を要求する基準であり、3 経路あれば形式的には充足する。本サイクルが Phase 4 完了の最終ピースであり、scope を拡げないことを優先する場合の選択肢。
  - **(b) Footer に `/` リンクを追加する**: Footer のリンク一覧に「ホーム / トップ」相当の項目を追加する。これは追加すると Footer のリンク一覧構造に影響するため、**scope creep に注意**（Footer は全ページに表示される共有 UI のため、変更影響範囲が広い）。Footer の構造変更を伴う場合は本サイクルで完結させず、別 backlog 項目として切り出す選択肢も視野に入れる。
  - 判断結果（採用案・根拠・記録先）は本サイクル PM の責務で確定する。
- A-6 中評価対応: 検索を a11y 経路として強く頼らない設計が維持されていること（design-migration-plan.md L128）。Header の検索トリガー構造は cycle-181 で実装済みだが Phase 5 までは非表示のため、本サイクルでは追加作業なし。

#### B-334-4-7: 完了基準の通過確認

- `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功。
- **First Load JS 差分の確認（トップ最重要入口の劣化防止）**: `npm run build` の出力で、ルート `/` の First Load JS が移行前と同等以下であることを実測値で確認する。トップは M1a / M1b 双方の最重要入口であり、初回表示パフォーマンスの劣化はそのまま離脱率に直結する。手順は (i) B-334-4-1 着手前に `npm run build` を実行して `/` 行の First Load JS を記録、(ii) 移行作業完了後に再度 `npm run build` を実行して同行を取得、(iii) 差分を比較。悪化していた場合は PM に報告し、原因特定（不要な依存追加 / クライアント境界の意図しない拡大 / Panel 等の新規導入による依存増）まで踏み込んだうえで対応方針を判断する。
- `(legacy)/page.tsx` `(legacy)/_components/FortunePreview.tsx` `(legacy)/_components/PlayContentTabs.tsx` `(legacy)/opengraph-image.tsx` `(legacy)/twitter-image.tsx` `(legacy)/__tests__/page.test.tsx` `(legacy)/page.module.css` が `(legacy)/` 配下から消えていることを `ls src/app/(legacy)/` で実体確認。`_components/` ディレクトリも空なら削除。
- Phase 4 完了に伴って Queued へ昇格すべき Deferred 項目（B-310 / B-331 / B-335 / B-342〜B-348 / B-350 / B-388 等のうち、本当に着手条件が達成されたもの）のリストアップ。実際の昇格処理は `/cycle-completion` で行うため、本タスク内ではリスト作成のみ。

### 検討した他の選択肢と判断理由

#### X1: 4 層アーキテクチャ（ListView / FilterableList / Grid / Card）をトップにも適用する

- **採用しない**。トップは「複合ランディング」であり、特定カテゴリの「一覧」ではない。Phase 4.1〜4.3 で確立されたパターンを無理に当てはめると、Hero / Tabs / Fortune / Blog の 4 セクション構造が解体され、Phase 9.2 で道具箱化する際の出発点（design-migration-plan.md L239「現行トップ内容を別ページに移す / 統合する / 廃棄する」判断の対象）が壊れる。design-migration-plan.md L117「現行のトップ内容を新デザインに移行」の文意は **構造を維持してデザインだけ乗せ替える** ことに他ならない。
- AP-P07 の「UI コンポーネントの選択を実装パターンの参照だけで決めない」も本判断を支持する。

#### X2: トップのコピーを新コンセプト「日常の傍にある道具」に書き換える

- **採用しない**。design-migration-plan.md L117 / cycle-180 申し送り L735 / cycle-181 / cycle-182 の補足 / cycle-183 キャリーオーバーのすべてが「Phase 9.2 まで待つ」を確立済み。Phase 4.4 で書き換えると about / Header / Footer との整合不全が発生し、道具箱機構の本実装と切替を同時に行う Phase 9.2 の前提が崩れる（道具箱機構が整わないままコンセプトだけ切り替えた場合、来訪者が「日常の傍にある道具」のはずなのに道具箱がないという矛盾が起きる）。
- AP-P11 の「過去の AI 判断を変更不可の制約として扱わない」は本判断を否定するように見えるが、複数サイクルにわたり同方針が確立され道具箱機構の依存関係が明確であるため、ここでの維持は AI 判断への盲従ではなく整合性に基づく判断。

#### X3: `FortunePreview` / `PlayContentTabs` を `(new)/_components/` に置く

- **採用しない**。両者ともフィーチャ密結合（`FortunePreview` は `@/play/fortune/fortuneStore` への直接依存、`PlayContentTabs` は play コンテンツ全体を束ねる役割）であり、Route Group 直下ではなくフィーチャ内（`src/play/fortune/_components/` / `src/play/_components/`）に住むのが Next.js 構造として自然。`docs/knowledge/nextjs-directory-architecture.md` に沿う。
- 別案として「両コンポーネントを `(new)/_components/` に置いて Phase 9.2 で再配置」もあり得るが、Phase 9.2 のスコープ（コンセプト切替 + 道具箱化）に「コンポーネント再配置」が混ざると Phase 9.2 の見通しが悪化するため、本サイクルで配置を確定する。

#### X4: OGP 画像を新規作成する

- **採用しない**。トップは既に `(legacy)/opengraph-image.tsx` が共通ライブラリ `@/lib/ogp-image` 経由で生成しており、`git mv` するだけで `(new)/` 側で機能する。新規作成の必要なし。B-387 のスコープ「一覧ページの OGP **未整備**のもの」にもトップは該当しない（既に整備済みのため）。
- 別案として「Phase 9.2 のコンセプト切替に合わせて OGP 文言も差し替え」もあり得るが、これは Phase 9.2 のスコープに自然に含まれるため本サイクルでは触らない。

#### X5: Header の `onSearchOpen` を Phase 4.4 で結線する

- **採用しない**。design-migration-plan.md L124「結線は Phase 5 で実施」が確立済み。Phase 4.4 ではアイコン枠 / キーバインド受け口の **構造のみ** 用意（cycle-181 で実装済み）。
- Phase 5（B-331）が後続で「Phase 4 完了を着手条件」として待っているため、本サイクルで結線まで踏み込むと Phase 5 のスコープを侵食する。

#### X6: タスクを「主タスク 1 つ + サブタスクで細分化」ではなく「機能単位の独立タスク（カード分離 / フィルタ実装 / a11y 整備…）」に分解する

- **採用しない**。Phase 4.1〜4.3 の標準手順（cycle-181/182/183）が「ルート移行 → デザイン適用 → テスト → 視覚検証」の順序を確立しており、機能単位ではなく工程単位で分解する方が並行可否ルール（同一ファイル変更タスクは同 builder 直列、純関数テストは並行可、独立 config 変更は並行可）に整合する。本サイクルもこの工程単位分解を踏襲する。

#### X7: PlayContentTabs を Phase 4.1〜4.3 と揃えて URL 同期化する（PM 判断・不採用確定）

- **採用しない**（PM 判断として確定）。理由は以下のとおり。
  - **来訪者の認知モデル上の差異**: Phase 4.1〜4.3 で導入した URL 同期型フィルタ（`<Link>` + `aria-current="page"`）は **一覧ページの絞り込み** であり、「絞り込み結果の URL を共有・ブックマークする」ニーズが想定される。一方、本サイクル対象の PlayContentTabs は **トップページのランディングセクション内でのコンテンツ群表示切替** であり、来訪者が「タブ位置だけを共有したい」というニーズは想定しにくい。M1a（初回来訪者）は「サイト全体を眺める」目的でトップに来るため、タブ位置はランディング後に切り替えるだけで十分。M1b（リピーター）は目的のコンテンツに直接アクセスするため、トップを共有するシナリオ自体が稀。
  - **トップ共有時の意図とずれる**: トップ URL（`/`）が SNS で共有される際、URL に `?tab=knowledge` 等のパラメータが付くと「知識系タブのトップ」を共有しているように見え、共有者の意図（「サイト全体を紹介したい」）とずれる。URL 非同期なら常に「サイト全体のトップ」として共有される。
  - **現行コードの安定性**: 現行 `PlayContentTabs.tsx` は `useState<TabId>` ベースで既に `role="tablist"` / `role="tab"` / `aria-selected` / `aria-controls` / `role="tabpanel"` / `aria-labelledby` を実装済み（L105-129）。URL 同期化にはルーティング層の変更（`useSearchParams` 導入 / Suspense 境界の調整 / `<Link>` 化）が必要で、本サイクル（Phase 4.4 ルート移行）のスコープを大きく超える。同期化が将来必要になった場合は Phase 9.2（B-336）で道具箱化と一括検討すれば足りる。
  - **AP-P07 との整合**: 「UI コンポーネントの選択を実装パターンの参照だけで決めない」原則に照らし、Phase 4.1〜4.3 のフィルタ実装パターンをトップ内タブに機械適用する案（X7）は採らず、来訪者の認知モデルに基づき URL 非同期 + ARIA tab パターンを選ぶ。
  - **AP-P17 ゼロベース列挙の補完**: 当初計画では「URL 同期型なら `<Link>` + `aria-current="page"` 方式、非同期なら適切な ARIA パターン」と builder 判断に委ねていた論点を、PM が確定判断として明文化した。これは AP-P17 の「3 案以上のゼロベース列挙」要件への補強であり、本論点は X7（不採用） vs B-334-4-2 の本文で示した PM 確定案（採用）の 2 案比較で意思決定を完了させる。

#### X8: Hero セクションを Panel に入れる（PM 判断・不採用確定）

- **採用しない**（PM 判断として確定）。Hero は来訪者が最初に視認する装飾的ランディング要素であり、Panel（カード型の枠）に入れると Hero 自体が枠で囲まれて小さく見え、コンセプト訴求（「占い・診断パーク」のアイデンティティ表現）が弱まる。
- Phase 4.1〜4.3（cycle-181/182/183）でも Hero は Panel 外配置で統一されており、`/tools` `/play` `/blog` の Hero と整合させる意味でも同方針が望ましい。
- 背景グラデーションや余白で領域を表現し、Panel は中身の繰り返し要素（カード群）にのみ使う方針を Phase 4.4 でも踏襲。
- もし将来 Panel 化が必要になれば Phase 9.2 のコンセプト切替時に再検討すれば足りる。

#### X9: FortunePreview セクションを Panel に入れない（PM 判断・不採用確定）

- **採用しない**（PM 判断として確定）。FortunePreview は「占いの結果プレビュー + CTA」というカード性の強い情報単位であり、Panel に入れて他セクションのカード群と視覚的に揃えるほうが認知モデル上自然。
- Panel 化しない案を採ると、FortunePreview だけ「裸の浮いた要素」になり、来訪者が「これはセクションなのかカードなのかどちらだろう」と認知負荷を負う。
- Hero（X8）が「装飾的ランディング = Panel 不要」なのに対し、FortunePreview は「機能的プレビューカード = Panel が自然」という対比で覚えるのが分かりやすい。

#### X10: Section 4（開発の舞台裏ブログ）のカード設計（PM 判断・確定）

論点は「Section 4 で `BlogCard`（cycle-183 で実装済み）を流用するか、現状の素朴な 3 行カード構造を維持するか」。3 案で比較する。

##### X10（採用）: 現状の素朴な 3 行カードを新トークンで再描画

- **採用**（PM 判断として確定）。現状の `<h3>` + `formatDate` + description という素朴な構造を維持し、CSS Modules 側で新トークン（`--bg`/`--fg`/`--accent`）への置換と `:global(:root.dark)` 修正だけを行う。
- **採用根拠**:
  1. **来訪者の認知モデル**: トップのブログ枠は「最新更新のお知らせ」、`/blog` 一覧は「探索の場」で役割が異なる。見た目を完全に揃えると `/blog` 一覧の独自価値（探索 UI としての密度の濃さ）が薄れる
  2. **視覚バランス**: Hero → Tabs（カード群）→ FortunePreview（カード）→ 開発の舞台裏（重量級カード 3 件）と続くと「カードまみれ」になり視覚的休息がなくなる。ランディングページとしての呼吸感を失う
  3. **設計意図の尊重**: `BlogCard.tsx` 冒頭コメントが「`/blog` 一覧専用、詳細ページの関連表示には RelatedArticles を使う」と明示しており、トップ流用は設計意図と齟齬する
  4. **API の実体不一致**: 現行 `BlogCardProps.post` は `slug / title / description / published_at / readingTime / tags` のみで、当初言及した「カバー画像」フィールドは存在しない。`href` も内部 `/blog/${slug}` 固定で差し替え不可。流用には destructive な API 改修が必要となる

##### X10b（不採用）: `BlogCard` を流用 / 不足 props は optional 追加

- **採用しない**。X10 の 4 根拠で否定される。特に (4) について、optional prop 追加だけでは収まらず、`href` の固定構造（`/blog/${slug}`）まで触ることになり、cycle-183 の責務領域に destructive に踏み込む。
- 「同じブログ記事が 2 種類のカード見た目で表示されると認知負荷が増す」という当初の流用根拠は、(1)(2) で示した「役割の違い」と「視覚バランス」を踏まえると過大評価であった。M1b リピーターはトップ「最新更新のお知らせ」と `/blog`「探索の場」をすでに別文脈として認識している。

##### X10c（不採用）: 専用カードを作って後で `BlogCard` に統合

- **採用しない**。Phase 9.2 のスコープ拡大を招き、トップ専用カードと `BlogCard` を将来統合する負債が残る。X10（採用）であれば「素朴な 3 行カードのまま」で完結し、統合圧力自体が発生しない。

### 計画にあたって参考にした情報

- `docs/design-migration-plan.md` Phase 4 全体（L104-L132）、「1 ページ移行の標準手順」（L290-L303）、Phase 9.2（L236-L240）、Phase 5 着手条件（L134-L150）
- `docs/cycles/cycle-181.md`（Phase 4.1 ツール一覧）、`cycle-182.md`（Phase 4.2 遊び一覧）、`cycle-183.md`（Phase 4.3 ブログ一覧）、`cycle-180.md` キャリーオーバー L725-L745、`cycle-184.md` § 補足事項 違反 2/3（Phase 4.4 未着手の確認経緯と事故記録）
- 事前調査レポート 2 件:
  - `tmp/research/2026-05-10-legacy-top-page-structure-for-phase-4-4.md`（4 セクション構成 / 依存コンポーネント / OGP / テスト / JSON-LD / 依存元 CSS の密結合関係）
  - `tmp/research/2026-05-10-phase4-standard-migration-procedure.md`（Phase 4 標準手順 / 命名規則 / 4 層アーキテクチャ / テスト方針 / a11y 責務 / cycle-180/183 から Phase 4.4 への申し送り全文）
- `docs/targets/` の 5 ターゲット定義（M1a / M1b / M2 / M3 / M4）。本サイクルでは M1a / M1b の dislikes「URL 変更によるアクセス不能化」「慣れた操作手順の急変」を URL 不変・既存セクション構造維持で防ぐ
- `docs/anti-patterns/{planning,implementation,workflow,writing}.md` 全項目。特に AP-P07（来訪者認知モデル優先）/ AP-P16（前提条件の実体確認）/ AP-P17（3 案以上のゼロベース列挙）/ AP-WF15（事後検証質問形）/ AP-I01（視覚検証 3 軸）/ AP-I02（場当たり的回避の禁止）
- `docs/knowledge/css-modules.md`（`:global(:root.dark)` 修正の根拠）/ `docs/knowledge/nextjs-directory-architecture.md`（フィーチャ層へのコンポーネント配置の根拠）

## レビュー結果

<!-- 作業完了後に記入する。 -->

## キャリーオーバー

- **着手前撮影の運用ルール昇格**: B-334-4-5 視覚検証で着手前撮影を取り忘れた事故が発生した（commit 後の `git worktree add 2a53f933` で別 worktree を展開して撮影を復旧することで補完したが、本来は kickoff 直後に撮影すべき）。次サイクル（cycle-186 = B-331 着手）から **kickoff 直後に着手前撮影 4 枚（w360/w1280 × light/dark）を必ず撮る**を運用ルールに昇格させる。`docs/anti-patterns/workflow.md` AP-WF05 補強として cycle-completion で具体記述を追加する。
- **B-334-4-5 で省略した a11y 観測（B-334-4-6 で扱う）**: StreakBadge の表示時 a11y（streak >= 1 状態の localStorage モックでの 44px / focus-visible / コントラスト確認）と、モバイル w360 でハンバーガーを開いた状態の Header actions slot 観測。本サイクル B-334-4-6 のスコープ内で対応する。
- **AP-I01 / AP-WF05 補強（観察精度）**: B-334-4-5 で「撮影は取れたが画像と記述の照合に失敗」する事象が発生した（Header actions slot を画像と逆の記述で「同等以上」と誤判定）。reviewer の独立点検で発見・補正したが、PM 自身の視覚検証においても **画像 1 枚ずつの実体観察 → 記述 → 再照合のサイクル** をルール化すべき。cycle-completion で AP-I01 補強として「視覚検証レポートには各観察項目に対し画像のどの位置を見たかの参照を含める」「文章を書いたあと画像と再照合する独立フェーズを設ける」を追記する。
- **検索結線の Phase 5 撤去**: 本サイクル致命対処として、`(new)/layout.tsx` 配下に `_components/HeaderWithSearch.tsx`（Client Component ラッパー）を新規作成し、SearchModal の open/close を管理して Header の `onSearchOpen` プロップに結線した（commits `356db26a` + `ef4bbeec`、最終形は v2）。これにより desktop / mobile 両方で検索ボタンが表示される。Phase 5 (B-331) で新検索コンポーネントに置き換える際に **`HeaderWithSearch.tsx` を丸ごと削除** すること。`(new)/_components/HeaderWithSearch.tsx` 内のコメントで「Phase 5 (B-331) で置き換える」を明示済み。B-331 着手時に必ず確認すること。

## 補足事項

- **本サイクルで触らない範囲**:
  - 新コンセプト「日常の傍にある道具」へのトップ本文書き換え（Phase 9.2 = B-336 / B-310 のスコープ）
  - 道具箱化（タイル並び替え・編集モード・localStorage 永続化等、ダッシュボード本体実装。Phase 9.2 = B-312 / B-336 のスコープ）
  - ブログ分類の軸重複・レコメンド透明性の情報設計再検討（B-391、Phase 5-10 完了が着手条件）
  - cycle-183 ホットフィックス（`BlogCard.tsx` / `TagList.tsx` の `>=3 件タグのみ表示する UI フィルタ` および `TODO(cycle-184/B-389)` マーカー）。B-391 再着手時に新設計と整合する形で撤去する
- **Phase 4 完了後に Queued へ昇格すべき Deferred 項目**: B-310（トップ・ナビ再設計、ただし Phase 9.2 で吸収される可能性あり）、B-331（Phase 5 検索コンポーネント）、B-335（Phase 6 ブログ詳細移行）。本サイクル完了処理 (`/cycle-completion`) でこれらを Queued に昇格させる。
- **cycle-184 事故の再発防止**: cycle-184 kickoff で B-334 を Active から誤って Done に移し、Phase 4.4 未着手の事実を見落としたうえで B-310 / B-331 を Deferred から Queued に上げる事故が発生した（cycle-184.md §補足事項 違反 2 / 3）。本サイクル kickoff では `(new)/page.tsx` の不在を実体確認したうえで Phase 4.4 を Active として継続させており、再発していないことを記録しておく。
- **B-334 ライフサイクル整合性の責務（cycle-184 と逆方向の事故予防）**: cycle-184 では「B-334 を Active のまま放置」と「Phase 4.4 未完了のまま B-334 を Done に移す」という 2 方向の事故が起きた。本サイクルでは、B-334-4-7 完了基準と「サイクル終了時のチェックリスト」両方に **B-334 自体の状態整合性チェック**（`grep -n 'B-334' docs/backlog.md` による Active → Done の移動確認）を組み込む。実際の昇格処理は `/cycle-completion` の責務だが、Phase 4.4 完了時点での B-334 ライフサイクル整合性確認は cycle-185 PM の責務である。
- **Phase 4.4 完了後〜Phase 9.2 完了までの既知の状態**: Phase 4.4 完了後〜Phase 9.2（B-336）完了までの期間、新デザインのトップで **旧コンセプト「占い・診断パーク」のメタデータ（`metadata.description` / OGP 文言 / `generateWebSiteJsonLd()` description）が配信され続ける** 既知の状態がある。これは design-migration-plan.md L117 / cycle-180 申し送り（L725-745）で確立された方針に基づき、コンセプト切替を道具箱機構の本実装と同時に Phase 9.2 で一括解消するため。Phase 9.2（B-336）で about / Header / Footer のコンセプト切替と一斉に解消される予定。本サイクルでは触らない。
- **B-334-4-6 で発見した a11y 課題の PM 判断**:
  - **44px 未充足の取り扱い (PM 判断)**: `(new)` Header の `ThemeToggle`（desktop 52x28px）と desktop 検索ボタン（`Header.module.css` の `.searchButton`、padding のみで 32x32px）が WCAG 2.5.5 推奨 44x44px に達していない事実を発見。これは Phase 4.4 移行で発生したものではなく cycle-181 (Phase 4.1) で導入された既存実装由来。**注意**: `SearchTrigger.module.css` 自体は `height: 44px` 充足済みで修正対象外、修正対象は `Header.module.css .searchButton`。本サイクルでは対処せず、**B-393「Header actions slot のタップターゲット 44px 対応」として新規 backlog 起票** を確定。理由: (1) 同型課題の B-386（Button/Input 44px）/ B-388（Pagination 44px）と同時実施が効率的、(2) Phase 5（B-331）で actions slot に渡す検索 UI が新コンポーネントになっても Header 側ラッパー CSS `.searchButton` の 44px 化は独立して必要、(3) 本サイクルで対処すると Phase 5 設計と二重作業になる
  - **dark mode コントラスト精密検証 (PM 判断)**: Footer dark mode の `getComputedStyle` 実測値 3.7:1 が WCAG AA 4.5:1 未充足の懸念を示したが、Playwright `getComputedStyle` は親要素の積層を考慮しないため信頼性が低い（Hero グラデ背景も `rgba(0,0,0,0)` と算出される等の限界が観測されている）。本サイクルでは確定せず、**B-394「dark mode コントラスト精密検証（Footer 起点・全体スイープ）」として新規 backlog 起票** を確定。理由: (1) 精密実測には axe-core / DevTools コントラストチェッカー / 実色値手計算など別手法が必要、(2) Footer 由来の課題は Phase 4.4 トップ移行のスコープ外、(3) トップに限らず全ページ dark mode の統一的検証として独立タスク化が筋

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] **B-334 が backlog 上で Phase 4.4 完了に整合**（Active から Done に移動完了。`grep -n 'B-334' docs/backlog.md` で実体確認）。cycle-184 では B-334 を Active のまま放置 / 誤って Done に移すという 2 方向の事故が起きたため、本サイクルでは B-334 のライフサイクル整合性を完了基準に明示する。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
