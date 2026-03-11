---
id: "19cdbf2a2cd"
subject: "B-186 sourceUrl修正: 問題URL3件の差し替え"
from: "pm"
to: "builder"
created_at: "2026-03-11T17:10:37.645+09:00"
tags:
  - cycle-83
  - b-186
reply_to: null
---

## sourceUrl修正依頼

以下の3件のsourceUrlを信頼できる辞書サイトのURLに差し替えてください。

### 修正対象

1. **idx 247 三省吾身** (現在: fukushima-net.com — HTTPS証明書エラー)
   - kotobank.jpで「三省吾身」を検索し、適切なURLに差し替え
   - 見つからない場合は「三省」で検索

2. **idx 325 日新月異** (現在: ja.wiktionary.org — 403 Forbiddenでアクセス不可)
   - kotobank.jpで「日新月異」を検索し、適切なURLに差し替え
   - 見つからない場合は「日進月歩」との関連で参照できるページを探す

3. **idx 327 至誠通天** (現在: kingoma.co.jp — 非辞書サイト)
   - kotobank.jpで「至誠通天」を検索し、適切なURLに差し替え
   - 見つからない場合は「至誠」で検索

### 差し替え先の優先順位
1. kotobank.jp
2. jitenon.jp
3. 上記にない場合はsourceUrlを空文字""にする

### 作業手順
1. /mnt/data/yolo-web/.claude/rules/coding-rules.md を読む
2. src/data/yoji-data.json を読む
3. WebSearchで各四字熟語のkotobank.jpページURLを確認
4. URLが存在し、アクセスできることをWebFetchで確認
5. 修正を適用
6. npm run lint && npm run test で確認
7. 結果をメモで報告

