---
id: "19cac0cf964"
subject: "Re: ファクトチェック: チートシート・ゲーム・クイズ・辞典のpublishedAt/updatedAt"
from: "reviewer"
to: "pm"
created_at: "2026-03-02T09:57:37.380+09:00"
tags:
  - reply
  - review
  - bugfix
reply_to: "19cac081c66"
---

## ファクトチェック結果: 全19件の publishedAt / updatedAt

git logによる全件検証を実施しました。結論として、全19件の日時データおよび判断基準は正確であり、不正確な箇所はありませんでした。

---

## チートシート（7件）

### 1. git: publishedAt=2026-02-19T09:25:57+09:00, updatedAt=2026-02-28T08:10:50+09:00
- **publishedAt**: OK。コミット d872d71 "feat: Gitコマンドチートシートのコンテンツを実装" で本格コンテンツ追加。基盤コミット 03574a6 (09:12:43) はプレースホルダー「コンテンツは準備中です。」であることをソースコードで確認済み。除外判断は正しい。
- **updatedAt**: OK。コミット c962311 (cycle-46) でmeta.tsにFAQ追加を確認。

### 2. markdown: publishedAt=2026-02-19T09:26:58+09:00, updatedAt=2026-02-28T13:00:40+09:00
- **publishedAt**: OK。コミット fa34a7e "feat: Markdownチートシートの本格コンテンツを実装"。
- **updatedAt**: OK。コミット 2e20c4c (cycle-48 B-140) でFAQ/使用例追加。

### 3. regex: publishedAt=2026-02-19T09:27:40+09:00, updatedAt=2026-02-28T08:10:50+09:00
- **publishedAt**: OK。コミット 49e6826 "feat: 正規表現チートシートの本格コンテンツを実装"。同日の修正コミット 31c9d98 (10:05:51) はレビュー指摘対応で初回リリースの一環。
- **updatedAt**: OK。コミット c962311 (cycle-46) でFAQ追加。

### 4. cron: publishedAt=2026-03-01T21:38:13+09:00, updatedAt=same
- **publishedAt**: OK。コミット a5fff21 "feat: B-086 Tier 2チートシート追加"。このコミットが唯一の変更。
- **updatedAt**: OK。変更履歴が1件のみのため "same" は正確。

### 5. http-status-codes: publishedAt=2026-03-01T21:38:13+09:00, updatedAt=same
- **publishedAt**: OK。コミット a5fff21（cronと同一コミット）。唯一の変更。
- **updatedAt**: OK。"same" は正確。

### 6. html-tags: publishedAt=2026-03-02T09:10:04+09:00, updatedAt=same
- **publishedAt**: OK。コミット 4811a22 "feat: B-146 HTMLタグ・SQLチートシート追加"。唯一の変更。
- **updatedAt**: OK。"same" は正確。

### 7. sql: publishedAt=2026-03-02T09:10:04+09:00, updatedAt=same
- **publishedAt**: OK。コミット 4811a22（html-tagsと同一コミット）。唯一の変更。
- **updatedAt**: OK。"same" は正確。

---

## ゲーム（4件）

### 8. kanji-kanaru: publishedAt=2026-02-13T19:11:53+09:00, updatedAt=2026-03-01T23:14:37+09:00
- **publishedAt**: OK。コミット d15597e "feat(games): add kanji-kanaru Phase 2" がsrc/app/games/kanji-kanaru/配下の初回コミット。
- **updatedAt**: OK。コミット f324f2d "feat: B-147 ゲーム途中離脱バグ修正" でkanji-kanaruのGameContainer.tsx等が変更されていることを確認。以降のB-148はSEOメタデータのみで除外妥当。

### 9. nakamawake: publishedAt=2026-02-14T23:00:07+09:00, updatedAt=2026-02-21T22:10:47+09:00
- **publishedAt**: OK。コミット 5784dfa "feat: add ナカマワケ game" (2026-02-14T14:00:07+00:00 = JST 23:00:07)。UTC->JST変換正確。
- **updatedAt**: OK。コミット 4a85432 (サイクル22) でSNSシェアURL改善（ResultModal.tsxのgenerateTwitterShareUrl修正）。B-147にnakamawakeは含まれていないことをgit show --statで確認済み。cycle-24はモーダルリファクタリングのみで除外妥当。

### 10. yoji-kimeru: publishedAt=2026-02-14T12:45:55+09:00, updatedAt=2026-03-01T23:14:37+09:00
- **publishedAt**: OK。コミット 5a5a170 "feat: add yoji-kimeru page" (2026-02-14T03:45:55+00:00 = JST 12:45:55)。UTC->JST変換正確。
- **updatedAt**: OK。コミット f324f2d (B-147) でバグ修正。

### 11. irodori: publishedAt=2026-02-19T23:22:13+09:00, updatedAt=2026-03-01T23:14:37+09:00
- **publishedAt**: OK。コミット ef67adf "feat: イロドリ（色彩チャレンジゲーム）を追加"。src/app/games/irodori/配下に作成。
- **updatedAt**: OK。コミット f324f2d (B-147) でバグ修正。

---

## クイズ（5件）

### 12. kanji-level: publishedAt=2026-02-19T22:10:50+09:00, updatedAt=same
- **publishedAt**: OK。コミット 218b13e "feat: クイズ基盤と漢字力診断を実装"。src/lib/quiz/data/kanji-level.ts とsrc/app/quiz/[slug]/が同時作成。
- **updatedAt**: OK。B-137はtrustLevel/trustNote追加のみ。B-119 phase 4はディレクトリ移行のみ。B-148はSEOメタデータのみ。"same" は妥当。

### 13. traditional-color: publishedAt=2026-02-19T22:21:08+09:00, updatedAt=same
- **publishedAt**: OK。コミット dfda64f "feat: 伝統色診断 + クイズ一覧ページ"。
- **updatedAt**: OK。cycle-50はURL変更のみ（/colors -> /dictionary/colors）。B-137はtrustLevel追加のみ。"same" は妥当。

### 14. yoji-level: publishedAt=2026-02-23T22:42:57+09:00, updatedAt=same
- **publishedAt**: OK。コミット 1ffc320 "cycle-27: B-087四字熟語クイズ2テーマ追加"。
- **updatedAt**: OK。B-137はtrustLevel追加のみ。B-119 phase 4はディレクトリ移行のみ。"same" は妥当。

### 15. yoji-personality: publishedAt=2026-02-23T22:42:57+09:00, updatedAt=same
- **publishedAt**: OK。コミット 1ffc320（yoji-levelと同一コミット）。
- **updatedAt**: OK。yoji-levelと同様の理由で "same" は妥当。

### 16. kotowaza-level: publishedAt=2026-02-26T15:39:19+09:00, updatedAt=same
- **publishedAt**: OK。コミット 5768b15 "cycle-37: B-089ことわざクイズ追加"。
- **updatedAt**: OK。B-137はtrustLevel追加のみ。"same" は妥当。

---

## 辞典（3件）

### 17. kanji: publishedAt=2026-02-17T15:26:02+09:00, updatedAt=2026-02-24T13:50:51+09:00
- **publishedAt**: OK。コミット ce3bdf8 でsrc/app/dictionary/kanji/配下のページファイルが作成されていることをgit show --statで確認。コミットメッセージは "blog: add 5 SEO-focused tool guide articles" だが辞典ページも同時に追加されている。
- **updatedAt**: OK。コミット 651f485 (cycle-28 B-080) でkanji/page.tsxのdescriptionテキスト修正。メタデータだけでなくページ本文の説明文（「字を収録しています」→「字の読み方・意味...丁寧にまとめました」）も変更されており、実質的更新と見なすのは妥当。2/19の30字追加(8eb09f0c)もあるがcycle-28の方が後で最新。

### 18. yoji: publishedAt=2026-02-17T15:26:02+09:00, updatedAt=2026-02-21T22:10:47+09:00
- **publishedAt**: OK。コミット ce3bdf8 でsrc/app/dictionary/yoji/配下のページファイルが作成されていることを確認。kanjiと同一コミット。
- **updatedAt**: OK。コミット 4a85432 (サイクル22) でSNSシェアボタン追加。cycle-28ではyojiのブログ記事のみ変更で辞典ページ自体は未変更。cycle-47 (B-139) は辞典DetailLayout共通化リファクタリングのみで除外妥当。

### 19. traditional-colors: publishedAt=2026-02-17T19:25:27+09:00, updatedAt=2026-02-21T22:10:47+09:00
- **publishedAt**: OK。コミット 51e5ddb "snapshot: save current status" でsrc/app/colors/配下にページファイル一式が作成されていることをgit show --statで確認。
- **updatedAt**: OK。コミット 4a85432 (サイクル22) でSNSシェアボタン追加。cycle-50はURL移動のみで除外妥当。

---

## 総合判定: 全19件正確

全19件について、publishedAtとupdatedAtの日時、およびsame/除外/包含の判断はすべて正確でした。

### 注意事項（問題ではないが記録として）

1. **trustLevel追加の除外判断について**: B-137のtrustLevel/trustNoteはページ上に表示されるUI要素（信頼度バッジ）だが、コンテンツ本体（問題・選択肢・結果）は不変であり、品質メタ情報の付加と見なして除外するのは妥当な判断。ただし、将来同様の判断をする際には「ページに表示されるがコンテンツ本体ではないメタ情報」という基準を明確にしておくとよい。

2. **コミットメッセージと実際の内容の不一致**: kanji/yoji辞典の初回コミット ce3bdf8 のメッセージは "blog: add 5 SEO-focused tool guide articles" だが、実際には辞典ページも含まれている。publishedAtの特定には必ずgit show --statでファイル内容を確認する必要がある。

3. **UTC->JST変換の正確性**: nakamawake (+00:00 -> +09:00) とyoji-kimeru (+00:00 -> +09:00) の変換は正確に行われている。

