---
id: 247
description: 実測で人気の診断「言葉センス診断」(word-sense-personality) の結果ページ8タイプに detailedContent(traits/behaviors/advice) を執筆し、結果体験を character-personality と同水準に引き上げる(B-323)。診断を遊んだ人の「わかる!・シェアしたい」を深めることが目的。index 化/sitemap 掲載は cycle-136 に沿う副次効果。
started_at: "2026-06-16T15:10:32+0900"
completed_at: null
---

# サイクル-247

このサイクルでは、実測で人気の診断「言葉センス診断」(`word-sense-personality`) の**結果体験を厚くする**（B-323）。2026-06-15 の検索流入分析で診断系（/play 系）が実測の勝者と確定しており、その中で word-sense は **CTR 14%（オーガニック上位）と人気が高いのに、結果ページに `detailedContent` が無く結果体験が薄い**（character-personality は detailedContent 完備でリッチ）。この非対称を是正し、診断を遊んだ人の「面白い・わかる!・シェアしたい」を深める。

**目的の所在（cycle-136 の戦略に回帰）**: 結果ページ価値向上の目的は **診断を遊んだ来訪者へのエンタメ価値**であり、index 化・検索露出は cycle-136 が明記した「デメリットのない副次効果」。本サイクルは指標（CTR・検索露出）を目的化しない（後述「軌道修正」）。`detailedContent` は受検者本人の ResultCard と第三者向け静的結果ページの**両方**に表示されるため（B-259 の逆転現象は解消済み）、執筆は両来訪者の体験を同時に厚くする。

## 実施する作業

> **確定レバー**: 人気診断 word-sense の結果8タイプに `detailedContent` を執筆し、結果体験を character-personality と同水準へ引き上げる。yoji 詳細メタ（cycle-246）には触れない。根拠 `tmp/cycle-247/scope.md`、検証済み（word-sense 8結果は detailedContent ゼロで結果体験が薄い・全 noindex / index 判定 = result page.tsx:79-80 / detailedContent は ResultCard と静的ページ両方に表示）。

- [x] **スコープ確定（分析）**: 最新 GA4/SC（BigQuery, 2026-06-16）＋発見性監査で単一レバーを確定。`tmp/cycle-247/scope.md`。PM が核心コード事実を再検証済み。
- [x] **word-sense-personality の8結果に `detailedContent` を執筆**: 標準形式 `QuizResultDetailedContent`（`traits` 3-5項目 / `behaviors` 3-5項目 / `advice` 1-2文）を8タイプ（一字千金/和顔愛語/奇想天外/理路整然/花鳥風月/疾風迅雷/抱腹絶倒/柔和温順タイプ）に付与。`src/play/quiz/data/word-sense-personality.ts`。結果タイプ単位で sub-agent を8並列分割（各 writer に全8タイプの description を渡し相互差別化と声の一貫性を担保）。品質基準は character-personality の既存 detailedContent に揃え、各タイプ固有・既存 description のあるあると非重複・前向きな敬体。
- [x] **品質テストの追加**: `__tests__/word-sense-personality-detailed-content.test.ts` を新設。8結果の detailedContent 存在・標準形式（variant なし）・traits/behaviors 3-5・各非空・advice 非空・型横断の重複なし（コピペ事故検出）を恒久ロック。
- [x] **sitemap への結果ページ追加（副次効果としての発見補助）**: `src/app/sitemap.ts` に index 対象の結果ページ（`detailedContent` を持つもの）を `/play/:slug/result/:id` として列挙。index 可否は `detailedContent` 有無で判定し noindex は載せない（robots と整合）。UX には不可視で無害。cycle-136 の「実体的価値を備えた結果ページの index 化は副次効果」に沿う。
- [x] **resultPageLabels の追加（規約遵守）**: 標準形式 detailedContent クイズは「第三者向けタイプ解説ページ」として差別化・三人称の見出しを持つのが既存規約（`result-page-labels.test.ts` が明文化）。word-sense に `resultPageLabels`（持ち味/こんな言葉づかいをしがち/言葉センスをもっと活かすには）を追加。デフォルト見出し「このタイプのあるある」を回避し、各 description 末尾の「あるある：」とのラベル重複も解消。同テストに word-sense を追加し規約を強制。
- [x] **可視確認**: reviewer が本番ビルドを Playwright で実機確認。ダーク/ライト×PC/モバイルでスクショ（`tmp/cycle-247/verify/`）。robots=index, 新見出し表示, あるある二重解消, レイアウト破綻なしを確認。
- [x] **レビュー**: reviewer 3名（内容/コード+視覚/修正後視覚）。指摘と対応は補足「レビュー記録」参照。重大(S-1 ダークモード可読性)・中(M-1 あるある二重)を是正し再確認済み。
- [x] **品質ゲート**: `npm run lint`・`format:check`・`vitest run`(全 5500+ 件)・`npm run build` すべて成功（tsc --noEmit も 0）。

## 作業計画

### 目的

実測で人気の診断（word-sense-personality）を遊んだ来訪者に、より厚い「面白い・わかる!・シェアしたい」結果体験を届ける。word-sense は人気が高い（CTR 14%）のに結果ページに detailedContent が無く、character-personality に比べ結果体験が薄い。この非対称を是正することが来訪者価値であり、その結果としてのページ価値向上・index 化は cycle-136 が定義した副次効果。**指標（CTR・検索露出）は目的ではない**。

### 作業内容

1. **スコープ確定（分析）** — 最新 GA4/SC を foreground sub-agent で取得し、2026-06-15 研究との差分（直近の伸び・新規取りこぼしクエリ）を確認。並行して強コンテンツの発見性・SEO 現状をコード監査（診断ページのメタ生成、回遊導線、sitemap、内部リンク）。来訪者価値が最大の単一レバーを確定し、`tmp/cycle-247/scope.md` に判断と根拠を記録。
2. **実装** — 確定レバーを実装。複数コンテンツに跨る場合はコンテンツ単位で sub-agent 分割。
3. **検証** — 可視変更は take-screenshot、メタ/JSON-LD は実出力を検証。
4. **レビュー＋品質ゲート**。

### 検討した他の選択肢と判断理由

- **AP 集の整理（B-491/B-392/B-390・P1）**: 当初これを推奨しかけたが、来訪者価値を直接生まない社内プロセス負債であり、来訪者向けレバーが「測定待ち」であることを実装コスト的な理由として優先根拠にしていた。CLAUDE.md Decision Making Principle（実装コスト・複雑さを劣る UX を選ぶ理由にしてはならない／来訪者価値を最大化せよ）に反するため**不採用**。Owner の指摘で是正。
- **四字熟語 CTR の再強化**: 最大露出源だが cycle-246 で対応済み・効果遅効性。同一レバーの再施行は測定窓を汚すため本サイクルでは対象外。
- **新規ツール群の追加（B-317/320/321 等・P2）**: 実測でツール系は流入が薄くロングテールも弱い。強コンテンツを伸ばす方が来訪者価値・PV 期待値が高いため後回し。

### 計画にあたって参考にした情報

- `docs/research/2026-06-15-search-traffic-priority-reassessment.md`（GA4/SC 実測。四字熟語=全体露出 40.8%・CTR 0.42%、診断系のみクリック立ち、ツール/QR/敬語は露出薄）
- `docs/cycles/cycle-246.md`（B-515: 四字熟語詳細の出典/構成表示＋メタ/JSON-LD 改善。効果は遅効性）
- コード監査: `src/app/sitemap.ts`（priority 0.8〜0.9）、`src/play/recommendation.ts`（`getPlayRecommendationsForDictionary`）、辞典詳細 3 種（yoji/kanji/colors）が診断レコメンドを保持
- `CLAUDE.md` Decision Making Principle / `docs/constitution.md`

## キャリーオーバー

- **結果ページからの「他のタイプ回遊」導線**: 本サイクルで一度実装（`OtherResultTypes`）したが、当初の動機が SEO 内部リンク偏重で、全診断共通の `ResultPageShell` に触れる UI 追加にもかかわらず、ターゲットユーザー起点の設計・フロントエンドデザイン・視覚確認を欠いていたため撤回した。「SEO だから」ではなく「来訪者価値起点で独立に設計判断すべき機能」だから。backlog に新規起票（B-516）。

## 補足事項

### 軌道修正の記録（AP-P09 / 結果ページの「誰向け」問題）

本サイクルは途中で 2 段階の是正を行った。学びとして恒久記録する。

1. **第一の誤り（AP-P09: ゴールの読み替え）**: 当初スコープを「診断結果ページが**検索露出ゼロ**という空白を埋める／**検索資産化**」と、SEO 指標（露出・CTR）を**目的**に据えて立てていた。結果ページ領域は B-259（cycle-145/146）で「シェア率最適化を来訪者価値と同一視した誤った体験設計」により完全失敗＋やり直し＋Owner 6回以上介入という重大事故を起こした領域であり、AP-P09（「higher PV by best value for visitors」を「Google評価／SEOスコア」に読み替えない）にも該当。Owner の指摘で是正。**正しい目的**は「人気診断を遊んだ来訪者の結果体験を厚くする」であり、index 化は cycle-136 が定義した副次効果。detailedContent の執筆自体はこの正しい目的に資するため**残置**。一方、SEO 内部リンク偏重で足した結果ページ相互リンク（`OtherResultTypes`）は撤回（→ B-516）。
2. **第二の誤り（過剰是正）**: 第一の是正の勢いで、sitemap への結果ページ掲載まで「SEO だから」と撤去しかけた。だが「SEO をやってはいけない」という教訓は存在しない。教訓（AP-P09 / cycle-145・155・159）が禁じるのは (a) SEO を**目的化**して来訪者価値を犠牲にすること、(b) **UX を害す** SEO 施策（cycle-159＝解説テキストでツールを押し出し）であり、cycle-136 は結果ページの index 化を「デメリットのない副次効果」として正当に実施している。sitemap 掲載は UX に不可視・無害で、実体的価値を備えた今のページの発見を助けるだけ。よって**撤去を取り消し復元**。Owner の指摘で是正。

→ プロセス改善案: 計画のゴールを delegate 前に AP-P09 で明示的に検査する（指標が目的化していないか）。同時に「SEO＝悪」への過剰反応も避ける（無害・副次効果の SEO まで切らない）。詳細は cycle 完了時に anti-patterns/knowledge へ反映を検討。

### レビュー記録（reviewer 3名）

- **S-1【重大・是正済】ダークモードで traits（特徴）が判読不能**: 結果ページ共通 CSS `.traitsItem` が未定義トークン `var(--color-surface, #f8f8f8)` を使い、ダークで薄灰文字×明背景になっていた潜在バグを、word-sense の detailedContent 描画が初めて露出。姉妹ファイル同様 `var(--color-bg-secondary)`（テーマ対応）へ修正。実機 computed style でダーク 12.27:1 / ライト 16.51:1（WCAG AAA 超）を確認。`page.module.css`。
- **M-1【中・是正済】description 末尾「あるある：」と behaviors 既定見出し「このタイプのあるある」が二重**: description を削ると 300字下限基準を割るため削らず、`resultPageLabels` で behaviors 見出しを「こんな言葉づかいをしがち」に差別化してラベル重複を解消（規約遵守も同時達成）。
- **B-M1【中・判断記録】sitemap 追加が word-sense 以外の detailedContent 結果ページ（計97 URL）にも及ぶ**: これらは元々 index 対象だが sitemap 未掲載だったページ。robots と整合し、kanji 辞典詳細（数千件・クロールバジェット配慮で除外）と異なり97件は小規模。**意図して**「detailedContent を持つ index 対象結果ページは sitemap に掲載」という一般ルールを採用（特例化しない方が一貫）。
- **L-2【軽微・是正済】bold-impact の traits が「あなたは」始まりで単調**: 文頭を2か所変化。
- **L-1【軽微・許容】warm-empathy↔gentle-indirect で「語尾調整」モチーフ近接**: 各タイプの核（癒し vs 角を立てない間接表現）は明確に差別化されており、reviewer も「公開に値する水準」と評価。許容。
- 内容実質（価値・タイプ固有性・声・第三者整合）は reviewer が観点1〜4で「問題なし」。B-259 的な「誰向け取り違え」の再発なし。

### 完了率・到達経路の検証（Owner 指摘で後追い実施 / BigQuery GA4 `analytics_524708437`, 2026-03-28〜06-15 ≈80日）

当初、結果ページの価値を「人気（CTR14%＝検索→診断トップへの到達）」だけで判断し、**実際に最後までプレイして結果を見た人の割合を測っていなかった**。Owner 指摘で検証。`tmp/cycle-247/result-page-funnel.md`。

- **クイズ結果は同一 URL `/play/<slug>` 上にインライン描画される**（`QuizContainer` の useState フェーズマシン intro→playing→result）。`/play/<slug>/result/<id>` への遷移はなく、その URL は**シェア用**。よって「`/result/*` PV ÷ トップ PV」は完了率ではない。完了率は `level_start`/`level_end` イベントで測る（`src/lib/analytics.ts`）。
- **word-sense-personality の完了率 ≈ 72%（開始50→完了36, 80日・実数）**。character-personality ≈ 69%（32→22）。診断全体の相場は完了率 50〜70%台。→ **detailedContent は「80日で約36人」の完了者にインライン結果（ResultCard 汎用パス）で確実に届く**。word-sense はカスタム結果コンポーネントを持たず汎用 `renderDetailedContent` を通るため、resultPageLabels 見出しもインラインに反映。完了率は良好で、本サイクルの来訪者価値（完了者の結果体験向上）は妥当と確認できた。
- **静的 `/result/*` ページの実 PV はほぼゼロ**（word-sense 8PV・うち organic 検索0・サイト内遷移0、character 0PV）。→ sitemap 掲載・index 化による**第三者集客は現状未発現**。これは「デメリットのない副次効果」（cycle-136）の範囲であり、価値は今後の検索流入の伸び次第。**現時点で測れる価値は完了者へのインライン体験向上に限られる**ことを正直に記録する。
- 留意: 実数が小さく（最大開始50）標準誤差大。比率の傾向は信頼できるが±十数%前提。

### 学び（恒久化候補）

- **標準形式 detailedContent クイズには resultPageLabels が必須規約**（差別化・三人称見出し。第三者向けタイプ解説ページのため）。`result-page-labels.test.ts` が明文化。新規の標準形式診断を作る際はセット。
- **`--color-surface` は未定義トークン**。テーマ対応背景には `--color-bg-secondary` を使う（複数姉妹ファイルに同注記あり。AP-I07＝Playwright 本番検証必須の好例）。

### その他

- 分析で確定したレバーが「1 サイクルに収まらない大型施策」だった場合でも、実装コストを理由に劣る UX を選ばない。その場合は最も価値の高い独立スライスを本サイクルで完成させ、残りを backlog 化する。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
