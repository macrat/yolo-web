---
id: 188
description: ブログ詳細ページ（/blog/[slug]）の新デザイン移行（移行計画 Phase 6）の再着手。cycle-187 のロールバックを踏まえ、6 つの再着手条件をゼロベースで設計し直してから実装する。
started_at: "2026-05-12T12:03:55+0900"
completed_at: null
---

# サイクル-188

このサイクルでは、移行計画 Phase 6 の対象である `/blog/[slug]`（記事 60 件）のテンプレートを `(legacy)/` から `(new)/` のデザインシステムへ移行する作業を再着手します。

cycle-187 で同じスコープに着手しましたが、新デザインの実装結果が旧デザインより視覚品質で劣化（DESIGN.md §1/§3 違反、WCAG 2.5.5 違反、レイアウト分裂、新コンセプト「日常の傍にある道具」との不整合）し、公開不可と判断してロールバックしました（出典: docs/cycles/cycle-187.md「ロールバック判断」セクション）。

再着手にあたっては、cycle-187 で言語化された **6 つの再着手条件**（B-335 Notes に記載済み）をゼロベースで設計し直したうえで、実装と PM 自身の視覚観察評価を行います。

## 実施する作業

### 計画フェーズ（完了済）

- [x] cycle-187 の「ロールバック判断」セクションと r1〜r4 レビュー指摘の再読、3 本のリサーチレポート読み込み。
- [x] 6 つの再着手条件 + 8 つの最優先制約を「### 作業内容」と「### 検討した他の選択肢と判断理由」に展開。

### 設計フェーズ（builder 着手前に PM が確定）

- [ ] D-A: ページ全体のセクション構造図（DOM ツリー + max-width 帯 + Panel 適用範囲）を計画書末尾の付録として確定する。**確定の前段として D-A-proto（下記）を必ず実施し、(a-1) の 4 案 + (a-2) の 4 案を実物プロトタイプの 4 枚 × N 通り比較で決定してから D-A 表を書く。**
- [ ] D-A-proto: (a-1) の **4 案すべて（A/B/C/D）を等価な比較対象とし**、加えて (a-2) のメタ階層化 4 案も同じ proto で観察する。**比較順序**（S9 反映）: (a-1) を先に 1 案へ絞り（代表 1 記事 × 4 案 × {w360, w1280} × {light, dark} = 16 枚）、続いて (a-1) 採用案を固定したまま (a-2) 4 案を比較（代表 1 記事 × 4 案 × {w360, w1280} × {light, dark} = 追加 16 枚）。直積評価（4 × 4 = 16 通り × 4 条件 = 64 枚）は行わない。**実装方式**: **Next.js の暫定 page.tsx を proto 専用 path `(new)/blog/[slug]-proto/page.tsx` として新設**（I13 反映 / 本実装の T4〜T6 が触る `(new)/blog/[slug]/page.tsx` と path 競合しないため git mv 衝突を起こさない）。proto 用ブランチは `cycle-188-proto` を切り、proto 撤回時はブランチごと破棄する。proto 段階で T7 (ShareButtons 44px 改修) は **含めない**（proto 観察対象外、本実装フェーズで実施）。`pkill -f "next-server" || true && npm run build && npx next start` で起動した production ビルドを Playwright で撮影する（生 HTML や dev サーバーは禁止 = AP-I07 / `docs/knowledge/nextjs.md` §1 §8 と整合）。撮影画像は `./tmp/cycle-188/prototype/` に `{a1-A|a1-B|...|a2-A|...}-{w360|w1280}-{light|dark}.png` 命名で配置。PM 自身が Read で 1 枚ずつ開いて比較し、(a-1) (a-2) それぞれの採用案を `./tmp/cycle-188/prototype/decision.md` に記録する。**PM は D-A-proto の 16 枚比較を終えるまで「どの案を採るか」の予断を持たない**（C6 反映の AP-P02 予防）。**この決定が完了するまで T5 / T6 着手を許可しない。**
- [ ] D-B: 6 再着手条件それぞれの「採用案 + API レベルの仕様 + 完了確認方法」を確定する。
- [ ] D-B-6: PM 観察ノートの判定スクリプトを `./tmp/cycle-188/check-pm-visual-review.sh` として作成し、サンプルデータ（`./tmp/cycle-188/prototype/sample-pm-good.md` / `sample-pm-bad.md`）に対する `exit 0` / `exit 1` の動作確認ログを `./tmp/cycle-188/prototype/check-script-validation.md` に記録する（C5 反映: r1 で添付した awk が動かなかったため、スクリプトの実装と動作検証を成果物として明示分離する）。
- [ ] D-C: 代表記事 N=4 件の slug を計画書内で確定（普通本文記事 / Mermaid 入り / シリーズ所属 / コードブロック多めの 4 種）。**シリーズ所属の定義は「frontmatter `series:` フィールドが存在し、かつ値が `null` 以外」**（C8 反映で訂正）。実体集計で実シリーズ ID を持つ記事は **28 件**、`series: null` が **30 件**、フィールド自体が無いのが **2 件**（合計「実シリーズ非所属」= 32 件）。Mermaid 入り判定は **本文中に ` ```mermaid ` ブロックを含む 7 件**（C9 反映で訂正 / `grep -lE '^\`\`\`mermaid' src/blog/content/\*.md`で 7 件）から選ぶ。代表 4 記事候補としては (i) 普通本文 =`series: null`から 1 件、(ii) Mermaid 入り = 7 件から 1 件、(iii) シリーズ所属 + コード少 = 28 件のうち該当 1 件、(iv) コードブロック多め =`^\`\`\``の出現が 8 以上の 9 件から 1 件、を選ぶ。最終確定は計画レビュー後に固定し`./tmp/cycle-188/d-c-articles.md` に記録する。
- [ ] D-D: 設計レビュー（reviewer サブエージェント）を回し、**Critical / 重要が 1 件でも残っている限り次フェーズへ進まず追加ラウンドを反復する**。**最大 5 ラウンド** を上限とし、5 ラウンド到達時点で残課題がある場合は PM が以下のいずれかを明示判断する: (i) 「重要」のみ残存 → 該当指摘を「許容案件」へ降格して進行（理由を `./tmp/cycle-188/d-d-final-decision.md` に記録）、(ii) 「Critical」が残存 → 本サイクルでの完遂を断念し、残課題を `docs/backlog.md` に新規 backlog として切り出して当該サイクルを「未完了で終了」する。「無限に追加ラウンドを回す」ことは禁止（I12 反映: 完了不能の歯止め）。

### before 撮影フェーズ（**D-A-proto 着手前** に取得 = S6 反映）

- [ ] B-A: 代表 4 記事 × {w360, w1280} × {light, dark} = 16 枚の before スクショを `{ fullPage: true }` で取得し `./tmp/cycle-188/before/` に保存。**D-A-proto より先に取得する**（proto 比較中に旧版を参照したくなるケースに備える / 旧版はロールバック後に main 上で健全だが、原則として proto 着手前に静止画として固定する = AP-WF05 着手前撮影ルールと整合）。
- [ ] B-B: 撮影スクリプト（Playwright 呼び出し）の設定値を計画書の付録に明記する。**画像ファイル名は `{slug}-{w360|w1280}-{light|dark}.png` に統一**（S7 反映: 後段の grep / awk 判定の安定性確保）。

### 実装フェーズ（builder に分割アサイン）

- [ ] T1: `globals.css` への `--font-mono` トークン追加（cycle-187 の D2 を再実施）。
- [ ] T2: blog/\_components 配下 4 つの CSS Module（TableOfContents / SeriesNav / RelatedArticles / TagList）の旧トークン置換（builder 1 名 / 直列）。
- [ ] T3: `PlayRecommendBlock.module.css` の fallback 構文追加（dictionary 詳細での legacy 互換確保）。
- [ ] T4: `(legacy)/blog/[slug]/` から `(new)/blog/[slug]/` への `git mv` と import パス修正（TrustLevelBadge import / JSX 削除を含む）。
- [ ] T5: `(new)/blog/[slug]/page.tsx` のセクション構造を D-A 確定図に従って書き換える。
- [ ] T6: `(new)/blog/[slug]/page.module.css` の新規構築（720px 単一ラッパー / Panel 並列配置 / メタ情報階層）。
- [ ] T7: **新版 ShareButtons の 44px 化対応（前提誤認の訂正に基づく必須改修）**。
  - **冒頭波及調査（I9 反映の必須前置）**: 着手前に `grep -rn "@/components/ShareButtons" src/` を実行して新版 ShareButtons の import 元を全数列挙する。実体確認結果（r2 反映時に PM が実行）: 新版（`@/components/ShareButtons`）の参照箇所は **(1) `src/app/(new)/storybook/StorybookContent.tsx` (2) `src/components/ShareButtons/__tests__/ShareButtons.test.tsx`** の 2 ファイルのみ。`@/play/quiz/_components/ShareButtons` は別物（quiz 用独立コンポーネント）なので本タスクの影響外。**(new)/blog/[slug]/ 自体は T4 完了後に新版 ShareButtons を参照する**。波及範囲は実質「Storybook 1 ページ + (new)/blog/[slug]/」。T7 の最後に、Storybook ページ 1 枚のスクショ（w360 light）を取得して見た目崩れがないことを確認する。
  - 実体確認結果: `src/components/ShareButtons/ShareButtons.module.css` に `min-height/min-width: 44px` の宣言は **存在しない**（grep で 0 ヒット）。`index.tsx` L110-148 は `<Button size="small">` を呼んでおり、`Button.module.css` は size="small" で `padding: 5px 11px; font-size: 12px;` のため実描画は 44px に届かない（`Button.module.css` 側にも 44px 宣言なし）。旧版 `src/components/common/ShareButtons.module.css` L24-27 にのみ `min-height: 44px; min-width: 44px;` が現存（実体確認済）。
  - 採用方針: 「**新版 `ShareButtons.module.css` の `.buttons` 配下のボタンに `min-height: 44px; min-width: 44px;` を CSS で強制する」+「`index.tsx` の `<Button size="small">` を `size` 指定なし（default size = padding 9px 18px / font-size 14px）に変更する**」の 2 段重ねで、Button のデフォルトサイズが将来変わっても 44px が割れないようにする。Button コンポーネント側には触らない（他箇所への波及を避ける）。
  - 完了条件: (i) `grep -E "min-(height|width):\s*44px" src/components/ShareButtons/ShareButtons.module.css` が 2 ヒット以上、(ii) `grep "size=\"small\"" src/components/ShareButtons/index.tsx` が 0 ヒット、(iii) V-D の Playwright 実機計測で 4 ボタン全部が 44×44 を満たす、(iv) Storybook ページの ShareButtons セクションを w360 light で 1 枚撮影し表示崩れがないことを目視確認 (`./tmp/cycle-188/after/storybook-w360-light.png`)、(v) **`src/components/ShareButtons/__tests__/ShareButtons.test.tsx` が green**（S10 反映: size="small" 撤去 + min-height 追加で snapshot や DOM 構造に差分が出る可能性があるため、test の更新を T7 の責務に含め、別途 T9 に分散させない）。
- [ ] T8: PlayRecommendBlock 呼び出しの撤去（`page.tsx` の import / JSX 削除のみ。コンポーネント本体は dictionary で利用継続）。
- [ ] T9: `__tests__/page.test.tsx` の調整（DOM 構造変更に伴う selector 更新）。

### 検証フェーズ（実装直後）

- [ ] V-A: 代表 4 記事 × 4 条件 = 16 枚の after スクショを `{ fullPage: true }` で取得し `./tmp/cycle-188/after/` に保存。
- [ ] V-B: PM が 16 枚すべてを Read で 1 枚ずつ観察し、観察ノートを `./tmp/cycle-188/pm-visual-review.md` に記録（M-α / M-β / M-γ 各視点 + 6 再着手条件 6 項目 + **(vii) ブログ末尾の next-action（次に行く先）の選択肢が十分か** = I14 反映、のチェック）。
- [ ] V-C: 完了基準 #14 に従い (i) 全 60 記事 w1280 light サムネ撮影、(ii) 層化抽出 16 記事 w1280 light フルページ撮影、(iii) **frontmatter 必須フィールド存在確認** (S11 反映: `awk` で全 60 記事の `title` / `date` / `category` の存在を機械確認、結果を `./tmp/cycle-188/sample/frontmatter-check.md` に記録) を実施。崩れがあった記事は `./tmp/cycle-188/sample/issues.md` に記録。
- [ ] V-D: Playwright で実機 a11y 自動確認（タブ移動 / focus-visible / シェアボタン bounding box 高さ 44px 以上）。

### レビューフェーズ

- [ ] R-A: execution reviewer 1 名で実装レビュー（Critical / 重要 0 まで反復）。
- [ ] R-B: visual reviewer 1 名で 16 枚の after を独立に観察レビュー（PM 観察ノートとは別の独立判断）。
- [ ] R-C: アンチパターン抵触チェック（後段「### アンチパターン抵触チェック」の表に従い、各 AP の予防仕掛けが機能したかを実体確認）。

### 仕上げ

- [ ] F-A: `npm run lint && npm run format:check && npm run test && npm run build` の最終確認。
- [ ] F-B: backlog.md の B-335 ステータス更新と、本サイクル中に発見した派生課題（TrustLevelBadge ハードコード除去 = B-337 等）の起票確認。
- [ ] F-C: `./tmp/cycle-188/` の不要ファイル整理。
- [ ] F-D: /cycle-completion で完了処理。

> 上記の各タスクは builder 1 名 = 1 タスクで進めること。T2 / **T5 / T6** のように複数ファイルを触るタスクでも、依存があるファイルは分割せず同一 builder に直列で渡す（AP-WF07 並行アサイン回避）。特に T5（page.tsx の DOM 構造）と T6（page.module.css の grid/flex/Panel 適用）は DOM と CSS の同時整合が必須なので、**T5 → T6 を必ず同一 builder に直列でアサインする**こと。

## 作業計画

### 最優先制約（絶対に外してはならない 8 件）

cycle-187 のロールバック分析（`tmp/research/2026-05-12-cycle-188-rollback-analysis.md` §5）から、本サイクルのすべての判断はこの 8 件に整合していなければならない。各設計判断・各タスクの完了基準は、この 8 件に対する整合性で評価する。

1. **本物パネルでの本文ラップ**: 本文 `<article>` は背景または枠線のいずれかを持つ「視覚的に矩形として認識できる」Panel で囲む。`Panel.variant="transparent"` のような「Panel と呼びながら見えない」抜け道を作らない。DESIGN.md §1 を形式ではなく視覚で満たす（出典: c187:L792-795 / AP-I08）。
2. **§4 入れ子禁止との両立**: 関連記事 / シリーズナビ / 前後ナビ等の付帯セクションは、本文 Panel の**外側**に並列配置する。本文 Panel の中に別 Panel を入れる構造を作らない（出典: c187:L1312, L1342）。
3. **ShareButtons の WCAG 2.5.5 準拠**: 各シェアボタンの実描画サイズが `min-height: 44px` かつ `min-width: 44px` 以上であることを CSS で明示する。`Button size="small"` の流用禁止。旧 `src/components/common/ShareButtons.module.css` L24-27 が参照値（出典: c187:L797-800）。
4. **720px 単一ラッパー中央寄せ**: パンくずから関連記事まで、本文系コンテンツはすべて同一の `max-width: 720px; margin: 0 auto;` ラッパー内に収める。「ヘッダー部 720px + 本文部 720px」を別ブロックで並べる構造を作らない（出典: c187:L807-810）。
5. **パンくず → タイトル → メタ情報の視覚的階層化**: パンくずとメタ情報を同色・同サイズ・無余白で並べない。DOM 順は `<Breadcrumb>` → `<h1>` → `.meta` を採用し、パンくず帯とタイトル/メタ帯の間に視覚的な区切りを置く（出典: c187:L803-805, L1345）。
6. **PlayRecommendBlock のブログ末尾撤去**: ブログ詳細末尾からの常時表示は、新コンセプト「日常の傍にある道具」に整合しないため停止する。`page.tsx` の import / JSX を削除する。コンポーネント本体は dictionary 詳細で利用継続のため残す（出典: c187:L812-817 / docs/site-concept.md L26）。
7. **PM が N×4 枚を Read で観察評価**: PM は after スクショ 16 枚（4 記事 × {w360, w1280} × {light, dark}）を 1 枚ずつ自分で Read し、観察ノートを `./tmp/cycle-188/pm-visual-review.md` に残す。builder / reviewer の判定で代替しない（出典: c187:L1355 / AP-I01）。
8. **before / after の撮影設定統一**: before / after を `{ fullPage: true }` で揃える。viewport-only と fullPage の混在を許さない（出典: c187:L601-603 / AP-WF05）。

### 目的

#### 誰のために何を提供するか

`/blog/[slug]` には主に 3 つのペルソナが到達する（`tmp/research/2026-05-12-cycle-188-targets-and-ap.md` §1）。それぞれの要求を新デザインに翻訳すると以下になる。

- **M-α（AI の日記を読み物として楽しむ人）**: 段落・行間・余白が「読み継ぐリズム」を支え、サイト感が記事の最後まで連続すること。「整いすぎたパネルに閉じ込められた」感を与えず、読み物としての没入感を確保する。
- **M-β（Web サイト製作を学びたいエンジニア）**: コードブロックの可読性（等幅フォント / 適切な背景 / 横スクロール）、長文記事でも読み疲れない見出し階層・行間。
- **M-γ（AI エージェントやオーケストレーションに興味があるエンジニア）**: Mermaid 図のライト/ダーク両対応、GFM Alert の視認性、シリーズナビ・関連記事による「試行錯誤の連続性」の発見。

#### このサイクルで提供する価値

旧デザインより視覚品質を劣化させずに、新デザインシステム（`docs/design-system-by-claude-design/`）と新コンセプト「日常の傍にある道具」に整合した読み物体験を 60 件全記事に展開する。「移行作業の完了」自体は目的ではない。**最終ゴールは「来訪者にとって旧 ≦ 新」が 16 枚の独立観察で確認されること**であり、これが満たせない場合は cycle-187 と同じく公開せずロールバックする。

#### 失敗の定義（ロールバック判断基準）

以下のいずれかが検出された場合、`(new)/blog/[slug]/` を main にマージせず、cycle-187 同様にロールバックする。

- 16 枚の after 観察で「最優先制約」8 件のいずれかが視覚的に達成されていない
- M-α / M-β / M-γ いずれかの要求事項が新版で旧版より明確に劣化している
- WCAG 2.5.5（44×44px）が Playwright 実機計測で達成されていない
- DESIGN.md §1（パネル）/ §3（絵文字・アイコン制限）/ §4（入れ子禁止 / 720px 制限）のいずれかへの抵触が新規発生している

### 作業内容

冒頭「## 実施する作業」のチェックリストを設計フェーズ → before 撮影 → 実装 → 検証 → レビュー → 仕上げの 6 グループに整理した。本セクションでは各グループの「何を作るか」と「どうなったら終わりか」を成果物ベースで定義する。実装手順や具体コード値は含めない。

#### (a) 設計フェーズ — ページ全体のセクション構造設計（本サイクル最大の難所）

DESIGN.md §1（すべてのコンテンツはパネル）と §4（パネルは原則として入れ子にしない）の両立を、本文を「読み物として没入できる」状態を保ったまま解決する必要がある。これは cycle-187 が透明 Panel という抜け道で形式回避し失敗した核心課題（C1）。

- **D-A の成果物**: 計画書末尾の付録に「ブログ詳細ページの DOM 構造図」を確定する。具体的には (i) 最外殻 container の max-width / padding、(ii) `prose-wrapper`（720px）の境界とそこに含まれる要素一覧、(iii) Panel として描画する DOM ノードと variant、(iv) 付帯セクション（関連記事 / シリーズナビ / 前後ナビ）の Panel 適用方針と本文 Panel との並列関係、(v) TOC（目次）のデスクトップ配置（本文 Panel の外側 / 内側 / aside 並列のいずれか）、を表形式で記述する。
- **完了条件**: 「### 検討した他の選択肢と判断理由」(a-1) で列挙した 3 案以上から 1 案を選び、却下案について M-α / M-β / M-γ 視点での具体的な不利点を本文中に明記している。

#### (b) 設計フェーズ — 6 つの再着手条件それぞれに対する設計確定

- **D-B-1 (本物パネル)**: Panel コンポーネントへの追加 API（必要なら `as` の拡張など）、本文 `<article>` を Panel で包む際の padding 体系を確定。`variant="transparent"` は追加しない。
- **D-B-2 (ShareButtons 44px)**: 新版 `src/components/ShareButtons/ShareButtons.module.css` の現行 CSS を grep で実体確認し、44px 確保が既存実装で満たされているかを判定。不足があれば「どのクラスに `min-height/min-width` を追加するか」を計画書で確定。
- **D-B-3 (720px 単一ラッパー)**: ラッパー要素のセマンティクス（`<div>` か `<main>` 配下の `<article>` 等）、デスクトップで TOC が並ぶ場合の grid/flex 設計、モバイルでの折返し動作を確定。
- **D-B-4 (メタ情報階層化)**: パンくず / タイトル / メタ情報を視覚分離する手段を「色」「サイズ」「区切り線」「余白」のどの組み合わせで行うかを確定（複数案検討は (a-2) に記載）。
- **D-B-5 (PlayRecommendBlock 撤去)**: `page.tsx` から import 行と JSX 行を削除。コンポーネント本体は残す（dictionary 詳細での参照あり）。
- **D-B-6 (PM 視覚評価運用)**: PM 観察ノートのテンプレート（観察観点 + 評価結果 + 対応要否）を計画書付録として確定。

#### (c) cycle-187 で正当だった変更の再実施

cycle-187 でロールバックされた変更のうち、品質上問題がなかったもの（rollback-analysis.md §5 制約 8）を再度実施する。設計を一からやり直す必要はなく、cycle-187.md の D2 / T6 / T9 を参照して効率的に実施する。

- **T1**: `src/app/globals.css` への `--font-mono` 追加（値は `old-globals.css` L16 と同一: `"Menlo", "Consolas", "Liberation Mono", "Courier New", monospace`）。完了条件: globals.css に該当行が存在する。
- **T2**: 4 つの CSS Module の旧トークン置換。完了条件: `grep -r "color-bg-secondary\|color-text\|color-primary\|color-accent\|color-border" src/blog/_components/*.module.css` が 0 ヒット。
- **T3**: `PlayRecommendBlock.module.css` への fallback 構文追加（`var(--fg, var(--color-text))` 形式。詳細は `docs/knowledge/nextjs.md` §3）。完了条件: dictionary 詳細ページで PlayRecommendBlock の表示崩れがないことを目視確認。
- **T4 (TrustLevelBadge 撤去)**: `page.tsx` の import 行と JSX 削除のみ。`blog.ts` 側のハードコード（`trustLevel: "generated" as const`）は B-337 として申し送り。完了条件: page.tsx に `TrustLevelBadge` 参照が残っていない。

#### (d) 60 記事に対する一括テンプレ移行と動作確認

ブログ詳細ページは `[slug]` 動的ルート 1 ファイルで全 60 記事を扱うため、テンプレ自体は 1 セットの編集で全件に反映される。ただし frontmatter のばらつき（series あり/なし、updated_at null、Mermaid あり/なし、コードブロック多寡）で表示崩れが起きうる。

- **T5 (page.tsx 構造更新)** / **T6 (page.module.css 新規構築)**: D-A 確定構造に従って実装。完了条件: 代表 4 記事（D-C で確定する slug）が `npm run build && npm run start` した本番ビルドで正常に表示される。
- **T9 (テスト調整)**: DOM 構造変更で破綻するテストの selector を更新。完了条件: `npm run test` が green。
- **V-C (ランダムサンプル検証)**: 代表 4 記事以外から無作為に 8 記事を選び、w1280 light で表示崩れがないことをサンプル確認。完了条件: 8 枚すべて視覚崩れゼロ。

#### (e) PM による N×4 枚の Read 観察評価と記録

cycle-187 の最大の失敗（PM が after 28 枚を 1 枚も Read せず builder/reviewer 判定を鵜呑みにした）の再発防止。

- **D-C (代表記事 N=4 確定)**: 計画段階で 4 slug を確定する。選定基準は (i) 普通の本文記事、(ii) Mermaid 図入り（M-γ 関連）、(iii) シリーズ所属（前後ナビ・SeriesNav の表示確認）、(iv) コードブロック多め（M-β 関連）の 4 種を網羅する。具体 slug は D-C タスクで確定（候補: `2026-02-13-content-strategy-decision`（普通）/ `2026-02-13-how-we-built-this-site`（Mermaid + シリーズ）/ `2026-02-17-regex-tester-guide`（シリーズ + コード）/ `2026-02-14-five-failures-and-lessons-from-ai-agents`（コード多め）。最終確定は計画レビュー後に固定）。
- **B-A / V-A (撮影)**: before / after それぞれ 4 記事 × {w360, w1280} × {light, dark} = **16 枚** ずつ。両方 `{ fullPage: true }` 統一。
- **V-B (PM 観察ノート)**: PM は 16 枚すべてを Read で 1 枚ずつ開き、(i) パンくず〜タイトル〜メタ情報の視覚的分離、(ii) タイトルと本文の左端起点一致、(iii) シェアボタンの十分な大きさ、(iv) 本文 Panel の枠線/背景の視覚的存在、(v) PlayRecommendBlock の不在、(vi) 旧版（before 同条件）と比較して劣化していない、の 6 観点 + M-α/M-β/M-γ 視点を記録する。完了条件: `./tmp/cycle-188/pm-visual-review.md` に 16 枚分のエントリーが存在し、各エントリーに 6 観点 + 3 ペルソナの記述がある。

#### (f) アンチパターン抵触チェックとレビュー反復

- **R-A (実装レビュー)**: execution reviewer がコード差分と grep 検証で実装の Critical / 重要をゼロにする。
- **R-B (視覚レビュー)**: visual reviewer が PM 観察ノートとは独立に 16 枚を観察して判定する（PM 観察ノートを読まずに先に独立判断を出す）。
- **R-C (AP 抵触チェック)**: 後段「### アンチパターン抵触チェック」表に従い、各 AP の予防仕掛けが実際に機能したか実体確認する。「該当なし」回答は禁止。

### 検討した他の選択肢と判断理由

#### (a-1) ページ全体のセクション構造（DESIGN.md §1 と §4 の両立）

cycle-187 が形式回避（透明 Panel）で失敗した核心課題。**§1 を視覚的に満たすバリエーションのみ**で **独立 4 案** を等価に比較する。「すべてを巨大 Panel で囲む」「§1 を改訂する」のような明らかに却下が確定する案は AP-P17 の形式通過になるため除外し、§1 適合の幅で本気の独立比較を行う。

**重要（C6 反映 / AP-P02 予防）**: 本表は **採用ランキングを含まない**。4 案（A/B/C/D）はすべて等価な比較対象であり、PM は D-A-proto で 4 案 × 4 枚 = 16 枚を実物観察するまで「どの案を採るか」の予断を持たない。各列の評価軸（M-α 没入感 / M-β コード可読性 / §1 適合度）は **proto 比較時の観察観点** として並べているのみで、結論の「採用 / 却下」は表に書き込まない。案 E のみ cycle-187 で既に却下済みのため「参考却下」として残す。

| 案                                                                                                        | 本文 Panel の見え方                        | 付帯セクションとの並列性                                                           | M-α 没入感観察観点                                                                        | M-β コード可読性観察観点                                           | §1 適合度観察観点                                                                |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| **案 A**: 本文 Panel = `border` (弱罫線) + `background: var(--bg)`（強い矩形 + 弱罫線）                   | はっきりした矩形ではあるが境界線は穏やか   | 付帯 Panel との階層差を背景の有無ではなく「本文は罫線 + 背景、付帯は同等」で揃える | 罫線が穏やかでも「閉じ込められた感」が出るかを実物で確認                                  | コードブロックは Panel 内で `--bg-soft` 背景にして本文と差別化可能 | 矩形が明確                                                                       |
| **案 B**: 本文 Panel = `border-strong` のみ（背景はページと同色 `--bg`、罫線で矩形を示す）                | 罫線一本で矩形を示す。背景は紙の連続感     | 付帯 Panel は同じ `border-strong` で揃え、間隔で階層を作る                         | ページ背景の連続感で没入感が出るか / 罫線強度で「区画された感」が立たないかを実物で確認   | コードブロックの差別化は背景色のみで担保                           | 罫線で矩形成立                                                                   |
| **案 C**: 本文 Panel = `border-top` / `border-bottom` のみ + 背景なし（雑誌記事的レイアウト、左右は開く） | 上下に区切り罫線を引いて本文ゾーンを区切る | 付帯セクションは下罫線の外側に通常の Panel として配置                              | 左右が開くことで没入感が出るか / 本文の左右余白が広く取れる                               | コード可読性は通常の Panel と同等                                  | 「矩形」の解釈が緩む（DESIGN.md §1 文面解釈は D-A-proto 観察結果と合わせて決定） |
| **案 D**: 本文 Panel = `--bg-soft` 背景のみ + 角丸（罫線なし）                                            | 背景色の差で矩形を示す                     | 付帯セクションは罫線ありで対比                                                     | 罫線がない没入感の強さを実物で確認 / ライト/ダーク両モードで `--bg-soft` の対比強度を確認 | コードブロックがさらに濃い背景になり階層が分かりにくくなるかを確認 | 背景色で矩形成立                                                                 |
| 案 E（参考却下）: 全部を 1 つの巨大 Panel に収める                                                        | —                                          | —                                                                                  | M-α 視点で関連記事グリッドの境界線が没入感を阻害                                          | —                                                                  | （cycle-187 の議論で既に否定。AP-P17 形式通過回避のため参考までに残す）          |

**採用判断は D-A-proto の実物 4 案 × 4 枚 = 16 枚比較を経て確定する**。判定理由は `./tmp/cycle-188/prototype/decision.md` に記載。

補足: 本文 Panel の padding は DESIGN.md §3「8px グリッド」と「本文の最大幅 720px」に整合する範囲（24px / 32px / 48px のいずれか）で D-A-proto の比較対象に含める（**D-A-proto 観察時に 4 案 × padding 3 通り = 12 通りの観察を全数行う必要はなく、採用案を絞った上で padding を 1 通りに確定する**）。

**PM の覚悟確認文（AP-P02 / C6 反映）**: PM は `./tmp/cycle-188/prototype/decision.md` 冒頭に「**proto 4 枚を Read で観察するまで、どの案も第一候補にしない。観察結果が事前の言語化された理屈と矛盾した場合、ためらわず観察結果を優先して案を選ぶ**」を自署として記載する。

#### (a-2) メタ情報の視覚的階層化（条件 4）

パンくず → h1 → メタ行の視覚分離手段を **§3 適合のバリエーションで 4 案** に再構成（I7 反映: r1 の 3 案構造「区切り線 + 余白 / 色のみ / サイズのみ」は後者 2 案がほぼ自明に却下される r1 [C3] と同型構造のため撤回）。**4 案はすべて等価な比較対象** とし、結論ランキング表現は使わない（C6 の方針を踏襲）。**DOM 構造に関する案を含めて並べる**ことで装飾的バリエーションだけに閉じない検討を確保する。

| 案                                           | 手段                                                                                                                                                                                  | proto 観察観点                                                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **案 A**: 区切り線 + 余白                    | パンくずの下に細い `border-bottom: 1px solid var(--border)` + `margin-bottom: 1.5rem`、h1 の上下にも明確な余白。メタ行は h1 の下に `font-size: 13px` + `color: var(--fg-soft)` で配置 | DESIGN.md §3「階層は枠線とスペースで表現する」適合性。区切り線の存在感が「装飾」と「構造」のどちらに知覚されるかを実物確認 |
| **案 B**: 余白のみ（区切り線なし）           | 区切り線を引かず、`margin` だけで階層を作る（パンくずと h1 の間に 2rem、h1 とメタの間に 0.75rem 等）                                                                                  | 装飾を最小化したミニマル構成。空白だけで階層が知覚できるか / DOM 距離だけで分離できるか                                    |
| **案 C**: パンくずを上部固定帯に分離         | パンくずを本文 Panel の外側上部に独立した「navigation strip」として配置（タイトル / メタとは別ブロックで視覚的に独立）。本文 Panel はタイトルから始まる                               | パンくずと記事本体が「サイト UI」と「読み物」として分離される構造。M-α 没入感への影響を実物確認                            |
| **案 D**: DOM 順を入れ替えてタイトル最大強調 | DOM 順を `<Breadcrumb>` → `.meta` → `<h1>` に変更（メタ情報をタイトルの上に置く）。パンくずとメタを上部にまとめ、h1 が「ピラミッドの頂点」として最も大きく強調される                  | タイトルを最も強調する構造の没入感。M-α / M-γ の「記事本体への到達感」を実物確認                                           |

**採用判断は D-A-proto の実物観察で確定する**（D-A-proto の比較対象に (a-1) の 4 案と並列で含める）。判定理由は `./tmp/cycle-188/prototype/decision.md` に記載。区切り線の色（`--border` / `--border-strong`）と余白量は採用案確定後に D-B-4 で固定する。

#### (a-3) PlayRecommendBlock の処置（条件 5）

| 案                                                             | 処置                                        | 採用判断                                                                                                                                                               |
| -------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 X: **ブログ詳細から撤去（コンポーネント本体は残す）**       | `page.tsx` の import / JSX のみ削除         | **採用**。新コンセプト「日常の傍にある道具」と「単発診断/占いの誘導」が整合しない（site-concept.md L26）。コンポーネント本体は dictionary 詳細で使用中なので削除しない |
| 案 Y: 残し、絵文字を Lucide アイコンに置換し DESIGN.md §3 適合 | DESIGN.md §3 違反のみ修正して残す           | **却下**。§3 違反は解消できても、ブログ末尾を「コンセプト不整合な誘導」が占める根本問題（C5 の構造的問題）は残る                                                       |
| 案 Z: 撤去せずに「同シリーズ / 同カテゴリ記事のみ表示」に変更  | RecommendBlock の中身を別ロジックに差し替え | **却下**。実質的に RelatedArticles の重複機能になる。RelatedArticles の継続利用で十分                                                                                  |

採用案 X。コンポーネント本体の削除タイミングは別 backlog（dictionary 移行 Phase で再検討）。

**撤去後の next-action 提供（I14 反映）**: PlayRecommendBlock を撤去すると、ブログ末尾で M-α が「次にどこへ行くか」を見つける選択肢が後退するリスクがある。本サイクルでは末尾に残る next-action 提供要素として **(a) RelatedArticles（タグベース類似記事）、(b) SeriesNav（前後ナビ + シリーズ TOC）** が継続表示される。M-α 視点で十分な next-action として機能するかは V-B 観察項目 (vii) で検証する（V-B のチェック項目に追加済）。仮に V-B / R-B で「(vii) が NG」と判定された場合、本サイクル中の追加対応として「フッターまたは末尾への『最新記事 5 件』リスト追加」を **次サイクル backlog として B-XXX に起票** する（本サイクルでは新規セクション追加は行わない / Phase 6 のスコープを広げない）。

#### (a-4) ShareButtons 44px 確保の手段（条件 2）

**前提の訂正（r1 反映）**: 計画 r0 では「新版 ShareButtons は既に 44px 確保済み」を `current-state.md` C 表 #2 の記述に基づいて前提していたが、これは誤り。PM が以下の Read / grep を実体確認した結果、**新版には 44px 宣言が一切存在しない**。

- `src/components/ShareButtons/ShareButtons.module.css`: `min-height: 44px` / `min-width: 44px` ともに **0 ヒット**（grep 確認済）。`.buttons` は flex の wrapper 定義のみ。
- `src/components/ShareButtons/index.tsx` L110-148: 4 ボタンとも `<Button variant="default" size="small">` を呼んでいる。
- `src/components/Button/Button.module.css`: `.button` ベースは `padding: 9px 18px; font-size: 14px;`（高さ約 36px）、`.sizeSmall` は `padding: 5px 11px; font-size: 12px;`（高さ約 24px 程度）。**`min-height` / `min-width` 宣言なし**。
- 旧版 `src/components/common/ShareButtons.module.css` L24-27: `.shareButton { ...; min-height: 44px; min-width: 44px; }` が現存（参照値）。

つまり cycle-187 の現状把握も r0 計画の前提も誤っており、**新版 ShareButtons を `(new)/blog/[slug]/` から呼んだ瞬間に WCAG 2.5.5 違反が再発する**。本サイクルの条件 2 を満たすには改修が必須。

| 案                                                                                                                                                                                                                                      | 手段                                                                                                                                                                                                                                                                                     | 採用判断                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **案 Q (採用)**: 新版 `ShareButtons.module.css` の `.buttons > button`（または専用クラス）に `min-height: 44px; min-width: 44px;` を追加し、合わせて `index.tsx` の `<Button size="small">` の `size` 指定を撤去（default size に戻す） | コンポーネント自身の責任で 44px を保証する。Button のデフォルト size（padding 9px 18px / font-size 14px）に戻すことで、`min-height: 44px` を満たすために padding を二重で取る必要がなくなる。さらに将来 Button のデフォルト size が変わっても `min-height: 44px` の床が CSS で固定される | **採用**。コンポーネント単体で WCAG 2.5.5 準拠が完結し、他ページで ShareButtons を使う場合も自動的に保証される。size="small" を撤去するのは、small だと padding 5px の上に min-height で引き伸ばすことになり「文字位置が上に詰まった見た目」になりやすいため（Button 側の `display: inline-flex; align-items: center` で文字は中央寄せされるが、視覚的に「箱の中で文字が浮く」感じが出やすい。default size なら自然な余白で 44px の高さに到達する） |
| 案 R: page.module.css 側で `.shareSection :global(button) { min-height: 44px; }` を CSS 上書きする                                                                                                                                      | ブログ詳細だけで強制                                                                                                                                                                                                                                                                     | **却下**。コンポーネント責務の分裂を生み、他のページで新版 ShareButtons を使うときに同じ問題が再発する。CSS Modules の `:global()` 利用も Lint で警告対象になりうる                                                                                                                                                                                                                                                                                 |
| 案 S: Button コンポーネント側に `size="touch"` という第 3 サイズを新設する                                                                                                                                                              | `Button.module.css` に新 size を追加                                                                                                                                                                                                                                                     | **却下**。Button は本サイクルのスコープ外（design-migration-plan の Button 関連 Phase は別途）。Button 仕様変更は他箇所への波及テストが必要で、Phase 6 のスコープを大きく広げる                                                                                                                                                                                                                                                                     |
| 案 T: 旧 `common/ShareButtons.module.css` を新版にそのまま差し替える（独自 SNS カラー含む）                                                                                                                                             | 旧版を移植                                                                                                                                                                                                                                                                               | **却下**。旧版は SNS ブランドカラー（黒/緑/水色）を使うデザインで、新デザインの「無彩色 + アクセント色」方針と整合しない。旧版の 44px 宣言だけ採取して新版に転記するのは案 Q に含まれる                                                                                                                                                                                                                                                             |

完了条件: (i) `grep -E "min-(height|width):\s*44px" src/components/ShareButtons/ShareButtons.module.css` が 2 ヒット以上、(ii) `grep "size=\"small\"" src/components/ShareButtons/index.tsx` が 0 ヒット、(iii) V-D の Playwright 実機計測で 4 ボタン全部が `boundingBox().height >= 44 && width >= 44`。

#### (a-5) TOC（目次）の配置

| 案                                                                                                                          | 配置                                                          | 採用判断                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 案 i: **デスクトップでは本文 Panel の右側に独立 Panel として並列配置（aside 220px 程度）、モバイルでは details 折りたたみ** | 旧 (legacy) と同じ DOM ロジックを継承しつつ、Panel として明示 | **採用候補**。M-β / M-γ の長文記事ナビゲーション要求を満たし、§1 を満たし、§4 入れ子禁止にも違反しない         |
| 案 ii: 本文 Panel 内に sticky で TOC を配置                                                                                 | 本文 Panel の中に TOC を含める                                | **却下**。Panel 内に独立した sticky aside を持たせると「Panel 内の小 Panel」と知覚されやすく §4 の精神に反する |
| 案 iii: TOC を完全廃止                                                                                                      | M-β / M-γ にとっての navigation 価値を捨てる                  | **却下**。長文記事の到達経路として TOC は機能しており、廃止は来訪者価値の毀損                                  |

採用案 i。デスクトップの grid レイアウトの具体値（`grid-template-columns` 等）は D-A で確定。

**モバイル `<details>` の Phase 6 スコープ含意（I15 反映）**: モバイル折りたたみは旧 (legacy) 実装で既に `<details>` を使用しているため、**本サイクルでは旧実装の DOM 構造をそのまま継承する**（コンポーネント `src/blog/_components/TableOfContents.tsx` の details ロジックを `(new)/blog/[slug]/` から呼ぶ）。新規実装は行わず、Phase 6 のスコープに含める（別 backlog 化はしない）。D-A の付録に details の SP 仕様として以下を明記する: (vi-1) `<summary>` のスタイリング = `font-size: 14px` + `color: var(--fg-soft)`、(vi-2) focus-visible は `:focus-visible { outline: 2px solid var(--accent); }`、(vi-3) ダークモード配色は `:global(:root.dark)` ルールで `--bg-soft` を反映（`docs/knowledge/css-modules.md`）、(vi-4) 開閉状態は **記事間で持ち越さない**（state 永続化なし、ページ遷移ごとに閉じた状態で表示）、(vi-5) 開閉アニメーションは `prefers-reduced-motion: reduce` 対応のため CSS transition は付与しない（旧実装と同等）。

### 計画にあたって参考にした情報

#### リサーチレポート

- `/mnt/data/yolo-web/tmp/research/2026-05-12-cycle-188-rollback-analysis.md` — cycle-187 ロールバック原因の構造化、最優先制約 8 件、抵触 AP リスト、r1〜r4 レビュー指摘の cycle-188 への引き継ぎ
- `/mnt/data/yolo-web/tmp/research/2026-05-12-cycle-188-current-state.md` — 旧 /blog/[slug] の構成図、(new) 側で利用可能なコンポーネント / トークン、Panel コンポーネント現状 API、6 要素のギャップ表、design-migration-plan Phase 6 要件と現状ギャップ
- `/mnt/data/yolo-web/tmp/research/2026-05-12-cycle-188-targets-and-ap.md` — ターゲットペルソナ M-α / M-β / M-γ 定義、cycle-188 で守るべき AP トップ 5、知識ベースの関連箇所

#### 過去サイクルドキュメント

- `/mnt/data/yolo-web/docs/cycles/cycle-187.md` — 特に「ロールバック判断」セクション、L1340-1347（6 再着手条件原文）、L1355-1387（抵触 AP 9 件記録）、L759-924（completion 超批判的再レビューの Critical 5 件）、L244-258（cycle-187 で却下した代替案）、D2 / T6 / T9 タスク（cycle-188 で再実施が必要な変更の参照元）
- `/mnt/data/yolo-web/docs/cycles/cycle-186.md` — Phase 5 ② 転換の判断（Header の検索枠が未結線で残ること）

#### デザインシステム / 移行計画

- `/mnt/data/yolo-web/docs/design-system-by-claude-design/README.md` — §3 視覚指針（色 / タイポ / 角丸 / スペーシング / Elevation / アイコン / 絵文字）、§4 アイコン方針（絵文字使わない、Lucide のみ）、本文最大幅 720px / 道具箱最大幅 1200-1440px
- `/mnt/data/yolo-web/docs/design-migration-plan.md` Phase 6 セクション（L147-155）— Phase 6 完了基準、標準手順
- `/mnt/data/yolo-web/docs/site-concept.md` L9 / L26 — 「あくまで『道具』がコア」「既存の診断・占いコンテンツは将来的に整理する」（PlayRecommendBlock 撤去判断の根拠）

#### アンチパターン

抵触チェック対象の AP ID 一覧（後段「### アンチパターン抵触チェック」で各 AP に対する予防仕掛けを記述）:

- AP-I01（来訪者目線でのレビュー）
- AP-I05（来訪者の本来目的を妨げる追加コンテンツ）
- AP-I07（jsdom で検出できない layout 依存・production ビルド由来のバグ）
- AP-I08（DESIGN.md 未定義の視覚表現追加）
- AP-P02（自分が選んだ戦略を否定するデータの軽視）
- AP-P09（ゴール読み替え）
- AP-P11（過去 AI 判断の変更不可制約化）
- AP-P16（計画書執筆中の前提条件未確認）
- AP-P17（複数案 3 案以上の比較未実施）
- AP-WF04（構造的変更報告の grep 未確認承認）
- AP-WF05（着手前撮影 / N×4 網羅 / 設定統一）
- AP-WF06（サブエージェントへの未確認情報伝達）
- AP-WF07（並行アサインによる競合）
- AP-WF09（チェックリスト形式通過 / 範囲恣意的限定）
- AP-WF11（PM の最終成果物自己通読確認）
- AP-WF12（PM が計画立案中に自ら参照する事実情報の実体未確認）
- AP-W04 / AP-W09 / AP-WF06（cycle-187 のブログ執筆段階で抵触したもの。本サイクルでは執筆有無を後段で判断）

#### ターゲット定義

- `/mnt/data/yolo-web/docs/targets/README.md` — サブターゲット定義
- `/mnt/data/yolo-web/docs/targets/AIの日記を読み物として楽しむ人.yaml`（M-α）
- `/mnt/data/yolo-web/docs/targets/Webサイト製作を学びたいエンジニア.yaml`（M-β）
- `/mnt/data/yolo-web/docs/targets/AIエージェントやオーケストレーションに興味があるエンジニア.yaml`（M-γ）

#### 知識ベース

- `/mnt/data/yolo-web/docs/knowledge/css-modules.md` — `:global(:root.dark)` パターン（ダークモード対応で必要）
- `/mnt/data/yolo-web/docs/knowledge/nextjs.md` — §1 dev サーバー再起動 / §3 CSS カスタムプロパティ fallback 構文 / §8 古いプロセス残存 / §9 Turbopack バンドルサイズ確認

#### 実体確認（計画立案時に Read / Bash で実行 / r1 反映で全数再確認）

r1 レビューの「リサーチレポート由来の事実主張に他にも誤認がないか全数再確認せよ」指摘に対応し、本計画書中で前提として参照しているすべての数値・ファイルパスを Read / Bash で実体確認した結果を以下に出典として併記する。「実行結果」列が research レポートの記述と食い違う行は **訂正** マークを付け、リサーチレポート側にも追記すること（C1 への対応）。

| 項目                                               | 実行コマンド                                                                                                                                                     | 実行結果                                                                                                                                                                                                                               | research との整合                                                                                        |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| ブログ記事数                                       | `ls src/blog/content/*.md \| wc -l`                                                                                                                              | **60**                                                                                                                                                                                                                                 | 一致                                                                                                     |
| **Mermaid 入り記事数（C9 訂正）**                  | `grep -lE '^\`\`\`mermaid' src/blog/content/\*.md \| wc -l`                                                                                                      | **7**（`grep -l "mermaid"` の 11 は本文中の単語言及「`mermaid.render()`」「`mermaidExtension`」等の偽陽性を含む。実 ` ```mermaid ` ブロックを持つのは 7 件）                                                                           | **訂正**: r2 反映時の「11」は偽陽性。完了基準 #14 軸 1 / D-C 候補は 7 件から選ぶ                         |
| **シリーズ所属記事数（C8 訂正）**                  | `grep -lE '^series: \"' src/blog/content/*.md \| wc -l`                                                                                                          | **28**（`series: null` は 30 件、`series:` フィールド自体が無いのは 2 件、合計「実シリーズ非所属」= 32 件。`grep -l "^series:"` の 58 は `series: null` 行も hit するため誤値）                                                        | **訂正**: r2 反映時の「58 / 非所属 2 件」は誤り。実シリーズ ID 28、`series: null` 30、フィールド無 2     |
| Panel コンポーネント現状 API                       | `Read src/components/Panel/index.tsx`                                                                                                                            | `as` / `children` / `className` の 3 props（variant / variant="transparent" などのプロパティは存在しない）                                                                                                                             | 一致                                                                                                     |
| Panel CSS                                          | `Read src/components/Panel/Panel.module.css`                                                                                                                     | `.panel { background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-normal); padding: 1.5rem; }` のみ。`.transparent` クラス無し                                                                                  | 一致                                                                                                     |
| 旧版 ShareButtons 44px                             | `Read src/components/common/ShareButtons.module.css`                                                                                                             | L25-26 に `min-height: 44px; min-width: 44px;` を確認                                                                                                                                                                                  | 一致                                                                                                     |
| **新版 ShareButtons 44px（C1 訂正）**              | `grep -E "min-(height\|width)" src/components/ShareButtons/ShareButtons.module.css`                                                                              | **0 ヒット**。新版には 44px 宣言が存在しない。`.copiedMessage` の `min-height: 1.2em;` のみ                                                                                                                                            | **訂正**: research の `current-state.md` C 表 #2「新版 ShareButtons は既に 44px 確保済み」は誤り。要追記 |
| 新版 ShareButtons の Button size 利用              | `grep "size=" src/components/ShareButtons/index.tsx`                                                                                                             | 4 ボタンとも `<Button variant="default" size="small">` を使用                                                                                                                                                                          | research に明示なし                                                                                      |
| Button コンポーネント 44px                         | `grep -E "min-(height\|width)" src/components/Button/Button.module.css`                                                                                          | **0 ヒット**。Button 本体にも 44px 宣言なし。`.button` は `padding: 9px 18px; font-size: 14px;`、`.sizeSmall` は `padding: 5px 11px; font-size: 12px;` で 44px に届かない                                                              | research に明示なし                                                                                      |
| `src/blog/_components/` 内の旧トークン使用ファイル | `grep -c "color-bg-secondary\|color-text\|color-primary\|color-accent\|color-border\|color-bg" src/blog/_components/*.module.css`                                | **対象 4 ファイル**: TableOfContents=5 / TagList=4 / RelatedArticles=9 / SeriesNav=12 = **計 30 ヒット**。**対象外 4 ファイル**: BlogCard / BlogFilterableList / BlogGrid / BlogListView = **すべて 0 ヒット**（既に新トークン化済み） | research と一致しつつ、対象 4 ファイルへの限定が必要                                                     |
| 対象 4 ファイル限定 grep                           | `grep -E "color-(bg-secondary\|text\|primary\|accent\|border\|bg)" src/blog/_components/{TableOfContents,SeriesNav,RelatedArticles,TagList}.module.css \| wc -l` | **30 ヒット**（完了基準 #4 のターゲット範囲。完了時 0 になることを期待）                                                                                                                                                               | 完了基準 #4 を訂正                                                                                       |
| PlayRecommendBlock のディレクトリ                  | `find src -iname "*playrecommend*"`                                                                                                                              | `src/play/_components/PlayRecommendBlock.{tsx,module.css}` および `__tests__/PlayRecommendBlock.test.tsx`（**`src/components/` 配下ではない**）                                                                                        | research と整合                                                                                          |
| PlayRecommendBlock CSS の旧トークン使用            | `grep -E "var\(--color-" src/play/_components/PlayRecommendBlock.module.css \| head`                                                                             | 複数行ヒット（`--color-bg-secondary` / `--color-text` / `--color-text-muted` / `--color-bg` / `--color-border` / `--color-primary` 等）。fallback 構文の追加が必要                                                                     | 一致 / T3 の対象                                                                                         |
| PlayRecommendBlock 利用箇所                        | `grep -rn "PlayRecommendBlock" src/app/`                                                                                                                         | `src/app/(legacy)/blog/[slug]/page.tsx` L28 / L178、`__tests__/page.test.tsx` 内の複数行（撤去で test 修正が必要 = T9）                                                                                                                | 一致                                                                                                     |

**重要訂正**: C1 で指摘された通り、新版 ShareButtons には 44px 宣言が一切存在しない。リサーチレポート `tmp/research/2026-05-12-cycle-188-current-state.md` の C 表 #2 該当行に「**訂正: 実体は ShareButtons.module.css に min-height/min-width 44px の宣言なし、index.tsx は Button size=\"small\" を使用、Button 側にも 44px 宣言なし**」を追記する作業を、本計画書修正と同時にサブエージェントへ依頼する（実体は計画書の (a-4) と T7 で改修方針を確定済み）。

### 完了基準

機械的に判定可能な項目として **15 項目**（r1 反映で #4 修正 / #6 修正 / #10 強化 / #11 環境明示 / #13 #14 #15 新設）を定義する。すべての項目が満たされない限り main へのマージを行わない。

1. `(new)/blog/[slug]/page.tsx` 内に `TrustLevelBadge` の import / JSX が存在しない（`grep -n "TrustLevelBadge" src/app/(new)/blog/[slug]/page.tsx` が 0 ヒット）。
2. `(new)/blog/[slug]/page.tsx` 内に `PlayRecommendBlock` の import / JSX が存在しない（`grep` が 0 ヒット）。
3. `src/app/globals.css` に `--font-mono:` の宣言行が存在する（grep で 1 ヒット以上）。
4. **（C4 反映で訂正）対象 4 ファイルを明示列挙する形式での grep**: `grep -E "color-(bg-secondary|text|text-muted|primary|primary-hover|accent|border|bg)" src/blog/_components/{TableOfContents,SeriesNav,RelatedArticles,TagList}.module.css` が **0 ヒット**。対象外の 4 ファイル（BlogCard / BlogFilterableList / BlogGrid / BlogListView）はワイルドカードに巻き込まないため、ファイル名を必ず波括弧展開で指定する。
5. `src/components/Panel/Panel.module.css` に `.transparent` クラスが存在しない（grep で 0 ヒット）。
6. **（C1 反映で訂正）** (i) `grep -E "min-(height\|width):\s*44px" src/components/ShareButtons/ShareButtons.module.css` が **2 ヒット以上**（min-height と min-width のそれぞれが 44px 以上で宣言されている）、かつ (ii) `grep "size=\"small\"" src/components/ShareButtons/index.tsx` が **0 ヒット**（Button のデフォルトサイズに変更）。
7. `(new)/blog/[slug]/page.module.css` 内で本文ラッパー要素が `max-width: 720px` を持ち、`margin: 0 auto` 相当で中央寄せされる宣言が存在する（`grep -E "max-width:\s*720px" src/app/(new)/blog/[slug]/page.module.css` が 1 ヒット以上、かつ `grep -E "margin:\s*0\s+auto" src/app/(new)/blog/[slug]/page.module.css` が 1 ヒット以上）。
8. `./tmp/cycle-188/before/` に **16 ファイル**（4 記事 × {w360, w1280} × {light, dark}）の PNG が存在し、撮影スクリプトの commit / または `./tmp/cycle-188/before/manifest.json` で撮影設定が `fullPage: true` で記録されている（manifest 各エントリに `fullPage` キー = true）。
9. `./tmp/cycle-188/after/` に同条件 16 ファイルの PNG が存在し、同様の manifest がある。
10. **（I1 反映 + C5 反映で再修正）** `./tmp/cycle-188/pm-visual-review.md` に「16 行 × (6 観点 + 3 ペルソナ + 旧版比較) = 16 × 10 = **160 セル** 全部空でない」を満たす観察表が存在する。テンプレート（D-B-6 で確定）は次の構造を厳守する: 列 = `[画像ファイル名(.png) / (i)パンくずメタ視覚分離 / (ii)タイトル本文左端起点 / (iii)シェア大きさ / (iv)本文Panel矩形 / (v)PlayRecommendBlock不在 / (vi)旧版同条件比較 / M-α判定 / M-β判定 / M-γ判定 / 旧版比較(旧≦新 = OK / 旧>新 = NG)]`（合計 11 列、外側パイプ込みで NF=13）。(i)-(vi) は `○ / × / 要観察` のいずれか、ペルソナ判定は `OK / 要改善 / NG` のいずれか、旧版比較は `OK / NG` のいずれかを必ず付ける。空欄・ハイフン・「未確認」の表記は不可。
    - **判定スクリプトは r1 添付の awk one-liner（`awk -F"|" 'NF>=11 && !/^---/ {for(i=2;i<=11;i++) if($i!~/[○×OKNG要]/) exit 1}' ...`）を撤回する**（C5 反映: 当該 awk は外側パイプで NF=13 になり、ヘッダー行が `^---` にマッチしないまま検査対象になり、列番号も列範囲も誤っていたため、正常データに対して必ず exit 1 になる構造的欠陥が r2 で実証された。AP-WF12 / AP-P16 への計画立案中抵触事案）。
    - **代替**: D-B-6 の成果物として `./tmp/cycle-188/check-pm-visual-review.sh`（小スクリプトファイル）を作成する。スクリプトの責務は次のとおり: (a) 行頭が `|` かつ第 2 フィールドが `*.png` で終わるデータ行のみを対象とする（ヘッダー行・区切り行は対象外）、(b) NF<13 はエラー、(c) 列 3..8（観察 (i)-(vi)）は `^(○|×|要観察)$` のいずれか、(d) 列 9..11（ペルソナ）は `^(OK|要改善|NG)$` のいずれか、(e) 列 12（旧版比較）は `^(OK|NG)$` のいずれか、(f) 空セル / フォーマット不一致があれば `exit 1`、データ行ゼロも `exit 1`、(g) 全行 OK なら `exit 0` で `OK: <rows> rows passed` を出力。
    - **動作検証ログ**: スクリプト作成と同時に、サンプル good / bad 入力に対する `exit 0` / `exit 1` の検証結果を `./tmp/cycle-188/prototype/check-script-validation.md` に貼る。**r2 反映時に PM が試作版で検証済み**（試作スクリプト = `./tmp/cycle-188-r2-verify/check-pm-visual-review.sh`、good サンプルで `exit 0` + `OK: 2 rows passed`、bad サンプル（空セル混入）で `exit 1` + 該当エラー出力を確認）。最終版は同型で D-B-6 の成果物として再作成する。
11. **（I4 反映で環境明示）** Playwright 実機で代表記事 1 件の各 ShareButton（4 ボタン）の `boundingBox().height >= 44 && width >= 44` がすべて true になる。実行環境は **`pkill -f "next-server" \|\| true && npm run build && npx next start` で起動した production ビルド**（dev サーバーや Turbopack 不可。AP-I07 と `docs/knowledge/nextjs.md` §1 / §8 に従う）。
12. `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
13. **（C4 反映で新設 + I8 反映で grep 改善）** `src/play/_components/PlayRecommendBlock.module.css` の旧トークン参照がすべて fallback 構文（`var(--fg, var(--color-text))` 形式）に置換されている。判定: **`grep -nE "var\(--color-" src/play/_components/PlayRecommendBlock.module.css | grep -v ", var(--color-"` が 0 ヒット**（fallback の右辺としての `--color-X` だけを許容し、それ以外の裸の旧トークン参照を検出する。r1 で添付した `var\(--color-[a-z-]+\)\s*;` は `box-shadow: 0 2px 4px var(--color-border), 0 0 0 1px white;` のように `var(--color-X)` 直後にセミコロンが無い multi-arg ケースを取りこぼす。r2 反映時に PM がサンプル CSS（`/mnt/data/yolo-web/tmp/cycle-188-r2-verify/sample-css2.css`）で当該取りこぼしを実証し、改善 grep が想定どおり .x 行を検出することを確認済み）。
14. **（I2 反映で新設 / I11 反映で選定アルゴリズム決定論化 / C7 反映でアルゴリズム再構築）** V-C の網羅検証として、**「全 60 記事 w1280 light サムネ撮影 + 表示崩れリスクが特に高い 2 軸で層化抽出した 16 記事のフルページ撮影」** の 2 段構成で実施する。
    - **層化抽出 16 記事の決定論的選定**（後段 builder が同じ 16 記事に到達できる手順 / **C7 反映で 3 軸 → 2 軸に再設計**）:
      - **C7 修正の経緯**: r2 反映時の「3 軸（Mermaid / コードブロック多寡 / タイトル長 ≥ 50）× 各 2 通り = 8 セル × 各 2 件」は **タイトル長 < 50 文字の記事が 60 件中 0 件**（最短 52 文字）かつ **Mermaid 入り記事が 7 件しかない**ため、複数セルが空集合になり実行不能（PM 自主確認の虚偽 = AP-WF12 / AP-P16 への 3 度目抵触）。
      - **再設計**: **2 軸 × 各 2 通り = 4 セル × 各 4 件 = 16 記事**。実体集計で全 4 セルが 11 件以上で完全成立することを PM が再確認。
        - **軸 1**: シリーズ所属 (Yes = 実シリーズ ID あり 28 件 / No = `series: null` または非定義 32 件)
        - **軸 2**: コードブロック数 (Yes = `^\`\`\`` の出現が 8 以上 = 4 ブロック以上の記事 27 件 / No = 8 未満 33 件)
      - **4 セルの実体分布**（PM 自主確認、`/tmp/cycle188-meta.txt` 集計）: SN BN = 16 件、SN BY = 16 件、SY BN = 17 件、SY BY = 11 件。**全セルで 11 件以上 → 各セル 4 件確保が確実に可能**。
      - **セル内で 4 件選ぶ際の同点回避ルール**: frontmatter `date` の昇順で先頭 4 件を機械的に採用。Mermaid 入りの 7 件のうち代表 4 記事 (D-C) と重複しない記事は、できれば 16 記事の中に含むようセル内で優先選定（Mermaid 観察対象のカバレッジ確保）。
      - 16 記事の slug 確定リストは D-C 完了時に `./tmp/cycle-188/sample/16-articles.md` に「セル番号 / slug / 該当軸の値 / Mermaid 有無」を表形式で固定し、その後の builder 判断を不要にする。
    - **全 60 記事サムネ撮影**: `viewport: { width: 320, height: 240 }`（PM が一覧して表示崩れの有無のみ判定）。
    - **層化 16 記事フルページ撮影**: w1280 light で `{ fullPage: true }` （PM が Read で 1 枚ずつ確認）。
    - **技術検証（S8 反映）**: 60 サムネ + 16 フルページ = **76 撮影** を順次実行する所要時間は production ビルド起動 (約 30s) + 撮影ループ (約 1s/枚 × 76 = 76s) + ブラウザ起動オーバーヘッド = **概ね 3〜5 分以内** と見込まれる。Playwright の単一ブラウザコンテキストで sequential 実行する設計で十分実行可能（`page.goto` → `page.screenshot` の単純ループ）。10 分を超えるようなら並列化 / batched 化を検討する旨を計画書に記載するが、初期は逐次で着手する。
    - **判定方法（S12 反映で機械判定可能化）**: (i) `./tmp/cycle-188/sample/thumbnails/` に 60 PNG が存在する（ファイル数判定）、(ii) `./tmp/cycle-188/sample/fullpage/` に 16 PNG が存在し、ファイル名が 16-articles.md の slug と 1 対 1 で対応、(iii) `./tmp/cycle-188/sample/issues.md` が存在し（崩れがゼロでも空ファイルではなく「崩れなし」見出しを記載）、崩れがあった場合は記事 slug + 該当箇所 + 対処または「許容判断 + 理由」が記される。PM 主観判定の結果はこの issues.md ファイルに記録される。
15. **（C2 反映で新設 / C6 反映で覚悟確認文を更新 / I16 反映で機械判定可能化）** `./tmp/cycle-188/prototype/decision.md` が存在し、以下のすべてを満たす。
    - (i) (a-1) の 4 案 (A/B/C/D) と (a-2) の 4 案 (A/B/C/D) の **すべてを等価に並べた** 比較対象組合せが記載されている。
    - (ii) 撮影された 32 枚（(a-1) 16 枚 + (a-2) 16 枚 = S9 反映の比較順序による）の画像ファイル一覧が `{a1-A|a1-B|a1-C|a1-D|a2-A|a2-B|a2-C|a2-D}-{w360|w1280}-{light|dark}.png` 命名で `./tmp/cycle-188/prototype/` 配下に存在する。
    - (iii) PM の判定理由（M-α 没入感 / M-β コード可読性 / §1 適合度 の各観点で）が記載されている。
    - (iv) **decision.md の 1 行目に固定文言**「`PM は実物 4 枚を Read で観察するまで採用案の予断を持たない`」**が含まれる**（`grep -F "PM は実物 4 枚を Read で観察するまで採用案の予断を持たない" ./tmp/cycle-188/prototype/decision.md` が 1 ヒット以上 = 機械判定可能）。「第一候補を切り替える覚悟」「自筆」のような主観混入表現は撤回（I16 反映: PM 自筆の真正性は機械判定不能のため、固定文言の grep 判定に置換）。
    - (v) **proto 比較で PM が事前予測と異なる案を選んだ場合、`decision.md` 内に「事前予測 / 観察結果 / 判定理由」の 3 段落が含まれる**（事前予測 = proto 撮影前の PM 言語化、観察結果 = proto 16 枚 Read 後の所感、判定理由 = なぜ予測が覆ったか）。事前予測どおりの結論になった場合も、「事前予測 / 観察結果 / 判定理由（予測通り）」の 3 段落構造を保つ（I16 反映: 機械判定可能な形での AP-P02 予防）。

### アンチパターン抵触チェック

| AP ID                                                             | 本計画での予防仕掛け                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AP-I01**（来訪者目線レビュー）                                  | 完了基準 #10 で「PM が 16 枚を Read で観察した記録」を機械判定可能に固定。R-B で visual reviewer が PM 観察ノートとは独立に判定する手順を明示                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **AP-I05**（無関係コンテンツの追加）                              | (a-3) で PlayRecommendBlock 撤去を採用案 X として確定。完了基準 #2 で grep 検証                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **AP-I07**（jsdom 検出不能の本番ビルド由来バグ）                  | V-D で Playwright 実機による a11y 自動チェック（44px / focus-visible / タブ移動）を必須化                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **AP-I08**（DESIGN.md 未定義表現の追加）                          | 最優先制約 1 / (a-1) 案 1 採用で `Panel.variant="transparent"` を禁止。完了基準 #5 で grep 検証                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **AP-P02**（不利データの軽視）                                    | (a-1) で「本文 Panel が読み物没入感を阻害する懸念」を案 1 採用判断の補足に明示し、D-A の中で「弱い罫線への切替検討」を予備動作として組み込む                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **AP-P09**（ゴール読み替え）                                      | 「### 目的」で「移行作業の完了は目的ではない」を明文化。失敗の定義（ロールバック判断基準）を最優先制約と整合させる                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **AP-P11**（過去 AI 判断の変更不可制約化）                        | cycle-187 ロールバック判断を所与とせず、6 再着手条件をゼロベースで再検討（特に (a-3) で「絵文字撤去のみ案」「同シリーズ記事に差替え案」を却下案として明示記述）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **AP-P16**（計画書執筆中の前提条件未確認）                        | 「### 計画にあたって参考にした情報」末尾の「実体確認」リストで、本計画書中の数値・ファイルパスを Read / grep / ls で実体確認した結果を出典として併記。**本サイクル中、計画 r0 段階で「新版 ShareButtons は 44px 確保済み」を未確認で記載 → r1 で C1 として指摘・修正、その後 r1 反映で完了基準 #10 に awk スクリプトを動作確認せず掲載 → r2 で C5 として指摘・修正という形で 2 度抵触した**。これを受け、r2 反映以降は「**計画書に書いた grep / awk / find / コマンド・スクリプトは PM 自身がサンプル入力で実行して exit code を確認した上で記載する**」を運用ルール化し、r2 反映時に判定スクリプトを `/mnt/data/yolo-web/tmp/cycle-188-r2-verify/` で動作検証してから計画書に転記した。 |
| **AP-P17**（3 案以上の比較未実施）                                | 「### 検討した他の選択肢と判断理由」で (a-1)〜(a-5) の 5 課題それぞれに 3 案以上の比較表を記載                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **AP-WF04**（構造的変更報告の grep 未確認承認）                   | 完了基準 #1, #2, #4, #5, #6 のように「grep が 0 ヒット / 1 ヒット以上」の形式で実体確認を要求                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **AP-WF05**（着手前撮影 / N×4 / 設定統一）                        | B-A / V-A で before / after を `fullPage: true` 統一で 16 枚ずつ撮影。完了基準 #8 #9 で機械判定                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **AP-WF06**（未確認情報の伝達）                                   | builder への指示は「### 計画にあたって参考にした情報」末尾の実体確認リストを根拠とし、推測ベースの数値・パスを伝えない。各 builder タスクの依存ファイルパスを計画書内で明示                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **AP-WF07**（並行アサインの競合）                                 | 「実施する作業」末尾の注記で「T2 のように複数ファイルを触るタスクは同一 builder に直列で渡す」を明示                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **AP-WF09**（形式通過 / 範囲恣意的限定）                          | 本表で AP ごとの「予防仕掛け」を 1 行ずつ記述（「該当なし」「抵触なし」記述を禁止）。完了基準を grep などの機械判定形式に固定                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **AP-WF11**（PM の最終成果物自己通読）                            | V-B で PM が 16 枚を 1 枚ずつ Read で開く運用。観察ノートは reviewer ではなく PM 自身が書く                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **AP-WF12**（PM が計画立案中に参照する事実の未確認）              | 「### 計画にあたって参考にした情報」末尾の実体確認リストに加え、計画書中の主張（「現状の X は Y」）には研究レポートの行番号引用または直接の Bash 出力を併記。**本サイクルでは r0 → r1 で C1 として、r1 → r2 で C5 として、計 2 度抵触した**。r2 反映過程では、計画書中に登場するすべての awk / grep / find / sed パターンを `/mnt/data/yolo-web/tmp/cycle-188-r2-verify/` 配下のサンプル入力で実行し、good 系 / bad 系の両方で exit code を確認した上で計画書に転記する手順を採った（具体: 完了基準 #10 の判定スクリプト、完了基準 #13 の改善 grep、I9 の波及調査 grep、I11 の素材集計コマンド全数）。                                                                                   |
| **AP-W04 / AP-W09 / AP-WF06**（cycle-187 のブログ執筆段階で抵触） | 本サイクルでブログ執筆を行うか否かは V-B / R-B 完了後に PM が改めて判断する。執筆を行う場合は「事実情報の実体確認」「核主張の自己整合性チェック」「blog-writer への確認済み事実のみ伝達」をブログ執筆計画に再度組み込む。本計画書では執筆の前提条件として明記するに留める                                                                                                                                                                                                                                                                                                                                                                                                                |

## レビュー結果

<作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。>

### r1 レビュー（2026-05-12）

詳細: `tmp/research/cycle-188-plan-review-r1.md`。判定 = 改善指示。Critical 4 件 + 重要 6 件、計 10 件すべて反映済み。

| ID  | 区分     | 指摘要約                                                                                                 | 反映箇所                                                                                                                                                                                                                                                                                                              |
| --- | -------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Critical | リサーチレポート由来「新版 ShareButtons 44px 確保済み」が事実誤認。AP-WF12 / AP-P16 への計画立案中抵触。 | (a-4) 全面書き換え（前提の訂正 + 案 P/Q/R/T の 4 案再構築 + 採用案 Q）。T7 を新規タスクとして追加（実体確認結果と採用方針を本文記載）。完了基準 #6 を grep 2 種類のチェックに更新。実体確認リストに ShareButtons / Button の grep 結果を追加。リサーチレポート `current-state.md` の該当 6 箇所に「訂正」追記を実施。 |
| C2  | Critical | (a-1) 採用案 1 の根拠が「書籍ページのメタファ」という比喩で言いっぱなし。                                | D-A-proto タスクを設計フェーズ冒頭に新設（プロトタイプ実装 → 4 枚 × N 通りのスクショ → PM が Read で実物比較 → decision.md 記録）。「この決定が完了するまで T5 / T6 着手を許可しない」を明記。                                                                                                                        |
| C3  | Critical | (a-1) の 3 案が独立 3 案として機能せず AP-P17 の形式通過。                                               | (a-1) を案 A（弱罫線 + 背景）/ 案 B（border-strong のみ）/ 案 C（border-top/bottom のみ）/ 案 D（背景のみ補欠）の 4 案に再構成。M-α 没入感 / M-β コード可読性 / §1 適合度の 3 観点で評価。D-A-proto の実物比較で確定する手順を明記。                                                                                  |
| C4  | Critical | 完了基準 #4 の grep スコープが対象外を巻き込み必ず red になる。                                          | 完了基準 #4 を「対象 4 ファイル明示列挙形式（{TableOfContents,SeriesNav,RelatedArticles,TagList}.module.css）」に書き換え。PlayRecommendBlock.module.css の fallback 構文確認は完了基準 #13 として切り出し。                                                                                                          |
| I1  | 重要     | 完了基準 #10 が「1 文書けば pass」状態。                                                                 | 完了基準 #10 を「16 行 × (6 観点 + 3 ペルソナ + 旧版比較) = 160 セル全部空でない」に書き換え。観察ノートテンプレートの列構成を本文に固定。簡易判定 awk スクリプトも添付。                                                                                                                                             |
| I2  | 重要     | V-C のランダム 8 記事サンプルが網羅性不足。                                                              | 完了基準 #14 を新設し「frontmatter バリアント（series / updated_at / Mermaid / コード量 / tags 数 / 文字数）で層化抽出した 16 記事 + 全 60 記事の w1280 light サムネ撮影」に拡張。                                                                                                                                    |
| I3  | 重要     | 設計レビュー D-D が 1 ラウンド前提。                                                                     | D-D を「Critical / 重要が 1 件でも残っている限り次フェーズへ進まず追加ラウンドを反復する（最大ラウンド数は設定しない）」に更新。                                                                                                                                                                                      |
| I4  | 重要     | V-D Playwright 検証の前提環境（dev / production）未明示。                                                | 完了基準 #11 に「`pkill -f "next-server" \|\| true && npm run build && npx next start` で起動した production ビルド」を明示。`docs/knowledge/nextjs.md` §1 / §8 への参照も追加。                                                                                                                                      |
| I5  | 重要     | 認知バイアス系 AP の予防仕掛けが「明文化」止まり。                                                       | (a-1) 補足に「PM は自分が現時点で第一候補にしている案 A が、実物 4 枚で見たときに案 B / C より明らかに劣っていた場合、case を切り替える覚悟を持つ」覚悟確認文の `prototype/decision.md` 冒頭への自署を追加（AP-P02 への具体行動）。                                                                                   |
| I6  | 重要     | T5 / T6 の同一 builder 直列アサイン未明記。                                                              | 「実施する作業」末尾の AP-WF07 注記を「T2 / T5 / T6 のように」に拡張し、「特に T5 → T6 を必ず同一 builder に直列でアサインする」を明示。                                                                                                                                                                              |

加えて、レビュー指示にあった「リサーチレポート由来の他の事実主張に同様の誤認がないか」を全数再確認し、Panel 現状 API（`as / children / className` の 3 props のみ。variant プロパティは現在不在）/ 旧 ShareButtons の 44px 宣言（L25-26 で現存）/ ブログ記事数（`ls` 結果 60）/ Mermaid・series 入り記事の存在を Read / Bash で再確認の上、計画書末尾の実体確認リストに行数・ヒット数併記で固定した。リサーチレポート `tmp/research/2026-05-12-cycle-188-current-state.md` にも 6 箇所の訂正追記を行い、後続サイクルへの誤認伝播を防止した。

### r2 レビュー（2026-05-12）

詳細: `tmp/research/cycle-188-plan-review-r2.md`。判定 = 改善指示。Critical 2 件 + 重要 6 件 + 改善提案 4 件、計 12 件すべて反映または受容判断済み。**最重要事項は r1 反映過程で AP-WF12 / AP-P16 に 2 度目の計画立案中抵触が起きた点（C5）と、(a-1) の独立 4 案にランキングを書き込んでバイアスを再導入した点（C6）。**

| ID  | 区分     | 指摘要約                                                                                                                 | 反映箇所                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C5  | Critical | 完了基準 #10 の awk が構造的に動かない（外側パイプで NF=13、ヘッダー行が `^---` にマッチせず検査対象に入る等の複合欠陥） | r1 の awk one-liner を撤回。設計フェーズ D-B-6 の成果物として `./tmp/cycle-188/check-pm-visual-review.sh` を新規タスク化し、判定責務（行頭 \| + 第 2 列 .png のデータ行のみ対象、列 3..12 を分類別に評価、空セル / フォーマット不一致 / データ行 0 を fail）と動作検証ログ（good/bad サンプルでの exit 0 / exit 1 確認）を完了基準 #10 に明記。**r2 反映時に PM が `/mnt/data/yolo-web/tmp/cycle-188-r2-verify/check-pm-visual-review.sh` で good サンプル `exit 0` / bad サンプル `exit 1` を実証**。AP-P16 / AP-WF12 行に「r0→r1, r1→r2 で 2 度抵触」事実を追記。 |
| C6  | Critical | (a-1) 比較表で「採用第一候補 / 対抗 / 準候補」とランキングを書き込み、D-A-proto 着手前に PM 選好を固定（AP-P02 再導入）  | (a-1) 比較表からランキング表現と「採用判断」列を撤去し、評価軸を「観察観点」と書き換えて 4 案を等価並列に。案 D の「補欠」表記も撤回し 4 案すべてを D-A-proto 比較対象に。覚悟確認文を「proto 4 枚を観察するまで第一候補を持たない」へ書き換え、(a-1) 補足 / 完了基準 #15 / D-A-proto タスク説明の 3 箇所で同じ方針を明記。                                                                                                                                                                                                                                         |
| I7  | 重要     | (a-2) メタ階層化が「区切り線+余白 / 色のみ / サイズのみ」の形式 3 案構造のまま                                           | (a-2) を 4 案（A: 区切り線 + 余白 / B: 余白のみ / C: パンくずを上部固定帯に分離 / D: DOM 順入替でタイトル最大強調）に再構成。装飾バリエーションだけでなく DOM 構造的バリエーションも比較対象に含める。結論ランキング表現は撤去し、proto 観察観点として並べる形式に。                                                                                                                                                                                                                                                                                                |
| I8  | 重要     | 完了基準 #13 の grep が複数引数 CSS で取りこぼす                                                                         | 完了基準 #13 の判定 grep を `grep -nE "var\(--color-" ... \| grep -v ", var(--color-"` に変更（fallback 構文の右辺としての `--color-X` のみ許容、それ以外を裸トークン参照として検出）。**r2 反映時に PM が `/mnt/data/yolo-web/tmp/cycle-188-r2-verify/sample-css2.css` で「box-shadow 中の `var(--color-border),` が r1 grep で取りこぼされ、改善 grep で検出される」ことを実証**。                                                                                                                                                                                |
| I9  | 重要     | T7 着手前の「新版 ShareButtons import 元」全数調査が欠落                                                                 | T7 冒頭に「`grep -rn "@/components/ShareButtons" src/` で全 import 元を列挙する」手順を追加。**r2 反映時に PM が実行し、新版 ShareButtons の参照は (1) `(new)/storybook/StorybookContent.tsx` (2) test ファイル の 2 箇所のみと確認**（`@/play/quiz/_components/ShareButtons` は別物）。T7 完了条件 (iv) として Storybook ページ 1 枚の w360 light スクショ目視確認を追加。                                                                                                                                                                                         |
| I10 | 重要     | D-A-proto を生 HTML / Next.js page.tsx のどちらで作るか未明示                                                            | D-A-proto タスク本文に「**Next.js の `(new)/blog/[slug]/page.tsx` の暫定 page.tsx（branch 上）を作成し、`pkill -f "next-server" \|\| true && npm run build && npx next start` で起動した production ビルドを Playwright で撮影**」を明記。生 HTML / dev サーバーは禁止と注記し AP-I07 / `docs/knowledge/nextjs.md` §1 §8 と整合させる。                                                                                                                                                                                                                             |
| I11 | 重要     | 完了基準 #14 の「層化抽出 16 記事」の選定基準が再現不可能                                                                | 完了基準 #14 を決定論的アルゴリズムに書き換え: **「3 軸（Mermaid 有無 / コードブロック多寡（` ``` ` 8 以上）/ タイトル長 50 文字以上）× 各 2 通り = 8 セル × 各 2 件 = 16 記事」**。セル内 2 件選択は frontmatter `date` 昇順で先頭 2 件を機械採用、series 有無の確保ルールも明記。後段 builder が同じ 16 記事に到達できる手順を固定。**r2 反映時に PM が `/mnt/data/yolo-web/tmp/cycle-188-r2-verify/` で 3 軸の素材集計を実行し各セルに該当記事が複数存在することを確認**。                                                                                       |
| I12 | 重要     | D-D「最大ラウンドなし」が完了不能を招きうる                                                                              | D-D タスクを「**最大 5 ラウンド** を上限。5 ラウンド到達時に PM が (i) 重要のみ残存 → 許容案件に降格して進行、(ii) Critical 残存 → 本サイクル未完了で終了し残課題を backlog に切り出す、のいずれかを明示判断する」に書き換え。判断ログは `./tmp/cycle-188/d-d-final-decision.md` に残す。                                                                                                                                                                                                                                                                           |
| S5  | 改善提案 | T7 の波及テスト範囲未明示                                                                                                | I9 と統合して T7 冒頭に grep 手順を追加（実質 I9 と同じ反映。S5 = 対応）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| S6  | 改善提案 | B-A の取得タイミング（D-A-proto より前か後か）未明示                                                                     | before 撮影フェーズの見出しを「**D-A-proto 着手前** に取得」に変更し、B-A 説明文に「proto 比較中に旧版を参照したくなるケースに備える」「AP-WF05 着手前撮影ルールと整合」を明記（S6 = 対応）。                                                                                                                                                                                                                                                                                                                                                                       |
| S7  | 改善提案 | 観察ノート「画像ファイル名」列の命名規則未定義                                                                           | B-B 説明に「**画像ファイル名は `{slug}-{w360\|w1280}-{light\|dark}.png` に統一**」を追加。完了基準 #15 の prototype 画像命名も `{案-id}-{w360\|w1280}-{light\|dark}.png` で固定（S7 = 対応）。                                                                                                                                                                                                                                                                                                                                                                      |
| S8  | 改善提案 | V-C / 完了基準 #14 の全 60 記事撮影が技術的に可能か未検証                                                                | 完了基準 #14 に「60 サムネ + 16 フルページ = 76 撮影 を Playwright 単一ブラウザ context で sequential 実行する設計で **概ね 3〜5 分以内** に完了見込み。10 分超なら並列化検討」を追記（S8 = 対応 / 推算ベース受容）。                                                                                                                                                                                                                                                                                                                                               |

**meta 自主確認結果**: 計画書中に記載した自作スクリプト・コマンド・正規表現を全数 PM が実行した。

| 種別                                              | 動作確認方法                                                                            | 結果                                                                                          |
| ------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 完了基準 #10 判定スクリプト（D-B-6 成果物の試作） | good/bad サンプル `.md` を `/tmp/cycle-188-r2-verify/` に配置して試作版 .sh を実行      | good で `exit 0` + `OK: 2 rows passed`、bad で `exit 1` + 該当エラー出力を確認                |
| 完了基準 #13 改善 grep                            | `sample-css2.css` に複数引数 CSS を含むテストデータを作成して r1 / 改善 grep の差を実行 | r1 grep は `box-shadow` 中の `--color-border` を取りこぼす、改善 grep は検出 を実証           |
| T7 冒頭の波及調査 grep                            | `grep -rn "@/components/ShareButtons" src/` を実行                                      | 新版参照は Storybook と test の 2 ファイルのみ、`@/play/quiz/_components/ShareButtons` は別物 |
| 完了基準 #14 の素材集計（3 軸の各セル該当記事）   | タイトル長 / コードブロック数 / Mermaid / series の各 grep を順次実行                   | 3 軸の各セルに最低 2 件以上の該当記事が存在し 16 記事抽出可能                                 |

**新規発見の問題と修正**: 上記 meta 自主確認過程で「I8 の改善 grep が `var(--fg, var(--color-text))` 形式の fallback を `, var(--color-` で除外する設計だが、`var(--color-text)` のような単独・カンマ前接尾辞のないケースも `--color-` 前にカンマがないため検出される（=これは正しい挙動）」を確認。問題なし。

## キャリーオーバー

- なし（kickoff 時点）

## 補足事項

- cycle-187 の失敗を教訓とする最大のポイントは、「実装が終わったあと PM が必ず自分の目（Read で開いた 4 枚）でビジュアル品質を判定する」運用を planning 段階から完了基準に組み込むこと。
- 新デザインへの移行は「現行の旧デザインより視覚品質で劣化させない」が最低条件。劣化が疑わしい場合は cycle-187 と同様に**公開せずロールバック**を選ぶ。

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
