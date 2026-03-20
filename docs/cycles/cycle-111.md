---
id: 111
description: B-216 character-personalityクイズの相性データAPI化
started_at: "2026-03-20T08:19:42+0900"
completed_at: "2026-03-20T09:43:54+0900"
---

# サイクル-111

B-193（ゲーム・クイズのサーバーサイドAPI横展開）の最後のタスクとして、character-personalityクイズの相性機能を実装する。相性データは全300エントリ（約121KB）あるが、APIで必要な1ペアだけ（約300B）を返すことで、ページ読み込みを高速に保ちつつ相性機能を提供する。

## 実施する作業

- [x] B-216: character-personalityクイズの相性データAPI化

## 作業計画

### 目的

**誰のためか**: character-personalityクイズ（あなたに似たキャラ診断）を受けたユーザー、とくに友達と診断結果を共有して相性を楽しみたいユーザー。

**何のためか**: character-personalityクイズには24タイプ x 全組み合わせの相性データ（300エントリ、約121KB）が既に完全に定義済みだが、ユーザーに届ける機能が未実装。具体的には以下の接続が欠けている:

1. 相性データを1ペアだけ取得するAPIが存在しない
2. `ResultExtraLoader.tsx` に `character-personality` の分岐がない
3. `CharacterPersonalityResultExtra.tsx` コンポーネントが存在しない
4. 結果ページの `extractWithParam` 関数と `CompatibilityDisplay` が `music-personality` のみをハードコードしている

**提供する価値**:

- ユーザーが友達に診断を送り、相性結果を楽しめるようになる（メインターゲット「手軽で面白い占い・診断を楽しみたい人」に直結）
- 相性診断によるSNSシェアの促進 → ページビューの増加
- APIで1ペアだけ取得（121KB → 約300B、約350分の1）することで、相性機能を使うユーザーにも使わないユーザーにもバンドルサイズ増加の影響を与えない

### APIの利用箇所の整理

APIが実際に必要な箇所と不要な箇所を明確に区別する:

- **APIが必要**: `CharacterPersonalityResultExtra.tsx`（クイズ結果画面内のクライアントコンポーネント）のみ。クライアントサイドで相性データを取得する必要があるため。
- **APIが不要**: `CompatibilityDisplay`（結果ページ `/play/[slug]/result/[resultId]`）。page.tsxがサーバーコンポーネントなので、`character-personality.ts` の `getCompatibility` を直接呼び出してpropsとして渡せる。ローディング表示なしで即時表示でき、UXが優れる。

### 作業内容

#### タスク1: 相性データAPIの作成

`GET /api/quiz/compatibility` エンドポイントを新規作成する。既存の `/api/yoji-kimeru/puzzle` と同じパターンに従う。

- ファイルパス: `src/app/api/quiz/compatibility/route.ts`
- クエリパラメータ: `slug`, `typeA`, `typeB`
- レスポンス: `{ "label": "...", "description": "...", "myType": { "title": "...", "icon": "..." }, "friendType": { "title": "...", "icon": "..." } }`
  - `myType` と `friendType` にはそれぞれ `typeA` と `typeB` に対応するタイプのタイトルとアイコンを含める
  - これにより、クライアントコンポーネントがクイズ定義（`character-personality.ts`）をインポートする必要がなくなり、compatibilityMatrix（121KB）がバンドルに含まれるリスクを完全に排除する
- バリデーション:
  - `slug` が相性機能対応クイズであること（現時点では `character-personality` のみ）
  - `typeA`, `typeB` が対象クイズの有効なtypeIdであること（`isValidCharacterPersonalityTypeId` を使用）
  - 無効なパラメータには400エラーを返す
- 既存の `getCompatibility()` 関数を呼び出して1ペアだけ取得する
- 相性データが見つからない場合は404エラーを返す
- キャッシュ戦略: 相性データは完全に静的（デプロイ間で変わらない）なので、積極的なキャッシュを設定する
  - `Cache-Control: public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800`（1日キャッシュ、7日間stale-while-revalidate）
  - Next.jsの `export const dynamic = "force-static"` は使わない（クエリパラメータに依存するため）

**参考ファイル**: `src/app/api/yoji-kimeru/puzzle/route.ts`（既存APIパターン）

#### タスク2: CharacterPersonalityResultExtra.tsx の作成

既存の `MusicPersonalityResultExtra.tsx` と同じパターンで新規コンポーネントを作成する。ただし、相性データの取得方法が異なる。

- ファイルパス: `src/play/quiz/_components/CharacterPersonalityResultExtra.tsx`
- `"use client"` ディレクティブを使用
- **`character-personality.ts` を一切インポートしない**。相性データもタイプ情報（title, icon）もすべてタスク1のAPIレスポンスから取得する
- `renderCharacterPersonalityExtra(referrerTypeId?)` 関数をexport
- referrerTypeId のバリデーション: APIレスポンスのHTTPステータスで判断する（400が返ればinvalid）。クライアント側で `isValidCharacterPersonalityTypeId` をインポートする必要はない
- referrerTypeId あり → APIから相性データをfetch → CompatibilitySection + InviteFriendButton を表示
- referrerTypeId なし → InviteFriendButton のみを表示
- API fetch中はローディング表示を行う（ユーザー体験のため）
- inviteText は「似たキャラ診断で相性を調べよう!」のようなクイズを特定できる文言にする（既存の `CharacterFortuneResultExtra` が「キャラ診断で相性を調べよう!」を使用しているため、重複を避ける）

**参考ファイル**: `src/play/quiz/_components/MusicPersonalityResultExtra.tsx`

**注意**: MusicPersonalityResultExtraは相性データを直接インポートしているが、CharacterPersonalityResultExtraではAPIから取得する点が構造的に異なる。useEffect + fetchまたはuseSWRなどで非同期取得を行うこと。

#### タスク3: ResultExtraLoader.tsx に character-personality の分岐を追加

- `ResultExtraLoader.tsx` に `CharacterPersonalityResultExtra` の dynamic import を追加（`ssr: false`）
- `slug === "character-personality"` の if 分岐を追加
- 既存5クイズと同じ Wrapper パターンに従う
- ファイル冒頭のコメントにある対応クイズ一覧に `character-personality` を追加

**変更ファイル**: `src/play/quiz/_components/ResultExtraLoader.tsx`

#### タスク4: extractWithParam の汎用化 + generateMetadata のslug分岐（結果ページ対応）

現在 `extractWithParam` は `music-personality` のみをハードコードしている。character-personality にも対応するために拡張する。

- `extractWithParam` 関数に `character-personality` の分岐を追加
- `isValidCharacterPersonalityTypeId` を使ってバリデーションを行う
- importは `character-personality.ts` から追加（`isValidCharacterPersonalityTypeId` のみ。サーバーサイドなのでcompatibilityMatrixがバンドルに含まれるリスクはない）
- **`generateMetadata` 内の相性データ取得ロジックもslug分岐を追加する**:
  - 現在は `getCompatibility(resultId, compatFriendTypeId)` が music-personality 固定で呼ばれている
  - character-personality の場合は `character-personality.ts` の `getCompatibility` を呼ぶように分岐する
  - サーバーサイドなのでAPIを経由せず、直接 `character-personality.ts` の `getCompatibility` を呼べばよい
  - import名の衝突を避けるため、`getCompatibility as getCharacterCompatibility` のようにエイリアスを使う

**変更ファイル**: `src/app/play/[slug]/result/[resultId]/page.tsx`

#### タスク5: CompatibilityDisplay の汎用化

現在 `CompatibilityDisplay.tsx` は `music-personality` のデータをハードコードしている。slug に応じて適切なクイズデータと相性関数を使い分ける必要がある。

- page.tsx（サーバーコンポーネント）で全slugの相性データをサーバーサイドで解決し、CompatibilityDisplay に required props として渡す
- CompatibilityDisplay の props をすべて required にし、純粋な表示コンポーネントに簡素化（ownerのフィードバックにより実装時に方針変更）
- music-personality も character-personality もpage.tsxでサーバーサイド解決する統一方式に変更

**変更ファイル**:

- `src/app/play/[slug]/result/[resultId]/CompatibilityDisplay.tsx`
- `src/app/play/[slug]/result/[resultId]/page.tsx`（CompatibilityDisplay への props 追加）

#### タスク6: テストの作成

以下のテストを作成する:

1. **相性データAPIルートのテスト**
   - ファイルパス: `src/app/api/quiz/compatibility/__tests__/route.test.ts`
   - 有効なslug, typeA, typeBで正しいCompatibilityEntryとmyType/friendType情報が返ること
   - レスポンスに `myType: { title, icon }`, `friendType: { title, icon }` が含まれること
   - Cache-Controlヘッダーが正しく設定されていること
   - 無効なslugで400エラーが返ること
   - 無効なtypeA/typeBで400エラーが返ること
   - 存在しない組み合わせで404エラーが返ること
   - 既存APIテスト（yoji-kimeru等）のパターンに従う

2. **CharacterPersonalityResultExtra のユニットテスト**
   - referrerTypeId なしの場合に InviteFriendButton のみが表示されること
   - referrerTypeId あり（有効なID）の場合に API fetch後に CompatibilitySection と InviteFriendButton が表示されること
   - 無効な referrerTypeId の場合に InviteFriendButton のみが表示されること

3. **extractWithParam の拡張に対するテスト**
   - character-personality の有効な with パラメータが正しく抽出されること
   - character-personality の無効な with パラメータが undefined を返すこと
   - 既存の music-personality のテストが引き続き動作すること

#### タスク7: 動作確認とビルド検証

- `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功することを確認
- 相性データがAPIから1ペアだけ取得されていること（character-personalityのcompatibilityMatrixがクライアントバンドルに含まれないこと）

### 注意事項

- `character-personality.ts` に既に定義されている `getCompatibility` と `isValidCharacterPersonalityTypeId` をAPI側で活用し、重複実装を避けること
- **compatibilityMatrixをクライアントサイドにインポートしないこと**。クライアントコンポーネント（CharacterPersonalityResultExtra）からは `character-personality.ts` を一切インポートしない。タイプ情報（title, icon）もAPIレスポンスから取得する
- 既存5クイズの相性機能に影響を与えないこと（特に music-personality は extractWithParam と CompatibilityDisplay の両方を変更するため、リグレッションに注意）
- コンポーネント命名やファイル構成は既存パターンに厳密に合わせること
- APIレスポンスのキャッシュ: `Cache-Control: public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800`
- 将来的にmusic-personalityなど他のクイズもこのAPI方式に移行できるが、今回はcharacter-personalityのみをスコープとする

### 完了条件

1. character-personalityクイズの結果画面で「友達に診断を送る」ボタン（InviteFriendButton）が表示される
2. 友達経由でクイズを受けた場合（ref パラメータあり）、結果画面に相性結果（CompatibilitySection）がAPIから取得されて表示される
3. 結果ページ（`/play/character-personality/result/[resultId]?with=[typeId]`）で相性結果がサーバーサイドで取得されてローディングなしで即時表示される
4. compatibilityMatrix がクライアントバンドルに含まれない（クライアントコンポーネントから character-personality.ts を一切インポートしない）
5. 既存5クイズの相性機能が引き続き正常に動作する
6. すべてのテストが通り、lint / format / build がすべて成功する

### 検討した他の選択肢と判断理由

1. **compatibilityMatrix全体を遅延ロード（next/dynamic）する案**（旧計画）
   - ResultExtraLoaderで `ssr: false` の dynamic import を使い、compatibilityMatrix全体を遅延ロードする方法。相性機能を使わないユーザーの初回バンドルからは除外できるが、相性機能を使うユーザーには依然として121KB全体をダウンロードさせることになる。API方式なら1ペア約300Bだけで済むため、ユーザー体験の観点でAPI方式が圧倒的に優れる。ownerのフィードバックにより、API方式に変更した。

2. **CompatibilityDisplay を slug ごとに分離して dynamic import する案**
   - CompatibilityDisplay を `CharacterPersonalityCompatibilityDisplay.tsx` と `MusicPersonalityCompatibilityDisplay.tsx` に分離する方法。character-personalityはAPI方式で取得するためバンドルサイズの問題はない。music-personalityは既存動作を維持するため、現時点では分離の必要がない。

3. **extractWithParam をレジストリベースの汎用関数にする案**
   - quizBySlug レジストリから各クイズの validator 関数を取得する汎用的な設計。将来的に全クイズに相性機能を追加する場合は有用だが、現時点では対応クイズごとに明示的な分岐を書く方がシンプルで安全。バリデーション関数の型が各クイズで異なる可能性もあるため、現段階では if 分岐による拡張を選択した。

4. **CompatibilityDisplayでもAPIから取得する案**（レビュー指摘3で却下）
   - CompatibilityDisplay（結果ページ）でもAPIから相性データを取得する案。しかし、page.tsxはサーバーコンポーネントなので `character-personality.ts` の `getCompatibility` を直接呼べる。サーバーサイドで解決してpropsで渡す方が、ローディング表示不要で即時表示でき、UXが優れる。

### 計画にあたって参考にした情報

- `src/play/quiz/_components/MusicPersonalityResultExtra.tsx` — ResultExtra コンポーネントの実装パターン（renderXxxExtra 関数、CompatibilitySection / InviteFriendButton の使い分け）
- `src/play/quiz/_components/ResultExtraLoader.tsx` — dynamic import と slug 分岐のパターン（既存5クイズの登録方法）
- `src/play/quiz/data/character-personality.ts` — getCompatibility / isValidCharacterPersonalityTypeId の定義（既存の相性データアクセス関数）。モジュールトップレベルで `compatibilityMatrix` を import/re-export しているため、default export をクライアントからインポートするとtree-shakingが効かず121KBがバンドルに含まれるリスクがある
- `src/app/play/[slug]/result/[resultId]/page.tsx` — extractWithParam の現在の実装（music-personality のみ対応）、generateMetadata内の相性データ取得（music-personality固定）
- `src/app/play/[slug]/result/[resultId]/CompatibilityDisplay.tsx` — 結果ページ用相性表示（music-personality ハードコード、"use client" コンポーネント）
- `src/app/api/yoji-kimeru/puzzle/route.ts` — 既存APIルートのパターン（バリデーション、NextResponse.json の使い方）
- `src/play/quiz/_components/CompatibilitySection.tsx` — 相性表示の共通UIコンポーネント
- `src/play/quiz/_components/InviteFriendButton.tsx` — 友達招待ボタンの共通UIコンポーネント
- `src/play/quiz/data/__tests__/character-personality-compatibility-integrated.test.ts` — 相性データの既存テスト（300エントリの検証）

## レビュー結果

### レビュー1回目（計画レビュー）

指摘5件。すべて採用し計画を修正した。

- **指摘1（必須）**: generateMetadata内の相性データ取得がmusic-personality固定だった問題 → タスク4にslug分岐を追加
- **指摘2（必須）**: character-personality.tsのtree-shaking問題 → タスク1のAPIレスポンスにmyType/friendType情報を追加、タスク2でcharacter-personality.tsを一切インポートしない設計に変更
- **指摘3（推奨）**: CompatibilityDisplayをサーバーサイドで解決する方が即時表示でUXが良い → タスク5をサーバーサイド解決方式に変更
- **指摘4（推奨）**: APIキャッシュ戦略が未定義 → タスク1に具体的なCache-Controlヘッダーを明記
- **指摘5（質問）**: APIが必要な箇所の明確化 → 「APIの利用箇所の整理」セクションを新設し、CharacterPersonalityResultExtraのみがAPIを必要とすることを明記

### レビュー2回目（計画レビュー）

指摘2件（推奨のみ）。すべて採用し計画を修正した。

- **指摘1（推奨）**: inviteTextが既存のCharacterFortuneResultExtra（「キャラ診断で相性を調べよう!」）と重複していた → 「似たキャラ診断で相性を調べよう!」のようなクイズ特定文言に変更
- **指摘2（推奨）**: CompatibilityDisplayの分岐ロジックが不明確だった → propsの有無による分岐を明記（propsがあればそれを使い、なければ既存方式にフォールバック）

### レビュー3回目（実装レビュー1回目）

指摘3件（必須1件、推奨2件）。すべて対応。

- **指摘1（必須/バグ）**: CompatibilityDisplay.tsx で quizTitle に quizSlug を渡していた → ownerのフィードバックに合わせてpropsを全てrequiredに変更し、page.tsxで全slugのデータをサーバーサイド解決する方式に統一
- **指摘2（推奨）**: ローディング中にnullを返していた → 「相性データを読み込み中...」テキストを表示
- **指摘3（推奨）**: extractWithParamテストがインライン再実装 → extractWithParam.tsとして別ファイルに切り出し

### レビュー4回目（実装レビュー2回目）

指摘0件。承認。

### レビュー5回目（最終品質レビュー）

軽微な指摘1件（修正任意）。承認。

- **軽微**: CharacterPersonalityResultExtraテストでencodeURIComponentの検証がない（現実のtypeIdにはエンコード必要な文字が含まれないため実害なし）

## キャリーオーバー

- なし

## 補足事項

- ownerのフィードバックにより、計画段階のResultExtraLoader遅延ロード方式からAPI方式に変更。さらに実装段階でCompatibilityDisplayのpropsをオプショナルからrequiredに変更し、全slugのデータをpage.tsxでサーバーサイド解決する統一方式に改善した
- B-193シリーズ（ゲーム・クイズのサーバーサイドAPI横展開）の全4タスク（B-214, B-215, B-216 + 検討タスクB-193本体）がこのサイクルで完了

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
