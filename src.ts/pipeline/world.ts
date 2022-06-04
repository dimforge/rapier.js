import {
    RawBroadPhase,
    RawCCDSolver,
    RawColliderSet,
    RawDeserializedWorld,
    RawIntegrationParameters,
    RawIslandManager,
    RawImpulseJointSet,
    RawMultibodyJointSet,
    RawNarrowPhase,
    RawPhysicsPipeline,
    RawQueryPipeline,
    RawRigidBodySet,
    RawSerializationPipeline,
    RawDebugRenderPipeline,
} from "../raw";

import {
    BroadPhase,
    Collider,
    ColliderDesc,
    ColliderHandle,
    ColliderSet,
    InteractionGroups,
    NarrowPhase,
    PointColliderProjection,
    Ray,
    RayColliderIntersection,
    RayColliderToi,
    Shape,
    ShapeColliderTOI,
    TempContactManifold,
} from "../geometry";
import {
    CCDSolver,
    IntegrationParameters,
    IslandManager,
    ImpulseJoint,
    ImpulseJointHandle,
    MultibodyJoint,
    MultibodyJointHandle,
    JointData,
    ImpulseJointSet,
    MultibodyJointSet,
    RigidBody,
    RigidBodyDesc,
    RigidBodyHandle,
    RigidBodySet,
} from "../dynamics";
import {Rotation, Vector, VectorOps} from "../math";
import {PhysicsPipeline} from "./physics_pipeline";
import {QueryPipeline} from "./query_pipeline";
import {SerializationPipeline} from "./serialization_pipeline";
import {EventQueue} from "./event_queue";
import {PhysicsHooks} from "./physics_hooks";
import {DebugRenderBuffers, DebugRenderPipeline} from "./debug_render_pipeline";

/**
 * The physics world.
 *
 * This contains all the data-structures necessary for creating and simulating
 * bodies with contacts, joints, and external forces.
 */
export class World {
    public gravity: Vector;
    integrationParameters: IntegrationParameters;
    islands: IslandManager;
    broadPhase: BroadPhase;
    narrowPhase: NarrowPhase;
    bodies: RigidBodySet;
    colliders: ColliderSet;
    impulseJoints: ImpulseJointSet;
    multibodyJoints: MultibodyJointSet;
    ccdSolver: CCDSolver;
    queryPipeline: QueryPipeline;
    physicsPipeline: PhysicsPipeline;
    serializationPipeline: SerializationPipeline;
    debugRenderPipeline: DebugRenderPipeline;

    /**
     * Release the WASM memory occupied by this physics world.
     *
     * All the fields of this physics world will be freed as well,
     * so there is no need to call their `.free()` methods individually.
     */
    public free() {
        this.integrationParameters.free();
        this.islands.free();
        this.broadPhase.free();
        this.narrowPhase.free();
        this.bodies.free();
        this.colliders.free();
        this.impulseJoints.free();
        this.multibodyJoints.free();
        this.ccdSolver.free();
        this.queryPipeline.free();
        this.physicsPipeline.free();
        this.serializationPipeline.free();
        this.debugRenderPipeline.free();

        this.integrationParameters = undefined;
        this.islands = undefined;
        this.broadPhase = undefined;
        this.narrowPhase = undefined;
        this.bodies = undefined;
        this.colliders = undefined;
        this.ccdSolver = undefined;
        this.impulseJoints = undefined;
        this.multibodyJoints = undefined;
        this.queryPipeline = undefined;
        this.physicsPipeline = undefined;
        this.serializationPipeline = undefined;
        this.debugRenderPipeline = undefined;
    }

    constructor(
        gravity: Vector,
        rawIntegrationParameters?: RawIntegrationParameters,
        rawIslands?: RawIslandManager,
        rawBroadPhase?: RawBroadPhase,
        rawNarrowPhase?: RawNarrowPhase,
        rawBodies?: RawRigidBodySet,
        rawColliders?: RawColliderSet,
        rawImpulseJoints?: RawImpulseJointSet,
        rawMultibodyJoints?: RawMultibodyJointSet,
        rawCCDSolver?: RawCCDSolver,
        rawQueryPipeline?: RawQueryPipeline,
        rawPhysicsPipeline?: RawPhysicsPipeline,
        rawSerializationPipeline?: RawSerializationPipeline,
        rawDebugRenderPipeline?: RawDebugRenderPipeline,
    ) {
        this.gravity = gravity;
        this.integrationParameters = new IntegrationParameters(
            rawIntegrationParameters,
        );
        this.islands = new IslandManager(rawIslands);
        this.broadPhase = new BroadPhase(rawBroadPhase);
        this.narrowPhase = new NarrowPhase(rawNarrowPhase);
        this.bodies = new RigidBodySet(rawBodies);
        this.colliders = new ColliderSet(rawColliders);
        this.impulseJoints = new ImpulseJointSet(rawImpulseJoints);
        this.multibodyJoints = new MultibodyJointSet(rawMultibodyJoints);
        this.ccdSolver = new CCDSolver(rawCCDSolver);
        this.queryPipeline = new QueryPipeline(rawQueryPipeline);
        this.physicsPipeline = new PhysicsPipeline(rawPhysicsPipeline);
        this.serializationPipeline = new SerializationPipeline(
            rawSerializationPipeline,
        );
        this.debugRenderPipeline = new DebugRenderPipeline(
            rawDebugRenderPipeline,
        );

        this.impulseJoints.finalizeDeserialization(this.bodies);
        this.bodies.finalizeDeserialization(this.colliders);
        this.colliders.finalizeDeserialization(this.bodies);
    }

    public static fromRaw(raw: RawDeserializedWorld): World {
        if (!raw) return null;

        return new World(
            VectorOps.fromRaw(raw.takeGravity()),
            raw.takeIntegrationParameters(),
            raw.takeIslandManager(),
            raw.takeBroadPhase(),
            raw.takeNarrowPhase(),
            raw.takeBodies(),
            raw.takeColliders(),
            raw.takeImpulseJoints(),
            raw.takeMultibodyJoints(),
        );
    }

    /**
     * Takes a snapshot of this world.
     *
     * Use `World.restoreSnapshot` to create a new physics world with a state identical to
     * the state when `.takeSnapshot()` is called.
     */
    public takeSnapshot(): Uint8Array {
        return this.serializationPipeline.serializeAll(
            this.gravity,
            this.integrationParameters,
            this.islands,
            this.broadPhase,
            this.narrowPhase,
            this.bodies,
            this.colliders,
            this.impulseJoints,
            this.multibodyJoints,
        );
    }

    /**
     * Creates a new physics world from a snapshot.
     *
     * This new physics world will be an identical copy of the snapshoted physics world.
     */
    public static restoreSnapshot(data: Uint8Array): World {
        let deser = new SerializationPipeline();
        return deser.deserializeAll(data);
    }

    /**
     * Computes all the lines (and their colors) needed to render the scene.
     */
    public debugRender(): DebugRenderBuffers {
        this.debugRenderPipeline.render(
            this.bodies,
            this.colliders,
            this.impulseJoints,
            this.multibodyJoints,
            this.narrowPhase,
        );
        return new DebugRenderBuffers(
            this.debugRenderPipeline.vertices,
            this.debugRenderPipeline.colors,
        );
    }

    /**
     * Advance the simulation by one time step.
     *
     * All events generated by the physics engine are ignored.
     *
     * @param EventQueue - (optional) structure responsible for collecting
     *   events generated by the physics engine.
     */
    public step(eventQueue?: EventQueue, hooks?: PhysicsHooks) {
        this.physicsPipeline.step(
            this.gravity,
            this.integrationParameters,
            this.islands,
            this.broadPhase,
            this.narrowPhase,
            this.bodies,
            this.colliders,
            this.impulseJoints,
            this.multibodyJoints,
            this.ccdSolver,
            eventQueue,
            hooks,
        );
        this.queryPipeline.update(this.islands, this.bodies, this.colliders);
    }

    /**
     * The current simulation timestep.
     */
    get timestep(): number {
        return this.integrationParameters.dt;
    }

    /**
     * Sets the new simulation timestep.
     *
     * The simulation timestep governs by how much the physics state of the world will
     * be integrated. A simulation timestep should:
     * - be as small as possible. Typical values evolve around 0.016 (assuming the chosen unit is milliseconds,
     * corresponds to the time between two frames of a game running at 60FPS).
     * - not vary too much during the course of the simulation. A timestep with large variations may
     * cause instabilities in the simulation.
     *
     * @param dt - The timestep length, in seconds.
     */
    set timestep(dt: number) {
        this.integrationParameters.dt = dt;
    }

    /**
     * The maximum velocity iterations the velocity-based force constraint solver can make.
     */
    get maxVelocityIterations(): number {
        return this.integrationParameters.maxVelocityIterations;
    }

    /**
     * Sets the maximum number of velocity iterations (default: 4).
     *
     * The greater this value is, the most rigid and realistic the physics simulation will be.
     * However a greater number of iterations is more computationally intensive.
     *
     * @param niter - The new maximum number of velocity iterations.
     */
    set maxVelocityIterations(niter: number) {
        this.integrationParameters.maxVelocityIterations = niter;
    }

    /**
     * The maximum velocity iterations the velocity-based friction constraint solver can make.
     */
    get maxVelocityFrictionIterations(): number {
        return this.integrationParameters.maxVelocityFrictionIterations;
    }

    /**
     * Sets the maximum number of velocity iterations for friction (default: 8).
     *
     * The greater this value is, the most realistic friction will be.
     * However a greater number of iterations is more computationally intensive.
     *
     * @param niter - The new maximum number of velocity iterations.
     */
    set maxVelocityFrictionIterations(niter: number) {
        this.integrationParameters.maxVelocityFrictionIterations = niter;
    }

    /**
     * The maximum velocity iterations the velocity-based constraint solver can make to attempt to remove
     * the energy introduced by constraint stabilization.
     */
    get maxStabilizationIterations(): number {
        return this.integrationParameters.maxStabilizationIterations;
    }

    /**
     * Sets the maximum number of velocity iterations for stabilization (default: 1).
     *
     * @param niter - The new maximum number of velocity iterations.
     */
    set maxStabilizationIterations(niter: number) {
        this.integrationParameters.maxStabilizationIterations = niter;
    }

    /**
     * Creates a new rigid-body from the given rigd-body descriptior.
     *
     * @param body - The description of the rigid-body to create.
     */
    public createRigidBody(body: RigidBodyDesc): RigidBody {
        return this.bodies.createRigidBody(this.colliders, body);
    }

    /**
     * Creates a new collider.
     *
     * @param desc - The description of the collider.
     * @param parent - The rigid-body this collider is attached to.
     */
    public createCollider(desc: ColliderDesc, parent?: RigidBody): Collider {
        let parentHandle = parent ? parent.handle : undefined;
        return this.colliders.createCollider(this.bodies, desc, parentHandle);
    }

    /**
     * Creates a new impulse joint from the given joint descriptor.
     *
     * @param params - The description of the joint to create.
     * @param parent1 - The first rigid-body attached to this joint.
     * @param parent2 - The second rigid-body attached to this joint.
     * @param wakeUp - Should the attached rigid-bodies be awakened?
     */
    public createImpulseJoint(
        params: JointData,
        parent1: RigidBody,
        parent2: RigidBody,
        wakeUp: boolean,
    ): ImpulseJoint {
        return this.impulseJoints.createJoint(
            this.bodies,
            params,
            parent1.handle,
            parent2.handle,
            wakeUp,
        );
    }

    /**
     * Creates a new multibody joint from the given joint descriptor.
     *
     * @param params - The description of the joint to create.
     * @param parent1 - The first rigid-body attached to this joint.
     * @param parent2 - The second rigid-body attached to this joint.
     * @param wakeUp - Should the attached rigid-bodies be awakened?
     */
    public createMultibodyJoint(
        params: JointData,
        parent1: RigidBody,
        parent2: RigidBody,
        wakeUp: boolean,
    ): MultibodyJoint {
        return this.multibodyJoints.createJoint(
            params,
            parent1.handle,
            parent2.handle,
            wakeUp,
        );
    }

    /**
     * Retrieves a rigid-body from its handle.
     *
     * @param handle - The integer handle of the rigid-body to retrieve.
     */
    public getRigidBody(handle: RigidBodyHandle): RigidBody {
        return this.bodies.get(handle);
    }

    /**
     * Retrieves a collider from its handle.
     *
     * @param handle - The integer handle of the collider to retrieve.
     */
    public getCollider(handle: ColliderHandle): Collider {
        return this.colliders.get(handle);
    }

    /**
     * Retrieves an impulse joint from its handle.
     *
     * @param handle - The integer handle of the impulse joint to retrieve.
     */
    public getImpulseJoint(handle: ImpulseJointHandle): ImpulseJoint {
        return this.impulseJoints.get(handle);
    }

    /**
     * Retrieves an multibody joint from its handle.
     *
     * @param handle - The integer handle of the multibody joint to retrieve.
     */
    public getMultibodyJoint(handle: MultibodyJointHandle): MultibodyJoint {
        return this.multibodyJoints.get(handle);
    }

    /**
     * Removes the given rigid-body from this physics world.
     *
     * This will remove this rigid-body as well as all its attached colliders and joints.
     * Every other bodies touching or attached by joints to this rigid-body will be woken-up.
     *
     * @param body - The rigid-body to remove.
     */
    public removeRigidBody(body: RigidBody) {
        if (this.bodies) {
            this.bodies.remove(
                body.handle,
                this.islands,
                this.colliders,
                this.impulseJoints,
                this.multibodyJoints,
            );
        }
    }

    /**
     * Removes the given collider from this physics world.
     *
     * @param collider - The collider to remove.
     * @param wakeUp - If set to `true`, the rigid-body this collider is attached to will be awaken.
     */
    public removeCollider(collider: Collider, wakeUp: boolean) {
        if (this.colliders) {
            this.colliders.remove(
                collider.handle,
                this.islands,
                this.bodies,
                wakeUp,
            );
        }
    }

    /**
     * Removes the given impulse joint from this physics world.
     *
     * @param joint - The impulse joint to remove.
     * @param wakeUp - If set to `true`, the rigid-bodies attached by this joint will be awaken.
     */
    public removeImpulseJoint(joint: ImpulseJoint, wakeUp: boolean) {
        if (this.impulseJoints) {
            this.impulseJoints.remove(joint.handle, wakeUp);
        }
    }

    /**
     * Removes the given multibody joint from this physics world.
     *
     * @param joint - The multibody joint to remove.
     * @param wakeUp - If set to `true`, the rigid-bodies attached by this joint will be awaken.
     */
    public removeMultibodyJoint(joint: MultibodyJoint, wakeUp: boolean) {
        if (this.impulseJoints) {
            this.multibodyJoints.remove(joint.handle, wakeUp);
        }
    }

    /**
     * Applies the given closure to each collider managed by this physics world.
     *
     * @param f(collider) - The function to apply to each collider managed by this physics world. Called as `f(collider)`.
     */
    public forEachCollider(f: (collider: Collider) => void) {
        this.colliders.forEach(f);
    }

    /**
     * Applies the given closure to each rigid-body managed by this physics world.
     *
     * @param f(body) - The function to apply to each rigid-body managed by this physics world. Called as `f(collider)`.
     */
    public forEachRigidBody(f: (body: RigidBody) => void) {
        this.bodies.forEach(f);
    }

    /**
     * Applies the given closure to each active rigid-body managed by this physics world.
     *
     * After a short time of inactivity, a rigid-body is automatically deactivated ("asleep") by
     * the physics engine in order to save computational power. A sleeping rigid-body never moves
     * unless it is moved manually by the user.
     *
     * @param f - The function to apply to each active rigid-body managed by this physics world. Called as `f(collider)`.
     */
    public forEachActiveRigidBody(f: (body: RigidBody) => void) {
        this.bodies.forEachActiveRigidBody(this.islands, f);
    }

    /**
     * Find the closest intersection between a ray and the physics world.
     *
     * @param ray - The ray to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the length of the ray to `ray.dir.norm() * maxToi`.
     * @param solid - If `false` then the ray will attempt to hit the boundary of a shape, even if its
     *   origin already lies inside of a shape. In other terms, `true` implies that all shapes are plain,
     *   whereas `false` implies that all shapes are hollow for this ray-cast.
     * @param groups - Used to filter the colliders that can or cannot be hit by the ray.
     * @param filter - The callback to filter out which collider will be hit.
     */
    public castRay(
        ray: Ray,
        maxToi: number,
        solid: boolean,
        groups: InteractionGroups,
        filter?: (collider: Collider) => boolean,
    ): RayColliderToi | null {
        return this.queryPipeline.castRay(
            this.colliders,
            ray,
            maxToi,
            solid,
            groups,
            castClosure(this.colliders, filter),
        );
    }

    /**
     * Find the closest intersection between a ray and the physics world.
     *
     * This also computes the normal at the hit point.
     * @param ray - The ray to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the length of the ray to `ray.dir.norm() * maxToi`.
     * @param solid - If `false` then the ray will attempt to hit the boundary of a shape, even if its
     *   origin already lies inside of a shape. In other terms, `true` implies that all shapes are plain,
     *   whereas `false` implies that all shapes are hollow for this ray-cast.
     * @param groups - Used to filter the colliders that can or cannot be hit by the ray.
     */
    public castRayAndGetNormal(
        ray: Ray,
        maxToi: number,
        solid: boolean,
        groups: InteractionGroups,
        filter?: (collider: Collider) => boolean,
    ): RayColliderIntersection | null {
        return this.queryPipeline.castRayAndGetNormal(
            this.colliders,
            ray,
            maxToi,
            solid,
            groups,
            castClosure(this.colliders, filter),
        );
    }

    /**
     * Cast a ray and collects all the intersections between a ray and the scene.
     *
     * @param ray - The ray to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the length of the ray to `ray.dir.norm() * maxToi`.
     * @param solid - If `false` then the ray will attempt to hit the boundary of a shape, even if its
     *   origin already lies inside of a shape. In other terms, `true` implies that all shapes are plain,
     *   whereas `false` implies that all shapes are hollow for this ray-cast.
     * @param groups - Used to filter the colliders that can or cannot be hit by the ray.
     * @param callback - The callback called once per hit (in no particular order) between a ray and a collider.
     *   If this callback returns `false`, then the cast will stop and no further hits will be detected/reported.
     */
    public intersectionsWithRay(
        ray: Ray,
        maxToi: number,
        solid: boolean,
        groups: InteractionGroups,
        callback: (intersect: RayColliderIntersection) => boolean,
        filter?: (collider: Collider) => boolean,
    ) {
        this.queryPipeline.intersectionsWithRay(
            this.colliders,
            ray,
            maxToi,
            solid,
            groups,
            callback,
            castClosure(this.colliders, filter),
        );
    }

    /**
     * Gets the handle of up to one collider intersecting the given shape.
     *
     * @param shapePos - The position of the shape used for the intersection test.
     * @param shapeRot - The orientation of the shape used for the intersection test.
     * @param shape - The shape used for the intersection test.
     * @param groups - The bit groups and filter associated to the ray, in order to only
     *   hit the colliders with collision groups compatible with the ray's group.
     */
    public intersectionWithShape(
        shapePos: Vector,
        shapeRot: Rotation,
        shape: Shape,
        groups: InteractionGroups,
        filter?: (collider: Collider) => boolean,
    ): Collider | null {
        let handle = this.queryPipeline.intersectionWithShape(
            this.colliders,
            shapePos,
            shapeRot,
            shape,
            groups,
            castClosure(this.colliders, filter),
        );
        return handle != null ? this.colliders.get(handle) : null;
    }

    /**
     * Find the projection of a point on the closest collider.
     *
     * @param point - The point to project.
     * @param solid - If this is set to `true` then the collider shapes are considered to
     *   be plain (if the point is located inside of a plain shape, its projection is the point
     *   itself). If it is set to `false` the collider shapes are considered to be hollow
     *   (if the point is located inside of an hollow shape, it is projected on the shape's
     *   boundary).
     * @param groups - The bit groups and filter associated to the point to project, in order to only
     *   project on colliders with collision groups compatible with the ray's group.
     */
    public projectPoint(
        point: Vector,
        solid: boolean,
        groups: InteractionGroups,
        filter?: (collider: Collider) => boolean,
    ): PointColliderProjection | null {
        return this.queryPipeline.projectPoint(
            this.colliders,
            point,
            solid,
            groups,
            castClosure(this.colliders, filter),
        );
    }

    /**
     * Find the projection of a point on the closest collider.
     *
     * @param point - The point to project.
     * @param groups - The bit groups and filter associated to the point to project, in order to only
     *   project on colliders with collision groups compatible with the ray's group.
     */
    public projectPointAndGetFeature(
        point: Vector,
        groups: InteractionGroups,
    ): PointColliderProjection | null {
        return this.queryPipeline.projectPointAndGetFeature(
            this.colliders,
            point,
            groups,
        );
    }

    /**
     * Find all the colliders containing the given point.
     *
     * @param point - The point used for the containment test.
     * @param groups - The bit groups and filter associated to the point to test, in order to only
     *   test on colliders with collision groups compatible with the ray's group.
     * @param callback - A function called with the handles of each collider with a shape
     *   containing the `point`.
     */
    public intersectionsWithPoint(
        point: Vector,
        groups: InteractionGroups,
        callback: (handle: Collider) => boolean,
        filter?: (collider: Collider) => boolean,
    ) {
        this.queryPipeline.intersectionsWithPoint(
            this.colliders,
            point,
            groups,
            castClosure(this.colliders, callback),
            castClosure(this.colliders, filter),
        );
    }

    /**
     * Casts a shape at a constant linear velocity and retrieve the first collider it hits.
     * This is similar to ray-casting except that we are casting a whole shape instead of
     * just a point (the ray origin).
     *
     * @param shapePos - The initial position of the shape to cast.
     * @param shapeRot - The initial rotation of the shape to cast.
     * @param shapeVel - The constant velocity of the shape to cast (i.e. the cast direction).
     * @param shape - The shape to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the distance traveled by the shape to `shapeVel.norm() * maxToi`.
     * @param groups - The bit groups and filter associated to the shape to cast, in order to only
     *   test on colliders with collision groups compatible with this group.
     */
    public castShape(
        shapePos: Vector,
        shapeRot: Rotation,
        shapeVel: Vector,
        shape: Shape,
        maxToi: number,
        groups: InteractionGroups,
        filter?: (collider: Collider) => boolean,
    ): ShapeColliderTOI | null {
        return this.queryPipeline.castShape(
            this.colliders,
            shapePos,
            shapeRot,
            shapeVel,
            shape,
            maxToi,
            groups,
            castClosure(this.colliders, filter),
        );
    }

    /**
     * Retrieve all the colliders intersecting the given shape.
     *
     * @param shapePos - The position of the shape to test.
     * @param shapeRot - The orientation of the shape to test.
     * @param shape - The shape to test.
     * @param groups - The bit groups and filter associated to the shape to test, in order to only
     *   test on colliders with collision groups compatible with this group.
     * @param callback - A function called with the handles of each collider intersecting the `shape`.
     */
    public intersectionsWithShape(
        shapePos: Vector,
        shapeRot: Rotation,
        shape: Shape,
        groups: InteractionGroups,
        callback: (handle: Collider) => boolean,
        filter?: (collider: Collider) => boolean,
    ) {
        this.queryPipeline.intersectionsWithShape(
            this.colliders,
            shapePos,
            shapeRot,
            shape,
            groups,
            castClosure(this.colliders, callback),
            castClosure(this.colliders, filter),
        );
    }

    /**
     * Finds the handles of all the colliders with an AABB intersecting the given AABB.
     *
     * @param aabbCenter - The center of the AABB to test.
     * @param aabbHalfExtents - The half-extents of the AABB to test.
     * @param callback - The callback that will be called with the handles of all the colliders
     *                   currently intersecting the given AABB.
     */
    public collidersWithAabbIntersectingAabb(
        aabbCenter: Vector,
        aabbHalfExtents: Vector,
        callback: (handle: Collider) => boolean,
    ) {
        this.queryPipeline.collidersWithAabbIntersectingAabb(
            aabbCenter,
            aabbHalfExtents,
            castClosure(this.colliders, callback),
        );
    }

    /**
     * Enumerates all the colliders potentially in contact with the given collider.
     *
     * @param collider1 - The second collider involved in the contact.
     * @param f - Closure that will be called on each collider that is in contact with `collider1`.
     */
    public contactsWith(collider1: Collider, f: (collider2: Collider) => void) {
        this.narrowPhase.contactsWith(
            collider1.handle,
            castClosure(this.colliders, f),
        );
    }

    /**
     * Enumerates all the colliders intersecting the given colliders, assuming one of them
     * is a sensor.
     */
    public intersectionsWith(
        collider1: Collider,
        f: (collider2: Collider) => void,
    ) {
        this.narrowPhase.intersectionsWith(
            collider1.handle,
            castClosure(this.colliders, f),
        );
    }

    /**
     * Iterates through all the contact manifolds between the given pair of colliders.
     *
     * @param collider1 - The first collider involved in the contact.
     * @param collider2 - The second collider involved in the contact.
     * @param f - Closure that will be called on each contact manifold between the two colliders. If the second argument
     *            passed to this closure is `true`, then the contact manifold data is flipped, i.e., methods like `localNormal1`
     *            actually apply to the `collider2` and fields like `localNormal2` apply to the `collider1`.
     */
    public contactPair(
        collider1: Collider,
        collider2: Collider,
        f: (manifold: TempContactManifold, flipped: boolean) => void,
    ) {
        this.narrowPhase.contactPair(collider1.handle, collider2.handle, f);
    }

    /**
     * Returns `true` if `collider1` and `collider2` intersect and at least one of them is a sensor.
     * @param collider1 − The first collider involved in the intersection.
     * @param collider2 − The second collider involved in the intersection.
     */
    public intersectionPair(collider1: Collider, collider2: Collider): boolean {
        return this.narrowPhase.intersectionPair(
            collider1.handle,
            collider2.handle,
        );
    }
}

function castClosure<Res>(
    set: ColliderSet,
    f?: (collider: Collider) => Res,
): (handle: ColliderHandle) => Res | undefined {
    return (handle) => {
        if (!!f) {
            return f(set.get(handle));
        } else {
            return undefined;
        }
    };
}
