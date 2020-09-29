import {RawNarrowPhase} from "@dimforge/rapier-core2d"

export class NarrowPhase {
    raw: RawNarrowPhase;

    public free() {
        this.raw.free();
        this.raw = undefined;
    }

    constructor(RAPIER: any, raw?: RawNarrowPhase) {
        this.raw = raw || new RAPIER.RawNarrowPhase();
    }
}