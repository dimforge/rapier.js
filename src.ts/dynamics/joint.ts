import {Rotation, Vector, VectorOps, RotationOps} from "../math";
import {RawJointParams, RawJointSet, RawRigidBodySet} from "../raw";
import {RigidBodyHandle} from "./rigid_body"

/**
 * The integer identifier of a collider added to a `ColliderSet`.
 */
export type JointHandle = number;

/**
 * An enum grouping all possible types of joints:
 * - `Ball`: A Ball joint that removes all relative linear degrees of freedom between the affected bodies.
 * - `Fixed`: A fixed joint that removes all relative degrees of freedom between the affected bodies.
 * - `Prismatic`: A prismatic joint that removes all degrees of freedom between the affected
 *                bodies except for the translation along one axis.
 * - `Revolute`: (3D only) A revolute joint that removes all degrees of freedom between the affected
 *               bodies except for the rotation along one axis.
 */
export enum JointType {
    Ball,
    Fixed,
    Prismatic,
    // #if DIM3
    Revolute,
    // #endif
}

export class Joint {
    private rawSet: RawJointSet; // The Joint won't need to free this.
    handle: JointHandle;

    constructor(rawSet: RawJointSet, handle: JointHandle) {
        this.rawSet = rawSet;
        this.handle = handle;
    }


    /**
     * Checks if this joint is still valid (i.e. that it has
     * not been deleted from the joint set yet).
     */
    public isValid(): boolean {
        return this.rawSet.contains(this.handle);
    }

    /**
     * The unique integer identifier of the first rigid-body this joint it attached to.
     */
    public bodyHandle1(): RigidBodyHandle {
        return this.rawSet.jointBodyHandle1(this.handle);
    }

    /**
     * The unique integer identifier of the second rigid-body this joint is attached to.
     */
    public bodyHandle2(): RigidBodyHandle {
        return this.rawSet.jointBodyHandle2(this.handle);
    }

    /**
     * The type of this joint given as a string.
     */
    public type(): JointType {
        return this.rawSet.jointType(this.handle);
    }

    // #if DIM3
    /**
     * The rotation quaternion that aligns this joint's first local axis to the `x` axis.
     */
    public frameX1(): Rotation {
        return RotationOps.fromRaw(this.rawSet.jointFrameX1(this.handle));
    }

    // #endif

    // #if DIM3
    /**
     * The rotation matrix that aligns this joint's second local axis to the `x` axis.
     */
    public frameX2(): Rotation {
        return RotationOps.fromRaw(this.rawSet.jointFrameX2(this.handle));
    }

    // #endif

    /**
     * The position of the first anchor of this joint.
     *
     * The first anchor gives the position of the points application point on the
     * local frame of the first rigid-body it is attached to.
     */
    public anchor1(): Vector {
        return VectorOps.fromRaw(this.rawSet.jointAnchor1(this.handle));
    }

    /**
     * The position of the second anchor of this joint.
     *
     * The second anchor gives the position of the points application point on the
     * local frame of the second rigid-body it is attached to.
     */
    public anchor2(): Vector {
        return VectorOps.fromRaw(this.rawSet.jointAnchor2(this.handle));
    }

    /**
     * The first axis of this joint, if any.
     *
     * For joints where an application axis makes sense (e.g. the revolute and prismatic joins),
     * this returns the application axis on the first rigid-body this joint is attached to, expressed
     * in the local-space of this first rigid-body.
     */
    public axis1(): Vector {
        return VectorOps.fromRaw(this.rawSet.jointAxis1(this.handle));
    }

    /**
     * The second axis of this joint, if any.
     *
     * For joints where an application axis makes sence (e.g. the revolute and prismatic joins),
     * this returns the application axis on the second rigid-body this joint is attached to, expressed
     * in the local-space of this second rigid-body.
     */
    public axis2(): Vector {
        return VectorOps.fromRaw(this.rawSet.jointAxis2(this.handle))
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

    /**
     * Create a new joint descriptor that builds Ball joints.
     *
     * A ball joints allows three relative rotational degrees of freedom
     * by preventing any relative translation between the anchors of the
     * two attached rigid-bodies.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     */
    public static ball(anchor1: Vector, anchor2: Vector): JointParams {
        let res = new JointParams();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.jointType = JointType.Ball;
        return res;
    }

    // #if DIM3
    /**
     * Create a new joint descriptor that builds Revolute joints.
     *
     * A revolute joint removes all degrees of freedom between the affected
     * bodies except for the rotation along one axis.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param axis1 - Axis of the joint, expressed in the local-space of the first rigid-body it is attached to.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param axis2 - Axis of the joint, expressed in the local-space of the second rigid-body it is attached to.
     */
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

    public intoRaw(): RawJointParams {
        let rawA1 = VectorOps.intoRaw(this.anchor1);
        let rawA2 = VectorOps.intoRaw(this.anchor2);
        let result;

        switch (this.jointType) {
            case JointType.Ball:
                result = RawJointParams.ball(rawA1, rawA2);
                break;
            // #if DIM3
            case JointType.Revolute:
                let rawAx1 = VectorOps.intoRaw(this.axis1);
                let rawAx2 = VectorOps.intoRaw(this.axis2);
                result = RawJointParams.revolute(rawA1, rawAx1, rawA2, rawAx2);
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