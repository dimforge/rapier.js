import { Vector, VectorOps } from "../math";
import { RawRayColliderIntersection, RawRayColliderToi, RawRayIntersection } from "../raw";
import { ColliderHandle } from "./collider";
import { FeatureType } from "./feature";

/**
 * A ray. This is a directed half-line.
 */
export class Ray {
    /**
     * The starting point of the ray.
     */
    public origin: Vector
    /**
     * The direction of propagation of the ray.
     */
    public dir: Vector

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

    public pointAt(t: number): Vector {
        return {
            x: this.origin.x + this.dir.x * t,
            y: this.origin.y + this.dir.y * t,
            // #if DIM3
            z: this.origin.z + this.dir.z * t,
            // #endif
        }
    };
}


/**
 * The intersection between a ray and a collider.
 */
export class RayIntersection {
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

    featureType = FeatureType.Unknown;
    
    featureId: number | undefined = undefined;

    constructor(toi: number, normal: Vector, featureType?: FeatureType, featureId?: number) {
        this.toi = toi;
        this.normal = normal;
        if (featureId !== undefined)
            this.featureId = featureId;
        if (featureType !== undefined)
            this.featureType = featureType;
    }

    public static fromRaw(raw: RawRayIntersection): RayIntersection {
        if (!raw)
            return null;

        const result = new RayIntersection(
            raw.toi(),
            VectorOps.fromRaw(raw.normal()),
            raw.featureType(),
            raw.featureId()
        );
        raw.free();
        return result;
    }
}

/**
 * The intersection between a ray and a collider (includes the collider handle).
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

    featureType = FeatureType.Unknown;
    
    featureId: number | undefined = undefined;

    constructor(colliderHandle: ColliderHandle, toi: number, normal: Vector, featureType?: FeatureType, featureId?: number) {
        this.colliderHandle = colliderHandle;
        this.toi = toi;
        this.normal = normal;
        if (featureId !== undefined)
            this.featureId = featureId;
        if (featureType !== undefined)
            this.featureType = featureType;
    }

    public static fromRaw(raw: RawRayColliderIntersection): RayColliderIntersection {
        if (!raw)
            return null;

        const result = new RayColliderIntersection(
            raw.colliderHandle(),
            raw.toi(),
            VectorOps.fromRaw(raw.normal()),
            raw.featureType(),
            raw.featureId()
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