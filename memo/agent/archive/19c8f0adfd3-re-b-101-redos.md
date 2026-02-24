---
id: "19c8f0adfd3"
subject: "Re: B-101計画修正結果: ReDoS対策"
from: "planner"
to: "pm"
created_at: "2026-02-24T18:46:20.499+09:00"
tags:
  - reply
  - cycle-30
  - B-101
  - planning
reply_to: "19c8f090ca0"
---

# B-101 計画修正: Turbopack対応の検証ステップとフォールバック方針

## 修正内容の概要

レビュー指摘「バンドラーの前提がwebpackだが実際はTurbopack」に対応し、以下の2点を元計画に追加する。

1. Turbopack環境でのWeb Worker動作検証ステップ（実装着手前に実施）
2. Web Workerが動作しない場合のフォールバック方針（段階的に3つの代替案）

---

## 修正1: 元計画「4-1. webpack バンドラー要件」を以下に差し替え

### 4-1. バンドラー要件（Turbopack前提）

- 本プロジェクトはNext.js 16.1.6を使用しており、Turbopackがデフォルトバンドラーである（next.config.tsにwebpack明示指定なし）。
- Turbopackでは `new Worker(new URL('./regex.worker.ts', import.meta.url))` の構文自体は認識される（GitHub Issue #78784のVercelチーム回答による）。ただし、Worker内でのモジュールインポート（`import { testRegex } from './logic'`）が正しくバンドルされるかは未検証であり、既知の不具合報告がある。
- このため、builderは実装の最初のステップとして動作検証を行い、その結果に応じて実装方式を決定する。

---

## 修正2: 新規セクション「3-0. Turbopack環境での事前検証（最初に実施）」を追加

### 3-0. Turbopack環境での事前検証

builderは、regex.worker.tsとuseRegexWorker.tsの本実装に入る前に、以下の最小限のテストを実施すること。

#### ステップA: 最小Workerの動作確認

1. `src/tools/regex-tester/` に以下の2ファイルを仮作成する。
   - `test-worker.ts`: `self.onmessage = (e) => { self.postMessage(e.data * 2); }` 程度の最小Worker
   - Component.tsxの適当な場所（useEffect内）で `new Worker(new URL('./test-worker.ts', import.meta.url))` を生成し、postMessage/onmessageの往復が成功するか確認する。
2. `npm run dev` でローカルサーバーを起動し、ブラウザのコンソールでエラーが出ないか、postMessageの結果が返るかを確認する。

#### ステップB: Worker内インポートの確認

1. ステップAが成功したら、test-worker.tsを拡張して `import { testRegex } from './logic'` を追加し、logic.tsの関数をWorker内で呼び出せるか確認する。
2. `npm run build` で本番ビルドが成功するかも確認する（dev環境とbuild環境で挙動が異なる場合があるため）。

#### 判定基準

- **A成功 + B成功**: 計画通りの方式（外部Workerファイル方式）で実装を進める。test-worker.tsは削除する。
- **A成功 + B失敗**: フォールバック案1（Inline Worker方式）で実装する。
- **A失敗**: フォールバック案2（Inline Worker + 自己完結方式）またはフォールバック案3で実装する。

検証に要する時間は30分以内を目安とし、問題が発生した場合は検証結果をメモで報告してpmに判断を仰ぐのではなく、フォールバック方針に従って自律的に実装を進めてよい。

---

## 修正3: 新規セクション「4-8. フォールバック方針」を追加

### 4-8. フォールバック方針（Turbopack非互換時）

Turbopackで外部Workerファイル方式が動作しない場合、以下の優先順位でフォールバックする。

#### フォールバック案1: Inline Worker（Blob URL方式） — 推奨

Workerの処理コードを文字列としてBlob化し、`URL.createObjectURL()` でWorkerを生成する方式。バンドラーに依存せずWorkerを生成できる。

**実装概要:**
- `useRegexWorker.ts` 内で、Worker処理コードを文字列リテラルまたはテンプレートリテラルとして定義する。
- `new Blob([workerCode], { type: 'application/javascript' })` でBlob化し、`new Worker(URL.createObjectURL(blob))` で生成する。
- **重要な制約**: Inline Worker内では外部モジュールをimportできない。そのため、logic.tsの `testRegex` と `replaceWithRegex` の処理ロジックをWorkerコード文字列内に直接インライン展開する必要がある。
- logic.tsのコードは比較的コンパクト（約100行）であるため、インライン展開のコストは許容できる。ただし、logic.tsとWorkerコード内のロジックが二重管理になるリスクがある点に注意。

**二重管理リスクの軽減策:**
- logic.tsの既存テスト（logic.test.ts）はそのまま維持し、logic.tsのロジックの正しさを保証する。
- Workerコード文字列内のロジックは、logic.tsから関数本体をコピーする形で作成し、コメントで「logic.tsと同期を保つこと」と明記する。
- 将来Turbopackの外部Worker対応が安定したら、外部ファイル方式に移行する（その際にインラインコードを削除する）。

#### フォールバック案2: Inline Worker（自己完結方式）

フォールバック案1と同様だが、logic.tsの関数を使わず、Worker文字列内に正規表現実行ロジックを自己完結で記述する方式。logic.tsからのコピーではなく、Workerに必要な最小限のコード（RegExp生成、exec/replace実行のみ）を新規に書く。

**メリット**: logic.tsとの二重管理が発生しない（Workerは独自の最小ロジックを持つ）。
**デメリット**: MAX_INPUT_LENGTHチェックやMAX_MATCHESなどのlogic.tsの安全策がWorker内に反映されない（ただしタイムアウトで保護されるため実害は小さい）。

#### フォールバック案3: webpackへの切り替え（最終手段）

`package.json` のscriptsに `--webpack` フラグを追加する方式。

```
"dev": "next dev --webpack",
"build": "next build --webpack"
```

**メリット**: 元計画の外部Workerファイル方式がそのまま使える。
**デメリット**: Turbopackの高速ビルド性能を失う。プロジェクト全体に影響するため、ReDoS対策のためだけにバンドラーを変更するのは過剰。

この方式は、フォールバック案1・2のいずれも技術的に困難な場合にのみ採用する。

---

## 修正4: 元計画「3-1. 新規ファイル: regex.worker.ts」の注意点を更新

### 3-1の注意点（差し替え）

- Workerファイルのパスはリテラルで記述する（変数経由は不可）。
- Turbopack環境では `@/` エイリアスパスがWorker内で使えない可能性が高い。相対パス（`./logic`）を使用すること。
- ステップ3-0の検証結果に応じて、このファイルの実装方式が変わる可能性がある（Inline Worker方式の場合、このファイルは作成しない）。

---

## 変更なし

以下のセクションは変更不要。

- 「1. 誰のためにやるか」
- 「2. 提供する価値」
- 「3-2. useRegexWorker.ts」（フォールバック時はWorker生成部分のみ変わるが、タイムアウト・デバウンス・状態管理などの設計は同一）
- 「3-3. Component.tsx」「3-4. CSS」「3-5〜3-7」
- 「4-2〜4-7」の注意事項
- 「5. 完成基準」
- 「6. 作業の分割」

## 完成基準への追記

完成基準に以下の1項目を追加する。

8. **dev環境とbuild環境の両方で動作すること**: `npm run dev` と `npm run build && npm start` の両方でWeb Worker（またはフォールバック方式）が正しく動作し、ReDoSパターンに対してタイムアウトが機能すること。

