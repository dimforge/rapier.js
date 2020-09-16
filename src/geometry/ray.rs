use crate::math::Vector;
use rapier::geometry::{ColliderHandle, Ray as RRay};
use rapier::ncollide::query::RayIntersection as RRayIntersection;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[repr(transparent)]
#[derive(Copy, Clone)]
/// A Ray.
///
/// A ray is a directed half-segment. It starts at
/// a point and progress indefinitely towards a straigth line.
pub struct Ray(pub(crate) RRay);

#[wasm_bindgen]
impl Ray {
    /// Creates a new ray from a starting point and a direction.
    ///
    /// # Parameters
    /// - `origin`: the starting point of the ray.
    /// - `direction`: the direction of the ray.
    #[wasm_bindgen(constructor)]
    pub fn new(origin: &Vector, direction: &Vector) -> Self {
        Ray(RRay::new(origin.0.into(), direction.0))
    }

    /// The origin, starting point of this ray.
    pub fn origin(&self) -> Vector {
        Vector(self.0.origin.coords)
    }

    /// The direction of this ray.
    pub fn dir(&self) -> Vector {
        Vector(self.0.dir)
    }
}

#[wasm_bindgen]
#[derive(Copy, Clone)]
/// The result of a ray-cast on a collider.
pub struct RayIntersection {
    pub(crate) collider: ColliderHandle,
    pub(crate) intersection: RRayIntersection<f32>,
}

#[wasm_bindgen]
impl RayIntersection {
    /// The integer handle of the collider hit by a ray.
    pub fn colliderHandle(&self) -> usize {
        self.collider.into_raw_parts().0
    }

    /// The time-of-impact of the ray on the collider's shape.
    ///
    /// The time-of-impact is defined such that the hit point
    /// of the ray on the collider is given by `ray.orig() + ray.dir() * toi`.
    /// Therefore if `ray.dir()` is a unit vector, then `toi` is the distance
    /// traveled by the ray before hitting the collider.
    pub fn toi(&self) -> f32 {
        self.intersection.toi
    }

    /// The outward normal of the collider's shape at the ray's hit point.
    pub fn normal(&self) -> Vector {
        Vector(self.intersection.normal)
    }
}
