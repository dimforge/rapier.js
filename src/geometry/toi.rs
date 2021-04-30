use crate::math::RawVector;
use rapier::geometry::{ColliderHandle, TOI};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawShapeColliderTOI {
    pub(crate) handle: ColliderHandle,
    pub(crate) toi: TOI,
}

#[wasm_bindgen]
impl RawShapeColliderTOI {
    pub fn colliderHandle(&self) -> u32 {
        self.handle.into_raw_parts().0
    }

    pub fn toi(&self) -> f32 {
        self.toi.toi
    }

    pub fn witness1(&self) -> RawVector {
        self.toi.witness1.coords.into()
    }

    pub fn witness2(&self) -> RawVector {
        self.toi.witness1.coords.into()
    }

    pub fn normal1(&self) -> RawVector {
        self.toi.normal1.into_inner().into()
    }

    pub fn normal2(&self) -> RawVector {
        self.toi.normal1.into_inner().into()
    }
}
