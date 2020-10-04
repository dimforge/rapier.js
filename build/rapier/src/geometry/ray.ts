import {Vector, VectorInterface} from "../math";
import {RawRayColliderIntersection} from "@dimforge/rapier-core2d";
import {ColliderHandle} from "./collider";


export class Ray {
    origin: VectorInterface
    dir: VectorInterface

    constructor(origin: VectorInterface, dir: VectorInterface) {
        this.origin = origin;
        this.dir = dir;
    }
}

export class RayColliderIntersection {
    colliderHandle: ColliderHandle
    toi: number
    normal: VectorInterface

    constructor(colliderHandle: ColliderHandle, toi: number, normal: VectorInterface) {
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