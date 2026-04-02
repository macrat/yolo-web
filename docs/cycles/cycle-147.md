---
id: 147
description: "結果体験の再設計: animal-personality（B-265）"
started_at: "2026-04-02T15:03:37+0900"
completed_at: null
---

# サイクル-147

animal-personality（動物性格診断）の結果ページ体験をゼロから再設計する。受検者本人・第三者（シェアリンク経由）・両者の会話の3シナリオについて、来訪者にとっての最高の体験をconstitutionに基づいて検討し、ページ構成・コンテンツ構成・文体を決定して実装する。現状のフィールド構成やページ構成を所与としない。

## 実施する作業

- [x] animal-personalityの現状の結果ページ・データ構造・コンテンツを全面的に把握する
- [x] 受検者本人・第三者・会話の3シナリオにおける理想体験をゼロベースで設計する
- [x] detailedContent構造の設計（型定義・フィールド構成）
- [x] 12結果タイプ分のコンテンツを作成する
- [x] 受検者向けResultCard表示を実装する
- [x] 第三者向け結果ページを実装する
- [x] テスト・ビルド・lint・formatチェックを通す
- [x] 実装のレビューを受ける
- [x] Playwrightで視覚確認する（スマホ375px幅を含む）

## 作業計画

### 目的

animal-personality（動物性格診断、12結果タイプ）の結果体験を、来訪者にとっての最高の価値を基準としてゼロから再設計する。受検者本人・第三者（シェアリンク経由）・両者の会話の3シナリオすべてにおいて、情報の非対称性による不快感をなくし、「まさに自分だ」という納得感と「友達にも診断させたい」という自然な動機を最大化する。

### 設計方針

#### 3シナリオの体験設計

**1. 受検者本人（ResultCard）**

認知的興奮が最高潮の瞬間に、以下の順序で体験を提供する。

1. アイコン + タイトル（「ニホンザル -- 温泉を発明した革命児」）: 第一印象のインパクト
2. キャッチコピー（新フィールド `catchphrase`、1文20-40字）: 核心を一文で伝える。79%がスキャンのみという来訪者心理に対応し、「自分に当てはまる核心の一文」を最初に提示する
3. description: 動物の生態と性格の関連づけ（現状のものをベースに調整）
4. 強み・弱み（新フィールド `strengths` / `weaknesses`、各2-3項目）: バーナム効果を活用し、ポジティブだけでなく「少しの自虐」も含めることで「まさに自分だ」感を高める。受検者も第三者も同じ内容を読む
5. あるある行動パターン（`behaviors`、4項目）: 共感のピーク。現状のコンテンツを活用
6. 今日のアクション（`todayAction`、旧`advice`をリネーム・調整、1文）: 具体的で即実行可能なアクション提案
7. 相性セクション（既存のcompatibilityMatrix活用、ResultCard内に統合）: referrerがいる場合は相性結果を表示、いない場合は「友達に診断を送る」ボタン。自己理解コンテンツ（strengths -> weaknesses -> behaviors -> todayAction）の流れが一続きで完結した後に、他者との関係性である相性に移る方が自然。現在 `AnimalPersonalityResultExtra` が `ResultExtraLoader.tsx` 経由でResultCardの外側にレンダリングしている相性セクションを、新variantのResultCard rendering内に統合する。これにより `AnimalPersonalityResultExtra` および `ResultExtraLoader` のanimal-personality分岐は不要になるため削除する。referrerTypeIdはQuizContainerからResultCardに新propとして渡す（QuizContainerは既にreferrerTypeIdを保持している）
8. 全タイプ一覧セクション: 12タイプの動物アイコン+タイトルのリスト。現在のタイプをハイライト表示。「他の動物も見てみたい」需要に応える。character-fortune専用ルートの全タイプ一覧セクションと同様のパターンで実装する
9. ShareButtons: 結果を十分理解した後に自然にシェアボタンが視界に入る位置
10. もう一度挑戦するボタン

**2. 第三者（シェアリンク経由、結果ページ）**

第三者は「友達がシェアした結果」または「検索から来た」来訪者。彼らにとっての価値は「この診断は面白そう、自分もやりたい」と思うこと。

1. クイズ名 + shortDescription（コンテキスト）
2. アイコン + タイトル
3. キャッチコピー（`catchphrase`）: 受検者と同じ
4. DescriptionExpander（長いdescriptionは折りたたみ）
5. CTA1: 「あなたはどのタイプ? 診断してみよう」
6. 強み・弱み（`strengths` / `weaknesses`）: 受検者と同じ内容。第三者が読んでも「○○さんってこういう人だよね」と会話のネタになる
7. あるある行動パターン（`behaviors`）: 受検者と同じ
8. 今日のアクション（`todayAction`）: 受検者と同じ
9. 相性紹介（`with`パラメータがある場合はCompatibilityDisplay）
10. 全タイプ一覧セクション: 12タイプの動物アイコン+タイトルのリスト。現在のタイプをハイライト表示
11. CTA2: テキストリンク形式
12. ShareButtons

重要な設計判断: **受検者と第三者で同一のコンテンツを表示する。** 情報の非対称性を完全に排除する。現状のtraitsは分析レポート文体で受検者に不自然だったが、新フィールド構成（strengths/weaknesses）は受検者が読んでも第三者が読んでも自然な文体で統一する。

**3. 両者の会話**

受検者と第三者が同じコンテンツを読んでいるため、会話が自然に成立する。「強みに書いてあった『偶然の発見を文化に変える力』って、お前のことだよな」のような具体的な会話が生まれる。弱みの共有も「自虐ネタ」として会話を盛り上げる素材になる。

#### コンテンツ設計（新フィールド構成）

現状の `traits` / `behaviors` / `advice` を以下に再構成する。

| フィールド    | 型                    | 内容                                           | 文体                                                       | 受検者表示 | 第三者表示 |
| ------------- | --------------------- | ---------------------------------------------- | ---------------------------------------------------------- | ---------- | ---------- |
| `catchphrase` | `string`              | タイプの核心を一文で（20-40字）                | 体言止めまたは短文                                         | o          | o          |
| `strengths`   | `string[]`（2-3項目） | このタイプの強み                               | 「～できる」「～がある」（主語なし、受検者も第三者も自然） | o          | o          |
| `weaknesses`  | `string[]`（2-3項目） | このタイプの弱み（自虐的だが愛嬌がある書き方） | 同上                                                       | o          | o          |
| `behaviors`   | `string[]`（4項目）   | あるある行動パターン                           | 現状維持（主語省略のあるある形式）                         | o          | o          |
| `todayAction` | `string`              | 今日試してほしい具体的アクション（1文）        | 語りかけ                                                   | o          | o          |

`traits`（現4項目）は `strengths`（2-3項目）と `weaknesses`（2-3項目）に分解・再作成する。現状のtraitsは分析レポート文体の体言止めだが、新フィールドは受検者にも第三者にも自然な文体で統一する。**既存traitsの情報を全てstrengths/weaknessesのいずれかに反映すること。** traitsに含まれている情報が新フィールドへの変換時に消失しないよう、変換前後の対応を確認する。

`advice`は`todayAction`にリネームし、より具体的で即実行可能な内容に調整する。

`behaviors`は現状のコンテンツをそのまま活用する（受検者が読んで自然な文体で既に書かれている）。

#### 型設計: 新variant `animal-personality` を定義する

Standard variantを変更すると他の6クイズに影響するため、animal-personality専用の新variantを定義する。

```
interface AnimalPersonalityDetailedContent {
  variant: "animal-personality";
  catchphrase: string;
  strengths: string[];
  weaknesses: string[];
  behaviors: string[];
  todayAction: string;
}
```

`DetailedContent` union型にこの新型を追加する。exhaustive checkにより、ResultCard・結果ページの両方でコンパイル時に対応漏れを検出できる。

#### 既存Standard variantへの影響回避

- `QuizResultDetailedContent`（Standard variant）は一切変更しない
- `DetailedContent` union型に `AnimalPersonalityDetailedContent` を追加するのみ
- 他の6クイズ（music-personality, traditional-color等）のデータ・表示には影響しない
- ResultCardの `renderDetailedContent` に `case "animal-personality":` を追加
- 第三者向け結果ページは、animal-personality専用の具体ルート（`src/app/play/animal-personality/result/[resultId]/page.tsx`）を新規作成し、動的ルートの `CONCRETE_ROUTE_SLUGS` に `"animal-personality"` を追加

### 作業内容

#### ステップ1: 型定義の追加

- `src/play/quiz/types.ts` に `AnimalPersonalityDetailedContent` インターフェースを追加
- `DetailedContent` union型に追加
- `CompatibilityEntry` 型は既存のまま使用

対象ファイル:

- `src/play/quiz/types.ts`

#### ステップ2: 12タイプ分のコンテンツ作成

animal-personality.ts の各結果の `detailedContent` を新variant形式に書き換える。

**既存Standard variant形式から新variant形式へのフィールド変換リスト:**

- `variant: undefined` → `variant: "animal-personality"` を追加
- `traits: string[]` → `strengths: string[]` + `weaknesses: string[]` に分解
- `behaviors: string[]` → そのまま維持
- `advice: string` → `todayAction: string` にリネーム・内容調整
- `catchphrase: string` を新規追加

**コンテンツ作成方針:**

- **1タイプずつ個別に作成する。** 12タイプを一括で作成すると品質が均一化しやすく、各タイプの個性が薄れる。constitution Rule 4（品質優先）に基づき、1タイプごとに以下のプロセスを踏む:
  1. 既存のdescription・traits・behaviors・adviceを読み込み、そのタイプの個性を把握
  2. catchphrase: タイトルのサブタイトル部分（例: 「温泉を発明した革命児」）とは異なる切り口で、性格の核心を一文で表現
  3. strengths: 現traitsの肯定的側面を抽出・再構成。受検者が読んで「そうそう、これが自分の良いところ」と感じる文体。**既存traitsの情報を全てstrengths/weaknessesのいずれかに反映すること（情報消失の禁止）**
  4. weaknesses: 現traitsの課題的側面を抽出・再構成。自虐的だが愛嬌のある書き方で、読んで不快にならない。**既存traitsの情報を全てstrengths/weaknessesのいずれかに反映すること（情報消失の禁止）**
  5. behaviors: 現状のコンテンツをそのまま維持（文体が既に適切）
  6. todayAction: 現adviceをベースに、より具体的で即実行可能な1文に調整
- **ただし、実装効率のため3-4タイプずつのバッチで1つのサブエージェントに委託してもよい。** その場合も、サブエージェント内で1タイプずつ順番に作成し、前のタイプとの差別化を意識すること。1バッチの中で全タイプを並列に考えない

対象ファイル:

- `src/play/quiz/data/animal-personality.ts`

#### ステップ3: 受検者向けResultCard表示の実装

ResultCardに `case "animal-personality":` のレンダリングを追加する。

**表示順（体験設計セクションと整合）:**

catchphraseはdescriptionの前に表示する。現状のResultCardのJSX構造では `description` の後に `detailedSection` がレンダリングされるため、catchphraseを `description` の前に挿入する必要がある。実装方法: `renderDetailedContent` の戻り値として `{ before: ReactNode, after: ReactNode }` を返すパターンに変更するか、または `renderAnimalPersonalityContent` から返すJSX内でResultCardのdescription表示位置より前に配置するため、ResultCardコンポーネント自体を修正してdetailedContent variantに応じてcatchphraseをdescriptionの前に挿入する仕組みを追加する。

ResultCard内での表示順（体験設計セクションの項目1-10と完全に整合）:

1. アイコン + タイトル（既存）
2. catchphrase（キャッチコピー、descriptionの前。見出しなし、目立つスタイル）
3. description（既存）
4. strengths（見出し: 「このタイプの強み」、見出し文字列は直接定義する）
5. weaknesses（見出し: 「このタイプの弱み」、見出し文字列は直接定義する）
6. behaviors（見出し: 「この動物に似た行動パターン」、見出し文字列は直接定義する）
7. todayAction（見出し: 「今日試してほしいこと」、見出し文字列は直接定義する）
8. 相性セクション（referrerTypeIdの有無に応じて相性表示またはInviteFriendButton）
9. 全タイプ一覧セクション（12タイプの動物アイコン+タイトルのリスト。現在のタイプをハイライト表示。character-fortune専用ルートの `allTypesSection` パターンを参考に実装）
10. ShareButtons（既存）
11. もう一度挑戦するボタン（既存）

**相性セクションの統合:**

現在 `AnimalPersonalityResultExtra` が `ResultExtraLoader.tsx` 経由でResultCardの外側にレンダリングしている相性セクション（CompatibilitySection + InviteFriendButton）を、新variantのResultCard rendering内に統合する。

- ResultCardに `referrerTypeId` propを新規追加する（optional）
- QuizContainer.tsxで既にreferrerTypeIdをpropsとして保持しているため、`<ResultCard>` 呼び出し箇所に `referrerTypeId={referrerTypeId}` を追加してResultCardに渡す
- `renderAnimalPersonalityContent` 内で、referrerTypeIdの有無に応じて相性表示またはInviteFriendButtonを表示する
- 統合後、`AnimalPersonalityResultExtra` コンポーネントは削除する
- `ResultExtraLoader.tsx` のanimal-personality分岐を削除する

スタイリングは既存のResultCard.module.cssを拡張する。catchphraseスタイルはcontrarian-fortuneで既に定義済みなので再利用可能。strengths/weaknessesリストは既存のbehaviorsListスタイルをベースに、区別がつくよう微調整する。

対象ファイル:

- `src/play/quiz/_components/ResultCard.tsx`
- `src/play/quiz/_components/ResultCard.module.css`
- `src/play/quiz/_components/QuizContainer.tsx`（ResultCardへのreferrerTypeId prop追加）
- `src/play/quiz/_components/AnimalPersonalityResultExtra.tsx`（削除）
- `src/play/quiz/_components/ResultExtraLoader.tsx`（animal-personality分岐を削除）

#### ステップ4: 第三者向け結果ページの実装

animal-personality専用の具体ルートを新規作成する。character-fortune専用ルート（`src/app/play/character-fortune/result/[resultId]/page.tsx`）をパターンとして参考にする。

表示構成（体験設計セクションと整合。見出し文字列は直接定義する）:
※ ResultPageShellが提供する共通要素（ShareButtons、もう一度挑戦する等）を除いた、animal-personality固有のコンテンツのみを記載。

1. ResultPageShell（共通wrapper）
2. catchphrase（キャッチコピー。DescriptionExpanderの前に配置し、第一印象を与える）
3. DescriptionExpander（長いdescriptionは折りたたみ）
4. CTA1: 「あなたはどのタイプ? 診断してみよう」
5. strengths / weaknesses
6. behaviors
7. todayAction
8. 相性紹介（`with`パラメータがある場合はCompatibilityDisplay。animal-personalityにはcompatibilityMatrixがあるため）
9. 全タイプ一覧セクション（12タイプの動物アイコン+タイトルのリスト。現在のタイプをハイライト表示。character-fortune専用ルートの `allTypesSection` パターンを参考に実装）
10. CTA2: テキストリンク形式

動的ルートからの除外:

- `src/app/play/[slug]/result/[resultId]/page.tsx` の `CONCRETE_ROUTE_SLUGS` に `"animal-personality"` を追加

対象ファイル:

- `src/app/play/animal-personality/result/[resultId]/page.tsx`（新規作成）
- `src/app/play/animal-personality/result/[resultId]/page.module.css`（新規作成。character-fortuneのスタイルを参考に）
- `src/app/play/[slug]/result/[resultId]/page.tsx`（CONCRETE_ROUTE_SLUGS追加のみ）

#### ステップ5: OGP画像の対応

animal-personalityの結果ページOGP画像は既に動的ルート経由で生成されている（`.next/server/app/play/animal-personality/result/*/opengraph-image.*` が存在）。具体ルートに移行するため、OGP画像の生成も具体ルート側に移す必要がある。

既存のOGP画像生成パターン（character-fortune等）を参考にopengraph-image.tsxを追加する。

対象ファイル:

- `src/app/play/animal-personality/result/[resultId]/opengraph-image.tsx`（新規作成）
- `src/app/play/[slug]/result/[resultId]/opengraph-image.tsx`（CONCRETE_ROUTE_SLUGS に `"animal-personality"` を追加）

#### ステップ6: テスト実装

- 型テスト: 新variantの型定義が正しくdiscriminated unionとして機能することを確認
- コンテンツテスト: 12タイプすべてに必須フィールドが存在し、文字数制約を満たすことを確認
- コンポーネントテスト: ResultCardのanimal-personality variant renderingのスナップショットテスト
- 結果ページテスト: 専用ルートが正しく12タイプ分のパラメータを生成し、レンダリングできることを確認
- ResultExtraLoaderテスト更新: `src/play/quiz/_components/__tests__/ResultExtraLoader.test.tsx` にanimal-personality用テストが既に存在する。animal-personality分岐の削除に伴い、このテストを更新する（animal-personalityスラグでnullが返ることを確認するテストに変更、またはテスト自体を削除）
- ビルド・lint・formatチェック: `npm run lint && npm run format:check && npm run test && npm run build` が成功

対象ファイル:

- `src/play/quiz/data/__tests__/animal-personality.test.ts`（新規または既存拡張）
- `src/play/quiz/_components/__tests__/ResultCard.test.tsx`（既存拡張）
- `src/play/quiz/_components/__tests__/ResultExtraLoader.test.tsx`（既存更新: animal-personality分岐削除に伴う修正）
- `src/app/play/animal-personality/result/[resultId]/__tests__/page.test.tsx`（新規作成）

#### ステップ7: Playwrightによる視覚確認

- デスクトップ幅で受検者向けResultCardの表示を確認
- スマホ375px幅で受検者向けResultCardの表示を確認（スクロール量が適切か）
- 第三者向け結果ページ（12タイプ中2-3タイプ）の表示を確認
- 相性表示（`with`パラメータ付き）の表示を確認

### 検討した他の選択肢と判断理由

#### 選択肢A: Standard variantを拡張して対応する

Standard variantに `catchphrase`, `strengths`, `weaknesses` 等を追加する案。却下理由: Standard variantは他の6クイズでも使用されており、フィールド追加は全クイズに影響する。animal-personalityの体験に最適化されたフィールド構成は他クイズと共通化すべきでない（constitution Rule 4: 各コンテンツの最高品質追求）。

#### 選択肢B: 受検者と第三者で異なるコンテンツを表示する

現状の設計（traitsは第三者のみ表示、behaviorsは受検者のみ表示など）を維持・拡張する案。却下理由: 情報の非対称性の3パターン検証（タスク背景参照）で指摘されたとおり、受検者と第三者が異なる情報を読むと会話が噛み合わなくなる、ネガティブな内容を第三者だけが見て悲しい思いをする等のリスクがある。全フィールドを両者で共有し、文体を統一することで解決する。

#### 選択肢C: コンテンツを一括で12タイプ分作成する

効率を優先し、12タイプのコンテンツを1つのプロンプトで一括生成する案。却下理由: 一括生成は品質が均一化しやすく、各タイプの個性が薄れる。constitution Rule 4に基づき、1タイプずつ（またはバッチでも順番に1タイプずつ）丁寧に作成する。

#### 選択肢D: 既存の動的ルートのままanimal-personalityの新variant表示に対応する

CONCRETE_ROUTE_SLUGSに追加せず、動的ルート内でvariant分岐する案。却下理由: cycle-144でdispatch機構（A案）が全面破棄された経緯があり、動的ルート内でのvariant分岐は複雑化のリスクがある。具体ルートの方がシンプルで保守しやすい。

### 計画にあたって参考にした情報

- cycle-146の体験設計方針と申し送り（`docs/cycles/cycle-146.md`）
- cycle-144のルート設計の結論: 具体ルート + ResultPageShellパターン
- 競合分析の知見: 16Personalities（10以上のセクション、強み弱み両方）、16TEST（相性16パターン、偉人・アニメキャラ）、BuzzFeed/vonvon（OGP画像+シェア前提設計）
- 来訪者心理の知見: 79%がスキャンのみ、「自分に当てはまる核心の一文」を求める、納得感の閾値を超えた瞬間にシェア動機が発生
- 情報の非対称性の3パターン検証結果: 受検者と第三者で異なるコンテンツを見せることのリスク
- 既存のcompatibilityMatrix（78通りの相性データ）: 既に受検者向けで活用済み（AnimalPersonalityResultExtra）、第三者向けでも`with`パラメータで活用
- character-fortune専用ルートの実装パターン（`src/app/play/character-fortune/result/[resultId]/page.tsx`）
- [16TEST 動物タイプ一覧](https://16test.uranaino.net/animals/) - 動物16タイプ + 相性情報の構成を参考

## レビュー結果

### 計画レビュー（4回）

- **R1**: 7件の指摘（相性セクション統合設計の欠落、表示順不整合、全タイプ一覧欠落、traits情報消失リスク、不要ステップ、テスト漏れ等）→ 全修正
- **R2**: 4件の指摘（twitter-image不要、全タイプ一覧のステップ反映漏れ、相性セクション位置整理、OGP CONCRETE_ROUTE_SLUGS漏れ）→ 全修正
- **R3**: 3件の指摘（QuizContainerのreferrerTypeId明記、ステップ4のShareButtons注記、フィールド変換リスト追加）→ 全修正
- **R4**: 指摘事項なし。承認

### 実装レビュー（2回）

- **R1**: 3件の指摘（catchphrase句読点不統一、hondo-ten behaviors重複、JSDocコメント不一致）→ 全修正
- **R2**: 指摘事項なし。承認

### Playwright視覚確認

- デスクトップ: 受検者向けResultCard正常表示確認
- モバイル375px: 受検者向けResultCard正常表示確認
- 第三者向けページ（nihon-zaru）: 正常表示確認
- 相性表示（iriomote-yamaneko?with=nihon-zaru）: 正常表示確認

## キャリーオーバー

- なし

## 補足事項

- animal-personalityは他の11クイズに先駆けてanimal-personality専用variant + 専用具体ルートのパターンを確立した。B-266〜B-276の他クイズの再設計時にはこのパターンを参考にできる
- AnimalPersonalityResultExtra.tsx を削除し、相性セクションをResultCard内に統合した。これによりResultExtraLoaderのanimal-personality分岐も不要になった

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
