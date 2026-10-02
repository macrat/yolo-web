#!/bin/bash
# 使い方: build.sh <commit> <label>  — worktree を作り、4つのゲームと base64 だけを残して本番ビルドする
set -e
C=$1; L=$2
R=/home/user/yolo-web
W=$R/tmp/cycle-316/review-cleanup/wt-$L
cd $R
[ -d $W ] || git worktree add --detach $W $C >/dev/null
cp -al $R/node_modules $W/node_modules
cd $W/src/app || exit 1
rm -rf blog dictionary memos about feed privacy storybook sitemap.ts
cd play; for d in *; do case $d in irodori|kanji-kanaru|nakamawake|yoji-kimeru|page.tsx|__tests__) ;; *) rm -rf "$d";; esac; done
cd ../tools; for d in *; do case $d in base64|page.tsx|__tests__) ;; *) rm -rf "$d";; esac; done
cd $W; find src -type d -name __tests__ -prune -exec rm -rf {} +
timeout 900 npm run build > build.log 2>&1 || { tail -30 build.log; exit 1; }
tail -5 build.log
