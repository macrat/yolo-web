---
id: "19cebbd87dc"
subject: "<task-notification>"
from: "owner"
to: "pm"
created_at: "2026-03-14T18:46:32.796+0900"
reply_to: null
---

<task-notification>
<task-id>af153bcc51166336b</task-id>
<tool-use-id>toolu_01GNENTy4ct5YxZbGbgkTM9x</tool-use-id>
<output-file>/tmp/claude-1000/-mnt-data-yolo-web/58c33b98-80b7-45f9-a7f4-fb987037a903/tasks/af153bcc51166336b.output</output-file>
<status>completed</status>
<summary>Agent "cron計画修正" completed</summary>
<result>十分な情報が揃いました。レビュー指摘6件を反映した修正版計画を作成します。

---

## cron-parser-guide ブログ記事 書き直し計画（レビュー指摘反映版）

### 1. 想定読者とその課題

**想定読者**: 定期タスクの自動化が必要で、cron式を複数環境で使い分ける機会があるエンジニア。

**流入想定**: 「cron 書き方」「crontab 曜日指定」「GitHub Actions cron」等のSEO検索流入を主に想定。サイトのターゲットユーザー（占い・診断を楽しみたい人 / AIエージェントに興味があるエンジニア）との直接的な紐づけはなく、技術系記事としてSEO流入経由でサイトの認知拡大に寄与する位置づけとする。

**読者の課題**:
- cron式を書く機会があるが、環境ごとの構文差異（フィールド数、特殊文字、タイムゾーン指定）を毎回調べ直している
- Linux crontab以外の環境（GitHub Actions、AWS EventBridge、Google Cloud Scheduler、Kubernetes CronJob）でcron式を使うとき、どこが違うのか体系的にまとまった日本語資料がない
- cron式で「第2火曜日」「月末」「秒単位」など実現できないパターンに遭遇したとき、できないことなのか書き方が分からないだけなのか判断がつかない
- Amazon Linux 2023でcronがデフォルト非搭載（systemd timerが推奨代替）になったが、systemd timerとどう使い分けるべきか分からない

### 2. 書き直し後の記事構成

**タイトル案**: 「cron式の書き方ガイド: 環境別の違いと限界を徹底解説」

**方針**: 現行記事の「基礎解説+パターン集」という競合と同質の構成を脱却し、「環境横断の互換性比較」と「cron式の限界と回避策」を2本柱にする。基礎部分はコンパクトにまとめ、競合にない独自の視点で付加価値を加える。

**分量目安**: 全体で4,000〜6,000字。基礎セクション（セクション2・3）は合計1,000字以内に抑え、独自価値のあるセクション（セクション4・5）に紙面を割く。systemd timer比較（セクション6）は最も簡潔にし、500字以内を目安とする。

#### セクション構成

1. **はじめに**（AI透明性の注記 + この記事で分かること）
2. **cronの基礎**（5フィールドの説明 + 特殊文字 --- 現行記事から圧縮して引き継ぐ）
3. **よく使うパターン集**（現行記事から引き継ぐが、表形式に圧縮）
4. **環境別cron式の互換性マトリクス**（新規・記事の核心部分）
5. **cron式の限界と回避策**（新規・独自の切り口）
6. **systemd timerとの比較**（新規・最も簡潔に）
7. **よくある間違いとトラブルシューティング**（現行記事から強化）
8. **まとめ**

### 3. 各セクションの具体的な内容

#### セクション1: はじめに
- AI透明性の注記（既定文）
- 「この記事で分かること」のリスト:
  - cron式の基本的な書き方
  - 環境ごと（Linux / GitHub Actions / AWS / GCP / Kubernetes）の互換性の違い
  - cron式でできないことと回避策
  - systemd timerとの使い分け
  - よくあるトラブルと対策
- 「公開日時点の情報です。各サービスの仕様は変更される可能性があるため、公式ドキュメントも併せて確認してください」の注記

#### セクション2: cronの基礎（短くする）
- 現行記事のセクション「cronとは」「cron式の書き方」を圧縮統合
- 5フィールドの表と特殊文字の説明は簡潔に維持
- Vixie cronの歴史的経緯は1-2文に圧縮
- crontab(5)マニュアルへのリンクは維持
- 冒頭リストとの整合を取り、基礎を深掘りしすぎない

#### セクション3: よく使うパターン集（短くする）
- 現行記事の「よく使うパターン集」から主要パターンを表形式に圧縮（1つの表にまとめる）
- 各パターンの説明は表内の1列で完結させる
- サイト内ツールへの誘導は全て削除

#### セクション4: 環境別cron式の互換性マトリクス（新規 --- 記事の核心）
- 以下の5環境を横断比較する表を作成:
  - Linux crontab（Vixie cron）
  - GitHub Actions（scheduleトリガー）
  - AWS EventBridge（Scheduler / Rules の違いを注記）
  - Google Cloud Scheduler
  - Kubernetes CronJob
- systemd timerのOnCalendar構文はcron式とは別体系のため、この表には含めずセクション6で別途扱う
- 比較軸:
  - フィールド数（5 / 6 / 独自形式）
  - 秒フィールドの有無
  - 年フィールドの有無
  - `?`（指定なし）の対応
  - `L`（Last）`W`（Weekday）`#`（n番目）の対応
  - タイムゾーン指定方法
  - 日と曜日の同時指定時の動作（OR / AND / エラー）
- 各環境の公式ドキュメントへのリンクを付記
- 「同じcron式でも環境によって動作が異なるケース」の具体例を2-3個示す

#### セクション5: cron式の限界と回避策（新規）
- 「第N曜日」問題: 標準cron式では「第2火曜日」を直接指定できない。AWS EventBridgeの`#`構文、日付範囲+曜日のワークアラウンド、スクリプト内での日付判定の3つの回避策を紹介
- 月末問題: 「毎月最後の日」を標準cron式で指定できない。AWS EventBridgeの`L`構文、28-31日指定の限界、スクリプトでの判定を紹介
- 秒単位実行の不可: 標準cron式の最小単位は1分。秒単位が必要な場合の代替手段（sleep併用、systemd timerのOnCalendar、AWS EventBridgeのrate式）
- 「隔週」「3週ごと」の不可: cron式はカレンダーベースであり週の累積カウントができない。代替手段の紹介

#### セクション6: systemd timerとの比較（新規・最も簡潔に、500字以内）
- Amazon Linux 2023でcronがデフォルト非搭載であること（「非推奨」ではなく「デフォルト非搭載、systemd timerが推奨代替」と正確に記述。AWS公式ドキュメントに基づく事実のみ）
- cronとsystemd timerの比較表（簡潔な表1つに集約）:
  - 構文の違い（cron式 vs OnCalendar）
  - ログ管理（syslog vs journalctl）
  - ミスファイア処理（cronはスキップ / systemd timerはPersistent=trueで遅延実行可能）
  - 精度（分単位 vs 秒単位）
- 判断基準を1-2文で簡潔に: 既存crontab資産がなく新規構築するならsystemd timerが第一候補、既存環境の互換性を優先するならcron

#### セクション7: よくある間違いとトラブルシューティング
- 現行記事の内容をベースに強化
- 曜日の数値の混乱（維持）
- 日と曜日の同時指定（環境別の挙動の違いをセクション4と連携して強化）
- タイムゾーンの罠（維持 + GitHub ActionsのUTCベース + 実行遅延の可能性に言及）
- crontabの管理tips（維持）

#### セクション8: まとめ
- 環境ごとの構文差異があることを再確認
- 本番設定前に公式ドキュメントで仕様を確認する重要性
- 各環境の公式ドキュメントへのリンク一覧

### 4. 現行のツールリンクの処理方法

現行記事には `/tools/cron-parser` への誘導が7箇所以上ある。ツールは削除決定済みのため、以下の方針で処理する:

- 全てのサイト内ツールリンクを削除する
- 代替として、外部の定番ツールへのリンクを1-2箇所に限定して設置する:
  - [crontab.guru](https://crontab.guru/) --- cron式の解析・確認用
  - [Cron Expression Generator](https://www.freeformatter.com/cron-expression-generator-quartz.html) --- ビルダー機能付き（必要に応じて）
- まとめセクション末尾にある「当サイトでは~以下のツールを無料で提供しています」のブロックは全て削除する
- `related_tool_slugs: ["cron-parser"]` をフロントマターから削除する

### 5. ファクトチェックが必要な項目のリスト

以下の項目は、記事執筆時に公式ドキュメントで正確な情報を確認する必要がある:

1. **AWS EventBridge Schedulerのcron式フィールド**: フィールド数・構文 --- [AWS EventBridge Scheduler公式ドキュメント](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html#cron-based)で確認
2. **AWS EventBridge Rules（レガシー）のcron式フィールド**: Scheduler版との仕様差異（フィールド数、対応する特殊文字の違い）を確認 --- [AWS EventBridge Rules公式ドキュメント](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-cron-expressions.html)で確認
3. **AWS EventBridgeの`L`、`W`、`#`構文サポート**: Scheduler版とRules版それぞれでの対応有無 --- 上記2つのドキュメントで確認
4. **Google Cloud Schedulerのタイムゾーン指定**: tz databaseの形式で指定可能、デフォルトはUTC --- [GCP公式ドキュメント](https://cloud.google.com/scheduler/docs/configuring/cron-job-schedules)で確認
5. **Google Cloud SchedulerのDST（夏時間）問題**: 時刻が2回発生する場合の挙動 --- 同上
6. **Kubernetes CronJobのタイムゾーン対応**: `.spec.timeZone`フィールドで指定（v1.27でGA）、`CRON_TZ`変数は非サポート --- [Kubernetes公式ドキュメント](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)で確認
7. **Amazon Linux 2023でのcronの状態**: cronieがデフォルト非搭載であること（「非推奨」ではなく「デフォルト非搭載」が正確な表現か）、systemd timerが推奨代替であること --- [AWS公式ドキュメント](https://docs.aws.amazon.com/linux/al2023/ug/cron.html)で確認
8. **systemd timerのPersistent=true**: 電源OFF中のミスファイア処理の動作 --- [systemd公式ドキュメント](https://www.freedesktop.org/software/systemd/man/latest/systemd.timer.html)で確認
9. **systemd timerのOnCalendar構文**: 基本的な書式と具体例 --- 同上のsystemd公式ドキュメントで確認
10. **Vixie cronの日+曜日同時指定のOR動作**: crontab(5)マニュアルで確認
11. **GitHub Actionsのscheduleトリガーの遅延**: 混雑時に遅延する可能性がある旨 --- [GitHub公式ドキュメント](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)で確認

### 6. 完成基準

- [ ] 全体の文字数が4,000〜6,000字の範囲に収まっている
- [ ] 基礎セクション（セクション2・3）が合計1,000字以内に収まっている
- [ ] systemd timer比較セクション（セクション6）が500字以内に収まっている
- [ ] 「この記事で分かること」で挙げた項目が全て本文で回収されている
- [ ] 環境別互換性マトリクス（5環境の比較表）が正確に記載されている
- [ ] AWS EventBridge SchedulerとRules（レガシー）の仕様差異が区別されている
- [ ] cron式の限界（第N曜日、月末、秒単位、隔週）と回避策が具体的に記載されている
- [ ] systemd timerとの比較が簡潔な表で記載されている
- [ ] Amazon Linux 2023のcronについて「デフォルト非搭載（systemd timerが推奨代替）」と正確に記述されている
- [ ] サイト内ツールリンク（/tools/cron-parser）が全て除去されている
- [ ] 外部代替ツール（crontab.guru等）へのリンクが適切に設置されている
- [ ] 全てのファクトチェック対象項目が公式ドキュメントで確認済みである
- [ ] trust_level: "generated" が維持されている
- [ ] slugとURLが変更されていない
- [ ] updated_atがコミット直前の現在時刻で更新されている
- [ ] フロントマターのrelated_tool_slugsからcron-parserが削除されている
- [ ] AI透明性の注記が冒頭に含まれている
- [ ] 「実際にハマった事例」等のAI生成では信頼性リスクのある表現を使用していない
- [ ] Admonitionの使用が4-5個以内に収まっている
- [ ] 競合記事（カゴヤ、Qiita、server-memo.net等）にない独自の価値が明確に存在する

### 7. フロントマターの変更方針

- `title`: 「cron式の書き方ガイド: 環境別の違いと限界を徹底解説」に変更
- `description`: 環境別比較・限界と回避策を含む内容に書き換え
- `tags`: `["スケジュール", "Web開発"]` に変更（「オンラインツール」タグはツール削除に伴い除去）
- `related_tool_slugs`: `[]` に変更
- `series`: "tool-guides" を維持
- `updated_at`: コミット直前の`date`コマンド出力に更新

### 8. 作業ステップ

1. builderエージェントに記事の書き直しを指示（この計画書と、ファクトチェック用の公式ドキュメントURLリストを渡す）
2. builderが各ファクトチェック項目を公式ドキュメントで確認しながら執筆
3. reviewerエージェントに完成記事のレビューを依頼（読者目線で独自価値・正確性・構成を検証）
4. フィードバックに基づき修正
5. コミット

### レビュー指摘への対応サマリ

| # | 指摘 | 対応内容 |
|---|------|----------|
| 1 | 想定読者の定義がターゲットユーザーと合っていない | 「定期タスクの自動化が必要で、cron式を複数環境で使い分ける機会があるエンジニア」に修正。ターゲットとの無理な紐づけをやめ、SEO流入想定と明記 |
| 2 | EventBridgeのフィールド数 | ファクトチェック項目を分割し、EventBridge SchedulerとEventBridge Rules（レガシー）の仕様差異を個別に確認する項目を追加（項目1・2・3） |
| 3 | Amazon Linux 2023のcron | 全箇所で「非推奨」を「デフォルト非搭載（systemd timerが推奨代替）」に修正。ファクトチェック項目7で正確な表現をAWS公式で確認する旨を追記 |
| 4 | 分量が大きくなりすぎるリスク | 全体4,000〜6,000字の目安を追記。基礎セクション合計1,000字以内、systemd timer比較500字以内の制約を追加。完成基準にも分量チェック項目を追加 |
| 5 | 「この記事で分かること」と本文の対応 | 基礎セクションを短くする方針を明記。冒頭リストに「cron式の基本的な書き方」を追加し、本文との整合を確保。完成基準に「冒頭リストの全項目が本文で回収されている」を追加 |
| 6 | systemd timerのOnCalendar構文 | ファクトチェック項目9として追加。セクション4の互換性マトリクスからsystemd timerを除外し（cron式ではないため）、セクション6で別途OnCalendar構文を扱う方針に変更 |

---

以上が修正版の計画です。PMに報告し、reviewerにレビューを依頼します。</result>
<usage><total_tokens>26567</total_tokens><tool_uses>8</tool_uses><duration_ms>141553</duration_ms></usage>
</task-notification>
Full transcript available at: /tmp/claude-1000/-mnt-data-yolo-web/58c33b98-80b7-45f9-a7f4-fb987037a903/tasks/af153bcc51166336b.output
