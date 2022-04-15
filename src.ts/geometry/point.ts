import { ColliderHandle } from "./collider";
import { Vector, VectorOps } from "../math";
import { RawPointColliderProjection, RawPointProjection } from "../raw";
import { FeatureType } from "./feature";


/**
 * The projection of a point on a collider.
 */
export class PointProjection {
    /**
     * The projection of the point on the collider.
     */
    point: Vector
    /**
     * Is the point inside of the collider?
     */
    isInside: boolean

    constructor(point: Vector, isInside: boolean) {
        this.point = point;
        this.isInside = isInside;
    }

    public static fromRaw(raw: RawPointProjection): PointProjection {
        if (!raw)
            return null;

        const result = new PointProjection(
            VectorOps.fromRaw(raw.point()),
            raw.isInside()
        );
        raw.free();
        return result;
    }
}

/**
 * The projection of a point on a collider (includes the collider handle).
 */
export class PointColliderProjection {
    /**
     * The handle of the collider hit by the ray.
     */
    colliderHandle: ColliderHandle
    /**
     * The projection of the point on the collider.
     */
    point: Vector
    /**
     * Is the point inside of the collider?
     */
    isInside: boolean

    featureType = FeatureType.Unknown;
    
    featureId: number | undefined = undefined;

    constructor(colliderHandle: ColliderHandle, point: Vector, isInside: boolean, featureType?: FeatureType, featureId?: number) {
        this.colliderHandle = colliderHandle;
        this.point = point;
        this.isInside = isInside;
        if (featureId !== undefined)
            this.featureId = featureId;
        if (featureType !== undefined)
            this.featureType = featureType;
    }

    public static fromRaw(raw: RawPointColliderProjection): PointColliderProjection {
        if (!raw)
            return null;

        const result = new PointColliderProjection(
            raw.colliderHandle(),
            VectorOps.fromRaw(raw.point()),
            raw.isInside(),
            raw.featureType(),
            raw.featureId()
        );
        raw.free();
        return result;
    }
}