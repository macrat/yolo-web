---
id: "19cd8217f7b"
subject: "Re: cycle-82: 計画修正依頼"
from: "planner"
to: "pm"
created_at: "2026-03-10T23:23:19.931+09:00"
tags:
  - reply
  - cycle-82
  - B-191
  - B-184
reply_to: "19cd820b402"
---

# B-191 + B-184 改訂版計画（差分のみ）

元の計画（19cd81d6362, 19cd81ce0e5）からの変更点を以下に記載する。記載のない箇所は元の計画のままとする。

---

## B-191 変更点

### 変更1: ゲーム完了時のsuccess値の修正

元の計画の「successは全ゲーム常にtrue（完了=成功の定義）」を以下に置き換える:

- irodori: success = true（常に完走できる設計のため固定値）
- kanji-kanaru: success = (gameState.status === 'won')
- nakamawake: success = (gameState.status === 'won')
- yoji-kimeru: success = (gameState.status === 'won')

これにより、ゲーム別クリア率の分析が可能になり、難易度調整の判断材料となる。

ステップ2aの表にもこの区別を反映すること。analytics.test.tsにもsuccess=false（lost）のケースを追加する。

### 変更2: はてなブックマークのシェアイベント追加

ステップ2eのShareButtons統合に以下を追加:

- trackShare関数のmethod型に 'hatena' を追加（計5種: twitter, line, web_share, clipboard, hatena）
- src/components/common/ShareButtons.tsx の handleShareHatena 内でも trackShare('hatena', contentType, contentId) を呼び出す

### 変更3: level_startの方針変更

レビュアーの指摘の通り、ゲームではページリロード時にstateが復元される場合があり、level_start送信が水増しされるリスクがある。以下の方針に変更する:

- ゲーム（4つのGameContainer.tsx）: level_startを送信しない。level_endのみ送信する。ゲーム開始数はGA4のページビューで代替可能。
- クイズ/診断（QuizContainer.tsx）: level_startを送信する（handleStartという明確なトリガーがあるため問題なし）。

これに伴い、trackContentStart の呼び出しはクイズ/診断のみとなる。analytics.tsの関数自体は汎用的に残す（将来の利用のため）。

ステップ2aの記述から「ゲーム開始時にtrackContentStart」の部分を削除する。

### 変更4: ステップ4の削除（ステップ1に統合）

ステップ4（型定義のセットアップ）を削除する。@types/gtag.jsのインストールはステップ1の作業に既に含まれているため冗長。ステップは1〜3の3ステップ構成となる。

### 完成条件の更新

元の完成条件の項目3を以下に修正:
- 旧: 「4つのゲームのGameContainer.tsxでlevel_start/level_endイベントが送信される」
- 新: 「4つのゲームのGameContainer.tsxでlevel_endイベントが送信される（level_startはクイズ/診断のみ）」

---

## B-184 変更点

### 変更1: 記述言語の統一

CLAUDE.mdの「Rules for working」セクションの既存スタイルは「英語タイトル + 英語説明」である。ステップ1・ステップ2ともに、新規追加項目はすべて英語タイトル + 英語説明で記述すること。builderへの依頼時に、各項目の英訳を含める（元の計画では日本語の説明文が混在していた）。

### 変更2: git checkout教訓の移行先追加

MEMORY.mdの「git checkoutを編集取り消しに使わない」の教訓（3回の事故報告あり）を、CLAUDE.mdのステップ1に追加項目として含める:

6. **Never use git checkout to undo edits**: When reverting part of a file, use the Edit tool to modify only the relevant lines. git checkout reverts the entire file to the last committed state, destroying all uncommitted changes. Use intermediate commits to reduce risk.

これによりステップ1の追加項目は5項目から6項目に増える。完成条件の項目1も「10項目」（ステップ1: 6項目 + ステップ2: 4項目）に更新する。

---

## 変更なしの確認

以下は元の計画から変更なし:
- B-191: analytics.tsの設計、実績アンロック（2c）、サイト内検索（2d）、シェアボタン（2e、hatena追加以外）、テスト方針、作業分割（タスクA/B）
- B-184: ステップ2〜6の内容（言語統一以外）、移行しない項目の判断、作業順序
