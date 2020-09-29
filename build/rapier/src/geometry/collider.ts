import {RawColliderSet} from "@dimforge/rapier-core2d"
import {Rotation, Vector} from '../math';
import {Cuboid, Ball, ShapeType} from './index';
import {RigidBody, RigidBodyHandle} from '../dynamics';

export type ColliderHandle = number;

export class Collider {
    private RAPIER: any;
    private rawSet: RawColliderSet; // The Collider won't need to free this.
    readonly handle: ColliderHandle;

    constructor(RAPIER: any, rawSet: RawColliderSet, handle: ColliderHandle) {
        this.RAPIER = RAPIER;
        this.rawSet = rawSet;
        this.handle = handle;
    }

    /// The world-space translation of this rigid-body.
    public translation(): Vector {
        return Vector.fromRaw(this.rawSet.coTranslation(this.handle));
    }

    /// The world-space orientation of this rigid-body.
    public rotation(): Rotation {
        return Rotation.fromRaw(this.rawSet.coRotation(this.handle));
    }

    /// Is this collider a sensor?
    public isSensor(): boolean {
        return this.rawSet.coIsSensor(this.handle);
    }

    /// The type of the shape of this collider.
    public shapeType(): ShapeType {
        return this.rawSet.coShapeType(this.handle);
    }

    /// The half-extents of this collider if it is has a cuboid shape.
    public halfExtents(): Vector {
        return Vector.fromRaw(this.rawSet.coHalfExtents(this.handle));
    }

    /// The radius of this collider if it is has a ball shape.
    public radius(): number {
        return this.rawSet.coRadius(this.handle);
    }

    /// The unique integer identifier of the rigid-body this collider is attached to.
    public parent(): RigidBodyHandle {
        return this.rawSet.coParent(this.handle);
    }

    /// The friction coefficient of this collider.
    public friction(): number {
        return this.rawSet.coFriction(this.handle);
    }

    /// The density of this collider.
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

    constructor(shape: Ball | Cuboid) {
        this.shape = shape;
        this.density = null;
        this.friction = 0.5;
        this.restitution = 0.0;
        this.rotation = Rotation.identity();
        this.translation = Vector.zeros();
        this.isSensor = false;
    }

    public static ball(radius: number): ColliderDesc {
        const shape = new Ball(radius);
        return new ColliderDesc(shape);
    }

    // #if DIM2
    public static cuboid(hx: number, hy: number): ColliderDesc {
        const shape = new Cuboid(hx, hy);
        return new ColliderDesc(shape);
    }

    // #endif

    // #if DIM3
    public static cuboid(hx: number, hy: number, hz: number): ColliderDesc {
        const shape = new Cuboid(hx, hy, hz);
        return new ColliderDesc(shape);
    }

    // #endif

    public withTranslation(tra: Vector): ColliderDesc {
        this.translation = tra;
        return this;
    }

    public withRotation(rot: Rotation): ColliderDesc {
        this.rotation = rot;
        return this;
    }

    public withIsSensor(is: boolean): ColliderDesc {
        this.isSensor = is;
        return this;
    }

    public withDensity(density: number): ColliderDesc {
        this.density = density;
        return this;
    }

    public withRestitution(restitution: number): ColliderDesc {
        this.restitution = restitution;
        return this;
    }

    public withFriction(friction: number): ColliderDesc {
        this.friction = friction;
        return this;
    }
}