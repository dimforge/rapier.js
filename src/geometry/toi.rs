use crate::utils::{self, FlatHandle};
use rapier::geometry::{ColliderHandle, ShapeCastHit};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawShapeCastHit {
    pub(crate) hit: ShapeCastHit,
}

#[wasm_bindgen]
impl RawShapeCastHit {
    #[cfg(feature = "dim2")]
    pub fn getComponents(&self, scratchBuffer: &js_sys::Float32Array) {
        scratchBuffer.set_index(0, self.hit.time_of_impact);
        let mut u = self.hit.witness1.coords;
        scratchBuffer.set_index(1, u.x);
        scratchBuffer.set_index(2, u.y);
        u = self.hit.witness2.coords;
        scratchBuffer.set_index(3, u.x);
        scratchBuffer.set_index(4, u.y);
        u = self.hit.normal1.into_inner();
        scratchBuffer.set_index(5, u.x);
        scratchBuffer.set_index(6, u.y);
        u = self.hit.normal2.into_inner();
        scratchBuffer.set_index(7, u.x);
        scratchBuffer.set_index(8, u.y);
    }
    #[cfg(feature = "dim3")]
    pub fn getComponents(&self, scratchBuffer: &js_sys::Float32Array) {
        scratchBuffer.set_index(0, self.hit.time_of_impact);
        let mut u = self.hit.witness1.coords;
        scratchBuffer.set_index(1, u.x);
        scratchBuffer.set_index(2, u.y);
        scratchBuffer.set_index(3, u.z);
        u = self.hit.witness2.coords;
        scratchBuffer.set_index(4, u.x);
        scratchBuffer.set_index(5, u.y);
        scratchBuffer.set_index(6, u.z);
        u = self.hit.normal1.into_inner();
        scratchBuffer.set_index(7, u.x);
        scratchBuffer.set_index(8, u.y);
        scratchBuffer.set_index(9, u.z);
        u = self.hit.normal2.into_inner();
        scratchBuffer.set_index(10, u.x);
        scratchBuffer.set_index(11, u.y);
        scratchBuffer.set_index(12, u.z);
    }
}

#[wasm_bindgen]
pub struct RawColliderShapeCastHit {
    pub(crate) handle: ColliderHandle,
    pub(crate) hit: ShapeCastHit,
}

#[wasm_bindgen]
impl RawColliderShapeCastHit {
    pub fn colliderHandle(&self) -> FlatHandle {
        utils::flat_handle(self.handle.0)
    }
    #[cfg(feature = "dim2")]
    pub fn getComponents(&self, scratchBuffer: &js_sys::Float32Array) {
        scratchBuffer.set_index(0, self.hit.time_of_impact);
        let mut u = self.hit.witness1.coords;
        scratchBuffer.set_index(1, u.x);
        scratchBuffer.set_index(2, u.y);
        u = self.hit.witness2.coords;
        scratchBuffer.set_index(3, u.x);
        scratchBuffer.set_index(4, u.y);
        u = self.hit.normal1.into_inner();
        scratchBuffer.set_index(5, u.x);
        scratchBuffer.set_index(6, u.y);
        u = self.hit.normal2.into_inner();
        scratchBuffer.set_index(7, u.x);
        scratchBuffer.set_index(8, u.y);
    }
    #[cfg(feature = "dim3")]
    pub fn getComponents(&self, scratchBuffer: &js_sys::Float32Array) {
        scratchBuffer.set_index(0, self.hit.time_of_impact);
        let mut u = self.hit.witness1.coords;
        scratchBuffer.set_index(1, u.x);
        scratchBuffer.set_index(2, u.y);
        scratchBuffer.set_index(3, u.z);
        u = self.hit.witness2.coords;
        scratchBuffer.set_index(4, u.x);
        scratchBuffer.set_index(5, u.y);
        scratchBuffer.set_index(6, u.z);
        u = self.hit.normal1.into_inner();
        scratchBuffer.set_index(7, u.x);
        scratchBuffer.set_index(8, u.y);
        scratchBuffer.set_index(9, u.z);
        u = self.hit.normal2.into_inner();
        scratchBuffer.set_index(10, u.x);
        scratchBuffer.set_index(11, u.y);
        scratchBuffer.set_index(12, u.z);
    }
}
