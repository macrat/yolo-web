---
title: crypto.subtle.digest を使ったハッシュ計算ツールの UI 設計ベストプラクティス
date: 2026-05-22
purpose: yolos.net hash-generator タイル化（小型ダッシュボードカード化）サイクルの計画立案に必要な技術・UX 設計根拠の収集
method: >
  MDN Web Docs, Medium技術記事 (Ronan Takizawa / Sebastien Lorber), PatternFly デザインシステム,
  競合ツール実機調査 (emn178.github.io/online-tools, aidevhub.io, tooltool.net, orbit2x.com),
  現行 yolos.net ソースコード (Component.tsx / logic.ts / 既存タイル実装) の直接読み込み
sources:
  - https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
  - https://medium.com/@ronantech/exploring-sha-256-performance-on-the-browser-browser-apis-javascript-libraries-wasm-webgpu-9d9e8e681c81
  - https://maxrozen.com/race-conditions-fetching-data-react-with-useeffect
  - https://sebastienlorber.com/handling-api-request-race-conditions-in-react
  - https://www.patternfly.org/components/clipboard-copy/design-guidelines/
  - https://smart-interface-design-patterns.com/articles/designing-better-loading-progress-ux/
  - https://boldist.co/usability/loading-spinner-ux-killer/
  - https://emn178.github.io/online-tools/sha256.html
  - https://aidevhub.io/hash-generator/
  - https://tooltool.net/en/hash
  - https://orbit2x.com/hash
---

# crypto.subtle.digest を使ったハッシュ計算ツールの UI 設計ベストプラクティス

## 論点 1: 計算速度の体感

### ベンチマーク数値 (実測値)

Medium 記事 "Exploring SHA-256 Performance on the Browser" (Ronan Takizawa, 2024) による実測:

| 入力サイズ | crypto.subtle.digest (WebCrypto) | CryptoJS (JS ライブラリ) | WASM  |
| ---------- | -------------------------------- | ------------------------ | ----- |
| 100 KB     | **8 ms**                         | 5 ms                     | 3 ms  |
| 1 MB       | **58 ms**                        | 17 ms                    | 3 ms  |
| 10 MB      | **479 ms**                       | 166 ms                   | 27 ms |

注: WebCrypto API は C++ 実装でハードウェア最適化が効く一方、スレッドの切り替えオーバーヘッドがあるため、小サイズでは JS ライブラリに劣る場合がある。

### ハッシュツール典型ユースケースでの推定

- テキスト数十文字（例: パスワード文字列, API キー確認）: **< 1 ms** と推定
  - TextEncoder.encode() + crypto.subtle.digest() のコンビネーションは 1KB 未満では実質的に知覚不能
- 1KB のテキスト（URL 程度）: **< 1 ms**
- 100KB のテキスト（長文 HTML）: **約 8 ms**
- 1MB のテキスト（大きめのソースコード等）: **約 58 ms**

### 「リアルタイム反映」UX の実用限界

**数 KB 以下の入力ならば、`onChange` 毎に `await crypto.subtle.digest()` を実行しても体感遅延は生じない。** ハッシュツールの典型ユースケース（認証トークン確認、チェックサム検証）における入力サイズは通常 1KB 以下であるため、リアルタイム反映は問題なく実現可能。

SHA-256 の場合 4 アルゴリズム（SHA-1/256/384/512）を `Promise.all` で並列実行しても 1KB 入力では合計 < 5 ms であり、60fps (16ms/frame) の 1/3 以下。視覚的なチラつきは発生しない。

---

## 論点 2: 入力サイズの想定上限

### 実用限界

- `crypto.subtle.digest()` には公式の入力サイズ上限は存在しない（MDN 記載なし）
- ただし API の設計上、**ストリーミング入力は非対応**。入力全体を ArrayBuffer としてメモリに保持してから処理する必要がある
- 1MB テキストで約 58ms → **1MB 未満のテキスト入力は Worker 化不要で実用的**
- 10MB で約 479ms → この規模のテキストを textarea に貼る行為は通常ユーザーにとって非現実的

### yolos.net hash-generator タイル向けの判断

**タイル UI（400×264px の小型カード）では大量テキストの貼り付けはユースケースとして外れる。** 詳細ページでも、最大 100KB（8ms）程度を実用上限として想定すれば足りる。Worker 化や上限設定は不要。

もし将来的にファイルハッシュ機能（File API + FileReader）を追加する場合は大容量対応が必要になるが、現在は対象外。

---

## 論点 3: race condition 対策

### 問題の本質

`onChange` 毎に `async` な `crypto.subtle.digest()` を呼ぶと、**古いリクエストの結果が遅れて到着して新しい結果を上書きする** race condition が理論上発生し得る。

実際のハッシュ計算（< 5ms）では現実の競合は稀だが、入力が大きい場合や将来的な拡張を考慮すると対策が望ましい。

### 推奨パターン: boolean flag (ignore フラグ)

`useEffect` cleanup + boolean フラグが最もシンプルで確実:

```tsx
useEffect(() => {
  if (input === "") {
    setResult(null);
    return;
  }

  let ignore = false;

  const compute = async () => {
    const hash = await generateHash(input, algorithm);
    if (!ignore) {
      setResult(hash);
    }
  };

  compute();

  return () => {
    ignore = true;
  };
}, [input, algorithm]);
```

`ignore = true` にするだけで古い結果の state 書き込みを防ぐ。`AbortController` は fetch のキャンセルに使うものであり、`crypto.subtle.digest()` のキャンセルには使えない（Signal 非対応）。

**実用注意**: React 18 の Strict Mode では `useEffect` が開発環境でダブルマウントされる。cleanup 関数が正しく実装されていれば問題ない。

### Promise identity パターン（代替案）

```tsx
const lastPromise = useRef<Promise<string>>();

const compute = async (val: string) => {
  const p = generateHash(val, algorithm);
  lastPromise.current = p;
  const result = await p;
  if (p === lastPromise.current) {
    setResult(result);
  }
};
```

useEffect の外でも使えるが、cleanup と組み合わせる `ignore` フラグの方がイディオマティック。

---

## 論点 4: loading state の表示判断

### 業界一般的な閾値

複数の UX 研究・デザインシステム記事が一致している慣行:

| 処理時間         | 推奨 UI 対応                                     |
| ---------------- | ------------------------------------------------ |
| < 100ms          | loading 表示なし（表示しても見えない前に消える） |
| 100ms ~ 1000ms   | loading 表示なし / skeleton screens が効果的     |
| 1000ms ~ 3000ms  | skeleton screen または spinner                   |
| 3000ms ~ 10000ms | progress bar（進捗表示あり）                     |
| 10000ms+         | progress bar + パーセンテージ + 状態更新テキスト |

**< 1 秒の処理に loading インジケーターを出すと「知覚される前に消える」だけでなく、チラつきの原因になる** (Boldist UX 記事)。

Google Core Web Vitals の INP (Interaction to Next Paint) が 200ms 以下を「Good」と定義しているが、これは「入力から何らかの視覚応答が出るまでの時間」の閾値であり、loading spinner を出す閾値とは別概念。

### hash-generator タイルへの適用

hash-generator タイルの典型処理時間（テキスト入力 < 100KB）は **< 10ms**。

**結論: loading インジケーターは不要。** `onChange` で即座に計算し、結果を `useMemo` または `useEffect` + state で直接更新する。チラつきを避けるため、ローディング状態は実装しない。

唯一 loading 状態が有効になるケース: 将来的に 1MB 超の入力対応を加えた場合（58ms 超）。その場合も 200ms 遅延後に spinner 表示する「遅延スピナー」パターンが望ましい。

---

## 論点 5: エラーハンドリング

### `crypto.subtle.digest()` が失敗するケース

1. **非 HTTPS（non-secure context）環境**
   - `window.crypto.subtle` が `undefined` になる（Chrome 60 以降）
   - `localhost` / `127.0.0.1` は secure context として扱われるため例外的に利用可
   - yolos.net は HTTPS 提供済みのため、本番環境では発生しない

2. **古いブラウザ（IE など）**
   - MDN "Baseline Widely available - Available since January 2020" 以降のブラウザでは全対応
   - 実用上は無視して良い（IE はすでに EOS）

3. **無効なアルゴリズム名**
   - `crypto.subtle.digest("INVALID", data)` → Promise が reject される
   - 実装側で型を `"SHA-1" | "SHA-256" | "SHA-384" | "SHA-512"` に限定すれば発生しない

4. **TextEncoder.encode() の入力エンコーディング**
   - `TextEncoder` は常に UTF-8 で encode する（明示的にエンコーディングを選べない）
   - Surrogate pair 等の不正な JavaScript 文字列が渡された場合 → `encode()` 自体はエラーを throw しない（最善努力で変換される）
   - ユーザーが入力した文字列を `new TextEncoder().encode(input)` するケースでは実質的に問題なし

### yolos.net タイル向けエラー UX 設計

```
crypto.subtle が undefined の場合:
  → 「このブラウザでは利用できません（HTTPS 接続が必要です）」を
    エラーカラー（--fg-soft または専用エラーカラー）で表示
  → テキストエリアは表示したまま、結果欄のみエラー表示に切り替える

その他の try/catch:
  → 「計算中にエラーが発生しました」を控えめに表示
  → ブラウザ固有の例外メッセージ（英語）は直接見せない
```

既存の `base64` タイルが「不正な Base64 文字列です」を `--fg-soft` で控えめに表示するパターンと統一する。

---

## 論点 6: アルゴリズム選択 UX

### 競合ツール調査まとめ

| ツール                                   | アルゴリズム選択 UI                                                             | 結果表示                                             |
| ---------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **emn178.github.io/online-tools/sha256** | アルゴリズム別に別ページ（サイドバーナビ）                                      | 単一結果 + コピーボタン。設定欄に Auto Update トグル |
| **aidevhub.io/hash-generator**           | `<select>` ドロップダウン（MD5/SHA-1/SHA-256/SHA-384/SHA-512）                  | 単一結果 + 「Generate Hash」ボタン。コンペア機能あり |
| **tooltool.net/en/hash**                 | `<select>` ドロップダウン（SHA-1/SHA-256/SHA-512）                              | 単一結果                                             |
| **orbit2x.com/hash**                     | **チェックボックス複数選択**（デフォルト MD5/SHA-1/SHA-256/SHA-512 に checked） | **全選択結果を同時表示**。各行に個別コピー           |

### パターン比較

1. **ドロップダウン選択（単一表示）**: ユーザーが 1 種類だけ欲しいときに UI がシンプル。ただし「他のアルゴリズムでの値も確認したい」場合に操作が増える。
2. **タブ（単一表示）**: ドロップダウンより視認性が高い。スペースを消費する。
3. **セグメントコントロール（単一表示）**: 選択肢が少数（2〜4）の場合に最適。SHA-1/256/384/512 の 4 択なら適用可能。
4. **全部同時表示（チェックボックス / 固定）**: ユーザーが「全部見たい」場合に最も効率的。一覧性が高い反面、スペースを多く消費する。

### yolos.net hash-generator の現状

現行 `Component.tsx` は **4 アルゴリズムを `Promise.all` で一括計算し、全結果を同時表示** する設計（ボタン押下トリガー）。これは orbit2x.com と同じ「全部同時表示」パターン。

**タイル（400×264px）では**:

- 4 アルゴリズムの全結果を縦に並べると高さが足りない
- 「一番よく使われる SHA-256 を主役にして、他はタップで切り替え」というセグメント UI が適切
- または SHA-256 の結果 1 件のみ表示し「他のアルゴリズムは詳細ページで」とする単一表示も有効

セグメント UI の推奨案:

```
[ SHA-1 ] [ SHA-256 ] [ SHA-384 ] [ SHA-512 ]
（デフォルト: SHA-256 選択）
```

---

## 論点 7: コピー UX

### 出力の性質

- SHA-1: 40 文字 hex
- SHA-256: 64 文字 hex
- SHA-384: 96 文字 hex
- SHA-512: 128 文字 hex（Base64 では 88 文字）

128 文字の hex 文字列は視認が困難なため、以下が業界標準:

### コピーボタンの慣行（PatternFly / Flowbite / Mosaic Design System）

1. **出力フィールドの右端にコピーボタンをインライン配置**: 「テキスト + コピーアイコンボタン」の 1 行パターン
2. **コピー成功のフィードバック**: ボタンラベルを「コピー済み ✓」に一時変更（1〜2 秒後に「コピー」に戻す）。ツールチップでも可。
3. **等幅フォント（monospace）**: hex 文字列は等幅フォントで表示する。桁ズレがなく視認性が高い。例: `font-family: monospace` または JetBrains Mono 等
4. **一括コピー vs 個別コピー**: 全アルゴリズム同時表示の場合は各行に個別コピーボタン（orbit2x.com パターン）。タイルで 1 アルゴリズムのみ表示するなら単一コピーボタンで十分。

### yolos.net タイルへの適用

タイルで表示するアルゴリズムが 1 つ（セグメント UI 選択）の場合:

- 結果欄の右端または結果欄下部に「コピー」ボタン 1 個
- クリック後 2 秒間「コピー済み」表示（現行 Component.tsx の `copiedIndex` パターンを踏襲）
- hex 文字列に `font-family: monospace` と `word-break: break-all` を適用
- 64〜128 文字の文字列が枠内に収まるよう `font-size: 0.75rem` 程度が適切

---

## yolos.net hash-generator タイル設計への推奨案

### 設計方針サマリー

以下は上記調査を踏まえた、hash-generator タイル（cols=3 rows=2 = 400×264px）への具体的推奨:

#### 1. リアルタイム反映 + デバウンスなし

`onChange` ごとに即座に計算する。1KB 以下の入力で < 1ms であるため、デバウンスは不要かつ逆に体感を悪化させる可能性がある。

#### 2. 非同期 + ignore フラグパターン

現行 Component.tsx はボタン押下トリガーで `useState` + `useCallback` を使用。タイルでリアルタイム化する場合は `useEffect` + `ignore` フラグに変更:

```tsx
// タイル内の推奨パターン
useEffect(() => {
  if (input === "") {
    setResult(null);
    return;
  }
  let ignore = false;
  crypto.subtle
    .digest(algorithm, new TextEncoder().encode(input))
    .then((buf) => {
      if (!ignore) setResult(bufToHex(buf));
    })
    .catch(() => {
      if (!ignore) setResult(null); // エラー時は結果をクリア
    });
  return () => {
    ignore = true;
  };
}, [input, algorithm]);
```

#### 3. loading インジケーターなし

< 10ms で完了するため一切不要。結果欄は常に「直前の結果 or プレースホルダー」のまま保つ。

#### 4. アルゴリズム選択 UI

タイルサイズ（400px 幅）に収まるセグメント UI:

```
[ SHA-1 ] [ SHA-256 ] [ SHA-384 ] [ SHA-512 ]
```

デフォルト: SHA-256（最も汎用的）。`aria-pressed` で現在選択を表現（既存 Base64Tile / HtmlEntityTile と統一）。

#### 5. 結果表示

- `font-family: monospace`
- `word-break: break-all`（128 文字を枠内で折り返す）
- `font-size: 0.75rem`（64〜128 文字が見える最小限）
- コピーボタンを結果欄右端またはすぐ下に配置
- コピー成功後 2 秒間「コピー済み」表示

#### 6. エラーハンドリング

`crypto.subtle` が `undefined`（HTTP 環境）の場合:

- 入力欄はそのまま表示
- 結果欄に「HTTPS 環境でのみ利用できます」を `color: var(--fg-soft)` で表示
- タイルからのエラーは最小限の日本語文言に翻訳（英語 JS エラーを直接表示しない）

#### 7. 詳細ページへのリンク

既存タイル（Base64Tile / HtmlEntityTile）と同様に `alignSelf: flex-end` で右下に配置:

```tsx
<Link href="/tools/hash-generator" style={{ fontSize: "0.75rem", color: "var(--accent)", ... }}>
  詳細ページで開く
</Link>
```

### タイルレイアウト案（上から順）

```
[タイトル: ハッシュ生成 (0.75rem, opacity 0.7)]
[セグメントUI: SHA-1 / SHA-256 / SHA-384 / SHA-512]
[textarea rows=2 (入力欄, flexShrink: 0)]
[結果欄: monospace hex (flex: 1, overflowY: auto)]
[詳細ページで開く (右端リンク)]
```

高さ配分（264px):

- padding 12px × 2 = 24px
- タイトル行 ≒ 18px
- gap × 4 = 32px
- セグメント UI ≒ 26px
- textarea rows=2 ≒ 56px
- 結果欄 = 残り ≒ 96px
- リンク ≒ 18px

合計 ≒ 264px（収まる）

#### 結果欄の文字数見積もり

SHA-512 hex = 128 文字。`font-size: 0.75rem` = 約 12px、`font-family: monospace`、コンテナ幅 376px（400-24padding）。
等幅フォントの 12px では 1 文字約 7.2px → 1 行に約 52 文字 → 128 文字は 3 行 ≒ 3 × 18px = 54px。96px の結果欄に収まる。

---

## 参考: 競合ツールの UI パターン観察（実機アクセス）

### emn178.github.io/online-tools/sha256

- アルゴリズム別に完全に別ページ（SHA224/SHA256/SHA256-File 等が別 URL）
- 単一ページに入力 textarea + 出力 textarea を縦に 2 分割
- Settings パネルに「Auto Update」トグルあり（デフォルト不明だがリアルタイム対応）
- 出力欄に「Copy」ボタンアイコン + 「Full Screen」ボタン
- Input Encoding ドロップダウン（Hex/Base64/UTF-8 等）と Output Encoding ドロップダウン（Hex Lower/Upper/Base64）が充実

### aidevhub.io/hash-generator

- 上部タブ「Text Input / File Input」で入力種別を切り替え
- アルゴリズムは `<select>` ドロップダウン（MD5/SHA-1/SHA-256/SHA-384/SHA-512）
- 「Generate Hash」ボタン押下でのトリガー（リアルタイムではない）
- 出力は `<code>` タグで monospace 表示
- コンペアモード（2 つのハッシュを比較）が別セクションにあり実用的

### tooltool.net/en/hash

- アルゴリズム `<select>`（SHA-1/SHA-256/SHA-512）
- Real-time calculation（「Instant hash calculation as you type」と明記）
- 設定欄でアルゴリズムを選択

### orbit2x.com/hash

- **アルゴリズムをチェックボックスで複数選択**（MD5/SHA-1/SHA-256/SHA-512 がデフォルト checked）
- SHA3-256/SHA3-512/BLAKE2b/RIPEMD-160/CRC32/bcrypt も追加可能
- 各アルゴリズムの結果が縦に列挙され、各行に個別コピーボタン
- Text Hash / File Hash / Verify Hash の 3 モードをタブで切替
- 「Generate Hashes」ボタン押下型

---

## 結論サマリー（計画書貼り込み用）

1. **計算速度**: 1KB 以下の入力で < 1ms。`onChange` 毎に即時計算して問題なし。デバウンス・loading インジケーター不要。

2. **入力サイズ上限**: タイル UI 用途では Worker 化・上限設定は不要。実質 100KB（8ms）が実用上限で十分。

3. **race condition 対策**: `useEffect` + `ignore` フラグ（boolean cleanup パターン）を採用。`AbortController` は `crypto.subtle.digest()` に使用不可。

4. **loading state**: 出さない。< 10ms の処理に spinner を表示すると視覚ノイズになる（UX 業界標準: < 1 秒は loading 不要）。

5. **エラーハンドリング**: HTTPS 環境（`crypto.subtle` undefined）と予期せぬ `Promise.reject` の 2 ケースを catch し、日本語文言を `--fg-soft` カラーで表示。既存 Base64Tile パターンを踏襲。

6. **アルゴリズム選択 UI**: タイル（400px 幅）にはセグメント UI（SHA-1 / SHA-256 / SHA-384 / SHA-512、デフォルト SHA-256）が最適。`aria-pressed` で状態を表現。既存 Base64Tile / HtmlEntityTile の方向切替ボタンと同一パターン。

7. **コピー UX**: monospace フォント + `word-break: break-all` で hex 文字列を表示。コピーボタン 1 個、成功後 2 秒間「コピー済み」表示。既存 Component.tsx の `copiedIndex` パターンを踏襲。
