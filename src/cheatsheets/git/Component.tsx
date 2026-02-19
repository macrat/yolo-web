import CodeBlock from "@/components/cheatsheets/CodeBlock";

export default function GitCheatsheet() {
  return (
    <div>
      <section>
        <h2 id="setup">初期設定</h2>

        <h3>ユーザー情報の設定</h3>
        <p>コミットに記録される名前とメールアドレスを設定します。</p>
        <CodeBlock
          language="bash"
          code={`# ユーザー名の設定
git config --global user.name "Your Name"

# メールアドレスの設定
git config --global user.email "you@example.com"

# 設定内容の確認
git config --list`}
        />

        <h3>リポジトリの作成</h3>
        <p>新しいリポジトリを作成するか、既存のリポジトリをクローンします。</p>
        <CodeBlock
          language="bash"
          code={`# 新しいリポジトリを作成
git init

# 指定したディレクトリに作成
git init my-project

# リモートリポジトリをクローン
git clone https://github.com/user/repo.git

# ディレクトリ名を指定してクローン
git clone https://github.com/user/repo.git my-dir

# 特定のブランチだけをクローン
git clone -b main --single-branch https://github.com/user/repo.git`}
        />

        <h3>その他の初期設定</h3>
        <CodeBlock
          language="bash"
          code={`# デフォルトブランチ名を main に設定
git config --global init.defaultBranch main

# エディタを設定（例: vim）
git config --global core.editor vim

# 改行コードの自動変換（Windows の場合）
git config --global core.autocrlf true

# 改行コードの自動変換（Mac/Linux の場合）
git config --global core.autocrlf input

# カラー表示を有効にする
git config --global color.ui auto`}
        />
      </section>

      <section>
        <h2 id="basics">基本操作</h2>

        <h3>状態の確認</h3>
        <CodeBlock
          language="bash"
          code={`# ワーキングツリーの状態を表示
git status

# 短い形式で表示
git status -s`}
        />

        <h3>ステージングとコミット</h3>
        <CodeBlock
          language="bash"
          code={`# ファイルをステージングエリアに追加
git add file.txt

# 複数ファイルを追加
git add file1.txt file2.txt

# すべての変更をステージング
git add .

# 変更の一部だけをステージング（対話的に選択）
git add -p

# コミット
git commit -m "コミットメッセージ"

# ステージングとコミットを同時に行う（追跡済みファイルのみ）
git commit -am "コミットメッセージ"

# 直前のコミットメッセージを修正
git commit --amend -m "新しいメッセージ"

# 直前のコミットにファイルを追加（メッセージはそのまま）
git add forgot-file.txt
git commit --amend --no-edit`}
        />

        <h3>差分の確認</h3>
        <CodeBlock
          language="bash"
          code={`# ワーキングツリーとステージングエリアの差分
git diff

# ステージングエリアと最新コミットの差分
git diff --staged

# 2つのコミット間の差分
git diff commit1 commit2

# 特定のファイルの差分
git diff -- file.txt

# 変更の統計のみ表示
git diff --stat`}
        />

        <h3>コミット履歴の確認</h3>
        <CodeBlock
          language="bash"
          code={`# コミット履歴を表示
git log

# 1行ずつ簡潔に表示
git log --oneline

# グラフ付きで表示
git log --oneline --graph --all

# 最新3件のみ表示
git log -3

# 特定ファイルの変更履歴
git log -- file.txt

# 変更内容（パッチ）も表示
git log -p

# 日付で絞り込む
git log --since="2025-01-01" --until="2025-12-31"

# 著者で絞り込む
git log --author="Name"`}
        />
      </section>

      <section>
        <h2 id="branching">ブランチ操作</h2>

        <h3>ブランチの作成と切り替え</h3>
        <CodeBlock
          language="bash"
          code={`# ブランチ一覧を表示
git branch

# リモートブランチも含めて一覧表示
git branch -a

# 新しいブランチを作成
git branch feature/login

# ブランチを切り替え（switch を推奨）
git switch feature/login

# ブランチの作成と切り替えを同時に行う
git switch -c feature/login

# 従来の checkout でも可能
git checkout feature/login
git checkout -b feature/login

# ブランチ名の変更
git branch -m old-name new-name

# ブランチの削除（マージ済みのみ）
git branch -d feature/login

# ブランチの強制削除
git branch -D feature/login`}
        />

        <h3>マージ</h3>
        <p>指定したブランチの変更を現在のブランチに統合します。</p>
        <CodeBlock
          language="bash"
          code={`# feature ブランチを main にマージ
git switch main
git merge feature/login

# マージコミットを必ず作成する（--no-ff）
git merge --no-ff feature/login

# マージを中止する
git merge --abort

# コンフリクトを解消した後にマージを完了
# 1. コンフリクトファイルを編集
# 2. ステージングして
git add resolved-file.txt
# 3. コミット
git commit`}
        />

        <h3>リベース</h3>
        <p>
          現在のブランチのコミットを別のブランチの先端に付け替えます。履歴がきれいになりますが、共有ブランチでは注意が必要です。
        </p>
        <CodeBlock
          language="bash"
          code={`# main の最新を取り込んでリベース
git switch feature/login
git rebase main

# リベースを中止する
git rebase --abort

# コンフリクト解消後にリベースを続行
git add resolved-file.txt
git rebase --continue`}
        />
      </section>

      <section>
        <h2 id="remote">リモート操作</h2>

        <h3>リモートリポジトリの管理</h3>
        <CodeBlock
          language="bash"
          code={`# リモートの一覧を表示
git remote -v

# リモートを追加
git remote add origin https://github.com/user/repo.git

# リモートURLを変更
git remote set-url origin https://github.com/user/new-repo.git

# リモートを削除
git remote remove origin`}
        />

        <h3>取得と送信</h3>
        <CodeBlock
          language="bash"
          code={`# リモートの変更を取得（マージはしない）
git fetch

# 特定のリモートから取得
git fetch origin

# リモートの変更を取得してマージ（fetch + merge）
git pull

# リベースでプル（マージコミットを作らない）
git pull --rebase

# ローカルの変更をリモートに送信
git push

# 初回プッシュ（上流ブランチの設定）
git push -u origin main

# 新しいブランチをリモートに送信
git push -u origin feature/login

# リモートブランチを削除
git push origin --delete feature/login`}
        />
      </section>

      <section>
        <h2 id="undo">取り消し・修正</h2>

        <h3>ファイルの変更を元に戻す</h3>
        <CodeBlock
          language="bash"
          code={`# ワーキングツリーの変更を元に戻す（restore を推奨）
git restore file.txt

# ステージングを取り消す（ファイルの変更は残す）
git restore --staged file.txt

# 従来の checkout でも可能
git checkout -- file.txt`}
        />

        <h3>コミットの取り消し</h3>
        <CodeBlock
          language="bash"
          code={`# 直前のコミットを取り消し（変更はステージングに残る）
git reset --soft HEAD~1

# 直前のコミットを取り消し（変更はワーキングツリーに残る）
git reset HEAD~1
# または
git reset --mixed HEAD~1

# 直前のコミットを完全に取り消し（変更も消える - 注意!）
git reset --hard HEAD~1

# 特定のコミットまで戻す
git reset --hard abc1234`}
        />

        <h3>コミットを打ち消す新しいコミットを作成</h3>
        <p>
          共有ブランチでは reset
          よりも安全です。指定コミットの変更を元に戻す新しいコミットが作られます。
        </p>
        <CodeBlock
          language="bash"
          code={`# 直前のコミットを打ち消す
git revert HEAD

# 特定のコミットを打ち消す
git revert abc1234

# エディタを開かずにコミットメッセージを自動生成
git revert --no-edit HEAD`}
        />

        <h3>スタッシュ（一時退避）</h3>
        <p>
          作業中の変更を一時的に退避して、別のブランチで作業できるようにします。
        </p>
        <CodeBlock
          language="bash"
          code={`# 変更を一時退避する
git stash

# メッセージ付きで退避
git stash push -m "作業中のログイン機能"

# 退避リストを表示
git stash list

# 直近の退避を復元して削除
git stash pop

# 直近の退避を復元（削除しない）
git stash apply

# 特定の退避を復元
git stash apply stash@{1}

# 退避を削除
git stash drop stash@{0}

# すべての退避を削除
git stash clear`}
        />
      </section>

      <section>
        <h2 id="tag">タグ</h2>

        <p>特定のコミットにバージョン番号などの目印をつけます。</p>
        <CodeBlock
          language="bash"
          code={`# タグ一覧を表示
git tag

# 軽量タグを作成
git tag v1.0.0

# 注釈付きタグを作成（推奨）
git tag -a v1.0.0 -m "バージョン1.0.0リリース"

# 特定のコミットにタグを付ける
git tag -a v1.0.0 abc1234 -m "バージョン1.0.0"

# タグをリモートにプッシュ
git push origin v1.0.0

# すべてのタグをプッシュ
git push origin --tags

# タグを削除
git tag -d v1.0.0

# リモートのタグを削除
git push origin --delete v1.0.0`}
        />
      </section>

      <section>
        <h2 id="advanced">高度な操作</h2>

        <h3>cherry-pick</h3>
        <p>特定のコミットだけを現在のブランチに取り込みます。</p>
        <CodeBlock
          language="bash"
          code={`# 特定のコミットを取り込む
git cherry-pick abc1234

# 複数のコミットを取り込む
git cherry-pick abc1234 def5678

# コミットせずに変更だけ取り込む
git cherry-pick --no-commit abc1234

# コンフリクト発生時に中止
git cherry-pick --abort`}
        />

        <h3>bisect（バグの原因コミットを特定）</h3>
        <p>二分探索でバグが混入したコミットを効率的に特定できます。</p>
        <CodeBlock
          language="bash"
          code={`# bisect を開始
git bisect start

# 現在のコミットは「バグあり」
git bisect bad

# 正常に動いていたコミットを指定
git bisect good abc1234

# Git が中間のコミットをチェックアウトするので、
# テストして good / bad を繰り返す
git bisect good   # このコミットは正常
git bisect bad    # このコミットはバグあり

# 原因コミットが特定されたら終了
git bisect reset`}
        />

        <h3>reflog（操作履歴）</h3>
        <p>
          HEAD の移動履歴を表示します。間違えて消したコミットの復旧に使えます。
        </p>
        <CodeBlock
          language="bash"
          code={`# reflog を表示
git reflog

# 間違って reset した場合の復旧例
git reflog
# 戻りたいコミットの SHA を確認して
git reset --hard HEAD@{2}`}
        />

        <h3>worktree（複数の作業ツリー）</h3>
        <p>
          1つのリポジトリに複数のワーキングツリーを作成し、ブランチを切り替えずに同時作業できます。
        </p>
        <CodeBlock
          language="bash"
          code={`# 新しい worktree を作成
git worktree add ../hotfix hotfix-branch

# 新しいブランチとともに worktree を作成
git worktree add -b new-feature ../new-feature

# worktree の一覧を表示
git worktree list

# worktree を削除
git worktree remove ../hotfix`}
        />
      </section>

      <section>
        <h2 id="aliases">よく使うエイリアス設定例</h2>

        <p>
          よく使うコマンドを短縮形で登録しておくと、日々の作業が効率的になります。
        </p>
        <CodeBlock
          language="bash"
          code={`# ステータスの短縮
git config --global alias.st status

# コミットの短縮
git config --global alias.ci commit

# チェックアウトの短縮
git config --global alias.co checkout

# ブランチの短縮
git config --global alias.br branch

# きれいなログ表示
git config --global alias.lg "log --oneline --graph --all --decorate"

# 直前のコミットを表示
git config --global alias.last "log -1 HEAD"

# ステージングの取り消し
git config --global alias.unstage "restore --staged"`}
        />

        <p>
          設定後は <code>git st</code> や <code>git lg</code>{" "}
          のように短縮形で実行できます。
        </p>
      </section>
    </div>
  );
}
