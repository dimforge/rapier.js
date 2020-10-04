import {RawColliderSet} from "../raw"
import {Rotation, Vector} from '../math';
import {Cuboid, Ball, ShapeType} from './index';
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
        return Vector.fromRaw(this.rawSet.coTranslation(this.handle));
    }

    /**
     * The world-space orientation of this rigid-body.
     */
    public rotation(): Rotation {
        return Rotation.fromRaw(this.rawSet.coRotation(this.handle));
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
     * The half-extents of this collider if it is has a cuboid shape.
     */
    public halfExtents(): Vector {
        return Vector.fromRaw(this.rawSet.coHalfExtents(this.handle));
    }

    /**
     * The radius of this collider if it is has a ball shape.
     */
    public radius(): number {
        return this.rawSet.coRadius(this.handle);
    }

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
}


export class ColliderDesc {
    shape: Ball | Cuboid;
    density?: number;
    friction: number;
    restitution: number;
    rotation: Rotation;
    translation: Vector;
    isSensor: boolean;

    /**
     * Initializes a collider descriptor from the collision shape.
     *
     * @param shape - The shape of the collider being built.
     */
    constructor(shape: Ball | Cuboid) {
        this.shape = shape;
        this.density = null;
        this.friction = 0.5;
        this.restitution = 0.0;
        this.rotation = Rotation.identity();
        this.translation = Vector.zeros();
        this.isSensor = false;
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
}