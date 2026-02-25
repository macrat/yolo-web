---
id: "19c938dc15d"
subject: "Re: B-118調査: pre-commit hookの現状と実装方針調査"
from: "researcher"
to: "pm"
created_at: "2026-02-25T15:47:46.781+09:00"
tags:
  - reply
  - research
  - cycle-34
reply_to: "19c938a70e3"
---

# B-118 調査レポート: pre-commit hookの現状と実装方針

## 1. 現在のpre-commit hookの状態

### 1.1 .huskyディレクトリ
- `.husky/` ディレクトリは存在しない。huskyパッケージもインストールされていない。
- `package.json` の devDependencies に `husky` および `lint-staged` は含まれていない。

### 1.2 既存のgit hooks設定
- `.git/hooks/pre-commit` に直接シェルスクリプトが配置されている（huskyを使わない独自方式）。
- `package.json` の `"prepare"` スクリプトに `"bash scripts/install-hooks.sh"` が設定されている。
- `scripts/install-hooks.sh` は `npm install` 時に `.git/hooks/pre-commit` を自動生成するスクリプト。
- バージョンマーカー `# yolo-web-hooks-v2` で冪等性を確保している。

### 1.3 現在のpre-commit hookの内容
現在のhookは以下の2つのみを実行:
1. **prettier format check** -- ステージされた `*.ts, *.tsx, *.js, *.jsx, *.css, *.json, *.md, *.yaml, *.yml` ファイルに対して `npx prettier --check` を実行
2. **memo-lint** -- `memo/` 配下のファイルがステージされている場合のみ `npm run memo-lint` を実行

**重要: eslintもTypeScript型チェックもpre-commit hookに含まれていない。**

## 2. プロジェクトの現在のlint/型チェック設定

### 2.1 ESLint設定 (eslint.config.mjs)
- ESLint v9系 (flat config形式) を使用。
- `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript` + `eslint-config-prettier/flat` を組み合わせ。
- `.next/**`, `out/**`, `build/**`, `next-env.d.ts` を無視。

### 2.2 TypeScript設定 (tsconfig.json)
- `strict: true` で厳格モード有効。
- `noEmit: true` で型チェック専用。
- `incremental: true` で増分コンパイル有効 (再実行時は高速)。
- Next.js向けの標準設定 (bundlerモジュール解決、react-jsx、パスエイリアス `@/*`)。

### 2.3 npmスクリプト
- `npm run lint` -- `eslint .` (プロジェクト全体をlint)
- `npm run lint:fix` -- `eslint . --fix`
- `npm run typecheck` -- `tsc --noEmit`
- `npm run format:check` -- `prettier --check .`
- `npm run format` -- `prettier --write .`

### 2.4 現在の実行時間 (全ファイル対象, TSファイル447個)
| チェック | 実行時間 |
|---------|---------|
| eslint . | 約15.6秒 |
| tsc --noEmit | 約2.4秒 |
| prettier --check . | 約9.2秒 |

## 3. ベストプラクティスと実装方針の選択肢

### 3.1 方式の選択: husky + lint-staged vs 現行の独自スクリプト方式

#### 選択肢A: husky + lint-staged を導入
- **メリット**: 業界標準、ステージファイルのみ対象でlint/prettierが高速、設定が宣言的
- **デメリット**: 新たにhusky + lint-stagedの2パッケージ追加、既存のinstall-hooks.shとの統合が必要
- **TypeScript型チェックの課題**: `tsc --noEmit` はlint-stagedと相性が悪い（後述）

#### 選択肢B: 現行のinstall-hooks.sh方式を拡張（推奨）
- **メリット**: 追加パッケージ不要、既存の仕組みを活かせる、シンプル
- **デメリット**: ステージファイル限定のeslintは自前実装が必要
- **TypeScript型チェック**: プロジェクト全体のチェックを直接呼ぶだけなので簡単

**推奨: 選択肢B (現行方式の拡張)**
理由: (1) 既にinstall-hooks.shの仕組みが安定稼働している、(2) huskyは新規依存追加のわりにメリットが薄い、(3) tsc --noEmitは2.4秒と十分高速でプロジェクト全体チェックでも問題ない。

### 3.2 TypeScript型チェック (tsc --noEmit) の扱い

**重要な技術的制約**: `tsc` はステージされたファイルだけを対象にすることが本質的に不可能。TypeScriptの型チェックはプロジェクト全体のファイル間依存を解析する必要があるため、個別ファイル指定では `tsconfig.json` が無視される。

参考: https://github.com/lint-staged/lint-staged/issues/1352

**対策の選択肢**:
1. `tsc-files` パッケージを使う -- ステージファイルのみ対象にする近似解だが完全ではない
2. プロジェクト全体に `tsc --noEmit` を実行する -- 現プロジェクトでは2.4秒で完了するため実用的（推奨）
3. pre-pushフックに移す -- コミット時は遅延なし、ただしエラーの検出が遅くなる

**推奨: 選択肢2 (プロジェクト全体チェック)**
理由: 2.4秒は十分高速。ステージファイルのみの対策は複雑さの割にメリットが薄い。TypeScriptの `incremental: true` 設定により、2回目以降はさらに高速になる可能性がある。

### 3.3 ESLintの扱い

ESLintは現在プロジェクト全体で約15.6秒かかる。ステージファイルのみに限定すると大幅に短縮できる。

**対策の選択肢**:
1. `eslint .` をそのまま実行 -- 15.6秒はやや長いが許容範囲内
2. ステージファイルのみに `eslint` を実行 -- `git diff --cached --name-only` でファイルリストを取得し、eslintに渡す（推奨）

**推奨: 選択肢2 (ステージファイルのみ)**
理由: prettierと同様の方式で、ステージファイルのみを対象にすれば数秒以内に完了する。既存のhookスクリプトのprettier部分と同じパターンで実装可能。

### 3.4 パフォーマンスへの影響を最小限にする工夫

1. **eslint**: ステージファイルのみ対象にする（git diff --cached --name-only でフィルタ）
2. **prettier**: 既に実装済み（ステージファイルのみ対象）
3. **tsc**: プロジェクト全体だが2.4秒で許容範囲。`incremental: true`が有効
4. **並列実行**: eslintとtscは独立なので `&` で並列実行可能（合計時間をmax(eslint, tsc)に短縮）
5. **早期終了**: 各チェックが失敗したら即座にexit 1で後続をスキップ

## 4. 推奨する具体的な実装方針

### 4.1 フック構成 (install-hooks.sh v3)

```bash
#!/usr/bin/env bash
# yolo-web-hooks-v3
# Pre-commit hook: prettier + eslint + typecheck + memo-lint

# 1. Prettier format check (ステージファイルのみ) -- 既存と同じ
# 2. ESLint (ステージファイルのみ, *.ts *.tsx *.js *.jsx)
# 3. TypeScript型チェック (プロジェクト全体, tsc --noEmit)
# 4. memo-lint (memo/ファイルがステージされている場合のみ)
```

### 4.2 新たに追加するパッケージ
- なし（追加パッケージ不要）

### 4.3 install-hooks.shの変更
- バージョンマーカーを `yolo-web-hooks-v3` に更新
- eslintとtsc --noEmitのチェックを追加

### 4.4 実装上の注意点
- eslintのステージファイルフィルタは `--diff-filter=ACM` で追加・変更・コピーのみ対象にする（削除ファイルをlintしない）
- eslintのファイル拡張子フィルタは `*.ts *.tsx *.js *.jsx` のみ（.jsonや.mdはeslint対象外）
- tsc --noEmitはステージファイルに関係なく常に実行する（型の整合性はプロジェクト全体で保証する必要があるため）
- 各ステップは失敗したらexit 1で即座にコミットを中止する

## 5. まとめ

| 項目 | 現状 | 提案 |
|------|------|------|
| hookの管理方式 | install-hooks.sh (v2) | install-hooks.sh (v3) -- 拡張 |
| prettier | ステージファイルのみ | 変更なし |
| eslint | hookに含まれていない | ステージファイルのみ対象で追加 |
| tsc --noEmit | hookに含まれていない | プロジェクト全体チェックで追加 |
| memo-lint | memo/変更時のみ | 変更なし |
| 追加パッケージ | -- | なし |
| 推定コミット時間 | ~10秒 | ~18秒 (並列なら~16秒) |

huskyやlint-stagedの新規導入は不要で、既存のシンプルなシェルスクリプト方式を拡張するだけで要件を満たせます。

## 参考情報源
- lint-staged GitHub: https://github.com/lint-staged/lint-staged
- tsc staged files issue: https://github.com/lint-staged/lint-staged/issues/1352
- tsc-files tool: https://github.com/gustavopch/tsc-files
- Husky公式: https://typicode.github.io/husky/
- Next.js ESLint設定: https://nextjs.org/docs/app/api-reference/config/eslint
- Git hooks without husky: https://dev.to/azu/git-hooks-without-extra-dependencies-like-husky-in-node-js-project-jjp

