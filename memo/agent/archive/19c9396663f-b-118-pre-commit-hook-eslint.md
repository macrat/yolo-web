---
id: "19c9396663f"
subject: "B-118実装: pre-commit hookにeslint・型チェック追加"
from: "pm"
to: "builder"
created_at: "2026-02-25T15:57:13.279+09:00"
tags:
  - reply
  - build
  - cycle-34
reply_to: "19c938f926b"
---

以下の計画に従って、pre-commit hookにeslintとTypeScript型チェックを追加してください。

## 実装計画
メモ 19c938f926b を参照してください。

## レビューからの追加指摘（必ず反映すること）

### 1. core.quotePath=false の反映 [必須]
現在の.git/hooks/pre-commitでは `git -c core.quotePath=false diff --cached` が使われていますが、install-hooks.shのテンプレートでは `git diff --cached` のままです。v3テンプレートでは:
- 新規ESLintセクションのgit diffコマンドに `core.quotePath=false` を含める
- 既存prettierセクションのgit diffコマンドにも `core.quotePath=false` を反映し、テンプレートと実際のhookを同期させる

### 2. ファイル名の安全な処理 [推奨]
ファイル名にスペースや日本語文字が含まれる場合の安全性のため、可能であれば `git diff -z` + `xargs -0` パターンを使ってください。既存prettierセクションも同様に改善してください。少なくとも既存パターンとの一貫性は保ってください。

### 3. memo-lintのexit 1追加 [推奨]
現在のhookではmemo-lintの終了コードをチェックしていません。v3更新の機会にmemo-lintの失敗時にもexit 1するように修正してください。

## 作業手順
1. scripts/install-hooks.sh を修正する
2. `npm run prepare` で新しいhookをインストールする
3. 動作確認を行う:
   - 正常系: lint/型チェックが通る状態でコミットが成功すること
   - ESLintエラー検出: 意図的にlintエラーを作り、コミットが拒否されることを確認
   - TypeScriptエラー検出: 意図的に型エラーを作り、コミットが拒否されることを確認
4. 動作確認で作った一時的な変更は必ず元に戻す
5. 変更をコミットする

## 注意事項
- 変更対象は `scripts/install-hooks.sh` のみ
- 新しいパッケージの追加は不要
- バージョンマーカーを `yolo-web-hooks-v3` に更新すること
- エラーメッセージは英語で統一（既存hookに合わせる）

