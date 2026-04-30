---
id: 171
description: "B-308（デザインガイドラインとUIコンポーネント集の策定）を Owner 主導で再々挑戦する。cycle-169・cycle-170 ともに失敗サイクルとしてクローズされたため、過去の失敗を踏まえつつ Owner と相談しながら進める。本サイクルの範囲は (1) `/frontend-design` Skill の確認と必要に応じた改善、(2) `DESIGN.md` の確認と必要に応じた改善、(3) 必要となる共通コンポーネント群の作成、(4) 既存サイトへのデザイン移行計画の策定。"
started_at: "2026-04-28T15:44:33+0900"
completed_at: "2026-04-30T17:22:39+0900"
---

# サイクル-171

このサイクルでは B-308「デザインガイドラインとUIコンポーネント集の策定」を Owner 主導で再々挑戦する。cycle-169 と cycle-170 はいずれも失敗サイクルとしてクローズされた。同じ轍を踏まないよう、本サイクルは Owner との対話を密に取りながら進める。

## このサイクルで作るもの

Owner からの指示（`/cycle-kickoff` 起動時の引数より）:

- `/frontend-design` スキルの確認と必要であれば改善
- `DESIGN.md` の確認と必要であれば改善
- 必要となるコンポーネント群の作成
- デザイン移行計画の策定

なお本サイクルは設計と素材の整備、および移行計画の策定までで、既存サイトへのデザイン適用作業（実際の置き換え）は次サイクル以降で行う想定。

## 実施する作業

- [x] **T1**: `/frontend-design` SKILL.md と `DESIGN.md` の確認・小修正
  - [x] DESIGN.md §2 末尾の「すべての色には『強い』バージョンと『柔らかい』バージョン」を、実態（アクセントとステータスのみ）に合わせて修正する
  - [x] DESIGN.md §5「コンポーネント」に、原則としてチェックボックスではなくトグルスイッチを使う旨を追記する（reviewer 指摘を反映し主語を「ON/OFF を切り替えるフォーム要素」に絞り、例外も明記）
  - [x] DESIGN.md §2 末尾に「角丸」「影 / エレベーション」サブセクションを追加し、`--r-normal`/`--r-interactive`/`--shadow-button`/`--shadow-dragging` を明記（SKILL.md・globals.css と整合）
  - [x] Owner 追加指示により `--border-strong` を 3 ファイル（globals.css / SKILL.md / DESIGN.md）から完全削除
  - （DESIGN.md §5 への「用意されているコンポーネント一覧」の追記は本サイクルでは行わない。二重管理を避け、見落とされやすいコンポーネントが分かってきたタイミングで将来的に追記する）
- [x] **T2**: `src/app/globals.css` の修正
  - [x] 誤記 `:root html` を `@layer base` で囲む形に置き換える
  - [x] ダークモード対応のトークンを追加する。`next-themes`（`attribute="class"` 方式・`:root.dark`）と整合
  - [x] ダーク値の並び（最終形は T4 で「panel(明) > body(中) > hover(暗)」、ホバー連鎖は両モードで「暗くなる」方向に統一、SKILL.md L19 と整合）
  - （T2 で採用した「panel が body より暗い『沈む』関係」は Owner の実機検証で視認性が致命的と判明したため T4 で撤回。コミット: 83d161f1）
  - [x] DESIGN.md §2 に `-soft` 背景時のボーダーは同系統の `-strong` を使う旨を注記（Owner 追加指示）
  - [x] **old-globals.css と new globals.css の競合解消**: 両ファイルに `@layer legacy, base;` を宣言し、それぞれを `@layer legacy { ... }` / `@layer base { ... }` で囲む（base が後勝ち）
  - [x] **new ページに必要なベースを new globals.css に移植**: グローバルリセット、`dialog`、`html, body` のオーバーフロー対策、`body` フォント、`.visually-hidden`、`.markdown-alert*` Admonition 一式を移植（移行期間中は二重化、cycle-172 以降の移行完了で old-globals.css ごと消える設計）
  - [x] Admonition 用トークンを追加。note/tip/warning/caution は既存トークンのエイリアス、important のみ紫系を新規定義
  - [x] テストへの影響なし（既存 4004 テスト全 pass、build pass）
- [x] **T3**: 移行後の新コンポーネント群を `src/components/` 直下に作成
  - [x] Article コンポーネントの要否検討 → **作らない**判断（Owner 承認、cycle-172 のブログ記事移行時に必要性を再評価）
  - [x] **Panel**: 矩形コンテナの汎用ラッパー（`as` ジェネリクス、テストなし＝ロジックなしのため）
  - [x] **Button**: 2 バリアント（primary / default）+ size（default / small）+ disabled。テスト 11 件。T4 で旧 ghost を新 default に統合・旧 default を廃止
  - [x] **Input**: type 7 種、controlled/uncontrolled 両対応、error 時に `aria-invalid`、`--border-strong` で輪郭強調。テスト 11 件
  - [x] **Header**: ロゴ・固定ナビ（4 項目）・actions スロット・モバイル時ハンバーガーメニュー。テスト 8 件
  - [x] **Footer**: 4 カラム式サイトマップ + AI 運営注記 + GitHub 外部リンク。内部固定（props なし）。テスト 2 件（AI 注記・ブログカテゴリ整合）
  - [x] **Breadcrumb**: `<nav><ol><li>` 構造、aria-current、aria-hidden の区切り（`/`）。テスト 7 件
  - [x] **ToggleSwitch**: `<input type="checkbox" role="switch">` ベース・CSS のみで状態切替・controlled/uncontrolled 両対応。テスト 6 件
  - [x] **ThemeProvider / ThemeToggle**: next-themes ラッパー、トグルスイッチ風 UI（Sun/Moon アイコン）。ThemeToggle テスト 8 件
  - [x] **Pagination**: link/button 2 モード、省略表示、モバイル時の現在ページインジケータ。無効状態は `<span>` でレンダリング（不正 href を出さない設計）。テスト 19 件
  - [x] **ShareButtons**: X / LINE / はてなブックマーク / URLコピー、Button コンポーネント再利用。テスト 10 件
  - [x] ファイル構成: `src/components/<Name>/index.tsx` + `<Name>.module.css` + （ロジックがある場合）`__tests__/<Name>.test.tsx`
  - [x] 既存サイトには結線しない（layout.tsx は引き続き old-globals.css と `src/components/common/` を使う）
- [x] **T4**: コンポーネントカタログページ `/storybook` の作成 + 段階的移行の枠組み構築
  - [x] Next.js App Router の **Route Group「複数 root layout」** パターンを採用し、`src/app/(legacy)/` と `src/app/(new)/` で root layout を完全分離
  - [x] 既存全ページを `(legacy)/` 配下に git mv（layout.tsx、page.tsx、about/、achievements/、api/、blog/、cheatsheets/、dictionary/、feed/、memos/、play/、privacy/、tools/、\_components/、**tests**/、各 image/icon ファイル）
  - [x] `(new)/layout.tsx` を新設（独立 `<html><body>`、new globals.css のみ、新 Header/Footer のみ、ThemeProvider 組込み、ThemeToggle を Header.actions に挿入）
  - [x] `/storybook` ページを `(new)/storybook/` に配置（8 セクション、各 preview を Panel で包む）
  - [x] noindex は `(new)/layout.tsx` の metadata で `robots: { index: false, follow: false }` 指定
  - [x] サイトマップは手動 URL リスト構築のため /storybook は追加されない（除外不要）
  - [x] DOM 排除の実証: ビルド成果物 `.next/server/app/storybook.html` を解析し、旧 `src/components/common/` 由来の class（`Header-module__Pzgc7q__*` 等）が **0 件**、新 `src/components/` 由来の class のみ存在することを確認
  - [x] CSS Layer の撤回: Route Group で old/new globals.css が同時に読まれない構造になったため、`@layer legacy, base` を完全に削除しシンプルな状態に戻す
  - [x] **favicon 静的化**: `(legacy)/icon.tsx` `apple-icon.tsx` を削除し、`public/favicon.ico` `public/apple-touch-icon.png` を新設（Claude Design `yolos-mark.svg` 構造を踏襲して「y」+ accent dot を circle で描画）。両 root layout が同じファイルを自動配信
  - [x] **ダーク contrast 改善**: `--bg`(#363634) `--border`(#555550) `--shadow-button`/`--shadow-dragging` の不透明度上げ。CSS Module hash 漏れを `:global(:root.dark)` で修正（ToggleSwitch 等）。docs/knowledge/css-modules.md に知見化
  - [x] **`--border-strong` 再導入**: フォーム要素の輪郭視認性確保（Input border に適用）
  - [x] **`::selection` 削除**: admonition 等との組み合わせで最適化困難なためブラウザデフォルトに任せる
  - [x] **`--fg-softer` のコントラスト引き上げ**: ライト #6f6f6f / ダーク #a8a8a8 で AA 4.5+ 確保
  - [x] **Footer 反転撤回**: `--bg-invert` 背景 → `--bg`（ヘッダーと同色）に変更し、ダーク時の明色化問題を解消
  - [x] **Header NAV_ITEMS 整理**: ツール / 遊び / ブログ / サイト紹介 の 4 項目（ツール先頭で主軸表現、サイト紹介で信頼形成動線）
  - [x] **Footer 4 カラム式サイトマップ**: ツール（代表ツール併記）/ 遊び（カテゴリ単位）/ ブログ（一覧 + 5 カテゴリ）/ その他（チートシート・辞典・実績・サイト紹介・プライバシー・GitHub）。`<nav aria-label="サイトマップ">` でランドマーク化
  - [x] **Header モバイル対応**: max-width 720px でハンバーガーメニュー化（aria-expanded / aria-controls / Escape 閉じ / リンククリック閉じ）
- [x] **T5**: デザイン移行計画の策定
  - [x] 独立ファイル `docs/design-migration-plan.md` として書き起こす
  - [x] DESIGN.md §7「暫定対応」を出発点に、何をどの順番でどう旧→新に置き換えるか、検証方法（`/storybook` での確認を含む）、ロールバック条件をまとめる
  - [x] `/storybook` 運用ルールを計画に含める（Phase 0 で新コンポーネント追加時のセクション追加義務、各 Phase 完了時の Playwright 全体撮影）
  - [x] 本サイクルでは計画策定のみ。実際の置き換え作業は cycle-172 以降
- [x] **T6**: 完成チェック
  - [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて pass（lint 0 errors / 5 warnings は tmp/ 配下のみ、format clean、test 4100/4100 pass、build 成功）
  - [x] サイクル終了時のチェックリストをすべて満たす

## 作業計画

### 目的

cycle-167 で策定したサイトコンセプト「日常の傍にある道具（と、ちょっとした息抜き）」を体現する UI/UX の基準を、長期にわたって運用できる形で整備する。具体的には:

1. **デザインの拠り所を明確にする**: `DESIGN.md` と `/frontend-design` SKILL.md を読めば、PM もサブエージェントも同じデザイン判断ができる状態にする
2. **共通コンポーネントを揃える**: DESIGN.md が前提とする最低限の汎用コンポーネントを `src/components/` 直下に揃え、cycle-172 以降の移行作業の足場をつくる
3. **移行の道筋を確定する**: 既存サイト（`src/components/common/` を使い old-globals.css を読む状態）から新デザインシステムへの移行を、無理なく安全に進められる計画として書き起こす

本サイクルは設計と素材の整備、および移行計画の策定までで、既存サイトへの実適用は次サイクル以降に切り出す。

### 想定利用者

このサイクルの直接の利用者は、本サイトの来訪者ではなく、今後 yolos.net で UI/UX の判断と実装を行う PM 自身およびサブエージェント。来訪者への価値は、本サイクルで整備されるデザインシステムが cycle-172 以降の移行作業を経て、来訪者に届く UI に反映されたときに発生する。よって本サイクルは「現時点で来訪者の体験を変えない」が、「来訪者の体験を変える土台を確実につくる」ことが価値となる。

### 作業内容

実施する作業の節に列挙したとおり、6 タスク（T1〜T6）に分割して進める。依存関係は以下:

- **T1 と T2 は独立**（並行可能）
- **T3 は T2 の後**: layer 構成と CSS 変数の最終形が確定してからでないと、コンポーネントの style が宙に浮く
- **T4（`/storybook` ページ作成）は T3 の後**: T3 で作ったコンポーネントを並べる対象にする
- **T5（移行計画策定）は T4 の後**: 移行計画の検証フローに「`/storybook` での確認」を組み込みたいので、`/storybook` がある状態で書く
- **T6 は最後**

過去 2 サイクル（169・170）の失敗を踏まえ、各タスクは可能な限り小さく独立させ、各タスク完了時点でレビューを通す。

### 注意点

- **既存サイトには手を加えない**: 本サイクルは設計・素材整備・計画策定のみ。`src/app/layout.tsx` および `src/components/common/` 配下、`src/app/old-globals.css` は触らない。これを破ると過去サイクルと同じ「移行と新規整備を同時にやろうとして崩れる」失敗になる
- **素地を尊重する**: Owner が `80e61fde` で用意してくれた SKILL.md / DESIGN.md / globals.css は、構造としては既に十分整っている。本サイクルでの修正は「明らかな不整合の小修正」と「Owner から明示的に指示された追加（ダークモード対応・トグルスイッチ原則）」に限定し、構造は変えない
- **コンポーネント数は広げない**: T3 の最小セット 7（Panel/Button/Input/Header/Footer/Breadcrumb/ToggleSwitch）+ Article 要否検討、これ以外のコンポーネントは本サイクルで作らない。必要性が出てきたら別サイクルで追加する
- **計画と実装を分ける**: T4 の移行計画は本サイクル内で策定するが、計画に基づく実置き換え作業は本サイクルでは一切行わない

### 完成の定義

- T1〜T5 のすべてのチェックボックスが消化されている
- 新しい `src/components/` 直下に T3 で決めたコンポーネントセット一式が、tsx・module.css・単体テストとともに存在する
- `https://yolos.net/storybook` のページが本番ビルドに含まれ、T3 で作ったコンポーネントが一覧確認できる
- `docs/design-migration-plan.md` が独立ファイルとして存在し、cycle-172 以降の移行作業がこの計画を読めば進められる粒度で書かれている
- T6 のチェックがすべて pass

### 検討した他の選択肢と判断理由

- **planner サブエージェントに計画立案を任せる案**: 不採用。Owner からの明示指示で「planner は使わず、Owner と PM の対話で簡単な計画を立てるだけに留める」とあった。過去 2 サイクルでは Rev を重ねた計画肥大が失敗の一因だったため、入り口を意図的に軽くする
- **DESIGN.md §5 にコンポーネント一覧を追記する案**: 不採用（Owner 判断）。コンポーネント実体と一覧の二重管理を避け、混乱の原因をつくらない
- **Article コンポーネントを最初から作る案**: 保留。Panel と別に必要かをよく検討してから判断する（Owner 指示）
- **移行計画を `docs/cycles/cycle-171.md` 内に書く案**: 不採用。次サイクル以降も参照するため、独立ファイル `docs/design-migration-plan.md` に書く（Owner 同意）

### 計画にあたって参考にした情報

- `docs/cycles/cycle-167.md`: サイトコンセプト策定（「日常の傍にある道具」）
- `docs/cycles/cycle-169.md` / `cycle-170.md`: 過去 2 サイクルの失敗サイクル記録（事故報告含む）
- `DESIGN.md`（98行）: 80e61fde で Owner が用意した素地
- `.claude/skills/frontend-design/SKILL.md`（31行）: 同上
- `src/app/globals.css` / `src/app/old-globals.css` / `src/app/layout.tsx`: 移行前/移行後の実状
- `docs/targets/`: ターゲットユーザー定義（M1a 初回来訪のツール利用者、M1b リピーター ほか）

## レビュー結果

### T1: SKILL.md / DESIGN.md の小修正

- **R1（指摘あり）**: 角丸・影トークンの DESIGN.md への記載漏れ／トグルスイッチ追記文の主語が広すぎ・例外未記載 — builder が両方対応
- **Owner 追加指示**: `--border-strong` を全ファイル（globals.css / SKILL.md / DESIGN.md）から削除 — builder 対応
- **R2（pass）**: 7 観点（border-strong 削除整合性／角丸・影サブセクション／トグルスイッチ文／目的妥当性／スコープ逸脱／構造保全／新規不整合）すべて OK で承認
- **追加修正**: Owner 指摘で角丸・影サブセクションを §2 → §5 へ移動（色ではないため）→ R3 で 7 観点 pass

### T2: globals.css の修正

- **R1（指摘あり）**: ダークモードの `--bg-softer` の方向反転で SKILL.md L19 ホバー連鎖と不整合／`--border` のエイリアス放棄説明不足／`-soft` 利用想定の DESIGN.md 注記不足／自主追加された CSS 構造テストの是非
- **Owner 追加指示**: (a) `-soft` 背景のボーダーは同系統の `-strong` を使う、(b) CSS 変数の存在チェックは品質担保にならないため新規テストは削除
- **builder 再修正**: ダーク値を単調連鎖に整える、`--border` のダーク独立値を `:root.dark` 内コメントで明記、DESIGN.md §2 注記を `-strong` ボーダー方針に書き直し（PM 直接編集で文言確定）、テストファイル削除
- **R2（pass）**: 9 観点すべて OK。コントラスト比は `--fg`(15:1)・`--fg-soft`(7.8:1)・`--accent`(7.1:1) 等いずれも WCAG AA 以上。`--fg-softer`(3.7:1) のみ disabled/caption 用途として意図的に低めだがライト側と一貫
- **Owner 追加指摘**: `@layer base` 単独では unlayered の old-globals.css に負ける（CSS Cascade Layers 仕様）／さらに old に固有の `.markdown-alert*` 等のグローバル CSS が new ページに漏れて当たる懸念
- **Owner 方針**: old から new に持ち込みたいベース・admonition 等を new globals.css にコピー（移行期間中は二重化、最終形を綺麗に）＋ `@layer legacy, base;` 化
- **builder 追加実装**: グローバルリセット・dialog・visually-hidden・admonition 一式を new globals.css に移植、admonition 用トークンを追加（important のみ紫系を新規定義）、両ファイルを各々 `@layer` で囲む
- **R3（pass）**: 7 観点すべて OK。Admonition important のコントラスト計算 — ライト 5.4:1 / ダーク 6.2:1 で AA pass

### T3: 新コンポーネント作成（7 種）

7 builder + 7 reviewer サイクルを並行で回した。

- **Panel**: R1 で承認（テストなしの判断も妥当）
- **Button**: R1 で承認（軽微所見: size=default テスト重複は任意改善）
- **Input**: R1 で承認
- **Header**: R1 改善指示（ロゴサイズ縮小理由のコメント追加）→ PM 直接修正
- **Footer**: R1 で承認
- **Breadcrumb**: R1 で承認（軽微所見: 空 CSS クラス・key 重複対策は任意改善）
- **ToggleSwitch**: R1 改善指示（keyDown テストが空振り）→ builder が当該 2 テスト削除＋コメント追記
- **最終チェック**: lint / format / test (4051) / build すべて pass
- **Owner 追加方針反映**:
  - Input: 標準挙動継承（controlled/uncontrolled 両対応）+ JSDoc 大幅充実
  - ToggleSwitch: `<button role="switch">` ベース → `<label>` + `<input type="checkbox" role="switch">` ベースに完全書き換え（CSS のみで状態切替、JS state なし）
  - Header/Footer: 全ページ共通の `nav`/`links`/`note` props を削除し内部固定化（とくに Footer の AI 運営注記は constitution Rule 3 の安全装置として上書き不可）
  - Header テスト全削除、Footer テストは AI 注記の 1 件に絞る
- 最終テスト数: 36（Panel 0 / Header 0 / Footer 1 / Button 11 / Input 11 / Breadcrumb 7 / ToggleSwitch 6）

### T4: /storybook ページ + 段階的移行の枠組み

- **当初計画**: layout.tsx の旧 Header/Footer がページ上下に出る前提で、`/storybook` 内にプレビューセクションを並べる構造（builder R0 で実装済）
- **Owner 真要件**: 「ヘッダーが二重に表示されたり DOM に残るようなら検証は失敗。段階的移行の検証として機能させる」
- **方針転換**: Next.js App Router の「複数 root layout」パターンを採用
  - `src/app/(legacy)/`: 既存全ページを移動（旧デザイン、旧 Header/Footer、old-globals.css）
  - `src/app/(new)/`: 独立 root layout（新 Header/Footer、new globals.css のみ）
  - `(new)/storybook/page.tsx` で /storybook を提供
- **CSS Layer 撤回**: Route Group で両 globals.css が同時に読まれなくなったため、T2 で導入した `@layer legacy, base` 構造を削除しシンプルな素のルールに戻す
- **DOM 排除の実証（最重要）**: reviewer が `.next/server/app/storybook.html` を解析し、旧 `src/components/common/` 由来の class が **0 件**、新 `src/components/` 由来のみ存在することを確認
- **R1（pass）**: 8 観点すべて OK。Owner の真要件「段階的移行の枠組みとしての検証」が、新旧 class が完全に異なる状態で並存できることをもって実証
- **Playwright ビジュアル検証**: chrome-for-testing をインストールして実機検証。ToggleSwitch の controlled クリックで OFF→ON 切替・状態表示テキスト同期・accent 色適用、disabled の操作不可、`document.documentElement.classList.add('dark')` でダーク値が body に反映（bg #1c1c1a / fg #e8e8e5）を確認。新旧 Header/Footer の class ハッシュが完全に異なり混入 0 件
- **追加対応 — favicon 静的化**: `(legacy)/icon.tsx` が `(new)/` 配下に反映されない問題を発見（Route Group 「複数 root layout」では icon convention も各 root で独立）。Owner 方針「移行中の二重管理よりも最終形の負債最小化を優先」を踏まえ、以下に切り替え:
  - `public/favicon.ico`（32x32 + 16x16 ICO container）と `public/apple-touch-icon.png`（180x180 8-bit RGB、角丸なし・透明なし）を新規作成。**ロゴは「y.」**: `--fg` (#1a1a1a) 背景に白文字「y」+ accent ブルー (#386bdc) の独立 `<circle>` で dot を描画。Header テキストロゴ「yolos<dot>.</dot>net」の dot 表現と整合。circle にした理由は、small サイズ（16x16/32x32）で text の `.` がラスタライズ時に正方形ピクセルブロックとして崩れるのを避けるため
  - `(legacy)/icon.tsx` と `(legacy)/apple-icon.tsx` を削除
  - 両 root layout の `metadata.icons` は書かず、Next.js の `public/` 自動配信に委ねる
  - 最終形の負債: favicon 関連は `public/` の 2 ファイルのみ。1 ファイル差し替えで favicon 変更が完結
  - レビュー 2 回（R1 で apple-touch-icon の角丸自前 + 透明問題を指摘 → SVG の `rx` 削除と `flatten` で再生成 → R2 で 8 観点 pass）

### T5: デザイン移行計画の策定

- `docs/design-migration-plan.md`（新規ファイル）として独立ドキュメントを書き起こし
- 構成: 目的 / 移行アーキテクチャ（Route Group 複数 root layout）/ Phase 0〜5 / 1 ページ移行の標準手順 / 検証方法（`/storybook` 運用ルール + Playwright）/ ロールバック条件 / 完了の定義
- Phase 0 を「新規実装が必要なもの」と「既存ファイルのトークン置換 + 結線が必要なもの」に分離（後者は `src/components/search/` 既存実装が該当）
- 各 Phase に「完了基準」を 1 行ずつ追記
- 経緯記述（cycle-171 T4 で実証済 等）は排除し、純粋な「これから守るべきこと」の文体に統一
- **R1（指摘あり）**: Search 系を「未実装」と書いていた事実誤り、Pagination 等の使用箇所数の不正確、Phase 完了基準の欠如、経緯記述の混入の 4 件を指摘
- **R2（pass）**: 9 観点すべて OK。実 grep 値・実ディレクトリと記述が完全一致、cycle-172 以降の起動文書として十分な品質と承認
- **Owner 追加方針**:
  - 道具箱機能（B-309 等）を移行計画に組み込み、ツールロジックの「2 回の作り直し」を回避するため Phase 構成を再編（Phase 3「タイル基盤」+ Phase 4「タイル対応 + デザイン移行統合」）
  - 共通コンポーネントの整備は本サイクルのスコープなので、Pagination / ShareButtons は本サイクル内で実装
  - 移行計画書を最後に `docs/archive/` に移動する手順を追加
  - GoogleAnalytics は共通コンポーネントから外して layout 部品扱い
- **追加コンポーネント実装**: Pagination（19 テスト）+ ShareButtons（10 テスト）を新規作成、`/storybook` セクション 9・10 として追加
- **R3（pass）**: 順序最適化と道具箱フェーズ統合を反映後、9 観点すべて OK で承認
- **Pagination 個別レビュー**: 不正 href（無効 prev/next が `/page/0` 等を持つ）を `<span>` 化で解消、モバイルインジケータの `aria-hidden` 退行を解消、冗長クラス削除、ShareButtons の trackShare 設計意図コメント追記

### T5 後の追加対応（Owner 指摘による徹底調査と修正）

Owner から「コンポーネントと layout に致命的な抜け漏れが多い。徹底調査して修正してから計画書を仕上げよ」との指示を受け、code-researcher 2 名で T1〜T5 の成果物を徹底再点検。layout 致命 5 / 重要 6 / 軽微 3、コンポーネント致命 1 / 重要 8 / 軽微 13 を発見し、優先順に修正:

- **layout 致命的修正**:
  - `(new)/layout.tsx` に `GoogleAnalytics`、`AchievementProvider`、`StreakBadge`、`WebSite JSON-LD`、`metadataBase`、`keywords`、`openGraph`、`twitter`、`alternates`、`robots: index=true` を追加
  - `(new)/storybook/layout.tsx` を新設して storybook だけ noindex に上書き（`"use client"` の page.tsx から metadata を export できないための回避策）
  - `globals.css` に `--font-mono` と `--color-trust-*` を追加
  - `Breadcrumb/index.tsx` に `BreadcrumbList` JSON-LD 出力を追加
- **コンポーネントの a11y / 機能補完**:
  - Header: `usePathname` で aria-current、モバイルオーバーレイ、ボディスクロックロック、ロゴ min-height 44px
  - Footer: focus-visible、モバイル時 link min-height 44px
  - Button: type プロパティの明示化（実態は `...rest` で透過するため動作変更なし、テストで担保）
  - ThemeToggle: hydration 前のプレースホルダー
- **致命的バグ 3 件（reviewer R1 指摘）の修正**:
  - 致命1: `.mobileOverlay` の z-index が `.mobileMenu`（static）より上にあり、モバイルメニューのリンクが実機タップで反応しない問題 → `.mobileMenu` を `position: relative; z-index: 11` に
  - 致命2: `(new)/layout.tsx` の `<body style={...}>` が React 管理下にあり、`useEffect` の `document.body.style.overflow = "hidden"` 直書きが reconciliation で消える問題 → `document.body.classList.add("scroll-locked")` 方式に変更し、`globals.css` と `old-globals.css` の両方に `.scroll-locked { overflow: hidden }` を追加。`src/components/common/MobileNav.tsx`（旧 Header の方）も同方式に統一
  - 致命3: ThemeToggle のプレースホルダーボタンがサイズ 0×0 で CLS 抑止になっていなかった問題 → `.toggle` に `min-width: 52px; min-height: 28px` を付与
  - Playwright で本番ビルドの 375×812 / 1280×800 で elementsFromPoint・computedStyle・boundingRect を実機検証し全件解消を確認
- **アンチパターン AP-I07 / I08 / I09 を `docs/anti-patterns/implementation.md` に追加**: Next.js layout の body style と useEffect の競合、fixed オーバーレイ背後の static 操作要素、jsdom 単体テストの限界
- **metadata 重複の解消**: `src/lib/site-metadata.ts` を新設して `sharedMetadata` を一元化し、両 layout から import
- **search 方針の反転（Owner 指摘）**: 当初 reviewer R2 で「`old-globals.css` に新トークンを併存定義して search を新トークン化」する方向で進めたが、Owner から「Route Group 分離は『ページ単位の見た目切替』のため。共通コンポーネントが新トークンを直接参照すると分離意図に反する」との指摘。方針を反転し:
  - `src/components/search/*.module.css` を旧トークン (`--color-*`) のまま据え置き
  - `old-globals.css` の新トークン併存ブロックを撤去（`.scroll-locked` クラスは保持）
  - `(new)/layout.tsx` と `(new)/storybook/page.tsx` から `SearchTrigger` を取り外し

- **storybook noindex 実装の既存パターン整合化（Owner 指摘）**: 当初 `(new)/storybook/layout.tsx` を新設して noindex を上書きする方式を採用したが、既存ページは `page.tsx` の `metadata` export または `generateMetadata` で robots を返す方式（例: `(legacy)/blog/tag/[tag]/page.tsx`）。`"use client"` のため metadata を export できない問題は、page.tsx を server component に保ち interactive 部分を子の client component（`StorybookContent.tsx`）に分離する形で解決。`layout.tsx` を撤去

- **計画書のゼロからの書き直し（Owner 指示の反復で複数回改訂）**: 既存計画は前提の過不足があったため破棄してゼロから策定。Owner との対話を通して以下を明確化:
  - 共通コンポーネントの実装と DESIGN.md / SKILL.md の修正は本サイクルで完結すべきもので、計画書（次以降のサイクル指針）には含めない
  - `/dashboard` URL の独断仮定を撤回。道具箱の URL 構成は未確定（トップ自体 / 専用 URL / 個別 URL 等）として Phase 2.1 で決める
  - ロジック/デザイン分離は検索固有の話。一般原則として書かない
  - `ToolMeta` / `PlayMeta` の存続も所与にしない。タイル概念に統一する単一構造への再設計を Phase 2.1 で検討する
  - ツールとタイルが 1 対多になり得るかも Phase 2.1 で検討する事項に含める
  - デザイン移行は git mv だけでは完結しない。DESIGN.md に従ったデザイン適用を標準手順に明記
  - `/storybook` は共通コンポーネント専用、特定コンテンツ / カテゴリ固有のものは置かない
  - 番号体系を A/B/C/D 記号 + Phase 番号の混在から Phase X.Y 形式に統一
  - 道具箱の基盤実装と来訪者向け公開を分離（Phase 2 = 基盤、Phase 9.2 = 公開）。トップを道具箱化する場合に空状態を回避
  - Phase 順序を「基盤先行 → 一覧 → 詳細 → 道具箱公開」に再構成。来訪者から見えない作業（Phase 1 判断、Phase 2 基盤実装）を最優先で消化し、デザイン混在期間の開始を最小化

<このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

- **デザイン移行計画 Phase 1〜10 の全タスク**: `docs/design-migration-plan.md` を SSoT として、各 Phase に対応する backlog アイテムを以下の通り登録した:
  - Phase 1.1（検索方針判断）→ B-332
  - Phase 1.2（既存コンテンツ整理方針）→ B-315（既存）
  - Phase 2（道具箱の基盤実装）→ B-309（既存）
  - Phase 3（静的・リダイレクト先行）→ B-333
  - Phase 4（一覧・トップ移行）→ B-334
  - Phase 5（検索の実装、1.1=(a) のとき）→ B-331
  - Phase 6（ブログ詳細移行）→ B-335
  - Phase 7（ツール・遊び詳細 + タイル化）→ B-314（スコープを「詳細移行 + タイル化の同時実施」に更新）
  - Phase 8（既存コンテンツ整理の実施）→ B-315（既存、Phase 1.2 と兼務）
  - Phase 9.1（構築済み道具箱テンプレート）→ B-312（既存）
  - Phase 9.2（道具箱ページの本公開）→ B-336
  - Phase 9.3（ツール間の入出力連携）→ B-324（既存）
  - Phase 9.4（シェア機能）→ B-313（既存）
  - Phase 10（撤去・統合）→ B-337
  - 各 backlog アイテムの Notes に着手条件と詳細を記載済み。実施順序の判断は計画書を参照する。

## 補足事項

- cycle-169・cycle-170 は連続して失敗サイクルとしてクローズされた。事故報告は両サイクルのドキュメント末尾を参照。本サイクルはその学びを反映しながら進める。
- 本サイクルは Owner 主導で進めるため、各ステップで Owner の指示を仰ぎながら作業する。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
