import {RawRigidBodySet} from "@dimforge/raw-rapier2d"
import {Rotation, Vector} from '../math.ts';
import {ColliderHandle} from "../geometry";

export type RigidBodyHandle = number;

export enum BodyStatus {
    Dynamic = 0,
    Static,
    Kinematic,
}

export class RigidBody {
    private RAPIER: any;
    private rawSet: RawRigidBodySet; // The RigidBody won't need to free this.
    readonly handle: RigidBodyHandle;

    constructor(RAPIER: any, rawSet: RawRigidBodySet, handle: RigidBodyHandle) {
        this.RAPIER = RAPIER;
        this.rawSet = rawSet;
        this.handle = handle;
    }

    /// Checks if this rigid-body is still valid (i.e. that it has
    /// not been deleted from the rigid-body set yet.
    public isValid(): boolean {
        return this.rawSet.isHandleValid(this.handle);
    }

    /// The world-space translation of this rigid-body.
    public translation(): Vector {
        let res = this.rawSet.rbTranslation(this.handle);
        return Vector.fromRaw(res);
    }

    /// The world-space orientation of this rigid-body.
    public rotation(): Rotation {
        let res = this.rawSet.rbRotation(this.handle);
        return Rotation.fromRaw(res);
    }

    /// The world-space predicted translation of this rigid-body.
    ///
    /// If this rigid-body is kinematic this value is set by the `setNextKinematicTranslation`
    /// method and is used for estimating the kinematic body velocity at the next timestep.
    /// For non-kinematic bodies, this value is currently unspecified.
    public predictedTranslation(): Vector {
        let res = this.rawSet.rbPredictedTranslation(this.handle);
        return Vector.fromRaw(res);
    }

    /// The world-space predicted orientation of this rigid-body.
    ///
    /// If this rigid-body is kinematic this value is set by the `setNextKinematicRotation`
    /// method and is used for estimating the kinematic body velocity at the next timestep.
    /// For non-kinematic bodies, this value is currently unspecified.
    public predictedRotation(): Rotation {
        let res = this.rawSet.rbPredictedRotation(this.handle);
        return Rotation.fromRaw(res);
    }

    /// Sets the translation of this rigid-body.
    ///
    /// # Parameters
    /// - `x`: the world-space position of the rigid-body along the `x` axis.
    /// - `y`: the world-space position of the rigid-body along the `y` axis.
    /// - `z`: the world-space position of the rigid-body along the `z` axis.
    /// - `wakeUp`: forces the rigid-body to wake-up so it is properly affected by forces if it
    /// wasn't moving before modifying its position.
    // #if DIM3
    public setTranslation(
        x: number,
        y: number,
        z: number,
        wakeUp: boolean,
    ) {
        this.rawSet.rbSetTranslation(this.handle, x, y, z, wakeUp);
    }

    // #endif

    /// Sets the translation of this rigid-body.
    ///
    /// # Parameters
    /// - `x`: the world-space position of the rigid-body along the `x` axis.
    /// - `y`: the world-space position of the rigid-body along the `y` axis.
    /// - `wakeUp`: forces the rigid-body to wake-up so it is properly affected by forces if it
    /// wasn't moving before modifying its position.
    // #if DIM2
    public setTranslation(x: number, y: number, wakeUp: boolean) {
        this.rawSet.rbSetTranslation(this.handle, x, y, wakeUp);
    }

    // #endif

    /// Sets the rotation quaternion of this rigid-body.
    ///
    /// This does nothing if a zero quaternion is provided.
    ///
    /// # Parameters
    /// - `x`: the first vector component of the quaternion.
    /// - `y`: the second vector component of the quaternion.
    /// - `z`: the third vector component of the quaternion.
    /// - `w`: the scalar component of the quaternion.
    /// - `wakeUp`: forces the rigid-body to wake-up so it is properly affected by forces if it
    /// wasn't moving before modifying its position.
    // #if DIM3
    public setRotation(
        x: number,
        y: number,
        z: number,
        w: number,
        wakeUp: boolean,
    ) {
        this.rawSet.rbSetRotation(this.handle, x, y, z, w, wakeUp);
    }

    // #endif

    /// Sets the rotation angle of this rigid-body.
    ///
    /// # Parameters
    /// - `angle`: the rotation angle, in radians.
    /// - `wakeUp`: forces the rigid-body to wake-up so it is properly affected by forces if it
    /// wasn't moving before modifying its position.
    // #if DIM2
    public setRotation(angle: number, wakeUp: boolean) {
        this.rawSet.rbSetRotation(this.handle, angle, wakeUp);
    }

    // #endif

    /// If this rigid body is kinematic, sets its future translation after the next timestep integration.
    ///
    /// This should be used instead of `rigidBody.setTranslation` to make the dynamic object
    /// interacting with this kinematic body behave as expected. Internally, Rapier will compute
    /// an artificial velocity for this rigid-body from its current position and its next kinematic
    /// position. This velocity will be used to compute forces on dynamic bodies interacting with
    /// this body.
    ///
    /// # Parameters
    /// - `x`: the world-space position of the rigid-body along the `x` axis.
    /// - `y`: the world-space position of the rigid-body along the `y` axis.
    /// - `z`: the world-space position of the rigid-body along the `z` axis.
    // #if DIM3
    public setNextKinematicTranslation(
        x: number,
        y: number,
        z: number,
    ) {
        this.rawSet.rbSetNextKinematicTranslation(this.handle, x, y, z);
    }

    // #endif

    /// If this rigid body is kinematic, sets its future translation after the next timestep integration.
    ///
    /// This should be used instead of `rigidBody.setTranslation` to make the dynamic object
    /// interacting with this kinematic body behave as expected. Internally, Rapier will compute
    /// an artificial velocity for this rigid-body from its current position and its next kinematic
    /// position. This velocity will be used to compute forces on dynamic bodies interacting with
    /// this body.
    ///
    /// # Parameters
    /// - `x`: the world-space position of the rigid-body along the `x` axis.
    /// - `y`: the world-space position of the rigid-body along the `y` axis.
    // #if DIM2
    public setNextKinematicTranslation(x: number, y: number) {
        this.rawSet.rbSetNextKinematicTranslation(this.handle, x, y);
    }

    // #endif

    /// If this rigid body is kinematic, sets its future rotation after the next timestep integration.
    ///
    /// This should be used instead of `rigidBody.setRotation` to make the dynamic object
    /// interacting with this kinematic body behave as expected. Internally, Rapier will compute
    /// an artificial velocity for this rigid-body from its current position and its next kinematic
    /// position. This velocity will be used to compute forces on dynamic bodies interacting with
    /// this body.
    ///
    /// # Parameters
    /// - `x`: the first vector component of the quaternion.
    /// - `y`: the second vector component of the quaternion.
    /// - `z`: the third vector component of the quaternion.
    /// - `w`: the scalar component of the quaternion.
    // #if DIM3
    public setNextKinematicRotation(
        x: number,
        y: number,
        z: number,
        w: number,
    ) {
        this.rawSet.rbSetNextKinematicRotation(this.handle, x, y, z, w);
    }

    // #endif

    /// If this rigid body is kinematic, sets its future rotation after the next timestep integration.
    ///
    /// This should be used instead of `rigidBody.setRotation` to make the dynamic object
    /// interacting with this kinematic body behave as expected. Internally, Rapier will compute
    /// an artificial velocity for this rigid-body from its current position and its next kinematic
    /// position. This velocity will be used to compute forces on dynamic bodies interacting with
    /// this body.
    ///
    /// # Parameters
    /// - `angle`: the rotation angle, in radians.
    // #if DIM2
    public setNextKinematicRotation(angle: number) {
        this.rawSet.rbSetNextKinematicRotation(this.handle, angle);
    }

    // #endif

    /// The linear velocity of this rigid-body.
    public linvel(): Vector {
        let res = this.rawSet.rbLinvel(this.handle);
        return Vector.fromRaw(res);
    }

    /// The mass of this rigid-body.
    public mass(): number {
        return this.rawSet.rbMass(this.handle);
    }

    /// Wakes this rigid-body up.
    ///
    /// A dynamic rigid-body that does not move during several consecutive frames will
    /// be put to sleep by the physics engine, i.e., it will stop being simulated in order
    /// to avoid useless computations.
    /// This methods forces a sleeping rigid-body to wake-up. This is useful, e.g., before modifying
    /// the position of a dynamic body so that it is properly simulated afterwards.
    public wakeUp() {
        this.rawSet.rbWakeUp(this.handle);
    }

    /// The number of colliders attached to this rigid-body.
    public numColliders(): number {
        return this.rawSet.rbNumColliders(this.handle);
    }

    /// Retrieves the handle o fthe `i-th` collider attached to this rigid-body.
    ///
    /// # Parameters
    /// - `at`: The index of the collider to retrieve. Must be a number in `[0, this.numColliders()[`.
    ///         This index is **not** the same as the unique identifier of the collider.
    public collider(i: number): ColliderHandle {
        return this.rawSet.rbCollider(this.handle, i);
    }

    /// The type of this rigid-body: static, dynamic, or kinematic.
    public bodyType(): BodyStatus {
        return this.rawSet.rbBodyType(this.handle);
    }

    /// Is this rigid-body static?
    public isStatic(): boolean {
        return this.rawSet.rbIsStatic(this.handle);
    }

    /// Is this rigid-body kinematic?
    public isKinematic(): boolean {
        return this.rawSet.rbIsDynamic(this.handle);
    }

    /// Is this rigid-body dynamic?
    public isDynamic(): boolean {
        return this.rawSet.rbIsStatic(this.handle);
    }

    /// Applies a force at the center-of-mass of this rigid-body.
    ///
    /// # Parameters
    /// - `force`: the world-space force to apply on the rigid-body.
    /// - `wakeUp`: should the rigid-body be automatically woken-up?
    public applyForce(force: Vector, wakeUp: boolean) {
        const rawForce = force.intoRaw(this.RAPIER);
        this.rawSet.rbApplyForce(this.handle, rawForce, wakeUp);
        rawForce.free();
    }

    /// Applies an impulse at the center-of-mass of this rigid-body.
    ///
    /// # Parameters
    /// - `impulse`: the world-space impulse to apply on the rigid-body.
    /// - `wakeUp`: should the rigid-body be automatically woken-up?
    public applyImpulse(
        impulse: Vector,
        wakeUp: boolean,
    ) {
        const rawImpulse = impulse.intoRaw(this.RAPIER);
        this.rawSet.rbApplyImpulse(this.handle, rawImpulse, wakeUp);
        rawImpulse.free();
    }

    /// Applies a torque at the center-of-mass of this rigid-body.
    ///
    /// # Parameters
    /// - `torque`: the torque to apply on the rigid-body.
    /// - `wakeUp`: should the rigid-body be automatically woken-up?
    // #if DIM2
    public applyTorque(torque: number, wakeUp: boolean) {
        this.rawSet.rbApplyTorque(this.handle, torque, wakeUp);
    }

    // #endif

    /// Applies a torque at the center-of-mass of this rigid-body.
    ///
    /// # Parameters
    /// - `torque`: the world-space torque to apply on the rigid-body.
    /// - `wakeUp`: should the rigid-body be automatically woken-up?
    // #if DIM3
    public applyTorque(torque: Vector, wakeUp: boolean) {
        const rawTorque = torque.intoRaw(this.RAPIER);
        this.rawSet.rbApplyTorque(this.handle, rawTorque, wakeUp);
        rawTorque.free();
    }

    // #endif

    /// Applies an impulsive torque at the center-of-mass of this rigid-body.
    ///
    /// # Parameters
    /// - `torqueImpulse`: the torque impulse to apply on the rigid-body.
    /// - `wakeUp`: should the rigid-body be automatically woken-up?
    // #if DIM2
    public applyTorqueImpulse(torqueImpulse: number, wakeUp: boolean) {
        this.rawSet.rbApplyTorqueImpulse(this.handle, torqueImpulse, wakeUp);
    }

    // #endif

    /// Applies an impulsive torque at the center-of-mass of this rigid-body.
    ///
    /// # Parameters
    /// - `torqueImpulse`: the world-space torque impulse to apply on the rigid-body.
    /// - `wakeUp`: should the rigid-body be automatically woken-up?
    // #if DIM3
    public applyTorqueImpulse(torqueImpulse: Vector, wakeUp: boolean) {
        const rawTorqueImpulse = torqueImpulse.intoRaw(this.RAPIER);
        this.rawSet.rbApplyTorqueImpulse(this.handle, rawTorqueImpulse, wakeUp);
        rawTorqueImpulse.free();
    }

    // #endif

    /// Applies a force at the given world-space point of this rigid-body.
    ///
    /// # Parameters
    /// - `force`: the world-space force to apply on the rigid-body.
    /// - `point`: the world-space point where the impulse is to be applied on the rigid-body.
    /// - `wakeUp`: should the rigid-body be automatically woken-up?
    public applyForceAtPoint(
        force: Vector,
        point: Vector,
        wakeUp: boolean,
    ) {
        const rawForce = force.intoRaw(this.RAPIER);
        const rawPoint = point.intoRaw(this.RAPIER);
        this.rawSet.rbApplyForceAtPoint(this.handle, rawForce, rawPoint, wakeUp);
        rawForce.free();
        rawPoint.free();
    }

    /// Applies an impulse at the given world-space point of this rigid-body.
    ///
    /// # Parameters
    /// - `impulse`: the world-space impulse to apply on the rigid-body.
    /// - `point`: the world-space point where the impulse is to be applied on the rigid-body.
    /// - `wakeUp`: should the rigid-body be automatically woken-up?
    public applyImpulseAtPoint(
        impulse: Vector,
        point: Vector,
        wakeUp: boolean,
    ) {
        const rawImpulse = impulse.intoRaw(this.RAPIER);
        const rawPoint = point.intoRaw(this.RAPIER);
        this.rawSet.rbApplyImpulseAtPoint(this.handle, rawImpulse, rawPoint, wakeUp);
        rawImpulse.free();
        rawPoint.free();
    }
}

export class RigidBodyDesc {
    translation: Vector;
    rotation: Rotation;
    linvel: Vector;
    // #if DIM2
    angvel: number;
    // #endif
    // #if DIM3
    angvel: Vector;
    // #endif
    status: BodyStatus;
    canSleep: boolean;

    constructor(status: BodyStatus) {
        this.status = status;
        this.translation = Vector.zeros();
        this.rotation = Rotation.identity();
        this.linvel = Vector.zeros();
        // #if DIM2
        this.angvel = 0.0;
        // #endif
        // #if DIM3
        this.angvel = Vector.zeros();
        // #endif
        this.canSleep = true;
    }

    public withTranslation(tra: Vector): RigidBodyDesc {
        this.translation = tra;
        return this;
    }

    public withRotation(rot: Rotation): RigidBodyDesc {
        this.rotation = rot;
        return this;
    }

    public withLinvel(vel: Vector): RigidBodyDesc {
        this.linvel = vel;
        return this;
    }

    // #if DIM2
    public withAngvel(ang: number): RigidBodyDesc {
        this.angvel = ang;
        return this;
    }

    // #endif

    // #if DIM3
    public withAngvel(ang: Vector): RigidBodyDesc {
        this.angvel = ang;
        return this;
    }

    // #endif

    public withCanSleep(can: boolean): RigidBodyDesc {
        this.canSleep = can;
        return this;
    }
}