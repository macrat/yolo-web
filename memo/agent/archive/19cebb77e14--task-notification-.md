---
id: "19cebb77e14"
subject: "<task-notification>"
from: "owner"
to: "pm"
created_at: "2026-03-14T18:39:57.076+0900"
reply_to: null
---

<task-notification>
<task-id>ae4d5bf65a4fc5cdb</task-id>
<tool-use-id>toolu_0144mroCA5dBo8yusSmeDt4v</tool-use-id>
<output-file>/tmp/claude-1000/-mnt-data-yolo-web/58c33b98-80b7-45f9-a7f4-fb987037a903/tasks/ae4d5bf65a4fc5cdb.output</output-file>
<status>completed</status>
<summary>Agent "hash-generator計画立案" completed</summary>
<result>情報は十分に集まりました。計画を立案します。

---

## hash-generator-guide ブログ記事の処置計画

### 1. 判断根拠

**結論: 削除が適当**

以下の理由から、この記事は修正ではなく削除が適切と判断する。

- **独自性がない**: ハッシュ関数の解説記事は、Qiita、Zenn、e-words、テックジム等の競合に多数の同等品質以上の記事が存在する。evaluation-rubricの独自性スコアが2であり、存続基準を満たさない。
- **誘導先ツールが削除決定済み**: 記事の核となる自サイトツール（hash-generator, password-generator）は既に削除が決定している。記事内には `[ハッシュ生成ツール](/tools/hash-generator)` や `[パスワード生成ツール](/tools/password-generator)` へのリンクが複数箇所に存在し、ツール利用方法の解説セクション（「ツールでのハッシュ生成方法」「MD5に対応していない理由」「16進数表記とBase64表記の違い」）が記事のかなりの分量を占めている。これらを外部ツールに差し替えてもなお、記事として独立した価値を持つのは困難。
- **サイトのターゲットユーザーと不一致**: site-concept.mdで定義されたメインターゲット（占い・診断を楽しみたい人）にもサブターゲット（AI技術・エージェント運用に関心のあるエンジニア）にも合致しない。汎用的な暗号ハッシュの技術解説は、このサイトが提供すべきコンテンツではない。
- **site-concept.mdの削除ブログ3件（unit-converter-guide, rss-feed, html-sql-cheatsheets）と同質の問題**: これらの記事が削除対象とされた理由（競合に対する付加価値なし、削除コンテンツとの依存関係）がhash-generator-guideにもそのまま該当する。

### 2. 削除の具体的な手順

#### ステップ1: 記事ファイルの削除

- `src/blog/content/2026-02-17-hash-generator-guide.md` を `git rm` で削除する
- cycle-84で確立された運用（draft化ではなくファイル削除）に従う

#### ステップ2: 他記事からの参照確認と対応

- `password-security-guide` の本文にhash-generator-guideへのリンクがある可能性を確認し、リンクがあれば除去または外部リソースに差し替える
- `web-developer-tools-guide` や `tools-expansion-10-to-30` 等でhash-generatorツールに言及している箇所があるが、これらの記事自体も修正対象リストに含まれているため、hash-generator-guide削除の影響はそれらの記事修正時に個別に対応すれば足りる（本タスクでは対応不要）

#### ステップ3: 410 Gone対応の要否

- 410 Gone対応はフェーズ4（4-1）で一括実施する予定であり、現時点では個別の410対応は不要。フェーズ4の実施時にこの記事のURLも含める。
- ただし、記事が公開されていた期間が短く（2026-02-17公開）、Googleにインデックスされているかどうかをフェーズ4実施前にSearch Consoleで確認することが望ましい。インデックスされていなければ410対応自体が不要。

#### ステップ4: site-value-improvement-plan.md の更新

- セクション4の3-8ブログ記事修正リストで、hash-generator-guideの行を取り消し線に変更し、削除理由を記載する
  - 例: `~~hash-generator-guide（ハッシュ生成ガイド）~~ -- 独自性スコア2、誘導先ツール削除決定済み、ターゲット不一致のため削除`
- 残件数のカウントを更新する（残16件 → 残15件）
- セクション5のステータスとセクション6の申し送りも整合させる

#### ステップ5: site-concept.md の更新

- セクション5「削除するコンテンツ > ブログ（3件）」を「ブログ（4件）」に更新し、hash-generator-guideを追加する
  - 追加理由の記載: 「独自性がなく、誘導先ツールも削除決定済みのため、リライトしても差別化が困難」

### 3. backlog.md への反映

- 現在backlog.mdにhash-generator-guideの項目は存在しない。削除タスクとしての追記は不要（site-value-improvement-plan.mdの修正リストから取り消し線で除外することで管理する。これは既存の運用（kanji-kanaru-2136-expansion、nextjs-static-page-split-for-tools）と同じ方式）。

### 4. trust_level追加等の修正との整合性

- cycle-87時点でhash-generator-guideにはtrust_level: "generated"の追加やupdated_atの更新が既に適用されている。しかし、記事を削除する場合これらの修正は無意味となる。ファイル自体を削除するため、これらの修正が無駄になること自体は問題ない（ファイル削除により自動的に解消される）。

### 5. 作業の実施単位

- この削除作業は、次のブログ記事修正サイクル（B-188の一部）として実施する
- 1サイクル3記事上限のルールがあるため、削除1件 + 修正2件、あるいは他の削除対象記事（unit-converter-guide, rss-feed, html-sql-cheatsheets）と合わせて削除をまとめて実施するかはPMの判断に委ねる

---

PMへの報告: 以上がhash-generator-guideブログ記事の処置計画です。調査結果に基づき「削除」が適当と判断し、具体的な削除手順、関連ドキュメントの更新箇所、既存修正との整合性を整理しました。reviewerにレビューを依頼してください。</result>
<usage><total_tokens>49152</total_tokens><tool_uses>10</tool_uses><duration_ms>89689</duration_ms></usage>
</task-notification>
Full transcript available at: /tmp/claude-1000/-mnt-data-yolo-web/58c33b98-80b7-45f9-a7f4-fb987037a903/tasks/ae4d5bf65a4fc5cdb.output
