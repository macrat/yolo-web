---
title: "AI画像生成API技術調査（Imagen 4中心、DALL-E 3・Stable Diffusion APIとの比較含む）"
date: "2026-03-20"
purpose: "AI画像生成APIのyolos.netへの導入可能性を調査し、4要件（APIキー非公開・料金制限・AI任意呼出・掲載可否判断）の実現方法を明らかにする"
method: "Google公式ドキュメント、Gemini API料金ページ、Vertex AIドキュメント、開発者ブログ、AI画像生成API料金比較記事等の調査"
sources: "Imagen API公式ドキュメント, Gemini API料金ページ, Vertex AIドキュメント, Imagen 4 GA発表ブログ, AI画像生成API料金比較2026(intuitionlabs.ai)"
---

# Imagen 4 API 技術調査結果

## 1. API仕様

### 利用可能なモデル（2026年3月GA）

| モデル   | モデルID                        | 最大解像度      |
| -------- | ------------------------------- | --------------- |
| Standard | `imagen-4.0-generate-001`       | 2048×2048（2K） |
| Ultra    | `imagen-4.0-ultra-generate-001` | 2048×2048（2K） |
| Fast     | `imagen-4.0-fast-generate-001`  | 1408×768        |

### アクセス経路

- **Gemini API（推奨）**: `@google/genai` NPMパッケージ、APIキー認証、シンプル
- **Vertex AI**: サービスアカウント認証、大規模向け

### 主要パラメータ

- `numberOfImages`: 1〜4
- `aspectRatio`: 1:1, 3:4, 4:3, 9:16, 16:9
- `imageSize`: 1K/2K
- `personGeneration`: 人物生成の制御
- プロンプト上限: 480トークン（テキストのみ）

## 2. 料金体系

| モデル   | 1枚あたり |
| -------- | --------- |
| Fast     | $0.02     |
| Standard | $0.04     |
| Ultra    | $0.06     |

- **無料枠はない**（Google AI Studioでの手動テストのみ無料）
- 月200枚生成で$4、月500枚で$10と導入障壁は非常に低い

## 3. 利用規約

- 商用利用可能。Googleは生成画像の所有権を主張しない
- 有料プランではデータがGoogleの学習に使われない
- すべての生成画像にSynthIDウォーターマーク（不可視電子透かし）とC2PAメタデータを自動付与
- 暴力・性的・ヘイト等のコンテンツは自動フィルタリング

## 4. 画像品質

- 日本語プロンプト対応（ただし内部で英語翻訳して処理）
- 高精度が必要な場合は英語プロンプト推奨
- OGP画像向けの16:9アスペクト比に対応
- 画像内テキスト描画精度が大幅向上（1フレーズ25文字、2〜3フレーズまで推奨）

## 5. レート制限

| ティア         | 1分あたり画像数（IPM） |
| -------------- | ---------------------- |
| Tier 1（有料） | 10 IPM                 |
| Tier 2         | 20 IPM                 |
| Tier 3         | 100 IPM以上            |

## 6. 4要件の実現可能性

### APIキー非公開

Next.jsのAPI Route（`app/api/`配下）でサーバーサイドのみから呼び出す標準的な方法で対応可能。

### 利用料金制限

GoogleネイティブのハードなAPI上限機能は現時点で未実装（開発中）。アプリケーション内に月間カウンター機構を自前実装することで代替可能。Cloud Billing通知による自動停止も可能だが最大24時間の遅延がある。

### AI任意呼出

Next.js API Routeとして`POST /api/generate-image`エンドポイントを作成し、AIエージェントが呼び出す構成が実現可能。または直接Node.jsスクリプトからSDKを呼び出す形でも動作する。

### 掲載可否判断

Googleのセーフティフィルターで基本的な安全性は担保される。コンテキスト的な適否（記事との関連性・品質）はGemini Visionによる自動評価 + 重要ページは人間レビューの組み合わせが現実的。

## 7. 代替サービスとの比較

| サービス             | 1枚あたり    | 特徴                                      |
| -------------------- | ------------ | ----------------------------------------- |
| Imagen 4 Fast        | $0.02        | Google製、SynthID自動付与、Gemini API統合 |
| Imagen 4 Standard    | $0.04        | 高品質、商用利用可                        |
| DALL-E 3             | $0.04〜$0.08 | OpenAI製、ChatGPT統合                     |
| Stable Diffusion API | 変動         | オープンソース、セルフホスト可            |

## Sources

- [Imagen API (Gemini) 公式ドキュメント](https://ai.google.dev/gemini-api/docs/imagen)
- [Imagen 4 モデル一覧](https://ai.google.dev/gemini-api/docs/models/imagen)
- [Gemini API 料金](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini API レート制限](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Gemini API 利用規約](https://ai.google.dev/gemini-api/terms)
- [Imagen 4 on Vertex AI ドキュメント](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/imagen/4-0-generate)
- [Imagen 責任あるAIガイドライン](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/responsible-ai-imagen)
- [Imagen 4 Fast GA発表ブログ](https://developers.googleblog.com/announcing-imagen-4-fast-and-imagen-4-family-generally-available-in-the-gemini-api/)
- [Cloud Billing バジェット設定](https://docs.google.com/billing/docs/how-to/budgets)
- [課金のプログラム的無効化](https://docs.google.com/billing/docs/how-to/disable-billing-with-notifications)
- [AI画像生成API料金比較2026](https://intuitionlabs.ai/articles/ai-image-generation-pricing-google-openai)
