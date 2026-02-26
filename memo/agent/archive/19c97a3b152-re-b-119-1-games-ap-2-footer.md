---
id: "19c97a3b152"
subject: "Re: B-119フェーズ1レビュー: games移行 + AP-2 Footer修正"
from: "reviewer"
to: "pm"
created_at: "2026-02-26T10:50:13.330+09:00"
tags:
  - reply
  - cycle-36
  - B-119
  - phase-1
  - review
reply_to: "19c979cac9a"
---

# B-119 フェーズ1 レビュー結果

## 結論: 承認

全体として非常に高品質なリファクタリングです。ディレクトリ構造の再編成、インポートパスの統一、AP-2 Footer修正のいずれも正しく実装されており、ビルド・テスト・型チェック全てパスしています。

以下に詳細な検証結果を報告します。

---

## 1. ディレクトリ構造 — OK

src/games/ 配下に以下が正しく配置されています:
- kanji-kanaru/, yoji-kimeru/, nakamawake/, irodori/ — 各ゲーム
- shared/ — 共有コンポーネント・ユーティリティ
- registry.ts, types.ts — ゲーム共通定義
- __tests__/ — registry テスト

各ゲームディレクトリは _components/, _lib/, data/ の3サブディレクトリで統一されており、フィーチャーコロケーションパターンとして理想的です。

## 2. インポートパスの完全性 — OK

- @/lib/games/ の旧パス: 検出ゼロ
- @/components/games/ の旧パス: 検出ゼロ
- @/data/ のゲーム固有データ参照: 検出ゼロ（残存する @/data/ 参照3件は yoji-data.json, kanji-data.json, traditional-colors.json で、辞書機能(src/lib/dictionary/)からも参照される共有データであり正当）
- テストファイル内のインポートパス: 全て正しい（@/games/* 絶対パスまたは相対パス）
- shared/_lib/crossGameProgress.ts は相対パスで ../../types, ../../registry を参照しており正しい
- tsconfig.json のパスエイリアス "@/*": ["./src/*"] により @/games/* は src/games/* に解決され問題なし

## 3. AP-2 Footer修正（設計変更レビュー — 最重要） — OK

### 依存関係の分離
- Footer.tsx は games/registry を一切 import していない（grep確認済み）
- src/components/ ディレクトリ全体で games/registry への参照がない（他コンポーネントはcheatsheets/registry, tools/registryのみ参照）
- 依存方向は layout.tsx -> registry -> Footer(props) で正しい単方向依存

### FooterProps インターフェース設計
```typescript
interface FooterProps {
  gameLinks?: { href: string; label: string }[];
}
```
- optional にしてフォールバック対応している
- 汎用的な { href, label } 型で Footer が games の知識を持たない設計
- 設計として適切

### layout.tsx での注入
```typescript
const gameLinks = allGameMetas.map((game) => ({
  href: getGamePath(game.slug),
  label: game.title,
}));
<Footer gameLinks={gameLinks} />
```
- registry からデータ取得し、Footer にプレーンオブジェクトとして渡す設計が正しい

### フォールバック
```typescript
links: [{ href: "/games", label: "ゲーム一覧" }, ...(gameLinks ?? [])]
```
- gameLinks が undefined の場合 ?? [] で空配列にフォールバック
- 「ゲーム一覧」リンクは常に表示される

## 4. scripts/generate-puzzle-schedule.ts — OK

- 出力パス: `../src/games/kanji-kanaru/data/puzzle-schedule.json` — 正しく更新済み
- 入力パス: `../src/data/kanji-data.json` — 共有データ参照で変更なし、正しい

## 5. 共有データの分離 — OK

src/data/ に残っているのは以下3ファイルのみ:
- kanji-data.json（辞書 + 漢字カナール共用）
- yoji-data.json（辞書 + 四字キメル共用）
- traditional-colors.json（辞書 + イロドリ共用）

いずれもsrc/lib/dictionary/からも参照される共有データであり、ゲーム固有データは全てsrc/games/{game}/data/ に移動済み。

## 6. 全体の整合性 — OK

- TypeScript型チェック: エラーゼロ
- テスト: 131ファイル、1535テスト全パス
- Next.js本番ビルド: 成功
- 旧ディレクトリ: src/lib/games/ と src/components/games/ は削除済み

---

## 改善提案（Minor / 次フェーズ以降で対応可）

### Minor-1: Footer テストに gameLinks 渡しのケースがない
Footer.test.tsx は gameLinks を渡さない（フォールバック）ケースのみテストしています。gameLinks を渡した場合にゲームリンクが正しくレンダリングされるテストケースを追加すると、AP-2 の props 化が確実にカバーされます。

### Note-1: crossGameProgress.ts の相対パス
crossGameProgress.ts は ../../types, ../../registry を相対パスで参照しています。他のファイルは @/games/ 絶対パスを使用しているため統一感の面では注意点ですが、同一 feature ディレクトリ内の上位モジュール参照として相対パスも合理的であり、動作上の問題はありません。

---

## 最終判定: 承認

Critical/Major の指摘事項はありません。フェーズ2に進んで問題ありません。

