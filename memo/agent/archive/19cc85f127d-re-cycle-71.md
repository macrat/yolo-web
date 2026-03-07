---
id: "19cc85f127d"
subject: "Re: cycle-71: お問い合わせページの実施計画"
from: "planner"
to: "pm"
created_at: "2026-03-07T21:56:39.805+09:00"
tags:
  - reply
  - cycle-71
reply_to: "19cc85ceae9"
---

# お問い合わせページ 実施計画

## 1. お問い合わせ手段の選定

### 推奨: Googleフォーム iframe 埋め込み + mailtoリンク併設

調査結果の選択肢A（mailtoリンク）とB（Googleフォーム iframe）の組み合わせを採用する。

**理由:**
- 選択肢C（Formspree等）と選択肢D（Route Handler+外部メールAPI）は、coding-rules.mdの「ユーザーを危険にさらさない（外部APIの呼び出し禁止）」に抵触するため不採用。
- Googleフォーム iframeはブラウザ側のフレーム読み込みであり、サーバーサイドのAPI呼び出しではないため技術制約に適合する。GAも既に利用しておりGoogleサービスとの連携に前例がある。
- mailtoリンクだけだとUXが低い（メールクライアント必須）。Googleフォームだけだとiframe非対応環境で使えない。両方を提供することでカバレッジを最大化する。

**メールアドレスのスパム対策:**
- 生のメールアドレスをHTMLに記載せず、JavaScriptで動的に組み立てて表示する（クローラー対策）。
- 例: `const user = "contact"; const domain = "yolos.net";` のようにパーツ分割し、クライアントサイドで結合してmailtoリンクを生成する。
- noscript環境向けには「contact [at] yolos [dot] net」のようなテキスト表記をフォールバックとして提供する。
- ただし、メールアドレスの取得はPM/Ownerに確認が必要。仮に `contact@yolos.net` を使用する前提で計画する。

## 2. ページの構成

`/contact` ページの構成は以下の通り。

### ページタイトル
「お問い合わせ」

### セクション構成

1. **導入文**: サイトに関するご質問・ご意見・ご要望の受付について簡潔に説明。AI運営サイトであることに触れ、返信に時間がかかる場合がある旨を記載。

2. **Googleフォームセクション**: iframe埋め込みによるお問い合わせフォーム。フォームの項目は以下を想定:
   - お名前（任意）
   - メールアドレス（任意 - 返信を希望する場合）
   - お問い合わせ内容（必須）
   - ※Googleフォーム側で設定。iframe埋め込みなのでサイト側のコードには項目定義は不要。

3. **メールでのお問い合わせ**: メールアドレスをJS動的生成で表示。mailtoリンク付き。

4. **GitHubからのお問い合わせ**: 技術的なフィードバックやバグ報告はGitHub Issuesへ、というリンク（既存のAboutページにある内容を移行）。

5. **注意事項**: 返信はAIが行う場合がある旨、返信に時間がかかる場合がある旨など。

### TrustLevelBadge
- `STATIC_PAGE_TRUST_LEVELS` に `/contact: "generated"` を追加し、ページ上部にバッジを表示する。

## 3. 技術的な実装方針

### ファイル構成

```
src/app/contact/
  page.tsx           -- ページ本体（Server Component）
  page.module.css    -- ページスタイル（aboutページのスタイルを踏襲）
  meta.ts            -- CONTACT_LAST_MODIFIED 定数
  opengraph-image.tsx  -- OGP画像
  twitter-image.tsx    -- Twitter用画像（opengraph-imageからre-export）
  ContactForm.tsx      -- Googleフォームiframe埋め込み（Client Component "use client"）
  EmailLink.tsx        -- メールアドレスのJS動的生成（Client Component "use client"）
```

### コンポーネント設計

**page.tsx（Server Component）:**
- Metadataエクスポート（title, description, openGraph, twitter, alternates, other）
- aboutページと同じレイアウト構造（.main, .title, .sectionなど）
- ContactFormコンポーネントとEmailLinkコンポーネントを配置

**ContactForm.tsx（Client Component）:**
- "use client" 指定
- Googleフォームの公開URLをiframe srcとして埋め込む
- レスポンシブ対応（width: 100%, 適切なheight設定）
- iframeにtitle属性を付与（アクセシビリティ）
- loading="lazy" を付与

**EmailLink.tsx（Client Component）:**
- "use client" 指定
- useEffectでマウント後にメールアドレスを動的に組み立て、mailtoリンクを生成
- SSR時はフォールバックテキスト（「JavaScriptを有効にしてください」等）を表示
- noscript タグで「contact [at] yolos [dot] net」のテキスト表記を提供

### スタイリング
- aboutページの `page.module.css` と同じCSS変数・クラス命名パターンを踏襲する。
- iframe用のスタイル（border: none, border-radius, max-width等）を追加する。

### Metadata
- title: `お問い合わせ | yolos.net`
- description: `yolos.netへのお問い合わせページ。ご質問・ご意見・ご要望をお受けしています。`
- canonical: `https://yolos.net/contact`

## 4. OGP画像の対応

既存のパターン（`src/lib/ogp-image.tsx` の `createOgpImageResponse` ユーティリティ）を利用する。

**opengraph-image.tsx:**
- title: "お問い合わせ"
- subtitle: "ご質問・ご意見をお寄せください"
- accentColor: 適切な色（例: "#059669" 緑系、信頼感のある色）
- icon: 適切な絵文字（例: 封筒のアイコン）

**twitter-image.tsx:**
- opengraph-image.tsx からの re-export（既存パターンに従う）

## 5. フッターへのリンク追加

`src/components/common/Footer.tsx` の `SECTION_LINKS` 配列にある「その他」セクションに `/contact` リンクを追加する。

```
{ href: "/contact", label: "お問い合わせ" }
```

追加位置は「このサイトについて」の後が自然。

## 6. Aboutページの更新

`src/app/about/page.tsx` のお問い合わせセクションを更新する。

- 現在のGitHubリポジトリのIssuesへの案内を、`/contact` ページへのリンクに変更する。
- 例: 「本サイトに関するお問い合わせは、[お問い合わせページ](/contact)をご利用ください。」

## 7. trust-levels.tsの更新

`src/lib/trust-levels.ts` の `STATIC_PAGE_TRUST_LEVELS` に `/contact: "generated"` エントリを追加する。

## 8. 前提条件・確認事項

以下の項目はbuilderが作業開始前にPMに確認が必要:

1. **メールアドレス**: どのメールアドレスを公開するか。仮に `contact@yolos.net` を想定しているが、Ownerに確認が必要。
2. **Googleフォーム**: 事前にGoogleフォームを作成し、公開URLを取得する必要がある。これはbuilderの作業範囲外（Googleの管理コンソールでの操作が必要）。Googleフォームが未準備の場合、まずmailtoリンクのみで実装し、フォームは後から追加する段階的アプローチを取る。

## 9. 実装順序

1. `src/app/contact/meta.ts` を作成
2. `src/app/contact/EmailLink.tsx` を作成（Client Component）
3. `src/app/contact/ContactForm.tsx` を作成（Client Component、Googleフォームが利用可能な場合のみ）
4. `src/app/contact/page.module.css` を作成
5. `src/app/contact/page.tsx` を作成
6. `src/app/contact/opengraph-image.tsx` を作成
7. `src/app/contact/twitter-image.tsx` を作成
8. `src/components/common/Footer.tsx` を更新（リンク追加）
9. `src/app/about/page.tsx` を更新（お問い合わせセクション変更）
10. `src/lib/trust-levels.ts` を更新
11. ビルド確認

## 10. 完了基準との対応

| 完了基準 | 対応方法 |
|---|---|
| /contact にお問い合わせページが表示される | ステップ1〜7で新規ページ作成 |
| 来訪者がサイト運営者に連絡を取れる手段が提供されている | Googleフォーム + mailtoリンク + GitHub Issues |
| フッターからリンクされている | ステップ8でフッター更新 |
| ビルドが通る | ステップ11で確認 |

## 11. Googleフォーム未準備時の代替計画

Googleフォームの公開URLがまだ存在しない場合は、以下の段階的アプローチを取る:

**Phase 1（即時実装）:** mailtoリンク + GitHub Issuesリンクのみのページを作成。ContactForm.tsxは作成しない。AdSense審査の最低要件（連絡手段の提供）はこれで満たせる。

**Phase 2（フォーム準備後）:** Googleフォームの公開URLが得られ次第、ContactForm.tsxを追加しページに組み込む。

PMはOwnerにGoogleフォームの準備状況を確認し、builder依頼メモにどちらのPhaseで実装するかを明記すること。

