# ブログ記事コンテンツ分析レポート

**作成日**: 2026-04-07  
**対象**: `src/blog/content/` 配下の全記事（53記事）  
**目的**: 各記事が実際にどのようなトピック・キーワードで書かれているかを明らかにし、SEOポテンシャルをゼロベースで評価する基礎データを整備する

---

## 1. 全体サマリー

総記事数: **53記事**  
公開期間: 2026-02-13 〜 2026-04-03（約2ヶ月）

### カテゴリ別記事本数

| カテゴリ                          | 記事数 | 割合  |
| --------------------------------- | ------ | ----- |
| dev-notes（開発技術メモ）         | 19     | 35.8% |
| ai-workflow（AIエージェント運用） | 15     | 28.3% |
| site-updates（サイト更新報告）    | 8      | 15.1% |
| tool-guides（ツール使い方ガイド） | 7      | 13.2% |
| japanese-culture（日本語・文化）  | 5      | 9.4%  |

---

## 2. カテゴリ別・記事一覧と主要キーワード

### 2-1. dev-notes（19記事）

開発技術メモ。Next.js関連が7記事あり独立したサブクラスターを形成。残り12記事はJavaScript/Web開発一般、マークダウン・セキュリティ等。

| スラッグ                                               | タイトル                                                                         | 主要キーワード                                                           |
| ------------------------------------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| nextjs-static-tool-pages-design-pattern                | Next.js App Routerで20個の静的ツールページを構築する設計パターン                 | Next.js App Router, 動的ルーティング, SSG, レジストリパターン            |
| japanese-traditional-colors-dictionary                 | 日本の伝統色250色の辞典を作りました: プログラマティックSEOの実践                 | プログラマティックSEO, 伝統色, Next.js静的生成                           |
| dark-mode-toggle                                       | ダークモードを手動で切り替えられるようになりました                               | next-themes, ダークモード, FOUC防止                                      |
| site-search-feature                                    | サイト内検索を実装しました -- Fuse.jsで500件の日本語コンテンツを横断検索         | Fuse.js, サイト内検索, Cmd+Kモーダル, 日本語ファジー検索                 |
| game-infrastructure-refactoring                        | ゲームインフラのリファクタリング: 12モーダルの共通化とレジストリパターンの導入   | リファクタリング, レジストリパターン, React共通コンポーネント            |
| tool-reliability-improvements                          | ツールの信頼性向上: ReDoS対策とプライバシー注記の導入                            | ReDoS, Web Worker, タイムアウト, Turbopack                               |
| nextjs-directory-architecture                          | Next.jsの多コンテンツサイトに最適なディレクトリ構造を求めて: 6パターン比較と実践 | Next.js ディレクトリ構造, App Router, ハイブリッド型, フィーチャーベース |
| game-dictionary-layout-unification                     | ゲームと辞典のLayout共通化: 品質要素を全コンテンツに広げる第3弾                  | Next.js Layout, TypeScript, コンポーネント設計                           |
| url-structure-reorganization                           | URLを変えるべきか迷ったら: SEO・UX・競合の3軸で判断するURL設計フレームワーク     | URL設計, SEO, UX, リダイレクト                                           |
| admonition-gfm-alert-support                           | marked で GFM Alert（補足ボックス）を実装する                                    | marked, GFM Alert, ダークモード対応, marked-alert                        |
| cron-expression-pitfalls-dom-dow-parseint              | cron式の日と曜日がOR判定になる仕様と落とし穴                                     | cron式, DOM/DOW, OR判定, parseInt                                        |
| javascript-date-pitfalls-and-fixes                     | JavaScriptのDate APIに潜む2つの落とし穴                                          | JavaScript Date, タイムゾーン, UTC, 自動補正                             |
| markdown-sanitize-html-whitelist-design                | MarkedのHTML出力を安全にする設計ガイド                                           | marked, sanitize-html, ホワイトリスト, XSS対策                           |
| mermaid-gantt-colon-trap-and-render-testing            | Mermaid ganttチャートのコロンの罠とmermaid.render()によるテスト戦略              | Mermaid.js, ganttチャート, vitest, jsdom                                 |
| nextjs-dynamic-import-pitfalls-and-true-code-splitting | next/dynamicの2つの落とし穴                                                      | next/dynamic, コード分割, ローディングフラッシュ                         |
| nextjs-hydration-mismatch-seeded-random                | Next.jsハイドレーション不整合をシード付き乱数で解決する                          | hydration mismatch, シード付き乱数, 線形合同法                           |
| nextjs-seo-metadata-and-json-ld-security               | Next.jsサイトのSEOメタデータ完全対策                                             | OGP, canonical, Twitter Card, JSON-LD, sitemap                           |
| nextjs-route-handler-static-and-bundle-budget-test     | Next.js 15のRoute Handlerデフォルト変更                                          | Next.js 15, Route Handler, バンドルサイズ, Turbopack                     |
| nextjs-dynamic-and-dedicated-route-coexistence         | Next.js 動的ルートと専用ルートの共存パターン                                     | 動的ルート, 専用ルート, バンドル最適化                                   |

**dev-notesのサブクラスター:**

- **Next.jsシリーズ（7記事）**: App Router設計, hydration mismatch, SEOメタデータ, Route Handler, ディレクトリ構造, next/dynamic, 動的/専用ルート共存
- **JavaScript/Web一般（5記事）**: Date API落とし穴, cron式落とし穴, ReDoS対策, URL設計
- **マークダウン・セキュリティ（4記事）**: marked, GFM Alert, Mermaid.js, sanitize-html
- **UI/実装（3記事）**: ダークモード, サイト内検索, ゲームインフラ

---

### 2-2. ai-workflow（15記事）

AIエージェント自律運用の実験記録。サイト固有の体験談が主体。外部検索需要は限定的だが「AIエージェント運用」「Claude Code」関連では独自性が高い。

| スラッグ                                                | タイトル                                                             | 主要キーワード                                                 |
| ------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------- |
| how-we-built-this-site                                  | AIエージェント7人チームでWebサイトをゼロから構築した全記録           | AIエージェント, Claude Code, 自律運用, メモシステム            |
| content-strategy-decision                               | コンテンツ戦略の決め方                                               | コンテンツ戦略, AIエージェント意思決定, SEO                    |
| five-failures-and-lessons-from-ai-agents                | AIエージェント運用で遭遇した5つの失敗と解決策                        | hydration mismatch, Vercelデプロイ, AIエージェント失敗         |
| how-we-built-10-tools                                   | 10個のオンラインツールを2日で作った方法                              | AIエージェント協働, ワークフロー設計                           |
| spawner-experiment                                      | 自動エージェント起動システム「spawner」の実験と凍結                  | fs.watch, プロセス管理, 自動起動                               |
| workflow-evolution-direct-agent-collaboration           | ワークフロー進化: エージェント直接連携とサイクルカタログの導入       | Claude Code, ワークフロー設計                                  |
| cheatsheets-introduction                                | 10種類のコンテンツタイプを比較してチートシートを選んだ話             | コンテンツ戦略, チートシート, 競合分析                         |
| workflow-simplification-stopping-rule-violations        | AIエージェントのルール違反が止まらない                               | Claude Codeスキル, ワークフローシンプル化                      |
| workflow-skill-based-autonomous-operation               | AIエージェントを4つのスキルで自律運用する                            | Claude Code skills, サイクルドキュメント, レビューループ       |
| ai-agent-concept-rethink-1-bias-and-context-engineering | AIエージェントの思考バイアスとコンテキストエンジニアリング           | コンテキストエンジニアリング, 思考バイアス, ホワイトリスト方式 |
| ai-agent-concept-rethink-2-forced-ideation-1728         | 1,728通りの強制発想法でバイアスを構造的に排除する                    | 強制発想法, バイアス排除, Claude並行評価                       |
| ai-agent-concept-rethink-3-workflow-limits              | セッション長期化がAIエージェントの自律運用を破壊する                 | Lost in the Middle, コンテキスト圧縮, セッション管理           |
| memo-system-rise-and-fall                               | エージェント間のやり取りで最もコストが高いのは、やり取りの管理だった | マルチエージェント, メモシステム, コンテキスト圧迫             |
| ai-agent-verification-step-skip                         | AIエージェントは「最後の確認」を省略する                             | 検証ステップ省略, AIエージェント行動パターン                   |
| pm-premise-contamination-in-multi-agent-ai              | 【失敗事例】AIマルチエージェントで全員が正しく動いても間違える構造   | 前提汚染, マルチエージェント, 失敗事例                         |

**ai-workflowの特徴:**

- 「ai-agent-ops」シリーズ（12記事）が連載として整備されている
- Claude Code固有の話題が多く、検索キーワードとして「Claude Code ワークフロー」「AIエージェント 自律運用」「コンテキストエンジニアリング」が中心

---

### 2-3. site-updates（8記事）

サイト機能リリースのお知らせ記事。内部向け記録の色が強く、外部検索需要は低い。

| スラッグ                       | タイトル                                                | 主要キーワード                              |
| ------------------------------ | ------------------------------------------------------- | ------------------------------------------- |
| site-rename-yolos-net          | サイト名を「yolos.net」に変更しました                   | yolos.net, サイト名変更                     |
| tools-expansion-10-to-30       | ツールを10個から30個に拡充しました                      | プログラマティックSEO, オンラインツール拡充 |
| quiz-diagnosis-feature         | クイズ・診断テスト機能をリリースしました                | 漢字力診断, 伝統色診断, クイズ              |
| business-email-and-keigo-tools | ビジネスメール作成ツールと敬語早見表を公開しました      | ビジネスメール, 敬語, 形態素解析            |
| rss-feed-and-pagination        | サイト基盤の整備: メモRSSフィードとページング機能の追加 | RSS, ページネーション                       |
| series-navigation-ui           | ブログシリーズナビゲーションUIの導入                    | シリーズナビゲーション, 自動生成            |
| content-trust-levels           | コンテンツ信頼レベルの導入                              | verified/curated/generated, 信頼性バッジ    |
| traditional-color-palette-tool | 伝統色カラーパレットツールを作りました                  | 伝統色, カラーパレット, 色彩調和            |

---

### 2-4. tool-guides（7記事）

ツールの使い方・技術ガイド。ハウツー検索に対応するコンテンツで、外部検索流入ポテンシャルが最も高いカテゴリ。

| スラッグ                                  | タイトル                                                     | 主要キーワード                                         |
| ----------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| character-counting-guide                  | 文字数カウントの正しいやり方: 全角・半角・改行の違いと注意点 | 文字数カウント, 全角半角, Unicode, 絵文字, SNS文字数   |
| cron-parser-guide                         | cron式の書き方ガイド: 環境別の違いと限界を徹底解説           | cron式, GitHub Actions, AWS EventBridge, systemd timer |
| json-formatter-guide                      | JSON整形・フォーマッターの使い方ガイド                       | JSON整形, JSONエラー, JSONL, YAML, JSON5               |
| regex-tester-guide                        | 正規表現テスターの使い方: 初心者から実践まで                 | 正規表現, ReDoS, パターン集                            |
| sns-optimization-guide                    | 日本のWebサイト管理者のためのSNS最適化ガイド                 | OGP最適化, シェアボタン, X/LINE/はてブ                 |
| http-status-code-guide-for-rest-api       | REST APIで迷いがちなHTTPステータスコードの選び方ガイド       | HTTPステータスコード, 401 vs 403, REST API設計         |
| adsense-content-quality-audit-methodology | AdSense「有用性の低いコンテンツ」を乗り越える                | AdSense審査, コンテンツ品質監査, E-E-A-T               |

---

### 2-5. japanese-culture（5記事）

日本語・伝統文化・ゲーム関連。「japanese-culture」シリーズ（5記事）として連載構成。

| スラッグ                         | タイトル                                                          | 主要キーワード                                         |
| -------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------ |
| japanese-word-puzzle-games-guide | 日本語パズルゲームで毎日脳トレ: 4つの無料デイリーゲームの楽しみ方 | 日本語パズルゲーム, 脳トレ, 漢字ゲーム, 四字熟語ゲーム |
| yojijukugo-learning-guide        | 四字熟語の覚え方: 意味・由来を知って楽しく学ぶ方法                | 四字熟語 覚え方, 由来, 学習法                          |
| irodori-and-kanji-expansion      | イロドリ: 伝統色250色で遊ぶ色彩チャレンジゲーム                   | 伝統色ゲーム, イロドリ, 色彩チャレンジ                 |
| yoji-quiz-themes                 | 四字熟語クイズ2テーマ追加                                         | 四字熟語クイズ, 性格診断, 知識テスト                   |
| kotowaza-quiz                    | ことわざ・慣用句力診断: 10問のクイズで語彙力を測定しよう          | ことわざ, 慣用句, 語彙力診断                           |

---

## 3. GA4 OS流入データとの突合

提供された流入データ（オーガニック検索流入のあった記事）との対照分析:

| スラッグ                      | カテゴリ    | OS流入数/月     | キーワード推定                                          |
| ----------------------------- | ----------- | --------------- | ------------------------------------------------------- |
| nextjs-directory-architecture | dev-notes   | **4セッション** | 「Next.js ディレクトリ構造」「Next.js App Router 設計」 |
| character-counting-guide      | tool-guides | **2セッション** | 「文字数カウント 全角半角」「文字数 数え方」            |
| site-search-feature           | dev-notes   | **2セッション** | 「Fuse.js 日本語」「Next.js 検索 実装」                 |
| how-we-built-this-site        | ai-workflow | **2セッション** | 「AIエージェント Webサイト 構築」「Claude Code」        |

### 流入記事の共通特性

1. **nextjs-directory-architecture（最多: 4セッション）**: タイトルに「6パターン比較」と具体的な数値を含む。480行という最大クラスの記事ボリューム。ファイル名でも「Next.js directory architecture」という英語キーワードが含まれている。
2. **character-counting-guide（2セッション）**: 実務的なhow-to記事。全角・半角・Unicode・絵文字など横断的なキーワードカバレッジ。
3. **site-search-feature（2セッション）**: 「Fuse.js」という具体的なライブラリ名を含む。実装ノウハウ系。
4. **how-we-built-this-site（2セッション）**: 「AIエージェント + Webサイト構築」という話題性のある組み合わせ。

**共通パターン**: 流入がある記事は全て、具体的な技術名・ライブラリ名・問題解決フレームワークを明示しており、検索意図（問題解決型 or 情報収集型）に合致している。

---

## 4. カテゴリ別SEOポテンシャル評価

### 4-1. dev-notes - Next.jsシリーズ（SEOポテンシャル: 高）

**記事数**: 7記事  
**有望キーワード候補**:

| キーワード                          | 記事                                                   | 想定検索意図 |
| ----------------------------------- | ------------------------------------------------------ | ------------ |
| Next.js App Router 設計パターン     | nextjs-static-tool-pages-design-pattern                | 実装方法     |
| Next.js ディレクトリ構造 App Router | nextjs-directory-architecture                          | 設計相談     |
| Next.js hydration mismatch 解決     | nextjs-hydration-mismatch-seeded-random                | トラブル解決 |
| Next.js SEO OGP 設定                | nextjs-seo-metadata-and-json-ld-security               | 実装方法     |
| next/dynamic コード分割             | nextjs-dynamic-import-pitfalls-and-true-code-splitting | トラブル解決 |
| Next.js 15 Route Handler            | nextjs-route-handler-static-and-bundle-budget-test     | 仕様確認     |
| Next.js 動的ルート 共存             | nextjs-dynamic-and-dedicated-route-coexistence         | 設計相談     |

**強み**: 実際の実装経験に基づく具体的な問題解決コンテンツ。日本語での詳細解説が競合優位になり得る。

---

### 4-2. tool-guides（SEOポテンシャル: 最高）

**記事数**: 7記事  
**有望キーワード候補**:

| キーワード                          | 記事                                      | 想定検索需要       |
| ----------------------------------- | ----------------------------------------- | ------------------ |
| 文字数カウント 全角半角 違い        | character-counting-guide                  | 高（実務需要）     |
| cron式 書き方 GitHub Actions        | cron-parser-guide                         | 高（開発者需要）   |
| JSON整形 使い方                     | json-formatter-guide                      | 高（日常的)        |
| 正規表現 テスター 使い方            | regex-tester-guide                        | 高（学習需要）     |
| HTTPステータスコード 401 403 違い   | http-status-code-guide-for-rest-api       | 中高（API開発者）  |
| OGP 設定 X LINE シェアボタン        | sns-optimization-guide                    | 中（Web担当者）    |
| AdSense 有用性の低いコンテンツ 対策 | adsense-content-quality-audit-methodology | 中（サイト運営者） |

**強み**: 検索意図（問題解決・how-to）と直接一致する記事構成。既にGA4で流入実績あり（character-counting-guide）。

---

### 4-3. japanese-culture（SEOポテンシャル: 中）

**記事数**: 5記事  
**有望キーワード候補**:

| キーワード               | 記事                             | 想定検索需要   |
| ------------------------ | -------------------------------- | -------------- |
| 四字熟語 覚え方          | yojijukugo-learning-guide        | 高（学習需要） |
| 日本語 パズルゲーム 無料 | japanese-word-puzzle-games-guide | 中             |
| ことわざ 慣用句 クイズ   | kotowaza-quiz                    | 中             |

**課題**: サイト固有のゲーム名（イロドリ、四字キメル等）は認知度が低く、ブランド検索以外の流入を狙いにくい。「四字熟語 覚え方」のような一般的学習キーワードが流入ポテンシャルを持つ。

---

### 4-4. ai-workflow（SEOポテンシャル: 中低）

**記事数**: 15記事  
**有望キーワード候補**:

| キーワード                    | 記事                                                    | 想定検索需要       |
| ----------------------------- | ------------------------------------------------------- | ------------------ |
| AIエージェント Webサイト 構築 | how-we-built-this-site                                  | 中（話題性）       |
| Claude Code ワークフロー      | workflow-skill-based-autonomous-operation               | 中（Claude利用者） |
| コンテキストエンジニアリング  | ai-agent-concept-rethink-1-bias-and-context-engineering | 中（AI開発者）     |
| AIエージェント 失敗事例       | pm-premise-contamination-in-multi-agent-ai              | 中（AI開発者）     |
| Lost in the Middle            | ai-agent-concept-rethink-3-workflow-limits              | 低中               |

**強み**: 一次情報（実際の運用失敗・成功）に基づくため、競合が出しにくい独自コンテンツ。  
**課題**: 多くの記事がサイト固有の体験談であり、汎用キーワードでの流入には限界がある。

---

### 4-5. site-updates（SEOポテンシャル: 低）

**記事数**: 8記事  
外部検索流入よりも既存訪問者への情報提供が主目的。サイトリリースノート的な位置づけ。新規検索流入を期待する記事ではない。

---

## 5. 全体評価と優先順位

### SEO観点での優先度マトリクス

| 優先度 | カテゴリ・クラスター                 | 理由                                                        |
| ------ | ------------------------------------ | ----------------------------------------------------------- |
| 最高   | tool-guides（7記事）                 | 検索意図一致、GA4流入実績あり、競合表現可能な実務キーワード |
| 高     | dev-notes - Next.jsシリーズ（7記事） | 技術検索需要あり、GA4最多流入（4セッション/月）確認済み     |
| 中     | ai-workflow（15記事）                | 独自一次情報、Claude Code関連需要成長中                     |
| 中     | japanese-culture（5記事）            | 四字熟語学習など一般需要あるキーワードあり                  |
| 低     | site-updates（8記事）                | 内部向け記録、新規流入ポテンシャル低                        |
| 低     | dev-notes - その他（12記事）         | 専門特化しすぎ、または競合多数                              |

### 現状の課題

1. **記事量の偏り**: dev-notes（35.8%）とai-workflow（28.3%）が全体の64%を占める。SEOポテンシャルが最高のtool-guidesは7記事（13.2%）に留まる。
2. **site-updatesの比率が高い**: 8記事（15.1%）がサイト更新報告であり、検索流入に繋がりにくい。
3. **GA4流入4記事の共通点**: いずれも「具体的な技術名・数値・問題名」をタイトルに含み、実装ノウハウ型の記事構成になっている。この形式をtool-guidesとNextJsシリーズで拡充すべき。

### 有望なSEOキーワード候補まとめ

**短期で流入増が見込めるキーワード（既存記事の最適化で対応可能）:**

- 「文字数カウント 全角半角」（character-counting-guide）
- 「Next.js ディレクトリ構造」（nextjs-directory-architecture）
- 「cron式 GitHub Actions 書き方」（cron-parser-guide）
- 「JSON整形 使い方」（json-formatter-guide）
- 「HTTPステータスコード 401 403」（http-status-code-guide-for-rest-api）

**中期で狙えるキーワード（新記事追加が効果的）:**

- 「四字熟語 覚え方」「四字熟語 意味 由来」
- 「Next.js App Router 設計」
- 「AIエージェント Claude Code 実践」
- 「正規表現 パターン集 日本語」
- 「ことわざ 意味 一覧」
