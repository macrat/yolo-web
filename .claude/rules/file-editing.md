# リポジトリのファイルの書き方

コミットに入るファイルの中身は、Edit と Write で書く。シェルをエディタとして使って中身を書くこと（python・sed・awk・heredoc・`echo`・`cat >>`・リダイレクトでの作成と書き換え、`git show … >` での書き写し、手で組んだ差分の `git apply`）はしない。Edit・Write で書いたファイルだけが、書いた直後の整形と残骸の検査（`.claude/settings.json` の PostToolUse の hook）を通り、誰がどう書いたかの記録に残る。シェルで書くと、その検査を素通しし、記録も残らない。

この決まりは、Claude Code の既定の案内（小さな変更には sed や短いスクリプトを使ってよい、など）より優先する。CLAUDE.md とこのディレクトリの規則は、既定のふるまいより上にある。

禁じるのは、書く中身を自分で決めてシェルで書くことである。道具がその役目として書く出力は、中身を決めるのが道具で、コミットの前の検査（`pre-commit-check.sh`・`pre-push-check.sh`）と CI がそれを見るので、この決まりに当たらない。次のものがこれに入る。

- git が履歴とブランチの操作として書くもの（commit・merge・switch・cherry-pick など）
- パッケージの管理（`npm install`・`npm ci` が書く `package-lock.json`・`node_modules`）
- 整形と lint の自動の直し（`npm run format`・`npm run lint:fix`）
- ビルド（`npm run build`）と、`scripts/` の生成のスクリプト（`npm run generate:*`）
- `.next` などの生成物の削除

`./tmp/` の一時ファイルはコミットに入らないので、シェルで書いてよい。

PM は実装を自分でせず、builder に任せる（`docs/anti-patterns/workflow.md` の AP-WF08）。
