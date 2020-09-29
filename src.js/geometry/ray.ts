import {Vector} from "../math";
import {RawRayColliderIntersection} from "../rapier";
import {ColliderHandle} from "./collider";


export class Ray {
    origin: Vector
    dir: Vector

    constructor(origin: Vector, dir: Vector) {
        this.origin = origin;
        this.dir = dir;
    }
}

export class RayColliderIntersection {
    colliderHandle: ColliderHandle
    toi: number
    normal: Vector

    constructor(colliderHandle: ColliderHandle, toi: number, normal: Vector) {
        this.colliderHandle = colliderHandle;
        this.toi = toi;
        this.normal = normal;
    }

    public static fromRaw(raw: RawRayColliderIntersection): RayColliderIntersection {
        if (!raw)
            return null;

        const result = new RayColliderIntersection(
            raw.colliderHandle(),
            raw.toi(),
            Vector.fromRaw(raw.normal())
        );
        raw.free();
        return result;
    }
}