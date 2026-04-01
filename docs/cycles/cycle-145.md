---
id: 145
description: "受検者本人向け結果画面へのdetailedContent表示追加の検討（B-259）"
started_at: "2026-04-01T19:19:48+0900"
completed_at: "2026-04-01T20:52:29+0900"
---

# サイクル-145

受検者本人がクイズ結果画面で見る情報と、第三者が静的結果ページで見る情報に乖離がある問題を検討する。現状、受検者本人のResultCardではdetailedContentが一切表示されず、第三者向け静的ページでのみ充実したdetailedContentが表示される。この逆転現象がユーザー体験にどのような影響を与えるかを分析し、改善方針を決定する。

B-251〜B-257のdetailedContent構造最適化シリーズより先にこの問題を解決する必要がある。結論次第でdetailedContentのあり方自体が変わる可能性があるため。

## 実施する作業

- [x] 現状の受検者向け結果画面と第三者向け静的ページの表示内容の差異を正確に把握する
- [x] 受検者と第三者それぞれの体験フローを分析し、問題点を整理する
- [x] 改善方針を検討・決定する（detailedContentを受検者にも表示するか、表示する場合どのように表示するか）
- [x] 方針に基づいて実装する（実装が必要な場合）
- [x] テスト・ビルド・lint・formatチェックを通す
- [x] レビュー実施

## 作業計画

### 目的

受検者本人がクイズ完了直後に見る結果画面（ResultCard）と、シェアリンク経由で第三者が見る静的結果ページの間にある「情報逆転現象」を緩和し、受検者にとっての最高の体験を実現する。

### 定量的なテキスト量評価

現状のResultCardの構造と、追加するbehaviorsのテキスト量を定量的に評価した。

**現状のResultCard（スマホ375px幅を基準）:**

- アイコン: 1行分（3rem）
- タイトル: 1-2行（例: 「ニホンザル -- 温泉を発明した革命児」= 約1.5行）
- description: 約250-350文字。スマホでは約10-14行相当（1行あたり全角16文字程度）

**現状だけで既にスマホ1画面を超えている。** descriptionが長いクイズ（例: ニホンザルの約350文字）では、descriptionの終わりまでスクロールが必要。

**追加するbehaviorsのテキスト量:**

- behaviorsは4項目 x 約25-35文字 = 約100-140文字
- 見出し1行 + 箇条書き4項目 = 約6行相当

**テキスト過多リスクの評価:**

- description（10-14行）+ behaviors（6行）= 16-20行 → スマホで約2画面分
- この全量をシェアボタンの**前**に置くと、シェアボタンに到達するまでに2画面分のスクロールが必要
- ターゲットユーザー（テキスト過多を嫌う層）にとって、これは明確に離脱リスクが高い

**結論: behaviorsはシェアボタンの後に配置する。**

### 体験設計の結論

#### ゼロベースで定義した「来訪者にとっての最高の体験」

受検者がクイズを完了した瞬間の体験を「シェア導線の最短化」を最優先にゼロから設計した。

**受検者のクイズ完了直後の体験フロー:**

1. アイコンとタイトルで「自分が何タイプか」を即座に把握する（0.5秒）
2. descriptionの冒頭数行で「なるほど」と共感する（3-5秒）
3. **シェアボタンが視界に入り、感情が高ぶっているうちにシェアする**（最重要タイミング）
4. シェア後、「あるある」を読んで「わかる!」と楽しむ
5. 興味があれば特徴やアドバイスも読める

**なぜこの順序が最適か:**

- クイズ完了直後は感情のピーク。「私これだ!」という驚きや喜びが最も強いタイミング
- このタイミングでシェアボタンに到達できることが、シェア率を最大化する
- behaviorsは「共感を深める」コンテンツであり、シェアの「理由」を後から補強する役割。シェア導線を妨げる位置に置く必要はない
- シェア後にbehaviorsを読むことで「やっぱりシェアしてよかった、確かに自分だ」という満足感が得られ、次回以降のリピート率にも寄与する

**受検者と第三者の体験の整合性:**

- 受検者が見る「あるある」と、第三者が見る「あるある」が同じであることは維持される
- 受検者はシェア後にbehaviorsを読むため、第三者から「あの項目、まさにあなただったよね!」と言われた時に「ああ、あれね」と会話が成立する
- 受検者と第三者で完全に同一の表示順序である必要はない。それぞれのコンテキストで最適な順序が異なる

#### 方針: behaviorsをシェアボタンの後に配置 + traits/adviceを折りたたみ

**ResultCardの表示順序（上から下）:**

1. アイコン + タイトル（現状通り）
2. description（現状通り）
3. recommendation（現状通り、存在する場合のみ）
4. **ShareButtons**（現状通り）
5. **behaviorsリスト**（新規追加。シェアボタンの直後）
6. **折りたたみセクション**（新規追加。traits/advice等を格納。見出しはvariant別に検討）
7. リトライボタン（現状通り）

理由:

- シェアボタンまでの距離を現状と同一に保つ（テキスト追加なし）
- behaviorsをシェアボタン直後に置くことで、シェアした直後（またはシェアをスキップした場合）に自然に目に入る
- 「あるある」は最も共感を呼びやすいコンテンツであり、シェアボタンの直後に読むことで「シェアしてよかった」の満足感を得られる
- traits/adviceは分析的・教訓的な情報であり、「盛り上がり」よりも「深掘り」の文脈。折りたたみで興味のある人だけが開ける構造が最適
- vonvonの成功要因（受検者と第三者が同じ情報を見る）は、behaviorsの存在自体で実現される。表示位置が前か後かは関係ない

### 作業内容

#### ステップ1: ResultCardへのbehaviors表示追加（シェアボタンの後）

**対象ファイル:**

- `src/play/quiz/_components/ResultCard.tsx` — behaviorsセクションの追加、折りたたみUIの追加
- `src/play/quiz/_components/ResultCard.module.css` — behaviorsと折りたたみのスタイル

**変更内容:**

1. ResultCardのpropsに `detailedContent` を追加（オプショナル）
2. **ShareButtonsの直後、リトライボタンの直前**に以下を表示:
   - **behaviorsリスト**: detailedContentが存在する場合のみ表示。見出し付きの箇条書き
   - **折りたたみセクション**: traits/advice等を格納。デフォルトは閉じた状態。見出しテキストはvariantごとに折りたたみ内コンテンツの内容が予測できるよう、variant別に検討する（一律「もっと詳しく見る」ではなく、中身に即した見出しにする）
3. 3つのvariant（標準、contrarian-fortune、character-fortune）それぞれに対応
   - 標準: behaviors表示 + traits/advice折りたたみ
   - contrarian-fortune: behaviors表示 + catchphrase/coreSentence/persona折りたたみ（thirdPartyNoteは受検者には不要なので非表示）
   - character-fortune: behaviors表示 + characterIntro/characterMessage折りたたみ（thirdPartyNoteは受検者には不要なので非表示）

**設計上の注意:**

- 折りたたみは `<details>/<summary>` ネイティブ要素を使用し、JSバンドルを増やさない
- behaviorsの見出しは、quizのresultPageLabelsから取得する

#### ステップ2: QuizContainerからdetailedContentの受け渡し

**対象ファイル:**

- `src/play/quiz/_components/QuizContainer.tsx` — ResultCardへdetailedContentを渡す

**変更内容:**

- determineResult()で取得したresultオブジェクトはすでにdetailedContentを持っている。ResultCardにresult.detailedContentをpropsとして渡すだけでよい
- detailedContentはresultオブジェクト内に含まれているため、クライアントバンドルへの影響は実装時に確認する

#### ステップ3: variant別のResultCard表示確認

**作業:**

- detailedContentを持つ各クイズ（9クイズ）について、Playwright MCP でResultCard表示を視覚的に確認する
- detailedContentを持たないクイズ（6クイズ）について、表示が崩れないことを確認する
- 特に確認すべき点:
  - **シェアボタンがdescriptionの直後に表示され、behaviorsで押し下げられていないこと**
  - behaviorsがシェアボタンの直後に自然に表示されること
  - 折りたたみの開閉が正常に動作すること

#### ステップ4: 第三者向けページのthirdPartyNote表示の扱い

**検討事項:**

- contrarian-fortuneとcharacter-fortuneの第三者向けページのthirdPartyNoteはそのまま維持する
- 受検者のResultCardにはthirdPartyNoteを表示しない（自分自身について第三者視点の記述を読む必要はない）
- thirdPartyNoteは本質的に第三者向けの情報なので、受検者に見せないことは問題にならない

#### ステップ5: テスト

**対象ファイル:**

- `src/play/quiz/_components/__tests__/ResultCard.test.tsx` — 新規または既存テストの拡張

**テスト内容:**

1. detailedContentがundefinedの場合、behaviorsセクションが表示されないこと
2. 標準形式のdetailedContentがある場合、behaviorsがShareButtonsの**後**に表示されること
3. 標準形式のdetailedContentがある場合、traits/adviceが折りたたみ内にあること
4. contrarian-fortune / character-fortune variantの場合、behaviorsが表示されること
5. thirdPartyNoteが受検者向け画面に表示されないこと
6. behaviorsがShareButtonsの前に表示されていないこと（DOM順序の検証）

#### ステップ6: ビルド・lint・format確認

- `npm run lint && npm run format:check && npm run test && npm run build` を実行し、すべてパスすることを確認する

#### ステップ7: レビュー

- 実装完了後、レビューエージェントによるコード・UI・UXのレビューを受ける
- 指摘事項があれば修正し、再レビューを繰り返す

### 検討した他の選択肢と判断理由

#### 案A: behaviorsをシェアボタンの前に配置する（不採用）

- descriptionの直後、シェアボタンの直前にbehaviorsを表示する
- 不採用理由: 定量評価の結果、description（10-14行）+ behaviors（6行）= 16-20行がシェアボタンの前に展開され、スマホで約2画面分のスクロールが必要になる。ターゲットユーザー（テキスト過多を嫌う層）にとって、シェアボタンに到達する前に離脱するリスクが高い。シェア率低下は直接的にPV成長を阻害する

#### 案B: detailedContentを全て展開状態で表示する（不採用）

- 受検者の結果画面にtraits、behaviors、adviceを全て展開状態で表示する
- 不採用理由: テキスト過多が更に深刻化。合計400-600文字がシェアボタンの前（案Aの場合）または後（本案の場合でも）に一度に展開されると、ターゲットユーザーの離脱リスクが高い

#### 案C: 静的結果ページへ受検者をリダイレクトする（不採用）

- クイズ完了後、受検者を第三者向け静的結果ページにリダイレクトする
- 不採用理由: 静的ページは第三者向けに設計されており（「あなたはどのタイプ?」CTA等）、受検者にとって違和感がある

#### 案D: ResultCardからリンクで静的ページへ誘導する（不採用）

- ResultCardに「詳細を見る」リンクを追加し、静的結果ページへ誘導する
- 不採用理由: 追加のクリックが必要で、受検者が最も盛り上がっている瞬間にシェアではなくページ遷移を促すことになる

#### 案E: シェア後にbehaviorsが現れるインタラクション（不採用）

- シェアボタンを押した後にbehaviorsが展開される仕組み
- 不採用理由: シェアしなかった受検者がbehaviorsを見られなくなる。また、シェアを「報酬のための条件」にすると、ユーザーに操作的な印象を与える。behaviorsは常に見られるべきコンテンツであり、シェア行動と紐付けるべきではない

#### 案F: 現状維持（不採用）

- 情報逆転をそのままにする
- 不採用理由: 受検者がシェアした後に第三者から「こんなこと書いてあったよ」と言われる体験が発生し得る。また、behaviorsを受検者に見せないことで、シェア動機の最大化機会を逃している

#### 採用案: behaviorsをシェアボタンの後に配置 + traits/adviceを折りたたみ

- **シェアボタンまでの距離を現状と同一に保つ**（最重要。テキスト追加による距離増加なし）
- シェアボタン直後にbehaviorsを表示し、シェア後の満足感を深める
- 折りたたみで追加情報も提供するが、メインのフローを邪魔しない
- 受検者と第三者の「あるある」が一致するため、シェア後の会話が成立する

### 計画にあたって参考にした情報

- **現状のResultCard**: アイコン、タイトル、description、recommendation、ShareButtons、リトライボタンで構成。detailedContentは一切渡されていない（`src/play/quiz/_components/ResultCard.tsx`）
- **現状の第三者向け結果ページ**: DescriptionExpander + CTA + detailedContent（traits/behaviors/advice）+ CTA2で構成。ResultPageShellのchildrenとしてDescriptionExpander等が入り、その後にShareButtonsが表示される構造（`src/app/play/[slug]/result/[resultId]/page.tsx`, `src/play/quiz/_components/ResultPageShell.tsx`）
- **QuizContainer**: ResultCardにresultオブジェクトを渡すが、detailedContentフィールドは利用されていない。detailedContentはresultオブジェクト内に含まれているため、クライアントバンドルへの影響は実装時に確認する（`src/play/quiz/_components/QuizContainer.tsx`）
- **detailedContent型定義**: 3 variant（標準/contrarian-fortune/character-fortune）のdiscriminated union。全variantがbehaviorsを持つため、behaviorsの共通表示は型安全に実装可能（`src/play/quiz/types.ts`）
- **テキスト量の定量評価**: ニホンザルの例でdescription約350文字（スマホで約14行）、behaviors 4項目 x 約30文字 = 約120文字（スマホで約6行）。合計20行はスマホ約2画面分に相当し、シェアボタン前に置くとシェア率低下リスクが高い
- **GA分析**: 結果ページのPVは少量（3月に2件のみ）で、統計的に有意なデータは取れない。そのため、ユーザー行動データよりも競合分析とUX設計原則に基づいて判断した
- **競合分析**: vonvonの「受検者と第三者が同じ情報を見る」モデルがバイラル性に優れている点を参考にした。ただし完全一致ではなく、受検者に不要な情報（thirdPartyNote）は除外する

## レビュー結果

### 計画レビュー（3回）

- **R1**: 3件の重大指摘。behaviorsの配置位置がシェアボタンの前でシェア率低下リスク、テキスト過多の定量評価不足、ゼロベース検討不足
- **R2**: 3件の指摘。目的記述「解消」と実態の矛盾、折りたたみ見出しのvariant別検討不足、バンドルサイズの断定的記述
- **R3**: 承認。すべての指摘が適切に対応済み

### 実装レビュー（2回）

- **R1**: 2件の指摘。(1) CharacterFortuneDetailsSectionでcharacterMessageHeadingが重複表示される（summaryと内部サブ見出しの両方に使用）、(2) StandardDetailsSection内のtraitsリストにbehaviorsItemクラスが使われている命名不整合
- **R2**: 承認。2件の指摘が適切に修正済み。全体にも新たな問題なし

### 視覚確認

Playwrightで4クイズ（animal-personality, contrarian-fortune, character-fortune, kanji-level）の結果画面をスクリーンショットで確認。シェアボタンの位置、behaviorsの表示、折りたたみの動作、detailedContentなしの場合の表示がすべて正常に動作

## キャリーオーバー

- なし

## 補足事項

- B-259の結論: 受検者にdetailedContentを見せる（behaviorsをシェアボタン直後に配置、traits/adviceを折りたたみで提供）。情報逆転は完全には解消されないが緩和される（受検者はシェア後にbehaviorsを確認可能）
- B-251〜B-257のdetailedContent構造最適化シリーズへの影響: 今回の結論により、新しいvariantを追加する際には受検者向けResultCardでの表示も考慮する必要がある。ただし、ResultCardのbehaviors表示は全variantで共通処理されているため、新variantでbehaviorsフィールドを持っていれば自動的に対応される

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
