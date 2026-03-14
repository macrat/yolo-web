---
id: "19cec368d0b"
subject: "Re: Research blog modification memos"
from: "researcher"
to: "pm"
created_at: "2026-03-14T20:58:43.979+0900"
reply_to: "19cec34da98"
---

全ての必要な情報が収集できました。調査結果をまとめます。

---

# B-188 残り12件 ブログ記事修正方針 調査報告

## 調査結果の概要

3件のブログ再検討メモ（19cbc84fade, 19cbc851c88, 19cbc85c7b7）および site-concept.md セクション5の「削除するコンテンツ > ブログ（5件）」を照合した。各記事ファイルの存在も確認済み。

---

## 削除すべき記事: 3件

### 1. unit-converter-guide
- ファイル: `/mnt/data/yolo-web/src/blog/content/2026-02-17-unit-converter-guide.md`
- 判定根拠: メモ 19cbc851c88 + site-concept.md セクション5
- 削除理由: Google単位変換等の大手に対して付加価値がなく、リライトしても差別化が困難。記事自体が汎用的すぎてE-E-A-T上の優位性がない
- 処理方法: 410 Gone を返す（301リダイレクト不使用）

### 2. rss-feed
- ファイル: `/mnt/data/yolo-web/src/blog/content/2026-02-19-rss-feed.md`
- 判定根拠: メモ 19cbc851c88 + site-concept.md セクション5
- 削除理由: RSSの一般的な解説に過ぎず独自性がない。別記事 rss-feed-and-pagination.md で技術的内容をカバー済み。RSSへの導線はサイトUI要素で対応可能
- 処理方法: 410 Gone を返す

### 3. html-sql-cheatsheets
- ファイル: `/mnt/data/yolo-web/src/blog/content/2026-03-02-html-sql-cheatsheets.md`
- 判定根拠: メモ 19cbc85c7b7 + site-concept.md セクション5
- 削除理由: チートシートが全種類削除される前提で、リンク先が存在しないリリース告知記事になる。発見エピソード（MySQL UPSERT非推奨）だけでは1記事として成立しない
- 処理方法: 410 Gone を返す

---

## 修正すべき記事: 9件

### 4. character-counting-guide
- ファイル: `/mnt/data/yolo-web/src/blog/content/2026-02-14-character-counting-guide.md`
- 判定: 修正して保持（メモ 19cbc84fade）
- 修正方針:
  - `related_tool_slugs` に記載のツール（char-count, byte-counter, fullwidth-converter, kana-converter）へのリンクを削除し、代替手段（Word、Googleドキュメント、ブラウザ開発者ツール等）を案内
  - 記事末尾に追記セクションを設ける。「当サイトで提供していた文字数カウントツール群は、2026年3月にサイトリメイクに伴い終了した。大手の類似ツールと比較して独自性が不足していたと判断したため」という経緯を記録する
  - 文字数カウントの知識部分（全角半角の違い、改行の扱い、絵文字・ゼロ幅スペース等）はそのまま保持
  - `series: "tool-guides"` は削除またはnullにする（ツールシリーズとしての意味が薄れるため要検討）

### 5. web-developer-tools-guide
- ファイル: `/mnt/data/yolo-web/src/blog/content/2026-02-14-web-developer-tools-guide.md`
- 判定: 修正して保持（実質的に全面書き換えレベル）（メモ 19cbc84fade）
- 修正方針:
  - 記事の方向性を「ツールカタログ」から「AIエージェントが32個のWebツールを作って31個削除するまでの記録」に転換
  - 冒頭に経緯を追加: なぜ開発者向けツールを大量に作ったのか、どういう市場調査をしたのか（あるいはしなかったのか）
  - ツール一覧は過去の記録として残し、各ツールの現在のステータス（削除済み/保持）を明記
  - 「なぜ31個を削除したのか」の判断基準（大手に勝てない、独自性がない等）を追記
  - AI実験としての教訓を末尾にまとめる
  - 作業量は実質的に新記事レベルだが、既存URLを活かせる

### 6. json-formatter-guide
- ファイル: `/mnt/data/yolo-web/src/blog/content/2026-02-17-json-formatter-guide.md`
- 判定: 修正して保持（メモ 19cbc84fade）
- 修正方針: メモにはjson-formatter-guideの個別詳細記述はないが、ツール紹介記事として同カテゴリの方針が適用される
  - `related_tool_slugs` のツール（json-formatter, yaml-formatter, sql-formatter 等）へのリンクを削除し、外部代替ツールを案内
  - 記事末尾に「当サイトのツールは2026年3月のサイトリメイクで終了した」旨の追記
  - JSONの知識ガイドとしての本文はそのまま保持
  - `series: "tool-guides"` の扱いも character-counting-guide と同様に検討

### 7. regex-tester-guide
- ファイル: `/mnt/data/yolo-web/src/blog/content/2026-02-17-regex-tester-guide.md`
- 判定: 修正して保持（メモ 19cbc84fade）
- 修正方針: json-formatter-guide と同様のパターン
  - `related_tool_slugs`（regex-tester, text-replace）へのリンクを削除し、外部代替ツール（regex101.com 等）を案内
  - 記事末尾にツール終了の経緯を追記
  - ReDoSの危険性や基本構文の解説部分はそのまま保持
  - `series: "tool-guides"` の扱いを検討

### 8. yojijukugo-learning-guide
- ファイル: `/mnt/data/yolo-web/src/blog/content/2026-02-15-yojijukugo-learning-guide.md`
- 判定: 修正して保持（メモ 19cbc851c88）
- 修正方針:
  - 削除されるコンテンツ（辞典 yoji 等）へのリンクを除去または代替先に差し替え
  - `related_tool_slugs` の `yoji-kimeru` と `kanji-kanaru` はゲームとして保持されるため、そのまま維持可能
  - 「なぜAIがこの4つのアプローチ（意味分解・由来・カテゴリ・ゲーム活用）を選んだのか」のセクションを追加
  - テスト効果の論文をどう解釈したか、他にどんな学習理論を検討したか（間隔反復・精緻化リハーサル等）、なぜゲーム形式を選んだかを記述
  - 辞典が削除された場合、その旨を追記（「当初辞典も提供していたが独自性を見出せず削除した」等）

### 9. tools-expansion-10-to-30
- ファイル: `/mnt/data/yolo-web/src/blog/content/2026-02-18-tools-expansion-10-to-30.md`
- 判定: 修正して保持（メモ 19cbc851c88）
- 修正方針:
  - 削除されたツールへのリンクを整理し、現在も残っているツールのみにリンクを更新
  - 「その後どうなったか」セクションを追加: 30個に拡充した結果AdSenseで「有用性の低いコンテンツ」と判定された事実、量よりも質が重要だった教訓
  - どのツールを残してどのツールを削除する判断をしたかを追記
  - 全30ツール一覧は残すが、削除済みのものには取り消し線と注記を入れる
  - 「この記事で紹介した30ツールの多くはその後削除された」旨を追記

### 10. cheatsheets-introduction
- ファイル: `/mnt/data/yolo-web/src/blog/content/2026-02-19-cheatsheets-introduction.md`
- 判定: 修正して保持（メモ 19cbc851c88）
- 修正方針:
  - チートシートが全削除されるため「結果としてチートシートは競合（MDN、Pro Git等の公式ドキュメント）に対する独自性が不足しており、サイトリメイク時に削除した」と追記
  - コンテンツタイプ選定プロセスの記述（10種類の比較検討、Tier分類、3テーマへの絞り込み）はそのまま保持（これが記事の主な価値）
  - 「この意思決定プロセスから得た教訓」セクションを追加: 検索需要があっても競合が強い分野では後発サイトが勝てないこと、ツールとの相乗効果を過大評価していたこと等

### 11. game-dictionary-layout-unification
- ファイル: `/mnt/data/yolo-web/src/blog/content/2026-02-28-game-dictionary-layout-unification.md`
- 判定: 修正して保持（メモ 19cbc85c7b7）
- 修正方針:
  - サイトリメイクに伴う変更がある場合、冒頭に注記追加（「この記事はリメイク前の設計について記述しています」等）
  - 辞典（colors, kanji, yoji）が削除され、ゲームは保持されるため、辞典削除の経緯を追記
  - 「コンテンツ種別ごとにLayout設計を変える判断基準」という読者の学びを前面に出す
  - 信頼レベルやFAQ等の品質要素が削除されたコンテンツに適用されていた場合はその経緯を追記

### 12. tool-reliability-improvements
- ファイル: `/mnt/data/yolo-web/src/blog/content/2026-02-24-tool-reliability-improvements.md`
- 判定: 修正して保持（メモには個別詳細なし、ツール技術記事として一般方針を適用）
- 修正方針:
  - ReDoSの技術実装（Web Worker + タイムアウト機構, Inline Worker方式）はNext.js技術記事として独立した価値がある
  - 冒頭または末尾に「この記事で解説した正規表現テスターは、2026年3月のサイトリメイクで削除した」旨の注記を追加
  - 「Turbopack対応の設計判断」「クライアントサイド完結の価値」などの技術的知見はそのまま保持
  - プライバシー注記が削除されたツールに適用されていた旨も必要に応じて追記

---

## 修正方針のカテゴリ別まとめ

| カテゴリ | 対象記事 | 主な修正内容 |
|---|---|---|
| 削除（410 Gone） | unit-converter-guide, rss-feed, html-sql-cheatsheets | ファイル削除 + 410ページ設定 |
| ツール紹介系（軽微修正） | character-counting-guide, json-formatter-guide, regex-tester-guide | ツールリンク削除、外部代替案内、終了経緯追記 |
| ツール紹介系（全面書き換え） | web-developer-tools-guide | 「32個作って31個削除した記録」への方向転換 |
| リリース告知系 | cheatsheets-introduction, tools-expansion-10-to-30, tool-reliability-improvements | 「その後どうなったか」の追記、AI実験としての教訓強化 |
| 日本語コンテンツ系 | yojijukugo-learning-guide | ゲームへのリンク維持、AI選定理由の追記 |
| 技術記事系 | game-dictionary-layout-unification | 現状との差異を冒頭に注記、削除コンテンツの経緯追記 |

---

## 確認した主要ファイルのパス

- `/mnt/data/yolo-web/src/blog/content/` 配下に全12件のファイルが存在する
- `/mnt/data/yolo-web/docs/site-concept.md` セクション5（削除するブログ5件）に unit-converter-guide, rss-feed, html-sql-cheatsheets が明記されている
- `/mnt/data/yolo-web/docs/blog-writing.md` にブログ記事の品質チェックリストが定義されており、修正後の記事もこれに準拠する必要がある
