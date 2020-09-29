use crate::dynamics::RawRigidBodySet;
use crate::geometry::RawShape;
use crate::math::{RawRotation, RawVector};
use rapier::geometry::{Collider, ColliderBuilder, ColliderSet};
use rapier::math::Isometry;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawColliderSet(pub(crate) ColliderSet);

impl RawColliderSet {
    pub(crate) fn map<T>(&self, handle: usize, f: impl FnOnce(&Collider) -> T) -> T {
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

    pub fn createCollider(
        &mut self,
        shape: &RawShape,
        translation: &RawVector,
        rotation: &RawRotation,
        parent: usize,
        bodies: &mut RawRigidBodySet,
    ) -> Option<usize> {
        if let Some((_, handle)) = bodies.0.get_unknown_gen(parent) {
            let pos = Isometry::from_parts(translation.0.into(), rotation.0);
            let collider = ColliderBuilder::new(shape.0.clone()).position(pos).build();
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

    /// Checks if a collider with the given integer handle exists.
    pub fn isHandleValid(&self, handle: usize) -> bool {
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
