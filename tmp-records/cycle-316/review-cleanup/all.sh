#!/bin/bash
# 使い方: all.sh <label> <port> <mode> <game...> — 指定のゲームを 320・1280 で2回ずつ回し、結果を足していく
L=$1; PORT=$2; m=$3; shift 3
for g in "$@"; do for w in 320 1280; do for r in 1 2; do
 timeout 150 node play.mjs http://localhost:$PORT $g $w $r $m
done; done; done >> res2-$L-$m.jsonl
