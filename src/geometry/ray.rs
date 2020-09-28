use crate::math::RawVector;
use rapier::geometry::{ColliderHandle, RayIntersection};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawRayColliderIntersection {
    pub(crate) handle: ColliderHandle,
    pub(crate) inter: RayIntersection,
}

#[wasm_bindgen]
impl RawRayColliderIntersection {
    pub fn colliderHandle(&self) -> usize {
        self.handle.into_raw_parts().0
    }

    pub fn normal(&self) -> RawVector {
        self.inter.normal.into()
    }

    pub fn toi(&self) -> f32 {
        self.inter.toi
    }
}
