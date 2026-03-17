# URL構造設計・サイトナビゲーション設計のSEO・UXベストプラクティス調査レポート

- 調査日時: 2026-03-17
- 調査目的: yolos.netのサイト再構成に向けた設計指針の整備（URL構造設計のSEOベストプラクティス、情報アーキテクチャのUX原則、多カテゴリサイトのナビゲーション設計、URL変更のリスクと対策）
- 情報源: Google Search Central、Moz、Ahrefs、NN/Group、Baymard Institute、診断メーカー、Yahoo!ゲーム等

---

## 1. URL構造設計のSEOベストプラクティス

### 1.1 GoogleのURL構造に関する公式ガイドライン（2025-2026年時点）

Googleは2025年6月18日にSearch Centralのガイドラインを改訂し、より詳細なURL設計の指針を公開した。

**必須要件:**

- IETF STD 66に準拠すること（予約文字はパーセントエンコーディングを使用）
- URLフラグメント（`#`）でコンテンツを変更しないこと（JavaScriptではHistory APIを使用）
- キーバリューペアには`=`、複数パラメータには`&`を使用

**推奨事項:**

- IDナンバーではなく人間が読める単語を使う（例：`/index.php?topic=42`より`/wiki/aviation`）
- ターゲットオーディエンスの言語の単語を使う
- 単語の区切りにはアンダースコア（`_`）ではなくハイフン（`-`）を使う
- URLは常に小文字に統一する（`/APPLE`と`/apple`はGoogleでは別URLとして扱われる）
- コンテンツを変えない不要なパラメータは排除する
- セッションIDやリファラルパラメータは避ける

**スラッグの最適な長さ:**

- 3〜5の意味ある単語（25〜30文字程度）が推奨される
- 短く簡潔なスラッグは11.8百万件のSERPで若干高いランキングを示すというデータがある

### 1.2 URL階層の深さとSEOの関係

**クロール深度の影響:**

- 深い階層に位置するページはクロール頻度が低下し、PageRankの受け取り量も減少し、結果として検索順位が下がりやすい
- 業界標準のベストプラクティスはホームページから重要なページまで3クリック以内

**フラット構造とSEO:**

- Googleのマット・カッツは「URLのディレクトリ深さに関して、Googleは実質的に差異を設けていない」と明言
- クロール深度（クリック数）とURLのディレクトリ深さは別の概念
- 実際にSEOに影響するのはURLの深さではなく、内部リンクによる「クリック距離」

**推奨設計:**

- 最大4階層（ホーム > カテゴリ > サブカテゴリ > コンテンツ）に収める
- XMLサイトマップで深いページも検索エンジンに認識させる
- パンくずリストは自動的な内部リンクを生成し、階層関係を明示する

### 1.3 URLの言語（英語 vs ローマ字 vs 多言語）とSEOへの影響

**日本語サイトでの推奨:**

- 日本語文字（UTF-8）はURLに技術的には使えるが、コピー&ペースト時にピューニコード（複雑なローマ字）に変換されてしまう
- 共有・リンク時の問題からローマ字（英語読み）の使用が推奨される
- 例：`/fortune/daily`のように英語表記が実用的

**SEOへの実質的な影響:**

- 日本語URLそのものにSEOメリットはなく、実用面（共有しやすさ、リンク獲得）での不利が勝る
- コンテンツやメタデータは日本語でよいが、URLスラッグは英語またはローマ字が適切

**ドメインに関する補足:**

- `.jp`ドメインは日本のユーザーに「日本向けサイト」の信頼感を与えるとされる

### 1.4 URL変更時の301リダイレクトのベストプラクティス

**実装の原則:**

- 必ず301（永続的移動）を使用する。302や307はSEO資産を引き継がない
- リダイレクトチェーン（A→B→C）は避け、直接（A→C）にマッピングする
- ホームページへの一括リダイレクトは避け、コンテンツが一致するページへ1対1でマッピングする

**維持期間:**

- GoogleのJohn Muellerは最低12ヶ月の維持を推奨
- Google Search Consoleは180日間移行通知を表示するが、その後もリダイレクトは維持すべき

**実装手順:**

1. 現サイトの全URLをクロールしてリスト化
2. 旧URL → 新URLの1対1マッピング表を作成
3. ステージング環境でテスト
4. HTTPステータスコードが301であることを各URL個別に確認
5. XMLサイトマップを新URLで更新
6. 内部リンクを新URLに更新（リダイレクト経由を避けるため）
7. Google Search Consoleで「アドレス変更」ツールを活用
8. 移行後90日間は毎日モニタリング

### 1.5 既存URLからの移行戦略

**段階的移行の推奨:**

- プラットフォーム変更・デザイン刷新・URL変更・ブランド変更を同時に行わない
- 可能な限り変更の変数を分離する（例：プラットフォームを変えるならURLはそのまま、URLを変えるなら他の変更は最小限に）

**Google Search Consoleの活用:**

- 「アドレス変更」ツール：旧サイトと新サイト両方のオーナー権限で実行。上位5URLのリダイレクトを自動確認
- 「URL検査」ツール：リダイレクトが1ホップか、最終URLが200を返しインデックス可能かを確認
- 「インデックスカバレッジ」レポート：正しいURLがインデックスされているか確認

---

## 2. コンテンツ分類とURL設計のUXベストプラクティス

### 2.1 情報アーキテクチャ（IA）の原則

**コンテンツ分類とURL構造の一致:**

- URLはサイトの情報アーキテクチャを反映すべきであり、ユーザーが「バーチャルパンくず」として使えることが理想
- 例：`/games/kanji-kanaru`を見ればゲームカテゴリ内のコンテンツとわかる
- ユーザーがURLの一部を削除して上位階層をナビゲートできるようにする（「ハッカブルURL」）

**ポリヒエラルキー（複数カテゴリ所属）への対応:**

- 1コンテンツが複数カテゴリに属する場合は、検索ボリュームとキーワードデータを基に正規URLを1つ決める
- 全内部リンクはその正規URLのみを指す

**深さの指針:**

- 最大4階層（ホーム > 大カテゴリ > 中カテゴリ > コンテンツ）
- 3階層が理想（UXとSEOの両面で最適）

### 2.2 驚き最小の原則（POLA: Principle of Least Astonishment）のURL設計への適用

- URLを見ればコンテンツの内容が予測できること
- 慣れ親しんだパターンから外れないこと（例：ブログ記事は`/blog/[slug]`、ゲームは`/games/[slug]`）
- ユーザーがURLから「どのカテゴリのどのコンテンツか」を直感的に理解できること
- 数字のみのID（`/shindan/12345`）はシンプルだが内容を推測しづらい。描写的なスラッグ（`/games/kanji-kanaru`）はUX的に優れる

### 2.3 カテゴリが複数ある場合のURL階層の設計パターン

**フラット型:**

```
/fortune
/quiz
/games
/tools
/dictionary
```

特徴：シンプルだが、コンテンツ増加時に管理が難しくなる

**階層型:**

```
/entertainment/fortune
/entertainment/quiz
/entertainment/games
/tools/age-calculator
/knowledge/dictionary
```

特徴：コンテンツの性質が明確になるが、階層が深くなるリスクがある

**実用的な推奨:**

- SEO上はURLのディレクトリ深さ自体に大きな差はない
- UX・アナリティクス・移行のしやすさから「意味のある中程度の階層型」が優れている
- Google自身は「サイト構造（クリック距離）はURLのディレクトリ深さとは別」と明言

### 2.4 ユーザーのメンタルモデルに合ったURL設計

- ユーザーは既存サービスの慣習から期待値を形成する
- 日本ユーザーのウェブ利用習慣（Yahoo! Japan、楽天などの密度の高いUIへの慣れ）を考慮
- カテゴリ名は直感的な英語またはわかりやすいローマ字（`quiz`、`games`、`fortune`など）が適切

### 2.5 エンターテインメントコンテンツを持つサイトのURL設計考察

コンテンツタイプが複数ある場合の分類軸の選択肢：

**コンテンツタイプ別（機能軸）:**

- `/quiz/[slug]` - クイズ
- `/games/[slug]` - ゲーム
- `/fortune/[slug]` - 占い
- `/diagnosis/[slug]` - 診断

**テーマ別（話題軸）:**

- `/japanese/[slug]` - 日本語関連
- `/personality/[slug]` - 性格関連

機能軸の方がユーザーの目的に合致しやすく（「ゲームをしたい」「占いをしたい」）、URL設計として採用しやすい。

---

## 3. 多カテゴリサイトのナビゲーション設計

### 3.1 ヘッダーナビゲーションに含めるべきリンク数

**推奨値:**

- 最適：5〜7項目
- 上限：8項目（これ以上は認知負荷過多）
- 根拠：ワーキングメモリの容量制約（マジカルナンバー7±2）

**対応策（項目が多い場合）:**

- 最重要5〜7項目のみヘッダーに配置
- 残りはフッター、ドロップダウン、カテゴリページに収納
- メガメニューは多数のコンテンツを整理して見せる有効な手段

### 3.2 複数コンテンツタイプがある場合のナビゲーション構成パターン

**パターンA：タイプ別フラットナビ**

```
[ゲーム] [占い] [クイズ] [辞典] [ツール] [ブログ]
```

シンプルで直感的。コンテンツ種が少ないうちは有効。

**パターンB：グループ化ドロップダウン**

```
[遊ぶ ▼]  [調べる ▼]  [読む ▼]
  ゲーム      辞典        ブログ
  占い        ツール       コラム
  クイズ
```

コンテンツ種が多い場合に有効。意味的なグルーピングが必要。

**パターンC：ハイブリッド（主要タイプ直リンク＋その他）**

```
[ゲーム] [占い] [ツール] [もっと見る ▼]
```

日本語エンターテインメントサイトでは情報密度を重視するパターンBまたはCが合いやすい。

### 3.3 フッターナビゲーションの役割と構成

**役割:**

- ヘッダーナビで見つからなかった情報へのセーフティネット
- 法的情報・プライバシーポリシーなどのコンプライアンス対応
- クロール補助（内部リンク確保）
- コンバージョン最後の機会

**2025-2026年の主なパターン:**

- **ドアマット型**: ヘッダーナビの主要リンクをフッターでも繰り返す（離脱防止）
- **サイトマップ・ライト型**: サイト全体の構造を網羅した大型フッター（中〜大型サイト向け）
- **ユーティリティのみ型**: 最小限の法的リンクのみ（小型サイト向け）

**フッターに含めるべき要素（推奨）:**

- 主要ページへのナビリンク
- プライバシーポリシー・利用規約
- サイトについて・お問い合わせ
- SNSリンク
- コピーライト・免責事項

**フッターのSEO注意点:**

- フッターリンクは2020年以降、SEOランキングシグナルとしての効果はほぼなし
- ユーザーナビゲーションとしての価値はある
- キーワードスタッフィングやスパム的な大量リンクは避ける

### 3.4 モバイルファーストのナビゲーション設計

**ハンバーガーメニューの現状（2025年）:**

- ユーザー認知度は高まっておりアイコンとして定着
- ただし「隠しナビ」は重要アクションの発見性を低下させリスクがある（NNgの研究）
- 正しく実装すれば有効な手法として現在も主流

**代替/補完パターン（2025年のトレンド）:**

- ボトムナビゲーションバー：3〜5項目の場合に有効。親指の届く範囲に配置
- ジェスチャーベースのナビゲーション
- フローティングアクションボタン（FAB）

**ハンバーガーメニューのベストプラクティス:**

- 標準的な3本線アイコンを使う
- 左上または右上の慣れた位置に配置
- 開閉状態を視覚的に明確にする

**日本語コンテンツサイトへの考慮:**

- 日本ユーザーは情報密度の高いナビゲーションに慣れており、過度なシンプル化はかえって違和感を与える場合がある
- モバイル対応は必須だが、日本のユーザー行動特性も考慮する

---

## 4. エンターテインメント/診断サイトのURL設計事例

### 4.1 ShindanMaker (shindanmaker.com / en.shindanmaker.com)

診断投稿サイト。名前診断・分岐診断・チェック診断・AI診断の4タイプを提供。

**URL構造:**

```
/ - トップページ
/list - HOT診断（TOP200）
/list/branch - 分岐診断カテゴリ
/list/check - チェック診断カテゴリ
/list/themes - テーマ一覧
/list/search?q=[keyword] - 検索
/c/list?mode=1 - 総合ランキング
/about - Q&A
/[数字ID] - 個別診断ページ（例：/884360）
/[数字ID]/timeline - 診断結果タイムライン
```

**特徴:**

- 個別コンテンツは数字IDのみ（`/884360`）でシンプルだが内容を推測しづらい
- コンテンツタイプはURL階層ではなくリスト系ページで分類
- UGC（ユーザー生成コンテンツ）前提のため、数字IDで一意性を確保している

### 4.2 ホイミー (hoyme.jp)

人気診断・占いサイト。編集部制作コンテンツとコラム記事を提供。

**URL構造:**

```
/ - トップページ
/shindan/[数字ID] - 個別診断ページ（例：/shindan/51807）
/shindan/[数字ID]/results/[結果番号] - 診断結果ページ
/eniatest - エニアグラムテスト専用ページ
/enia[1-9] - エニアグラム各タイプ詳細ページ
/columns/[数字ID] - コラム記事（例：/columns/312717）
/about - サイト情報
/privacy - プライバシーポリシー
```

**ナビゲーション:**

- ヘッダーは3項目（TOP / 診断 / コラム）とシンプル
- 診断一覧とコラム一覧を明確に分離

**特徴:**

- コンテンツタイプ（`/shindan/`、`/columns/`）をURLで分類
- 個別コンテンツは数字ID
- エニアグラムのような特別なコンテンツは専用スラッグ（`/eniatest`、`/enia1`〜`/enia9`）

### 4.3 診断ドットコム (4ndan.com / en.4ndan.com)

クイズ・診断・占いサイト。UGC型コンテンツを提供。

**URL構造:**

```
/ - トップページ
/app/[数字ID] - 個別診断/クイズ（例：/app/93）
```

**特徴:**

- `/app/`というパスで全コンテンツを統一
- 数字IDによる識別（UGC型のため）

### 4.4 事例からの示唆

| 項目         | 観察事実                                                | yolos.netへの示唆                                      |
| ------------ | ------------------------------------------------------- | ------------------------------------------------------ |
| コンテンツID | 数字IDが多い（UGC型）                                   | 編集部制作の場合、意味のあるスラッグが優れる           |
| タイプ分類   | URLでコンテンツタイプを明示（`/shindan/`、`/columns/`） | 現状の`/quiz/`、`/games/`、`/fortune/`などは適切な方向 |
| ナビ項目数   | ホイミーは3項目とシンプル                               | 5〜7項目以内を目標とする                               |
| 結果ページ   | `/results/`サブパスで分離（ホイミー）                   | クイズ等の結果は専用パスまたは同URL内で対応            |

---

## 5. URL変更のリスクと対策

### 5.1 URL変更によるSEO影響の具体的データ

**移行の成功率と影響規模:**

- 10件中9件の移行がSEOパフォーマンスにダメージを与える（90%が影響あり）
- 平均回復期間：523日（約18ヶ月）
- 最速回復：19日
- 17%のサイトは1000日後も元のトラフィックに戻らない

**移行タイプ別の予想トラフィック低下:**

- 軽微なリデザイン：一時的に10〜25%減
- 大規模移行：30〜60%減
- ドメイン変更：40〜70%減（最もリスクが高い）

**成功事例:**

- HireRoadの複数ドメイン統合：移行1年後に目標比14.5%超過を達成
- 適切に計画されたケースでは95〜100%のトラフィック維持も可能

### 5.2 大規模URL変更の成功事例と失敗事例

**失敗事例（リダイレクト不備）:**

- ある大手小売業者が移行時にITコンサルタントが詳細なリダイレクト設計を却下した結果、移行初月だけで約380万ポンドの損失
- 原因：不正なリダイレクト（302使用、ホームページへの一括リダイレクト）

**成功事例（200,000 URL規模）:**

- Fire Mountain Gems and Beads：20万URLをSalesforce Commerce Cloudへ移行
- 成功の鍵：SEO専門家が移行計画の初期から関与、包括的なリダイレクトマップ作成、90日間の構造化されたモニタリング

**重要な教訓:**

- URLのディレクトリ変更はドメイン変更より影響が小さいが、正しいリダイレクトがなければ重大なダメージを受ける
- 変更の規模が小さくても、リダイレクトの1対1マッピングは省略できない

### 5.3 SNSでシェア済みURLへの対策

**問題:**

- 301リダイレクトはSEO（被リンク価値）を引き継ぐが、**SNSシェア数（いいね、リポスト数）は引き継がれない**
- FacebookはURLに紐づいたソーシャルシグナルをキャッシュし、リダイレクト先を自動的に更新しない

**対策:**

- 旧URLは長期（少なくとも2〜3年）リダイレクトを維持する
- ソーシャルシェアボタンに旧URLを明示的に指定するパラメータがある場合は活用する
- Facebook Sharing Debuggerで新URL用のOGキャッシュを更新する
- 重要なコンテンツのURL変更は、そのページのSNSシェアが多い場合に特に慎重に判断する

**現実的な考え方:**

- 大半のSNSシェアURLは時間経過とともに検索で埋もれるため、実質的な長期影響は限定的
- ただし「バズったコンテンツ」のURL変更は、そのバズ期間中のトラフィックを失うリスクがある

---

## 6. 結論・推奨事項（yolos.netへの適用に向けた示唆）

### 6.1 現在のURL構造の評価

現在のyolos.netのURL構造を確認した結果：

**現状のURL構造:**

```
/blog/[slug]               - ブログ
/quiz/[slug]               - クイズ
/games/[slug]              - ゲーム
/fortune/daily             - 日替わり占い
/tools/[tool-name]         - ツール群（30種以上）
/dictionary/kanji/[char]   - 漢字辞典
/dictionary/yoji/[yoji]    - 四字熟語
/dictionary/colors/[slug]  - 日本の色
/dictionary/humor/[slug]   - ユーモア辞典
/cheatsheets/[sheet-name]  - チートシート
/memos/[id]                - メモ
/achievements/             - アチーブメント
```

**強み:**

- 英語URLで共有・リンクに適している
- コンテンツタイプ（`/games/`、`/quiz/`、`/tools/`）が明示されており直感的
- 3階層以内に収まっている場合が多い

**懸念点:**

- `cheatsheets`と`dictionary`と`tools`の境界があいまいになる可能性がある
- `memos`というカテゴリはユーザーのメンタルモデルと合致しにくい可能性がある
- `fortune`が`/fortune/daily`しかなく、コンテンツが少ない

### 6.2 URL設計の推奨事項

**継続すべき方針:**

- 英語URLスラッグの維持
- ハイフン区切りの維持
- コンテンツタイプ別の第1階層分類の維持

**検討すべき変更:**

- ナビゲーション上のグルーピングを整理する（URL変更なしでも対応可能）
- `cheatsheets`はコンテンツ性質として`tools`または`dictionary`に統合できるか検討
- `memos`は性質によってより明確なカテゴリ名への変更を検討

**URL変更を行う場合の必須事項:**

1. 全現行URLのリスト化（Screaming Frogなどでクロール）
2. 旧→新の1対1マッピング表の作成
3. 301リダイレクトの実装（302・307は使用しない）
4. XMLサイトマップの更新
5. 内部リンクの全更新
6. Google Search Consoleで変更を報告
7. 移行後90日間の毎日モニタリング
8. リダイレクトを最低12ヶ月維持

### 6.3 ナビゲーション設計の推奨事項

**ヘッダーナビゲーション:**

- 5〜7項目以内に収める
- コンテンツタイプ別か、「遊ぶ」「調べる」「読む」等の意味的グループ化を選択する
- 現在のコンテンツ量を考えると、グループ化ドロップダウン（パターンB）が適切

推奨例：

```
[ゲーム] [占い・診断] [ツール] [辞典] [ブログ] [もっと見る ▼]
```

**フッターナビゲーション:**

- 主要カテゴリへのリンクを繰り返す（ドアマット型）
- 法的情報（プライバシーポリシー、免責事項）を必ず含める
- サイト説明・AIによる運営の開示（Constitutionの要件）を含める

**モバイル:**

- ハンバーガーメニューを使用する場合、主要2〜3項目はモバイルでも常時表示を検討
- ボトムナビバーは3〜5項目の場合に有効な代替手段

### 6.4 URL変更を行う前の意思決定フレームワーク

URL変更は重大なSEOリスクを伴う。以下の基準で判断する：

1. **変更しない（推奨）**: 既存URLが英語・ハイフン区切り・コンテンツを反映している場合
2. **慎重に変更**: 既存URLが意味をなさない・ユーザーを誤解させる場合（完全なリダイレクト計画を前提に）
3. **絶対変更しない**: SNSで大きくバズった・大量の被リンクがある（リスクが利益を上回る）

**総合原則:** URL設計はサイト再構成の「初期に」決定し、後から変えないものとして設計する。「永続的URL」の思想（URL design by Kyle Neath参照）が基本。

---

## 出典リスト

### Google公式ドキュメント

- [URL Structure Best Practices for Google Search | Google Search Central](https://developers.google.com/search/docs/crawling-indexing/url-structure)
- [Ecommerce URL Structure Best Practices | Google Search Central](https://developers.google.com/search/docs/specialty/ecommerce/designing-a-url-structure-for-ecommerce-sites)
- [Redirects and Google Search | Google Search Central](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
- [Change of Address tool - Search Console Help](https://support.google.com/webmasters/answer/9370220?hl=en)

### SEO・URL構造

- [SEO URL best practices for 2025: A comprehensive guide - Briskon](https://www.briskon.com/blog/best-practices-for-seo-friendly-url-structure/)
- [301 Redirect Implementation Guide 2025: Preserve SEO Rankings - Scope Design](https://scopedesign.com/implement-301-redirect-good-seo-2025/)
- [301 Redirects: Best Practices for SEO - Semrush](https://www.semrush.com/blog/301-redirects/)
- [Flat vs Hierarchical URL Structure - Joey Hoer's Blog](https://joeyhoer.com/flat-vs-hierarchical-url-structure-420f178c)
- [Flat URL vs Hierarchical URL structure - Google Search Central Community](https://support.google.com/webmasters/thread/225678514/flat-url-vs-hierarchical-url-structure-for-website?hl=en)
- [Why Is URL Structure Still Crucial for SEO in 2025? - Geekinformatic](https://geekinformatic.com/why-is-url-structure-still-crucial-for-seo-in-2025/)

### クロール深度・サイト構造

- [Crawl Depth: 10-Point Guide for SEOs - Neil Patel](https://neilpatel.com/blog/crawl-depth/)
- [Page Depth vs Crawl Depth: A Technical SEO Guide - Traficxo](https://www.traficxo.com/blog/page-depth-in-seo)
- [Crawl Depth Explained: Improve Indexing & Rankings - Quattr](https://www.quattr.com/improve-discoverability/crawl-depth-for-seo)
- [Internal Linking Strategy: Complete SEO Guide for 2026 - Ideamagix](https://www.ideamagix.com/blog/internal-linking-strategy-seo-guide-2026/)

### 情報アーキテクチャ・UX

- [Flat vs. Deep Website Hierarchies - Nielsen Norman Group](https://www.nngroup.com/articles/flat-vs-deep-hierarchy/)
- [Information Architecture Best Practices for SEO & UX - The Gray Company](https://thegray.company/blog/information-architecture-practices-seo-ux)
- [Principle of Least Astonishment - Dovetail](https://dovetail.com/ux/principle-of-least-surprise/)
- [URL Structure Fundamentals: Architecture, Trailing Slashes, and Persistence - Visively](https://visively.com/kb/content/url-structure-fundamentals)

### ナビゲーション設計

- [Homepage & Navigation UX Best Practices 2025 - Baymard](https://baymard.com/blog/ecommerce-navigation-best-practice)
- [What Are Navigation Links? (+ 8 Best Practices for 2026) - Loganix](https://loganix.com/navigation-links/)
- [Website Header Design Guide 2025 - Darwin Apps](https://www.blog.darwinapps.com/blog/website-header-design-guide-2025-best-practices-to-boost-engagement)
- [10 modern footer UX patterns for 2026 - Eleken](https://www.eleken.co/blog-posts/footer-ux)
- [Footer Navigation Best Practices for User-Friendly Sites - Slider Revolution](https://www.sliderrevolution.com/design/footer-navigation-best-practices/)

### モバイルナビゲーション

- [The Death of the Hamburger Menu? Navigating Mobile Design in 2025 - CopyElement](https://blog.copyelement.com/the-death-of-the-hamburger-menu-navigating-mobile-design-in-2025/)
- [Mobile Navigation Patterns: Pros and Cons - UXPin](https://www.uxpin.com/studio/blog/mobile-navigation-patterns-pros-and-cons/)
- [The Hamburger-Menu Icon Today: Is it Recognizable? - Nielsen Norman Group](https://www.nngroup.com/articles/hamburger-menu-icon-recognizability/)

### URL移行・リダイレクト

- [Website Migration SEO: Avoid 50% Traffic Loss - Numen Technology](https://www.numentechnology.co.uk/blog/website-migration-seo-strategy)
- [Case Study: SEO Lessons from a 200k URL Website Migration - GoInflow](https://www.goinflow.com/blog/large-website-migration-case-study/)
- [Website Migrations: The Ultimate Guide - Conductor](https://www.conductor.com/academy/website-migrations/)
- [The Ultimate Website SEO Migration Checklist - Ninja Promo](https://ninjapromo.io/seo-website-migration-checklist)
- [How to Maintain Social Shares After a Site Migration - Search Engine Watch](https://www.searchenginewatch.com/2012/05/08/how-to-maintain-social-shares-after-a-site-migration/)
- [301 Redirect Audit Guide - Incremys](https://www.incremys.com/en/resources/blog/google-search-console-301-redirect)

### 日本語SEO・多言語URL

- [Multilingual SEO in Japanese - Humble Bunny](https://www.humblebunny.com/multilingual-seo-in-japanese/)
- [Japanese SEO Best Practices - Plus Alpha Digital](https://plusalphadigital.com/japanese-seo-best-practices/)
- [Japan SEO Practices - Edamame Japan](https://edamamejapan.com/japan-seo/)
- [Japanese UX Patterns and Metrics - iCrossborder Japan](https://www.icrossborderjapan.com/en/blog/creative-marketing/japanese-ux-patterns-metrics-optimize-performance/)

### 事例サイト

- [ShindanMaker | Entertaining Diagnosis Posting Site](https://en.shindanmaker.com)
- [ホイミー (hoyme.jp)](https://hoyme.jp/)
- [診断ドットコム (4ndan.com)](https://4ndan.com/)
