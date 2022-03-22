import { RawRigidBodySet } from "../raw"
import { VectorOps, RotationOps } from '../math';
import { RigidBody, RigidBodyDesc, RigidBodyHandle } from './rigid_body'
import { ColliderSet } from "../geometry";
import { ImpulseJointSet } from "./impulse_joint_set";
import { MultibodyJointSet } from "./multibody_joint_set";
import { IslandManager } from "./island_manager";

/**
 * A set of rigid bodies that can be handled by a physics pipeline.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `rigidBodySet.free()`
 * once you are done using it (and all the rigid-bodies it created).
 */
export class RigidBodySet {
    raw: RawRigidBodySet;
    private map: Map<RigidBodyHandle, RigidBody>;

    /**
     * Release the WASM memory occupied by this rigid-body set.
     */
    public free() {
        this.raw.free();
        this.raw = undefined;
        this.map.clear();
        this.map = undefined;
    }

    constructor(raw?: RawRigidBodySet) {
        this.raw = raw || new RawRigidBodySet();
        this.map = new Map();
        // deserialize
        if (raw) {
            raw.forEachRigidBodyHandle((handle: RigidBodyHandle) => {
                this.map.set(handle, new RigidBody(raw, handle));
            });
        }
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
            rawCom,
            rawLv,
            // #if DIM2
            desc.angvel,
            desc.principalAngularInertia,
            desc.translationsEnabledX,
            desc.translationsEnabledY,
            desc.rotationsEnabled,
            // #endif
            // #if DIM3
            rawAv,
            rawPrincipalInertia,
            rawInertiaFrame,
            desc.translationsEnabledX,
            desc.translationsEnabledY,
            desc.translationsEnabledZ,
            desc.rotationsEnabledX,
            desc.rotationsEnabledY,
            desc.rotationsEnabledZ,
            // #endif
            desc.linearDamping,
            desc.angularDamping,
            desc.status,
            desc.canSleep,
            desc.ccdEnabled,
            desc.dominanceGroup,
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

        const body = new RigidBody(this.raw, handle);
        body.userData = desc.userData;
        
        this.map.set(handle, body);

        return handle;
    }

    /**
     * Removes a rigid-body from this set.
     *
     * This will also remove all the colliders and joints attached to the rigid-body.
     *
     * @param handle - The integer handle of the rigid-body to remove.
     * @param colliders - The set of colliders that may contain colliders attached to the removed rigid-body.
     * @param impulseJoints - The set of impulse joints that may contain joints attached to the removed rigid-body.
     * @param multibodyJoints - The set of multibody joints that may contain joints attached to the removed rigid-body.
     */
    public remove(handle: RigidBodyHandle, islands: IslandManager, colliders: ColliderSet, impulseJoints: ImpulseJointSet, multibodyJoints: MultibodyJointSet) {
        // remove owned colliders
        while (this.raw.rbNumColliders(handle) > 0) {
            const colliderHandle = this.raw.rbCollider(handle, 0);  // do not use forEach to remove because the length of the list in the Rust will be changed.
            colliders.remove(colliderHandle, islands, this, false);
        }

        this.raw.remove(handle, islands.raw, colliders.raw, impulseJoints.raw, multibodyJoints.raw);
        this.map.delete(handle);
    }

    /**
     * The number of rigid-bodies on this set.
     */
    public len(): number {
        return this.map.size;
    }

    /**
     * Does this set contain a rigid-body with the given handle?
     *
     * @param handle - The rigid-body handle to check.
     */
    public contains(handle: RigidBodyHandle): boolean {
        return this.map.has(handle);
    }

    /**
     * Gets the rigid-body with the given handle.
     *
     * @param handle - The handle of the rigid-body to retrieve.
     */
    public get(handle: RigidBodyHandle): RigidBody | undefined {
        return this.map.get(handle);
    }

    /**
     * Applies the given closure to each rigid-body contained by this set.
     *
     * @param f - The closure to apply.
     */
    public forEachRigidBody(f: (body: RigidBody) => void) {
        for (const body of this.map.values())
            f(body);
    }

    /**
     * Applies the given closure to the handle of each rigid-body contained by this set.
     *
     * @param f - The closure to apply.
     */
    public forEachRigidBodyHandle(f: (handle: RigidBodyHandle) => void) {
        for (const key of this.map.keys())
            f(key);
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
            f(this.get(handle));
        });
    }

    /**
     * Gets all handles of the rigid-bodies in the list.
     *
     * @returns rigid-body handle list.
     */
    public getAllHandles(): RigidBodyHandle[] {
        return Array.from(this.map.keys());
    }

    /**
     * Gets all rigid-bodies in the list.
     *
     * @returns rigid-bodies list.
     */
    public getAllBodies(): RigidBody[] {
        return Array.from(this.map.values());
    }
}
