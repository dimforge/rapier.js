import {RawImpulseJointSet} from "../raw"
import {RigidBodySet} from "./rigid_body_set";
import {
    RevoluteImpulseJoint,
    FixedImpulseJoint,
    ImpulseJoint,
    ImpulseJointHandle,
    JointData,
    JointType,
    PrismaticImpulseJoint,
    // #if DIM3
    SphericalImpulseJoint
    // #endif
} from "./impulse_joint";
import {IslandManager} from "./island_manager";
import {RigidBodyHandle} from "./rigid_body";
import {Collider, ColliderHandle} from "../geometry";

/**
 * A set of joints.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `jointSet.free()`
 * once you are done using it (and all the joints it created).
 */
export class ImpulseJointSet {
    raw: RawImpulseJointSet;
    private map: Map<ImpulseJointHandle, ImpulseJoint>;

    /**
     * Release the WASM memory occupied by this joint set.
     */
    public free() {
        this.raw.free();
        this.raw = undefined;
        this.map.clear();
        this.map = undefined;
    }

    constructor(raw?: RawImpulseJointSet) {
        this.raw = raw || new RawImpulseJointSet();
        this.map = new Map();
        // Initialize the map with the existing elements, if any.
        if (raw) {
            raw.forEachJointHandle((handle: ImpulseJointHandle) => {
                this.map.set(handle, ImpulseJoint.newTyped(raw, null, handle));
            });
        }
    }

    /** @internal */
    public finalizeDeserialization(bodies: RigidBodySet) {
        for (let joint of this.map.values()) {
            joint.finalizeDeserialization(bodies);
        }
    }

    /**
     * Creates a new joint and return its integer handle.
     *
     * @param bodies - The set of rigid-bodies containing the bodies the joint is attached to.
     * @param desc - The joint's parameters.
     * @param parent1 - The handle of the first rigid-body this joint is attached to.
     * @param parent2 - The handle of the second rigid-body this joint is attached to.
     * @param wakeUp - Should the attached rigid-bodies be awakened?
     */
    public createJoint(
        bodies: RigidBodySet,
        desc: JointData,
        parent1: RigidBodyHandle,
        parent2: RigidBodyHandle,
        wakeUp: boolean,
    ): ImpulseJoint {
        const rawParams = desc.intoRaw();
        const handle = this.raw.createJoint(rawParams, parent1, parent2, wakeUp);
        rawParams.free();
        let joint = ImpulseJoint.newTyped(this.raw, bodies, handle);
        this.map.set(handle, joint);
        return joint;
    }

    /**
     * Remove a joint from this set.
     *
     * @param handle - The integer handle of the joint.
     * @param wakeUp - If `true`, the rigid-bodies attached by the removed joint will be woken-up automatically.
     */
    public remove(handle: ImpulseJointHandle, wakeUp: boolean) {
        this.raw.remove(handle, wakeUp);
        this.unmap(handle);
    }

    /**
     * Calls the given closure with the integer handle of each impulse joint attached to this rigid-body.
     *
     * @param f - The closure called with the integer handle of each impulse joint attached to the rigid-body.
     */
    public forEachJointHandleAttachedToRigidBody(handle: RigidBodyHandle, f: (handle: ImpulseJointHandle) => void) {
        this.raw.forEachJointAttachedToRigidBody(handle, f);
    }

    /**
     * Internal function, do not call directly.
     * @param handle
     */
    public unmap(handle: ImpulseJointHandle) {
        this.map.delete(handle);
    }

    /**
     * The number of joints on this set.
     */
    public len(): number {
        return this.map.size;
    }

    /**
     * Does this set contain a joint with the given handle?
     *
     * @param handle - The joint handle to check.
     */
    public contains(handle: ImpulseJointHandle): boolean {
        return this.map.has(handle);
    }

    /**
     * Gets the joint with the given handle.
     *
     * Returns `null` if no joint with the specified handle exists.
     * Note that two distinct calls with the same `handle` will return two
     * different JavaScript objects that both represent the same joint.
     *
     * @param handle - The integer handle of the joint to retrieve.
     */
    public get(handle: ImpulseJointHandle): ImpulseJoint {
        return this.map.get(handle);
    }

    /**
     * Applies the given closure to each joint contained by this set.
     *
     * @param f - The closure to apply.
     */
    public forEachJoint(f: (joint: ImpulseJoint) => void) {
        for (const joint of this.map.values()) {
            f(joint);
        }
    }

    /**
     * Applies the given closure to the handle of each joint contained by this set.
     *
     * @param f - The closure to apply.
     */
    public forEachJointHandle(f: (handle: ImpulseJointHandle) => void) {
        for (const key of this.map.keys())
            f(key);
    }

    /**
     * Gets all handles of the joints in the list.
     *
     * @returns joint handle list.
     */
    public getAllHandles(): ImpulseJointHandle[] {
        return Array.from(this.map.keys());
    }

    /**
     * Gets all joints in the list.
     *
     * @returns joint list.
     */
    public getAllJoints(): ImpulseJoint[] {
        return Array.from(this.map.values());
    }
}
