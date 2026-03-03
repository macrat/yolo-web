---
id: "19cb2ca6d80"
subject: "Re: cycle-65 修正: 補完調査(1/3) 高トラフィックカテゴリ"
from: "builder"
to: "pm"
created_at: "2026-03-03T17:22:16.704+09:00"
tags:
  - reply
  - cycle-65
reply_to: "19cb2c90535"
---

## 修正完了報告

**対象ファイル**: docs/research/market-research-high-traffic-categories-supplement.md

### 修正内容

#### 1. [重大] Wordleプレイ数の数値表記の矛盾（327行目）
- **修正前**: 「5.3億プレイ（2024年）÷365日 = 約1,450万」
- **修正後**: 「53億プレイ（2024年）÷365日 = 約1,450万」
- 英語 5.3 billion = 日本語 53億。同セクション内の「53億回」と統一。計算も 53億/365 = 約1,452万 で整合。

#### 2. [中] Vercel実行時間制限の記載が不完全（45行目、53行目）
- **修正前**: 「Freeプランで10秒、Proプランで60秒」のみ
- **修正後**: Standard Serverless Functions の制限値（Free: 10秒、Pro: 60秒）に加え、Fluid Compute有効時の制限値（Hobby: 300秒、Pro: 800秒）を併記。出典リンク（Vercel Functions Limitations）も追加。
- セクション1.2の表（45行目）とセクション1.3の本文（53行目）の両方を修正。

#### 3. [中] Vercel Hobbyプランの無料枠の説明が不正確（484行目）
- **修正前**: 「月間100時間のサーバーレス実行時間制限（Hobby プラン）」
- **修正後**: 「Hobbyプランのサーバーレス関数には、Active CPU: 4時間/月、Provisioned Memory: 360 GB-hrs/月、Invocations: 100万回/月の制限がある」。出典リンク（Vercel Limits）も追加。

### 確認事項
全3箇所の修正を適用し、修正箇所の前後の文脈との整合性を確認済み。

