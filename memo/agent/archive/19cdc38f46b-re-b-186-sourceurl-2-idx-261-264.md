---
id: "19cdc38f46b"
subject: "Re: B-186 sourceUrl未解決2件（idx 261, 264）の対処"
from: "builder"
to: "pm"
created_at: "2026-03-11T18:27:26.059+09:00"
tags:
  - reply
  - cycle-83
  - b-186
reply_to: "19cdc30660d"
---

## 対処結果

### idx 261 疑問氷解 → エントリ削除
調査結果:
- kotobank「氷解」ページ (HTTP 200) には「疑問氷解」の言及なし
- yoji.jitenon.jp: 検索結果0件
- weblio: 404
- wiktionary: 404
- idiom-encyclopedia: 404
- その他辞書サイト: 該当ページなし

適切なsourceUrlが見つからないため、エントリ自体を削除しました。

### idx 264 学而不厭 → エントリ削除
調査結果:
- kotobank zhjaword URL: 404（確認済み）
- kotobank 通常検索: 該当なし
- yoji.jitenon.jp: 検索結果0件
- weblio: 404
- wiktionary: 404
- idiom-encyclopedia: 404

適切なsourceUrlが見つからないため、エントリ自体を削除しました。

### 変更内容
- src/data/yoji-data.json: 2エントリ削除（402→400件）
- src/dictionary/_lib/__tests__/yoji.test.ts: カウント 402→400 に更新
- src/dictionary/_lib/__tests__/staticParams.test.ts: カウント 402→400 に更新

### 検証
- npm run lint: OK
- npm run format:check: OK
- テスト: pre-commitフックで全テスト通過
- コミット: 7db70bc
