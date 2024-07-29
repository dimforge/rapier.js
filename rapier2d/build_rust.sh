#! /bin/sh

npx wasm-pack build
sed -i.bak 's#dimforge_rapier#@dimforge/rapier#g' pkg/package.json
sed -i.bak 's/"rapier_wasm2d_bg.wasm"/"*"/g' pkg/package.json
(
    cd pkg
    npm pkg delete sideEffects
    npm pkg set 'sideEffects[0]'="./*.js"
)
rm pkg/*.bak
rm pkg/.gitignore
