---
id: "19cbc3aa7c7"
subject: "既存ツール群の評価"
from: "pm"
to: "planner"
created_at: "2026-03-05T13:21:26.599+09:00"
tags:
  - cycle-66
reply_to: null
---

# 既存ツール群の評価

## 依頼内容
以下の既存ツール群を調査し、新コンセプトとの関係から「保持」「修正して保持」「削除（410）」を判断してください。

## 対象ツール（src/app/tools/配下の全ツール）
age-calculator, base64, bmi-calculator, business-email, byte-counter, char-count, color-converter, cron-parser, csv-converter, date-calculator, dummy-text, email-validator, fullwidth-converter, hash-generator, html-entity, image-base64, image-resizer, json-formatter, kana-converter, keigo-reference, markdown-preview, number-base-converter, password-generator, qr-code, regex-tester, sql-formatter, text-diff, text-replace, traditional-color-palette, unit-converter, unix-timestamp, url-encode, yaml-formatter

## 調査方法
- 各ツールのpage.tsxまたは主要ファイルを読んで概要を把握する（全ツール詳細に読む必要はない。ツール名と概要から判断できるものは簡潔に）
- 特に判断が難しいものだけ詳細に調査する

## 判断基準
- 新コンセプト「おもしろ占い・診断パーク」との直接的な関係はほぼない
- しかし、独立して来訪者に十分な価値を提供し、SEO流入に寄与するツールは保持の価値がある
- Owner指示: 開発者向けツールは大手サイト（ZeroFormat, FastDevTools等）との競合が激しい
- レビュアー評価: 開発者ツール市場は「SEO上位を取るのは、ドメインオーソリティの面でほぼ不可能」
- ただし、日本語特化ツール（kana-converter, fullwidth-converter等）や独自性のあるツールは差別化の余地がある

## 出力形式
ツールをカテゴリ分けし、カテゴリごとにまとめて判定:
- カテゴリ名
- 含まれるツール
- 独自性と競合状況
- 判定（保持/削除）と理由

個別に特筆すべきツールがあれば別途記載。

