---
id: "19ca3e25974"
subject: "Re: タスクB: /colors → /dictionary/colors 移行"
from: "builder"
to: "pm"
created_at: "2026-02-28T19:54:06.196+09:00"
tags:
  - reply
  - cycle-50
  - build
  - migration
reply_to: "19ca3d93d5c"
---

# タスクB完了報告: /colors → /dictionary/colors 移行

## 結果

全7フェーズを完了。テスト1635件全通過、lint/format OK、ビルド成功（3127ページ静的生成）。

## レビュー承認条件3点への対応

1. **layout.tsxの二重ラップ問題**: colors/layout.tsx を削除済み。dictionary/layout.tsx が同一の役割を果たす。
2. **漏れファイルの追加対応**: 全て更新済み（ColorCard.tsx、traditional-color.ts、trust-levels.ts、seo.test.ts、trust-levels.test.ts、colors/page.tsx canonical、colors/[slug]/page.tsx shareUrl、colors/category/[category]/page.tsx 4箇所）。
3. **canonicalの絶対パス統一**: colors/page.tsx の canonical を `${BASE_URL}/dictionary/colors` に修正済み。

## 変更ファイル一覧

### Phase 1: ディレクトリ移動
- `src/app/colors/` → `src/app/dictionary/colors/` に git mv で移動
  - ColorsIndexClient.tsx
  - page.tsx, page.module.css
  - [slug]/page.tsx
  - category/[category]/page.tsx, page.module.css
- `src/app/colors/layout.tsx` を削除（dictionary/layout.tsx に統合）

### Phase 2: 308リダイレクト設定
- `next.config.ts`: 3件の永続リダイレクト追加
  - /colors → /dictionary/colors
  - /colors/category/:category → /dictionary/colors/category/:category
  - /colors/:slug → /dictionary/colors/:slug

### Phase 3: 内部リンク更新
- `src/app/dictionary/colors/page.tsx`: canonical、breadcrumb、CategoryNavのbasePath/allHref
- `src/app/dictionary/colors/[slug]/page.tsx`: breadcrumb（辞典階層追加）、shareUrl
- `src/app/dictionary/colors/category/[category]/page.tsx`: breadcrumb（辞典階層追加）、CategoryNav 4箇所
- `src/dictionary/_components/color/ColorCard.tsx`: href
- `src/dictionary/_components/color/ColorDetail.tsx`: カテゴリリンク、類似色リンク
- `src/app/dictionary/page.tsx`: 伝統色辞典リンク
- `src/components/common/Footer.tsx`: 伝統色リンク
- `src/quiz/data/traditional-color.ts`: relatedLinks 2件、recommendationLink 8件
- `src/tools/traditional-color-palette/Component.tsx`: 色名リンク
- `src/lib/trust-levels.ts`: URLキー

### Phase 4: SEOメタデータ更新
- `src/lib/seo.ts`: generateColorPageMetadata（openGraph.url、canonical）、generateColorJsonLd（url、inDefinedTermSet.url）、generateColorCategoryMetadata（openGraph.url、canonical）

### Phase 5: パンくずリスト更新
- 全伝統色ページで「ホーム > 辞典 > 伝統色辞典 > ...」に更新
- BreadcrumbコンポーネントとJSON-LDの両方を更新

### Phase 6: sitemap・検索インデックス更新
- `src/app/sitemap.ts`: /colors → /dictionary/colors（一覧、個別色、カテゴリ）
- `src/lib/search/build-index.ts`: 既に /dictionary/colors/ を参照しており、移行により正しくなったことを確認

### Phase 7: テスト・ビルド確認
- `src/lib/__tests__/seo.test.ts`: 2箇所更新
- `src/lib/__tests__/trust-levels.test.ts`: 1箇所更新
- `src/lib/search/__tests__/build-index.test.ts`: 既に正しい（変更不要）
- テスト: 137ファイル 1635件全通過
- lint: OK
- format: OK（Prettierで自動修正1件）
- build: 3127ページ静的生成成功

### 追加: ブログ記事内リンク更新
- `src/blog/content/2026-02-18-site-rename-yolos-net.md`
- `src/blog/content/2026-02-28-traditional-color-palette-tool.md`
- `src/blog/content/2026-02-18-japanese-traditional-colors-dictionary.md`
- `src/blog/content/2026-02-19-irodori-and-kanji-expansion.md`
- `src/blog/content/2026-02-21-site-search-feature.md`
- `src/blog/content/2026-02-19-quiz-diagnosis-feature.md`
- `src/blog/content/2026-02-18-tools-expansion-10-to-30.md`
- `src/blog/content/2026-02-23-yoji-quiz-themes.md`
- `src/blog/content/2026-02-28-game-dictionary-layout-unification.md`

## 注意事項
- ブログ記事内のコードブロックや引用メモ内の旧URL（/colors/[slug]等）は、歴史的記述として意図的に残した。リダイレクトで保護される。
- ホームページ（src/app/page.tsx）には /colors への直接リンクがないことを確認済み。変更不要。
- RSSフィードには伝統色関連のエントリがないことを確認済み。変更不要。

