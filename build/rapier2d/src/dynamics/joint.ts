import {Rotation, Vector} from "../math";
import {RawJointParams, RawJointSet, RawRigidBodySet} from "@dimforge/raw-rapier2d";
import {RigidBodyHandle} from "./rigid_body"

export type JointHandle = number;

export enum JointType {
    Ball,
    Fixed,
    Prismatic,
    Revolute,
}

export class Joint {
    private RAPIER: any;
    private rawSet: RawJointSet; // The Joint won't need to free this.
    readonly handle: JointHandle;

    constructor(RAPIER: any, rawSet: RawJointSet, handle: JointHandle) {
        this.RAPIER = RAPIER;
        this.rawSet = rawSet;
        this.handle = handle;
    }

    /// The unique integer identifier of the first rigid-body this joint it attached to.
    public bodyHandle1(): RigidBodyHandle {
        return this.rawSet.jointBodyHandle1(this.handle);
    }

    /// The unique integer identifier of the second rigid-body this joint is attached to.
    public bodyHandle2(): RigidBodyHandle {
        return this.rawSet.jointBodyHandle2(this.handle);
    }

    /// The type of this joint given as a string.
    public type(): JointType {
        return this.rawSet.jointType(this.handle);
    }

    /// The rotation quaternion that aligns this joint's first local axis to the `x` axis.
    // #if DIM3
    public frameX1(): Rotation {
        return Rotation.fromRaw(this.rawSet.jointFrameX1(this.handle));
    }

    // #endif

    /// The rotation matrix that aligns this joint's second local axis to the `x` axis.
    // #if DIM3
    public frameX2(): Rotation {
        return Rotation.fromRaw(this.rawSet.jointFrameX2(this.handle));
    }

    // #endif

    /// The position of the first anchor of this joint.
    ///
    /// The first anchor gives the position of the points application point on the
    /// local frame of the first rigid-body it is attached to.
    public anchor1(): Vector {
        return Vector.fromRaw(this.rawSet.jointAnchor1(this.handle));
    }

    /// The position of the second anchor of this joint.
    ///
    /// The second anchor gives the position of the points application point on the
    /// local frame of the second rigid-body it is attached to.
    public anchor2(): Vector {
        return Vector.fromRaw(this.rawSet.jointAnchor2(this.handle));
    }

    /// The first axis of this joint, if any.
    ///
    /// For joints where an application axis makes sence (e.g. the revolute and prismatic joins),
    /// this returns the application axis on the first rigid-body this joint is attached to, expressed
    /// in the local-space of this first rigid-body.
    public axis1(): Vector {
        return Vector.fromRaw(this.rawSet.jointAxis1(this.handle));
    }

    /// The second axis of this joint, if any.
    ///
    /// For joints where an application axis makes sence (e.g. the revolute and prismatic joins),
    /// this returns the application axis on the second rigid-body this joint is attached to, expressed
    /// in the local-space of this second rigid-body.
    public axis2(): Vector {
        return Vector.fromRaw(this.rawSet.jointAxis2(this.handle))
    }
}

export class JointParams {
    anchor1: Vector
    anchor2: Vector
    axis1: Vector
    axis2: Vector
    jointType: JointType

    private constructor() {
    }

    /// Create a new joint descriptor that builds Ball joints.
    ///
    /// A ball joints allows three relative rotational degrees of freedom
    /// by preventing any relative translation between the anchors of the
    /// two attached rigid-bodies.
    public static ball(anchor1: Vector, anchor2: Vector): JointParams {
        let res = new JointParams();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.jointType = JointType.Ball;
        return res;
    }

    /// Create a new joint descriptor that builds Revolute joints.
    ///
    /// A revolute joint removes all degrees of degrees of freedom between the affected
    /// bodies except for the translation along one axis.
    // #if DIM3
    public static revolute(
        anchor1: Vector,
        axis1: Vector,
        anchor2: Vector,
        axis2: Vector,
    ): JointParams {
        let res = new JointParams();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.axis1 = axis1;
        res.axis2 = axis2;
        res.jointType = JointType.Revolute;
        return res;
    }

    // #endif

    public intoRaw(RAPIER: any): RawJointParams {
        let rawA1 = this.anchor1.intoRaw(RAPIER);
        let rawA2 = this.anchor2.intoRaw(RAPIER);
        let result;

        switch (this.jointType) {
            case JointType.Ball:
                result = RAPIER.RawJointParams.ball(rawA1, rawA2);
                break;
            // #if DIM3
            case JointType.Revolute:
                let rawAx1 = this.axis1.intoRaw(RAPIER);
                let rawAx2 = this.axis2.intoRaw(RAPIER);
                result = RAPIER.RawJointParams.revolute(rawA1, rawAx1, rawA2, rawAx2);
                rawAx1.free();
                rawAx2.free();
                break;
            // #endif
        }

        rawA1.free();
        rawA2.free();
        return result;
    }
}