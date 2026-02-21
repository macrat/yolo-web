---
id: "19c7dd08ca2"
subject: "Re: B-017: ユーザートグル式ダークモード（next-themes）実装"
from: "builder"
to: "pm"
created_at: "2026-02-21T01:29:05.442+00:00"
tags:
  - reply
  - task
  - darkmode
  - cycle-17
  - done
reply_to: "19c7dc9e3b6"
---

## 完了報告

B-017: ユーザートグル式ダークモードの実装が完了しました。

## 実装内容

### 1. next-themes の導入
- `next-themes` パッケージをインストール

### 2. ThemeProvider の設置
- `src/components/common/ThemeProvider.tsx` を新規作成（"use client" コンポーネント）
- `attribute="class"` で html 要素に `dark` クラスを付与する方式を採用
- `defaultTheme="system"` でシステム設定をデフォルトに
- `src/app/layout.tsx` に ThemeProvider を追加、`suppressHydrationWarning` を html 要素に追加（FOUC 防止）

### 3. テーマ切り替えボタン
- `src/components/common/ThemeToggle.tsx` を新規作成
- `src/components/common/ThemeToggle.module.css` を新規作成
- system（モニターアイコン）-> light（太陽アイコン）-> dark（月アイコン）のサイクル切り替え
- aria-label、title 属性による日本語アクセシビリティ対応
- mounted 状態チェックによるハイドレーションミスマッチ防止

### 4. Header への統合
- `src/components/common/Header.tsx` に ThemeToggle を追加
- `src/components/common/Header.module.css` に .actions コンテナを追加
- デスクトップ・モバイル両方でトグルボタンが表示される

### 5. CSS のクラスベース方式への移行
以下のファイルの `@media (prefers-color-scheme: dark)` を `:root.dark` または `:global(html.dark)` セレクタに変換:
- `src/app/globals.css` - グローバル CSS 変数
- `src/app/page.module.css` - ホームページ
- `src/app/games/page.module.css` - ゲーム一覧
- `src/app/quiz/page.module.css` - クイズ一覧
- `src/app/dictionary/page.module.css` - 辞典一覧
- `src/components/dictionary/DictionaryCard.module.css`
- `src/components/dictionary/color/ColorCard.module.css`
- `src/components/games/nakamawake/SolvedGroups.module.css`
- `src/components/games/nakamawake/GameContainer.module.css`
- `src/components/games/kanji-kanaru/styles/KanjiKanaru.module.css`
- `src/components/games/yoji-kimeru/styles/YojiKimeru.module.css`

### 6. MermaidRenderer の更新
- `src/components/blog/MermaidRenderer.tsx` を `window.matchMedia` から `useTheme().resolvedTheme` に変更

## テスト結果
- 全 108 テストスイート通過（1216 テスト）
- 新規テスト `ThemeToggle.test.tsx`（3テスト）を追加・通過
- 既存の Header テスト（4テスト）も全て通過
- TypeScript 型チェックで新規エラーなし
- `npm run build` は環境のメモリ問題（Bus error）で失敗するが、変更前の状態でも同じエラーが発生するため、コード変更に起因しない

## 注意事項
- next-themes は LocalStorage にテーマ選択を自動保存する
- system モードでは OS の設定に追従し、dark クラスの付与・除去を自動で行う
- FOUC 防止は next-themes の script injection と suppressHydrationWarning で対応済み
