// @ts-ignore
import wasmBase64 from "../pkg3d/rapier_wasm3d_bg.wasm";
import wasmInit from "../pkg3d/rapier_wasm3d";

/**
 * Initializes RAPIER.
 * Has to be called and awaited before using any library methods.
 */
export async function init() {
  await wasmInit(Buffer.from(wasmBase64 as unknown as string, "base64"));
}
