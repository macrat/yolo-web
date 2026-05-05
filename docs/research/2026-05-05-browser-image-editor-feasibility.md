---
title: ブラウザ完結型画像編集ツール 実現可能性調査
date: 2026-05-05
purpose: yolos.net への「画像編集ツール」実装に向け、背景除去・画像合成・色調整等のブラウザ完結実現可能性を評価し、バックログ追加可否の判断材料を提供する
method: |
  - WebSearch: background removal model comparison, transformers.js, @imgly/background-removal, RMBG-1.4, BiRefNet, U2Net, ESRGAN, face-api.js, UpscalerJS, WebGPU iOS status, Canvas memory iOS, CSS filter canvas, JPEG/WebP output, color palette extraction
  - Read: package.json, tools registry (既存ツール確認)
  - Bash: ディレクトリ構造・既存ツール一覧確認
sources:
  - https://github.com/imgly/background-removal-js
  - https://www.npmjs.com/package/@imgly/background-removal
  - https://huggingface.co/briaai/RMBG-1.4
  - https://huggingface.co/briaai/RMBG-2.0
  - https://medium.com/myorder/building-an-ai-background-remover-using-transformer-js-and-webgpu-882b0979f916
  - https://github.com/backblaze-b2-samples/b2-transformerjs-background-removal
  - https://img.ly/blog/browser-background-removal-using-onnx-runtime-webgpu/
  - https://pqina.nl/blog/total-canvas-memory-use-exceeds-the-maximum-limit/
  - https://caniuse.com/webgpu
  - https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/
  - https://upscalerjs.com/
  - https://github.com/thekevinscott/UpscalerJS
  - https://lokeshdhakar.com/projects/color-thief/
  - https://huggingface.co/docs/transformers.js/en/tutorials/next
  - https://medium.com/techhappily/client-side-ai-with-transformers-js-next-js-and-web-worker-threads-259f6d955918
---

# ブラウザ完結型画像編集ツール 実現可能性調査

## 調査サマリー

yolos.net（Next.js 16 App Router、静的エクスポート）への画像編集ツール追加について、すべての主要機能がブラウザ完結で実現可能である。特に背景除去は transformers.js + RMBG-1.4 の組み合わせが実績・ライセンス・サイズの観点で最も現実的。既存の image-resizer・image-base64・traditional-color-palette との差別化は十分に可能。

---

## 1. 背景除去モデルの比較

### 主要候補

| モデル / ライブラリ                   | モデルサイズ                             | 精度傾向       | ライセンス | 商用可否             | transformers.js 対応                         |
| ------------------------------------- | ---------------------------------------- | -------------- | ---------- | -------------------- | -------------------------------------------- |
| **@imgly/background-removal** (ISNet) | ~40MB (quantized small) / ~80MB (medium) | 高（汎用）     | AGPL-3.0   | 要商用ライセンス契約 | 不要（独自 ONNX Runtime）                    |
| **RMBG-1.4** (BRIA AI)                | ~45MB (int8 quantized) / ~176MB (full)   | 高（汎用）     | CC 非商用  | 要商用ライセンス契約 | 対応 (v3)                                    |
| **RMBG-2.0** (BRIA AI)                | 非公開                                   | より高精度     | CC 非商用  | 要商用ライセンス契約 | **未対応（onnxruntime-web バグで使用不可）** |
| **MODNet**                            | 小（数十MB）                             | 人物特化・高速 | MIT        | 可                   | 対応                                         |
| **U2Net**                             | ~176MB / U2NetP: ~4.6MB / silueta: ~43MB | 中〜高         | Apache-2.0 | 可                   | 間接的（ONNX手動変換要）                     |
| **BiRefNet**                          | 大（数百MB〜）                           | 最高水準       | MIT        | 可                   | 実験的・ブラウザ用途で重すぎる               |
| **Segment Anything (SAM2)**           | 数百MB〜                                 | 汎用最高       | Apache-2.0 | 可                   | 対応（WebGPU推奨）                           |

### 推奨構成

**第一選択: transformers.js v3 + RMBG-1.4 (int8量子化, ~45MB)**

理由:

- int8量子化版は ~45MB でモデルロード後はオフライン動作
- WebGPU バックエンドで WebAssembly比 10〜15倍高速
- transformers.js はすでに devDependencies に `@huggingface/transformers` が存在するため実績あり
- ただし非商用 CC ライセンスのため、yolos.net が将来広告収益を得る場合は BRIA との商用契約または代替モデル切り替えが必要

**代替選択: @imgly/background-removal (AGPLv3)**

理由:

- npm パッケージ1つで完結、ONNX/WASM ファイルは IMG.LY CDN からデフォルト配信
- small モデル ~40MB、medium ~80MB
- AGPLv3 のため静的サイト（ソースコード非配布）での商用利用は許容範囲との解釈もあるが、厳密には要確認。無料で使える実装の手軽さが最大のメリット
- ONNX Runtime WebGPU による 20倍高速化が実証済み

**コスト最小・ライセンスクリーン: MODNet (MIT)**

- 人物写真に特化、MIT ライセンスで商用完全フリー
- transformers.js 対応、WebGPU 動作確認あり
- 汎用背景除去（商品写真等）には向かない

---

## 2. WebGPU バックエンドの実用性

### デスクトップブラウザ (2026年5月時点)

- Chrome, Edge, Firefox, Safari (macOS) いずれも WebGPU デフォルト有効
- グローバル普及率: 約70%以上

### iOS Safari

- **iOS 18 以前**: WebGPU 未対応
- **iOS 26 (Safari 26) beta**: WebGPU がデフォルト有効。正式リリースは2026年秋予定
- **現在の iOS 17〜25 ユーザー**: WebGPU 不可。WASM フォールバック必須

### パフォーマンス実測値（ONNX Runtime + RMBG-1.4 相当）

- WebGPU: 1000×1000 px を 0.5〜1秒以内（M1 Macで ~500ms）
- WASM (マルチスレッド): 5〜10秒程度
- WASM (シングルスレッド): WebGPU比 550倍遅い（実用不可）

### 結論

現状モバイル（iOS）ではWASM にフォールバックするため待ち時間が数秒〜十数秒かかる。「処理中...」のUX設計とともに、モデル初回ロード（~45MB ダウンロード）のプログレス表示は必須。

---

## 3. 単純画像編集の Canvas 実装

### Canvas API で実装可能な操作

| 操作                               | 実装方法                                                                  | 実用性                  |
| ---------------------------------- | ------------------------------------------------------------------------- | ----------------------- |
| 明るさ・コントラスト・彩度・ガンマ | `ctx.filter = "brightness(1.2) contrast(1.1)"` または ImageData pixel操作 | ◎ CSS filter 流用で簡単 |
| 色相回転                           | `ctx.filter = "hue-rotate(90deg)"`                                        | ◎                       |
| ぼかし                             | `ctx.filter = "blur(4px)"`                                                | ◎                       |
| シャープ                           | ImageData + 畳み込みカーネル（手実装）                                    | ○                       |
| トリミング                         | `ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh)`                        | ◎                       |
| 回転・反転                         | `ctx.transform` / `ctx.scale(-1, 1)`                                      | ◎                       |
| グレースケール・セピア             | `ctx.filter = "grayscale(1)"`                                             | ◎                       |
| ピクセレート                       | ImageData で一定ブロックごとに平均色を書き込む                            | ○                       |

### CSS filter の Canvas 流用パターン

`CanvasRenderingContext2D.filter` プロパティは CSS filter と同じ文字列を受け付ける。`drawImage` 前に `ctx.filter` をセットすることで GPU 処理を伴うフィルタを Canvas 書き出しに適用できる。

```js
ctx.filter = "brightness(1.3) contrast(1.2) saturate(0.8)";
ctx.drawImage(img, 0, 0);
```

ブラウザ互換性は良好（Chrome/Firefox/Edge/Safari 最新版すべて対応）。

### リアルタイムプレビュー

CSS の `filter` プロパティを `<img>` 要素に直接適用してリアルタイムプレビューし、「保存」時のみ Canvas に描画してエクスポートするパターンが最も軽量で推奨。

---

## 4. レイヤー合成のCanvas実装パターン

背景除去後に別画像に重ねる基本フロー:

1. 背景画像を Canvas に描画
2. `ctx.globalCompositeOperation = "source-over"` (デフォルト)
3. 背景除去済み PNG (透過あり) を Canvas に `drawImage` で重ねる
4. 位置・スケールのドラッグ調整は React state で管理し、再描画

利用可能なブレンドモード（`globalCompositeOperation`）: `multiply`, `screen`, `overlay`, `darken`, `lighten`, `color-dodge`, `color-burn`, `hard-light`, `soft-light`, `difference`, `exclusion` など Photoshop 相当のモードが全主要ブラウザで利用可能。

### ライブラリ検討

- **Konva.js**: レイヤー管理・ドラッグ対応の Canvas ライブラリ。実装コスト削減に有効だが ~100KB 増加
- **fabric.js**: より高機能だが重い (~350KB gzip)
- **生 Canvas**: 軽量だが位置操作・選択ハンドル等の実装コスト大
- **推奨**: シンプルな2画像合成であれば生 Canvas + React state で十分

---

## 5. その他ブラウザ実現可能なAI風機能

### 顔検出

- **face-api.js** (TensorFlow.js ベース): Tiny Face Detector モデル ~190KB。MIT
- **@vladmandic/face-api**: 2025年時点でアクティブメンテ。同系統
- 用途: 顔の位置を自動検出してフレームやスタンプを重ねる「フォトブース」機能
- **Human library**: vladmandic 製の後継。顔検出・感情・年齢・姿勢を統合

### 超解像 (AI アップスケール)

- **UpscalerJS** (MIT): TensorFlow.js ベース。ESRGAN-slim (~5MB) から ESRGAN-thick (最高品質) まで選択可
  - esrgan-slim: 小さく高速、ブラウザ向き
  - esrgan-thick: 高品質だが低速（Node.js GPU 環境推奨）
- **web-realesrgan** (github: xororz): Real-ESRGAN + Real-CUGAN を TensorFlow.js WebGPU で実行。fp16量子化で ~28MB
- 用途: 小さい画像・古い写真の高解像度化

### カラーパレット抽出（既存 traditional-color-palette との差別化）

- **Color Thief** (lokesh): MIT。任意画像からドミナントカラー・パレット抽出。Canvas ベース、追加モデル不要
- **dominate-color-js**: KMeans++ アルゴリズム
- yolos.net の `traditional-color-palette` は「日本の伝統色」名称辞書ツール。「アップロード画像のカラーパレット抽出」は別機能として差別化できる

### ピクセルアート・アスキーアート変換

- **aalib.js**: 画像→ASCII アート変換ライブラリ
- Canvas の `getImageData` + 文字マッピングで独自実装も容易
- 用途: 「画像をアスキーアートに変換」ツール

### グリッチ・ピクセレート等のクリエイティブフィルター

- 追加ライブラリ不要。Canvas の ImageData 操作のみで実装可能
- **glfx.js**: WebGL ベースの高速フィルター（vignette, tilt-shift, lens blur 等）。~100KB。ただし GitHub の最終コミットが古く、積極的なメンテナンスは停止している

### AI インペインティング（消しゴムマジック）

- **LaMa Cleaner**: ONNX Runtime Web でブラウザ動作の実装例あり
- モデルサイズが大きく（数十〜数百MB）、実装難易度も高い
- 2026年5月時点では yolos.net への組み込みは「将来検討」レベル

---

## 6. 画像出力・圧縮

### canvas.toBlob / canvas.toDataURL の品質設定

```js
canvas.toBlob(callback, "image/jpeg", 0.92); // JPEG, 品質 92%
canvas.toBlob(callback, "image/webp", 0.85); // WebP, 品質 85%
canvas.toBlob(callback, "image/png"); // PNG, 品質指定なし（ロスレス）
```

### メタデータ（EXIF）自動削除

Canvas に drawImage してから toBlob するだけで EXIF・GPS・IPTC 等のメタデータは自動除去される。ブラウザエンコーダーはピクセルデータのみを書き出すため。プライバシー保護の訴求ポイントになる。

### 形式比較

- JPEG: 透過不可。サイズ最小
- PNG: 透過保持。サイズ大
- WebP: 透過可。JPEG比20〜30%小さい。iOS Safari 14以降対応

---

## 7. iOS Safari の Canvas メモリ制限

| 制限                         | 値                                                 |
| ---------------------------- | -------------------------------------------------- |
| 単一 Canvas の最大ピクセル数 | 16,777,216 px（例: 4096×4096）                     |
| 累計 Canvas メモリ上限       | ~384MB（iOS 15以降）/ 古いバージョンはさらに少ない |
| 実用的な安全上限             | 2048×2048 程度（約4MP）                            |

### 回避戦略

- ユーザーが大きな画像をアップロードした場合、事前に縮小リサイズしてから Canvas に渡す（image-resizer で利用済みの実績があれば流用可）
- 処理後の Canvas は不要になったら即 `canvas.width = 0` でメモリ解放
- 複数 Canvas を同時に保持しない

---

## 8. Next.js App Router + 静的エクスポートでの実装方法

### Web Worker パターン（推奨）

transformers.js の推奨実装:

1. `src/workers/background-removal.ts` を Web Worker として作成
2. `'use client'` コンポーネントから `new Worker(new URL(...), {type: 'module'})` で起動
3. postMessage でモデル名・ImageData を渡し、処理済みマスクを受け取る
4. onnxruntime-node を SSR 側でロードしないよう `next.config.js` でexclude設定が必要

```js
// next.config.js
webpack: (config) => {
  config.resolve.alias["onnxruntime-node"] = false;
  return config;
};
```

### 動的ロード

モデルファイル (~45MB) は `pipeline()` 呼び出し時に初めてダウンロードされる。バンドルには含まれない。

---

## 9. 既存ツールとの差別化・ツールアイデアリスト

現在の画像関連ツール:

- `image-resizer`: 画像リサイズ（解像度変換）
- `image-base64`: 画像 ↔ Base64 変換
- `traditional-color-palette`: 日本の伝統色辞書

以下の各ツールは既存と完全に機能が異なる:

| #   | ツール名（案）               | コア機能                                             | 差別化ポイント                                                           | 実装難易度 | 依存ライブラリ                             |
| --- | ---------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------ | ---------- | ------------------------------------------ |
| 1   | **背景除去ツール**           | AI背景除去 + PNG出力                                 | 完全オフライン、EXIF削除、プライバシー強調                               | 中         | transformers.js + RMBG-1.4 (~45MB)         |
| 2   | **画像フィルター・色調整**   | 明るさ/コントラスト/彩度/色相/ぼかし/シャープ/セピア | リアルタイムプレビュー、JPEG/WebP書き出し                                | 低         | Canvas API のみ（追加依存なし）            |
| 3   | **画像合成ツール**           | 2枚重ね合わせ + ブレンドモード選択                   | 背景除去ツールとの連携動線                                               | 中         | Canvas API のみ                            |
| 4   | **カラーパレット抽出**       | 画像から主要色を抽出しコード表示                     | traditional-color-palette の「実在色辞書」と対比して「あなたの画像の色」 | 低         | Color Thief (~30KB)                        |
| 5   | **AI画像アップスケール**     | 2×/4× 超解像                                         | 画像resizer は解像度維持リサイズ。こちらはAI補間で実際の解像度向上       | 高         | UpscalerJS + esrgan-slim or web-realesrgan |
| 6   | **アスキーアート変換**       | 画像→文字アート変換                                  | エンタメ性が高くシェアされやすい                                         | 低         | aalib.js or 独自実装                       |
| 7   | **画像メタデータ削除ツール** | EXIF・GPS情報を完全削除してダウンロード              | プライバシー訴求。SNSへの投稿前確認ユースケース                          | 最低       | Canvas API のみ                            |
| 8   | **顔検出スタンプ**           | 顔を自動検出してスタンプ/フレームを重ねる            | インタラクティブ・エンタメ寄り                                           | 中         | face-api.js tiny (~190KB)                  |

---

## 10. 主要リスク

### 1. ライセンスリスク（最重要）

- **RMBG-1.4**: CC 非商用ライセンス。yolos.net が Google AdSense 等で収益化している場合、商用利用に該当する可能性が高い。BRIA AI との有償契約または MODNet（MIT）への切り替えが必要
- **@imgly/background-removal**: AGPL-3.0。静的サイト配信は「ソフトウェア配布」ではないと解釈される場合もあるが、グレーゾーン。IMG.LY への商用ライセンス問い合わせが安全

### 2. iOS パフォーマンスリスク

- iOS 25 以前（現在のiOSユーザーの大多数）では WebGPU 非対応。WASM フォールバックで 10〜30秒の処理時間
- Canvas メモリ上限（16MP）のため 4K画像のフルサイズ処理は不可
- 対策: アップロード時に 2048px 以内に自動リサイズ、処理中の明確な UI 表示

### 3. バンドル・初回ロードリスク

- モデルファイル (~45MB) の初回ダウンロードは別途通信が必要
- Next.js バンドル自体は増加しない（動的ロード）
- ただし transformers.js の JS コア (~数MB) はバンドルに含まれる場合がある。Web Worker 内での dynamic import を徹底することで main bundle への影響を最小化できる

### 4. RMBG-2.0 非対応

- RMBG-2.0 は onnxruntime-web のバグにより 2025年時点で in-browser 動作不可（GitHub issue #1107）
- RMBG-1.4 は安定稼働済みのため当面はこちらを使用し、2.0 対応を待つ

### 5. BiRefNet のブラウザ非実用性

- BiRefNet は精度が最高水準だが、標準モデルが数百MB を超えるため静的サイトのブラウザ配信には不向き。軽量変種が整備されるまで採用しない

---

## 11. 推奨実装順序

優先度順:

1. **画像フィルター・色調整ツール**: 追加依存ゼロ、実装最速、差別化明確
2. **カラーパレット抽出ツール**: Color Thief のみ追加、軽量
3. **画像メタデータ削除ツール**: Canvas API のみ、最も簡単
4. **背景除去ツール**: ライセンス確認後に実装。MODNet(MIT) を第一選択に変更すると安全
5. **画像合成ツール**: 背景除去ツールの完成後に連携として追加
6. **AI超解像**: TensorFlow.js 依存が増えるため最後
