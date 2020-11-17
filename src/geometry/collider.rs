use crate::geometry::{RawColliderSet, RawShapeType};
use crate::math::{RawRotation, RawVector};
use rapier::geometry::ShapeType;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
impl RawColliderSet {
    /// The world-space translation of this rigid-body.
    pub fn coTranslation(&self, handle: usize) -> RawVector {
        self.map(handle, |co| co.position().translation.vector.into())
    }

    /// The world-space orientation of this rigid-body.
    pub fn coRotation(&self, handle: usize) -> RawRotation {
        self.map(handle, |co| co.position().rotation.into())
    }

    /// Is this collider a sensor?
    pub fn coIsSensor(&self, handle: usize) -> bool {
        self.map(handle, |co| co.is_sensor())
    }

    /// The type of the shape of this collider.
    pub fn coShapeType(&self, handle: usize) -> RawShapeType {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::Ball => RawShapeType::Ball,
            ShapeType::Polygon => RawShapeType::Polygon,
            ShapeType::Cuboid => RawShapeType::Cuboid,
            ShapeType::Capsule => RawShapeType::Capsule,
            ShapeType::Triangle => RawShapeType::Triangle,
            ShapeType::Trimesh => RawShapeType::Trimesh,
            ShapeType::HeightField => RawShapeType::HeightField,
            #[cfg(feature = "dim3")]
            ShapeType::Cylinder => RawShapeType::Cylinder,
            #[cfg(feature = "dim3")]
            ShapeType::RoundCylinder => RawShapeType::RoundCylinder,
            #[cfg(feature = "dim3")]
            ShapeType::Cone => RawShapeType::Cone,
            ShapeType::Segment => RawShapeType::Segment,
        })
    }

    /// The half-extents of this collider if it is has a cuboid shape.
    pub fn coHalfExtents(&self, handle: usize) -> Option<RawVector> {
        self.map(handle, |co| {
            co.shape().as_cuboid().map(|c| c.half_extents.into())
        })
    }

    /// The radius of this collider if it is a ball, capsule, cylinder, or cone shape.
    pub fn coRadius(&self, handle: usize) -> Option<f32> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::Ball => co.shape().as_ball().map(|b| b.radius),
            ShapeType::Capsule => co.shape().as_capsule().map(|b| b.radius),
            #[cfg(feature = "dim3")]
            ShapeType::Cylinder => co.shape().as_cylinder().map(|b| b.radius),
            #[cfg(feature = "dim3")]
            ShapeType::RoundCylinder => co.shape().as_round_cylinder().map(|b| b.cylinder.radius),
            #[cfg(feature = "dim3")]
            ShapeType::Cone => co.shape().as_cone().map(|b| b.radius),
            _ => None,
        })
    }

    /// The radius of this collider if it is a capsule, cylinder, or cone shape.
    pub fn coHalfHeight(&self, handle: usize) -> Option<f32> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::Capsule => co.shape().as_capsule().map(|b| b.half_height()),
            #[cfg(feature = "dim3")]
            ShapeType::Cylinder => co.shape().as_cylinder().map(|b| b.half_height),
            #[cfg(feature = "dim3")]
            ShapeType::RoundCylinder => co
                .shape()
                .as_round_cylinder()
                .map(|b| b.cylinder.half_height),
            #[cfg(feature = "dim3")]
            ShapeType::Cone => co.shape().as_cone().map(|b| b.half_height),
            _ => None,
        })
    }

    /// The radius of the round edges of this collider if it is a round cylinder.
    pub fn coRoundRadius(&self, handle: usize) -> Option<f32> {
        self.map(handle, |co| match co.shape().shape_type() {
            #[cfg(feature = "dim3")]
            ShapeType::RoundCylinder => co.shape().as_round_cylinder().map(|b| b.border_radius),
            _ => None,
        })
    }

    /// The vertices of this triangle mesh if it is one.
    pub fn coTrimeshVertices(&self, handle: usize) -> Option<Vec<f32>> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::Trimesh => co.shape().as_trimesh().map(|t| {
                t.vertices()
                    .iter()
                    .flat_map(|p| p.iter())
                    .copied()
                    .collect()
            }),
            _ => None,
        })
    }

    /// The indices of this triangle mesh if it is one.
    pub fn coTrimeshIndices(&self, handle: usize) -> Option<Vec<u32>> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::Trimesh => co
                .shape()
                .as_trimesh()
                .map(|t| t.indices().iter().flat_map(|p| p.iter()).copied().collect()),
            _ => None,
        })
    }

    /// The height of this heightfield if it is one.
    pub fn coHeightfieldHeights(&self, handle: usize) -> Option<Vec<f32>> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::HeightField => co
                .shape()
                .as_heightfield()
                .map(|h| h.heights().as_slice().to_vec()),
            _ => None,
        })
    }

    /// The scaling factor applied of this heightfield if it is one.
    pub fn coHeightfieldScale(&self, handle: usize) -> Option<RawVector> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::HeightField => co.shape().as_heightfield().map(|h| RawVector(*h.scale())),
            _ => None,
        })
    }

    /// The number of rows on this heightfield's height matrix, if it is one.
    #[cfg(feature = "dim3")]
    pub fn coHeightfieldNRows(&self, handle: usize) -> Option<usize> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::HeightField => co.shape().as_heightfield().map(|h| h.nrows()),
            _ => None,
        })
    }

    /// The number of columns on this heightfield's height matrix, if it is one.
    #[cfg(feature = "dim3")]
    pub fn coHeightfieldNCols(&self, handle: usize) -> Option<usize> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::HeightField => co.shape().as_heightfield().map(|h| h.ncols()),
            _ => None,
        })
    }

    /// The unique integer identifier of the rigid-body this collider is attached to.
    pub fn coParent(&self, handle: usize) -> usize {
        self.map(handle, |co| co.parent().into_raw_parts().0)
    }

    /// The friction coefficient of this collider.
    pub fn coFriction(&self, handle: usize) -> f32 {
        self.map(handle, |co| co.friction)
    }

    /// The density of this collider.
    pub fn coDensity(&self, handle: usize) -> f32 {
        self.map(handle, |co| co.density())
    }

    /// The collision groups of this collider.
    pub fn coCollisionGroups(&self, handle: usize) -> u32 {
        self.map(handle, |co| co.collision_groups().0)
    }

    /// The solver groups of this collider.
    pub fn coSolverGroups(&self, handle: usize) -> u32 {
        self.map(handle, |co| co.solver_groups().0)
    }
}
