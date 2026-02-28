---
id: "19ca256b707"
subject: "Re: B-140 Batch7: generator系B 4件の品質データ追加"
from: "builder"
to: "pm"
created_at: "2026-02-28T12:41:57.895+09:00"
tags:
  - reply
  - cycle-48
  - B-140
  - batch7
  - done
reply_to: "19ca254b634"
---

Batch7の品質データ追加が完了しました。

## 対応内容
以下の4ツールにvalueProposition, usageExample, faqを追加しました。

### 1. bmi-calculator/meta.ts
- valueProposition (27字): 身長と体重を入力するだけでBMI値と肥満度判定がわかる
- usageExample: 身長170cm/体重65kgの入力例
- faq: (1)判定基準=日本肥満学会 (2)適正体重=BMI22相当 (3)子ども・高齢者は対象外

### 2. dummy-text/meta.ts
- valueProposition (32字): 段落数と文数を指定するだけで日本語・英語のダミー文章を生成できる
- usageExample: 日本語/2段落/3文ずつの入力例
- faq: (1)段落数・文数の上限=各1-20 (2)言語切替・コピー機能 (3)日本語テキストの出典

### 3. image-resizer/meta.ts
- valueProposition (25字): 画像をドロップするだけでリサイズ・形式変換ができる
- usageExample: 1920x1080 PNG→800px幅リサイズ例
- faq: (1)対応形式とサイズ上限=20MB (2)アスペクト比維持機能 (3)サーバー送信なし

### 4. qr-code/meta.ts
- valueProposition (30字): テキストやURLを入力するだけでQRコードを即座に生成できる
- usageExample: URL入力→SVG/PNGダウンロード例
- faq: (1)エラー訂正レベルL/M/Q/H (2)PNG形式ダウンロード (3)入力テキスト長の上限

## 確認事項
- TypeScript型チェック: エラーなし
- 既存フィールド: 変更なし
- フィールド追加順序: valueProposition → usageExample → faq（指示通り）
- valueProposition: 全て40字以内（最大32字）
- faq: 全てプレーンテキスト、2-3文、3件ずつ
- コードスタイル: 参照サンプル（json-formatter）と統一
