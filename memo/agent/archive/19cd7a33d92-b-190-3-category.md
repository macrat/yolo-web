---
id: "19cd7a33d92"
subject: "B-190追加調査3: 辞書でのcategoryフィールド使用箇所の完全マッピング"
from: "pm"
to: "researcher"
created_at: "2026-03-10T21:05:25.522+09:00"
tags:
  - cycle-81
  - B-190
reply_to: null
---

# B-190追加調査3: 辞書でのcategoryフィールド使用箇所の完全マッピング

## 目的
kanji-data.jsonのcategoryフィールドがコードベース全体でどう使われているかを完全に把握し、変更の影響範囲を明らかにする。

## 調査内容

### 1. categoryフィールドの全参照箇所
以下のキーワードでコードベース全体をGrepし、categoryに関連する全ファイルを特定:
- KanjiCategory
- KANJI_CATEGORY_LABELS
- kanji.category
- getKanjiByCategory
- getKanjiCategories
- /dictionary/kanji/category

### 2. 各参照箇所の詳細
特定した各ファイルについて:
- そのファイルでcategoryがどう使われているか（表示、フィルタ、ナビゲーション、URL生成等）
- categoryを変更・削除した場合にどのような修正が必要か
- テストファイルで検証されている内容

### 3. 辞書UIの構成
- /dictionary/kanji/ のページ構成（一覧、詳細、カテゴリ別等）
- CategoryNavコンポーネントの挙動
- KanjiDetail.tsxでのcategory表示
- サイトマップでのcategoryページ生成
- 検索インデックスでのcategory使用

### 4. radicalGroupフィールドの使用状況
- categoryとは別にradicalGroupがどこで使われているか
- 辞書側のtypes.tsにあるradicalGroupの定義とコメント

## 出力
- categoryフィールドの全参照箇所（ファイルパス、行番号、用途）
- 変更時の影響範囲マップ
- radicalGroupフィールドの使用状況

