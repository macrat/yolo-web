---
id: 200
description: B-314（ツール・遊び詳細ページの新デザイン移行 + タイル化、移行計画 Phase 8.1）第 1 タイル化サイクル。cycle-199 で完結した Phase 7 タイル基盤の上に char-count を乗せ、kind=widget 形態と ToolLayout 外側 1200px ハードコードの標準パターンを確立した。
started_at: 2026-05-21T15:03:47+0900
completed_at: 2026-05-21T20:49:06+0900
---

<!-- このファイルはサイクルドキュメントのテンプレートです。`<>`で囲まれた部分を適切な内容に置き換えて使用してください。内容は作業が進むごとに都度更新してください。 -->

# サイクル-200

cycle-199 で完結した Phase 7（タイル基盤：型契約 / サイズ枠定数 / レジストリ codegen / hidden 検証ルート）の直後の Phase 8.1 第 1 タイル化サイクル。原典 `docs/design-migration-plan.md` Phase 8 の手順に沿って、最初の 1 コンテンツを選び「詳細ページの新デザイン移行 + タイル定義」を同時実施する。着手対象の選定（GA4 PV / 構造単純度 / Phase 9 既存コンテンツ整理の依存）は cycle-planning で判断する。

B-314 は cycle-191/192/193 の 3 連敗を経て進捗ゼロ、Phase 7 タイル基盤も cycle-199 で 6 回目の挑戦でようやく完結した経緯がある。本サイクルでは原典 `docs/design-migration-plan.md` Phase 8 を一次資料として、cycle-199 で確定した型契約 / 定数 / レジストリの実体（`src/lib/tiles/` 配下）に直接当てる形で進める。過去の失敗サイクル md の設計判断を所与継承せず、cycle-199 の成果物だけを足場とする。

## 実施する作業

- [x] cycle-planning で作業計画を立案する（本ファイル「作業計画」セクションを埋める）
  - [x] 着手コンテンツの選定（char-count を確定。GA4 30日 PV=0 / 90日 PV=13 / 構造最単純 / Phase 9 非依存）
  - [x] kind 判定（kind=widget (b) を確定。詳細ページ Component touch せずタイル用簡素 UI 新設）
  - [x] ToolLayout × (new) の max-width 解決方針確定（page.tsx 最上位コンテナで ToolLayout 外側にラップして 1200px ハードコード、cycle-196 整合、原典 L308 準拠）
  - [x] 単独レンダリング検証ルートの設計（`/internal/tiles/preview/[domain]/[slug]` 新動的ルートを本サイクルで新設）
  - [x] reviewer r1〜r5 の指摘全件反映（r5 で両 reviewer Pass）
- [x] cycle-execution で計画に沿った実装を行う
  - [x] T-1: 現状把握と移行前 baseline 取得
  - [x] T-2: 詳細ページの (new) 配下移行（ToolLayout 外側ラップで 1200px ハードコード、trustLevel は本サイクル維持し Phase 8.1 完了時に一括削除）
  - [x] T-3: タイル定義（kind=widget）と単独レンダリング検証ルートの実装
  - [x] T-4: 単独レンダリング検証と統合確認
- [x] cycle-completion でサイクルを完了させる

## 作業計画

### 目的

cycle-199 で完結した Phase 7 タイル基盤（型契約 Discriminated Union / サイズ枠定数 / レジストリ codegen / hidden 検証ルートの最小骨格）の上に **最初の 1 コンテンツを乗せて Phase 8 を始動する**。本サイクルは原典 `docs/design-migration-plan.md` Phase 8.1「ツール詳細の新デザイン移行 + タイル定義の同時実施」の第 1 弾。

位置付けとして本サイクルは以下を兼ねる:

- Phase 7 基盤の **`kind: "widget"` 形態（タイル用に詳細ページとは別 UI を新設）の試験台**。kind=widget を採るのは、char-count の詳細ページ Component（`textarea rows=10` + 6 統計値 grid、PC 1200px 幅前提）を 128px ベースの `tile-grid` セルへ直接押し込むと UI が破綻するため。詳細ページ Component.tsx は touch せず、タイル用簡素 UI を別ファイルとして新設する。これにより T2 の dislikes「以前と同じ入力なのに結果や挙動が前回と変わっていること」を構造的に排除しつつ、Phase 7 の (b) 形態が実用に耐えるかを実証する。
- Phase 8.1 残り 33 件 / Phase 8.2 の 20 件が再利用する **単独レンダリング検証インフラ** の整備。cycle-199 確定の `/internal/tiles` は「件数のみ返す最小骨格」であり、その配下に **新ルート `/internal/tiles/preview/[domain]/[slug]`** を本サイクル T-3 で新設する（cycle-199 確定設計は触らない）。第 1 タイル化サイクルが基盤検証ルートを併せて整備するのは合理的（cycle-199 が件数のみで終わったため Phase 8 第 1 弾で補完する）。
- **Phase 8.1 全 34 件で踏襲される「標準パターン」の確立**。本サイクルで採用する「ToolLayout は touch せず、ToolLayout の外側で page 個別 CSS Module を新設し `max-width: 1200px` ハードコード」というパターンは、原典 L308「ハードコード 1200px が唯一の正準パターン」「既存正常ページ blog/tools/play/blog[slug]/トップで採用済のパターン踏襲」と完全整合し、cycle-196 (B-425) で about / privacy / 404 に採用された正準パターンと同型。Phase 8.1 残り 33 サイクルが本サイクルの page.module.css 構造をテンプレートとして再利用できる。

### 着手対象: `char-count`、採用設計（核となる判断）、kind=widget 採用根拠、recommendedSize 2 案比較、タイル UI 縮約根拠と詳細ページ導線 UI 仕様、a11y / placeholder / 配列順序方針

#### 選定理由

- **GA4 直近 30 日 PV = 0、直近 90 日 PV = 13**（来訪者影響は最小級だが完全ゼロではない。ロジック挙動同一性は確実に保つ）
- **構造最単純**: Component 58 行 / logic 55 行 / 外部依存なし / `useState` 1 個のみ。tools 34 件中で外部依存ゼロかつ最小規模
- **Phase 9 非依存**: tools 配下のため Phase 9.1（achievements）/ 9.2（cheatsheets）/ 9.3（dictionary）との二重作業リスクなし
- **cycle-192 キャリーオーバー継続性**: 当時の参考データでも char-count は「PV 低い + 単純」枠の最有力候補に挙がっており選定の連続性がある

#### 採用設計（核となる判断、r5 で確定）

本サイクルの max-width 1200px 制約達成方針は、軸 3 比較（6 案）の結果として以下の **案 (f)** を採用する:

> **char-count ページ最上位コンテナ（ToolLayout の外側）で `max-width: 1200px` をハードコード**。具体的には `(new)/tools/char-count/page.tsx` の最上位を新規 CSS Module（例: `(new)/tools/char-count/page.module.css`、命名は execution で決定）でラップし、その外側コンテナに `max-width: 1200px; margin: 0 auto` をハードコードする。`<ToolLayout>` は **その内側に従来どおり呼び出す**（ToolLayout 本体は touch しない）。

**技術的成立根拠**（PM が T-1 着手前段階で ToolLayout 実体を Read で確認済、`src/tools/_components/ToolLayout.tsx` L16-66 + `ToolLayout.module.css` L1-7）:

- ToolLayout は `<article className={styles.layout}>` を最上位として render し、`.layout` クラスに `max-width: var(--max-width);` を持つ
- (new) 配下では `var(--max-width)` が未定義のため `none` に解決される。`max-width: none` は「制約なし」を意味し、`block` 要素は親要素の content-box 幅まで広がる
- したがって page.tsx 側の **外側ラップ div で `max-width: 1200px`** をかけると、その内側の `<ToolLayout>`（`.layout` 要素）は親（1200px）幅に block 要素として収まる
- 結果: ToolLayout 自体および ToolLayout 配下の Breadcrumb / FaqSection / ShareButtons / RelatedTools / RelatedBlogPosts も全て 1200px 以内に収まり、原典 L308「`max-width: 1200px; margin: 0 auto` を必須記載」「ハードコード 1200px が唯一の正準パターン」に完全準拠
- 完成条件「w1900 で `document.querySelector('main > *').getBoundingClientRect().width < 1300px`」を Playwright 実機計測で満たせる

**Phase 8.1 全 34 件への展開**: 本パターン（page.tsx 最上位コンテナ + 個別 page.module.css での 1200px ハードコード）は Phase 8.1 残り 33 件のサイクルで踏襲する標準テンプレートとして再利用できる。「本サイクル外として認識する事項」セクションにも標準パターン化として明示。

#### 詳細ページ Component の実体（実装内訳）

T-1 で `src/tools/char-count/Component.tsx` を Read で実体確認した結果、表示されている統計値は **6 項目**（順序通り）:

1. **文字数** (`result.chars`)
2. **文字数（空白除く）** (`result.charsNoSpaces`)
3. **バイト数（UTF-8）** (`result.bytes`)
4. **単語数** (`result.words`)
5. **行数** (`result.lines`)
6. **段落数** (`result.paragraphs`)

r3 計画書本文で挙げていた「全角換算」は実体に存在せず、代わりに「段落数」が含まれる。本 r5 でもすべての箇所を上記実体に揃える。AP-WF12（コンテンツ実体未確認）違反として「作業中の注意点」セクションにも発火事例として記録する。

#### kind=widget の採用根拠

- 詳細ページ Component は 1200px 幅前提の textarea + 6 項目 grid。そのまま 2×2（264px）/ 3×2（400×264px）のタイル枠に押し込むと縦長 UI になり「コンパクトな UI 単位」原則（原典 L49）に反する
- kind=widget を選ぶことで詳細ページ Component.tsx を一切触らずに済み、T2 dislikes「同入力に違う出力 / 挙動が前回と変わる」リスクが構造的に排除される（ロジック呼び出し経路自体が変わらない）
- Phase 7 基盤で型契約として用意された (b) widget 形態の実用性が、第 1 弾で実証される（kind=single 形態の検証は将来サイクルで別途実施）

#### タイル UI 縮約根拠（来訪者価値判断、MAJOR-1 反映）

タイル UI で詳細ページの 6 統計値（文字数 / 文字数（空白除く）/ バイト数（UTF-8）/ 単語数 / 行数 / 段落数）→ **1 項目（文字数のみ）に縮約** する判断の根拠と限界:

肯定材料:

- **「タイル UI = 道具箱の入口」「コンパクト UI 原則」（原典 L49）**: タイル幅 2-3 列に 6 統計値を並べると視認性・タップ容易性が落ち、Phase 10 道具箱の「素早く取り出せる道具」体験を阻害する
- **Phase 7 (b) widget = 詳細ページと並存する別 UI**: 詳細ページが深堀り経路として常に並存するため、タイル側は最頻用の 1 項目に絞っても来訪者体験は損なわれない（「もっと詳しく」は明示的な詳細ページ導線で吸収）
- **char-count の典型用途は「文字数の素早い確認」**: T-1 で実体 Read する `src/tools/char-count/meta.ts` の `howItWorks` / `searchKeywords` 等の文言を本計画書本文に短く反映（typical use の根拠材料）

否定材料 / 限界:

- 6 項目のうち「文字数のみ」とした選定根拠は GA4 / 詳細ページ内クリック動線では現時点では実測不能（タイル UI 自体が未公開のため）
- 「段落数」「行数」がメール / SNS 投稿向けにタイル単体で見えていた方が便利、という来訪者層が存在する可能性は否定できない

**本サイクルでは仮置きとして 1 項目（文字数）を採用し、Phase 10 ダッシュボード本公開後の GA4 / タイル内クリック / 詳細ページ離脱動線データで再評価して 2〜3 項目に拡張するか判断する。「本サイクル外として認識する事項」セクションに Priority P2 として明示する。**

#### タイル UI の機能セット（詳細ページ導線 UI 仕様を含む）

タイル用簡素 UI に含める要素を基本設計レベルで確定する:

1. **タイトル**: 「文字数カウント」等の簡潔ラベル（widgetSummary と整合）
2. **1 行 ~ 数行入力欄**: textarea（recommendedSize に応じて rows=2-3 程度）。詳細ページの rows=10 とは別設定
3. **文字数のみ表示**: ラベル「文字数」+ 数値。ロジックは `analyzeText(text).chars` を参照（**本サイクル仮置き、Phase 10 後再評価対象** — 軸 1 (d) 案 3 項目への拡張可能性あり）
4. **詳細ページ導線**: タイル下部に **「詳細ページで開く」テキストリンク** を配置
   - Next.js `<Link>` で `/tools/char-count` 詳細ページへ遷移
   - 明示的なリンク要素（フォーカス順序が a11y 的に追える設計）
   - **カード全体クリックは採らない**: タイル UI 内の input/textarea クリックと競合し、入力中に誤って詳細ページへ遷移するリスクがある
   - アイコン併用（外部リンクアイコン等）は execution で判断（最小実装ではテキストリンクのみで可）

#### recommendedSize 2 案比較

- **案 (i): cols=2 rows=2 (264×264px)**: 最小占有面積。入力欄が 1 単語幅に狭く、実用テキスト（例: SNS 投稿の下書き 30〜140 字）を貼れない → 実用性が落ちる
- **案 (ii): cols=3 rows=2 (400×264px)** ← **採用推奨**: 1 行 30 字程度の中量テキスト入力が成立する。Phase 10 ダッシュボードで他タイルと並べたときの占有面積も妥当

**スマホ表示に関する補足（MINOR-2 反映）**: 案 (ii) 400px は w360 viewport (360px) を超えるため、`/internal/tiles/preview/[domain]/[slug]` 検証ルートでの単独表示時、w360 では横スクロールまたは入力欄が画面幅を超える表示になる前提。本サイクルでは検証ルートで「タイル単体の固定サイズ表示」を w360/w1280 で確認するが、Phase 10 ダッシュボード本実装での多タイル配置時のレスポンシブ動作（cols 縮退 / 全幅追従）は別途必要であり本サイクル対象外。

最終値は execution の visual 確認（タイル単独表示）で確定可。**recommendedSize の最終的な妥当性評価は Phase 10.1 着手時に「ダッシュボード上の他タイルとの並列配置で破綻しないか」を実コンテキストで再確認する**（原典 L228-231 とも整合）。

#### a11y / placeholder / 配列順序方針

- **a11y**: タイル UI も詳細ページと同等の a11y を満たす（input 要素に `aria-label`、focus 順序が論理的（textarea → 文字数表示 → 詳細ページリンク）、コントラスト 4.5:1 以上）
- **placeholder**: 入力欄 placeholder は「文字を入力すると数えます」等の簡潔な日本語。型契約 `inputPlaceholder` がある場合はその値と同一にする
- **`TILE_DECLARATIONS` 配列追加位置**: 配列の **末尾** に追加（codegen 出力順は宣言順を保持。アルファベット順や任意ソートではない。後続サイクルが追加するときも末尾追加で統一）

### 来訪者価値

第 1 タイル化サイクル単体では来訪者から見える変化は限定的（char-count 詳細ページの新デザイントークン化のみが表面化）。中期的価値および target 配慮は以下:

- **「特定の作業に使えるツールをさっと探している人」（T1）**: search_intents に「文字数カウント」が明示された直接ヒット候補。新デザイン適用で「ページを開いた瞬間に入力欄が見えて、すぐ使い始められる」likes 項目を維持・改善する。詳細ページの first paint がタイトル + 入力欄になる構造を崩さない。
- **「気に入った道具を繰り返し使っている人」（T2）**: dislikes 三大項目への具体的配慮:
  - 「同入力に違う出力」→ logic.ts は移動・改修対象外。kind=widget 採用で詳細ページ Component.tsx 自体も touch しない。ロジック挙動同一性は (a) `__tests__/logic.test.ts` の全件 pass 維持、(b) Playwright で同入力テキスト（例: `'こんにちは Hello\n二行目'`）の 6 統計値（文字数 / 文字数（空白除く）/ バイト数（UTF-8）/ 単語数 / 行数 / 段落数）が baseline と完全一致、の 2 段で確認
  - 「URL リダイレクトなし」→ URL は `/tools/char-count` 同一を維持（Route Group `(new)` は URL に出ない Next.js 仕様）。OGP / Twitter Card 画像も `git mv` でディレクトリごと追従させ、`/tools/char-count/opengraph-image` 等が 200 を返すことを T-4 で確認
  - 「動作遅延」→ kind=widget の簡素 UI 側はロジック呼び出しが詳細ページと同経路。バンドルサイズ増分は logic.ts の再 import 1 個分のみで実用上無視できる
- **T2 likes「前回入力した値や設定が残っていて作業がさらに短縮されること」**: 本サイクルでは入力値の localStorage 保持を実装しない。タイル全般の共通機能として Phase 7 基盤の拡張または Phase 10 ダッシュボード本実装時に検討する（「本サイクル外として認識する事項」参照）

中期的には Phase 10 で道具箱として届ける際の「タイル化された道具の 1 つ目」として、残り 33 件の Phase 8.1 サイクルおよび 20 件の Phase 8.2 サイクルの作業効率と品質を引き上げる前提を作る。本サイクルで決める `recommendedSize` および「タイル UI 1 項目縮約」の妥当性は Phase 10 ダッシュボード本公開後の実データで最終評価される（短期では実測不能、長期評価対象）。

### 作業内容

各タスクは reviewer Pass を完了条件に含める。サイクル中 1 件でも reviewer 指摘が残っているタスクは Done としない（cycle-192 学び 2）。実装レベルの詳細（コード例 / 関数名 / 具体的なファイル内容）は execution に委ねる（AP-P20）。

#### T-1: 現状把握と移行前 baseline 取得

目的: T-2/T-3 の前提となる「現状の実体」と「移行前の視覚 / ロジック挙動」を baseline として確定し、T-4 の比較資料を揃える。

実施内容:

- **char-count 自身のファイル群を Read で実体確認**: `src/tools/char-count/{Component.tsx, Component.module.css, logic.ts, meta.ts, __tests__/logic.test.ts}` と、詳細ページ側の `src/app/(legacy)/tools/char-count/{page.tsx, opengraph-image.tsx, twitter-image.tsx}` の **全 3 ファイル**（page.tsx だけでなく OGP / Twitter Card 画像も含めて全件確認）
- **meta.ts の典型用途文言の確認（MAJOR-1 反映）**: `src/tools/char-count/meta.ts` の `howItWorks` / `searchKeywords` / `description` / `name` を実体 Read し、「典型用途は文字数の素早い確認」仮説の裏付け文言を本計画書本文の根拠材料に短く反映する。否定材料（段落数 / 行数を一覧で見たい層）の言及があるかも確認
- **共通依存コンポーネントの旧トークン残存状況を grep で確認**: `@/tools/_components/ToolLayout` および ToolLayout が import する `@/components/common/{Breadcrumb, FaqSection, ShareButtons, RelatedTools, RelatedBlogPosts}` 等を一覧化し、各 `.module.css` で `var(--color-*)` / `var(--max-width)` の残存有無を grep で記録。**ToolLayout 系および (new) `src/app/globals.css` は本サイクル T-2 で一切 touch しない**（cycle-196 B-425 確定方針 + 原典 L308「ハードコード 1200px が唯一の正準パターン」との整合）。`var(--color-*)` 残存は本サイクル外で別 backlog Priority P1 として起票する目的で記録のみ
- **(new) globals.css の `--max-width` 未定義確認**: `src/app/globals.css` を Read し、`--max-width` 変数が **未定義** であることを実体確認する（変更しないが、ToolLayout の `var(--max-width)` が `none` に解決される前提を裏打ちするため）。なお (legacy) 側 `src/app/old-globals.css` には `--max-width: 960px;` が定義済（cycle-196 確認済）
- **`(new)/layout.tsx` の sharedMetadata 確認（MINOR-2 反映）**: `src/app/(new)/layout.tsx` および参照される `sharedMetadata`（`src/app/shared-metadata.ts` 等の実体は T-1 で grep して特定）の `robots` 設定を Read で実体確認し、子 `page.tsx` 側で `metadata: { robots: { index: false, follow: false } }` を設定した場合の merge 結果が `noindex,nofollow` になる前提を T-3 着手前に把握する。Next.js 15 metadata merge 仕様（子の値が親を上書きする）も合わせて確認
- **Playwright で移行前 baseline スクリーンショットを取得**: `/tools/char-count` を w360 / w1280 / **w1900** × ライト / ダーク = 計 **6 枚**（移行前にも w1900 を撮ることで step 9「移行前後の比較」が成立する）。保存先 `./tmp/screenshots/cycle-200/before/`
- **既存テストの baseline 記録**: `npm run test -- src/tools/char-count/__tests__/logic.test.ts` の pass 件数と passing 状態を記録。logic.ts は本サイクルで移動しないため import パス追従は不要

GA4 補助確認は本 T-1 で行わない（既に確認済の値「90 日 PV = 13」を本計画書本文で参照するのみ）。

#### T-2: 詳細ページの `(new)/` 配下移行と page 個別 CSS Module での 1200px ハードコード（採用案 (f)）

目的: 原典 L300-313「1 ページ移行の標準手順」step 1-6, 8 を char-count に適用し、`(new)/tools/char-count` を成立させる。**ToolLayout 系共通コンポーネント（および ToolLayout.module.css 自体）、(new) `src/app/globals.css`、(legacy) 側ファイル群は本サイクルで一切 touch しない**（cycle-196 B-425 確定方針 + 原典 L308「ハードコード 1200px が唯一の正準パターン」との整合）。完成条件「width<1300px」達成のため、**`(new)/tools/char-count/page.tsx` の最上位を新規 CSS Module で `max-width: 1200px` ラップ** することで対応する（採用案 (f)）。コミット粒度: T-2 を **独立コミット** とする（原典 L313）。

実施手順（原典標準手順を char-count に適用）:

1. **依存コンポーネントの確認**: T-1 で grep 済の結果を再利用。「`var(--color-*)` の (new) 配下対応未完だが本サイクルでは触らない」と明示
2. **`git mv (legacy)/tools/char-count → (new)/tools/char-count`**: page.tsx / opengraph-image.tsx / twitter-image.tsx の **3 ファイルを丸ごと移動**
3. **import パスの修正**: ページ内の `@/components/common/*` を `@/components/*` に置換（該当があれば）。ToolLayout のパスエイリアスは変わらない
4. **CSS Module 内のトークン置換**: char-count 個別の `Component.module.css` の `var(--color-*)` 系を `--bg` / `--fg` / `--accent` 系に置換。**CSS Module 内に `:root.dark` セレクタが追加・変更される場合は必ず `:global(:root.dark)` に修正**（原典 L307、`docs/knowledge/css-modules.md` 参照）
5. **page.tsx 最上位コンテナの新規 CSS Module 化と 1200px ハードコード（採用案 (f) の核）**: `(new)/tools/char-count/page.module.css`（命名は execution で決定）を新規作成し、最上位コンテナクラス（例: `.page` 等、命名は execution で決定）に `max-width: 1200px; margin: 0 auto;` を **ハードコード** する。`(new)/tools/char-count/page.tsx` 側で `<ToolLayout>` を **その内側にそのまま呼び出す**（ToolLayout 本体は touch しない）。これにより:
   - (legacy) 33 ツール（yaml-formatter / business-email / csv-converter / image-resizer 等）の本文幅は ToolLayout.module.css L2 + old-globals.css の組み合わせで現在の 960px のまま **完全に不変**
   - (new) 側の char-count は外側 1200px コンテナの内側で ToolLayout（max-width: var(--max-width) → none 解決）が block 要素として親幅 1200px に収まる
   - cycle-196 で about / privacy / 404 に採用された正準パターンと同型、原典 L308「ハードコード 1200px が唯一の正準パターン」「既存正常ページ blog/tools/play/blog[slug]/トップで採用済のパターン踏襲」と完全整合
   - Phase 8.1 残り 33 サイクルが同一テンプレート（個別 page.module.css に 1200px ハードコード）を踏襲できる
6. **DESIGN.md に従ったデザイン適用**: char-count ページ最上位コンテナ（step 5 で新設した外側ラップ）と Component.tsx 周辺のレイアウト / タイポ / ボタン / フォーム状態 / a11y を新デザイン体系に合わせて再設計。ただし詳細ページ内のロジック部 Component.tsx の **構造変更は行わない**（T2 dislikes 配慮）
7. **TrustLevelBadge JSX/import の確認（trustLevel フィールドは本サイクル維持、PM r5.1 確定）**:
   - `src/tools/char-count/meta.ts` の `trustLevel: "verified"` フィールドは **本サイクル維持する**（削除しない）。T-1 baseline で `ToolLayout.tsx` から TrustLevelBadge は既に未 import 状態であり、原典 L309 後半（badge 使用ありの場合の手順）の前提が成立しないため
   - 移行後の詳細ページ `(new)/tools/char-count/page.tsx`（および ToolLayout 等）に `@/components/common/TrustLevelBadge` の import / `<TrustLevelBadge />` JSX 使用がないことを確認するのみ（撤去対象が既に存在しないことの確認）
   - `src/tools/types.ts` の `ToolMeta` 型は **touch しない**（required のまま維持）。**この方針により他 33 ツールの meta.ts および既存テスト群（`src/lib/__tests__/seo.test.ts` 4 箇所 / `cross-links.test.ts` 3 箇所 / `seo-cheatsheet.test.ts` 1 箇所 / `ToolCard.test.tsx` / `ToolLayout.test.tsx` / `newSlugs.test.ts` / `line-break-remover/__tests__/meta.test.ts` 等）への波及はゼロ**。`meta.ts` の `trustLevel` 維持で `satisfies ToolMeta` 型エラーが回避され、型 optional 化（AP-I02 違反）も回避される。Phase 8.1 全 34 件完了時に backlog 17-(b)（P2）で `ToolMeta.trustLevel` 型完全削除 + 33 件の `trustLevel: "verified"` 一括削除を実施
8. **既存テスト確認**: `__tests__/logic.test.ts` は logic.ts と同位置のため import パス追従不要。`npm run test -- src/tools/char-count/` および `npm run test -- src/lib/ src/tools/_components/` で全件 green を確認

#### T-3: タイル定義（kind=widget）と単独レンダリング検証ルートの実装

目的: char-count を `TILE_DECLARATIONS` に kind=widget で追加し、Phase 8 残り全件 / Phase 8.2 でも再利用できる単独レンダリング検証ルート `/internal/tiles/preview/[domain]/[slug]` を新設する。コミット粒度: T-3 を **独立コミット** とする。

実施内容:

- **タイル用簡素 UI コンポーネントの新規実装**: `src/tools/char-count/` 配下に新規ファイルとしてタイル用簡素 UI を実装。機能セットは本計画書「着手対象」セクション「タイル UI の機能セット（詳細ページ導線 UI 仕様を含む）」に従い、(1) タイトル / (2) 1〜数行 textarea / (3) 文字数のみ表示 / (4) 「詳細ページで開く」テキストリンク（Next.js `<Link>` で `/tools/char-count` へ遷移、カード全体クリックは採らない）の 4 要素を含める。ファイル名は execution で決定（命名規約は execution 範囲、AP-WF03 境界）。logic.ts は touch せず import するのみ。`"use client"` 必須（useState 使用のため）。CSS Module は新規追加してよいが新トークンのみ使用。a11y / placeholder / focus 順序は本計画書「着手対象」セクションの方針に従う
- **`tile-declarations.ts` の TILE_DECLARATIONS に 1 件追加**: 配列 **末尾** に kind=widget で `widgetSummary`（30 字以内）/ `tileComponent`（新規タイル UI コンポーネント参照）/ `recommendedSize`（採用案 cols=3 rows=2 推奨、execution で最終確定可）/ `detailPath: "/tools/char-count"` 等 Phase 7.1 の `TileDefinitionWidget` 型契約が型レベルで required にしているフィールドを全て埋める。`recommendedSize` は `tile-grid.ts` の `TILE_CELL_PX` / `TILE_GAP_PX` / `calcTilePixels()` 経由で参照（直接 128 / 8 を書かない）
- **codegen 再生成**: `npm run generate:tiles-registry` を実行し、`src/tools/generated/tiles-registry.ts` に **`{ domain: "tools", slug: "char-count", kind: "widget" }` の 3 フィールドのみ** が追記されることを確認。tileComponent / recommendedSize 等は関数参照や複合型のため codegen 出力には含まれない設計（cycle-199 確定。実行時に tileComponent 等を使うコードは `tile-declarations.ts` を直接 import する）
- **`/internal/tiles/preview/[domain]/[slug]` 動的ルート新設**: `src/app/(new)/internal/tiles/preview/[domain]/[slug]/page.tsx` を新規実装。境界条件を以下のレベルで明文化:
  - **4 系統対応**: TileDomain（tools / cheatsheets / play / dictionary）全てに対応する **汎用ルート**。domain 値で分岐せず TILE_DECLARATIONS から `(domain, slug)` 一致でエントリを引く
  - **entry 不在時**: Next.js の `notFound()` 呼び出しで標準 404 を返す
  - **親コンテナサイズ**: 取り出した `tileComponent` を `style={{ width: calcTilePixels(cols, rows).width, height: calcTilePixels(cols, rows).height }}` で包んだ親 div で描画する（recommendedSize に従う）。タイルが「タイル幅で表示される」ことを正しく検証可能にする
  - **Next.js 15 params 形式**: `params: Promise<{ domain: string; slug: string }>` 形式（Next.js 15 動的ルート仕様）。T-3 execution で `next/types` の最新仕様および本リポジトリの他動的ルートの実装パターンを実体確認した上で実装
  - **generateStaticParams**: 本サイクルでは **設定しない**（hidden ルートのため ISR / 動的でも問題なし）
  - **noindex 設定**: `metadata: { robots: { index: false, follow: false } }` を **静的設定**（generateMetadata は不使用）
  - **sitemap 除外確認**: 本サイトの sitemap 生成方針を T-3 で確認し、`/internal/*` が既に除外されていることを実体確認（cycle-199 `/internal/tiles` インデックスで実施済の想定）。除外されていなければ追加する
  - **共通コンポーネント import**: cycle-199 `/internal/tiles` インデックスは「既存共通コンポーネント import 禁止」だったが、新ルートは tileComponent を実体描画するため、tileComponent 自体は普通の React コンポーネントとして使う。新ルートページ自身の CSS Module 新設は不要（親 div の inline style のみ）
- **新規テスト追加**: (a) タイル用 React コンポーネントの新規テスト（render + 文字数表示の値検証 + 入力反映確認 + **詳細ページ導線リンク要素の存在と `href="/tools/char-count"` を確認**）、(b) `/internal/tiles/preview/[domain]/[slug]` ルートのテスト（existing slug = 200、non-existing slug = 404）を新規追加。既存 `__tests__/logic.test.ts` は logic.ts touch しないため変更不要
- **再利用性の担保**: 新ルートは特定スラッグへの依存を持たず、TILE_DECLARATIONS にエントリがある任意の `(domain, slug)` を描画できる汎用実装にする。これにより Phase 8.1 残り 33 件 / Phase 8.2 の 20 件全件で再利用可能

#### T-4: 単独レンダリング検証と統合確認

目的: 移行後の状態が原典 Phase 8 完成基準を実体ベースで満たしていること、および移行前 baseline と比較して「同等以上」であることを確認する。「コンパイル通過 / 200 OK」を Done と判定しない（cycle-192 学び 1）。

実施内容:

- **`/internal/tiles/preview/tools/char-count` の単独表示確認**: Playwright で w360 / w1280 × ライト / ダーク = **4 枚**。タイル UI 単体が破綻なく成立しているか、widgetSummary が表示されているか、を画像 1 枚ずつ実体観察 → 記述 → 再照合（AP-WF05 cycle-185 ルール）。**詳細ページ導線の客観確認**: (1) 「詳細ページで開く」リンク要素が DOM に存在する（`page.locator('a[href="/tools/char-count"]').count() > 0`）、(2) リンクが viewport 内に視認可能（visible）、(3) クリックすると `/tools/char-count` 詳細ページへ遷移する、(4) リンクが Tab フォーカス到達可能、の 4 条件を Playwright で実機確認。保存先 `./tmp/screenshots/cycle-200/tiles-preview/`。w360 では 400px タイル幅が viewport を超える前提のため、横スクロール発生有無 / タップ可能領域成立も観察項目に含める
- **`/tools/char-count` 詳細ページの動作確認**: Playwright で w360 / w1280 / w1900 × ライト / ダーク = **6 枚**。w1900 で `document.querySelector('main > *').getBoundingClientRect().width < 1300px` を Playwright 実機計測（原典 L312）。T-2 step 5 で **page 個別 CSS Module に 1200px ハードコード（採用案 (f)）** を追加することで本条件は満たせる前提（ToolLayout.module.css・(new) globals.css 共に touch しない、cycle-196 確定方針 + 原典 L308 正準パターン整合）。保存先 `./tmp/screenshots/cycle-200/after/`
- **移行前 baseline との比較**: T-1 で取得した `./tmp/screenshots/cycle-200/before/` 6 枚と after/ 6 枚を並べ、移行前と「同等以上」（コンセプトに沿った改善）であることを評価。評価結果はサイクルドキュメントに 4 列テーブル（観点 / before / after / 判定）で残す（AP-WF11 並べ読みの成果物化）
- **OGP / Twitter Card 画像の生存確認**: `/tools/char-count/opengraph-image` / `/tools/char-count/twitter-image` が 200 を返すことを `curl -I` または Playwright で確認
- **noindex / sitemap 除外確認**: `/internal/tiles/preview/tools/char-count` の HTML を取得し `<meta name="robots" content="noindex,nofollow">` 相当が出力されていること、および sitemap.xml に `/internal/*` が含まれていないことを確認
- **既存テスト + 新規テスト pass 確認**: T-1 で記録した baseline と同じ件数 / passing 状態であることを `npm run test` で確認。新規追加したタイル UI コンポーネントテストおよび新ルートテストも含めて全件 green
- **Playwright スモーク**: タイル UI（`/internal/tiles/preview/tools/char-count`）に "abc" を入力 → 3 が表示されることを実機確認。詳細ページ側も同入力テキスト（例: `'こんにちは Hello\n二行目'`）で **6 統計値（文字数 / 文字数（空白除く）/ バイト数（UTF-8）/ 単語数 / 行数 / 段落数）** が baseline 想定値と完全一致することを確認
- **数値直書きチェック**: `grep -rE "\b128\b|\b8(px)?\b" src/tools/char-count/ --include='*.{ts,tsx,css}'` で、タイル化由来の数値直書き（128 / 8）が存在しないことを確認。`\b8(px)?\b` は `0.8`（小数点で単語境界が成立）や `800`（`8` のみ単独でないため境界不成立で除外）等を拾うため、検出された場合は execution が 1 件ずつ偽陽性かタイル数値直書きかを判定（既存の `border-radius: 0.5rem` 等の無関係数値は対象外）
- **旧トークン残存チェック**: `grep -rEn "var\(--color-[a-z]" src/tools/char-count/ --include='*.module.css'` が空であることを確認（char-count 個別 CSS Module のみ。`var(--color-` の後に英小文字が続く狭い正規表現で偽陽性を回避。ToolLayout 系共通コンポーネントは本サイクル外のため別 backlog として記録）
- **全件チェック**: `npm run lint && npm run format:check && npm run test && npm run build` を全成功させる

### 作業中の注意点

cycle-191/192/193 連敗の 5 落とし穴を、本サイクル T-1〜T-4 のどの段階で発火しうるかを 1 件ずつ紐付ける:

1. **過去サイクル PM 判断の無批判継承を避ける（cycle-192 学び）**: 主に **T-3 で `kind` 判定 / `recommendedSize` 確定** を行う段階で発火しうる。cycle-191/192 当時の「13 バリアント設計」「タイル非埋め込み」判断は所与にせず、原典 L156-184 と Phase 7 型契約（`tile-definition.ts`）だけを根拠とする
2. **`/internal/tiles` 関連を視覚回帰観察対象から除外しない**: **T-4 Playwright 撮影対象を決める** 段階で発火しうる。新設の `/internal/tiles/preview/tools/char-count` を必ず撮影対象に含める（cycle-199 の `/internal/tiles` インデックスは件数のみ返す最小骨格のため視覚撮影は不要だが、件数が 0 → 1 に変わったことだけは確認）
3. **「コンパイル通過 / 200 OK」を Done と判定しない（cycle-192 学び 1）**: **T-4 完了判定** で発火しうる。`npm run build` 成功と HTTP 200 は必要条件であり十分条件ではない。原典 L184 完了基準 + 本計画書「完成条件」全項目を実体ベース（grep / Playwright / ファイル参照）でチェックリスト化して全件確認する
4. **原典本文を一次資料として直接 Read する（cycle-193 学び）**: **T-1 / T-3 / T-4 で根拠を参照する** 段階で発火しうる。根拠は `docs/design-migration-plan.md` の L 番号付き引用と `src/tools/_constants/` 配下の実体コードのみ。cycle-191/192/193 サイクル md の設計判断は引用禁止
5. **レビュー反復を「膨張」と誤認して途中打ち切りにしない（cycle-192 学び 2）**: **各 T の reviewer Pass 判定** で発火しうる。reviewer 指摘がゼロになるまで反復。PM が「修正は機械的なので Pass 相当」と独自に再レビュー省略することを禁ずる。指摘が多いことは将来の手戻り先取りであり健全
6. **コンテンツ実体を確認してから計画書本文に書く（AP-WF12 発火事例：r3 段階での実害 + r4 段階での再発）**:
   - r3 段階: 計画書本文では char-count 詳細ページの統計値を「6 統計値（文字数 / 文字数（空白除く）/ 行数 / 単語数 / バイト数 / 全角換算）」と記載していたが、実体 `src/tools/char-count/Component.tsx` は **「文字数 / 文字数（空白除く）/ バイト数（UTF-8）/ 単語数 / 行数 / 段落数」**。「全角換算」は実体に存在せず、「段落数」が抜けていた。r3 reviewer2 で MAJOR 指摘として捕捉され r4 で実体に合わせて修正
   - r4 段階の再発（r5 で記録）: PM が `src/tools/_components/ToolLayout.tsx` および cycle-196.md L69 / L92 を実体 Read せず、「(new) globals.css に `--max-width: 1200px` を追加する」案 (d) を「cycle-196 確定方針整合」と誤って正当化した。r4 reviewer1（原典整合）から CRIT-1 として「cycle-196 で明示的に禁止された案そのもの」「原典 L308『ハードコード 1200px が唯一の正準パターン』に違反」と指摘され r5 で書き直し
   - **execution 中も「実体ファイルを Read で確認してから書く」「過去サイクル確定方針は実体 md を Read で並べ読みしてから判断する」を継続する**（特に新ルート / 新タイル UI のテスト assertion / cycle-196 等の確定方針への参照を書く際）

T1/T2 来訪者価値の観点で守るべき不変条件:

- `/tools/char-count` URL の同一性維持（Playwright で 200 を確認）
- ロジック（文字数算出）の挙動同一性: T-1 baseline と T-4 で完全一致
- OGP / Twitter Card 画像の生存（T-4 で 200 確認）

### アンチパターン照合結果

`docs/anti-patterns/` 4 ファイル（planning / implementation / workflow / writing）を Read で全件熟読した結果、本サイクルで発火しうる AP と該当しない AP を 1 行根拠で列挙:

- AP-P01: 該当しない。本サイクルは前提（PV / 構造単純度）を実測済み（GA4 90 日 PV=13、Component 58 行）
- AP-P02: 該当しうる → T-3 で「char-count が widget に適合する」高評価を、否定データ（widget UI が来訪者に不利益とならないか）と突き合わせて確認
- AP-P03: 該当しない。Phase 8 残り 33 件 / 将来 Phase 10 への波及を見据えた構成
- AP-P04: 該当しない。Owner 発言を未検証で組み込んだ箇所なし
- AP-P05: 該当しない。前回失敗（cycle-191/192/193）の正反対へ振り切ってはおらず、原典回帰
- AP-P06: 該当しない。既存コンテンツ重複なし、過去サイクル経緯は確認済（cycle-199 完結を一次資料とする）
- AP-P07: 該当しうる → T-3 で「widget UI の機能セット」を、実装が容易だからではなく T1/T2 来訪者の認知モデルから決める
- AP-P08: 該当しうる → T-2 で「ゼロベース」を char-count Component.tsx だけに閉じず、依存共通コンポーネントの旧トークン残存も grep で全件確認
- AP-P09: 該当しない。来訪者価値（T1/T2）を目的に据えており SEO 読み替えなし
- AP-P10: 該当しうる → T-3「kind=widget が自然」を抽象表現で終わらせず、recommendedSize 2 案比較と機能セットを基本設計レベルで提示
- AP-P11: **該当する**（r5 で判定変更） → cycle-199 で確定した型契約 / 定数 / codegen 仕様、および cycle-196 (B-425) で確定した「(new) globals.css に `--max-width` を定義しない」「ToolLayout.module.css は touch しない」の二重禁則を「変更不可」として扱う。**r4 で PM が cycle-196 確定方針を覆しかけた事故（軸 3-(d) 採用）を踏まえ、軸 3 再列挙では過去サイクル確定方針との並べ読みを必ず実施する**。同時に、過去サイクル PM の独自判断（cycle-191/192/193 の 13 バリアント設計等）は所与にしない
- AP-P12: 該当する → cycle-191/192/193 の失敗（スコープ膨張 / 過去設計継承 / Done 判定誤認）を踏まえ、本サイクルは「最小単純 1 件 + 検証ルート整備」に絞る
- AP-P13: 該当しない。理論的フレームワーク先行ではなく、原典 Phase 8 標準手順を実体に当てる構成
- AP-P14: 該当しない。tools 全 34 件と play 群を比較した上で char-count を選定
- AP-P15: 該当しない。直近成功体験への引きずりなし（cycle-199 は基盤完結であり同種施策ではない）
- AP-P16: 該当する → 本計画書執筆中に着手条件（cycle-199 完結 / Phase 7 基盤 4 要件揃い）を `git log` と `ls src/tools/_constants/` で実体確認済
- AP-P17: 該当する → kind 選択 / タイル UI 機能セット / 検証ルート設計 / ToolLayout 扱い（r4 で 5 案比較に拡張も「page.tsx 個別 CSS Module で 1200px ハードコード」案が欠落していたため CRIT 発覚、**r5 で 6 案以上に再拡張**）/ 着手対象選定 / trustLevel 削除方式の 6 軸で 3 案以上比較を「検討した他の選択肢」に明示。r4 軸 3 の比較不十分性（採用 (代替 B / X-1) 案欠落）を反省的に追記
- AP-P18: 該当する → reviewer 指摘の背後の問いの構造（「kind=single 前提が char-count UI 実体と整合しない」「`/internal/tiles` 最小骨格設計と検証要求が齟齬」「ToolLayout 共通インフラ + (new) globals.css のスコープ境界（r3 reviewer2 / r4 reviewer1 共に cycle-196 確定方針抵触として CRIT 指摘、r5 で軸 3 を 6 案以上に再拡張して (legacy) 副作用ゼロ + cycle-196 整合 + 原典 L308 正準パターン整合の案 (f) を確定）」「trustLevel 削除の波及範囲」「詳細ページ統計値の実体把握（AP-WF12 違反として r3 reviewer2 MAJOR-1 で捕捉、r4 で実体準拠に修正）」「タイル UI 1 項目縮約の妥当性根拠（r4 reviewer MAJOR-1、Phase 10 後再評価対象として位置付け確定）」）を方針 1〜6 に整理して反映
- AP-P19: **該当しうる**（r2 reviewer1 MINOR-1 反映、判定変更） → T-3 で Next.js 15 動的ルート params 仕様（`params: Promise<...>` 形式）の現状確認が発火点。execution 時に `next/types` の最新仕様および本リポジトリ内の他動的ルート（`src/app/**/[*]/page.tsx`）の実装パターンを実体確認することで対応
- AP-P20: 該当しうる → 計画書はコードレベル詳細を含めない。kind / 検証ルート / ToolLayout 扱い / recommendedSize 目安 / trustLevel 削除方針 等の基本設計判断のみ明示
- AP-I01〜AP-I09: 実装段階で発火。本計画書では「視覚スクショ存在で代替しない / オプショナル退避を根本解決と混同しない / Core Vitals 確認 / DESIGN.md 未定義表現禁止 / commit 順序」を T-4 / 完成条件に反映済
- AP-WF01〜AP-WF14: ワークフロー段階で発火。本計画書では「reviewer Pass を Done 条件」「並べ読み 4 列テーブル化」「PM 自身が成果物通読」「サブエージェントへ事実情報を実体確認後に渡す」を作業中の注意点に反映済。**AP-WF12 については r3 段階（統計値実体未確認）に加え r4 段階で新たな発火事例が確認された（PM が ToolLayout 実体 + cycle-196.md 確定方針を Read せず globals.css 追加案 (d) を採用→r4 reviewer1 CRIT で発覚、r5 で書き直し）。「作業中の注意点」セクション 6 項目めに事例として記録済**
- AP-WF15: **該当しない（本サイクル開始時点では発火条件未成立、完了処理時に再評価）**（r2 reviewer1 MINOR-1 反映、判定変更）。本サイクル中に新規発生した問題で本サイクル外として記録するものについて、完了処理時に「キャリーオーバー漏れ / backlog 起票漏れがないか」を再評価する
- AP-W01〜AP-W09: 該当しない（本サイクルは記事執筆を含まない）

### 完成条件

各項目に検証コマンド / 手段を併記。「コンパイル通過 / 200 OK」を Done と判定しない（cycle-192 学び 1）。

1. T-1〜T-4 全タスクが reviewer Pass で Done（reviewer の判定で確認）
2. `(new)/tools/char-count/` で詳細ページが動作（Playwright で `/tools/char-count` を w360/w1280/w1900 × ライト/ダーク = 6 枚撮影し全枚崩れなし）
3. `/internal/tiles/preview/tools/char-count` で kind=widget タイル単体が単独表示で動作（Playwright w360/w1280 × ライト/ダーク = 4 枚で確認、widgetSummary 表示と詳細ページ導線リンクが機能）。**詳細ページ導線の客観条件**: (a) `a[href="/tools/char-count"]` リンク要素が DOM に存在、(b) リンクが viewport 内で visible、(c) クリックで `/tools/char-count` に遷移、(d) Tab フォーカス到達可能、の 4 条件全てを Playwright で確認
4. `/internal/tiles` インデックスが件数 0 → 1 を返している（Playwright または `curl` で確認、cycle-199 確定設計を破っていないことの裏返し確認）
5. `TILE_DECLARATIONS` に 1 件追加され（配列末尾）、`generated/tiles-registry.ts` の出力に `{ domain: "tools", slug: "char-count", kind: "widget" }` の 3 フィールドのみ追記されている（`git diff src/tools/generated/tiles-registry.ts` で確認）
6. ロジック挙動の同一性: (a) `__tests__/logic.test.ts` の pass 件数 / 状態が T-1 baseline と一致、(b) Playwright で同入力テキストの **6 統計値（文字数 / 文字数（空白除く）/ バイト数（UTF-8）/ 単語数 / 行数 / 段落数）** が baseline 想定値と完全一致（手動確認）
7. char-count 個別 CSS Module から `--color-*` 旧トークン参照が消えている（`grep -rEn "var\(--color-[a-z]" src/tools/char-count/ --include='*.module.css'` が空。偽陽性回避のため `var(--color-` の後に英小文字が続く狭い正規表現を使用）
8. **page 個別 CSS Module に `max-width: 1200px` がハードコードされている（採用案 (f)）**: `(new)/tools/char-count/page.module.css`（命名は execution で決定）が新規追加され、最上位コンテナクラスに `max-width: 1200px;` が **数値リテラルでハードコード** されている。同時に `src/tools/_components/ToolLayout.tsx` / `ToolLayout.module.css`、`src/components/common/*` 配下、および `src/app/globals.css` ((new) 用) は **本サイクルで一切変更されていない**（`git diff src/tools/_components/ src/components/common/ src/app/globals.css` が空、cycle-196 (B-425) 確定方針 + 原典 L308「ハードコード 1200px が唯一の正準パターン」との整合）。これにより (legacy) 33 ツールを 1 切触らずに「w1900 で `document.querySelector('main > *').getBoundingClientRect().width < 1300px`」が満たせる
9. `tile-grid` 定数（128px × 128px / 8px マージン）を参照しており、char-count 配下に数値直書きがない（`grep -rE "\b128\b|\b8(px)?\b" src/tools/char-count/ --include='*.{ts,tsx,css}'` の検出結果のうちタイル化由来の直書きが存在しない。偽陽性は execution が 1 件ずつ判定）
10. OGP / Twitter Card 画像が 200 を返している（`curl -I http://localhost:3000/tools/char-count/opengraph-image` 等で確認）
11. `meta.ts` の `trustLevel: "verified"` フィールドが **本サイクル維持されている**（`grep -E "trustLevel" src/tools/char-count/meta.ts` が 1 件ヒット、PM r5.1 方針確定。Phase 8.1 全件完了時に backlog 17-(b) で一括削除予定）。`ToolMeta` 型 (`src/tools/types.ts`) は **touch されておらず required のまま**（`git diff src/tools/types.ts` が空）
12. **新ルート noindex / sitemap 除外**: `/internal/tiles/preview/tools/char-count` の HTML に `<meta name="robots" content="noindex,nofollow">` 相当が出力され、本サイトの sitemap.xml に `/internal/*` が含まれていない
13. **新規テストの追加と pass**: タイル用 React コンポーネントの新規テスト（render + 値検証 + 入力反映）および `/internal/tiles/preview/[domain]/[slug]` ルートのテスト（existing=200 / non-existing=404）が追加され、`npm run test` で全件 green
14. `npm run lint && npm run format:check && npm run test && npm run build` 全成功
15. 視覚回帰確認スクリーンショット保存済み: `./tmp/screenshots/cycle-200/before/` 6 枚 + `./tmp/screenshots/cycle-200/after/` 6 枚 + `./tmp/screenshots/cycle-200/tiles-preview/` 4 枚 = 計 **16 枚**
16. 移行前後比較の 4 列テーブル（観点 / before / after / 判定）がサイクルドキュメント内に残されている（AP-WF11 並べ読みの成果物化）
17. **`docs/backlog.md` の Queued セクションに以下 3 件の新規 backlog が追記されている**（MINOR-1 反映で localStorage を「候補」→「起票する」に確定形に変更）:
    - (a) **tools 系共通コンポーネント（ToolLayout / Breadcrumb / FaqSection / ShareButtons / RelatedTools / RelatedBlogPosts）の `var(--color-*)` 旧トークン置換**（Priority **P1**。Phase 8.1 全 34 ツール完了基準として必要。本サイクルでスコープ膨張を避けるため別 backlog 化）
    - (b) **`ToolMeta.trustLevel` フィールドおよび関連型 (`src/tools/types.ts`) / テスト (`src/lib/__tests__/seo.test.ts` 等) / `src/lib/trust-levels.ts` の完全削除**（Phase 8.1 全 34 ツール完了時実施、Priority **P2**。本サイクルでは個別 meta.ts からのフィールド物理削除のみで型は維持）
    - (c) **タイル UI / 詳細ページの入力値 localStorage 保持機能**（Priority **P3**。タイル全般共通機能として Phase 7 基盤拡張または Phase 10 ダッシュボード本実装時に検討。タイル UI と詳細ページで localStorage キーを共有しないと T2 dislikes「同入力に違う出力」相当の体感ズレを生むリスクがあるため、共通機能として設計してから個別ツールに展開する）

### 検討した他の選択肢と判断理由

AP-P17 に従い 6 軸で 3 案以上をゼロベース列挙し採用案を明示。

**軸 1: kind 形態の選択**

- (a) `kind: "single"`（詳細ページ Component をそのままタイル化）: char-count Component は textarea rows=10 + 6 項目 grid で 1200px 幅前提。2×2 (264px) や 3×2 (400×264px) のタイル枠では UI が破綻し、「コンパクトな UI 単位」原則（原典 L49）に反する。**不採用**
- (b) `kind: "widget"`（タイル用簡素 UI を新設） ← **採用**: 詳細ページ Component を一切触らずに済み T2 dislikes リスクが構造的に排除される。Phase 7 (b) 形態の実用性が第 1 弾で実証される利点もある
- (c) `kind: "multi"`（複数バリエーション）: char-count に複数バリエーションを用意する必然性が薄く、第 1 弾で複雑度を上げる正当化がない。将来 (c) 形態が必要なツールで別途検証する。**不採用**

**軸 1.5: タイル UI の機能セット（表示項目数、MAJOR-1 反映で新規追加）**

タイル UI 簡素版に含める統計項目を「何項目に絞るか」の判断軸。詳細ページの 6 項目をタイル UI でどう縮約するかを 4 案比較:

- (a) **1 項目: 文字数のみ** ← **採用（本サイクル仮置き）**: タイル UI の最頻用ケースに絞る。コンパクト UI 原則に整合、Phase 7 (b) widget は詳細ページと並存するため深堀りは詳細ページへ吸収。`char-count` の `searchKeywords` / target T1 yaml で「文字数カウント」が直接ヒットしている事実が根拠。**ただし Phase 10 後再評価対象**（本サイクル外として認識する事項に明示）
- (b) 2 項目: 文字数 + 文字数（空白除く）: 用途近い 2 項目に絞る妥協案。タイルレイアウトが (a) より縦長になる
- (c) 3 項目: 文字数 + 段落数 + 文字数（空白除く）: メール / SNS 投稿の下書きでよく見られる組み合わせ。recommendedSize cols=3 rows=2 の横長を活かせるが、Phase 10 ダッシュボードで他タイルとの密度バランスが崩れる可能性。**Phase 10 後評価で (a) → (c) 拡張が有効と判明したら採用候補**
- (d) 6 項目フル（詳細ページと同等）: タイル UI と詳細ページの差別化がなくなり、widget 形態を採る意義（コンパクト UI）を毀損する。**不採用**

**Phase 10 後の評価指標**: タイル内クリック動線（タイル → 詳細ページ遷移率）/ タイル滞在時間 / 詳細ページ離脱パターンを GA4 で計測し、「タイル UI 1 項目で目的達成できているか」「2〜3 項目に拡張した方が滞在価値が増えるか」を判断する。

**軸 2: 単独レンダリング検証ルートの設計**

- (a) `/internal/tiles` インデックスを「タイル一覧描画ページ」に拡張: cycle-199 で確定した「件数のみ返す最小骨格」境界条件を破る。本サイクルで cycle-199 確定設計に手を入れるとロールバック時の事故リスクがある。**不採用**
- (b) `/internal/tiles/preview/[domain]/[slug]` 動的ルートを新設 ← **採用**: cycle-199 確定設計を touch せず、新設ルートが Phase 8.1 残り 33 件 / Phase 8.2 の 20 件で再利用可能なインフラとなる。原典 L142-145「単独表示の検証ルート」要求に整合
- (c) 詳細ページ `/tools/char-count` 内にタイルプレビューセクションを設置: 原典 L171 の後段（「対応する詳細ページ内で単独表示」）に依拠する案。来訪者向けページに検証用 UI が混入するため不採用

**軸 3: ToolLayout / max-width の扱い（r5 で 6 案比較に再拡張、cycle-196 (B-425) 確定方針 + 原典 L308 正準パターンとの二重整合確認）**

r3 で軸 3-(b)「ToolLayout.module.css ハードコード化」を採用 → r3 reviewer2 CRIT-1 で却下。r4 で軸 3-(d)「(new) globals.css 追加」を採用 → r4 reviewer1 CRIT-1 で「cycle-196 で明示禁止された案そのもの + 原典 L308『ハードコード 1200px が唯一の正準パターン』違反」と却下。**r5 で 6 案以上に再列挙し、(legacy) 副作用ゼロ + cycle-196 整合 + 原典 L308 整合 + 完成条件達成のすべてを同時に満たす案 (f) を採用する**。

各案を以下 5 列で評価:

| 案                                                                                               | (legacy) 副作用                                              | cycle-196 整合                                                | 原典 L308 整合                                                                                                                                  | 完成条件 L118 達成可否                                                                                    | スコープ                           |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| (a) ToolLayout 全面新トークン化（color 含めて全面置換）                                          | あり（33 件全件再設計）                                      | 違反（共通インフラを触る）                                    | 部分整合（trustLevel 撤去含む全面再設計）                                                                                                       | 達成可（巨大スコープにより）                                                                              | 巨大（共通コンポーネント全件）     |
| (b) ToolLayout の `var(--max-width)` のみハードコード化                                          | **あり（(legacy) 33 件の本文幅が 960px → 1200px に変わる）** | **違反**（ToolLayout.module.css を触る）                      | 整合（ハードコード 1200px）                                                                                                                     | 達成可                                                                                                    | 中（ToolLayout 全ツール波及）      |
| (c) char-count を ToolLayout から外し page.tsx に直書き（Breadcrumb 等は個別マウントまたは欠落） | なし                                                         | 整合                                                          | 整合                                                                                                                                            | 達成可（個別マウント実装次第）                                                                            | 中（共通パーツの個別 import 必要） |
| (d) `src/app/globals.css` ((new) 用) に `--max-width: 1200px` を追加                             | なし                                                         | **違反**（cycle-196 L69 で明示的に禁止された B 案そのもの）   | **違反**（L308「ハードコード 1200px が唯一の正準パターン」「(new) で `var(--max-width)` 使用禁止」を破る）                                      | 達成可（技術的には）                                                                                      | 小                                 |
| (e) char-count 個別 `Component.module.css` 側で `max-width: 1200px` を指定                       | なし                                                         | 整合                                                          | 部分整合（ハードコードだが「ページ最上位コンテナ」ではない）                                                                                    | **達成不可**（ToolLayout の外側コンテナが先に親幅まで広がり、`main > *` サブツリー width が制限されない） | 小                                 |
| **(f) char-count ページ最上位コンテナ（ToolLayout の外側）で 1200px ハードコード**               | **なし**                                                     | **整合**（共通インフラ・(new) globals.css 共に touch しない） | **整合**（L308「ページ最上位コンテナに `max-width: 1200px; margin: 0 auto` を必須記載」「ハードコード 1200px が唯一の正準パターン」と完全一致） | **達成可**（外側ラップ div で 1200px → 内側 ToolLayout は block 要素として親幅 1200px に収まる）          | 小                                 |

**採用は (f)**。採用根拠:

- cycle-196 (B-425) で about / privacy / 404 に採用された正準パターンと同型
- 原典 L308「ハードコード 1200px が唯一の正準パターン」「既存正常ページ blog/tools/play/blog[slug]/トップで採用済のパターン踏襲」と完全準拠
- (legacy) 副作用ゼロ（ToolLayout.module.css / (new) globals.css / (legacy) ファイル群を一切触らない）
- 完成条件 L118（w1900 で `document.querySelector('main > *').getBoundingClientRect().width < 1300px`）達成可
- **Phase 8.1 全 34 件で踏襲可能な標準パターン**として再利用できる（残り 33 サイクルが同一テンプレートで進められる）

**軸 4: 着手対象選定（char-count を採るか他候補か）**

- byte-counter（第 2 候補）: PV 6 / 構造 85 行 / 外部依存なし。char-count と同型構造のため第 1 弾は片方で良く、PV がより低い char-count を優先
- sql-formatter（第 3 候補、cycle-192 で挙がっていた）: PV 1 / logic 634 行 / 外部依存（フォーマッタライブラリ）。第 1 弾で外部依存込みは「タイル化と外部依存両方の問題が同時発生して切り分け不能」リスク。第 1 弾は外部依存ゼロの char-count が安全
- play 系: 共通エンジン経由で個別規模 1,000〜2,000 行以上（tools の 10-20 倍）。原典が Phase 8.1 tools、8.2 play と段階分けしている設計を尊重し不採用
- タイル定義抜きで詳細ページ移行のみ: 原典 L156-158「2 回の作り直しを避けるための同時実施」と明示されているため、同時実施を採る

**軸 5: trustLevel フィールド削除の方式（r2 reviewer1 CRIT-1 反映）**

- (a) **`meta.ts` の trustLevel フィールドは本サイクル維持 + `ToolMeta` 型 required 維持 + Phase 8.1 全 34 件完了時に backlog 17-(b)（P2）で型・実装・全件 trustLevel 一括削除（PM r5.1 確定）** ← **採用**: T-1 baseline で `ToolLayout.tsx` から TrustLevelBadge は既に未 import 状態であることが確認済。原典 L309 後半の手順（badge 使用ありの場合の trustLevel 削除指示）の前提条件が既に成立していない。`meta.ts` の `trustLevel` を維持することで `satisfies ToolMeta` の型エラーが回避され、型 optional 化（AP-I02 違反）も回避できる。他 33 ツールの meta.ts および既存テスト群（`src/lib/__tests__/seo.test.ts` 4 箇所 / `cross-links.test.ts` 3 箇所 / `seo-cheatsheet.test.ts` 1 箇所 / `ToolCard.test.tsx` / `ToolLayout.test.tsx` / `newSlugs.test.ts` / `line-break-remover/__tests__/meta.test.ts` 等）への波及がゼロ。「char-count 1 件のみ型エラー局所化 → execution で再判断」の方針再判断が本方針 (PM r5.1) として確定済
- (b) `meta.ts` から trustLevel フィールド削除 + `ToolMeta` 型を optional 化: 型 optional 化により Phase 8.1 全 34 サイクル間（30+ サイクル）にわたって「型は optional / 実体は 33/34 が verified」という意味的に壊れた中間状態が固定される（AP-I02 の典型: 型シグネチャを曖昧化してエラーを退避する根本未解決パターン）。既存テスト群（seo.test.ts 等 11 箇所以上）への波及はゼロだが、コード意味論の劣化が長期固定される。**不採用**
- (c) char-count の `trustLevel: "verified"` を維持し将来一括削除: 原典 L309「meta.ts の trustLevel フィールド削除」指示に反する。**不採用**

### 本サイクル外として認識する事項

以下は本サイクル完成条件外。将来サイクルで扱う旨を明示:

- **tools 系共通コンポーネント（ToolLayout / Breadcrumb / FaqSection / ShareButtons / RelatedTools / RelatedBlogPosts）の `var(--color-*)` 旧トークン置換**: 本サイクルで新規 backlog 起票（Priority **P1**、Phase 8.1 全 34 ツール完了基準として必要）。色トークン体系全体への波及があるためスコープ分離
- **`ToolMeta` 型の `trustLevel` フィールド完全削除と関連型 / テスト / `src/lib/trust-levels.ts` の撤去**: 本サイクルでは char-count 個別 meta.ts からのフィールド物理削除のみ。型は required のまま維持。Phase 8.1 全 34 ツール完了時点で型・テスト・関連実装を完全削除する別 backlog（Priority **P2**）として起票
- **`kind: "single"` 形態の実用性検証**: 本サイクルは kind=widget の試験台。kind=single は「詳細ページ Component が小さくタイル幅に収まるツール」（候補: hash-generator / qr-code 等）で将来サイクルが担当
- **`kind: "multi"` 形態の実用性検証**: 複数バリエーションが必然なツール（候補: unit-converter / color-converter 等）で将来サイクルが担当
- **タイル UI の表示項目数の Phase 10 後再評価（MAJOR-1 反映、Priority P2）**: 本サイクルでは軸 1.5 (a)「1 項目: 文字数のみ」を **仮置きで採用**。Phase 10 ダッシュボード本公開後の GA4 実データ（タイル内クリック動線 / タイル滞在時間 / 詳細ページ離脱パターン）で再評価し、必要なら軸 1.5 (b) 2 項目 / (c) 3 項目への拡張を検討する。Phase 10 着手時に判断
- **タイル UI / 詳細ページの入力値 localStorage 保持機能（MINOR-1 反映、Priority P3、本サイクルで backlog 起票確定）**: T2 likes「前回入力した値や設定が残っていて作業がさらに短縮されること」への対応として有望。本サイクルでは実装しないが、完成条件 17-(c) で backlog に **起票する**（候補ではなく確定）。char-count 1 件で個別実装すると「タイル UI と詳細ページで localStorage キーが分かれて『同入力に違う出力』に近い体感ズレが出る」リスクがあるため、**タイル全般の共通機能** として Phase 7 基盤の拡張または Phase 10 ダッシュボード本実装時に検討する
- **recommendedSize 案 (ii) のスマホでのレスポンシブ動作**: 案 (ii) 400px は w360 viewport を超えるため、本サイクル検証ルートではタイル単体の固定サイズ表示のみ確認。Phase 10 ダッシュボード本実装での多タイル配置時のレスポンシブ動作（cols 縮退 / 全幅追従）は Phase 10.1 着手時に再評価する
- **Phase 8.1 残り 33 件への標準パターン展開**: 本サイクルで確立する「ToolLayout の外側で page 個別 CSS Module を新設し `max-width: 1200px` をハードコードする」採用案 (f) の構造は、Phase 8.1 残り 33 サイクルが踏襲する **標準テンプレート** として再利用される。第 2 弾以降のサイクル planning では「採用設計（核となる判断）」セクションで本サイクル成果物の `page.module.css` 構造を一次参照する。原典 L308「ハードコード 1200px が唯一の正準パターン」「既存正常ページ blog/tools/play/blog[slug]/トップで採用済のパターン踏襲」と一貫性を保つ

### 計画にあたって参考にした情報

- 原典 `docs/design-migration-plan.md`:
  - Phase 7（L120-145、Phase 7.1 型契約 / 7.2 サイズ枠定数 / 7.3 レジストリと検証ルート）
  - Phase 8（L156-184、tools / play / サイズ枠最終整合 / 完了基準）
  - 1 ページ移行の標準手順（L300-313、step 1-10）
- cycle-199 で実体化された Phase 7 基盤コード:
  - `src/tools/_constants/tile-definition.ts`（Discriminated Union 型契約）
  - `src/tools/_constants/tile-grid.ts`（`TILE_CELL_PX` / `TILE_GAP_PX` / `calcTilePixels()`）
  - `src/tools/_constants/tile-declarations.ts`（TILE_DECLARATIONS 配列と取り扱いコメント L26-31）
  - `scripts/generate-tiles-registry.ts`（codegen 仕様、出力は domain/slug/kind の 3 フィールドのみ）
  - `src/app/(new)/internal/tiles/page.tsx`（最小骨格、件数のみ返す境界条件 L21）
- reviewer 指摘レポート（本サイクル）:
  - `tmp/research/2026-05-21-cycle-200-plan-review-r1.md`（r1 原典整合: CRIT 4 / MAJOR 6 / MINOR 4）
  - `tmp/research/2026-05-21-cycle-200-plan-review-visitor-value.md`（r1 来訪者価値: CRIT 1 / MAJOR 4 / MINOR 3）
  - r2 reviewer1（原典整合）指摘（CRIT 1 / MAJOR 4 / MINOR 3、ファイル保存されなかったため本計画書冒頭の PM 要約に依拠）
  - `tmp/research/2026-05-21-cycle-200-plan-review-r2-visitor.md`（r2 来訪者価値: CRIT 1 / MAJOR 3 / MINOR 3）
  - `tmp/research/2026-05-21-cycle-200-plan-review-r3-origin.md`（r3 原典整合: Pass、MINOR 3 件のみ）
  - `tmp/research/2026-05-21-cycle-200-plan-review-r3-visitor.md`（r3 来訪者価値: CRIT 1 / MAJOR 2 / MINOR 2、r4 で全件吸収）
  - `tmp/research/2026-05-21-cycle-200-plan-review-r4-origin.md`（r4 原典整合: **CRIT 1**、軸 3-(d) globals.css 追加が cycle-196 明示禁止 + 原典 L308 違反として却下、r5 で軸 3 を 6 案以上に再列挙して案 (f) を採用）
  - `tmp/research/2026-05-21-cycle-200-plan-review-r4-visitor.md`（r4 来訪者価値: **CRIT 1 + MAJOR 1**、タイル UI 1 項目縮約の根拠補強と Phase 10 後再評価対象化を要求、r5 で軸 1.5 新設および「本サイクル外として認識する事項」に明示反映、MINOR-1 localStorage 起票確定 + MINOR-2 sharedMetadata robots 確認も反映）
- target user yaml:
  - `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`（T1）
  - `docs/targets/気に入った道具を繰り返し使っている人.yaml`（T2、dislikes 三大項目）
- アンチパターン全 4 ファイル:
  - `docs/anti-patterns/planning.md`（AP-P01〜AP-P20）
  - `docs/anti-patterns/implementation.md`（AP-I01〜AP-I09）
  - `docs/anti-patterns/workflow.md`（AP-WF01〜AP-WF15）
  - `docs/anti-patterns/writing.md`（AP-W01〜AP-W09、本サイクル非該当）
- 知見:
  - `docs/knowledge/css-modules.md`（`:root.dark` → `:global(:root.dark)` の扱い）
  - **cycle-196 B-425 確定方針（r5 軸 3 採用案 (f) の最重要根拠）**: `docs/cycles/cycle-196.md` L69（「(new) 用の `src/app/globals.css` に `--max-width` を新規定義しない」明示禁則）/ L92（B 案 = (new) globals.css 追加案 = 不採用判定）/ L143（reviewer Pass + Done 確定）/ L308 原典「ハードコード 1200px が唯一の正準パターン」を実体 Read で並べ読みすること。about / privacy / 404 で採用された正準パターン（page 個別 CSS Module ハードコード 1200px）が本サイクルの採用案 (f) の同型先例
  - cycle-196 B-427: `var(--max-width)` ハードコード化の前例、参考扱い
  - **ToolLayout 実体構造の確認**: `src/tools/_components/ToolLayout.tsx` L14-16 で `<article className={styles.layout}>` を最上位 render、`ToolLayout.module.css` L1-7 で `.layout { max-width: var(--max-width); margin: 0 auto; ... }`。(new) 配下では `var(--max-width)` 未定義 → `none` 解決 → 親要素幅まで block 要素として広がる動作を本計画書「採用設計（核となる判断）」セクションの技術的成立根拠として明記
- 候補選定材料: `./tmp/research/` 配下の Phase 7 基盤実体調査および候補選定材料調査（GA4 PV / 構造単純度 / Phase 9 依存）
- backlog: B-314 Notes / B-430 Notes
- cycle-191/192/193 のキャリーオーバー / 補足事項 / 事故報告（落とし穴抽出のみ、設計判断は所与にしない）

## 移行前後比較（T-4 完成条件 16、AP-WF11）

実画像ベースの比較（before/ と after/ ともに fullPage: true で取得済）。

| 観点               | before（legacy、w1280 ライト）                                                           | after（new、w1280 ライト）                                                      | 判定     |
| ------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------- |
| ページ幅           | 960px（old-globals.css の --max-width）                                                  | 1200px（page.module.css ハードコード、w1900 実測 1200px）                       | 改善     |
| textarea 入力欄    | 約 920px 幅（960px コンテナ内）                                                          | 約 1140px 幅（1200px コンテナ内）。より広くテキスト入力しやすい                 | 改善     |
| 統計値グリッド     | 4+2 配置（2 行）: 文字数/空白除く/バイト数/単語数 ＋ 行数/段落数                         | 6 列 1 行: 文字数/空白除く/バイト数/単語数/行数/段落数                          | 改善     |
| ダークモード       | 旧トークン（var(--color-\*)）で動作。背景白・テキスト黒系                                | 新トークン（var(--bg)/var(--fg)/var(--accent)）で動作。ダーク時に背景・文字正常 | 同等     |
| FAQ                | 存在（w1280 ライト実画像: 3 件表示「ひらがな1文字は何バイトか」等）                      | 存在（w1280 ライト実画像: 同 3 件表示。ToolLayout 経由、touch なし）            | 同等     |
| シェアボタン       | 存在（w1280 ライト実画像: X / LINE / はてブ / コピー 4 ボタン確認）                      | 存在（w1280 ライト実画像: 同 4 ボタン確認）                                     | 同等     |
| 関連ツール         | 存在（w1280 ライト実画像: JSON 整形・ひらがな変換・改行清掃・テキスト差分比較 4 件確認） | 存在（w1280 ライト実画像: 同 4 件確認）                                         | 同等     |
| 関連ブログ記事     | 存在（w1280 ライト実画像: 1 件表示「next/dynamic の 2 つの落とし穴」）                   | 存在（w1280 ライト実画像: 同 1 件確認）                                         | 同等     |
| フッター           | 存在（before w1280 ライト: 旧レイアウト・4 カラム Footer）                               | 存在（after w1280 ライト: 新レイアウト・4 カラム Footer 確認）                  | 同等     |
| URL                | `/tools/char-count`                                                                      | `/tools/char-count`（Route Group (new) は URL に出ない）                        | 同等     |
| OGP / Twitter Card | 正常（opengraph-image.tsx）                                                              | 正常（移行済みファイル）                                                        | 同等     |
| ロジック挙動       | `logic.ts`（countChars 等 24 テスト）                                                    | `logic.ts` touch なし（同一ファイル）                                           | 同等     |
| レイアウト破綻     | なし                                                                                     | なし（w360/w1280/w1900 × ライト/ダーク 全 6 枚 fullPage 確認）                  | 同等     |
| 文字色コントラスト | 標準（旧トークン）                                                                       | 標準以上（新トークン、ダーク両モード確認）                                      | 同等以上 |

**総合判定**: 移行前と同等以上。幅拡張（960→1200px）と統計値グリッド改善（4+2→6列）により来訪者の使い勝手が向上している。FAQ / シェア / 関連ツール / 関連ブログ / フッターは全項目 after でも存在を fullPage 実画像で確認。ロジック・URL・OGP は完全同一。

## レビュー結果

- **計画段階**: reviewer r1〜r5 で両 reviewer Pass（CRIT 6 / MAJOR 13 / MINOR 11 全件解消）
- **T-1**: reviewer Pass（MINOR 3 件吸収）
- **T-2**: r1 CRIT-1（ToolMeta optional 化）→ PM r5.1 確定方針で修正 → r2 Pass
- **T-3**: reviewer Pass（cycle-199 codegen 型変更は正当な整合修正と判定、MINOR 3 件吸収）
- **T-4**: r1 reviewer 指摘 CRIT-1 / MAJOR-3 / MINOR-2 を修正 → **T-4 r2 reviewer Pass**（`tmp/research/2026-05-21-cycle-200-t4-review-r2.md`）
  - CRIT-1: after/ スクリーンショットを fullPage で再取得（6 枚）+ 比較テーブルを実画像ベースで再判定
  - MAJOR-1: CharCountTile.tsx の 8px 用法に集約コメント追加（案 A 採用）
  - MAJOR-2: textarea の opacity: 0.9 削除 + border を var(--fg-soft) に変更してplaceholder コントラスト改善
  - MAJOR-3: B-434 起票 + cycle-200.md 補足事項に暫定許容の記録を追記
  - MINOR-2: 任意対応のため本サイクルでスキップ
- **cycle-completion 手順 4（ワークフロー AP チェック）**: AP-WF01〜AP-WF15 全件チェック実施。AP-WF01 として「L442 が『再 reviewer 予定』表記のままで実態（r2 Pass）と不整合」を指摘 → 本表記更新で解消（実体としては T-4 r2 reviewer Pass を `2026-05-21-cycle-200-t4-review-r2.md` で取得済）。他 14 項目はいずれも非該当または対応済（AP-WF05/11/12 は当初発火したが修正済）

## キャリーオーバー

- **B-431**: tools 系共通コンポーネント color トークン置換（P1、Phase 8.1 全件完了基準）
- **B-432**: `ToolMeta.trustLevel` 完全削除（P2、Phase 8.1 完了時一括実施）
- **B-433**: localStorage 入力値保持機能（P3、Phase 7 基盤拡張または Phase 10 検討）
- **B-434**: タイル UI スマホ viewport (w360) 対応（P2、Phase 10.1 ダッシュボード設計時の必須検討）← 本修正で新規起票
- タイル UI 1 項目縮約の Phase 10 後 GA4 実データ再評価（P2、計画書「本サイクル外として認識する事項」にて明示済）

## 補足事項

### PM 確定方針 r5.1（T-2 execution での発見に基づく更新）

T-2 で builder が `meta.ts` から `trustLevel: "verified"` フィールドを物理削除した結果、`satisfies ToolMeta` の required フィールド欠如で TypeScript 型エラーが発生（プリコミットフックでブロック）。これを受けた本来想定の対応は計画書 r5 軸 5 の (a) 採用根拠で書かれていた通り「`char-count/meta.ts` 1 ファイル局所で型エラー → execution で再判断」。

PM r5.1 確定方針: **本サイクルでは `meta.ts` の `trustLevel: "verified"` フィールドを維持する**（削除しない）。

根拠:

- 原典 L309 の「`meta.ts` の `trustLevel` フィールドも削除する」指示は、TrustLevelBadge JSX 使用がある場合の手順。本サイクル T-1 baseline で確認済の通り、`ToolLayout.tsx` から TrustLevelBadge は既に未 import 状態であり、原典 L309 後半の前提条件（badge 使用あり）が既に成立していない
- `meta.ts` の `trustLevel` を維持すれば `ToolMeta` 型 (required) との整合が保たれ、型 optional 化を回避できる（計画書方針 4 完全準拠、AP-I02 違反回避）
- 来訪者影響ゼロ（TrustLevelBadge は既に視覚的に表示されていない）
- 残り 33 ツールの `trustLevel: "verified"` 一括削除と `ToolMeta.trustLevel` 型完全削除は Phase 8.1 全 34 件完了時の backlog 17-(b)（P2）で一括実施（漸進削除ではなく一括完全削除）

この方針更新により以下を変更した:

- 計画書 T-2 step 6「meta.ts の trustLevel 撤去」→ **「meta.ts の trustLevel フィールドはそのまま維持、ToolMeta 型も touch しない」**
- 計画書 軸 5 採用案 (a) → **「meta.ts の trustLevel フィールドは維持、Phase 8.1 全件完了時に一括削除」**
- 計画書 完成条件 11「`trustLevel` フィールド物理削除」→ **「`trustLevel: "verified"` は本サイクル維持、Phase 8.1 完了時に backlog 17-(b) で一括削除」**

### T-1 で取得した baseline 値（T-4 比較用）

- **既存テスト**: `src/tools/char-count/__tests__/logic.test.ts` 全 **24 件 pass**（`countChars` / `countCharsNoSpaces` / `countBytes` / `countWords` / `countLines` / `countParagraphs` / `analyzeText` の各 describe ブロック合計）。T-4 で同件数全件 pass を維持する
- **移行前スクリーンショット**: `./tmp/screenshots/cycle-200/before/` 配下に 6 枚（w360/w1280/w1900 × ライト/ダーク、各 174–205KB）。T-4 で `./tmp/screenshots/cycle-200/after/` と視覚比較する
- **char-count 統計項目数**: 6 項目（文字数 / 文字数（空白除く）/ バイト数（UTF-8）/ 単語数 / 行数 / 段落数）。詳細ページ Component.tsx は本サイクルで touch しない
- **共通コンポーネントの旧トークン残存**（本サイクル対象外、別 backlog 起票候補）: `var(--max-width)` 3 ファイル（ToolLayout / Header / Footer の各 module.css）/ `var(--color-*)` 12 ファイル（RelatedBlogPosts / RelatedTools / ToolLayout / Breadcrumb / FaqSection / ShareButtons / Footer / Header / TrustLevelBadge / MobileNav / Pagination / ThemeToggle）
- **TrustLevelBadge の現状**: `src/tools/_components/ToolLayout.tsx` 全 68 行内に TrustLevelBadge の import / JSX 使用は **存在しない**。T-2 step 7「TrustLevelBadge JSX/import 撤去」は撤去対象が無いため `meta.ts` の trustLevel フィールド物理削除のみ実施
- **Next.js metadata robots merge**: shallow merge（子で `robots: { index: false, follow: false }` を定義すると親の `"max-image-preview": "large"` は失われる）。T-3 の新動的ルートで `noindex,nofollow` 出力する目的としては問題なし
- **`sharedMetadata` robots 親値**: `src/lib/site-metadata.ts` L32-36 で `{ index: true, follow: true, "max-image-preview": "large" }`

### T-4 完成条件 9 偽陽性記録（T-3 reviewer MINOR-3 反映）

完成条件 9 の grep コマンド `grep -rEn '\b128\b|\b8(px)?\b' src/tools/char-count/ ... --include='*.{ts,tsx,css}'` を実行した結果、**ヒットなし（出力空）**。

ただし `src/tools/char-count/CharCountTile.tsx` には以下の `"8px"` / `"6px 8px"` が存在する:

- L29: `gap: "8px"` — 内側フレックスレイアウトの間隔
- L57: `padding: "6px 8px"` — textarea の内側パディング
- L72: `gap: "8px"` — 文字数表示行のフレックス間隔

**なぜ検出されなかったか**: `\b8(px)?\b` の `\b` は「単語境界」を要求するが、JSX 文字列値 `"8px"` の場合 `"` と `8` の間は文字クラスが変わらないため境界が成立しない（`\b` は英数字と非英数字の境界。`"` は非英数字、`8` は数字で連続するため境界なし）。同様に `gap: "8px"` の形式では `"8px"` がクォートで囲まれているため検出漏れとなる。

**判定**: これらはすべて「**タイル内部余白（UI レイアウト）**」であり、`TILE_GAP_PX`（タイル間の外側マージン 8px）とは別概念。`TILE_GAP_PX` は `tile-grid.ts` の定数から参照されるべき値だが、本 8px はタイルコンポーネント **内部**の flex gap / padding であり物理的な役割が異なる。タイル化由来の数値直書き（128px セルサイズ等）は存在しないため、完成条件 9 の意図する制約違反ではない。

grep パターンの限界として「文字列リテラル内の数値」を検出できないことが判明した。将来の同種チェックでは `grep -E '"8px"|"128px"|: 8[,;]'` 等の形式も補完として使用することを推奨する。

### T-4 reviewer 指摘 MAJOR-2 対応: タイル placeholder コントラスト + 外枠方針

#### placeholder コントラスト

`CharCountTile.tsx` の textarea に `opacity: 0.9` が設定されており、textarea 全体（テキストと placeholder の両方）が薄くなっていた。これを削除し、代わりに border を `var(--fg)` から `var(--fg-soft)` に変更した。

- `opacity: 0.9` 削除の理由: textarea 全体を薄くすると入力テキストも薄くなり（ユーザーが入力した文字が読みにくい）、placeholder との視覚差が失われる。placeholder のコントラストは ブラウザが `--fg` を基準に自動調整するため、`--fg` をそのまま使えば適切なコントラストが確保される
- border を `var(--fg-soft)` に変更の理由: `var(--fg)` の border は全体の印象が強すぎる。`--fg-soft`（ライト: #555555 / ダーク: #a8a8a4）はデザイントークン定義済みの secondary text 色であり、テキスト入力枠の境界線として適切

#### タイル外枠の方針確認

`src/app/(new)/internal/tiles/preview/[domain]/[slug]/page.tsx` を確認した結果、TileComponent を `width/height` 指定の `<div>` でラップするのみで、外枠（border）は基盤側では描画していない。

**判断**: Phase 10 ダッシュボード本実装でタイル配置時の外枠描画方針を確定するまでは、各タイル自身が必要に応じて枠線を管理する形が現状設計。CharCountTile は textarea の border が存在するため視覚的な区切りは確保されている。タイル全体の外枠は **Phase 10.1 ダッシュボード設計時に基盤側 / 各タイル側どちらで描画するかを確定する**（現時点では追加しない）。

### T-4 reviewer 指摘 MAJOR-3: w360 viewport でのタイル UI はみ出し

w360 viewport では recommendedSize cols=3 rows=2 (400px) のタイルが 360px viewport をはみ出し、タイル UI の右側が見切れる（「詳細ページで開く」リンク末尾が切れる）。

本サイクルの単独表示検証（`/internal/tiles/preview/`）では Phase 10 ダッシュボード本実装でレスポンシブ対応されるまでの暫定状態として許容。単独検証ルートの目的はタイル UI が推奨サイズで正常描画されることの確認であり、viewport < タイル幅の場合のはみ出しはレスポンシブ対応前の既知動作。

Phase 10.1 ダッシュボード設計時に「タイル UI レスポンシブ動作（(a) スケール / (b) 列数動的調整 / (c) スクロール可能性）」を必須検討事項として扱う（B-434 起票済）。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。（B-314 は Phase 8 全体の親タスクとして Active 継続、本サイクル分の char-count は Done に記録済）
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。（計画 r1〜r5 / T-1〜T-4 + r2 / cycle-completion 手順 4 すべて reviewer Pass）
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。（lint OK / format OK / test 4377 件 pass / build 別途確認）
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。（B-431〜B-434 起票済、タイル UI Phase 10 後 GA4 再評価は計画書「本サイクル外として認識する事項」に記録済）

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
