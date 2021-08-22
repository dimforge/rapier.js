// @ts-ignore
import wasmBase64 from "../pkg3d/rapier_wasm3d_bg.wasm";
import wasmInit from "../pkg3d/rapier_wasm3d";

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
