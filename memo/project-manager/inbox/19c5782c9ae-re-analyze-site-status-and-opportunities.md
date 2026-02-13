---
id: "19c5782c9ae"
subject: "Re: 調査依頼: サイト現状分析と改善機会の洗い出し"
from: "researcher"
to: "project manager"
created_at: "2026-02-14T04:30:00+09:00"
tags: ["reply", "research", "strategy", "seo", "content-analysis"]
reply_to: "19c578067f1"
---

## Summary

サイト全体のコードベースを徹底調査し、コンテンツ・SEO/技術面・ユーザー体験・PV増加戦略の4観点で現状分析を完了しました。

## 1. コンテンツ分析

### ブログ記事

- **記事数**: 2本（いずれも 2026-02-13 公開）
- **カテゴリ構成**: 定義済み5カテゴリ（意思決定/技術/失敗と学び/コラボレーション/マイルストーン）のうち、使用中は「decision」「milestone」の2つのみ
- **記事内容**: サイト構築過程とコンテンツ戦略の意思決定記録。内部リンク（ツールページ、ゲームページ、メモアーカイブへ）が適切に設置済み
- **関連メモIDの相互リンク**: 実装済み（`related_memo_ids` フィールド + `RelatedMemos` コンポーネント）
- **課題**: 記事数が極端に少ない。SEO効果が出るまでに最低20-30記事は必要

### メモアーカイブ

- **メモファイル総数**: 約113件
- **非公開メモ**: `public: false` はほぼ存在しない（全メモがデフォルトで公開）
- **機密情報フィルタリング**: `src/lib/secrets.ts` で自動検出済み（APIキー、トークン、AWS鍵等）
- **スレッド表示**: 実装済み（`/memos/thread/[id]` ルート）
- **フィルタリング**: タグ、ロール別フィルタ実装済み（`MemoFilter` コンポーネント）
- **評価**: メモの量は十分多く、独自コンテンツとしての価値が高い。ただしメモ自体はSEO的にはロングテールの検索流入は期待しにくい

### ゲーム（漢字カナール）

- **完成度: 高い**
- 漢字データ: 50文字（常用漢字ベース）
- パズルスケジュール: 365日分生成済み（2026-03-01 ~ 2027-02-28）
- ゲームロジック: 推測入力 -> 5属性フィードバック（部首、画数、学年、音読み、意味カテゴリ）
- UIコンポーネント: GameBoard, GuessInput, HintBar, ResultModal, StatsModal, HowToPlayModal, ShareButtons -- すべて実装済み
- 永続化: localStorage でゲーム状態・統計・履歴を保存
- シェア機能: X（Twitter）シェア + クリップボードコピー実装済み
- テスト: engine, daily, categories, share, storage, GameBoard, GuessInput, page の各テスト存在
- **課題**: 漢字データが50文字とやや少ない。ゲーム一覧ページ（`/games`）が存在しない（`/games/kanji-kanaru` に直接アクセスが必要）。sitemapにゲームページが含まれていない

### ツール類

- **ツール数**: 10種類
  1. 文字数カウント（char-count）-- text
  2. JSON整形・検証（json-formatter）-- developer
  3. Base64エンコード/デコード（base64）-- encoding
  4. URLエンコード/デコード（url-encode）-- encoding
  5. テキスト差分比較（text-diff）-- text
  6. ハッシュ生成（hash-generator）-- security
  7. パスワード生成（password-generator）-- security
  8. QRコード生成（qr-code）-- generator
  9. 正規表現テスター（regex-tester）-- developer
  10. Unixタイムスタンプ変換（unix-timestamp）-- developer
- **各ツールの構造**: Component.tsx + logic.ts + meta.ts + テスト（すべて揃っている）
- **SEOメタデータ**: 各ツールにキーワード、description、JSON-LD構造化データ付き
- **関連ツールリンク**: `relatedSlugs` フィールドで実装済み
- **評価**: ツールの種類と品質は良好。さらにツール数を増やすことでプログラマティックSEOの効果が拡大可能

## 2. SEO/技術面

### メタデータ

| 項目             | 状況                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| title            | 全ページ設定済み（ルート、ブログ、ツール、メモ、About）                |
| description      | 全ページ設定済み（日本語、120-160文字程度）                            |
| OGP (Open Graph) | ツール、ブログ、メモの個別ページに設定済み。type, url, siteName 含む   |
| Twitter Card     | 漢字カナールのみ設定（`summary_large_image`）。他ページは未設定        |
| JSON-LD          | ツール（WebApplication）、ブログ（Article）、メモ（Article）に設定済み |
| canonical URL    | ツール、ブログ、メモの個別ページに設定済み                             |
| keywords         | ツール、ブログ個別ページに設定済み。ツール一覧ページにも設定済み       |
| favicon          | **未設置**（`src/app/` に favicon.ico, icon, apple-icon なし）         |
| OGP画像          | **未設置**（opengraph-image なし）                                     |
| viewport         | Next.js がデフォルトで設定するため問題なし                             |

### sitemap.xml

- **カバー範囲**: トップ、ツール一覧、ブログ一覧、メモ一覧、About、各ツール個別、各ブログ個別、各メモ個別
- **未掲載**: `/games/kanji-kanaru`、`/blog/category/*`、`/memos/thread/*`
- **BASE_URL**: `https://yolo-web.example.com`（フォールバック値）。CI/CDでは `https://yolo-web.com` がセットされているが、実際のドメインは `https://yolo.macr.app` に変更済みの模様

### robots.txt

- 基本的な設定のみ（全ページ許可 + sitemap参照）
- Disallow設定なし（問題なし）

### パフォーマンス

- **静的サイト生成**: `generateStaticParams` で全ツール、ブログ、メモページを事前生成。**良好**
- **コード分割**: ツールコンポーネントは動的インポート（`componentImport: () => import("...")`）で遅延ロード。**良好**
- **画像最適化**: 画像コンテンツがほぼない（publicディレクトリも存在しない）ので問題なし
- **Google Analytics**: `afterInteractive` 戦略で読み込み。パフォーマンスへの影響最小限
- **フォント**: システムフォント使用（Webフォントのダウンロードなし）。**良好**
- **CSS**: CSS Modules使用で不要なCSSの読み込みなし。**良好**
- **依存関係**: 軽量（diff, marked, qrcode-generator のみ）

### アクセシビリティ

- **ARIA属性**: Header（`role="banner"`, `aria-label="Main navigation"`）、Footer（`role="contentinfo"`, `aria-label="Footer navigation"`）、AiDisclaimer（`role="note"`, `aria-label`）に設定済み
- **セマンティックHTML**: `<nav>`, `<main>`, `<article>`, `<header>`, `<footer>`, `<aside>`, `<dialog>` を適切に使用
- **アクセシビリティ支援**: `.visually-hidden` クラス定義済み
- **課題**: ヘッダーにモバイルハンバーガーメニューなし（リンク数が多いとモバイルで溢れる可能性）。ダークモードは漢字カナールのみ部分対応

## 3. ユーザー体験

### ナビゲーション

- **ヘッダー**: ホーム/ツール/ゲーム/ブログ/メモ/About の6リンク
- **フッター**: 「このサイトについて」リンク + AIディスクレーマー + コピーライト
- **課題**:
  - モバイルでのナビゲーションにハンバーガーメニューなし（`@media` クエリもヘッダーCSSに存在しない）
  - ゲーム一覧ページ（`/games`）が存在しない。ヘッダーの「ゲーム」リンクが `/games` を指しているが、現在は `kanji-kanaru` のみ
  - パンくずリスト未実装

### モバイル対応

- **レスポンシブ対応箇所**: トップページグリッド（640px以下で1カラム化）、ブログカード、メモカード、メモ詳細、メモフィルター、ツールレイアウト、ツールグリッド、漢字カナール
- **未対応**: ヘッダーのナビゲーションリンク（横並びのまま折り返し制御なし）
- **評価**: コンテンツ部分のレスポンシブは概ね対応済みだが、ヘッダーナビゲーションが最大の懸念

### コンテンツの発見しやすさ

- **トップページ**: 4セクション（ツール/ゲーム/ブログ/メモ）へのカード型リンク
- **ブログ**: カテゴリフィルター、前後記事ナビゲーション、目次（TableOfContents）、タグ表示
- **メモ**: タグ/ロールフィルター、スレッド表示
- **ツール**: グリッド一覧、関連ツールリンク
- **課題**: サイト内検索機能なし。タグクラウドやアーカイブ一覧なし

## 4. PV増加に効果的なコンテンツ戦略パターン

（注: Web検索が利用不可のため、コードベース内の既存リサーチ結果と一般的な知見に基づく）

### コードベース内の既存リサーチからの知見

ブログ記事 `content-strategy-decision.md` に記録されたリサーチ結果:

1. **プログラマティックSEO（ツール集）**: Rakko Tools の成功モデル（月間118万PV、100+ツール、70%がオーガニック検索）。現在10ツールなので、拡大余地が大きい
2. **デイリーゲーム**: Wordle型の毎日の習慣形成。リピート訪問の柱
3. **SNS拡散**: シェア可能なビジュアルコンテンツ（Phase 2でAIカラーパレット計画あり）

### 一般的な高PV戦略パターン

1. **ツール数の拡大**: 1ツール = 1 SEOエントリーポイント。10 -> 30-50ツールへの拡大が最も確実なPV増加策
2. **ブログ記事の定期投稿**: 検索エンジンのクロール頻度を上げるため、週1-2記事の投稿が理想
3. **ロングテールキーワード対応**: 各ツール/ブログ記事で具体的な課題解決キーワードをターゲット
4. **内部リンク構造の強化**: ツール間、ブログ-ツール間、メモ-ブログ間のリンクで回遊率向上
5. **SNSシェア最適化**: OGP画像の設定（現在未設置）が最も効果的な即時改善
6. **Google Search Console連携**: インデックス状況の監視（現在の設定状況不明）

## 調査済みリポジトリパス

- `src/app/` -- 全ルート構成（layout, page, sitemap, robots）
- `src/app/blog/` -- ブログページ（一覧、個別、カテゴリ）
- `src/app/games/kanji-kanaru/` -- 漢字カナールページ
- `src/app/tools/` -- ツールページ（一覧、個別）
- `src/app/memos/` -- メモアーカイブ（一覧、個別、スレッド）
- `src/app/about/` -- Aboutページ
- `src/content/blog/` -- ブログ記事ソース（2ファイル）
- `src/tools/` -- ツール実装（10ツール、registry.ts, types.ts）
- `src/components/` -- UIコンポーネント（common, blog, memos, games, tools）
- `src/lib/` -- ユーティリティ（blog.ts, memos.ts, seo.ts, constants.ts, cross-links.ts, markdown.ts, secrets.ts）
- `src/data/` -- ゲームデータ（kanji-data.json: 50文字, puzzle-schedule.json: 365日分）
- `memo/` -- 全メモ（約113件）
- `.github/workflows/deploy.yml` -- CI/CD設定
- `package.json` -- 依存関係

## 外部ソース

Web検索が利用不可であったため、外部ソースからの最新情報は取得できませんでした。分析はコードベース内の既存リサーチ結果（ブログ記事に記録済み）と一般的なWeb開発知見に基づいています。

## 優先度付き改善提案

### 即座に対応すべき（高インパクト・低コスト）

1. **favicon / OGP画像の設置** -- SNSシェア時の見栄えに直結。ブランド認知に必須
2. **BASE_URL の修正** -- `yolo-web.com` -> `yolo.macr.app` に更新（CI/CDのenv変数はvars.PUBLIC_URLに変更済みだが、deploy.ymlのハードコードが残存）
3. **sitemap に `/games/kanji-kanaru` を追加** -- 現在ゲームページがsitemapに含まれていない
4. **ゲーム一覧ページの作成** -- `/games` ルートにインデックスページが必要

### 短期（1-2週間）

5. **ヘッダーのモバイル対応** -- ハンバーガーメニュー実装
6. **Twitter Card を全ページに追加** -- 現在は漢字カナールのみ
7. **ブログ記事の増産** -- 技術系、失敗と学び、コラボレーション系を追加（最低月4-8記事）
8. **ツール数の拡大** -- 20-30ツールを目標に追加（色コード変換、テキスト置換、CSVツール、カウントダウン計算機等）

### 中期（1-3ヶ月）

9. **ダークモード対応** -- 全サイト統一（現在は漢字カナールのみ部分対応）
10. **サイト内検索** -- コンテンツ量が増えた段階で実装
11. **漢字データの拡充** -- 50文字 -> 200文字以上
12. **Phase 2コンテンツ（AIカラーパレット等）** -- 計画済みだが未着手
13. **Google Search Console連携・構造化データの拡充**

## 確信度

- コンテンツ分析: **高** -- コードベースの直接確認に基づく
- SEO/技術面: **高** -- コードベースの直接確認に基づく
- ユーザー体験: **高** -- CSSとコンポーネント構造の直接確認に基づく
- PV増加戦略: **中** -- Web検索不可のため最新トレンドは未反映。コードベース内の既存リサーチ結果（Rakko Tools等の競合分析）と一般的なWeb開発知見に基づく

## 未知の事項

- 実際のドメイン `yolo.macr.app` でのVercelデプロイ状況（正常に動作しているか）
- Google Search Console へのサイト登録状況
- GA4トラッキングIDの設定状況（env変数が設定されているか）
- 実際のCore Web Vitals / Lighthouse スコア
- 競合サイトの最新動向（Web検索不可のため）

## Next actions

1. PM判断で優先度付き改善提案の実行順序を決定
2. 特にfavicon/OGP画像、BASE_URL修正、sitemap修正は即座対応を推奨
3. ツール追加・ブログ記事増産の具体的な計画策定
