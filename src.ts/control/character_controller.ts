import {
    RawKinematicCharacterController,
    RawIntegrationParameters,
    RawRigidBodySet,
    RawColliderSet,
    RawQueryPipeline,
    RawEffectiveCharacterMovement,
} from "../raw";
import {Rotation, Vector, VectorOps} from "../math";
import {Collider, ColliderSet, InteractionGroups, Shape} from "../geometry";
import {QueryFilterFlags, QueryPipeline, World} from "../pipeline";
import {IntegrationParameters, RigidBody, RigidBodySet} from "../dynamics";

/**
 * The actual movement a character is able to execute after hitting and sliding on obstacles.
 */
export class EffectiveCharacterMovement {
    /**
     * The translational movement.
     */
    public translation: Vector;
    /**
     * Is the character touching the ground?
     */
    public grounded: boolean;

    /** @internal */
    constructor(translation: Vector, grounded: boolean) {
        this.translation = translation;
        this.grounded = grounded;
    }
}

/**
 * A character controller for controlling kinematic bodies and parentless colliders by hitting
 * and sliding against obstacles.
 */
export class KinematicCharacterController {
    // NOTE: none of the raw objects need to be freed by the character controller itself.
    private raw: RawKinematicCharacterController;
    private rawResult: RawEffectiveCharacterMovement;

    private params: IntegrationParameters;
    private bodies: RigidBodySet;
    private colliders: ColliderSet;
    private queries: QueryPipeline;

    constructor(
        offset: number,
        params: IntegrationParameters,
        bodies: RigidBodySet,
        colliders: ColliderSet,
        queries: QueryPipeline,
    ) {
        this.params = params;
        this.bodies = bodies;
        this.colliders = colliders;
        this.queries = queries;
        this.raw = new RawKinematicCharacterController(offset);
        this.rawResult = new RawEffectiveCharacterMovement();
    }

    /** @internal */
    public free() {
        if (!!this.raw) {
            this.raw.free();
            this.rawResult.free();
        }

        this.raw = undefined;
        this.rawResult = undefined;
    }

    /**
     * The direction that goes "up". Used to determine where the floor is, and the floor’s angle.
     */
    public up(): Vector {
        return this.raw.up();
    }

    /**
     * Sets the direction that goes "up". Used to determine where the floor is, and the floor’s angle.
     */
    public setUp(vector: Vector) {
        let rawVect = VectorOps.intoRaw(vector);
        return this.raw.setUp(rawVect);
        rawVect.free();
    }

    /**
     * A small gap to preserve between the character and its surroundings.
     *
     * This value should not be too large to avoid visual artifacts, but shouldn’t be too small
     * (must not be zero) to improve numerical stability of the character controller.
     */
    public offset(): number {
        return this.raw.offset();
    }

    /**
     * Sets a small gap to preserve between the character and its surroundings.
     *
     * This value should not be too large to avoid visual artifacts, but shouldn’t be too small
     * (must not be zero) to improve numerical stability of the character controller.
     */
    public setOffset(value: number) {
        this.raw.setOffset(value);
    }

    /**
     * Is sliding against obstacles enabled?
     */
    public slideEnabled(): boolean {
        return this.raw.slideEnabled();
    }

    /**
     * Enable or disable sliding against obstacles.
     */
    public setSlideEnabled(enabled: boolean) {
        this.raw.setSlideEnabled(enabled);
    }

    /**
     * The maximum step height a character can automatically step over.
     */
    public autostepMaxHeight(): number | null {
        return this.raw.autostepMaxHeight();
    }

    /**
     * The minimum width of free space that must be available after stepping on a stair.
     */
    public autostepMinWidth(): number | null {
        return this.raw.autostepMinWidth();
    }

    /**
     * Can the character automatically step over dynamic bodies too?
     */
    public autostepIncludesDynamicBodies(): boolean | null {
        return this.raw.autostepIncludesDynamicBodies();
    }

    /**
     * Is automatically stepping over small objects enabled?
     */
    public autostepEnabled(): boolean {
        return this.raw.autostepEnabled();
    }

    /**
     * Enabled automatically stepping over small objects.
     *
     * @param maxHeight - The maximum step height a character can automatically step over.
     * @param minWidth - The minimum width of free space that must be available after stepping on a stair.
     * @param includeDynamicBodies - Can the character automatically step over dynamic bodies too?
     */
    public enableAutostep(
        maxHeight: number,
        minWidth: number,
        includeDynamicBodies: boolean,
    ) {
        this.raw.enableAutostep(maxHeight, minWidth, includeDynamicBodies);
    }

    /**
     * Disable automatically stepping over small objects.
     */
    public disableAutostep() {
        return this.raw.disableAutostep();
    }

    /**
     * The maximum angle (radians) between the floor’s normal and the `up` vector that the
     * character is able to climb.
     */
    public maxSlopeClimbAngle(): number {
        return this.raw.maxSlopeClimbAngle();
    }

    /**
     * Sets the maximum angle (radians) between the floor’s normal and the `up` vector that the
     * character is able to climb.
     */
    public setMaxSlopeClimbAngle(angle: number) {
        this.raw.setMaxSlopeClimbAngle(angle);
    }

    /**
     * The minimum angle (radians) between the floor’s normal and the `up` vector before the
     * character starts to slide down automatically.
     */
    public minSlopeSlideAngle(): number {
        return this.raw.minSlopeSlideAngle();
    }

    /**
     * Sets the minimum angle (radians) between the floor’s normal and the `up` vector before the
     * character starts to slide down automatically.
     */
    public setMinSlopeSlideAngle(angle: number) {
        this.raw.setMinSlopeSlideAngle(angle);
    }

    /**
     * Should the character be automatically snapped to the ground if the distance between
     * the ground and its feed are smaller than the specified threshold?
     */
    public snapToGroundDistance(): number | null {
        return this.raw.snapToGroundDistance();
    }

    /**
     * Enables automatically snapping the character to the ground if the distance between
     * the ground and its feed are smaller than the specified threshold.
     */
    public enableSnapToGround(distance: number) {
        this.raw.enableSnapToGround(distance);
    }

    /**
     * Disables automatically snapping the character to the ground.
     */
    public disableSnapToGround() {
        this.raw.disableSnapToGround();
    }

    /**
     * Is automatically snapping the character to the ground enabled?
     */
    public snapToGroundEnabled(): boolean {
        return this.raw.snapToGroundEnabled();
    }

    /**
     * Computes the movement the given collider is able to execute after hitting and sliding on obstacles.
     *
     * @param collider - The collider to move.
     * @param desiredTranslation - The desired collider movement.
     * @param filterFlags - Flags for excluding whole subsets of colliders from the obstacles taken into account.
     * @param filterGroups - Groups for excluding colliders with incompatible collision groups from the obstacles
     *                       taken into account.
     * @param filterPredicate - Any collider for which this closure returns `false` will be excluded from the
     *                          obstacles taken into account.
     */
    public computeColliderMovement(
        collider: Collider,
        desiredTranslation: Vector,
        filterFlags?: QueryFilterFlags,
        filterGroups?: InteractionGroups,
        filterPredicate?: (collider: Collider) => boolean,
    ): EffectiveCharacterMovement {
        let rawTranslation = VectorOps.intoRaw(desiredTranslation);
        this.raw.computeColliderMovement(
            this.params.dt,
            this.bodies.raw,
            this.colliders.raw,
            this.queries.raw,
            collider.handle,
            rawTranslation,
            filterFlags,
            filterGroups,
            this.colliders.castClosure(filterPredicate),
            this.rawResult,
        );
        rawTranslation.free();

        return new EffectiveCharacterMovement(
            VectorOps.fromRaw(this.rawResult.translation()),
            this.rawResult.grounded(),
        );
    }
}
