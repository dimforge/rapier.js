import {
    RawSerializationPipeline,
} from "@dimforge/rapier-core2d";
import {QueryPipeline} from "./query_pipeline";
import {Vector, VectorInterface} from "../math";
import {IntegrationParameters, JointSet, RigidBodySet} from "../dynamics";
import {BroadPhase, ColliderSet, NarrowPhase} from "../geometry";
import {World} from "./world";

/**
 * A pipeline for serializing the physics scene.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `queryPipeline.free()`
 * once you are done using it (and all the rigid-bodies it created).
 */
export class SerializationPipeline {
    RAPIER: any
    raw: RawSerializationPipeline

    /**
     * Release the WASM memory occupied by this serialization pipeline.
     */
    free() {
        this.raw.free();
        this.raw = undefined;
    }

    constructor(RAPIER: any, raw?: RawSerializationPipeline) {
        this.raw = raw || new RAPIER.RawSerializationPipeline();
        this.RAPIER = RAPIER;
    }

    /**
     * Serialize a complete physics state into a single byte array.
     * @param gravity - The current gravity affecting the simulation.
     * @param integrationParameters - The integration parameters of the simulation.
     * @param broadPhase - The broad-phase of the simulation.
     * @param narrowPhase - The narrow-phase of the simulation.
     * @param bodies - The rigid-bodies taking part into the simulation.
     * @param colliders - The colliders taking part into the simulation.
     * @param joints - The joints taking part into the simulation.
     * @param queryPipeline - The query pipeline taking part into the simulation.
     */
    public serializeAll(
        gravity: VectorInterface,
        integrationParameters: IntegrationParameters,
        broadPhase: BroadPhase,
        narrowPhase: NarrowPhase,
        bodies: RigidBodySet,
        colliders: ColliderSet,
        joints: JointSet,
        queryPipeline: QueryPipeline
    ): Uint8Array {
        let rawGra = Vector.intoRaw(this.RAPIER, gravity);

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

    /**
     * Deserialize the complete physics state from a single byte array.
     *
     * @param data - The byte array to deserialize.
     */
    public deserializeAll(data: Uint8Array): World {
        return World.fromRaw(this.RAPIER, this.raw.deserializeAll(data));
    }
}