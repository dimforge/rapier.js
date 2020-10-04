import {Vector} from "../math"
import {RawShape} from "../raw";

/**
 * An enumeration representing the type of a shape.
 */
export enum ShapeType {
    Ball = 0,
    Cuboid = 1,
    Capsule = 2,
    Triangle = 3,
    Polygon = 4,
    Trimesh = 5,
    HeightField = 6,
}

/**
 * A shape that is a sphere in 3D and a circle in 2D.
 */
export class Ball {
    /**
     * The balls radius.
     */
    readonly radius: number;

    /**
     * Creates a new ball with the given radius.
     * @param radius - The balls radius.
     */
    constructor(radius: number) {
        this.radius = radius;
    }

    public intoRaw(): RawShape {
        return RawShape.ball(this.radius);
    }
}

/**
 * A shape that is a box in 3D and a rectangle in 2D.
 */
export class Cuboid {
    /**
     * The half extent of the cuboid along each coordinate axis.
     */
    halfExtents: Vector;

    // #if DIM2
    /**
     * Creates a new 2D rectangle.
     * @param hx - The half width of the rectangle.
     * @param hy - The helf height of the rectangle.
     */
    constructor(hx: number, hy: number) {
        this.halfExtents = new Vector(hx, hy);
    }

    // #endif

    // #if DIM3
    /**
     * Creates a new 3D cuboid.
     * @param hx - The half width of the cuboid.
     * @param hy - The half height of the cuboid.
     * @param hz - The half depth of the cuboid.
     */
    constructor(hx: number, hy: number, hz: number) {
        this.halfExtents = new Vector(hx, hy, hz);
    }

    // #endif

    public intoRaw(): RawShape {
        let rawHalfExtents = Vector.intoRaw(this.halfExtents);
        const result = RawShape.cuboid(rawHalfExtents);
        rawHalfExtents.free();
        return result;
    }
}
