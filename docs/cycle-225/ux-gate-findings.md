# cycle-225 UXゲート監査結果と是正方針（B-490 後段）

cycle-225 完了手続き中、Owner 指摘により「最高の価値」基準（憲法 docs/constitution.md）で全34ツールを来訪者目線で critical 評価（フォアグラウンド Playwright・6バッチ・各 fresh エージェント）。機能・回帰レビューが見逃した UX・コピー・機能後退・正答性・デザイン整合の問題を多数検出。本書は全指摘と PM 判断を集約した是正の単一ソース。

## 根因（再発防止のため明記）

- 機能・回帰レビューと収束チェックリストは「Component 同等のフル機能・DESIGN トークン・a11y・テスト通過」を担保したが、「来訪者にとって最高の価値か」「説明文・エラーがリテラシーの高低を問わず理解できるか」「再構築で機能/オプションが後退していないか」という天井基準を強制していなかった。
- meta.ts の説明文（howItWorks/FAQ/subtitle）は旧ツールから引き継がれ、(a) リテラシー非依存の再点検、(b) 新 UI（トグル/コピー有無等）との同期、がされていなかった → FAQ と実装の食い違いが複数発生。

## PM 判断（是正の前提・コピー方針の更新を含む）

- **markdown-preview**: 「HTML をコピー」を追加する（出力＝持ち帰り対象。閲覧専用に留めるより明確に価値が高い）。T-4b の markdown-preview「なし」を**「あり（HTML コピー）」に更新**。
- **traditional-color-palette**: コピーを追加する（色コード hex/rgb/hsl は CSS 等に貼る持ち帰り対象。同種の color-converter はコピー有りで一貫させる。FAQ も実態と一致させる）。cycle-220 ②-15 の「知る対象」分類は color-converter との不整合・FAQ の約束に照らし誤りと判断。T-4b を**「あり」に更新**。
- **cron-parser**: 解析結果（知る対象）はコピーなしを維持。ただし**ビルダーが生成する cron 式は持ち帰り対象なのでビルダー出力にコピーを追加**。T-4b に「ビルダー生成式はコピーあり」を補足。
- **bmi-calculator のメーター**: DESIGN.md を中サイクルで拡張せず、グラデーション廃止・ソリッドな status 色（--warning/--danger）に、低体重ゾーンの --accent 誤用も中立色へ是正（DESIGN 準拠）。
- **絵文字/生グリフのアイコン化（image-resizer 🔒🔓・unit-converter ⇄）**: DESIGN.md §3「絵文字不可・必要なら Lucide 線画」に従い、可視ラベル付きの適切な UI（チェックボックス＋ラベル or Lucide アイコン＋aria-label）へ。

## ツール別 是正項目（深刻度: 高/中/低）

### 高〜中高

- **markdown-preview [高]**: HTML 出力手段なし。プレビュー欄に「HTML をコピー」を追加（生成済み HTML を取得可能に）。subtitle/keywords/FAQ の「HTML 変換」の約束と実態を一致させる。
- **business-email [中高]**: 初期表示（全フィールド空）で本文プレビューが破綻（空差し込みで「様/です。/について」等）。破綻文を「全文コピー」できてしまう。空フィールドは `field.placeholder` にフォールバックして差し込み、初期から一貫した見本メールを表示する。

### 中

- **sql-formatter [中]**: 「キーワード大文字」が単一 ON/OFF なのにチェックボックス。DESIGN.md §5 によりトグルスイッチへ（text-replace 等と一貫）。
- **text-replace [中]**: FAQ が「正規表現チェックボックス」と書くが実 UI はトグル。文言を「スイッチ」に修正。正規表現・$1・\d+ 等に平易な一言補足（「分からなければオフのまま通常置換できます」）。
- **regex-tester [中]**: (a)「リアルタイムにハイライト表示」が実態（マッチ一覧表示）と不一致＝説明を実態に合わせる（または入力内ハイライトを実装）。(b) meta.ts の `REGEX_SAMPLE_INPUTS`（6サンプル）が UI 未参照のデッドコード＝**サンプル投入機能を復元**（機能後退の是正）。(c) フラグ説明（g/i/m/s, dotAll 等）が title ツールチップのみでタッチ端末で発見不能＝平易な説明を常時表示。
- **text-diff [中]**: 行モードで末尾改行差により不変行（例「もも」）が +/− の無意味な差分になり件数も過剰。`diffLines(..., { ignoreNewlineAtEof: true })` 等で末尾改行アーティファクトとサマリ件数を是正。
- **traditional-color-palette [中]**: 上記 PM 判断によりコピーを追加し FAQ と一致させる。※cycle-220 ②-13 由来の規定外 box-shadow は T-6 A群再構築時に既に是正済み（TraditionalColorPalettePage.module.css L4「規定外 box-shadow 不使用」・L60「outline で代替」・**tests**/TraditionalColorPalettePage.test.tsx L68 で回帰保証）。U-8 では既消化につき再是正は不要、コピー追加と FAQ 整合のみが本タスクのスコープ。
- **dummy-text [中]**: 日本語モードで「単語数＝段落数」の無意味表示。日本語では単語数を出さない（文字数のみ）か文数等へ。statusSummary（SR 用）も同様に。
- **password-generator [中]**: 文字種を全 OFF で生成→結果空・無反応・強度バー「弱い」誤表示。ErrorMessage で「使用する文字の種類を1つ以上選んでください」、生成ボタン無効化 or 強度バー「—」表示。
- **unit-converter [中]**: 入れ替えボタンの生グリフ「⇄」を Lucide 線画アイコン（aria-label 維持）へ。
- **image-resizer [中]**: アスペクト比ロックの絵文字（🔒/🔓）を可視ラベル付きチェックボックス or Lucide アイコン＋ラベルへ。状態が見て分かるように。
- **cron-parser [中]**: (a) 解析エラー後にモード切替すると「入力エラーがあります」が残る（stale）＝モード切替で liveSummary をリセット。(b) ビルダー出力にコピー追加（PM 判断）。(低) エラーに修正方法を添える（「分は 0〜59 で指定」）／ビルダーにも次回実行表示。

### 低（磨き込み）

- **html-entity**: subtitle/about の「アンエスケープ」を操作ボタン語（デコード）と統一。
- **url-encode**: about の生関数名 `encodeURIComponent`/`encodeURI` を平易表現へ。
- **line-break-remover**: about 導入文の生 `\n`/`\r\n` を後退させ平易表現を先頭に。
- **json/yaml/sql-formatter**: subtitle が専門語のみ。整形が「読みやすく改行・字下げする」ことが非技術者に伝わる補足。サンプル初期値の検討（dev 寄りのため低）。
- **csv-converter**: エラー「JSONは配列である必要があります」の句点欠落を統一。「インデント」ラベルの折返し（white-space）。
- **char-count**: about の「Unicode コードポイント」を平易化（「絵文字なども1文字として数えます」）。文字数の主役表示化（byte-counter と一貫）。
- **hash-generator**: about 冒頭に「ハッシュとは何か・何に使うか」の平易な一文。ラベル折返し（white-space:nowrap）。
- **qr-code**: ラベル折返し（white-space:nowrap）。
- **age-calculator**: 干支の漢字一字に読み仮名併記（「午（うま）」）。
- **email-validator**: ✓/✗ のダ​ングバット記号（任意・境界事例）。
- **横断**: about の「FileReader API」「Canvas API」「Web Crypto API」等の専門語を「ブラウザ内で処理」等へ言い換え（二次情報・低）。

## 是正の進め方

- **1ツール1 fresh エージェント**（CLAUDE.md「1タスク1エージェント」）。使い回さない。
- 各ツールの是正後、**fresh な reviewer が当該ツール全体をゼロから**「最高の価値」基準で再点検（差分確認でなく全体再評価）。指摘ゼロまで反復。
- 是正完了後、全34本を fresh で UX 再ゲート（または是正ツールのみ）＋自動チェック全体を PM 独立再実行＋ブログ含め再 push。
- レシピ（収束チェックリスト）に「最高の価値・リテラシー非依存コピー・機能後退ゼロ・FAQ と UI の整合」を恒久追加する（次回以降の再発防止）。

## 監査の優（指摘なし）

完全に指摘なし（優・10本）: base64・byte-counter・fullwidth-converter・image-base64・kana-converter・keigo-reference・color-converter・date-calculator・unix-timestamp・number-base-converter。
低の磨き込みのみ・中核は高品質（11本）: char-count・hash-generator・html-entity・url-encode・line-break-remover・json-formatter・yaml-formatter・csv-converter・qr-code・age-calculator・email-validator。
中以上の是正対象（13本・上記「中」セクション参照）: markdown-preview [高]（U-1）・business-email [中高]（U-2）・regex-tester [中]（U-3）・cron-parser [中]（U-4）・sql-formatter [中]（U-5）・text-replace [中]（U-6）・text-diff [中]（U-7）・traditional-color-palette [中]（U-8）・dummy-text [中]（U-9）・password-generator [中]（U-10）・unit-converter [中]（U-11）・image-resizer [中]（U-12）・bmi-calculator [中]（U-13）。
全34本＝優10＋低のみ11＋中以上13。完全網羅。
