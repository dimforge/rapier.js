use crate::math::RawVector;
use na::{DMatrix, DVector, Point3};
use rapier::geometry::ColliderShape;
use rapier::math::{Point, Vector, DIM};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[cfg(feature = "dim2")]
pub enum RawShapeType {
    Ball = 0,
    Polygon = 1,
    Cuboid = 2,
    Capsule = 3,
    Segment = 4,
    Triangle = 5,
    Trimesh = 6,
    HeightField = 7,
}

#[wasm_bindgen]
#[cfg(feature = "dim3")]
pub enum RawShapeType {
    Ball = 0,
    Polygon = 1,
    Cuboid = 2,
    Capsule = 3,
    Segment = 4,
    Triangle = 5,
    Trimesh = 6,
    HeightField = 7,
    Cylinder = 8,
    RoundCylinder = 9,
    Cone = 10,
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
        let p2 = Point::from(Vector::y() * half_height);
        let p1 = -p2;
        Self(ColliderShape::capsule(p1, p2, radius))
    }

    #[cfg(feature = "dim3")]
    pub fn cylinder(half_height: f32, radius: f32) -> Self {
        Self(ColliderShape::cylinder(half_height, radius))
    }

    #[cfg(feature = "dim3")]
    pub fn roundCylinder(half_height: f32, radius: f32, round_radius: f32) -> Self {
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

    pub fn trimesh(vertices: Vec<f32>, indices: Vec<u32>) -> Self {
        let vertices = vertices.chunks(DIM).map(|v| Point::from_slice(v)).collect();
        let indices = indices.chunks(3).map(|v| Point3::from_slice(v)).collect();
        Self(ColliderShape::trimesh(vertices, indices))
    }

    #[cfg(feature = "dim2")]
    pub fn heightfield(heights: Vec<f32>, scale: &RawVector) -> Self {
        let heights = DVector::from_vec(heights);
        Self(ColliderShape::heightfield(heights, scale.0))
    }

    #[cfg(feature = "dim3")]
    pub fn heightfield(nrows: u32, ncols: u32, heights: Vec<f32>, scale: &RawVector) -> Self {
        let heights = DMatrix::from_vec(nrows as usize + 1, ncols as usize + 1, heights);
        Self(ColliderShape::heightfield(heights, scale.0))
    }
}
