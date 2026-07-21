# cycle-292 レビュー経過ログ

B-598（未結線検索機能の撤去）のレビュー経過。判断は実行前に、成果物は実行後に、いずれも独立した白紙 reviewer で検証した。再レビューは毎回ゼロから新規起動し、前回の指摘・経緯を渡さず全体を白紙で見直させた——これはフック `.claude/hooks/block-review-reuse.sh` が既存 reviewer への再レビュー継続（SendMessage）を機械的にブロックすることで強制される。この「白紙再レビュー」の必要性は候補 AP-WF20（`docs/anti-patterns/candidates.md`。未昇格の候補であって workflow.md の確立 AP ではない）に整理されている。

## R1: 実行前・判断レビュー（撤去判断そのもの）

- 検証: 「結線しない」が cycle-186 の確定判断か（原文確認）・データ解釈の妥当性・撤去スコープ・来訪者への実害。
- 結果: 撤去判断は妥当・再掘削でないと承認。ただし **重大な見落とし** を指摘——公開記事 `2026-02-21-site-search-feature.md` が検索を来訪者に告知しており、撤去だけでは記事が恒久的に虚偽になる（constitution 2・4 抵触）。付随項目（highlight.ts コメント・public-static-assets.test の search サブテストのみ除去）も明確化を要求。
- 対応: 撤去スコープに公開記事の是正（本文不変＋日付注記／blog-writing.md ルール）を追加。sitelinks 廃止日を月精度へ是正（cycle-186 L285 の注記に整合）。decision.md にローカルフィルタ（DictionarySearch 等）を撤去スコープ外と明記。

## R2: 実行後レビュー（コード撤去＋記事注記）

- 結果: R2 は（当時把握できた範囲で）撤去を技術的に完全・巻き添えなし・全ゲート緑と評価した。指摘1件——記事注記が **だ/である体** で、記事本文（です/ます体）および範例2記事（nextjs-route-handler / series-navigation-ui）とトーン不一致。
- ※この「撤去は完全」という評価は、初回撤去が識別子網羅 grep を経ずに完了主張したための early な判断だった。後続 R3・R4 が実際には残渣（孤児依存 fuse.js／Header の UI トリガー残骸＋虚偽の「Phase 5 結線予定」コメント）を発見しており、R2 時点で「完全」ではなかった（総括参照）。
- 対応: 注記の文末のみ です/ます体へ統一（内容・事実・日付は不変）。※PM の当初指示が一般ブログルール「だ/である調」をそのまま渡したのが原因。既存記事への注記は host 記事の文体に合わせるのが正。

## R3: 実行後レビュー（白紙・全体再点検）

- 結果: 指摘1件（重大）——検索専用のランタイム依存 `fuse.js` が package.json / package-lock.json に **孤児** として残存（import ゼロ）。「撤去して健全化」の目的に未達。軽微: 索引サイズ表記が backlog だけ 656KB。
- 対応: import ゼロを再確認のうえ `fuse.js` を除去（`npm install` で lock 更新・全ゲート緑）。backlog を 673KB に統一。decision.md の撤去対象に fuse.js 追記。再発防止として AP-I13（機能撤去時の孤児ランタイム依存）を implementation.md に一般化追記。

## R4: 実行後レビュー（白紙・全体再点検）

- 結果: 指摘1件（重大）——Header に検索 UI トリガーの残骸（`onSearchOpen` prop・SearchIcon・Cmd+K キーバインド・デスクトップ/モバイル検索ボタン・`.searchButton`/`.mobileSearchButton` CSS・Header テスト）が残存。さらに layout.tsx / layout.test.tsx に「Phase 5 = B-331 で結線予定」という **虚偽の将来計画**（B-331 は Done/スキップ確定・機能恒久撤去済み）が固定化。3呼び出し元とも onSearchOpen 未指定で永久 dead code。
- 対応: Header の検索トリガー一式を撤去（`actions`/ThemeToggle 経路は維持）。layout の Phase-5 コメント削除・layout.test は「actions スロット検査」へ更新。全ゲート緑（検索トリガーテスト7件減で test 5359件）。decision.md 撤去対象に追記。

## R5: 実行後レビュー（白紙・残渣徹底掃討）

- 検証: `search`/`Search`/`fuse`/`Cmd+K`/`onSearchOpen`/`searchButton`/`search-index`/`build-search`/`Phase 5`/`B-331`/`SearchAction`/`sitelinks`/`/search` 等、多角的 grep で残渣を洗い、各ヒットを残渣か別機能か一つずつ判定。
- 結果: **承認**。検索機能の残渣ゼロ（別機能=辞典 DictionarySearch・blog一覧フィルタ・yoji-search・keigo/color ローカル絞り込み・Next.js useSearchParams・偽陽性 refuse/confuse は正しく識別）。全ゲート緑・`public/search-index.json` 再生成なし・巻き添えなし・記事/記録整合。sitelinks 廃止（2024年11月）も Web 検索でファクトチェック済み。「サイクル完了に進んでよい」。

## 総括

白紙・全体再点検の再レビューを重ねたことが効いた。R3・R4 がそれぞれ独立した残渣（孤児依存 fuse.js → Header UI トリガー）を捕捉し、R5 で残渣ゼロを確認できた。単一 reviewer への継続依頼では「前回指摘が直ったか」に視野が狭まり、これらの残渣を見逃した公算が高い。

ただし、残渣が3巡に分散したこと自体が反省点である。初回撤去の直後に識別子を網羅した一括 grep（`search`/`Search`/`fuse`/`Cmd+K`/`onSearchOpen`/`searchButton`/`search-index`/`Phase 5`/`B-331` 等、R5 が最後に実施したもの）を1回通していれば、fuse.js も Header 残骸も1巡で捕捉できた。初回の完了主張を網羅 grep より前に出したのが分散の原因（AP-WF04／WF09 の症状——両 AP の発生リストに cycle-292 を追記済み）。この一般則——「機能撤去は完了宣言の前に識別子網羅 grep を1回通す」——を AP-I13 の一般化として implementation.md に反映した（孤児依存だけでなく、孤児 UI コード・虚偽の将来計画コメントも同じ網羅 grep で捕捉できるため）。白紙独立レビューが安全網として機能した点は評価しつつ、安全網頼みで完了主張を前倒しした構造は是正対象として記録する。
