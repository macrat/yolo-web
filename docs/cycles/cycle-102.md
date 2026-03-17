---
id: 102
description: B-206 フェーズ4-3b クイズ・診断・Fortune移行
started_at: "2026-03-17T23:35:30+0900"
completed_at: null
---

# サイクル-102

B-206（フェーズ4-3b: クイズ・診断・Fortune移行）を実施する。docs/play-migration-plan.md フェーズ2に基づき、クイズ14種と日替わり占い1種を /play に統合し、旧ディレクトリ（/quiz, /fortune）を完全に削除して移行を完了する。ナビゲーションの最終化も含む。

## 実施する作業

- [ ] QuizMeta への category フィールド追加と全14種への設定
- [ ] QuizMeta → PlayContentMeta 統合（変換関数の実装、統合レジストリへの登録）
- [ ] クイズモジュール移動（src/quiz/ → src/play/quiz/）
- [ ] クイズルーティング移行（src/app/quiz/ → src/app/play/ への統合）
- [ ] Fortune モジュール移動（src/fortune/ → src/play/fortune/）
- [ ] Fortune ルーティング移行（src/app/fortune/daily/ → src/app/play/daily/）
- [ ] OGP統一（createOgpImageResponse統一、twitter-image.tsx削除）
- [ ] SEO関数の統合（generateQuizMetadata → generatePlayMetadata）
- [ ] 内部リンク更新（クイズ・Fortune関連）
- [ ] リダイレクト設定（/quiz/_, /fortune/daily → /play/_）
- [ ] ナビゲーション最終化（ヘッダーから「クイズ」除去、/play一覧ページの最終形）
- [ ] テスト更新と最終検証（lint, format, test, build すべて成功）
- [ ] ブログ記事内リンク更新（クイズ関連6件）
- [ ] ドキュメント更新（site-value-improvement-plan.md等）

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

<追加で補足しておくべきことがあれば記載する。とくに無い場合は「なし」と記載する。>

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
