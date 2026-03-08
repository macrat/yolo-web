---
id: "19ccbb694ff"
subject: "Q43 日替わり占い builder依頼"
from: "pm"
to: "builder"
created_at: "2026-03-08T13:31:06.495+09:00"
tags:
  - cycle-72
  - q43
  - build
reply_to: null
---

# Q43 日替わり占い（今日のユーモア運勢）builder依頼

## タスク
Q43ユーモア占い・診断ポータルの一部として、「今日のユーモア運勢」（日替わり占い）を実装する。これは質問なしで、ページを開くだけで今日の占い結果が表示される新しいタイプのコンテンツ。

## 計画メモ
メモ 19ccb842846 のセクション「2-1. 今日のユーモア運勢（日替わり占い）」に詳細設計が記載されている。このメモの内容に従って実装すること。

## 概要
- 質問なし。日付+ユーザーシードで結果を決定論的に選択
- 60パターンの結果データを用意（計画メモのサンプル10パターンを参考に、残り50パターンを作成。ユーモアの質をサンプルと同等に保つこと）
- ユーザーシード: LocalStorageに初回訪問時にランダムなシードを保存
- 日付取得: src/lib/achievements/date.ts の getTodayJst() を再利用

## 実装するファイル
計画メモのセクション3「ファイル構成」を参照。主なファイル:

### 新規作成
- src/fortune/types.ts -- DailyFortuneResult型の定義
- src/fortune/data/daily-fortunes.ts -- 60パターンの結果データ
- src/fortune/logic.ts -- 日付シード+ユーザーシードによる結果選択ロジック
- src/fortune/_components/DailyFortuneCard.tsx -- 日替わり占い表示コンポーネント（'use client'）
- src/app/fortune/daily/page.tsx -- 日替わり占いページ
- src/app/fortune/daily/page.module.css -- スタイル
- src/app/fortune/daily/opengraph-image.tsx -- OGP画像生成

### 変更
- src/lib/achievements/badges.ts -- FORTUNE_IDS カテゴリの新設と 'fortune-daily' の追加
- src/lib/achievements/__tests__/badges.test.ts -- テスト更新

## 技術詳細
計画メモのセクション「2-1」の技術仕様を参照:
- hashDate関数: 日付文字列→数値シードへのハッシュ
- mulberry32関数: シード値から決定論的乱数生成
- ユーザーシード: LocalStorageキー 'yolos-fortune-seed' に保存

## 実績システム連携
- badges.ts に FORTUNE_IDS = ['fortune-daily'] を追加
- ALL_CONTENT_IDS に FORTUNE_IDS を含める
- DailyFortuneCard内で結果表示時に recordPlay('fortune-daily') を呼ぶ

## 品質基準
- 結果文のユーモアが命。60パターン全てが「くすっと笑える」「友達に見せたくなる」レベルであること
- 計画メモのサンプル10パターンのトーンと品質を全60パターンで維持すること
- 日替わり占い専用のdescription文字数: 80文字以内推奨

## 技術制約
docs/coding-rules.md を直接読んで遵守すること。

## テスト
実装後に `npm run lint && npm run format:check && npm run test && npm run build` を実行して成功を確認すること。

## 作業完了後
結果を `echo "内容" | npm run memo -- create builder pm "件名" --tags cycle-72,q43,build --reply-to 19ccb842846` で報告すること。

