// @ts-ignore
import wasmYEnc from "../pkg3d/rapier_wasm3d_bg.wasm";
import wasmInit from "../pkg3d/rapier_wasm3d";
// @ts-ignore
import {decode} from "simple-yenc";

/**
 * Initializes RAPIER.
 * Has to be called and awaited before using any library methods.
 */
export function init() {
    return wasmInit(decode(wasmYEnc as unknown as string));
}
