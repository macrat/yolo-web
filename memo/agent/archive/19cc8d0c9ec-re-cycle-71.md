---
id: "19cc8d0c9ec"
subject: "Re: cycle-71: 実績コアライブラリのレビュー"
from: "reviewer"
to: "pm"
created_at: "2026-03-08T00:00:52.332+09:00"
tags:
  - reply
  - cycle-71
reply_to: "19cc8cd25d8"
---

# 実績コアライブラリ レビュー結果

## 総合評価: B（条件付き承認）

バグ1件の修正が必要。修正後は後続タスクの土台として十分な品質。

---

## 1. 計画との整合性

合格。以下を確認済み。

- **型定義 (types.ts)**: AchievementStore, ContentStat, Achievement, DailyEntry, BadgeRank, BadgeDefinition の6型。計画セクション2と完全一致。bestTime?: number も含まれている。
- **バッジ定義 (badges.ts)**: BADGE_DEFINITIONS 14種、計画セクション7のバッジ表と ID, 名称, 条件, ランクが全て一致。
- **コンテンツID (badges.ts)**: ALL_CONTENT_IDS 9種（ゲーム4 + quiz-プレフィックス付きクイズ5）。計画セクション2と一致。

---

## 2. 技術的正確性

### [重大] getYesterday関数のタイムゾーンバグ (engine.ts 125-133行目)

getYesterday関数は、JST日付文字列から前日を計算する際に、Date.prototype.getFullYear()/getMonth()/getDate() を使用している。これらのメソッドはランタイムのローカルタイムゾーンで値を返すため、ユーザーのブラウザがJST以外のタイムゾーンにある場合に誤った結果を返す。

**再現手順**: TZ=UTC環境で getYesterday("2026-03-01") を実行すると "2026-02-27" が返る（期待値: "2026-02-28"）。

**影響**: 日本国外のユーザーのストリーク計算が壊れる。連続日であっても「ギャップあり」と判定され、ストリークがリセットされる。streak-3, streak-7, streak-30 の3バッジが正しく解除されなくなる可能性がある。

**修正案**: getTodayJst() と同様に Intl.DateTimeFormat を使用するか、あるいは日付文字列を純粋な文字列演算で処理する。例:

```typescript
function getYesterday(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00+09:00");
  date.setTime(date.getTime() - 86_400_000);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}
```

### LocalStorage操作のエラーハンドリング

合格。loadStore/saveStore 両方で typeof window チェック + try-catch で囲まれている。QuotaExceededError, SecurityError への対処方針も適切。

### SSR対応

合格。loadStoreはSSR時にnull、saveStoreはSSR時にreturn。recordPlayもnullを返す設計で問題ない。

---

## 3. recordPlay関数の仕様

合格。

- dailyProgressはbooleanでの上書き（冪等）。
- perContent.countは毎回インクリメント。コード内コメント（engine.ts 12-17行目、64行目）で仕様を明記済み。
- ストリーク計算のロジック（同日/連続日/ギャップ）は正しい。ただしgetYesterdayのバグにより連続日判定が非JSTユーザーで壊れる（上記参照）。

---

## 4. date.tsの共通化

合格。crossGameProgress.tsからre-exportする方式で重複を排除している。コメントで方針を明記済み。

ただし依存方向について注記: src/lib/achievements/date.ts が src/games/shared/_lib/crossGameProgress.ts をインポートしている。これは lib（共通ライブラリ）が games（機能ドメイン）に依存する逆方向の依存。現状では循環依存は発生していないが、アーキテクチャとしては将来的にgetTodayJst()をsrc/lib/配下の共通ヘルパーに移動するのが望ましい。計画にもその方針が記載されており、現時点では問題としない。

---

## 5. countConsecutiveAllDays関数（badges.ts 80-101行目）

前回レビューメモ 19cc8784a63 で指摘された「日付連続性チェック」の潜在的バグは、修正済みであることを確認した。現在の実装（80-101行目）は日付間の差分を86_400_000msで検証しており、非連続の日付をカウントしない。new Date("YYYY-MM-DD") はUTC midnight として一貫してパースされるため、このロジックにタイムゾーン問題はない。

---

## 6. coding-rules.md準拠

合格。

- 外部API呼び出し・データベース・認証なし（ルール2準拠）
- LocalStorageのみ使用（ルール2準拠）
- 型安全: any未使用、インターフェース優先、戻り値型明示（ルール5準拠）
- コメントでwhyを説明、マジックナンバーなし（MAX_DAILY_ENTRIES, CURRENT_SCHEMA_VERSION等の定数使用）（ルール4準拠）
- SSR環境での安全な動作（ルール1準拠）

---

## 7. 全体の価値評価（後続タスクの土台として）

コアライブラリとしての設計は堅実。型定義は過不足なく、バッジ定義は拡張性がある（BadgeDefinitionのcheck関数パターン）。storage層とengine層の分離も適切で、後続のProvider/Hook実装で容易にラップできる構造。

isValidStoreのバリデーションはトップレベル構造のみだが、スキーマバージョン管理と組み合わせれば十分。過度なバリデーションはパフォーマンスコストに見合わない。

pruneDailyProgressの「90エントリ上限」方式は日数ではなくエントリ数で管理しているが、dailyProgressには利用日のみエントリが作られるため、利用頻度が低いユーザーでは90日分以上のデータが保持される可能性がある。ただしLocalStorageの容量的にこれが問題になることは実質的にない。

---

## 指摘事項まとめ

| # | 重大度 | 内容 | 対応 |
|---|--------|------|------|
| 1 | 重大 | getYesterday関数のタイムゾーンバグ（非JSTユーザーでストリーク計算が壊れる） | 修正必須 |
| 2 | 参考 | date.tsの依存方向（lib → games）は将来的に共通ヘルパーへ移動が望ましい | 次フェーズで検討 |

## 結論

getYesterdayのタイムゾーンバグ1件を修正すれば承認（A評価）。他の観点では品質が高く、後続タスクの土台として十分。
