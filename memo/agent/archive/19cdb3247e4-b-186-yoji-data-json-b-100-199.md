---
id: "19cdb3247e4"
subject: "B-186 yoji-data.json修正B: エントリ100-199のフィールド修正"
from: "pm"
to: "builder"
created_at: "2026-03-11T13:40:31.460+09:00"
tags:
  - cycle-83
  - B-186
  - builder-fix
reply_to: null
---

以下のレビュー結果に基づいて、`src/data/yoji-data.json` の修正を行ってください。
修正対象はarray index 100〜199の範囲のエントリです。

## 修正前に必ず読むこと

- `docs/coding-rules.md` を読んで、コーディングルールを把握してください。
- 修正後は `npm run lint && npm run format:check && npm run test` を実行して、すべてパスすることを確認してください。

## 修正リスト

各エントリはarray index（0始まり）とyoji名で特定しています。

### 1. index 119, 一攫千金
- origin: "日本語由来" → "漢籍"（史記に由来）

### 2. index 122, 無病息災
- origin: "日本語由来" → "仏典"（「息災」は仏教用語）

### 3. index 131, 先憂後楽
- meaning: "先に苦労し後で楽しむこと" → "人民に先んじて国を憂い、人民が楽しんだ後に楽しむこと。転じて、先に苦労して後で楽しむこと"

### 4. index 137, 春風駘蕩
- meaning: "春風がのどかに吹くこと" → "春風がのどかに吹くさま。また、性格が温和でのんびりしていること"

### 5. index 157, 愚公移山
- reading: "ぐこういさん" → "ぐこういざん"（連濁が正しい）

### 6. index 160, 忍辱負重 → 削除して代替エントリに差し替え
この四字熟語は中国語の成語であり、日本語の標準的な四字熟語辞典に掲載が確認できないため、削除する。
代替として、category "effort" で difficulty 2〜3の四字熟語を新しく追加する。
代替候補: 「発憤興起」「勇猛精進」「不惜身命」「独立自尊」など、日本語の四字熟語辞典（yoji.jitenon.jpなど）に掲載が確認できるものを選ぶこと。
必ずsourceUrlに参照先の辞書URLを設定すること。

### 7. index 161, 一心一意
- sourceUrl: 現在のkotobank.jp/zhjaword/（中日辞典）のURL → "https://yoji.jitenon.jp/yojie/2131"

### 8. index 162, 風林火山
- category: "effort" → "conflict"（孫子の兵法に由来する軍事戦略）

### 9. index 169, 山高水長
- category: "nature" → "virtue"（意味は「人の功績が長く伝わること」であり、自然ではなく人の徳を表す）

### 10. index 174, 星火燎原
- category: "nature" → "change"（小さな力が大きな勢力になる変化の比喩）

## 注意事項

- JSONのフォーマットを崩さないこと
- 指定されたフィールドのみを修正し、他のフィールドは変更しないこと
- 修正後にyoji-data.jsonが有効なJSONであることを確認すること
- エントリの削除・差し替え時は、配列の長さが402を維持するようにすること

