## Active (進行中)

| ID | Title | Priority | Target Cycle | Notes |
| --- | --- | --- | --- | --- |

## Queued (すぐに着手できる)

| ID | Title | Priority | Target Cycle | Notes |
| --- | --- | --- | --- | --- |
| B-576 | favicon/apple-touch-icon を店構えへ | P1 | - | cycle-299失敗・旧ブランドへrevert(成果物なし)。歪んだレビューで16px不可読を出荷し不正・隠蔽を重ねた。次はfavicon単体でなくfavicon/apple/OGPを印から一系で再設計。詳細cycle-299/incident-1・2 |
| B-603 | character-personality 24タイプ一覧の処遇(T3・再判定) | P1 | - | **未決へ差し戻し**。cycle-298は測定面を誤り判定撤回(cycle-284の実測が正しかった)。主たる面で基準を立て直し再判定。詳細cycle-298/decision.md |
| B-607 | character-personality F3申し送り(逆順主軸の和らげ・設問磨き) | P1 | - | cycle-295 F3=逆順フォールバック12順序対でcount二位気質が「主軸」提示される件の本文和らげ+設問文の裁量的ブラッシュアップ。旧B-603から分離(cycle-298)。詳細cycle-295/296 |
| B-606 | 全10 personality診断の結果先行の点検・再設計(Rule4) | P1 | - | **cycle-297で開いたやりかけ(wakakusa暫定含む)の根治**。本筋はcycle-295 G1〜G5の結果先行再設計。1診断ずつ・優先=強い本人性群。B-603との前後関係は着手時に再判断。詳細=cycle-297/triage.md+incident-2 |
| B-573 | UI/UX/アクセシビリティの全面適用(残: 全面展開) | P1 | - | cycle-287で監査+代表原型の是正スライス完了(F1-F5)。残=全81ページ/36ツールへの全面展開。系統的な個別項目はB-593/595/596/599等に分割起票済。詳細cycle-287/ |
| B-609 | レビュー体制の構造的欠陥(基準違反の検出漏れ)の是正 | P2 | - | cycle-298判明+cycle-300。残=(a)基準違反がMinor判定(b)candidates非読込(c)pre-commit検出漏れ(d)観点が計器選択の妥当性(AP-P31等)を問わない。詳細cycle-298/incident-3・cycle-300/incident-1 |
| B-610 | ADR001+rebuild-plan§1(a)の「オーナー裁定」ラベル是正(AP-P34) | P2 | - | cycle-298発覚+cycle-300で原発言を逐語検証済(全面A/B棄却はPM導出・A/Bは却下されていない)。帰属を是正。詳細cycle-300/incident-1 |
| B-611 | brand-icons生成器のhex乖離ガード不在 | P4 | - | cycle-299発覚。生成器色定数がutsuwaHex.tsを文字列再宣言(node-standalone維持の受容トレードオフ)。乖離ガード無くSSoT変更時サイレント乖離しうる。実害は再生成時のみ。詳細cycle-299 |
| B-594 | /play/daily の見出し構造是正(h1不在) | P3 | - | cycle-287 C2(F5姉妹)。監査ページはF5でh2化済。ResultPageShellは既にh1あり是正不要。残=dailyがh1不在(タイトルがTsutsumi<p>のみ)=h1相当が必要。実DOM確認のうえ是正。詳細cycle-287/findings.md |
| B-597 | テーマトグルのタップ標的高さ(28px)のDESIGN準拠 | P4 | - | cycle-287監査C5。switch高さ28px=DESIGN§10の44px未満(WCAG2.5.8 24pxは充足)。当たり判定拡大の要否をDESIGN基準で判断。詳細cycle-287/findings.md |
| B-599 | 辞典/共有まわりのa11y軽微群 | P4 | - | cycle-287監査C8。同部首117リンクがdiv(list構造喪失)/辞典ヒーロー大字がaria-hidden無で二重読み/共有ボタンの外部予告が面で不整合。詳細cycle-287/findings.md |
| B-575 | 診断結果のシェアが少ない事実の扱い | P3 | - | share≈2件/28d(旧B-550・フェーズR前の古計測)。着手時は来訪者価値で正当化。経緯・扱いはcycle-285.md |
| B-586 | rebuild-plan.md の処遇(archive移動)と参照元の付け替え | P2 | - | 作り直しはcycle-279完了・中身はbacklog/ADRへ移設済だが参照(ADR001・cycle-kickoff SKILL等)が残る=archive移動と参照付け替えが要る。cycle-284重大事故の舞台。詳細cycle-284.md事故報告 |
| B-583 | 「店構え」統一と印の要否を来訪者価値から再検討 | P3 | - | 店構え統一・印の要否を来訪者価値から再評価。旧着手条件は消滅済(Queued)。詳細cycle-283.md/cycle-285.md |
| B-574 | イディオム2一覧のアクセシブル名浄化(stretched-link化) | P4 | - | B-573のa11y掃討の一部。SRが連結を読む冗長さを主リンク名のみへ。cycle-287で辞典検索結果リンクにも同種確認(C6)。詳細cycle-281.md/cycle-287 |
| B-581 | AP-P33の境界値サンプリング運用化 | P3 | - | cycle-283でPMがAP-P33を再犯(near-white辞典色を実見サンプルから落とし埋没欠陥を見逃す・reviewer捕捉)。「価値の種類で選ぶ」では不足で「失敗軸の両端=境界を必ず含める」を実際の抽出手順に明文化。詳細cycle-283.md自己批判 |
| B-582 | 伝統色辞典250件のromaji表記統一の点検 | P3 | - | cycle-283で色OGP(看板)にromaji露出。shinsyu(真朱)等ヘボン式/訓令式混在の兆候。既存データ由来だが拡散面へ昇格。250件の表記一貫性を点検。詳細cycle-283.md |
| B-562 | フェーズC-a: 新クラスタの立ち上げ | P1 | - | フェーズR(B-561)完了(cycle-279)で解禁。候補の正典=research/2026-07-11-market-research-cycle278.md T4節。着手時に個別裏取り+実験台帳へ事前登録。同時2クラスタ以下。詳細 rebuild-plan.md §3 |
| B-564 | フェーズC-c: 辞典の処遇判断(体験化orプルーニング) | P2 | - | フェーズR完了で解禁。検定エンジン検討(B-562)と同時に判断。B-521で辞書CTR 0.08%=参照型の敗北兆候TW-Aと判明済(ADR001)。詳細 rebuild-plan.md §3 |
| B-566 | ツールの処遇判断(最高価値に磨いてから改善orプルーニング) | P2 | - | フェーズR完了で解禁の専用取組。SC表示数による一律削除は撤回済(cycle-279・rule4)。詳細 cycle-279.md・rebuild-plan §2 R-1 |
| B-569 | 全診断のmeta/FAQのタイプ名例示が自診断に実在するか横断監査 | P3 | - | cycle-280でcharacter-personalityに別診断のタイプ名混入を発見・是正。検索結果の説明文の実害。他診断の同種混入を点検。詳細 cycle-280.md |
| B-494 | Dynamic Workflows 運用知見の knowledge 恒久化 | P2 | 279 | **フェーズR(workflow一斉切替)の前提整備として昇格**。6点の知見をknowledge化。詳細 cycle-225.md |
| B-540 | アンチパターン集の規約準拠クリーンアップ+再発防止 | P1 | - | cycle-257起票以来未着手で違反と自己是正が反復。(a)現存違反箇所の是正(b)enforcement設計(c)B-390との統合/廃止判断。着手順はkickoffで来訪者価値と比較。詳細cycle-300/incident-2 |
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
| B-565 | 全面切替の観測(ADR001・継続) | P2 | 着手: 出荷+4週(2026-08-10・トリップワイヤ発火判定＋完走率の実機点検と方向再読)・結論は+3ヶ月窓。cycle-300で+2週読み始め完了。正典=ADR001。詳細cycle-300 |
| B-612 | 診断完走率低下を同時期対照で切り分け | P2 | 着手: ADR001+4週(2026-08-10)の実機点検の結果を見てから設計。前後比較では効果分離不可(AP-P31)。比較対象(セグメント分解/摩擦低減版/旧復元)は設計で決める。詳細cycle-300/incident-1 |
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
| B-608 | (欠番) | 298 | 【中止】前提だったcycle-298の畳み込み自体が誤りでrevert。番号は再利用しない。詳細cycle-298/incident-1.md |
| B-604 | 他10診断(汎用配列順タイブレーク)の結果先行トリアージ | 297 | 【完了】全10がタイブレークのRule4欠陥を共有(→B-606)・dead type=traditional-color/wakakusaを本サイクル是正。当初harnessの弱い測度誤りはレビュー捕捉で是正(AP-P02派生)。詳細cycle-297/triage.md |
| B-605 | cycle-296ブログ(テストの穴の教訓)の独立レビュー+公開 | 296 | 【中止】スコープ内作業のキャリーオーバー化=誤起票(不正完了=incident-1)。当サイクルで独立レビュー実施し公開しない判断で決着。番号再利用しない。詳細cycle-296 |
| B-589 | 玄関 character-personality の判定を実在させる(回答が結果を決める) | 295 | 【完了】判定を結果先行で再設計・出荷(配列順→6アーキタイプのcount軸判定)。全ゲートPASS(G1=24/24・恣意36〜46%→1.6%)・到達不能2タイプ回復。結果テキストはB-603。詳細cycle-295 |
