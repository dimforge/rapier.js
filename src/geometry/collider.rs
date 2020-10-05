use crate::geometry::{RawColliderSet, RawShapeType};
use crate::math::{RawRotation, RawVector};
use rapier::geometry::Shape;
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
        self.map(handle, |co| match co.shape() {
            Shape::Ball(_) => RawShapeType::Ball,
            Shape::Polygon(_) => RawShapeType::Polygon,
            Shape::Cuboid(_) => RawShapeType::Cuboid,
            Shape::Capsule(_) => RawShapeType::Capsule,
            Shape::Triangle(_) => RawShapeType::Triangle,
            Shape::Trimesh(_) => RawShapeType::Trimesh,
            Shape::HeightField(_) => RawShapeType::HeightField,
        })
    }

    /// The half-extents of this collider if it is has a cuboid shape.
    pub fn coHalfExtents(&self, handle: usize) -> Option<RawVector> {
        self.map(handle, |co| {
            co.shape().as_cuboid().map(|c| c.half_extents.into())
        })
    }

    /// The radius of this collider if it is has a ball shape.
    pub fn coRadius(&self, handle: usize) -> Option<f32> {
        self.map(handle, |co| co.shape().as_ball().map(|b| b.radius))
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
