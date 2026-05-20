---
id: 197
description: B-386（P2、Button / Input コンポーネントの min-height 44px 対応）に着手。`Button.module.css` `.button` / `Input.module.css` `.input` に `min-height: 44px` を追加し WCAG 2.5.5 AAA に準拠させる。AP-I02 整理スコープは cycle-181 で Input 経由の `.searchInput` に個別上書きされた 3 件（Tools/Blog/Play FilterableList）のみ削除する。`src/{blog,tools,play}/_components/` の `min-height: 44px` ヒットは実効ルール 12 件（コメント行を除く）で、内訳は (i) 削除対象 = `.searchInput`×3、(ii) 独自実装で AP-I02 非該当 = `.filterButton`×3 / `.tagPill`×1 / `.tagLink`×1 / `.cheatsheetLink`×1 / `.tab`×1 / `.showMoreButton`×1 の計 8 件、(iii) Pagination 暫定残置 = `.paginationWrapper [class*="pageItem"]`×1。修正後の残存は (ii) + (iii) = 9 件。(ii) のうち `.tagLink`（BlogCard L139）は CSS コメントに「B-386 着手前の個別上書き」と記載されているため、cycle-197 整理済（Button コンポーネント非経由のため AP-I02 非該当として据え置き）の文言に書き換える 1 行コメント更新を T-4 サブタスクに含める。Pagination 上書き（BlogFilterableList L146）は B-388 着手時まで暫定残置。網羅 grep で Button 本番 0 件 / Input 本番 3 件、他の共有コンポーネント内部からの間接利用なしを確認済み。cycle-191/192/193/195 の 4 連敗から cycle-196 で脱却した流れを継ぎ、独立・低リスクで来訪者価値の高いタスク（特にモバイルでのタップ操作性）で成功を重ねる。
started_at: 2026-05-20T19:07:28+0900
completed_at: null
---

<!-- このファイルはサイクルドキュメントのテンプレートです。`<>`で囲まれた部分を適切な内容に置き換えて使用してください。内容は作業が進むごとに都度更新してください。 -->

# サイクル-197

このサイクルでは、Button / Input コンポーネントの min-height を WCAG 2.5.5 AAA 推奨の 44px に揃えることで、共有 UI コンポーネントのタップターゲット過小（WCAG 違反）を根本対処します。来訪者がモバイル端末で誤タップしにくくなる体験回復が目標です。同時に、cycle-181 で FilterableList の `.searchInput`（Input コンポーネント経由）に個別上書きされていた場当たり対処（AP-I02 抵触、3 件）を解消します。本サイクル対象外の Button/Input 非経由の独自実装は 8 件（`.filterButton`×3 / `.tagPill`×1 / `.tagLink`×1 / `.cheatsheetLink`×1 / `.tab`×1 / `.showMoreButton`×1 — いずれも独自 `<button>`/`<a>` 実装で共有コンポーネント集約余地がなく利用箇所での 44px 直接記述が適正、AP-I02 非該当）。Pagination 上書き（BlogFilterableList L146）は B-388 着手時まで暫定残置します。

## 実施する作業

- [ ] **T-0 着手前確認（一次資料の網羅再検証）**: 判断材料の前提崩れがないことを以下の手順で網羅的に確かめる（AP-WF12 / AP-P14 / AP-P16 同型対処）。
  - **(a) CSS 現状値の再読**: `src/components/Button/Button.module.css` L7-26 / L73-76、`src/components/Input/Input.module.css` L6-20 を Read で再読し、padding / font-size / line-height / min-height の現状値を T-0 実施結果欄に転記。
  - **(b) `min-height: 44px` ヒット全件の網羅 grep と分類（src 全体スコープ）**: 事前数字を所与継承せず、planner / builder 自身が grep を独立再実行して一次資料化する。手順:
    - **(b-1) src 全体での網羅 grep**: `grep -rn "min-height: 44px" src/` を実行し、ヒット全件（コメント行含む）を行番号付きで T-0 実施結果欄に転記する（事前想定件数は書かない。grep 結果が唯一の根拠）。
    - **(b-2) スコープ分類**: 各ヒットを以下のいずれかに分類する。
      - (X) 本サイクルの修正対象になりうる範囲（`src/blog/_components/` / `src/tools/_components/` / `src/play/_components/` 配下）
      - (Y) 本サイクル対象外スコープ（`src/components/common/`（Header/Footer）、`src/lib/achievements/`、`src/components/ShareButtons/`、`src/app/(legacy)/`、`__tests__/`、その他）
      - (b-1) で出た全件を (X) / (Y) のどちらかに振り分け、対象外スコープは「本サイクルでは触らない」根拠を 1 行ずつ明示する（例: Header/Footer は B-393 系列、(legacy) は (new) 移行前で本サイクルの対象外、テストは検証コード）。
    - **(b-3) 範囲内ヒット（X）の 4 分類**: (X) の各件をさらに以下 4 分類のいずれかに振る。事前想定件数は書かず、grep 結果から導く。
      - (i) `.searchInput`（Input コンポーネント経由、本サイクル T-4 で削除対象）
      - (ii) Button/Input コンポーネント非経由の独自 `<button>`/`<a>` 実装で 44px 直接記述（AP-I02 非該当、本サイクル対象外）。該当例: `.filterButton` / `.tagPill` / `.tagLink` / `.cheatsheetLink` / `.tab` / `.showMoreButton` 等。各件の要素タグ（`<a>` / `<button>`）と CSS コメントの有無を表に記録する。
      - (iii) `.paginationWrapper [class*="pageItem"]`（Pagination 経由、B-388 別タスクで本体修正されるまで暫定保持）
      - (iv) 想定外ヒット（あれば追加判断、PM に re-plan 要求）
    - **(b-4) `.tagLink`（BlogCard L139）の取り扱い特記**: 該当行の CSS コメント「44px タップターゲット確保（a11y 要件、B-386 着手前の個別上書き）」は本サイクル（B-386）着手の歯止めとして書かれた時系列依存表現。本サイクル整理線では (ii) 独自 `<a>` 実装で AP-I02 非該当と判断するため、T-4 サブタスクでコメント文言を「Button コンポーネント非経由の独自 `<a>` 実装、B-386 で再評価済 (cycle-197)、共通化される時点で再検討」に書き換える計画であることを T-0 実施結果欄に明記する。`.cheatsheetLink` / `.tab` / `.showMoreButton` のコメントは時系列依存表現を含まないため文言変更不要であることも明記。
    - **(b-5) 件数の最終集計**: (i) の件数（削除対象）/ (ii) の件数（独自実装、対象外）/ (iii) の件数（Pagination 暫定残置）を集計し、`description` / 目的セクション / T-4 / T-7 完了条件の数字と一致することを T-0 実施結果欄で照合する（齟齬があれば PM に re-plan 要求）。
  - **(c) Button / Input 利用箇所の網羅 grep（クオート種別 / 改行 import / type-only / 相対パスを含む）**: 以下のパターンを併用し、全ヒットを表形式で記録する。
    - `grep -rn "@/components/Button" src/` / `grep -rn "@/components/Input" src/`（クオート種別非依存）
    - `grep -rn "components/Button" src/` / `grep -rn "components/Input" src/`（絶対 / 相対 import 両対応）
    - `grep -rn -A 3 "from.*components/Button" src/` / 同 Input（複数行 import 対応）
    - `grep -rn "import type.*Button\|import type.*Input" src/`（type-only import）
    - ヒット全件を (legacy) / (new) / テスト / Storybook / 共有コンポーネント内部 の 5 分類で明示。
    - 「Button 本番 0 件 / Input 本番 3 件」が網羅 grep でも維持されることを実体確認。
  - **(d) 共有コンポーネント内部の間接利用ゼロ確認**: Pagination / Header / Footer / ShareButtons など主要な共有コンポーネントの index.tsx を Read で確認し、Button / Input を import していないことを個別に確認する。
  - **(e) Input className マージ実装の確認（R-CRIT-3 由来）**: `src/components/Input/index.tsx` を Read し、`className` prop と `.input` クラスのマージ方式（`.input` が unconditional に DOM に付与されるか、利用側 className と両立するか）を T-0 実施結果欄に転記する。`.searchInput` 上書き 3 件を削除した後に Input.module.css の `.input { min-height: 44px }` が `<Input className={styles.searchInput} />` に効くことが、この実装に依存することを明示する。
  - **(f) 既存テストの同型パターン確認（T-5 着手時の builder 参考）**: `src/lib/achievements/__tests__/StreakBadge.test.tsx` の `.badge has min-height: 44px` 検証ブロック（fs.readFileSync で CSS を読み正規表現で `.<class> { ... }` ブロックを抽出して文字列含有確認するパターン）を Read し、T-0 実施結果欄に「Button.test.tsx / Input.test.tsx でも同型で書く想定」と転記する。
  - **(g) `/storybook` の GA4 PV 実測（論点 1 案 b 採用根拠の visitor 価値検証）**: GA4 MCP 経由で `/storybook` の直近 30 日 PV を取得し、T-0 実施結果欄に転記する（cycle-196 で about/privacy の PV を 4/1 と実測した手順を踏襲）。**判断分岐**: PV が極小（目安: 月 10 PV 未満）であれば論点 1 案 b 採用（small 据え置き）を継続する。PV が想定外に多い（目安: 月 100 PV 超）場合は、案 d 再検討のため T-2 着手前に PM に re-plan を要求する。`/storybook` 単独 PV が取れない場合は `/storybook` を含むパス前方一致で集計し、その旨を実施結果欄に補記する。
- [ ] **T-1 修正前ビジュアル / 数値の取得（T-2 着手の前提）**: Playwright で以下ページ × {w360, w1280, w1900} × {light, dark} の組み合わせで修正前スクリーンショットを `./tmp/cycle-197-screenshots/before/` に保存。あわせて (a) `.searchInput`（Input 経由、3 ページ）、(b) `/storybook` の Button default / Button small / Input サンプル、の `getBoundingClientRect()` の width / height、`getComputedStyle(el).minHeight`、および Input 経由要素の `className` 文字列（CSS Modules ハッシュ込みで `.input` クラスが付与されていることの確認用）を JSON で `./tmp/cycle-197-measurements/before.json` に記録する。**T-2 着手の前に必ず本タスクを完了させる**（AP-WF05「着手前撮影ルール」必須順序）。
  - **視覚回帰対象ページ（変更影響を受けるページ）**:
    - `/tools`、`/blog`、`/play`（Input 経由の `.searchInput` を持つ FilterableList ページ。本サイクルの直接影響先）
    - `/storybook`（Button default / Button small / Input サンプルの直接展示。本サイクルの直接影響先）
    - `/blog/[slug]`（代表記事 1 件。`/blog/[slug]` は Input を使わないが、ShareButtons / Pagination / BlogCard 等の隣接 UI と共存する DOM の負影響確認のため。T-0(c) で `/blog/[slug]` 配下のテンプレートが Button/Input を import していないことが確認できれば、簡易撮影 1 件のみで足りる）
  - **視覚回帰対象外（撮影しない）の根拠明示**:
    - `/tools/keigo-reference` 等の個別ツールページ: 独自 `<input>` 実装（Input コンポーネント非経由）であり、本サイクルで触らないため負影響なし。なお (new) 配下には keigo-reference 等の個別ツールページは未移植（(legacy) のみ）で、本サイクルで Button/Input のスタイル変更が (legacy) に伝播することはない。
    - `/dictionary/*` や Header / Footer 経由の全ページ: Button/Input を間接利用していないことを T-0(d) で確認済みなら撮影不要。確認結果に応じて T-1 着手時点でリストを最終化する。
- [ ] **T-2 Button コンポーネント修正**: `src/components/Button/Button.module.css` の `.button` に min-height 44px を追加し、視覚高さ・行揃え（inline-flex / align-items 等）を破綻させないことを担保する。`.sizeSmall` は **据え置きで CSS コメントに「密集レイアウト限定、WCAG 2.5.5 非準拠の旨」を明記**（後述「論点 1: 案 b」採用）。Storybook の small 使用箇所（`StorybookContent.tsx` L314, L335）の見た目を T-4 で再確認するため、本タスク完了時点で `/storybook` を Playwright で 1 枚撮って `./tmp/cycle-197-screenshots/checkpoint-button/` に保存しておく。
- [ ] **T-3 Input コンポーネント修正**: `src/components/Input/Input.module.css` の `.input` に min-height 44px を追加。line-height 1.5 と対称 padding の関係で placeholder / カーソルが垂直中央に収まることを担保する（実装の具体は builder 判断）。`error` 表示時のレイアウトも崩れないことを T-4 視覚回帰で担保する。
- [ ] **T-4 AP-I02 場当たり対処の整理（searchInput 3 件削除 + tagLink コメント更新）**: T-2 / T-3 完了後、以下を実施。
  - **(a) `.searchInput` 上書き削除（3 ファイル）**: Input コンポーネント本体に min-height 44px が入ったことで不要になる以下 3 箇所の `.searchInput` 上書きを削除する（コメントごと削除する。"B-386 で本体修正済" の旨を 1 行コメントで残すかは builder 判断）。
    - `src/tools/_components/ToolsFilterableList.module.css` `.searchInput` の `min-height: 44px`
    - `src/blog/_components/BlogFilterableList.module.css` `.searchInput` の `min-height: 44px`
    - `src/play/_components/PlayFilterableList.module.css` `.searchInput` の `min-height: 44px`
  - **(b) `.tagLink` CSS コメント文言更新（BlogCard L139、1 ファイル × 1 行のコメント変更のみ）**: `src/blog/_components/BlogCard.module.css` L139 付近の `.tagLink` ブロックに付いている CSS コメント「44px タップターゲット確保（a11y 要件、B-386 着手前の個別上書き）」（または同等の "B-386 着手前" を含む文言）を、以下相当の文言に書き換える: 「Button コンポーネント非経由の独自 `<a>` 実装、B-386 で再評価済 (cycle-197)、共通化される時点で再検討」。`min-height: 44px` ルール本体は変更しない（独自実装で AP-I02 非該当のため）。
  - **本サイクルで触らないもの（T-4 対象外、各々理由を明示）**:
    - `.filterButton`（Tools/Blog/Play の 3 ファイル、各 `min-height: 44px` を直接記述）: Button コンポーネントを使わず独自 `<button>` 実装。共有コンポーネントへの集約余地が現状ないため利用箇所での 44px 直接記述は適正で、AP-I02 非該当。**本サイクル対象外**。
    - `.tagPill`（BlogFilterableList、独自 `<a>` 実装）: 同上、独自 `<a>` 要素への適正な 44px 記述で AP-I02 非該当。**本サイクル対象外**。
    - `.tagLink`（BlogCard L139、独自 `<a>` 実装）: Button コンポーネント非経由の独自 `<a>` 実装で AP-I02 非該当。`min-height: 44px` ルール本体は据え置き。**本サイクル対象外**（ただし時系列依存の CSS コメントのみ T-4(b) で更新）。
    - `.cheatsheetLink`（ToolsListView L42、独自 `<a>` 実装）: Button コンポーネント非経由の独自 `<a>` 実装で AP-I02 非該当。CSS コメントは時系列依存表現を含まないため変更不要。**本サイクル対象外**。
    - `.tab`（PlayContentTabs L197、独自 `<button>` 実装）: Button コンポーネント非経由の独自 `<button>` 実装で AP-I02 非該当。CSS コメント「WCAG 2.5.5 タップターゲットを確保」は時系列依存表現を含まないため変更不要。**本サイクル対象外**。
    - `.showMoreButton`（PlayContentTabs L288、独自 `<button>` 実装）: Button コンポーネント非経由の独自 `<button>` 実装で AP-I02 非該当。CSS コメントは時系列依存表現を含まないため変更不要。**本サイクル対象外**。
    - `BlogFilterableList.module.css` `.paginationWrapper [class*="pageItem"]`（L146 想定）: Pagination 本体（B-388）が修正されるまでの暫定残置。本サイクルでは削除しない（論点 2 案 a 採用、後述「歯止め策」参照）。
- [ ] **T-5 テスト追加**: `src/components/Button/__tests__/Button.test.tsx` と `src/components/Input/__tests__/Input.test.tsx` に以下のアサーションを追加する。
  - (i) `.button` / `.input` ブロックに `min-height: 44px` が含まれること
  - (ii) `.sizeSmall` ブロックに `min-height: 44px` が **含まれない** こと（small 据え置きの担保）
  - (iii) Input コンポーネントが props.className と無関係に `.input` クラスを常に DOM に付与すること（既存 render テストで `expect(input.className).toMatch(/input/)` 等で確認、または index.tsx の className マージ仕様の回帰防止として書く）
  - **書き方の方針**: jsdom は CSS の計算値（`getComputedStyle.minHeight`）を返さないため、CSS の文字列含有を fs.readFileSync で確認する既存パターンを推奨する。具体的には `src/lib/achievements/__tests__/StreakBadge.test.tsx` L88-92 の「`.<class> { ... }` ブロックを正規表現で抽出して `expect(block).toContain("min-height: 44px")`」を流用する。同型パターンは `src/components/common/__tests__/Header.test.tsx` L108-113、`src/components/ShareButtons/__tests__/ShareButtons.test.tsx` L149 にもある。実機の Playwright 検証は T-7 で別途行うため、jsdom テストは「CSS ファイルに 44px が存在する」「Input が `.input` クラスを付与する」レベルで足りる。
- [ ] **T-6 修正後ビジュアル / 数値の取得**: T-1 と同じページ × ビューポート × モードの組み合わせを `./tmp/cycle-197-screenshots/after/` に再撮影（T-1 で確定したリストと同一）。Button / Input / `.searchInput` の `getBoundingClientRect().height`、`getComputedStyle.minHeight`、および `className` 文字列を `./tmp/cycle-197-measurements/after.json` に記録。修正前との数値ペアが揃っていることを確認する。
- [ ] **T-7 完了条件の数値検証 / 視覚回帰確認**: 以下を Playwright `evaluate` で実機検証する。
  - (i) Button default の実機 height が 44px ぴったり（tolerance ±0.5px）かつ `getComputedStyle(el).minHeight === "44px"`。
  - (ii) Input default の実機 height が 44px ぴったり（tolerance ±0.5px）かつ `getComputedStyle(el).minHeight === "44px"`。
  - (iii) `.searchInput`（3 ページの検索欄）の実機 height が 44px ぴったり（tolerance ±0.5px）かつ `getComputedStyle(el).minHeight === "44px"`、かつ `el.className` に Input.module.css の `.input` ハッシュ込みクラス（例: `input_xxx`）が含まれている（R-CRIT-3 由来: Input className マージが想定通りに動いている検証）。
  - (iv) Button small は据え置き値（実機 height ≒26.4px、min-height 未設定）で視覚破綻なし。
  - (v) T-1 / T-6 のスクリーンショットペアで text overflow / placeholder ずれ / 行揃え / 検索フィルタ UI のレイアウト破綻なし。
  - **検出力の理由（R-MINOR-3 反映）**: `height ≥ 44px` ではなく `height === 44px ± 0.5px` で比較するのは、Button default は line-height + padding + border の和が 36.8px で min-height 44px が「持ち上げ」効果を発揮するため、Input default は line-height 1.5 × font-size 14px + padding 9×2 = 39px で同じく持ち上がるため、いずれも 44px ぴったりになる前提を回帰検出力として活用する目的。プラス余分があれば padding / line-height のどこかが想定外という発見になる。
  - **AP-I02 削除確認**: `grep -rn "min-height: 44px" src/{blog,tools,play}/_components/` を再実行し、`.searchInput` 上書き 3 件が消滅、Blog Pagination 上書き（L146）と `.filterButton`×3 / `.tagPill`×1 / `.tagLink`×1 / `.cheatsheetLink`×1 / `.tab`×1 / `.showMoreButton`×1 の 8 件 + Pagination 1 件 = 計 9 件が意図通り残ることを確認（T-0(b) の(b-5) で照合した件数と一致すること）。あわせて `.tagLink` の CSS コメントが T-4(b) で更新されている（「B-386 着手前」表現が消えている）ことを `grep -n "B-386 着手前" src/` で 0 件確認する。
- [ ] **T-8 自動チェック実行**: `npm run lint && npm run format:check && npm run test && npm run build` をすべて成功させる。
- [ ] **T-9 backlog / cycle ドキュメント更新**: B-386 を Active から Done に移動。スコープ外として送る B-388 / B-393 / ツール独自 button-input の現状を Notes として記録（必要なら新規 B-XXX を起票）。本サイクルドキュメントのチェックリストを完了状態に更新する。

## 作業計画

### 目的

**誰のために**: モバイル端末で yolos.net の検索フィルタ（`/tools` / `/blog` / `/play` の `.searchInput`）を操作しているすべての来訪者。特にターゲット定義の「特定の作業に使えるツールをさっと探している人」「気に入った道具を繰り返し使っている人」のうち、モバイル経由のセグメント。指の腹で正確にタップするには 44 × 44 CSS px が業界標準（Apple HIG / Material Design / Fluent / WCAG 2.5.5 AAA）。

**何の価値を提供するのか**: 検索入力欄を確実にタップでき、誤タップで意図しない要素にフォーカスが奪われたり、入力欄が小さくて再タップを強いられるストレスを解消する。間接的には、将来 Button コンポーネントを本番 UI で採用する箇所が増えたときに自動で 44px が保証され、後追いの場当たり対処（AP-I02 抵触）を再生産しない予防にもなる。

**サイクルゴール**: Button / Input コンポーネントの `.button` / `.input` に `min-height: 44px` を本体実装として組み込み、cycle-181 で 3 ファイル（`.searchInput`）に貼られた個別上書きの場当たり対処（AP-I02 抵触）を削除する。検証は実機計測（Playwright `getBoundingClientRect` + `getComputedStyle`）で行う。スコープは Button / Input 本体 2 ファイル + AP-I02 削除 3 ファイル + テスト 2 ファイル。

**AP-I02 該当件数の整理（R-CRIT-1 / R-CRIT-A 由来の明文化）**: `min-height: 44px` の grep ヒットは `src/{blog,tools,play}/_components/` 配下で実効ルール **12 件**（コメント行を除く）。内訳:

- (i) **`.searchInput`×3**（Tools/Blog/Play FilterableList、Input コンポーネント経由）→ 本サイクル T-4(a) で削除
- (ii) **独自 `<button>`/`<a>` 実装で 44px 直接記述、AP-I02 非該当 = 8 件**:
  - `.filterButton`×3（Tools/Blog/Play FilterableList、独自 `<button>`）
  - `.tagPill`×1（BlogFilterableList、独自 `<a>`）
  - `.tagLink`×1（BlogCard L139、独自 `<a>`。CSS コメント「B-386 着手前の個別上書き」は時系列依存表現で、T-4(b) で文言更新する）
  - `.cheatsheetLink`×1（ToolsListView L42、独自 `<a>`）
  - `.tab`×1（PlayContentTabs L197、独自 `<button>`）
  - `.showMoreButton`×1（PlayContentTabs L288、独自 `<button>`）
- (iii) **`.paginationWrapper [class*="pageItem"]`×1**（BlogFilterableList L146、Pagination 経由）→ B-388 着手まで暫定保持

AP-I02 該当（共有コンポーネント本体に集約可能な利用箇所での上書き）は **Input 経由 3 件 + Pagination 経由 1 件 = 4 件**。本サイクルで解消するのは Input 経由 3 件のみ。Pagination 経由 1 件は B-388 着手まで暫定保持。(ii) の 8 件は Button/Input コンポーネント非経由の独自実装で AP-I02 非該当（共有コンポーネントへの集約先がないため、利用箇所での 44px 直接記述が適正な実装）— 将来 Button コンポーネントが本番採用されるタイミング（design-migration-plan.md の Phase 11 など）で改めて統合余地が判断される性質。

なお `src/` 全体では Header / Footer / `lib/achievements/StreakBadge` / ShareButtons / (legacy)/page.module.css 等にも `min-height: 44px` ヒットが多数あるが、これらは別 backlog（B-393 等）または対象外スコープであり本サイクルでは触らない（T-0(b-2) で明示分類する）。

### 作業内容

**タスク順序**: T-0 → T-1 → T-2 → T-3 → T-4 → T-5 → T-6 → T-7 → T-8 → T-9 の直列。特に **T-1（修正前撮影 + 数値記録）は T-2 / T-3（修正実施）の前に必ず完了させる**（AP-WF05「着手前撮影ルール」必須順序）。T-2 と T-3 は同一エージェントが直列で実施する（同一サイクル内の関連変更を分担割しない）。

**完了条件**:

- Button default の実機 height が 44px ぴったり（±0.5px）かつ `getComputedStyle.minHeight === "44px"` が Playwright 実機で両方確認できる。
- Input default の実機 height が 44px ぴったり（±0.5px）かつ `getComputedStyle.minHeight === "44px"` が Playwright 実機で両方確認できる。
- `.searchInput`（3 ページの検索欄）の実機 height が 44px ぴったり（±0.5px）、`getComputedStyle.minHeight === "44px"`、かつ `el.className` に Input.module.css 由来の `.input` ハッシュ込みクラスが含まれている（className マージが想定通り動いている検証）。
- Button small は据え置き（実機 height ≒26.4px、min-height 未設定 + コメントで非準拠の旨明記）で視覚破綻なし。
- `grep -rn "min-height: 44px" src/{blog,tools,play}/_components/` を再実行し、`.searchInput` 上書き 3 件が消滅、それ以外（`.filterButton`×3 / `.tagPill`×1 / `.tagLink`×1 / `.cheatsheetLink`×1 / `.tab`×1 / `.showMoreButton`×1 / Pagination 上書き×1 = 計 9 件）は意図通り残存していること。
- `.tagLink`（BlogCard L139）の CSS コメントが T-4(b) で「B-386 着手前」表現を含まない文言に更新され、`grep -n "B-386 着手前" src/` が 0 件になること。
- T-1 と T-6 の修正前後スクリーンショットペア全枚で text overflow / placeholder ずれ / 行揃え破綻なし。
- Button.test.tsx / Input.test.tsx に min-height 44px アサーション、small 据え置きアサーション、Input `.input` クラス常時付与アサーションが追加されている。
- `npm run lint && npm run format:check && npm run test && npm run build` が全件成功。
- backlog の B-386 が Active から外れ Done に移動。

**注意点 / やらないこと**:

- **B-388（Pagination 本体 44px）/ B-393（Header `.searchButton` / ThemeToggle 44px）は本サイクルでは触らない**（論点 2 案 a 採用）。Tools/Blog/Play の `.filterButton`×3 / `.tagPill`×1 も本サイクル対象外（Button コンポーネント非経由の独自実装で AP-I02 非該当）。各個別ツール（`src/tools/*/Component.tsx` の独自 `<button>`/`<input>`）も本サイクル対象外（論点 4 案 a 採用）。
- ハードコード 44px とする（論点 3 案 b 採用、`--min-touch` トークン化はしない）。
- Storybook の small バリアントは見た目を変更しない（論点 1 案 b 採用）。
- 本番 Button 呼び出しは網羅 grep で 0 件、Input 呼び出しは FilterableList 3 件のみ（他の共有コンポーネント内部からの間接利用なし）であるため、(legacy) 視覚への影響評価は不要。視覚回帰対象は T-1 のリスト参照。
- Button / Input の Props 拡張（`size` の 3 段階化など）は本サイクルでは行わない。本サイクルは「既存 default に 44px を入れる」のみ。
- **T-0(e) で Input className マージ仕様が「`.input` 常時付与 + props.className との concat」と確認できなかった場合（想定外実装）は、T-3/T-4 着手前に PM に re-plan を要求すること**。`.searchInput` 上書き削除で 44px が割れる事故を防ぐ歯止め。

### 検討した他の選択肢と判断理由

AP-P17 に従い、4 つの論点それぞれで 3 案以上を並べた。

#### 論点 1: small バリアントへの 44px 適用

| 案                                                                        | 内容                                                                                                          | 採否     | 理由                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a: small にも min-height 44px を強制                                      | `.sizeSmall` にも `min-height: 44px` を設定                                                                   | 不採用   | small バリアントの存在意義（密集レイアウト用の縮小プリセット）が消失する。Storybook 展示で「default と small の差異」を見せている現状の文書性も損なわれる。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **b: small は据え置きで CSS コメントに非準拠の旨を明記（採用）**          | `.sizeSmall` は現状（実高さ約 26.4px）のまま、CSS コメントに「密集レイアウト限定、WCAG 2.5.5 非準拠」と明文化 | **採用** | **visitor 価値 vs 実装コストのトレードオフ判断**: (i) Carbon / Chakra UI など主要デザインシステムが「small は WCAG 非準拠のまま据え置く」設計を取っており業界定石に一致、(ii) Button small の本番採用箇所は網羅 grep で 0 件（Storybook 展示 2 件のみ）で、本番来訪者への影響は現時点で皆無、(iii) `/storybook` のページビューは T-0(g) で GA4 直近 30 日 PV を確認し、影響規模を実測する（cycle-196 で about/privacy の PV を 4/1 と実測した手順を踏襲。来訪者影響が visitor 価値判断軸で極小と確認できる前提）、(iv) `.sizeSmall` の CSS コメントに「WCAG 2.5.5 非準拠、密集レイアウト限定、本番採用時に再評価」を明記することで、将来 small が本番採用される際の歯止めが構造的に利く、(v) 案 d を取った場合の `.sizeSmall` 再設計コスト（後述）を上回る visitor 価値が現時点では確認できない。                                                                                                                                                                                                                                                                                                                                                        |
| c: small を削除                                                           | `.sizeSmall` クラス + `size="small"` Prop を削除し、Storybook の使用も外す                                    | 不採用   | 本サイクルの目的（44px 化）から逸脱する破壊的変更。Storybook はデザインシステムの展示物で「縮小版がある」ことの提示自体に意味がある。将来の本番採用余地も残しておく方が good。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| d: default は 44px、small は font-size 12px のまま min-height 44px を維持 | `.sizeSmall` を「default 派生（44px 維持で font-size のみ 12px / padding 縮小）」に変える                     | 不採用   | **visitor 価値 vs 実装コストのトレードオフで案 b に劣る**: visitor 価値は「Storybook 来訪者が small バリアントに触れた際の誤タップ防止」で、これ自体は 0 ではない。一方で実装コストは `.sizeSmall` の再設計（min-height 44px を維持しつつ視覚的縮小を font-size と padding のみで表現する CSS 調整 + Storybook 表示が「small に見える」ことの目視確認 + 視覚回帰テストの追加）で案 b より明確に増える。**現時点での visitor 価値が小さい根拠**: (i) `/storybook` の GA4 PV を T-0(g) で実測し（cycle-196 同手順）、ほぼ無流入であれば誤タップを救済する来訪者数が極小、(ii) Button small は本番採用 0 件で記事的閲覧物として展示されているのみ、(iii) 案 d を取ると `.sizeSmall` の視覚的差別化（font-size 12px と縮小 padding のみで diff を出す）が不十分になり Storybook の文書性が下がる（default と small の視覚差異がほぼ消える）— Storybook の主目的が「default と small の差異を見せる文書性」である以上、これは Storybook 利用者にとっての価値低下。**歯止め**: T-0(g) で `/storybook` PV が想定外に多い（例: 月 100 PV 超）ことが確認された場合は案 d を再検討する旨を本計画書に明記する（本サイクル kickoff 時の visitor 価値判断軸の更新）。 |

#### 論点 2: B-388（Pagination 本体修正）の同時実施

| 案                                                            | 内容                                                                                                          | 採否     | 理由                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **a: B-386 のみ、Pagination 上書きは保持（採用）**            | Pagination 本体は触らず、Blog の `[class*="pageItem"]` 上書き（L146）も保持                                   | **採用** | 本サイクルは「cycle-196 で取り戻した成功体験を継続するための独立・低リスクタスク」が選定動機。スコープを Button/Input 共有コンポーネントに限定することで失敗確率を最小化できる。Pagination 本体は独自 `<button>`/`<Link>` 実装で Button コンポーネント非経由のため、本タスクで一緒に直しても整合性メリットが薄い（共有化されていない）。**歯止め策（AP-WF15 同型対処）**: (i) BlogFilterableList L146 上書きが「本サイクルで残存する暫定対応」であることを description / 補足事項に明示、(ii) 解消責任は B-388（backlog 起票済み、P3）に紐付き、次サイクル kickoff で B-388 着手優先度を再評価する、(iii) 暫定対応が残ることによる来訪者影響は実害なし（Blog Pagination は 44px で動作中、Tools/Play は元から 36px のままで本サイクル変更による劣化はない）。 |
| b: B-388 も同時吸収して Pagination 本体修正 + Blog 上書き削除 | Pagination.module.css の `.pageItem` に `min-height: 44px` 追加し、Blog の `[class*="pageItem"]` 上書きを削除 | 不採用   | (i) cycle-196 のスコープ拡張（404 同型修正吸収）は「同じ正準パターンへの統合」だったが、Pagination は別系統のコンポーネントで「同じ修正を別ファイルに適用する」性質が異なる、(ii) スコープが Button/Input + Pagination の 3 コンポーネントに膨らみ、視覚回帰の検証ページも増える、(iii) 連敗から脱却した直後のリスク管理として最小スコープを取る。                                                                                                                                                                                                                                                                                                                                                                                                            |
| c: Blog 上書きだけは触らず Pagination 本体だけ直す            | Pagination.module.css に 44px 追加、Blog 上書きは残す                                                         | 不採用   | 上書きが二重になり AP-I02 が中途半端に残り続ける。整合的な解決にならない。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

#### 論点 3: デザイントークン化

| 案                                                 | 内容                                                                                              | 採否     | 理由                                                                                                                                                                                                                                                                      |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a: `--min-touch: 44px` トークン化                  | `src/app/globals.css` に新規 CSS 変数を定義し、Button / Input から参照                            | 不採用   | 利用箇所が 2 コンポーネントのみで、トークン化のメリット（複数箇所一括変更）が現状では発揮されない。overengineering 寄り。将来 48px に上げる際の変更箇所も 2 ファイルなら直接書き換えで十分。                                                                              |
| **b: ハードコード 44px（採用）**                   | Button.module.css と Input.module.css に `min-height: 44px` を直接記述                            | **採用** | cycle-196 の `max-width: 1200px` ハードコード採用と方針一貫。利用範囲がコンポーネント本体に閉じているのでハードコードでも保守性に問題なし。`docs/design-migration-plan.md` の L280 系のような「(new) で var(...) 禁止」と同じ精神に揃う（トークン化への漸進は時期尚早）。 |
| c: design-migration-plan.md にハードコード値を明記 | a / b の中間。ハードコードする値を `docs/design-migration-plan.md` の正準値表に追加して参照基準化 | 不採用   | 設計ドキュメントの責務範囲を膨張させる。Button / Input の 44px は WCAG 2.5.5 推奨という外部一次資料が直接の根拠になるため、design-migration-plan.md 経由で間接化する必要がない。                                                                                          |

#### 論点 4: 全ツールの独自 `<button>` / `<input>` の扱い

| 案                                                                               | 内容                                                                                         | 採否     | 理由                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **a: 本サイクルは共有コンポーネントのみ、ツール各箇所は別 backlog 起票（採用）** | `src/tools/*/Component.tsx` 34 件は触らない。新規 B-XXX として起票し優先度判断は後続サイクル | **採用** | (i) 34 件は各ツール固有 UI で 1 ファイル 1 ファイル個別 UX 判断が要る（ボタン形状・密度・色制約）、(ii) cycle-196 で「タスクを小さく」を再確認した直後で、スコープ膨張は失敗リスクを高める、(iii) WCAG 観点では本番 0 件の Button より、本番現役の 34 ツールの方が来訪者影響大 — だからこそ単独サイクルで丁寧に扱う価値がある。 |
| b: 最も来訪者使用頻度が高い数件のツールから修正                                  | GA4 で上位 3〜5 ツールを抽出し、本サイクルで併せて 44px 化                                   | 不採用   | 抽出と各ツールの個別 UX 判断（CSS 上書き量・カラーバリアント・周辺レイアウト）でスコープが読みにくく、cycle-196 の「独立・低リスク」線から外れる。                                                                                                                                                                              |
| c: 全 34 ツール一括修正                                                          | 全件まとめて修正                                                                             | 不採用   | スコープが巨大で、cycle-196 直後の成功継続線に乗らない。失敗時の影響範囲も大きい。                                                                                                                                                                                                                                              |

### 計画にあたって参考にした情報

- `docs/backlog.md` L7（B-386 エントリ）/ L17（B-388）/ L65（B-393）
- `docs/cycles/cycle-196.md` 補足事項 L154（「一度成功体験を取り戻してから立て直す」方針継承元）
- `docs/cycles/cycle-181.md`（場当たり対処 `.searchInput` 44px 上書きの起源、AP-I02 抵触の文脈）
- `docs/design-migration-plan.md`（(new) のハードコード方針との整合確認）
- `docs/anti-patterns/planning.md`（AP-P01 一次資料の実測 / AP-P07 来訪者起点 / AP-P14 grep スコープ / AP-P16 過去判定の所与継承 / AP-P17 複数案比較 / AP-P20 過度に具体化しない）
- `docs/anti-patterns/implementation.md`（AP-I02 場当たり的回避の解消）
- `docs/anti-patterns/workflow.md`（AP-WF05 修正前撮影 / AP-WF07 1 エージェント 1 タスク / AP-WF12 一次資料確認の網羅）
- `docs/targets/特定の作業に使えるツールをさっと探している人.yaml` / `docs/targets/気に入った道具を繰り返し使っている人.yaml`（来訪者文脈、特にモバイル）
- `docs/constitution.md`（来訪者価値最大化の原則）
- `./tmp/research/`（PM が code-researcher 経由で取得した Button / Input / Pagination 現状、`min-height: 44px` ヒット件数の分類実測、Button/Input 本番呼び出しゼロ + 3 件の実測。なお当初 PM が共有した「8 件」は `src/{blog,tools,play}/_components/` 配下の `.filterButton`×3 / `.tagPill`×1 / `.searchInput`×3 / Pagination 1 件の限定集計であり、`.tagLink` / `.cheatsheetLink` / `.tab` / `.showMoreButton` の 4 件が抜けていた。本計画書では cycle-197 R2 レビュー指摘を受け実効ルール 12 件の網羅集計に修正している。）
- `./docs/research/`（PM が web-researcher 経由で取得した WCAG 2.5.5 AAA / 2.5.8 AA、Apple HIG 44pt / Material 48dp / Fluent 44-48px、Carbon / Chakra の small バリアント扱い）
- 一次資料の直接 Read 確認: `src/components/Button/Button.module.css` L7-26 / L73-76、`src/components/Input/Input.module.css` L6-20、`src/components/Button/index.tsx`、`src/components/Input/index.tsx`（className マージは `[styles.input, error && styles.error, className].filter(Boolean).join(" ")` で `.input` を常時付与する実装と確認済）、`src/app/(new)/storybook/StorybookContent.tsx`（small 使用 2 件）、`grep -rn "min-height: 44px" src/{blog,tools,play}/_components/`（ヒット実効ルール 12 件：searchInput×3 / filterButton×3 / tagPill×1 / tagLink×1 / cheatsheetLink×1 / tab×1 / showMoreButton×1 / Pagination 上書き×1。AP-I02 該当は searchInput×3 + Pagination×1 = 4 件、本サイクル解消は searchInput×3 のみ）、`grep -rn "@/components/Button" src/` / `grep -rn "@/components/Input" src/`（本番呼び出し: Button 0 件 / Input 3 件）、`src/lib/achievements/__tests__/StreakBadge.test.tsx` L88-99（T-5 テスト書式の同型パターン）。

## レビュー結果

### 計画フェーズ

3 ラウンドで Pass。

- **r1** (`tmp/cycle-197-plan-review-r1.md`): R-CRIT 3 件（AP-I02 該当件数の食い違い 4 vs 8 件 / grep カバレッジ限定 / Input className マージ未検証）、R-MAJOR 4 件（Storybook 来訪者価値起点 / Pagination 保持の歯止め / T-5 テスト方針丸投げ / 視覚回帰対象ページ）、R-MINOR 3 件で合計 10 件。planner で全件解消。
- **r2** (`tmp/cycle-197-plan-review-r2.md`): R-CRIT-A 1 件（独立 grep で 14 件ヒットのうち `.tagLink` / `.cheatsheetLink` / `.tab` × 2 / `.showMoreButton` の 4 件欠落、`.tagLink` には CSS コメントで「B-386 着手前の個別上書き」と明示）、R-MAJOR-B 1 件（論点 1 案 d 却下根拠が R-MAJOR-1 で否定済の論理を再利用）、R-MINOR-C 1 件（npm run check 統合スクリプト確認）。planner で全件解消（src 全体スコープでの網羅 grep に切替、`.tagLink` の CSS コメント更新を T-4(b) に組み込み、論点 1 案 d 却下根拠を visitor 価値 vs 実装コストのトレードオフ判断に書き直し、T-0(g) で `/storybook` GA4 PV 実測を歯止めに追加。R-MINOR-C は PM が package.json を確認し統合スクリプトなしで現状維持）。
- **r3** (`tmp/cycle-197-plan-review-r3.md`): R1 / R2 全 13 件の解消確認 + reviewer 独立 grep（src/{blog,tools,play}/\_components/ で実効ルール 12 件 + コメント 2 件 = 14 行、計画書記述と一致）+ BlogCard L138 CSS コメント原文の実体確認 + 全 AP 点検 + 四者整合性 + 規模感 + 検出力すべてで **Pass**。新規指摘ゼロ。

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

## 補足事項

### cycle-197 kickoff 時の判断記録

- **B-386 選定理由**: cycle-196 で 4 連敗（cycle-191/192/193/195、Phase 7 タイル基盤）から脱却した直後で、いきなり B-426（タイル基盤再起票）に再挑戦するのはリスクが高い。cycle-196 の判断記録 L154「一度成功体験を取り戻してから立て直すほうが、4 連敗からの脱却としては筋がいい」を継承し、独立・低リスクで来訪者価値の高い P2 タスクで成功を継続する路線を取る。B-386 は (i) 全サイト規模の WCAG 2.5.8 違反で長期放置されていた構造的負債、(ii) cycle-181 の場当たり対処（AP-I02 抵触）の根本解消にもなる、(iii) 影響範囲が CSS の min-height 追加中心で cycle-196 と同じく独立・低リスクのパターン、という 3 点で選定。
- **B-388（Pagination 44px）/ B-393（Header actions slot 44px）の同時実施は cycle-planning で判断**: B-386 の Notes には「B-388 と一括で実施しても良い」とあり、B-393 の Notes には「同型課題の B-386 / B-388 と同時実施可」とある。タスクを最小化する CLAUDE.md ルールと、同型課題を一塊で扱う効率性のトレードオフは cycle-planning で具体化する。

### Pagination 上書き暫定残置の歯止め策（R-MAJOR-2 反映）

- `BlogFilterableList.module.css` の `.paginationWrapper [class*="pageItem"]` 上書き（L146 想定）は、cycle-181 で blog のみ応急処置として 44px に上書きされた経緯がある。本サイクルでは Pagination 本体（B-388）に手を入れないため、この上書きは **本サイクル完了時点で意図的に残存** する。
- **解消責任の所在**: B-388（backlog 起票済み、P3）。Pagination.module.css の `.pageItem` に min-height 44px 以上を直接設定する作業（CSS 1 行追加）と、Tools/Play 側で同じ上書きを必要に応じて整理する作業。
- **再評価タイミング**: 次サイクル kickoff で B-388 着手優先度を再評価する（GA4 で Blog/Tools/Play のページネーション利用率を見て判断する。Pagination が頻繁にタップされるなら優先度を P2 に引き上げる）。
- **来訪者影響**: 実害なし。Blog の Pagination は cycle-181 以来 44px で動作中。Tools/Play の Pagination は元から 36px のまま（B-388 着手まで非準拠状態が続く）で、本サイクルの変更による劣化はない。

### description / 表記の整合（R-MINOR-1 / R-MINOR-2 反映）

- description は単一行（既存サイクルの体裁踏襲）だが、AP-I02 該当件数の整理（4 件のうち本サイクル解消は 3 件）/ Pagination 暫定残置 / Button 本番 0 件 + Input 本番 3 件の前提を芯として読めるよう、構造化要素（「AP-I02 整理スコープは…」「Pagination 上書きは…」等）の語順で書いた。
- 本文中のサイクル参照は「cycle-NNN」表記に統一（範囲を表す「cycle-191/192/193/195」は連続列挙の慣例として維持）。

### `min-height: 44px` 網羅 grep の再発防止（R-CRIT-A 反映、AP-WF12 / AP-P14 / AP-P16 同型対処）

- R1 → R2 で「grep 結果の独立再検証不足」が R-CRIT-1 / R-CRIT-A と同型で反復したため、本計画書では T-0(b) の grep 工程を以下のように構造化した:
  - **(b-1) 事前数字を所与継承しない**: 「想定 N 件」のような事前数字は計画書のどこにも書かず、planner / builder 自身が `grep -rn "min-height: 44px" src/` を独立再実行し、その結果を唯一の一次資料とする。
  - **(b-2) スコープを src 全体に取る**: `src/{blog,tools,play}/_components/` だけに限定すると、`BlogCard.module.css` の `.tagLink`（\_components/ 配下だが既に R-CRIT-A で抜けていた）や Header / Footer / lib/achievements 等の対象外ヒットの位置関係を見落とすため、最初に src 全体を網羅したうえで対象 / 対象外を明示分類する。
  - **(b-5) description / 目的 / T-4 / T-7 の数字との照合**: grep 結果の集計値と計画書本文の数字（削除 3、独自実装 8、Pagination 1、合計 12）の一致を T-0 実施結果欄で照合し、齟齬があれば PM に re-plan を要求する。これにより数字の所与継承を構造的に防ぐ。
- 本歯止めは AP-WF12（grep 結果の独立検証）/ AP-P14（調査範囲の恣意的限定）/ AP-P16（過去判定の所与継承）に対応する。同型再発が次サイクル以降に起きた場合は、`docs/anti-patterns/planning.md` の関連項目を強化するか新規 AP の起票を検討する。

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
