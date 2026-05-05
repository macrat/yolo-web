---
title: sentence embeddingを使った日常向けツールのアイデア調査
date: 2026-05-05
purpose: yolos.netの既存embedding資産（kanji/yoji/colors）を活かしたツールアイデアの発掘と、runtime MiniLMロードの技術的実現可能性評価
method: |
  HuggingFace モデルリポジトリの実ファイルサイズ確認、transformers.js v3/v4 公式ブログ・ドキュメント調査、
  既存コードベース（embeddings-server.ts, kanji-data.json, yoji-data.json, traditional-colors.json）の実態確認、
  競合ツールサイト調査、npm/GitHub ライブラリ調査
sources:
  - https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2/tree/main/onnx
  - https://huggingface.co/blog/transformersjs-v3
  - https://huggingface.co/blog/transformersjs-v4
  - https://www.sitepoint.com/webgpu-vs-webasm-transformers-js/
  - https://www.sitepoint.com/optimizing-transformers-js-production/
  - https://github.com/PAIR-code/umap-js
  - https://github.com/wanasit/chrono
  - https://github.com/code4fukui/kuromoji-es
  - https://moodpalettegenerator.net/
  - https://github.com/nitaiaharoni1/vector-storage
---

# sentence embeddingを使った日常向けツールのアイデア調査

## 1. モデルロードの現実的コスト

### ONNX ファイルサイズ実測値（Xenova/paraphrase-multilingual-MiniLM-L12-v2）

| ファイル名           | サイズ | 用途                         |
| -------------------- | ------ | ---------------------------- |
| model.onnx           | 470 MB | FP32（フル精度）             |
| model_fp16.onnx      | 235 MB | FP16                         |
| model_int8.onnx      | 118 MB | INT8量子化                   |
| model_uint8.onnx     | 118 MB | UINT8量子化                  |
| model_quantized.onnx | 118 MB | INT8（旧来版）               |
| model_q4.onnx        | 399 MB | Q4（注：fp32より小さくない） |
| model_q4f16.onnx     | 205 MB | Q4F16ハイブリッド            |

**実用的な選択肢はint8/uint8の118MBのみ。** Q4は399MBと逆に大きいため不適。fp16は235MBで中間。

### 初回ロード時間の目安

Chrome DevTools「Fast 3G」（1.5Mbps相当）での all-MiniLM-L6-v2（英語版の小型類似モデル）の実績：

- ダウンロード：8〜12秒
- WASM デシリアライズ：1〜3秒
- 合計：10〜15秒

multilingual-MiniLM（int8: 118MB）での推算：

- WiFi（50Mbps）：約20秒（ダウンロード19s + デシリアライズ1s）
- 4G（10Mbps）：約100秒（ダウンロード95s + デシリアライズ5s）
- 4G（10Mbps）は **現実的には厳しい**。モバイルファーストツールには不向き。

**リピート訪問の場合（IndexedDB キャッシュ）：**
transformers.js はデフォルトでモデルを IndexedDB にキャッシュする。2回目以降はダウンロードが不要となり、デシリアライズ（1〜3秒）のみ。UX上は許容できる。

### WebGPU vs WASM(SIMD) 推論速度

MiniLMのような小型embedding モデル（短文・128トークン以下）では：

- WASM(SIMD)：8〜12ms/推論（M2 MacBook Air実測）
- WebGPU：15〜25ms/推論（同環境）

**embedding 規模ではWASMがWebGPUを上回る。** GPU dispatch オーバーヘッドが計算量を超えるため。WebGPU が優位になるのは大型モデル・バッチ推論時（3〜10倍速）。

INT8量子化は WASM SIMD の packed 8-bit 命令と相性が良く、FP32比で **2〜3倍高速**。118MB INT8 × WASM(SIMD) が最適解。

### transformers.js v3/v4 の注意点（feature-extraction）

- **v3（2024年10月）**：WebGPU サポート追加、新量子化フォーマット（q4, q8, fp16）対応
- **v4（2025年3月）**：WebGPU Runtime を C++ で完全再実装、BERT系 embedding が約4倍速に、CDN 動的インポートが `https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.x.x` で安定提供
- **ModelRegistry API**（v4新機能）：`is_pipeline_cached()` でキャッシュ確認、ロード前にユーザーへ「初回118MBダウンロードあり」と通知できる
- CDN 動的インポート：`const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers')` — devDependencies のまま runtime バンドルに含めない現行方針と合致
- **Web Worker Singleton パターン推奨**：メインスレッドをブロックしないため必須。Worker 内でシングルトンとして pipeline を保持すれば、複数ツール間でモデルを共有できる

### IndexedDB キャッシュの動作

- 初回ロード後は HuggingFace Hub への再ダウンロードなし（オフライン利用可能）
- キャッシュはブラウザのストレージ上限に依存（通常数GB）
- 118MB のモデルは容量上の問題はほぼ発生しない
- `env.useWasmCache = true`（v4）で WASM バイナリもキャッシュ可能

---

## 2. 既存データ × embedding ツールアイデア（8〜12個）

### 2-A. 気分から四字熟語レコメンダー

**概要：** ユーザーが「今の気持ち」を日本語フリーテキストで入力 → MiniLM で embedding → yoji-data.json（400語）の meaning フィールドとコサイン類似度計算 → Top 5表示。

**実装詳細：** yoji-data.json の400語 × 意味テキストを build 時に embedding 生成して JSON化（kanji-embeddings と同方式）。runtime には inference 不要、ベクトル検索のみ。意味フィールド（例：「一生に一度の出会いを大切にすること」）は embedding の質が高く、意味検索に最適。

**実装難易度：** A（1サイクル）
**必要なもの：** yoji-data.json（既存）、build 時 embedding 生成スクリプト（既存パターン流用）、ブラウザ側コサイン類似度計算（軽量）
**追加バンドル：** yoji embedding JSON ≈ 400語 × 384dim × int8 ≈ 155KB（base64エンコード込みで約200KB）
**差別化：** APIなし・プライバシー完全保護・オフライン動作。「漢字かな流」「類語検索」系サイトは語彙マッチベースのみ。意味ベースで検索できるツールは日本語では希少。

---

### 2-B. テキストから伝統色ファインダー

**概要：** 「夕暮れ時の海」「新緑の初夏」などのテキスト → embedding → traditional-colors.json（250色）の name + category フィールドの組み合わせとコサイン類似度計算 → 意味的に近い伝統色 Top 5 を色見本付きで表示。

**実装詳細：** 現状の traditional-colors.json には説明文フィールドがない（name, hex, category のみ）。2つの選択肢がある。(1) 各色に短い説明文を追加してから build 時 embedding — 精度が高いが前処理が必要 (B難易度)。(2) color name + category を連結した文字列で embedding — すぐ実装できるが精度は中程度 (A難易度)。

**実装難易度：** A（名前 + カテゴリのみ使用）/ B（説明文追加で精度向上）
**必要なもの：** traditional-colors.json（既存、250色）、build 時 embedding 生成
**追加バンドル：** 250色 × 384dim × int8 ≈ 96KB（base64込みで約130KB）
**差別化：** moodpalettegenerator.net は英語テキストベースで日本語非対応。日本語テキストから日本固有の伝統色へのマッピングは競合皆無。

---

### 2-C. テキストを「一文字の漢字」に変換

**概要：** 短い説明文・感情・情景テキスト → embedding → kanji-data.json（2136字）とコサイン類似度比較 → 意味が最も近い漢字 Top 5 表示（meanings, kunYomi, onYomi 付き）。

**実装詳細：** kanji-embeddings-384.json が既存のため build 時処理不要。ユーザー入力テキストの embedding のみ runtime で生成する（要モデルロード）。kanji-embeddings は英語 meanings で生成されているため、日本語入力との精度に注意（multilingual モデルなので cross-lingual マッチは機能する）。

**実装難易度：** A（モデルロード基盤を共通化すれば）
**必要なもの：** kanji-embeddings-384.json（既存）、runtime MiniLM ロード
**追加バンドル：** モデル 118MB（初回のみ）、embedding JSON は既存
**差別化：** kanji-kanaru ゲームとデータを共有しつつ全く異なる用途。「1文字で表すと何？」という詩的・クリエイティブ用途。

---

### 2-D. 詩や歌詞 → 伝統色パレット提案

**概要：** 数行の詩、歌詞、日記文を貼り付け → 文章全体の embedding → 伝統色との類似度 → Top 5〜8色でパレット生成・HEX値コピー可能。

**実装詳細：** 文章全体を1つのベクトルとして扱うか、文ごとに embedding して平均化するか選択できる。後者のほうが多様な色彩が出て面白い。

**実装難易度：** B（説明文フィールド整備 + 文章分割ロジックが必要）
**必要なもの：** traditional-colors.json（要説明文追加）、runtime MiniLM
**追加バンドル：** 130KB（色 embedding）+ モデル 118MB
**差別化：** Adobe Color や Coolors は色理論ベース。「文章の感情 → 日本の伝統美」という切り口は唯一無二。デザイナー・クリエイター向け。

---

### 2-E. 「お祝い・感謝・謝罪」シチュエーション別四字熟語カード

**概要：** プルダウンやタグでシチュエーション選択（複数選択可）＋ テキスト補足入力 → embedding 検索 → ふさわしい四字熟語 Top 3 をカード形式で表示（意味・読み・例文付き）。SNS シェア対応。

**実装難易度：** A〜B
**必要なもの：** yoji-data.json（既存）、build 時 embedding
**差別化：** 既存の「四字熟語一覧サイト」はカテゴリ分類のみ。自然文入力→ 意味検索はほぼ存在しない。

---

### 2-F. ことわざ意味検索（要データ調達）

**概要：** 「備えあれば憂いなし」的な知恵を自然文で探すツール。

**データ調達難易度評価：**

- awesome-japanese-nlp-resources に kotowaza JSON の存在が示唆されているが、公開ライセンスが明確なものは少ない
- 「ことわざ辞典」サイトからのスクレイピングは利用規約上リスクがある
- 自前で200〜300語程度の意味付きことわざを JSON 化する工数は B〜C（LLM で半自動化できるが事実確認が必要）

**実装難易度：** C（データ調達コストが主因）
**推奨：** バックログの後回し。yoji ツールが実証できてからデータ構築を判断する。

---

### 2-G. 日英クロスリンガル四字熟語探し

**概要：** 英語で気持ち・状況を入力（"feeling nostalgic about the past"）→ 日本語四字熟語を提案（「温故知新」等）。MiniLM の多言語性を直接活用。

**実装難易度：** A（2-A と同一実装、入力言語を問わないだけ）
**差別化：** 英語ユーザーが日本語の四字熟語を探すツールは現状ほぼ存在しない。インバウンドトラフィック獲得にも貢献。

---

### 2-H. 漢字一文字のカラーマッチ

**概要：** 単一の漢字を入力 → kanji-embeddings（既存）と traditional-colors embedding を紐付け → 「この漢字に似合う伝統色」を表示。

**実装難易度：** A（build 時の2つの embedding 空間が揃えば）
**追加バンドル：** 両方とも build 時生成、runtime モデルロード不要
**差別化：** 「漢字 + 色」の組み合わせは唯一無二のビジュアル体験。壁紙・SNSネタとしてシェアされやすい。

---

### 2-I. 伝統色名自動命名ツール（カスタム色 → 最近傍伝統色名）

**概要：** HEX カラーコードを入力 → 色空間（HSL）距離で最も近い伝統色を返す（embedding 不要）。または RGB を3次元に正規化したベクトルで類似計算。

**補足：** 厳密には embedding 不要（単純な色距離計算で十分）だが、「色名の意味」で検索する拡張も可能。

**実装難易度：** A（色距離計算のみなら embedding 不要、純粋なJS実装）
**追加バンドル：** ゼロ（JSON読み込みのみ）
**差別化：** カラーコードから日本の伝統色名を引ける日本語ツールは需要が明確（デザイナー向け）。

---

### 2-J. 短文 → 四字熟語「今日の一言」ジェネレーター

**概要：** 日記の一文や今日の出来事を入力 → 今日にふさわしい四字熟語をカード形式で提案。朝・夜の習慣化を意識した設計。

**実装難易度：** A（2-A の UI 特化バリエーション）
**差別化：** 習慣化・リテンション導線。日次訪問動機になる。

---

## 3. ユーザー入力だけで成立する embedding ツール（5〜8個）

### 3-A. セマンティック類似度チェッカー（A vs B）

**概要：** 2つのテキストエリアに文章を貼り付け → cosine similarity スコアを0〜100%で表示。「本当に同じ意味か」を確認するツール。翻訳品質チェック、リライト確認、面接回答の重複チェックなどに使える。

**実装難易度：** A（最もシンプルな embedding ツール）
**必要なもの：** runtime MiniLM のみ
**追加バンドル：** モデル 118MB（初回のみ）
**差別化：** 既存ツール（TF-IDF ベース）は語彙ベース。意味ベースのシンプルな2テキスト比較ツールは日本語圏では希少。多言語性を活かして日英間の翻訳品質チェックにも使える。

---

### 3-B. 重複文検出 / コピペチェッカー

**概要：** 複数の文（議事録、メーリス、箇条書き）を貼り付け → 各文ペアの類似度を計算 → 閾値以上（例：70%）をハイライト表示。

**実装難易度：** A〜B（n²の類似度計算だが、数十文なら十分高速）
**必要なもの：** runtime MiniLM
**追加バンドル：** モデル 118MB
**差別化：** サーバー不要・プライバシー完全保護が強み。機密性の高い文書に使えるため需要あり。

---

### 3-C. テキストクラスタリング可視化

**概要：** 複数の短文 or 文書を貼り付け → MiniLM で embedding → UMAP-JS で2D降次元 → D3.js / Canvas で散布図表示。近い点同士を線で結ぶ or K-Meansクラスタ色分け。

**実装難易度：** C（UMAP の計算量、UI 設計、キャンバスインタラクション）
**必要なもの：** runtime MiniLM、umap-js（~50KB gzip）、D3 or Canvas
**追加バンドル：** モデル 118MB + umap-js 50KB
**差別化：** ブラウザのみで完結する embedding 可視化ツールは日本語圏に存在しない。アカデミック・リサーチ用途でシェアされやすい。

---

### 3-D. セマンティック検索メモ帳

**概要：** テキストメモを入力・保存（localStorage）→ 後から自然文クエリで意味検索。「あのとき書いたやつ、どこだっけ」を semantic に解決。

**実装詳細：** メモの embedding を IndexedDB に保存（vector-storage パターン）。検索クエリの embedding を runtime 生成 → 全メモとの類似度ランキング表示。

**実装難易度：** B（localStorage/IndexedDB の永続化 + embedding 保存管理）
**必要なもの：** runtime MiniLM、IndexedDB（ブラウザ標準）
**追加バンドル：** モデル 118MB（リピート時はキャッシュ済み）
**差別化：** Notion や Obsidian のセマンティック検索はクラウド依存。ブラウザローカルで完結するプライベートなセマンティックメモ帳は差別化余地が大きい。

---

### 3-E. メモの自動タグ付け

**概要：** テキストを入力 + タグセット（カスタム可）を定義 → 各タグとの類似度でトップ3タグを提案。

**実装難易度：** A〜B（タグセット UI の設計次第）
**必要なもの：** runtime MiniLM
**追加バンドル：** モデル 118MB
**差別化：** ルールベースのタグ提案と異なり、同義語・言い換えを包含。「マーケ」「PR」「広報」を別々に書いても同じタグに集約できる。

---

### 3-F. 翻訳品質チェッカー（日英）

**概要：** 原文（日本語）と翻訳文（英語）を入力 → cosine similarity を計算。MiniLM の多言語性により日英の意味的一致度を評価できる。

**実装難易度：** A（3-A の多言語特化バリエーション）
**注意点：** multilingual MiniLM は完璧な翻訳評価器ではなく、あくまで意味的近さの参考値。「厳密なスコアではない」旨の説明を UI に明記すること。
**差別化：** 無料かつプライバシー保護で翻訳の意味的整合性を確認できるツールは少ない。

---

### 3-G. テキストを「色」に変換（embedding → RGB）

**概要：** テキスト入力 → 384次元 embedding の主成分 3 つを取り出し（簡易PCA）→ RGB の3成分にマッピング → その色を大きく表示。「文章の色」という詩的体験。

**実装詳細：** 厳密な PCA は計算コストが高いが、384次元ベクトルの固定インデックス（例：第1・第128・第256成分）をサンプリングして正規化するだけでも視覚的に楽しい。完全な PCA 実装（ml-matrix 等）で精度を上げることも可能。

**実装難易度：** A（固定インデックスサンプリング）/ B（PCA実装）
**必要なもの：** runtime MiniLM
**追加バンドル：** モデル 118MB（+ ml-matrix 約100KB for PCA）
**差別化：** 「文章 → 色」という体験は moodpalettegenerator.net が類似しているが英語特化。日本語テキスト対応かつ和の伝統色との比較も同時に見せられる独自性あり。

---

## 4. embedding 以外の「AI風」軽量ツールアイデア（8〜15個）

### 4-A. 自然言語日付パーサー

**概要：** 「来週の火曜の14時」「3日後の午前10時」→ ISO8601 形式の日時に変換。コピーボタン付き。

**実装難易度：** A
**必要なライブラリ：** chrono.js（日本語対応確認済み、英語・仏語・蘭語は完全対応、日本語は部分対応）またはカスタム実装
**追加バンドル：** chrono.js ≈ 50KB gzip
**差別化：** 既存の変換ツールは英語のみ。日本語の口語表現（「再来週」「今月末」）に対応したものは希少。

---

### 4-B. 日本語読みやすさスコア

**概要：** テキストを貼り付け → jReadability 方式のスコア計算（漢語率・和語率・動詞率・助詞率・1文あたり語数）→ JLPT難易度目安を表示。

**実装難易度：** B（日本語形態素解析が必要 → kuromoji.js または簡易実装）
**必要なライブラリ：** kuromoji-es（ES Module 版、CDN で動的ロード可、辞書データ約10MB）
**追加バンドル：** kuromoji 辞書 ≈ 10MB（初回のみキャッシュ可）
**差別化：** 日本語テキストの難易度を可視化するブラウザツールは非常に少ない。日本語教材作成者・ライター向けに需要あり。

---

### 4-C. 重複箇条書きマージャー

**概要：** 箇条書きリストを貼り付け → LCS / 編集距離で重複・類似項目を検出 → マージ候補をハイライト表示。

**実装難易度：** A（embedding なし、純JS）
**必要なライブラリ：** なし（Levenshtein 距離の軽量実装で十分）
**追加バンドル：** ゼロ
**差別化：** 同系ツールは主に英語対応。日本語テキストの重複検出（ひらがな・漢字の表記揺れ）に特化できる。

---

### 4-D. 文章の読書時間・文字数カウンター

**概要：** 原稿を貼り付け → 文字数・語数・段落数・読書時間（日本語400字/分、英語200words/分）を即時表示。

**実装難易度：** A
**必要なライブラリ：** なし
**追加バンドル：** ゼロ
**差別化：** 超シンプルだが需要は高い。ブログ執筆・SNS投稿用に「字数制限チェック」機能と組み合わせると使いやすい。

---

### 4-E. タイポ・表記ゆれ検出

**概要：** テキストを貼り付け → fuzzy match（Levenshtein / Jaro-Winkler）で類似単語をスキャン → 疑わしい表記ゆれをハイライト（「サービス」vs「サーヴィス」、「ウェブ」vs「ウエブ」）。

**実装難易度：** B（日本語カタカナ正規化ルールの実装が必要）
**必要なライブラリ：** なし or fastest-levenshtein（~5KB）
**追加バンドル：** 5KB 以下
**差別化：** Word/Google Docs のスペルチェックは日本語カタカナ表記ゆれに弱い。ライター・編集者向けニッチツール。

---

### 4-F. 漢字よみがなルビ振り

**概要：** 日本語テキストを入力 → kuromoji で形態素解析 → ルビ付きHTML または「漢字(よみ)」形式でテキスト出力。

**実装難易度：** B（kuromoji の非同期ロードと辞書データが主なハードル）
**必要なライブラリ：** kuromoji-es（ES Module 版、約10MB 辞書）
**追加バンドル：** 10MB 辞書（IndexedDB キャッシュで2回目以降は不要）
**差別化：** 外国語学習者・子供向けテキスト作成に有用。既存ツールはサーバーサイド依存が多い。

---

### 4-G. カラーコード → 日本の伝統色名マッチャー

**概要：** HEX または RGB を入力 → traditional-colors.json（250色）とのユークリッド距離（Lab色空間）で最近傍の伝統色名を表示。

**実装難易度：** A
**必要なライブラリ：** chroma.js（~50KB）または自前のLab変換（約20行）
**追加バンドル：** 50KB 以下
**差別化：** 2-I と同一。デザイナー向けの実用ツールとして需要が高い。4-G として再掲するのは「embedding不使用で独立して作れる」ため。

---

### 4-H. JSON / YAML バリデーター + 整形ツール

**概要：** JSON または YAML を貼り付け → パース・バリデーション → 整形出力（インデント調整）+ エラー箇所のハイライト。

**実装難易度：** A
**必要なライブラリ：** js-yaml（~30KB）
**追加バンドル：** 30KB
**差別化：** 一般的なツールだが日本語キーの扱いや Unicode に対応した信頼性の高いブラウザ版は需要あり。

---

### 4-I. 自然言語単位変換 + 時差計算

**概要：** 「ニューヨークの今の時刻」「100マイルは何km」「光が地球を1周する時間」などのクエリをパース → 計算結果を返す。

**実装難易度：** C（クエリパースロジックが複雑。意図を抽出するのが難しい）
**必要なライブラリ：** chrono.js（時刻部分）+ 独自単位変換辞書
**差別化：** 面白い方向性だが、「クエリを正確にパースする」部分のロバスト性確保がC難易度の理由。限定スコープ（時差計算のみ、単位変換のみ）に分割すればAまで下がる。

---

### 4-J. Markdown → 絵文字付きサマリー

**概要：** Markdown ドキュメントを貼り付け → 見出し・箇条書きを抽出 → 各項目に関連絵文字を付与してコンパクトにまとめる。

**実装難易度：** A（絵文字マッピングは辞書ベースで十分）
**必要なライブラリ：** marked.js（~20KB）
**追加バンドル：** 20KB
**差別化：** スライド作成・SNS投稿用途。embedding と組み合わせれば精度向上（B難易度）も可能。

---

### 4-K. 文章トーン分析（ポジネガ・丁寧度）

**概要：** テキストを入力 → 感情極性（ポジティブ/ネガティブ）・丁寧度（敬語レベル）・断定度をスコア化。lexicon ベースの軽量実装。

**実装難易度：** B（日本語感情語彙辞書の調達・実装）
**必要なデータ：** 日本語評価極性辞書（東北大公開版が利用可）
**追加バンドル：** 語彙辞書 ≈ 500KB〜1MB
**差別化：** SNS 投稿前の「怒ってないか確認」ツールとしてエンタメ性がある。embedding 基盤と将来統合可能。

---

### 4-L. ハッシュタグ提案ツール

**概要：** テキストを入力 → TF-IDF または n-gram 頻出語抽出 → `#` 付きで提案。日本語・英語両対応。

**実装難易度：** A（TF-IDF は純JS実装で十分）
**必要なライブラリ：** なし（または tiny-nlp 系）
**追加バンドル：** ゼロ〜20KB
**差別化：** 入力テキストから自動生成するブラウザツールはいくつか存在するが、日英両対応は少ない。embedding と組み合わせれば意味ベースのタグ提案も可能。

---

### 4-M. 文の複雑さ / 「ですます調 / だ・である調」一貫性チェック

**概要：** 日本語テキスト → 文体の混在（ですます混じり）を検出 → 箇所をハイライト。

**実装難易度：** A（正規表現ベースで十分）
**追加バンドル：** ゼロ
**差別化：** ライター・学生向けの実用ツール。既存ツールの多くはサーバーサイド依存。

---

## 5. 「モデル1個 runtime ロード」設計の妥当性評価

### 結論：投資対効果は高い

**同一モデルで作れるツールの数：** 上記の中で runtime MiniLM を必要とするツールは少なくとも 8〜10 個（2-C, 2-D, 3-A, 3-B, 3-C, 3-D, 3-E, 3-F, 3-G）。

**技術的な実現可能性：**

- Web Worker Singleton パターンにより、モデルは1回ロードすれば複数ツールで共有できる
- v4 ModelRegistry API で「キャッシュ済みか否か」を事前確認し、ユーザーにロードコストを事前通知できる
- 2回目以降は IndexedDB キャッシュから高速起動（数秒以内）

**コスト試算：**

- 初回ロード：WiFi で約20秒、4G で約100秒（int8: 118MB）
- リピート訪問：1〜3秒（デシリアライズのみ）
- 推論速度：WASM(SIMD) で 8〜12ms/文（embedding 生成）
- 400語の yoji 全件検索：400 × ベクトル演算 ≈ 数ms（十分高速）

**UX 設計上の必須対応：**

1. ロード中のプログレスバー表示（v4 progress_callback 活用）
2. 初回 118MB ダウンロードの事前告知（「初回のみ AI モデルの読み込みが必要です」）
3. Web Worker でメインスレッドブロックを防止
4. キャッシュ済みの場合はバナーを出さない（2回目以降はシームレス）

**最大のリスク：**

- モバイル 4G での初回体験：100秒は厳しい。WiFi / デスクトップ向けのツールとして位置づけるか、「ロードに数分かかります」と明示する
- モバイルユーザーが多い場合は、build 時に embedding を事前計算するアーキテクチャ（2-A, 2-B 方式）を優先し、runtime ロードは段階的に導入するほうが安全

### 推奨ロードマップ

**Phase 1（embedding 基盤不要、即実装可能）：**

- 2-A 四字熟語レコメンダー（build 時 embedding のみ）
- 2-B 伝統色ファインダー（同上）
- 2-H 漢字カラーマッチ（既存 embedding 活用）
- 4-G カラーコード→伝統色名
- 4-D 読書時間カウンター
- 4-H JSON/YAML バリデーター
- 4-M 文体一貫性チェッカー

**Phase 2（runtime MiniLM 基盤を1本作れば展開可能）：**

- 3-A セマンティック類似度チェッカー（最もシンプル、基盤の実証）
- 2-C テキスト→漢字一文字（既存 embedding 活用）
- 3-F 翻訳品質チェッカー（3-A の派生）
- 3-G テキスト→色（PCA）

**Phase 3（複雑な UI または追加データが必要）：**

- 3-C クラスタリング可視化（UMAP-JS）
- 3-D セマンティックメモ帳（IndexedDB 永続化）
- 2-D 詩→伝統色パレット（説明文整備）

---

## 6. データ資産の現状まとめ

| データ                  | エントリ数 | 主要フィールド                                | embedding 生成状況              | ツール活用可否                                            |
| ----------------------- | ---------- | --------------------------------------------- | ------------------------------- | --------------------------------------------------------- |
| kanji-data.json         | 2,136字    | character, meanings（英語）, kunYomi, onYomi  | 済（kanji-embeddings-384.json） | 即時活用可                                                |
| yoji-data.json          | 400語      | yoji, meaning（日本語）, difficulty, category | 未生成                          | build 時生成で即時活用可                                  |
| traditional-colors.json | 250色      | name, hex, rgb, hsl, category                 | 未生成                          | name+category 連結でbuild時生成可（説明文追加で精度向上） |

**重要な注意点：** traditional-colors.json には説明文（由来・雰囲気の説明）フィールドが存在しない。色名（「鴇」「真朱」等）+ カテゴリ（「red」等）の組み合わせだけでも embedding は生成できるが、意味的な豊かさは低い。説明文フィールドを追加する前処理を行うと大幅に品質が向上する。

---

## 参考情報源

- [Xenova/paraphrase-multilingual-MiniLM-L12-v2 ONNX ファイル一覧](https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2/tree/main/onnx)
- [Transformers.js v3 公式ブログ（WebGPU対応）](https://huggingface.co/blog/transformersjs-v3)
- [Transformers.js v4 公式ブログ（C++ WebGPU Runtime）](https://huggingface.co/blog/transformersjs-v4)
- [WebGPU vs WASM ベンチマーク](https://www.sitepoint.com/webgpu-vs-webasm-transformers-js/)
- [Transformers.js プロダクション最適化](https://www.sitepoint.com/optimizing-transformers-js-production/)
- [umap-js (PAIR-code)](https://github.com/PAIR-code/umap-js)
- [chrono.js 自然言語日付パーサー](https://github.com/wanasit/chrono)
- [kuromoji-es ES Module版](https://github.com/code4fukui/kuromoji-es)
- [Mood Palette Generator（競合参考）](https://moodpalettegenerator.net/)
- [vector-storage（ブラウザ内ベクトルDB参考）](https://github.com/nitaiaharoni1/vector-storage)
