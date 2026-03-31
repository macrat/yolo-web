---
id: 137
description: "クイズ結果ページdetailedContent追加（第2弾: traditional-color, character-fortune, yoji-personality）"
started_at: "2026-03-31T08:15:33+0900"
completed_at: "2026-03-31T10:15:19+0900"
---

# サイクル-137

cycle-136で先行実装したdetailedContent（character-personality, animal-personality, music-personality）に続き、残り3種のクイズにdetailedContentを追加する。

対象:

- **traditional-color**（あなたを日本の伝統色に例えると?）: 8結果タイプ
- **character-fortune**（あなたの守護キャラ診断）: 6結果タイプ
- **yoji-personality**（あなたを四字熟語に例えると?）: 8結果タイプ

## 実施する作業

- [x] 1. traditional-color（8結果タイプ）のdetailedContent追加 + テスト2ファイル作成
- [x] 2. character-fortune（6結果タイプ）のdetailedContent追加 + テスト2ファイル作成
- [x] 3. yoji-personality（8結果タイプ）のdetailedContent追加 + テスト2ファイル作成
- [x] 4. 全結果タイプの表示確認（Playwright目視）・最終レビュー

## 作業計画

### 判断の根拠

以下の調査結果（`docs/research/2026-03-31-quiz-result-page-value-assumptions-verification.md` および `docs/research/2026-03-31-japanese-casual-diagnosis-result-page-analysis.md` で検証済み）に基づき、計画を策定した。

**detailedContentを追加する理由（SEOではなく、体験価値のため）:**

- シェアの動機は「自己開示の報酬性」である（Harvard PNAS 2012）。「自分のことを言い当てられた感覚」がシェアを促す。behaviorsセクションの「こんなところ、ありませんか?」が「これ自分だ!」体験を生み、自己開示欲求を満たす。これがシェア動機につながる。
- 診断メーカー（日本で最もシェアされる診断プラットフォーム）は40-100文字の結果テキストで大量シェアを達成している。テキスト量はシェア率の主要因ではなく、自己認識の面白さが重要。
- 先行実装のdetailedContent（1タイプあたり約280-380文字）は実績として機能している。

**ビジュアル再設計を行わない理由:**

- 現在の結果ページは既にカード型デザイン（CSS確認済み）。detailedContentのtraitsは背景色+角丸のカード、behaviorsはボーダー+角丸のカード。十分な品質であり、根拠のない変更はしない。

**テキスト量の制限を設けない理由:**

- 先行実装のテキスト量（280-380文字/タイプ）は実績として問題なく機能している。任意の数字で制限する根拠がない。

**シェアボタンの位置変更を今回行わない理由:**

- fold上移動でシェア率490%増のA/Bテスト実績はあるが文脈依存。中程度の根拠はあるものの、このサイクルは小さく保つ。バックログに追加する。

**SEOに関する認識:**

- 小規模サイトのSEO効果は4ヶ月-1年かかる（Google公式）。detailedContentがあるとnoindex→indexに切り替わるが、短期的な流入増は期待しない。インデックスされること自体にデメリットはないため、副次効果として扱う。

### 変更しないもの

以下のファイル・機能は本サイクルでは一切変更しない:

- 結果ページのコンポーネント（`page.tsx`）
- 結果ページのCSS（`page.module.css`）
- detailedContentの型定義（`QuizResultDetailedContent`）
- 先行3種（character-personality, animal-personality, music-personality）のデータ
- ShareButtonsの配置

### 作業内容

全タスクにおいて、1クイズにつき1タスクとして独立したサブエージェントに委任する。

#### タスク1: traditional-color（8結果タイプ）のdetailedContent追加

- **対象ファイル**: `src/play/quiz/data/traditional-color.ts`
- **結果タイプ**: ai, shu, wakakusa, fuji, yamabuki, kon, sakura, hisui（計8種）
- **コンテンツ方針**: 日本の伝統色の文化的な意味合い・印象と性格特性を結びつける。各色が持つ歴史的・文化的背景を活かしつつ、現代の日常で共感できるtraitsとbehaviorsを作成する。
- **作業内容**:
  - 8結果すべてにdetailedContent（traits 3-5項目、behaviors 3-5項目、advice 1件）を追加
  - seoTitleをmetaに追加
  - テストファイルを2つ作成（先行実装パターンを踏襲）:
    - 構造テスト（`src/play/quiz/data/__tests__/traditional-color-detailed-content.test.ts`）
    - 品質テスト（`src/play/quiz/data/__tests__/traditional-color-traits-advice-quality.test.ts`）
  - lint/format/test/buildの全パス確認

#### タスク2: character-fortune（6結果タイプ）のdetailedContent追加

- **対象ファイル**: `src/play/quiz/data/character-fortune.ts`
- **結果タイプ**: commander, professor, dreamer, trickster, guardian, artist（計6種）
- **コンテンツ方針**: **口調維持が最重要。** 各キャラクターには固有の口調が設定されている。detailedContentのすべての文（traits, behaviors, advice）もこの口調に厳密に合わせなければならない。
  - commander: カジュアルな男性口調（「〜だぜ」「〜だろ?」）
  - professor: である調（「〜であるぞ」「〜であるな?」）
  - dreamer: お嬢様口調（「〜ですわ」「〜ですわよね?」）
  - trickster: フランクな口調（「〜っしょ」「〜じゃん?」）
  - guardian: 不安げな口調（「〜かもしれないね」「多分ね」）
  - artist: 詩的な口調（「〜だよね」感性的な表現）
- **作業内容**:
  - 6結果すべてにdetailedContent（traits 3-5項目、behaviors 3-5項目、advice 1件）を追加
  - seoTitleをmetaに追加
  - テストファイルを2つ作成:
    - 構造テスト（`src/play/quiz/data/__tests__/character-fortune-detailed-content.test.ts`）
    - 品質テスト（`src/play/quiz/data/__tests__/character-fortune-traits-advice-quality.test.ts`）: 標準の品質テストに加え、**口調の一貫性テスト**（各キャラクターのdetailedContent内テキストが対応するdescriptionと同系統の語尾パターンを使用していること）を含む
  - lint/format/test/buildの全パス確認

#### タスク3: yoji-personality（8結果タイプ）のdetailedContent追加

- **対象ファイル**: `src/play/quiz/data/yoji-personality.ts`
- **結果タイプ**: shoshikantetsu, tenshinranman, sessatakuma, ichigoichie, rinkiohen, meikyoshisui, ishindenshin, yuoumaishin（計8種）
- **コンテンツ方針**: 四字熟語の本来の意味と性格特性を自然に結びつける。**教訓的にならないこと**が最重要。あくまで「あなたの性格のこういうところが、まさにこの四字熟語」という共感ベースのトーンにする。「〜すべき」「〜しなさい」のような説教調は禁止。
- **作業内容**:
  - 8結果すべてにdetailedContent（traits 3-5項目、behaviors 3-5項目、advice 1件）を追加
  - seoTitleをmetaに追加
  - テストファイルを2つ作成:
    - 構造テスト（`src/play/quiz/data/__tests__/yoji-personality-detailed-content.test.ts`）
    - 品質テスト（`src/play/quiz/data/__tests__/yoji-personality-traits-advice-quality.test.ts`）
  - lint/format/test/buildの全パス確認

#### タスク4: 全体レビューと最終確認

- 全22結果タイプの表示をPlaywrightで目視確認
- 全クイズのlint/format/test/buildが通ることを確認
- コンテンツ品質の横断レビュー（トーンの一貫性、品質のばらつきがないか）

### コンテンツ品質基準（全タスク共通）

cycle-136の先行実装（music-personality等）で確立された品質基準を踏襲する。

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
- 8結果中6以上（6結果の場合は5以上）に具体的な行動提案を含むこと（「〜してみて」「〜を試して」等）
- 全結果が「あなたのXXは才能です」のような汎用テンプレートにならないこと（3結果以下に制限）

### テストファイルの構成（全タスク共通）

先行実装のテストパターン（`music-personality-detailed-content.test.ts` と `music-personality-traits-advice-quality.test.ts`）を踏襲する。

**構造テスト（\*-detailed-content.test.ts）**:

- 全結果にdetailedContentが存在すること
- traits/behaviorsの件数が3-5であること
- traits各項目が5-150文字、behaviors各項目が10-150文字であること
- adviceが10-200文字であること
- seoTitleが設定されていること

**品質テスト（\*-traits-advice-quality.test.ts）**:

- traits・behaviorsがdescriptionの焼き直しでないこと（15文字以上の部分一致禁止）
- adviceの多様性（汎用テンプレート使用が3結果以下）
- adviceに具体的行動提案が含まれること（閾値: 8結果なら6以上、6結果なら5以上）
- character-fortuneのみ: 口調の一貫性テストを追加

### 参考にした情報

- **先行実装**: `src/play/quiz/data/music-personality.ts` のdetailedContent実装パターン
- **テストパターン**: `src/play/quiz/data/__tests__/music-personality-detailed-content.test.ts` および `music-personality-traits-advice-quality.test.ts`
- **調査レポート**: `docs/research/2026-03-31-quiz-result-page-value-assumptions-verification.md` および `docs/research/2026-03-31-japanese-casual-diagnosis-result-page-analysis.md`

### 完成条件

- [x] 3クイズ全22結果タイプにdetailedContentが追加されている
- [x] 3クイズすべてにseoTitleが設定されている
- [x] 各クイズのテストファイル（構造テスト + 品質テスト）が作成され、全テストがパスしている
- [x] character-fortuneの各キャラクターのdetailedContentが、既存descriptionと同じ口調で書かれている
- [x] yoji-personalityのdetailedContentが教訓的・説教的なトーンになっていない
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する
- [x] 結果ページの表示がPlaywrightで目視確認されている

## レビュー結果

### traditional-color

- レビュー1回目: 指摘1件（若草色・山吹色のtraitsが3つで他の6タイプの4つと不揃い）
- 修正: 両タイプのtraitsを4つに追加
- レビュー2回目: 指摘なし。承認。

### character-fortune

- レビュー1回目: 指摘なし。承認。口調の一貫性を全6キャラクターで確認済み。

### yoji-personality

- レビュー1回目: 指摘なし。承認。教訓的トーンがないことを全8タイプで確認済み。

## キャリーオーバー

- シェアボタンのfold上移動の検討（中程度の根拠あり。A/Bテスト実績: fold上移動でシェア率490%増。ただし文脈依存のため、yolos.netでの効果は要検証）

## 補足事項

- result.colorはUIで一切使われていない（UIで使われているのはquiz.meta.accentColorのみ）。今後のサイクルでresult.colorの活用を検討してもよいが、本サイクルのスコープ外。
- Webユーザーの79%はスキャンしかしない（NNG）。behaviorsの場面描写が「あるある」として目に留まることが重要であり、テキストの量ではなく質が価値を決める。

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
