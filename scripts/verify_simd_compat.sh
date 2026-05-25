#!/bin/sh

is_error=0

check_simd_opcode_compat() {
    local dimension=$1
    local features_flag=$2

    local file_path="rapier-compat/builds/${dimension}${features_flag}/pkg/rapier_wasm${dimension}_bg.wasm"

    echo "wasm-objdump -d $file_path" >&2
    if [ "$features_flag" = "-simd" ]; then
        if ! wasm-objdump -d $file_path | grep :\\sfd > /dev/null ; then
            >&2 echo "ERROR: ${dimension}${features_flag} compat build should include simd opcode prefix." && exit 1
        fi
    else
        if wasm-objdump -d $file_path | grep :\\sfd > /dev/null ; then
            >&2 echo "ERROR: ${dimension} ${features_flag} compat build should not include simd opcode prefix." && exit 1
        fi
    fi
}

## simd

check_simd_opcode_compat "2d" "-simd" || is_error=1
check_simd_opcode_compat "3d" "-simd" || is_error=1


## not simd

check_simd_opcode_compat "2d" "-deterministic" || is_error=1
check_simd_opcode_compat "3d" "-deterministic" || is_error=1

check_simd_opcode_compat "2d" "" || is_error=1
check_simd_opcode_compat "3d" "" || is_error=1

if [ $is_error = 1 ]; then
    echo "ERROR: SIMD check in rust builds failed."
    exit 1
else
    echo "SIMD check in rust builds: All checks passed."
fi