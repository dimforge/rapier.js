import {RawJointSet} from "@dimforge/rapier-core2d"
import {RigidBodySet} from "./rigid_body_set";
import {Joint, JointHandle, JointParams} from "./joint";
import {RigidBody} from "./rigid_body";

export class JointSet {
    private RAPIER: any;
    raw: RawJointSet;

    public free() {
        this.raw.free();
        this.raw = undefined;
    }

    constructor(RAPIER: any, raw?: RawJointSet) {
        this.RAPIER = RAPIER;
        this.raw = raw || new RAPIER.RawJointSet();
    }

    public createJoint(
        bodies: RigidBodySet,
        desc: JointParams,
        parent1: number,
        parent2: number
    ): number {
        const rawParams = desc.intoRaw(this.RAPIER);
        const result = this.raw.createJoint(bodies.raw, rawParams, parent1, parent2);
        rawParams.free();
        return result;
    }

    public get(handle: JointHandle): Joint {
        if (this.raw.isHandleValid(handle)) {
            return new Joint(this.RAPIER, this.raw, handle);
        } else {
            return null;
        }
    }
}
