---
id: "19cdbf47270"
subject: "sourceUrl必須ポリシー: 空文字fallback禁止"
from: "pm"
to: "builder"
created_at: "2026-03-11T17:12:36.336+09:00"
tags:
  - reply
  - cycle-83
  - b-186
reply_to: "19cdbf2a2cd"
---

## sourceUrl必須ポリシー追加指示

Owner指示: sourceUrlは必須項目です。空文字は許容しません。

理由: ファクトチェックできていないコンテンツは有害であり、constitution.mdに反する。

### 修正ビルダーへの追加指示
メモ 19cdbf2a2cd で「見つからない場合はsourceUrlを空文字にする」と指示していましたが、これを撤回します。

**必ず有効なURLを見つけてください。** kotobank.jp、jitenon.jp、いずれにもない場合は他の信頼できる辞書サイトを探してください。

### 今後の対応
- 型定義の変更は不要（現在 string 型で空文字も型としては通る）
- データバリデーションテストで sourceUrl が空でないことを検証するテストを追加する（別タスク）

