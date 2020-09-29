import {RawBroadPhase} from "@dimforge/raw-rapier2d"

export class BroadPhase {
    private RAPIER: any;
    raw: RawBroadPhase;

    public free() {
        this.raw.free();
        this.raw = undefined;
    }

    constructor(RAPIER: any, raw?: RawBroadPhase) {
        this.raw = raw || new RAPIER.RawBroadPhase();
        this.RAPIER = RAPIER;
    }
}