# セキュリティと依存関係への対応

このサイクルでは、dependabotが作成した依存関係更新のPRと、CodeQLが検出したセキュリティ問題を確認して対応します。

## 依存関係の更新

dependabotが作成したPRは以下のコマンドで確認できます。

```bash
gh pr list --author 'app/dependabot'
```

CIのテストが成功している場合は、すぐにマージして問題ありません。

テストに失敗している場合は、該当するPRをチェックアウトして、根本原因を調査して解決してください。
解決できたらpushして、CIが成功することを確認してからマージしてください。

### アラートが判断を要する規模で溜まっている場合

自動PRを個別にマージするだけで済まないとき——Dependabotのアラート（PRではなく `gh api repos/macrat/yolo-web/dependabot/alerts -f state=open`）が多数溜まっている、メジャー更新で壊れる、どれから直すべきか判断が要る——は、軽量マージフローで済ませず **`docs/knowledge/dependency-security.md` の到達性triage** に従ってください。深刻度ラベルでなく到達性で優先度を決め、一括更新は同文書の検証チェックリスト（lint/format/test/build+描画目視）で守ります。

## セキュリティ問題の対応

CodeQLが検出したセキュリティ問題は以下のコマンドで確認できます。

```bash
gh api --method GET '/repos/macrat/yolo-web/code-scanning/alerts?state=open'
```

表示された問題を詳しく調査して、それぞれ対応してください。
