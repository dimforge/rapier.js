#!/bin/bash

set -e

help()
{
    printf "Usage: %s: CONFIG_FILE_NAME ...\n" $0
}

if [[ -z "$@" ]]; then
    help; exit 2;
fi

for config_file_name in "$@"
do

  ./build_rust.sh $config_file_name
  ./gen_src.sh $config_file_name
  npm run rollup --  --config rollup.config.js --bundleConfigAsCjs --environment BUILD_CONFIG_NAME:${config_file_name}

done
