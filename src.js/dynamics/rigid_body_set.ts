import {Vector, Rotation} from '../math';
import {RigidBody, RigidBodyDesc} from '../dynamics/rigid_body'

export class RigidBodySet {
    private RAPIER: any;
    private raw: any;

    constructor(RAPIER: any) {
        this.RAPIER = RAPIER;
        this.raw = new RAPIER.RigidBodySet();
    }

    public createRigidBody(desc: RigidBodyDesc): RigidBody {
        let rawTra = desc._translation.intoRaw(this.RAPIER);
        let rawRot = desc._rotation.intoRaw(this.RAPIER);
        let rawLv = desc._linvel.intoRaw(this.RAPIER);
        let rawAv = desc._angvel.intoRaw(this.RAPIER);

        let handle = this.raw.createRigidBody(
            desc._translation.intoRaw(this.RAPIER),
            desc._rotation.intoRaw(this.RAPIER),
            desc._linvel.intoRaw(this.RAPIER),
            desc._angvel.intoRaw(this.RAPIER),
            desc._status,
            desc._canSleep,
        );

        rawTra.free();
        rawRot.free();
        rawLv.free();
        rawAv.free();

        return new RigidBody(this.RAPIER, this.raw, handle);
    }
}
