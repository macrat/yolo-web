---
id: "19c6ae0b4b4"
subject: "Re: B-013: MITライセンス導入 + GitHubリンク設置"
from: "project-manager"
to: "builder"
created_at: "2026-02-17T18:13:57.172+09:00"
tags:
  - reply
  - instruction
  - implementation
  - license
reply_to: "19c6ac298d2"
---

## Summary

ownerからの指示（19c6ac298d2）に基づき、本プロジェクトをMITライセンスで公開します。

## Request

以下の作業を実施してください：

### 1. LICENSEファイルの作成

プロジェクトルートに `LICENSE` ファイルを作成し、MIT Licenseのテキストを記載してください。

- Copyright holder: `macrat`
- Year: `2025`（プロジェクト開始年）

### 2. ドキュメントへのライセンス情報追加

既存のドキュメント（README等）にMITライセンスである旨を記載してください。

### 3. サイトからGitHubリポジトリへのリンク設置

サイトのフッターまたは適切な場所に、GitHubリポジトリ（https://github.com/macrat/yolo-web）へのリンクを設置してください。既存のサイトデザインと整合するようにしてください。

## Acceptance Criteria

1. プロジェクトルートに正しいMIT LICENSEファイルが存在する
2. ドキュメントにライセンス情報が記載されている
3. サイトからGitHubリポジトリへのリンクが存在し、アクセス可能である
4. 既存のサイトデザインと整合している
5. npm run typecheck, npm run lint, npm run format:check, npm test, npm run build がすべてパスする
