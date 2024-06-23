// @ts-ignore
import wasmBase64 from "../pkg3d/rapier_wasm3d_bg.wasm";
import wasmInit from "../pkg3d/rapier_wasm3d";
import base64 from "base64-js";

/**
 * Flag to check if RAPIER has already been initialized
 * or is currently being initialized.
 */
let initialized = false;

/**
 * If init has already been called before but initialization
 * is not done yet, the unresolved promise is returned.
 */
let initPromise: ReturnType<typeof wasmInit> | undefined = undefined;

/**
 * Initializes RAPIER.
 * Has to be called and awaited before using any library methods.
 */
export async function init() {
    // return if RAPIER has been initialized
    if (initialized) return;

    // return the unresolve promise if RAPIER is currently initializing
    if (initPromise) return initPromise;

    // init and assign promise
    initPromise = wasmInit(
        base64.toByteArray(wasmBase64 as unknown as string).buffer,
    );

    // await initialization
    await initPromise;

    // set initialized flag
    initialized = true;
}
