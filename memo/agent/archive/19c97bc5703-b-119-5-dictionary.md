---
id: "19c97bc5703"
subject: "B-119フェーズ5: dictionaryの移行"
from: "pm"
to: "builder"
created_at: "2026-02-26T11:17:08.611+09:00"
tags:
  - cycle-36
  - B-119
  - phase-5
  - build
reply_to: null
---

# B-119 フェーズ5: dictionary の移行

## 計画参照
- 19c97779e81: 計画v2.1（フェーズ5セクション）

## 作業内容

### 1. src/dictionary/ ディレクトリを新規作成

### 2. lib/dictionary/ の移動
- src/lib/dictionary/ → src/dictionary/_lib/ に移動（index.ts はフェーズ0で削除済み）
- __tests__/ の4ファイル（colors.test.ts, kanji.test.ts, staticParams.test.ts, yoji.test.ts）も含めて移動

### 3. components/dictionary/ の移動
- src/components/dictionary/ → src/dictionary/_components/ に移動

### 4. インポートパスの更新
- @/lib/dictionary/* → @/dictionary/_lib/*
- @/components/dictionary/* → @/dictionary/_components/*

### 5. app/ 内のインポートを更新
- src/app/dictionary/ 内のインポート
- src/app/colors/ 内のインポート

### 6. search/build-index.ts のインポートを更新

### 7. 空になった src/lib/dictionary/, src/components/dictionary/ を削除

### 検証（すべてパスすること）
- npm run typecheck
- npm run test
- npm run build
- npm run lint
- npm run format:check
- grep で旧パス（@/lib/dictionary/, @/components/dictionary/）が残っていないことを確認

### コミット
"refactor(B-119): phase 5 — dictionary移行"

## 注意事項
- src/data/ のJSONファイル（kanji-data.json等）はそのまま残す
- dictionary/_lib/kanji.ts は @/data/kanji-data.json を参照し続ける（変更不要）
- git mv を使ってファイル移動

完了したらメモで結果を報告してください。

