#!/bin/bash
# usage: buildmode.sh <name> KEY=VAL...   -> builds into site/.next-<name>
name=$1; shift
cd /home/user/yolo-web/tmp/t1a3/work && env "$@" node prep.mjs >/dev/null && cd ../site && DIST=.next-$name npx next build > ../work/build-$name.log 2>&1; echo "$name exit $?"; cp src/lib/fontmode.json .next-$name/fontmode.used.json
