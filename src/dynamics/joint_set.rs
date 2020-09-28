use crate::dynamics::{RawJointParams, RawRigidBodySet};
use rapier::dynamics::{Joint, JointSet};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawJointSet(pub(crate) JointSet);

impl RawJointSet {
    pub(crate) fn map<T>(&self, handle: usize, f: impl FnOnce(&Joint) -> T) -> T {
        let (body, _) = self
            .0
            .get_unknown_gen(handle)
            .expect("Invalid Joint reference. It may have been removed from the physics World.");
        f(body)
    }
}

#[wasm_bindgen]
impl RawJointSet {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        RawJointSet(JointSet::new())
    }

    pub fn createJoint(
        &mut self,
        bodies: &mut RawRigidBodySet,
        params: &RawJointParams,
        parent1: usize,
        parent2: usize,
    ) -> usize {
        // TODO: avoid the unwrap?
        let parent1 = bodies.0.get_unknown_gen(parent1).unwrap().1;
        let parent2 = bodies.0.get_unknown_gen(parent2).unwrap().1;

        self.0
            .insert(&mut bodies.0, parent1, parent2, params.0.clone())
            .into_raw_parts()
            .0
    }

    pub fn isHandleValid(&self, handle: usize) -> bool {
        self.0.get_unknown_gen(handle).is_some()
    }
}
