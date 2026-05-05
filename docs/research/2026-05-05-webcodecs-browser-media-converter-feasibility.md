---
title: WebCodecs APIによるブラウザ完結型メディア変換ツールの実現可能性調査
date: 2026-05-05
purpose: yolos.netに動画・音声ファイル変換・圧縮ツールを実装する際の技術選定と実現可能性の評価
method: |
  - MDN WebCodecs API ドキュメント
  - caniuse.com WebCodecs サポート表
  - WebCodecs Fundamentals コーデック分析データセット (1M+デバイス)
  - Mediabunny 公式ドキュメント
  - Remotion WebCodecs ドキュメント
  - FreeCodeCamp WebCodecs Handbook
  - Chrome for Developers WebCodecs ガイド
  - Bundlephobia / npm パッケージ情報
  - ffmpeg.wasm 公式ドキュメント
  - WebKit 開発ブログ / Safari リリースノート
sources:
  - https://caniuse.com/webcodecs
  - https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API
  - https://mediabunny.dev/
  - https://mediabunny.dev/guide/supported-formats-and-codecs
  - https://www.remotion.dev/docs/webcodecs/misconceptions
  - https://www.remotion.dev/docs/webcodecs/resize-a-video
  - https://www.freecodecamp.org/news/the-webcodecs-handbook-native-video-processing-in-the-browser/
  - https://developer.chrome.com/docs/web-platform/best-practices/webcodecs
  - https://webcodecsfundamentals.org/datasets/codec-analysis-2026/
  - https://ffmpegwasm.netlify.app/docs/overview/
  - https://www.testmuai.com/web-technologies/webcodecs-safari/
  - https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/
  - https://github.com/Vanilagy/mediabunny
  - https://blog.tomayac.com/2025/03/08/setting-coop-coep-headers-on-static-hosting-like-github-pages/
---

# WebCodecs APIによるブラウザ完結型メディア変換ツールの実現可能性調査

## 1. WebCodecs API ブラウザサポート状況（2026年5月時点）

### デスクトップブラウザ

| ブラウザ | サポート状況                       | 備考                                             |
| -------- | ---------------------------------- | ------------------------------------------------ |
| Chrome   | 94+ 完全対応                       | VideoEncoder/Decoder/AudioEncoder/Decoder すべて |
| Edge     | 94+ 完全対応                       | Chrome 同等                                      |
| Firefox  | 130+ 完全対応                      | 2024年後半から追加                               |
| Safari   | 16.4-18.7 部分対応、26.0+ 完全対応 | 詳細後述                                         |
| Opera    | 80+ 完全対応                       |                                                  |

### モバイルブラウザ

| ブラウザ             | サポート状況                                   | 備考                                    |
| -------------------- | ---------------------------------------------- | --------------------------------------- |
| iOS Safari 16.4-18.7 | **部分対応（VideoDecoder/VideoEncoder のみ）** | AudioEncoder/AudioDecoder なし          |
| iOS Safari 26.0+     | 完全対応                                       | 2026年秋リリース予定の Safari 26 で完結 |
| Chrome for Android   | 147+ 完全対応                                  |                                         |
| Samsung Internet     | 17.0+ 完全対応                                 |                                         |
| Firefox for Android  | **非対応**                                     | テスト済み 150 で未実装                 |

### Safari の特殊事情（重要）

Safari 16.4〜18.7（現行 iOS ユーザーの主流）は VideoDecoder と VideoEncoder のみで、AudioEncoder・AudioDecoder・ImageDecoder が存在しない。これにより：

- **音声エンコードが iOS Safari で使えない**（AAC・Opus・MP3 の書き出しが WebCodecs 経由では不可）
- Safari 26.0 で初めてフルサポートが揃うが、これは iOS 26 と同時リリースの予定（2026年秋以降）
- 2026年5月時点で iOS ユーザーの大多数はまだ 18.x 系

**グローバル カバレッジ**: caniuse.com では 94.21% のブラウザがサポート（部分サポート含む）

---

## 2. WebCodecs で何ができるか

### WebCodecs が担う範囲

WebCodecs はコーデック層のみを提供するローレベル API。以下が可能：

- **コーデック変換**: ある形式でデコードし、別形式で再エンコード（例: HEVC デコード → H.264 エンコード）
- **ビットレート指定**: `VideoEncoderConfig.bitrate` で平均ビットレートを数値指定
- **解像度変更**: VideoFrame を Canvas 経由でリサイズして再エンコード
- **フレーム単位アクセス**: VideoFrame/AudioData オブジェクトとして個々のフレームにアクセス
- **ハードウェアアクセラレーション**: ブラウザ内蔵のハードウェアコーデックを利用（純粋 WASM より 3〜10倍高速）

### WebCodecs が**担わない**範囲（別ライブラリが必要）

- **コンテナの読み書き（デマックス/マックス）**: MP4・WebM・MKV などのコンテナを解析・生成する機能は WebCodecs に含まれない
- **GIF エンコード**: WebCodecs は GIF コーデックをサポートしない
- **MP3 エンコード**: AudioEncoder で MP3 を出力する標準的な方法がない（AAC または Opus が現実的）

### 対応コーデック（エンコード側）

| コーデック   | Chrome            | Firefox  | Safari 16-18     | Safari 26+ |
| ------------ | ----------------- | -------- | ---------------- | ---------- |
| H.264/AVC    | 対応              | 部分対応 | 対応             | 対応       |
| VP9          | 対応              | 対応     | 非対応           | 対応       |
| AV1          | 対応（SW/HW依存） | 対応     | ハードウェア依存 | 対応       |
| AAC（音声）  | 対応              | 非対応   | 非対応（16-18）  | 対応       |
| Opus（音声） | 対応              | 対応     | 非対応（16-18）  | 対応       |

**エンコードの現実**: クロスブラウザで安全なのは **H.264（映像）＋ AAC（音声）の組み合わせ**だが、iOS Safari 16-18 では AAC エンコードができない。VP9 は Chrome/Firefox では安全だが Safari では使えない。

---

## 3. コンテナ処理ライブラリの選択肢

### 選択肢 A: Mediabunny（推奨）

mp4-muxer と webm-muxer の後継・統合ライブラリ。同作者による新世代ツールキット。

**対応フォーマット（読み書き双方向）**: MP4、MOV、WebM、MKV、Ogg、MP3、WAV、FLAC、HLS、MPEG-TS

**対応コーデック**: H.264、HEVC、VP8、VP9、AV1（映像）、AAC、Opus、MP3、Vorbis、FLAC（音声）

**バンドルサイズ（minified + gzipped）**:

- WAV 書き込みのみ: 5.79 kB
- WebM 書き込みのみ: 11.4 kB
- MP4 書き込みのみ: 17.3 kB
- MP4 読み込みのみ: 16.0 kB
- 全フォーマット読み込み: 30.0 kB
- 全機能: 69.6 kB

**特記事項**:

- 完全 TypeScript、ゼロ依存
- Tree-shakable 設計（使う機能分だけバンドルに含まれる）
- mp4-muxer は非推奨となり、本ライブラリへの移行が推奨されている
- MP3・FLAC・AAC エンコードは拡張パッケージ（@mediabunny/aac-encoder 等）が必要
- ライセンス: MPL-2.0（クローズドソース商用利用可）

### 選択肢 B: mp4box.js

GPAC プロジェクトによる MP4 解析・操作ライブラリ。デマックスのみに使う場合もある。

- バンドルサイズ: 約 37.3 kB（minified + gzipped）
- 2025年 6月に v1.0.0 がリリース（TypeScript サポート追加）
- 機能が豊富だがサイズが大きい

### 選択肢 C: mp4-muxer / webm-muxer（非推奨）

Mediabunny の前身。新規プロジェクトでの使用は非推奨。バグフィックスや新機能の追加が終了している。

---

## 4. ffmpeg.wasm の実用性評価

### 概要

ffmpeg をブラウザで動かす WASM 実装。`@ffmpeg/ffmpeg`（ラッパー）+ `@ffmpeg/core`（WASM 本体）の構成。

### バンドルサイズ

| パッケージ                        | WASM バイナリサイズ |
| --------------------------------- | ------------------- |
| @ffmpeg/core（シングルスレッド）  | 約 31 MB            |
| @ffmpeg/core-mt（マルチスレッド） | 約 32 MB            |

初回ロード時は 25〜31 MB のダウンロードが発生する。IndexedDB にキャッシュすることで 2 回目以降は高速化可能。

### SharedArrayBuffer と COOP/COEP

**マルチスレッド版（@ffmpeg/core-mt）**:

- `SharedArrayBuffer` が必要
- `Cross-Origin-Opener-Policy: same-origin` および `Cross-Origin-Embedder-Policy: require-corp` ヘッダーが必須
- Next.js では `next.config.ts` の `headers()` 関数で設定可能

**シングルスレッド版（@ffmpeg/core）**:

- SharedArrayBuffer 不要、COOP/COEP ヘッダー不要
- マルチスレッド比で処理速度は約半分だが、設定が簡単

**静的ホスティング（GitHub Pages 等）での回避策**:

- `coi-serviceworker`（Guido Zuidhof 作）を使うとサービスワーカー経由で COOP/COEP を擬似的に付与可能
- Next.js + Vercel/Cloudflare Pages では `next.config.ts` でヘッダー設定が可能

### 性能比較

| ツール                              | 処理速度                               |
| ----------------------------------- | -------------------------------------- |
| WebCodecs（ブラウザ内蔵コーデック） | 最速（ハードウェアアクセラレーション） |
| ffmpeg.wasm                         | WebCodecs の約 1/67〜1/24              |
| Mediabunny（WebCodecs 利用）        | ffmpeg.wasm の約 67倍                  |

### iOS Safari での ffmpeg.wasm の問題

iOS Safari では WebAssembly のマルチスレッドが制限されており、ffmpeg.wasm のマルチスレッドビルドが動作しない。シングルスレッドビルドは動作するが、処理が非常に遅くなる。

### lazy load で許容できるか

- 音声変換など軽量なタスク: ユーザーがファイルを選択した後にロードすれば、待機 3〜5 秒（初回）は許容範囲内
- 長尺動画の圧縮: 処理時間が数分〜十数分になる可能性があり UX 上の問題
- 初回以降はキャッシュが効くため繰り返し利用には問題ない

---

## 5. 現実的に作れるツールと優先度

### 優先度 1（高）: 動画から音声を抽出（MP4/WebM → AAC/Opus）

**概要**: 動画ファイルをアップロードし、音声トラックを AAC または Opus で抽出・保存

**技術構成**:

- Mediabunny でデマックス（MP4/WebM 読み込み）
- WebCodecs AudioDecoder でデコード（Chrome/Firefox では動作、iOS Safari 16-18 では非対応）
- Mediabunny で AAC/Opus 再エンコードして MP4/M4A として書き出し
- iOS Safari フォールバック: ffmpeg.wasm シングルスレッドビルド（遅いが動作する）

**難易度**: 低〜中
**推定バンドル増加**: Mediabunny 約 20〜30 kB + オプションで ffmpeg.wasm（lazy load）
**iOS Safari の問題**: 18.x では AudioEncoder がないため WebCodecs パスは使えない。ffmpeg.wasm フォールバックで対応可能
**参考**: 実際に VideoKit.cc など複数の商用サービスがこのアプローチを採用済み

---

### 優先度 2（高）: 動画圧縮・解像度変更（MP4/WebM → 解像度落とし・ビットレート圧縮）

**概要**: 動画ファイルをアップロードし、解像度と品質を指定して再エンコードしてダウンロード

**技術構成**:

- Mediabunny で読み込み → VideoDecoder でデコード → Canvas でリサイズ → VideoEncoder で再エンコード → Mediabunny で MP4 書き出し
- または Mediabunny の `resize` API を直接利用

**難易度**: 中
**推定バンドル増加**: Mediabunny 約 30〜50 kB（全形式対応の場合）
**主要リスク**:

- VideoFrame がメモリを大量消費（4K 映像で 67 フレーム超でクラッシュの報告あり）
- 長尺動画（10 分超）はメモリ管理が複雑
- iOS Safari 18 で VideoEncoder は使えるが AudioEncoder がないため音声付き圧縮が難しい

---

### 優先度 3（中）: 音声トリミング（MP3/WAV → 指定範囲を切り出して保存）

**概要**: 音声ファイルをアップロードし、開始・終了時刻を指定して切り出してダウンロード

**技術構成**:

- Web Audio API の `decodeAudioData` でデコード → AudioBuffer を指定範囲でスライス → WAV エンコード（PCM は全ブラウザ対応）→ Mediabunny で WAV/MP4 書き出し
- WebCodecs AudioDecoder/AudioEncoder の代わりに Web Audio API を使うことで iOS Safari 互換性問題を回避できる

**難易度**: 低〜中
**推定バンドル増加**: Web Audio API はブラウザ内蔵（追加なし）+ Mediabunny WAV 書き込み約 6 kB
**利点**: iOS Safari の AudioEncoder 問題を回避できる（WAV は PCM なのでエンコード不要）

---

### 優先度 4（中）: 動画トリミング（指定した時間範囲を切り出して MP4 として保存）

**概要**: 動画をアップロードし、開始・終了時刻を指定して切り出す

**技術構成**:

- Mediabunny の trim API または手動でのフレーム選択
- H.264 キーフレームの扱いに注意（キーフレーム間にある場合は再エンコードが必要）

**難易度**: 中〜高
**推定バンドル増加**: Mediabunny 約 30〜50 kB
**主要リスク**: キーフレーム（I フレーム）境界でのみ完璧なカットが可能。任意の時刻でカットするには前後を再エンコードする必要があり処理が複雑

---

### 優先度 5（低〜中）: 動画フォーマット変換（MP4 → WebM または WebM → MP4）

**概要**: コンテナフォーマットだけを変換（コーデックは保持するトランスマックス、または再エンコード）

**技術構成**:

- Mediabunny の transmux API（コーデック変換なしの場合）
- または WebCodecs で再エンコード

**難易度**: 低（トランスマックスのみ）〜高（再エンコードあり）
**推定バンドル増加**: Mediabunny 約 30〜40 kB
**注意**: iOS Safari で HEVC を H.264 に変換したいケースが多いが、コーデック変換には両方向の対応コーデックが必要

---

### 優先度 6（低）: 動画 → GIF 変換

**概要**: 動画の指定区間を GIF アニメーションに変換

**技術構成**:

- WebCodecs VideoDecoder でフレームを取り出す
- GIF エンコードは WebCodecs 非対応のため `gifenc`（純粋 JS）または `gif.js` を使用
- `gifenc`: 軽量、高品質な量子化アルゴリズム
- `gif.js`: Web Worker を使った並列エンコード

**難易度**: 中〜高
**推定バンドル増加**: Mediabunny（読み込み側）+ gifenc（約 数十 kB）
**主要リスク**:

- GIF は 256 色制限があり映像品質が大幅に低下する
- ファイルサイズが非常に大きくなりやすい（動画より重くなることも）
- 処理が遅い（全フレームの色量子化が必要）
- 代替として APNG や WebP アニメーションの方がユーザー価値が高い場合もある

---

### 優先度 7（参考）: 画像ファイルへの音声付加（BGM 付き MP4 生成）

既存の image-resizer ツールと組み合わせた発展的なツール。現時点では優先度低。

---

## 6. 実装上の主要リスクと落とし穴

### メモリ消費問題

- VideoFrame は VRAM を消費する。`frame.close()` を明示的に呼ばないとメモリリークが発生
- 4K 動画では 2 秒分（約 67 フレーム）を超えるとメモリ不足でクラッシュする報告がある
- ブラウザが `VideoDecoder` への入力キューを際限なく受け付けるため、デコード速度 < 入力速度の場合にメモリが急増する
- 対策: キュー制限（`waitForQueueToBeLessThan()` パターン）と `VideoFrame.close()` の確実な呼び出し

### iOS Safari 固有の問題

- iOS Safari 16.4〜18.7（2026年5月時点の大多数の iOS ユーザー）では AudioEncoder・AudioDecoder がない
- 音声関連機能には Web Audio API フォールバックまたは ffmpeg.wasm シングルスレッドビルドが必要
- Safari 26 で解決予定だが 2026 年秋以降のため当面は非対応ユーザーが存在
- モバイル Safari のメモリ制限は特に厳しく、大きなファイルの処理でページがクラッシュしやすい

### コーデックサポートの非均一性

- `isConfigSupported()` を必ず呼んで実際のサポートを確認する必要がある
- Chrome の `AudioDecoder.isConfigSupported()` は「サポートあり」と返しても後で失敗する場合がある
- AV1 エンコードは CPU 負荷が高く（VP9 比 3〜5 倍）、ローエンド端末では実用的でない

### COOP/COEP ヘッダー（ffmpeg.wasm マルチスレッド時）

- Vercel / Cloudflare Pages では `next.config.ts` の `headers()` で設定可能
- Google Analytics や外部フォント等のサードパーティリソースは `crossorigin="anonymous"` が必要
- 完全静的ホスティング（GitHub Pages 等）では `coi-serviceworker` ライブラリによる回避が可能

### 処理時間とユーザー体験

- ffmpeg.wasm は WebCodecs より 24〜67 倍遅い
- 10 分の 1080p 動画を ffmpeg.wasm で変換すると数分〜10 分超かかる場合がある
- プログレスバーとキャンセル機能は必須
- WebCodecs ベースでも長尺動画（30 分超）は現実的に困難

### ファイルサイズ制限

- ブラウザのメモリ上で全データを保持するため、大きなファイルは RAM に依存する
- 実用的な上限: モバイルでは 200〜300 MB、デスクトップでは 500 MB〜1 GB 程度が目安
- File System Access API を使ってディスクに直接書き出す手法で上限を緩和できる

---

## 7. 技術選定の推奨方針

### WebCodecs ＋ Mediabunny（メインアプローチ）

- ほとんどのツールでこの組み合わせが最適
- バンドルサイズを数十 kB に抑えつつ高速処理が可能
- 音声エンコードの iOS Safari 非対応問題は Web Audio API 経由の WAV 出力で回避

### ffmpeg.wasm（フォールバック・特定用途のみ）

- iOS Safari での音声エンコードなど、WebCodecs が使えないブラウザへのフォールバックとして使用
- または GIF 出力など WebCodecs が対応しない形式に対してのみ使用
- lazy load ＋ IndexedDB キャッシュで初回ロード時間を許容範囲内に

### WebCodecs のみを使わない方がいいケース

- MP3 ファイルとして出力したい場合（WebCodecs で MP3 エンコードは非対応）
- iOS Safari ユーザーが多いと想定される音声ツール（AudioEncoder がない）
- GIF 出力が必要な場合

---

## 8. バックログ追加候補の優先度付きリスト

| 優先度 | ツール名             | 主要技術                                              | 想定バンドル増加（gzip） | iOS Safari 対応              | 実装難易度 |
| ------ | -------------------- | ----------------------------------------------------- | ------------------------ | ---------------------------- | ---------- |
| 1      | 動画から音声を抽出   | Mediabunny + WebCodecs (+ ffmpeg.wasm フォールバック) | 20〜50 kB                | 部分的（WAV/AAC）            | 低〜中     |
| 2      | 動画圧縮・解像度変更 | Mediabunny + WebCodecs                                | 30〜50 kB                | 映像のみ（音声なし圧縮は可） | 中         |
| 3      | 音声トリミング       | Web Audio API + Mediabunny                            | 6〜20 kB                 | 対応（WAV 出力）             | 低〜中     |
| 4      | 動画トリミング       | Mediabunny + WebCodecs                                | 30〜50 kB                | 映像のみ                     | 中〜高     |
| 5      | 動画フォーマット変換 | Mediabunny                                            | 30〜50 kB                | 限定的                       | 低〜中     |
| 6      | 動画 → GIF 変換      | WebCodecs + gifenc                                    | 30〜50 kB                | 映像デコードのみ             | 中〜高     |

---

## 9. Next.js App Router での実装上の注意

- WebCodecs 自体は HTTPS 環境（Secure Context）のみで動作するため、本番環境では問題なし
- WebCodecs は Web Worker 内で利用可能。処理はメインスレッドではなく Worker で実行することを推奨
- ffmpeg.wasm を使う場合は `next.config.ts` の `headers()` 関数で COOP/COEP ヘッダーを追加
- lazy load のために `next/dynamic` や `React.lazy` + Suspense の組み合わせを使用
- WASM ファイルは `public/` ディレクトリに配置するか CDN から読み込む
- Next.js 16 App Router での動作：特別な制約は確認されていない。Server Components では `'use client'` ディレクティブが必要

---

## まとめ

**最も現実的で優先度が高いツール**: 「動画から音声を抽出（MP4→AAC/WAV）」と「音声トリミング」。これらは Mediabunny（バンドル 20〜30 kB）と Web Audio API だけで完結し、ffmpeg.wasm の重さを回避できる。iOS Safari の AudioEncoder 非対応は WAV 出力（PCM は変換不要）か ffmpeg.wasm フォールバックで対処可能。

**次点**: 「動画圧縮・解像度変更」は WebCodecs の最大の用途であり価値が高いが、iOS Safari のオーディオ制限と長尺動画のメモリ管理が課題。短い動画（5 分以内、720p 以下）に制限するなら実用的に作れる。

**慎重に判断すべき**: GIF 変換は品質問題とファイルサイズ肥大化のリスクがあり、ユーザー価値が低い可能性がある。代わりに WebP アニメーションや MP4 の埋め込み方法の案内の方が実用的かもしれない。
