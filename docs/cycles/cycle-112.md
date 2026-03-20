---
id: 112
description: B-090 クイズ結果のSNSシェア画像の改善 + B-211 playLinks二重定義解消
started_at: "2026-03-20T10:03:23+0900"
completed_at: "2026-03-20T13:40:04+0900"
---

# サイクル-112

このサイクルでは、クイズ・診断の結果画面のSNSシェア画像をより魅力的にし、SNSからの流入増を目指す。共有テキストテンプレートの統一やハッシュタグ戦略も含む。また、小規模な技術的負債としてplayLinksの二重定義を解消する。

## 実施する作業

- [x] B-090: クイズ結果のSNSシェア画像の改善
- [x] B-211: layout.tsxとFooter.tsxのplayLinks二重定義解消

## 作業計画

### 目的

**誰のためか**: メインターゲットである「手軽で面白い占い・診断を楽しみたい人」。とくに、診断結果をSNSでシェアして友達と楽しみたいユーザー。

**何のためか**: 現在のクイズ結果OGP画像には以下の致命的な問題がある:

1. 日本語フォント（Noto Sans JP）が未適用 → 日本語テキストが文字化け・豆腐になる可能性がある
2. `createOgpImageResponse` 共通ユーティリティを使用しておらず、フォントサイズの可変処理がない（64px固定）
3. LINE中央クロップ（630x630px）への配慮がなく、重要テキストが欠ける可能性がある
4. `twitter-image.tsx` が存在せず、X（旧Twitter）でのシェア画像が最適化されていない
5. quiz用・game用ShareButtonsのXボタン色が旧Twitter青（#1da1f2）のまま
6. ゲーム系のシェアテキストにハッシュタグがない
7. ResultCard.tsx と result/page.tsx でshareTextテンプレートが重複定義されている

**提供する価値**:

- 文字化けのないOGP画像により、SNS上でクイズ結果が正しく魅力的に表示される
- OGP画像の品質向上によりSNSでのCTR向上が期待される（最大3倍という報告あり）
- ハッシュタグ戦略の統一により、サイトの認知度とSNS上での発見可能性が向上する
- コードの保守性向上（createOgpImageResponse活用、playLinks二重定義解消、shareTextテンプレート整理）

### 作業内容

#### タスク1: クイズ結果OGP画像のcreateOgpImageResponse移行と改善

**対象ファイル**:

- `src/app/play/[slug]/result/[resultId]/opengraph-image.tsx`（既存の書き換え）
- `src/app/play/[slug]/result/[resultId]/twitter-image.tsx`（新規作成）

**作業内容**:

- 現在のOGP画像は `ImageResponse` を直接使用しており、`createOgpImageResponse` 共通ユーティリティを活用していない。以下の問題を解決する:
  - **日本語フォント適用**: `createOgpImageResponse` はNoto Sans JPをGoogle Fonts CDNから取得する処理が組み込まれている。移行するだけで日本語フォントが適用される
  - **フォントサイズ可変**: `createOgpImageResponse` にはタイトル長20文字以上で48pxに縮小する処理がある。クイズ結果画像ではresultTitleがタイトルになるため、長い結果タイトルでも収まるようになる
  - **LINE中央クロップ対応**: `createOgpImageResponse` は中央寄せレイアウトで、padding（40px 60px）が設定されている。重要テキスト（結果タイトル、アイコン）は中央630x630px内に収まる

- `createOgpImageResponse` の呼び出し方:
  - `title`: resultTitle（例: 「クリエイティブタイプ」）
  - `subtitle`: quizTitle（例: 「あなたの性格タイプ診断」）
  - `icon`: resultIcon（絵文字）
  - `accentColor`: quiz.meta.accentColor

- **レイアウトの変更点**: 現在のOGP画像とcreateOgpImageResponseではレイアウト順序が異なる。現在はquizTitle（上、28px）→ resultIcon → resultTitle（中央、64px）→ yolos.net の順だが、createOgpImageResponseでは icon（上、80px）→ title（中央、64px/48px）→ subtitle（下、28px）→ yolos.net（右下）の順になる。つまり、quizTitleの表示位置が上部から下部（subtitle位置）に移動する。resultTitle（title）とresultIcon（icon）が画像の中央に大きく配置される点は変わらないため、OGP画像で最も重要な「結果が一目でわかる」というデザイン意図は維持される。quizTitleはサブ情報であり、subtitleとして下部に配置されても情報の優先度は適切に保たれる

- **twitter-image.tsx の新規作成**: opengraph-image.tsx のエクスポートをそのまま再エクスポートする（`export { default, alt, size, contentType } from "./opengraph-image"`）。これは他のページ（tools, cheatsheets, blog等）で確立済みのパターンに従う。twitter-image.tsxがないと、X（旧Twitter）でOGP画像が正しく表示されない場合がある

- `generateStaticParams` は既存のものをそのまま維持する

**参考ファイル**:

- `src/lib/ogp-image.tsx` — createOgpImageResponse の実装
- `src/app/play/[slug]/opengraph-image.tsx` — createOgpImageResponseを使用した既存のOGP画像実装パターン
- `src/app/tools/char-count/twitter-image.tsx` — twitter-image.tsxの再エクスポートパターン

#### タスク2: シェアテキスト・ハッシュタグ・Xボタン色の改善

**対象ファイル**:

- `src/play/quiz/_components/ShareButtons.module.css`（Xボタン色修正 + ダークモード対応）
- `src/play/games/shared/_components/GameShareButtons.module.css`（Xボタン色修正 + ダークモード対応）
- `src/app/play/[slug]/result/[resultId]/page.tsx`（shareTextテンプレート改善）
- `src/play/quiz/_components/ResultCard.tsx`（shareTextテンプレート改善）
- `src/play/fortune/_components/DailyFortuneCard.tsx`（ハッシュタグ追加）
- `src/play/games/kanji-kanaru/_lib/share.ts`（ハッシュタグ追加）
- `src/play/games/yoji-kimeru/_lib/share.ts`（ハッシュタグ追加）
- `src/play/games/nakamawake/_lib/share.ts`（ハッシュタグ追加）
- `src/play/games/irodori/_lib/share.ts`（ハッシュタグ追加）

**作業内容**:

1. **quiz用・game用ShareButtonsのXボタン色を黒に修正（ダークモード対応含む）**:
   - **quiz用** `ShareButtons.module.css` の `.twitter` クラスの `background-color` を `#1da1f2`（旧Twitter青）から `#000000`（X のブランドカラー黒）に変更する。加えて、ダークモード時に黒背景で視認できなくなる問題を防ぐため、`@media (prefers-color-scheme: dark)` と `:global([data-theme="dark"])` で `.twitter` の `background-color` を `#333333` に設定する。これは `src/components/common/ShareButtons.module.css` の `.x` クラスで既に適用されているパターンと同じ対応である
   - **game用** `GameShareButtons.module.css` の `.shareButtonX` クラスの `background-color` を `#1da1f2` から `#000000` に変更する。同様に、ダークモード時の `background-color` を `#333333` に設定する（`@media (prefers-color-scheme: dark)` と `:global([data-theme="dark"])` の両方）
   - クラス名（`.twitter`, `.shareButtonX`）はそのまま維持する（クラス名変更はCSSモジュールの内部実装であり、機能に影響しない。リネームは別タスクとする）

2. **ハッシュタグ戦略の統一（2個ルール）**:
   - X公式推奨の最適個数2個に統一する: `#コンテンツ固有タグ` + `#yolosnet`
   - 現状の各コンテンツのハッシュタグ状況:
     - クイズ結果（ResultCard, page.tsx）: `#yolosnet` のみ（1個） → コンテンツ固有タグを追加
     - 相性結果（CompatibilitySection）: `#${quizTitle}` + `#yolosnet`（2個） → 既に最適。変更不要
     - 運勢（DailyFortuneCard）: `#yolosnet` のみ（1個） → コンテンツ固有タグを追加
     - ゲーム4種（kanji-kanaru, yoji-kimeru, nakamawake, irodori）: ハッシュタグなし → 2個追加
   - 具体的なハッシュタグの割り当て:
     - クイズ結果: `#${quizTitle.replace(/\s/g, "")}` + `#yolosnet`（CompatibilitySectionと同じパターン）
     - 運勢: `#ユーモア運勢` + `#yolosnet`
     - 漢字カナール: `#漢字カナール` + `#yolosnet`
     - 四字キメル: `#四字キメル` + `#yolosnet`
     - ナカマワケ: `#ナカマワケ` + `#yolosnet`
     - イロドリ: `#イロドリ` + `#yolosnet`

3. **shareTextテンプレートの重複解消**:
   - ResultCard.tsx（L34）と result/page.tsx（L153）で同一のshareTextテンプレートが定義されている: `` `${quizTitle}の結果は「${result.title}」でした! #yolosnet` ``
   - ハッシュタグ追加に伴い、両方のテンプレートを同時に更新する。テンプレートの共通関数化は、呼び出し元が異なるコンポーネント（クライアント/サーバー）であり引数の型も微妙に異なるため、このサイクルでは行わない。両方を同じ文字列に更新し一貫性を確保する

**注意事項**:

- ゲーム系のシェアテキストはURLの前にハッシュタグを挿入する。ハッシュタグとURLの間には改行を入れる
- ゲーム系のシェアテキストにはすでにゲーム名が含まれている（例: 「漢字カナール #42 (中級) 3/6」）が、ハッシュタグ版のゲーム名（例: `#漢字カナール`）を末尾に追加する形にする。テキスト本文のゲーム名はそのまま維持する
- ゲーム系のシェアテキストにハッシュタグを追加した後の具体例（漢字カナールの場合）:
  ```
  漢字カナール #42 (中級) 3/6
  🟩⬜🟨🟩⬜🟩
  🟩🟩🟨🟩🟨🟩
  🟩🟩🟩🟩🟩🟩
  #漢字カナール #yolosnet
  https://yolos.net/play/kanji-kanaru
  ```
- ゲーム系の既存テスト（share.test.ts）がハッシュタグの追加に伴い更新が必要になる

#### タスク3: B-211 playLinks二重定義解消

**対象ファイル**:

- `src/app/layout.tsx`

**作業内容**:

- `layout.tsx` の L51-56 で定義されている `playLinks` 定数を削除する
- `<Footer playLinks={playLinks} />` から `playLinks` propの渡しを削除し、`<Footer />` に変更する
- `Footer.tsx` には既に `DEFAULT_PLAY_LINKS` がデフォルト値として定義されている（L5-10）ため、prop を省略すればデフォルト値が使われる。Footer.tsx側の変更は不要

**確認事項**: `playLinks` propを渡している箇所がlayout.tsx以外にないことは既に確認済み（Grep結果: `src/components/common/Footer.tsx` と `src/app/layout.tsx` の2ファイルのみ）

#### タスク4: テストとビルド検証

**作業内容**:

1. **既存テストの動作確認**: ゲーム系のshare.test.ts（4ファイル）がハッシュタグ追加後も正しく動作するよう更新する
   - `src/play/games/kanji-kanaru/_lib/__tests__/share.test.ts`
   - `src/play/games/yoji-kimeru/_lib/__tests__/share.test.ts`
   - `src/play/games/nakamawake/_lib/__tests__/share.test.ts`
   - `src/play/games/irodori/_lib/__tests__/share.test.ts`

2. **OGP画像の視覚的確認**: ビルド後にOGP画像が正しく生成されることを確認する。具体的には:
   - 日本語テキストが正しく表示されること（文字化けなし）
   - resultTitleとquizTitleが適切なサイズで表示されること
   - アイコン（絵文字）が表示されること
   - twitter-image.tsxが正しく動作すること

3. **lint/format/test/build の成功確認**: `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功すること

### 注意事項

1. **createOgpImageResponseのAPI制約**: createOgpImageResponseは `OgpImageConfig` 型（title, subtitle?, accentColor?, icon?）のみを受け付ける。クイズ結果OGP画像で必要な情報（resultTitle, quizTitle, icon, accentColor）はすべてこのAPIでカバーできる。追加のカスタマイズ（例: 結果の説明文の表示）が必要になった場合はcreateOgpImageResponseの拡張が必要になるが、このサイクルでは現在のAPIで十分と判断する

2. **Google Fonts CDNからのフォント取得の制約**: `ogp-image.tsx` のコメント（L18-20）にある通り、Google Fonts CDNから取得するNoto Sans JPの最初のサブセットのみを使用しており、稀な漢字が表示されない可能性がある。これはB-078（OGP画像の日本語フォントローカル化）で対応予定の既知の制約であり、このサイクルでは対応しない

3. **ShareButtons統合はスコープ外**: 3種類のShareButtons（common, quiz, game）を1つに統合するのは大規模なリファクタになる。このサイクルでは既存の各コンポーネントの改善（色の統一、ハッシュタグの追加）に留め、統合は将来の検討事項とする

4. **シェアテキストの長さ**: X（日本語）のベストプラクティスは本文30〜60文字 + URL + ハッシュタグ2個。クイズ結果のシェアテキスト例: 「あなたの性格タイプ診断の結果は『クリエイティブタイプ』でした! #あなたの性格タイプ診断 #yolosnet」は約40〜50文字程度で適切な範囲内

5. **ゲーム系シェアテキストの構造**: ゲーム系は絵文字グリッド形式のため、ハッシュタグはグリッドの後・URLの前に配置する。これにより視覚的な構造を維持しつつ、ハッシュタグの効果を得られる

6. **OGP画像のaltテキスト**: 現在のalt属性は「クイズ結果」という汎用的な文字列であり、結果タイトルやクイズ名を含んでいない。アクセシビリティとSEOの観点から、altテキストにクイズ名と結果タイトルを含める改善が望ましいが、createOgpImageResponseの共通パターンとの整合性を考慮する必要があるため、将来のサイクルで対応する

### 完了条件

1. クイズ結果OGP画像が `createOgpImageResponse` を使用して生成され、日本語フォント（Noto Sans JP）が適用されていること
2. クイズ結果OGP画像のフォントサイズがタイトル長に応じて可変すること（20文字以上で縮小）
3. ~~`twitter-image.tsx` が作成され、opengraph-image.tsxを再エクスポートしていること~~ → ownerフィードバックにより削除（play/配下の他ページにtwitter-image.tsxは存在せず、opengraph-imageがあれば十分）
4. quiz用ShareButtonsおよびgame用GameShareButtonsのXボタン色がX のブランドカラー（黒 `#000000`）に更新されていること
5. quiz用ShareButtonsおよびgame用GameShareButtonsのダークモード時Xボタン色が `#333333` に設定されていること
6. すべてのコンテンツのシェアテキストにハッシュタグが2個含まれていること（`#コンテンツ固有タグ` + `#yolosnet`）
7. layout.tsxからplayLinks定数とprop渡しが削除され、FooterのデフォルトplayLinksが使われていること
8. ゲーム系のshare.test.tsがハッシュタグ追加後のフォーマットに更新されていること
9. `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功すること

### 検討した他の選択肢と判断理由

1. **createOgpImageResponseを拡張してクイズ結果専用のレイアウトを作る案**
   - クイズ結果に特化した情報（結果の説明文、スコア等）を含む豪華なOGP画像を生成する案。しかし、OGPベストプラクティスではテキスト量は画像面積の20%以下が推奨されており、情報を詰め込みすぎると逆効果。また、createOgpImageResponseの既存レイアウト（icon + title + subtitle）はクイズ結果の表示に十分適合している。シンプルで「チラ見せ」するデザインの方がCTR向上に寄与するため、既存APIをそのまま活用する判断とした

2. **ShareButtons3種類の統合案**
   - 3種類のShareButtonsを1つの汎用コンポーネントに統合する案。機能差（WebShare対応の有無、画像保存機能、はてブ対応）が大きく、統合すると複雑な条件分岐が必要になる。このサイクルの主目的はシェア画像の品質向上であり、コンポーネント統合は独立したリファクタタスクとして将来検討すべきと判断した

3. **シェアテキストの共通関数化**
   - ResultCard.tsx と result/page.tsx のshareTextテンプレートを共通関数として切り出す案。呼び出し元がクライアントコンポーネント（ResultCard）とサーバーコンポーネント（page.tsx）で異なり、引数の型（QuizResult vs find結果）も微妙に異なる。共通化のメリット（DRY）よりも、無理な抽象化による複雑化のリスクが高いと判断し、両方を同じ文字列パターンに手動で揃える方針とした

4. **ゲーム系のシェアテキストにゲーム名ハッシュタグではなくカテゴリタグ（#デイリーパズル）を使う案**
   - ベストプラクティスの推奨構成（コンテンツ固有タグ + カテゴリタグ）に厳密に従うなら `#漢字カナール` + `#デイリーパズル` のような組み合わせもありうる。しかし、サイト全体の認知度向上の観点から `#yolosnet` を共通タグとして統一する方が、ブランディング戦略として効果的と判断した。全コンテンツで `#yolosnet` を必ず含めることで、SNS上でのサイトの発見可能性を高める

### 計画にあたって参考にした情報

- `src/app/play/[slug]/result/[resultId]/opengraph-image.tsx` — 現在のクイズ結果OGP画像実装。ImageResponseを直接使用、日本語フォント未適用、フォントサイズ64px固定。レイアウト順: quizTitle(上) → icon → resultTitle(中央大) → yolos.net
- `src/lib/ogp-image.tsx` — createOgpImageResponseユーティリティ。Noto Sans JPフォント取得、フォントサイズ可変（20文字以上で48px）、中央寄せレイアウト、padding 40px 60px。レイアウト順: icon(上) → title(中央大) → subtitle(下) → yolos.net(右下)
- `src/app/play/[slug]/opengraph-image.tsx` — createOgpImageResponseを使用した既存のOGP画像実装パターン
- `src/app/tools/char-count/twitter-image.tsx` — twitter-image.tsxの再エクスポートパターン
- `src/play/quiz/_components/ShareButtons.module.css` — quiz用ShareButtonsのCSSモジュール。`.twitter` クラスが `#1da1f2`（旧Twitter青）、ダークモード対応なし
- `src/play/games/shared/_components/GameShareButtons.module.css` — game用ShareButtonsのCSSモジュール。`.shareButtonX` クラスが `#1da1f2`（旧Twitter青）、ダークモード対応なし
- `src/components/common/ShareButtons.module.css` — common用ShareButtonsのCSSモジュール。`.x` クラスが `#000000` に修正済み、ダークモード時 `#333333` 対応済み（参考パターン）
- `src/play/quiz/_components/ResultCard.tsx` — shareTextテンプレート: `` `${quizTitle}の結果は「${result.title}」でした! #yolosnet` ``
- `src/app/play/[slug]/result/[resultId]/page.tsx` — shareTextテンプレート（ResultCardと重複）
- `src/play/quiz/_components/CompatibilitySection.tsx` — 相性シェアテキスト（2個ハッシュタグ、既に最適）
- `src/play/fortune/_components/DailyFortuneCard.tsx` — 運勢シェアテキスト（`#yolosnet` のみ）
- `src/play/games/kanji-kanaru/_lib/share.ts`, `yoji-kimeru`, `nakamawake`, `irodori` — ゲーム系シェアテキスト（ハッシュタグなし）
- `src/app/layout.tsx` L51-56 — playLinks二重定義（削除対象）
- `src/components/common/Footer.tsx` L5-10 — DEFAULT_PLAY_LINKS（残す側）
- OGPベストプラクティス: サイズ1200x630px、LINE中央630x630pxクロップ、テキスト量20%以下、コントラスト比4.5:1以上
- ハッシュタグベストプラクティス: X公式推奨2個、4個以上でリーチ低下
- シェアテキストベストプラクティス: X日本語は本文30〜60文字 + URL + ハッシュタグ2個

## レビュー結果

### レビュー1回目（5件指摘、すべて反映済み）

**必須指摘**:

1. GameShareButtons.module.cssのXボタン色修正漏れ — タスク2の対象ファイルに `src/play/games/shared/_components/GameShareButtons.module.css` を追加し、`.shareButtonX` の色修正を作業内容に含めた
2. ダークモード対応の欠落 — タスク2に、quiz用 `ShareButtons.module.css` とgame用 `GameShareButtons.module.css` のダークモード時Xボタン色（`#333333`）設定を追加。`@media (prefers-color-scheme: dark)` と `:global([data-theme="dark"])` の両方で対応する旨を明記した。完了条件にも項目5として追加

**推奨指摘**: 3. createOgpImageResponseとのレイアウト差異の明記 — タスク1に、現在のレイアウト（quizTitle上 → icon → resultTitle中央大 → yolos.net）からcreateOgpImageResponseのレイアウト（icon上 → title中央大 → subtitle下 → yolos.net右下）への変更を正確に記述した。quizTitleが上部から下部（subtitle位置）に移動する点を明示4. ゲーム系ハッシュタグ追加後のシェアテキスト具体例の明示 — タスク2の注意事項に漢字カナールの完全なシェアテキスト例を追加（絵文字グリッド + ハッシュタグ行 + URL行の構造）5. OGP画像のaltテキスト改善 — 注意事項6として、altテキストの改善が将来課題である旨を追記

### レビュー2回目（指摘0件、承認）

前回の指摘事項5件の反映を確認し、計画全体を実際のソースコードと照合。技術的正確性、対象ファイルの網羅性、完了条件の検証可能性、リスクのすべてで問題なし。指摘事項ゼロで承認。

### レビュー3回目（実装レビュー1回目、指摘1件）

**必須指摘**:

1. twitter-image.tsx で `generateStaticParams` が再エクスポートされていない — 動的セグメント `[slug]` と `[resultId]` を含むため、ビルド時の静的画像生成に必要。`export { default, alt, size, contentType, generateStaticParams } from "./opengraph-image"` に修正

### レビュー4回目（実装レビュー2回目、指摘0件、承認）

前回の指摘（generateStaticParams再エクスポート漏れ）の修正を確認。完了条件9項目すべてを満たしていることを確認。新たな指摘事項なし。承認。

### ownerフィードバック（実装レビュー後）

- twitter-image.tsxは不要（play/配下の他ページにも存在せず、Next.jsがopengraph-imageをTwitterカードにも使用するため）→ 削除
- OGP画像の視覚的確認を実施（dev serverで複数クイズの結果画像を確認、日本語フォント・アイコン・フォントサイズ可変・背景色すべて正常）

## キャリーオーバー

- なし

## 補足事項

- ownerフィードバックにより、計画段階で作成予定だったtwitter-image.tsxを削除。play/配下では他のページにもtwitter-image.tsxが存在しないため、既存パターンと一致する判断
- B-193シリーズ完了に伴い、site-value-improvement-plan.mdのフェーズ3-Dを全完了に更新済み

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
