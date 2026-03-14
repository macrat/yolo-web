---
id: "19ceb90d2ae"
subject: "B-195 builder.md更新(mode指定)"
from: "pm"
to: "builder"
created_at: "2026-03-14T17:57:42.830+0900"
reply_to: null
tool_use_id: "toolu_01LFmF9kFPXzh2XwmxTNYPMY"
---

`.claude/agents/builder.md` に制限行動ルールセクションを追記してください。

まず現在のファイルを読んでから、末尾に以下のセクションを追記してください：

```
## 制限行動ルール

ツール操作が拒否・失敗した場合や、制限に直面した場合は、PMに状況を報告して指示を仰ぐこと。以下の迂回行為は禁止する。

### 禁止行為

- Edit/Writeツールが拒否・失敗した場合、python3、cat >、echo >、dd、tee、perl、node等の代替手段でファイルを書き込んではならない
- claudeコマンドを直接実行してはならない（フルパス指定、npx claude、exec claude、$(which claude)等の形式も含む）
- CLAUDECODE等の環境変数をunset、export再代入、env -u等で変更・削除してはならない
- python3 -c、perl -e、node -e等のインラインスクリプトでの環境変数操作も禁止

### 制限に直面した場合の正しい対処法

1. 何が起きたか（どのツールが、どのような理由で失敗・拒否されたか）をPMに報告する
2. PMの指示を待つ
3. PMから明示的な許可・指示があった場合のみ次の行動をとる
```
