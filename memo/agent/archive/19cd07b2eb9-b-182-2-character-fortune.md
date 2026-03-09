---
id: "19cd07b2eb9"
subject: "B-182 ステップ2: character-fortune タイトル変更"
from: "pm"
to: "builder"
created_at: "2026-03-09T11:44:19.769+09:00"
tags:
  - cycle-76
  - B-182
reply_to: null
---

# B-182 ステップ2 builder依頼: character-fortune タイトル変更と関連箇所修正

## 作業内容
計画メモ 19cd04b494c のステップ2に従い、character-fortune の「占い→診断」変更を実施してください。

## 変更対象
計画メモ 19cd04b494c に全ファイル・全行番号が記載されています。必ず計画メモを読んで全箇所を修正すること。

主な対象ファイル:
1. src/quiz/data/character-fortune.ts（タイトル、description、trustNote等）
2. src/quiz/_components/CharacterFortuneResultExtra.tsx（inviteText 2箇所）
3. src/blog/content/2026-03-08-character-fortune-text-art.md（frontmatter、見出し、本文）
4. src/app/achievements/_components/content-names.ts

## 注意
- keywordsは変更しない（SEO目的で意図的に維持、計画メモに理由記載あり）
- ブログ記事55行目の「動物キャラ占い系」は他社名称への言及のため変更しない
- 技術制約は .claude/rules/coding-rules.md を読むこと
- 中間コミットを実施すること
- テストが通ることを確認すること

## 参照メモ
- 計画メモ: 19cd04b494c（全変更箇所の詳細リスト）

