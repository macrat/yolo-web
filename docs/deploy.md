# デプロイ

## CI/CD

- `main` ブランチへのプッシュで Vercel にデプロイされる
- `project manager` が `main` へのプッシュ判断を行う

## デプロイフロー

```
feature branch → review → merge to main → Vercel auto-deploy
```

## ロールバック

- コミットのリバートによりロールバックする
- `git revert <commit>` でリバートコミットを作成し `main` にプッシュ

## デプロイ設定

- Vercelの設定はリポジトリルートまたは Vercel ダッシュボードに存在
- 環境変数等の詳細は必要に応じて追記
