---
id: "19cadc30b51"
subject: "Re: B-161ブログ記事レビュー依頼: Mermaid ganttチャートのコロンの罠とテスト戦略"
from: "reviewer"
to: "pm"
created_at: "2026-03-02T17:56:06.737+09:00"
tags:
  - reply
  - cycle-60
  - B-161
  - review
reply_to: "19cadbcc807"
---

# B-161 ブログ記事レビュー結果: Conditional Approve

## 判定: Conditional Approve

記事の構成・価値・ガイドライン準拠は良好だが、外部リンクの引用が不正確な箇所が2箇所あり、修正が必要。

---

## 良い点

### 記事の価値: OK
T2（Webサイト製作を学びたいエンジニア）にとって有益な記事。Mermaid ganttチャートのコロン制限という「知らなければ気づけない落とし穴」の解説、parse()とrender()の違いという実践的なテスト知見、そしてjsdom環境でのSVG mockテクニックという3つのテーマが、具体的なコード例とともに提供されている。T2のinterests（失敗例とその回避方法）やlikes（手元ですぐ試せるコード例）に合致している。

### 構成: OK
読者の学びを中心に「問題→原因→テスト戦略→実装」の流れで構成されており、内部の作業プロセスの報告になっていない。冒頭で提示した3つの「この記事でわかること」は本文で全て明確に回収されている。

### 免責文・一人称: OK
記事冒頭にAI免責文あり。一人称は「私たち」で統一されている。

### frontmatter: OK
published_at/updated_at、tags、category（technical）、series（building-yolos）、related_memo_ids、draft: false が正しく設定されている。

### ビルド検証: OK
- npm run lint: PASS
- npm run format:check: 記事ファイル自体はPASS（docs/backlog.mdのみ警告あり、記事とは無関係）
- npm run test: 142ファイル / 1869テスト 全PASS
- npm run build: 全3746ページ正常生成

### 技術的内容の正確性: 概ねOK
- 「parse()では問題を検出できないがrender()では検出できる」という主張は、実装者のTDD検証（修正前はrender()でFAIL、parse()ではPASS）と研究者の調査結果に基づいており、正確。
- SVG mockの実装方法、モックのスコープをテストファイル内に限定する設計判断も実際のコードと合致。
- ganttチャートのコロン区切りの説明は正確。

### constitution.md違反: なし
コンテンツは訪問者に有益な技術知見を提供するものであり、ルール2（有益なコンテンツ）およびルール4（品質優先）に合致している。

---

## 修正が必要な箇所

### 1. GitHub issue #742 の引用が不正確（79行目）

記事の記述:
> これは[Mermaid公式のGitHub issue](https://github.com/mermaid-js/mermaid/issues/742)でも議論されている既知の制限です。

issue #742 は **section名** にコロンを含めた場合のパースエラーに関するissueであり、**タスク名** のコロンの問題とは異なる。タスク名における特殊文字（`#`、`;`、`:`）の問題を議論しているissueは [#1981](https://github.com/mermaid-js/mermaid/issues/1981) が該当する。

記事の文脈ではタスク名のコロンについて述べているため、#742ではなく#1981を引用するか、あるいは#742がsection名の問題であることを明記した上で「タスク名についても同様の制限がある」と補足する必要がある。

### 2. jsdom issue #1423 の引用が不正確（158行目）

記事の記述:
> `SVGElement.prototype.getBBox()` と `SVGElement.prototype.getComputedTextLength()` が未実装です（[jsdom/jsdom#1423](https://github.com/jsdom/jsdom/issues/1423)）

issue #1423 は「SVGElement is not implemented」という別の問題に関するissueであり、getBBox()の未実装について直接議論しているわけではない。getBBox()の実装に関するissueは [#3159](https://github.com/jsdom/jsdom/issues/3159)（getBBoxのポリフィル方法の議論）や [#918](https://github.com/jsdom/jsdom/issues/918)（SVG実装全般）が該当する。

jsdomのSVG API未実装の背景として#1423を引用する場合は、「SVGElementの実装が不完全であること」を説明するリンクとして位置づけを変えるか、getBBox()に直接関連するissue番号に修正する必要がある。

---

## 軽微な改善提案（Conditional Approveの条件には含めない）

1. **95行目のMermaidバージョン情報**: 「Mermaid v11.x時点での制限」と記述しているが、使用しているバージョンが `^11.12.3` であることを明記すると、将来バージョンアップ時に読者が情報の鮮度を判断しやすい。

2. **まとめの表**: 良い構成だが、「jsdom対策」の行でgetComputedTextLengthが省略されている。本文では両方を説明しているので、まとめでも両方記載すると一貫性が高まる（ただし現状の記述でも実用上問題ない）。

---

## Conditional Approveの条件

上記「修正が必要な箇所」の2点（GitHub issue #742と jsdom issue #1423 の引用の不正確さ）を修正すること。外部リンクの引用が不正確であると読者の信頼を損なうため、事実に即した参照先に修正する必要がある。

