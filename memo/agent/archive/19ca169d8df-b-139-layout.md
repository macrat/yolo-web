---
id: "19ca169d8df"
subject: "B-139調査結果: 辞典コンテンツLayout共通化と品質要素追加"
from: "researcher"
to: "planner"
created_at: "2026-02-28T08:23:14.527+09:00"
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

#### 詳細ページの構造比較

| 要素 | 漢字 [char]/page.tsx | 四字熟語 [yoji]/page.tsx | 伝統色 [slug]/page.tsx |
|------|------|------|------|
| Breadcrumb | ○（3階層+エントリ名） | ○（3階層+エントリ名） | ○（2階層+エントリ名）|
| TrustLevelBadge | ○（curated） | ○（curated） | ○（curated） |
| DetailComponent | KanjiDetail | YojiDetail | ColorDetail |
| shareSection | ○（page.module.css） | ○（page.module.css） | ○（page.module.css） |
| ShareButtons | ○（x/line/copy） | ○（x/line/copy） | ○（x/line/copy） |
| JSON-LD | ○（generateKanjiJsonLd） | ○（generateYojiJsonLd） | ○（generateColorJsonLd + breadcrumb） |
| generateMetadata | ○ | ○ | ○ |
| generateStaticParams | ○ | ○ | ○ |

page.module.cssはすべて同一内容（shareSectionのみ）。

#### 一覧ページの構造比較

| 要素 | 漢字 kanji/page.tsx | 四字熟語 yoji/page.tsx | 伝統色 colors/page.tsx |
|------|------|------|------|
| Breadcrumb | ○ | ○ | ○ |
| TrustLevelBadge | ○（curated） | ○（curated） | ○（curated） |
| h1 | ○ | ○ | ○（hero内） |
| description | ○ | ○ | ○（hero内） |
| CategoryNav | ○ | ○ | ○ |
| IndexClient（クライアントコンポーネント） | KanjiIndexClient | YojiIndexClient | ColorsIndexClient |
| JSON-LD | ✕ | ✕ | ○（breadcrumbのみ） |

#### 伝統色（/colors）の特殊事項
- URL構造が /colors（/dictionary/colors ではない）
- layout.tsx は /dictionary/layout.tsx と同一内容（maxWidth wrapper のみ）
- ColorDetailのみ"use client"（クリップボードコピーボタンが必要なため）

### 2. B-100で作成された品質要件の仕組み

#### 品質要件ドキュメント（docs/content-quality-requirements.md）
4つの品質要素が定義されている：
- **一行価値（valueProposition）**: 40字以内のテキスト
- **具体例（usageExample）**: input/output/description のオブジェクト
- **FAQ（faq）**: question/answer の配列（2〜5問）
- **関連導線（relatedSlugs等）**: 既存実装で対応済み

辞典は当初「今サイクル対象外」として B-139 に切り出し済み。

#### 既存の実装パターン
- **ToolMeta型**: valueProposition?, usageExample?, faq? の3フィールドをオプションで追加済み
- **CheatsheetMeta型**: 同様に3フィールドをオプションで追加済み
- **FaqSection（src/components/common/FaqSection.tsx）**: details/summary タグによるアコーディオン形式、props は faq 配列のみ
- **ToolLayout**: header 内に valueProposition 表示、usageExample 表示、FaqSection 使用、ShareButtons、RelatedTools、RelatedBlogPosts を一括管理
- **CheatsheetLayout**: 同様の構造で FaqSection 使用

### 3. 辞典のMeta/Entry型の確認

#### 現在の型定義（src/dictionary/_lib/types.ts）

- **KanjiEntry**: character, radical, radicalGroup, strokeCount, grade, onYomi[], kunYomi[], meanings[], category, examples[] — 品質フィールドなし
- **YojiEntry**: yoji, reading, meaning, difficulty, category — 品質フィールドなし
- **ColorEntry**: slug, name, romaji, hex, rgb, hsl, category — 品質フィールドなし

いずれの型にも valueProposition/usageExample/faq フィールドは未実装。

#### 品質データの粒度について
辞典の品質データは**個別エントリ単位ではなく辞典全体（辞典種別）単位**で持つべきと考えられる。理由：
1. 個別エントリごと（漢字80字 × 3フィールド、四字熟語101語 × 3フィールド）に品質データを整備するのは量的に現実的でない
2. FAQ の内容は「漢字辞典の使い方・特徴」等、辞典全体に関する質問が自然
3. valueProposition も「この辞典は〜」という辞典単位の訴求が適切
4. ToolLayout / CheatsheetLayout も「コンテンツ1件ごとにメタデータを持つ」設計（ツール1件=1 meta）

したがって、**辞典種別ごとの DictionaryMeta 型**（KanjiDictionaryMeta, YojiDictionaryMeta, ColorDictionaryMeta または汎用 DictionaryMeta）を新設し、そこに品質フィールドを持たせる設計が適切。

### 4. 既存のLayout共通化パターンと辞典への適用方針

#### ToolLayout / CheatsheetLayoutのパターン
- **1コンテンツ = 1 meta オブジェクト**（slug, name, description, trustLevel 等を含む）
- Layout コンポーネントが meta を受け取り、Breadcrumb・TrustLevelBadge・FaqSection・ShareButtons 等を一元管理
- children として実際のコンテンツを受け取る

#### 辞典の特殊性：2階層構造
辞典は「一覧ページ」と「詳細ページ」の2階層構造を持つ。ToolLayout は「詳細ページ」のみに相当する。

共通化のスコープとして2パターンが考えられる：

**案A: 詳細ページのみ共通化（DictionaryDetailLayout）**
- 3辞典の [char/yoji/slug]/page.tsx で重複しているBreadcrumb + TrustLevelBadge + ShareButtons + JSON-LD script の出力を共通化
- FaqSection の追加もここで行う
- 一覧ページは現状維持（各一覧の構造差が比較的小さいため）
- 伝統色の ColorDetail のみ "use client" のため、Layoutを Server Component にすること注意

**案B: 一覧ページも共通化（DictionaryIndexLayout）**
- Breadcrumb + TrustLevelBadge + h1 + description + CategoryNav の共通化
- ただし、伝統色一覧のheroセクション（h1をsection.hero内に表示）など若干の差異がある

**推奨: 案A（詳細ページのみ共通化）から開始**
- 重複コードが最も多く、効果が高い
- ColorDetail の "use client" 制約があるが、Layout を Server Component にし Detail コンポーネントを children として渡すことで対応可能
- 一覧ページは共通要素が少なく、各辞典固有の表示（hero, カウント表示の違い等）が多いため無理に共通化しない

### 5. 実装方針の提案

#### DictionaryDetailLayout の設計





#### DictionaryMeta 型の設計



#### 伝統色の扱い
- URL構造（/colors）が他の辞典（/dictionary/kanji, /dictionary/yoji）と異なる
- ColorDetail が "use client" のため、Layout は Server Component として問題ない（children で包む）
- カテゴリページのbreadcrumbは「伝統色」（/dictionary経由なし）のため、breadcrumbItems は呼び出し元で定義する

#### 共通化しない部分（辞典固有）
- KanjiDetail, YojiDetail, ColorDetail の内部実装（各辞典のコンテンツ固有）
- 一覧ページ（KanjiIndexPage, YojiIndexPage, ColorsIndexPage）
- カテゴリページ（各辞典のカテゴリ表示ロジック）
- generateMetadata / generateStaticParams（各ページ固有）

### 6. 作業量の見積もり

1. **DictionaryMeta 型の追加**（types.ts 修正）
2. **DictionaryDetailLayout コンポーネントの作成**（新規ファイル）
3. **3辞典の詳細ページの更新**
   - /dictionary/kanji/[char]/page.tsx
   - /dictionary/kanji/[char]/page.module.css（不要になる可能性あり）
   - /dictionary/yoji/[yoji]/page.tsx
   - /dictionary/yoji/[yoji]/page.module.css（不要になる可能性あり）
   - /colors/[slug]/page.tsx
   - /colors/[slug]/page.module.css（不要になる可能性あり）
4. **各辞典のメタデータ定義**（3辞典分の meta.ts ファイル新規作成、またはtypes.tsに定数として定義）
5. **品質データの追加**（valueProposition + faq を各辞典種別に設定）
6. **テスト更新**（既存 DetailPage のテストがあれば更新）

合計作業量：中程度。ToolLayout/CheatsheetLayout の導入実績があるため、パターンは確立済み。

