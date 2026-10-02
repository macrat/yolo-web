#!/bin/bash
cd /home/user/yolo-web/tmp/t1a3/work
P="/play/character-personality /play/character-personality/result/blazing-strategist /tools/char-count /dictionary/kanji/哀 /blog/sql-cheatsheet /tools/email-validator /tools/traditional-color-palette"
for run in 1 2 3; do for port in 3317 3000; do node probe.mjs http://localhost:$port lhmobile 1 $P >> probe2.jsonl 2>>probe2.err; done; done
for run in 1 2; do for port in 3317 3000; do node probe.mjs http://localhost:$port 4g 1 $P >> probe2.jsonl 2>>probe2.err; done; done
echo DONE >> probe2.err
