#! /bin/sh

rm -rf pkg
./build_rust.sh
./build_typescript.sh
./build_doc.sh

# Copy our package.json over into the build directory
cp ./package.json ./pkg/
