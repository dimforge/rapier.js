#! /bin/sh

wasm-pack build
sed -i 's#raw-rapier#@dimforge/raw-rapier#g' pkg/package.json
sed -i 's/"raw_rapier3d_bg.wasm"/"raw_rapier3d_bg.wasm","raw_rapier3d_bg.js", "raw_rapier3d_bg.d.ts"/g' pkg/package.json
