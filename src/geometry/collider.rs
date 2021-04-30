use crate::geometry::{RawColliderSet, RawShapeType};
use crate::math::{RawRotation, RawVector};
use rapier::geometry::ShapeType;
use rapier::math::Point;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
impl RawColliderSet {
    /// The world-space translation of this rigid-body.
    pub fn coTranslation(&self, handle: u32) -> RawVector {
        self.map(handle, |co| co.position().translation.vector.into())
    }

    /// The world-space orientation of this rigid-body.
    pub fn coRotation(&self, handle: u32) -> RawRotation {
        self.map(handle, |co| co.position().rotation.into())
    }

    /// Is this collider a sensor?
    pub fn coIsSensor(&self, handle: u32) -> bool {
        self.map(handle, |co| co.is_sensor())
    }

    /// The type of the shape of this collider.
    pub fn coShapeType(&self, handle: u32) -> RawShapeType {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::Ball => RawShapeType::Ball,
            ShapeType::Cuboid => RawShapeType::Cuboid,
            ShapeType::Capsule => RawShapeType::Capsule,
            ShapeType::Segment => RawShapeType::Segment,
            ShapeType::Polyline => RawShapeType::Polyline,
            ShapeType::Triangle => RawShapeType::Triangle,
            ShapeType::TriMesh => RawShapeType::TriMesh,
            ShapeType::HeightField => RawShapeType::HeightField,
            ShapeType::Compound => RawShapeType::Compound,
            #[cfg(feature = "dim3")]
            ShapeType::ConvexPolyhedron => RawShapeType::ConvexPolyhedron,
            #[cfg(feature = "dim2")]
            ShapeType::ConvexPolygon => RawShapeType::ConvexPolygon,
            #[cfg(feature = "dim3")]
            ShapeType::Cylinder => RawShapeType::Cylinder,
            #[cfg(feature = "dim3")]
            ShapeType::Cone => RawShapeType::Cone,
            ShapeType::RoundCuboid => RawShapeType::RoundCuboid,
            ShapeType::RoundTriangle => RawShapeType::RoundTriangle,
            #[cfg(feature = "dim3")]
            ShapeType::RoundCylinder => RawShapeType::RoundCylinder,
            #[cfg(feature = "dim3")]
            ShapeType::RoundCone => RawShapeType::RoundCone,
            #[cfg(feature = "dim3")]
            ShapeType::RoundConvexPolyhedron => RawShapeType::RoundConvexPolyhedron,
            #[cfg(feature = "dim2")]
            ShapeType::RoundConvexPolygon => RawShapeType::RoundConvexPolygon,
            ShapeType::HalfSpace | ShapeType::Custom => panic!("Not yet implemented."),
        })
    }

    /// The half-extents of this collider if it is has a cuboid shape.
    pub fn coHalfExtents(&self, handle: u32) -> Option<RawVector> {
        self.map(handle, |co| {
            co.shape().as_cuboid().map(|c| c.half_extents.into())
        })
    }

    /// The radius of this collider if it is a ball, capsule, cylinder, or cone shape.
    pub fn coRadius(&self, handle: u32) -> Option<f32> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::Ball => co.shape().as_ball().map(|b| b.radius),
            ShapeType::Capsule => co.shape().as_capsule().map(|b| b.radius),
            #[cfg(feature = "dim3")]
            ShapeType::Cylinder => co.shape().as_cylinder().map(|b| b.radius),
            #[cfg(feature = "dim3")]
            ShapeType::RoundCylinder => co.shape().as_round_cylinder().map(|b| b.base_shape.radius),
            #[cfg(feature = "dim3")]
            ShapeType::Cone => co.shape().as_cone().map(|b| b.radius),
            _ => None,
        })
    }

    /// The radius of this collider if it is a capsule, cylinder, or cone shape.
    pub fn coHalfHeight(&self, handle: u32) -> Option<f32> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::Capsule => co.shape().as_capsule().map(|b| b.half_height()),
            #[cfg(feature = "dim3")]
            ShapeType::Cylinder => co.shape().as_cylinder().map(|b| b.half_height),
            #[cfg(feature = "dim3")]
            ShapeType::RoundCylinder => co
                .shape()
                .as_round_cylinder()
                .map(|b| b.base_shape.half_height),
            #[cfg(feature = "dim3")]
            ShapeType::Cone => co.shape().as_cone().map(|b| b.half_height),
            _ => None,
        })
    }

    /// The radius of the round edges of this collider if it is a round cylinder.
    pub fn coRoundRadius(&self, handle: u32) -> Option<f32> {
        self.map(handle, |co| match co.shape().shape_type() {
            #[cfg(feature = "dim3")]
            ShapeType::RoundCylinder => co.shape().as_round_cylinder().map(|b| b.border_radius),
            _ => None,
        })
    }

    /// The vertices of this triangle mesh, polyline, convex polyhedron, or convex polyhedron, if it is one.
    pub fn coVertices(&self, handle: u32) -> Option<Vec<f32>> {
        let flatten =
            |vertices: &[Point<f32>]| vertices.iter().flat_map(|p| p.iter()).copied().collect();
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::TriMesh => co.shape().as_trimesh().map(|t| flatten(t.vertices())),
            #[cfg(feature = "dim2")]
            ShapeType::Polyline => co.shape().as_polyline().map(|p| flatten(p.vertices())),
            #[cfg(feature = "dim3")]
            ShapeType::ConvexPolyhedron => co
                .shape()
                .as_convex_polyhedron()
                .map(|p| flatten(p.points())),
            #[cfg(feature = "dim3")]
            ShapeType::RoundConvexPolyhedron => co
                .shape()
                .as_round_convex_polyhedron()
                .map(|p| flatten(p.base_shape.points())),
            #[cfg(feature = "dim2")]
            ShapeType::ConvexPolygon => co.shape().as_convex_polygon().map(|p| flatten(p.points())),
            #[cfg(feature = "dim2")]
            ShapeType::RoundConvexPolygon => co
                .shape()
                .as_round_convex_polygon()
                .map(|p| flatten(p.base_shape.points())),
            _ => None,
        })
    }

    /// The indices of this triangle mesh, polyline, or convex polyhedron, if it is one.
    pub fn coIndices(&self, handle: u32) -> Option<Vec<u32>> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::TriMesh => co
                .shape()
                .as_trimesh()
                .map(|t| t.indices().iter().flat_map(|p| p.iter()).copied().collect()),
            ShapeType::Polyline => co
                .shape()
                .as_polyline()
                .map(|p| p.indices().iter().flat_map(|p| p.iter()).copied().collect()),
            #[cfg(feature = "dim3")]
            ShapeType::ConvexPolyhedron => co.shape().as_convex_polyhedron().map(|p| {
                // TODO: avoid the `.to_trimesh()`.
                p.to_trimesh()
                    .1
                    .iter()
                    .flat_map(|p| p.iter())
                    .copied()
                    .collect()
            }),
            #[cfg(feature = "dim3")]
            ShapeType::RoundConvexPolyhedron => co.shape().as_round_convex_polyhedron().map(|p| {
                // TODO: avoid the `.to_trimesh()`.
                p.base_shape
                    .to_trimesh()
                    .1
                    .iter()
                    .flat_map(|p| p.iter())
                    .copied()
                    .collect()
            }),
            _ => None,
        })
    }

    /// The height of this heightfield if it is one.
    pub fn coHeightfieldHeights(&self, handle: u32) -> Option<Vec<f32>> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::HeightField => co
                .shape()
                .as_heightfield()
                .map(|h| h.heights().as_slice().to_vec()),
            _ => None,
        })
    }

    /// The scaling factor applied of this heightfield if it is one.
    pub fn coHeightfieldScale(&self, handle: u32) -> Option<RawVector> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::HeightField => co.shape().as_heightfield().map(|h| RawVector(*h.scale())),
            _ => None,
        })
    }

    /// The number of rows on this heightfield's height matrix, if it is one.
    #[cfg(feature = "dim3")]
    pub fn coHeightfieldNRows(&self, handle: u32) -> Option<usize> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::HeightField => co.shape().as_heightfield().map(|h| h.nrows()),
            _ => None,
        })
    }

    /// The number of columns on this heightfield's height matrix, if it is one.
    #[cfg(feature = "dim3")]
    pub fn coHeightfieldNCols(&self, handle: u32) -> Option<usize> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::HeightField => co.shape().as_heightfield().map(|h| h.ncols()),
            _ => None,
        })
    }

    /// The unique integer identifier of the rigid-body this collider is attached to.
    pub fn coParent(&self, handle: u32) -> u32 {
        self.map(handle, |co| co.parent().into_raw_parts().0)
    }

    /// The friction coefficient of this collider.
    pub fn coFriction(&self, handle: u32) -> f32 {
        self.map(handle, |co| co.material().friction)
    }

    /// The density of this collider.
    pub fn coDensity(&self, handle: u32) -> Option<f32> {
        self.map(handle, |co| co.density())
    }

    /// The collision groups of this collider.
    pub fn coCollisionGroups(&self, handle: u32) -> u32 {
        self.map(handle, |co| co.collision_groups().0)
    }

    /// The solver groups of this collider.
    pub fn coSolverGroups(&self, handle: u32) -> u32 {
        self.map(handle, |co| co.solver_groups().0)
    }
}
