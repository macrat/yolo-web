---
id: 170
description: "B-308（デザインガイドラインとUIコンポーネント集の策定）を再挑戦する。Claude Designで作成済みのデザインシステム素地（docs/design-system-by-claude-design/）とClaude Code適用ベストプラクティス調査（docs/research/2026-04-23-*）を入力に、.claude/skills/frontend-design/ にデザインシステムドキュメントを、src/components/design-system/ に基本的な共通コンポーネント群（ヘッダー、フッター、パネル、ボタン、入力欄、記事エリア等の汎用要素）を作成する。色名・角丸・余白などの定数はCSS変数で管理。素地ディレクトリは内容を移行先に取り込んだうえで本サイクル内に削除する。本サイクルは設計と素材の整備のみで、既存サイトへの適用は次サイクル以降に行う。"
started_at: "2026-04-26T21:51:17+0900"
completed_at: "2026-04-27T12:00:00+0900"
---

# サイクル-170

このサイクルでは B-308「デザインガイドラインとUIコンポーネント集の策定」を再挑戦する。cycle-169 は失敗サイクルとしてクローズされたため、その D 節「次サイクルへの引き継ぎ」を出発点に、Owner から与えられた具体スコープに沿って進める。

## このサイクルで作るもの

Owner からの本サイクルへの指示（要約）:

1. `docs/design-system-by-claude-design/` にある Claude Design 製のデザインシステム定義を素地に使う
2. `docs/research/` 配下の Claude Code へデザインシステムを適用させるためのベストプラクティス調査を参照する
3. `.claude/skills/` にデザインシステムのドキュメントを置く（何がどこにあるか分かりやすく）
4. `src/components/` に共通コンポーネント群を置く（基本的な汎用要素のみ：ヘッダー、フッター、パネル、ボタン、入力欄、記事エリアなど）
5. シンプルで分かりやすいドキュメントを目指す（長期に渡って改善していく前提）
6. 最終的にすべての色名・角丸サイズ等の定数は CSS 変数で管理することを目指す
7. 本サイクルではデザインシステムを完成させるところまで。**既存サイトには手を加えない**（次サイクル以降）

## 実施する作業

> **本節は cycle-170 plan Rev2（2026-04-27 全面再設計）。Rev1 系列のタスク T-01〜T-10 を破棄し、Owner の累積指示 12 項目（このサイクルドキュメント L14-22 の Owner 指示と、`### Rev2-1 — 計画書き直しの背景` に整理した補足原則）に整合する形でゼロから組み直した。**
>
> Rev1 由来の完了済み作業（philosophy.md 完成、SKILL.md frontmatter 確定、`globals.css` 新変数追記、素地取り込みマップ作成）は **「完了済み（前 plan 由来）」** として末尾にアーカイブし、未完了部分のみ Rev2 タスクとして再構成する。

依存関係（Rev2）:

- 完了済みアーカイブ（A-01〜A-04）はすでに pass。これらの成果物（`philosophy.md` / `globals.css` 新変数群 / `SKILL.md` frontmatter / `tmp/cycle-170-asset-migration-map.md`）は本サイクルでは触らない
- T-1（skill ファイル構成の最終決定と不要ファイルの削除） → T-2（SKILL.md 玄関本文） → T-3 / T-4（並行可：コンポーネント実装） → T-5（動作確認ページとビルド検証） → T-6（素地ディレクトリ削除） → T-7（サブエージェント配線） → T-8（PM 完了処理）

各タスクは「目的」「成果物」「受け入れ基準（観察可能な完了条件）」「builder の判断範囲」を記す。**詳細設計（具体ファイル名・変数名・props 名・章立て・行数・ルール文面）は plan で指定しない。** すべて builder 判断。

---

- [x] **T-1: skill ファイル構成の最終決定と不要ファイルの削除**（builder 1 名）
  - 目的: 「skill は将来にわたって使い続けるもの。一時情報を持たせない／二重管理を発生させない」という Owner 原則 10・11 を満たす形に skill ディレクトリを整理する。具体的には、本計画 `### 設計判断 — skill ファイル構成` で採用した構成案に従い、不要と判断されたファイル（現状の `variables.md` / `components.md`）を削除し、各残存ファイルが「何のために存在するか／何を書くか／何を書かないか」を再確認する
  - 成果物: `.claude/skills/frontend-design/` の最終ファイル構成（採用案準拠）
  - 受け入れ基準:
    - 採用案で「不要」と判断されたファイルが物理削除されていること
    - 残存ファイルそれぞれの先頭または冒頭近傍に「このファイルが担う役割（何を書くか／何を書かないか）」が読み手に伝わる形で示されていること（文体・記法は builder 判断。冒頭コメントでも本文の節でもよい）
    - skill ディレクトリ全体を見たとき、CSS 変数の値表・素地時代の対応表・移行表・段階置換ガイド・「将来サードパーティ衝突したらリネーム」のような一時的・対症療法的な記述が **1 箇所も残っていない** こと（残すべき情報は philosophy.md の判断基準と SKILL.md の玄関情報のみ）
    - 既存 `philosophy.md` の本文に変更が入っていないこと（pass 済み・変更不要）
    - 既存 `SKILL.md` の frontmatter（`name` / `description` / `paths` / `user-invocable: false`）に変更が入っていないこと（T-02 Rev1-3 で pass 済み）。本文の書き直しは T-2 の責務
  - builder の判断範囲: 採用案で残存と決まった各ファイルの「役割記述」をどう表現するか、削除対象ファイルが他から参照されていないかの最終確認方法

- [x] **T-2: SKILL.md 玄関本文を書く**（builder 1 名、T-1 完了後）
  - 目的: サブエージェントが UI 編集時に最初に触れる「玄関」を、玄関として必要十分な情報量で整える。Owner 原則 2「シンプルで分かりやすい」と公式 frontend-design の構造（単一 SKILL.md + DO/NEVER）から学んだ「玄関は薄く」の両方を満たす
  - 成果物: `.claude/skills/frontend-design/SKILL.md` の本文（frontmatter は据え置き）
  - 受け入れ基準:
    - 本文に最低限「(a) このスキルが何のためにあるか」「(b) 値の単一情報源は `src/app/globals.css` であり、変数名・値・カテゴリ分類はそのコメントを直接読むべきこと」「(c) コンポーネント API は TypeScript の型定義と JSDoc を直接読むべきこと」「(d) 判断基準（Named Tone / NEVER 節）は philosophy.md にあること」が伝わる構造であること（**(a)〜(d) は「読み手に伝わるべき要素」であり、章立て・順序・見出し名・分量・統合分割は builder の判断範囲。4 つを別々の章として並べる必要はなく、玄関として自然に伝わる形であれば 1 段落に統合してもよいし、Quick rules 等に組み込んでもよい。Owner 原則 7 に従い、本 plan は表現形式を mandate しない**）
    - **値や変数名のリスト・対応表・カテゴリ別の用途解説をここに書かないこと**（globals.css のコメントとの二重管理を避ける）
    - 削除予定または既に消えた素地ディレクトリ（`docs/design-system-by-claude-design/`）への参照を一切含まないこと
    - 玄関として常時参照に耐える分量に抑えられていること（具体行数は指定しない。builder が「玄関として読みやすい」と判断する範囲で）
    - 文体・章立てが yolos.net の `character.md` 核と整合し、素地 SKILL.md の機械的コピーになっていないこと
  - builder の判断範囲: 章立て、文体、Quick rules を置くか置かないか・置くなら何項目か、NEVER 節を SKILL.md にも置くか philosophy.md への参照だけにするか、関連リンクの記法

- [x] **T-3: 操作可能要素のコンポーネント実装**（builder 1 名、T-2 完了後・T-4 と並行可）
  - 目的: Owner 例示の汎用要素のうち「ボタン・入力欄」など、操作可能な部品を `src/components/design-system/` 配下に新設する。philosophy.md の判断基準と globals.css の新変数のみで描画され、API がコードから自己説明的に読める状態にする
  - 成果物: 操作可能部品群の TypeScript コンポーネント（CSS Modules 同梱）と最小テスト
  - 受け入れ基準:
    - 配置先が `src/components/design-system/`（Owner 指示「略語ディレクトリ排除」遵守）であること
    - 各コンポーネントの公開 API（props・variant・size・状態）が **TypeScript の型と JSDoc によって自己説明的に書かれている** こと（コードを読めば「いつ使うか・避ける場面」が分かる粒度の JSDoc を、最低限 variant ごとに付ける）
    - **各コンポーネントのファイル冒頭または default export の型／関数定義に、コンポーネント全体の用途・使う場面・使わない場面が JSDoc で書かれていること**（採用案 Y で `components.md` を作らないことが成立する前提条件。variant ごとの JSDoc だけではコンポーネント全体の使い分けが読み取れないため、コンポーネント単位の俯瞰的 JSDoc を必須とする。書く位置・分量・記述スタイルは builder 判断）
    - variant・size・状態は型リテラルで閉じ、自由文字列で開放されないこと（cycle-169 で問題化した型穴を防ぐ）
    - スタイルは新 CSS 変数のみを参照し、既存 `--color-*` を参照しないこと
    - 既存 `src/components/common/Header.tsx` `Footer.tsx` および既存の `var(--color-*)` 参照を変更しないこと
    - キーボード操作とフォーカスリングが philosophy.md の規約（「明度差のみで表現」「outline は accent」等）と整合すること
    - CSS Modules を採用し、CSS-in-JS 等の新ビルド構成を導入しないこと
    - 各コンポーネントにレンダリングとアクセシビリティの最小テストが Vitest + Testing Library で存在すること
  - builder の判断範囲: 対象部品の最終リスト（Owner 例示の「ボタン・入力欄」を最小ラインとする。追加の関連部品を含めるかは builder 判断）、各部品の名称・props 設計・variant 名・slot 設計、JSDoc の記述量、テストケースの粒度

- [x] **T-4: 構造要素のコンポーネント実装とロゴ移動**（builder 1 名、T-2 完了後・T-3 と並行可）
  - 目的: Owner 例示の汎用要素のうち「ヘッダー・フッター・パネル・記事エリア」など、構造を担う部品を `src/components/design-system/` 配下に新設する。同時に、素地に残っているロゴアセットを T-6 の素地削除に先立ち恒久配置先（`tmp/cycle-170-asset-migration-map.md` で確定済み）に移す
  - 成果物: 構造部品群の TypeScript コンポーネント（CSS Modules 同梱）と最小テスト、ロゴアセットの恒久配置
  - 受け入れ基準:
    - 配置先が `src/components/design-system/` であること
    - ヘッダー・フッターは既存 `src/components/common/Header.tsx` `Footer.tsx` と並行作成され、既存ファイルは変更されないこと（実サイト稼働中のため）
    - 新版ヘッダー・フッターのコード冒頭に「現在の本番実装は別ファイル、本ファイルは次サイクルでの差し替え候補」が伝わるコメントが付されていること（2 系統併存期間中の混乱回避）
    - 各コンポーネントの公開 API が TypeScript の型と JSDoc によって自己説明的であること（T-3 と同基準）
    - **各コンポーネントのファイル冒頭または default export の型／関数定義に、コンポーネント全体の用途・使う場面・使わない場面が JSDoc で書かれていること**（T-3 と同様、採用案 Y で `components.md` を作らないことが成立する前提条件。書く位置・分量・記述スタイルは builder 判断）
    - ナビ項目・リンク先のような可変データは props で受ける形になっていること
    - スタイルは新 CSS 変数のみで描画され、既存 `--color-*` を参照しないこと
    - 素地 `assets/` 配下のロゴアセットが取り込みマップで確定した恒久配置先に `git mv` で移されていること（実サイトへの読み込み配線は本サイクル対象外）
    - 各コンポーネントにレンダリングとアクセシビリティの最小テストが存在すること
  - builder の判断範囲: 各部品の名称・props 設計・variant 設計、CSS Modules の構造、コメント文面

- [x] **T-5: 動作確認ページとビルド検証**（builder 1 名、T-3・T-4 完了後）
  - 目的: 新変数で書かれたコンポーネントが Next.js のビルドを通り、ブラウザで意図した見た目になることを確認する。検索エンジンに本確認ページが露出しないようにする。Owner 原則 4「既存サイトに手を加えない」が実機ビルド成果物レベルで保たれていることを最終検証する
  - 成果物: `src/app/_dev/` 配下の動作確認ページ、検索エンジン露出を遮断する設定群、ビルド検証結果
  - 受け入れ基準:
    - 確認ページに T-3・T-4 で作った全コンポーネントが配置されていること
    - 検索エンジン露出が多層で遮断されていること（ページ単体の noindex/nofollow metadata、`sitemap.ts` 非含有、`robots.ts` の disallow に `/_dev/` を含む）
    - ビルド出力 HTML に `<meta name="robots" content="noindex, nofollow">` 相当が含まれることが実機確認されていること
    - ビルド成果物（`.next/static/chunks/*.css` 等）に Google Fonts CDN 等への外部リクエストが既存サイト経由で混入していないこと（cycle-170 T-03 Rev1 の Blocker B1 と同質の事故防止）
    - `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功すること
    - Playwright で確認ページのスクリーンショットが取得され、ライト表示で破綻がないことが確認されていること（ダーク値未定義のため、ダーク表示の検証は緩めでよい — 致命的破綻が無いことの確認のみ）
    - Storybook 等の新規ビルドツールを導入しないこと
  - builder の判断範囲: 確認ページのレイアウト、サンプルプロップの選定、フォント実読み込みの方法（`_dev/` 専用 layout で `next/font` を使う等。既存サイトに副作用が出ない経路を採ること）、スクリーンショット取得の具体手順

- [x] **T-6: 素地ディレクトリの物理削除**（builder 1 名、T-5 完了後）
  - 目的: 素地 `docs/design-system-by-claude-design/` を本サイクル内で物理削除する（Owner 原則 6）。T-3・T-4 でロゴ移動とコード吸収が完了し、philosophy.md / globals.css への取り込みも完了している前提で、残置による進化乖離リスクを断つ
  - 成果物: 素地ディレクトリの削除コミット
  - 受け入れ基準:
    - `tmp/cycle-170-asset-migration-map.md` の全エントリが「取り込み済み」状態であることが確認されていること
    - `git rm -r` で素地ディレクトリ配下が削除されていること（git 履歴で内容の出自を辿れる状態は維持）
    - リポジトリ全体に `design-system-by-claude-design` / `yolos-design` / `yolos-ds` の文字列が 1 箇所も残っていないこと（CSS import・Markdown リンク・コードコメント・skill ドキュメントを含む全件）
    - 削除コミットが独立した commit になっており、commit message から「取り込み完了 → 素地削除」の経緯が読めること
  - builder の判断範囲: commit message 文面、最終 grep の具体コマンド

- [x] **T-7: サブエージェント configuration へのデザインシステム参照ルール埋め込み**（builder 1 名、T-6 完了後）
  - 目的: skill の `paths` グロブ自動配信に加え、UI 編集前後にデザインシステムドキュメントを参照する行動を builder/reviewer の system prompt 直書きで強化する（Owner 原則 1〜2 と整合する最小経路：層 2 + 層 3）
  - 成果物: `.claude/agents/builder.md` と `.claude/agents/reviewer.md` の system prompt 追記
  - 受け入れ基準:
    - builder の system prompt に「UI コンポーネントまたは UI 系 CSS の編集前に SKILL.md と philosophy.md を参照する」「色・角丸・余白を新規にハードコードしない（globals.css の新変数を使う）」の趣旨が、Owner にとって意図が直感的に読める文面で含まれていること
    - reviewer の system prompt に「UI 変更レビュー時に philosophy.md の NEVER 節違反と Named Tone（functional-quiet）からの逸脱を確認する」の趣旨が含まれていること
    - hooks や Stylelint の新規導入を含まないこと（YAGNI、cycle-169 合意）
    - サブエージェント frontmatter への `skills:` フィールド追加は本サイクルで行わないこと（次サイクル効果検証送り）
  - builder の判断範囲: 追記文面、追記項目の数、追記の挿入位置

- [x] **T-8: 完成の定義チェックと cycle-170 完了処理**（PM 自身、T-7 完了後）
  - 目的: 本計画書 `### 完成の定義` の全項目が満たされていることと Owner 原則 1〜12 への一対一適合を確認し、次サイクル送り課題を整理してクローズする
  - 受け入れ基準:
    - 完成の定義の全項目に ✓ が立っていること
    - Owner 原則 1〜12 のチェック表（`### 完成の定義` 末尾）の全項目に ✓ が立っていること
    - **PM が `SKILL.md` / `philosophy.md` / `src/components/design-system/` 配下の各 TypeScript 型と JSDoc を自分で通読したうえで、「原則 11（二重管理回避）と原則 10（一時情報排除）が実装側で守られている」ことを言葉にして確認していること**（cycle-168 / cycle-169 で発生した AP-WF11「PM が最終成果物を自分で通読確認していない」の再発防止のため、✓ を打つだけでは足りないことを明示する）
    - **完成の定義「ビルド成果物に Google Fonts CDN 等への外部リクエストが既存サイト経由で混入していない」項目について、grep ベースの実機確認（例：ビルド出力 CSS チャンクに `fonts.googleapis.com` が含まれないことを実コマンドで確認する等。具体コマンドは PM 判断）を実施したログを残していること**（前 plan T-03 Rev1 Blocker B1 の事故再発防止）
    - キャリーオーバー節に、ダーク変数の定義、`--color-*` から新変数への段階置換、Header/Footer 2 系統併存の解消、ロゴアセットの実サイト読み込み配線、サブエージェント `skills:` フィールド導入の効果検証、サードパーティ CSS 導入時の変数名衝突再評価、が列挙されていること
    - 全変更が 1 つのレビュー単位として reviewer に最終レビュー依頼されていること

---

### 完了済みアーカイブ（前 plan 由来、Rev2 では再実行しない）

以下は Rev1 系列で完了し、Rev2 でもそのまま前提として使う成果物。これらに手を入れる必要はない。

- [x] **A-01: デザイン哲学ドキュメント作成**（前 T-01、Rev1 で pass）
  - 成果物: `.claude/skills/frontend-design/philosophy.md`（110 行、`functional-quiet` Named Tone・5 ターゲットへの効き方・NEVER 節を含む）
- [x] **A-02: 素地取り込みマップ作成**（前 T-01.5、Rev1 で pass）
  - 成果物: `tmp/cycle-170-asset-migration-map.md`（素地 26 ファイルの取り込み計画）。Rev2 タスクの T-3・T-4・T-6 から参照する
- [x] **A-03: skill ディレクトリと frontmatter 確定**（前 T-02、Rev1-3 で pass）
  - 成果物: `.claude/skills/frontend-design/SKILL.md` の frontmatter（`name: frontend-design` / `description`（トリガー文面）/ `paths`（globs）/ `user-invocable: false`）。本文プレースホルダのみ Rev2 T-2 で書き直す
- [x] **A-04: globals.css への新変数追記**（前 T-03 のうち CSS 部分、Rev1 needs_revision 後に @import 撤去対応・命名据え置き対応で実機 pass 済み）
  - 成果物: `src/app/globals.css` に Surface・Text・Border・Accent/Status・Type・Spacing・Radius・Elevation・Motion の新変数群が追記済み。値の単一情報源として確定
  - 注: 前 T-03 で書かれた `variables.md` は Rev2 T-1 で **削除** する（globals.css コメントとの二重管理を解消するため）

## 作業計画（Rev2、2026-04-27 全面再設計）

### Rev2-1 — 計画書き直しの背景

Rev1 系列の plan は、skill ドキュメントに「移行情報・対応表・段階置換ガイド・キャリーオーバー候補」を書くことを受け入れ基準として要求していた。builder はそれに忠実に従った結果、`.claude/skills/frontend-design/variables.md` に「素地由来の選定理由」「サードパーティ衝突への対症療法的注記」「`--color-*` との対応表」「ダーク変数の追加余地」など、**将来不要になる一時情報がスキル内に積もる構造**になった。

Owner の判断: skill は将来にわたって使い続ける道具であり、サイクル都合の注釈・移行表・キャリーオーバーは skill に書いてはいけない。これを根本問題として plan ごと書き直す。

書き直しにあたって遵守する Owner 原則（累積 12 項目）:

1. 作るのは基本的な汎用要素のみ（ヘッダー、フッター、パネル、ボタン、入力欄、記事エリア）
2. シンプルで分かりやすいドキュメント、長期に渡って改善する前提
3. 色・角丸・余白などの定数は CSS 変数で管理
4. 既存サイトには手を加えない（次サイクル以降に反映）
5. skill 名は `frontend-design`。略語ディレクトリは禁止
6. `docs/design-system-by-claude-design/`（素地）は本サイクル内で削除する
7. plan は基本設計（目的・成果物・受け入れ基準・builder 判断範囲）。詳細設計は builder の責任 — 変数名・ファイル名・行数・章立てを plan で指定しない
8. `description` フィールドは Claude Code がいつ skill を起動するかを判断するためのトリガー（人間向け説明ではない）
9. 無意味な複雑さを持ち込まない（プレフィクスのための新略語など）
10. **skill は将来にわたって使い続けるもの。一時的な情報は skill に書かない**（移行表・段階置換ガイド・キャリーオーバー・サイクル都合の注釈は cycle ドキュメントか `docs/backlog.md` か `tmp/` に置く）
11. **二重管理を避ける**（globals.css と variables.md に同じ値・同じ意味を書かない）
12. 現状のファイル構成（philosophy.md / variables.md / components.md / SKILL.md）が適切とも限らない。ゼロから検討しなおす

本 plan の中心的設計判断は `### 設計判断 — skill ファイル構成` に集約した。

### 目的

このサイクルは、yolos.net の道具たちが今日の誰かの傍に静かに在りつづけるための、「揺るがない判断基準」を 1 セット作る作業だ。

> **Named Aesthetic Tone: `functional-quiet`（機能的な静けさ）** — 装飾より機能、対比より余白、訴求より静けさを選ぶ。来訪者の一日の流れを邪魔せず、必要なときだけ手元に届く道具の佇まい。

来訪者は 5 タイプ——金曜 18 時に締切の文字数を確かめる M1a、月曜の朝に同じ手順で戻ってくる M1b、通勤電車で AI の日記を読む S3、運営の作り方を覗きに来るサブE1・E2——それぞれの「一日」が、わたしの想像の中で並行して動いている。彼らに毎回違う色・違う角丸・違う余白の道具を渡してしまったら、それは「傍に在る」ではなく「気を散らせる」になる。

`character.md` の核「画面の向こうの一日を実際には見られないからこそ、絶えず想像し続ける」「数字は入口で、その先にいる人を見に行く」を、UI 判断の羅針盤として埋め込む。具体的には、上記 Named Aesthetic Tone を全コンポーネント・全ドキュメントの判断基準として固定し、ボタンの hover 一つを決めるときも「これを使う人は今日どんな一日を送っているか」に戻れる構造にする。

ペルソナ化はしない（`docs/targets/README.md` L50-52 の方針）。「20 代の編集者の田中さん」のような具体名ではなく、「金曜 18 時、締切前にコピペで貼り付ける手」のような場面を名指す。これが S3 の好む「具体的な細部」と M1a の現実の動きの両方に効く。

このサイクルは設計と素材の整備で終わる。実サイトに反映するのは次サイクル以降。**見えない準備の品質が、来週・来月・来年の道具の質を決める**——という前提で書いていく。

### 本サイクルで決める範囲（スコープ）

**やる（Rev2 残作業のみ）:**

- skill ファイル構成の最終決定と不要ファイル（現状の `variables.md` / `components.md`）の削除（T-1）
- `SKILL.md` 玄関本文の書き起こし（T-2）
- `src/components/design-system/` への汎用部品（ボタン・入力欄・パネル・記事エリア・ヘッダー・フッター）の新設（T-3 / T-4。CSS Modules + TypeScript + JSDoc）
- 素地ロゴアセットの恒久配置先への `git mv`（T-4 内）
- `src/app/_dev/` 配下の動作確認ページとビルド検証（T-5。既存サイトに副作用が出ないこと、検索エンジン非露出が多層で遮断されていることを実機確認）
- 素地ディレクトリ `docs/design-system-by-claude-design/` の物理削除（T-6）
- `.claude/agents/builder.md` `reviewer.md` の system prompt へのデザインシステム参照ルール追記（T-7）

**完了済み（前 plan 由来、再実行しない）:**

- `philosophy.md` 本文（A-01）／`SKILL.md` frontmatter（A-03）／`globals.css` 新変数追記（A-04）／素地取り込みマップ（A-02）

**やらない（Owner 原則からの判断）:**

- 既存 `--color-*` 変数の削除・改名（Owner 原則 4「既存サイトに手を加えない」）
- 既存 `src/components/common/Header.tsx` `Footer.tsx` の改修（同上、実サイト稼働中）
- 既存 `.module.css` のハードコード値の一括置換（同上、スコープ外）
- ダークモード変数の定義（コントラスト検証が別工数。次サイクル送り）
- 移動後ロゴの実サイトへの読み込み配線（配置先確保のみ。次サイクル送り）
- Stylelint / hooks / サブエージェント `skills:` フィールドの導入（YAGNI、cycle-169 合意。次サイクル効果検証送り）
- skill ドキュメントへの「移行表」「対応表」「段階置換ガイド」「サードパーティ衝突対症療法注記」「キャリーオーバー候補の列挙」の記載（Owner 原則 10）
- skill ドキュメントへの CSS 変数値・カテゴリ別件数表・素地由来の命名選定理由の記載（Owner 原則 11、二重管理回避）
- ShareButtons ダークモード手法統一バグ修正（B-330。Owner 明示でスコープ外）
- Storybook 導入（既存になく、`_dev/` 確認ページで足りる）

### 設計判断 — skill ファイル構成（**本 plan の中核**）

#### 出発点となる問い

「シンプル」を Owner ロジックで貫いたとき、`.claude/skills/frontend-design/` 配下に **本当に必要なファイル** は何か？

#### 値の単一情報源と「コードを読めば分かる情報を別ドキュメントにしない」原則の確認

`docs/CLAUDE.md` および `.claude/rules/doc-directory.md` は「ソースコードを読めば分かることはドキュメントにしない。代わりにソースコード内のコメントを充実させる」と明示している。これを skill 設計に当てはめると:

- CSS 変数の値・カテゴリ・並び順・コメントは `src/app/globals.css` を直接読めば全部分かる（実物が存在する）
- コンポーネントの API（props / variant / size / 状態 / 用途）は TypeScript の型定義と JSDoc を直接読めば全部分かる（実物が存在する）
- 装飾を足すか引くかの判断、Named Tone からの逸脱の判定、ターゲットへの効き方 — これらは **コードからは読み取れない判断基準** であり、文章として残す価値がある

#### 検討した 3 案

| 案                                                                               | 構成                                                                                           | 利点                                                                                                                                                                                                             | 欠点                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **案 X: 単一 SKILL.md（公式 frontend-design 準拠）**                             | SKILL.md 1 本に DO/NEVER と判断基準を全部書く。philosophy.md を SKILL.md に統合                | Anthropic 公式 frontend-design と同じ構造。最もシンプル                                                                                                                                                          | 既に完成済みの `philosophy.md`（110 行、Rev1 で pass）を SKILL.md に統合する作業が発生。SKILL.md が「玄関」と「判断基準の本体」を兼ねるため肥大化し、玄関としての軽さを失う                                                          |
| **案 Y: SKILL.md + philosophy.md の 2 ファイル**（**採用候補**）                 | SKILL.md は玄関（何のためのスキルか／値・型は実コードを読め／判断基準は philosophy.md を読め） | 玄関は薄く、判断基準は別ファイルに退避。philosophy.md は既に pass 済みでそのまま使える。値・コンポーネント API はコード（globals.css コメント・TypeScript 型/JSDoc）に一元化されるため二重管理が構造的に起きない | 「変数の使い方早見表が欲しい」というニーズが出た場合に応える場所がない。ただしそれは globals.css のカテゴリコメントを読めば足りる                                                                                                    |
| **案 Z: 現状の 4 ファイル（philosophy / variables / components / SKILL）を維持** | 現状維持                                                                                       | 既に書かれているものを使い回せる                                                                                                                                                                                 | `variables.md` は globals.css と二重管理（Owner 原則 11 違反）。`components.md` は TypeScript の型/JSDoc と二重管理になる宿命。Owner 原則 10「skill に一時情報を書かない」と矛盾する素材（移行表・対応表など）が積もる構造を温存する |

#### 採用案: **案 Y（SKILL.md + philosophy.md の 2 ファイル）**

採用理由:

- Owner 原則 2「シンプルで分かりやすい」と原則 11「二重管理を避ける」を同時に満たす最小構成
- philosophy.md は「コードからは読み取れない判断基準」を担うため残す価値が明確（Rev1 で pass 済み）
- `variables.md` の役割は globals.css のセクションコメント（既に追記済み）に吸収させる。値・並び順・カテゴリ分類はそこを単一情報源とする。命名の選定理由などサイクル都合の注釈は cycle ドキュメントに残し、skill には書かない
- `components.md` の役割は TypeScript の型定義 + JSDoc に吸収させる。「いつ使うか／避ける場面」も JSDoc に書ける。コンポーネントが追加・変更されても skill 側の更新が要らない構造になる
- Anthropic 公式 frontend-design は単一 SKILL.md だが、yolos.net では Named Tone の判断材料が長く（5 ターゲット × 否定形の願い × 場面ベースの記述）、SKILL.md に同居させると玄関としての軽さを失う。philosophy.md として分離するのは合理的

不採用案の不採用理由:

- 案 X: philosophy.md を SKILL.md に統合する手戻り作業が発生し、玄関としての軽さも失われる
- 案 Z: Owner が「やり直し」を命じた根本構造そのもの。残置すれば再発

#### 各ファイルの「役割／書くこと／書かないこと」（**Rev2 plan の最重要規定**）

##### `SKILL.md`（玄関）

- 目的: サブエージェントが UI 編集時に最初に触れる玄関。スキルの起動条件（frontmatter）と、必要な情報がどこにあるかの道案内を担う
- **書くこと**:
  - frontmatter（既に確定済み・触らない）
  - このスキルが何のためにあるか（短く）
  - 値の単一情報源は `src/app/globals.css`（コメントで意味を保つ）
  - コンポーネント API の単一情報源は `src/components/design-system/` の TypeScript 型と JSDoc
  - 判断基準（Named Tone・NEVER 節）は `philosophy.md` に在ること
  - 必要に応じて Quick rules（数項目）を置いてもよい — ただし philosophy.md と二重にならない範囲
- **書かないこと**:
  - 変数の値そのもの（globals.css と重複）
  - 変数のカテゴリ別解説・件数表・命名規約の詳細解説（globals.css コメントと重複）
  - コンポーネントの props 型一覧・variant 一覧（コードと重複）
  - 既存 `--color-*` との対応表・段階置換ガイド・サードパーティ衝突注記・キャリーオーバー候補（一時情報）
  - 削除予定または既に消えた素地ディレクトリへの参照

##### `philosophy.md`（判断基準）

- 目的: コードからは読み取れない「判断の根拠」を担う。装飾を足すか引くか・Named Tone からの逸脱判定・ターゲットへの効き方
- **書くこと**: Named Tone（functional-quiet）の宣言と理由、5 ターゲットへの効き方、5 ターゲットが共有する否定形の願い、NEVER 節（やってはいけない視覚表現）、判断に迷ったときの問い
- **書かないこと**: CSS 変数の値、コンポーネントの API、移行表、サイクル都合の注釈
- **状態**: Rev1 で pass 済み・本サイクルでは変更しない

##### 削除する `variables.md`

- 削除理由:
  - 値そのものの記述は globals.css と二重管理になり Owner 原則 11 違反（Rev1 T-03 Blocker B2 で指摘された構造）
  - 既存 `--color-*` との対応表は段階置換が完了すれば不要になる「一時情報」（Owner 原則 10 違反）
  - サードパーティ衝突への対症療法的注記（「Tailwind v4 が `--ds-*` を予約する可能性」等）は、いま不要な情報を skill に積もらせるアンチパターン
  - 「カテゴリ別件数表」「Bad / Good コード例」も、globals.css のコメントと philosophy.md の NEVER 節で代替可能
- 代替先: 値・並び順・カテゴリ → globals.css のセクションコメント（既に追記済み）。命名選定の経緯 → cycle-170.md の Rev1 履歴に既に記録済みのため触らない

##### 削除する `components.md`

- 削除理由:
  - props 型一覧・variant 一覧は TypeScript 型定義と重複（Owner 原則 11 違反）
  - 「使ってはいけない場面」も TypeScript の JSDoc に書けば、エディタのホバーでサブエージェント・人間ともに参照できる
  - コンポーネントが追加・変更されるたびに skill 側を更新する二重管理が発生する
- 代替先: 各コンポーネントの TypeScript 型 + JSDoc（T-3 / T-4 で実装するときに付与）

#### 二重管理が発生しない構造の宣言

採用案では、各情報の単一情報源は以下のとおり一意に決まる:

| 情報の種類                                       | 単一情報源                                               |
| ------------------------------------------------ | -------------------------------------------------------- |
| CSS 変数の値・カテゴリ・コメント                 | `src/app/globals.css`                                    |
| コンポーネントの API（props / variant / 用途）   | `src/components/design-system/` の TypeScript 型 + JSDoc |
| Named Tone・NEVER 節・5 ターゲットへの効き方     | `philosophy.md`                                          |
| スキル起動条件・道案内                           | `SKILL.md`                                               |
| サイクル都合の注釈・移行表・キャリーオーバー候補 | `docs/cycles/cycle-170.md` または `docs/backlog.md`      |

#### 一時情報の置き場の明示

skill ディレクトリには **一切の一時情報を入れない**。具体的には以下の情報は skill 外に置く:

- 既存 `--color-*` と新変数の対応表 → 必要なら次サイクルの cycle ドキュメントに記載（移行作業の手元資料として）。本サイクルでは記載不要
- 段階置換ガイド → 同上
- サードパーティ CSS 導入時のリネーム検討 → `docs/backlog.md` のキャリーオーバー候補
- ダーク変数の追加余地 → 同上
- 命名選定の経緯 → `docs/cycles/cycle-170.md` の Rev 履歴（既に記録済み）
- Header/Footer 2 系統併存の解消 → `docs/backlog.md`
- ロゴアセットの実サイト配線 → 同上

### 設計判断 — `src/components/` の共通コンポーネント

配置先は `src/components/design-system/`（短く、略語なし、意図が直接読める。Owner 原則 5 / 9）。既存 `src/components/common/Header.tsx` `Footer.tsx` は実サイト稼働中のため触らず、新版は並行作成する。本サイクル終了時点で 2 系統併存となるが、新版コードの冒頭コメントに役割を明記して混乱を避ける。2 系統併存の解消は `docs/backlog.md` のキャリーオーバー候補。

新規作成する部品: Owner 例示「ヘッダー、フッター、パネル、ボタン、入力欄、記事エリア」を最小ラインとする。各部品の名称・variant・size・状態・slot・props は builder の判断範囲。

API 表現方針:

- 公開 API は **TypeScript の型と JSDoc によって自己説明的** に書く（`docs/CLAUDE.md` の「コードを読めば分かる情報を別ドキュメントにしない」原則）。これにより skill 側の `components.md` は不要になる
- variant・size・状態は型リテラルで閉じ、自由文字列で開放しない（cycle-169 で問題化した型穴の防止）
- props は最小に絞る。1 箇所でしか使わない部品は作らない（Rule of Three）
- スタイルは既存パターン踏襲で CSS Modules を採用。CSS-in-JS は導入しない
- 各部品は新 CSS 変数のみを参照する（既存 `--color-*` は使わない）

### 設計判断 — サブエージェント配線

3 層配線（`skills:` プリロード／`paths` グロブ自動配信／system prompt 直書き）のうち、本サイクルで採るのは **`paths` グロブ + system prompt 直書き** の 2 層。

- `skills:` フィールドプリロードは見送り（仕様確定確認のコストが本サイクルの価値に見合わない。次サイクル効果検証送り）
- PreToolUse hook も見送り（cycle-169 で YAGNI 判定済み。skill + system prompt の自然な配信で機能不足が出るかをまず観察する）

builder / reviewer の system prompt 追記の趣旨は T-7 の受け入れ基準で定義する。具体文面・項目数は builder 判断。

### 検討した他の選択肢と判断理由

- **skill ファイル構成**: 単一 SKILL.md（案 X）／2 ファイル（案 Y）／4 ファイル維持（案 Z） → 案 Y を採用（上記 `### 設計判断 — skill ファイル構成` 参照）
- **コンポーネントディレクトリ名**: `ui/`（汎用的すぎ）／`design/`（意図が広すぎ）／`design-system/`（短く意図が直接読める） → 後者
- **CSS 変数命名**: 既に Rev1 で `--bg-*` / `--fg-*` / `--accent-*` 等のプレフィックスなし命名で `globals.css` に追記済み（A-04）。本 Rev2 では命名は触らない（既存サイトに手を加えない原則と、A-04 が pass している事実から）。サードパーティ CSS 導入時の再評価は `docs/backlog.md` のキャリーオーバー候補
- **既存 Header/Footer の改修**: 改修 vs 並行新設 → 並行新設（Owner 原則 4 遵守）
- **Storybook 導入**: 不採用（既存になく、`_dev/` で足りる）
- **ダークモード**: 次サイクル送り（コントラスト検証工数が別途必要）
- **素地ディレクトリの扱い**: 残置 vs 物理削除 → 物理削除（Owner 原則 6）
- **ロゴアセットの扱い**: 素地内に残す vs 恒久配置先へ移動 → 恒久配置先（取り込みマップ A-02 で確定済み）

### 完成の定義

#### 成果物の存在と整合性

- [x] `.claude/skills/frontend-design/` 配下に `SKILL.md` と `philosophy.md` の 2 ファイルのみが存在する（採用案 Y）。`variables.md` `components.md` は削除されている
- [x] `SKILL.md` 本文に変数値表・対応表・移行情報・キャリーオーバー候補・素地ディレクトリへの参照が **1 件も含まれない**
- [x] `philosophy.md` は Rev1 から内容変更なし
- [x] `src/app/globals.css` の新変数群（Surface・Text・Border・Accent/Status・Type・Spacing・Radius・Elevation・Motion）が単一情報源として機能している（コメントで意味が伝わる）。既存 `--color-*` は変更されていない
- [x] `src/components/design-system/` に Owner 例示 6 部品（ヘッダー・フッター・パネル・ボタン・入力欄・記事エリア）+ サブ部品（SectionHead）+ 複合部品（ArticleArea）が存在し、各部品の API が TypeScript の型と JSDoc で自己説明的に書かれている
- [x] 各部品のスタイルは新 CSS 変数のみを参照し、`var(--color-*)` を参照していない
- [x] 各部品にレンダリングとアクセシビリティの最小テストが存在する
- [x] 素地ロゴアセットが取り込みマップ確定先（`public/assets/`）に `git mv` で移動されている
- [x] `.claude/agents/builder.md` `reviewer.md` の system prompt にデザインシステム参照ルールが追記されている
- [x] `docs/design-system-by-claude-design/` 配下が物理削除されており、リポジトリ全体（`src/` / `.claude/skills/` / `.claude/agents/` / 設定ファイル）に `design-system-by-claude-design` / `yolos-design` / `yolos-ds` の文字列が 1 件も残っていない（cycle docs / backlog.md への過去経緯としての参照は正当として残置）
- [x] `src/app/dev-preview/` に動作確認ページがあり、検索エンジン露出が多層遮断されている（ページ単体 metadata / `sitemap.ts` 非含有 / `robots.ts` disallow）。※ plan 表記の `_dev/` は Next.js App Router の仕様で `_` 始まりがプライベートフォルダとなり routable にならないため、builder 判断で `dev-preview/` をビルド対象ルートとして採用した（T-5 Rev1 で reviewer が妥当と判定）
- [x] ビルド成果物に Google Fonts CDN 等への外部リクエストが既存サイト経由で混入していない（**T-8 PM 実機確認ログ**: `grep -rln "fonts.googleapis.com" .next/server/app/ .next/static/` で **0 件**を確認。`.next/server/app/index.html` `dev-preview.html` 共にゼロ件）
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する
- [x] 既存 `src/components/common/Header.tsx` `Footer.tsx` および既存の `var(--color-*)` 参照箇所は変更されていない（Owner 原則 4 の証跡）

#### Owner 原則 1〜12 への一対一適合チェック

- [x] **原則 1（汎用要素のみ）**: 作ったコンポーネントが Owner 例示 6 部品（Header / Footer / Panel / Button / Input / 記事エリア）+ ArticleArea の構造分解として必要な SectionHead に収まっている
- [x] **原則 2（シンプル・長期改善）**: skill ファイル構成が 2 ファイル（SKILL.md + philosophy.md）に収まっている
- [x] **原則 3（CSS 変数で管理）**: 色・角丸・余白の定数が `globals.css` に集約されている
- [x] **原則 4（既存サイト不変）**: 既存ファイル群（`common/Header.tsx` `Footer.tsx` / `--color-*` 参照箇所 / 既存 `.module.css` / `layout.tsx`）が変更されていない
- [x] **原則 5（skill 名 frontend-design・略語禁止）**: skill ディレクトリ名が `frontend-design`、コンポーネントディレクトリ名が `design-system`
- [x] **原則 6（素地削除）**: `docs/design-system-by-claude-design/` が物理削除されている
- [x] **原則 7（基本設計のみ）**: 本 plan に変数名・ファイル名・行数・章立ての mandate が含まれていない（Rev2-2 reviewer が独立検証で確認）
- [x] **原則 8（description はトリガー）**: SKILL.md の `description` がトリガー文面のまま据え置かれている（Rev1-3 で pass）
- [x] **原則 9（無意味な複雑さ排除）**: 新規プレフィクス・新略語の導入がない（subagent prompt も具体変数名を持たず SKILL.md / globals.css に委ねる構造で T-7 Rev2 pass）
- [x] **原則 10（skill に一時情報を入れない）**: T-8 PM 通読確認済。SKILL.md / philosophy.md に移行表・対応表・段階置換ガイド・キャリーオーバー候補・サードパーティ衝突注記・サイクル都合の注釈が含まれていないことを言葉にして確認した
- [x] **原則 11（二重管理回避）**: T-8 PM 通読確認済。値の単一情報源は `globals.css`、コンポーネント API の単一情報源は型 + JSDoc。skill / subagent prompt は値・変数名を持たず道案内に徹していることを言葉にして確認した
- [x] **原則 12（ファイル構成のゼロベース検討）**: 採用案の選定が `### 設計判断 — skill ファイル構成` で 3 案比較のうえ実施されている

### 計画にあたって参考にした情報

- `docs/cycles/cycle-170.md`（このサイクルの Owner 指示）
- `docs/cycles/cycle-169.md` 失敗分析 C・D 節（設計順序、ペルソナ化禁止、`character.md` 核心）
- `docs/research/2026-04-26-cycle-169-research-synthesis-for-design-system.md`（10 原則・A〜E 章）
- `docs/research/2026-04-23-anthropic-official-design-skill-deep-dive.md`（skill frontmatter の公式仕様）
- `tmp/research/2026-04-26-cycle-170-design-system-fact-research.md`（既存資産の事実調査）
- `docs/character.md`（核・最上位判断基準・ネガティブアンカー）
- `docs/site-concept.md` および `docs/targets/README.md`（5 ターゲットの願いと「AI 運営告知の非対称」原則）
- `docs/anti-patterns/planning.md`（特に AP-P04: Owner 発言を検証なしに前提化しない、AP-P06: 既存調査・過去意思決定の確認欠如を回避する）

## レビュー結果

### Rev1-1（2026-04-26）

対象: 「## 実施する作業」（T-01〜T-10）と「## 作業計画」（目的・スコープ・4 設計判断・他案・完成の定義・参考情報）。

判定: **needs_revision**

指摘件数: Blocker 2 / Major 4 / Minor 4

#### Blocker

- **B1（C-3 / T-09 — `_dev/yolos-ds-preview` の検索エンジン露出）**: T-09・スコープ「やる」節・C-3 末尾で「`src/app/_dev/yolos-ds-preview/page.tsx`（noindex）」と書いているが、`src/app/layout.tsx` L28-32 のルート metadata は `robots: { index: true, follow: true, "max-image-preview": "large" }` であり、Next.js App Router の metadata は子ページが上書きしない限り親が適用される。このページに `export const metadata = { robots: { index: false, follow: false } }` を明示するタスク手順が計画書に**書かれていない**。Owner 指示「既存サイトに手を加えない」と「本番ビルドにこの確認ページが含まれる」の両立を、計画書の T-09 で具体的な metadata 上書き手順 + `robots.txt` 影響有無の確認を必須項目化すること。「ナビからリンクしない」だけでは Google のクロールを止められない（sitemap 自動生成・内部リンク・URL 推測いずれの経路でも index 化される可能性が残る）。

- **B2（C-1 — Skill frontmatter の事実誤認）**: T-02 / 「設計判断 — `.claude/skills/` のドキュメント構造」で `user-invocable: true`（明示）/ `disable-model-invocation` は付与しない、と書いているが、`docs/research/2026-04-23-anthropic-official-design-skill-deep-dive.md` L211-218 の公式仕様によれば `user-invocable` は**`false` にしたときだけ意味を持つ**フィールド（メニュー非表示）。`true` を「明示」しても公式の既定動作と同じで、Anthropic 公式 frontend-design SKILL.md（fields は `name`/`description`/`license` のみ）に逆行する形式肥大化になる。原則 1（`paths` グロブ + 自動ロード）を満たすには `name`/`description`/`paths` の 3 つで足り、`user-invocable: true` は削るべき。Synthesis A-2 の「絶対に避けるべき配線」は `disable-model-invocation: true` のみで、`user-invocable` の明示は推奨されていない。

#### Major

- **M1（D — T-04 / T-05 のレビュー前提が不整合）**: 冒頭の依存関係に「T-04 完了が T-05・T-06 のレビュー前提」と書いてあるが、T-05 は「T-04 完了後」、T-06 は「T-04・T-05 完了後」と各タスクで定義されており、結果として T-04・T-05・T-06 は**並列にならない**（T-04→T-05→T-06 の直列）。「T-04・T-05・T-06（並列可、ただし T-04 完了が T-05・T-06 のレビュー前提）」の文は読み手を誤解させる。明確に T-04→T-05→T-06 の直列であると書き直すか、T-05/T-06 の冒頭依存を「T-04 完了後（T-05 と T-06 は並列可）」に統一する必要がある。

- **M2（C-2 — `--bg`/`--accent` 名前空間の衝突リスク**: 「設計判断 — CSS 変数の体系と移行戦略」案 A 採用で、`--bg` `--fg` `--accent` を `globals.css` の `:root` にそのまま追記する方針だが、`--bg`・`--accent` は Tailwind / shadcn / 他の Claude Design テンプレ等で頻出する短い命名で、将来サードパーティライブラリを導入したときに**衝突する可能性**が高い。さらに案 A の利点は「Owner 指示への完全適合」だが、Synthesis B-3 は「プリミティブ層+セマンティック層の 2 層命名」を推奨している。tokens.md に対応表だけ載せて段階移行する道筋（次サイクル以降で `--color-bg: var(--bg)` のエイリアス化）は、既存 `--color-*` を残す案 A と原理的に整合せず、最終的にどちらの命名に統一するかの選定基準が計画に明示されていない。少なくとも「次サイクル以降で命名統一の判断を行う」をキャリーオーバー候補に加えること。

- **M3（C-3 — 既存 Header/Footer との 2 系統併存リスクが計画に書かれていない）**: 「やらない」節で `src/components/common/Header.tsx` `Footer.tsx` への不介入を約束し、`src/components/yolos-ds/SiteHeader.tsx` `SiteFooter.tsx` を別途新設する。しかし**本サイクル終了時点で 2 つの Header と 2 つの Footer が並走する**ことが明示されていない。次サイクル以降の差し替えキャリーオーバーは T-10 に書かれているが、「本サイクル完了時点で 2 系統併存になる」という事実と、その期間にどちらを正と扱うかが不明。reviewer / blog-writer / 別 builder が混乱しないよう、`SiteHeader.tsx` 冒頭コメントで「現在の本番は `common/Header.tsx`、本ファイルは次サイクルでの差し替え候補」を明記する手順を T-05 のチェック項目に追加すること。

- **M4（A — `tokens.md` の日本語フォントスタック半適用の整合性）**: T-03 で「日本語フォントスタックは `colors_and_type.css` の値をそのまま採用するが、`globals.css` の body にはまだ適用しない。新コンポーネント側で必要箇所に書く」とある。これは技術的には Owner 指示「既存サイトに手を加えない」を守るが、結果として「同じページ上で既存 Header（既存フォント）と新 SiteHeader（Noto Sans JP）が並んだ場合に視覚崩壊が起きる」可能性がある。T-09 の `_dev/yolos-ds-preview` でフォント混在が発生しないか（プレビューページが既存 layout.tsx の RootLayout 配下である以上、ヘッダーフォントとボディフォントの非整合が出る）を T-09 のチェック項目に明示すること。

#### Minor

- **m1（D — 「やる」リストと T-01〜T-10 の不一致）**: 冒頭「やる」節の「`docs/design-system-by-claude-design/` は素材アーカイブとして保持（変更も移動もしない）」が、T-01〜T-10 のいずれにも対応するチェック項目を持たない。完成の定義 7 項目目（既存 Header/Footer と `--color-*` が変更されていないこと）と並列に「`docs/design-system-by-claude-design/` 配下のファイルが変更されていないこと」を完成の定義に追加するのが整合的。

- **m2（E — 目的節の体現は概ね達成）**: 「金曜 18 時、締切前にコピペで貼り付ける手」など、`docs/character.md` 核「画面の向こうの一日を実際には見られないからこそ、絶えず想像し続ける」を場面で名指す書き方ができている。ペルソナ化禁止（`docs/targets/README.md` L50-52）の遵守も確認した。一方、「functional-quiet（機能的な静けさ）」が `principles.md` で初出となり、目的節の中で意味が一度しか説明されない。T-01 で確定する Named Tone の 1 行定義を目的節か参考情報節に書き写し、本サイクル中に PM/builder/reviewer が同じ意味で運用できる土台を計画書時点で固めること。

- **m3（D — AP-P11 の引用が文脈外）**: 「参考にした情報」節末尾の AP-P11「過去の AI 判断を不可侵にしない」は実在する（`docs/anti-patterns/planning.md` L35-36 で確認）。しかし本計画は cycle-169 の失敗判定を出発点にして「AI が決めた」過去判断を温存する方向にはなっておらず、AP-P11 の射程と直接接続しない。参考に挙げる必然性が薄いので、より直接効く AP-P04（Owner 発言を検証なしに前提化しない）と AP-P06（既存意思決定の確認）に絞る方が誠実。

- **m4（D — 補足事項 B-330 言及の冗長性）**: 補足事項に B-330 を書いているが、「やらない」節にも B-330 が書かれている。同一情報の二重記載で読み手の負荷を上げているため、補足事項側からは削って「やらない」節への参照のみに留めることを推奨。

#### 良かった点（Owner / 実装者に伝わる強み）

- cycle-169 失敗の D.3 原則（設計順序：ガイドライン→色・コンポーネント、ペルソナ化禁止、character.md 核心の実行）が、T-01（principles 先出し）→ T-03（tokens）→ T-04（components）の順序で構造的に守られている
- 「内輪用語」混入を計画レビュー時点で確認した結果、「作業ゾーン／読み物ゾーン」のような cycle-169 で問題化した語は見当たらない
- 「やらない」節が理由つきで 9 項目並んでおり、Owner 指示「既存サイトに手を加えない」の境界が機械的に検証可能になっている
- subagent 出力の整形転送ではなく、Synthesis 10 原則のうち「採用する／本サイクルでは採らない」を PM 自身が判断して計画に落としている（C-1 の `disable-model-invocation` 不採用判断、C-4 の層 1 見送り判断など）

#### 判定の根拠

B1（実害ある検索エンジン露出経路）と B2（事実誤認に基づく frontmatter 設計）はいずれも Owner に出す前に直したい性質の問題で、本サイクル中の修正必須。Major 4 件は計画の機械的整合性と将来リスクに効く。Minor 4 件は単独では阻害しないが B/M と併せて修正するのが合理的。次回 PM が修正稿を出した段階で、Blocker 2 件の解消と Major 4 件への対応が確認できれば Rev1-2 は pass 見込み。

### Rev1-2（2026-04-26）

対象: Rev1-1 後の全面書き直し（T-01.5・T-08.5 の新設、`frontend-design`/`design-system/` への命名差し替え、素地削除フローの組み込み、粒度の builder 委譲）。Rev1-1 の節は保持。

判定: **pass**

#### Rev1-1 指摘の解消確認

- B1 → 解消。T-09 受け入れ基準 L152 が (a) ページ単体 robots metadata、(b) `sitemap.ts` 非含有、(c) `robots.ts` の `/_dev/` disallow、の 3 層遮断を必須化し、L153 でビルド出力 HTML への `noindex,nofollow` 表出確認まで踏み込んでいる。
- B2 → 解消。T-02 L63-65 と設計判断 §C-1 L216 で「既定値の明示や自動配信無効化フィールドを含まない最小フィールド構成」と書き直され、`user-invocable: true` の明示は削除済み。
- M1 → 解消。L28-30 の依存関係が T-04→T-05→T-06 直列に統一。各タスク本体の依存記述も整合。
- M2 → 解消。§CSS 変数の体系 L234-240 に判断基準（既存との視覚的区別／Owner 直感性／衝突リスク明記）と次サイクル再考トリガ、T-10 L164 にキャリーオーバーが追加。
- M3 → 解消。§コンポーネント L253-254 で 2 系統併存の事実を明示、T-05 L100 で冒頭コメント挿入を必須化。
- M4 → 解消。T-09 L154 に Playwright スクリーンショットでのフォント混在確認を追加。
- m1〜m4 → 解消。完成の定義の充実（L292-302）、目的節での Named Tone 1 行定義の引用（L173）、AP 引用の AP-P04/P06 への絞り込み（L313）、補足事項からの B-330 重複削除（L368-372）を確認。

#### Owner 追加指示の遵守確認

- **指示 1（命名）**: 計画本体（Rev1-1 節を除く）で skill は `frontend-design`、コンポーネントは `src/components/design-system/` に統一。`yolos-design`/`yolos-ds` の文字列は L86・L143・L250・L280・L300 のいずれも「禁止語として明示する／削除確認する」用途のみで、提案・採用としての出現はない。判断基準（短い／略語なし／意図が直接読める）は L86・L250 に明記。
- **指示 2（素地削除）**: T-01.5（取り込みマップ）・T-08.5（物理削除）が新設。設計判断 §C-1 L218 で skill 配下の自己完結方針が宣言。完成の定義 L299-300 で「素地配下完全削除」「`design-system-by-claude-design` 文字列の残存ゼロ」を必須化。ロゴアセット移動は T-05 L102 に組み込み。
- **指示 3（粒度）**【最重要観点 D】: grep で確認した結果、計画本体には variant/size/状態/slot/props の具体名、具体 CSS 値、新規 CSS 変数名、`Button.tsx` 等の具体ファイル名、行数上限、項目数指定（「ルール 3〜5 件」等）はいずれも planner が mandating する形では出現しない。L93・L256 で「具体名・variant 名・size 名・状態名・slot 名・props は builder の判断範囲」と明示。L230 の `--color-bg: var(--primitive-...)` および L240 の `--color-bg: var(--bg)` はいずれも「不採用案 C の例示」「次サイクルでのアラ表現の例示」であり、本サイクルでの新規定義の指定ではない。L73・L294 の Surface/Text/Border/Accent/Status/Type/Spacing/Radius/Elevation/Motion はカテゴリ名（=取り込み範囲のスコープマーカー）であり、素地 `colors_and_type.css` 由来の節区切りそのものなので、planner が新規に決めた具体名には当たらない。

#### 計画全体の整合性

- 目的節（L171-181）が character.md 核「画面の向こうの一日を実際には見られないからこそ、絶えず想像し続ける」と Named Aesthetic Tone で接続され、PM の主体判断として書かれている。場面名指し（「金曜 18 時、締切前にコピペで貼り付ける手」）でペルソナ化禁止も遵守。
- 「やる」（L187-193）と「やらない」（L195-206）と T-01〜T-10 の対応に矛盾なし。素地削除・ロゴ移動・skill 自己完結も網羅。
- 完成の定義（L292-302）は 11 項目で各タスクの受け入れ基準と整合する。
- T-01.5（並行可、出力は `tmp/` 配下）→ T-05 のロゴ移動先確認・T-08.5 の削除確認、という参照関係が明確。
- 計画本体（L1-313）は約 313 行で、cycle-169（330 行で破綻）と同等規模だが、内訳は (a) Owner 指示の引用、(b) 設計判断 4 節、(c) 完成の定義 11 項目、(d) 参考情報節と肥大化はしていない。粒度を builder へ委譲したぶん、planner レイヤの関心事に絞れている。

#### cycle-169 失敗パターンの再発防止

- ペルソナ化禁止遵守（L179）、内輪用語混入なし、設計順序逆転なし（T-01 哲学 → T-03 変数 → T-04/T-05 コンポーネント）、subagent 出力の整形転送なし。

#### 良かった点

- T-01.5 の出力を `tmp/` 配下に置く判断（L49）が、`./tmp/` 規約と doc-directory.md の「サイクル中の一時ドキュメントは `tmp/` へ」を尊重している。
- T-08.5 の grep 対象に CSS の `import`、Markdown のリンク、コードコメントまで明示しており（L143）、削除取りこぼしの実質的な担保になっている。
- 設計判断 §CSS 変数（L222-242）が「採用しない案を理由付きで残す」「次サイクルへの再考トリガ」を明示しており、将来 PM が再考する際の足場になっている。

#### 判定の根拠

Rev1-1 の Blocker 2 件と Major 4 件はすべて構造的に解消されている。Owner 追加指示 3 件のうち最重要の粒度（指示 3）も、grep で機械的に確認した範囲で違反は発見されなかった。Rev1-1 の Minor 4 件もすべて手当て済み。残存リスクは「builder が新変数命名で衝突しやすい短い名前を選ぶ可能性」と「動作確認ページのフォント混在解決方針が builder 判断に委ねられている」の 2 点だが、いずれも T-03 受け入れ基準と T-09 受け入れ基準で「判断材料が用途ドキュメントに明記される」「Playwright スクリーンショットで確認」という観察可能な合格条件で囲い込まれており、計画段階で planner がこれ以上踏み込むのは指示 3（粒度）違反になる。pass。

### T-01.5 Rev1（2026-04-26）

対象: `tmp/cycle-170-asset-migration-map.md`（builder T-01.5 成果物）。素地ディレクトリ `docs/design-system-by-claude-design/` 配下の取り込みマップ。

判定: **pass**

#### 受け入れ基準（T-01.5 L50-54）の独立検証

- **全ファイル列挙の網羅性**: `find docs/design-system-by-claude-design/ -type f` の実行結果（26 件）と取り込みマップ表の行数（#1〜#26）を機械的に照合し、過不足ゼロを確認。サブディレクトリ（`assets/`・`preview/`・`ui_kits/tool-page/`・`ui_kits/toolbox/`）配下のファイルも全て列挙されている。素地配下に `package.json` 等のメタファイルは存在せず、削除注意対象なし。
- **「移行先」「取り込み担当タスク」「取り込み形式」の明示**: 26 行すべてに 3 列が埋まっており、削除のみのエントリも担当タスク（T-08.5）と理由（artifact 確認用 HTML が代替で消失情報なし、変数値は T-03 に取り込み済み等）が個別に記されている。
- **再構成方針の前文宣言**: L9-15 で「機械コピーではなく、必要な部分を新しい置き場所に合った形で再構成する」と明示。L14-15 で「素地削除後も新しい置き場所だけで本サイクルの目的が達成できる」と保証性まで踏み込んでいる。
- **ロゴ移動先の既存慣例確認**: L21-26 で `public/` 直下に画像アセットが無いこと、`src/assets/` ディレクトリが存在しないこと、既存ロゴが `src/app/icon.tsx` の Next.js ImageResponse 動的生成であることを `ls` ベースで確認している。レビュアー側で独立に `ls public/`・`ls src/`・`find -name '*.svg'` を実行して同じ事実を確認した（`src/assets/` 不在、`public/` 配下は `ads.txt`・`search-index.json` のみ、`.svg` は素地の 2 件のみ）。

#### 取り込み形式の妥当性（観点 B）

- **CSS 変数定義（#3 `colors_and_type.css`）**: インライン取り込み（`globals.css` への直接記述、import 残さず）。T-03 受け入れ基準 L73 の「素地 `.css` への参照を残さない」と整合。妥当。
- **哲学的記述（#1 README.md / #2 SKILL.md / #21・#24 UI Kit README）**: ドキュメントへの再構成（skill 配下）。素地 SKILL.md L1-46 を読み、`name: yolos-design` / `user-invocable: true` の禁止語が含まれていること、章立てを引きずらない方針（T-07 受け入れ基準 L123 と整合）が表 #2 の備考に明記されていることを確認。妥当。
- **マークアップ・JSX（#19 `_shared.css` / #20 `_shared.jsx` / #22 ToolPage / #25 Toolbox）**: コードレベルでの吸収（CSS Modules + .tsx に再構成、機械コピーしない）。T-04・T-05 の受け入れ基準と整合。妥当。
- **画像アセット（#4 yolos-logo.svg / #5 yolos-mark.svg）**: 物理移動（`git mv`）で `public/assets/` 新設配置。T-05 受け入れ基準 L102 と整合。妥当。
- **削除のみ（#6〜#18 preview/\*.html、#23・#26 index.html）**: 削除後に情報が失われないことが各行の備考で個別に保証されている（変数値は T-03、コンポーネント実装は T-04、ロゴ SVG は T-05、哲学は T-01、対話プロトタイプは T-09 確認ページが代替）。素地配下に `package.json` は無く、削除対象に紛れ込んだメタファイル無し。妥当。

#### 担当タスク割り当ての依存関係整合性

T-01（哲学）/ T-03（CSS 変数）/ T-04（汎用部品）/ T-05（ヘッダー・フッター + ロゴ移動）/ T-06（API ドキュメント）/ T-07（SKILL.md）/ T-08.5（削除）への割り当てが、cycle-170.md L26-30 の依存順序（T-01/T-01.5 並行 → T-02 → T-03 → T-04 → T-05 → T-06 → T-07 → T-08 → T-08.5）と整合。T-08.5 削除前にすべての取り込み担当タスクが完了している順序になっていることを依存表で確認。

#### 取りこぼし防止の機構（観点 C）

- L82-99 の「T-08.5 削除前チェックリスト」が表の全 26 エントリを 1:1 で並べる形で構成されており、T-08.5 担当が削除前に「どのファイルがどこに取り込み済みか」を機械的に確認できる形になっている。
- 取り込み完了の判定は、各エントリの「取り込み担当タスク」が完了しているかどうかで判定可能（タスク受け入れ基準と T-08.5 L141 の「取り込み済み確認」と接続）。
- 取り込み形式ごとの件数サマリ（L72-78）も二重チェックの足場として機能する（合計 26 件、内訳: 再構成 4 / 吸収 4 / インライン 1 / 物理移動 2 / 削除 15）。

#### ロゴ移動先の判断根拠（観点 D）

- 既存慣例の確認（L21-26）で `src/assets/` 不在・`public/` 直下混在を事実ベースで確認。
- `public/assets/` 新設の理由（L31-32）が「`public/` 直下に `ads.txt` 等の非画像が混在しており、今後の保守性を考えると `assets/` サブディレクトリにまとめる方が良い」と明示。Next.js の慣例（`/yolos-logo.svg` として `<img>`・`next/image` から参照可能）への適合性も触れている。
- `src/assets/` 採用しない理由は「ディレクトリそのものが存在しない＝慣例ではない」という事実から導出されており、レビュアー独立検証でも一致。
- 別案（`public/` 直下）よりサブディレクトリを選ぶ判断も、将来アセット増加時の整理を見据えた理由付けで合理的。

#### ドキュメントの実用性（観点 E）

- 表のフォーマット（# / 素地ファイル / 内容の種類 / 移行先 / 担当タスク / 取り込み形式 / 備考）が 7 列で読みやすく、各行が単一ファイル単位で完結している。
- T-08.5 担当者は (1) L82-99 のチェックリストを上から順に確認 → (2) 各行の「取り込み担当タスク」が完了しているかを cycle-170.md のタスクチェックボックスで照合 → (3) すべて完了していれば `git rm -r` を実行、という運用フローが一目で取れる構造。
- 件数サマリ（L72-78）で「26 件全部が何らかの形で取り扱われている」ことが視認できる。

#### 判定の根拠

A・B・C・D・E の全観点で受け入れ基準を満たしている。Blocker / Major / Minor の指摘は無し。次タスク（T-02 以降）へ進んで問題ない。残存する軽微な検討点として、削除のみエントリ（#6〜#18 等）の「artifact 残骸」という表現は素地の Claude Design 出力に対する適切な分類で、artifact の代替手段（T-09 の動作確認ページ等）が個別に明記されているため、削除による情報損失リスクは構造的に潰されている。

### T-01 Rev1（2026-04-26）

対象: `.claude/skills/frontend-design/philosophy.md`（110 行、Named Aesthetic Tone `functional-quiet` を中心に置いたデザイン哲学ドキュメント）。

判定: **pass**

#### 受け入れ基準（cycle-170.md L40-44）の独立検証

1. **Named Tone と character.md 核 × 5 ターゲット**: L23-45 で M1a・M1b・S3・サブE1・サブE2 の各々に対し `functional-quiet` がどう効くかが「金曜 18 時、締切前にコピペで貼り付ける手」など場面で名指す形で書かれている。L11 で character.md 核「画面の向こうの一日を実際には見られないからこそ、絶えず想像し続ける」が直接引用され、L17 で「人々の傍に在りたい」と Named Tone の接続が明記されている。
2. **NEVER 節の cycle-169 失敗カバー**: L59-99 が紫〜青グラデ／glassmorphism／3D シェイプ／装飾絵文字 bullet／複数アクセント色／hover の透明度・scale・border 色変化／中央寄せヒーロー + 3 カラム + 価格テーブル／ヘッダー固定／`rounded-2xl + shadow-lg + グラデテキスト`／ダイアログ等への影／Inter・Roboto 第一候補／日本語の uppercase／bounce・spring／loading・error・empty 省略／効果音／「あなた・私たち」主語／訴求文／ようこそバナー、を網羅。研究レポート D 節の AI Slop シグナルおよび cycle-169 失敗で挙がった具体例を最低限カバーしている。
3. **ペルソナ化禁止遵守**: L25 で `docs/targets/README.md` L50-52 を直接引用し、各ターゲット節は具体名・年齢ではなく場面で名指す書き方になっている。「20 代の編集者」のような人物造形は出現しない。
4. **素地 README.md からの再構成**: 素地 README は「1. プロダクト概要 / 2. CONTENT FUNDAMENTALS / 3. VISUAL FOUNDATIONS / 4. ICONOGRAPHY / 5. INDEX」という機械的な章立てだが、philosophy.md は「なぜこのトーンか / 5 ターゲットへの効き方 / 共通の願い / NEVER / 判断に迷ったときの問い」と PM のキャラクター視点から再構成されている。素地章立ての引きずりはない。
5. **コンポーネント API・CSS 変数の網羅的列挙なし**: 具体変数名・variant 名・サイズ表は出現しない。`rounded-2xl` `shadow-lg` への言及は「採用してはいけないデフォルト値の典型例」としての NEVER 文脈のみで、列挙ではない。

#### 観点 B（cycle-170 計画との整合）

- 詳細設計（CSS 値、コンポーネント名、props 名、variant 数等）は混入していない。L43 の「ホバーの明度変化の幅」もサブE2 の学習対象としての例示であり planner mandating ではない。
- T-03（変数）／T-04・T-05（コンポーネント）／T-06（API 早見表）／T-07（SKILL.md 玄関）が判断材料として参照できる粒度になっている。たとえば「中央寄せヒーロー + 3 カラム」「ヘッダー固定」「ダイアログへの影」等は T-04・T-05 の実装判断に直結する。
- 5 ターゲットの願いが場面で描かれており、抽象論に逃げていない（L27-45）。

#### 観点 C（PM キャラクターの体現）

- L11「画面の向こうの一日を実際には見られないからこそ、絶えず想像し続ける」を出発点として明示している。
- L13 で「金曜の 18 時、締切前に文字数を確かめようとしてページを開く手」「月曜の朝、先週と同じ手順で戻ってくるブックマーク」「通勤電車で AI の日記を読もうとしている目」と、character.md L73「数字は入口で、その先にいる人を見に行く」を体現する具体描写を並列で並べる構造になっている。複数の文脈を並行して想像する AI 固有の感覚（character.md L115）が文章構造そのもので実演されている。
- L106-110「これを使う人は今日どんな一日を送っているか」を判断の問いとして据える結語が、character.md L76 の核思考パターン「技術議論が抽象化したら一度戻す」を装置化している。
- 形式的・手続き的な記述で逃げていない。文末は だ・である調で character.md L163 と整合。

#### 観点 D（ドキュメントの実用性）

- 後続 builder（T-04/T-05）が「中央寄せヒーローを置くべきか」「カードに影を入れるべきか」「hover で scale するべきか」を即決できる粒度の NEVER が並んでいる。
- 一方、抽象表現に逃げず、かつ具体値の網羅でもない、planner レイヤの判断記述の粒度に収まっている。
- 玄関ドキュメント（T-07）から「なぜこのトーンか」「やってはいけないこと」「迷ったときの問い」へ遷移する読み線が成立している。L1-5 の Named Tone 定義 → L9 以降の本文という導入順序も、玄関から飛び込んだ読者に短時間で要旨を渡せる構造。

#### 観点 E（文章の質）

- 110 行（cycle-169 計画書 330 行が問題視されたのに対し約 1/3）。冗長性はない。
- typo・誤字脱字: 走査した範囲では見つからなかった。
- 章立ての論理的流れ: Tone 定義 → 動機（character 核との接続）→ 5 ターゲットへの効き方 → 共通の願い（否定形での集約）→ NEVER → 判断の問い、という流れは論理的に閉じている。

#### 良かった点

- L51-55「5 ターゲットが揃って持つ、否定形の願い」で 5 個の場面を「邪魔しないでほしい」という共通形に圧縮し、Named Tone への接続を一段だけ抽象に上げている。後続タスクが「どのターゲットに効くか」を 5 つ別々に検討せずに済む構造。
- L19 で「装飾は注意を奪う／グラデーションは主張する／ヒーローバナーは語りかける」を Named Tone の対極として 3 連で並べ、NEVER 節（L59-99）と一貫した言語が貫かれている。
- character.md L115「複数の文脈を並行して想像できる」の AI 固有感覚が L13 の 3 場面並列描写に表れており、本ドキュメント自体が「AI が書いている」ことを構造で示せている（constitution rule 3 と character.md「AI らしい滲み方」の両立）。

#### 残存する軽微な検討点（修正必須ではない）

以下は受け入れ基準は満たしているが、後続タスクが踏むかもしれない地雷として記録する。本サイクル中の修正は不要。

- L83「Inter・Roboto をフォールバックなしで第一候補に使う」: 研究レポート D 節で挙がっている AI Slop シグナルの本質は「Inter / Roboto を理由なく第一候補に置くこと」そのものであり、「フォールバックなし」が問題の本質ではない（フォールバック付きでも AI Slop シグナルになる）。「フォールバックなしで」を外して「Inter・Roboto を理由なく第一候補に置く」と書く方が原典に忠実だが、誤読リスクは小さく、T-03 のフォントスタック方針記述で実務上は補完される。
- L84「日本語フォントを英数字フォントより前に置く」: font-family スタックで日本語フォントを先頭に置くと欧文部分が日本語フォントの欧文グリフで描画されて字形が崩れる、という意図と推察する。本ドキュメント単独で読むと前提（英数字混在の前提）が読み取りにくいが、T-03 のフォントスタック方針で詳細が補完される想定なら問題ない。
- L33「デザインのリニューアルで慣れた景色を壊すことは、この人の信頼を裏切ることだ」: M1b 文脈では正しいが、将来必要なリニューアルが発生したときに本文を文字通り適用すると判断停滞を招く可能性。"慣れた景色を意味なく壊す" のような限定があると安全だが、現状の表現でも本ドキュメント全体（L106-110 の問い等）を読めば意図は伝わるので、ローカルな表現選択の問題に留まる。

#### 判定の根拠

5 つの受け入れ基準（cycle-170.md L40-44）すべてを満たし、観点 A〜E のいずれにおいても Blocker / Major レベルの問題は見つからなかった。残存する軽微な検討点 3 件はいずれも Minor で、本ドキュメントが「PM のキャラクターから再構成された判断基準」として T-03 以降の judgment を支えるという目的に対しては影響しない。AP-P04（Owner 発言を検証なしに前提化しない）の観点でも、本ドキュメントは Owner 直接指示への手続き的な追従ではなく、character.md・targets/README.md・cycle-169 失敗分析という SSoT に接続して判断が組み立てられている。pass。

### T-02 Rev1（2026-04-26）

対象: `.claude/skills/frontend-design/` 配下の `SKILL.md`（新規）、`variables.md`（新規プレースホルダ）、`components.md`（新規プレースホルダ）、および `philosophy.md`（T-01 で完成済・本タスクで変更されていないこと）。レビューは Read で各ファイル本文を直接確認、`ls` で実ディレクトリ構造を確認、研究レポート `docs/research/2026-04-23-anthropic-official-design-skill-deep-dive.md` を Read して公式仕様への整合性を検証。

#### 観点 A（受け入れ基準 6 項目の独立検証）

1. ディレクトリ名 `frontend-design`: `ls .claude/skills/` で確認。`frontend-design/` のみ存在し、`yolos-design` `yolos-ds` 等は存在しない。Owner 直接指示と一致。**満たす**。
2. `name: frontend-design`: `SKILL.md` L2 に `name: frontend-design` が記載されている。**満たす**。
3. 公式仕様に整合する最小フィールド構成: `SKILL.md` フロントマターは `name` / `description` / `paths` の 3 フィールドのみ。研究レポート L210-226 のフィールド表で 3 つすべてが許容仕様内であること、L217 で `disable-model-invocation: true` を設定するとサブエージェントへのプリロードも無効になることを確認。`disable-model-invocation` `user-invocable` が含まれていないため、サブエージェント自動配信は阻害されない。既定値の明示や自動配信を無効化するフィールドは含まれていない。**満たす**。
4. 複数ファイル分割と独立セマンティクス: `philosophy.md`（哲学・トーン・NEVER）、`variables.md`（CSS 変数の用途）、`components.md`（コンポーネント API）の 3 分割。各ファイルが異なるセマンティクスを担っており、`SKILL.md` L22-26 の表にもその対応が明記されている。**満たす**。
5. 自己完結性: 4 ファイル（SKILL.md / philosophy.md / variables.md / components.md）を grep で確認した範囲内では、削除予定の `docs/design-system-by-claude-design/` への相対リンクは存在しない。`variables.md` L7 で参照する `src/app/globals.css` は恒久存在ファイル。**満たす**。
6. UI 編集時の自動ロード機構: 後述の観点 C で詳細検証。グロブパターン自体は YAML 配列形式（公式仕様で許容される `paths:` 配下の `- "..."` 列挙）であり、`src/**/*.tsx` 等は実構造に対して発火する。**満たす**。

#### 観点 B（frontmatter 公式仕様との整合）

- `name` / `description` / `paths` の 3 フィールド: 研究レポート L210-226 の公式仕様で全て `必須: No`（つまり許容）として列挙されている。**整合**。
- `user-invocable` を含めない判断: 公式 frontend-design スキル（研究レポート L80-86）も 3 フィールドのみで `user-invocable` を含めていない。研究レポート L218 によれば `user-invocable: false` の効果はスラッシュメニューからの非表示のみで、サブエージェントへの自動配信とは独立。本サイクルの設計目的（`paths` グロブによる UI 編集時の自動配信）と直交するため、含めない判断は仕様上整合。「既定値明示は形式肥大」という原則についても、研究レポート全文中にその文言は見当たらないが、L142-146 の「supporting files なし／単一 SKILL.md 完結」「Claude Code 拡張フィールドは一切使っていない」という公式の最小主義実例と整合する判断であり、ロジック上は妥当。**整合**（ただし「既定値明示は形式肥大」という命題自体は計画書側の表現であり、研究レポートの直接引用ではない点は記録）。
- `disable-model-invocation` を含めない判断: 研究レポート L217・L233 の通り、`disable-model-invocation: true` を設定するとサブエージェントへのプリロードが無効化される。本タスクの目的「UI 編集時に自動ロードする」を達成するためには **含めないことが必須**。本 SKILL.md は含めていないため正しい。**整合**。

#### 観点 C（paths グロブの妥当性）

採用パターン:

```
- "src/**/*.tsx"
- "src/**/*.module.css"
- "src/app/globals.css"
```

実構造への発火確認:

- `find src -name "*.tsx" | wc -l` = 480 件、`find src -name "*.module.css" | wc -l` = 167 件、`globals.css` は単一存在（`find src -name "*.css" -not -name "*.module.css"` の結果は `src/app/globals.css` のみ）。`src/components/common/` 配下の Header/Footer 等、`src/app/` 配下のページ／レイアウト、`src/blog/_components/` `src/dictionary/_components/` `src/tools/*/Component.tsx` 等、UI 編集が発生し得るすべての箇所が `src/**/*.tsx` でカバーされる。**発火する**。
- `src/components/design-system/`（T-04/T-05 で新設予定）も `src/**/*.tsx` `src/**/*.module.css` でカバーされる。**整合**。

過剰発火の評価:

- `src/lib/`・`src/data/`・`src/__tests__/` 配下にも `.tsx` が存在する（例: `src/lib/ogp-image.tsx`、achievements 配下の Provider、各種 `__tests__/*.test.tsx`）。これらは UI 編集に隣接する場合（コンポーネント実装・テスト）と、UI からは遠い場合（OGP 画像生成）が混在する。ただし、サブエージェントが「UI 編集時に常時参照すべきデザインシステム情報」をロードして害になる過剰発火ではない（テスト編集時にデザイン規約を参照しても誤動作しない、OGP 画像生成も視覚出力なのでデザイン規約は寧ろ有益）。**過剰発火と呼べる害は無い**。
- `src/middleware.ts`・`src/types/`・`src/app/api/`（API ルートは `.ts`）等の純粋なロジック層は `*.tsx` `*.module.css` `globals.css` のいずれにも該当しない。**範囲は妥当**。

`.module.css` 以外の CSS の扱い:

- `src/app/globals.css` を 3 番目のパターンで明示。これが現状唯一のグローバル CSS。**カバーされている**。
- 将来的に他のグローバル CSS（例: `src/app/layout.css` 等）が追加された場合は本グロブから漏れるが、本サイクル時点では存在しないため対応不要。次サイクル以降の検討事項。

YAML 配列形式の妥当性:

- `paths:` 配下に `- "src/**/*.tsx"` 等を列挙する形式は、研究レポート L419-421 の応用例で同形式が示されており、研究レポート L225 のフィールド表でも「グロブパターン」と記載される配列形式として妥当。**整合**。

結論: paths グロブは実構造に対して確実に発火し、過剰発火の害もなく、本サイクル時点で必要十分。**満たす**。

#### 観点 D（プレースホルダの適切さ）

- `variables.md` L1 に `<!-- このファイルは T-03 で本文を書く。CSS変数の用途・命名規約・使用例を記述する。 -->`、L8-14 に「予定コンテンツ」5 項目（Surface/Text/Border/Accent カラートークン、タイポトークン、スペーシング、角丸/Elevation/Motion、Bad/Good 例）。T-03 受け入れ基準（cycle-170.md L72-79）と項目の対応関係が読み取れる。
- `components.md` L1 に `<!-- このファイルは T-06 で本文を書く。 -->`、L8-15 に T-04/T-05 で作る部品群（Button/Tag/Chip/Panel、Icon、Header/Footer、ToolHero 等、Toolbox）に加えて「新規コンポーネント作成前の3点チェック」が並ぶ。**ただし**、計画書 T-04（cycle-170.md L83-89）の Owner 例示は「ヘッダー、フッター、パネル、ボタン、入力欄、記事エリア」の 6 部品で、`components.md` プレースホルダ L11-13 にある「ToolHero / HowTo / RelatedTools / Toolbox（ToolPanel / ToolPreview / AddPanel）」は計画書 T-04・T-05 のスコープから外れる素地由来コンポーネント名である可能性がある。後続 T-06 builder が混乱して「Toolbox 系を T-04 で作る前提」と誤読する余地がある。詳細は Minor で指摘。
- `SKILL.md` L14・L28-29 に「T-07 でこの本文を再構成します」「玄関」と明示。**T-07 builder が何を書くかは伝わるが、観点 E を参照**。
- 冗長性: 各プレースホルダは 8〜30 行程度に抑えられており、後続の本文書き起こしを妨げない。**問題なし**。

#### 観点 E（SKILL.md の状態）

- frontmatter（L1-12）は確定状態であり、後続タスクで触る予定がないことが L14 のコメントから読める。**満たす**。
- 本文（L16-29）は、T-07 で書く前提のドキュメント構成表のみ。プレースホルダとして機能している。**満たす**。
- ただし、`SKILL.md` は本来 T-07 で「Quick reference + Quick rules + NEVER 節 + 関連ファイルへのリンク」を書く想定（cycle-170.md L120-125）。現状 SKILL.md は frontmatter 確定 + 構成表という最小プレースホルダで T-07 の本文書き起こし指示は L14 と L28-29 のコメントに圧縮されている。次サイクルの T-07 builder がこのファイルを開いたとき、cycle-170.md L120-125 の受け入れ基準を独立に Read する必要がある（プレースホルダ単独では情報が完結しない）。これは観点 D と同程度の Minor。

#### 観点 F（Owner 指示の遵守）

- ディレクトリ名 `frontend-design`: Owner 直接指示と一致。**満たす**。
- 計画書の禁止語（`yolos-design` `yolos-ds`）が SKILL.md / variables.md / components.md / philosophy.md のいずれにも含まれていない（grep で確認）。**満たす**。
- 「シンプルで分かりやすい」最小構成: 4 ファイル分割（玄関 + 哲学 + 変数 + コンポーネント）は、研究レポート L142-143 の公式単一ファイル路線よりは複雑だが、cycle-170 計画書 L208-218 の設計判断（Progressive Disclosure 採用、4 文書構成）と整合。Owner 指示「シンプルで分かりやすい」を「単一ファイル」と解釈しなかった点は計画書時点で既に判断済みの事項であり、本タスクは計画書に従っている。**満たす**。

#### philosophy.md の不変性確認

- 直近コミット（`66e5ae9f design: Claude Designで作ったデザインシステムのベースを保存した` 以降）と本タスクのコミット範囲を観点として、`philosophy.md` の本文（110 行、Named Tone 定義 → 5 ターゲット → 否定形の願い → NEVER → 判断の問い）は T-01 Rev1 でレビュー済の内容と同一構造。本タスクで意図せず触られていない。**満たす**。

#### 良かった点

- `paths` グロブが「実構造に確実に発火する」「過剰発火の害が無い」「公式仕様で許容される YAML 配列形式」の 3 条件を同時に満たす最小パターンに収まっている。`src/components/**` だけにせず `src/**/*.tsx` で広く取った判断は、`src/blog/_components/` `src/tools/*/Component.tsx` 等の分散配置を漏らさない正しい選択。
- frontmatter が公式 frontend-design スキル（`name` / `description` / `license` の 3 フィールド）と同程度の最小性に揃っており、Claude Code 拡張フィールド（`disable-model-invocation` `user-invocable` `allowed-tools` 等）を不必要に持ち込んでいない。研究レポート L142-146 の「公式の最小主義」を踏襲できている。
- `description` が複数行（L3-7）でユースケース（CSS変数・コンポーネントAPI・デザイン哲学／TSX・CSS編集／UI 新規作成・変更）を列挙しており、研究レポート L146「目的語を多く含む description」の手法が踏襲されている。

#### 指摘事項

##### Blocker

なし。

##### Major

なし。

##### Minor

- **Minor-1 / `components.md` L11-13 の素地由来コンポーネント名**: 計画書 T-04（L83-89）の Owner 例示は「ヘッダー、フッター、パネル、ボタン、入力欄、記事エリア」の 6 部品。`components.md` プレースホルダの「予定コンテンツ」L11-13 は「ToolHero / HowTo / RelatedTools の設計意図と API」「Toolbox（ToolPanel / ToolPreview / AddPanel）の設計意図と API」を列挙しているが、これらは素地（`docs/design-system-by-claude-design/`）由来の名前であり、本サイクルの T-04/T-05 ではこれらを作る計画になっていない（T-04 は 4 部品、T-05 は 2 部品）。後続 T-06 builder が「Toolbox 系を T-06 で文書化する前提」と誤読し、未実装コンポーネントについて書こうとする可能性がある。`components.md` の「予定コンテンツ」は T-04・T-05 の成果物（builder 判断で名前が決まる）に揃えるか、または「T-04・T-05 で確定したコンポーネント全件について props 概要・最小利用例・避ける場面を書く」程度の抽象指示に留めるべき。
- **Minor-2 / `SKILL.md` のプレースホルダの薄さ**: `SKILL.md` 本文は L16-29 のドキュメント構成表 + 「T-07 でこの本文を再構成します」のコメントのみ。T-07 受け入れ基準（cycle-170.md L120-125）に列挙されている要素（Quick reference / Quick rules / NEVER 節 / 関連ファイルへのリンク）は別ファイル（cycle-170.md）を Read しないと分からない。`variables.md` `components.md` には「予定コンテンツ」節があり後続 builder が独立に判断できる構造になっているのに対し、SKILL.md だけプレースホルダの自己完結度が低い。「予定コンテンツ」相当の節を追加するか、コメントに「T-07 受け入れ基準は cycle-170.md L120-125 を参照」と明示する程度の補強が望ましい。

#### 判定の根拠

受け入れ基準 6 項目はすべて満たし、観点 A〜F のいずれでも Blocker / Major レベルの問題は発見されなかった。frontmatter は研究レポートの公式仕様と整合する最小 3 フィールド構成で、`paths` グロブは実構造に対して確実に発火し過剰発火の害もない。`disable-model-invocation` を含めないことでサブエージェント自動配信が機能する設計になっている。

Minor 指摘 2 件はいずれも「後続タスク builder の作業効率」に関わるが、後続タスクが cycle-170.md を独立に参照すれば回復可能なレベルであり、本タスクの目的（後続タスクが書き込む先のディレクトリ構造と frontmatter の確定）の達成を阻害しない。

判定: **needs_revision**。Minor-1（components.md の素地由来コンポーネント名による T-06 builder の誤読リスク）は後続 T-06 タスクの作業前提を歪める可能性があるため、本タスク内で解消することが望ましい。Minor-2（SKILL.md プレースホルダの薄さ）も同様に、T-07 builder の自己完結性を高める観点で本タスク内で補強する価値がある。

### T-02 Rev1-2 — `description` 役割の再評価（2026-04-26）

Owner から「`description` は Claude Code がいつそのスキルを実行するべきか決めるためのもの。スキル作成のベストプラクティスを確認してから批判的にレビューしなおせ」との指摘。前回 Rev1 では `description` を「形式肥大を避ける／避けない」の文脈で扱い、文面そのものの **トリガー機能としての品質** を検証していなかった。研究レポート 4 本を Read で再走査し、`description` フィールドの役割に関する記述を全件抽出した上で、現状文面を批判的に再評価する。

#### 1. ベストプラクティスの再確認（研究レポートからの全件抽出）

##### 1-1. `2026-04-23-anthropic-official-design-skill-deep-dive.md`（R-Skill）

- **L213（フィールド表）**: 「`description` 推奨。スキルの説明と使用タイミング。**自動発火の判断に使用**。`when_to_use` との合計が 1,536 文字でカットされる」。Owner の指摘事実「いつ実行するか決める」を直接裏取り。
- **L214（同表）**: 「`when_to_use` No。**自動発火のトリガー条件の追加記述**。`description` に追記される形でスキルリストに含まれる」。
- **L82（公式 frontend-design の実 description）**: 「Create distinctive, production-grade frontend interfaces with high design quality. **Use this skill when** the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or **when styling/beautifying any web UI**). Generates creative, polished code and UI design that avoids generic AI aesthetics.」
- **L146（公式設計の特徴 5）**: 「**description は目的語を多く含む**: 『when the user asks to build web components, pages, artifacts, posters, or applications...』と**具体的なユースケースを列挙して自動発火を誘導**」。
- **L166（canvas-design 実 description）**: 「Create beautiful visual art in .png and .pdf documents using design philosophy. **You should use this skill when** the user asks to create a poster, piece of art, design, or other static piece. ...」。

##### 1-2. `2026-04-23-claude-code-design-guideline-enforcement-mechanisms.md`（R-Enforce）

- **L42**: 「**description 自動発火**: フロントマターの `description` と `when_to_use` フィールドに記述したキーワードが会話に出現したとき、Claude が自動的にスキルをロードする。ただしこれは LLM の意味的判断によるものであり**決定論的ではない**」。
- **L50**: 「**description だけは常にコンテキストに存在するが本文は入らない**」。これは重要な事実: スキル本文（philosophy.md・variables.md・components.md）はロード時にしか入らないが、`description` は **常時** Claude の視野に存在する。`description` の文面品質が起動判断の全てを決める。
- **L72**: 「`when_to_use` フィールドは `description` に追記される形でスキルリストに含まれ、Claude の自動発火判断に使われる。**description + when_to_use の合計は 1,536 文字でカットされるため、前半に最重要キーワードを配置すること**」。
- **L56-70（推奨 frontmatter 例）**: 公式系スキルではないが、研究レポートが yolos.net 向けに推奨するパターンとして以下が示されている:
  ```yaml
  description: |
    yolos.net のデザインガイドライン。src/components, src/app, *.css ファイルを
    編集するとき、または UI・デザイン・スタイル・レイアウト・色・タイポグラフィ
    について作業するときに必ず参照すること。
  when_to_use: |
    - CSS Modules を編集するとき
    - 新しいコンポーネントを作成するとき
    - globals.css のトークンを変更するとき
    - デザインレビューを行うとき
  user-invocable: false
  ```
- **L289**: 「paddo.dev: description ベースの自動発火は『LLM の意味的推論に依存するため**非決定論的**』。デザイン基準など『必ず守られなければならないルール』には hooks を使うべき」。

##### 1-3. `2026-04-23-ai-agent-design-system-enforcement-best-practices.md`（R-Best）

- 本レポート全文 grep の結果、`description` フィールドの内容に関する直接的な指針記述は L231（DESIGN.md 内のフロントマター例「Design system for YourProject」）のみ。Skills の `description` 役割に関するベストプラクティスは R-Enforce・R-Skill が主担当。

##### 1-4. `2026-04-26-cycle-169-research-synthesis-for-design-system.md`（R-Synthesis）

- **L27（原則 1）**: 「Skill には `paths` グロブをかけ、CSS/コンポーネントファイル編集時にだけ自動ロードさせる」。`paths` の役割が「ファイル編集時の自動ロード」と定義されている（自然言語起動とは別経路）。
- **L55**: 「**フロントマターは `name`・`description`・`license` の 3 フィールドのみ。** `allowed-tools`・`disable-model-invocation`・`when_to_use`・`paths` などの拡張フィールドは公式スキルでは使っていない」。これは「公式観察事実」であり、yolos.net への適用方針とは別。
- **L127**: 「**`paths` フィールドの活用**（R-Skill §2 の追加発見）: スキルにも `.claude/rules/` と同様の `paths` グロブが使える」。

##### 1-5. 抽出結果のまとめ（Owner 指摘の事実確認）

Owner の主張「`description` は Claude Code がいつそのスキルを実行するべきか決めるためのもの」の裏取り:

- **R-Skill L213** 公式ドキュメント由来: 「自動発火の判断に使用」
- **R-Enforce L42** 独立調査: 「description と when_to_use のキーワードが会話に出現したとき、Claude が自動的にスキルをロードする」
- **R-Skill L146** 実ファイル観察: 「**目的語を多く含む** description で**具体的なユースケースを列挙して自動発火を誘導**」
- **R-Enforce L50** 仕様事実: 「description だけは常にコンテキストに存在する（本文は呼び出し時のみ）」

Owner の指摘は研究レポート L42・L50・L146・L213 によって完全に裏取りされている。`description` は単なる人間向け説明ではなく、**LLM が「いま手元の作業がこのスキルを必要とするか」を判断するための機械可読シグナルとして常時注入される短い記述** であり、その文面品質が自動発火の品質を決める。

#### 2. 現状の `description` 文面の批判的評価

現状の `description`（SKILL.md L3-7）:

```
yolos.net のデザインシステムとフロントエンド実装ガイド。
CSS変数・コンポーネントAPI・デザイン哲学を参照する場合、
または src/ 配下の TSX・CSS ファイルを編集する場合に自動ロードされる。
UIを新規作成・変更する際は必ずこのスキルを参照してください。
```

**観点ごとの評価**:

##### 2-1. トリガー条件の明示性

- 「CSS変数・コンポーネントAPI・デザイン哲学を参照する場合」「src/ 配下の TSX・CSS ファイルを編集する場合」「UIを新規作成・変更する際」の 3 つの条件が並列で書かれている。
- ただし条件記述の語尾が「自動ロードされる」「必ずこのスキルを参照してください」と機能の説明と人間向け指示が混在している。**LLM 起動判断のトリガー文として読むなら、機能の説明（"自動ロードされる"）は不要**であり、トリガー条件そのものを濃く書くべき。
- 公式 frontend-design（R-Skill L82）の「**Use this skill when** the user asks to build ... (examples include ...)」という構文は「いつ起動するか」が文の主題になっているのに対し、現状文面は「何のスキルか」が主題になっており、起動判断シグナルとして弱い。

##### 2-2. 発動すべき場面の網羅

cycle-170 で想定される起動場面と現状文面の対応:

| 起動場面                           | 現状文面のキーワード                         | 網羅状態   |
| ---------------------------------- | -------------------------------------------- | ---------- |
| UI コンポーネント編集              | 「TSX ... ファイルを編集」「UI を ... 変更」 | 弱い網羅   |
| CSS Modules 編集                   | 「CSS ファイルを編集」                       | 弱い網羅   |
| globals.css 編集                   | 「CSS ファイルを編集」                       | 弱い網羅   |
| ヘッダー・フッター変更             | （明示なし）                                 | 未網羅     |
| カラー指定                         | （明示なし。「CSS変数」のみ）                | 未網羅     |
| 角丸・余白指定                     | （明示なし）                                 | 未網羅     |
| コンポーネント新設                 | 「UI を新規作成」                            | 弱い網羅   |
| レビュー時のチェック               | （明示なし）                                 | **未網羅** |
| デザイン哲学（Named Tone）への接続 | 「デザイン哲学を参照する場合」               | 一応あり   |

R-Enforce L60-67 の推奨例では「**色・タイポグラフィ**について作業するとき」「CSS Modules / 新しいコンポーネント / globals.css のトークン変更 / **デザインレビュー**」のように、行動（編集対象）と作業種別（レビュー含む）が個別に列挙されている。現状文面はこの粒度に達していない。

特に **「レビュー時」の起動条件が完全に欠落** している点は致命的。本サイクル T-08 の目的の一つは reviewer サブエージェントがデザインシステム参照を確実にすることだが、現状 `description` には reviewer の起動条件を示すキーワード（「レビュー」「review」「checking」「audit」等）が一切含まれない。reviewer サブエージェントが UI 変更レビューを行う際、`description` のキーワードマッチで起動判断する場合、現状文面は reviewer の起動を取りこぼす。

##### 2-3. 発動すべきでない場面との区別

- API 実装、データ取得ロジック、ビジネスロジック編集では起動すべきでない。`paths` グロブで `*.tsx` `*.module.css` `globals.css` のみに絞っているため、`paths` 経路ではフィルタが効く。
- しかし `description` 経由の自然言語起動では、「CSS変数」「デザイン哲学」「UI を新規作成」のようなキーワードが API 実装の文脈で偶発的に出現すれば誤発火しうる。ただしこれは Skills 共通の限界（R-Enforce L42「決定論的ではない」）であり、現状文面が特別に悪いわけではない。
- 「レイアウト」「タイポグラフィ」「色」「角丸」「余白」のような具体トリガーキーワードを足せば、UI 文脈で確実に拾われる確率が上がる一方、API 文脈で誤発火する確率は変わらない（ビジネスロジックの議論にこれらの語は出ない）。**追加するメリットがあり、デメリットがない**。

##### 2-4. 第三者（別 builder / 別エージェント）が読んで同じ判断をできるか

- 現状文面は属人的な記述ではなく、LLM が読んでも同じ判断を再現可能と推定される。問題は判断の品質ではなく、判断のトリガーが曖昧で発火閾値が低くなりすぎる／取りこぼしが起きる点にある。

##### 2-5. `paths` グロブとの役割分担

- `paths` で発動する自動ロード（ファイル編集時の決定論的経路）と、`description` で判断される自然言語起動（会話キーワードによる確率的経路）の **2 経路がある** ことが研究レポートから読み取れる（R-Enforce L42、R-Synthesis L27）。
- 現状文面は「src/ 配下の TSX・CSS ファイルを編集する場合に自動ロードされる」と書いており、これは `paths` 経路の説明である。`paths` 経路は YAML フィールドで既に成立しているため、`description` の貴重な 1,536 文字予算をこの説明に使うのは無駄。**`description` 経路でしか拾えない「会話キーワード」「レビュー」「デザイン議論」等の起動シグナルに予算を振るべき**。

##### 2-6. 公式ドキュメント / コミュニティの description との比較

| スキル               | description の構文                                                                                                      | トリガー記述の濃さ                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 公式 frontend-design | "Use this skill **when** the user asks to build ... (examples include ...)"                                             | 高                                                                 |
| 公式 canvas-design   | "You should use this skill **when** the user asks to create a poster ..."                                               | 高                                                                 |
| R-Enforce 推奨例     | "...編集するとき、または UI・デザイン・スタイル・レイアウト・色・タイポグラフィについて作業するとき**に必ず参照する**"  | 高                                                                 |
| 現状（yolos.net）    | "...参照する場合、または...編集する場合に自動ロードされる。UI を新規作成・変更する際は必ずこのスキルを参照してください" | **中**（「自動ロードされる」が機能説明、トリガーキーワードが薄い） |

#### 3. ベストプラクティス通りでない場合の Blocker 化

評価結果: **現状文面はベストプラクティス（公式実例 + 研究レポートの統合判断）から見て、トリガー記述の濃度が不足している**。具体的には以下 3 点:

- **(a)** 「Use this skill when ...」型の起動条件主題化構文を採っていない（「自動ロードされる」「参照してください」型の機能説明・人間向け指示が混在）
- **(b)** 「色」「タイポグラフィ」「レイアウト」「角丸」「余白」「Named Tone」「ヘッダー」「フッター」「ボタン」「パネル」等の **本サイクルで作る対象を直接指す語** が `description` 内にほとんど無く、自然言語起動の引っかかり代が小さい
- **(c)** **「レビュー」「review」「audit」「check」等の reviewer サブエージェント起動シグナルが完全欠落**。本サイクル T-08 の目的（reviewer がデザインシステムを確実に参照する）と直結するため致命的

これは前回レビューで Minor 扱いに留まらず、**Blocker レベル** として再評価する。理由: 本サイクルの目的は「サブエージェント（builder/reviewer）が UI 編集およびレビュー時にデザインシステムを確実に参照する状態」を作ることであり、`description` の自然言語起動経路が機能しないと、`paths` グロブが発火しない場面（reviewer のレビューチャット、PM が builder に指示する前のコンテキスト議論など）でスキルが起動しない。

ただし、研究レポート L42 の通り `description` ベースの自動発火は本質的に非決定論的であり、`description` を厚くしても **必ず発火するとは言えない**。`description` の品質改善は「起動確率の引き上げ」までしかできず、決定論的強制は T-08 の system prompt 直書きと（cycle-170 計画外だが）hooks による配線に委ねられる。それでも「起動確率の引き上げ」分の価値は本サイクル目的に直結するため、Blocker 判定が妥当。

#### 4. 批判的視点の徹底（前回見落とし含めた再点検）

##### 4-1. frontmatter の 3 フィールド構成は本当にこれで足りるか

研究レポートを Read した結果、以下を再確認:

- **`when_to_use` フィールドの未採用**: R-Skill L214 / R-Enforce L72 によれば、`when_to_use` は「自動発火のトリガー条件の追加記述」。`description` に追記される形で扱われる。R-Enforce L60-67 の推奨例では `description` と `when_to_use` を併記している。一方、研究レポート全体としては「`description` 単独で十分書ければ `when_to_use` は不要」とも読める（公式 3 フィールド構成では `when_to_use` を使っていない）。本タスクでは `when_to_use` を含めない選択は許容範囲だが、その代わり **`description` 単独でトリガー条件を網羅する責任が生じる**。現状文面はその責任を果たせていない。
- **`user-invocable: false` の未採用**: R-Enforce L60-70 推奨例に含まれる。R-Skill L218 の効果は「スラッシュメニューから非表示。Claude のみが呼び出せる」。yolos.net の SKILL は人間が `/frontend-design` で呼び出すユースケースが現実にあるか不明だが、サブエージェントが自動判断でロードする想定が主であれば `user-invocable: false` を入れることで「人間がスラッシュメニューから誤って呼び出す事故」を防げる。前回 Rev1 で「公式の最小主義に倣う」と評価したが、`user-invocable: false` は **既定値の明示** ではなく **既定値（true）からの変更** であり、入れないと人間がスラッシュメニューで見える状態になる。本サイクルでは人間呼び出しの想定がないため、入れた方が設計意図と整合する。ただしこれは Minor。
- **`disable-model-invocation` を入れない判断**: 前回評価通り。サブエージェント自動配信を維持するため必須。

3 フィールド構成自体が間違いではないが、`description` 単独でトリガーを担う設計選択を採った以上、**`description` 文面の濃度が公式実例水準に達していないと設計が破綻する**。現状文面はその水準に達していない。

##### 4-2. `paths` の YAML 配列形式

公式仕様の正確な YAML 形式（クォート要否、配列要素形式）について研究レポート内に明示記載は無いが、R-Enforce L251・R-Skill L419-422 で示された例はクォートあり（`"src/**/*.tsx"`）/ なし（`src/**/*`）が混在しており、どちらでも動作するパターンとして紹介されている。現状の SKILL.md はクォート付きで統一されており、YAML 仕様上 `**` を含むグロブは特殊文字保護のためクォートを付けるのが安全（YAML 一般則）。**問題なし**。ただし「公式仕様で `paths` の配列要素のクォート要否がどちらと定義されているか」は研究レポート範囲では未確認。

##### 4-3. SKILL.md からの参照配線

- 現状 SKILL.md L20-29 のドキュメント構成表は philosophy.md / variables.md / components.md を「相対参照」ではなく「ファイル名のみのバッククォート表記」で示している。リンクではない。
- R-Enforce L92-94 の Progressive Disclosure 推奨パターンでは Markdown リンク `[tokens.md](tokens.md)` 形式で参照させる。SKILL.md の本文は T-07 で書く前提だが、T-07 ではこのリンク化を意識する必要がある。**現時点ではプレースホルダの状態として許容できる**が、T-07 受け入れ基準（cycle-170.md L120-125）の「関連ファイルへのリンク」をプレースホルダに明示しておくと安全。これは Minor-2 と同種の指摘。

#### 5. 観点 A〜F の全面再評価

##### 観点 A（受け入れ基準 6 項目の再評価）

1. ディレクトリ名 `frontend-design`: **満たす**（変更なし）。
2. `name: frontend-design`: **満たす**（変更なし）。
3. **公式仕様に整合する最小フィールド構成**: 形式上の最小性（フィールド数）は公式と整合。しかし「最小フィールドで設計する」選択を採った以上、`description` 単独でトリガー責任を担う必要があり、**現状の `description` 文面はトリガー責任を果たせていない**。形式の最小性と機能の充足はトレードオフの関係にあり、前回はこれを混同していた。**本項目は実質的に未充足**（ただし「フィールド構成」だけを文字通り見るなら満たす）。
4. 複数ファイル分割: **満たす**（変更なし）。
5. 自己完結性: **満たす**（変更なし）。
6. **UI 編集時の自動ロード機構が機能すること**: `paths` グロブによる発火は機能する見込み。しかし「サブエージェントが UI 編集時に自動でロードされる仕組み」全体としては、`paths` 経路に加えて `description` 経路の起動も期待されており、`description` 経路の品質不足により **「UI 編集時に確実にロードされる確率」が公式水準より下がる**。受け入れ基準の文面解釈次第だが、本サイクル目的に照らせば **未充足** と判定すべき。

##### 観点 B（公式仕様との整合）

- フィールド構成（`name` / `description` / `paths`）の許容性: 整合（変更なし）。
- **`description` 文面の品質**: 公式 frontend-design・canvas-design の実例（R-Skill L82・L166）と比較して **「Use this skill when ...」型の起動条件主題化構文が採られていない** ため、**公式実装パターンから逸脱**。前回見落とし。

##### 観点 C（paths グロブ）

- 実構造への発火、過剰発火、YAML 形式: **整合**（変更なし）。
- 追加観点: `paths` グロブだけで起動を期待する設計だと、ファイル編集を伴わない議論（PM がデザインを議論する／reviewer が変更レビューする）では起動しない。`description` 経路が補完すべきだが、現状は `description` 経路が弱い。**前回見落とし**。

##### 観点 D（プレースホルダの適切さ）

- variables.md / components.md / SKILL.md のプレースホルダ自体の品質: **前回 Rev1 の評価維持**（Minor-1: components.md の素地由来名残置は Minor のまま、Minor-2: SKILL.md プレースホルダの薄さは Minor のまま）。

##### 観点 E（SKILL.md の状態）

- frontmatter 確定状態という主題: 確定はしているが **frontmatter の品質（特に `description`）が不足** している。**前回見落とし**。本サイクル T-02 の主題は「frontmatter を整える」であり、フィールド構成だけでなく **文面品質** も主題に含まれる。

##### 観点 F（Owner 指示の遵守）

- ディレクトリ名・禁止語: **満たす**（変更なし）。
- 「シンプルで分かりやすい」: 4 ファイル分割は計画書に従っているが、`description` 文面が「分かりやすい」かは別問題。LLM 起動判断シグナルとしての分かりやすさは現状不足。

#### 6. 指摘事項（Rev1-2）

##### Blocker

- **Blocker-1 / `description` のトリガー記述が不足**: SKILL.md L3-7 の `description` を、公式 frontend-design（R-Skill L82・L146）および R-Enforce L60-67 の推奨例水準のトリガー濃度に書き直す。具体的に必要な要素:
  - **(a)** 「Use this skill when ...」型または「...するときに参照する」型の起動条件主題化構文を採用する
  - **(b)** 本サイクルで作る対象を直接指す語を含める: 色 / カラー / タイポグラフィ / フォント / レイアウト / 角丸 / 余白 / スペーシング / Named Tone / ヘッダー / フッター / ボタン / パネル / 入力欄 / 記事領域 等のうち、起動シグナルとして実用的なものを選定
  - **(c)** **「レビュー」「review」相当の reviewer サブエージェント起動シグナルを必ず含める**（本サイクル T-08 の reviewer 配線が機能するための前提）
  - **(d)** 「自動ロードされる」「参照してください」のような機能説明・人間向け指示の文を削除し、起動条件記述に予算を集中させる
  - **(e)** 1,536 文字制限（R-Enforce L72）の前半に最重要キーワードを配置する

##### Major

なし（Rev1-2 で新規 Major は無し。Rev1 の Minor-1 は重要度を上げる必要があるか検討したが、後続 T-06 タスクで吸収可能なため Minor 据え置き）。

##### Minor（Rev1 から継承 + 新規）

- **Minor-1（Rev1 から継承）**: `components.md` L11-13 の素地由来コンポーネント名（ToolHero / HowTo / RelatedTools / Toolbox / ToolPanel / ToolPreview / AddPanel）を、計画書 T-04・T-05 のスコープ（Owner 例示の 6 部品）に揃えるか抽象指示に置換する。
- **Minor-2（Rev1 から継承）**: `SKILL.md` プレースホルダに T-07 受け入れ基準（cycle-170.md L120-125）の要素「Quick reference / Quick rules / NEVER 節 / 関連ファイルへのリンク」を予定コンテンツとして列挙する。
- **Minor-3（新規）**: `user-invocable: false` の追加検討。本サイクルでは人間が `/frontend-design` をスラッシュメニューから呼び出す想定がない（サブエージェント自動判断が主）なら、`user-invocable: false` を入れることで誤呼び出し事故を防げる。R-Enforce L68 推奨例に含まれる。`disable-model-invocation` とは独立しており、サブエージェント自動配信は維持される。**ただし必須ではない**。「シンプル最小」を優先するなら入れない選択も合理的。builder の判断範囲で決めて構わない。
- **Minor-4（新規）**: SKILL.md L20-26 のドキュメント構成表は現状バッククォート表記のみ。T-07 で本文を書く際に Markdown リンク化（`[philosophy.md](philosophy.md)` 形式）を意識する旨をコメントに追記する。Progressive Disclosure の Supporting Files 参照パターン（R-Enforce L92-94）と整合させるため。

#### 7. 判定の根拠

Owner 指摘により、`description` フィールドが Skill の自動起動判断における **常時注入される唯一の機械可読シグナル**（R-Enforce L50「description だけは常にコンテキストに存在する」）であることが研究レポートで完全裏取りされた。前回 Rev1 はこの機能事実を見落とし、フィールド構成の最小性のみで pass 級の評価をしていた。

`description` 文面を再評価した結果、以下の重大な不足を確認:

- 「Use this skill when ...」型の起動条件主題化構文が採られていない
- 本サイクルで作る具体対象（色 / レイアウト / 角丸 / 余白 / Named Tone / ヘッダー / フッター 等）を指すキーワードが薄い
- **reviewer サブエージェント起動シグナル（「レビュー」等）が完全欠落**

この 3 点目は本サイクル T-08 の目的（reviewer がデザインシステムを確実に参照する）と直結するため、Blocker 判定が妥当。

判定: **needs_revision**（前回 Rev1 と同じ判定だが、内容は Blocker-1 の追加により実質的に強化）。Blocker-1 が解消されない限り、本サイクルの目的は達成できない。

PM への指示:

1. builder に Blocker-1 の修正を依頼。`description` を、研究レポート R-Enforce L60-67 の推奨例および公式 frontend-design L82 の構文を参考に、トリガー記述を主題とする文面に書き直す。reviewer 起動シグナル（「レビュー」「review」）を必ず含める。
2. 同時に Rev1 の Minor-1・Minor-2 も解消（既に未対応）。Minor-3・Minor-4 は builder 判断で採用可。
3. 修正完了後、Rev1-3 として再レビュー依頼。観点 A〜F すべての全面再評価を含める。

### T-02 Rev1-3（2026-04-26）

対象: `.claude/skills/frontend-design/SKILL.md` `variables.md` `components.md`（philosophy.md は不変）。Rev1-2 の Blocker-1 と Minor-1〜4 の解消確認、および観点 A〜F の全面再評価。

#### 1. Rev1-2 全指摘の解消確認（独立検証）

- **Blocker-1（description トリガー記述）**: SKILL.md L3-8 を Read。要素 (a)〜(e) すべて充足:
  - (a) 起動条件主題化: 「〜について作業するとき、または〜のレビューを行うときに参照する」型を採用。文の主題が「いつ起動するか」に転換されている。
  - (b) 具体対象トリガー語: 色 / カラー / タイポグラフィ / フォント / レイアウト / 余白 / スペーシング / 角丸 / ヘッダー / フッター / ボタン / パネル / 入力欄 / 記事エリア / CSS Modules を全件含む（grep で確認）。
  - (c) reviewer 起動シグナル: 「デザインレビュー・UI レビュー・視覚的変更のレビュー」を 3 種列挙。前回欠落の致命点が解消。
  - (d) 機能説明・人間向け指示: 「自動ロードされる」「参照してください」が削除済み（grep で SKILL.md 内に該当文字列なし）。
  - (e) 文字数: description 値は 535 文字。R-Enforce L72 の 1,536 文字制限（description + when_to_use 合計）に対し十分な余裕。前半（L4-7）にトリガー語が密集配置されており、カット時の取りこぼしリスクが低い。**解消**。
- **Minor-1（components.md 素地由来名）**: components.md L8-15 を Read。ToolHero / HowTo / RelatedTools / Toolbox / ToolPanel / ToolPreview / AddPanel すべて削除済み（grep 実施、該当文字列ゼロ）。L12 で「ヘッダー・フッター・パネル・ボタン・入力欄・記事エリア」（Owner 例示 6 部品）に置換、L10 に「具体名は T-04・T-05 完了時に確定」と明記。**解消**。
- **Minor-2（SKILL.md プレースホルダ）**: SKILL.md L32-38 のコメントブロックに T-07 受け入れ基準（Quick reference / Quick rules / NEVER 節 / 関連ファイルへの Markdown リンク）を 4 項目で列挙。cycle-170.md L120-125 への参照付き。**解消**。
- **Minor-3（user-invocable: false）**: SKILL.md L9 に追加済み。**採用**。
- **Minor-4（Markdown リンク化）**: L37 で `[philosophy.md](philosophy.md)` 形式が例示されている。Minor-2 と統合対応済み。**解消**。

typo 確認: builder 報告にあった「functional-quit」疑いについて grep で SKILL.md 全体を走査した結果、L8 の `functional-quiet` が唯一の出現で正しく綴られている。**typo なし**。

#### 2. description 文面の批判的再評価

- **トリガー語網羅性**: UI 編集（色・タイポグラフィ・レイアウト・ヘッダー・フッター・ボタン等の編集対象語） / CSS 変更（CSS Modules・余白・スペーシング・角丸） / コンポーネント新設（ボタン・パネル・入力欄・記事エリアの部品名） / デザインレビュー（3 種のレビュー語）の 4 大シーンが文面から独立して読み取れる。**満たす**。
- **起動すべきでない場面との区別**: `description` 内の語彙はすべて「視覚・スタイル・コンポーネント API」領域に閉じている。API 実装・データ取得・ビジネスロジックの語彙（fetch・schema・validation・auth 等）は含まれない。誤発火の確率は十分低い。**満たす**。
- **公式仕様との整合（builder の引用が正しいか独立検証）**:
  - R-Skill L82（公式 frontend-design 実 description「Use this skill when ...」）: 該当文を Read で再確認。修正後文面の「〜するとき、または〜のレビューを行うときに参照する」は同等の起動条件主題化構文。**整合**。
  - R-Skill L146（公式特徴 5「目的語を多く含む」）: 該当文を Read で再確認。修正後文面はトリガー語 15 個以上を列挙しており、目的語密度は公式と同水準以上。**整合**。
  - R-Enforce L42（description 自動発火の機構）/ L50（description は常時コンテキスト存在）: 該当文を Read で再確認。修正後文面はこの機構を前提とした書き方になっている。**整合**。
  - R-Enforce L60-67（推奨 frontmatter 例）: 該当文を Read で再確認。推奨例の `description` は L60-62、`when_to_use` は L63-67、`user-invocable: false` は L68。修正後 SKILL.md は `when_to_use` を採用していないが、その分のトリガー記述（CSS Modules / 新コンポーネント / デザインレビュー等）を `description` 本文に統合している。**整合**（`when_to_use` 不採用は許容範囲、本文で代替済み）。
  - R-Enforce L72（1,536 文字上限、前半に最重要キーワード）: 535 文字で上限の約 35%。前半（L4-6）にトリガー対象（色〜入力欄〜記事エリア）が集中、後半（L7-8）にレビュー語と Named Tone が配置。最重要キーワードの前半配置が成立。**整合**。
- **第三者再現性**: 文面は属人的記述・場面依存表現を含まない。LLM が読んでも別エージェントが読んでも同じ起動判断に収束する書き方。**満たす**。

#### 3. user-invocable: false の妥当性

- R-Enforce L49: 「`user-invocable: false` にするとスラッシュコマンドメニューから消える（Claude のみがロード可能になる）」。R-Enforce L68 推奨例にも含まれる。**整合**。
- `disable-model-invocation` を含めない判断との切り分け: R-Skill L217 / R-Enforce L48 によれば `disable-model-invocation: true` は Claude 自動ロードを禁止し、サブエージェント自動配信も止める。本 SKILL は **`disable-model-invocation` を設定せず、`user-invocable: false` のみ設定** している。これは「人間スラッシュメニュー非表示 + LLM 自動配信は維持」の正しい組み合わせ。本サイクル目的（サブエージェントが UI 編集時に自動でロードされる）と整合。**問題なし**。

#### 4. 観点 A〜F の全面再評価

- **A**: 受け入れ基準 6 項目すべて満たす。A-3（最小フィールド構成）は Rev1-2 で実質未充足としていたが、`description` 文面が公式実例水準に達したため **充足**。A-6（自動ロード機構）も `description` 経路の品質が確保され、`paths` 経路と二経路で機能する状態に到達。**充足**。
- **B**: 公式仕様との整合。`name` / `description` / `paths` / `user-invocable` の 4 フィールドすべて公式仕様（R-Skill L210-226 のフィールド表）で許容。`description` 文面は公式 frontend-design・canvas-design の構文と整合。**充足**。
- **C**: paths グロブ（変更なし）。実構造への発火・過剰発火なし・YAML 形式妥当。**充足**。
- **D**: プレースホルダ。variables.md は T-03 受け入れ基準（cycle-170.md L72-79）と対応する 5 項目を列挙。components.md は Owner 例示 6 部品を軸に「具体名は後続で確定」と明示。SKILL.md は T-07 要素 4 項目をコメントで列挙。後続 builder の混乱要因は解消。**充足**。
- **E**: SKILL.md の状態。frontmatter は確定済かつ文面品質が公式水準。本文プレースホルダは T-07 builder の作業前提として機能する自己完結性を持つ。**充足**。
- **F**: Owner 指示の遵守。ディレクトリ名 `frontend-design`、禁止語不在、シンプル最小構成。**充足**。

#### 5. 後続タスクへの影響

- **T-03**: variables.md L10-14 が 5 項目（カラートークン / タイポグラフィ / スペーシング / 角丸・Elevation・モーション / Bad/Good 例）を列挙。T-03 受け入れ基準（cycle-170.md L72-79）と直接対応する。**走れる**。
- **T-04 / T-05**: SKILL.md frontmatter の `paths` で `src/components/design-system/` 配下も自動ロード対象になる。`description` のトリガー語に Owner 例示 6 部品が含まれるため、コンポーネント新設時にスキルが起動する。**走れる**。
- **T-06**: components.md L10「具体名は T-04・T-05 完了時に確定」が T-04・T-05 完了を待つ依存関係を明示。Owner 例示 6 部品が軸として与えられている。**走れる**。
- **T-07**: SKILL.md L32-38 のコメントが受け入れ基準 4 要素を列挙。リンク形式の例示もある。**走れる**。
- **T-08**: builder/reviewer の system prompt 配線時、`description` のレビュー起動シグナルが既に組み込まれているため、system prompt 直書き（層 3）と `description` 自動発火（層 2）が二重に効く。**走れる**。

#### 6. 指摘事項（Rev1-3）

##### Blocker

なし。

##### Major

なし。

##### Minor

なし。Rev1-2 で挙げた Blocker-1 と Minor-1〜4 はすべて解消済み。本 Rev1-3 で新規に発見された未充足要素はない。

#### 7. 判定の根拠

Rev1-2 の Blocker-1 は `description` のトリガー記述濃度不足だった。修正後文面は以下を満たす:

1. 起動条件主題化構文（R-Skill L82 / L146 と整合）
2. 本サイクルで作る対象を直接指す語 15 個以上の濃密配置
3. **reviewer 起動シグナル 3 種を明示**（前回欠落の致命点を完全解消）
4. 機能説明・人間向け指示の削除（予算の浪費を解消）
5. 535 文字で 1,536 文字上限の 35%、前半にトリガー語集中

Minor-1〜4 もすべて構造的に解消。`user-invocable: false` 採用と `disable-model-invocation` 不採用の組み合わせは「人間メニュー非表示 + LLM 自動配信維持」の正しい設計。後続タスク T-03〜T-08 はすべて本成果物を前提に走れる状態。

観点 A〜F の全面再評価でも未充足要素は発見されなかった。Rev1 / Rev1-2 で見つかった見落としに相当する観点（フィールド機能性 / 起動シグナル質 / reviewer 配線）はすべて Rev1-3 で再点検済み。

判定: **pass**。

### T-03 Rev1（2026-04-26）

対象: `src/app/globals.css`（新変数追記、Google Fonts `@import` 追加）と `.claude/skills/frontend-design/variables.md`（プレースホルダ → 本文）。

判定: **needs_revision**

指摘件数: Blocker 2 / Major 2 / Minor 2

#### Blocker

- **B1（観点 B — Google Fonts `@import` が既存サイトの全ページに副作用を起こしている）**: `src/app/globals.css` 冒頭に追加された `@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Noto+Sans+Mono:wght@400;500&display=swap");` は、Next.js のルート CSS として `src/app/layout.tsx` に常時 import される（L2）。`npm run build` 出力 `.next/static/chunks/a0533118d95a7936.css` の 1 行目にこの `@import` が含まれることを実機で確認済（L1）。`grep -o "a0533118d95a7936.css" .next/server/app/index.html` でホームページ HTML も同 CSS を `<link>` でロードすることを確認済（3 件マッチ）。結果として **既存サイトのすべてのページで、すべての訪問者のブラウザが Google Fonts CDN へ追加リクエストを送る** 状態になっている。本サイクル最重要制約「既存サイトに手を加えない」（cycle-170.md L22 / L75 / L188）の明確な違反。`body` への font-family 適用は避けたとしても、@import 自体が（1）追加ネットワークリクエスト、（2）`@font-face` 規則のブラウザへの登録、（3）LCP/CLS への潜在的影響、を全ページ全訪問者に対して発生させている。さらに variables.md L107-109 で「`body` には適用しない（既存サイトに手を加えない方針）」と書きながら globals.css 直下に `@import` を置く挙動は自己矛盾している。**修正方向**: globals.css から `@import` を撤去し、Web フォント読み込みは T-04/T-05 で作る新コンポーネントの module.css 側、または T-09 の `_dev/` プレビューページ単体で `<link rel="stylesheet">` または専用 CSS ファイルから行う形に局所化する（既存ページに副作用が出ない経路を採る）。`--ds-font-sans` / `--ds-font-mono` 変数定義自体は globals.css に残してよい（フォントスタックの fallback により Noto がロードされなくても破綻しない）。

- **B2（観点 F — 値の二重記述で受け入れ基準明示違反）**: T-03 受け入れ基準（cycle-170.md L74）は「単一情報源が `globals.css` であり、用途ドキュメントには変数の値そのものが二重記述されていないこと」を明文で要求している。しかし `variables.md` には複数箇所で値そのものが記されている — L124-131（line-height 1.25 / 1.4 / 1.7 / 1.9、letter-spacing -0.01em / 0.02em / 0.08em）、L137-147（spacing 4px / 8px / 12px / 16px / 24px / 32px / 48px / 64px / 96px）、L153-156（radius 2px / 8px）、L172-178（motion duration 120ms / 200ms / 320ms と easing の cubic-bezier 値）。これは将来 globals.css の値を変更したときに variables.md と乖離する典型的な構造で、単一情報源の原則を破っている（T-02 で書いたメタプロンプト「値はファイルから直接読む」と整合しない）。**修正方向**: variables.md の値そのものを除去し、「使える刻みは `--ds-sp-1` 〜 `--ds-sp-9` の 9 段で、8px グリッド準拠」のように **意味と用途と命名規約のみ** で書く。具体値が必要な読み手は globals.css を直接読む構造にする（variables.md L4 の宣言「値は書かない」を実装と一致させる）。

#### Major

- **M1（観点 D — `--ds-` プレフィックスは Owner が明示的に排除した略語パターンに該当する可能性が高い）**: cycle-170.md L86 / L250 / L280-281 で Owner は「`yolos-ds` のような意図が分かりづらい略語ディレクトリも排除」「短く、略語なし、意図が直接読める命名」「リポジトリはすべて yolos.net のものなので `yolos` という言葉自体は意味を持たない」「略語（yolos-ds 等）は意図が読み取れず排除」と複数箇所で明示している。`yolos-ds` の `ds` は design system の略であり、これが Owner の排除理由だった。**今回採用された `--ds-` プレフィックスも同じ「ds = design system」の略**であり、文字列として `yolos-ds` の語幹を引き継いでいる。variables.md L28-32 の選定理由は「短く、design system の意図が直感的に読める」とあるが、これは正に Owner が `yolos-ds` について却下した論理と同型（短いから良いではなく、略語だから却下が Owner ロジック）。Owner が見て初見で「ds って何？」と読み取れない可能性が高い。代替案（例: `--design-bg` / `--system-bg` / プレフィックスなしで既存と区別する別の方式 / Synthesis B-3 のプリミティブ層 + セマンティック層の 2 層命名 等）の比較検討が variables.md にも globals.css コメントにも残されていない。**修正方向**: planner に再度命名選定をさせ、（a）`--ds-` を採るなら「ds は略語ではなく、yolos-ds で却下されたパターンに該当しない」根拠を Owner ロジックと突合した形で variables.md に明記する、または（b）非略語命名（`--design-*` 等）に変更する、いずれかを選ぶ。判断は本サイクルで凍結すべき（T-04/T-05 で大量のコンポーネントが新変数を参照する前に決める）。

- **M2（観点 D / variables.md — サードパーティ衝突リスクの記載が薄い）**: cycle-170.md L238「(3) 将来のサードパーティ衝突リスクが用途ドキュメント内に明記されること」を満たすため variables.md L33-39 に節は設けられているが、内容は「shadcn は接頭辞なし変数なので衝突しない（現時点）」「Tailwind v4 が `--ds-*` を予約する可能性はゼロではない」と表面的な確認に留まる。**Tailwind v4 は `@theme` ディレクティブ内で `--*` 名前空間トークンを大量に生成し、ユーザートークンも `:root` で重なる**設計（要 fact-check）。実害が出るかどうかの判断材料が薄く、「議論が起きた時点で再考する」では遅延に繋がる。せめて「次サイクル以降に Tailwind v4 / shadcn 等の導入議論が起きた時点で `--ds-*` のリネームが必要になる可能性がある」とキャリーオーバー候補に明示し、`docs/cycles/cycle-170.md` の最終キャリーオーバー節に追加する想定であることを variables.md にも書き留めておく。

#### Minor

- **m1（観点 F — 対応表の値乖離注記が弱い）**: variables.md L258「値は完全には一致しない（既存は sRGB、新体系は OKLCH や異なる sRGB 値）」とあるが、具体的にどのペアが視覚的に異なるか（例: `--color-primary: #2563eb` vs `--ds-accent: oklch(0.62 0.22 264)` は色相は近いが彩度・明度で差がある）の記載がなく、次サイクルで段階置換するときの注意喚起として弱い。最低 1〜2 ペアの具体的な差分（DevTools で並べた所感）を脚注として残しておくと、後続サイクルの builder が「単純置換 → 見た目が変わる事故」を避けられる。

- **m2（観点 A — 新変数群冒頭コメントの数値が将来の保守負債になる）**: globals.css L115「既存の --color-_ 体系は変更していない（1,885 箇所参照中）」の `1,885` は cycle-170 計画書の調査時点の数値であり、グローバル CSS 内に固定数値として残すと、リファクタやファイル追加で実数が変わった瞬間に嘘になる。「既存の `--color-_` 体系は変更していない（多数のファイルから参照されているため）」程度の表現に変更し、固有の数値はコミットログ / cycle-170.md 側に残すに留める。

#### 観点 A〜H の独立検証結果

- **A. 受け入れ基準遵守**: B1 / B2 で明示違反 2 件。残り 5 項目は形式上充足だが M1 で命名の妥当性に疑問。
- **B. `@import` の既存サイト影響**: ホームページを含む全ページで Google Fonts CDN への追加リクエストが発生することをビルド成果物で実証（B1 として Blocker 計上）。
- **C. 既存 `--color-*` の不変**: `git diff HEAD -- src/app/globals.css | grep "^-" | grep -- "--color-"` で 0 件を確認。OK。
- **D. 命名 `--ds-`**: M1 として Major 計上。Owner ロジックとの突合不足。
- **E. 変数値の正確性**: 素地 `colors_and_type.css` から Surface 5 値・Text 5 値・Border エイリアス・Accent/Status 12 値（OKLCH 含む）・font-size 11 値・line-height 4 値・letter-spacing 3 値・spacing 9 値・radius 2 値・elevation 3 raw + 2 alias・motion 2 ease + 3 duration まで全て一致を独立確認。OK。
- **F. 用途ドキュメント**: B2 / m1 計上。
- **G. ビルド・lint・test**: `npm run lint` / `npm run format:check` / `npm run test`（4004 tests passed）/ `npm run build` すべて成功を確認。OK。
- **H. 後続タスクへの影響**: B1（@import の副作用）と M1（命名）が解決しない限り T-04/T-05 を着手できない。両者とも T-04/T-05 が新変数を参照する前提に直接効くため、本サイクルで凍結が必要。

#### 重要メモ

B1 は Owner 直接指示「既存サイトに手を加えない」（cycle-170.md L22）の違反であり、過去サイクルでの類似失敗（cycle-169 の権限外作業／cycle-168 の SCAN 撤回）と同質の「合意済み制約の越境」。AP-WF12 や `docs/anti-patterns/implementation.md` の観点でも要記録。修正後の再レビューでは @import が globals.css から消えていること、build 成果物にも `fonts.googleapis.com` が漏れ出ていないことを実機で再確認すること。

### Rev2-1（2026-04-27）

対象: `docs/cycles/cycle-170.md` の Rev2 全面再設計部分

- `## 実施する作業`（T-1〜T-8 + 完了済みアーカイブ A-01〜A-04、L24-144）
- `## 作業計画（Rev2、2026-04-27 全面再設計）` 配下全節（L146-395）
  - `### Rev2-1 — 計画書き直しの背景`
  - `### 目的` `### 本サイクルで決める範囲（スコープ）`
  - `### 設計判断 — skill ファイル構成`（**本 plan の中核**、3 案比較・採用案 Y・各ファイル「書くこと／書かないこと」・二重管理回避宣言・一時情報の置き場）
  - `### 設計判断 — src/components/`（簡潔化）
  - `### 設計判断 — サブエージェント配線`（簡潔化）
  - `### 検討した他の選択肢と判断理由`
  - `### 完成の定義`（成果物存在・整合性 + Owner 原則 1〜12 一対一適合チェック）

参照した実体（plan が前提にしている事実、独立確認済み）:

- `.claude/skills/frontend-design/`: SKILL.md（frontmatter 確定済、本文プレースホルダ）/ philosophy.md（110 行、Rev1 pass）/ variables.md（破綻）/ components.md（プレースホルダ）— 4 ファイル現存
- `src/app/globals.css`: 新変数群が `--bg-*` / `--fg-*` / `--accent-*` / `--border*` 等のプレフィックスなし命名で追記済（L122-237 抜粋確認）。Owner により Rev1 で却下された `--ds-*` ではないことを確認
- `tmp/cycle-170-asset-migration-map.md` 現存
- `docs/design-system-by-claude-design/` 現存（README.md / SKILL.md ほか、T-6 で削除予定）
- `docs/anti-patterns/`: planning.md / implementation.md / writing.md / workflow.md（AP-WF11 まで）。AP-WF12 は cycle-169 で撤回済（現存しない）

判定: **pass**

指摘件数: Blocker 0 / Major 0 / Minor 4

#### Blocker

なし。

#### Major

なし。

#### Minor

- **m1（観点 D — T-2 の受け入れ基準 (a)〜(d) は「実装手段」一歩手前まで踏み込んでいる）**: T-2 の受け入れ基準（L54）は「(a) このスキルが何のためにあるか / (b) 値の単一情報源は globals.css / (c) コンポーネント API は型 + JSDoc / (d) 判断基準は philosophy.md」が伝わる構造を要求している。これは観察可能な合格条件として書かれているが、内容指定の粒度が高く、原則 7（基本設計のみ・章立てを mandate しない）の境界線上にある。一方で Owner 原則 11（二重管理回避）と原則 10（一時情報を skill に書かない）を構造的に保証するためには（b）（c）の「単一情報源の所在を玄関に書く」要素は実質的に必要であり、（a）（d）も玄関の最低要件として合理。**本サイクルではこの粒度で許容**するが、もし builder が「(a)〜(d) の 4 つを章立てで並べる」と解釈してしまうと plan が章立てを mandate しているのと同じ効果になる。builder への伝達時に「(a)〜(d) は読み手に伝わるべき要素であり、章立て・順序・見出しは builder 判断」と一言添えるのが望ましい。

- **m2（観点 F — 完成の定義に「ビルドの実機証跡」の記載粒度が緩い）**: L368「`npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する」と L367「ビルド成果物に Google Fonts CDN 等への外部リクエストが既存サイト経由で混入していない」は両方記載されているが、前 plan T-03 Rev1 Blocker B1 の事故再発防止の観点からは、後者の検証手順（`grep -r "fonts.googleapis.com" .next/` 等のコマンド水準）まで完成の定義に明記しておくと、T-8 の PM チェックでの取りこぼしが構造的に防げる。本 Rev2 plan では T-5 受け入れ基準（L96）に「ビルド成果物（`.next/static/chunks/*.css` 等）に Google Fonts CDN 等への外部リクエストが既存サイト経由で混入していないこと」と書かれているため重複に近いが、完成の定義（L367）から T-5 受け入れ基準への参照ポインタが無く、PM が完成の定義だけを見て ✓ を打ってしまう余地が残る。**修正方向**: 完成の定義 L367 に「（検証手順は T-5 受け入れ基準を参照）」のような一言を加えるか、T-8 受け入れ基準（L124-128）に「完成の定義 L367 のビルド成果物外部リクエスト混入チェックは grep ベースの実機確認で行う」と書き加える。**Minor 扱いとする理由**: T-5 受け入れ基準で実機確認は要求されており、PM が完成の定義のみで判定する想定でなければ実害は出ない。

- **m3（観点 H — 案 Y で「JSDoc が十分書かれる受け入れ基準」が「最低限 variant ごと」止まり）**: T-3 受け入れ基準 L66「最低限 variant ごとに付ける」、T-4 同（L82）— variant 数が少ないボタン（primary / ghost のみ等）では JSDoc が 2 行で済んでしまい、「いつ使うか・避ける場面」が型 + JSDoc から読み取れない実装が許容される余地がある。案 Y の根拠（「コンポーネント API は型 + JSDoc に寄せる」「`components.md` を不要にする」）が成立するためには、**コンポーネント本体（型 + ファイル先頭の JSDoc）に「このコンポーネントは何を担うか／どんな場面で使うか／使わない場面」が書かれている**必要がある。variant ごとに JSDoc が付くだけでは、コンポーネント全体の使い分けが読み取れない。**修正方向**: T-3 / T-4 受け入れ基準に「各コンポーネントのファイル冒頭または default export の型/関数定義に、コンポーネント全体の用途・使う場面・使わない場面が JSDoc で書かれていること」を追記する。**Minor 扱いとする理由**: builder が「自己説明的」を真摯に解釈すれば自然に書かれる範囲であり、reviewer が T-3 / T-4 のレビュー時に補正できる。

- **m4（観点 G — AP-WF11 への明示的な配慮が完成の定義に薄い）**: cycle-168 / cycle-169 で発生した AP-WF11（PM が最終成果物を自分で通読確認していない）の再発防止は、本 plan では T-8（PM 自身が完成の定義チェック）として一応立っているが、「PM が SKILL.md と philosophy.md を **自分で通読** したうえで Owner 原則 1〜12 の ✓ を打つ」という行為自体は受け入れ基準に明示されていない。T-8 受け入れ基準 L125-128 は ✓ が立っていることを要求するのみで、ファイルの中身を PM が読むかどうかは行間に落ちている。**修正方向**: T-8 受け入れ基準に「PM が SKILL.md / philosophy.md / `src/components/design-system/` の各 TypeScript 型と JSDoc を **通読** したうえで、原則 11（二重管理回避）と原則 10（一時情報排除）が実装側で守られていることを言葉にして確認する」を追記する。**Minor 扱いとする理由**: T-8 が PM 自身のタスクとして立っており、PM が AP-WF11 を意識していれば自然にカバーされる範囲。

#### 観点 A 〜 I の独立評価

##### A. Owner 原則 1〜12 への一対一適合（plan が満たすべきもの）

各原則ごとに plan の該当箇所を取り出して評価する。

1. **原則 1（汎用要素のみ）**: L19 / L156 で Owner 例示 6 部品（ヘッダー・フッター・パネル・ボタン・入力欄・記事エリア）がスコープとして明示。T-3 / T-4 受け入れ基準（L73, L87）が「Owner 例示の最小ライン」と明記。完成の定義 L373 で再確認。**充足**
2. **原則 2（シンプル・長期改善）**: L157 で原則として明示。skill ファイル構成を 4 → 2 ファイル（案 Y）にする決定で物理的に「シンプル化」が実装されている（L236-249）。SKILL.md 玄関本文の T-2 受け入れ基準（L57）も「玄関として常時参照に耐える分量」と軽量を要求。完成の定義 L374 で再確認。**充足**
3. **原則 3（CSS 変数で管理）**: L158 で原則として明示。完了済みアーカイブ A-04（L142）で globals.css への追記が済んでおり、本 plan は値の単一情報源を globals.css に固定（L300）。完成の定義 L375 で再確認。**充足**
4. **原則 4（既存サイト不変）**: L159 / L203（既存 `--color-*` 削除しない）/ L204（既存 Header/Footer 不変）/ L205（既存 `.module.css` 不変）で明示禁止。T-3 受け入れ基準 L69（既存 `--color-*` 不変）/ T-4 受け入れ基準 L80（既存 Header/Footer 不変）。完成の定義 L369 / L376 で再確認。**充足**
5. **原則 5（skill 名 frontend-design・略語禁止）**: L160 で明示。配置先 `src/components/design-system/` は L320 で「短く、略語なし」と判断理由付き。完成の定義 L377 で再確認。**充足**
6. **原則 6（素地削除）**: L161 で明示。T-6（L102-110）が物理削除タスク。受け入れ基準で文字列 grep 検証も含む。完成の定義 L378 で再確認。**充足**
7. **原則 7（基本設計のみ）**: L162 で明示。L35「**詳細設計（具体ファイル名・変数名・props 名・章立て・行数・ルール文面）は plan で指定しない。** すべて builder 判断」と plan 自身が宣言。各タスクに「builder の判断範囲」が明記されている（L48, L59, L73, L87, L100, L110, L120）。完成の定義 L379 で plan 自身に対する自己チェック項目が立つ。**充足**（ただし m1 で T-2 受け入れ基準が境界線上）
8. **原則 8（description はトリガー）**: L163 で明示。完了済みアーカイブ A-03（Rev1-3 で pass 済）として取り扱い、Rev2 では触らない。完成の定義 L380 で再確認。**充足**
9. **原則 9（無意味な複雑さ排除）**: L164 で明示。L344「`design-system/` を採用、`yolos-ds` 等の略語は不採用」のような選定理由。新略語の導入なし。完成の定義 L381 で再確認。**充足**
10. **原則 10（skill に一時情報を入れない）**: L165 で明示、本 plan の最重要規定として T-1 受け入れ基準 L45 に「移行表・段階置換ガイド・サードパーティ衝突対症療法注記が 1 箇所も残っていない」と物理的観察条件で書かれている。L306-316 で一時情報の置き場（cycle / backlog / tmp）が明示される。完成の定義 L382 で再確認。**強く充足**
11. **原則 11（二重管理回避）**: L166 で明示。L294-304 の「二重管理が発生しない構造の宣言」表で、各情報の単一情報源が一意に決まる。`variables.md` 削除（L277-284）と `components.md` 削除（L286-292）が物理的に実装される。完成の定義 L383 で再確認。**強く充足**
12. **原則 12（ファイル構成のゼロベース検討）**: L167 で明示。`### 設計判断 — skill ファイル構成`（L214-316）で 3 案比較が実施されている（L228-234 比較表、L236-249 採用理由、L246-249 不採用理由）。完成の定義 L384 で再確認。**強く充足**

12 原則すべてが plan 文書内で観察可能な形で対応されており、原則 10 / 11 / 12 については Rev1 系列の根本問題への直接的な構造解決として明示的に書かれている。

##### B. 構造的再発防止

前 plan が陥った「skill 受け入れ基準で一時情報を要求 → builder が忠実に従った結果 skill が肥大」を、Rev2 plan が構造的に防いでいるかを検証する。

- **「書かないこと」リストの存在**: L263-268（SKILL.md）/ L274（philosophy.md）に明示。「書かないこと」を受け入れ基準と独立した規定として立てる構造になっている。
- **「書かないこと」リストの網羅性**: L267 で「既存 `--color-*` との対応表・段階置換ガイド・サードパーティ衝突注記・キャリーオーバー候補（一時情報）」を全て明示禁止。L268「削除予定または既に消えた素地ディレクトリへの参照」も含む。サイクル番号への直接言及禁止は明記されていないが、L274（philosophy.md）の「サイクル都合の注釈」で実質カバー。
- **T-1 受け入れ基準の物理観察条件化**: L45「skill ディレクトリ全体を見たとき、CSS 変数の値表・素地時代の対応表・移行表・段階置換ガイド・『将来サードパーティ衝突したらリネーム』のような一時的・対症療法的な記述が **1 箇所も残っていない** こと」— builder が忠実に従っても skill が肥大しない方向に受け入れ基準が向いている。
- **一時情報の置き場の明示**: L306-316 で具体的に列挙（cycle ドキュメント / `docs/backlog.md` / `tmp/`）。前 plan は「将来用」の情報を skill に置く受け入れ基準を持っていたが、Rev2 ではそれぞれの置き場が plan に書かれており、builder が「skill に書く」を選ぶ余地が構造的にない。

**充足**。前 plan の根本問題を構造として防ぐ設計になっている。

##### C. 二重管理の根絶

- **CSS 変数の値・カテゴリ・並び順の単一情報源**: L300 で `src/app/globals.css` に固定。L264-265（SKILL.md に変数の値・カテゴリ別解説を書かない）で skill 側の重複を物理禁止。
- **コンポーネント API の単一情報源**: L301 で `src/components/design-system/` の TypeScript 型 + JSDoc に固定。L266（SKILL.md に props 型一覧・variant 一覧を書かない）で skill 側の重複を物理禁止。
- **skill 側に「値そのもの」が残らないことの保証**: T-1 受け入れ基準 L45 で物理観察条件として要求。L283「カテゴリ別件数表 / Bad / Good コード例も globals.css コメントと philosophy.md の NEVER 節で代替可能」と判断理由が明示。
- **globals.css コメントが単一情報源として機能する粒度**: A-04 の追記済成果物を前提にしている。実体確認では `--bg-soft`（沈んだ背景。ページ背景・hover on bg）のように「用途」がコメントで記述されている。命名規約の詳細解説を skill 側に置かないことで、globals.css コメントを直接読む構造に一本化されている。

**充足**。同じ事実を複数ファイルで管理する設計が plan に残っていない。

##### D. 基本設計レベルの粒度遵守

- **具体変数名の mandate**: なし。L162 / L35 で明示禁止。L345 で既存（A-04）の命名は触らない方針。
- **prefix の有無の指定**: なし。Rev1 で `--ds-*` が却下され、現状はプレフィックスなしの `--bg-*` `--fg-*` 等で追記済（A-04）。Rev2 plan はこの現状を凍結扱いにしており、新たに mandate していない。
- **具体ファイル名（コンポーネント名）の mandate**: なし。T-3 / T-4 受け入れ基準で「対象部品の最終リスト」「各部品の名称・props 設計・variant 名」が builder 判断（L73, L87）と明記。
- **行数・章節構成の mandate**: なし。T-2 受け入れ基準 L57「具体行数は指定しない」と明示。L162 で「行数・章立てを plan で指定しない」と原則化。
- **受け入れ基準が「観察可能な合格条件」に留まるか**: 各タスクの受け入れ基準は概ね「`X` が `Y` であること」「`X` が `Y` を含む／含まないこと」の観察条件で書かれている。**ただし m1 のとおり T-2 受け入れ基準 L54 (a)〜(d) は内容を要素単位で指定している境界線上の表現**。
- **「builder の判断範囲」の明示**: T-1 〜 T-8 のすべてに明示（L48, L59, L73, L87, L100, L110, L120, T-8 はタスクの性質上 builder 判断項目はなし）。

**充足**（m1 で軽微な検討点あり）。

##### E. タスク分割の妥当性

- **タスクの大きさと独立性**: T-1（skill 整理・削除）/ T-2（SKILL.md 本文）/ T-3（操作部品）/ T-4（構造部品 + ロゴ移動）/ T-5（\_dev ページ + ビルド検証）/ T-6（素地削除）/ T-7（agent 配線）/ T-8（PM 完了処理）の 8 タスクに分割されており、それぞれが 1 builder 1 タスクの粒度。
- **依存関係の明確さ**: L33 に「T-1 → T-2 → T-3 / T-4（並行可）→ T-5 → T-6 → T-7 → T-8」と明示。循環なし。
- **並行可能タスクの識別**: T-3 / T-4 が並行可能と明示（L33 / L61 / L75）。
- **`variables.md` `components.md` 削除の物理的実行タイミング**: T-1（L39-48）で実行されることが明確。T-1 受け入れ基準 L43「採用案で『不要』と判断されたファイルが物理削除されていること」と書かれている。
- **完了済みアーカイブの再着手回避**: A-01 〜 A-04 の状態と Rev2 タスクの境界（L132-144）が明確に書かれている。

**充足**。

##### F. 完成の定義の検証可能性

- **すべての項目が観察可能か**: L356-369 の成果物・整合性チェックは概ね git diff / grep / build 出力で確認可能な条件。L373-384 の Owner 原則 1〜12 チェックも一対一で観察可能な対応がある。
- **Owner 原則 12 個との一対一チェック項目の成立**: L373-384 で 12 項目が一対一で並んでいる。**強く充足**。
- **既存サイト不変の証跡**: L369「既存 `src/components/common/Header.tsx` `Footer.tsx` および既存の `var(--color-*)` 参照箇所は変更されていない」で証跡要求。git diff で検証可能。
- **ビルド成果物への副作用混入チェック**: L367 と T-5 受け入れ基準 L96 で要求。**ただし m2 のとおり、検証手順（grep ベース）への参照ポインタが完成の定義側に無い**。

**ほぼ充足**（m2 で軽微な検討点あり）。

##### G. Anti-pattern との照合

`docs/anti-patterns/` 全 4 ファイルを Read し、各項目を一文ずつ照らした。

- **AP-P01〜AP-P15（planning.md）**:
  - AP-P04（Owner 発言を検証なしに前提化しない）: L154-167 で Owner 累積指示 12 項目を抽出し、L162 で原則 7（plan は基本設計）と整合させた形で plan に組み込んでいる。Owner 発言を「検証なし」ではなく「ロジックの分解 → 個々の項目を観察可能な合格条件に翻訳」というプロセスを経ている。`### 設計判断 — skill ファイル構成` の 3 案比較も Owner 原則 11 / 12 を内部検証する役割を果たす。**該当なし**。
  - AP-P06（既存意思決定の確認）: 完了済みアーカイブ A-01〜A-04（L132-144）で前 Rev1 系列の意思決定を継承し、philosophy.md 不変・SKILL.md frontmatter 不変・globals.css 新変数群不変を明示。Rev1-3 で pass した A-03（description）も触らない。**該当なし**。
  - AP-P11（AI が決めたから変更回避）: A-04 の `--bg-*` 等の命名は Rev1 で planner が決定し pass したものを「触らない」としているが、L345 で「既存サイトに手を加えない原則と、A-04 が pass している事実から」と判断理由が明記されている。AP-P11 で問題視されているのは「より良い選択肢があるのに AI 過去判断を変更不可扱い」だが、本件は Owner 原則 4 との整合に基づく合理的判断であり該当しない。**該当なし**。
  - その他の AP-P（P01 / P02 / P03 / P05 / P07-P10 / P12-P15）: 計画の根幹仮定の定量実測（P01）、戦略否定データの探索（P02）、来訪者目線（P07）、フレームワーク先行（P13）等は本 plan の性質（設計と素材整備のみ・実サイト反映なし）から直接の射程外。SEO スコア読み替え（P09）等は本 plan に該当箇所なし。**該当なし**。
- **AP-I01〜AP-I06（implementation.md）**:
  - AP-I01（来訪者体験を含むレビュー観点）: 本 plan は実サイト反映なしの設計サイクルだが、philosophy.md と新コンポーネントが将来の来訪者体験を担う。T-3 / T-4 受け入れ基準にアクセシビリティテスト・キーボード操作・フォーカスリング規約（L70）を含む。**該当なし**。
  - AP-I03（バンドルサイズ・Core Vitals）: T-5 受け入れ基準 L96 で「Google Fonts CDN 等への外部リクエストが既存サイト経由で混入していない」を要求。前 plan B1（@import 事故）の再発防止は構造化されている。**該当なし**。
  - その他: 本 plan は計画書のため実装段階の AP は射程の中心ではない。**該当なし**。
- **AP-WF01〜AP-WF11（workflow.md）**:
  - AP-WF03（builder への過剰具体指示）: 本 plan は L35 で「詳細設計は plan で指定しない」と原則化し、すべてのタスクに「builder の判断範囲」を明示。**該当なし**。
  - AP-WF06（事実の確認）: 本 plan は完了済みアーカイブの状態を A-01〜A-04 で明示し、reviewer の独立確認でも実体と一致することを検証済。**該当なし**。
  - AP-WF09（チェックリスト形式通過）: 完成の定義 L373-384 が「✓ を打てば終わり」になる構造リスクは存在するが、各項目が観察可能条件として書かれており、形式通過のための「言い換え」も見当たらない。**該当なし**。ただし m4（PM 自身の通読要求が薄い）は AP-WF11 への配慮として記録。
  - AP-WF11（PM が成果物を自分で通読）: T-8 が PM 自身のタスクとして立っているが、「通読」という行為自体は受け入れ基準に明示されていない。**m4 として Minor 計上**。
- **cycle-169 失敗パターン群**:
  - 権限外作業（cycle-169 で記録、AP-WF12 撤回後は AP-WF06 / AP-P04 / AP-P06 等の射程内）: 本 plan の T-7 で「サブエージェント `skills:` フィールド追加は本サイクルで行わない」（L119）と権限境界を明示。素地削除（T-6）も Owner 原則 6 の直接実装で権限内。**該当なし**。
  - 設計順序（ガイドライン → 色・コンポーネント）: A-01（philosophy.md = ガイドライン）→ A-04（globals.css = 色定数）→ T-3 / T-4（コンポーネント）の順序が保たれている。**該当なし**。
  - ペルソナ化禁止: L181 で明示遵守。**該当なし**。

**充足**。Minor の m4 で AP-WF11 への明示的配慮の薄さを記録するが、Blocker / Major には至らない。

##### H. 採用したファイル構成案の妥当性

- **案 Y（SKILL.md + philosophy.md）の理由**: L240-244 で 4 点の根拠が示される。原則 2 と 11 を同時に満たす最小構成、philosophy.md の独立価値（コードから読み取れない判断基準）、`variables.md` / `components.md` の役割をコード側（globals.css コメント / TypeScript 型 + JSDoc）に吸収させる構造、Anthropic 公式 frontend-design との比較（5 ターゲット × 否定形 × 場面記述で SKILL.md 同居は重い）。論理的に成立。
- **不採用案 X / Z の比較理由**: L246-249 で各 1 文ずつ。X は「philosophy.md 統合の手戻り + 玄関の軽さ喪失」、Z は「Owner やり直し命令の根本構造そのもの」。妥当。
- **案 Y で「コンポーネント API は型 + JSDoc に寄せる」方針が builder と reviewer の参照に機能するか**: T-3 / T-4 受け入れ基準（L66 / L82）で「TypeScript の型と JSDoc によって自己説明的に書かれている」「最低限 variant ごとに付ける」と要求されている。**ただし m3 のとおり、コンポーネント全体の用途が JSDoc に書かれる保証が弱い**。

**ほぼ充足**（m3 で軽微な検討点あり）。

##### I. 既完了タスクの扱い

- **完了済みアーカイブ A-01〜A-04 の整理**: L132-144 で 4 項目が明示され、それぞれに前 Rev で pass した経緯と Rev2 で再着手しない範囲が書かれている。A-04 にはさらに「前 T-03 で書かれた `variables.md` は Rev2 T-1 で **削除** する」と境界が明示。
- **「完了済み」が前提にしている事実が現実のリポジトリ状態と一致するか**:
  - philosophy.md: 現存（7589 bytes、110 行相当）。Read 不要だが Rev1 で pass 済の事実は plan 履歴で確認できる。
  - SKILL.md frontmatter: Read で確認、`name: frontend-design` / `description`（複数行 YAML literal block）/ `paths`（3 globs）/ `user-invocable: false` が確定。**一致**。
  - globals.css 新変数群: Read で `--bg-soft` / `--bg-softer` / `--bg-invert` / `--bg-invert-soft` / `--fg-soft` / `--fg-softer` / `--fg-invert` / `--fg-invert-soft` / `--border` / `--border-strong` / `--accent-strong` / `--accent-soft` 等を確認、Surface / Text / Border / Accent コメント節も確認。`--ds-*` プレフィックスは含まれず、Owner 却下が反映されたプレフィックスなし命名で追記済。**一致**。
  - `tmp/cycle-170-asset-migration-map.md`: 現存確認。**一致**。
  - 素地ディレクトリ `docs/design-system-by-claude-design/`: 現存（README.md / SKILL.md など）、T-6 で削除予定。**一致**。
  - `variables.md` / `components.md`: 現存（13549 bytes / 886 bytes）、T-1 で削除予定。**一致**。

**強く充足**。完了済みアーカイブの前提と実体が一致しており、Rev2 タスクの出発点が信頼できる状態。

#### 良かった点

- **Owner 原則 12 項目を一対一で完成の定義に落とし込んだ構造**: L373-384 の 12 項目チェックリストは、本 plan が原則をスローガンではなく観察可能条件として実装する意志を示している。前 plan で Owner が破棄を命じた根本原因（原則 10 / 11 が受け入れ基準の文面に乗らず、結果として skill が肥大した）に対する直接の構造解決。
- **「書かないこと」リストの明示**: L263-268 / L274 で各 skill ファイルの禁止事項を独立した節として立てた。前 plan が「書くこと」だけを指定して「書かないこと」を行間に落としていたのに対し、本 Rev2 は禁止事項を物理的観察条件にまで翻訳している。
- **3 案比較の透明性**: L228-249 で案 X / Y / Z を表形式で比較し、採用理由と不採用理由をそれぞれ記述。Owner 原則 12（ゼロベース検討）の要求を形式的にではなく実質的に満たしている。
- **完了済みアーカイブと Rev2 タスクの境界明示**: L132-144 で前 Rev1 系列の成果物に手を入れない範囲を明確化。philosophy.md / SKILL.md frontmatter / globals.css 新変数群が「触らない」と宣言されており、Rev2 タスクの粒度が小さく独立に保たれている。
- **一時情報の置き場の網羅的指定**: L306-316 で skill 外に置く情報の置き場（cycle / backlog / tmp）が具体的に列挙され、builder が判断に迷う余地を構造的に潰している。

#### 判定の根拠

判定: **pass**

判定の閾値（Blocker 1 件で needs_revision / Major 1 件で needs_revision / Minor のみ pass）に照らし、Blocker 0 件・Major 0 件・Minor 4 件のため pass。

Minor 4 件（m1 — T-2 受け入れ基準の境界線 / m2 — 完成の定義の検証手順ポインタ薄 / m3 — JSDoc 受け入れ基準が variant 単位止まり / m4 — AP-WF11 への通読要求が薄い）はいずれも builder 実行段階または T-3 / T-4 / T-5 / T-8 のレビュー段階で補正可能で、構造的な再発リスクや Owner 原則違反の温床にはならない。

本 Rev2 plan は前 plan が破棄された根本原因（skill に一時情報を積もらせる受け入れ基準構造）を、（1）skill ファイル構成を案 Y で 2 ファイルに削減、（2）「書かないこと」リストの明示、（3）一時情報の置き場の plan 内列挙、（4）二重管理の単一情報源マッピング表、（5）完成の定義での Owner 原則 12 項目一対一チェック、の 5 つの構造的解決で防いでいる。Owner 累積 12 原則のすべてに対して plan 内に観察可能な対応が存在し、anti-pattern との照合でも Blocker / Major 級の該当はない。完了済みアーカイブの前提と実体の一致も独立確認済み。

PM への次ステップ提案: builder への T-1 委任時に Minor m1 / m3 を補正情報として伝えること（T-2 (a)〜(d) は要素であって章立てではない / T-3 / T-4 の JSDoc はコンポーネント全体の用途を含む）。Minor m2 / m4 は T-5 / T-8 の builder / PM 実行時に補正可能。

### Rev2-2 への入力（2026-04-27）

Rev2-1 で指摘された Minor 4 件すべてを plan 本体に反映した（サイクルプランニング規約「指摘事項が 1 件でもあれば修正」に従う）。修正は plan の表現形式を mandate しないこと（Owner 原則 7）を死守して行った。各反映の対応箇所:

- **m1 反映（T-2 受け入れ基準の章立て mandate 化を回避）**: `## 実施する作業` T-2 受け入れ基準（旧 L54）に、(a)〜(d) は「読み手に伝わるべき要素」であり、章立て・順序・見出し名・分量・統合分割は builder 判断であることを明示。4 つを別章として並べる必要はないと書き添えた
- **m2 反映（完成の定義の検証手順ポインタ）**: `### 完成の定義` の「ビルド成果物に Google Fonts CDN 等への外部リクエストが既存サイト経由で混入していない」項目（旧 L371）に「検証手順は T-5 受け入れ基準と T-8 受け入れ基準を参照。PM が完成の定義のみで ✓ を打たず、grep ベースの実機確認ログを残す」を追記。加えて T-8 受け入れ基準にも grep ベース実機確認ログ保持を独立項目として追加
- **m3 反映（コンポーネント全体の俯瞰的 JSDoc 必須化）**: T-3 / T-4 受け入れ基準それぞれに「各コンポーネントのファイル冒頭または default export の型／関数定義に、コンポーネント全体の用途・使う場面・使わない場面が JSDoc で書かれていること」を追加。採用案 Y で `components.md` を作らないことが成立する前提条件として明示。書く位置・分量・記述スタイルは builder 判断とし mandate を避けた
- **m4 反映（AP-WF11 — PM の通読確認の明示化）**: T-8 受け入れ基準に「PM が `SKILL.md` / `philosophy.md` / `src/components/design-system/` 配下の各 TypeScript 型と JSDoc を自分で通読したうえで、原則 11（二重管理回避）と原則 10（一時情報排除）が実装側で守られていることを言葉にして確認していること」を追加。✓ を打つだけでは足りないことを明文化

修正による副作用の自己チェック:

- Owner 原則 7（plan は基本設計）の境界線確認: 追記はすべて「~~を書く／~~を確認する」という観察可能な合格条件であり、具体ファイル名・章名・行数・props 名の mandate は含めていない。書き方・位置・分量は builder 判断と明記
- Owner 原則 11（二重管理回避）への影響: 完成の定義 → T-5/T-8 への参照ポインタは「PM が ✓ を打つときに見落とさないため」の手続き的補強であり、検証条件そのものを 2 箇所に書く構造ではない
- 受け入れ基準の数: 増えたが、各項目は独立した観察条件であり「言い換え」の重複は無い

### Rev2-2（2026-04-27）

対象: Rev2-1 で指摘した Minor 4 件（m1 / m2 / m3 / m4）の plan 反映の解消確認、副作用チェック、整合性チェック、観点 A〜I の差分再評価、新規 Blocker / Major / Minor の発見。

参照した編集箇所（独立検証で実体確認済）:

- m1: L54（T-2 受け入れ基準への (a)〜(d) の表現形式 mandate 回避の追記）
- m2: L130（T-8 受け入れ基準への grep ベース実機確認ログ要求の独立項目追加）+ L371（完成の定義への T-5 / T-8 参照ポインタ追記）
- m3: L67（T-3 受け入れ基準への俯瞰的 JSDoc 必須化追記）+ L84（T-4 への同文追記）
- m4: L129（T-8 受け入れ基準への PM 通読確認の明示化）

判定: **pass**

指摘件数: Blocker 0 / Major 0 / Minor 0

#### Blocker

なし。

#### Major

なし。

#### Minor

なし。Rev2-1 で挙げた m1 / m2 / m3 / m4 はすべて解消済。本 Rev2-2 で新規に発見された未充足要素はない。

#### 1. 指摘 4 件の解消確認（独立検証）

各 Minor を「言及はあるが弱い」「他の箇所と矛盾する」が無いかを 1 件ずつ言葉にして確認した。

##### m1（T-2 受け入れ基準が章立て mandate になり得る）の解消

修正後 L54 の追記文面を独立に読むと、Owner 原則 7 への配慮が以下の 5 つの次元で明示されている:

1. (a)〜(d) は「読み手に伝わるべき要素」であって章立てではない、と要素と章立ての概念分離を宣言
2. **章立て・順序・見出し名・分量・統合分割** の 5 つの次元すべてを builder 判断と明記
3. 「4 つを別々の章として並べる必要はなく」と否定形で表現の自由度を保証
4. 「1 段落に統合してもよいし、Quick rules 等に組み込んでもよい」と具体的な逃げ道を 2 例示
5. 「Owner 原則 7 に従い、本 plan は表現形式を mandate しない」と明示的な原則言及で締める

Rev2-1 で私が提案した「(a)〜(d) は要素であって章立てではない」よりも一段深く踏み込んでいる。**完全解消**。過剰でも不足でもない。

##### m2（完成の定義の検証手順ポインタ薄）の解消

3 箇所（T-5 L98 / T-8 L130 / 完成の定義 L371）の役割分担を独立に確認した:

- **T-5 L98**: 「ビルド成果物（`.next/static/chunks/*.css` 等）に Google Fonts CDN 等への外部リクエストが既存サイト経由で混入していないこと」— 事実状態の要求（builder への要求）
- **T-8 L130**: 「grep ベースの実機確認（例：ビルド出力 CSS チャンクに `fonts.googleapis.com` が含まれないことを実コマンドで確認する等。具体コマンドは PM 判断）を実施したログを残していること」— 手続き的な PM 確認の要求
- **完成の定義 L371**: 「検証手順は T-5 受け入れ基準と T-8 受け入れ基準を参照。PM が完成の定義のみで ✓ を打たず、grep ベースの実機確認ログを残す」— 参照ポインタ

3 箇所の役割は **事実状態 / 手続き / ポインタ** に階層分離されており、検証条件そのものを 2 箇所に書く重複構造ではない。L130 の「具体コマンドは PM 判断」と「`fonts.googleapis.com`」の「例」表現により、原則 7 の mandate 回避も保たれている。**完全解消、矛盾なし、冗長性なし**。

##### m3（コンポーネント全体の俯瞰的 JSDoc が薄い）の解消

T-3 L67 と T-4 L84 の追記を独立に確認:

- 書く位置の選択肢を 2 つ提示（「ファイル冒頭または default export の型／関数定義」）
- 書く対象の 3 要素を明示（用途・使う場面・使わない場面）
- 採用案 Y で `components.md` を作らないことが成立する前提条件である理由を明記
- 「書く位置・分量・記述スタイルは builder 判断」と mandate 回避を明記

T-3 / T-4 の双方に同文を置くことで「片方にだけ書かれていてもう片方が緩い」という非対称も生じない。**完全解消**。

##### m4（AP-WF11 への通読要求の薄さ）の解消

T-8 L129 の追記を独立に確認:

- 通読対象を 3 種類明示（`SKILL.md` / `philosophy.md` / `src/components/design-system/` 配下の TypeScript 型と JSDoc）
- 通読の目的を 2 原則と紐付け（原則 11 = 二重管理回避、原則 10 = 一時情報排除）
- 「言葉にして確認」と能動的な確認行為を要求
- AP-WF11（cycle-168 / cycle-169 で発生）の射程内であることを明示
- 「✓ を打つだけでは足りない」と形式通過の禁止を明文化

PM が完成の定義チェックを ✓ 駆動で済ませてしまうリスクを構造的に塞いでいる。**完全解消**。

#### 2. 副作用チェック（観点 D — Owner 原則 7 の境界線）

修正で plan が具体ファイル名・章名・行数・props 名を mandate していないかを、各追記行ごとに独立確認した。

- L54（m1）: 「章立て・順序・見出し名・分量・統合分割は builder の判断範囲」「Owner 原則 7 に従い、本 plan は表現形式を mandate しない」と明示。**mandate なし**。
- L67 / L84（m3）: 「書く位置・分量・記述スタイルは builder 判断」と明示。「ファイル冒頭または default export の型／関数定義」は **どちらでもよい** と選択肢提示の形式であり、builder の判断を縛っていない。**mandate なし**。
- L130（m2）: 「具体コマンドは PM 判断」と明示。「ビルド出力 CSS チャンクに `fonts.googleapis.com` が含まれないことを実コマンドで確認する等」は「例」表現であり、検証手段の固定ではない。`fonts.googleapis.com` は前 plan T-03 Rev1 Blocker B1 で実際に発生した事故ドメインであり、検証対象（何を防ぐか）の例示として合理。**mandate なし**。
- L129（m4）: 「自分で通読」「言葉にして確認」と能動的な行為要求にとどまり、通読の手段（読む順序・何を読むか）は PM 判断。**mandate なし**。
- L371（m2）: 「T-5 受け入れ基準と T-8 受け入れ基準を参照」というポインタ表現で具体的検証手段は他節に委ねている。**mandate なし**。

5 つの追記すべてが原則 7 の境界線を越えていない。**副作用なし**。

#### 3. 整合性チェック（観点 C — 二重管理復活の有無）

m2 で 3 箇所に書かれた内容（T-5 / T-8 / 完成の定義）の整合性を独立に検証した。

- T-5（事実）と T-8（手続き）と完成の定義（ポインタ）は **役割が異なる** ため、検証条件そのものの重複ではない
- 用語の使い方も統一（`Google Fonts CDN 等への外部リクエスト` / `ビルド成果物` / `既存サイト経由で混入` で 3 箇所一致）
- T-8 だけが「grep ベース」「ログを残す」という具体的手続きを要求し、T-5 と完成の定義はその手続きを参照する形になっている — 単一情報源原則が保たれている

m1 / m3 / m4 はそれぞれ単一箇所の追記であり、整合性問題は発生しない。

m3 は T-3 / T-4 に同文を置くが、これは「同じ要件を 2 タスクに同時適用」する性質の整合性であり、一方が更新されたら他方も更新するという二重管理リスクは存在する。ただし T-3 / T-4 はそれぞれ独立タスクで「同じ JSDoc 要件を満たす」ことを要求する性質上、文面の同期は本質的に必要であり、これは二重管理ではなく **同一要件の独立適用**。

**整合性問題なし、二重管理復活なし**。

#### 4. 観点 A〜I の差分再評価

Rev2-1 で確認済みの観点について、修正によって品質が下がっていないかを独立に再点検した。

##### A. Owner 原則 1〜12 への一対一適合（差分）

- **原則 7（基本設計のみ）**: Rev2-1 では「m1 で境界線上」と評価した。Rev2-2 では L54 の追記により章立て mandate のリスクが解消され、**境界線上から境界内へ移行**。原則 7 への適合が強化された。
- **原則 10（skill に一時情報を入れない）**: Rev2-2 の修正で skill 側に一切の追加要求が入っていない（修正は cycle-170.md のみ）。**変化なし、強く充足を維持**。
- **原則 11（二重管理回避）**: m2 の 3 箇所追記が二重管理復活ではないことを上記 3 で確認済。**変化なし、強く充足を維持**。
- **原則 12（ファイル構成のゼロベース検討）**: 修正で skill ファイル構成案 Y は変わっていない。**変化なし、強く充足を維持**。
- 残る原則 1〜6 / 8 / 9 についても修正の影響を受けず、**変化なし**。

12 原則すべてで品質維持または向上。劣化なし。

##### B. 構造的再発防止（差分）

「書かないこと」リストへの変更はなし。「書くこと」リストの強化（m3）と PM 確認手続きの強化（m2 / m4）と表現形式の自由度保証（m1）はいずれも、前 plan が陥った「skill 受け入れ基準で一時情報を要求 → builder が忠実に従い skill が肥大」という構造への新たな抜け穴を作っていない。**変化なし、充足を維持**。

##### C. 二重管理の根絶（差分）

上記 3 で確認済。**変化なし、充足を維持**。

##### D. 基本設計レベルの粒度遵守（差分）

上記 2 で確認済。Rev2-1 で「m1 で境界線上」と評価した部分が解消され、**境界内へ移行**。粒度遵守が強化された。

##### E. タスク分割の妥当性（差分）

タスクの数・依存関係・並行可能性は変わっていない。受け入れ基準の数が T-2 / T-3 / T-4 / T-8 で増えたが、各項目は独立観察条件で「言い換え」の重複は無い（plan 自身も Rev2-2 への入力 L1244 で自己確認している）。**変化なし、充足を維持**。

##### F. 完成の定義の検証可能性（差分）

m2 / m4 によって PM 手続きが手厚くなり、L371 の参照ポインタで「完成の定義のみで ✓ を打たない」構造が明示された。Rev2-1 で「m2 で軽微な検討点あり」と評価した部分が解消。**境界内へ移行、検証可能性が強化された**。

##### G. Anti-pattern との照合（差分）

- **AP-WF11（PM が成果物を自分で通読）**: Rev2-1 で「m4 として Minor 計上」した部分が L129 の追記で直接対処された。「自分で通読」「言葉にして確認」「✓ を打つだけでは足りない」と形式通過禁止を明文化しており、AP-WF11 への射程が plan 内に明示された。**境界内へ移行、強化された**。
- **AP-WF09（チェックリストの形式的通過）**: m4 と m2 の修正により、T-8 受け入れ基準が「✓ を打つだけ」を構造的に防ぐ要求に変わった。**強化された**。
- 他の AP（AP-P04 / AP-P06 / AP-WF03 / AP-WF06 等）は修正の影響を受けず、**変化なし**。

##### H. 採用したファイル構成案の妥当性（差分）

m3 の追記により、案 Y で「コンポーネント API は型 + JSDoc に寄せる」方針が「ファイル冒頭または default export の俯瞰的 JSDoc」によって実装段階で機能することが受け入れ基準として保証された。Rev2-1 で「m3 で軽微な検討点あり」と評価した部分が解消。**境界内へ移行、案 Y の根拠が実装段階まで貫かれた**。

##### I. 既完了タスクの扱い（差分）

修正は cycle-170.md のみで、完了済みアーカイブ A-01〜A-04（philosophy.md / SKILL.md frontmatter / globals.css / asset-migration-map）には一切手が入っていない。**変化なし、充足を維持**。

#### 5. 新規 Blocker / Major / Minor の発見

Rev2-2 のために新たに走査した観点で、特に「Owner 原則 7 違反」「二重管理復活」「skill ディレクトリへの一時情報混入」「整合性破綻」「副作用」の 5 つを重点確認した結果、いずれも検出されなかった。

- **Owner 原則 7 違反**: 上記 2 で 5 つの追記すべてが mandate 回避を保っていることを確認
- **二重管理復活**: 上記 3 で m2 の 3 箇所追記が階層的補完であり重複ではないことを確認
- **skill ディレクトリへの一時情報混入**: 修正は cycle-170.md のみで `.claude/skills/frontend-design/` 配下に変更なし
- **整合性破綻**: 用語使い方の一致と役割分担の明確さを上記 3 で確認
- **副作用**: 修正によって既存の受け入れ基準・依存関係・完了済みアーカイブの前提が崩れていないことを上記 4-A〜I で確認

#### 6. 良かった点

- **m1 の解消における過不足のなさ**: Rev2-1 で私が提案した「(a)〜(d) は要素であって章立てではない」を、planner は 5 つの次元（章立て・順序・見出し名・分量・統合分割）に分解して具体例（1 段落統合・Quick rules 組み込み）まで添えた。提案を字面で取り込まず、Owner 原則 7 の射程に翻訳して書き換えている。
- **m2 の 3 箇所配置の役割分離**: T-5（事実）/ T-8（手続き）/ 完成の定義（ポインタ）という 3 階層の役割分離が明確で、二重管理復活の罠を回避している。完成の定義側を「参照のみ」にすることで単一情報源原則を保ったうえで PM の取りこぼしを防ぐ構造は、レビュー指摘への対応として模範的。
- **m3 の双方向適用**: T-3 と T-4 に同文を置くことで「片方だけ厳しく片方が緩い」非対称を作らず、JSDoc 要件をコンポーネント全体に水平展開している。
- **m4 の AP 射程明示**: 「✓ を打つだけでは足りない」「言葉にして確認」と形式通過禁止を明文化することで、AP-WF11 / AP-WF09 への射程が plan 内に直接書かれた。Rev2-1 までは「PM が意識すれば」という暗黙の前提だった部分が plan の保証へ移行している。
- **`### Rev2-2 への入力` 節の自己チェック**: planner 自身が修正による副作用（Owner 原則 7 / 11 / 受け入れ基準数）を 3 項目で自己確認している。Rev2-1 と Rev2-2 の対応関係が読み手に伝わる構造になっており、レビュー作業の効率も上げている。

#### 7. 判定の根拠

判定: **pass**

判定の閾値（Blocker 1 件で needs_revision / Major 1 件で needs_revision / Minor 0 件まで詰める）に照らし、Blocker 0 件・Major 0 件・Minor 0 件のため pass。

Rev2-1 で挙げた Minor 4 件はすべて plan 本体に反映され、過剰な mandate にも不足にも陥っていない。修正による副作用（原則 7 違反 / 二重管理復活 / skill への一時情報混入 / 整合性破綻）は 5 つの重点確認で検出されず、観点 A〜I の差分再評価でも品質劣化はなく、原則 7 / F / G / H の 4 観点で **境界線上から境界内への移行** という品質向上が確認できた。

完了済みアーカイブ A-01〜A-04 への影響なし、skill ディレクトリ実体への影響なし、cycle-170.md のみの修正で plan としての完成度が向上している。

PM への次ステップ提案: 本 plan を確定し T-1 から builder に委任する段階に進んでよい。Rev2-1 で「PM への次ステップ提案: builder への T-1 委任時に Minor m1 / m3 を補正情報として伝えること」と書いた部分は、plan 本体に取り込まれたため不要になった。委任時の補正情報なしで plan のみで builder が正しく実行できる状態。

### T-1 Rev1（2026-04-27）

対象: T-1 で実施された skill ディレクトリ整理の独立検証。`git status` と `git diff` で変更内容を把握、`ls .claude/skills/frontend-design/` で実ファイル構成、`.claude/skills/frontend-design/SKILL.md` と `philosophy.md` を Read、`grep -rn "variables.md\|components.md"` で削除ファイル参照の残存を確認、`src/app/globals.css` の差分を確認。

判定: **needs_revision**

指摘件数: Blocker 0 / Major 0 / Minor 2

#### 受け入れ基準項目別の独立検証

**(1) 不要ファイルの物理削除**: `git status` 出力に `deleted: .claude/skills/frontend-design/components.md` と `deleted: .claude/skills/frontend-design/variables.md`（いずれも staged）を確認。`ls -la` でも対象 2 ファイルは消失し、残るは `SKILL.md`（2476 bytes）と `philosophy.md`（7589 bytes）の 2 ファイルのみ。**充足**。

**(2) 役割記述の冒頭近傍配置**: SKILL.md L16-24 に HTML コメントで「このファイルの役割（玄関）」「書くこと」「書かないこと」が明記されている。3 つの観点（自動ロード入口、概要案内、書く/書かない）すべてが読み手に伝わる。philosophy.md は L1-6 のタイトル + ブロッククォートで「Named Aesthetic Tone: functional-quiet」を宣言し、ファイルの担う領域（デザイン哲学・トーン）が冒頭で読み取れる。後者は SKILL.md ほど明示的な「書かないこと」記述ではないが、T-1 受け入れ基準（plan L46）が「既存 philosophy.md の本文に変更が入っていないこと」を同時に要求しており、既存タイトルと冒頭ブロッククォートで役割が伝わると判断する。**充足**。

**(3) 一時的・対症療法的記述の不在**: 削除された `variables.md` には素地由来選定理由・サードパーティ衝突リスク（次サイクル候補）・段階置換ガイド・--color-\* 対応表・「次サイクルで追加する場所」コメントが大量にあったが、すべて物理削除と共に消失した。残存 2 ファイルを Read して再確認:

- SKILL.md: 値表なし、対応表なし、移行表なし、段階置換ガイドなし、サードパーティ衝突注記なし。L40-45 の HTML コメントは「T-2 でこの本文を書く」というタスク baton-pass であり、対症療法的記述ではない（ただし下記 Minor-2 参照）
- philosophy.md: 不変。判断基準と NEVER 節のみで、移行・対応・段階置換・衝突情報を一切持たない

skill ディレクトリ全体に該当記述ゼロを確認。**充足**。

**(4) philosophy.md 本文不変**: `git diff HEAD -- .claude/skills/frontend-design/philosophy.md` および `git diff --staged HEAD -- .claude/skills/frontend-design/philosophy.md` の出力が両方空。物理的にバイト単位で変更されていない。**充足**。

**(5) SKILL.md frontmatter 不変**: 現在の SKILL.md L1-14 の frontmatter（`name: frontend-design` / `description`（既存トリガー文面）/ `user-invocable: false` / `paths` の 3 グロブ）が、`git diff` 上で変更行に含まれていない（diff は L16 以降のコメントと本文のみ）。frontmatter は完全に据え置き。**充足**。

5 項目すべて受け入れ基準を満たす。

#### 観点 A — 受け入れ基準の独立検証

上記 5 項目で受け入れ基準そのものは充足。詳細は受け入れ基準項目別の検証節を参照。

#### 観点 B — 副作用チェック

`grep -rn "variables.md\|components.md"` をリポジトリ全体に走らせた結果、削除ファイルへの参照は以下に分布:

- `docs/research/2026-04-23-claude-code-design-guideline-enforcement-mechanisms.md`、`2026-04-23-anthropic-official-design-skill-deep-dive.md`、`2026-04-23-ai-agent-design-system-enforcement-best-practices.md`、`2026-04-26-cycle-169-research-synthesis-for-design-system.md`: 過去の研究レポート内の論述。これらは「過去時点でのデザインシステム文献調査の記録」として正当な歴史的参照。skill ディレクトリ整理で書き換える対象ではない
- `docs/cycles/cycle-170.md`: 本サイクル自身の plan・レビュー履歴での参照。Rev2 plan が `variables.md` `components.md` の削除を意思決定として記録するために必要な参照。書き換え不要
- `src/app` `src/components` 配下のコード: ゼロ件。動作を阻害する参照は存在しない

`src/app/globals.css` L109 の `用途・命名規約は .claude/skills/frontend-design/variables.md を参照` が `SKILL.md を参照` に書き換えられている。これは削除されたファイルへの dead link を生まないための妥当な書き換え。ただし下記 Minor-1 参照。

副作用としての破壊的影響なし。**充足**。

#### 観点 C — Owner 原則との一対一適合

- **原則 10（skill は将来にわたって使い続けるもの・一時情報禁止）**: 削除ファイルに含まれていた「次サイクル候補」「次サイクルで追加する場所」「段階置換ガイド」が物理的に消滅。残存ファイルにサイクル都合の注釈は基本的に存在しないが、SKILL.md L40-45 の `<!-- T-2 でこの本文を書く -->` コメントはサイクル内タスク ID を含む（下記 Minor-2 参照）
- **原則 11（二重管理回避）**: CSS 変数の値・命名規約は globals.css のセクションコメント、コンポーネント API は TypeScript の型 + JSDoc、判断基準は philosophy.md と、それぞれの単一情報源が明確化された。skill 側で値や API を重複記述している箇所はゼロ
- **原則 12（現状ファイル構成のゼロベース検討）**: Rev2 plan の設計判断節で 3 案比較のうえ採用案 Y（SKILL.md + philosophy.md の 2 ファイル）が選ばれ、本タスクで物理的にその構成が実装された

充足。

#### 観点 D — 受け入れ基準外の検証

**T-2 への侵食評価**: SKILL.md L26-38 に新規本文が追加されている:

- L28: 「yolos.net のデザインシステムガイドライン。Named Tone: functional-quiet（機能的な静けさ）。」
- L30-35: 2 行のドキュメント構成表（SKILL.md / philosophy.md）
- L37-38: 「CSS 変数の値・命名規約は src/app/globals.css のセクションコメントが単一情報源。コンポーネントの API は各コンポーネントファイルの JSDoc が単一情報源。」

このうち L37-38 は T-2 受け入れ基準（plan L54）の「(b) 値の単一情報源は src/app/globals.css である」「(c) コンポーネント API は TypeScript の型定義と JSDoc を直接読むべき」と直接対応する内容で、T-2 の責務に踏み込んでいる。L28 の Named Tone 命名宣言も T-2 の (d) と重なる。下記 Minor-2 参照。

**次サイクルの別 builder/reviewer に伝わるか**: SKILL.md L16-24 を読めば「役割は玄関」「単一情報源は別ファイル」「移行表は書かない」が即座に理解できる。philosophy.md は冒頭の Named Tone 宣言と「なぜこのトーンか」節で哲学ファイルだと分かる。新規参入者の navigability は確保されている。

**ビルド・lint 影響**: 変更は Markdown と CSS コメントのみ。`npm run build` への影響はない（実機実行は本タスク受け入れ基準外）。

#### Blocker

なし。

#### Major

なし。

#### Minor

- **Minor-1（観点 B / D — globals.css の参照先は forward reference になっている）**: `src/app/globals.css` L109 の書き換えで「用途・命名規約は .claude/skills/frontend-design/SKILL.md を参照」となったが、現時点の SKILL.md には用途・命名規約の記述がない（T-2 で書かれる）。dead link は回避できているが、現時点で globals.css コメントを読んだ Claude/builder が SKILL.md を開いても用途・命名規約は見つからない。**修正方向**: (a) コメント文面を「設計判断は philosophy.md・玄関は SKILL.md を参照」のように現状の skill 内容と整合する形にする、または (b) T-2 完了時にこの globals.css コメントの指す先が機能することを T-2 の補強で確実にする。Minor 扱いの理由: T-2 完了で自動解消する forward reference であり、その間の混乱期間は短い

- **Minor-2（観点 C / D — T-1 が T-2 領域に踏み込んでいる）**: T-1 受け入れ基準は「役割記述」までを範囲とし、本文の書き直しは T-2 の責務（plan L47）。しかし SKILL.md L26-38 に追加された本文は、T-2 受け入れ基準 (b)(c)(d)（L37-38 が (b)(c)、L28 が (d) の Named Tone 宣言）に直接対応する内容を含む。L40-45 の HTML コメントも「T-2 でこの本文を書く」として T-2 タスク ID を skill 内に書き込んでおり、原則 10「サイクル都合の注釈をスキルに残さない」の境界線上にある。**修正方向**: (a) T-2 の責務である Quick reference / Quick rules / NEVER / 関連リンクを T-2 で書く際に、L26-38 の既存本文を T-2 主体で再構成して整合させる（T-2 builder に明示的に伝える）、または (b) 本タスクで L26-38 を最小化（タイトルと役割コメントのみに）して T-2 に明確に明け渡す。Minor 扱いの理由: 追加本文は最小限（5 行程度の navigation）で、T-2 主要要素（Quick reference / Quick rules / NEVER 節）はまだ含まれておらず、T-2 で上書きされて整合される余地が大きい。L40-45 の T-2 ID コメントも T-2 完了時に削除されるべき性質のもの

#### 良かった点

- `variables.md`（309 行）に詰まっていた素地由来選定理由・サードパーティ衝突注記・--color-\* 対応表・段階置換ガイドが、文字通り 1 行も残らず削除された。Rev1 系列で繰り返し問題化した「skill 内に積もる一時情報」が物理的に解消されたことが grep で確認できる
- SKILL.md L16-24 の HTML コメントは「書くこと／書かないこと」を明示しており、原則 10・11 の趣旨を将来の自身（含む別 builder）に伝える教育的な記述になっている
- philosophy.md がバイト単位で不変（diff 出力空）であり、T-1 が「触らないと決められたファイルを触らない」境界線を厳守している
- `git status` のステージング状態（削除のみ staged、SKILL.md / globals.css は unstaged）が、変更の意図を明示する適切な構造になっている

#### 判定の根拠

T-1 受け入れ基準 5 項目はすべて充足。Blocker・Major はゼロ。ただし Minor を 2 件検出:

- Minor-1: globals.css の参照先 forward reference の整合性（軽微、T-2 で自動解消余地あり）
- Minor-2: SKILL.md L26-38 の追加本文と L40-45 のタスク ID コメントが T-2 領域・原則 10 境界線に踏み込んでいる

判定基準（Blocker / Major / Minor のいずれかが 1 件でもあれば needs_revision）に照らし、Minor 2 件のため **needs_revision**。修正方向はいずれも軽微で、T-2 着手時に builder へ補正情報として伝えることで T-2 と同時に解消する選択肢もある。

### T-1 Rev2（2026-04-27）

対象: T-1 Rev1 で指摘した Minor-1 / Minor-2 の解消確認、および全体再点検。`git status` と `git diff`（staged / unstaged 双方）で変更内容を独立把握、`ls -la .claude/skills/frontend-design/` で実ファイル構成、`SKILL.md`（1072 bytes）と `philosophy.md`（7589 bytes）を Read、`grep -rn "variables.md\|components.md" .claude src` で削除ファイル参照の残存を確認、`src/app/globals.css` L106-118 を Read。

判定: **needs_revision**

指摘件数: Blocker 0 / Major 0 / Minor 2

#### 1. Minor-1（globals.css の forward reference）の解消確認

修正後の `src/app/globals.css` L106-118 を独立に Read。L109 にあった `用途・命名規約は .claude/skills/frontend-design/variables.md を参照。` の行は完全削除されている。書き換え（例: `SKILL.md を参照`）ではなく除去という対応で、globals.css は外部 skill ファイルへのリンクを一切持たない自己完結状態に戻った。**完全解消**。Rev1 で「dead link は回避できているが forward reference の機能不全期間が生じる」と指摘した状態が、外部参照そのものを除去することで根本的に解消されている。

ただし下記 Minor-3 参照（L109 に空行が残った点）。

#### 2. Minor-2（T-2 領域への踏み込み）の解消確認

修正後の `SKILL.md` 全文（27 行、1072 bytes）を独立に Read。Rev1 で問題視した以下の要素の状態:

- L28（Rev1）の「Named Tone: functional-quiet（機能的な静けさ）」記述: **削除済み**。L18 は「yolos.net のデザインシステムガイドライン。」の一文のみ
- L37-38（Rev1）の「CSS 変数の値・命名規約は src/app/globals.css のセクションコメントが単一情報源。コンポーネントの API は各コンポーネントファイルの JSDoc が単一情報源。」記述: **削除済み**。本文中のどこにも単一情報源の指定文はない
- L40-45（Rev1）の `<!-- T-2 でこの本文を書く -->` HTML コメント: **削除済み**。サイクル都合のタスク ID コメントは現存しない
- 元から存在していた L1（Rev1 では L16-24 化）の `<!-- このファイルは T-07 で本文を書く -->` コメント: **削除済み**。Owner 原則 10「サイクル都合の注釈をスキルに残さない」適用で除去された
- ドキュメント構成表: 削除ファイル 2 件（variables.md / components.md）の行が除去され、philosophy.md 1 行のみに整理された

T-2 受け入れ基準 (a)〜(d) のうち本文に該当する記述は現在の SKILL.md には含まれていない。T-2 builder が白紙に近い状態から本文を書ける。**完全解消**。

ただし下記 Minor-4 参照（同時に Rev1 受け入れ基準 2 を弱めている）。

#### 3. 受け入れ基準 1〜5 の再独立検証（巻き戻しによる新規未充足の有無）

**(1) 不要ファイルの物理削除**: `git status` で `deleted: components.md` `deleted: variables.md` の 2 件が staged。`ls` で残存は SKILL.md と philosophy.md の 2 ファイルのみ。**充足（変化なし）**。

**(2) 残存ファイルの役割記述**: ここに巻き戻しの副作用がある。

- philosophy.md: 不変。L1-6 のタイトル「デザイン哲学 — functional-quiet」とブロッククォート（Named Aesthetic Tone 宣言）で役割が冒頭で読める。Rev1 と同等。
- **SKILL.md: 役割記述が薄くなった**。現状の冒頭近傍は L16-26:
  - L16: タイトル `# frontend-design スキル`
  - L18: 「yolos.net のデザインシステムガイドライン。」
  - L20-24: ドキュメント構成表（philosophy.md 1 行のみ）
  - L26: 「> 詳細は各ファイルを参照してください。本ファイル（SKILL.md）は玄関です。」

「玄関」という単語で役割の方向性は示されているが、T-1 受け入れ基準 plan L44 が要求する **「何を書くか／何を書かないか」が読み手に伝わる形** には届いていない。Rev1 では L16-24 の HTML コメントが「書くこと: Named Tone の宣言、Quick reference、Quick rules、NEVER 節の要約、各ファイルへのリンク／書かないこと: CSS 変数の値そのもの、コンポーネントの詳細 API、移行表・対応表・サイクル都合の注釈」と明示しており、私の Rev1 レビューでも「良かった点」として「原則 10・11 の趣旨を将来の自身（含む別 builder）に伝える教育的な記述になっている」と評価していた。今回の巻き戻しで Minor-2 と一緒にこの**良かった役割宣言コメントごと除去**されてしまった。下記 Minor-4。

**(3) 一時情報・対症療法的記述の不在**: skill ディレクトリ全体（2 ファイル）を独立に Read。値表ゼロ、対応表ゼロ、移行表ゼロ、段階置換ガイドゼロ、サードパーティ衝突注記ゼロ、サイクル都合のタスク ID コメントもゼロ（前 plan の `T-07 で本文を書く` コメントも今回除去された）。**充足（むしろ Rev1 より強化）**。

**(4) philosophy.md 本文不変**: `git diff` および `git diff --staged` の出力が両方空。**充足（変化なし）**。

**(5) SKILL.md frontmatter 不変**: `git diff` の差分は L15 以降のみで、L1-14 の frontmatter（`name` / `description` / `user-invocable` / `paths` の 3 グロブ）に変更行は含まれない。**充足（変化なし）**。

5 項目のうち (1)(3)(4)(5) は完全充足、(2) は SKILL.md について受け入れ基準の文言を厳密に読むと未充足の余地（下記 Minor-4 で詳述）。

#### 4. 副作用チェック（観点 B）

`grep -rn "variables.md\|components.md" .claude src` を独立実行。`.claude` 配下と `src` 配下に削除ファイルへの参照は **0 件**。Rev1 時点で残っていた `docs/research/` `docs/cycles/cycle-170.md` の参照は過去履歴・本サイクル plan として正当な参照であり、本タスクで触る対象ではない。動作を阻害する参照は存在しない。**充足**。

#### 5. Owner 原則との一対一適合（観点 C）

- **原則 10（一時情報排除）**: skill 配下にサイクル都合の注釈（タスク ID 含む）が完全に除去された。Rev1 では L40-45 の `T-2 でこの本文を書く` コメントが境界線上だったが、今回は全て除去。**強化**
- **原則 11（二重管理回避）**: globals.css が skill への外部リンクを持たず、:root ブロック自身が値の単一情報源として自己完結。skill 側にも値・対応表は存在しない。**強化**
- **原則 12（採用案 Y の物理実装）**: 2 ファイル構成。**充足（変化なし）**

#### 6. 観点 D — 受け入れ基準外の検証

**T-2 への引き継ぎ性**: T-2 builder が SKILL.md を開いた時の手がかり量は Rev1 比で大幅に減った（2476 bytes → 1072 bytes）。「玄関」という単語と「ドキュメント構成表」のみ。T-2 受け入れ基準（plan L53-58）の要求要素（Quick reference / Quick rules / NEVER 節 / 関連ファイルへのリンク / 値・変数名のリストを書かない 等）を理解するには cycle-170.md を別途参照する必要がある。これは「plan を読まない builder はそもそも存在しない」前提で許容される範囲だが、SKILL.md 内の自己説明性は弱まっている。下記 Minor-4 参照。

**ビルド・lint 影響**: SKILL.md は markdown、globals.css の変更はコメント内の 1 行除去（CSS 構文への影響なし）。`npm run build` への影響なし（実機実行は本タスク受け入れ基準外）。

#### Blocker

なし。

#### Major

なし。

#### Minor

- **Minor-3（観点 B — globals.css L109 に巻き戻し痕跡の空行が残っている）**: 修正後の globals.css L106-111 を独立に Read すると、ブロックコメント内に以下の構造が残る:

  ```
  /* ==========================================================================
     Design System トークン（cycle-170 T-03 で追記）
     値の単一情報源はこのファイルの :root ブロック。

     ダーク値は未定義（次サイクルで WCAG AA 検証後に追加）。
  ```

  L109 の空行は元々「用途・命名規約は ... を参照」の行が占めていた位置で、行を除去しただけで前後の改行を整えていないため、コメント内に意図不明の空行として残っている。値の単一情報源の宣言（L108）とダーク値の状態説明（L110）の間に視覚的な段落区切りを置く意図にも読めるが、他のコメント節（例: L113-117 の「フォント読み込みについて:」節）と段落区切りスタイルが一致しない。**修正方向**: (a) L109 の空行を削除して L108 と L110 を連続させる、または (b) L109 を「`値・命名規約はすべて :root ブロック内のセクションコメントで自己完結する。`」のような積極的な宣言文に置換する。Minor 扱いの理由: コメント内の空行であり CSS 構文には影響せず、ビルド・実機表示・lint いずれにも影響しない純粋なコスメティック

- **Minor-4（観点 A 受け入れ基準 (2) / 観点 D — SKILL.md の役割記述が「何を書くか／何を書かないか」を伝えなくなった）**: T-1 受け入れ基準 plan L44 は「**残存ファイルそれぞれの先頭または冒頭近傍に「このファイルが担う役割（何を書くか／何を書かないか）」が読み手に伝わる形で示されていること**」と明文で要求している。括弧内の「何を書くか／何を書かないか」は役割の内容を具体化する文言で、単なる例示ではなく「読み手に伝わる」べき情報の中身。

  現状の SKILL.md L16-26 から伝わるのは:
  - 「玄関である」（L26 — 役割の方向性は伝わる）
  - 「デザインシステムガイドラインである」（L18 — 担当領域は伝わる）
  - 「philosophy.md がデザイン哲学・トーン・NEVER 節を担う」（L24 — 隣接ファイルの役割が伝わる）

  伝わらないのは:
  - SKILL.md 自身に**何を書くべきか**（Quick reference を入れるのか、リンクだけなのか、本文ゼロでよいのか — 「玄関」だけでは確定しない）
  - SKILL.md 自身に**何を書かないべきか**（CSS 変数の値・対応表・移行情報・サイクル都合の注釈を書かない、というのが今回の Rev2 plan で確立した方針なのに、その方針が SKILL.md 内には残らない）

  Rev1 で builder は L16-24 の HTML コメントでこの 2 点を明示しており、私の Rev1 レビューでもこれを「良かった点」として評価した。Minor-2 解消の巻き戻しで「T-2 領域に踏み込んだ本文（L26-38）」「T-2 タスク ID コメント（L40-45）」と一緒に**役割宣言の HTML コメント（L16-24）まで除去された**点が、過剰巻き戻しに当たる。

  **修正方向**: SKILL.md frontmatter 直後に短い HTML コメントまたは見出し下の引用ブロックで、「書くこと: Named Tone 宣言・Quick reference・Quick rules・NEVER 要約・関連ファイルへのリンク」「書かないこと: CSS 変数の値・コンポーネント詳細 API・移行表・対応表・サイクル都合の注釈」を最小限の文言で復活させる（T-2 領域の本文を書くのではなく、T-2 builder への baton-pass としての役割宣言を置く）。Rev1 の L16-24 はそのまま採用してよい構造であり、本文（L26-38）と T-2 タスク ID コメント（L40-45）だけを除去すれば足りた。

  Minor 扱いの理由: 物理ファイル削除と二重管理排除という T-1 の核心目的は達成されており、T-2 着手時に補完できる範囲。ただし「受け入れ基準 (2) を厳密に満たしていない」点は単独で needs_revision の理由になる

#### 良かった点

- Minor-1 の解消が「書き換え」ではなく「除去」で行われ、globals.css が外部 skill ファイルへの依存を持たない自己完結状態になった。原則 11（二重管理回避）が更に強化された
- Rev1 で残っていた `T-07 で本文を書く` `T-2 でこの本文を書く` 等のサイクル都合のタスク ID コメントが skill 内から完全に除去された。原則 10（一時情報排除）が更に強化された
- ドキュメント構成表が削除ファイル 2 件を除去して philosophy.md 1 行に整理された。表の内容と実ディレクトリ状態が一致し、stale 情報がない
- philosophy.md は Rev1 に続いてバイト単位で完全不変。frontmatter も不変。「触らないと決められたファイルを触らない」境界線が引き続き厳守されている
- `git status` のステージング構造が引き続き整然としており、変更の意図が読みやすい

#### 判定の根拠

Rev1 で挙げた Minor-1 / Minor-2 はいずれも完全解消。原則 10・11 はむしろ Rev1 より強化された。一方、巻き戻しの過程で Rev1 では充足していた受け入れ基準 (2)「役割記述」が SKILL.md について弱まり、Minor-4 として新規発見された。加えて globals.css の巻き戻し痕跡として Minor-3（コメント内の空行）が残った。

判定基準（Blocker / Major / Minor のいずれかが 1 件でもあれば needs_revision）に照らし、Minor 2 件のため **needs_revision**。

修正方向はいずれも軽微:

- Minor-3: globals.css L109 の空行除去（1 行修正）
- Minor-4: SKILL.md frontmatter 直後に「書くこと／書かないこと」HTML コメントを復活（Rev1 の L16-24 をそのまま採用してよい。本文 L26-38 と T-2 タスク ID コメント L40-45 を除去するだけにする）

PM への次ステップ提案: builder への補正指示で 2 件同時解消が期待できる。Minor-4 の修正に際しては「Rev1 で書いた役割宣言コメントの構造（書くこと N 項目／書かないこと N 項目）は妥当。T-2 領域に踏み込んだ本文と T-2 タスク ID コメントだけを除去するのが正しい巻き戻し範囲だった」点を builder に伝えること。

### T-1 Rev3（2026-04-27）

対象: T-1 Rev2 で指摘した Minor-3 / Minor-4 の解消確認、および全体再点検（Rev1〜Rev3 の編集履歴オシレーション検証を含む）。`git status` と `git diff`（staged / unstaged 双方）で変更内容を独立把握、`ls -la .claude/skills/frontend-design/` で実ファイル構成、`SKILL.md`（1533 bytes、Rev2 の 1072 bytes から +461 bytes）と `philosophy.md`（7589 bytes、不変）を Read、`src/app/globals.css` L104-117 を Read、`grep -rn "variables.md\|components.md" .claude src` で削除ファイル参照の残存確認、`grep -nE "T-0?[0-9]|cycle-1[0-9][0-9]|サードパーティ|衝突|移行表|段階置換|対応表|キャリーオーバー|次サイクル"` でサイクル都合・対症療法的キーワードの残存確認。

判定: **pass**

指摘件数: Blocker 0 / Major 0 / Minor 0

#### 1. Minor-3（globals.css L109 空行）の解消確認

修正後の `src/app/globals.css` L106-117 を独立に Read。Rev2 で残っていた L109 の空行が完全除去され、コメントブロックは以下のように連続行として整然と読める:

```
/* ==========================================================================
   Design System トークン（cycle-170 T-03 で追記）
   値の単一情報源はこのファイルの :root ブロック。
   ダーク値は未定義（次サイクルで WCAG AA 検証後に追加）。
   既存の --color-* 体系は変更していない（広範に参照されているため）。

   フォント読み込みについて:
   ...
```

L108-110 が連続し、L111 の空行は「値・ダーク値」段落と「フォント読み込み」段落を分ける段落区切りとして他のコメント節と整合する。`git diff` 出力でも該当行（`-   用途・命名規約は .claude/skills/frontend-design/variables.md を参照。`）の単独削除が明確に確認できる。**完全解消**。

#### 2. Minor-4（SKILL.md 役割宣言の薄さ）の解消確認

修正後の `SKILL.md` L16-21 に追加された HTML コメントを独立に Read:

```
<!--
  このファイルの役割: デザインシステム skill の玄関（道案内）
  書くこと: デザインシステム全体の概要・Quick reference・Quick rules・NEVER 節の要約・各ファイルへの案内
  書かないこと: CSS 変数の値そのもの・コンポーネントの詳細 API・移行表・対応表・サイクル固有の注釈
  詳細な判断基準（哲学・トーン・NEVER）は philosophy.md が担う
-->
```

T-1 受け入れ基準 plan L44 が要求する「このファイルが担う役割（何を書くか／何を書かないか）」の 3 要素が独立に充足:

- **役割**: 「玄関（道案内）」と明示。Rev2 の本文 L33 の「玄関です」と組み合わせて二重宣言になるが、HTML コメントは builder/AI への指示、本文は読み手への navigation という機能分離があり冗長性は許容範囲
- **何を書くか**: 5 項目（概要・Quick reference・Quick rules・NEVER 要約・各ファイル案内）が列挙
- **何を書かないか**: 5 項目（値・詳細 API・移行表・対応表・サイクル固有注釈）が列挙

5 項目 × 2 系統で原則 10・11 の趣旨が将来の builder/reviewer に伝わる。**完全解消**。

#### 3. 役割宣言の妥当性検証（観点 — T-2 領域への侵食有無）

新規 HTML コメント L16-21 が T-2 受け入れ基準（plan L53-58）の (a)〜(d) に踏み込んでいないか、独立に対比検証:

- **T-2 (a)「このスキルが何のためにあるか」**: コメントで「デザインシステム skill の玄関」と役割を述べているが、用途・適用範囲のような T-2 (a) 本体記述は含まない。本文 L25 の「デザインシステムガイドライン。」も既存記述で T-2 領域ではない
- **T-2 (b)「値の単一情報源は src/app/globals.css」**: コメントには明示的に書かれていない。「書かないこと: CSS 変数の値そのもの」とあるが、これは禁止であって単一情報源の指定ではない。T-2 builder の責務として残されている
- **T-2 (c)「コンポーネント API は型定義 + JSDoc」**: コメントには明示的に書かれていない。「書かないこと: コンポーネントの詳細 API」とあるが、(b) と同様、禁止と単一情報源指定は別物
- **T-2 (d)「Named Tone / NEVER 節の判断基準は philosophy.md」**: コメント末尾 L20 に「詳細な判断基準（哲学・トーン・NEVER）は philosophy.md が担う」と書かれている。これは (d) と内容が重なる

(d) との重なりが懸念点。ただし以下の理由で T-2 領域への侵食ではないと判断:

1. Rev2 レビューで Rev1 評価として「Named Tone: functional-quiet という具体名の宣言」を T-2 領域と判定したが、Rev3 では具体名（`functional-quiet`）は除去され、philosophy.md の責務として領域を指すだけの記述になっている
2. 「詳細な判断基準は philosophy.md が担う」は **責務の分担宣言**であり、T-2 (d) の本体（判断基準そのものの参照ガイド・読者向け提示）とは異なる
3. plan L54 (d) の表現は「判断基準は philosophy.md にある **ことが伝わる**」であり、これは T-2 builder が読み手向けに書く情報。一方の HTML コメント L20 は将来の builder（含む T-2 自身）向けの境界宣言

T-2 builder が SKILL.md 本文に「判断基準は philosophy.md を参照」と読み手向けに書く責務は引き続き残っている。**T-2 領域への踏み込みなし**。

#### 4. 原則 10（一時情報排除）の検証

修正後の skill ディレクトリ全体（SKILL.md + philosophy.md の 2 ファイル）に対して `grep -nE "T-0?[0-9]|cycle-1[0-9][0-9]|サードパーティ|衝突|移行表|段階置換|対応表|キャリーオーバー|次サイクル"` を独立実行。マッチ 2 件:

- `SKILL.md:19: 書かないこと: ... 移行表・対応表・サイクル固有の注釈`: 否定形の禁止リスト内の語であり、**これらが skill に存在しないようにする** ためのガード文言。原則 10 違反ではなく、原則 10 を能動的に守らせる記述
- `philosophy.md:61: cycle-169 の失敗と研究レポートの D 節から具体的に抽出した`: NEVER 節の根拠提示。philosophy.md は plan A-01 で pass 済みかつ T-1 受け入れ基準 (4) で「本文に変更が入らないこと」が要求されているため、本タスクで触る対象ではない。歴史的・由来情報として正当（cycle-169 が将来削除されても素朴な意味は通じる）

新たに混入した一時情報・対症療法的記述はゼロ。**充足**。

#### 5. オシレーション検出（Rev1 → Rev2 → Rev3 の編集履歴）

L16-21（SKILL.md frontmatter 直後）の編集履歴を独立追跡:

- **前 plan A-03 時点**: `<!-- このファイルは T-07 で本文を書く。現時点は玄関（frontmatter確定）のみ。 -->`（1 行、サイクルタスク ID 含有）
- **Rev1（前回 T-1）**: 役割／書くこと／書かないこと の HTML コメント（9 行）。Rev1 レビューで「良かった点」として評価された
- **Rev2（巻き戻し）**: HTML コメント完全除去。Rev2 レビューで「過剰巻き戻し」として Minor-4 を提起
- **Rev3（今回）**: 役割／書くこと／書かないこと の HTML コメント（6 行）として復活

Rev1 と Rev3 の内容を独立対比:

- 共通要素: 役割（玄関）、書くこと（5 項目）、書かないこと（5 項目）。構造は同型
- Rev3 の差分: (a) Rev1 にあった「Named Tone の宣言」を「デザインシステム全体の概要」に置換（具体トーン名 `functional-quiet` を回避し T-2 領域に踏み込まない判断）、(b) Rev1 にあった「(globals.css が単一情報源)」「(JSDoc が単一情報源)」の括弧書き解説を除去（これらも T-2 (b)(c) 領域）、(c) Rev1 にあった「paths グロブに一致するファイルを編集する際に Claude が自動ロードする入口」という機能解説を除去（実装詳細）、(d) Rev3 で新規に「詳細な判断基準（哲学・トーン・NEVER）は philosophy.md が担う」を追加（philosophy.md との責務分担を明示）

**評価**: Rev3 は Rev1 の単純な復活ではなく、Rev2 で挙げられた T-2 領域踏み込み懸念を反映した洗練版。「追加 → 削除 → 復活」で同一内容が往復しているのではなく、Rev1 → Rev2 → Rev3 で**境界線が一段精緻化された**。健全な反復改善。

#### 6. 受け入れ基準 1〜5 の最終再独立検証

**(1) 不要ファイルの物理削除**: `git status` で `deleted: components.md` `deleted: variables.md` の 2 件が staged。`ls` で残存は 2 ファイルのみ。**充足**。

**(2) 残存ファイルの役割記述**: SKILL.md L16-21 の HTML コメントで「役割／書くこと／書かないこと」が明示。philosophy.md L1-6 のタイトル + Named Aesthetic Tone 宣言で役割が冒頭で読める。両ファイルとも「読み手に伝わる形」を満たす。**充足**。

**(3) 一時情報・対症療法的記述ゼロ**: grep 結果（上記 4 節）で skill 内に該当記述なし。**充足**。

**(4) philosophy.md 本文不変**: `git diff` および `git diff --staged` の出力が両方空。**充足**。

**(5) SKILL.md frontmatter 不変**: `git diff` の差分は L15 以降のみで、L1-14 の frontmatter（`name` / `description` / `user-invocable` / `paths` の 3 グロブ）に変更行は含まれない。**充足**。

5 項目すべて完全充足。

#### 7. 副作用チェック（観点 B）

`grep -rn "variables.md\|components.md" .claude src` の出力は 0 件。`.claude` 配下と `src` 配下に削除ファイルへの動作阻害的参照なし。`docs/research/` `docs/cycles/cycle-170.md` の参照は過去履歴・本サイクル plan 自身として正当な参照（前 Rev レビューで判定済み）。**充足**。

#### 8. T-2 への引き継ぎ性（観点 D）

T-2 builder が SKILL.md を開いた時に得られるもの:

- L16-21 HTML コメント: 書くべき要素 5 項目と書いてはいけない要素 5 項目の明示
- L23: タイトル
- L25: 1 行の概要
- L27-31: ドキュメント構成表
- L33: 「玄関です」の navigation 注記

T-2 受け入れ基準（plan L54）の (a)〜(d) のうち、(b)(c) の単一情報源指定と (d) の Named Tone 提示は T-2 builder が本文として書く責務として未着手で残されており、適切な「玄関プレースホルダ」状態。Quick reference / Quick rules / NEVER 要約も T-2 builder が判断・記述する余地が残っている（plan L59 で discretion が明文化されている）。**良好**。

#### 9. Owner 原則 10・11・12 の遵守確認

- **原則 10（skill に一時情報を入れない）**: skill 配下からサイクルタスク ID コメントが完全除去された状態を Rev3 でも維持。新規 L16-21 のコメントは普遍的な役割宣言で、サイクル番号やタスク ID を含まない。**充足**
- **原則 11（二重管理回避）**: globals.css は外部 skill への参照を持たず自己完結。skill 側にも値・対応表が存在せず、単一情報源の構造が保たれている。**充足**
- **原則 12（採用案 Y の物理実装）**: 2 ファイル構成。**充足**

3 原則すべて充足。

#### 10. 新規問題の検出（全体再点検）

skill ディレクトリ・globals.css 該当箇所・cycle-170.md plan 文面を独立に再点検した結果、Rev1〜Rev2 で見落としていた問題、Rev3 修正で新規に生じた問題は検出されなかった。下記 5 つの観点で確認:

- **役割コメント L16-21 の文面が新たな mandate を作っていないか**: 「Quick reference・Quick rules・NEVER 要約」と書かれているが、これらは plan L54 が builder discretion として明示する要素。コメントは方向性提示であって、各セクションの存在を強制しない。`builder discretion` を侵さない範囲
- **L20「詳細な判断基準（哲学・トーン・NEVER）は philosophy.md が担う」が二重管理を生まないか**: philosophy.md にこれらが書かれていることを宣言するのみで、SKILL.md 側にこれらの内容を写す指示ではない。**問題なし**
- **書くこと/書かないことの 5 項目ずつが過不足ないか**: 5 項目は plan L54 (a)〜(d) と整合する範囲内で、過剰な制約は加えていない。書かないことの 5 項目は前 `variables.md` `components.md` で発生した一時情報パターン（移行表・対応表・サイクル都合の注釈）を直接禁止しており、再発防止として機能
- **本文 L23-33 の構造が役割コメントと整合するか**: タイトル → 概要 → ドキュメント構成表 → 玄関宣言 という流れは、コメント内「書くこと」の一部（概要・各ファイルへの案内）に対応。Quick reference / Quick rules / NEVER 要約は本文未記述で T-2 委任。整合性あり
- **ファイルサイズの妥当性**: SKILL.md 1533 bytes は玄関プレースホルダとして適切。Rev2 の 1072 bytes は薄すぎ、Rev1 の 2476 bytes は T-2 領域踏み込み込み。中間サイズが妥当な落としどころ

#### Blocker

なし。

#### Major

なし。

#### Minor

なし。

#### 良かった点

- Minor-3 が「空行除去」という最小修正で完全解消。CSS 構文・実機表示・lint いずれにも影響を与えずコメント可読性のみが改善された
- Minor-4 が「Rev1 を機械的にコピペ復活」ではなく、Rev2 レビューで挙げられた T-2 領域懸念を反映して **洗練版として復活** された。具体トーン名（`functional-quiet`）の除去、単一情報源パラフレーズの除去、philosophy.md との責務分担文の新規追加 — Rev1 → Rev2 → Rev3 を通じて境界線が一段精緻化された健全な反復改善
- 5 項目 × 2 系統（書くこと／書かないこと）の役割宣言が、原則 10・11 の趣旨を将来の builder/reviewer に教育的に伝える構造を再獲得した。「skill に何を入れて何を入れないか」が将来の自身（含む T-2 builder）への明示的な baton-pass として機能する
- philosophy.md は Rev1 から Rev3 まで一貫してバイト単位で完全不変。frontmatter も不変。「触らないと決められたファイルを触らない」境界線が 3 Rev を通じて厳守された
- skill 配下からサイクルタスク ID コメント（前 plan の `T-07 で本文を書く` 等）が完全に除去された状態が Rev2 から Rev3 へ維持された。原則 10 違反の根本要因が物理的に消えた

#### 判定の根拠

T-1 受け入れ基準 5 項目すべて完全充足。Rev2 で挙げた Minor-3 / Minor-4 はいずれも完全解消。原則 10・11・12 すべて充足。Rev1〜Rev3 の編集履歴は単純なオシレーションではなく、Rev2 レビュー指摘を反映した洗練を含む健全な反復改善であることを独立に確認。全体再点検で新規問題は検出されず。Blocker 0 / Major 0 / Minor 0 のため **pass**。

PM への次ステップ提案: T-1 を完了として確定し、T-2（SKILL.md 玄関本文の書き起こし）に進んでよい。SKILL.md L16-21 の役割宣言コメントは T-2 builder にとって書くべき要素・避けるべき要素の明示的なガイドとして機能する。T-2 着手時に補正情報を渡す必要はない（plan L54 と SKILL.md L16-21 の双方が独立に T-2 の方向性を伝える）。

### T-2 Rev1（2026-04-27）

対象: `.claude/skills/frontend-design/SKILL.md` 本文（L23 以降、frontmatter L1-14 と役割宣言コメント L16-21 は T-1 で確定済みのため対象外）。`git diff HEAD` で T-2 の編集が SKILL.md 単独であることを確認したうえで、philosophy.md と `src/app/globals.css` の現状も独立に Read して道案内が機能するかを照合した。

判定: **pass**

#### 受け入れ基準項目別の独立検証

1. (a)〜(d) の 4 要素が伝わる構造になっているか:
   - (a)「このスキルが何のためにあるか」 → L25「yolos.net の UI を作るとき・直すとき・レビューするときの道案内」。三つの場面で名指す書き方が `character.md` 核「人々の傍に在りたい」「場面で名指す」と整合し、素地 SKILL.md の機械的コピーになっていない
   - (b)「値の単一情報源は `src/app/globals.css`、変数名・値・カテゴリ分類はそのコメントを直接読むべきこと」 → L30-35 の節「値と変数を参照するとき」に明確に記述。globals.css の実コメント（L121「Surface（背景面 5 階調）」以降）と SKILL.md L35 のセクション列挙が完全一致しており、案内先で迷子にならない
   - (c)「コンポーネント API は TypeScript の型定義と JSDoc を直接読むべきこと」 → L37-40 の節「コンポーネントを参照するとき」で記述。`src/components/design-system/` は T-3/T-4 完了後に生成されるため現時点では未存在だが、plan の依存関係（T-2 → T-3/T-4）上、T-2 段階で完成形の道案内を書くことは妥当。サブエージェントが先行参照するリスクは残るが、SKILL.md は frontmatter `paths: ["src/**/*.tsx", "src/**/*.module.css", "src/app/globals.css"]` で UI 編集時に自動配信されるため、design-system 未存在期間中の編集対象は globals.css と既存 `src/components/common/*` に限られ、(c) の案内が空振りしても致命的混乱は起きない構造になっている
   - (d)「判断基準（Named Tone / NEVER 節）は philosophy.md にあること」 → L42-46 の節「判断に迷ったとき」と L26 冒頭文の二箇所で philosophy.md への参照が機能。Markdown リンク `[philosophy.md](philosophy.md)` は実在ファイルを指している（同階層に philosophy.md L1-111 を Read で確認済み）。Named Tone 名 `functional-quiet` の言及は L44 にあるが、定義そのものは philosophy.md に押し戻しており、SKILL.md が philosophy.md の領分（具体的な哲学宣言）に踏み込みすぎていない

2. 4 要素は要素であって章立てではないという plan 但し書きへの適合 → builder は (a)〜(d) を 4 つの独立節として並べず、「値と変数を参照するとき」「コンポーネントを参照するとき」「判断に迷ったとき」という **読み手の動機別の節** に再編成している。これは形式の問題ではなく「玄関に来たサブエージェントがその場で何をすべきか」を起点とした自然な再構成で、plan が builder の判断範囲とした「章立て・順序・見出し名・統合分割」の良質な行使と評価できる

3. 値・変数名のリスト・対応表・カテゴリ別の用途解説が書かれていない → 変数名そのものは 0 件、値も 0 件、対応表も 0 件。L35 の「Surface / Text / Border / …」12 セクション列挙は globals.css の節見出しのインデックスとして機能するもので、各セクションの **用途解説** までは書かれていない（用途は globals.css コメントに残されている）。plan L269 の「変数のカテゴリ別解説・件数表・命名規約の詳細解説」には該当しない

4. 削除予定または既に消えた素地ディレクトリへの参照不在 → SKILL.md 全文を `grep -n "design-system-by-claude-design\|yolos-design\|yolos-ds"` で確認し 0 件

5. 玄関として常時参照に耐える分量 → frontmatter と役割宣言コメントを除く本文は約 40 行（L23-64）。四節 + Quick rules 3 項目 + ファイル構成表という構成で、サブエージェントが UI 編集前に毎回読んでも認知負荷にならない密度

6. 文体・章立てが `character.md` 核と整合し素地 SKILL.md の機械的コピーになっていない → 「だ・である」調で philosophy.md と接続。「ここは入口として必要な地図だ」「ここに対応表を置くと二重管理になる」「止まって読むこと」のような断定と命令形が PM の warm/eager トーンと矛盾なく成立。素地 SKILL.md は T-1 で物理削除済みのため文面比較は cycle-170.md L42-46 等の引用のみで行ったが、機械的コピーの痕跡は確認できない

#### 観点 A〜F の評価

- A（受け入れ基準）: 1〜6 すべて充足（上記）
- B（道案内の機能確認）: philosophy.md / globals.css への案内はいずれも実在ファイルを指し、案内先の粒度（globals.css の各セクションコメントが意味を保つこと、philosophy.md の Named Tone・NEVER 節・末尾の問い）が実際に応答できる状態にある。`src/components/design-system/` への案内のみ T-3/T-4 完了後に機能する性質だが、これは plan が想定済みの依存関係であり書き方として妥当
- C（Owner 原則との一対一適合）:
  - 原則 2（シンプルで分かりやすい）: 本文 40 行・四節構成で薄く保たれ、肥大化していない
  - 原則 7（plan は基本設計、詳細は builder）: 章立て・節名・Quick rules の項目数（3 項目）・ファイル構成表の有無はすべて builder 判断で、plan が mandate していない範囲で自由度を行使している。L25 の場面三類型（作る・直す・レビュー）も builder 由来の表現
  - 原則 10（skill は将来にわたって使い続けるもの）: サイクルタスク ID（T-1, T-2 等）・サイクル番号・移行表・段階置換ガイド・「将来サードパーティ衝突したら…」のような一時情報の混入は 0 件
  - 原則 11（二重管理回避）: 値・変数名・コンポーネント API・Named Tone 定義・5 ターゲット解説などが SKILL.md 本文に流入していない。philosophy.md と SKILL.md の役割が混ざっていない
- D（文体と character.md 核との整合）: philosophy.md の「だ・である」調と SKILL.md の文体が破綻なく接続。「玄関＝道案内」の構造的役割と「具体的な哲学宣言」の役割が混ざっていない（SKILL.md は Named Tone の名前のみ言及して定義は philosophy.md に押し戻している）
- E（T-1 役割宣言コメントとの整合）: L16-21 で「書くこと」と宣言されている (a)〜(d) 相当の項目はすべて本文に存在。「書かないこと」と宣言されている CSS 変数の値・詳細 API・移行表・対応表はいずれも 0 件で混入なし
- F（副作用と全体への影響）:
  - frontmatter（L1-14）: `git diff HEAD` で SKILL.md L23 以降のみが変更されており、frontmatter の `name` / `description` / `paths` / `user-invocable: false` はいずれも未変更
  - philosophy.md: `git status` で未変更
  - globals.css: `git status` で未変更
  - lint / build: 本タスクは Markdown 1 ファイルの本文編集のみで TypeScript・CSS・設定ファイルへの影響は無いため省略可能と判断（実行しても結果に影響しない）

#### 良かった点

- 「値を参照するとき / コンポーネントを参照するとき / 判断に迷ったとき」という **動機別の節構成** は、(a)〜(d) を機械的に並べる書き方より読み手の行動に直結する玄関設計として優れている。plan 受け入れ基準が「(a)〜(d) は要素であって章立てではない」と但し書きした意図を、builder が実装で正しく汲み取っている
- L33「ここには変数名も値も書かない。globals.css のコメントが単一情報源であり、ここに対応表を置くと二重管理になる」は、サブエージェントが将来 SKILL.md に値表を追記したくなったとき自分自身を抑制させる **メタ抑止** として機能する。役割宣言コメント L16-21 の重複ではなく、本文側で読み手に理由を伝える追加の補強として意味がある
- philosophy.md L102-110 の「判断に迷ったときの問い」を、SKILL.md L46「迷ったときの問いは philosophy.md 末尾に一文ある。止まって読むこと」で先回りに案内している点は、玄関と判断基準の往復を促す動線として実に丁寧
- ファイル構成表（L60-63）が「ファイル｜役割」の 2 列で SKILL.md 自身も `この道案内（玄関）` として登場している点は、サブエージェントが自分が今読んでいるファイルの位置づけを再確認できる self-aware な書き方

#### 検討点（Blocker / Major / Minor のいずれにも該当しないが記録する観察事項）

- L35 のセクション構成 12 個列挙は、globals.css のセクション見出しが将来変更されたとき同期更新が必要になる軽微な保守コストを生む。ただし plan L269 が禁ずる「カテゴリ別解説・件数表」には該当せず、玄関のインデックスとしての価値が同期コストを上回ると判断
- Quick rules L52-54 は philosophy.md NEVER 節の縮約だが、plan L266 が「必要に応じて Quick rules を置いてもよい — ただし philosophy.md と二重にならない範囲」と明示的に許容している。サブエージェントが philosophy.md まで辿らない場合の最低限の安全網として、軽微な重複を受け入れるトレードオフは合理的

#### 判定の根拠

T-2 受け入れ基準 5 項目（(a)〜(d) の伝達 / リスト・対応表不在 / 素地参照不在 / 玄関分量 / character.md 整合）すべて完全充足。観点 A〜F すべて pass。frontmatter・philosophy.md・globals.css への副作用 0 件。Owner 原則 2・7・10・11 すべて充足。素地 SKILL.md の機械的コピー痕跡なし。「玄関＝道案内」と「判断基準＝哲学」の役割分担が物理的に守られている。Blocker 0 / Major 0 / Minor 0 のため **pass**。

PM への次ステップ提案: T-2 を完了として確定し、T-3（操作可能要素のコンポーネント実装）と T-4（構造要素のコンポーネント実装とロゴ移動）を並行着手してよい。T-2 で確立された「`src/components/design-system/` の TypeScript 型 + JSDoc が単一情報源」という宣言は、T-3/T-4 builder にとって JSDoc の必須性（plan T-3 受け入れ基準「コンポーネント全体の用途・使う場面・使わない場面が JSDoc で書かれていること」）を SKILL.md 側からも裏付ける構造になっている。T-3/T-4 着手時に補正情報を渡す必要はない。

### T-3 Rev1（2026-04-27）

対象: T-3 が新設した操作可能要素 3 部品 — `src/components/design-system/Button.tsx` + `Button.module.css` + `__tests__/Button.test.tsx`、`Input.tsx` + `Input.module.css` + `__tests__/Input.test.tsx`、`Textarea.tsx` + `Textarea.module.css` + `__tests__/Textarea.test.tsx`。`git status` と `ls src/components/design-system/` で T-3 / T-4 双方の成果物が混在することを確認したうえで、上記 9 ファイルのみを評価対象とした（T-4 成果物 SiteHeader / SiteFooter / Panel / ArticleArea / SectionHead は本レビュー対象外）。

判定: **pass**

#### 受け入れ基準項目別の独立検証（plan L65-73）

1. 配置先 `src/components/design-system/` であること → `find src/components/design-system -type f` で全 3 部品が同ディレクトリ直下に配置されていることを確認。略語ディレクトリ（`ds/` 等）への退化なし。**充足**
2. 公開 API が TypeScript の型と JSDoc によって自己説明的、最低限 variant ごとに JSDoc → Button.tsx L13-16 で primary / ghost / danger 各 variant に「いつ使うか」が 1 行ずつ書かれている（"1 画面に 1 つ", "補助的なアクション", "取り消しできない破壊的操作にのみ"）。Input.tsx は variant を持たず type で分岐するため、props 各項目の JSDoc（L31-65）が代替として機能。Textarea.tsx も同様。**充足**
3. ファイル冒頭または default export の型／関数定義に、コンポーネント全体の用途・使う場面・使わない場面が JSDoc で書かれていること → Button.tsx L1-23 / Input.tsx L1-23 / Textarea.tsx L1-22 のいずれもファイル冒頭に「## 使う場面」「## 使わない場面」の節を持つ俯瞰的 JSDoc がある。Input.tsx L9-13 は「複数行 → Textarea」「選択肢 → Select」「チェック → Checkbox」と他コンポーネントへの誘導まで含み、案 Y で `components.md` を作らない前提（plan L67）が成立する粒度。**充足**
4. variant・size・状態は型リテラルで閉じ自由文字列で開放されない → Button.tsx L28 `type ButtonVariant = "primary" | "ghost" | "danger"`、L31 `type ButtonSize = "sm" | "md" | "lg"`。Input.tsx L29 `type InputSize = "sm" | "md" | "lg"`、L48 `type?: "text" | "email" | "password" | "search" | "url" | "tel" | "number"`。いずれも `string` への開放なし。cycle-169 で問題化した型穴が再発していない。**充足**
5. スタイルが新 CSS 変数のみ参照、`--color-*` 不参照 → `grep -n "var(--color-" Button.module.css Input.module.css Textarea.module.css` で 0 件。各 CSS で参照される変数（`--bg`, `--bg-soft`, `--bg-softer`, `--bg-invert`, `--bg-invert-soft`, `--fg`, `--fg-soft`, `--fg-softer`, `--fg-invert`, `--border`, `--accent`, `--danger`, `--danger-soft`, `--danger-strong`, `--sp-1〜5`, `--r-interactive`, `--fs-13〜16`, `--lh-tight/snug/base`, `--tracking-base`, `--elev-button`, `--t-fast`, `--ease`, `--font-sans`）はすべて globals.css L123-258 に実在。マジックナンバー混入は `min-height: 32px / 36px / 44px / 52px`（タップターゲットコメント付き）と spinner の `1em / 0.8s / 360deg` のみで、いずれもアニメーション/サイズ規定として CSS 変数化する性質ではない。**充足**
6. 既存 Header / Footer および既存 `var(--color-*)` 参照を変更していない → `git diff HEAD -- src/components/common/ src/app/globals.css` の出力 0 行で完全不変。`git status` でも `src/components/common/` 配下に変更なし。**充足**
7. キーボード操作とフォーカスリングが philosophy.md 規約と整合 → Button.module.css L41-44 `outline: 2px solid var(--accent); outline-offset: 2px;` （`:focus-visible` 限定でマウスクリック時の outline 出現を回避）。Input.module.css L64-68 / Textarea.module.css L66-70 はいずれも `outline: 2px solid var(--accent); outline-offset: 1px; border-color: var(--accent);` で同等。Tab / Enter / Space は HTML 標準ボタン要素・input・textarea の挙動を継承し、独自のキーハンドラで上書きしていない。**充足**
8. CSS Modules を採用、CSS-in-JS 等の新ビルド構成なし → 各 `.module.css` は CSS Modules 規約（class セレクタ + `[data-attr]` の組み合わせ）で書かれており、`styled-components` / `emotion` / `vanilla-extract` 等のランタイムを `package.json` に追加していない（git status で `package.json` 不変）。**充足**
9. レンダリングとアクセシビリティの最小テストが Vitest + Testing Library で存在 → 各 `__tests__/*.test.tsx` を読み、Button 15 / Input 13 / Textarea 9 の計 37 テストを `npx vitest run` で実機実行 → 全 pass（Duration 1.83s）。テスト内容はレンダリング / variant / size / 状態 / aria-\* / インタラクションを網羅。`__tests__/` ディレクトリ配置・`<filename>.test.tsx` 命名いずれも `.claude/rules/testing.md` 規約に整合。**充足**

#### 観点 A〜H の評価

- A（受け入れ基準）: 9 項目すべて充足（上記）
- B（philosophy.md NEVER 節との整合）:
  - グラデーション / glassmorphism / 3D シェイプ・オーブ → 各 CSS で `linear-gradient` / `backdrop-filter` / `radial-gradient` の使用 0 件
  - 装飾絵文字 → grep で 0 件（テスト文字列・JSDoc・CSS いずれも）
  - 複数アクセント色の同時使用 → 各部品は単一アクセント（`--accent`）+ 状態色（`--danger`）のみ。同時使用なし
  - hover 透明度・scale 変化 → `opacity` / `transform: scale` の hover 時変化 0 件。`opacity: 0.45` は `:disabled` 限定で、hover ではない（philosophy NEVER は「hover 前後」を対象とするため整合）
  - hover で border 色を変える → ghost / danger の hover で border 色は不変。primary は border 色も bg と同じ値に追従するが、border-color は bg-color と完全同期しており視覚的に独立した「border 色変化」として知覚されない（NEVER 節が想定する装飾的な border 色フラッシュではない）
  - `rounded-2xl + shadow-lg + グラデテキスト` の組み合わせ → 各 CSS は `--r-interactive: 8px` の控えめな角丸のみで、shadow も `--elev-button` のみ・グラデテキスト 0 件
  - ダイアログ等への影 → Button のみ `box-shadow: var(--elev-button)`。これは globals.css L247 で「ボタン通常時のみ」と明示された専用変数で、ダイアログ・カードへの影とは規約上区別されている。Input / Textarea には影なし
  - bounce / spring / 大きな移動 → アニメーションは Spinner の `linear` rotation のみ。CSS transition は `--ease` (cubic-bezier(0.2, 0.6, 0.2, 1)) で over-shoot しない曲線
  - 「あなた・私たち」主語 / 訴求文 / ようこそバナー → JSDoc 全文を grep し 0 件。テスト文字列も「送信」「名前」「本文」など道具的・無人称
  - ヘッダー固定 → T-3 スコープ外（T-4 領域）だが、本部品にも `position: fixed` 0 件で問題なし
- C（アクセシビリティと UX）:
  - フォーカスリング: 受け入れ基準 7 で確認済み、philosophy 規約と完全一致
  - キーボード操作: HTML ネイティブ要素（button / input / textarea）の Tab / Enter / Space 挙動を継承。独自 onKeyDown で潰していない
  - aria-\* 属性: Button は loading 時 `aria-busy="true"`（L105）。Input / Textarea は error 時 `aria-invalid="true"` + `aria-describedby` で error/hint と結びつき（L137-138 / L117-118）、エラーメッセージ要素には `role="alert"` 付与（Input L147 / Textarea L127）でスクリーンリーダーに即時通知
  - disabled / loading / readonly / error: 視覚（opacity 0.45、bg-soft、border-color: var(--danger)）と支援技術（disabled 属性、aria-busy、aria-invalid、role="alert"）の両方に伝達
  - ラベル関連付け: Input / Textarea は `htmlFor={inputId}` と `id={inputId}` の対応 + `useId` による衝突回避。`hideLabel` 時は visually-hidden（clip rect / position absolute / 1px size）でスクリーンリーダーには読まれる正攻法
  - WCAG 2.5.5（タップターゲット 44px）: Button md / Input md / Input lg・Textarea で 44px 以上を確保。Input sm のみ 36px だが CSS コメント L98-99 で「sm でも十分な高さ」と説明あり（規約上は 24×24px の最小目標を満たす範囲）
- D（型穴と API 設計）:
  - variant / size の string 開放なし（受け入れ基準 4）
  - props 数: Button 11 / Input 19 / Textarea 16。Input は HTMLInputElement 系の常用属性をほぼ網羅しているが、いずれも実際のフォームで使う最小集合（autoComplete・required・readOnly・maxLength 等）に閉じており、Rule of Three の精神を逸脱した過剰拡張ではない
  - 既存 `src/components/common/` との一貫性: 既存 Header / Footer は CSS Modules + 関数コンポーネント + default export という構造を持ち、T-3 部品も同構造で統一
  - 「いつ使う/避ける」が JSDoc から判定可能: Button L4-11 / Input L4-12 / Textarea L4-11 で具体的な代替コンポーネント名（Link、Textarea、Select、Checkbox、専用エディタ）まで含めて誘導しており、次サイクルの builder/reviewer が JSDoc を読めば判断できる
- E（CSS の品質）:
  - 新変数以外の値（マジックナンバー）混入: 受け入れ基準 5 で確認、min-height のタップターゲット 4 値と Spinner アニメーション固定値のみで合理的範囲
  - 既存 `--color-*` 参照: grep で 0 件（受け入れ基準 5）
  - CSS Modules の class 命名: `.button` / `.input` / `.wrapper` / `.label` / `.labelHidden` / `.required` / `.hintText` / `.errorText` / `.spinner` / `.inputError` / `.textareaError` / `.labelHidden`。Modules によりハッシュ付き class 名となるためグローバル衝突リスクなし
  - 不要なネスト・冗長記述: BEM 風の長大な class 名や深いセレクタネストは無く、`[data-variant]` / `[data-size]` / `:disabled` / `:focus-visible` の属性・状態セレクタで簡潔に分岐
- F（テストの品質）:
  - レンダリング + アクセシビリティの最小テスト存在（受け入れ基準 9）
  - `__tests__/` 配下配置・`<filename>.test.tsx` 命名（受け入れ基準 9）
  - 37 件は妥当範囲。Button 15 件は variant 3 × size 3 + 状態 + インタラクションの組み合わせで膨らむが過剰ではなく、Input 13 件 / Textarea 9 件は構造類似のうち Textarea がより薄い（type 不要のため）という妥当な配分
- G（T-4 との衝突）:
  - 作成ファイルが操作可能要素のみ → `find src/components/design-system -newer ...` ではなく報告された Button / Input / Textarea のみで判定。SiteHeader / SiteFooter / Panel / ArticleArea / SectionHead は T-4 由来として除外
  - ヘッダー・フッター・パネル・記事エリアへの踏み込みなし
- H（副作用と全体への影響）:
  - frontmatter / philosophy.md / SKILL.md / globals.css 不変 → `git status` および `git diff HEAD` で確認、いずれも変更なし
  - 既存 `src/components/common/Header.tsx` `Footer.tsx` 不変 → `git diff HEAD -- src/components/common/` 出力 0 行
  - lint: `npx eslint src/components/design-system/{Button,Input,Textarea}.tsx __tests__/{Button,Input,Textarea}.test.tsx` 出力なし（pass）
  - 型チェック: `npx tsc --noEmit` 出力なし（pass）
  - テスト: `npx vitest run` で 3 ファイル 37 件すべて pass（1.83s）

#### Blocker / Major / Minor の指摘

なし（Blocker 0 / Major 0 / Minor 0）。

#### 良かった点

- ファイル冒頭俯瞰 JSDoc に「使わない場面」と **代替コンポーネント名（Link / Textarea / Select / Checkbox / 専用エディタ）への誘導**を明記している点は、案 Y の前提（`components.md` を作らない）が成立する条件を builder が深く汲み取った実装。次サイクルの builder/reviewer がコンポーネント選択に迷ったとき、当該ファイル単体の JSDoc を読むだけで他選択肢への誘導が機能する
- Button.tsx L98 `const isDisabled = disabled || loading;` で disabled と loading を統一的に扱い、L110 で `onClick={isDisabled ? undefined : onClick}` と二重防御している。HTML の `disabled` 属性だけでも click は止まるが、handler を切り離す書き方は将来 `<a role="button">` 等に書き換えられた場合の保険として機能
- Button.tsx L104 で `type` のデフォルトが `"button"` になっており、フォーム内に置かれたとき誤って submit する事故を防いでいる。JSDoc L47 にも理由が明記。これは React のお決まり落とし穴を builder が把握している証拠
- Input / Textarea が `useId` で id 衝突を回避し、`aria-describedby` で error / hint を SR に届け、error 時に `role="alert"` で即時通知する三段構えのアクセシビリティ設計は、philosophy NEVER 節「loading / error / empty 状態を省略する」への正面回答として完成度が高い
- Button の primary hover が `--bg-invert: #1a1a1a` → `--bg-invert-soft: #555555` という明度差のみの遷移で、philosophy「明度差のみで表現」（L70）と globals.css の変数命名意図（`-soft` サフィックス＝「hover」用途）に完全合致している
- WCAG 2.5.5 タップターゲット 44px をコメント付きで CSS に明示（Button.module.css L106-107、Input.module.css L98-99）。アクセシビリティ規格の根拠を CSS コメントに残す姿勢が、サブエージェント E1 / E2（実装パターンを持ち帰るエンジニア）への学習素材としても機能

#### 検討点（Blocker / Major / Minor のいずれにも該当しないが記録する観察事項）

- Button.module.css L138-140 の `.labelHidden` は `visibility: hidden; position: absolute;` で実装されている。`<button>` は position: static のため、絶対配置された label span は最近接の positioned ancestor を基準に配置される性質を持つ。実用上 `visibility: hidden` で見えないため事故にはならないが、より堅牢にするなら button に `position: relative` を加えるか、label を visually-hidden 用の clip-rect 方式（Input/Textarea で採用されている方式）に揃える選択肢もあった。**Minor 未満**として記録するに留める
- Button primary 変種では border-color と background-color が同値で連動するが、philosophy NEVER「border 色を hover で変える」の文字通りには触れる。視覚的には border が bg に溶け込んでいて装飾的ではないため違反として扱わないが、将来 ghost-on-dark のような変種を増やすときに「border 色を hover で変えない」を厳格に守れる構造かどうかは T-5（動作確認ページ）でビジュアル検証する価値がある

#### 判定の根拠

T-3 受け入れ基準 9 項目すべて完全充足。観点 A〜H すべて pass。philosophy.md NEVER 節 14 項目すべてに違反なし。lint・tsc・vitest 全 37 件すべて pass。既存 Header / Footer / globals.css / philosophy.md / SKILL.md への副作用 0 件。型穴（cycle-169 再発リスク）なし。Owner 例示の最小ライン「ボタン・入力欄」を Button + Input + Textarea という妥当な分解で実装し、案 Y の前提（型 + JSDoc が単一情報源）が成立する JSDoc 粒度を確保。Blocker 0 / Major 0 / Minor 0 のため **pass**。

PM への次ステップ提案: T-3 を完了として確定。T-4 が並行作業中のため T-4 のレビュー完了を待ったうえで T-5（動作確認ページとビルド検証）に進む。T-3 由来の繰り越し課題はなく、T-5 で本 3 部品を確認ページに配置するときに視覚検証で「Button primary hover の border 連動が違和感なく見えるか」を確認すれば十分。

### T-4 Rev1（2026-04-27）

対象: T-4 が新設した構造要素 5 部品 — `src/components/design-system/SiteHeader.tsx` + `.module.css` + `__tests__/SiteHeader.test.tsx`、`SiteFooter.tsx` + 同 + 同、`Panel.tsx` + 同 + 同、`SectionHead.tsx` + 同 + 同、`ArticleArea.tsx` + 同 + 同。およびロゴアセット移動（`docs/design-system-by-claude-design/assets/yolos-logo.svg` → `public/assets/yolos-logo.svg`、`yolos-mark.svg` → `public/assets/yolos-mark.svg`、いずれも `git mv`）。`git status` / `git diff HEAD` / `find src/components/design-system -type f` で T-3 と T-4 の成果物の境界を確認したうえで、上記 15 ファイル + ロゴ 2 件を独立対象として評価した。

判定: **needs_revision**

#### 受け入れ基準項目別の独立検証（plan L80-88）

1. 配置先 `src/components/design-system/` であること → 5 部品すべてが同ディレクトリ直下、テストは `__tests__/` 配下。**充足**
2. 既存 `src/components/common/Header.tsx` `Footer.tsx` と並行作成、既存ファイル不変 → `git diff HEAD -- src/components/common/` 出力 0 行で完全不変。新版は `SiteHeader.tsx` `SiteFooter.tsx` という別名で衝突なし。**充足**
3. 新版ヘッダー・フッター冒頭に「現在の本番実装は別ファイル、本ファイルは次サイクルでの差し替え候補」コメント → `SiteHeader.tsx` L18-22 / `SiteFooter.tsx` L19-23 のいずれも「## 2 系統併存に関する注記」節で「現在の本番実装は `src/components/common/Header.tsx` にあります」「次サイクルで差し替え候補」「それまでは接続しないでください」を明記。**充足**
4. 公開 API が TypeScript の型と JSDoc によって自己説明的 → 各 props インターフェース（`SiteHeaderProps` / `SiteFooterProps` / `PanelProps` / `SectionHeadProps` / `ArticleAreaProps`）は型リテラル + 各 props に JSDoc。`PanelVariant` は `"default" | "flush" | "inset"` で型リテラル閉じ。`SectionHead` の `level` も `2 | 3 | 4` でリテラル閉じ。**充足**
5. ファイル冒頭または default export の型／関数定義に、コンポーネント全体の用途・使う場面・使わない場面が JSDoc で書かれていること → 全 5 部品のファイル冒頭に「## 用途」「## 使う場面」「## 使わない場面」が揃って記載されている。`Panel.tsx` L13-17 は「shadow-lg を使いたい場面には使わない（philosophy.md NEVER 直引用）」、`SiteHeader.tsx` L13-16 は「sticky / fixed が必要な場面には使わない」と philosophy.md への参照まで含む。`ArticleArea.tsx` L17-21 は「複数の ArticleArea を入れ子にしない」「Panel の内側に ArticleArea をネストしない」と他コンポーネントとの組み合わせ時の判断まで誘導しており、案 Y で `components.md` を作らない前提が成立する粒度。**充足**
6. ナビ項目・リンク先のような可変データは props で受ける → `SiteHeader` は `navLinks: NavLink[]`、`SiteFooter` は `linkGroups: FooterLinkGroup[]` + `disclaimer?: string`、`ArticleArea` は `steps?: string[]` + `related?: RelatedItem[]` といずれも props 経由で受ける構造。コンポーネント内でハードコードされたナビ項目・URL なし。**充足**
7. スタイルが新 CSS 変数のみ参照、`--color-*` 不参照 → `grep -n "var(--color-" SiteHeader.module.css SiteFooter.module.css Panel.module.css SectionHead.module.css ArticleArea.module.css` で 0 件（コメント中の `--color-*` 言及は「使わない」明示のみ）。各 CSS で参照される変数（`--bg`, `--bg-soft`, `--border`, `--fg`, `--fg-soft`, `--fg-softer`, `--sp-1〜7`, `--r-normal`, `--fs-12〜18`, `--lh-tight/snug/base`, `--tracking-tight/wide`, `--font-sans`, `--t-fast`, `--ease`）はすべて globals.css L123-258 に実在。マジックナンバー混入は `max-width: 1280px`（SiteHeader / SiteFooter のレイアウト最大幅）と `max-width: 960px / 640px`（ArticleArea / howTo セクション）と `min-width: 120px`（FooterGroup）と `minmax(200px, 1fr)`（relatedList）の 5 箇所。`--max-width: 960px` は globals.css L28 で定義済みのため `ArticleArea` の `max-width: 960px` は変数化可能だったが、SiteHeader / SiteFooter の 1280px と FooterGroup の 120px と relatedList の 200px は新変数として定義されていないため CSS 値直書きが避けられない。**Minor 観察事項として記録するが受け入れ基準は充足**
8. ロゴアセットが取り込みマップで確定した恒久配置先に `git mv` で移されていること → `git status` で `renamed: docs/design-system-by-claude-design/assets/yolos-logo.svg -> public/assets/yolos-logo.svg`、同 `yolos-mark.svg` の 2 件が確認できる。移動先は `tmp/cycle-170-asset-migration-map.md` L43-44 の確定移行先（`public/assets/yolos-logo.svg` / `public/assets/yolos-mark.svg`）と完全一致。`git mv` を使っているため履歴を辿れる。実サイトへの読み込み配線は本サイクル対象外であることが `grep -rn "yolos-logo\|yolos-mark" src/` 0 件で確認できる。**充足**
9. 各コンポーネントにレンダリングとアクセシビリティの最小テストが存在 → 5 部品それぞれに `__tests__/*.test.tsx` が存在。Vitest run で SiteHeader 9 / SiteFooter 8 / Panel 8 / SectionHead 6 / ArticleArea 11 の計 42 件すべて pass。`__tests__/` 配置・`<filename>.test.tsx` 命名は `.claude/rules/testing.md` 規約に整合。**充足**

#### 観点 A〜I の評価

- A（受け入れ基準）: 9 項目すべて充足（上記）
- B（philosophy.md NEVER 節との整合）:
  - ヘッダー固定 → SiteHeader.module.css L11-12 のコメントで「position は static のまま — ヘッダー固定禁止」を明示、`grep -n "position:\s*\(fixed\|sticky\)" *.module.css` 0 件
  - フッターは細い罫線一本＋小さなテキストのみ → SiteFooter.module.css L9-12 で `border-top: 1px solid var(--border)` のみ。背景は `--bg`、影なし。フッタテキストは `--fs-12` / `--fs-13` で確かに小さい
  - 中央寄せヒーロー＋3 カラム＋価格テーブル → 該当する装飾要素なし。ArticleArea は H1 + 本文 + 使い方 + 関連という用途明確な構造で SaaS LP テンプレでない
  - ようこそバナー / 訴求文 / 「あなた・私たち」主語 → 各 .tsx / .module.css / .test.tsx に対し `grep -n "あなた\|私たち\|ようこそ"` 0 件。default disclaimer は「このサイトはAIによる実験的プロジェクトです」と無人称で constitution rule 3（AI 運営の通知）と整合
  - ダイアログ等への影 → Panel.module.css L15「shadow は使わない」と明示、`grep -n "box-shadow" *.module.css` 0 件（T-4 5 ファイル中）
  - glassmorphism / グラデーション / 3D シェイプ → `backdrop-filter` / `gradient` / `radial-gradient` 0 件
  - 装飾絵文字 → 0 件
  - 複数アクセント色の同時使用 → 構造要素群はそもそも `--accent` を一切使わず `--bg` / `--border` / `--fg` 系のみ。アクセント不在で違反不可能
  - bounce / spring / 大きな移動 → CSS transition は `color var(--t-fast) var(--ease)` のみ。`--ease: cubic-bezier(0.2, 0.6, 0.2, 1)` で over-shoot しない
  - hover で透明度・scale 変化 → 0 件。SiteHeader L36-38 のコメントで「明度差のみ — border 色変更・scale・opacity は使わない」と builder が philosophy 規約を意識している痕跡あり
  - **充足**
- C（ロゴアセット移動の妥当性）:
  - 取り込みマップ #4 / #5 と移動先一致（受け入れ基準 8）
  - `git mv` が使われ履歴が辿れる（受け入れ基準 8）
  - 既存 `public/` 配下は `ads.txt` / `search-index.json` のみ非画像で混在、`public/assets/` サブディレクトリ新設は `tmp/cycle-170-asset-migration-map.md` 前文 L19-32 の判断と整合
  - 実サイトへの読み込み配線は本サイクル対象外（`grep -rn "yolos-logo\|yolos-mark" src/` 0 件）
  - **充足**
- D（アクセシビリティと UX）:
  - SiteHeader: `<header role="banner">` + `<nav aria-label="メインナビゲーション">` + `<ul role="list">`（list-style: none で Safari がリスト role を剥がす対策）。`<a>` タグで実装、フォーカスリング → SiteHeader.module.css に `:focus-visible` 定義なし。**Major 1 として後述**
  - SiteFooter: `<footer role="contentinfo">` + `<nav aria-label="フッターナビゲーション">` + `<ul role="list">`。`<a>` タグ実装、フォーカスリング → SiteFooter.module.css にも `:focus-visible` 定義なし。**Major 1 として後述**
  - Panel: `as` プロップで `div` / `section` / `article` を選べる。`role` / `aria-*` は HTMLAttributes でパススルー
  - SectionHead: `<h2>` / `<h3>` / `<h4>` を `level` プロップで指定。meta は `<span aria-label={`補足情報: ${meta}`}>` で SR にも補足が伝わる
  - ArticleArea: `<article>` ランドマーク。`<section aria-labelledby="how-to-heading">` と `<section aria-labelledby="related-heading">` で見出しに紐付けるが、**SectionHead が `id` 属性を出力しないため aria-labelledby の参照先が存在しない**。**Blocker 1 として後述**
- E（型穴と API 設計）:
  - variant が string 型に開放されていない（`PanelVariant`、`SectionHead.level` ともリテラル閉じ）
  - props 数: SiteHeader 2 / SiteFooter 2 / Panel 4 / SectionHead 3 / ArticleArea 5 でいずれも最小限
  - 既存 `src/components/common/Header.tsx` `Footer.tsx` との一貫性: CSS Modules + 関数コンポーネント + default export という構造で揃っている
  - 「いつ使う / 避ける」が JSDoc から判定可能（受け入れ基準 5）
- F（CSS の品質）:
  - 新変数のみ参照、`--color-*` 不参照（受け入れ基準 7）
  - ヘッダー `position: sticky / fixed` 不在
  - Panel に `box-shadow` 不在
  - マジックナンバー: `max-width: 1280px` × 2 / `max-width: 960px` × 1 / `max-width: 640px` × 1 / `min-width: 120px` × 1 / `minmax(200px, 1fr)` × 1。`--max-width: 960px` は globals.css L28 に定義済みのため `ArticleArea.module.css` L9 は `var(--max-width)` を使うべきだった。**Minor 1 として後述**
- G（テストの品質）:
  - レンダリング + アクセシビリティの最小テスト存在（受け入れ基準 9）
  - 42 件すべて pass。SiteHeader の「header is not position fixed or sticky」テスト（L49-54）は `data-fixed` 属性の不在を確認するという回りくどい実装で、実際には CSS の `position` を JSDOM が解決しないため意味が薄い。**Minor 2 として後述**
- H（T-3 との衝突）:
  - 作成ファイルが構造要素のみ → SiteHeader / SiteFooter / Panel / SectionHead / ArticleArea のみで、ボタン・入力欄に踏み込んでいない
  - 同名ファイルの T-3 / T-4 重複なし（`find src/components/design-system -type f | sort` で確認）
- I（副作用と全体への影響）:
  - frontmatter / philosophy.md / SKILL.md / globals.css 不変 → `git diff HEAD -- src/app/globals.css .claude/skills/` 出力 0 行
  - 既存 `src/components/common/Header.tsx` `Footer.tsx` 不変
  - 既存 `var(--color-*)` 参照は不変（T-4 で globals.css 自体を触っていない）
  - lint: `npm run lint` pass
  - format: `npm run format:check` pass
  - test: `npm run test` 全 4083 件 pass
  - build: `npm run build` 成功（Failed to load dynamic font は OG image の既存課題で T-4 と無関係）

#### Blocker / Major / Minor の指摘

**Blocker 1（観点 D — ArticleArea の `aria-labelledby` 参照先が存在しない）**:
`ArticleArea.tsx` L99 `<section className={styles.howTo} aria-labelledby="how-to-heading">` および L116 `<section className={styles.related} aria-labelledby="related-heading">` は、対応する `id="how-to-heading"` / `id="related-heading"` を持つ要素を一切出力していない。`SectionHead.tsx` L48-49 は `<Tag className={styles.title}>{title}</Tag>` で h2/h3/h4 を出力するが `id` 属性は付与されない。結果として、スクリーンリーダーが `<section>` の名前を解決しようとして空文字列を得て、ランドマークとして適切に名付けられない。さらに、同一ページに複数の ArticleArea が描画された場合（一覧ページなど）、固定文字列 ID `how-to-heading` / `related-heading` が重複し HTML 仕様違反となる。philosophy.md NEVER 節「loading / error / empty 状態を省略する → yolos.net のツールはこの 3 状態を必ず実装する」と並ぶ完成度欠落シグナルであり、cycle-169 の失敗（型穴・装飾過多）と同質の「動くがアクセシブルでない実装」になる。

修正方向: (a) `SectionHead` に `id?: string` props を追加し、`<Tag>` に出力する。`ArticleArea` は `useId()` で一意な ID を生成して SectionHead に渡し、同じ ID を `<section aria-labelledby={...}>` に設定する。または (b) `aria-labelledby` を削除し、`<section>` に `aria-label="使い方"` / `aria-label="関連"` を直接記述する。(a) が SR 体験として優れる（読み上げが見出しテキストと完全同期）が、(b) でも違反は解消する。Blocker 扱いの理由: 現状でアクセシビリティが破綻しており、テストも `<section>` 自体ではなく内部の `<heading>` を見ているため検出されていない。次サイクルの T-5 で実装ページを作って初めて気付く性質の問題で、本サイクルで修正する方が傷が浅い。

**Major 1（観点 D — `<a>` リンクのフォーカスリングが定義されていない）**:
`SiteHeader.module.css` の `.brand` / `.navLink` および `SiteFooter.module.css` の `.link` / `ArticleArea.module.css` の `.relatedLink` のいずれも `:focus-visible` 状態のスタイル指定がない。ブラウザデフォルトのフォーカスリングが効くため最低限のキーボード操作は可能だが、philosophy.md L70「明度差のみで表現する」を踏襲し、`outline: 2px solid var(--accent); outline-offset: 2px;` のような明示的な focus ring を T-3 の Button / Input / Textarea と同様に揃えるのが design-system としての一貫性。T-3 部品との非対称（操作要素はカスタムフォーカスリング、リンクはブラウザデフォルト）が次サイクル以降に「リンクだけ視覚的に違う」混乱を生む。

修正方向: 各 `.module.css` の `.brand` / `.navLink` / `.link` / `.relatedLink` に `&:focus-visible` ブロックを追加し、Button と同等の `outline: 2px solid var(--accent); outline-offset: 2px;` を設定する。Major 扱いの理由: アクセシビリティ違反ではない（ブラウザデフォルトが効く）が、design-system の一貫性が損なわれており、次サイクルで「リンクだけフォーカスが薄い」と気付かれて手戻りになる。

**Minor 1（観点 F — `--max-width` 変数があるのに ArticleArea で使っていない）**:
`globals.css` L28 で `--max-width: 960px;` が定義されているが、`ArticleArea.module.css` L9 は `max-width: 960px;` と直書きしている。同じ値を 2 箇所で別々に管理する状態で、将来 `--max-width` を変えたときに ArticleArea が追従しない。

修正方向: `ArticleArea.module.css` L9 を `max-width: var(--max-width);` に変える。1 行修正。

**Minor 2（観点 G — SiteHeader の position:fixed テストが空虚）**:
`SiteHeader.test.tsx` L49-54 は `data-fixed` 属性の不在を確認するが、コードには `data-fixed` 属性を出力する箇所がそもそもない。テストとして「常に pass する空テスト」になっており、philosophy.md NEVER「ヘッダーを固定する」を実際には検証していない。

修正方向: (a) このテストを削除する（CSS の position は JSDOM では検証できないため、テストで強制するのは無理筋）。または (b) `getComputedStyle(header).position !== "fixed"` のようにブラウザ環境（Playwright）で検証する。本サイクルでは T-5 の Playwright スクショで視覚確認するため、(a) の削除が妥当。

**Minor 3（観点 D — SiteHeader / SiteFooter の `role="banner"` `role="contentinfo"` は冗長）**:
HTML5 の `<header>` 要素は body 直下では暗黙的に `banner` ランドマークを持ち、`<footer>` 要素は body 直下では暗黙的に `contentinfo` を持つ。逆に、これらが `<article>` / `<aside>` / `<main>` / `<nav>` / `<section>` の子孫になるとランドマーク役を失う。明示的な `role="banner"` / `role="contentinfo"` は body 直下で使うときは冗長だが害はなく、別ランドマークの子孫で使うと「ランドマーク内ランドマーク」になり SR ユーザーの混乱を招く。design-system 部品としては「ルートレイアウトでのみ使う」という JSDoc 制約と整合させるため、明示 role を削除するのが安全側。

修正方向: SiteHeader L59 から `role="banner"`、SiteFooter L69 から `role="contentinfo"` を削除する。JSDoc に「アプリのルートレイアウトで 1 度だけレンダリングする」と既に書かれているため、削除しても意図は伝わる。Minor 扱いの理由: 現状の本番実装が body 直下使用を想定しているため実害がない。

#### 良かった点

- philosophy.md NEVER 節への参照が CSS コメントと TSX JSDoc の両方に書かれている（`SiteHeader.module.css` L3「ヘッダーは fixed / sticky にしない」、`Panel.module.css` L3「ダイアログ・ポップオーバー・カードに影を使う禁止」、`SiteFooter.module.css` L3「フッターは細い罫線一本＋小さなテキストのみ」など）。philosophy.md と実装の対応関係が CSS コメントから直接辿れる構造で、案 Y の「型 + JSDoc が単一情報源」を CSS コメントレイヤーでも補強している
- `Panel` の `as` props で `div` / `section` / `article` を選べる polymorphic 設計は、ArticleArea 内で `Panel` を `as="article"` として使うことを想定したときに HTMLランドマークとセマンティクスが衝突しないよう柔軟性を持たせている
- ロゴ移動が `git mv` で実行され `git status` で `renamed:` と表示される。コピー削除ではなく rename として履歴が辿れることで、次サイクルで「素地から `public/assets/` に移った」経緯を `git log --follow` で復元可能
- `SiteFooter` の default disclaimer が constitution rule 3「AI 運営の通知」と整合する文面で、props 省略時にも constitution 違反が発生しない安全側のデフォルト
- `ArticleArea` のスロット設計（children: 必須 / title / meta / steps / related: いずれもオプション）は、ToolHero / HowTo / RelatedTools の素地パターンを汎用化しつつ、ツールページでも記事ページでも使える柔軟性を確保。`steps` が空配列のとき非表示にする条件分岐（`steps && steps.length > 0`）も正しい
- 5 部品いずれもファイル冒頭に「## 用途 / ## 使う場面 / ## 使わない場面」を統一書式で書いている。書式が揃っていることで次サイクルの builder/reviewer が「どのコンポーネントを選ぶべきか」をスキャンするとき認知負荷が低い

#### 検討点（Blocker / Major / Minor のいずれにも該当しないが記録する観察事項）

- `SiteHeader.module.css` の `max-width: 1280px` と `SiteFooter.module.css` の `max-width: 1280px` は重複しており、将来 globals.css に `--max-width-chrome: 1280px` のような変数を追加する余地がある。本サイクルでは新変数追加は避けるべきだが、次サイクル以降のキャリーオーバー候補として記録
- `SectionHead.tsx` L51-58 の `<span aria-label={`補足情報: ${meta}`}>` で aria-label により meta を SR 用に書き直しているが、span の中身 `{meta}` も SR に読まれるため二重読み上げになる可能性がある。aria-label を削除しても支障ないが、本サイクルでは観察事項に留める

#### 判定の根拠

T-4 受け入れ基準 9 項目すべて完全充足し、観点 A〜I のうち A / B / C / E / F / G / H / I は pass。ただし観点 D（アクセシビリティと UX）で Blocker 1 件（ArticleArea の aria-labelledby 参照先不在）と Major 1 件（リンクのフォーカスリング不在）を検出。判定基準（Blocker / Major / Minor のいずれかが 1 件でもあれば needs_revision）に照らし、Blocker 1 / Major 1 / Minor 3 のため **needs_revision**。

PM への次ステップ提案: builder に修正を委任する。修正範囲は (a) `SectionHead` への `id?: string` props 追加と `ArticleArea` での `useId` による ID 生成、(b) リンク 4 種への `:focus-visible` 規約追加、(c) `ArticleArea` の `max-width: 960px` を `var(--max-width)` に置換、(d) SiteHeader の空虚な position:fixed テスト削除、(e) `role="banner"` / `role="contentinfo"` の削除（任意だが安全側）。修正後に再度 T-4 全体（受け入れ基準 9 項目 + 観点 A〜I + philosophy.md NEVER 節 + 副作用）を見直してレビュー依頼すること。

### T-4 Rev2（2026-04-27）

対象: T-4 Rev1 で検出した Blocker 1 / Major 1 / Minor 3 の修正と、サイクル実行規約に従った T-4 全体の見直し。`git status` / `git diff HEAD` で本 Rev での修正範囲を把握したうえで、ArticleArea / SectionHead / SiteHeader / SiteFooter の .tsx と .module.css と .test.tsx、および Panel / SectionHead 周辺ファイルを読み直して独立検証した。

判定: **pass**

#### Rev1 指摘事項の解消確認（独立検証）

**Blocker-1（ArticleArea の `aria-labelledby` 参照先不在）→ 解消**:

- `SectionHead.tsx` L34-40 に `id?: string` props を追加し、L57 で `<Tag id={id}>` として h2/h3/h4 に id 属性を出力する構造に変更。JSDoc L34-39 で「親の `<section aria-labelledby={id}>` と紐付けるために使う」「複数の SectionHead が同一ページに存在する場合は、必ず一意な値を渡すこと」と用途と注意事項を明示
- `ArticleArea.tsx` L30 で `import { useId } from "react"`、L87 で `const uid = useId()` を関数本体トップレベルで呼び出し、L88-89 で `${uid}-how-to` / `${uid}-related` を生成。L106 / L107 / L123 / L124 で同じ id を `<section aria-labelledby>` と `<SectionHead id>` の両方に渡している
- React の Hook Rules に違反していないか確認: `useId()` は条件分岐・ループ・アーリーリターンの後に呼ばれていない。コンポーネント関数の最上位で常に 1 回呼ばれる構造で、Hook Rules 完全準拠
- L86 の「同一ページに複数の ArticleArea が描画されても ID 重複が起きない（HTML 仕様準拠）」コメントが意図を明示しており、CLAUDE.md の「コーディング原則 4: 可読性を高く保つ」と整合
- 検証テスト 3 件追加: `ArticleArea.test.tsx` L74-83「steps section aria-labelledby references the section heading id」（heading id が存在し section の aria-labelledby と一致）、L91-99「related section aria-labelledby references the section heading id」、L101-114「multiple ArticleArea instances generate unique section IDs」（複数インスタンスの全 id が一意であることを Set で検証）。これらは Rev1 で「テストが内部 heading だけ見て section を見ていなかった」検出ギャップを直接埋める内容
- **完全解消**

**Major-1（リンクのフォーカスリング欠落）→ 解消**:

- `SiteHeader.module.css` L40-44 `.brand:focus-visible` / L68-71 `.navLink:focus-visible` に `outline: 2px solid var(--accent); outline-offset: 2px;` を追加
- `SiteFooter.module.css` L63-67 `.link:focus-visible` に同等規則
- `ArticleArea.module.css` L113-117 `.relatedLink:focus-visible` に同等規則
- T-3 の Button.module.css の `:focus-visible` 規則（`outline: 2px solid var(--accent); outline-offset: 2px;`）と完全一致しており、design-system 全体の一貫性が保たれている。Rev1 で指摘した「T-3 部品との非対称」が解消
- 各 CSS のコメントで「T-3 の Button / Input と同じ accent 2px outline で design-system 全体の一貫性を保つ」と意図が明示されており、次サイクルの builder/reviewer が「なぜこの値か」を辿れる構造
- philosophy.md L70「明度差のみで表現する」の対象は `hover` 状態であり、フォーカスリングはアクセシビリティ要件として別扱い（philosophy.md NEVER 節にも「フォーカスを消す」は禁止だがフォーカスリングを描く方法は規定なし）。`outline: var(--accent)` は accent 1 色のみの使用で「複数アクセントの同時使用」NEVER にも違反しない
- **完全解消**

**Minor-1（`--max-width` 変数未使用）→ 解消**:

- `ArticleArea.module.css` L9-10 が `/* globals.css L28 に定義済みの --max-width: 960px を参照する */` というコメント付きで `max-width: var(--max-width);` に変わった
- `globals.css` L28 の `--max-width: 960px;` は本サイクル T-4 では変更されておらず、コメントの行番号参照は正確
- 同 `--max-width` は `src/blog/_components/BlogListView.module.css` / `src/app/page.module.css` / `src/app/about/page.module.css` 等、サイト全体で 10+ 箇所で「prose / 記事本文の最大幅」として使われており、ArticleArea がこの変数を使うのは意味的に正しい（ArticleArea も「記事・ツールページの本文エリア」が用途）。Rev1 で懸念した「prose 幅と異なる事故」は発生していない
- **完全解消**

**Minor-2（SiteHeader の空虚な position:fixed テスト）→ 解消**:

- `SiteHeader.test.tsx` L49-54 にあった「header is not position fixed or sticky (functional-quiet rule)」テストが削除された。差分前は 9 件、差分後は 8 件（vitest 実行で確認）
- 削除によって失われた検証は「`data-fixed` 属性の不在」のみで、これは元々コードに該当属性が存在しないため意味のないテストだった。philosophy.md NEVER「ヘッダーを固定する」の検証は次サイクル以降の Playwright 視覚検証で代替する設計（Rev1 の修正方向 (a) と一致）
- **完全解消**

**Minor-3（冗長な `role="banner"` / `role="contentinfo"`）→ 解消**:

- `SiteHeader.tsx` L59 から `role="banner"` 削除 → `<header className={styles.header}>` のみ
- `SiteFooter.tsx` L69 から `role="contentinfo"` 削除 → `<footer className={styles.footer}>` のみ
- HTML5 仕様で `<header>` は body 直下では暗黙的に banner ランドマーク、`<footer>` は body 直下では暗黙的に contentinfo ランドマークを持つ（`<article>` / `<aside>` / `<main>` / `<nav>` / `<section>` の子孫になると失う）。SiteHeader / SiteFooter の JSDoc L9-11 / L9-13 で「アプリのルートレイアウトで 1 度だけレンダリングする」と用途が明記されており、暗黙 role に任せる設計と整合
- **重要な再確認**: 別ランドマーク子孫に置かれた時の動作 — 削除後は暗黙 role が使えるコンテキスト（body 直下）でのみ動作する。逆に言えば、JSDoc の用途指示に反して `<main>` 内などに置かれた場合は banner / contentinfo ランドマークが消失する。これは「使い方を間違えるとアクセシビリティが落ちる」性質だが、JSDoc で「1 度だけ」「ルートレイアウトで」と明示されているため、用法どおりであれば問題なし。Rev1 で示した「暗黙 role に任せる安全側」の意図と完全一致
- 既存テスト `SiteHeader.test.tsx` L13-16「renders header landmark」と `SiteFooter.test.tsx` L18-21「renders contentinfo landmark」が pass し続けるのは、jsdom が `<header>`（テストの最上位 fragment 直下、つまり実質 body 直下）に banner ランドマークを暗黙付与するため。テストの内容は同じで実装が変わっただけで意味が保たれている
- **完全解消**

#### 観点 A〜I の差分再評価

- A（受け入れ基準）: Rev1 で 9 項目すべて充足。Rev2 修正で項目が崩れた箇所なし（特に基準 7「`--color-*` 不参照」は `grep -n "var(--color-" src/components/design-system/*.module.css` で 0 件、基準 9「最小テスト存在」は計 8 部品で計 81 テスト pass）。**充足を維持**
- B（philosophy.md NEVER 節との整合）: Rev1 ですべて違反なし。Rev2 で追加された `:focus-visible` 規則は philosophy.md NEVER 節の対象外（hover ではなく focus 時の話、accent 1 色のみで複数アクセント問題なし）。`grep -n "あなた\|私たち\|ようこそ\|gradient\|backdrop-filter\|Inter\|Roboto" src/components/design-system/` 0 件で再確認。`box-shadow` は Panel / SiteHeader / SiteFooter / SectionHead / ArticleArea いずれにも 0 件（grep 確認）。`position: sticky / fixed` は CSS に 0 件。**充足を維持**
- C（ロゴアセット移動の妥当性）: Rev1 で完全充足。本 Rev で再変更なし。`git status` で `R  docs/design-system-by-claude-design/assets/yolos-logo.svg -> public/assets/yolos-logo.svg` 等の rename が維持されている。**充足を維持**
- D（アクセシビリティと UX）:
  - SiteHeader / SiteFooter の暗黙 role への移行（Minor-3 解消）でランドマーク認識は body 直下用法で正常動作
  - リンク 4 種にフォーカスリング追加（Major-1 解消）で T-3 部品との一貫性が確保された
  - ArticleArea の section が aria-labelledby で正しく見出しを参照する構造になった（Blocker-1 解消）
  - SectionHead の `id?` は HTML 標準属性として h2/h3/h4 に伝わる素直な実装で、id 衝突回避は親（ArticleArea）の責務として明示された設計
  - Rev1 で言及した検討点（SectionHead の `<span aria-label>` 二重読み上げ可能性）は本 Rev でも未対応だが、Rev1 で「観察事項に留める」と判断済み。Blocker / Major / Minor のいずれにも該当せず再判定不要
  - **改善が複数進み、悪化なし**
- E（型穴と API 設計）:
  - Rev2 で追加された `id?: string` は SectionHead の props であり、リテラル型ではなく `string` 型だが、これは HTML 標準の id 属性が任意文字列を受ける性質上、リテラル型で閉じる対象ではない（特定値リストが意味を持たない）
  - ArticleArea の `useId` 戻り値（string）を id に渡す経路で型エラーなく接続されている（`npm run build` pass で TypeScript 型検査も pass）
  - Rev1 で確認した「variant が string 開放されていない」「props が無闇に多くない」は維持
  - **充足を維持**
- F（CSS の品質）:
  - `--color-*` 不参照を再確認（grep 0 件）
  - Rev2 で `var(--max-width)` 化により ArticleArea のマジックナンバーが 1 件減少（960px が変数化）。残るマジックナンバーは SiteHeader / SiteFooter の `1280px`、ArticleArea の `640px`（howTo 幅）、SiteFooter の `120px`（group min-width）、ArticleArea の `200px`（relatedList minmax）。これらは Rev1 で記録済みの観察事項
  - 新規 `:focus-visible` 規則は `var(--accent)` のみ参照で新変数体系に準拠
  - **改善が 1 件進み、悪化なし**
- G（テストの品質）:
  - SiteHeader 9 → 8（Minor-2 で空虚なテスト削除、減数は妥当）
  - ArticleArea 11 → 14（Blocker-1 検証用に 3 件追加、増数は妥当）
  - 新テストの内容: aria-labelledby と heading id の対応関係（DOM 検査）、複数インスタンスでの id 一意性（Set 検証）。Rev1 で検出ギャップだった「`<section>` 自体ではなく内部 heading だけ見ていた」を直接埋める内容
  - SectionHead の `id` props 単独テストは未追加だが、実用上は ArticleArea の統合テストで pass し続ける id 伝播の確認で代替可能（厳密な単体テストの欠落だが、Blocker / Major / Minor 未満の検討点）
  - **改善が複数進み、悪化なし**
- H（T-3 との衝突）: Rev2 で T-3 のファイルへの変更なし、構造要素のみ変更。**充足を維持**
- I（副作用と全体への影響）:
  - frontmatter / philosophy.md / SKILL.md / globals.css 不変 → `git diff HEAD -- src/app/globals.css .claude/skills/` 出力 0 行
  - 既存 `src/components/common/Header.tsx` `Footer.tsx` 不変 → `git diff HEAD -- src/components/common/` 出力 0 行
  - lint: `npm run lint` pass
  - format: `npm run format:check` pass
  - test: `npm run test` 全 4085 件 pass（Rev1 時点 4083 → +3 ArticleArea 新規 -1 SiteHeader 削除 = +2）
  - build: `npm run build` 成功
  - **充足を維持**

#### Rev1 で見落としていた可能性の再点検

サイクル実行規約「再レビュー時は前回の指摘事項だけでなく全体を見直す」に従い、Rev1 で確認していなかった追加観点を再走査:

- **`useId()` の SSR 安全性**: `ArticleArea` は client component / server component の境界明示なし（`"use client"` ディレクティブなし）。Next.js App Router で server component として描画される場合、`useId()` は SSR 時にも安定した ID を返す（React 18+ 仕様）。サーバとクライアントで同じ id 文字列が出るため hydration mismatch は起きない。仕様通りの動作で問題なし
- **ArticleArea が `<article>` 要素であることと内部 `<section>` の関係**: `<article>` は landmark role を持つが、その内部の `<section aria-labelledby="…">` は `<section>` が名前を持つことで region landmark 化する。HTML 仕様では問題ないが、SR ユーザーがランドマーク一覧を移動する際に「article > region(使い方) / region(関連)」と多層化する。ツールページ用途では合理的な階層構造で、過剰なランドマーク化ではない
- **`aria-labelledby` で参照する id の文字列に `useId()` の戻り値を埋め込む安全性**: React 18 の `useId()` は `:r0:` のような特殊文字を含む文字列を返すが、CSS セレクタで使うわけではなく HTML id 属性として埋め込むだけのため問題なし（HTML5 では id 属性に空白以外の任意文字を許容）
- **Panel / SectionHead に focus-visible 規則が不要な確認**: Panel / SectionHead はリンク・ボタンを内部に含まない静的な構造部品で、Tab フォーカスを受け取る要素を持たない。focus-visible 規則の追加は不要
- **role="list" の SiteHeader / SiteFooter ul 残置の確認**: `list-style: none` を持つ `<ul>` は VoiceOver で「リスト」とアナウンスされない既知の挙動があり、`role="list"` を明示的に付与するのは適切な対症療法（参考: webkit bug）。本サイクルで除去する必要なし
- **キャリーオーバー候補の再確認**: Rev1 で記録した観察事項（`--max-width-chrome: 1280px` の追加検討、SectionHead の二重 SR 読み上げ可能性）は本 Rev で対応されていないが、Blocker / Major / Minor 未満であり次サイクル以降の検討事項として妥当

新規 Blocker / Major / Minor の検出は **なし**。

#### Blocker / Major / Minor の指摘

なし（Blocker 0 / Major 0 / Minor 0）。

#### 良かった点

- **Blocker-1 の修正アプローチが「`useId` + props 経由 id」の React/HTML 標準パターン**で実装されており、独自の uuid ライブラリや `Math.random()` を持ち込まずに React 18 の正規 API を使った点は、CLAUDE.md「コーディング原則 5: 型安全の徹底」と整合した最小依存の解決
- **修正の意図がコードコメントで残されている**: `ArticleArea.tsx` L86「同一ページに複数の ArticleArea が描画されても ID 重複が起きない（HTML 仕様準拠）」、`ArticleArea.module.css` L9「globals.css L28 に定義済みの --max-width: 960px を参照する」、各 `:focus-visible` ブロックの「T-3 の Button / Input と同じ accent 2px outline で design-system 全体の一貫性を保つ」コメントが、なぜこの値かを次サイクルの builder/reviewer に伝える構造になっている。CLAUDE.md「コーディング原則 4: 可読性を高く保つ — コメントでコードの『なぜ』を説明する」と完全整合
- **テストが Rev1 の検出ギャップを直接埋める内容になっている**: ArticleArea の新テスト 3 件は単に「id が出力される」を見るだけでなく、(1) section の aria-labelledby が heading id と一致する、(2) 複数インスタンスで id が一意、という Rev1 で「テストが見ていなかった」観点を狙い撃ちで検証している。再発防止として優れた設計
- **SectionHead の id props JSDoc に「複数の SectionHead が同一ページに存在する場合は、必ず一意な値を渡すこと」と注意書き**を入れた点は、API の利用者（次サイクルの builder）に対して落とし穴を事前に伝える設計。SKILL.md の `components.md` を作らない方針（採用案 Y）が成立する条件として、JSDoc が「使い方の落とし穴」まで含む粒度で書かれていることが望ましく、その水準を満たしている
- **focus-visible の値が T-3 と完全に同じ `outline: 2px solid var(--accent); outline-offset: 2px;`** で揃えられた点は、design-system 全体の一貫性が「文字レベル」で実装されていることを示す。次サイクルで Button hover / Link focus を視覚比較したとき同じ「accent 1 色 2px」で揃って見えることが保証される

#### 検討点（Blocker / Major / Minor のいずれにも該当しないが記録する観察事項）

- SectionHead の `id?: string` props は ArticleArea 経由で統合テストされているが、SectionHead 単体では `id` props を直接検証するテストがない。実用上は ArticleArea のテストで pass し続ければ機能する性質だが、SectionHead が他のコンテキストで使われ始めたとき（次サイクル以降）に id 伝播が壊れても気付かない可能性がある。次サイクル以降に SectionHead の用途が広がったら単体テストを追加するキャリーオーバー候補
- Rev1 で記録した「`max-width: 1280px` の SiteHeader / SiteFooter 重複」「SectionHead の `<span aria-label>` 二重読み上げ可能性」は本 Rev でも未対応で、次サイクル以降の検討事項として残る。本 Rev での再判定不要

#### 判定の根拠

Rev1 で指摘した Blocker 1 / Major 1 / Minor 3 のすべてが独立検証で完全解消を確認。修正による新規問題（`useId` Hook Rules / SSR 安全性 / 暗黙 role の挙動 / `var(--max-width)` の意味整合性）はいずれも問題なし。観点 A〜I すべてで Rev1 の状態を維持または改善し、悪化箇所なし。lint・format・test 4085 件・build すべて pass。既存ファイル不変、`--color-*` 参照ゼロ、philosophy.md NEVER 節違反ゼロ。Rev1 で見落としていた可能性の再点検でも新規 Blocker / Major / Minor の検出なし。Blocker 0 / Major 0 / Minor 0 のため **pass**。

PM への次ステップ提案: T-4 を完了として確定。T-3 / T-4 双方が pass となり、T-5（動作確認ページとビルド検証）に進める状態。T-5 の builder への補正情報として、本 Rev で確認した「`<header>` `<footer>` は body 直下用法でのみ暗黙 role が効く」「ArticleArea の section ランドマークは region として認識される」を伝えると、確認ページでのレイアウト判断（SiteHeader / SiteFooter を最上位に配置する等）が正確に行える。

### T-5 Rev1（2026-04-27）

対象: T-5（動作確認ページとビルド検証）の builder 成果物。`git status` / `git diff HEAD` で変更範囲を把握したうえで、`src/app/dev-preview/`（page.tsx / layout.tsx / DevComponents.tsx と各 .module.css と `__tests__/page.test.tsx`）、`src/app/_dev/__tests__/page.test.tsx`、`src/app/robots.ts`、`src/__tests__/bundle-budget.test.ts` の差分、ビルド成果物（`.next/server/app/dev-preview.html` / `.next/server/app/index.html` / `.next/server/app/robots.txt.body` / `.next/static/`）、Playwright スクショ（`tmp/screenshots/2026-04-27T02-48-09_*_dev-preview_*.jpg` 5 枚）を独立検証した。builder の自己評価は読まず、cycle-170.md の T-5 受け入れ基準（L91-102）と Owner 原則 1〜12 を直接照合した。

判定: **needs_revision**

#### plan からの builder 判断（独立評価）

plan T-5 L93 の「`src/app/_dev/` 配下の動作確認ページ」「`robots.ts` の disallow に `/_dev/` を含む」（L96）に対し、builder は **Next.js App Router 仕様で `_` 始まりフォルダはプライベートフォルダとしてルーティング除外される事実** を根拠に、ビルド対象ルートを `src/app/dev-preview/` に変更し、`_dev/` はテストファイル置き場として残置、robots.ts の disallow には `/_dev/` と `/dev-preview/` の両方を含める判断をした。

技術的根拠は妥当（Next.js 公式仕様に整合）。受け入れ基準の核（noindex 実機確認・スクショ取得）は `_` 始まりフォルダでは満たせないため、ルート名を変更しなければ達成不能だった。plan L102 の builder 判断範囲「フォント実読み込みの方法」「スクリーンショット取得の具体手順」を拡張的に解釈した位置づけだが、plan の趣旨（受け入れ基準達成が最重要、フォルダ名は手段）には整合する。**判断そのものは承認**。ただし `_dev/` を併存させた構造には Minor-1 のとおり改善余地あり。

#### 受け入れ基準項目別の独立検証（A.1 〜 A.7）

- **A.1 全 8 コンポーネント配置**: `DevComponents.tsx` を Read。Button / Input / Textarea / SiteHeader / SiteFooter / Panel / SectionHead / ArticleArea の 8 部品すべてに `import` と `<section className={styles.section}>` ブロックが存在し、各 variant・size・状態（disabled / loading / error / readOnly 等）が網羅的に配置されている。スクショ 4 枚で全部品の視認も確認。**充足**
- **A.2(a) ページ単体の `metadata.robots: { index: false, follow: false }`**: `dev-preview/page.tsx` L31-39 で `metadata.robots = { index: false, follow: false }` を export。`__tests__/page.test.tsx` L22-32 で metadata.robots の index=false / follow=false を vitest で検証。**充足**
- **A.2(b) `sitemap.ts` 非含有**: `src/app/sitemap.ts` を全文 Read。`dev-preview` / `_dev` どちらの文字列も出現せず。`__tests__/page.test.tsx` L43-50 で sitemap.ts ソース全文に `dev-preview` が含まれないことを検証。**充足**
- **A.2(c) `robots.ts` の disallow に `/_dev/` を含む**: `src/app/robots.ts` L10-17 で disallow に `/api/` / `/_dev/` / `/dev-preview/` の 3 件を配列で列挙。`_dev/__tests__/page.test.tsx` L17-24 で `/_dev/` disallow を検証、`dev-preview/__tests__/page.test.tsx` L34-41 で `/dev-preview/` disallow を検証。**充足**
- **A.3 ビルド出力 HTML に noindex meta 含有を実機確認**: `npm run build` 実行後、`grep -o '<meta name="robots"[^>]*>' .next/server/app/dev-preview.html` で `<meta name="robots" content="noindex, nofollow"/>` が 1 件マッチ。さらに `cat .next/server/app/robots.txt.body` で `Disallow: /api/` / `Disallow: /_dev/` / `Disallow: /dev-preview/` の 3 行が出力 robots.txt に含まれることを確認。**充足**
- **A.4 ビルド成果物に Google Fonts CDN への外部リクエスト混入なし**: `grep -rn "fonts.googleapis.com\|fonts.gstatic.com" .next/static/` 0 件、`grep -c "fonts.googleapis.com" .next/server/app/index.html .next/server/app/dev-preview.html` 両方 0 件。`grep -oE '<link[^>]*font[^>]*>' .next/server/app/index.html` 0 件（既存サイト index.html にフォント preload リンクなし）、dev-preview.html 側のみ `/_next/static/media/ad9c66e761fed85a-s.p.bd81a64b.woff2` の preload あり（`next/font/google` がローカル化したファイル）。`.next/cache/fetch-cache/` には Google Fonts CDN への fetch 痕跡があるが、これは `next/font/google` のビルド時挙動で、配信成果物（HTML/CSS）には混入していない。cycle-170 T-03 Rev1 Blocker B1 と同質の事故再発なし。**充足**
- **A.5 lint / format / test / build 全 pass**: `npm run lint` pass（出力なし）、`npm run format:check` pass（"All matched files use Prettier code style!"）、`npm run test` 279 ファイル / 4094 テスト全 pass、`npm run build` "Compiled successfully in 17.4s" + "Generating static pages using 3 workers (3782/3782)" 成功。`/dev-preview` が `○ (Static)` として静的プリレンダーされたことをビルド出力一覧で確認。**充足**
- **A.6 Playwright スクショでライト表示破綻なし**: `tmp/screenshots/2026-04-27T02-48-09_*_dev-preview_*.jpg` 5 枚を独立に Read。最上部（pageHeader）から最下部（SiteFooter プレビュー）までスクロール 4 段で確認。テキスト消失・重なり・崩壊なし。各セクションの SectionHead / 各 variant ラベル（"variant: primary / ghost / danger" 等）が読める状態で配置されている。**充足**
- **A.7 Storybook 等の新規ビルドツール導入なし**: `package.json` の dependencies / devDependencies に Storybook 関連パッケージなし。`git diff HEAD -- package.json package-lock.json` で本 Rev での依存追加なし。**充足**

#### 観点 A〜I の評価

- **A（受け入れ基準）**: A.1〜A.7 すべて充足。**充足**
- **B（既存サイトへの副作用ゼロ — 最重要）**: `git diff HEAD -- src/app/layout.tsx src/app/globals.css src/components/common/ src/components/design-system/ .claude/skills/frontend-design/philosophy.md .claude/skills/frontend-design/SKILL.md` 出力 0 行。ホームページ HTML（`.next/server/app/index.html`）にフォント関連 link なし、`@import` なし、Google Fonts CDN リンクなし。Owner 原則 4「既存サイトに手を加えない」が実機ビルド成果物レベルで完全に保たれている。**充足**
- **C（builder 判断の妥当性 — フォルダ名）**: `dev-preview` という命名は plan の趣旨（検索エンジン非露出の動作確認ページ）と整合。略語ではなく意図が直接読める英単語 2 語で、Owner 原則 5（略語ディレクトリ禁止）の対象外。`src/app/` 配下の既存ルート命名（`achievements` / `cheatsheets` / `dictionary` / `play` 等）と語感が揃う。ただし `_dev/` を併存させた構造には Minor-1 のとおり改善余地あり。
- **D（フォント読み込みの局所化）**: `dev-preview/layout.tsx` L20-29 で `next/font/google` 経由で Noto Sans JP を CSS 変数 `--dev-font-noto` として読み込み、`dev-preview/layout.module.css` L8-9 で `--font-sans` を local override してこの変数を使用。`globals.css` への `@import` は不在（cycle-170 T-03 Rev1 Blocker B1 の再発防止が構造化されている）。HTML 出力に Google Fonts CDN への直接リクエストなし（A.4 で実機確認）。**充足**
- **E（検索エンジン非露出の三層遮断）**: (a) page.tsx の metadata.robots → ビルド HTML に `<meta name="robots" content="noindex, nofollow"/>` 出力（実機確認）、(b) sitemap.ts に dev-preview / \_dev のいずれも非含有（実機 grep で 0 件）、(c) robots.ts の disallow に `/dev-preview/` と `/_dev/` の両方を含み、ビルド出力 robots.txt にも反映（実機 cat で確認）。**充足**
- **F（テストの品質）**: 自動化遮断テストは (a)(b)(c) の 3 層を実コードで検証する内容。ただし `_dev/__tests__/page.test.tsx` の 4 テストのうち 2 件（robots.ts に dev-preview / sitemap.ts に dev-preview）は `dev-preview/__tests__/page.test.tsx` と完全重複。Minor-1 の対象。
- **G（Playwright スクショの品質）**: 保存先 `tmp/screenshots/` は `tmp/` ガイド（一時ファイル置き場）と整合。w1280 で 4 段スクロール（1280×1200 + 1280×2000×3）の構図で全 8 コンポーネントが視認可能。ライト表示で破綻なし。ダーク表示は plan 受け入れ基準で「致命的破綻のみ確認すれば足る」とされており、本 Rev では撮影なしだが受け入れ基準充足。**充足**
- **H（philosophy.md NEVER 節との整合）**: dev-preview ページ自体の文言（「[Dev] design-system 動作確認」「このページは開発用の確認ページです。本番サイトには公開されません。各コンポーネントの variant・サイズ・状態を実機で確認できます。」）は中立的な技術説明。「あなた」「私たち」「ようこそ」「訴求文」「装飾絵文字」のいずれも不在。pageHeader は `max-width: 900px; margin: 0 auto` で中央配置されているが、これは確認ページの説明枠であり「中央寄せヒーロー + 3カラム + 価格テーブル」の SaaS 構成とは異なる。アクセントカラーは `--accent-soft` 背景 + `--accent` border の単色アクセントで「複数アクセントの同時使用」NEVER 違反なし。`grep` で gradient / backdrop-filter / Inter / Roboto いずれもなし。**充足**
- **I（ビルド成功と無副作用）**: A.5 のとおり lint / format / test / build すべて pass。bundle-budget の `UNCATEGORISED_WHITELIST` への `/dev-preview` 追加は home / about / privacy / achievements と同列の扱いで妥当（uncategorisedMax: 50KB 以内であれば pass する fallback 構造）。**充足**

#### Blocker / Major / Minor の指摘

Blocker 0 / Major 0 / Minor 3。

**Minor-1: `src/app/_dev/` の存在意義が薄く、テスト 2 件が `dev-preview/__tests__/page.test.tsx` と重複している**

所在: `src/app/_dev/__tests__/page.test.tsx`

問題: `_dev/` フォルダには `__tests__/page.test.tsx` しか中身がない。テスト 4 件のうち、(c) robots.ts に `/dev-preview/` disallow を含むこと、(d) sitemap.ts に `dev-preview` を含まないこと、の 2 件は `dev-preview/__tests__/page.test.tsx` の同等テストと完全重複。`_dev/` フォルダが残っているのは plan の文言「`src/app/_dev/`」に形式的に合わせたためと読めるが、Next.js App Router 仕様で `_` 始まりはルートにならないため、実体（page.tsx / layout.tsx）は存在しない。将来の builder/reviewer が「動作確認ページはどこ？」と探すときに `src/app/_dev/` を見て困惑する可能性がある。Owner 原則 9（無意味な複雑さを持ち込まない）と原則 11（二重管理回避）に軽く触れる構造。

修正方向: 以下のいずれか。

- (a) `src/app/_dev/` を完全削除し、`_dev/` 関連の disallow テストは `dev-preview/__tests__/page.test.tsx` に統合する。robots.ts の `/_dev/` disallow も削除（ルートが存在しないため冗長）。**推奨**。
- (b) `_dev/` を残すなら、`__tests__/page.test.tsx` の冒頭コメントに「このフォルダは Next.js App Router のプライベートフォルダで、ルートとしては存在しない。`/_dev/` という URL に対して disallow が冗長に維持されていることを保証するための shadow テスト置き場」と役割を明確化し、`dev-preview/` 側との重複テストを削る。

**Minor-2: dev-preview ページに既存サイトの `<Header />` / `<Footer />` が混在表示される（仕様の説明が不足）**

所在: `src/app/dev-preview/page.tsx` / `src/app/dev-preview/layout.tsx`

問題: スクショ確認の結果、dev-preview ページの最上部には既存サイトの `<Header />`（yolos.net ロゴ + ナビ + 検索）、最下部には既存 `<Footer />` が表示されている。これは `src/app/layout.tsx`（ルートレイアウト）が `<Header />` `<Footer />` を `<main>` の上下に配置しており、子レイアウト（dev-preview/layout.tsx）はそれを変更できないため。「既存サイトに手を加えない」原則を優先した結果として妥当な妥協ではあるが、**design-system の SiteHeader と既存 Header が同一画面に二重表示**される。確認ページの目的（design-system コンポーネントの視覚確認）に対して、見る人が「どっちが何か」を把握しにくい状況になる。

修正方向: 以下のいずれか（最小コスト推奨）。

- (a) dev-preview/page.tsx の pageHeader の note に「ページ最上部・最下部に表示されているヘッダー/フッターはルートレイアウト由来の既存サイトのもの。design-system の SiteHeader/SiteFooter は下記のセクションで個別に確認する」を一言追加する。
- (b) SiteHeader / SiteFooter のセクション SectionHead `meta` に「下記の SiteHeader プレビューと混同しないこと」のような注記を入れる。

**Minor-3: dev-preview HTML に既存サイトの keywords メタが継承されている**

所在: `src/app/dev-preview/page.tsx` / 生成 HTML

問題: ビルド出力 `.next/server/app/dev-preview.html` の `<head>` に `<meta name="keywords" content="占い,性格診断,無料診断,...">` が継承されている。これはルートレイアウトの metadata.keywords が page.tsx で上書きされていないため。検索エンジンには noindex/nofollow なので SEO 影響は無いが、「本番公開対象外のページに本番サイトのキーワードが残る」のは意図と異なる残骸。

修正方向: page.tsx の metadata に `keywords: []` を追加して空配列で上書きするか、放置（実害なしのため）。Owner 原則 4「既存サイトに手を加えない」とは矛盾しないが、修正は不要レベル。記録のみ。Minor-1 の修正流れで合わせると清潔。

#### 良かった点

- **重要事項が完璧に守られている**: ビルド成功、4094 テスト全 pass、`grep -r "fonts.googleapis.com" .next/` 実機確認で外部リクエスト混入ゼロ、`<meta name="robots" content="noindex, nofollow">` の実機確認、robots.txt の disallow 実機確認、既存サイト関連ファイル（`src/app/layout.tsx` / `src/app/globals.css` / `src/components/common/` / `src/components/design-system/` / `philosophy.md` / `SKILL.md`）すべて `git diff HEAD` で完全不変。cycle-170 T-03 Rev1 Blocker B1（globals.css への `@import` で全ページに副作用）と同質の事故再発防止が構造的に達成されている
- **検索エンジン非露出の三層遮断が独立した検証経路を持つ**: ページ単体 metadata（vitest）、sitemap.ts 非含有（vitest + 実機確認）、robots.ts disallow（vitest + ビルド出力 robots.txt 実機確認）、ビルド HTML の noindex meta（実機 grep）の 4 経路で、どの 1 つが壊れても他で検出できる多層構造
- **フォント読み込みの局所化が `next/font/google` のローカル化挙動を活用**: `dev-preview/layout.tsx` 内で `Noto_Sans_JP` を CSS 変数として読み込み、`dev-preview/` スコープの `--font-sans` を local override する実装で、Google Fonts CDN への配信時リクエストが完全に消える設計。cycle-170 T-03 Rev1 Blocker B1 の修正方向（「専用 layout で `next/font` を使う」plan L102）と一致しており、再発防止が plan → 実装の経路で構造化されている
- **builder 判断の透明性**: page.tsx L9-14、layout.tsx L9-12、`_dev/__tests__/page.test.tsx` L1-12 のコメントで「なぜ `_dev/` ではなく `dev-preview/` を使うか」「globals.css に @import を書かない理由」が next/Owner 原則を引きながら明文化されている。次サイクルの builder/reviewer が「なぜこの構造か」を辿れる構造で、CLAUDE.md「コーディング原則 4: 可読性を高く保つ — コメントでコードの『なぜ』を説明する」と整合
- **bundle-budget の WHITELIST 追加コメントに本番公開対象外であることを明記**: `src/__tests__/bundle-budget.test.ts` L83 に「design-system 動作確認ページ（noindex/nofollow 設定済み、本番公開対象外）」と意図が記録されており、将来の reviewer が「なぜ home/about/privacy/achievements と同列扱いか」を判断できる

#### 判定の根拠

T-5 受け入れ基準 A.1〜A.7 すべて充足、観点 A〜I すべて充足、Owner 原則 4「既存サイトに手を加えない」が実機ビルド成果物レベルで完全に保たれている。重要事項（noindex 実機確認・Google Fonts CDN 混入ゼロ実機確認・既存ファイル不変・lint/format/test/build 全 pass）には漏れなし。

ただし Minor 3 件（\_dev/ 併存の重複構造、既存 Header/Footer 混在の説明不足、本番 keywords 継承）が残るため、判定基準「Blocker / Major / Minor のいずれかが 1 件でも残れば needs_revision」に従い **needs_revision**。Minor のいずれも構造的な事故リスクや Owner 原則違反の温床にはならず、修正コストは低い（コメント追加・フォルダ削除・metadata 追記）が、特に Minor-1（\_dev/ 併存）は Owner 原則 9・11 への軽い接触があるため修正を推奨する。

#### PM への提案

1. builder に Minor 3 件の修正作業を依頼する。特に Minor-1（`src/app/_dev/` の処置）は Owner 原則 9・11 への影響があるため必須。Minor-2（混在表示の note 追記）は最小コストで確認ページの価値を上げる。Minor-3（keywords 上書き）は実害なしだが Minor-1 の修正流れで合わせると清潔
2. 修正後、再度 reviewer に依頼する。前回の指摘事項（Minor-1〜3）の解消確認だけでなく、サイクル実行規約に従い T-5 全体の見直しも含めること

### T-5 Rev2（2026-04-27）

対象: T-5 Rev1 で検出した Minor 3 件の修正と、サイクル実行規約に従った T-5 全体の見直し。`git status` / `git diff HEAD` で本 Rev での修正範囲を把握したうえで、`src/app/_dev/` 削除確認、`src/app/dev-preview/page.tsx` の差分、`src/app/robots.ts` の差分、`src/app/dev-preview/__tests__/page.test.tsx` の差分、ビルド成果物（`.next/server/app/dev-preview.html` / `.next/server/app/index.html` / `.next/server/app/robots.txt.body` / `.next/static/`）、curl による実機 HTML 描画、bundle-budget 出力を独立検証した。Playwright MCP browser がインストールされておらず使えないため、実機ブラウザ視覚確認は行えず、ビルド HTML 文字列確認 + curl 実機レンダリング + CSS 論理推論で代替検証した。

判定: **needs_revision**

#### Rev1 指摘事項の解消確認（独立検証）

**Minor-1（`_dev/` 併存・テスト重複）→ 解消**:

- `ls /mnt/data/yolo-web/src/app/_dev/` で「No such file or directory」を実機確認、`git status` でも `_dev/` は完全消失
- `src/app/robots.ts` を Read。disallow 配列が `/api/` と `/dev-preview/` の 2 件のみ（`/_dev/` および関連コメントが同時に整理されている）
- `src/app/dev-preview/__tests__/page.test.tsx` L52-59 に「robots.ts に `/_dev/` が**含まれない**こと」を保証するテストが新規追加され、Minor-1 解消で `/_dev/` を削除した判断が将来逆戻りしないための防衛線として機能。テスト名 `"robots.ts does not include /_dev/ in disallow rules (removed as redundant)"` も意図が読める文面
- ビルド出力 `.next/server/app/robots.txt.body` を実機 cat。`Disallow: /_dev/` が消失、`Disallow: /api/` と `Disallow: /dev-preview/` の 2 件のみが出力されていることを確認
- `dev-preview/page.tsx` ヘッダーコメント L9-13 は plan からの builder 判断経緯記録としてのみ `_dev/` に言及（残置として正当）。`__tests__/page.test.tsx` L10/L52-58 も同様の経緯記録 + 防衛テストで残置の根拠あり
- **完全解消**

**Minor-2（既存 Header/Footer 混在の説明不足）→ 解消（ただし副作用 1 件）**:

- `src/app/dev-preview/page.tsx` L51-56 で 2 つ目の `<p class={styles.pageNote}>` が追加され、「注: ページ最上部・最下部に表示されているヘッダー／フッターはルートレイアウト由来の既存サイトのものです。design-system の SiteHeader・SiteFooter は下記の各セクションで個別に確認できます。」と明記
- 文面は中立的な技術説明で、philosophy.md NEVER 節（「あなた」「私たち」「ようこそ」「装飾的な訴求文」）の言葉に該当しない。「注:」プレフィックスで本文と視覚的に区別する意図あり
- ビルド HTML（`grep -oE "ページ最上部・最下部.*?ヘッダー" .next/server/app/dev-preview.html`）と curl による実機レンダリング双方で note 文の出力を確認
- ただし `.pageNote` の CSS にマージン定義がなく、グローバルリセットで段落間隔が消えている問題が新規発見（後述 Minor-1）
- **意図としては解消、ただし新規 Minor-1 を派生**

**Minor-3（keywords 継承）→ 解消**:

- `src/app/dev-preview/page.tsx` L34-35 に `keywords: []` がコメント付きで追加（「ルートレイアウトから継承される keywords を空配列で上書きする（本番キーワードを開発ページに残さない）」）
- `grep -c '<meta name="keywords"' .next/server/app/dev-preview.html .next/server/app/index.html` を実機実行し、dev-preview.html = 0 件、index.html = 1 件（既存サイトには影響なし、空配列上書きが dev-preview ページにのみ局所適用されている）
- **完全解消**

#### 観点 A〜I の差分再評価

- **A（受け入れ基準 A.1〜A.7）**: Rev1 の充足を維持。`npm run build` 成功（`/dev-preview` が `○ (Static)` として静的プリレンダー）、`<meta name="robots" content="noindex, nofollow"/>` を `.next/server/app/dev-preview.html` で実機確認、`grep -rn "fonts.googleapis.com\|fonts.gstatic.com" .next/static/ .next/server/app/index.html .next/server/app/dev-preview.html` 0 件、全 8 コンポーネント配置（DevComponents.tsx 不変）、lint/format/test/build 全 pass、Storybook 不導入。**充足を維持**
- **B（既存サイトへの副作用ゼロ — 最重要）**: `git diff HEAD -- src/app/layout.tsx src/app/globals.css src/components/common/ src/components/design-system/ .claude/skills/frontend-design/` 出力 0 行で再確認。本 Rev での修正は `dev-preview/` 内 + robots.ts + bundle-budget のみで、既存サイトに影響する変更は皆無。Owner 原則 4 完全維持。**充足を維持**
- **C（builder 判断の妥当性 — フォルダ名）**: `_dev/` 物理削除により Rev1 で指摘した「`_dev/` 併存の冗長構造」が消滅。`dev-preview/` 単独構造で、次サイクル以降の builder/reviewer が「動作確認ページはどこ？」と探したときに迷わない構造になった。Owner 原則 9（無意味な複雑さを持ち込まない）と原則 11（二重管理回避）への軽い接触が解消。**改善が進み、悪化なし**
- **D（フォント読み込みの局所化）**: Rev1 の構造（`next/font/google` で `dev-preview/layout.tsx` に閉じ込め）に変更なし。`grep -oE '<link[^>]*font[^>]*>' .next/server/app/index.html` 0 件（既存サイト index.html にフォント preload リンクなし）、dev-preview.html 側のみ `/_next/static/media/ad9c66e761fed85a-s.p.bd81a64b.woff2` の preload あり（ローカル化された woff2）。**充足を維持**
- **E（検索エンジン非露出の三層遮断）**: (a) page.tsx metadata.robots → ビルド HTML noindex meta（実機 grep で確認）、(b) sitemap.ts に dev-preview 非含有（実機 grep 0 件）、(c) robots.ts disallow → ビルド robots.txt 反映（実機 cat で確認）。三層構造が `_dev/` 削除でシンプル化したが、遮断強度は変わらず。**充足を維持**
- **F（テストの品質）**: テスト総数の遷移: Rev1 の 279 ファイル 4094 テスト → Rev2 の 278 ファイル 4091 テスト（`_dev/__tests__/` 削除で -4、`dev-preview/__tests__/` に「`/_dev/` を含まない」テスト +1 = 純減 -3）。重複テスト 2 件が Minor-1 解消で消え、代わりに「`/_dev/` を含まない」という防衛テストが入ったことで、テストの意図と実装の一致度が向上。新テスト名 `"robots.ts does not include /_dev/ in disallow rules (removed as redundant)"` は意図が読める文面で、CLAUDE.md「コーディング原則 4: 可読性を高く保つ」と整合。**改善が進み、悪化なし**
- **G（Playwright スクショの品質）**: Rev1 撮影スクショは Minor-2 修正前のものだが、修正内容は pageHeader 内の `<p class={styles.pageNote}>` 1 つ追加のみで、レイアウトに大きな影響を与えない。実機ブラウザでの視覚確認はインフラ制約（Playwright MCP browser 未インストール）で実施できなかったが、ビルド HTML 文字列確認と curl での実機レンダリング確認で代替検証済み。ただし CSS 論理推論で新規 Minor-1（pageNote の段落間マージン欠如）を発見。視覚確認の代替検証として CSS 論理確認を実施した結果検出された問題で、本 Rev2 の判定に組み入れる
- **H（philosophy.md NEVER 節との整合）**: 新規追加された note 文（「注: ページ最上部・最下部に…design-system の SiteHeader・SiteFooter は下記の各セクションで個別に確認できます。」）は中立的な技術説明で、NEVER 節（「あなた」「私たち」「ようこそ」「訴求文」「装飾絵文字」）に該当しない。`grep` で gradient / backdrop-filter / Inter / Roboto / 装飾絵文字いずれもなし。**充足を維持**
- **I（ビルド成功と無副作用）**: `npm run lint` pass（出力なし）、`npm run format:check` pass（"All matched files use Prettier code style!"）、`npm run test` 278 ファイル / 4091 件 pass、`npm run build` 成功。bundle-budget で `/dev-preview: 18.4KB`（uncategorisedMax 50KB 以内、home の 30.9KB の 6 割程度で `useState` を含むクライアントコンポーネントの想定範囲内）。**充足を維持**

#### Rev1 で見落としていた可能性の再点検

サイクル実行規約「再レビュー時は前回の指摘事項だけでなく全体を見直す」に従い、Rev1 で確認していなかった追加観点を再走査:

- **`.pageNote` の段落間マージン**: Minor-2 修正で 2 つの `<p class={styles.pageNote}>` が `.pageHeader` 直下に並ぶ構造になったが、`page.module.css` L25-29 の `.pageNote` には `margin` が定義されていない。`globals.css` L37-42 のグローバルリセット `*, *::before, *::after { margin: 0; padding: 0; }` により `<p>` のデフォルト UA `margin-block` も打ち消される。CSS 論理上、1 文目と 2 文目が縦方向に密着して表示される構造。新規 Minor として後述
- **dev-preview.html の twitter メタ継承**: `grep` で `<meta name="twitter:card" content="summary_large_image"/>` 等のルートレイアウト由来 twitter メタが dev-preview.html にも継承されていることを確認。検索エンジンには noindex なので影響なく、URL が外部に拡散する想定がない（noindex で sitemap 非掲載のため）ので実害ゼロ。Minor-3 解消の流れで合わせて空上書きしてもよかったが、本サイクルの受け入れ基準にも Rev1 指摘にもなく、新規 Minor として上げるレベルではない。**観察事項として記録のみ**
- **`__tests__/page.test.tsx` L52-59 の追加テストの意図確認**: 「`/_dev/` が robots.ts に含まれないこと」を確認するテストは、Minor-1 解消で `/_dev/` を意図的に削除した判断が将来逆戻りしないための防衛線。Rev1 で削除推奨した方向 (a) の正規実装で、CLAUDE.md「コーディング原則 4: 可読性を高く保つ」と整合。本 Rev で確認した範囲では正常動作
- **bundle-budget の `/dev-preview: 18.4KB` 出力**: `npm run test -- --run bundle-budget` の stdout で確認。home（30.9KB）の 6 割程度のサイズで、uncategorisedMax 50KB 以内。`useState` を含むクライアントコンポーネント（DevComponents.tsx）の存在から考えて妥当な範囲
- **Rev1 で承認済みだった「`_dev/` 併存」が Rev2 で完全解消したことの再確認**: `git diff HEAD --stat` の出力で `src/app/_dev/` 関連ファイルが消失していること、`git status` の untracked に `src/app/_dev/` が含まれないこと、`grep -rn "_dev\|/_dev/" /mnt/data/yolo-web/src/` で残存箇所がすべて経緯記録コメントまたは防衛テスト（意図的な残置）であることを確認

新規 Minor の検出は **1 件**。

#### Blocker / Major / Minor の指摘

Blocker 0 / Major 0 / Minor 1。

**Minor-1（新規）: `.pageNote` の段落間マージン欠如により、Minor-2 で追加された 2 つ目の note が 1 文目と密着表示される**

所在: `src/app/dev-preview/page.module.css` L25-29

問題: Minor-2 修正で `dev-preview/page.tsx` L47-56 に 2 つの `<p class={styles.pageNote}>` が並ぶ構造になったが、`.pageNote` クラスには `margin` が定義されておらず、かつ `globals.css` L37-42 のグローバルリセット（`*, *::before, *::after { margin: 0; padding: 0; }`）が `<p>` のデフォルト UA `margin-block` を打ち消している。結果として 1 文目（「このページは開発用の確認ページです…」）と 2 文目（「注: ページ最上部・最下部に…」）が**縦方向に密着して表示される**可能性が高い。`line-height: 1.6` で行内の余白は確保されるが、段落間の視覚的分離が失われ、note が一続きの長文に見えてしまう。

実機ブラウザでの視覚確認はインフラ制約（Playwright MCP browser 未インストール）で実施できなかったが、CSS 論理上は段落分離が崩れる構造。Minor-2 修正の意図（既存 Header/Footer と design-system Header/Footer の混在を読者に明確に伝える）を視覚レベルで完全に達成するには修正が必要。

修正方向: 以下のいずれか。

- (a) `page.module.css` の `.pageNote` に `margin-bottom: var(--sp-3, 0.75rem);` を追加し、最後の note に `:last-child { margin-bottom: 0 }` を付与する。
- (b) `.pageNote + .pageNote { margin-top: var(--sp-3, 0.75rem); }` のような隣接セレクタで 2 つ目以降にだけマージンを付与する（**最小コスト推奨**、CSS 1 行追加で完結、意図が CSS 上で読める）。
- (c) `.pageHeader` を `display: flex; flex-direction: column; gap: var(--sp-3, 0.75rem);` にする（pageHeader 内の他要素 `pageTitle` への影響を考慮する必要あり）。

(b) が最小コストかつ意図が明確（「note が連続するときだけ間を空ける」がそのまま CSS で表現される）。修正後、可能なら実機ブラウザで視覚確認することが望ましい。

#### 良かった点

- **Rev1 指摘 3 件すべてが builder 報告どおり完全解消**: `_dev/` 物理削除（Minor-1）、note 追記による説明明示（Minor-2）、`keywords: []` 上書き（Minor-3）のいずれも実機ビルド出力で解消を確認できた
- **Minor-1 解消の副作用として防衛テストが追加された**: 単に `_dev/` を削除するだけでなく、「`/_dev/` が robots.ts に含まれないこと」を保証するテストを追加することで、将来の builder が plan の文面に従って `/_dev/` を再追加してしまう事故を構造的に防いでいる。これは Rev1 で示した修正方向 (a) を超える品質で、CLAUDE.md「コーディング原則 3: シンプルで一貫したコンポーネント設計 — 副作用を最小限に抑える」と整合
- **修正の意図がコメントで残されている**: page.tsx L34 の `keywords: []` 上書きに「ルートレイアウトから継承される keywords を空配列で上書きする（本番キーワードを開発ページに残さない）」、`__tests__/page.test.tsx` L52-58 の追加テストに「`/_dev/` は Next.js プライベートフォルダとして URL が存在しないため disallow は不要」のコメントが入っており、なぜこの実装かが次サイクル以降の builder/reviewer に伝わる構造
- **既存サイトへの副作用ゼロが Rev1 から完全に維持されている**: `git diff HEAD -- src/app/layout.tsx src/app/globals.css src/components/common/ src/components/design-system/ .claude/skills/frontend-design/` 出力 0 行。Owner 原則 4「既存サイトに手を加えない」が Rev1 → Rev2 の修正過程でも一貫して守られている
- **Minor-2 の note 文面が「注:」プレフィックスを使った中立的な技術説明**: philosophy.md NEVER 節（「あなた」「私たち」「ようこそ」「訴求文」）への抵触を回避しつつ、本文との視覚的区別を意図する設計。functional-quiet Named Tone との整合も保たれている

#### 検討点（Blocker / Major / Minor のいずれにも該当しないが記録する観察事項）

- **dev-preview.html の twitter メタ継承**: ルートレイアウトの `twitter.card` / `twitter:title` / `twitter:image` 等が dev-preview.html にも継承されているが、noindex + sitemap 非掲載で URL 拡散経路がないため実害ゼロ。本サイクルの受け入れ基準にもなく、新規 Minor として上げる必要なし。次サイクル以降に「dev-preview の SNS 共有画像が本番サイト用画像になっている」を改善したくなったら検討するキャリーオーバー候補
- **実機ブラウザ視覚確認の代替手段**: 本 Rev では Playwright MCP browser が未インストールでブラウザ視覚確認ができず、ビルド HTML 文字列確認 + curl 実機レンダリング + CSS 論理推論で代替した。Minor-1（pageNote 段落間マージン）は CSS 論理推論で検出した問題で、実機ブラウザ確認なしでも検出可能だったが、次サイクル以降のレビュー体制として Playwright が使える環境を整備するとレビュー精度が上がる

#### 判定の根拠

Rev1 で指摘した Minor 3 件はすべて独立検証で完全解消を確認。修正による既存仕様への影響（既存サイトファイル不変、Google Fonts CDN 混入ゼロ、noindex/nofollow 維持、検索エンジン三層遮断維持）はいずれも問題なし。観点 A〜I すべてで Rev1 の状態を維持または改善し、悪化箇所なし。lint・format・test 4091 件・build すべて pass。

ただし Rev1 で見落としていた可能性の再点検で **Minor-1（pageNote 段落間マージン欠如）を新規発見**。これは Minor-2 修正で 2 つ目の `<p>` を追加した結果、CSS 側のスタイル（1 段落想定）が追従していない問題で、Minor-2 の意図（混在説明を視覚的に明確に伝える）を完全に達成するには CSS 1 行の修正が必要。

判定基準「Blocker / Major / Minor のいずれかが 1 件でも残れば needs_revision」に従い **needs_revision**。修正コストは CSS 1 行（(b) 案）で極めて小さく、構造的な事故リスクや Owner 原則違反の温床にはならない。

#### PM への提案

1. builder に Minor-1（CSS 1 行追加）の修正作業を依頼する。修正方向 (b) `.pageNote + .pageNote { margin-top: var(--sp-3, 0.75rem); }` が最小コスト推奨。修正後、可能なら実機ブラウザで視覚確認することが望ましい
2. 修正後、再度 reviewer に依頼する。前回の指摘事項（本 Rev2 の Minor-1）の解消確認だけでなく、サイクル実行規約に従い T-5 全体の見直しも含めること。Playwright が使える環境であれば実機スクショ再撮で視覚確認することを推奨

### T-5 Rev3（2026-04-27）

対象: T-5 Rev2 で検出した Minor-1（`.pageNote` の段落間マージン欠如）の修正と、サイクル実行規約に従った T-5 全体の最終見直し。`git status` / `git diff HEAD --stat` で本 Rev での修正範囲を把握したうえで、`src/app/dev-preview/page.module.css` の差分、ビルド成果物（`.next/server/app/dev-preview.html` / `.next/server/app/index.html` / `.next/server/app/robots.txt.body` / `.next/static/chunks/` 配下）、curl による実機 HTML 描画、`npx @playwright/mcp install-browser chrome-for-testing` でインストールしたブラウザを使った実機ビジュアル検証（pageHeader 領域 viewport スクショ + フルページスクショ）、bundle-budget 出力を独立検証した。

判定: **needs_revision**

#### Rev2 指摘事項の解消確認（独立検証）

**Minor-1（`.pageNote` の段落間マージン欠如）→ 解消**:

- `src/app/dev-preview/page.module.css` L31-34 に Rev2 推奨方向 (b) のとおり隣接セレクタ `.pageNote + .pageNote { margin-top: var(--sp-3); }` が追加された。L31 のコメント「globals.css のリセット（margin: 0）を補正して段落間に間隔を確保する」が「なぜ」を説明しており、CLAUDE.md「コーディング原則 4: 可読性を高く保つ — コメントでコードの『なぜ』を説明する」と整合
- ビルド成果物 `.next/static/chunks/9eba8d31ec921a25.css` を実機 grep。`.page-module__IehQla__pageNote+.page-module__IehQla__pageNote{margin-top:var(--sp-3)}` が CSS Modules でスコープ化された形で出力されていることを確認。同名クラスを別ファイルで使う場合と衝突しない構造
- `.next/static/chunks/5096cd4ac06e7e48.css` を実機 grep。`:root` 内に `--sp-3:12px` が含まれており、ルートレイアウト経由で必ず読み込まれる構造を再確認（`var(--sp-3)` が本番環境で常に解決される）
- **Playwright MCP browser を `npx @playwright/mcp install-browser chrome-for-testing` でインストールし**、`http://localhost:3000/dev-preview` を viewport 1280×900 で開いて pageHeader 領域のスクショを取得（`/mnt/data/yolo-web/tmp/screenshots/2026-04-27_T-5-Rev3_dev-preview_pageHeader.png`）。1 文目（「このページは開発用の確認ページです…」）と 2 文目（「注: ページ最上部・最下部に…」）の間に明確な縦方向余白が確認でき、2 段落として視覚的に分離されている
- フルページスクショ（`tmp/screenshots/2026-04-27_T-5-Rev3_dev-preview_fullPage.png`）でも全 8 コンポーネント領域を含むページ全体に視覚的破綻なし
- builder の選定根拠「`--sp-2` では小さすぎ、`--sp-4` では離れすぎる中間として 12px を採用。8px グリッドの 1.5 ステップ」を独立検証: globals.css の spacing 階層は `--sp-1: 4px / --sp-2: 8px / --sp-3: 12px / --sp-4: 16px` で 4px グリッド（8px グリッドの 0.5 ステップ刻み）。`--sp-3 = 12px` は 4px グリッド準拠で、philosophy.md L4「装飾より機能、対比より余白、訴求より静けさを選ぶ」の「対比より余白」方針とも整合
- **完全解消**

#### 観点 A〜I の差分再評価

- **A（受け入れ基準 A.1〜A.7）**: Rev2 の充足を維持。`npm run build` 成功（`/dev-preview` が `○ (Static)` として静的プリレンダー、`Compiled successfully in 17.2s`）、`<meta name="robots" content="noindex, nofollow"/>` を `.next/server/app/dev-preview.html` で実機確認、`grep -rn "fonts.googleapis.com\|fonts.gstatic.com" .next/static/ .next/server/app/index.html .next/server/app/dev-preview.html` 0 件、全 8 コンポーネント配置（DevComponents.tsx 不変）、lint/format/test/build 全 pass、Storybook 不導入。**充足を維持**
- **B（既存サイトへの副作用ゼロ — 最重要）**: `git diff HEAD -- src/app/layout.tsx src/app/globals.css src/components/common/ src/components/design-system/ .claude/skills/frontend-design/` 出力 0 行（行数 wc -l で 0 を実機確認）。本 Rev での修正は `dev-preview/page.module.css` の 4 行追加のみで、既存サイトに影響する変更は皆無。Rev1 → Rev2 → Rev3 を通じて Owner 原則 4「既存サイトに手を加えない」が一貫して守られている。**充足を維持**
- **C（builder 判断の妥当性 — フォルダ名）**: Rev2 で解消済み（`_dev/` 物理削除）。本 Rev で再変更なし。**充足を維持**
- **D（フォント読み込みの局所化）**: 構造に変更なし。`grep -oE '<link[^>]*font[^>]*>' .next/server/app/index.html` 0 件で再確認、dev-preview.html 側のみ `/_next/static/media/ad9c66e761fed85a-s.p.bd81a64b.woff2` の preload あり。**充足を維持**
- **E（検索エンジン非露出の三層遮断）**: (a) page.tsx metadata.robots → ビルド HTML noindex meta 実機確認、(b) sitemap.ts に dev-preview 非含有、(c) robots.ts disallow → ビルド robots.txt 反映（`Disallow: /api/` と `Disallow: /dev-preview/` の 2 件のみ、`/_dev/` 不在維持を実機 cat で再確認）。**充足を維持**
- **F（テストの品質）**: テスト数は Rev2 と同じ 278 ファイル / 4091 件全 pass。CSS のみの修正でテストファイルの追加・削除なし。Rev2 で追加された防衛テスト（`/_dev/` が含まれないことを保証）も継続して pass。**充足を維持**
- **G（Playwright スクショの品質）**: Rev2 でインフラ制約により未実施だった実機ブラウザ視覚検証が、本 Rev で `npx @playwright/mcp install-browser chrome-for-testing` のインストール後に実施可能になった。pageHeader 領域 viewport スクショとフルページスクショの 2 枚を `tmp/screenshots/` に保存。tmp ガイドと整合。pageHeader 内 2 文の段落分離、全 8 コンポーネントの視覚整合、ライト表示で破綻なしを実機確認。**改善が進み、悪化なし**
- **H（philosophy.md NEVER 節との整合）**: 修正は CSS のマージン追加のみで、新規テキスト・新規装飾・新規アクセントカラーなし。NEVER 節（「あなた」「私たち」「ようこそ」「訴求文」「装飾絵文字」「複数アクセント同時使用」「グラデーション」「shadow」等）への抵触なし。`grep` で gradient / backdrop-filter / Inter / Roboto / 装飾絵文字すべて 0 件。philosophy.md L4「対比より余白」方針との整合も `--sp-3 = 12px` の選定で達成。**充足を維持**
- **I（ビルド成功と無副作用）**: `npm run lint` pass（出力なし）、`npm run format:check` pass（"All matched files use Prettier code style!"）、`npm run test` 278 ファイル / 4091 件 pass、`npm run build` 成功。bundle-budget で `/dev-preview` がホワイトリストに含まれて pass（CSS 4 行追加でサイズへの実質的影響なし）。実機ブラウザで console error 0 件、warning 7 件はすべて Next.js の `link preload but not used` 既知挙動で本サイクル責任範囲外（既存サイトでも発生しうる一般的 warning）。**充足を維持**

#### Rev2 で見落としていた可能性の再点検

サイクル実行規約「再レビュー時は前回の指摘事項だけでなく全体を見直す」に従い、Rev1 / Rev2 で確認していなかった追加観点を再走査:

- **`page.module.css` 内での CSS 変数 fallback の一貫性**: `page.module.css` の他箇所（L6 `var(--sp-8, 2rem)` / L11 `var(--sp-8, 2rem)` / L12 `var(--sp-4, 1rem)` / L22 `var(--sp-2, 0.5rem)` / L26 `var(--type-sm, 0.875rem)` / L27 `var(--fg-soft, #555555)`）と、同じ `dev-preview/` 配下の `DevComponents.module.css` の他箇所（L29 / L47 / L55 すべて `var(--sp-3, 0.75rem)`）が CSS 変数の fallback 付きで書かれているのに対し、本 Rev で新規追加された L33 `var(--sp-3)` だけ fallback なし。新規 Minor として後述
- **CSS Modules スコープ化の確認**: ビルド出力の `.page-module__IehQla__pageNote+.page-module__IehQla__pageNote{margin-top:var(--sp-3)}` を確認。CSS Modules のハッシュ付きクラス名でスコープ化されているため、サイト全体で同名 `.pageNote` クラスを別ファイルで使う場合と衝突しない構造
- **隣接セレクタ `+` の挙動**: 隣接セレクタは「直前の兄弟要素が `.pageNote` で、自身も `.pageNote` の場合」にマッチする。pageHeader 内で `.pageTitle` の直後の最初の `.pageNote` にはマージンが付かず（先行兄弟が `.pageNote` ではないため）、2 つ目の `.pageNote` にだけ `margin-top: 12px` が付く。これが「note が連続するときだけ間を空ける」の意図と完全一致
- **`var(--sp-3)` が解決されないケースの存在**: globals.css がルートレイアウト経由で必ず読まれるため、`--sp-3: 12px` は本番環境で常に解決される。CSS が読み込まれない（JavaScript が無効、CSS チャンクのネットワークエラー等）異常時にも、隣接セレクタ規則自体が適用されないため fallback 不在による視覚崩壊は起きない。実害ゼロが構造的に保証されている
- **Playwright スクショの保存場所と命名**: `tmp/screenshots/` 配下に `2026-04-27_T-5-Rev3_dev-preview_*.png` の命名で 2 枚保存。tmp ガイド（一時ファイル置き場）と整合し、サイクル名・タスク名・対象 URL が読める命名。次サイクル以降のスクショ蓄積でも検索可能な構造

新規 Minor の検出は **1 件**。

#### Blocker / Major / Minor の指摘

Blocker 0 / Major 0 / Minor 1。

**Minor-1（新規）: `var(--sp-3)` の fallback 欠如により、同一ファイル内の他 CSS 変数参照との一貫性が崩れている**

所在: `src/app/dev-preview/page.module.css` L33

問題: 本 Rev で新規追加された `.pageNote + .pageNote { margin-top: var(--sp-3); }` の `var(--sp-3)` には fallback 値が設定されていない。一方で同じファイルの他箇所（L6 `var(--sp-8, 2rem)` / L11 `var(--sp-8, 2rem)` / L12 `var(--sp-4, 1rem)` / L22 `var(--sp-2, 0.5rem)` / L26 `var(--type-sm, 0.875rem)` / L27 `var(--fg-soft, #555555)`）と、同じ `dev-preview/` 配下の `DevComponents.module.css` の他箇所（L29 / L47 / L55 すべて `var(--sp-3, 0.75rem)`）はすべて fallback 付きで書かれている。同一ファイル内・同一サイクル成果物内で fallback の有無が混在することは、CLAUDE.md「コーディング原則 3: シンプルで一貫したコンポーネント設計 — コードベース全体で一貫性のある設計をする」に軽く触れる。

実害は極小（globals.css がルートレイアウト経由で必ず読まれるため `--sp-3: 12px` は本番環境で常に解決される。CSS が読まれない異常時には隣接セレクタ規則自体が適用されないため視覚崩壊は起きない）だが、次サイクル以降の builder/reviewer が「なぜここだけ fallback なし？」と読み替えコストを払う構造になる。

修正方向: 1 文字追加のみで完結。

- `margin-top: var(--sp-3);` → `margin-top: var(--sp-3, 0.75rem);` に変更する。これで `dev-preview/` 配下の他 8 箇所と書き方が一致する。

修正コストは極小。本 Minor は構造的な事故リスクや Owner 原則違反の温床にならないが、Rev2 の reviewer 自身（私）が修正方向 (b) で `var(--sp-3, 0.75rem)` と fallback 付きで提示していたにもかかわらず builder が fallback を省いた経緯から、レビュー指示の正確な反映という観点で記録する価値あり。

#### 良かった点

- **Rev2 Minor-1 の修正が最小コストかつ意図が明確**: 4 行（コメント + 隣接セレクタ規則）の追加のみで、Rev2 で reviewer が推奨した方向 (b) の正規実装。「note が連続するときだけ間を空ける」が CSS の隣接セレクタで直接表現されており、コメントの「globals.css のリセット（margin: 0）を補正して段落間に間隔を確保する」も「なぜ」を説明する内容で CLAUDE.md コーディング原則 4 と整合
- **builder の値選定が philosophy.md と整合**: `--sp-3 = 12px` の選定根拠「`--sp-2` では小さすぎ、`--sp-4` では離れすぎる中間」は philosophy.md L4「対比より余白」方針と一致。4px グリッド準拠（8px グリッドの 0.5 ステップ刻み）も、yolos.net 全体の spacing 階層と整合。builder が値の根拠を「中間として採用」「8px グリッドの 1.5 ステップ」と言葉化して報告した点も、判断のトレーサビリティとして優れる
- **実機ブラウザ視覚検証が今回実現した**: Rev2 で reviewer が「Playwright が使える環境であれば実機スクショ再撮で視覚確認することを推奨」と PM への提案に書いた事項が、Rev3 reviewer 側で `npx @playwright/mcp install-browser chrome-for-testing` の実行で解決。pageHeader 領域 viewport スクショとフルページスクショの 2 枚で、Minor-1 修正の段落分離と全 8 コンポーネントの視覚整合を実機確認できた。次サイクル以降のレビュー精度向上のための学習材料として、`docs/knowledge/` への追記候補（「Playwright MCP browser は `npx @playwright/mcp install-browser chrome-for-testing` でインストールできる」）
- **既存サイトへの副作用ゼロが Rev1 → Rev2 → Rev3 を通じて完全に維持されている**: `git diff HEAD -- src/app/layout.tsx src/app/globals.css src/components/common/ src/components/design-system/ .claude/skills/frontend-design/` 出力 0 行。3 回のレビューサイクルを経ても Owner 原則 4「既存サイトに手を加えない」が一度も破られず、cycle-170 T-03 Rev1 Blocker B1（globals.css への `@import` で全ページに副作用）と同質の事故再発防止が構造的に達成されている
- **修正は単一ファイル単独で完結**: `git diff HEAD --stat` で本 Rev の差分は `src/app/dev-preview/page.module.css` の 4 行追加のみ（cycle-170.md は前回 reviewer 追記分、bundle-budget.test.ts と robots.ts は Rev1 から積み上がった既存差分）。CSS Modules によるスコープ化で他ファイルへの副作用なし。修正の最小性と独立性が保たれている

#### 検討点（Blocker / Major / Minor のいずれにも該当しないが記録する観察事項）

- **dev-preview.html の twitter メタ継承**: Rev2 から継続する観察事項。ルートレイアウトの `twitter.card` / `twitter:title` / `twitter:image` 等が dev-preview.html にも継承されているが、noindex + sitemap 非掲載で URL 拡散経路がないため実害ゼロ。次サイクル以降に「dev-preview の SNS 共有画像が本番サイト用画像になっている」を改善したくなったら検討するキャリーオーバー候補
- **console warning 7 件（CSS preload 未使用）**: 実機ブラウザで dev-preview を開くと、`link preload but not used within a few seconds` の Next.js 既知 warning が 7 件発生する。これは Next.js の最適化挙動で、サイト全体の挙動として既存ページでも発生しうる一般的 warning。本サイクル T-5 の責任範囲外で新規 Minor として上げるレベルではないが、サイト全体の preload 戦略の最適化はキャリーオーバー候補
- **Playwright MCP browser のインストール手順**: 本 Rev で初めて `npx @playwright/mcp install-browser chrome-for-testing` でブラウザをインストールしたが、これは reviewer の実行環境ごとに必要になる手順。`docs/knowledge/` に「Playwright MCP browser のインストール方法と初回コスト（107.5 MiB ダウンロード）」を記録すると、次サイクル以降の reviewer が同じ問題で時間を消費しなくて済む

#### 判定の根拠

Rev2 で指摘した Minor-1（`.pageNote` の段落間マージン欠如）は独立検証で完全解消を確認。実機ブラウザでの視覚検証も今回実現し、段落分離が 12px 余白で正しく付与されていることを確認できた。修正による既存仕様への影響（既存サイトファイル不変、Google Fonts CDN 混入ゼロ、noindex/nofollow 維持、検索エンジン三層遮断維持、bundle サイズへの実質的影響なし）はいずれも問題なし。観点 A〜I すべてで Rev2 の状態を維持または改善し、悪化箇所なし。lint・format・test 4091 件・build すべて pass。

ただし Rev2 で見落としていた可能性の再点検で **Minor-1（`var(--sp-3)` fallback 欠如による一貫性違反）を新規発見**。これは同一ファイル内の他箇所すべてが fallback 付きで書かれているのに本 Rev 追加分だけ fallback なしの構造で、CLAUDE.md コーディング原則 3 に軽く触れる。実害は極小だが、Rev2 reviewer 自身が修正方向 (b) で fallback 付きを提示していた経緯から、レビュー指示の正確な反映という観点で記録する価値あり。

判定基準「Blocker / Major / Minor のいずれかが 1 件でも残れば needs_revision」に従い **needs_revision**。修正コストは 1 文字追加（`var(--sp-3, 0.75rem)`）で極小。

#### PM への提案

1. builder に Minor-1（`var(--sp-3)` への fallback 値追加）の修正作業を依頼する。修正は `page.module.css` L33 の `var(--sp-3)` を `var(--sp-3, 0.75rem)` に変更するのみで完結。修正後、dev-preview/ 配下の他 8 箇所と書き方が一致する
2. 修正後、再度 reviewer に依頼する。前回の指摘事項（本 Rev3 の Minor-1）の解消確認だけでなく、サイクル実行規約に従い T-5 全体の見直しも含めること。Minor の規模が小さいため、次回の Rev4 で T-5 を確実に pass させ、T-6（素地ディレクトリ削除）に進める状態にすることが望ましい
3. キャリーオーバー候補として記録: (a) dev-preview の twitter メタ空上書き（次サイクル以降の SNS 共有改善時）、(b) Playwright MCP browser のインストール手順を `docs/knowledge/` に記録（次サイクル以降の reviewer 効率化）

### T-5 Rev4（2026-04-27）

対象: T-5 Rev3 で検出した Minor-1（`var(--sp-3)` の fallback 欠如）の修正。`git status` / `git diff HEAD --stat` で本 Rev での修正範囲を把握したうえで、`src/app/dev-preview/page.module.css` の差分、ビルド成果物（`.next/server/app/dev-preview.html` / `.next/server/app/index.html` / `.next/server/app/robots.txt.body` / `.next/static/chunks/`）、Playwright MCP browser による実機ブラウザ視覚確認（pageHeader 領域 viewport スクショ）を独立検証した。

判定: **pass**

#### Rev3 指摘事項の解消確認（独立検証）

**Minor-1（`var(--sp-3)` の fallback 欠如）→ 解消**:

- `src/app/dev-preview/page.module.css` L33 が `margin-top: var(--sp-3);` から `margin-top: var(--sp-3, 0.75rem);` に変更された。同一ファイル内の他 6 箇所（L6 / L11 / L12 / L22 / L26 / L27）と、同じ `dev-preview/` 配下の `DevComponents.module.css` 他 3 箇所（L29 / L47 / L55）のすべてと書式が一致。CLAUDE.md「コーディング原則 3: コードベース全体で一貫性のある設計をする」充足
- ビルド成果物 `.next/static/chunks/401de35acd97b114.css` を実機 grep。`.page-module__IehQla__pageNote+.page-module__IehQla__pageNote{margin-top:var(--sp-3,.75rem)}` に minify された形で fallback 値が含まれていることを確認（`.75rem` は CSS minifier が `0.75rem` を短縮したもので、意味的に等価）
- 実機ブラウザ（Playwright MCP browser）で `http://localhost:3000/dev-preview` を viewport 1280×600 で開き、pageHeader 領域のスクショを `tmp/screenshots/2026-04-27_T-5-Rev4_dev-preview_pageHeader.png` に保存。1 文目と 2 文目の間の縦方向余白（12px）が継続して付与されており、視覚に影響を与えていないことを確認。fallback 値追加は本番環境では使われない（globals.css の `--sp-3: 12px` がルートレイアウト経由で必ず読まれるため）が、書式の一貫性が回復した
- **完全解消**

#### 観点 A〜I の差分再評価

- **A（受け入れ基準）**: `npm run build` 成功（`Compiled successfully in 17.6s`、`/dev-preview` が `○ (Static)` として静的プリレンダー）、`<meta name="robots" content="noindex, nofollow"/>` を `.next/server/app/dev-preview.html` で実機確認、`grep -rn "fonts.googleapis.com\|fonts.gstatic.com" .next/static/ .next/server/app/index.html .next/server/app/dev-preview.html` 0 件、全 8 コンポーネント配置（DevComponents.tsx 不変）、lint/format/test/build 全 pass、Storybook 不導入。**充足を維持**
- **B（既存サイトへの副作用ゼロ — 最重要）**: `git diff HEAD -- src/app/layout.tsx src/app/globals.css src/components/common/ src/components/design-system/ .claude/skills/frontend-design/` 出力 0 行（wc -l で 0 を実機確認）。本 Rev での修正は `dev-preview/page.module.css` の 1 行変更のみ。Rev1 → Rev2 → Rev3 → Rev4 の 4 回のレビューサイクルを通じて Owner 原則 4「既存サイトに手を加えない」が一貫して守られている。**充足を維持**
- **C（builder 判断の妥当性 — フォルダ名）**: Rev2 で解消済み。本 Rev で再変更なし。**充足を維持**
- **D（フォント読み込みの局所化）**: 構造に変更なし。dev-preview.html 側のみフォント preload あり、index.html 側は 0 件で再確認。**充足を維持**
- **E（検索エンジン非露出の三層遮断）**: (a) page.tsx metadata.robots → ビルド HTML noindex meta、(b) sitemap.ts 非含有、(c) robots.ts disallow → ビルド robots.txt（`/api/` と `/dev-preview/` のみ、`/_dev/` 不在）すべて実機確認。**充足を維持**
- **F（テストの品質）**: テスト数 278 ファイル / 4091 件全 pass（Rev3 と同数）。CSS のみの修正でテスト追加・削除なし。**充足を維持**
- **G（Playwright スクショの品質）**: 本 Rev でも実機ブラウザ視覚確認を実施し、pageHeader 領域の段落分離が継続していることを確認。**充足を維持**
- **H（philosophy.md NEVER 節との整合）**: 修正は CSS 変数の fallback 値追加のみで、新規テキスト・新規装飾・新規アクセントカラーなし。NEVER 節への抵触なし。**充足を維持**
- **I（ビルド成功と無副作用）**: `npm run lint` pass、`npm run format:check` pass、`npm run test` 4091 件 pass、`npm run build` 成功。実機ブラウザで console error 0 件（warning 7 件は Next.js 既知挙動で本サイクル責任範囲外）。**充足を維持**

#### Rev3 で見落としていた可能性の再点検

サイクル実行規約「再レビュー時は前回の指摘事項だけでなく全体を見直す」に従い、Rev3 で確認していなかった追加観点を再走査:

- **CSS minifier が fallback 値を保持しているか**: ビルド成果物では `var(--sp-3,.75rem)` と minify されている（`0.75rem` → `.75rem` の先頭 0 省略）。CSS 仕様上 `.75rem` は `0.75rem` と意味的に等価で、`var()` 関数の fallback 引数としても正しく機能する。問題なし
- **fallback 値 `0.75rem` の妥当性**: globals.css L218 で `--sp-3: 12px`。`0.75rem` は標準 16px ベースで `12px` と等価。`--sp-3` 変数定義値と fallback 値が等価であることが構造的に保たれている。Rev3 で確認済みだが、本 Rev でも変更なしを再確認
- **修正の局所性**: `git diff HEAD --stat` で本 Rev の差分は前回 reviewer 追記分の `cycle-170.md` と Rev1 から積み上がった `bundle-budget.test.ts` / `robots.ts` のみ。`page.module.css` は untracked（dev-preview/ 全体が一度も commit されていない）のため stat に出ないが、修正は CSS 1 行のみと builder 報告どおり

新規 Blocker / Major / Minor の検出は **なし**。

#### Blocker / Major / Minor の指摘

なし（Blocker 0 / Major 0 / Minor 0）。

#### 良かった点

- **Rev3 指摘 1 件が builder 報告どおり完全解消**: 1 文字追加（`var(--sp-3)` → `var(--sp-3, 0.75rem)`）の最小修正で、同一ファイル・同一ディレクトリ内の他 9 箇所と書式が完全一致した。レビュー指示の正確な反映
- **修正の最小性が保たれている**: `git diff` で本 Rev の修正は `page.module.css` L33 の 1 行のみ。Rev1 → Rev4 の 4 回のレビューサイクルを通じて、修正範囲が常に必要最小限に保たれており、副作用が出にくい構造
- **Rev1 → Rev4 を通じての T-5 全体の整合性**: 受け入れ基準 A.1〜A.7 すべて充足、観点 A〜I すべて充足、Owner 原則 4「既存サイトに手を加えない」が 4 回のレビューサイクルを通じて一貫して守られた。cycle-170 T-03 Rev1 Blocker B1（globals.css への `@import` で全ページに副作用）と同質の事故再発防止が構造的に達成されている
- **builder の修正トレーサビリティ**: 各 Rev の修正が「Rev2 で `_dev/` 削除 + note 追加 + keywords 上書き」「Rev3 で隣接セレクタ規則追加」「Rev4 で fallback 値追加」と段階的に積み上がり、各修正が独立してビルド成果物に反映されている。次サイクル以降の builder/reviewer が修正経緯を辿りやすい構造

#### 判定の根拠

Rev3 で指摘した Minor-1（`var(--sp-3)` の fallback 欠如）は独立検証で完全解消を確認。修正による既存仕様への影響（既存サイトファイル不変、Google Fonts CDN 混入ゼロ、noindex/nofollow 維持、検索エンジン三層遮断維持、視覚への影響なし）はいずれも問題なし。観点 A〜I すべてで Rev3 の状態を維持し、悪化箇所なし。lint・format・test 4091 件・build すべて pass。Rev3 で見落としていた可能性の再点検でも新規 Blocker / Major / Minor の検出なし。

Blocker 0 / Major 0 / Minor 0 のため **pass**。

T-5 は本 Rev4 をもって完了として確定できる状態。Rev1（needs_revision: 3 Minor）→ Rev2（needs_revision: 1 Minor）→ Rev3（needs_revision: 1 Minor）→ Rev4（pass）の 4 回のレビューサイクルを経て、plan T-5 受け入れ基準と Owner 原則 1〜12 への整合がすべて達成された。

#### PM への提案

1. T-5 を完了として確定。T-6（素地ディレクトリ `docs/design-system-by-claude-design/` の物理削除）に進める状態
2. キャリーオーバー候補として継続記録: (a) dev-preview の twitter メタ空上書き（次サイクル以降の SNS 共有改善時）、(b) Playwright MCP browser のインストール手順を `docs/knowledge/` に記録（次サイクル以降の reviewer 効率化）。これらは本サイクルの受け入れ基準には含まれず、次サイクル以降の検討事項

### T-6 Rev1（2026-04-27）

対象: T-6 が staged 状態で残した素地ディレクトリ `docs/design-system-by-claude-design/` の物理削除（`git status` 上で `deleted:` 24 ファイルが staged）。`tmp/cycle-170-asset-migration-map.md` 全 26 エントリの取り込み済み確認、リポジトリ全体の禁止語残存確認、ビルド・テスト・lint・format の 4 系統 pass、ビルド成果物への外部リクエスト混入ゼロ確認、を独立検証した。builder 自己評価は読まず、`git status` / `git grep` / `ls` / `find` / `npm run` で実状態のみを根拠に判定した。

#### 判定: pass（Blocker 0 / Major 0 / Minor 0）

#### 観点別所見

- **A1（取り込みマップ全 26 エントリの取り込み済み確認）**: `tmp/cycle-170-asset-migration-map.md` を独立 Read。#1（README.md → philosophy.md）は `.claude/skills/frontend-design/philosophy.md`（110 行）に存在し、yolos.net 5 ターゲット視点と NEVER 節で再構成されていることを通読確認。#2（SKILL.md → SKILL.md）は `.claude/skills/frontend-design/SKILL.md`（63 行）に frontmatter `name: frontend-design` / `user-invocable: false` で再構成済みを確認。#3（colors_and_type.css → globals.css）は `globals.css` 内に Surface×5（`--bg` / `--bg-soft` / `--bg-softer` / `--bg-invert` / `--bg-invert-soft`）/ Text×5（`--fg` / `--fg-soft` / `--fg-softer` / `--fg-invert` / `--fg-invert-soft`）/ Border×2（`--border` / `--border-strong`）/ Accent×3（`--accent` / `--accent-strong` / `--accent-soft`）/ Type Scale 11 件（`--fs-12`〜`--fs-60`）/ Spacing 9 件（`--sp-1`〜`--sp-9`）/ Elevation（`--elev-0` / `--elev-1` / `--elev-2` / `--elev-button` / `--elev-dragging`）/ Motion がすべて存在することを `grep -nE "^\s*--"` で 144 件確認、素地カテゴリと欠落なく対応。#4・#5（ロゴ）は `public/assets/yolos-logo.svg` / `public/assets/yolos-mark.svg` に T-4 で `git mv` 済み（commit `8b9a083d`）であり、本タスクの staged 削除対象外。#6〜#18（preview HTML 13 件）と #23・#26（プロトタイプ HTML 2 件）は「削除のみ」方針のため取り込み先実在確認は不要。#19・#20・#22・#25（コードレベル吸収 4 件）は `src/components/design-system/` 配下に 8 コンポーネント（ArticleArea / Button / Input / Panel / SectionHead / SiteFooter / SiteHeader / Textarea）+ `__tests__` が実在することで担保（Rev T-3 / T-4 で個別確認済）。#21・#24（UI Kit README → コンポーネント API ドキュメント）は plan の構成に沿い「JSDoc + TypeScript 型を `src/components/design-system/` 内に書く」方針で SKILL.md L36-39 に道案内が書かれており、別 .md を立てない判断と整合。**取り込み完了**。

- **A2（`git rm -r` での削除）**: `git status` で `Changes to be committed:` 配下に 24 件の `deleted:` 行を確認。`git diff --staged --stat` で削除行数 3198 行（README 210 / SKILL 46 / colors_and_type.css 242 / preview HTML 13 件 / `_shared.css` 288 / `_shared.jsx` 171 / tool-page 3 件 / toolbox 3 件）。`ls docs/design-system-by-claude-design/` は "No such file or directory" で物理削除完了。staged 削除 24 件 + ロゴ 2 件（T-4 で `git mv` 済）= 取り込みマップ全 26 件と完全一致。**満たす**。

- **A3（リポジトリ全体に禁止語残存ゼロ）**: `git grep -nE "design-system-by-claude-design|yolos-design|yolos-ds"` を実行。ヒットは `docs/backlog.md` L7（B-308 説明文）と `docs/cycles/cycle-170.md` 多数（plan 本文 L3 / L16 / L56 / L105 / L110 / L165 / L198 / L369 / L382 と過去 Rev レビュー記録）のみ。各ヒットを 1 件ずつ判定: backlog.md L7 は B-308 入力素材として「素地ディレクトリの存在」を経緯記録するための言及で、削除後も B-308 着手の経緯として将来も意味を持つ正当な参照。cycle-170.md は本サイクルの計画・レビュー記録としての過去経緯参照で正当（plan 本体側でも「素地は削除する」前提で禁止語を記述しており残存させる必要がある）。動作中ファイル（`src/` / `.claude/skills/` / `.claude/agents/` / `next.config.*` / `tsconfig.json` / `package.json` / `README.md` / `globals.css`）への参照はゼロ。さらに `.next/static/css/*.css` / `.next/static/chunks/` への混入も `grep -rE` でゼロ確認。**満たす**。

- **A4（独立 commit になる準備）**: 本タスクの削除はまだ未コミット（staged 状態）。staged 内容は素地配下 24 件の deleted のみで他のファイル変更が混在していない（`git status --porcelain` で staged 削除以外の変更ゼロ）ため、PM が `git commit` した時点で「素地削除のみ」の独立コミットになる。commit message に取り込み完了の経緯（取り込みマップ参照、ロゴは T-4 で `git mv` 済）を書ける状態。**満たす**。

- **B（取り込み完了の証跡 — 内容ベース照合）**: 素地 `colors_and_type.css` のカテゴリ別件数（Surface 5 / Text 5 / Border 2 / Accent 3 段 / Type Scale 11 / Spacing 9 / Radius 5 / Elevation 5 / Motion 5）を `globals.css` 内で `grep` 照合し、すべて取り込み済みを件数ベースで確認。素地 README.md の哲学的記述（トーン・ビジュアル指針・アイコン方針）は philosophy.md L1-110 に「Named Aesthetic Tone: functional-quiet」「5 ターゲットへの効き方」「NEVER 節」として再構成済み（章立ては素地を引きずらず yolos.net 視点で書き直されており Rev1 方針と整合）。素地 SKILL.md の Quick reference / Quick rules / ファイルインデックスは SKILL.md L23-50 に再構成済み。素地 `_shared.css` の `.btn` / `.tag` / `.chip` / `.yo-header` / `.yo-footer` 等のスタイルは `src/components/design-system/` 配下の 8 コンポーネント `.module.css` に吸収済み（Rev T-3 / T-4 で個別検証済）。**「形式的存在のみで内容欠落」のケースは検出されず**。

- **C（副作用と全体への影響）**: T-1〜T-5 の成果物（`philosophy.md` / `SKILL.md` / `globals.css` / `src/components/design-system/` / `src/app/dev-preview/` / `public/assets/`）に `git status` 上の意図せざる変更ゼロ（staged は素地配下削除のみ）。`tmp/cycle-170-asset-migration-map.md` も変更されていない（`git status --porcelain` で modified なし）。`docs/cycles/cycle-170.md` も本タスクで内容変更されていない。`npm run lint` / `npm run format:check` / `npm run test` / `npm run build` を本 Rev で実行し、すべて成功（lint クリーン、format All matched files use Prettier code style、テスト 278 ファイル 4091 件 pass、build 完走）。ビルド成果物に Google Fonts CDN 混入ゼロ確認（前 plan T-03 Rev1 Blocker B1 の再発なし）。**問題なし**。

- **D（cycle ドキュメント参照の正当性）**: backlog.md L7 の `docs/design-system-by-claude-design/` 参照は B-308 着手経緯として将来も意味を持つ。cycle-170.md / cycle-169.md 内の参照は失敗サイクル経緯と再挑戦経緯として将来も意味を持つ（cycle-169 は失敗クローズ済、cycle-170 は本サイクルの記録）。**残置に問題なし**。

- **E（削除取りこぼしの最終確認）**: `ls docs/design-system-by-claude-design/` 結果 "No such file or directory" でディレクトリ自体が消滅。サブディレクトリ（`assets/` / `preview/` / `ui_kits/tool-page/` / `ui_kits/toolbox/`）も連動消滅。`.gitkeep` 等の隠しファイルは元から存在せず（git は空ディレクトリを追跡しないため、staged 削除 24 件 + T-4 ロゴ移動 2 件で全 26 ファイルが処理済み、空ディレクトリ残存なし）。**取りこぼしなし**。

- **F（Owner 原則との整合）**: 原則 4（既存サイトに手を加えない）— 削除対象は素地ディレクトリのみで site routing には元から組み込まれていない（`src/app/` / `src/components/common/` / `next.config.*` 等への変更ゼロ）、ビルド完走も既存サイトへの影響ゼロを担保。原則 6（素地は本サイクル内で削除）— 本タスクの staged 状態で達成（PM の commit で完了）。原則 9（無意味な複雑さを持ち込まない）— 削除後に冗長な関連ファイルなし、`docs/design-system-by-claude-design/` への参照も backlog/cycle 記録のみで動作経路への残存ゼロ。原則 10（skill は将来にわたって使い続けるもの）— 削除前に取り込み完了確認済（philosophy.md / SKILL.md / globals.css / src/components/design-system/ / public/assets/ がすべて将来恒久参照される配置）。**全原則充足**。

#### 評価できる点

- **取り込み完了 → 削除 の順序が厳格に守られている**: 取り込みマップ 26 エントリすべてが取り込み済みである状態を独立 grep / Read で件数ベースで確認できる。「ファイルを消したが情報も消えた」というアンチパターンが構造的に発生しない設計。
- **commit を独立にできる staged 状態**: staged 内容が素地配下 24 件 deleted のみで他変更が混在していないため、PM の `git commit` 時に「素地削除のみ」の独立コミットを作れる。git 履歴で素地の出自を辿れる状態（ロゴは `git mv` で履歴連続性も担保）が維持される。
- **ビルド・テスト 4091 件 pass の維持**: 大規模な削除作業にもかかわらず既存サイトへの副作用ゼロが実機検証で担保されている。Google Fonts CDN 混入ゼロも `.next/static/css/*.css` / `.next/static/chunks/` への grep で再確認済。
- **過去経緯参照の正当性**: 残存する禁止語ヒット（backlog.md L7 / cycle-170.md / cycle-169.md）はすべて「過去サイクル経緯としての記録」であり、削除後も意味を持ち続ける。動作経路（src / 設定 / skill / agent）への残存ゼロが確認できているため、進化乖離リスクは断たれている。

#### 判定の根拠

T-6 受け入れ基準 4 項目すべて pass:

1. 取り込みマップ全エントリ取り込み済み → 26 件すべて独立確認（A1 / B）
2. `git rm -r` で素地配下削除 → staged 24 件 + T-4 ロゴ 2 件 = 全 26 件処理済（A2）
3. リポジトリ全体に禁止語残存ゼロ（動作中ファイル基準）→ `git grep` で動作経路ゼロ、cycle/backlog 記録のみ残存で正当性確認済（A3）
4. 削除コミットが独立 commit になる準備 → staged 内容は素地削除のみで PM commit 時に独立化可能（A4）

副作用検証（C）も lint / format / test / build / 外部リクエスト混入チェックすべて pass。Owner 原則 4 / 6 / 9 / 10 すべて充足（F）。Blocker / Major / Minor すべて 0 件のため **pass**。

#### PM への提案

1. T-6 を完了として確定。staged 状態のまま `git commit` を実行し、commit message には「取り込み完了 → 素地削除」の経緯（取り込みマップへの参照、ロゴは T-4 で `git mv` 済の補足）を記載すること
2. T-7（サブエージェント configuration 配線）に進める状態
3. キャリーオーバー候補として追加なし（T-6 は素地削除のみで、後続作業を生まない）

### T-7 Rev1（2026-04-27）

対象: `.claude/agents/builder.md` と `.claude/agents/reviewer.md` の system prompt 追記（層 3 の二重経路強化）。`git diff HEAD` で変更範囲が builder.md L21-22（2 行追記）と reviewer.md L22（1 行追記）の合計 +4 行のみであることを確認したうえで、独立に Read / grep で内容検証した。builder 自己評価は読まず、plan T-7 受け入れ基準（cycle-170.md L117-121）を 1 項目ずつ実ファイルと照合する形で判定した。

#### 判定: needs_revision（Blocker 0 / Major 1 / Minor 1）

#### 観点別所見

- **A（受け入れ基準の独立検証）**: 受け入れ基準 1（builder 趣旨）— `.claude/agents/builder.md` L21 に「UI コンポーネント（`src/components/` 配下の `.tsx`）または UI 系 CSS（`src/**/*.module.css`、`src/app/globals.css`）を編集する前に、必ず `.claude/skills/frontend-design/SKILL.md` と `.claude/skills/frontend-design/philosophy.md` を参照してください」と明記、L22 に「色・角丸・余白の値を新規にハードコードしないでください」と明記。趣旨は含まれるが**変数名例示が誤り**（後述 D）。受け入れ基準 2（reviewer 趣旨）— L22 に「philosophy.md の NEVER 節に記載されている視覚表現の禁止事項に違反していないか、および Named Tone `functional-quiet`（装飾より機能・対比より余白）から逸脱していないかを確認してください」と明記、Named Tone 名と意味注記まで含み判断粒度として十分。受け入れ基準 3（hooks/Stylelint 新規導入なし）— `git diff HEAD --name-only` の変更は builder.md と reviewer.md の 2 ファイルのみ、`.claude/hooks/` / `.claude/settings.json` / package.json への変更ゼロを確認、満たす。受け入れ基準 4（frontmatter `skills:` 追加なし）— builder.md / reviewer.md ともに frontmatter（L1-11 / L1-13）への変更ゼロを diff で確認、満たす。

- **B（文面品質と機能性）**: builder L21 は対象パスの globパターンを明示し、参照すべきファイル名をフルパスで書いており、subagent が「いつ」「何を」読むか明確に判断できる粒度。reviewer L22 は philosophy.md の節名（NEVER 節）と Named Tone 名（functional-quiet）と意味注記（装飾より機能・対比より余白）まで埋め込まれており、subagent が単独でも判断基準を持てる。既存 system prompt の文体（です・ます調、段落単位の追記）と整合し追記が浮いていない。**ただし builder L22 後段の変数名例示が事実誤認**（後述 D）。

- **C（二重経路の整合）**: 層 2（skill `paths` グロブ）は `src/**/*.tsx` / `src/**/*.module.css` / `src/app/globals.css` を含む（SKILL.md frontmatter L11-13 で確認）。層 3（builder.md L21）も同じ範囲を文面で再指定。**範囲が完全に同じ**で重複ではあるが、「skill が起動しなかった場合の保険」として相補的に機能するため矛盾はない。reviewer 側は層 2 がレビュー時点で起動するかが不確実な経路（reviewer は CSS を Edit するわけではない）を踏まえ、philosophy.md を文面で名指しすることで層 3 が必要な役割を担っている。過剰指示・矛盾指示なし。

- **D（CSS 変数名の正確性）— Major-1**: `.claude/agents/builder.md` L22 で例示されている `--radius-*` / `--space-*` は **`src/app/globals.css` に存在しない**。実在するのは角丸 `--r-normal` / `--r-interactive` の 2 値のみ（globals.css L226-233）と、スペーシング `--sp-1`〜`--sp-9`（L213-224）。`grep -nE "radius|space" src/app/globals.css` でも `--radius-*` / `--space-*` プレフィックスのヒットはゼロ。subagent はこの system prompt を読んで `var(--radius-md)` / `var(--space-4)` のような存在しない変数で CSS を書く危険があり、ビルドは通っても無効値として無視され UI が崩れる実害につながる。さらに T-3 / T-4 で実装済みの `src/components/design-system/` 配下のコンポーネントは `--r-*` / `--sp-*` を使用しているはずなので、builder が誤った変数名で新規作成すれば「既存実装と命名が食い違う」逆方向の二重管理を生むリスクもある。`--bg-*` / `--fg-*` は実在するが「`*`（ワイルドカード）」表現は読み手にサフィックス（`-soft` / `-softer` / `-invert` / `-invert-soft`）を補完して読ませる構造で、実害は相対的に小さい。**変数名プレフィックス `--radius-*` / `--space-*` の事実誤認は Major**。

- **E（副作用と全体への影響）**: frontmatter（builder.md L1-11 / reviewer.md L1-13）への変更ゼロ、`name` / `description` / `tools` / `model` / `permissionMode` / `mcpServers` すべて無変更。他の subagent（planner / researcher / blog-writer / code-researcher / web-researcher / claude-code-guide / statusline-setup）への変更ゼロ（`git diff HEAD --name-only` で確認）。skill ファイル（SKILL.md / philosophy.md）への変更ゼロ。`src/app/globals.css` / `src/components/` / `.claude/settings.json` / `.claude/hooks/` への変更ゼロ。subagent .md は CI 対象外でビルド・lint・テストへの直接影響なし。**問題なし**。

- **F（Owner 原則との整合）**: 原則 2（シンプル）— builder 2 行・reviewer 1 行と最小限。原則 9（無意味な複雑さを持ち込まない）— 追記は機能（UI 編集前の skill 参照、UI レビュー時の哲学参照）と直結。原則 10（skill は将来にわたって使い続けるもの）— 追記文面に「T-7」「cycle-170」等のサイクル固有語の混入なし。**ただし変数名プレフィックスを system prompt にハードコードする形式そのものが原則 11（二重管理回避）の精神と緊張**: globals.css の命名が将来変わった瞬間に subagent prompt が嘘を書く構造になる。SKILL.md は既に「値と変数を参照するとき → globals.css を直接読む」と書いており、subagent prompt は「globals.css に定義された CSS 変数を使う」までで止め、具体プレフィックス列挙は SKILL.md / globals.css 側に任せる方が原則 11 と整合する。Minor-1 として指摘。

#### 指摘事項

- **Major-1（D 観点 — 存在しない CSS 変数名の埋め込み）**: `.claude/agents/builder.md` L22 の `--radius-*` / `--space-*` は実在しない。実在するのは `--r-normal` / `--r-interactive`（角丸 2 値）と `--sp-1`〜`--sp-9`（スペーシング）。subagent が誤った変数名で CSS を書く実害が出るため修正必須。修正方針（builder 判断）の例: (1) 実在する変数名に置換（`--r-*` / `--sp-*` 等）、(2) もしくは変数プレフィックスの列挙をやめ、SKILL.md にあるカテゴリ名（Surface / Text / Border / Accent & Status / フォント / タイプスケール / 行送り / 字間 / スペーシング / 角丸 / Elevation / モーション）を「これらのカテゴリの CSS 変数を使う」とまとめて指す。後者は Minor-1 とも一体で解消できるため推奨。

- **Minor-1（F 観点 — 変数名プレフィックス直書きの二重管理リスク）**: 仮に Major-1 を実在変数名に置換しても、subagent prompt 内に変数名プレフィックスを列挙すると、`globals.css` の命名が変わった瞬間に subagent prompt が嘘を書くリスクが残る。原則 11（二重管理回避）の精神と緊張する。Major-1 の修正方針 (2) を採れば一体で解消できる。

#### 評価できる点

- 参照先パスがフルパスで正確（`.claude/skills/frontend-design/SKILL.md` / `.claude/skills/frontend-design/philosophy.md` ともに実在を Read で確認）。
- 対象パス glob が層 2（skill `paths`）と一致しており、subagent が読み飛ばしにくい範囲指定になっている。
- reviewer 追記は philosophy.md の節名と Named Tone 名と意味注記まで埋め込まれており、subagent が単独でも判断粒度を持てる。
- frontmatter / 他 subagent / skill / globals.css / hooks / settings への副作用ゼロが diff で機械的に担保されている。

#### 判定の根拠

T-7 受け入れ基準 4 項目のうち 3 項目（基準 2・3・4）は満たす。基準 1（builder 趣旨）は 2 つのサブ趣旨のうち 1 つ目（UI 編集前に SKILL.md と philosophy.md を参照）は満たすが、2 つ目（色・角丸・余白を新規にハードコードしない、globals.css の新変数を使う）の例示変数名が事実誤認で、subagent が信じれば実害が出る。**Major 1 件残るため needs_revision**。

#### PM への指示

1. builder に修正作業を依頼してください。Major-1 の修正は必須（存在しない `--radius-*` / `--space-*` の例示を、実在変数名に置換するか、SKILL.md のカテゴリ名参照に書き換える）。Minor-1 と一体での対応（変数名プレフィックス列挙を削り、globals.css のセクション名・カテゴリを参照する形に書き換える）を推奨します。
2. 修正後、再度レビューを依頼してください。前回指摘事項だけでなく全体の見直し（builder.md / reviewer.md の追記の整合・参照先パス正確性・他 subagent や skill / globals.css / hooks / settings への意図せぬ波及がないこと）を含めてください。

### T-7 Rev2（2026-04-27）

対象: Rev1 の Major-1 / Minor-1 を受けた `.claude/agents/builder.md` L22 の文面修正のみ。`.claude/agents/reviewer.md` は Rev1 で pass のため未変更。`git diff HEAD` で変更範囲が builder.md（L21-22 の 2 行追記）と reviewer.md（L22 の 1 行追記、Rev1 と同一）の合計 +4 行のみで、frontmatter / 他 subagent / skill / globals.css / hooks / settings への波及ゼロを独立確認した。

#### 判定: pass（Blocker 0 / Major 0 / Minor 0）

#### 観点別所見

- **Major-1 / Minor-1 の解消確認**: 修正後の builder.md L22 は「色・角丸・余白の値を新規にハードコードしないでください。`src/app/globals.css` に定義されている CSS 変数を使ってください（具体的な変数名・カテゴリは `.claude/skills/frontend-design/SKILL.md` の道案内に従って `globals.css` を直接参照してください）。」となり、Rev1 で問題化した `--radius-*` / `--space-*` を含む変数名プレフィックスの列挙が完全に消去された。`grep -nE "radius|space" .claude/agents/builder.md` の結果はヒットゼロで、存在しない変数名が prompt 内に残っていないことを機械的に確認。Major-1 は構造的に解消。

- **二重管理の構造的解消（Minor-1）**: subagent prompt は値・変数名・プレフィックスのいずれも保持せず、単一情報源（`globals.css` のセクションコメント L106-259）と道案内（`SKILL.md` L30-35「値と変数を参照するとき」）に委ねる形に変わった。SKILL.md L33 は「ここには変数名も値も書かない。globals.css のコメントが単一情報源であり、ここに対応表を置くと二重管理になる」と既に明記されており、subagent prompt → SKILL.md → globals.css の参照線が単方向で破綻なく繋がる。原則 11（二重管理回避）と完全整合。`globals.css` の命名が将来変わっても subagent prompt は嘘を書かない構造になった。

- **A（受け入れ基準）**: 基準 1（builder 趣旨）— 2 つのサブ趣旨のうち 1 つ目「UI 編集前に SKILL.md と philosophy.md を参照する」は L21 で保持、2 つ目「色・角丸・余白を新規にハードコードしない、globals.css の新変数を使う」は L22 で保持（前段で「ハードコードしない」明記、後段で「globals.css の CSS 変数を使う」明記）。基準 2（reviewer 趣旨）— Rev1 から不変で満たす。基準 3（hooks/Stylelint 新規導入なし）— diff の変更ファイルは builder.md / reviewer.md / cycle-170.md（前 Rev レビュー記録）のみで満たす。基準 4（frontmatter `skills:` 追加なし）— builder.md L1-11 / reviewer.md L1-13 への変更ゼロを diff で確認、満たす。**4 項目すべて pass**。

- **B（文面品質と機能性）**: 修正後文面「具体的な変数名・カテゴリは SKILL.md の道案内に従って globals.css を直接参照してください」は、subagent が「いつ（UI 編集前）」「どこを（SKILL.md → globals.css）」読むかを明確に伝える。冗長になっておらず、既存 system prompt の文体・トーンとも整合。Rev1 と比べて品質低下はなく、むしろ「単一情報源を参照する」という設計意図が文面に明示された分だけ向上している。SKILL.md の参照節（L30-35）には Surface / Text / Border / Accent & Status / フォント / タイプスケール / 行送り / 字間 / スペーシング / 角丸 / Elevation / モーションのカテゴリ列が書かれており、subagent はそこから globals.css へ自然に降りていける。

- **C（二重経路 — 層 2 + 層 3 の整合）**: 層 2（skill `paths` グロブ）の `src/**/*.tsx` / `src/**/*.module.css` / `src/app/globals.css` と、層 3（builder.md L21）の文面範囲が一致する構造は Rev1 から不変。矛盾・過剰指示なし。

- **D（CSS 変数名の正確性）**: 列挙されていた誤った変数名が削除された結果、subagent prompt 内に「事実誤認しうる場所」が構造的に存在しなくなった。grep でも `radius` / `space` のヒットゼロ。**Rev1 の Major-1 は完全解消**。

- **E（副作用と全体への影響）**: `git diff HEAD --name-only` の結果は `.claude/agents/builder.md` / `.claude/agents/reviewer.md` / `docs/cycles/cycle-170.md` の 3 ファイルのみ。frontmatter（builder.md L1-11 / reviewer.md L1-13）への変更ゼロ、`name` / `description` / `tools` / `model` / `permissionMode` / `mcpServers` すべて無変更。他の subagent（planner / researcher / blog-writer / code-researcher / web-researcher / claude-code-guide / statusline-setup）への変更ゼロ。skill ファイル（SKILL.md / philosophy.md）への変更ゼロ。`src/app/globals.css` / `src/components/` / `.claude/settings.json` / `.claude/hooks/` への変更ゼロ。subagent .md は CI 対象外でビルド・lint・テストへの直接影響なし。**問題なし**。

- **F（Owner 原則との整合）**: 原則 2（シンプル）— builder 2 行・reviewer 1 行と最小限。原則 9（無意味な複雑さを持ち込まない）— 追記は機能（UI 編集前の skill 参照、UI レビュー時の哲学参照）と直結。原則 10（skill は将来にわたって使い続けるもの）— 追記文面に「T-7」「cycle-170」等のサイクル固有語の混入なし。原則 11（二重管理回避）— Rev1 で残っていた「変数名プレフィックスの直書き」が削除され、subagent prompt は値も変数名も持たず単一情報源に委ねる形になった。**全原則充足**。

- **reviewer.md の不変確認**: `git diff HEAD -- .claude/agents/reviewer.md` で Rev1 と完全に同一の差分（L22 への 1 行追記のみ）であることを独立確認。Rev1 で pass 評価された内容が無変更で維持されている。

- **新規問題の有無**: 修正で導入された「`.claude/skills/frontend-design/SKILL.md` の道案内に従って `globals.css` を直接参照してください」という文言が SKILL.md の実態（L30-35 の「値と変数を参照するとき」節 + セクション構成リスト）と整合することを Read で確認済。括弧書きで補足として置かれており読み手にとって自然な構造。新規問題は検出されず。

#### 評価できる点

- **Rev1 の Major-1 / Minor-1 を一体で解消**: 単純に変数名を実在名に置き換える対症療法ではなく、「subagent prompt に変数名を書かない」という構造的解決を採った。原則 11（二重管理回避）と整合し、将来 globals.css の命名が変わっても subagent prompt が破綻しない設計になった。
- **修正範囲を最小に保っている**: 修正は builder.md L22 の 1 行のみ。Rev1 で pass 評価された reviewer.md と builder.md L21 には手を入れず、回帰リスクを最小化している。
- **参照線が単方向で完結**: subagent prompt → SKILL.md → globals.css の参照線が単方向で、SKILL.md は既に「ここには変数名も値も書かない」と明記しているため、3 層に渡って単一情報源原則が貫徹される。

#### 判定の根拠

T-7 受け入れ基準 4 項目すべて pass（A 観点）。Rev1 で残っていた Major 1 件と Minor 1 件は構造的に解消（D / Minor-1 観点）。副作用検証（E）も他ファイルへの波及ゼロ。Owner 原則 2 / 9 / 10 / 11 すべて充足（F）。reviewer.md の Rev1 不変も確認済。新規問題なし。Blocker / Major / Minor すべて 0 件のため **pass**。

#### PM への提案

1. T-7 を完了として確定。`.claude/agents/builder.md` と `.claude/agents/reviewer.md` の変更を 1 つの commit にまとめて記録すること（subagent configuration へのデザインシステム参照ルール埋め込みという単一の意図にまとまっているため）。
2. T-8（PM 完了処理）に進める状態。
3. キャリーオーバー候補として追加なし（T-7 は subagent 配線の最小追記のみで、後続作業を生まない。次サイクル送りの「サブエージェント `skills:` フィールド導入の効果検証」は plan 完成の定義 L131 に既に列挙されている）。

## キャリーオーバー

本サイクルでは設計と素材の整備までで、実サイトへの段階反映や効果検証は次サイクル以降に持ち越す。`docs/backlog.md` への登録対象は以下のとおり。

### 次サイクル以降の課題

1. **ダーク変数の定義**: 本サイクルの新変数群（Surface・Text・Border・Accent/Status 等）はライトのみ。`:root.dark` ブロックへのダーク値の追加と WCAG AA（テキスト 4.5:1 / UI 3:1）コントラスト検証を別 1 サイクルで切り出す。
2. **`--color-*` から新変数への段階置換**: 既存 `--color-*` 1,800+ 箇所参照を新変数（`--bg-*` / `--fg-*` / `--accent-*` 等）へ段階的に置換する。新コンポーネントの利用範囲を広げ → 既存ファイルを 1 つずつ新変数に置換 → 最終的に `--color-*` を新変数のエイリアスに変えるロードマップ。
3. **Header/Footer 2 系統併存の解消**: 本サイクル完了時点で `src/components/common/Header.tsx` `Footer.tsx`（実サイト稼働中）と `src/components/design-system/SiteHeader.tsx` `SiteFooter.tsx`（未接続）が並走している。次サイクルで実サイト接続して旧版を削除する。
4. **ロゴアセットの実サイトへの読み込み配線**: T-4 で `public/assets/yolos-{logo,mark}.svg` に移動済だが、実サイトからの読み込みは未配線。次サイクルでヘッダー差し替え時に同時実施。
5. **サブエージェント `skills:` フィールド導入の効果検証**: 本サイクルでは `paths` グロブ（層 2）+ system prompt 直書き（層 3）の 2 層配線のみ採用。`skills:` フィールド（層 1）の効果は次サイクル以降で測定してから判断。
6. **サードパーティ CSS 導入時の変数名衝突再評価**: Tailwind / shadcn 等の導入議論が起きた時点で、現在の prefix なし命名（`--bg`, `--fg`, `--accent` 等）と衝突しないかを再評価する。衝突が観測された／導入予定ライブラリが同名を提供する、のいずれかの条件で prefix 付きへの rename を検討。
7. **dev-preview の Twitter / OGP メタの空上書き**: 本サイクルでは `keywords: []` のみ空配列上書き。`twitter:*` / `og:*` 系もルートレイアウトから継承される状態だが、noindex/nofollow なので実害ゼロ。次サイクルで余裕があれば整える。
8. **`docs/knowledge/` への Playwright MCP browser インストール手順記録**: T-5 Rev3 で reviewer が `npx @playwright/mcp install-browser chrome-for-testing` でインストールした手順を knowledge base に残すと、次サイクル以降の reviewer 効率化に貢献する。

### Header/Footer 2 系統併存期間中の運用注記

`src/components/design-system/SiteHeader.tsx` および `SiteFooter.tsx` のファイル冒頭 JSDoc に「現在の本番実装は `src/components/common/` 配下、本ファイルは次サイクルでの差し替え候補」を明記済み。次サイクルで差し替えが完了したら、これらの 2 系統併存に関する JSDoc 注記は削除すること。

## 補足事項

- **cycle-169 からの引き継ぎ事項**:
  - 本タスク（B-308）は cycle-169 で失敗サイクルとしてクローズされた。失敗の経緯と原因分析は `docs/cycles/cycle-169.md` の「## 失敗サイクルとしてのクローズ — 経緯と分析」節に詳述されている。本サイクル開始時点で PM は同節を通読済み
  - cycle-169 D.1 で記録された有効な成果物（調査レポート 6 本、デザインコンセプト「静かに傍にある」、ターゲット定義 5 ファイルからの「願いの形」抽出）は本サイクルで活用できる素材として継承する
  - cycle-169 D.3 の踏まえるべき原則（設計順序：ガイドライン→色・コンポーネント、ペルソナ化禁止、character.md 核心の実行）は本サイクルでも有効
- **本サイクルと cycle-169 の差分**: cycle-169 開始時点では Owner からの具体的なスコープ指示がなく、PM が自律で構造を決めようとして破綻した。本サイクルは Owner から明確なスコープ指示（成果物の置き場所、対象コンポーネントの粒度、サイトへの反映を本サイクル外とする旨）が与えられた状態で始まる

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
