---
id: 219
description: ツール詳細ページの新デザイン移行 + タイル化（移行計画 Phase 8.1 第 20 弾 / email-validator）
started_at: 2026-05-31T21:04:03+0900
completed_at: null
---

# サイクル-219

このサイクルでは、デザイン移行計画 Phase 8.1（ツール群の新デザイン移行 + タイル化）の第 20 弾として、`email-validator`（メールアドレス形式検証）ツールを対象に、(1) ロジック詳細ページの新トークン置換、(2) 詳細ページ（`/tools/email-validator`）の `(new)/` 配下への移行とデザイン適用、(3) 道具箱で単独完結するタイルウィジェットの実装を行う。

## 選定根拠（移行順序原則「GA4 PV 高い順 + 構造単純な順」）

未移行 15 ツール（全 27 legacy − 移行済み 20 / `__tests__` 除く）から `email-validator` を選定した。数値は **PM 実測値**（生成元併記）。T-1 で builder が独立再実測して照合する（AP-P16）。

- **未移行 15 件 / 移行済み 20 件 / legacy 総数 27 件**（実測値 / 生成元 = `comm -23 <(ls -d "src/app/(legacy)/tools/"*/ | xargs -n1 basename | sort) <(ls -d "src/app/(new)/tools/"*/ | xargs -n1 basename | sort)`）。未移行 15 件 = age-calculator / bmi-calculator / business-email / color-converter / csv-converter / date-calculator / dummy-text / **email-validator** / json-formatter / markdown-preview / number-base-converter / sql-formatter / unit-converter / unix-timestamp / yaml-formatter。
- **GA4 直近 30 日 PV（2026-05-01〜05-31 / 生成元 = GA4 property 524708437 / screenPageViews / pagePath BEGINS_WITH `/tools/`）**: 未移行 15 件は **すべて 0 PV**（観測された PV は移行済みツールのみ = keigo-reference 22 / traditional-color-palette 10 / line-break-remover 3 等）。→ 主基準「直近 30 日 PV 高い順」では未移行 15 件が並ぶため、副基準「全期間 PV + 構造単純な順」で選定する（cycle-218 と同じ判断枠組み。前サイクルは cron-parser が直近 30 日 1 PV で 1 位だったが、それも移行済みになり、残りは全件休眠）。
- **GA4 全期間 PV（2026-02-14〜05-31 / 同 property）**: 未移行 15 件のうち **sql-formatter 12 / email-validator 7 / json-formatter 4 / color-converter 3 / business-email 2 / dummy-text 2 / date-calculator 1 / number-base-converter 1 / 残り 7 件 0**。
- **構造の単純さ（実測値 / 生成元 = `wc -l` + `grep import`）**: sql-formatter は全期間最多（12）だが `logic.ts` 634 行（SQL 整形ロジック）で構造が最も重く、副基準「構造単純な順」で劣る（cycle-218 と同じ判断 = 重い構造はアーキタイプ学習効率の観点で後半に回す）。email-validator は全期間 2 位（7）かつ Component.tsx 93 行 / logic.ts 169 行 / Component.module.css 137 行の **最小規模・外部依存なし・Worker なし**で、副基準内で PV 上位かつ構造単純を両立する。json-formatter（4 / logic.ts 45 行）も軽量だが PV で email-validator に劣る。→ **email-validator が第 20 弾に最適**。
- **アーキタイプ（系統論ドラフト / T-1 で確定）**: cron-parser（cycle-218 = 入力→解析→構造化表示型 = 第 6 アーキタイプ）の派生として、メール文字列 1 本を入力 → **妥当性の真偽判定（valid/invalid）+ 不備理由 + ローカル部/ドメイン部の内訳表示**という「**入力→検証→結果表示型**」。解析系（内訳展開が主）と異なり真偽判定が主軸である点が分かれ目。新アーキタイプか cron-parser 系の一種かは T-1 で言語化する。
- **トークン/hex 実測（要 T-1 照合 / 生成元 = `grep`）**: 旧 `var(--color-*)` 系 **10 箇所**（`--color-bg`×1 / `--color-bg-secondary`×1 / `--color-border`×2 / `--color-primary`×2 / `--color-text`×2 / `--color-text-muted`×2）。**＋ hex 13 箇所**（検証結果ステータス色 = 成功 `#dcfce7`/`#166534` / エラー `#fef2f2`/`#991b1b`/`#fca5a5` / 警告 `#fde68a`/`#fefce8`/`#92400e` / 情報 `#93c5fd`/`#eff6ff`/`#1e40af`）。hex はステータス色のため cycle-211〜213 で確立した hex → セマンティックトークン（`--success`/`--danger`/`--warning`/`--accent` 系）マッピングが効く。`var(--font-mono)`×2（L24/L85）は保持（置換対象外）。
- **既存資産（実測値）**: テストは `__tests__/logic.test.ts` のみ（16 件 / `Component.test.tsx` 不存在 = 前例どおり後続 P4 起票）。logic 公開 API = `validateEmail(email): EmailValidationResult` / `parseEmailParts`。legacy 詳細ページ 3 ファイル（page.tsx / opengraph-image.tsx / twitter-image.tsx）。`tilesCount` 現在 19 → +1 = 20。

## 実施する作業

標準 4 タスク（T-1 → {T-2, T-3} → T-4）で進める。各タスクは独立 builder を想定し、依存関係（T-1 → T-2 / T-1 → T-3 / (T-2, T-3) → T-4）に従う。各タスク完了時に必ず reviewer のレビューを受け、指摘を解消してから次へ進む。詳細は次の `/cycle-planning` で確定する。

- [ ] **T-1 ベースライン撮影 + 実測 + 引用採否 + 系統論言語化**: legacy 詳細ページの Playwright baseline スクショ（w360/w1280 × light/dark + 固有状態 = 有効メール入力時の検証結果・無効メール時のエラー・パーツ内訳表示 / dark が silent-light 化していないことを実機目視 = AP-WF12）、旧トークン 10 箇所 + hex 13 箇所の独立再実測・照合、テスト件数・`Component.test.tsx` 不存在確認、`tilesCount` 実測、legacy 詳細 3 ファイル位置確認、logic 公開 API（`validateEmail` / `parseEmailParts` / 型 `EmailValidationResult`）の再利用前提照合、先行 SSoT 引用採否の機能カテゴリ並べ読み表（AP-WF14）、「入力→検証→結果表示型」アーキタイプの系統論言語化と AP-P21 計測ケース定義のドラフト。
- [ ] **T-2 詳細ページ `(legacy)`→`(new)` 移行 + デザイン適用**: 詳細ページ 3 ファイルの git mv、import パス修正、`page.module.css` 標準パターン新設（`max-width:1200px;margin:0 auto` ハードコード）、`Component.module.css` の旧トークン 10 箇所 + hex 13 箇所の置換（T-1 マッピング表ベース / セマンティックトークン化 / `--font-mono` は保持）、`trustLevel` 据え置き、視覚確認（移行前後 w360/w1280 × light/dark）。
- [ ] **T-3 タイル新規実装 + テスト + 型契約 + 登録**: `EmailValidatorTile.tsx`（`kind:"widget"` = インラインスタイルのみ）の実装、デフォルト表示の初期値（決定論的固定値で hydration-safe）、操作側（メール入力欄 + 例プリセット等 / 40px 下限）と膨張側（検証結果 + 理由 + パーツ内訳）の役割分担（AP-P21）、`EmailValidatorTile.test.tsx` 新設、meta/registry の型契約記入、`TILE_DECLARATIONS` 登録 + `generate:tiles-registry` 実行 + tilesCount +1 = 20 確認、タイル単独レンダリング検証（`/internal/tiles/preview/...` を w360/w1280 × light/dark）。
- [ ] **T-4 AP-P21 実機計測 + SSoT 書き戻し + 起票 + 完了**: 「入力→検証→結果表示型」計測ケースでの操作側 40px 下限 + 膨張側収納安定の確定、SSoT を §補足事項に書き戻し、新規 B 番号起票（Component テスト基盤 / 必要に応じてアーキタイプ N≥3 見直し等）、4 コマンド（lint / format:check / test / build）全 PASS、スクショ整理、B-314 進捗欄を「20 件目完了」に更新（完了フリップは /cycle-completion の責務）。
- [ ] 各タスクのレビュー（計画・実装 各フェーズ）と指摘事項の対応。

依存: T-1 → T-2 / T-1 → T-3 / (T-2, T-3) → T-4。

## 作業計画

<plannerが立案した作業の詳細な実施計画をここに記載する。何を何のためにどのようにやるのかを具体的に書き、作業を進めながら方針が変わった場合は随時アップデートすること。>

### 目的

#### 誰のために

- **主: 特定の作業に使えるツールをさっと探している人**（`docs/targets/特定の作業に使えるツールをさっと探している人.yaml` / M1a）: 検索からの初回来訪者で、入力フォームに打とうとしている / 名刺・書類・聞き取りで得たメールアドレスが「形式として正しいか」「タイポしていないか」を今すぐ確かめたい人。likes「開いた瞬間に入力欄が見えてすぐ使える」「余計な説明・装飾がない」「ミスが起きやすい部分を素早く確認する」に直撃する。提供価値の核心は「**タイルを開く → アドレスを入力（または貼り付け）→ 有効/無効の判定とタイポ修正提案が即座に表示される**」が、スクロールも検証ボタンの明示クリックもなしに完結すること。とくに本ツール固有の最大差別化機能である**タイポ修正提案（did-you-mean / `gmial.com`→`gmail.com` 等）**を、入力欄直下に即時提示する点が M1a の needs に応える（research §1-5・§2・§7）。
- **副: 気に入った道具を繰り返し使う人**（`docs/targets/気に入った道具を繰り返し使っている人.yaml` / M1b）: 「同じ入力に対して前回と同じ結果が返る」「URL が変わらず迷わず戻れる」を重視する層。移行後も `/tools/email-validator` の URL を Route Group で維持し（dislikes「URL 変更でたどり着けない」回避）、検証結果が**完全に決定論的**（同じアドレス → 同じ判定・同じ提案 / `new Date()`・乱数を一切使わない = 実装値 / 生成元 = `src/tools/email-validator/logic.ts` 全行精査）であることが needs に合致する。前回値の localStorage 保持は別系統（B-433 系）であり**本サイクル対象外**。

#### 何のためにやるのか / どんな価値を提供するか

1. **新デザイン詳細ページ移行（来訪者価値）**: 詳細ページは現状 `(legacy)` 配下にあり（実測値 = `ls "src/app/(legacy)/tools/email-validator/"` で page.tsx / opengraph-image.tsx / twitter-image.tsx の 3 ファイルを確認 / `(new)` 配下は不在 = `ls "src/app/(new)/tools/email-validator/"` で NOT PRESENT）、新トークン体系・新フォントの恩恵が来訪者にまだ届いていない。`Component.module.css` の旧 `var(--color-*)` 10 箇所 + ステータス色 hex 13 箇所を新トークン体系（セマンティックトークン）へ移行する。ステータス色 hex は **cycle-211〜213 で確立した hex → セマンティックトークン化**（`--success`/`--danger`/`--warning`/`--accent` 系）が効くため、ハードコード hex が新デザインのライト/ダーク両モードに自動追従し、ダーク可読性が改善する（cron-parser の旧 CSS は dark 定義済みだったのに対し、本ツールの hex はモード追従しないハードコードである点が移行価値の主眼 = T-1 で実機確認）。
2. **タイル動線による最短 UX = M1a 需要への直接応答**: 「タイルを開く → アドレスを確認/入力 → 判定とタイポ提案を読む → 必要なら修正提案を採用 or コピー」という最短往復を、yolos.net トップから 1 タップで起動できるタイルとして提供する。とくに **デフォルト初期値をタイポ例（`test@gmial.com` 等）にする**ことで、開いた瞬間から「もしかして: test@gmail.com」という最大差別化機能をゼロ秒で体験できる（research §6）ことが、M1a の「空っぽ画面を避け即価値」needs に直撃する。
3. **「入力→検証→結果表示型」タイルの系統論確立（B-314 / B-471 への波及）**: 全 27 legacy ツール中 20 件目（移行済み 19 件 / 直近 cycle-218 = cron-parser = 入力→解析→構造化表示型 = 第 6 アーキタイプ）。本ツールは「**1 本のメール文字列を入力 → 妥当性の真偽判定（valid/invalid）+ 不備理由/警告/タイポ提案 + ローカル部/ドメイン部の内訳に展開**」する型。PM の見立て = 真偽判定が主軸である点は解析系（内訳展開が主軸）と分かれ目だが、「入力 → 処理 → 構造化表示」の骨格と「有効/無効で出力構造が変わる」点（c218-δ と対応）が共通し、**cron-parser と同一アーキタイプの N=2 とみなし B-471（出力構造変化率 N≥3 見直し）へ蓄積するのが自然**。ただし planner は logic を独立精査した上で、この見立て（同一 N=2 か / 別の第 7 アーキタイプか）を T-1 で原文照合して言語化・確定する。
4. **品質・信頼性配慮（憲法 rule 2,3,4）**: メール形式に不慣れな M1a に対し、エラー理由を平易な日本語で提示し（既存 logic がすでに日本語）、断定表現（「このアドレスは届きます」等）を避けて「形式検証のみ・MX/SMTP 検証なし」を小注記で正直に示す（research §7）。`trustLevel` は本サイクルでは据え置く（必須フィールドで全 legacy 保持 / 完全削除は B-432 で Phase 8.1 全完了後に一括 / 漸進削除は AP-I02 抵触 / cycle-217 T-2 r1 確立方針）。

#### 数値 literal の 4 分類ラベルと生成元併記の徹底（AP-P16）

本計画書および後続タスクで登場するすべての数値 literal には「実測値 / 仕様値 / 実装値 / 推定値・経験的暫定値」の 4 分類ラベル + 生成元（コマンド / ファイルパス + 行番号 / 出典 URL）を直近に併記する。トークン置換内訳（旧 `var(--color-*)` 10 箇所 + hex 13 箇所 + `--font-mono`×2）・テスト件数（logic.test.ts 16 件）・`tilesCount`（現 19）・legacy 3 ファイル位置・logic 公開 API は **planner が実測照合済みの実測値**（生成元 = 後述 T-1 のコマンド群）であり、T-1 で builder が独立再実測して照合・確定する（乖離時は実測値を採用し計画を訂正 / AP-P16・AP-WF12）。サイズ系（recommendedSize / 各セクション高さ等）は先行 SSoT が薄いため**推定値**として hedge し、実 SSoT は T-4 実機計測で確定して §補足事項に書き戻す（AP-P20）。

### 作業内容

標準 4 タスク（T-1 → {T-2, T-3} → T-4）で進める。T-1 が baseline と引用採否・系統論を確定し、T-2（詳細ページ移行）と T-3（タイル実装）は T-1 完了後に並行可能、T-4 が両者の合流点で計測・完了処理を行う。各タスクは独立 builder を想定し、各タスク完了時に必ず reviewer のレビューを受け指摘を解消してから次へ進む。**T-2 と T-3 は触るファイルが重複しない**（T-2 = 詳細ページ 3 ファイル + `Component.module.css` / T-3 = 新規 `EmailValidatorTile.tsx` + tile-declarations + 生成 registry）ため並行アサイン可能だが、tile-declarations / 生成 registry は T-3 のみが触る（AP-WF07 / AP-WF13）。

#### T-1: ベースライン撮影 + 実測 + 引用採否 + 系統論言語化

- legacy 詳細ページ（`/tools/email-validator`）の Playwright baseline スクショを take-screenshot スキルで取得（w360 / w1280 × light / dark + 固有状態 = タイポアドレス入力時の「有効＋候補」/ 無効アドレス入力時のエラー / 有効アドレス時のパーツ内訳）。**ダークスクショは cycle-216 の B-463 修正済み手順（`docs/knowledge/nextjs.md §10` = localStorage 事前注入 + `waitForFunction` で `<html class="dark">` 確認 + 失敗時 `_dark-FAILED` リネーム & 非ゼロ終了）に従い、silent-light 化していないことを実機目視で確認する**（AP-WF12）。とくに本ツールの hex はモード追従しないハードコードのため、legacy dark でステータス色が浮く（明色背景のまま）実態を確認し、移行価値の根拠とする。
- 旧トークン / hex を grep で実測し、後述 T-2 のトークン置換マッピング表（旧 `var(--color-*)` 10 箇所 + hex 13 箇所）を独立再実測して照合確定する（planner 照合済みの実測値と乖離時は実測値を採用）。**hex はフォールバック形式・短縮記法（`#fff` 等）も拾えるよう grep し、機械的 sed で `--font-mono`×2（L24/L85）を巻き込まない**点を T-2 への注意事項として明記する。
- **hex → セマンティックトークン マッピングの実在性照合（最重要 / AP-WF12）**: `src/app/globals.css` を `Read` し、マッピング先トークンが**ライト/ダーク両ブロックに実在する**ことを確認する。planner 照合済みの実在トークン（生成元 = `grep -nE "\-\-(success|warning|danger|accent|bg|fg|border)[a-z-]*\s*:" src/app/globals.css`）= `--success`/`--success-strong`/`--success-soft` / `--warning`/`--warning-strong`/`--warning-soft` / `--danger`/`--danger-strong`/`--danger-soft` / `--accent`/`--accent-strong`/`--accent-soft`（ライト = `--accent` 系 L31-33 + status 系 L36-46 = L31-46 / ダーク = `--accent` 系 L117-119 + status 系 L122-132 = L117-132 に実在）。**`--info` は globals.css に存在しない**（実測値 / 生成元 = 同 grep で hit せず）ため、青系の `.suggestionList`（`#93c5fd`/`#eff6ff`/`#1e40af`）は `--info` ではなく **`--accent` 系にマッピングする**（実在しないトークン名を計画・実装に書かない）。
- 既存テスト = `__tests__/logic.test.ts`（実測値 = 16 件 / 生成元 = `grep -cE "\b(it|test)\(" src/tools/email-validator/__tests__/logic.test.ts`）、`Component.test.tsx` の不存在を `ls` で確認する。
- `tilesCount`（実測値 = 19 / 生成元 = `grep -oE "tilesCount[^,;]*" src/tools/generated/tiles-registry.ts`）を確認する（追加後 = 実測 19 + 仕様上 +1 = 20）。
- legacy 詳細ページ位置（page.tsx / opengraph-image.tsx / twitter-image.tsx の 3 ファイル / `(new)` 不在）を `ls` 確認する。
- logic 公開 API（`validateEmail(email): EmailValidationResult` / `parseEmailParts` / 型 `EmailValidationResult = { valid, localPart, domain, errors[], warnings[], suggestions[] }`）の再利用前提を `Read` で照合する。特に **(i) 完全に決定論的（`new Date()`・乱数を使わない / 同じ入力 → 同じ出力 = 実装値 / `logic.ts` 全行）**、**(ii) errors/warnings/suggestions の 3 配列の意味（errors=無効理由 / warnings=有効だが注意 / suggestions=タイポ提案 = `COMMON_TYPOS` 13 ドメイン固定辞書 `logic.ts:11-25`）**、**(iii) suggestions は「もしかして: user@gmail.com」形式の完成済み文字列（`logic.ts:157`）= 修正後アドレスはこの文字列のパースで取り出すかタイル側で再計算するかを T-3 builder が判断**、の 3 点を確認し、タイル設計の前提に取り込む（新規依存・別ロジックは追加しない＝再利用・最短 UX 原則）。
- **先行 SSoT 引用採否の機能カテゴリ並べ読み表（AP-WF14）**を作成する。後述「論点 E」の表を、cycle-210 (i) / cycle-211 (x) / cycle-218 c218-α〜δ / cycle-217 系の各原文行を `Read` して独立に照合し、「入力→検証→結果表示型」への引用適用可否を表形式で確定する。**とくに c218-δ（出力構造変化率の独立軸 / B-471）が本ツールにそのまま N=2 として積めるかを精査する**。
- **系統論の言語化 + AP-P21 計測ケース定義のドラフト**: 「入力→検証→結果表示型」が cron-parser「入力→解析→構造化表示型」と同一アーキタイプの N=2 か別の第 7 アーキタイプかを、logic と前例タイルの原文を `Read` した上で独立に判断・言語化する（PM 見立て = 同一 N=2 / B-471 蓄積だが、planner が原文照合して確定）。操作側（入力欄 + 提案採用ボタン + 提案コピーボタン + 折りたたみトグル）と膨張側（判定バッジ + 理由/警告/提案 + パーツ内訳）の二分構造、および「**有効↔無効↔警告で出力構造が変わる変化率**」（c218-δ「有効式↔無効式の出力構造変化率」と同型の独立軸 / 変換系 (v) の入力量変動とは別軸 / 変換系 (v) の N には積まない）を定義する。
- **本ツールが cron-parser と決定的に異なる点の明記（系統論の核）**: cron-parser は次回実行が `new Date()` 依存で hydration mismatch リスクがあり useEffect 差し込み（c217-δ / 論点 F）が必須だった。**本ツールは検証結果が完全に決定論的なため、デフォルト初期値を固定文字列にすれば検証結果も即時表示で完全に hydration-safe**（`useEffect` 差し込み不要 / `docs/knowledge/nextjs.md §4`）。この差を系統論で対比し、cron-parser の論点 F は本ツールには発生しないことを明記する。

#### T-2: 詳細ページ `(legacy)`→`(new)` 移行 + デザイン適用

- `src/app/(legacy)/tools/email-validator/` 配下 3 ファイル（page.tsx / opengraph-image.tsx / twitter-image.tsx）を `(new)/tools/email-validator/` へ **git mv** し、import パスを修正する。URL は Route Group のため不変（M1b の dislikes 回避）。
- `page.module.css` を標準パターンで新設し、`max-width:1200px;margin:0 auto` を**ハードコード**する（`var(--max-width)` は (new) 未定義のため使えない / 実装値根拠は cycle-217/218 T-2 の確立パターン）。
- `Component.module.css` の旧トークン（実測値 = 旧 `var(--color-*)` 10 箇所 / 生成元 = `grep -oE "var\(--color-[a-z-]+" src/tools/email-validator/Component.module.css | sort | uniq -c`）+ hex 13 箇所（実測値 / 生成元 = `grep -noE "#[0-9a-fA-F]{3,6}" ...`）を下記マッピング表に従い新トークンへ置換する（T-1 で builder が独立再実測して照合確定 / 短縮記法・機械的 sed の漏れに注意）。詳細ページ Component.tsx 自体はトークン置換以外変更しない。

  **トークン置換マッピング表（実測値 / 生成元 = 上記 grep / T-1 で照合確定 / マッピング先は globals.css 実在確認済み）**:

  | 旧トークン / hex                                       | 箇所数（実測値） | 新トークン                                          | 用途                                                     |
  | ------------------------------------------------------ | ---------------- | --------------------------------------------------- | -------------------------------------------------------- |
  | `--color-bg`                                           | 1                | `--bg`                                              | input 背景                                               |
  | `--color-bg-secondary`                                 | 1                | `--bg-soft`                                         | 結果カード背景                                           |
  | `--color-border`                                       | 2                | `--border`                                          | input / 結果カード枠                                     |
  | `--color-primary`                                      | 2                | `--accent`                                          | focus outline / border                                   |
  | `--color-text`                                         | 2                | `--fg`                                              | input / パーツ値テキスト                                 |
  | `--color-text-muted`                                   | 2                | `--fg-soft`                                         | ラベル                                                   |
  | `#dcfce7` / `#166534`（`.valid`）                      | 2                | `--success-soft` / `--success-strong`               | 有効バッジ 背景 / 文字                                   |
  | `#fef2f2` / `#991b1b`（`.invalid`/`.errorList`）       | 4                | `--danger-soft` / `--danger-strong`                 | 無効バッジ・エラー 背景 / 文字                           |
  | `#fca5a5`（`.errorList` border）                       | 1                | `--danger`                                          | エラーカード枠                                           |
  | `#fde68a` / `#fefce8` / `#92400e`（`.warningList`）    | 3                | `--warning` / `--warning-soft` / `--warning-strong` | 警告 枠 / 背景 / 文字                                    |
  | `#93c5fd` / `#eff6ff` / `#1e40af`（`.suggestionList`） | 3                | `--accent` / `--accent-soft` / `--accent-strong`    | 提案 枠 / 背景 / 文字（`--info` は不在のため accent 系） |

  合計 = 旧 `var(--color-*)` 10 箇所 + hex 13 箇所 = 23 箇所。hex の bg/border/text のどれに各色が当たるかは L56-111 の文脈（background-color / border / color）を T-2 builder が照合して soft/strong/base を割り当てる（上表は planner の照合済み割り当て / T-1 で確定）。

- **`var(--font-mono)` は置換対象外**: `Component.module.css`（実測値 = L24 `.input` / L85 `.analysisValue` の 2 箇所 / 生成元 = `grep -n "font-mono" ...`）にあるが、`--font-mono` は新デザインの `src/app/globals.css` に定義済みで (new) でも有効。**置換内訳 23 箇所には含めない**（builder が漏れと誤認したり機械的 sed で巻き込んだりしないこと）。
- **`trustLevel` は据え置く（削除しない）**: 上記「目的」4 に記載の確立方針。
- 視覚確認: take-screenshot スキルで移行前後を w360/w1280 × light/dark で撮影し、デザイン適用と dark モードが新トークン体系で正しく機能すること（とくに**ステータス色 hex → セマンティックトークン化により dark でステータス色背景がモード追従し可読性が改善**したこと）を実機目視する。

#### T-3: `EmailValidatorTile.tsx` 新規実装 + テスト + 型契約 + 登録

タイル中核機能（来訪者価値最大化 / `kind:"widget"` = **CSS Module 不可・インラインスタイルのみ** = 既存 19 件の確立規約 / codegen 制約 = `animation-conventions.md`）:

1. **既存 logic.ts の再利用**: タイルは既存 `validateEmail` / `parseEmailParts` / 型 `EmailValidationResult` を再利用し、**新規依存・別検証ロジックは追加しない**（再利用・最短 UX 原則）。タイポ提案は `result.suggestions`（`COMMON_TYPOS` 由来）をそのまま使う。
2. **デフォルト初期値と hydration 安全性（論点 D で 3 案比較し採択）**: タイルを開いた瞬間にタイポ例（`test@gmial.com` 等 / research §6 推奨 = 最大差別化機能を即提示）が入力済みで、判定バッジ・パーツ内訳・タイポ提案が**即時表示**された状態にする。**検証結果は完全に決定論的**（`validateEmail` は `new Date()`・乱数を使わない = 実装値 / `logic.ts` 全行）なので、`useState("<タイポ例>")` の固定初期値で SSR/クライアント初回描画が一致し**完全に hydration-safe**（`useEffect` 差し込み不要 / `docs/knowledge/nextjs.md §4`）。**cron-parser の論点 F（次回実行が `new Date()` 依存で useEffect 必須だった件）は本ツールには発生しない**ことを実装コメントに明記する。
3. **役割分担（タイルの構造 / AP-P21 原則）**: 操作側（メール入力欄 + 提案採用ボタン + 提案コピーボタン + 折りたたみトグル = `flexShrink:0` / minHeight 40px）と膨張側（判定バッジ + 理由/警告/提案リスト + パーツ内訳 = `flex:1` + `overflowY:auto` + `min-height:0`）に二分する（cycle-218 c218-α/β の確立構造を踏襲）。
4. **情報優先度 4 層（論点 B の採択案 / research §3・§8）**: ①入力欄 + 判定バッジ（背景色 + アイコンの二重符号化 = 色覚多様性対応 / 常時・最大）→ ②タイポ提案（筆頭・警告色でエラーと色分け / research §2,§8-2）+ エラー/警告理由（バッジ直下に即展開）→ ③パーツ内訳（有効時のみ・コンパクト）→ ④詳細ルールチェック等は折りたたみ。
5. **ワンタップ採用 + コピー（論点 C の採択案 / research §1-5,§4,§8-7）**: タイポ提案を**クリック（採用）すると入力欄を修正済みアドレスで上書き**し、再検証が即走る。提案アドレスは**このツールで唯一コピーが有効な対象**（入力値・判定ラベル・パーツ内訳のコピーは不要 = research §4）であり、採用ボタンとコピーボタンを並立させる。コピーフィードバックは**ボタンのインプレース変化**（トースト不使用 = レイアウト不変 / cycle-211 (x) 引用 / research §4 タイトルの「トースト」ではなく当サイト確立方針に従う旨を T-3 builder に明示）。
6. **リアルタイム検証の debounce 要否**: 検証は決定論的・即時（0 遅延）でレイアウト膨張も `overflowY:auto` で収納されるため、cron-parser・regex-tester の前例（キー入力ごと即時再検証 / debounce なし）に整合させる方向を第一候補とする。debounce の要否最終判断は T-3 builder が前例を `Read` 確認して決める（research §2 は提案表示に 300ms debounce を挙げるが、当サイト前例の即時再検証で UX が成立しているなら不要 = 細部は AP-P20 で実装判断）。

- 論点 A〜D の最終採択案は「検討した他の選択肢」の推奨案に従う。面積に依存する細部（バッジのフォントサイズ / プリセット例を置くか / 折りたたみ UI 形態 / 提案ボタンと入力欄の配置 / debounce 値）のみ T-3 実機の面積を見て確定する（計画段階では確定しない / AP-P20）。
- **型契約（Phase 7.1）**: `TILE_DECLARATIONS`（`src/tools/_constants/tile-declarations.ts`）に `domain:"tools"` / `slug:"email-validator"` / `kind:"widget"` / `tileComponent` 参照 / `recommendedSize`（cols/rows = 論点 A 採択値）/ `inputPlaceholder` / `outputPlaceholder` / `detailPath:"/tools/email-validator"` / `widgetSummary` を埋める。**tile-grid 定数（TILE_CELL_PX / calcTilePixels）を参照し数値直書きしない**（cron-parser エントリ L328-344 と同型）。
- `npm run generate:tiles-registry` 実行 + tilesCount が +1 = 20（実測 19 + 仕様上 +1）されたことを確認する。
- `EmailValidatorTile.test.tsx` を新設する（デフォルトのタイポ例で判定バッジ・パーツ内訳・タイポ提案が**即時表示**される / 別アドレス入力後の更新 / 無効アドレスのエラー表示 / 提案ワンタップ採用で入力欄が上書きされ再検証される / 提案コピー + インプレース FB / 折りたたみ開閉等の観点）。**Component.test.tsx 不存在は後続 P4 で起票予定**（cycle-218 B-470 系の系譜 / 本サイクルでは新設しない）。
- タイル単独レンダリング検証を `/internal/tiles/preview/tools/email-validator` で行い、w360/w1280 × light/dark で実機目視する。**初回描画で hydration warning 0 件**（決定論的なので即時表示でも mismatch しないことの実機確認）。

#### T-4: AP-P21 実機計測 + SSoT 書き戻し + 起票 + 完了

- **AP-P21 適用方針（系統論を計画書で言語化 / 「入力→検証→結果表示型」）**:
  - 操作側（`flexShrink:0` / 下限 40px）= メール入力欄 / 提案採用ボタン / 提案コピーボタン / 折りたたみトグル。cycle-210 (i)「下限 40px」（SSoT 引用 = `docs/cycles/cycle-210.md:292`）+ c218-α（操作側 40px 下限）を引用適用。
  - 膨張側（`flex:1` + `overflowY:auto` + `min-height:0`）= 判定バッジ + 理由/警告/提案 + パーツ内訳。**膨張側の枠内収納安定**（枠内収納 / CLS 抑制 / 折りたたみ開閉時のレイアウト安定）を計測する（c218-β 引用適用）。
  - **コピーボタン文言変化は AP-P21 適用外**: cycle-211 (x)（SSoT 引用 = `docs/cycles/cycle-211.md:586`）+ c218 引用適用。
  - **「有効↔無効↔警告 出力構造変化率」（本型の固有論点 / 独立軸）**: c218-δ「有効式↔無効式の出力構造変化率」（`docs/cycles/cycle-218.md` §補足 c218-δ）と同型の独立軸として計測する。本ツールは valid/invalid に加え**警告（有効だが warnings あり）+ 提案（warnings/suggestions あり）**という中間状態も持つため、cron-parser（有効/無効の 2 値）より構造変化のバリエーションが豊富。これを変換系 (v)（入力量変動）と同一視せず、**c218-δ と同一アーキタイプ N=2 として B-471 へ蓄積する**（PM 見立て / T-1 で系統論確定 / 変換系 (v) の N には積まない = cycle-216 CRIT 教訓）。
  - **計測ケース（ドラフト / T-1 で確定）**: (1) デフォルトのタイポ例（有効 + 警告 + 提案表示 = 膨張最大に近い）/ (2) 完全有効アドレス（提案・警告なし = パーツ内訳のみ）/ (3) 無効アドレス（エラー表示 = 提案/内訳なし）/ (4) 空入力（結果なし = 膨張ゼロ相当）/ (5) 折りたたみ展開後 / (6) 提案採用・コピー後。**操作側 40px 下限は全ケースで確認**し、膨張側の枠内収納は膨張最大ケース（折りたたみ全展開 + 提案 + 警告 + 内訳）を基準点として判定する。
  - **新規確立する SSoT 候補（入力→検証→結果表示型 = cron-parser と同一アーキタイプの N=2 想定）**: (A) 操作側要素 40px 下限 / (B) 膨張側の収納安定 / (C) 出力構造変化率（独立軸 = c218-δ の N=2 として記録）。
  - **適用対象外と明記する SSoT**: 複合入力型 (v) ±15%（cycle-210）/ 単一 textarea 型 ±10%（cycle-209）/ B-452 / B-456 / B-468 = 計測軸が別系統。**localStorage 前回値保持（B-433 系）も適用対象外**。
  - **論点 F 相当（hydration）は N/A**: 本ツールは完全決定論的で初回描画から即時表示しても mismatch しないため、cron-parser の論点 F（2 状態遷移 / useEffect 差し込み）に相当する計測は不要であることを明記する（cron-parser との差を SSoT に系統論として記録）。
  - SSoT 引用採否は AP-WF14 に従い T-1 で「機能カテゴリ別 表形式 並べ読み」で独立確認する。
- 4 コマンド（lint / format:check / test / build）全 PASS。**B-466 留意**（`tmp/` 配下の使い捨て `.ts` が typecheck/build を壊さないこと）+ **dev サーバ起因の `.next/dev/types/validator.ts` 破損**（cycle-217/218 知見）に留意し、コミット前に dev サーバ停止 + `rm -rf .next/dev` してから typecheck/commit する。
- スクショ取得（タイルプレビュー + after + AP-P21 計測ケース分）を実機目視で整理する。
- **新規 backlog 起票（前例 B-470 系）**: (i) email-validator **Component テスト基盤整備**（P4 / 着手条件なし / Component.test.tsx 不存在 = B-470 系の系譜）/ (ii) **B-471 への N=2 蓄積反映**（既存 B-471「入力→解析→構造化表示型 出力構造変化率 N≥3 見直し」に本サイクルで N=2 を積んだ旨を反映 / 新規起票でなく既存更新の可能性を T-4 で判断）。出力構造変化率が計測可能と確定した場合は独立軸の SSoT に N=2 記録し、想定外の差異（別アーキタイプと判断される等）があれば T-1 系統論結論に従って起票形態を調整する。
- B-314 進捗欄を「20 件目完了」に更新（**完了フリップ・Target Cycle 更新・completed_at・チェックリストは `/cycle-completion` の責務** / T-4 据え置きは cycle-216〜218 と同じ確立パターン）。

#### 作業中の注意点（品質チェックリスト）

- **CSS トークン置換は詳細ページ（Component.module.css）のみ**。タイルは CSS Module 不可・インラインスタイルのみ。置換内訳（旧 10 箇所 + hex 13 箇所）は**実測値**で T-1 照合（AP-P16）。**`--info` は globals.css に存在しないため青系は `--accent` 系へ**（実在しないトークン名を書かない / AP-WF12）。
- **AP-I11**: 提案コピーの `setTimeout` cleanup をタイル側で漏らさない（インプレース FB の戻し処理 / `useRef` 保持 + `useEffect` cleanup）。
- **AP-I10**: アニメーション追加時は `@keyframes` を `globals.css`（グローバルスコープ）に置く。
- **AP-P16**: 数値 literal にラベル + 生成元を直近併記。
- **AP-WF12**: 実体確認せず「存在/完了」を書かない（dark スクショの silent-light、tilesCount、テスト件数、トークン実在性、logic 挙動等）。
- **B-466 / dev サーバ validator.ts**: `tmp/` 配下 `.ts` が typecheck/build を壊さない / コミット前に dev サーバ停止 + `rm -rf .next/dev`。
- **視覚確認**: take-screenshot で移行前後・タイル単独を w360/w1280 × light/dark で撮影し実機目視。dark は silent-light 化しない（AP-WF12 / `docs/knowledge/nextjs.md §10`）。
- **hydration（cron-parser との差）**: 本ツールは完全決定論的でデフォルト初期値の検証結果を即時表示してよい（useEffect 差し込み不要）。cron-parser の論点 F は発生しない旨を実装コメントに残す。

#### どうなったら完成といえるか（完成条件）

- 4 コマンド（lint / format:check / test / build）が全 PASS する。
- タイルが単独で動作する（`/internal/tiles/preview/tools/email-validator` でデフォルトのタイポ例の判定バッジ・パーツ内訳・タイポ提案が即時表示 / 別アドレスでの更新 / 無効アドレスのエラー / 提案ワンタップ採用での入力欄上書き + 再検証 / 提案コピー + インプレース FB が機能 / tilesCount が +1 = 20）。
- **タイル初回描画で hydration warning が 0 件**（完全決定論的で即時表示しても mismatch しないことを fresh browser のコンソールで実機確認）。
- 詳細ページの旧トークンが消失している（残存 0 / 短縮 hex 含む / `--font-mono` は保持 / ステータス色 hex がセマンティックトークン化されダーク追従）。
- AP-P21 計測（計測ケース）が完了し、出力構造変化率（独立軸 / c218-δ の N=2）の適用可否が確定している。
- SSoT が §補足事項に書き戻されている。
- 視覚確認（移行前後・タイル単独 / light・dark 両モード）が実機目視で完了している。

### 検討した他の選択肢と判断理由

AP-P17 に従い、設計判断が分かれる論点（A〜D）について 3 案以上をゼロベースで列挙・比較し、M1a の最短 UX を基準に推奨案と根拠を示す。あわせて先行 SSoT の引用採否（論点 E）も整理する。本ツールは完全決定論的のため cron-parser の論点 F（hydration 安全形の選択）・論点 G（タイムゾーン虚偽表示）に相当する未解決論点は発生しない（その差自体を論点 D・系統論で言語化する）。

#### 論点 A: タイルサイズ（recommendedSize）

| 案                                                                         | 来訪者価値                                                                                                                                                                                                                                                       | 400px 系収まり                                                                                                                                                               | 採否       |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| rows=2（400×264 / 推定値 = tile-grid 定数 calcTilePixels より要 T-3 確定） | 縦が短く一覧性は高いが、操作側（入力欄 + 提案ボタン群）+ 膨張側（バッジ + 提案/エラー + パーツ内訳）を 264px に詰めると、タイポ例（有効 + 警告 + 提案 + 内訳）の全要素が同時可視できずスクロールが要る。research §3 の 4 層が崩れる。                            | 窮屈 / タイポ例の同時可視が困難。                                                                                                                                            | 不採用     |
| **rows=3（400×400）**                                                      | 操作側 + 膨張側を二分しても、判定バッジ（主役・大）+ タイポ提案 + エラー/警告 + パーツ内訳が折りたたみ閉時にスクロールなしで収まる縦余白を確保できる。cron-parser（c218-β = 折りたたみ閉 228px 収納）と同型規模で実績がある。research §3-§8 の優先度配分に整合。 | 収まる見込み（折りたたみ閉時）。                                                                                                                                             | **第一案** |
| rows=4（400×528 等）                                                       | 余白に最も余裕。                                                                                                                                                                                                                                                 | 縦に長すぎてトップのタイルグリッドで突出し、M1a の「開いた瞬間に全部見える」を損なう。詳細チェックは膨張側 `overflowY:auto` で内部スクロール収納できるため rows=3 で足りる。 | 不採用     |

**判断**: 操作側 + 膨張側（4 層）が折りたたみ閉時に収まり、cron-parser の同型規模（c218-β）で実績がある **rows=3（400×400）を第一案**とする。サイズ系は先行 SSoT が薄いため**推定値**として hedge し、実機の収まり（特にタイポ例の有効 + 警告 + 提案 + 内訳の同時可視）を T-3/T-4 で検証する（AP-P20）。

#### 論点 B: タイル内の情報優先度・主従と折りたたみ

| 案                                                                                            | 来訪者価値                                                                                                              | 400px 収まり                                                                                                                                   | 採否       |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 全要素を常時表示（判定 + 全エラー/警告/提案 + パーツ内訳 + 詳細ルール 14 件）                 | 情報網羅。                                                                                                              | 競合 VerifyForge が 14 ルールをフル展開し 400px に収まらない明確なアンチパターン（research §1-1）。M1a の「余計な説明がない」dislikes に抵触。 | 不採用     |
| **判定バッジ最大 + タイポ提案/理由を直下展開 + パーツ内訳（有効時）/ 詳細ルールは折りたたみ** | 判定が一目で読め、最大差別化のタイポ提案が筆頭に出る。詳細は不慣れな人だけが開く（research §3 の 4 層 / §8 指針 1-5）。 | 収まる（折りたたみ閉が初期 / 開は膨張側内部スクロール）。                                                                                      | **第一案** |
| 判定バッジのみ（理由・提案・内訳を省略）                                                      | 最小実装。                                                                                                              | タイポ提案（最大差別化 / research §6,§8-2）とエラー理由（M1a の「ミスを素早く確認」needs）を捨てるため核心価値が半減。                         | 不採用     |

**判断**: research §3 の情報優先度 4 層（①判定 → ②提案/理由 → ③内訳 → ④詳細折りたたみ）に整合し、競合のアンチパターン（フル展開）を回避する **「判定バッジ最大 + 提案/理由を直下展開 + 詳細は折りたたみ」を第一案**とする。折りたたみ UI 形態は T-3 実機の面積を見て確定する（AP-P20）。

#### 論点 C: コピー対象とワンタップ採用の並立

| 案                                                                                      | 来訪者価値                                                                                                                                                                                                                           | 400px 収まり                                                                                                                          | 採否       |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **提案アドレスのみコピー対象 + ワンタップ採用を並立（入力値・判定・内訳はコピー不可）** | research §4 = メール検証は「確認型」で来訪者は手元にアドレスを持つため、コピー価値があるのは**修正提案アドレスのみ**。採用（入力欄上書き）とコピー（外部へ貼る）の両動線を提案行に並立し、シナリオ A〜D（research §5）双方に応える。 | 収まる（提案行にボタン 2 個 / 提案がある時のみ出現）。                                                                                | **第一案** |
| 入力値・判定ラベルもコピー可                                                            | 一見親切。                                                                                                                                                                                                                           | 来訪者は自分で入力したものを既に持つため不要（research §4）。ボタン増で 400px 混雑。                                                  | 不採用     |
| ワンタップ採用のみ（コピー無し）                                                        | 最小。                                                                                                                                                                                                                               | 「別のクライアント/スプレッドシートに貼りたい」シナリオ（research §4,§5-B,C）を捨てる。提案コピーは唯一価値あるコピーなので残すべき。 | 次点       |

**判断**: research §4・§8-7 に整合し、**「提案アドレスのみコピー対象 + ワンタップ採用を並立」を第一案**とする。コピーフィードバックは当サイト確立方針（cycle-211 (x) インプレース変化 / トースト不使用）に従い、research §4 タイトルの「トースト通知」ではなく本文・当サイト方針に従う旨を T-3 builder に明示する。

#### 論点 D: デフォルト初期値と hydration 安全性（cron-parser 論点 F との対比）

| 案                                                               | 来訪者価値（価値伝達速度 = research §6）                                                                                                        | hydration 安全性                                                                                                                                                                                                                                      | 採否       |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **タイポ例（`test@gmial.com` 等）を初期値 + 検証結果を即時表示** | 開いた瞬間に「もしかして: test@gmail.com」という最大差別化機能をゼロ秒体験（research §6 = 価値伝達速度「高」）。採用 1 タップで使い方を学べる。 | **完全に hydration-safe**: `validateEmail` は決定論的（`new Date()`・乱数なし = 実装値 / `logic.ts` 全行）で、`useState("<タイポ例>")` の固定初期値で SSR/CSR 初回描画が一致。**cron-parser の論点 F（次回実行の useEffect 差し込み）は発生しない**。 | **第一案** |
| 有効例（`user@example.com`）を初期値                             | 緑「有効」が即見えるが「で、これ何に使うの？」となりがち（research §6 = 価値伝達速度「中」）。                                                  | 同様に hydration-safe。                                                                                                                                                                                                                               | 不採用     |
| 空欄（プレースホルダのみ）                                       | 何ができるか分かりにくい（research §6 = 価値伝達速度「低」）。M1a の「即価値」に反する。                                                        | hydration-safe（結果なし）。                                                                                                                                                                                                                          | 不採用     |

**判断**: research §6 で価値伝達速度が最も高い **「タイポ例を初期値 + 検証結果を即時表示」を第一案**とする。本ツールは完全決定論的のため即時表示でも hydration-safe であり、cron-parser が必要とした論点 F（決定論的 description は固定値 / 非決定論的な次回実行は useEffect 差し込み）の二分処理は不要。この差が「入力→検証→結果表示型」と「入力→解析→構造化表示型」の系統論上の重要な分かれ目であり、SSoT に記録する。具体的なタイポ例文字列（`test@gmial.com` が `COMMON_TYPOS` 辞書 `logic.ts:11-25` に存在することは確認済み = 実測値）は T-3 で確定する（AP-P20）。

#### 論点 E: 先行 SSoT の引用採否（AP-WF14 / T-1 で並べ読み確定 / 系統論）

機能カテゴリの並べ読みによる引用採否の見立て（T-1 で各原文行を `Read` して独立確認・確定）:

| SSoT 項目                                                                                | 引用採否の見立て               | 根拠 / 本型との関係                                                                                                                                                            |
| ---------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| cycle-210 (i) 40px 下限（`docs/cycles/cycle-210.md:292`）/ c218-α                        | 引用適用                       | 操作側（入力欄 / 採用 / コピー / トグル）の 40px 下限判定。                                                                                                                    |
| cycle-211 (x) コピーボタン文言変化 AP-P21 適用外（`docs/cycles/cycle-211.md:586`）/ c218 | 引用適用（適用外として記録）   | インプレース FB はレイアウト不変で AP-P21 対象外。                                                                                                                             |
| c218-β（膨張側 `flex:1 + overflowY:auto + min-height:0` の収納安定）                     | 引用適用                       | 膨張側（判定 + 理由/提案 + 内訳）の枠内収納安定判定。                                                                                                                          |
| c218-δ（有効式↔無効式 出力構造変化率の独立軸 / B-471）                                   | **引用適用（N=2 として蓄積）** | 本型は valid/invalid/警告/提案で出力構造が変わる。c218-δ と同型の独立軸で、PM 見立て = 同一アーキタイプの N=2 → B-471 蓄積（T-1 で系統論確定）。変換系 (v) の N には積まない。 |
| c217-δ / 論点 F（SSR 固定値 + useEffect 差し替え）                                       | **引用適用せず（本型は N/A）** | 本ツールは完全決定論的で `useEffect` 差し込み不要。即時表示で hydration-safe。cron-parser との差を系統論で対比記録。                                                           |
| cron-parser 論点 G（タイムゾーン虚偽表示 / B-472）                                       | 引用適用せず（無関係）         | 本ツールは時刻を扱わない。                                                                                                                                                     |
| 複合入力型 (v) ±15%（cycle-210）/ 単一 textarea ±10%（cycle-209）/ B-452 / B-456 / B-468 | 適用対象外                     | 計測軸が別系統。                                                                                                                                                               |
| B-433 系（localStorage 前回値保持）                                                      | 適用対象外（本サイクル外）     | 前回値保持は実装しない。                                                                                                                                                       |

**系統論の言語化（T-1 で原文照合し確定）**: 本ツールは「**1 本のメール文字列を入力 → 妥当性の真偽判定 + 不備理由/警告/タイポ提案 + ローカル部/ドメイン部の内訳に展開**」する型。cron-parser「入力→解析→構造化表示型」（第 6 アーキタイプ）との関係は、**(i) 真偽判定が主軸**（解析系は内訳展開が主軸）である点が分かれ目だが、**(ii) 入力 → 処理 → 構造化表示の骨格が共通**し、**(iii) 有効/無効で出力構造が変わる点が c218-δ と対応**する。PM の見立て = **同一アーキタイプの N=2 とみなし B-471 へ蓄積するのが自然**だが、planner が logic と前例タイルの原文を独立に読んで「同一 N=2 か / 別の第 7 アーキタイプか」を T-1 で確定・言語化する（AP-P15 = 直近成功体験への引きずられを避け、原文照合で判断）。**cron-parser との決定的な差は hydration**: cron-parser は次回実行が `new Date()` 依存で論点 F（useEffect 差し込み）が必須だったが、本ツールは完全決定論的で即時表示でも hydration-safe であり論点 F が発生しない。

### 計画にあたって参考にした情報

- `docs/cycles/cycle-219.md`（本ファイル前文 / 選定根拠 = GA4 直近 30 日 PV 未移行 15 件全 0 / 全期間 email-validator 7 で 2 位 / Component.tsx 93 行・logic.ts 169 行・最小規模・外部依存なし）
- `docs/research/2026-06-01-email-validator-tile-widget-ux-best-practices.md`（UX 調査 = 判定バッジ最大化 / タイポ提案筆頭・ワンタップ採用 / 情報優先度 4 層 / VerifyForge フル展開のアンチパターン / 初期値はタイポ例 / コピーは提案アドレスのみ / 一次資料 URL は同レポート front matter 参照）
- `docs/cycles/cycle-218.md`（直前 = cron-parser / 同型「入力→解析→構造化表示型」第 6 アーキタイプ / §補足 SSoT c218-α〜δ / AP-P21 適用方式 / 論点 A〜G の立て方 / 標準 4 タスク構成 / 数値ラベル運用 / dev サーバ validator.ts 知見 / B-470・B-471・B-472 起票）
- `docs/cycles/cycle-217.md`（c217-δ SSR 固定値 + useEffect 差し替え = 本ツールでは N/A な対比対象 / trustLevel 据え置き / page.module.css ハードコードパターン）
- `docs/cycles/cycle-216.md:93`（変換系 (v) = 入力量変動による高さ変化率 = 出力構造変化率と別軸であることの根拠）/ `docs/cycles/cycle-210.md:292`（(i) 40px 下限 SSoT）/ `docs/cycles/cycle-211.md:586`（(x) コピーボタン文言変化 AP-P21 適用外 SSoT）
- `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`（M1a 主）/ `docs/targets/気に入った道具を繰り返し使っている人.yaml`（M1b 副）
- `docs/anti-patterns/planning.md`（AP-P07 / AP-P15 / AP-P16 / AP-P17 / AP-P20 / AP-P21 を本計画に適用）+ `implementation.md`（AP-I02 / AP-I10 / AP-I11）+ `workflow.md`（AP-WF07 / AP-WF12 / AP-WF13 / AP-WF14）
- `docs/knowledge/nextjs.md`（§4 hydration-safe = 決定論的値は固定初期値で SSR/CSR 一致 = 本ツールが完全に該当し論点 F 不要の根拠 / §10 dark スクショ手順）
- `src/tools/email-validator/`（logic.ts = 公開 API `validateEmail`/`parseEmailParts`・型 `EmailValidationResult`・`COMMON_TYPOS` 13 ドメイン・完全決定論的を全行精査 / Component.tsx / Component.module.css / `__tests__/logic.test.ts` 16 件）+ `src/app/(legacy)/tools/email-validator/`（3 ファイル / `(new)` 不在を `ls` 実測）+ `src/tools/cron-parser/`（CronParserTile.tsx / meta.ts = 前例 / tile-declarations L328-344 エントリ）+ `src/tools/_constants/tile-declarations.ts` + `src/tools/generated/tiles-registry.ts`（tilesCount=19 実測）+ `src/app/globals.css`（セマンティックトークン実在照合 = `--success`/`--warning`/`--danger`/`--accent` 系の base/strong/soft がライト L31-46（`--accent` L31-33 + status L36-46）・ダーク L117-132（`--accent` L117-119 + status L122-132）に実在 / `--info` は不在）
- 実測コマンド（planner 照合済み / T-1 で builder 再実測）: `grep -oE "var\(--color-[a-z-]+" src/tools/email-validator/Component.module.css | sort | uniq -c`（旧 10 箇所）/ `grep -noE "#[0-9a-fA-F]{3,6}" ...`（hex 13 箇所）/ `grep -n "font-mono" ...`（L24/L85 の 2 箇所 = 置換対象外）/ `grep -cE "\b(it|test)\(" .../__tests__/logic.test.ts`（16 件）/ `ls` による詳細ページ位置・Component.test.tsx 不存在・(new) 不在確認 / `grep -oE "tilesCount[^,;]*" src/tools/generated/tiles-registry.ts`（19）/ `grep -nE "\-\-(success|warning|danger|accent|bg|fg|border)[a-z-]*\s*:" src/app/globals.css`（トークン実在 / `--info` 不在）

## レビュー結果

<作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。>

### 計画フェーズ（/cycle-planning）

- **r1（reviewer / 一次情報照合）**: CRIT/MAJOR 0 件で承認。トークン10箇所・hex13箇所・font-mono L24/L85・テスト16件・tilesCount19・logic完全決定論性・c218-δ N=1→N=2系統論・SSoT行引用・trustLevel据え置き・research整合をすべて一次情報照合し一致を確認。`--info` 不在のため青系suggestionListを`--accent`系へマッピングする方針の妥当性も確認。指摘は NIT 2 件（NIT-1 = globals.css行番号「L36-46」が`--accent`系L31-33を範囲外に漏らしていた / NIT-2 = 論点Eは引用採否照合のため3案比較対象外という確認事項）。
- **r1 対応**: NIT-1 を実体照合のうえ訂正（L66・L229 を「ライト L31-46（--accent L31-33 + status L36-46）/ ダーク L117-132」に正確化）。マッピング方針は不変。
- **r2（reviewer / 全体再走査）**: NIT-1 訂正を globals.css と再照合し完全一致を確認。計画全体を再走査し残存 CRIT/MAJOR/MINOR なし。**PASS**。実装フェーズ（T-1）へ進行可能。

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

## 補足事項

<追加で補足しておくべきことがあれば記載する。とくに無い場合は「なし」と記載する。>

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
