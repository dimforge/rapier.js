import {RawRigidBodySet} from "../rapier"
import {Vector, Rotation} from '../math';
import {RigidBody, RigidBodyDesc, RigidBodyHandle} from '../dynamics/rigid_body'

export class RigidBodySet {
    private RAPIER: any;
    raw: RawRigidBodySet;

    public free() {
        this.raw.free();
        this.raw = undefined;
    }

    constructor(RAPIER: any, raw?: RawRigidBodySet) {
        this.RAPIER = RAPIER;
        this.raw = raw || new RAPIER.RawRigidBodySet();
    }

    public createRigidBody(desc: RigidBodyDesc): number {
        let rawTra = desc.translation.intoRaw(this.RAPIER);
        let rawRot = desc.rotation.intoRaw(this.RAPIER);
        let rawLv = desc.linvel.intoRaw(this.RAPIER);

        // #if DIM3
        let rawAv = desc.angvel.intoRaw(this.RAPIER);
        // #endif

        let handle = this.raw.createRigidBody(
            rawTra,
            rawRot,
            rawLv,
            // #if DIM2
            desc.angvel,
            // #endif
            // #if DIM3
            rawAv,
            // #endif
            desc.status,
            desc.canSleep,
        );

        rawTra.free();
        rawRot.free();
        rawLv.free();

        // #if DIM3
        rawAv.free();
        // #endif

        return handle;
    }

    public get(handle: RigidBodyHandle): RigidBody {
        if (this.raw.isHandleValid(handle)) {
            return new RigidBody(this.RAPIER, this.raw, handle);
        } else {
            return null;
        }
    }

    public forEachRigidBody(f: (body: RigidBody) => void) {
        this.forEachRigidBodyHandle((handle) => {
            f(new RigidBody(this.RAPIER, this.raw, handle))
        })
    }

    public forEachRigidBodyHandle(f: (handle: RigidBodyHandle) => void) {
        this.raw.forEachRigidBodyHandle(f)
    }

    public forEachActiveRigidBody(f: (body: RigidBody) => void) {
        this.forEachActiveRigidBodyHandle((handle) => {
            f(new RigidBody(this.RAPIER, this.raw, handle))
        })
    }

    public forEachActiveRigidBodyHandle(f: (handle: RigidBodyHandle) => void) {
        this.raw.forEachActiveRigidBodyHandle(f)
    }
}
