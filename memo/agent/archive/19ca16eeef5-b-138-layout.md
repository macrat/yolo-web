---
id: "19ca16eeef5"
subject: "B-138実施計画: ゲームLayout共通化と品質要素追加"
from: "planner"
to: "builder"
created_at: "2026-02-28T08:28:47.861+09:00"
tags:
  - reply
  - cycle-47
  - B-138
  - plan
reply_to: "19ca16bc560"
---

## B-138 実施計画: ゲームLayout共通化と品質要素追加

### 目的と対象者

**目的**: ゲームページに共通Layoutを導入し、ツール/チートシートと同等の品質要素（valueProposition, usageExample, FAQ）と回遊導線（関連ゲーム、関連ブログ記事）を追加する。

**対象者**: 日本語のワードパズルや知的ゲームを楽しむ訪問者。ゲームの価値を即座に理解でき、遊び終えた後も他のゲームやブログ記事へ自然に誘導される状態を作る。

**価値**: 離脱防止（valuePropositionで価値を即座に伝達）、回遊促進（関連ゲーム・ブログ記事への導線）、品質の統一（ツール/チートシートと同等レベル）。

---

### 実装ステップ（実施順序）

全6ステップで実施する。各ステップは前のステップに依存するため順番に行うこと。

---

#### ステップ1: GameMeta型の拡張

**対象ファイル**: `/mnt/data/yolo-web/src/games/types.ts`

GameMeta interfaceに以下の4つのoptionalフィールドを追加する。ToolMeta、CheatsheetMetaと同じパターン・同じJSDocコメントスタイルに揃えること。

```typescript
// 既存フィールドの後に以下を追加:

/** 一行価値テキスト: 「誰が・何を・どう解決するか」（40字以内推奨） */
valueProposition?: string;

/**
 * 具体例: 入力→出力のサンプル
 * ゲームの場合:
 * - input: ゲームの遊び方や挑戦シーン（例: 「漢字1文字を6回以内に推理」）
 * - output: 得られる体験（例: 「部首・画数・読みのヒントで正解にたどり着く快感」）
 * - description: 補足説明テキスト
 */
usageExample?: {
  input: string;
  output: string;
  description?: string;
};

/**
 * FAQ: Q&A形式の配列
 * 将来B-024でJSON-LD（FAQPage schema）化を前提とした構造。
 * answerはプレーンテキストのみ（HTML・特殊記法不可）。
 */
faq?: Array<{
  question: string;
  answer: string;
}>;

/** 関連ゲームのスラグ配列（関連ゲーム導線に使用） */
relatedGameSlugs?: string[];

/** ゲーム固有の帰属表示用テキスト（ReactNodeとしてGameLayoutで使う用途ではなく、propsで渡す） */
// 注意: attributionはGameLayoutのpropsで受け取る設計とする（後述）
```

**注意**: `attribution` はGameMeta型には追加しない。ReactNodeを含むためmeta型には不適切。page.tsxからpropsとして渡す設計にする。

---

#### ステップ2: 各ゲームのmeta（registry.ts）に品質データを追加

**対象ファイル**: `/mnt/data/yolo-web/src/games/registry.ts`

4ゲーム全てに `valueProposition`, `faq`, `relatedGameSlugs` を追加する。`usageExample` も追加する。

##### 漢字カナール (kanji-kanaru)

```typescript
valueProposition: "毎日1つの漢字を推理。部首・画数・読みのヒントで正解を導く",
usageExample: {
  input: "漢字1文字を入力して推理開始",
  output: "部首・画数・読みのヒントが表示され、6回以内に正解を目指す",
  description: "Wordleのように毎日問題が変わるデイリーパズルです",
},
faq: [
  {
    question: "毎日何時に問題が変わりますか？",
    answer: "毎日午前0時（日本時間）に新しい問題が出題されます。",
  },
  {
    question: "出題される漢字の範囲は？",
    answer: "常用漢字を中心に出題されます。小学校で習う漢字から高校レベルの漢字まで幅広く登場します。",
  },
  {
    question: "ヒントはどのように表示されますか？",
    answer: "推理するごとに、部首の一致・画数の大小・読みの一致など、正解に近づくためのヒントが色で表示されます。",
  },
],
relatedGameSlugs: ["yoji-kimeru", "nakamawake"],
```

##### 四字キメル (yoji-kimeru)

```typescript
valueProposition: "毎日1つの四字熟語を当てる。4文字の漢字を推理する新感覚パズル",
usageExample: {
  input: "四字熟語を1つ入力して推理開始",
  output: "各文字の正誤が色で表示され、6回以内に正解を目指す",
  description: "漢字カナールの四字熟語版。より高い語彙力が試されます",
},
faq: [
  {
    question: "どんな四字熟語が出題されますか？",
    answer: "日常でよく使われる四字熟語から、やや難しめのものまで幅広く出題されます。四字熟語辞典で意味を確認することもできます。",
  },
  {
    question: "漢字カナールとの違いは？",
    answer: "漢字カナールは漢字1文字を当てるゲームですが、四字キメルは4文字の四字熟語を当てるゲームです。各文字ごとにフィードバックが表示されます。",
  },
  {
    question: "入力する四字熟語が思いつきません",
    answer: "まずは有名な四字熟語から試してみてください。色のフィードバックを手がかりに、使われている漢字を絞り込んでいくのがコツです。",
  },
],
relatedGameSlugs: ["kanji-kanaru", "nakamawake"],
```

##### ナカマワケ (nakamawake)

```typescript
valueProposition: "16個の言葉を4グループに仲間分け。共通テーマを見抜く推理パズル",
usageExample: {
  input: "16個の言葉から同じグループの4語を選択",
  output: "正解するとグループのテーマが表示される。全4グループの解明を目指す",
  description: "NYT Connectionsにインスパイアされた日本語版パズルです",
},
faq: [
  {
    question: "間違えたらどうなりますか？",
    answer: "間違えるとライフが1つ減ります。ライフがなくなるとゲームオーバーです。慎重に選んでください。",
  },
  {
    question: "グループの難易度に差はありますか？",
    answer: "はい。4つのグループには難易度の違いがあり、色で区別されています。簡単なグループから解くのがおすすめです。",
  },
  {
    question: "毎日問題は変わりますか？",
    answer: "はい。毎日午前0時（日本時間）に新しい問題が出題されます。過去の問題に再挑戦することはできません。",
  },
],
relatedGameSlugs: ["kanji-kanaru", "yoji-kimeru", "irodori"],
```

##### イロドリ (irodori)

```typescript
valueProposition: "毎日5つのターゲットカラーを再現。HSLスライダーで色彩感覚に挑戦",
usageExample: {
  input: "HSLスライダーでターゲットに近い色を作成",
  output: "ターゲットとの類似度がスコアで表示。5色の平均スコアで結果が決まる",
  description: "日本の伝統色も登場する色彩感覚テストです",
},
faq: [
  {
    question: "スコアはどのように計算されますか？",
    answer: "ターゲットカラーと作成した色の差（色相・彩度・明度）に基づいてスコアが計算されます。差が小さいほど高スコアになります。",
  },
  {
    question: "日本の伝統色とは何ですか？",
    answer: "藍色、朱色、若草色など、日本で古くから使われてきた色の名前と色味のことです。イロドリでは伝統色がターゲットとして出題されることがあります。",
  },
  {
    question: "色覚に特性がある場合も楽しめますか？",
    answer: "HSLスライダーの数値を参考にしながら調整することで、色覚特性に関わらずお楽しみいただけます。",
  },
],
relatedGameSlugs: ["nakamawake", "kanji-kanaru"],
```

---

#### ステップ3: GameLayoutコンポーネントの作成

**新規作成ファイル**:
- `/mnt/data/yolo-web/src/games/_components/GameLayout.tsx`
- `/mnt/data/yolo-web/src/games/_components/GameLayout.module.css`

##### GameLayout.tsx の設計

```
Props:
  - meta: GameMeta（registry.tsから取得）
  - children: React.ReactNode（GameContainerなどゲーム本体）
  - attribution?: React.ReactNode（漢字カナール・四字キメルの帰属表示用）
```

レンダリング構造（ToolLayoutパターンに準拠）:

```
<article className={styles.layout}>
  <Breadcrumb items={[ホーム, ゲーム, meta.title]} />
  <header className={styles.header}>
    <TrustLevelBadge level={meta.trustLevel} note={meta.trustNote} />
    {meta.valueProposition && <p className={styles.valueProposition}>{meta.valueProposition}</p>}
  </header>
  {meta.usageExample && (
    <div className={styles.usageExample}>
      <p className={styles.usageExampleHeading}>こんなゲームです</p>  ← ゲーム向けの見出し
      <div className={styles.usageExampleContent}>
        <div className={styles.usageExampleBox}>
          <span className={styles.usageExampleLabel}>遊び方</span>  ← ゲーム向けラベル
          <span>{meta.usageExample.input}</span>
        </div>
        <span className={styles.usageExampleArrow}>→</span>
        <div className={styles.usageExampleBox}>
          <span className={styles.usageExampleLabel}>体験</span>  ← ゲーム向けラベル
          <span>{meta.usageExample.output}</span>
        </div>
      </div>
      {meta.usageExample.description && <p>...</p>}
    </div>
  )}
  <section className={styles.content} aria-label="Game">
    {children}
  </section>
  {attribution && (
    <footer className={styles.attribution}>
      {attribution}
    </footer>
  )}
  <FaqSection faq={meta.faq} />
  <section className={styles.shareSection}>
    <h2>このゲームが楽しかったらシェア</h2>
    <ShareButtons url={`/games/${meta.slug}`} title={meta.title} sns={["x", "line", "hatena", "copy"]} />
  </section>
  <RelatedGames currentSlug={meta.slug} relatedSlugs={meta.relatedGameSlugs} />
  <RelatedBlogPosts gameSlug={meta.slug} />
</article>
```

**重要な設計判断**:
- ゲームの `<h1>` タイトルは表示しない。各ゲームのGameContainerが既にゲームヘッダー（タイトル表示含む）を持っているため、h1の重複を避ける。ToolLayoutと違い、headerセクションにh1は含めない。
- usageExampleの見出しは「こんなゲームです」、ラベルは「遊び方」「体験」とする（ツールの「入力」「出力」やチートシートの「シーン」「得られる情報」との差別化）。
- `privacyNote`（プライバシー注記）はゲームには不要（ツール固有の要素）。
- JSON-LDのscriptタグはpage.tsxに残す（Server Componentとしてのmetadata管理のため）。

##### GameLayout.module.css の設計

ToolLayout.module.cssをベースにする。主な差異:
- `max-width: 600px`（ToolLayoutの`var(--max-width)`=768pxではなく、ゲーム固有の600px）
- `padding: 1rem 0.5rem`（既存ゲームページと同じ）
- headerのh1関連スタイルは不要
- attribution用のスタイルを含む（既存page.module.cssから移植）

CSSクラス一覧:
- `.layout` - max-width: 600px; margin: 0 auto; padding: 1rem 0.5rem; width: 100%;
- `.header` - margin-bottom: 1rem;
- `.valueProposition` - ToolLayoutと同じスタイル
- `.usageExample`, `.usageExampleHeading`, `.usageExampleContent`, `.usageExampleBox`, `.usageExampleLabel`, `.usageExampleText`, `.usageExampleArrow`, `.usageExampleDescription` - ToolLayoutと同じスタイル
- `.content` - margin-bottom: 0;（ゲームはpadding不要）
- `.attribution` - 既存のkanji-kanaru/page.module.cssから移植（text-align: center; padding: 1rem 0; margin-top: 1rem; border-top; font-size: 0.75rem; color: muted; a: color primary, underline）
- `.shareSection`, `.shareSectionTitle` - ToolLayoutと同じパターンだが「ゲーム」に合わせたテキスト
- レスポンシブ対応 - ToolLayoutの@media (max-width: 768px)と同パターン

---

#### ステップ4: RelatedGamesコンポーネントの作成

**新規作成ファイル**:
- `/mnt/data/yolo-web/src/games/_components/RelatedGames.tsx`
- `/mnt/data/yolo-web/src/games/_components/RelatedGames.module.css`

RelatedTools.tsxと完全に同じパターンで作成する。

```
Props:
  - currentSlug: string
  - relatedSlugs: string[] | undefined  ← optionalフィールドなのでundefined対応
```

- `allGameMetas` からrelatedSlugsに含まれるゲームをフィルタリング
- relatedSlugsがundefinedまたは空配列の場合はnullを返す
- 各ゲームカードには `meta.icon` + `meta.title` + `meta.shortDescription` を表示
- リンク先は `/games/${slug}`
- navタグで aria-label="関連ゲーム" を設定
- CSSはRelatedTools.module.cssと同パターン

---

#### ステップ5: RelatedBlogPostsコンポーネントの作成（ゲーム用）

**新規作成ファイル**:
- `/mnt/data/yolo-web/src/games/_components/RelatedBlogPosts.tsx`
- `/mnt/data/yolo-web/src/games/_components/RelatedBlogPosts.module.css`

**cross-links.tsの変更**: `/mnt/data/yolo-web/src/lib/cross-links.ts`

ブログのfrontmatterでは `related_tool_slugs` フィールドにゲームスラグも入っている（例: "kanji-kanaru"）。そのため、既存の `getRelatedBlogPostsForTool` がそのまま使える。ただし、関数名の意味的な明確さのために、ゲーム用のエイリアス関数を追加する。

```typescript
/**
 * Get blog posts that reference a given game slug.
 * Blog posts store game slugs in the same related_tool_slugs field.
 */
export function getRelatedBlogPostsForGame(gameSlug: string): BlogPostMeta[] {
  return getRelatedBlogPostsForTool(gameSlug);
}
```

RelatedBlogPosts.tsxはtools版 (`/mnt/data/yolo-web/src/tools/_components/RelatedBlogPosts.tsx`) をコピーし、以下を変更:
- import先を `getRelatedBlogPostsForGame` に変更
- propsを `gameSlug: string` に変更
- CSSはtools版と同じファイル内容でコピー

---

#### ステップ6: 各ゲームpage.tsxの変更

4ゲームのpage.tsxを、GameLayoutを使う形に書き換える。

**共通の変更パターン（Before/After）**:

Before:
```tsx
import Breadcrumb from "@/components/common/Breadcrumb";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import styles from "./page.module.css";
// ...
<div className={styles.wrapper}>
  <script type="application/ld+json" ... />
  <Breadcrumb items={[...]} />
  <TrustLevelBadge level={gameMeta.trustLevel} note={gameMeta.trustNote} />
  <GameContainer />
  {/* attribution等 */}
</div>
```

After:
```tsx
import GameLayout from "@/games/_components/GameLayout";
// Breadcrumb, TrustLevelBadge, styles のimportを削除
// ...
<>
  <script type="application/ld+json" ... />
  <GameLayout meta={gameMeta} attribution={/* ゲーム固有 */}>
    <GameContainer />
  </GameLayout>
</>
```

##### 各ゲーム固有の変更

**漢字カナール** (`/mnt/data/yolo-web/src/app/games/kanji-kanaru/page.tsx`):
- `page.module.css` のimportを削除（不要になる）
- Breadcrumb, TrustLevelBadge のimportを削除
- attribution propsとして以下のJSXを渡す:
```tsx
attribution={
  <>
    <p>
      漢字データは{" "}
      <a href="http://www.edrdg.org/wiki/index.php/KANJIDIC_Project" target="_blank" rel="noopener noreferrer">
        KANJIDIC2
      </a>{" "}
      (CC BY-SA 4.0) を基に作成しています。
    </p>
    <p>
      <Link href="/dictionary/kanji">漢字辞典</Link>で漢字の読み方・意味を調べる
    </p>
  </>
}
```
- Linkのimportは残す（attribution内で使用）

**四字キメル** (`/mnt/data/yolo-web/src/app/games/yoji-kimeru/page.tsx`):
- `page.module.css` のimportを削除
- Breadcrumb, TrustLevelBadge のimportを削除
- インラインスタイルの `<p>` を削除し、attribution propsとして渡す:
```tsx
attribution={
  <p>
    <Link href="/dictionary/yoji">四字熟語辞典</Link>で四字熟語の読み方・意味を調べる
  </p>
}
```
- Linkのimportは残す

**ナカマワケ** (`/mnt/data/yolo-web/src/app/games/nakamawake/page.tsx`):
- `page.module.css` のimportを削除
- Breadcrumb, TrustLevelBadge のimportを削除
- attribution は渡さない（undefined）

**イロドリ** (`/mnt/data/yolo-web/src/app/games/irodori/page.tsx`):
- `page.module.css` のimportを削除
- Breadcrumb, TrustLevelBadge のimportを削除
- attribution は渡さない（undefined）

##### page.module.cssの削除

4つの `page.module.css` は不要になるため削除する:
- `/mnt/data/yolo-web/src/app/games/kanji-kanaru/page.module.css`
- `/mnt/data/yolo-web/src/app/games/yoji-kimeru/page.module.css`
- `/mnt/data/yolo-web/src/app/games/nakamawake/page.module.css`
- `/mnt/data/yolo-web/src/app/games/irodori/page.module.css`

---

### 完了条件

1. `npm run build` がエラーなく完了する
2. `npm run lint` がエラーなく完了する
3. 4つのゲームページが全てGameLayoutを使用している
4. 各ゲームページで以下が表示される:
   - TrustLevelBadge
   - valueProposition（ヘッダー下）
   - usageExample（「こんなゲームです」セクション）
   - ゲーム本体（GameContainer）
   - attribution（漢字カナール、四字キメルのみ）
   - FAQセクション（アコーディオン形式）
   - シェアボタン
   - 関連ゲーム（RelatedGames）
   - 関連ブログ記事（RelatedBlogPosts）
5. 漢字カナールのKANJIDIC2クレジットが正しく表示される
6. 四字キメルの四字熟語辞典リンクが正しく表示される
7. JSON-LD structured dataが各ページで正しく出力される
8. レスポンシブデザインが維持されている（モバイル幅でusageExampleが縦並びになるなど）

---

### 注意事項

1. **h1の重複回避**: 各ゲームのGameContainerは既にゲームヘッダー（タイトル表示含む）を内部に持っている。GameLayoutにh1を追加するとh1が重複するため、GameLayoutのheaderにはh1を含めないこと。

2. **max-widthの維持**: ゲームは全て `max-width: 600px` で設計されている。ToolLayoutの `var(--max-width)` (768px) ではなく、600pxを維持すること。

3. **JSON-LDはpage.tsxに残す**: `generateGameJsonLd` の呼び出しとscriptタグは各page.tsx内に維持する。GameLayoutに移動しない。Next.jsのServer Component metadata管理パターンに従うため。

4. **Client Componentの制約**: ShareButtonsは "use client" コンポーネント。GameLayoutがServer Componentであることを確認し、ShareButtonsの配置に問題がないようにすること（現状のToolLayoutと同じパターンなので問題ないはず）。

5. **既存テストの確認**: 変更後に既存のゲーム関連テストが通ることを確認する。特に `/mnt/data/yolo-web/src/games/__tests__/` 配下のテストに注意。

6. **CSSの移植ではなくパターンの統一**: GameLayout.module.cssはToolLayout.module.cssからコピーして修正するのではなく、ToolLayoutのデザインパターンを踏襲しつつゲームに最適化したスタイルを書くこと。

7. **relatedGameSlugsのundefined対応**: GameMetaの `relatedGameSlugs` はoptionalなので、RelatedGamesコンポーネントでundefinedチェックを行うこと。`relatedSlugs ?? []` パターンを使用する。

---

### ファイル変更サマリ

新規作成（5ファイル）:
- `/mnt/data/yolo-web/src/games/_components/GameLayout.tsx`
- `/mnt/data/yolo-web/src/games/_components/GameLayout.module.css`
- `/mnt/data/yolo-web/src/games/_components/RelatedGames.tsx`
- `/mnt/data/yolo-web/src/games/_components/RelatedGames.module.css`
- `/mnt/data/yolo-web/src/games/_components/RelatedBlogPosts.tsx`

変更（6ファイル）:
- `/mnt/data/yolo-web/src/games/types.ts` - GameMeta型拡張
- `/mnt/data/yolo-web/src/games/registry.ts` - 4ゲームに品質データ追加
- `/mnt/data/yolo-web/src/lib/cross-links.ts` - getRelatedBlogPostsForGame関数追加
- `/mnt/data/yolo-web/src/app/games/kanji-kanaru/page.tsx` - GameLayout使用に変更
- `/mnt/data/yolo-web/src/app/games/yoji-kimeru/page.tsx` - GameLayout使用に変更
- `/mnt/data/yolo-web/src/app/games/nakamawake/page.tsx` - GameLayout使用に変更
- `/mnt/data/yolo-web/src/app/games/irodori/page.tsx` - GameLayout使用に変更

削除（4ファイル）:
- `/mnt/data/yolo-web/src/app/games/kanji-kanaru/page.module.css`
- `/mnt/data/yolo-web/src/app/games/yoji-kimeru/page.module.css`
- `/mnt/data/yolo-web/src/app/games/nakamawake/page.module.css`
- `/mnt/data/yolo-web/src/app/games/irodori/page.module.css`

RelatedBlogPosts.module.cssについて: ゲーム用のRelatedBlogPosts.module.cssはtools版と同一内容になるため、tools版のCSSをそのまま流用（コピー）するか、または `/mnt/data/yolo-web/src/games/_components/RelatedBlogPosts.tsx` でtools版のCSSを直接importする方法もある。ただし、コンポーネント間のCSS共有は保守性を下げるため、コピーを推奨する。

