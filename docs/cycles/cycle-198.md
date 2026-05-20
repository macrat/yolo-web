---
id: 198
description: B-426（タイル基盤実装 / 移行計画 Phase 7）への再着手。cycle-191/192/193/195 の 4 連敗からの再挑戦で、Phase 8（B-314）の前提となる Phase 7 をやり切ることを目指す。
started_at: 2026-05-20T23:07:39+0900
completed_at: null
---

# サイクル-198

このサイクルでは、`docs/design-migration-plan.md` の Phase 7（タイル基盤実装、B-426）に再着手する。cycle-191/192/193/195 で 4 連続失敗しており、cycle-197 の振り返りでも「cycle-198 は Phase 7 または Phase 8 に戻る」と方向確定している。Phase 8（B-314 = ツール・遊び詳細ページの新デザイン移行 + タイル化）はこの Phase 7 完了を前提としているため、ここをやり切らないと Phase 8 以降には進めない構造になっている。

cycle-197 振り返りで明示された必須前提に従う:

1. `docs/design-migration-plan.md` Phase 2.2 / Phase 7.1 / Phase 8.1 を PM 自身が直接 Read する（過去サイクルの解釈を経由しない）
2. Phase 2.2 の 3 形態想定（1 対 1 / 1 対多 / 複数バリエーション）を型契約に反映する（cycle-195 のように 1 形態に絞らない）
3. Phase 7.1 の「入出力 placeholder 等」要件を Phase 7.1 のスコープに含める
4. Phase 8.1 #3 が各サイクルで (a)/(b)/(c) いずれかを採れる前提を codegen 規約で表現する
5. robots.txt には hidden URL を載せない（cycle-175 / cycle-195 同型事故防止）

また `docs/cycles/cycle-195.md` 事故報告 A-1〜A-6 を `/cycle-planning` 段階で直接 Read してから着手計画を立てる。

## 実施する作業

- [ ] `/cycle-planning` で作業計画を立てる。その際、以下を必ず planner が PM 自身で直接 Read してから計画する:
  - [ ] `docs/design-migration-plan.md` の Phase 2.1 / Phase 2.2 / Phase 7.1 / Phase 7.2 / Phase 7.3 / Phase 8.1（過去サイクル解釈を経由しない）
  - [ ] `docs/cycles/cycle-195.md` の事故報告 A-1〜A-6
  - [ ] `docs/cycles/cycle-191.md` / `cycle-192.md` / `cycle-193.md` の事故報告・キャリーオーバー
  - [ ] 現存している成果物（cycle-195 で保存された `src/lib/toolbox/tile-grid.ts` の物理定数、`src/app/globals.css` の CSS Custom Properties、`src/app/robots.ts` のコメント等）の実体を Read で確認
- [ ] B-426 = Phase 7 のスコープを「再着手必須前提 (i)〜(v) を踏まえた最小実装」として再定義する
- [ ] サイクル内で完了可能な単位までスコープを絞り込む（一括で全 Phase 7 をやろうとして膨張させない）
- [ ] `/cycle-execution` で実装する
- [ ] `/cycle-completion` で完了させる

## 作業計画

<plannerが立案した作業の詳細な実施計画をここに記載する。何を何のためにどのようにやるのかを具体的に書き、作業を進めながら方針が変わった場合は随時アップデートすること。>

### 目的

### 作業内容

### 検討した他の選択肢と判断理由

### 計画にあたって参考にした情報

## レビュー結果

<作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。>

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

## 補足事項

### kickoff 時の選定判断

- **B-426 を選んだ理由**: cycle-197 振り返り（`docs/cycles/cycle-197.md` 「次サイクルの方向性」セクション）で、cycle-198 は Phase 7（B-426）または Phase 8（B-314）に戻ることが Owner 指摘経由で確定している。Phase 8 = B-314 は Phase 7 = B-426 の完了が前提（B-314 の Notes に明記）のため、選択肢は実質 B-426 のみ。Phase 7 を 5 サイクル目に挑むことになるが、`design-migration-plan.md` という具体計画書を無視し続けることのほうが visitor 価値最大化から遠ざかる。
- **検討した他の選択肢**:
  - 独立 P3 タスク（B-388 Pagination 44px / B-393 Header 44px / B-390 AP 集監査 等）: cycle-197 で「成功体験を継続するための独立・低リスクタスク」を選んだ判断が **Owner 指摘で計画違反と認定** されたため、同じ路線は採れない。
  - Phase 7 を回避して Phase 8 のうち Phase 7 非依存の部分だけやる: Phase 8 全体が Phase 7 のタイル基盤に依存するため不可。
- **キャンセル条件**: なし。Phase 7 をやり切るまで他のフェーズには進めない構造。

### 4 連敗を踏まえた歯止め策（cycle-planning に渡す指針）

- **過去判定の所与継承を絶つ**: planner / builder 共に `cycle-193.md` / `cycle-195.md` の「結論」を再利用しない。原典である `docs/design-migration-plan.md` を Read で直接読み、そこから出発する。
- **スコープを膨張させない**: cycle-191/192/193/195 はいずれも「Phase 7 を一括で完成させる」前提で膨張して破綻している。1 サイクルでは Phase 7.1（型契約）/ Phase 7.2（サイズ枠規格）/ Phase 7.3（レジストリ）/ Phase 7.x（タイル placeholder 等）のうちどれを完成させるかを planner が明示的に切り分ける。
- **robots.txt に hidden URL を書かない**: cycle-175 / cycle-195 で同型事故が起きており、cycle-195 では事後修正コミット（`fe687675 cycle-195 事後修正: robots.txt 重大事故対応`）が必要になった。本サイクルでは hidden URL の存在自体を sitemap / robots に出さない方針を計画段階で確定する。
- **計画立案後にレビューを必ず通す**: planner が立てた計画に対し、別の reviewer エージェントに「`design-migration-plan.md` Phase 2.2 / Phase 7.1 / Phase 8.1 と整合しているか」を検証させる。レビューで否定された場合は再計画する。

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
