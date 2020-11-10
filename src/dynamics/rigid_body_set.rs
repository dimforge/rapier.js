use crate::math::{RawRotation, RawVector};
use rapier::dynamics::{BodyStatus, RigidBody, RigidBodyBuilder, RigidBodyMut, RigidBodySet};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub enum RawBodyStatus {
    Dynamic,
    Static,
    Kinematic,
}

impl Into<BodyStatus> for RawBodyStatus {
    fn into(self) -> BodyStatus {
        match self {
            RawBodyStatus::Dynamic => BodyStatus::Dynamic,
            RawBodyStatus::Static => BodyStatus::Static,
            RawBodyStatus::Kinematic => BodyStatus::Kinematic,
        }
    }
}

impl Into<RawBodyStatus> for BodyStatus {
    fn into(self) -> RawBodyStatus {
        match self {
            BodyStatus::Dynamic => RawBodyStatus::Dynamic,
            BodyStatus::Static => RawBodyStatus::Static,
            BodyStatus::Kinematic => RawBodyStatus::Kinematic,
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
            body.wake_up(false);
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
        translation: &RawVector,
        rotation: &RawRotation,
        linvel: &RawVector,
        angvel: &RawVector,
        status: RawBodyStatus,
        canSleep: bool,
    ) -> usize {
        let pos = na::Isometry3::from_parts(translation.0.into(), rotation.0);
        let rigid_body = RigidBodyBuilder::new(status.into())
            .position(pos)
            .linvel(linvel.0.x, linvel.0.y, linvel.0.z)
            .angvel(angvel.0)
            .can_sleep(canSleep)
            .build();
        self.0.insert(rigid_body).into_raw_parts().0
    }

    #[cfg(feature = "dim2")]
    pub fn createRigidBody(
        &mut self,
        translation: &RawVector,
        rotation: &RawRotation,
        linvel: &RawVector,
        angvel: f32,
        status: RawBodyStatus,
        canSleep: bool,
    ) -> usize {
        let pos = na::Isometry2::from_parts(translation.0.into(), rotation.0);
        let rigid_body = RigidBodyBuilder::new(status.into())
            .position(pos)
            .linvel(linvel.0.x, linvel.0.y)
            .angvel(angvel)
            .can_sleep(canSleep)
            .build();
        self.0.insert(rigid_body).into_raw_parts().0
    }

    /// The number of rigid-bodies on this set.
    pub fn len(&self) -> usize {
        self.0.len()
    }

    /// Checks if a rigid-body with the given integer handle exists.
    pub fn contains(&self, handle: usize) -> bool {
        self.0.get_unknown_gen(handle).is_some()
    }

    /// Applies the given JavaScript function to the integer handle of each rigid-body managed by this set.
    ///
    /// # Parameters
    /// - `f(handle)`: the function to apply to the integer handle of each rigid-body managed by this set. Called as `f(collider)`.
    pub fn forEachRigidBodyHandle(&self, f: &js_sys::Function) {
        let this = JsValue::null();
        for (handle, _) in self.0.iter() {
            let _ = f.call1(&this, &JsValue::from(handle.into_raw_parts().0 as u32));
        }
    }

    /// Applies the given JavaScript function to the integer handle of each active rigid-body
    /// managed by this set.
    ///
    /// After a short time of inactivity, a rigid-body is automatically deactivated ("asleep") by
    /// the physics engine in order to save computational power. A sleeping rigid-body never moves
    /// unless it is moved manually by the user.
    ///
    /// # Parameters
    /// - `f(handle)`: the function to apply to the integer handle of each active rigid-body managed by this
    ///   set. Called as `f(collider)`.
    pub fn forEachActiveRigidBodyHandle(&self, f: &js_sys::Function) {
        let this = JsValue::null();
        for (handle, _) in self.0.iter_active_dynamic() {
            let _ = f.call1(&this, &JsValue::from(handle.into_raw_parts().0 as u32));
        }
    }
}
