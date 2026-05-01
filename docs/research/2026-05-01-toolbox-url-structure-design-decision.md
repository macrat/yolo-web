---
title: 道具箱 URL 構成の設計判断材料
date: 2026-05-01
purpose: yolos.net 道具箱機能フェーズ1（Phase 2.1）における URL 構成（トップ / 専用 URL / 複数）の採用判断に必要な情報を収集する。
method: |
  - 競合・類似サービスの URL 構成を Web 検索・公式ドキュメントで確認
  - SEO / 構造化データの動向調査（Google 公式ブログ・Search Central）
  - ダッシュボード初期体験の UX ベストプラクティス調査
  - Next.js App Router × localStorage × SEO の技術的制約調査
  - B-313（base64 シェア URL）との関係調査
  - 検索クエリ: "Notion URL structure workspace after login", "Linear workspace URL pattern", "Trello home URL /", "start.me URL structure personal page", "Raindrop.io URL dashboard", "dashboard dedicated URL vs root SEO SPA", "localStorage first visit empty state onboarding UX", "base64 URL state sharing SPA", "Google SearchAction retired 2024", "Next.js root page localStorage SEO Googlebot"
sources: |
  - Trello Home Page 公式ドキュメント: https://support.atlassian.com/trello/docs/the-home-page/
  - Linear Workspaces ドキュメント: https://linear.app/docs/workspaces
  - Linear My Issues ドキュメント: https://linear.app/docs/my-issues
  - Netvibes Wikipedia: https://en.wikipedia.org/wiki/Netvibes
  - start.me カスタム URL ヘルプ: https://support.start.me/en/articles/9182832-customize-your-public-profile-url-pro
  - Google Drive 新 Home 発表: https://workspaceupdates.googleblog.com/2023/11/introducing-new-homepage-view-in-google-drive.html
  - iGoogle Wikipedia: https://en.wikipedia.org/wiki/IGoogle
  - igHome Wikipedia: https://en.wikipedia.org/wiki/IgHome
  - Google SearchAction 廃止: https://developers.google.com/search/blog/2024/10/sitelinks-search-box
  - Remix discussions – "/" root vs dashboard: https://github.com/remix-run/remix/discussions/5391
  - SaaS domain structure (Ghinda): https://ghinda.com/blog/products/2020/domain-structure-for-saas-products.html
  - NN/g Empty State 3 guidelines: https://www.nngroup.com/articles/empty-state-interface-design/
  - Smashing Magazine – empty states in onboarding: https://www.smashingmagazine.com/2017/02/user-onboarding-empty-states-mobile-apps/
  - URL as state (DEV): https://dev.to/maxxmini/share-your-web-app-state-via-url-no-backend-required-1806
  - ラッコツールズ: https://rakko.tools/
  - SPA SEO 2024: https://devtechinsights.com/spas-seo-challenges-2025/
  - Asana My Tasks URL: https://forum.asana.com/t/how-can-i-construct-the-url-for-a-task-in-my-tasks/28862
---

# 道具箱 URL 構成の設計判断材料

## 概要

本レポートは yolos.net の道具箱機能フェーズ1（Phase 2.1 設計判断）において、URL 構成の 3 候補（①トップ `/` / ②専用 URL / ③複数 URL）を選ぶための判断材料を提供する。

---

## 1. 同種ダッシュボード型サイトの URL 戦略

### 1.1 調査結果一覧

| サービス                 | URL 戦略                                           | 備考                                                                                                                                                                         |
| ------------------------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Notion**               | 専用 URL: `notion.so/[workspace-name]/[page-id]`   | ログイン後は workspace slug 配下。トップ `notion.com` はマーケティングページ（公式ドキュメント確認）                                                                         |
| **Linear**               | 専用 URL: `linear.app/[workspace-slug]/...`        | トップ `linear.app/` はマーケティングページ。My Issues は `linear.app/[slug]/my-issues` に相当（キーボードショートカット G→M で遷移。URL は非公開だが workspace 配下のパス） |
| **Trello**               | トップ `/` = ダッシュボード（ログイン後）          | 公式: "When you log in or visit https://trello.com while logged in, you'll get to the Home page." 個別ボードは `trello.com/b/[id]/[name]`（複数）                            |
| **Raindrop.io**          | 専用 URL: `app.raindrop.io/...`                    | マーケティングサイト（raindrop.io）とアプリサイト（app.raindrop.io）をサブドメインで分離                                                                                     |
| **Start.me**             | 専用 URL: `start.me/p/[pageID]`                    | 複数ページ対応。ユーザー profile は `start.me/u/[username]`                                                                                                                  |
| **igHome**               | 専用 URL（ユーザーページ）                         | iGoogle の後継。ルート `/` はランディングページ                                                                                                                              |
| **Netvibes**             | 専用 URL: `netvibes.com/[username]`                | public ページ URL。現在はサービス終了（2025年6月）                                                                                                                           |
| **Toby**                 | 専用ドメイン: `web.gettoby.com`                    | ブラウザ拡張の新規タブを基本とし、Web 版は独立 URL                                                                                                                           |
| **Momentum Dash**        | ブラウザ拡張の `chrome://newtab` オーバーライド    | URL なし（ブラウザ内部）                                                                                                                                                     |
| **Google Drive**         | 専用 URL: `drive.google.com/drive/home`            | 2023年末から "Home" がデフォルト。以前は "My Drive" がデフォルト                                                                                                             |
| **Dropbox**              | 専用 URL: `dropbox.com/home`                       | ルート `dropbox.com/` はマーケティング                                                                                                                                       |
| **iCloud Drive**         | 専用 URL: `icloud.com/iclouddrive`                 | ルート `icloud.com/` はポータル                                                                                                                                              |
| **Asana My Tasks**       | 専用 URL: `app.asana.com/0/[workspace-id]/list`    | ルート `asana.com` はマーケティング                                                                                                                                          |
| **Hive**                 | 専用 URL（アプリ内 Home）                          | アプリ内 home アイコンから遷移。ルートはマーケティング                                                                                                                       |
| **ラッコツールズ**       | トップ `/` = ツール一覧 + お気に入り（軽い永続化） | ダッシュボード化はしていないが、お気に入り機能で localStorage 使用。個別ツールは `/tools/[番号]/`                                                                            |
| **iGoogle（2005-2013）** | トップ的な URL: `google.com/ig`                    | Google のブランド力を借りた特殊ケース。終了後は `google.com` へリダイレクト                                                                                                  |

### 1.2 観察されたパターン

**パターンA: トップ `/` = ダッシュボード（ログイン後）**
Trello のみが採用。「ログインしていれば `/` がダッシュボード、ログアウトしていれば `/` はランディング」という条件分岐でトップを兼用。ログイン不要サービスの iGoogle は `google.com/ig` をトップとして使用。

**パターンB: 専用 URL を持つ（分離型）**
Notion / Linear / Google Drive / Dropbox / Asana はすべてこのパターン。マーケティングサイトとアプリを別 URL または別ドメインで分離する。

**パターンC: 複数 URL を持つ**
Start.me・Netvibes が対応。複数のパーソナルページを持てる設計で、各ページが独自 URL を持つ。ただしエントリーポイントは「最初の 1 枚」で、ユーザーが増やしていく。

**重要な共通点**: ログインが必要なサービスはほぼ例外なく「トップ = マーケティングページ、アプリ = 専用 URL」を採る。ログイン不要かつ Google のブランド力を持つ iGoogle が `/ig` を使ったのは例外的事例。

---

## 2. SEO / 流入観点

### 2.1 トップを動的体験にした場合の SEO 影響

**Googlebot の localStorage 非対応**
Google のクローラーは localStorage を読まない。クライアントサイドでのみ生成されるコンテンツ（localStorage の内容に基づく UI）は Googlebot には「空の画面」または「デフォルト状態」として見える。Next.js App Router の Server Component が返す HTML に含まれていないコンテンツは初回クロールでインデックスされない。

**トップを道具箱化した場合の SEO への影響**

- トップ `/` は通常「サイト全体の意味」を持つページとして扱われる。そこが「道具箱」として機能する場合、Googlebot が見るのは「空の道具箱 or デフォルト状態のツール一覧」となる
- `<title>` や `<meta description>` など静的なメタデータは設定できるため、インデックスはされる
- ただし「訪問者が使っている道具箱の状態」は SEO と無関係（localStorage 内容は crawl されない）

**M1a（初回来訪者）の SEO ランディングはツール詳細ページ**
M1a は「文字数カウント」「日付計算」などのキーワードで検索してツール詳細ページ（例: `/tools/character-count`）に着地する。トップが道具箱でもツール詳細ページでも M1a の体験は変わらない。トップの SEO 価値は「サイト名検索」と「道具箱という機能への認知」に限定される。

### 2.2 SearchAction 構造化データ

Google は 2024年11月21日に Sitelinks Search Box（SearchAction）の SERP 表示を廃止した（出典: Google Search Central Blog）。Website schema の SearchAction マークアップは残せるが、視覚的な sitelinks search box は表示されなくなった。この変更により「SearchAction のために `/search` ページが必要」という SEO 上の直接メリットは消滅した。ただし B-332 の判断では「横断検索を作る」（Phase 5）が既に採択済みのため、これは既決事項。

### 2.3 サイトマップへの影響

専用 URL を採った場合（例: `/toolbox`）、そのページは `sitemap.xml` に含める必要がある。ただし道具箱ページ自体は「ツール群へのハブ」という性質であり、直接の検索流入は限定的。SEO 上の主戦場はツール詳細ページ（`/tools/[slug]`）であることは変わらない。

---

## 3. M1b 視点：既存ブックマーク / リンクへの影響

### 3.1 現在のトップ `/` の実態

現在の yolos.net トップ（旧コンセプト「占い・診断パーク」）には、診断コンテンツへのリンクが並んでいる。M1b がトップをブックマークしている場合、トップを道具箱化するとその体験は大きく変わる。

**破壊度の評価**

- 旧コンセプトでトップをブックマークしている M1b ユーザーにとって、道具箱化は「完全に別のサービス」に変わるように見える
- ただし、M1b は「特定のツール詳細ページ」をブックマークしている可能性のほうが高い（M1b の行動定義: ブックマーク・履歴・サイト名検索で特定ツールに再訪）
- 今後新コンセプト下で M1b が定着するとき、「ツール詳細ページのブックマーク」が主体になると想定される

**既存ユーザーへの配慮**
Google Analytics データ（2026年4月現在）では、トップ `/` への直接流入は限定的で、メインは検索からのツール詳細ページ着地。トップのブックマーク数は少ないと推測されるが、確認は GA4 で別途要確認。

### 3.2 専用 URL の opt-in 性

専用 URL（例: `/toolbox`）を採ると:

- 現行トップ `/` の体験をそのまま維持できる（フェーズ移行中も混乱が少ない）
- 道具箱を積極的に使いたいユーザーだけが `/toolbox` をブックマークする
- 将来的に「道具箱が yolos.net の顔」になった段階で、`/` のコンテンツを道具箱に統合 / リダイレクトする移行が可能

---

## 4. 複数道具箱対応の現実性

### 4.1 フェーズ1 で複数対応（`/toolbox/[id]`）を採る場合の複雑度

**実装複雑度の増加点**

- `[id]` の採番・管理ロジックが必要（localStorage に `toolboxes` 配列が必要）
- UI に「道具箱を追加」「道具箱を切り替え」「道具箱を削除」フローが必要
- デフォルト道具箱の概念（最初に開く道具箱）の設計が必要
- B-313 の base64 URL シェアと組み合わせると `?state=XXX` vs `/toolbox/shared/[base64]` のルーティング設計が複雑になる

**フェーズ1 での複数対応メリット**

- 将来的な URL 変更を避けられる（`/toolbox` → `/toolbox/[id]` への移行は破壊的）
- ユーザーが「仕事用」「趣味用」など用途別に使い分ける体験を初日から提供できる

### 4.2 単一 → 複数への移行コスト

**URL 変更の破壊度**

- `/toolbox` を既にブックマークしたユーザーが複数化後に `/toolbox/1` などにリダイレクトされると、ブックマークが「機能的には壊れていないが URL が変わった」状態になる
- 301 リダイレクト（`/toolbox` → `/toolbox/default`）で対処可能
- localStorage スキーマ変更は必要: `{ tiles: [...] }` → `{ toolboxes: [{ id: "default", tiles: [...] }] }` といった移行が必要。バージョン番号を持たせておけば自動マイグレーションは実装可能

**推定工数差**: フェーズ1 で複数対応を入れると実装量が 1.5〜2 倍になる見込み。URL 設計だけなら小さいが、UI（複数管理フロー）が大きい。

### 4.3 B-313（base64 シェア URL）との関係

B-313 はタイル配置・設定を base64 エンコードして URL でシェアする機能。この実装は URL 構成の選択と次のように絡む:

- **トップ `/`** の場合: `/?state=[base64]` または `/?config=[base64]` としてシェア URL を実装。トップの SEO 用 canonical URL と区別が必要になる（`?state` があるページを noindex にするか canonical を `/` に設定する）
- **専用 URL `/toolbox`** の場合: `/toolbox?state=[base64]` または `/toolbox/[base64]` とする。パスパラメータは URL が長くなるが bookmark しやすい
- **複数 URL `/toolbox/[id]`** の場合: シェア URL は別途 `/toolbox/shared/[base64]` などの設計が必要

単一道具箱（トップまたは専用 URL）のほうがシェア URL 設計はシンプル。

---

## 5. ダッシュボードを「default content」付きで成立させる戦略

### 5.1 localStorage 空っぽの初回来訪者への対応パターン

**パターン1: 空っぽ + 案内テキスト**
最もシンプル。「ツールを追加してください」というメッセージと「+」ボタンを表示する。NN/g の研究では「empty state は主要ユーザーアクションへの明確な誘導を含むべき」とされる。フェーズ1 の最小実装として適切。

**パターン2: デフォルトプリセット展開**
初回来訪時に「よく使われるツール 6〜8 個」を自動で配置する。Trello が新規ユーザーに「サンプルボード」を見せるのと同じアプローチ。「空っぽ感」がなくサービスの価値をすぐ伝えられる。B-312（ペルソナ別プリセット）の先行実装として位置づけられる。

**パターン3: 選択モーダル**
初回来訪時に「どんな用途で使いますか？」と聞くモーダルを出して、選んだらプリセットを展開する。B-312 の本来実装に近い。フェーズ1 では過剰な可能性が高い。

### 5.2 トップ vs 専用 URL で初期体験はどう違うか

**トップ `/` の場合**

- M1a（検索着地の初回来訪者）が `/` に来ることはほとんどない。M1a はツール詳細ページに着地する
- M1a がたまたまトップに来た場合、空の道具箱または「ツールを探す」案内が出ることになる。これは「何のサイトか分からない」体験になるリスクがある
- 対策: トップに「このサイトについて」の静的説明セクションを道具箱の下に置く設計が必要

**専用 URL `/toolbox` の場合**

- トップ `/` は従来通り「ツール一覧 + サイトの紹介」ページを置ける（Phase 4 の現行トップ移行と整合）
- `/toolbox` は「道具箱を使いたい人が能動的に訪れる場所」として設計できる
- 初期体験の設計がトップの制約（SEO・M1a への配慮）から切り離せる

### 5.3 フェーズ1 の「最小限の初期体験」の推奨設計

B-312（ペルソナ別プリセット）が後続フェーズにあることを踏まえると、フェーズ1 では以下が妥当:

**推奨: デフォルトプリセット（汎用 3〜5 ツール）自動展開 + 追加・削除 UI**

- localStorage が空 → 汎用プリセット（例: 文字数カウント、日時計算、パスワード生成など使用頻度の高いツール）を自動配置
- ユーザーはすぐにツールを使えるか、不要なものを削除して自分好みにカスタマイズできる
- B-312 が来たとき、プリセット選択 UI を「初回モーダル」として追加するだけで済む

---

## 6. 3 候補の多角的評価

### 6.1 評価マトリクス

| 評価軸                      | ① トップ `/`                                                                                                           | ② 専用 URL `/toolbox`                                                                   | ③ 複数 `/toolbox/[id]`               |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------ |
| **M1a（初回来訪者）**       | リスクあり。トップに来た M1a が空の道具箱に戸惑う可能性                                                                | 影響なし。トップにツール一覧を維持できる                                                | 影響なし（専用 URL と同様）          |
| **M1b（再訪者）**           | 既存ブックマーク破壊リスクあり（旧コンセプトのトップをブクマしている場合）                                             | 影響なし。既存 `/` はそのまま残せる                                                     | 影響なし（専用 URL と同様）          |
| **SEO**                     | localStorage 依存コンテンツは SEO に中立。静的メタデータは設定可能だが、トップのキーワード戦略が「道具箱」に限定される | トップに「ツール集」としての SEO 価値を維持しつつ、`/toolbox` にもメタデータを設定可能  | 専用 URL と同等                      |
| **拡張性（複数化）**        | 将来複数化する際に `/toolbox/[id]` への URL 変更が必要（破壊的）                                                       | `/toolbox` → `/toolbox/[id]` への移行が必要（破壊度中程度）。301 リダイレクトで対処可能 | 初日から対応済み。複数化のコストゼロ |
| **実装複雑度（フェーズ1）** | 中。トップに「静的説明 + 動的道具箱」を共存させるレイアウトが必要                                                      | 低。専用ページを新規作成するだけ                                                        | 高。複数管理 UI が必要               |
| **コンセプト整合性**        | 高。「日常の傍にある道具」として開いた瞬間が道具箱                                                                     | 中。「道具箱は別の URL」という一手間あり                                                | 中（専用 URL と同様）                |
| **Phase 9.2 移行コスト**    | 現行トップコンテンツの移動/廃棄が必要                                                                                  | 小。hidden ページを正式公開にするだけ                                                   | 小（専用 URL と同様）                |

### 6.2 重要な留意点

**① トップ `/` を採用する場合の課題**

- フェーズ1 時点では「noindex の hidden URL」で検証し、Phase 9.2 でトップに移行する計画（design-migration-plan.md Phase 2.2）。フェーズ1 でトップを道具箱にするのではなく「Phase 9.2 で `/` を道具箱にすることを決定する」という意味。実装は Phase 2.2 の hidden URL で始め、Phase 9.2 でトップへ昇格させる手順は変わらない
- M1a が多い現状（検索着地がメイン）では、トップを道具箱にした場合の来訪者体験悪化リスクを Phase 9.2 時点で再評価する必要がある
- Remix コミュニティの知見: 「ログイン状態によってトップで別コンテンツを出す」実装は条件分岐が複雑になり、多くのチームが `/dashboard` 分離を選んでいる

**② ログイン不要サービスの特殊性**
yolos.net はログイン不要のサービスであるため、「ログイン後はダッシュボード、ログイン前はランディング」という二段構えが使えない。これは Trello / Notion などとは根本的に異なる前提。ログイン不要の場合:

- トップを道具箱にすると、全来訪者（M1a 含む）が道具箱を見る
- 専用 URL を採ると、道具箱に興味のある人だけが `/toolbox` を訪れる自然な分離が生まれる

---

## 7. 推奨と移行コスト評価

### 7.1 フェーズ1（Phase 2.1）での推奨

**推奨: ② 専用 URL `/toolbox`（単一道具箱）**

根拠:

1. **M1a・M1b の保護**: ログイン不要サービスであるため、トップを道具箱にすると全来訪者が道具箱を見ることになる。M1a にとって道具箱は不要であり、初回体験が悪化するリスクがある。専用 URL であれば「道具箱を使いたい人だけが来る場所」として自然に機能する
2. **Phase 9.2 への移行コストが最小**: design-migration-plan.md でも「hidden な URL で検証し Phase 9.2 で正式公開」という手順が既定されている。専用 URL ならこの手順が最もシンプルに実現できる
3. **コンセプト整合性の担保は将来で十分**: コンセプト「日常の傍にある道具」の体現として道具箱をトップにしたいという動機は理解できるが、「Phase 9.2 で十分なコンテンツが揃ってからトップに昇格させる」ことでより高い品質で体現できる。早急なトップ化はリスクが先行する
4. **実装のシンプルさ**: 新規ページ `/toolbox/page.tsx` を作るだけで済む。条件分岐の複雑なレイアウトを書く必要がない
5. **SEO への影響がゼロ**: 既存 SEO 資産（ツール詳細ページ）に一切影響しない

**不採用の理由（③ 複数 URL）**
フェーズ1 の目標は「道具箱の基盤を作ること」であり、複数管理 UI は B-312 以降の追加機能として段階的に追加するほうが品質管理しやすい。また複数化のニーズは、単一道具箱への定着度が確認されてから判断するべき（仮説段階）。

### 7.2 Phase 9.2 への移行コスト評価

**② 専用 URL → Phase 9.2 での本公開**

- 作業: `page.tsx` の `metadata.robots: { index: false }` を削除してインデックス対象にするだけ
- URL 変更なし: ユーザーのブックマークは保持される
- 移行コスト: 極小

**将来的にトップ `/` に昇格させる場合**

- 作業: Phase 4 で移行した現行トップコンテンツを別 URL（例: `/tools`）に移すかトップに統合する判断・実施が必要
- URL 変更: `/` の内容が変わるため、既存の `/` ブックマーカーへの影響あり
- 移行コスト: 中程度（コンテンツ整理・リダイレクト設定が必要）
- 推奨タイミング: Phase 9.2 でユーザーが道具箱の価値を実感し始めてから検討

**将来的に複数化（`/toolbox/[id]`）に移行する場合**

- URL 変更: `/toolbox` → `/toolbox/default`（または `/toolbox/1`）への 301 リダイレクトが必要
- localStorage スキーマ移行: `v1` スキーマ（単一タイル配列）から `v2` スキーマ（複数道具箱配列）へのマイグレーションコード実装が必要
- 移行コスト: 小〜中程度。技術的に困難ではないが、localStorage マイグレーションのテストが必要

---

## 8. まとめ

**サービス調査からの学び**

- ほぼすべての類似サービスは「マーケティングページ = トップ `/`、アプリ = 専用 URL」を採っている
- ログイン不要サービスにおける「トップ = ダッシュボード」は iGoogle（Google ブランド依存）・Trello（条件分岐実装）などに限られ、yolos.net の状況（ログイン不要・新コンセプト移行中・M1a が多い）には適合しにくい
- Start.me / Netvibes は「複数ページ対応」を採るが、エントリーは「最初の 1 ページ」から始めて増やす設計

**SEO 観点の学び**

- SearchAction は 2024年11月に廃止済みで、独立 URL の SEO 便益は消滅
- localStorage 依存コンテンツは Googlebot に見えない。トップを道具箱にしても SEO 上の直接メリットはない
- ツール詳細ページが引き続き SEO の主戦場

**初期体験の学び**

- 空っぽの道具箱は機会損失。NN/g 研究でも「empty state は主要アクションへの誘導が必須」
- フェーズ1 では「デフォルトプリセット 3〜5 ツールを自動展開」が最小限の初期体験として適切
- B-312（ペルソナ別プリセット）が来たとき、初回選択モーダルを追加するだけで進化できる設計

**B-313（base64 シェア URL）との関係**

- 専用 URL `/toolbox` の場合: `/toolbox?state=[base64]` が最もシンプルで実装しやすい
- `?state` パラメータのあるページは canonical を `/toolbox` に設定し noindex にしておくことで SEO と両立できる
- 複数道具箱化した場合は別途シェア URL 設計が必要になるが、フェーズ1 の範囲外

---

## 注記

- Google Drive Home への変更は 2023年11月の公式ブログで確認（1次情報）
- SearchAction 廃止は 2024年10月の Google Search Central Blog で確認（1次情報）
- Trello の「ログイン後トップ = Home」は公式 Atlassian ドキュメントで確認（1次情報）
- Linear の My Issues 具体的 URL パスは非公開のため間接的な情報に基づく
- ラッコツールズのお気に入り機能は実際に `https://rakko.tools/` にアクセスして確認
- Remix コミュニティの知見は GitHub Discussion（1次情報）
