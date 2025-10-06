#!/bin/bash

# Generate raw.d.ts for a specific flavor or all flavors based on FEATURE_TARGET and DIM_TARGET

if [ -n "$FEATURE_TARGET" ] && [ -n "$DIM_TARGET" ]; then
  case "$FEATURE_TARGET" in
    simd|deterministic|non-deterministic|"") ;;
    *) echo "Invalid FEATURE_TARGET: $FEATURE_TARGET"; exit 1;;
  esac
  case "$DIM_TARGET" in
    2|3) ;;
    *) echo "Invalid DIM_TARGET: $DIM_TARGET"; exit 1;;
  esac
  FEATURE_STR="${DIM_TARGET}d${FEATURE_TARGET:+-$FEATURE_TARGET}"
  [ "$FEATURE_TARGET" = "non-deterministic" ] && FEATURE_STR="${DIM_TARGET}d"
  echo 'export * from "./rapier_wasm'"${FEATURE_STR}"'"' > "builds/${FEATURE_STR}/pkg/raw.d.ts"
else
  for feature in 2d 2d-deterministic 2d-simd 3d 3d-deterministic 3d-simd; do
    echo 'export * from "./rapier_wasm'"${feature}"'"' > "builds/${feature}/pkg/raw.d.ts"
  done
fi