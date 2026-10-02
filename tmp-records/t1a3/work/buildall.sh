#!/bin/bash
cd /home/user/yolo-web/tmp/t1a3/work
./buildmode.sh optdiv PRELOAD=div DISPLAY=optional
./buildmode.sh blockdiv PRELOAD=div DISPLAY=block
./buildmode.sh inlineswap PRELOAD=div DISPLAY=swap INLINE=1
./buildmode.sh udswap PRELOAD=div DISPLAY=swap FACE=ud
./buildmode.sh hdrswap PRELOAD=header DISPLAY=swap
echo ALLDONE
