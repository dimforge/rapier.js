use rapier::dynamics::IntegrationParameters;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawIntegrationParameters(pub(crate) IntegrationParameters);

#[wasm_bindgen]
impl RawIntegrationParameters {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        RawIntegrationParameters(IntegrationParameters::default())
    }
}
