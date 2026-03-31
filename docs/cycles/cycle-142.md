---
id: 142
description: "detailedContent構造最適化: character-fortune（守護キャラ診断6結果）の第三者向け結果ページ専用構造への変更"
started_at: "2026-03-31T23:01:04+0900"
completed_at: null
---

# サイクル-142

守護キャラ診断（character-fortune）の静的結果ページの `detailedContent` を、このコンテンツ固有の理想形に基づいて最適化する。cycle-141で確立したdiscriminated unionインフラを活用し、character-fortune専用の新しいvariantを追加する。理想形はゼロベースで検討し、型のグルーピングで共通化しない（Owner指示）。

## 実施する作業

- [x] character-fortuneの現状コンテンツと特性を調査する
- [x] character-fortune固有の理想的なdetailedContent構造をゼロベースで設計する
- [x] 設計レポートのレビュー
- [ ] 型定義に新variantを追加する
- [ ] 結果ページコンポーネントを新variantに対応させる
- [ ] character-fortune（6結果）のdetailedContentを新構造で作成する
- [ ] テストの追加・更新
- [ ] 実装のレビュー
- [ ] 表示確認

## 作業計画

### 目的

守護キャラ診断（character-fortune）の静的結果ページに表示する `detailedContent` の構造を、このコンテンツ固有の理想形に基づいて最適化する。現在の標準形式（traits/behaviors/advice）は汎用的であり、character-fortuneの最大の差別化ポイントである「キャラクターの人格による語りかけ」の価値を十分に引き出せていない。

### Step 1: 理想形のコンテンツ設計

#### 1-1. 第三者（友人の守護キャラ結果を見に来た人）は、このページで何を求めているか？

第三者がこのページに到達するルートは2つある。

**ルートA: SNSシェア経由（多数派）**
友人が「守護キャラ診断の結果は『締切3分前に本気出す炎の司令塔』でした！」とシェアしたリンクを踏んできた人。到着直後の問いは:

1. 「このキャラって何？ どんなキャラクター？」 — タイプ名の意味を知りたい
2. 「友人ってたしかにこういうところある」 — 友人への納得感
3. 「このキャラ、喋り方が面白い」 — キャラの人格に引き込まれる
4. 「自分の守護キャラも知りたい」 — 自分もやりたい（CV動線）
5. 「友人に感想を伝えたい」 — シェア・会話への発展

**ルートB: 検索経由（少数派）**
「守護キャラ診断 司令塔」等で来訪。タイプの内容を知りたい、または自分に当てはまるか確認したい。

#### 1-2. character-fortuneならではの価値（他の診断にはない固有の魅力）は何か？

**キャラクターが「語り手」として価値を持つこと。** これが他のすべての診断との決定的な違いである。

contrarian-fortuneのタイプ名は「宇宙規模の心配性」のようにユーモアとしてのインパクトがあるが、タイプ自体に人格はない。music-personalityの結果は音楽ジャンルに紐づくが、ジャンルが語りかけてくることはない。

character-fortuneだけが、6種類の固有の一人称・口調・性格を持ったキャラクターが存在する。司令塔の「俺」「だぜ」、博士の「吾輩」「であるぞ」、妄想家の「わたくし」「ですわ」。第三者が最も楽しめるのは「友人の守護キャラがその友人について語っている」という体験であり、これはキャラの口調で書かれたコンテンツを読むことで実現する。

具体的な固有価値:

- **キャラの口調で語られる「あるある」は、汎用的な「あるある」の何倍も愛着が湧く**。「期末レポートの提出1時間前に猛然と...」という事実だけでなく、それを司令塔が「やってるだろ、知ってるぜ」という口調で指摘されるから嬉しい。
- **キャラクターへの愛着が生まれる**。結果を受け取った本人は「自分の守護キャラ」として愛着を持つ。第三者は「友人のキャラ、いいな」「自分のキャラも知りたい」と思う。
- **キャラ同士の関係性が楽しい**。相性診断機能があることで、「自分のキャラと友人のキャラの組み合わせ」という二重の楽しみがある。

#### 1-3. その価値を最大化するために、どのようなコンテンツ要素が必要か？

character-fortuneの本質から導き出した要素:

**(a) キャラクターの自己紹介（キャラ口調の短い散文）**
現在の `description` はキャラが診断結果を受けた本人に語りかける長文だが、第三者には「このキャラはどういう存在か」が先に伝わるべきである。キャラが自分自身を紹介する短い一文（キャッチコピー的な位置づけ）を、タイプ名の直下に配置する。これにより第三者は「このキャラの雰囲気」を瞬時に掴める。

**(b) キャラが語る「お前のこういうところ」（あるある箇条書き、キャラ口調）**
現在の `behaviors` に相当するが、重要なのは「キャラの口調で語られている」点を最大限活かすこと。見出しも「このキャラがやりがちなこと」ではなく、キャラ自身が語りかける見出し（例: 司令塔なら「お前、こういうとこあるだろ?」）にする。これにより第三者は「友人のキャラが友人のことを言い当てている」場面を楽しめる。

**(c) キャラの本音（散文、キャラ口調）**
現在の `traits`（箇条書き）と `advice` を統合して、キャラが本人に向けて「お前のことをどう思っているか」を語る散文。箇条書きよりも散文の方がキャラの人格が出やすい。内面の分析・素質の指摘・ポジティブな励ましを、キャラ固有の語り口で一続きの文章として表現する。これはキャラクターコンテンツの「読み応え」の中核であり、第三者にとっては「このキャラ、友人のことめっちゃわかってる」「この語り口がいい」という体験になる。

**(d) 「このキャラの守護を受けている人と一緒にいると」（第三者視点のシーン描写）**
第三者専用の要素。「このタイプの人と一緒にいるとどうなるか」を具体的なシーンで描写する。character-fortuneの場合、キャラの口調ではなく客観的な第三者視点で書く。理由は、このセクションは「友人のことを外側から見ている第三者」に向けたものであり、キャラの口調だと「誰が誰に向けて話しているのか」が混乱するため。

**(e) 相性診断への誘導**
character-fortuneには相性診断機能（?with=パラメータ）がある。第三者に「あなたも診断して、この人との相性を見てみよう」と自然に誘導する。これはcharacter-fortune固有の強力なCV動線であり、contrarian-fortuneにはなかった要素。

**(f) 全タイプ一覧 + 診断CTA**
他の6キャラを見渡せる一覧。第三者が「他にどんなキャラがいるのか」を知り、興味を持って診断に進む動線。

#### 1-4. それらの要素はどの順番で配置すべきか？

第三者の問いの順序（1-1で定義）に沿って:

1. **クイズ名 + shortDescription**（既存）: 何の診断かを把握
2. **アイコン + タイプ名（h1）**（既存）: 守護キャラの名前
3. **(a) キャラクターの自己紹介**: このキャラの雰囲気を瞬時に伝える（問い1「このキャラって何？」に応答）
4. **CTA1**: 「あなたの守護キャラも診断してみよう」（早期CV動線）
5. **(b) キャラが語る「あるある」**: 友人への納得感（問い2に応答）。ここが第三者体験の核心
6. **シェアボタン第一置き場**: あるある直後の「わかる！」の瞬間にシェア動線
7. **(c) キャラの本音**: キャラの人格を深く味わう（問い3「喋り方が面白い」に応答）
8. **(d) 第三者視点のシーン描写**: 友人との関係性を振り返る
9. **(e) 相性診断への誘導**: 「あなたも診断して、この人との相性を見てみよう」
10. **(f) 全タイプ一覧 + 診断CTA**: 他キャラへの興味 + 最終CV動線
11. **シェアボタン**（既存、末尾）

#### 1-5. 避けるべきこと

- **キャラの口調を捨てること**: 標準形式の `traits`/`behaviors`/`advice` の見出しでキャラの人格を消してはならない。見出しもキャラの世界観に合ったものにする。
- **contrarian-fortuneの構造をそのままコピーすること**: `catchphrase`/`coreSentence` のような構造は contrarian-fortune のユーモア占いとしての本質から導かれたもの。character-fortune には character-fortune 固有の要素を設計する。
- **キャラの口調を薄めること**: 現在のデータは全セクションがキャラ口調で統一されており、これは正しい。新構造でもこの原則を維持する。
- **相性診断機能を無視すること**: character-fortune 固有の強みである相性診断への誘導を組み込まないのはもったいない。
- **第三者視点のセクションをキャラ口調にすること**: (d)のセクションは客観視点にする。キャラ口調だと「キャラが自分の保護者について第三者に語る」という奇妙な構図になる。

### Step 2: 実装計画

#### Step 2-1: 型定義の追加

**ファイル**: `src/play/quiz/types.ts`

新しいインターフェース `CharacterFortuneDetailedContent` を追加し、`DetailedContent` union に加える。

```
variant: "character-fortune"
```

フィールド定義:

- `characterIntro: string` — キャラクターの自己紹介。キャラ口調で自分がどういう存在かを伝える1-2文（20-80字）。タイプ名の直下に表示する。contrarian-fortuneの `catchphrase` とは異なり、キャラの一人称で語られる「自己紹介」であること。
- `behaviorsHeading: string` — あるある箇条書きの見出し。キャラ口調の見出し（例: 「お前、こういうとこあるだろ?」）。各キャラで異なるため、データに含める。
- `behaviors: string[]` — キャラが語るあるある（3-5項目）。現在の behaviors をベースにリライト。
- `characterMessage: string` — キャラの本音（散文、150-400字）。現在の traits（箇条書き4項目）と advice を統合した散文。キャラ口調で「お前のここがすごい」「こういうところを活かせ」を一続きで語る。description の価値ある内容（キャラの人格が伝わる語りかけ）を characterMessage で十分にカバーすること。
- `thirdPartyNote: string` — 「このキャラの守護を受けている人と一緒にいると」のシーン描写（散文、客観視点、80-200字）。新規作成。
- `compatibilityPrompt: string` — 相性診断への誘導文。キャラ口調で「お前もやってみろよ」のような一文（20-80字）。**リンク先は診断トップページ（`/play/character-fortune`）とする**。現在の結果ページコンポーネントには character-fortune の相性表示ロジック（`extractWithParam.ts`）が未実装のため、相性結果への直リンクではなく診断トップへ誘導する。診断を受ければ動的結果画面で相性診断が利用できる。

#### Step 2-2: コンポーネントの対応

**ファイル**: `src/app/play/[slug]/result/[resultId]/page.tsx` および `page.module.css`

`detailedContent.variant === "character-fortune"` の分岐を追加する。

表示順序:

1. クイズ名 + shortDescription（既存）
2. アイコン + h1 タイプ名（既存）
3. `characterIntro`: h1直下に表示。キャラの口調が伝わる控えめなサブテキスト。accentColor の透過色背景カードで視覚的に区切る
4. description: **非表示**（contrarian-fortune と同様、metaタグのみ。description は本人向けの長文語りかけであり、第三者には characterIntro + 以降のセクションの方が価値がある。description のキャラ人格が伝わる価値ある内容は characterMessage で十分にカバーする）
5. CTA1: 「あなたの守護キャラも診断してみよう」ボタン
6. `behaviorsHeading` + `behaviors` 箇条書き: キャラ口調の見出し + あるある
7. シェアボタン中間配置（既存 ShareButtons コンポーネント再利用）
8. キャラの本音見出し（「〇〇からの本音」、〇〇はキャラ名の短縮形を使う。データではなくresult.titleからキャラ名を抽出するか、見出しもデータに含めるか要検討 → シンプルにデータに見出し `characterMessageHeading: string` を追加する）
9. `characterMessage` 散文表示
10. 第三者セクション: 見出し「このキャラの守護を受けている人と一緒にいると」+ `thirdPartyNote`
11. 相性診断誘導: `compatibilityPrompt` + 診断トップページ（`/play/character-fortune`）へのリンクボタン
12. 全タイプ一覧: 全6キャラをリスト表示（アイコン + タイプ名、現在のタイプをハイライト）+ CTA
13. シェアボタン（末尾、既存）

CSS追加:

- `characterIntro` 用スタイル（accentColor透過背景カード）
- `characterMessage` 用スタイル（散文表示、左寄せ）
- `compatibilitySection` 用スタイル
- その他は contrarian-fortune variant で追加済みのスタイル（`thirdPartySection`, `allTypesSection` 等）を再利用可能

**型定義の最終形（Step 2-1 を修正）**:

フィールド定義を以下に確定する:

- `characterIntro: string` — 自己紹介（20-80字、キャラ口調）
- `behaviorsHeading: string` — あるある見出し（5-30字、キャラ口調）
- `behaviors: string[]` — あるある（3-5項目、キャラ口調）
- `characterMessageHeading: string` — 本音セクションの見出し（5-30字、例: 「司令塔からの本音」）
- `characterMessage: string` — キャラの本音（150-400字、キャラ口調散文。description の価値をカバーすること）
- `thirdPartyNote: string` — 第三者視点シーン描写（80-200字、散文、客観視点）
- `compatibilityPrompt: string` — 相性診断誘導文（20-80字、キャラ口調。リンク先は診断トップページ）

#### Step 2-3: データの書き換え（6結果すべて）

**ファイル**: `src/play/quiz/data/character-fortune.ts`

6つの結果タイプそれぞれの `detailedContent` を新構造に書き換える。各タイプごとにサブエージェントに委譲し品質を個別に確保する。

書き換え方針:

- `characterIntro`: キャラが「俺はこういうやつだ」と自己紹介する1-2文を新規作成
- `behaviorsHeading`: キャラ口調の見出しを新規作成（例: commander→「お前、こういうとこあるだろ?」, professor→「心当たりがあるであるな?」, dreamer→「こういうところ、ありませんこと?」等）
- `behaviors`: 現在の `behaviors` をベースに、必要に応じてキャラ口調を強化。品質基準は「友人の顔が浮かぶ」具体的シーン
- `characterMessageHeading`: 各キャラの名称を含めた見出し（例: 「司令塔からの本音」「博士からの本音」等）
- `characterMessage`: 現在の `traits`（4項目箇条書き）と `advice` を統合した散文。キャラ口調で一続きの文章にリライト。内面分析 + 素質の指摘 + ポジティブな締め。150-400字。**description の価値ある内容（キャラの人格が伝わる語りかけ・本人への愛ある指摘）を characterMessage で十分にカバーすること**（description を非表示にする代わり）
- `thirdPartyNote`: 新規作成。「このタイプの友人と一緒にいるとこうなる」を具体的シーンで描写。客観視点。
- `compatibilityPrompt`: 新規作成。キャラ口調で相性診断への誘導。

また、meta から `resultPageLabels` を削除する（新variant では使用しないため）。

現在の `description` フィールドはSEOの meta description として引き続き使用するため変更しない。

#### Step 2-4: テストの更新

**ファイル**: `src/play/quiz/data/__tests__/character-fortune-detailed-content.test.ts`

現在のテスト（traits/behaviors/advice の存在・サイズ検証）を新構造に書き換える。

バリデーション項目:

- `variant` が `"character-fortune"` であること
- `characterIntro`: 非空、20-80字
- `behaviorsHeading`: 非空、5-30字
- `behaviors`: 3-5項目、各項目10-150字
- `characterMessageHeading`: 非空、5-30字
- `characterMessage`: 非空、150-400字
- `thirdPartyNote`: 非空、80-200字
- `compatibilityPrompt`: 非空、20-80字

他のクイズの detailedContent テストは変更不要。

#### Step 2-5: 表示確認（Playwright）

- character-fortune の全6結果タイプの静的結果ページを Playwright で目視確認
- モバイル表示でのレイアウト崩れがないか確認
- 他のクイズ（contrarian-fortune, music-personality 等）の結果ページが壊れていないか確認（後方互換性）

### 変更の順序と依存関係

```
Step 2-1（型定義）
  ↓
Step 2-2（コンポーネント）  ←→  Step 2-3（データ）は並行可能だが、型定義完了後に開始
  ↓                              ↓
Step 2-4（テスト更新）← Step 2-2・2-3 の両方が完了してから
  ↓
Step 2-5（表示確認）← すべて完了後
```

Step 2-3 は6タイプをそれぞれ個別のサブエージェントに委譲し、品質を確保する。

### 現状と理想のギャップ分析

| #   | 理想の要素                                       | 現状                                                   | ギャップ                                                                                              |
| --- | ------------------------------------------------ | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| (a) | キャラクターの自己紹介                           | descriptionに統合されているが長文                      | 新フィールド `characterIntro` が必要                                                                  |
| (b) | キャラが語る「あるある」（キャラ口調見出し付き） | `behaviors` + 汎用見出し「このキャラがやりがちなこと」 | 新フィールド `behaviorsHeading` + 既存 `behaviors` のリライト                                         |
| (c) | キャラの本音（散文）                             | `traits`（箇条書き）+ `advice`（別セクション）         | 新フィールド `characterMessage` + `characterMessageHeading`。traits/advice廃止                        |
| (d) | 第三者視点のシーン描写                           | 存在しない                                             | 新フィールド `thirdPartyNote` が必要                                                                  |
| (e) | 相性診断への誘導                                 | 存在しない                                             | 新フィールド `compatibilityPrompt` が必要。リンク先は診断トップページ（相性表示ロジック未実装のため） |
| (f) | 全タイプ一覧 + CTA                               | 存在しない                                             | コンポーネント側で実装（データ変更不要）                                                              |

### 検討した他の選択肢と判断理由

**選択肢A: 現在の標準形式（traits/behaviors/advice）のまま見出しだけ変更する**

resultPageLabels を活用してキャラ口調の見出しに変更する方式。最小限の変更で済むが、散文の `characterMessage` やキャラ自己紹介、第三者セクション、相性誘導を追加できない。character-fortune固有の価値を引き出せないため不採用。

**選択肢B: contrarian-fortune の構造をコピーして微修正する**

catchphrase → characterIntro, coreSentence → （削除）, persona → characterMessage のように対応させる方式。Owner指示に反する。また、contrarian-fortune の `coreSentence`（逆張りコンセプトの核心）や `humorMetrics`（笑い指標）はユーモア占い固有の要素であり、character-fortune には不要。`compatibilityPrompt`（相性誘導）は character-fortune 固有であり contrarian-fortune にはない。結果として似たフィールド名が出てくるのは問題ないが、設計の出発点が異なる必要がある。不採用。

**選択肢C（採用）: character-fortune の本質（キャラクターの人格による語りかけ + 相性診断）から導き出した固有構造**

キャラ口調の自己紹介、キャラ口調のあるある見出し、traits+adviceの散文統合、第三者視点セクション、相性診断誘導という5つの新要素を、character-fortuneの価値の中心から導出。結果として contrarian-fortune と似た要素（thirdPartyNote、全タイプ一覧等）が含まれるのは、第三者向けページという共通の文脈から自然に導かれたものであり、コピーではない。

### 計画にあたって参考にした情報

- `src/play/quiz/data/character-fortune.ts` — 現在のデータ構造（全6タイプの口調・内容を確認）
- `src/play/quiz/types.ts` — 現在の型定義（DetailedContent union, QuizResultDetailedContent, ContrarianFortuneDetailedContent）
- `src/app/play/[slug]/result/[resultId]/page.tsx` — 現在の表示ロジック（variant分岐の実装パターン）
- `src/play/quiz/data/__tests__/character-fortune-detailed-content.test.ts` — 現在のテスト
- `docs/cycles/cycle-141.md` — 前サイクルの設計・実装（discriminated union インフラ、contrarian-fortune の実装例）
- `docs/research/2026-03-31-contrarian-fortune-third-party-result-page-design.md` — contrarian-fortune の理想形設計レポート（参考として、コピーではなく）
- Google Analytics — character-fortune結果ページのトラフィック（現在ゼロ）
- Playwright — 現在の character-fortune 結果ページ（commander）および contrarian-fortune 結果ページの目視確認

## レビュー結果

### 実装計画のレビュー（2回）

- R1: 5件の指摘（相性診断誘導の実現可能性、description非表示理由、thirdPartyNote文字数制約、characterMessage文字数上限、見出しフィールド文字数制約）→ 修正
- R2: 指摘事項なし → 承認

## キャリーオーバー

## 補足事項

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
