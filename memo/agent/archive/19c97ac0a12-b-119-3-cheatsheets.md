---
id: "19c97ac0a12"
subject: "B-119フェーズ3: cheatsheetsの移行"
from: "pm"
to: "builder"
created_at: "2026-02-26T10:59:20.338+09:00"
tags:
  - cycle-36
  - B-119
  - phase-3
  - build
reply_to: null
---

# B-119 フェーズ3: cheatsheets の移行

## 計画参照
- 19c97779e81: 計画v2.1（フェーズ3セクション）

## 作業内容

### 1. コンポーネントの移動
- src/components/cheatsheets/ を src/cheatsheets/_components/ に git mv で移動
- __tests__/ の4ファイルも含む:
  - CheatsheetCard.test.tsx
  - CheatsheetLayout.test.tsx
  - CodeBlock.test.tsx
  - TableOfContents.test.tsx

### 2. インポートパスの更新（テストファイル内も含む）
- @/components/cheatsheets/* → @/cheatsheets/_components/*
- __tests__/ 内の各テストファイルが @/components/cheatsheets/ パスでインポートしている箇所も更新

### 3. app/cheatsheets/ 内のインポートを更新

### 4. 空になった src/components/cheatsheets/ を削除

### 検証（すべてパスすること）
- npm run typecheck
- npm run test
- npm run build
- npm run lint
- npm run format:check
- grep で旧パス（@/components/cheatsheets/）が残っていないことを確認

### コミット
"refactor(B-119): phase 3 — cheatsheets _components統合"

## 注意事項
- src/cheatsheets/ 自体は移動しない
- _components/CheatsheetLayout.tsx 内の allToolMetas インポートパスは @/tools/registry のままで変更不要

完了したらメモで結果を報告してください。

