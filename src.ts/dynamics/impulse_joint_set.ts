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

/**
 * A set of joints.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `jointSet.free()`
 * once you are done using it (and all the joints it created).
 */
export class ImpulseJointSet {
    raw: RawImpulseJointSet;

    /**
     * Release the WASM memory occupied by this joint set.
     */
    public free() {
        this.raw.free();
        this.raw = undefined;
    }

    constructor(raw?: RawImpulseJointSet) {
        this.raw = raw || new RawImpulseJointSet();
    }

    /**
     * Creates a new joint and return its integer handle.
     *
     * @param bodies - The set of rigid-bodies containing the bodies the joint is attached to.
     * @param desc - The joint's parameters.
     * @param parent1 - The handle of the first rigid-body this joint is attached to.
     * @param parent2 - The handle of the second rigid-body this joint is attached to.
     */
    public createJoint(
        desc: JointData,
        parent1: number,
        parent2: number
    ): number {
        const rawParams = desc.intoRaw();
        const result = this.raw.createJoint(rawParams, parent1, parent2);
        rawParams.free();
        return result;
    }

    /**
     * Remove a joint from this set.
     *
     * @param handle - The integer handle of the joint.
     * @param bodies - The set of rigid-bodies containing the rigid-bodies attached by the removed joint.
     * @param wake_up - If `true`, the rigid-bodies attached by the removed joint will be woken-up automatically.
     */
    public remove(handle: ImpulseJointHandle, islands: IslandManager, bodies: RigidBodySet, wake_up: boolean) {
        this.raw.remove(handle, islands.raw, bodies.raw, wake_up);
    }

    /**
     * The number of joints on this set.
     */
    public len(): number {
        return this.raw.len();
    }

    /**
     * Does this set contain a joint with the given handle?
     *
     * @param handle - The joint handle to check.
     */
    public contains(handle: ImpulseJointHandle): boolean {
        return this.raw.contains(handle);
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
        if (this.raw.contains(handle)) {
            switch (this.raw.jointType(handle)) {
                case JointType.Revolute:
                    return new RevoluteImpulseJoint(this.raw, handle);
                case JointType.Prismatic:
                    return new PrismaticImpulseJoint(this.raw, handle);
                case JointType.Fixed:
                    return new FixedImpulseJoint(this.raw, handle);
                // #if DIM3
                case JointType.Spherical:
                    return new SphericalImpulseJoint(this.raw, handle);
                // #endif
            }
        } else {
            return null;
        }
    }

    /**
     * Applies the given closure to each joints contained by this set.
     *
     * @param f - The closure to apply.
     */
    public forEachJoint(f: (handle: ImpulseJoint) => void) {
        this.raw.forEachJointHandle((handle: number) => {
            f(this.get(handle));
        });
    }

    /**
     * Applies the given closure to the handle of each joints contained by this set.
     *
     * @param f - The closure to apply.
     */
    public forEachJointHandle(f: (handle: ImpulseJointHandle) => void) {
        this.raw.forEachJointHandle(f);
    }
}
