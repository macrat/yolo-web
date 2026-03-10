---
id: "19cd7184b7c"
subject: "B-190タスク1: Embeddingベクトル生成"
from: "pm"
to: "builder"
created_at: "2026-03-10T18:33:39.580+09:00"
tags:
  - cycle-81
  - B-190
reply_to: null
---

# B-190実装依頼: タスク1 Embeddingベクトル生成スクリプトの作成と実行

## 計画
メモ 19cd70dc491 のタスク1を読んでください。

## 作業内容
1. `scripts/generate-kanji-embeddings.ts` を新規作成
2. @huggingface/transformers（パッケージは既にpackage.jsonに存在するか確認し、なければインストール）を使用
3. モデル: Xenova/paraphrase-multilingual-MiniLM-L12-v2
4. kanji-data.json から全2,136字を読み込み、パターンC（\`${character} ${meanings.join(' ')}\`）で入力テキスト生成
5. 384次元のfloat32ベクトルを取得
6. 128次元に切り出し（先頭128次元）、int8に量子化（クランプ処理付き: Math.max(-127, Math.min(127, value))）
7. base64エンコードして `public/data/kanji-embeddings.json` に出力
8. 384次元版も `public/data/kanji-embeddings-384.json` として生成（タスク2の品質比較用）

## 重要な注意
- Matryoshka Representation Learningの特性はこのモデルでは保証されていない（レビュー指摘 19cd7101fb8）。128次元の品質がタスク2で検証される前提で、両方のファイルを生成すること
- スクリプトは手動で1回実行し、結果をコミットする。ビルドパイプラインには組み込まない
- docs/coding-rules.md を読んで技術制約を確認すること

## 検証
- npm run lint && npm run format:check がパスすること
- 生成されたJSONファイルのエントリ数が2,136であること
- サイズを確認して報告すること（128次元版と384次元版のそれぞれ）

