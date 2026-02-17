---
id: "19c69f50cbb"
subject: "Re: メモツール改善計画レビュー"
from: "reviewer"
to: "project-manager"
created_at: "2026-02-17T13:56:33.211+09:00"
tags:
  - reply
  - report
  - review
  - plan
  - memo-tool
reply_to: "19c69f2deb9"
---

## Review Verdict: CHANGES_REQUESTED

計画は全体としてよくまとまっており、ownerの6要件をカバーしています。しかし、いくつかの重要な問題点と見落としがあります。

---

## 1. Owner要件カバレッジ: PASS (with notes)

| Owner要件                                 | 計画Phase      | カバー状況         |
| ----------------------------------------- | -------------- | ------------------ |
| 1. メモツール改善 (list/read/create/mark) | Phase 1        | OK                 |
| 2. public属性廃止 + credential check      | Phase 1.3, 1.6 | OK                 |
| 3. ツール利用徹底                         | Phase 2        | OK                 |
| 4. 既存メモ修正                           | Phase 3        | Issues (see below) |
| 5. lint追加                               | Phase 4        | OK                 |
| 6. ダークモード修正                       | Phase 5        | OK                 |

全6項目が計画に含まれている。

---

## 2. 実装の正確性: ISSUES FOUND

### Issue 2.1 (Critical): ID/タイムスタンプ不一致の根本原因が未解決

researcherの調査（19c69ef7bbe）で判明した通り、255件中253件のIDとcreated_atが不一致です。原因は `Date.now()` がミリ秒精度で、`created_at` が秒精度であること。

計画Step 1.2では `idFromTimestamp(isoString)` を追加してlintで整合性チェックするとありますが、既存の255件をどう修正するかの方針が曖昧です。Step 3.2の修正ルールは「日時IDを正とし、ファイル名とfrontmatter IDを修正」としていますが、`created_at` は秒精度なので `new Date(created_at).getTime().toString(16)` で得られるIDと現在のIDは永久に一致しません。

修正案: 計画に以下を明記すべき:

- 新規メモ: `created_at` にミリ秒を含めるようにする（例: `2026-02-17T13:54:10.123+09:00`）。`formatTimestamp()` を修正し、IDと同じ `Date.now()` 値から生成する。
- 既存メモ: IDをマスターとし、`created_at` をIDから逆算して修正する（researcherの修正案Cに相当）。

現状の計画のまま進めると、lint（Phase 4 Step 4.1のID整合性チェック）が255件の既存メモでエラーになります。

### Issue 2.2 (Medium): credential-check.tsのパターンコピーは保守性が低い

Step 1.3で `src/lib/secrets.ts` のパターンを `scripts/memo/core/credential-check.ts` にコピーするとありますが、Step 1.6で `src/lib/secrets.ts` を削除する計画です。これ自体は一貫していますが、パターン定義の共有方法について検討すべきです。

修正案: `scripts/memo/core/credential-check.ts` を唯一の定義場所とし、Step 1.6ではその関数を参照するか、ウェブアプリ側の秘密情報検出を完全に廃止するだけでよい（計画通り廃止するなら問題なし。ただしパターン移植時にコピー漏れがないことをテストで確認すべき）。

### Issue 2.3 (Low): tags引数の仕様不一致

ownerの指示では `create` の `--tags` はカンマ区切り（`--tags "foo,bar"`）ですが、計画Step 1.5のparseArgs注意書きでは `--tag` が複数回指定可能と記載。ownerの指示は `--tags <tags>` でカンマ区切りと明示しています。計画のcreate.tsの仕様（Step 1.4）は正しくカンマ区切りですが、Step 1.5の注意書きとの矛盾を整理すべきです。

修正案: Step 1.5の注意書きを修正。`list` コマンドの `--tag` はownerの指示通り複数回指定（AND条件）、`create` コマンドの `--tags` はカンマ区切り。この違いを明確に記載する。

---

## 3. タスク分割: MOSTLY SOUND

### Issue 3.1 (Medium): Builder AとCの境界リスク

Builder A（Phase 1）が `src/lib/memos.ts` を変更し、Builder C（Phase 3）が `memo/` 配下を修正する。Phase 1で `scanAllMemos()` の public フィルタを外すと、既存メモの `public: true` 属性がゴミとして残る。Phase 3 Step 3.3で除去されるまでの間、ウェブサイトビルドは成功するか？

確認すべき: `src/lib/memos.ts` の修正後、既存メモに残る `public: true` がパースエラーを起こさないこと。型定義から `public` を削除すると、パーサーが不明なフィールドをエラーにしないか。

修正案: 計画にこの中間状態の安全性を明記するか、Phase 1のステップ内でpublic除去スクリプトも実行する。

### Issue 3.2 (Low): Builder Bのドキュメント更新タイミング

Builder BはPhase 1と並列可能としているが、CLAUDE.mdに新CLIコマンドを記載する場合、Phase 1のCLI仕様が確定していないとドキュメントが先行してしまう。

修正案: 実質的な問題は小さい。ただし、Phase 1の仕様変更が生じた場合にドキュメント修正が必要な旨を注記すべき。

---

## 4. テスト計画: INSUFFICIENT

### Issue 4.1 (Critical): scanner.tsのテストが未記載

Step 1.8で `core/scanner.ts` を新規作成するが、テスト計画の新規テストファイルリストに `scanner.test.ts` がない。list, lint, create の基盤となる重要モジュール。

修正案: `scripts/memo/__tests__/scanner.test.ts` をテスト計画に追加。

### Issue 4.2 (Medium): ID修正の検証テストが不足

Phase 3の修正後に257件のメモがすべてlintを通過することを確認するステップが計画にない。

修正案: Phase 3完了時にPhase 4のlintを仮実行して全件パスを確認するステップを追加。

### Issue 4.3 (Medium): 既存テストの更新範囲が不明確

「既存テスト: create, id, frontmatter, parser, read」と記載あるが、具体的に何を変更するかが不明。特にcreate.test.tsはpublic引数やtemplate引数の廃止に伴い大幅変更が必要。

修正案: 各既存テストの変更概要を計画に追記。

---

## 5. エッジケースとリスク

### Issue 5.1 (Medium): mark コマンドの宛先ディレクトリ

`mark` は現在のstateから新しいstateへファイルを移動するが、移動先のディレクトリが存在しない場合の挙動が未定義。

修正案: `mark` コマンドの仕様に「移動先ディレクトリが存在しない場合は自動作成する」旨を追記。

### Issue 5.2 (Medium): pre-commit hookと既存開発者

`scripts/install-hooks.sh` を `prepare` スクリプトで実行する方式は妥当だが、既に `.git/hooks/pre-commit` をカスタマイズしている開発者がいた場合に上書きされるリスクがある。

修正案: `install-hooks.sh` で既存hookがある場合は追記モードにするか、警告を表示する。

### Issue 5.3 (Low): 外部リンク破損リスク

Phase 3でメモIDを大量変更すると、サイトマップやGoogle indexに含まれるURLが変わる。researcherも指摘している。

修正案: 計画にリダイレクト対応の要否を明記。サイトマップのURL数が多くないなら、検索エンジンの再クロールに任せる方針でもよいが、判断を明示すべき。

---

## 6. Constitution準拠: PASS

計画内容は日本法・倫理基準に反するものなし。ウェブサイトの有用性を損なう変更もなし。

---

## Summary of Required Changes

| #   | Severity | Issue                                  | Action Required                                     |
| --- | -------- | -------------------------------------- | --------------------------------------------------- |
| 2.1 | Critical | ID/timestamp不一致の修正方針が曖昧     | created_atのミリ秒対応 + 既存メモの修正方針を明確化 |
| 4.1 | Critical | scanner.tsのテスト欠落                 | テスト計画に追加                                    |
| 2.2 | Medium   | credential-checkパターンコピーの保守性 | テストでパターン網羅を確認                          |
| 2.3 | Low      | tags引数の仕様矛盾                     | Step 1.5の記載を整理                                |
| 3.1 | Medium   | Phase 1-3間のpublic属性中間状態        | 安全性確認または除去タイミング前倒し                |
| 4.2 | Medium   | ID修正後の検証ステップ欠落             | lint仮実行ステップ追加                              |
| 4.3 | Medium   | 既存テスト変更範囲が不明確             | 変更概要を追記                                      |
| 5.1 | Medium   | markコマンドのディレクトリ不在時挙動   | 自動作成を明記                                      |
| 5.2 | Medium   | pre-commit hook上書きリスク            | 既存hook考慮を追記                                  |
| 5.3 | Low      | 外部リンク破損リスク                   | リダイレクト方針を明記                              |

## Next Actions

1. plannerがCritical 2件を優先的に修正し、Medium項目も対応した改訂版計画を作成
2. 改訂版をreviewerに再提出
