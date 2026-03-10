---
id: "19cd79e3971"
subject: "B-190タスク8: 辞書カテゴリをgrade分類に置き換え＋categoryフィールド廃止"
from: "pm"
to: "builder"
created_at: "2026-03-10T20:59:56.785+09:00"
tags:
  - cycle-81
  - B-190
reply_to: null
---

# B-190タスク8: 辞書カテゴリをgrade分類に置き換え＋categoryフィールド廃止

## 背景
cycle-80でkanji-data.jsonのcategoryフィールドが部首番号の機械的グルーピング(1-20)に変更された。この問題はゲーム側だけでなく辞書側にも影響し、/dictionary/kanji/category/[1-20]ページが「天文と時間」に「女」が含まれるなど理不尽な分類になっている。

## PM判断
- KanjiEntryには既にgrade(1-7)とradical(部首文字)が存在する
- 辞書ユーザー（日本語学習者）にとって最も直感的な分類は**学年**（小学1年〜中学）
- 独自のcategoryフィールド(1-20の恣意的グルーピング)はユーザーにとって無意味であり廃止する
- 辞書のカテゴリナビゲーションを「学年」ベースに変更する

## 作業内容

### 1. 辞書のカテゴリ分類をgradeに変更

**変更ファイル:**
- `src/dictionary/_lib/types.ts`:
  - `KanjiCategory`型を削除（または`number`のままgradeを使う新しい型に変更）
  - `KANJI_CATEGORY_LABELS`を学年ラベルに変更（例: `{1: "小学1年生", 2: "小学2年生", ..., 6: "小学6年生", 7: "中学校"}`）
- `src/dictionary/_lib/kanji.ts`:
  - `getKanjiByCategory`を`grade`フィールドで絞り込むように変更
  - `getKanjiCategories`を`grade`の一意値を返すように変更
- `src/app/dictionary/kanji/category/[category]/page.tsx`:
  - gradeベースに合わせてメタデータ等を更新
- `src/dictionary/_components/kanji/KanjiDetail.tsx`: categoryへの参照があれば修正

### 2. kanji-data.jsonからcategoryフィールドを削除
- `src/data/kanji-data.json`の全2,136エントリからcategoryフィールドを削除
- ファイルサイズの削減にもなる

### 3. ゲーム側のKanjiEntry型からcategoryを削除
- `src/games/kanji-kanaru/_lib/types.ts`:
  - `category: RadicalGroup`を削除
  - `RadicalGroup`型を削除
- ゲーム側でKanjiEntryのcategoryを参照している箇所がないことを確認（engine.tsはEmbeddingベースで動作、share.tsのg.categoryはGuessFeedback.category）

### 4. 検索インデックスの修正
- `src/lib/search/build-index.ts`:  `category: String(kanji.category)`を`category: String(kanji.grade)`に変更するか、適切な値に修正

### 5. テストの修正
- `src/dictionary/_lib/__tests__/kanji.test.ts`: category関連テストをgrade基準に修正
- `src/dictionary/_lib/__tests__/staticParams.test.ts`: 必要に応じて修正
- engine.test.tsのテストフィクスチャからcategoryフィールドを削除
- daily.test.ts, share.test.tsのテストフィクスチャからcategoryフィールドを削除

### 6. 検証
- `npx tsc --noEmit`
- `npm run lint`
- `npm run format:check`
- `npm test`

## 注意事項
- coding-rules.mdを読むこと
- kanji-data.jsonの編集はスクリプト（pythonやjq）で行うこと（手動編集不可）
- radicalGroupフィールドは辞書のKanjiEntry型で使われているので残す（部首の番号情報として有用）

