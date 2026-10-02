#!/bin/bash
cd /home/user/yolo-web/tmp/cycle-316/review-t4-14-3
for sc in "$@"; do
 for f in 16 32; do
  ( timeout 400 node cls.mjs 320 667 $f $sc 8 > o-320-$f-$sc.txt 2>&1 ) &
  ( timeout 400 node cls.mjs 375 667 $f $sc 8 > o-375-$f-$sc.txt 2>&1 ) &
  ( timeout 400 node cls.mjs 1280 800 $f $sc 8 > o-1280-$f-$sc.txt 2>&1 ) &
  wait
 done
 cat o-*-$sc.txt | sort -n
done
