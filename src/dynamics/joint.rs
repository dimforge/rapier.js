use crate::math::{RawRotation, RawVector};
use na::Unit;
#[cfg(feature = "dim3")]
use rapier::dynamics::SphericalJoint;
use rapier::dynamics::{
    FixedJoint, JointAxis, JointData, MotorModel, PrismaticJoint, RevoluteJoint,
};
use rapier::math::Isometry;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub enum RawJointType {
    Ball,
    Fixed,
    Prismatic,
    Revolute,
}

#[wasm_bindgen]
pub enum RawMotorModel {
    VelocityBased,
    AccelerationBased,
    // ForceBased,
}

impl From<RawMotorModel> for MotorModel {
    fn from(model: RawMotorModel) -> MotorModel {
        match model {
            RawMotorModel::VelocityBased => MotorModel::VelocityBased,
            RawMotorModel::AccelerationBased => MotorModel::AccelerationBased,
        }
    }
}

#[cfg(feature = "dim2")]
#[wasm_bindgen]
#[derive(Copy, Clone)]
pub enum RawJointAxis {
    X,
    Y,
    AngX,
}

#[cfg(feature = "dim3")]
#[wasm_bindgen]
#[derive(Copy, Clone)]
pub enum RawJointAxis {
    X,
    Y,
    Z,
    AngX,
    AngY,
    AngZ,
}

impl From<RawJointAxis> for JointAxis {
    fn from(axis: RawJointAxis) -> JointAxis {
        match axis {
            RawJointAxis::X => JointAxis::X,
            RawJointAxis::Y => JointAxis::Y,
            #[cfg(feature = "dim3")]
            RawJointAxis::Z => JointAxis::Z,
            RawJointAxis::AngX => JointAxis::AngX,
            #[cfg(feature = "dim3")]
            RawJointAxis::AngY => JointAxis::AngY,
            #[cfg(feature = "dim3")]
            RawJointAxis::AngZ => JointAxis::AngZ,
        }
    }
}

#[wasm_bindgen]
pub struct RawJointData(pub(crate) JointData);

#[wasm_bindgen]
impl RawJointData {
    /// Create a new joint descriptor that builds spehrical joints.
    ///
    /// A spherical joints allows three relative rotational degrees of freedom
    /// by preventing any relative translation between the anchors of the
    /// two attached rigid-bodies.
    #[cfg(feature = "dim3")]
    pub fn spherical(anchor1: &RawVector, anchor2: &RawVector) -> Self {
        Self(
            SphericalJoint::new()
                .local_anchor1(anchor1.0.into())
                .local_anchor2(anchor2.0.into())
                .into(),
        )
    }

    /// Creates a new joint descriptor that builds a Prismatic joint.
    ///
    /// A prismatic joint removes all the degrees of freedom between the
    /// affected bodies, except for the translation along one axis.
    ///
    /// Returns `None` if any of the provided axes cannot be normalized.
    #[cfg(feature = "dim2")]
    pub fn prismatic(
        anchor1: &RawVector,
        anchor2: &RawVector,
        axis: &RawVector,
        limitsEnabled: bool,
        limitsMin: f32,
        limitsMax: f32,
    ) -> Option<RawJointData> {
        let axis = Unit::try_new(axis.0, 0.0)?;
        let mut joint = PrismaticJoint::new(axis)
            .local_anchor1(anchor1.0.into())
            .local_anchor2(anchor2.0.into());

        if limitsEnabled {
            joint = joint.limit_axis([limitsMin, limitsMax]);
        }

        Some(Self(joint.into()))
    }

    /// Creates a new joint descriptor that builds a Prismatic joint.
    ///
    /// A prismatic joint removes all the degrees of freedom between the
    /// affected bodies, except for the translation along one axis.
    ///
    /// Returns `None` if any of the provided axes cannot be normalized.
    #[cfg(feature = "dim3")]
    pub fn prismatic(
        anchor1: &RawVector,
        anchor2: &RawVector,
        axis: &RawVector,
        limitsEnabled: bool,
        limitsMin: f32,
        limitsMax: f32,
    ) -> Option<RawJointData> {
        let axis = Unit::try_new(axis.0, 0.0)?;
        let mut joint = PrismaticJoint::new(axis)
            .local_anchor1(anchor1.0.into())
            .local_anchor2(anchor2.0.into());

        if limitsEnabled {
            joint = joint.limit_axis([limitsMin, limitsMax]);
        }

        Some(Self(joint.into()))
    }

    /// Creates a new joint descriptor that builds a Fixed joint.
    ///
    /// A fixed joint removes all the degrees of freedom between the affected bodies.
    pub fn fixed(
        anchor1: &RawVector,
        axes1: &RawRotation,
        anchor2: &RawVector,
        axes2: &RawRotation,
    ) -> RawJointData {
        let pos1 = Isometry::from_parts(anchor1.0.into(), axes1.0);
        let pos2 = Isometry::from_parts(anchor2.0.into(), axes2.0);
        Self(
            FixedJoint::new()
                .local_frame1(pos1)
                .local_frame2(pos2)
                .into(),
        )
    }

    /// Create a new joint descriptor that builds Revolute joints.
    ///
    /// A revolute joint removes all degrees of freedom between the affected
    /// bodies except for the rotation.
    #[cfg(feature = "dim2")]
    pub fn revolute(anchor1: &RawVector, anchor2: &RawVector) -> Option<RawJointData> {
        Some(Self(
            RevoluteJoint::new()
                .local_anchor1(anchor1.0.into())
                .local_anchor2(anchor2.0.into())
                .into(),
        ))
    }

    /// Create a new joint descriptor that builds Revolute joints.
    ///
    /// A revolute joint removes all degrees of freedom between the affected
    /// bodies except for the rotation along one axis.
    #[cfg(feature = "dim3")]
    pub fn revolute(
        anchor1: &RawVector,
        anchor2: &RawVector,
        axis: &RawVector,
    ) -> Option<RawJointData> {
        let axis = Unit::try_new(axis.0, 0.0)?;
        Some(Self(
            RevoluteJoint::new(axis)
                .local_anchor1(anchor1.0.into())
                .local_anchor2(anchor2.0.into())
                .into(),
        ))
    }
}
