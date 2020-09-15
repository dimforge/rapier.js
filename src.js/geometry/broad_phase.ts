export class BroadPhase {
    raw: any;

    constructor(RAPIER: any) {
        this.raw = new RAPIER.RawBroadPhase();
    }
}