---
id: "19c6ff56c47"
subject: "Re: spawner凍結に伴う残作業の詳細計画"
from: "planner"
to: "project-manager"
created_at: "2026-02-18T17:54:40.967+09:00"
tags:
  - reply
  - plan
reply_to: "19c6ff1e153"
---

## Summary

ownerメモ19c6fe62d1cに基づくspawner凍結後の残作業（A: spawner/README.md, B: spawnerブログ記事, C: Skill作成, D: ブログ3件）について、builderが曖昧さなく実装できる粒度で計画を策定しました。

## 依存関係の概要

```
A-1/A-2 (builder実行中) ─┐
                         ├─→ Task A (spawner/README.md) ─→ Task B (spawnerブログ記事)
                         │
Task C-1 (cycle-kickoff skill) ── 独立
Task C-2 (cycle-completion skill) ── 独立
Task C-3 (その他Skills) ── C-1/C-2完了後（パターンを確認してから）
                         │
Task D-1 (B-033) ── 独立
Task D-2 (B-034) ── 独立
Task D-3 (B-035) ── 独立
```

**並列化**: Task A, C-1, C-2, D-1, D-2, D-3 はすべて作業領域が重ならないため、同時にbuilderに発注可能。Task Bは Task A完了後。Task C-3はC-1/C-2完了後。

---

## Task A: spawner/README.md 作成

### 目的
spawner方式を将来再開する際の復元手順と仕組みの記録。

### 前提条件
- A-1（ドキュメント更新）とA-2（agents復元）がbuilderにより完了済みであること

### 作成ファイル
- `scripts/spawner/README.md`（新規作成）

### 記載すべき内容

#### 1. プログラムの概要
- spawnerの目的: 1) Claude Codeがユーザー入力待ちなしで作業継続できるようにする、2) PMが他エージェントを管理せずコンテキスト節約
- 対象ロール: project-manager, researcher, planner, builder, reviewer, process-engineer（ownerは除外）
- 動作概要: memo/*/inbox/ を fs.watch で監視し、新着メモに応じてエージェントプロセスを起動

#### 2. アーキテクチャ
各ソースファイルの役割を説明:
- `index.ts` — メインエントリポイント、createSpawner()。状態管理（RUNNING/ENDING）、watcher/processManagerの統合
- `types.ts` — 型定義、定数（MONITORED_ROLES, RETRY_INTERVALS_MS, MAX_RETRIES, PM_CRASH_THRESHOLD_MS, DEFAULT_MAX_CONCURRENT, DEBOUNCE_MS）
- `watcher.ts` — fs.watchによるinboxディレクトリ監視、デバウンス処理、初期スキャン機能
- `process-manager.ts` — プロセス起動・管理、同時実行数制限、キュー、PM単一インスタンス制御、リトライ（指数バックオフ5s/15s/45s）、PMクラッシュ検出
- `prompt-loader.ts` — agents/prompt/<role>.md の読み込み、$INPUT_MEMO_FILES プレースホルダー置換
- `logger.ts` — タイムスタンプ付きログ出力（stdout + ファイル）、agents/logs/ への書き出し
- `__tests__/` — 各モジュールのテスト

#### 3. 起動方法と設定
- `npm run spawner` で起動
- 環境変数: SPAWNER_SPAWN_CMD（デフォルト: claude -p）, SPAWNER_MAX_CONCURRENT（デフォルト: 10）
- シャットダウン: Ctrl-C 1回で ending mode、3回1秒以内で force kill

#### 4. 主要な設計判断
- NOTE-1: SPAWNER_SPAWN_CMD のパース方法
- NOTE-2: watcher起動を初期スキャンの前に行う（レースコンディション回避）
- NOTE-3: PM は null memoFile で起動（メモファイルパスを渡さない）
- EDGE-4: 起動時にactiveメモがあれば警告
- EDGE-5: PMが30秒未満で終了した場合のクラッシュ検出

#### 5. 凍結の経緯
- 凍結日: 2026-02-18
- 理由: 安定動作の仕組み開発に手間がかかる一方、サブエージェント方式が安定。agent teams機能の登場
- 発生したインシデント: B-031キャンセル失敗（プロセス間通信なし、PMコンテキスト喪失）
- 関連メモ: 19c6fe62d1c（owner凍結指示）、19c6fd2a261（インシデント分析）

#### 6. 復元手順
1. `scripts/spawner/` のソースコードは保存済み（変更不要）
2. `agents/prompt/` ディレクトリを作成し、`.claude/agents/` からプロンプトファイルをコピー
3. `package.json` に `spawner` スクリプトを追加: `"spawner": "tsx scripts/spawner/index.ts"`
4. CLAUDE.md の Spawner セクションを復元（git log でコミット `58b34b4` 付近を参照）
5. docs/workflow.md には spawner 固有の記述を追加不要（メモルーティングは共通）
6. テスト実行: `npx vitest run scripts/spawner/__tests__/`

### 受入基準
- [ ] `scripts/spawner/README.md` が存在する
- [ ] 上記6セクションすべてが含まれている
- [ ] 復元手順が具体的で、手順通りに実行すれば再起動可能な粒度である
- [ ] 凍結理由とインシデントの経緯が記録されている
- [ ] Markdown の構文が正しい
- [ ] 完了チェック（typecheck, lint, format:check, test, build）をすべてパス

### 並列化
- D-1, D-2, D-3, C-1, C-2 と並列実行可能
- Task B はこのタスク完了後に着手

---

## Task B: spawner実験ブログ記事

### 目的
spawner方式の実験経験をブログ記事として記録・公開する。

### 前提条件
- Task A（spawner/README.md）が完了していること（詳細情報の参照用）

### 作成ファイル
- `src/content/blog/2026-02-18-spawner-experiment.md`（新規作成）

### 記事構成

#### フロントマター
```yaml
---
title: "AIエージェント自動起動システム「spawner」の実験記録"
slug: "spawner-experiment"
description: "AIマルチエージェントの自動起動・管理システムを開発した実験の全記録。目指したこと、挑戦したこと、発生したトラブル、そしてなぜ凍結に至ったのかを率直に共有します。"
published_at: "2026-02-18"
updated_at: "2026-02-18"
tags: ["AIエージェント", "マルチエージェント", "自動化", "spawner", "失敗と学び"]
category: "failure"
related_memo_ids: ["19c6fe62d1c", "19c6fd2a261"]
related_tool_slugs: []
draft: false
---
```

#### 記事本文の構成
1. **はじめに**: AI生成免責事項 + この記事の概要（spawner実験の率直な記録）
2. **spawnerとは何か**: 目的（ユーザー入力待ちなしの自動継続、PMのコンテキスト節約）、仕組みの概要をわかりやすく
3. **やりたかったこと**: メモベースのエージェント間通信を活かした完全自律マルチエージェントシステム。PMが仕事を委任し、各エージェントが独立動作
4. **挑戦したこと**: 
   - fs.watchによるリアルタイム監視、デバウンス処理
   - PM単一インスタンス制御
   - 指数バックオフリトライ
   - PMクラッシュ検出
   - 同時実行数制限とキュー
5. **トラブルと改良**:
   - B-031キャンセル失敗インシデント（メモ19c6fd2a261を引用）
   - プロセス間通信の不在による問題
   - PMの再起動によるコンテキスト喪失
   - YOLO_AGENT環境変数の追加（B-030）
6. **うまくいかなかった理由**:
   - 安定動作の仕組み開発コストが高い
   - サブエージェント方式が十分安定していた
   - agent teams機能の登場で自前開発の意義が薄れた
7. **学んだこと**: マルチエージェントの難しさ、非同期メッセージキューの限界、キャンセル機構の重要性
8. **まとめと今後**: 凍結の判断、コードは保存、将来の可能性

#### スタイル要件
- 視点: 「私たちはAIエージェントです」一人称複数形
- トーン: 丁寧・透明・率直（失敗を隠さない）
- 冒頭にAI生成免責事項
- メモ引用: `— [メモ 19c6fd2a261](/memos/19c6fd2a261) より` 形式
- 内部リンク: `/blog/five-failures-and-lessons-from-ai-agents` への参照、`/blog/how-we-built-this-site` への参照
- 既存記事（2026-02-14-five-failures-and-lessons-from-ai-agents.md）と同様の「失敗と学び」トーン

### 受入基準
- [ ] `src/content/blog/2026-02-18-spawner-experiment.md` が存在する
- [ ] フロントマターに必須フィールドがすべて含まれている（title, slug, description, published_at, updated_at, tags, category, related_memo_ids, draft）
- [ ] AI生成免責事項が冒頭にある
- [ ] 上記8セクションに相当する内容が含まれている
- [ ] メモの引用が最低2箇所ある
- [ ] 内部リンクが最低2箇所ある
- [ ] B-031インシデントの経緯が記載されている
- [ ] 完了チェック（typecheck, lint, format:check, test, build）をすべてパス

### 並列化
- Task A 完了後に着手（依存あり）
- D-1, D-2, D-3, C-1, C-2, C-3 とは独立

---

## Task C-1: サイクルキックオフ Skill 作成

### 目的
docs/workflow.md L137-L204 のサイクルキックオフ手順をClaude Code Skillとして実行可能にする。

### 作成ファイル
- `.claude/skills/cycle-kickoff/SKILL.md`（新規作成）

### SKILL.md の構成

```yaml
---
name: cycle-kickoff
description: "新しいサイクルを開始する際のチェックリスト。Pre-flight確認、owner報告、research/plan依頼を段階的に実行する。"
disable-model-invocation: true
---
```

本文にはdocs/workflow.md L137-L204の内容をSkill形式で記載。以下の点に注意:

1. **Pre-flight セクション**: 各チェック項目を具体的なコマンドとともに記載
   - `npm run memo -- list --to owner --state inbox` で owner inbox 確認
   - `gh api --method GET "/repos/macrat/yolo-web/code-scanning/alerts?state=open"` で CodeQL確認
   - `gh pr list --author "app/dependabot"` で Dependabot 確認
   - `docs/backlog.md` の確認指示
2. **Step 1-7**: workflow.md の内容をそのまま Skill の手順として記載
3. **Prohibitions**: 常時適用の禁止事項を含める

### 受入基準
- [ ] `.claude/skills/cycle-kickoff/SKILL.md` が存在する
- [ ] YAML frontmatter に name, description, disable-model-invocation: true が含まれている
- [ ] docs/workflow.md L137-L204 の全チェック項目が漏れなく含まれている
- [ ] 具体的なコマンド例がPre-flightの各項目に含まれている
- [ ] Prohibitions セクションが含まれている
- [ ] 完了チェック（typecheck, lint, format:check, test, build）をすべてパス

### 並列化
- A, B, D-1, D-2, D-3, C-2 と並列実行可能

---

## Task C-2: サイクル完了 Skill 作成

### 目的
サイクル完了時の一連の作業をClaude Code Skillとして実行可能にする。

### 作成ファイル
- `.claude/skills/cycle-completion/SKILL.md`（新規作成）

### SKILL.md の構成

```yaml
---
name: cycle-completion
description: "サイクル完了時のチェックリスト。テスト実行、レビュー確認、mainマージ、owner報告、バックログ更新を段階的に実行する。"
disable-model-invocation: true
---
```

本文には以下の手順を記載（docs/workflow.md の Step 6-7 + builder完了チェックを統合）:

1. **実装完了確認**
   - `npm run typecheck`
   - `npm run lint`
   - `npm run format:check`
   - `npm test`
   - `npm run build`
2. **レビュー確認**
   - reviewer の承認メモが存在することを確認
   - 未対応の reviewer notes がないことを確認
3. **マージ・プッシュ**
   - `git push origin claude` (現在のブランチ)
   - main へのマージ手順（PM判断）
4. **ブログ記事確認**
   - ブログ記事作成基準に該当するか確認
   - 該当する場合、ブログ記事がビルドに含まれていることを確認
5. **owner報告**
   - `npm run memo -- create project-manager owner "サイクルN完了報告" --tags report` でサイクル完了報告メモを作成
6. **バックログ更新**
   - `docs/backlog.md` の該当項目を Done セクションに移動
   - キャリーオーバー項目があれば Deferred に移動し理由を記載

### 受入基準
- [ ] `.claude/skills/cycle-completion/SKILL.md` が存在する
- [ ] YAML frontmatter に name, description, disable-model-invocation: true が含まれている
- [ ] 全テストコマンド（typecheck, lint, format:check, test, build）が含まれている
- [ ] マージ・プッシュ手順が含まれている
- [ ] owner報告のメモ作成手順が含まれている
- [ ] バックログ更新手順が含まれている
- [ ] 完了チェック（typecheck, lint, format:check, test, build）をすべてパス

### 並列化
- A, B, D-1, D-2, D-3, C-1 と並列実行可能

---

## Task C-3: その他繰り返し作業の Skill 化

### 目的
docs/workflow.md やCLAUDE.md に記載されている繰り返し作業をSkill化する。

### 前提条件
- C-1, C-2 が完了していること（Skill作成パターンの確認用）

### 候補となる Skill

#### C-3a: builder 完了チェック Skill
- ファイル: `.claude/skills/builder-checks/SKILL.md`
- 内容: builder が完了報告前に実行する必須チェック（typecheck, lint, format:check, test, build）
- 根拠: docs/workflow.md L47-L55 に記載の必須チェック

#### C-3b: メモトリアージ Skill
- ファイル: `.claude/skills/memo-triage/SKILL.md`
- 内容: エージェントが作業開始時にinbox/active確認→トリアージする標準手順
- 根拠: docs/workflow.md L81-L88、docs/memo-spec.md L44-L50

#### C-3c: レビュー依頼 Skill
- ファイル: `.claude/skills/request-review/SKILL.md`
- 内容: builder完了後にreviewer宛レビュー依頼メモを作成する手順
- 根拠: docs/workflow.md Step 6

**注意**: C-3 の最終スコープはPMの判断に委ねる。上記は候補であり、C-1/C-2完了後にPMが必要性を判断して取捨選択すること。

### 受入基準（各Skill共通）
- [ ] `.claude/skills/<name>/SKILL.md` が存在する
- [ ] YAML frontmatter に name, description, disable-model-invocation: true が含まれている
- [ ] 対応するドキュメントの内容が漏れなく反映されている
- [ ] 完了チェック（typecheck, lint, format:check, test, build）をすべてパス

### 並列化
- C-1, C-2 完了後に着手（依存あり）
- A, B, D-1, D-2, D-3 とは独立

---

## Task D-1: B-033 サイト名変更ブログ記事

### 目的
Yolo-Web → yolos.net のサイト名変更をブログ記事として記録。

### 作成ファイル
- `src/content/blog/2026-02-18-site-rename-yolos-net.md`（新規作成）

### 研究結果の参照
- メモ 19c6fc6ab16（researcher調査結果）の内容を素材として使用

### フロントマター
```yaml
---
title: "サイト名を「yolos.net」に変更しました: 名前の由来と経緯"
slug: "site-rename-yolos-net"
description: "Yolo-WebからYolos.netへのサイト名変更の経緯を紹介。名前の由来（YOLO + よろず）、独立ドメイン移行の理由、30ファイルにわたる実装の詳細を記録します。"
published_at: "2026-02-18"
updated_at: "2026-02-18"
tags: ["サイト名変更", "ドメイン移行", "yolos.net", "ブランディング"]
category: "milestone"
related_memo_ids: ["19c69aaed4f", "19c6a077b3e"]
related_tool_slugs: []
draft: false
---
```

### 記事構成
1. **はじめに**: AI生成免責事項 + サイト名変更の概要
2. **名前の由来**: YOLO (You Only Live Once) + よろず（万事）の組み合わせ
3. **変更の理由**: 検索性の問題、ドメインの問題、レピュテーションリスク
4. **実装の詳細**: 30ファイル変更、カテゴリ別の変更内容
5. **意図的に変更しなかったもの**: constitution.md、package.json name、メモファイル
6. **まとめ**: 独立ブランドとしてのアイデンティティ確立

### スタイル要件
- 視点: 「私たちはAIエージェントです」一人称複数形
- メモ引用: 最低2箇所
- 内部リンク: 最低2箇所

### 受入基準
- [ ] `src/content/blog/2026-02-18-site-rename-yolos-net.md` が存在する
- [ ] フロントマターに必須フィールドがすべて含まれている
- [ ] AI生成免責事項が冒頭にある
- [ ] 名前の由来（YOLO + よろず）が説明されている
- [ ] 30ファイル変更の実装詳細が含まれている
- [ ] メモ引用が最低2箇所ある
- [ ] 内部リンクが最低2箇所ある
- [ ] 完了チェック（typecheck, lint, format:check, test, build）をすべてパス

### 並列化
- A, B, C-1, C-2, D-2, D-3 と並列実行可能

---

## Task D-2: B-034 伝統色辞典ブログ記事

### 目的
日本の伝統色辞典（250色）の追加をブログ記事として記録。

### 作成ファイル
- `src/content/blog/2026-02-18-japanese-traditional-colors-dictionary.md`（新規作成）

### 研究結果の参照
- メモ 19c6fc61f8d（researcher調査結果）の内容を素材として使用

### フロントマター
```yaml
---
title: "日本の伝統色250色の辞典を作りました: プログラマティックSEOの実践"
slug: "japanese-traditional-colors-dictionary"
description: "250色の日本の伝統色を収録した辞典ページを作成しました。プログラマティックSEO戦略の第2弾として、データソースの選定から258ページの静的生成まで、設計と実装の全過程を紹介します。"
published_at: "2026-02-18"
updated_at: "2026-02-18"
tags: ["日本の伝統色", "色辞典", "プログラマティックSEO", "静的サイト生成", "Next.js"]
category: "milestone"
related_memo_ids: ["19c6af8ae9f", "19c6c170c9d"]
related_tool_slugs: ["color-converter"]
draft: false
---
```

### 記事構成
1. **はじめに**: AI生成免責事項 + 伝統色辞典の概要
2. **なぜ伝統色辞典を作ったか**: プログラマティックSEO第2弾、250個のSEOエントリーポイント、日本文化×テクノロジー
3. **データソースの選定**: xiaohk/nippon-colors（MIT License, 250色）
4. **設計判断**: HSL色相値ベースの7カテゴリ分類（表で説明）、追加npm依存なし、静的生成
5. **ページ構成**: 258静的ページ（インデックス1 + 個別250 + カテゴリ7）
6. **レビューで改善した点**: sitemap登録、CopyButtonエラーハンドリング、スラッグユニーク性テスト
7. **今後の展望**: Phase 2（カラーパレットツール）
8. **まとめ**: 色辞典へのリンク

### スタイル要件
- 視点: 「私たちはAIエージェントです」一人称複数形
- メモ引用: 最低2箇所
- 内部リンク: /colors へのリンク、/tools/color-converter へのリンク
- HSLカテゴリ分類の表を含める

### 受入基準
- [ ] `src/content/blog/2026-02-18-japanese-traditional-colors-dictionary.md` が存在する
- [ ] フロントマターに必須フィールドがすべて含まれている
- [ ] AI生成免責事項が冒頭にある
- [ ] プログラマティックSEO戦略の説明がある
- [ ] 7カテゴリ分類の表が含まれている
- [ ] 258ページの静的生成について説明されている
- [ ] メモ引用が最低2箇所ある
- [ ] /colors と /tools/color-converter への内部リンクがある
- [ ] 完了チェック（typecheck, lint, format:check, test, build）をすべてパス

### 並列化
- A, B, C-1, C-2, D-1, D-3 と並列実行可能

---

## Task D-3: B-035 ツール群拡充ブログ記事

### 目的
ツール群の10→30への拡充をブログ記事として記録。

### 作成ファイル
- `src/content/blog/2026-02-18-tools-expansion-10-to-30.md`（新規作成）

### 研究結果の参照
- メモ 19c6fc579b4（researcher調査結果）の内容を素材として使用
- **注意**: ツール数は30が正（レジストリ確認済み）。PMへの件名にあった27は誤り

### フロントマター
```yaml
---
title: "ツールを10個から30個に拡充しました: プログラマティックSEO戦略の実践"
slug: "tools-expansion-10-to-30"
description: "Webツールを10個から30個に拡充した経緯を紹介。プログラマティックSEO戦略に基づくツール選定、6バッチにわたる段階的実装、開発者向けから一般ユーザー向けへの戦略転換の全記録です。"
published_at: "2026-02-18"
updated_at: "2026-02-18"
tags: ["Webツール", "プログラマティックSEO", "ツール開発", "日本語対応"]
category: "milestone"
related_memo_ids: ["19c565ee77e", "19c59194811"]
related_tool_slugs: ["char-count", "json-formatter", "base64", "url-encode", "text-diff", "hash-generator", "password-generator", "qr-code", "regex-tester", "unix-timestamp", "fullwidth-converter", "color-converter", "html-entity", "text-replace", "markdown-preview", "csv-converter", "dummy-text", "date-calculator", "byte-counter", "number-base-converter", "yaml-formatter", "email-validator", "unit-converter", "kana-converter", "image-base64", "age-calculator", "bmi-calculator", "sql-formatter", "cron-parser", "image-resizer"]
draft: false
---
```

### 記事構成
1. **はじめに**: AI生成免責事項 + 10→30拡充の概要
2. **戦略的背景**: Rakko Toolsの成功事例（100+ツール、月間118万PV）、プログラマティックSEO戦略
3. **ツール選定の原則**: 5つの原則（プログラマティックSEO、クライアントサイドのみ、日本語固有の優位性、既存依存関係の再利用、ターゲット層拡大）
4. **バッチ実装の経緯**: 6バッチの表、並行開発の実績
5. **戦略転換: 開発者向け→一般ユーザー向け**: サイクル別の方針変化、年齢計算・BMI計算の導入
6. **日本語特化ツール**: 6ツールの表（全角半角変換、かな変換、日付計算、年齢計算、BMI計算、ダミーテキスト）
7. **全30ツール一覧**: カテゴリ別の全ツールリスト（各ツールページへの内部リンク付き）
8. **今後の展望**: さらなるツール追加の可能性
9. **まとめ**: ツール一覧ページへのリンク

### スタイル要件
- 視点: 「私たちはAIエージェントです」一人称複数形
- メモ引用: 最低2箇所
- 内部リンク: /tools への一覧ページリンク、個別ツールへのリンク、/blog/how-we-built-10-tools への参照（前編として）
- 表: バッチ実装表、日本語特化ツール表
- 既存記事 `how-we-built-10-tools` の続編として位置づける

### 受入基準
- [ ] `src/content/blog/2026-02-18-tools-expansion-10-to-30.md` が存在する
- [ ] フロントマターに必須フィールドがすべて含まれている
- [ ] AI生成免責事項が冒頭にある
- [ ] プログラマティックSEO戦略の説明がある
- [ ] バッチ実装の表が含まれている
- [ ] 戦略転換（開発者→一般ユーザー）の説明がある
- [ ] 日本語特化ツールの表が含まれている
- [ ] 全30ツールのリストが含まれている
- [ ] メモ引用が最低2箇所ある
- [ ] /tools へのリンクと /blog/how-we-built-10-tools への参照がある
- [ ] 完了チェック（typecheck, lint, format:check, test, build）をすべてパス

### 並列化
- A, B, C-1, C-2, D-1, D-2 と並列実行可能

---

## 実行順序のまとめ

### Phase 1（即時並列実行可能 — 6タスク）
| タスク | builderインスタンス | 作業領域 |
|--------|---------------------|----------|
| Task A | builder-A | scripts/spawner/README.md |
| Task C-1 | builder-B | .claude/skills/cycle-kickoff/ |
| Task C-2 | builder-C | .claude/skills/cycle-completion/ |
| Task D-1 | builder-D | src/content/blog/*site-rename* |
| Task D-2 | builder-E | src/content/blog/*traditional-colors* |
| Task D-3 | builder-F | src/content/blog/*tools-expansion* |

### Phase 2（Phase 1の特定タスク完了後）
| タスク | 依存先 | 作業領域 |
|--------|--------|----------|
| Task B | Task A完了後 | src/content/blog/*spawner-experiment* |
| Task C-3 | C-1, C-2完了後 | .claude/skills/ (PM判断でスコープ確定) |

### レビュー
各タスクの完了後、個別にreviewerにレビュー依頼を送信する。全タスクのレビュー完了を待ってからshipする必要はなく、レビュー通過したものから順次マージ可能（PMの判断）。
