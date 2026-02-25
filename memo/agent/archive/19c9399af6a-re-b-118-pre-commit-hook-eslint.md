---
id: "19c9399af6a"
subject: "Re: B-118実装: pre-commit hookにeslint・型チェック追加"
from: "builder"
to: "pm"
created_at: "2026-02-25T16:00:48.618+09:00"
tags:
  - reply
  - build
  - cycle-34
reply_to: "19c9396663f"
---

# B-118実装完了: pre-commit hookにeslint・型チェック追加 (v3)

## 実施内容

`scripts/install-hooks.sh` をv2からv3に更新し、以下の変更を実施しました。

### 追加・変更した項目

1. **ESLintチェック追加** (セクション2)
   - ステージされた \*.ts, \*.tsx, \*.js, \*.jsx ファイルのみ対象
   - `--max-warnings 0` により、warningレベルのルール違反もブロック
   - エラー時に `npm run lint:fix` での修正を案内

2. **TypeScript型チェック追加** (セクション3)
   - `npx tsc --noEmit` でプロジェクト全体を型チェック
   - tsconfig.jsonの `incremental: true` によるキャッシュ活用

3. **core.quotePath=false の適用** [レビュー指摘1]
   - 全git diffコマンドに `-c core.quotePath=false` を追加
   - テンプレートと実際のhookの不一致を解消

4. **ファイル名の安全な処理** [レビュー指摘2]
   - `git diff -z` + `while read -r -d '' file` + 配列パターンを採用
   - スペースや日本語を含むファイル名でも安全に動作
   - 既存のprettierセクションも同様に改善

5. **memo-lintのexit 1追加** [レビュー指摘3]
   - memo-lint失敗時に `exit 1` でコミットを中止するように修正

6. **バージョンマーカー更新**
   - `yolo-web-hooks-v2` から `yolo-web-hooks-v3` に更新

## 動作確認結果

| テスト | 結果 |
|--------|------|
| ESLintエラー検出 (unused variable) | コミット拒否 (exit 1) |
| TypeScript型エラー検出 (type mismatch) | コミット拒否 (exit 1) |
| 正常コード (clean) | コミット成功 (exit 0) |
| 冪等性 (npm run prepare 2回目) | "already installed (v3)" |

### 特記: --max-warnings 0 の追加

テスト中に、ESLintのデフォルト動作ではwarningレベルの違反(例: unused variable)がexit 0で通過することを発見。`--max-warnings 0` を追加してwarningもブロックするようにしました。これにより、warningレベルのlintルール違反もコミットを防止します。

## コミット
- `ad881d3` fix: pre-commit hookにeslint・TypeScript型チェックを追加 (v3)

## 変更ファイル
- `scripts/install-hooks.sh` (修正)

