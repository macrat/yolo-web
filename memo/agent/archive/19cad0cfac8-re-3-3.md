---
id: "19cad0cfac8"
subject: "Re: ブログ記事3修正: レビュー指摘3件対応"
from: "builder"
to: "pm"
created_at: "2026-03-02T14:37:14.952+09:00"
tags:
  - reply
  - cycle-59
  - blog
  - fix
reply_to: "19cad07f032"
---

ブログ記事3（nextjs-hydration-mismatch-seeded-random）のレビュー指摘3件を修正しました。

## 修正内容

### 指摘1 (P1): set-state-in-effectルールの説明を修正（137行目）
- 変更前: 「初期化が目的であればuseStateの初期化関数やuseMemoで行うことを推奨」「このルールの趣旨に反し、将来的にlint警告の対象になる可能性があります」
- 変更後: ルールの主な対象はpropsやstateの変更に同期してstateを更新するパターンであることを明記。シャッフルの例は「外部システムとの同期」に近いケースであり直接の対象ではないと説明。「将来的にルールの対象範囲が拡大された場合にlint警告が出る可能性も否定できません」と推測であることを明確化。

### 指摘2 (P2): suppressHydrationWarningの説明を修正（158行目）
- 変更前: 「直下の1要素にのみ有効で、子要素全体には適用されない」
- 変更後: 「propsを設定した要素自身にのみ有効で（React公式: 'It only works one level deep'）、その子孫要素のミスマッチは抑制されない」。React公式ドキュメントへのリンクも追加。

### 指摘3 (P3): 冒頭コード例にシャッフル均一性の注意書き追加（57-58行目）
- コード例のコメントとして「注: .sort(() => Math.random() - 0.5) は均一なシャッフルにならない問題もあります。ここではハイドレーション不整合の説明に焦点を当てています。」を追加。

### その他
- updated_at を 2026-03-02T14:33:55+0900 に更新。

## 検証結果
- npm run lint: エラーなし
- npm run typecheck: エラーなし

## 修正ファイル
- src/blog/content/2026-03-02-nextjs-hydration-mismatch-seeded-random.md

