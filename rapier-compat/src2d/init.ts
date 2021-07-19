// @ts-ignore
import wasmBase64 from "../pkg2d/rapier_wasm2d_bg.wasm";
import wasmInit from "../pkg2d/rapier_wasm2d";

/**
 * Initializes RAPIER.
 * Has to be called and awaited before using any library methods.
 */
export async function init() {
  await wasmInit(Buffer.from(wasmBase64 as unknown as string, "base64"));
}
