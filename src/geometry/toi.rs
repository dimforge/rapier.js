use crate::math::RawVector;
use crate::utils::{self, FlatHandle};
use rapier::geometry::{ColliderHandle, TOI};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawShapeTOI {
    pub(crate) toi: TOI,
}

#[wasm_bindgen]
impl RawShapeTOI {
    pub fn toi(&self) -> f32 {
        self.toi.toi
    }

    pub fn witness1(&self) -> RawVector {
        self.toi.witness1.coords.into()
    }

    pub fn witness2(&self) -> RawVector {
        self.toi.witness2.coords.into()
    }

    pub fn normal1(&self) -> RawVector {
        self.toi.normal1.into_inner().into()
    }

    pub fn normal2(&self) -> RawVector {
        self.toi.normal2.into_inner().into()
    }
}

#[wasm_bindgen]
pub struct RawShapeColliderTOI {
    pub(crate) handle: ColliderHandle,
    pub(crate) toi: TOI,
}

#[wasm_bindgen]
impl RawShapeColliderTOI {
    pub fn colliderHandle(&self) -> FlatHandle {
        utils::flat_handle(self.handle.0)
    }

    pub fn toi(&self) -> f32 {
        self.toi.toi
    }

    pub fn witness1(&self) -> RawVector {
        self.toi.witness1.coords.into()
    }

    pub fn witness2(&self) -> RawVector {
        self.toi.witness2.coords.into()
    }

    pub fn normal1(&self) -> RawVector {
        self.toi.normal1.into_inner().into()
    }

    pub fn normal2(&self) -> RawVector {
        self.toi.normal2.into_inner().into()
    }
}
