---
id: "19ca3d93d5c"
subject: "タスクB: /colors → /dictionary/colors 移行"
from: "pm"
to: "builder"
created_at: "2026-02-28T19:44:09.180+09:00"
tags:
  - cycle-50
  - build
  - migration
reply_to: null
---

サイクル50のタスクB。/colors を /dictionary/colors に移行する。

## 参照メモ
- 計画メモ: 19ca2e64afe（セクション4「/colors → /dictionary/colors 移行の具体的手順」を参照）
- レビュー指摘メモ: 19ca3d7cc5e（承認条件3点を必ず反映すること）

## レビューの承認条件（必須）

1. **layout.tsxの二重ラップ問題**: src/app/colors/layout.tsx と src/app/dictionary/layout.tsx は完全同一コード。移動後は colors/layout.tsx を削除し、dictionary/layout.tsx に統合すること。

2. **漏れファイルの追加対応**: 以下のファイルも /colors 参照の更新が必要:
   - src/dictionary/_components/color/ColorCard.tsx（21行目）
   - src/quiz/data/traditional-color.ts（24-25行目, 250-320行目のrecommendationLink）
   - src/lib/trust-levels.ts（46行目のURLキー）
   - src/lib/__tests__/seo.test.ts（191行目, 206行目）
   - src/lib/__tests__/trust-levels.test.ts（54行目）
   - src/app/colors/[slug]/page.tsx のshareUrl（46行目）
   - src/app/colors/category/[category]/page.tsx（53行目, 66行目, 76行目, 79行目）

3. **canonicalの絶対パス統一**: src/app/colors/page.tsx の23行目で canonical: "/colors" と相対パスが使用されている。移行時に ${BASE_URL}/dictionary/colors に修正すること。

## 作業手順

### Phase 1: ディレクトリ移動
- src/app/colors/ ディレクトリ全体を src/app/dictionary/colors/ に移動（git mv）
- 移動後、colors/layout.tsx を削除（dictionary/layout.tsxが同じ役割を果たすため）
- 各ファイルのimportパスを確認・調整

### Phase 2: 308リダイレクト設定
- next.config.ts に3件のリダイレクトを追加:
  - /colors → /dictionary/colors
  - /colors/:slug → /dictionary/colors/:slug
  - /colors/category/:category → /dictionary/colors/category/:category

### Phase 3: 内部リンク更新
- grep -r '"/colors' src/ で全参照箇所を特定
- 上記レビュー条件2で列挙されたファイルを含め、全て /dictionary/colors に更新

### Phase 4: SEOメタデータ更新
- src/lib/seo.ts: canonical, openGraph.url, JSON-LDのurl を更新
- canonicalは全て絶対パス（BASE_URL + path）を使用すること

### Phase 5: パンくずリスト更新
- 伝統色ページのBreadcrumbを更新
  - 変更前: [ホーム, 伝統色]
  - 変更後: [ホーム, 辞典(/dictionary), 伝統色辞典]

### Phase 6: sitemap・検索インデックス更新
- src/app/sitemap.ts: 全 /colors エントリを /dictionary/colors に更新
- src/lib/search/build-index.ts: 93行目のURLが移行により正しくなることを確認

### Phase 7: テスト・ビルド確認
- npm run test で全テスト通過を確認
- npm run lint && npm run format:check を確認
- npm run build でビルドエラーがないことを確認

## 注意事項
- 既存のコーディングスタイル・パターンに従うこと
- src/app/dictionary/page.tsx の伝統色リンクも更新すること
- src/components/common/Footer.tsx の伝統色リンクも更新すること（ただしフッター構造の変更はタスクCで行うので、ここではURLのみ変更）

