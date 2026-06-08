---
id: 227
description: 道具箱の本物のライブタイル化を継続する（B-497）。url-encode で実証した単一正典タイルのパターンで、簡単なツールの小バッチをライブタイル化し再現性を実証する。
started_at: 2026-06-08T23:35:49+0900
completed_at: null
---

# サイクル-227

このサイクルでは、cycle-226 で url-encode（1/34）を「動いた実物」として実証した**単一正典タイル**のパターンを、残り33ツールへ広げる継続作業（B-497）に着手する。

約50サイクルにわたる事故の系譜（cycle-175 → 226、`docs/cycles/cycle-226.md` 末尾「事故報告書」）が示す不変の失敗モードは「ナビゲーション（ページ目録・カード・ラッパー）を作り、埋め込まれて動くタイルを作らない」ことだった。cycle-226 の立て直しで、Owner 合意済みの原設計——**埋め込まれてその場で動く本物のタイルを並べる道具箱を先に作り、ダミーを本物のタイルへ1個ずつ差し替える**——の第一歩が動いた。

今サイクルはその第二歩。**簡単なツールの小バッチ（≈3）**を url-encode と同じパターンでライブタイル化し、「同じタイルが道具箱と詳細ページの両方でページ遷移なしに同一に動く」ことを複数ツールで再現する。バッチを小さく保つのは、quality over quantity と「1コンテンツ1サブエージェント」の規律、そして脆い立て直し領域での事故防止のため。

> **不変の合格条件（cycle-226 事故報告書 §5）**: 完了の合格条件は「同じタイルが、道具箱と詳細ページの両方で、ページ遷移なしに同一に動くこと」。「Panel があるか」ではない。

## 実施する作業

- [x] **T-1: html-entity を単一正典タイル化**（`HtmlEntityTile.tsx`＋CSS＋テスト・詳細ページ再配線・旧 `HtmlEntityPage.tsx` 削除）。fresh reviewer 承認・指摘ゼロ。
- [x] **T-2: base64 を単一正典タイル化**（`Base64Tile.tsx`＋CSS＋テスト・詳細ページ再配線・旧 `Base64Tool.tsx` 削除）。reviewer [major]1件（旧テスト振る舞い3件の移植漏れ）→修正→再レビュー承認。
- [x] **T-3: fullwidth-converter を単一正典タイル化**（`FullwidthConverterTile.tsx`＋CSS＋テスト・詳細ページ再配線・旧 `FullwidthConverterPage.tsx` 削除）。fresh reviewer 承認・指摘ゼロ。
- [ ] **T-4: 3 タイルを道具箱（`/toolbox`）へ統合**（`ToolboxContent.tsx` のダミー差し替え＋グリッド追加・道具箱テスト更新）。T-1〜T-3 完了後に直列で実施（共有ファイル競合回避）。
- [ ] **T-5: 合格条件の実機 Playwright 検証＋最終ゲート**（同一タイルが道具箱と詳細ページの両方でページ遷移なしに同一動作・ライト/ダーク・w360/w1280・id 重複ゼロ／lint・format・test・build 全通過）。T-4 完了後。

> 進捗メモ: T-1〜T-3 をコミット（a9b54698）。PM 独立全ゲート再実行＝tsc0 / lint0 / format0 / test5440 / build0。

## 作業計画

### 目的

**誰のため**: 「特定の作業に使えるツールをさっと探している人」（全角半角変換・HTMLエスケープ確認・Base64 変換を検索で開いてすぐ使いたい人）と、「気に入った道具を繰り返し使っている人」（道具箱に好きなタイルを並べて使いたい人）。

**何のため**: 約50サイクル繰り返した「ナビゲーション（ページ目録）を作って、埋め込まれて動くタイルを作らない」失敗モードからの立て直しの第二歩。cycle-226 で url-encode（1/34）が「同じタイルが道具箱と詳細ページの両方でページ遷移なしに同一に動く」ことを実証した。今サイクルは**同形（方向変換系）の簡単な3ツールで同パターンを再現**し、残り32ツールへ展開できる信頼できるリズムを確立する。同時に、来訪者には「開いた瞬間に使える・コピーして元の作業に戻れる・道具箱に並べて繰り返し使える」本物のライブツールが3つ増える。

**提供価値**: (1) 来訪者は3ツールを詳細ページでも道具箱でも、ページ遷移なしにその場で使える。(2) 道具箱（プレビュー）に生きたタイルが url-encode 系3＋新3＝計6種並び、「好きな道具を1画面に並べる」コンセプトが実物として前進する。(3) 残り32ツールの横展開が、検証済みの反復手順として確立される。

### 作業内容

#### 対象ツールの選定と根拠

| 順位 | ツール              | url-encode 同形度                        | variant 案                       | 追加要素                      | 来訪者価値（検索意図）               |
| ---- | ------------------- | ---------------------------------------- | -------------------------------- | ----------------------------- | ------------------------------------ |
| T-1  | html-entity         | ★★★★★（最も同形・追加コントロールなし）  | full / encode / decode           | なし                          | HTMLエスケープ確認（エンジニア向け） |
| T-2  | base64              | ★★★★☆（ToggleSwitch 1個＋URL-safe 状態） | full / encode / decode           | ToggleSwitch（encode 時のみ） | Base64変換（エンジニア向け）         |
| T-3  | fullwidth-converter | ★★★☆☆（文字種 checkbox 3個）             | full / toHalfwidth / toFullwidth | checkbox 3個                  | 「全角半角変換」＝高検索意図         |

- **なぜこの3つ**: 全て url-encode と同形の「方向変換系（full＋方向固定 variant）」。実証済みパターンに正確に一致するため、立て直し第二歩として最も成功確率が高い。複雑さが段階的（追加コントロールなし→1個→3個）で、小さな差異をパターンが吸収できることを示せる。fullwidth-converter は「全角半角変換」が高検索意図で来訪者価値が直接的。
- **なぜ kana-converter / char-count を今サイクルに入れないか**: kana-converter は4モード＋横2カラムレイアウト、char-count は統計グリッド・コピーなしで、url-encode と**異なる形**。独立した variant 設計が要る。パターン確立を優先し、別形は後続サイクルへ（キャリーオーバー）。

#### 各ツールのタイル化手順（T-1〜T-3 共通・`docs/knowledge/tile-architecture.md` §3 準拠）

1. `src/tools/<slug>/<Name>Tile.tsx` を新設。ルートは `<Panel as={as} className={className}>`、`"use client"` 自己完結、ToolPageLayout 非依存。UrlEncodeTile を雛形にする。
2. **唯一の共有エンジン**＝既存 `logic.ts` をそのまま使う（再実装しない）。base64/html-entity は `{success,output,error}` 構造、fullwidth は `string` 直接返却（エラー経路なし）。
3. **1ツール n タイル＝variant prop**で表現（別実装を作らない）。full は方向トグル表示、方向固定 variant はトグル非表示。fullwidth の文字種 checkbox 3個は**全 variant で維持**（機能を枠に合わせて削らない）。**variant 値の命名規約（後続32ツールの一貫性のため確定）**: 方向固定 variant の値は、対応する logic のモード名にそのまま揃える（base64・html-entity＝`encode`/`decode`、fullwidth＝`toHalfwidth`/`toFullwidth`＝既存 `ConvertMode` に一致）。full は常に `full`。
4. **DOM id は `useId` ベースで一意化**（道具箱の複数インスタンス同居で id 重複・label 誤結合を防ぐ）。現状の全ツールがハードコード id なので必ず修正。
5. **アクセシビリティ**: 出力は readOnly＋`role="status" aria-live="polite"` のサマリ div（C-3）。エラーは日本語化済みメッセージを `ErrorMessage` に渡す（A-4）。既存ツールの a11y 水準を下げない。
6. **旧「ページ本体」コンポーネントを削除**（`<Name>Page.tsx`／`Base64Tool.tsx` と対応 CSS）。詳細ページが新タイルを import する形に再配線。**別実装を残さない**（grep で UI 実装が1つだけになる状態＝分裂の構造的排除）。削除前に、当該ツールの `opengraph-image.tsx`／`twitter-image.tsx` が旧本体・旧 CSS に依存していないことをビルダーが確認する（非依存のはずだが削除事故を予防。最終的に T-5 の build でも機械捕捉）。
7. 旧 UI テスト（`<Name>Page.test.tsx` 等）を `<Name>Tile.test.tsx` に移植・拡張。variant 別レンダリング・複数インスタンスの id 一意性（UrlEncodeTile.test.tsx の V-7 相当）・既存の振る舞いを網羅。`logic.test.ts` は不可触（ロジック非改変）。
8. CSS は `<Name>Tile.module.css`（UrlEncodeTile.module.css の作法）。

#### T-4: 道具箱への統合手順

- `ToolboxContent.tsx` で新3タイルを import し、各ツールを **full variant＋方向固定 variant 1枚** の生きたインスタンスとして配置する（html-entity＝full＋encode、base64＝full＋encode、fullwidth＝full＋toHalfwidth を推奨。具体の選択はビルダー裁量）。**「new ツールも道具箱で n タイル（最低2 variant）を実機展示する」**のは、合格条件 T-5「各 variant が正しく動く」を**詳細ページの full だけでなく道具箱の実機でも担保**するため（url-encode が full/encode/decode の3枚で実機実証した前例に揃える）。全 variant 総展示（各ツール3枚）は道具箱肥大になるため取らず、キュレーションは将来 B-502 へ。
- ダミータイル×2 を本物に差し替え、不足分は新グリッド枠として追加（ダミーは結果ゼロに）。url-encode 3＋新ツール各2＝計9枚程度のプレビューになる。寸法は `calcTilePixels(cols,rows)` を推奨上限に、`maxWidth`＋`width:100%`（固定 width 禁止＝w360 横はみ出し防止）。タイルが規格高に収まらなければ `minHeight` でオーバーフロー許容（機能を削らない）。
  - （ビルダー裁量・任意）ダミー全廃で「今後タイルが増える」余地の見せ方が消える点は、実機で一度判断してよい。機能・合格条件には影響しないため申し送りに留める。
- 道具箱テスト（`ToolboxContent.test.tsx`）を**検証意図から再設計する**: 現行 TB-1 は `getAllByLabelText("入力"/"出力")` がちょうど3（url-encode のラベル文言依存）という数合わせで、新タイルのラベル文言が異なる（html-entity「テキスト入力／HTMLエンティティ入力」、base64「Base64入力」等）ため、新タイルを足しても「入力/出力ちょうど一致」は3のままで**新タイルの実在を何も検証しない死んだアサーション**になる。これを温存せず、**「各新タイル（html-entity/base64/fullwidth）が道具箱に実在し、展示した全 variant（full＋方向固定 1枚）が描画されている」ことを検証する**設計に作り替える（タイルごとの代表ラベル／role の数え方など実装はビルダー裁量。ただし「数合わせの空洞化を温存しない」が設計要件）。radiogroup 数アサーションも、full variant ごとに方向トグル（SegmentedControl=radiogroup）が増える前提で期待値を明示更新する（url-encode full＋新3ツール full＝計4 を想定）。TB-3（準備中タイル数→0 または該当テスト削除）・TB-4（id 一意性は useId 採用で維持）。TB-2（リンク不在）・TB-5（width 固定なし）は構造維持。

#### T-5: 完了の合格条件（書類でなく実物・`tile-architecture.md` §4）

- **フォアグラウンド Playwright（本番ビルド）**で確認: 道具箱でタイル内ツールがページ遷移なしに動く（`page.url()` 不変・`framenavigated` 無発生）。詳細ページのヒーローが同じタイルで同じ動作。各 variant が正しく動く（道具箱に展示した full＋方向固定 variant の両方を実機操作で確認）。
- Panel ルート（computed background がテーマ解決済み `--bg`・border-radius `--r-normal`・box-shadow none）をライト/ダーク両方で確認。複数インスタンス id 重複ゼロ・hydration エラーゼロ・w360/w1280 で破綻なし。
- **9枚化したプレビューのモバイル可読性**: 道具箱が url-encode 3＋新ツール各2＝計9枚（うち full 4枚は 536px 規格）に増えるため、cycle-226 T-4 で起きた w360 横はみ出し（commit 106be98d）の再発がないことに加え、**w360 で各タイルが横はみ出しなく1枚ずつ縦に積まれ、プレビューとして実用的に閲覧・操作できる**こと（縦に伸びすぎて道具箱の体をなさない、等になっていないか）を目視で確認する。破綻時は寸法・配置を調整（機能は削らない）。
- **タイル化前後の等価性（リグレッション非発生）を検証**: 「同じタイルが両所で動く」が真でも「詳細ページが以前より使いにくくなった」が同時に成立しうるため、feature-preserving を**宣言でなく検証で**担保する。各ツールについて、タイル化前に存在した (a) 全コントロール（base64＝URL-safe トグル、fullwidth＝文字種 checkbox 3個＋その group ラベル、html-entity＝方向トグル）、(b) a11y 関連付け（とくに base64 の `aria-describedby` による説明文の結び付き・各 label↔control 関連）、(c) 入力体験（textarea の rows 等）が、タイル化後も劣化なく保たれていることを実機・スナップショットで確認する。とくに **base64 の `aria-describedby` と fullwidth の checkbox group は明示的に確認対象**とする（useId 化で id を付け替えるため関連切れが起きても「動作する」検証は通ってしまう）。
- `npm run lint && npm run format:check && npm run test && npm run build` を PM が独立再実行して全通過を確認。
- スクリーンショット等の一時成果物は `tmp/cycle-227/` 配下のみに保存。

### 注意点

- **派生ドキュメントでなく一次資料から出発する**: 実装の正典は `docs/knowledge/tile-architecture.md` と実証済み `UrlEncodeTile.tsx`。判断に詰まったら `docs/site-concept.md` を読む。design-migration-plan.md は逸脱が残っており（B-501 で別途訂正予定）今サイクルの起点にしない。
- **スコープ厳守**: 共通部品の新設・拡張（B-496 の Input 拡張等）、ToggleSwitch の塗り統一（B-495）、計画書訂正（B-501）、型契約/レジストリ（B-502）は**今サイクルのスコープ外**。タイル化は既存の振る舞いを保存する移行（feature-preserving）に徹し、新たな設計判断を持ち込まない。
- **分割と直列化**: T-1〜T-3 は別ディレクトリ・別ファイルで並行可。1ツール1ビルダー。T-4 は共有ファイル（ToolboxContent.tsx）を触るため T-1〜T-3 完了後に直列。T-5 は最後。
- **レビュー必須**: 各タスクは fresh reviewer のレビューを受け、指摘ゼロまで改善を繰り返す。合格条件（同一タイルが両所で動く）は PM がフォアグラウンド Playwright で一次確認する（機械的 Panel 存在チェックで代替しない）。
- **機能を削らない**: fullwidth の文字種 checkbox 3個、base64 の URL-safe トグルなど既存機能は全 variant で維持。タイル寸法に合わせて機能を落とすのは過去の事故パターン。

### 検討した他の選択肢と判断理由

- **(A) 1ツールだけ（url-encode に続けて1個）**: 安全だが、cycle-226 で既に1個実証済み。再現性の確認には複数が要る。→ 却下。
- **(B) 別形（kana-converter / char-count）を混ぜる**: 残り32ツールの形の多様性を早く de-risk できる利点はあるが、独立した variant 設計が要り、立て直し第二歩としては不確実性が高い。まず同形でリズムを固めるのが堅実。→ 後続サイクルへ。
- **(C) B-501（計画書訂正）を同時実施**: 密接結合しておらず、事故報告書が「foundational doc は deliberate に・敵対的レビュー必須」と明記。build-first（動いた実物を増やす）を先行させ独立サイクルで行う。→ 今サイクル対象外。
- **(D) 道具箱の variant 展示数（全部 / full のみ / full＋1枚）**: 全 variant 総展示（各ツール3枚）は道具箱が肥大し可読性が落ちる。一方「full のみ」だと新ツールの方向固定 variant が詳細ページにも道具箱にも一度も実機描画されず、合格条件「各 variant が動く」を実機で担保できない（ユニットテスト止まり）。中間の **full＋方向固定 variant 1枚** を採用し、各ツールの n タイルを実機検証可能にしつつ肥大を抑える。全 variant のキュレーションは B-502 へ。

### 計画にあたって参考にした情報

- `docs/knowledge/tile-architecture.md`（確立パターンの正典・§3 実装パターン・§4 合格条件・§5 失敗モード）
- `docs/cycles/cycle-226.md` 末尾「事故報告書」（cycle-175→226 の不変の失敗モードと立て直し方針）
- `src/tools/url-encode/UrlEncodeTile.tsx`・`UrlEncodeTile.module.css`・`__tests__/`（実証済み雛形）
- `src/app/(new)/toolbox/ToolboxContent.tsx`・`tile-grid.ts`・`components/Panel`（道具箱の拡張ポイント）
- code-researcher 2件の調査レポート（候補5ツールの logic/UI/variant/複雑さ比較・道具箱の追加手順チェックリスト）
- `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`・`気に入った道具を繰り返し使っている人.yaml`（提供価値の根拠・search_intents）

## レビュー結果

<作業完了後に記載。>

## キャリーオーバー

<このサイクルで完了できなかった作業があれば、ここと /docs/backlog.md の両方に記載する。>

## 補足事項

- B-501（design-migration-plan.md の原設計訂正）は今サイクルのスコープ外。事故報告書が「foundational doc のため deliberate に・敵対的レビュー必須」と明記しており、build-first（動いた実物を増やす）を先行させてから独立サイクルで実施する。
- B-502（タイルレジストリ／型契約の再設計）も今サイクルのスコープ外。ライブタイル化の横展開で型契約の必要性が顕在化した時点で着手する。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
