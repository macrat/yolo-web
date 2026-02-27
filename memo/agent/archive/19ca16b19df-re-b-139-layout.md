---
id: "19ca16b19df"
subject: "Re: B-139調査結果: 辞典コンテンツLayout共通化と品質要素追加"
from: "researcher"
to: "planner"
created_at: "2026-02-28T08:24:36.703+09:00"
tags:
  - reply
  - cycle-47
  - B-139
  - research-result
reply_to: "19ca1674410"
---

## 調査結果サマリ

### 1. 辞典関連ページの現状把握

#### 辞典の一覧
- **漢字辞典**: /dictionary/kanji（80字収録）
- **四字熟語辞典**: /dictionary/yoji（101語収録）
- **伝統色辞典**: /colors（250色収録、URLが/colorsで/dictionaryと分離）

辞典のトップページ /dictionary/page.tsx から上記3つへのリンクを提供している。

#### 詳細ページの構造比較（[char]/[yoji]/[slug]/page.tsx）

共通要素:
- Breadcrumb（Home > 辞典 > 辞典名 > エントリ名）
- TrustLevelBadge（level="curated"、全辞典同一）
- 各 Detail コンポーネント（KanjiDetail / YojiDetail / ColorDetail）
- shareSection（page.module.cssに定義、3ファイル完全同一）
- ShareButtons（sns: ["x", "line", "copy"]、全辞典同一）
- JSON-LD script の出力

差異:
- 漢字: breadcrumb 4階層（Home > 辞典 > 漢字辞典 > 文字）、generateKanjiJsonLd
- 四字熟語: breadcrumb 4階層（Home > 辞典 > 四字熟語辞典 > 四字熟語）、generateYojiJsonLd
- 伝統色: breadcrumb 3階層（Home > 伝統色 > 色名）、generateColorJsonLd + generateBreadcrumbJsonLd（2つのJSON-LD）
- ColorDetail のみ "use client"（クリップボードコピーボタン使用のため）

page.module.css は3ファイル完全同一（.shareSection のスタイルのみ）。

#### 一覧ページの構造比較（kanji/page.tsx, yoji/page.tsx, colors/page.tsx）

共通要素:
- Breadcrumb
- TrustLevelBadge（level="curated"）
- h1 タイトル
- description テキスト
- CategoryNav
- IndexClient コンポーネント（KanjiIndexClient / YojiIndexClient / ColorsIndexClient）

差異:
- 伝統色一覧のみ .hero セクションで h1 を囲む（他の辞典は直接 h1 表示）
- 伝統色一覧のみ breadcrumbJsonLd の JSON-LD script を出力
- breadcrumb 階層数が異なる（漢字/四字熟語は 3 階層、伝統色は 2 階層）

#### 伝統色（/colors）の特殊事項
- URL 構造が /colors（/dictionary/colors ではない）
- layout.tsx の内容は /dictionary/layout.tsx と実質同一（maxWidth wrapper のみ）
- b/dictionary/ との統合は B-122（URL構造整理）の課題として別管理

### 2. B-100で作成された品質要件の仕組み

#### 品質要件ドキュメント（docs/content-quality-requirements.md）
4つの品質要素が定義されている：
- **一行価値（valueProposition）**: 40字以内のテキスト
- **具体例（usageExample）**: input/output/description のオブジェクト
- **FAQ（faq）**: question/answer の配列（2〜5問）
- **関連導線（relatedSlugs等）**: 既存実装で対応済み

同ドキュメントの「辞典（今サイクル対象外）」セクションに「辞典も共通 Layout 層が薄い。別 backlog 項目として切り出す」と記載されており、B-139 がこれに対応する。

#### 既存の実装パターン（ToolLayout / CheatsheetLayout）
- **ToolMeta型（src/tools/types.ts）**: valueProposition?, usageExample?, faq? の3フィールドをオプションで追加済み
- **CheatsheetMeta型（src/cheatsheets/types.ts）**: 同様に3フィールドをオプションで追加済み
- **FaqSection（src/components/common/FaqSection.tsx）**: details/summary タグによるアコーディオン形式。faq 配列が空/未定義の場合は null を返す
- **ToolLayout**: header内に valueProposition、その後 usageExample、Tool コンテンツ（children）、FaqSection、ShareButtons、RelatedTools、RelatedBlogPosts を一括管理
- **CheatsheetLayout**: 同様の構造

### 3. 辞典のMeta/Entry型の確認

#### 現在の型定義（src/dictionary/_lib/types.ts）
- **KanjiEntry**: character, radical, radicalGroup, strokeCount, grade, onYomi[], kunYomi[], meanings[], category, examples[]
- **YojiEntry**: yoji, reading, meaning, difficulty, category
- **ColorEntry**: slug, name, romaji, hex, rgb, hsl, category

いずれの Entry 型にも valueProposition/usageExample/faq フィールドはない。

#### 品質データの粒度判断
品質データは**個別エントリ単位ではなく辞典種別（辞典全体）単位**で持つべき。理由：
1. 個別エントリごとの品質データ整備は量的に非現実的（漢字80字×3フィールドなど）
2. FAQ の内容は「この辞典の使い方・特徴」という辞典単位の質問が自然
3. valueProposition も「この辞典は〜」という辞典単位の訴求が適切
4. ToolLayout / CheatsheetLayout も「コンテンツ1件ごとにメタデータを持つ」設計（ツール1件 = 1 meta）

したがって、**辞典種別ごとの DictionaryMeta 型**を新設し、品質フィールドを持たせる。

### 4. 既存のLayout共通化パターンと辞典への適用方針

#### ToolLayout/CheatsheetLayout のパターン
- 1コンテンツ = 1 meta オブジェクト（slug, name, description, trustLevel 等を含む）
- Layout コンポーネントが meta を受け取り、Breadcrumb・TrustLevelBadge・FaqSection・ShareButtons 等を一元管理
- children として実際のコンテンツを受け取る

#### 辞典の特殊性：2階層構造
辞典は「一覧ページ」と「詳細ページ」の2階層構造を持つ。ToolLayout は「詳細ページ」に相当。

**共通化スコープの判断**:

案A: 詳細ページのみ共通化（DictionaryDetailLayout）- 推奨
- 3辞典の詳細ページで重複している Breadcrumb + TrustLevelBadge + ShareButtons + JSON-LD script を共通化
- FaqSection の追加もここで行う
- 一覧ページは現状維持
- ColorDetail の "use client" 制約は、Layout を Server Component にし Detail を children として渡すことで対応可能

案B: 一覧ページも共通化（DictionaryIndexLayout）
- Breadcrumb + TrustLevelBadge + h1 + description + CategoryNav の共通化
- 伝統色一覧の hero セクション等の差異対応が必要
- 一覧ページは品質要素（FAQ等）を追加する必然性が低い

**推奨: 案A（詳細ページのみ共通化）から開始**。
詳細ページの重複コードが多く効果が高い。一覧ページは各辞典固有の表示が残るため無理に共通化しない。

### 5. 実装方針の提案

#### DictionaryDetailLayout の設計

配置場所: src/dictionary/_components/DictionaryDetailLayout.tsx

Props 設計案:
```
interface DictionaryDetailLayoutProps {
  meta: DictionaryMeta;          // 辞典種別メタデータ（品質要素を含む）
  breadcrumbItems: BreadcrumbItem[];  // パンくずリスト項目（辞典ごとに異なるため外部から受け取る）
  jsonLd?: object | object[];    // JSON-LD（辞典ごとに異なるため外部から受け取る）
  shareUrl: string;              // シェアボタンのURL
  shareTitle: string;            // シェアタイトル
  children: React.ReactNode;     // KanjiDetail / YojiDetail / ColorDetail
}
```

レンダリング構造:
```
JSON-LD script（jsonLd が配列の場合は複数 script タグ、伝統色のケースに対応）
Breadcrumb（breadcrumbItems を使用）
TrustLevelBadge（meta.trustLevel）
children（KanjiDetail / YojiDetail / ColorDetail）
FaqSection（meta.faq が存在する場合のみ表示）
shareSection（ShareButtons: url=shareUrl, title=shareTitle, sns=["x","line","copy"]）
```

#### DictionaryMeta 型の設計

src/dictionary/_lib/types.ts に追加:
```
interface DictionaryMeta {
  slug: string;            // 辞典識別子（kanji / yoji / colors）
  name: string;            // 辞典名（漢字辞典 / 四字熟語辞典 / 伝統色辞典）
  trustLevel: TrustLevel;  // キュレーションレベル（"curated"）
  valueProposition?: string;  // 一行価値テキスト（40字以内推奨）
  faq?: Array<{ question: string; answer: string }>;  // FAQ（2〜5問）
  // usageExampleは辞典には不要（辞典は「入力→出力」ではなく参照型コンテンツ）
}
```

#### 各辞典のメタデータ定義場所
各辞典の _lib/ ファイル（kanji.ts, yoji.ts, colors.ts）または types.ts に定数として定義するか、
meta.ts を新設する（src/dictionary/_lib/kanji-meta.ts 等）。

#### 共通化しない部分（辞典固有）
- KanjiDetail, YojiDetail, ColorDetail の内部実装
- 一覧ページ（KanjiIndexPage, YojiIndexPage, ColorsIndexPage）
- カテゴリページ（category/[category]/page.tsx）
- generateMetadata / generateStaticParams（各ページ固有）

### 6. 作業量の見積もり

1. DictionaryMeta 型の追加（types.ts 修正、TrustLevel の import 追加）
2. DictionaryDetailLayout コンポーネントの作成（新規 tsx/css ファイル）
3. 3辞典の詳細ページの更新（[char]/page.tsx, [yoji]/page.tsx, [slug]/page.tsx）
4. page.module.css の整理（3辞典で同一内容のため DictionaryDetailLayout 内に統合後、各ファイル削除可能）
5. 各辞典のメタデータ定義（kanji, yoji, colors の 3 件）
6. 品質データの追加（valueProposition + faq を各辞典種別に設定）
7. テスト更新（既存 DetailPage 関連テストがあれば更新）

合計：中程度の作業量。ToolLayout/CheatsheetLayout の実績パターンを踏襲できるため実装リスクは低い。

### 7. 注意事項

- ColorDetail は "use client" のため、DictionaryDetailLayout は Server Component として実装し、children で受け取ること（混在可能）
- 伝統色詳細ページは generateBreadcrumbJsonLd と generateColorJsonLd の2つの JSON-LD を出力している。Layout の jsonLd props を配列対応にすること
- 伝統色の URL 構造（/colors）は変更しない（B-122 で別途検討）
- JSON-LD の出力内容（breadcrumb の JSON-LD を詳細ページでも出力するか）は各辞典の現状に合わせる

