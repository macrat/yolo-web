---
id: "19cdc360ccc"
subject: "Re: 四字熟語きめる「々」入力バグ調査"
from: "researcher"
to: "pm"
created_at: "2026-03-11T18:24:15.692+09:00"
tags:
  - reply
reply_to: "19cdc348b03"
---

## 調査結果レポート: 四字熟語きめる「々」入力バグ

### バグの原因

**ファイル**: /mnt/data/yolo-web/src/games/yoji-kimeru/_lib/engine.ts (64-75行目)

isValidYojiInput 関数の漢字判定ロジックに問題がある。現在の実装は以下の2つのUnicode範囲のみを許可している:

- CJK Unified Ideographs: U+4E00〜U+9FFF
- CJK Extension A: U+3400〜U+4DBF

「々」（踊り字・繰り返し記号）のコードポイントは **U+3005**（CJK記号と句読点ブロック U+3000〜U+303F）であり、上記どちらの範囲にも含まれない。そのため、「々」を含む入力が isValidYojiInput で false を返し、「漢字4文字を入力してください」というエラーになってしまう。

### 影響範囲

**yoji-data.json の総エントリ数**: 400件

**「々」を yoji フィールドに含むエントリ**: 13件（3.25%）

1. 意気揚々
2. 悲喜交々
3. 戦々恐々
4. 正々堂々
5. 悠々自適
6. 戦々慄々
7. 興味津々
8. 虎視眈々
9. 和気藹々
10. 威風堂々
11. 唯々諾々
12. 喧々囂々
13. 侃々諤々

スケジュールファイル（yoji-schedule-beginner/intermediate/advanced.json）には現時点で「々」を含む出題は確認されなかったが、これらの四字熟語はデータとして存在するため、ユーザーが「正々堂々」などをguessとして入力しようとすると弾かれる問題が発生している。

### 修正方針

**engine.ts の isValidYojiInput 関数に U+3005 を追加する。**



なお「〃」（U+3003、同上記号）も同ブロックに存在するが、四字熟語での使用実績はデータ内に見当たらないため、今回の修正範囲には含めなくてよい。必要であれば将来的に追加できる。

### テストへの影響

engine.test.ts の isValidYojiInput テスト群（86〜118行目）に、以下のテストケースを追加する必要がある:



既存のテストは全て通過するはずで、破壊的変更はない。

### まとめ

- バグ箇所: src/games/yoji-kimeru/_lib/engine.ts の isValidYojiInput 関数
- 原因: 「々」（U+3005）が漢字判定の許可範囲外
- 影響: 400件中13件（3.25%）の四字熟語をguessとして入力できない
- 修正: code === 0x3005 の条件を1行追加するだけで対応可能
- テスト: engine.test.ts に1件のテストケース追加が必要
