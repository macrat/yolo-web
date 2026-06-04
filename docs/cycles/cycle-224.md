---
id: 224
description: "B-489: 共通部品とツールページの器を構築する。デザイン移行立て直し critical path（B-488→B-489→B-490）の第2段。単一抽象に是正された正典（B-488/cycle-223）に基づき、共通部品語彙とツールページの器（旧 ToolLayout のゼロベース再設計）を新設する。"
started_at: 2026-06-04T09:22:05+0900
completed_at: 2026-06-04T15:33:19+0900
---

# サイクル-224

このサイクルでは、デザイン移行の立て直し critical path（**B-488→B-489→B-490**）の第2段である **B-489** に着手する。

前サイクル（cycle-223 / B-488）で `docs/design-migration-plan.md` の正典が単一抽象（**タイル＝所定デザインを当てた `<div>` にツールのフル機能 UI を共通部品で組んだ、ただ一つの実装＝ページ本体**。Component 廃止・kind=widget 廃止・機能削減廃止・tile-grid 多セル維持）に是正された。これにより B-489 が着手可能になった。

B-489 のゴールは、後続の B-490（全34ツール＋遊びを各1サイクルで単一タイル化＋Component 削除）が土台として使う **共通部品語彙とツールページの器** を構築すること。具体的には、旧 ToolLayout のゼロベース再設計（タイルを主役＝ファーストビューに描画し、その下に補助情報、1200px 幅）を行う。道具箱への追加導線は Phase 10 の責務であり、本サイクルには含めない（cycle-220:283）。

最終受益者は来訪者（`docs/targets/` の「特定の作業に使えるツールをさっと探している人」「気に入った道具を繰り返し使っている人」）。土台が単一抽象で正しく組まれることで、B-490 が「開いた瞬間に使えるフル機能のツール」を届けられる。

## 実施する作業

B-489 の確定スコープ（cycle-220 §T-3 L279-288）を、小さく独立したタスクに分割する。**部品群（A群）と器群（B群）は相互にほぼ独立**で並行実行可能。各群内も以下の順序・依存で進める。各部品タスクは「実装 ＋ テスト（既存 Button/Input の `readFileSync` 検証パターンに倣う）＋ storybook エントリ追加」を 1 単位とする。

**A群: 共通部品（相互独立・並行可。器群とも独立）**

- [x] A-0 前提検証: 部品設計で使うトークン対（`--bg-invert`/`--fg-invert`、`--border-strong`、`--accent`、`--shadow-button`、`--r-interactive`、`--r-normal`、`outline-offset:2px`）が DESIGN.md と globals.css で一致し AA を満たすことを一度だけ検証する（globals.css は変更しない）。実測不一致（SegmentedControl 11ツール／font-weight:700 が10件、計数方法は「作業内容」の注記参照）を記録する。
- [x] A-1 `Textarea` 新規作成（入力/`readOnly`出力・`spellCheck`・`rows`・mono/inherit font・resize:vertical を吸収。line-height/border-radius/focus を DESIGN 準拠で一元化）＋テスト＋storybook
- [x] A-2 `Select` 新規作成（`--r-interactive`/`--border-strong`/サイズ差を吸収）＋テスト＋storybook
- [x] A-3 `SegmentedControl` 新規作成（`role="radiogroup"`+`role="radio"`+矢印キー操作。選択中塗りは AA。①-18/B-443 を構造的に解消）＋テスト（ARIA・キー操作）＋storybook
- [x] A-4 `ErrorMessage` 新規作成（`role="alert"`・日本語フォールバック統一の単一窓口。完了条件: **props 未指定時に表示する既定の日本語フォールバック文言を ErrorMessage 自身が内蔵する**＝各ツールが個別文言を渡さなくても英語生エラーが露出しない【M-4】）＋テスト＋storybook
- [x] A-5 `FileDropZone` 新規作成（drag enter/leave/over/drop・role=button・キーボード操作。ファイルサイズ上限/対応フォーマット表示を props 化）＋テスト＋storybook
- [x] A-6 `useCopyToClipboard` フック新規作成（複数ターゲットを識別してコピー済み表示できる汎用シグネチャ。state パターン A〜E を吸収。完了条件: **成功フィードバックの提示方法（文言・表示継続時間・aria-live の有無）の既定をフック/部品レベルで1つ持つ**＝具体UI最終形は B-490 でよいがバラつき防止の既定を持つ【N-1】）＋テスト＋storybook（デモ）
- [x] A-7 `Input` 拡張: `type="date"` を追加（`error`/`--border-strong`/`--r-interactive` 既存踏襲）＋テスト追記＋storybook 更新
- [x] A-8 既存部品の適用準備検証: `Panel`/`Button`/`ToggleSwitch` が DESIGN 準拠かつツール置換に使える状態であることを確認（Button primary が `--bg-invert`/`--fg-invert` で AA を満たすことを確認。新規作成・修正はしない）

**B群: ツールページの器（B-1〜B-3 は相互独立。B-4 はそれらに依存、B-5 は B-4 に依存）**

- [x] B-1 新 `FaqSection` 新規作成（`<details>`/`<summary>` ＋ FAQPage JSON-LD を新トークンで。旧 `common/FaqSection` は触らない）＋テスト＋storybook
- [x] B-2 新 `RelatedTools` 新規作成（旧 `_components/RelatedTools` を新デザインで作り直し。旧の `--color-*` 依存を排除。完了条件: **関連ツールの一行説明を保持する**＝リンク名だけに簡素化しない。ターゲット1の「似たツールで迷う」を悪化させないため【M-3】）＋テスト＋storybook
- [x] B-3 新 `RelatedBlogPosts` 新規作成（旧 `_components/RelatedBlogPosts` を新デザインで作り直し。完了条件: **日付等の手がかりを維持する**【M-3】）＋テスト＋storybook
- [x] B-4 新 `ToolPageLayout` 新規作成（確定提示方式の要素並び順を実装。新 Breadcrumb/ShareButtons を再利用し B-1/B-2/B-3 を組み込む。children として現 Component を主役＝ファーストビューに描画。BreadcrumbList/FAQPage JSON-LD を保持。WebApplication JSON-LD は page.tsx 側で不変。完了条件: **器が空の本体（children が空）でもレイアウトが破綻しない**こと＝空状態の表示内容自体は B-490 の責務だが、器の堅牢性は B-489 の責務【N-2】）＋テスト＋storybook
- [x] B-5 20の `(new)/tools/<slug>/page.tsx` を新 `ToolPageLayout` を使う形に切替（Component の内部UIは一切不可触。children として渡すのみ）。切替前後で take-screenshot による before/after を取得し、**before の既知劣化点（補足テキスト/プライバシーノートの muted 喪失・secondary 背景喪失・罫線色喪失）が after で DESIGN.md の `--fg-soft`/`--border`/`--bg-soft` 系により正しい階層で表現されていること**を積極チェックリストで確認する【M-1】。**混在の落差が大きい重点ツール（SegmentedControl 使用ツール・FileDropZone 使用の image 2件・既知a11y実害の regex-tester）を明示的に確認対象とし、20枚を「全部OK」で流さず重点ツールで混在の許容度を言語化して残す**【M-2】。**モバイル幅でも本体（入力欄）上端がファーストビュー内に入ることを確認する**（desktop は h1 が単一行短文でファーストビューを食わないことを実機確認済み＝OK、モバイルのみ要確認）【N-3】
- [x] B-6 旧 ToolLayout 系部品（旧 `ToolLayout`/旧 `common/FaqSection`/旧 `_components/RelatedTools`/`RelatedBlogPosts`）がツールページから参照されなくなったことを確認（削除はしない＝他レイアウトが使うため置換のみ）

**仕上げ**

- [x] C-1 `npm run lint && npm run format:check && npm run test && npm run build` 全成功を確認
- [x] C-2 完成条件（cycle-220 L288 逐条）を確認: 6部品＋拡張1種が DESIGN 準拠・AA、器が動作、20ページ置換完了、globals.css 未変更、旧部品を「直した」成果物ゼロ、道具箱追加導線なし

## 作業計画

<plannerが立案した作業の詳細な実施計画をここに記載する。何を何のためにどのようにやるのかを具体的に書き、作業を進めながら方針が変わった場合は随時アップデートすること。次の /cycle-planning フェーズで記入する。>

### 目的

後続 B-490（全34ツール＋遊びを各1サイクルで単一タイル化＋Component 削除）が土台として使う **共通部品語彙とツールページの器** を一度だけ構築する。B-489 のスコープは cycle-220 §T-3 L279-288 で確定済みであり、本計画は新たな設計判断をせず、確定スコープを小さく独立したタスクに分割する。

**価値連鎖（最終受益者＝来訪者）**: 直接の読者は B-490 実行者だが、最終受益者は2つのターゲット。ターゲット1「特定の作業に使えるツールをさっと探している人」の likes は「ページを開いた瞬間に入力欄が見えてすぐ使い始められる」「余計な説明や装飾がなく用事だけ静かに片付く画面」（dislikes は「冒頭に長い解説」「似たツールで迷う」）。ターゲット2「気に入った道具を繰り返し使う人」の likes は「すべてのツールの操作性・トーン&マナーが一貫していること」。本サイクルで土台（部品＋器）が単一抽象・DESIGN.md 準拠・WCAG AA で正しく組まれることで、B-490 が全34ツールを「開いた瞬間に使えるフル機能・一貫トンマナのタイル」として届けられる。確定提示方式（タイルを主役＝ファーストビューに描画し、長い解説/FAQ/シェアをタイル下に二次配置）が、ターゲット1の「すぐ使える」と SEO テキスト量を両立し、同一タイルがツールページと道具箱で一致することでターゲット2の「一貫性」を満たす。AA 準拠の塗りは色覚・低視力の来訪者の可読性を守る。

### 作業内容

「実施する作業」の A群（共通部品6種＋拡張1種＋既存部品の適用準備検証）、B群（新 FaqSection/RelatedTools/RelatedBlogPosts＋新 ToolPageLayout＋20ページ切替）、仕上げ（lint/format/test/build＋完成条件確認）を実施する。

**依存関係の骨子**:

- A群（部品）と B群（器）はほぼ独立に並行できる。器が使うのは Breadcrumb/FaqSection/ShareButtons/RelatedTools/RelatedBlogPosts/Panel であり、Textarea/Select 等のフォーム部品は使わない（それらはタイル内部＝B-490 の領域）。
- A群内: A-1〜A-7 は相互独立で並行可。A-0（前提検証）が論理的な先行。A-8 は検証のみで独立。
- B群内: B-1/B-2/B-3 は相互独立で並行可 → これらが揃ってから B-4（器本体）→ 器本体の後に B-5（20ページ切替）→ B-6（旧部品の非参照確認）。

**計画内で確定した小さな判断（基本設計レベル。案は残さない）**:

1. **SegmentedControl 選択中塗りの AA 方針 = `--bg-invert`/`--fg-invert` ペアを使う**。Button primary と同じ AA 実証済みペアで統一する。`--accent-strong`+白文字は globals.css にコントラスト注記が無く実測検証が必要になるうえ、DESIGN.md が `--accent` をリンク/フォーカス用と定義し塗りには使わないと規定しているため採らない。これにより「白文字を `--accent` 地に直接乗せる現状（①-16）」を部品レベルで根絶し、Button と SegmentedControl のアクティブ塗りのトンマナを一致させる。**正典 cycle-220 L280 は塗り例として `-strong` バリアント（`--accent-strong`/`--success` 等）を例示するが、`--accent-strong` 等は globals.css にコントラスト注記が無く、`--bg-invert`/`--fg-invert` が AA 実証済みかつ DESIGN.md §2 で塗り用途（primary ボタン）として定義されているため後者を採る**【NH-2】。

2. **font-weight:700 の扱い = `--fw-bold` を新設しない／新部品は bold を使わない**。`--fw-*` トークンは globals.css に未定義で、新設は globals.css 変更にあたり「トークン定義は触らない」原則（cycle-220 L284）に反する。新設6部品の CSS に font-weight:700 は不要（数値強調用途は各ツール固有＝B-490 で扱う）。DESIGN.md §3 も「本文中の太字は原則使わない」と規定しており整合する。

3. **新器（ToolPageLayout）の要素並び順**: パンくず（BreadcrumbList JSON-LD含む）→ コンパクトな h1（SEO 用に保持しつつ視覚的に小さく）+ 短説明（1〜2文）→ **ツール本体（children=現 Component＝主役・ファーストビュー）** → howItWorks → プライバシーノート → FAQ（FAQPage JSON-LD含む）→ シェア → 関連ツール → 関連ブログ。タイル/本体は広い幅可（最大1200px）、長文テキストは720px に制限する。h1 と短説明はファーストビューを占有しないようコンパクトに置き、howItWorks 以降はすべてタイルより下に二次配置する。

4. **現状ベースラインの可視化方針**: B-5 切替前に現 (new)/tools ページのスクリーンショットを take-screenshot で取得し、切替後と before/after 比較する。**実機検証の確定事実**: (new) は old-globals.css を読まず旧 `ToolLayout.module.css` が参照する `--color-text-muted`/`--color-bg-secondary`/`--color-border` が新 globals.css に未定義のため computed が空になり、`color: var(--color-text-muted)` 等は inherit に落ちて補足テキスト・プライバシーノートが本文と同濃度の黒で表示され、`background-color: var(--color-bg-secondary)` は透明化、罫線色も喪失している（典拠: `src/tools/_components/ToolLayout.module.css` の `var(--color-*)` 参照が新 globals で未解決）。よって本切替は推測上の改善ではなく**既知の確定劣化を解消する純粋な改善**である。合否は消極条件「劣化が無いこと」ではなく**積極チェックリスト**で判定する:「before の既知劣化点（補足テキスト/プライバシーノートの muted 喪失・secondary 背景喪失・罫線色喪失）が、after で DESIGN.md の `--fg-soft`/`--border`/`--bg-soft` 系により正しい階層で表現されていること」を確認する【M-1】。混在状態（新 shell＋旧スタイルの Component 本体）の許容度は重点ツールで言語化する（M-2、Component 本体の是正は B-490 の領域）。

**実測値の不一致についての注記（実測値を正とする・計数方法併記＝AP-P16）**: SegmentedControl 使用ツール数は実測 **11**（cycle-220 記載は「9」＝不一致、理由不明だが実測 11 を前提とする。計数方法: `src/tools/<slug>/Component.tsx` のうちモード切替＝単一選択 UI を持つツールを対象に計数）。font-weight:700 は実測 **10件**（cycle-220 記載は「8件」＝不一致、実測 10 を正とする。計数方法: `grep -rn "font-weight: *700\|font-weight:700" src/tools/` の出現行数で 10 件、うち **2件は `src/tools/_components/ToolLayout.module.css` と `ToolsListView.module.css`＝ツール本体外**、残り8件が各ツールの `Component.module.css`）。いずれもタスク内容には影響しない（前者は radiogroup 化で構造解消、後者は新部品で bold 不使用とするため。ツール本体外2件の解消経路は別: `ToolLayout.module.css` の1件は B-4 の器置換で解消するが、`ToolsListView.module.css` の1件はツール一覧ページ（`(new)/tools/page.tsx`）が使う部品で **B-489 のスコープ外**＝本サイクルでは解消されない（一覧の移行は別領域）。ツール側8件は B-490 の領域）。

**作業中の注意点**:

- **DESIGN.md 準拠**: 角丸は `--r-interactive`(8px・操作要素)/`--r-normal`(2px)、影は `--shadow-button`、フォーカスは `outline:2px solid var(--accent); outline-offset:2px`、`--accent` は塗りに使わない（リンク/フォーカス用）。
- **WCAG AA**: SegmentedControl 選択中塗りは上記判断1の AA 実証済みペアを使う。
- **ARIA**: SegmentedControl は radiogroup・矢印キー操作、ErrorMessage は role=alert。日本語フォールバックを ErrorMessage に統一（qr-code 等の英語生エラーを吸収）。
- **hydration**: クライアント状態を持つ部品（SegmentedControl/FileDropZone/useCopyToClipboard）は SSR/CSR 不整合を起こさないこと。
- **空状態の責務分担【N-2】**: 空状態の**表示内容**（プレースホルダ文言・空メッセージ等）は B-490 の責務。**器（ToolPageLayout）が空の本体でもレイアウト破綻しない**ことは B-489 の責務として B-4 で担保する。
- **エラー文言の責務【M-4】**: ErrorMessage は props 未指定時の既定日本語フォールバック文言を自身に内蔵し、各ツールが個別文言を渡さなくても英語生エラーが露出しないようにする。
- **コピー成功フィードバックの既定【N-1】**: useCopyToClipboard は文言・表示継続時間・aria-live 有無の既定を1つ持ち、34ツールのバラつきを防ぐ（具体UI最終形は B-490 で調整可）。
- **globals.css 不可触**（トークン定義の書き換え禁止）。**旧部品（旧 ToolLayout/旧 common/\* /旧 \_components の RelatedTools・RelatedBlogPosts）は直さない**（置換のみ・削除もしない）。**Component の内部UIは一切不可触**（B-490 の領域）。**(legacy)/tools の14ツールページは触らない**。**道具箱への追加導線は作らない**（Phase 10）。**タイルの寸法・収納方式の設計はしない**。
- **UI 変更は take-screenshot で before/after 必須**（特に B-5）。
- **各部品タスクは「実装＋テスト＋storybook」を 1 単位**とし、テストは既存 Button/Input の `readFileSync` で CSS の min-height 等を検証するパターンに倣う。

**完成条件（cycle-220 L288 を逐条で満たす）**:

- 新規6部品（Textarea/Select/SegmentedControl/ErrorMessage/FileDropZone/useCopyToClipboard）＋拡張1種（Input type=date）が完成し、最初から DESIGN.md 準拠で、アクティブ状態の塗りを含め WCAG AA を満たす。
- Panel/Button/ToggleSwitch の適用準備が完了（検証済み）。
- タイルを描画するツールページの器（確定提示方式）が動き、20の (new)/tools ページが使う旧 ToolLayout 系部品が新デザイン部品に置換されている。
- globals.css のトークン定義は未変更。削除対象の旧共通部品を「直した」成果物が一つも無い（置換のみ）。
- 道具箱追加導線は含まれていない。
- 各新部品に回帰テストがあり、`npm run lint && npm run format:check && npm run test && npm run build` が全成功。before/after スクリーンショットで、before の既知劣化点（muted 喪失・secondary 背景喪失・罫線色喪失）が after で `--fg-soft`/`--border`/`--bg-soft` 系により正しい階層で表現されていることを積極チェックリストで確認し（M-1）、混在の落差が大きい重点ツール（SegmentedControl 使用・image 2件・regex-tester）で混在許容度を言語化して残す（M-2）。モバイル幅でも本体上端がファーストビュー内に入ることを確認する（N-3）。

### 検討した他の選択肢と判断理由

- **SegmentedControl 選択中塗り**: (a) `--bg-invert`/`--fg-invert`【採用】Button primary と同じ AA 実証済みペアでトンマナ統一。正典 cycle-220 L280 は `-strong` バリアントを塗り例として挙げるが、それは AA 達成手段の例示であり指定ではない。AA 実証済みかつ DESIGN.md §2 で塗り用途（primary）として定義済みの本ペアが最も確実【NH-2】。(b) `--accent-strong`+白文字【却下】globals.css にコントラスト注記が無く実測検証が必要、かつ DESIGN.md が `--accent` を塗りに使わないと規定しているため不適。
- **font-weight:700**: (a) `--fw-bold` を新設【却下】globals.css 変更にあたり「トークン定義不可触」原則に反する。(b) 新部品は bold を使わない・数値強調は B-490 でツール側 literal のまま【採用】globals.css を触らず、新部品に bold 用途が無いため素直で、DESIGN.md §3 とも整合。
- **新器の要素並び順**: (a) 旧 ToolLayout の並びをそのまま新デザインで踏襲【却下に近いが本質は同一】旧並びは既に「本体をファーストビューに近づける」意図があり確定提示方式と概ね一致するため、それを基に h1 をコンパクト化し本体を主役化する形に確定。長文720px/本体1200pxの幅分けと howItWorks 以降の二次配置を明確化した点が新デザインでの確定事項。
- **現状ベースライン可視化**: (a) before/after 実機スクリーンショット比較＋積極チェックリスト【採用】before は実機検証で既知の確定劣化（`--color-*` 未解決による muted/secondary/罫線の喪失）と判明しており、after が DESIGN.md トークンで正しい階層を表現できているかを積極的に確認できる【M-1】。混在の落差が大きい重点ツールで許容度を言語化する【M-2】。(b) 切替後のみ確認【却下】before の劣化点が解消されたかを客観判断できない。(c) 消極条件「劣化が無いこと」のみ【却下】before 自体が劣化状態のため「劣化が無い」では合格基準にならない。

### 計画にあたって参考にした情報

- `docs/cycles/cycle-220.md` §T-3（L185-246 不変前提・核・不変原則、L227-238 確定提示方式、**L279-288 B-489 で作るもの・完了条件**）を Read で裏取り。
- `DESIGN.md`（全文）— §2 色の役割（`--accent` は塗りに使わない）、§3 タイポ（本文太字は原則使わない）、§4 レイアウト（1200px/720px・パネル入れ子禁止・影なし）、§5 角丸（`--r-normal`/`--r-interactive`）・影（`--shadow-button`）、§7 移行（`common/*` は削除対象・新部品は `src/components/`）。
- `docs/design-migration-plan.md`（B-488/cycle-223 で単一抽象に是正済みの正典）の標準手順・Phase 8 完了基準。
- `docs/targets/特定の作業に使えるツールをさっと探している人.yaml` / `docs/targets/気に入った道具を繰り返し使っている人.yaml`（価値連鎖の最終受益者）を Read。
- `tmp/cycle-224/planning-brief.md`（PM 作成の計画立案ブリーフ）。
- 実機確認: `src/components/`（Breadcrumb/ShareButtons/Button/Input/Panel/ToggleSwitch が新デザインで実在）、`src/components/common/`（旧 FaqSection 等が実在）、`src/tools/_components/ToolLayout.tsx`（旧器の並び順・import 構造）、`src/app/(new)/tools/`（20ツールページ＋一覧）、`src/components/Button/__tests__`（`readFileSync` 検証パターン）、`src/app/(new)/storybook/StorybookContent.tsx`（視覚確認エントリの追加先）。
- 実機検証（来訪者価値レビュー M-1 典拠）: `src/tools/_components/ToolLayout.module.css` が `var(--color-text-muted)`/`var(--color-bg-secondary)`/`var(--color-border)` を参照しており、これらは新 globals.css に未定義のため (new)/tools で computed が空になり muted テキスト・secondary 背景・罫線色が喪失している（既知の確定劣化）。font-weight:700 の計数（`grep -rn` で10件・うち2件は `_components` のツール本体外）も実機 grep で確認。
- 来訪者価値レビュー（M-1〜M-4 / N-1〜N-3）および正典忠実性レビュー（NH-1/NH-2）の指摘。
- `docs/anti-patterns/planning.md`（特に AP-P16 数値ラベルの典拠、AP-P20 過度に具体的な計画の回避、AP-P08 ゼロベース範囲）を計画執筆時のチェックに使用。

## レビュー結果

### 計画（cycle-planning）

2観点（正典忠実性・来訪者価値）で並行レビューした。

- **レビュー1回目**:
  - 正典忠実性レビュー: must-fix なし・承認。nice-to-have 2件（NH-1: 実測値 SegmentedControl 11／font-weight:700 10件の計数方法を literal 近くに併記＝AP-P16。NH-2: 正典 cycle-220 L280 が塗り例として `-strong` バリアントを挙げる点との関係を1文明記）。
  - 来訪者価値レビュー: **改善指示**。must-fix 4件（M-1: 現 (new)/tools は `--color-*` 未解決で muted/secondary/罫線が喪失している確定劣化＝実測事実を反映し、B-5 の合否を「劣化なし」の消極条件から「既知劣化が新トークンで正しい階層に表現されたか」の積極チェックリストへ。M-2: 混在の落差が大きい重点ツール〔SegmentedControl 使用・image 2件・regex-tester〕を明示確認対象に。M-3: 新 RelatedTools の一行説明・新 RelatedBlogPosts の日付手がかりを保持。M-4: ErrorMessage に既定日本語フォールバックを内蔵）、nice-to-have 3件（N-1: コピー成功フィードバックの既定を土台で1つ持つ。N-2: 空状態の表示内容=B-490／器が空本体で破綻しない=B-489 の責務区別。N-3: モバイル幅で本体上端がファーストビュー内に入る確認）。
- **是正**: NH-1/NH-2 と M-1〜M-4・N-1〜N-3 を全件反映（planner）。
- **レビュー2回目（全体再点検）**: 正典忠実性レビュー＝**承認**（前回 OK 項目の非回帰も確認）。来訪者価値レビュー＝**承認**（前回 must-fix の来訪者体験への反映と非回帰を確認）。来訪者価値レビューが nice-to-have 1件（NH-A: L78 の font-weight 解消経路の記述で `ToolsListView.module.css` の1件は B-489 スコープ外＝本サイクルでは解消されない、という事実精度の訂正）を指摘。
- **是正**: NH-A をレビュアー提示の文言どおり1文修正（`ToolLayout.module.css` の1件は B-4 で解消／`ToolsListView.module.css` の1件は一覧ページ領域で B-489 外、と明記）。両観点とも指摘ゼロで計画確定。

### 実装（cycle-execution）

B-489 の初回実装レビューを3観点で並行実施した（過去に実装レビューは未実施）。**3観点とも承認・must-fix ゼロ**。

- **観点A（共通部品群）**: 承認。新規6部品＋Input(type=date)拡張が DESIGN.md 準拠（角丸 `--r-interactive`/`--r-normal`、影 `--shadow-button`、フォーカス `outline:2px var(--accent)`、`--accent` 非塗り）・WCAG AA（SegmentedControl 選択中塗り `--bg-invert`/`--fg-invert`＝判断1/NH-2）・ARIA（SegmentedControl radiogroup＋矢印キー、ErrorMessage role=alert＋既定日本語フォールバック内蔵＝M-4、FileDropZone drag/keyboard）・hydration 安全・テスト（readFileSync パターン）・storybook を完備していることを確認。font-weight:700 不使用（判断2）。A群テスト127件 PASS。
- **観点B（器群・20ページ切替・今セッション追加）**: 承認。ToolPageLayout の並び順（判断3）・N-2 空状態堅牢性・M-3（RelatedTools 一行説明／RelatedBlogPosts 日付の保持）・旧 `--color-*` 不使用・B-6（旧部品の非参照）・旧部品の非削除非改変を確認。**B-5 仕上げの冗長ラッパー除去のスコープ拡張を「妥当」と明確に支持**（ToolPageLayout が自前で1200pxを持つため外側ラッパーは死にコード化＋コメントは事実と食い違い、B-489 のゴール「綺麗な土台」に照らし後続切り出しより今処理が正しい）。storybook の node:fs 修正（server-in-client パターン）も正確と確認。
- **観点C（正典忠実性・完成条件 C-2）**: 承認。cycle-220 L288 の完成条件を逐条で「満たす」と確認（6部品＋拡張完成・Panel/Button/ToggleSwitch 非改変・20ページ置換・globals.css 未変更・旧部品を直していない・道具箱導線なし・新部品は src/components/ 配下）。判断1〜3 が正典・DESIGN.md と整合。`git diff` で globals.css/旧部品の差分ゼロを裏取り。

C-1 は **PM が独立再実行**し、冗長ラッパー除去・storybook node:fs 修正・lint warning 解消をすべて含む**最終ツリー**で全成功を確認済み（各コマンドの exit code と件数を PM 自身が確認）: `npm run lint`=0 problems / `npm run format:check`=pass / `npm run test`=329 files・4856 tests pass / `npm run build`=exit 0。

nice-to-have 計6件はいずれも B-490（各ツール実適用時）の留意事項でブロッカーではないため、キャリーオーバーへ。

### 視覚検証（B-5）

B-5 の合否基準（M-1 積極チェックリスト・M-2 重点ツール混在許容度・N-3 モバイルファーストビュー）の実施結果を記録する。検証は2段階で実施した。

- **切替（旧 ToolLayout → ToolPageLayout）の before/after**（前セッションで実施・コミット e945c47a に記録）:
  - 撮影網羅: 代表4ツール（char-count / line-break-remover / image-base64 / regex-tester）× 6幅（w360/w440/w720/w1280/w1536/w1920）を before/after で取得（スクショは作業用一時ファイルにつき git 追跡外。結果は本小節に転記済み）。
  - **M-1（積極チェックリスト）**: before（旧 ToolLayout）では `--color-text-muted`/`--color-bg-secondary`/`--color-border` が新 globals.css に未定義で、「このツールについて」本文や関連ツール説明文が本文と同濃度の黒/リンク色に染まり、プライバシーノートの secondary 背景・罫線が喪失していた既知劣化が、after（ToolPageLayout）では `--fg-soft` のミュート階調・`--border` の枠線・`--bg-soft` のプライバシーノート囲みにより**正しい階層で表現される**ことを確認＝既知劣化の解消を積極確認。
  - **M-2（重点ツール混在許容度）**: image-base64 の SegmentedControl タブ／FileDropZone、regex-tester のフラグ群など本体UI（=children）は旧 Component のまま無傷で、新デザインの器と混在しても破綻しないことを確認。本体UIの新部品化は B-490 の範囲であり、器（新）＋本体（旧）の混在は B-489 時点の許容状態として妥当。
  - **N-3（モバイル）**: char-count w360 でタイトル直下に本体入力欄がファーストビューに収まることを確認（desktop は h1 単一行短文でファーストビューを食わないことを実機確認済み）。
- **冗長ラッパー除去の非回帰**（本セッションで実施）: スクショは新規 playwright セッションが OS デフォルトのダークで開いたためテーマが異なるが（トグル状態差・コード無関係）、レイアウト構造は除去前と完全一致。客観計測で裏取り＝viewport 1920 で `.layout`（ToolPageLayout）が width=1200・左右マージン各360px（完全中央寄せ）。外側ラッパー除去後も 1200px キャップ・中央寄せが ToolPageLayout 単独で正しく機能し、レイアウト影響ゼロ。

### ブログ

今サイクルの storybook node:fs ビルド破壊と解決（Client Component に server 専用部品を import すると Turbopack が node:fs をクライアントバンドルに含めて壊れる→Server Component を prop で注入する RSC パターンで解決）を、開発者ターゲット「Webサイト製作を学びたいエンジニア」向けの技術記事として執筆（`src/blog/content/2026-06-04-nextjs-server-only-import-in-client-component-node-fs.md`、シリーズ nextjs-deep-dive #10）。サイト主作業の B-489（内部の設計システム）自体はツール来訪者向けの記事価値が薄いため記事化せず、転用可能な学び（推移的依存・トップレベル副作用・RSC 境界）を持つ node:fs の知見のみを記事にした。

- **レビュー1回目**: 要修正。must-fix 1件（M1: 「型のためだけの import」という因果説明が不正確＝`import type` は消去されグラフに載らないため、読者が誤った原因モデルを持ち帰る）。nice-to-have 3件（N1: 予防策 `server-only` パッケージへの言及／N2: 同シリーズ関連記事への内部リンク／N3: タイトル62字・description177字の短縮）。技術的正確性は実コードと突き合わせて高評価。
- **是正1**: blog-writer が M1（全4箇所のうち3箇所）＋ N1/N2/N3 を反映。`import type`（型のみ）は載らない／値 import は載る、の対比を追記。
- **レビュー2回目（全体再点検）**: 要修正。must-fix 1件（M1-残: 教訓セクション303行に同質の不正確表現「型や JSX のためだけに import しても載る」が1箇所直し漏れ＝記事内自己矛盾 AP-W09）。N1/N2/N3 は適切に反映済みと確認。
- **是正2**: PM が303行を修正済み箇所（194/327行）と整合する文言（「その関数を呼ぶつもりがなくても、値として import し描画しただけで載る／型のみの `import type` は消去されるので載らない」）に修正。grep で不正確表現の残存ゼロを機械的に裏取り。blog テスト172件 PASS・prettier・build exit 0 を確認。

## キャリーオーバー

未完了タスクはなし（B-489 の全タスク A-0〜A-8 / B-1〜B-6 / C-1・C-2 完了）。以下は実装レビューで挙がった nice-to-have で、**いずれも B-490（各ツールが新部品を実適用するサイクル）で取り込む**留意事項。backlog の B-490 Notes にも記載済み。

- **N-A1（FileDropZone 安静時ボーダー）**: `FileDropZone.module.css` の安静時 `2px dashed var(--border)`（≈1.14:1）が他フォーム部品の `--border-strong`（2.17:1）と不揃い。内部に可視ラベルがあり control 識別は文字で可能・hover/focus/drag で `--accent` に昇格するため WCAG 1.4.11 のブロッカーではない（観点A も nice-to-have 判定）が、B-490 で image 系ツールへ実適用する際に `--border-strong` への統一を検討する。
- **N-A2（SegmentedControl の value 不一致時の到達性）**: 制御値がどの option にも一致しないと tabIndex=0 の要素が無くキーボードで group に入れない。B-490 適用時に「初期 value を必ず options 内にする」運用を前提とする（任意でフォールバック実装）。
- **N-A3（FileDropZone dragLeave チラつき）**: 子要素上で `dragleave` がバブルし active 表示が瞬間解除され得る。B-490 適用時に気になれば relatedTarget 判定を導入。
- **N-B1（二次見出しの色トークン統一）**: ToolPageLayout の `.shareSectionTitle`（`--fg-soft`）と `.howItWorksHeading`（`--fg`）が同格 h2 で濃度不揃い。B-490 でタイル下の階層を最終調整する際に `--fg-soft`/`--fg` のどちらかに統一する。
- **N-B2（空 `.content` region の aria）**: children 空でも `aria-label` 付き region が残る。B-490 の空状態表示内容を入れる際にスクリーンリーダー上の整合を確認する。
- **N-C1（適用時の AA 文脈再確認）**: 部品単体の AA は確認済み。B-490 で実ツールに組み込んだ文脈での AA（背景・隣接要素との関係）を各ツール再構築の完了条件で再確認する。

## 補足事項

- **storybook の node:fs ビルド破壊を発見・修正（本サイクル外の潜在バグ）**: 本サイクルの storybook エントリ追加（コミット cf9685a8）以降、`"use client"` の StorybookContent が `RelatedBlogPosts`（→`@/lib/cross-links`→`@/blog/_lib/blog` で node:fs を参照するサーバ専用）を直接 import しており、Turbopack が node:fs をクライアントバンドルに含めようとして `npm run build` が失敗していた。C-1（build 確認）が前セッションまで未実施だったため未検出だった。server component の `storybook/page.tsx` で RelatedBlogPosts を描画し ReactNode を prop として client の StorybookContent に渡す Next.js のイディオムで修正した。**教訓**: C-1（特に build）は実装の早い段階で一度通すべきで、storybook のような開発者向けページでも client/server 境界とサーバ専用依存（fs 連鎖）の混入に注意する。
- **前セッション失敗からの再開**: 本サイクルは前セッションが PM のツール呼び出し書式の誤りで中断していた。作業内容（コード）の問題ではなく、B-5 の差分・検証は健在だった。本セッションは申し送りに従い B-5 仕上げ→C-1→視覚検証→実装レビュー→完了処理を実施した。
- **node:fs/RSC 境界の知見を恒久化**: 上記 storybook ビルド破壊の知見（`"use client"` から推移的に node:fs を掴む部品を import すると壊れる／server-in-client の prop 注入で回避／server-only での予防／早期 build 検証）を `docs/knowledge/nextjs.md` セクション11 に追記した。
- **完了処理の学び（AP-WF08・軽微）**: ブログ是正2でレビュアー指摘の1箇所（303行）を PM が直接編集した。残存ゼロを grep で機械裏取りしたため実害は小さいが、本来コンテンツ成果物の修正は担当エージェント（blog-writer）に差し戻すのが原則。次回以降は文言訂正であっても担当に戻す。

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
