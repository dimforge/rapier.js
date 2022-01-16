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

    #[wasm_bindgen(getter)]
    pub fn dt(&self) -> f32 {
        self.0.dt
    }

    #[wasm_bindgen(getter)]
    pub fn erp(&self) -> f32 {
        self.0.erp
    }

    #[wasm_bindgen(getter)]
    pub fn allowedLinearError(&self) -> f32 {
        self.0.allowed_linear_error
    }

    #[wasm_bindgen(getter)]
    pub fn predictionDistance(&self) -> f32 {
        self.0.prediction_distance
    }

    #[wasm_bindgen(getter)]
    pub fn maxVelocityIterations(&self) -> usize {
        self.0.max_velocity_iterations
    }

    #[wasm_bindgen(getter)]
    pub fn maxVelocityFrictionIterations(&self) -> usize {
        self.0.max_velocity_friction_iterations
    }

    #[wasm_bindgen(getter)]
    pub fn maxStabilizationIterations(&self) -> usize {
        self.0.max_stabilization_iterations
    }

    #[wasm_bindgen(getter)]
    pub fn minIslandSize(&self) -> usize {
        self.0.min_island_size
    }

    #[wasm_bindgen(getter)]
    pub fn maxCcdSubsteps(&self) -> usize {
        self.0.max_ccd_substeps
    }

    #[wasm_bindgen(setter)]
    pub fn set_dt(&mut self, value: f32) {
        self.0.dt = value;
    }

    #[wasm_bindgen(setter)]
    pub fn set_erp(&mut self, value: f32) {
        self.0.erp = value
    }

    #[wasm_bindgen(setter)]
    pub fn set_allowedLinearError(&mut self, value: f32) {
        self.0.allowed_linear_error = value
    }

    #[wasm_bindgen(setter)]
    pub fn set_predictionDistance(&mut self, value: f32) {
        self.0.prediction_distance = value
    }

    #[wasm_bindgen(setter)]
    pub fn set_maxVelocityIterations(&mut self, value: usize) {
        self.0.max_velocity_iterations = value
    }
    #[wasm_bindgen(setter)]
    pub fn set_minIslandSize(&mut self, value: usize) {
        self.0.min_island_size = value
    }

    #[wasm_bindgen(setter)]
    pub fn set_maxCcdSubsteps(&mut self, value: usize) {
        self.0.max_ccd_substeps = value
    }
}
