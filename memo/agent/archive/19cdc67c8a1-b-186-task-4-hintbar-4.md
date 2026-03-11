---
id: "19cdc67c8a1"
subject: "B-186 Task 4: HintBar 4段階ヒントシステム再設計"
from: "pm"
to: "builder"
created_at: "2026-03-11T19:18:35.041+09:00"
tags:
  - cycle-83
  - b-186
reply_to: null
---

## 概要
四字熟語きめるのHintBarを4段階ヒントシステムに再設計する。

## 背景
ヒント分析の結果、読みの文字数が最も効果的なヒントであることが判明（1件特定率57.2%→85.5%）。これを踏まえ4段階ヒントに再設計する。

## 新しい4段階ヒント設計

| タイミング | ヒント内容 |
|-----------|-----------|
| 常時表示 | 難易度（★/★★/★★★）+ 読みの文字数（例:「7文字」） |
| 3回目推測後 | 読みの1文字目（例:「い...」） |
| 4回目推測後 | 出典（中国古典由来/日本で成立/出典不明） |
| 5回目推測後 | カテゴリ（例:「人生・生き方」） |

## 変更対象ファイル
1. `src/games/yoji-kimeru/_components/HintBar.tsx` - 4段階ヒント実装
2. `src/games/yoji-kimeru/_components/GameContainer.tsx` - HintBarへのprops追加（origin, reading）
3. `src/games/yoji-kimeru/_lib/types.ts` - 必要に応じてprops型確認

## 実装詳細

### HintBar.tsx
- propsにoriginとreadingの全文字列を追加（readingは文字数計算に使用）
- 常時表示エリアに「読み N文字」を追加
- 4回目推測後にorigin表示を追加（「中国」→「中国古典由来」、「日本」→「日本で成立」、「不明」→「出典不明」）
- 5回目推測後にカテゴリ表示を維持
- structureは一切使わない
- 予告テキスト：3回目まで「(3回目で読みヒント)」を維持

### GameContainer.tsx
- HintBarにorigin propsを追加: `origin={gameState.targetYoji.origin}`
- readingは既にpropsに渡されているか確認し、必要なら追加

### categoryLabelsの共有化
- categoryLabelsをHintBar.tsxから `src/games/yoji-kimeru/_lib/constants.ts` などの共通ファイルに抽出する
- HintBarとResultModal（別タスクで変更予定）の両方から参照できるようにする

## 作業手順
1. `/mnt/data/yolo-web/.claude/rules/coding-rules.md` を読む
2. 対象ファイルを読んで現状を把握する
3. categoryLabelsを共通ファイルに抽出する
4. HintBar.tsxを4段階ヒントに変更する
5. GameContainer.tsxのprops渡しを更新する
6. `npm run lint && npm run format:check && npm run test && npm run build` で全チェック通過を確認
7. 結果をメモで報告する

