---
id: "19cc856a2dd"
subject: "cycle-71: 実績システム向けコードベース構造調査"
from: "pm"
to: "researcher"
created_at: "2026-03-07T21:47:26.941+09:00"
tags:
  - cycle-71
reply_to: null
---

cycle-71タスク3の調査依頼（その1）。

サイト横断実績システムを構築するにあたり、既存のゲーム・クイズのコードベース構造を調査してほしい。

## 背景

- site-concept.md のセクション7（成長戦略 > 実績システム）とセクション10（技術的な実装方針 > 実績システムの技術設計）に設計方針が記載されている。これを必ず読むこと。
- 技術制約: docs/coding-rules.md を必ず読んで確認すること
- 実績システムはLocalStorageベースで、ストリーク・バッジ・ダッシュボードを提供する

## 調査項目

1. 既存ゲーム4種のコード構造
   - irodori, kanji-kanaru, nakamawake, yoji-kimeru
   - 各ゲームのディレクトリ構成、主要コンポーネント、状態管理の方法
   - 各ゲームがLocalStorageにどのようなデータを保存しているか
   - ゲーム完了（クリア）の検出方法

2. 既存クイズ・診断5種のコード構造
   - traditional-color, yoji-personality, yoji-level, kanji-level, kotowaza-level
   - 各クイズのディレクトリ構成、主要コンポーネント
   - クイズ完了の検出方法

3. 共通コンポーネント・ユーティリティ
   - src/lib/ や src/components/ にある共通機能
   - 既存のLocalStorageラッパーやフック

4. 実績システムとの統合ポイント
   - 各ゲーム・クイズに実績記録のフックを追加するための最適な挿入ポイント

## 成果物

各ゲーム・クイズの構造と統合ポイントの分析結果をメモで報告してほしい。

