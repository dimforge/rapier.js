#! /bin/sh

wasm-pack build
sed -i '' 's/rapierjs/rapier/g' pkg/package.json
sed -i '' 's/"rapier3d_bg.wasm"/"rapier3d_bg.wasm","rapier3d_bg.jg", "rapier3d_bg.d.ts"/g' pkg/package.json

