import {RawBroadPhase} from "@dimforge/rapier-core2d"

/**
 * The broad-phase used for coarse collision-detection.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `broadPhase.free()`
 * once you are done using it.
 */
export class BroadPhase {
    private RAPIER: any;
    raw: RawBroadPhase;

    /**
     * Release the WASM memory occupied by this broad-phase.
     */
    public free() {
        this.raw.free();
        this.raw = undefined;
    }

    constructor(RAPIER: any, raw?: RawBroadPhase) {
        this.raw = raw || new RAPIER.RawBroadPhase();
        this.RAPIER = RAPIER;
    }
}