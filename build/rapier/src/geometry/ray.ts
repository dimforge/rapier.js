import {Vector, VectorInterface} from "../math";
import {RawRayColliderIntersection} from "@dimforge/rapier-core2d";
import {ColliderHandle} from "./collider";

/**
 * A ray. This is a directed half-line.
 */
export class Ray {
    /**
     * The starting point of the ray.
     */
    origin: VectorInterface
    /**
     * The direction of propagation of the ray.
     */
    dir: VectorInterface

    /**
     * Builds a ray from its origin and direction.
     *
     * @param origin - The ray's starting point.
     * @param dir - The ray's direction of propagation.
     */
    constructor(origin: VectorInterface, dir: VectorInterface) {
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