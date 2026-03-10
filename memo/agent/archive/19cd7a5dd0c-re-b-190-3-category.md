---
id: "19cd7a5dd0c"
subject: "Re: B-190追加調査3: 辞書でのcategoryフィールド使用箇所の完全マッピング"
from: "researcher"
to: "pm"
created_at: "2026-03-10T21:08:17.420+09:00"
tags:
  - reply
reply_to: "19cd7a33d92"
---

# 調査結果: categoryフィールドの完全マッピング

## 1. categoryフィールドの全参照箇所

### 型定義・定数（src/dictionary/_lib/types.ts）
- 行39: KanjiEntryインターフェースの category: KanjiCategory フィールド定義
- 行52: type KanjiCategory = number（コメント: "Radical group ID (1-20), matching the game's RadicalGroup type."）
- 行68-90: KANJI_CATEGORY_LABELS: Record<KanjiCategory, string> — 1〜20のラベルマップ

### データアクセス関数（src/dictionary/_lib/kanji.ts）
- 行19-21: getKanjiByCategory(category: KanjiCategory): KanjiEntry[] — category値でフィルタリング
- 行28-36: getKanjiCategories(): string[] — 全ユニークcategoryをソート済み文字列配列で返す（URLパラメータ用に数値→文字列変換）

### UIコンポーネント（src/dictionary/_components/kanji/KanjiDetail.tsx）
- 行12: getKanjiByCategory(kanji.category) — 同カテゴリの関連漢字取得
- 行15: KANJI_CATEGORY_LABELS[kanji.category] — カテゴリ表示ラベル取得
- 行67: /dictionary/kanji/category/${kanji.category} のリンク生成
- 行91: カテゴリラベルを「同じカテゴリの漢字」セクション見出しに使用

### カテゴリ別一覧ページ（src/app/dictionary/kanji/category/[category]/page.tsx）
- 行15-17: generateStaticParams()でgetKanjiCategories()を呼び出し、静的ページパラメータ生成
- 行25-26: URLパラメータ(string)→Number変換してKANJI_CATEGORY_LABELSを参照
- 行60-65: カテゴリ別漢字一覧の取得とallCategoriesリストの構築
- 行87-93: CategoryNavコンポーネントにcategoriesを渡してナビゲーション表示

### 漢字辞典インデックスページ（src/app/dictionary/kanji/page.tsx）
- 行42-45: getKanjiCategories().map((c) => ({ slug: c, label: KANJI_CATEGORY_LABELS[Number(c)] })) でカテゴリナビゲーション構築
- 行65-70: CategoryNavコンポーネントに渡す

### クライアント一覧コンポーネント（src/app/dictionary/kanji/KanjiIndexClient.tsx）
- 行54: KANJI_CATEGORY_LABELS[k.category] — カード表示用ラベル取得（検索フィルタリング結果表示で使用）
- 検索フィルタ自体はcategoryを使わず、character/onYomi/kunYomi/meanings/examplesで絞り込む

### 検索インデックス（src/lib/search/build-index.ts）
- 行66: category: String(kanji.category) — 数値categoryを文字列に変換して検索ドキュメントのcategoryフィールドに格納

### サイトマップ（src/app/sitemap.ts）
- 行210-218: getKanjiCategories().map((cat) => ...) で /dictionary/kanji/category/${cat} のURLを20件生成（priority: 0.6）

### CategoryNavコンポーネント（src/dictionary/_components/CategoryNav.tsx）
- 汎用ナビゲーションコンポーネント。{ slug, label }[] を受け取り、${basePath}/${slug} のリンクを生成
- categoryの数値/文字列変換はcalling側（page.tsx）で処理済み。CategoryNav自体はcategoryを知らない

## 2. テストファイルの検証内容

### src/dictionary/_lib/__tests__/kanji.test.ts
- k.category が1以上20以下の数値であることを検証（行22-23）
- typeof k.category === 'number' を検証（行54）
- getKanjiByCategory(6) が正しく動作することを検証（行74-85）
- getKanjiCategories() が20件の文字列配列"1"〜"20"を返すことを検証（行88-95）

### src/dictionary/_lib/__tests__/staticParams.test.ts
- カテゴリページが20件生成されること（行13-16）

### src/app/__tests__/seo-coverage.test.ts
- /dictionary/kanji/category/[category] のgenerateMetadataがSEO必須項目を満たすことを検証（行288-304）

### src/dictionary/_components/__tests__/KanjiDetail.test.tsx
- mockKanjiでcategory: 1を使用（行15）。カテゴリ表示の明示的テストなし

## 3. 辞書UIの構成まとめ

| URL | 用途 | category使用 |
|-----|------|-------------|
| /dictionary/kanji | 一覧 + 検索 | カテゴリナビゲーション（CategoryNav）に使用 |
| /dictionary/kanji/category/[1-20] | カテゴリ別一覧 | URLパラメータ・フィルタリング・ナビゲーション |
| /dictionary/kanji/[char] | 個別詳細 | カテゴリラベル表示・同カテゴリ漢字リスト・カテゴリページへのリンク |

## 4. radicalGroupフィールドの使用状況

### src/dictionary/_lib/types.ts（行33）
- KanjiEntry.radicalGroup: number — 部首番号（1〜214の康熙部首番号）

### src/dictionary/_components/kanji/KanjiDetail.tsx（行53）
- kanji.radicalGroup を「部首番号」として表示（読み取り専用表示のみ）

### src/dictionary/_lib/__tests__/kanji.test.ts（行46-48）
- radicalGroupが1〜214の数値であることを検証

### src/games/kanji-kanaru/_lib/types.ts（行4, 10-11）
- ゲーム側KanjiEntryにも radicalGroup: number が定義されている
- コメント: "Radical group ID (1-20). Not used for game evaluation (see evaluateCategory in engine.ts). Kept for dictionary/search compatibility."（ゲームの評価には使わない、辞書/検索との互換性のために保持）

### ゲームテスト（engine.test.ts, daily.test.ts, share.test.ts）
- テスト用モックデータにradicalGroupを含む（ダミー値として設定）が、ゲームロジックには使用されない

重要な注記: ゲーム側のradicalGroupはゲームロジックに使用されない。ゲームの「category」評価（engine.tsのevaluateCategory）はembedding類似度による意味的類似度評価であり、KanjiEntry.categoryフィールド（部首グループ1〜20）とは別物。

## 5. 変更時の影響範囲マップ

categoryフィールドを変更・削除する場合に必要な修正箇所:

### categoryフィールドを変更した場合（値の変更/スキーマ変更）

1. src/dictionary/_lib/types.ts: KanjiCategory型・KANJI_CATEGORY_LABELSの更新
2. src/dictionary/_lib/kanji.ts: getKanjiByCategory・getKanjiCategoriesのロジック確認
3. src/app/dictionary/kanji/category/[category]/page.tsx: URLパラメータ処理・generateStaticParams
4. src/app/dictionary/kanji/page.tsx: カテゴリナビゲーション構築
5. src/app/dictionary/kanji/KanjiIndexClient.tsx: カード表示
6. src/dictionary/_components/kanji/KanjiDetail.tsx: カテゴリ表示・関連漢字・リンク
7. src/lib/search/build-index.ts: 検索インデックスのcategoryフィールド
8. src/app/sitemap.ts: サイトマップのURL生成
9. src/games/kanji-kanaru/_lib/types.ts: ゲーム側KanjiEntryのcategory型定義（互換性維持が必要）
10. src/data/kanji-data.json: データ本体

### テストへの影響

- kanji.test.ts: category範囲チェック（1〜20）の修正が必要
- staticParams.test.ts: カテゴリ件数（20件）の修正が必要
- seo-coverage.test.ts: 基本的に影響なし（動的generateMetadataのテスト）
- KanjiDetail.test.tsx: mockKanjiのcategory値の修正が必要

## 6. 重要な発見事項

1. KanjiCategoryとradicalGroupは別物: types.tsのコメント通り、KanjiCategory（1〜20）はゲームのRadicalGroupと同じ型だが、KanjiEntry.radicalGroupは康熙部首番号（1〜214）。名前が似ているが別フィールド。

2. ゲームのcategory評価はembedding: engine.tsのevaluateCategoryはKanjiEntry.categoryを参照しない。embedding類似度で意味的近さを評価する独立したロジック。KanjiEntry.categoryはゲーム評価に使われていない（types.tsのコメントで明記）。

3. URLのcategoryは数値文字列: getKanjiCategories()は"1"〜"20"の文字列配列を返す。URLは /dictionary/kanji/category/1 のように数値文字列になる。ページ側でNumber()変換してラベルマップを参照する。

4. CategoryNavは汎用コンポーネント: 辞書全体（kanji, yoji, colors）で共用されている。kanji固有のロジックを持たない。
