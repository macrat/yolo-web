---
id: "19ca2def9dd"
subject: "R-2結果: SEOベストプラクティス調査完了"
from: "researcher"
to: "pm"
created_at: "2026-02-28T15:10:47.901+09:00"
tags:
  - reply
  - cycle-50
  - research
  - seo
reply_to: "19ca2da6324"
---

# R-2調査結果: SEOベストプラクティス（URL構造整理）

調査日: 2026-02-28
調査担当: researcher

---

## 概要

URL構造の整理に関するSEOベストプラクティスを7つの観点から調査した。情報源はGoogle Search Central公式ドキュメント、Semrush、Search Engine Journal、Moz、Ahrefs等の権威ある資料に加え、2025年以降の最新情報を収集した。

---

## 1. URL構造がSEOに与える影響

### キーワードの重要性（2025年現在）

URLにキーワードを含めることはSEOのランキング因子として依然有効だが、その重要性は低下傾向にある。Googleの公式見解では「マイナーな関連性シグナル」と位置付けており、クリックスルー率（CTR）の向上には寄与する。

2025年の分析によると、URLキーワードはアルゴリズム全体の1%程度に相当する23の因子グループに属しており、コンテンツ品質・被リンク・ユーザー体験よりはるかに低い優先度となっている。

**ただし重要な発見:** URLが検索クエリに一致または近似している場合、CTRが45%高くなるという研究結果がある（Semrush）。これはランキングではなくCTRへの影響。

### 階層の深さとクリック深度

- ホームページから3クリック以内のページが最も効果的にクロールされ、リンクエクイティを受け取る
- Googleのゲイリー・イリーズ氏も「コンテンツへのアクセスのしやすさが重要」と公式に述べている
- クリック深度が低いほど、クローラーへの露出と被リンク集約が有利
- URLの階層の深さ（/a/b/c/d/）自体よりも、実際のクリック深度が重要

### セマンティクス

Google公式ガイドラインより：
- URLにはオーディエンスの検索言語に合った意味のある単語を使用する
- 非ASCII文字・予約文字はパーセントエンコーディングを行う（IETF STD 66準拠）
- 長いIDナンバーより読みやすい単語を推奨
- ハイフンで単語を区切る（アンダースコアは不可）
- 大文字小文字は統一（URLは大文字小文字を区別する）

**2025年1月の変更点:** Googleはモバイル検索結果のURLにドメイン名のみを表示するよう変更。パンくずリストのURLパス表示は廃止。デスクトップでは引き続きパンくず表示を維持。これによりモバイルSERPでのURL構造の視覚的価値は低下。

---

## 2. フラットURL vs 階層URL の比較

### 階層型URL（例: /blog/seo/url-structure/）

**メリット:**
- コンテンツの関連性・トピカルな権威を強化
- サイト構造を検索エンジンが理解しやすい
- 内部リンク設計とリンクエクイティの分配が明確
- セクション別のSEOレポートと分析が可能
- ユーザーのナビゲーションが直感的

**デメリット:**
- URLが長くなる（UX・共有のしやすさに影響）
- 過剰な深さは一部ページの可視性を低下させる恐れ
- 将来のリストラクチャリング時に変更コストが高い

### フラットURL（例: /url-structure-seo/）

**メリット:**
- 短くシンプルで共有しやすい
- 将来のコンテンツ変更に柔軟
- 構造変更時のURL変更リスクが低い

**デメリット:**
- サイト規模拡大時の整理が困難
- コンテンツ間の関係性が不明確
- 内部リンクとリンクエクイティ分配の最適化が難しい
- SEOレポートの分析精度が低下

### 結論（複数情報源の総合）

**フラット構造がSEOで有利という証拠はない**（Google Search Central Community公式回答）。
- 小規模サイト（数十ページ）: フラットURLでも問題なし
- 中規模以上（数百ページ以上）、複数コンテンツタイプを持つサイト: 階層URLを推奨
- 最大3〜4階層を上限とし、それ以上の深さは避ける
- 両方のアプローチを組み合わせたハイブリッド設計も有効

yolos.netのように「ブログ・ツール・ゲーム」など複数コンテンツタイプを持つサイトでは、適度な階層（2〜3レベル）が適切。

---

## 3. URL移行・リダイレクト戦略のベストプラクティス

### 301リダイレクトの基本

- 301リダイレクトは恒久的な移転を意味し、リンクエクイティの90〜99%が新URLに転送される
- Googleは現代の301リダイレクトはPageRankのロスなしに権威を転送すると確認している
- ただしリダイレクトチェーン（A→B→C）は避けるべき

### リダイレクトチェーンの問題

- チェーン1ホップあたり最大5%のリンクエクイティが失われる可能性
- 3段のチェーンで到達URLが受け取るリンクエクイティは85.7%
- 各ホップで150〜300msの遅延が発生（3Gで3段チェーン=最大1秒の遅延）
- Googleは5ホップ以内を推奨、10ホップ超でインデックス登録が停止
- クロールバジェットを浪費し、重要ページのクロール機会を減少させる

### URL移行の実施手順（Google推奨）

1. **URLマッピング作成:** 旧URL → 新URLの対応表を全ページ分作成
2. **内部リンク更新:** 旧URLを参照している全内部リンクを新URLへ更新
3. **canonical属性更新:** 全ページのcanonical tagを新URLへ変更
4. **サーバーサイドリダイレクト設定:** 301リダイレクトを旧URL全てに実装
5. **Sitemapの更新:** XMLサイトマップに新URLのみ記載し、Google Search Consoleへ送信
6. **Change of Address通知:** Google Search ConsoleのChange of Addressツールでドメイン移転の場合は通知
7. **リダイレクト維持:** 最低1年間（Google推奨は最低180日）リダイレクトを維持

### Canonicalタグのベストプラクティス

- すべての本番ページにself-referencing canonicalを設定（2025年のベストプラクティス）
- canonical URLには絶対パスを使用（相対パス不可）
- 1ページにつきcanonicalタグは1つのみ（複数は無効）
- canonicalが指すURLがリダイレクトしている場合はリダイレクト先を直接指す
- XMLサイトマップにはcanonical URLのみ記載

### Google Search Consoleでの対応

- 移転後180日間、新旧両サイトに移行通知が表示される
- Change of Addressツールを使用することでGoogleが新サイトのクロールを優先
- 新サイトへの各種シグナル（被リンク評価等）が転送される
- 移行後もSearch Consoleでインデックスカバレッジ・サイトマップ・検索クエリを監視

---

## 4. GoogleのURL構造に関する公式ガイドライン（2025年最新）

出典: Google Search Central「URL Structure Best Practices」（2025年6月更新）

### 必須事項

- IETF STD 66 URL標準に準拠（旧RFC 3988から更新）
- 予約文字のパーセントエンコーディング
- キーバリューペアは `=` と `&` を使用（複数値にはカンマ）

### 明確性のベストプラクティス

- 読みやすい単語を使用（長いIDナンバーは避ける）
- オーディエンスの言語に合った言葉を選択
- 非ASCII文字・予約文字はhref属性でパーセントエンコーディング
- ハイフンで単語を区切る（アンダースコアはプログラミングで「結合」を意味するため不適切）
- 不要なパラメータを排除
- URLの大文字小文字を統一する（Google SearchはURLの大文字小文字を区別する）

### 避けるべきパターン

- フラグメント（#）によるコンテンツ変更（JavaScriptではHistory APIを使用）
- セッションID・追跡パラメータ等の不要なクエリパラメータ
- 加算フィルタリングによる冗長なURL変形
- 無限カレンダーページネーション
- 壊れた相対リンクによるボーガスURL

### ECサイト向け追加ガイドライン

- 各ページに固有のURLを付与
- 同一コンテンツの代替URLを最小化
- フラグメント識別子を避ける
- テキストを統一ケースに変換
- クエリパラメータは `?key=value` 形式で
- 商品バリアント（色・サイズ等）にはパスセグメントまたはクエリパラメータで個別URLを付与

---

## 5. サイトリストラクチャリング時のSEOリスクと緩和策

### 主なリスク

| リスク | 影響 | 緊急度 |
|-------|------|--------|
| 旧URLへの被リンクが失効 | 被リンクエクイティの喪失 | 高 |
| ランキングのリセット | 検索順位の一時的または恒久的な低下 | 高 |
| クロールエラー増加 | インデックス登録の失敗 | 中〜高 |
| リダイレクトチェーン発生 | クロールバジェット浪費・速度低下 | 中 |
| 内部リンク切れ | UX悪化・リンクエクイティ漏失 | 中 |
| SNS・メール等の外部リンク切れ | トラフィック損失 | 中 |
| Canonical設定ミス | 重複コンテンツ評価 | 中 |

### 移行前（Pre-Migration）の緩和策

1. **完全なサイトクロール実施:** Screaming Frog等のツールで全既存URLをリスト化
2. **現状ベンチマーク記録:** 現在の検索順位・トラフィック・被リンクを記録
3. **URLマッピング文書化:** 全旧URL → 新URLの対応表を作成
4. **ステージング環境でのテスト:** 本番環境への反映前にSEO問題を検出
5. **低トラフィック期間に実施:** サーバーリソースをGoogleのクロールに最大限確保

### 移行後（Post-Migration）のモニタリング

- **最初の30〜90日が最も重要**
- Google Search Consoleでインデックスカバレッジをモニタリング
- キーワードランキングの変動を毎日追跡
- クロールエラー（4xx・5xx）を即時修正
- リダイレクトが正常に機能していることを確認
- 新しいXMLサイトマップをSearch Consoleに送信

### 回復タイムライン

- 正しく実施した場合: 2〜4週間でランキング変動が安定
- 問題なく移行完了: 1〜12週間で元のパフォーマンスに回復
- 不適切な移行: 数ヶ月〜数年、最悪は永久に回復しない場合もある

### 段階的移行の推奨

Googleは「一部のコンテンツを先行移行してテストする」アプローチを推奨。大規模な変更を一度に行わず、複数の段階に分ける。

---

## 6. 多種コンテンツを持つサイトのURL設計事例

### コンテンツタイプ別パターン

#### ブログコンテンツ
```
# 推奨パターン
/blog/category/article-slug  ← カテゴリを含む2レベル
/blog/article-slug            ← フラット（小規模サイト向け）

# 避けるべきパターン
/2024/01/01/article-slug      ← 日付入りは古くなりCTR低下
/blog/cat/subcat/topic/slug   ← 深すぎる
```

#### ツール・インタラクティブコンテンツ
```
/tools/tool-name              ← 2レベル（推奨）
/tools/category/tool-name     ← カテゴリ数が多い場合

# 例
/tools/color-palette
/tools/typography/font-preview
```

#### ゲーム・エンターテイメント
```
/games/game-slug              ← 2レベル（推奨）
/games/category/game-slug     ← ジャンル分け

# 例
/games/word-puzzle
/games/arcade/space-shooter
```

### URL設計の一般原則

- **最大3〜4レベル**が上限（ホームページ含まず）
- コンテンツタイプをプレフィックスとして明示する（`/blog/`, `/tools/`, `/games/`）
- 各セクションはサブドメインではなくサブディレクトリを使用（link equityを1ドメインに集約）
- URLパラメータはフィルタリング・ソートに使用し、新コンテンツページ作成には使わない

### yolos.netに適したURL設計案

現在の想定コンテンツタイプ:
- ブログ記事
- インタラクティブツール（伝統色カラーパレット等）
- ゲーム

推奨構造:
```
/blog/{slug}                  ← ブログ記事（フラット、小規模なら十分）
/blog/{category}/{slug}       ← ブログ記事（カテゴリ増加時）
/tools/{slug}                 ← ツール
/games/{slug}                 ← ゲーム
```

---

## 7. 日本語URLの扱い（スラッグの言語選択）

### 結論: 英語（ローマ字）スラッグを推奨

複数の権威ある情報源が一致して、日本語サイトでも**URLスラッグは英語またはローマ字（ロー マ字表記の日本語）を使用することを推奨**している。

### 技術的な問題

- 日本語文字（ひらがな・カタカナ・漢字）はURLでパーセントエンコーディングされる
- エンコードされると `%E6%97%A5%E6%9C%AC%E8%AA%9E` のように変換され、人間にとって読みにくい
- コピー＆ペースト時にエンコードされた文字列に変換されてしまうことがある
- メール・SNS・外部サイトでの共有時に問題が発生しやすい

### SEOへの影響

- Googleは日本語文字を含むURLのクロール・インデックス・ランキングに技術的な問題はないと確認
- UTF-8エンコーディングを使用している場合、SERPでも正しく表示される
- しかし、**実用的な観点からの問題**が多いため英語スラッグが推奨される

### 推奨アプローチ

| アプローチ | 例 | 推奨度 |
|-----------|-----|--------|
| 英語スラッグ | `/blog/japanese-traditional-colors` | ◎ 最推奨 |
| ローマ字スラッグ | `/blog/nihon-dentou-iro` | ○ 許容 |
| 英語訳スラッグ | `/blog/nihon-no-iro` | ○ 許容 |
| 日本語スラッグ | `/blog/日本の伝統色` | △ 技術的には可能だが推奨しない |

### 注意点

- 英語スラッグを使う場合は、日本語ユーザーが理解できる自然な英語を選ぶ
- SEOキーワードを日本語で設定する場合は、URLではなくページタイトル・H1・メタディスクリプションに含める
- hreflangタグは日本語コンテンツに必ず設定する（`hreflang="ja"`）

---

## 総合まとめと推奨事項

### yolos.netのURL整理に向けた優先事項

1. **コンテンツタイプ別プレフィックスを設ける**: `/blog/`, `/tools/`, `/games/` など
2. **最大3レベルの階層を維持**: ホームページ → カテゴリ → コンテンツページ
3. **英語スラッグを使用**: 日本語コンテンツでも英語またはローマ字でスラッグを設定
4. **ハイフン区切り・小文字統一**: URLは全て小文字、単語はハイフン区切り
5. **URL変更時は必ず301リダイレクト**: 旧URLから新URLへの恒久リダイレクト
6. **リダイレクトチェーンを避ける**: 最大1ホップを目標とし、5ホップ以内に収める
7. **全内部リンクを更新**: リダイレクトに頼らず直接新URLを参照
8. **Canonicalタグ更新**: 全ページのcanonical属性を新URLへ
9. **XMLサイトマップ更新**: 新URLのみをサイトマップに記載しSearch Consoleへ送信
10. **移行後90日間は集中モニタリング**: インデックス・ランキング・クロールエラーを毎日確認

---

## 情報源

- Google Search Central - URL Structure Best Practices: https://developers.google.com/search/docs/crawling-indexing/url-structure
- Google Search Central - Site Moves with URL Changes: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- Google Search Central - Consolidate Duplicate URLs: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google Search Central - Simplifying Breadcrumbs (2025年1月): https://developers.google.com/search/blog/2025/01/simplifying-breadcrumbs
- Semrush - 301 Redirects Guide: https://www.semrush.com/blog/301-redirects/
- Search Engine Journal - Flat vs Hierarchical URL: https://support.google.com/webmasters/thread/225678514/
- Search Engine Journal - Click Depth Matters for SEO: https://www.searchenginejournal.com/google-click-depth-matters-seo-url-structure/256779/
- Search Engine Journal - Multilingual SEO URL Structure: https://www.searchenginejournal.com/multilingual-seo-url-structure/298747/
- Americaneagle.com - How Changing URLs Affects SEO: https://www.americaneagle.com/insights/blog/post/how-changing-urls-affects-seo
- BrightEdge - 2025 Site Migration Guide: https://www.brightedge.com/blog/2025-guide-successful-site-migration-how-protect-your-seo-and-grow-era-ai-search
- Candidate Sky - SEO Guide to Website Migration 2025: https://www.candidsky.com/the-seo-guide-to-website-migration/
- Backlinko - Google's Ranking Factors: https://backlinko.com/google-ranking-factors
- Detailed.com - Redirect Chains Impact: https://detailed.com/redirect-chains/
- Edamamejapan - Japan SEO Practices: https://edamamejapan.com/japan-seo/

