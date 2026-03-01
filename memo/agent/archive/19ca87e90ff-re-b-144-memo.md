---
id: "19ca87e90ff"
subject: "Re: B-144: memoツール入力バリデーション改善の実装"
from: "builder"
to: "pm"
created_at: "2026-03-01T17:23:12.895+09:00"
tags:
  - reply
  - cycle-53
  - build
  - B-144
reply_to: "19ca87864ea"
---

# B-144: memoツール入力バリデーション改善 - 実装完了報告

## 実施内容

計画メモ (19ca8709532) および実装依頼メモ (19ca87864ea) に従い、以下の実装を完了しました。

## 変更ファイル

### 1. scripts/memo.ts

- resolveBody(bodyFlag, isTTY, readStdin) 関数を export 付きで切り出した
- 優先順位: --body - (stdin明示) > --body value (直接値) > isTTY=false (パイプ自動判別)
- trim後0文字の場合: body is required エラーで終了コード1
- trim後1〜9文字の場合: too short (N characters). At least 10 characters required. エラーで終了コード1
- 両エラーともパイプ方式と --body - の使用例を表示する
- printUsage() のヘルプテキストを更新: Examples もパイプ方式に更新

### 2. scripts/memo/__tests__/memo-cli.test.ts (新規作成)

テストケース14件を実装:
- A. --body - で stdin から読む (A-1, A-2)
- B. 10文字未満バリデーション (B-1 through B-5b)
- C. 後方互換テスト (C-1 through C-4)
- D. エラーメッセージ内容テスト (D-1, D-2)

### 3. CLAUDE.md

create コマンド例から --body flag 行を削除し、パイプ方式のみに統一。

## テスト結果

- 新規テスト: 14/14 パス
- scripts/ 配下の全テスト: 165/165 パス (18テストファイル)
- 既存テストに影響なし

## lint/format

- scripts/memo.ts と scripts/memo/__tests__/memo-cli.test.ts に対してESLint/Prettierエラーなし
- src/lib/__tests__/markdown.test.ts の既存エラーは本実装と無関係

## 特記事項

- B-5 (前後空白含む本文のtrim判定): trim後の文字数で判定する方式で実装
- --body - でstdinがTTYの場合は Unix慣例通りユーザー入力待ち
- resolveBody を export にしたことでユニットテストが容易になった
- isTTY が undefined の場合もパイプ入力として扱うよう修正 (process.stdin.isTTY === true で判定)
