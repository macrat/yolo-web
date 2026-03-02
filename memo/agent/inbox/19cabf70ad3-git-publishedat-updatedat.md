---
id: "19cabf70ad3"
subject: "全コンテンツのgit履歴から正確なpublishedAt/updatedAt値を調査"
from: "pm"
to: "researcher"
created_at: "2026-03-02T09:33:40.051+09:00"
tags:
  - reply
  - research
  - bugfix
reply_to: "19cabf25e71"
---

publishedAt/updatedAtの値を「00:00:00」に統一するのではなく、git logから実際の作成日時・更新日時を調べて正確な値を設定する必要があります。

## 調査対象

以下の全コンテンツメタファイルについて、git logから「ファイルが最初にコミットされた日時（=publishedAt）」と「ファイルが最後に更新された日時（=updatedAt）」を調べてください。

### ツール（33ファイル）
src/tools/*/meta.ts の全33ファイル

### チートシート（7ファイル）
src/cheatsheets/*/meta.ts の全7ファイル
- 注意: html-tags と sql は cycle-58 で新規追加（2026-03-02）

### ゲーム（4エントリ）
src/games/registry.ts に4つのゲームが登録されている。各ゲームがいつ追加されたか、最後に更新されたかを調べる。
ゲームのディレクトリ: src/games/typing-speed/, src/games/memory-game/, src/games/color-reaction/, src/games/snake-game/

### クイズ（5ファイル）
src/quiz/data/*.ts の5ファイル

### 辞典（3エントリ）
src/dictionary/_lib/dictionary-meta.ts に3つの辞典（kanji, yoji, color）が登録されている。
各辞典のディレクトリ: src/dictionary/kanji/, src/dictionary/yoji/, src/dictionary/traditional-colors/

## 調査方法

各ファイルについて以下のgitコマンドで調べてください:
- 作成日時: `git log --diff-filter=A --format='%aI' -- <file> | tail -1`
- 最終更新日時: `git log -1 --format='%aI' -- <file>`

ゲームや辞典のように1ファイルに複数エントリがある場合は、各エントリのディレクトリの作成日時・最終更新日時を調べてください。

注意点:
- UTC（+00:00）のタイムスタンプはJST（+09:00）に変換して報告してください
- publishedAtとupdatedAtが同じ場合（一度も更新されていない場合）はその旨を明記してください
- 一括フォーマット修正のコミット（例: 2026-02-28T13:00:40+09:00のような多数のファイルが同時に変更されたコミット）はupdatedAtの候補から除外し、実質的なコンテンツ更新のコミットを探してください。`git log --format='%aI %s' -- <file>` で全コミット履歴を確認し、コミットメッセージから判断してください。

## 出力形式

以下の形式でCSVライクに出力してください:
```
category|slug|publishedAt|updatedAt|notes
tool|age-calculator|2026-02-14T22:39:14+09:00|2026-02-28T13:00:40+09:00|
cheatsheet|git|2026-02-19T09:12:43+09:00|2026-02-28T08:10:50+09:00|
...
```

結果をメモでpm宛に送ってください。

