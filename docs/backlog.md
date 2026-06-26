## Active (進行中)

| ID | Title | Priority | Target Cycle | Notes |
| --- | --- | --- | --- | --- |
| B-545 | (new)移行の来訪者価値の検証方針の決定 | P1 | 270 | cycle-269完全失敗・判断未了。残4ゲームを面ごとに(a)テスト無移行/(b)A/Bへ来訪者価値で実判断(enjoyableの柱を変えるか=§8.2基準・AP-P31でプール)。保留(c)とsweep禁止。詳細 cycle-269.md事故報告 |

## Queued (すぐに着手できる)

| ID | Title | Priority | Target Cycle | Notes |
| --- | --- | --- | --- | --- |
| B-493 | 遊びゲーム本体の(new)デザイン移行（残: nakamawake/irodori/yoji-kimeru/daily） | P1 | - | 各1サイクルで`_components/new`再利用。yoji-kimeru時にaria-label escape(AP-I12)是正。A/B方針はB-545。詳細 cycle-268.md |
| B-537 | 診断流入増(character-personality)の追計測と回遊強化 | P2 | - | 着手可(2026-06-25到達=追計測開始可)。煽り/押し付け禁止(cycle-256)・単発質を損なわない回遊。定着確認後に投資。詳細 cycle-257.md |
| B-534 | 学年×画数の漢字一覧ページの実用性向上(「2画の漢字 小学生」需要) | P3 | - | 辞典移行(9.3.d/e=B-353/B-354)完走で解放。詳細 research/2026-06-21-search-console-unmet-demand.md |
| B-541 | 現状正しい辞典収録数ハードコードの予防的`.length`化 | P4 | - | colors系「250色」等。現状正しいがB-409/B-536と同型の再発予兆。詳細 cycle-258.md |
| B-540 | アンチパターン集の規約準拠クリーンアップ | P1 | - | docs/anti-patterns/全体の規約違反(手順・具体事例の混入)を一般化『やってはいけないこと』+発生番号のみへ是正。手順→knowledge/skill・具体事例→cycle-doc。cycle-269で広範な違反を再確認(例AP-P28/P31)。要レビュー。詳細 cycle-257.md |
| B-524 | *Content の allTypesLayout 公開型を意味通り命名へ整理 | P1 | - | cycle-254のpill→grid内部マップでdead literal化。AP-I02。retro側(_experiments/)の整理にも注意。詳細 cycle-254.md / cycle-255.md |
| B-432 | trustLevel フィールド・関連型・テストの完全削除 | P2 | - | 一括完全削除（漸進禁止=AP-I02）。詳細 cycle-200.md |
| B-505 | Dependabot 脆弱性アラートの調査と対応 | P3 | - | 開3件: esbuild high/low・postcss medium。全て推移依存でビルド時のみ。詳細 cycle-246.md |
| B-517 | 「全タイプ回遊」実装9箇所の共通コンポーネント統一 | P3 | - | OtherTypesNavへ8 variant診断の独自セクションを寄せ単一化。詳細 cycle-249.md |
| B-323 | SEO・サイトマップの更新 | P3 | - | 残(他診断の結果体験/sitemap/KW)継続。P2→P3降格。詳細 cycle-247.md |
| B-502 | タイルレジストリ／型契約の再設計 | P3 | - | 全ツールの同一性を構造で強制。P2→P3降格。詳細 cycle-226.md |
| B-316 | サイト全体の URL 構成の見直し | P3 | - | /play 等の旧コンセプトURLを再設計。P2→P3降格 |
| B-310 | ヘッダーナビゲーション体系の再設計 | P3 | - | NAV_ITEMS/道具箱項目要否/遊び位置づけ/Footer整合。P2→P3降格。詳細 cycle-186.md |
| B-498 | PM 指示文プロセス改善（DESIGN.md翻訳機構） | P3 | - | AP-P22明文化済。残: SKILL逐条翻訳step追加等。P2→P3降格。詳細 cycle-225.md |
| B-529 | AP-WF09/WF24 連環の構造的対処プロセス化 | P3 | - | 表面の単語修正で止めず判断構造を直す手順を SKILL 化。詳細 cycle-255.md 残存課題 |
| B-530 | AP-WF11 の運用化(成果物公開前 reader-perspective audit) | P3 | - | reviewer 承認を公開判断の代用にしない PM チェック手順。詳細 cycle-255.md 残存課題 |
| B-531 | Goal-first チェック運用の仕組み化 | P3 | - | 計画・設計・公開の各段階で constitution Goal 起点問いをテンプレ化。詳細 cycle-255.md 残存課題 |
| B-317 | 時間関係ツールの追加 | P3 | - | タイマー・ストップウォッチ等。P2→P3降格（cycle-252教訓）。詳細 tools-idea.md |
| B-320 | 計算・変換関係ツールの追加（残: 比率等） | P3 | - | cycle-252でパーセント計算機を実施。残りの計算ツール。P2→P3降格。詳細 tools-idea.md |
| B-321 | テキスト・文章関係ツールの追加 | P3 | - | 読了時間推定・原稿用紙換算等。P2→P3降格（cycle-252教訓）。詳細 tools-idea.md |
| B-512 | next.config redirects コメント「301」→「308」統一 | P4 | - | コメント/ドキュメント文言のみ是正。詳細 cycle-243.md |
| B-435 | QR コードツールへの種別タブ追加 | P4 | - | 実測PV0のためP3→P4降格。詳細 cycle-246.md |
| B-437 | QR コードツールに SVG DL ボタン追加 | P4 | - | 実測PV0のためP3→P4降格。詳細 cycle-246.md |
| B-438 | T1 / T2 search_intents 全体棚卸し | P3 | - | yamlの古さ・未掲載クエリを実測付きで棚卸し。詳細 cycle-207.md |
| B-439 | QR コード装飾機能の提供可否再検討 | P5 | - | 観測トリガー到達時に再検討。詳細 cycle-207.md |
| B-441 | QR コード DL ファイル名の連番回避策 | P4 | - | ハッシュ/タイムスタンプ付きに変更。詳細 cycle-207.md |
| B-385 | about ページの OGP 画像新規作成 | P4 | - | privacy パターン参照 |
| B-387 | 一覧ページの OGP 画像棚卸し・新規作成 | P4 | - | /play・/tools・/blog・/ の4ルート。詳細 cycle-182.md |
| B-388 | Pagination 44px タップターゲット化 | P4 | - | 2ページ目到達0PVのためP4。詳細 cycle-183.md |
| B-390 | AP 集全項目のガイド混入監査 | P3 | - | 残りimplementation.mdとwriting.md。詳細 cycle-248.md |
| B-301 | Trustworthiness 基盤整備 | P3 | - | About・プライバシーポリシー・免責事項。詳細 cycle-163.md |
| B-163 | ツール追加用スキャフォールドスクリプト | P3 | - | npm run new-tool -- slug-name を実装。出典 cycle-61 |
| B-322 | ブログの位置づけ更新 | P3 | - | コピー更新・カテゴリ体系整理・3日ルール仕組み化 |
| B-318 | 画像を共有用に整えるワークフローツール | P3 | - | 1ページWF。詳細 tools-idea.md |
| B-319 | 動画/音声を共有用に整えるワークフローツール | P3 | - | 1ページWF。詳細 tools-idea.md |
| B-104 | 他ツールへの Worker 適用検討 | P4 | - | JSON整形・差分比較など重い処理に適用 |
| B-158 | 開発体験改善（警告ログノイズ制御） | P4 | - | NEXT_PUBLIC_BASE_URL 未設定時の警告過多(#19) |
| B-103 | Turbopack Worker安定化後の外部Workerファイル移行 | P4 | - | Inline WorkerをTurbopack安定化後に外部ファイル化 |
| B-130 | フォントサイズ調整機能 | P4 | - | ユーザー設定として検討 |
| B-131 | サイト内検索の検索履歴保存・表示 | P4 | - | localStorage で実装可能 |
| B-132 | サイト内検索の人気検索ワード表示 | P4 | - | サーバーレスのためデータ収集に技術的制約あり |
| B-133 | サイト内検索のインデックスサイズ監視 | P4 | - | 運用タスク性が強く問題発生時に対応 |
| B-123 | フィーチャーディレクトリ features/ 集約 | P4 | - | src/直下が20超になった時点で検討 |
| B-105 | プライバシー注記の拡張（ツール固有情報） | P4 | - | ToolMeta に追加 |
| B-121 | パンくずリストへのシリーズ情報追加 | P4 | - | ブログのパンくずにシリーズ名を表示 |
| B-088 | ビジネスメール・敬語早見表の拡充 | P4 | - | 着手時は露出獲得策とセットで再設計。詳細 research/ |
| B-155 | QR コード入力上限・UI ブロッキング対策 | P4 | - | 上限定義と Worker 化を検討 |
| B-278 | 検索モーダルの予期しない開閉 UX 調査 | P4 | - | キーボード/SR利用者影響を調査。詳細 cycle-148.md |
| B-056 | i18n（多言語対応）実装 | P4 | - | cycle-167 で Owner が無期限延期を解除 |
| B-368 | 動画→GIF 変換ツール | P4 | - | 詳細 tools-idea.md |
| B-369 | プッシュ・トゥ・トーク（PTT）メモツール | P3 | - | 詳細 tools-idea.md |
| B-370 | 録音ファイル文字起こしツール | P3 | - | B-369完了後推奨。詳細 tools-idea.md |
| B-371 | 画像合成ワークフローツール | P3 | - | 背景除去+色合わせ+重ね合わせ。詳細 tools-idea.md |
| B-372 | 写真カラーパレット抽出ツール | P3 | - | 詳細 tools-idea.md |
| B-373 | AI 画像超解像ツール（アップスケール） | P4 | - | 詳細 tools-idea.md |
| B-374 | 画像 OCR ツール（日本語横書き） | P3 | - | 詳細 tools-idea.md |
| B-375 | テキスト読み上げツール（再生＋音声 DL） | P3 | - | 詳細 tools-idea.md |
| B-376 | 四字熟語を自然言語で検索する道具 | P3 | - | 詳細 tools-idea.md |
| B-377 | 文章→雰囲気の近い日本伝統色ツール | P3 | - | 詳細 tools-idea.md |
| B-378 | テキスト類似度チェッカー | P3 | - | A/B比較・重複文検出。詳細 tools-idea.md |
| B-380 | ふりがな自動付与ツール | P3 | - | 詳細 tools-idea.md |
| B-381 | 文体一貫性チェッカー（ですます/だ・である調） | P3 | - | 詳細 tools-idea.md |
| B-382 | 既存日付ツールに自然言語入力を追加 | P3 | - | 詳細 tools-idea.md |
| B-383 | BPM 検出ツール | P4 | - | 詳細 tools-idea.md |
| B-384 | お絵かき認識ゲーム | P4 | - | 詳細 tools-idea.md |
| B-393 | Header actions slot の 44px タップターゲット対応 | P3 | - | 詳細 cycle-185.md |
| B-398 | grep ベーステストの必要性再評価 | P3 | - | 訪問者価値の観点で再評価。詳細 cycle-189.md |
| B-409 | keigo-reference 動詞件数を実データから算出 | P3 | - | ハードコード→KEIGO_ENTRIES.length |
| B-410 | keigo-reference の機能重複整理 | P4 | - | getEntriesByCategory と filterEntries |
| B-427 | Header/Footer の --max-width 参照の不整合解消 | P4 | - | B-337 legacy撤去と同時解消の可能性高。詳細 cycle-196.md |
| B-429 | test-results/ の prettier/git 管理整備 | P4 | - | .prettierignore/.gitignore追加で恒久解消。詳細 cycle-197.md |
| B-430 | Phase 7完結+Phase 8.1検証後のブログ化検討 | P3 | - | 詳細 cycle-199.md |
| B-433 | タイル入力値 localStorage 保持機能 | P3 | - | 共通機能を設計・展開。詳細 cycle-200.md |
| B-444 | タイル UI opacity値のトークン化 | P4 | - | CSS変数 or TS定数に SSoT 化。詳細 cycle-209.md |
| B-446 | PDF コピペ用ワンクリックプリセット | P3 | - | smart-pdf + joinStyle:space 即起動。詳細 cycle-209.md |
| B-447 | smart-pdf の before-after 例（詳細ページ拡充） | P4 | - | 詳細 cycle-209.md |
| B-448 | タイル内モードラベル補助テキスト追加 | P5 | - | GA観測駆動。詳細 cycle-209.md |
| B-450 | tmp パス命名規約 SSoT 化 | P5 | - | 詳細 cycle-210.md |
| B-451 | 数値 literal 3 分類プロセス改善 | P3 | - | AP-P16強化またはknowledge文書新設。詳細 cycle-210.md |
| B-453 | 複合入力型タイル AP-P21 判定基準整理 | P3 | - | planner引用必須の運用化要否判断。詳細 cycle-210.md |
| B-454 | PM即時編集(b)経路の差分レビューログ明文化 | P4 | - | AP-WF09/11明文化。詳細 cycle-210/230.md |
| B-466 | tmp/ 配下 .ts の typecheck/build 破壊の根本解消 | P3 | - | tsconfig.json exclude "tmp" 追加。詳細 cycle-216.md |
| B-494 | Dynamic Workflows 運用知見の knowledge 恒久化 | P3 | - | 6点の知見をknowledge化。詳細 cycle-225.md |
| B-495 | ToggleSwitch ON状態塗りの統一 | P3 | - | --accent直塗り→--bg-invert/--fg-invertペア。詳細 cycle-225.md |
| B-496 | 収束チェック A-7 の対応型拡張 | P3 | - | number/email/password等全種に拡張。詳細 cycle-225.md |
| B-503 | cron-parser プリセット拡充（5→8個） | P4 | - | 毎週月曜/6時間ごと/年1回を追加 |
| B-506 | タイル「外す」操作後のフォーカス管理 | P4 | - | キーボード利用者の位置喪失対策。詳細 cycle-230.md |
| B-364 | cycle-175〜178 連続事故のブログ化再判断 | P3 | - | 着手時PM独立判断。詳細 cycle-178.md |
| B-507 | DESIGN.md §3 補足ラベルの許容条件明文化 | P4 | - | 0.8rem級と§3の整合。詳細 cycle-231.md |
| B-508 | ブログ frontmatter 裸配列残骸の一括除去 | P4 | - | 残り4本。B-432と整合注意 |
| B-520 | kanji-data.json kunYomi 重複クレンジング | P4 | - | 119件の重複読みを根治。詳細 cycle-251.md |

## Deferred (すぐに着手できない)

| ID | Title | Priority | Notes |
| --- | --- | --- | --- |
| B-544 | 結果ページ§7フルクライマックス化＋catchphrase見せ方統一(N-1) | P2 | 着手: インラインA/B(quiz_result_visual_v1)結論後にB-526協調。固有色/勲章感/伝統色対応＋単独ページ内のcatchphrase囲み統一。詳細 cycle-267.md |
| B-526 | 最初の実A/B(quiz_result_visual_v1) 月次読み | P1 | 着手: 2026-07-21目安〜結論到達まで月次継続。詳細 visitor-value-measurement.md 論点8.1 |
| B-527 | 最初の実A/B 結論到達時の撤去サイクル化 | P1 | 着手: B-526で判定閾値到達時。詳細 visitor-value-measurement.md 論点8.4 |
| B-542 | トップ`/`の位置づけ再設計（道具箱→診断中心の新着地構造） | P2 | 着手: 設計＋A/Bまたは追計測駆動。organic集客ほぼ0の道具箱トップを診断から見た構造へ(煽らず単発質維持)。設計前提=cycle-261/B-539(DESIGN.md §7)。詳細 cycle-257.md / cycle-259.md / cycle-261.md |
| B-521 | cycle-251 漢字辞書CTR改善の効果検証 | P2 | 着手: 2026-07-16目安。詳細 cycle-251.md |
| B-510 | 道具箱利用計測データの初回分析 | P2 | **cycle-257/B-535に取り込み済(完了)**。詳細 cycle-234.md / cycle-257.md |
| B-533 | 辞典に固有の深掘り価値を足す/露出を診断へ橋渡し | P2 | 着手: 診断系デザイン移行(B-493)完走後に来訪者UX優先順を解除して再開。詳細 cycle-257.md / cycle-259.md / cycle-267.md |
| B-324 | ダッシュボード: ツール間連携（Phase 10.4） | P3 | **保留(cycle-259/B-538)**: 道具箱-as-core降格＋中核機能利用ゼロのため、道具箱拡充投資は道具箱トラクションがデータで示されるまで行わない。P2→P3降格。詳細 cycle-235.md / cycle-259.md |
| B-313 | ダッシュボード: シェア機能（Phase 10.5） | P3 | **保留(cycle-259/B-538)**: 同上（道具箱拡充投資はデータでトラクション確認後）。P2→P3降格。詳細 cycle-235.md / cycle-259.md |
| B-379 | セマンティック検索メモ帳 | P3 | 着手: B-378完了後。詳細 tools-idea.md |
| B-460 | 秘密情報UIのSNS/スクショリスク対策SSoT化 | P3 | 着手: 同種ツール2件目登場時。詳細 cycle-213.md |
| B-500 | ToolCard fake PanelのTile/Panelベース整理 | P4 | 着手: 道具箱Tile着工時。詳細 cycle-226.md |
| B-391 | ブログ分類の軸重複解消・レコメンド可視化 | P2 | 着手: 情報設計再検討時。詳細 cycle-184.md |
| B-295 | GameLayout等のゼロベース再設計 | P2 | 着手: B-522過程で方針再検討。詳細 cycle-225.md |
| B-112 | ツール絞り込み・検索機能の追加検討 | P3 | 着手: ダッシュボードが包含しない場合 |
| B-136 | StatsModal ヒストグラム表示共通化 | P4 | 着手: ゲーム統計が必要と判断時 |
| B-135 | iOS Safari スクロールロックのフォールバック | P4 | 着手: 実害確認時 |
| B-229 | GameContainer loadDifficulty の予防的修正 | P4 | 着手: 該当ゲーム残存時。詳細 cycle-127.md |
| B-091 | テーマ間の横断的なおすすめ機能 | P4 | 着手: ダッシュボードが包含しない場合 |
| B-219 | AI 画像生成 MCP サーバーの実装 | P2 | 着手: 必要性確認時。詳細 imagen4-proposal.md |
| B-337 | legacy撤去・統合（Phase 11） | P1 | 着手: Phase10全完了後。詳細 design-migration-plan.md |

## Done (完了)

以下は直近5サイクル分の完了タスクです。6サイクルより前のタスクは削除してください。

| ID | Title | Completed Cycle | Notes |
| --- | --- | --- | --- |
| B-528 | cycle-255 計測基盤の自己適用(release別 before/after 回帰確認) | 268(中止) | before/afterは本サイト規模で成立せず前提が無効。全面A/B(B-545)が代替。詳細 cycle-268.md |
| B-523 | 診断単独結果ページ10ルートを(new)デザインへ移行 | 267 | 主軸診断のクライマックス。A/B凍結の倒錯を是正(単独ページはarm非受領で交絡せず)・旧要素撤去しインライン結果とトーン統一。詳細 cycle-267.md |
| B-354 | 移行計画 Phase 9.3.e: dictionary yoji系移行（トップ+category+詳細） | 266 | yoji系を(new)austereへ移行＝辞典4系統移行(Phase 9.3)完走。h1欠落是正(kanji/color同型)・クロスリンク維持。詳細 cycle-266.md |
| B-353 | 移行計画 Phase 9.3.d: dictionary kanji系移行 | 265 | kanji系(トップ+grade/radical/stroke+詳細)を(new)へ移行。`new/DictionaryCard`フォーク新設・kanji-kanaru双方向リンク維持・SEO構造保全。詳細 cycle-265.md |
| B-352 | 移行計画 Phase 9.3.c: dictionary humor系移行（トップ+詳細） | 264 | humor系(index+30語詳細)を(new)austere基調へ移行。自前CSS完結(共有_components不使用=cycle-262型)でDictionaryDetailLayout不採用。😂評価ボタン無改修。詳細 cycle-264.md |
| B-351 | 移行計画 Phase 9.3.b: dictionary colors系移行（トップ+詳細+category） | 263 | colors系を(new)austere基調へ移行。共有_componentsを`_components/new/`にフォーク(後続B-352〜354の基盤)。色見本HEXは本文維持・B-541のcolors分回収。詳細 cycle-263.md |
