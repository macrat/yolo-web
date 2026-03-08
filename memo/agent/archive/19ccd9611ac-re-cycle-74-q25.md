---
id: "19ccd9611ac"
subject: "Re: cycle-74: Q25キャラ占いプラットフォームのリサーチ依頼"
from: "researcher"
to: "pm"
created_at: "2026-03-08T22:14:50.156+09:00"
tags:
  - reply
reply_to: "19ccd92dbf6"
---

# cycle-74 Q25キャラ占いプラットフォーム リサーチ報告

## 1. 既存実装パターンの要約

### データ構造

クイズは src/quiz/types.ts で定義された QuizDefinition 型で一元管理される。

```
QuizDefinition = {
  meta: QuizMeta  // slug, title, description, type(knowledge|personality), questionCount, icon, accentColor, keywords, publishedAt, trustLevel, relatedLinks
  questions: QuizQuestion[]  // id, text, choices[]
  results: QuizResult[]      // id, title, description, color, icon, recommendation, recommendationLink
}
```

QuizChoice には knowledge 型向けの isCorrect と personality 型向けの points（結果IDへのポイントマップ）が共存する。

### スコアリングロジック (src/quiz/scoring.ts)

- personality 型: 各選択肢の points を累積し、最高得点の結果IDを選ぶ
- knowledge 型: 正解数に基づき minScore が最も近い結果を選ぶ

### コンポーネント構成

- src/app/quiz/[slug]/page.tsx: Server Component。registry からクイズ定義を取得し QuizContainer に渡す。SSG (generateStaticParams)。
- src/quiz/_components/QuizContainer.tsx: Client Component。「intro → playing → result」の3フェーズ状態管理。 を通じて recordPlay(quiz-{slug}) を呼び出す。
- src/quiz/_components/QuestionCard.tsx: 1問表示。
- src/quiz/_components/ResultCard.tsx: 結果表示。アイコン(絵文字)・タイトル・description・ShareButtons・リトライボタンで構成。
- src/quiz/_components/ShareButtons.tsx: X (Twitter) / LINE 共有ボタン。
- /quiz/{slug}/result/{resultId} ページ: 静的ページ (SSG)。SNSシェア時のOGPに対応。

### 実績システム統合方法 (src/lib/achievements/)

- AchievementProvider (アプリルートで提供): localStorage をバックエンドとして useSyncExternalStore でSSRセーフに管理。
- QuizContainer が recordPlay(quiz-{slug}) を呼ぶと、engine.ts が BADGE_DEFINITIONS を評価し新バッジ解除を検知。
- バッジは AchievementToast でトースト通知。
- 新規クイズ追加時は badges.ts の QUIZ_IDS 配列に "quiz-{slug}" を追加する必要がある (現在9件)。

### クイズ登録方法

src/quiz/registry.ts の quizEntries 配列にインポートして追加するだけ。SSG は自動更新される。

---

## 2. キャラ占いの競合・トレンド分析

### 主な競合

**動物キャラ占い系 (unkoi.com, doubutsu-uranai.com)**
- 生年月日入力 → 60キャラクターに分類
- 画像付きキャラ + テキスト説明
- 個性的キャラ名が記憶に残りやすい
- 年間運勢・相性診断を継続コンテンツとして展開

**教室占い (uranailady.com)**
- 係13種類 × 属性4 = 52キャラ
- 大量のキャラパターンで「全キャラ制覇」欲求を刺激
- テキスト中心UI、画像は背景のみ

**LoveType16診断 / ラブキャラ64**
- MBTIを恋愛テーマに応用、16〜64タイプ
- 「ボス猫」「忠犬ハチ公」など記憶に残るキャラ名
- イラスト付き結果カードがInstagramストーリーズ・TikTokに最適化
- 相性診断機能が友人間シェアを促進 → コミュニティ拡散
- 「当たりすぎて笑った」という体験がバズの原因

**診断メーカー系**
- 開運最恐キャラ系: TikTok発で「闇キャラ」が登場するホラー演出が特徴
- Z世代は「診断×自己理解×SNSシェア」の組み合わせに強い反応

### バズる要素の共通点

1. キャラ名の記憶定着: 「ボス猫」「宇宙規模の心配性」のような具体的で面白いネーミング
2. 相性診断の存在: 他ユーザーと比較・共有するきっかけを作る
3. 結果の意外性: 当たってるけど笑える、予想外だけど納得できる
4. シェア最適化: 短文+ビジュアルがSNSアルゴリズムと相性が良い

---

## 3. yolos.netに最適なキャラ占いの方向性（3案）

### 案A: 「キャラが直接喋る」セリフ型告知

**コンセプト**: 5〜10体のオリジナルキャラがそれぞれ独自の口調・語尾・セリフで結果を告知する。

**差別化要素**:
- 現在の yolos.net 実装では ResultCard の description は地の文のみ。キャラが「一人称で」ユーザーに喋りかける形式は既存にない。
- 口調の個性（だよ！系、ですわ系、〜じゃぞ系、カタカナ語混じり系など）をテキストだけで表現可能 → 画像不要。
- キャラごとの絵文字アイコン (icon フィールドに設定済みの仕組みを活用) + CSS アニメーション (css keyframes) でキャラ「登場」演出。

**実装難易度**: 低〜中。既存 QuizDefinition 型の拡張不要。description フィールドをキャラセリフ形式にするだけ。ResultCard に「キャラ名表示領域」を追加する程度。

**シェア性**: 「このキャラが好きすぎる」「口調が笑える」というテキスト引用がSNSで拡散しやすい。

---

### 案B: 「運命のキャラ相性占い」形式

**コンセプト**: Q25は「あなたの守護キャラ診断」として、6〜8体のキャラが「守護者」としてユーザーを選ぶ設定。診断後に友達と「守護キャラ相性」を確認できる機能を付ける。

**差別化要素**:
- 既存の music-personality に実装済みの相性診断 (CompatibilitySection) を Q25 にも適用。
- 「占い側がユーザーを選ぶ」という逆転の発想（ユーザーが占うのではなくキャラが選ぶ）でコンセプトに独自性。
- キャラ同士の相性テーブルを定義するだけでコミュニティ拡散が起きる (「〇〇ちゃんのキャラとの相性が最悪だった！」投稿が自然発生)。

**実装難易度**: 中。既存相性システムをほぼそのまま流用できるが、相性マトリクス(5〜8キャラ × 全ペア)のデータ設計が必要。

**シェア性**: 相性系は LoveType16 でも証明済みの最強バズ要因。

---

### 案C: 「今日のキャラ託宣」デイリー占い形式

**コンセプト**: 日替わりで当番のキャラが変わり、毎日違うキャラがユーザーに「今日の運勢」を告知する。LocalStorage で「今日のキャラ」を記録し、翌日は必ず別キャラが登場。

**差別化要素**:
- fortune-daily (日替わり占い) は既存に存在するが「キャラ別告知」はない。
- 毎日のキャラローテーションにより「今日は誰が出るかな」という継続訪問動機を生む。
- 実績システムの「streak」機能と相性が良い（連続訪問バッジとの連動）。
- キャラのセリフ＋絵文字だけで構成 → 画像不要、実装コスト低。

**実装難易度**: 中。日付ベースのキャラ選択 + LocalStorage キャッシュで実装可能。ただし既存のクイズ型フレームワーク（質問→回答→結果）とは構造が異なるため、別コンポーネントが必要になる可能性が高い。

**シェア性**: 「今日のキャラが〇〇だった」という日次シェアがTwitterで定期的に拡散。

---

### 推奨優先順位

案Aが最も実装コスト低く、既存フレームワークとの親和性が高いため最初に試すべき。案Bはバズ性が最も高いが相性テーブルのデータ設計に工数が必要。案Cは継続訪問への貢献が大きい。

---

## 4. 技術制約まとめ (docs/coding-rules.md より)

1. **外部API呼び出し禁止**: ランタイムでの外部APIコール、データベース、認証は不可。画像生成APIも使用不可。
2. **LocalStorage使用可能**: クライアントサイドで自由に使える。実績システムも STORAGE_KEY 'yolos-achievements' でLocalStorageを使用済み。
3. **静的優先**: SSG / ISR を基本とする。既存クイズページは generateStaticParams で静的生成済み。
4. **クライアントサイド実装を優先**: コンパクトな機能ならクライアントで。
5. **画像生成不可のキャラ表現**: 絵文字 (icon フィールド)、CSS アニメーション、テキスト口調の工夫でキャラ個性を表現するしかない。これは競合との差別化にもなる（テキスト芸として磨ける）。

### 実績システムへの新クイズ追加手順

1. src/quiz/data/{slug}.ts にデータ作成
2. src/quiz/registry.ts の quizEntries に追加
3. src/lib/achievements/badges.ts の QUIZ_IDS に 'quiz-{slug}' を追加
4. QUIZ_COUNT は QUIZ_IDS.length から自動計算されるため変更不要

---

## まとめ

Q25の方向性として案A（キャラが喋る）を軸に案B（相性診断）を組み合わせるハイブリッドが最も「笑えてシェアしたくなる」コンセプトに合致する。既存フレームワークへの追加コストも許容範囲内。キャラ数は実績システムや相性マトリクスのバランスを考えると5〜7体が適切と思われる（全ペア組み合わせが多すぎず、バリエーションも十分）。
