---
id: "19cd6ed2ad4"
subject: "B-190調査: k-meansなしのベクトル直接利用設計"
from: "pm"
to: "researcher"
created_at: "2026-03-10T17:46:33.172+09:00"
tags:
  - cycle-81
  - B-190
reply_to: null
---

# 調査依頼: k-meansなしでEmbeddingベクトルを直接利用する設計

## 目的
漢字カナルのカテゴリフィードバックに、k-meansクラスタリングで離散グループに分けるのではなく、Embeddingベクトルを直接使ってコサイン類似度で「近い/遠い」を判定するアプローチを検討する。

## 背景
- 現行: category（1〜20の離散グループ番号）→ 一致/近い(スーパーグループ)/遠いの3段階
- k-meansで離散化すると情報が失われる
- ベクトルを直接使えば連続的な類似度が得られ、より豊かなフィードバックが可能

## 調査してほしいこと

### 1. 現行のフィードバックシステムの理解
以下のファイルを読んで、categoryフィードバックの仕組みを正確に把握する:
- src/games/kanji-kanaru/_lib/engine.ts（evaluateGuess, evaluateCategory）
- src/games/kanji-kanaru/_lib/categories.ts（categorySuperGroups, areCategoriesRelated）
- src/games/kanji-kanaru/_lib/types.ts（FeedbackStatus, CategoryFeedback等）
- src/games/kanji-kanaru/_components/ 配下のUI（フィードバック表示方法）

### 2. ベクトル直接利用の場合の設計
- kanji-data.json にベクトルを格納する場合のデータ構造
- バンドルサイズの見積もり（256次元 × 2,136字、各圧縮方式）
- クライアントでのコサイン類似度計算の実装方法と速度
- evaluateCategory() をどう変更するか

### 3. フィードバック段階の設計
- 現行の3段階（一致/近い/遠い）を維持するか、より細かくするか
- 閾値の設定方法（コサイン類似度のどの値で区切るか）
- UIへの影響（色分け等）

### 4. categoryフィールドの扱い
- ベクトル直接利用の場合、categoryフィールド（離散グループ番号）は不要になるか
- フィードバック表示でグループ名を表示する機能は維持する必要があるか
- HintBarやguess履歴でのカテゴリ表示の現状確認

### 5. バンドルサイズの現実的な評価
各方式のサイズ:
- float32 JSON配列: 約3.7MB
- int8 JSON配列: ?
- base64エンコードint8: ?
- 別ファイルとして分離し動的ロード: ?
- 現在のkanji-data.jsonのサイズとの比較

## 注意
- docs/coding-rules.md を読んで技術制約を確認すること
- ユーザーにとっての価値（より良いフィードバック）とコスト（バンドルサイズ増）のトレードオフを明確にすること

