use crate::dynamics::{RawIslandManager, RawJointSet};
use crate::geometry::RawColliderSet;
use crate::math::{RawRotation, RawVector};
use rapier::dynamics::{MassProperties, RigidBody, RigidBodyBuilder, RigidBodySet, RigidBodyType};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub enum RawRigidBodyType {
    Dynamic,
    Static,
    Kinematic,
}

impl Into<RigidBodyType> for RawRigidBodyType {
    fn into(self) -> RigidBodyType {
        match self {
            RawRigidBodyType::Dynamic => RigidBodyType::Dynamic,
            RawRigidBodyType::Static => RigidBodyType::Static,
            RawRigidBodyType::Kinematic => RigidBodyType::Kinematic,
        }
    }
}

impl Into<RawRigidBodyType> for RigidBodyType {
    fn into(self) -> RawRigidBodyType {
        match self {
            RigidBodyType::Dynamic => RawRigidBodyType::Dynamic,
            RigidBodyType::Static => RawRigidBodyType::Static,
            RigidBodyType::Kinematic => RawRigidBodyType::Kinematic,
        }
    }
}

#[wasm_bindgen]
pub struct RawRigidBodySet(pub(crate) RigidBodySet);

impl RawRigidBodySet {
    pub(crate) fn map<T>(&self, handle: u32, f: impl FnOnce(&RigidBody) -> T) -> T {
        let (body, _) = self.0.get_unknown_gen(handle).expect(
            "Invalid RigidBody reference. It may have been removed from the physics World.",
        );
        f(body)
    }

    pub(crate) fn map_mut<T>(&mut self, handle: u32, f: impl FnOnce(&mut RigidBody) -> T) -> T {
        let (body, _) = self.0.get_unknown_gen_mut(handle).expect(
            "Invalid RigidBody reference. It may have been removed from the physics World.",
        );
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
        gravityScale: f32,
        mass: f32,
        translationsEnabled: bool,
        centerOfMass: &RawVector,
        linvel: &RawVector,
        angvel: &RawVector,
        principalAngularInertia: &RawVector,
        angularInertiaFrame: &RawRotation,
        rotationEnabledX: bool,
        rotationEnabledY: bool,
        rotationEnabledZ: bool,
        linearDamping: f32,
        angularDamping: f32,
        status: RawRigidBodyType,
        canSleep: bool,
        ccdEnabled: bool,
    ) -> u32 {
        let pos = na::Isometry3::from_parts(translation.0.into(), rotation.0);
        let props = MassProperties::with_principal_inertia_frame(
            centerOfMass.0.into(),
            mass,
            principalAngularInertia.0,
            angularInertiaFrame.0,
        );

        let mut rigid_body = RigidBodyBuilder::new(status.into())
            .position(pos)
            .gravity_scale(gravityScale)
            .additional_mass(mass)
            .additional_principal_angular_inertia(principalAngularInertia.0)
            .restrict_rotations(rotationEnabledX, rotationEnabledY, rotationEnabledZ)
            .additional_mass_properties(props)
            .linvel(linvel.0.x, linvel.0.y, linvel.0.z)
            .angvel(angvel.0)
            .linear_damping(linearDamping)
            .angular_damping(angularDamping)
            .can_sleep(canSleep)
            .ccd_enabled(ccdEnabled);
        if !translationsEnabled {
            rigid_body = rigid_body.lock_translations();
        }

        self.0.insert(rigid_body.build()).into_raw_parts().0
    }

    #[cfg(feature = "dim2")]
    pub fn createRigidBody(
        &mut self,
        translation: &RawVector,
        rotation: &RawRotation,
        gravityScale: f32,
        mass: f32,
        transationsEnabled: bool,
        centerOfMass: &RawVector,
        linvel: &RawVector,
        angvel: f32,
        principalAngularInertia: f32,
        rotationsEnabled: bool,
        linearDamping: f32,
        angularDamping: f32,
        status: RawRigidBodyType,
        canSleep: bool,
        ccdEnabled: bool,
    ) -> u32 {
        let pos = na::Isometry2::from_parts(translation.0.into(), rotation.0);
        let props = MassProperties::new(centerOfMass.0.into(), mass, principalAngularInertia);
        let mut rigid_body = RigidBodyBuilder::new(status.into())
            .position(pos)
            .gravity_scale(gravityScale)
            .additional_mass(mass)
            .additional_principal_angular_inertia(principalAngularInertia)
            .additional_mass_properties(props)
            .linvel(linvel.0.x, linvel.0.y)
            .angvel(angvel)
            .linear_damping(linearDamping)
            .angular_damping(angularDamping)
            .can_sleep(canSleep)
            .ccd_enabled(ccdEnabled);
        if !transationsEnabled {
            rigid_body = rigid_body.lock_translations();
        }
        if !rotationsEnabled {
            rigid_body = rigid_body.lock_rotations();
        }
        self.0.insert(rigid_body.build()).into_raw_parts().0
    }

    pub fn remove(
        &mut self,
        handle: u32,
        islands: &mut RawIslandManager,
        colliders: &mut RawColliderSet,
        joints: &mut RawJointSet,
    ) {
        if let Some((_, handle)) = self.0.get_unknown_gen(handle) {
            self.0
                .remove(handle, &mut islands.0, &mut colliders.0, &mut joints.0);
        }
    }

    /// The number of rigid-bodies on this set.
    pub fn len(&self) -> usize {
        self.0.len()
    }

    /// Checks if a rigid-body with the given integer handle exists.
    pub fn contains(&self, handle: u32) -> bool {
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
}
