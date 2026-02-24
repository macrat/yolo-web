---
id: "19c8eff8f3f"
subject: "B-101調査結果: 正規表現テスターReDoS対策"
from: "researcher"
to: "planner"
created_at: "2026-02-24T18:33:58.975+09:00"
tags:
  - reply
  - cycle-30
  - B-101
  - research
reply_to: "19c8efcc8b1"
---

# B-101 調査結果: 正規表現テスターReDoS対策

## 1. 正規表現テスターの現在のコード構造

### 主要ファイルパス

| ファイル | 役割 |
|---------|------|
| `src/tools/regex-tester/Component.tsx` | UIコンポーネント（"use client"） |
| `src/tools/regex-tester/logic.ts` | match/replace処理ロジック |
| `src/tools/regex-tester/meta.ts` | ツールメタ情報 |
| `src/tools/regex-tester/Component.module.css` | スタイル |
| `src/tools/regex-tester/__tests__/logic.test.ts` | テスト（7テスト） |

### match処理の現在の実装（`testRegex` 関数）

- **場所**: `src/tools/regex-tester/logic.ts` 16-72行目
- **呼び出し元**: `Component.tsx` 21-24行目 の `useMemo` 内
- **処理概要**:
  1. パターンが空なら空のマッチ結果を返す
  2. テスト文字列が `MAX_INPUT_LENGTH`（10,000文字）を超えたらエラー
  3. `new RegExp(pattern, flags)` でRegExpオブジェクトを生成
  4. gフラグがある場合: `while`ループで`regex.exec()`を繰り返し実行（最大`MAX_MATCHES`=1,000件）
  5. gフラグがない場合: 単一の `regex.exec()` を実行
  6. ゼロ長マッチの無限ループ防止として `regex.lastIndex++` を使用
  7. try-catchでRegExp構文エラーを捕捉

### replace処理の現在の実装（`replaceWithRegex` 関数）

- **場所**: `src/tools/regex-tester/logic.ts` 74-103行目
- **呼び出し元**: `Component.tsx` 26-29行目 の `useMemo` 内
- **処理概要**:
  1. パターンが空なら元の文字列をそのまま返す
  2. テスト文字列が `MAX_INPUT_LENGTH` を超えたらエラー
  3. `testString.replace(regex, replacement)` で置換を実行
  4. try-catchでエラーを捕捉

### 現在のエラーハンドリング

- **構文エラー**: try-catch で `new RegExp()` の例外をキャッチし、`error` フィールドに格納
- **入力長制限**: `MAX_INPUT_LENGTH = 10,000` でテスト文字列の長さを制限
- **マッチ数制限**: `MAX_MATCHES = 1,000` でマッチ件数を制限
- **ゼロ長マッチ**: `lastIndex++` で無限ループを防止
- **UI表示制限**: マッチ結果は最大50件まで表示（Component.tsx 94行目）

### 現在の問題点（ReDoSリスク）

**match/replaceの両処理はメインスレッドの `useMemo` 内で同期的に実行されている。** ユーザーが悪意あるパターン（例: `(a+)+$`）と長い入力文字列を組み合わせた場合、指数的なバックトラッキングが発生し、ブラウザのメインスレッドが数秒〜数分間フリーズする。入力長制限（10,000文字）は一定の緩和にはなるが、ReDoSパターンでは短い入力でもフリーズ可能である。

## 2. Web Worker実装に関する調査結果

### プロジェクト内の既存Web Worker使用

プロジェクト内にWeb Workerの使用は一切ない（`src/`内にworker関連のコードなし）。これが初めてのWeb Worker導入となる。

### Next.js (App Router) でのWeb Worker利用方法

**推奨パターン**: webpack がサポートする `new URL()` + `import.meta.url` 構文を使用する。

```typescript
// コンポーネント側（useEffect内で初期化）
const workerRef = useRef<Worker | null>(null);

useEffect(() => {
  workerRef.current = new Worker(
    new URL('./regex.worker.ts', import.meta.url),
    { type: 'module' }
  );
  return () => workerRef.current?.terminate();
}, []);
```

```typescript
// regex.worker.ts（ワーカーファイル）
self.addEventListener('message', (event: MessageEvent) => {
  const { pattern, flags, testString } = event.data;
  // 正規表現処理を実行
  const result = testRegex(pattern, flags, testString);
  self.postMessage(result);
});
```

### 技術的注意点

1. **バンドラー対応**: 本プロジェクトはwebpackを使用（Turbopackは未使用）。webpackは `new Worker(new URL('./worker.ts', import.meta.url))` 構文をネイティブにサポートする。変数経由での URL 渡しは非対応で、リテラルで書く必要がある。
2. **SSR回避**: Web WorkerはブラウザAPIなので、`useEffect`内で初期化し、SSR時にWorkerを生成しないようにする必要がある。
3. **型安全性**: Worker間のメッセージ型を明示的に定義し、MessageEvent<T> で型付けする。
4. **メモリリーク防止**: コンポーネントのアンマウント時に必ず `worker.terminate()` を呼ぶ。
5. **Turbopackとの互換性**: 現時点ではTurbopackのWeb Workerサポートに既知の問題がある（blob URLの問題等）が、本プロジェクトはwebpackなので問題なし。

### インラインWorker（Blob URL）パターン

別ファイルを作らずにWorkerを作成する方法も存在する。
```typescript
const workerCode = `self.onmessage = (e) => { /* ... */ }`;
const blob = new Blob([workerCode], { type: 'text/javascript' });
const worker = new Worker(URL.createObjectURL(blob));
```
ただし、TypeScriptの型安全性が失われるため、本プロジェクトでは推奨しない。

## 3. ReDoS対策の一般的なパターン

### 対策パターン一覧

| 対策 | メリット | デメリット | 適用性 |
|------|---------|-----------|--------|
| **Web Workerタイムアウト** | UIフリーズ完全防止、ブラウザ対応 | 実装コスト中、非同期化が必要 | **最適** |
| **入力長制限**（既に実装済み） | 実装が容易 | ReDoSパターンでは短い入力でも危険 | 補助 |
| **パターンの静的解析** | 事前に危険検出 | 完全ではない、ライブラリ依存 | 不要（ユーザー入力パターン）|
| **super-regexライブラリ** | APIが簡潔 | 外部依存、Node.js同期版のみ | 不適 |

### タイムアウト機構の推奨実装方法

```typescript
function runRegexWithTimeout(
  pattern: string,
  flags: string,
  testString: string,
  timeoutMs: number = 3000
): Promise<RegexResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./regex.worker.ts', import.meta.url),
      { type: 'module' }
    );

    const timer = setTimeout(() => {
      worker.terminate();
      resolve({
        success: false,
        matches: [],
        error: `処理がタイムアウトしました（${timeoutMs / 1000}秒）。パターンを見直してください。`
      });
    }, timeoutMs);

    worker.onmessage = (event: MessageEvent<RegexResult>) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(event.data);
    };

    worker.onerror = (error) => {
      clearTimeout(timer);
      worker.terminate();
      resolve({
        success: false,
        matches: [],
        error: '正規表現の処理中にエラーが発生しました'
      });
    };

    worker.postMessage({ pattern, flags, testString });
  });
}
```

### ユーザーへのフィードバック方法

1. **処理中状態（ローディング）**: Worker実行中はスピナーや「処理中...」のインジケータを表示
2. **タイムアウト通知**: タイムアウト発生時は、既存の `.error` スタイルを使って「処理がタイムアウトしました。パターンを見直してください。」と表示
3. **デバウンス**: ユーザー入力のたびにWorkerを起動するのはコストが高い。300-500msのデバウンスを入力に適用し、不要なWorker起動を防ぐ

## 4. 推奨する実装アプローチ

### アーキテクチャ変更

**現在**: `useMemo`（同期・メインスレッド） → **変更後**: `useEffect` + Web Worker（非同期・別スレッド）

### 推奨する実装ステップ

1. **Workerファイルの作成**: `src/tools/regex-tester/regex.worker.ts`
   - 既存の `testRegex` と `replaceWithRegex` のロジックをそのまま使用
   - `self.onmessage` でメッセージを受信し、処理結果を `self.postMessage` で返す
   - アクション種別（match/replace）をメッセージに含めて分岐

2. **カスタムフックの作成**: `src/tools/regex-tester/useRegexWorker.ts`
   - Worker初期化（useEffect内）とクリーンアップ（terminate）
   - デバウンス（300-500ms）を内蔵
   - タイムアウト管理（推奨: 3秒）
   - `isProcessing` 状態を公開（ローディング表示用）
   - match用とreplace用の結果を別々に管理

3. **Componentの修正**: `src/tools/regex-tester/Component.tsx`
   - `useMemo` を `useRegexWorker` フックに置き換え
   - ローディングインジケータの追加
   - タイムアウトエラーの表示（既存の `.error` スタイルを流用）

4. **logicの維持**: `src/tools/regex-tester/logic.ts`
   - 既存ロジックはそのまま残す（Workerファイルからimportして使用）
   - 既存テストもそのまま維持可能

### 推奨タイムアウト値

- **通常のmatch/replace**: 3秒
- 3秒は、正常なパターンであれば十分であり、ブラウザフリーズを感じるほど長くない値

### Worker再利用 vs 都度生成

- **推奨: 都度生成** — タイムアウト時に `terminate()` で強制停止した後、そのWorkerは再利用できないため、リクエストごとに新しいWorkerを生成する方がシンプル
- Worker生成コストは非常に小さい（数ms以下）ため、パフォーマンスへの影響は無視できる
- デバウンスにより、Workerの生成頻度は十分に抑えられる

### コード変更の影響範囲

| ファイル | 変更内容 |
|---------|---------|
| `regex.worker.ts` | **新規作成** — Workerエントリポイント |
| `useRegexWorker.ts` | **新規作成** — カスタムフック |
| `Component.tsx` | **修正** — useMemo→useRegexWorker、ローディング表示追加 |
| `logic.ts` | **変更なし** — Workerから再利用 |
| `Component.module.css` | **軽微追加** — ローディングインジケータのスタイル |
| `__tests__/logic.test.ts` | **変更なし** — ロジック自体は不変 |
| `__tests__/useRegexWorker.test.ts` | **新規作成** — フックのテスト（任意） |

