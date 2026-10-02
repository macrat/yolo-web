#!/bin/bash
# 使い方: serve.sh <label> <port> <cmd...> — worktree の本番を起動し、cmd を回し、自分の起動したサーバーだけを止める
L=$1; PORT=$2; shift 2
W=/home/user/yolo-web/tmp/cycle-316/review-cleanup/wt-$L
cd $W; npx next start -p $PORT > server.log 2>&1 & PID=$!
for i in $(seq 1 60); do curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/play/irodori 2>/dev/null | grep -q 200 && break; sleep 1; done
cd /home/user/yolo-web/tmp/cycle-316/review-cleanup
"$@"
kill $PID 2>/dev/null
for p in $(ls /proc | grep -E '^[0-9]+$'); do c=$(readlink /proc/$p/cwd 2>/dev/null); [ "$c" = "$W" ] && kill $p 2>/dev/null; done
exit 0
