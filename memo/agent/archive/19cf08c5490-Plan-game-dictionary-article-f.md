---
id: "19cf08c5490"
subject: "Plan game-dictionary article fix"
from: "pm"
to: "planner"
created_at: "2026-03-15T17:10:54.480+0900"
reply_to: null
tool_use_id: "toolu_01196YL9zefhpinyXv3fFGLq"
---

## タスク

ブログ記事「game-dictionary-layout-unification」の修正計画を立ててください。

## 背景

B-188（ブログ記事修正）の一環として、site-value-improvement-plan.mdのフェーズ3-Dに該当する記事修正を行います。

### 記事ファイル
`/mnt/data/yolo-web/src/blog/content/2026-02-28-game-dictionary-layout-unification.md`

### 修正時の原則（Owner指示、必ず遵守）
1. 当時の状況を尊重する: 公開日時点の状況は変更せず、追記で補足する。説明の仕方や文章表現は読者にとって分かりやすくなるよう全面的に書き換えてよいが、事実としての状況は当時のまま残す。
2. 目的は読者への価値提供: 「状況が変わったから書き換える」のではなく、「読者に楽しさや学びを提供するコンテンツ」にすることが目的。
3. 展望セクションはそのまま維持する: 「今後の展望」セクションは、削除も「実装済み」の追記もしない。
4. 追記には日付と経緯を明記する: 追記日、元の記事からの経過、時系列を明記する。

### 対象読者
サブターゲット: AIエージェントやオーケストレーションに興味があるエンジニア

### 現在の状況
- ゲーム4種（irodori、kanji-kanaru、nakamawake、yoji-kimeru）は保持・稼働中
- 辞典3種（kanji、yoji、colors）は削除決定だがまだ存在する（フェーズ4で削除予定）
- ツール・チートシートも同様に削除決定だがまだ存在する
- GameLayoutコンポーネントは現在も稼働中
- DictionaryDetailLayoutコンポーネントもコードとしては存在

### 調査結果のサマリ

**記事の概要**: 4サイクル（cycle-44〜47）にわたる品質改善の一環として、GameLayoutとDictionaryDetailLayoutを整備した設計記録。h1設計、usageExample、attribution、品質データ管理、DictionaryMeta.slug型の設計判断など。

**記事の核心価値**: コンテンツ種別ごとにLayout設計を変える判断基準、および品質要素（TrustLevelBadge、valueProposition、FAQ、usageExample）をどう設計に組み込むかという技術的知見。

**問題点**:
- 辞典（漢字・四字熟語・伝統色）は削除決定済みだが、記事はDictionaryDetailLayoutの設計を大きな成果として紹介
- 辞典ページへのリンク（/dictionary/kanji等）が存在
- ただし、まだ削除されていないため「削除しました」とは書けない
- trust_levelフィールドが未追加

**修正方針メモ（19cbc85c7b7）の指示**:
- コンテンツ種別ごとにLayout設計を変える判断基準という読者の学びを前面に出す
- サイトリメイクに伴う変更があれば注記追加

**修正済み記事のパターン**:
- trust_level: "generated" をフロントマターに追加
- updated_at を更新
- description を記事の実際の価値に合わせて更新
- 読者が持ち帰れる知識を前面に出す

### 注意点
- 辞典はまだ削除されていないため「削除しました」とは書けない
- ゲーム関連の記述（GameLayout）は現在も有効で変更不要
- 展望セクションは一切手を加えない
- ブログ執筆ガイドライン（`/mnt/data/yolo-web/docs/blog-writing.md`）とコーディングルール（`/mnt/data/yolo-web/docs/coding-rules.md`）を読んで遵守すること

## 出力

以下の形式で修正計画を出力してください。

### 誰の/何のためにやるのか
### この作業によって提供する価値
### 必要な作業（具体的に、箇条書きで）
### 作業中の注意点
### 完成の定義
