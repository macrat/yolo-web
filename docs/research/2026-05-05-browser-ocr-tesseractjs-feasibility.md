---
title: ブラウザ完結型OCRツール実現可能性調査（Tesseract.js中心）
date: 2026-05-05
purpose: yolos.netへの「画像からOCR」ツール実装のバックログ追加可否判断
method: |
  Tesseract.js公式リポジトリ・npm・jsDelivr CDN・GitHub Issues・Next.js公式ブログ・
  Hugging Face Model Hubを横断調査。検索クエリ:
  "Tesseract.js v7 release 2025", "tesseract.js Next.js App Router",
  "tesseract.js bundle size wasm CDN", "transformers.js TrOCR browser Japanese",
  "PaddleOCR browser WASM Japanese", "Scribe.js tesseract.js alternative",
  "tesseract.js iOS Safari memory", "Next.js 16 WASM Web Worker"
sources:
  - https://github.com/naptha/tesseract.js/releases
  - https://github.com/naptha/tesseract.js-core/releases
  - https://cdn.jsdelivr.net/npm/@tesseract.js-data/jpn@1.0.0/4.0.0_best_int/
  - https://cdn.jsdelivr.net/npm/@tesseract.js-data/jpn_vert@1.0.0/4.0.0_best_int/
  - https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1.0.0/4.0.0_best_int/
  - https://github.com/naptha/tesseract.js/issues/868
  - https://github.com/scribeocr/scribe.js/blob/master/docs/scribe_vs_tesseract.md
  - https://huggingface.co/Xenova/trocr-base-printed
  - https://nextjs.org/blog/next-16
  - https://simonwillison.net/2024/Mar/30/ocr-pdfs-images/
  - https://github.com/tesseract-ocr/tessdata_fast
---

# ブラウザ完結型OCRツール実現可能性調査

## エグゼクティブサマリー

**実現可能性: 条件付きYes**

Tesseract.js v7をコアに据えたブラウザ完結型OCRツールは、**印刷活字の日本語（横書き）に限れば実用水準で実装可能**。縦書き・手書き・斜め文字は精度に重大な制約があり、機能説明に明記することが必須条件。バンドルサイズは遅延ロードで実質ゼロに抑えられる。

---

## 1. Tesseract.js 現状（2026年5月時点）

### バージョンとメンテナンス状況

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| 最新版       | v7.0.0（2024年12月15日リリース）         |
| GitHubスター | 38,000+                                  |
| フォーク数   | 2,400+                                   |
| メンテ状況   | 活発（2025年も継続コントリビュート確認） |
| Node.js要件  | v16以上（v7）、v14以上（v6）             |

### v7の主要変更点

- **パフォーマンス**: v6比でランタイム15〜35%削減（最新Intel CPUで特に効果大）
- **新ビルド**: `relaxedsimd`ビルド追加によりWASM実行速度が一部デバイスで20%以上向上
- **Emscripten**: 4.0.15にアップデート
- **破壊的変更**: Node.js v14サポート終了

### v6で対応済みの問題（参考）

- 長期稼働でのメモリリーク修正
- デフォルト出力フォーマット削減（hOCRは明示的に有効化が必要になった）
- `worker.initialize` / `worker.loadLanguage` など非推奨APIの削除

---

## 2. バンドルサイズと遅延ロード

### ファイルサイズ一覧（実測値）

| ファイル                            | サイズ（gzip圧縮済み）              |
| ----------------------------------- | ----------------------------------- |
| tesseract.js本体（npm）             | 約100〜150KB（JS部分のみ）          |
| tesseract-core-simd-lstm.wasm       | 約4〜5MB（非圧縮）/ 圧縮後 約2〜3MB |
| `eng.traineddata.gz`（CDN）         | **2.82 MB**                         |
| `jpn.traineddata.gz`（CDN）         | **1.94 MB**                         |
| `jpn_vert.traineddata.gz`（CDN）    | **1.93 MB**                         |
| 合計（eng + jpn + jpn_vert + wasm） | **約9〜11 MB**（初回ロード時）      |

Tesseract.js公式ドキュメントが示す「デフォルト設定での初回ダウンロード総量は約15MB」という数字は、WASM・JS・言語データをまとめた非圧縮換算の数字。gzip/brotli圧縮CDN経由では実際のネットワーク転送量は半分程度になる。

### CDN遅延ロードの可否

**可能**。デフォルトで jsDelivr CDN（`cdn.jsdelivr.net`）からの自動ダウンロードに対応。

```javascript
const worker = await createWorker("jpn+jpn_vert", 1, {
  langPath: "https://cdn.jsdelivr.net/npm/@tesseract.js-data",
  // キャッシュ先をIndexedDBに変更可能
  cacheMethod: "indexeddb",
});
```

### Next.js App RouterでのLazy Load戦略

`next/dynamic`はReactコンポーネント向けであり、WASMライブラリには**Web Workerパターンが最適解**。

```typescript
// app/tools/ocr/page.tsx
import dynamic from 'next/dynamic';

const OCRTool = dynamic(() => import('@/components/OCRTool'), {
  ssr: false,  // クライアントサイドのみ
  loading: () => <p>Loading...</p>,
});
```

`next.config.ts`に以下のwebpack設定が必要：

```typescript
webpack: (config) => {
  config.resolve.alias.canvas = false;
  config.resolve.alias.encoding = false;
  return config;
};
```

**Next.js 16固有の注意点**: デフォルトバンドラーがTurbopackに変更。`next build --webpack`オプションで従来のwebpackを使用可能。Tesseract.jsのcanvas/encodingエイリアス問題がTurbopackで解消されているか最終確認が必要。

---

## 3. 認識精度の現実評価

### 日本語各ケース

| ケース                       | 精度         | 備考                                                                      |
| ---------------------------- | ------------ | ------------------------------------------------------------------------- |
| 印刷活字（横書き、高解像度） | 高（95%+）   | 実用水準。`jpn` データで対応                                              |
| 印刷活字（縦書き）           | **低〜中**   | `jpn_vert`モデルは既知の不具合多数。PSM設定が難しく出力が乱れるケースあり |
| 手書き                       | **実用不可** | Tesseract（およびTesseract.js）の根本的な設計制限。手書き専用モデルが必要 |
| 斜め文字・傾き               | 低           | `deskew`前処理で改善可能だが精度に限界あり                                |
| 低解像度（200dpi以下）       | 低           | 300dpi相当以上を推奨                                                      |
| 混在テキスト（日英混合）     | 中           | `jpn+eng`のマルチ言語指定で対応可能                                       |

### 縦書き対応の現実

Tesseractの`jpn_vert`モデルには2024年時点でも複数の未解決Issueが存在する（[#4128](https://github.com/tesseract-ocr/tesseract/issues/4128), [#1117](https://github.com/tesseract-ocr/tesseract/issues/1117)）。「縦書きに対応」と謳う場合、実際には横書き変換後に認識する回避策が必要になるケースがある。ユーザーに期待値を正確に伝えることが重要。

### 推奨プリプロセッシング（Canvas API で実装可能）

```
1. グレースケール変換
2. 二値化（Otsu法または固定しきい値）
3. ノイズ除去（メディアンブラー）
4. 傾き補正（deskew）→ Hough変換ベース
5. リサイズ（300dpi相当: 最短辺800px以上推奨）
```

すべてCanvas/OffscreenCanvasで実装可能。P5.jsやOpenCV.js（重い）を使う方法もあるが、自前実装でも十分。

---

## 4. 代替候補の評価

### Scribe.js

Tesseract.jsの開発元（naptha）が公式に推奨している高機能代替。

| 比較軸       | Tesseract.js                   | Scribe.js                                |
| ------------ | ------------------------------ | ---------------------------------------- |
| 精度         | 標準                           | 高精度（高品質スキャンで特に差が出る）   |
| PDF対応      | なし（PDF.jsと組み合わせ必要） | ネイティブ対応（テキストレイヤー抽出も） |
| フォント認識 | なし                           | あり                                     |
| サイズ       | 小                             | 大（品質モード時に追加ダウンロード）     |
| ライセンス   | Apache 2.0                     | **AGPL 3.0** ← yolos.netへの影響要確認   |
| 日本語対応   | あり                           | Tesseract.jsベースなので同等             |

**AGPL 3.0のリスク**: Scribe.jsをウェブサービスで使用する場合、サービス自体のソースコード公開義務が生じる可能性。yolos.netの商用利用方針次第で問題になりうる。

### Transformers.js (TrOCR, Xenova)

| 比較軸       | 内容                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| 日本語対応   | `Xenova/trocr-base-printed`は英語特化。日本語特化モデルは現状HuggingFaceにONNX変換済みのものが少ない |
| モデルサイズ | **decoder_model_quantized.onnx だけで249MB**（!）ブラウザ用途では非現実的                            |
| 精度         | 高精度だがモデル依存                                                                                 |
| 推論速度     | 低速（モバイルでは実用困難）                                                                         |
| **結論**     | **現時点ではモバイルブラウザ向けOCRには不向き**                                                      |

### PaddleOCR (Paddle.js)

| 比較軸       | 内容                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| 日本語対応   | PP-OCRv5でJapaneseサポート。精度良好                                         |
| ブラウザ動作 | WebGL/WebGPU/WASM対応                                                        |
| 実績         | 漫画リーダー等の実装例あり                                                   |
| 導入コスト   | Tesseract.jsより高い（ドキュメント・エコシステムが英語/中国語中心）          |
| **結論**     | 将来的なアップグレードパスとして検討価値あり。初期実装はTesseract.jsが現実的 |

### tesseract-wasm (robertknight)

非公式の軽量WASM実装。英語特化でライブラリ+英語データが約2.1MB（Brotli圧縮）と軽量だが、日本語非対応。

---

## 5. レイアウト認識（段組・表）の現実性

Tesseract.jsでは`PSM (Page Segmentation Mode)`の設定でレイアウト認識を制御できるが：

- **2段組**: PSM 1（自動）または PSM 3（完全自動）で一部対応。ただし精度は低く、段が混在したテキストになりやすい
- **表**: セル境界の認識は基本的に**不可**。テキストは抽出できても表構造は壊れる
- **実用的な代替**: レイアウト認識が重要なユースケースではScribe.js、またはサーバーサイドのLayoutParserやGPT-4o Visionが現実的

**結論**: 単純な1カラム文書は高精度。表・段組は「おまけ程度」として扱い、ユーザーに期待値を伝えるべき。

---

## 6. 画像入力方式

すべてブラウザ標準APIで実装可能。

| 入力方式                   | 実装手段                                 | 難易度                   |
| -------------------------- | ---------------------------------------- | ------------------------ |
| ファイルアップロード       | `<input type="file">`                    | 低                       |
| ドラッグ&ドロップ          | `dragover`/`drop`イベント                | 低                       |
| クリップボードペースト     | `paste`イベント + `clipboardData`        | 低                       |
| カメラ撮影（getUserMedia） | `navigator.mediaDevices.getUserMedia`    | 中                       |
| リアルタイムビデオOCR      | `requestAnimationFrame` + canvas capture | 高（パフォーマンス注意） |

カメラ入力はモバイルで特に有用（名刺・看板の撮影など）。`capture="environment"`属性でスマートフォンの背面カメラを直接起動できる。

---

## 7. iOS Safari での動作実績とメモリ制限

### 確認されている問題

- **WebAssembly最大メモリ制限**: iOS SafariではWASMヒープの最大値を2GBに設定するとOut-of-Memory発生。256MB以下に抑えることで回避可能
- **iOS 17での不具合**: `OEM 0`（Legacyモデル）使用時にクラッシュする不具合がv5.0.4で報告済み（Issue #867）。LSTMモードを使用することで回避可能
- **処理速度**: iPhone X世代で640x640px画像のOCRに2〜20秒。最新iPhoneでは大幅に改善
- **メモリ増加**: v6でメモリリーク修正済みだが、大画像の連続処理は依然として注意が必要

### 推奨事項

- 入力画像を認識前に最大2000px程度にリサイズ（精度とメモリのバランス）
- Legacyモデル（OEM 0）は避け、LSTMモード（OEM 1）を使用
- iOS Safariのブラウザ要件: Next.js 16がSafari 16.4+を最小要件に指定しているため、この世代以上を前提にできる

---

## 8. プログレス表示とWeb Worker化

### Web Workerは事実上必須

Tesseract.jsは内部的にWeb Workerを使用しているが、進捗コールバックとUI更新の連携が必要：

```typescript
const worker = await createWorker("jpn", 1, {
  logger: (m) => {
    // m.status: 'loading tesseract core', 'loading language traineddata',
    //           'initializing tesseract', 'recognizing text'
    // m.progress: 0.0 ~ 1.0
    setProgress(Math.round(m.progress * 100));
    setStatus(m.status);
  },
});
```

### プログレスフェーズ

1. WASMコアのロード（初回のみ。以降はキャッシュ）
2. 言語データのロード（初回のみ。IndexedDBキャッシュ推奨）
3. Tesseractエンジンの初期化
4. テキスト認識（画像サイズ・複雑さに依存）

初回アクセス時の総待機時間：Wi-Fi環境で20〜40秒程度が現実的な想定。キャッシュ後は5〜15秒。

---

## 9. 推奨技術スタック

### 構成

```
tesseract.js v7        - OCRエンジン（Apache 2.0ライセンス）
PDF.js (Mozilla)       - PDF→Canvas変換（MITライセンス）
jsDelivr CDN           - 言語データの遅延ロード（jpn/jpn_vert/engを必要時のみ）
Canvas API             - プリプロセッシング（二値化・リサイズ・傾き補正）
Web Worker             - メインスレッドのブロッキング防止
IndexedDB              - 言語データのローカルキャッシュ
```

### 想定サイズ（初回ロード）

| コンポーネント          | サイズ（転送量目安）  |
| ----------------------- | --------------------- |
| tesseract.js本体 + WASM | 約3〜4 MB（圧縮後）   |
| jpn.traineddata.gz      | 1.94 MB               |
| jpn_vert.traineddata.gz | 1.93 MB（必要時のみ） |
| eng.traineddata.gz      | 2.82 MB（必要時のみ） |
| **合計（日本語のみ）**  | **約5〜6 MB**         |
| **合計（日英+縦書き）** | **約9〜11 MB**        |

ツールページ自体のJSバンドルへの追加は0（lazy load）。OCR開始ボタン押下後に初めてダウンロードが始まる構成にすること。

---

## 10. 「ただのOCR」を超える魅力的な機能アイデア

### 即実装できる高付加価値機能

1. **URL / メールアドレス自動リンク化**: 認識結果のテキストをregexで解析し、リンクとして自動クリック可能にする（名刺・ポスターのQR代替）

2. **Markdown変換**: 見出しと思われるテキストのフォントサイズ・位置情報（hOCR）から構造を推定し、Markdownで出力。ブログ記事・資料のデジタル化に有用

3. **PDF.js統合でPDF→テキスト変換**: スキャンPDFを読み込んでテキスト抽出。既存テキストレイヤーがある場合はOCRをスキップ（Scribe.jsの機能だが、PDF.js + 自前実装でも可能）

4. **多言語混在自動検出**: 認識前に言語を指定せずに`jpn+jpn_vert+eng`で試行し、結果のスコアで最良言語を自動判定

5. **カメラモードでリアルタイム認識**: スマートフォンで名刺・掲示物をかざすと自動認識。精度は限定的だが「体験」として面白い

6. **画像内テキスト座標ハイライト**: Tesseract.jsが返すBounding Boxデータを使い、元画像上に認識したテキストをオーバーレイ表示（誤認識の可視化にも有用）

7. **認識結果の差分プレビュー**: 前処理前/後の画像を並べて表示し、プリプロセッシングの効果を可視化

8. **QRコード併用**: jsQR等のQRコードライブラリと組み合わせ、QRコードとテキストを同一画像から同時抽出

### 中〜長期の機能アイデア

- 縦書き→横書き変換エンジンの自前実装（Tesseractの縦書き弱点を補う）
- OCR結果の辞書引き（日本語テキスト認識後にJisho APIで意味を自動付与）
- スマートフォンカメラを使った書籍・教科書のページ自動OCR（複数枚まとめて処理）

---

## 11. 実装上の主要リスク

| リスク                           | 深刻度         | 対策                                                                     |
| -------------------------------- | -------------- | ------------------------------------------------------------------------ |
| **縦書き精度の期待外れ**         | 高             | 機能説明に「縦書きは試験的対応、精度保証なし」と明記                     |
| **iOS Safariのメモリクラッシュ** | 中             | LSTMモード限定、入力画像のリサイズ上限を設定、エラーハンドリングを丁寧に |
| **Turbopack でのビルドエラー**   | 中             | Next.js 16デフォルトはTurbopack。実装前にサンドボックスで動作確認必須    |
| **初回ロード10秒超による離脱**   | 中             | プログレスバーとキャッシュ説明UI、「次回は速くなります」のメッセージ     |
| **Scribe.jsのAGPLライセンス**    | 中             | Tesseract.jsに固定（Apache 2.0）。PDF対応はPDF.js（Apache 2.0）で補完    |
| **手書き認識要望への対応不可**   | 低（UI制御可） | 「印刷テキスト専用」を明示すれば許容範囲                                 |
| **低解像度スマホ写真の精度**     | 低〜中         | プリプロセッシング + ユーザーへの「できれば300dpi以上」の案内            |

---

## 12. バックログ追加の結論

**推奨: バックログ追加YES**

### 根拠

- 技術的実現可能性は確認済み（Tesseract.js v7、Apache 2.0、日本語対応、Next.js 16 App Router対応）
- 類似ツールとの差別化要素（URL抽出・Markdown変換・BBox可視化・カメラ入力）で「体験として面白い」ツールに仕上げられる
- バンドルへの影響ゼロ（完全遅延ロード）
- 外部API不要でプライバシー訴求が可能（「すべてブラウザ内で処理、サーバー送信なし」）

### 実装スコープの推奨（MVP）

1. ファイルアップロード + ドラッグ&ドロップ
2. 日本語（横書き）+ 英語のみ（縦書きはv2以降）
3. プログレスバー付きOCR実行
4. テキスト結果のコピー + ダウンロード（.txt）
5. URL/メールアドレスの自動リンク化
6. 「サーバー送信なし」プライバシーバッジ

縦書き・手書き・PDF・カメラはv2以降の機能として分離することを推奨。
