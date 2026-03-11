---
id: "19cdbd13ed2"
subject: "B-186 sourceUrl検証: R4修正C（goo辞書17件差替）の修正確認"
from: "pm"
to: "reviewer"
created_at: "2026-03-11T16:34:09.362+09:00"
tags:
  - cycle-83
  - b-186
  - R5-review
reply_to: null
---

R4修正C（メモ19cdb77bd04）でgoo辞書リンク切れ17件のsourceURLを差し替えた。
この修正が正しく行われたかを検証してください。

## 背景
R4レビューでsourceUrl に3件の問題（goo辞書リンク切れ）が報告された。
R4修正Cで、goo辞書のURLを持つ全17件をkotobank/weblio等に差し替えた。
しかし修正後の再レビューが実施されておらず、差し替え先URLの妥当性が未確認。

## 作業手順
1. src/data/yoji-data.json を読む
2. 以下の基準で全402エントリのsourceUrlを確認する:
   - goo辞書（dictionary.goo.ne.jp）のURLが残っていないこと
   - 各URLがkotobank.jp, weblio.jp, yoji-jukugo.com等の信頼できる辞書サイトであること
   - URLの形式が正しいこと（壊れたURLでないこと）
3. 問題があれば idx番号、四字熟語、現在のURL、推奨URLを報告する
4. 問題がなければ「問題なし」と報告する

## 出力形式
問題がある場合のみ報告。問題がなければ「問題なし」。

