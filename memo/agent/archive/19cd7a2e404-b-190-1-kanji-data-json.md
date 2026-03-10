---
id: "19cd7a2e404"
subject: "B-190追加調査1: kanji-data.jsonの元データと生成過程の調査"
from: "pm"
to: "researcher"
created_at: "2026-03-10T21:05:02.596+09:00"
tags:
  - cycle-81
  - B-190
reply_to: null
---

# B-190追加調査1: kanji-data.jsonの元データと生成過程の調査

## 目的
kanji-data.jsonがどこから来たデータなのかを正確に把握する。

## 調査内容

### 1. データ生成スクリプトの特定
- kanji-data.jsonを生成しているスクリプトを探す（scripts/配下、package.jsonのスクリプト等）
- 生成スクリプトのソースコードを読み、どのような元データ（KANJIDIC2、JMdict等）からどのフィールドを抽出しているかを完全に把握する
- 特にcategoryフィールドがどこから来ているか（元データにあるのか、生成スクリプト内で計算しているのか）

### 2. 元データ（KANJIDIC2等）が持つフィールドの調査
- KANJIDIC2のXMLスキーマまたはドキュメントを確認し、漢字ごとにどのような情報が利用可能かを網羅的にリストアップ
- 特に部首情報（classical radical, nelson radical等）、意味グループ、使用頻度、JIS水準等
- 現在kanji-data.jsonに含まれていないが元データには存在するフィールドがあるか

### 3. 現在のkanji-data.jsonのフィールド構成
- 全フィールドをリストアップし、各フィールドの値の例と範囲を示す
- categoryフィールドの値の分布（各カテゴリに何文字入っているか）
- radicalGroupフィールドとcategoryフィールドの関係

## 出力
- データの出自（元データソース名、生成スクリプトのパス）
- 元データにあるがkanji-data.jsonに含まれていない情報の一覧
- categoryフィールドの生成ロジックの正確な説明

