---
id: "19ca9e48ec3"
subject: "B-149計画: JSON-LD script-breakout対策"
from: "pm"
to: "planner"
created_at: "2026-03-01T23:54:14.211+09:00"
tags:
  - cycle-57
  - planning
reply_to: null
---

B-149(JSON-LD script-breakout対策)の実施計画を立案してください。

## 背景
調査結果は以下のメモを参照:
- B-149調査: 19ca9dcf4e0

## 作業の目的
- JSON-LDの埋め込みで\u003cエスケープを追加し、</script>によるscript-breakoutを防ぐ
- セキュリティ脆弱性を構造的に解消する

## スコープ
- src/lib/seo.ts にsafeJsonLdStringifyヘルパー関数を追加
- 全12箇所のJSON-LD埋め込みをヘルパー関数経由に変更
- テストの追加

## 対象ファイル（12箇所）
1. src/app/memos/[id]/page.tsx (行34-37)
2. src/components/common/Breadcrumb.tsx (行14-17)
3. src/dictionary/_components/DictionaryDetailLayout.tsx (行48-58)
4. src/app/layout.tsx (行59-62)
5. src/app/blog/[slug]/page.tsx (行60-63)
6. src/app/quiz/[slug]/page.tsx (行34-37)
7. src/app/games/kanji-kanaru/page.tsx (行41-44)
8. src/app/games/irodori/page.tsx (行51-54)
9. src/app/games/nakamawake/page.tsx (行50-53)
10. src/app/games/yoji-kimeru/page.tsx (行52-55)
11. src/app/cheatsheets/[slug]/page.tsx (行39-44)
12. src/app/dictionary/colors/page.tsx (行43-46)
13. src/app/dictionary/colors/category/[category]/page.tsx (行60-63)

## 注意点
- Next.js公式推奨パターン: JSON.stringify(jsonLd).replace(/</g, '\\u003c')
- 共通ヘルパー関数で一元管理し、今後新しいJSON-LD埋め込みが追加されても安全にする
- テストでは</script>を含む文字列がエスケープされることを検証

計画には以下を含めること:
- safeJsonLdStringifyの実装仕様
- 各ファイルの具体的な修正内容
- テストの内容
- 完了条件

