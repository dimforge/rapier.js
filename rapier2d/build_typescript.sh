#!/bin/bash

cp -r ../src.ts/* pkg/.
node ../scripts/copy_src.js pkg ../src.ts DIM2
echo 'export * from "./rapier_wasm2d"' >pkg/raw.ts
tsc
# NOTE: we keep the typescripts files into the NPM package for source mapping: see #3
sed -i 's/"module": "rapier_wasm2d.js"/"module": "rapier.js"/g' pkg/package.json
sed -i 's/"types": "rapier_wasm2d.d.ts"/"types": "rapier.d.ts"/g' pkg/package.json
