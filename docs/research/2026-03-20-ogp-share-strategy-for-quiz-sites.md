---
title: OGP画像ベストプラクティスとクイズ・診断サイトのシェア戦略
date: 2026-03-20
purpose: サイクル112の計画立案のため、SNSシェア画像（OGP画像）のベストプラクティスと、クイズ・診断サイトでの効果的なシェア戦略を調査する
method: >
  "OGP画像 推奨サイズ 2025 X Twitter LINE Facebook",
  "OGP image best practices 2025 quiz site viral share",
  "Next.js ImageResponse OGP画像生成 ベストプラクティス 2025",
  "診断サイト クイズ シェア画像 バイラル 戦略 日本",
  "16Personalities BuzzFeed quiz share image design viral pattern",
  "X Twitter 診断 クイズ ハッシュタグ 効果的 2025",
  "Twitter share text length optimal characters engagement quiz result Japan",
  "LINE シェア 最適 テキスト 形式 文字数 OGP",
  "OGP画像 クリック率 改善 デザイン 文字量 コントラスト",
  "X Twitter ハッシュタグ 個数 1つ 2つ 効果 診断コンテンツ 2025",
  "Next.js opengraph-image.tsx route handler cache headers fonts Japanese 2025",
  "viral personality quiz share result teaser curiosity gap social media strategy"
sources:
  - https://web-hiroshima.com/blog/seo/4931/
  - https://sdesignlabo.com/web/ogp-size/
  - https://mieru-ca.com/blog/ogp/
  - https://cocorograph.co/knowledge/og-image-size/
  - https://myogimage.com/blog/og-image-tips-2025-social-sharing-guide
  - https://www.krumzi.com/blog/open-graph-image-sizes-for-social-media-the-complete-2025-guide
  - https://nextjs.org/docs/app/api-reference/functions/image-response
  - https://gaiax-socialmedialab.jp/post-48330/
  - https://outgrow.co/blog/viral-quiz-copywriting-tactics-that-work
  - https://www.cocorochikai.com/x-tips-hashtag/
  - https://tinsalo0425.com/magazine/hashtag-iminai/
  - https://www.ownly.jp/sslab/twitter-hashtag
---

# OGP画像ベストプラクティスとクイズ・診断サイトのシェア戦略

## 1. OGP画像のベストプラクティス（2025-2026年最新）

### 1.1 SNS別推奨画像サイズ

#### 共通推奨サイズ

2026年現在、複数SNSに最も対応しやすい標準サイズは **1200px × 630px（アスペクト比 16:9 相当、正確には約1.91:1）** である。

| SNS            | 推奨サイズ                        | アスペクト比           | 備考                                             |
| -------------- | --------------------------------- | ---------------------- | ------------------------------------------------ |
| X（旧Twitter） | 1200 × 630px                      | 1.91:1                 | スマートフォンでは左右がトリミングされる場合あり |
| Facebook       | 1200 × 630px                      | 1.91:1                 | PC・スマホ両対応                                 |
| LINE           | 1200 × 630px（中央630×630px重視） | 1.91:1（表示は正方形） | LINEは中央部を正方形にクロップして表示           |

#### LINE対応の重要な注意点

LINEはOGP画像を **中央の正方形（630 × 630px 相当）にクロップして表示する**。そのため、1枚の画像で複数SNSに対応する場合は、重要なテキストや視覚要素をすべて **画像中央の630×630px以内に収める** 必要がある。

実装上の推奨設計：

- 全体サイズ：1200 × 630px
- セーフゾーン（全SNS共通で安全な領域）：中央の630 × 630px
- セーフゾーン外（横の余白285px × 2）：背景・装飾的要素のみ配置可

#### ファイル形式と容量

- 形式：PNG（テキスト・グラフィック中心）または JPEG（写真中心）
- 容量：5MB以下を厳守（SNSがキャッシュ・表示失敗を起こす場合がある）
- 実用的な目標：100KB〜500KB未満（表示速度を考慮）

### 1.2 クリック率を高めるOGP画像のデザイン原則

#### テキスト配置とフォントサイズ

- **テキスト量は画像面積の20%以下**に抑える。テキストが多すぎると小さい画面で読めなくなる
- フォントサイズは画像縦幅（630px）の **10〜15%**（63〜95px相当）が目安
- テキストは一目で内容が伝わる **15文字前後** のコピーが理想
- キャッチコピー・タイトルは **中央または上部**に、ロゴ・ブランド名は **右下または左下に控えめに**配置

#### 色・コントラスト

- 背景と文字の **コントラスト比は4.5:1以上**（大きい文字の場合は3:1以上）が視認性の基準
- 補色の組み合わせ（例：青系背景＋オレンジ系テキスト）はSNSフィードで目立つ
- 写真背景の場合は **半透明の黒オーバーレイ** をテキスト下に重ねて可読性を確保
- 画像下部はブラー・グラデーションが文字配置しやすく効果的

#### 心理的・視覚的効果

- **人物の顔や視線** を使うと自然と目が集まり、クリック率が上がる傾向がある
- OGPを最適化したコンテンツはクリック数が **最大3倍** になるという報告がある（Simplified調査）
- 余白（ホワイトスペース）を意識した **清潔感のあるレイアウト**が主要メッセージを際立たせる

#### クイズ・診断サイト固有の設計

- 結果タイプ名（例：「INFJ型」「直感タイプ」）を **大きく・中央に** 表示する
- アイコンや結果に対応するビジュアル（キャラクター、動物、色帯など）を添える
- 「あなたは〇〇です」という **1文の断定的メッセージ**がシェア画像として機能しやすい
- バッジ・称号・レア度表示（「上位8%」など）は自己表現欲求を刺激しシェアを促進する

### 1.3 Next.js ImageResponse APIのベストプラクティス

#### 基本実装

```typescript
// app/quiz/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({ params }) {
  // フォント読み込み（日本語対応の場合は必須）
  const fontData = await fetch(
    new URL('../../../assets/fonts/NotoSansJP-Bold.ttf', import.meta.url)
  ).then(res => res.arrayBuffer())

  return new ImageResponse(
    <div style={{ /* JSXレイアウト */ }}>
      {/* コンテンツ */}
    </div>,
    {
      ...size,
      fonts: [{ name: 'NotoSansJP', data: fontData, weight: 700 }],
    }
  )
}
```

#### 重要な技術的注意点

**Edge Runtimeの必須指定**
`export const runtime = 'edge'` を指定することで、エッジ関数として動作しユーザーに近い場所で高速レスポンスが得られる。

**日本語フォントの扱い**

- ImageResponseはデフォルトでラテン文字フォントのみ内蔵。**日本語テキストには必ずNoto Sans JPなどのCJKフォントを外部から読み込む必要がある**
- バンドルサイズの上限が **500KB（フォント・画像・コード合計）** のため、フォントのサブセット化が重要
- フォントはfetch()でArrayBufferとして取得し、`fonts`オプションに渡す

**対応するCSSプロパティ**
ImageResponse（内部的にSatoriとResvgを使用）はCSSのサブセットのみ対応：

- Flexboxレイアウト（`display: flex`）は対応
- Grid、position: sticky等は**非対応**
- absolute positioningは対応

**キャッシュ戦略**

- `opengraph-image.tsx` はデフォルトでNext.jsによりキャッシュされる
- 動的コンテンツ（ユーザー固有の結果画像など）はCache-Controlヘッダーで `no-store` または短い TTL を指定する
- 静的なテンプレート画像は長期キャッシュ可能（`max-age=86400` など）

**ファイル規約（App Router）**
`app/[path]/opengraph-image.tsx` に配置することで、そのルートの `og:image` メタタグが自動生成される。`twitter-image.tsx` も同様。

---

## 2. クイズ・診断サイトのシェア戦略

### 2.1 人気サービスのシェア画像の特徴

#### 16Personalities（MBTI）

- 結果タイプ名（例：「INTJ-A」）を画面の大部分を占める大きさで表示
- タイプごとに固有のカラーコードと抽象的なキャラクターアイコンを使用
- 「建築家」「仲介者」など**詩的なラベル名**がシェア欲求を高める
- 結果ページのURLがそのままSNSシェア対象になり、OGP画像が結果カードとして機能

#### BuzzFeedクイズ

- 結果タイトルを画像上に大きく重ねる**テキストオーバーレイ型**
- 問いかけ形式のタイトル（「あなたは何タイプ？」）がクリック前の好奇心を煽る
- 「I got [Result Name]!」という定型フォーマットのシェアテキストが確立されている
- 鮮やかな写真素材に太字の白テキストが多用される

#### 診断メーカー（日本）

- テキストオンリーまたはシンプルなグラフィックのカード型
- 結果テキストをそのままツイートに含める文化が定着（画像より文字でシェアされることが多い）

### 2.2 バイラルになりやすいシェア画像の共通パターン

#### アイデンティティ・バッジ型

人は自分のアイデンティティを表現するコンテンツをシェアする。効果的な要素：

- **タイプ名 + 属性説明**（例：「論理的思考タイプ / 分析力に優れた戦略家」）
- **希少性の演出**（「このタイプは全体の8%」）
- **肯定的・称賛的な言葉**（ネガティブな結果はシェアされにくい）

#### 対比・比較型

- 「〇〇タイプの人の特徴」という形式で他者への関心を引く
- 友達と結果を見せ合いたいという**社会的欲求**を活用

#### 感情的ピーク活用

シェアボタンは**結果が表示された直後の感情的な高まりのタイミング**に表示することが最も効果的。スクロールした後の位置より、結果の直下・オーバーレイが効果的。

#### チラ見せ戦略（Curiosity Gap）

- 結果の概要のみ見せ、詳細は「実際にやってみよう」と誘導
- シェアテキストに「詳細は見てみて」「診断してみると面白いよ」などを含める
- OGP画像では**結果タイプ名のみ表示し、説明文はページ内に**という設計も有効
- フルの分析結果は共有URLにアクセスした人向けに提供するハイブリッド戦略

### 2.3 効果的なシェアテキストのフォーマット

#### 基本テンプレート（Xシェア）

```
私は「[結果タイプ名]」でした！
[タイプの簡単な説明1〜2文]

あなたのタイプは？→ [URL]
#[コンテンツ名] #[診断ジャンル]
```

#### 感情を引き出すバリエーション

```
◆当たりすぎて笑った
「[驚くような特徴]」ってまさに私のことやん…

→ [診断名・URL]
```

```
[友達の名前]と一緒にやったら
私「[タイプA]」
あの子「[タイプB]」
意外な結果に！みんなはどのタイプ？
```

---

## 3. ハッシュタグ戦略

### 3.1 2025年のX（Twitter）ハッシュタグの実態

**重要な変化**：2025年時点でXのアルゴリズムは大きく変化しており、Grok（XのAI）が投稿の**文脈を意味的に解析できるようになった**。多くのケースでハッシュタグなしの投稿がエンゲージメントで上回ることがある。

#### ハッシュタグの推奨個数

| 個数       | 評価               | 理由                                     |
| ---------- | ------------------ | ---------------------------------------- |
| 0個        | 普通（状況による） | 発見されにくいがスパム扱いされない       |
| **1〜2個** | **最適**           | 発見しやすさとスパム回避のバランスが最良 |
| 3個        | 許容範囲           | やや読みにくくなる                       |
| 4個以上    | 非推奨             | リーチが落ちる傾向、スパム判定のリスク   |

X公式も **1投稿あたり2個まで** を推奨している。自作・独自タグは1投稿1個まで。

### 3.2 診断・クイズ系コンテンツで有効なハッシュタグ

#### 汎用的な診断タグ（実績あり）

- `#診断` ：汎用性が高く検索ボリュームも大きい
- `#性格診断` ：性格・パーソナリティ系コンテンツ向け
- `#MBTI` ：Z世代を中心に2023年以降定着した国際的タグ
- `#心理テスト` ：ライトな診断コンテンツ向け

#### コンテンツ特化タグ（例）

- `#アニメキャラ診断`、`#推しキャラ診断` などコンテンツ名を含むタグ
- `#相性診断`、`#タイプ診断` など結果形式を含むタグ

#### ハッシュタグ戦略の推奨

1. **コンテンツ名のタグ（独自）1個** ＋ **ジャンルタグ（汎用）1個** の2個構成が最適
2. 例：`#キャラ相性診断 #性格診断`
3. トレンドタグに無理やり乗ろうとしない（関連性のないタグはアルゴリズムに不利）
4. 広告・有料プロモーションではハッシュタグ使用不可になった（2025年6月〜）

---

## 4. 共有テキストのベストプラクティス

### 4.1 X（Twitter）での最適な共有テキスト

#### 文字数の目安

- 日本語ツイートは1文字が占める情報量が英語の約3倍。実際のユーザーは **平均15〜50文字** 程度で必要な情報を表現できる
- URL（t.co短縮後23文字固定）＋ハッシュタグ2個（計20〜30文字）を考慮すると、本文は **70〜100文字** 程度が読みやすい
- 英語の調査では71〜100文字のツイートが最もリツイート率が高いという結果があるが、日本語の場合は文字密度が高いため、**30〜60文字の本文**でも十分な情報量になる

#### 効果的な構成要素

1. **結果の断言**（「私は〇〇タイプでした」）
2. **感情的反応**（「当たりすぎて笑った」「意外すぎる」）
3. **好奇心を煽る問いかけ**（「あなたは？」）
4. **URL**
5. **ハッシュタグ 1〜2個**

#### チラ見せのテクニック

- 結果の**ラベル名だけ見せ**、詳細の説明は含めない（詳細を見たければURLをクリックさせる）
- 「信じられないくらい当たった」等の**感情的なリアクション**を添えることで、フォロワーの好奇心が高まる
- **「何タイプか聞いてみよう」「みんなのタイプも気になる」** という社会的な呼びかけがリプライやシェアを促進する

#### X投稿テンプレート

```
「[結果タイプ名]」が私すぎた…😂
細かいとこまで当たってて怖い

あなたは何タイプ？
[URL]
#[コンテンツ名]
```

```
[コンテンツ名]やったら
[結果タイプ名] でした！

[短い特徴説明、1文]
ぜひやってみて→[URL]
```

### 4.2 LINEでの最適な共有テキスト形式

#### LINEの特性

- LINEは**1対1またはグループチャット**での個人的なシェアが中心
- 投稿が「つぶやき」ではなく「メッセージ」の文化のため、**親しみやすい口語体**が効果的
- OGP画像が中央正方形にクロップされるため、画像内の重要情報は中央に集中させる

#### LINEシェアテキストの推奨形式

```
[コンテンツ名]やってみたよ！
私は[結果タイプ名]だった🎉
[URL]
```

- **短くシンプル**にする（LINEトーク画面での読みやすさを優先）
- **1〜2行程度**が最適（長文は読まれにくい）
- 絵文字1〜2個は自然な会話感を演出するが、過剰は逆効果
- 「やってみて！」という直接的な行動促進も有効

#### og:descriptionの文字数

LINEのOGP descriptionは **80〜90文字が最適**とされている。診断サイトの場合、コンテンツの概要や「あなたのキャラクターとの相性を診断」などのキャッチコピーを収める。

### 4.3 Facebook向けシェア

Facebookは日本のクイズ・診断サイトでのシェアが他SNSより少なく、ターゲット優先度は低い場合が多い。OGP画像サイズ（1200×630px）はX・LINEと共通で問題ない。

---

## 5. yolos.net実装への示唆

### 5.1 OGP画像設計の優先事項

1. **結果専用OGP画像**を動的に生成する（静的な汎用画像ではなく結果に応じた画像を出力）
2. 1200×630pxで作成し、**中央630×630pxに重要要素を集中**（LINE対応）
3. 日本語テキスト表示のため **Noto Sans JPのサブセット** をImageResponseに組み込む
4. バンドルサイズ制限（500KB）のため、フォントは使用グリフを絞ったサブセット版を使用
5. `export const runtime = 'edge'` によるエッジ関数化で表示速度を確保

### 5.2 シェア促進設計

1. **シェアボタンを結果表示直後**（感情的ピーク）に配置する
2. Xシェアテキストには **テンプレートを事前定義**し、ユーザーが編集しやすい形で提供
3. ハッシュタグは **コンテンツ固有タグ + ジャンルタグの2個構成**
4. 結果ページの **OGPタイトル**にタイプ名を含める（例：「あなたはINFJ型でした | キャラ診断」）
5. **チラ見せ原則**：OGP画像ではタイプ名のみ、詳細説明はページ内でのみ見られる設計

### 5.3 実装優先度

| 優先度 | 施策                                      | 期待効果                               |
| ------ | ----------------------------------------- | -------------------------------------- |
| 高     | 結果ページのOGP動的生成（ImageResponse）  | シェア時の見栄えが改善、クリック率向上 |
| 高     | Xシェアボタンのテンプレートテキスト最適化 | シェアのハードル低下、リツイート増加   |
| 中     | LINE対応（中央630px内への要素集中）       | LINEシェア時の表示品質向上             |
| 中     | ハッシュタグの整理（2個固定）             | 検索経由の新規流入増加                 |
| 低     | Facebook OGP最適化                        | 日本のターゲットにはLINE・Xが優先      |

---

## 参考情報源

- [OGP画像とは？SEOに効果的な設定方法と最新の推奨サイズ【2025年版】](https://web-hiroshima.com/blog/seo/4931/)
- [【2025年最新版】OGPのサイズと作り方・設置方法を徹底解説【初心者向け】](https://sdesignlabo.com/web/ogp-size/)
- [OGPとは？設定方法とSEO効果、主要SNS別最適化まで徹底解説【2025年最新版】](https://gmotech.jp/semlabo/seo/blog/ogp-configuration/)
- [OG画像サイズ完全ガイド！SNS別最適設定のコツ](https://cocorograph.co/knowledge/og-image-size/)
- [The Best OG Image Tips in 2025 | OG Image Generator](https://myogimage.com/blog/og-image-tips-2025-social-sharing-guide)
- [Open Graph Image Sizes for Social Media: The Complete 2025 Guide](https://www.krumzi.com/blog/open-graph-image-sizes-for-social-media-the-complete-2025-guide)
- [Functions: ImageResponse | Next.js](https://nextjs.org/docs/app/api-reference/functions/image-response)
- [Metadata Files: opengraph-image and twitter-image | Next.js](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
- [How to Automatically Generate Unique OG Images for Every Page in Next.js 15.4+](https://www.buildwithmatija.com/blog/complete-guide-dynamic-og-image-generation-for-next-js-15)
- [診断コンテンツはなぜシェアされる？サービス別で見る企業の活用事例](https://gaiax-socialmedialab.jp/post-48330/)
- [Viral Quiz Copywriting: 4 Tactics That Generate 10K+ Shares](https://outgrow.co/blog/viral-quiz-copywriting-tactics-that-work)
- [How to Create Viral Quizzes in 2025: Key Features & Trends](https://quizandsurveymaster.com/create-viral-quizzes-key-features-trends/)
- [【X運用Tips④】ハッシュタグは"2個"が最強｜Grok解析でわかった伸びる投稿ルール](https://www.cocorochikai.com/x-tips-hashtag/)
- [【最新】X（旧Twitter）のハッシュタグの効果は意味ない？つけない方が伸びる理由を解説](https://tinsalo0425.com/magazine/hashtag-iminai/)
- [X（旧Twitter）のハッシュタグとは？付け方や効果的な使い方・成功事例を解説](https://www.ownly.jp/sslab/twitter-hashtag)
- [What Is the Ideal Character Count for a Tweet?](https://themarketingheaven.com/what-is-the-ideal-character-count-for-a-tweet/)
- [Ensure High Contrast for Text Over Images - NN/G](https://www.nngroup.com/articles/text-over-images/)
- [Open Graph Image Guide: Boost Engagement & Clicks on Social Media](https://www.opengraph.xyz/blog/the-ultimate-guide-to-open-graph-images)
