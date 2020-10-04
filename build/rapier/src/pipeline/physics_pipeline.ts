import {RawPhysicsPipeline} from "@dimforge/rapier-core2d";
import {Vector, VectorInterface} from "../math";
import {IntegrationParameters, JointSet, RigidBodyHandle, RigidBodySet} from "../dynamics";
import {BroadPhase, ColliderHandle, ColliderSet, NarrowPhase} from "../geometry";
import {EventQueue} from "./event_queue";

export class PhysicsPipeline {
    RAPIER: any
    raw: RawPhysicsPipeline

    public free() {
        this.raw.free();
        this.raw = undefined;
    }

    constructor(RAPIER, raw?: RawPhysicsPipeline) {
        this.raw = raw || new RAPIER.RawPhysicsPipeline();
        this.RAPIER = RAPIER;
    }

    public step(
        gravity: VectorInterface,
        integrationParameters: IntegrationParameters,
        broadPhase: BroadPhase,
        narrowPhase: NarrowPhase,
        bodies: RigidBodySet,
        colliders: ColliderSet,
        joints: JointSet,
        eventQueue?: EventQueue,
    ) {
        let rawG = Vector.intoRaw(this.RAPIER, gravity);

        if (!!eventQueue) {
            this.raw.stepWithEvents(
                rawG,
                integrationParameters.raw,
                broadPhase.raw,
                narrowPhase.raw,
                bodies.raw,
                colliders.raw,
                joints.raw,
                eventQueue.raw
            );
        } else {
            this.raw.step(
                rawG,
                integrationParameters.raw,
                broadPhase.raw,
                narrowPhase.raw,
                bodies.raw,
                colliders.raw,
                joints.raw,
            )
        }
        rawG.free();
    }


    public removeRigidBody(
        handle: RigidBodyHandle,
        broadPhase: BroadPhase,
        narrowPhase: NarrowPhase,
        bodies: RigidBodySet,
        colliders: ColliderSet,
        joints: JointSet,
    ) {
        this.raw.removeRigidBody(
            handle,
            broadPhase.raw,
            narrowPhase.raw,
            bodies.raw,
            colliders.raw,
            joints.raw
        );
    }

    public removeCollider(
        handle: ColliderHandle,
        broadPhase: BroadPhase,
        narrowPhase: NarrowPhase,
        bodies: RigidBodySet,
        colliders: ColliderSet,
    ) {
        this.raw.removeCollider(
            handle,
            broadPhase.raw,
            narrowPhase.raw,
            bodies.raw,
            colliders.raw,
        );
    }
}