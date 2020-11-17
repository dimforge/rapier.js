import {RawColliderSet} from "../raw"
import {Rotation, RotationOps, Vector, VectorOps} from '../math';
import {
    InteractionGroups,
    Cuboid, Ball, ShapeType, Capsule, Trimesh, Heightfield,
    // #if DIM3
    Cylinder, RoundCylinder, Cone,
    // #endif
} from './index';
import {RigidBody, RigidBodyHandle} from '../dynamics';

/**
 * The integer identifier of a collider added to a `ColliderSet`.
 */
export type ColliderHandle = number;

/**
 * A geometric entity that can be attached to a body so it can be affected
 * by contacts and proximity queries.
 */
export class Collider {
    private rawSet: RawColliderSet; // The Collider won't need to free this.
    readonly handle: ColliderHandle;

    constructor(rawSet: RawColliderSet, handle: ColliderHandle) {
        this.rawSet = rawSet;
        this.handle = handle;
    }


    /**
     * Checks if this collider is still valid (i.e. that it has
     * not been deleted from the collider set yet.
     */
    public isValid(): boolean {
        return this.rawSet.contains(this.handle);
    }

    /**
     * The world-space translation of this rigid-body.
     */
    public translation(): Vector {
        return VectorOps.fromRaw(this.rawSet.coTranslation(this.handle));
    }

    /**
     * The world-space orientation of this rigid-body.
     */
    public rotation(): Rotation {
        return RotationOps.fromRaw(this.rawSet.coRotation(this.handle));
    }

    /**
     * Is this collider a sensor?
     */
    public isSensor(): boolean {
        return this.rawSet.coIsSensor(this.handle);
    }

    /**
     * The type of the shape of this collider.
     */
    public shapeType(): ShapeType {
        return this.rawSet.coShapeType(this.handle);
    }

    /**
     * The half-extents of this collider if it is a cuboid shape.
     */
    public halfExtents(): Vector {
        return VectorOps.fromRaw(this.rawSet.coHalfExtents(this.handle));
    }

    /**
     * The radius of this collider if it is a ball, cylinder, capsule, or cone shape.
     */
    public radius(): number {
        return this.rawSet.coRadius(this.handle);
    }

    /**
     * The radius of the round edges of this collider if it is a round cylinder.
     */
    public roundRadius(): number {
        return this.rawSet.coRoundRadius(this.handle);
    }

    /**
     * The half height of this collider if it is a cylinder, capsule, or cone shape.
     */
    public halfHeight(): number {
        return this.rawSet.coHalfHeight(this.handle);
    }

    /**
     * If this collider has a triangle mesh shape, this returns the vertex buffer
     * of the triangle esh.
     */
    public trimeshVertices(): Float32Array {
        return this.rawSet.coTrimeshVertices(this.handle);
    }

    /**
     * If this collider has a triangle mesh shape, this returns the index buffer
     * of the triangle mesh.
     */
    public trimeshIndices(): Uint32Array {
        return this.rawSet.coTrimeshIndices(this.handle);
    }

    /**
     * If this collider has a heightfield shape, this returns the heights buffer of
     * the heightfield.
     * In 3D, the returned height matrix is provided in column-major order.
     */
    public heightfieldHeights(): Float32Array {
        return this.rawSet.coHeightfieldHeights(this.handle);
    }

    /**
     * If this collider has a heightfield shape, this returns the scale
     * applied to it.
     */
    public heightfieldScale(): Vector {
        let scale = this.rawSet.coHeightfieldScale(this.handle);
        return VectorOps.fromRaw(scale);
    }

    // #if DIM3
    /**
     * If this collider has a heightfield shape, this returns the number of
     * rows of its height matrix.
     */
    public heightfieldNRows(): number {
        return this.rawSet.coHeightfieldNRows(this.handle);
    }

    /**
     * If this collider has a heightfield shape, this returns the number of
     * columns of its height matrix.
     */
    public heightfieldNCols(): number {
        return this.rawSet.coHeightfieldNCols(this.handle);
    }

    // #endif

    /**
     * The unique integer identifier of the rigid-body this collider is attached to.
     */
    public parent(): RigidBodyHandle {
        return this.rawSet.coParent(this.handle);
    }

    /**
     * The friction coefficient of this collider.
     */
    public friction(): number {
        return this.rawSet.coFriction(this.handle);
    }

    /**
     * The density of this collider.
     */
    public density(): number {
        return this.rawSet.coDensity(this.handle);
    }

    /**
     * The collision groups of this collider.
     */
    public collisionGroups(): InteractionGroups {
        return this.rawSet.coCollisionGroups(this.handle);
    }

    /**
     * The solver gorups of this collider.
     */
    public solverGroups(): InteractionGroups {
        return this.rawSet.coSolverGroups(this.handle);
    }
}


export class ColliderDesc {
    shape: Ball | Cuboid | Capsule | Trimesh | Heightfield
// #if DIM3
        | Cylinder | RoundCylinder | Cone
        // #endif
    ;
    density?: number;
    friction: number;
    restitution: number;
    rotation: Rotation;
    translation: Vector;
    isSensor: boolean;
    collisionGroups: InteractionGroups;
    solverGroups: InteractionGroups;

    /**
     * Initializes a collider descriptor from the collision shape.
     *
     * @param shape - The shape of the collider being built.
     */
    constructor(shape: Ball | Cuboid | Capsule | Trimesh | Heightfield
// #if DIM3
        | Cylinder | RoundCylinder | Cone
                // #endif
    ) {
        this.shape = shape;
        this.density = null;
        this.friction = 0.5;
        this.restitution = 0.0;
        this.rotation = RotationOps.identity();
        this.translation = VectorOps.zeros();
        this.isSensor = false;
        this.collisionGroups = 0xffff_ffff;
        this.solverGroups = 0xffff_ffff;
    }

    /**
     * Create a new collider descriptor with a ball shape.
     *
     * @param radius - The radius of the ball.
     */
    public static ball(radius: number): ColliderDesc {
        const shape = new Ball(radius);
        return new ColliderDesc(shape);
    }

    /**
     * Create a new collider descriptor with a capsule shape.
     *
     * @param half_height - The half-height of the capsule, along the `y` axis.
     * @param radius - The radius of the capsule basis.
     */
    public static capsule(half_height: number, radius: number): ColliderDesc {
        const shape = new Capsule(half_height, radius);
        return new ColliderDesc(shape);
    }

    /**
     * Creates a new collider descriptor with a triangle mesh shape.
     *
     * @param vertices - The coordinates of the triangle mesh's vertices.
     * @param indices - The indices of the triangle mesh's triangles.
     */
    public static trimesh(vertices: Float32Array, indices: Uint32Array) {
        const shape = new Trimesh(vertices, indices);
        return new ColliderDesc(shape);
    }

    // #if DIM2
    /**
     * Creates a new collider descriptor with a rectangular shape.
     *
     * @param hx - The half-width of the rectangle along its local `x` axis.
     * @param hy - The half-width of the rectangle along its local `y` axis.
     */
    public static cuboid(hx: number, hy: number): ColliderDesc {
        const shape = new Cuboid(hx, hy);
        return new ColliderDesc(shape);
    }

    /**
     * Creates a new collider descriptor with a heightfield shape.
     *
     * @param heights - The heights of the heightfield, along its local `y` axis.
     * @param scale - The scale factor applied to the heightfield.
     */
    public static heightfield(heights: Float32Array, scale: Vector) {
        const shape = new Heightfield(heights, scale);
        return new ColliderDesc(shape);
    }

    // #endif

    // #if DIM3
    /**
     * Creates a new collider descriptor with a cuboid shape.
     *
     * @param hx - The half-width of the rectangle along its local `x` axis.
     * @param hy - The half-width of the rectangle along its local `y` axis.
     * @param hz - The half-width of the rectangle along its local `z` axis.
     */
    public static cuboid(hx: number, hy: number, hz: number): ColliderDesc {
        const shape = new Cuboid(hx, hy, hz);
        return new ColliderDesc(shape);
    }

    /**
     * Creates a new collider descriptor with a heightfield shape.
     *
     * @param nrows − The number of rows in the heights matrix.
     * @param ncols - The number of columns in the heights matrix.
     * @param heights - The heights of the heightfield along its local `y` axis,
     *                  provided as a matrix stored in column-major order.
     * @param scale - The scale factor applied to the heightfield.
     */
    public static heightfield(nrows: number, ncols: number, heights: Float32Array, scale: Vector) {
        const shape = new Heightfield(nrows, ncols, heights, scale);
        return new ColliderDesc(shape);
    }

    /**
     * Create a new collider descriptor with a cylinder shape.
     *
     * @param half_height - The half-height of the cylinder, along the `y` axis.
     * @param radius - The radius of the cylinder basis.
     */
    public static cylinder(half_height: number, radius: number): ColliderDesc {
        const shape = new Cylinder(half_height, radius);
        return new ColliderDesc(shape);
    }

    /**
     * Create a new collider descriptor with a cylinder shape with rounded corners.
     *
     * @param half_height - The half-height of the cylinder, along the `y` axis.
     * @param radius - The radius of the cylinder basis.
     * @param round_radius - The radius of the cylinder's rounded edges and vertices.
     */
    public static roundCylinder(half_height: number, radius: number, round_radius: number): ColliderDesc {
        const shape = new RoundCylinder(half_height, radius, round_radius);
        return new ColliderDesc(shape);
    }

    /**
     * Create a new collider descriptor with a cone shape.
     *
     * @param half_height - The half-height of the cone, along the `y` axis.
     * @param radius - The radius of the cone basis.
     */
    public static cone(half_height: number, radius: number): ColliderDesc {
        const shape = new Cone(half_height, radius);
        return new ColliderDesc(shape);
    }

    // #endif

    /**
     * Sets the position of the collider to be created relative to the rigid-body it is attached to.
     *
     * @param tra - The position of the collider to be created relative to the rigid-body it is attached to.
     */
    public setTranslation(tra: Vector): ColliderDesc {
        this.translation = tra;
        return this;
    }

    /**
     * Sets the rotation of the collider to be created relative to the rigid-body it is attached to.
     *
     * @param rot - The rotation of the collider to be created relative to the rigid-body it is attached to.
     */
    public setRotation(rot: Rotation): ColliderDesc {
        this.rotation = rot;
        return this;
    }

    /**
     * Sets whether or not the collider being created is a sensor.
     *
     * A sensor collider does not take part of the physics simulation, but generates
     * proximity events.
     *
     * @param is - Set to `true` of the collider built is to be a sensor.
     */
    public setIsSensor(is: boolean): ColliderDesc {
        this.isSensor = is;
        return this;
    }

    /**
     * Sets the density of the collider being built.
     *
     * @param density - The density to set, must be greater or equal to 0. A density of 0 means that this collider
     *                  will not affect the mass or angular inertia of the rigid-body it is attached to.
     */
    public setDensity(density: number): ColliderDesc {
        this.density = density;
        return this;
    }

    /**
     * Sets the restitution coefficient of the collider to be created.
     *
     * @param restitution - The restitution coefficient in `[0, 1]`. A value of 0 (the default) means no bouncing behavior
     *                   while 1 means perfect bouncing (though energy may still be lost due to numerical errors of the
     *                   constraints solver).
     */
    public setRestitution(restitution: number): ColliderDesc {
        this.restitution = restitution;
        return this;
    }

    /**
     * Sets the friction coefficient of the collider to be created.
     *
     * @param friction - The friction coefficient. Must be greater or equal to 0. This is generally smaller than 1. The
     *                   higher the coefficient, the stronger friction forces will be for contacts with the collider
     *                   being built.
     */
    public setFriction(friction: number): ColliderDesc {
        this.friction = friction;
        return this;
    }

    /**
     * Sets the collision groups used by this collider.
     *
     * Two colliders will interact iff. their collision groups are compatible.
     * See the documentation of `InteractionGroups` for details on teh used bit pattern.
     *
     * @param groups - The collision groups used for the collider being built.
     */
    public setCollisionGroups(groups: InteractionGroups): ColliderDesc {
        this.collisionGroups = groups;
        return this
    }

    /**
     * Sets the solver groups used by this collider.
     *
     * Forces between two colliders in contact will be computed iff their solver
     * groups are compatible.
     * See the documentation of `InteractionGroups` for details on the used bit pattern.
     *
     * @param groups - The solver groups used for the collider being built.
     */
    public setSolverGroups(groups: InteractionGroups): ColliderDesc {
        this.solverGroups = groups;
        return this
    }
}