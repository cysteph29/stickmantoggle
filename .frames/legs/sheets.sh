#!/bin/sh
# Usage: sh .frames/legs/sheets.sh <tag>  — 24 frames from 4.45s to 7.0s in three sheets.
set -e
tag=$1
for range in "4.45 5.30" "5.3 6.15" "6.15 7"; do
  set -- $range
  node --experimental-strip-types .frames/render.ts four 8 "$1" "$2" 2>/dev/null >/dev/null
  cp ".frames/four-$1.svg" ".frames/legs/$tag-$1.svg"
  qlmanage -t -s 1400 -o .frames/legs ".frames/legs/$tag-$1.svg" >/dev/null 2>&1
done
ls .frames/legs | grep "^$tag"
