import {RawDynamicRayCastVehicleController} from "../raw";
import {Vector, VectorOps} from "../math";
import {Collider, ColliderSet, InteractionGroups} from "../geometry";
import {QueryFilterFlags, QueryPipeline} from "../pipeline";
import {RigidBody, RigidBodyHandle, RigidBodySet} from "../dynamics";

/**
 * A character controller to simulate vehicles using ray-casting for the wheels.
 */
export class DynamicRayCastVehicleController {
    private raw: RawDynamicRayCastVehicleController;
    private bodies: RigidBodySet;
    private colliders: ColliderSet;
    private queries: QueryPipeline;

    constructor(
        chassis: RigidBody,
        bodies: RigidBodySet,
        colliders: ColliderSet,
        queries: QueryPipeline,
    ) {
        this.raw = new RawDynamicRayCastVehicleController(chassis.handle);
        this.bodies = bodies;
        this.colliders = colliders;
        this.queries = queries;
    }

    /** @internal */
    public free() {
        if (!!this.raw) {
            this.raw.free();
        }

        this.raw = undefined;
    }

    /**
     * Updates the vehicle’s velocity based on its suspension, engine force, and brake.
     *
     * This directly updates the velocity of its chassis rigid-body.
     *
     * @param dt - Time increment used to integrate forces.
     * @param filterFlags - Flag to exclude categories of objects from the wheels’ ray-cast.
     * @param filterGroups - Only colliders compatible with these groups will be hit by the wheels’ ray-casts.
     * @param filterPredicate - Callback to filter out which collider will be hit by the wheels’ ray-casts.
     */
    public updateVehicle(
        dt: number,
        filterFlags?: QueryFilterFlags,
        filterGroups?: InteractionGroups,
        filterPredicate?: (collider: Collider) => boolean,
    ) {
        this.raw.update_vehicle(
            dt,
            this.bodies.raw,
            this.colliders.raw,
            this.queries.raw,
            filterFlags,
            filterGroups,
            this.colliders.castClosure(filterPredicate)
        )
    }

    /**
     * The current forward speed of the vehicle.
     */
    public currentVehicleSpeed(): number {
        return this.raw.current_vehicle_speed();
    }

    /**
     * The rigid-body used as the chassis.
     */
    public chassis(): RigidBodyHandle {
        return this.raw.chassis();
    }

    /**
     * The chassis’ local _up_ direction (`0 = x, 1 = y, 2 = z`).
     */
    get indexUpAxis(): number {
        return this.raw.index_up_axis();
    }

    /**
     * Sets the chassis’ local _up_ direction (`0 = x, 1 = y, 2 = z`).
     */
    set indexUpAxis(axis: number) {
        this.raw.set_index_up_axis(axis);
    }

    /**
     * The chassis’ local _forward_ direction (`0 = x, 1 = y, 2 = z`).
     */
    get indexForwardAxis(): number {
        return this.raw.index_forward_axis();
    }

    /**
     * Sets the chassis’ local _forward_ direction (`0 = x, 1 = y, 2 = z`).
     */
    set setIndexForwardAxis(axis: number) {
        this.raw.set_index_forward_axis(axis);
    }

    /**
     * Adds a new wheel attached to this vehicle.
     * @param chassisConnectionCs  - The position of the wheel relative to the chassis.
     * @param directionCs - The direction of the wheel’s suspension, relative to the chassis. The ray-casting will
     *                      happen following this direction to detect the ground.
     * @param axleCs - The wheel’s axle axis, relative to the chassis.
     * @param suspensionRestLength - The rest length of the wheel’s suspension spring.
     * @param radius - The wheel’s radius.
     */
    public addWheel(
        chassisConnectionCs: Vector,
        directionCs: Vector,
        axleCs: Vector,
        suspensionRestLength: number,
        radius: number,
    ) {
        let rawChassisConnectionCs = VectorOps.intoRaw(chassisConnectionCs);
        let rawDirectionCs = VectorOps.intoRaw(directionCs);
        let rawAxleCs = VectorOps.intoRaw(axleCs);

        this.raw.add_wheel(rawChassisConnectionCs, rawDirectionCs, rawAxleCs, suspensionRestLength, radius);

        rawChassisConnectionCs.free();
        rawDirectionCs.free();
        rawAxleCs.free();
    }

    /**
     * The number of wheels attached to this vehicle.
     */
    public numWheels(): number {
        return this.raw.num_wheels();
    }



    /*
     *
     * Access to wheel properties.
     *
     */
    /*
     * Getters + setters
     */
    /**
     * The position of the i-th wheel, relative to the chassis.
     */
    public wheelChassisConnectionPointCs(i: number): Vector | null {
        return VectorOps.fromRaw(this.raw.wheel_chassis_connection_point_cs(i));
    }

    /**
     * Sets the position of the i-th wheel, relative to the chassis.
     */
    public setWheelChassisConnectionPointCs(i: number, value: Vector) {
        let rawValue = VectorOps.intoRaw(value);
        this.raw.set_wheel_chassis_connection_point_cs(i, value);
        rawValue.free();
    }

    /**
     * The rest length of the i-th wheel’s suspension spring.
     */
    public wheelSuspensionRestLength(i: number): number | null {
        return this.raw.wheel_suspension_rest_length(i);
    }

    /**
     * Sets the rest length of the i-th wheel’s suspension spring.
     */
    public setWheelSuspensionRestLength(i: number, value: number) {
        this.raw.set_wheel_suspension_rest_length(i, value);
    }

    /**
     * The maximum distance the i-th wheel suspension can travel before and after its resting length.
     */
    public wheelMaxSuspensionTravel(i: number): number | null {
        return this.raw.wheel_max_suspension_travel(i);
    }

    /**
     * Sets the maximum distance the i-th wheel suspension can travel before and after its resting length.
     */
    public setMaxSuspensionTravel(i: number, value: number) {
        this.raw.set_max_suspension_travel(i, value);
    }

    /**
     * The i-th wheel’s radius.
     */
    public wheelRadius(i: number): number | null {
        return this.raw.wheel_radius(i);
    }

    /**
     * Sets the i-th wheel’s radius.
     */
    public setWheelRadius(i: number, value: number) {
        this.raw.set_wheel_radius(i, value);
    }

    /**
     * The i-th wheel’s suspension stiffness.
     *
     * Increase this value if the suspension appears to not push the vehicle strong enough.
     */
    public wheelSuspensionStiffness(i: number): number | null {
        return this.raw.wheel_suspension_stiffness(i);
    }

    /**
     * Sets the i-th wheel’s suspension stiffness.
     *
     * Increase this value if the suspension appears to not push the vehicle strong enough.
     */
    public setSuspensionStiffness(i: number, value: number) {
        this.raw.set_suspension_stiffness(i, value);
    }

    /**
     * The i-th wheel’s suspension’s damping when it is being compressed.
     */
    public wheelSuspensionCompression(i: number): number | null {
        return this.raw.wheel_suspension_compression(i);
    }

    /**
     * The i-th wheel’s suspension’s damping when it is being compressed.
     */
    public setSuspensionCompression(i: number, value: number) {
        this.raw.set_suspension_compression(i, value);
    }

    /**
     * The i-th wheel’s suspension’s damping when it is being released.
     *
     * Increase this value if the suspension appears to overshoot.
     */
    public wheelSuspensionRelaxation(i: number): number | null {
        return this.raw.wheel_suspension_relaxation(i);
    }

    /**
     * Sets the i-th wheel’s suspension’s damping when it is being released.
     *
     * Increase this value if the suspension appears to overshoot.
     */
    public setSuspensionRelaxation(i: number, value: number) {
        this.raw.set_suspension_relaxation(i, value);
    }

    /**
     * The maximum force applied by the i-th wheel’s suspension.
     */
    public wheelMaxSuspensionForce(i: number): number | null {
        return this.raw.wheel_max_suspension_force(i);
    }

    /**
     * Sets the maximum force applied by the i-th wheel’s suspension.
     */
    public setWheelMaxSuspensionForce(i: number, value: number) {
        this.raw.set_wheel_max_suspension_force(i, value);
    }

    /**
     * The maximum amount of braking impulse applied on the i-th wheel to slow down the vehicle.
     */
    public wheelBrake(i: number): number | null {
        return this.raw.wheel_brake(i);
    }

    /**
     * Set the maximum amount of braking impulse applied on the i-th wheel to slow down the vehicle.
     */
    public setWheelBrake(i: number, value: number) {
        this.raw.set_wheel_brake(i, value);
    }

    /**
     * The steering angle (radians) for the i-th wheel.
     */
    public wheelSteering(i: number): number | null {
        return this.raw.wheel_steering(i);
    }

    /**
     * Sets the steering angle (radians) for the i-th wheel.
     */
    public setWheelSteering(i: number, value: number) {
        this.raw.set_wheel_steering(i, value);
    }

    /**
     * The forward force applied by the i-th wheel on the chassis.
     */
    public wheelEngineForce(i: number): number | null {
        return this.raw.wheel_engine_force(i);
    }

    /**
     * Sets the forward force applied by the i-th wheel on the chassis.
     */
    public setWheelEngineForce(i: number, value: number) {
        this.raw.set_wheel_engine_force(i, value);
    }

    /**
     * The direction of the i-th wheel’s suspension, relative to the chassis.
     *
     * The ray-casting will happen following this direction to detect the ground.
     */
    public wheelDirectionCs(i: number): Vector | null {
        return VectorOps.fromRaw(this.raw.wheel_direction_cs(i));
    }

    /**
     * Sets the direction of the i-th wheel’s suspension, relative to the chassis.
     *
     * The ray-casting will happen following this direction to detect the ground.
     */
    public setWheelDirectionCs(i: number, value: Vector) {
        let rawValue = VectorOps.intoRaw(value);
        this.raw.set_wheel_direction_cs(i, value);
        rawValue.free();
    }

    /**
     * The i-th wheel’s axle axis, relative to the chassis.
     *
     * The axis index defined as 0 = X, 1 = Y, 2 = Z.
     */
    public wheelAxleCs(i: number): Vector | null {
        return  VectorOps.fromRaw(this.raw.wheel_axle_cs(i));
    }

    /**
     * Sets the i-th wheel’s axle axis, relative to the chassis.
     *
     * The axis index defined as 0 = X, 1 = Y, 2 = Z.
     */
    public setWheelAxleCs(i: number, value: Vector) {
        let rawValue = VectorOps.intoRaw(value);
        this.raw.set_wheel_axle_cs(i, value);
        rawValue.free();
    }

    /*
     * Getters only.
     */

    /**
     *  The i-th wheel’s current rotation angle (radians) on its axle.
     */
    public wheelRotation(i: number): number | null {
        return this.raw.wheel_rotation(i);
    }

    /**
     *  The forward impulses applied by the i-th wheel on the chassis.
     */
    public wheelForwardImpulse(i: number): number | null {
        return this.raw.wheel_forward_impulse(i);
    }

    /**
     *  The side impulses applied by the i-th wheel on the chassis.
     */
    public wheelSideImpulse(i: number): number | null {
        return this.raw.wheel_side_impulse(i);
    }

    /**
     *  The force applied by the i-th wheel suspension.
     */
    public wheelSuspensionForce(i: number): number | null {
        return this.raw.wheel_suspension_force(i);
    }
}