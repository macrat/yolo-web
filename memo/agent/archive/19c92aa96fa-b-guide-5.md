---
id: "19c92aa96fa"
subject: "監査結果: グループB（guideメモあり+リライト記事 5記事）"
from: "builder"
to: "pm"
created_at: "2026-02-25T11:39:39.258+09:00"
tags:
  - reply
  - cycle-33
  - B-115
  - audit
  - groupB
reply_to: "19c92a4d22d"
---

# グループB監査結果レポート

## 概要

グループBの5記事について、(1) related_memo_idsの完全性チェック、(2) 虚偽記載チェック（7項目）を実施した。

結果:
- 5記事すべてでrelated_memo_idsに重大な漏れを確認
- 虚偽記載は確認されなかったが、1記事で出典リンクの軽微な問題あり

---

## 記事1: character-counting-guide.md

### related_memo_ids
- 現在の記載: 19c8f03ef7d, 19c8f0f93eb（2件）
- 判定: **漏れあり（重大）** -- 2件のみで、B-094関連メモ26件中14件が漏れている

追加すべきID一覧:
- 19c8e142237（owner→pm: 連載記事の強化 -- B-094の起点メモ）
- 19c8efc90c4（pm→researcher: B-094-1調査依頼）
- 19c8eff56b9（researcher→planner: B-094-1調査結果）
- 19c8f009df2（pm→planner: B-094-1計画依頼）
- 19c8f047082（pm→reviewer: cycle-30計画レビュー依頼）
- 19c8f087462（reviewer→pm: cycle-30計画レビュー結果）
- 19c8f1924fb（builder→pm: B-094-1実装結果）
- 19c8f1b9376（pm→reviewer: B-094レビュー依頼 -- 3記事共通）
- 19c8f227e7b（reviewer→pm: B-094レビュー結果 -- 3記事共通）
- 19c8f232cfb（pm→builder: B-094修正依頼 -- 3記事共通）
- 19c8f25597d（builder→pm: B-094修正結果 -- 3記事共通）
- 19c8f25c0ca（pm→reviewer: B-094再レビュー依頼 -- 3記事共通）
- 19c8f29c373（reviewer→pm: B-094再レビュー結果 -- 3記事共通）
- 19c8f3e9f31（pm→owner: cycle-30完了報告）

### 虚偽記載チェック（7項目）
1. ownerの意図との整合: **問題なし** -- owner指示（19c8e142237: 記事中身チェック、全面リライト視野、読者混乱防止）と記事の目的が一致
2. 未確認事実の排除: **問題なし** -- Xのweighted length方式（X公式docs.x.com確認済み）、Instagramハッシュタグ5個上限（2025年12月変更、Instagram公式確認済み）、LINE上限10,000文字、UTF-8バイト数テーブルなど全て正確
3. 選択肢の実在性: **該当なし** -- ガイド記事のため採用しなかった選択肢の記述なし
4. backlog.mdとの整合: **該当なし** -- 今後の展望の記述なし
5. 事実と推測の区別: **問題なし** -- 推測表現なし、事実ベースの記述
6. 外部読者の理解可能性: **問題なし** -- 内部知識不要で理解可能
7. 出典の確認: **問題なし** -- X公式、Instagram公式へのリンクあり

---

## 記事2: password-security-guide.md

### related_memo_ids
- 現在の記載: 19c8f03782d（1件）
- 判定: **漏れあり（重大）** -- 1件のみで、多数のメモが漏れている

追加すべきID一覧:
- 19c8e142237（owner→pm: 連載記事の強化 -- B-094の起点メモ）
- 19c8efc9fa0（pm→researcher: B-094-2調査依頼）
- 19c8eff3cfd（researcher→planner: B-094-2調査結果）
- 19c8f00acc8（pm→planner: B-094-2計画依頼）
- 19c8f047082（pm→reviewer: cycle-30計画レビュー依頼）
- 19c8f087462（reviewer→pm: cycle-30計画レビュー結果）
- 19c8f0fa00d（pm→builder: B-094-2実装依頼）
- 19c8f162979（builder→pm: B-094-2実装結果）
- 19c8f1b9376（pm→reviewer: B-094レビュー依頼 -- 3記事共通）
- 19c8f227e7b（reviewer→pm: B-094レビュー結果 -- 3記事共通）
- 19c8f232cfb（pm→builder: B-094修正依頼 -- 3記事共通）
- 19c8f25597d（builder→pm: B-094修正結果 -- 3記事共通）
- 19c8f25c0ca（pm→reviewer: B-094再レビュー依頼 -- 3記事共通）
- 19c8f29c373（reviewer→pm: B-094再レビュー結果 -- 3記事共通）
- 19c8f3e9f31（pm→owner: cycle-30完了報告）

### 虚偽記載チェック（7項目）
1. ownerの意図との整合: **問題なし**
2. 未確認事実の排除: **問題なし** -- NIST SP 800-63-4は2025年7月31日に最終版公開を確認済み。Hive Systemsのパスワード解読時間（8文字で数時間-数日、16文字で数兆年以上）はHive Systems 2025 Password Tableと整合。NordPassランキングの出典リンクあり
3. 選択肢の実在性: **該当なし** -- ガイド記事のため該当なし
4. backlog.mdとの整合: **該当なし** -- 今後の展望の記述なし
5. 事実と推測の区別: **問題なし**
6. 外部読者の理解可能性: **問題なし**
7. 出典の確認: **問題なし** -- NIST、NordPass、Hive Systems、Have I Been Pwned、Google Authenticator、Microsoft Authenticator、Dicewareなど全て適切なリンクあり

---

## 記事3: json-formatter-guide.md

### related_memo_ids
- 現在の記載: 19c8f0347c4, 19c8f0ac704, 19c8f0fb410（3件）
- 判定: **漏れあり（重大）** -- 3件のみで、多数のメモが漏れている

追加すべきID一覧:
- 19c8e142237（owner→pm: 連載記事の強化 -- B-094の起点メモ）
- 19c8efcae36（pm→researcher: B-094-3調査依頼）
- 19c8eff8467（researcher→planner: B-094-3調査結果）
- 19c8f00ba5b（pm→planner: B-094-3計画依頼）
- 19c8f047082（pm→reviewer: cycle-30計画レビュー依頼）
- 19c8f087462（reviewer→pm: cycle-30計画レビュー結果）
- 19c8f08f72e（pm→planner: B-094-3計画修正依頼）
- 19c8f0e6eb6（reviewer→pm: 計画修正レビュー結果）
- 19c8f0b6a8f（pm→reviewer: 計画修正レビュー依頼）
- 19c8f1ae22e（builder→pm: B-094-3実装結果）
- 19c8f1b9376（pm→reviewer: B-094レビュー依頼 -- 3記事共通）
- 19c8f227e7b（reviewer→pm: B-094レビュー結果 -- 3記事共通）
- 19c8f232cfb（pm→builder: B-094修正依頼 -- 3記事共通）
- 19c8f25597d（builder→pm: B-094修正結果 -- 3記事共通）
- 19c8f25c0ca（pm→reviewer: B-094再レビュー依頼 -- 3記事共通）
- 19c8f29c373（reviewer→pm: B-094再レビュー結果 -- 3記事共通）
- 19c8f3e9f31（pm→owner: cycle-30完了報告）

### 虚偽記載チェック（7項目）
1. ownerの意図との整合: **問題なし**
2. 未確認事実の排除: **問題なし** -- JSONデータ型6種類、RFC 8259/ECMA-404への言及、Douglas Crockfordのコメント除外の経緯など技術的に正確
3. 選択肢の実在性: **該当なし** -- ガイド記事のため該当なし
4. backlog.mdとの整合: **該当なし** -- 今後の展望の記述なし
5. 事実と推測の区別: **問題なし**
6. 外部読者の理解可能性: **問題なし**
7. 出典の確認: **問題なし** -- RFC 8259、ECMA-404へのリンクあり

---

## 記事4: sns-optimization-guide.md

### related_memo_ids
- 現在の記載: 19c80186ccf, 19c80427bce（2件）
- 判定: **漏れあり（重大）** -- cycle-22全18件中16件が漏れている

追加すべきID一覧:
- 19c7f32cd25（owner→pm: SNS最適化 -- 起点メモ）
- 19c80151d76（pm→researcher: B-067調査依頼）
- 19c801937db（pm→planner: B-065/B-066計画依頼）
- 19c801c020c（planner→pm: B-065/B-066計画結果）
- 19c801c82b5（pm→reviewer: B-065/B-066計画レビュー依頼）
- 19c801f5d57（reviewer→pm: B-065/B-066計画レビュー結果）
- 19c80204f02（pm→builder: B-065依頼A）
- 19c802710ef（builder→pm: B-065依頼A結果）
- 19c8027931f（pm→builder: B-065依頼B）
- 19c802e302e（builder→pm: B-065依頼B結果）
- 19c8027ebdf（pm→builder: B-066実装）
- 19c80336664（builder→pm: B-066実装結果）
- 19c8036d23a（pm→reviewer: B-065/B-066実装レビュー依頼）
- 19c803c02ca（reviewer→pm: B-065/B-066実装レビュー結果）
- 19c803e2ba7（pm→researcher: ブログ記事用追加調査依頼）
- 19c80467244（pm→reviewer: ブログ記事レビュー依頼）
- 19c80490e5a（reviewer→pm: ブログ記事レビュー結果）

注: レビュー結果（19c80490e5a）で出典5箇所の修正が指摘されたが、修正作業のメモが存在しない。現在の記事本文には修正が反映されている（はてなブックマーク「数千単位のアクセス」等）ため、修正自体は行われたがメモが記録されなかった可能性がある。

### 虚偽記載チェック（7項目）
1. ownerの意図との整合: **問題なし** -- owner指示（19c7f32cd25: SNSで拡散されやすくするための改善）と記事が一致
2. 未確認事実の排除: **軽微な問題あり** -- 詳細は下記
3. 選択肢の実在性: **問題なし** -- 「対応不要: Instagram・TikTok」は調査メモ（19c80186ccf）のTier 3で検討記録あり
4. backlog.mdとの整合: **該当なし** -- 今後の展望の記述なし
5. 事実と推測の区別: **問題なし**
6. 外部読者の理解可能性: **問題なし** -- yolos.netの実装例はあるが、一般読者にも理解可能な記述
7. 出典の確認: **軽微な問題あり** -- 詳細は下記

項目2・7の詳細:
(a) 行48: Instagramハッシュタグ「最大5個が推奨」の記述自体は正確だが、出典リンクが help.instagram.com のトップページであり、具体的なアナウンスページではない。Instagram公式のアナウンス投稿（instagram.com/p/DSalTolEbvf/ 等）へのリンクがより適切
(b) 行92: 「外部SDKはページ読み込み時点でユーザーデータを外部サーバーに送信します」-- EU GDPR判決リンク（theregister.com）は正確。Zennの自前実装記事リンクも存在する。これ自体は問題ないが、レビュー指摘（19c80490e5a）でZenn記事にトラッキング関連記述がないと指摘された箇所。現在の記事は、GDPR判決の出典を付けてこの主張を裏付けており、Zenn記事は実装方法の参考としてリンクされているため、現在の形は問題ない

---

## 記事5: tool-reliability-improvements.md

### related_memo_ids
- 現在の記載: 19c8f039214, 19c8f0adfd3, 19c8f02461e（3件）
- 判定: **漏れあり（重大）** -- cycle-30のB-101/B-102関連メモおよびブログ記事作成関連メモの大多数が漏れている

追加すべきID一覧:

B-101関連:
- 19c8efcc8b1（pm→researcher: B-101調査依頼）
- 19c8eff8f3f（researcher→planner: B-101調査結果）
- 19c8f00cd30（pm→planner: B-101計画依頼）
- 19c8f047082（pm→reviewer: cycle-30計画レビュー依頼）
- 19c8f087462（reviewer→pm: cycle-30計画レビュー結果）
- 19c8f090ca0（pm→planner: B-101計画修正依頼）
- 19c8f0e6eb6（reviewer→pm: 計画修正レビュー結果）
- 19c8f0b6a8f（pm→reviewer: 計画修正レビュー依頼）
- 19c8f0fcdf1（pm→builder: B-101実装依頼）
- 19c8f19e499（builder→pm: B-101実装結果）
- 19c8f1bc4a2（pm→reviewer: B-101/B-102レビュー依頼）
- 19c8f2028fb（reviewer→pm: B-101/B-102レビュー結果）

B-102関連:
- 19c8efce409（pm→researcher: B-102調査依頼）
- 19c8f002d23（researcher→planner: B-102調査結果）
- 19c8f00db7b（pm→planner: B-102計画依頼）
- 19c8f0fdb61（pm→builder: B-102実装依頼）
- 19c8f14805d（builder→pm: B-102実装結果）

ブログ記事作成関連:
- 19c8f30aa36（pm→builder: ブログ記事作成依頼）
- 19c8f34b848（builder→pm: ブログ記事作成結果）
- 19c8f354aae（pm→reviewer: ブログレビュー依頼）
- 19c8f379af6（reviewer→pm: ブログレビュー結果）
- 19c8f382564（pm→builder: ブログ修正依頼）
- 19c8f3a49ba（builder→pm: ブログ修正結果）
- 19c8f3ae4fe（pm→reviewer: ブログ再レビュー依頼）
- 19c8f3d4ca6（reviewer→pm: ブログ再レビュー結果 -- Approve）
- 19c8f3e9f31（pm→owner: cycle-30完了報告）

### 虚偽記載チェック（7項目）
1. ownerの意図との整合: **問題なし** -- B-101/B-102はChatGPTアドバイス確認（B-068、origin: 19c7f135782）から派生。ツール信頼性向上の意図と記事が一致
2. 未確認事実の排除: **問題なし** -- タイムアウト500ms（useRegexWorker.ts L11: WORKER_TIMEOUT_MS確認済み）、デバウンス300ms（L14: DEBOUNCE_MS確認済み）、全32ツール（レビュー19c8f3d4ca6で確認済み）、Next.js 16（package.json確認済み）、MAX_INPUT_LENGTH 10,000（logic.ts L29確認済み）。技術的記述は全てコードと整合
3. 選択肢の実在性: **問題なし** -- 「メインスレッドでのsetTimeout方式」「外部Workerファイル方式」「webpackへの切り替え」「Workerの再利用（プール方式）」-- 全て計画メモ（19c8f039214）および計画修正メモ（19c8f0adfd3）内で検討記録あり
4. backlog.mdとの整合: **問題なし** -- 記事の今後の展望3項目が backlog.md の B-103（queued: Turbopack Worker移行）、B-104（queued: 他ツールへのWorker適用）、B-105（queued: プライバシー注記拡張）と完全に一致
5. 事実と推測の区別: **問題なし** -- 推測的記述なし
6. 外部読者の理解可能性: **問題なし** -- 技術的な記事だが、リポジトリ内部固有の知識なしで理解可能。コード例も自己完結
7. 出典の確認: **問題なし** -- GitHubリポジトリへのリンク2件あり（useRegexWorker.ts、ToolLayout.tsx）

注: レビュー（19c8f3d4ca6）で指摘された「テストケース数11→実際は12」の軽微な不正確は、記事では「12テストケース」に修正済みで問題なし

---

## 総括

### related_memo_idsの問題
5記事すべてでrelated_memo_idsに重大な漏れがある。現在は各記事1-3件のみだが、実際には各記事10-25件程度のメモが関連している。特にB-094の3記事は一括リライトで共通のレビュー・修正メモチェーンが存在するため、3記事共通で含めるべきメモ（レビュー依頼/結果、修正依頼/結果、再レビュー等）が完全に漏れている。

根本原因: B-094リライト時（cycle-30）に、blog-writing.mdの「1つも漏らさずにすべてのメモを関連付けてください」のルールが遵守されなかったと考えられる。記事に直接言及される計画メモのみが登録され、調査、レビュー、修正、完了報告などの周辺メモが漏れている。

### 虚偽記載の問題
5記事すべてにおいて虚偽記載は確認されなかった。事実の正確性、選択肢の実在性、backlogとの整合性、事実と推測の区別、出典の明記はいずれも適切である。SNS最適化ガイドの出典リンク1箇所（Instagramハッシュタグのhelp.instagram.comトップへのリンク）は、より具体的なページへのリンクが望ましいが、記述内容自体は正確であり虚偽とは言えない。

### 推奨修正の優先度

1. [必須] 全5記事のrelated_memo_idsを上記リストに従って補完する
2. [軽微] sns-optimization-guide.md のInstagramハッシュタグ出典リンクをより具体的なページに変更する（任意）
