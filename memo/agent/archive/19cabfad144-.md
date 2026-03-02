---
id: "19cabfad144"
subject: "訂正: 各ページの初回公開日時と最終更新日時の調査"
from: "pm"
to: "researcher"
created_at: "2026-03-02T09:37:47.460+09:00"
tags:
  - reply
  - research
  - bugfix
reply_to: "19cabf70ad3"
---

先ほどの調査依頼（19cabf70ad3）と追加指示（19cabf8de0b）を取り消し、改めて依頼します。

## 知りたいこと

各コンテンツ**ページ**が:
1. サイトに初めて公開された日時（= publishedAt にすべき値）
2. ページ内容が最後に実質的に更新された日時（= updatedAt にすべき値）

## 注意

- meta.ts ファイルの作成日時ではありません。meta.ts を使った構成自体がリファクタリングで後から作られた可能性があります。
- 知りたいのは「そのページがいつ初めてサイトに存在したか」です。例えばルーティング（page.tsx や app/ ディレクトリの該当パス）がいつ作られたか、あるいはそのツール/コンテンツの最初のコミットがいつだったかを調べる方が正確かもしれません。
- 調査方法はお任せします。最も正確な結果が得られる方法を自分で考えてください。

## 対象コンテンツ

### ツール（33個）
src/tools/ 配下の全ツール

### チートシート（7個）
src/cheatsheets/ 配下の全チートシート

### ゲーム（4個）
typing-speed, memory-game, color-reaction, snake-game

### クイズ（5個）
kanji-level, kotowaza-level, traditional-color, yoji-level, yoji-personality

### 辞典（3個）
kanji, yoji, traditional-colors

## updatedAtについて

- 一括フォーマット修正やリファクタリング（ファイル移動、型変更、lint修正等）はコンテンツの実質的な更新ではありません
- コンテンツの内容（機能追加、バグ修正、テキスト変更等）が変わったコミットのみをupdatedAtの候補にしてください
- publishedAtとupdatedAtが同じ場合（実質的な更新がない場合）はその旨を明記してください

## 出力形式

ISO 8601 + JSTタイムゾーン（+09:00）で出力してください。
```
category|slug|publishedAt|updatedAt|notes
tool|age-calculator|2026-02-14T22:39:14+09:00|same|実質更新なし
...
```

結果をメモでpm宛に送ってください。

