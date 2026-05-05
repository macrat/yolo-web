---
title: ブラウザ完結型AI風ツール アイデア発掘調査 2026年5月
date: 2026-05-05
purpose: yolos.netのバックログ候補として、外部API不要・ブラウザ完結で動作する「AI風」ツールのアイデアを幅広く収集し、実装可能性・差別化要素とともに整理する
method: |
  - Transformers.js v4 / ONNX Runtime Web / MediaPipe / ml5.js 等の最新動向をウェブ検索
  - 各アイデアのライブラリ・モデルサイズ・実装事例を個別に調査
  - TinyWow・tools.simonwillison.net 等の競合サービスの掲載状況を確認
  - kuromoji.js / essentia.js / face-api.js 等の日本語対応・音声・映像系ライブラリを個別調査
  - 既存ツール一覧との重複確認（age-calculator〜yaml-formatter 計35ツール）
sources:
  - https://huggingface.co/docs/transformers.js/index
  - https://github.com/huggingface/transformers.js
  - https://howaiworks.ai/blog/transformers-js-v4-release
  - https://pyimagesearch.com/2025/10/20/running-smolvlm-locally-in-your-browser-with-transformers-js/
  - https://huggingface.co/blog/smolervlm
  - https://ai.google.dev/edge/mediapipe/solutions/vision/gesture_recognizer/web_js
  - https://github.com/justadudewhohacks/face-api.js/
  - https://mtg.github.io/essentia.js/
  - https://github.com/takuyaa/kuromoji.js/
  - https://github.com/hexenq/kuroshiro
  - https://lokeshdhakar.com/projects/color-thief/
  - https://github.com/Tezumie/Image-to-Pixel
  - https://github.com/wanasit/chrono
  - https://github.com/spencermountain/compromise
  - https://github.com/do-me/SemanticFinder
  - https://yining1023.github.io/doodleNet/
  - https://github.com/mattiasw/ExifReader
  - https://github.com/jiggzson/nerdamer
  - https://simonwillison.net/2025/Sep/4/highlighted-tools/
  - https://www.tinywow.com/
---

# ブラウザ完結型AI風ツール アイデア発掘調査

## 調査の背景と制約

- 外部APIへの通信なし（完全ブラウザ内完結）
- バンドル・モデルサイズを重視（100MB超は要慎重判断）
- transformers.js によるモデル遅延ロードは許容
- 「AI的」かどうかの基準はユーザー体験として「賢い」と感じられればよい
- 既存35ツールとの重複を避ける

### 技術環境メモ（2026年5月時点）

Transformers.js は2025年3月にv4をリリース。WebGPU Runtimeを C++ で書き直し、約200アーキテクチャに対応。量子化（q4/q8）でモデルを大幅圧縮できる。SmolVLM-256M（256Mパラメータ）がブラウザ上でWebGPU動作するまで軽量化が進んでいる。MediaPipe の Tasks Vision JS も積極的にメンテされており、手・顔・姿勢検出がnpmパッケージ一発で使える。

---

## 推奨アイデアリスト（15件）

---

### 1. 感情・トーン分析（Sentiment Analyzer）

**概要**: 入力テキストのポジティブ/ネガティブ/中立を判定。文章全体のスコアと、文ごとのハイライト表示。ビジネスメール・レビュー文・SNS投稿など実用用途が広い。

**実装方法**:

- ライブラリ: `@huggingface/transformers` (Transformers.js v4)
- モデル: `Xenova/distilbert-base-uncased-finetuned-sst-2-english`（英語）または `Xenova/bert-base-multilingual-uncased-sentiment`（多言語・日本語対応）
- 量子化q8なら推定 **67〜70MB** 程度（DistilBERTベース）
- パイプライン: `pipeline('sentiment-analysis', model)`
- 初回ダウンロード後はブラウザキャッシュに保存される

**バンドルサイズ**: Transformers.js ライブラリ本体 ~500KB + モデル遅延ロード

**実装難易度**: A（簡単・1サイクル）

**差別化・競合状況**:

- TinyWowには同機能なし（ファイル変換系がメイン）
- tools.simonwillison.net にはシンプルな感情分析はあるが日本語対応はない
- yolos.net の日常タスク向けコンセプトと相性がよく、既存の `business-email` ツールとのシナジーがある

---

### 2. 言語検出（Language Detector）

**概要**: 貼り付けたテキストが何語かを即座に判定。複数言語が混在する場合は比率も表示。翻訳前の確認、コピペした素材の整理などに役立つ。

**実装方法**:

- ライブラリ: `cld3-asm`（Google CLD3 の WASM バインディング）
- モデル: CLD3 の推論コードは文字 n-gram + 密な埋め込みベクトルの平均化で言語を特定。モデルは **WASM に組み込み済み**でダウンロード不要
- 代替: Transformers.js の `langdetect` タスク
- CLD3は100以上の言語に対応

**バンドルサイズ**: cld3-asm の WASM は数百KB 程度（軽量）

**実装難易度**: A（簡単・1サイクル）

**差別化・競合状況**:

- シンプルな言語判定ツールはオンラインに多いが、ブラウザ完結・プライバシー保護を明示するサイトは少ない
- `kana-converter` や `keigo-reference` など既存の日本語ツールとのシナジーで、外国語テキスト処理の入口として機能する

---

### 3. 固有表現抽出（Named Entity Recognizer）

**概要**: テキストから人名・地名・組織名・日付などを自動検出してハイライト表示する。文書整理・引用抽出・記事の要点把握などに使える。

**実装方法**:

- ライブラリ: Transformers.js
- モデル: `Xenova/bert-base-NER`（英語4カテゴリ: PER/ORG/LOC/MISC）
  - ただしリポジトリ全体は1.35GBあり、quantized ONNX のみ使用する場合は大幅に圧縮される。q8量子化で **約100MB前後**と想定。
  - 日本語対応は `Xenova/bert-base-chinese-ner` に近い別モデルを検討（日本語NER専用の小型ONNX変換モデルを要確認）
- パイプライン: `pipeline('token-classification', model)`

**バンドルサイズ**: モデル約100MB（q8）、遅延ロード

**実装難易度**: B（標準・1〜2サイクル）日本語対応を追加するなら検証コストあり

**差別化・競合状況**:

- 英語限定でよければTinyWowや既存ツールにないニッチな機能
- 日本語対応ができれば大きな差別化（kuromoji.jsで固有表現に近い単語種別取得も可能）

---

### 4. 読みやすさ評価（Readability Scorer）

**概要**: 文章の読みやすさをFlesch Reading Ease・Flesch-Kincaid Grade・Coleman-Liau等の指標でスコアリング。長文・短文の平均・複雑な語彙の割合なども表示。ブログ記事・レポート・マニュアルの品質チェックに役立つ。

**実装方法**:

- ライブラリ: `text-readability`（npm）またはバニラJS実装（`sahava/readability-score-javascript`）
- AI成分: アルゴリズムベースだがスコア計算が複数指標にわたり「分析AIっぽい」体験が作れる
- 日本語版は文字数・文長・漢字比率に基づく独自スコアリングを自前実装可能（kuromoji.js 補助）
- モデルロードなし

**バンドルサイズ**: ライブラリ数十KB。モデルなし

**実装難易度**: A（簡単・1サイクル）

**差別化・競合状況**:

- TinyWowにはなし。tools.simonwillison.netにもなし
- 日本語の読みやすさを評価するツールは一般的なオンラインサービスでは少ない
- `char-count`・`byte-counter` を使うユーザーとのシナジーが高い

---

### 5. ふりがな自動付与（Furigana Generator）

**概要**: 日本語テキストを入力すると漢字の上にひらがな読みを Ruby 表記で付与する。子ども向けコンテンツ作成、日本語学習者向けの素材整形、コピーの読み仮名確認などに実用的。

**実装方法**:

- ライブラリ: `kuroshiro` + `kuroshiro-analyzer-kuromoji`
  - Kuroshiro-browser（Brotli圧縮済み辞書）が存在し、ブラウザ最適化版が利用可能
  - kuromoji.js の辞書は約8MB（gzip後）
- 出力形式: HTMLのrubyタグ形式でコピー可能
- モデルロードなし（辞書ベース）

**バンドルサイズ**: 辞書約8〜10MB（遅延ロード可）

**実装難易度**: B（標準・1〜2サイクル）辞書ロードと非同期処理の制御が必要

**差別化・競合状況**:

- JapanCalc.com 等に類似ツールあり。ただし yolos.net は日本語特化ツールが複数あり（`kana-converter`・`keigo-reference`）、同シリーズとして説得力がある
- ブラウザ完結・プライバシー保護を前面に出すことで差別化可能

---

### 6. 画像タグ自動生成（Image Auto-Tagger）

**概要**: 画像をドロップすると1000クラスのオブジェクト分類ラベルとスコアをリスト表示する。写真整理・素材管理・メタデータ入力の手間削減に役立つ。

**実装方法**:

- ライブラリ: `@tensorflow-models/mobilenet` (TensorFlow.js) または Transformers.js
- モデル: MobileNet V3 (TF.js版) **約16MB**（量子化で 4〜8MB に圧縮可）、ImageNetベース1000クラス
- 代替: `Xenova/vit-base-patch16-224`（Vision Transformer、q8で約90MB）
- Canvas APIでリサイズしてから推論

**バンドルサイズ**: TF.js + MobileNet で約25MB（モデル含む）

**実装難易度**: A（簡単・1サイクル）

**差別化・競合状況**:

- TinyWowにはAI画像タグ機能なし（ファイル変換系）
- `image-resizer`・`image-base64` を使うユーザーとのシナジーがある
- 「こんなものが写っています」という体験が新しい

---

### 7. 画像キャプション生成（Image Captioner）

**概要**: 画像をドロップすると、その内容を自然言語で説明する一文を生成する。ALTテキスト作成補助・写真の内容メモ・アクセシビリティ改善などに活用できる。

**実装方法**:

- ライブラリ: Transformers.js v4
- モデル: `HuggingFaceTB/SmolVLM-256M-Instruct` の ONNX 変換版
  - 256Mパラメータ、WebGPU対応。ブラウザ上で動作確認済み（2025年1月発表）
  - 推定ダウンロードサイズ: 約250〜500MB（量子化次第）。重めなので遅延ロード＋プログレス表示必須
  - 代替（軽量）: BLIP-base の ONNX 版（ただし性能はSmolVLMより低い）

**バンドルサイズ**: モデル約250MB以上。慎重判断が必要

**実装難易度**: C（難しい・3+サイクル）モデルサイズ・WebGPUフォールバック対応が複雑

**差別化・競合状況**:

- ブラウザ完結のキャプション生成は差別化が強い（TinyWowはサーバーサイド）
- `image-resizer`・`image-base64` との組み合わせ利用が期待できる
- モデルサイズ問題が解決する前提での中長期候補

---

### 8. 画像からカラーパレット抽出（Color Palette Extractor）

**概要**: 画像をドロップすると、最も支配的な5〜10色のカラーパレットを自動抽出してHEX/RGB値で表示。Webデザイン・ブランドカラー調査・配色インスピレーションに役立つ。

**概要補足**: 既存の `color-converter`・`traditional-color-palette` とは異なり、「画像から」カラーを逆引きする方向性。

**実装方法**:

- ライブラリ: `color-thief`（k-means++ベース、軽量・実績多数）または `dominate-color-js`
  - Color Thief v3 はPromise対応、WebWorkerでオフロード可能
  - 大きな画像は200px角にダウンサンプリングしてから処理（ライブラリ内部で自動対応）
- AI成分: k-means++クラスタリングによる知覚的に均一な色分割
- モデルロードなし

**バンドルサイズ**: Color Thief ~10KB。モデルなし

**実装難易度**: A（簡単・1サイクル）

**差別化・競合状況**:

- tools.simonwillison.netに類似ツールあり。ただしyolos.netは日本語UIで差別化可能
- `color-converter`・`traditional-color-palette` ユーザーへの自然な追加価値
- 差別化ポイント: 結果をCSSカスタムプロパティ・Tailwind設定形式でコピーできるようにする

---

### 9. ピクセルアート変換（Pixel Art Converter）

**概要**: 写真・イラストをドロップすると、ピクセルアート風に変換する。ピクセルサイズ・カラーパレット数・ディザリング方法（Floyd-Steinberg等）を調整可能。SNSアイコン・ゲーム素材・レトロ風デザインに活用できる。

**実装方法**:

- ライブラリ: `Image-to-Pixel`（JavaScript、Canvas API + Floyd-Steinbergディザリング）または `PixelIt`
  - `Image-to-Pixel` は HTML Canvas/p5.js/q5.js 対応、6種のディザリング方法をサポート
- AI成分: ディザリングアルゴリズムによる知覚的品質維持
- モデルロードなし

**バンドルサイズ**: 数十KB。モデルなし

**実装難易度**: A（簡単・1サイクル）

**差別化・競合状況**:

- PixelArtConverter.pro 等に類似ツールあり
- yolos.net の差別化: UIがシンプルで速い、日本語説明、プリセットパレット（ゲームボーイ・ファミコン等）
- `image-resizer` ユーザーと重なるターゲット層

---

### 10. 手書きスケッチ→図形整形（Sketch Beautifier）

**概要**: ブラウザのキャンバスに手で描いた線や図形を、きれいな直線・円・矩形に自動整形する。フローチャートや簡単な図解のプロトタイピングに役立つ。

**実装方法**:

- ライブラリ: Rough.js（ハンドドロー風スタイル）+ 自前の形状認識ロジック
  - 形状認識: ストロークのバウンディングボックス・縦横比・始点と終点の距離を比較して直線/円/矩形を判定
  - より高精度にしたい場合: TensorFlow.js の QuickDraw モデル（DoodleNet）を補助利用
- AI成分: 形状分類アルゴリズム（ルールベース + 必要に応じてDoodleNet CNN）
- モデルロードなし（ルールベースのみ）、DoodleNet使用時は ~6MB

**バンドルサイズ**: ルールベースなら数十KB。DoodleNet追加で+6MB程度

**実装難易度**: B（標準・1〜2サイクル）描画UX（undo/redo、入力デバイス対応）に工数がかかる

**差別化・競合状況**:

- Google AutoDraw が同コンセプトだが、外部API依存
- ブラウザ完結・プライバシー保護の観点で差別化
- モバイルタッチ入力対応で差別化強化

---

### 11. 落書き当てゲーム（Doodle Guesser）

**概要**: ユーザーが描いた落書きをAIがリアルタイムで推測するゲーム。Google Quick! Draw! と同様のコンセプトだが、ブラウザ完結でオフライン動作。エンターテイメント＋学習要素。

**実装方法**:

- ライブラリ: TensorFlow.js + DoodleNet（Quick DrawデータセットでCNN訓練済み）
  - `DoodleNet` は 345カテゴリ対応のCNNモデル、TF.js フォーマット
  - モデルサイズ: 約 **6MB**（軽量）
  - リアルタイム推論：canvas に描くたびに `requestAnimationFrame` でモデル推論

**バンドルサイズ**: TF.js ~500KB + モデル 6MB

**実装難易度**: B（標準・1〜2サイクル）ゲームUI・タイマー・スコアシステムの実装が必要

**差別化・競合状況**:

- Google Quick! Draw! は外部API。yolos.netはオフライン・プライバシー保護版として差別化
- `play` セクションへの追加候補としても適している
- エンゲージメントが高くシェアされやすい

---

### 12. BPM・テンポ検出（BPM Detector）

**概要**: 音楽ファイル（MP3/WAV）をドロップすると、BPM（テンポ）を自動検出して表示する。DJ・ダンサー・音楽制作者・動画BGM選びなどに実用的。

**実装方法**:

- ライブラリ: `essentia.js`（Essentia C++ライブラリのWASM版）
  - BPMestimation・ビート位置検出・ピッチ・キー検出など包括的な音楽分析が可能
  - 軽量カスタムビルドで必要アルゴリズムのみ選択可（サイズ削減可能）
  - 代替: `guess-bpm` 等の軽量ライブラリ（数十KB、精度はやや劣る）
- Web Audio APIでファイルを読み込み、AudioBufferに変換してEssentiaに渡す

**バンドルサイズ**: essentia.js 全体は数MB（WASMを含む）。軽量カスタムビルド利用を推奨

**実装難易度**: B（標準・1〜2サイクル）WAMSロードと非同期処理、大ファイル対応が必要

**差別化・競合状況**:

- TinyWowにBPM検出はなし
- 音声系ツールは既存35ツールに全くなく、新カテゴリとして差別化
- `音声の無音区間カット` 等と同カテゴリで展開できる

---

### 13. 画像 EXIF メタデータ閲覧・削除（EXIF Viewer & Cleaner）

**概要**: 画像ファイルをドロップすると、撮影日時・カメラ機種・GPS位置情報・ISO感度などのEXIFメタデータを一覧表示。不要なメタデータを削除してプライバシーを保護したファイルをダウンロードできる。

**実装方法**:

- ライブラリ: `ExifReader`（軽量JavaScript、JPEG/TIFF/PNG/HEIC/WebP対応）または `exif-js`
  - ExifReader は GPS情報をGoogle Maps URLに変換する機能も組み込み可能
  - メタデータ削除: Canvas APIで再描画してダウンロード（EXIFなしで出力）
- AI成分: なし（アルゴリズムベース）
- モデルロードなし

**バンドルサイズ**: ExifReader 約50KB。モデルなし

**実装難易度**: A（簡単・1サイクル）

**差別化・競合状況**:

- EXIFdata.com・Pi7 Image Tool 等に類似あり
- yolos.net の差別化: 日本語UI、削除後のダウンロードをワンステップで提供
- プライバシー意識の高まりから需要増加中
- `image-resizer`・`image-base64` ユーザーとのシナジー

---

### 14. 自然言語クエリ単位変換（NL Unit Converter）

**概要**: 「50キロは何マイル？」「100万円はドルでいくら？」のような自然文を入力すると単位変換して答える。既存の `unit-converter` ツールを自然言語入力で強化したバージョン。

**実装方法**:

- ライブラリ: `compromise.js`（180KB、NLP解析）+ `convert-units`（単位変換）+ `chrono-node`（日付解析）
- AI成分: compromise.js による数値・単位・通貨の自然言語解析（ルールベースNLP）
- 通貨レートはブラウザ完結の制約上、静的な基準レート（月次更新）またはWebWorkerでキャッシュ
- モデルロードなし

**バンドルサイズ**: 約200〜300KB。モデルなし

**実装難易度**: B（標準・1〜2サイクル）多様な入力パターンのパース精度が課題

**差別化・競合状況**:

- 既存 `unit-converter` を「より賢く」する派生ツールとして自然なポジション
- 自然言語入力対応は競合ツールにほぼなし
- `date-calculator`・`unix-timestamp` との親和性が高い

---

### 15. 顔ぼかしツール（Face Blur / Anonymizer）

**概要**: 画像をドロップすると顔を自動検出してぼかし処理を適用する。SNS投稿・スクリーンショット共有・資料作成時のプライバシー保護に使える。

**実装方法**:

- ライブラリ: `@vladmandic/face-api`（face-api.js の活発なフォーク、TF.js上）または MediaPipe Face Landmarker
- モデル: SSD MobileNetV1ベース顔検出器 + Tiny Face Detector（軽量版）
  - Tiny Face Detector: **約190KB**（非常に軽量）
  - SSD MobileNetV1: 約6MB
- Canvas APIで検出した顔バウンディングボックス領域にぼかし（CSS filter blur または Canvas pixelate）を適用
- バッチ処理（複数枚対応）

**バンドルサイズ**: face-api.js ~600KB + モデル 190KB〜6MB

**実装難易度**: A（簡単・1サイクル）顔検出ライブラリが充実しているため

**差別化・競合状況**:

- TinyWowに顔ぼかしはなし
- ブラウザ完結でサーバーに画像を送らない点が大きな差別化
- プライバシー重視の流れで需要増加

---

## 追加検討候補（夢のあるアイデア・中長期）

以下は実装コストが高い、またはモデルサイズが大きいが魅力的なアイデア。

### A. セマンティック絵文字検索（Emoji Semantic Search）

自然言語クエリを入力すると意味的に近い絵文字を提案する。例: 「うれしい」→😊🎉✨。

- 実装: Transformers.js の多言語 Sentence Embedding（`Xenova/paraphrase-multilingual-MiniLM-L12-v2`、~100MB）＋ 絵文字の説明テキストを事前エンベッド・シリアライズして同梱
- 難易度: B〜C（絵文字DBのエンベッド生成とバンドル最適化に工数）
- 参考: Towards Data Science の50言語対応セマンティック絵文字検索記事に詳細手法あり

### B. 音声ノイズ除去（Noise Suppressor）

録音したWAVファイルの背景ノイズをRNNoiseで除去する。

- 実装: `@jitsi/rnnoise-wasm`（AudioWorkletベース）
- モデルサイズ: RNNoise WAVは数百KB程度（軽量）
- 除外リストの「録音文字起こし」とは異なり、ファイル入力のみで完結
- 難易度: C（AudioWorklet + WASM連携の複雑さ）

### C. 姿勢・フォーム分析（Pose Analyzer）

Webカメラ画像またはアップロード画像から骨格33点を検出し、猫背・前傾などを判定してアドバイスする。

- 実装: MediaPipe Pose Landmarker（`@mediapipe/tasks-vision`）
- モデルサイズ: BlazePose Lite ~3MB
- 精度30FPS・99.5%の計数精度が研究報告あり
- 難易度: B〜C（カメラ権限管理・リアルタイム描画の最適化）

### D. 音楽キー・コード検出（Music Key Analyzer）

音楽ファイルのキー（調性）やコード進行を推定する。

- 実装: essentia.js のキー推定アルゴリズム + Chroma特徴量抽出
- 難易度: B〜C（音楽理論の表示UIと正確性の担保）

---

## 実装優先度まとめ

| #   | ツール名                | 難易度 | モデルサイズ   | 推奨優先度   |
| --- | ----------------------- | ------ | -------------- | ------------ |
| 1   | 感情・トーン分析        | A      | 67〜70MB (q8)  | 高           |
| 2   | 言語検出                | A      | ~数百KB (WASM) | 高           |
| 4   | 読みやすさ評価          | A      | なし           | 高           |
| 8   | カラーパレット抽出      | A      | なし           | 高           |
| 9   | ピクセルアート変換      | A      | なし           | 高           |
| 13  | EXIFビューア&クリーナー | A      | なし           | 高           |
| 15  | 顔ぼかし                | A      | 190KB〜6MB     | 高           |
| 5   | ふりがな自動付与        | B      | ~8MB (辞書)    | 中高         |
| 10  | スケッチ整形            | B      | なし〜6MB      | 中           |
| 11  | 落書き当てゲーム        | B      | ~6MB           | 中           |
| 12  | BPM検出                 | B      | ~数MB (WASM)   | 中           |
| 14  | 自然言語単位変換        | B      | なし           | 中           |
| 3   | 固有表現抽出            | B      | ~100MB (q8)    | 中           |
| 6   | 画像タグ生成            | A      | ~16MB          | 高           |
| 7   | 画像キャプション生成    | C      | 250MB+         | 低（中長期） |

---

## 競合サービスとの差別化整理

**TinyWow**: 150以上のツールがあるが、サーバーサイド処理中心でプライバシー観点で弱い。AI画像系に強いが、テキスト分析・音楽分析・EXIF等のニッチはない。

**tools.simonwillison.net**: 200以上のツール、LLM駆動が多く外部API依存。英語中心で日本語対応なし。

**yolos.net の差別化軸**:

1. **日本語ネイティブUI + 日本語処理対応**（ふりがな、言語検出の日本語、感情分析の日本語）
2. **完全ブラウザ完結・プライバシー保護**（画像・テキストがサーバーに送られないことを明示）
3. **小さく使いやすいツールとしての一貫したUX**
4. **AI実験サイトとしての透明性**（既存コンセプトとの整合性）

---

## 技術選定メモ

- **Transformers.js v4** (2025年3月リリース): WebGPU Runtime C++書き直し、~200アーキテクチャ対応。量子化q4/q8でモデル圧縮可能。初回ダウンロード後ブラウザキャッシュに保存。
- **MediaPipe Tasks Vision JS**: `@mediapipe/tasks-vision` NPMパッケージ。顔・手・姿勢検出がシンプルなAPIで利用可能。
- **face-api.js (vladmandic fork)**: 活発にメンテされているフォーク。Tiny Face Detector は190KBと超軽量。
- **kuromoji.js / kuroshiro**: 日本語形態素解析。辞書 ~8MB。`kuroshiro-browser` はBrotli圧縮でブラウザ最適化済み。
- **essentia.js**: 音楽音響分析WASM。カスタムビルドで必要アルゴリズムのみ選択可能。
- **color-thief**: k-means++で画像からカラーパレット抽出。~10KB、実績多数。
- **DoodleNet**: TF.js形式、345カテゴリ、~6MB。Quick Drawデータセット学習済み。
- **cld3-asm**: Google CLD3のWASMバインディング、数百KB、100以上の言語に対応。
