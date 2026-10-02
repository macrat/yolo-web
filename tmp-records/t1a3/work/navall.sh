#!/bin/bash
cd /home/user/yolo-web/tmp/t1a3/work
for net in none slow4g; do for v in "adopt http://localhost:3317" "swap http://localhost:3311" "optional http://localhost:3312" "block http://localhost:3313" "before http://localhost:3000"; do
  set -- $v; ./runpairs.sh $1 $2 $net nav.jsonl
done; done
echo NAVDONE >> nav.jsonl.err
