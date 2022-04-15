use rapier::prelude::FeatureId;
use wasm_bindgen::prelude::wasm_bindgen;

#[cfg(feature = "dim2")]
#[wasm_bindgen]
#[derive(Copy, Clone)]
pub enum FeatureIdType {
    Vertex,
    Face,
    Unknown,
}

#[cfg(feature = "dim3")]
#[wasm_bindgen]
#[derive(Copy, Clone)]
pub enum FeatureIdType {
    Vertex,
    Edge,
    Face,
    Unknown,
}

impl Into<Option<u32>> for FeatureIdType {
    fn into(self) -> Option<u32> {
        match self {
            FeatureIdType::Vertex => Some(0),
            #[cfg(feature = "dim3")]
            FeatureIdType::Edge => Some(1),
            FeatureIdType::Face => Some(2),
            FeatureIdType::Unknown => None,
        }
    }
}

pub trait IntoTypedValue {
    fn into_type(self) -> FeatureIdType;
    fn into_value(self) -> Option<u32>;
}

impl IntoTypedValue for FeatureId {
    fn into_type(self) -> FeatureIdType {
        match self {
            FeatureId::Vertex(_) => FeatureIdType::Vertex,
            #[cfg(feature = "dim3")]
            FeatureId::Edge(_) => FeatureIdType::Edge,
            FeatureId::Face(_) => FeatureIdType::Face,
            _ => FeatureIdType::Unknown,
        }
    }

    fn into_value(self) -> Option<u32> {
        match self {
            FeatureId::Vertex(id) | FeatureId::Face(id) => Some(id),
            #[cfg(feature = "dim3")]
            FeatureId::Edge(id) => Some(id),
            _ => None,
        }
    }
}
