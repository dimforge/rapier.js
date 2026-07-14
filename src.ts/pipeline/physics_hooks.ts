import { RawContactManifold, RawContactModificationContext } from "../raw";
import { RigidBodyHandle } from "../dynamics";
import { ColliderHandle } from "../geometry";
import { Vector, VectorOps } from "../math";

export enum ActiveHooks {
    NONE = 0,
    FILTER_CONTACT_PAIRS = 0b0001,
    FILTER_INTERSECTION_PAIRS = 0b0010,
    MODIFY_SOLVER_CONTACTS = 0b0100,
}

export enum SolverFlags {
    EMPTY = 0b000,
    COMPUTE_IMPULSE = 0b001,
}

export class ContactModificationContext {
    raw: RawContactModificationContext;
    constructor(raw: RawContactModificationContext) {
        this.raw = raw;
    }

    /**
     * Collider handle of the first collider involved in this contact modification context.
     */
    get collider1(): ColliderHandle {
        return this.raw.collider1();
    }

    /**
     * Collider handle of the second collider involved in this contact modification context.
     */
    get collider2(): ColliderHandle {
        return this.raw.collider2();
    }

    /**
     * Rigid body handle of the first rigid body involved in this contact modification context.
     */
    get rigidBody1(): RigidBodyHandle | undefined {
        return this.raw.rigid_body1();
    }

    /**
     * Rigid body handle of the second rigid body involved in this contact modification context.
     */
    get rigidBody2(): RigidBodyHandle | undefined {
        return this.raw.rigid_body2();
    }

    /**
     * Normal of the contact in this context.
     */
    get normal(): Vector {
        return VectorOps.fromRaw(this.raw.normal);
    }

    set normal(v: Vector) {
        this.raw.normal = VectorOps.intoRaw(v);
    }

    /**
     * User data associated with this contact.
     */
    get userData(): number {
        return this.raw.user_data;
    }

    set userData(data: number) {
        this.raw.user_data = data;
    }

    /**
     * Number of solver contacts in this contact modification context.
     */
    get numSolverContacts(): number {
        return this.raw.num_solver_contacts();
    }

    /**
     * Clears all the solver contacts in this contact modification context.
     */
    clearSolverContacts(): void {
        this.raw.clear_solver_contacts();
    }

    /**
     * Removes the solver contact at the given index. The last solver contact
     * will be moved to the given index.
     * @param index - The index of the solver contact to remove.
     */
    removeSolverContact(index: number): void {
        this.raw.remove_solver_contact(index);
    }

    /**
     * Gets the location of the solver contact at the given index.
     * @param index - The index of the solver contact.
     * @returns The location of the solver contact, in world-space coordinates.
     */
    getSolverContactPoint(index: number): Vector {
        return VectorOps.fromRaw(this.raw.solver_contact_point(index));
    }

    /**
     * Sets the location of the solver contact at the given index.
     * @param index - The index of the solver contact.
     * @param point - The new location of the solver contact, in world-space coordinates.
     */
    setSolverContactPoint(index: number, point: Vector): void {
        this.raw.set_solver_contact_point(index, VectorOps.intoRaw(point));
    }

    /**
     * Gets the distance between the two original contacts points along the contact normal.
     * @param index - The index of the solver contact.
     * @returns The distance between the two original contacts points along the contact normal.
     */
    getSolverContactDist(index: number): number {
        return this.raw.solver_contact_dist(index);
    }

    /**
     * Modifies the distance between the two original contacts points along the contact normal.
     * @param index - The index of the solver contact.
     * @param dist - The new distance between the two original contacts points along the contact normal.
     */
    setSolverContactDist(index: number, dist: number): void {
        this.raw.set_solver_contact_dist(index, dist);
    }

    /**
     * Gets the effective friction of the solver contact at the given index.
     * @param index - The index of the solver contact.
     * @returns The friction of the solver contact.
     */
    getSolverContactFriction(index: number): number {
        return this.raw.solver_contact_friction(index);
    }

    /**
     * Sets the effective friction of the solver contact at the given index.
     * @param index - The index of the solver contact.
     * @param friction - The new friction of the solver contact.
     */
    setSolverContactFriction(index: number, friction: number): void {
        this.raw.set_solver_contact_friction(index, friction);
    }

    /**
     * Gets the effective restitution of the solver contact at the given index.
     * @param index - The index of the solver contact.
     * @returns The restitution of the solver contact.
     */
    getSolverContactRestitution(index: number): number {
        return this.raw.solver_contact_restitution(index);
    }

    /**
     * Sets the effective restitution of the solver contact at the given index.
     * @param index - The index of the solver contact.
     * @param restitution - The new restitution of the solver contact.
     */
    setSolverContactRestitution(index: number, restitution: number): void {
        this.raw.set_solver_contact_restitution(index, restitution);
    }

    /**
     * Gets the tangent velocity of the solver contact at the given index. This
     * is set to zero by default. It can be used to simulate conveyor belts or
     * similar effects.
     * @param index - The index of the solver contact.
     * @returns The tangent velocity of the solver contact.
     */
    getSolverContactTangentVelocity(index: number): Vector {
        return VectorOps.fromRaw(
            this.raw.solver_contact_tangent_velocity(index),
        );
    }

    /**
     * Sets the tangent velocity of the solver contact at the given index. This
     * is set to zero by default. It can be used to simulate conveyor belts or
     * similar effects.
     * @param index - The index of the solver contact.
     * @param tangentVelocity - The new tangent velocity of the solver contact.
     */
    setSolverContactTangentVelocity(
        index: number,
        tangentVelocity: Vector,
    ): void {
        this.raw.set_solver_contact_tangent_velocity(
            index,
            VectorOps.intoRaw(tangentVelocity),
        );
    }

    /**
     * Gets the impulse used to warmstart the solve for the normal constraint.
     * @param index - The index of the solver contact.
     * @returns Impulse used to warmstart the solve for the normal constraint.
     */
    getSolverContactWarmstartImpulse(index: number): number {
        return this.raw.solver_contact_warmstart_impulse(index);
    }

    /**
     * Sets the impulse used to warmstart the solve for the normal constraint.
     * @param index - The index of the solver contact.
     * @param impulse - New impulse to warmstart the solve for the normal constraint.
     */
    setSolverContactWarmstartImpulse(index: number, impulse: number): void {
        this.raw.set_solver_contact_warmstart_impulse(index, impulse);
    }

    /**
     * Gets the impulse used to warmstart the solve for the friction constraints.
     * @param index - The index of the solver contact.
     * @returns Impulse used to warmstart the solve for the friction constraints.
     */
    getSolverContactWarmstartTangentImpulse(index: number): number {
        return this.raw.solver_contact_warmstart_tangent_impulse(index);
    }

    /**
     * Sets the impulse used to warmstart the solve for the friction constraints.
     * @param index - The index of the solver contact.
     * @param impulse - New impulse to warmstart the solve for the friction constraints.
     */
    setSolverContactWarmstartTangentImpulse(
        index: number,
        impulse: number,
    ): void {
        this.raw.set_solver_contact_warmstart_tangent_impulse(index, impulse);
    }

    /**
     * Gets the impulse used to warmstart the solve for the twist friction constraints.
     * @param index - The index of the solver contact.
     * @returns Impulse used to warmstart the solve for the twist friction constraints.
     */
    getSolverContactWarmstartTwistImpulse(index: number): number {
        return this.raw.solver_contact_warmstart_twist_impulse(index);
    }

    /**
     * Sets the impulse used to warmstart the solve for the twist friction constraints.
     * @param index - The index of the solver contact.
     * @param impulse New impulse to warmstart the solve for the twist friction constraints.
     */
    setSolverContactWarmstartTwistImpulse(
        index: number,
        impulse: number,
    ): void {
        this.raw.set_solver_contact_warmstart_twist_impulse(index, impulse);
    }

    /**
     * @param index - The index of the solver contact.
     * @returns Whether this contact existed during the last timestep.
     */
    getSolverContactIsNew(index: number): boolean {
        return this.raw.solver_contact_is_new(index);
    }

    /**
     * Sets whether this contact existed during the last timestep.
     * @param index - The index of the solver contact.
     * @param isNew - Whether this contact is new.
     */
    setSolverContactIsNew(index: number, isNew: boolean): void {
        this.raw.set_solver_contact_is_new(index, isNew);
    }

    /**
     * Returns the contact manifold associated with this contact modification context.
     *
     * Can be used with TempContactManifold methods for easier use.
     */
    get contactManifold(): RawContactManifold {
        return this.raw.contact_manifold;
    }

    /**
     * Helper function to update `self` to emulate a oneway-platform.
     * The "oneway" behavior will only allow contacts between two colliders
     * if the local contact normal of the first collider involved in the contact
     * is almost aligned with the provided `allowed_local_n1` direction.
     *
     * To make this method work properly it must be called as part of the
     * `PhysicsHooks::modifySolverContacts` method at each timestep, for each
     * contact manifold involving a one-way platform. The `self.userData` field
     * must not be modified from the outside of this method.
     * @param allowedLocalN1 - The allowed contact normal direction in the local space of the first collider.
     * @param allowedAngle - The maximum angle (in radians) between the contact normal and the `allowed_local_n1` direction.
     */
    updateAsOnewayPlatform(allowedLocalN1: Vector, allowedAngle: number): void {
        this.raw.update_as_oneway_platform(
            VectorOps.intoRaw(allowedLocalN1),
            allowedAngle,
        );
    }
}

export interface PhysicsHooks {
    /**
     * Function that determines if contacts computation should happen between two colliders, and how the
     * constraints solver should behave for these contacts.
     *
     * This will only be executed and taken into account if at least one of the involved colliders contains the
     * `ActiveHooks.FILTER_CONTACT_PAIR` flag in its active hooks.
     *
     * @param collider1 − Handle of the first collider involved in the potential contact.
     * @param collider2 − Handle of the second collider involved in the potential contact.
     * @param body1 − Handle of the first body involved in the potential contact.
     * @param body2 − Handle of the second body involved in the potential contact.
     */
    filterContactPair(
        collider1: ColliderHandle,
        collider2: ColliderHandle,
        body1: RigidBodyHandle,
        body2: RigidBodyHandle,
    ): SolverFlags | null;

    /**
     * Function that determines if intersection computation should happen between two colliders (where at least
     * one is a sensor).
     *
     * This will only be executed and taken into account if `one of the involved colliders contains the
     * `ActiveHooks.FILTER_INTERSECTION_PAIR` flag in its active hooks.
     *
     * @param collider1 − Handle of the first collider involved in the potential contact.
     * @param collider2 − Handle of the second collider involved in the potential contact.
     * @param body1 − Handle of the first body involved in the potential contact.
     * @param body2 − Handle of the second body involved in the potential contact.
     */
    filterIntersectionPair(
        collider1: ColliderHandle,
        collider2: ColliderHandle,
        body1: RigidBodyHandle,
        body2: RigidBodyHandle,
    ): boolean;

    /**
     * Function that modifies the set of contacts seen by the constraints solver.
     *
     * Note that this method will only be called if at least one of the colliders
     * involved in the contact contains the `ActiveHooks::MODIFY_SOLVER_CONTACTS` flags
     * in its physics hooks flags.
     *
     * @param context - The raw context providing information and access to the contacts to modify.
     * Can be used with ContactModificationContext for easier use.
     */
    modifySolverContacts?(context: RawContactModificationContext): void;
}
