#!/bin/bash
# usage: serve.sh <name> <port>  -- (re)start the site copy build .next-<name> on <port>
name=$1; port=$2
for p in $(pgrep -f next-server); do
  if [ "$(readlink /proc/$p/cwd)" = "/home/user/yolo-web/tmp/t1a3/site" ] && tr '\0' '\n' < /proc/$p/environ | grep -qx "PORT_TAG=$port"; then kill $p; fi
done
sleep 1
cd /home/user/yolo-web/tmp/t1a3/site && PORT_TAG=$port DIST=.next-$name nohup npx next start -p $port > ../work/start-$port.log 2>&1 &
for i in $(seq 1 30); do curl -s -o /dev/null localhost:$port/ && break; sleep 0.5; done
grep -q EADDRINUSE /home/user/yolo-web/tmp/t1a3/work/start-$port.log && echo "PORT BUSY $port" || echo "serving $name on $port"
