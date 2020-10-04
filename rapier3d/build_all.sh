#! /bin/sh

rm -rf pkg
./build_rust.sh
./build_typescript.sh
./build_doc.sh
