import {Vector, VectorOps} from "../math"
import {RawShape} from "../raw";

// #if DIM2
/**
 * The type of a shape supported by Rapier.
 */
export type Shape = Ball | Cuboid | Capsule | Segment | Triangle
    | TriMesh | Heightfield | ConvexPolygon | RoundCuboid
    | RoundTriangle | RoundConvexPolygon;

/**
 * An enumeration representing the type of a shape.
 */
export enum ShapeType {
    Ball = 0,
    Cuboid = 1,
    Capsule = 2,
    Segment = 3,
    Polyline = 4,
    Triangle = 5,
    TriMesh = 6,
    HeightField = 7,
    // Compound = 8,
    ConvexPolygon = 9,
    RoundCuboid = 10,
    RoundTriangle = 11,
    RoundConvexPolygon = 12,
}

// #endif

// #if DIM3
/**
 * The type of a shape supported by Rapier.
 */
export type Shape = Ball | Cuboid | Capsule | Segment | Triangle
    | TriMesh | Heightfield | ConvexPolyhedron | Cylinder
    | Cone | RoundCuboid | RoundCylinder | RoundCone | RoundConvexPolyhedron

/**
 * An enumeration representing the type of a shape.
 */
export enum ShapeType {
    Ball = 0,
    Cuboid = 1,
    Capsule = 2,
    Segment = 3,
    Polyline = 4,
    Triangle = 5,
    TriMesh = 6,
    HeightField = 7,
    // Compound = 8,
    ConvexPolyhedron = 9,
    Cylinder = 10,
    Cone = 11,
    RoundCuboid = 12,
    RoundTriangle = 13,
    RoundCylinder = 14,
    RoundCone = 15,
    RoundConvexPolyhedron = 16,
}

// #endif

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
        // #if DIM2
        return RawShape.cuboid(this.halfExtents.x, this.halfExtents.y);
        // #endif

        // #if DIM3
        return RawShape.cuboid(this.halfExtents.x, this.halfExtents.y, this.halfExtents.z);
        // #endif
    }
}


/**
 * A shape that is a box in 3D and a rectangle in 2D, with round corners.
 */
export class RoundCuboid {
    /**
     * The half extent of the cuboid along each coordinate axis.
     */
    halfExtents: Vector;

    /**
     * The radius of the cuboid's round border.
     */
    borderRadius: number;

    // #if DIM2
    /**
     * Creates a new 2D rectangle.
     * @param hx - The half width of the rectangle.
     * @param hy - The helf height of the rectangle.
     * @param borderRadius - The radius of the borders of this cuboid. This will
     *   effectively increase the half-extents of the cuboid by this radius.
     */
    constructor(hx: number, hy: number, borderRadius: number) {
        this.halfExtents = VectorOps.new(hx, hy);
        this.borderRadius = borderRadius;
    }

    // #endif

    // #if DIM3
    /**
     * Creates a new 3D cuboid.
     * @param hx - The half width of the cuboid.
     * @param hy - The half height of the cuboid.
     * @param hz - The half depth of the cuboid.
     * @param borderRadius - The radius of the borders of this cuboid. This will
     *   effectively increase the half-extents of the cuboid by this radius.
     */
    constructor(hx: number, hy: number, hz: number, borderRadius: number) {
        this.halfExtents = VectorOps.new(hx, hy, hz);
        this.borderRadius = borderRadius;
    }

    // #endif

    public intoRaw(): RawShape {
        // #if DIM2
        return RawShape.roundCuboid(this.halfExtents.x, this.halfExtents.y, this.borderRadius);
        // #endif

        // #if DIM3
        return RawShape.roundCuboid(this.halfExtents.x, this.halfExtents.y, this.halfExtents.z, this.borderRadius);
        // #endif
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
 * A shape that is a segment.
 */
export class Segment {
    /**
     * The first point of the segment.
     */
    readonly a: Vector;

    /**
     * The second point of the segment.
     */
    readonly b: Vector;

    /**
     * Creates a new segment shape.
     * @param a - The first point of the segment.
     * @param b - The second point of the segment.
     */
    constructor(a: Vector, b: Vector) {
        this.a = a;
        this.b = b;
    }

    public intoRaw(): RawShape {
        let ra = VectorOps.intoRaw(this.a);
        let rb = VectorOps.intoRaw(this.b);
        let result = RawShape.segment(ra, rb);
        ra.free();
        rb.free();
        return result;
    }
}

/**
 * A shape that is a segment.
 */
export class Triangle {
    /**
     * The first point of the triangle.
     */
    readonly a: Vector;

    /**
     * The second point of the triangle.
     */
    readonly b: Vector;

    /**
     * The second point of the triangle.
     */
    readonly c: Vector;

    /**
     * Creates a new triangle shape.
     *
     * @param a - The first point of the triangle.
     * @param b - The second point of the triangle.
     * @param c - The third point of the triangle.
     */
    constructor(a: Vector, b: Vector, c: Vector) {
        this.a = a;
        this.b = b;
        this.c = c;
    }

    public intoRaw(): RawShape {
        let ra = VectorOps.intoRaw(this.a);
        let rb = VectorOps.intoRaw(this.b);
        let rc = VectorOps.intoRaw(this.c);
        let result = RawShape.triangle(ra, rb, rc);
        ra.free();
        rb.free();
        rc.free();
        return result;
    }
}


/**
 * A shape that is a triangle with round borders and a non-zero thickness.
 */
export class RoundTriangle {
    /**
     * The first point of the triangle.
     */
    readonly a: Vector;

    /**
     * The second point of the triangle.
     */
    readonly b: Vector;

    /**
     * The second point of the triangle.
     */
    readonly c: Vector;

    /**
     * The radius of the triangles's rounded edges and vertices.
     * In 3D, this is also equal to half the thickness of the round triangle.
     */
    readonly borderRadius: number;

    /**
     * Creates a new triangle shape with round corners.
     *
     * @param a - The first point of the triangle.
     * @param b - The second point of the triangle.
     * @param c - The third point of the triangle.
     * @param borderRadius - The radius of the borders of this triangle. In 3D,
     *   this is also equal to half the thickness of the triangle.
     */
    constructor(a: Vector, b: Vector, c: Vector, borderRadius: number) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.borderRadius = borderRadius;
    }

    public intoRaw(): RawShape {
        let ra = VectorOps.intoRaw(this.a);
        let rb = VectorOps.intoRaw(this.b);
        let rc = VectorOps.intoRaw(this.c);
        let result = RawShape.roundTriangle(ra, rb, rc, this.borderRadius);
        ra.free();
        rb.free();
        rc.free();
        return result;
    }
}

/**
 * A shape that is a triangle mesh.
 */
export class Polyline {
    /**
     * The vertices of the polyline.
     */
    readonly vertices: Float32Array;

    /**
     * The indices of the segments.
     */
    readonly indices: Uint32Array;

    /**
     * Creates a new polyline shape.
     *
     * @param vertices - The coordinates of the polyline's vertices.
     * @param indices - The indices of the polyline's segments. If this is `null` then
     *    the vertices are assumed to form a line strip.
     */
    constructor(vertices: Float32Array, indices: Uint32Array) {
        this.vertices = vertices;
        this.indices = !!indices ? indices : new Uint32Array();
    }

    public intoRaw(): RawShape {
        return RawShape.polyline(this.vertices, this.indices);
    }
}

/**
 * A shape that is a triangle mesh.
 */
export class TriMesh {
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
 * A shape that is a convex polygon.
 */
export class ConvexPolygon {
    /**
     * The vertices of the convex polygon.
     */
    readonly vertices: Float32Array;

    /**
     * Do we want to assume the vertices already form a convex hull?
     */
    readonly skipConvexHullComputation: boolean;

    /**
     * Creates a new convex polygon shape.
     *
     * @param vertices - The coordinates of the convex polygon's vertices.
     * @param skipConvexHullComputation - If set to `true`, the input points will
     *   be assumed to form a convex polyline and no convex-hull computation will
     *   be done automatically.
     */
    constructor(vertices: Float32Array, skipConvexHullComputation: boolean) {
        this.vertices = vertices;
        this.skipConvexHullComputation = !!skipConvexHullComputation;
    }

    public intoRaw(): RawShape {
        if (this.skipConvexHullComputation) {
            return RawShape.convexPolyline(this.vertices);
        } else {
            return RawShape.convexHull(this.vertices);
        }
    }
}

/**
 * A shape that is a convex polygon.
 */
export class RoundConvexPolygon {
    /**
     * The vertices of the convex polygon.
     */
    readonly vertices: Float32Array;

    /**
     * Do we want to assume the vertices already form a convex hull?
     */
    readonly skipConvexHullComputation: boolean;

    /**
     * The radius of the convex polygon's rounded edges and vertices.
     */
    readonly borderRadius: number;

    /**
     * Creates a new convex polygon shape.
     *
     * @param vertices - The coordinates of the convex polygon's vertices.
     * @param borderRadius - The radius of the borders of this convex polygon.
     * @param skipConvexHullComputation - If set to `true`, the input points will
     *   be assumed to form a convex polyline and no convex-hull computation will
     *   be done automatically.
     */
    constructor(vertices: Float32Array, borderRadius: number, skipConvexHullComputation: boolean) {
        this.vertices = vertices;
        this.borderRadius = borderRadius;
        this.skipConvexHullComputation = !!skipConvexHullComputation;
    }

    public intoRaw(): RawShape {
        if (this.skipConvexHullComputation) {
            return RawShape.roundConvexPolyline(this.vertices, this.borderRadius);
        } else {
            return RawShape.roundConvexHull(this.vertices, this.borderRadius);
        }
    }
}

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
 * A shape that is a convex polygon.
 */
export class ConvexPolyhedron {
    /**
     * The vertices of the convex polygon.
     */
    readonly vertices: Float32Array;

    /**
     * The indices of the convex polygon.
     */
    readonly indices: Uint32Array | null;


    /**
     * Creates a new convex polygon shape.
     *
     * @param vertices - The coordinates of the convex polygon's vertices.
     * @param indices - The index buffer of this convex mesh. If this is `null`
     *   or `undefined`, the convex-hull of the input vertices will be computed
     *   automatically. Otherwise, it will be assumed that the mesh you provide
     *   is already convex.
     */
    constructor(vertices: Float32Array, indices: Uint32Array | null) {
        this.vertices = vertices;
        this.indices = indices;
    }

    public intoRaw(): RawShape {
        if (!!this.indices) {
            return RawShape.convexMesh(this.vertices, this.indices);
        } else {
            return RawShape.convexHull(this.vertices);
        }
    }
}


/**
 * A shape that is a convex polygon.
 */
export class RoundConvexPolyhedron {
    /**
     * The vertices of the convex polygon.
     */
    readonly vertices: Float32Array;

    /**
     * The indices of the convex polygon.
     */
    readonly indices: Uint32Array | null;

    /**
     * The radius of the convex polyhedron's rounded edges and vertices.
     */
    readonly borderRadius: number;

    /**
     * Creates a new convex polygon shape.
     *
     * @param vertices - The coordinates of the convex polygon's vertices.
     * @param indices - The index buffer of this convex mesh. If this is `null`
     *   or `undefined`, the convex-hull of the input vertices will be computed
     *   automatically. Otherwise, it will be assumed that the mesh you provide
     *   is already convex.
     * @param borderRadius - The radius of the borders of this convex polyhedron.
     */
    constructor(vertices: Float32Array, indices: Uint32Array | null, borderRadius: number) {
        this.vertices = vertices;
        this.indices = indices;
        this.borderRadius = borderRadius;
    }

    public intoRaw(): RawShape {
        if (!!this.indices) {
            return RawShape.roundConvexMesh(this.vertices, this.indices, this.borderRadius);
        } else {
            return RawShape.roundConvexHull(this.vertices, this.borderRadius);
        }
    }
}

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
 * A shape that is a 3D cylinder with round corners.
 */
export class RoundCylinder {
    /**
     * The radius of the cylinder's basis.
     */
    readonly radius: number;

    /**
     * The cylinder's half height, along the `y` axis.
     */
    readonly halfHeight: number;

    /**
     * The radius of the cylinder's rounded edges and vertices.
     */
    readonly borderRadius: number;

    /**
     * Creates a new cylinder with the given radius and half-height.
     * @param halfHeight - The balls half-height along the `y` axis.
     * @param radius - The balls radius.
     * @param borderRadius - The radius of the borders of this cylinder.
     */
    constructor(halfHeight: number, radius: number, borderRadius: number) {
        this.borderRadius = borderRadius;
        this.halfHeight = halfHeight;
        this.radius = radius;
    }

    public intoRaw(): RawShape {
        return RawShape.roundCylinder(this.halfHeight, this.radius, this.borderRadius);
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

/**
 * A shape that is a 3D cone with round corners.
 */
export class RoundCone {
    /**
     * The radius of the cone's basis.
     */
    readonly radius: number;

    /**
     * The cone's half height, along the `y` axis.
     */
    readonly halfHeight: number;

    /**
     * The radius of the cylinder's rounded edges and vertices.
     */
    readonly borderRadius: number;

    /**
     * Creates a new cone with the given radius and half-height.
     * @param halfHeight - The balls half-height along the `y` axis.
     * @param radius - The balls radius.
     * @param borderRadius - The radius of the borders of this cone.
     */
    constructor(halfHeight: number, radius: number, borderRadius: number) {
        this.halfHeight = halfHeight;
        this.radius = radius;
        this.borderRadius = borderRadius;
    }

    public intoRaw(): RawShape {
        return RawShape.roundCone(this.halfHeight, this.radius, this.borderRadius);
    }
}

// #endif