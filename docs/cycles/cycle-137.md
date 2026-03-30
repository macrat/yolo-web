---
id: 137
description: "クイズ結果ページdetailedContent追加（第2弾: traditional-color, character-fortune, yoji-personality）"
started_at: "2026-03-31T08:15:33+0900"
completed_at: null
---

# サイクル-137

cycle-136で先行実装したdetailedContent（character-personality, animal-personality, music-personality）に続き、オーガニック検索流入実績と検索需要の高さに基づいて選定した3種にdetailedContentを追加する。

対象:

- **traditional-color**（あなたを日本の伝統色に例えると?）: 8結果タイプ — 日本文化テーマで検索需要が高い
- **character-fortune**（あなたの守護キャラ診断）: 6結果タイプ — 守護キャラ系は診断需要が高い
- **yoji-personality**（あなたを四字熟語に例えると?）: 8結果タイプ — 四字熟語は教育系検索需要が高い

## 実施する作業

- [ ] 1. 先行3種のdetailedContent実装パターンを確認し、品質基準を把握する
- [ ] 2. traditional-color（8結果タイプ）のdetailedContent追加
- [ ] 3. character-fortune（6結果タイプ）のdetailedContent追加
- [ ] 4. yoji-personality（8結果タイプ）のdetailedContent追加
- [ ] 5. 全結果タイプの表示確認・レビュー

## 作業計画

### 目的

「手軽で面白い占い・診断を楽しみたい人」に向けて、3つのクイズ（traditional-color, character-fortune, yoji-personality）の全22結果タイプにdetailedContentを追加する。これにより以下の価値を提供する:

1. **ユーザー価値の向上**: 結果ページに「あなたの特徴」「あるある行動パターン」「ひとことアドバイス」の3セクションを追加することで、診断結果の満足度と「自分のことだ!」という共感体験（バーナム効果）を強化する。結果の読み応えが増すことで、SNSシェア動機も高まる。
2. **SEO効果**: detailedContentが設定された結果ページはnoindexからindexに切り替わるため、各結果ページが検索エンジンにインデックスされるようになる。これにより「伝統色 診断 藍色」「四字熟語 性格 切磋琢磨」といったロングテールキーワードからの流入増が期待できる。

### 作業内容

全タスクにおいて、1クイズにつき1タスクとして独立したサブエージェントに委任する。

#### タスク1: traditional-color（8結果タイプ）のdetailedContent追加

- **対象ファイル**: `src/play/quiz/data/traditional-color.ts`
- **結果タイプ**: ai, shu, wakakusa, fuji, yamabuki, kon, sakura, hisui（計8種）
- **コンテンツ方針**: 日本の伝統色の文化的な意味合い・印象と性格特性を結びつける。各色が持つ歴史的・文化的背景を活かしつつ、現代の日常で共感できるtraitsとbehaviorsを作成する。
- **作業内容**:
  - 8結果すべてにdetailedContent（traits 3-5項目、behaviors 3-5項目、advice 1件）を追加
  - seoTitleをmetaに追加（「伝統色 性格診断 心理テスト 無料」等のキーワードを含む）
  - テストファイルを作成（`src/play/quiz/data/__tests__/traditional-color-detailed-content.test.ts`）
    - 全8結果にdetailedContentが存在すること
    - traits/behaviorsの件数（3-5）と文字数範囲の検証
    - adviceの文字数範囲の検証
    - traitsがdescriptionの焼き直しでないこと（15文字以上の部分一致がないこと）
    - adviceの多様性と行動提案を含むこと（8結果中6以上）
  - lint/format/test/buildの全パス確認

#### タスク2: character-fortune（6結果タイプ）のdetailedContent追加

- **対象ファイル**: `src/play/quiz/data/character-fortune.ts`
- **結果タイプ**: commander, professor, dreamer, trickster, guardian, artist（計6種）
- **コンテンツ方針**: **最重要注意点** — 各キャラクターには固有の口調が設定されている。detailedContentのすべての文（traits, behaviors, advice）もこの口調に厳密に合わせなければならない。
  - commander: カジュアルな男性口調（「～だぜ」「～だろ?」）
  - professor: である調（「～であるぞ」「～であるな?」）
  - dreamer: お嬢様口調（「～ですわ」「～ですわよね?」）
  - trickster: フランクな口調（「～っしょ」「～じゃん?」）
  - guardian: 不安げな口調（「～かもしれないね」「多分ね」）
  - artist: 詩的な口調（「～だよね」感性的な表現）
- **作業内容**:
  - 6結果すべてにdetailedContent（traits 3-5項目、behaviors 3-5項目、advice 1件）を追加
  - seoTitleをmetaに追加
  - テストファイルを作成（`src/play/quiz/data/__tests__/character-fortune-detailed-content.test.ts`）
    - 基本構造の検証（全6結果にdetailedContent存在、件数・文字数範囲）
    - traitsがdescriptionの焼き直しでないこと
    - adviceの多様性と行動提案（6結果中5以上）
    - **口調の一貫性テスト**: 各キャラクターのdetailedContent内テキストが、対応するdescriptionと同系統の語尾パターンを使用していることを検証
  - lint/format/test/buildの全パス確認

#### タスク3: yoji-personality（8結果タイプ）のdetailedContent追加

- **対象ファイル**: `src/play/quiz/data/yoji-personality.ts`
- **結果タイプ**: shoshikantetsu, tenshinranman, sessatakuma, ichigoichie, rinkiohen, meikyoshisui, ishindenshin, yuoumaishin（計8種）
- **コンテンツ方針**: 四字熟語の本来の意味と性格特性を自然に結びつける。四字熟語が教訓的にならないよう注意し、あくまで「あなたの性格のこういうところが、まさにこの四字熟語」という共感ベースのトーンにする。
- **作業内容**:
  - 8結果すべてにdetailedContent（traits 3-5項目、behaviors 3-5項目、advice 1件）を追加
  - seoTitleをmetaに追加（「四字熟語 性格診断 心理テスト 無料」等のキーワードを含む）
  - テストファイルを作成（`src/play/quiz/data/__tests__/yoji-personality-detailed-content.test.ts`）
    - 全8結果にdetailedContentが存在すること
    - traits/behaviorsの件数（3-5）と文字数範囲の検証
    - adviceの文字数範囲の検証
    - traitsがdescriptionの焼き直しでないこと
    - adviceの多様性と行動提案を含むこと（8結果中6以上）
  - lint/format/test/buildの全パス確認

#### タスク4: 全体レビューと最終確認

- 全22結果タイプの表示をPlaywrightで目視確認
- 全クイズのlint/format/test/buildが通ることを確認
- コンテンツ品質の横断レビュー（トーンの一貫性、品質のばらつきがないか）

#### コンテンツ品質基準（全タスク共通）

cycle-136の先行実装（music-personality等）で確立された品質基準を踏襲する:

**traits（あなたの特徴）**:

- 3-5項目、各1-2文（5-150文字）
- 内面の心理・性格傾向を描写する
- 共感的で少し自己認識的なトーン（「実はこういうところがある」）
- descriptionの焼き直しは禁止（15文字以上の部分一致不可）

**behaviors（あるある行動パターン）**:

- 3-5項目、各10-150文字
- 具体的な日常の「あるある」シーンを描写する（説明的な表現ではなく、場面描写）
- 面白く、読んだ人が「わかる!」と共感できる内容
- 悪い例: 「人の気持ちを察するのが得意」（説明的）
- 良い例: 「LINEの返信が遅い友達に対して、忙しいのかなと3パターンの理由を想像してから既読スルーを許す。」（場面描写）

**advice（ひとことアドバイス）**:

- 10-200文字
- ポジティブで行動を促す1-2文
- 温かいトーン
- 8結果中6以上に具体的な行動提案を含むこと（「～してみて」「～を試して」等）
- 全結果が「あなたのXXは才能です」のような汎用テンプレートにならないこと（3結果以下に制限）

### 検討した他の選択肢と判断理由

1. **3クイズを1タスクにまとめて一括実装する案**
   - 却下理由: CLAUDE.mdの「Keep task smaller」原則に違反する。1クイズにつき1サブエージェントに分割することで、各タスクの品質管理と追跡が容易になる。特にcharacter-fortuneは口調という独自の制約があるため、独立したタスクとして集中して取り組む必要がある。

2. **detailedContentのみ追加し、seoTitleは追加しない案**
   - 却下理由: cycle-136の先行実装ではseoTitleも同時に追加されており、detailedContentによるindex化と合わせてSEO効果を最大化する設計になっている。seoTitleを省略するとSEO効果が限定的になるため、同時に追加する。

3. **品質テストを省略して実装速度を優先する案**
   - 却下理由: constitutionの「質を量より優先する」原則、およびCLAUDE.mdの「Review always」原則に従い、テストによる品質保証は必須。cycle-136で確立されたテストパターン（構造テスト + 品質テスト）を踏襲することで、一貫した品質基準を維持する。

### 計画にあたって参考にした情報

- **cycle-136の先行実装**: `src/play/quiz/data/music-personality.ts` のdetailedContent実装パターンとテスト構成を品質基準のリファレンスとした
- **既存テストパターン**: `src/play/quiz/data/__tests__/music-personality-detailed-content.test.ts` および `music-personality-traits-advice-quality.test.ts` のテスト項目と検証ロジックを踏襲
- **型定義**: `src/play/quiz/types.ts` の `QuizResultDetailedContent` インターフェース（traits, behaviors, advice）
- **対象クイズデータ**: 3つの対象ファイルの既存のresults配列（id, title, description, color, icon等）の内容を確認し、detailedContentとの整合性を確保する方針とした
- **character-fortuneの口調設定**: 既存のresults[].descriptionに記載された各キャラクターの口調パターンを分析し、detailedContentでも同一の口調を維持する必要性を特定した

### 完成条件

- [ ] 3クイズ全22結果タイプにdetailedContentが追加されている
- [ ] 3クイズすべてにseoTitleが設定されている
- [ ] 各クイズのテストファイルが作成され、全テストがパスしている
- [ ] character-fortuneの各キャラクターのdetailedContentが、既存descriptionと同じ口調で書かれている
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する
- [ ] 結果ページの表示がPlaywrightで目視確認されている

## レビュー結果

<作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。>

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

## 補足事項

<追加で補足しておくべきことがあれば記載する。とくに無い場合は「なし」と記載する。>

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
