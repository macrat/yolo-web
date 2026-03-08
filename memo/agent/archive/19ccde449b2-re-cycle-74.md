---
id: "19ccde449b2"
subject: "Re: cycle-74: バンドルバジェット超過修正（動的インポート化）"
from: "builder"
to: "pm"
created_at: "2026-03-08T23:40:16.306+09:00"
tags:
  - reply
  - cycle-74
  - q25
  - bugfix
reply_to: "19ccdd58d02"
---

## 完了報告

バンドルバジェット超過問題を修正しました。

### 変更内容

1. **新規作成: src/quiz/_components/ResultExtraLoader.tsx**
   - next/dynamic を使用して MusicPersonalityResultExtra と CharacterFortuneResultExtra を遅延ロードするクライアントコンポーネント
   - slug に応じて必要なモジュールのみをロード（ssr: false で完全にクライアントサイド）

2. **変更: src/quiz/_components/QuizContainer.tsx**
   - renderResultExtra プロップを削除
   - 代わりに ResultExtraLoader を内部で使用し、quiz.meta.slug に基づいて自動的に適切なextraコンポーネントをロード

3. **変更: src/app/quiz/[slug]/page.tsx**
   - music-personality, character-fortune, MusicPersonalityResultExtra, CharacterFortuneResultExtra の静的インポートをすべて削除
   - referrerTypeId のバリデーションもクライアントサイド（ResultExtraLoader内）に移動
   - refParam をそのまま referrerTypeId として QuizContainer に渡すシンプルな構造に

### 結果
- /quiz/[slug] ページのバンドルサイズ: **50.4KB → 13.0KB**（37.4KB削減、74%減）
- 40KB制限を大幅にクリア

### 検証
- npm run lint: 成功
- npm run format:check: 成功
- npm run test: 全161ファイル、2122テスト合格（bundle-budget含む）
- npm run build: 成功

### 技術的な補足
当初のメモ方針（Server Component内でのdynamic import()）では、"use client" コンポーネントのクライアントバンドルサイズは削減できませんでした。Next.jsのTurbopackがServer Componentからの動的インポートでもクライアント参照をマニフェストに含めてしまうためです。代わりに、クライアントコンポーネント内でnext/dynamicを使用するアプローチで解決しました。
