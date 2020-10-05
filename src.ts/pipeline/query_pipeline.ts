import {RawQueryPipeline} from "../raw";
import {ColliderSet, Ray, RayColliderIntersection} from "../geometry";
import {RigidBodySet} from "../dynamics";
import {VectorOps} from "../math";

/**
 * A pipeline for performing queries on all the colliders of a scene.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `queryPipeline.free()`
 * once you are done using it (and all the rigid-bodies it created).
 */
export class QueryPipeline {
    raw: RawQueryPipeline

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
    public update(bodies: RigidBodySet, colliders: ColliderSet) {
        this.raw.update(bodies.raw, colliders.raw);
    }

    /**
     * Find the closest intersection between a ray and a set of collider.
     *
     * @param position - The position of this shape.
     * @param ray - The ray to cast.
     * @param max_toi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the length of the ray to `ray.dir.norm() * max_toi`. Use `f32::MAX` for an unbounded ray.
     */
    public castRay(colliders: ColliderSet, ray: Ray, maxToi: number): RayColliderIntersection {
        let rawOrig = VectorOps.intoRaw(ray.origin);
        let rawDir = VectorOps.intoRaw(ray.dir);
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