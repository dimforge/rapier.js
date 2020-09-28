import {RawBroadPhase} from "../rapier"

export class BroadPhase {
    raw: RawBroadPhase;
    
    public free() {
        this.raw.free();
    }

    constructor(RAPIER: any) {
        this.raw = new RAPIER.RawBroadPhase();
    }
}