#! /bin/sh

mkdir -p ./pkg/src
cp -r ../src.ts/* pkg/src/.
rm -f ./pkg/raw.ts
echo 'export * from "./rapier_wasm3d"' > pkg/src/raw.ts
# See https://serverfault.com/a/137848
find pkg/ -type f -print0 | LC_ALL=C xargs -0 sed -i.bak '\:#if DIM2:,\:#endif:d'
npx tsc
# NOTE: we keep the typescripts files into the NPM package for source mapping: see #3
sed -i.bak 's/"module": "rapier_wasm3d.js"/"module": "rapier.js"/g' pkg/package.json
sed -i.bak 's/"types": "rapier_wasm3d.d.ts"/"types": "rapier.d.ts"/g' pkg/package.json
find pkg/ -type f -name '*.bak' | xargs rm
