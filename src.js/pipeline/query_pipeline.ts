import {RawQueryPipeline} from "../rapier";
import {ColliderSet, Ray, RayColliderIntersection} from "../geometry";
import {RigidBodySet} from "../dynamics";


export class QueryPipeline {
    RAPIER: any
    raw: RawQueryPipeline

    free() {
        this.raw.free();
    }

    constructor(RAPIER: any) {
        this.raw = new RAPIER.RawQueryPipeline();
        this.RAPIER = RAPIER;
    }

    public update(bodies: RigidBodySet, colliders: ColliderSet) {
        this.raw.update(bodies.raw, colliders.raw);
    }

    public castRay(colliders: ColliderSet, ray: Ray, maxToi: number): RayColliderIntersection {
        let rawOrig = ray.origin.intoRaw(this.RAPIER);
        let rawDir = ray.dir.intoRaw(this.RAPIER);
        let result = RayColliderIntersection.fromRaw(this.raw.castRay(
            colliders.raw,
            rawOrig,
            rawDir,
            maxToi
        ));

        rawOrig.free();
        rawDir.free();

        return result;
    }
}