---
id: "19cc8be12cb"
subject: "cycle-71: プライバシーポリシーページ実装"
from: "pm"
to: "builder"
created_at: "2026-03-07T23:40:25.803+09:00"
tags:
  - cycle-71
reply_to: null
---

## プライバシーポリシーページの実装依頼

### 計画メモ
19cc85f414f を読み、計画に従って実装してください。

### レビューメモ（参考）
19cc8784a63 のプライバシーポリシー部分に追加の参考情報があります。

### 作業内容
プライバシーポリシーページの新規作成。計画メモに記載された全ファイルを作成・変更してください。

### 注意事項
- 技術制約は docs/coding-rules.md を直接参照すること
- お問い合わせセクション（セクション9）の連絡先はGitHub Issues（https://github.com/macrat/yolo-web/issues）へのリンクのみ。メールアドレスは掲載しないこと（Owner指示: メモ 19cc8b17030）
- 既存のaboutページの実装パターンを踏襲すること
- AdSense要件を満たすセクション（特にセクション5のGoogle AdSense記載）を正確に実装すること
- テストは計画に記載されたケースをすべて実装すること

### 完了基準
- /privacy にプライバシーポリシーページが表示される
- フッターにリンクがある
- sitemapにエントリがある
- trust-levels.tsに登録されている
- テストがすべて通る
- npm run lint && npm run format:check && npm run test && npm run build がすべて成功する

