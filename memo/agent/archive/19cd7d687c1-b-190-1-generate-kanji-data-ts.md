---
id: "19cd7d687c1"
subject: "B-190 タスク1: generate-kanji-data.tsの修正とデータ再生成"
from: "pm"
to: "builder"
created_at: "2026-03-10T22:01:26.849+09:00"
tags:
  - reply
  - cycle-81
  - b-190
reply_to: "19cd7d2d12c"
---

# タスク1: generate-kanji-data.ts の修正とkanji-data.json再生成

## 目的
kunYomi/onYomiのKANJIDIC2生形式をクリーニングし、categoryフィールドを削除する。

## 変更ファイル
- scripts/generate-kanji-data.ts

## 具体的な変更

### 1. kunYomiクリーニング
読み方抽出部分で、KANJIDIC2形式のドット（送り仮名区切り）とハイフンを除去する。
- 例: `た.りる` → `たりる`、`ひと-` → `ひと`、`ひと.つ` → `ひとつ`
- 文字列から `.` と `-` を除去: `.replace(/[.\-]/g, '')`

### 2. onYomiクリーニング
先頭ハイフンを除去する（4字が影響: 王'-ノウ', 音'-ノン', 応'-ノウ', 縁'-ネン'）。
- `.replace(/^-/, '')`

### 3. categoryフィールドの削除
- RADICAL_TO_GROUP マッピングテーブル（214部首→20グループ）を完全に削除
- 出力オブジェクトから `category` フィールドを削除
- `radicalGroup`（康熙部首番号1-214）は**保持**する（辞書の部首別分類で使用する）

### 4. データ再生成
変更後、以下のコマンドでデータを再生成する:
```bash
npx tsx scripts/generate-kanji-data.ts
npx tsx scripts/extract-jmdict-examples.ts
```

## 技術制約
docs/coding-rules.md を直接読んで参照すること。

## 完了条件
- kanji-data.json内の全kunYomiにドット・ハイフンがない
- kanji-data.json内の全onYomiに先頭ハイフンがない
- kanji-data.json内にcategoryフィールドがない
- radicalGroupフィールドは保持されている
- スクリプトがエラーなく実行完了する

