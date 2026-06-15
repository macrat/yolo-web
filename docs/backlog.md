## Active (進行中)

| ID | Title | Priority | Target Cycle | Notes |
| --- | --- | --- | --- | --- |
| _(なし)_ | | | | |

## Queued (すぐに着手できる)

| ID | Title | Priority | Target Cycle | Notes |
| --- | --- | --- | --- | --- |
| ~~B-514~~ | ~~PostToolUse整形フックが .prettierignore を貫通する恒久修正~~ | - | - | 取り下げ(cycle-246実測): 現環境で ignore は尊重され backlog.md は整形されない=AP-WF21 誤診。詳細 cycle-246.md |
| B-502 | タイルレジストリ／型契約の再設計（全ツールの同一性を構造で強制） | P2 | - | タイル一覧を単一ソース化し詳細＝道具箱の同一実装を型で強制。着手: B-497残ツールのライブタイル化と並行で必要時。詳細 cycle-226.md・knowledge/tile-architecture.md |
| B-512 | next.config redirects のコメント表記を「301」→「308」に統一 | P4 | - | permanent:true は実際 HTTP 308 を返すが games/quiz/colors/cheatsheets 等のコメントが「301」と誤記。挙動は正。コメント/ドキュメント文言のみ是正。詳細 cycle-243.md M-1 |
| B-491 | アンチパターン集のルール違反項目を手順書／knowledge へ整理 | P2 | - | AP集のルール違反項目を手順書／knowledge へ整理。詳細 docs/cycles/cycle-220.md |
| B-435 | QR コードツールへの種別タブ追加（URL / テキスト / Wi-Fi） | P4 | - | URL/テキスト/Wi-Fi種別タブ追加(1サイクル規模)。実測でPV0・流入皆無のためP3→P4降格。詳細 cycle-246.md・cycle-207.md |
| B-437 | QR コードツールに SVG ダウンロードボタンを追加 | P4 | - | SVG DLボタンを小規模追加(0.2サイクル)。実測でQRページPV0・流入皆無のためP3→P4降格。詳細 cycle-246.md・cycle-207.md |
| B-438 | T1 / T2 search_intents 全体棚卸し | P3 | - | yaml の古さ・未掲載クエリを実測付きで棚卸し（1サイクル）。詳細 docs/cycles/cycle-207.md |
| B-439 | QR コード装飾機能の提供可否再検討（観測トリガー駆動） | P5 | - | QR装飾機能の提供可否を観測トリガー到達時に再検討。詳細 docs/cycles/cycle-207.md |
| B-441 | QR コード DL ファイル名の連番回避策 | P4 | - | DLファイル名をハッシュ/タイムスタンプ付きにし連番回避。詳細 docs/cycles/cycle-207.md |
| B-385 | about ページの OGP 画像新規作成 | P4 | - | /about の OGP 画像（opengraph-image/twitter-image.tsx）を新規作成。privacy パターン参照。着手条件なし |
| B-387 | 一覧ページの OGP 画像棚卸し・新規作成 | P4 | - | 一覧系4ルート（/play・/tools・/blog・/）の OGP 画像未整備を新規作成。詳細 docs/cycles/cycle-182.md |
| B-388 | Pagination コンポーネント本体の 44px タップターゲット化 | P4 | - | .pageItemを44px化しa11y達成。実測で2ページ目到達0PV・ほぼ未使用のためP3→P4降格(a11y価値は残る)。詳細 cycle-246.md・cycle-183.md |
| B-390 | AP 集全項目のガイド混入監査と事後検証質問形への統一 | P3 | - | docs/anti-patterns/ 全項目のガイド混入（命令形等）を事後検証質問形に統一。詳細 docs/cycles/cycle-183.md §B-390 |
| B-316 | サイト全体の URL 構成の見直し | P2 | - | /play 等の旧コンセプト URL を新コンセプト「道具と息抜き」に再設計 |
| B-317 | 時間関係ツールの追加 | P2 | - | 時間管理・計測ツール群（タイマー・ストップウォッチ等）を追加。詳細 docs/tools-idea.md |
| B-318 | 画像を共有用に整えるワークフローツール | P3 | - | 写真をSNS/LINE共有前に安全・見栄え良く整える1ページWF（AI風ツール調査2026-05-05起票）。詳細 docs/tools-idea.md |
| B-319 | 動画/音声を共有用に整えるワークフローツール | P3 | - | 動画・音声を共有しやすく整える1ページWF（AI風ツール調査2026-05-05起票）。詳細 docs/tools-idea.md |
| B-320 | 計算・変換関係ツールの追加 | P2 | - | 計算・単位変換ツール群（パーセント計算・通貨換算等）を追加。詳細 docs/tools-idea.md |
| B-321 | テキスト・文章関係ツールの追加 | P2 | - | 文章作成向けテキスト系ツール群（読了時間推定・原稿用紙換算等）を追加。詳細 docs/tools-idea.md |
| B-323 | SEO・サイトマップの更新 | P2 | - | 実測再検証(2026-06-15)で旧前提「ツール系へ刷新」は逆転、診断/四字熟語/色系が強い。四字熟語CTRは B-515 へ分離。残: 強コンテンツを伸ばすsitemap/KW再設計。詳細 research/2026-06-15-search-traffic-priority-reassessment.md |
| B-301 | Trustworthiness 基盤整備 | P3 | - | About・プライバシーポリシー・免責事項の整備。詳細 docs/cycles/cycle-163.md |
| B-163 | ツール・チートシート追加用スキャフォールドスクリプト | P3 | - | 追加用スクリプト（npm run new-tool -- slug-name）を実装。出典 cycle-61 B-159 |
| B-322 | ブログの位置づけ更新 | P3 | - | ブログのコピー更新・カテゴリ体系（開発の学び/AIの日記）整理・3日ルール仕組み化 |
| B-104 | 他ツールへの Worker 適用検討 | P4 | - | JSON整形・差分比較など重い処理に Web Worker 適用を検討。出典 tool-reliability-improvements 記事 |
| B-158 | 開発体験改善（警告ログノイズ制御） | P4 | - | NEXT_PUBLIC_BASE_URL 未設定時の警告過多(#19)。one-shot化・開発時限定・本番抑制を検討 |
| B-103 | Turbopack の Worker 対応安定化後の外部 Worker ファイル移行 | P4 | - | Inline Worker（Blob URL・cycle-30採用）を Turbopack 安定化後に外部ファイル化し二重管理解消。出典 tool-reliability-improvements |
| B-130 | フォントサイズ調整機能 | P4 | - | ユーザー設定としてフォントサイズ調整を検討。出典 dark-mode-toggle 記事の展望 |
| B-131 | サイト内検索の検索履歴保存・表示 | P4 | - | localStorage で実装可能。出典 site-search-feature 記事の展望 |
| B-132 | サイト内検索の人気検索ワード表示 | P4 | - | サーバーレスのためデータ収集に技術的制約あり。出典 site-search-feature 記事の展望 |
| B-133 | サイト内検索のインデックスサイズ監視 | P4 | - | 運用タスク性が強く問題発生時に対応。出典 site-search-feature 記事の展望 |
| B-123 | フィーチャーディレクトリの features/ 集約（将来検討） | P4 | - | src/直下のフィーチャーDirが20超になった時点で features/ 集約を検討。出典 nextjs-directory-architecture 記事 |
| B-105 | プライバシー注記の拡張（ツール固有情報の表示） | P4 | - | ツール固有プライバシー情報（localStorage使用有無等）表示を ToolMeta に追加。出典 tool-reliability-improvements |
| B-121 | パンくずリストへのシリーズ情報追加 | P4 | - | ブログのパンくずにシリーズ名を表示しシリーズ内位置を明確化。出典 series-navigation-ui 記事 |
| B-088 | ビジネスメールテンプレート・敬語早見表の拡充 | P4 | - | メールテンプレ追加と敬語動詞拡充。実測で課題は収録量でなく検索露出の不在(敬語クエリimpression実質0)、着手時は露出獲得策とセットで再設計。詳細 research/2026-06-15-search-traffic-priority-reassessment.md |
| B-155 | QR コード入力上限・UI ブロッキング対策 | P4 | - | 入力長チェックなしのメインスレッド同期実行(#28)。上限定義と Worker 化を検討 |
| B-278 | 検索モーダルの予期しない開閉に関する UX 調査 | P4 | - | 自動化テスト中に検索モーダルが予期せず開く事象のキーボード/SR利用者影響を調査。詳細 docs/cycles/cycle-148.md |
| B-056 | i18n（多言語対応）実装 | P4 | - | サイトの多言語対応。cycle-167 で Owner が無期限延期を解除、任意のタイミングで着手可能 |
| B-368 | 動画→GIF 変換ツール | P4 | - | 動画の一部をSNS/Slack用GIFに変換（AI風ツール調査2026-05-05起票）。詳細 docs/tools-idea.md |
| B-369 | プッシュ・トゥ・トーク（PTT）メモツール | P3 | - | 押している間だけ録音し即時文字起こしして蓄積するリアルタイムメモ（AI風ツール調査2026-05-05起票）。詳細 docs/tools-idea.md |
| B-370 | 録音ファイル文字起こしツール（会議録・長尺対応） | P3 | - | 録音音声/動画から文字起こし生成（AI風ツール調査2026-05-05起票）。着手: B-369 完了後推奨。詳細 docs/tools-idea.md |
| B-371 | 画像合成ワークフローツール（背景除去 + 色合わせ + 重ね合わせ） | P3 | - | 背景除去→色味調整→合成→書出しを1ページ完結（AI風ツール調査2026-05-05起票）。詳細 docs/tools-idea.md |
| B-372 | 写真カラーパレット抽出ツール | P3 | - | 写真から主要色を抽出し配色に活かす（AI風ツール調査2026-05-05起票）。詳細 docs/tools-idea.md |
| B-373 | AI 画像超解像ツール（アップスケール） | P4 | - | 低品質画像をAI補間で高解像度化（AI風ツール調査2026-05-05起票）。詳細 docs/tools-idea.md |
| B-374 | 画像 OCR ツール（日本語横書き） | P3 | - | 画像内の日本語横書きを OCR でテキスト化（AI風ツール調査2026-05-05起票）。詳細 docs/tools-idea.md |
| B-375 | テキスト読み上げツール（再生＋音声 DL） | P3 | - | 入力テキストを読み上げ再生し音声DLも可（AI風ツール調査2026-05-05起票）。詳細 docs/tools-idea.md |
| B-376 | 状況・場面を表す四字熟語を自然言語で検索する道具 | P3 | - | 状況を自然言語入力すると合う四字熟語を意味検索で返す（AI風ツール調査2026-05-05起票）。詳細 docs/tools-idea.md |
| B-377 | 文章→雰囲気の近い日本伝統色ツール | P3 | - | 詩・歌詞・気分の言葉に合う日本伝統色を意味ベクトルで返す（AI風ツール調査2026-05-05起票）。詳細 docs/tools-idea.md |
| B-378 | テキスト類似度チェッカー（A/B 比較・重複文検出） | P3 | - | 2文章の意味類似度表示と重複文検出（AI風ツール調査2026-05-05起票）。詳細 docs/tools-idea.md |
| B-380 | ふりがな自動付与ツール | P3 | - | 日本語テキストに自動でふりがなを付与（AI風ツール調査2026-05-05起票）。詳細 docs/tools-idea.md |
| B-381 | 文体一貫性チェッカー（ですます／だ・である調） | P3 | - | です・ます調とだ・である調の混在を検出しマークアップ（AI風ツール調査2026-05-05起票）。詳細 docs/tools-idea.md |
| B-382 | 既存の日付ツールに自然言語入力を追加 | P3 | - | 日付ツール群に「来週の火曜14時」等の自然言語入力を追加（AI風ツール調査2026-05-05起票）。詳細 docs/tools-idea.md |
| B-383 | BPM 検出ツール | P4 | - | 音声/音楽から BPM を自動検出（AI風ツール調査2026-05-05起票）。詳細 docs/tools-idea.md |
| B-384 | お絵かき認識ゲーム | P4 | - | キャンバスの絵をリアルタイム認識して当てるミニゲーム（AI風ツール調査2026-05-05起票）。詳細 docs/tools-idea.md |
| B-392 | アンチパターン集の整理（手順書化・特定サイクル詳細混入の解消） | P3 | - | cycle-183/184 以前追加の AP 8項目（AP-P16/WF03/05/09/11/12等）から手順書記述を除去し問掛け形式に整理。詳細 docs/cycles/cycle-184.md §B-392 |
| B-393 | Header actions slot のタップターゲット 44px 対応 | P3 | - | ThemeToggleとHeader検索ボタンがWCAG2.5.5推奨44px未達。詳細 cycle-185.md・archive/2026-05-11-cycle-185-a11y-review.md |
| B-398 | ブログ詳細ページ等の grep ベーステストの必要性再評価 | P3 | - | grep ベーステスト群を訪問者価値の観点で再評価し削除か置換かを判断。詳細 docs/cycles/cycle-189.md §B-398 |
| B-310 | ヘッダーナビゲーション体系の再設計（旧: トップページ・ナビゲーションの再設計） | P2 | - | トップ再設計はcycle-232で実施済。残: ヘッダーナビ体系再設計(NAV_ITEMS/道具箱項目要否/遊び位置づけ/Footer整合)。詳細 cycle-186.md・cycle-232.md |
| B-409 | keigo-reference の動詞件数を実データから算出する仕組みに変更 | P3 | - | meta.ts のハードコード動詞件数を KEIGO_ENTRIES.length の動的算出に変更し更新漏れ防止。参照 src/tools/keigo-reference/meta.ts |
| B-410 | keigo-reference の getEntriesByCategory と filterEntries の機能重複を整理 | P4 | - | logic.ts の getEntriesByCategory と filterEntries の重複を整理しラッパー化。参照 src/tools/keigo-reference/logic.ts |
| B-427 | Header / Footer の `var(--max-width)` 参照の技術的不整合解消 | P4 | - | 旧Header/Footer の --max-width 参照が(new)側未定義で不整合。B-337 legacy撤去と同時解消の可能性高。詳細 docs/cycles/cycle-196.md |
| B-429 | `test-results/` の prettier/git 管理整備 | P4 | - | cycle-197 の Playwright 出力 format:check 失敗を .prettierignore/.gitignore 追加で恒久解消。詳細 docs/cycles/cycle-197.md |
| B-430 | cycle-199 Phase 7 完結 + Phase 8.1 型契約有効性検証後のブログ化検討 | P3 | - | Phase7完結・型契約の実用性を Phase8.1 で検証後にブログ化を判断。詳細 docs/cycles/cycle-199.md §キャリーオーバー |
| B-433 | タイル UI / 詳細ページの入力値 localStorage 保持機能 | P3 | - | 前回入力値を localStorage に保持する共通機能を設計・展開。着手: Phase8.1完了 or Phase10.1着手時。詳細 docs/cycles/cycle-200.md |
| B-444 | LineBreakRemoverTile 等タイル UI の `opacity:0.85` 等透過度値のトークン化 | P4 | - | タイルUIに散在する opacity インライン値を CSS変数 or TS定数に SSoT 化。詳細 docs/cycles/cycle-209.md |
| B-446 | PDF コピペ用ワンクリックプリセット（smart-pdf + joinStyle: space 即起動） | P3 | - | line-break-remover タイルに smart-pdf + joinStyle:space を1クリック起動するプリセットボタンを追加。詳細 docs/cycles/cycle-209.md |
| B-447 | smart-pdf モードの before-after 例 / 解説（詳細ページ拡充） | P4 | - | line-break-remover 詳細ページに smart-pdf の before-after 例・解説を追加。詳細 docs/cycles/cycle-209.md |
| B-448 | タイル UI 内のモードラベル理解度補助テキスト追加（GA 観測駆動） | P5 | - | GAで smart-pdf 利用率<5% or フィードバックがあれば「PDFスマートモード」に補助テキスト追加。詳細 docs/cycles/cycle-209.md |
| B-450 | tmp パス命名規約 SSoT 化（`tmp/cycle-<n>/<subcategory>/`） | P5 | - | tmp命名規約（tmp/cycle-<n>/<subcategory>/）を CLAUDE.md か rules に明文化。詳細 docs/cycles/cycle-210.md |
| B-451 | 数値 literal 3 分類プロセス改善（AP-P16 強化または knowledge 文書新設） | P3 | - | 数値literal 3分類（実測/仕様/推定値）を AP-P16 か knowledge 文書として明文化（推定値SSoT事故3連続で起票）。詳細 docs/cycles/cycle-210.md |
| B-453 | 複合入力型タイル AP-P21 判定基準 SSoT の整理（planner 引用必須化） | P3 | - | 判定基準4項目はarchive/composite-input-tile-ap-p21-criteria.mdに整理済。残: planner引用必須の運用化要否判断。詳細 cycle-210.md |
| B-454 | PM 即時編集 (b) 経路の差分レビューログ運用明文化 + 4 列並べ読みテーブル成果物化（AP-WF09/AP-WF11） | P4 | - | PM即時編集経路のレビューログ欠落と AP-P21 4列テーブル未作成を AP-WF09/11 に明文化。cycle-230 nit-1（AP-WF08との許容ケース明文化）も含む。詳細 cycle-210/230.md |
| B-466 | `tmp/` 配下の使い捨て `.ts` スクリプトが typecheck / 本番ビルドを壊す問題の根本解消 | P3 | - | tmp内.ts による typecheck/build 失敗を tsconfig.json exclude "tmp" 追加で根本解消。詳細 docs/cycles/cycle-216.md |
| B-350 | 移行計画 Phase 9.3.a: dictionary トップ `/dictionary` 移行 | P2 | - | /dictionary トップのみを (new)/ 配下に移行。B-490 是正と並行可。着手: B-488(cycle-223)完了で着手可能化済 |
| B-432 | `ToolMeta.trustLevel` フィールド・関連型・テスト・`src/lib/trust-levels.ts` の完全削除 | P2 | - | trustLevel・trust-levels.ts・型/テストを一括完全削除（漸進削除禁止=AP-I02）。/achievements は B-338 で削除済・着手可能(B-490)。詳細 cycle-200.md |
| B-493 | 遊び（ゲーム）の単一タイル化（GameLayout 系） | P2 | - | 全ゲームを単一実装タイルに再構築し旧Component/GameLayout整理。cycle-225 で B-490 から分離（型が異なる・Owner合意）。詳細 docs/cycles/cycle-225.md |
| B-494 | Dynamic Workflows 運用知見の docs/knowledge 恒久化 | P3 | - | workflow運用知見6点(並列builder tsc非信頼/git mv後.next stale/tmp限定/G群天井/指示書網羅性依存/PM一次資料照合)を knowledge 化。詳細 cycle-225.md |
| B-495 | 共通部品 ToggleSwitch の ON 状態塗りを `--accent` 直塗りから `--bg-invert/--fg-invert` ペアへ統一 | P3 | - | ON が --accent直塗りで収束チェックB-3抵触・採用ツールに横断波及。DESIGN.md更新か統一かをplanner判断。詳細 cycle-225.md |
| B-496 | 収束チェックリスト A-7（共通 Input 利用）の対応型拡張＋数値入力ツールの統一 | P3 | - | A-7をnumber/email/password等全種に拡張し対象を共通Inputに統一(dummy-textのraw input等が不統一)。詳細 cycle-225.md |
| B-498 | PM の指示文プロセス改善（DESIGN.md 恒久要件のサイクル翻訳機構） | P2 | - | DESIGN.md恒久要件が指示書から滑り落ちる失敗の予防。AP-P22明文化済。残: cycle-planning SKILLに逐条翻訳step追加等。詳細 cycle-225.md |
| B-503 | cron-parser のプリセット拡充（5→8個） | P4 | - | 現行5個に毎週月曜/6時間ごと/年1回の3個を追加し8個に。着手時 meta.ts の FAQ/howItWorks との整合確認要。cycle-228 タイル化で feature-preserving 原則により見送り |
| B-505 | Dependabot 脆弱性アラートの調査と対応 | P3 | - | gh は正常動作(2026-06-15確認)、旧「Bad credentials」記録は誤り。開3件: #60 esbuild high・#59 esbuild low(→0.28.1)・#48 postcss medium(→8.5.10)。全て推移依存でビルド時のみ・露出低。次サイクル着手可 |
| B-506 | 道具箱タイル「外す」操作後のフォーカス管理（キーボード利用者の位置喪失対策） | P4 | - | タイルを外すとフォーカスが body に落ちる。着手時 隣接タイル操作ボタン or 追加パネルへ移動を検討。cycle-230 T-7 nit-3。詳細 docs/cycles/cycle-230.md |
| B-364 | cycle-175〜178 連続事故と回復のブログ化再判断 | P3 | - | cycle-178 で取下げ。B-497完了で材料が揃い Queued 化。着手時 PM が読者価値で独立判断。詳細 docs/cycles/cycle-178.md |
| B-507 | DESIGN.md §3 への補足ラベル（小さめフォント）の許容条件の明文化 | P4 | - | 0.8rem級の補足ラベルと§3「16px以上を基本」の整合の許容条件（補足メタ限定等）を DESIGN.md に明文化。詳細 docs/cycles/cycle-231.md |
| B-508 | ブログ記事 frontmatter の裸配列残骸（cycle-193 撤去フィールドの残り）一括除去 | P4 | - | trust_level直後の裸配列残骸を除去。残り4本: yoji-quiz/tool-reliability/http-status/game-infra-refactoring。B-432と整合注意 |

## Deferred (すぐに着手できない)

| ID | Title | Priority | Notes |
| --- | --- | --- | --- |
| B-510 | 道具箱利用計測データの初回分析と Phase 10.4/10.5 着手判断 | P2 | B-509計測をBigQuery分析し(1)来訪者3層の層別実測(2)B-324/313着手価値(3)計測ブログ化を判断。着手: 本番から2週間(2026-06-26目安)。詳細 cycle-234.md |
| B-324 | ダッシュボード機能の実装（フェーズ 3: ツール間の入出力連携） | P2 | 入出力の型システム設計・ツール間連携UI。着手: B-510 の判断完了後。キャンセル: ダッシュボード構想が取下げられた場合。cycle-235 で Queued から移動 |
| B-313 | ダッシュボード機能の実装（フェーズ 4: シェア機能） | P2 | タイル配置・設定を base64 で URL シェア。着手: B-510 の判断完了後（B-324と同理由）。cycle-235 で Queued から移動 |
| B-379 | セマンティック検索メモ帳 | P3 | IndexedDB 蓄積メモを意味検索できる完全ローカルメモ帳（AI風ツール調査2026-05-05起票）。着手: B-378 完了後。詳細 docs/tools-idea.md |
| B-460 | 秘密情報を表示する UI の SNS シェア / スクリーンショットリスク対策 SSoT 化 | P3 | 秘密情報表示UIのSNS/スクショリスク対策を共通SSoT化。着手: 同種ツール2件目以降が backlog に登場した時点。詳細 docs/cycles/cycle-213.md §キャリーオーバー |
| B-500 | ToolCard の fake Panel（手塗り）を Tile/Panel ベースへ整理 | P4 | ToolCard.module.cssはLink直下でPanel不可のため手塗りfake Panel(負債)。着手: 道具箱Tile toolbox着工時orDESIGNドリフト源化時。詳細 cycle-226.md |
| B-391 | ブログ分類の軸重複解消とレコメンド理由の可視化（情報設計の再検討） | P2 | タグとカテゴリの並列問題・関連記事/Playレコメンドのブラックボックス問題を情報設計からゼロベース再検討。詳細 docs/cycles/cycle-184.md §キャリーオーバー §B-391 |
| B-295 | GameLayout / CheatsheetLayout / DictionaryDetailLayout のゼロベース再設計 | P2 | ToolLayout の3ゾーン構成を他レイアウトにも適用。着手: デザインガイドライン策定後に方針再検討。キャンセル: ガイドラインで別アプローチ採用時 |
| B-112 | ツール絞り込み・検索機能の追加検討 | P3 | ツール数100〜200対応の最適UI検討。着手: ダッシュボードのタイル追加UIが検索・絞り込みを包含しないと判明時。キャンセル: 包含する場合 |
| B-136 | StatsModal のヒストグラム表示共通化 | P4 | 4ゲーム統計モーダルの類似ヒストグラム表示の共通化。着手: ゲーム統計機能が引き続き必要と判断時。キャンセル: ゲーム大幅縮小時。出典 game-infrastructure-refactoring |
| B-135 | iOS Safari スクロールロックのフォールバック対応 | P4 | iOS Safari で overflow:hidden が完全スクロール防止できないケース対応。着手: 実害確認時。キャンセル: 該当ゲーム削除。出典 game-infrastructure-refactoring |
| B-229 | GameContainer loadDifficulty lazy initializer の予防的修正 | P4 | loadDifficulty lazy initializerが将来リファクタでhydration error顕在化のリスク。着手: 該当ゲーム残存時。詳細 cycle-127.md |
| B-091 | テーマ間の横断的なおすすめ機能 | P4 | cycle-129 で着手失敗（事故9件）。着手: ダッシュボードで実現できないクロスコンテンツ推薦が必要と判明時。キャンセル: ダッシュボードが包含時 |
| B-219 | AI 画像生成 MCP サーバーの実装（B-113 提案書に基づく） | P2 | B-113提案書(docs/imagen4-proposal.md)に基づく実装。着手: 診断OGP以外の用途で必要性確認時。キャンセル: 新コンセプトで用途なしと判明時 |
| B-337 | legacy 撤去・統合（移行計画 Phase 11） | P1 | (legacy)/撤去→Route Group解除→layout統合→globals.css後始末→計画書archive化。着手: Phase10全完了。詳細 design-migration-plan.md |
| B-351 | 移行計画 Phase 9.3.b: dictionary `colors` 系移行 | P2 | /dictionary/colorsの3ルートを(new)/に移行。4階層Breadcrumb SP表示のPlaywright検証必須。着手: B-350完了。詳細 design-migration-plan.md |
| B-352 | 移行計画 Phase 9.3.c: dictionary `humor` 系移行 | P2 | /dictionary/humor とその[slug]の2ルートを(new)/に移行。着手時 4階層 Breadcrumb の SP 表示検証。着手: B-350完了 |
| B-353 | 移行計画 Phase 9.3.d: dictionary `kanji` 系移行 | P2 | /dictionary/kanji 系を(new)/に移行（kanji-kanaru クロスリンク・動的生成維持）。着手: B-350完了。詳細 docs/design-migration-plan.md |
| B-354 | 移行計画 Phase 9.3.e: dictionary `yoji` 系移行 | P2 | /dictionary/yoji系を(new)/に移行(yoji→kanji内部リンク維持・Breadcrumb SP検証)。着手: B-350+B-353完了。詳細 design-migration-plan.md |

## Done (完了)

以下は直近5サイクル分の完了タスクです。6サイクルより前のタスクは削除してください。

| ID | Title | Completed Cycle | Notes |
| --- | --- | --- | --- |
| B-515 | 四字熟語辞書ページの CTR 改善（出典/構成データ表示＋メタ・JSON-LD改善） | 246 | YojiDetailにorigin/structure/sourceUrl表示・description読み方前置・JSON-LD alternateName/sameAs。最終reviewer重大ゼロ。詳細 cycle-246.md |
| B-513 | ガイド→早見表の逆方向相互リンク追加 | 245 | cycle-244で復元した早見表6本に対し、対のガイド6本から早見表への逆リンクを追加し相互リンクを完成。各ガイド本文1行＋updated_at更新で主題は不変。2 reviewer重大ゼロ。cycle-245 |
| B-511 | cycle-243 の憲法違反(来訪者価値破壊)の是正 | 244 | 早見表6記事を/blogに復元・旧/cheatsheets/Xを早見表へ向け直し・indexは/blog/tag/早見表へ。why-i-removed削除・記録誠実化・誤分類2本是正。cycle-244 |
| B-345 | 移行計画 Phase 9.2.d: cheatsheet `http-status-codes` を既存ガイドへ統合（補筆） | 242 | http-status-code-guide-for-rest-api.md末に33コード早見表(1xx〜5xx)新設・自己参照リンク是正・RFC/MDN裏取り。撤去はB-349。cycle-242 |
| B-342 | 移行計画 Phase 9.2.a: cheatsheet `cron` を既存ガイドへ統合（補筆） | 242 | cron-parser-guide.mdに特殊文字列ショートカット表(@yearly〜@reboot)と「よく使うcron式」拡充を追加。man裏取り。撤去はB-349。cycle-242.md |
| B-347 | 移行計画 Phase 9.2.f: cheatsheet `regex` を既存ガイドへ統合（補筆） | 242 | 網羅性検証で軽微〜中の欠落。regex-tester-guide.md にメタ文字早見表(10種)・文字クラス否定形・先読み後読み全4種の表を追加。MDN裏取り・敬体統一。撤去はB-349。詳細 cycle-242.md |
| B-344 | 移行計画 Phase 9.2.c: cheatsheet `html-tags` をブログ記事に転換 | 241 | html-tags(1285行)を記事 choosing-html-tags-by-meaning(tool-guides)へ再構成し公開。MDN裏取り。AP-W13新設。撤去はB-349。cycle-241 |
