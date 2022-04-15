use crate::geometry::feature::IntoTypedValue;
use crate::math::RawVector;
use rapier::{
    geometry::{ColliderHandle, PointProjection},
    prelude::FeatureId,
};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawPointProjection(pub(crate) PointProjection);

#[wasm_bindgen]
impl RawPointProjection {
    pub fn point(&self) -> RawVector {
        self.0.point.coords.into()
    }

    pub fn isInside(&self) -> bool {
        self.0.is_inside
    }
}

#[wasm_bindgen]
pub struct RawPointColliderProjection {
    pub(crate) handle: ColliderHandle,
    pub(crate) proj: PointProjection,
    pub(crate) feature: FeatureId,
}

#[wasm_bindgen]
impl RawPointColliderProjection {
    pub fn colliderHandle(&self) -> u32 {
        self.handle.into_raw_parts().0
    }

    pub fn point(&self) -> RawVector {
        self.proj.point.coords.into()
    }

    pub fn isInside(&self) -> bool {
        self.proj.is_inside
    }

    pub fn featureType(&self) -> Option<u32> {
        self.feature.into_type().into()
    }

    pub fn featureId(&self) -> Option<u32> {
        self.feature.into_value()
    }
}
