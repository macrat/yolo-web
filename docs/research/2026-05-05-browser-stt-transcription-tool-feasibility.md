---
title: ブラウザ完結型文字起こしツール技術的実現可能性調査
date: 2026-05-05
purpose: yolos.netへの「会議録文字起こし（ツールA）」および「リアルタイムPTTメモ（ツールB）」実装の技術的実現可能性を判断し、バックログ追加の是非を判断する
method: |
  WebSearch（transformers.js v4, whisper ONNX model sizes, VAD library, speaker diarization, Web Speech API,
  WebGPU support, storage limits）、HuggingFace model card直接参照（onnx-community/whisper-tiny,
  whisper-base, moonshine-tiny-ja-ONNX）、Next.js公式ドキュメント（static export制約確認）
sources:
  - https://huggingface.co/blog/transformersjs-v4
  - https://huggingface.co/onnx-community/whisper-tiny/tree/main/onnx
  - https://huggingface.co/onnx-community/whisper-base/tree/main/onnx
  - https://huggingface.co/onnx-community/moonshine-tiny-ja-ONNX/tree/main/onnx
  - https://huggingface.co/kotoba-tech/kotoba-whisper-v2.0
  - https://github.com/ricky0123/vad
  - https://github.com/moonshine-ai/moonshine-js
  - https://github.com/k2-fsa/sherpa-onnx
  - https://nextjs.org/docs/app/guides/static-exports
  - https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
  - https://arxiv.org/abs/2509.02523
---

# ブラウザ完結型文字起こしツール技術的実現可能性調査

## 前提条件の確認

調査時点（2026-05-05）のプロジェクト環境:

- Next.js 16.2.4、App Router
- `@huggingface/transformers` v4.2.0 が devDependencies に存在（runtime bundle 非含有方針）
- `next.config.ts` に `output: 'export'` の設定は**ない**（通常の Next.js サーバーモード）
- ただし Vercel 等でのデプロイを前提とする場合、COOP/COEP ヘッダーは `vercel.json` で設定可能

---

## 1. ブラウザで動く Whisper の選択肢

### 1.1 transformers.js（@huggingface/transformers）経由の ONNX モデル

**現状（2026年5月時点）**: transformers.js は 2026年2月にv4.0.0がリリース済み。WebGPU Runtime を C++ で完全再実装し、ブラウザ向け bundle が最大 53% 削減。Whisper・Moonshine 系モデルは v3.x 時点から対応済みで、v4 でも継続サポート。

#### whisper-tiny（多言語、日本語対応）

- パラメータ数: 39M
- ONNX ファイルサイズ（onnx-community/whisper-tiny より実測）:
  - encoder + decoder（int8/quantized）: encoder 10.1 MB + decoder 30.5 MB = **合計約 41 MB**
  - encoder + decoder（q4）: encoder 9.0 MB + decoder 86.6 MB = **合計約 96 MB**（q4 はデコーダが膨らむ）
  - **推奨構成**: encoder_model_int8 + decoder_model_merged_int8 = **約 41 MB**
- 日本語精度: 実用可能だが CER（文字誤り率）は whisper-large-v3 比で高い。短文・明瞭音声では許容範囲
- レイテンシ（WASM、CPU）: 10秒音声で約 5〜15 秒（デバイス依存）
- レイテンシ（WebGPU）: 約 2〜5 秒

#### whisper-base（多言語、日本語対応）

- パラメータ数: 74M
- ONNX ファイルサイズ（onnx-community/whisper-base より実測）:
  - encoder + decoder（int8/quantized）: encoder 23.2 MB + decoder 53.3 MB = **合計約 77 MB**
- 日本語精度: whisper-tiny より有意に高い。会議録レベルの実用には base 以上を推奨
- レイテンシ: tiny の約 2〜3 倍

#### whisper-large-v3（多言語、日本語最高精度）

- ブラウザ用途としてはモデルが大きすぎ（encoder 300 MB+）、モバイルでは非現実的

#### Distil-Whisper

- **英語のみ**。日本語不可。kotoba-whisper（後述）が日本語特化の代替。

### 1.2 Moonshine Web（英語特化、リアルタイム向け）

- ベースモデル: Moonshine Tiny（27M パラメータ）、Moonshine Base（61M パラメータ）
- **英語のみ**。日本語は非対応（デフォルトモデル）
- ONNX ファイルサイズ（onnx-community/moonshine-tiny-ONNX）: 約 50 MB（q4 量子化）
- 特徴: Whisper tiny-en と同等 WER で、5倍高速（10秒音声で Whisper の 1/5 の計算量）
- WebGPU / WASM fallback 対応
- transformers.js v3.2 から公式サポート

#### moonshine-tiny-ja（日本語特化 Moonshine）

- 「Flavors of Moonshine」論文（2025年9月）で発表された日本語モノリンガルモデル
- 27M パラメータ、Whisper tiny より 48% 低い誤り率、Whisper Small（9倍大）に匹敵
- ONNX: `onnx-community/moonshine-tiny-ja-ONNX` として公開済み（2026年2月時点）
- ONNX ファイルサイズ（実測）: encoder_int8 8 MB + decoder_int8 20 MB = **合計約 28 MB**
- transformers.js でのサポート: v3.2 で Moonshine が追加されており、ja 変種も同じアーキテクチャなので使用可能
- **ただし beta**: moonshine-js は「breaking changes が起きることがある」と明記

### 1.3 kotoba-whisper（日本語特化 Distil-Whisper 系）

- distil-large-v3 アーキテクチャ（decoder を 32 層→2 層に削減）
- Whisper large-v3 の 6.3 倍高速、同等の日本語精度
- **問題**: ブラウザ向け ONNX が現時点で公式提供されていない。HuggingFace Hub に onnx-community 変換版が存在するか要確認。モデルサイズが large-v3 ベースのため 200〜400 MB 以上が見込まれ、ブラウザ用途には重い

### 1.4 whisper.cpp WASM

- ggml フォーマットのモデルをブラウザで直接実行
- whisper-tiny（Q5_1 量子化）: 約 31 MB、base（Q5_1）: 約 57 MB
- WASM SIMD 必須。Safari iOS での SIMD 対応は比較的新しい（iOS 16.4 以降で有効）
- 速度: tiny/base で約 x2〜x3 リアルタイム（60秒音声を 20〜30 秒で処理）
- デメリット: npm パッケージとして整備されておらず、Next.js への統合難易度が高い。WASM バイナリのバンドル問題（COOP/COEP ヘッダー不要な場合もあり）

### モデル選択まとめ

| モデル                    | DL サイズ（推奨量子化） | 日本語対応 | PTT 向き | 長尺向き | 難易度     |
| ------------------------- | ----------------------- | ---------- | -------- | -------- | ---------- |
| whisper-tiny（int8）      | 約 41 MB                | ○          | △        | ○        | 低         |
| whisper-base（int8）      | 約 77 MB                | ◎          | △        | ◎        | 低         |
| moonshine-tiny-ja（int8） | 約 28 MB                | ◎          | ◎        | △        | 中（beta） |
| kotoba-whisper            | 200 MB+                 | ◎◎         | ✕        | ◎◎       | 高         |
| whisper.cpp WASM          | 31〜57 MB               | ○          | △        | ○        | 高         |

---

## 2. リアルタイム短文発話 vs 長尺音声の使い分け

### Whisper の根本的制約

Whisper は **30 秒チャンク固定**のアーキテクチャ。5 秒の音声でも 30 秒分にゼロパディングして処理するため:

1. 推論コストが一定（短くても遅い）
2. チャンク境界でコンテキストが切れ、単語が抜ける

### PTT（ツールB）への推奨構成

- **moonshine-tiny-ja**: 可変長入力を受け付ける設計で、短い発話（1〜10 秒）に最適化されている。Whisper の 5 倍高速。WebGPU 対応デバイスなら 1〜2 秒レイテンシも可能
- **whisper-tiny + VAD チャンク化**: PTT なので VAD 不要だが、ボタン離し後に音声を 30 秒までに切り、推論。モデルが小さいため比較的速い

### 長尺会議録（ツールA）への推奨構成

- **whisper-base（int8）**: 精度と速度のバランスが最良。日本語会議録に十分な精度
- VAD（@ricky0123/vad-web）で無音区間を除去し、チャンク境界を最適化してから渡す
- 処理は Web Worker 内で非同期実行し、UI はプログレス表示

---

## 3. ブラウザ VAD ライブラリ

### @ricky0123/vad-web（推奨）

- 最新版: 0.0.30（2026年1月時点）
- ベース: Silero VAD v5（ONNX Runtime Web 経由）
- モデルファイル: silero_vad_v5.onnx = **2.33 MB**
- デフォルト CDN 配信あり（onnxruntime-web の wasm ファイルも含む）
- **Next.js との統合で既知の問題あり**: Worklet ファイルのパスが正しく解決されない。`copy-webpack-plugin` で vad.worklet.bundle.min.js と onnxruntime WASM ファイルを `/public/` に配置する回避策が必要
- バンドルサイズ: JS 部分は数十 kB 程度。ONNX モデルと WASM は CDN 経由なら 0
- SharedArrayBuffer: onnxruntime-web が内部で使用する場合があるが、Silero VAD は single-thread モードで動作可能

### Silero VAD（sherpa-onnx 経由）

- sherpa-onnx 自体は npm パッケージあり、WASM サポートあり
- speaker diarization との統合が容易（後述）
- ただしバンドルが大きく（sherpa-onnx は多機能すぎる）、VAD 単体用途には過剰

---

## 4. 話者識別（Speaker Diarization）の現実性

### 結論：**ツールAへの話者識別は実装すべきでない（現時点）**

理由:

#### pyannote は Web 化困難

pyannote.audio はもともと PyTorch 依存のため、ブラウザ実行は実質不可能。ONNX 変換の試みはあるが（pyannote-onnx-extended）、production ready ではない。

#### sherpa-onnx によるブラウザ話者識別は技術的に可能だが重い

sherpa-onnx は WebAssembly 対応があり、JavaScript API でスピーカーダイアリゼーションが可能。しかしモデルファイルが複数（スピーカーセグメンテーション + 埋め込み）で合計 100 MB 以上になる。モバイルサポートが不確か。

#### Picovoice Falcon SDK（外部 API 必須）

完全オフライン・ブラウザ実行は製品ライセンスが必要で無料枠が限定的。外部 API 制約に抵触する可能性あり。

#### 簡易代替案（実装コスト低）

- **「話者識別なし」として実装し、将来拡張余地を残す**
- 発話境界（VAD によるセグメント）で改行する程度で会議録としての実用性は十分
- WebGPU が普及した段階でスピーカー埋め込みモデル（ECAPA-TDNN ONNX）を追加できる設計にしておく

---

## 5. Web Speech API の現状

### ブラウザサポート（2026年5月時点）

- **Chrome（デスクトップ）**: 対応。日本語も動作
- **Chrome on iOS**: **非対応**（iOS の制約）
- **Safari on iOS**: `webkitSpeechRecognition` 経由で一応対応するが、Apple サーバーにデータ送信が必要。オフライン不可
- **Firefox**: 未対応（フラグ実験的機能のみ）
- **Mobile Chrome (Android)**: 対応

### 根本問題

- **オフライン不可**: Chrome も Google サーバー、Safari も Apple サーバーにデータを送信
- **プライバシー懸念**: 音声データが外部送信される。yolos.net の「ブラウザ完結」要件を満たさない
- **iOS Chrome 非対応**: モバイル Safari 優先のユーザーに対応できない

### 結論

Web Speech API は「外部 API 不使用」の要件を満たさないため、**採用不可**。ただしフォールバックとして「精度は落ちるがオンラインなら速い」オプションとして提示することは技術的には可能。

---

## 6. WebGPU / WASM SIMD による高速化の現状（2026年5月）

### WebGPU サポート状況

- **Chrome（デスクトップ）**: v113 以降で有効（2023年5月〜）
- **Chrome Android**: v121 以降、Android 12+、Qualcomm/ARM GPU のみ対応
- **Safari macOS**: Tahoe 26（2025年秋）以降で有効
- **Safari iOS**: iOS 26 以降で有効。**iOS 26 未満（大多数ユーザー）は WebGPU 非対応**
- **Firefox Windows**: v141 以降で有効（2025年後半）。Android は 2026 年中に対応予定

### モバイル Safari の現実

2026 年 5 月時点では iOS 26 の普及率は低い。モバイル Safari ユーザーの大部分は WebGPU 非対応のため、**WASM フォールバックが必須**。

### WASM SIMD

- Chrome / Firefox: SIMD 対応済み
- Safari iOS: iOS 16.4 以降で WASM SIMD 有効（iOS 16.4 は 2023年3月リリース、普及率高い）
- transformers.js は WebGPU 優先、WASM SIMD fallback を自動選択

### 実用的なパフォーマンス（WASM SIMD のみ、M1 Mac 相当）

- whisper-tiny: 10秒音声 → 約 5〜8 秒
- whisper-base: 10秒音声 → 約 10〜20 秒
- moonshine-tiny-ja: 10秒音声 → 約 1〜3 秒（Whisper の 5 倍高速）

---

## 7. localStorage / IndexedDB 設計の注意点

### localStorage の制約

- 容量: **5 MB（ほぼ全ブラウザ共通）**。10 MB という情報もあるが実際は 5〜10 MB でブラウザ依存
- 同期 API のため大量データアクセス時に UI スレッドがブロック
- JSON シリアライズ必須

### IndexedDB の特性

- 容量: ディスクの 50% まで使用可能（数百 MB〜GB 規模）
- 非同期 API（プロミス対応）
- バイナリデータ（Blob/ArrayBuffer）を直接保存可能
- モデルキャッシュも自動的に IndexedDB 使用（transformers.js のキャッシュシステム）

### 推奨設計（ツールB: PTT メモ）

```
IndexedDB（メインストレージ）
  "transcription_notes" ストア:
    id: UUID
    timestamp: ISO8601
    text: string
    duration_ms: number
    model: string（使用モデル名）
    createdAt: number（Unix ms）

localStorage（軽量な設定のみ）
  "stt_settings": JSON
    { model: "moonshine-tiny-ja", language: "ja" }
```

- **localStorage に文字起こし結果を直接保存するのは避ける**: 1件 500 文字 × 200 件 = 100 KB は問題ないが、長文が蓄積すると 5 MB 超えのリスクがある
- **IndexedDB + idb ライブラリ**（1 KB gzip）で実装するのが安全
- `navigator.storage.estimate()` で残容量チェックし、満杯時は古い記録から削除する UI を設ける

---

## 8. COOP/COEP ヘッダー問題（最大のリスク）

### 問題の本質

onnxruntime-web のマルチスレッド WASM（Shared Array Buffer 使用）には COOP/COEP ヘッダーが必要。

### yolos.net の構成への影響

- `next.config.ts` に `output: 'export'` は設定されていない（通常サーバーモード）
- 通常の Next.js サーバーモード（Vercel）では `next.config.ts` の `headers()` 関数でCOOP/COEP を設定可能
- **静的 export を使っていないため、この問題は比較的対処しやすい**
- Vercel では `vercel.json` の `headers` セクションで設定可能

### シングルスレッド WASM フォールバック

onnxruntime-web はシングルスレッドモードでも動作する。COOP/COEP なしで使用する場合:

- `env.backends.onnx.wasm.numThreads = 1` を設定
- 速度は 2〜4 倍遅くなるが、モバイルでも動作する
- transformers.js v4 は COOP/COEP なしでも動作するよう設計されている（WebGPU では不要、WASM シングルスレッドでも不要）

### coi-serviceworker（静的ホスト用の代替手段）

仮に静的ホストに移行した場合も、サービスワーカーで COOP/COEP ヘッダーを注入するライブラリが存在する（gzuidhof/coi-serviceworker）。ただし COEP が有効になると外部リソースの読み込みに制限がかかるため副作用に注意。

---

## 9. ツールA・ツールB 実装評価

### ツールA: 会議録の文字起こし

**実装可能か**: YES（実用的なレベルで可能）

**推奨技術構成**:

- STT: `@huggingface/transformers` v4 + `onnx-community/whisper-base`（int8量子化）
- VAD: `@ricky0123/vad-web`（Silero VAD v5）
- Worker: Web Worker 内で推論、UI スレッド非ブロック
- モデルキャッシュ: transformers.js の組み込み IndexedDB キャッシュ

**バンドルサイズ目安（JS のみ）**:

- transformers.js v4 web bundle: 約 300 KB（53% 削減後）
- @ricky0123/vad-web（JS のみ）: 約 50〜100 KB
- 合計 JS 追加分: 約 400〜500 KB

**モデルダウンロードサイズ（初回のみ）**:

- whisper-base encoder_int8 + decoder_merged_int8: 約 77 MB
- Silero VAD v5 ONNX: 約 2.3 MB
- 合計: 約 79 MB

**実装難易度**: 中

- transformers.js の pipeline API でほぼ完結
- @ricky0123/vad-web の Next.js 統合で Webpack 設定が必要（worklet ファイルのコピー）
- Web Worker + メッセージパッシングの実装
- 長尺音声の進捗表示 UI

**話者識別**: 実装しない。将来の拡張余地として設計に「speaker_id」フィールドを残す程度に留める。

### ツールB: リアルタイム PTT メモ

**実装可能か**: YES（日本語に強いモデルで実用レベル）

**推奨技術構成**:

- STT: `@huggingface/transformers` v4 + `onnx-community/moonshine-tiny-ja-ONNX`（int8量子化）
- VAD: 不要（PTT なのでボタン離しで録音終了）
- 録音: `MediaRecorder` API または `AudioWorklet`
- ストレージ: IndexedDB（idb ライブラリ経由）

**バンドルサイズ目安（JS のみ）**:

- transformers.js v4 web bundle: 約 300 KB
- idb: 約 1 KB（gzip）
- 合計追加分: 約 300 KB

**モデルダウンロードサイズ（初回のみ）**:

- moonshine-tiny-ja encoder_int8 + decoder_int8: 約 28 MB
- （ツールA と共用する場合は追加ダウンロード不要）

**実装難易度**: 低〜中

- VAD が不要な分、ツールA より簡単
- moonshine-tiny-ja が beta で breaking change リスクあり
- whisper-tiny を代替として使用することも可能（28 MB → 41 MB、速度は moonshine の約 5 倍遅い）

**localStorage vs IndexedDB**: IndexedDB に保存。localStorage は設定値のみ。

---

## 10. 落とし穴とリスク

### 最大リスク: モバイル Safari でのパフォーマンス

- iOS 26 未満（2026年5月時点では大多数）は WebGPU 非対応
- WASM シングルスレッドのみ → whisper-base で 10 秒音声に 20〜40 秒かかる可能性
- moonshine-tiny-ja なら WASM でも 3〜5 秒程度で実用的
- **対策**: モデルサイズを small（tiny または moonshine-tiny-ja）に設定し、重いモデルはオプション選択にする

### @ricky0123/vad-web の Next.js 統合

- Worklet ファイル（vad.worklet.bundle.min.js）と onnxruntime WASM ファイルを `/public/` にコピーする webpack 設定が必要
- onnxruntime-web の Worker 関連で「no available backend found」エラーが発生する事例あり
- **対策**: `copy-webpack-plugin` を next.config.ts に追加、または CDN URL を明示指定

### moonshine-tiny-ja の安定性

- moonshine-js は beta 品質でブレイキングチェンジの宣言あり
- 代替として whisper-tiny（同等サイズ、安定）を常に用意しておく

### モデルの初回ダウンロード

- whisper-base: 77 MB、moonshine-tiny-ja: 28 MB → ユーザーへの事前告知 UI が必須
- Hugging Face CDN（hf.co）からのダウンロードが遅い地域では体験が悪化
- **対策**: 段階的ローディング表示、キャッシュ済みなら「キャッシュ使用」表示

### 長尺音声の Whisper 精度低下

- 30 秒を超える音声はチャンク分割必要。チャンク境界で単語が抜ける場合がある
- overlapping window（前チャンクの末尾を次チャンクの先頭に重複させる）で軽減可能
- `return_timestamps: true` オプションで word-level タイムスタンプが取得可能（transformers.js 対応済み）

### COOP/COEP ヘッダーとサードパーティスクリプト

- `Cross-Origin-Embedder-Policy: require-corp` を設定すると Google Analytics 等の外部スクリプトが CORP ヘッダーなしではロードできなくなる
- `credentialless` 値を使うと緩和できるが Safari 非対応
- **対策**: onnxruntime-web をシングルスレッドモードで動かし COEP 不要にする（速度低下と引き換え）

---

## 11. 最終判断

### ツールA（会議録文字起こし）

- **バックログ追加: 推奨**
- 日本語会議録という明確なユースケースがあり、外部 API 不要・プライバシー保護という差別化要素がある
- 話者識別は現状不要（実装しない）
- モバイル Safari では重い可能性をユーザーに明示する UI が必要

### ツールB（PTT リアルタイムメモ）

- **バックログ追加: 推奨（ツールA より優先度高）**
- moonshine-tiny-ja の 28 MB は許容範囲で、日本語精度も十分
- 実装難易度が低く、ユニークなユーティリティツールとして差別化できる
- whisper-tiny をフォールバックとして持つことで moonshine-js の beta リスクを軽減

### 話者識別

- **現時点では実装しない**
- browser-native の実用的解法が存在しない
- sherpa-onnx WASM は技術的に可能だがモデルが重く、Next.js 統合も複雑
- 将来 WebGPU 普及後に再検討

### 実装順序（推奨）

1. ツールB（PTT メモ）: 小さいモデル、シンプルな実装、VAD 不要
2. ツールA（会議録）: ツールB の基盤（transformers.js 統合）を再利用、VAD 追加
