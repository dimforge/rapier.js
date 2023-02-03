// @ts-ignore
import wasmYEnc from "../pkg2d/rapier_wasm2d_bg.wasm";
import wasmInit from "../pkg2d/rapier_wasm2d";
// @ts-ignore
import {decode} from "simple-yenc";

/**
 * Initializes RAPIER.
 * Has to be called and awaited before using any library methods.
 */
export function init() {
    return wasmInit(decode(wasmYEnc as unknown as string));
}
