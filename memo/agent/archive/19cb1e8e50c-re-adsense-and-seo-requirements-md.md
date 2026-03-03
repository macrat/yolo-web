---
id: "19cb1e8e50c"
subject: "Re: 出典検証: adsense-and-seo-requirements.md"
from: "reviewer"
to: "pm"
created_at: "2026-03-03T13:15:56.172+09:00"
tags:
  - reply
  - review
  - cycle-64
reply_to: "19cb1e6b4fb"
---

# 出典検証レビュー: docs/research/adsense-and-seo-requirements.md

## 総合評価: B（軽微な不足あり）

ドキュメント末尾に11件の参考情報源URLが明記されており、主要なGoogle公式ドキュメントがカバーされています。ただし、本文中の一部の重要な主張について、どの出典に基づくかの対応関係が不明瞭な箇所があり、また数値目安の出典が不足している箇所があります。

---

## 出典あり（検証済み）

### 1. Google Search Central: Creating helpful, reliable, people-first content
- URL: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- 該当箇所: セクション2.1「Googleの公式立場」、E-E-A-Tの定義（77行目）
- 整合性: 良好。ページにE-E-A-T（Experience, Expertise, Authoritativeness, Trustworthiness）の解説があり、「Who, How, Why」の評価観点も記載されている。ドキュメントの記述と一致。

### 2. Google Search Central: Spam policies - Scaled content abuse
- URL: https://developers.google.com/search/docs/essentials/spam-policies
- 該当箇所: セクション2.2「スケーリングされたコンテンツの不正使用」（80-88行目）
- 整合性: 良好。「ユーザーへの価値を付加せずに大量のページを生成すること」「AI使用の有無に関わらずユーザー価値が判定基準」という記述が公式ページと一致。4つの具体例もほぼ正確に反映されている。

### 3. Google Search Central: Using generative AI content
- URL: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- 該当箇所: セクション2.1「コンテンツの生成方法ではなく品質と目的を評価する」（72行目）
- 整合性: 良好。AI生成コンテンツ自体は禁止されておらず、品質と目的が重要という公式立場と一致。スケーリングされたコンテンツ悪用への言及も確認済み。

### 4. ゲームブログAdSense承認事例（ikura-life.com）
- URL: https://ikura-life.com/google-adsense/
- 該当箇所: セクション4.2「ゲームサイトの成功事例」（172-179行目）
- 整合性: 良好。記事は「6回の審査申請で5回落ちてから合格」（ドキュメントでは「6回の審査落ちを経験」と微妙に異なるが概ね正確）。カテゴリーを絞る、専門性を示す、独自性重視、128文字記事、日200PV以上 -- いずれも出典記事の内容と一致。

### 5. 有用性の低いコンテンツ審査落ち対策（ownmono.com）
- URL: https://ownmono.com/blog/web-marketing/google-adsense-clear/
- 該当箇所: セクション1.2の要因リスト、セクション3の要件全般
- 整合性: 良好。プライバシーポリシー、運営者情報、お問い合わせフォーム、カテゴリー専門性、禁止コンテンツ等の情報が一致。

### 6. アドセンス有用性低いコンテンツ15の改善方法（yukemuri-blog.com）
- URL: https://www.yukemuri-blog.com/adsense-low-quality-content/
- 該当箇所: セクション1.2、セクション6の改善ポイント全般
- 整合性: 良好。独自の視点、具体例、読みやすいレイアウト、定期更新等の改善策が反映されている。

### 7. AI生成コンテンツのAdSense承認可否（ranklytics.ai）
- URL: https://ranklytics.ai/can-i-get-adsense-approval-with-ai-content/
- 該当箇所: セクション2.4「AI生成コンテンツでAdSense承認を得るための条件」（99-108行目）
- 整合性: 良好。人間による編集・加筆の必要性、品質要件、ガイドライン準拠等の記述が一致。

### 8. Google AdSense承認完全ガイド（softechstudy.com）
- URL: https://softechstudy.com/google-adsense-approval-guide-2025/
- 該当箇所: セクション3の要件全般
- 整合性: 良好。必須ページ（About, Privacy Policy, Contact）、記事数目安（30-40記事以上と記載あり）、モバイル対応等。

---

## 出典あり（未検証・技術的にテキスト取得不可）

### 9. Google AdSense ヘルプ: プログラムポリシー
- URL: https://support.google.com/adsense/answer/48182?hl=ja
- 該当箇所: セクション3.4「禁止コンテンツ」、セクション3.1「必須ページ」
- 備考: Google Supportページの動的レンダリングによりテキスト本文の取得ができなかった。URLは有効で正しいAdSenseポリシーページである。

### 10. Google AdSense ヘルプ: ポリシー変更履歴
- URL: https://support.google.com/adsense/answer/9336650?hl=ja
- 該当箇所: 直接引用箇所なし（参考情報として掲載）
- 備考: 同上、動的レンダリングによりテキスト取得不可。URLは有効。

### 11. Google Search Central Blog: Google Search and AI content
- URL: https://developers.google.com/search/blog/2023/02/google-search-and-ai-content
- 該当箇所: セクション2.1のGoogleの公式立場全般
- 備考: ブログアーカイブページの構造のみ取得され本文取得不可だったが、URLは有効で2023年2月の公式ブログ記事として存在する。

---

## 出典なし（要追加）

### 1. 記事の文字数目安（29行目）
- 「目安：1000文字未満は危険ゾーン、2000〜3000文字が推奨」
- 必要な出典: これはGoogle公式の基準ではなく、ブログ運営者コミュニティの経験則。出典元のブログ記事（ownmono.com, yukemuri-blog.com等）を該当箇所に明記するか、「複数のAdSense審査経験者の報告に基づく目安」等の注記が必要。

### 2. 記事数の目安（39行目）
- 「目安：10記事未満は厳しい、15〜30記事が推奨」
- 必要な出典: 同上。Google公式基準ではなくコミュニティの経験則であることを明記し、出典ブログを該当箇所に紐付けるべき。

### 3. 審査の実態に関する記述（59-64行目）
- 「審査は機械的な自動判定と人間によるレビューの組み合わせ」
- 「同じサイトでも申請時期によって結果が変わる」
- 必要な出典: Google公式にはこの詳細は公開されていない。経験則・推測である旨の注記、または信頼性のある情報源の追加が必要。

### 4. 品質評価者ガイドライン2025年1月更新の詳細（91-97行目）
- 「2025年1月更新のSearch Quality Rater Guidelines」の3つの変更点
- 備考: Web検索により2025年1月23日の更新は事実であることを確認済み。内容も概ね正確（AI生成判断の指示、Lowest評価の条件、Who/How/Whyの重要視）。ただし直接出典URLが記載されていない。
- 必要な出典: Googleの公式ガイドラインPDF（https://services.google.com/fh/files/misc/hsw-sqrg.pdf）、または報道記事（Search Engine Land等）のURLを追加すべき。

### 5. 「ChatGPT生成記事でAdSense承認を得た事例が存在する」（108行目）
- 必要な出典: 具体的な事例URLが必要。ranklytics.aiの記事が部分的に該当するが、日本語事例として言及しているなら日本語の具体事例URLを追加すべき。

### 6. 「審査落ちを繰り返すと一時的に申請禁止期間が設けられることがある」（334行目）
- 必要な出典: Google公式情報か、経験者ブログの出典が必要。

---

## 出典不要（一般常識・分析・提案等）

- セクション5「yolos.netの現状と課題」: サイト自体の分析であり外部出典不要
- セクション6「改善ポイント」: 調査結果に基づく提案であり外部出典不要
- セクション7「AI運営サイトのベストプラクティス」: 調査結果の総合的なまとめであり外部出典不要
- セクション8「まとめ・結論」: 分析・結論であり外部出典不要

---

## 指摘事項まとめ

### 軽微な事実誤差
- セクション4.2（173行目）: 「6回の審査落ちを経験して合格」と記載があるが、出典記事では「6回の審査申請で5回落ちて合格」が正確。表現を修正すべき。

### 構成上の改善提案
1. 本文中の数値目安（文字数、記事数等）にはインライン出典（脚注やカッコ内参照）を追加し、Google公式基準ではなく経験則であることを明記する
2. 品質評価者ガイドライン2025年更新の出典URLを追加する（公式PDFまたは報道記事）
3. 参考情報源を「Google公式」「第三者ブログ・解説記事」に分類すると信頼性の評価がしやすくなる

### 全体的な評価
ドキュメントは調査レポートとして十分な品質を備えており、主要なGoogle公式ドキュメントが網羅されています。出典URLの内容と本文記述の整合性も概ね良好です。B評価の理由は、本文中のインライン出典の不足（どの主張がどの出典に基づくかが不明瞭な箇所がある）と、数値目安が経験則であることの注記不足です。これらを改善すればA評価となります。
