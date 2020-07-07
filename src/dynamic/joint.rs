use wasm_bindgen::prelude::*;

use crate::math::{Rotation, Vector};
use na::{Matrix3, Rotation3, Unit, UnitQuaternion};
use rapier::dynamics::{
    BallJoint, Joint as RJoint, JointParams, JointSet, RevoluteJoint, RigidBodyHandle, RigidBodySet,
};
use rapier::utils::WBasis;
use std::cell::RefCell;
use std::rc::Rc;

#[wasm_bindgen]
pub struct Joint {
    pub(crate) bodies: Rc<RefCell<RigidBodySet>>,
    pub(crate) joints: Rc<RefCell<JointSet>>,
    pub(crate) handle: RigidBodyHandle,
}

impl Joint {
    pub fn map<T>(&self, f: impl FnOnce(&RJoint) -> T) -> T {
        let joints = self.joints.borrow();
        let joint = joints
            .get(self.handle)
            .expect("Invalid Joint reference. It may have been removed from the physics World.");
        f(joint)
    }
}

#[wasm_bindgen]
impl Joint {
    pub fn body_handle1(&self) -> usize {
        self.map(|j| j.body1.into_raw_parts().0)
    }

    pub fn body_handle2(&self) -> usize {
        self.map(|j| j.body2.into_raw_parts().0)
    }

    pub fn joint_type(&self) -> String {
        self.map(|j| match &j.params {
            JointParams::BallJoint(_) => "Ball".to_string(),
            JointParams::RevoluteJoint(_) => "Revolute".to_string(),
            JointParams::FixedJoint(_) => "Fixed".to_string(),
            JointParams::PrismaticJoint(_) => "Prismatic".to_string(),
        })
    }

    /// The rotation matrix that aligns this joint's first axis to the `x` axis.
    pub fn frame_x_1(&self) -> Rotation {
        self.map(|j| {
            let local_axis1 = match &j.params {
                JointParams::BallJoint(_) => return Rotation::identity(),
                JointParams::FixedJoint(f) => return Rotation(f.local_anchor1.rotation),
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
            Rotation(UnitQuaternion::new(axisangle1))
        })
    }

    /// The rotation matrix that aligns this joint's secnod to the `x` axis.
    pub fn frame_x_2(&self) -> Rotation {
        self.map(|j| {
            let local_axis2 = match &j.params {
                JointParams::BallJoint(_) => return Rotation::identity(),
                JointParams::FixedJoint(f) => return Rotation(f.local_anchor2.rotation),
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
            Rotation(UnitQuaternion::new(axisangle2))
        })
    }

    pub fn anchor1(&self) -> Vector {
        self.map(|j| match &j.params {
            JointParams::BallJoint(b) => Vector(b.local_anchor1.coords),
            JointParams::RevoluteJoint(r) => Vector(r.local_anchor1.coords),
            JointParams::FixedJoint(f) => Vector(f.local_anchor1.translation.vector),
            JointParams::PrismaticJoint(p) => Vector(p.local_anchor1.coords),
        })
    }

    pub fn anchor2(&self) -> Vector {
        self.map(|j| match &j.params {
            JointParams::BallJoint(b) => Vector(b.local_anchor2.coords),
            JointParams::RevoluteJoint(r) => Vector(r.local_anchor2.coords),
            JointParams::FixedJoint(f) => Vector(f.local_anchor2.translation.vector),
            JointParams::PrismaticJoint(p) => Vector(p.local_anchor2.coords),
        })
    }

    pub fn axis1(&self) -> Option<Vector> {
        self.map(|j| match &j.params {
            JointParams::BallJoint(_) | JointParams::FixedJoint(_) => None,
            JointParams::RevoluteJoint(r) => Some(Vector(*r.local_axis1)),
            JointParams::PrismaticJoint(p) => Some(Vector(*p.local_axis1())),
        })
    }

    pub fn axis2(&self) -> Option<Vector> {
        self.map(|j| match &j.params {
            JointParams::BallJoint(_) | JointParams::FixedJoint(_) => None,
            JointParams::RevoluteJoint(r) => Some(Vector(*r.local_axis2)),
            JointParams::PrismaticJoint(p) => Some(Vector(*p.local_axis2())),
        })
    }
}

#[wasm_bindgen]
pub struct JointDesc(pub(crate) JointParams);

#[wasm_bindgen]
impl JointDesc {
    pub fn ball(anchor1: &Vector, anchor2: &Vector) -> Self {
        JointDesc(JointParams::BallJoint(BallJoint::new(
            anchor1.0.into(),
            anchor2.0.into(),
        )))
    }

    pub fn revolute(
        anchor1: &Vector,
        axis1: &Vector,
        anchor2: &Vector,
        axis2: &Vector,
    ) -> Option<JointDesc> {
        let axis1 = Unit::try_new(axis1.0, 0.0)?;
        let axis2 = Unit::try_new(axis2.0, 0.0)?;
        Some(JointDesc(JointParams::RevoluteJoint(RevoluteJoint::new(
            anchor1.0.into(),
            axis1,
            anchor2.0.into(),
            axis2,
        ))))
    }
}
