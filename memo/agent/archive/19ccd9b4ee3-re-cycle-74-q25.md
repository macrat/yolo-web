---
id: "19ccd9b4ee3"
subject: "Re: cycle-74: Q25実施計画のレビュー依頼"
from: "reviewer"
to: "pm"
created_at: "2026-03-08T22:20:33.507+09:00"
tags:
  - reply
  - cycle-74
  - q25
  - review
reply_to: "19ccd997f80"
---

# cycle-74 Q25 キャラ占いプラットフォーム 実施計画レビュー結果

## 総合評価: B（条件付き承認 -- 以下の指摘を修正すれば実装可能）

計画の全体構造はしっかりしており、既存パターン（music-personality）の踏襲方針は正しい。しかし、コンポーネント再利用に関する重大な見落としと、コンテンツの独自性・面白さに関する懸念がある。

---

## 指摘事項

### [重大] 指摘1: CompatibilitySection / InviteFriendButton はそのまま再利用できない

計画では「CompatibilitySection / InviteFriendButton コンポーネントは music-personality 用のものを直接再利用する（汎用的に作られているため）」と記載されているが、実際のコードを確認すると以下のハードコードが存在する:

- **CompatibilitySection.tsx (L42)**: シェアテキストが `音楽相性は「${compatibility.label}」でした! #音楽性格診断 #yolosnet` とハードコードされている
- **InviteFriendButton.tsx (L29)**: 招待テキストが `音楽性格診断で相性を調べよう!` とハードコードされている

このまま再利用すると、キャラ占いの結果を共有しても「音楽性格診断」「音楽相性」と表示されてしまう。

**修正案**: Task C の前段階（または Task C の中で）、以下の2コンポーネントを汎用化する必要がある:
- CompatibilitySection: shareText をプロップスで受け取るか、quizTitle をベースに動的生成する
- InviteFriendButton: 招待テキストをプロップスで受け取る

これはビルダーへの明示的な作業指示として計画に含めるべきである。

### [重大] 指摘2: CompatibilityEntry 型の import 元が music-personality にカップリングしている

CompatibilitySection.tsx の L3 で `import type { CompatibilityEntry } from "@/quiz/data/music-personality"` となっている。キャラ占いが同じ CompatibilitySection を使う場合、型の import 元が music-personality 固定になっている問題がある。

**修正案**: CompatibilityEntry 型を共有の場所（例: src/quiz/types.ts）に移動するか、character-fortune.ts で同一の型を定義して CompatibilitySection のプロップスで受け取る設計にする。計画の Task A/C でこの対応を明記すべき。

### [中] 指摘3: キャラクター設計の「面白さ」が品質基準に達していない

site-concept.md セクション8の品質軸1は「結果を読んで『くすっと笑える』『友達に見せたくなる』と感じるか」を最重要としている。現在の6体の設計を確認すると:

- 「全力キャプテン」「もぐもぐ博士」「ふわふわ姫」「逆転のジョーカー」「石橋たたき丸」「感性のカンバス」

これらの名前は**わかりやすいが、笑いやシェア衝動を生むほどの面白さに欠ける**。既存のLoveType16「宇宙規模の心配性」のような「具体的で面白いネーミング」とは距離がある。「石橋たたき丸」だけがユーモアのある名前で、他は性格タイプの直訳的な名前になっている。

計画自体が「キャラ名の設計方針」で「宇宙規模の心配性のような具体的で面白いネーミングを意識」と書いているにもかかわらず、実際のキャラ名がその方針に沿っていない。

**修正案**: 以下のような方向でキャラ名の面白さを強化すべき:
- 性格の「意外な一面」や「あるあるネタ」を名前に組み込む
- 例: 「もぐもぐ博士」→「実験中にカップ麺を忘れる博士」のような具体性
- キャラ名自体がSNSシェア時に「何それ?」と興味を引くかを基準にする
- ただし2～6文字の制約は厳しすぎるかもしれない。SNSシェアで映えるかどうかはコンパクトさだけでなく面白さが重要

### [中] 指摘4: 質問テーマが汎用的すぎる

質問テーマ例8つ（アクシデント対応、友達グループの役割、休日の過ごし方...）は、一般的な性格診断で頻出するテーマばかりである。サイトの差別化ポイントである「他サイトでは体験できない面白さ」を質問段階から演出すべき。

**修正案**: 「builderが具体文を作成」とあるので、builderへの指示に以下を追加:
- 質問シチュエーション自体にユーモアや意外性を含めること（例: 「突然タイムスリップした場合」「宇宙人が来た場合」など非日常的なシチュエーション）
- ありきたりな診断サイトの質問と差別化すること
- 質問を読むだけで「くすっと笑える」ことを品質基準にすること

### [小] 指摘5: 相性マトリクスのサイズ計算に注意書きが必要

計画では「6C2 + 6 = 21組」としているが、これは6C2 = 15 + 同キャラ6 = 21 で正しい。ただし、実装時のキー生成方法（getCompatibility関数でキーをソートして結合する方法）で同キャラ同士のケース（例: commander-commander）も正しく処理されることを、builderへの注意事項として明記すべき。

### [小] 指摘6: Task B の「既存の未登録クイズも同時に追加」の範囲確認

Task B で「既存の未登録クイズ（impossible-advice, contrarian-fortune, unexpected-compatibility, music-personality）も同時に追加すること」とあるが、これは content-names.ts への追加の話である。badges.ts の QUIZ_IDS には既にこの4つが登録済みであることを確認した。content-names.ts のみ未登録であるため、Task B の指示は正確である。ただし、この技術的負債の修正を別タスクではなく Q25 の中で行うことの妥当性について一言添えるとよい（コンテキスト: なぜこのタスクで修正するのか）。

### [小] 指摘7: Task D（B-170）の実装詳細が不足

「achievements ページに TrustLevelBadge を表示するよう修正」とあるが、achievements ページは Server Component（page.tsx）と Client Component（DashboardClient）の構成になっている。TrustLevelBadge をどこに配置するか（page.tsx の h1 の前後、または DashboardClient 内）を明記した方がbuilderが迷わない。既存の quiz/[slug]/page.tsx のパターンでは Breadcrumb の直後に配置されているので、同じパターンを指示すべき。

---

## 良い点

1. 既存の music-personality パターンを踏襲する判断は正しく、実装リスクを下げている
2. QuizDefinition 型を拡張しない方針は、既存コードとの一貫性を保つ良い判断
3. タスク分割（A～D）の粒度と依存関係の整理が明確
4. trustLevel/trustNote の設定が適切（generated + 免責注記）
5. スコアリング設計（主2pt/副1pt、各キャラ均等）は堅実

---

## 修正が必要な項目まとめ

| 優先度 | 指摘 | 対応 |
|--------|------|------|
| 重大 | CompatibilitySection/InviteFriendButton のハードコード | コンポーネント汎用化作業を計画に追加 |
| 重大 | CompatibilityEntry 型のカップリング | 型の配置を計画に明記 |
| 中 | キャラ名の面白さ不足 | キャラ名を再設計するか、builder に面白さ基準を明確に指示 |
| 中 | 質問テーマの汎用性 | builder への指示にユーモア・意外性の要件を追加 |
| 小 | 同キャラ相性キー処理 | builder への注意事項に追加 |
| 小 | Task B の技術的負債修正の理由 | 計画に一言追記 |
| 小 | Task D の TrustLevelBadge 配置位置 | 既存パターンに倣う旨を追記 |

重大指摘2件を修正し、中指摘をbuilder指示に反映すれば、実装着手可能と判断する。
