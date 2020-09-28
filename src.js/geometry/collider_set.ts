import {RawColliderSet, RawRigidBodySet} from "../rapier"
import {Vector, Rotation} from '../math';
import {Collider, ColliderDesc} from '../geometry/collider'
import {RigidBody} from "../dynamics/rigid_body";

export class ColliderSet {
    private RAPIER: any;
    raw: RawColliderSet;
    private rawBodies: RawRigidBodySet;

    public free() {
        this.raw.free();
    }

    constructor(RAPIER: any) {
        this.RAPIER = RAPIER;
        this.raw = new RAPIER.RawColliderSet();
    }

    public createCollider(desc: ColliderDesc, parentBody: RigidBody): number {
        let rawShape = desc._shape.intoRaw(this.RAPIER);
        let rawTra = desc._translation.intoRaw(this.RAPIER);
        let rawRot = desc._rotation.intoRaw(this.RAPIER);

        let handle = this.raw.createCollider(
            rawShape,
            rawTra,
            rawRot,
            parentBody.handle,
            this.rawBodies,
        );

        rawShape.free();
        rawTra.free();
        rawRot.free();

        return handle;
    }

    public get(handle: number): Collider {
        if (this.raw.isHandleValid(handle)) {
            return new Collider(this.RAPIER, this.raw, this.rawBodies, handle);
        } else {
            return null;
        }
    }


    public forEachCollider(f: (Collider) => void) {
        this.forEachCollider((handle) => {
            f(new Collider(this.RAPIER, this.raw, this.rawBodies, handle))
        })
    }

    public forEachColliderHandle(f: (number) => void) {
        this.raw.forEachColliderHandle(f)
    }
}
