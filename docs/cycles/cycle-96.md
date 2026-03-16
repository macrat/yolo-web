---
id: 96
description: メモシステム廃止ステップ5 — スクリプト・memoディレクトリの削除
started_at: "2026-03-16T19:22:10+09:00"
completed_at: null
---

# サイクル-96

メモシステム廃止の最終ステップ。リポジトリ内に残っているメモ関連のスクリプト、ディレクトリ、設定をすべて削除し、メモシステムの完全廃止を完了させる。

## 実施する作業

- [ ] タスク1: メモ関連スクリプト・ディレクトリの削除
- [ ] タスク2: package.json・install-hooks.shからメモ関連設定の削除
- [ ] タスク3: その他のメモ関連記述の整理・削除
- [ ] タスク4: 削除後のビルド・テスト確認とGitHubリダイレクトURL確認

## 作業計画

### 目的

メモシステムの完全廃止の最終ステップとして、リポジトリ内に残存するメモ関連のコード（スクリプト、ツール）、データ（memo/ディレクトリ全体）、設定（package.jsonのスクリプト定義、pre-commitフックのmemo-lint処理）、ドキュメント参照（docs/README.mdのmemo-spec.md参照、docs/archive/memo-spec.md）をすべて削除する。この作業は内部のクリーンアップであり、来訪者向けの機能への影響はない（/memosページのGitHubリダイレクトはステップ2-3で対応済み）。

### 作業内容

#### タスク1: メモ関連スクリプト・ディレクトリの削除

builderに以下のファイル・ディレクトリの削除を実施させる:

- `scripts/memo/` ディレクトリ全体（commands/, core/, **tests**/, types.ts）
- `scripts/spawner/` ディレクトリ全体（index.ts, logger.ts, process-manager.ts, prompt-loader.ts, types.ts, watcher.ts, README.md, **tests**/）
- `scripts/memo.ts`（メモCLIツールのエントリポイント）
- `scripts/memo-lint.ts`（メモのlintスクリプト）
- `scripts/spawner.ts`（spawnerのエントリポイント）
- `memo/` ディレクトリ全体（agent/inbox 1件、agent/archive 4,739件、owner/archive 260件）
- `docs/archive/memo-spec.md`（廃止済みメモシステムの仕様書。docs/直下からは既に削除済みだが、archiveに残存している）

builderには `.claude/rules/coding-rules.md` を直接読ませること。

完了後: reviewerにレビューを依頼 → 指摘対応 → 中間コミット

#### タスク2: package.json・install-hooks.shからメモ関連設定の削除

builderに以下の編集を実施させる:

**package.json:**

- 20行目 `"memo": "tsx scripts/memo.ts"` を削除
- 21行目 `"spawner": "tsx scripts/spawner.ts"` を削除
- 22行目 `"memo-lint": "tsx scripts/memo-lint.ts"` を削除

**scripts/install-hooks.sh:**

- 2行目のコメント `# Install pre-commit hooks: prettier format check + eslint + tsc + memo-lint.` からmemo-lintの言及を除去
- 24行目のコメント `# Pre-commit hook: prettier format check + eslint + tsc type check + memo-lint` からmemo-lintの言及を除去
- 67-80行目のmemo-lintブロック全体を削除:

  ```
  # --- 4. memo-lint when memo/ files are staged ---
  MEMO_FILES=()
  while IFS= read -r -d '' file; do
    MEMO_FILES+=("$file")
  done < <(git -c core.quotePath=false diff -z --cached --name-only -- 'memo/' || true)

  if [ ${#MEMO_FILES[@]} -gt 0 ]; then
    echo "memo/ files staged — running memo-lint..."
    if ! npm run memo-lint; then
      echo ""
      echo "ERROR: memo-lint failed. Fix the issues above, then re-stage."
      exit 1
    fi
  fi
  ```

- フック全体のバージョンマーカーを `yolo-web-hooks-v3` から `yolo-web-hooks-v4` に更新（フックの再インストールをトリガーするため）。MARKER変数（9行目）、grepチェック（15行目）、フック内のコメント（23行目）の3箇所を更新する。

builderには `.claude/rules/coding-rules.md` を直接読ませること。

完了後: reviewerにレビューを依頼 → 指摘対応 → 中間コミット

#### タスク3: その他のメモ関連記述の整理・削除

builderに以下の編集を実施させる:

**docs/README.md:**

- 41行目 `` `memo-spec.md` — 廃止されたメモシステムの仕様書 `` の行を削除

**docs/backlog.md:**

- B-198の `Owner指示メモ: memo/agent/inbox/19cf104dff5-.md` の参照を、GitHub固定コミットURL `https://github.com/macrat/yolo-web/blob/e70c34b/memo/agent/inbox/19cf104dff5-.md` に更新する。メモファイル削除後もこのURLでGitHub上の内容を閲覧できる。

builderには `.claude/rules/coding-rules.md` を直接読ませること。

完了後: reviewerにレビューを依頼 → 指摘対応 → 中間コミット

#### タスク4: 削除後のビルド・テスト確認とGitHubリダイレクトURL確認

以下の確認を実施する:

1. `npm run lint && npm run format:check && npm run test && npm run build` を実行し、すべて成功することを確認する。
2. GitHub固定コミットURL `https://github.com/macrat/yolo-web/blob/e70c34b/memo/agent/inbox/19cf104dff5-.md` に実際にアクセスし、メモの内容が閲覧できることを確認する。
3. `/memos` ページのGitHubリダイレクト（ステップ2-3で実装済み。コミットハッシュ `6f35080` を使用）が引き続き正常に動作することを確認する。リダイレクトの実装は `src/app/memos/` 配下にあり、今回の削除対象ではないため問題ないはずだが、念のため確認する。
4. `scripts/install-hooks.sh` を実行して、v4のフックが正しくインストールされることを確認する。

問題があれば修正する。

### 検討した他の選択肢と判断理由

**docs/archive/memo-spec.mdの扱い:**

- **選択肢A: 削除する（採用）** — Owner指示で「/docs/memo-spec.mdを削除する」とあり、archiveに移動済みのファイルも含めて完全削除する。メモシステムの全経緯はブログ記事（cycle-95で執筆済み）に記録されており、仕様書をarchiveに残す必要はない。
- **選択肢B: archiveに残す** — 「将来の参照のために残す」案。しかし、メモシステムは完全廃止するというOwner方針に基づき、関連ファイルは完全に除去する方が適切。必要であればgit履歴から参照できる。

**install-hooks.shのバージョンマーカー更新:**

- **選択肢A: v4に更新する（採用）** — memo-lintブロックを削除した新しいフックをインストールするためにはバージョンマーカーを更新する必要がある。既存のv3フックがインストールされている環境では、マーカーが変わらないと上書きされない。
- **選択肢B: マーカーを変更しない** — 既存のフックが更新されず、削除済みのmemo-lintを呼び出すフックが残り続ける。フック実行時にmemo/ディレクトリのファイルがステージされることはもうないので実害は小さいが、不要なコードを残すのは不適切。

**backlog.mdのメモ参照の扱い:**

- **選択肢A: GitHub固定URLに更新する（採用）** — メモファイル削除後もOwner指示の原文を参照できるようにする。コミットハッシュ `e70c34b` はメモファイルが存在する最後のコミットではなく、メモが追加されたコミットだが、ファイルが存在しているためURLとして有効。
- **選択肢B: 参照を削除する** — B-198の完了後にDoneセクションに移動されるため、参照の重要性は下がる。ただし、削除前にURLを更新しておく方が記録として正確。

### 計画にあたって参考にした情報

- Owner指示メモ `memo/agent/inbox/19cf104dff5-.md`（コミット `e70c34b` で確認）
- `docs/cycles/cycle-94.md`（ステップ2-3の作業内容。GitHubリダイレクト用コミットハッシュ `6f35080` の情報）
- `docs/cycles/cycle-93.md`（ステップ1の作業内容）
- `docs/cycles/cycle-95.md`（ステップ4の作業内容。ブログ記事の執筆）
- `package.json` 20-22行目（削除対象のスクリプト定義）
- `scripts/install-hooks.sh`（削除対象のmemo-lintブロック、バージョンマーカーの仕組み）
- `docs/README.md` 41行目（memo-spec.mdの参照）
- `docs/backlog.md`（B-198のOwner指示メモ参照）
- `docs/archive/memo-spec.md`（archiveに残存するメモ仕様書の存在確認）

## レビュー結果

計画レビュー:

- 1回目: 指摘なし、承認

## キャリーオーバー

## 補足事項

- 今回の作業は内部のクリーンアップであり、来訪者向けのコンテンツや機能への影響はない。ブログ記事の執筆基準（ターゲットユーザーへの価値）を満たさないため、ブログ記事は作成しない。
- `src/app/memos/` 配下のGitHubリダイレクト実装はステップ2-3で対応済みであり、今回の削除対象ではない。
- `.claude/rules/`, `.claude/skills/` にメモ関連記述がないことは確認済み。
- `.gitignore` にメモ関連記述がないことは確認済み。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
