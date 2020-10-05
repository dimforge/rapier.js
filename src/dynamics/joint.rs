use crate::dynamics::RawJointSet;
use crate::math::{RawRotation, RawVector};
use rapier::dynamics::{BallJoint, JointParams};
use wasm_bindgen::prelude::*;
#[cfg(feature = "dim3")]
use {
    na::{Matrix3, Rotation3, Unit, UnitQuaternion},
    rapier::dynamics::RevoluteJoint,
    rapier::utils::WBasis,
};

#[wasm_bindgen]
pub enum RawJointType {
    Ball,
    Fixed,
    Prismatic,
    Revolute,
}

#[wasm_bindgen]
impl RawJointSet {
    /// The unique integer identifier of the first rigid-body this joint it attached to.
    pub fn jointBodyHandle1(&self, handle: usize) -> usize {
        self.map(handle, |j| j.body1.into_raw_parts().0)
    }

    /// The unique integer identifier of the second rigid-body this joint is attached to.
    pub fn jointBodyHandle2(&self, handle: usize) -> usize {
        self.map(handle, |j| j.body2.into_raw_parts().0)
    }

    /// The type of this joint given as a string.
    pub fn jointType(&self, handle: usize) -> RawJointType {
        self.map(handle, |j| match &j.params {
            JointParams::BallJoint(_) => RawJointType::Ball,
            JointParams::FixedJoint(_) => RawJointType::Fixed,
            JointParams::PrismaticJoint(_) => RawJointType::Prismatic,
            #[cfg(feature = "dim3")]
            JointParams::RevoluteJoint(_) => RawJointType::Revolute,
        })
    }

    /// The rotation quaternion that aligns this joint's first local axis to the `x` axis.
    #[cfg(feature = "dim3")]
    pub fn jointFrameX1(&self, handle: usize) -> RawRotation {
        self.map(handle, |j| {
            let local_axis1 = match &j.params {
                JointParams::BallJoint(_) => return RawRotation::identity(),
                JointParams::FixedJoint(f) => return RawRotation(f.local_anchor1.rotation),
                #[cfg(feature = "dim3")]
                JointParams::RevoluteJoint(r) => *r.local_axis1,
                JointParams::PrismaticJoint(p) => *p.local_axis1(),
            };

            // TODO: can't we just do rotation_between?
            let basis1a = local_axis1.orthonormal_basis()[0];
            let basis1b = local_axis1.cross(&basis1a);

            let rotmat1 = Rotation3::from_matrix_unchecked(Matrix3::from_columns(&[
                local_axis1,
                basis1a,
                basis1b,
            ]));

            let axisangle1 = rotmat1.scaled_axis();
            RawRotation(UnitQuaternion::new(axisangle1))
        })
    }

    /// The rotation matrix that aligns this joint's second local axis to the `x` axis.
    #[cfg(feature = "dim3")]
    pub fn jointFrameX2(&self, handle: usize) -> RawRotation {
        self.map(handle, |j| {
            let local_axis2 = match &j.params {
                JointParams::BallJoint(_) => return RawRotation::identity(),
                JointParams::FixedJoint(f) => return RawRotation(f.local_anchor2.rotation),
                #[cfg(feature = "dim3")]
                JointParams::RevoluteJoint(r) => *r.local_axis2,
                JointParams::PrismaticJoint(p) => *p.local_axis2(),
            };

            // TODO: can't we just do rotation_between?
            let basis2a = local_axis2.orthonormal_basis()[0];
            let basis2b = local_axis2.cross(&basis2a);

            let rotmat2 = Rotation3::from_matrix_unchecked(Matrix3::from_columns(&[
                local_axis2,
                basis2a,
                basis2b,
            ]));

            let axisangle2 = rotmat2.scaled_axis();
            RawRotation(UnitQuaternion::new(axisangle2))
        })
    }

    /// The position of the first anchor of this joint.
    ///
    /// The first anchor gives the position of the points application point on the
    /// local frame of the first rigid-body it is attached to.
    pub fn jointAnchor1(&self, handle: usize) -> RawVector {
        self.map(handle, |j| match &j.params {
            JointParams::BallJoint(b) => RawVector(b.local_anchor1.coords),
            #[cfg(feature = "dim3")]
            JointParams::RevoluteJoint(r) => RawVector(r.local_anchor1.coords),
            JointParams::FixedJoint(f) => RawVector(f.local_anchor1.translation.vector),
            JointParams::PrismaticJoint(p) => RawVector(p.local_anchor1.coords),
        })
    }

    /// The position of the second anchor of this joint.
    ///
    /// The second anchor gives the position of the points application point on the
    /// local frame of the second rigid-body it is attached to.
    pub fn jointAnchor2(&self, handle: usize) -> RawVector {
        self.map(handle, |j| match &j.params {
            JointParams::BallJoint(b) => RawVector(b.local_anchor2.coords),
            #[cfg(feature = "dim3")]
            JointParams::RevoluteJoint(r) => RawVector(r.local_anchor2.coords),
            JointParams::FixedJoint(f) => RawVector(f.local_anchor2.translation.vector),
            JointParams::PrismaticJoint(p) => RawVector(p.local_anchor2.coords),
        })
    }

    /// The first axis of this joint, if any.
    ///
    /// For joints where an application axis makes sence (e.g. the revolute and prismatic joins),
    /// this returns the application axis on the first rigid-body this joint is attached to, expressed
    /// in the local-space of this first rigid-body.
    pub fn jointAxis1(&self, handle: usize) -> Option<RawVector> {
        self.map(handle, |j| match &j.params {
            JointParams::BallJoint(_) | JointParams::FixedJoint(_) => None,
            #[cfg(feature = "dim3")]
            JointParams::RevoluteJoint(r) => Some(RawVector(*r.local_axis1)),
            JointParams::PrismaticJoint(p) => Some(RawVector(*p.local_axis1())),
        })
    }

    /// The second axis of this joint, if any.
    ///
    /// For joints where an application axis makes sence (e.g. the revolute and prismatic joins),
    /// this returns the application axis on the second rigid-body this joint is attached to, expressed
    /// in the local-space of this second rigid-body.
    pub fn jointAxis2(&self, handle: usize) -> Option<RawVector> {
        self.map(handle, |j| match &j.params {
            JointParams::BallJoint(_) | JointParams::FixedJoint(_) => None,
            #[cfg(feature = "dim3")]
            JointParams::RevoluteJoint(r) => Some(RawVector(*r.local_axis2)),
            JointParams::PrismaticJoint(p) => Some(RawVector(*p.local_axis2())),
        })
    }
}

#[wasm_bindgen]
pub struct RawJointParams(pub(crate) JointParams);

#[wasm_bindgen]
impl RawJointParams {
    /// Create a new joint descriptor that builds Ball joints.
    ///
    /// A ball joints allows three relative rotational degrees of freedom
    /// by preventing any relative translation between the anchors of the
    /// two attached rigid-bodies.
    pub fn ball(anchor1: &RawVector, anchor2: &RawVector) -> Self {
        Self(JointParams::BallJoint(BallJoint::new(
            anchor1.0.into(),
            anchor2.0.into(),
        )))
    }

    /// Create a new joint descriptor that builds Revolute joints.
    ///
    /// A revolute joint removes all degrees of degrees of freedom between the affected
    /// bodies except for the translation along one axis.
    #[cfg(feature = "dim3")]
    pub fn revolute(
        anchor1: &RawVector,
        axis1: &RawVector,
        anchor2: &RawVector,
        axis2: &RawVector,
    ) -> Option<RawJointParams> {
        let axis1 = Unit::try_new(axis1.0, 0.0)?;
        let axis2 = Unit::try_new(axis2.0, 0.0)?;
        Some(Self(JointParams::RevoluteJoint(RevoluteJoint::new(
            anchor1.0.into(),
            axis1,
            anchor2.0.into(),
            axis2,
        ))))
    }
}
