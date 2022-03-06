import { Rotation, Vector, VectorOps, RotationOps } from "../math";
import { RawGenericJoint, RawImpulseJointSet, RawRigidBodySet, RawJointAxis } from "../raw";
import { RigidBodyHandle } from "./rigid_body"
// #if DIM3
import { Quaternion } from "../math";
// #endif

/**
 * The integer identifier of a collider added to a `ColliderSet`.
 */
export type ImpulseJointHandle = number;

/**
 * An enum grouping all possible types of joints:
 *
 * - `Revolute`: A revolute joint that removes all degrees of freedom between the affected
 *               bodies except for the rotation along one axis.
 * - `Fixed`: A fixed joint that removes all relative degrees of freedom between the affected bodies.
 * - `Prismatic`: A prismatic joint that removes all degrees of freedom between the affected
 *                bodies except for the translation along one axis.
 * - `Spherical`: (3D only) A spherical joint that removes all relative linear degrees of freedom between the affected bodies.
 */
export enum JointType {
    Revolute,
    Fixed,
    Prismatic,
    // #if DIM3
    Spherical,
    // #endif
}

export enum MotorModel {
    AccelerationBased,
    ForceBased,
}

export class ImpulseJoint {
    protected rawSet: RawImpulseJointSet; // The ImpulseJoint won't need to free this.
    handle: ImpulseJointHandle;

    constructor(rawSet: RawImpulseJointSet, handle: ImpulseJointHandle) {
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
}

export class UnitImpulseJoint extends ImpulseJoint {
    /**
     * The axis left free by this joint.
     */
    protected rawAxis?(): RawJointAxis;

    /**
     * Are the limits enabled for this joint?
     */
    public limitsEnabled(): boolean {
        return this.rawSet.jointLimitsEnabled(this.handle, this.rawAxis());
    }

    /**
     * The min limit of this joint.
     */
    public limitsMin(): number {
        return this.rawSet.jointLimitsMin(this.handle, this.rawAxis());
    }

    /**
     * The max limit of this joint.
     */
    public limitsMax(): number {
        return this.rawSet.jointLimitsMax(this.handle, this.rawAxis());
    }

    public configureMotorModel(model: MotorModel) {
        this.rawSet.jointConfigureMotorModel(this.handle, this.rawAxis(), model);
    }

    public configureMotorVelocity(targetVel: number, factor: number) {
        this.rawSet.jointConfigureMotorVelocity(this.handle, this.rawAxis(), targetVel, factor);
    }

    public configureMotorPosition(targetPos: number, stiffness: number, damping: number) {
        this.rawSet.jointConfigureMotorPosition(this.handle, this.rawAxis(), targetPos, stiffness, damping);
    }

    public configureMotor(targetPos: number, targetVel: number, stiffness: number, damping: number) {
        this.rawSet.jointConfigureMotor(this.handle, this.rawAxis(), targetPos, targetVel, stiffness, damping);
    }
}

export class FixedImpulseJoint extends ImpulseJoint {
}

export class PrismaticImpulseJoint extends UnitImpulseJoint {
    public rawAxis(): RawJointAxis {
        return RawJointAxis.X;
    }
}

export class RevoluteImpulseJoint extends UnitImpulseJoint {
    public rawAxis(): RawJointAxis {
        return RawJointAxis.AngX;
    }
}

// #if DIM3
export class SphericalImpulseJoint extends ImpulseJoint {
    /* Unsupported by this alpha release.
    public configureMotorModel(model: MotorModel) {
        this.rawSet.jointConfigureMotorModel(this.handle, model);
    }

    public configureMotorVelocity(targetVel: Vector, factor: number) {
        this.rawSet.jointConfigureBallMotorVelocity(this.handle, targetVel.x, targetVel.y, targetVel.z, factor);
    }

    public configureMotorPosition(targetPos: Quaternion, stiffness: number, damping: number) {
        this.rawSet.jointConfigureBallMotorPosition(this.handle, targetPos.w, targetPos.x, targetPos.y, targetPos.z, stiffness, damping);
    }

    public configureMotor(targetPos: Quaternion, targetVel: Vector, stiffness: number, damping: number) {
        this.rawSet.jointConfigureBallMotor(this.handle,
            targetPos.w, targetPos.x, targetPos.y, targetPos.z,
            targetVel.x, targetVel.y, targetVel.z,
            stiffness, damping);
    }
     */
}
// #endif



export class JointData {
    anchor1: Vector
    anchor2: Vector
    axis: Vector
    frame1: Rotation
    frame2: Rotation
    jointType: JointType
    limitsEnabled: boolean
    limits: Array<number>

    private constructor() {
    }

    /**
     * Creates a new joint descriptor that builds a Fixed joint.
     *
     * A fixed joint removes all the degrees of freedom between the affected bodies, ensuring their
     * anchor and local frames coincide in world-space.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param frame1 - The reference orientation of the joint wrt. the first rigid-body.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param frame2 - The reference orientation of the joint wrt. the second rigid-body.
     */
    public static fixed(anchor1: Vector, frame1: Rotation, anchor2: Vector, frame2: Rotation): JointData {
        let res = new JointData();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.frame1 = frame1;
        res.frame2 = frame2;
        res.jointType = JointType.Fixed;
        return res;
    }

    // #if DIM2

    /**
     * Create a new joint descriptor that builds revolute joints.
     *
     * A revolute joint allows three relative rotational degrees of freedom
     * by preventing any relative translation between the anchors of the
     * two attached rigid-bodies.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     */
    public static revolute(anchor1: Vector, anchor2: Vector): JointData {
        let res = new JointData();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.jointType = JointType.Revolute;
        return res;
    }

    /**
     * Creates a new joint descriptor that builds a Prismatic joint.
     *
     * A prismatic joint removes all the degrees of freedom between the
     * affected bodies, except for the translation along one axis.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param axis - Axis of the joint, expressed in the local-space of the rigid-bodies it is attached to.
     */
    public static prismatic(anchor1: Vector, anchor2: Vector, axis: Vector): JointData {
        let res = new JointData();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.axis = axis;
        res.jointType = JointType.Prismatic;
        return res;
    }

    // #endif

    // #if DIM3
    /**
     * Create a new joint descriptor that builds spherical joints.
     *
     * A spherical joint allows three relative rotational degrees of freedom
     * by preventing any relative translation between the anchors of the
     * two attached rigid-bodies.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     */
    public static spherical(anchor1: Vector, anchor2: Vector): JointData {
        let res = new JointData();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.jointType = JointType.Spherical;
        return res;
    }

    /**
     * Creates a new joint descriptor that builds a Prismatic joint.
     *
     * A prismatic joint removes all the degrees of freedom between the
     * affected bodies, except for the translation along one axis.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param axis - Axis of the joint, expressed in the local-space of the rigid-bodies it is attached to.
     */
    public static prismatic(
        anchor1: Vector,
        anchor2: Vector,
        axis: Vector,
    ): JointData {
        let res = new JointData();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.axis = axis;
        res.jointType = JointType.Prismatic;
        return res;
    }

    /**
     * Create a new joint descriptor that builds Revolute joints.
     *
     * A revolute joint removes all degrees of freedom between the affected
     * bodies except for the rotation along one axis.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param axis - Axis of the joint, expressed in the local-space of the rigid-bodies it is attached to.
     */
    public static revolute(
        anchor1: Vector,
        anchor2: Vector,
        axis: Vector,
    ): JointData {
        let res = new JointData();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.axis = axis;
        res.jointType = JointType.Revolute;
        return res;
    }

    // #endif

    public intoRaw(): RawGenericJoint {
        let rawA1 = VectorOps.intoRaw(this.anchor1);
        let rawA2 = VectorOps.intoRaw(this.anchor2);
        let rawAx;
        let result;
        let limitsEnabled = false;
        let limitsMin = 0.0;
        let limitsMax = 0.0;

        switch (this.jointType) {
            case JointType.Fixed:
                let rawFra1 = RotationOps.intoRaw(this.frame1);
                let rawFra2 = RotationOps.intoRaw(this.frame2);
                result = RawGenericJoint.fixed(rawA1, rawFra1, rawA2, rawFra2);
                rawFra1.free();
                rawFra2.free();
                break;
            case JointType.Prismatic:
                rawAx = VectorOps.intoRaw(this.axis);

                if (!!this.limitsEnabled) {
                    limitsEnabled = true;
                    limitsMin = this.limits[0];
                    limitsMax = this.limits[1];
                }

                // #if DIM2
                result = RawGenericJoint.prismatic(
                    rawA1,
                    rawA2,
                    rawAx,
                    limitsEnabled,
                    limitsMin,
                    limitsMax,
                );
                // #endif

                // #if DIM3
                result = RawGenericJoint.prismatic(
                    rawA1,
                    rawA2,
                    rawAx,
                    limitsEnabled,
                    limitsMin,
                    limitsMax,
                );
                // #endif

                rawAx.free();
                break;
            // #if DIM2
            case JointType.Revolute:
                result = RawGenericJoint.revolute(rawA1, rawA2);
                break;
            // #endif
            // #if DIM3
            case JointType.Spherical:
                result = RawGenericJoint.spherical(rawA1, rawA2);
                break;
            case JointType.Revolute:
                rawAx = VectorOps.intoRaw(this.axis);
                result = RawGenericJoint.revolute(rawA1, rawA2, rawAx);
                rawAx.free();
                break;
            // #endif
        }

        rawA1.free();
        rawA2.free();

        return result;
    }
}