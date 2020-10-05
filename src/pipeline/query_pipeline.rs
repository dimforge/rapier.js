use crate::dynamics::RawRigidBodySet;
use crate::geometry::{RawColliderSet, RawRayColliderIntersection};
use crate::math::RawVector;
use rapier::geometry::Ray;
use rapier::pipeline::QueryPipeline;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawQueryPipeline(pub(crate) QueryPipeline);

#[wasm_bindgen]
impl RawQueryPipeline {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        RawQueryPipeline(QueryPipeline::new())
    }

    pub fn update(&mut self, bodies: &RawRigidBodySet, colliders: &RawColliderSet) {
        self.0.update(&bodies.0, &colliders.0);
    }

    pub fn castRay(
        &self,
        colliders: &RawColliderSet,
        rayOrig: &RawVector,
        rayDir: &RawVector,
        maxToi: f32,
    ) -> Option<RawRayColliderIntersection> {
        let ray = Ray::new(rayOrig.0.into(), rayDir.0);
        let (handle, _, inter) = self.0.cast_ray(&colliders.0, &ray, maxToi)?;
        Some(RawRayColliderIntersection { handle, inter })
    }
}
