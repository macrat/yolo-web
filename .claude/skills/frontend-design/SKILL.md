---
name: frontend-design
description: |
  yolos.net のフロントエンドデザインシステム。色・カラー・タイポグラフィ・
  フォント・レイアウト・余白・スペーシング・角丸・ヘッダー・フッター・ボタン・
  パネル・入力欄・記事エリア・CSS Modules について作業するとき、または
  デザインレビュー・UI レビュー・視覚的変更のレビューを行うときに参照する。
  Named Tone（functional-quiet 等）・CSS 変数・コンポーネント API を含む。
user-invocable: false
paths:
  - "src/**/*.tsx"
  - "src/**/*.module.css"
  - "src/app/globals.css"
---

<!--
  このファイルの役割: デザインシステム skill の玄関（道案内）
  書くこと: デザインシステム全体の概要・Quick reference・Quick rules・NEVER 節の要約・各ファイルへの案内
  書かないこと: CSS 変数の値そのもの・コンポーネントの詳細 API・移行表・対応表・サイクル固有の注釈
  詳細な判断基準（哲学・トーン・NEVER）は philosophy.md が担う
-->

# frontend-design スキル

yolos.net の UI を作るとき・直すとき・レビューするときの道案内。
判断基準と哲学は [`philosophy.md`](philosophy.md) が担う。ここは入口として必要な地図だ。

---

## 値と変数を参照するとき

CSS 変数の値・カテゴリ・用途コメントは **`src/app/globals.css` を直接読む**。
ここには変数名も値も書かない。globals.css のコメントが単一情報源であり、ここに対応表を置くと二重管理になる。

セクション構成（globals.css に記載）: Surface / Text / Border / Accent & Status / フォント / タイプスケール / 行送り / 字間 / スペーシング / 角丸 / Elevation / モーション

## コンポーネントを参照するとき

`src/components/design-system/` 配下の TypeScript 型定義と JSDoc を直接読む。
各コンポーネントのファイル冒頭に「用途・使う場面・使わない場面」が JSDoc で書かれている。

## 判断に迷ったとき

[`philosophy.md`](philosophy.md) を読む。Named Tone `functional-quiet` の定義・5 ターゲットへの効き方・NEVER 節（やってはいけない視覚表現）がある。

迷ったときの問いは philosophy.md 末尾に一文ある。止まって読むこと。

---

## クイックルール（詳細は philosophy.md）

- **グラデーション・glassmorphism・装飾的影は使わない** — 代わりに明度差と余白で表現する
- **ヘッダーは固定しない。ナビゲーションは本文より目立てない** — ツールが主役、ナビは脇役
- **Inter / Roboto をフォールバックなしで第一候補にしない** — yolos.net は Noto Sans JP を中心に据える

---

## ファイル構成

| ファイル        | 役割                                             |
| --------------- | ------------------------------------------------ |
| `SKILL.md`      | この道案内（玄関）                               |
| `philosophy.md` | デザイン哲学・Named Tone・5 ターゲット・NEVER 節 |
