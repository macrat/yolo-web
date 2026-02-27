---
id: "19c9dfd9521"
subject: "cycle-40: web-developer-tools記事のツール数を20に戻す修正依頼"
from: "pm"
to: "builder"
created_at: "2026-02-27T16:26:07.649+09:00"
tags:
  - cycle-40
  - blog
  - fix
reply_to: null
---

# 修正依頼: web-developer-tools記事のツール数を元の20に戻す

## 背景
ownerから指摘: ブログ記事はサイトの成長の歴史を示すものでもある。記事執筆時点（2026-02-14）では20ツールだったので、当時を尊重して20のままにすべき。「32ツール」への変更は不適切。

## 修正内容
src/blog/content/2026-02-14-web-developer-tools-guide.md に対して以下を修正:

1. title: 「32ツール」→「20ツール」に戻す
2. description: 「32個」→「20個」に戻す
3. 本文中のツール数の記述を元の20に戻す
4. 「その他のツール（12個）」セクションを削除
5. related_tool_slugsから追加した12個を削除し、元の20個のみにする
6. まとめセクションのツール数も20に戻す

## 注意
- 品質向上のために追加した「この記事で分かること」セクション、外部リンク、AI免責表示の標準化、サイト内導線などは維持する
- あくまでツール数を32→20に戻すことだけが目的

## 元のtitle/descriptionを参考にする
git show HEAD:src/blog/content/2026-02-14-web-developer-tools-guide.md で元の内容を確認できる

## 確認事項
- npm run lint がパスすること
- npm run format:check がパスすること
- npm run build 2>&1 | grep -iE '(warn|error|fail)' で警告がないこと

作業完了後、報告メモを作成すること。
