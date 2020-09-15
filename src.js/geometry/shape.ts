import {Vector} from "../math"

export enum ShapeType {
    Ball,
    Cuboid,
}

export class Ball {
    type: ShapeType;
    radius: number;

    constructor(radius: number) {
        this.type = ShapeType.Ball;
        this.radius = radius;
    }
}

export class Cuboid {
    type: ShapeType;
    halfExtents: Vector;

    // #if DIM2
    constructor(hx: number, hy: number) {
        this.type = ShapeType.Cuboid;
        this.halfExtents = new Vector(hx, hy);
    }
    // #endif

    // #if DIM3
    constructor(hx: number, hy: number, hz: number) {
        this.halfExtents = new Vector(hx, hy, hz);
    }
    // #endif
}
