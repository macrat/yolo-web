# 診断コンテンツ・結果ページのテキスト量計測

**調査日**: 2026-04-07  
**目的**: 「テキスト量が少なく指名検索しか機能しない」という仮説を検証するための基礎データ収集

---

## 調査概要

`/play/` 配下の全診断コンテンツのうち、タイプ別結果ページ（`/play/[slug]/result/[resultId]`）を持つものを対象に、各結果ページのテキスト量（文字数）とコンテンツ構成を計測した。

**データソース**: `src/play/quiz/data/*.ts` の各クイズデータファイル  
**計測対象**: 結果ページに表示される動的テキスト（タイトル + キャッチコピー + 説明文 + detailedContentの全フィールド）  
**除外**: 固定UIラベル（見出し文字列）、パンくずリスト、シェアボタン、CTAボタンテキスト

---

## インデックス状況の仕組み

結果ページのSEOインデックス状況は `detailedContent` フィールドの有無によって決まる。

```
detailedContent あり → robots: index: true（検索エンジンにインデックス）
detailedContent なし → robots: index: false（noindex）
```

`src/app/play/[slug]/result/[resultId]/page.tsx` のコード:

```typescript
const hasDetailedContent = Boolean(result.detailedContent);
const shouldIndex = hasDetailedContent && !compatFriendTypeId;
```

---

## インデックス対象の診断結果ページ（detailedContent あり）

### 計測結果

| 診断名                         | タイプ数 | 平均文字数 | 最小 | 最大 | variant                  |
| ------------------------------ | -------- | ---------- | ---- | ---- | ------------------------ |
| 日本にしかいない動物で性格診断 | 12       | 703        | 660  | 763  | animal-personality       |
| 守護キャラ診断                 | 6        | 825        | 758  | 903  | character-fortune        |
| 音楽性格診断                   | 8        | 616        | 587  | 655  | music-personality        |
| あなたに似たキャラ診断         | 24       | 629        | 591  | 662  | character-personality    |
| 逆張り占い                     | 8        | 680        | 667  | 694  | contrarian-fortune       |
| 意外な相性診断                 | 7〜8     | 531        | 517  | 541  | unexpected-compatibility |
| 解決不能な悩み診断             | 7        | 462        | 442  | 486  | impossible-advice        |
| 四字熟語性格診断               | 8        | 466        | 445  | 477  | yoji-personality         |
| 伝統色性格診断                 | 8        | 439        | 417  | 465  | traditional-color        |

**インデックス対象の結果ページ合計: 89ページ**

### タイプ別の代表サンプル

#### animal-personality（ニホンザル）

- タイトル: 19字「ニホンザル -- 温泉を発明した革命児」
- キャッチコピー: 21字
- 説明文: 301字（動物の生態エピソード込み）
- detailedContent: strengths(104字) + weaknesses(68字) + behaviors(117字) + todayAction(63字) = 352字
- **合計: 693字**

#### character-fortune（commander）

- タイトル: 15字「締切3分前に本気出す炎の司令塔」
- 説明文: 187字（キャラ口調の一人称語りかけ）
- detailedContent: characterIntro(45字) + behaviors(191字) + characterMessage(235字) + thirdPartyNote(132字) + etc = 約638字
- **合計: 840字**

#### contrarian-fortune（逆オプティミスト）

- タイトル: 8字
- キャッチコピー: 19字
- 説明文: 127字
- detailedContent: coreSentence(45字) + behaviors(170字) + persona(163字) + thirdPartyNote(135字) = 513字
- **合計: 667字**

#### traditional-color（藍色）

- タイトル: 8字
- キャッチコピー: 17字
- 説明文: 73字（短い）
- detailedContent: colorMeaning(104字) + season(1字) + scenery(22字) + behaviors(182字) + colorAdvice(49字) = 358字
- **合計: 456字**（最も少ない部類）

#### yoji-personality（初志貫徹）

- タイトル: 4字
- キャッチコピー: 19字
- 説明文: 73字
- detailedContent: kanjiBreakdown(86字) + origin(96字) + motto(38字) + behaviors(136字) = 356字
- **合計: 452字**

---

## noindex の診断結果ページ（detailedContent なし）

| 診断名                 | タイプ数 | 平均文字数 | 備考                        |
| ---------------------- | -------- | ---------- | --------------------------- |
| 科学的思考タイプ診断   | 10       | 329        | noindex                     |
| 日本文化どっぷり度診断 | 7        | 365        | noindex                     |
| 言葉センス診断         | 8        | 326        | noindex                     |
| 漢字力診断             | 5        | 60         | noindex (スコアベース4段階) |
| ことわざ力診断         | 5        | 66         | noindex (スコアベース)      |
| 四字熟語力診断         | 5        | 70         | noindex (スコアベース)      |

---

## ページ上の追加テキスト要素

各結果ページには、上記の本体コンテンツに加えて以下が表示される:

| 要素                               | 文字数                           | 性質                   |
| ---------------------------------- | -------------------------------- | ---------------------- |
| クイズタイトル + shortDescription  | 30〜60字                         | 全タイプ共通           |
| 「他の○○も見てみよう」全タイプ一覧 | 32〜612字                        | クイズ内共通           |
| RelatedQuizzes（関連コンテンツ）   | 〜200字                          | カテゴリ共通           |
| CTAボタン・問数表示                | 〜30字                           | 固定テキスト           |
| FAQ                                | **なし**（クイズ起動ページのみ） | 結果ページには表示なし |

**注**: FAQは `/play/[slug]` のクイズ起動ページ（`QuizPlayPageLayout`）のみに表示される。結果ページ（`/play/[slug]/result/[resultId]`）には表示されない。

---

## 仮説の検証

### 「テキスト量が少なく指名検索しか機能しない」について

**計測結果から得られた事実**:

1. **最も少ない診断（traditional-color）**: 平均439字 ≒ 新聞記事1.5〜2段落相当
2. **最も多い診断（character-fortune）**: 平均825字 ≒ 新聞記事3段落相当
3. **全体の中央値**: 約600字

**比較基準**:

- 薄いコンテンツ（Thin Content）の一般的な閾値: 300字以下
- 日本語ニュース記事1段落: 150〜300字
- 短いブログ記事: 800〜1,500字

**評価**:

- 300字のThin Content閾値は全診断で超えている
- ただし、800〜1,500字の「短いブログ記事」相当には達していない診断が多い
- 特に traditional-color（439字）、yoji-personality（466字）、impossible-advice（462字）は相対的にテキストが少ない
- character-fortune（825字）と animal-personality（703字）は比較的充実している

### コンテンツ構成の質的評価

テキスト量だけでなく構成も重要。各variantのコンテンツ構成を比較すると:

**充実度が高い診断**:

- `character-fortune`: キャラ口調の説明文 + あるある + 本音メッセージ（235字）+ 第三者視点 → 物語性あり
- `animal-personality`: 詳細な生態エピソード付き説明文(300字超) + 強み/弱み/あるある/今日のアクション → 実用的情報あり
- `contrarian-fortune`: ユーモアトーン + 人物像散文(150字超) + 第三者視点 → 共感度高い

**改善余地がある診断**:

- `traditional-color`: 色の意味(104字)は良いが、説明文73字・colorAdvice49字が短い
- `yoji-personality`: 四字熟語の解説(kanjiBreakdown+origin)はユニークだが、説明文73字・motto38字が短い
- `impossible-advice`: 説明文は161〜217字と適度だが、practicalTip(35〜42字)が非常に短い

---

## 結論

**仮説「テキスト量が少なく指名検索しか機能しない」の妥当性**: **部分的に正しい**

- 全診断でThin Contentの閾値（300字）は超えているが、一般的なコンテンツ記事（800字以上）と比べると短い診断が多い
- 特に traditional-color、yoji-personality、impossible-advice は本文テキストが400〜470字程度と少ない
- 説明文（description）が短い診断（traditional-color: 63字、yoji-personality: 75字）では、テキストのほとんどが detailedContent の箇条書きに集中している
- 検索意図に対する情報の深さ・独自性の観点では、動物の生態エピソードや四字熟語の語源解説など一部には独自コンテンツがある
- しかし「○○診断 結果」「○○タイプ 特徴」といった非指名検索で上位表示されるには、1ページ600〜900字程度のテキストでは競合コンテンツに対して競争力が低い可能性がある
