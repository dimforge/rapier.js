use crate::math::{RawRotation, RawVector};
use na::Unit;
#[cfg(feature = "dim3")]
use rapier::dynamics::SphericalJointBuilder;
use rapier::dynamics::{
    FixedJointBuilder, GenericJoint, JointAxesMask, JointAxis, MotorModel, PrismaticJointBuilder,
    RevoluteJointBuilder,
};
use rapier::math::Isometry;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[cfg(feature = "dim2")]
pub enum RawJointType {
    Revolute,
    Fixed,
    Prismatic,
    Generic,
}

#[wasm_bindgen]
#[cfg(feature = "dim3")]
pub enum RawJointType {
    Revolute,
    Fixed,
    Prismatic,
    Spherical,
    Generic,
}

/// The type of this joint.
#[cfg(feature = "dim2")]
impl From<JointAxesMask> for RawJointType {
    fn from(ty: JointAxesMask) -> RawJointType {
        let rev_axes = JointAxesMask::X | JointAxesMask::Y;
        let pri_axes = JointAxesMask::Y | JointAxesMask::ANG_X;
        let fix_axes = JointAxesMask::X | JointAxesMask::Y | JointAxesMask::ANG_X;

        if ty == rev_axes {
            RawJointType::Revolute
        } else if ty == pri_axes {
            RawJointType::Prismatic
        } else if ty == fix_axes {
            RawJointType::Fixed
        } else {
            RawJointType::Generic
        }
    }
}

/// The type of this joint.
#[cfg(feature = "dim3")]
impl From<JointAxesMask> for RawJointType {
    fn from(ty: JointAxesMask) -> RawJointType {
        let rev_axes = JointAxesMask::X
            | JointAxesMask::Y
            | JointAxesMask::Z
            | JointAxesMask::ANG_Y
            | JointAxesMask::ANG_Z;
        let pri_axes = JointAxesMask::Y
            | JointAxesMask::Z
            | JointAxesMask::ANG_X
            | JointAxesMask::ANG_Y
            | JointAxesMask::ANG_Z;
        let sph_axes = JointAxesMask::ANG_X | JointAxesMask::ANG_Y | JointAxesMask::ANG_Z;
        let fix_axes = JointAxesMask::X
            | JointAxesMask::Y
            | JointAxesMask::Z
            | JointAxesMask::ANG_X
            | JointAxesMask::ANG_Y
            | JointAxesMask::ANG_Z;

        if ty == rev_axes {
            RawJointType::Revolute
        } else if ty == pri_axes {
            RawJointType::Prismatic
        } else if ty == sph_axes {
            RawJointType::Spherical
        } else if ty == fix_axes {
            RawJointType::Fixed
        } else {
            RawJointType::Generic
        }
    }
}

#[wasm_bindgen]
pub enum RawMotorModel {
    AccelerationBased,
    ForceBased,
}

impl From<RawMotorModel> for MotorModel {
    fn from(model: RawMotorModel) -> MotorModel {
        match model {
            RawMotorModel::AccelerationBased => MotorModel::AccelerationBased,
            RawMotorModel::ForceBased => MotorModel::ForceBased,
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
pub struct RawGenericJoint(pub(crate) GenericJoint);

#[wasm_bindgen]
impl RawGenericJoint {
    /// Create a new joint descriptor that builds spehrical joints.
    ///
    /// A spherical joints allows three relative rotational degrees of freedom
    /// by preventing any relative translation between the anchors of the
    /// two attached rigid-bodies.
    #[cfg(feature = "dim3")]
    pub fn spherical(anchor1: &RawVector, anchor2: &RawVector) -> Self {
        Self(
            SphericalJointBuilder::new()
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
    ) -> Option<RawGenericJoint> {
        let axis = Unit::try_new(axis.0, 0.0)?;
        let mut joint = PrismaticJointBuilder::new(axis)
            .local_anchor1(anchor1.0.into())
            .local_anchor2(anchor2.0.into());

        if limitsEnabled {
            joint = joint.limits([limitsMin, limitsMax]);
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
    ) -> Option<RawGenericJoint> {
        let axis = Unit::try_new(axis.0, 0.0)?;
        let mut joint = PrismaticJointBuilder::new(axis)
            .local_anchor1(anchor1.0.into())
            .local_anchor2(anchor2.0.into());

        if limitsEnabled {
            joint = joint.limits([limitsMin, limitsMax]);
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
    ) -> RawGenericJoint {
        let pos1 = Isometry::from_parts(anchor1.0.into(), axes1.0);
        let pos2 = Isometry::from_parts(anchor2.0.into(), axes2.0);
        Self(
            FixedJointBuilder::new()
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
    pub fn revolute(anchor1: &RawVector, anchor2: &RawVector) -> Option<RawGenericJoint> {
        Some(Self(
            RevoluteJointBuilder::new()
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
    ) -> Option<RawGenericJoint> {
        let axis = Unit::try_new(axis.0, 0.0)?;
        Some(Self(
            RevoluteJointBuilder::new(axis)
                .local_anchor1(anchor1.0.into())
                .local_anchor2(anchor2.0.into())
                .into(),
        ))
    }
}
