#!/bin/sh

# Copy source and remove #if sections - similar to script in ../rapierXd
set -e

help()
{
    printf "Usage: %s: CONFIG_FILE_NAME\n" $0
}

config_file_name=$1

if [ -z "$config_file_name" ]; then
    help; exit 2;
fi

config_file_path="../builds/prepare_builds/assets/$config_file_name.json"

js_package_name=`node -pe 'JSON.parse(process.argv[1]).js_package_name' "$(cat ${config_file_path})"`
dimension=`node -pe 'JSON.parse(process.argv[1]).dim' "$(cat ${config_file_path})"`
conditions_to_remove=`node -pe 'JSON.parse(process.argv[1]).conditions_to_remove.join(" ")' "$(cat ${config_file_path})"`

DIM="${dimension}d"
GENOUT="./builds/${js_package_name}/gen${DIM}"

# Make output directories
rm -rf ${GENOUT}
mkdir -p ${GENOUT}

# Copy common sources
cp -r ../src.ts/* $GENOUT

# Copy compat mode override sources
rm -f "${GENOUT}/raw.ts" "${GENOUT}/init.ts"
cp -r ./src${DIM}/* $GENOUT

echo ${conditions_to_remove}

for condition_to_remove in "${conditions_to_remove}" ; do
  # See https://serverfault.com/a/137848
  echo "find ${GENOUT} -type f -print0 | LC_ALL=C xargs -0 sed -i \"\\:#if ${condition_to_remove}:,\\:#endif:d\""
  find ${GENOUT} -type f -print0 | LC_ALL=C xargs -0 sed -i "\\:#if ${condition_to_remove}:,\\:#endif:d"
done

rm -rf ./builds/${js_package_name}/pkg/
mkdir -p ./builds/${js_package_name}/pkg/

cp ./builds/${js_package_name}/wasm-build/rapier_wasm* ./builds/${js_package_name}/pkg/

# fix raw file
echo 'export * from "'"./rapier_wasm$DIM"'"' > builds/${js_package_name}/pkg/raw.d.ts

# copy tsconfig, as they contain paths
cp ./tsconfig.common.json ./tsconfig.json ./builds/${js_package_name}/
cp ./tsconfig.pkg${dimension}d.json ./builds/${js_package_name}/tsconfig.pkg.json

# "import.meta" causes Babel to choke, but the code path is never taken so just remove it.
sed -i 's/import.meta.url/"<deleted>"/g' ./builds/${js_package_name}/pkg/rapier_wasm${dimension}d.js
