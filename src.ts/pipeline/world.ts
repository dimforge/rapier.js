import {
    RawBroadPhase, RawCCDSolver, RawColliderSet,
    RawDeserializedWorld,
    RawIntegrationParameters, RawIslandManager,
    RawJointSet, RawNarrowPhase, RawPhysicsPipeline, RawQueryPipeline,
    RawRigidBodySet, RawSerializationPipeline,
} from "../raw";

import {
    BroadPhase,
    Collider, ColliderDesc,
    ColliderHandle,
    ColliderSet, InteractionGroups,
    NarrowPhase, PointColliderProjection,
    Ray,
    RayColliderIntersection,
    RayColliderToi, Shape, ShapeColliderTOI, TempContactManifold
} from "../geometry";
import {
    CCDSolver,
    IntegrationParameters, IslandManager,
    Joint, JointHandle,
    JointParams,
    JointSet,
    RigidBody,
    RigidBodyDesc,
    RigidBodyHandle,
    RigidBodySet
} from "../dynamics";
import {Rotation, Vector, VectorOps} from "../math";
import {PhysicsPipeline} from "./physics_pipeline";
import {QueryPipeline} from "./query_pipeline";
import {SerializationPipeline} from "./serialization_pipeline";
import {EventQueue} from "./event_queue";
import {PhysicsHooks} from "./physics_hooks";

/**
 * The physics world.
 *
 * This contains all the data-structures necessary for creating and simulating
 * bodies with contacts, joints, and external forces.
 */
export class World {
    public gravity: Vector
    integrationParameters: IntegrationParameters
    islands: IslandManager
    broadPhase: BroadPhase
    narrowPhase: NarrowPhase
    bodies: RigidBodySet
    colliders: ColliderSet
    joints: JointSet
    ccdSolver: CCDSolver
    queryPipeline: QueryPipeline
    physicsPipeline: PhysicsPipeline
    serializationPipeline: SerializationPipeline

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
        this.joints.free();
        this.ccdSolver.free();
        this.queryPipeline.free();
        this.physicsPipeline.free();
        this.serializationPipeline.free();

        this.integrationParameters = undefined;
        this.islands = undefined;
        this.broadPhase = undefined;
        this.narrowPhase = undefined;
        this.bodies = undefined;
        this.colliders = undefined;
        this.ccdSolver = undefined;
        this.joints = undefined;
        this.queryPipeline = undefined;
        this.physicsPipeline = undefined;
        this.serializationPipeline = undefined;
    }

    constructor(
        gravity: Vector,
        rawIntegrationParameters?: RawIntegrationParameters,
        rawIslands?: RawIslandManager,
        rawBroadPhase?: RawBroadPhase,
        rawNarrowPhase?: RawNarrowPhase,
        rawBodies?: RawRigidBodySet,
        rawColliders?: RawColliderSet,
        rawJoints?: RawJointSet,
        rawCCDSolver?: RawCCDSolver,
        rawQueryPipeline?: RawQueryPipeline,
        rawPhysicsPipeline?: RawPhysicsPipeline,
        rawSerializationPipeline?: RawSerializationPipeline
    ) {
        this.gravity = gravity;
        this.integrationParameters = new IntegrationParameters(rawIntegrationParameters);
        this.islands = new IslandManager(rawIslands);
        this.broadPhase = new BroadPhase(rawBroadPhase);
        this.narrowPhase = new NarrowPhase(rawNarrowPhase);
        this.bodies = new RigidBodySet(rawBodies);
        this.colliders = new ColliderSet(rawColliders);
        this.joints = new JointSet(rawJoints);
        this.ccdSolver = new CCDSolver(rawCCDSolver);
        this.queryPipeline = new QueryPipeline(rawQueryPipeline);
        this.physicsPipeline = new PhysicsPipeline(rawPhysicsPipeline);
        this.serializationPipeline = new SerializationPipeline(rawSerializationPipeline);
    }

    public static fromRaw(raw: RawDeserializedWorld): World {
        if (!raw)
            return null;

        return new World(
            VectorOps.fromRaw(raw.takeGravity()),
            raw.takeIntegrationParameters(),
            raw.takeIslandManager(),
            raw.takeBroadPhase(),
            raw.takeNarrowPhase(),
            raw.takeBodies(),
            raw.takeColliders(),
            raw.takeJoints(),
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
            this.joints,
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
            this.joints,
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
     * @param timestep - The timestep length, in milliseconds.
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
     * The maximum position iterations the position-based constraint regularization solver can make.
     */
    get maxPositionIterations(): number {
        return this.integrationParameters.maxPositionIterations;
    }

    /**
     * Sets the maximum number of position iterations (default: 1).
     *
     * The greater this value is, the less penetrations will be visible after one timestep where
     * the velocity solver did not converge entirely. Large values will degrade significantly
     * the performance of the simulation.
     *
     * To increase realism of the simulation it is recommended, more efficient, and more effecive,
     * to increase the number of velocity iterations instead of this number of position iterations.
     *
     * @param niter - The new maximum number of position iterations.
     */
    set maxPositionIterations(niter: number) {
        this.integrationParameters.maxPositionIterations = niter;
    }

    /**
     * Creates a new rigid-body from the given rigd-body descriptior.
     *
     * @param body - The description of the rigid-body to create.
     */
    public createRigidBody(body: RigidBodyDesc): RigidBody {
        return this.bodies.get(this.bodies.createRigidBody(body));
    }

    /**
     * Creates a new collider.
     *
     * @param desc - The description of the collider.
     * @param parentHandle - The handle of the rigid-body this collider is attached to.
     */
    public createCollider(desc: ColliderDesc, parentHandle?: RigidBodyHandle): Collider {
        return this.colliders.get(this.colliders.createCollider(this.bodies, desc, parentHandle));
    }

    /**
     * Creates a new joint from the given joint descriptior.
     *
     * @param joint - The description of the joint to create.
     * @param parent1 - The first rigid-body attached to this joint.
     * @param parent2 - The second rigid-body attached to this joint.
     */
    public createJoint(
        params: JointParams,
        parent1: RigidBody,
        parent2: RigidBody
    ): Joint {
        return this.joints.get(
            this.joints.createJoint(this.bodies, params, parent1.handle, parent2.handle)
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
     * Retrieves a joint from its handle.
     *
     * @param handle - The integer handle of the rigid-body to retrieve.
     */
    public getJoint(handle: JointHandle): Joint {
        return this.joints.get(handle);
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
        this.bodies.remove(
            body.handle,
            this.islands,
            this.colliders,
            this.joints,
        );
    }

    /**
     * Removes the given collider from this physics world.
     *
     * @param collider - The collider to remove.
     * @param wakeUp - If set to `true`, the rigid-body this collider is attached to will be awaken.
     */
    public removeCollider(collider: Collider, wakeUp: boolean) {
        this.colliders.remove(
            collider.handle,
            this.islands,
            this.bodies,
            wakeUp,
        );
    }

    /**
     * Removes the given joint from this physics world.
     *
     * @param joint - The joint to remove.
     * @param wakeUp - If set to `true`, the rigid-bodies attached by this joint will be awaken.
     */
    public removeJoint(joint: Joint, wakeUp: boolean) {
        this.joints.remove(
            joint.handle,
            this.islands,
            this.bodies,
            wakeUp,
        );
    }

    /**
     * Applies the given closure to each collider managed by this physics world.
     *
     * @param f(collider) - The function to apply to each collider managed by this physics world. Called as `f(collider)`.
     */
    public forEachCollider(f: (collider: Collider) => void) {
        this.colliders.forEachCollider(f)
    }

    /**
     * Applies the given closure to the integer handle of each collider managed by this physics world.
     *
     * @param f(handle) - The function to apply to the integer handle of each collider managed by this physics world. Called as `f(collider)`.
     */
    public forEachColliderHandle(f: (handle: ColliderHandle) => void) {
        this.colliders.forEachColliderHandle(f)
    }

    /**
     * Applies the given closure to each rigid-body managed by this physics world.
     *
     * @param f(body) - The function to apply to each rigid-body managed by this physics world. Called as `f(collider)`.
     */
    public forEachRigidBody(f: (body: RigidBody) => void) {
        this.bodies.forEachRigidBody(f)
    }

    /**
     * Applies the given closure to the integer handle of each rigid-body managed by this physics world.
     *
     * @param f(handle) - The function to apply to the integer handle of each rigid-body managed by this physics world. Called as `f(collider)`.
     */
    public forEachRigidBodyHandle(f: (handle: RigidBodyHandle) => void) {
        this.bodies.forEachRigidBodyHandle(f)
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
     * Applies the given closure to the integer handle of each active rigid-body
     * managed by this physics world.
     *
     * After a short time of inactivity, a rigid-body is automatically deactivated ("asleep") by
     * the physics engine in order to save computational power. A sleeping rigid-body never moves
     * unless it is moved manually by the user.
     *
     * @param f(handle) - The function to apply to the integer handle of each active rigid-body managed by this
     *   physics world. Called as `f(collider)`.
     */
    public forEachActiveRigidBodyHandle(f: (handle: RigidBodyHandle) => void) {
        this.islands.forEachActiveRigidBodyHandle(f);
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
     */
    public castRay(
        ray: Ray,
        maxToi: number,
        solid: boolean,
        groups: InteractionGroups
    ): RayColliderToi | null {
        return this.queryPipeline.castRay(this.colliders, ray, maxToi, solid, groups);
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
        groups: InteractionGroups
    ): RayColliderIntersection | null {
        return this.queryPipeline.castRayAndGetNormal(this.colliders, ray, maxToi, solid, groups);
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
    ) {
        this.queryPipeline.intersectionsWithRay(this.colliders, ray, maxToi, solid, groups, callback)
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
        shapePos: &Vector,
        shapeRot: &Rotation,
        shape: &Shape,
        groups: InteractionGroups,
    ): ColliderHandle | null {
        return this.queryPipeline.intersectionWithShape(this.colliders, shapePos, shapeRot, shape, groups);
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
    ): PointColliderProjection | null {
        return this.queryPipeline.projectPoint(this.colliders, point, solid, groups);
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
        callback: (handle: ColliderHandle) => boolean,
    ) {
        this.queryPipeline.intersectionsWithPoint(this.colliders, point, groups, callback);
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
    ): ShapeColliderTOI | null {
        return this.queryPipeline.castShape(this.colliders, shapePos, shapeRot, shapeVel, shape, maxToi, groups);
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
        callback: (handle: ColliderHandle) => boolean,
    ) {
        this.queryPipeline.intersectionsWithShape(this.colliders, shapePos, shapeRot, shape, groups, callback);
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
        callback: (handle: ColliderHandle) => boolean,
    ) {
        this.queryPipeline.collidersWithAabbIntersectingAabb(aabbCenter, aabbHalfExtents, callback);
    }

    /**
     * Enumerates all the colliders potentially in contact with the given collider.
     *
     * @param collider1 - The second collider involved in the contact.
     * @param f - Closure that will be called on each collider that is in contact with `collider1`.
     */
    public contactsWith(collider1: ColliderHandle, f: (collider2: ColliderHandle) => void) {
        this.narrowPhase.contactsWith(collider1, f);
    }

    /**
     * Enumerates all the colliders intersecting the given colliders, assuming one of them
     * is a sensor.
     */
    public intersectionsWith(collider1: ColliderHandle, f: (collider2: ColliderHandle) => void) {
        this.narrowPhase.intersectionsWith(collider1, f);
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
    public contactPair(collider1: ColliderHandle, collider2: ColliderHandle, f: (manifold: TempContactManifold, flipped: boolean) => void) {
        this.narrowPhase.contactPair(collider1, collider2, f);
    }

    /**
     * Returns `true` if `collider1` and `collider2` intersect and at least one of them is a sensor.
     * @param collider1 − The first collider involved in the intersection.
     * @param collider2 − The second collider involved in the intersection.
     */
    public intersectionPair(collider1: ColliderHandle, collider2: ColliderHandle): boolean {
        return this.narrowPhase.intersectionPair(collider1, collider2);
    }

}
