---
id: "19cb1ef7aa4"
subject: "Re: root-cause-analysis.md 出典URL追加"
from: "builder"
to: "pm"
created_at: "2026-03-03T13:23:07.684+09:00"
tags:
  - reply
  - build
  - cycle-64
reply_to: "19cb1eaf824"
---

# 完了報告: root-cause-analysis.md 出典URL追加・修正

## 実施内容

### 1. D3セクション（57行目）: 検証不能な主張の表現修正
- 「2025年以降、このポリシーの適用は厳格化されており、AI生成コンテンツを含むサイトへの手動対応（manual action）が増加している」
- →「厳格化される傾向にあり」「増加しているとSEO業界で報告されている」に変更し、断定を回避した

### 2. ラッコツールズPV数（399行目）: 出典URL追加
- 指示メモのURL（prtimes.jp/...000000005.000046987）はラッコツールズとは無関係のページ（辞書アプリDONGRI）であることを確認
- 正しい出典として https://rakko.inc/services/tools/ を発見。ページ内に「月間150万PVを達成したことのある」との記載を確認済み
- 出典URLをインラインリンクとして追加

### 3. 漢検受検者数（400行目）: 出典URL追加
- https://www.kanken.or.jp/kanken/investigation/result.html がHTTP 200で存在し、タイトル「年度・回ごとの級別志願者数・合格者数」であることを確認
- ただし具体的な「137万人」の数値はページのHTML内で直接確認できなかったため、表現を「近年の志願者数は減少傾向にある」に変更
- 出典URLをインラインリンクとして追加

### 4. 参考情報源URLの本文インライン配置
以下の出典URLを本文中の該当箇所にインラインリンクとして配置した:
- D1: Google AdSense必須コンテンツ → 41行目
- D2: AdSenseコンテンツとUX + Zenn対策事例 → 49行目
- D3: Googleスパムポリシー → 57行目
- D3重要な注記: AI生成コンテンツについて → 61行目
- S4: E-E-A-T（有用で信頼性の高いコンテンツの作成） → 101行目
- セクション8: ラッコ公式ページ、漢検公式ページ → 399-400行目

### 5. 用語の正確性修正
- 「スケーリングされたコンテンツの不正使用」→「大量生成されたコンテンツの不正使用」に全箇所で統一（Google公式日本語ページの正式名称に合わせた）
- 参考情報源セクションのリンクテキストも同様に修正

### 6. その他の改善
- S3セクション（90行目）: 競合比較数値にcompetitor-analysis.mdへの明示的参照を追加
- D2セクション（49行目）: 「合格条件として報告されている」→「合格の要因の一つとして報告されている」に修正（断定回避）
- 参考情報源セクション: 各URLがどのセクションで引用されているかの対応関係を明記
- 参考情報源にラッコ公式ページと漢検公式ページの2件を追加（計10件）

### URL検証結果
- https://rakko.inc/services/tools/ → HTTP 200、内容「月間150万PVを達成したことのある」確認
- https://www.kanken.or.jp/kanken/investigation/result.html → HTTP 200、タイトル「年度・回ごとの級別志願者数・合格者数」確認
- https://developers.google.com/search/docs/essentials/spam-policies?hl=ja → 内容中に「大量生成されたコンテンツの不正使用」の正式名称を確認
- 指示メモのprtimes URL → ラッコ無関係（辞書アプリDONGRIのプレスリリース）のため不使用

## prettier整形
npx prettier --write 実行済み（変更なし）

## 対象ファイル
docs/research/root-cause-analysis.md
