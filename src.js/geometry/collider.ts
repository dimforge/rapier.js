import { RawColliderSet, RawRigidBodySet } from "../rapier"
import {Rotation, Vector} from '../math';
import {Cuboid, Ball} from '../geometry/shape';
import {RigidBody} from '../dynamics/rigid_body';

export class Collider {
    private RAPIER: any;
    private rawSet: RawColliderSet; // The Collider won't need to free this.
    private rawBodySet: RawRigidBodySet; // The Collider won't need to free this.
    readonly handle: number;

    constructor(RAPIER: any, rawSet: RawColliderSet, rawBodySet: RawRigidBodySet, handle: number) {
        this.RAPIER = RAPIER;
        this.rawSet = rawSet;
        this.rawBodySet = rawBodySet;
        this.handle = handle;
    }

    /// The world-space translation of this rigid-body.
    public translation(): Vector {
        let res = this.RAPIER.RawColliderModel.translation(this.rawSet, this.handle);
        return Vector.fromRaw(res);
    }

    /// The world-space orientation of this rigid-body.
    public rotation(): Rotation {
        let res = this.RAPIER.RawColliderModel.rotation(this.rawSet, this.handle);
        return Rotation.fromRaw(res);
    }

    /// Is this collider a sensor?
    public isSensor(): boolean {
        return this.RAPIER.RawColliderModel.isSensor(this.rawSet, this.handle);
    }


//     /// The type of the shape of this collider.
//     public shapeType(&self): ShapeType {
//         self.map(|co| match co.shape() {
//             Shape::Ball(_) => ShapeType::Ball,
//             Shape::Polygon(_) => ShapeType::Polygon,
//             Shape::Cuboid(_) => ShapeType::Cuboid,
//             Shape::Capsule(_) => ShapeType::Capsule,
//             Shape::Triangle(_) => ShapeType::Triangle,
//             Shape::Trimesh(_) => ShapeType::Trimesh,
//             Shape::HeightField(_) => ShapeType::HeightField,
//         })
//     }

    /// The half-extents of this collider if it is has a cuboid shape.
    public halfExtents(): Vector | undefined {
        let res = this.RAPIER.RawColliderModel.halfExtents(this.rawSet, this.handle);

        if (!res)
            return undefined;
        return Vector.fromRaw(res);

    }

    /// The radius of this collider if it is has a ball shape.
    public radius(): number {
        return this.RAPIER.RawColliderModel.radius(this.rawSet, this.handle);
    }

    /// The rigid-body this collider is attached to.
    public parent(): RigidBody {
        let parent = this.RAPIER.RawColliderModel.parent(this.rawSet, this.handle);
        return new RigidBody(this.RAPIER, this.rawBodySet, parent);
    }

    /// The unique integer identifier of the rigid-body this collider is attached to.
    public parentHandle(): number {
        return this.RAPIER.RawColliderModel.parent(this.rawSet, this.handle);
    }

    /// The friction coefficient of this collider.
    public friction(): number {
        return this.RAPIER.RawColliderModel.friction(this.rawSet, this.handle);
    }

    /// The density of this collider.
    public density(): number {
        return this.RAPIER.RawColliderModel.density(this.rawSet, this.handle);
    }
}


export class ColliderDesc {
    _shape: Ball | Cuboid;
    _density?: number;
    _friction: number;
    _restitution: number;
    _rotation: Rotation;
    _translation: Vector;
    _isSensor: boolean;

    constructor(shape: Ball | Cuboid) {
        this._shape = shape;
        this._density = null;
        this._friction = 0.5;
        this._restitution = 0.0;
        this._rotation = Rotation.identity();
        this._translation = Vector.zeros();
        this._isSensor = false;
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

    public translation(tra: Vector): ColliderDesc {
        this._translation = tra;
        return this;
    }

    public rotation(rot: Rotation): ColliderDesc {
        this._rotation = rot;
        return this;
    }

    public isSensor(is: boolean): ColliderDesc {
        this._isSensor = is;
        return this;
    }
}