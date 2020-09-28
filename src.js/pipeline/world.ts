import {BroadPhase, Collider, ColliderSet, NarrowPhase, Ray, RayColliderIntersection} from "../geometry";
import {IntegrationParameters, Joint, JointParams, JointSet, RigidBody, RigidBodyDesc, RigidBodySet} from "../dynamics";
import {Vector} from "../math";
import {PhysicsPipeline} from "./physics_pipeline";
import {QueryPipeline} from "./query_pipeline";
import {SerializationPipeline} from "./serialization_pipeline";
import {RawDeserializedWorld} from "../../build/rapier2d/pkg";

export class EventQueue {
    // FIXME
}

export class World {
    gravity: Vector
    integrationParameters: IntegrationParameters
    broadPhase: BroadPhase
    narrowPhase: NarrowPhase
    bodies: RigidBodySet
    colliders: ColliderSet
    joints: JointSet
    physicsPipeline: PhysicsPipeline
    queryPipeline: QueryPipeline
    serializationPipeline: SerializationPipeline

    public free() {
        this.integrationParameters.free();
        this.broadPhase.free();
        this.narrowPhase.free();
        this.bodies.free();
        this.colliders.free();
        this.joints.free();
        this.physicsPipeline.free();
        this.queryPipeline.free();
        this.serializationPipeline.free();
    }

    /// Initialize a new physics world with zero gravity.
    constructor(RAPIER: any) {
        this.gravity = Vector.zeros();
        this.init(RAPIER);
    }

    // #if DIM2
    constructor(RAPIER: any, gravityX: number, gravityY: number) {
        this.gravity = new Vector(gravityX, gravityY);
        this.init(RAPIER);
    }

    // #endif

    // #if DIM3
    constructor(RAPIER: any, gravityX: number, gravityY: number, gravityZ: number) {
        this.gravity = new Vector(gravityX, gravityY, gravityZ);
        this.init(RAPIER);
    }

    // #endif

    fromRaw(RAPIER: any, raw: RawDeserializedWorld): World {
        if (!raw)
            return null;

        let res = new World(RAPIER);
        res.gravity = Vector.fromRaw(raw.takeGravity());
        res.integrationParameters = raw.takeIntegrationParameters();
        res.broadPhase = raw.takeBroadPhase();
        res.narrowPhase = raw.takeNarrowPhase();
        res.bodies = raw.takeBodies();
        res.colliders = raw.takeColliders();
        res.joints = raw.takeJoints();
        res.queryPipeline = raw.takeQueryPipeline();
        raw.free();
        return res;
    }

    private init(RAPIER: any) {
        this.broadPhase = new BroadPhase(RAPIER);
        this.narrowPhase = new NarrowPhase(RAPIER);
        this.bodies = new RigidBodySet(RAPIER);
        this.colliders = new ColliderSet(RAPIER);
        this.joints = new JointSet(RAPIER);
        this.physicsPipeline = new PhysicsPipeline(RAPIER);
        this.queryPipeline = new QueryPipeline(RAPIER);
        this.serializationPipeline = new SerializationPipeline(RAPIER);
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

    public step() {
        this.physicsPipeline.step(
            this.gravity,
            this.integrationParameters,
            this.broadPhase,
            this.narrowPhase,
            this.bodies,
            this.colliders,
            this.joints
        );
        this.queryPipeline.update(this.bodies, this.colliders);
    }

    public stepWithEvents(eventQueue: EventQueue) {
        throw new Error("Unimplemented");
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

    public createJoint(
        params: JointParams,
        parent1: RigidBody,
        parent2: RigidBody
    ): Joint {
        return this.joints.get(
            this.joints.createJoint(this.bodies, params, parent1.handle, parent2.handle)
        );
    }

    public getRigidBody(handle: number): RigidBody {
        return this.bodies.get(handle);
    }

    public getCollider(handle: number): Collider {
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

    public forEachCollider(f: (Collider) => void) {
        this.colliders.forEachCollider(f)
    }

    public forEachColliderHandle(f: (number) => void) {
        this.colliders.forEachColliderHandle(f)
    }

    public forEachRigidBody(f: (RigidBody) => void) {
        this.bodies.forEachRigidBody(f)
    }

    public forEachRigidBodyHandle(f: (number) => void) {
        this.bodies.forEachRigidBodyHandle(f)
    }

    public forEachActiveRigidBody(f: (RigidBody) => void) {
        this.bodies.forEachActiveRigidBody(f);
    }

    public forEachActiveRigidBodyHandle(f: (number) => void) {
        this.bodies.forEachActiveRigidBodyHandle(f);
    }

    public castRay(ray: Ray, maxToi: number): RayColliderIntersection {
        return this.queryPipeline.castRay(this.colliders, ray, maxToi);
    }
}