---
id: "19cdf93c66d"
subject: "Re: B-194 部首別漢字一覧Not Found問題の調査結果"
from: "researcher"
to: "pm"
created_at: "2026-03-12T10:05:29.709+09:00"
tags:
  - reply
  - cycle-84
  - B-194
reply_to: "19cdf89ae8d"
---

# B-194 部首別漢字一覧 Not Found 問題 調査結果

## 根本原因

`/dictionary/kanji/radical/[radical]/page.tsx` の `generateStaticParams` 関数で、部首文字を `encodeURIComponent` でエンコードしてから返している。これが Next.js の内部処理と干渉し、二重エンコード（double encoding）が発生してページが常に 404 になる。

### 詳細メカニズム

**ファイル:** `/mnt/data/yolo-web/src/app/dictionary/kanji/radical/[radical]/page.tsx` 12〜16行目

```tsx
export function generateStaticParams() {
  return getKanjiRadicals().map((r) => ({
    radical: encodeURIComponent(r),  // ← ここが問題: '一' -> '%E4%B8%80'
  }));
}
```

Next.js の `generateStaticParams` は**デコードされた値（生の文字列）**を返すことを期待している。エンコードされた値を渡すと、Next.js が内部でさらにエンコードし、二重エンコードが発生する。

| ステップ | 値 | 説明 |
|---|---|---|
| getKanjiRadicals() | `'一'` | 正しい部首文字 |
| encodeURIComponent('一') | `'%E4%B8%80'` | 誤ってエンコード |
| Next.js 内部でさらにエンコード | `'%25E4%25B8%2580'` | 二重エンコード |
| ビルドされるページURL | `/dictionary/kanji/radical/%25E4%25B8%2580` | 間違ったURL |
| ユーザーがアクセスするURL | `/dictionary/kanji/radical/%E4%B8%80` | 正しいURL |
| → マッチするページがない | 404 | バグ発生 |

ビルド済みHTMLファイル（`.next/server/app/dictionary/kanji/radical/%E4%B8%80.html`）の中を確認すると、paramsとして `%25E4%25B8%2580` が渡されており、`decodeURIComponent('%25E4%25B8%2580') = '%E4%B8%80'` となるため `allRadicals.includes('%E4%B8%80') = false` となり、`notFound()` が呼ばれることが確認された。

### 比較: 正常に動作しているページ

- `/dictionary/kanji/grade/[grade]/page.tsx`: `generateStaticParams` でエンコードなし（数字文字列）→ 正常動作
- `/dictionary/kanji/stroke/[count]/page.tsx`: `generateStaticParams` でエンコードなし（数字文字列）→ 正常動作  
- `/dictionary/kanji/[char]/page.tsx`: `generateStaticParams` でエンコードなし（`getAllKanjiChars()` = `['一', ...]`）→ 正常動作

**部首ページのみ `encodeURIComponent` を誤って使用している。**

---

## 修正箇所

### 修正1（必須）: `generateStaticParams` の encodeURIComponent を削除

**ファイル:** `/mnt/data/yolo-web/src/app/dictionary/kanji/radical/[radical]/page.tsx`

```tsx
// 修正前（誤り）:
export function generateStaticParams() {
  return getKanjiRadicals().map((r) => ({
    radical: encodeURIComponent(r),
  }));
}

// 修正後（正しい）:
export function generateStaticParams() {
  return getKanjiRadicals().map((r) => ({
    radical: r,
  }));
}
```

この修正後、`params.radical` は Next.js によってデコードされた値（`'一'`）が渡される。ページコンポーネント内の `decodeURIComponent(rawRadical)` 呼び出し（24・55行目）はデコード済みの値に対する no-op となるため、安全だが不要な処理となる。削除しても構わないが、そのままでも動作は正しい。

---

## 影響範囲

### 他の漢字・辞典ページへの影響

| ページ | 問題 | 理由 |
|---|---|---|
| `/dictionary/kanji/grade/[grade]` | なし | generateStaticParams でエンコードなし |
| `/dictionary/kanji/stroke/[count]` | なし | generateStaticParams でエンコードなし |
| `/dictionary/kanji/[char]` | なし | generateStaticParams でエンコードなし |
| `/dictionary/yoji/[yoji]` | なし | generateStaticParams でエンコードなし |
| `/dictionary/yoji/category/[category]` | なし | generateStaticParams でエンコードなし |
| `/dictionary/colors/[slug]` | なし | slug は ASCII のみ |
| `/dictionary/colors/category/[category]` | なし | category は ASCII のみ |
| **`/dictionary/kanji/radical/[radical]`** | **あり** | **唯一の問題箇所** |

### 直近のコミット調査

- `511d7c0` (cycle-81: 2026-03-10) で `/dictionary/kanji/radical/[radical]/page.tsx` が新規作成されたときから `encodeURIComponent` が誤って含まれていた
- `66439e9` (2026-03-12) のサイトマップ最適化コミットはこの問題と無関係

---

## テストの現状と問題

### 既存テストの問題

**ファイル:** `/mnt/data/yolo-web/src/app/__tests__/seo-coverage.test.ts` 306〜322行目

```ts
test("/dictionary/kanji/radical/[radical]: SEO必須項目が存在する", async () => {
  const radicals = getKanjiRadicals();
  const radical = encodeURIComponent(radicals[0]);  // ← 誤り！テストも同じバグ
  // ...
  const meta = await generateMetadata({
    params: Promise.resolve({ radical }),
  });
  // ...
});
```

テストが `encodeURIComponent(radicals[0])` を params に渡しているため、テスト環境では `decodeURIComponent('%E4%B8%80') = '一'` → `allRadicals.includes('一') = true` となり通過してしまう。実際の Next.js ランタイムの二重エンコード挙動を再現できていない。

**このテストも `encodeURIComponent` を削除して修正が必要。**

### テスト追加提案

再発防止のために以下のテストを追加することを推奨する:

1. **`staticParams.test.ts`**: `getKanjiRadicals()` の戻り値が URL エンコードされていないこと（`%` 文字を含まないこと）を検証する
2. **`seo-coverage.test.ts`**: radical ページの params にデコードされた値を渡して metadata が正しく生成されることを確認する（修正も兼ねる）
3. **`staticParams.test.ts`（または新規テスト）**: `generateStaticParams` から返された値が `getKanjiRadicals()` の値と一致すること（エンコードなし）を確認する

---

## 修正サマリー

| ファイル | 変更内容 |
|---|---|
| `src/app/dictionary/kanji/radical/[radical]/page.tsx` 14行目 | `encodeURIComponent(r)` → `r` |
| `src/app/__tests__/seo-coverage.test.ts` 310行目 | `encodeURIComponent(radicals[0])` → `radicals[0]` |
| `src/dictionary/_lib/__tests__/staticParams.test.ts` | radical が URL エンコードされていないことを確認するテスト追加 |

変更量は最小限（主に1行の変更）で、影響範囲は部首別漢字一覧ページとそのテストのみ。

