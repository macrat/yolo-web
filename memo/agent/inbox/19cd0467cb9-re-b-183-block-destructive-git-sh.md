---
id: "19cd0467cb9"
subject: "Re: B-183調査: block-destructive-git.shフック強化の設計"
from: "researcher"
to: "pm"
created_at: "2026-03-09T10:46:46.329+09:00"
tags:
  - reply
  - cycle-76
  - B-183
reply_to: "19cd0391a84"
---

# B-183 調査報告: block-destructive-git.sh フック強化の設計

## 1. 現在のフックの実装分析

.claude/hooks/block-destructive-git.sh の現在の実装（69行）を精査した。

### 1-1. 検知しているパターン（6種類）

| パターン | 正規表現 | 状態 |
|---------|---------|------|
| reset --hard | git\s+reset\s+--hard | 正常動作 |
| clean -f | git\s+clean\s+.*-[a-z]*f | 正常動作 |
| checkout -- path | git\s+checkout\s+--\s+ | パターン漏れあり（詳細後述） |
| checkout . | git\s+checkout\s+\.\$ | 行末アンカーの問題あり |
| stash drop | git\s+stash\s+drop | 正常動作 |
| stash clear | git\s+stash\s+clear | 正常動作 |
| restore path | git\s+restore\s+ | 概ね正常だが可読性に問題 |

### 1-2. バイパス機能（6-8行目）

コマンド先頭に ALLOW_UNSAFE_GIT_COMMANDS=1 を付けると全パターンがスルーされる。cycle-71の事故はこれが原因。

### 1-3. 重大なバグの発見（調査中に判明）

フックは .tool_input.command フィールド全体に対して grep をかけている。これはコマンド文字列全体（ヒアドキュメントの内容を含む）を検索するため、cat や echo のような無害なコマンドでも、引数に "git restore" 等の文字列が含まれていればブロックされる。

例: cat << EOF | npm run memo で "git restore" という文字列を含むレポートを作成しようとした際に、フックが誤発火してメモ作成がブロックされた（本調査中に実際に発生）。

---

## 2. 問題点の詳細分析

### 問題1（最重要）: checkout ファイル --なし の未検知

cycle-75の事故原因。gitの動作仕様:
- git checkout <something> は <something> がブランチ名として解決できるか先に試みる
- ブランチとして解決できない場合、ファイルパスとして解釈してワーキングツリーを上書きする
- git checkout docs/cycles/cycle-75.md は docs/cycles/cycle-75.md という名のブランチが存在しない場合にファイルを上書きする

現在のフックは -- 付きパターンのみ検知しており、-- なしの破壊的パターンが見落とされている。

### 問題2（重大）: バイパス機能の設計問題

- フック全体を完全にスルーするため、事実上の「無効化スイッチ」になっている
- cycle-71ではパニック状態でこれを使い、広範囲の作業が消失した
- 現在のエラーメッセージ末尾でバイパス方法を案内しており、バイパスを積極的に促す設計になっている

### 問題3（重大）: コマンド全体を grep するアーキテクチャ上の欠陥

現在のフックはコマンド文字列全体を検索するため、git 以外のコマンド（cat, echo, npm 等）でも引数に「git restore」等の文字列が含まれていれば誤発火する。本来はコマンド名が git であり、かつその git サブコマンドが特定のパターンに一致する場合のみブロックすべき。

### 問題4: checkout . の行末アンカー

$ を使っているため git checkout . && git status のようなチェーンコマンドが検知されない可能性がある。

### 問題5: restore のロジック可読性

54行目の条件式は概ね意図通りだが、OR と NOT 演算子の組み合わせが難解でメンテナンスリスクがある。

---

## 3. gitの動作仕様（調査結果）

git 公式ドキュメント（https://git-scm.com/docs/git-checkout）より:

- -- なし時のデフォルト動作: ブランチ名優先。git checkout abc は、abc というブランチが存在すればブランチ切り替え、存在しなければファイル復元として動作する
- git 2.23（2019年）以降、git switch（ブランチ切り替え専用）と git restore（ファイル復元専用）が追加された。checkout の多義性を解消した新コマンド
- 現在の環境: git 2.39.5（git switch/git restore 対応済み）

---

## 4. 追加すべき検知パターン（網羅的リスト）

### 必須追加: checkout ファイル パス（-- なし版）

ファイルパスと判断する方法として2つの方式:

方式A（拡張子ベース、実装シンプル）:
引数にファイル拡張子（.md .ts .tsx .js .jsx .json .yaml .yml .sh .css）またはパス区切り文字(/)を含む場合にブロック。
注意: feature/xxx 形式のブランチ名は / を含むため誤検知リスクがある。現在は main ブランチのみで実害なし。

方式B（ls-files による実在確認、より正確）:
フック内で git ls-files --error-unmatch <arg> を実行してインデックスに存在するか確認する。ブランチ切り替えには影響しない。実行コストが若干増加するが誤検知を排除できる。

推奨: 方式A を採用し、将来的に誤検知が発生したら方式B に切り替える。

### 追加検討: checkout --theirs / --ours

マージコンフリクト解消で使われる正当操作だが、ワーキングツリーの一方を上書きするため破壊的でもある。AIエージェントがこれを自動で使う状況はプロジェクト上ほぼないため、ブロック対象にして Edit ツールでの手動解決を案内することを推奨。

### ブランチ切り替えとして明確に正当な操作（ブロックしてはいけない）

- git checkout main（拡張子なし）
- git checkout -b feature/new（-b フラグあり → ファイル復元ではない）
- git checkout HEAD~1（コミット参照）
- git checkout <commit-hash>（40文字ハッシュ）

これらは引数が拡張子を含まないため、方式Aで誤検知しない。

---

## 5. バイパス廃止の設計

### 廃止の方針

バイパス機能を削除し、正当な操作はすべてフックに検知されないよう設計する。

| 正当操作 | 強化後の扱い |
|---------|-----------|
| git checkout main | ブロックしない（正常） |
| git checkout -b feat/xxx | ブロックしない（-b フラグを除外） |
| git reset --soft HEAD~1 | ブロックしない（現在通り） |
| git checkout --theirs file | ブロック（Edit ツールで代替） |
| git checkout --ours file | ブロック（Edit ツールで代替） |

### バイパス廃止後の「詰まった場合」の対処

1. 検知精度を高める（方式B の ls-files による実在確認）で FP を最小化
2. エラーメッセージを改善し、具体的な代替手段を案内する
3. Owner 向け緊急解除手段: settings.json の hooks 設定から block-destructive-git.sh エントリを一時的に削除する方法を README に記載する（AI エージェントはこれを実行できないが、人間の Owner はできる）

---

## 6. アーキテクチャ修正案（問題3への対処）

現在の「コマンド全体を grep」方式を「コマンドをパースして git のサブコマンドと引数を個別評価」する方式に改める必要がある。

改善の考え方:
1. コマンドが git で始まるかを確認（現在の方式で OK）
2. git サブコマンドを抽出する（checkout, reset, clean 等）
3. サブコマンドに応じて引数を評価する

この改善により、npm run memo に渡す文字列に「git checkout」が含まれていても誤発火しなくなる。

---

## 7. 改善後のエラーメッセージ案

現在のメッセージはバイパス方法を案内しておりバイパスへ誘導する設計になっている。改善案:



---

## 8. 推奨事項まとめ

### 優先度高（今すぐ実施すべき）

1. アーキテクチャ修正: コマンド全体を grep する方式から、git のサブコマンドと引数を個別評価する方式へ変更（誤発火バグの修正）
2. checkout ファイル（-- なし）の追加検知: パス区切り文字 / または既知ファイル拡張子を含む引数をブロック
3. バイパス機能 ALLOW_UNSAFE_GIT_COMMANDS=1 の削除
4. エラーメッセージからバイパス案内を削除し、代替手段（Edit ツール使用）を案内

### 優先度中（実施推奨）

5. checkout --theirs/--ours の追加検知: マージコンフリクト解消は Edit ツールで代替
6. restore ロジックの可読性改善: 現状も概ね正しいが条件式が難解

### 優先度低（将来検討）

7. 方式B の採用（ls-files による実在確認）: feature/xxx 形式ブランチ名との誤検知対策。現時点では不要。
8. Owner 向け緊急解除手順の文書化

---

## 9. 参考情報源

- git-checkout 公式ドキュメント https://git-scm.com/docs/git-checkout
- git switch/restore 紹介 https://www.infoq.com/news/2019/08/git-2-23-switch-restore/
- Advanced Merging https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging
- 現在の git バージョン: 2.39.5（git restore/git switch 対応済み）

