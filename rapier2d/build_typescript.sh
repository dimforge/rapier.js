#!/bin/bash

cp -r ../src.ts/* pkg/.
echo 'export * from "./rapier2d"' >pkg/raw.ts
find pkg/ -type f -print0 | xargs -0 sed -i '/^ *\/\/ #if DIM3/,/^ *\/\/ #endif/{/^ *\/\/ #if DIM3/!{/^ *\/\/ #endif/!d}}'
tsc
find pkg/ -type f -name *.ts ! -name *.d.ts -print0 | xargs -0 rm
