use crate::dynamics::{RawIslandManager, RawRigidBodySet};
use crate::geometry::RawShape;
use crate::math::{RawRotation, RawVector};
use rapier::dynamics::CoefficientCombineRule;
use rapier::geometry::{Collider, ColliderBuilder, ColliderSet, InteractionGroups};
use rapier::math::Isometry;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawColliderSet(pub(crate) ColliderSet);

impl RawColliderSet {
    pub(crate) fn map<T>(&self, handle: u32, f: impl FnOnce(&Collider) -> T) -> T {
        let (collider, _) = self
            .0
            .get_unknown_gen(handle)
            .expect("Invalid Collider reference. It may have been removed from the physics World.");
        f(collider)
    }
}

#[wasm_bindgen]
impl RawColliderSet {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        RawColliderSet(ColliderSet::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn contains(&self, handle: u32) -> bool {
        self.0.get_unknown_gen(handle).is_some()
    }

    pub fn createCollider(
        &mut self,
        shape: &RawShape,
        translation: &RawVector,
        rotation: &RawRotation,
        density: Option<f32>,
        friction: f32,
        restitution: f32,
        frictionCombineRule: u32,
        restitutionCombineRule: u32,
        isSensor: bool,
        collisionGroups: u32,
        solverGroups: u32,
        parent: u32,
        bodies: &mut RawRigidBodySet,
    ) -> Option<u32> {
        if let Some((_, handle)) = bodies.0.get_unknown_gen(parent) {
            let pos = Isometry::from_parts(translation.0.into(), rotation.0);
            let mut builder = ColliderBuilder::new(shape.0.clone())
                .position_wrt_parent(pos)
                .friction(friction)
                .restitution(restitution)
                .collision_groups(InteractionGroups(collisionGroups))
                .solver_groups(InteractionGroups(solverGroups))
                .sensor(isSensor);

            if frictionCombineRule == CoefficientCombineRule::Average as u32 {
                builder = builder.friction_combine_rule(CoefficientCombineRule::Average)
            } else if frictionCombineRule == CoefficientCombineRule::Min as u32 {
                builder = builder.friction_combine_rule(CoefficientCombineRule::Min)
            } else if frictionCombineRule == CoefficientCombineRule::Multiply as u32 {
                builder = builder.friction_combine_rule(CoefficientCombineRule::Multiply)
            } else {
                builder = builder.friction_combine_rule(CoefficientCombineRule::Max)
            }

            if restitutionCombineRule == CoefficientCombineRule::Average as u32 {
                builder = builder.restitution_combine_rule(CoefficientCombineRule::Average)
            } else if restitutionCombineRule == CoefficientCombineRule::Min as u32 {
                builder = builder.restitution_combine_rule(CoefficientCombineRule::Min)
            } else if restitutionCombineRule == CoefficientCombineRule::Multiply as u32 {
                builder = builder.restitution_combine_rule(CoefficientCombineRule::Multiply)
            } else {
                builder = builder.restitution_combine_rule(CoefficientCombineRule::Max)
            }

            if let Some(density) = density {
                builder = builder.density(density);
            }

            let collider = builder.build();

            Some(
                self.0
                    .insert(collider, handle, &mut bodies.0)
                    .into_raw_parts()
                    .0,
            )
        } else {
            None
        }
    }

    /// Removes a collider from this set and wake-up the rigid-body it is attached to.
    pub fn remove(
        &mut self,
        handle: u32,
        islands: &mut RawIslandManager,
        bodies: &mut RawRigidBodySet,
        wakeUp: bool,
    ) {
        if let Some((_, handle)) = self.0.get_unknown_gen(handle) {
            self.0.remove(handle, &mut islands.0, &mut bodies.0, wakeUp);
        }
    }

    /// Checks if a collider with the given integer handle exists.
    pub fn isHandleValid(&self, handle: u32) -> bool {
        self.0.get_unknown_gen(handle).is_some()
    }

    /// Applies the given JavaScript function to the integer handle of each collider managed by this collider set.
    ///
    /// # Parameters
    /// - `f(handle)`: the function to apply to the integer handle of each collider managed by this collider set. Called as `f(handle)`.
    pub fn forEachColliderHandle(&self, f: &js_sys::Function) {
        let this = JsValue::null();
        for (handle, _) in self.0.iter() {
            let _ = f.call1(&this, &JsValue::from(handle.into_raw_parts().0 as u32));
        }
    }
}
