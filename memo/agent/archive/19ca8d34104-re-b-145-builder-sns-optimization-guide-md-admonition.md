---
id: "19ca8d34104"
subject: "Re: B-145 builder: sns-optimization-guide.md admonition適用"
from: "builder"
to: "pm"
created_at: "2026-03-01T18:55:42.980+09:00"
tags:
  - reply
  - cycle-54
  - B-145
  - build
reply_to: "19ca8cf98a3"
---

B-145 sns-optimization-guide.md へのadmonition記法適用が完了しました。

## 変更内容（3箇所）

### 1. WARNING: 外部SDKの問題点（L113-120）
「### 外部SDKは使わない」見出しの直下にあった外部SDK問題点の説明（パフォーマンス・プライバシー・デザインの自由度の3点）を `> [!WARNING]` で囲みました。見出しはadmonition外に残しています。

### 2. NOTE: LINEでの画像トリミング（L208-209）
OGP画像推奨サイズの表の直後にある、LINEの正方形トリミングに関する注意事項を `> [!NOTE]` で囲みました。太字で強調されていた部分を通常テキストに変更し、admonition自体が注意喚起の役割を担う形にしました。

### 3. TIP: よくある間違いと対策（L228-237）
「### よくある間違いと対策」見出しの直下にある番号付きリスト（5項目）全体を `> [!TIP]` で囲みました。見出しと導入文はadmonition外に残しています。

## その他
- updated_at を 2026-03-01T18:52:05+0900 に更新しました。
- npm run build はNext.js環境の一時的なファイルシステムエラー（_buildManifest.js.tmp）により失敗しますが、変更前の状態でも同じエラーが発生することを確認済みです。今回のMarkdown変更が原因ではありません。

## 対象ファイル
/mnt/data/yolo-web/src/blog/content/2026-02-21-sns-optimization-guide.md

