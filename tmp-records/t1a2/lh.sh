#!/bin/bash
# usage: lh.sh <outroot> <runs> <extra lighthouse flags...>; alternates before(3000) and S(3201)
out=$1; runs=$2; shift 2
export CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
P=("play-cp|/play/character-personality" "result-cp|/play/character-personality/result/blazing-strategist" "tool|/tools/char-count" "dict|/dictionary/kanji/%E5%93%80" "blog|/blog/sql-cheatsheet" "email|/tools/email-validator" "palette|/tools/traditional-color-palette")
mkdir -p $out/before $out/S
for n in $(seq 1 $runs); do for u in "${P[@]}"; do name=${u%%|*}; path=${u#*|}
  for v in "before|http://localhost:3000" "S|http://localhost:3201"; do vn=${v%%|*}; base=${v#*|}
    /home/user/yolo-web/tmp/lh/node_modules/.bin/lighthouse "$base$path" --quiet --only-categories=performance "$@" \
      --chrome-flags="--headless=new --no-sandbox" --output=json --output-path=$out/$vn/$name-$n.json >/dev/null 2>&1
  done; done; done
echo finished
