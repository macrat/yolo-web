# cycle-290 レビュー経過ログ

B-596（ブログ TOC アンカーがジャンプしない不具合の SSoT 化）のレビュー2巡の経過。要点は index.md「レビュー結果」に統合済み。本ファイルは経緯の詳細を残す。

## 1巡目（reviewer）: Blocker 1件

**B1（Blocker）: 見出し収集状態がモジュール共有で `await` をまたぐ→並行呼び出しで `{html, headings}` が相互汚染**

- 当初実装は SSoT 化として正しい方向だったが、`createHeadingExtension()` の `idCount`/`headings` をモジュール単一インスタンス（`resetHeadingState`/`getHeadings`）で保持し、`markdownToHtml` が `reset → await parse(Shiki) → collect` の順で **reset と collect の間に await を挟む**構造だった。
- heading renderer は walkTokens(Shiki) 完了後に同期実行されるため、2つの `markdownToHtml` が in-flight になると片方の renderer がもう片方の共有配列へ push し、返る html と headings が食い違う。reviewer が `Promise.all` で再現（docA の戻り headings が docB の id を含み、その id は docA の html に無い）。`return { ..., headings: [...getHeadings()] }` のコピーは逐次の破壊しか防がず、コピー取得前の並行 push は防げない。
- 実ビルドで発火し得る根拠: `getBlogPostBySlug` は `cache()` で dedupe されておらず、`generateMetadata`・ページ本体・`opengraph-image.tsx` が同一 slug を独立に呼び、Next.js はこれらを並行実行する。旧 `extractHeadings` は純同期でレース非対象だったため、これは本変更で新規に混入した回帰。
- **PM の独立確認**: 現状コードを `Promise.all`（docA/docB×40）で回し、不一致200件を再現。指摘は真陽性と確定。

**対応**: 見出し収集状態を per-call ローカル化（案(a)）。module-level singleton をやめ、`markdownToHtml` の呼び出しごとに `createMarkedInstance()` で新しい `Marked`＋新しい heading 拡張クロージャ（`idCount`/`headings` はローカル）を生成して parse する。新規 headings レースと、旧実装から潜在の DOM id カウンタレースの両方を構造的に解消。並行回帰テスト2件を追加（異種4種×25ラウンド=100並行で各戻り値の自己整合＋テキスト列 `toEqual`／同種30並行で `-1` サフィックス非混入）。builder が「修正前は赤・修正後は緑」を確認、PM も per-call 化後に並行不一致0件を実測。

**良好と確認された点（1巡目）**: SSoT 化の方向は妥当（`extractHeadings` の隠れ消費者 0）。`decodeHtmlEntities` は marked のエスケープ集合と過不足なく対応し `&amp;` を最後に復号する順序も正しい。逐次系テストは回帰を捉える設計。型安全・規約適合。

## 2巡目（新規 reviewer・白紙・AP-WF20 準拠）: 承認

- 差分を先入観なく精読し、独立に検証。
- **前巡 Blocker の解消を確証**: module-level の可変 heading 状態は完全撤去（`grep` で `resetCounter`/`markedInstance`/`extractHeadings` 残存なし）。残る module 状態は `highlightedCodeCache`(token キー WeakMap)・`codeExtension`(無状態)・`generateHeadingId`(純関数)のみ。reviewer 自身が module共有 vs per-call の並行機構を再現（共有4件不整合→per-call 0件）、破損4記事を並行60実行して mismatch=0、追加テストが `toEqual` で bleed-in を赤捕捉する設計であることを確認。
- 正しさ/退行: DOM id ⇔ TOC id 一致、プレーンcode `useRegexWorker` の id 不変、重複 `-1` 連番、decode 順序、sanitize/本文 HTML 不変、`Heading` 型一元化を確認。TOC ラベルは JSX 自動エスケープ・id は非英数除去済みで注入余地なし。
- **Blocker/Major/Minor/Nit いずれも無し・承認**。非ブロッキング所感（TOC ラベルがモノスペース装飾なし＝空白脱落からの改善で意図済み・範囲外）のみ。

## PM 追加メモ / AP-WF08 逸脱の記録

- 陳腐化コメント1件（codeExtension フォールバックのコメントが削除済み変数名 `markedInstance` を参照）を PM 即時編集で `instance.parse()` に訂正した（コメントのみ・挙動不変）。
- **これは AP-WF08 逸脱である**（cycle-288 に続く再発。`workflow.md` の発生リストに `290` を追記済み）。コメント文言の訂正は「削除済み変数名を新構造に合わせて何と書くか」という判断を含み、機械的整形ではないため、本来 builder へ差し戻してレビューを通すべきだった。
- 実害は顕在化していない: この編集は2巡目レビュー（新規 reviewer・白紙）を依頼する**前**に行ったため、2巡目 reviewer が編集後の diff を含めて全体をレビューし「陳腐化コメント無し」を独立確認している（AP-WF08 が本来防ぐ“自分が書いたものを自分でレビューする”構造は結果的に回避された）。とはいえ逸脱の事実は残るため記録する。
- **再発防止**: 今後、サイクル途中に判明したコメント/テスト文言の訂正は PM が直接編集せず builder へ差し戻す。AP-WF08 が cycle-288・290 と連続再発しているため、機械強制化を candidates.md（AP-WF32 候補）へ記録した。
