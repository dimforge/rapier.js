#! /bin/sh

wasm-pack build
sed -i.bak 's#dimforge_rapier#@dimforge/rapier#g' pkg/package.json
sed -i.bak 's/"rapier_wasm3d_bg.wasm"/"*"/g' pkg/package.json
rm pkg/*.bak