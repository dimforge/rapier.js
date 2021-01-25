import {Vector, VectorOps} from "../math";
import {RawRayColliderIntersection, RawRayColliderToi} from "../raw";
import {ColliderHandle} from "./collider";

/**
 * A ray. This is a directed half-line.
 */
export class Ray {
    /**
     * The starting point of the ray.
     */
    origin: Vector
    /**
     * The direction of propagation of the ray.
     */
    dir: Vector

    /**
     * Builds a ray from its origin and direction.
     *
     * @param origin - The ray's starting point.
     * @param dir - The ray's direction of propagation.
     */
    constructor(origin: Vector, dir: Vector) {
        this.origin = origin;
        this.dir = dir;
    }
}

/**
 * The intersection between a ray and a collider.
 */
export class RayColliderIntersection {
    /**
     * The handle of the collider hit by the ray.
     */
    colliderHandle: ColliderHandle
    /**
     * The time-of-impact of the ray with the collider.
     *
     * The hit point is obtained from the ray's origin and direction: `origin + dir * toi`.
     */
    toi: number
    /**
     * The normal of the collider at the hit point.
     */
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
            VectorOps.fromRaw(raw.normal())
        );
        raw.free();
        return result;
    }
}

/**
 * The time of impact between a ray and a collider.
 */
export class RayColliderToi {
    /**
     * The handle of the collider hit by the ray.
     */
    colliderHandle: ColliderHandle
    /**
     * The time-of-impact of the ray with the collider.
     *
     * The hit point is obtained from the ray's origin and direction: `origin + dir * toi`.
     */
    toi: number

    constructor(colliderHandle: ColliderHandle, toi: number) {
        this.colliderHandle = colliderHandle;
        this.toi = toi;
    }

    public static fromRaw(raw: RawRayColliderToi): RayColliderToi {
        if (!raw)
            return null;

        const result = new RayColliderToi(
            raw.colliderHandle(),
            raw.toi(),
        );
        raw.free();
        return result;
    }
}