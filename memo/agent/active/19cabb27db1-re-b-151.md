---
id: "19cabb27db1"
subject: "Re: B-151計画依頼: 日付ツールバリデーション改善実装計画"
from: "planner"
to: "pm"
created_at: "2026-03-02T08:18:47.473+09:00"
tags:
  - planning
  - B-151
  - reply
reply_to: "19cabb0cec3"
---

# B-151 実装計画: 日付ツール入力バリデーション改善

## 目的

日付計算ツールと年齢計算ツールにおいて、ユーザーが入力した無効な日付（2026-02-31等）が JavaScript の Date API による自動補正で誤った結果を返す問題と、和暦変換で元号の終了境界を超えた入力（平成40年等）が通過してしまう問題を修正する。これにより、訪問者に正確で信頼性の高い計算結果を提供する。

## 概要

本改善は以下の3つの作業から構成される。

1. 共通日付バリデーションユーティリティの新規作成
2. parseDate にラウンドトリップ検証を追加（問題 #12 の修正）
3. fromWareki に endDate チェックを追加（問題 #13 の修正）

## 作業手順

### ステップ1: 共通ユーティリティ src/lib/date-validation.ts の新規作成

目的: date-calculator/logic.ts と age-calculator/logic.ts に重複している parseDate() と formatDate() を共通化し、バリデーション付きの parseDate を一箇所で管理する。

作成するファイル: `/mnt/data/yolo-web/src/lib/date-validation.ts`

エクスポートする関数:

- `parseDate(dateStr: string): Date | null`
  - 正規表現で YYYY-MM-DD 形式を検証する
  - 年・月・日を数値として分解する
  - new Date(year, month - 1, day) で Date オブジェクトを作成する
  - ラウンドトリップ検証: 作成した Date の getFullYear(), getMonth(), getDate() が入力値と一致するかを確認する
  - 一致しない場合（= JavaScript が自動補正した場合）は null を返す
  - 一致する場合のみ有効な Date オブジェクトを返す

- `formatDate(date: Date): string`
  - 既存の両ツールの formatDate と同一の実装（YYYY-MM-DD 形式にフォーマット）

注意: 既存の src/lib/date.ts は ISO タイムスタンプからの変換用であり、用途が異なるため別ファイルとする。命名の衝突を避けるためファイル名を date-validation.ts とする。

### ステップ2: date-calculator/logic.ts の修正

修正するファイル: `/mnt/data/yolo-web/src/tools/date-calculator/logic.ts`

変更内容:

a) parseDate と formatDate のインポート変更
- ローカル定義の parseDate() と formatDate() を削除する
- src/lib/date-validation.ts から parseDate と formatDate をインポートする

b) EraDefinition インターフェースに endDate を追加
- `endDate: Date | null` フィールドを追加する（null は現在進行中の元号を意味する）

c) ERAS 配列に endDate を設定
- 令和: endDate: null（現在進行中）
- 平成: endDate: new Date(2019, 3, 30)（2019-04-30）
- 昭和: endDate: new Date(1989, 0, 7)（1989-01-07）
- 大正: endDate: new Date(1926, 11, 24)（1926-12-24）
- 明治: endDate: new Date(1912, 6, 29)（1912-07-29）

d) fromWareki() に endDate チェックを追加
- startDate チェックの後に、endDate チェックを追加する
- era.endDate が null でない場合、生成した日付が era.endDate を超えていたらエラーを返す
- エラーメッセージ例: `${eraKanji}${eraYear}年${month}月${day}日は${eraKanji}の範囲外です`（具体的でわかりやすいメッセージ）

e) fromWareki() 内の日付生成にもラウンドトリップ検証を追加
- 月・日の部分で無効な日付（例: 2月31日）が補正されないように、new Date() で生成した日付が入力の month, day と一致するかを確認する
- 一致しない場合は「無効な日付です」エラーを返す

### ステップ3: age-calculator/logic.ts の修正

修正するファイル: `/mnt/data/yolo-web/src/tools/age-calculator/logic.ts`

変更内容:
- ローカル定義の parseDate() と formatDate() を削除する
- src/lib/date-validation.ts から parseDate と formatDate をインポートする
- それ以外のロジックは変更しない（age-calculator には fromWareki がないため）

### ステップ4: テストの作成・修正

a) 新規テストファイル作成: `/mnt/data/yolo-web/src/lib/__tests__/date-validation.test.ts`

テストケース:

parseDate 正常系:
- 通常の有効な日付（2026-02-14）が正しくパースされる
- 閏年の2月29日（2024-02-29）が正しくパースされる
- 月初（2026-01-01）・月末（2026-01-31）が正しくパースされる
- formatDate と parseDate のラウンドトリップが一致する

parseDate 異常系（ラウンドトリップ検証で弾かれるケース）:
- 2026-02-31 が null を返す（2月は28日まで）
- 2026-02-29 が null を返す（2026年は閏年ではない）
- 2026-04-31 が null を返す（4月は30日まで）
- 2026-06-31 が null を返す（6月は30日まで）
- 2026-13-01 が null を返す（13月は存在しない）
- 2026-00-01 が null を返す（0月は存在しない）
- 2026-01-00 が null を返す（0日は存在しない）

parseDate 形式検証:
- "invalid" が null を返す
- "2026/02/14" が null を返す（スラッシュ区切り）
- "20260214" が null を返す（ハイフンなし）
- "" が null を返す（空文字列）

formatDate:
- 通常の日付を YYYY-MM-DD 形式にフォーマットする
- 月・日が1桁の場合にゼロパディングされる

b) 既存テストの修正: `/mnt/data/yolo-web/src/tools/date-calculator/__tests__/logic.test.ts`

- parseDate と formatDate のインポート元を ../logic から @/lib/date-validation に変更する
  （ただし、date-calculator/logic.ts が re-export している場合は変更不要。re-export するかどうかは後述の注意点を参照）
- fromWareki テストに endDate 境界値テストを追加:
  - 平成31年4月30日 が成功する（平成最終日）
  - 平成31年5月1日 が失敗する（令和初日 = 平成の範囲外）
  - 平成40年1月1日 が失敗する（明らかに範囲外）
  - 昭和64年1月7日 が成功する（昭和最終日）
  - 昭和64年1月8日 が失敗する（平成初日 = 昭和の範囲外）
  - 大正15年12月24日 が成功する（大正最終日）
  - 大正15年12月25日 が失敗する（昭和初日 = 大正の範囲外）
  - 令和の日付は制限なく成功する
- fromWareki の日付バリデーションテストを追加:
  - 令和8年2月31日 が失敗する（無効な日付）
  - 令和8年4月31日 が失敗する（無効な日付）

c) 既存テストの修正: `/mnt/data/yolo-web/src/tools/age-calculator/__tests__/logic.test.ts`

- parseDate と formatDate のインポート元を変更（上記と同様）
- parseDate の無効日付テストを追加:
  - 2026-02-31 が null を返す
  - 2026-02-29 が null を返す

### ステップ5: UI への影響確認

- date-calculator/Component.tsx は parseDate と formatDate を logic.ts からインポートしている。logic.ts が共通ユーティリティから re-export する設計にすれば、Component.tsx の変更は不要。
- age-calculator/Component.tsx も同様。
- エラーメッセージの表示は既に実装済みの仕組み（diffError, fromWarekiError, error state）で表示されるため、UI側の追加変更は不要。
- parseDate が null を返すケースが増えるため、既存の「有効な日付を入力してください」「生年月日を入力してください」等のエラーメッセージがそのまま表示される。ユーザーにとって十分わかりやすい。

## 注意点

### re-export パターンの採用
各ツールの logic.ts で parseDate と formatDate を削除して共通ユーティリティからインポートするが、Component.tsx は logic.ts から import しているため、logic.ts で re-export するのが最もインパクトが少ない。

```
// logic.ts に追加
export { parseDate, formatDate } from "@/lib/date-validation";
```

この方法であれば Component.tsx とテストファイルのインポート文を変更する必要がない。

### 既存テストの互換性
- parseDate の戻り値の型（Date | null）は変わらない
- 有効な日付に対する動作は全く変わらない
- 無効な日付（2026-02-31等）に対する動作のみ変わる（補正された日付を返していたのが null を返すようになる）
- 既存テストで無効日付が通過することを前提としたテストは存在しないため、既存テストは全て通る

### fromWareki の日付バリデーション
fromWareki 内で new Date(westernYear, month - 1, day) を使って日付を生成しているが、ここでも月・日のオーバーフロー補正が発生する可能性がある。parseDate の共通ユーティリティとは別に、fromWareki 内でも year, month, day のラウンドトリップ検証を追加する必要がある。

### src/lib/date.ts との関係
既存の src/lib/date.ts は ISO タイムスタンプ文字列の表示用フォーマットのみを扱い、ブログ記事の日付表示等で使われている。今回新規作成する date-validation.ts はツール内部のロジック用であり、完全に別の責務。名前の衝突を避けるため別ファイルとして管理する。

## 完了条件

1. src/lib/date-validation.ts が作成され、ラウンドトリップ検証付き parseDate と formatDate がエクスポートされている
2. date-calculator/logic.ts と age-calculator/logic.ts のローカル parseDate / formatDate が共通ユーティリティに置き換えられている（re-export 経由）
3. date-calculator/logic.ts の EraDefinition に endDate が追加され、ERAS 配列に正確な終了日が設定されている
4. fromWareki() に endDate チェックと日付のラウンドトリップ検証が追加されている
5. 全ての新規テスト（date-validation.test.ts の境界値テスト、fromWareki の endDate 境界テスト）が通る
6. 全ての既存テストが引き続き通る
7. npm run build がエラーなく完了する
8. UI上でエラーメッセージが適切に表示される（手動確認または既存のエラー表示ロジックのカバレッジ確認）

## 作業の委譲方針

builder に対して以下の単位で作業を委譲することを推奨する:

- 作業1: src/lib/date-validation.ts の作成 + テスト（ステップ1 + ステップ4a）
- 作業2: date-calculator/logic.ts の修正 + テスト（ステップ2 + ステップ4b）
- 作業3: age-calculator/logic.ts の修正 + テスト（ステップ3 + ステップ4c）

ただし、作業1が完了してから作業2・3を行う必要がある（依存関係あり）。作業2と3は独立して並行実施可能。

