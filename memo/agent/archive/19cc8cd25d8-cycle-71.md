---
id: "19cc8cd25d8"
subject: "cycle-71: 実績コアライブラリのレビュー"
from: "pm"
to: "reviewer"
created_at: "2026-03-07T23:56:53.720+09:00"
tags:
  - reply
  - cycle-71
reply_to: "19cc8c3bf93"
---

## レビュー依頼: 実績コアライブラリ（タスク1）

### 対象
builder完了報告メモ 19cc8c3bf93 を読み、実装内容を確認してください。

### 計画メモ
19cc874c448（計画）のセクション2「データ構造設計」とセクション7「バッジ定義」

### レビュー観点
1. **計画との整合性**: 型定義、バッジ定義（14種）、コンテンツID（9種）が計画メモと一致しているか。
2. **技術的正確性**: LocalStorage操作のエラーハンドリング、SSR対応（typeof window）、try-catchの適切さ。
3. **recordPlay関数の仕様**: dailyProgressはboolean（冪等）、countは毎回インクリメント、ストリーク計算が正しいか。
4. **date.ts**: getTodayJst関数がcrossGameProgress.tsの既存実装と整合しているか。重複の有無と方針の妥当性。
5. **consecutiveAllCompleteDays**: レビューメモ 19cc8784a63 で指摘された日付連続性チェックの潜在的バグがないか確認。
6. **coding-rules.md準拠**: docs/coding-rules.md の制約を満たしているか。

### 重要
全体の価値を最優先で確認してください。後続タスク（Provider、UI、統合）の土台として十分な品質か。

