import {RawNarrowPhase} from "@dimforge/rapier-core2d"

/**
 * The narrow-phase used for precise collision-detection.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `narrowPhase.free()`
 * once you are done using it.
 */
export class NarrowPhase {
    raw: RawNarrowPhase;

    /**
     * Release the WASM memory occupied by this narrow-phase.
     */
    public free() {
        this.raw.free();
        this.raw = undefined;
    }

    constructor(RAPIER: any, raw?: RawNarrowPhase) {
        this.raw = raw || new RAPIER.RawNarrowPhase();
    }
}