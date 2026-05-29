# テキスト文字数計測の注意事項

## C ロケール環境での awk / wc の落とし穴

このリポジトリのビルド環境は C ロケール（`LC_ALL` / `LANG` が空またはデフォルト）であるため、
シェルコマンドで文字数を計測するときに注意が必要。

### 問題

```sh
# 誤り: バイト長を返す（UTF-8 日本語は1文字3バイト）
echo "いらっしゃる" | awk '{ print length($0) }'  # → 18 (6文字×3バイト)
echo -n "いらっしゃる" | wc -c                    # → 18 (バイト数)
echo -n "いらっしゃる" | wc -m                    # C ロケールでは wc -m もバイト長を返す
```

### 正しい計測方法

タイル実装（JavaScript/TypeScript）が参照するのは **`String.length`**（UTF-16 コードユニット数）。
日本語は基本多言語面（BMP）内のため、`String.length` = 文字数と一致する（サロゲートペア外）。

```sh
# 正しい: node/tsx で String.length を使う
node -e "console.log('いらっしゃる'.length)"    # → 6 (正しい文字数)
npx tsx -e "console.log('いらっしゃる'.length)" # → 6
```

### 実際に発生した誤認（cycle-216 T-1）

- awk `length()` で計測した sonkeigo 最長値「81」はバイト長
- 正しい `String.length` では「27」（`いらっしゃる・おいでになる・お見えになる・お越しになる`）
- 81 バイト ÷ 3（UTF-8 日本語1文字のバイト数）= 27 文字 で一致

### 教訓

文字数計測（特に UI の表示幅・折り返し見積もり）は必ず `node -e` または `npx tsx` で
`String.length` を使うこと。シェルの `awk length()` / `wc -m` は C ロケール環境では
バイト長を返すため、日本語テキストには使用しない。
