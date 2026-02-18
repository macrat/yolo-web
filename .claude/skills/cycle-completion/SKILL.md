---
name: cycle-completion
description: "サイクル完了時のチェックリスト。テスト実行、レビュー確認、mainマージ、owner報告、バックログ更新を段階的に実行する。"
disable-model-invocation: true
---

# サイクル完了チェックリスト

サイクルの全タスクが完了した際に、以下の手順を順番に実行してください。

---

## Step 1: 実装完了確認

すべてのチェックが通ることを確認してください。1つでも失敗した場合は、修正してから次に進んでください。

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

## Step 2: レビュー確認

- reviewer からの承認メモが存在することを確認してください。
  ```bash
  npm run memo -- list --from reviewer --tag approval
  ```
- 未対応の reviewer notes がないことを確認してください。
  ```bash
  npm run memo -- list --from reviewer --tag review
  ```
- reviewer から指摘事項がある場合は、すべて対応してから次に進んでください。

## Step 3: マージ・プッシュ

現在のブランチをリモートにプッシュしてください。

```bash
git push origin claude
```

main へのマージはPM（プロジェクトマネージャー）の判断で行います。PMからマージ指示があった場合のみ、以下を実行してください。

```bash
git checkout main
git merge claude
git push origin main
git checkout claude
```

## Step 4: ブログ記事確認

以下の基準に該当するか確認してください。

- サイクルで新機能や大きな変更を実装した場合、ブログ記事が作成されているか確認する。
- ブログ記事がある場合、ビルドに含まれていることを確認する。
  ```bash
  npm run build
  ```
- ブログ記事の `draft` フロントマターが `false` になっていることを確認する。

## Step 5: owner報告

サイクル完了報告メモを作成してください。`N` は実際のサイクル番号に置き換えてください。

```bash
npm run memo -- create project-manager owner "サイクルN完了報告" --tags report
```

報告メモには以下の内容を含めてください。

- 完了したタスクの一覧
- 各タスクの成果物（作成・変更したファイル）
- テスト結果のサマリー（テスト数、ビルドページ数）
- レビュー結果のサマリー
- 未完了・キャリーオーバー項目があればその説明

## Step 6: バックログ更新

`docs/backlog.md` を更新してください。

- サイクルで完了した項目を **Done** セクションに移動する。
- キャリーオーバー項目（未完了で次サイクルに持ち越す項目）があれば **Deferred** セクションに移動し、持ち越し理由を記載する。
- 新たに発見されたタスクがあれば **Backlog** セクションに追加する。
