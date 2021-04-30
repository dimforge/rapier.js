import {RawRigidBodySet} from "../raw"
import {VectorOps, RotationOps} from '../math';
import {RigidBody, RigidBodyDesc, RigidBodyHandle} from './rigid_body'
import {ColliderSet} from "../geometry";
import {JointSet} from "./joint_set";
import {IslandManager} from "./island_manager";

/**
 * A set of rigid bodies that can be handled by a physics pipeline.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `jointSet.free()`
 * once you are done using it (and all the rigid-bodies it created).
 */
export class RigidBodySet {
    raw: RawRigidBodySet;

    /**
     * Release the WASM memory occupied by this rigid-body set.
     */
    public free() {
        this.raw.free();
        this.raw = undefined;
    }

    constructor(raw?: RawRigidBodySet) {
        this.raw = raw || new RawRigidBodySet();
    }

    /**
     * Creates a new rigid-body and return its integer handle.
     *
     * @param desc - The description of the rigid-body to create.
     */
    public createRigidBody(desc: RigidBodyDesc): RigidBodyHandle {
        let rawTra = VectorOps.intoRaw(desc.translation);
        let rawRot = RotationOps.intoRaw(desc.rotation);
        let rawLv = VectorOps.intoRaw(desc.linvel);
        let rawCom = VectorOps.intoRaw(desc.centerOfMass);

        // #if DIM3
        let rawAv = VectorOps.intoRaw(desc.angvel);
        let rawPrincipalInertia = VectorOps.intoRaw(desc.principalAngularInertia);
        let rawInertiaFrame = RotationOps.intoRaw(desc.angularInertiaLocalFrame);
        // #endif

        let handle = this.raw.createRigidBody(
            rawTra,
            rawRot,
            desc.gravityScale,
            desc.mass,
            desc.translationsEnabled,
            rawCom,
            rawLv,
            // #if DIM2
            desc.angvel,
            desc.principalAngularInertia,
            desc.rotationsEnabled,
            // #endif
            // #if DIM3
            rawAv,
            rawPrincipalInertia,
            rawInertiaFrame,
            desc.rotationsEnabledX,
            desc.rotationsEnabledY,
            desc.rotationsEnabledZ,
            // #endif
            desc.linearDamping,
            desc.angularDamping,
            desc.status,
            desc.canSleep,
            desc.ccdEnabled,
        );

        rawTra.free();
        rawRot.free();
        rawLv.free();
        rawCom.free();

        // #if DIM3
        rawAv.free();
        rawPrincipalInertia.free();
        rawInertiaFrame.free();
        // #endif

        return handle;
    }

    /**
     * Removes a rigid-body from this set.
     *
     * This will also remove all the colliders and joints attached to the rigid-body.
     *
     * @param handle - The integer handle of the rigid-body to remove.
     * @param colliders - The set of colliders that may contain colliders attached to the removed rigid-body.
     * @param joints - The set of joints that may contain joints attached to the removed rigid-body.
     */
    public remove(handle: RigidBodyHandle, islands: IslandManager, colliders: ColliderSet, joints: JointSet) {
        this.raw.remove(handle, islands.raw, colliders.raw, joints.raw)
    }

    /**
     * The number of rigid-bodies on this set.
     */
    public len(): number {
        return this.raw.len();
    }

    /**
     * Does this set contain a rigid-body with the given handle?
     *
     * @param handle - The rigid-body handle to check.
     */
    public contains(handle: RigidBodyHandle): boolean {
        return this.raw.contains(handle);
    }

    /**
     * Gets the rigid-body with the given handle.
     *
     * @param handle - The handle of the rigid-body to retrieve.
     */
    public get(handle: RigidBodyHandle): RigidBody {
        if (this.raw.contains(handle)) {
            return new RigidBody(this.raw, handle);
        } else {
            return null;
        }
    }

    /**
     * Applies the given closure to each rigid-body contained by this set.
     *
     * @param f - The closure to apply.
     */
    public forEachRigidBody(f: (body: RigidBody) => void) {
        this.forEachRigidBodyHandle((handle) => {
            f(new RigidBody(this.raw, handle))
        })
    }

    /**
     * Applies the given closure to the handle of each rigid-body contained by this set.
     *
     * @param f - The closure to apply.
     */
    public forEachRigidBodyHandle(f: (handle: RigidBodyHandle) => void) {
        this.raw.forEachRigidBodyHandle(f)
    }

    /**
     * Applies the given closure to each active rigid-bodies contained by this set.
     *
     * A rigid-body is active if it is not sleeping, i.e., if it moved recently.
     *
     * @param f - The closure to apply.
     */
    public forEachActiveRigidBody(islands: IslandManager, f: (body: RigidBody) => void) {
        islands.forEachActiveRigidBodyHandle((handle) => {
            f(new RigidBody(this.raw, handle))
        })
    }
}
