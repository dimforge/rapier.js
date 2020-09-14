use na::{Quaternion, Unit};
use rapier::dynamics::{RigidBody, RigidBodyBuilder, RigidBodyMut, RigidBodySet};
use rapier::math::Vector;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub enum BodyStatus {
    Dynamic,
    Static,
    Kinematic,
}

impl Into<rapier::dynamics::BodyStatus> for BodyStatus {
    fn into(self) -> rapier::dynamics::BodyStatus {
        match self {
            BodyStatus::Dynamic => rapier::dynamics::BodyStatus::Dynamic,
            BodyStatus::Static => rapier::dynamics::BodyStatus::Static,
            BodyStatus::Kinematic => rapier::dynamics::BodyStatus::Kinematic,
        }
    }
}

#[wasm_bindgen]
pub struct RawRigidBodySet(pub(crate) RigidBodySet);

impl RawRigidBodySet {
    pub(crate) fn map<T>(&self, handle: usize, f: impl FnOnce(&RigidBody) -> T) -> T {
        let (body, _) = self.0.get_unknown_gen(handle).expect(
            "Invalid RigidBody reference. It may have been removed from the physics World.",
        );
        f(body)
    }

    pub(crate) fn map_mut<T>(&mut self, handle: usize, f: impl FnOnce(RigidBodyMut) -> T) -> T {
        let (body, _) = self.0.get_unknown_gen_mut(handle).expect(
            "Invalid RigidBody reference. It may have been removed from the physics World.",
        );
        f(body)
    }

    pub(crate) fn map_mut_wake<T>(
        &mut self,
        handle: usize,
        wake_up: bool,
        f: impl FnOnce(RigidBodyMut) -> T,
    ) -> T {
        let (mut body, _) = self.0.get_unknown_gen_mut(handle).expect(
            "Invalid RigidBody reference. It may have been removed from the physics World.",
        );

        if wake_up {
            body.wake_up();
        }

        f(body)
    }
}

#[wasm_bindgen]
impl RawRigidBodySet {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        RawRigidBodySet(RigidBodySet::new())
    }

    #[cfg(feature = "dim3")]
    pub fn createRigidBody(
        &mut self,
        // Translation
        x: f32,
        y: f32,
        z: f32,
        // Rotation quaternion
        i: f32,
        j: f32,
        k: f32,
        w: f32,
        // Linear velocity.
        lvx: f32,
        lvy: f32,
        lvz: f32,
        // Angular velocity.
        avx: f32,
        avy: f32,
        avz: f32,
        // Other fields
        status: BodyStatus,
        canSleep: bool,
    ) -> usize {
        let rot = Unit::new_normalize(Quaternion::new(w, i, j, k));
        let tra = na::Translation3::new(x, y, z);
        let pos = na::Isometry3::from_parts(tra, rot);
        let rigid_body = RigidBodyBuilder::new(status.into())
            .position(pos)
            .linvel(lvx, lvy, lvz)
            .angvel(Vector::new(avx, avy, avz))
            .can_sleep(canSleep)
            .build();
        self.0.insert(rigid_body).into_raw_parts().0
    }

    #[cfg(feature = "dim2")]
    pub fn createRigidBody(
        &mut self,
        // Translation
        x: f32,
        y: f32,
        // Rotation quaternion
        angle: f32,
        // Linear velocity.
        lvx: f32,
        lvy: f32,
        // Angular velocity.
        av: f32,
        // Other fields
        status: BodyStatus,
        canSleep: bool,
    ) -> usize {
        let pos = na::Isometry2::new(Vector::new(x, y), angle);
        let rigid_body = RigidBodyBuilder::new(status.into())
            .position(pos)
            .linvel(lvx, lvy)
            .angvel(av)
            .can_sleep(canSleep)
            .build();
        self.0.insert(rigid_body).into_raw_parts().0
    }
}
