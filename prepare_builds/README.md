# Prepare builds

This project helps with making specific package: it takes a few parameter to create a (1) folder ready to compile.

It uses clap so you can pass `-h` to get more info about its parameters.

## usage

At workspace root: `cargo run -p prepare_builds -- -d dim2 -f simd`

## Technical considerations

Askama/rinja was not chosen because compiled templates make it difficult to iterate on a folder and parse all templates.