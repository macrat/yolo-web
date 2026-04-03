---
id: 151
description: "結果体験の再設計: character-personality（B-269）"
started_at: "2026-04-03T21:00:11+0900"
completed_at: "2026-04-03T23:24:36+0900"
---

# サイクル-151

character-personality（キャラクター性格診断）の結果ページ体験をゼロから再設計する。受検者本人・第三者（シェアリンク経由）・両者の会話の3シナリオについて、来訪者にとっての最高の体験をconstitutionに基づいて検討し、ページ構成・コンテンツ構成・文体を決定して実装する。現状のフィールド構成やページ構成を所与としない。

## 実施する作業

- [x] character-personalityの現状の結果ページ・データ構造・コンテンツを全面的に把握する
- [x] 受検者本人・第三者・会話の3シナリオにおける理想体験をゼロベースで設計する
- [x] CharacterPersonalityDetailedContent variant型を定義・実装する
- [x] 全タイプのデータを新variant型に変換する
- [x] 専用具体ルート＋OGP画像を実装する
- [x] 受検者/第三者で統一体験を実装する
- [x] ダークモード対応・WCAG AA準拠を確認する
- [x] レビューを実施し、指摘事項をすべて解消する

## 作業計画

### 目的

キャラクター性格診断（character-personality）の結果体験を、24タイプのキャラクターアーキタイプの独自性を活かした専用variantに再設計する。現在の標準形式（traits/behaviors/advice）から脱却し、「2つのアーキタイプの融合で生まれたキャラ」「キャラ固有の口調」「友達との相性機能」という3つの独自要素を最大限に活かした結果体験を実現する。

### フィールド設計: CharacterPersonalityDetailedContent

character-personalityの独自性から導出した新フィールド構成:

| フィールド           | 型                        | 文字数目安 | 設計理由                                                                                                                                                                                                                                                                                            |
| -------------------- | ------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`            | `"character-personality"` | -          | discriminated union 識別子                                                                                                                                                                                                                                                                          |
| `catchphrase`        | `string`                  | 15-30字    | タイプのキャッチコピー。OGP・シェア時の印象を決める一行（確立パターン）。**キャラの口調で書く**                                                                                                                                                                                                     |
| `archetypeBreakdown` | `string`                  | 80-150字   | **character-personalityならでは**: 2つのアーキタイプ（commander, professor等）がどう融合してこのキャラが生まれたかの解説。yoji-personalityのkanjiBreakdownに相当する「このタイプの成り立ち」。来訪者が「なるほど、commanderとprofessorが混ざるとこうなるのか」と納得する知的コンテンツ              |
| `behaviors`          | `string[]`                | 4項目      | あるある・共感シーン（確立パターン）。キャラの日常が現れる場面                                                                                                                                                                                                                                      |
| `characterMessage`   | `string`                  | 50-200字   | **character-personalityならでは**: キャラからのメッセージ。各キャラの固有口調（commander系「だぜ/俺/お前」、dreamer系「ですわ/わたくし」等）を最大限に活かした締めのひとこと。既存のadviceを口調を強化してリライト。yoji-personalityのmotto、traditional-colorのcolorAdviceに相当する締めセクション |

**提案型との差分と判断理由**:

- 提案型をほぼ採用。`characterMessage`の文字数目安を50-200字に設定。既存adviceは49-75字だが、口調を「強化」してリライトする際に装飾語句（例:「であるぞ」「っしょ」等の繰り返し、呼びかけ、感情表現）で字数が増加する。character-fortune（同じキャラクター系）のcharacterMessageは203-265字であり、それよりはコンパクトに保つが、口調のニュアンスを十分に表現できる上限200字とする
- `traits`は`archetypeBreakdown`に吸収する。アーキタイプの組み合わせ解説が性格特性の説明を内包するため、別途リストにする必要がない。behaviorsの中にも特徴は自然に表現される（yoji-personalityと同じ判断）
- `advice`は`characterMessage`に置き換える。汎用アドバイスではなく「キャラが語りかける」フレーミングで口調の独自性を活かす
- 「相性誘導」フィールドの追加は不要。character-fortuneのようにデータに`compatibilityPrompt`を持たせるのではなく、ページ側（Content.tsxやpage.tsx）でInviteFriendButtonを配置する方式にする。24タイプ分のデータに相性誘導文を書くのはコストに対してリターンが小さい

**標準形式からの変換方針**:

- `traits`: 削除。archetypeBreakdown が「2つのアーキタイプの融合」という切り口でタイプの本質を説明するため、別途特徴リストは不要
- `behaviors`: 維持・リライト。4項目に統一し、キャラの日常が現れるシーンにフォーカス
- `advice`: `characterMessage`にリライト。口調を強化し、キャラが直接語りかけるトーンに変更

### 表示セクション構成: CharacterPersonalityContent コンポーネント

表示順（上から下）:

1. **catchphrase**（呼び出し側で表示 — ResultCard/page.tsx の責務）
2. **「このキャラの成り立ち」**（archetypeBreakdown セクション）
   - 2つのアーキタイプの融合を解説する知的コンテンツ。「commanderの行動力とprofessorの分析力が混ざると...」のような解説
3. **「このキャラの日常」**（behaviors セクション）
   - 共感あるある4項目。キャラの日常が現れるシーン
4. **「キャラからのメッセージ」**（characterMessage セクション）
   - キャラ口調での締めのメッセージ。キャラが直接語りかける
5. **相性機能エリア**（afterCharacterMessage スロット / referrerTypeId による内部生成）
   - page.tsx: afterCharacterMessage スロット経由で InviteFriendButton + CompatibilityDisplay（?with= がある場合）を配置
   - ResultCard: referrerTypeId prop 経由。コンポーネント内部でAPI（`/api/quiz/compatibility`）から相性データを取得し、CompatibilitySection + InviteFriendButton を表示。referrerTypeId がない場合は InviteFriendButton のみ表示
6. **全タイプ一覧**（他のキャラも見てみよう）

**構成の意図**: 知的コンテンツ（成り立ち）→ 共感コンテンツ（あるある）→ キャラの声（メッセージ）→ ソーシャル（相性）の流れ。最初に「なるほど」を提供してから共感に入り、キャラの声で感情を盛り上げ、最後に「友達にもやらせよう」という行動につなげる。

### 相性機能の統合方針

character-personalityは300件の相性データを持っており、動的ルートで`?with=typeId`パラメータによる相性表示機能が実装済み。専用ルートへの移行にあたって以下を引き継ぐ:

- **page.tsx**: `searchParams`を受け取り、`?with=typeId`パラメータから相性データを解決。music-personalityの専用ルートと同じパターン
- **generateMetadata**: 相性ページ（?with=あり）の場合はtitle/descriptionを相性用に変更し、noindex設定
- **CompatibilityDisplay**: `afterCharacterMessage`スロット経由でContent内に配置
- **InviteFriendButton**: 相性がない場合（?with=なし）は友達招待ボタンを表示
- **ResultCard内**: InviteFriendButtonを`afterCharacterMessage`スロット経由で配置（受検後に友達を招待）
- **extractWithParam.ts**: character-personalityの分岐は動的ルートのextractWithParamに既存。専用ルートではpage.tsx内で直接バリデーションする（music-personalityと同じパターン）

### 実装ステップ

#### Step 1: 型定義

**変更ファイル**: `src/play/quiz/types.ts`

- `CharacterPersonalityDetailedContent` インターフェースを追加（variant: "character-personality", catchphrase, archetypeBreakdown, behaviors, characterMessage）
- `DetailedContent` union 型に `CharacterPersonalityDetailedContent` を追加

#### Step 2: データ変換

**変更ファイル**: 3つのバッチファイル

- `src/play/quiz/data/character-personality-results-batch1.ts`（10タイプ）
- `src/play/quiz/data/character-personality-results-batch2.ts`（10タイプ）
- `src/play/quiz/data/character-personality-results-batch3.ts`（4タイプ）

**24タイプは3バッチに分けて作業する。各バッチを独立したサブエージェントに委任し、バッチ完了ごとにレビューを実施する。品質のばらつきを防ぐため、最初のバッチ（batch1の最初の3タイプ）を先に完成させてトーン基準とし、残りはそれに合わせる。**

**Step 2-a: アーキタイプ組み合わせの事前整理**

- 24タイプすべてについて、primary archetype と secondary archetype の組み合わせを一覧化する（データファイルのコメントに既に記載あり）
- 各アーキタイプの基本特性（commander=行動力・リーダーシップ、professor=分析力・知識、dreamer=感性・想像力、trickster=機転・遊び心、guardian=堅実・保護、artist=創造・表現）を定義し、archetypeBreakdown 記述の基準にする
- **純粋形6タイプ（同アーキタイプ組み合わせ）の archetypeBreakdown 記述方針**: ultimate-commander（commander x commander）、endless-researcher（professor x professor）、eternal-dreamer（dreamer x dreamer）、ultimate-trickster（trickster x trickster）、ultimate-guardian（guardian x guardian）、ultimate-artist（artist x artist）の6タイプは「2つのアーキタイプの融合」ではなく「1つのアーキタイプの純粋形・極致」である。これらの archetypeBreakdown では「融合で生まれた」ではなく、「そのアーキタイプの特性が二重に増幅されることで生まれる極端さ・面白さ」を解説する。例: ultimate-commander なら「commanderの行動力が二重にかかることで、考える前に体が動き、止まることを知らない究極の行動派が生まれる」のような切り口。セクション見出し「このキャラの成り立ち」はそのまま使えるが、本文の書き出しは「2つの〜が融合して」ではなく「〜の特性が極限まで研ぎ澄まされると」のようなフレーミングにする
- **これは創作コンテンツ**であり、ファクトチェックは不要。ただしエンターテインメントとして24タイプ間で矛盾がないことを確認する

**Step 2-b: データ作成（3バッチに分割）**

各タイプの detailedContent を新 variant 形式に書き換え:

- catchphrase: 新規作成（15-30字、**キャラの口調**で書く）
- archetypeBreakdown: 新規作成（80-150字、2つのアーキタイプの融合解説）
- behaviors: 既存データをベースにリライト（4項目に統一、必要に応じてキャラらしさを強化）
- characterMessage: 既存の advice（49-75字）をベースにリライト（キャラの口調を強化し、「キャラからのメッセージ」としてのフレーミングに変更。口調の装飾で字数が増えるため、50-200字の範囲で十分に表現する）
- FAQ 回答テキストの更新: 現行FAQ5問のうち、新フィールド構成の影響を受けるものを特定して修正する:
  - **FAQ 1**（問題数・所要時間）: 影響なし。問題数・所要時間は変わらない
  - **FAQ 2**（24タイプの決まり方）: 影響なし。スコアリングロジックは変わらない
  - **FAQ 3**（キャラ名の由来）: 影響なし。キャラ名自体は変更しない
  - **FAQ 4**（やり直しと結果変化）: 影響なし。再受検の仕組みは変わらない
  - **FAQ 5**（相性診断の組み合わせ数）: **要確認**。現在の回答は「二人の関係性を描いた相性コメントが表示されます」とあり、相性機能自体は変わらないが、結果ページの構成が変わる（ResultExtraLoader経由ではなくContent内に統合）ため、ユーザーが見る画面は変わらないので回答テキスト自体の修正は不要。ただし、結果ページに「キャラの成り立ち」「キャラの日常」「キャラからのメッセージ」という新セクションが加わることを踏まえ、FAQ全体を通読して「結果に表示される情報」に言及している箇所がないか再確認する。**結論: 現行FAQ5問はいずれもフィールド構成に直接言及していないため、回答テキストの修正は不要。ただし `resultPageLabels` を削除するため、meta から `resultPageLabels` を削除する作業は必要**
- `resultPageLabels` をメタから削除（専用コンポーネントがセクション見出しを直接管理するため）

**キャラ口調の一貫性チェック**: 各タイプのdescription（既存）の口調と、catchphrase/characterMessage（新規）の口調が一致していることを確認する。例:

- commander系（blazing-\*）: 「だぜ/な/俺/お前」
- professor系（\*-scholar, contrarian-professor）: 「であるぞ/吾輩/ですな」
- dreamer系（dreaming-\*, star-chaser, tender-dreamer, eternal-dreamer）: 「ですわ/わたくし」等
- trickster系（ultimate-trickster, clever-guardian, creative-disruptor）: 「っしょ/じゃん」
- guardian系（gentle-fortress, ultimate-guardian, data-fortress, guardian-charger）: 「ですよ/私」
- artist系（ultimate-artist, vibe-rebel）: 感性的な表現

#### Step 3: ResultCard.tsx の更新

**変更ファイル**: `src/play/quiz/_components/ResultCard.tsx`

- `CharacterPersonalityDetailedContent` の import を追加
- `CharacterPersonalityContent` の dynamic import を追加
- `renderDetailedContent` の switch 文に `case "character-personality"` を追加
- `CATCHPHRASE_VARIANTS` に `"character-personality"` を追加
- `CATCHPHRASE_ACCENT_COLOR` に `"character-personality": result.color ?? null` を追加（タイプ固有色を使用）
- character-personality の case では、`referrerTypeId` を CharacterPersonalityContent に渡す。コンポーネント内部で referrerTypeId の有無に応じて相性セクション（API経由）または InviteFriendButton を表示する（MusicPersonalityContent の referrerTypeId パターンと同じ）。これにより、既存の `CharacterPersonalityResultExtra`（ResultExtraLoader経由）は不要になるため、ResultExtraLoader.tsx から character-personality の分岐を削除する（Step 8 のクリーンアップに含める）

#### Step 4: 専用コンポーネント作成

**新規ファイル**:

- `src/play/quiz/_components/CharacterPersonalityContent.tsx`
- `src/play/quiz/_components/CharacterPersonalityContent.module.css`

**コンポーネント設計**:

- Client Component（"use client"）: referrerTypeId が渡された場合にAPI経由で相性データをフェッチするため、useStateとuseEffectが必要。MusicPersonalityContentと同様のパターン
- Props: content, resultId, resultColor, headingLevel(2|3), allTypesLayout("list"|"grid"), referrerTypeId?(string), afterCharacterMessage?(ReactNode)
- **allTypesLayout の選択**: character-personality は24タイプあるため、"pill"（yoji-personality: 8タイプ）では横に長くなりすぎ、"list"（traditional-color: 8タイプ）では縦に長くなりすぎる。新たに "grid" レイアウトを CharacterPersonalityContent 内に実装し、2-3列のグリッドで24タイプを表示する。各セルにはアイコン+短縮タイトルを表示し、コンパクトに全タイプを一覧できるようにする。ResultCard内では "list"（縦スクロール可能な簡潔表示）、結果ページ（page.tsx）では "grid" を使用する。"grid" レイアウトは CharacterPersonalityContent 内でのみ実装し、他の既存 Content コンポーネント（MusicPersonalityContent, YojiPersonalityContent 等）への展開は本サイクルでは行わない
- **referrerTypeIdの処理**: MusicPersonalityContentと同じパターンを採用する。referrerTypeIdが渡された場合（ResultCardからの呼び出し）、コンポーネント内部で `buildAfterCharacterMessage(resultId, referrerTypeId)` を実行し、APIで相性データを取得してCompatibilitySection + InviteFriendButtonを生成する。afterCharacterMessageが外部から渡された場合（page.tsxからの呼び出し）はそちらを優先する。ただし character-personality は24タイプ・300件の相性データがあり、クライアントバンドルへの混入を避けるため、MusicPersonalityContentのように直接インポートするのではなく、既存の `CharacterPersonalityResultExtra` と同様にAPI経由（`/api/quiz/compatibility`）で取得する方式にする。つまりコンポーネントは "use client" とし、referrerTypeIdが渡された場合のみAPIフェッチを行う
- **APIフェッチ中のローディングUI**: referrerTypeIdが渡されてAPIフェッチが発生する間のローディング表示は、既存の `CharacterPersonalityResultExtra.tsx`（104-108行目）のパターンを踏襲する。具体的には、`loading` state が true の間、「相性データを読み込み中...」のテキストを中央揃え・パディング付き・半透明（opacity: 0.6）で表示する。スケルトンUIは相性セクションの高さが相性結果によって変動するため不採用とし、シンプルなテキストローディング表示を採用する。また、`fetchFailed` state の場合はエラーメッセージを表示せず、フォールバックとして InviteFriendButton のみを表示する（既存パターンと同じ）
- --type-color CSS変数でタイプ固有色を注入（traditional-color/yoji-personality パターン踏襲）
- ダークモード対応: color-mix() で背景の opacity 調整、WCAG AA 準拠のコントラスト確保
- CSS変数には `var(--type-color, #374151)` のようにフォールバック値を設定（cycle-150の教訓）
- YojiPersonalityContent.tsx を参考に、セクション構成: archetypeBreakdown → behaviors → characterMessage → afterCharacterMessage → allTypes

#### Step 5: 専用ルート作成

**新規ファイル**:

- `src/app/play/character-personality/result/[resultId]/page.tsx`
- `src/app/play/character-personality/result/[resultId]/page.module.css`
- `src/app/play/character-personality/result/[resultId]/opengraph-image.tsx`

**ルート設計**:

- music-personalityの専用ルートをテンプレートとして使用（相性機能を持つため）
- **searchParams を受け取り、`?with=typeId` パラメータから相性データを解決する**
- **generateMetadata**: 相性ページの場合はtitle/descriptionを相性用に変更し、noindex
- OGP画像: result.color をタイプ固有色として使用。`createOgpImageResponse` + `getContrastTextColor` を活用
- generateStaticParams で全24タイプのパスを生成
- DescriptionExpander を使用した description 表示
- CharacterPersonalityContent の afterCharacterMessage スロットに:
  - CompatibilityDisplay（?with= がある場合）
  - InviteFriendButton（友達招待ボタン）
  - CTA2（テキストリンク形式）
- shareTextのハッシュタグ: music-personalityの専用ルートと同じ統一パターンを使用する。`#${quiz.meta.title.replace(/\s/g, "")} #yolosnet` すなわち `#あなたに似たキャラ診断 #yolosnet`。quiz.meta.titleにはスペースが含まれないため実質そのまま使用される。クイズ間でハッシュタグ生成パターンを統一し、保守性を確保する

**動的ルートからの移行**: 専用ルート作成後、動的ルート（`/play/[slug]/result/[resultId]/page.tsx`）の character-personality 関連のインポートとロジックを削除する。Next.jsのファイルシステムルーティングにより専用ルートが自動的に優先されるが、不要なコード（`getCharacterCompatibility` インポート等）は削除してクリーンにする。

#### Step 6: テスト

**新規ファイル**:

- `src/play/quiz/data/__tests__/character-personality-detailed-content.test.ts`
- `src/play/quiz/_components/__tests__/CharacterPersonalityContent.test.tsx`
- `src/app/play/character-personality/result/[resultId]/__tests__/page.test.ts`
- `src/app/play/character-personality/result/[resultId]/__tests__/opengraph-image.test.ts`

**既存テスト更新**:

- `src/play/quiz/__tests__/types-detailed-content.test.ts`: CharacterPersonalityDetailedContent の variant テスト追加
- `src/play/quiz/_components/__tests__/ResultCard.test.tsx`: character-personality variant の case テスト追加

**テスト内容（データ）**:

- variant が "character-personality" であること
- catchphrase: 15-30字、全24タイプでユニーク
- archetypeBreakdown: 80-150字、全24タイプでユニーク
- behaviors: 正確に4項目、各項目が空でないこと
- characterMessage: 50-200字、全24タイプでユニーク
- 旧フォーマットフィールド（traits/advice）が存在しないこと
- resultPageLabels がメタから削除されていること

**テスト内容（相性機能）**:

- 専用ルートのpage.tsxが`searchParams`を正しく処理すること
- `?with=validTypeId`の場合にCompatibilityDisplayが表示されること
- `?with=invalidTypeId`の場合に相性セクションが表示されないこと

#### Step 7: ビルド確認・ビジュアルテスト

- `npm run lint && npm run format:check && npm run test && npm run build` を実行して全パス確認
- **本番ビルドで確認する**（devサーバーでは専用ルートが動的ルートにフォールバックする偽陽性があるため — cycle-150の教訓）
- Playwright で結果ページの表示を確認:
  - ライトモード / ダークモード
  - デスクトップ / モバイル
  - 受検者向け（ResultCard）/ 第三者向け（専用ルート）
  - 複数タイプ（色の異なるタイプを最低3つ、アーキタイプの異なるものを選択）
  - **相性ページ**（`?with=typeId` パラメータ付き）
- WCAG AA コントラスト比の確認（特にダークモードでの明るい色タイプ）

#### Step 8: 動的ルートのクリーンアップ

- `src/app/play/[slug]/result/[resultId]/page.tsx` から character-personality 関連のインポート（`getCharacterCompatibility`, `characterPersonalityQuiz`）と分岐ロジックを削除
- `src/app/play/[slug]/result/[resultId]/extractWithParam.ts` から character-personality 関連の分岐を削除
- `src/play/quiz/_components/ResultExtraLoader.tsx` から character-personality 関連の分岐を削除（相性機能は CharacterPersonalityContent 内に統合されたため不要）
- `src/play/quiz/_components/CharacterPersonalityResultExtra.tsx` を削除（同上）
- 関連テストの更新（`ResultExtraLoader.test.tsx`, `CharacterPersonalityResultExtra.test.tsx` 等）

#### Step 9: 来訪者目線レビュー

- 来訪者目線で結果ページの魅力・楽しさ・エンゲージメントをレビュー
- 「このキャラの成り立ち」はアーキタイプの融合が面白く伝わるか
- 「キャラからのメッセージ」はキャラ口調が活きているか
- 相性機能への導線は自然か（友達にやらせたくなるか）
- 24タイプ間でクオリティにばらつきがないか
- シェアしたくなる体験か

### 検討した他の選択肢と判断理由

#### 選択肢A: strengths/weaknesses パターン（animal-personality/music-personality 踏襲）

- **不採用理由**: character-personalityの独自性（アーキタイプの組み合わせ、キャラ口調）を活かせない。strengths/weaknesses は動物や音楽ジャンルのような「性質の分類」には合うが、キャラクター診断は「キャラの人格そのもの」が主役であり、分析的なリスト形式より語りかけ形式の方が体験として優れている

#### 選択肢B: character-fortune と同じフィールド構成を流用（characterIntro, behaviorsHeading, characterMessage, thirdPartyNote, compatibilityPrompt）

- **不採用理由**: character-fortune は「守護キャラ占い」であり、キャラが語り手として占い結果を伝える形式。character-personality は「あなたに似たキャラ」であり、キャラ自体がユーザーの分身。同じフィールドでは「分身としてのキャラ」の面白さ（アーキタイプの組み合わせ、自分自身の行動パターンとのリンク）を活かせない。archetypeBreakdown（成り立ち解説）は character-fortune にない独自要素

#### 選択肢C: データに `compatibilityPrompt`（相性誘導文）フィールドを追加

- **不採用理由**: 24タイプ分のキャラ口調での誘導文をデータに持たせるコストが高い。ページ側でInviteFriendButtonを配置すれば十分であり、character-fortuneの6タイプと違って24タイプでは効率が悪い。誘導文はUI側で統一的に管理する方が一貫性を保てる

#### 選択肢D: archetypeBreakdown を省略し、catchphrase + behaviors + characterMessage の3フィールドのみにする

- **不採用理由**: archetypeBreakdown がないと「2つのアーキタイプの融合」というcharacter-personalityの最大の独自性が活かせない。catchphraseは短すぎて融合の面白さを伝えきれない。知的コンテンツの厚みが減り、結果ページの滞在時間とシェア意欲が低下する

#### 選択肢E: traitsフィールドを残す（archetypeBreakdownとは別に）

- **不採用理由**: archetypeBreakdownがアーキタイプの融合を通じて性格特性を説明するため、別途traitsリストを持つと情報が重複する。セクション数が増えすぎると来訪者が離脱するリスクもある。yoji-personalityでも同じ判断で traits を削除している

### 計画にあたって参考にした情報

- **cycle-150（yoji-personality再設計）の実装パターンと申し送り**: 型定義、コンポーネント、ルート、テストの構造、CSSフォールバック値、本番ビルドでの確認、FAQテキストのフィールド名露出防止など
- **cycle-149（traditional-color再設計）の申し送り**: 「推測するな、確認しろ」「来訪者目線レビュー最優先」「ファクトチェック」等の教訓
- **music-personalityの専用ルート**: 相性機能（?with=パラメータ、CompatibilityDisplay、メタデータ生成）の統合パターン。character-personalityも同じ相性機能を持つため、このパターンを踏襲
- **character-fortuneの専用ルート**: キャラクター系クイズのページ構成の参考。ただしフィールド構成は流用しない（上記選択肢Bの理由）
- **既存の character-personality データ**: 24タイプの detailedContent（traits/behaviors/advice）、キャラ口調、アーキタイプの組み合わせ情報を確認
- **ResultCard.tsx**: CATCHPHRASE_VARIANTS / CATCHPHRASE_ACCENT_COLOR の宣言的管理パターン
- **動的ルート page.tsx / extractWithParam.ts**: character-personality の相性機能が既に動的ルートに実装されていることを確認。専用ルート移行後のクリーンアップが必要
- **Google Analytics**: character-personalityのページビューは公開以来ごく少数。結果ページの充実により検索流入とシェア拡散の改善が期待できる

## レビュー結果

### 計画レビュー（R1〜R3）

- R1: 5件指摘（必須2件、推奨3件）→ 全件修正
- R2: 3件指摘（必須2件、推奨1件）→ 全件修正
- R3: 指摘事項なし → 計画承認

### 実装レビュー（R1）

- 来訪者体験、データ品質、技術的正確性、Constitution準拠の全観点で承認
- 24タイプ全てのデータを精読し、キャラ口調の一貫性・フィールド文字数・ユニーク性を確認
- ライトモード/ダークモード/モバイル/相性ページのスクリーンショットで視覚確認済み
- 指摘事項なし

## キャリーオーバー

なし

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
