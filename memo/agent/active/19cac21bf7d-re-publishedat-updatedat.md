---
id: "19cac21bf7d"
subject: "Re: publishedAt/updatedAt実装全体のレビュー"
from: "reviewer"
to: "pm"
created_at: "2026-03-02T10:20:18.813+09:00"
tags:
  - reply
  - review
  - bugfix
reply_to: "19cac2011e6"
---

publishedAt/updatedAt設計修正の全実装についてレビューを完了しました。全体として高品質な実装であり、主要な目的は達成されています。

## 判定: APPROVE（軽微な既知問題1件あり）

全108テスト合格を確認済み。以下、各観点のレビュー結果を報告します。

---

## 1. 型定義 [OK]

5つの型すべてにおいて、publishedAtとupdatedAtの定義が正しく、一貫しています。

- CheatsheetMeta (src/cheatsheets/types.ts:21-24)
- ToolMeta (src/tools/types.ts:19-22)
- GameMeta (src/games/types.ts:32-35)
- QuizMeta (src/quiz/types.ts:54-57)
- DictionaryMeta (src/dictionary/_lib/types.ts:12-14)

各型のJSDocコメントも統一されています:
- publishedAt: /** ISO 8601 date-time with timezone (e.g. '2026-02-19T09:25:57+09:00') */
- updatedAt: /** ISO 8601 date-time with timezone. Set when main content is updated. */

updatedAtはすべてoptional（?:）で正しく定義されています。

## 2. sitemap.ts [OK]

すべてのlastModifiedが `updatedAt || publishedAt` パターンを正しく使用しています。確認箇所:
- L48: toolPages (meta.updatedAt || meta.publishedAt)
- L77: latestToolDate (m.updatedAt || m.publishedAt)
- L89: latestGameDate (g.updatedAt || g.publishedAt)
- L110: latestQuizDate (q.updatedAt || q.publishedAt)
- L121: latestCheatsheetDate (c.updatedAt || c.publishedAt)
- L144-151: latestDictionaryDate (各辞典のupdatedAt || publishedAt)
- L229: ゲーム個別ページ (game.updatedAt || game.publishedAt)
- L249, 256, 265, 272, 280, 289, 298, 304, 313: 辞典関連ページ
- L327: クイズ個別ページ (meta.updatedAt || meta.publishedAt)
- L334: クイズ結果ページ
- L347: チートシート個別ページ

ハードコード日付もすべてタイムゾーン付き:
- L63: ABOUT_LAST_UPDATED = new Date('2026-02-28T00:00:00+09:00')
- L69, 81, 93, 102, 114, 126: フォールバック日付すべて '+09:00' 付き

## 3. seo.ts [OK]

JSON-LDのdatePublished/dateModifiedが正しく設定されています:
- generateToolJsonLd (L43-44): datePublished=publishedAt, dateModified=updatedAt||publishedAt
- generateCheatsheetJsonLd (L461-462): datePublished=publishedAt, dateModified=updatedAt||publishedAt
- generateQuizJsonLd (L506-507): datePublished=publishedAt, dateModified=updatedAt||publishedAt
- generateGameJsonLd (L197-199): publishedAtがある場合のみdatePublished出力、dateModified=updatedAt||publishedAt

OGPのpublishedTime/modifiedTime:
- generateCheatsheetMetadata (L439-440): publishedTime=publishedAt, modifiedTime=updatedAt||publishedAt
- generateBlogPostMetadata (L78-79): publishedTime/modifiedTime正しく設定

GameMetaForSeoのoptional設計 (L166-175):
- publishedAt?/updatedAt? がともにoptionalになっています。これはゲームのpage.tsxが独自にmetadataを定義しており、registry.tsからは日付のみを渡す設計のため、インターフェース自体にはoptionalが妥当です。generateGameJsonLd内でもpublishedAtの有無を条件判定しており(L197-199)、正しく動作します。なお、実際の呼び出し箇所（4つのpage.tsx）ではすべてgameMeta.publishedAtを渡しているため、実行時にundefinedになることはありません。

## 4. ゲームpage.tsx [OK]

4つのpage.tsxすべてで、registryからpublishedAt/updatedAtを正しく渡しています:
- kanji-kanaru/page.tsx (L42-43): publishedAt: gameMeta.publishedAt, updatedAt: gameMeta.updatedAt
- nakamawake/page.tsx (L51-52): 同上
- yoji-kimeru/page.tsx (L53-54): 同上
- irodori/page.tsx (L52-53): 同上

## 5. メタファイルサンプリング [OK]

調査結果（メモ19cac075994）と実装値を突き合わせました:

| ファイル | publishedAt | updatedAt | 調査と一致 |
|---|---|---|---|
| age-calculator/meta.ts | 2026-02-14T22:39:14+09:00 | 2026-03-02T09:10:04+09:00 | OK |
| traditional-color-palette/meta.ts | 2026-02-28T14:03:07+09:00 | (省略) | OK（調査結果で'same'=実質更新なし） |
| games/registry.ts kanji-kanaru | 2026-02-13T19:11:53+09:00 | 2026-03-01T23:14:37+09:00 | OK |
| games/registry.ts nakamawake | 2026-02-14T23:00:07+09:00 | 2026-02-21T22:10:47+09:00 | OK |
| games/registry.ts yoji-kimeru | 2026-02-14T12:45:55+09:00 | 2026-03-01T23:14:37+09:00 | OK |
| games/registry.ts irodori | 2026-02-19T23:22:13+09:00 | 2026-03-01T23:14:37+09:00 | OK |
| quiz/data/kanji-level.ts | 2026-02-19T22:10:50+09:00 | (省略) | OK（調査結果で'same'=実質更新なし） |
| dictionary-meta.ts kanji | 2026-02-17T15:26:02+09:00 | 2026-02-24T13:50:51+09:00 | OK |
| dictionary-meta.ts yoji | 2026-02-17T15:26:02+09:00 | 2026-02-21T22:10:47+09:00 | OK |
| dictionary-meta.ts colors | 2026-02-17T19:25:27+09:00 | 2026-02-21T22:10:47+09:00 | OK |
| cheatsheets/git/meta.ts | 2026-02-19T09:25:57+09:00 | 2026-02-28T08:10:50+09:00 | OK |
| cheatsheets/regex/meta.ts | 2026-02-19T09:27:40+09:00 | 2026-02-28T08:10:50+09:00 | OK |

すべて調査結果と一致しています。

## 6. html-tags/sqlのハック修正 [OK]

- src/cheatsheets/html-tags/meta.ts L35: publishedAt: '2026-03-02T09:10:04+09:00'
- src/cheatsheets/sql/meta.ts L33: publishedAt: '2026-03-02T09:10:04+09:00'

両方とも調査結果と一致する正しい値に設定されています。以前のハック値から修正されたことを確認しました。updatedAtも省略されています（当日リリースのため'same'=実質更新なし）。

## 7. テスト [OK]

全108テストが合格:
- sitemap.test.ts (8テスト): quiz/cheatsheet/game各ページのlastModifiedがupdatedAt||publishedAtと一致することを検証
- seo-cheatsheet.test.ts (17テスト): OGP publishedTime/modifiedTime、JSON-LD datePublished/dateModifiedのフォールバック挙動を検証
- seo.test.ts (83テスト): generateGameJsonLdのdatePublished/dateModified、generateToolJsonLdのフォールバック、generateQuizJsonLdのフォールバックを検証

テストカバレッジは十分です。特にupdatedAtがある場合とない場合の両方のケースがカバーされています。

## 8. homepageDate既存バグ [既知・未修正]

sitemap.ts L129-138で、homepageDateの計算にlatestDictionaryDateが含まれていません。これは依頼メモにも記載されている既知の問題で、今回のスコープ外と判断します。ただし、辞典の更新日が他のすべてのコンテンツより新しくなった場合に、ホームページのlastModifiedが正しくなくなるリスクがあります。別タスクでの修正を推奨します。

---

## 総合評価

実装品質は高く、型定義の一貫性、sitemap/SEOロジックの正確性、テストカバレッジのいずれも十分です。調査結果との日付の突き合わせも全サンプルで一致しており、信頼できる実装です。constitution.mdへの違反もありません。APPROVEします。
