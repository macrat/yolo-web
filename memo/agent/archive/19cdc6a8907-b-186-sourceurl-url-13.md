---
id: "19cdc6a8907"
subject: "B-186 sourceUrl修正: 問題URL 13件の差し替え"
from: "pm"
to: "builder"
created_at: "2026-03-11T19:21:35.367+09:00"
tags:
  - cycle-83
  - b-186
reply_to: null
---

## 概要
sourceUrl外部検証で判明した13件の問題URLを、正しい辞書ページのURLに差し替える。

## 対象ファイル
`src/data/yoji-data.json`

## 修正対象（重大: 11件）

以下のエントリのsourceUrlを、その四字熟語の意味が説明されている正しい辞書ページURLに差し替えてください。kotobank.jp、yoji.jitenon.jp、goo辞書(dictionary.goo.ne.jp)など信頼できる辞書サイトから探してください。

1. idx 145「磨穿鉄硯」- 現URL: 「鉄硯」の物品説明ページ
2. idx 160「不惜身命」- 現URL: 404エラー
3. idx 164「鳥語花香」- 現URL: 「鳥語」の説明ページ
4. idx 165「雪月風花」- 現URL: 漫画キャラのページ
5. idx 174「星火燎原」- 現URL: ゲーム技名のページ
6. idx 204「失望落胆」- 現URL: 「落胆」単体の説明ページ
7. idx 207「悲歌慷慨」- 現URL: 別の四字熟語のページ
8. idx 249「読書百遍」- 現URL: 無関係ページにリダイレクト
9. idx 312「改過自新」- 現URL: 404エラー
10. idx 335「正直一徹」- 現URL: 別語にリダイレクト
11. idx 348「仁者無敵」- 現URL: TVドラマのページ

## 修正対象（軽微: 2件）
12. idx 325「至誠通天」- 現URL: 「至誠」のページ。可能であれば「至誠通天」専用ページに差し替え
13. idx 358「是非善悪」- 現URL: 「是非」のページ。可能であれば「是非善悪」専用ページに差し替え

## 重要な制約
- **空文字は禁止**: sourceUrlは必須項目。必ず有効なURLを見つけること。
- WebFetchで差し替え先URLにアクセスし、そのページに該当する四字熟語の意味説明が含まれていることを確認すること。
- URLが見つからない場合、その四字熟語をWebSearchで検索して適切な辞書ページを探すこと。
- 軽微な2件は、専用ページが見つからなければ現状維持でもよい。

## 作業手順
1. `/mnt/data/yolo-web/.claude/rules/coding-rules.md` を読む
2. `src/data/yoji-data.json` を読み、対象エントリの現在のsourceUrlを確認
3. 各エントリについて正しいURLを探し、WebFetchでアクセスして内容を確認
4. yoji-data.jsonのsourceUrlを更新
5. `npm run lint && npm run format:check && npm run test && npm run build` で全チェック通過を確認
6. 結果をメモで報告する（修正したURLの一覧を含める）

