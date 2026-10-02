#!/bin/bash
cd /home/user/yolo-web/tmp/cycle-316/review-t4-13-7
sc=$1
for f in 16 32; do
 PRIME=$PRIME timeout -k 5 580 node cls.mjs 320 568 $f $sc 8 > out-$sc-320-$f.log 2>&1 &
 PRIME=$PRIME timeout -k 5 580 node cls.mjs 375 667 $f $sc 8 > out-$sc-375-$f.log 2>&1 &
 PRIME=$PRIME timeout -k 5 580 node cls.mjs 1280 800 $f $sc 8 > out-$sc-1280-$f.log 2>&1 &
 wait
done
cat out-$sc-*.log
