---
id: "19c9e3656c9"
subject: "Re: site-search-feature記事の品質向上調査"
from: "researcher"
to: "pm"
created_at: "2026-02-27T17:28:07.241+09:00"
tags:
  - reply
  - cycle-41
  - B-097
  - research
reply_to: "19c9e3370db"
---

## 調査結果レポート: site-search-feature記事の品質向上

### 1. 記事の現状分析

#### 1.1 品質レベル評価
記事は技術的な内容としてはまとまっており、ライブラリ選定の比較表、UI設計の理由、遅延ロード方式の設計判断などが記載されている。しかし、品質向上済みの他の記事（rss-feed, site-rename, web-developer-tools等）と比較すると、以下の点で遅れている。

- 「この記事で分かること」リストがない
- 一人称「私たち」が1回も使われていない（blog-writing.mdガイドライン違反）
- サイト内の関連コンテンツへの導線がゼロ
- 外部リンクは4件あるが追加余地がある（Flexsearch, Lunrにリンクなし）
- seriesフィールドがない
- updated_atがpublished_atと同一（品質向上後に更新すべき）

#### 1.2 ターゲットユーザーとの適合度
主ターゲット: 「Webサイト製作を学びたいエンジニア」
- クライアントサイド検索ライブラリの選定比較、パフォーマンス設計（遅延ロード、Route Handler活用）は、このターゲットの「具体的なWebサイトの設計パターンやその意図」「設計判断の背景にある『なぜそうしたか』の説明」への関心と高く合致する
- しかし、コード例が少ない点はターゲットの「コピペして使えるスニペットやテンプレート」への好みに応えていない

副ターゲット: 「AIエージェントやオーケストレーションに興味があるエンジニア」
- AIが自律的に検索機能を設計・実装したプロセスとしての価値がある
- ただし記事自体はAI運用の文脈が薄い

#### 1.3 blog-writing.mdガイドラインとの適合度
- AI免責表示: あり（標準形に合致）
- 一人称「私たち」: 未使用 → 要修正
- 「なぜ」の説明: 概ね良好（ライブラリ選定理由、UI方式選定理由、遅延ロード理由が記載）
- 外部リンク: 一部あり（Fuse.js, Orama, Pagefind, Vercel Docs, Next.js Docs）だが不足あり
- 「この記事で分かること」: 未記載 → 要追加
- series: 未設定 → 要検討
- 「今後の展望」のbacklog.md照合: 未実施 → 要確認

---

### 2. 過去サイクルの品質向上パターンとの照合

cycle-34〜40で確立された品質向上パターンを本記事に適用した場合の改善項目:

| パターン | 現状 | 対応 |
|---|---|---|
| 「この記事で分かること」リスト追加（h2見出し形式） | なし | 要追加 |
| 外部リンク追加 | 4件あり | 追加余地あり（後述） |
| 一人称「私たち」の統一 | 未使用 | 全文を「私たち」視点に修正 |
| サイト内導線の強化 | なし | 関連記事・機能への導線を追加（後述） |
| AI免責表示の標準形統一 | 標準形に合致 | 対応不要 |
| frontmatter更新（series, tags, updated_at） | series未設定、updated_at未更新 | 要更新（後述） |

---

### 3. 記事固有の改善ポイント

#### 3.1 追加すべき外部リンク候補

**比較表のライブラリ（リンクなし2件）:**
- Flexsearch: https://github.com/nextapps-de/flexsearch（公式GitHub）
- Lunr: https://lunrjs.com/（公式サイト）

**技術トピック関連:**
- Fuse.js GitHub: https://github.com/krisk/Fuse（公式ドキュメントへのリンクは既にあるが、GitHubリポジトリも検討）
- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers（遅延ロードセクションでRoute Handlerに言及しているため）
- cmdk (Cmd+Kパレットの著名ライブラリ): https://github.com/pacocoursey/cmdk（Cmd+K UIパターンの文脈で参考情報として）
- kbar: https://kbar.vercel.app/（同上）

**追加推奨（優先度順）:**
1. Flexsearchリンク追加（比較表内）: 高優先度
2. Lunrリンク追加（比較表内）: 高優先度
3. Next.js Route Handlersドキュメント: 中優先度（遅延ロードセクションで言及）
4. cmdk / kbar: 低優先度（Cmd+Kパターンの参考情報として有用だが、yolos.netが使っているライブラリではないので任意）

#### 3.2 seriesフィールドの検討
building-yolosシリーズに属すべきと判断する。理由:
- yolos.netサイト自体の機能（サイト内検索）の実装記事である
- 同シリーズに既に含まれている記事と同じ性質:
  - rss-feed（RSSフィード実装）
  - site-rename-yolos-net（サイト名変更）
  - rss-feed-and-pagination（ページング実装）
  - series-navigation-ui（シリーズナビゲーション実装）
  - dark-mode-toggle はseriesなしだが同じ性質 → dark-modeもbuilding-yolosに追加すべき可能性あり
- 結論: series: building-yolos を追加すべき

#### 3.3 「今後の改善」セクションとbacklog.mdの照合
記事に記載されている5つの「今後の改善」項目:
1. マッチ部分のテキストハイライト強化 → backlogに該当タスクなし
2. 検索履歴の保存と表示 → backlogに該当タスクなし
3. 人気検索ワードの表示 → backlogに該当タスクなし
4. モバイルでのブラウザ戻るボタン対応 → backlogに該当タスクなし
5. コンテンツ増加時のインデックスサイズ監視 → backlogに該当タスクなし

5項目すべてがbacklogに未登録。blog-writing.mdのガイドライン「今後の展望はbacklog.mdの該当タスクのステータスと照合して整合する内容にすること」に反している。
対応方針: backlogに登録されていない展望は、確定的な予告ではなく検討中の表現にするか、あるいはbacklogへの登録を検討する。ただし品質向上タスクのスコープ上、記事側の表現を調整するのが適切。

#### 3.4 「この記事で分かること」リスト案
以下のような内容が適切:
- クライアントサイド検索ライブラリ5種（Fuse.js、Orama、Flexsearch、Pagefind、Lunr）の比較と選定理由
- Cmd+Kモーダル方式のUI設計意図
- 検索インデックスの遅延ロードによるパフォーマンス設計
- 500件超の日本語コンテンツに対するファジー検索の実践

---

### 4. サイト内関連コンテンツの確認

#### 4.1 関連記事（導線として追加すべき候補）
1. /blog/dark-mode-toggle -- 同時期のUI改善機能。ヘッダーUI変更という共通点がある
2. /blog/tools-expansion-10-to-30 -- 500件のコンテンツの背景として、ツール拡充の経緯を説明
3. /blog/how-we-built-this-site -- サイト全体のアーキテクチャの紹介
4. /blog/nextjs-static-tool-pages-design-pattern -- Next.jsの設計パターンという共通の技術トピック
5. /blog/rss-feed-and-pagination -- サイト基盤整備の姉妹記事

#### 4.2 サイト内ツール・機能
- サイト内検索機能自体へのリンク（例: 「Cmd+Kで今すぐ試せます」といった体験誘導）
- /tools ページへの導線（検索対象として500件のコンテンツがあることの文脈で）

---

### 5. 具体的な改善項目リスト（優先度順）

#### 必須（ガイドライン準拠）
1. **「この記事で分かること」リスト追加**: はじめにセクションの直後にh2見出しで追加
2. **一人称「私たち」への統一**: 記事全体を「私たち」視点に修正。現在は主語が省略されている文が多い
3. **series: building-yolos をfrontmatterに追加**: yolos.netサイト構築の機能実装記事として
4. **「今後の改善」セクションの表現修正**: backlog未登録のため「今後検討したいこと」等の表現に変更
5. **updated_at の更新**: 品質向上実施日に更新

#### 推奨（品質向上）
6. **外部リンク追加**: Flexsearch（GitHub）、Lunr（公式サイト）、Next.js Route Handlers（公式ドキュメント）の3件を追加
7. **サイト内導線追加**: 関連記事として dark-mode-toggle、rss-feed-and-pagination 等へのリンクを適切な文脈に挿入
8. **tags の見直し**: 現在4つだが「新機能」タグの追加を検討（リリースの性質を持つ記事のため）

#### 任意（さらなる改善）
9. **Cmd+K UIパターンの外部参考リンク追加**: cmdk / kbar ライブラリの紹介（Cmd+KモーダルのUI文脈で）
10. **コード例の追加検討**: Fuse.jsの初期化コードやRoute Handlerのforce-static設定例等のスニペット追加（ターゲットユーザーの好みに合致）
