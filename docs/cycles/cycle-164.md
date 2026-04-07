---
id: 164
description: "改行削除ツールの新規作成（B-300）"
started_at: "2026-04-07T18:45:05+0900"
completed_at: "2026-04-07T19:31:49+0900"
---

# サイクル-164

cycle-163の調査で「改行削除 オンライン」が「需要あり x 競合弱い」の黄金ゾーンに位置することが確認された。SERP上位がGitHub個人ページやnetlifyページなど権威性の低いサイトであり、参入余地がある。このサイクルでは改行削除ツールを新規作成し、検索流入の獲得を目指す。

## 実施する作業

- [x] 既存ツールの構成・実装パターンの調査（fullwidth-converter、text-replaceなどを参考）
- [x] 改行削除ツールの設計（機能仕様、UIレイアウト、メタデータ）
- [x] 改行削除ツールの実装
- [x] 関連ツール側のrelatedSlugsに`"line-break-remover"`を追加（text-replace, fullwidth-converter, char-count, kana-converter, text-diff）
- [x] OGP画像の作成
- [x] ビジュアルテスト（Playwright）
- [x] レビュー・改善（R1: エラー表示欠落+モード別メッセージ修正、R2: 承認）

## 作業計画

### 目的

「改行削除 オンライン」「PDF 改行 削除」などの検索意図を持つ幅広いユーザー（オフィスワーカー、エンジニア、学生など）に対し、競合より使いやすく高機能な改行削除ツールを提供する。具体的な価値は以下のとおり。

- PDFからコピーしたテキストの不要な改行を、段落構造を壊さずにスマートに除去できる（競合にない差別化機能）
- 改行の「削除」だけでなく「スペースに置換」を選べる（英文テキストでの利便性）
- 連続改行（空行）の扱いを選択できる柔軟性
- 広告なし・登録不要で即座に使える

### 作業内容

#### 1. meta.ts — ツールメタデータ定義

ファイルパス: `src/tools/line-break-remover/meta.ts`

- slug: `"line-break-remover"`
- name: `"改行削除"`
- nameEn: `"Line Break Remover"`
- description: `"改行削除ツール。テキストの改行を一括削除・スペースに置換。PDFからコピーした文章の段落構造を保持しつつ不要な改行だけを除去するスマートモード搭載。登録不要・無料のオンラインツールです。"`（143文字）
- shortDescription: `"テキストの改行を削除・スペースに置換"`
- keywords: `["改行削除", "改行削除 オンライン", "改行 削除 ツール", "PDF 改行 削除", "改行をスペースに変換"]`
- category: `"text"`
- relatedSlugs: `["text-replace", "fullwidth-converter", "char-count", "kana-converter", "text-diff"]`（テキスト加工系ツールを関連として設定）
- publishedAt: 実装時のISO 8601タイムスタンプ（例: `"2026-04-07T19:00:00+09:00"`）
- structuredDataType: `"WebApplication"`
- trustLevel: `"verified"`
- howItWorks: テキスト内の改行コード（\n, \r\n, \r）を削除または指定文字に置換する処理の説明。PDFスマートモードでは、段落間の空行を保持しつつ行内改行のみを除去するロジックの説明。ブラウザ上で完結する旨を含む。
- faq: 以下の5問を設定
  1. 「改行を削除するのとスペースに置換するのはどう使い分けますか？」 — 日本語テキストは削除、英語テキストはスペース置換が一般的
  2. 「PDFからコピーしたテキストの改行を整えるには？」 — PDFスマートモードの使い方。日本語テキストは「削除する」、英語テキストは「スペースに置換」を選択する
  3. 「入力テキストの文字数に制限はありますか？」 — 最大10万文字
  4. 「どの種類の改行コードに対応していますか？」 — \n, \r\n, \r すべて対応
  5. 「連続する改行（空行）はどう処理されますか？」 — モードによる挙動の違い

#### 2. logic.ts — ロジック関数の設計

ファイルパス: `src/tools/line-break-remover/logic.ts`

**型定義:**

```
RemoveMode: "remove" | "replace-space" | "smart-pdf"
```

```
SmartPdfJoinStyle: "remove" | "space"
// "remove": 行内改行を空文字に置換（日本語テキスト向け）
// "space": 行内改行を半角スペースに置換（英語テキスト向け）
```

```
RemoveLineBreakOptions {
  mode: RemoveMode;
  mergeConsecutive: boolean;  // 連続改行を1つにまとめるか
  smartPdfJoinStyle: SmartPdfJoinStyle;  // smart-pdfモード時の行内改行の処理方法（デフォルト: "remove"）
}
```

```
RemoveLineBreakResult {
  output: string;
  removedCount: number;  // 削除された改行の数
  error?: string;        // 入力上限超過時のみセット
}
```

**メイン関数: `removeLineBreaks(input, options)`**

- 入力バリデーション: 10万文字上限チェック
- 改行コードの正規化: \r\n -> \n, \r -> \n（内部的に統一してから処理）
- 3つのモード:
  - **remove**: すべての改行を空文字に置換。`mergeConsecutive`がtrueの場合、連続改行は1つの改行に統合。
  - **replace-space**: すべての改行を半角スペースに置換。`mergeConsecutive`がtrueの場合、連続改行は1つのスペースに。
  - **smart-pdf**: 段落間の改行（2つ以上連続する改行=空行）は保持し、単独の改行のみを`smartPdfJoinStyle`に従って処理する。`"remove"`なら行内改行を空文字に置換（日本語テキスト向け）、`"space"`なら半角スペースに置換（英語テキスト向け）。PDFからコピーしたテキストで段落構造を維持しながら行内改行だけ除去するユースケースに対応。
- 削除された改行数をカウントして返す

**補助関数: `normalizeLineEndings(input)` — 改行コード正規化（exportしてテストから利用可能にする）**

#### 3. Component.tsx — UIコンポーネント設計

ファイルパス: `src/tools/line-break-remover/Component.tsx`

レイアウト構成（上から順に）:

1. **モード選択** — ラジオボタングループ（3択）
   - 「改行を削除」（デフォルト）
   - 「改行をスペースに置換」
   - 「PDFスマートモード」（段落は保持）
2. **オプション**
   - チェックボックス「連続する改行を1つにまとめる」（remove/replace-spaceモード時のみ表示。smart-pdfモード時は非表示）
   - ラジオボタン「行内改行の処理: 削除する / スペースに置換」（smart-pdfモード時のみ表示。デフォルト: 「削除する」）
3. **入力テキストエリア** — `rows={8}`, placeholder: "改行を削除するテキストを入力..."
4. **処理結果情報** — 「N件の改行を削除しました」をaria-liveで表示
5. **出力テキストエリア** — 読み取り専用、コピーボタン付き、`rows={8}`

既存ツール（fullwidth-converter）のモード切替UIパターンに合わせたbutton要素によるラジオグループを採用する。リアルタイム変換（useMemoでinputとoptionsの変更に即時反応）。コピーボタンはClipboard APIで出力をコピー。

#### 4. Component.module.css — スタイル

ファイルパス: `src/tools/line-break-remover/Component.module.css`

text-replaceおよびfullwidth-converterのCSSをベースに、同じCSS変数・クラス名規約で作成する。modeSwitchのスタイルはfullwidth-converterから流用。

#### 5. テスト

ファイルパス: `src/tools/line-break-remover/__tests__/logic.test.ts`

テストケース:

- **基本動作**: 単一改行の削除、スペース置換
- **改行コード種別**: \n, \r\n, \r それぞれが正しく処理される
- **連続改行処理**: mergeConsecutive=trueで連続改行が1つになる、falseで全削除
- **PDFスマートモード（削除）**: 日本語テキストで段落間の空行が保持され、行内改行が削除（空文字に置換）される
- **PDFスマートモード（スペース）**: 英文テキストで段落間の空行が保持され、行内改行が半角スペースに置換される
- **PDFスマートモード（混在）**: 日本語と英語が混在するテキストで、選択したjoinStyleに応じて正しく処理される
- **PDFスマートモード**: 3行以上の連続改行が1つの空行に正規化される
- **空入力**: 空文字列の入力で空文字列が返る
- **改行なし**: 改行のない入力がそのまま返る
- **上限超過**: 10万文字超の入力でエラーが返る
- **上限ちょうど**: 10万文字の入力が正常に処理される
- **削除カウント**: removedCountが正確な数を返す

ファイルパス: `src/tools/line-break-remover/__tests__/meta.test.ts`

- meta.slugが"line-break-remover"であること
- 必須フィールドがすべて存在すること

#### 6. page.tsx / OGP画像 / twitter-image

ファイルパス:

- `src/app/tools/line-break-remover/page.tsx` — text-replaceのpage.tsxと同じテンプレートパターンに従う
- `src/app/tools/line-break-remover/opengraph-image.tsx` — text-replaceのOGP画像と同じパターン。アイコンは改行を連想させるものを選定
- `src/app/tools/line-break-remover/twitter-image.tsx` — opengraph-imageの再エクスポート

#### 7. registry.ts — ツール登録

`src/tools/registry.ts`にimport文とtoolEntriesへのエントリ追加。既存のtext系ツールの近くに配置する。

### 機能仕様

| 項目                  | 仕様                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| 対応改行コード        | \n（LF）, \r\n（CRLF）, \r（CR）                                                                  |
| モード1: 削除         | すべての改行を空文字に置換                                                                        |
| モード2: スペース置換 | すべての改行を半角スペースに置換                                                                  |
| モード3: PDFスマート  | 段落間の空行（2連続以上の改行）は保持、単独改行のみ削除またはスペース置換（サブオプションで切替） |
| 連続改行オプション    | 連続する改行を1つにまとめるか全て処理するか選択可能（モード1/2のみ）                              |
| 入力上限              | 10万文字（他ツールと統一）                                                                        |
| 処理タイミング        | リアルタイム（入力変更時に即時反映）                                                              |
| 出力                  | 読み取り専用テキストエリア + コピーボタン                                                         |

### 検討した他の選択肢と判断理由

1. **slug名を `remove-line-breaks` にする案** — 検索キーワード「改行削除」に対応するURLとして `line-break-remover` の方が英語として自然で短い。ハイフン区切りで既存ツール（fullwidth-converter, kana-converter）の命名規則とも一致するため `line-break-remover` を採用。

2. **PDFスマートモードを別ツールとして独立させる案** — ユーザーの検索意図「PDF 改行 削除」は「改行削除」の延長上にあり、別ツールに分けると導線が複雑になる。1つのツール内のモード切替で対応する方がユーザー体験として優れるため、統合案を採用。

3. **ファイルアップロード機能を追加する案** — 競合のweb-toolbox.devが対応している機能だが、coding-rules.mdの「外部APIの呼び出し、データベース、認証・ユーザー管理は実装しない」原則との兼ね合い、およびテキストのペースト操作で十分なユースケースをカバーできることから、初回リリースでは見送る。ファイル読み込み（FileReader API、クライアントサイド完結）は将来の改善候補としてキャリーオーバーに記録する。

4. **「改行を任意の文字列に置換」する汎用モードを追加する案** — 汎用的だが、UIが複雑になりターゲットユーザー（手軽に改行を消したい人）にとっての使いやすさが損なわれる。text-replaceツールが既にその機能を持っているため、改行削除ツールは「よくあるユースケースを1クリックで解決する」ことに特化する。

### 計画にあたって参考にした情報

- 既存ツールの実装パターン: `src/tools/text-replace/`（meta.ts, logic.ts, Component.tsx, Component.module.css, **tests**/, page.tsx, OGP画像）および `src/tools/fullwidth-converter/`（モード切替UIのパターン）
- ToolMeta型定義: `src/tools/types.ts`
- ツールレジストリ: `src/tools/registry.ts`
- コーディング規約: `.claude/rules/coding-rules.md`
- テスト戦略: `.claude/rules/testing.md`
- アンチパターンチェックリスト: `docs/anti-patterns/planning.md`（全12項目を確認済み）

### アンチパターンチェック結果

- AP-P01（前提の定量検証）: cycle-163で「改行削除 オンライン」の需要と競合の弱さは調査済み。新たな定量前提はない。OK
- AP-P06（既存コンテンツ重複）: `src/tools/`配下に改行関連ツールは存在しないことをgrepで確認済み。OK
- AP-P07（来訪者目線）: 「改行削除 オンライン」「PDF 改行 削除」の検索意図から逆算してモード設計。OK
- AP-P08（ゼロベース設計）: UIパターンは既存ツールに合わせつつ、PDFスマートモードという新しいモードを検討。OK
- AP-P09（ゴール一致）: 来訪者への価値提供が目的であり、SEOスコア改善が目的ではない。OK

## レビュー結果

### 計画レビュー

初回レビューで6件の指摘を受け、すべて対応後にR2で承認。

1. **publishedAtフィールドの追記**（必須）: meta.tsの設計にpublishedAtフィールドを追加。ToolMeta型の必須フィールドであり、実装時のタイムスタンプを設定する。
2. **PDFスマートモードの日本語/英語挙動の明確化**（必須）: `SmartPdfJoinStyle`型（`"remove"` | `"space"`）を新設し、smart-pdfモードのサブオプションとして行内改行の処理方法を切替可能にした。UIにもsmart-pdfモード時のみ表示されるラジオボタンを追加。
3. **PDFスマートモードのテストケース追加**（必須）: 英文テキストでのスペース置換、日本語テキストでの削除、日本語英語混在テキストの3ケースを追加。
4. **relatedSlugsの双方向更新**（改善）: 作業チェックリストに、関連ツール側（text-replace, fullwidth-converter, char-count, kana-converter, text-diff）のrelatedSlugsへの逆方向追加タスクを追記。
5. **meta descriptionの具体的な文面確定**（改善）: 143文字の具体的なdescription文面を計画に記載。
6. **successフィールドの削除**（改善）: 失敗ケースが入力上限超過のみであり、errorフィールドの有無で判定可能なため、successフィールドを削除してシンプル化。

### 実装レビュー

R1で2件の指摘、修正後R2で承認。

1. **エラーメッセージのUI表示欠落**（必須）: 10万文字超の入力時にerrorをrole="alert"で表示するコードとCSSを追加。エラー時はresultInfoを非表示に。
2. **モード別処理結果メッセージ**（改善）: removeモード「削除しました」、replace-spaceモード「スペースに置換しました」、smart-pdfモード「処理しました」にメッセージを分岐。

### ビジュアルテスト

デスクトップ・モバイル（375px）× ライトモード・ダークモードの全組み合わせでPlaywrightによるスクリーンショット確認済み。来訪者目線での総合レビュー（R3）で承認。ファーストビューにツール本体が収まること、PDFスマートモードの差別化が明確であること、リアルタイム変換・処理件数フィードバック・コピーボタンのUXが競合以上であること、モバイルでの操作性・ダークモードの視認性すべて問題なし。

## キャリーオーバー

- ファイル読み込み機能（FileReader API、クライアントサイド完結）の追加は将来の改善候補。

## 補足事項

- AP-WF03（builderへの過剰な実装指示）: 今回の計画では型定義のフィールド名やUI要素のrows数・placeholder文字列まで詳細に指定しており、builderの設計判断を狭めていた。次回以降のサイクルでは、計画は「機能仕様」レベル（モードの種類、対応する改行コード、入力上限など）に留め、実装の詳細はbuilderに委ねるようにする。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
