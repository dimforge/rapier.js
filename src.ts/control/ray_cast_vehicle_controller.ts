import {RawKinematicCharacterController, RawDynamicRayCastVehicleController} from "../raw";
import {Rotation, Vector, VectorOps} from "../math";
import {Collider, ColliderSet, InteractionGroups, Shape} from "../geometry";
import {QueryFilterFlags, QueryPipeline, World} from "../pipeline";
import {IntegrationParameters, RigidBody, RigidBodyHandle, RigidBodySet} from "../dynamics";

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

    public currentVehicleSpeed(): number {
        return this.raw.current_vehicle_speed();
    }

    public chassis(): RigidBodyHandle {
        return this.raw.chassis();
    }

    get indexUpAxis(): number {
        return this.raw.index_up_axis();
    }
    set indexUpAxis(axis: number) {
        this.raw.set_index_up_axis(axis);
    }

    get indexForwardAxis(): number {
        return this.raw.index_forward_axis();
    }
    set setIndexForwardAxis(axis: number) {
        this.raw.set_index_forward_axis(axis);
    }

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
    public wheelChassisConnectionPointCs(i: number): Vector | null {
        return VectorOps.fromRaw(this.raw.wheel_chassis_connection_point_cs(i));
    }
    public setWheelChassisConnectionPointCs(i: number, value: Vector) {
        let rawValue = VectorOps.intoRaw(value);
        this.raw.set_wheel_chassis_connection_point_cs(i, value);
        rawValue.free();
    }

    public wheelSuspensionRestLength(i: number): number | null {
        return this.raw.wheel_suspension_rest_length(i);
    }
    public setWheelSuspensionRestLength(i: number, value: number) {
        this.raw.set_wheel_suspension_rest_length(i, value);
    }

    public wheelMaxSuspensionTravel(i: number): number | null {
        return this.raw.wheel_max_suspension_travel(i);
    }
    public setMaxSuspensionTravel(i: number, value: number) {
        this.raw.set_max_suspension_travel(i, value);
    }

    public wheelRadius(i: number): number | null {
        return this.raw.wheel_radius(i);
    }
    public setWheelRadius(i: number, value: number) {
        this.raw.set_wheel_radius(i, value);
    }

    public wheelSuspensionStiffness(i: number): number | null {
        return this.raw.wheel_suspension_stiffness(i);
    }
    public setSuspensionStiffness(i: number, value: number) {
        this.raw.set_suspension_stiffness(i, value);
    }

    public wheelSuspensionCompression(i: number): number | null {
        return this.raw.wheel_suspension_compression(i);
    }
    public setSuspensionCompression(i: number, value: number) {
        this.raw.set_suspension_compression(i, value);
    }

    public wheelSuspensionRelaxation(i: number): number | null {
        return this.raw.wheel_suspension_relaxation(i);
    }
    public setSuspensionRelaxation(i: number, value: number) {
        this.raw.set_suspension_relaxation(i, value);
    }

    public wheelMaxSuspensionForce(i: number): number | null {
        return this.raw.wheel_max_suspension_force(i);
    }
    public setWheelMaxSuspensionForce(i: number, value: number) {
        this.raw.set_wheel_max_suspension_force(i, value);
    }

    public wheelBrake(i: number): number | null {
        return this.raw.wheel_brake(i);
    }
    public setWheelBrake(i: number, value: number) {
        this.raw.set_wheel_brake(i, value);
    }

    public wheelSteering(i: number): number | null {
        return this.raw.wheel_steering(i);
    }
    public setWheelSteering(i: number, value: number) {
        this.raw.set_wheel_steering(i, value);
    }

    public wheelEngineForce(i: number): number | null {
        return this.raw.wheel_engine_force(i);
    }
    public setWheelEngineForce(i: number, value: number) {
        this.raw.set_wheel_engine_force(i, value);
    }

    public wheelDirectionCs(i: number): Vector | null {
        return VectorOps.fromRaw(this.raw.wheel_direction_cs(i));
    }
    public setWheelDirectionCs(i: number, value: Vector) {
        let rawValue = VectorOps.intoRaw(value);
        this.raw.set_wheel_direction_cs(i, value);
        rawValue.free();
    }

    public wheelAxleCs(i: number): Vector | null {
        return  VectorOps.fromRaw(this.raw.wheel_axle_cs(i));
    }
    public setWheelAxleCs(i: number, value: Vector) {
        let rawValue = VectorOps.intoRaw(value);
        this.raw.set_wheel_axle_cs(i, value);
        rawValue.free();
    }

    /*
     * Getters only.
     */
    public wheelRotation(i: number): number | null {
        return this.raw.wheel_rotation(i);
    }

    public wheelForwardImpulse(i: number): number | null {
        return this.raw.wheel_forward_impulse(i);
    }

    public wheelSideImpulse(i: number): number | null {
        return this.raw.wheel_side_impulse(i);
    }

    public wheelSuspensionForce(i: number): number | null {
        return this.raw.wheel_suspension_force(i);
    }
}