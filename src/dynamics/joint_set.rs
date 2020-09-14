use rapier::dynamics::JointSet;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawJointSet(pub(crate) JointSet);

#[wasm_bindgen]
impl RawJointSet {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        RawJointSet(JointSet::new())
    }
}
