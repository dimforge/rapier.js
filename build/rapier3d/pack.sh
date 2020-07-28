#! /bin/sh

wasm-pack build
sed -i 's#rapierjs#@dimforge/rapier#g' pkg/package.json
sed -i 's/"rapier3d_bg.wasm"/"rapier3d_bg.wasm","rapier3d_bg.js", "rapier3d_bg.d.ts"/g' pkg/package.json

