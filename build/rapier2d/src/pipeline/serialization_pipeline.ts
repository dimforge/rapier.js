import {
    RawBroadPhase, RawColliderSet,
    RawIntegrationParameters, RawJointSet,
    RawNarrowPhase, RawQueryPipeline,
    RawRigidBodySet,
    RawSerializationPipeline,
    RawVector
} from "@dimforge/raw-rapier2d";
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
        this.raw = undefined;
    }

    constructor(RAPIER: any, raw?: RawSerializationPipeline) {
        this.raw = raw || new RAPIER.RawSerializationPipeline();
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
            integrationParameters.raw,
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
        return World.fromRaw(this.RAPIER, this.raw.deserializeAll(data));
    }
}