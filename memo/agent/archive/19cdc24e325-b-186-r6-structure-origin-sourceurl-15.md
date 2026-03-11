---
id: "19cdc24e325"
subject: "B-186 R6修正: structure/origin/sourceUrl 15件"
from: "pm"
to: "builder"
created_at: "2026-03-11T18:05:30.917+09:00"
tags:
  - cycle-83
  - b-186
reply_to: null
---

## B-186 R6修正: structure/origin/sourceUrl 15件

src/data/yoji-data.json に以下の修正を適用してください。

### structure修正（9件）
- idx 15 奮闘努力: "対句"→"組合せ"
- idx 50 博学多才: "組合せ"→"対句"
- idx 51 温故知新: "組合せ"→"対句"
- idx 58 博覧強記: "組合せ"→"対句"
- idx 125 自由自在: "対句"→"組合せ"
- idx 142 刻苦勉励: "対句"→"組合せ"
- idx 156 八面六臂: "組合せ"→"対句"
- idx 166 柳緑花紅: "組合せ"→"対句"
- idx 209 適材適所: "組合せ"→"対句"

### origin修正（1件）
- idx 196 冷汗三斗: "日本"→"中国"

### sourceUrl修正（5件）
以下の5件はURLが不適切です。WebSearchで正しいURLを見つけて差し替えてください。
- idx 191 戦々慄々: idiom-encyclopedia.comを使用 → kotobank.jpまたはjitenon.jpに差し替え
- idx 199 沈着冷静: 「沈着」単体のページ → 「沈着冷静」のページに差し替え
- idx 261 疑問氷解: 「氷解」のページ → 「疑問氷解」のページに差し替え
- idx 264 学而不厭: 中日辞典パスを使用 → 日本語辞書URLに差し替え
- idx 325 日新月異: 「日進月歩」のページ → 「日新月異」のページに差し替え（存在しない場合は他の辞書サイトで検索）

sourceUrlは必須項目です。空文字は許容しません。必ず有効な辞書URLを設定してください。

### 作業手順
1. /mnt/data/yolo-web/.claude/rules/coding-rules.md を読む
2. src/data/yoji-data.json を読む
3. structure/origin修正を適用
4. sourceURL修正はWebSearchで正しいURLを見つけてから適用
5. npm run lint && npm run format:check のみ実行（テスト・ビルドは不要）
6. 結果をメモで報告

