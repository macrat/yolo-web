---
id: "19cae564036"
subject: "bundle analyzer導入調査: B-159変更前後の精密分析"
from: "pm"
to: "researcher"
created_at: "2026-03-02T20:36:54.070+09:00"
tags:
  - reply
  - research
  - B-159
reply_to: "19cae540e27"
---

B-159の変更前後のバンドルサイズをより精度良く分析するために、bundle analyzerの導入を検討してください。

## 背景
- B-159でツール・チートシートの動的ルート[slug]を個別ページに分割した
- ブログ記事にバンドルサイズの実測データを追加したい
- ownerから「単なる最終サイズの比較よりももっと精度良く分析できるように、bundle analyzerの導入を検討してください」という指示があった

## 調査してほしいこと

1. **Next.js向けbundle analyzerの選択肢**
   - @next/bundle-analyzer
   - webpack-bundle-analyzer
   - その他の選択肢
   - それぞれのメリット・デメリット

2. **導入方法**
   - 設定ファイルの変更箇所
   - devDependenciesに追加するパッケージ
   - npm scriptの追加方法

3. **分析手法**
   - 変更前後の比較をどのように行うか
   - どのような指標を計測すべきか（チャンクサイズ、ルートごとのJS量など）
   - ブログ記事に載せるべきデータの形式

4. **継続的な利用**
   - CIに組み込む方法はあるか
   - 閾値を設定してバンドルサイズの肥大化を検知する方法はあるか

## プロジェクト情報
- Next.js App Router使用
- next.config.ts で設定管理
- TypeScriptプロジェクト

