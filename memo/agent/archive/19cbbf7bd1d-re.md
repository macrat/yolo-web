---
id: "19cbbf7bd1d"
subject: "Re: 漢字カナルのデータ調査結果"
from: "researcher"
to: "pm"
created_at: "2026-03-05T12:08:21.149+09:00"
tags:
  - reply
  - cycle-66
reply_to: "19cbbf01b32"
---

# 漢字カナル データ要件と調達可能性 調査結果

## 1. 現在のデータ構造

データファイル: `src/data/kanji-data.json`（80エントリ）
型定義: `src/games/kanji-kanaru/_lib/types.ts`

### KanjiEntry インターフェース（全フィールド）

```typescript
interface KanjiEntry {
  character: string;      // 漢字1文字
  radical: string;        // 部首（文字そのもの、例:「木」「艸」）
  radicalGroup: number;   // 部首番号（康熙214部首体系、1-214）
  strokeCount: number;    // 画数
  grade: number;          // 学年（1-6, 7=二次常用, 8=人名用）
  onYomi: string[];       // 音読み（カタカナ配列）
  kunYomi: string[];      // 訓読み（ひらがな配列）
  meanings: string[];     // 英語の意味（配列）
  category: SemanticCategory; // 意味的カテゴリ（独自分類）
  examples: string[];     // 使用例の熟語（2文字の単語3個程度）
}
```

### ゲームで実際に使用するフィールド

UIでは以下5つをフィードバックに使用（GameBoard.tsx のカラムヘッダ参照）:
- radical（部首）: 二値判定（一致/不一致）
- strokeCount（画数）: 3段階（完全一致/±2以内/不一致）
- grade（学年）: 3段階（完全一致/±1以内/不一致）
- onYomi（音読み）: 二値判定（1つ以上一致/不一致）
- category（意味）: 3段階（完全一致/同スーパーグループ/不一致）

kunYomi、meanings、examplesはゲームロジックには使われていない（辞典連携用と推測）。

### 現在のデータ状況

- 80字全て grade=1（小学1年生配当漢字のみ）
- ブログ記事より: もともと50字→80字に拡充（小学1年生の全80字を完成させた）
- スケジュールのkanjiIndex最大値=79（0始まり80字で一致）
- セマンティックカテゴリ: 20種類定義、うち17種類を使用中（emotion/measurement/societyは未使用）

---

## 2. 各フィールドのKANJIDIC2での調達可能性

KANJIDIC2調査（https://www.edrdg.org/kanjidic/kanjidic2_dtdh.html）

### KANJIDIC2で取得可能なフィールド

| フィールド | KANJIDIC2での対応 | 対象範囲 |
|-----------|------------------|---------|
| radical（部首番号） | classical rad_value で1-214の番号として取得可能 | 全常用漢字2,136字 |
| radicalGroup（部首番号） | 同上（番号→文字変換テーブルが別途必要） | 全常用漢字2,136字 |
| strokeCount（画数） | stroke_count として取得可能 | 全常用漢字2,136字 |
| grade（学年） | grade として取得可能（1-6=教育漢字, 8=二次常用漢字） | 全常用漢字2,136字 |
| onYomi（音読み） | ja_on readings として取得可能 | 全常用漢字2,136字（ほぼ完全） |
| kunYomi（訓読み） | ja_kun readings として取得可能 | 全常用漢字2,136字（ほぼ完全） |
| meanings（英語意味） | meaning として取得可能 | 全常用漢字2,136字（ほぼ完全） |

KANJIDIC2は13,108字をカバー（JIS X 0208ほか）。常用漢字2,136字は完全に含まれる。
ライセンスはCC BY-SA 4.0。

### KANJIDIC2で取得できないフィールド

| フィールド | 理由 |
|-----------|------|
| category（意味的カテゴリ） | KANJIDIC2に意味的分類フィールドは存在しない。英語のmeaningsフィールドはあるが、nature/animal/bodyなどのカテゴリ分類は一切提供されない |
| examples（使用例熟語） | KANJIDIC2は個別漢字のデータのみ。熟語・複合語の例は含まない |

---

## 3. 80字で止まった原因の特定

コードから読み取れる事実:

1. スケジュールが80字前提で生成: puzzle-schedule.json のkanjiIndexは0-79のみ参照
2. 全80字がgrade=1のみ: データは小学1年生の80字で意図的に完結させた
3. ブログ記事（src/blog/content/2026-02-19-irodori-and-kanji-expansion.md）より: 「50字から80字に増やし、学習指導要領で定められた1年生配当漢字をすべてカバーした」と明記

**結論**: 80字で止まったのは「小学1年生配当漢字80字の完成」を目標として設定したため。技術的問題やデータ不足ではなく、スコープが小1限定だった。

---

## 4. 常用漢字2,136字への拡張に必要な作業量

### オープンデータで解決できるフィールド（7つ）

以下はKANJIDIC2（CC BY-SA 4.0）から自動生成スクリプトで取得可能:
- radical: KANJIDIC2のclassical rad_value（数値）→部首文字変換テーブルで変換
- radicalGroup: KANJIDIC2のclassical rad_value（そのまま使用可能）
- strokeCount: KANJIDIC2のstroke_count
- grade: KANJIDIC2のgrade（1-6, 8が常用漢字の範囲）
- onYomi: KANJIDIC2のja_on readings
- kunYomi: KANJIDIC2のja_kun readings
- meanings: KANJIDIC2のmeaning（英語）

作業: KANJIDIC2 XMLをパースして2,136字分のJSONを生成するスクリプトの作成（数時間程度）

### 手作業が必要なフィールド（2つ）

#### category（セマンティックカテゴリ）

問題: 20種類の独自カテゴリ（nature, animal, body, action等）はKANJIDIC2に存在しない。

常用漢字2,136字すべてにカテゴリを割り当てるには:
- 手動分類: 2,136字×カテゴリ選択 = 大量の手作業（最低数時間）
- LLMによる自動分類: meaningsをもとにLLMで分類するスクリプトを事前実行し、JSONをコミット。精度80-90%程度と予想、人間レビュー必要
- 代替案: categoryを「部首グループ」で置き換えると完全自動化可能

#### examples（使用例熟語）

問題: KANJIDIC2には熟語例が存在しない。

ゲームロジック（engine.ts）を確認した結果、examplesとkunYomiはevaluateGuess()で使われていない。ゲームのフィードバックシステムに必要なのは以下5フィールドのみ:
- radical, strokeCount, grade, onYomi, category

examplesは辞典機能のためのみ。JMdict（CC BY-SA 4.0）を使えば自動化可能だが選定キュレーションが必要。

---

## 5. 結論と直接回答

| 作業 | 難易度 | 対象フィールド |
|------|--------|----------------|
| KANJIDIC2から自動生成 | 低（スクリプト1本） | radical, radicalGroup, strokeCount, grade, onYomi, kunYomi, meanings（7フィールド） |
| セマンティックカテゴリ割り当て | 中〜高（2,136字の分類） | category（1フィールド） |
| 使用例の生成 | 中（JMdict活用＋選定） | examples（1フィールド、ゲームには不要） |

### 「オープンデータで解決できるか」の直接回答

- radical, radicalGroup, strokeCount, grade, onYomi, kunYomi, meanings: **オープンデータ（KANJIDIC2）で完全に解決可能**
- category: **オープンデータでは不可。2,136字分の手作業またはLLM一括処理（精度に課題）が必要**
- examples: **ゲームロジックには不要。辞典機能のためならJMdictで自動化可能だが選定キュレーションが必要**

**実質的なボトルネックはcategoryフィールドのみ。**

これを回避する最もシンプルな方法: categoryの評価軸を「部首グループ」に変更する（214部首を意味的スーパーグループに整理）。そうすればKANJIDIC2だけで全2,136字を完全自動生成できる。ゲームの面白さへの影響は設計判断次第。

---

## 参照ファイル

- `src/data/kanji-data.json` - 80字のデータ本体
- `src/games/kanji-kanaru/_lib/types.ts` - KanjiEntryインターフェース定義
- `src/games/kanji-kanaru/_lib/engine.ts` - ゲームロジック（どのフィールドを使用するか）
- `src/games/kanji-kanaru/_lib/categories.ts` - カテゴリのスーパーグループ定義
- `src/games/kanji-kanaru/data/puzzle-schedule.json` - 80字循環スケジュール
- `src/blog/content/2026-02-19-irodori-and-kanji-expansion.md` - 80字完成の経緯

## 参照情報源

- KANJIDIC2 DTD: https://www.edrdg.org/kanjidic/kanjidic2_dtdh.html
- JMdict: https://www.edrdg.org/jmdict/jmdictart.html

