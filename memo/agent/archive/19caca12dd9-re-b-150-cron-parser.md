---
id: "19caca12dd9"
subject: "Re: B-150計画: Cron Parser仕様整合・バリデーション改善"
from: "planner"
to: "pm"
created_at: "2026-03-02T12:39:30.137+09:00"
tags:
  - reply
  - cycle-59
  - B-150
  - plan
reply_to: "19cac9f38e4"
---

# B-150 Cron Parser仕様整合・バリデーション改善 -- 実施計画

## 概要

Cron Parserツール（logic.ts）に存在する4つの仕様不整合・バリデーション問題を修正する。全修正はlogic.ts 1ファイルに集中し、インターフェース変更は不要。テスト追加はlogic.test.ts 1ファイルで完結する。

---

## 前提: 対象Cron方言

**UNIX/Vixie cron（5フィールド標準）に準拠する。**

- 5フィールド: 分 時 日 月 曜日
- 曜日: 0-7（0と7が日曜日）
- DOM/DOW: 両方が非`*`の場合はOR判定
- meta.tsの既存FAQで「標準的な5フィールド形式のみ対応」と記載済み
- UIに追加の方言表示は不要（現状のFAQで十分）

---

## 修正計画（4件）

### 修正1: 不正トークン「1a」受理問題 (#23)

**対象**: logic.ts `parseFieldValues()` 96-99行目
**根本原因**: JavaScriptの `parseInt("1a", 10)` が `1` を返す仕様により、末尾に非数値文字を含むトークンがバリデーションをすり抜ける。
**修正内容**: `parseInt` 呼び出し前に `/^\d+$/` 正規表現チェックを追加する。

修正箇所:
```
// logic.ts L96-99 の else ブロック内
// parseInt の前に正規表現チェックを追加
```

影響範囲: parseFieldValues 関数の単値パース部分のみ。レンジパターン `(\d+)-(\d+)` やステップパターン `(.+)/(\d+)` は正規表現で数字部分を抽出しているため影響なし。

**テストケース** (logic.test.ts に追加):
- `parseCron("1a * * * *")` → `valid: false` を期待
- `parseCron("1.5 * * * *")` → `valid: false` を期待
- `parseCron("1e2 * * * *")` → `valid: false` を期待
- `parseCron("+1 * * * *")` → `valid: false` を期待

### 修正2: 午後13時表示問題 (#24)

**対象**: logic.ts `buildFullDescription()` 262-265行目
**根本原因**: `午前/午後` プレフィックスを付けているが、時刻値を12時間形式に変換していない。`0 13 * * *` は「午後13時0分」と表示される。
**修正内容**: 24時間表記に統一し、午前/午後プレフィックスを削除する。

選択理由:
- Cronはプログラマー向けツールであり、24時間表記が自然
- `describeCronField("hour")` 関数は既に `9時`, `17時` 等の24時間表記を使用しており、一貫性がある
- 12時間表記への変換は12時/0時の境界でエッジケースが多く、24時間表記のほうがシンプルで正確

修正箇所:
```
// logic.ts L262-265
// 午前/午後プレフィックスを削除し、hourValをそのまま表示
// 例: `0 13 * * *` → 「毎日 13時0分 に実行」
```

**テストケース**:
- `parseCron("0 13 * * *").description` → 「午後13時」を含まないことを検証
- `parseCron("0 13 * * *").description` → 「13時0分」を含むことを検証
- `parseCron("0 0 * * *").description` → 「0時0分」を含むことを検証
- `parseCron("30 23 * * *").description` → 「23時30分」を含むことを検証
- `parseCron("0 9 * * *").description` → 「9時0分」を含むことを検証（既存テストと整合性確認）

### 修正3: DOM/DOW AND判定問題 (#3)

**対象**: logic.ts `getNextExecutions()` 416-421行目
**根本原因**: UNIX/Vixie cronの標準仕様では、DOMとDOWがともに非`*`の場合はOR判定（どちらかが一致すれば実行）だが、現実装はAND判定になっている。
**修正内容**: `getNextExecutions` の日付マッチング条件で、DOMとDOWの `raw` フィールドが両方とも `"*"` でない場合にORロジックを適用する。

修正箇所:
```
// logic.ts L416-421
// DOM/DOW両方が非"*"の場合: domMatch OR dowMatch
// それ以外: domMatch AND dowMatch（従来通り）
// parsed.dayOfMonth.raw と parsed.dayOfWeek.raw が既に利用可能
```

重要な考慮点:
- `ParsedCron` インターフェースに `raw` フィールドが既にあるため、インターフェース変更不要
- `raw` が `"*"` かどうかで判定する（`values` のlengthではなく `raw` 文字列を直接比較）
- `buildFullDescription` でのDOM/DOW両方非`*`時の説明テキストも、OR条件を反映するように更新を検討する。現状は「1日 月曜 ... に実行」のような並列表示だが、ORであることを明示するために「1日 または 月曜 ... に実行」のように修正する

**テストケース**:
- `getNextExecutions("0 0 1 * 1", 10, from)` → 結果に「月の1日」と「月曜日」の両方が含まれる（OR条件）
- `getNextExecutions("0 0 15 * 5", 10, from)` → 結果に「月の15日」と「金曜日」の両方が含まれる
- `getNextExecutions("0 0 1 * *", 5, from)` → 従来通りAND（DOWが`*`なので）
- `getNextExecutions("0 0 * * 1", 5, from)` → 従来通りAND（DOMが`*`なので）

### 修正4: 1年以上先の取りこぼし問題 (#22)

**対象**: logic.ts `getNextExecutions()` 404行目
**根本原因**: 探索ウィンドウが最大366日に固定されており、年次実行Cronで `count > 1` を要求すると取りこぼしが発生する。
**修正内容**: `MAX_ITERATIONS` を `count` に比例させて拡大する。

修正箇所:
```
// logic.ts L404
// MAX_ITERATIONS = count * 366 * 24 * 60
```

パフォーマンス考慮:
- 頻繁に実行されるCron（例: `*/5 * * * *`）は早期にcountに到達してループを抜けるため問題なし
- UIからの呼び出しは count=5 固定なので、最大5年分の探索（約263万イテレーション）
- ブラウザのメインスレッドで実行されるため、極端に大きなcountは避けるべきだが、count=5は問題なし

**テストケース**:
- `getNextExecutions("0 0 1 1 *", 3, from)` → 3件返ることを検証（年次実行で3年分）
- `getNextExecutions("0 0 29 2 *", 2, from)` → 2件返ることを検証（うるう年のみ、約8年分の探索）

---

## 追加変更: 説明文のOR反映

修正3（DOM/DOW OR判定）に伴い、`buildFullDescription` 関数でDOMとDOWが両方非`*`の場合の説明テキストを修正する必要がある。

現状: `1日 月曜 0時0分 に実行`（AND的な並列表示）
修正後: `1日 または 月曜 0時0分 に実行`（OR条件の明示）

修正箇所:
```
// logic.ts buildFullDescription() のDOM/DOW部分
// 両方が非"*"の場合に「または」で接続する
```

**テストケース**:
- `parseCron("0 0 1 * 1").description` → 「または」を含むことを検証

---

## 実施手順

1. **logic.ts の修正**: 4つの修正を上記の順番（#23, #24, #3, #22）で適用する。修正1, 2, 4は独立しているため順序は問わないが、修正3は説明文の変更を伴うため最後に実施する
2. **logic.test.ts のテスト追加**: 各修正に対応するテストケースを追加する
3. **全テスト実行**: `npx vitest run src/tools/cron-parser/__tests__/logic.test.ts` で全テストが通ることを確認
4. **ビルド確認**: `npm run build` でビルドエラーがないことを確認
5. **レビュー依頼**: reviewerに修正内容のレビューを依頼

---

## 完了条件

- [ ] 修正1: `parseCron("1a * * * *")` 等が `valid: false` を返す
- [ ] 修正2: `parseCron("0 13 * * *").description` に「午後13時」が含まれず「13時0分」が含まれる
- [ ] 修正3: `getNextExecutions("0 0 1 * 1", 10)` がOR条件の結果を返す。説明文にOR条件が反映される
- [ ] 修正4: `getNextExecutions("0 0 1 1 *", 3)` が3件返る
- [ ] 既存48テストが全て通る
- [ ] 新規テストが全て通る（少なくとも15テスト追加見込み）
- [ ] `npm run build` が成功する
- [ ] meta.ts の updatedAt を更新する

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| src/tools/cron-parser/logic.ts | 4つの修正（parseFieldValues, buildFullDescription, getNextExecutions） |
| src/tools/cron-parser/__tests__/logic.test.ts | テストケース追加（約15件） |
| src/tools/cron-parser/meta.ts | updatedAt を更新 |

## リスク評価

- 全修正がlogic.ts 1ファイルに集中しており、影響範囲が限定的
- インターフェース変更なし、Component.tsx の変更なし
- 既存48テストで回帰を検出可能
- 低リスク・小規模な修正

