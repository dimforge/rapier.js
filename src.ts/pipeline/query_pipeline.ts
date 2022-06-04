import {RawQueryPipeline, RawRayColliderIntersection} from "../raw";
import {
    ColliderHandle,
    ColliderSet,
    InteractionGroups,
    PointColliderProjection,
    Ray,
    RayColliderIntersection,
    RayColliderToi,
    Shape,
    ShapeColliderTOI,
} from "../geometry";
import {IslandManager, RigidBodySet} from "../dynamics";
import {Rotation, RotationOps, Vector, VectorOps} from "../math";

/**
 * A pipeline for performing queries on all the colliders of a scene.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `queryPipeline.free()`
 * once you are done using it (and all the rigid-bodies it created).
 */
export class QueryPipeline {
    raw: RawQueryPipeline;

    /**
     * Release the WASM memory occupied by this query pipeline.
     */
    free() {
        this.raw.free();
        this.raw = undefined;
    }

    constructor(raw?: RawQueryPipeline) {
        this.raw = raw || new RawQueryPipeline();
    }

    /**
     * Updates the acceleration structure of the query pipeline.
     * @param bodies - The set of rigid-bodies taking part in this pipeline.
     * @param colliders - The set of colliders taking part in this pipeline.
     */
    public update(
        islands: IslandManager,
        bodies: RigidBodySet,
        colliders: ColliderSet,
    ) {
        this.raw.update(islands.raw, bodies.raw, colliders.raw);
    }

    /**
     * Find the closest intersection between a ray and a set of collider.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param ray - The ray to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the length of the ray to `ray.dir.norm() * maxToi`.
     * @param solid - If `false` then the ray will attempt to hit the boundary of a shape, even if its
     *   origin already lies inside of a shape. In other terms, `true` implies that all shapes are plain,
     *   whereas `false` implies that all shapes are hollow for this ray-cast.
     * @param groups - Used to filter the colliders that can or cannot be hit by the ray.
     * @param filter - The callback to filter out which collider will be hit.
     */
    public castRay(
        colliders: ColliderSet,
        ray: Ray,
        maxToi: number,
        solid: boolean,
        groups: InteractionGroups,
        filter?: (collider: ColliderHandle) => boolean,
    ): RayColliderToi | null {
        let rawOrig = VectorOps.intoRaw(ray.origin);
        let rawDir = VectorOps.intoRaw(ray.dir);
        let result = RayColliderToi.fromRaw(
            colliders,
            this.raw.castRay(
                colliders.raw,
                rawOrig,
                rawDir,
                maxToi,
                solid,
                groups,
                filter,
            ),
        );

        rawOrig.free();
        rawDir.free();

        return result;
    }

    /**
     * Find the closest intersection between a ray and a set of collider.
     *
     * This also computes the normal at the hit point.
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param ray - The ray to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the length of the ray to `ray.dir.norm() * maxToi`.
     * @param solid - If `false` then the ray will attempt to hit the boundary of a shape, even if its
     *   origin already lies inside of a shape. In other terms, `true` implies that all shapes are plain,
     *   whereas `false` implies that all shapes are hollow for this ray-cast.
     * @param groups - Used to filter the colliders that can or cannot be hit by the ray.
     */
    public castRayAndGetNormal(
        colliders: ColliderSet,
        ray: Ray,
        maxToi: number,
        solid: boolean,
        groups: InteractionGroups,
        filter?: (collider: ColliderHandle) => boolean,
    ): RayColliderIntersection | null {
        let rawOrig = VectorOps.intoRaw(ray.origin);
        let rawDir = VectorOps.intoRaw(ray.dir);
        let result = RayColliderIntersection.fromRaw(
            colliders,
            this.raw.castRayAndGetNormal(
                colliders.raw,
                rawOrig,
                rawDir,
                maxToi,
                solid,
                groups,
                filter,
            ),
        );

        rawOrig.free();
        rawDir.free();

        return result;
    }

    /**
     * Cast a ray and collects all the intersections between a ray and the scene.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param ray - The ray to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the length of the ray to `ray.dir.norm() * maxToi`.
     * @param solid - If `false` then the ray will attempt to hit the boundary of a shape, even if its
     *   origin already lies inside of a shape. In other terms, `true` implies that all shapes are plain,
     *   whereas `false` implies that all shapes are hollow for this ray-cast.
     * @param groups - Used to filter the colliders that can or cannot be hit by the ray.
     * @param callback - The callback called once per hit (in no particular order) between a ray and a collider.
     *   If this callback returns `false`, then the cast will stop and no further hits will be detected/reported.
     */
    public intersectionsWithRay(
        colliders: ColliderSet,
        ray: Ray,
        maxToi: number,
        solid: boolean,
        groups: InteractionGroups,
        callback: (intersect: RayColliderIntersection) => boolean,
        filter?: (collider: ColliderHandle) => boolean,
    ) {
        let rawOrig = VectorOps.intoRaw(ray.origin);
        let rawDir = VectorOps.intoRaw(ray.dir);
        let rawCallback = (rawInter: RawRayColliderIntersection) => {
            return callback(
                RayColliderIntersection.fromRaw(colliders, rawInter),
            );
        };

        this.raw.intersectionsWithRay(
            colliders.raw,
            rawOrig,
            rawDir,
            maxToi,
            solid,
            groups,
            rawCallback,
            filter,
        );

        rawOrig.free();
        rawDir.free();
    }

    /**
     * Gets the handle of up to one collider intersecting the given shape.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param shapePos - The position of the shape used for the intersection test.
     * @param shapeRot - The orientation of the shape used for the intersection test.
     * @param shape - The shape used for the intersection test.
     * @param groups - The bit groups and filter associated to the ray, in order to only
     *   hit the colliders with collision groups compatible with the ray's group.
     */
    public intersectionWithShape(
        colliders: ColliderSet,
        shapePos: Vector,
        shapeRot: Rotation,
        shape: Shape,
        groups: InteractionGroups,
        filter?: (collider: ColliderHandle) => boolean,
    ): ColliderHandle | null {
        let rawPos = VectorOps.intoRaw(shapePos);
        let rawRot = RotationOps.intoRaw(shapeRot);
        let rawShape = shape.intoRaw();
        let result = this.raw.intersectionWithShape(
            colliders.raw,
            rawPos,
            rawRot,
            rawShape,
            groups,
            filter,
        );

        rawPos.free();
        rawRot.free();
        rawShape.free();

        return result;
    }

    /**
     * Find the projection of a point on the closest collider.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param point - The point to project.
     * @param solid - If this is set to `true` then the collider shapes are considered to
     *   be plain (if the point is located inside of a plain shape, its projection is the point
     *   itself). If it is set to `false` the collider shapes are considered to be hollow
     *   (if the point is located inside of an hollow shape, it is projected on the shape's
     *   boundary).
     * @param groups - The bit groups and filter associated to the point to project, in order to only
     *   project on colliders with collision groups compatible with the ray's group.
     */
    public projectPoint(
        colliders: ColliderSet,
        point: Vector,
        solid: boolean,
        groups: InteractionGroups,
        filter?: (collider: ColliderHandle) => boolean,
    ): PointColliderProjection | null {
        let rawPoint = VectorOps.intoRaw(point);
        let result = PointColliderProjection.fromRaw(
            colliders,
            this.raw.projectPoint(
                colliders.raw,
                rawPoint,
                solid,
                groups,
                filter,
            ),
        );

        rawPoint.free();

        return result;
    }

    /**
     * Find the projection of a point on the closest collider.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param point - The point to project.
     * @param groups - The bit groups and filter associated to the point to project, in order to only
     *   project on colliders with collision groups compatible with the ray's group.
     */
    public projectPointAndGetFeature(
        colliders: ColliderSet,
        point: Vector,
        groups: InteractionGroups,
    ): PointColliderProjection | null {
        let rawPoint = VectorOps.intoRaw(point);
        let result = PointColliderProjection.fromRaw(
            colliders,
            this.raw.projectPointAndGetFeature(colliders.raw, rawPoint, groups),
        );

        rawPoint.free();

        return result;
    }

    /**
     * Find all the colliders containing the given point.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param point - The point used for the containment test.
     * @param groups - The bit groups and filter associated to the point to test, in order to only
     *   test on colliders with collision groups compatible with the ray's group.
     * @param callback - A function called with the handles of each collider with a shape
     *   containing the `point`.
     */
    public intersectionsWithPoint(
        colliders: ColliderSet,
        point: Vector,
        groups: InteractionGroups,
        callback: (handle: ColliderHandle) => boolean,
        filter?: (collider: ColliderHandle) => boolean,
    ) {
        let rawPoint = VectorOps.intoRaw(point);

        this.raw.intersectionsWithPoint(
            colliders.raw,
            rawPoint,
            groups,
            callback,
            filter,
        );

        rawPoint.free();
    }

    /**
     * Casts a shape at a constant linear velocity and retrieve the first collider it hits.
     * This is similar to ray-casting except that we are casting a whole shape instead of
     * just a point (the ray origin).
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param shapePos - The initial position of the shape to cast.
     * @param shapeRot - The initial rotation of the shape to cast.
     * @param shapeVel - The constant velocity of the shape to cast (i.e. the cast direction).
     * @param shape - The shape to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the distance traveled by the shape to `shapeVel.norm() * maxToi`.
     * @param groups - The bit groups and filter associated to the shape to cast, in order to only
     *   test on colliders with collision groups compatible with this group.
     */
    public castShape(
        colliders: ColliderSet,
        shapePos: Vector,
        shapeRot: Rotation,
        shapeVel: Vector,
        shape: Shape,
        maxToi: number,
        groups: InteractionGroups,
        filter?: (collider: ColliderHandle) => boolean,
    ): ShapeColliderTOI | null {
        let rawPos = VectorOps.intoRaw(shapePos);
        let rawRot = RotationOps.intoRaw(shapeRot);
        let rawVel = VectorOps.intoRaw(shapeVel);
        let rawShape = shape.intoRaw();

        let result = ShapeColliderTOI.fromRaw(
            colliders,
            this.raw.castShape(
                colliders.raw,
                rawPos,
                rawRot,
                rawVel,
                rawShape,
                maxToi,
                groups,
                filter,
            ),
        );

        rawPos.free();
        rawRot.free();
        rawVel.free();
        rawShape.free();

        return result;
    }

    /**
     * Retrieve all the colliders intersecting the given shape.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param shapePos - The position of the shape to test.
     * @param shapeRot - The orientation of the shape to test.
     * @param shape - The shape to test.
     * @param groups - The bit groups and filter associated to the shape to test, in order to only
     *   test on colliders with collision groups compatible with this group.
     * @param callback - A function called with the handles of each collider intersecting the `shape`.
     */
    public intersectionsWithShape(
        colliders: ColliderSet,
        shapePos: Vector,
        shapeRot: Rotation,
        shape: Shape,
        groups: InteractionGroups,
        callback: (handle: ColliderHandle) => boolean,
        filter?: (collider: ColliderHandle) => boolean,
    ) {
        let rawPos = VectorOps.intoRaw(shapePos);
        let rawRot = RotationOps.intoRaw(shapeRot);
        let rawShape = shape.intoRaw();

        this.raw.intersectionsWithShape(
            colliders.raw,
            rawPos,
            rawRot,
            rawShape,
            groups,
            callback,
            filter,
        );

        rawPos.free();
        rawRot.free();
        rawShape.free();
    }

    /**
     * Finds the handles of all the colliders with an AABB intersecting the given AABB.
     *
     * @param aabbCenter - The center of the AABB to test.
     * @param aabbHalfExtents - The half-extents of the AABB to test.
     * @param callback - The callback that will be called with the handles of all the colliders
     *                   currently intersecting the given AABB.
     */
    public collidersWithAabbIntersectingAabb(
        aabbCenter: Vector,
        aabbHalfExtents: Vector,
        callback: (handle: ColliderHandle) => boolean,
    ) {
        let rawCenter = VectorOps.intoRaw(aabbCenter);
        let rawHalfExtents = VectorOps.intoRaw(aabbHalfExtents);
        this.raw.collidersWithAabbIntersectingAabb(
            rawCenter,
            rawHalfExtents,
            callback,
        );
        rawCenter.free();
        rawHalfExtents.free();
    }
}
