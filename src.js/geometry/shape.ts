import {Vector} from "../math"
import {RawShape} from "../rapier";

export class Ball {
    radius: number;

    constructor(radius: number) {
        this.radius = radius;
    }

    public intoRaw(RAPIER: any): RawShape {
        return RAPIER.RawShape.ball(this.radius);
    }
}

export class Cuboid {
    halfExtents: Vector;

    // #if DIM2
    constructor(hx: number, hy: number) {
        this.halfExtents = new Vector(hx, hy);
    }

    // #endif

    // #if DIM3
    constructor(hx: number, hy: number, hz: number) {
        this.halfExtents = new Vector(hx, hy, hz);
    }

    // #endif

    public intoRaw(RAPIER: any): RawShape {
        let rawHalfExtents = this.halfExtents.intoRaw(RAPIER);
        const result = RAPIER.RawShape.cuboid(rawHalfExtents);
        rawHalfExtents.free();
        return result;
    }
}
