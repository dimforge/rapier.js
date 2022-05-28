#! /bin/sh

wasm-pack build

# TODO: solve this via .npmignore or `files` in package.json
# rm pkg/*.bak
# rm pkg/.gitignore
