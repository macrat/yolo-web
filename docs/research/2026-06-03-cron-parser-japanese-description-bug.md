# cron-parser 日本語説明バグ調査レポート

**日付**: 2026-06-03
**対象ファイル**: `/mnt/data/yolo-web/src/tools/cron-parser/logic.ts`
**調査者**: Claude (PM sub-agent)

---

## 1. ファイル構成と関数の役割

### (a) cron式フィールドのパース処理

`parseFieldValues(field, range)` 関数（logic.ts: 48-108行）がすべての式パターンを処理する。

- カンマ区切りで `parts` に分割（51行）
- 各partを順に処理：
  - ステップ `*/N` or `N-M/N`：stepMatchで処理（53-78行）
  - ワイルドカード `*`：range.min から range.max を展開（79-85行）
  - 範囲 `N-M`：rangeMatchで処理（88-95行）
  - 単一数値：`/^\d+$/` でバリデーション後 parseInt（97-102行）
- 結果は `Set<number>` → `number[]`（昇順ソート済み）で返す

この関数は **常に正しく** 動作しており、`9-17` → `[9,10,11,12,13,14,15,16,17]`、`9,12,15` → `[9,12,15]` を正しく生成する。

### (b) 日本語説明生成処理（バグ所在箇所）

`describeCronField(field, type)` 関数（logic.ts: 114-223行）はフィールド単体の説明を生成する。

- `*` → 毎分/毎時等（120-132行）
- `*/N` → N分ごと/N時間ごと等（135-150行）
- `N-M/step` → N分からM分までstep分ごと等（152-169行）
- `N-M` → N分からM分等（171-187行）
- カンマ含む → `parseFieldValues` 呼び出し → 値リスト結合（189-203行）
- 単一数値 → `parseInt` して変換（206-220行）

この関数は **正しく動作する**。問題はここにない。

`buildFullDescription(minute, hour, dayOfMonth, month, dayOfWeek)` 関数（logic.ts: 225-293行）が全体の日本語文を組み立てる。

**バグ箇所は 271-277行**:

```typescript
// logic.ts: 269-278行（buildFullDescription内のelseブランチ）
} else {
    // Specific hour and minute (24-hour format)
    const minuteVal = parseInt(minute.raw, 10);  // 271行 ← バグ
    const hourVal = parseInt(hour.raw, 10);       // 272行 ← バグ
    if (!isNaN(minuteVal) && !isNaN(hourVal)) {
      parts.push(`${hourVal}時${minuteVal}分`);   // 274行
    } else {
      parts.push(`${hour.description}の${minute.description}`);  // 276行
    }
  }
```

この `else` ブランチは「hour も minute も `*` でない場合」に到達する。設計意図は「単一数値のみ」を想定しているが、範囲・リスト・複合も同じブランチに落ちる。

### (c) 次回実行時刻の計算処理

`getNextExecutions(expression, count, from?)` 関数（logic.ts: 398-448行）。

```typescript
// logic.ts: 427-431行
const minuteMatch = parsed.minute.values.includes(m);
const hourMatch = parsed.hour.values.includes(h);
const domMatch = parsed.dayOfMonth.values.includes(dom);
const monMatch = parsed.month.values.includes(mon);
const dowMatch = parsed.dayOfWeek.values.includes(dow);
```

`parsed.minute.values` と `parsed.hour.values` は `parseFieldValues` が生成した **正しい数値配列** を参照する。
`parseInt` は一切使用されていない。これが「次回実行リストは正しい、説明は誤っている」という自己矛盾の原因。

---

## 2. parseInt 誤変換の詳細分析

### バグの根本原因

JavaScript の `parseInt("9-17", 10)` は **先頭から数字が続く限り解析して停止**する仕様のため `9` を返す。
`parseInt("9,12,15", 10)` も同様に `9` を返す。

```
parseInt("9-17")    = 9   （"-" で停止）
parseInt("9,12,15") = 9   （"," で停止）
parseInt("0-30/5")  = 0   （"-" で停止）
parseInt("9-17,20") = 9   （"-" で停止）
parseInt("*/15")    = NaN （"*" で停止 → NaN）
```

### 各パターンで生成される誤った説明

| cron式            | パターン        | minuteVal | hourVal | bothValid | 生成される説明         | 正しい説明                                |
| ----------------- | --------------- | --------- | ------- | --------- | ---------------------- | ----------------------------------------- |
| `0 9-17 * * *`    | 範囲            | 0         | 9       | true      | **毎日 9時0分 に実行** | 9時から17時の0分 に実行（毎時0分/9-17時） |
| `0 9,12,15 * * *` | リスト          | 0         | 9       | true      | **毎日 9時0分 に実行** | 9時と12時と15時の0分 に実行               |
| `0-30/5 9 * * *`  | 分ステップ+範囲 | 0         | 9       | true      | **毎日 9時0分 に実行** | 毎日 9時の0分から30分まで5分ごと に実行   |
| `0 9-17,20 * * *` | 複合            | 0         | 9       | true      | **毎日 9時0分 に実行** | 9時から17時と20時の0分 に実行             |
| `0,30 9-17 * * *` | 分リスト+時範囲 | 0         | 9       | true      | **毎日 9時0分 に実行** | 9時から17時の0分と30分 に実行             |

### 誤変換が起きない（正しく動作する）パターン

| cron式            | パターン       | 理由                                                        |
| ----------------- | -------------- | ----------------------------------------------------------- |
| `*/15 9 * * *`    | minuteステップ | `parseInt("*/15")=NaN` → bothValid=false → 正しいelse分岐へ |
| `*/15 9-17 * * *` | 両方非単純     | `parseInt("*/15")=NaN` → bothValid=false → 正しいelse分岐へ |
| `0 9 * * *`       | 両方単純数値   | `parseInt`が正しく機能、`9時0分` は意図通り                 |

### ステップ指定の正誤

- `*/15 * * * *`（minute=`*/15`, hour=`*`）: hour.raw=`*` ブランチで `minute.raw.includes("/")` → true → `minute.description`（=「15分ごと」）を使う。**正常**（logic.ts: 264-265行）
- `*/15 9 * * *`（minute=`*/15`, hour=`9`）: else ブランチ、`parseInt("*/15")=NaN` → bothValid=false → `hour.description + "の" + minute.description` = 「9時の15分ごと」。**正常**
- `0-30/5 9 * * *`（minute=`0-30/5`, hour=`9`）: else ブランチ、`parseInt("0-30/5")=0` → bothValid=true → **「9時0分」に誤る**

---

## 3. 次回実行ロジックと説明生成ロジックの比較

**完全に別ロジック**。共通の中間表現は存在しない。

|            | 説明生成 (`buildFullDescription`)      | 次回実行計算 (`getNextExecutions`)                       |
| ---------- | -------------------------------------- | -------------------------------------------------------- |
| 参照する値 | `minute.raw`, `hour.raw`（生の文字列） | `parsed.minute.values`, `parsed.hour.values`（数値配列） |
| 数値変換   | `parseInt(raw, 10)`（バグあり）        | `Array.includes()`（正しい）                             |
| 実装       | 正規表現+if分岐で文字列生成            | 1分刻みのループで日時マッチング                          |

**判断**: 説明生成だけを直せばよい。`parseFieldValues` が生成した `values` 配列を説明生成にも活用するか、`buildFullDescription` の `else` 分岐の判定条件を `/^\d+$/` テストに変更するかのどちらかで対応できる。ただし前者（共通中間表現方式）の方が将来の保守性が高い。

---

## 4. meta.ts と実装の矛盾

`/mnt/data/yolo-web/src/tools/cron-parser/meta.ts` を確認した結果、以下の記述がある。

- `howItWorks`（24行）: 「5フィールド形式（分・時・日・月・曜日）のCron式を解析し、ブラウザ上でわかりやすい日本語の説明に変換します」
- FAQ（26-30行）: 「5フィールド形式（分・時・日・月・曜日）のみ対応」

**矛盾**: `howItWorks` は「わかりやすい日本語の説明に変換」と謳っているが、範囲・リスト・複合指定では誤った説明が生成される。meta.ts 自体の記述は実装の仕様矛盾を引き起こしてはいないが、ツールの宣伝内容と実際の動作が一致していない状態にある。

---

## 5. 既存テストの状況

### テストの網羅状況

| テスト観点                                               | ファイル                 | テスト有無 |
| -------------------------------------------------------- | ------------------------ | ---------- |
| `parseFieldValues` の範囲パース（`values` の正確性）     | logic.test.ts: 62-66行   | あり       |
| `parseFieldValues` のリストパース（`values` の正確性）   | logic.test.ts: 56-60行   | あり       |
| `parseFieldValues` のステップパース（`values` の正確性） | logic.test.ts: 38-45行   | あり       |
| `describeCronField` の範囲（`9-17` → `9時から17時`）     | logic.test.ts: 376-378行 | あり       |
| `describeCronField` のリスト（`0,15,30,45` → 各分）      | logic.test.ts: 358-365行 | あり       |
| `parseCron("0 9-17 * * *").description` の正確性         | **なし**                 | **欠落**   |
| `parseCron("0 9,12,15 * * *").description` の正確性      | **なし**                 | **欠落**   |
| `parseCron("0-30/5 9 * * *").description` の正確性       | **なし**                 | **欠落**   |
| `buildFullDescription` での範囲+単純数値の組み合わせ     | **なし**                 | **欠落**   |

### 具体的な欠落テスト

- `parseCron("0 9-17 * * *").description` をアサートするテストが存在しない（62-66行のテストは `hour.values` しか確認しない）
- `parseCron("0 9,12,15 * * *").description` をアサートするテストが存在しない（56-60行のテストは `minute.values` しか確認しない）
- バグが存在するにもかかわらず、テストが全てパスしている理由はここにある

---

## 6. logic.ts の公開関数の利用元

`grep` で確認した結果、`logic.ts` の公開関数を利用するファイルは以下のみ:

| ファイル                                        | 利用する関数                                                                 |
| ----------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/tools/cron-parser/Component.tsx`           | `parseCron`, `getNextExecutions`, `buildCronExpression`, `describeCronField` |
| `src/tools/cron-parser/CronParserTile.tsx`      | `parseCron`, `getNextExecutions`                                             |
| `src/tools/cron-parser/__tests__/logic.test.ts` | `parseCron`, `getNextExecutions`, `buildCronExpression`, `describeCronField` |

`meta.ts`、`page.tsx`、`tools-registry.ts`、`tile-declarations.ts` は `logic.ts` をインポートしない。UIコンポーネント2ファイルのみが依存している。

---

## 7. 正しい日本語説明の仕様案

### 修正すべき箇所

`logic.ts: 271-274行`（`buildFullDescription` の else ブランチ）

```typescript
// 現在（バグあり）
const minuteVal = parseInt(minute.raw, 10);
const hourVal = parseInt(hour.raw, 10);
if (!isNaN(minuteVal) && !isNaN(hourVal)) {
  parts.push(`${hourVal}時${minuteVal}分`);
} else {
  parts.push(`${hour.description}の${minute.description}`);
}
```

### 修正方針案

**方針A（最小変更）**: `parseInt` を `/^\d+$/` テストに置き換える

```typescript
const minuteIsSingle = /^\d+$/.test(minute.raw);
const hourIsSingle = /^\d+$/.test(hour.raw);
if (minuteIsSingle && hourIsSingle) {
  parts.push(`${hour.raw}時${minute.raw}分`);
} else {
  parts.push(`${hour.description}の${minute.description}`);
}
```

**方針B（中間表現活用）**: `CronField.values` を使う（`buildFullDescription` が `values` を受け取れるように型を活用）

- `values` が長さ1なら `X時Y分` 形式、複数なら `description` を使う

方針Aが実装コスト最小で安全。`/^\d+$/` は既に `parseFieldValues` 内（98行）で使用されており一貫性がある。

### 各パターンの期待される日本語説明案

| cron式            | 期待する説明（case A修正後）                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------- |
| `0 9-17 * * *`    | `9時から17時の0分 に実行`                                                                    |
| `0 9,12,15 * * *` | `9時と12時と15時の0分 に実行`                                                                |
| `0-30/5 9 * * *`  | `毎日 9時の0分から30分まで5分ごと に実行`                                                    |
| `0 9-17,20 * * *` | `9時から17時と20時の0分 に実行`（※複合は現状describeCronFieldがNaN時になるため別修正が必要） |
| `0,30 9-17 * * *` | `9時から17時の0分と30分 に実行`                                                              |

**備考**: `9-17,20` のような複合パターン（範囲+単一のカンマ混在）は `describeCronField` の comma分岐（189-203行）で `parseFieldValues` を呼ぶが、`parseFieldValues("9-17,20", hour)` は `[9,10,11,12,13,14,15,16,17,20]` を正しく返す。ただし表示は「9時と10時と...と20時」と全展開される。これはユーザーにとって冗長だが正確ではある。より良い表現（「9時から17時、20時」）にするには `describeCronField` 側にも改修が必要。PM判断を要する。

---

## まとめ

| #   | 問題                                                            | 箇所                | 深刻度           |
| --- | --------------------------------------------------------------- | ------------------- | ---------------- |
| 1   | `parseInt(hour.raw)` で範囲・リスト・複合が先頭数字のみに誤変換 | logic.ts: 271-272行 | 高（主バグ）     |
| 2   | 説明生成と次回実行が完全に別ロジック（共通中間表現なし）        | 設計上の問題        | 中               |
| 3   | `parseCron().description` の結合テストが欠落                    | logic.test.ts       | 中（テスト欠落） |
| 4   | `describeCronField` の複合パターン（`9-17,20`）の表示が冗長     | logic.ts: 189-203行 | 低（許容範囲）   |

**修正スコープ**: `logic.ts` の `buildFullDescription`（271-274行）のみ。UI変更不要。テスト追加も同時に行うことを推奨。
