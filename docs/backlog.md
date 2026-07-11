## Active (進行中)

| ID | Title | Priority | Target Cycle | Notes |
| --- | --- | --- | --- | --- |
| B-545 | サイトの根幹を統一する(本丸) | P1 | 279 | cycle-278(オーナー主導)でコンセプト(site-concept.md)・デザインシステム(DESIGN.md)・作り直し計画(rebuild-plan.md)を再導出済み。**完了=フェーズR(B-561)の出荷**。詳細 cycle-278.md |

## Queued (すぐに着手できる)

| ID | Title | Priority | Target Cycle | Notes |
| --- | --- | --- | --- | --- |
| B-561 | フェーズR: 全ページ一斉デザイン切替(workflow) | P1 | 279 | R-1撤去(道具箱/タイル完全破棄・0クリックツールのプルーニング・旧実験打ち切り記録)→R-2切替(全ルート「店構え」化・route group解消・ナビ/IA・コピー書き直し・T5必達申し送り)→R-3観測開始(EXP-002)。正典 docs/rebuild-plan.md §2 |
| B-494 | Dynamic Workflows 運用知見の knowledge 恒久化 | P2 | 279 | **フェーズR(workflow一斉切替)の前提整備として昇格**。6点の知見をknowledge化。詳細 cycle-225.md |
| B-540 | アンチパターン集の規約準拠クリーンアップ | P2 | - | docs/anti-patterns/全体の規約違反を一般化+発生番号のみへ是正。詳細 cycle-257.md |
| B-505 | Dependabot 脆弱性アラートの調査と対応 | P2 | - | cycle-277 push時に19件(high3)。増分の調査・対応要。詳細 cycle-246.md |
| B-432 | trustLevel フィールド・関連型・テストの完全削除 | P2 | - | 一括完全削除(漸進禁止=AP-I02)。フェーズRと同時実施が効率的。詳細 cycle-200.md |
| B-557 | 旧道具箱時代ブログ2本への編集注記 | P3 | 279 | 日記型のため追記型注記。フェーズRの道具箱撤去と同時に実施。詳細 cycle-277.md T8 |
| B-551 | level_end/share の content_id 接頭辞不一致是正 | P3 | 279 | フェーズRの計測再設計(札保存/共有イベント新設)に含めて解消。詳細 cycle-273.md |
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
| B-429 | test-results/ の prettier/git 管理整備 | P4 | - | .prettierignore/.gitignore 追加。詳細 cycle-197.md |
| B-508 | ブログ frontmatter 裸配列残骸の一括除去 | P4 | - | 残り4本。B-432と整合注意 |
| B-520 | kanji-data.json kunYomi 重複クレンジング | P4 | - | 辞典の処遇判断(B-564)と連動。詳細 cycle-251.md |
| B-454 | PM即時編集(b)経路の差分レビューログ明文化 | P4 | - | AP-WF09/11明文化。詳細 cycle-210/230.md |
| B-158 | 開発体験改善(警告ログノイズ制御) | P4 | - | NEXT_PUBLIC_BASE_URL 未設定時の警告過多 |
| B-103 | Turbopack Worker安定化後の外部Workerファイル移行 | P4 | - | 安定化後に外部ファイル化 |
| B-123 | フィーチャーディレクトリ features/ 集約 | P4 | - | src/直下が20超になった時点で検討 |
| B-450 | tmp パス命名規約 SSoT 化 | P5 | - | 詳細 cycle-210.md |

## Deferred (すぐに着手できない)

| ID | Title | Priority | Notes |
| --- | --- | --- | --- |
| B-521 | cycle-251 漢字辞書CTR改善の効果検証 | P2 | 着手: 2026-07-16目安。**フェーズR切替前に読む**(切替後は交絡・experiments.md EXP-003)。詳細 cycle-251.md |
| B-562 | フェーズC-a: 新クラスタの立ち上げ | P1 | 着手: フェーズR(B-561)完了後。候補の正典=research/2026-07-11-market-research-cycle278.md T4節。着手時に個別裏取り+実験台帳へ事前登録。同時2クラスタ以下。詳細 rebuild-plan.md §3 |
| B-563 | フェーズC-b: 診断結果面の「共有できる記号」磨き込み | P2 | 着手: フェーズR完了後。札/印の実装はRで入る・記号の中身とA/Bはここ。詳細 rebuild-plan.md §3 |
| B-564 | フェーズC-c: 辞典の処遇判断(体験化orプルーニング) | P2 | 着手: 検定エンジン検討(B-562)と同時。詳細 rebuild-plan.md §3 |
| B-565 | EXP-002: 全面切替の観測 | P2 | 着手: 切替+2週(読み始め)・結論は+3ヶ月窓。正典 experiments.md。双方向ガード |
| B-056 | i18n(多言語対応) | P4 | 着手: 将来オプション(site-concept 宿題処理=現段階不採用)。cycle-167でOwnerが無期限延期を解除 |
| B-135 | iOS Safari スクロールロックのフォールバック | P4 | 着手: 実害確認時 |
| B-219 | AI 画像生成 MCP サーバーの実装 | P2 | 着手: 必要性確認時。詳細 imagen4-proposal.md(archive) |

## Done (完了)

以下は直近5サイクル分の完了タスクです。6サイクルより前のタスクは削除してください。

| ID | Title | Completed Cycle | Notes |
| --- | --- | --- | --- |
| B-559 | デザインシステムのゼロベース導出 | 278 | 新 DESIGN.md「店構え」(レビュー4巡承認・試作5画面検証)。詳細 cycle-278.md T5 |
| B-560 | 残移行/legacy撤去の検証方針の決着 | 278 | cycle-268結論を根拠付き棄却(棄却の柱=デュアル保守の放棄・以後は面単位インライン実験)。詳細 rebuild-plan.md §1 |
| - | **バックログ大整理(cycle-278)** | 278 | rebuild-plan による無効化・包含で **91項目をクローズ**(フェーズR包含・タイル/道具箱破棄・供給起点ツール案の廃棄・打ち切り観測・コンセプト置換・ターゲット定義廃止)。**全リストと理由は cycle-278.md「バックログ整理の記録」**。復活はクエリ在庫/需要検証経由でのみ |
