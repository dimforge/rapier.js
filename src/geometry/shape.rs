use crate::math::RawVector;
use rapier::geometry::{Ball, Capsule, Cuboid, Shape};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawShape(pub(crate) Shape);

#[wasm_bindgen]
impl RawShape {
    pub fn cuboid(half_extents: &RawVector) -> Self {
        Self(Shape::Cuboid(Cuboid::new(half_extents.0)))
    }

    pub fn ball(radius: f32) -> Self {
        Self(Shape::Ball(Ball::new(radius)))
    }
}
