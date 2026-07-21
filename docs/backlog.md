## Active (進行中)

| ID | Title | Priority | Target Cycle | Notes |
| --- | --- | --- | --- | --- |

## Queued (すぐに着手できる)

| ID | Title | Priority | Target Cycle | Notes |
| --- | --- | --- | --- | --- |
| B-573 | UI/UX/アクセシビリティの全面適用(残: 全面展開) | P1 | - | cycle-287で監査+代表原型の是正スライス完了(F1-F5)。残=全81ページ/36ツールへの全面展開。系統的な個別項目はB-593/595/596/599等に分割起票済。詳細cycle-287/ |
| B-594 | /play/daily の見出し構造是正(h1不在) | P3 | - | cycle-287 C2(F5姉妹)。監査ページはF5でh2化済。ResultPageShellは既にh1あり是正不要。残=dailyがh1不在(タイトルがTsutsumi<p>のみ)=h1相当が必要。実DOM確認のうえ是正。詳細cycle-287/findings.md |
| B-597 | テーマトグルのタップ標的高さ(28px)のDESIGN準拠 | P4 | - | cycle-287監査C5。switch高さ28px=DESIGN§10の44px未満(WCAG2.5.8 24pxは充足)。当たり判定拡大の要否をDESIGN基準で判断。詳細cycle-287/findings.md |
| B-599 | 辞典/共有まわりのa11y軽微群 | P4 | - | cycle-287監査C8。同部首117リンクがdiv(list構造喪失)/辞典ヒーロー大字がaria-hidden無で二重読み/共有ボタンの外部予告が面で不整合。詳細cycle-287/findings.md |
| B-575 | 診断結果のシェアが少ない事実の扱い | P3 | - | share≈2件/28d(旧B-550・フェーズR前の古計測)。着手時は来訪者価値で正当化。経緯・扱いはcycle-285.md |
| B-586 | rebuild-plan.md の処遇(archive移動)と参照元の付け替え | P2 | - | 作り直しはcycle-279完了・中身はbacklog/ADRへ移設済だが参照(ADR001・cycle-kickoff SKILL等)が残る=archive移動と参照付け替えが要る。cycle-284重大事故の舞台。詳細cycle-284.md事故報告 |
| B-583 | 「店構え」統一と印の要否を来訪者価値から再検討 | P3 | - | 店構え統一・印の要否を来訪者価値から再評価。旧着手条件は消滅済(Queued)。詳細cycle-283.md/cycle-285.md |
| B-574 | イディオム2一覧のアクセシブル名浄化(stretched-link化) | P4 | - | B-573のa11y掃討の一部。SRが連結を読む冗長さを主リンク名のみへ。cycle-287で辞典検索結果リンクにも同種確認(C6)。詳細cycle-281.md/cycle-287 |
| B-581 | AP-P33の境界値サンプリング運用化 | P3 | - | cycle-283でPMがAP-P33を再犯(near-white辞典色を実見サンプルから落とし埋没欠陥を見逃す・reviewer捕捉)。「価値の種類で選ぶ」では不足で「失敗軸の両端=境界を必ず含める」を実際の抽出手順に明文化。詳細cycle-283.md自己批判 |
| B-582 | 伝統色辞典250件のromaji表記統一の点検 | P3 | - | cycle-283で色OGP(看板)にromaji露出。shinsyu(真朱)等ヘボン式/訓令式混在の兆候。既存データ由来だが拡散面へ昇格。250件の表記一貫性を点検。詳細cycle-283.md |
| B-576 | favicon/apple-touch-icon を店構えへ | P2 | - | cycle-282の横断点検で発覚。旧ブランド(暗地+白ゴシックy+青ドット)がバイナリ死角で残存。16-32px可読性は別種の図像craft=専用タスクで質担保。詳細cycle-282.md |
| B-562 | フェーズC-a: 新クラスタの立ち上げ | P1 | - | フェーズR(B-561)完了(cycle-279)で解禁。候補の正典=research/2026-07-11-market-research-cycle278.md T4節。着手時に個別裏取り+実験台帳へ事前登録。同時2クラスタ以下。詳細 rebuild-plan.md §3 |
| B-564 | フェーズC-c: 辞典の処遇判断(体験化orプルーニング) | P2 | - | フェーズR完了で解禁。検定エンジン検討(B-562)と同時に判断。B-521で辞書CTR 0.08%=参照型の敗北兆候TW-Aと判明済(ADR001)。詳細 rebuild-plan.md §3 |
| B-566 | ツールの処遇判断(最高価値に磨いてから改善orプルーニング) | P2 | - | フェーズR完了で解禁の専用取組。SC表示数による一律削除は撤回済(cycle-279・rule4)。詳細 cycle-279.md・rebuild-plan §2 R-1 |
| B-569 | 全診断のmeta/FAQのタイプ名例示が自診断に実在するか横断監査 | P3 | - | cycle-280でcharacter-personalityに別診断のタイプ名混入を発見・是正。検索結果の説明文の実害。他診断の同種混入を点検。詳細 cycle-280.md |
| B-494 | Dynamic Workflows 運用知見の knowledge 恒久化 | P2 | 279 | **フェーズR(workflow一斉切替)の前提整備として昇格**。6点の知見をknowledge化。詳細 cycle-225.md |
| B-540 | アンチパターン集の規約準拠クリーンアップ | P2 | - | docs/anti-patterns/全体の規約違反を一般化+発生番号のみへ是正。詳細 cycle-257.md |
| B-466 | tmp/ 配下 .ts の typecheck/build 破壊の根本解消 | P3 | - | tsconfig.json exclude "tmp" 追加。詳細 cycle-216.md |
| B-390 | AP 集全項目のガイド混入監査 | P3 | - | 残り implementation.md と writing.md。詳細 cycle-248.md |
| B-398 | grep ベーステストの必要性再評価 | P3 | - | 訪問者価値の観点で再評価。詳細 cycle-189.md |
| B-451 | 数値 literal 3 分類プロセス改善 | P3 | - | AP-P16強化またはknowledge文書新設。詳細 cycle-210.md |
| B-498 | PM 指示文プロセス改善(DESIGN.md翻訳機構) | P3 | - | 新DESIGN.md体制でのSKILL逐条翻訳stepの整備。詳細 cycle-225.md |
| B-529 | AP-WF09/WF24 連環の構造的対処プロセス化 | P3 | - | 詳細 cycle-255.md |
| B-530 | AP-WF11 の運用化(公開前 reader-perspective audit) | P3 | - | 詳細 cycle-255.md |
| B-531 | Goal-first チェック運用の仕組み化 | P3 | - | 詳細 cycle-255.md |
| B-364 | cycle-175〜178 連続事故のブログ化再判断 | P3 | - | 着手時PM独立判断。詳細 cycle-178.md |
| B-541 | 現状正しい辞典収録数ハードコードの予防的`.length`化 | P4 | - | 辞典の処遇判断(B-564)と連動。詳細 cycle-258.md |
| B-549 | middleware→proxy 移行(Next.js16非推奨) | P4 | - | 出荷物に影響なし。詳細 cycle-271 接地 |
| B-512 | next.config redirects コメント「301」→「308」統一 | P4 | - | 文言のみ是正。詳細 cycle-243.md |
| B-577 | theme-color/manifest付与+410ダーク追従 | P4 | - | cycle-282点検/レビューで発覚。theme-color欠落(アドレスバー色を--paper系へ)+410ページのprefers-color-schemeダーク対応(現状ライト固定)。詳細cycle-282.md |
| B-578 | クイズデータ内の旧青hexクレンジング | P4 | - | cycle-282点検で発覚。--type-color inject用の青hexだが消費CSS0=dead。OGP accentColor廃止で完全無害化済。和色へ寄せるか除去。詳細cycle-282.md |
| B-429 | test-results/ の prettier/git 管理整備 | P4 | - | .prettierignore/.gitignore 追加。詳細 cycle-197.md |
| B-508 | ブログ frontmatter 裸配列残骸の一括除去 | P4 | - | 残り4本。B-432と整合注意 |
| B-520 | kanji-data.json kunYomi 重複クレンジング | P4 | - | 辞典の処遇判断(B-564)と連動。詳細 cycle-251.md |
| B-454 | PM即時編集(b)経路の差分レビューログ明文化 | P4 | - | AP-WF09/11明文化。詳細 cycle-210/230.md |
| B-158 | 開発体験改善(警告ログノイズ制御) | P4 | - | NEXT_PUBLIC_BASE_URL 未設定時の警告過多 |
| B-103 | Turbopack Worker安定化後の外部Workerファイル移行 | P4 | - | 安定化後に外部ファイル化 |
| B-123 | フィーチャーディレクトリ features/ 集約 | P4 | - | src/直下が20超になった時点で検討 |
| B-567 | 移行時代の `new/` コンポーネントディレクトリ平坦化 | P3 | - | legacy 兄弟が消えた片翼 new/ 3件を平坦化(約24 import)。デザイン/UX 非影響。cycle-279 で非ブロッキング判断。詳細 cycle-279.md |
| B-450 | tmp パス命名規約 SSoT 化 | P5 | - | 詳細 cycle-210.md |

## Deferred (すぐに着手できない)

| ID | Title | Priority | Notes |
| --- | --- | --- | --- |
| B-568 | 面横断 content_id 接頭辞規約の全面統一 | P4 | 着手: ADR002観測窓終了後(既存item_id集計との断絶を伴う移行のため)。cycle-280でquiz面はcontentIdForQuizに統一済・ゲーム(素slug)/運勢(fortune-daily)は当面surface未指定・level不在で主指標非汚染。詳細 cycle-280.md |
| B-590 | eslint 10 / TypeScript 7 の採用 | P4 | 着手: config-next配下のplugin基盤(typescript-eslint8等)がeslint10/TS7対応次第。cycle-286で試行=lintクラッシュ実証。詳細cycle-286/ |
| B-592 | overrides(postcss/react-hooks)の解消 | P4 | 着手: postcssは親(next/sanitize-html)がpatched版を引いた時・react-hooksは7.1.1採用判断時にoverride除去(upstreamドリフト回避)。詳細cycle-286/remediation.md |
| B-565 | 全面切替の観測(ADR001) | P2 | 着手: 切替+2週(読み始め=2026-07-27)・結論は+3ヶ月窓。正典 ADR001(docs/ADR/open/)。双方向ガード |
| B-056 | i18n(多言語対応) | P4 | 着手: 将来オプション(site-concept 宿題処理=現段階不採用)。cycle-167でOwnerが無期限延期を解除 |
| B-135 | iOS Safari スクロールロックのフォールバック | P4 | 着手: 実害確認時 |
| B-219 | AI 画像生成 MCP サーバーの実装 | P2 | 着手: 必要性確認時。詳細 imagen4-proposal.md(archive) |
| B-317 | 時間関係ツールの追加 | P3 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。タイマー・ストップウォッチ等。詳細 tools-idea.md |
| B-318 | 画像を共有用に整えるワークフローツール | P3 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。1ページWF。詳細 tools-idea.md |
| B-319 | 動画/音声を共有用に整えるワークフローツール | P3 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。1ページWF。詳細 tools-idea.md |
| B-320 | 計算・変換関係ツールの追加(残: 比率等) | P3 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。cycle-252でパーセント計算機実施済。詳細 tools-idea.md |
| B-321 | テキスト・文章関係ツールの追加 | P3 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。読了時間推定・原稿用紙換算等。詳細 tools-idea.md |
| B-368 | 動画→GIF 変換ツール | P4 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。詳細 tools-idea.md |
| B-369 | プッシュ・トゥ・トーク(PTT)メモツール | P3 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。詳細 tools-idea.md |
| B-370 | 録音ファイル文字起こしツール | P3 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。B-369完了後推奨。詳細 tools-idea.md |
| B-371 | 画像合成ワークフローツール | P3 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。背景除去+色合わせ+重ね合わせ。詳細 tools-idea.md |
| B-372 | 写真カラーパレット抽出ツール | P3 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。詳細 tools-idea.md |
| B-373 | AI 画像超解像ツール(アップスケール) | P4 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。詳細 tools-idea.md |
| B-374 | 画像 OCR ツール(日本語横書き) | P3 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。詳細 tools-idea.md |
| B-375 | テキスト読み上げツール(再生+音声DL) | P3 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。詳細 tools-idea.md |
| B-376 | 四字熟語を自然言語で検索する道具 | P3 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。詳細 tools-idea.md |
| B-377 | 文章→雰囲気の近い日本伝統色ツール | P3 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。詳細 tools-idea.md |
| B-378 | テキスト類似度チェッカー | P3 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。A/B比較・重複文検出。詳細 tools-idea.md |
| B-379 | セマンティック検索メモ帳 | P3 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。B-378完了後。詳細 tools-idea.md |
| B-380 | ふりがな自動付与ツール | P3 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。詳細 tools-idea.md |
| B-381 | 文体一貫性チェッカー(ですます/だ・である調) | P3 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。詳細 tools-idea.md |
| B-382 | 既存日付ツールに自然言語入力を追加 | P3 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。詳細 tools-idea.md |
| B-383 | BPM 検出ツール | P4 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。詳細 tools-idea.md |
| B-384 | お絵かき認識ゲーム | P4 | 着手: フェーズCの個別再検討(needs再確認+判断基準1)で採否判断。詳細 tools-idea.md |
| B-088 | ビジネスメール・敬語早見表の拡充 | P4 | 着手: R-1プルーニングで対象ツール存続時に再評価。詳細 research/ |
| B-104 | 他ツールへの Worker 適用検討 | P4 | 着手: R-1プルーニングで対象ツール存続時に再評価。 |
| B-105 | プライバシー注記の拡張(ツール固有情報) | P4 | 着手: R-1プルーニングで対象ツール存続時に再評価。 |
| B-121 | パンくずリストへのシリーズ情報追加 | P4 | 着手: R-2ブログIA再設計後に再検討 |
| B-155 | QR コード入力上限・UI ブロッキング対策 | P4 | 着手: R-1プルーニングで対象ツール存続時に再評価。 |
| B-163 | ツール追加用スキャフォールドスクリプト | P3 | 着手: フェーズCでツール量産方式の決定時。出典 cycle-61 |
| B-435 | QR コードツールへの種別タブ追加 | P4 | 着手: R-1プルーニングで対象ツール存続時に再評価。詳細 cycle-246.md |
| B-437 | QR コードツールに SVG DL ボタン追加 | P4 | 着手: R-1プルーニングで対象ツール存続時に再評価。詳細 cycle-246.md |
| B-439 | QR コード装飾機能の提供可否再検討 | P5 | 着手: R-1プルーニングで対象ツール存続時に再評価。詳細 cycle-207.md |
| B-441 | QR コード DL ファイル名の連番回避策 | P4 | 着手: R-1プルーニングで対象ツール存続時に再評価。詳細 cycle-207.md |
| B-446 | PDF コピペ用ワンクリックプリセット | P3 | 着手: R-1プルーニングで対象ツール存続時に再評価。詳細 cycle-209.md |
| B-447 | smart-pdf の before-after 例 | P4 | 着手: R-1プルーニングで対象ツール存続時に再評価。詳細 cycle-209.md |
| B-448 | モードラベル補助テキスト追加(旧タイルUI) | P5 | 着手: R-1プルーニングで対象ツール存続時に再評価。着手条件に加え新デザインでの意味残存も確認 |
| B-503 | cron-parser プリセット拡充(5→8個) | P4 | 着手: R-1プルーニングで対象ツール存続時に再評価。 |
| B-588 | git履歴の不要バイナリ/生成物を除去 | P3 | 着手: Ownerの指示まで着手しない(履歴書換+force pushの破壊的操作)。cycle284混入の.py5+.pyc1(未push)・cycle177/180のルートPNG7枚・cycle210のPNG14枚(追跡中)が.gitignore違反で肥大化。git rm不可で履歴書換要。詳細cycle-284.md |

## Done/Cancel (完了・中止)

完了または中止したタスクをここへ記録します。**タスクは削除しません**（削除すると番号の意味が失われ、欠番の再利用で ID 衝突が起きるため。cycle-291 が B-600 を削除して cycle-292 で衝突が発生）。中止タスクも Notes に【中止】と理由を明記して残します。直近5サイクル分を保持し、それより前の項目は削除します（詳細は各サイクルドキュメントに残るため）。

| ID | Title | Cycle | Notes |
| --- | --- | --- | --- |
| B-589 | 判定が同点時に配列順で決着する件の検証 | 294 | 検証=到達不能タイプは全診断ゼロ・個別実害なし→判定ロジック不変更(是正不要)。将来事故防止に到達性の恒久ガード reachability.test.ts 新設。詳細cycle-294/ |
| B-602 | デバイス比計測の精緻化(広窓GA4・自己流入除外) | 293 | 【中止】キャリーオーバー定義(スコープ外かつ必須)不適合の誤起票につき取消。計測はスコープ内・広窓GA4は実行不可・自己流入除外は是正に不要。必要時に実施。番号は再利用しない。詳細cycle-293/incident-1.md |
| B-584 | DESIGN §10「実測:7割超がモバイル」が典拠なし | 293 | 是正=実測(BigQuery)でモバイル非多数派(セッション45.6%)・「7割超」は診断/play一面の誤一般化。L128を典拠つき「両対応必須」へ。§10他ラベル点検済。reviewer白紙で反復レビュー。詳細cycle-293/ |
| B-598 | 未結線の検索機能の処遇判断(結線 or 撤去) | 292 | 判断=撤去(cycle-186確定判断と整合・データも補強)。検索一式/索引生成/fuse.js/Header UIトリガーを撤去(673KB索引停止)・公開記事に日付注記。詳細cycle-292/ |
| B-601 | 検索撤去の教訓のブログ記事化 | 292 | 【中止】ブログ執筆をbacklog延期起票したのは完了手順違反。当サイクルで執筆を試みたが事実誤認発覚で取り下げ・公開見送り(下書きはgit履歴に保全・記事は不在)。番号は再利用しない。詳細cycle-292/ |
| B-600 | /play/character-personality の着地後エンゲージ是正 | 291 | 【中止】既決着結論(cycle-277/278・ADR001フェーズR)の再掘削だったため中止。cycle-291がDoneへ移さず削除したのを正しい運用(Done/Cancel記録)へ是正。再着手しないこと。詳細cycle-291/incident-1.md |
| B-596 | ブログTOCアンカーのスラッグ不一致(code入り見出し) | 290 | 見出しid生成を2経路(DOM/TOC)から単一生成元化・エンティティ復号でcode内容保持。reviewer指摘Blocker=module共有状態の並行汚染をper-call Markedインスタンスで解消(回帰テスト2件)。学びをブログ公開。詳細cycle-290/ |
| B-595 | ゲーム自動オープンモーダルのEsc閉じ後focus復帰 | 289 | 共有useDialogにreturnFocusRef追加でh1(tabIndex=-1)へ復帰・open時focusはpreventScrollでスクロール保持。4ゲーム配線・回帰4件・Result実測。詳細cycle-289/ |
| B-593 | ツールのセクション見出しの階層是正(h1→h3飛び) | 288 | 7ツール本体見出し18箇所をh3→h2(全てh1直下トップレベル=一律h2が正)。視覚不変(クラスがfont-size明示+全称マージンリセット)。回帰テスト10件追加。reviewer承認。実測でbacklog「約30」を7ファイルに訂正。詳細cycle-288/ |
| B-505 | Dependabot 脆弱性アラートの調査と対応 | 286 | 20アラートの到達性評価=REACHABLE-VISITOR 0件。全依存を最新へ更新し破壊メジャーのみ検証で戻す。audit13→0。詳細cycle-286/ |
| B-591 | 残dev-only高脆弱性(transformers連鎖)の解消 | 286 | 完了処理のCI確認でadm-zip更新失敗が判明→build専用transformers除去でaudit0。詳細cycle-286/ |
