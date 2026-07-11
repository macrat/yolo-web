# 並列衝突回避方針（builder 向け運用ルール）

cycle-225 / B-490 の全本再構築フェーズ（T-6/T-7）では、34本のツールを
workflow で並列再構築する。builder 同士がファイルを取り合って衝突しないよう、
この文書で編集許可範囲と禁止操作を明文化する。

**着手前に必ずこの文書を読むこと。**

---

## 1. 各 builder の編集許可範囲（自ツールディレクトリ完結）

各 builder が触ってよいファイルは、**自分が担当するスラッグのディレクトリのみ**。

| 群                  | 触ってよいディレクトリ                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| A群（移行済み20本） | `src/tools/<slug>/`<br>`src/app/(new)/tools/<slug>/`                                                                                      |
| B群（未移行14本）   | `src/tools/<slug>/`<br>`src/app/(new)/tools/<slug>/`（新規作成）<br>`src/app/(legacy)/tools/<slug>/`（自 slug 分のみ。`git mv` の移動元） |

他スラッグのディレクトリは一切触らない（AP-WF13）。

> 実機確認: `src/app/(new)/tools/` 配下の A群20スラッグ・`src/app/(legacy)/tools/` 配下の B群14スラッグが
> 独立ディレクトリとして存在していることを `ls` で確認済み。

---

## 2. 触ってはいけない共有ファイル

以下のファイルは複数ツールが依存する共有資産。**builder は一切編集しない**。
これらへの変更は直列段（T-8 ほか）に集約する。

| ファイル / ディレクトリ                     | 理由                                                                 |
| ------------------------------------------- | -------------------------------------------------------------------- |
| `src/tools/_constants/tile-declarations.ts` | 簡素 `*Tile.tsx` 20本を一括 import する SSoT。並列で編集すると即衝突 |
| `src/tools/registry.ts`                     | tools レジストリの thin re-export（codegen 生成物を参照）            |
| `src/tools/generated/tools-registry.ts`     | `generate:toolbox-registry` の生成物。手編集禁止                     |
| `src/tools/generated/tiles-registry.ts`     | `generate:tiles-registry` の生成物。手編集禁止                       |
| `src/app/(new)/internal/tiles/**`           | `tile-declarations.ts` に依存するプレビュールート（noindex）         |
| `src/app/sitemap.ts`                        | tools レジストリに依存。個別ツール作業では不変                       |
| `src/app/globals.css`                       | サイト全体のグローバルスタイル                                       |
| `/DESIGN.md`                                | デザイントークン・指針の SSoT                                        |

> 実機確認コマンド:
>
> - `grep "^import.*Tile from" src/tools/_constants/tile-declarations.ts | wc -l` → **20** （`import type` 行を除く実コンポーネント import のみ一致）
> - `grep "registry\|tile-decl\|tiles-registry" src/app/sitemap.ts` → sitemap は tools registry にのみ依存し tile-declarations には非依存を確認

---

## 3. tools レジストリは手編集不要（codegen が自動再生成する）

`src/tools/generated/tools-registry.ts` は `scripts/generate-toolbox-registry.ts` が
`src/tools/*/meta.ts` を自動スキャンして生成する。

- **生成タイミング**: `prebuild` / `predev` / `pretest`（package.json で明記）
- **コマンド**: `npm run generate:toolbox-registry`
- **スキャン対象**: `src/tools/{slug}/meta.ts`（各スラッグの meta.ts が存在すれば自動登録）

B群14本はすでに `src/tools/<slug>/meta.ts` を持ち、`tools-registry.ts` に登録済み。
B群 builder が `(legacy)→(new)` に `git mv` しても、レジストリ側は変更不要。
`page.tsx` を `(new)` に配置した後、次の `predev/prebuild` で自動的に反映される。

> 実機確認コマンド:
>
> - B群14本の meta.ts 存在: `ls src/tools/age-calculator/meta.ts` 等で全本確認
> - `grep "json-formatter\|age-calculator\|unit-converter" src/tools/generated/tools-registry.ts` → 既登録を確認
> - `grep '"generate:toolbox-registry"' package.json` → `tsx scripts/generate-toolbox-registry.ts` を確認
> - `grep '"prebuild"' package.json` → `generate:toolbox-registry && generate:tiles-registry && generate:static-assets` の3コマンド呼び出しを確認

---

## 4. 簡素 `*Tile.tsx` には触れない（消さない）

A群20本の `*Tile.tsx`（例: `src/tools/base64/Base64Tile.tsx`）は、
共有ファイル `tile-declarations.ts` が20本を一括 import しており、
さらに各 Tile 専用テスト・`internal/tiles` プレビューからも参照されている。

**builder が並列で自分の `*Tile.tsx` を削除すると次の障害が即発する:**

1. `tile-declarations.ts` の import が解決不能 → ビルド全体が破綻
2. `<slug>/__tests__/<Name>Tile.test.tsx` の import が解決不能
3. `internal/tiles/preview/[domain]/[slug]/page.tsx` の import が解決不能

したがって **builder は `*Tile.tsx` に一切触れない**（生かしておく）。
撤去は T-8（DELETION UNIT 一括撤去）が `tile-declarations.ts` および
相互依存ごと直列で実施する（個別 builder が 1本ずつ漸進的に消す方法は、共有 import を壊す場当たり回避策になるため不可。AP-I02）。

A群の page.tsx の「描画対象を Component から単一実装へ差し替え・Component 削除」が
builder の完了条件であり、`*Tile.tsx` の撤去は完了条件に含まれない。

> 実機確認コマンド:
>
> - `find src/tools -name "*Tile.tsx" | wc -l` → 20本存在を確認
> - `grep "^import.*Tile from" src/tools/_constants/tile-declarations.ts | wc -l` → **20** （`import type` 行を除く実コンポーネント import が20本一致）

---

## 5. B群の `git mv` は自 slug 分のみ

B群 builder は自分が担当するスラッグの1ディレクトリを `git mv` する。

```
git mv src/app/(legacy)/tools/<slug> src/app/(new)/tools/<slug>
```

- `opengraph-image.tsx` と `twitter-image.tsx` を含むディレクトリごと移動する
- 他スラッグの `git mv` は絶対に行わない（AP-WF13）

B群のディレクトリ構成（全14本で同じ・実機確認済み）:

```
src/app/(legacy)/tools/<slug>/
  page.tsx
  opengraph-image.tsx
  twitter-image.tsx
```

A群の `(legacy)/tools/<slug>/` は空ディレクトリ（ファイルゼロ・git 追跡外の残骸）。
衝突しないため本サイクルでは放置してよい（最終撤去は Phase 11 / B-337）。

> 実機確認コマンド:
>
> - `ls src/app/(legacy)/tools/json-formatter/` → `opengraph-image.tsx page.tsx twitter-image.tsx` の3点を確認
> - `find src/app/(legacy)/tools/char-count -type f | wc -l` → **0**（A群スラッグは空ディレクトリ。base64 は (legacy) に存在しないため char-count 等の実在する空ディレクトリで確認）

---

## 6. worktree 分離は不要

各 builder の編集が自ツールディレクトリに閉じるため、worktree 分離（追加コスト）は不要と判断する。

根拠（すべて実機確認済み）:

- tools レジストリは codegen で自動再生成される → 手編集ゼロ・衝突ゼロ
- `tile-declarations.ts` は builder が編集しない → kind 撤去は T-8 一括まで現状凍結
- `sitemap.ts` は registry 依存のみ → 個別ツール作業では不変
- `internal/tiles` は builder が触らない → T-8 の DELETION UNIT 対象

各ツールのビルド・テストが自ディレクトリ完結のため、並列実行による相互干渉は発生しない。

---

## 参照先

- `docs/cycles/cycle-225.md` §「並列衝突リスクの解消（worktree 不要の判断含む）」
- AP-WF13（`docs/anti-patterns/workflow.md`）: builder のスコープ越境抑止
- AP-I02（`docs/anti-patterns/implementation.md`）: 個別ケースのハードコードや場当たり回避禁止。本文書での適用＝1本ずつ漸進削除は共有 import を壊す場当たり回避策に当たる
