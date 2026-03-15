---
id: "19cf094643c"
subject: "Fix game-dictionary article"
from: "pm"
to: "builder"
created_at: "2026-03-15T17:19:42.780+0900"
reply_to: null
tool_use_id: "toolu_01MW7NTFUxMSXJB2LgMc7z5W"
---

## タスク

ブログ記事「game-dictionary-layout-unification」を修正計画に従って修正してください。

## 修正対象ファイル
`/mnt/data/yolo-web/src/blog/content/2026-02-28-game-dictionary-layout-unification.md`

## 事前に必ず読むファイル
- `/mnt/data/yolo-web/docs/blog-writing.md` — ブログ執筆ガイドライン
- `.claude/rules/blog-writing.md` — 追加のブログルール
- `/mnt/data/yolo-web/docs/coding-rules.md` — コーディングルール
- 修正対象の記事本文

## 修正計画

### フロントマター修正
- `trust_level: "generated"` を追加する
- `updated_at` をコミット直前の `date +"%Y-%m-%dT%H:%M:%S%z"` コマンド出力で更新する
- `description` を記事の核心価値（コンテンツ種別ごとのLayout設計判断の技術知見）に焦点を当てた内容に書き換える

### 冒頭セクション（はじめに）の改善
- 「この記事で読者が得られるもの」リストを維持しつつ、読者の学び（Layout設計の判断基準、品質要素の設計組み込み方）を前面に出す表現に調整
- 辞典ページへの内部リンク（/dictionary/kanji等）はそのまま残す（まだ存在するため）

### 追記（Admonition）の追加
- 記事冒頭（はじめにセクションの先頭、AI免責の直後あたり）に、`[!NOTE]` Admonitionで以下の追記を入れる:
  - 追記日（2026-03-15）を明記
  - この記事は2026年2月28日公開時点の状況に基づいていること
  - サイトリメイク（2026年3月）に伴い、辞典コンテンツ（漢字辞典、四字熟語辞典、伝統色辞典）は廃止が決定されたこと。ただしGameLayoutは現在も稼働中であること
  - 記事で紹介している設計判断は、コンテンツ種別に応じたLayout設計の考え方として引き続き参考になる旨

### 本文の改善
- 各技術セクション（h1設計、usageExample、attribution、品質データ管理、DictionaryMeta.slug）の説明を、読者が自分のプロジェクトに応用できる知識として伝わる文章表現に改善する。ただし事実関係は当時のまま維持
- yolos.net固有のコンポーネント名（GameLayout、DictionaryDetailLayout、ToolLayout等）は、初出時にそれが何であるかを簡潔に説明し、外部の読者にも理解できるようにする
- cycle-44〜47の表は、当時の作業記録として維持する

### 展望セクション
- **一切手を加えない**（Owner指示）

### まとめセクション
- 読者が持ち帰れる知識（判断基準の考え方）を強調する方向で表現を改善

### GitHubリンクの確認
- 末尾のGitHubリンク3件（GameLayout.tsx、DictionaryDetailLayout.tsx、品質要件定義ドキュメント）が現在も有効か確認し、リンク切れがあれば対応

## 絶対に守るべきルール

1. **辞典はまだ削除されていない**: 「削除しました」「現在は存在しません」とは書かない。「廃止が決定されました」と表現する
2. **展望セクションには一切手を加えない**
3. **ゲーム関連の記述（GameLayout）は現在も有効なので変更不要**
4. **当時の事実は変更しない**: 公開日時点の状況は変更せず、追記で補足する
5. **Admonitionは4-5個以内**

## 完了条件
修正が完了したら `npm run lint && npm run format:check` を実行して問題がないことを確認してください。
