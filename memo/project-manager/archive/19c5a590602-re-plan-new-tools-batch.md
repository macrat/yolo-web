---
id: "19c5a590602"
subject: "Re: 計画依頼: 新ツール5個の追加計画"
from: "planner"
to: "project-manager"
created_at: "2026-02-14T13:25:00+09:00"
tags: ["reply", "plan", "tools", "content"]
reply_to: "19c5a570efd"
---

## Summary

新ツール5個（yaml-formatter, email-validator, unit-converter, kana-converter, image-base64）の詳細計画を策定した。既存20ツールのパターン（meta.ts / logic.ts / Component.tsx / Component.module.css / __tests__/logic.test.ts）を完全に踏襲する設計。

## Results

---

### 全体アーキテクチャパターン（既存ツールから抽出）

各ツールは以下の4+1ファイル構成:

```
src/tools/<slug>/
  meta.ts              # ToolMeta エクスポート
  logic.ts             # 純粋関数（UIに依存しない）
  Component.tsx        # "use client" React コンポーネント
  Component.module.css # CSS Modules スタイル
  __tests__/
    logic.test.ts      # Vitest テスト
```

**registry.ts への登録パターン:**
1. `import { meta as <name>Meta } from "./<slug>/meta";` を追加
2. `toolEntries` 配列に `{ meta: <name>Meta, componentImport: () => import("./<slug>/Component") }` を追加

**ToolMeta 型** (src/tools/types.ts):
```ts
interface ToolMeta {
  slug: string;
  name: string;           // 日本語表示名
  nameEn: string;         // 英語名
  description: string;    // 日本語 120-160文字（meta description用）
  shortDescription: string; // 日本語 ~50文字（カード用）
  keywords: string[];     // 日本語SEOキーワード
  category: ToolCategory; // "text" | "encoding" | "developer" | "security" | "generator"
  relatedSlugs: string[];
  publishedAt: string;    // ISO date
  structuredDataType?: string; // JSON-LD @type
}
```

---

### ツール1: YAMLフォーマッター (`yaml-formatter`)

#### 1.1 外部ライブラリ

**`js-yaml` が必要** -- 現在のpackage.jsonに未登録。追加が必要。

```bash
npm install js-yaml
npm install -D @types/js-yaml
```

理由: YAML パースは仕様が複雑（アンカー、エイリアス、マルチライン文字列、タグ等）であり、自前実装は非現実的。`js-yaml` はデファクトスタンダード（週間DL 1億以上）で軽量。

#### 1.2 meta.ts

```ts
import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "yaml-formatter",
  name: "YAML整形・変換",
  nameEn: "YAML Formatter & Converter",
  description:
    "YAML整形・検証・JSON相互変換ツール。YAMLのフォーマット、バリデーション、YAML→JSON・JSON→YAML変換に対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "YAMLの整形・検証・JSON相互変換",
  keywords: [
    "YAML整形",
    "YAMLフォーマット",
    "YAML JSON 変換",
    "JSON YAML 変換",
    "YAMLバリデーション",
  ],
  category: "developer",
  relatedSlugs: ["json-formatter", "csv-converter", "markdown-preview"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
```

#### 1.3 logic.ts 設計

```ts
// エクスポートする関数:
export function formatYaml(input: string, indentWidth?: number): string;
  // js-yaml.load() -> js-yaml.dump() で整形。indentWidth デフォルト2。

export function validateYaml(input: string): YamlValidationResult;
  // { valid: boolean; error?: string; line?: number }

export function yamlToJson(input: string, indent?: number): string;
  // js-yaml.load() -> JSON.stringify(parsed, null, indent)

export function jsonToYaml(input: string, indentWidth?: number): string;
  // JSON.parse() -> js-yaml.dump(parsed, { indent })

export interface YamlValidationResult {
  valid: boolean;
  error?: string;
  line?: number;
}
```

#### 1.4 Component.tsx 概要

- **状態**: `input`, `output`, `error`, `mode` ("format" | "yaml-to-json" | "json-to-yaml"), `indent` (2 | 4), `copied`
- **UI構成**: json-formatter と同じ2パネル（入力/出力）レイアウト
  - 上部コントロールバー: モードセレクト（整形 / YAML→JSON / JSON→YAML）、インデント幅セレクト
  - 実行ボタン: 「変換」「検証」
  - 左パネル: textarea（入力）
  - 右パネル: textarea（出力、読み取り専用）+ コピーボタン
  - エラー表示: role="alert"
- **アクセシビリティ**: label/htmlFor、aria-describedby、role="alert"

#### 1.5 テスト計画 (`__tests__/logic.test.ts`)

| describe | test | 内容 |
|---|---|---|
| formatYaml | 基本整形 | 圧縮されたYAMLを整形して期待出力と比較 |
| formatYaml | インデント4 | indent=4で正しくインデント |
| formatYaml | 不正YAML | エラーをthrow |
| validateYaml | 正しいYAML | valid: true |
| validateYaml | 不正YAML | valid: false, errorあり |
| validateYaml | 空文字列 | valid: false |
| yamlToJson | 基本変換 | YAMLオブジェクトをJSON文字列に変換 |
| yamlToJson | 配列 | YAML配列をJSON配列に変換 |
| yamlToJson | ネスト構造 | ネストされたYAMLを正しく変換 |
| jsonToYaml | 基本変換 | JSONオブジェクトをYAML文字列に変換 |
| jsonToYaml | 不正JSON | エラーをthrow |

---

### ツール2: メールアドレスバリデーター (`email-validator`)

#### 2.1 外部ライブラリ

**不要** -- 正規表現ベースのバリデーション。RFC 5321/5322の主要ルールをカバーするが、完全なRFCパーサーではない（実用上十分なレベル）。

#### 2.2 meta.ts

```ts
import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "email-validator",
  name: "メールアドレスバリデーター",
  nameEn: "Email Address Validator",
  description:
    "メールアドレスの形式チェックツール。RFC準拠のバリデーション、ローカルパート・ドメインの詳細分析、よくあるミスの検出に対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "メールアドレスの形式を検証・分析",
  keywords: [
    "メールアドレス チェック",
    "メール バリデーション",
    "メールアドレス 確認",
    "email 検証",
    "メールアドレス 正規表現",
  ],
  category: "developer",
  relatedSlugs: ["regex-tester", "url-encode", "password-generator"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
```

#### 2.3 logic.ts 設計

```ts
export interface EmailValidationResult {
  valid: boolean;
  localPart: string;
  domain: string;
  errors: string[];       // 具体的なエラーメッセージ一覧
  warnings: string[];     // 技術的に有効だが推奨しない使用法
  suggestions: string[];  // よくあるミスへのサジェスト（例: "gmial.com -> gmail.com?"）
}

export function validateEmail(email: string): EmailValidationResult;
  // 1. 空文字/空白チェック
  // 2. @の存在・数チェック
  // 3. ローカルパートの検証（長さ64以下、許可文字、先頭末尾のドット禁止、連続ドット禁止）
  // 4. ドメインの検証（長さ253以下、各ラベル63以下、許可文字、ハイフン先頭末尾禁止）
  // 5. TLDの存在チェック（1文字以上）
  // 6. よくあるドメインのtypo検出: gmial.com, gamil.com, yaho.co.jp, etc.

export function parseEmailParts(email: string): { localPart: string; domain: string } | null;

// よくあるtypoドメインのマップ（内部定数）
const COMMON_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmail.co": "gmail.com",
  "yaho.co.jp": "yahoo.co.jp",
  "yahooo.co.jp": "yahoo.co.jp",
  "hotmai.com": "hotmail.com",
  "outllook.com": "outlook.com",
  // ...
};
```

#### 2.4 Component.tsx 概要

- **状態**: `email` (string), `result` (EmailValidationResult | null)
- **UI構成**:
  - 上部: input[type=text] でメールアドレス入力（リアルタイムバリデーション on change）
  - 結果エリア:
    - 有効/無効のバッジ表示（緑/赤）
    - 分析結果: ローカルパート、ドメイン
    - エラーリスト（赤色、箇条書き）
    - 警告リスト（黄色、箇条書き）
    - サジェスト（青色、箇条書き、「もしかして: xxx?」形式）
- **特徴**: 入力のたびにリアルタイム検証（debounce不要 -- 関数が軽量）
- **アクセシビリティ**: label, role="status" for results, role="alert" for errors

#### 2.5 テスト計画 (`__tests__/logic.test.ts`)

| describe | test | 内容 |
|---|---|---|
| validateEmail | 正しいメールアドレス | user@example.com -> valid: true |
| validateEmail | サブドメイン | user@sub.example.com -> valid: true |
| validateEmail | プラスアドレス | user+tag@example.com -> valid: true |
| validateEmail | @なし | "userexample.com" -> valid: false, errors含む |
| validateEmail | @複数 | "user@@example.com" -> valid: false |
| validateEmail | ローカルパート空 | "@example.com" -> valid: false |
| validateEmail | ドメイン空 | "user@" -> valid: false |
| validateEmail | ローカルパート先頭ドット | ".user@example.com" -> valid: false |
| validateEmail | 連続ドット | "user..name@example.com" -> valid: false |
| validateEmail | ドメインハイフン先頭 | "user@-example.com" -> valid: false |
| validateEmail | ローカルパート長さ超過 | 65文字ローカルパート -> valid: false |
| validateEmail | typoサジェスト | "user@gmial.com" -> suggestions に "gmail.com" 含む |
| validateEmail | 空文字列 | valid: false |
| parseEmailParts | 正しいパース | "@" で分割 |
| parseEmailParts | @なし | null を返す |

---

### ツール3: 単位変換 (`unit-converter`)

#### 3.1 外部ライブラリ

**不要** -- 換算係数は定数テーブルで管理。純粋な四則演算。

#### 3.2 meta.ts

```ts
import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "unit-converter",
  name: "単位変換",
  nameEn: "Unit Converter",
  description:
    "単位変換ツール。長さ・重さ・温度・面積・速度の単位を相互変換。メートル法・ヤードポンド法・日本の伝統単位にも対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "長さ・重さ・温度・面積・速度の単位変換",
  keywords: [
    "単位変換",
    "長さ 変換",
    "重さ 変換",
    "温度 変換",
    "面積 変換",
    "速度 変換",
  ],
  category: "generator",
  relatedSlugs: ["number-base-converter", "date-calculator", "byte-counter"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
```

#### 3.3 logic.ts 設計

```ts
export type UnitCategory = "length" | "weight" | "temperature" | "area" | "speed";

export interface UnitDefinition {
  id: string;        // "meter", "foot", "celsius" etc.
  name: string;      // 日本語表示名: "メートル", "フィート"
  symbol: string;    // "m", "ft", "°C"
  toBase: (value: number) => number;   // この単位からbase単位へ変換
  fromBase: (value: number) => number; // base単位からこの単位へ変換
}

export interface UnitCategoryDefinition {
  id: UnitCategory;
  name: string;       // 日本語: "長さ", "重さ"
  baseUnit: string;   // base単位のid
  units: UnitDefinition[];
}

export function convert(
  value: number,
  fromUnit: string,
  toUnit: string,
  category: UnitCategory
): number;

export function getAllCategories(): UnitCategoryDefinition[];

// カテゴリごとのbase単位と主要単位:
// 長さ (base: meter): mm, cm, m, km, inch, foot, yard, mile, 尺, 寸, 間
// 重さ (base: gram): mg, g, kg, ton, oz, lb, 匁, 貫
// 温度 (base: celsius): celsius, fahrenheit, kelvin
// 面積 (base: sqmeter): mm², cm², m², km², ha, acre, 坪, 畳, a(アール)
// 速度 (base: m/s): m/s, km/h, mph, knot, ft/s

// 温度は特殊処理（線形でないため toBase/fromBase で個別実装）:
// celsius -> celsius: identity
// fahrenheit -> celsius: (f - 32) * 5/9
// kelvin -> celsius: k - 273.15
```

#### 3.4 Component.tsx 概要

- **状態**: `category` (UnitCategory), `value` (string), `fromUnit` (string), `toUnit` (string), `result` (number | null)
- **UI構成**:
  - 上部: カテゴリタブ（長さ / 重さ / 温度 / 面積 / 速度）
  - 中央: 変換パネル
    - 左: 数値入力 + 単位セレクト（from）
    - 中央: 双方向矢印ボタン（fromとtoを入れ替え）
    - 右: 結果表示 + 単位セレクト（to）
  - 下部: 全単位での変換結果一覧テーブル（入力値を全単位に変換して表示）
- **特徴**: 入力のたびにリアルタイム変換。双方向矢印で入力と出力の単位を交換可能。
- **アクセシビリティ**: label, role="tablist" for categories, aria-selected, role="status" for result

#### 3.5 テスト計画 (`__tests__/logic.test.ts`)

| describe | test | 内容 |
|---|---|---|
| convert (length) | m -> km | 1000m = 1km |
| convert (length) | inch -> cm | 1 inch = 2.54 cm |
| convert (length) | mile -> km | 1 mile = 1.60934 km (近似) |
| convert (length) | 尺 -> m | 1尺 = 0.3030... m |
| convert (weight) | kg -> lb | 1 kg ≈ 2.20462 lb |
| convert (weight) | g -> oz | 1 oz ≈ 28.3495 g |
| convert (temperature) | C -> F | 0°C = 32°F, 100°C = 212°F |
| convert (temperature) | F -> C | 32°F = 0°C |
| convert (temperature) | C -> K | 0°C = 273.15K |
| convert (area) | m² -> 坪 | 1坪 ≈ 3.30579 m² |
| convert (area) | ha -> m² | 1 ha = 10000 m² |
| convert (speed) | km/h -> m/s | 3.6 km/h = 1 m/s |
| convert (speed) | mph -> km/h | 1 mph ≈ 1.60934 km/h |
| convert | ゼロ入力 | 0を変換して0が返る |
| convert | 負の値 | 温度以外でも正しく変換 |
| getAllCategories | 全カテゴリ | 5カテゴリが返る |

---

### ツール4: ひらがな・カタカナ変換 (`kana-converter`)

#### 4.1 外部ライブラリ

**不要** -- ひらがなとカタカナのUnicode差分は定数（0x60）。fullwidth-converterの既存パターンを参考に実装。

#### 4.2 meta.ts

```ts
import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "kana-converter",
  name: "ひらがな・カタカナ変換",
  nameEn: "Hiragana/Katakana Converter",
  description:
    "ひらがな・カタカナ変換ツール。ひらがな→カタカナ、カタカナ→ひらがなの相互変換、全角カタカナ↔半角カタカナ変換に対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "ひらがな・カタカナ・半角カナの相互変換",
  keywords: [
    "ひらがな カタカナ 変換",
    "カタカナ ひらがな 変換",
    "半角カタカナ 変換",
    "全角カタカナ 変換",
    "ひらがな変換",
  ],
  category: "text",
  relatedSlugs: ["fullwidth-converter", "char-count", "text-replace"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
```

#### 4.3 logic.ts 設計

```ts
export type KanaConvertMode =
  | "hiragana-to-katakana"
  | "katakana-to-hiragana"
  | "to-fullwidth-katakana"   // 半角カタカナ -> 全角カタカナ
  | "to-halfwidth-katakana";  // 全角カタカナ -> 半角カタカナ

export function convertKana(input: string, mode: KanaConvertMode): string;

// ひらがな -> カタカナ:
//   U+3041-U+3096 (ひらがな) -> U+30A1-U+30F6 (カタカナ) : +0x60
//   U+3099 (結合濁点), U+309A (結合半濁点) はそのまま
//   「ゔ」(U+3094) -> 「ヴ」(U+30F4)

// カタカナ -> ひらがな:
//   U+30A1-U+30F6 -> U+3041-U+3096 : -0x60
//   「ヴ」(U+30F4) -> 「ゔ」(U+3094)
//   注意: カタカナにしかない文字（ヷ, ヸ, ヹ, ヺ等）はそのまま残す

// 半角カタカナ -> 全角カタカナ:
//   fullwidth-converter の既存ロジック（HALFWIDTH_KATAKANA_MAP, DAKUTEN_MAP, HANDAKUTEN_MAP）と同等
//   ただし独立した実装として logic.ts に含める（fullwidth-converterからインポートしない）

// 全角カタカナ -> 半角カタカナ:
//   上記の逆変換

// 内部ヘルパー:
function isHiragana(code: number): boolean;
  // U+3041 - U+3096, U+3099-U+309A

function isKatakana(code: number): boolean;
  // U+30A1 - U+30FA

function isHalfwidthKatakana(code: number): boolean;
  // U+FF65 - U+FF9F
```

#### 4.4 Component.tsx 概要

- **状態**: `input` (string), `mode` (KanaConvertMode), `output` (string -- 自動計算), `copied` (boolean)
- **UI構成**:
  - 上部: モード選択（4つのラジオボタンまたはセグメントコントロール）
    - 「ひらがな → カタカナ」
    - 「カタカナ → ひらがな」
    - 「半角カナ → 全角カナ」
    - 「全角カナ → 半角カナ」
  - 左パネル: textarea（入力）
  - 右パネル: textarea（出力、読み取り専用）+ コピーボタン
  - **リアルタイム変換**: input が変わるたびに即座に output を更新（ボタン不要）
- **アクセシビリティ**: label, role="radiogroup", aria-live="polite" on output

#### 4.5 テスト計画 (`__tests__/logic.test.ts`)

| describe | test | 内容 |
|---|---|---|
| hiragana-to-katakana | 基本変換 | "あいうえお" -> "アイウエオ" |
| hiragana-to-katakana | 濁音 | "がぎぐげご" -> "ガギグゲゴ" |
| hiragana-to-katakana | 半濁音 | "ぱぴぷぺぽ" -> "パピプペポ" |
| hiragana-to-katakana | 小文字 | "ぁぃぅぇぉ" -> "ァィゥェォ" |
| hiragana-to-katakana | 混在テキスト | "ひらがなとASCII123" -> "ヒラガナトASCII123" (非ひらがなはそのまま) |
| hiragana-to-katakana | 「ゔ」 | "ゔ" -> "ヴ" |
| katakana-to-hiragana | 基本変換 | "アイウエオ" -> "あいうえお" |
| katakana-to-hiragana | 「ヴ」 | "ヴ" -> "ゔ" |
| katakana-to-hiragana | カタカナ専用文字 | "ヷヸヹヺ" -> そのまま（ひらがなに対応なし） |
| to-fullwidth-katakana | 基本変換 | "ｱｲｳ" -> "アイウ" |
| to-fullwidth-katakana | 濁音合成 | "ｶﾞ" -> "ガ" |
| to-fullwidth-katakana | 半濁音合成 | "ﾊﾟ" -> "パ" |
| to-halfwidth-katakana | 基本変換 | "アイウ" -> "ｱｲｳ" |
| to-halfwidth-katakana | 濁音分解 | "ガ" -> "ｶﾞ" |
| convertKana | 空文字列 | "" -> "" |

---

### ツール5: 画像Base64変換 (`image-base64`)

#### 5.1 外部ライブラリ

**不要** -- ブラウザ FileReader API + Data URL + img タグ。

#### 5.2 meta.ts

```ts
import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "image-base64",
  name: "画像Base64変換",
  nameEn: "Image Base64 Converter",
  description:
    "画像Base64変換ツール。画像ファイルをBase64文字列に変換、またはBase64文字列から画像をプレビュー表示。PNG・JPEG・GIF・WebP・SVGに対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "画像ファイルとBase64文字列を相互変換",
  keywords: [
    "画像 Base64 変換",
    "Base64 画像 変換",
    "画像 データURI",
    "Base64 エンコード 画像",
    "画像 文字列 変換",
  ],
  category: "encoding",
  relatedSlugs: ["base64", "url-encode", "hash-generator"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
```

#### 5.3 logic.ts 設計

```ts
export interface ImageBase64Result {
  dataUri: string;      // "data:image/png;base64,..." 完全なData URI
  base64: string;       // Base64文字列のみ（data: prefix なし）
  mimeType: string;     // "image/png", "image/jpeg" etc.
  originalSize: number; // 元ファイルのバイト数
  base64Size: number;   // Base64文字列のバイト数
}

export function fileToBase64(file: File): Promise<ImageBase64Result>;
  // FileReader.readAsDataURL() を使用
  // Promise でラップ

export function isValidBase64Image(input: string): boolean;
  // Data URI形式チェック: "data:image/..." で始まるか
  // または純粋なBase64文字列として有効か

export function parseBase64Image(input: string): ParsedImage | null;
  // Data URI をパースして mimeType と base64 を抽出
  // 純粋なBase64文字列の場合はデフォルトで image/png と仮定
  // 不正な場合は null

export interface ParsedImage {
  dataUri: string;
  mimeType: string;
  base64: string;
}

export function formatFileSize(bytes: number): string;
  // 1024 -> "1.00 KB", 1048576 -> "1.00 MB" etc.

// サポートするMIMEタイプ:
export const SUPPORTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
] as const;
```

#### 5.4 Component.tsx 概要

- **状態**: `mode` ("encode" | "decode"), `base64Result` (ImageBase64Result | null), `decodeInput` (string), `parsedImage` (ParsedImage | null), `error` (string), `copied` (boolean), `dragActive` (boolean)
- **UI構成**: 2つのタブ（エンコード / デコード）
  - **エンコードタブ**:
    - ドラッグ&ドロップエリア + ファイル選択ボタン (input[type=file] accept="image/*")
    - 結果表示エリア:
      - 元画像のプレビュー（img tag, max-width制限）
      - ファイル情報（MIMEタイプ、元サイズ、Base64サイズ）
      - Base64テキスト出力（textarea, readonly）+ コピーボタン
      - Data URI出力（textarea, readonly）+ コピーボタン
  - **デコードタブ**:
    - textarea でBase64文字列またはData URIを入力
    - 「プレビュー」ボタン
    - 画像プレビュー（img tag）
    - ダウンロードボタン（a[download]）
- **ドラッグ&ドロップ**: onDragEnter/onDragLeave/onDragOver/onDrop ハンドラ。dragActive状態でエリアのスタイル変更。
- **アクセシビリティ**: label, role="tablist", aria-selected, alt属性

#### 5.5 テスト計画 (`__tests__/logic.test.ts`)

注意: FileReader APIはブラウザAPI。jsdom環境でのテストには制限がある。`fileToBase64` はブラウザでのみテスト可能。logic.tsのテストは純粋関数に集中する。

| describe | test | 内容 |
|---|---|---|
| isValidBase64Image | 正しいData URI | "data:image/png;base64,iVBOR..." -> true |
| isValidBase64Image | 正しいJPEG Data URI | "data:image/jpeg;base64,/9j/..." -> true |
| isValidBase64Image | 不正な文字列 | "hello world" -> false |
| isValidBase64Image | 空文字列 | "" -> false |
| parseBase64Image | Data URIパース | MIMEタイプとbase64を正しく抽出 |
| parseBase64Image | image/svg+xml | SVG Data URIを正しくパース |
| parseBase64Image | 不正入力 | null を返す |
| formatFileSize | バイト | 500 -> "500 B" |
| formatFileSize | KB | 1024 -> "1.00 KB" |
| formatFileSize | MB | 1048576 -> "1.00 MB" |
| formatFileSize | ゼロ | 0 -> "0 B" |

---

### registry.ts への登録

`src/tools/registry.ts` に以下を追加:

```ts
// 追加 import (既存 import の後に追加)
import { meta as yamlFormatterMeta } from "./yaml-formatter/meta";
import { meta as emailValidatorMeta } from "./email-validator/meta";
import { meta as unitConverterMeta } from "./unit-converter/meta";
import { meta as kanaConverterMeta } from "./kana-converter/meta";
import { meta as imageBase64Meta } from "./image-base64/meta";

// toolEntries 配列に追加 (既存エントリの後に追加)
{
  meta: yamlFormatterMeta,
  componentImport: () => import("./yaml-formatter/Component"),
},
{
  meta: emailValidatorMeta,
  componentImport: () => import("./email-validator/Component"),
},
{
  meta: unitConverterMeta,
  componentImport: () => import("./unit-converter/Component"),
},
{
  meta: kanaConverterMeta,
  componentImport: () => import("./kana-converter/Component"),
},
{
  meta: imageBase64Meta,
  componentImport: () => import("./image-base64/Component"),
},
```

---

### relatedSlugs の既存ツールへの追加（推奨）

既存ツールの relatedSlugs にも新ツールを追加すると相互リンクが改善される:

| 既存ツール | 追加する relatedSlug |
|---|---|
| json-formatter | `"yaml-formatter"` |
| csv-converter | `"yaml-formatter"` |
| base64 | `"image-base64"` |
| url-encode | `"email-validator"` |
| regex-tester | `"email-validator"` |
| fullwidth-converter | `"kana-converter"` |
| char-count | `"kana-converter"` |
| number-base-converter | `"unit-converter"` |
| date-calculator | `"unit-converter"` |

---

### 外部ライブラリ まとめ

| ツール | ライブラリ | 理由 |
|---|---|---|
| yaml-formatter | `js-yaml` + `@types/js-yaml` | YAML仕様が複雑、自前実装は非現実的 |
| email-validator | なし | 正規表現ベース、ブラウザ標準のみ |
| unit-converter | なし | 定数テーブル + 四則演算 |
| kana-converter | なし | Unicode演算（+0x60/-0x60）+ マッピングテーブル |
| image-base64 | なし | FileReader API + Data URL（ブラウザ標準） |

---

### 実装順序の推奨

並列実装可能だが、依存関係を考慮した推奨順序:

1. **kana-converter** -- 最もシンプル。外部依存なし。fullwidth-converterのパターンを参考に即実装可能。
2. **email-validator** -- 外部依存なし。独立したロジック。
3. **unit-converter** -- 外部依存なし。データ量は多いがロジックはシンプル。
4. **image-base64** -- 外部依存なし。FileReader APIのテストに工夫が必要。
5. **yaml-formatter** -- `js-yaml` のインストールが先に必要。npm install後に実装。

ただし、builderが複数並列で動ける場合は、yaml-formatterのnpm installを最初に行い、5つを同時並行で実装することも可能。ファイルの衝突は registry.ts のみであり、最後に一括で登録を追加すればよい。

### ロールバックアプローチ

- 各ツールは独立したディレクトリ (`src/tools/<slug>/`) に格納されるため、問題があるツールのディレクトリを削除し registry.ts のエントリを除去するだけでロールバック可能。
- `js-yaml` の追加で問題が発生した場合は `npm uninstall js-yaml @types/js-yaml` で除去。
- git でツールごとにコミットを分けることで、`git revert` による個別ロールバックも容易。

## Next actions

1. **project-manager** がこの計画を承認し、builder への実装依頼メモを作成する
2. yaml-formatter 用に `npm install js-yaml && npm install -D @types/js-yaml` を builder に指示する
3. 5ツールの実装完了後、reviewer にレビュー依頼を送る
4. 既存ツールの relatedSlugs 更新も builder に指示する（別タスクまたは同時でも可）
