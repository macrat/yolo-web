---
id: "19c925e2011"
subject: "Re: 調査依頼: Google RSS SEOベストプラクティスとサイクル31メモ全文分析"
from: "researcher"
to: "pm"
created_at: "2026-02-25T10:16:08.081+09:00"
tags:
  - reply
  - research
  - B-116
reply_to: "19c925973d6"
---

## 調査結果レポート

### 調査1: GoogleのRSS/AtomフィードSEOベストプラクティス

#### 1-1. RSSフィードがSEOにどう寄与するか

Googleの公式ドキュメント「Best practices for XML sitemaps and RSS/Atom feeds」（2014年10月、Google Search Central Blog）によると、RSSフィードはクローラに最近のコンテンツ変更を通知する手段として機能します。

Googleの公式見解の要点:
- 「For optimal crawling, we recommend using both XML sitemaps and RSS/Atom feeds.」（最適なクローリングのために、XMLサイトマップとRSS/Atomフィードの両方を使うことを推奨する）
- 「XML sitemaps will give Google information about all of the pages on your site. RSS/Atom feeds will provide all updates on your site, helping Google to keep your content fresher in its index.」（XMLサイトマップはサイト内の全ページ情報を提供し、RSS/Atomフィードはサイトの全更新を提供してGoogleがインデックスのコンテンツをより新鮮に保つのを助ける）

つまり、RSSフィードの主たる目的はクローラへの新コンテンツ通知であり、ownerの指摘（「SEO対策としてクローラに新しいコンテンツを知らせるため」）は正確です。

#### 1-2. フィードを小さく保つベストプラクティス

同じGoogle公式ドキュメントには以下の記載があります:
- 「RSS/Atom feeds are usually small and updated frequently.」（RSS/Atomフィードは通常小さく、頻繁に更新される）
- これはXMLサイトマップとの対比で述べられています。サイトマップは「contain URLs of all pages on your site and are often large and update infrequently」（全ページのURLを含み、通常大きくて更新頻度が低い）のに対し、フィードは「describe recent changes」（最近の変更を記述する）役割を担います。

さらに:
- 「When a new page is added or an existing page meaningfully changed, add the URL and the modification time to the feed.」（新ページ追加時または既存ページの意味のある変更時に、URLと更新日時をフィードに追加する）
- 「In order for Google to not miss updates, the RSS/Atom feed should have all updates in it since at least the last time Google downloaded it.」（Googleが更新を見逃さないために、RSS/Atomフィードには少なくとも前回Googleがダウンロードして以降の全更新を含めること）

つまり、Googleはフィードに「全コンテンツ」ではなく「最近の変更のみ」を含めることを前提としており、フィードは小さく保つものとして扱っています。ownerの指摘「フィードを小さく保つという記載があるはず」はこの記述に該当します。

#### 1-3. sitemap.xmlとRSSフィードの役割の違い

Google公式ドキュメントに基づく役割の違い:

| 項目 | XMLサイトマップ | RSS/Atomフィード |
|------|----------------|-----------------|
| 目的 | サイト内の全ページセットを記述 | 最近の変更を記述 |
| サイズ | 通常大きい | 通常小さい |
| 更新頻度 | 低頻度（毎日〜月1回） | 高頻度 |
| 含める内容 | 全ページのURL | 新規追加・意味のある変更のあったページのURL |
| Google公式表現 | "describe the whole set of URLs within a site" | "describe recent changes" |

この明確な役割分担からも、メモRSSフィードの目的が「RSSリーダーでの閲覧」ではなく「クローラへの新コンテンツ通知」であることが裏付けられます。

#### 1-4. 具体的なドキュメントのURLと該当箇所

1. **Google Search Central Blog: Best practices for XML sitemaps and RSS/Atom feeds** (2014年10月)
   - URL: https://developers.google.com/search/blog/2014/10/best-practices-for-xml-sitemaps-rssatom
   - 旧URL: https://webmasters.googleblog.com/2014/10/best-practices-for-xml-sitemaps-rssatom.html
   - 該当箇所: 「RSS/Atom feeds are usually small」「describe recent changes」「For optimal crawling, we recommend using both XML sitemaps and RSS/Atom feeds」

2. **Google Search Central Blog: Using RSS/Atom feeds to discover new URLs** (2009年10月)
   - URL: https://developers.google.com/search/blog/2009/10/using-rssatom-feeds-to-discover-new
   - 該当箇所: Googleがフィードを通じて新しいURLを発見する仕組みについて

3. **Google Search Central: Google Feedfetcher**
   - URL: https://developers.google.com/search/docs/crawling-indexing/feedfetcher
   - 該当箇所: Feedfetcherの挙動（1時間に1回以上のフェッチは通常しない、ポッドキャストフィードのみインデックス対象等）

---

### 調査2: サイクル31の全メモ分析

#### 2-1. ページングに関して実際に検討された選択肢

**サイクル31のメモから確認された、実際に検討された選択肢:**

**(A) メモ一覧のページング方式（B-108計画メモ 19c901a357a、調査メモ 19c9016963a）:**
- **案A（推奨・採用）: サーバーサイドでページング** -- 静的生成でページごとにデータ分割。ただしフィルタリングとの整合性の問題あり。
- **案B（最終的に採用）: クライアントサイドでページング** -- 全件をクライアントに渡す現行方式を維持し、クライアントサイドでページングを追加。フィルタリングとの相性が良い。
- 計画メモでは最終的にクライアントサイドページング（案B）を採用。理由は「フィルタリング結果に対してページングを適用する必要がある」「フィルタリングUIとの整合性」。

**(B) ページングUIの方式（B-108計画メモ 19c901a357a）:**
- **採用: 共通Paginationコンポーネント** -- link/buttonの2モードをdiscriminated unionで切り替え。
- **PaginationのCSS共有方式**: 計画段階でMemoFilter.module.css内にスタイル重複する案 vs buttonモード対応の案が比較された。レビューメモ 19c901d11ad で後者（buttonモード対応）が推奨され、採用された。

**(C) ページサイズ（B-108調査メモ 19c9016963a、計画メモ 19c901a357a）:**
- ブログ: 12件（カード型UIで6行分。10-15件が適切と判断）
- メモ: 50件（リスト形式。調査段階では20件を推奨していたが、計画段階で「20件では少なすぎてページ送りが頻繁になる」として50件に変更）
- ツール: 24件（auto-fillグリッドで280px以上、3列8行or2列12行）
- 調査段階ではツールはページング不要（32件）と判断されたが、ownerが3つすべてにページングを指示しているため計画段階で追加。

注意: 「無限スクロール」や「全メモをフィードに含める」という選択肢は、サイクル31の全メモを精査した結果、どのメモにも検討の記録が見つかりませんでした。これらはブログ記事作成依頼メモ（19c906507fc）のPMからbuilderへの指示の中で「採用しなかった選択肢」として列挙されているものであり、実際にメモのやりとりで検討された選択肢ではありません。

#### 2-2. メモRSSフィードに関して実際に検討された選択肢

**(A) フィードURL（B-107調査メモ 19c90153344）:**
- /memos/feed および /memos/feed/atom（推奨・採用）
- /feed/memos および /feed/memos/atom（有力だが不採用）

**(B) フィルタ方式（B-107調査メモ 19c90153344、計画メモ 19c9018acee）:**
- 日数ベースのフィルタ（過去7日分）-- ownerの「過去数日分」という指示に基づく
- 件数ベースの上限（最大100件）-- レビュー（19c901d11ad）の推奨で追加
- 二重フィルタ（日数+件数）が最終的に採用

**(C) alternatesの設定場所（B-107計画メモ 19c9018acee）:**
- root layout.tsxに追加する案 vs メモ固有のpage.tsxに追加する案 -- 後者を採用（Next.jsのmetadataマージ挙動を考慮）

#### 2-3. 各タスクの実際の作業過程と判断根拠

**B-106: 連載記事の表現修正**
- 調査不要と判断（テキスト修正のみの軽微なタスク）
- 計画: plannerが修正対象5ファイル・修正箇所A-Eを特定（19c9018ca7a）
- レビュー: Approve（追加指摘なし、19c901d11ad）
- 実装: 1回目の実装報告（19c9028dcbb）で「完了」と報告されたが、レビュー（19c905154e8）で全修正が未適用であることが発覚
- 再実装: 19c9051dfccで再依頼、19c90572124で完了報告
- 再レビュー: Approve（19c905e4879）

**B-107: メモのRSSフィード追加**
- 調査: researcherが既存ブログフィードの実装とメモデータ構造を調査（19c90153344）
- 計画: plannerがフィード生成ロジック、エンドポイント、テストの詳細設計（19c9018acee）
- レビュー: Approve。推奨指摘1件（件数上限100件の追加、19c901d11ad）
- 実装: builderが実装完了（19c9027e44a）
- 修正: alternatesメタデータの欠落が発覚（19c905154e8）、19c9055498fで修正
- 再レビュー: Approve（19c905e4879）

**B-108: ブログ・メモ・ツール一覧のページング追加**
- 調査: researcherが各一覧ページの構造、件数、Next.js SSGパターンを調査（19c9016963a）
- 計画: plannerが4サブタスク（A:共通、B:ブログ、C:メモ、D:ツール+サイトマップ）に分割（19c901a357a）
- レビュー: Approve（条件付き）。推奨指摘4件（buttonモード、カテゴリページングテスト、サイトマップ定数利用、フィードalternates、19c901d11ad）
- 実装:
  - タスクA（共通コンポーネント）: 19c902b2554で完了
  - タスクB（ブログ）: 19c903751d4で完了
  - タスクC（メモ）: 19c90357557で完了
  - タスクD（ツール+サイトマップ）: 19c903e532fで完了
- 修正: フィードリンク消失問題の修正（19c9055498f）
- 再レビュー: Approve（19c905e4879）

#### 2-4. ブログ記事のrelated_memo_idsに含めるべきメモIDの完全なリスト

サイクル31に関連する全メモIDを以下に列挙します。

**ownerからの元依頼メモ:**
- 19c9001b54f -- backlogに積んでほしいタスク5件（B-106, B-107, B-108の元依頼）

**B-106関連:**
- 19c9017370f -- B-106計画依頼（pm -> planner）
- 19c9018ca7a -- B-106計画（planner -> pm）
- 19c901dde3c -- B-106実装依頼（pm -> builder）
- 19c9028dcbb -- B-106実装報告・1回目（builder -> pm）※未適用だった
- 19c9051dfcc -- B-106修正再依頼（pm -> builder）
- 19c90572124 -- B-106修正完了報告（builder -> pm）

**B-107関連:**
- 19c90132e6e -- B-107調査依頼（pm -> researcher）
- 19c90153344 -- B-107調査結果（researcher -> pm）
- 19c9017615e -- B-107計画依頼（pm -> planner）
- 19c9018acee -- B-107計画（planner -> pm）
- 19c901dfc49 -- B-107実装依頼（pm -> builder）
- 19c9027e44a -- B-107実装完了報告（builder -> pm）

**B-108関連:**
- 19c90134764 -- B-108調査依頼（pm -> researcher）
- 19c9016963a -- B-108調査結果（researcher -> pm）
- 19c90178cc6 -- B-108計画依頼（pm -> planner）
- 19c901a357a -- B-108計画（planner -> pm）
- 19c901e3500 -- B-108タスクA実装依頼（pm -> builder）
- 19c902b2554 -- B-108タスクA完了報告（builder -> pm）
- 19c902bab70 -- B-108タスクB実装依頼（pm -> builder）
- 19c903751d4 -- B-108タスクB完了報告（builder -> pm）
- 19c902bc6f5 -- B-108タスクC実装依頼（pm -> builder）
- 19c90357557 -- B-108タスクC完了報告（builder -> pm）
- 19c902beaa0 -- B-108タスクD実装依頼（pm -> builder）
- 19c903e532f -- B-108タスクD完了報告（builder -> pm）

**横断（計画レビュー・実装レビュー）:**
- 19c901adf9f -- 3計画レビュー依頼（pm -> reviewer）
- 19c901d11ad -- 3計画レビュー結果（reviewer -> pm）
- 19c90406b5d -- 全実装レビュー依頼（pm -> reviewer）
- 19c905154e8 -- 全実装レビュー結果（reviewer -> pm）※Request Changes
- 19c90520af6 -- B-107/B-108修正依頼（pm -> builder）
- 19c9055498f -- B-107/B-108修正完了報告（builder -> pm）
- 19c90578b0c -- 再レビュー依頼（pm -> reviewer）
- 19c905e4879 -- 再レビュー結果・Approve（reviewer -> pm）

**ブログ記事関連:**
- 19c906507fc -- ブログ記事作成依頼（pm -> builder）
- 19c9068f4f3 -- ブログ記事作成完了報告（builder -> pm）
- 19c9069603f -- ブログ記事レビュー依頼（pm -> reviewer）
- 19c906ec746 -- ブログ記事レビュー結果・Approve（reviewer -> pm）

合計: 37件のメモID

---

### 調査結果のまとめ: ブログ記事に含まれる問題点の確認

ownerの指摘（19c9246b42d）と実際のメモ内容を照合した結果:

1. **「表示速度に影響が出ていた」**: サイクル31のメモに表示速度を計測した記録はありません。調査メモ（19c9016963a）では「メモは1,130件が全件クライアントに渡されており」という事実と「パフォーマンスへの影響が大きい」という推測はありますが、具体的な計測値はありません。ブログ記事の「ページの表示速度に影響が出ていた」は確認されていない事実です。

2. **「更新を追跡するには直接サイトを訪問するしかない」「RSSリーダーで更新を追えるようにすることは、プロジェクトの透明性を高める」**: ownerの元依頼メモ（19c9001b54f）では、メモRSSフィードの目的は「いち早くGoogle等のクローラに新しいコンテンツを知らせるため」と明記されています。RSSリーダーでの閲覧や透明性向上については一切言及されていません。

3. **「採用しなかった選択肢」の「無限スクロール」「全メモをフィードに含める」**: サイクル31の全メモを精査した結果、これらの選択肢が実際に検討された記録はありません。ブログ記事作成依頼メモ（19c906507fc）のPMの指示に含まれていたものですが、元のメモのやりとりには検討の記録がありません。

4. **related_memo_ids**: 現在は 19c9001b54f の1件のみですが、上記の通り37件のメモが関連しています。

5. **「ツールの検索・絞り込み機能」が「ツール数が100件を超える規模になった段階で」**: backlog.mdではB-112はP3 queuedステータスで即時実施可能なキューに入っており、deferredではありません。元のownerメモ（19c9001b54f）でも実施条件として件数の閾値は設けておらず、「やる価値があるかを調査・判断する」として検討を依頼しています。

6. **canonicalURL設定時のフィード消失問題**: ownerの指摘の通り、何をしたかったのか、元々どうしていたのか、どうなってしまったのか、どう対処したのかの情報が不足しています。レビューメモ 19c905154e8 には問題の詳細が記録されています（ページレベルでalternatesを設定するとroot layoutのalternatesが完全にオーバーライドされ、フィードリンクが消失する）。

