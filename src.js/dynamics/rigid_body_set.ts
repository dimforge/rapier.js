import {RawRigidBodySet} from "../rapier"
import {Vector, Rotation} from '../math';
import {RigidBody, RigidBodyDesc} from '../dynamics/rigid_body'

export class RigidBodySet {
    private RAPIER: any;
    raw: RawRigidBodySet;

    public free() {
        this.raw.free();
    }

    constructor(RAPIER: any) {
        this.RAPIER = RAPIER;
        this.raw = new RAPIER.RawRigidBodySet();
    }

    public createRigidBody(desc: RigidBodyDesc): number {
        let rawTra = desc._translation.intoRaw(this.RAPIER);
        let rawRot = desc._rotation.intoRaw(this.RAPIER);
        let rawLv = desc._linvel.intoRaw(this.RAPIER);

        // #if DIM3
        let rawAv = desc._angvel.intoRaw(this.RAPIER);
        // #endif

        let handle = this.raw.createRigidBody(
            rawTra,
            rawRot,
            rawLv,
            // #if DIM2
            desc._angvel,
            // #endif
            // #if DIM3
            rawAv,
            // #endif
            desc._status,
            desc._canSleep,
        );

        rawTra.free();
        rawRot.free();
        rawLv.free();

        // #if DIM3
        rawAv.free();
        // #endif

        return handle;
    }

    public get(handle: number): RigidBody {
        if (this.raw.isHandleValid(handle)) {
            return new RigidBody(this.RAPIER, this.raw, handle);
        } else {
            return null;
        }
    }

    public forEachRigidBody(f: (RigidBody) => void) {
        this.forEachRigidBody((handle) => {
            f(new RigidBody(this.RAPIER, this.raw, handle))
        })
    }

    public forEachRigidBodyHandle(f: (number) => void) {
        this.raw.forEachRigidBodyHandle(f)
    }

    public forEachActiveRigidBody(f: (RigidBody) => void) {
        this.forEachActiveRigidBody((handle) => {
            f(new RigidBody(this.RAPIER, this.raw, handle))
        })
    }

    public forEachActiveRigidBodyHandle(f: (number) => void) {
        this.raw.forEachActiveRigidBodyHandle(f)
    }
}
