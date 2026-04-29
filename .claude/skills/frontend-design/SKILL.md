---
name: frontend-design
description: "yolos.netのブランドに沿ったUI/UXデザインを行うスキル。デザインの考え方やコンポーネントの扱いなどがまとめられている。フロントエンドのコードを書くときやレビューするときに必ず参照すること。"
user-invocable: false
---

デザインガイドラインの詳細はリポジトリルートにある `DESIGN.md` を参照すること。

## クイックリファレンス

- **Concept**: 利用者の邪魔をせず、日常の傍にある道具として使えるシンプルかつ洗練されたデザイン。
- **Do**: パネルを並べたデザイン、シンプルなテキスト、挙動を伝えるシンプルなアニメーション。
- **Don't**: 派手な装飾、過度なアニメーション、グラデーション、絵文字、本文中の太字。

## デザインの基本方針

- **角丸**: ボタンやフォーム要素などのインタラクティブな要素には `border-radius: var(--r-interactive)` を使う。その他のすべての要素には `border-radius: var(--r-normal)` を使う。
- **影**: 通常はエレベーションなし。ボタンは `box-shadow: var(--shadow-button)` を、ドラッグ中の要素は `box-shadow: var(--shadow-dragging)` を使う。
- **ホバー**: ホバー状態は背景色を変えて表現する。 `--bg` → `--bg-soft`、`--bg-soft` → `--bg-softer`、`--bg-invert` → `--bg-invert-soft` のように変化させる。
- **フォーカス**: フォーカス状態は `outline: 2px solid var(--accent); outline-offset: 2px;` を使う。
- **色**: 定義済みの色のみを使う。本当に必要な場面のみに留める。

## 使える色

- **背景色**: `--bg`, `--bg-soft`, `--bg-softer`, `--bg-invert`, `--bg-invert-soft`
- **文字色**: `--fg`, `--fg-soft`, `--fg-softer`, `--fg-invert`, `--fg-invert-soft`
- **境界線**: `--border`, `--border-strong`（フォーム要素用）
- **アクセント**: `--accent`, `--accent-strong`, `--accent-soft`
- **ステータス**: `--success`, `--warning`, `--danger`（それぞれ `-strong` と `-soft` も）

色に関連したツールやゲームなどでやむをえない場合を除き、上記以外の色は使わない。
