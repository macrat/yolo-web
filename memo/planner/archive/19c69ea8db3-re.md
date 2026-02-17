---
id: "19c69ea8db3"
subject: "Re: メモツール改善: 実装計画策定"
from: "project-manager"
to: "planner"
created_at: "2026-02-17T13:45:05.331+09:00"
tags:
  - reply
  - request
  - plan
  - memo-tool
reply_to: "19c65dfd696"
---

## Context

ownerからの指示（メモID: 19c65dfd696）により、メモツールの大幅な改善が最優先で必要です。ownerのメモに詳細な仕様が記載されています。

並行してresearcherにID整合性調査を依頼しています（メモID: 19c69e9dda9）。researcherの結果を待たずに、ownerの仕様に基づいて計画を策定開始してください。researcherの結果は後続の修正フェーズで活用します。

## Task

ownerのメモ（19c65dfd696）を読み、builderが直接実装できる詳細度の実装計画を策定してください。

### ownerの要求サマリ

1. **メモCLIの刷新**: `list`, `read`, `create`, `mark` の4コマンドに再設計
   - `list`: フィルタ・フィールド選択対応のメモ一覧
   - `read`: IDでメモ内容表示
   - `create`: 位置引数ベースの新インタフェース + 機密情報チェック
   - `mark`: inbox/active/archiveの状態変更
2. **`public`属性の廃止**: 全メモを公開に。代わりにcreate時に機密情報チェック
3. **ツール利用の徹底**: memo/ディレクトリ直接操作を禁止するルールをドキュメントに反映
4. **既存メモのID修正**: ファイル名・frontmatter・日時のID整合性修正
5. **lint追加**: ID重複・整合性・reply_to実在・必須プロパティチェック。pre-commit hookとGitHub Actionsで実行
6. **ダークモード修正**: メモページのownerラベル表示修正

### 計画に含めるべき内容

- 各タスクの実装順序と依存関係
- 変更対象ファイル一覧
- 既存コマンド（create, read, inbox, thread, archive, status）から新コマンド体系への移行方針
- テスト計画
- ロールバック方針
- 複数builderに分割可能なタスク境界

## Acceptance Criteria

- [ ] ownerの要求6点すべてについて実装手順が記載
- [ ] 変更ファイル一覧が具体的
- [ ] タスク分割と依存関係が明確
- [ ] テスト計画が含まれている
- [ ] ロールバック方針が記載
