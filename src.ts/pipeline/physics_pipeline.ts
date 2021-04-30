import {RawPhysicsPipeline} from "../raw";
import {Vector, VectorOps} from "../math";
import {IntegrationParameters, JointSet, RigidBodyHandle, RigidBodySet, CCDSolver, IslandManager} from "../dynamics";
import {BroadPhase, ColliderHandle, ColliderSet, NarrowPhase} from "../geometry";
import {EventQueue} from "./event_queue";

export class PhysicsPipeline {
    raw: RawPhysicsPipeline

    public free() {
        this.raw.free();
        this.raw = undefined;
    }

    constructor(raw?: RawPhysicsPipeline) {
        this.raw = raw || new RawPhysicsPipeline();
    }

    public step(
        gravity: Vector,
        integrationParameters: IntegrationParameters,
        islands: IslandManager,
        broadPhase: BroadPhase,
        narrowPhase: NarrowPhase,
        bodies: RigidBodySet,
        colliders: ColliderSet,
        joints: JointSet,
        ccdSolver: CCDSolver,
        eventQueue?: EventQueue,
    ) {
        let rawG = VectorOps.intoRaw(gravity);

        if (!!eventQueue) {
            this.raw.stepWithEvents(
                rawG,
                integrationParameters.raw,
                islands.raw,
                broadPhase.raw,
                narrowPhase.raw,
                bodies.raw,
                colliders.raw,
                joints.raw,
                ccdSolver.raw,
                eventQueue.raw
            );
        } else {
            this.raw.step(
                rawG,
                integrationParameters.raw,
                islands.raw,
                broadPhase.raw,
                narrowPhase.raw,
                bodies.raw,
                colliders.raw,
                joints.raw,
                ccdSolver.raw,
            )
        }

        rawG.free();
    }


    /**
     * Removes a rigid-body, and everything attached to it, from the given sets.
     * @param handle - The handle of the rigid-body to remove.
     * @param bodies - The set containing the rigid-body to remove.
     * @param colliders - The set containing the colliders attached to the rigid-body to remove.
     * @param joints - The set containing the joints attached to the rigid-body to remove.
     */
    public removeRigidBody(
        handle: RigidBodyHandle,
        islands: IslandManager,
        bodies: RigidBodySet,
        colliders: ColliderSet,
        joints: JointSet,
    ) {
        this.raw.removeRigidBody(
            handle,
            islands.raw,
            bodies.raw,
            colliders.raw,
            joints.raw
        );
    }

    /**
     * Remove a collider.
     * @param handle - The handle of the collider to remove.
     * @param bodies - The set of rigid-bodies containing the parent of the collider to remove.
     * @param colliders - The set of colliders containing the collider to remove.
     */
    public removeCollider(
        handle: ColliderHandle,
        islands: IslandManager,
        bodies: RigidBodySet,
        colliders: ColliderSet,
    ) {
        this.raw.removeCollider(
            handle,
            islands.raw,
            bodies.raw,
            colliders.raw,
        );
    }
}
