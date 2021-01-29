use crate::math::RawVector;
#[cfg(feature = "dim3")]
use na::DMatrix;
#[cfg(feature = "dim2")]
use na::DVector;
use rapier::geometry::SharedShape;
use rapier::math::{Point, Vector, DIM};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[cfg(feature = "dim2")]
pub enum RawShapeType {
    Ball = 0,
    Cuboid = 1,
    Capsule = 2,
    Segment = 3,
    Polyline = 4,
    Triangle = 5,
    TriMesh = 6,
    HeightField = 7,
    Compound = 8,
    ConvexPolygon = 9,
    RoundCuboid = 10,
    RoundTriangle = 11,
    RoundConvexPolygon = 12,
}

#[wasm_bindgen]
#[cfg(feature = "dim3")]
pub enum RawShapeType {
    Ball = 0,
    Cuboid = 1,
    Capsule = 2,
    Segment = 3,
    Polyline = 4,
    Triangle = 5,
    TriMesh = 6,
    HeightField = 7,
    Compound = 8,
    ConvexPolyhedron = 9,
    Cylinder = 10,
    Cone = 11,
    RoundCuboid = 12,
    RoundTriangle = 13,
    RoundCylinder = 14,
    RoundCone = 15,
    RoundConvexPolyhedron = 16,
}

#[wasm_bindgen]
pub struct RawShape(pub(crate) SharedShape);

#[wasm_bindgen]
impl RawShape {
    #[cfg(feature = "dim2")]
    pub fn cuboid(hx: f32, hy: f32) -> Self {
        Self(SharedShape::cuboid(hx, hy))
    }

    #[cfg(feature = "dim3")]
    pub fn cuboid(hx: f32, hy: f32, hz: f32) -> Self {
        Self(SharedShape::cuboid(hx, hy, hz))
    }

    #[cfg(feature = "dim2")]
    pub fn roundCuboid(hx: f32, hy: f32, borderRadius: f32) -> Self {
        Self(SharedShape::round_cuboid(hx, hy, borderRadius))
    }

    #[cfg(feature = "dim3")]
    pub fn roundCuboid(hx: f32, hy: f32, hz: f32, borderRadius: f32) -> Self {
        Self(SharedShape::round_cuboid(hx, hy, hz, borderRadius))
    }

    pub fn ball(radius: f32) -> Self {
        Self(SharedShape::ball(radius))
    }

    pub fn capsule(halfHeight: f32, radius: f32) -> Self {
        let p2 = Point::from(Vector::y() * halfHeight);
        let p1 = -p2;
        Self(SharedShape::capsule(p1, p2, radius))
    }

    #[cfg(feature = "dim3")]
    pub fn cylinder(halfHeight: f32, radius: f32) -> Self {
        Self(SharedShape::cylinder(halfHeight, radius))
    }

    #[cfg(feature = "dim3")]
    pub fn roundCylinder(halfHeight: f32, radius: f32, borderRadius: f32) -> Self {
        Self(SharedShape::round_cylinder(
            halfHeight,
            radius,
            borderRadius,
        ))
    }

    #[cfg(feature = "dim3")]
    pub fn cone(halfHeight: f32, radius: f32) -> Self {
        Self(SharedShape::cone(halfHeight, radius))
    }

    #[cfg(feature = "dim3")]
    pub fn roundCone(halfHeight: f32, radius: f32, borderRadius: f32) -> Self {
        Self(SharedShape::round_cone(halfHeight, radius, borderRadius))
    }

    pub fn polyline(vertices: Vec<f32>, indices: Vec<u32>) -> Self {
        let vertices = vertices.chunks(DIM).map(|v| Point::from_slice(v)).collect();
        let indices: Vec<_> = indices.chunks(2).map(|v| [v[0], v[1]]).collect();
        if indices.is_empty() {
            Self(SharedShape::polyline(vertices, None))
        } else {
            Self(SharedShape::polyline(vertices, Some(indices)))
        }
    }

    pub fn trimesh(vertices: Vec<f32>, indices: Vec<u32>) -> Self {
        let vertices = vertices.chunks(DIM).map(|v| Point::from_slice(v)).collect();
        let indices = indices.chunks(3).map(|v| [v[0], v[1], v[2]]).collect();
        Self(SharedShape::trimesh(vertices, indices))
    }

    #[cfg(feature = "dim2")]
    pub fn heightfield(heights: Vec<f32>, scale: &RawVector) -> Self {
        let heights = DVector::from_vec(heights);
        Self(SharedShape::heightfield(heights, scale.0))
    }

    #[cfg(feature = "dim3")]
    pub fn heightfield(nrows: u32, ncols: u32, heights: Vec<f32>, scale: &RawVector) -> Self {
        let heights = DMatrix::from_vec(nrows as usize + 1, ncols as usize + 1, heights);
        Self(SharedShape::heightfield(heights, scale.0))
    }

    pub fn segment(p1: &RawVector, p2: &RawVector) -> Self {
        Self(SharedShape::segment(p1.0.into(), p2.0.into()))
    }

    pub fn triangle(p1: &RawVector, p2: &RawVector, p3: &RawVector) -> Self {
        Self(SharedShape::triangle(p1.0.into(), p2.0.into(), p3.0.into()))
    }

    pub fn roundTriangle(
        p1: &RawVector,
        p2: &RawVector,
        p3: &RawVector,
        borderRadius: f32,
    ) -> Self {
        Self(SharedShape::round_triangle(
            p1.0.into(),
            p2.0.into(),
            p3.0.into(),
            borderRadius,
        ))
    }

    pub fn convexHull(points: Vec<f32>) -> Option<RawShape> {
        let points: Vec<_> = points.chunks(DIM).map(|v| Point::from_slice(v)).collect();
        SharedShape::convex_hull(&points).map(|s| Self(s))
    }

    pub fn roundConvexHull(points: Vec<f32>, borderRadius: f32) -> Option<RawShape> {
        let points: Vec<_> = points.chunks(DIM).map(|v| Point::from_slice(v)).collect();
        SharedShape::round_convex_hull(&points, borderRadius).map(|s| Self(s))
    }

    #[cfg(feature = "dim2")]
    pub fn convexPolyline(vertices: Vec<f32>) -> Option<RawShape> {
        let vertices = vertices.chunks(DIM).map(|v| Point::from_slice(v)).collect();
        SharedShape::convex_polyline(vertices).map(|s| Self(s))
    }

    #[cfg(feature = "dim2")]
    pub fn roundConvexPolyline(vertices: Vec<f32>, borderRadius: f32) -> Option<RawShape> {
        let vertices = vertices.chunks(DIM).map(|v| Point::from_slice(v)).collect();
        SharedShape::round_convex_polyline(vertices, borderRadius).map(|s| Self(s))
    }

    #[cfg(feature = "dim3")]
    pub fn convexMesh(vertices: Vec<f32>, indices: Vec<u32>) -> Option<RawShape> {
        let vertices = vertices.chunks(DIM).map(|v| Point::from_slice(v)).collect();
        let indices: Vec<_> = indices.chunks(3).map(|v| [v[0], v[1], v[2]]).collect();
        SharedShape::convex_mesh(vertices, &indices).map(|s| Self(s))
    }

    #[cfg(feature = "dim3")]
    pub fn roundConvexMesh(
        vertices: Vec<f32>,
        indices: Vec<u32>,
        borderRadius: f32,
    ) -> Option<RawShape> {
        let vertices = vertices.chunks(DIM).map(|v| Point::from_slice(v)).collect();
        let indices: Vec<_> = indices.chunks(3).map(|v| [v[0], v[1], v[2]]).collect();
        SharedShape::round_convex_mesh(vertices, &indices, borderRadius).map(|s| Self(s))
    }
}
