import {RawColliderSet, RawRigidBodySet} from "../raw"
import {RotationOps, VectorOps} from '../math';
import {Collider, ColliderDesc, ColliderHandle} from './index'
import {IslandManager, RigidBody, RigidBodyHandle} from "../dynamics";
import {RigidBodySet} from "../dynamics";

/**
 * A set of rigid bodies that can be handled by a physics pipeline.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `colliderSet.free()`
 * once you are done using it (and all the rigid-bodies it created).
 */
export class ColliderSet {
    raw: RawColliderSet;

    /**
     * Release the WASM memory occupied by this collider set.
     */
    public free() {
        this.raw.free();
        this.raw = undefined;
    }

    constructor(raw?: RawColliderSet) {
        this.raw = raw || new RawColliderSet();
    }

    /**
     * Creates a new collider and return its integer handle.
     *
     * @param bodies - The set of bodies where the collider's parent can be found.
     * @param desc - The collider's description.
     * @param parentHandle - The inteer handle of the rigid-body this collider is attached to.
     */
    public createCollider(bodies: RigidBodySet, desc: ColliderDesc, parentHandle: RigidBodyHandle): ColliderHandle {
        if (isNaN(parentHandle))
            throw Error("Cannot create a collider with a parent rigid-body handle that is not a number.");

        let rawShape = desc.shape.intoRaw();
        let rawTra = VectorOps.intoRaw(desc.translation);
        let rawRot = RotationOps.intoRaw(desc.rotation);

        let handle = this.raw.createCollider(
            rawShape,
            rawTra,
            rawRot,
            desc.density,
            desc.friction,
            desc.restitution,
            desc.frictionCombineRule,
            desc.restitutionCombineRule,
            desc.isSensor,
            desc.collisionGroups,
            desc.solverGroups,
            parentHandle,
            bodies.raw,
        );

        rawShape.free();
        rawTra.free();
        rawRot.free();

        return handle;
    }

    /**
     * Remove a collider from this set.
     *
     * @param handle - The integer handle of the collider to remove.
     * @param bodies - The set of rigid-body containing the rigid-body the collider is attached to.
     * @param wakeUp - If `true`, the rigid-body the removed collider is attached to will be woken-up automatically.
     */
    public remove(handle: ColliderHandle, islands: IslandManager, bodies: RigidBodySet, wakeUp: boolean) {
        this.raw.remove(handle, islands.raw, bodies.raw, wakeUp);
    }

    /**
     * Gets the rigid-body with the given handle.
     *
     * @param handle - The handle of the rigid-body to retrieve.
     */
    public get(handle: ColliderHandle): Collider {
        if (this.raw.contains(handle)) {
            return new Collider(this.raw, handle);
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
            f(new Collider(this.raw, handle))
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
