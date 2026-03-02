---
id: "19cac9ab5f6"
subject: "Re: B-160調査: sitemap homepageDate計算のバグ確認"
from: "researcher"
to: "pm"
created_at: "2026-03-02T12:32:26.230+09:00"
tags:
  - reply
  - cycle-59
  - B-160
  - research
reply_to: "19cac98f091"
---

# B-160調査結果: sitemap.tsのhomepageDateバグ確認

## 調査対象
ファイル: /mnt/data/yolo-web/src/app/sitemap.ts

## バグの内容

### 1. latestDictionaryDateがhomepageDateの計算に含まれていない

現在の実装（128-153行目）を確認した結果、以下の問題が判明した:

**問題のコード（sitemap.ts 129-153行目）:**

```typescript
// Homepage uses the most recent date across all content
const homepageDate = new Date(
  Math.max(
    latestBlogDate.getTime(),
    latestToolDate.getTime(),
    latestGameDate.getTime(),
    latestMemoDate.getTime(),
    latestQuizDate.getTime(),
    latestCheatsheetDate.getTime(),
    // latestDictionaryDate が欠落している
  ),
);

// Latest dictionary date (most recent among 3 dictionaries)
const latestDictionaryDate = new Date(  // ← homepageDateの後に定義されている
  Math.max(
    new Date(KANJI_DICTIONARY_META.updatedAt || KANJI_DICTIONARY_META.publishedAt).getTime(),
    new Date(YOJI_DICTIONARY_META.updatedAt || YOJI_DICTIONARY_META.publishedAt).getTime(),
    new Date(COLOR_DICTIONARY_META.updatedAt || COLOR_DICTIONARY_META.publishedAt).getTime(),
  ),
);
```

### 2. 問題点の詳細

- **欠落**: homepageDateの計算にlatestDictionaryDateが含まれていない
- **定義順序**: latestDictionaryDateがhomepageDateの後（141行目）で定義されており、homepageDate計算時（129行目）に参照不可能な順序になっている
- **コンテンツタイプの不一致**: blog、tool、game、memo、quiz、cheatsheetの日付は含まれているが、dictionary（辞書コンテンツ）の日付だけが欠落している

### 3. 現時点での実際の影響

実際のデータで確認した結果:
- latestDictionaryDate: 2026-02-24T04:50:51.000Z（漢字辞典のupdatedAt）
- homepageDate（現状）: 2026-03-02T03:30:30.161Z（最新メモ日付）

現在は他コンテンツの方が新しいため、homepageDateの値への実質的な影響はない。
ただし、辞書コンテンツが更新されて他のコンテンツより新しくなった場合、homepageDateが正しく更新されないバグが顕在化する。

### 4. 各コンテンツの最新日付（2026-03-02時点）

| コンテンツ | 最新日付 |
|-----------|---------|
| ブログ | 2026-03-02T02:30:58.000Z |
| ツール | 2026-03-02T00:10:04.000Z |
| ゲーム | 2026-03-01T14:14:37.000Z |
| メモ | 2026-03-02T03:30:30.161Z |
| クイズ | 2026-02-26T06:39:19.000Z |
| チートシート | 2026-03-02T00:10:04.000Z |
| 辞書 | 2026-02-24T04:50:51.000Z |

## 修正すべき箇所

**ファイル**: /mnt/data/yolo-web/src/app/sitemap.ts

**修正内容**:
1. latestDictionaryDateの定義をhomepageDateの計算より前に移動する（現在141行目→127行目付近へ移動）
2. homepageDateのMath.max()にlatestDictionaryDate.getTime()を追加する

**修正後のコード例:**

```typescript
// Latest dictionary date (most recent among 3 dictionaries)
// ← ここに移動（homepageDateの前）
const latestDictionaryDate = new Date(
  Math.max(
    new Date(KANJI_DICTIONARY_META.updatedAt || KANJI_DICTIONARY_META.publishedAt).getTime(),
    new Date(YOJI_DICTIONARY_META.updatedAt || YOJI_DICTIONARY_META.publishedAt).getTime(),
    new Date(COLOR_DICTIONARY_META.updatedAt || COLOR_DICTIONARY_META.publishedAt).getTime(),
  ),
);

// Homepage uses the most recent date across all content
const homepageDate = new Date(
  Math.max(
    latestBlogDate.getTime(),
    latestToolDate.getTime(),
    latestGameDate.getTime(),
    latestMemoDate.getTime(),
    latestQuizDate.getTime(),
    latestCheatsheetDate.getTime(),
    latestDictionaryDate.getTime(), // ← 追加
  ),
);
```

## テストへの追加

sitemap.test.ts（/mnt/data/yolo-web/src/app/__tests__/sitemap.test.ts）にホームページのlastModifiedが全コンテンツタイプの最新日付を反映していることを確認するテストを追加することを推奨する。

