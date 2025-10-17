import wasmInit from "../pkg3d/rapier_wasm3d";

/**
 * Initializes RAPIER.
 * Has to be called and awaited before using any library methods.
 */
export async function init(module: WebAssembly.Module) {
    await wasmInit(module);
}
