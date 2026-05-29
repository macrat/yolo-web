---
name: take-screenshot
description: |
  ユーザーが実際に目にする画面のスクリーンショットを撮るスキル。ユーザーがどのような体験をしているのかを理解するために、このスキルを活用してスクリーンショットを撮ってください。
  UIに関連する変更を行う際は、必ずこのスキルを使って変更前と変更後のスクリーンショットを撮ること。
  また、競合サイトのデザインを調べるときや、UI/UXのチェックを指示されたときにもこのスキルを使うこと。
user-invocable: false
---

スクリーンショットは`./take.ts`を呼び出すことで撮ることができます。
取得したスクリーンショットは、プロジェクトルートの`tmp/screenshots/`に保存されます。

`./take-screenshot.ts`は以下のように起動します。

```bash
# ページ全体を撮る場合（原則としてこちらを使う）
npx tsx .claude/skills/take-screenshot/scripts/take.ts <URL>

# 特定の要素だけを撮る場合（作業中の確認用。レビューで使うときはページ全体を併用すること）
npx tsx .claude/skills/take-screenshot/scripts/take.ts <URL> --selector <CSSセレクタ>

# ダークテーマで撮る場合（--dark フラグを追加）
npx tsx .claude/skills/take-screenshot/scripts/take.ts <URL> --dark
# --selector と併用も可能
npx tsx .claude/skills/take-screenshot/scripts/take.ts <URL> --selector <CSSセレクタ> --dark
```

> **注意**: このサイトは next-themes の `attribute="class"` でテーマを管理している（`<html class="dark">`）。
> `page.emulateMedia({ colorScheme: 'dark' })` 単独では、ハイドレーション後のクラス付与と競合して
> **silent-light**（見た目は light なのにファイル名だけ dark）になる場合がある。
> `--dark` フラグは `localStorage.setItem('theme','dark')` をページ遷移前に注入し、
> `<html class="dark">` の付与を `waitForFunction` で確認してから撮影するため信頼性が高い。

まだサーバーを起動していない場合は、以下のコマンドで起動してください。

```bash
npm run dev
```

スクリーンショットはPCやモバイルを想定した様々なサイズで保存されます。
すべての画像を確認して、いろいろな環境での見え方を確認してください。

スクリーンショットの一部だけをよく確認する必要があるときは、以下のスクリプトで確認したい領域だけを切り取ってください。
切り取られた画像は、元のスクリーンショットと同じ場所に保存されます。

```bash
npx tsx .claude/skills/take-screenshot/scripts/crop.ts <ファイル名> <幅>x<高さ>+<X座標>+<Y座標>
```

通常のスクリーンショットは縦長になりやすいので、重点的に確認すべき部分を切り取りながら丁寧に確認してください。
全体を遠目に見るだけよりも、個々のパーツを拡大して見た方が適切なチェックができます。

**重要**: リポジトリの肥大化を防ぐため、原則としてスクリーンショットはコミットしないでください。コミットしても良い唯一の例外は、スクリーンショットをサイト内に掲載するときです。
