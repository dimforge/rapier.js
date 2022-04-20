import { RawColliderSet } from "../raw"
import { Rotation, RotationOps, Vector, VectorOps } from '../math';
import { CoefficientCombineRule, RigidBodyHandle } from '../dynamics';
import { ActiveHooks, ActiveEvents } from "../pipeline";
import { InteractionGroups } from './interaction_groups';
import {
    Shape,
    Cuboid, Ball, ShapeType, Capsule, TriMesh, Polyline, Heightfield,
    Segment, Triangle, RoundTriangle, RoundCuboid,
    // #if DIM2
    ConvexPolygon, RoundConvexPolygon,
    // #endif
    // #if DIM3
    Cylinder, RoundCylinder, Cone, RoundCone,
    ConvexPolyhedron, RoundConvexPolyhedron,
    // #endif
} from './shape';
import { Ray, RayIntersection } from "./ray";
import { PointProjection } from "./point";
import { ShapeColliderTOI, ShapeTOI } from "./toi";
import { ShapeContact } from "./contact";

/// Flags affecting whether or not collision-detection happens between two colliders
/// depending on the type of rigid-bodies they are attached to.
export enum ActiveCollisionTypes {
    /// Enable collision-detection between a collider attached to a dynamic body
    /// and another collider attached to a dynamic body.
    DYNAMIC_DYNAMIC = 0b0000_0000_0000_0001,
    /// Enable collision-detection between a collider attached to a dynamic body
    /// and another collider attached to a kinematic body.
    DYNAMIC_KINEMATIC = 0b0000_0000_0000_1100,
    /// Enable collision-detection between a collider attached to a dynamic body
    /// and another collider attached to a static body (or not attached to any body).
    DYNAMIC_STATIC = 0b0000_0000_0000_0010,
    /// Enable collision-detection between a collider attached to a kinematic body
    /// and another collider attached to a kinematic body.
    KINEMATIC_KINEMATIC = 0b1100_1100_0000_0000,

    /// Enable collision-detection between a collider attached to a kinematic body
    /// and another collider attached to a static body (or not attached to any body).
    KINEMATIC_STATIC = 0b0010_0010_0000_0000,

    /// Enable collision-detection between a collider attached to a static body (or
    /// not attached to any body) and another collider attached to a static body (or
    /// not attached to any body).
    STATIC_STATIC = 0b0000_0000_0010_0000,
    /// The default active collision types, enabling collisions between a dynamic body
    /// and another body of any type, but not enabling collisions between two non-dynamic bodies.
    DEFAULT = DYNAMIC_KINEMATIC | DYNAMIC_DYNAMIC | DYNAMIC_STATIC,
    /// Enable collisions between any kind of rigid-bodies (including between two non-dynamic bodies).
    ALL = DYNAMIC_KINEMATIC | DYNAMIC_DYNAMIC | DYNAMIC_STATIC | KINEMATIC_KINEMATIC | KINEMATIC_STATIC |
    KINEMATIC_KINEMATIC,
}

/**
 * The integer identifier of a collider added to a `ColliderSet`.
 */
export type ColliderHandle = number;

/**
 * A geometric entity that can be attached to a body so it can be affected
 * by contacts and proximity queries.
 */
export class Collider {
    private rawSet: RawColliderSet; // The Collider won't need to free this.
    readonly handle: ColliderHandle;
    private shape: Shape;

    constructor(rawSet: RawColliderSet, handle: ColliderHandle) {
        this.rawSet = rawSet;
        this.handle = handle;
    }

    /**
     * Checks if this collider is still valid (i.e. that it has
     * not been deleted from the collider set yet.
     */
    public isValid(): boolean {
        return this.rawSet.contains(this.handle);
    }

    /**
     * The world-space translation of this rigid-body.
     */
    public translation(): Vector {
        return VectorOps.fromRaw(this.rawSet.coTranslation(this.handle));
    }

    /**
     * The world-space orientation of this rigid-body.
     */
    public rotation(): Rotation {
        return RotationOps.fromRaw(this.rawSet.coRotation(this.handle));
    }

    /**
     * Is this collider a sensor?
     */
    public isSensor(): boolean {
        return this.rawSet.coIsSensor(this.handle);
    }

    public setSensor(isSensor: boolean) {
        this.rawSet.coSetSensor(this.handle, isSensor);
    }

    public setShape(shape: Shape) {
        let rawShape = shape.intoRaw();
        this.rawSet.coSetShape(this.handle, rawShape);
        rawShape.free();
        this.shape = shape;
    }

    public getShape<T extends Shape>(): T {
        return this.shape as T;
    }

    /**
     * Sets the restitution coefficient of the collider to be created.
     *
     * @param restitution - The restitution coefficient in `[0, 1]`. A value of 0 (the default) means no bouncing behavior
     *                   while 1 means perfect bouncing (though energy may still be lost due to numerical errors of the
     *                   constraints solver).
     */
    public setRestitution(restitution: number) {
        this.rawSet.coSetRestitution(this.handle, restitution);
    }

    /**
     * Sets the friction coefficient of the collider to be created.
     *
     * @param friction - The friction coefficient. Must be greater or equal to 0. This is generally smaller than 1. The
     *                   higher the coefficient, the stronger friction forces will be for contacts with the collider
     *                   being built.
     */
    public setFriction(friction: number) {
        this.rawSet.coSetFriction(this.handle, friction);
    }

    /**
     * Gets the rule used to combine the friction coefficients of two colliders
     * colliders involved in a contact.
     */
    public frictionCombineRule(): CoefficientCombineRule {
        return this.rawSet.coFrictionCombineRule(this.handle);
    }

    /**
     * Sets the rule used to combine the friction coefficients of two colliders
     * colliders involved in a contact.
     *
     * @param rule − The combine rule to apply.
     */
    public setFrictionCombineRule(rule: CoefficientCombineRule) {
        this.rawSet.coSetFrictionCombineRule(this.handle, rule);
    }

    /**
     * Gets the rule used to combine the restitution coefficients of two colliders
     * colliders involved in a contact.
     */
    public restitutionCombineRule(): CoefficientCombineRule {
        return this.rawSet.coRestitutionCombineRule(this.handle);
    }

    /**
     * Sets the rule used to combine the restitution coefficients of two colliders
     * colliders involved in a contact.
     *
     * @param rule − The combine rule to apply.
     */
    public setRestitutionCombineRule(rule: CoefficientCombineRule) {
        this.rawSet.coSetRestitutionCombineRule(this.handle, rule);
    }

    /**
     * Sets the collision groups used by this collider.
     *
     * Two colliders will interact iff. their collision groups are compatible.
     * See the documentation of `InteractionGroups` for details on teh used bit pattern.
     *
     * @param groups - The collision groups used for the collider being built.
     */
    public setCollisionGroups(groups: InteractionGroups) {
        this.rawSet.coSetCollisionGroups(this.handle, groups);
    }

    /**
     * Sets the solver groups used by this collider.
     *
     * Forces between two colliders in contact will be computed iff their solver
     * groups are compatible.
     * See the documentation of `InteractionGroups` for details on the used bit pattern.
     *
     * @param groups - The solver groups used for the collider being built.
     */
    public setSolverGroups(groups: InteractionGroups) {
        this.rawSet.coSetSolverGroups(this.handle, groups);
    }

    /**
     * Get the physics hooks active for this collider.
     */
    public activeHooks() {
        return this.rawSet.coActiveHooks(this.handle);
    }

    /**
     * Set the physics hooks active for this collider.
     *
     * Use this to enable custom filtering rules for contact/intersecstion pairs involving this collider.
     *
     * @param activeHooks - The hooks active for contact/intersection pairs involving this collider.
     */
    public setActiveHooks(activeHooks: ActiveHooks) {
        this.rawSet.coSetActiveHooks(this.handle, activeHooks);
    }

    /**
     * The events active for this collider.
     */
    public activeEvents(): ActiveEvents {
        return this.rawSet.coActiveEvents(this.handle);
    }

    /**
     * Set the events active for this collider.
     *
     * Use this to enable contact and/or intersection event reporting for this collider.
     *
     * @param activeEvents - The events active for contact/intersection pairs involving this collider.
     */
    public setActiveEvents(activeEvents: ActiveEvents) {
        this.rawSet.coSetActiveEvents(this.handle, activeEvents);
    }

    /**
     * Gets the collision types active for this collider.
     */
    public activeCollisionTypes(): ActiveCollisionTypes {
        return this.rawSet.coActiveCollisionTypes(this.handle);
    }

    /**
     * Set the collision types active for this collider.
     *
     * @param activeCollisionTypes - The hooks active for contact/intersection pairs involving this collider.
     */
    public setActiveCollisionTypes(activeCollisionTypes: ActiveCollisionTypes) {
        this.rawSet.coSetActiveCollisionTypes(this.handle, activeCollisionTypes);
    }

    /**
     * Sets the translation of this collider.
     *
     * @param tra - The world-space position of the collider.
     */
    public setTranslation(tra: Vector) {
        // #if DIM2
        this.rawSet.coSetTranslation(this.handle, tra.x, tra.y);
        // #endif
        // #if DIM3
        this.rawSet.coSetTranslation(this.handle, tra.x, tra.y, tra.z);
        // #endif
    }

    /**
     * Sets the translation of this collider relative to its parent rigid-body.
     *
     * Does nothing if this collider isn't attached to a rigid-body.
     *
     * @param tra - The new translation of the collider relative to its parent.
     */
    public setTranslationWrtParent(tra: Vector) {
        // #if DIM2
        this.rawSet.coSetTranslationWrtParent(this.handle, tra.x, tra.y);
        // #endif
        // #if DIM3
        this.rawSet.coSetTranslationWrtParent(this.handle, tra.x, tra.y, tra.z);
        // #endif
    }

    // #if DIM3
    /**
     * Sets the rotation quaternion of this collider.
     *
     * This does nothing if a zero quaternion is provided.
     *
     * @param rotation - The rotation to set.
     */
    public setRotation(rot: Rotation) {
        this.rawSet.coSetRotation(this.handle, rot.x, rot.y, rot.z, rot.w);
    }


    /**
     * Sets the rotation quaternion of this collider relative to its parent rigid-body.
     *
     * This does nothing if a zero quaternion is provided or if this collider isn't
     * attached to a rigid-body.
     *
     * @param rotation - The rotation to set.
     */
    public setRotationWrtParent(rot: Rotation) {
        this.rawSet.coSetRotationWrtParent(this.handle, rot.x, rot.y, rot.z, rot.w);
    }
    // #endif
    // #if DIM2
    /**
     * Sets the rotation angle of this collider.
     *
     * @param angle - The rotation angle, in radians.
     */
    public setRotation(angle: number) {
        this.rawSet.coSetRotation(this.handle, angle);
    }

    /**
     * Sets the rotation angle of this collider relative to its parent rigid-body.
     *
     * Does nothing if this collider isn't attached to a rigid-body.
     *
     * @param angle - The rotation angle, in radians.
     */
    public setRotationWrtParent(angle: number) {
        this.rawSet.coSetRotationWrtParent(this.handle, angle);
    }
    // #endif

    /**
     * The type of the shape of this collider.
     * @deprecated this field will be removed in the future, please access this field on `shape` member instead.
     */
    public shapeType(): ShapeType {
        return this.rawSet.coShapeType(this.handle);
    }

    /**
     * The half-extents of this collider if it is a cuboid shape.
     * @deprecated this field will be removed in the future, please access this field on `shape` member instead.
     */
    public halfExtents(): Vector {
        return VectorOps.fromRaw(this.rawSet.coHalfExtents(this.handle));
    }

    /**
     * The radius of this collider if it is a ball, cylinder, capsule, or cone shape.
     * @deprecated this field will be removed in the future, please access this field on `shape` member instead.
     */
    public radius(): number {
        return this.rawSet.coRadius(this.handle);
    }

    /**
     * The radius of the round edges of this collider if it is a round cylinder.
     * @deprecated this field will be removed in the future, please access this field on `shape` member instead.
     */
    public roundRadius(): number {
        return this.rawSet.coRoundRadius(this.handle);
    }

    /**
     * The half height of this collider if it is a cylinder, capsule, or cone shape.
     * @deprecated this field will be removed in the future, please access this field on `shape` member instead.
     */
    public halfHeight(): number {
        return this.rawSet.coHalfHeight(this.handle);
    }

    /**
     * If this collider has a triangle mesh, polyline, convex polygon, or convex polyhedron shape,
     * this returns the vertex buffer of said shape.
     * @deprecated this field will be removed in the future, please access this field on `shape` member instead.
     */
    public vertices(): Float32Array {
        return this.rawSet.coVertices(this.handle);
    }

    /**
     * If this collider has a triangle mesh, polyline, or convex polyhedron shape,
     * this returns the index buffer of said shape.
     * @deprecated this field will be removed in the future, please access this field on `shape` member instead.
     */
    public indices(): Uint32Array | undefined {
        return this.rawSet.coIndices(this.handle);
    }

    /**
     * If this collider has a heightfield shape, this returns the heights buffer of
     * the heightfield.
     * In 3D, the returned height matrix is provided in column-major order.
     * @deprecated this field will be removed in the future, please access this field on `shape` member instead.
     */
    public heightfieldHeights(): Float32Array {
        return this.rawSet.coHeightfieldHeights(this.handle);
    }

    /**
     * If this collider has a heightfield shape, this returns the scale
     * applied to it.
     * @deprecated this field will be removed in the future, please access this field on `shape` member instead.
     */
    public heightfieldScale(): Vector {
        let scale = this.rawSet.coHeightfieldScale(this.handle);
        return VectorOps.fromRaw(scale);
    }

    // #if DIM3
    /**
     * If this collider has a heightfield shape, this returns the number of
     * rows of its height matrix.
     * @deprecated this field will be removed in the future, please access this field on `shape` member instead.
     */
    public heightfieldNRows(): number {
        return this.rawSet.coHeightfieldNRows(this.handle);
    }

    /**
     * If this collider has a heightfield shape, this returns the number of
     * columns of its height matrix.
     * @deprecated this field will be removed in the future, please access this field on `shape` member instead.
     */
    public heightfieldNCols(): number {
        return this.rawSet.coHeightfieldNCols(this.handle);
    }

    // #endif

    /**
     * The unique integer identifier of the rigid-body this collider is attached to.
     */
    public parent(): RigidBodyHandle | undefined {
        return this.rawSet.coParent(this.handle);
    }

    /**
     * The friction coefficient of this collider.
     */
    public friction(): number {
        return this.rawSet.coFriction(this.handle);
    }

    /**
     * The restitution coefficient of this collider.
     */
    public restitution(): number {
        return this.rawSet.coRestitution(this.handle);
    }

    /**
     * The density of this collider.
     */
    public density(): number {
        return this.rawSet.coDensity(this.handle);
    }

    /**
     * The collision groups of this collider.
     */
    public collisionGroups(): InteractionGroups {
        return this.rawSet.coCollisionGroups(this.handle);
    }

    /**
     * The solver groups of this collider.
     */
    public solverGroups(): InteractionGroups {
        return this.rawSet.coSolverGroups(this.handle);
    }

    /**
     * Tests if this collider contains a point.
     *
     * @param point - The point to test.
     */
    public containsPoint(
        point: Vector,
    ): boolean {
        let rawPoint = VectorOps.intoRaw(point);
        let result = this.rawSet.coContainsPoint(
            this.handle,
            rawPoint,
        );

        rawPoint.free();

        return result;
    }

    /**
     * Find the projection of a point on this collider.
     *
     * @param point - The point to project.
     * @param solid - If this is set to `true` then the collider shapes are considered to
     *   be plain (if the point is located inside of a plain shape, its projection is the point
     *   itself). If it is set to `false` the collider shapes are considered to be hollow
     *   (if the point is located inside of an hollow shape, it is projected on the shape's
     *   boundary).
     */
    public projectPoint(
        point: Vector,
        solid: boolean,
    ): PointProjection | null {
        let rawPoint = VectorOps.intoRaw(point);
        let result = PointProjection.fromRaw(this.rawSet.coProjectPoint(
            this.handle,
            rawPoint,
            solid,
        ));

        rawPoint.free();

        return result;
    }


    /**
     * Tests if this collider intersects the given ray.
     *
     * @param ray - The ray to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the length of the ray to `ray.dir.norm() * maxToi`.
     */
    public intersectsRay(
        ray: Ray,
        maxToi: number,
    ): boolean {
        let rawOrig = VectorOps.intoRaw(ray.origin);
        let rawDir = VectorOps.intoRaw(ray.dir);
        let result = this.rawSet.coIntersectsRay(
            this.handle,
            rawOrig,
            rawDir,
            maxToi,
        );

        rawOrig.free();
        rawDir.free();

        return result;
    }

    /*
     * Computes the smallest time between this and the given shape under translational movement are separated by a distance smaller or equal to distance.
     *
     * @param collider1Vel - The constant velocity of the current shape to cast (i.e. the cast direction).
     * @param shape2 - The shape to cast against.
     * @param shape2Pos - The position of the second shape.
     * @param shape2Rot - The rotation of the second shape.
     * @param shape2Vel - The constant velocity of the second shape.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the distance traveled by the shape to `collider1Vel.norm() * maxToi`.
     */
    public castShape(
        collider1Vel: Vector,
        shape2: Shape,
        shape2Pos: Vector,
        shape2Rot: Rotation,
        shape2Vel: Vector,
        maxToi: number,
    ): ShapeTOI | null {
        let rawCollider1Vel = VectorOps.intoRaw(collider1Vel);
        let rawShape2Pos = VectorOps.intoRaw(shape2Pos);
        let rawShape2Rot = RotationOps.intoRaw(shape2Rot);
        let rawShape2Vel = VectorOps.intoRaw(shape2Vel);
        let rawShape2 = shape2.intoRaw();

        let result = ShapeTOI.fromRaw(this.rawSet.coCastShape(
            this.handle,
            rawCollider1Vel,
            rawShape2,
            rawShape2Pos,
            rawShape2Rot,
            rawShape2Vel,
            maxToi
        ));

        rawCollider1Vel.free();
        rawShape2Pos.free();
        rawShape2Rot.free();
        rawShape2Vel.free();
        rawShape2.free();

        return result;
    }

    /*
     * Computes the smallest time between this and the given collider under translational movement are separated by a distance smaller or equal to distance.
     *
     * @param collider1Vel - The constant velocity of the current collider to cast (i.e. the cast direction).
     * @param collider2 - The collider to cast against.
     * @param collider2Vel - The constant velocity of the second collider.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the distance traveled by the shape to `shapeVel.norm() * maxToi`.
     */
    public castCollider(
        collider1Vel: Vector,
        collider2Handle: ColliderHandle,
        collider2Vel: Vector,
        maxToi: number,
    ): ShapeColliderTOI | null {
        let rawCollider1Vel = VectorOps.intoRaw(collider1Vel);
        let rawCollider2Vel = VectorOps.intoRaw(collider2Vel);

        let result = ShapeColliderTOI.fromRaw(this.rawSet.coCastCollider(
            this.handle,
            rawCollider1Vel,
            collider2Handle,
            rawCollider2Vel,
            maxToi
        ));

        rawCollider1Vel.free();
        rawCollider2Vel.free();

        return result;
    }

    /**
     * Computes one pair of contact points between the shape owned by this collider and the given shape.
     *
     * @param shape2 - The second shape.
     * @param shape2Pos - The initial position of the second shape.
     * @param shape2Rot - The rotation of the second shape.
     * @param prediction - The prediction value, if the shapes are separated by a distance greater than this value, test will fail.
     * @returns `null` if the shapes are separated by a distance greater than prediction, otherwise contact details. The result is given in world-space.
     */
    contactShape(shape2: Shape, shape2Pos: Vector, shape2Rot: Rotation, prediction: number): ShapeContact | null {
        let rawPos2 = VectorOps.intoRaw(shape2Pos);
        let rawRot2 = RotationOps.intoRaw(shape2Rot);
        let rawShape2 = shape2.intoRaw();

        let result = ShapeContact.fromRaw(this.rawSet.coContactShape(
            this.handle,
            rawShape2,
            rawPos2,
            rawRot2,
            prediction
        ));

        rawPos2.free();
        rawRot2.free();
        rawShape2.free();

        return result;
    }

    /**
     * Computes one pair of contact points between the collider and the given collider.
     *
     * @param collider2Handle - The second collider.
     * @param prediction - The prediction value, if the shapes are separated by a distance greater than this value, test will fail.
     * @returns `null` if the shapes are separated by a distance greater than prediction, otherwise contact details. The result is given in world-space.
     */
    contactCollider(collider2Handle: ColliderHandle, prediction: number): ShapeContact | null {
        let result = ShapeContact.fromRaw(this.rawSet.coContactCollider(
            this.handle,
            collider2Handle,
            prediction
        ));

        return result;
    }

    /*
     * Find the closest intersection between a ray and this collider.
     *
     * This also computes the normal at the hit point.
     * @param ray - The ray to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the length of the ray to `ray.dir.norm() * maxToi`.
     * @param solid - If `false` then the ray will attempt to hit the boundary of a shape, even if its
     *   origin already lies inside of a shape. In other terms, `true` implies that all shapes are plain,
     *   whereas `false` implies that all shapes are hollow for this ray-cast.
     * @returns The time-of-impact between this collider and the ray, or `-1` if there is no intersection.
     */
    public castRay(
        ray: Ray,
        maxToi: number,
        solid: boolean,
    ): number {
        let rawOrig = VectorOps.intoRaw(ray.origin);
        let rawDir = VectorOps.intoRaw(ray.dir);
        let result = this.rawSet.coCastRay(
            this.handle,
            rawOrig,
            rawDir,
            maxToi,
            solid,
        );

        rawOrig.free();
        rawDir.free();

        return result;
    }

    /**
     * Find the closest intersection between a ray and this collider.
     *
     * This also computes the normal at the hit point.
     * @param ray - The ray to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the length of the ray to `ray.dir.norm() * maxToi`.
     * @param solid - If `false` then the ray will attempt to hit the boundary of a shape, even if its
     *   origin already lies inside of a shape. In other terms, `true` implies that all shapes are plain,
     *   whereas `false` implies that all shapes are hollow for this ray-cast.
     */
    public castRayAndGetNormal(
        ray: Ray,
        maxToi: number,
        solid: boolean,
    ): RayIntersection | null {
        let rawOrig = VectorOps.intoRaw(ray.origin);
        let rawDir = VectorOps.intoRaw(ray.dir);
        let result = RayIntersection.fromRaw(this.rawSet.coCastRayAndGetNormal(
            this.handle,
            rawOrig,
            rawDir,
            maxToi,
            solid,
        ));

        rawOrig.free();
        rawDir.free();

        return result;
    }
}


export class ColliderDesc {
    shape: Shape;
    useMassProps: boolean;
    mass: number;
    centerOfMass: Vector;
    // #if DIM2
    principalAngularInertia: number;
    rotationsEnabled: boolean;
    // #endif
    // #if DIM3
    principalAngularInertia: Vector;
    angularInertiaLocalFrame: Rotation;
    // #endif
    density: number;
    friction: number;
    restitution: number;
    rotation: Rotation;
    translation: Vector;
    isSensor: boolean;
    collisionGroups: InteractionGroups;
    solverGroups: InteractionGroups;
    frictionCombineRule: CoefficientCombineRule;
    restitutionCombineRule: CoefficientCombineRule;
    activeEvents: ActiveEvents;
    activeHooks: ActiveHooks;
    activeCollisionTypes: ActiveCollisionTypes;

    /**
     * Initializes a collider descriptor from the collision shape.
     *
     * @param shape - The shape of the collider being built.
     */
    constructor(shape: Shape) {
        this.shape = shape;
        this.useMassProps = false;
        this.density = 1.0;
        this.friction = 0.5;
        this.restitution = 0.0;
        this.rotation = RotationOps.identity();
        this.translation = VectorOps.zeros();
        this.isSensor = false;
        this.collisionGroups = 0xffff_ffff;
        this.solverGroups = 0xffff_ffff;
        this.frictionCombineRule = CoefficientCombineRule.Average;
        this.restitutionCombineRule = CoefficientCombineRule.Average;
        this.activeCollisionTypes = ActiveCollisionTypes.DEFAULT;
        this.activeEvents = 0;
        this.activeHooks = 0;
        this.mass = 0.0;
        this.centerOfMass = VectorOps.zeros();
        // #if DIM2
        this.principalAngularInertia = 0.0;
        this.rotationsEnabled = true;
        // #endif
        // #if DIM3
        this.principalAngularInertia = VectorOps.zeros();
        this.angularInertiaLocalFrame = RotationOps.identity();
        // #endif
    }

    /**
     * Create a new collider descriptor with a ball shape.
     *
     * @param radius - The radius of the ball.
     */
    public static ball(radius: number): ColliderDesc {
        const shape = new Ball(radius);
        return new ColliderDesc(shape);
    }

    /**
     * Create a new collider descriptor with a capsule shape.
     *
     * @param halfHeight - The half-height of the capsule, along the `y` axis.
     * @param radius - The radius of the capsule basis.
     */
    public static capsule(halfHeight: number, radius: number): ColliderDesc {
        const shape = new Capsule(halfHeight, radius);
        return new ColliderDesc(shape);
    }

    /**
     * Creates a new segment shape.
     *
     * @param a - The first point of the segment.
     * @param b - The second point of the segment.
     */
    public static segment(a: Vector, b: Vector): ColliderDesc {
        const shape = new Segment(a, b);
        return new ColliderDesc(shape);
    }

    /**
     * Creates a new triangle shape.
     *
     * @param a - The first point of the triangle.
     * @param b - The second point of the triangle.
     * @param c - The third point of the triangle.
     */
    public static triangle(a: Vector, b: Vector, c: Vector): ColliderDesc {
        const shape = new Triangle(a, b, c);
        return new ColliderDesc(shape);
    }

    /**
     * Creates a new triangle shape with round corners.
     *
     * @param a - The first point of the triangle.
     * @param b - The second point of the triangle.
     * @param c - The third point of the triangle.
     * @param borderRadius - The radius of the borders of this triangle. In 3D,
     *   this is also equal to half the thickness of the triangle.
     */
    public static roundTriangle(a: Vector, b: Vector, c: Vector, borderRadius: number): ColliderDesc {
        const shape = new RoundTriangle(a, b, c, borderRadius);
        return new ColliderDesc(shape);
    }

    /**
     * Creates a new collider descriptor with a polyline shape.
     *
     * @param vertices - The coordinates of the polyline's vertices.
     * @param indices - The indices of the polyline's segments. If this is `undefined` or `null`,
     *    the vertices are assumed to describe a line strip.
     */
    public static polyline(vertices: Float32Array, indices?: Uint32Array | null): ColliderDesc {
        const shape = new Polyline(vertices, indices);
        return new ColliderDesc(shape);
    }

    /**
     * Creates a new collider descriptor with a triangle mesh shape.
     *
     * @param vertices - The coordinates of the triangle mesh's vertices.
     * @param indices - The indices of the triangle mesh's triangles.
     */
    public static trimesh(vertices: Float32Array, indices: Uint32Array): ColliderDesc {
        const shape = new TriMesh(vertices, indices);
        return new ColliderDesc(shape);
    }

    // #if DIM2
    /**
     * Creates a new collider descriptor with a rectangular shape.
     *
     * @param hx - The half-width of the rectangle along its local `x` axis.
     * @param hy - The half-width of the rectangle along its local `y` axis.
     */
    public static cuboid(hx: number, hy: number): ColliderDesc {
        const shape = new Cuboid(hx, hy);
        return new ColliderDesc(shape);
    }

    /**
     * Creates a new collider descriptor with a rectangular shape with round borders.
     *
     * @param hx - The half-width of the rectangle along its local `x` axis.
     * @param hy - The half-width of the rectangle along its local `y` axis.
     * @param borderRadius - The radius of the cuboid's borders.
     */
    public static roundCuboid(hx: number, hy: number, borderRadius: number): ColliderDesc {
        const shape = new RoundCuboid(hx, hy, borderRadius);
        return new ColliderDesc(shape);
    }

    /**
     * Creates a new collider descriptor with a heightfield shape.
     *
     * @param heights - The heights of the heightfield, along its local `y` axis.
     * @param scale - The scale factor applied to the heightfield.
     */
    public static heightfield(heights: Float32Array, scale: Vector): ColliderDesc {
        const shape = new Heightfield(heights, scale);
        return new ColliderDesc(shape);
    }

    /**
     * Computes the convex-hull of the given points and use the resulting
     * convex polygon as the shape for this new collider descriptor.
     *
     * @param points - The point that will be used to compute the convex-hull.
     */
    public static convexHull(points: Float32Array): ColliderDesc | null {
        const shape = new ConvexPolygon(points, false);
        return new ColliderDesc(shape);
    }

    /**
     * Creates a new collider descriptor that uses the given set of points assumed
     * to form a convex polyline (no convex-hull computation will be done).
     *
     * @param vertices - The vertices of the convex polyline.
     */
    public static convexPolyline(vertices: Float32Array): ColliderDesc | null {
        const shape = new ConvexPolygon(vertices, true);
        return new ColliderDesc(shape);
    }

    /**
     * Computes the convex-hull of the given points and use the resulting
     * convex polygon as the shape for this new collider descriptor. A
     * border is added to that convex polygon to give it round corners.
     *
     * @param points - The point that will be used to compute the convex-hull.
     * @param borderRadius - The radius of the round border added to the convex polygon.
     */
    public static roundConvexHull(points: Float32Array, borderRadius: number): ColliderDesc | null {
        const shape = new RoundConvexPolygon(points, borderRadius, false);
        return new ColliderDesc(shape);
    }

    /**
     * Creates a new collider descriptor that uses the given set of points assumed
     * to form a round convex polyline (no convex-hull computation will be done).
     *
     * @param vertices - The vertices of the convex polyline.
     * @param borderRadius - The radius of the round border added to the convex polyline.
     */
    public static roundConvexPolyline(vertices: Float32Array, borderRadius: number): ColliderDesc | null {
        const shape = new RoundConvexPolygon(vertices, borderRadius, true);
        return new ColliderDesc(shape);
    }

    // #endif

    // #if DIM3
    /**
     * Creates a new collider descriptor with a cuboid shape.
     *
     * @param hx - The half-width of the rectangle along its local `x` axis.
     * @param hy - The half-width of the rectangle along its local `y` axis.
     * @param hz - The half-width of the rectangle along its local `z` axis.
     */
    public static cuboid(hx: number, hy: number, hz: number): ColliderDesc {
        const shape = new Cuboid(hx, hy, hz);
        return new ColliderDesc(shape);
    }

    /**
     * Creates a new collider descriptor with a rectangular shape with round borders.
     *
     * @param hx - The half-width of the rectangle along its local `x` axis.
     * @param hy - The half-width of the rectangle along its local `y` axis.
     * @param hz - The half-width of the rectangle along its local `z` axis.
     * @param borderRadius - The radius of the cuboid's borders.
     */
    public static roundCuboid(hx: number, hy: number, hz: number, borderRadius: number): ColliderDesc {
        const shape = new RoundCuboid(hx, hy, hz, borderRadius);
        return new ColliderDesc(shape);
    }

    /**
     * Creates a new collider descriptor with a heightfield shape.
     *
     * @param nrows − The number of rows in the heights matrix.
     * @param ncols - The number of columns in the heights matrix.
     * @param heights - The heights of the heightfield along its local `y` axis,
     *                  provided as a matrix stored in column-major order.
     * @param scale - The scale factor applied to the heightfield.
     */
    public static heightfield(nrows: number, ncols: number, heights: Float32Array, scale: Vector): ColliderDesc {
        const shape = new Heightfield(nrows, ncols, heights, scale);
        return new ColliderDesc(shape);
    }

    /**
     * Create a new collider descriptor with a cylinder shape.
     *
     * @param halfHeight - The half-height of the cylinder, along the `y` axis.
     * @param radius - The radius of the cylinder basis.
     */
    public static cylinder(halfHeight: number, radius: number): ColliderDesc {
        const shape = new Cylinder(halfHeight, radius);
        return new ColliderDesc(shape);
    }

    /**
     * Create a new collider descriptor with a cylinder shape with rounded corners.
     *
     * @param halfHeight - The half-height of the cylinder, along the `y` axis.
     * @param radius - The radius of the cylinder basis.
     * @param borderRadius - The radius of the cylinder's rounded edges and vertices.
     */
    public static roundCylinder(halfHeight: number, radius: number, borderRadius: number): ColliderDesc {
        const shape = new RoundCylinder(halfHeight, radius, borderRadius);
        return new ColliderDesc(shape);
    }

    /**
     * Create a new collider descriptor with a cone shape.
     *
     * @param halfHeight - The half-height of the cone, along the `y` axis.
     * @param radius - The radius of the cone basis.
     */
    public static cone(halfHeight: number, radius: number): ColliderDesc {
        const shape = new Cone(halfHeight, radius);
        return new ColliderDesc(shape);
    }

    /**
     * Create a new collider descriptor with a cone shape with rounded corners.
     *
     * @param halfHeight - The half-height of the cone, along the `y` axis.
     * @param radius - The radius of the cone basis.
     * @param borderRadius - The radius of the cone's rounded edges and vertices.
     */
    public static roundCone(halfHeight: number, radius: number, borderRadius: number): ColliderDesc {
        const shape = new RoundCone(halfHeight, radius, borderRadius);
        return new ColliderDesc(shape);
    }


    /**
     * Computes the convex-hull of the given points and use the resulting
     * convex polyhedron as the shape for this new collider descriptor.
     *
     * @param points - The point that will be used to compute the convex-hull.
     */
    public static convexHull(points: Float32Array): ColliderDesc | null {
        const shape = new ConvexPolyhedron(points, null);
        return new ColliderDesc(shape);
    }

    /**
     * Creates a new collider descriptor that uses the given set of points assumed
     * to form a convex polyline (no convex-hull computation will be done).
     *
     * @param vertices - The vertices of the convex polyline.
     */
    public static convexMesh(vertices: Float32Array, indices?: Uint32Array | null): ColliderDesc | null {
        const shape = new ConvexPolyhedron(vertices, indices);
        return new ColliderDesc(shape);
    }

    /**
     * Computes the convex-hull of the given points and use the resulting
     * convex polyhedron as the shape for this new collider descriptor. A
     * border is added to that convex polyhedron to give it round corners.
     *
     * @param points - The point that will be used to compute the convex-hull.
     * @param borderRadius - The radius of the round border added to the convex polyhedron.
     */
    public static roundConvexHull(points: Float32Array, borderRadius: number): ColliderDesc | null {
        const shape = new RoundConvexPolyhedron(points, null, borderRadius);
        return new ColliderDesc(shape);
    }

    /**
     * Creates a new collider descriptor that uses the given set of points assumed
     * to form a round convex polyline (no convex-hull computation will be done).
     *
     * @param vertices - The vertices of the convex polyline.
     * @param borderRadius - The radius of the round border added to the convex polyline.
     */
    public static roundConvexMesh(vertices: Float32Array, indices: Uint32Array | null, borderRadius: number): ColliderDesc | null {
        const shape = new RoundConvexPolyhedron(vertices, indices, borderRadius);
        return new ColliderDesc(shape);
    }

    // #endif

    // #if DIM2
    /**
     * Sets the position of the collider to be created relative to the rigid-body it is attached to.
     */
    public setTranslation(x: number, y: number): ColliderDesc {
        if (typeof x != "number" || typeof y != "number")
            throw TypeError("The translation components must be numbers.");

        this.translation = { x: x, y: y };
        return this;
    }

    // #endif

    // #if DIM3
    /**
     * Sets the position of the collider to be created relative to the rigid-body it is attached to.
     */
    public setTranslation(x: number, y: number, z: number): ColliderDesc {
        if (typeof x != "number" || typeof y != "number" || typeof z != "number")
            throw TypeError("The translation components must be numbers.");

        this.translation = { x: x, y: y, z: z };
        return this;
    }

    // #endif

    /**
     * Sets the rotation of the collider to be created relative to the rigid-body it is attached to.
     *
     * @param rot - The rotation of the collider to be created relative to the rigid-body it is attached to.
     */
    public setRotation(rot: Rotation): ColliderDesc {
        this.rotation = rot;
        return this;
    }

    /**
     * Sets whether or not the collider being created is a sensor.
     *
     * A sensor collider does not take part of the physics simulation, but generates
     * proximity events.
     *
     * @param is - Set to `true` of the collider built is to be a sensor.
     */
    public setSensor(is: boolean): ColliderDesc {
        this.isSensor = is;
        return this;
    }

    /**
     * Sets the density of the collider being built.
     *
     * @param density - The density to set, must be greater or equal to 0. A density of 0 means that this collider
     *                  will not affect the mass or angular inertia of the rigid-body it is attached to.
     */
    public setDensity(density: number): ColliderDesc {
        this.useMassProps = false;
        this.density = density;
        return this;
    }

    // #if DIM2
    /**
     * Sets the mass properties of the collider being built.
     *
     * This replaces the mass-properties automatically computed from the collider's density and shape.
     * These mass-properties will be added to the mass-properties of the rigid-body this collider will be attached to.
     *
     * @param mass − The mass of the collider to create.
     * @param centerOfMass − The center-of-mass of the collider to create.
     * @param principalAngularInertia − The principal angular inertia of the collider to create.
     */
    public setMassProperties(mass: number, centerOfMass: Vector, principalAngularInertia: number): ColliderDesc {
        this.useMassProps = true;
        this.mass = mass;
        this.centerOfMass = centerOfMass;
        this.principalAngularInertia = principalAngularInertia;
        return this;
    }
    // #endif

    // #if DIM3
    /**
     * Sets the mass properties of the collider being built.
     *
     * This replaces the mass-properties automatically computed from the collider's density and shape.
     * These mass-properties will be added to the mass-properties of the rigid-body this collider will be attached to.
     *
     * @param mass − The mass of the collider to create.
     * @param centerOfMass − The center-of-mass of the collider to create.
     * @param principalAngularInertia − The initial principal angular inertia of the collider to create.
     *                                  These are the eigenvalues of the angular inertia matrix.
     * @param angularInertiaLocalFrame − The initial local angular inertia frame of the collider to create.
     *                                   These are the eigenvectors of the angular inertia matrix.
     */
    public setMassProperties(mass: number, centerOfMass: Vector, principalAngularInertia: Vector, angularInertiaLocalFrame: Rotation): ColliderDesc {
        this.useMassProps = true;
        this.mass = mass;
        this.centerOfMass = centerOfMass;
        this.principalAngularInertia = principalAngularInertia;
        this.angularInertiaLocalFrame = angularInertiaLocalFrame;
        return this;
    }
    // #endif

    /**
     * Sets the restitution coefficient of the collider to be created.
     *
     * @param restitution - The restitution coefficient in `[0, 1]`. A value of 0 (the default) means no bouncing behavior
     *                   while 1 means perfect bouncing (though energy may still be lost due to numerical errors of the
     *                   constraints solver).
     */
    public setRestitution(restitution: number): ColliderDesc {
        this.restitution = restitution;
        return this;
    }

    /**
     * Sets the friction coefficient of the collider to be created.
     *
     * @param friction - The friction coefficient. Must be greater or equal to 0. This is generally smaller than 1. The
     *                   higher the coefficient, the stronger friction forces will be for contacts with the collider
     *                   being built.
     */
    public setFriction(friction: number): ColliderDesc {
        this.friction = friction;
        return this;
    }

    /**
     * Sets the rule used to combine the friction coefficients of two colliders
     * colliders involved in a contact.
     *
     * @param rule − The combine rule to apply.
     */
    public setFrictionCombineRule(rule: CoefficientCombineRule): ColliderDesc {
        this.frictionCombineRule = rule;
        return this;
    }

    /**
     * Sets the rule used to combine the restitution coefficients of two colliders
     * colliders involved in a contact.
     *
     * @param rule − The combine rule to apply.
     */
    public setRestitutionCombineRule(rule: CoefficientCombineRule): ColliderDesc {
        this.restitutionCombineRule = rule;
        return this;
    }

    /**
     * Sets the collision groups used by this collider.
     *
     * Two colliders will interact iff. their collision groups are compatible.
     * See the documentation of `InteractionGroups` for details on teh used bit pattern.
     *
     * @param groups - The collision groups used for the collider being built.
     */
    public setCollisionGroups(groups: InteractionGroups): ColliderDesc {
        this.collisionGroups = groups;
        return this;
    }

    /**
     * Sets the solver groups used by this collider.
     *
     * Forces between two colliders in contact will be computed iff their solver
     * groups are compatible.
     * See the documentation of `InteractionGroups` for details on the used bit pattern.
     *
     * @param groups - The solver groups used for the collider being built.
     */
    public setSolverGroups(groups: InteractionGroups): ColliderDesc {
        this.solverGroups = groups;
        return this;
    }

    /**
     * Set the physics hooks active for this collider.
     *
     * Use this to enable custom filtering rules for contact/intersecstion pairs involving this collider.
     *
     * @param activeHooks - The hooks active for contact/intersection pairs involving this collider.
     */
    public setActiveHooks(activeHooks: ActiveHooks): ColliderDesc {
        this.activeHooks = activeHooks;
        return this;
    }

    /**
     * Set the events active for this collider.
     *
     * Use this to enable contact and/or intersection event reporting for this collider.
     *
     * @param activeEvents - The events active for contact/intersection pairs involving this collider.
     */
    public setActiveEvents(activeEvents: ActiveEvents): ColliderDesc {
        this.activeEvents = activeEvents;
        return this;
    }

    /**
     * Set the collision types active for this collider.
     *
     * @param activeCollisionTypes - The hooks active for contact/intersection pairs involving this collider.
     */
    public setActiveCollisionTypes(activeCollisionTypes: ActiveCollisionTypes): ColliderDesc {
        this.activeCollisionTypes = activeCollisionTypes;
        return this;
    }
}
