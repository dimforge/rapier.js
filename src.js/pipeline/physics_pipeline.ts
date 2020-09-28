import {RawPhysicsPipeline} from "../rapier";
import {Vector} from "../math";
import {IntegrationParameters, JointSet, RigidBodySet} from "../dynamics";
import {BroadPhase, ColliderSet, NarrowPhase} from "../geometry";

export class PhysicsPipeline {
    RAPIER: any
    raw: RawPhysicsPipeline

    public free() {
        this.raw.free();
    }

    constructor(RAPIER) {
        this.raw = new RAPIER.RawPhysicsPipeline();
        this.RAPIER = RAPIER;
    }

    public step(
        gravity: Vector,
        integrationParameters: IntegrationParameters,
        broadPhase: BroadPhase,
        narrowPhase: NarrowPhase,
        bodies: RigidBodySet,
        colliders: ColliderSet,
        joints: JointSet,
    ) {
        let rawG = gravity.intoRaw(this.RAPIER);
        this.raw.step(
            rawG,
            integrationParameters,
            broadPhase.raw,
            narrowPhase.raw,
            bodies.raw,
            colliders.raw,
            joints.raw
        );
        rawG.free();
    }


    public removeRigidBody(
        handle: number,
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
        handle: number,
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