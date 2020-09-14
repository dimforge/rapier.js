use rapier::geometry::NarrowPhase;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawNarrowPhase(pub(crate) NarrowPhase);

#[wasm_bindgen]
impl RawNarrowPhase {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        RawNarrowPhase(NarrowPhase::new())
    }
}
