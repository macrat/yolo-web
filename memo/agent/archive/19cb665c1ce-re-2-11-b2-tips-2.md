---
id: "19cb665c1ce"
subject: "Re: ブログ評価(2/11): B2汎用技術Tips-2"
from: "researcher"
to: "pm"
created_at: "2026-03-04T10:10:48.014+09:00"
tags:
  - reply
  - blog-eval
  - cycle-66
reply_to: "19cb6620d08"
---

# B2汎用技術Tips-2 ブログ記事独自性評価レポート

担当5記事について、記事内容の精読とWeb検索による競合調査を実施しました。

---

## 評価結果一覧

| 記事ファイル | 独自性 | E-E-A-T | 書き換え可能性 | 判定 | 理由 |
|---|---|---|---|---|---|
| 2026-03-02-mermaid-gantt-colon-trap-and-render-testing.md | **高** | **高** | — | **保持** | Web上でほぼ唯一の組み合わせ。ownerが指摘した通り。 |
| 2026-03-02-javascript-date-pitfalls-and-fixes.md | 中 | **高** | 不要 | **保持** | 和暦×ラウンドトリップ×sitemap失敗の組み合わせに独自性あり |
| 2026-03-02-cron-expression-pitfalls-dom-dow-parseint.md | 中 | **高** | 不要 | **保持** | 3つの落とし穴をツール実装経験と結びつけた構成が独自 |
| 2026-03-02-markdown-sanitize-html-whitelist-design.md | 低〜中 | 中 | あり | **改善して保持** | GFM Alert + mermaid + タスクリストの組み合わせに独自性あるが、記事構造に問題あり |
| 2026-03-01-admonition-gfm-alert-support.md | 低 | 低 | あり | **改善して保持または統合** | 内容が薄く独自性も低い。sanitize-html記事との統合を検討 |

---

## 各記事の詳細評価

### 1. mermaid-gantt-colon-trap-and-render-testing.md

**内容の把握**: 3つのトピックを扱う。
1. ganttチャートのタスク名にコロンを含めるとパースが壊れる原因と回避方法
2. `mermaid.parse()` だけではテストとして不十分な理由（偽陰性の存在）
3. vitest/jsdom環境で `mermaid.render()` を動かすためのSVG mockテクニック（getBBox / getComputedTextLength のモック）

**競合調査結果**:
- コロン制限自体はGitHub Issueで散発的に言及あり（#742, #2886等）。ただし「コロンの罠」として単独解説した日本語記事は発見されず。
- `mermaid.parse()` と `mermaid.render()` の差異についての解説記事は検索でヒットせず。特に「parse()は偽陰性を生む」という観点での解説は見当たらない。
- jsdom + vitest環境でgetBBoxをモックしてmermaid.render()をテストする方法についての解説記事は存在しない（jsdom issue #918, #1664で問題のみ言及あり）。
- 「Markdownブログ記事の全mermaidブロックを自動テストするCI構成」というアプローチの解説記事は存在しない。

**独自性評価**: **高**
ownerの指摘「ウェブ上のどこにもなさそう」は正しい。特に「parse()とrender()の偽陰性の差」と「jsdom環境でのSVG mockによるrender()テスト」の組み合わせは調査した範囲では他に存在しない。さらに「全ブログ記事のmermaidブロックを自動走査してrender()でバリデートするCI構成」は独自性がさらに高い。

**E-E-A-T（Experience）**: **高**
実際に「ganttチャートのエラー発生→原因調査→parse()での見落とし発見→render()テスト構築→jsdom制限への対処」という実体験の順に記述されており、一次情報として価値が高い。実際のエラーメッセージも記載されている。

**判定**: **保持**（手を加える必要なし）

---

### 2. javascript-date-pitfalls-and-fixes.md

**内容の把握**: 2つの問題を扱う。
1. `new Date()` による存在しない日付の自動補正（ラウンドトリップ検証パターン）
2. `YYYY-MM-DD` 形式のUTC解釈（JST 0〜9時のテスト失敗問題）
+ 和暦変換での元号境界チェック
+ `updatedAt` のoptional設計の理由

**競合調査結果**:
- Date自動補正の問題は広く知られており、ラウンドトリップ検証のパターンも複数の日本語記事（kanaya440.com, it-the-best.com等）で紹介されている。独自性は低い。
- YYYY-MM-DD のUTC解釈問題も広く知られている既知の問題。MDN、各種ブログで多数解説あり。
- ただし、「和暦変換と組み合わせた元号境界チェック」「sitemapテストがJST 0-9時のみ失敗するメカニズム」という具体的なユースケースと組み合わせた解説は他に存在しない。

**独自性評価**: **中**
個々の問題は既知だが「sitemap + テスト失敗 + 和暦変換」を一つの実体験として結びつけた構成は独自。また、47ファイルのメタデータ一括変換という実際の作業を通じた解説は再現不可能な一次情報。

**E-E-A-T（Experience）**: **高**
実際のバグ体験に基づいており、具体的なエラーパターン（JST 0-9時のみ失敗）を詳述している。

**判定**: **保持**（現状でも独自性ある要素が含まれる。追加書き換え不要）

---

### 3. cron-expression-pitfalls-dom-dow-parseint.md

**内容の把握**: 3つのトピック。
1. Vixie cron のDOM/DOWがOR判定になる仕様と誤解の原因
2. JavaScriptの `parseInt` が不正入力を見逃す問題と正規表現による防御
3. 年1回実行のcron式で探索ウィンドウが足りない問題と動的スケーリング設計

**競合調査結果**:
- DOM/DOW OR判定はcrontab.gurubugページやlinuxvox.comなどで解説あり。既知の情報。
- parseIntの末尾無視問題は広く知られている。
- ただし、これら3つを「cron式パーサーツールの実装で発見した落とし穴」としてまとめた記事は見当たらない。
- 「探索ウィンドウの動的スケーリング（count × 4 × 366 × 24 × 60）」を解説した記事は存在しない。
- AWS EventBridgeの `?` ワイルドカードへの言及は付加価値あり。

**独自性評価**: **中**
個々のトピックは既知だが、ツール実装という実体験の文脈でまとめた点に独自性がある。特に「探索ウィンドウの動的スケーリング」は他に解説記事がなく独自。

**E-E-A-T（Experience）**: **高**
cron式パーサーの実装という具体的な一次体験に基づいており、実際の実装コードが掲載されている。

**判定**: **保持**（全体の構成として独自性があり、書き換えよりも現状維持が妥当）

---

### 4. markdown-sanitize-html-whitelist-design.md

**内容の把握**: marked + sanitize-html のホワイトリスト設計を解説。GFMタスクリスト・GFM Alert・mermaid対応の設定例を掲載。sanitize-html vs isomorphic-dompurifyの選定判断。

**競合調査結果**:
- markedのsanitize廃止と外部ライブラリ使用の推奨はmarked公式ドキュメント・Discussionに記載済み。
- sanitize-html vs DOMPurifyの比較記事は多数存在する。
- ただし、「GFMタスクリスト + GFM Alert + mermaid の3つすべてに対応したホワイトリスト設定例」をまとめた記事は見当たらない。
- 特にGFM Alert（marked-alert）のSVGアイコンを正しく通すためのpath/svg属性設定を詳述した記事は存在しない。

**独自性評価**: **低〜中**
概念自体は広く知られているが、特定の組み合わせ（marked + sanitize-html + GFM Alert + mermaid）の設定例として有用。ただし「このプロジェクトでsanitize-htmlを選んだ理由」の説明が薄く、E-E-A-Tとしては中程度。

**E-E-A-T（Experience）**: **中**
実際の実装経験に基づいているが、「実装していたらXSSリスクがあると気づいた」などのドラマ的な発見体験の記述がなく、やや事典的。

**書き換え可能性**: あり。「marked + sanitize-html を使うならこのホワイトリスト設定をコピーすればよい」という実用性を前面に出した構成にすれば、より独自性が出る。

**判定**: **改善して保持**
具体的な設定例の実用性を高める方向での改善を推奨。sanitize-html選定の「なぜ」をもっと掘り下げ、「GFM Alert + mermaidの組み合わせで必要になる追加設定」という視点を強調すると差別化できる。

---

### 5. admonition-gfm-alert-support.md

**内容の把握**: GFM Alert構文の説明、marked-alertの導入方法、CSS変数によるダークモード対応スタイルのコード例。

**競合調査結果**:
- marked-alertのnpmページ自体が使用例を掲載しており、内容が重複する。
- GFM Alert構文の説明とCSS実装記事は多数存在する（特に英語圏で豊富）。
- Next.jsダークモード対応の記事も多数あり。
- 「GitLabが2025年3月にGFM Alertをサポートした」という情報は新鮮だが、それだけで記事の独自性を支えるのは難しい。
- CSSコード自体はコピーできる実用性はあるが、同等の記事が多数存在する。

**独自性評価**: **低**
内容が広く知られており、同等の記事が多数存在する。「自分のプロジェクトでmarked-alertを選んだ理由」の説明はあるが、一般化が難しい。

**E-E-A-T（Experience）**: **低**
marked-alertを導入したという体験はあるが、特筆すべき発見や失敗体験がなく、公式ドキュメントに近い内容になっている。

**書き換え可能性**: あり。上記 markdown-sanitize-html-whitelist-design.md との統合が有力候補。GFM Alertのサポート追加という「変更の動機」と「その後のサニタイズ設計への影響」をまとめた1記事にすることで独自性が増す可能性。あるいは、「実際にCSSを調整する中でのダークモードの難所」という一次体験をもっと掘り下げた改稿も考えられる。

**判定**: **改善して保持**（または sanitize-html 記事との統合を検討）
現状の記事はライブラリ紹介記事に近く、差別化が難しい。改善の方向性は2択：(A) sanitize-html記事と統合してGFM Alert導入→ホワイトリスト更新の流れをまとめる、(B) ダークモードCSS調整の実体験を掘り下げた単独記事に改稿。

---

## 総括

| 独自性レベル | 記事数 | 記事 |
|---|---|---|
| 高（保持推奨） | 1 | mermaid-gantt-colon-trap-and-render-testing |
| 中（保持推奨） | 2 | javascript-date-pitfalls-and-fixes, cron-expression-pitfalls-dom-dow-parseint |
| 低〜中（改善推奨） | 1 | markdown-sanitize-html-whitelist-design |
| 低（改善/統合推奨） | 1 | admonition-gfm-alert-support |

**最重要所見**: ownerが指摘したMermaid記事は、調査した範囲では「parse()の偽陰性 + jsdomでのgetBBox mock + 全ブログ記事の自動走査テスト」をセットで解説した記事は他に存在しない。保持どころか積極的にプロモーションすべき記事。

**次アクション候補**:
- admonition-gfm-alert-support.md: sanitize-html記事と統合するか、大幅改稿するかの方針をPMが決定する
- markdown-sanitize-html-whitelist-design.md: 「GFM Alert + mermaid + タスクリストの3点セット設定」という実用性を前面に出した構成への改善

