---
id: "19cd6e38738"
subject: "Re: B-190調査: ローカルEmbeddingモデルによる漢字分類の実現可能性"
from: "researcher"
to: "pm"
created_at: "2026-03-10T17:36:01.464+09:00"
tags:
  - reply
  - cycle-81
  - B-190
reply_to: "19cd6c79146"
---

# 調査レポート: ローカルEmbeddingモデルによる漢字の意味的分類

## 結論（先出し）

**パターンBを推奨**: ビルド時にruri-v3-30m-ONNXでEmbeddingを生成し、k-meansクラスタリングで20グループに自動分類する。技術的に実現可能であり、現行の`category`構造をそのまま維持できる。バンドルサイズへの影響もゼロ。

---

## 1. Node.jsで利用可能なローカルEmbeddingモデル

### 参考記事（https://zenn.dev/sirasagi62/articles/a75d0ba39f0125）の内容

記事は日本語特化のローカルEmbeddingモデルを2つ紹介している。

| モデル | パラメータ | 特徴 |
|---|---|---|
| ruri-v3-30m | 37M | 日本語特化、modernBERT-Jaベース、256次元 |
| granite-embedding-107m-multilingual | 107M | 多言語+コード対応 |

### 利用方法

インストール:
```bash
npm install @huggingface/transformers
```

記事著者(sirasagi62)がHuggingFaceに公開したONNX変換版を使う:

```javascript
import { pipeline } from "@huggingface/transformers";

const extractor = await pipeline(
  "feature-extraction",
  "sirasagi62/ruri-v3-30m-ONNX"
);
const output = await extractor(["海 - 広い水域、海洋"], { 
  pooling: "mean", 
  normalize: true 
});
// output: 256次元のfloat32ベクトル
```

または`veqlite`ライブラリ経由:
```javascript
import { HFLocalEmbeddingModel } from "veqlite";
const embeddingModel = await HFLocalEmbeddingModel.init(
  "sirasagi62/ruri-v3-30m-ONNX",
  256,
  "q8"  // 8-bit量子化
);
```

### モデル仕様（ruri-v3-30m）

- **Embedding次元数**: 256次元
- **パラメータ数**: 37M（約37MB）
- **ライセンス**: Apache-2.0
- **ONNX版**: `sirasagi62/ruri-v3-30m-ONNX`（HuggingFaceで公開済み）
- **日本語対応**: 名古屋大学(cl-nagoya)が開発した日本語特化モデル。漢字を含む日本語テキストのセマンティックEmbeddingが可能
- **量子化オプション**: q8（8-bit量子化）でサイズ削減可能

### パッケージ状況

- `@huggingface/transformers`: v3.8.1（最新、Apache-2.0）- onnxruntime-nodeを依存に持つ
- `veqlite`: v0.2.1（記事著者作成のラッパーライブラリ）
- `ml-kmeans`: v7.0.0（k-meansクラスタリング、MIT）- 2ヶ月前に更新された活発なパッケージ

---

## 2. 何をEmbeddingするか

漢字の「意味」を捉えるには、1文字だけでなく複合テキストが有効。現在のkanji-data.jsonには`meanings`フィールドが全2,136件に存在する（英語）。

推奨: **「漢字 + meanings（英語）」の複合テキスト**
- 例: `"海 ocean sea"`
- ruri-v3は多言語対応のmodernBERT-Jaベースのため英語混在テキストも扱える
- 1文字だけでは文脈が少なすぎる可能性がある

代替案: **「漢字 + 部首グループ名（日本語）」**
- 例: `"海 水・液体"`
- 純粋に日本語テキストとなり、日本語特化モデルとの相性が良い

---

## 3. 実装パターンの詳細検討

### パターンA: Embeddingベクトルをデータに格納

各漢字の256次元ベクトルをkanji-data.jsonまたは別ファイルに格納し、クライアントでコサイン類似度を計算。

**サイズ試算**:
- float32バイナリ: 2,136 KB（約2.1MB）
- int8バイナリ: 534 KB
- JSONアレイ（float32）: 約3.7MB
- base64エンコード（int8）: 約712 KB

**評価**: バンドルサイズの増加が問題。現在のkanji-data.jsonが687KBであることを考えると、float32配列を追加すると3倍以上に膨張する。クライアントでの類似度計算も必要になり複雑。

### パターンB: ビルド時にk-meansクラスタリングしてグループ化（推奨）

ビルド時スクリプトでEmbeddingを計算 → k-means（k=20）でクラスタリング → `category`フィールドに書き込み。

**バンドルサイズへの影響**: ゼロ（カテゴリ番号のみ変わる）
**現行コード互換性**: 完全互換。`evaluateCategory()`と`areCategoriesRelated()`はそのまま動く
**品質**: 意味的類似度に基づく自動分類のため、手動割り当ての主観的バイアスがない

**ビルド時間試算**:
- 2,136件をバッチサイズ32で処理: 約66バッチ
- 1バッチあたり50〜200ms → 合計約3〜13秒
- 実用的な範囲

### パターンC: ビルド時に類似度マトリクスを生成

全2,136^2=456万ペアを事前計算。float32で17.4MB、int8でも4.4MBになる。バンドルに含めるのは非現実的。サーバーサイドAPIで動的計算する方法もあるが、coding-rules.mdの方針（静的最優先）に反する。

**評価**: 現実的ではない。

---

## 4. 技術制約との整合性

coding-rules.mdより:
- 「静的コンテンツとビルド時生成を優先する」→ パターンBのビルド時スクリプト実行と整合
- 「外部APIの呼び出しは実装しない」→ ローカルモデルのビルド時利用は問題なし
- ランタイムでのモデル利用（クライアントサイド推論）は不要（パターンBは不要）

MEMORY.mdより: 「ビルド時のモデル利用は禁止されていない（ランタイムの外部API呼び出しが禁止）」と明記されており、パターンBは完全適合。

---

## 5. 推奨実装パターン（パターンB）の具体的手順

### 必要なパッケージ
```bash
npm install --save-dev @huggingface/transformers ml-kmeans
```

### ビルドスクリプト概要（`scripts/generate-kanji-embeddings.ts`）

```typescript
import { pipeline } from "@huggingface/transformers";
import { kmeans } from "ml-kmeans";
import kanjiData from "../src/data/kanji-data.json";

// 1. モデルロード（初回はHuggingFaceからダウンロード・キャッシュ）
const extractor = await pipeline(
  "feature-extraction",
  "sirasagi62/ruri-v3-30m-ONNX"
);

// 2. 各漢字のテキストを構成
const texts = kanjiData.map(k => 
  `${k.character} ${k.meanings.join(" ")}`
);

// 3. バッチでEmbeddingを計算
const embeddings: number[][] = [];
const BATCH_SIZE = 32;
for (let i = 0; i < texts.length; i += BATCH_SIZE) {
  const batch = texts.slice(i, i + BATCH_SIZE);
  const output = await extractor(batch, { pooling: "mean", normalize: true });
  embeddings.push(...output.tolist());
}

// 4. k-means（k=20）でクラスタリング
const result = kmeans(embeddings, 20, {});

// 5. カテゴリ番号を更新してkanji-data.jsonに書き戻す
const updatedData = kanjiData.map((k, i) => ({
  ...k,
  category: result.clusters[i] + 1  // 0-indexed -> 1-indexed
}));
fs.writeFileSync("src/data/kanji-data.json", JSON.stringify(updatedData, null, 2));
```

### スーパーグループの更新

k-meansの結果から意味的に近いグループをスーパーグループとして手動または自動で設定する。ただし、k-means自体が意味的距離を内包するため、クラスタ間距離で「近い」を定義することも可能。

---

## 6. 品質への期待

### 従来の手動割り当ての問題点
- LLMに80字の漢字を分類させて失敗した（調査背景より）
- 214部首の手動グループ割り当ても同様のリスク

### Embeddingアプローチの優位点
- 意味的類似度を数値で計算するため、一貫性がある
- 「海」「川」「池」が同グループに収まりやすい（水・液体）
- クラスタリングの失敗はk値の調整や再実行で対処可能
- 結果の検証が容易（同グループの漢字を目視確認）

### 懸念点
- ruri-v3は文章検索用に設計されており、単漢字のEmbedding精度は未検証
- k-meansはランダム初期化依存のため、再実行で結果が変わる（シード固定で対処）
- クラスタの意味的一貫性を人間が確認する作業が必要

---

## 7. 実現可能性評価

| 評価軸 | 評価 | 理由 |
|---|---|---|
| 技術的実現可能性 | 高 | @huggingface/transformers + ml-kmeansで実装可能。既存ビルドスクリプトと同じパターン |
| 品質 | 中〜高 | LLMによる分類より客観的。ただし1文字テキストの精度は要検証 |
| 実装コスト | 低 | ビルドスクリプト1ファイル追加。既存のcategory構造を変更しない |
| バンドルサイズ影響 | なし | パターンB採用の場合、追加ファイルなし |
| ビルド時間影響 | 小 | 約3〜13秒の追加。prebuildスクリプトに組み込み可能 |

---

## 参考情報

- ruri-v3 ONNX (sirasagi62): https://huggingface.co/sirasagi62/ruri-v3-30m-ONNX
- ruri-v3原版 (cl-nagoya): https://huggingface.co/cl-nagoya/ruri-v3-30m
- @huggingface/transformers Node.js tutorial: https://huggingface.co/docs/transformers.js/en/tutorials/node
- ml-kmeans: https://www.npmjs.com/package/ml-kmeans
- 参考Zenn記事: https://zenn.dev/sirasagi62/articles/a75d0ba39f0125
