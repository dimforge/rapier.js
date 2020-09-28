import {
    RawBroadPhase, RawColliderSet,
    RawIntegrationParameters, RawJointSet,
    RawNarrowPhase, RawQueryPipeline,
    RawRigidBodySet,
    RawSerializationPipeline,
    RawVector
} from "../rapier";
import {QueryPipeline} from "./query_pipeline";
import {Vector} from "../math";
import {IntegrationParameters, JointSet, RigidBodySet} from "../dynamics";
import {BroadPhase, ColliderSet, NarrowPhase} from "../geometry";
import {World} from "./world";


export class SerializationPipeline {
    RAPIER: any
    raw: RawSerializationPipeline

    free() {
        this.raw.free();
    }

    constructor(RAPIER: any) {
        this.raw = new RAPIER.RawSerializationPipeline();
        this.RAPIER = RAPIER;
    }

    public serializeAll(
        gravity: Vector,
        integrationParameters: IntegrationParameters,
        broadPhase: BroadPhase,
        narrowPhase: NarrowPhase,
        bodies: RigidBodySet,
        colliders: ColliderSet,
        joints: JointSet,
        queryPipeline: QueryPipeline
    ): Uint8Array {
        let rawGra = gravity.intoRaw(this.RAPIER);

        const res = this.raw.serializeAll(
            rawGra,
            integrationParameters,
            broadPhase.raw,
            narrowPhase.raw,
            bodies.raw,
            colliders.raw,
            joints.raw,
            queryPipeline.raw
        );
        rawGra.free();

        return res;
    }

    public deserializeAll(data: Uint8Array): World {
        return World.fromRaw(this.raw.deserializeAll(data));
    }
}