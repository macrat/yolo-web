#!/bin/bash
# alternate before / S-optional / S-swap, per network profile
out=probe.jsonl
P=(/play/character-personality /play/character-personality/result/blazing-strategist /tools/char-count "/dictionary/kanji/哀" /blog/sql-cheatsheet /tools/email-validator /tools/traditional-color-palette)
for net in lhmobile 4g; do for n in 1 2 3; do
  for base in http://localhost:3000 http://localhost:3201 http://localhost:3202; do
    node probe.mjs $base $net 1 "${P[@]}" >> $out 2>>probe.err
  done; done; done
echo finished
