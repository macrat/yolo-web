---
id: 180
description: B-333（移行計画 Phase 3: 静的・リダイレクト先行の新デザイン移行）を実施する。/about、/privacy、/not-found、/feed、/feed/atom、/memos 系のうち UI 移行が必要なルートは `(new)/` 配下に移行し、リダイレクト系はディレクトリのみ移動する。Phase 2（B-309）完了を受けて Phase 3 へ進み、Phase 4 以降の動線検証の足場を作る。
started_at: "2026-05-05T14:50:34+0900"
completed_at: null
---

# サイクル-180

このサイクルでは、デザイン移行計画 Phase 3 を実施する。 `/about` 、 `/privacy` 、 `/not-found` 、 `/feed` 、 `/feed/atom` 、 `/memos` 系などの静的・リダイレクト系ルートを `src/app/(new)/` 配下に移行し、新デザインへの実機動線検証の足場を整える。

来訪者から見える主な変化は静的ページ（about / privacy / not-found）の新デザイン適用。リダイレクト系・フィード系は構造移動のみで体験は変わらない。後続 Phase 4（一覧・トップ）以降の移行作業の前提となる。

## 実施する作業

採否は「## 作業計画」で確定済み。各タスクの **詳細は「## 作業計画 / 作業内容」B-333-1〜B-333-9 を真実源として参照** すること（本チェックリストは進捗の可視化のみで、スコープの真実源ではない）。

- [ ] B-333: 静的・リダイレクト先行の新デザイン移行（移行計画 Phase 3）
  - [x] B-333-1: 一次情報の Read と内在化、および前提確認（PM 本人責務）
  - [x] B-333-2: TrustLevelBadge 取り扱い判断（**execution フェーズで Owner 指摘を受けて (A) 完全撤去採用に変更**。詳細は B-333-2 セクションの「execution 結果」参照）
  - [x] B-333-2a: 新 TrustLevelBadge 共通コンポーネントの新設 → **(A) 撤去採用に伴い不要となったため commit a3b8dc9f を revert 済み**（commit 56930c8c）。本サブタスクは取り下げ。残り 17 利用箇所の撤去は新 backlog **B-367** として独立サイクルで実施
  - [x] B-333-3: not-found の配置確定（(γ'') = `src/app/global-not-found.js` + `experimental.globalNotFound: true` に確定済み）と絵文字撤去後の視覚案判断（PM 本人責務）
  - [x] B-333-4: 3.2 リダイレクト 5 ルートの `(new)/` 配下への一括移動（builder 委譲可、1 コミット）→ commit 3235700e
  - [x] B-333-5: 3.1 `/about` 1 ページ移行 + **TrustLevelBadge 撤去**（B-333-2 (A) 採用に伴う追加責務）（builder 委譲可、1 コミット）→ commit 53b81e16
  - [x] B-333-6: 3.1 `/privacy` 1 ページ移行（OGP 画像同梱）+ **TrustLevelBadge 撤去**（B-333-2 (A) 採用に伴う追加責務）（builder 委譲可、1 コミット）→ commit 6301d8b8（B-333-8 の feed 移動と並行起動した結果、両者が同 commit に統合された。functionally 正常、後段で reviewer に確認させる）
  - [x] B-333-7: 3.1 `/not-found` 1 ページ移行（`src/app/global-not-found.js` 新規作成、`next.config.ts` の experimental フラグ追加、絵文字撤去 + 新トークン化、既存テスト追従）（builder 委譲可、1 コミット）→ commit a969b59f。`global-not-found.js` は `<html>/<body>` を含むため、本文を `global-not-found-content.tsx` に分離してテスト可能にする実装を採用
  - [x] B-333-8: 3.1 `/feed`・`/feed/atom`（Route Handler 2 本）の `(new)/` 配下への移動（builder 委譲可、1 コミット）→ commit 6301d8b8 に統合（B-333-6 と並行起動の結果）。PM が baseline diff 検証を実施: feed/atom XML は完全一致、`cache-control`/`content-type` 完全一致、`x-next-cache-tags` のみ `(legacy)` → `(new)` 変動（allow-list 除外カテゴリ予期通り）、sitemap.xml も完全一致
  - [ ] B-333-9: 統合検証（sitemap / build / lint / format:check / test、Playwright 視覚確認、curl による Route Handler の動作確認、ヘッダ diff、`(legacy)/` 残存物 grep）と独立 reviewer によるレビュー

## 作業計画

### 目的

`docs/design-migration-plan.md` の Phase 3「静的 + リダイレクト先行」を本サイクル内で完了させる。具体的には、

- 3.1: `/about`、`/privacy`、`/not-found`、`/feed`（RSS）、`/feed/atom`（Atom）の 5 ルートを `src/app/(new)/` 配下に移し、UI を持つ 3 ルート（about / privacy / not-found）は新デザイン体系（DESIGN.md）に沿って再仕上げする。
- 3.2: `/memos`、`/memos/[id]`、`/memos/feed`、`/memos/feed/atom`、`/memos/thread/[id]` の 5 ルート（すべて Route Handler でリダイレクトまたは 410 Gone）を `(new)/` 配下にディレクトリごと移動する（UI / デザイン作業なし）。

これにより、Phase 4 以降（一覧・トップ・検索・詳細）の移行作業の基盤として、(legacy) と (new) の併存運用が「実コンテンツの最初の切替え」として安全に機能することを実証する。

本サイクルは Phase 4 以降の前提となるため、ここで仕様や検証手順が崩れると後続 Phase が連鎖的に影響を受ける。よって完了基準は「URL が動く」だけでなく「視覚 / メタ / sitemap / Route Handler 出力 / 既存テスト」のいずれにおいても旧と同等以上であることを含む。

### 来訪者価値の経路

本サイクルが直接価値提供する来訪者像は次の通り（`docs/targets/` の YAML から正確に位置づけ）:

- **`気に入った道具を繰り返し使っている人`（M1b）への直接価値**: M1b の likes に「サイト内のすべてのツールやゲームの操作性やトーン&マナーが一貫していること」「ブックマークしたURLを開けばすぐ目的のツールが表示されること」「以前と同じ入力なのに結果や挙動が前回と変わっていないこと」がある。Phase 3 の作業は (i) `/about`・`/privacy`・`/not-found` を新デザインに揃えて一貫性を底上げし、(ii) URL を一切変えず（ファイル位置の変更だけ）に行う「不変性の維持」サイクルである。M1b dislikes「URLが変更されたコンテンツにリダイレクトが設定されておらずたどり着けなくなること」「以前と同じ入力なのに結果や挙動が前回と変わっていること」は、本サイクルでは `/memos` 系の 301/410、`/feed`・`/feed/atom` の XML 出力・HTTP ヘッダ（**`Cache-Control` / `Content-Type` は完全一致、`Last-Modified` / `ETag` は意味的同等を保証**。詳細は B-333-1 の HTTP ヘッダ allow-list を参照、Minor-4 対応）が移動前と維持されることで対応する（既に legacy 側でリダイレクト済みの状態を、(new) 配下に移しても **同じ挙動が継続して維持される** ことが本サイクルの不変項）。
- **`特定の作業に使えるツールをさっと探している人`（M1a）への間接価値**: M1a は about / privacy / not-found に直接の用事はない。ただし not-found の質（誤って到達したときに目的のページへの導線が即座に見えること）は、検索結果から開いた URL が古かった場合の救済路として機能する。M1a の dislikes「似たようなツールが並んでいて、どれを使えばよいか迷わせること」を考慮し、not-found の代替リンク群は「迷わせない」設計を維持する。
- **新規来訪者全般への信頼性価値**: about / privacy はサイトの信頼性表明（AI 運営の明示、プライバシー方針）として機能し、constitution Rule 3「AI 運営の通知」を支える。新デザインへの揃え込みはこの信頼性表明の一貫性を守る。
- **`AIエージェントやオーケストレーションに興味があるエンジニア` / `AIの日記を読み物として楽しむ人` への間接価値**: feed / atom フィードは購読導線として機能する。Route Handler の出力（XML 内容、`force-static`、HTTP ステータス）が一切変わらないことが本サイクルの不変項であり、購読者の RSS リーダーが破綻しないことを保つ。

つまり Phase 3 は **「直接の機能追加価値はゼロだが、一貫性 / 不変性 / 救済導線の質という間接的な来訪者価値を、後続 Phase の前提として確立する」** 性格のサイクルである。

### 作業内容

各タスクの目的・内容・成果物・PM/builder 区分・依存関係を以下に明示する。**判断系（B-333-2 / 3）は PM 本人責務、機械的作業系（B-333-4〜8）は builder 委譲可、検証（B-333-9）はレビュー含めて独立サブエージェント主導**。

#### B-333-1: 一次情報の Read と内在化、および前提確認（PM 本人責務）

- **目的**: 後続サブタスクの前提となる一次情報を PM が自分で確認し、code-researcher 報告に依存せず PM 自身が事実を把握した状態を作る。AP-P16 / AP-WF12 回避。
- **内容**:
  - `docs/design-migration-plan.md` の Phase 3 セクション（L91-L102）と「1 ページ移行の標準手順」（L290-L302）、「検証方法」（L304-L336）、「アンチパターン回避」（L338-L346）を逐語 Read。
  - `src/app/(legacy)/` 配下の対象 10 ルート（about / privacy / not-found / feed / feed/atom / memos / memos/[id] / memos/feed / memos/feed/atom / memos/thread/[id]）の実体（page.tsx / route.ts / module.css / **tests** の有無）と、各ファイル冒頭の export 宣言（`dynamic`、`metadata`、`revalidate`、route handler の `Cache-Control` 設定等）を Read。
  - `src/app/(new)/layout.tsx` と `src/app/(legacy)/layout.tsx` を Read し、(i) 双方が `<html>`/`<body>` を出力する **multiple root layouts 構成** であること、(ii) (new) 配下に置いたページに何が自動適用されるか（Header / Footer / ThemeProvider / GoogleAnalytics / AchievementProvider / StreakBadge / ThemeToggle / WebSite JSON-LD / `sharedMetadata`）、(iii) `(legacy)/layout.tsx` の `metadata.alternates.types` が `application/rss+xml = /feed`、`application/atom+xml = /feed/atom` を指していて、`/feed` の物理位置を (new) に移しても **URL は不変** であるためこの宣言は変更不要であること、を把握。
  - `src/app/sitemap.ts` を Read し、Phase 3 対象ルートの URL がどう生成されているかを確認。**`@/app/(legacy)/...` から meta を import している 4 行（about / privacy / achievements / play/daily）のうち、本サイクルで書き換える対象は about / privacy の 2 行のみ**（achievements / play/daily の meta は Phase 3 の対象外なので残す）であることを B-333-5 / 6 の前提として記録。
  - `src/app/(legacy)/__tests__/` 配下の 9 ファイル全件を Read（`globals-css-dialog.test.ts` / `metadata.test.ts` / `not-found.test.tsx` / `page-module-css-a11y.test.ts` / `page.test.tsx` / `public-static-assets.test.ts` / `section-layouts.test.ts` / `seo-coverage.test.ts` / `sitemap.test.ts`）。とくに **(i) `not-found.test.tsx` が **2 件**のテストケース（`grep -cE "^\s*(it|test)\(" src/app/(legacy)/__tests__/not-found.test.tsx` の実測値で確定。Major-1 対応）で構成され、`/トップページに戻る/` `/すぐに使える便利ツール集/` `/遊んで学べるブラウザゲーム/` `/試行錯誤ブログ/` の 4 つの link name 正規表現で description 文言に依存していること、(ii) `seo-coverage.test.ts` が `import("@/app/(legacy)/about/page")` を含む 16 件以上の `@/app/(legacy)/...` 直書き参照を持つこと、(iii) `sitemap.test.ts` が `import { ABOUT_LAST_MODIFIED } from "@/app/(legacy)/about/meta"` を持ち `/about` の lastModified を検証していること、(iv) `metadata.test.ts` が `../layout` 相対パスで `(legacy)/layout.tsx` の metadata を直接参照していること** を確認し、後続タスクに反映する。
  - 各対象ページ専属の `__tests__/`（`(legacy)/about/__tests__/page.test.tsx` / `(legacy)/privacy/__tests__/page.test.tsx` / `(legacy)/feed/__tests__/feed.test.ts` / **`(legacy)/memos/__tests__/memos-redirect.test.ts`**（※`(legacy)/__tests__/` 配下ではなく `(legacy)/memos/__tests__/` 配下に存在することに注意） / `(legacy)/memos/feed/__tests__/memo-feed.test.ts` 等）の存在と内容を確認。各ファイルの **テストケース数を `grep -cE "^\s*(it|test)\(" <file>` で計測し、ファクトチェック完了テーブルに記録する**（Major-6 対応。本計画書の B-333-4 / 8 / 完了基準に記載した件数とテーブルの値が乖離した場合はテーブルが真実源）。
  - `src/components/common/TrustLevelBadge.tsx` と `src/components/common/TrustLevelBadge.module.css` を Read。**`grep -rln "TrustLevelBadge" src/ | grep -v __tests__ | grep -v "TrustLevelBadge.tsx" | grep -v ".md" | grep -v "TrustLevelBadge.module.css"` を実行し、実数 **19 件**（dictionary 系 page.tsx 11 件: `dictionary/kanji/page.tsx`、`dictionary/kanji/radical/[radical]/page.tsx`、`dictionary/kanji/grade/[grade]/page.tsx`、`dictionary/kanji/stroke/[count]/page.tsx`、`dictionary/yoji/page.tsx`、`dictionary/yoji/category/[category]/page.tsx`、`dictionary/humor/page.tsx`、`dictionary/humor/[slug]/page.tsx`、`dictionary/colors/page.tsx`、`dictionary/colors/category/[category]/page.tsx`、+ `blog/[slug]/page.tsx` / `achievements/page.tsx` / `play/daily/page.tsx` / `about/page.tsx` / `privacy/page.tsx` の 5 件 = page.tsx 系 計 15 件、+ 共通 layout 系 4 件: `cheatsheets/_components/CheatsheetLayout.tsx`、`play/quiz/_components/QuizPlayPageLayout.tsx`、`play/games/_components/GameLayout.tsx`、`dictionary/_components/DictionaryDetailLayout.tsx`）で使用中であることを使用ファイル一覧として記録**（Minor-1 対応: 実測コマンド + 実数 19 件で確定）。本サイクルで (new)/ に移行する about / privacy の 2 件を除く 17 件は (legacy) 配下に残存し、Phase 4-8 で順次 (new) に移行される対象。
  - **`tools/_components/` の取り扱い（Minor-1 対応）**: `src/tools/_components/ToolLayout.tsx` 本体は TrustLevelBadge を import していない。`src/tools/_components/__tests__/ToolLayout.test.tsx` のみが「**TrustLevelBadge を render しない**」ことを assertion しているテストファイルとして存在する。よって TrustLevelBadge の **利用箇所一覧から `tools/_components/` は除外する**。「ToolLayout は TrustLevelBadge を表示しない（テストで保証）」を独立した事実としてファクトチェック完了テーブルに別行で記録する。
  - `src/components/Header/index.tsx` を Read し、現状の `actions` スロットの構造（受け口・desktop/mobile 振り分け・タップターゲット高さ）を把握。Phase 4 申し送りの「actions スロットへの追加」が Header コンポーネント側で対応する責務であることを確認し、layout 側ではなく Header 側に必要な拡張箇所を実体ベースで申し送る。
  - `DESIGN.md`（`/mnt/data/yolo-web/DESIGN.md`）の §1〜§7 を逐語 Read。
  - `docs/anti-patterns/planning.md`、`docs/anti-patterns/implementation.md`、`docs/anti-patterns/workflow.md`、`docs/knowledge/css-modules.md`、`docs/knowledge/nextjs.md` を Read。とくに「§1 専用ルート追加後のdevサーバー再起動」「§8 古い next-server プロセス」「CSS Modules §1 `:global(:root.dark)`」を内在化。
  - 既存の Phase 3 系で参考になる先行例（`(new)/storybook/` など）の構造を Read。
  - **不変項のベースライン取得**: 移動前の状態で `npm run build` を実行し、(i) `./tmp/sitemap-before.xml`（`app/sitemap.xml` の build 出力をコピー）、(ii) `./tmp/feed-before.xml`（`/feed` を curl）、(iii) `./tmp/feed-atom-before.xml`（`/feed/atom` を curl）、(iv) 上記 2 種の curl の **HTTP レスポンスヘッダ全件**（`./tmp/feed-headers-before.txt` / `./tmp/feed-atom-headers-before.txt`、`curl -sI` または `-D -` で取得）、(v) `.next/server/app/` 配下の生成ファイルパスのリスト（`./tmp/build-paths-before.txt`、`find .next/server/app -type f | sort` 等で取得）を保存する。これを B-333-9 の「移動前後で完全一致」検証の一次基準として参照する。
  - **Route Group ディレクトリの build 出力含意観察（Minor-3 対応）**: `./tmp/build-paths-before.txt` を保存する際に、出力パスに Route Group ディレクトリ（`(legacy)` / `(new)`）が **そのまま含まれるか** **剥がされて URL 階層に直接出るか** を実体観察し、`./tmp/build-paths-route-group-observation.md` に記録する。具体的には、(a) `.next/server/app/(legacy)/about/...` のように Route Group ディレクトリが含まれるパターン、(b) `.next/server/app/about/...` のように Route Group が剥がされて URL 階層と一致するパターン、(c) その他（拡張子別 `.html` / `.rsc` / `.meta` 別の挙動差）の 3 ケースのいずれであるかを `find` 結果から目視確認する。観察結果を B-333-9 の「production build 出力パス diff（Minor-3 対応）」の判定基準に直接反映する。
  - **Minor-3 観察結果の B-333-9 判定基準への分岐（事前定義）**:
    - パターン (a) の場合（Route Group が出力パスに含まれる）: B-333-9 の build-paths diff では Phase 3 対象 10 ルート分のパスが `(legacy)/` から `(new)/` または root 直下（not-found のみ）へ移動した形の diff のみが許容される。それ以外の経路（例: `(legacy)/about/page.js` → `(legacy)/about/page.js` で不変）が変動していたら異常
    - パターン (b) の場合（Route Group が剥がれる）: B-333-9 の build-paths diff では Phase 3 対象 10 ルートのパスは **不変**（出力パスに Route Group が出ないため、(legacy)/ から (new)/ への移動が出力パスに反映されない）。not-found のみは `(legacy)/not-found.html` が消え `global-not-found.html` 相当の新規パスが追加される形の diff が許容される。それ以外のルートで変動があれば異常
    - パターン (c) の場合（拡張子別の挙動差）: 観察結果に従い (a)/(b) の判定基準を拡張子ごとに分けて適用する
  - **HTTP ヘッダの「意味的に同等であるべき」 allow-list 確定（Major-3 / Minor-2 対応）**: `(legacy)/feed/route.ts`（L11 `Content-Type: application/rss+xml; charset=utf-8`、L12 `Cache-Control: public, max-age=3600, s-maxage=3600` を実体 Read で確定）および `(legacy)/feed/atom/route.ts`（L11 `Content-Type: application/atom+xml; charset=utf-8` を実体 Read で確定。「想定」ではない）を Read 済み。Route Handler が **明示的に設定しているヘッダ** はこの 2 種のみ（`Last-Modified` / `ETag` は Route Handler では明示的に設定していない）。`buildFeed`（`src/lib/feed.ts`）の出力中 `<lastBuildDate>` / Atom `<updated>` は **最新記事の `published_at`** から導出されており、移動前後で blog post 集合が変わらなければ不変。
  - **`Last-Modified` / `ETag` の実体観察ステップ（machine-judgable allow-list 確定の手順）**:
    1. B-333-1 時点で `npm run build && npm start` を実行し、production server を起動
    2. `curl -D - -o ./tmp/feed-body-1.xml http://localhost:3000/feed` を実行
    3. 5 秒待ってから `curl -D - -o ./tmp/feed-body-2.xml http://localhost:3000/feed` を再実行
    4. 同様に `/feed/atom` についても 2 回 curl
    5. 両回のレスポンスヘッダを比較し、各ヘッダ名について以下 4 列のテーブルを `./tmp/feed-headers-allowlist.md` に作成する:

       | ヘッダ名                                          | 観察値（1 回目） | 不変条件                                                                                                                                                    | 許容変動                                                 |
       | ------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
       | `Content-Type`                                    | route.ts 明示値  | 完全一致                                                                                                                                                    | なし                                                     |
       | `Cache-Control`                                   | route.ts 明示値  | 完全一致                                                                                                                                                    | なし                                                     |
       | `Last-Modified`                                   | 観察値を記録     | 2 回の curl で同一 / 一致しない場合は値の生成元（build 時刻 vs blog post の最新更新日時）を `./tmp/feed-body-1.xml` の `<lastBuildDate>` と突き合わせて確認 | 値の数値そのものではなく「不変条件を満たすか」が判定基準 |
       | `ETag`                                            | 観察値を記録     | body hash であれば body 一致時に同値、build 時刻ベースであれば 2 回の curl で同一                                                                           | 同上                                                     |
       | `Date`                                            | —                | 比較対象外                                                                                                                                                  | 任意                                                     |
       | `X-Nextjs-*`                                      | —                | 比較対象外                                                                                                                                                  | 任意                                                     |
       | `Connection` / `Keep-Alive` / `Transfer-Encoding` | —                | 比較対象外                                                                                                                                                  | 任意                                                     |

  - **3 分類への割り当て（Route Handler 移動前後の diff 判定基準）**:
    - **完全一致を要求（diff 0）**: `Content-Type`、`Cache-Control`、Route Handler が明示的に設定したカスタムヘッダ全件
    - **意味的同等（machine-judgable）**: `Last-Modified`、`ETag` は「allow-list 記載の不変条件を満たすか否か」で機械判定する。判定方法は (i) 移動前 2 回の curl で値が安定しているか、(ii) 移動後 2 回の curl で値が安定しているか、(iii) 移動前後で同一の値か / 同一の生成ロジックから導出された値か（例: 両方とも build 時刻、両方とも `<lastBuildDate>` と一致）の 3 条件。条件不成立の場合は B-333-8 / B-333-9 で原因を特定して計画書に記録
    - **除外（変動を許容）**: `Date`、`X-Nextjs-*` 系（`x-nextjs-cache`、`x-nextjs-prerender` など、Next.js 内部の prerender / cache 状態を表す実装詳細）、`Connection`、`Keep-Alive`、`Transfer-Encoding`
    - この allow-list を `./tmp/feed-headers-allowlist.md` に保存し、B-333-8 / B-333-9 がこれを基準に diff 判定する。

- **成果物**: 本セクション B-333-1 直下に **「ファクトチェック完了テーブル」** を追記する。テーブル列は `項目 / 確認したファイルパス / 行番号または件数 / 確認日時 / 後続タスクへの含意`。最低限以下の行を含めること:
  - sitemap.ts の (legacy) 経由 import 4 行のうち本サイクルで書き換える 2 行（about / privacy）の行番号
  - not-found.tsx の絵文字リテラル 4 件の行番号
  - `(legacy)/__tests__/not-found.test.tsx` の **2 ケース**（`grep -cE "^\s*(it|test)\(" src/app/(legacy)/__tests__/not-found.test.tsx` の実測値、Major-1 対応）および link name 正規表現の依存（`/トップページに戻る/` `/すぐに使える便利ツール集/` `/遊んで学べるブラウザゲーム/` `/試行錯誤ブログ/` の 4 件）
  - `(legacy)/__tests__/seo-coverage.test.ts` の `@/app/(legacy)/about/page` 参照位置
  - `(legacy)/__tests__/sitemap.test.ts` の `@/app/(legacy)/about/meta` 参照位置
  - `(legacy)/__tests__/metadata.test.ts` の `../layout` 参照（`(legacy)/layout.tsx` 自体は本サイクルでは移動しないので影響なしという結論）
  - TrustLevelBadge の使用ファイル一覧（10+ ルート、具体パス）
  - privacy の opengraph + twitter image 同梱要、about に OGP 不在
  - multiple root layouts 構成であること（C-1 結論の根拠）。さらに「公式 docs の `global-not-found.js` セクションが本構成を `not-found.js` 不可ケースとして明示している」ことを Read 済みの根拠として記録（B-333-3 の判断の前提）
  - **Next.js 16.2.4 で `experimental.globalNotFound` が実体サポートされている一次エビデンス（Major-4 対応）**:
    - `node_modules/next/dist/server/config-shared.d.ts` L760-L763 に `/** Enables using the global-not-found.js file in the app directory */ globalNotFound?: boolean;` が存在することを Read で確認済み（PM 自身による直接 Read 結果）
    - 本プロジェクトの `package.json` の `"next": "16.2.4"` を Read で確認済み（推測ではない）
    - 本プロジェクトの `next.config.ts` を Read 済み: 現状 `experimental` ブロックは存在せず（`async redirects()` のみ）、`experimental: { globalNotFound: true }` を新規追加する形で 1 行のブロック追加となる
    - 上記 3 件を B-333-3 の配置案 (γ'') の (i) 仕様適合の根拠として参照する。Phase 10.2 申し送りで「Next.js が `globalNotFound` を experimental から stable に格上げした際は experimental フラグ削除のみで継続使用可」「stable に格上げされない場合は格上げ時点で再評価」という分岐を申し送る
  - **各テストファイルのテストケース数（Major-6 対応）**: `(legacy)/about/__tests__/page.test.tsx` / `(legacy)/privacy/__tests__/page.test.tsx` / `(legacy)/feed/__tests__/feed.test.ts` / `(legacy)/memos/__tests__/memos-redirect.test.ts` / `(legacy)/memos/feed/__tests__/memo-feed.test.ts` / `(legacy)/__tests__/not-found.test.tsx` の各件数を `grep -cE "^\s*(it|test)\(" <file>` の実測値で記録。テーブル本体に記載された数値は本計画書の他箇所に書かれた数値より優先される（真実源）。
  - **HTTP ヘッダ allow-list の確定内容**: 「完全一致要求」「意味的同等」「除外」の 3 分類に各ヘッダ名を割り当てた結果（`./tmp/feed-headers-allowlist.md` の内容を要約）
  - `./tmp/sitemap-before.xml` / `./tmp/feed-before.xml` / `./tmp/feed-atom-before.xml` / `./tmp/feed-headers-before.txt` / `./tmp/feed-atom-headers-before.txt` / `./tmp/build-paths-before.txt` / `./tmp/feed-headers-allowlist.md` の保存完了確認
- **依存**: なし（最初に実施）。
- **委譲可否**: PM 本人責務（サブエージェント委譲不可）。一次情報を自分で踏まないと B-333-2 / 3 の判断品質が崩れる。

##### B-333-1 実施結果（execution フェーズで PM 本人が確定）

実施日時: 2026-05-05 cycle-180 execution。本サイクル PM が `npm run build` 実行 + `find` / `grep` / `cp` / Read を直接行った結果を以下に記録する。

**ファクトチェック完了テーブル**:

| 項目                                                      | 確認したファイルパス / 行番号                                                        | 件数 / 値                                                           | 後続タスクへの含意                                                                                  |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| sitemap.ts の (legacy) import 4 行                        | `src/app/sitemap.ts` L23 / L24 / L25 / L26                                           | L23 = about / L24 = achievements / L25 = privacy / L26 = play/daily | B-333-5 で L23 のみ書換 / B-333-6 で L25 のみ書換。L24 / L26 は本サイクル変更なし                   |
| not-found.tsx の絵文字リテラル位置                        | `src/app/(legacy)/not-found.tsx` L16 / L22 / L28 / L34（icon フィールド）            | 4 件（家 / 工具 / ゲーム / メモ）                                   | B-333-7 で 4 件すべての icon フィールドを撤去。title / description は不変                           |
| `(legacy)/__tests__/not-found.test.tsx` のテストケース数  | `src/app/(legacy)/__tests__/not-found.test.tsx`                                      | **2 ケース**（実測 `grep -cE "^\s*(it\|test)\(" `）                 | B-333-7 で `src/app/__tests__/global-not-found.test.tsx` へ移動 + 4 link name 正規表現は不変で pass |
| `seo-coverage.test.ts` の about 参照                      | `src/app/(legacy)/__tests__/seo-coverage.test.ts` L108                               | `import("@/app/(legacy)/about/page")`                               | B-333-5 で `@/app/(new)/about/page` に書換                                                          |
| `sitemap.test.ts` の about/meta 参照                      | `src/app/(legacy)/__tests__/sitemap.test.ts` L9                                      | `import { ABOUT_LAST_MODIFIED } from "@/app/(legacy)/about/meta"`   | B-333-5 で `@/app/(new)/about/meta` に書換                                                          |
| `metadata.test.ts` の `../layout` 参照                    | `src/app/(legacy)/__tests__/metadata.test.ts`                                        | `(legacy)/layout.tsx` を `../layout` で参照                         | `(legacy)/layout.tsx` 自体は本サイクルでは移動しないため**影響なし**（変更不要）                    |
| TrustLevelBadge 使用ファイル一覧                          | `grep -rln "TrustLevelBadge" src/`                                                   | **19 件**（page.tsx 系 15 + 共通 layout 4）                         | 本サイクルで about / privacy 2 件のみ新版に切替。残 17 件は (legacy) 据え置き                       |
| `tools/_components/` の取り扱い                           | `src/tools/_components/__tests__/ToolLayout.test.tsx`                                | テストのみ（ToolLayout 本体は import なし）                         | 利用箇所一覧から除外                                                                                |
| about / privacy / not-found の `<strong>` `<em>` `<b>` 数 | `src/app/(legacy)/about/page.tsx` L84 / L88 / L92                                    | about: `<strong>` 3 件 / privacy: 0 件 / not-found: 0 件            | B-333-5 で about の `<strong>` 3 件を `<em>` に置換（CSS で italic 抑制）                           |
| privacy の OGP / about の OGP 不在                        | `src/app/(legacy)/privacy/opengraph-image.tsx` 存在 / `src/app/(legacy)/about/` 不在 | privacy: opengraph-image.tsx + twitter-image.tsx 同梱 / about: なし | B-333-6 で OGP 同梱移動 / B-333-5 ではスコープ外（B-366 backlog 化）                                |
| `(legacy)/about/__tests__/page.test.tsx`                  | `grep -cE "^\s*(it\|test)\("`                                                        | **4 ケース**                                                        | B-333-5 でテストファイル移動 + 文言追従不要（about 本文は構造変更なし）                             |
| `(legacy)/privacy/__tests__/page.test.tsx`                | 同上                                                                                 | **5 ケース**                                                        | B-333-6 でテストファイル移動                                                                        |
| `(legacy)/feed/__tests__/feed.test.ts`                    | 同上                                                                                 | **8 ケース**                                                        | B-333-8 でテストファイル移動                                                                        |
| `(legacy)/memos/__tests__/memos-redirect.test.ts`         | 同上                                                                                 | **8 ケース**                                                        | B-333-4 でテストファイル移動                                                                        |
| `(legacy)/memos/feed/__tests__/memo-feed.test.ts`         | 同上                                                                                 | **4 ケース**                                                        | B-333-4 でテストファイル移動                                                                        |
| multiple root layouts 構成                                | `src/app/(legacy)/layout.tsx` + `src/app/(new)/layout.tsx`                           | 双方が `<html>`/`<body>` を出力                                     | B-333-3 確定の (γ'') = global-not-found.js 採用の根拠                                               |
| Next.js 16.2.4 で `experimental.globalNotFound` 実体      | `node_modules/next/dist/server/config-shared.d.ts` L760-L763 / `package.json` `next` | `globalNotFound?: boolean` 行存在 / next 16.2.4                     | B-333-7 で `next.config.ts` に `experimental.globalNotFound: true` を 1 行追加                      |
| Footer の Provider 依存                                   | `src/components/Footer/index.tsx`                                                    | `"use client"` なし、Provider 非依存、server component              | B-333-7 global-not-found.js でそのまま import 再利用                                                |

**ベースライン取得完了確認**: 以下を `./tmp/` に保存済み:

- `tmp/sitemap-before.xml`（2637 行、`.next/server/app/sitemap.xml.body` のコピー）
- `tmp/feed-before.xml`（202 行、`.next/server/app/feed.body` のコピー）
- `tmp/feed-atom-before.xml`（200 行、`.next/server/app/feed/atom.body` のコピー）
- `tmp/feed-meta-before.txt` / `tmp/feed-atom-meta-before.txt`（HTTP ヘッダ JSON）
- `tmp/build-paths-before.txt`（42032 行、`find .next/server/app -type f | sort`）
- `tmp/feed-headers-allowlist.md`（HTTP ヘッダ allow-list 確定版）

**Route Group の build 出力含意（Minor-3 観察結果）**: **Pattern (c) 該当**（拡張子別に挙動が異なる）。

- Pattern (a)（Route Group がパスに含まれる）: `.js` / `.rsc` / `route.js` / `page.js` / `opengraph-image-*/route.js` 等の通常出力。例: `.next/server/app/(legacy)/about/page.js`
- Pattern (b)（Route Group が剥がれる）: `force-static` 指定の Route Handler 静的 prerender 出力。例: `.next/server/app/feed.body` / `.next/server/app/feed/atom.body` / `.next/server/app/sitemap.xml.body`（既に Route Group 剥がれているため、`(legacy)→(new)` 移動でも出力パスが同じ）

**HTTP ヘッダ allow-list 確定**:

- 完全一致要求: `status` / `content-type` / `cache-control`
- 意味的同等（machine-judgable）: 該当なし（`.meta` には `Last-Modified` / `ETag` が存在しない）
- **除外（変動を許容）**: `x-next-cache-tags`（Next.js 内部のキャッシュタグで `_N_T_/(legacy)/feed/route` のように Route Group パスを含むため、(new) 移動で必然的に変わる実装詳細） / `date` / `connection` 系
- 詳細は `tmp/feed-headers-allowlist.md` 参照

#### B-333-2: TrustLevelBadge 取り扱い判断（PM 本人責務）

##### execution 結果（Owner 指摘を受けた再判断: (A) 完全撤去採用）

execution フェーズで Owner から「TrustLevelBadge は本当に必要か？ 実態と表示は正確に合っているか？ 来訪者が判断基準にしているか？ ITリテラシーが低い来訪者にとって『正確な処理』はミスリードでは？ 『AI作成データ』と『AI生成テキスト』の境目は明瞭か？」という根源的な問い掛けを受けた。code-researcher による実態調査（`tmp/research/2026-05-05-trust-level-badge-evaluation.md`）の結果、**(A) 完全撤去** を採用することに方針を変更した。

**判断根拠（実体ベース）**:

1. **ToolLayout は trustLevel を持つが badge をレンダリングしていない** — 34 ツールページの trustLevel = "verified" は来訪者には届いていない。Owner の「『正確な処理』ミスリード」指摘は、届いていれば確かに問題だったが、そもそも届いていなかった
2. **ラベルと実態の不一致が複数存在** — achievements（実態は localStorage の事実データなのに `generated`）、privacy（法的文書なのに `generated`）。撤去でこれらの誤りも消える
3. **Footer に「このサイトはAIによる実験的プロジェクトです。コンテンツはAIが生成しており、内容が壊れていたり不正確な場合があります。」が黄色ボックスで全ページ常時表示** — constitution Rule 3 は完全充足済み。badge は冗長
4. **計測ゼロ** — `src/lib/analytics.ts` に TrustLevelBadge クリック・展開のイベントなし。利用実態が不明なまま 19 ファイルで動いていた
5. **3 段階の意味分離が来訪者頭脳で立たない** — `<details>/<summary>` 折りたたみ式で初期は label のみ。「curated」と「generated」を区別する手がかりが来訪者にない（kanji-data.json は公的データ + AI 補足のハイブリッド）
6. **ゲーム・クイズの `trustNote`（具体的な注記、例: 「正解判定は正確、パズルデータは AI 作成」）は plain text として有用** — badge 廃止後も GameLayout / QuizPlayPageLayout の plain text として残す

**サイクル境界の判断**:

本サイクル（cycle-180）では、about / privacy を (new) に移行する一連の作業の中で **両ページから TrustLevelBadge を撤去**する（混在を増やさない原則）。残り 17 利用箇所 + コンポーネント本体（`src/components/common/TrustLevelBadge.*`） + `src/lib/trust-levels.ts` + meta.ts の `trustLevel` フィールド + テスト の体系的削除は、Phase 3 のスコープと混ぜずに **独立サイクル B-367** で実施する（1 サイクル 1 目的の純度保持）。これにより:

- (new)/about と (new)/privacy は本サイクル完了時点で badge なし（Footer の AI 注記で Rule 3 充足）
- (legacy) 配下の 17 ルートは Phase 4-8 の各移行サイクル開始まで旧 badge が表示され続けるが、(legacy) は廃止予定であるため許容
- B-367 は cycle-180 完了直後の独立サイクルとして起票（B-334 = Phase 4 着手前に実施することで Phase 4-8 移行サイクル PM の判断負荷を軽減）

**B-333-2a の取り扱い**: 計画段階では「新版 TrustLevelBadge を別パスで併存」と確定していたが、(A) 撤去採用により新版自体が不要となった。execution 中に既に commit a3b8dc9f で新版を実装済みだったため、commit 56930c8c で **revert 済み**。本サブタスクは取り下げ。

**B-333-5 / B-333-6 への影響**: about / privacy 移行時に `@/components/common/TrustLevelBadge` の import と JSX をともに削除する作業を追加責務として含める（後述の B-333-5 / 6 セクションで詳細化）。

##### 計画段階の判断（参考、現在は無効）

以下は計画段階で「(A) 共通化採用」を前提に書かれた内容。execution で (A) 撤去採用に方針変更したため、現在は **無効**（参考情報として残す）。

- **目的**: about / privacy が import している `@/components/common/TrustLevelBadge` を、新側でどう扱うかを判断する。標準手順ステップ 1 の判断対象。
- **前提（B-333-1 で確定済みの事実）**: TrustLevelBadge は **現役 10+ ルートで使用中**（dictionary 系 8 ルート、blog 詳細、achievements、play/daily に加え、共通 layout 系 `CheatsheetLayout` / `QuizPlayPageLayout` / `GameLayout` / `DictionaryDetailLayout` 経由で更に多数）。Phase 4-8 でこれらが (new) に移行される過程で **共通版が必須** になるため、選択肢 B（ページ局所化）と C（撤去）は事実上採用不能。**よって本サイクルは A（共通化）採用を前提とし、B-333-2 の論点は「A 採用にあたって DESIGN.md 整合の観点で何を書き換える必要があるか」を確定することに絞る**。
- **内容（Major-6 対応: PM 確定済みの実物ベース仕様）**: A 採用前提で以下を本サイクル中に execution PM が「再判断」するのではなく、本計画書時点で既に PM が `src/components/common/TrustLevelBadge.tsx` L1-L36、`src/components/common/TrustLevelBadge.module.css` L1-L74、`src/lib/trust-levels.ts` L1-L50、`DESIGN.md` §2-§3 を Read した結果として以下に確定する。execution PM は本確定値をそのまま B-333-2a builder へ渡すこと。

  **(i) 配置先パス**: `src/components/TrustLevelBadge/index.tsx` および `src/components/TrustLevelBadge/TrustLevelBadge.module.css`（B-333-2a で新規作成）。テストは `src/components/TrustLevelBadge/__tests__/TrustLevelBadge.test.tsx`。

  **(ii) 旧 TrustLevelBadge.module.css の CSS 変数 → 新トークン置換マップ**: 旧 CSS L35-L72 で使用されている変数を Read で抽出し、DESIGN.md §2 のトークンへ以下のように対応させる:

  | 旧 CSS 変数（出現箇所）             | 旧用途                          | 新トークン         | 採用根拠（DESIGN.md 参照）                                                                                                |
  | ----------------------------------- | ------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
  | `--color-trust-verified`（L36）     | verified バッジの文字色         | `--success-strong` | DESIGN.md §2「`-strong` バリアントは `-soft` 背景の縁取りや前景文字に使う」、verified は「正確な処理」で success 系の意味 |
  | `--color-trust-verified-bg`（L37）  | verified バッジの背景色         | `--success-soft`   | 同上                                                                                                                      |
  | `--color-trust-curated`（L41）      | curated バッジの文字色          | `--accent-strong`  | curated は「AI が公式資料・辞書を参照した中間信頼度」で accent 系（注目を促す中立色）が妥当                               |
  | `--color-trust-curated-bg`（L42）   | curated バッジの背景色          | `--accent-soft`    | 同上                                                                                                                      |
  | `--color-trust-generated`（L46）    | generated バッジの文字色        | `--warning-strong` | generated は「AI 生成テキスト、誤りを含む可能性」で警告色が妥当                                                           |
  | `--color-trust-generated-bg`（L47） | generated バッジの背景色        | `--warning-soft`   | 同上                                                                                                                      |
  | `--color-text-muted`（L62, L72）    | description / note の補助文字色 | `--fg-soft`        | DESIGN.md §2「`--fg-soft`: 目立たない文字色（補足説明など）」が直接対応                                                   |
  | `--color-bg-secondary`（L63）       | description の背景色            | `--bg-soft`        | DESIGN.md §2「`--bg-soft`: 画面全体の背景色（パネルを置く場所の背景色）」                                                 |
  | `--color-border`（L64）             | description の境界線色          | `--border`         | DESIGN.md §2「`--border`: 基本の罫線色」が直接対応                                                                        |

  **角丸トークン**: 旧 CSS L28 `border-radius: 0.25rem`（badge）、L59 `border-radius: 0.25rem`（description）→ 新トークン `--r-normal`（DESIGN.md §5「角丸 — `--r-normal` (2px): デフォルトの角丸。パネル・カード・タグ・モーダル等すべての要素に使う」）に置換。バッジは「タグ」相当の要素として `--r-normal` を採用。

  **エレベーション**: 旧 CSS にはエレベーションなし。新版でも追加しない（DESIGN.md §5「通常の要素にはエレベーションを使わない」）。

  **(iii) アイコン・強調表現の取り扱い**: 現状の TrustLevelBadge.tsx L24-L26 は `<span className={styles.icon} aria-hidden="true">{meta.icon}</span>` で `TRUST_LEVEL_META[level].icon` をそのまま表示する。`src/lib/trust-levels.ts` を Read した結果、現状の icon は以下:
  - verified: `✓`（チェックマーク `✓`、Unicode 文字、絵文字ではない）
  - curated: `📖`（書籍 `📖`、**絵文字**）
  - generated: `🤖`（ロボット `🤖`、**絵文字**）

  DESIGN.md §3「アイコンは原則として使わない。どうしても必要な場合は Lucide スタイルの線画アイコンを使う。線の太さは 1.5px、サイズは 16/20/24px のみ。アイコンのみのボタンには必ず aria-label をつける」「絵文字は使わない」より、curated と generated の絵文字 2 件は新版で採用不可。verified の `✓` は Unicode 文字だが、信頼レベルの「機能を伝える」ために他 2 種が無アイコンになるのに 1 種だけ記号がつくのは一貫性を欠くため、**新版では 3 種すべてアイコン枠を撤去** する。Badge は `meta.label` のテキストのみを背景色 + 前景色で示す形にする（背景色の差で 3 種を視覚的に区別）。これにより DESIGN.md §3「アイコン原則使わない / 絵文字禁止」を充足。

  **強調表現**: 旧 CSS の `font-weight: 600`（L30）は維持する。これは「本文中の太字」ではなく「タグ要素のラベルの基本ウェイト」に該当し、DESIGN.md §3「本文中での太字は原則として使わない」の対象外（タグの常時ウェイトはタグ要素のスタイル定義であり、本文中で部分的に強調する `<strong>` とは性質が異なる）。判断根拠: B-333-2 の「Badge 表示形式の差分」検討対象の中で、タグの font-weight は §3 の射程外と PM が確定する（このまま維持）。

  **details/summary の挙動**: 旧 TrustLevelBadge.tsx は `<details>/<summary>` パターンでクリック展開する仕様。新版でも同パターンを維持。`<summary>::-webkit-details-marker { display: none }` のリセットも維持（旧 CSS L19-L21 を新 CSS にそのまま移植）。

  **focus-visible**: 旧 CSS には focus-visible スタイルが無い。新版では `<summary>` に `outline: 2px solid var(--accent); outline-offset: 2px;` の `:focus-visible` を追加（DESIGN.md §2「フォーカスされている要素には `outline: 2px solid var(--accent); outline-offset: 2px;` を使う」より。Phase 3 完了基準「focus-visible」を Badge コンポーネントとしても充足する）。

  **(iv) storybook カタログのエントリ仕様**:
  - 配置先: `src/app/(new)/storybook/` 配下に既存の他コンポーネントエントリと同じ書式で 1 ページ追加（具体的なファイル名や route 構造は既存 storybook の慣例に従う。execution PM が既存 storybook の 1 ページを Read してフォーマットを踏襲する）
  - タイトル: `TrustLevelBadge`
  - バリエーション一覧（最低限以下を含む）:
    - `verified`（label = 「正確な処理」、success 系トークンで描画）
    - `curated`（label = 「AI 作成データ」、accent 系トークンで描画）
    - `generated`（label = 「AI 生成テキスト」、warning 系トークンで描画）
    - `verified` + `note` あり（混在ケース。note prop に短い注記文を渡したサンプル）
    - `<details>` 展開状態（`open` 属性付きで description を常時表示したサンプル）
    - `:focus-visible` 状態（`<summary>` にフォーカスがあたっている状態。可能なら CSS で `:focus-visible` を強制適用したサンプル、または注記で「フォーカス時の見た目」を明示）

  **(v) 既存 10+ 利用箇所の import 書き換えを本サイクルで行うか後続 Phase に送るか**: B-333-2a の「案 b（別パスで併存）」採用に従い **本サイクルでは行わない**。`@/components/common/TrustLevelBadge.*` は削除せず (legacy) 配下 10+ ルートが旧版を引き続き使用する。Phase 4-8 で各ページが (new) に移行するサイクルで個別に新版へ切り替える。

- **storybook 追加の作業境界**: 新 TrustLevelBadge を `src/components/TrustLevelBadge/` に新設するのと同じコミットで storybook エントリを追加する（共通コンポーネント新設の不可分の一部として扱い、1 ページ 1 コミット原則の例外を作らない）。これは B-333-5 / 6 のいずれよりも先に **B-333-2a として独立コミット** にする（about / privacy の移行はこの新コンポーネントに依存するため）。
- **成果物**: 本セクション直下に「TrustLevelBadge A 採用前提の書き換え計画」として、(i) 配置先、(ii) トークン置換マップ、(iii) DESIGN.md 整合の修正点、(iv) storybook エントリ仕様、(v) 既存 10+ 利用箇所の import 書き換えを **本サイクルで行うか後続 Phase に送るか** の判断、を明記する。
- **(legacy) 10+ 利用箇所の取り扱い: 2 案を比較し 1 案に確定する（Minor-2 対応）**:
  - **案 a: shim re-export 採用**（`@/components/common/TrustLevelBadge` を新版 `@/components/TrustLevelBadge` へ薄いラッパで再 export）
    - 影響: (legacy) 配下 10+ ルートが一斉に新トークン適用に切り替わる
    - 後続 Phase 影響: Phase 4-8 でこれら 10+ ルートが (new) に移行する際、import パスを変更するだけで済む（既に見た目は新トークン化済み）。意図して書き換える機会は失われる
  - **案 b: 別パスで併存採用**（`@/components/common/TrustLevelBadge` を旧トークンのまま残し、`@/components/TrustLevelBadge` を新規追加）
    - 影響: (new)/about・(new)/privacy のみが新版を import、(legacy) は旧版を継続使用
    - 後続 Phase 影響: Phase 4-8 で各ルートが (new) に移行する際、本来のサイクルで「import 切り替え + 視覚確認」を行う機会が確保される
  - **採用案: 案 b（別パスで併存）**。判断根拠: (i) Phase 3 のスコープ純度を保つ（10+ 既存ルートを本サイクルで一斉に変えない）、(ii) Phase 4-8 で各ページが移行されるサイクルで個別に視覚確認できる、(iii) Major-1 で要請された「Phase 3 のスコープ越境を避ける」要件を満たす。
- B-333-2 ではこの「案 b 採用」前提を踏まえ、配置先・トークン置換マップ・DESIGN.md 整合・storybook 仕様を確定する（共通化方針 A は確定済みで、「2 案のうちどちらの共通化形態か」が本タスクの判断対象）。
- **依存**: B-333-1 完了後。
- **委譲可否**: PM 本人責務。標準手順ステップ 1 が PM 判断と明示されている。

#### B-333-2a: 新 TrustLevelBadge 共通コンポーネントの新設 + storybook エントリ追加（builder 委譲可、1 コミット）

- **目的**: B-333-2 で確定した方針に従い、`(new)/about` および `(new)/privacy` で **新トークンが適用された TrustLevelBadge** を import 可能にする。B-333-5 / 6 から import される共通コンポーネントを先行で用意する。
- **本タスクが Phase 3 内に存在する正当化（実体ベースの不可分性）**:
  - `(legacy)/about/page.tsx` と `(legacy)/privacy/page.tsx` は `@/components/common/TrustLevelBadge` を import しており、これは旧トークン（`(legacy)` 系の色・スペース・タイポ変数）でスタイリングされている。
  - B-333-5 / 6 の Phase 3 スコープは「(new)/ に移して新トークンで再仕上げする」こと（design-migration-plan.md L91「Phase 3: 静的・リダイレクト先行」）。
  - 旧 TrustLevelBadge をそのまま import 続けると、about / privacy 本文だけ新トークン化しても **Badge 部分だけ旧トークンの色・スペースが残る** という見た目の混在が発生し、Phase 3 の完了基準「DESIGN.md 整合」を満たせない。
  - したがって本タスクは「Phase 4-8 のための投機的拡張」ではなく、**Phase 3 で about/privacy に新トークンを適用するための不可分の前提作業**である。AP-P11（投機的拡張）の同型構造を回避するため、(legacy) 配下の 10+ 既存利用箇所への波及は **本サイクルでは一切行わない**（`@/components/common/TrustLevelBadge.*` は残し、(legacy) 側はそのまま使い続ける。後続 Phase で順次新版へ切り替える）。
- **代替案の検討と却下理由**:
  - **代替案 X: 新コンポーネントを作らず、about/privacy では旧 TrustLevelBadge をそのまま import 続け、ページ側のトークン置換のみ実施する** → Badge 部分に旧トークンの見た目が残るため、ページ全体としては DESIGN.md 整合を主張できない。Phase 3 完了基準「視覚同等以上」に到達しない。**却下**
  - **代替案 Y: shim re-export（`@/components/common/TrustLevelBadge` を新版へリダイレクトするだけの薄いラッパ）で済ませる** → shim では旧トークンを使用している 10+ ルートも一斉に新トークン適用に変わってしまい、Phase 3 のスコープを大きく超える。Phase 4-8 の各サイクルで意図して書き換える機会を奪う。**却下**
  - **採用案: 別パスで新版を併存させる（`@/components/TrustLevelBadge`）**。(legacy) は `@/components/common/TrustLevelBadge` を引き続き使用、(new) のみが新版を import する。Phase 4-8 で各ページが (new) に移る際、import を新版へ書き換える判断を本来のサイクルで行える（Phase 3 のスコープ純度が保てる）。
- **内容**:
  - `src/components/TrustLevelBadge/index.tsx` および `src/components/TrustLevelBadge/TrustLevelBadge.module.css` を新規作成。実装は `src/components/common/TrustLevelBadge.*` を出発点に、B-333-2 確定のトークン置換マップ + DESIGN.md 整合の修正を反映。
  - `src/components/common/TrustLevelBadge.*` は削除しない（10+ 既存利用箇所がそのまま使い続ける）。後続 Phase で順次新版へ切り替える。
  - `src/app/(new)/storybook/` 配下に新 TrustLevelBadge のエントリを追加（新版コンポーネントの一部として不可分に追加）。
  - `src/components/TrustLevelBadge/__tests__/` にレンダリングテストを追加（既存 `src/components/common/__tests__/TrustLevelBadge.test.tsx` を出発点に）。
- **成果物**: 1 コミット + storybook 上での visual 確認スクショ（`./tmp/`）。
- **依存**: B-333-2 完了後。B-333-5 / B-333-6 の **前提**（両者はこのコミットの新版を import するため）。
- **委譲可否**: builder 委譲可（B-333-2 で方針確定済み）。

#### B-333-3: not-found の配置確定（一次情報調査済み）と「絵文字撤去後の代替表現」判断（PM 本人責務）

- **目的**: Next.js の `not-found.tsx` は特殊ファイルで、Route Group のスコープ動作が非自明。本サイクル planner が公式ドキュメント・GitHub Issue・実装報告を一次情報調査し、**multiple root layouts 構成での 4 案を 4 軸で並列比較した上で 1 案に確定**。execution PM はこの結論を前提に B-333-7 へ渡す。並行して、絵文字 4 種を撤去した後の視覚案を 1 案に確定する。
- **一次情報の逐語引用（planner が WebFetch で確認）**:
  - **Next.js 公式ドキュメント** ([not-found.js](https://nextjs.org/docs/app/api-reference/file-conventions/not-found), version 16.2.4, 2026-04-10 lastUpdated) の `global-not-found.js` セクション原文（強調は本計画書による）:

    > Next.js provides two conventions to handle not found cases:
    >
    > - **`not-found.js`**: Used when you call the `notFound` function in a route segment.
    > - **`global-not-found.js`**: Used to define a global 404 page for unmatched routes across your entire app. This is handled at the routing level and doesn't depend on rendering a layout or page.

    > The `global-not-found.js` file lets you define a 404 page for your entire application. Unlike `not-found.js`, which works at the route level, this is used when a requested URL doesn't match any route at all. Next.js **skips rendering** and directly returns this global page.
    >
    > The `global-not-found.js` file bypasses your app's normal rendering, which means you'll need to import any global styles, fonts, or other dependencies that your 404 page requires.

    > **`global-not-found.js` is useful when you can't build a 404 page using a combination of `layout.js` and `not-found.js`. This can happen in two cases:**
    >
    > - **Your app has multiple root layouts (e.g. `app/(admin)/layout.tsx` and `app/(shop)/layout.tsx`), so there's no single layout to compose a global 404 from.**
    > - Your root layout is defined using top-level dynamic segments (e.g. `app/[country]/layout.tsx`), which makes composing a consistent 404 page harder.

    > To enable it, add the `globalNotFound` flag in `next.config.ts`:
    > （`experimental: { globalNotFound: true }` の設定例）
    > Then, create a file in the root of the `app` directory: `app/global-not-found.js`

    > Unlike `not-found.js`, this file must return a full HTML document, including `<html>` and `<body>` tags.

    > **Good to know**: In addition to catching expected `notFound()` errors, the root `app/not-found.js` and `app/global-not-found.js` files handle any unmatched URLs for your whole application.

  - **本プロジェクトの構造**: `(legacy)/layout.tsx` と `(new)/layout.tsx` の **双方が `<html>`/`<body>` を出力する multiple root layouts 構成**（B-333-1 で確認済み）。これは公式 docs 引用 1 つ目の bullet「Your app has multiple root layouts」に **そのまま該当する**。よって公式 docs は本プロジェクトに対して「`not-found.js` の組み合わせで 404 を構成することはできず、`global-not-found.js` を使う」と明示的に指示している。
  - **既知 Issue / コミュニティ報告**: [vercel/next.js #54980](https://github.com/vercel/next.js/issues/54980), [#55717](https://github.com/vercel/next.js/issues/55717), [#55191](https://github.com/vercel/next.js/issues/55191), [#59180](https://github.com/vercel/next.js/issues/59180), [Discussion #50034](https://github.com/vercel/next.js/discussions/50034) — multiple root layouts 環境で `app/not-found.tsx`（root 直下）を置くと、build process が「`not-found.tsx` doesn't have a root layout」エラーを出すケースが多数報告されている。回避策として「`global-not-found.js` を使う」「passthrough の最小 root layout を別途追加して root layout を単一化する」が挙げられているが、後者は Route Group での層分離（`(legacy)` と `(new)` で別 root layout）という本プロジェクトの設計意図そのものを破壊する。

- **配置案の 4 軸並列比較**:

  各案を以下 4 軸で評価する: (i) Next.js 仕様適合 / (ii) `<html>`/`<body>` 出力責務 / (iii) (legacy)/(new) 双方の URL タイポをカバーできるか / (iv) Phase 10.2 での後始末コスト。

  | 案                                                                                        | (i) 仕様適合                                                                                                                                                                                                                                                                                             | (ii) HTML 出力責務                                                                                                                                              | (iii) 双方カバー                                                                    | (iv) Phase 10.2 後始末                                                                                                                            |
  | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
  | **(γ') `src/app/not-found.tsx` を root 直下に置く（素の React、`<html>`/`<body>` なし）** | **不適合**: 公式 docs が「multiple root layouts では `not-found.js` で構成できない」と明言。Issue 群でも build error 報告多数                                                                                                                                                                            | 不可: `<html>`/`<body>` を出力する root layout が存在しないため、build error または描画破綻のリスク高                                                           | （build が通ればカバー可）                                                          | 低: legacy 削除後は通常の `app/not-found.tsx` で十分機能するようになるため軽微                                                                    |
  | **(γ'') `src/app/global-not-found.js` を experimental flag 付きで採用**                   | **適合**: 公式 docs が multiple root layouts ケースの正規解として明示。本プロジェクトの Next.js v16.2.4 で `experimental.globalNotFound?: boolean` が `node_modules/next/dist/server/config-shared.d.ts` L763 に実体存在することを PM 本人が Read で確認済み（B-333-1 ファクトチェック完了テーブル参照） | 自前: `<html>`/`<body>` 込みの完全な HTML を return する責務をファイル自身が持つ。global styles / font の import も自前                                         | カバー可: routing level で処理されるため (legacy)/(new) どちらの URL タイポでも反応 | 中: legacy 削除（root layout 単一化）後は `global-not-found.js` を `app/not-found.js` に書き換え + `experimental.globalNotFound` フラグ削除が必要 |
  | **(γ''') passthrough 最小 `src/app/layout.tsx` 追加 + `src/app/not-found.tsx` 配置**      | 部分適合: build error は回避できるが、Route Group `(legacy)`/`(new)` のうち下位 layout が「root layout」として扱われなくなり、`<html>`/`<body>` の二重出力や Route Group の root layout 機能が壊れる                                                                                                     | passthrough layout 側で `<html>`/`<body>` を出力 → (legacy)/(new) 各 layout は `<html>` を持たない構造に変更が必要（**design-migration-plan.md の前提を破壊**） | カバー可                                                                            | 高: passthrough layout を残すか削除するかで legacy/(new) 双方の layout 構造に追加変更が必要                                                       |
  | **(β) (legacy) と (new) 双方に `not-found.tsx` を置く**                                   | 不適合: Route Group 内 `not-found.tsx` は `notFound()` 呼び出しのスコープでのみ機能し、**unmatched URL 全般を catch する責務を持たない**（公式 docs 引用「root の `app/not-found.js` and `app/global-not-found.js` は unmatched URLs を handle する」より）                                              | 各 layout の `<html>`/`<body>` 内で描画されるため自前不要                                                                                                       | 不可: unmatched URL（存在しないパス）には反応せず、Next.js デフォルト 404 が出る    | 低                                                                                                                                                |
  - **採用案: (γ'') `src/app/global-not-found.js` + `next.config.ts` の `experimental.globalNotFound: true`**
  - **判断根拠**:
    - (γ'') は公式 docs が **multiple root layouts ケースの正規解として明示している唯一の案**（公式 docs 「`global-not-found.js` is useful when you can't build a 404 page using a combination of `layout.js` and `not-found.js`. This can happen in two cases: Your app has multiple root layouts ...」）
    - (γ') は同じ docs 内で「不可能」と明言されているケース（multiple root layouts）に該当し、build error 報告も多数あるため採用不能
    - (γ''') は Route Group での層分離という本プロジェクトの設計意図を破壊する
    - (β) は unmatched URL を catch しないため、来訪者が誤って `/foo` のような URL を踏むと Next.js デフォルト 404（無デザイン）が出てしまい、M1a / M1b の救済導線が機能しない
    - `<html>`/`<body>` 出力の追加コスト・experimental フラグ追加コストは constitution Rule 4「品質を量より優先」に従い、Next.js 仕様適合を優先する。
  - **(γ'') 採用に伴う制約と global-not-found.js の構成内訳（Major-1 PM 確定）**:
    - **PM 本人による (new)/layout.tsx 各ブロックの依存関係 Read 結果（`src/app/(new)/layout.tsx` L1-L52、`src/components/ThemeProvider/index.tsx` L1-L31、`src/lib/achievements/AchievementProvider.tsx` L1-L133、`src/components/Header/index.tsx` L1-L46 を逐語確認）**:

      | 要素                                                                              | (new)/layout.tsx での役割                                    | global-not-found での扱い                                                   | 判断根拠（来訪者目線 + 実体根拠）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
      | --------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
      | `<html lang="ja" suppressHydrationWarning>`                                       | next-themes が `<html>` の class を書き換える前提            | **必須再現**: 同一属性で `<html lang="ja" suppressHydrationWarning>` を出力 | ThemeProvider を 404 ページに置く以上、suppressHydrationWarning がないと hydration 警告が出る（ThemeProvider/index.tsx L11-L13 の使用上の注意に明記）                                                                                                                                                                                                                                                                                                                                                                       |
      | `<body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>` | Footer を viewport 下端に押し下げる sticky-footer レイアウト | **必須再現**: 同一 inline style で出力                                      | 来訪者が 404 から戻る導線を辿る際、Footer/Header がページ高さに対して同じ位置に出ないと「異なるサイトに飛ばされた」感が出るため (new) 通常ページと同じレイアウト構造を維持する                                                                                                                                                                                                                                                                                                                                              |
      | `import "@/app/globals.css"`                                                      | (new) 系の新トークン（DESIGN.md §2-§5）を有効化              | **必須再現**: `global-not-found.js` 内で明示 import                         | global-not-found は normal rendering を bypass するため layout の import チェーンに乗らない（Next.js docs「The `global-not-found.js` file bypasses your app's normal rendering, which means you'll need to import any global styles, fonts, or other dependencies that your 404 page requires」）                                                                                                                                                                                                                           |
      | `<script type="application/ld+json">` (WebSite JSON-LD)                           | サイト全体の検索結果カード等のための構造化データ             | **載せない**                                                                | (i) 404 ページは Next.js が `<meta name="robots" content="noindex" />` を自動注入するため検索結果に出ない、(ii) WebSite JSON-LD は「サイトのトップページの 1 回」が機能としての意味を持ち、404 ページに載せる SEO 上の意味はない、(iii) むしろ 404 ページに WebSite JSON-LD を載せると Search Console で「noindex なページに sitelinks searchbox を主張している」という形式不整合を生む可能性がある                                                                                                                         |
      | `<ThemeProvider>`                                                                 | next-themes でダーク/ライト切替を保持                        | **載せる**                                                                  | (i) 404 ページから戻った先のページがダークモード前提で来訪者が操作している場合、404 だけライトモードに戻ると視覚不一致になる、(ii) ThemeProvider は client component で children を return するだけのラッパなので 404 ページに置く負荷は無視できる、(iii) `(new)/layout.tsx` と同じ視覚体験を維持する原則                                                                                                                                                                                                                   |
      | `<AchievementProvider>`                                                           | localStorage 由来の実績データを context で配布               | **載せない**                                                                | (i) 404 ページにはバッジ表示（StreakBadge）も実績記録（recordPlay 呼び出し）も無いため Provider 不要、(ii) AchievementProvider は内部で `useSyncExternalStore` を使い `getServerSnapshot()` で null を返すため SSR では問題ないが、children に `<AchievementToast />` を必ずレンダする副作用を持つ（AchievementProvider.tsx L130）。404 ページで意図せずトーストが出るリスクを排除する、(iii) StreakBadge を 404 ページに表示しないので Provider そのものが不要                                                             |
      | `<GoogleAnalytics />`                                                             | GA 計測タグ送信                                              | **載せる**                                                                  | (i) 404 着地は来訪者の検索流入経路や外部リンク切れの定量把握に直接価値があり、計測しないと「どの URL が叩かれて 404 になったか」を Search Console / GA で見られない、(ii) GA タグは body 末尾の script で軽量、layout 描画への影響は無視できる、(iii) constitution Rule 4「品質を量より優先」の観点では「404 が頻発するページを把握して修正する」ためのデータ取得は来訪者体験の改善に直接資する                                                                                                                             |
      | `<Header actions={<><StreakBadge /><ThemeToggle /></>} />`                        | サイト全体ナビ + テーマ切替/連続日数表示                     | **Header は載せる、actions は ThemeToggle のみ（StreakBadge は載せない）**  | (i) 来訪者が 404 着地後に他コンテンツへ移動する主要導線として Header ナビ（ツール / 遊び / ブログ / サイト紹介）が必要、(ii) Header は client component だが `<Link>` / 状態管理（useState） のみで Provider 依存はない（Header/index.tsx L1-L46 で確認、外部 Provider 参照なし）→ そのまま import 再利用可、(iii) ThemeToggle は ThemeProvider 配下で動作するので ThemeProvider を載せる方針と整合、(iv) StreakBadge は AchievementProvider に依存するため AchievementProvider を載せない方針と矛盾する → actions から外す |
      | `<main style={{ flex: 1 }}>{children}</main>`                                     | sticky-footer 用の main 領域                                 | **必須再現**: 同一構造で 404 のリンク群を `<main>` 内に配置                 | sticky-footer レイアウトの中央領域が main である構造を維持する                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
      | `<Footer />`                                                                      | サイト全体フッタ（リンク / 著作権 / 注意書き）               | **載せる（そのまま import 再利用可、確定）**                                | (i) 404 着地時の信頼回復のため Footer のサイト識別情報が見えるべき、(ii) **`src/components/Footer/index.tsx` を PM 本人が Read 済み（Major-5 対応）: `"use client"` 宣言なし / Provider を使用せず `next/link` の `<Link>` と内部固定の `NOTE` 定数 + `Footer.module.css` のみで構成された server component。Provider 依存はゼロ**。よって `import Footer from "@/components/Footer"` でそのまま再利用可能。スタンドアロン再実装の必要なし                                                                                  |

    - **採用ブロック確定リスト（global-not-found.js が含むもの）**: `<html lang="ja" suppressHydrationWarning>` + `<body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>` + `import "@/app/globals.css"` + `<ThemeProvider>` + `<GoogleAnalytics />` + `<Header actions={<ThemeToggle />} />` + `<main style={{ flex: 1 }}>` 配下に 404 本文（h1 + 説明 + 4 リンクカード） + `<Footer />`。
    - **採用しないブロック確定リスト**: WebSite JSON-LD、AchievementProvider、StreakBadge。
    - **`metadata` export を自前で行う**（公式 docs 例に従い `title: 'ページが見つかりません | yolos.net'` 等。description は旧 not-found.tsx L8 の文言を踏襲。Next.js は 404 ページに `<meta name="robots" content="noindex" />` を自動注入する）
    - **`next.config.ts` の `experimental.globalNotFound: true` を追加する**。本プロジェクトの `next.config.ts` は **`experimental` ブロックが現状存在しない**（next.config.ts 全文を Read 済み、`async redirects()` のみ）ため、`experimental: { globalNotFound: true }` を新規追加する形で 1 行のブロック追加となる。
    - **既存 `src/app/(legacy)/not-found.tsx` および `src/app/(legacy)/not-found.module.css` は削除する**（global-not-found に統合される）
    - **`(legacy)/__tests__/not-found.test.tsx` は新位置 `src/app/__tests__/global-not-found.test.tsx` 等に `git mv` し、import を `../global-not-found` に変更**
    - **build error 確認ゲート**: B-333-7 着手前に PM 本人で `npm run build` を走らせ、上記採用ブロック構成での global-not-found.js が build error なく compile されることを確認する（Major-2 対応）。**Footer の Provider 依存有無は B-333-1 時点で PM が `src/components/Footer/index.tsx` を Read 済みで「Provider 依存ゼロ / そのまま import 再利用可」を確定済み（Major-5 対応）**。よって本確認ゲートでは Footer 関連の条件分岐は行わず、build が通るか否かの単一基準で判定する。

- **Phase 10.2 申し送り**: legacy 削除で root layout が単一化された後は、`global-not-found.js` を通常の `app/not-found.js` へ書き換え、`experimental.globalNotFound` フラグを `next.config.ts` から削除する（後始末タスクとして申し送り）。
- **絵文字撤去後の代替表現判断（Major-4 対応: 計画段階で 1 案確定）**:
  - **大前提（Major-2 対応: 既存テスト link name 正規表現の保全）**: 旧 `(legacy)/not-found.tsx` の 4 リンクの **title 文言** と **description 文言** は **本サイクルでは変更しない**（旧本文をそのまま維持）。理由: 既存テスト `(legacy)/__tests__/not-found.test.tsx` の 2 ケースが `/トップページに戻る/` `/すぐに使える便利ツール集/` `/遊んで学べるブラウザゲーム/` `/試行錯誤ブログ/` の 4 つの link name 正規表現で description 文言に依存しており、文言変更はこれら正規表現を全件破綻させる。Phase 3 の本来スコープ（ファイル移動 + DESIGN.md 整合のためのトークン置換 + 絵文字撤去）に対し、文言改稿はスコープ越境（AP-P14）。本サイクルは絵文字 4 件の icon フィールド（旧 L16 / L22 / L28 / L34 の 4 リテラル）を撤去するだけで title / description テキストは不変とする方針を確定する。
  - 上記前提を踏まえ、DESIGN.md「絵文字禁止 / アイコン原則使わない」と整合する代替案を 4 軸で並列比較する:

    | 案                                                                                                                                      | DESIGN.md §3 整合                                                                    | 来訪者の即時判別性（M1a / M1b / 新規）                                                                                                                             | 実装コスト                                                        | Phase 4 以降との視覚一貫性                                                                            |
    | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
    | **案 1: テキストカード（アイコン枠を削除し、title + description のみで構成。タイトルを `--fg-strong`、説明文を `--fg-soft` で階層化）** | 完全整合（アイコン無し / 絵文字無し）                                                | title 文言（「すぐに使える便利ツール集」等）が直接ラベルとして機能するため、4 リンクの違いは title テキスト自体で判別可能。M1a の dislikes「迷わせるラベル」を回避 | 低（旧 CSS のトークン置換のみで済む）                             | 高（DESIGN.md §3 の「アイコン原則使わない」原則が Phase 4 以降の一覧 / トップでも貫かれる前提と整合） |
    | 案 2: Lucide 系線画アイコン（ホーム / ツール / プレイ / ブログ）                                                                        | 部分整合（DESIGN.md §3「どうしても必要な場合は Lucide スタイル」を許容ラインで踏む） | アイコン 4 種を視覚的に区別する負荷が増え、初見の来訪者には「アイコンが何を指すか」の解釈ステップが追加される                                                      | 中（Lucide パッケージの新規導入有無確認 + 4 アイコン選定 + 実装） | 中（Phase 4 以降で他のナビにも一貫してアイコンを使うかを別途決める必要あり、判断が前倒しで発生する）  |
    | 案 3: 番号や記号の小さなラベル（「01 / 02 / 03 / 04」等）                                                                               | 整合                                                                                 | 番号は 4 リンクの並び順を示すだけで、リンク先の内容を示さないため、判別性は title 文言に完全依存（番号の追加価値なし）                                             | 低                                                                | 低（番号ラベルは他ページに登場しないため一過性の表現になり、視覚一貫性に寄与しない）                  |

  - **採用案: 案 1（テキストカード、アイコン枠を削除）**
  - **判断根拠**: (i) DESIGN.md §3「アイコン原則使わない / 絵文字禁止」と完全整合する唯一の案、(ii) title 文言がリンクラベルとして直接機能し M1a / M1b / 新規来訪者すべてに対し判別性を維持できる、(iii) 旧テストの link name 正規表現を破綻させない（title 文言不変 + description 文言不変の方針と整合）、(iv) Phase 4 以降の一覧 / トップで「アイコンを使わない」前提が貫かれる場合に視覚一貫性を最大化する。
  - **不採用 2 案の却下理由**:
    - 案 2 不採用: Lucide アイコン導入は DESIGN.md §3 の「どうしても必要な場合」のラインを 404 ページで突破する正当化が弱い（404 はナビが既に Header に存在し、本文の 4 リンクは title 文言だけで判別可能なため「どうしても必要」に該当しない）。Phase 4 以降のナビ全体のアイコン使用方針を 404 ページの判断で前倒し決定するのは AP-P14（条項追加で安心）の同型構造。
    - 案 3 不採用: 番号ラベルは判別性に寄与せず、視覚一貫性も低い（他ページで番号ラベル UI が登場しないため一過性の表現）。

- **成果物**: 本セクション直下に「not-found 配置結論: (γ'') 採用 + 根拠（既に上に明記）」「not-found 視覚案判断: 案 1（テキストカード）採用 + 根拠 + 不採用案の却下理由」を明記し、B-333-7 の前提として渡す。
- **依存**: B-333-1 完了後。B-333-2 とは独立に並行可能。
- **委譲可否**: PM 本人責務（DESIGN.md 整合判断と Next.js 特殊ファイル仕様の確認は PM が責任を持つ）。配置 (γ'') は計画段階で確定済みのため execution PM は再判断しない。視覚案のみ B-333-1 内在化後に PM が確定する。**ただし B-333-7 着手前に PM 本人で `npm run build` を走らせ、`global-not-found.js` が build error なく compile されることを確認する判断ゲートを本タスク内に置く**（実機検証で動かなかった場合の事後対処を builder に丸投げしない）。

#### B-333-4: 3.2 リダイレクト 5 ルートの `(new)/` 配下への一括移動（builder 委譲可、1 コミット）

- **目的**: `/memos`、`/memos/[id]`、`/memos/feed`、`/memos/feed/atom`、`/memos/thread/[id]` を `(new)/memos/` 配下に丸ごと移動する。UI / デザイン作業は一切しない（design-migration-plan.md L99「リダイレクトのみのため UI 移行はなく、ディレクトリを `(new)/` へ移すだけ」）。
- **内容**:
  - `git mv src/app/(legacy)/memos src/app/(new)/memos`
  - 内部 import パスは `@/` エイリアスを使っているため変更不要のはずだが、grep で `@/app/(legacy)/memos` 参照が他ファイルにないか念のため確認し、あれば修正。
  - 既存テスト 2 ファイル（`(legacy)/memos/__tests__/memos-redirect.test.ts` **8 テスト** + `(legacy)/memos/feed/__tests__/memo-feed.test.ts` 4 テスト）が新位置（`(new)/memos/__tests__/memos-redirect.test.ts` および `(new)/memos/feed/__tests__/memo-feed.test.ts`）で pass することを確認（B-333-1 ファクトチェック完了テーブルが真実源）。
  - `force-static` / `force-dynamic` の export が新位置でも機能することを `npm run build` で確認（`/memos`・`/memos/feed`・`/memos/feed/atom` が静的生成、`/memos/[id]`・`/memos/thread/[id]` が dynamic として認識）。
- **成果物**: 5 ルート分のディレクトリ移動を含む 1 コミット。コミットメッセージは「移行計画 Phase 3.2: /memos 系を (new)/ 配下へ移動」など。
- **依存**: B-333-1 完了後。B-333-5 / 6 / 7 / 8 と並行実施可（互いに独立）。
- **委譲可否**: builder 委譲可。判断は伴わず機械的作業。
- **検証**: テスト pass + curl で `/memos` → 301 GitHub URL、`/memos/feed` → 410、`/memos/feed/atom` → 410 を確認。

#### B-333-5: 3.1 `/about` 1 ページ移行（builder 委譲可、1 コミット）

- **目的**: `/about` を `(new)/about/` に移し、DESIGN.md に従って新デザインに仕上げる。
- **内容**: 標準手順 1〜9 を当該ページに適用。
  1. 依存確認: B-333-1 / B-333-2 / B-333-2a（TrustLevelBadge 共通化コミット）が完了済み。
  2. `git mv src/app/(legacy)/about src/app/(new)/about`
  3. import パス修正: `@/components/common/TrustLevelBadge` を B-333-2 判断結果（A: `@/components/TrustLevelBadge`）に従って修正。
  4. `page.module.css` のトークン置換 + `:global(:root.dark)` 修正（CSS Modules §1）。
  5. DESIGN.md に従ってレイアウト・タイポ・状態・a11y を再設計。OGP 画像は新規作成しない（Phase 3 のスコープ外）。
  6. （Phase 7 のみ）— 該当なし。
  7. 既存テストの調整: `(legacy)/about/__tests__/page.test.tsx` を新位置 `(new)/about/__tests__/page.test.tsx` として `git mv` し、import パスや relative path 参照を新位置に合わせて修正、新位置で pass させる。
  8. Playwright で w360 / w1280 のライト / ダークを撮影し旧と比較。
  9. 1 コミット。
  - **追加責務（このコミットに含める。並行禁止理由は選択肢 X 参照）**:
    - `src/app/sitemap.ts` の `import { ABOUT_LAST_MODIFIED } from "@/app/(legacy)/about/meta";` を `@/app/(new)/about/meta` に書き換える。`sitemap.ts` の他 3 行（PRIVACY / ACHIEVEMENTS / DAILY_FORTUNE）は本コミットでは触らない。
    - `(legacy)/__tests__/sitemap.test.ts` L9 の `import { ABOUT_LAST_MODIFIED } from "@/app/(legacy)/about/meta";` を `@/app/(new)/about/meta` に書き換える。
    - `(legacy)/__tests__/seo-coverage.test.ts` L107-L108 の `import("@/app/(legacy)/about/page")` を `import("@/app/(new)/about/page")` に書き換える。
    - **本文「実績システム」セクション（about/page.tsx L78-L106 相当）の `<strong>` 3 件の扱い（Critical-1 確定方針）**: PM 本人が `grep -nE '<(strong|em|b)([> ])' src/app/(legacy)/{about,privacy,not-found}.tsx` 相当の確認を行い、実体を以下に確定した:
      - `(legacy)/about/page.tsx` L84 `<strong>連続日数（ストリーク）</strong>`
      - `(legacy)/about/page.tsx` L88 `<strong>探索バッジ</strong>`
      - `(legacy)/about/page.tsx` L92 `<strong>やりこみバッジ</strong>`
      - `(legacy)/privacy/page.tsx`: `<strong>` `<em>` `<b>` 0 件
      - `(legacy)/not-found.tsx`: `<strong>` `<em>` `<b>` 0 件
    - **構造の現状把握**: 該当箇所は `<ul><li><strong>項目名</strong>: 説明文</li>...</ul>` のパターンで、項目名 + 説明という **用語定義リスト的な構造**。
    - **比較対象 5 案の並列検討（Major-3 対応）**:

      | 案                                                                                                                   | DESIGN.md §3 整合                                 | セマンティクス（用語定義の意味伝達）                                                                                                                                                                                           | 視覚的な項目名強調                                                                                                                                               | 実装コスト / 後続 Phase 影響                                                                                                                               |
      | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
      | **(a) `<strong>` → `<em>` 置換**                                                                                     | 整合（§3「本文中太字禁止」回避、`<em>` は対象外） | 弱（`<em>` は本来「強調」の意味で「用語定義」とは厳密には異なるが、HTML5 仕様上「重要さ / 強調 / 別系列」で許容範囲）                                                                                                          | 中（日本語環境でデフォルト italic は視覚的に弱い。`font-style: normal` + 別の視覚表現＜例: 色 `--fg-strong` または letter-spacing＞を CSS 側で付与する必要あり） | 低（タグ書き換え 3 箇所 + 必要なら `<em>` 用 CSS rule 追加）                                                                                               |
      | (c) `<dl><dt><dd>` 構造化                                                                                            | 整合                                              | 強（HTML5 「`<dl>`: 用語と値のグループ」「`<dt>`: 用語名」「`<dd>`: 用語の説明」が用語定義リストとして仕様完全合致）                                                                                                           | 強（`<dt>` は CSS で自由にスタイリング可能、太字を使わずとも色 / サイズで強調可）                                                                                | 中〜高（`<ul><li>` 全体を `<dl>` 構造に書き換え。CSS Modules でも layout 調整が必要。テスト assertions が `<ul>` / `<li>` を前提にしている場合は追従修正） |
      | (d) `<strong>` 撤去 + コロン強調除去（平文化）                                                                       | 整合                                              | 弱（項目名と説明文の境界が文構造のみに委ねられ、用語定義のセマンティクスが消失）                                                                                                                                               | なし（読者は項目を見出しとして識別できなくなる）                                                                                                                 | 低                                                                                                                                                         |
      | (e) サブ見出し化（各項目を `<h4>連続日数（ストリーク）</h4><p>毎日サイトを使うと...</p>` のように見出し + 段落構造） | 整合                                              | 中（見出しレベルとして適切なら強、ただし `<h4>` は「見出し階層の連続性」を要求するため `<h2>実績システム` 配下に直接 `<h4>` を置くと heading skip となる。`<h3>` を使うと既存の他セクションの heading 構造との整合確認が必要） | 強（見出しスタイルで自由に強調可）                                                                                                                               | 中（heading 構造の整合を全 about ページで確認する必要があり、Phase 3 のスコープ越境リスク）                                                                |
      | (f) `<strong>` 維持（DESIGN.md 違反を Phase 8.1 へ申し送り）                                                         | 不整合                                            | 強                                                                                                                                                                                                                             | 強                                                                                                                                                               | 低（変更なし）                                                                                                                                             |

    - **採用案: (a) `<strong>` → `<em>` 置換**
    - **判断根拠**:
      - (i) DESIGN.md L55「本文中での太字は原則として使わない」違反を Phase 3 完了基準「DESIGN.md 整合（移行後 3 ページで充足）」の中に閉じ込められる
      - (ii) `<strong>` → `<em>` への置換は本文構造の改稿（節構成・語順・主張の追加削除）に該当せず、Phase 3 のスコープ純度を保てる
      - (iii) Phase 8.1（B-355）で `/about` の構成見直しが入った場合でも、`<em>` のままで通用する
      - (iv) **日本語の `<em>` italic 弱さ問題への対応**: about page.module.css に `em { font-style: normal; color: var(--fg-strong); }` 相当の rule を追加して「色による項目名強調」に置き換える（DESIGN.md §2 の `--fg-strong` トークンを使用、太字は使わないため §3 違反にならない）。これは案 (a) 採用の不可分の付随作業として B-333-5 builder への指示に明記する
    - **不採用案の却下理由**:
      - (c) 不採用: `<dl><dt><dd>` は意味論的に最適だが、`<ul><li>` から `<dl>` への構造変更は本文構造の書き換えに該当し Phase 3 のスコープ越境（AP-P14 同型）。Phase 8.1 で構成見直しが入る際に `<dl>` 化を含めて再検討する余地を残し、Phase 3 では機械的なタグ置換のみに留める
      - (d) 不採用: 項目名と説明文の境界が消失し、来訪者の読解負荷が増える。M1b dislikes「以前と同じ入力なのに結果や挙動が前回と変わっていること」に近い体験劣化（旧版で項目名が強調されていた箇所が平文化される視覚変化）
      - (e) 不採用: heading 構造の整合確認が about ページ全体に波及し Phase 3 のスコープ越境。Phase 8.1 の構成見直しで heading 階層全体を再設計するときに合わせて検討すべき
      - (f) 不採用: DESIGN.md 違反を本サイクル完了後も新側 (new)/about に残し、Phase 4 以降のページが移行されるたびに「(new) 配下なのに DESIGN.md 違反」という混在状態が長期化。Phase 8.1 の着手時期も未確定のため、申し送り依存にすると違反が数サイクル放置されるリスクが高い
    - **本文の構造変更（節構成・段落の改稿）は行わない**。書き換え対象は `<strong>...</strong>` → `<em>...</em>` の 3 箇所のタグ置換 + about page.module.css への `em { font-style: normal; color: var(--fg-strong); }` 相当 rule の追加のみ（テキスト内容は変えない、`<ul><li>` 構造は維持）。Phase 8.1 PM への申し送りに「`/about` 本文の『実績システム』節は (new) layout の StreakBadge と整合する形での書き換え余地（`<dl>` 構造化、heading 化を含む）がある（Phase 3 では構造変更を行わずタグ置換 + CSS 補正のみ実施済み）」と記載する。

  - **`(legacy)/__tests__/` 配下の他のテスト**（globals-css-dialog / metadata / page-module-css-a11y / page / public-static-assets / section-layouts / not-found）は本コミットでは変更しない（`(legacy)` 全体を対象とした検査であり、(legacy)/about の移動とは独立に成立する）。

- **成果物**: 1 コミット + Playwright スクショ（`./tmp/` 配下）+ 視覚確認結果メモ + sitemap before/after diff（次タスク B-333-9 用に `./tmp/sitemap-after-about.xml` を保存）。
- **依存**: B-333-1 + B-333-2 + B-333-2a 完了後。**B-333-6 とは sitemap.ts および (legacy)/**tests**/sitemap.test.ts の同時編集が衝突するため逐次（B-333-5 → B-333-6 の順、または PM が sitemap.ts / sitemap.test.ts の 2 ファイルだけ先に別コミットで一括書き換えてから両者を並行）**。B-333-4 / 7 / 8 とは並行可。
- **委譲可否**: builder 委譲可（B-333-2 で判断済みの方針に従う機械的作業）。

#### B-333-6: 3.1 `/privacy` 1 ページ移行（OGP 画像同梱）（builder 委譲可、1 コミット）

- **目的**: `/privacy` を `(new)/privacy/` に移し、DESIGN.md に従って新デザインに仕上げる。`opengraph-image.tsx` と `twitter-image.tsx` も同時に移動。
- **内容**: B-333-5 と同様の標準手順を適用 + 以下の差分:
  - `git mv` で `opengraph-image.tsx` / `twitter-image.tsx` も同梱して移動。OGP 画像のフォントや色も DESIGN.md 整合を確認（旧トークンを使っていれば置換）。
  - 既存テスト 5 ケース（`(legacy)/privacy/__tests__/page.test.tsx`）を `(new)/privacy/__tests__/page.test.tsx` として `git mv` し新位置で pass させる。
  - sitemap.ts の `PRIVACY_LAST_MODIFIED` import パスを `@/app/(new)/privacy/meta` に書き換え。
  - **`(legacy)/__tests__/seo-coverage.test.ts` に privacy への直書き参照は無いことを B-333-1 で確認済み**。あるとすれば `seo-coverage.test.ts` 等にあるため、B-333-6 着手時に再 grep を行い、見つかれば本コミットで一緒に書き換える。
  - TrustLevelBadge の扱いは B-333-2 判断結果（A）に従う。
- **成果物**: 1 コミット + Playwright スクショ + 視覚確認結果メモ + OGP 画像のレンダリング確認（`/privacy/opengraph-image` / `/privacy/twitter-image` の URL を curl で取得し画像が返ること）+ sitemap diff（`./tmp/sitemap-after-privacy.xml`）。
- **依存**: B-333-1 + B-333-2 + B-333-2a 完了後。**B-333-5 と sitemap.ts および (legacy) `__tests__` 配下の同時編集が衝突するため逐次（B-333-5 → B-333-6 の順、または PM が sitemap.ts / sitemap.test.ts の同時書き換えを別コミットで先行）**。B-333-4 / 7 / 8 と並行可。
- **委譲可否**: builder 委譲可。

#### B-333-7: 3.1 `/not-found` 1 ページ移行（B-333-3 の判断結果を前提に `global-not-found.js` 新規作成 + 絵文字撤去 + 新トークン化）（builder 委譲可、1 コミット）

- **目的**: not-found を B-333-3 で確定した配置（**(γ'') = `src/app/global-not-found.js` + `next.config.ts` の `experimental.globalNotFound: true`**）と視覚案に従って新デザインに仕上げる。絵文字 4 種を撤去し、旧トークン参照を全廃する。
- **前提**: B-333-3 内で PM が `npm run build` を実行し、`global-not-found.js` の最小スケルトン（`<html>`/`<body>` のみ）が build error なく compile されることを確認済み（B-333-3 委譲可否に明記の判断ゲート）。
- **内容**:
  - **`next.config.ts` の更新**: `experimental.globalNotFound: true` を追加する。既存 experimental フラグがある場合は merge する。
  - **`src/app/global-not-found.js` の新規作成**:
    - 公式 docs 例に従い、ファイル先頭で global styles を import（`@/app/globals.css` 等、`(new)/layout.tsx` が import している global CSS と同等のものを **明示的に再 import**。global-not-found は normal rendering を bypass するため layout の import チェーンに乗らない）
    - `<html lang="ja" suppressHydrationWarning>` および `<body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>` を **手動で** 出力する。`(new)/layout.tsx` が出力している `<html>`/`<body>` 構造（class、attribute）を **手動で再現** する。**Header (`@/components/Header`)・Footer (`@/components/Footer`) は B-333-1 / B-333-3 で PM が Provider 依存なし（Footer は server component / Header は client だが Provider 非依存）を確定済みのため、そのまま import 再利用する**（Major-5 対応: スタンドアロン再実装の判断分岐は B-333-3 確定済みのため B-333-7 builder では発生しない）。Header の `actions` プロップには `<ThemeToggle />` のみ渡す（B-333-3 確定: StreakBadge は AchievementProvider 不在のため除外）
    - `metadata` export を行う。**旧 `(legacy)/not-found.tsx` L7-L9 の `metadata` をそのまま再現する**（`title: \`ページが見つかりません | ${SITE_NAME}\``/`description: 'お探しのページは見つかりませんでした。'`）。来訪者が見るタブタイトルが旧と異なるとブラウザ履歴・タブ間の継続性が壊れ M1b 不変項に違反するため、文言は旧値を完全に維持する（R5 Minor-4 対応）。なお Next.js は 404 ページに `<meta name="robots" content="noindex" />` を自動注入する
  - **`global-not-found.js` の本文（404 リンク群）（Major-2 / Major-4 対応: 計画段階で確定済み）**:
    - 旧 `(legacy)/not-found.tsx` の 4 リンク（トップ / ツール / プレイ / ブログ）の構造をベースに、**B-333-3 確定の案 1（テキストカード）に従って絵文字リテラル 4 件（旧ファイル L16 / L22 / L28 / L34 の icon フィールド）を撤去する**。**title 文言（「トップページに戻る」「すぐに使える便利ツール集」「遊んで学べるブラウザゲーム」「試行錯誤ブログ」）と description 文言は不変**（旧本文をそのまま維持）
    - 既存テスト `(legacy)/__tests__/not-found.test.tsx` の 2 ケースが `getByRole("link", { name: /.../ })` で 4 リンクの description 文言に依存しており、B-333-3 確定方針に従い文言を変更しないため、テスト本体の正規表現も**変更不要**（移動先の `src/app/__tests__/global-not-found.test.tsx` で正規表現は不変のまま pass する想定）
    - 万が一 builder 段階で title / description 文言を変更する必要が判明した場合は、その時点で本計画書を更新し PM 承認を得てから実装する（builder 単独判断による文言変更は禁止）
  - **CSS の扱い**: `(legacy)/not-found.module.css` を `src/app/global-not-found.module.css` として `git mv` し、トークン置換 + `:global(:root.dark)` 修正（CSS Modules §1）。
  - **既存ファイルの削除**: `(legacy)/not-found.tsx` を削除（global-not-found に統合済み）。**`(new)/not-found.tsx` も `(new)/global-not-found.js` も作らない**（重複配置は B-333-3 結論に反する。global-not-found は app 直下にしか置けない）。
  - **既存テストの移動**: `(legacy)/__tests__/not-found.test.tsx`（**2 ケース**、Major-1 対応）を **`src/app/__tests__/global-not-found.test.tsx`** に `git mv`。`import NotFound from "../not-found"` を `import GlobalNotFound from "../global-not-found"` に書き換え。**`getByRole("link", { name: ... })` の正規表現は B-333-3 確定の文言不変方針に従い変更不要**（4 リンクの title / description 文言を維持するため）。`(legacy)/__tests__/` 直下に他に not-found を参照するテストが無いことを B-333-1 で確認済み（無い前提）。
  - DESIGN.md「絵文字禁止」「アイコン原則使わない」「タップターゲット 44px」「focus-visible」「コントラスト 4.5:1」を満たすことを確認。
  - **実機検証**: production build を立ち上げ、(i) `/foo-bar-baz-xyz` などの (new) 配下に存在しない URL、(ii) `/about/不存在` などの (legacy) 配下のタイポ URL、(iii) `/memos/不存在` などの一般的なタイポ URL の 3 種で新 global-not-found が 404 で表示されることを実機 curl + Playwright で確認する。実機確認は dev サーバーではなく `npm run build && npm start` の production build で行う（`docs/knowledge/nextjs.md` §1, §8 準拠）。
- **成果物**: 1 コミット + Playwright スクショ（存在しない URL 3 種でアクセスして表示）+ 視覚確認結果メモ + 実機検証結果（curl ステータスコード + Playwright DOM snapshot + `<html>`/`<body>` が想定通り出力されていることの確認）。
- **依存**: B-333-1 + B-333-3 完了後。他のサブタスクと並行可。
- **委譲可否**: builder 委譲可（配置・視覚案の判断は B-333-3 で済んでおり、build error 確認も B-333-3 内で完了している）。

#### B-333-8: 3.1 `/feed`・`/feed/atom`（Route Handler 2 本）の `(new)/` 配下への移動（builder 委譲可、1 コミット）

- **目的**: RSS / Atom フィードの Route Handler を `(new)/feed/` 配下に移動する。XML 出力 **および HTTP レスポンスヘッダ** を一切変更しない（M1b 不変項）。
- **内容**:
  - `git mv src/app/(legacy)/feed src/app/(new)/feed`（テストディレクトリ `feed/__tests__/` も同梱で移動）。
  - `force-static` の export と `Cache-Control: public, max-age=3600, s-maxage=3600` ヘッダの設定が新位置でも維持されることを `npm run build` 出力で確認。
  - 既存テスト 8 ケース（`feed/__tests__/feed.test.ts`）を新位置で pass させる（B-333-1 ファクトチェック完了テーブルが真実源）。
  - **production build 出力ファイルパスの差分確認**: `npm run build` 後の `.next/server/app/` 配下から feed 関連ファイルパスをリストアップし、B-333-1 で取得した `./tmp/build-paths-before.txt` と diff。Route Group は URL に出ないため出力パス（`.next/server/app/feed/...`）も不変であることを確認する。差異があれば本コミットで原因を特定。
  - production build を立ち上げ curl で `/feed` と `/feed/atom` を取得し、(i) **XML 本文** が `./tmp/feed-before.xml` / `./tmp/feed-atom-before.xml` と完全一致（`diff` で 0 行差分）、(ii) **HTTP レスポンスヘッダ** を B-333-1 で確定した allow-list（`./tmp/feed-headers-allowlist.md`）に従って分類比較する: 「完全一致を要求」群（`Content-Type`、`Cache-Control` 等）が `./tmp/feed-headers-before.txt` / `./tmp/feed-atom-headers-before.txt` と一致 / 「意味的同等」群（`Last-Modified`、`ETag`）は差分があれば原因を特定して説明 / 「除外」群（`Date`、`X-Nextjs-*` 系等）は比較対象外、を `curl -D -` で確認する。
- **成果物**: 1 コミット + curl 結果の比較メモ（本文 diff + ヘッダ diff + build 出力パス diff の 3 種、`./tmp/` 配下に保存）。
- **依存**: B-333-1 完了後。他と並行可（sitemap.ts は触らないため B-333-5 / 6 と独立）。
- **委譲可否**: builder 委譲可。UI / デザイン作業なし、機械的移動のみ。

#### B-333-9: 統合検証（Phase 3 完了基準の充足確認）と独立 reviewer によるレビュー

- **目的**: 上記サブタスク完了後に、Phase 3 完了基準（design-migration-plan.md L102「すべての URL が `(new)/` 配下で動作。`(legacy)/` には残らず、Playwright 視覚確認で旧と同等以上の見た目と動作」）と本サイクル独自の検証項目を満たすことを統合確認し、独立 reviewer のレビューを受ける。
- **内容**:
  - **構造検証**: `ls src/app/(legacy)/` を実行し about / privacy / not-found / feed / memos が **存在しない** ことを確認。`grep -rE "@/app/\\(legacy\\)/(about|privacy|feed|memos)" src/` を実行し残存参照ゼロを確認。**`grep` のキーワードに achievements / play/daily を含めない**（これらは Phase 3 のスコープ外であり、`sitemap.ts` から `@/app/(legacy)/achievements/meta` および `@/app/(legacy)/play/daily/meta` を意図的に残す。検証手順を惑わせないよう本検証では除外）。
  - **構造ねじれの可視化（Major-4 対応）**: `(legacy)/__tests__/` 配下のテストファイルが `@/app/(new)/...` を import している件数を `grep -rln "@/app/(new)/" src/app/(legacy)/__tests__/ | wc -l` および各ファイルでの参照行数を `grep -rn "@/app/(new)/" src/app/(legacy)/__tests__/ | wc -l` で集計し、`./tmp/cross-group-import-count.md` に記録する。Phase 3 完了時点では本サイクルで意図的に書き換えた 3 件（sitemap.test.ts L9、seo-coverage.test.ts L107-L108、加えて B-333-6 で privacy 関連が見つかれば追加）が含まれている想定。Phase 4 以降のサイクルが進むにつれてこの数が増えていくため、定点観測として記録する。
  - **二重 layout / metadata 競合検証**: `(new)/` 配下の各ページが (new) layout を 1 回だけ通り、(legacy) layout が走らないことを Playwright DOM ダンプで確認（Header / Footer の DOM が 1 セットだけであること、`<html>` の class や `<body>` style が二重適用されないこと、`<title>` / `<meta>` が重複しないこと）。
  - **sitemap 検証（強化）**: `npm run build` 後の `app/sitemap.xml` を `./tmp/sitemap-after.xml` として保存し、B-333-1 で取得した `./tmp/sitemap-before.xml` と diff。**完全な URL リスト diff** + **lastModified diff** を全件で取り、変更ゼロ（about / privacy 含めて全 URL の lastModified が不変、URL 数が不変）であることを確認。差異があれば achievements / play/daily 等の意図せざる破壊を疑う。
  - **Route Handler 検証（ヘッダ allow-list 基準の diff 含む）**: production build を立ち上げ curl で以下を確認。HTTP レスポンスヘッダは B-333-1 で確定した allow-list（`./tmp/feed-headers-allowlist.md`）の 3 分類（完全一致要求 / 意味的同等 / 除外）に従って判定する:
    - `/feed` → 200, `Content-Type: application/rss+xml; charset=utf-8`, XML 本文が `./tmp/feed-before.xml` と完全一致（diff 0）、「完全一致要求」群が `./tmp/feed-headers-before.txt` と一致、「意味的同等」群は差分があれば原因説明
    - `/feed/atom` → 200, Atom XML, XML 本文が `./tmp/feed-atom-before.xml` と完全一致、ヘッダ判定は `/feed` と同じ基準
    - `/memos` → 301, Location が GitHub URL
    - `/memos/feed` → 410
    - `/memos/feed/atom` → 410
    - `/memos/abc` → 301, Location が想定 URL
    - `/memos/thread/abc` → 301
  - **production build 出力パス diff（Minor-3 対応）**: `.next/server/app/` 配下のファイルパスを `./tmp/build-paths-after.txt` として保存し、`./tmp/build-paths-before.txt` と diff。`.next/server/app/` 配下全件のパスリスト diff を取り、(i) Phase 3 対象 10 ルート（about / privacy / not-found / feed / feed/atom / memos / memos/[id] / memos/feed / memos/feed/atom / memos/thread/[id]）のみが (legacy)/ → (new)/ への配置変更に伴う変動（または not-found の場合は (legacy)/ → root 直下への変動）を起こしている、(ii) 上記以外のルートの出力パスは不変、を確認する。Route Group 自体は URL に出ないため出力 URL は変わらないが、内部生成パスの構造が `.next/server/app/(legacy)/...` から `.next/server/app/(new)/...` へ動く可能性は許容（事前に Next.js のビルド挙動を確認した上で、想定外の変動が他ルートに波及していないことを確認する）。
  - **視覚検証（チェックリスト化）**: Playwright で about / privacy / not-found を w360 / w1280 のライト / ダークで撮影し、以下のチェックリストで「同等以上」を判定する（Phase 4 以降でも再利用可能な定型基準）:
    - (i) ヒーロー領域の見出しが旧版と同等以上のコントラストで読める（WCAG 4.5:1）
    - (ii) 主要リンク群（about: なし / privacy: なし / not-found: 4 リンク）のタップターゲットが 44x44px 以上
    - (iii) フォーカス可視リング（focus-visible）が全 interactive 要素に適用されている
    - (iv) ダーク / ライト切替で全要素のコントラスト維持
    - (v) Header / Footer の `aria-current` が想定通り
    - (vi) 旧版にあった主要セクションが新版でも維持されている（about の「サイトについて」と「実績システム」、privacy の各条項、not-found の主要 4 リンク）。**ただし Phase 8.1（B-355）の判断結果を待つ余地のある項目（about の「実績システム」節など、後続サイクルで撤去・改稿が予定されている可能性のある節）は「存在する / しない」ではなく「Phase 3 で改変していない（旧本文の構造をトークン置換のみで維持している）」ことを基準とする**（Major-5 対応。B-333-5 追加責務の「実績システム節は本サイクルでは旧本文をそのまま維持」と整合）
    - (vii) 改行や折り返しが破綻していない（特に w360）
    - 上記のいずれかが旧版より劣化していたら「同等以上」を満たさないと判定する。
  - **動線検証**: Header / Footer のリンクから about / privacy / not-found へ遷移し、戻る・進むで (legacy) 配下の他ページ（移行未着手）と (new) 配下を行き来して破綻がないことを確認（design-migration-plan.md L332-L336「段階的移行の整合性確認」）。
  - **テスト / lint / build**: `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功することを確認。
  - **アンチパターン回避確認**: AP-I07 / AP-I08 / AP-I09（implementation.md）に該当する状態がないことを確認。**加えて Phase 3 はファイル移動 + デザイン適用が混在するため、AP-I02（オプショナルプロパティ追加や個別ハードコードでの問題回避を行っていないか）と AP-WF11（複数の整合する必要のあるファイル — `(legacy)/layout.tsx` と `(new)/layout.tsx`、共通コンポーネント新旧版、metadata と sitemap 等 — を並べて差分を読み合わせる手順を取ったか）を独立に確認する**（Minor-3 対応）。とくに B-333-2a の新旧 TrustLevelBadge、B-333-7 の新 global-not-found.js と (new)/layout.tsx は AP-WF11 の対象として PM が並べて読み合わせる手順を踏む。
  - **独立 reviewer レビュー**: 別サブエージェントに作業計画 + 実装結果のレビューを依頼。指摘事項は本ファイル「## レビュー結果」に記録し、Critical / Major が無くなるまで対応。
- **成果物**: 検証結果サマリ（本ファイル下部または `./tmp/` の作業ノート）、レビュー結果（「## レビュー結果」セクション）。
- **依存**: B-333-4〜B-333-8 完了後。
- **委譲可否**: 検証実施は独立サブエージェント主導（Playwright / curl / lint / build を実行する役割）。レビューは別サブエージェント。PM は統合判定と申し送り作成を担う。

### 検討した他の選択肢と判断理由

#### 選択肢 X: 3.1 と 3.2 をすべて並行実施する（旧案）

旧案では「sitemap.ts の import 行が物理的に異なる行のため衝突しない」と書いていたが、これは git の実体感と異なる。隣接 import 文の同時変更や、`(legacy)/__tests__/sitemap.test.ts` の同一ファイル編集（B-333-5 と B-333-6 の両方が `ABOUT_LAST_MODIFIED` / `PRIVACY_LAST_MODIFIED` を書き換える可能性）は容易にコンフリクトを生む。**判断: 並行実施は限定的に行う**。

**「並行可」の意味の定義（Major-6 対応）**: 本計画書で「並行可」と書く場合、以下 2 つの意味を区別する:

- **(A) 依存関係上 並行起動可能**: タスク同士に直接的な依存がなく、計画上の順序として同時に着手してよいという意味。これは「コミットログ上で 2 つのタスクが連続して並ぶ」「片方の完了を待たずにもう片方を起動できる」のみを保証する。
- **(B) 実環境で同時実行して安全**: 複数 builder サブエージェントが **同一作業ディレクトリ / 同一プロセス空間** で同時に作業しても、`.next/` 共有や port 競合などのインフラ衝突を起こさないという意味。

**本計画書の (A) と (B) の現実的制約**:

- 本リポジトリは単一の作業ディレクトリ（`/mnt/data/yolo-web`）を共有しており、`.next/` ディレクトリ・dev サーバー port (3000)・production サーバー port (3000)・Playwright ブラウザ実行環境を builder 間で **共有** している。
- そのため (A) を満たす複数タスクであっても、同時に `npm run build` / `npm start` / Playwright を起動すると、(i) `.next/` の partial write 衝突、(ii) port 3000 競合、(iii) Playwright のヘッドレスブラウザのリソース競合 を起こす。
- **運用ルール**: 本計画書中の「並行可」は (A) の意味とする。実行ポリシーは以下:
  - **(i) 並行起動は最大 1 ペアまで**（builder 2 並列を上限とする。3 並列以上は port / `.next/` 競合のリスクが急増するため許容しない）
  - **(ii) `npm run build` / `npm start` / Playwright の起動は逐次**（並列起動禁止。1 ペアの builder 同士でも、ビルドフェーズと検証フェーズに入った時点で他方の完了を待つか、片方が `npm` コマンド実行中はもう片方は編集作業のみに留める）
  - **(iii) 1 builder = 1 コミットのコミットログ保全**（複数タスクのコミットを混ぜない。並列実行する場合も、各 builder は自分のタスクの変更だけをステージングしてコミットする）
  - **(iv) PM はサブエージェント起動時に上記 3 制約を明示的に渡す**（builder への委譲指示書に「並列実行ペアは X と Y、`npm run build` は X 完了後に Y が単独で実行」のように具体記述する）

**並行可否マトリクス（B-333-1 / 2 / 2a / 3 完了後の B-333-4〜8 についての (A) 意味の依存関係）**:

- **逐次必須**: B-333-5（about）と B-333-6（privacy）は、`src/app/sitemap.ts` および `(legacy)/__tests__/sitemap.test.ts` の **同時編集対象が共通** のため逐次（B-333-5 → B-333-6 の順）。あるいは PM が先に sitemap.ts と sitemap.test.ts の 2 行（about + privacy）の import パス書き換えだけ別コミットで一括処理してから、B-333-5 / B-333-6 を並行起動する。
- **(A) 並行起動可（実行は上記運用ルール準拠）**: B-333-4（memos）、B-333-7（not-found / root 配置のため sitemap.ts 不変）、B-333-8（feed / sitemap.ts 不変）は sitemap.ts を触らないため、互いに、また B-333-5 / 6 の進行中とも依存関係上は並行起動可能。ただし上記運用ルール (i)〜(iv) に従い、同時起動は最大 2 builder までとし、`npm` コマンド実行は逐次化する。
- **B-333-2a（TrustLevelBadge 共通化コミット）は B-333-5 / 6 の前提**: B-333-5 / 6 は新 TrustLevelBadge を import するため、B-333-2a 完了が両者の起動条件。

#### 選択肢 Y: TrustLevelBadge を共通化（A）に決め打ちで計画書に書く（Major-1 を踏まえて再記述）

旧案では「Phase 4-8 で必須になるため計画段階で確定」を正当化に使っていたが、これは Phase 3 のスコープを「将来の効率」のために越境する論法であり、AP-P11（投機的拡張）の同型構造に陥る。**正当化を以下に差し替える**:

- (legacy)/about/page.tsx および (legacy)/privacy/page.tsx は `@/components/common/TrustLevelBadge` を import しており、これは旧トークンでスタイリングされている。
- B-333-5 / 6 は約束 (new)/ への移動と新トークン化を Phase 3 完了基準として求める（design-migration-plan.md L91、L102）。
- 旧 TrustLevelBadge を import 続けると、ページ本文だけ新トークン化しても **Badge 部分だけ旧トークンの色が残り**、ページ全体としては DESIGN.md 整合を主張できない。
- したがって B-333-2a は「Phase 3 で about/privacy に新トークンを適用するための不可分の前提作業」であり、「Phase 4-8 で必須になるから先取りする」投機的拡張ではない。
- (legacy) 配下 10+ 既存利用箇所への波及を避けるため、shim re-export ではなく **別パスで併存** する形（B-333-2a の選択肢 b）を採用する。Phase 4-8 で各ページが (new) に移る際、本来のサイクルで個別に新版へ切り替える機会を残す。

#### 選択肢 Z: not-found の絵文字撤去判断を後続サイクルに送る

「絵文字撤去は Phase 3 のスコープに入っていない」と読む余地もある。しかし `(legacy)/not-found.tsx` をそのまま `(new)/` に移動すると DESIGN.md「絵文字禁止」違反のページが新側に紛れ込み、Phase 4 以降の Header / Footer / 一覧との一貫性が崩れる。**判断: 絵文字撤去 + 新トークン置換は Phase 3 で同時に行う**（design-migration-plan.md L298 の標準手順「DESIGN.md に従ったデザイン適用」がトークン置換だけで済まないことを明示しているため、Phase 3 の標準スコープに含まれる）。

#### 選択肢 W: not-found の Playwright 検証を省略する（リダイレクト系と同じ扱い）

not-found は UI を持つため、視覚検証なしに DESIGN.md 整合を主張できない。**判断: B-333-9 で Playwright 検証必須**。検証 URL は `/foo-bar-baz-xyz` のような確実に存在しないパスを使う。

#### 選択肢 V: about の OGP 画像（opengraph-image.tsx / twitter-image.tsx）を本サイクルで新規作成する

privacy には `(legacy)/privacy/opengraph-image.tsx` と `(legacy)/privacy/twitter-image.tsx` が存在する一方、about には存在しないことを B-333-1 で確認済み。3 案を以下に比較:

- **(a) Phase 3 で about の OGP 画像を新規作成して privacy と揃える**: SNS シェア時の見た目が改善するが、Phase 3 の本来スコープ（ファイル移動 + 既存ページのデザイン適用）から逸脱。新規 OGP 画像のデザイン判断（タイトル文言・色・レイアウト・privacy OGP との一貫性ルール）を Phase 3 内で確定する必要があり、本サイクルのレビュー粒度が崩れる。スコープ膨張リスク（AP-P14）
- **(b) 別 backlog として B 番号を発行し本サイクル完了時に backlog.md へ確実に Queue する**: 不足を将来 backlog として可視化しつつ Phase 3 のスコープ純度を保つ
- **(c) 今後も追加しないと確定する**: about ページが SNS シェアされる頻度が privacy より低いとは限らず、AI 運営サイトとしての信頼性表明ページのシェアサムネ不在は来訪者価値の継続的な不足

**確定方針: (b) 採用**。B 番号 **B-366** を発行する（B-365 が現状最大、B-366 が次の空き番号であることを `grep -oE "B-[0-9]+" docs/backlog.md | sort -n | tail` で実体確認済み）。本サイクル完了時のキャリーオーバー処理として `/docs/backlog.md` の Queued セクションに以下を追加する責務を本計画書のサイクル終了時チェックリストに含める:

- ID: B-366
- 内容: about ページの OGP 画像新規作成（`src/app/(new)/about/opengraph-image.tsx` および `twitter-image.tsx`）。privacy の既存 OGP 画像（`src/app/(new)/privacy/opengraph-image.tsx`、Phase 3 で `(new)/` に移動済み）のデザイン規約に揃える。タイトル文言は「このサイトについて | yolos.net」。フォント・色・レイアウトは privacy OGP のそれを参照
- 優先度: P3（直接 PV へ寄与する優先度ではないが、SNS シェア導線の信頼性を底上げ。来訪者価値は中）
- 着手条件: B-333（cycle-180）完了後（about が `(new)/` 配下に存在することが前提）
- 「将来の判断保留」ではなく **B-366 として確実に backlog 化** する。サイクル完了時に backlog.md への追加が完了していなければ本サイクル完了基準を満たさないものとする（B-333-9 の独立 reviewer が確認）

#### 選択肢 U: B-365（design-migration-plan.md Phase 7 数値訂正）を本サイクルで一緒に対応する

cycle-179 申し送りで Phase 7.1 / 7.2 の数値誤り（「30 ルート」「13 ルート」が実体は 34 + 20）が指摘されている。Phase 3 とは独立タスクだが「同じファイルを開く」ため一緒に修正するのは効率的に見える。**判断: 本サイクルでは対応しない**（B-365 として既に Queued。Phase 3 のスコープと混ざるとレビュー粒度が崩れる）。ただし本サイクルで Phase 3 周辺の plan doc 記述に同型の事実誤認を発見した場合は能動的に修正する（cycle-180 description にもその趣旨が記載済み）。

#### 選択肢 T: 1 ページ 1 コミットを撤回し「Phase 3 全体で 1 コミット」にする

レビューが楽になる側面もあるが、design-migration-plan.md L376「1 ページ 1 コミットを基本」「ロールバック時の影響範囲」の方針と整合しない。**判断: 1 ページ 1 コミットを維持**。3.2 の memos 系 5 ルートは Route Handler のみで UI を持たず、まとめて 1 コミット（「ディレクトリ移動」というまとまり）が自然なため B-333-4 として 1 コミットに集約する例外を認める。feed の 2 ルート（B-333-8）も同様。

### 計画にあたって参考にした情報

#### 一次情報（PM が逐語 Read した）

- `/mnt/data/yolo-web/docs/design-migration-plan.md` Phase 3 セクション（L91-L102）、「1 ページ移行の標準手順」（L290-L302）、「検証方法」（L304-L336）、「アンチパターン回避」（L338-L346）、「コミット粒度」（L376-L380）
- `/mnt/data/yolo-web/docs/cycles/cycle-180.md`（本ファイル冒頭の description / 補足事項）
- `/mnt/data/yolo-web/src/app/(new)/layout.tsx` および `/mnt/data/yolo-web/src/app/(legacy)/layout.tsx`（multiple root layouts 構成の確認）
- `/mnt/data/yolo-web/src/app/(legacy)/not-found.tsx`（絵文字 4 件・旧トークンの実体確認）
- `/mnt/data/yolo-web/src/app/sitemap.ts`（about / privacy / achievements / play/daily meta の (legacy) 経由 import 4 行を確認）
- `/mnt/data/yolo-web/src/app/(legacy)/__tests__/`（9 ファイル全件。とくに not-found.test.tsx / seo-coverage.test.ts / sitemap.test.ts / metadata.test.ts の `@/app/(legacy)/...` および `../layout` 直書き参照位置）
- `/mnt/data/yolo-web/src/components/common/TrustLevelBadge.tsx` および `/mnt/data/yolo-web/src/components/common/__tests__/TrustLevelBadge.test.tsx`（実体確認）と `grep -rln "TrustLevelBadge" src/` の結果（10+ 利用箇所）
- `/mnt/data/yolo-web/src/components/Header/index.tsx`（actions スロットの構造確認、Phase 4 申し送り基礎）
- Next.js 公式ドキュメント [not-found.js](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)（v16.2.4, 2026-04-10 lastUpdated）— `global-not-found.js` セクション全文を WebFetch で取得し、特に「`global-not-found.js` is useful when you can't build a 404 page using a combination of `layout.js` and `not-found.js`. This can happen in two cases: Your app has multiple root layouts ...」を本計画書 B-333-3 に逐語引用済み。本計画書の (γ'') 採用結論はこの原文段落と直接整合する（Minor-4 対応：採用案を否定する可能性のある記述を計画段階で取り込み、判断ゲートとして使用済み）
- vercel/next.js 既知 Issue [#54980](https://github.com/vercel/next.js/issues/54980), [#55717](https://github.com/vercel/next.js/issues/55717), [#55191](https://github.com/vercel/next.js/issues/55191), [#59180](https://github.com/vercel/next.js/issues/59180), [Discussion #50034](https://github.com/vercel/next.js/discussions/50034) — Route Group 内 not-found.tsx の unmatched URL 不検出問題を確認

#### 参考ドキュメント

- `/mnt/data/yolo-web/docs/targets/特定の作業に使えるツールをさっと探している人.yaml`
- `/mnt/data/yolo-web/docs/targets/気に入った道具を繰り返し使っている人.yaml`
- `/mnt/data/yolo-web/docs/anti-patterns/planning.md`（AP-P01 / P03 / P07 / P11 / P16 を本計画レビュー観点として参照）
- `/mnt/data/yolo-web/docs/knowledge/css-modules.md` §1（`:global(:root.dark)`）
- `/mnt/data/yolo-web/docs/knowledge/nextjs.md` §1（dev サーバー再起動）、§7（middleware → proxy のリスク把握）、§8（古い next-server プロセス残存）
- `/mnt/data/yolo-web/docs/cycles/cycle-179.md`「## 作業計画」構造（B-309-1〜7 のサブタスク粒度・PM/builder 区分・依存関係明示の書式を踏襲）
- `/mnt/data/yolo-web/DESIGN.md` §1〜§7（新トークン、レイアウト、タイポ、状態、a11y、アイコン、絵文字禁止、ホバー / フォーカス、暫定対応）

### 完了基準

#### Phase 3 完了基準（design-migration-plan.md L102 を本サイクル文脈に展開）

- **本サイクル Phase 3 対象 10 ルート**（about / privacy / feed / feed/atom / memos / memos/[id] / memos/feed / memos/feed/atom / memos/thread/[id] および root 直下の `global-not-found.js` に再配置する not-found）が `src/app/(legacy)/` に **残らない**（not-found は `src/app/global-not-found.js` に root 直下配置のため `(new)/` ではなく root に存在する。それ以外の 9 ルートは `src/app/(new)/` 配下に配置されている）。
- `src/app/(legacy)/about/`、`src/app/(legacy)/privacy/`、`src/app/(legacy)/not-found.tsx`、`src/app/(legacy)/not-found.module.css`、`src/app/(legacy)/feed/`、`src/app/(legacy)/memos/` が存在しない。
- `grep -rE "@/app/\\(legacy\\)/(about|privacy|feed|memos)" src/` の結果が空（achievements / play/daily は意図的に残すためキーワードに含めない）。
- Playwright 視覚確認（w360 / w1280 × ライト / ダーク）で about / privacy / not-found が旧と「同等以上」の見た目と動作（B-333-9 視覚検証チェックリスト全項目を満たす）。

#### 本サイクル独自の検証項目

- `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功。
- production build に対する curl で:
  - `/feed` と `/feed/atom` の XML 本文が移動前と完全一致（diff 0）、HTTP レスポンスヘッダが B-333-1 で確定した allow-list（`./tmp/feed-headers-allowlist.md`）の 3 分類基準（完全一致要求 / 意味的同等 / 除外）を満たす
  - `/memos`・`/memos/[id]`・`/memos/thread/[id]` が GitHub URL へ 301
  - `/memos/feed`・`/memos/feed/atom` が 410
- `app/sitemap.xml` を `./tmp/sitemap-before.xml` と diff して **完全一致**（URL リスト・lastModified を全件比較。エントリ数だけでなく内容も不変）。
- `.next/server/app/` の生成パスを `./tmp/build-paths-before.txt` と diff し、Phase 3 対象 10 ルートのみが想定通り変動し、他ルートの出力パスが不変であること（Minor-3 対応）。
- (new) layout の Header / Footer / WebSite JSON-LD / `<html>` class / `<body>` style が、移行後の各ページで 1 セットのみ適用されている（二重 layout 検出ゼロ）。
- DESIGN.md「絵文字禁止」「アイコン原則使わない」「本文中太字禁止」「タップターゲット 44px」「focus-visible」「コントラスト 4.5:1」「`:global(:root.dark)`」を移行後 3 ページ（about / privacy / not-found）で満たす。
- TrustLevelBadge の取り扱いが B-333-2 確定方針と一致（新版 `@/components/TrustLevelBadge` の新設、storybook エントリ追加、(new)/about・(new)/privacy が新版を import、(legacy) 配下 10+ 利用箇所は本サイクルでは触らず旧版継続使用）。
- not-found の配置が B-333-3 確定方針 **(γ'') = `src/app/global-not-found.js` + `next.config.ts` の `experimental.globalNotFound: true`** と一致し、絵文字撤去が完了（Minor-1 対応）。
- 既存テストの実体件数（B-333-1 のファクトチェック完了テーブルが真実源、Major-6 対応）に基づく:
  - `(legacy)/about/__tests__/page.test.tsx`: 4 ケース（移動後 (new)/about/ 配下）
  - `(legacy)/privacy/__tests__/page.test.tsx`: 5 ケース（移動後 (new)/privacy/ 配下）
  - `(legacy)/feed/__tests__/feed.test.ts`: **8 ケース**（移動後 (new)/feed/ 配下）
  - `(legacy)/memos/__tests__/memos-redirect.test.ts`: **8 ケース**（移動後 (new)/memos/ 配下、※実パスは `(legacy)/__tests__/` ではなく `(legacy)/memos/__tests__/` であることに注意）
  - `(legacy)/memos/feed/__tests__/memo-feed.test.ts`: 4 ケース（移動後 (new)/memos/feed/ 配下）
  - `(legacy)/__tests__/not-found.test.tsx`: **2 ケース**（Major-1 対応: `grep -cE "^\s*(it|test)\(" src/app/(legacy)/__tests__/not-found.test.tsx` の実測値、B-333-1 ファクトチェック完了テーブルが真実源）。移動後 `src/app/__tests__/global-not-found.test.tsx` に格納
  - これらすべてが移動後の位置で pass する。新規追加テスト（B-333-7 で必要と判断した場合）も pass。
  - **件数の真実源は B-333-1 のファクトチェック完了テーブル**。本完了基準の数値とテーブルが乖離した場合はテーブルを優先し、本完了基準を更新する。
- 独立 reviewer のレビューで Critical / Major 指摘ゼロ。

## レビュー結果

<作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。>

## キャリーオーバー

<このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

## 補足事項

- 前サイクル（cycle-179）から「`docs/design-migration-plan.md` Phase 7.1 / 7.2 の数値訂正」が cycle-180 PM への申し送りとして渡されているが、これは独立タスク B-365 として既に Queued に起票済みで、Phase 7 着手前までに訂正されていれば実害なし。本サイクルのスコープには含めない（B-333 単独で十分なスコープがあるため）。Phase 3 着手中に plan doc Phase 3 の記述で同型の事実誤認に気付いたら、本サイクル内で能動的に検出・記録すること。
- B-333 は P1 で、Phase 4 / 5 / 6 / 7 / 9 / 10 の前提となる。本サイクルでスタックを進めることで後続のデザイン移行サイクルが連鎖的に着手可能になる。

### Phase 4 着手 PM への申し送り（本サイクル完了時に追記される想定）

以下は Phase 4（B-334 を含む後続サイクル）の PM に対し、Phase 3 を踏まえて引き継ぐべき事項の **計画段階での想定**。execution の進行で実体が判明したら追記すること。

- **Header / Footer の actions スロットは Phase 3 完了時点で既に新版に統一されている**: `(new)/layout.tsx` が Header の `actions` スロットに `<StreakBadge />` と `<ThemeToggle />` を渡す構造を持つ。`src/components/Header/index.tsx` 側では `actions` を props として受け取り、desktop（`styles.desktopActions` / L126-L128 周辺）と mobile（`styles.mobileActions` / L173-L176 周辺）の双方で振り分け描画している。design-migration-plan.md L119-L125 が言う「Phase 4 で構造のみ用意し、実際の検索 UI との結線は Phase 5 で実施」については、layout 側ではなく **`src/components/Header/index.tsx` 側の改修** が責務:
  - (i) 検索トリガーアイコンを `actions` スロット内（または Header 内の検索専用枠）に追加する。これは layout 側の `<Header actions={...} />` の渡しを変えるのではなく Header コンポーネント内に検索枠を構造として持つ案も比較検討対象。
  - (ii) モバイル Header の 44px タップターゲット確保（現状 `styles.mobileActions` の各子要素の min-width / min-height を確認）。
  - (iii) Cmd+K / Ctrl+K キーバインド受け口の追加位置（`Header/index.tsx` 内 or 専用 client component に分離）。
  - layout 自体の作り直しは不要だが、Header コンポーネントのファイル分割（`Header/SearchTrigger.tsx` 等）が発生する可能性がある点を Phase 4 PM に申し送る。
- **TrustLevelBadge の取り扱い結論**: Phase 3 では「別パスで併存」（B-333-2a 選択肢 b）を採用し、新版 `@/components/TrustLevelBadge` を新設、(legacy) 10+ 既存利用箇所は旧版 `@/components/common/TrustLevelBadge` を継続使用。Phase 4-8 で各ページが (new) に移る際、本来のサイクルで個別に新版へ切り替える機会がある。
- **not-found の配置スコープ結論**: Phase 3 で **(γ'') = `src/app/global-not-found.js` + `next.config.ts` の `experimental.globalNotFound: true`** を採用済み。Phase 4 以降のページが `notFound()` を呼んだ場合は **各 Route Group の `not-found.tsx`（存在すれば）または最も近い境界の挙動に従う**（公式 docs: `not-found.js` は `notFound()` 関数のスコープで機能、`global-not-found.js` は **unmatched URL のみ** を catch）。Phase 4 以降のページで `notFound()` を意味的に使う場合は、(new) 配下に必要に応じて Route Group 単位の `not-found.tsx` を別途置く判断が必要。
- **`(legacy)/__tests__/` 配下のテストが `@/app/(new)/...` を import する構造ねじれ（Major-4 対応）**: Phase 3 では `seo-coverage.test.ts` / `sitemap.test.ts` が一部 `@/app/(new)/...` を参照する構造ねじれを許容している（B-333-9 で `./tmp/cross-group-import-count.md` に件数記録）。Phase 4 以降が進むにつれてこの数は増え、最終的に `seo-coverage.test.ts` の `staticPages` 配列が大半 `@/app/(new)/...` 参照になる。**Phase 10.2（legacy 削除）の着手 PM への申し送り事項**: `seo-coverage.test.ts` / `sitemap.test.ts` 自体の最終的な置き場所を Phase 10.2 で決める（`(legacy)/__tests__/` ディレクトリ削除と同時に `src/__tests__/` 等の中立位置へ移すか、`(new)/__tests__/` 配下に移すか）。
- **(legacy) 配下の残存ルートの状態**: Phase 3 完了時点で `(legacy)/` 配下に残る主要ディレクトリ（blog / tools / play / dictionary / cheatsheets / achievements / api / 一覧トップ系）を一覧化して申し送る（Phase 4 の作業対象を可視化するため）。
- **sitemap.ts の (legacy) 経由 import の残存状況**: Phase 3 で about / privacy 分は `@/app/(new)/...` に書き換えられるが、achievements / play/daily の meta は依然 `@/app/(legacy)/...` から import されている。Phase 4 / 7 でこれらを移行する際の前提として明記。

### Phase 10.2 着手 PM への申し送り（本サイクル完了時に確定する想定）

- **`global-not-found.js` → `not-found.js` 戻し（Major-2 対応: 手順・順序・実機検証コマンドの確定）**: Phase 10.2 で legacy 削除により root layout が単一化された後（`(new)/layout.tsx` のみが残り、これが root layout になる）、以下の順序で書き戻しを実施する。順序は「フラグ削除を先に行うことで build が通るかを最初に確認し、ファイル変更とテスト追従を後段に集中させる」ことを意図している。
  1. `next.config.ts` から `experimental.globalNotFound: true` を削除し、`experimental` ブロックが空になる場合はブロックごと削除して `npm run build` を実行。Next.js の build がこの時点で通るか（= experimental フラグなしでもビルドが破綻しないか）を最初に確認する。**通らない場合は手順 2 以降に進まず原因調査**
  2. `git mv src/app/global-not-found.js src/app/not-found.js`（拡張子を `.tsx` にする場合は同時にリネーム）
  3. `src/app/not-found.js`（旧 global-not-found.js）の内容を編集し、`<html>`/`<body>` の自前出力を削除して `children` を return する形（または通常の React コンポーネントとして body 内容のみ return する形）に書き換え
  4. `import "@/app/globals.css"` の自前 import を削除し、root layout（旧 (new)/layout.tsx を Phase 10.2 で `src/app/layout.tsx` に昇格させた後のもの）の import に委ねる
  5. `git mv src/app/__tests__/global-not-found.test.tsx src/app/__tests__/not-found.test.tsx` し、`import GlobalNotFound from "../global-not-found"` を `import NotFound from "../not-found"` に書き換え。テスト本体の assertion はテキスト依存のため変更不要のはず（変更要ならその場で確認）
  6. **実機検証**: `npm run build && npm start` を立ち上げ、`curl -i http://localhost:3000/foo-bar-xyz` を実行して 404 ステータスと旧 global-not-found と同等の HTML（Header / Footer / 4 リンク）が返ることを確認。Playwright で w360 / w1280 のライト / ダーク 4 種で視覚確認
  7. `npm run lint && npm run format:check && npm run test && npm run build` を全て pass させてから commit
- **`(legacy)/__tests__/` 配下のテストの置き場所**: 上記「Phase 4 申し送り」の構造ねじれ項目を参照。Phase 10.2 で `(legacy)/__tests__/` ディレクトリを削除する際、その内容（`seo-coverage.test.ts` / `sitemap.test.ts` 等）の置き場所を決める。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] **B-366（about ページの OGP 画像新規作成、選択肢 V (b) 採用）が `/docs/backlog.md` の Queued セクションに追加されている**（Minor-2 対応: ID = B-366、内容 / 優先度 / 着手条件は選択肢 V の確定方針に従う。本項目が満たされなければ本サイクル完了基準を満たさないものとする）。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
