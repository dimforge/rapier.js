use crate::geometry::{RawColliderSet, RawShapeType};
use crate::math::{RawRotation, RawVector};
#[cfg(feature = "dim3")]
use rapier::geometry::Cylinder;
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
        })
    }

    /// The half-extents of this collider if it is has a cuboid shape.
    pub fn coHalfExtents(&self, handle: usize) -> Option<RawVector> {
        self.map(handle, |co| {
            co.shape().as_cuboid().map(|c| c.half_extents.into())
        })
    }

    /// The radius of this collider if it is has a ball, capsule, cylinder, or cone shape.
    pub fn coRadius(&self, handle: usize) -> Option<f32> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::Ball => co.shape().as_ball().map(|b| b.radius),
            ShapeType::Capsule => co.shape().as_capsule().map(|b| b.radius),
            #[cfg(feature = "dim3")]
            ShapeType::Cylinder => co.shape().as_cylinder().map(|b| b.radius),
            #[cfg(feature = "dim3")]
            ShapeType::RoundCylinder => co.shape().as_rounded::<Cylinder>().map(|b| b.radius),
            #[cfg(feature = "dim3")]
            ShapeType::Cone => co.shape().as_cone().map(|b| b.radius),
            _ => None,
        })
    }

    /// The radius of this collider if it is has a capsule, cylinder, or cone shape.
    pub fn coHalfHeight(&self, handle: usize) -> Option<f32> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::Capsule => co.shape().as_capsule().map(|b| b.half_height),
            #[cfg(feature = "dim3")]
            ShapeType::Cylinder => co.shape().as_cylinder().map(|b| b.half_height),
            #[cfg(feature = "dim3")]
            ShapeType::RoundCylinder => co
                .shape()
                .as_rounded::<Cylinder>()
                .map(|b| b.shape.half_height),
            #[cfg(feature = "dim3")]
            ShapeType::Cone => co.shape().as_cone().map(|b| b.half_height),
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
}
