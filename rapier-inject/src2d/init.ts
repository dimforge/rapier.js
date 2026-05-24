import wasmInit from "../pkg2d/rapier_wasm2d";

/**
 * Initializes RAPIER.
 * Has to be called and awaited before using any library methods.
 */
export async function init(module: WebAssembly.Module) {
    await wasmInit(module);
}
