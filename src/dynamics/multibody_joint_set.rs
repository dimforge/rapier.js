use crate::dynamics::{RawIslandManager, RawJointData, RawRigidBodySet};
use rapier::dynamics::{MultibodyJoint, MultibodyJointSet};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawMultibodyJointSet(pub(crate) MultibodyJointSet);

impl RawMultibodyJointSet {
    pub(crate) fn map<T>(&self, handle: u32, f: impl FnOnce(&MultibodyJoint) -> T) -> T {
        let (body, link_id, _) = self
            .0
            .get_unknown_gen(handle)
            .expect("Invalid Joint reference. It may have been removed from the physics World.");
        f(body.link(link_id).unwrap().joint())
    }

    // pub(crate) fn map_mut<T>(
    //     &mut self,
    //     handle: u32,
    //     f: impl FnOnce(&mut MultibodyJoint) -> T,
    // ) -> T {
    //     let (body, link_id, _) = self
    //         .0
    //         .get_unknown_gen_mut(handle)
    //         .expect("Invalid Joint reference. It may have been removed from the physics World.");
    //     f(body.link(link_id).unwrap().joint())
    // }
}

#[wasm_bindgen]
impl RawMultibodyJointSet {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        RawMultibodyJointSet(MultibodyJointSet::new())
    }

    pub fn createJoint(
        &mut self,
        bodies: &mut RawRigidBodySet,
        params: &RawJointData,
        parent1: u32,
        parent2: u32,
    ) -> u32 {
        // TODO: avoid the unwrap?
        let parent1 = bodies.0.get_unknown_gen(parent1).unwrap().1;
        let parent2 = bodies.0.get_unknown_gen(parent2).unwrap().1;

        self.0
            .insert(parent1, parent2, params.0.clone())
            .map(|h| h.into_raw_parts().0)
            .unwrap_or(u32::MAX)
    }

    pub fn remove(
        &mut self,
        handle: u32,
        islands: &mut RawIslandManager,
        bodies: &mut RawRigidBodySet,
        wakeUp: bool,
    ) {
        if let Some((_, _, handle)) = self.0.get_unknown_gen(handle) {
            self.0.remove(handle, &mut islands.0, &mut bodies.0, wakeUp);
        }
    }

    pub fn contains(&self, handle: u32) -> bool {
        self.0.get_unknown_gen(handle).is_some()
    }

    /// Applies the given JavaScript function to the integer handle of each joint managed by this physics world.
    ///
    /// # Parameters
    /// - `f(handle)`: the function to apply to the integer handle of each joint managed by this set. Called as `f(collider)`.
    pub fn forEachJointHandle(&self, f: &js_sys::Function) {
        let this = JsValue::null();
        for (handle, _, _) in self.0.iter() {
            let _ = f.call1(&this, &JsValue::from(handle.into_raw_parts().0 as u32));
        }
    }
}
