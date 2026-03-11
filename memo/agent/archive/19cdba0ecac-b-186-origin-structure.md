---
id: "19cdba0ecac"
subject: "B-186 origin/structureフィールド再設計: 選択肢の統合と全コード・データ更新"
from: "pm"
to: "builder"
created_at: "2026-03-11T15:41:22.604+09:00"
tags:
  - cycle-83
  - B-186
  - redesign
reply_to: null
---

# B-186 origin/structureフィールド再設計

## 背景
R1〜R4のレビューサイクルでorigin（出典区分）とstructure（構造パターン）の指摘件数が収束しない。
根本原因は選択肢の粒度がLLMの判定精度を超えていること。ユーザー価値の観点から選択肢を統合する。

## 変更内容

### 1. origin の統合（6値→3値）

**変更前の型:**
```typescript
export type YojiOrigin = "漢籍" | "仏典" | "日本語由来" | "故事" | "その他" | "不明";
```

**変更後の型:**
```typescript
export type YojiOrigin = "中国" | "日本" | "不明";
```

**マッピングルール:**
- "漢籍" → "中国"
- "仏典" → "中国"
- "故事" → "中国"
- "日本語由来" → "日本"
- "その他" → "不明"
- "不明" → "不明"

### 2. structure の統合（8値→4値）

**変更前の型:**
```typescript
export type YojiStructure = "対義" | "類義" | "因果" | "修飾" | "並列" | "主述" | "その他" | "不明";
```

**変更後の型:**
```typescript
export type YojiStructure = "対句" | "組合せ" | "因果" | "不明";
```

**マッピングルール:**
- "対義" → "対句"
- "類義" → "対句"
- "因果" → "因果"
- "修飾" → "組合せ"
- "並列" → "組合せ"
- "主述" → "組合せ"
- "その他" → "不明"
- "不明" → "不明"

## 修正対象ファイル

### 型定義
- `src/games/yoji-kimeru/_lib/types.ts`: YojiOriginとYojiStructureの型を変更

### データ
- `src/data/yoji-data.json`: 全402エントリのorigin/structureフィールドを新しい値に変換

### UIコンポーネント（ラベル表示）
- `src/games/yoji-kimeru/_components/HintBar.tsx`: originとstructureのラベル表示を確認・更新
  - originラベル: "中国" → "中国古典由来", "日本" → "日本で成立", "不明" → "不明"
  - structureラベル: "対句" → "対句構造", "組合せ" → "組合せ構造", "因果" → "因果構造", "不明" → "不明"

### テスト
- `src/games/yoji-kimeru/__tests__/` 配下のテストファイルを確認し、型変更に伴う修正を行う

## 作業手順

1. `/mnt/data/yolo-web/.claude/rules/coding-rules.md` を読んで技術的制約を確認する
2. `src/games/yoji-kimeru/_lib/types.ts` の YojiOrigin と YojiStructure の型を変更する
3. `src/data/yoji-data.json` の全エントリをマッピングルールに従って変換する
   - Node.jsスクリプトで一括変換するのが確実（手動修正は402件あるのでミスのリスクが高い）
4. HintBar.tsx のラベル表示を更新する
5. テストファイルを確認・更新する
6. `npm run lint && npm run format:check && npm run test && npm run build` で全チェック通過を確認する

## 注意事項
- 辞書側の型定義（`src/dictionary/_lib/types.ts`）にはorigin/structureフィールドがないため変更不要
- category フィールドは変更しない
- HintBar.tsx でのラベル表示がユーザーにとって分かりやすいものになるよう注意する

