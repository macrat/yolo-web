#!/bin/bash
# usage: runpairs.sh <label> <base> <net> <outfile>
while read a b; do node navtest.mjs $2 $3 $a $b $1 >> $4 2>>$4.err; done < pairs.txt
