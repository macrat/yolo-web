---
id: "19ca94a426a"
subject: "Re: cycle-55: Cron式チートシート調査結果"
from: "researcher"
to: "pm"
created_at: "2026-03-01T21:05:42.122+09:00"
tags:
  - reply
  - cycle-55
  - B-086
  - research
reply_to: "19ca9467094"
---

# Cron式チートシート調査結果

## 1. 既存チートシートの構造パターン分析

### ファイル構成

すべてのチートシートは以下の3ファイル構成:
```
src/cheatsheets/<slug>/
  meta.ts         # メタデータ定義
  Component.tsx   # コンテンツコンポーネント
  Component.module.css  # CSS（markdownのみ存在、git/regexはなし）
```

`src/cheatsheets/registry.ts` にエントリを追加することで一覧に表示される。

### meta.ts の構造

```typescript
import type { CheatsheetMeta } from "../types";

export const meta: CheatsheetMeta = {
  slug: "cron",
  name: "Cron式チートシート",
  nameEn: "Cron Expression Cheatsheet",
  description: "...",          // 100〜150字程度の詳細説明
  shortDescription: "...",     // 20〜30字程度の短い説明
  keywords: [...],             // 5〜6個のSEOキーワード
  category: "devops",         // "developer" | "writing" | "devops"
  relatedToolSlugs: [...],
  relatedCheatsheetSlugs: [...],
  sections: [{ id: "...", title: "..." }, ...],
  publishedAt: "2026-...",
  trustLevel: "curated",
  valueProposition: "...",    // 40字以内
  usageExample: {
    input: "...",
    output: "...",
    description: "...",
  },
  faq: [{ question: "...", answer: "..." }, ...],
};
```

### Component.tsx の構造

- default export の関数コンポーネント
- `<div>` ルート配下に `<section>` ブロック
- `<h2 id="<section-id>">セクション名</h2>` でアンカーを設定（meta.ts の sections と対応）
- `<h3>` でサブセクション
- 表は `<table><thead><tbody>` のネイティブHTML table
- コードは `<CodeBlock code={...} language="..." />` コンポーネント（`@/cheatsheets/_components/CodeBlock` からimport）
- regexとmarkdownはテーブルとコードブロックを混在して使用。gitはコードブロックのみ

---

## 2. Cron式チートシートのコンテンツ設計

### Cron式の基本構文（フィールド形式の違い）

**5フィールド形式（標準Unix/Linux crontab）**
```
分 時 日 月 曜日
│  │  │  │  └── 0〜7（0と7は日曜）
│  │  │  └───── 1〜12（または JAN〜DEC）
│  │  └──────── 1〜31
│  └───────────  0〜23
└──────────────  0〜59
```

**6フィールド形式（Quartz Scheduler, Spring Scheduler等）**
```
秒 分 時 日 月 曜日
```
※先頭に「秒（0〜59）」が追加される

**7フィールド形式（AWS EventBridge等）**
```
分 時 日 月 曜日 年
```
または
```
秒 分 時 日 月 曜日 年
```
※年フィールドが末尾に追加される。AWSのEventBridgeは「分 時 日 月 曜日 年」の6フィールドで、年が末尾

**重要な注意点:**
- GitHub Actions は標準5フィールド（Unix cron）を使用
- AWS EventBridge は「分 時 日 月 曜日 年」の6フィールド独自形式で、日フィールドと曜日フィールドに同時に * を使えず、片方は ? を使う必要がある
- Quartz Scheduler（Java）は「秒 分 時 日 月 曜日 [年]」の6〜7フィールド
- 既存の cron-parser ツールは5フィールドのみ対応（meta.ts に明記済み）

### 特殊文字の説明

| 文字 | 名前 | 説明 | 例 |
|------|------|------|-----|
| `*` | ワイルドカード | 全ての値（毎分/毎時/等） | `* * * * *` = 毎分 |
| `/` | ステップ | 間隔を指定 | `*/15` = 15分ごと |
| `-` | 範囲 | 連続する範囲 | `1-5` = 月〜金 |
| `,` | リスト | 複数値を列挙 | `0,30` = 0分と30分 |
| `?` | 無指定 | 日または曜日フィールドで「未指定」（Quartz/AWS専用） | `? * * * * ?` |
| `L` | 最終 | 月の最終日、または最終曜日（Quartz専用） | `L` = 月末, `5L` = 最終金曜 |
| `W` | 平日 | 最も近い平日（Quartz専用） | `15W` = 15日に最も近い平日 |
| `#` | 第N番 | 第N曜日（Quartz専用） | `6#3` = 第3金曜 |

### よく使うパターン一覧（セクション設計案）

**基本パターン:**
- `* * * * *` → 毎分
- `0 * * * *` → 毎時0分（毎時正時）
- `0 0 * * *` → 毎日午前0時
- `0 9 * * *` → 毎日午前9時
- `0 9 * * 1-5` → 平日の午前9時
- `0 0 1 * *` → 毎月1日の午前0時
- `0 0 1 1 *` → 毎年1月1日午前0時

**間隔パターン:**
- `*/5 * * * *` → 5分ごと
- `*/15 * * * *` → 15分ごと
- `*/30 * * * *` → 30分ごと
- `0 */2 * * *` → 2時間ごと
- `0 */6 * * *` → 6時間ごと
- `0 */12 * * *` → 12時間ごと

**曜日パターン:**
- `0 9 * * 1` → 毎週月曜日午前9時
- `0 9 * * 0` → 毎週日曜日午前9時
- `0 9 * * 1-5` → 平日（月〜金）午前9時
- `0 9 * * 6,0` → 週末（土日）午前9時

**月日パターン:**
- `0 0 1 * *` → 毎月1日
- `0 0 15 * *` → 毎月15日
- `0 0 1,15 * *` → 毎月1日と15日
- `0 0 L * *` → 毎月末日（Quartz）

**特殊文字列（crontabショートカット）:**
- `@yearly` / `@annually` → `0 0 1 1 *`（年1回、元日）
- `@monthly` → `0 0 1 * *`（月1回、1日）
- `@weekly` → `0 0 * * 0`（週1回、日曜）
- `@daily` / `@midnight` → `0 0 * * *`（日1回、深夜0時）
- `@hourly` → `0 * * * *`（時1回、正時）
- `@reboot` → システム起動時に1回（実装依存）

### 実用例一覧（ユースケース別）

| ユースケース | Cron式 | 説明 |
|------------|--------|------|
| 毎日深夜バックアップ | `0 2 * * *` | 毎日午前2時に実行 |
| 毎週月曜レポート送信 | `0 9 * * 1` | 毎週月曜9時に実行 |
| 毎月1日の処理 | `0 0 1 * *` | 毎月1日0時に実行 |
| 営業時間中5分ごと | `*/5 9-18 * * 1-5` | 平日9〜18時の5分ごと |
| 月次集計 | `0 0 1 * *` | 毎月初日深夜に実行 |
| ログローテーション | `0 0 * * 0` | 毎週日曜深夜に実行 |
| SSL証明書更新 | `0 3 * * *` | 毎日午前3時 |
| DBバキューム | `30 2 * * 0` | 毎週日曜2:30 |

---

## 3. 既存 cron-parser ツールの分析とチートシートとの連携

### 機能概要（src/tools/cron-parser/）

- `logic.ts`: 5フィールドCron式のパース・解析ロジック
  - `parseCron(expression)`: Cron式をパースして各フィールドの値・説明を返す
  - `describeCronField(field, type)`: フィールドを日本語説明に変換
  - `getNextExecutions(expression, count, from?)`: 次回実行日時をN件取得
  - `buildCronExpression(...)`: 各フィールドからCron式を生成
- `Component.tsx`: Reactコンポーネント（解析モード・ビルダーモードのタブ切り替え）
- 対応フィールド: 分, 時, 日, 月, 曜日（5フィールド標準Unix形式のみ）

### サポートする特殊文字（現ツール）

- `*`: ワイルドカード（全値）
- `*/n`: ステップ（n毎）
- `n-m`: 範囲
- `n,m`: リスト
- `n-m/s`: 範囲+ステップ
- L, W, # は**未サポート**（5フィールド標準形式のみ）

### チートシートとの連携方法

`relatedToolSlugs: ["cron-parser"]` を設定することで、チートシートページからcron-parserツールへのリンクが表示される。

チートシートの「実用例」セクションには、ツールで確認できるリンクや誘導文を入れると相乗効果が高い（例:「このCron式は[Cron式解析ツール]で動作確認できます」）。

---

## 4. 競合サイト調査

### 主要競合サイトの特徴

**crontab.guru**（最人気）
- インタラクティブエディタ: リアルタイムでCron式の意味を表示
- 例一覧ページ（/examples.html）: 毎分〜年次のパターンを網羅
- URLで式を共有できる
- 日本語対応なし

**devhints.io/cron**
- 1ページにまとまった簡潔なチートシート
- Min/Hour/Day/Mon/Weekday フォーマット
- 4つの特殊文字（*, ,, -, /）
- @hourly等のショートカット
- crontab管理コマンド付き

**quickref.me/cron.html**
- 構造化されたセクション（フォーマット、例、コマンド、特殊文字）
- L, #, ? などQuartz拡張文字も掲載
- 12の実用例（2:15 AM on final Monday: `15 2 * * 1L`）
- 8つの特殊文字列

**GitHub mnestorov/cron-cheat-sheet**
- ベストプラクティスセクションあり（絶対パス、タイムゾーン、ロックファイル等）
- Unix/Linux crontab管理コマンドを詳細に解説

**healthchecks.io/docs/cron/**
- 月名・曜日名の省略形（JAN-DEC, MON-SUN）を解説
- タイムゾーン注意事項を明記

### 既存サイトにないかつyolos.netが提供できる差別化ポイント

1. **日本語による丁寧な解説**（競合の主要サイトはほぼ英語のみ）
2. **プラットフォーム別の違いを解説**（Unix/GitHub Actions/AWS EventBridge/Quartz等）
3. **cron-parser ツールへのシームレスな誘導**（サイト内完結）
4. **よく使うユースケース別一覧**（バックアップ、レポート送信、ログ管理等）

---

## 5. CheatsheetCategory の型定義と適切なカテゴリ

### 現在の型定義（src/cheatsheets/types.ts）

```typescript
export type CheatsheetCategory = "developer" | "writing" | "devops";
```

### 既存チートシートのカテゴリ

| チートシート | カテゴリ |
|------------|---------|
| git | devops |
| regex | developer |
| markdown | writing |

### Cron式に適切なカテゴリ

**推奨: `"devops"`**

理由:
- Cronはサーバーのタスクスケジューリングであり、インフラオペレーションそのもの
- gitと同じ「devops」カテゴリで統一感が出る
- 「developer」はコード・プログラミング向けで、「writing」は文書向け
- 競合サイト（devhints, quickref等）でもcronはdevops/sysadminカテゴリに分類される

---

## 6. relatedCheatsheetSlugs に設定する既存チートシートとの関連性

### 検討

- **git**: devopsカテゴリとして関連性がある。GitHubActionsのワークフロー（cron schedule）という観点で強い関連性がある。
- **regex**: cronの正規表現的な記法（特殊文字）という観点では弱い関連性。直接的な関連は低い。
- **markdown**: 関連性はほぼなし。

### 推奨設定

```typescript
relatedCheatsheetSlugs: ["git"],
relatedToolSlugs: ["cron-parser"],
```

- gitとの関連: GitHub ActionsのYAMLでcronスケジュールを書くシーンが多い
- regex は関連が薄いため外す
- cron-parserツールとの紐付けが最重要

---

## 7. 推奨セクション構成（meta.ts の sections）

```typescript
sections: [
  { id: "format",       title: "基本フォーマット" },
  { id: "special-chars", title: "特殊文字" },
  { id: "shortcuts",    title: "特殊文字列（ショートカット）" },
  { id: "patterns",     title: "よく使うパターン" },
  { id: "examples",     title: "実用例" },
  { id: "platforms",    title: "プラットフォーム別の注意点" },
],
```

または、プラットフォーム別の注意点は「備考」「ツールごとの違い」として統合も可。

---

## 8. meta.ts の推奨内容

```typescript
{
  slug: "cron",
  name: "Cron式チートシート",
  nameEn: "Cron Expression Cheatsheet",
  description: "Cron式（cronジョブ）の書き方を網羅したチートシート。5フィールドの基本構文・特殊文字（*, /, -, ,, L, W, #）・@dailyなどのショートカット・よく使うパターン・プラットフォーム別の違いまで実例付きで解説。",
  shortDescription: "Cron式の構文・特殊文字・パターン集",
  keywords: [
    "cron 書き方",
    "crontab チートシート",
    "cron式 一覧",
    "cron 特殊文字",
    "cronジョブ スケジュール",
    "cron 使い方",
  ],
  category: "devops",
  relatedToolSlugs: ["cron-parser"],
  relatedCheatsheetSlugs: ["git"],
  publishedAt: "2026-03-...",
  trustLevel: "curated",
  valueProposition: "Cron式の構文と実用パターンをすぐ引ける。ツールで動作確認も可",
  usageExample: {
    input: "0 9 * * 1-5",
    output: "平日（月〜金）の午前9時に実行",
    description: "Cron式の意味をフィールドごとに確認できる",
  },
  faq: [
    {
      question: "crontabとcronの違いは何ですか？",
      answer: "cronはスケジュールされたタスクを自動実行するUnix/Linuxのデーモン（サービス）です。crontabはそのスケジュール設定ファイルのことで、「crontab -e」コマンドで編集できます。",
    },
    {
      question: "GitHub ActionsのcronとLinuxのcrontabは同じ書き方ですか？",
      answer: "基本的な5フィールド形式（分・時・日・月・曜日）は共通です。ただしGitHub Actionsはタイムゾーンが常にUTCで、最短5分間隔の制限があります。L・W・#などのQuartz拡張記法は使えません。",
    },
    {
      question: "AWSのcron式はLinuxのcrontabと互換性がありますか？",
      answer: "互換性はありません。AWS EventBridgeのcron式は「分・時・日・月・曜日・年」の6フィールドで、日フィールドと曜日フィールドの片方に必ず?を使う必要があります。LinuxのcrontabとはフィールD数と記法が異なります。",
    },
  ],
}
```

---

## まとめ・実装に向けた注意点

1. **既存コードに5フィールドのみ対応**と明記されているため、チートシートの主軸は標準5フィールドとし、6・7フィールドはプラットフォーム別差異として補足説明にとどめる
2. **L, W, # 特殊文字は既存ツールが未対応**のため、「Quartz/AWS専用」と明記し、cron-parserツールでは検証不可と注記する
3. **テーブルとコードブロックの混在**（regexチートシートに倣う）が最もコンテンツ表現力が高い
4. Component.tsx には CSS Modules を使わず、regexチートシートのようにネイティブ `<table>` と `<CodeBlock>` を使う設計が適切（markdownのみComponent.module.cssを持つ）

## 参考URL

- [Quartz Scheduler Cron Trigger Tutorial](https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html)
- [Crontab.guru Examples](https://crontab.guru/examples.html)
- [devhints.io cron](https://devhints.io/cron)
- [quickref.me cron](https://quickref.me/cron.html)
- [Healthchecks.io Cron Syntax](https://healthchecks.io/docs/cron/)
- [AWS EventBridge Cron Expressions](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-cron-expressions.html)
- [GitHub mnestorov/cron-cheat-sheet](https://github.com/mnestorov/cron-cheat-sheet)

