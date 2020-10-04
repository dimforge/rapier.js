#! /bin/sh

wasm-pack build
sed -i 's#rapierjs#@dimforge/rapier#g' pkg/package.json
sed -i 's/"rapier2d_bg.wasm"/"rapier2d_bg.wasm","rapier2d_bg.js", "rapier2d_bg.d.ts"/g' pkg/package.json
