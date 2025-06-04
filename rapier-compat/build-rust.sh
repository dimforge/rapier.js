#!/bin/bash

help()
{
    printf "Usage: %s: [-c CONFIG_NAME]\n" $0
}

while getopts :c: conf_name
do
    case $conf_name in
    c)  
        config_file_name="$OPTARG"
        ;;
    ?)  help ; exit 1;;
    esac
done

if [[ -z "$config_file_name" ]]; then
    help; exit 2;
fi

config_file_path="../builds/prepare_builds/assets/$config_file_name.json"

rust_source_directory_name=`node -pe 'JSON.parse(process.argv[1]).js_package_name' "$(cat ${config_file_path})"`

echo "building rust wasm for ${rust_source_directory_name} package."

rust_source_directory="../builds/${rust_source_directory_name}"

if [ ! -d "$rust_source_directory" ]; then
    echo "Directory $rust_source_directory does not exist";
    echo "You may want to generate rust projects first.";
    help
    exit 4;
fi

echo "source folder is: ${rust_source_directory}"

set -x

additional_rust_flags=`node -pe 'JSON.parse(process.argv[1]).additional_rust_flags' "$(cat ${config_file_path})"`


# Working dir in wasm-pack is the project root so we need that "../../"

if [[ $additional_rust_flags == "undefined" ]]; then
    additional_rust_flags=''
fi

RUSTFLAGS="${additional_rust_flags}" wasm-pack --verbose build --target web --out-dir "../../rapier-compat/builds/${rust_source_directory_name}/wasm-build" "$rust_source_directory"
