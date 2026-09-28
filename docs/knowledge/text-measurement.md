# テキスト文字数計測の注意事項

シェルコマンドで日本語テキストの文字数を数えるときの落とし穴。知見は cycle-216 の実測に基づき、cycle-316 に現在の作業環境で測り直して同じ結果を得た。

## C ロケール環境での awk / wc の落とし穴

このリポジトリの作業環境は C ロケール（`LC_ALL` / `LANG` が空で、`locale` は `POSIX` を返す）であるため、`awk` や `wc` で日本語テキストの文字数を測るとバイト長が返る。

```sh
# 誤り: どれもバイト長を返す（UTF-8 日本語は1文字3バイト）
echo "いらっしゃる" | awk '{ print length($0) }'  # → 18 (6文字×3バイト)
echo -n "いらっしゃる" | wc -c                    # → 18 (バイト数)
echo -n "いらっしゃる" | wc -m                    # → 18 (C ロケールでは wc -m もバイト長)
```

`awk` の実体は mawk で、`LC_ALL=C.UTF-8` を付けても `length()` はバイト長（18）を返す。

## 正しい計測方法

UI の実装（JavaScript/TypeScript）が参照するのは **`String.length`**（UTF-16 コードユニット数）。
日本語は基本多言語面（BMP）内のため、`String.length` = 文字数と一致する（サロゲートペア外）。

```sh
# 正しい: node/tsx で String.length を使う
node -e "console.log('いらっしゃる'.length)"    # → 6 (正しい文字数)
npx tsx -e "console.log('いらっしゃる'.length)" # → 6
```

文字数計測（特に UI の表示幅・折り返し見積もり）は `node -e` または `npx tsx` で `String.length` を使う。

根拠: 実測（cycle-216・cycle-316）。cycle-216 で keigo-reference の尊敬語の最長値を awk `length()` で測ると「81」になったが、これはバイト長で、`String.length` では「27」（`いらっしゃる・おいでになる・お見えになる・お越しになる`）だった（81 バイト ÷ 3 = 27 文字）。cycle-316 に上の各コマンドを現在の作業環境で実行し、記載どおりの値を確かめた。
