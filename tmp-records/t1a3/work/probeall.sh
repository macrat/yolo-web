#!/bin/bash
cd /home/user/yolo-web/tmp/t1a3/work
P="/play/character-personality /play/character-personality/result/blazing-strategist /tools/char-count /dictionary/kanji/哀 /blog/sql-cheatsheet /tools/email-validator /tools/traditional-color-palette"
for run in 1 2 3; do for port in 3000 3311 3312 3313 3315; do
  node probe.mjs http://localhost:$port lhmobile 1 $P >> probe.jsonl 2>>probe.err
done; done
for run in 1 2; do for port in 3000 3311 3313 3315; do
  node probe.mjs http://localhost:$port 4g 1 $P >> probe.jsonl 2>>probe.err
done; done
for run in 1 2; do for port in 3311 3316; do
  node probe.mjs http://localhost:$port lhmobile 1 /tools/char-count /play/character-personality /blog/sql-cheatsheet >> probe-hdr.jsonl 2>>probe.err
done; done
echo PROBEDONE >> probe.err
