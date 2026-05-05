# B-309 ツール・タイル化 棚卸しシート

調査日: 2026-05-01  
調査対象: src/tools/(33種) / src/play/(games×4 + quiz×15 + fortune×1) / src/cheatsheets/(7種)

---

## 操作モデル凡例

- **A**: テキスト1入力→リアルタイム結果（最単純）
- **B**: 複数入力→ボタン押下→結果
- **C**: ファイルアップロード必須
- **D**: 左右2ペイン（入力側 / 出力側が横並び）
- **E**: タブ／セクション複数（機能が2モード以上）
- **F**: リアルタイム更新（setInterval）
- **G**: 大量データ閲覧・スクロール前提
- **H**: 多段階フロー（intro→playing→result 等）
- **I**: 外部Worker依存

---

## src/tools/ 棚卸し（33種）

| slug                      | ツール名           | 操作モデル   | LOC | タイル収容性(○/△/×) | 別コンポーネント要否              | 構造的困難                                                                         |
| ------------------------- | ------------------ | ------------ | --- | ------------------- | --------------------------------- | ---------------------------------------------------------------------------------- |
| char-count                | 文字数カウント     | A            | 58  | ○                   | 不要                              | なし                                                                               |
| byte-counter              | バイト数カウント   | A            | 85  | ○                   | 不要                              | なし                                                                               |
| email-validator           | メール検証         | A            | 93  | ○                   | 不要                              | なし                                                                               |
| kana-converter            | かな変換           | A            | 100 | ○                   | 不要                              | なし                                                                               |
| hash-generator            | ハッシュ生成       | A            | 105 | ○                   | 不要                              | なし                                                                               |
| qr-code                   | QRコード生成       | B            | 108 | △                   | 推奨（簡略版）                    | 入力+QR表示+DL ボタンが縦に長い                                                    |
| html-entity               | HTMLエンティティ   | A            | 126 | ○                   | 不要                              | なし                                                                               |
| base64                    | Base64変換         | A            | 129 | ○                   | 不要                              | なし                                                                               |
| dummy-text                | ダミーテキスト     | B            | 134 | △                   | 推奨（設定値固定版）              | 出力テキストが長文                                                                 |
| number-base-converter     | 進数変換           | A            | 139 | ○                   | 不要                              | なし                                                                               |
| age-calculator            | 年齢計算           | B            | 150 | △                   | 任意（誕生日入力のみ版）          | 結果多項目（干支・星座・和暦等）                                                   |
| text-replace              | テキスト置換       | A            | 152 | △                   | 任意                              | 入力3つ+結果エリア                                                                 |
| url-encode                | URLエンコード      | A            | 151 | ○                   | 不要                              | なし                                                                               |
| bmi-calculator            | BMI計算            | B            | 172 | ○                   | 不要                              | 2入力→結果が小さい                                                                 |
| line-break-remover        | 改行削除           | A+オプション | 185 | △                   | 任意                              | オプション3つ                                                                      |
| color-converter           | カラー変換         | B            | 199 | △                   | 推奨（カラーピッカー→結果のみ版） | 入力モード3種+カラーピッカー                                                       |
| fullwidth-converter       | 全角半角変換       | A+オプション | 128 | △                   | 任意                              | 変換方向+チェックボックス3つ                                                       |
| sql-formatter             | SQLフォーマット    | B+オプション | 172 | △                   | 任意                              | 入出力エリア縦2段                                                                  |
| json-formatter            | JSONフォーマット   | B            | 161 | △                   | 任意                              | 入出力エリア縦2段                                                                  |
| yaml-formatter            | YAMLフォーマット   | B            | 178 | △                   | 任意                              | 入出力エリア縦2段                                                                  |
| password-generator        | パスワード生成     | B+オプション | 168 | △                   | 推奨（ワンクリック生成版）        | オプション多数（チェックボックス4+スライダー）                                     |
| text-diff                 | テキスト差分       | B+D          | 114 | ×                   | 必須                              | 左右2ペイン（min-height 200px×2）→タイル幅では縦積みになるが2エリア+結果で高さ不足 |
| markdown-preview          | Markdownプレビュー | D            | 61  | ×                   | 必須                              | 左右2ペイン（min-height 400px×2）が本質的UI                                        |
| csv-converter             | CSV変換            | B            | 144 | △                   | 任意                              | 入出力エリア縦2段                                                                  |
| regex-tester              | 正規表現テスト     | A+I          | 168 | ×                   | 必須                              | WebWorker必須・パターン+フラグ+テスト文字列+置換4エリア                            |
| unix-timestamp            | UNIXタイムスタンプ | F+B+E        | 279 | ×                   | 必須                              | 毎秒更新カウンタ+Section2つ（変換・逆変換）でUIが縦に長大                          |
| cron-parser               | Cron解析           | B+E          | 372 | ×                   | 必須                              | Parser/Builderタブ+プリセット5種+次回実行5件表示                                   |
| date-calculator           | 日付計算           | B+E          | 325 | ×                   | 必須                              | Section3つ（日付差・日数加算・和暦変換）を1コンポーネントに統合                    |
| unit-converter            | 単位変換           | A+E          | 165 | △                   | 任意（カテゴリ固定版）            | カテゴリ切替が12種                                                                 |
| dummy-text                | ダミーテキスト     | B            | 134 | △                   | 推奨（設定固定版）                | 長文出力エリア                                                                     |
| business-email            | ビジネスメール     | B+G          | 251 | ×                   | 必須                              | カテゴリ選択→テンプレ選択→フィールド入力→件名+本文プレビュー（textarea long）      |
| image-base64              | 画像Base64         | C+E          | 283 | ×                   | 必須                              | ファイルアップロード（drag&drop）+encode/decodeタブ                                |
| image-resizer             | 画像リサイズ       | C            | 523 | ×                   | 必須                              | ファイルアップロード必須+プレビュー表示+多数設定項目                               |
| traditional-color-palette | 伝統色パレット     | G+A          | 279 | ×                   | 必須                              | 10列カラーグリッド（全色表示）+検索+カテゴリフィルタ+配色調和パネル                |
| keigo-reference           | 敬語リファレンス   | G+E          | 248 | ×                   | 必須                              | テーブル表示+タブ切替+アコーディオン展開+検索                                      |

---

## src/play/ 棚卸し（ゲーム4種 + 診断/クイズ15種 + 占い1種）

| コンテンツ                    | 種別             | 操作モデル                              | 状態複雑度                                                | タイル収容性 | 別コンポーネント要否 | 構造的困難                                                                                           |
| ----------------------------- | ---------------- | --------------------------------------- | --------------------------------------------------------- | ------------ | -------------------- | ---------------------------------------------------------------------------------------------------- |
| irodori（色合わせゲーム）     | game             | H+リアルタイムスライダー                | 高（ラウンド管理・履歴・Stats・Modal×3）                  | ×            | 必須                 | Daily puzzle（日付依存）+HSLスライダー3本+ラウンド進行+結果Modal                                     |
| nakamawake（仲間分け）        | game             | H                                       | 高（4グループ×4単語グリッド・ミス管理・Modal×3）          | ×            | 必須                 | 4×4ワードグリッド（min-height 500px相当）+アニメーション                                             |
| kanji-kanaru（漢字Wordle）    | game             | H                                       | 高（Wordle型フィードバック・DifficultySelector・Modal×3） | ×            | 必須                 | 6行×5列フィードバックグリッド                                                                        |
| yoji-kimeru（四字熟語Wordle） | game             | H                                       | 高（同上・漢字特化版）                                    | ×            | 必須                 | 同上                                                                                                 |
| 占い（fortune-daily）         | fortune          | 表示のみ（日付依存・localStorage seed） | 低（useSyncExternalStore）                                | △            | 推奨（ミニカード版） | 詳細ページは運勢+ラッキーアイテム+アクション+StarRating全部表示。タイルは運勢タイトル+説明のみで十分 |
| kanjiレベル                   | quiz/knowledge   | H（intro→Q×10→result）                  | 中                                                        | ×            | 必須                 | 多段階フロー。タイルで途中状態管理は困難                                                             |
| kotowazaレベル                | quiz/knowledge   | H                                       | 中                                                        | ×            | 必須                 | 同上                                                                                                 |
| 四字熟語レベル                | quiz/knowledge   | H                                       | 中                                                        | ×            | 必須                 | 同上                                                                                                 |
| 四字熟語性格診断              | quiz/personality | H                                       | 中                                                        | ×            | 必須                 | 同上                                                                                                 |
| 動物性格診断                  | quiz/personality | H（+結果Radar chart）                   | 高                                                        | ×            | 必須                 | 結果にRadarChartコンポーネント使用                                                                   |
| キャラクター性格診断          | quiz/personality | H（+相性マトリクス・24結果型）          | 非常に高                                                  | ×            | 必須                 | 結果27型（batch1-3）+相性表+InviteFriendボタン                                                       |
| キャラクター占い              | quiz/personality | H（+友達相性）                          | 高                                                        | ×            | 必須                 | 結果+CompatibilitySectionあり                                                                        |
| 音楽性格診断                  | quiz/personality | H                                       | 中                                                        | ×            | 必須                 | 多段階フロー                                                                                         |
| あまのじゃく占い              | quiz/personality | H                                       | 中                                                        | ×            | 必須                 | 同上                                                                                                 |
| ありえないアドバイス          | quiz/personality | H                                       | 中                                                        | ×            | 必須                 | 同上                                                                                                 |
| 謎の相性診断                  | quiz/personality | H（+InviteFriend）                      | 高                                                        | ×            | 必須                 | InviteFriendButton使用                                                                               |
| 日本文化度診断                | quiz/personality | H                                       | 中                                                        | ×            | 必須                 | 多段階フロー                                                                                         |
| 科学的思考タイプ              | quiz/personality | H（+RadarChart）                        | 高                                                        | ×            | 必須                 | RadarChart使用                                                                                       |
| 語感タイプ診断                | quiz/personality | H                                       | 中                                                        | ×            | 必須                 | 多段階フロー                                                                                         |
| 伝統色タイプ診断              | quiz/personality | H                                       | 中                                                        | ×            | 必須                 | 多段階フロー                                                                                         |

---

## src/cheatsheets/ 棚卸し（7種）

| slug              | 内容                       | 状態                     | LOC  | タイル収容性 | 別コンポーネント要否 | 備考                                                                    |
| ----------------- | -------------------------- | ------------------------ | ---- | ------------ | -------------------- | ----------------------------------------------------------------------- |
| cron              | Cron式リファレンス         | なし（静的JSX）          | 702  | ×            | 必須                 | 長大な静的テーブル群。タイルには最初の1セクションへのリンクカードが限界 |
| git               | Gitコマンドリファレンス    | なし（静的JSX）          | 506  | ×            | 必須                 | 同上                                                                    |
| html-tags         | HTMLタグリファレンス       | なし（静的JSX）          | 1285 | ×            | 必須                 | 同上（最大LOC）                                                         |
| http-status-codes | HTTPステータスリファレンス | なし（静的JSX）          | 444  | ×            | 必須                 | 同上                                                                    |
| markdown          | Markdownリファレンス       | なし（静的JSX、CSSあり） | 656  | ×            | 必須                 | 同上                                                                    |
| regex             | 正規表現リファレンス       | なし（静的JSX）          | 683  | ×            | 必須                 | 同上                                                                    |
| sql               | SQLリファレンス            | なし（静的JSX）          | 572  | ×            | 必須                 | 同上                                                                    |

---

## 集計サマリー

| 区分        | 件数   | ○（そのまま流用可能） | △（要判断、流用可能性あり） | ×（別コンポーネント必須） |
| ----------- | ------ | --------------------- | --------------------------- | ------------------------- |
| tools       | 33     | 8                     | 13                          | 12                        |
| play        | 20     | 0                     | 1(占い)                     | 19                        |
| cheatsheets | 7      | 0                     | 0                           | 7                         |
| **合計**    | **60** | **8**                 | **14**                      | **38**                    |

---

## 結論: 1対多サポートが必要か → **Yes**

### 1対多が確実に必要なケース（×判定・12種 tools + 全ゲーム・クイズ・チートシート）

**tools（構造的に詳細ページ本体をタイルに流用不可）**

- `text-diff`・`markdown-preview`: 左右2ペインが本質UI（min-height 200-400px×2）
- `regex-tester`: WebWorker＋4エリアの複合UI
- `unix-timestamp`: setIntervalリアルタイム更新＋多セクション
- `cron-parser`・`date-calculator`: 複数タブ/セクション（2-3機能を1コンポーネントに統合）
- `business-email`: カテゴリ→テンプレ→フィールド→プレビューの多段フォーム
- `image-base64`・`image-resizer`: ファイルアップロードUI必須
- `traditional-color-palette`: 10列スウォッチグリッド
- `keigo-reference`: 大テーブル+タブ+アコーディオン

**play（ゲーム全4種・クイズ/診断全15種）**

- 全ゲーム: 多段階フロー（intro/playing/result）、ゲーム盤面UI、Modal×3
- 全クイズ/診断: 多段階フロー（intro→Q×n→result）はタイル内で管理困難。結果ページは別URL

**cheatsheets（全7種）**

- 静的リファレンスで数百〜1285行。タイルでは「リンクカード」相当のみが現実的

### △ケースの具体的検討

- `password-generator`: オプション多数だが、ワンクリック生成+コピーのみに絞った簡素版タイルは有用
- `color-converter`: カラーピッカー1個+色名/HEX表示の最小タイルは有用
- `age-calculator`: 誕生日入力1つ→今日の年齢のみ表示する簡素版は有用
- `fortune-daily`: 運勢タイトル+一言だけのミニカードは有用（現状の全項目表示は不要）

---

## メタ型インタフェース設計への示唆

### 必要なフィールド

1. **`tileComponent?: ComponentRef`**  
   タイル専用コンポーネントへの参照。未指定時は詳細ページ本体コンポーネントを流用（1対1フォールバック）。  
   → ×判定の38件は必ずこのフィールドを要する

2. **`tileVariants?: ComponentRef[]`**  
   同一ツールに複数タイルバリエーションを持たせる場合（将来拡張）。  
   → 現時点で必要なケースは確認されなかったが、フィールドは型として予約推奨

3. **`recommendedTileSize: { w: number; h: number }` または `TileSizeHint`**  
   タイルグリッドへの推奨サイズ指定（1×1〜4×4など）。  
   → ゲーム類は4×4以上、占い/シンプルツールは2×2程度が想定される

4. **`tileableAs?: "full" | "preview-only" | "link-card"`**  
   タイル化の種別を明示。
   - `full`: そのまま全機能動作（○判定ツール）
   - `preview-only`: 結果閲覧のみ（占い・cheatsheets）
   - `link-card`: 詳細ページへのリンクカードのみ（長大コンテンツ）

5. **`inputPlaceholder?: InputSpec`**（将来）  
   タイル間データ連携のための入出力型定義。現フェーズでは不要だが型予約推奨。

### 分離 vs 統合メタ型

- `ToolMeta`・`PlayMeta`・`CheatsheetMeta` を統合した`ToolboxItem`型は、操作モデルの差（ゲームの多段フロー vs ツールの即時変換）が大きいため、**共通フィールド（id/slug/title/tileComponent/recommendedTileSize/tileableAs）を持つ base interface + 種別ごとの extension** が現実的。完全統合は overfit 気味。
