import {RawRigidBodySet} from "../raw"
import {Rotation, RotationOps, Vector, VectorOps} from '../math';
import {ColliderHandle} from "../geometry";

/**
 * The integer identifier of a collider added to a `ColliderSet`.
 */
export type RigidBodyHandle = number;

/**
 * The simulation status of a rigid-body.
 */
export enum BodyStatus {
    /**
     * A `BodyStatus::Dynamic` body can be affected by all external forces.
     */
    Dynamic = 0,
    /**
     * A `BodyStatus::Static` body cannot be affected by external forces.
     */
    Static,
    /**
     * A `BodyStatus::Kinematic` body cannot be affected by any external forces but can be controlled
     * by the user at the position level while keeping realistic one-way interaction with dynamic bodies.
     *
     * One-way interaction means that a kinematic body can push a dynamic body, but a kinematic body
     * cannot be pushed by anything. In other words, the trajectory of a kinematic body can only be
     * modified by the user and is independent from any contact or joint it is involved in.
     */
    Kinematic,
}

/**
 * A rigid-body.
 */
export class RigidBody {
    private rawSet: RawRigidBodySet; // The RigidBody won't need to free this.
    readonly handle: RigidBodyHandle;

    constructor(rawSet: RawRigidBodySet, handle: RigidBodyHandle) {
        this.rawSet = rawSet;
        this.handle = handle;
    }

    /**
     * Checks if this rigid-body is still valid (i.e. that it has
     * not been deleted from the rigid-body set yet.
     */
    public isValid(): boolean {
        return this.rawSet.contains(this.handle);
    }

    /**
     * The world-space translation of this rigid-body.
     */
    public translation(): Vector {
        let res = this.rawSet.rbTranslation(this.handle);
        return VectorOps.fromRaw(res);
    }

    /**
     * The world-space orientation of this rigid-body.
     */
    public rotation(): Rotation {
        let res = this.rawSet.rbRotation(this.handle);
        return RotationOps.fromRaw(res);
    }

    /**
     * The world-space predicted translation of this rigid-body.
     *
     * If this rigid-body is kinematic this value is set by the `setNextKinematicTranslation`
     * method and is used for estimating the kinematic body velocity at the next timestep.
     * For non-kinematic bodies, this value is currently unspecified.
     */
    public predictedTranslation(): Vector {
        let res = this.rawSet.rbPredictedTranslation(this.handle);
        return VectorOps.fromRaw(res);
    }

    /**
     * The world-space predicted orientation of this rigid-body.
     *
     * If this rigid-body is kinematic this value is set by the `setNextKinematicRotation`
     * method and is used for estimating the kinematic body velocity at the next timestep.
     * For non-kinematic bodies, this value is currently unspecified.
     */
    public predictedRotation(): Rotation {
        let res = this.rawSet.rbPredictedRotation(this.handle);
        return RotationOps.fromRaw(res);
    }

    /**
     * Sets the translation of this rigid-body.
     *
     * @param tra - The world-space position of the rigid-body.
     * @param wakeUp - Forces the rigid-body to wake-up so it is properly affected by forces if it
     *                 wasn't moving before modifying its position.
     */
    public setTranslation(tra: Vector, wakeUp: boolean,) {
        // #if DIM2
        this.rawSet.rbSetTranslation(this.handle, tra.x, tra.y, wakeUp);
        // #endif
        // #if DIM3
        this.rawSet.rbSetTranslation(this.handle, tra.x, tra.y, tra.z, wakeUp);
        // #endif
    }

    /**
     * Sets the linear velocity fo this rigid-body.
     *
     * @param vel - The linear velocity to set.
     * @param wakeUp - Forces the rigid-body to wake-up if it was asleep.
     */
    public setLinvel(vel: Vector, wakeUp: boolean) {
        let rawVel = VectorOps.intoRaw(vel);
        this.rawSet.rbSetLinvel(this.handle, rawVel, wakeUp);
        rawVel.free();
    }

    // #if DIM3
    /**
     * Sets the rotation quaternion of this rigid-body.
     *
     * This does nothing if a zero quaternion is provided.
     *
     * @param rotation - The rotation to set.
     * @param wakeUp - Forces the rigid-body to wake-up so it is properly affected by forces if it
     * wasn't moving before modifying its position.
     */
    public setRotation(rot: Rotation, wakeUp: boolean) {
        this.rawSet.rbSetRotation(this.handle, rot.x, rot.y, rot.z, rot.w, wakeUp);
    }

    /**
     * Sets the angular velocity fo this rigid-body.
     *
     * @param vel - The angular velocity to set.
     * @param wakeUp - Forces the rigid-body to wake-up if it was asleep.
     */
    public setAngvel(vel: Vector, wakeUp: boolean) {
        let rawVel = VectorOps.intoRaw(vel);
        this.rawSet.rbSetAngvel(this.handle, rawVel, wakeUp);
        rawVel.free();
    }

    // #endif

    // #if DIM2
    /**
     * Sets the rotation angle of this rigid-body.
     *
     * @param angle - The rotation angle, in radians.
     * @param wakeUp - Forces the rigid-body to wake-up so it is properly affected by forces if it
     * wasn't moving before modifying its position.
     */
    public setRotation(angle: number, wakeUp: boolean) {
        this.rawSet.rbSetRotation(this.handle, angle, wakeUp);
    }

    /**
     * Sets the angular velocity fo this rigid-body.
     *
     * @param vel - The angular velocity to set.
     * @param wakeUp - Forces the rigid-body to wake-up if it was asleep.
     */
    public setAngvel(vel: number, wakeUp: boolean) {
        this.rawSet.rbSetAngvel(this.handle, vel, wakeUp);
    }

    // #endif

    /**
     * If this rigid body is kinematic, sets its future translation after the next timestep integration.
     *
     * This should be used instead of `rigidBody.setTranslation` to make the dynamic object
     * interacting with this kinematic body behave as expected. Internally, Rapier will compute
     * an artificial velocity for this rigid-body from its current position and its next kinematic
     * position. This velocity will be used to compute forces on dynamic bodies interacting with
     * this body.
     *
     * @param t - The kinematic translation to set.
     */
    public setNextKinematicTranslation(t: Vector) {
        // #if DIM2
        this.rawSet.rbSetNextKinematicTranslation(this.handle, t.x, t.y);
        // #endif
        // #if DIM3
        this.rawSet.rbSetNextKinematicTranslation(this.handle, t.x, t.y, t.z);
        // #endif
    }

    // #if DIM3
    /**
     * If this rigid body is kinematic, sets its future rotation after the next timestep integration.
     *
     * This should be used instead of `rigidBody.setRotation` to make the dynamic object
     * interacting with this kinematic body behave as expected. Internally, Rapier will compute
     * an artificial velocity for this rigid-body from its current position and its next kinematic
     * position. This velocity will be used to compute forces on dynamic bodies interacting with
     * this body.
     *
     * @param rot - The kinematic rotation to set.
     */
    public setNextKinematicRotation(rot: Rotation) {
        this.rawSet.rbSetNextKinematicRotation(this.handle, rot.x, rot.y, rot.z, rot.w);
    }

    // #endif

    // #if DIM2
    /**
     * If this rigid body is kinematic, sets its future rotation after the next timestep integration.
     *
     * This should be used instead of `rigidBody.setRotation` to make the dynamic object
     * interacting with this kinematic body behave as expected. Internally, Rapier will compute
     * an artificial velocity for this rigid-body from its current position and its next kinematic
     * position. This velocity will be used to compute forces on dynamic bodies interacting with
     * this body.
     *
     * @param angle - The kinematic rotation angle, in radians.
     */
    public setNextKinematicRotation(angle: number) {
        this.rawSet.rbSetNextKinematicRotation(this.handle, angle);
    }

    // #endif

    /**
     * The linear velocity of this rigid-body.
     */
    public linvel(): Vector {
        return VectorOps.fromRaw(this.rawSet.rbLinvel(this.handle));
    }

    // #if DIM3
    /**
     * The angular velocity of this rigid-body.
     */
    public angvel(): Vector {
        return VectorOps.fromRaw(this.rawSet.rbAngvel(this.handle));
    }

    // #endif

    // #if DIM2
    /**
     * The angular velocity of this rigid-body.
     */
    public angvel(): number {
        return this.rawSet.rbAngvel(this.handle);
    }

    // #endif

    /**
     * The mass of this rigid-body.
     */
    public mass(): number {
        return this.rawSet.rbMass(this.handle);
    }

    /**
     * Put this rigid body to sleep.
     *
     * A sleeping body no longer moves and is no longer simulated by the physics engine unless
     * it is waken up. It can be woken manually with `this.wakeUp()` or automatically due to
     * external forces like contacts.
     */
    public sleep() {
        this.rawSet.rbSleep(this.handle);
    }

    /**
     * Wakes this rigid-body up.
     *
     * A dynamic rigid-body that does not move during several consecutive frames will
     * be put to sleep by the physics engine, i.e., it will stop being simulated in order
     * to avoid useless computations.
     * This methods forces a sleeping rigid-body to wake-up. This is useful, e.g., before modifying
     * the position of a dynamic body so that it is properly simulated afterwards.
     */
    public wakeUp() {
        this.rawSet.rbWakeUp(this.handle);
    }

    /**
     * The number of colliders attached to this rigid-body.
     */
    public numColliders(): number {
        return this.rawSet.rbNumColliders(this.handle);
    }

    /**
     * Retrieves the handle of the `i-th` collider attached to this rigid-body.
     *
     * @param i - The index of the collider to retrieve. Must be a number in `[0, this.numColliders()[`.
     *         This index is **not** the same as the unique identifier of the collider.
     */
    public collider(i: number): ColliderHandle {
        return this.rawSet.rbCollider(this.handle, i);
    }

    /**
     * The status of this rigid-body: static, dynamic, or kinematic.
     */
    public bodyStatus(): BodyStatus {
        return this.rawSet.rbBodyStatus(this.handle);
    }

    /**
     * Is this rigid-body sleeping?
     */
    public isSleeping(): boolean {
        return this.rawSet.rbIsSleeping(this.handle);
    }

    /**
     * Is the velocity of this rigid-body not zero?
     */
    public isMoving(): boolean {
        return this.rawSet.rbIsMoving(this.handle);
    }

    /**
     * Is this rigid-body static?
     */
    public isStatic(): boolean {
        return this.rawSet.rbIsStatic(this.handle);
    }

    /**
     * Is this rigid-body kinematic?
     */
    public isKinematic(): boolean {
        return this.rawSet.rbIsKinematic(this.handle);
    }

    /**
     * Is this rigid-body dynamic?
     */
    public isDynamic(): boolean {
        return this.rawSet.rbIsDynamic(this.handle);
    }

    /**
     * The linear damping coefficient of this rigid-body.
     */
    public linearDamping(): number {
        return this.rawSet.rbLinearDamping(this.handle);
    }

    /**
     * The angular damping coefficient of this rigid-body.
     */
    public angularDamping(): number {
        return this.rawSet.rbAngularDamping(this.handle);
    }

    /**
     * Applies a force at the center-of-mass of this rigid-body.
     *
     * @param force - the world-space force to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyForce(force: Vector, wakeUp: boolean) {
        const rawForce = VectorOps.intoRaw(force);
        this.rawSet.rbApplyForce(this.handle, rawForce, wakeUp);
        rawForce.free();
    }

    /**
     * Applies an impulse at the center-of-mass of this rigid-body.
     *
     * @param impulse - the world-space impulse to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyImpulse(
        impulse: Vector,
        wakeUp: boolean,
    ) {
        const rawImpulse = VectorOps.intoRaw(impulse);
        this.rawSet.rbApplyImpulse(this.handle, rawImpulse, wakeUp);
        rawImpulse.free();
    }

    // #if DIM2
    /**
     * Applies a torque at the center-of-mass of this rigid-body.
     *
     * @param torque - the torque to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyTorque(torque: number, wakeUp: boolean) {
        this.rawSet.rbApplyTorque(this.handle, torque, wakeUp);
    }

    // #endif

    // #if DIM3
    /**
     * Applies a torque at the center-of-mass of this rigid-body.
     *
     * @param torque - the world-space torque to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyTorque(torque: Vector, wakeUp: boolean) {
        const rawTorque = VectorOps.intoRaw(torque);
        this.rawSet.rbApplyTorque(this.handle, rawTorque, wakeUp);
        rawTorque.free();
    }

    // #endif

    // #if DIM2
    /**
     * Applies an impulsive torque at the center-of-mass of this rigid-body.
     *
     * @param torqueImpulse - the torque impulse to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyTorqueImpulse(torqueImpulse: number, wakeUp: boolean) {
        this.rawSet.rbApplyTorqueImpulse(this.handle, torqueImpulse, wakeUp);
    }

    // #endif

    // #if DIM3
    /**
     * Applies an impulsive torque at the center-of-mass of this rigid-body.
     *
     * @param torqueImpulse - the world-space torque impulse to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyTorqueImpulse(torqueImpulse: Vector, wakeUp: boolean) {
        const rawTorqueImpulse = VectorOps.intoRaw(torqueImpulse);
        this.rawSet.rbApplyTorqueImpulse(this.handle, rawTorqueImpulse, wakeUp);
        rawTorqueImpulse.free();
    }

    // #endif

    /**
     * Applies a force at the given world-space point of this rigid-body.
     *
     * @param force - the world-space force to apply on the rigid-body.
     * @param point - the world-space point where the impulse is to be applied on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyForceAtPoint(
        force: Vector,
        point: Vector,
        wakeUp: boolean,
    ) {
        const rawForce = VectorOps.intoRaw(force);
        const rawPoint = VectorOps.intoRaw(point);
        this.rawSet.rbApplyForceAtPoint(this.handle, rawForce, rawPoint, wakeUp);
        rawForce.free();
        rawPoint.free();
    }

    /**
     * Applies an impulse at the given world-space point of this rigid-body.
     *
     * @param impulse - the world-space impulse to apply on the rigid-body.
     * @param point - the world-space point where the impulse is to be applied on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyImpulseAtPoint(
        impulse: Vector,
        point: Vector,
        wakeUp: boolean,
    ) {
        const rawImpulse = VectorOps.intoRaw(impulse);
        const rawPoint = VectorOps.intoRaw(point);
        this.rawSet.rbApplyImpulseAtPoint(this.handle, rawImpulse, rawPoint, wakeUp);
        rawImpulse.free();
        rawPoint.free();
    }
}

export class RigidBodyDesc {
    translation: Vector;
    rotation: Rotation;
    mass: number;
    collidersMassContributionEnabled: boolean;
    centerOfMass: Vector;
    linvel: Vector;
    // #if DIM2
    angvel: number;
    principalAngularInertia: number;
    collidersPrincipalAngularInertiaContributionEnabled: boolean;
    // #endif
    // #if DIM3
    angvel: Vector;
    principalAngularInertia: Vector;
    angularInertiaLocalFrame: Rotation;
    collidersPrincipalAngularInertiaContributionEnabledX: boolean;
    collidersPrincipalAngularInertiaContributionEnabledY: boolean;
    collidersPrincipalAngularInertiaContributionEnabledZ: boolean;
    // #endif
    linearDamping: number
    angularDamping: number
    status: BodyStatus;
    canSleep: boolean;

    constructor(status: BodyStatus) {
        this.status = status;
        this.translation = VectorOps.zeros();
        this.rotation = RotationOps.identity();
        this.linvel = VectorOps.zeros();
        this.mass = 0.0;
        this.collidersMassContributionEnabled = true;
        this.centerOfMass = VectorOps.zeros();
        // #if DIM2
        this.angvel = 0.0;
        this.principalAngularInertia = 0.0;
        this.collidersPrincipalAngularInertiaContributionEnabled = true;
        // #endif
        // #if DIM3
        this.angvel = VectorOps.zeros();
        this.principalAngularInertia = VectorOps.zeros();
        this.angularInertiaLocalFrame = RotationOps.identity();
        this.collidersPrincipalAngularInertiaContributionEnabledX = true;
        this.collidersPrincipalAngularInertiaContributionEnabledY = true;
        this.collidersPrincipalAngularInertiaContributionEnabledZ = true;
        // #endif
        this.linearDamping = 0.0;
        this.angularDamping = 0.0;
        this.canSleep = true;
    }

    /**
     * Sets the initial translation of the rigid-body to create.
     *
     * @param tra - The translation to set.
     */
    public setTranslation(tra: Vector): RigidBodyDesc {
        this.translation = tra;
        return this;
    }

    /**
     * Sets the initial rotation of the rigid-body to create.
     *
     * @param rot - The otation to set.
     */
    public setRotation(rot: Rotation): RigidBodyDesc {
        this.rotation = rot;
        return this;
    }

    /**
     * Sets the mass of the rigid-body being built.
     *
     * Use `this.setMass(0.0, false)` to disable translations for this
     * collider.
     *
     * Note that if `collidierMassContributionEnabled` is set to `true` then
     * the final mass of the rigid-bodies depends on the initial mass set by
     * this method to which is added the contributions of all the colliders
     * with non-zero density attached to this rigid-body.
     *
     * @param mass − The initial mass of the rigid-body to create.
     * @param collidersMassContributionEnabled - If `true`, then mass contributions from colliders
     *   with non-zero densities will be taken into account.
     */
    public setMass(mass: number, collidersMassContributionEnabled: boolean): RigidBodyDesc {
        this.mass = mass;
        this.collidersMassContributionEnabled = collidersMassContributionEnabled;
        return this;
    }

    /**
     * Locks all translations that would have resulted from forces on
     * the created rigid-body.
     */
    public lockTranslations() {
        return this.setMass(0.0, false);
    }

    /**
     * Sets the initial linear velocity of the rigid-body to create.
     *
     * @param vel - The linear velocity to set.
     */
    public setLinvel(vel: Vector): RigidBodyDesc {
        this.linvel = vel;
        return this;
    }

    // #if DIM2
    /**
     * Sets the initial angular velocity of the rigid-body to create.
     *
     * @param vel - The angular velocity to set.
     */
    public setAngvel(vel: number): RigidBodyDesc {
        this.angvel = vel;
        return this;
    }

    /**
     * Sets the mass properties of the rigid-body being built.
     *
     * Note that the final mass properties of the rigid-bodies depends
     * on the initial mass-properties of the rigid-body (set by this method)
     * to which is added the contributions of all the colliders with non-zero density
     * attached to this rigid-body.
     *
     * Therefore, if you want your provided mass properties to be the final
     * mass properties of your rigid-body, don't attach colliders to it, or
     * only attach colliders with densities equal to zero.
     *
     * @param mass − The initial mass of the rigid-body to create.
     * @param centerOfMass − The initial center-of-mass of the rigid-body to create.
     * @param principalAngularInertia − The initial principal angular inertia of the rigid-body to create.
     */
    public setMassProperties(mass: number, centerOfMass: Vector, principalAngularInertia: number) {
        this.mass = mass;
        this.centerOfMass = centerOfMass;
        this.principalAngularInertia = principalAngularInertia;
        return this;
    }

    /**
     * Sets the mass properties of the rigid-body being built.
     *
     * Note that if `collidersAngularInertiaContributionEnabled` is `true`,
     * then the final angular inertia of the rigid-body depends
     * on the initial angular inertia set by this method to which is
     * added the contributions of all the colliders with non-zero density
     * attached to this rigid-body.
     *
     * @param principalAngularInertia − The initial principal angular inertia of the rigid-body to create.
     * @param collidersAngularInertiaContributionEnabled - Should the inertia contribution from collider be taken
     *    into account by the rigid-body?
     */
    public setPrincipalAngularInertia(principalAngularInertia: number, collidersAngularInertiaContributionEnabled: boolean) {
        this.principalAngularInertia = principalAngularInertia;
        this.collidersPrincipalAngularInertiaContributionEnabled = collidersAngularInertiaContributionEnabled;
        return this;
    }

    /**
     * Locks all rotations that would have resulted from forces on
     * the created rigid-body.
     */
    public lockRotations() {
        return this.setPrincipalAngularInertia(0.0, false);
    }

    // #endif

    // #if DIM3
    /**
     * Sets the initial angular velocity of the rigid-body to create.
     *
     * @param vel - The angular velocity to set.
     */
    public setAngvel(vel: Vector): RigidBodyDesc {
        this.angvel = vel;
        return this;
    }

    /**
     * Sets the mass properties of the rigid-body being built.
     *
     * Note that the final mass properties of the rigid-bodies depends
     * on the initial mass-properties of the rigid-body (set by this method)
     * to which is added the contributions of all the colliders with non-zero density
     * attached to this rigid-body.
     *
     * Therefore, if you want your provided mass properties to be the final
     * mass properties of your rigid-body, don't attach colliders to it, or
     * only attach colliders with densities equal to zero.
     *
     * @param mass − The initial mass of the rigid-body to create.
     * @param centerOfMass − The initial center-of-mass of the rigid-body to create.
     * @param principalAngularInertia − The initial principal angular inertia of the rigid-body to create.
     *                                  These are the eigenvalues of the angular inertia matrix.
     * @param angularInertiaLocalFrame − The initial local angular inertia frame of the rigid-body to create.
     *                                   These are the eigenvectors of the angular inertia matrix.
     */
    public setMassProperties(mass: number, centerOfMass: Vector, principalAngularInertia: Vector, angularInertiaLocalFrame) {
        this.mass = mass;
        this.centerOfMass = centerOfMass;
        this.principalAngularInertia = principalAngularInertia;
        this.angularInertiaLocalFrame = angularInertiaLocalFrame;
        return this;
    }


    /**
     * Sets the mass properties of the rigid-body being built.
     *
     * Note that if any `collidersAngularInertiaContributionEnabled*` is `true`,
     * then the final angular inertia of the rigid-body for this axis depends
     * on the initial angular inertia set by this method to which is
     * added the contributions of all the colliders with non-zero density
     * attached to this rigid-body.
     *
     * @param principalAngularInertia − The initial principal angular inertia of the rigid-body to create.
     * @param collidersAngularInertiaContributionEnabled - Should the inertia contribution from collider be taken
     *    into account by the rigid-body?
     */
    public setPrincipalAngularInertia(
        principalAngularInertia: Vector,
        collidersAngularInertiaContributionEnabledX: boolean,
        collidersAngularInertiaContributionEnabledY: boolean,
        collidersAngularInertiaContributionEnabledZ: boolean,
    ) {
        this.principalAngularInertia = principalAngularInertia;
        this.collidersPrincipalAngularInertiaContributionEnabledX = collidersAngularInertiaContributionEnabledX;
        this.collidersPrincipalAngularInertiaContributionEnabledY = collidersAngularInertiaContributionEnabledY;
        this.collidersPrincipalAngularInertiaContributionEnabledZ = collidersAngularInertiaContributionEnabledZ;
        return this;
    }

    /**
     * Locks all rotations that would have resulted from forces on
     * the created rigid-body.
     */
    public lockRotations() {
        return this.setPrincipalAngularInertia(VectorOps.zeros(), false, false, false);
    }

    // #endif

    /**
     * Sets the linear damping of the rigid-body to create.
     *
     * This will progressively slowdown the translational movement of the rigid-body.
     *
     * @param damping - The angular damping coefficient. Should be >= 0. The higher this
     *                  value is, the stronger the translational slowdown will be.
     */
    public setLinearDamping(damping: number): RigidBodyDesc {
        this.linearDamping = damping;
        return this;
    }

    /**
     * Sets the angular damping of the rigid-body to create.
     *
     * This will progressively slowdown the rotational movement of the rigid-body.
     *
     * @param damping - The angular damping coefficient. Should be >= 0. The higher this
     *                  value is, the stronger the rotational slowdown will be.
     */
    public setAngularDamping(damping: number): RigidBodyDesc {
        this.angularDamping = damping;
        return this;
    }

    /**
     * Sets whether or not the rigid-body to create can sleep.
     *
     * @param can - true if the rigid-body can sleep, false if it can't.
     */
    public setCanSleep(can: boolean): RigidBodyDesc {
        this.canSleep = can;
        return this;
    }
}