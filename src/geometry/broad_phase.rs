use rapier::geometry::BroadPhase;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawBroadPhase(pub(crate) BroadPhase);

#[wasm_bindgen]
impl RawBroadPhase {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        RawBroadPhase(BroadPhase::new())
    }
}
