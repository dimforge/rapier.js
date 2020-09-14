use rapier::geometry::ColliderSet;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawColliderSet(pub(crate) ColliderSet);

#[wasm_bindgen]
impl RawColliderSet {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        RawColliderSet(ColliderSet::new())
    }
}
