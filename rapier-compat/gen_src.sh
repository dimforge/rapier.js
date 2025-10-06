#!/bin/bash

# Copy source and remove #if sections - similar to script in ../rapierXd
# We're not failing on error to allow partial generation of the files, for a particular feature.

gen_js() {
  DIM=$1
  GENOUT="./gen${DIM}d"

  echo gen_src: copying ${GENOUT} files for dimension ${DIM}d

  # Make output directories
  mkdir -p ${GENOUT}

  # Copy common sources
  cp -r ../src.ts/* $GENOUT

  # Copy compat mode override sources
  rm -f "${GENOUT}/raw.ts" "${GENOUT}/init.ts"
  cp -r ./src${DIM}d/* $GENOUT
}

process_flavor() {
  DIM=$1
  FEATURE_POSTFIX=$2

  echo gen_src: copying build files for ${FEATURE_POSTFIX}

  mkdir -p ./builds/${FEATURE_POSTFIX}/pkg/

  # Copy wasm files
  cp ./builds/${FEATURE_POSTFIX}/wasm-build/rapier_wasm* ./builds/${FEATURE_POSTFIX}/pkg/
  cp -r ./gen${DIM}d ./builds/${FEATURE_POSTFIX}/

  # Copy tsconfig files
  cp ./tsconfig.common.json ./tsconfig.json ./builds/${FEATURE_POSTFIX}/
  cp ./tsconfig.pkg${DIM}d.json ./builds/${FEATURE_POSTFIX}/tsconfig.pkg.json

  # Replace import.meta.url to prevent Babel issues
  sed -i.bak 's/import.meta.url/"<deleted>"/g' ./builds/${FEATURE_POSTFIX}/pkg/rapier_wasm${DIM}d.js

  # Clean up backup files
  find ./builds/${FEATURE_POSTFIX}/pkg/ -type f -name '*.bak' | xargs rm
}

# Remove #if sections based on dimension
remove_if_sections() {
  DIM=$1
  echo gen_src: removing \#if sections for dimension ${DIM}d
  if [ "$DIM" = "2" ]; then
    find ./gen2d/ -type f -print0 | LC_ALL=C xargs -0 sed -i.bak '\:#if DIM3:,\:#endif:d'
    find ./gen2d/ -type f -name '*.bak' | xargs rm
  elif [ "$DIM" = "3" ]; then
    find ./gen3d/ -type f -print0 | LC_ALL=C xargs -0 sed -i.bak '\:#if DIM2:,\:#endif:d'
    find ./gen3d/ -type f -name '*.bak' | xargs rm
  fi
}

# List of all flavors: (dimension feature)

# Check if FEATURE_TARGET and DIM_TARGET are set
if [ -n "$FEATURE_TARGET" ] && [ -n "$DIM_TARGET" ]; then
  # Validate DIM_TARGET
  if [ "$DIM_TARGET" != "2" ] && [ "$DIM_TARGET" != "3" ]; then
    echo "Invalid DIM_TARGET: $DIM_TARGET. Must be 2 or 3"; exit 1
  fi
  gen_js "$DIM_TARGET"
  remove_if_sections "$DIM_TARGET"
  # Map FEATURE_TARGET to the feature string used in the original script
  case "$FEATURE_TARGET" in
    simd) FEATURE="${DIM_TARGET}d-simd";;
    deterministic) FEATURE="${DIM_TARGET}d-deterministic";;
    non-deterministic|"") FEATURE="${DIM_TARGET}";;
    *) echo "Invalid FEATURE_TARGET: $FEATURE_TARGET"; exit 1;;
  esac

  # Process the specified flavor
  process_flavor "$DIM_TARGET" "$FEATURE"
else
  # Process all flavors if no specific target is provided
  gen_js "2"
  remove_if_sections "2"
  gen_js "3"
  remove_if_sections "3"
  ALL_FLAVORS="2 2d 2 2d-deterministic 2 2d-simd 3 3d 3 3d-deterministic 3 3d-simd"
  set -- $ALL_FLAVORS
  while [ $# -gt 0 ]; do
    DIM=$1
    FEATURE=$2
    process_flavor "$DIM" "$FEATURE"
    shift 2
  done
fi