---
id: 160
description: "ToolLayoutモバイルUX改善（B-294）。モバイルでツール本体をファーストビューに近い位置に配置し、来訪者が最速でツールにアクセスできるようにする"
started_at: "2026-04-06T18:27:46+0900"
completed_at: null
---

# サイクル-160

ToolLayoutのモバイルUX改善（B-294）。モバイルでツール本体がファーストビューに入っていない問題を修正し、来訪者がツールを使いに来た場合に最速でツール本体に到達できるようにする。全33ツールに影響する設計変更。

## 実施する作業

- [x] Step 1: 現状調査 — ToolLayoutの構造を把握し、モバイルでどのセクションがツール本体を押し下げているか確認
- [x] Step 2: 改善方針の策定 — 来訪者にとって最速でツール本体にアクセスできるレイアウトを検討
- [ ] Step 3: 実装 — ToolLayoutの改善を実装
- [ ] Step 4: ビジュアルテスト — モバイル/PC/ダークモードで表示確認
- [ ] Step 5: レビュー — 来訪者目線でのレビュー
- [ ] Step 6: デプロイ準備 — lint/format/test/build全成功確認

## 作業計画

### 目的

モバイル（375x667等）でツールページにアクセスした際、ツール本体（children）がファーストビューに表示されるようにする。ターゲットユーザーは「全角半角変換」「文字数カウント」等で検索してきた人であり、ツールの説明より先にツール本体を使いたい。現状はBreadcrumb + h1 + TrustLevelBadge + description + valueProposition + usageExampleで画面全体が埋まり、ツール本体が全くファーストビューに入っていない。

### 作業内容

**方針: モバイルでのみ、ツール本体をヘッダー直後に配置し、補助コンテンツを下に移動する**

具体的には、ToolLayout.tsxにおけるレンダリング順序をモバイルとデスクトップで変える。CSS `order` プロパティを使い、モバイルではツール本体（children）をヘッダーの直後に、valuePropositionとusageExampleをツール本体の後に配置する。

#### 変更対象ファイル

1. **`src/tools/_components/ToolLayout.tsx`** — レイアウト構造の変更
2. **`src/tools/_components/ToolLayout.module.css`** — CSSでのorder制御

#### 具体的な実装手順

**Step 1: ToolLayout.tsxの構造変更**

現在のheaderタグの中にdescriptionとvaluePropositionが含まれているが、これをモバイルで分離できるようにする。

- header内からvaluePropositionを独立したブロックとして分離する
- レイアウト全体をCSS Grid（またはFlexbox）のコンテナとし、各セクションにorder用のクラスを付与する

モバイルでの表示順:

1. Breadcrumb
2. h1 + TrustLevelBadge + description（簡潔なヘッダー）
3. **children（ツール本体）** ← ファーストビューに入る
4. valueProposition
5. usageExample
6. privacyNote以降（従来通り）

デスクトップでの表示順（変更なし）:

1. Breadcrumb
2. h1 + TrustLevelBadge + description + valueProposition
3. usageExample
4. children（ツール本体）
5. privacyNote以降

**Step 2: CSS実装**

ToolLayout.module.cssに以下を実装する:

- レイアウトコンテナに `display: flex; flex-direction: column;` を設定（既にarticleタグが暗黙的にブロックレイアウトなので、flex化する）
- 各セクション（header, valueProposition, usageExample, content）にデフォルトのorderを設定
- `@media (max-width: 768px)` 内で、contentのorderをvalueProposition/usageExampleより前に変更する。ブレークポイント768pxは既存のToolLayout.module.cssのメディアクエリで使用されている値と一致しており、同じブレークポイントを使用することで一貫性を保つ

具体的なCSS order値:

- デスクトップ（デフォルト）: header=1, valueProposition=2, usageExample=3, content=4, privacyNote以降=5+
- モバイル: header=1, content=2, valueProposition=3, usageExample=4, privacyNote以降=5+

**Step 3: ヘッダーのコンパクト化（モバイルのみ）**

なお、descriptionのテキスト長については、既にcycle-159で短縮済み（65〜124文字を短縮）である。これ以上の短縮はSEO上望ましくないため、現在の長さを維持する。モバイルでのファーストビュー確保はCSS orderによる表示順変更で対処し、description自体の削減は行わない。

モバイルではさらにヘッダー部分のマージンを削減して、ツール本体がファーストビューの上部に来るようにする:

- `.header` の `margin-bottom` をモバイルで `1rem` に削減（現在 `2rem`）
- `.layout` の `padding` 上部をモバイルで `1rem` に削減（現在 `1.5rem`）

**Step 4: valuePropositionとusageExampleの視覚的調整**

モバイルでこれらがツール本体の下に移動するため、上マージンを適切に設定し、「補足情報」として自然に見えるようにする。ツール本体との間に軽い区切り線やスペースを入れることを検討する。

**Step 5: ビジュアルテスト**

以下の条件で表示を確認する:

- モバイル（375x667）: char-count, fullwidth-converter, json-formatter（異なるタイプのツール）
- デスクトップ（1280x800）: 同上のツールでレイアウトが崩れていないこと
- ダークモード: モバイル/デスクトップ両方

### 検討した他の選択肢と判断理由

**選択肢A: valuePropositionとusageExampleを完全に削除する**

- 却下理由: SEO/コンテンツとしての価値があり、制約として「完全削除は避けたい」と明記されている。

**選択肢B: valuePropositionとusageExampleをアコーディオン（折りたたみ）にする**

- 却下理由: 折りたたまれたコンテンツはSEO上の評価が下がる可能性がある。また、折りたたみUIの操作コストが追加される。モバイルでは表示順を変えるだけで十分であり、より単純な解決策を選ぶべき。

**選択肢C: ページ上部に「ツールを使う」アンカーリンクを設置する**

- 却下理由: ユーザーにクリックという追加操作を強いる。操作なしでツール本体がファーストビューに見えている方が圧倒的に良いUX。

**選択肢D: CSS orderでモバイルのみ表示順を変更する（採用）**

- 採用理由: HTMLの論理構造（SEO上の文書構造）を変えずに、モバイルの視覚的な表示順だけを変更できる。デスクトップのUXに影響しない。実装がシンプルで全33ツールに自動的に適用される。valuePropositionとusageExampleを削除せずにモバイルUXを改善できる。

**選択肢E: レスポンシブで2カラムレイアウトにする（デスクトップ: ツール左/説明右）**

- 却下理由: ツール本体の横幅が狭くなり、テキスト入力系ツールのUXが悪化する。実装も大幅に複雑になり、全33ツールの個別調整が必要になるリスクがある。

### 計画にあたって参考にした情報

- 現状のモバイル表示をPlaywrightで実機確認（char-count, fullwidth-converter）: ツール本体がファーストビュー外であることを目視確認済み
- デスクトップ表示もPlaywrightで確認: ツール本体がビューポート下端にかろうじて見えている状態
- モバイルUXのベストプラクティス（2025-2026年）: プライマリCTAや主要コンテンツをabove-the-foldに配置すべき。補助情報は折りたたみやスクロール下に移動するのが推奨。出典: [Invesp - Above The Fold Best Practices 2025](https://www.invespcro.com/blog/above-the-fold/), [Thinkroom - Mobile UX Best Practices 2025](https://www.thinkroom.com/mobile-ux-best-practices/), [Trinergydigital - Mobile-First UX Design 2026](https://www.trinergydigital.com/news/mobile-first-ux-design-best-practices-in-2026)
- CSS `order` プロパティ: Flexboxコンテナ内で子要素の視覚的順序を変更でき、HTMLのDOM順序（スクリーンリーダーやSEOに影響）は維持される。なお、WCAG 1.3.2（意味のある順序）への影響について検討済み: valuePropositionとusageExampleにはフォーカス可能要素（リンク、ボタン、入力フィールド等）が含まれていないため、CSS orderによるvisual orderとDOM orderの乖離がタブ順序の問題を引き起こすことはない。また、読み上げ順序はDOM順のままとなるが、情報としての意味的順序（説明→ツール本体）は崩れないため、WCAG 1.3.2への影響は軽微と判断した
- ToolLayout.tsxとToolLayout.module.cssの現在の実装を確認済み
- 全33ツールがvaluePropositionとusageExampleを持っていることをgrepで確認済み

## レビュー結果

<作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。>

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。例えば、「XXXの機能にバグを見つけたが、本サイクルのスコープ外なので次回以降のサイクルで修正する予定。backlog.mdにも記載済み。」など。>

## 次サイクルへの申し送り

<前サイクルの申し送りを確認し、引き続き有効なものを残す。今回のサイクルで学んだ教訓や次以降のPMに役立つ知見を追記する。以下のルールに従うこと:

- 普遍的に役立つこと、注意すべき落とし穴、Ownerからの指摘事項を書く
- このサイクル固有の話や過度に具体的な実装詳細は書かない（コードやbacklogを見ればわかることは不要）
- 次のサイクルのPMが読んで実際に行動を変えられる内容だけを書く>

## 補足事項

<追加で補足しておくべきことがあれば記載する。とくに無い場合は「なし」と記載する。>

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
