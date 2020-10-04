import {RawColliderSet, RawRigidBodySet} from "@dimforge/rapier-core2d"
import {Vector, Rotation} from '../math';
import {Collider, ColliderDesc, ColliderHandle} from './index'
import {RigidBody, RigidBodyHandle} from "../dynamics";
import {RigidBodySet} from "../dynamics";

/**
 * A set of rigid bodies that can be handled by a physics pipeline.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `colliderSet.free()`
 * once you are done using it (and all the rigid-bodies it created).
 */
export class ColliderSet {
    private RAPIER: any;
    raw: RawColliderSet;

    /**
     * Release the WASM memory occupied by this collider set.
     */
    public free() {
        this.raw.free();
        this.raw = undefined;
    }

    constructor(RAPIER: any, raw?: RawColliderSet) {
        this.RAPIER = RAPIER;
        this.raw = raw || new RAPIER.RawColliderSet();
    }

    /**
     * Creates a new collider and return its integer handle.
     *
     * @param bodies - The set of bodies where the collider's parent can be found.
     * @param desc - The collider's description.
     * @param parentHandle - The inteer handle of the rigid-body this collider is attached to.
     */
    public createCollider(bodies: RigidBodySet, desc: ColliderDesc, parentHandle: RigidBodyHandle): ColliderHandle {
        let rawShape = desc.shape.intoRaw(this.RAPIER);
        let rawTra = Vector.intoRaw(this.RAPIER, desc.translation);
        let rawRot = desc.rotation.intoRaw(this.RAPIER);

        let handle = this.raw.createCollider(
            rawShape,
            rawTra,
            rawRot,
            parentHandle,
            bodies.raw,
        );

        rawShape.free();
        rawTra.free();
        rawRot.free();

        return handle;
    }

    /**
     * Gets the rigid-body with the given handle.
     *
     * @param handle - The handle of the rigid-body to retrieve.
     */
    public get(handle: ColliderHandle): Collider {
        if (this.raw.contains(handle)) {
            return new Collider(this.RAPIER, this.raw, handle);
        } else {
            return null;
        }
    }

    /**
     * The number of colliders on this set.
     */
    public len(): number {
        return this.raw.len();
    }

    /**
     * Does this set contain a collider with the given handle?
     *
     * @param handle - The collider handle to check.
     */
    public contains(handle: ColliderHandle): boolean {
        return this.raw.contains(handle);
    }

    /**
     * Applies the given closure to each collider contained by this set.
     *
     * @param f - The closure to apply.
     */
    public forEachCollider(f: (collider: Collider) => void) {
        this.forEachColliderHandle((handle) => {
            f(new Collider(this.RAPIER, this.raw, handle))
        })
    }

    /**
     * Applies the given closure to the handles of each collider contained by this set.
     *
     * @param f - The closure to apply.
     */
    public forEachColliderHandle(f: (handle: ColliderHandle) => void) {
        this.raw.forEachColliderHandle(f)
    }
}
