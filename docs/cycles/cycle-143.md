---
id: 143
description: "結果ページコンポーネントのアーキテクチャ改善（variant別Server Component分離）"
started_at: "2026-04-01T12:14:23+0900"
completed_at: "2026-04-01T13:38:15+0900"
---

# サイクル-143

結果ページ（page.tsx 601行）の variant 別レンダリングロジックを専用 Server Component に分離し、拡張性・可読性・保守性を改善する。B-251〜B-257（6件の detailedContent 構造最適化）の着手前に対処することで、移行コストを最小化する。

## 実施する作業

- [x] 現在の page.tsx と page.module.css の構造を調査し、分離計画を策定する
- [x] variant 別の専用 Server Component と CSS Module を作成する（StandardResultLayout, ContrarianFortuneLayout, CharacterFortuneLayout）
- [x] page.tsx を dispatch + メタデータ生成 + 共通構造のみに slim 化する
- [x] 既存のテストが通ることを確認し、必要に応じてテストを追加・更新する
- [x] ビルド・lint・formatチェックを通す
- [x] レビュー実施

## 作業計画

<plannerが立案した作業の詳細な実施計画をここに記載する。何を何のためにどのようにやるのかを具体的に書き、作業を進めながら方針が変わった場合は随時アップデートすること。>

### 目的

- **誰のために:** 将来の各コンテンツ固有の理想的 detailedContent レイアウト（B-251〜B-257）を高品質に実装するための開発基盤整備。最終的にはメインターゲット「手軽で面白い占い・診断を楽しみたい人」に、より充実した結果ページを提供するための前提条件。
- **提供する価値:** page.tsx（601行）の variant 条件分岐9箇所を dispatch 1箇所に削減し、新 variant 追加時の影響範囲を「新ファイル追加 + dispatch 行追加のみ」に限定する。B-257 完了時に推定 1,500行に膨れ上がる問題と、否定条件列挙パターンによる修正漏れリスクを未然に防ぐ。

### 作業内容

全8ステップで実施する。各ステップは独立してビルド・テストが通る状態を維持する。

#### ステップ1: DescriptionExpander の CSS 分離

**対象ファイル:**

- `src/app/play/[slug]/result/[resultId]/DescriptionExpander.tsx`（L4: `import styles from "./page.module.css"`）
- `src/app/play/[slug]/result/[resultId]/page.module.css`（L38〜L68: `.descriptionWrapper`, `.description`, `.descriptionClamped`, `.descriptionToggle`）

**作業内容:**

1. `src/app/play/[slug]/result/[resultId]/DescriptionExpander.module.css` を新規作成し、page.module.css の L38〜L68 の4クラス（`.descriptionWrapper`, `.description`, `.descriptionClamped`, `.descriptionToggle`）をコピーする
2. `DescriptionExpander.tsx` の import を `./page.module.css` から `./DescriptionExpander.module.css` に変更する
3. `page.module.css` から上記4クラスを削除する（page.tsx 側ではこれらのクラスを直接使用していないため安全に削除可能）

**理由:** DescriptionExpander は Client Component であり、page.module.css への依存は関心の分離に反する。後続の CSS 分割の前にこの依存を先に解消しておくことで、page.module.css の分割が単純になる。

**注意点:** `__tests__/DescriptionExpander.test.tsx` が存在するため、CSS Module の mock が必要かどうか確認すること。

#### ステップ2: 共通 props の型定義（interface）を作成

**対象ファイル:**

- `src/app/play/[slug]/result/[resultId]/_layouts/types.ts`（新規作成）

**`_layouts/` の命名理由:** 研究レポートでは `_variants/` が使われていたが、分離するコンポーネントの責務は「レイアウト（表示構造の決定）」であるため `_layouts/` の方が役割を正確に表現する。また Next.js の `_` プレフィックス規約（ルーティング対象外を示す）にも従っている。

**作業内容:**

1. `_layouts/` ディレクトリを作成する
2. `_layouts/types.ts` を作成し、以下の interface を定義する:
   - `ResultLayoutCommonProps` — 全 Layout 共通の props（`slug`, `resultId`, `quizMeta: QuizMeta`, `result: QuizResult`, `shareText`, `shareUrl`, `ctaText`）
   - `StandardResultLayoutProps extends ResultLayoutCommonProps` — `detailedContent: QuizResultDetailedContent | undefined`, `isDescriptionLong: boolean`, `traitsHeading: string`, `behaviorsHeading: string`, `adviceHeading: string` を追加
   - `ContrarianFortuneLayoutProps extends ResultLayoutCommonProps` — `detailedContent: ContrarianFortuneDetailedContent`, `allResults: QuizResult[]` を追加
   - `CharacterFortuneLayoutProps extends ResultLayoutCommonProps` — `detailedContent: CharacterFortuneDetailedContent`, `allResults: QuizResult[]` を追加

**理由:** 型定義を先に作成しておくことで、各 Layout コンポーネントの実装時に型安全性を確保できる。コーディングルール「型安全の徹底」に従う。

#### ステップ3: StandardResultLayout の作成

**対象ファイル:**

- `src/app/play/[slug]/result/[resultId]/_layouts/StandardResultLayout.tsx`（新規作成）
- `src/app/play/[slug]/result/[resultId]/_layouts/StandardResultLayout.module.css`（新規作成）

**作業内容:**

1. page.tsx の以下の範囲を StandardResultLayout に移動する:
   - L259〜L285: description（DescriptionExpander）+ CTA1
   - L287〜L340: 標準 detailedContent（traits/behaviors/advice + CTA2）
2. page.module.css から StandardResultLayout が使用する Standard 専用クラスを StandardResultLayout.module.css にコピーする:
   - `.traitsList`, `.traitsItem`, `.adviceCard`, `.cta2Section`, `.cta2Link`（Standard 専用 — page.module.css からは後のステップ7で削除）
3. 共通クラス（全 variant で使用するため page.module.css に残し、`pageStyles` で参照する）:
   - `.trySection`, `.tryButton`, `.tryCost`（CTA1 用 — Standard, Contrarian, Character すべてで使用）
   - `.detailedSection`, `.detailedSectionHeading`（Standard, Contrarian, Character すべてで使用）
   - `.behaviorsList`, `.behaviorsItem`（Standard, Contrarian, Character すべてで使用）
4. import 一覧:
   - `Link from "next/link"`（CTA1: L274, CTA2: L335 のリンクに使用）
   - `DescriptionExpander from "../DescriptionExpander"`（description 表示に使用）
   - `styles from "./StandardResultLayout.module.css"`（Standard 専用クラス `.traitsList`, `.traitsItem`, `.adviceCard`, `.cta2Section`, `.cta2Link` 用）
   - `pageStyles from "../page.module.css"`（共通クラス `.detailedSection`, `.detailedSectionHeading`, `.behaviorsList`, `.behaviorsItem`, `.trySection`, `.tryButton`, `.tryCost` の参照用）
   - 注: `ShareButtons` は standard variant 内では使用しないため import 不要

**props 名の変更に関する注意:** JSX 内の `quiz.meta.accentColor`, `quiz.meta.title`, `quiz.meta.questionCount` 等の参照を、props 経由の `quizMeta.accentColor`, `quizMeta.title`, `quizMeta.questionCount` に変更すること。同様に `quiz.results` は `allResults` props に変更する（ContrarianFortuneLayout, CharacterFortuneLayout の場合）。

**CSS の扱いについて:**

- `.detailedSection`, `.detailedSectionHeading`, `.behaviorsList`, `.behaviorsItem`, `.trySection`, `.tryButton`, `.tryCost` は全3 variant（Standard, Contrarian, Character）で使用されている共通クラスである。これらは page.module.css に残し、各 Layout は `pageStyles from "../page.module.css"` として参照する
- variant 固有クラスのみ各 Layout の CSS Module に定義する（例: Standard は `.traitsList`, `.traitsItem`, `.adviceCard`, `.cta2Section`, `.cta2Link`）

#### ステップ4: ContrarianFortuneLayout の作成

**対象ファイル:**

- `src/app/play/[slug]/result/[resultId]/_layouts/ContrarianFortuneLayout.tsx`（新規作成）
- `src/app/play/[slug]/result/[resultId]/_layouts/ContrarianFortuneLayout.module.css`（新規作成）

**作業内容:**

1. page.tsx の以下の範囲を ContrarianFortuneLayout に移動する:
   - L253〜L257: catchphrase（h1直下のサブタイトル）
   - L342〜L448: contrarian-fortune 専用レイアウト全体
2. page.module.css の contrarian-fortune 専用スタイル（コメントヘッダー L216〜L219、クラス定義 L221`.catchphrase` 〜 L358`.allTypesCta`）を ContrarianFortuneLayout.module.css に移動する:
   - `.catchphrase`, `.coreSentence`, `.midShareSection`, `.persona`, `.thirdPartySection`, `.thirdPartyHeading`, `.thirdPartyNote`, `.humorMetricsTable`, `.allTypesSection`, `.allTypesList`, `.allTypesItem`, `.allTypesItemCurrent`, `.allTypesCta`
3. 共通クラス（`.detailedSection`, `.detailedSectionHeading`, `.behaviorsList`, `.behaviorsItem`, `.trySection`, `.tryButton`, `.tryCost`）は `pageStyles from "../page.module.css"` で参照する
4. import: `Link from "next/link"`, `ShareButtons from "@/play/quiz/_components/ShareButtons"`

**注意点:**

- `.thirdPartySection`, `.thirdPartyHeading`, `.thirdPartyNote` は character-fortune でも使用される。これらのクラスは ContrarianFortuneLayout.module.css と CharacterFortuneLayout.module.css の両方に定義する（各 Layout の CSS が自己完結するため、将来の variant 固有カスタマイズが容易になる）
- `.midShareSection` も同様に両方で使用されるため、両方に定義する
- `.allTypesSection`, `.allTypesList`, `.allTypesItem`, `.allTypesItemCurrent`, `.allTypesCta` も両方で使用されるため、両方に定義する

#### ステップ5: CharacterFortuneLayout の作成

**対象ファイル:**

- `src/app/play/[slug]/result/[resultId]/_layouts/CharacterFortuneLayout.tsx`（新規作成）
- `src/app/play/[slug]/result/[resultId]/_layouts/CharacterFortuneLayout.module.css`（新規作成）

**作業内容:**

1. page.tsx の L450〜L574（character-fortune 専用レイアウト全体）を CharacterFortuneLayout に移動する
2. page.module.css の character-fortune 専用スタイル（コメントヘッダー L360〜L363、クラス定義 L365`.characterIntro` 〜 L399`.compatibilityPrompt`）を CharacterFortuneLayout.module.css に移動する:
   - `.characterIntro`, `.characterMessage`, `.compatibilitySection`, `.compatibilityPrompt`
3. contrarian-fortune と共有するクラス（`.thirdPartySection`, `.thirdPartyHeading`, `.thirdPartyNote`, `.midShareSection`, `.allTypesSection`, `.allTypesList`, `.allTypesItem`, `.allTypesItemCurrent`, `.allTypesCta`）を CharacterFortuneLayout.module.css にも定義する
4. 共通クラスは `pageStyles from "../page.module.css"` で参照する
5. import: `Link from "next/link"`, `ShareButtons from "@/play/quiz/_components/ShareButtons"`

#### ステップ6: page.tsx の書き換え（dispatch 化）

**対象ファイル:**

- `src/app/play/[slug]/result/[resultId]/page.tsx`

**作業内容:**

1. 3つの Layout コンポーネントを import する
2. L253〜L574 の variant 固有 JSX を削除し、variant dispatch ロジックに置き換える
3. dispatch は以下の形式にする（exhaustive check 付き）:
   ```
   共通ヘッダー（quizName, quizContext, icon, title）
   ↓
   variant dispatch: switch (detailedContent?.variant) で Layout を選択
     - undefined → <StandardResultLayout ... />
     - "contrarian-fortune" → <ContrarianFortuneLayout ... />
     - "character-fortune" → <CharacterFortuneLayout ... />
     - default → never 型で exhaustive check（新 variant 追加漏れをコンパイル時に検出）
   ↓
   共通フッター（shareSection, CompatibilityDisplay, RelatedQuizzes, RecommendedContent）
   ```
4. `detailedContent` が undefined の場合も StandardResultLayout を使用する。StandardResultLayout 内での分岐ロジックは以下の通り:
   - `detailedContent` が `undefined` の場合: DescriptionExpander（description）+ CTA1 のみをレンダリング
   - `detailedContent` が `QuizResultDetailedContent`（variant プロパティなし）の場合: DescriptionExpander（description）+ CTA1 + traits/behaviors/advice セクション + CTA2 をレンダリング

**削減見込み:** 601行 → 約260〜280行（55%削減）

**注意点:**

- `generateStaticParams`, `generateMetadata`, `countCharWidth` はそのまま page.tsx に残す
- データ取得ロジック（L152〜L206）もそのまま page.tsx に残す
- `resultPageLabels` の見出し取得（L228〜L233）は StandardResultLayout に props として渡すため page.tsx に残す
- `slug === "character-personality"` の分岐（L178, L182）は相性データ取得に関するもので variant 分離とは無関係なため page.tsx に残す

#### ステップ7: page.module.css のクリーンアップ

**対象ファイル:**

- `src/app/play/[slug]/result/[resultId]/page.module.css`

**作業内容:**

1. variant 固有スタイルを削除する（ステップ3〜5で各 Layout の CSS Module に移動済み）:
   - contrarian-fortune 専用（L218〜L359）のうち、各 Layout CSS に移動済みのもの
   - character-fortune 専用（L360〜L399）のうち、各 Layout CSS に移動済みのもの
   - Standard 専用（`.traitsList`, `.traitsItem`, `.adviceCard`, `.cta2Section`, `.cta2Link`）のうち、StandardResultLayout CSS に移動済みのもの
2. DescriptionExpander 用4クラスの削除を確認する（ステップ1で済み）
3. page.module.css に残るクラス（共通スタイル）:
   - `.wrapper`, `.card`, `.icon`, `.title`, `.quizName`, `.quizContext` — ページ構造
   - `.shareSection` — 共通フッター
   - `.detailedSection`, `.detailedSectionHeading` — 全 variant 共通
   - `.behaviorsList`, `.behaviorsItem` — 全 variant 共通
   - `.trySection`, `.tryButton`, `.tryCost` — 全 variant 共通の CTA スタイル

**見込み:** 399行 → 約120〜130行（共通スタイルのみ）

#### ステップ8: テストの更新と追加

**対象ファイル:**

- `src/app/play/[slug]/result/[resultId]/__tests__/page.test.ts`（静的解析テスト — 更新）
- `src/app/play/[slug]/result/[resultId]/__tests__/page.test.tsx`（統合テスト — 確認・更新）

**作業内容:**

**(a) page.test.ts（静的解析テスト）の更新:**

分離後に page.tsx から消えるコードに依存するテストを修正する。

**削除するテスト（page.tsx から該当コードが消えるため確実に失敗する）:**

- L116-121: `describe("CTA2（detailedContent読了者向け）")` — `cta2Section` / `cta2Link` への参照が StandardResultLayout に移動するため、page.tsx のソースに `"cta2"` が含まれなくなる
- L123-127: `describe("DescriptionExpanderコンポーネントの利用")` — `DescriptionExpander` の import が StandardResultLayout に移動するため、page.tsx のソースに `"DescriptionExpander"` が含まれなくなる

**残すテスト（page.tsx に該当コードが残るためそのまま pass する）:**

- L14-18: RelatedQuizzes の import 検証
- L20-24: RelatedQuizzes の props 検証
- L26-33: RelatedQuizzes と RecommendedContent の順序検証
- L35-41: title フォーマット検証
- L43-45: detailedContent の存在検証（dispatch ロジックで `detailedContent` を参照するため残る）
- L47-76: noindex 条件分岐の全パターン（generateMetadata に残る）
- L78-82: シェアテキストの検証
- L84-88: コンテキスト表示（shortDescription）の検証
- L90-113: detailedContent 見出しのデータ駆動化（resultPageLabels は page.tsx に残る）
- L129-143: DESCRIPTION_LONG_THRESHOLD の閾値検証（page.tsx に残る）
- L145-165: title フォールバックの SITE_NAME 考慮（generateMetadata に残る）

**追加するテスト（dispatch 構造の検証）:**

- page.tsx が `StandardResultLayout` を import していることの検証
- page.tsx が `ContrarianFortuneLayout` を import していることの検証
- page.tsx が `CharacterFortuneLayout` を import していることの検証

**(b) page.test.tsx（統合テスト）の確認:**

page.test.tsx は PlayQuizResultPage をレンダリングしてテストしているため、Layout コンポーネントは page.tsx 経由で間接的にレンダリングされる。そのため大半のテストはそのまま pass するはず。ただし:

- Layout コンポーネントが page.module.css 以外の CSS Module を import する場合、CSS Module の mock が必要になる可能性がある（Vitest の CSS Module 処理設定を確認）
- 新しい import パスに対する mock の追加が必要になる可能性がある

**(c) 各 Layout コンポーネントのユニットテスト追加（任意）:**

時間に余裕があれば、各 Layout コンポーネントの個別テストを追加する。ただし page.test.tsx が統合テストとして既に各 variant のレンダリングを検証しているため、必須ではない。B-251 以降で新 variant を追加する際にテストパターンとして活用できるよう、1つの Layout（例: ContrarianFortuneLayout）のテストをサンプルとして作成しておくことが望ましい。

#### 最終確認

すべてのステップ完了後に以下を実行して確認する:

- `npm run lint` — lint チェック
- `npm run format:check` — フォーマットチェック
- `npm run test` — 全テスト pass
- `npm run build` — ビルド成功
- Playwright でのビジュアル確認（結果ページの表示が分離前と同一であることを確認）

### 検討した他の選択肢と判断理由

1. **選択肢B: slug ごとに完全に別のルート（page.tsx）を作る**
   - `/play/contrarian-fortune/result/[resultId]/page.tsx` のように slug ごとにルートを分離する案
   - 却下理由: 現在の統一 URL パターン `/play/[slug]/result/[resultId]` を破壊する。SEO 上の既存 URL からのリダイレクト設定が必要になり、管理コストが高い。`generateStaticParams` が分散し、全結果ページ一覧のメンテナンスが困難になる

2. **選択肢: 現状維持**
   - 却下理由: B-257 まで完了すると page.tsx が推定 1,500行に肥大化する。否定条件列挙パターン（`variant !== "X" && variant !== "Y" && ...`）が9 variant 分に増殖し、修正漏れバグのリスクが非常に高い。現在の 2 custom variant の段階が移行コスト最小のタイミング

3. **CSS の共通クラスを page.module.css に残す vs 各 Layout に重複定義する判断:**
   - 全 variant で使用される共通クラス（`.detailedSection`, `.behaviorsList` 等）は page.module.css に残し、各 Layout から `pageStyles` として import する方針を選択
   - contrarian-fortune と character-fortune の両方のみで使われるクラス（`.thirdPartySection`, `.midShareSection`, `.allTypesSection` 等）は各 Layout の CSS に重複定義する方針を選択。理由: これらのクラスは将来 variant 固有にカスタマイズされる可能性が高く、共通化すると一方の変更が他方に影響するリスクがある

4. **DescriptionExpander の CSS 分離を先行実施 vs Layout 分離と同時実施:**
   - 先行実施を選択。理由: DescriptionExpander は page.module.css への不適切な依存であり、Layout 分離とは独立した改善。先に解消しておくことで CSS 分割ステップが単純化される

### 計画にあたって参考にした情報

- `docs/research/2026-03-31-result-page-component-architecture-analysis.md` — 3つのアーキテクチャ選択肢の比較、将来の拡張計画（B-250〜B-257）の規模推定、バンドルサイズ影響分析
- `tmp/research/2026-04-01-result-page-variant-separation-implementation-research.md` — page.tsx の完全な構造分析、props 一覧、CSS クラスの使用状況、テスト影響分析、推奨実装手順（tmp/ は git 管理外のため現在は失われている）
- `src/app/play/[slug]/result/[resultId]/page.tsx`（601行）— 実際のソースコードで条件分岐の位置と各 variant の JSX 範囲を確認
- `src/app/play/[slug]/result/[resultId]/page.module.css`（399行）— CSS クラスの使用状況と variant 間の共有関係を確認
- `src/app/play/[slug]/result/[resultId]/DescriptionExpander.tsx` — page.module.css への依存（4クラス参照）を確認
- `src/app/play/[slug]/result/[resultId]/__tests__/page.test.ts`（167行）— 静的解析テストの内容を確認し、分離後に失敗するテストを特定
- `src/app/play/[slug]/result/[resultId]/__tests__/page.test.tsx`（496行）— 統合テストの mock 構成と variant テストケースを確認
- `src/play/quiz/types.ts` — DetailedContent の discriminated union 構造、QuizMeta / QuizResult の型定義を確認

## レビュー結果

### 計画レビュー（第1回）

**レビュー担当:** reviewer
**レビュー日時:** 2026-04-01
**結果:** 改善指示

#### 総合評価

計画全体の方向性は妥当であり、調査結果・ソースコードとの整合性も概ね正確である。しかし、以下の指摘事項を修正する必要がある。

#### 指摘事項

**[指摘1] ステップ1: DescriptionExpander CSS の行範囲は正確だが、import行番号の記述が不正確**

計画には「L4: `import styles from "./page.module.css"`」と記載されているが、実際の DescriptionExpander.tsx では L4 は `import styles from "./page.module.css";` で正しい。この点は問題ない。

ただし、page.module.css の L38-L68 という範囲について、実際のファイルでは `.descriptionWrapper` が L38 で始まり `.descriptionToggle` の最後のプロパティが L68 で終わるが、クラス定義は4つで合計31行である。計画の記述は正確。指摘取り消し。

**[指摘1 改め] ステップ2: `_layouts/` ディレクトリの命名について**

研究レポート（`docs/research/2026-03-31-...`）では `_variants/` が使われ、計画では `_layouts/` が使われている。命名の不一致自体は問題ないが、`_layouts/` を選んだ理由が計画に記載されていない。builder が迷わないよう、命名の意図（Layout コンポーネントであるためか、Next.js の `_` プレフィックス規約に従っているためか）を一文追記すべき。

**重要度:** 低（builder が迷う可能性は低いが、判断根拠の記録として）

**[指摘2] ステップ3: StandardResultLayout の import 記述が不正確**

計画のステップ3に以下の記述がある:

> import: `Link from "next/link"`, `DescriptionExpander`, `ShareButtons` は不要（DescriptionExpander のみ）、`styles from "./StandardResultLayout.module.css"` + `pageStyles from "../page.module.css"`（共通クラス参照用）

この文は意味が不明瞭。「`ShareButtons` は不要（DescriptionExpander のみ）」の括弧内が何を指しているか分かりにくい。実際のソースコードを確認すると:

- StandardResultLayout では `DescriptionExpander` を import する必要がある（L263）
- StandardResultLayout では `Link` を import する必要がある（L274, L335 で使用）
- StandardResultLayout では `ShareButtons` は不要（standard variant 内にシェアボタン中間配置はない）

正確な import 一覧を以下のように書き直すべき:

- `Link from "next/link"`（CTA1, CTA2 のリンクに使用）
- `DescriptionExpander from "../DescriptionExpander"`（description 表示に使用）
- `styles from "./StandardResultLayout.module.css"`
- `pageStyles from "../page.module.css"`（共通クラス参照用）

**重要度:** 中（builder の実装に直接影響する）

**[指摘3] ステップ6: dispatch の switch 文で `detailedContent?.variant` だけでは不十分**

計画では dispatch を以下のように記述している:

> switch (detailedContent?.variant) で Layout を選択
>
> - undefined → StandardResultLayout
> - "contrarian-fortune" → ContrarianFortuneLayout
> - "character-fortune" → CharacterFortuneLayout
> - default → never 型で exhaustive check

しかし `detailedContent` 自体が `undefined` の場合（detailedContent が存在しないケース）と、`detailedContent` が存在するが `variant` プロパティが `undefined` のケース（`QuizResultDetailedContent` 型）の2つがある。`detailedContent?.variant` は両方とも `undefined` を返すため、switch の `undefined` ケースで StandardResultLayout に分岐する動作は正しい。

ただし、StandardResultLayout に渡す `detailedContent` の型は計画で `QuizResultDetailedContent | undefined` と定義されており、これは正しい。`detailedContent` が `undefined` の場合は description + CTA1 のみ表示、`QuizResultDetailedContent` の場合は traits/behaviors/advice も表示する、という動作が StandardResultLayout 内で必要になる。

この点は計画のステップ6の項目4で言及されているが、StandardResultLayout 内での分岐ロジックの具体的な記述がない。以下を追記すべき:

- StandardResultLayout 内で `detailedContent` が `undefined` の場合は description + CTA1 のみレンダリング
- StandardResultLayout 内で `detailedContent` が `QuizResultDetailedContent` の場合は description + CTA1 + traits/behaviors/advice + CTA2 をレンダリング

**重要度:** 中（builder が StandardResultLayout の内部構造を正しく実装するために必要）

**[指摘4] 共通 props に `accentColor` へのアクセス手段の明記がない**

各 Layout の JSX は `quiz.meta.accentColor` を多用している（CTA ボタンの背景色、見出しの色、カードの背景色）。計画では `quizMeta: QuizMeta` を共通 props に含めているため、`quizMeta.accentColor` でアクセス可能であるが、計画のどこにも「accentColor は quizMeta 経由で参照する」という明示的な記述がない。

特に contrarian-fortune と character-fortune のレイアウトでは `quiz.meta.accentColor` の参照が多数あり、props 名の変更（`quiz.meta.accentColor` から `quizMeta.accentColor`）が必要になる。builder への注意喚起として、各ステップの作業内容に「JSX 内の `quiz.meta.X` 参照を `quizMeta.X` に変更する」旨を追記すべき。

**重要度:** 低（builder が自然に気づく可能性は高いが、明記する方が安全）

**[指摘5] ステップ8: page.test.ts の具体的な修正方針が不十分**

計画では page.test.ts について以下のように記述している:

> L117-120「CTA2」→ `cta2` は StandardResultLayout に移動するため page.tsx からは消える。検索対象を Layout ファイルに変更するか、テスト自体を Layout 用テストに移動する

実際の page.test.ts L116-121 を確認すると:

```typescript
describe("CTA2（detailedContent読了者向け）", () => {
  it("detailedContentがある場合にCTA2を表示するロジックがある", () => {
    expect(pageSource).toContain("cta2");
  });
});
```

このテストは `pageSource`（page.tsx のソース）に対して `"cta2"` を検索している。分離後は page.tsx から `cta2Section` / `cta2Link` への参照が消えるため、このテストは確実に失敗する。

また L123-127 の DescriptionExpander テストも同様に失敗する。

計画の「方針」セクションでは「Layout に移動したロジックの検証は page.test.ts から削除し、代わりに各 Layout のテストで検証する」と書かれているが、具体的にどのテストを削除し、どのテストをどの Layout テストファイルに移動するのかのリストがない。以下を明記すべき:

- 削除するテスト: L116-121（CTA2）、L123-127（DescriptionExpander import）
- 残すテスト: 他のすべて（generateMetadata 関連、RelatedQuizzes/RecommendedContent 関連、noindex 条件分岐、シェアテキスト、コンテキスト表示、resultPageLabels、DESCRIPTION_LONG_THRESHOLD、titleフォールバック）
- 追加するテスト（page.test.ts に）: page.tsx が3つの Layout コンポーネントを import していることの検証

**重要度:** 中（テスト修正の漏れを防ぐために必要）

**[指摘6] ステップ4-5: ContrarianFortuneLayout / CharacterFortuneLayout の props に `quiz.meta.title` が必要**

contrarian-fortune のレイアウト（L379）と character-fortune のレイアウト（L499）で `ShareButtons` に `quizTitle={quiz.meta.title}` を渡している。共通 props に `quizMeta: QuizMeta` があるため `quizMeta.title` でアクセス可能だが、ステップ4-5 の import セクションに `ShareButtons` が記載されているにもかかわらず、ShareButtons に渡す props の変換（`quiz.meta.title` から `quizMeta.title`）についての言及がない。

また、ステップ4の注意点セクションで `.compatibilitySection` / `.compatibilityPrompt` が character-fortune 専用であるにもかかわらず contrarian-fortune の注意点として記載されていない（これは正しい、contrarian-fortune では使わない）。ただし contrarian-fortune のステップに character-fortune との共有クラスのリストが記載されている箇所で、`.compatibilitySection` / `.compatibilityPrompt` が含まれていないことを確認済み。問題なし。

**重要度:** 低

**[指摘7] CSS 行範囲の不正確さ**

- ステップ4: 「page.module.css の L218〜L359（contrarian-fortune 専用スタイル）」と記載されているが、実際のファイルでは contrarian-fortune 専用スタイルのコメントヘッダーは L216 から始まっている（L216: `/* ====...`）。ただしスタイルクラスとしては L221 の `.catchphrase` が最初。L218 はコメント行である。ステップ内で「コピーする」のはクラス定義のみなので実害は小さいが、正確な行範囲に修正すべき。
- ステップ5: 「page.module.css の L360〜L399（character-fortune 専用スタイル）」と記載されているが、実際は L360 がコメントヘッダー行（`/* ====...`）、クラス定義は L365 の `.characterIntro` から始まる。同様に修正すべき。

**重要度:** 低（CSS のコピー作業自体に影響はないが、正確性のため）

#### 修正指示

1. [指摘1] `_layouts/` の命名理由を一文追記する
2. [指摘2] ステップ3 の import 一覧を正確に書き直す
3. [指摘3] StandardResultLayout 内での `detailedContent` の有無による分岐ロジックを明記する
4. [指摘4] 各ステップに「JSX 内の `quiz.meta.X` を `quizMeta.X` に変更する」旨を追記する（代表的な箇所を1つ書けば十分）
5. [指摘5] page.test.ts の削除・残存・追加テストの具体的なリストを明記する
6. [指摘7] CSS 行範囲を正確な値に修正する

上記の修正後、再度レビューを実施する。

### 計画レビュー（第2回）

**レビュー担当:** reviewer
**レビュー日時:** 2026-04-01
**結果:** 改善指示

#### 前回指摘事項への対応状況

6件すべて適切に対応されている。

1. [指摘1] `_layouts/` の命名理由 -- ステップ2に明確な理由が追記されている。OK
2. [指摘2] ステップ3の import 一覧 -- 正確な一覧に書き直されている。OK
3. [指摘3] StandardResultLayout 内の分岐ロジック -- ステップ6の項目4に具体的な分岐内容が明記されている。OK
4. [指摘4] props 名変更の注意 -- ステップ3に「props 名の変更に関する注意」として追記されている。OK
5. [指摘5] page.test.ts の具体的な修正方針 -- ステップ8に削除・残存・追加テストの具体的なリストが明記されている。OK
6. [指摘7] CSS 行範囲 -- ステップ4・5ともにコメントヘッダーとクラス定義の開始行が区別して正確に記載されている。OK

#### 新たな指摘事項

**[指摘1] ステップ3: CSS クラスのコピー方針と推奨方針が矛盾している**

ステップ3の項目2では以下のように記載されている:

> page.module.css から StandardResultLayout が使用するクラスを StandardResultLayout.module.css にコピーする:
>
> - `.trySection`, `.tryButton`, `.tryCost`（CTA1 用 -- 共通で使うため page.module.css にも残す）
> - `.detailedSection`, `.detailedSectionHeading`（共通で使うため page.module.css にも残す）
> - `.traitsList`, `.traitsItem`, `.behaviorsList`, `.behaviorsItem`, `.adviceCard`, `.cta2Section`, `.cta2Link`（Standard 専用）

この記述は、共通クラスも StandardResultLayout.module.css にコピーすると読める。しかし、同じステップ3の末尾にある推奨方針では以下のように記載されている:

> **推奨:** 共通で使われるクラス（`.detailedSection`, `.detailedSectionHeading`, `.behaviorsList`, `.behaviorsItem`, `.trySection`, `.tryButton`, `.tryCost`）は page.module.css に残し、各 Layout は `pageStyles from "../page.module.css"` として参照する。variant 固有クラスのみ各 Layout の CSS Module に定義する

推奨方針に従うなら、StandardResultLayout.module.css にコピーすべきは Standard 専用クラス（`.traitsList`, `.traitsItem`, `.adviceCard`, `.cta2Section`, `.cta2Link`）のみであり、共通クラスはコピーせず `pageStyles` で参照する。`.behaviorsList` と `.behaviorsItem` は全 variant 共通であるため、Standard 専用として列挙されているのも不正確。

項目2を以下のように修正すべき:

> StandardResultLayout.module.css を新規作成し、Standard 固有クラスのみ定義する:
>
> - `.traitsList`, `.traitsItem`, `.adviceCard`, `.cta2Section`, `.cta2Link`
>
> 共通クラス（`.detailedSection`, `.detailedSectionHeading`, `.behaviorsList`, `.behaviorsItem`, `.trySection`, `.tryButton`, `.tryCost`）は page.module.css に残し、`pageStyles from "../page.module.css"` で参照する。

**重要度:** 中（builder がコピー方針に従うか推奨方針に従うか迷い、不要な CSS 重複が発生するリスクがある）

#### 修正指示

1. [指摘1] ステップ3の項目2を推奨方針と一致するよう修正する。Standard 固有クラスのみ StandardResultLayout.module.css に定義し、共通クラスは pageStyles で参照する旨を明確にする。また `.behaviorsList` と `.behaviorsItem` を Standard 専用リストから共通リストに移動する。

上記の修正後、再度レビューを実施する。

### 計画レビュー（第3回）

**レビュー担当:** reviewer
**レビュー日時:** 2026-04-01
**結果:** 承認

#### 前回指摘事項への対応状況

第2回レビューの指摘1件（ステップ3のCSSクラスのコピー対象リストと推奨方針の矛盾）は適切に修正されている。

- ステップ3の項目2が Standard 専用クラス（`.traitsList`, `.traitsItem`, `.adviceCard`, `.cta2Section`, `.cta2Link`）のみのコピーに限定されている。OK
- 項目3で共通クラス（`.trySection`, `.tryButton`, `.tryCost`, `.detailedSection`, `.detailedSectionHeading`, `.behaviorsList`, `.behaviorsItem`）は page.module.css に残して `pageStyles` で参照する旨が明記されている。OK
- `.behaviorsList`, `.behaviorsItem` が Standard 専用リストから正しく除外され、共通リストに分類されている。OK

#### 全体レビュー

ソースコード（page.tsx 601行、page.module.css 399行、DescriptionExpander.tsx、page.test.ts 167行）および型定義（types.ts）と照合し、計画全体を再確認した。

**CSS クラスの分類:** ソースコードのgrep結果と一致しており正確。

- Standard 専用: `.traitsList`(L298), `.traitsItem`(L300), `.adviceCard`(L329), `.cta2Section`(L334), `.cta2Link`(L335) -- Standard セクション(L287-340)のみで使用。正確
- Contrarian 専用: `.catchphrase`(L256), `.coreSentence`(L351), `.persona`(L386), `.humorMetricsTable`(L401) -- Contrarian セクション(L253-257, L342-448)のみで使用。正確
- Character 専用: `.characterIntro`(L459), `.characterMessage`(L512), `.compatibilitySection`(L526), `.compatibilityPrompt`(L527) -- Character セクション(L450-574)のみで使用。正確
- Contrarian + Character 共有（各Layout CSSに重複定義）: `.thirdPartySection`, `.thirdPartyHeading`, `.thirdPartyNote`, `.midShareSection`, `.allTypesSection`, `.allTypesList`, `.allTypesItem`, `.allTypesItemCurrent`, `.allTypesCta` -- 正確
- 全 variant 共通（page.module.css に残す）: `.detailedSection`, `.detailedSectionHeading`, `.behaviorsList`, `.behaviorsItem`, `.trySection`, `.tryButton`, `.tryCost` -- 正確

**props 型定義:** types.ts の `QuizResultDetailedContent`(variant?: undefined), `ContrarianFortuneDetailedContent`(variant: "contrarian-fortune"), `CharacterFortuneDetailedContent`(variant: "character-fortune") と整合している。`QuizMeta` に `accentColor`, `title`, `questionCount`, `shortDescription`, `resultPageLabels` 等が存在することも確認済み。

**テスト修正方針:** page.test.ts の各テスト（L14-165）を実際に確認し、削除対象(L116-121 CTA2, L123-127 DescriptionExpander)、残存対象、追加対象の分類が正確であることを確認済み。

**dispatch 構造:** `detailedContent?.variant` による switch は、`detailedContent === undefined` と `detailedContent.variant === undefined`（QuizResultDetailedContent）の両方を `undefined` ケースで StandardResultLayout に振り分ける動作が正しく説明されている。

#### 注意事項（承認に影響しないが builder への参考情報）

ステップ4で ContrarianFortuneLayout に移動するコードのうち、catchphrase（L254-257）は現在 `.detailedSection` の外側（`.card` 直下、title の直後）にレンダリングされている。一方、contrarian-fortune 専用レイアウト本体（L342-448）は `.detailedSection` の内側である。ContrarianFortuneLayout の実装時には、catchphrase を `.detailedSection` の前に配置するという現在の DOM 構造を維持する必要がある。計画には「L253-257: catchphrase（h1直下のサブタイトル）」と記載されており位置関係は暗示されているが、builder は元のソースコードを参照して正しい配置順序を確認すること。

### 成果物レビュー（第1回）

**レビュー担当:** reviewer
**レビュー日時:** 2026-04-01
**結果:** 承認

#### 検証項目と結果

**1. ビルド・lint・format・テスト**

`npm run lint && npm run format:check && npm run test && npm run build` を実行し、すべて成功を確認。

- lint: エラー・警告なし
- format:check: All matched files use Prettier code style
- test: 238ファイル 3229テスト 全パス
- build: 正常完了（Static + SSG 全ページ生成成功）

**2. DOM構造の同一性**

元の page.tsx（601行）の各 variant のレンダリング出力と、分離後の Layout コンポーネントの出力を比較検証した。

- **Standard variant**: DescriptionExpander + CTA1 が `detailedSection` の外側、traits/behaviors/advice + CTA2 が `detailedSection` 内側。元と一致。
- **contrarian-fortune variant**: catchphrase が `detailedSection` の外側（Fragment直下）、coreSentence 以降が `detailedSection` 内側。元と一致。計画レビュー第3回の注意事項（catchphrase の配置）も正しく対応されている。
- **character-fortune variant**: characterIntro から全タイプ一覧まで全体が `detailedSection` 内側。元と一致。

共通ヘッダー（Breadcrumb, quizName, quizContext, icon, title）とフッター（shareSection, CompatibilityDisplay, RelatedQuizzes, RecommendedContent）は page.tsx に残っており、dispatch 部分のみが Layout コンポーネントに委譲されている。

**3. CSSの正確性**

page.module.css（398行 → 116行）から分離された全クラスを追跡し、以下の分類が正確であることを確認した。

- **page.module.css に残存（共通）**: `.wrapper`, `.card`, `.icon`, `.title`, `.quizName`, `.quizContext`, `.shareSection`, `.trySection`, `.tryButton`, `.tryCost`, `.detailedSection`, `.detailedSectionHeading`, `.behaviorsList`, `.behaviorsItem` -- 全 variant で使用されるクラス群。正確。
- **DescriptionExpander.module.css**: `.descriptionWrapper`, `.description`, `.descriptionClamped`, `.descriptionToggle` -- 正確。DescriptionExpander.tsx の import も `./DescriptionExpander.module.css` に変更済み。
- **StandardResultLayout.module.css**: `.traitsList`, `.traitsItem`, `.adviceCard`, `.cta2Section`, `.cta2Link` -- Standard 専用クラスのみ。正確。
- **ContrarianFortuneLayout.module.css**: Contrarian 固有（`.catchphrase`, `.coreSentence`, `.persona`, `.humorMetricsTable`）+ Contrarian/Character 共有（`.midShareSection`, `.thirdPartySection`, `.thirdPartyHeading`, `.thirdPartyNote`, `.allTypesSection`, `.allTypesList`, `.allTypesItem`, `.allTypesItemCurrent`, `.allTypesCta`）。正確。
- **CharacterFortuneLayout.module.css**: Character 固有（`.characterIntro`, `.characterMessage`, `.compatibilitySection`, `.compatibilityPrompt`）+ Contrarian/Character 共有（同上、重複定義）。CSS Modules のスコーピング特性上、重複定義は正しいアプローチ。正確。

抜け漏れ・重複なし。全クラスの定義内容（プロパティ値）も元のファイルと一致。

**4. 型安全性**

- `ResultLayoutCommonProps` → 3つの variant props が extends。正確。
- `StandardResultLayoutProps.detailedContent`: `QuizResultDetailedContent | undefined` -- `detailedContent` なしの場合（description + CTA1 のみ）と、標準 detailedContent ありの場合（traits/behaviors/advice + CTA2）の両方をカバー。
- `ContrarianFortuneLayoutProps.detailedContent`: `ContrarianFortuneDetailedContent`（非 optional）-- dispatch 側で variant が確定してから渡すため正しい。
- `CharacterFortuneLayoutProps.detailedContent`: `CharacterFortuneDetailedContent`（非 optional）-- 同上。
- Exhaustive check: `default: { const _exhaustive: never = detailedContent; return _exhaustive; }` -- 新しい variant が追加された場合、TypeScript コンパイルエラーで検出される。正確。
- dispatch の if-guard（`!detailedContent || !detailedContent.variant`）は `switch` 前に `undefined` ケースを処理し、TypeScript の型ナローイングを正しく活用している。

**5. テストカバレッジ**

- **page.test.ts**: CTA2 と DescriptionExpander の直接検証を削除し、「StandardResultLayout に委譲されている」検証に置き換え。他の既存テスト（generateMetadata 関連、noindex 条件分岐、シェアテキスト、resultPageLabels 等）はすべて維持。
- **page.test.tsx**: 変更なし。元の統合テスト（モック使用でのフルページレンダリング）が引き続きパス。
- **StandardResultLayout.test.tsx**: DescriptionExpander 表示、CTA1 表示・href 検証、detailedContent の有無による条件分岐（traits/behaviors/advice/CTA2 の表示・非表示）、カスタム見出しテスト。十分。
- **ContrarianFortuneLayout.test.tsx**: 全要素（catchphrase, coreSentence, behaviors, persona, thirdParty, humorMetrics, allTypes, CTA）の表示テスト。humorMetrics 空配列のエッジケースもカバー。十分。
- **CharacterFortuneLayout.test.tsx**: 全要素（characterIntro, behaviors, characterMessage, thirdPartyNote, compatibilityPrompt, ShareButtons, allTypes, CTA）の表示テスト。十分。
- **types.test.ts**: 型チェック + ダミーデータのランタイム検証。`satisfies` キーワードによる型制約テスト。十分。

**6. 将来の拡張性**

新しい variant を追加する際の手順:

1. `types.ts` に新しい `XxxLayoutProps extends ResultLayoutCommonProps` を定義
2. `_layouts/XxxLayout.tsx` + `_layouts/XxxLayout.module.css` を作成
3. `page.tsx` の switch に `case "xxx":` を追加（exhaustive check が未追加を検出）
4. `_layouts/__tests__/XxxLayout.test.tsx` を追加

手順は明確で簡潔。影響範囲は「新ファイル追加 + page.tsx の dispatch 行追加」のみに限定されている。

**7. ビジュアル検証**

Playwright で3つの variant ページを表示し、スクリーンショットを確認した。

- Standard（`/play/music-personality/result/festival-pioneer`）: 正常に描画。description の展開・CTA・traits/behaviors/advice が正しく表示。
- Contrarian-fortune（`/play/contrarian-fortune/result/reverseoptimist`）: 正常に描画。catchphrase → coreSentence → behaviors → ShareButtons → persona → thirdParty → humorMetrics → allTypes → CTA の順序が正しい。
- Character-fortune（`/play/character-fortune/result/commander`）: 正常に描画。characterIntro → CTA1 → behaviors → ShareButtons → characterMessage → thirdParty → compatibility → allTypes → CTA の順序が正しい。

**8. constitution.md との適合性**

- Rule 1 (法令遵守): 影響なし（リファクタリングのみ）
- Rule 2 (有用・楽しい / 害を与えない): ユーザー向け出力に変更なし。DOM 同一性を検証済み。
- Rule 3 (AI運営の通知): 影響なし
- Rule 4 (品質優先): コードの可読性・保守性が大幅に向上。601行 → 337行（page.tsx）に削減しつつ、variant 別ロジックが独立ファイルに分離され見通しが良い。
- Rule 5 (多様な試み): B-251〜B-257 の各 variant 固有最適化を安全に実施するための基盤として適切。

#### 指摘事項

なし。

## キャリーオーバー

- **B-260: cycle-143の実装を全面破棄し、結果ページのルート設計をゼロから再検討する（緊急対応）。** cycle-143で実装したvariant別Server Component分離（A案: `_layouts/`ディレクトリ、自前dispatch機構、共通props型定義、pageStyles二重参照）は設計方針の誤りによる完全な失敗であり、リファクタリング目的に反してコードの複雑さを大幅に増加させた。この実装は全面的に破棄し、Next.jsのファイルシステムベースルーティングを活用したルート分離（B案）を含む最適な設計をゼロから検討し直す必要がある。backlog.mdにP0緊急タスクとして登録済み。

**次サイクルのPMへの重要な申し送り:**

cycle-143の実装（`_layouts/`配下のLayoutコンポーネント群、page.tsxのswitch dispatch、共通props型定義）は**完全な誤りであり、絶対に踏襲してはならない**。この実装はNext.jsのファイルシステムベースルーティングを無視して自前のルーティング機構を構築したものであり、フレームワークが不要にしてくれるはずの複雑さ（dispatch機構、props型定義、CSS二重参照）をすべて手動で作り込んでいる。cycle-142でOwnerが「そもそもルートに[slug]が入っていることが不合理ではないか」と指摘し、PM自身がルート分離案を提示していたにもかかわらず、分析レポートの誤った推奨に従ってA案を採用した。B案（slugごとのルート分離）はURLを変えずに実現可能であることがcycle-142で確認済みである。事故報告書の全文を必ず読んでから作業に着手すること。

## 事故報告書

### 事故概要

cycle-143はリファクタリングによってコードの複雑さを下げることが目的であったが、実際にはコードの複雑さを大幅に増加させた。Next.jsのファイルシステムベースルーティングを使えば条件分岐自体が不要になるにもかかわらず、自前のswitch文によるdispatch機構を新たに構築し、共通props型定義、pageStylesの二重参照、`_layouts/`ディレクトリといったフレームワークが不要にしてくれるはずの複雑さを作り込んだ。目的と真逆の結果を招いた完全な大失敗である。

### 時系列の経緯

#### 前提: cycle-142でのOwnerの指摘（2026-03-31）

cycle-142（character-fortuneのdetailedContent構造最適化）の実施中に、Ownerが以下の問題提起を行った。

1. 「全く異なる意図を持って作られた全く異なるレイアウトのページを単一のコンポーネントに埋め込むのは、バンドルサイズや開発工数、将来的な拡張性の観点から見て適切な設計だといえますか？」
2. 「同じコンポーネントに詰め込んでいるせいでレイアウトを揃えざるを得ない不自由さによって諦められている『あるべき姿』もあるはずです。」
3. **「そもそもルートに[slug]が入っていることが不合理ではないですか？」**

3番目の発言は、条件分岐の軽減策ではなく**ルート設計自体の変更**を示唆するものだった。PMはこの指摘に対し、Next.js App Routerの「具体的なパスが動的ルートより優先される」仕様を活用したルート分離案を自ら提示した:

- `/play/character-fortune/result/[resultId]/page.tsx` — character-fortune専用
- `/play/contrarian-fortune/result/[resultId]/page.tsx` — contrarian-fortune専用
- `/play/[slug]/result/[resultId]/page.tsx` — 標準形式（残りのクイズ用）

この時点でPMは、**URLを変えずにルートレベルで分離できること**を理解し、具体案まで提示していた。

#### cycle-142での分析レポート作成（2026-03-31）

code-researcherにpage.tsxの構造分析を依頼し、`docs/research/2026-03-31-result-page-component-architecture-analysis.md`を作成した。このレポートでは3つの選択肢が比較された:

- **(A) variant別コンポーネント分離**: page.tsx内でdispatchし、`_layouts/`配下の専用Server Componentに分離
- **(B) slug別の完全なルート分離**: `/play/contrarian-fortune/result/[resultId]/page.tsx` のようにslugごとにルートを分離
- **(C) Aの改良版**: 実質Aと同義

レポートのB案の記述には以下が含まれていた:

> 「`[slug]`ルートと固定ルート（例: `contrarian-fortune`）の共存時、Next.jsはより具体的なルートを優先するため**技術的には実現可能**」

同時に、B案の「デメリット」として以下が記載された:

> 「現在 `/play/[slug]/result/[resultId]` という統一URLパターンを破壊する」
> 「SEO上、既存の静的URLが変わる場合リダイレクト設定が必要」

**「技術的には実現可能」と書きながら「URLパターンを破壊する」と書くという矛盾**がレポート内に存在していた。Next.js App Routerでは具体的ルートが動的ルートより優先されるため、URLは変わらない。「URL破壊」は事実に反する記述だった。

レポートの結論は「選択肢Aを推奨」。B-258としてバックログに「variant別Server Component分離**または**ルートレベル分離を検討」と登録された。

#### cycle-143開始: バックログからB-258を選択（2026-04-01 12:14）

PMがcycle-143を開始し、B-258をActiveに移動。B-258のbacklog記述には「variant別Server Component分離**または**ルートレベル分離を検討」と書かれていたが、PMは分析レポートの推奨案（選択肢A）をそのまま前提とし、ルート分離案を改めて検討する判断をしなかった。

#### code-researcher起動: 実装調査（2026-04-01）

PMがcode-researcherサブエージェントを起動し、「page.tsxの完全な構造分析」を依頼した。依頼内容は選択肢Aの実装に必要な情報の収集であり、選択肢Bの実現可能性検証は依頼に含まれていなかった。

調査レポートの要約（PMが受け取った結果）:

- page.tsxの行範囲の境界は明確
- CSSの共通/variant固有の境界はL215
- DescriptionExpander.tsxがpage.module.cssを直接インポートしている
- page.test.tsがreadFileSyncでソースを文字列検索しており、Layout移動で失敗する
- 分離後のprops構造の整理

この調査結果には、ルート分離案（B案）に関する情報は一切含まれていなかった。

#### planner起動: 計画策定（2026-04-01）

PMがplannerサブエージェントを起動し、計画策定を依頼した。依頼内容には以下が含まれていた:

> 「分離方針（選択肢A）: `_layouts/`ディレクトリにvariant別Server Component + CSS Moduleを作成」

PMは依頼の時点で**選択肢Aを前提として指示しており、plannerに方針選択の余地を与えなかった**。plannerは指示通りにA案の実装計画を策定した。

計画書の「検討した他の選択肢と判断理由」セクションでは、B案の却下理由として以下が記載された:

> 「現在の統一URLパターン `/play/[slug]/result/[resultId]` を破壊する。SEO上の既存URLからのリダイレクト設定が必要になり、管理コストが高い。」

これは分析レポートのデメリット記述をそのまま転記したものであり、同じレポートに「技術的には実現可能」と書かれていた事実、およびcycle-142でPM自身がルート分離案を提示していた事実と矛盾する。plannerはこの矛盾を検証しなかった。

#### reviewer起動: 計画レビュー第1回（2026-04-01）

PMがreviewerサブエージェントを起動し、計画のレビューを依頼した。レビュー依頼には以下の観点が含まれていた:

> 「目的の妥当性」「技術的正確性」「リスク管理」「漏れ・抜け」

reviewerは6件の指摘事項を出した。すべてA案の実装詳細に関するものだった:

1. ステップ3のimport一覧が不正確
2. StandardResultLayout内のdetailedContent分岐ロジックの記述不足
3. page.test.tsの修正方針が抽象的
4. `_layouts/`の命名理由が未記載
5. props名変更の注意喚起がない
6. CSS行範囲の正確性

**B案の却下理由が事実に基づいているかの検証は行われなかった。**

#### planner再起動: 第1回指摘対応（2026-04-01）

plannerが6件の指摘すべてに対応。import一覧の書き直し、テスト修正方針の具体化、命名理由の追記などを実施。

#### reviewer起動: 計画レビュー第2回（2026-04-01）

reviewerが前回6件の対応を確認し、新たに1件を指摘:

1. ステップ3のCSSクラスのコピー対象リストと推奨方針が矛盾（共通クラスをコピーするのかpageStylesで参照するのか不明確）

**再び実装詳細の正確性のみが検証対象だった。**

#### planner再起動: 第2回指摘対応（2026-04-01）

CSSクラスの分類を整理し、矛盾を解消。

#### reviewer起動: 計画レビュー第3回（2026-04-01）— 承認

reviewerがソースコードと照合し、CSSクラスの5分類、props型定義、テスト修正方針、dispatch構造のすべてが正確であることを確認して承認。

**3回のレビューを通じて一度も「この設計方針自体がNext.jsのベストプラクティスに沿っているか」「B案の却下理由は事実か」「リファクタリングの目的（複雑さの削減）に照らしてA案は最善か」という問いは立てられなかった。**

#### builder起動: ステップ1-2並行実行（2026-04-01）

PMが2つのbuilderサブエージェントを並行起動:

- builder 1: DescriptionExpanderのCSS分離（`DescriptionExpander.module.css`新規作成、import変更、page.module.cssからの削除）
- builder 2: 共通props型定義（`_layouts/types.ts`に`ResultLayoutCommonProps`, `StandardResultLayoutProps`, `ContrarianFortuneLayoutProps`, `CharacterFortuneLayoutProps`を定義）

両方完了。238テストファイル・3191テスト全パス。

#### builder起動: ステップ3-5並行実行（2026-04-01）

PMが3つのbuilderサブエージェントを並行起動:

- builder 3: StandardResultLayout作成（tsx + module.css + テスト10件）
- builder 4: ContrarianFortuneLayout作成（tsx + module.css + テスト14件）
- builder 5: CharacterFortuneLayout作成（tsx + module.css + テスト14件）

各builderはPMから受け取った詳細な実装指示に従い、page.tsxの該当範囲のJSXをそのままLayoutコンポーネントに移動し、`quiz.meta.X`を`quizMeta.X`に変換し、共通クラスを`pageStyles`で参照する形に変換した。

すべて完了。3229テスト全パス。

#### builder起動: ステップ6-7実行（2026-04-01）

PMが1つのbuilderサブエージェントを起動:

- ステップ6: page.tsxのdispatch化。L253-L574のvariant固有JSXを全削除し、switch文によるdispatchロジックに置換。3つのLayoutコンポーネントをimport、`DescriptionExpander`と`ShareButtons`のimportを削除。601行→337行。
- ステップ7: page.module.cssのクリーンアップ。variant固有スタイルを全削除。399行→116行。
- page.test.tsの2件のテスト更新（CTA2とDescriptionExpanderの委譲確認）。

完了。3229テスト全パス、ビルド成功。

#### reviewer起動: 成果物レビュー（2026-04-01）— 承認

reviewerが以下を検証:

- ビルド・lint・format・テスト全パス
- DOM構造の同一性（3つのvariantすべて）
- CSSの正確性
- 型安全性（exhaustive check）
- テストカバレッジ
- Playwrightでのビジュアル検証（3ページのスクリーンショット）

指摘事項なしで承認。**「この設計がリファクタリングの目的（複雑さの削減）を達成しているか」の検証は行われなかった。**

#### cycle-143完了報告（2026-04-01 13:38）

PMがbacklog更新、チェックリスト完了、コミット・プッシュを実行。

#### Ownerの介入（2026-04-01）

Owner:「自前でルーティングを実装する設計はNext.jsのベストプラクティスに照して適切ですか？最小限の工数で最も安全に実装できる方式ですか？前サイクルの検討では、そもそも条件分岐をせずルートを追加するという話になっていたはずです。」

Owner:「B案でもURLの変更は発生しません。前サイクルで確認済みです。計画レビューでは何を確認していたのですか？」

Owner:「本サイクルは100%の完全な大失敗です。リファクタリングによって無用な複雑さを下げるはずのサイクルで、むしろ複雑さを増してしまいました。」

### 事故の分析

#### A案で何が作り込まれたか（B案なら不要だったもの）

1. **`_layouts/types.ts`（73行）**: `ResultLayoutCommonProps`、`StandardResultLayoutProps`、`ContrarianFortuneLayoutProps`、`CharacterFortuneLayoutProps`の4つのinterface。B案では各ルートのpage.tsxが直接データを取得するため、propsのリレーが不要であり、この型定義ファイル自体が不要。

2. **switch文によるdispatch機構（page.tsx L254-L309）**: `detailedContent?.variant`の値に基づいて3つのLayoutコンポーネントを呼び分ける自前ルーティング。B案ではNext.jsのファイルシステムルーティングがこれを自動的に行うため、dispatch機構自体が不要。

3. **`pageStyles`の二重参照**: 各LayoutコンポーネントがStandard専用CSSとpage.module.css（共通クラス）の2つのCSS Moduleを同時にimportする構造。B案では各ルートが独自のCSSを持つため、二重参照が不要。

4. **共通propsの受け渡し**: page.tsxが取得したデータ（slug, resultId, quizMeta, result, shareText, shareUrl, ctaText）を各Layoutにprops経由で渡す構造。B案では各ルートのpage.tsxが自分でデータを取得するため、このリレーが不要。

5. **exhaustive check**: switch文のdefaultケースで`never`型チェックを行い、新variant追加漏れを検出する機構。B案ではvariant判定自体がなく、新ルートを追加するだけで済むため、この安全機構自体が不要。

6. **テストの複雑化**: 4つのLayout用テストファイル（types.test.ts, StandardResultLayout.test.tsx, ContrarianFortuneLayout.test.tsx, CharacterFortuneLayout.test.tsx）が新規追加された。

#### 各フェーズで何が起きたか

**1. PMのバックログ選択時点での判断放棄**

B-258のbacklog記述には「variant別Server Component分離**または**ルートレベル分離を検討」と書かれていた。PMはcycle-142でOwnerから「そもそもルートに[slug]が入っていることが不合理ではないか」と指摘を受け、自らルート分離案を提示していた。にもかかわらず、cycle-143開始時に分析レポートの推奨案（A案）をそのまま前提とし、ルート分離案を改めて検討しなかった。

**2. code-researcherへの依頼がA案前提だった**

PMがcode-researcherに依頼した調査内容は「page.tsxの構造分析」「分離時のprops一覧」「CSS分割の注意点」など、すべてA案の実装に必要な情報の収集だった。「B案（ルート分離）の実現可能性検証」「A案とB案の複雑さの比較」は依頼に含まれていなかった。調査の時点でA案に決め打ちしていた。

**3. plannerへの依頼がA案を指定していた**

PMがplannerに送った依頼には「分離方針（選択肢A）: `_layouts/`ディレクトリにvariant別Server Component + CSS Moduleを作成」と明記されていた。plannerに方針選択の余地を与えなかった。plannerは指示通りにA案の計画を策定し、B案の却下理由として分析レポートのデメリット記述（「URL破壊」）をそのまま転記した。

**4. reviewerへの依頼に設計方針の妥当性検証が実質含まれていなかった**

PMのレビュー依頼には「目的の妥当性」「技術的正確性」「漏れ・抜け」という観点が含まれていた。しかし、reviewerが実際に検証したのはA案の実装詳細（import一覧、CSS行範囲、props型、テスト修正方針）の正確性のみだった。「B案の却下理由が事実に基づいているか」「A案がB案より複雑さを減らせるか」という検証は3回のレビューで一度も行われなかった。

PMの依頼文面にはA案が前提として含まれており、「背景」セクションで「分離方針（選択肢A）」と明記されていた。reviewerに「この方針自体を疑え」というシグナルが送られていなかった。

**5. builderは指示通りに正確に実装した**

5つのbuilderサブエージェントはすべて、PMから受け取った詳細な実装指示に従い、正確にコードを作成した。builderに設計方針の判断は委ねられていなかった。

**6. 成果物レビューでも設計方針は検証されなかった**

成果物レビューではDOM構造の同一性、型安全性、テストカバレッジ、ビジュアル検証が行われたが、「このリファクタリングが実際に複雑さを減らしたか」という、サイクルの目的に対する成果の検証は行われなかった。

#### なぜPMはcycle-142で理解していたことをcycle-143で活かせなかったか

cycle-142でPMは以下を理解していた:

- Ownerが「ルートに[slug]が入っていることが不合理」と指摘したこと
- Next.jsでは具体的パスが動的ルートより優先されるため、URLを変えずにルート分離できること
- PM自身がルート分離案（`/play/character-fortune/result/[resultId]/page.tsx`等）を具体的に提示したこと

しかしcycle-143ではこれらの知識が活用されなかった。cycle-142の調査で作成された分析レポートが「選択肢Aを推奨」と結論づけており、PMはレポートの結論をそのまま採用した。レポートの結論とOwnerの指摘の方向性が異なっていたにもかかわらず、PMはその矛盾に気づかなかった。あるいは、レポートの結論の方を優先した。

#### 分析レポート自体の矛盾

`docs/research/2026-03-31-result-page-component-architecture-analysis.md` には以下の矛盾がある:

- B案について「`[slug]`ルートと固定ルートの共存時、Next.jsはより具体的なルートを優先するため技術的には実現可能」と記載（L124）
- B案のデメリットとして「現在 `/play/[slug]/result/[resultId]` という統一URLパターンを破壊する」と記載（L122）

技術的に実現可能でURLが変わらないのであれば「URLパターンを破壊する」は事実に反する。この矛盾はレポート作成時にも、cycle-143の計画策定時にも、3回の計画レビューでも、誰にも指摘されなかった。

### 結果の評価

サイクル143の目的は「結果ページコンポーネントの複雑さを下げる」ことだった。実際に起きたことは:

- **新規ファイル12個追加**: types.ts, 3つのLayout.tsx, 3つのLayout.module.css, DescriptionExpander.module.css, 4つのテストファイル
- **自前dispatch機構の構築**: Next.jsのルーティングで不要なswitch文、exhaustive check、共通props型定義
- **CSS二重参照パターンの導入**: 各Layoutが自身のCSSとpage.module.cssの両方をimport
- **1,700行の追加、617行の削除**: 純増1,083行

B案（ルート分離）であれば:

- dispatch機構が不要（Next.jsがルーティング）
- 共通props型定義が不要（各ルートが直接データ取得）
- CSS二重参照が不要（各ルートが独立したCSS）
- 新variant追加は「新ディレクトリにpage.tsxを置くだけ」

## 補足事項

なし

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
