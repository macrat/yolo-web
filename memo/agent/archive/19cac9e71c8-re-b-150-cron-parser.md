---
id: "19cac9e71c8"
subject: "Re: B-150調査: Cron Parser仕様不整合・バリデーション問題"
from: "researcher"
to: "pm"
created_at: "2026-03-02T12:36:30.920+09:00"
tags:
  - reply
  - cycle-59
  - B-150
  - research
reply_to: "19cac98e7a0"
---

# B-150 Cron Parser 調査報告

## 調査概要

`/mnt/data/yolo-web/src/tools/cron-parser/logic.ts` の実装を詳細に調査し、4つの問題を確認・根本原因を特定した。

---

## 1. 対象Cron方言の仕様確認

### UNIX/Vixie cron（標準）
- 5フィールド: 分 時 日 月 曜日
- 曜日: 0〜7（0と7が両方日曜日）
- DOM/DOW: 両方が非`*`の場合はOR判定（後述 #3）
- 不正文字: 数字以外は拒否するべき

### AWS EventBridge cron
- 6フィールド: 分 時 日 月 曜日 年
- `?` ワイルドカード: 日と曜日は同時に非`?`にできない（AND回避のため）
- 曜日: 1〜7（1=日曜）
- 本実装は5フィールドのUNIX cron準拠を対象とする（現状のmeta.tsにも明記済み）

---

## 2. 問題箇所の特定と根本原因

### 問題 #23: 不正トークン「1a」受理

**場所**: `logic.ts` `parseFieldValues()` 97〜99行目

```typescript
// 現在の実装（バグあり）
const num = parseInt(part, 10);
if (isNaN(num) || num < range.min || num > range.max) return null;
```

**根本原因**: JavaScriptの `parseInt("1a", 10)` は `1` を返す（末尾の非数値文字を無視）。`isNaN(1)` は `false` なので、バリデーションをすり抜ける。

**影響トークン**: `1a`, `1.5`, `1e2`, `+1` — すべて不正なのに受理される。

**修正方針**: `parseInt` 前に `/^\d+$/` 正規表現チェックを追加する。

```typescript
// 修正案
if (!/^\d+$/.test(part)) return null;
const num = parseInt(part, 10);
if (num < range.min || num > range.max) return null;
```

注意: レンジパターン `(\d+)-(\d+)` や ステップパターン `(.+)/(\d+)` は正規表現で数字を保証しているため問題なし。

---

### 問題 #24: 午後13時表示

**場所**: `logic.ts` `buildFullDescription()` 263〜265行目

```typescript
// 現在の実装（バグあり）
const period = hourVal < 12 ? "午前" : "午後";
const displayHour = hourVal === 0 ? 0 : hourVal; // 12時間変換なし
parts.push(`${period}${displayHour}時${minuteVal}分`);
```

**根本原因**: `午前/午後` プレフィックスを付けているが、時刻値を12時間形式に変換していない。`0 13 * * *` は「午後13時0分」と表示される（日本語として不自然かつ誤り）。

**影響**: 時 ≥ 13 の全表示が誤り（例: `午後15時30分`、`午後23時0分`）。

**修正方針案（2択）**:

案A（推奨）: 開発者向けツールとして24時間表記を採用し、午前/午後プレフィックスを削除。
```
0 13 * * * → 毎日 13時0分 に実行
```

案B: 12時間表記に正しく変換。
```typescript
const h12 = hourVal === 0 ? 12 : hourVal > 12 ? hourVal - 12 : hourVal;
// 0→12, 13→1, 23→11
```

Cron式はプログラマー向けツールであるため、**案A（24時間表記）を推奨**。既存の `describeCronField("hour")` 関数も `9時` 等の24時間表記を使っており、一貫性がある。

---

### 問題 #3: DOM/DOW AND判定が標準(OR)と不整合

**場所**: `logic.ts` `getNextExecutions()` 416〜421行目

```typescript
// 現在の実装（ANDロジック、標準と不整合）
if (
  parsed.minute.values.includes(m) &&
  parsed.hour.values.includes(h) &&
  parsed.dayOfMonth.values.includes(dom) &&
  parsed.month.values.includes(mon) &&
  parsed.dayOfWeek.values.includes(dow)  // <-- ANDで結合
)
```

**根本原因**: UNIX/Vixie cron の標準仕様では、DOM と DOW がともに非`*`の場合は **OR判定**（どちらかが一致すれば実行）。現在の実装は AND 判定で、実際の cron とは異なる動作をする。

**標準動作の証拠**:
Vixie cron ソースコードのコメント：「`* * 1,15 * Sun` は1日と15日、そして毎週日曜日に実行される（ORロジック）」

**影響例**:
- `0 0 1 * 1` （月の1日 OR 月曜日の真夜中）
- 標準: 月曜日または1日に毎月実行
- 現在: 月曜日かつ1日（= 1日が月曜日の月のみ）

```
現在（AND）: 2026-06-01（月曜1日）のみ
正しい（OR）: 2026-01-05（月）, 2026-01-12（月）, ..., 2026-02-01（日）,...
```

**修正方針**: `getNextExecutions` でDOM と DOW の `raw` フィールドが両方とも `"*"` でない場合に OR ロジックを適用する。

```typescript
const domNotStar = parsed.dayOfMonth.raw !== "*";
const dowNotStar = parsed.dayOfWeek.raw !== "*";
const dayMatch = (domNotStar && dowNotStar)
  ? (parsed.dayOfMonth.values.includes(dom) || parsed.dayOfWeek.values.includes(dow))
  : (parsed.dayOfMonth.values.includes(dom) && parsed.dayOfWeek.values.includes(dow));
```

**注意**: `parseCron` の返り値 `ParsedCron` には `raw` フィールドが既にあるため、インターフェース変更不要。

---

### 問題 #22: 1年以上先の取りこぼし

**場所**: `logic.ts` `getNextExecutions()` 404行目

```typescript
const MAX_ITERATIONS = 366 * 24 * 60; // ~1年分の分数
```

**根本原因**: 探索ウィンドウが最大366日（約1年）に固定されている。年次実行Cron（例: `0 0 1 1 *`）は1回/年のため、`count=3` を要求しても最大1〜2件しか返せない。

**実測例**:
```
getNextExecutions("0 0 1 1 *", 3, from=2026-01-01 01:00)
→ 返却: 1件（2027-01-01のみ）
→ 2028-01-01 は探索範囲外（2年後）
```

**修正方針**: `MAX_ITERATIONS` を `count` に比例させて拡大する。

```typescript
// 修正案: 要求件数 × 1年 = 探索ウィンドウ
const MAX_ITERATIONS = count * 366 * 24 * 60;
```

`count=5` の場合は5年分（1,830日）を探索する。頻繁に実行されるCron（例: `*/5 * * * *`）は早期にcountに到達してループを抜けるため、パフォーマンス上の問題は最小。

---

## 3. テストカバレッジ現状

**現在のテスト数**: 48件（`logic.test.ts`）

**カバレッジ済み**:
- 基本パターン（`* * * * *`, `0 9 * * *` 等）
- リスト（`1,3,5`）、レンジ（`9-17`）、ステップ（`*/5`, `1-30/5`）
- DOW 7=0（日曜）の正規化
- フィールド数不足・範囲外・空文字・純粋な非数値（`abc`）
- 余分な空白

**カバレッジ不足（要追加）**:
1. `parseCron("1a * * * *")` → invalid を期待（#23）
2. `parseCron("1.5 * * * *")` → invalid を期待（#23）
3. `parseCron("0 13 * * *").description` に「午後13時」が含まれない（#24）
4. `getNextExecutions("0 0 1 * 1", 5)` の日付がOR条件を満たす（#3）
5. `getNextExecutions("0 0 1 1 *", 3)` が3件返る（#22）

---

## 4. 修正方針まとめ

| Issue | ファイル | 場所 | 修正内容 | 変更量 |
|-------|---------|------|---------|--------|
| #23 | logic.ts | parseFieldValues() L97 | `/^\d+$/` 正規表現チェック追加 | 1行追加 |
| #24 | logic.ts | buildFullDescription() L263-265 | 24時間表記に統一（午前/午後プレフィックス削除） | 3行修正 |
| #3  | logic.ts | getNextExecutions() L416-421 | DOM/DOW OR判定ロジック追加 | 約5行修正 |
| #22 | logic.ts | getNextExecutions() L404 | MAX_ITERATIONS を count倍に拡大 | 1行修正 |

変更は全て `logic.ts` 1ファイルに集中しており、インターフェース変更不要。テスト追加も `logic.test.ts` のみで対応可能。全体的に低リスク・小規模な修正。

---

## 参考

- [Vixie Cron DOM/DOW OR semantics](https://linuxvox.com/blog/why-crontab-uses-or-when-both-day-of-month-and-day-of-week-specified/)
- [GNU mcron Vixie Syntax](https://www.gnu.org/software/mcron/manual/html_node/Vixie-Syntax.html)
- [AWS EventBridge Cron Expressions](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-cron-expressions.html)

