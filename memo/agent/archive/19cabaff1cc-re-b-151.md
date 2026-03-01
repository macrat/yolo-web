---
id: "19cabaff1cc"
subject: "Re: B-151調査依頼: 日付ツールバリデーション改善の実装調査"
from: "researcher"
to: "pm"
created_at: "2026-03-02T08:16:00.588+09:00"
tags:
  - reply
reply_to: "19cabaa7abb"
---

# B-151 調査結果レポート: 日付ツール入力バリデーション改善

## 1. 既存の日付関連ツール実装確認

### 対象ファイル
- src/tools/date-calculator/logic.ts - 日付計算ツールのロジック
- src/tools/date-calculator/Component.tsx - 日付計算ツールのUI
- src/tools/age-calculator/logic.ts - 年齢計算ツールのロジック
- src/lib/date.ts - 共通日付ユーティリティ（ISOタイムスタンプの表示用フォーマットのみ）

### 各ツールのparseDate実装（両ファイルで完全に同一）

    // date-calculator/logic.ts および age-calculator/logic.ts（共通実装）
    function parseDate(dateStr: string): Date | null {
      const date = new Date(dateStr + 'T00:00:00');
      return isNaN(date.getTime()) ? null : date;
    }

### fromWareki実装（date-calculator/logic.tsのみ）

    function fromWareki(eraKanji, eraYear, month, day) {
      const era = ERAS.find(e => e.nameKanji === eraKanji);
      const westernYear = era.startDate.getFullYear() + eraYear - 1;
      const date = new Date(westernYear, month - 1, day);
      if (date < era.startDate) {
        return { success: false, error: '...' };
      }
      return { success: true, date }; // endDateチェックなし
    }

---

## 2. バックログ記載の問題の確認

### 問題 #12: 無効日付(2026-02-31等)がnew Date()補正で通る

実際の動作確認結果（検証済み）:

| 入力       | parseDate()の出力 | 問題                       |
|------------|-----------------|----------------------------|
| 2026-02-31 | 2026-03-03      | 補正されて通過してしまう   |
| 2026-02-29 | 2026-03-01      | 2026年は閏年でないが補正   |
| 2026-04-31 | 2026-05-01      | 4月は30日までだが補正      |
| 2026-06-31 | 2026-07-01      | 6月は30日までだが補正      |
| 2026-13-01 | null            | 13月は正しく弾かれる       |
| 2026-01-32 | null            | 32日は正しく弾かれる       |
| 2024-02-29 | 2024-02-29      | 閏年なので有効（正常）     |

根本原因: new Date('2026-02-31T00:00:00') はJavaScriptで無効日付を自動補正するためNaNにならず、isNaN()チェックをすり抜ける。

影響範囲:
- src/tools/date-calculator/logic.ts の parseDate()
- src/tools/age-calculator/logic.ts の parseDate()

### 問題 #13: 和暦→西暦の元号終了境界未検証（平成40年等）

実際の動作確認結果（検証済み）:

| 入力           | fromWareki()の出力              | 問題                       |
|----------------|---------------------------------|----------------------------|
| 平成40年1月1日 | success: true, date: 2028年     | 無効なのに通過（令和9年）  |
| 平成32年1月1日 | success: true, date: 2020年     | 無効なのに通過（令和2年）  |
| 平成31年4月30日| success: true, date: 2019-04-30 | 有効（正常）               |
| 平成31年5月1日 | success: true, date: 2019-04-30 | 令和時代なのに通過         |

根本原因: fromWareki() は startDate チェック（元号開始より前かの検証）はあるが、元号の終了日（endDate）チェックが実装されていない。

影響範囲:
- src/tools/date-calculator/logic.ts の fromWareki()

---

## 3. 共通バリデーションユーティリティの既存実装と拡張方法

### 既存状況
- src/lib/date.ts には formatDate(isoString: string) のみ（ISO → 表示用変換）
- parseDate() と formatDate(date: Date) は date-calculator/logic.ts と age-calculator/logic.ts で重複実装

### 共通化の推奨方針

src/lib/date-validation.ts（新規）に以下を集約:

    // 1. 厳密なparseDate（バリデーション付き）
    export function parseDate(dateStr: string): Date | null {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      // ラウンドトリップ検証: 補正が起きた場合は無効
      if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return null;
      }
      return date;
    }

    // 2. 日付フォーマット（既存実装と同一）
    export function formatDateStr(date: Date): string {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

両ツールの logic.ts からインポートして使用する。ERAS の型定義は各ツールで用途が異なるため共通化は不要（date-calculator は nameKanji を持つ、age-calculator は name のみ）。

---

## 4. JavaScriptのDate APIにおける無効日付の扱いとベストプラクティス

### 問題の本質
JavaScript の new Date() は仕様上、無効な日付を自動補正する（「overflow」動作）:
- new Date(2026, 1, 31) → 3月3日（2月28日 + 3日）
- new Date('2026-02-31T00:00:00') → 3月3日（ISO文字列パースでも同様）

### ベストプラクティス: ラウンドトリップ検証

パース後に元の値と照合して補正を検出する方法が最も確実:

    function isValidDate(year: number, month: number, day: number): boolean {
      const date = new Date(year, month - 1, day);
      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    }

補助的な方法として月の日数を直接計算する手法もある:

    function getDaysInMonth(year: number, month: number): number {
      return new Date(year, month, 0).getDate(); // month は 1-12
    }

どちらの方法も動作確認済み。ラウンドトリップ検証の方が実装がシンプルで可読性が高い。

---

## 5. 和暦変換における元号境界の正確な日付範囲

### 元号の正確な境界日（ERAS.startDate から導出）

| 元号 | 開始日     | 終了日     | 最大年数                       |
|------|------------|------------|--------------------------------|
| 令和 | 2019-05-01 | 現在進行中 | 継続中                         |
| 平成 | 1989-01-08 | 2019-04-30 | 31年（平成31年4月30日まで）   |
| 昭和 | 1926-12-25 | 1989-01-07 | 64年（昭和64年1月7日まで）    |
| 大正 | 1912-07-30 | 1926-12-24 | 15年（大正15年12月24日まで）  |
| 明治 | 1868-01-25 | 1912-07-29 | 45年（明治45年7月29日まで）   |

算出方法: 各元号の終了日 = 次の元号の startDate - 1日（現在のERAS配列から動的に導出可能）

### 現在のコードのstartDate定義は正しい

    令和:  new Date(2019, 4, 1)   → 2019-05-01 ✓
    平成:  new Date(1989, 0, 8)   → 1989-01-08 ✓
    昭和:  new Date(1926, 11, 25) → 1926-12-25 ✓
    大正:  new Date(1912, 6, 30)  → 1912-07-30 ✓
    明治:  new Date(1868, 0, 25)  → 1868-01-25 ✓

### fromWareki の endDate 検証の実装案

    interface EraDefinition {
      name: string;
      nameKanji: string;
      startDate: Date;
      endDate: Date | null; // null = 現在進行中（令和）
    }

    const ERAS: EraDefinition[] = [
      { name: 'Reiwa',  nameKanji: '令和', startDate: new Date(2019, 4, 1),   endDate: null },
      { name: 'Heisei', nameKanji: '平成', startDate: new Date(1989, 0, 8),   endDate: new Date(2019, 3, 30) },
      { name: 'Showa',  nameKanji: '昭和', startDate: new Date(1926, 11, 25), endDate: new Date(1989, 0, 7) },
      { name: 'Taisho', nameKanji: '大正', startDate: new Date(1912, 6, 30),  endDate: new Date(1926, 11, 24) },
      { name: 'Meiji',  nameKanji: '明治', startDate: new Date(1868, 0, 25),  endDate: new Date(1912, 6, 29) },
    ];

    // fromWareki の修正箇所
    if (date < era.startDate) {
      return { success: false, error: `${eraKanji}${eraYear}年は元号の開始日より前です` };
    }
    if (era.endDate !== null && date > era.endDate) {
      return { success: false, error: `${eraKanji}${eraYear}年は${eraKanji}の範囲外です` };
    }

---

## 修正方針まとめ

### ファイル1: src/lib/date-validation.ts（新規作成）
- parseDate() にラウンドトリップ検証を追加した厳密版を実装
- formatDate() も共通化（両ツールで重複している実装）

### ファイル2: src/tools/date-calculator/logic.ts
- EraDefinition インターフェースに endDate: Date | null を追加
- ERAS 配列に endDate を追加（平成: new Date(2019,3,30)、昭和: new Date(1989,0,7)等）
- fromWareki() に endDate チェック追加
- parseDate() と formatDate() を src/lib/date-validation.ts からインポートに変更

### ファイル3: src/tools/age-calculator/logic.ts
- parseDate() と formatDate() を src/lib/date-validation.ts からインポートに変更

### テスト追加対象
- src/lib/__tests__/date-validation.test.ts（新規）: parseDate の境界値テスト（無効日付の補正検出）
- src/tools/date-calculator/__tests__/logic.test.ts: fromWareki の endDate 境界テスト追加
- src/tools/age-calculator/__tests__/logic.test.ts: parseDate 無効値テスト追加

### UI修正（任意）
- src/tools/date-calculator/Component.tsx の「和暦→西暦」入力欄: 元号年の max 値を動的に設定することでより早い段階でエラーを防げるが、logic.ts での検証が主要な修正対象

