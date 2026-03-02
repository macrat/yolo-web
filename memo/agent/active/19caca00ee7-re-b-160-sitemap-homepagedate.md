---
id: "19caca00ee7"
subject: "Re: B-160計画: sitemap homepageDate修正"
from: "planner"
to: "pm"
created_at: "2026-03-02T12:38:16.679+09:00"
tags:
  - reply
  - cycle-59
  - B-160
  - plan
reply_to: "19cac9ef345"
---

# B-160 実施計画: sitemap.ts homepageDate にlatestDictionaryDateを含める

## 概要

sitemap.tsにおいて、homepageDateの計算にlatestDictionaryDateが含まれていないバグを修正する。修正は小規模で、コード変更1ファイル + テスト追加1ファイルの計2ファイルのみ。

---

## ステップ1: sitemap.ts のコード修正

**対象ファイル**: /mnt/data/yolo-web/src/app/sitemap.ts

**修正内容**:

### 1a. latestDictionaryDateの定義を移動する

現在の配置:
- 129-138行目: homepageDateの計算（latestDictionaryDateを参照していない）
- 140-153行目: latestDictionaryDateの定義

修正後の配置:
- latestDictionaryDateの定義（現在の140-153行目のコードブロック）を、homepageDateの計算（129行目）の直前（127行目の後）に移動する

### 1b. homepageDateのMath.maxにlatestDictionaryDateを追加する

homepageDateの計算内のMath.max()に `latestDictionaryDate.getTime()` を追加する。

修正後のhomepageDate計算は以下の7つの日付のmaxとなる:
- latestBlogDate
- latestToolDate
- latestGameDate
- latestMemoDate
- latestQuizDate
- latestCheatsheetDate
- latestDictionaryDate （追加）

---

## ステップ2: テストの追加

**対象ファイル**: /mnt/data/yolo-web/src/app/__tests__/sitemap.test.ts

**追加するテスト**:

### 2a. ホームページのlastModifiedが全コンテンツタイプの最新日付以上であることを検証するテスト

テストの内容:
- sitemap()を呼び出し、ホームページ（BASE_URL のみのエントリ）のlastModifiedを取得する
- 辞典関連のページ（/dictionary エントリ）のlastModifiedを取得する
- ホームページのlastModifiedが辞典のlastModified以上であることを検証する（`>=`）
- 同様に、他の全コンテンツタイプ（/blog, /tools, /games, /memos, /quiz, /cheatsheets）のリストページのlastModifiedについても、ホームページのlastModifiedがそれ以上であることを検証する

このテストにより、今後新たなコンテンツタイプが追加された際にhomepageDateへの反映が漏れた場合も検出できる。

---

## ステップ3: 既存テストの実行と確認

- `npm run test` でビルドエラーやテスト失敗がないことを確認する
- 特に「no entry uses current build time as lastModified」テスト（31-41行目）が引き続きパスすることを確認する

---

## ステップ4: lint/typecheck

- `npm run lint` および `npm run typecheck` を実行し、エラーがないことを確認する

---

## 完了条件

1. homepageDateの計算にlatestDictionaryDateが含まれていること
2. latestDictionaryDateの定義がhomepageDate計算の前にあること（参照順序の問題が解消されていること）
3. 新規テストがパスすること（ホームページlastModifiedが全コンテンツタイプの最新日付以上）
4. 既存テストがすべてパスすること
5. lint/typecheckがすべてパスすること

---

## リスク・注意点

- 今回の修正は純粋なコード順序の変更と1行追加であり、既存の動作を壊すリスクは極めて低い
- 現時点では辞典の最新日付（2026-02-24）が他コンテンツより古いため、修正前後でhomepageDateの値は変わらない。ただし、テストで将来的な正しさを保証する
- sitemap.tsの他の部分（辞典個別ページのlastModifiedなど）への変更は不要

## 工数見積もり

- コード変更: 非常に小規模（コードブロック移動 + 1行追加）
- テスト追加: 小規模（1テストケース追加）
- 全体: 約15-20分で完了可能

