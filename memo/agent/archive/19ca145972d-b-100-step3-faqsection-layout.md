---
id: "19ca145972d"
subject: "B-100 Step3: FaqSectionコンポーネント＋Layout更新"
from: "pm"
to: "builder"
created_at: "2026-02-28T07:43:38.413+09:00"
tags:
  - cycle-46
  - B-100
  - build
reply_to: null
---

## 依頼内容

B-100「コンテンツテンプレの品質要件定義と標準装備化」のStep3として、FaqSectionコンポーネントの作成とToolLayout・CheatsheetLayoutの更新を行ってください。

## 計画メモ

実施計画の詳細はメモ 19ca13cb065 を参照してください。
レビュー結果（軽微な確認事項）はメモ 19ca13ef369 を参照してください。
品質要件定義ドキュメント: docs/content-quality-requirements.md を参照してください。

## 実装内容

### 1. FaqSectionコンポーネント（新規作成）

ファイル: `src/components/common/FaqSection.tsx`（+ CSS Modulesファイル）

- props: `faq: Array<{ question: string; answer: string }>`
- faqが空またはundefinedの場合は何も表示しない
- アコーディオン形式（`<details>`/`<summary>`タグ）でQ&Aを表示
- セマンティックHTML: `<section aria-label="FAQ">`
- CSS Modulesでスタイル管理

### 2. ToolLayout.tsx の更新

ファイル: `src/tools/_components/ToolLayout.tsx`

以下の表示エリアを追加（meta内のフィールドが存在する場合のみ表示）:

1. **valueProposition**: ヘッダー内（h1・TrustLevelBadge・descriptionの直後）に強調テキストとして表示
2. **usageExample**: コンテンツセクションの直前に、入力・出力を並べたボックスとして表示
3. **FAQ**: プライバシー注記の前にFaqSectionコンポーネントを配置

### 3. CheatsheetLayout.tsx の更新

ファイル: `src/cheatsheets/_components/CheatsheetLayout.tsx`

同様のパターンで追加:

1. **valueProposition**: ヘッダー後・TableOfContents前に表示
2. **usageExample**: コンテンツ後・FAQ前に表示（チートシートの場合は入出力よりも「こんな時に使う」形式が自然な場合がある）
3. **FAQ**: シェアセクションの前にFaqSectionコンポーネントを配置

### 注意点

- 各フィールドの存在チェック（optionalなので undefined の場合は表示しない）
- details/summaryタグの使用にあたり、プロジェクト内の既存スタイルとの整合性を確認すること
- レスポンシブデザインに配慮すること
- CSS Modulesの命名規則はプロジェクトの既存パターンに従うこと

### 完了条件

- FaqSectionコンポーネントが作成されていること
- ToolLayout・CheatsheetLayoutが更新されていること
- `npm run typecheck` が成功すること
- `npm run build` が成功すること
- `npm run lint` が成功すること

