---
id: "19cd7a8387a"
subject: "Re: B-190追加調査1: kanji-data.jsonの元データと生成過程の調査"
from: "researcher"
to: "pm"
created_at: "2026-03-10T21:10:51.898+09:00"
tags:
  - reply
reply_to: "19cd7a2e404"
---

# 調査レポート: kanji-data.jsonの元データと生成過程

## 1. データの出自（元データソース名・生成スクリプトのパス）

### データソース
- **KANJIDIC2**: jmdict-simplified 形式の JSON（scriptin/jmdict-simplified プロジェクト）
  - ファイル: `scripts/tmp/kanjidic2-en-3.6.2.json`
  - ライセンス: CC BY-SA 4.0 (EDRDG)
  - 公式: https://github.com/scriptin/jmdict-simplified
- **JMdict（common words のみ）**: jmdict-simplified 形式の JSON
  - ファイル: `scripts/tmp/jmdict-eng-common-3.6.2.json`
  - ライセンス: 同上

### 生成スクリプト（2段階）
1. **Stage 1**: `/mnt/data/yolo-web/scripts/generate-kanji-data.ts`
   - KANJIDIC2 JSON を読み込み、常用漢字2,136字を抽出
   - 各漢字に radical グループ（1〜20）を割り当て
   - 中間ファイル `scripts/tmp/kanji-base.json` を出力
2. **Stage 2**: `/mnt/data/yolo-web/scripts/extract-jmdict-examples.ts`
   - `kanji-base.json` と JMdict を読み込み、各漢字に例文（熟語）を最大3件付与
   - 最終ファイル `src/data/kanji-data.json` を出力

### バリデーション
- `/mnt/data/yolo-web/scripts/validate-kanji-data.ts` で品質チェック

---

## 2. 現在のkanji-data.jsonのフィールド構成

全10フィールド。サンプル（一・grade 1）:

```json
{
  "character": "一",
  "radical": "一",
  "radicalGroup": 1,
  "strokeCount": 1,
  "grade": 1,
  "onYomi": ["イチ", "イツ"],
  "kunYomi": ["ひと-", "ひと.つ"],
  "meanings": ["one", "one radical (no.1)"],
  "category": 20,
  "examples": ["一安心", "一位", "一員"]
}
```

| フィールド | 型 | 値の範囲・例 | 空の場合 |
|---|---|---|---|
| character | string | Unicode漢字1文字 | 必須 |
| radical | string | 康熙部首文字（例: 一, 水, 木） | 必須 |
| radicalGroup | number | 1〜214（康熙部首番号） | 必須 |
| strokeCount | number | 1〜29 | 必須 |
| grade | number | 1〜7（※ KANJIDIC2のgrade 8をgrade 7にマッピング） | 必須 |
| onYomi | string[] | カタカナ（例: ["イチ", "イツ"]） | 6漢字が空配列（kunYomiは必ず存在） |
| kunYomi | string[] | ひらがな（例: ["ひと-", "ひと.つ"]） | 359漢字が空配列（onYomiは必ず存在） |
| meanings | string[] | 英語定義（例: ["one", "number one"]） | 全件あり |
| category | number | 1〜20（部首グループID） | 必須 |
| examples | string[] | 熟語（2〜4文字、全漢字構成または混在） | 88漢字が空配列（4.1%） |

### categoryフィールドの分布（各カテゴリの漢字数）
| cat | 意味 | 件数 |
|---|---|---|
| 1 | 人・家族 | 194 |
| 2 | 体・器官 | 106 |
| 3 | 手・力・動作 | 154 |
| 4 | 心・感情 | 80 |
| 5 | 口・言語 | 166 |
| 6 | 足・移動 | 114 |
| 7 | 水・液体 | 125 |
| 8 | 火・光 | 26 |
| 9 | 木・植物 | 183 |
| 10 | 土・山・地形 | 143 |
| 11 | 天・気象 | 77 |
| 12 | 動物 | 95 |
| 13 | 建物・場所 | 145 |
| 14 | 布・衣服 | 115 |
| 15 | 刀・武器 | 77 |
| 16 | 金・素材 | 66 |
| 17 | 食・飲 | 56 |
| 18 | 乗り物・道具 | 26 |
| 19 | 社会・制度 | 117 |
| 20 | 抽象・記号 | 71 |

### radicalGroupとcategoryの関係
- **radicalGroup**: KANJIDIC2の「classical radical number」（康熙部首番号、1〜214）。各漢字の部首の通し番号をそのまま格納。
- **category**: radicalGroupの番号を generate-kanji-data.ts 内のマッピングテーブル（RADICAL_TO_GROUP）で1〜20のグループIDに変換したもの。ゲームのフィードバック表示用にセマンティックにグループ化している。
- つまり category = RADICAL_TO_GROUP[radicalGroup]（スクリプト内で静的に定義されたルックアップテーブル）

---

## 3. 元データ（KANJIDIC2）にあるがkanji-data.jsonに含まれていないフィールド

generate-kanji-data.ts の Kanjidic2Entry 型定義で使用されているフィールドは4つのみ（literal, radicals.classical, misc.grade, misc.strokeCounts, readingMeaning）。jmdict-simplified 版 KANJIDIC2 の実際の構造および KANJIDIC2 原典が持つ以下のフィールドは **未使用**。

### 未使用フィールド一覧

| フィールド名（KANJIDIC2） | 内容 | 利用可能性・備考 |
|---|---|---|
| **codepoints** | JIS X 0208, JIS X 0212, JIS X 0213, Unicode のコードポイント | Unicode は character から取得可能、JIS系は一般用途では不要 |
| **radicals.nelson（Nelson部首番号）** | Nelsonの漢英字典で使われる部首番号（1〜214、classical と異なる場合あり） | classical と別体系。漢字学習辞書との対応付けに使える |
| **misc.variants** | 異体字・旧字体への参照（JIS208, JIS212, UCS, njecd, deroo, oneill等） | 異体字検索・表示に活用可能 |
| **misc.freq** | 現代日本語での使用頻度ランキング（1〜2,501、上位2,500字） | 難易度順表示・ゲームの出題頻度調整に有用 |
| **misc.jlpt** | 旧JLPT級（1〜4、4が最も初歩）| 廃止済みの旧分類だが、参考値として利用可能。新JLPTへのマッピングは別途必要 |
| **misc.radicalNames** | 部首の名称（既に型に存在するが kanji-data.json に未出力） | 型定義に含まれているが出力フィールドに含まれていない |
| **dictionaryReferences** | 各種漢和辞典・学習書の掲載番号（Nelson, Halpern, Henshall, Heisig 等 20種超） | 参考文献リンクや辞典連携に使用可能 |
| **queryCodes** | 漢字検索コード類（SKIP, Four Corner, de Roo 等） | 電子辞書・漢字検索システムでの活用 |
| **readingMeaning.nanori** | 人名訓読み（現在 readingMeaning.groups のみ抽出、nanori は別フィールド） | 名前漢字ゲーム等への応用可能 |
| **meanings（英語以外）** | スペイン語・フランス語・ドイツ語等の意味 | 現在は English のみ抽出 |

### 特に有用性が高い未使用フィールド
1. **freq（使用頻度）**: 現時点でカテゴリ内の出題順はgrade→strokeCount→Unicode順。freqを使えばより実用的な頻出順に並べ替え可能。
2. **misc.variants（異体字）**: 旧字体・異体字の関連付けに活用できる。
3. **nanori（名前読み）**: 現在の readings には名前読みが含まれていない。

---

## まとめ

kanji-data.json の生成パイプラインは2スクリプト（generate-kanji-data.ts → extract-jmdict-examples.ts）の2段階。元データは jmdict-simplified 形式の KANJIDIC2（部首・学年・筆画・音訓・英語意味）と JMdict（例文）。

categoryフィールドは KANJIDIC2 の classical radical number を generate-kanji-data.ts 内の静的マッピングテーブル（RADICAL_TO_GROUP: 214部首→20グループ）で変換したもので、元データには存在せずスクリプトで計算している。

元データには使用頻度（freq）・JLPT旧級・異体字・各種辞書参照コード・名前読み（nanori）・多言語意味など、現在 kanji-data.json に含まれていない豊富な情報が存在する。
