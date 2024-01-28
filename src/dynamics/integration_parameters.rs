use rapier::dynamics::IntegrationParameters;
use std::num::NonZeroUsize;
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
    pub fn numSolverIterations(&self) -> usize {
        self.0.num_solver_iterations.get()
    }

    #[wasm_bindgen(getter)]
    pub fn numAdditionalFrictionIterations(&self) -> usize {
        self.0.num_additional_friction_iterations
    }

    #[wasm_bindgen(getter)]
    pub fn numInternalPgsIterations(&self) -> usize {
        self.0.num_internal_pgs_iterations
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
    pub fn set_numSolverIterations(&mut self, value: usize) {
        self.0.num_solver_iterations = NonZeroUsize::new(value.max(1)).unwrap()
    }
    #[wasm_bindgen(setter)]
    pub fn set_numAdditionalFrictionIterations(&mut self, value: usize) {
        self.0.num_additional_friction_iterations = value
    }
    #[wasm_bindgen(setter)]
    pub fn set_numInternalPgsIterations(&mut self, value: usize) {
        self.0.num_internal_pgs_iterations = value
    }
    #[wasm_bindgen(setter)]
    pub fn set_minIslandSize(&mut self, value: usize) {
        self.0.min_island_size = value
    }

    #[wasm_bindgen(setter)]
    pub fn set_maxCcdSubsteps(&mut self, value: usize) {
        self.0.max_ccd_substeps = value
    }

    pub fn switchToStandardPgsSolver(&mut self) {
        self.0.switch_to_standard_pgs_solver()
    }

    pub fn switchToSmallStepsPgsSolver(&mut self) {
        self.0.switch_to_small_steps_pgs_solver()
    }
}
