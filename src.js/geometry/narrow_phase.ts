export class NarrowPhase {
    raw: any;

    constructor(RAPIER: any) {
        this.raw = new RAPIER.RawNarrowPhase();
    }
}