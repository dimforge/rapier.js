import {Vector, Rotation} from '../math';
import {Collider, ColliderDesc} from '../geometry/collider'

export class ColliderSet {
    private RAPIER: any;
    private raw: any;

    constructor(RAPIER: any) {
        this.RAPIER = RAPIER;
        this.raw = new RAPIER.ColliderSet();
    }

    public createCollider(desc: ColliderDesc): Collider {
        let handle = this.raw.createCollider(
            desc._translation.x,
            desc._translation.y,
            desc._translation.z,
            desc._rotation.x,
            desc._rotation.y,
            desc._rotation.z,
            desc._rotation.w,
            desc._linvel.x,
            desc._linvel.y,
            desc._linvel.z,
            desc._angvel.x,
            desc._angvel.y,
            desc._angvel.z,
            desc._status,
            desc._canSleep,
        );

        return new Collider(this.RAPIER, this.raw, handle);
    }
}
