// @ts-ignore
import wasmBase64 from "../pkg2d/rapier_wasm2d_bg.wasm";
import wasmInit from "../pkg2d/rapier_wasm2d";

/**
 * Initializes RAPIER.
 * Has to be called and awaited before using any library methods.
 */
export async function init() {
  await wasmInit(
    Uint8Array.from(globalThis.atob(wasmBase64 as unknown as string), (c) =>
      c.charCodeAt(0)
    ).buffer
  );
}
