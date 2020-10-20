use crate::math::RawVector;
use rapier::geometry::{Ball, Capsule, ColliderShape, Cuboid};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[cfg(feature = "dim2")]
pub enum RawShapeType {
    Ball = 0,
    Cuboid = 1,
    Capsule = 2,
    Triangle = 3,
    Polygon = 4,
    Trimesh = 5,
    HeightField = 6,
}

#[wasm_bindgen]
#[cfg(feature = "dim3")]
pub enum RawShapeType {
    Ball = 0,
    Cuboid = 1,
    Capsule = 2,
    Triangle = 3,
    Polygon = 4,
    Trimesh = 5,
    HeightField = 6,
    Cylinder = 7,
    RoundCylinder = 8,
    Cone = 9,
}

#[wasm_bindgen]
pub struct RawShape(pub(crate) ColliderShape);

#[wasm_bindgen]
impl RawShape {
    pub fn cuboid(half_extents: &RawVector) -> Self {
        Self(ColliderShape::cuboid(half_extents.0))
    }

    pub fn ball(radius: f32) -> Self {
        Self(ColliderShape::ball(radius))
    }

    pub fn capsule(half_height: f32, radius: f32) -> Self {
        Self(ColliderShape::capsule(half_height, radius))
    }

    #[cfg(feature = "dim3")]
    pub fn cylinder(half_height: f32, radius: f32) -> Self {
        Self(ColliderShape::cylinder(half_height, radius))
    }

    #[cfg(feature = "dim3")]
    pub fn round_cylinder(half_height: f32, radius: f32, round_radius: f32) -> Self {
        Self(ColliderShape::round_cylinder(
            half_height,
            radius,
            round_radius,
        ))
    }

    #[cfg(feature = "dim3")]
    pub fn cone(half_height: f32, radius: f32) -> Self {
        Self(ColliderShape::cone(half_height, radius))
    }
}
