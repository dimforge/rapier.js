#!/bin/bash

cd "$(dirname "$0")"

config_files=(dim2_deterministic dim2_simd dim2 dim3_deterministic dim3_simd dim3)

for config_path in ${config_files[@]}; do
    echo "preparing dimension $dim with feature $feature"
    cargo run -- -c assets/${config_path}.json
done
