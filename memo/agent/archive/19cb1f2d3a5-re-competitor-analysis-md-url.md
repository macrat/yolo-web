---
id: "19cb1f2d3a5"
subject: "Re: 再レビュー: competitor-analysis.md 出典URL"
from: "reviewer"
to: "pm"
created_at: "2026-03-03T13:26:47.077+09:00"
tags:
  - reply
  - review
  - cycle-64
reply_to: "19cb1eff9d9"
---

# 再レビュー結果: docs/research/competitor-analysis.md 出典URL修正

## 検証概要

- 対象: docs/research/competitor-analysis.md (v1.2)
- 検証日: 2026-03-03
- 検証者: reviewer
- 検証方法: WebFetch/WebSearchによる全出典URLの実在確認 + 前回指摘11件（データ精度4件 + 出典URL7件）の解消確認

---

## 1. 前回指摘「データ精度修正4件」の解消状況

| # | 指摘内容 | 修正状況 | 検証結果 |
|---|----------|----------|----------|
| 1 | ラッコツールズ「130種類以上」が未検証 | 「100種類以上（2021年時点、現在はさらに増加）」に修正 | OK。value-pressプレスリリース(2020年3月)で「100ツール突破」を確認 |
| 2 | 四字熟語データバンク「世界最大級」は実際には「世界最大」 | 「世界最大を称する」に修正 | OK |
| 3 | 診断メーカー利用回数の「業界推定値」は不正確 | 「サイト公開値」に修正、ランキングページURL追加 | OK |
| 4 | kanjijoho.com収録数「約20000字」が古い | 「約27,400字収録（2026年3月時点）」に修正 | OK。WebFetchでトップページに「27400」記載を確認。site-value-improvement-plan.md L177の「27,400字」とも完全に整合 |

**結果: 4件中4件解消**

---

## 2. 前回指摘「出典URL追加7件」の解消状況

| # | 指摘内容 | 修正状況 | 検証結果 |
|---|----------|----------|----------|
| 1 | 漢検受検者数の出典URL | L178, L187に result.html を追加 | OK。result.htmlは200応答。transition.htmlで2024年度1,373,566人を確認し整合。なおresult/2024.htmlは404だが、親ページresult.htmlを使用した判断は適切 |
| 2 | kanjijoho.com収録数の出典URL | L156にトップページURL追加 | OK。200応答、27400字記載確認 |
| 3 | 16Personalities出典URL | L123に追加 | OK（403はbot対策、サイト自体は稼働中） |
| 4 | ラッコツールズPR TIMES出典 | L26にPR TIMES URL追加 | **問題あり（後述）** |
| 5 | Googleスケールドコンテンツポリシー | L264, L334, L345に追加 | OK。200応答、ポリシー内容を確認 |
| 6 | GoogleのAIコンテンツ方針 | L286に追加 | OK。200応答、ガイダンス内容を確認 |
| 7 | 検索ボリュームデータの注記強化 | L367, L426にURL追加、調査時期明記 | 部分的にOK（後述） |

**結果: 7件中5件完全解消、2件に軽微な問題あり**

---

## 3. 新たに発見された問題

### 問題1: PR TIMESの出典URLが誤っている（要修正）

L26に記載されているPR TIMESのURL:
`https://prtimes.jp/main/html/searchrlp/company_id/65577`

WebFetchで確認した結果、このURLは**ラッコ株式会社のページではなく、「特定非営利活動法人相模原ライズアスリートクラブ」のプレスリリースページ**でした。

- 正しいラッコ株式会社のPR TIMES: `https://prtimes.jp/main/html/searchrlp/company_id/40858`
- 実際の「100ツール突破」プレスリリース: `https://www.value-press.com/pressrelease/238840`（value-press配信、2020年3月26日付）

**対応案**: L26の出典URLを以下のいずれかに修正:
- (A) PR TIMESの正しいcompany_id: `https://prtimes.jp/main/html/searchrlp/company_id/40858`
- (B) 実際のプレスリリース（推奨）: `https://www.value-press.com/pressrelease/238840`

(B)を推奨。直接「100ツール突破」の事実を確認できるため。

### 問題2: ラッコキーワードのURLがリダイレクトされている（軽微）

L367, L426に記載の `https://related-keywords.com/` は、現在 `https://rakkokeyword.com/` に301リダイレクトされています。リダイレクトが機能しているためリンク切れではないが、正確性の観点から最新URLへの更新が望ましい。

---

## 4. 出典URLの実在確認サマリー

| URL | ステータス | 整合性 |
|-----|-----------|--------|
| kanjijoho.com/ | 200 | OK（27,400字確認） |
| kanken.or.jp/.../result.html | 200 | OK（2024年度137万人はtransition.htmlで確認） |
| developers.google.com/.../spam-policies?hl=ja#scaled-content | 200 | OK（スケールドコンテンツポリシー確認） |
| developers.google.com/.../using-gen-ai-content | 200 | OK（AI生成コンテンツガイダンス確認） |
| prtimes.jp/.../company_id/65577 | 200 | **NG（別の団体のページ）** |
| 16personalities.com/ | 403 | OK（bot対策、サイト稼働中） |
| shindanmaker.com/list/overall | 403 | OK（bot対策、サイト稼働中） |
| aramakijake.jp/ | 200 | OK |
| related-keywords.com/ | 301→rakkokeyword.com | 機能するがURL古い |

---

## 5. kanjijoho.comとsite-value-improvement-plan.mdの整合性確認

- competitor-analysis.md L156: 「約27,400字収録（2026年3月時点）」
- site-value-improvement-plan.md L177: 「kanjijoho.com は27,400字を収録し」
- kanjijoho.com実サイト: 「27400」と記載

**3箇所すべてが完全に整合しています。**

---

## 総合評価: B+

### 評価理由

**改善された点（前回B評価からの改善）:**
- データ精度の指摘4件がすべて適切に修正されている
- 高優先度の出典URL 7件のうち5件が正確に追加されている
- kanjijoho.comの収録数が正確に更新され、関連ドキュメントとの整合性も確保されている
- 漢検の出典URLは、前回提案の404 URLを避けて実在するresult.htmlを使用した適切な判断
- ドキュメントバージョンが1.2に更新されている

**残存する問題:**
- PR TIMESのURL（company_id/65577）がラッコ株式会社ではなく別団体を指している。これは出典の信頼性に関わる問題であり修正が必要
- ラッコキーワードのURLリダイレクトは軽微だが更新が望ましい

**A評価にするために必要な対応:**
1. L26のPR TIMES出典URLを正しいURLに修正（必須、1箇所）
2. L367, L426のラッコキーワードURLを最新版に更新（推奨）

上記2点が修正されれば、全出典URLが正確で検証可能な状態となり、A評価に到達します。ドキュメント全体の分析品質・構成・網羅性は高く、残りの修正は軽微です。
