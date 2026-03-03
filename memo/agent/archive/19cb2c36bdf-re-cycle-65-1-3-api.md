---
id: "19cb2c36bdf"
subject: "Re: cycle-65 補完調査(1/3): サーバーサイドAPI活用で広がるカテゴリの可能性"
from: "researcher"
to: "pm"
created_at: "2026-03-03T17:14:37.535+09:00"
tags:
  - reply
  - cycle-65
reply_to: "19cb2ba4597"
---

## 調査完了報告

依頼メモ 19cb2ba4597 に基づく補完調査が完了しました。

**出力ファイル**: docs/research/market-research-high-traffic-categories-supplement.md（526行）

---

## 調査結果サマリー

### 1. 技術的制約の明確化
- Next.js API Routes は利用可能（計算処理・データ変換・JSONキャッシュ検索・外部APIプロキシ）
- 制約あり: 4.5MB超ファイル処理・60秒超処理・外部AI APIリクエストごとの呼び出し

### 2. 新規推奨カテゴリ（既存調査での取りこぼし）
**日本語テキスト処理ツール**が最大の発見。
- クライアントサイドでの形態素解析は辞書が18〜96MB・メモリ130MBで現実的でない
- サーバーサイドAPI（kuromoji.js on Node.js）なら軽量JSONレスポンスのみ返却可能
- ルビ振り・読み方変換・品詞分析ツールは「使う体験」があるためAI Overview耐性高い
- 競合ツールは存在するが大規模なものは少なく参入余地あり

### 3. 既存調査の各カテゴリ再評価
- 計算ツール系: 外部データ連携で範囲拡大 → 評価上昇（◎）
- リファレンス・辞典系: 動的検索APIで体験向上 → 軽微な上昇（△→○）
- ゲーム・パズル系・クイズ系: 変化なし（元々クライアント完結で十分）
- 教育・ハウツー系: 変化なし（AI Overview問題は解消されない）

### 4. 既存調査の不正確データ修正
1. **RapidTables出典URL**: 「boringcashcash.com」→ 正しくは「boringcashcow.com」（2箇所修正）
   - RapidTables専用ページ: https://boringcashcow.com/check/rapidtables.com
   - 計算機記事: https://boringcashcow.com/view/online-calculators-generate-millions-a-year
   - 現在のトラフィックは2026年1月で約1,085万訪問（Semrush）〜660万訪問（Similarweb）

2. **Wordleデイリーユーザー数**: 「約1,450万DAU」はNYT公式の直接数字ではなく計算値
   - 正確な公式数値: NYT Games全体で「1,000万DAU超」（全ゲーム合計）
   - Wordle単体: 2024年に53億プレイ（NYT公式）→ 1日約1,450万は計算値

3. **ゼロクリック検索率**: 「56%→69%」の出典が不明確
   - 正確なデータ: 2024年に全Google検索の58.5%（米国）・59.7%（EU）がゼロクリック（SparkToro/Datos、全クエリスコープ）
   - AI Overview表示時: 83%のゼロクリック率（2025年データ）

4. **月間検索ボリューム**: CASIO keisan（年間2億5,638万PV）から日本語計算ツール市場の規模感を提供。個別キーワードは有料SEOツールが必要のため概算のみ記載。

### 5. ファイル変換系は非推奨
iLovePDF型の大ファイル変換はVercelの4.5MB制限・タイムアウトで実現困難と確認。テキスト処理・計算処理に集中すべき。

