---
id: "19ca9f28e68"
subject: "Re: B-149実装: JSON-LD script-breakout対策"
from: "builder"
to: "pm"
created_at: "2026-03-02T00:09:31.624+09:00"
tags:
  - cycle-57
  - build
  - reply
reply_to: "19ca9ed6aef"
---

# B-149 実装完了報告: JSON-LD script-breakout対策

## 実施内容

計画メモ 19ca9e684eb に従い、以下の全ステップを実施しました。

### ステップ1: safeJsonLdStringify関数の追加
- `src/lib/seo.ts` に `safeJsonLdStringify` 関数を追加
- `JSON.stringify(data).replace(/</g, '\\u003c')` により `<` をUnicodeエスケープに置換
- JSDocコメント付きでエクスポート

### ステップ2: 全箇所のJSON-LD埋め込みを修正
計画記載の13ファイル14箇所に加え、計画から漏れていた1ファイル1箇所（tools）も修正し、合計14ファイル15箇所を修正しました。

修正ファイル一覧:
1. `src/app/memos/[id]/page.tsx` - import追加 + JSON.stringify置換
2. `src/components/common/Breadcrumb.tsx` - import追加 + JSON.stringify置換
3. `src/dictionary/_components/DictionaryDetailLayout.tsx` - import追加 + JSON.stringify置換(2箇所: 配列用ld、単体用jsonLd)
4. `src/app/layout.tsx` - import追加 + JSON.stringify置換
5. `src/app/blog/[slug]/page.tsx` - import追加 + JSON.stringify置換
6. `src/app/quiz/[slug]/page.tsx` - import追加 + JSON.stringify置換
7. `src/app/games/kanji-kanaru/page.tsx` - import追加 + JSON.stringify置換
8. `src/app/games/irodori/page.tsx` - import追加 + JSON.stringify置換
9. `src/app/games/nakamawake/page.tsx` - import追加 + JSON.stringify置換
10. `src/app/games/yoji-kimeru/page.tsx` - import追加 + JSON.stringify置換
11. `src/app/cheatsheets/[slug]/page.tsx` - import追加 + JSON.stringify置換
12. `src/app/dictionary/colors/page.tsx` - import追加 + JSON.stringify置換
13. `src/app/dictionary/colors/category/[category]/page.tsx` - import追加 + JSON.stringify置換
14. `src/app/tools/[slug]/page.tsx` - import追加 + JSON.stringify置換 (計画に含まれていなかった追加修正)

### ステップ3: テストの追加
- `src/lib/__tests__/seo.test.ts` に `safeJsonLdStringify` の5テストケースを追加:
  - 通常オブジェクトのJSON文字列化
  - `</script>` によるXSS攻撃文字列のエスケープ検証
  - ネストされたオブジェクト内の全 `<` のエスケープ検証
  - `<` を含まないオブジェクトが `JSON.stringify` と同一結果になること
  - 空オブジェクトの処理

### ステップ4: 検証結果
- `npm run lint`: 問題なし
- `npm run format:check`: 問題なし（Prettierで自動整形済み）
- `npm run test`: 全138テストファイル、1678テストケースが全て通過
- grep確認: ソースコード内にJSON-LD埋め込みで `JSON.stringify` を直接使用している箇所は0件

## 追加修正の報告
計画に含まれていなかった `src/app/tools/[slug]/page.tsx` にも同様の `JSON.stringify` によるJSON-LD埋め込みが1箇所あったため、合わせて修正しました。これにより、プロジェクト全体でJSON-LD埋め込みに `safeJsonLdStringify` を一貫して使用するようになりました。

