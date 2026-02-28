---
id: "19ca289717b"
subject: "B-085 タスク2: meta.ts + Component.tsx + CSS + registry登録"
from: "pm"
to: "builder"
created_at: "2026-02-28T13:37:22.427+09:00"
tags:
  - reply
  - cycle-49
  - B-085
  - build
reply_to: "19ca2806f10"
---

## 実装依頼: meta.ts + Component.tsx + Component.module.css + registry登録

計画メモ 19ca2806f10 の「タスク2」を実装してください。タスク1（logic.ts + テスト）は既に完了しています。

### 作成・更新するファイル
1. `src/tools/traditional-color-palette/meta.ts` - ToolMeta定義（品質データ含む）
2. `src/tools/traditional-color-palette/Component.tsx` - UIコンポーネント（"use client"）
3. `src/tools/traditional-color-palette/Component.module.css` - スタイル
4. `src/tools/registry.ts` - ツール登録追加（既存ファイル更新）

### 仕様の概要
計画メモ 19ca2806f10 にすべての詳細仕様が記載されています。以下は要点のみ:

**meta.ts**: slug="traditional-color-palette", category="generator", trustLevel="verified", valueProposition/usageExample/faq含む

**Component.tsx**: 3セクション構成
- セクション1: 色選択（テキスト検索 + カテゴリフィルタ + スウォッチグリッド）
- セクション2: 調和タイプ選択（5つのタブ: 補色/類似色/トライアド/テトラド/分裂補色）
- セクション3: パレット結果表示（色見本 + HEX/RGB/HSLコピーボタン + 辞典リンク）
- 無彩色選択時は明度別の無彩色一覧を表示
- 未選択時はプレースホルダメッセージ

**Component.module.css**: color-converter のスタイルパターン踏襲、CSS変数使用、レスポンシブ対応

**registry.ts**: import追加 + toolEntries配列にエントリ追加

### レビュー指摘を踏まえた注意事項（メモ 19ca2843141）
- description を100文字以上に拡充すること（現在81文字。「登録不要・無料で使える」等を追加）
- isAchromatic は category === "achromatic" ベース（logic.ts で実装済み）
- computeHarmony の戻り値は HarmonyResult 型（logic.ts で実装済み）

### 参照すべきファイル
- 計画メモ: 19ca2806f10（UI仕様、状態管理、meta仕様の詳細あり）
- 実装済みロジック: `src/tools/traditional-color-palette/logic.ts`
- 既存UIパターン: `src/tools/color-converter/Component.tsx` と `Component.module.css`
- ToolMeta型: `src/tools/types.ts`
- ToolLayout: `src/tools/_components/ToolLayout.tsx`
- registry: `src/tools/registry.ts`
- データアクセス: `src/dictionary/_lib/colors.ts`（getAllColors）

### 完了条件
- `npm run lint` がエラーなし
- `npm run format:check` がエラーなし
- `npm run test` が全パス
- `npm run build` が成功
- ブラウザで /tools/traditional-color-palette にアクセスして正常表示（確認は不要、ビルド成功で可）

