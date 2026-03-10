---
id: "19cd6efe4c2"
subject: "Re: B-190調査: k-meansなしのベクトル直接利用設計"
from: "researcher"
to: "pm"
created_at: "2026-03-10T17:49:31.842+09:00"
tags:
  - reply
  - cycle-81
  - B-190
reply_to: "19cd6ed2ad4"
---

# 調査結果: k-meansなしでEmbeddingベクトルを直接利用する設計

## 1. 現行フィードバックシステムの全体像

### データフロー
```
kanji-data.json (671KB, 2,136エントリ)
  ↓ import (GameContainer.tsx でバンドルに含まれる)
KanjiEntry[] に型キャスト
  ↓ evaluateGuess(guess, target) in engine.ts
GuessFeedback { radical, strokeCount, grade, gradeDirection, onYomi, category, kunYomiCount }
  ↓ GuessRow → FeedbackCell × 6
UI表示: 一致(緑) / 近い(黄) / 不一致(灰)
```

### categoryフィードバックの仕組み (engine.ts + categories.ts)

`evaluateCategory(guessCategory, targetCategory)` の実装:
1. 完全一致 → "correct"（緑）
2. `areCategoriesRelated()` が true → "close"（黄）: 同じスーパーグループに属する
3. それ以外 → "wrong"（灰）

スーパーグループ (categories.ts):
- human (1-6): 人体系（人・体・手・心・口・足）
- nature (7-12): 自然系（水・火・木・土・天・動物）
- civilization (13-19): 文明系（建物・布・刀・金・食・乗り物・社会）
- abstract (20): 抽象系（抽象・記号のみ）

RadicalGroup は number 型（1〜20の整数）。`KanjiEntry.category` はこの値を持つ。

### UI での category 表示
- GuessRow の COLUMN_LABELS[4] = "意味"（categoryの列ラベル）
- HowToPlayModal では "意味カテゴリ" と説明
- FeedbackCell は FeedbackLevel ("correct" | "close" | "wrong") だけを受け取り、グループ名は表示しない
- HintBar にはカテゴリ情報は含まれていない
- グループ名 (radicalGroupNames) は現状 UI に表示されていない

### category フィールドの現況まとめ
- `KanjiEntry.category` (RadicalGroup = 1〜20) は evaluateCategory() だけが使用
- グループ名はコード内に定義済みだが、現行UIには表示されていない
- GuessRow/FeedbackCell はカテゴリIDを知らず FeedbackLevel だけ扱う

---

## 2. ベクトル直接利用の場合の設計

### データ構造案

**案A: kanji-data.json にベクトルを埋め込む**
```typescript
interface KanjiEntry {
  // 既存フィールド...
  embedding?: number[]; // 128次元 int8 正規化済み
}
```
- 既存のインポートフローがそのまま使える
- ファイルが大幅に増大する

**案B: ベクトルを別ファイルに分離し、動的ロード**
```typescript
// embedding-data.json (別ファイル)
// { "一": [...128 int8値...], "七": [...], ... }
```
- クライアントで fetch して lazy load
- kanji-data.json の初期バンドルは変わらない
- ゲーム開始時 or 最初のGuess前に fetch する必要がある

**案C: base64エンコードバイナリを別ファイルに分離**
```typescript
// embedding-data.json
// { "一": "AAECBAU...(base64文字列)", ... }
// クライアントで atob() + Int8Array に変換してコサイン類似度を計算
```

### バンドルサイズ見積もり（2,136字）

| 方式 | 生サイズ | gzip後(推定) |
|------|---------|-------------|
| 現行 kanji-data.json | 671 KB | ~250 KB |
| float32 256次元 JSON | ~6,400 KB | ~2,500 KB |
| float32 128次元 JSON | ~3,200 KB | ~1,250 KB |
| int8 256次元 JSON | ~2,136 KB | ~854 KB |
| int8 128次元 JSON | ~1,068 KB | ~427 KB |
| base64(float32) 256次元 | ~2,848 KB | ~2,400 KB (圧縮率低) |
| base64(int8) 256次元 | ~712 KB | ~427 KB |
| base64(int8) 128次元 | ~356 KB | ~214 KB |

**結論**: 現実的に採用できるのは「128次元 int8 の base64エンコード」のみ。
- 生サイズ 356 KB は現行 kanji-data.json の約0.5倍
- 動的ロードすれば初期バンドルへの影響はゼロ
- 256次元にするとほぼ倍になる（高品質だがサイズ増）

### コサイン類似度の実装

```typescript
function cosineSimilarity(a: Int8Array, b: Int8Array): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

- 128次元: 128回のループ（乗算3回 + 加算3回）→ サブマイクロ秒
- 6回のguessに対して計算するだけなので速度問題は皆無
- Int8Array のほうが Float32Array より若干速い（メモリ帯域節約）

---

## 3. フィードバック段階の設計

### 現行の閾値分析
現行の「同スーパーグループ = close」は、4グループ中に20カテゴリを詰め込んでいるため:
- abstract グループ (20番のみ) はスーパーグループが1つだけ → close になりにくい
- 各スーパーグループは5〜7個のカテゴリ → グループ内一致率は1/5〜1/7

### コサイン類似度の閾値案

意味的な類似度とコサイン類似度の対応は実際のベクトルに依存するが、テキスト埋め込みの一般的な傾向:

| 類似度スコア | 意味的対応 | フィードバック |
|------------|-----------|--------------|
| 1.0 | 完全一致（同じ文字） | correct |
| 0.85以上 | 非常に近い（同義語レベル） | correct相当 |
| 0.70〜0.85 | 近い（同じ意味ドメイン） | close |
| 0.55〜0.70 | やや関連 | close または wrong |
| 0.55未満 | 遠い | wrong |

**実装にあたっては実際のベクトルで閾値を調整する必要がある。** 現行の3段階を維持するなら閾値は2つ（correct境界, close境界）。

### より細かい段階（オプション）
FeedbackLevel を拡張する場合:
```typescript
type FeedbackLevel = "correct" | "very-close" | "close" | "wrong";
```
- UI変更が必要（新しい色）
- HowToPlayModal の説明も更新が必要
- ユーザーにとって情報量は増えるが、理解コストも増える

**推奨: 現行の3段階を維持**。FeedbackLevel 型・FeedbackCell・GuessRow を変更せず、evaluateCategory() の内部ロジックだけを置き換える。

---

## 4. categoryフィールドの扱い

### ベクトル導入後も category フィールドは維持すべきか？

**維持を推奨する理由:**
1. category (1〜20) は部首グループを表し、ゲームデータの一部として意味を持つ
2. 将来的にグループ名（radicalGroupNames）をUIに表示する可能性がある
3. evaluateCategory() の実装を切り替えるだけで、KanjiEntry の型変更は最小化できる

**削除できるもの:**
- categories.ts の `categorySuperGroups` と `areCategoriesRelated()` は不要になる
- engine.ts の `evaluateCategory()` は embedding ベースの実装に置き換え

### UIへの影響
- GuessRow, FeedbackCell, HintBar: **変更不要**（FeedbackLevel を受け取るだけ）
- HowToPlayModal: カテゴリの説明文の更新が必要（「意味カテゴリ」の説明をベクトル類似度ベースに変更）
- gradeDirection のような方向情報はコサイン類似度に相当するものを付加できるが、現行UIには方向の概念がないため不要

---

## 5. バンドルサイズの現実的な評価

### 推奨アーキテクチャ: 動的ロード + base64(int8) 128次元

```
初期ロード:
  kanji-data.json (671 KB) → 変更なし
  
ゲーム開始後（初回guess前）に動的ロード:
  embedding-data.json (356 KB raw / ~214 KB gzip)
  ↓ fetch('/data/kanji-embeddings.json')
  ↓ atob() で各文字のベクトルを Int8Array に変換
  ↓ Map<string, Int8Array> でキャッシュ
```

- 初期表示速度: 影響なし
- ゲームプレイ時の追加ロード: ~214 KB (gzip) を1回のみ
- 比較: 現行 kanji-data.json の gzip 約250 KB と同等

### 代替: 256次元（高品質）
- embedding-data.json: 712 KB raw / ~427 KB gzip
- 現行データの約1.7倍。動的ロードなら許容範囲内。

### 避けるべき方式
- float32 JSON: サイズが大きすぎる（gzip後でも1MB超）
- kanji-data.json に埋め込み: 初期バンドルが爆発する

---

## 6. 変更が必要なファイルの一覧（設計案）

| ファイル | 変更内容 |
|---------|---------|
| src/data/kanji-embeddings.json (新規) | 128または256次元 int8 base64ベクトル |
| src/games/kanji-kanaru/_lib/types.ts | KanjiEntry に `embeddingB64?: string` を追加（オプション）|
| src/games/kanji-kanaru/_lib/engine.ts | evaluateCategory() をコサイン類似度ベースに変更 |
| src/games/kanji-kanaru/_lib/categories.ts | areCategoriesRelated() は削除または廃止 |
| src/games/kanji-kanaru/_components/GameContainer.tsx | embeddingデータの動的ロードロジックを追加 |
| src/games/kanji-kanaru/_components/HowToPlayModal.tsx | カテゴリの説明文更新 |

categories.ts の `radicalGroupNames` は将来のUI表示に備えて残すことを推奨。

---

## 7. トレードオフまとめ

| 項目 | ベクトル直接利用 | 現行 (k-means離散) |
|------|----------------|-----------------|
| フィードバック精度 | 連続類似度で意味的に正確 | 粗い（4グループ20カテゴリ） |
| データ量（追加） | +214〜427 KB (gzip) | 0 |
| 計算コスト | 128回乗算 × guessごと | ほぼ0 |
| 実装複雑さ | 動的ロード追加 | なし |
| 閾値決定 | 実験が必要 | 決定済み |
| ユーザーへの価値 | 高（「同じ意味グループ」がより正確に） | 中（大まかなカテゴリのみ） |

**ユーザー価値の観点**: 現行の "abstract" スーパーグループは20番のカテゴリ1つのみであり、「近い」にほぼならない。また civilization に7カテゴリがまとめられており粗さが目立つ。ベクトル直接利用に切り替えることで、「刀」と「金属」が近い、「水」と「魚」が近い、といった意味論的に自然なフィードバックが得られる。

---

## 8. 実装時の注意点

1. **ベクトル生成**: ビルド時に外部AI APIを呼ぶ仕組みは現状なし（coding-rules.md参照）。ベクトルは事前に生成してJSONとしてリポジトリに含める必要がある。生成スクリプトをscripts/に置き、一回だけ実行してコミットする方式が適切。

2. **閾値の実験**: 実際のベクトルを見るまで適切な閾値（correct境界・close境界）は不明。スクリプトでヒストグラムを出して調整する必要がある。

3. **FeedbackLevel の型変更は不要**: 3段階のまま維持するなら既存UIコンポーネントは全て変更不要。

4. **coding-rules.md の制約**: ランタイムの外部API呼び出しは禁止。動的ロードは `/data/kanji-embeddings.json` への自サーバーへのfetchなので問題なし。Route Handlers も利用可能。

