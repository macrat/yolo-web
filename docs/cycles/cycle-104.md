---
id: 104
description: B-203 フェーズ4-4 メタデータ・SEO改善 + B-204 フェーズ4-5 内部リンク構造の最適化
started_at: "2026-03-19T11:04:01+0900"
completed_at: "2026-03-19T12:49:50+0900"
---

# サイクル-104

B-203（フェーズ4-4: メタデータ・SEOの改善）とB-204（フェーズ4-5: 内部リンク構造の最適化）を実施する。/play統合（cycle-101〜102）およびトップページ再設計（cycle-103）完了後のサイト構造に合わせて、メタデータ・構造化データ・内部リンクを最適化し、SEOとユーザー回遊を改善する。

## 実施する作業

- [x] メタデータ・SEOの現状分析と改善計画の策定
- [x] 内部リンク構造の現状分析と改善計画の策定
- [x] タスク1: FAQPage JSON-LDの実装（FaqSectionコンポーネントへの統合）
- [x] タスク2: ブログ記事JSON-LDの画像URL修正
- [x] タスク3: robots.tsで/api/をDisallow
- [x] タスク4: 壊れたGitHubリンクの修正
- [x] タスク5: クイズ/診断ページへの関連コンテンツリンク追加
- [x] レビューと修正
- [x] ブログ記事の検討・執筆（読者にとって価値がある場合のみ） → 検討の結果、執筆不要と判断。SEOメタデータ修正・構造化データ追加・内部リンク最適化はいずれも標準的なWeb開発のベストプラクティス適用であり、ターゲットユーザー（占い・診断ユーザー/AIエージェントに興味があるエンジニア）にとって有益な記事にはならない

## 作業計画

### 目的

1. 構造化データ（JSON-LD）を最適化し、検索エンジンへの情報伝達を改善する
2. メタデータの不備を修正し、クローラーへの情報伝達を改善する
3. 内部リンク構造を強化し、ユーザー回遊率を向上させる

### 作業内容

#### タスク1: FAQPage JSON-LDの実装（FaqSectionコンポーネントへの統合）

**何をするか:** 既存のFaqSectionコンポーネントにFAQPage JSON-LDの出力機能を追加する。これにより、FaqSectionを使用しているレイアウト（ToolLayout、CheatsheetLayout、GameLayout、DictionaryDetailLayout）配下の全ページで自動的にFAQPage構造化データが出力される。なお、クイズ/診断ページ（`/play/[slug]/page.tsx`）はFaqSectionを使用しておらず、QuizMetaにもfaqフィールドが存在しないため、今回のFAQPage JSON-LD実装の恩恵を受けない。クイズへのFAQ追加は別途検討が必要。

**注記（GoogleのFAQリッチリザルト制限について）:** Googleは2023年8月にFAQリッチリザルトの表示を政府・医療系サイトに限定しており、yolos.netはGoogleのFAQリッチリザルトには表示されない。それでもFAQPage JSON-LDを実装する理由は以下の通り:

- Google以外の検索エンジン（Bing等）でのFAQリッチリザルト対応
- B-024（FAQ構造化データ）の完了としてコードベースの整合性を確保する
- 将来Googleがこの方針を変更した場合への備え

**作業内容:**

- `src/lib/seo.ts` に `generateFaqPageJsonLd(faq)` 関数を追加する。Schema.org FAQPage型のJSON-LDオブジェクトを返す。
- `src/components/common/FaqSection.tsx` 内で `generateFaqPageJsonLd` を呼び出し、`<script type="application/ld+json">` タグを出力する。FaqSectionはサーバーコンポーネントとして使用されているため、直接JSONLDを埋め込める。
- `src/lib/__tests__/seo.test.ts` に `generateFaqPageJsonLd` のユニットテストを追加する。
- 既存の `src/components/common/__tests__/FaqSection.test.tsx` を更新し、JSON-LD scriptタグが出力されることを検証する。
- `src/play/games/types.ts`、`src/tools/types.ts`、`src/cheatsheets/types.ts`、`src/dictionary/_lib/types.ts`、`src/components/common/FaqSection.tsx` のコメント中にある「将来B-024でFAQPage schema」という記述を「B-024対応済み」等に更新する。
- `docs/content-quality-requirements.md` 内のB-024関連記述を以下の方針で更新する:
  - 93行目: 「将来の B-024（FAQ 構造化データ）で JSON-LD（FAQPage schema）を付与することを前提に設計する」→ 「B-024 で実装済みの JSON-LD（FAQPage schema）が FaqSection コンポーネント経由で自動付与される」に更新する
  - 103-105行目: 「FAQ 設計の注意点（B-024 との整合性）」セクションの制約（プレーンテキスト、外部リンク不可、1対1対応）は引き続き有効なまま維持する。105行目の「本フィールドは将来 B-024 で」の部分のみ「本フィールドは B-024 で実装済みの」に更新する
  - 133行目: 型定義コメント中の「将来 B-024 で FAQPage schema の JSON-LD を生成するデータソースとなる」→「B-024 で実装済みの FAQPage schema JSON-LD のデータソースである」に更新する
- `docs/content-quality-requirements.md` 182-188行目のゲーム・辞典セクションに、GameLayout・DictionaryDetailLayout実装完了と乖離した記述がないか確認し、必要に応じて更新する（B-024実装に伴う整合性確認）。

**完了条件:**

- FAQデータを持つ全ページでFAQPage JSON-LDが出力されること
- `npm run build` が成功すること
- 新規・既存テストがすべて通ること

**依存関係:** なし

---

#### タスク2: ブログ記事JSON-LDの画像URL修正

**何をするか:** ブログ記事の構造化データ（BlogPosting JSON-LD）の `image` フィールドが、グローバルOGP画像 `/opengraph-image` にハードコードされている問題を修正し、各記事固有のOGP画像 `/blog/${slug}/opengraph-image` を指すようにする。

**作業内容:**

- `src/app/blog/[slug]/page.tsx` 55行目の `generateBlogPostJsonLd` 呼び出し時の `image` フィールド（`image: \`${BASE_URL}/opengraph-image\``）を `image: \`${BASE_URL}/blog/${slug}/opengraph-image\`` に変更する。
- 変更後のJSON-LD出力をビルドで確認する。

**完了条件:**

- 各ブログ記事のBlogPosting JSON-LDの `image` が記事固有のOGP画像URLを指していること
- `npm run build` が成功すること

**依存関係:** なし

---

#### タスク3: robots.tsで/api/をDisallow

**何をするか:** `robots.ts` に `/api/` パスのDisallowルールを追加し、APIエンドポイントがクローラーにインデックスされないようにする。

**作業内容:**

- `src/app/robots.ts` の `rules` にDisallow設定を追加: `/api/` パスをブロックする。
- robots.ts関連のテストファイルは存在しないことを確認済み（`src/app/__tests__/` およびプロジェクト全体の `*.test.*` ファイルにrobots関連テストなし）。robots.tsはNext.jsの規約ファイルで出力はフレームワークが保証するため、テスト追加は不要。

**完了条件:**

- `robots.txt` 出力に `Disallow: /api/` が含まれること
- `npm run build` が成功すること

**依存関係:** なし

---

#### タスク4: 壊れたGitHubリンクの修正

**何をするか:** ブログ記事 `2026-02-28-game-dictionary-layout-unification.md` の199行目にある `src/games/_components/GameLayout.tsx` へのリンクが、ファイル移動により404になっている問題を修正する。

**作業内容:**

- `src/blog/content/2026-02-28-game-dictionary-layout-unification.md` の199行目を修正する。
- リンク先を `https://github.com/macrat/yolo-web/blob/6ace06dc2b8a8544457e2980217ed9e55448c599/src/games/_components/GameLayout.tsx` に変更する（記事執筆時点のファイルパスを保持するため、当時のコミットハッシュを使用）。
- ~~記事の `updated_at` は、リンクURL修正（サイト内リンクのURL変更に準ずる）のため更新する。~~ → 更新不要と判断。外部リンク（GitHub URL）の形式変更であり、記事の内容は読者にとって変わっていない。`updated_at`を更新すると検索エンジンに「記事が更新された」と誤ったシグナルを送ることになるため。
- 同記事内の他のGitHubリンクも確認済み: 200行目の `DictionaryDetailLayout.tsx`（`src/dictionary/_components/DictionaryDetailLayout.tsx` に現存）および201行目の `docs/content-quality-requirements.md`（現存）はいずれもmainブランチ上に有効なパスとして存在しており、修正不要。

**完了条件:**

- リンクが有効なGitHub URLを指していること
- `npm run build` が成功すること

**依存関係:** なし

---

#### タスク5: クイズ/診断ページへの関連コンテンツリンク追加

**何をするか:** クイズ/診断ページ（`/play/[slug]/page.tsx`）に関連コンテンツへのリンクを追加し、ユーザー回遊を促進する。現在、ゲームページにはRelatedGamesとRelatedBlogPostsがあるが、クイズ/診断ページにはどちらもない。

**作業内容:**

- クイズ/診断ページに適した関連コンテンツコンポーネントを実装する。既存の `src/play/games/_components/RelatedGames.tsx` や `RelatedBlogPosts.tsx` の設計パターンを参考にする。
- 関連コンテンツの選択ロジック:
  - `src/play/registry.ts` の `getPlayContentsByCategory` を使用して、同じカテゴリ（personality / knowledge）のクイズを取得する
  - 自分自身を除外する: 現在表示中のクイズのslugと一致するエントリをフィルタリングで除外する
  - 表示順序: レジストリの定義順（`quizEntries` 配列の順序）で固定とする。ランダム表示はSSGとの相性が悪いため採用しない
  - ゲームはカテゴリが "game" であるため、"personality" や "knowledge" でフィルタすると自然に除外される
  - 最大3件程度を表示する
- `src/app/play/[slug]/page.tsx` に関連コンテンツコンポーネントを追加する。
- 対応するテストを追加する。

**完了条件:**

- すべてのクイズ/診断ページに関連コンテンツリンクが表示されること
- 関連コンテンツが同カテゴリのクイズ/診断を表示すること
- `npm run build` が成功すること
- テストがすべて通ること

**依存関係:** なし

---

### 計画から除外した項目と理由

1. **`/dictionary` トップページのsitemap収録**: 調査時に未収録と報告されたが、`src/app/sitemap.ts` 195-199行目で既に収録済みであることを確認した。対応不要。
2. **BreadcrumbList JSON-LD**: 調査時に「全ページで未出力」と報告されたが、`src/components/common/Breadcrumb.tsx` がJSON-LD出力を内包しており、Breadcrumbコンポーネントを使用している全ページで既に出力されていることを確認した。対応不要。
3. **各セクション一覧ページの個別OGP画像**: SNSシェアの頻度が低い一覧ページのため、工数に対するSEO効果が不透明。スコープ外。
4. **playLinksの二重定義（B-211）**: 既にバックログにあるため、今回のスコープ外。
5. **ユーモア辞典詳細への関連コンテンツリンク**: ユーモア辞典詳細ページには既に「関連語」セクション（同じユーモア辞典内の別エントリへのリンク）があり、最低限の回遊導線は確保されている。ゲームや他セクションへの横断リンクの追加は、ユーモア辞典の文脈との関連性が薄く、ユーザー体験を損なう可能性があるため、今回は見送る。将来、辞典コンテンツが増えて横断リンクの関連性が高まった場合に再検討する。
6. **クイズ/診断ページへのFaqSection追加**: QuizMetaにfaqフィールドが存在せず、FAQデータがないため追加不可。クイズ向けFAQデータの設計・追加は別途検討が必要。
7. **クイズ/診断ページへのShareButtons追加**: ShareButtonsの追加はB-204（内部リンク構造の最適化）のスコープを超えるUI改善であり、今回は対象外とする。

### 検討した他の選択肢と判断理由

1. **FAQPage JSON-LDを各レイアウトコンポーネントに個別実装する案**: FaqSectionコンポーネントに統合する方が、コードの一元化・保守性の面で優れており、新規コンテンツ追加時にも自動的にJSON-LDが出力される。FaqSectionへの統合を選択した。
2. **クイズページの関連コンテンツにゲームも含める案**: クイズとゲームはcontentTypeが異なり、ユーザーの期待も異なる。まずは同カテゴリのクイズ・診断に絞ることで、関連性の高いレコメンドを提供する。

### 計画にあたって参考にした情報

- 既存コードの実装確認: `src/components/common/FaqSection.tsx`（サーバーコンポーネント、JSON-LD未出力）、`src/components/common/Breadcrumb.tsx`（JSON-LD出力済み）、`src/lib/seo.ts`（JSON-LD生成関数群）、`src/app/sitemap.ts`（/dictionary収録済み）
- Schema.org FAQPage仕様: 既にB-024として計画されていた機能であり、FAQデータ構造は全コンテンツタイプで統一済み
- Google検索セントラルのFAQリッチリザルトガイドライン
- GoogleのFAQリッチリザルト制限変更（2023年8月）: https://developers.google.com/search/blog/2023/08/howto-faq-changes

## レビュー結果

### 1回目レビュー（計画レビュー）

**指摘数:** Must 2件、Should 4件、Nice to have 2件

**M-1（FAQ適用範囲の記述が実態と不一致）:** タスク1の「ツール33件、チートシート7件、ゲーム4件、辞典詳細ページ」をFaqSectionを使用しているレイアウト単位（ToolLayout、CheatsheetLayout、GameLayout、DictionaryDetailLayout）での記述に修正。クイズ/診断ページがFAQPage JSON-LDの恩恵を受けない点を明記した。

**M-2（content-quality-requirements.mdのB-024関連記述の更新方針を具体化）:** 93行目・103-105行目・133行目のそれぞれについて、具体的な更新内容を記載。103-105行目の制約は引き続き有効であることを確認し、「将来B-024で」の表現のみ更新する旨を明記した。

**S-1（タスク2の修正箇所の構造的記述）:** 行番号に加えて「`generateBlogPostJsonLd`呼び出し時のimageフィールド」を併記した。

**S-2（クイズページのFaqSection/ShareButtons未対応への言及）:** 「計画から除外した項目と理由」に項目6・7として追記した。

**S-3（タスク5の関連コンテンツ選択ロジックの詳細）:** 自分自身の除外ロジック、表示順序（レジストリ定義順で固定）、ゲームが"game"カテゴリのため自然に除外される旨を明記した。

**S-4（タスク4の他のGitHubリンク確認済み）:** DictionaryDetailLayout.tsx と content-quality-requirements.md が現在も有効なパスであることを確認済みと明記した。

**N-1（robots.tsのテスト有無）:** テストファイルが存在しないことを確認し、タスク3に明記した。

**N-2（ユーモア辞典の横断リンク）:** 「計画から除外した項目と理由」の項目5に将来の再検討可能性を追記した。

### 2回目レビュー（計画レビュー）

**指摘数:** Must 1件、Should 2件

**M-1（FAQPage JSON-LDによるGoogleリッチリザルト獲得の前提が崩れている）:** Googleは2023年8月にFAQリッチリザルトの表示を政府・医療系サイトに限定しており、yolos.netは該当しない。目的1の記述を「検索エンジンへの情報伝達を改善する」に修正し、タスク1にGoogle制限の注記と実装する理由（他検索エンジン対応、B-024完了としてのコードベース整合性、将来の方針変更への備え）を追記した。参考情報にGoogleの制限変更の情報源を追加した。

**S-1（タスク5の完了条件の表現が作業内容と不整合）:** 「同カテゴリのものを優先して表示すること」→「同カテゴリのクイズ/診断を表示すること」に修正した。

**S-2（content-quality-requirements.mdのゲーム・辞典セクションの陳腐化確認）:** タスク1の作業内容に、`docs/content-quality-requirements.md` 182-188行目のゲーム・辞典セクションがGameLayout・DictionaryDetailLayout実装完了と乖離していないか確認・更新する旨を追記した。

### 3回目レビュー（成果物レビュー）

**タスク1:** S2件。S-1: FaqEntry型の重複定義（FaqSection.tsxとseo.tsの両方に定義）→ seo.tsからインポートに統一。S-2: Google FAQ制限の注記をcontent-quality-requirements.mdに追加。修正済み。

**タスク2-4:** 指摘なし。全承認。

**タスク5:** S3件。S-1: CSS重複 → コメント追加。S-2: shortTitleテスト不足 → テストケース追加。S-3: カード幅不揃い（flex: 1 1 0がli要素ではなくa要素に適用） → li要素に移動。修正済み。

### 4回目レビュー（最終レビュー + UI/UXレビュー）

**成果物最終レビュー:** S1件。S-1: 3件表示時の3枚目カードが全幅に伸びる → max-width: calc(50% - 0.375rem) を追加。修正済み。

**Playwright UI/UXレビュー:** S1件（上記と同一）。修正後、Playwrightで3枚とも286pxの等幅であることを確認。FAQPage JSON-LDの出力、レスポンシブ対応、ダークモード対応、アクセシビリティすべて問題なし。

## キャリーオーバー

- クイズ/診断ページ（`/play/[slug]/page.tsx`）にFaqSectionとShareButtonsがない。ゲームページ（GameLayout）にはRelatedGames、RelatedBlogPosts、FaqSection、ShareButtonsがすべて揃っているが、クイズ/診断ページにはいずれもない（タスク5で関連コンテンツリンクのみ追加予定）。FaqSectionはQuizMetaにfaqフィールドが存在しないためデータ設計から必要。ShareButtonsはUI改善として別途対応が必要。

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
