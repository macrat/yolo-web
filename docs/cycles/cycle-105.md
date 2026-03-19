---
id: 105
description: B-212 クイズ/診断ページへのFaqSection・ShareButtons追加 + B-210 StarRating半星表示の浮動小数点問題修正
started_at: "2026-03-19T14:04:09+0900"
completed_at: "2026-03-19T14:58:04+0900"
---

# サイクル-105

クイズ/診断ページの品質をゲームページと同等に引き上げるため、FaqSectionとShareButtonsを追加する（B-212）。また、StarRatingコンポーネントの浮動小数点演算による半星表示バグを修正する（B-210）。

## 実施する作業

- [x] B-212: クイズ/診断ページへのFaqSection・ShareButtons追加
  - [x] QuizMetaにfaqフィールドを追加（データ設計）
  - [x] 各クイズ/診断のFAQデータを作成
  - [x] クイズ/診断ページにFaqSectionを統合
  - [x] クイズ/診断ページにShareButtonsを追加
  - [x] テストの追加・更新
  - [x] レビューと修正
- [x] B-210: StarRating半星表示の浮動小数点問題修正
  - [x] 浮動小数点比較のロジック修正
  - [x] テストの追加・更新
  - [x] レビューと修正

## 作業計画

### B-210: StarRating半星表示の浮動小数点問題修正

#### 目的

占いコンテンツを楽しむユーザーに、星評価（StarRating）を正確に表示する。現状、rating値の小数部が `.3` の場合（2.3, 3.3, 4.3）に半星が表示されず、ユーザーに誤った評価印象を与えてしまっている。60件の占いデータのうち6件が影響を受けており、ユーザー体験の信頼性に関わるバグである。

#### 原因

IEEE 754浮動小数点演算により、`rating - Math.floor(rating)` の結果が正確な値にならない。例えば `2.3 - 2` は `0.29999...` となり、閾値 `0.3` を下回るため `hasHalf` が `false` になる。`.3` で終わるすべてのrating値で同じ問題が発生する。

#### 作業内容

1. **StarRatingコンポーネントの修正**（1ファイル）
   - 対象: `/mnt/data/yolo-web/src/play/fortune/_components/StarRating.tsx` 38行目
   - 小数部の比較を浮動小数点誤差の影響を受けない方法に変更する
   - 採用アプローチ: `Math.round((rating - fullStars) * 10) / 10 >= HALF_STAR_THRESHOLD`
   - 10倍して丸めてから10で割ることで、浮動小数点の誤差を除去してから閾値と比較する

2. **テストの追加・更新**（1ファイル）
   - 対象: `/mnt/data/yolo-web/src/play/fortune/_components/__tests__/StarRating.test.tsx`
   - 既存テスト（30行目の `rating={3.3}` テスト）が修正後に正しくパスすることを確認
   - 浮動小数点境界値のテストケースを追加:
     - `rating=2.3`: 半星が表示されること（浮動小数点演算で閾値を下回るバグの再現ケース）
     - `rating=4.3`: 半星が表示されること（浮動小数点演算で閾値を下回るバグの再現ケース）
     - `rating=1.29`: 半星が表示されないこと（閾値未満の値が正しく半星なしと判定されることの確認。浮動小数点問題とは無関係の通常境界テスト）
   - 追加テストにはバグの原因と意図をコメントで明記する

3. **動作確認**
   - `npm run test` で全テストがパスすること
   - `npm run lint && npm run format:check` がパスすること
   - `npm run build` が成功すること

#### 注意点

- 変更は `StarRating.tsx` の1行のみに留める。影響範囲（FortunePreview, DailyFortuneCard）はコンポーネントを使用しているだけなので変更不要
- `HALF_STAR_THRESHOLD` 定数の値（0.3）は変更しない。問題は閾値の値ではなく比較の方法にある
- テストでは「修正前に失敗していたケース」を明示的に追加し、リグレッションを防ぐ

#### 検討した他の選択肢と判断理由

| アプローチ                      | 方法                                                | 判断                                                                                                                         |
| ------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| A. 減算結果を丸めて比較（採用） | `Math.round((rating - fullStars) * 10) / 10 >= 0.3` | 既存コードの構造を最小限に変え、意図が読み取りやすい。減算 → 丸め → 比較という自然な流れ                                     |
| B. 整数化して剰余で比較         | `Math.round(rating * 10) % 10 >= 3`                 | 動作は正しいが、`HALF_STAR_THRESHOLD` 定数との関係が不明瞭になり可読性が下がる。閾値を変更したい場合に修正箇所が分かりにくい |
| C. イプシロン比較               | `rating - fullStars >= HALF_STAR_THRESHOLD - 1e-9`  | 浮動小数点対策としては一般的だが、イプシロンの値選択に恣意性があり、このユースケースでは過剰                                 |

#### 計画にあたって参考にした情報

- StarRating.tsx のソースコード（38行目の比較ロジック）
- StarRating.test.tsx の既存テスト（9テスト、うち30行目が `.3` 境界のテスト）
- Node.js での浮動小数点演算の実測結果: `2.3 - 2 = 0.29999...`, `3.3 - 3 = 0.29999...`, `4.3 - 4 = 0.29999...` いずれも閾値 `0.3` を下回ることを確認
- 両アプローチ（A, B）の正当性を全境界値（0, 1, 1.2, 1.3, 2.5, 3.7, 4.3, 5.0）で検証済み

#### 完了条件

- `rating=2.3`, `rating=3.3`, `rating=4.3` のすべてで半星が正しく表示される
- 既存の9テストがすべてパスする
- 浮動小数点境界値のテストが追加され、パスしている
- `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する

### B-212: クイズ/診断ページへのFaqSection・ShareButtons追加

#### 目的

クイズ/診断ページ（14種）の品質をゲームページと同等水準に引き上げる。具体的には、FaqSection（よくある質問）とShareButtons（SNSシェアボタン）を追加する。

- **誰のために**: クイズ/診断を楽しむ訪問者
- **提供する価値**:
  - FaqSection: ユーザーが抱きがちな疑問に先回りして回答し、安心感と理解を深める。同時にFAQPage JSON-LDにより検索結果でのリッチスニペット表示が可能になり、流入増が期待できる
  - ShareButtons: 診断結果を友人にシェアする導線を提供し、バイラル効果によるページビュー増加を狙う。クイズ/診断は特に「結果をシェアしたい」欲求が強いコンテンツ類型であり、効果が高い

#### 作業内容

作業は以下の5段階で進める。各段階は独立したサブエージェントに委任し、段階ごとにレビューを実施する。

##### ステップ1: QuizMeta型にfaqフィールドを追加

対象ファイル: `/mnt/data/yolo-web/src/play/quiz/types.ts`

- `QuizMeta` インターフェースに `faq?: Array<{ question: string; answer: string }>` フィールドを追加する
- GameMetaの `faq` フィールド定義（`/mnt/data/yolo-web/src/play/games/types.ts` 74-81行目）と同じ型・同じJSDocコメントスタイルに合わせる
- FaqEntry型は `@/lib/seo` に定義済みだが、GameMetaとの一貫性を優先してインライン定義とする

注意点:

- 既存のQuizMetaを使っている箇所（registry.ts、page.tsx等）に影響がないことを確認する（optionalフィールドなので破壊的変更にはならない）
- FaqSectionコンポーネントが受け取る `FaqEntry` 型（`@/lib/seo`）と構造的に互換であることを確認済み。TypeScriptの構造的型付けにより型エラーは発生しない

##### ステップ2: 14個のクイズすべてにFAQデータを作成

対象ファイル: `/mnt/data/yolo-web/src/play/quiz/data/` 配下の14ファイル

各クイズのmetaオブジェクトに `faq` フィールドを追加する。1クイズあたり3-5問のFAQを作成する。

FAQの内容方針:

- ユーザー視点で「このクイズ/診断について実際に疑問に思うこと」を想定する
- 各クイズの特性（knowledge型 vs personality型）に応じた質問を作る
- 以下のカテゴリから各クイズに適切なものを選んで組み合わせる:
  - 所要時間・問題数に関する質問（例: 「何問ありますか?」「どのくらい時間がかかりますか?」）
  - 結果の信頼性・根拠に関する質問（例: 「診断結果は正確ですか?」「どのような基準で判定していますか?」）
  - やり直し・結果の変化に関する質問（例: 「何度でもやり直せますか?」「回答によって結果は変わりますか?」）
  - コンテンツ固有の質問（例: 漢字力診断なら「出題される漢字のレベルは?」、性格診断なら「結果は何種類ありますか?」）
  - シェア・活用に関する質問（例: 「結果を友達と共有できますか?」）

作業の進め方:

- knowledge型3個を1サブエージェント、personality型11個を3-4サブエージェント（各3-4個担当）に委任する
- knowledge型（3種: kanji-level, kotowaza-level, yoji-level）とpersonality型（11種）で分けて進める

14個のクイズ一覧:

1. kanji-level（漢字力診断）- knowledge
2. kotowaza-level（ことわざ力診断）- knowledge
3. yoji-level（四字熟語力診断）- knowledge
4. traditional-color（日本の伝統色で性格診断）- personality
5. yoji-personality（四字熟語性格診断）- personality
6. impossible-advice（ありえないアドバイス診断）- personality
7. contrarian-fortune（逆張り占い）- personality
8. unexpected-compatibility（意外な相性診断）- personality
9. music-personality（音楽パーソナリティ診断）- personality
10. character-fortune（キャラクター運勢占い）- personality
11. animal-personality（日本の動物性格診断）- personality
12. science-thinking（科学的思考タイプ診断）- personality
13. japanese-culture（日本文化タイプ診断）- personality
14. character-personality（キャラクター性格診断）- personality

注意点:

- 各クイズのmeta内の `description`、`type`、`category`、`trustNote` を読み、そのクイズの内容を正確に理解した上でFAQを作成すること
- 回答はプレーンテキストのみ（HTML・特殊記法不可）。GameMetaのfaqフィールドと同じ制約
- 回答は簡潔だが十分な情報量を持たせる（1-3文程度）
- 14個すべてに同じ質問をコピーするのではなく、各クイズの特性に合わせた個別の質問を作ること

##### ステップ3: クイズページにFaqSectionとShareButtonsを統合

対象ファイル:

- `/mnt/data/yolo-web/src/app/play/[slug]/page.tsx`（メイン変更）
- `/mnt/data/yolo-web/src/app/play/[slug]/page.module.css`（スタイル追加）

変更内容:

1. FaqSectionコンポーネント（`@/components/common/FaqSection`）をインポートし、QuizContainerの後、RelatedQuizzesの前に配置する
   - `<FaqSection faq={quiz.meta.faq} />` として使用
   - FaqSectionは内部でFAQPage JSON-LDを自動出力するため、追加のJSON-LD処理は不要

2. ShareButtonsコンポーネント（`@/components/common/ShareButtons`）をインポートし、FaqSectionの後、RelatedQuizzesの前に配置する
   - GameLayoutのパターンに倣い、`<section>` で囲み見出しを付ける
   - 見出しテキストはクイズ/診断の文脈に合わせ「この診断が楽しかったらシェア」とする（GameLayoutの「このゲームが楽しかったらシェア」に対応）
   - Props: `url={"/play/" + slug}`, `title={quiz.meta.title}`, `sns={["x", "line", "hatena", "copy"]}`, `contentType="quiz"`, `contentId={slug}`

3. page.module.cssにシェアセクション用のスタイルを追加する
   - GameLayout.module.cssの `.shareSection` と `.shareSectionTitle` を参考に、同等のスタイルを定義する

コンポーネントの配置順序（上から下）:

1. JSON-LD script
2. Breadcrumb
3. TrustLevelBadge
4. QuizContainer
5. FaqSection（新規追加）
6. ShareButtons セクション（新規追加）
7. RelatedQuizzes

注意点:

- page.tsxはサーバーコンポーネントであり、FaqSectionもサーバーコンポーネント、ShareButtonsは"use client"コンポーネントだが、サーバーコンポーネントから呼び出す分には問題ない
- wrapperのmax-width: 600pxはそのまま維持する（GameLayoutと同じ幅）
- `generatePlayJsonLd` はFAQPage schemaを出力しないため、FaqSection内のFAQPage JSON-LDと重複しない

##### ステップ4: テストの追加・更新

対象:

- クイズページ（page.tsx）のレンダリングテスト: `src/app/play/[slug]/__tests__/page.test.tsx` が既に存在するため、既存テストへの追加として行う

テスト内容:

- faqデータを持つクイズでFaqSectionがレンダリングされること
- faqデータがないクイズでFaqSectionがレンダリングされないこと（FaqSectionコンポーネント自体がnullを返す仕様）
- ShareButtonsがレンダリングされること
- シェアセクションの見出しが正しいこと

注意点:

- 既存のGameLayout.test.tsxのテストパターンを参考にする
- `npm run lint && npm run format:check && npm run test && npm run build` がすべてパスすることを確認する

##### ステップ5: レビューと修正

- すべての変更についてレビューサブエージェントにレビューを依頼する
- レビュー観点はレビュアーに委ねる
- 指摘事項があれば修正し、指摘がなくなるまで繰り返す

#### 検討した他の選択肢と判断理由

1. **FaqSectionの配置位置について**
   - 選択肢A: QuizContainerの前（ページ上部）に配置
   - 選択肢B: QuizContainerの後、ShareButtonsの前に配置（採用）
   - 選択肢C: RelatedQuizzesの後（ページ最下部）に配置
   - 判断理由: GameLayoutと同じ配置パターン（コンテンツ本体 → FAQ → シェア → 関連コンテンツ）に合わせることで、サイト全体のUX一貫性を保つ。FAQはコンテンツを体験した後に読むものなので、QuizContainerの後が自然

2. **ShareButtonsの見出しテキストについて**
   - 選択肢A: 「このクイズが楽しかったらシェア」
   - 選択肢B: 「この診断が楽しかったらシェア」（採用）
   - 判断理由: 14種中11種がpersonality型（診断）であり、ユーザーの多くは「診断」として認識している。knowledge型にも「診断」という表現は不自然ではない（漢字力「診断」等）。14種すべてのタイトルに「診断」を含むため、type別の切り替えは不要と判断した

3. **ShareButtonsのcontentTypeについて**
   - ShareButtonsのcontentTypeは `"quiz"` で統一する。GA4分析でknowledge/personality別のシェア率を比較する場合はcontentIdからクイズ種別を逆引きできるため、contentTypeを細分化する必要はない

4. **FAQデータの管理方法について**
   - 選択肢A: 各クイズのデータファイル内にインラインで定義（採用）
   - 選択肢B: 別ファイル（faq.tsなど）に全クイズのFAQを集約
   - 判断理由: GameMetaのパターンに倣い、各コンテンツのメタデータとFAQを同じ場所で管理する方が、コンテンツの追加・更新時に見落としが少ない

#### 計画にあたって参考にした情報

- GameLayoutの実装パターン: `/mnt/data/yolo-web/src/play/games/_components/GameLayout.tsx`（60-97行目）
- GameMeta型のfaqフィールド定義: `/mnt/data/yolo-web/src/play/games/types.ts`（74-81行目）
- FaqSectionコンポーネント: `/mnt/data/yolo-web/src/components/common/FaqSection.tsx`
- ShareButtonsコンポーネント: `/mnt/data/yolo-web/src/components/common/ShareButtons.tsx`
- クイズページ現在の実装: `/mnt/data/yolo-web/src/app/play/[slug]/page.tsx`
- クイズページCSS: `/mnt/data/yolo-web/src/app/play/[slug]/page.module.css`
- QuizMeta型定義: `/mnt/data/yolo-web/src/play/quiz/types.ts`
- GameLayout.test.tsx: `/mnt/data/yolo-web/src/play/games/_components/__tests__/GameLayout.test.tsx`
- GameLayout.module.css（shareSectionスタイル）: `/mnt/data/yolo-web/src/play/games/_components/GameLayout.module.css`（97-109行目）

#### 完了条件

- [ ] QuizMeta型にfaqフィールドが追加されている
- [ ] 14個すべてのクイズデータファイルにFAQ（3-5問）が追加されている
- [ ] 各クイズのFAQが、そのクイズの特性に合った個別の内容になっている
- [ ] クイズページにFaqSectionが表示され、FAQPage JSON-LDが出力されている
- [ ] クイズページにShareButtonsが表示され、X/LINE/はてブ/コピーの4つのシェアボタンが機能する
- [ ] シェアイベントがGA4に正しく送信される（contentType="quiz"）
- [ ] コンポーネントの配置順序がGameLayoutと一貫している
- [ ] テストが追加され、すべてパスしている
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する
- [ ] 代表的なクイズページ（knowledge型1種、personality型1種）でスクリーンショットを撮り、FaqSectionとShareButtonsの表示を目視確認する

## レビュー結果

### B-210 レビュー

**1回目**: S-1件（data-has-half属性の削除、テストをtextContentベースに統一）、N-1件（テストコメントの冗長さ）。修正済み。
**2回目**: 指摘なし。承認。

### B-212 ステップ2（FAQデータ）レビュー

**1回目**: S-2件。S-1: personality型クイズ間でFAQ質問パターンが類似 → 3クイズで固有質問に差し替え。S-2: テストカバレッジ不足（4/11 personality） → 全11個に拡大、クロスクイズ重複も解消。
**2回目**: 指摘なし。承認。

### B-212 ステップ3（FaqSection/ShareButtons統合）レビュー

**1回目**: 指摘なし。承認。GameLayoutとの一貫性、技術的正確性、スタイル、テスト、ユーザー価値すべて問題なし。

### スクリーンショット確認

knowledge型（kanji-level）とpersonality型（animal-personality）でPC・モバイル両方を確認。FAQ（アコーディオン）、シェアボタン（X/LINE/はてブ/コピー）、関連クイズが正しい順序で表示されていることを目視確認済み。

## キャリーオーバー

なし

## 補足事項

なし

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
