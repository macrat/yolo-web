---
title: ブラウザ完結型日本語TTSツールの実現可能性調査
date: 2026-05-05
purpose: yolos.netに「テキスト読み上げ + mp3ダウンロード」機能を実装する際の技術選定と実現可能性の判断
method: Web Speech API仕様調査、Kokoro/transformers.js/Piper各ライブラリの調査、GitHubイシュー調査、MDNドキュメント調査
sources:
  - https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
  - https://github.com/WICG/speech-api/issues/69
  - https://github.com/guest271314/SpeechSynthesisRecorder
  - https://huggingface.co/docs/transformers.js/api/utils/audio
  - https://www.npmjs.com/package/kokoro-js
  - https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
  - https://huggingface.co/posts/Xenova/503648859052804
  - https://github.com/hexgrad/kokoro/issues/213
  - https://github.com/vercel/next.js/issues/75604
  - https://github.com/hexgrad/kokoro/issues/41
  - https://readium.org/speech/docs/WebSpeech.html
  - https://github.com/zhuker/lamejs
  - https://huggingface.co/docs/transformers.js/en/tutorials/next
---

# ブラウザ完結型日本語TTSツールの実現可能性調査

## 1. Web Speech API (SpeechSynthesis) の現状

### 機能と限界

Web Speech APIのSpeechSynthesisインターフェースはすべてのモダンブラウザに実装されており、日本語音声（ja-JP）も多くの環境で提供されている。しかし実装には以下の重大な問題がある。

**mp3/wavダウンロードは原則不可能**

SpeechSynthesisの音声出力はOSのTTSエンジンに直接送られ、Web Audio APIのグラフに接続する手段が存在しない。W3Cへの機能リクエスト（WICG/speech-api issue #69）では「SpeechSynthesisをMediaStreamTrackに出力できるようにしてほしい」という要望が2019年から議論中だが、2026年5月時点でいずれのブラウザも実装していない。

唯一のワークアラウンドは `navigator.mediaDevices.getUserMedia()` でシステム音声ループバック（「Monitor of Built-in Audio」デバイス）をキャプチャしてMediaRecorderで録音する方法（SpeechSynthesisRecorderプロジェクト）だが、これはユーザーのマイク許可要求を必要とし、OSレベルの設定（ループバックデバイスの有効化）が必要で、一般ユーザーには事実上使えない。

**クロスブラウザ/クロスOS信頼性の問題**

- Chrome Desktop: 14秒以上の読み上げでバグが発生、boundary eventが動作しない
- Edge Android: 音声リスト自体を返さず使用不可
- Safari: 高品質音声バリアントをインストールするとその言語音声が消える既知バグ
- Chrome Android: フィルタされていない言語リストを返す（音声名でなく言語コードのみ）
- iOS: getVoices()は多くを返すがロケールあたり1音声しか選べない

日本語音声はiOS/macOS（Kyokoなど）とWindows（Haruka）では利用可能だが、品質はOSと音声パッケージに完全依存する。

**結論: Web Speech APIは「再生のみ」に割り切れば軽量で即日実装可能。ダウンロード機能は実質不可能。**

---

## 2. ブラウザ完結型TTSモデルの選択肢（2026年5月時点）

### 2-1. kokoro-js（推奨候補）

| 項目         | 詳細                                   |
| ------------ | -------------------------------------- |
| ライブラリ   | `kokoro-js` (npm)                      |
| モデル       | `onnx-community/Kokoro-82M-v1.0-ONNX`  |
| パラメータ数 | 82M                                    |
| ランタイム   | WebGPU（優先）+ WASM（フォールバック） |
| ライセンス   | Apache 2.0                             |

**モデルサイズ（量子化オプション）:**

| ファイル             | サイズ  | 形式               |
| -------------------- | ------- | ------------------ |
| model.onnx           | 326 MB  | fp32（フル精度）   |
| model_fp16.onnx      | 163 MB  | fp16               |
| model_quantized.onnx | 92.4 MB | int8               |
| model_q8f16.onnx     | 86 MB   | 混合精度（最軽量） |

初回ロード時にCDN（Hugging Face）からダウンロードし、ブラウザキャッシュに保存されるため2回目以降はオフライン動作。

**日本語サポート状況（重要な注意点）:**

Kokoro-82M v1.0はv0.x系から多言語対応を強化し、日本語（言語コード `j`、音声プレフィックス `jf_`/`jm_`）を含む54ボイスを提供している。`jf_alpha`、`jf_sakura` などの日本語女性ボイスが存在する。

しかし**2025年5月にオープンされたGitHub Issue #213**（hexgrad/kokoro）では、「ひらがなの日本語テキストを入力すると、音声合成の代わりに"Japanese letter, Japanese letter..."と読み上げてしまう」という不具合が報告されており、2026年5月時点でクローズされていない。

根本原因は音素変換（G2P: Grapheme-to-Phoneme）にある。PythonライブラリではJAG2Pという日本語専用プロセッサが使われるが、**ブラウザのkokoro-jsでその日本語G2P処理が完全に機能するかどうかが未確認**。

**Next.js統合の問題:**

GitHub Issue #41（hexgrad/kokoro）および vercel/next.js Issue #75604 によると、kokoro-jsをNext.jsで使用しようとすると「Module not found: Can't resolve './'」エラーが発生する。Viteでは問題なく動作するが、Next.jsのwebpack設定との相性問題がある。

対処策として以下のwebpack設定が必要：

- `serverExternalPackages` にkokoro-jsを追加
- `config.resolve.alias` でonnxruntime-nodeをfalseに設定
- `experiments.asyncWebAssembly: true` を有効化
- 非サーバービルドで `output.globalObject: "self"` を設定

これらを適切に設定しても、WASMアセットのハンドリングが不完全で解決しないケースが報告されている。

**推論速度:**

- WebGPU: リアルタイムの約3倍速
- WASM: リアルタイムより大幅に遅い（モバイルでは体感的に遅延が目立つ可能性）

---

### 2-2. transformers.js（@huggingface/transformers）経由のTTSモデル

**Xenova/speecht5_tts:**

- 英語専用。日本語は非対応（ただしesnya/japanese_speecht5_ttsという派生モデルが存在）
- speaker_embeddingsが必要で使い方がやや複雑

**Xenova/mms-tts-jpn（Facebook MMS）:**

- 1000言語以上対応のMassively Multilingual Speech TTSの日本語特化モデル
- モデルサイズ: 英語版は211MB、日本語版は類似サイズと推定
- VITS（Variational Inference with adversarial learning）アーキテクチャ
- 音質はkokoro-jsより劣ると評価されることが多い
- ブラウザ実装例が少なく、実績が薄い

**audio出力の取り扱い（transformers.js）:**

transformers.jsのRawAudioオブジェクトには以下のメソッドが内部実装されている：

- `.data` → Float32Array（生音声データ）
- `.toBlob()` → WAV形式のBlobを返す
- `.save(path)` → ブラウザではダウンロード、Node.jsではファイル保存

つまりtransformers.js経由でTTSを実行すれば、**WAV形式でのダウンロードはネイティブサポートされている**。内部的に `encodeWAV(chunks, rate)` 関数でWAVエンコードが行われる。

---

### 2-3. Piper TTS WASM

- `@mintplex-labs/piper-tts-web` / `piper-wasm` などの実装あり
- モデルサイズ: 約75MB
- リアルタイムの3〜5倍速でCPU推論
- 日本語対応モデルは限定的（piper-plusで日本語対応版あり）
- 元のrhasspy/piperリポジトリは2025年10月にアーカイブ化（読み取り専用）
- コミュニティforkが継続中だが長期サポートに不安

---

## 3. mp3エンコード方法とWAV代替案

### lamejs によるmp3エンコード

- `lamejs` ライブラリがブラウザでのmp3エンコードをサポート
- Float32Arrayから変換時は一旦Int16Arrayへの変換が必要
- 1152サンプル単位でチャンク処理
- 20倍リアルタイム速度でエンコード可能（132秒音声を6.5秒でエンコード）
- バンドルサイズ: 約200KB（minified）

**実装パターン:**

```
TTS出力(Float32Array) → Int16Arrayに変換 → Mp3Encoder.encodeBuffer()でチャンク処理 → flush() → Blob生成 → URL.createObjectURL() → ダウンロードリンク
```

### WAV代替案のUX評価

WAV（非圧縮PCM）はmp3より5〜10倍ファイルサイズが大きいが：

- 1分の音声: WAVで約10MB、mp3（128kbps）で約1MB
- ブラウザからのダウンロードとしてはいずれも問題ない範囲
- transformers.jsが既にWAVエンコードを内部実装しているため、**WAVダウンロードが最もシンプルな実装**

結論：mp3ダウンロードが「理想」ならlamejs追加が必要だが、**WAVダウンロードで開始し、ユーザー要望に応じてmp3対応を追加**するアプローチが現実的。

---

## 4. ストリーミング再生とダウンロード用ファイル生成の両立設計

kokoro-jsはストリーミングAPIを提供している：

```javascript
const stream = tts.stream(text);
for await (const { text, phonemes, audio } of stream) {
  // audio: 各チャンクのRawAudio
  // ここでAudioContextに流しながら再生
  // 同時にチャンクを配列に蓄積
}
// 全チャンク蓄積後にWAVエンコードしてダウンロード用Blobを生成
```

**設計案（両立パターン）:**

1. Web Workerでバックグラウンド処理（モデルロード・推論をメインスレッドから分離）
2. ストリーミングでチャンクを生成しながらAudioContextで再生（ユーザーへのレスポンス最速化）
3. 生成完了後に全チャンクを結合してBlob化→ダウンロードボタンを活性化
4. 長文は510トークン（Kokoro上限）単位で分割処理

---

## 5. SSML対応と速度・ピッチ調整

**Web Speech API版:**

- rate（0.1〜10）、pitch（0〜2）、volume調整がAPIレベルでサポート
- SSMLは一部ブラウザで部分的にサポートされるが標準化されていない

**TTSモデル版（kokoro-js）:**

- 速度調整: `speed`パラメータあり
- ピッチ調整: 直接パラメータなし（音声スタイルはvoiceの選択で制御）
- SSML: 非対応

---

## 6. 実装上の落とし穴

### モデルロード時間と初回体験

- kokoro-jsの86〜163MB（量子化版）を初回にダウンロードする必要がある
- ブロードバンド環境でも10〜30秒かかる可能性
- プログレスバーと「初回のみダウンロードが必要」の説明が必須
- ブラウザキャッシュに保存されるため2回目以降は即座に起動

### 長文の分割処理

- Kokoro-82Mは510トークン制限あり
- 日本語の510トークンは概ね200〜400文字程度
- 句読点・文境界での自動分割処理が必要
- 分割チャンクの結合時に無音部分の調整も必要

### メモリ使用量

- WASMモード: fp32で約650MB（Wasm heap含む）、量子化版で200〜400MB
- モバイル端末（特にiOS 15以前）はWasmヒープ上限が2GBのため問題になりにくいが、低スペック端末でのクラッシュリスクあり
- WebGPUモードはGPUメモリを使用するため影響が少ない

### モバイル対応の課題

- WebGPUはChrome 120+、Edge 120+、Safari 17+で利用可能だが、低スペックAndroidではGPUアダプター取得失敗あり
- WASMフォールバックは動作するが推論速度が遅い（短文で2〜5秒程度）
- iOSのSafariはWebGPU 17+から対応だが制限あり

---

## 7. 日本語特有の問題

### 漢字読み・アクセント

kokoro-jsのJavaScript実装における日本語G2P（文字→音素変換）の信頼性が最大の不確実要素である。

- PythonのKokoro実装では `misaki[ja]` + JAG2Pプロセッサで漢字読みを処理
- ブラウザのkokoro-jsでは同等の日本語G2Pがポートされているか不明
- GitHub Issue #213（ひらがなテキストが"Japanese letter"と読まれる問題）が未解決

### 前処理（テキスト正規化）の必要性

数字・記号・略語の読み上げ問題は日本語TTSで共通の課題：

- 「100円」→「ひゃくえん」（正解） vs「ひゃくまるまるえん」（失敗）
- 英単語の混在（「AIツール」の「AI」の読み）
- kuromoji.jsによるモルフォロジー解析 + 前処理レイヤーの追加が品質向上に有効

ただしkuromoji.jsはJavaでのオリジナル実装のJS移植で、辞書データが別途15〜30MB必要。

---

## 8. 実現可能性評価とアーキテクチャ推奨案

### Web Speech API版（軽量・品質OS依存・ダウンロード不可）

| 項目                 | 評価                                                        |
| -------------------- | ----------------------------------------------------------- |
| 実装コスト           | 低（数日）                                                  |
| バンドルサイズ追加   | ほぼゼロ                                                    |
| 日本語品質           | OS依存（iOS: 良、Android: 普通、Chrome on Android: 不安定） |
| mp3ダウンロード      | 実質不可能                                                  |
| モバイル対応         | 基本的に可                                                  |
| クロスブラウザ信頼性 | 低〜中（バグ多数）                                          |

「読み上げ再生のみ」という要件なら十分。ダウンロード要件があるなら使えない。

### TTSモデル版（重い・品質均一・ダウンロード可）

| 項目               | 評価                                    |
| ------------------ | --------------------------------------- |
| 実装コスト         | 高（1〜2週間）                          |
| バンドルサイズ追加 | 軽微（モデルはCDNから動的ロード）       |
| 初回ロード         | 86〜326MB（量子化選択による）           |
| 日本語品質         | 良〜普通（G2P問題次第）                 |
| WAVダウンロード    | 可（transformers.js標準機能）           |
| mp3ダウンロード    | lamejs追加で可                          |
| モバイル対応       | WebGPUなければ遅い                      |
| Next.js統合難易度  | 中〜高（webpack設定要、既知のバグあり） |

### 推奨アーキテクチャ（両立案）

**フェーズ1（リリース版）: Web Speech API + kokoro-jsの選択式**

```
[ユーザー操作]
  ↓
[音声エンジン選択]
  ├─ Web Speech API（高速、OS音声、ダウンロード不可）→ 即時再生
  └─ AIモデル（初回ロード数十秒、高品質、WAVダウンロード可）→ Web Workerで非同期処理
```

**推奨ライブラリ構成:**

- 再生のみ: Web Speech API（追加ライブラリなし）
- モデルTTS: `kokoro-js` (kokoro-jsがNext.js問題を解消した後) または `@huggingface/transformers` + `Xenova/mms-tts-jpn`
- WAVダウンロード: transformers.js内蔵の `RawAudio.toBlob()` / `RawAudio.save()`
- mp3ダウンロード（オプション）: `lamejs`

**最小実装（現時点で最も現実的）:**

`Xenova/mms-tts-jpn` をtransformers.js v3経由で使用する案が、Next.jsとの統合実績・音声出力のBlob化の両面で最も安定している。モデルサイズは約200MB（初回ダウンロード）、WAVダウンロードはtransformers.js標準機能で対応。

---

## 9. 主要リスク

| リスク                                       | 深刻度 | 回避策                                                                     |
| -------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| kokoro-jsの日本語G2P問題（Issue #213未解決） | 高     | 事前にヒラガナ/カタカナ入力でのテストを必須化。代替としてmms-tts-jpnを準備 |
| Next.js + kokoro-js webpack互換性            | 高     | `@huggingface/transformers` 直接使用を一次選択肢とする                     |
| 初回モデルロード体験                         | 中     | 明示的なロード画面とプログレス表示。localStorage等でロード済みフラグ管理   |
| モバイル推論速度                             | 中     | WebGPU優先、WASMフォールバック。短文向けUI設計（上限文字数の表示）         |
| WAVファイルサイズ                            | 低     | 1分あたり約10MB。使用上問題なし。mp3対応は後から追加                       |
| SpeechSynthesisのクロスブラウザバグ          | 中     | Android向けの言語コード正規化（underscore→hyphen）などの対処が必要         |

---

## 10. バックログ追加可否の判断

**結論: 実装は可能だが、日本語モデルTTSに既知の不確実性あり。段階的実装を推奨。**

**フェーズ1（確実）**: Web Speech API による再生機能のみ。コスト低・リスク低。ダウンロード非対応を明示。

**フェーズ2（要検証）**: `@huggingface/transformers` + `Xenova/mms-tts-jpn` による日本語TTS + WAVダウンロード。実装前にローカルで日本語品質を検証必須。

**フェーズ3（要監視）**: kokoro-jsの日本語サポートが安定したら移行検討（より自然な音声品質）。
