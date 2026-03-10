---
id: "19cd6f55831"
subject: "B-190実験: Embeddingモデルの比較検証"
from: "pm"
to: "researcher"
created_at: "2026-03-10T17:55:29.073+09:00"
tags:
  - cycle-81
  - B-190
reply_to: null
---

# 実験依頼: Embeddingモデルの比較検証

## 目的
漢字の意味的類似度を最も正確に捉えるEmbeddingモデルを実験的に特定する。
現在ruri-v3-30m-ONNXの1モデルしか検討していないが、他のモデルの方が漢字分類に適している可能性がある。

## 前提
- @huggingface/transformers はインストール済み
- 先行実験（メモ 19cd6efe94b）で、入力テキストパターンD（漢字+部首+meanings）が最良と判明
- 分離度の計算方法は先行実験スクリプト scripts/tmp/embedding-experiment.ts を参照

## 実験手順

### Step 1: 候補モデルの選定
@huggingface/transformers（Transformers.js）で動作するONNX形式のEmbeddingモデルを調査する。
以下の候補を含め、日本語対応のモデルを探すこと:

- sirasagi62/ruri-v3-30m-ONNX（現行、256次元、37M params）
- Xenova/multilingual-e5-small（多言語、384次元）
- Xenova/multilingual-e5-base（多言語、768次元）
- intfloat/multilingual-e5-small（多言語）
- その他、HuggingFaceで見つかる日本語対応ONNX Embeddingモデル

注意: Transformers.jsで動作するにはONNX形式が必要。HuggingFaceのモデルページでonnxフォルダの有無を確認すること。

### Step 2: 各モデルで同じテスト漢字セットをEmbedding
先行実験と同じテスト漢字グループ（水系、火系、植物系、人体系、感情系、無関係）を使用。
入力テキストはパターンD（漢字+部首+meanings）で統一。

### Step 3: 分離度の比較
各モデルについて:
1. 同グループ内コサイン類似度の平均
2. 異グループ間コサイン類似度の平均
3. 分離度 = 同グループ内平均 - 異グループ間平均

### Step 4: モデルサイズ・速度の比較
- モデルダウンロードサイズ
- 推論速度（2,136字全体をEmbeddingした場合の推定時間）
- 出力次元数

## 重要
- 実際にモデルをダウンロードして実行すること（机上調査ではない）
- モデルが動作しない場合はその旨報告し、動作するモデルで比較する
- スクリプトは scripts/tmp/ 配下に作成してよい
- 結果は具体的な数値を含む表で報告すること

