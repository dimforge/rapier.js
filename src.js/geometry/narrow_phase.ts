import {RawNarrowPhase} from "../rapier"

export class NarrowPhase {
    raw: RawNarrowPhase;

    public free() {
        this.raw.free();
    }

    constructor(RAPIER: any) {
        this.raw = new RAPIER.RawNarrowPhase();
    }
}