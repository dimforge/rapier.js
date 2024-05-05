use rapier::geometry::DefaultBroadPhase;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawBroadPhase(pub(crate) DefaultBroadPhase);

#[wasm_bindgen]
impl RawBroadPhase {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        RawBroadPhase(DefaultBroadPhase::new())
    }
}
