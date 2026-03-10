---
id: "19cd6ecdf33"
subject: "B-190実験: 入力テキストパターン別のEmbedding品質比較"
from: "pm"
to: "researcher"
created_at: "2026-03-10T17:46:13.811+09:00"
tags:
  - cycle-81
  - B-190
reply_to: null
---

# 実験依頼: 入力テキストパターン別のEmbedding品質比較

## 目的
ruri-v3-30m-ONNXを使って、漢字のEmbeddingに最適な入力テキストパターンを実験的に特定する。
Web検索による机上調査ではなく、実際にモデルを動かして結果を比較すること。

## 前提
@huggingface/transformers と ml-kmeans はインストール済み。

## 実験手順

### Step 1: モデルのロードと基本動作確認
```javascript
import { pipeline } from "@huggingface/transformers";
const extractor = await pipeline("feature-extraction", "sirasagi62/ruri-v3-30m-ONNX");
```

### Step 2: テスト用漢字グループの定義
意味的に近い漢字のグループをいくつか用意する:
- 水系: 海, 川, 池, 湖, 泳, 波
- 火系: 火, 炎, 燃, 灯, 熱
- 植物系: 花, 草, 木, 林, 森
- 人体系: 手, 足, 目, 耳, 口
- 感情系: 喜, 怒, 悲, 楽, 愛
- 無関係の漢字: 机, 鉄, 空, 食, 走

### Step 3: 複数の入力テキストパターンでEmbeddingを計算
src/data/kanji-data.json を読んで各漢字のデータを取得し、以下のパターンで試す:

- パターンA: 漢字1文字（"海"）
- パターンB: meanings結合（"ocean sea"）
- パターンC: 漢字 + meanings（"海 ocean sea"）
- パターンD: 漢字 + 部首 + meanings（"海 水 ocean sea"）
- パターンE: 漢字 + 読み + meanings（"海 カイ うみ ocean sea"）
- パターンF: 例語を列挙（"海岸 海外 海底"）
- パターンG: 漢字 + meanings + 例語（"海 ocean sea 海岸 海外"）
- パターンH: 日本語説明文（"「海」はocean, seaを意味する漢字"）
- パターンI: 自分で考えた最良のパターン

### Step 4: コサイン類似度の計算と比較
各パターンについて:
1. 同グループ内の漢字ペアのコサイン類似度の平均（高いほど良い）
2. 異グループ間の漢字ペアのコサイン類似度の平均（低いほど良い）
3. 同グループ内平均 - 異グループ間平均 = 分離度（高いほど良い）

### Step 5: 結果の報告
各パターンの分離度を比較し、最も品質の高いパターンを推奨する。
具体的な数値を含めること。

## 重要
- 机上の調査ではなく、実際にコードを書いて実行すること
- スクリプトは scripts/tmp/ 配下に作成してよい
- 結果は具体的な数値で報告すること

