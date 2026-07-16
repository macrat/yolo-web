#!/bin/bash

# post-write-residue-check.sh (PostToolUse hook / matcher: Edit|Write)
# ファイル編集直後に、機械検出可能な混入を即時チェックする。
#  1. ファイル末尾の残骸タグ (</content> 等)。長文Write時に混入することがあり、
#     prettierは素通しするため、書いた瞬間に検出する。(旧AP-WF22をフックへ移管・強制化)
#  2. JSX属性のダブルクォート文字列内の \u エスケープ。属性文字列はエスケープ未処理のため
#     リテラルのまま描画されて表示が壊れる。(旧AP-I12をフックへ移管・強制化)

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[ -n "$FILE" ] && [ -f "$FILE" ] || exit 0

case "$FILE" in
  *.md | *.mdx | *.ts | *.tsx | *.js | *.jsx | *.mjs | *.mts | *.css | *.json | *.yml | *.yaml | *.sh | *.txt | *.html) ;;
  *) exit 0 ;;
esac

# 1. 末尾の残骸タグ
if tail -n 5 "$FILE" | grep -qE '</(content|contents|document|file|output)>$'; then
  echo "[残骸タグ検出] $FILE の末尾に </content> のような残骸タグが混入しています。該当行を削除してください。" >&2
  exit 2
fi

# 2. JSX属性内の \u エスケープ (tsx/jsx のみ)
case "$FILE" in
  *.tsx | *.jsx)
    if grep -Fn '="\u' "$FILE" >&2; then
      echo "[JSXエスケープ検出] $FILE のJSX属性のダブルクォート文字列内に \\u エスケープがあります。属性文字列はエスケープ未処理のためそのまま描画されます。brace形 attr={\"\\u...\"} に修正してください。" >&2
      exit 2
    fi
    ;;
esac

exit 0
