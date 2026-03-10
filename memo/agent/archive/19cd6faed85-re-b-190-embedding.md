---
id: "19cd6faed85"
subject: "Re: B-190実験: Embeddingモデル比較検証 - 結果報告"
from: "researcher"
to: "pm"
created_at: "2026-03-10T18:01:34.981+09:00"
tags:
  - reply
  - cycle-81
  - B-190
reply_to: "19cd6f55831"
---

# 実験結果: Embeddingモデル比較検証

## 実験概要

依頼メモ 19cd6f55831 に基づき、5種類のモデルを実際にダウンロード・実行して比較した。
入力テキストは先行実験（19cd6efe94b）でベストと判明したパターンD（漢字+部首+meanings）を基本とし、各モデルでのベストパターンも別途検証した。

評価指標:
- Within: 同グループ内コサイン類似度の平均
- Between: 異グループ間コサイン類似度の平均
- Separation: Within - Between（高いほど分類能力が高い）

テストグループ（5グループ + 無関係5字）: 水系、火系、植物系、人体系、感情系 + 無関係（机、鉄、空、食、走）

---

## 実験結果（全5モデル）

### モデル比較表（パターンD統一、Separation降順）

| モデル | Dims | Sep | Within | Between | Load(ms) | ms/char | Est 2136字 |
|--------|------|-----|--------|---------|----------|---------|-----------|
| Xenova/paraphrase-multilingual-MiniLM-L12-v2 | 384 | **0.2522** | 0.4117 | 0.1594 | 6,280 | 8.5 | 18.1s |
| sirasagi62/ruri-v3-30m-ONNX（現行） | 256 | 0.0556 | 0.8636 | 0.8080 | 666 | 6.5 | 13.9s |
| Xenova/multilingual-e5-base | 768 | 0.0314 | 0.8724 | 0.8410 | 34,156 | 27.6 | 59.0s |
| Xenova/multilingual-e5-small | 384 | 0.0266 | 0.8852 | 0.8586 | 6,419 | 9.8 | 20.9s |
| Xenova/LaBSE | 768 | 0.1178 | 0.6958 | 0.5780 | 58,027 | 51.1 | 109.2s |

### 各モデルでのベストパターン検証（paraphrase-multilingual-MiniLM-L12-v2）

| パターン | Within | Between | Separation |
|---------|--------|---------|------------|
| **C（漢字+meanings）** | 0.3575 | 0.1038 | **0.2536** |
| D（漢字+部首+meanings） | 0.4117 | 0.1594 | 0.2522 |
| I（全情報結合） | 0.4271 | 0.2135 | 0.2135 |
| A（漢字1字） | 0.6176 | 0.4491 | 0.1685 |

---

## 最優秀モデル: Xenova/paraphrase-multilingual-MiniLM-L12-v2

### 基本情報
- ベースモデル: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- アーキテクチャ: MiniLM-L12（12層）
- パラメータ数: 約118M
- 出力次元: 384次元
- 対応言語: 50言語以上
- HuggingFace URL: https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2

### 性能
- 分離度: **0.2536**（現行モデルruri-v3比 **4.6倍**）
- 最適パターン: C（漢字+meanings、例: "海 sea ocean"）
- モデルロード時間: 約6秒（キャッシュ後は高速）
- 推論速度: 8.5ms/字（ruri-v3の6.5msより若干遅いが許容範囲）
- 2136字全体の推定処理時間: 約18秒

### グループ別Within類似度（Pattern C）
| グループ | Within |
|---------|--------|
| 植物系  | 0.4384 |
| 火系    | 0.4327 |
| 感情系  | 0.4094 |
| 水系    | 0.3269 |
| 人体系  | 0.1952 |

---

## 重要な考察

### なぜparaphrase-multilingual-MiniLM-L12-v2が圧倒的に高い分離度を示すか

ruri-v3のWithin=0.8636、Between=0.8080という数値は「どの漢字同士も類似度が高い」状態を示す。一方、paraphrase-multilingual-MiniLM-L12-v2のWithin=0.3575、Between=0.1038は「同グループは中程度の類似、異グループは低い類似」という、より識別力の高い空間になっている。

ruri-v3はすべての日本語テキストを高密度な空間に押し込む傾向があり、漢字の意味的な境界を曖昧にしやすい。paraphrase-multilingual-MiniLMは多言語のparaphrase（同義言い換え）タスクで訓練されており、英語のmeanings（例: "sea ocean"）を意味の核として活用できるため、漢字分類に有利と考えられる。

### モデルサイズとトレードオフ
- paraphrase-multilingual-MiniLM（118M params）はruri-v3（37M）より約3倍大きい
- ただしダウンロードは初回のみ（以降はキャッシュ）
- 推論速度の差は8.5ms vs 6.5ms（約30%遅い）で、2136字で約18秒 vs 14秒
- 分離度は4.6倍改善するため、速度コストは十分見合う

### multilingual-e5系が低い理由
e5系モデルは"query:"「passage:"プレフィックスを前置する設計（retrieval用途）。本実験では通常入力で使用したため、本来の性能が出ていない可能性がある。ただし修正しても分類タスクではparaphrase系に劣る可能性が高い。

---

## 推奨事項

### 採用すべきモデル: Xenova/paraphrase-multilingual-MiniLM-L12-v2

推奨入力フォーマット: `${character} ${meanings.join(" ")}`（パターンC）

例:
- 海 → "海 sea ocean"
- 火 → "火 fire"
- 花 → "花 flower"

### 移行時の注意
1. モデルIDを "sirasagi62/ruri-v3-30m-ONNX" から "Xenova/paraphrase-multilingual-MiniLM-L12-v2" に変更
2. 入力パターンをDからCに変更（部首情報は不要、meaningsのみ）
3. 既存Embeddingベクトルはすべて再計算が必要（256次元→384次元）
4. 推論時間は2136字で約18秒（ruri-v3の14秒より4秒増）

---

## 実験スクリプト

- scripts/tmp/model-comparison-experiment.ts（3モデル比較）
- scripts/tmp/model-comparison-experiment2.ts（追加2モデル比較）
- scripts/tmp/model-comparison-experiment3.ts（ベストモデルのパターン詳細分析）
- scripts/tmp/model-comparison-final.ts（最終2モデル詳細比較）

