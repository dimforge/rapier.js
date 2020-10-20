import {Vector, VectorOps} from "../math"
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
    // #if DIM3
    Cylinder = 7,
    RoundCylinder = 8,
    Cone = 9,
    // #endif
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
        this.halfExtents = VectorOps.new(hx, hy);
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
        this.halfExtents = VectorOps.new(hx, hy, hz);
    }

    // #endif

    public intoRaw(): RawShape {
        let rawHalfExtents = VectorOps.intoRaw(this.halfExtents);
        const result = RawShape.cuboid(rawHalfExtents);
        rawHalfExtents.free();
        return result;
    }
}

/**
 * A shape that is a capsule.
 */
export class Capsule {
    /**
     * The radius of the capsule's basis.
     */
    readonly radius: number;

    /**
     * The capsule's half height, along the `y` axis.
     */
    readonly halfHeight: number;

    /**
     * Creates a new capsule with the given radius and half-height.
     * @param halfHeight - The balls half-height along the `y` axis.
     * @param radius - The balls radius.
     */
    constructor(halfHeight: number, radius: number) {
        this.halfHeight = halfHeight;
        this.radius = radius;
    }

    public intoRaw(): RawShape {
        return RawShape.capsule(this.halfHeight, this.radius);
    }
}


// #if DIM3
/**
 * A shape that is a 3D cylinder.
 */
export class Cylinder {
    /**
     * The radius of the cylinder's basis.
     */
    readonly radius: number;

    /**
     * The cylinder's half height, along the `y` axis.
     */
    readonly halfHeight: number;

    /**
     * Creates a new cylinder with the given radius and half-height.
     * @param halfHeight - The balls half-height along the `y` axis.
     * @param radius - The balls radius.
     */
    constructor(halfHeight: number, radius: number) {
        this.halfHeight = halfHeight;
        this.radius = radius;
    }

    public intoRaw(): RawShape {
        return RawShape.cylinder(this.halfHeight, this.radius);
    }
}


/**
 * A shape that is a 3D cylinder.
 */
export class RoundCylinder {
    /**
     * The radius of the cylinder's basis.
     */
    readonly radius: number;

    /**
     * The radius of the cylinder's rounded edges and vertices.
     */
    readonly roundRadius: number;

    /**
     * The cylinder's half height, along the `y` axis.
     */
    readonly halfHeight: number;

    /**
     * Creates a new cylinder with the given radius and half-height.
     * @param halfHeight - The balls half-height along the `y` axis.
     * @param radius - The balls radius.
     */
    constructor(halfHeight: number, radius: number, roundRadius: number) {
        this.roundRadius = roundRadius;
        this.halfHeight = halfHeight;
        this.radius = radius;
    }

    public intoRaw(): RawShape {
        return RawShape.roundCylinder(this.halfHeight, this.radius, this.roundRadius);
    }
}


/**
 * A shape that is a 3D cone.
 */
export class Cone {
    /**
     * The radius of the cone's basis.
     */
    readonly radius: number;

    /**
     * The cone's half height, along the `y` axis.
     */
    readonly halfHeight: number;

    /**
     * Creates a new cone with the given radius and half-height.
     * @param halfHeight - The balls half-height along the `y` axis.
     * @param radius - The balls radius.
     */
    constructor(halfHeight: number, radius: number) {
        this.halfHeight = halfHeight;
        this.radius = radius;
    }

    public intoRaw(): RawShape {
        return RawShape.cone(this.halfHeight, this.radius);
    }
}

// #if endif