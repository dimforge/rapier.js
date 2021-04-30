use crate::dynamics::{RawIslandManager, RawRigidBodySet};
use crate::geometry::{
    RawColliderSet, RawPointColliderProjection, RawRayColliderIntersection, RawRayColliderToi,
    RawShape, RawShapeColliderTOI,
};
use crate::math::{RawRotation, RawVector};
use rapier::geometry::{ColliderHandle, InteractionGroups, Ray};
use rapier::math::Isometry;
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

    pub fn update(
        &mut self,
        islands: &RawIslandManager,
        bodies: &RawRigidBodySet,
        colliders: &RawColliderSet,
    ) {
        self.0.update(&islands.0, &bodies.0, &colliders.0);
    }

    pub fn castRay(
        &self,
        colliders: &RawColliderSet,
        rayOrig: &RawVector,
        rayDir: &RawVector,
        maxToi: f32,
        solid: bool,
        groups: u32,
    ) -> Option<RawRayColliderToi> {
        let ray = Ray::new(rayOrig.0.into(), rayDir.0);
        let (handle, toi) = self.0.cast_ray(
            &colliders.0,
            &ray,
            maxToi,
            solid,
            InteractionGroups(groups),
            None,
        )?;
        Some(RawRayColliderToi { handle, toi })
    }

    pub fn castRayAndGetNormal(
        &self,
        colliders: &RawColliderSet,
        rayOrig: &RawVector,
        rayDir: &RawVector,
        maxToi: f32,
        solid: bool,
        groups: u32,
    ) -> Option<RawRayColliderIntersection> {
        let ray = Ray::new(rayOrig.0.into(), rayDir.0);
        let (handle, inter) = self.0.cast_ray_and_get_normal(
            &colliders.0,
            &ray,
            maxToi,
            solid,
            InteractionGroups(groups),
            None,
        )?;
        Some(RawRayColliderIntersection { handle, inter })
    }

    // The callback is of type (RawRayColliderIntersection) => bool
    pub fn intersectionsWithRay(
        &self,
        colliders: &RawColliderSet,
        rayOrig: &RawVector,
        rayDir: &RawVector,
        maxToi: f32,
        solid: bool,
        groups: u32,
        callback: &js_sys::Function,
    ) {
        let ray = Ray::new(rayOrig.0.into(), rayDir.0);
        let this = JsValue::null();
        let rcallback = |handle, inter| {
            let result = RawRayColliderIntersection { handle, inter };
            match callback.call1(&this, &JsValue::from(result)) {
                Err(_) => true,
                Ok(val) => val.as_bool().unwrap_or(true),
            }
        };

        self.0.intersections_with_ray(
            &colliders.0,
            &ray,
            maxToi,
            solid,
            InteractionGroups(groups),
            None,
            rcallback,
        )
    }

    pub fn intersectionWithShape(
        &self,
        colliders: &RawColliderSet,
        shapePos: &RawVector,
        shapeRot: &RawRotation,
        shape: &RawShape,
        groups: u32,
    ) -> Option<u32> {
        let pos = Isometry::from_parts(shapePos.0.into(), shapeRot.0);
        self.0
            .intersection_with_shape(
                &colliders.0,
                &pos,
                &*shape.0,
                InteractionGroups(groups),
                None,
            )
            .map(|h| h.into_raw_parts().0)
    }

    pub fn projectPoint(
        &self,
        colliders: &RawColliderSet,
        point: &RawVector,
        solid: bool,
        groups: u32,
    ) -> Option<RawPointColliderProjection> {
        self.0
            .project_point(
                &colliders.0,
                &point.0.into(),
                solid,
                InteractionGroups(groups),
                None,
            )
            .map(|(handle, proj)| RawPointColliderProjection { handle, proj })
    }

    // The callback is of type (u32) => bool
    pub fn intersectionsWithPoint(
        &self,
        colliders: &RawColliderSet,
        point: &RawVector,
        groups: u32,
        callback: &js_sys::Function,
    ) {
        let this = JsValue::null();
        let rcallback = |handle: ColliderHandle| match callback
            .call1(&this, &JsValue::from(handle.into_raw_parts().0 as u32))
        {
            Err(_) => true,
            Ok(val) => val.as_bool().unwrap_or(true),
        };

        self.0.intersections_with_point(
            &colliders.0,
            &point.0.into(),
            InteractionGroups(groups),
            None,
            rcallback,
        )
    }

    // /// Projects a point on the scene and get
    // pub fn projectPointAndGetFeature(
    //     &self,
    //     colliders: &ColliderSet,
    //     point: &Point<Real>,
    //     groups: InteractionGroups,
    // ) -> Option<(ColliderHandle, PointProjection, FeatureId)> {
    // }

    pub fn castShape(
        &self,
        colliders: &RawColliderSet,
        shapePos: &RawVector,
        shapeRot: &RawRotation,
        shapeVel: &RawVector,
        shape: &RawShape,
        maxToi: f32,
        groups: u32,
    ) -> Option<RawShapeColliderTOI> {
        let pos = Isometry::from_parts(shapePos.0.into(), shapeRot.0);
        self.0
            .cast_shape(
                &colliders.0,
                &pos,
                &shapeVel.0,
                &*shape.0,
                maxToi,
                InteractionGroups(groups),
                None,
            )
            .map(|(handle, toi)| RawShapeColliderTOI { handle, toi })
    }

    // The callback has type (u32) => boolean
    pub fn intersectionsWithShape(
        &self,
        colliders: &RawColliderSet,
        shapePos: &RawVector,
        shapeRot: &RawRotation,
        shape: &RawShape,
        groups: u32,
        callback: &js_sys::Function,
    ) {
        let this = JsValue::null();
        let rcallback = |handle: ColliderHandle| match callback
            .call1(&this, &JsValue::from(handle.into_raw_parts().0 as u32))
        {
            Err(_) => true,
            Ok(val) => val.as_bool().unwrap_or(true),
        };

        let pos = Isometry::from_parts(shapePos.0.into(), shapeRot.0);
        self.0.intersections_with_shape(
            &colliders.0,
            &pos,
            &*shape.0,
            InteractionGroups(groups),
            None,
            rcallback,
        )
    }
}
