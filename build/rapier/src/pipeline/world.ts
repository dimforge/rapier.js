import {
    RawBroadPhase, RawColliderSet,
    RawDeserializedWorld,
    RawIntegrationParameters,
    RawJointSet, RawNarrowPhase, RawPhysicsPipeline, RawQueryPipeline,
    RawRigidBodySet, RawSerializationPipeline,
    RawVector
} from "@dimforge/rapier-core2d";

import {
    BroadPhase,
    Collider, ColliderDesc,
    ColliderHandle,
    ColliderSet,
    NarrowPhase,
    Ray,
    RayColliderIntersection
} from "../geometry";
import {
    IntegrationParameters,
    Joint,
    JointParams,
    JointSet,
    RigidBody,
    RigidBodyDesc,
    RigidBodyHandle,
    RigidBodySet
} from "../dynamics";
import {Vector} from "../math";
import {PhysicsPipeline} from "./physics_pipeline";
import {QueryPipeline} from "./query_pipeline";
import {SerializationPipeline} from "./serialization_pipeline";
import {EventQueue} from "./event_queue";

export class World {
    gravity: Vector
    integrationParameters: IntegrationParameters
    broadPhase: BroadPhase
    narrowPhase: NarrowPhase
    bodies: RigidBodySet
    colliders: ColliderSet
    joints: JointSet
    queryPipeline: QueryPipeline
    physicsPipeline: PhysicsPipeline
    serializationPipeline: SerializationPipeline

    public free() {
        this.integrationParameters.free();
        this.broadPhase.free();
        this.narrowPhase.free();
        this.bodies.free();
        this.colliders.free();
        this.joints.free();
        this.queryPipeline.free();
        this.physicsPipeline.free();
        this.serializationPipeline.free();

        this.integrationParameters = undefined;
        this.broadPhase = undefined;
        this.narrowPhase = undefined;
        this.bodies = undefined;
        this.colliders = undefined;
        this.joints = undefined;
        this.queryPipeline = undefined;
        this.physicsPipeline = undefined;
        this.serializationPipeline = undefined;
    }

    constructor(
        RAPIER: any,
        gravity: Vector,
        rawIntegrationParameters?: RawIntegrationParameters,
        rawBroadPhase?: RawBroadPhase,
        rawNarrowPhase?: RawNarrowPhase,
        rawBodies?: RawRigidBodySet,
        rawColliders?: RawColliderSet,
        rawJoints?: RawJointSet,
        rawQueryPipeline?: RawQueryPipeline,
        rawPhysicsPipeline?: RawPhysicsPipeline,
        rawSerializationPipeline?: RawSerializationPipeline
    ) {
        this.gravity = gravity;
        this.integrationParameters = new IntegrationParameters(RAPIER, rawIntegrationParameters);
        this.broadPhase = new BroadPhase(RAPIER, rawBroadPhase);
        this.narrowPhase = new NarrowPhase(RAPIER, rawNarrowPhase);
        this.bodies = new RigidBodySet(RAPIER, rawBodies);
        this.colliders = new ColliderSet(RAPIER, rawColliders);
        this.joints = new JointSet(RAPIER, rawJoints);
        this.queryPipeline = new QueryPipeline(RAPIER, rawQueryPipeline);
        this.physicsPipeline = new PhysicsPipeline(RAPIER, rawPhysicsPipeline);
        this.serializationPipeline = new SerializationPipeline(RAPIER, rawSerializationPipeline);
    }

    public static fromRaw(RAPIER: any, raw: RawDeserializedWorld): World {
        if (!raw)
            return null;

        return new World(
            RAPIER,
            Vector.fromRaw(raw.takeGravity()),
            raw.takeIntegrationParameters(),
            raw.takeBroadPhase(),
            raw.takeNarrowPhase(),
            raw.takeBodies(),
            raw.takeColliders(),
            raw.takeJoints(),
            raw.takeQueryPipeline(),
        );
    }

    public takeSnapshot(): Uint8Array {
        return this.serializationPipeline.serializeAll(
            this.gravity,
            this.integrationParameters,
            this.broadPhase,
            this.narrowPhase,
            this.bodies,
            this.colliders,
            this.joints,
            this.queryPipeline
        );
    }

    public static restoreSnapshot(RAPIER: any, data: Uint8Array): World {
        let deser = new SerializationPipeline(RAPIER);
        return deser.deserializeAll(data);
    }

    public step(eventQueue?: EventQueue) {
        this.physicsPipeline.step(
            this.gravity,
            this.integrationParameters,
            this.broadPhase,
            this.narrowPhase,
            this.bodies,
            this.colliders,
            this.joints,
            eventQueue,
        );
        this.queryPipeline.update(this.bodies, this.colliders);
    }

    get timestep(): number {
        return this.integrationParameters.dt;
    }

    set timestep(dt: number) {
        this.integrationParameters.dt = dt;
    }

    get maxVelocityIterations(): number {
        return this.integrationParameters.maxVelocityIterations;
    }

    set maxVelocityIterations(niter: number) {
        this.integrationParameters.maxVelocityIterations = niter;
    }

    get maxPositionIterations(): number {
        return this.integrationParameters.maxPositionIterations;
    }

    set maxPositionIterations(niter: number) {
        this.integrationParameters.maxPositionIterations = niter;
    }

    public createRigidBody(body: RigidBodyDesc): RigidBody {
        return this.bodies.get(this.bodies.createRigidBody(body));
    }

    public createCollider(desc: ColliderDesc, parentHandle: RigidBodyHandle): Collider {
        return this.colliders.get(this.colliders.createCollider(this.bodies, desc, parentHandle));
    }

    public createJoint(
        params: JointParams,
        parent1: RigidBody,
        parent2: RigidBody
    ): Joint {
        return this.joints.get(
            this.joints.createJoint(this.bodies, params, parent1.handle, parent2.handle)
        );
    }

    public getRigidBody(handle: RigidBodyHandle): RigidBody {
        return this.bodies.get(handle);
    }

    public getCollider(handle: ColliderHandle): Collider {
        return this.colliders.get(handle);
    }

    public removeRigidBody(body: RigidBody) {
        this.physicsPipeline.removeRigidBody(
            body.handle,
            this.broadPhase,
            this.narrowPhase,
            this.bodies,
            this.colliders,
            this.joints,
        );
    }

    public removeCollider(collider: Collider) {
        this.physicsPipeline.removeRigidBody(
            collider.handle,
            this.broadPhase,
            this.narrowPhase,
            this.bodies,
            this.colliders,
            this.joints,
        );
    }

    public forEachCollider(f: (collider: Collider) => void) {
        this.colliders.forEachCollider(f)
    }

    public forEachColliderHandle(f: (handle: ColliderHandle) => void) {
        this.colliders.forEachColliderHandle(f)
    }

    public forEachRigidBody(f: (body: RigidBody) => void) {
        this.bodies.forEachRigidBody(f)
    }

    public forEachRigidBodyHandle(f: (handle: RigidBodyHandle) => void) {
        this.bodies.forEachRigidBodyHandle(f)
    }

    public forEachActiveRigidBody(f: (body: RigidBody) => void) {
        this.bodies.forEachActiveRigidBody(f);
    }

    public forEachActiveRigidBodyHandle(f: (handle: RigidBodyHandle) => void) {
        this.bodies.forEachActiveRigidBodyHandle(f);
    }

    public castRay(ray: Ray, maxToi: number): RayColliderIntersection {
        return this.queryPipeline.castRay(this.colliders, ray, maxToi);
    }
}