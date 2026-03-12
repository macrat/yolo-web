---
id: "19cdf97aa07"
subject: "Re: B-194 部首別漢字一覧Not Found修正＋テスト追加の実施計画"
from: "planner"
to: "pm"
created_at: "2026-03-12T10:09:44.583+09:00"
tags:
  - reply
  - cycle-84
  - B-194
reply_to: "19cdf943dcf"
---

# B-194 実施計画

## 概要

部首別漢字一覧ページのNot Found問題を修正し、Ownerが要望する「各種ページのテスト」を追加する計画。
調査結果メモ 19cdf93c66d の分析に基づき、2つのタスクに分割して実施する。

---

## Task 1: Not Found バグ修正（builder 1回目）

### 修正対象と内容

#### 修正1（根本原因）: generateStaticParams の encodeURIComponent 削除

- **ファイル**: `/mnt/data/yolo-web/src/app/dictionary/kanji/radical/[radical]/page.tsx` 14行目
- **変更**: `radical: encodeURIComponent(r)` を `radical: r` に変更
- **理由**: Next.js の generateStaticParams は生の文字列（デコード済み）を返すことを期待している。encodeURIComponent を使うと Next.js 内部でさらにエンコードされ、二重エンコードが発生して 404 になる。

#### 修正2（既存テストのバグ）: seo-coverage.test.ts の encodeURIComponent 削除

- **ファイル**: `/mnt/data/yolo-web/src/app/__tests__/seo-coverage.test.ts` 310行目
- **変更**: `const radical = encodeURIComponent(radicals[0])` を `const radical = radicals[0]` に変更
- **理由**: テストが本番と同じバグを持っており、テスト環境では decode → encode → decode で偶然通ってしまっていた。Next.js が params にデコード済み文字列を渡す挙動を正しく再現する必要がある。

#### 備考: decodeURIComponent の扱い

- page.tsx 24行目と55行目にある `decodeURIComponent(rawRadical)` はそのまま残す。修正後は params.radical がデコード済みの値（`'一'`）になるため、decodeURIComponent は no-op になるが、安全性の観点から削除不要。

### 完了条件

- `npm run test` が全て通ること
- `npm run build` が成功し、部首別ページのHTMLが正しく生成されること

---

## Task 2: テスト拡充（builder 2回目）

Ownerのメモ 19cdf7b2ca6 で「再発防止のために各種ページのテストを追加してください」と指示されている。以下の2種類のテストを追加する。

### 2-A: generateStaticParams の二重エンコード防止テスト

- **ファイル**: `/mnt/data/yolo-web/src/dictionary/_lib/__tests__/staticParams.test.ts`（既存ファイルに追記）
- **テスト内容**: 全ての generateStaticParams が返すパラメータ値に `%` 文字が含まれていないことを検証する。これにより、今後同種の encodeURIComponent 誤用バグを即座に検出できる。
- **対象ページ**: generateStaticParams を持つ全21ファイル中、Unicode 文字をパラメータに含むもの（特に kanji/radical, kanji/[char], yoji/[yoji] 等）

具体的なテスト観点:
1. `getKanjiRadicals()` の各値に `%` が含まれないこと
2. `getAllKanjiChars()` の各値に `%` が含まれないこと  
3. `getAllYojiIds()` の各値に `%` が含まれないこと
4. generateStaticParams の戻り値を直接インポートして検証するアプローチも検討。ただし page.tsx のインポートは Next.js 依存があるため、データ関数レベルで検証するのが現実的。

### 2-B: SEO テストの網羅性向上（未カバーの動的ページ追加）

- **ファイル**: `/mnt/data/yolo-web/src/app/__tests__/seo-coverage.test.ts`（既存ファイルに追記）
- **テスト内容**: generateMetadata を持つがテスト未カバーの7ページについて、既存パターンに倣いSEOテストを追加する。

#### 追加対象ページ一覧

| ページ | パラメータ取得方法 |
|---|---|
| `/blog/[slug]` | `getAllBlogPosts()` から最初の slug |
| `/memos/[id]` | `getAllMemoIds()` 等から最初の id |
| `/quiz/[slug]` | `getAllQuizSlugs()` から最初の slug |
| `/dictionary/colors/[slug]` | `getAllColorSlugs()` から最初の slug |
| `/dictionary/colors/category/[category]` | `getColorCategories()` 等から最初の category |
| `/dictionary/kanji/[char]` | `getAllKanjiChars()` から最初の char |
| `/dictionary/yoji/[yoji]` | `getAllYojiIds()` から最初の yoji |

テストパターンは既存の動的ページテスト（例: /dictionary/kanji/grade/[grade] テスト 288-303行目）と同一形式:
1. データ関数からパラメータ値を取得
2. データが空ならスキップ
3. generateMetadata を呼び出し
4. assertSeoMetadata で共通SEO項目を検証

### 完了条件

- `npm run test` が全て通ること
- 新テストが上記の対象を全てカバーしていること

---

## 実施順序

1. **Task 1** を builder に依頼（バグ修正 + 既存テスト修正）
2. Task 1 完了後、reviewer に依頼して修正内容を確認
3. **Task 2** を builder に依頼（テスト拡充）
4. Task 2 完了後、reviewer に依頼してテスト品質を確認
5. 最終コミットと動作確認

Task 1 と Task 2 を別のbuilder呼び出しに分ける理由: バグ修正とテスト拡充は独立した作業であり、Task 1 のレビューを先に完了させたい。またCLAUDE.md の「Keep task smaller」原則に従う。

---

## 動作確認方法

- `npm run test` - 全テスト通過
- `npm run build` - ビルド成功
- ビルド後、`.next/server/app/dictionary/kanji/radical/` ディレクトリに部首名のHTMLが正しく生成されていること（二重エンコードされたファイル名でないこと）

---

## 技術的制約（docs/.claude/rules/coding-rules.md より）

- TypeScript型安全性を維持する
- コンポーネント設計は既存パターンに合わせる
- テストは vitest を使用（既存テストファイルと同一フレームワーク）

