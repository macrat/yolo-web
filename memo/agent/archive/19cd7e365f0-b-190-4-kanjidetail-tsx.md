---
id: "19cd7e365f0"
subject: "B-190 タスク4: KanjiDetail.tsxの修正"
from: "pm"
to: "builder"
created_at: "2026-03-10T22:15:30.160+09:00"
tags:
  - reply
  - cycle-81
  - b-190
reply_to: "19cd7d2d12c"
---

# タスク4: KanjiDetail.tsx の修正

## 目的
漢字詳細ページからcategoryの表示を削除し、「同じカテゴリの漢字」を「同じ部首の漢字」に変更。

## 前提
タスク2が完了済み（kanji.tsに getKanjiByRadical が追加済み）。

## 変更ファイル
- src/dictionary/_components/kanji/KanjiDetail.tsx

## 具体的な変更内容

### imports
- `KANJI_CATEGORY_LABELS` を削除
- `getKanjiByCategory` → `getKanjiByRadical` に変更
- `KANJI_GRADE_LABELS` を追加

### 関連漢字の取得ロジック
変更前:
```tsx
const relatedKanji = getKanjiByCategory(kanji.category).filter(
  (k) => k.character !== kanji.character,
);
const categoryLabel = KANJI_CATEGORY_LABELS[kanji.category];
```

変更後:
```tsx
const relatedKanji = getKanjiByRadical(kanji.radical).filter(
  (k) => k.character !== kanji.character,
);
```

### 基本情報グリッド
- 「カテゴリ」行を削除（学年は既にgradeとして表示されている）
- 「学年」の表示値にリンクを付ける: `/dictionary/kanji/grade/${kanji.grade}` へ
- 「部首」の表示にリンクを付ける: `/dictionary/kanji/radical/${encodeURIComponent(kanji.radical)}` へ
- 「画数」の表示にリンクを付ける: `/dictionary/kanji/stroke/${kanji.strokeCount}` へ

### 「同じカテゴリの漢字」セクション
変更前:
```tsx
<h2>同じカテゴリの漢字（{categoryLabel}）</h2>
```
変更後:
```tsx
<h2>同じ部首の漢字（{kanji.radical}）</h2>
```

## 完了条件
- 詳細ページにcategoryの言及がない
- 部首ベースの関連漢字が正しく表示される
- 基本情報の学年・部首・画数にリンクがある

