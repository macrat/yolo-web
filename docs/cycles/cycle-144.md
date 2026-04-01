---
id: 144
description: "結果ページのルート設計をゼロから再検討（cycle-143全面破棄→Next.jsルート分離+ResultPageShell）"
started_at: "2026-04-01T15:45:40+0900"
completed_at: "2026-04-01T17:35:09+0900"
---

# サイクル-144

cycle-143で実装したvariant別Server Component分離（A案: 自前dispatch機構）は設計方針の誤りにより完全な失敗と判定された。この実装を全面的に破棄し、結果ページのルート設計を最適な方式でゼロから再検討する。Next.jsのファイルシステムベースルーティングを活用したルート分離（B案: slugごとに具体的ルートを追加）を含め、最も単純で安全な方式を選定する。

## 実施する作業

- [x] cycle-143の実装内容と問題点を完全に把握する
- [x] 結果ページの現状のルート構造・コード構造を調査する
- [x] Next.jsのルーティングを活用した設計案を検討・比較する
- [x] 最適な設計案を選定し、実装計画を策定する
- [x] cycle-143の実装を破棄し、新しい設計で実装する
- [x] テスト・ビルド・lint・formatチェックを通す
- [x] レビュー実施

## 作業計画

### 目的

cycle-143で導入された自前dispatch機構（A案）を全面破棄し、Next.jsのファイルシステムベースルーティング（B案）で結果ページのvariant分離を実現する。具体的には、contrarian-fortuneとcharacter-fortuneの結果ページを独立した具体的ルートとして切り出し、動的ルート`[slug]`からこれら2種類の分岐ロジックを完全に除去する。

B案の主な利点は**コードの単純性と保守性**にある。各ルートがNext.jsのファイルシステムルーティングにより自然に分離され、dispatch機構・共通props型定義・CSS二重参照といったcycle-143の失敗要因がすべて排除される。なお、結果ページのコンポーネントはすべてServer Componentであり、クライアントに送信されないため、バンドルサイズへの影響は実質的にない。

全ルート共通のwrapper構造（Breadcrumb, quizName, quizContext, icon, h1, ShareButtons, RelatedQuizzes, RecommendedContent）は、薄いServer Component `ResultPageShell` として抽出する。これにより、B-251〜B-257で最大10ルートに拡大した際にも、共通変更（フィードバックボタン追加、Breadcrumb変更等）を1箇所で行えるようにする。ResultPageShellはcycle-143のA案とは本質的に異なる（後述の「検討した他の選択肢と判断理由」を参照）。

### 作業内容

#### ステップ1: ResultPageShellの作成

**作成するファイル:**

- `src/play/quiz/_components/ResultPageShell.tsx`
- `src/play/quiz/_components/ResultPageShell.module.css`

**ResultPageShell.tsx の責務:**

- props: `quiz: QuizDefinition`, `result: QuizResult`, `children: React.ReactNode`, `shareText: string`, `shareUrl: string`, `afterShare?: React.ReactNode`
- propsは最小限とし、cycle-143のtypes.tsのような複雑なprops型定義にしない。QuizDefinitionとQuizResultをそのまま受け取る
- dispatch機構を含まない。各ルートのpage.tsxが自分でShellを呼ぶ
- 描画する共通構造: wrapper > Breadcrumb > card > quizName > quizContext > icon > h1 > `{children}` > ShareButtons > `{afterShare}` > RelatedQuizzes > RecommendedContent
- `afterShare`はオプションのReactNode prop（デフォルト: null）。動的ルートではCompatibilityDisplayをここに渡す。具体的ルート（contrarian-fortune, character-fortune）ではこのpropを省略する
- `countCharWidth`関数はステップ2で`src/lib/countCharWidth.ts`として切り出すため、そこからimportする

**ResultPageShell.module.css:**

- Shellが直接描画する要素のスタイルのみを集約: wrapper, card, icon, title, quizName, quizContext, shareSection
- trySection/tryButton/tryCost, detailedSection/detailedSectionHeading, behaviorsList/behaviorsItem はShell自身が描画する要素ではなく、children内のvariant固有JSXで使用されるスタイルなので含めない。各ルートのpage.module.cssに定義する（variant間で同じスタイルが重複するが、各variantが将来独自にカスタマイズする可能性があるため許容する）
- 各ルートのpage.module.cssにはvariant固有のスタイル + variant-shared content styles（trySection, detailedSection, behaviorsList等）を定義する

**CSSの独立性:**

- ResultPageShellは自身のCSS Module（ResultPageShell.module.css）のみを参照する
- 各ルートのpage.tsxは自身のCSS Module（page.module.css）のみを参照する
- CSS二重参照は発生しない

#### ステップ2: countCharWidthの切り出し

**作成するファイル:**

- `src/lib/countCharWidth.ts`

**内容:**

- 15行程度の純粋関数。Unicode文字幅の判定という汎用ユーティリティ
- variant固有のロジックを一切含まない
- SITE_NAMEやBASE_URLと同じレベルの共有であり、ルート間の結合度を高めない
- 各ルートのpage.tsxおよびResultPageShellから `import { countCharWidth } from "@/lib/countCharWidth"` で参照する

#### ステップ3: 具体的ルートの新設（contrarian-fortune）

**作成するファイル:**

- `src/app/play/contrarian-fortune/result/[resultId]/page.tsx`
- `src/app/play/contrarian-fortune/result/[resultId]/page.module.css`
- `src/app/play/contrarian-fortune/result/[resultId]/opengraph-image.tsx`

**page.tsx の責務:**

- `generateStaticParams`: contrarian-fortuneクイズの全resultIdを返す（slugパラメータは不要、`[resultId]`のみ）
- `generateMetadata`: contrarian-fortune向けメタデータ生成。contrarian-fortuneは常にdetailedContentありなので、常に`index: true`。searchParamsの処理は含めない（contrarian-fortuneには相性機能がない）
- デフォルトexport: contrarianFortuneクイズからデータを直接取得し、ResultPageShellでラップしてレンダリング。children部分にcontrarian-fortune固有のJSXのみを記述する
- `notFound()`: resultIdが不正な場合（`quiz.results.find()`がundefinedを返す場合）はnotFound()を呼び出す。slugは固定値なのでquizデータ取得の失敗はありえない

**page.tsxの構造:**

```
export default async function ContrarianFortuneResultPage({ params }) {
  const result = contrarianFortuneQuiz.results.find(r => r.id === resultId);
  if (!result) notFound();
  return (
    <ResultPageShell quiz={contrarianFortuneQuiz} result={result} shareText={...} shareUrl={...}>
      {/* contrarian-fortune固有のJSXだけをここに書く */}
      {/* catchphrase, coreSentence, persona, humorMetricsTable, 等 */}
    </ResultPageShell>
  );
}
```

**page.module.css:**

- contrarian-fortune固有のスタイルを定義する: catchphrase, coreSentence, persona, humorMetricsTable, midShareSection, thirdPartySection, thirdPartyHeading, thirdPartyNote, allTypesSection, allTypesList, allTypesItem, allTypesItemCurrent, allTypesCta
- variant-shared content styles（children内で使用する共通スタイル）も定義する: trySection, tryButton, tryCost, detailedSection, detailedSectionHeading, behaviorsList, behaviorsItem
- Shellの共通スタイル（wrapper, card, icon, title, quizName, quizContext, shareSection）はResultPageShell.module.cssにあるため含めない

**opengraph-image.tsx:**

- contrarian-fortuneクイズ専用のOGP画像生成。slugは固定値`"contrarian-fortune"`を使用
- `generateStaticParams`は`[resultId]`のみ返す

#### ステップ4: 具体的ルートの新設（character-fortune）

**作成するファイル:**

- `src/app/play/character-fortune/result/[resultId]/page.tsx`
- `src/app/play/character-fortune/result/[resultId]/page.module.css`
- `src/app/play/character-fortune/result/[resultId]/opengraph-image.tsx`

**構造はステップ3と同様。** character-fortune固有の点:

- ResultPageShellのchildren部分にcharacter-fortune固有のJSXを記述する
- page.module.cssにはcharacter-fortune固有のスタイルのみを定義する
- 相性機能は不要（character-fortuneの結果ページには相性表示がない）。searchParamsの処理は含めない
- resultIdが不正な場合はnotFound()を呼び出す

#### ステップ5: 動的ルートの簡素化

**変更するファイル:**

- `src/app/play/[slug]/result/[resultId]/page.tsx`
- `src/app/play/[slug]/result/[resultId]/page.module.css`
- `src/app/play/[slug]/result/[resultId]/opengraph-image.tsx`
- `src/app/play/[slug]/result/[resultId]/__tests__/page.test.ts`（テスト修正もこのステップで同時実施）
- `src/app/play/[slug]/result/[resultId]/__tests__/page.test.tsx`（contrarian-fortune/character-fortune関連テスト削除）

**変更内容:**

- `_layouts/`への全importを削除（StandardResultLayout, ContrarianFortuneLayout, CharacterFortuneLayout）
- dispatch機構（IIFE内のswitch文）を削除
- ResultPageShellを使用するように書き換える。page.tsxのデフォルトexportは、ResultPageShellでラップし、children部分にStandardResultLayout相当のJSX（DescriptionExpander + CTA1 + detailedContent条件付きセクション）を記述する
- `generateStaticParams`からcontrarian-fortuneとcharacter-fortuneのslugを除外する。registryの`getAllQuizSlugs()`から除外slugリストでフィルタする
- contrarian-fortune/character-fortune固有のimport（不要になったもの）を削除
- `generateMetadata`は実質的に変更不要（contrarian-fortune/character-fortuneのslugでリクエストが来ることはなくなるため）

**page.module.css の変更:**

- Shell共通スタイル（wrapper, card, icon, title, quizName, quizContext, shareSection）はResultPageShell.module.cssに移動済みなので削除する
- StandardResultLayout.module.cssの固有スタイル（traitsList, traitsItem, adviceCard, cta2Section, cta2Link）をpage.module.cssに統合する
- variant-shared content styles（trySection, tryButton, tryCost, detailedSection, detailedSectionHeading, behaviorsList, behaviorsItem）は動的ルートのchildren内で使用するため残す
- CompatibilityDisplayはResultPageShellの`afterShare` propとして渡すため、page.tsx側でインポートしてJSXとして渡す

**opengraph-image.tsx の変更:**

- generateStaticParamsにCONCRETE_ROUTE_SLUGSによる除外フィルタを追加する

**テストの修正（このステップで同時実施し、テストが通る状態を維持する）:**

- `page.test.ts`: StandardResultLayoutのimportチェックを削除し、ResultPageShell使用のチェックに変更
- `page.test.tsx`: contrarian-fortune/character-fortune関連テストスイートを削除

#### ステップ6: \_layouts/ディレクトリ全削除

**削除するディレクトリ:**

- `src/app/play/[slug]/result/[resultId]/_layouts/` ディレクトリ全体
  - `types.ts`
  - `StandardResultLayout.tsx`
  - `StandardResultLayout.module.css`
  - `ContrarianFortuneLayout.tsx`
  - `ContrarianFortuneLayout.module.css`
  - `CharacterFortuneLayout.tsx`
  - `CharacterFortuneLayout.module.css`
  - `__tests__/` ディレクトリ全体（4テストファイル）

注: ステップ5で動的ルートからのimportを先に削除してから、このステップで\_layoutsを削除する。

#### ステップ7: 新規ルートのテスト作成

**注: 動的ルートのテスト修正はステップ5で同時実施済み。各ステップ完了時にテストが通る状態を維持する。**

**新規ルートのテスト:**

- `src/app/play/contrarian-fortune/result/[resultId]/__tests__/page.test.tsx`: contrarian-fortune結果ページのレンダリングテスト。現在の`_layouts/__tests__/ContrarianFortuneLayout.test.tsx`のテストケースを基盤とし、完全に独立したpage.tsxのテストとして書き直す
- `src/app/play/character-fortune/result/[resultId]/__tests__/page.test.tsx`: character-fortune結果ページのレンダリングテスト。現在の`_layouts/__tests__/CharacterFortuneLayout.test.tsx`のテストケースを基盤とし、完全に独立したpage.tsxのテストとして書き直す

#### ステップ8: ビルド・lint・テスト確認

- `npm run lint` が通ること
- `npm run format:check` が通ること
- `npm run test` が通ること
- `npm run build` が通ること（静的生成でcontrarian-fortune/character-fortuneの結果ページが正しくビルドされること）

#### ステップ9: ビジュアル確認

- Playwrightツールで以下のページを確認:
  - `/play/contrarian-fortune/result/{任意のresultId}` -- contrarian-fortune結果ページが正しく表示されること
  - `/play/character-fortune/result/{任意のresultId}` -- character-fortune結果ページが正しく表示されること
  - `/play/{standard系slug}/result/{任意のresultId}` -- 標準結果ページが正しく表示されること（退行がないこと）

### 実施順序

1. ステップ1（ResultPageShellの作成）
2. ステップ2（countCharWidthの切り出し）
3. ステップ3（contrarian-fortune具体的ルート新設）
4. ステップ4（character-fortune具体的ルート新設）
5. ステップ5（動的ルート簡素化 + テスト修正）-- dispatch機構削除、ResultPageShell使用への書き換え、CSS整理、opengraph-image.tsx修正、テスト修正を同時実施
6. ステップ6（\_layouts/ディレクトリ削除）
7. ステップ7（新規ルートのテスト作成）
8. ステップ8（ビルド・lint・テスト確認）
9. ステップ9（ビジュアル確認）

注: ステップ1・2は他のステップの前提となるため先行実施する。ステップ3・4は独立しており並行実施可能。ステップ5はステップ3・4の完成後に実施する。ステップ6（\_layouts削除）はステップ5の完了後に実施する（動的ルートからのimportを先に削除してから\_layoutsを削除する）。各ステップ完了時にテストが通る状態を維持する。

### 共有コードの扱い

**countCharWidth関数:**

- `src/lib/countCharWidth.ts`に切り出す（ステップ2）
- 15行の純粋関数で、variant固有のロジックを含まない汎用ユーティリティ
- SITE_NAMEやBASE_URLと同じレベルの共有であり、ルート間の結合度を高めない

**ResultPageShell:**

- `src/play/quiz/_components/ResultPageShell.tsx`に配置（ステップ1）
- 共通wrapper構造を提供するServer Component。dispatch機構を含まない
- 各ルートのpage.tsxがchildrenとしてvariant固有のJSXを渡す

**DescriptionExpander:**

- 動的ルート内（`src/app/play/[slug]/result/[resultId]/DescriptionExpander.tsx`）に残す
- contrarian-fortune/character-fortuneは使用しないため移動不要

**CompatibilityDisplay:**

- 動的ルート内に残す。music-personalityとcharacter-personalityのみが使用するコンポーネント
- contrarian-fortune/character-fortuneは相性機能を使用しない

**extractWithParam:**

- 動的ルート内に残す。相性機能のsearchParamsパース用

**ShareButtons, RelatedQuizzes, RecommendedContent:**

- 既に共有ディレクトリにあるため変更不要。ResultPageShellから直接importする

### generateStaticParamsの設計

**具体的ルート（contrarian-fortune, character-fortune）:**

```
// resultIdのみを返す（slugは固定パスで決まるため不要）
export function generateStaticParams() {
  return getResultIdsForQuiz("contrarian-fortune").map(id => ({ resultId: id }));
}
```

**動的ルート（[slug]）:**

```
// contrarian-fortuneとcharacter-fortuneを除外する
const CONCRETE_ROUTE_SLUGS = ["contrarian-fortune", "character-fortune"];
export async function generateStaticParams() {
  const params = [];
  for (const slug of getAllQuizSlugs()) {
    if (CONCRETE_ROUTE_SLUGS.includes(slug)) continue;
    for (const resultId of getResultIdsForQuiz(slug)) {
      params.push({ slug, resultId });
    }
  }
  return params;
}
```

除外リストを明示的な定数として定義し、具体的ルートと動的ルートの間で「どのslugがどこで処理されるか」を明確にする。

### OGP画像の扱い

各具体的ルートに`opengraph-image.tsx`を配置する。内容は現在の動的ルートの`opengraph-image.tsx`とほぼ同一だが、slugを固定値にする。動的ルートの`opengraph-image.tsx`はそのまま残し、generateStaticParamsから除外slugをフィルタする。

### 注意点

1. **CSS二重参照の排除**: cycle-143では`_layouts/`コンポーネントが`import pageStyles from "../page.module.css"`で親ディレクトリのCSSを参照していた。本計画ではResultPageShellは自身のCSS Moduleのみを使用し、各ルートのpage.tsxも自身のCSS Moduleのみを使用するため、CSS二重参照は発生しない。

2. **CSS分離の方針**: 共通スタイル（wrapper, card, icon, title等）はResultPageShell.module.cssに集約する。variant固有のスタイル（contrarian-fortuneのcatchphrase, character-fortuneの固有スタイル等）は各ルートのpage.module.cssに定義する。2つのCSS Moduleが独立して存在し、互いに参照しない。

3. **URLの不変性**: Next.jsのファイルシステムルーティングでは、具体的パスが動的`[slug]`より優先されるため、`/play/contrarian-fortune/result/xxx`のURLは変わらない。yolos.net自身に既に前例がある（`/play/daily/`、`/play/kanji-kanaru/`が`/play/[slug]/`と共存）。

4. **Breadcrumbパスの維持**: ResultPageShellがBreadcrumbを描画する。パス構造は現在と同じ（ホーム > 遊ぶ > クイズ名 > 結果）を維持する。

5. **ResultPageShellはcycle-143のA案とは異なる**: A案はpage.tsxがswitch文でどのLayoutを呼ぶか判定するdispatch機構であり、LayoutがページのCSSを逆参照する二重依存を持っていた。ResultPageShellはdispatch機構を含まず（各ルートのpage.tsxが自分でShellを呼ぶ）、children-based compositionで結合度が最小限である。propsもQuizDefinitionとQuizResultをそのまま受け取るだけで、cycle-143のtypes.tsのような複雑な型定義は不要。

6. **CompatibilityDisplayの扱い**: contrarian-fortuneとcharacter-fortuneには相性機能がないため、具体的ルートではCompatibilityDisplayをimportしない。extractWithParamも不要。これにより具体的ルートのコードが大幅に簡素化される。

7. **テストの独立性**: 各ルートのテストは独立して動作する。動的ルートのテストからcontrarian-fortune関連テストを削除し、新しいルートに移植する。テストのmock設定も各ルートで独立して定義する。

### 検討した他の選択肢と判断理由

**A案（cycle-143で実装済み、破棄対象）: 自前dispatch機構**

- page.tsxにswitch文を置き、variant別のLayoutコンポーネントに委譲する方式
- Next.jsのファイルシステムルーティングで自動的にできることを自前で実装してしまった
- dispatch機構、共通props型定義（types.ts）、CSS二重参照（pageStyles import）など不要な複雑さを大量に作り込んだ
- リファクタリング目的（複雑さ削減）に反して、コード総量が601行から969行に増加
- Ownerにより完全な失敗と判定

**共通wrapper構造の完全重複案:**

- wrapper/Breadcrumb/ShareButtons等の共通外側構造を各ルートのpage.tsxに完全に重複して記述する案
- 現時点では3ルートで30-40行 x 3の重複で済むが、B-251〜B-257で合計10ルートに拡大すると、共通変更（フィードバックボタン追加、Breadcrumb変更等）時に10ファイルの手動修正が必要になる
- 修正漏れによるルート間の不整合が来訪者体験を損なうリスクがある
- cycle-143の失敗からの過剰な振り子（overcorrection）であり、本来共有すべきものまで重複させている
- ResultPageShellによるchildren-based compositionの方が、独立性を維持しつつ保守性も確保できるため不採用

**CSS共有ファイル案:**

- contrarian-fortuneとcharacter-fortuneで共通するCSS（midShareSection等）を共有CSSファイルとして切り出す案
- variant固有のスタイルを共有するとcycle-143のpageStyles二重参照と類似の問題を招く
- ただし、全ルート共通のスタイル（wrapper, card等）はResultPageShell.module.cssに自然に集約されるため、この問題は解消される
- variant固有のスタイルの重複は許容する（B-251〜B-257の各variantは意図的にスタイルを変える可能性が高い）

### 計画にあたって参考にした情報

- 現在のpage.tsx（337行）、\_layouts/ディレクトリ（7ファイル + テスト4ファイル）、page.module.css（116行）の全内容を精査
- Next.jsのファイルシステムルーティングの優先度規則（具体的パス > 動的[slug]）
- yolos.net内の既存前例: `/play/daily/`、`/play/kanji-kanaru/`が`/play/[slug]/`と共存している構造
- cycle-143の事故報告書に記載された失敗要因（dispatch機構、共通props型定義、pageStyles二重参照）
- QuizDefinitionの型定義（DetailedContentのdiscriminated union構造）
- registryの全15クイズのslug一覧
- 第3回レビューの指摘: 共通wrapper構造の完全重複はB-251〜B-257で10ルートに拡大した際に深刻な保守性問題を引き起こすため、ResultPageShellとして抽出する

## レビュー結果

### 計画レビュー（第1回）

**レビュー担当:** reviewer
**レビュー日時:** 2026-04-01
**結果:** 改善指示

#### 総合評価

計画の設計方針（B案: Next.jsファイルシステムベースルーティングの活用）はcycle-143の事故報告書の教訓を正しく反映しており、方向性は妥当である。cycle-143で問題となったdispatch機構・共通props型定義・pageStyles二重参照のいずれも計画に含まれておらず、同じ失敗の繰り返しは回避されている。Next.jsの仕様理解も正確であり、yolos.net内の既存前例（`/play/daily/`、`/play/kanji-kanaru/`）との整合性も確認できた。

しかし、以下の指摘事項を修正する必要がある。

#### 指摘事項

**[指摘1] ステップ3の動的ルート簡素化における generateMetadata の修正内容が記載されていない**

計画のステップ3では page.tsx のデフォルトexport（レンダリング）と generateStaticParams の変更について記述があるが、generateMetadata の変更内容が記載されていない。現在の generateMetadata（69-138行目）には以下のcontrarian-fortune/character-fortune依存コードが含まれている:

- 113行目: `const hasDetailedContent = Boolean(result.detailedContent);` -- contrarian-fortuneは常にdetailedContentありなので動的ルート側には影響しないが、character-fortuneも同様。この行自体は汎用的なので残してよい。
- 88-96行目: 相性機能（compatFriendTypeId）の分岐 -- これはmusic-personalityとcharacter-personality用であり、contrarian-fortune/character-fortuneとは無関係なので変更不要。

結論としてgenerateMetadataに大きな変更は不要だが、contrarian-fortuneとcharacter-fortuneのslugでリクエストが来た場合に動的ルートの generateMetadata が呼ばれないことを前提としている旨を明記すべき。また、具体的ルート側のgenerateMetadataの実装詳細（特に、contrarian-fortuneは常にdetailedContentありなので常にindex:trueとなる点、character-fortuneも同様である点）がステップ1・2で言及されているが、searchParams/相性機能を使用しないことの明記が不十分である。具体的ルートのgenerateMetadataにはsearchParamsの処理が不要であることを明記すべき。

**重要度:** 中（builderが現在のgenerateMetadataのsearchParams処理をそのまま具体的ルートにコピーしてしまうリスクがある）

**[指摘2] 具体的ルートのpage.tsxにおけるnotFound()の呼び出し条件が記載されていない**

現在の動的ルートのpage.tsx（153-158行目）では `quizBySlug.get(slug)` と `quiz.results.find(r => r.id === resultId)` の2段階でnotFound()を呼んでいる。具体的ルートでは slug が固定値であるため quizBySlug.get() が失敗することはないが、resultId が不正な場合の notFound() 処理は引き続き必要である。計画にこの点の明記がない。

**重要度:** 中（builderが notFound() を忘れる可能性は低いが、計画として網羅しておくべき）

**[指摘3] countCharWidth の切り出し先パスが不適切**

計画のステップ4では countCharWidth を `src/app/play/[slug]/result/[resultId]/countCharWidth.ts` に切り出すとしている。しかし、この関数は3つのルート（動的ルート、contrarian-fortune、character-fortune）から参照される。contrarian-fortune と character-fortune のpage.tsx からは `../../../[slug]/result/[resultId]/countCharWidth` のような相対パスになり、`[slug]` というディレクトリ名を経由するimportパスが分かりにくい。

より適切な配置先として、以下のいずれかを検討すべき:

- `src/lib/countCharWidth.ts`（汎用ユーティリティとして）
- `src/play/quiz/_utils/countCharWidth.ts`（クイズ関連ユーティリティとして）

もしくは、各ルートのpage.tsxにインラインで定義する（関数は15行程度と小さく、CSS重複と同様に各ルートの完全独立性を優先する方針に沿う）。

**重要度:** 中（importパスの可読性に直接影響する）

**[指摘4] ステップ5の実施順序に関する注意が不足**

計画の「実施順序」セクション（143-154行目）では、ステップ5（\_layouts/ディレクトリ削除）をステップ3（動的ルート簡素化）の完了後に実施するとしている。これは正しいが、ステップ3の作業内容（70行目）に「`_layouts/`への全importを削除」と書かれている一方、page.test.ts（静的解析テスト）に`StandardResultLayout`等のimport検証テストが存在する可能性がある。ステップ3でimportを削除すると、ステップ6（テスト移行）の前にテストが失敗する状態が生じる。

計画では「各ステップは独立してビルド・テストが通る状態を維持する」とは明記されていないが、cycle-143の計画ではこの原則が採用されていた。各ステップ間でテストが通る状態を維持するか、あるいはステップ3と6を統合して同時に実施するかの方針を明記すべき。

**重要度:** 低（実務的にはbuilderが対処可能だが、計画の精度として）

**[指摘5] ステップ1・2で「レンダリングロジックをpage.tsxに直接インライン化する」の意味が曖昧**

ステップ1の記述「現在の`_layouts/ContrarianFortuneLayout.tsx`のレンダリングロジックをpage.tsxに直接インライン化する（別コンポーネントに分離しない）」とあるが、これは以下のどちらを意味しているか不明確:

(a) ContrarianFortuneLayout.tsx のJSX部分だけを新しいpage.tsxのデフォルトexportに埋め込む
(b) 現在のpage.tsx（動的ルート）の共通外側構造（wrapper, Breadcrumb, card, quizName, quizContext, icon, h1, ShareButtons, RelatedQuizzes, RecommendedContent）も含めて、完全に自己完結したpage.tsxを書く

注意点5（198行目）で「共通wrapper構造の重複」に言及されていることから(b)が意図されていると推測できるが、ステップ1・2の本文でこの点を明確にすべき。具体的に、新しいpage.tsxのデフォルトexportの全体構造（wrapper > Breadcrumb > card > quizName > ... > ShareButtons > RelatedQuizzes > RecommendedContent）を記述するか、「現在の動的ルートのpage.tsxの全体構造を基盤とし、dispatch部分をcontrarian-fortune固有のレンダリングに置き換える」のように明示すべき。

**重要度:** 低（注意点5から推測可能だが、明示した方がbuilderの迷いを防げる）

**[指摘6] opengraph-image.tsx の generateStaticParams からの除外slugフィルタが記載されていない**

計画の「OGP画像の扱い」セクション（185-186行目）で「動的ルートの`opengraph-image.tsx`はそのまま残し、generateStaticParamsから除外slugをフィルタする」と書かれているが、ステップ3の変更対象ファイルに `opengraph-image.tsx` が含まれていない。動的ルートの opengraph-image.tsx（現在のファイルの16-24行目）にも CONCRETE_ROUTE_SLUGS による除外フィルタを追加する必要がある。これをステップ3の変更対象に追加すべき。

**重要度:** 中（ビルド時に不要なOGP画像が生成される問題を防ぐため）

#### 修正指示

1. [指摘1] 具体的ルートのgenerateMetadataではsearchParamsの処理が不要であること（相性機能がないため）を明記する。動的ルートのgenerateMetadataは実質的に変更不要であることを確認的に記載する。
2. [指摘2] 具体的ルートのpage.tsxでresultIdが不正な場合のnotFound()処理が必要であることを明記する。
3. [指摘3] countCharWidthの切り出し先パスを再検討し、`[slug]`ディレクトリを経由しないパスにするか、各ルートにインライン定義する方針に変更する。
4. [指摘4] ステップ3でimportを削除した際のテスト整合性について、ステップ3とステップ6の関係性を明記する。
5. [指摘5] ステップ1・2で、新しいpage.tsxが共通外側構造も含めた完全に自己完結したファイルであることを明示する。
6. [指摘6] ステップ3の変更対象ファイルにopengraph-image.tsxを追加し、generateStaticParamsからの除外slugフィルタの追加を記載する。

上記の修正後、再度レビューを実施する。

### 計画レビュー（第2回 — 実装詳細レビュー）

**レビュー担当:** reviewer
**レビュー日時:** 2026-04-01
**結果:** 承認（実装詳細の正確性について）

#### 前回指摘事項の対応確認

6件すべてが適切に修正されていることを確認した。

- **[指摘1] searchParams処理の明記:** ステップ1（39行目）およびステップ2（63行目）で「searchParamsの処理は含めない（contrarian-fortuneには相性がない）」「searchParamsの処理は含めない」と明記されている。ステップ3（83行目）で動的ルートのgenerateMetadataは実質変更不要である旨も記載されている。対応済み。
- **[指摘2] notFound()の明記:** ステップ1（42行目）で「resultIdが不正な場合（quiz.results.find()がundefinedを返す場合）はnotFound()を呼び出す。slugは固定値なのでquizデータ取得の失敗はありえない」と明記されている。ステップ2（64行目）にも同様の記載がある。対応済み。
- **[指摘3] countCharWidthのインライン定義:** ステップ1（41行目）、ステップ2（65行目）、ステップ4（98-100行目）でそれぞれ「各ルートのpage.tsxにインライン定義する」方針が明記されている。`[slug]`ディレクトリを経由するimportパスの問題は解消されている。対応済み。
- **[指摘4] テスト整合性:** ステップ3の変更対象ファイル（73-74行目）にテストファイルが追加され、「テスト修正もこのステップで同時実施」と明記されている。92-94行目にテスト修正の具体的内容が記載されている。ステップ6（131行目）にも「動的ルートのテスト修正はステップ3で同時実施済み」と確認的に記載されている。対応済み。
- **[指摘5] 自己完結したpage.tsxの明示:** ステップ1（40行目）で「wrapper > Breadcrumb > card > quizName > quizContext > icon > h1 > [contrarian-fortune固有JSX] > ShareButtons > RelatedQuizzes > RecommendedContent の完全な構造を含む、自己完結したpage.tsxとする（別コンポーネントに分離しない）」と具体的な全体構造が明記されている。ステップ2（61行目）にも同様の記載がある。対応済み。
- **[指摘6] opengraph-image.tsxの追加:** ステップ3の変更対象ファイル（72行目）にopengraph-image.tsxが追加され、89-91行目で「generateStaticParamsにCONCRETE_ROUTE_SLUGSによる除外フィルタを追加する」と変更内容が明記されている。対応済み。

#### 全体の再確認

**cycle-143と同じ失敗の繰り返しリスク:** なし。cycle-143で問題となった3要素（自前dispatch機構、共通props型定義types.ts、pageStyles二重参照）のいずれも計画に含まれていない。各ルートが完全に自己完結し、CSS Modulesも各ルートに閉じている。

**実施手順の網羅性:** 新規ファイル作成（ステップ1-2）、既存ファイル修正（ステップ3）、不要ファイル削除（ステップ5）、新規テスト作成（ステップ6）、検証（ステップ7-8）の全工程が網羅されている。各ステップの変更対象ファイルが明示されており、漏れは見当たらない。

**ステップ間の整合性:** 実施順序の依存関係が正しい。ステップ1-2（具体的ルート新設）は独立して並行実施可能、ステップ3（動的ルート簡素化+テスト修正）はステップ1-2の完成後、ステップ5（\_layouts削除）はステップ3の完了後。各ステップ完了時にテストが通る状態が維持される設計になっている。

**コード方針の一貫性:** countCharWidthのインライン定義、CSS重複の許容、共通wrapper構造の重複許容、CompatibilityDisplay/extractWithParamの動的ルート残留、ShareButtons等共有コンポーネントの直接import -- すべて「各ルートの完全独立性」の方針に一貫している。

#### 指摘事項

なし。

### 計画レビュー（第3回 — 設計方針の根本レビュー）

**レビュー担当:** reviewer
**レビュー日時:** 2026-04-01
**結果:** 改善指示

#### 総合評価

B案（Next.jsファイルシステムベースルーティングによるルート分離）の方向性自体は正しい。cycle-143の事故報告書の教訓を正確に反映しており、dispatch機構・共通props型定義・pageStyles二重参照のいずれも排除されている。この点は評価できる。

しかし、計画には**cycle-143の失敗からの過剰な振り子（overcorrection）**が見られる。cycle-143の問題は「不要な共有メカニズムを作り込んだ」ことだったが、この計画は「本来共有すべきものまで重複させる」方向に過度に振れている。以下に具体的な指摘と代替案を示す。

#### 指摘事項

**[指摘1] 共通wrapper構造の完全重複は、将来のvariant追加（B-251〜B-257）で深刻な保守性問題を引き起こす（重要度: 高）**

計画では、wrapper > Breadcrumb > card > quizName > quizContext > icon > h1 > ... > ShareButtons > RelatedQuizzes > RecommendedContent という外側の構造を各ルートのpage.tsxに完全に重複して記述するとしている。現時点では3ルート（standard, contrarian-fortune, character-fortune）なので30-40行 x 3 = 90-120行の重複で済むが、バックログにはB-251〜B-257として**7件の追加variant**が予定されている。

B-251〜B-257がすべて実施されると、合計10ルートのpage.tsxのそれぞれに以下の同一構造が重複することになる:

- Breadcrumbのitems配列（4階層）
- quizName/quizContextの表示
- icon/h1の表示
- ShareButtonsの呼び出し（props 5個）
- CompatibilityDisplay（条件付き、該当するクイズのみ）
- RelatedQuizzes/RecommendedContentの呼び出し

例えば「全結果ページにフィードバックボタンを追加したい」「Breadcrumbの構造を変更したい」「ShareButtonsのpropsを変更したい」といった共通変更が発生した場合、10ファイルすべてを手動で同一の変更を行う必要がある。1ファイルでも修正漏れがあればルート間で一貫性が崩れ、来訪者の体験を損なう。

**代替案:** 共通wrapper構造をNext.jsの`layout.tsx`で実現する。具体的には、`src/app/play/[slug]/result/[resultId]/layout.tsx`（およびcontrarian-fortune, character-fortuneの同階層）にwrapper/card/Breadcrumb等の外枠を配置し、各ルートのpage.tsxはvariant固有のコンテンツのみを返す。ただし、layout.tsxではparamsにアクセスしてクイズデータを取得する必要があるため、propsリレーの問題が再発する可能性がある。

より現実的な代替案として、**共通wrapper部分だけを薄いServer Componentとして抽出する**ことを推奨する:

```
// src/play/quiz/_components/ResultPageShell.tsx
// props: quiz, result, children, shareText, shareUrl
// 責務: wrapper, Breadcrumb, card, quizName, quizContext, icon, h1, {children}, ShareButtons, RelatedQuizzes, RecommendedContent
```

このコンポーネントは:

- cycle-143の`types.ts`のような複雑なprops型定義にはならない（QuizDefinitionとQuizResultをそのまま受け取るだけ）
- dispatch機構を含まない（childrenとして各ルート固有のJSXを受け取るだけ）
- CSSの二重参照を発生させない（自身のCSS Moduleのみを使用）

各ルートのpage.tsxは:

```tsx
export default async function ContrarianFortuneResultPage({ params }) {
  const quiz = contrarianFortuneQuiz;
  const result = quiz.results.find(r => r.id === resultId);
  if (!result) notFound();
  return (
    <ResultPageShell quiz={quiz} result={result} ...>
      {/* contrarian-fortune固有のJSX */}
    </ResultPageShell>
  );
}
```

これはcycle-143のA案（dispatch + Layout + types.ts + pageStyles二重参照）とは本質的に異なる。cycle-143の問題は「page.tsxがどのLayoutを呼ぶかを判定するdispatch機構」と「Layoutがpage.tsxのCSSを逆参照する二重依存」だった。ResultPageShellはdispatchを含まず（各ルートのpage.tsxが自分で呼ぶ）、CSSの二重参照もない（Shellは自身のCSSを持ち、各ルートのpage.tsxも自身のCSSを持つ）。

**[指摘2] countCharWidthの3重複はDRY原則の過剰な無視である（重要度: 中）**

countCharWidthは15行の純粋関数で、副作用がなく、variant固有のロジックを一切含まない。Unicode文字幅の判定という汎用的な処理であり、全ルートで完全に同一のコードが使われる。これを3ファイル（将来は10ファイル）にコピーすることは、以下のリスクを生む:

- 文字幅判定のUnicode範囲にバグがあった場合、全ファイルを修正する必要がある
- FULL_WIDTH_LIMITの閾値を変更する場合、全ファイルで同一の変更が必要

cycle-143の問題は「variantのレンダリングロジックを共有するための過剰な抽象化」だった。countCharWidthはvariantのレンダリングロジックではなく、文字幅計算というユーティリティ関数である。これを共有することはcycle-143の失敗パターンとは全く異なる。

**代替案:** `src/lib/countCharWidth.ts` として切り出す。各ルートのpage.tsxから `import { countCharWidth } from "@/lib/countCharWidth"` で参照する。これは`@/lib/constants`からSITE_NAMEやBASE_URLをimportするのと同じレベルの共有であり、ルート間の結合度を高めない。

**[指摘3] CSS重複の許容方針は、将来10ルートに拡大した際にスタイルの一貫性を損なう可能性がある（重要度: 中）**

計画ではcontrarian-fortuneとcharacter-fortuneで共通するCSS（midShareSection, thirdPartySection, allTypesSection等）を両方のpage.module.cssにそれぞれ定義するとしている。現時点では2ルートの重複なので問題は小さいが、B-251〜B-257で新variantが追加されるたびに「既存の似たスタイルをコピーして微調整する」パターンが繰り返されると、ルート間でスタイルが少しずつ乖離し、サイト全体の視覚的一貫性が低下するリスクがある。

ただし、B-251〜B-257の各variantは「このコンテンツ固有の理想形をゼロベースで検討すること」とバックログに明記されているため、意図的にスタイルを変える可能性は高い。そのため、variant固有のスタイル（midShareSection等）の重複は許容してよい。

一方で、wrapper, card, icon, title, quizName, quizContext, shareSection, tryButton等の**全ルート共通のスタイル**まで各ルートにコピーすることは、指摘1と同じ保守性の問題を引き起こす。

**代替案:** 指摘1の代替案（ResultPageShell）を採用する場合、共通スタイルはShellのCSS Moduleに集約され、この問題は自然に解消される。

**[指摘4] バンドルサイズの改善効果が不明確（重要度: 低）**

B-260の目的の一つに「バンドルサイズの最適化」があるが、計画にはバンドルサイズへの影響分析が含まれていない。現在のpage.tsx（337行）はServer Componentであり、クライアントに送信されるJSはほぼない。variant別Layoutコンポーネントも全てServer Componentである。つまり、A案（dispatch）でもB案（ルート分離）でも、クライアントに送信されるバンドルサイズには実質的な差がないと考えられる。

B案の真の利点はバンドルサイズではなく、**コードの単純性と保守性**にある。計画の目的記述からバンドルサイズの主張を除外するか、実際の影響を検証した上で記載すべき。

#### 修正指示

1. **[指摘1への対応]** 共通wrapper構造の扱いを再検討する。以下のいずれかを選択すること:
   - (a) 共通wrapper部分をResultPageShellコンポーネントとして抽出し、各ルートのpage.tsxはchildren経由でvariant固有のJSXのみを提供する
   - (b) 完全重複を維持するが、その場合はB-251〜B-257で合計10ルートになった際の保守性リスクを明示的に受容し、その時点で共通化のリファクタリングを行う旨をキャリーオーバーに記載する

   推奨は(a)。(a)はcycle-143のA案とは異なる — dispatch機構がなく、propsリレーも最小限（quiz/result/shareText/shareUrl程度）で、各ルートの独立性を損なわない。

2. **[指摘2への対応]** countCharWidthを`src/lib/countCharWidth.ts`に切り出す。これはSITE_NAMEやBASE_URLと同じレベルのユーティリティ共有であり、ルート間の結合度を高めない。

3. **[指摘3への対応]** 指摘1で(a)を選択する場合は自然に解消される。(b)を選択する場合は、全ルート共通のスタイル（wrapper, card等）の重複による将来のリスクを明記する。

4. **[指摘4への対応]** 計画の目的記述において、バンドルサイズ最適化が主要な改善点であるかのような記述がある場合は修正する。B案の主な利点はコードの単純性と保守性であることを正確に反映する。

上記の修正後、再度レビューを実施する。指摘1が最も重要であり、この判断が計画全体の質を左右する。

### 計画レビュー（第4回）

**レビュー担当:** reviewer
**レビュー日時:** 2026-04-01
**結果:** 改善指示

#### 前回指摘事項（第3回）の対応確認

4件すべてについて確認した。

- **[指摘1・高] 共通wrapper構造の完全重複 → ResultPageShellとして抽出すべき:** 対応済み。ステップ1（34-58行目）でResultPageShellの作成が明記されている。`src/play/quiz/_components/ResultPageShell.tsx`に配置し、props: `quiz, result, children, shareText, shareUrl`という最小限のインターフェースで、children-based compositionとして設計されている。dispatch機構を含まず、各ルートのpage.tsxが自分でShellを呼ぶ構造になっている。目的セクション（30行目）にもResultPageShellの位置づけとcycle-143 A案との違いが記載されている。対応は適切。

- **[指摘2・中] countCharWidthのインライン定義 → src/lib/に切り出すべき:** 対応済み。ステップ2（60-71行目）で`src/lib/countCharWidth.ts`として切り出すことが明記されている。「SITE_NAMEやBASE_URLと同じレベルの共有であり、ルート間の結合度を高めない」という判断理由も適切。

- **[指摘3・中] CSS共通部分 → ResultPageShellのCSS Moduleに集約すべき:** 対応済み。49-52行目でResultPageShell.module.cssに共通スタイルを集約すると明記されている。ただし、以下の新規指摘1で内容に問題がある。

- **[指摘4・低] バンドルサイズの主張修正:** 対応済み。28行目で「バンドルサイズへの影響は実質的にない」と正確に記述し、主な利点を「コードの単純性と保守性」と位置づけている。

#### 全体の再確認

計画の方向性（B案: ファイルシステムルーティング + ResultPageShell）は正しく、cycle-143の失敗要因を確実に排除している。しかし、以下の2点に設計上の欠落がある。

#### 指摘事項

**[指摘1] ResultPageShell.module.cssに含めるスタイルの分類が誤っている（重要度: 中）**

計画の49-51行目で「共通スタイルを集約: wrapper, card, icon, title, quizName, quizContext, shareSection, trySection, tryButton, tryCost」としているが、trySection/tryButton/tryCostはResultPageShellが直接描画する要素のスタイルではない。

現在のコードを確認すると、trySection/tryButton/tryCostはCTAボタン部分のスタイルであり、各Layoutのchildren内で使用されている（StandardResultLayoutの38-49行目、ContrarianFortuneLayoutの130-141行目）。ResultPageShellの描画範囲は「wrapper > Breadcrumb > card > quizName > quizContext > icon > h1 > {children} > ShareButtons > RelatedQuizzes > RecommendedContent」であり、CTAボタンはchildrenの中に入る。

trySection/tryButton/tryCostをResultPageShell.module.cssに定義した場合、各ルートのpage.tsxのchildren部分からResultPageShellのCSS Moduleをimportする必要が生じる。これは「各ルートのpage.tsxは自身のCSS Moduleのみを参照する」（57行目）というCSS独立性の原則に矛盾し、cycle-143の`pageStyles`二重参照と類似の問題を招く。

同様に、現在のpage.module.cssに定義されているdetailedSection/detailedSectionHeading/behaviorsList/behaviorsItemも、contrarian-fortuneのLayoutとstandardのLayoutの両方がchildren内で使用しているスタイルである。これらの移行先が計画に明記されていない。

**修正案:** ResultPageShell.module.cssには、Shellが直接描画する要素のスタイルのみを含める（wrapper, card, icon, title, quizName, quizContext, shareSection）。trySection/tryButton/tryCost/detailedSection/detailedSectionHeading/behaviorsList/behaviorsItemは各ルートのpage.module.cssにそれぞれ定義する（CSS重複の許容方針に沿う）。計画の49-51行目と149行目を修正し、各ルートのpage.module.cssに含まれるスタイルのリストも更新すること。

**[指摘2] CompatibilityDisplayの配置がResultPageShellの構造と矛盾する（重要度: 中）**

現在のpage.tsx（310-330行目）では、card div内でShareButtonsの後にCompatibilityDisplayが配置されている。しかし、ResultPageShellの構造（46行目）は「{children} > ShareButtons > RelatedQuizzes > RecommendedContent」であり、CompatibilityDisplayの配置場所が存在しない。

動的ルート（[slug]）ではmusic-personalityとcharacter-personalityの2クイズでCompatibilityDisplayが必要であり、これはShareButtonsとRelatedQuizzesの間に配置される必要がある（現在のコードの通り）。具体的ルート（contrarian-fortune, character-fortune）ではCompatibilityDisplayは不要である。

このままではステップ5で動的ルートをResultPageShellに書き換える際に、CompatibilityDisplayの配置場所がなくなる。

**修正案:** 以下のいずれかを選択すること。

(a) ResultPageShellにオプショナルなprops `afterShare?: React.ReactNode` を追加し、ShareButtonsの後に任意のコンテンツを挿入できるslotを設ける。動的ルートのpage.tsxではこのslotにCompatibilityDisplayを渡す。具体的ルートでは省略する。propsの追加は1つだけであり、複雑さの増加は最小限。

(b) CompatibilityDisplayもchildrenの一部とする。ただし、この場合ShareButtonsの前に表示されることになり、現在のレイアウト（ShareButtonsの後にCompatibility）と順序が変わる。来訪者の体験が変わるため非推奨。

(c) ResultPageShellの共通構造からShareButtonsを外し、children内に各ルートが個別にShareButtonsを配置する。ただし、ShareButtonsは全ルート共通の呼び出しであり、ResultPageShellに含める方が保守性が高いため非推奨。

推奨は(a)。afterShareはオプショナルなReact.ReactNodeであり、cycle-143のtypes.tsのような複雑なprops型定義とは性質が全く異なる。

#### 修正指示

1. **[指摘1への対応]** ResultPageShell.module.cssに含めるスタイルを修正し、Shellが直接描画する要素のスタイルのみに限定する。trySection/tryButton/tryCost/detailedSection/detailedSectionHeading/behaviorsList/behaviorsItemは各ルートのpage.module.cssに定義する方針に変更する。関連するステップの変更対象CSSリストも更新する。

2. **[指摘2への対応]** ResultPageShellの構造にCompatibilityDisplayの配置場所を設ける。具体的な方式（afterShare slot等）を明記し、動的ルートのステップ5での実装方法もあわせて記載する。

上記の修正後、再度レビューを実施する。

1. plannerに修正作業をさせること。
2. 修正後、もう一度レビューを依頼すること。その際、前回の指摘事項だけでなく全体の見直しも含めること。

### 計画レビュー（第5回）

**レビュー担当:** reviewer
**レビュー日時:** 2026-04-01
**結果:** 承認

#### 前回指摘事項（第4回）の対応確認

2件すべてが適切に修正されていることを確認した。

- **[指摘1・中] ResultPageShell.module.cssに含めるスタイルの分類が誤っている:** 対応済み。49-53行目で「Shellが直接描画する要素のスタイルのみを集約: wrapper, card, icon, title, quizName, quizContext, shareSection」と修正されている。続けてtrySection/tryButton/tryCost, detailedSection/detailedSectionHeading, behaviorsList/behaviorsItemはShell自身が描画する要素ではないため含めないことが明記され、各ルートのpage.module.cssに定義する方針が記載されている。ステップ3のcontrarian-fortune page.module.css（107-109行目）にもvariant-shared content styles（trySection, tryButton, tryCost等）を含める旨が記載されており、整合している。ステップ5の動的ルートpage.module.css（154行目）にもこれらのスタイルを残す旨が記載されている。CSS独立性の原則（57-59行目）との矛盾は解消されている。

- **[指摘2・中] CompatibilityDisplayの配置がResultPageShellの構造と矛盾する:** 対応済み。42行目のpropsに`afterShare?: React.ReactNode`が追加されている。46行目の描画構造に`{afterShare}`がShareButtonsの後に配置されている。46-47行目で「動的ルートではCompatibilityDisplayをここに渡す。具体的ルートではこのpropを省略する」と具体的な使い方が明記されている。155行目のステップ5でも「CompatibilityDisplayはResultPageShellのafterShare propとして渡すため、page.tsx側でインポートしてJSXとして渡す」と実装方法が記載されている。afterShareはオプショナルなReactNodeであり、cycle-143のtypes.tsの複雑なprops型定義とは性質が全く異なるため、設計上問題ない。

#### 全体の再確認

**目的達成度:** 計画はcycle-143の失敗要因（dispatch機構、共通props型定義types.ts、CSS二重参照pageStyles import）を確実に排除しつつ、ResultPageShellによる共通構造の一元管理でB-251〜B-257への拡張にも安全に対応できる設計となっている。来訪者にとっての価値（結果ページの品質と一貫性の維持）を支える保守性の向上が達成される。

**ResultPageShellの設計:** propsは最小限（quiz, result, children, shareText, shareUrl, afterShare）で、dispatch機構を含まず、children-based compositionにより各ルートの独立性を維持している。afterShareは唯一のオプショナルslotであり、複雑さの増加は許容範囲内。CSS二重参照も発生しない。

**CSS分離の整合性:** Shell CSS（wrapper, card, icon, title, quizName, quizContext, shareSection）/ 各ルートCSS（variant固有 + variant-shared content styles）の分類は正確で、Shellが描画する要素とchildren内の要素が明確に分離されている。

**技術的正確性:** ファイルパス、generateStaticParamsの設計、CONCRETE_ROUTE_SLUGSによる除外リスト、opengraph-image.tsxの対応、テスト修正のタイミング、実施順序の依存関係はすべて正確。

**留意事項（指摘には該当しないが記録として）:** 45行目の描画構造の表記「wrapper > Breadcrumb > card > quizName > quizContext > icon > h1 > {children} > ShareButtons > {afterShare} > RelatedQuizzes > RecommendedContent」は描画順序を示しているが、DOM階層の表現としては曖昧である（現在のpage.tsxではRelatedQuizzesとRecommendedContentはcard divの外側、wrapper divの直下に配置されている）。builderは現在のpage.tsxのDOM構造を参照して実装するため実害は低く、ステップ9のビジュアル確認でも検出可能であるため、指摘事項とはしない。

### 成果物レビュー（第1回）

**レビュー担当:** reviewer
**レビュー日時:** 2026-04-01
**結果:** 承認

#### 検証結果

**1. ビルド・テスト・lint・formatチェック:**

`npm run lint`, `npm run format:check`, `npm run test`（238ファイル/3207テスト全通過）, `npm run build` の全てが成功。ビルド出力にて、contrarian-fortune/character-fortuneの結果ページが `● (SSG)` として正しくプリレンダリングされていることを確認。動的ルート `/play/[slug]/result/[resultId]` は `f (Dynamic)` としてサーバーサイドレンダリングで引き続き機能する。

**2. 目的達成度 -- cycle-143の失敗要因の排除:**

- **dispatch機構:** 完全に排除。ResultPageShellはchildren-based compositionのみで構成されており、variantを判定するswitch文やdispatch関数は存在しない。
- **共通props型定義:** 排除。cycle-143のtypes.tsに相当する複雑な型定義は存在せず、ResultPageShellのpropsはquiz, result, children, shareText, shareUrl, afterShareの6つのみで最小限。
- **CSS二重参照:** 排除。ResultPageShell.module.cssはShellが直接描画する要素（wrapper, card, icon, title, quizName, quizContext, shareSection）のみを定義。各ルートのpage.module.cssはvariant固有のスタイルのみを定義。相互参照はない。
- **\_layoutsディレクトリ:** 完全に削除されていることを確認（`ls` コマンドで `No such file or directory` を確認）。

**3. 将来の拡張性:**

B-251〜B-257で新variantを追加する場合、以下の作業で済む構造になっている:

- `src/app/play/[new-slug]/result/[resultId]/page.tsx` を新規作成し、ResultPageShellでラップ
- 同ディレクトリに `page.module.css` と `opengraph-image.tsx` を追加
- テストファイルを追加
- 動的ルートの `CONCRETE_ROUTE_SLUGS` 配列に新slugを追加

この手順は明確で、既存ファイルへの変更は `CONCRETE_ROUTE_SLUGS` の1行追加のみ。

**4. 保守性:**

共通変更（フィードバックボタン追加、Breadcrumb変更等）はResultPageShell.tsxの1箇所で行える。afterShareスロットにより、動的ルートのCompatibilityDisplay表示にも対応済み。

**5. 来訪者への影響:**

- **URL不変:** Next.jsのファイルシステムルーティングにより、`/play/contrarian-fortune/result/[resultId]` と `/play/character-fortune/result/[resultId]` は具体的ルートが優先される。URLは変更されていない。
- **表示の退行なし:** Playwrightによるビジュアル確認を実施。contrarian-fortune（reverseoptimist）、character-fortune（commander）、動的ルート（music-personality/festival-pioneer）の3ページすべてが正しく表示されることを確認。Breadcrumb, クイズ名, アイコン, h1, variant固有コンテンツ, シェアボタン, 関連クイズ, おすすめコンテンツがすべて正しく配置されている。

**6. テストカバレッジ:**

- `ResultPageShell.test.tsx`: 10テスト。quiz名/shortDescription表示、h1レンダリング、アイコン有無、children透過、ShareButtonsのprops、afterShareの有無、Breadcrumb、RelatedQuizzes、RecommendedContentを網羅。
- `contrarian-fortune/page.test.tsx`: 10テスト。基本構造、catchphrase、coreSentence、behaviors、persona、thirdPartyNote、humorMetrics（存在/不在）、全タイプ一覧、CTA、notFoundを網羅。
- `character-fortune/page.test.tsx`: 10テスト。基本構造、characterIntro、CTA1、behaviors、characterMessage、thirdPartyNote、compatibilityPrompt、全タイプ一覧、CTA、notFoundを網羅。
- `countCharWidth.test.ts`: 4テスト。半角、全角、混在、空文字列を網羅。

**7. コード品質:**

- 型安全性: `type Props` が正しく定義され、`as const` によるvariant型ナローイングも適切。
- コメント: 各ファイルに設計意図を説明するコメントが記載されている。
- 一貫性: contrarian-fortuneとcharacter-fortuneの構造パターン（定数SLUG/quiz, generateStaticParams, generateMetadata, デフォルトexport）が統一されている。

**8. generateStaticParamsの除外フィルタ:**

動的ルートのpage.tsx（26行目）とopengraph-image.tsx（20行目）の両方で `CONCRETE_ROUTE_SLUGS = ["contrarian-fortune", "character-fortune"]` による除外が正しく適用されている。

#### 指摘事項

なし。

## キャリーオーバー

- なし。すべての計画タスクが完了した。

## 補足事項

- B-251〜B-257で新variantを追加する際の手順: (1) `src/app/play/[new-slug]/result/[resultId]/` にpage.tsx + page.module.css + opengraph-image.tsxを作成し、ResultPageShellでラップ (2) テストファイルを追加 (3) 動的ルートの`CONCRETE_ROUTE_SLUGS`に新slugを追加。既存ファイルへの変更は`CONCRETE_ROUTE_SLUGS`の1行追加のみ。

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
