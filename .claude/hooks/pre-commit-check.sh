#!/bin/bash

# pre-commit-check.sh (PreToolUse hook / matcher: Bash)
# コミット前の高速チェック。変更ファイルに限定して実行することで、コミットごとの
# 待ち時間を数分から数秒に抑える。フルスイート (lint全体 / typecheck / test / build) は
# pre-push-check.sh が push 前に独立再実行する。
#
# このフックが機械的に強制するもの:
#  - 変更ファイルの整形・lint
#  - ブログ frontmatter の日時整合 (旧AP-W13をフックへ移管・強制化) → scripts/validate-blog-frontmatter.ts
#  - 末尾残骸タグ (旧AP-WF22) / JSX属性内 \u エスケープ (旧AP-I12) のコミット前最終検出
#  - コミットメッセージでの駆動源のOwner帰属 (AP-WF24)

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Only intercept git commit commands
if ! echo "$COMMAND" | grep -q "git commit"; then
  exit 0
fi

CWD=$(echo "$INPUT" | jq -r '.cwd')
cd "$CWD" || exit 0

# 1) コミットメッセージの駆動源帰属チェック (AP-WF24)
# 是正や手続きの義務の源はルールであってOwnerではない。
# 注意: Cロケールの grep はバイト単位で動くため、マルチバイト文字に ? を直接付けると
# 最終バイトのみが任意化されて意図通りに動かない。必ずグループ化 (の)? する。
if echo "$COMMAND" | grep -qE '(Owner|owner|オーナー)[[:space:]]*(の)?(指示に従|指示により|指摘を受け)'; then
  cat >&2 << 'EOF'
コミットメッセージに駆動源をOwnerに帰属させる表現 (「Owner指示に従い」「オーナー指摘を受け」等) が含まれています (AP-WF24)。
是正や手続きの義務の源はルール (手順書・アンチパターン集・行動原則) であってOwnerではありません。
「何を・なぜ直したか」をルールに基づいて記述し直してください。
EOF
  exit 2
fi

# 2) 変更ファイルの収集
# コミット対象が staging 前の場合 (git add . && git commit のような連結) もあるため、
# staged / unstaged の両方の変更ファイルを対象にする (削除は除く)。
FILES=$(git status --porcelain | grep -vE '^.?D' | sed -E 's/^..[[:space:]]//; s/^"(.*)"$/\1/; s/.* -> //')
if [ -z "$FILES" ]; then
  exit 0
fi

EXISTING_FILES=$(echo "$FILES" | while IFS= read -r f; do [ -f "$f" ] && echo "$f"; done)
[ -z "$EXISTING_FILES" ] && exit 0

# 3) 整形チェック (変更ファイルのみ・.prettierignore を尊重)
FORMAT_OUTPUT=$(echo "$EXISTING_FILES" | tr '\n' '\0' | xargs -0 -r npx prettier --check --ignore-unknown 2>&1)
if [ $? -ne 0 ]; then
  echo "Prettier format check failed. Run \`npm run format\` as a standalone command before committing. Do NOT chain it with other commands using \`&&\` or similar operators." >&2
  echo "$FORMAT_OUTPUT" >&2
  exit 2
fi

# 4) lint (変更ファイルのうち JS/TS のみ)
LINT_TARGETS=$(echo "$EXISTING_FILES" | grep -E '\.(ts|tsx|js|jsx|mjs|mts)$')
if [ -n "$LINT_TARGETS" ]; then
  LINT_OUTPUT=$(echo "$LINT_TARGETS" | tr '\n' '\0' | xargs -0 -r npx eslint --no-error-on-unmatched-pattern 2>&1)
  if [ $? -ne 0 ]; then
    echo "ESLint check failed. Fix lint errors before committing." >&2
    echo "$LINT_OUTPUT" >&2
    exit 2
  fi
fi

# 5) 末尾残骸タグ (旧AP-WF22) と JSX属性内 \u エスケープ (旧AP-I12)
while IFS= read -r f; do
  case "$f" in
    *.md | *.mdx | *.ts | *.tsx | *.js | *.jsx | *.css | *.json | *.yml | *.yaml | *.txt | *.html)
      if tail -n 5 "$f" | grep -qE '</(content|contents|document|file|output)>$'; then
        echo "残骸タグ検出: $f の末尾に </content> のような残骸タグが混入しています。削除してからコミットしてください。" >&2
        exit 2
      fi
      ;;
  esac
  case "$f" in
    *.tsx | *.jsx)
      if grep -Fq '="\u' "$f"; then
        echo "JSXエスケープ検出: $f のJSX属性文字列に \\u エスケープがあります。brace形 attr={\"\\u...\"} に修正してからコミットしてください。" >&2
        exit 2
      fi
      ;;
  esac
done <<< "$EXISTING_FILES"

# 6) ブログ frontmatter の日時整合 (旧AP-W13)
BLOG_FILES=$(echo "$EXISTING_FILES" | grep -E '^src/blog/content/.*\.md$')
if [ -n "$BLOG_FILES" ]; then
  FRONTMATTER_OUTPUT=$(echo "$BLOG_FILES" | tr '\n' '\0' | xargs -0 -r npx tsx scripts/validate-blog-frontmatter.ts 2>&1)
  if [ $? -ne 0 ]; then
    echo "ブログ frontmatter の検証に失敗しました。published_at / updated_at を \`date +\"%Y-%m-%dT%H:%M:%S%z\"\` の実測値で修正してください。" >&2
    echo "$FRONTMATTER_OUTPUT" >&2
    exit 2
  fi
fi

exit 0
