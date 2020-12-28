import {Vector, VectorOps} from "../math"
import {RawShape} from "../raw";

/**
 * An enumeration representing the type of a shape.
 */
export enum ShapeType {
    Ball = 0,
    Polygon = 1,
    Cuboid = 2,
    Capsule = 3,
    Segment = 4,
    Triangle = 5,
    Trimesh = 6,
    HeightField = 7,
    // # if DIM3
    Cylinder = 8,
    RoundCylinder = 9,
    Cone = 10,
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

/**
 * A shape that is a triangle mesh.
 */
export class Trimesh {
    /**
     * The vertices of the triangle mesh.
     */
    readonly vertices: Float32Array;

    /**
     * The indices of the triangles.
     */
    readonly indices: Uint32Array;

    /**
     * Creates a new triangle mesh shape.
     *
     * @param vertices - The coordinates of the triangle mesh's vertices.
     * @param indices - The indices of the triangle mesh's triangles.
     */
    constructor(vertices: Float32Array, indices: Uint32Array) {
        this.vertices = vertices;
        this.indices = indices;
    }

    public intoRaw(): RawShape {
        return RawShape.trimesh(this.vertices, this.indices);
    }
}

// #if DIM2
/**
 * A shape that is a heightfield.
 */
export class Heightfield {
    /**
     * The heights of the heightfield, along its local `y` axis.
     */
    readonly heights: Float32Array;

    /**
     * The heightfield's length along its local `x` axis.
     */
    readonly scale: Vector;

    /**
     * Creates a new heightfield shape.
     *
     * @param heights - The heights of the heightfield, along its local `y` axis.
     * @param scale - The scale factor applied to the heightfield.
     */
    constructor(heights: Float32Array, scale: Vector) {
        this.heights = heights;
        this.scale = scale;
    }

    public intoRaw(): RawShape {
        let rawScale = VectorOps.intoRaw(this.scale);
        let rawShape = RawShape.heightfield(this.heights, rawScale);
        rawScale.free();
        return rawShape;
    }
}

// #endif


// #if DIM3
/**
 * A shape that is a heightfield.
 */
export class Heightfield {
    /**
     * The number of rows in the heights matrix.
     */
    readonly nrows: number;

    /**
     * The number of columns in the heights matrix.
     */
    readonly ncols: number;

    /**
     * The heights of the heightfield along its local `y` axis,
     * provided as a matrix stored in column-major order.
     */
    readonly heights: Float32Array;

    /**
     * The dimensions of the heightfield's local `x,z` plane.
     */
    readonly scale: Vector;

    /**
     * Creates a new heightfield shape.
     *
     * @param nrows − The number of rows in the heights matrix.
     * @param ncols - The number of columns in the heights matrix.
     * @param heights - The heights of the heightfield along its local `y` axis,
     *                  provided as a matrix stored in column-major order.
     * @param scale - The dimensions of the heightfield's local `x,z` plane.
     */
    constructor(nrows: number, ncols: number, heights: Float32Array, scale: Vector) {
        this.nrows = nrows;
        this.ncols = ncols;
        this.heights = heights;
        this.scale = scale;
    }

    public intoRaw(): RawShape {
        let rawScale = VectorOps.intoRaw(this.scale);
        let rawShape = RawShape.heightfield(this.nrows, this.ncols, this.heights, rawScale);
        rawScale.free();
        return rawShape;
    }
}

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

// #endif