import {RawBroadPhase} from "../raw";

/**
 * The broad-phase used for coarse collision-detection.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `broadPhase.free()`
 * once you are done using it.
 */
export class BroadPhase {
    raw: RawBroadPhase;

    /**
     * Release the WASM memory occupied by this broad-phase.
     */
    public free() {
        if (!!this.raw) {
            this.raw.free();
        }
        this.raw = undefined;
    }

    constructor(raw?: RawBroadPhase) {
        this.raw = raw || new RawBroadPhase();
    }
}
