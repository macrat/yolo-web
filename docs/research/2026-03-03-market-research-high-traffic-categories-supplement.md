# 高トラフィック市場調査 補完レポート: サーバーサイドAPI活用で広がるカテゴリの可能性

**調査日**: 2026-03-03
**調査者**: researcher agent
**依頼メモID**: 19cb2ba4597
**関連サイクル**: cycle-65 フェーズ2（補完調査 1/3）
**補完対象**: docs/research/market-research-high-traffic-categories.md

---

## 本レポートの目的

既存調査（docs/research/market-research-high-traffic-categories.md）は「サーバーサイドAPI呼び出し不可」という誤った前提で作成された。実際にはNext.js API Routesによる独自サーバーサイドロジックは利用可能である。本レポートは既存調査を上書きせず、以下を補完する。

1. 正しい技術的制約の明示
2. サーバーサイドAPIにより新たに実現可能になるカテゴリ・機能の特定
3. 動的計算・変換系ツールの高トラフィック事例
4. 既存調査の各カテゴリのスコア再評価
5. 既存調査で不正確だったデータの修正

---

## 1. 正しい技術的制約の整理

### 1.1 利用可能なもの（誤解されていた点）

| 機能                                   | 利用可否 | 補足                                                 |
| -------------------------------------- | -------- | ---------------------------------------------------- |
| Next.js API Routes（独自ロジック）     | **可**   | 計算処理・データ変換・ファイル検索等                 |
| サーバーサイドキャッシュ               | **可**   | APIレスポンスのキャッシュ（Vercel Edge Cache等）     |
| ISR（Incremental Static Regeneration） | **可**   | 定期的にページを再生成。為替レート・天気等に活用可能 |
| JSONファイル・静的データの検索         | **可**   | ビルド時生成の大規模データセットをAPIで検索          |
| サーバーサイドでの外部APIプロキシ      | **可**   | APIキーを秘匿しながら外部データを取得・整形して返却  |
| クライアントサイドJS・インタラクション | **可**   | ゲーム・クイズ・計算ツールのUI全般                   |
| localStorage                           | **可**   | ユーザー進捗・設定の保存                             |
| ビルド時AI生成コンテンツ               | **可**   | 静的ページとしてデプロイ                             |

### 1.2 利用不可のもの（引き続き制約あり）

| 機能                                                                                                      | 利用不可の理由                        |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| リクエストごとのOpenAI/Google等AI APIコール                                                               | 外部API依存禁止（コスト・依存リスク） |
| サーバーサイドDB（Supabase・PostgreSQL等）                                                                | 事故防止のため                        |
| 4.5MB超のファイルアップロード処理                                                                         | Vercel Serverless Function制限        |
| 60秒超の処理（Standard Serverless: Freeで10秒、Proで60秒。Fluid Compute有効時: Hobbyで300秒、Proで800秒） | Vercelタイムアウト制限                |

### 1.3 重要な制約の実態

Vercel API Routesは**サーバーレス関数**として動作する。以下の特性を理解した上で設計が必要。

- **コールドスタート**: 未使用関数は初回リクエストに遅延が生じる
- **ファイルサイズ制限**: リクエストボディは4.5MB上限
- **実行時間制限**: Standard Serverless Functionsの場合、Freeプランで10秒、Proプランで60秒。Fluid Compute有効時はHobbyプランで最大300秒、Proプランで最大800秒に拡張される（出典: [Vercel Functions Limitations](https://vercel.com/docs/functions/limitations)）
- **ファイルシステム非永続**: ランタイムでの書き込みは不可（読み取りのみ）

これらの制約から、**計算処理・データ変換・キャッシュ済みデータの検索・外部APIプロキシ**は十分実現可能だが、重いファイル変換（PDF変換、画像リサイズ等）は向かない。

---

## 2. サーバーサイドAPIにより新たに実現可能になるカテゴリ

### 2.1 既存調査で「制約のため困難」とされていた機能の再評価

既存調査では「サーバーサイドAPI呼び出し不可」という前提のもと、以下の機能が低評価または除外されていた。

#### 再評価1: 日本語形態素解析・ルビ振り（サーバーサイドで高品質に実現可能）

**既存調査の扱い**: 言及なし（クライアントサイドのみを前提としていたため）

**実際の状況**:

- クライアントサイドでの日本語形態素解析は技術的に不可能ではないが、**深刻な制約**がある
  - kuromoji.js（JavaScriptの形態素解析器）は辞書ファイルが**圧縮後でも18MB（Brotli）、gzip後で96MB → 18MB**という巨大なサイズ
  - ブラウザメモリ消費: kuromoji.js起動後に**約130MB**のメモリを使用
  - モバイルユーザーへのデータ転送コスト・メモリ負荷が深刻
- **サーバーサイドなら**: Node.js上でkuromoji/MeCabを実行し、軽量なJSONレスポンスのみをクライアントに返せる

**実現可能なツール例**:

- テキストを入力→ふりがな付きHTMLを返す「ルビ振りAPI」
- 文章を入力→読み方・品詞・意味を返す「文字解析ツール」
- 漢字変換の詳細解析（訓読み・音読み・用法の分岐）

**競合状況（ルビ振りツール）**:
日本語ルビ振りツールは複数存在するが（EZFurigana、NihongoDera、ひらがな変換ツール等）、トラフィック統計が公開されている大規模なものは少なく、**高品質なルビ振りサービスには参入余地がある**。

- 出典: [EZFurigana](https://www.ezfurigana.com/)、[NihongoDera](https://nihongodera.com/tools/furigana-maker)

---

#### 再評価2: リアルタイムデータ連携ツール（ISRで実現可能）

**既存調査の扱い**: 除外（「サーバーサイドAPI不可」のため）

**実際の状況**:

- ISR（Incremental Static Regeneration）を使えば、外部APIから定期的にデータを取得し、静的ページとして配信できる
- 為替レートAPI（Frankfurt API等無料あり）→ ISRで1時間ごとに更新する「為替レート参照ページ」
- 天気データ→ 日本の旧暦や気候データと組み合わせた「暦・季節ツール」

**参考事例: xe.com（為替換算サービス）**:

- 月間トラフィック: 約5,300万訪問/月（2025年2月データ）
- 出典: [Semrush: xe.com April 2025](https://www.semrush.com/website/xe.com/overview/)

ただし、**ISRの本領発揮は「準リアルタイムでよいデータ」**。毎秒変動する株価のような用途には向かない。

---

#### 再評価3: サーバーサイドテキスト変換ツール（PDF/ファイル変換は除く）

**既存調査の扱い**: 言及なし

**実際の状況**:
ファイルアップロード型のPDF変換（iLovePDF型）はVercelの4.5MB制限・処理時間制限から**大ファイルには不適**。しかし、以下のテキスト変換系は実現可能。

- テキストの文字変換（Unicode正規化・半角/全角変換・ひらがな/カタカナ変換）
- 文字数カウント（バイト数・文字コード別）
- テキストフォーマッター（JSON整形・Markdown変換・表形式化）

**競合サイトのトラフィック実績**（テキスト処理ツール）:

| サイト名          | 月間トラフィック               | 主な機能                     | 出典                                                                                      |
| ----------------- | ------------------------------ | ---------------------------- | ----------------------------------------------------------------------------------------- |
| SmallSEOTools     | 約1,107万訪問/月（2024年12月） | SEO分析・テキスト処理多数    | [Semrush: smallseotools.com](https://www.semrush.com/website/smallseotools.com/overview/) |
| jsonformatter.org | 約250万訪問/月（推定）         | JSON整形・検証               | [Similarweb: jsonformatter.org](https://www.similarweb.com/website/jsonformatter.org/)    |
| freeconvert.com   | 約4,184万訪問/月（2024年10月） | ファイル変換（大型ファイル） | [Semrush: freeconvert.com](https://www.semrush.com/website/freeconvert.com/)              |

**注意**: freeconvert.comのようなファイル変換サービスはVercelの制限から**そのままの形では実現不可**。ただしテキスト変換・整形ツールは実現可能。

---

### 2.2 サーバーサイドAPIだから実現できる差別化機能

**クライアントサイドのみでは不可能、サーバーサイドAPIがあって初めて実現できる機能**:

#### APIキーの秘匿

外部サービス（辞書API・文字変換API等）のAPIキーをクライアントに露出せずに利用できる。Backend for Frontend（BFF）パターンにより、フロントエンドはyolos.netの自前APIを呼び出すだけで、外部APIキーはサーバーサイドに隠蔽される。

**出典**: [Stop Leaking API Keys: The BFF Pattern](https://blog.gitguardian.com/stop-leaking-api-keys-the-backend-for-frontend-bff-pattern-explained/)

#### レート制限とキャッシュの共有

同一のAPIリソースを多数のユーザーで共有するとき、サーバーサイドでレート制限とキャッシュを管理できる。例: 外部辞書APIへのリクエストをサーバーサイドでキャッシュし、同じクエリには即座にキャッシュを返す。これによりAPI利用コストを大幅削減できる。

#### サーバーサイドデータ検索（大規模JSONを非公開で管理）

大規模なJSONデータ（漢字辞書・地名データ等）をビルド時にデプロイし、API Routesで検索する形にすれば、**データファイル全体をクライアントにダウンロードさせる必要がない**。クライアントは検索クエリを送り、マッチしたエントリのみを受け取る。

---

## 3. 動的計算・変換系ツールの高トラフィック成功事例

### 3.1 純粋テキスト処理ツールの成功パターン

#### JSON整形・開発者ツール系

jsonformatter.orgは**毎日約8.1万ユニークユーザー**が訪問する開発者向けJSON整形ツール。

- **特徴**: 完全クライアントサイドで動作可能なツールだが、サーバーサイドでも実装可能
- **収益**: 広告収益で日次約89ドル相当の収益を推定
- **SEO特性**: 「json formatter」「json validator」のような開発者向けキーワードは高い検索意図と安定した需要を持つ
- **出典**: [Statshow: jsonformatter.org](https://www.statshow.com/www/jsonformatter.org)、[Similarweb: jsonformatter.org](https://www.similarweb.com/website/jsonformatter.org/)

**日本語特化で差別化できる開発者ツール**:

- 日本語JSON処理（Unicode エスケープ/アンエスケープ ↔ 日本語テキスト変換）
- テキストの文字コード変換（Shift-JIS ↔ UTF-8等）はサーバーサイドで安全に処理可能

---

#### SmallSEOTools型（多ツール集約）

- 月間1,107万訪問を達成するSEO・テキストツール集約サイト
- テキスト変換・分析ツールを多数集約することでロングテールSEOを獲得するモデル
- **日本語特化版として類似モデルは参入余地あり**（日本語向けのテキスト処理ツール集）
- 出典: [Semrush: smallseotools.com December 2025](https://www.semrush.com/website/smallseotools.com/overview/)

---

### 3.2 ファイル変換系ツールの実態（Vercel制限との関係）

iLovePDFとILoveIMGはサーバーサイド処理で成功した代表事例だが、yolos.netには適さない。

| サイト       | 月間トラフィック                 | 主な機能                     | Vercel制限との関係            |
| ------------ | -------------------------------- | ---------------------------- | ----------------------------- |
| ilovepdf.com | 約2億2,642万訪問/月（2026年1月） | PDF変換・編集（大ファイル）  | 4.5MB制限・タイムアウトで不可 |
| iloveimg.com | 約3,927万訪問/月（2026年1月）    | 画像変換・圧縮（大ファイル） | 同上                          |
| convertio.co | 約2,540万訪問/月（2024年11月）   | 309種類のファイル変換        | 同上                          |

- 出典: [Semrush: ilovepdf.com](https://www.semrush.com/website/ilovepdf.com/overview/)、[Semrush: iloveimg.com](https://www.semrush.com/website/iloveimg.com/overview/)、[Similarweb: convertio.co](https://www.similarweb.com/website/convertio.co/)

**結論**: これらの大ファイル変換サービスはVercelの制限内での実現が困難。ただし**テキストデータの変換・整形**（ファイルサイズが小さいもの）はAPI Routesで十分実現可能。

---

### 3.3 為替・データ参照ツールの成功事例

XE.com（通貨換算）はリアルタイムデータをサーバーサイドで取得・提供するモデルの成功例。

- **月間トラフィック**: 約4,868万訪問/月（2025年4月）、最大で約6,071万/月（2025年2月）
- **収益モデル**: 広告収益 + 国際送金サービス
- **技術**: サーバーサイドで外部為替APIを呼び出し、レスポンスをフロントエンドに返す
- **出典**: [Semrush: xe.com April 2025](https://www.semrush.com/website/xe.com/overview/)

yolos.netにおける類似応用例:

- 旧暦/新暦変換（外部APIなしで計算可能）
- 干支・九星気学の計算（純粋な計算処理のみ→クライアントサイドでも可）
- 日本の伝統的な時間・方位の換算（同上）

---

## 4. 既存調査の各カテゴリ再評価

サーバーサイドAPIが利用可能であることで、各カテゴリの実現可能性とスコアがどう変わるかを以下に明示する。

### 4.1 ツール・計算機系（再評価）

**既存評価**: クライアントサイド適合性 ◎（変化なし）

**サーバーサイドAPIによる追加価値**:

- 外部APIキー秘匿によるデータ精度向上（為替レート等のリアルタイムデータを安全に組み込める）
- 大規模データセット（全国の郵便番号・税率データ等）をサーバーサイドで検索し、必要分だけ返却
- 日本語形態素解析APIを使ったテキスト処理ツール（文字数・読み方・品詞分析）

**再評価スコア変化**:

| 評価項目                 | 旧スコア              | 新スコア | 変化の理由                       |
| ------------------------ | --------------------- | -------- | -------------------------------- |
| クライアントサイド適合性 | ◎                     | ◎        | 変化なし                         |
| 実現範囲の広さ           | △（クライアントのみ） | ◎        | サーバーサイドで外部データ連携可 |
| 日本語特化の差別化力     | △                     | ○        | 形態素解析・読み方付与等が実現可 |

---

### 4.2 クイズ・トリビア系（再評価）

**既存評価**: クライアントサイド適合性 ◎（変化なし）

**サーバーサイドAPIによる追加価値**:

- ビルド時に生成した大規模問題データベース（漢字・歴史・地名）をAPI経由で検索・提供
- 問題データをビルド時に全量クライアントに送る必要がなくなり、ページロードが速くなる

**再評価スコア変化**: 軽微。クイズのロジック自体はクライアントサイドで完結するため、大きな変化はない。

---

### 4.3 ゲーム・パズル系（再評価）

**既存評価**: クライアントサイド適合性 ◎（変化なし）

**サーバーサイドAPIによる追加価値**:

- 漢字パズルの「読み方ヒント」API（形態素解析）を使い、ゲームの品質を向上
- ゲームのスコア・ランキングは現状localStorageに限られるが、API Routesでシンプルな集計（サーバーDB不要の実装）は理論上可能。ただしDB制約のため、共有ランキングの実現は困難なまま。

**再評価スコア変化**: 軽微。ゲームのコア機能はクライアントサイドで完結するため。

---

### 4.4 リファレンス・辞典系（再評価）

**既存評価**: クライアントサイド適合性 中程度（AI Overview耐性が低いため注意）

**サーバーサイドAPIによる追加価値（最も大きく変わるカテゴリ）**:

- **漢字辞典 + インタラクティブ機能の組み合わせ**が最も恩恵を受ける
- ビルド時に生成した漢字データ（約2,136字の常用漢字 × 読み・意味・熟語・例文）をAPIで検索
- 「この漢字が含まれる単語は？」「この訓読みを持つ漢字は？」等の横断検索がAPI Routesで実現可能

**実現可能な高付加価値コンテンツ例**:

- 漢字の書き順アニメーション + 読み方解説 + 用例クイズを組み合わせた「漢字インタラクティブ辞典」
- 旧字体・異体字・部首からの逆引き漢字検索

**再評価スコア変化**:

| 評価項目                         | 旧スコア | 新スコア | 変化の理由                             |
| -------------------------------- | -------- | -------- | -------------------------------------- |
| インタラクティブ性との組み合わせ | △        | ○        | 辞典検索APIにより動的検索が実現可      |
| AI Overview耐性                  | △        | △        | インタラクション体験で部分的に耐性向上 |

---

### 4.5 教育・学習系（再評価）

**既存評価**: AI Overview影響が非常に高く（×）推奨しない

**サーバーサイドAPIによる追加価値**:

- 学習ツール（日本語学習・漢字練習）はAPIを組み合わせることで体験価値が向上するが、根本的なAI Overview耐性の低さは変わらない
- ハウツー記事をメインにする戦略は依然として推奨しない

**再評価スコア変化**: 軽微。AI Overview問題の本質は解消されない。

---

## 5. 既存調査の不正確データ修正

### 5.1 RapidTablesの出典URL修正

**既存調査の記述（不正確）**:

```
出典: [BoringCashCow: Online Calculators Generate Millions a Year](https://boringcashcash.com/view/online-calculators-generate-millions-a-year)
```

URLに2つの問題があった。

**正しい情報**:

- **ドメイン**: `boringcashcow.com`（既存調査は `boringcashcash.com` と誤記）
- **RapidTables専用ページURL**: `https://boringcashcow.com/check/rapidtables.com`
- **記事URL（計算機サイト全般）**: `https://boringcashcow.com/view/online-calculators-generate-millions-a-year`

**正確なトラフィックデータ**:

- 2023年4月: 14,371,871訪問
- 2023年5月: 14,811,521訪問
- 2023年6月: 12,731,303訪問
- 2026年1月（Semrush）: 10.85M訪問（前月比-3.77%）
- 2026年1月（Similarweb）: 6.6M訪問 ※測定方法の違いによる差異
- 出典: [BoringCashCow: RapidTables](https://boringcashcow.com/check/rapidtables.com)、[Semrush: rapidtables.com January 2026](https://www.semrush.com/website/rapidtables.com/overview/)

**補足**: RapidTablesのトラフィックは2023年ピーク（月2,670万訪問）から2026年時点で1,000〜1,000万超の水準に低下している可能性がある。これはAI Overviewや競合増加の影響と考えられる。

---

### 5.2 Wordleのデイリーユーザー数の正確な出典

**既存調査の記述**:

```
月間トラフィック: 約1,450万デイリーアクティブユーザー（Wordle単体）
出典: [Wordle Statistics (electroiq.com)](https://electroiq.com/stats/wordle-statistics/)
```

**調査結果**:

「1,450万デイリーアクティブユーザー」という数字は、NYTが公式に発表したものではなく、**53億プレイ（2024年）÷365日 = 約1,450万**という計算によって導かれた推計値であることが判明した。

**NYT公式発表データ（正確な情報）**:

- Wordleの2024年年間プレイ数: **53億回**（NYTがThe Vergeに公式提供）
- 計算上の1日あたりプレイ数: 約1,450万（計算値・推計）
- NYT Games全体の公式デイリーアクティブユーザー: **1,000万人以上**（全ゲーム合計）
- 2024年にNYT Gamesのパズルが解かれた総回数: **111億回**

**正しい引用方法**:
「Wordleは2024年に53億回プレイされた（NYT公式データ、The Verge経由）。1日あたり約1,450万プレイに相当する（計算値）。」

出典:

- [Today.com: NYT 2024 Wordle Connections Data (EXCLUSIVE)](https://www.today.com/popculture/news/new-york-times-top-wordle-connections-2024-rcna185738)
- [NYT Games Wikipedia: The New York Times Games](https://en.wikipedia.org/wiki/The_New_York_Times_Games)
- [How Many People Play Wordle in 2025?](https://bradleywindrow.com/how-many-people-play-wordle-2025)

---

### 5.3 ゼロクリック検索の正確なスコープ

**既存調査の記述**:

```
ゼロクリック検索が2024年の56%から2025年5月には69%まで増加
```

**調査結果**:

既存調査の数字にはいくつかの問題がある。

**正確なデータ（2024年 SparkToro/Datos 調査）**:

- 米国: 全Googleサーチの **58.5%** がゼロクリック（2024年）
- EU: 全Googleサーチの **59.7%** がゼロクリック（2024年）
- スコープ: **全Google検索クエリ**（ニュース限定ではない）
- データソース: Datosのクリックストリームパネル（anonymized実ユーザーデータ）
- **出典**: [SparkToro: 2024 Zero-Click Search Study](https://sparktoro.com/blog/2024-zero-click-search-study-for-every-1000-us-google-searches-only-374-clicks-go-to-the-open-web-in-the-eu-its-360/)

**2025年データ（最新）**:

- AI Overviewが表示されるクエリのゼロクリック率: **83%**
- AI Overviewなしの通常クエリのゼロクリック率: 約60%
- AI Overviewが表示される検索の割合: 2025年11月時点で約15.69%（2025年1月の6.49%から増加）
- 出典: [Superprompt: Zero-Click Crisis November 2025](https://superprompt.com/blog/zero-click-search-worsens-58-percent-google-no-clicks-november-2025-recovery-strategies)

**重要な注記**:

- 「56% → 69%」という既存調査の数字の出典が特定できなかった。SparkToro調査の数字（58.5%）と乖離があり、異なる調査（もしくは方法論が不明な推計）を引用した可能性がある
- ゼロクリック率はスコープ・調査方法・デバイス・地域によって大きく異なる。モバイルでは2024年に75%超という調査もある（出典: [Up And Social: Zero-Click Searches 2025](https://upandsocial.com/zero-click-searches-2025-trend-analysis/)）
- **信頼できる数字**: 2024年の全Google検索の約58〜60%がゼロクリックで終わる（SparkToro/Datos）

---

### 5.4 各カテゴリの代表的な検索クエリの月間検索ボリューム概算

既存調査にはカテゴリ別の具体的な月間検索ボリュームが記載されていなかった。本補完調査でも、SEOツール（Ahrefs・Semrush）への直接アクセスができないため正確な数値提供は困難だが、競合サイトのトラフィックから逆算した概算を提供する。

**計算ツール系（日本語クエリ）**:

- CASIO keisan.casio.jpの2020年総PV数: **2億5,638万**（前年比22%増）
- 出典: [CASIOプレスリリース 2021年3月](https://prtimes.jp/main/html/rd/p/000000115.000040622.html)
- このトラフィック規模から、日本語圏の「計算ツール」系クエリは**年間数億PV規模**と推計できる

**ゲーム・パズル系（日本語クエリ）**:

- 「Wordle 日本語」「漢字 ゲーム」「クイズ 日本語」等の派生クエリは英語圏と比較して小さいが、**月間数十万〜数百万クエリ規模**は存在すると推定
- 英語圏での「wordle」月間検索量が非常に高いことから、日本語派生ゲームにも相応の需要がある

**リファレンス・辞典系（日本語クエリ）**:

- Jisho.org（日英辞典）: 日本語学習者向けで高いトラフィックを獲得
- 「漢字 読み方」「漢字 意味」「漢字 書き方」は日本語圏で安定した高需要クエリと考えられるが、AI Overviewに吸収されやすい典型的なパターン

**注記**: 具体的な月間検索ボリュームは、AhrefsやSemrushの有料ツールを使った直接調査が必要。本レポートでは入手可能なトラフィックデータから定性的な評価を提供する。

---

## 6. サーバーサイドAPIを活用した差別化パターン: 具体的な設計例

yolos.netの技術スタック（Next.js + Vercel + SSG/ISR）とサーバーサイドAPI Routesを組み合わせた場合、以下の差別化パターンが実現可能。

### 6.1 パターンA: 日本語テキスト処理APIを核にした「日本語ツール集」

**技術実装**:

- Next.js API Routes上でkuromoji.js（Node.js版）を実行
- クライアントはテキストを送信 → サーバーが形態素解析してJSONで返却 → クライアントがルビ付きHTMLをレンダリング

**ユーザー価値**:

- 高品質なふりがな付与（ブラウザへの130MB辞書転送が不要）
- 文字読み方・品詞情報の付与
- 学習者・教育者・コンテンツ制作者向けの実用ツール

**SEO強み**:

- 「ふりがな 変換」「漢字 読み方 変換」等の実用クエリは検索需要が安定
- ツールの体験自体はAI Overviewで代替できない

**AI Overview耐性**: ○（ツール体験はAIに代替されにくい）

---

### 6.2 パターンB: データキャッシュ型の「和暦・旧暦・日本の暦計算ツール」

**技術実装**:

- 純粋な計算処理（クライアントサイドでも可能）
- ただし、外部カレンダーAPI（祝日データ等）のキャッシュをAPI Routesで管理することで精度向上

**ユーザー価値**:

- 旧暦/新暦変換、干支計算、節気計算、六曜計算
- 日本固有の時間文化に特化したニッチツール

**SEO強み**:

- 「旧暦 変換」「干支 計算」「六曜 カレンダー」等の日本文化特化クエリで競合が少ない
- CASIOのkeisanが強いが、インタラクティブ性・デザインで差別化可能

**AI Overview耐性**: ○（計算実行の体験はAIに代替されにくい）

---

### 6.3 パターンC: サーバーサイド漢字辞典検索

**技術実装**:

- 約2,136字の常用漢字データをJSONファイルとして保存（ビルド時にデプロイ）
- Next.js API Routesで全文検索・絞り込み検索を実装
- クライアントには検索結果のみを返却（全データを転送しない）

**ユーザー価値**:

- 部首・読み・画数・意味から漢字を検索できるインタラクティブ漢字辞典
- 漢字クイズとの連携（辞典で調べた漢字をすぐにクイズで練習）

**SEO強み**:

- 「漢字 部首 一覧」「○○画 漢字」等の検索クエリをカバー
- 競合（jisho.org等）と比較してインタラクティブ性で差別化

**AI Overview耐性**: △〜○（辞典情報単体はAIに取られやすいが、クイズとの組み合わせで耐性向上）

---

## 7. 総合評価: サーバーサイドAPI活用の優先度

既存調査のカテゴリ評価に、サーバーサイドAPIの恩恵を加味した総合評価を以下に示す。

| カテゴリ                     | 既存評価               | サーバーサイドAPI恩恵度                        | 総合再評価               | 推奨度変化              |
| ---------------------------- | ---------------------- | ---------------------------------------------- | ------------------------ | ----------------------- |
| ゲーム・パズル（デイリー型） | ◎                      | 小（ゲームはクライアント完結で十分）           | ◎                        | 変化なし（第1位を維持） |
| 日本語テキスト処理ツール     | なし（制約のため除外） | **大（形態素解析がサーバーサイドで高品質に）** | **新規追加（上位候補）** | **新規推薦**            |
| 計算ツール（汎用）           | ○                      | 中（外部データ連携で範囲拡大）                 | ◎                        | 上昇                    |
| リファレンス・辞典           | △                      | 大（動的検索APIで体験価値向上）                | △〜○                     | 軽微な上昇              |
| クイズ・トリビア             | ○                      | 小（データ配信の効率化程度）                   | ○                        | 変化なし                |
| 教育・ハウツー               | ×                      | 小（AI Overview問題解消せず）                  | ×                        | 変化なし                |

---

## 8. 結論・推奨事項

### 8.1 サーバーサイドAPIの最大の恩恵領域

**日本語テキスト処理は既存調査で最も「取りこぼした」領域**である。

- クライアントサイドでの日本語形態素解析には深刻な実装コスト（130MBのメモリ消費、18MB辞書転送）があるが、サーバーサイドAPIを使えばこの問題が完全に解消される
- 日本語のルビ振り・読み方変換・品詞分析のツールは「実際に使う」体験を提供するため、AI Overview耐性が高い
- 競合ツールは複数存在するが、大規模なサイトは少なく参入余地がある

### 8.2 実装時の注意事項

1. **Vercelの無料枠の制限に注意**: Hobbyプランのサーバーレス関数には、Active CPU: 4時間/月、Provisioned Memory: 360 GB-hrs/月、Invocations: 100万回/月の制限がある（出典: [Vercel Limits](https://vercel.com/docs/limits)）。高トラフィック時にはProプランが必要になる可能性がある
2. **コールドスタートの影響**: API Routesはサーバーレスのため、アクセスが少ない時間帯は初回レスポンスが遅くなる。ユーザー体験上、ローディング表示の工夫が必要
3. **大ファイル変換は避ける**: iLovePDF型の大ファイル変換はVercelの4.5MB制限・タイムアウトで実現困難。テキスト処理・計算処理に集中する

### 8.3 既存調査への補完事項サマリー

| 補完項目                       | 既存調査の問題                  | 正しい情報                                                                                                                                                           |
| ------------------------------ | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RapidTables出典URL             | `boringcashcash.com/...` と誤記 | 正しくは `boringcashcow.com/check/rapidtables.com`（RapidTables専用ページ）および `boringcashcow.com/view/online-calculators-generate-millions-a-year`（計算機記事） |
| Wordleデイリーユーザー数の出典 | electroiq.comの推計値を直接引用 | NYT公式: 2024年に53億プレイ → 1日約1,450万（計算値）。「NYT Games公式: 全ゲーム合計で1,000万DAU超」が正確な公式数値                                                  |
| ゼロクリック検索56%→69%        | 出典不明確・数字の乖離          | 正確なデータ: 2024年に全Google検索の58.5%（米国）〜59.7%（EU）がゼロクリック（SparkToro/Datos調査、全クエリスコープ）。AI Overview表示時は83%のゼロクリック率        |
| 月間検索ボリューム概算         | 具体的数値の記載なし            | CASIO keisanのPV（年間2億5,638万）から日本語計算ツール市場の規模感は把握可能。個別キーワードは有料SEOツールでの直接調査が必要                                        |

---

## 参考情報源

本補完調査で参照した主な情報源（アクセス日: 2026-03-03）:

- [BoringCashCow: RapidTables Profile](https://boringcashcow.com/check/rapidtables.com)
- [BoringCashCow: Online Calculators Generate Millions a Year](https://boringcashcow.com/view/online-calculators-generate-millions-a-year)
- [Semrush: rapidtables.com Overview January 2026](https://www.semrush.com/website/rapidtables.com/overview/)
- [Semrush: smallseotools.com Overview December 2025](https://www.semrush.com/website/smallseotools.com/overview/)
- [Semrush: ilovepdf.com Overview January 2026](https://www.semrush.com/website/ilovepdf.com/overview/)
- [Semrush: iloveimg.com Overview January 2026](https://www.semrush.com/website/iloveimg.com/overview/)
- [Semrush: xe.com Overview April 2025](https://www.semrush.com/website/xe.com/overview/)
- [Similarweb: convertio.co November 2024](https://www.similarweb.com/website/convertio.co/)
- [Similarweb: jsonformatter.org](https://www.similarweb.com/website/jsonformatter.org/)
- [Statshow: jsonformatter.org](https://www.statshow.com/www/jsonformatter.org)
- [SparkToro: 2024 Zero-Click Search Study](https://sparktoro.com/blog/2024-zero-click-search-study-for-every-1000-us-google-searches-only-374-clicks-go-to-the-open-web-in-the-eu-its-360/)
- [Today.com: NYT 2024 Wordle Connections Data](https://www.today.com/popculture/news/new-york-times-top-wordle-connections-2024-rcna185738)
- [The New York Times Games - Wikipedia](https://en.wikipedia.org/wiki/The_New_York_Times_Games)
- [Superprompt: Zero-Click Crisis November 2025](https://superprompt.com/blog/zero-click-search-worsens-58-percent-google-no-clicks-november-2025-recovery-strategies)
- [Up And Social: Zero-Click Searches 2025](https://upandsocial.com/zero-click-searches-2025-trend-analysis/)
- [GitHub: kuromoji.js](https://github.com/takuyaa/kuromoji.js)
- [aiktb.dev: Stop Using kuromoji.js (dictionary size details)](https://aiktb.dev/blog/better-kuromoji-fork)
- [Stop Leaking API Keys: The BFF Pattern](https://blog.gitguardian.com/stop-leaking-api-keys-the-backend-for-frontend-bff-pattern-explained/)
- [Vercel: Functions Limits](https://vercel.com/docs/limits)
- [Northflank: Vercel Backend Limitations](https://northflank.com/blog/vercel-backend-limitations)
- [EZFurigana](https://www.ezfurigana.com/)
- [NihongoDera: Furigana Maker](https://nihongodera.com/tools/furigana-maker)
- [CASIOプレスリリース: keisan 2020年PVランキング](https://prtimes.jp/main/html/rd/p/000000115.000040622.html)
- [How Many People Play Wordle in 2025?](https://bradleywindrow.com/how-many-people-play-wordle-2025)
