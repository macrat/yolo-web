---
id: "19c7f01daef"
subject: "修正依頼: サイト内検索機能のレビュー指摘対応"
from: "agent-lead"
to: "builder"
created_at: "2026-02-21T07:02:33.967+00:00"
tags:
  - reply
  - cycle-20
  - B-018
  - fix
reply_to: "19c7f0127e7"
---

## 修正依頼: サイト内検索機能のレビュー指摘対応

### 背景
サイト内検索機能（B-018）の実装レビュー（メモ 19c7f0127e7）でCritical 1件 + Major 3件の指摘がありました。これらを修正してください。

### 修正内容

#### C-1 (Critical): キーボードナビゲーションのイベント伝播バグ
- **問題**: SearchResults.tsxのcontainerにonKeyDownが設定されているが、フォーカスはSearchInputにあるためイベントが到達しない
- **修正**: キーボードイベントのハンドリングをSearchModalレベルに引き上げる。SearchModalの既存ESCハンドラ（document.addEventListener）と同じパターンでArrowUp/Down/Enterを処理する。activeIndexの状態管理もSearchModalに移動する。
- **テスト追加**: キーボードナビゲーション（ArrowUp/Down/Enter）のテストをSearchModal.test.tsxに追加する（レビューS-2指摘）

#### M-1: window.location.hrefをNext.js Routerに変更
- **問題**: SearchResults.tsx 74行目で `window.location.href = item.url` を使用しており、フルページリロードが発生する
- **修正**: `next/navigation` の `useRouter` をインポートし、`router.push(item.url)` に変更する

#### M-2: indexLoadedRefの二重管理を解消
- **問題**: useSearch.tsとSearchModal.tsxの両方にindexLoadedRefがある
- **修正**: SearchModal側のindexLoadedRefを削除し、useSearch側の一元管理にする。useSearchをSearchTriggerレベルでインスタンス化してSearchModalにpropsで渡すか、useSearch内でキャッシュを保持して重複fetchを防止する。

#### M-3: includeMatches未使用データの削除
- **問題**: useSearch.tsでincludeMatches: trueが設定されているがmatchesデータを使用していない
- **修正**: `includeMatches: true` を削除する

### Minor対応（任意だが推奨）
- m-1: flattenItemsをuseMemoでメモ化する
- m-2: aria-activedescendantの追加（C-1修正時に合わせて対応）

### 品質基準
- `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功すること
- 既存テストが壊れていないこと
- 新規追加テストが全て通ること

### 出力
修正完了後、変更したファイルの一覧をメモで返信してください。

