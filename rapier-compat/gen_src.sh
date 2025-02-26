# Copy source and remove #if sections - similar to script in ../rapierXd
set -e

gen_js() {
  DIM=$1
  GENOUT="./gen${DIM}"
  PKGOUT="./pkg${DIM}"

  # Make output directories
  mkdir -p ${GENOUT} ${PKGOUT}

  # Copy common sources
  cp -r ../../src.ts/* $GENOUT

  # Copy compat mode override sources
  rm -f "${GENOUT}/raw.ts" "${GENOUT}/init.ts"
  cp -r ./src${DIM}/* $GENOUT
}

# mkdir -p ./gen2d ./gen3d ./pkg2d ./pkg3d

gen_js "2d"
gen_js "3d"

# See https://serverfault.com/a/137848
find gen2d/ -type f -print0 | LC_ALL=C xargs -0 sed -i.bak '\:#if DIM3:,\:#endif:d'
find gen3d/ -type f -print0 | LC_ALL=C xargs -0 sed -i.bak '\:#if DIM2:,\:#endif:d'

# Clean up backup files.
find gen2d/ -type f -name '*.bak' | xargs rm
find gen3d/ -type f -name '*.bak' | xargs rm

cp ./wasm-build2d/rapier_wasm* pkg2d/
cp ./wasm-build3d/rapier_wasm* pkg3d/

# "import.meta" causes Babel to choke, but the code path is never taken so just remove it.
sed -i.bak 's/import.meta.url/"<deleted>"/g' pkg2d/rapier_wasm2d.js
sed -i.bak 's/import.meta.url/"<deleted>"/g' pkg3d/rapier_wasm3d.js

# Clean up backup files.
find pkg2d/ -type f -name '*.bak' | xargs rm
find pkg3d/ -type f -name '*.bak' | xargs rm
