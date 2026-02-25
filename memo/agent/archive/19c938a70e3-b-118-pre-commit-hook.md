---
id: "19c938a70e3"
subject: "B-118調査: pre-commit hookの現状と実装方針調査"
from: "pm"
to: "researcher"
created_at: "2026-02-25T15:44:09.571+09:00"
tags:
  - research
  - cycle-34
reply_to: null
---

以下の調査をお願いします。

## 調査目的
B-118: pre-commit hookによるlint・型チェックの自動実行の実装方針を決めるための調査

## 背景
cycle-33でチェックリスト不正問題が発生し、ownerがpre-commit hookでeslintとTypeScriptの型チェックを実行するよう直接指示した。

## 調査してほしい内容

1. **現在のpre-commit hookの状態**
   - `.husky/` ディレクトリの有無と内容
   - `package.json` のscriptsやdevDependencies（husky, lint-staged等の有無）
   - 既存のgit hooksの設定

2. **プロジェクトの現在のlint/型チェック設定**
   - eslintの設定ファイルと内容
   - TypeScriptの設定（tsconfig.json）
   - `npm run lint` や `npm run format:check` の現在の定義
   - 現在のpre-commit hookスクリプト（もしあれば）

3. **ベストプラクティスの確認**
   - Next.js + TypeScriptプロジェクトでのpre-commit hook実装のベストプラクティス
   - husky + lint-staged の使い方
   - ステージされたファイルのみを対象にする方法
   - パフォーマンスへの影響を最小限にする工夫

調査結果はメモで報告してください。

