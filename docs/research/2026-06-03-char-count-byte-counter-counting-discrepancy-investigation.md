# char-count / byte-counter 数え方の食い違いバグ 現状調査レポート

調査日: 2026-06-03
対象: cycle-220 監査確定バグ ①-1

---

## 1. 両ツールの logic.ts 関数対比

### 1-1. countChars（文字数）

| 観点             | char-count/logic.ts                                 | byte-counter/logic.ts                                         |
| ---------------- | --------------------------------------------------- | ------------------------------------------------------------- |
| 実装             | `return text.length;` (L11)                         | `return Array.from(text).length;` (L20)                       |
| 数え方           | UTF-16 コードユニット数（絵文字=2、サロゲートペア） | Unicodeコードポイント数（絵文字=1）                           |
| 入力「😀」の結果 | 2                                                   | 1                                                             |
| コメント         | なし                                                | `// Use Array.from to handle surrogate pairs correctly` (L19) |

### 1-2. countCharsNoSpaces（空白なし文字数）

| 観点                          | char-count/logic.ts                            | byte-counter/logic.ts                                      |
| ----------------------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| 実装                          | `return text.replace(/\s/g, "").length;` (L15) | `return Array.from(text.replace(/\s/g, "")).length;` (L24) |
| 数え方                        | 空白除去後に UTF-16 コードユニット数           | 空白除去後に Array.from でコードポイント数                 |
| 入力「a😀」の結果（空白なし） | 3                                              | 2                                                          |

### 1-3. countWords（単語数）

| 観点                 | char-count/logic.ts                                                                                         | byte-counter/logic.ts                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 実装                 | Intl.Segmenter("ja", {granularity:"word"}) → isWordLike フィルタ (L26-29) / フォールバック: 空白split (L33) | 空白splitのみ: `text.trim().split(/\s+/).length` (L35)          |
| 数え方               | 日本語形態素解析（単語境界を意味で判断）+ 英語対応                                                          | 空白区切りのみ（日本語では「あいうえおかきくけこ」が1単語扱い） |
| 入力「hello world」  | 2                                                                                                           | 2（一致）                                                       |
| 入力「東京は大きい」 | Intl.Segmenter: 3〜4程度（形態素解析）                                                                      | 1（スペースなし→全体で1）                                       |

### 1-4. countLines（行数）

| 観点   | char-count/logic.ts                                                   | byte-counter/logic.ts                                                       |
| ------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 実装   | `if (text === "") return 0; return text.split("\n").length;` (L36-38) | 同一: `if (text === "") return 0; return text.split("\n").length;` (L27-29) |
| 数え方 | 完全一致                                                              | 完全一致                                                                    |

### 1-5. countParagraphs（段落数）

| 観点 | char-count/logic.ts                                                     | byte-counter/logic.ts                                            |
| ---- | ----------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 実装 | `text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length` (L43) | **存在しない**（ByteCountResult インターフェースにも含まれない） |

### 1-6. countBytes（バイト数）

| 観点   | char-count/logic.ts                                       | byte-counter/logic.ts                                           |
| ------ | --------------------------------------------------------- | --------------------------------------------------------------- |
| 実装   | `return new TextEncoder().encode(text).byteLength;` (L19) | 同一: `return new TextEncoder().encode(text).byteLength;` (L15) |
| 数え方 | 完全一致                                                  | 完全一致                                                        |

### 1-7. analyzeByteDistribution（バイト分布分析）

| 観点 | char-count/logic.ts | byte-counter/logic.ts                                                         |
| ---- | ------------------- | ----------------------------------------------------------------------------- |
| 実装 | **存在しない**      | `for (const char of text)` でコードポイント単位に TextEncoder を適用 (L39-69) |

---

## 2. meta.ts の数え方に関する記述

### char-count/meta.ts

ファイルパス: `/mnt/data/yolo-web/src/tools/char-count/meta.ts`

howItWorks (L23) に以下の記述がある:

```
"入力テキストをリアルタイムで解析し、文字数・バイト数（UTF-8）・単語数・行数を同時にカウントします。
文字数はUnicodeコードポイント単位でカウントし、改行コードも含まれます。
すべての処理はブラウザ上で完結し、入力データはサーバーに送信されません。"
```

**矛盾点**: meta は「Unicodeコードポイント単位でカウント」と明記しているが、実装は `text.length`（UTF-16コードユニット数）を使用しており、絵文字を2と数える。コードポイント単位なら `Array.from(text).length` が正しい。

### byte-counter/meta.ts

ファイルパス: `/mnt/data/yolo-web/src/tools/byte-counter/meta.ts`

howItWorks (L24) の記述:

```
"入力テキストをUTF-8エンコーディングでバイト列に変換し、バイト数をリアルタイムにカウントします。
ASCII英数字は1バイト、日本語（ひらがな・カタカナ・漢字）は3バイト、絵文字は4バイトとして計算します。
文字数・行数も同時にカウントし、すべての処理はブラウザ上で完結します。"
```

faq[2].answer (L37-40) の記述:

```
"はい。サロゲートペアを含む絵文字も正しくカウントされます。UTF-8では絵文字は通常4バイトとして計算されます。"
```

**整合状況**: byte-counter の meta は「文字数・行数も同時にカウント」とのみ言及し、文字数の数え方（コードポイント vs. UTF-16）を明示していない。faqで「サロゲートペアを含む絵文字も正しくカウント」と述べており、実装（Array.from によるコードポイント数）と矛盾なし。

---

## 3. Component.tsx / Tile.tsx の表示項目一覧

### char-count/Component.tsx（6統計）

ファイルパス: `/mnt/data/yolo-web/src/tools/char-count/Component.tsx`

| 表示ラベル         | 参照フィールド               | logic 関数                                         |
| ------------------ | ---------------------------- | -------------------------------------------------- |
| 文字数             | `result.chars` (L33)         | `countChars` → `text.length`                       |
| 文字数（空白除く） | `result.charsNoSpaces` (L37) | `countCharsNoSpaces` → `.replace(/\s/g,"").length` |
| バイト数（UTF-8）  | `result.bytes` (L41)         | `countBytes` → TextEncoder                         |
| 単語数             | `result.words` (L45)         | `countWords` → Intl.Segmenter                      |
| 行数               | `result.lines` (L49)         | `countLines` → split("\n")                         |
| 段落数             | `result.paragraphs` (L53)    | `countParagraphs` → split(/\n\s\*\n/)              |

### char-count/CharCountTile.tsx

ファイルパス: `/mnt/data/yolo-web/src/tools/char-count/CharCountTile.tsx`

| 表示ラベル | 参照                   | logic 関数                   |
| ---------- | ---------------------- | ---------------------------- |
| 文字数     | `charCount` (L28, L92) | `countChars` → `text.length` |

タイルは `countChars` のみを import・表示（L5, L28）。

### byte-counter/Component.tsx（9値 = primary 1 + grid 4 + breakdown 4）

ファイルパス: `/mnt/data/yolo-web/src/tools/byte-counter/Component.tsx`

| 表示ラベル                  | 参照フィールド                   | logic 関数                                |
| --------------------------- | -------------------------------- | ----------------------------------------- |
| バイト数 (UTF-8)（primary） | `result.byteLength` (L29)        | `countBytes` → TextEncoder                |
| 文字数                      | `result.charCount` (L41)         | `countChars` → Array.from                 |
| 文字数（空白除く）          | `result.charCountNoSpaces` (L44) | `countCharsNoSpaces` → Array.from後length |
| 行数                        | `result.lineCount` (L47)         | `countLines` → split("\n")                |
| 単語数                      | `result.wordCount` (L50)         | `countWords` → 空白split                  |
| 1バイト文字 (ASCII)         | `result.singleByteChars` (L61)   | `analyzeByteDistribution`                 |
| 2バイト文字                 | `result.twoBytechars` (L65)      | `analyzeByteDistribution`                 |
| 3バイト文字 (日本語等)      | `result.threeByteChars` (L70)    | `analyzeByteDistribution`                 |
| 4バイト文字 (絵文字等)      | `result.fourByteChars` (L75)     | `analyzeByteDistribution`                 |

### byte-counter/ByteCounterTile.tsx

ファイルパス: `/mnt/data/yolo-web/src/tools/byte-counter/ByteCounterTile.tsx`

| 表示ラベル | 参照                   | logic 関数                 |
| ---------- | ---------------------- | -------------------------- |
| バイト数   | `byteCount` (L28, L87) | `countBytes` → TextEncoder |

タイルは `countBytes` のみを import・表示（L5, L28）。

---

## 4. 既存テストの比較

### char-count/**tests**/logic.test.ts

ファイルパス: `/mnt/data/yolo-web/src/tools/char-count/__tests__/logic.test.ts`

テスト対象関数と内容:

- `countChars`: 空文字(0)、ASCII "hello"(5)、日本語 "こんにちは"(5)、混在 "Hello 世界"(8)
  - **絵文字テスト: なし**。文字列 "Hello 世界" は BMP のみで surrogate pair を含まない。
- `countCharsNoSpaces`: 空文字、スペース除外、タブ/改行除外
  - **絵文字テスト: なし**
- `countBytes`: ASCII 1byte、ひらがな 3byte（正しい）
- `countWords`: 空文字0、空白のみ0、英語2単語、複数スペース2単語
  - **Intl.Segmenter を用いた日本語テスト: なし**
- `countLines`: 空文字0、1行1、複数行、末尾改行
- `countParagraphs`: 空文字0、1段落、複数段落、余分な空行
- `analyzeText`: 空文字すべて0、"Hello World" の6統計確認

**サロゲートペア（絵文字）検証テスト: 存在しない**

### byte-counter/**tests**/logic.test.ts

ファイルパス: `/mnt/data/yolo-web/src/tools/byte-counter/__tests__/logic.test.ts`

テスト対象関数と内容:

- `countBytes`: ASCII、ひらがな3byte、漢字3byte、**emoji "😀" 4byte** (L27)、混在、空文字、改行1byte、2byte文字(ñ)
  - **絵文字テスト: あり（L27）**
- `countChars`: ASCII 5、**emoji "😀" → 1 (not surrogate pair)** (L54-55)、日本語3、空文字0
  - **絵文字テスト: あり（L54-55）**。`countChars("😀")` が 1 であることを明示的に確認。
- `countCharsNoSpaces`: スペース除外、タブ/改行除外
- `countLines`: 1行、複数行、空文字0、末尾改行
- `countWords`: 2単語、空文字0、空白のみ0、複数スペース3単語
- `analyzeByteDistribution`: ASCII=1byte、日本語=3byte、**emoji=4byte** (L129)、混在(Aあ😀)、空文字
  - **絵文字テスト: あり（L129）**
- `analyzeText`: "Hello あいう" の包括テスト（byteLength, charCount, charCountNoSpaces, lineCount, wordCount, singleByteChars, threeByteChars）

**サロゲートペア（絵文字）検証テスト: 3箇所に存在する**（countBytes/countChars/analyzeByteDistribution）

---

## 5. 他ファイルからの import 状況

grep 結果（`/mnt/data/yolo-web/src` 以下、`__tests__` と `logic.ts` 除く）:

```
char-count/CharCountTile.tsx:5:  import { countChars } from "./logic";
char-count/Component.tsx:4:      import { analyzeText } from "./logic";
byte-counter/ByteCounterTile.tsx:5: import { countBytes } from "./logic";
byte-counter/Component.tsx:4:      import { analyzeText } from "./logic";
```

**クロスツール import は存在しない**。char-count の logic が byte-counter から参照されること、またはその逆は一切ない。各ツールの logic は自己完結している。

---

## 6. 統一方針の判断材料

### 6-1. 「文字数」の統一先候補

**候補A: `Array.from(text).length`（コードポイント数）**

- byte-counter の現在の実装
- byte-counter のテストが `countChars("😀") === 1` を保証
- char-count の **meta.howItWorks が「Unicodeコードポイント単位でカウント」と明記**しており、Aに統一することで実装と meta が一致する

**候補B: `text.length`（UTF-16コードユニット数）**

- char-count の現在の実装
- JavaScriptの `String.prototype.length` のデフォルト動作
- 絵文字を2と数えるため、ユーザーの直感（絵文字1文字=1個）とずれる
- char-count の meta と矛盾する（meta は「コードポイント単位」と主張しているのに実装はUTF-16）

**結論の材料**:

| 観点                     | 候補A (Array.from)                                                                      | 候補B (text.length)                                                    |
| ------------------------ | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| (i) meta との整合        | char-count meta と一致する（meta が「コードポイント単位」と明記）                       | char-count meta と矛盾する                                             |
| (ii) ユーザーの直感      | 絵文字1文字=1個（直感的に正しい）                                                       | 絵文字1文字=2個（直感に反する）                                        |
| (iii) 既存表示結果の変化 | char-count の表示が変わる（絵文字含む文字列で chars が減る）。byte-counter は変わらない | byte-counter の表示が変わる（逆方向への変更）。char-count は変わらない |

### 6-2. 「空白なし文字数」の統一先候補

文字数と同じ理由で、Aに統一（`Array.from(text.replace(/\s/g, "")).length`）が meta との整合・ユーザー直感の両面で優位。char-count の表示が変わり、byte-counter は変わらない。

### 6-3. 「単語数」の統一先候補

**候補X: Intl.Segmenter（char-count の現在の実装）**

- 日本語形態素解析に対応（スペースのない日本語文字列でも単語を正しく分割）
- 英語も正しく分割
- ただしブラウザ環境依存（フォールバックあり）

**候補Y: 空白 split（byte-counter の現在の実装）**

- 実装が単純
- 日本語には機能しない（連続した日本語文字列が1単語扱い）
- 英語のみのユースケースには十分

**結論の材料**:

| 観点                     | 候補X (Intl.Segmenter)                                                                                   | 候補Y (空白split)                                 |
| ------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| (i) meta との整合        | char-count meta に「単語数」と記載あり（数え方の明示なし）。byte-counter meta も「単語数も同時表示」のみ | 両meta とも数え方を明示していないため差異なし     |
| (ii) ユーザーの直感      | 日本語ユーザーにとって正しい（「東京は大きい」が複数単語として認識される）                               | 英語のみ正しい。日本語は機能しない                |
| (iii) 既存表示結果の変化 | byte-counter の表示が変わる（日本語入力時に単語数が増える）                                              | char-count の表示が変わる（日本語の単語数が激減） |

### 6-4. 表示されるフィールドと変更の影響まとめ

| 統計           | 不一致の有無                        | 変更が必要なツール（統一先=コードポイント・Segmenter基準） |
| -------------- | ----------------------------------- | ---------------------------------------------------------- |
| 文字数         | **不一致あり**                      | char-count の `countChars` を Array.from に変更            |
| 空白なし文字数 | **不一致あり**                      | char-count の `countCharsNoSpaces` を Array.from に変更    |
| 単語数         | **不一致あり**                      | byte-counter の `countWords` を Intl.Segmenter に変更      |
| 行数           | 一致（変更不要）                    | -                                                          |
| 段落数         | byte-counter に存在しない（非対象） | -                                                          |
| バイト数       | 一致（変更不要）                    | -                                                          |
| バイト分布     | char-count に存在しない（非対象）   | -                                                          |

---

## 付記: 変更の安全性

- `analyzeText` は各ツール内部の Component.tsx のみが使用しており、外部 import はない（調査済み）。
- Tile は countChars（char-count）と countBytes（byte-counter）のみを使用しており、char-count の countChars を修正すると Tile の文字数表示も変わる。これは意図した修正の一部となる。
- byte-counter の countWords を Intl.Segmenter に変更した場合、Component.tsx の wordCount 表示が変わる。ByteCounterTile は countBytes のみ使用のため影響なし。
