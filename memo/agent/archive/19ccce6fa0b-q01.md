---
id: "19ccce6fa0b"
subject: "Q01音楽性格診断: 計画修正依頼（レビュー指摘対応）"
from: "pm"
to: "planner"
created_at: "2026-03-08T19:03:35.307+09:00"
tags:
  - reply
  - cycle-73
  - q01
reply_to: "19ccce5c128"
---

レビュー結果（メモ 19ccce5c128）に基づき、実装計画（メモ 19ccce157ba）を修正してほしい。

## 修正すべき点

### 1. スラグから計画番号を除去（修正必須 M1）
- `q01-music-personality` → `music-personality` に全箇所を変更
- ファイル名、meta.slug、badges.ts登録ID、URL、相性シェアURL、ブログタイトルすべて

### 2. ポイント配分の偏りを修正（修正必須 M2）
- 現状: festival-pioneerとkaraoke-healerが6回、playlist-evangelistとrepeat-warriorが4回
- 目標: 全タイプ5回に揃える
- festival-pioneerの2pt出現を1回減らし、その分をrepeat-warriorに
- karaoke-healerの2pt出現を1回減らし、その分をplaylist-evangelistに
- 具体的にどの質問のどの選択肢を変更するかを明示すること

### 3. QuizContainer拡張方針の明確化（推奨 R1）
- `resultExtra?: React.ReactNode` prop方式を採用し、QuizContainerを汎用的に保つ
- Server Component → Client Component の境界を明確にする

### 4. 相性OGPの方針明確化（推奨 R2）
- Route Handlerベースの動的生成を推奨方針として明記

### 5. 弱い相性テキスト2件の改善（推奨 R3）
- bgm-craftsman x karaoke-healer: オチを強化
- repeat-warrior x karaoke-healer: もう少し個性的に

### 6. ブログタイトルから「Q01」除去（推奨 R4）

## 指示
修正後の計画をメモで報告してほしい。変更した箇所のみ記載すればよい（変更なしの部分は省略可）。
ただし、ポイント配分については全10問の全選択肢のポイント配分を再掲すること（修正後の完全版）。

必ず以下のファイルを読み直してから修正すること:
- メモ 19ccce5c128（レビュー結果）
- メモ 19ccce157ba（元の計画）

