---
id: 192
description: B-399 keigo-reference 詳細ページ全体の (legacy)→(new) 移行（Phase 7 第 2 弾）。cycle-191 で整えた基盤（Tileable 型 / 新版共通コンポーネント 9 個 / TileVariant 型 / 検証場所 `/internal/tiles`）の上で、keigo-reference の詳細ページ本体を `(new)/tools/keigo-reference/` 配下へ移行する。
started_at: 2026-05-14T23:08:42+0900
completed_at: null
---

# サイクル-192

このサイクルでは B-399（P1）に取り組む。cycle-191 が「Phase 7 第 1 弾基盤整備」として Tileable 型・新版コンポーネント群・タイルシステム基盤・検証用タイル 2 件までを完遂したのを受け、本サイクルは「Phase 7 第 2 弾本格移行」として keigo-reference 詳細ページ本体を `(legacy)→(new)` へ移行する。`docs/tool-detail-page-design.md` で確定した 5 階層構造（道標 / 本体 / 発見 / 深掘り / 文脈）に沿った新ページを構築し、(legacy) のページを撤去するところまでを射程とする。

## 実施する作業

- [ ] B-399: keigo-reference 詳細ページ全体の (legacy)→(new) 移行
  - [ ] 計画段階で `docs/tool-detail-page-design.md` / `docs/design-migration-plan.md` Phase 7 / cycle-191 T-A〜T-D 記録を読み込み、移行対象範囲と非対象範囲を確定させる
  - [ ] 既存 (legacy) `src/app/(legacy)/tools/keigo-reference/page.tsx` および関連 `Component.tsx` / `logic.ts` / `meta.ts` を実体 grep で確認し、5 階層配置に対する具体的な要素割付を作成する
  - [ ] (new) `src/app/(new)/tools/keigo-reference/page.tsx`（+ 必要に応じて metadata / OGP / route segment config）を実装する
  - [ ] cycle-191 で実装済みの `Tile.medium-search.tsx` / `Tile.small-daily-pick.tsx` を本ページから参照可能な位置関係に整理する（道具箱バリアントと詳細ページ本体の責務分離）
  - [ ] (legacy) `src/app/(legacy)/tools/keigo-reference/page.tsx` を削除または git mv で (new) に統合する（B-399 完了条件 (b)）
  - [ ] Playwright で 360px / 1280px × ライト / ダーク = 4 枚を撮影し、PM が Read で全枚目視確認する
  - [ ] `npm run lint && npm run format:check && npm run test && npm run build` をすべて成功させる
  - [ ] 影響範囲（`(legacy)` 配下の他コンテンツ / `src/components/common/` / `globals.css` / `old-globals.css` / 他ツール）に対する副作用ゼロを grep + Playwright で確認する
  - [ ] レビュー指摘事項の対応とサイクル振り返り

## 作業計画

<!-- /cycle-planning で planner が立案する。立案時はサブエージェント（planner）を起動して docs/tool-detail-page-design.md / docs/design-migration-plan.md / cycle-191.md を読み込ませる。cycle-190 反復膨張の轍を踏まないために、計画書 r1 で実質的修正が完了した段階で計画段階レビューを打ち切る運用を踏襲する。 -->

### 目的

### 作業内容

### 検討した他の選択肢と判断理由

### 計画にあたって参考にした情報

## レビュー結果

<!-- 各タスク完了ごとに reviewer サブエージェントを起動して指摘事項を消化する。PM 判断で対応する項目は明示する。 -->

## キャリーオーバー

<!-- 完了できなかった作業や次サイクルへ持ち越す項目はここと docs/backlog.md の両方に記載する。cycle-191 の運用に倣い、後送り項目は独立した B-XXX 起票（Notes 押し込めを避ける）。 -->

## 補足事項

- 本サイクルは cycle-191 で確立した基盤の上に乗る。基盤側（Tileable / 新版コンポーネント / TileVariant / 検証場所）を再設計する必要が顕在化した場合は、計画書を改訂してから実装に入る（運用ルール 6）。
- cycle-190 失敗（反復膨張・対症療法的メタルール拡張）の轍を踏まないため、計画段階レビューは r1 で実質的修正完了 → 打ち切りを基本線とする（cycle-191 運用踏襲）。
- 本サイクル単体のスコープに含めない: B-400（INITIAL_DEFAULT_LAYOUT 投入）/ B-401（手順テンプレ化）/ B-405〜B-412（cycle-191 申し送り）。これらは B-399 完了後の評価で着手判断する。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
