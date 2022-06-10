use crate::dynamics::{RawIslandManager, RawRigidBodySet};
use crate::geometry::{
    RawColliderSet, RawPointColliderProjection, RawRayColliderIntersection, RawRayColliderToi,
    RawShape, RawShapeColliderTOI,
};
use crate::math::{RawRotation, RawVector};
use crate::utils::{self, FlatHandle};
use rapier::geometry::{ColliderHandle, Ray, AABB};
use rapier::math::{Isometry, Point};
use rapier::pipeline::QueryPipeline;
use rapier::prelude::FeatureId;
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
        filter: &js_sys::Function,
    ) -> Option<RawRayColliderToi> {
        let ray = Ray::new(rayOrig.0.into(), rayDir.0);
        let filter = wrap_filter(filter);
        let filter = filter
            .as_ref()
            .map(|f| f as &dyn Fn(ColliderHandle) -> bool);

        let (handle, toi) = self.0.cast_ray(
            &colliders.0,
            &ray,
            maxToi,
            solid,
            crate::geometry::unpack_interaction_groups(groups),
            filter,
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
        filter: &js_sys::Function,
    ) -> Option<RawRayColliderIntersection> {
        let ray = Ray::new(rayOrig.0.into(), rayDir.0);
        let rfilter = wrap_filter(filter);
        let rfilter = rfilter
            .as_ref()
            .map(|f| f as &dyn Fn(ColliderHandle) -> bool);

        let (handle, inter) = self.0.cast_ray_and_get_normal(
            &colliders.0,
            &ray,
            maxToi,
            solid,
            crate::geometry::unpack_interaction_groups(groups),
            rfilter,
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
        filter: &js_sys::Function,
    ) {
        let ray = Ray::new(rayOrig.0.into(), rayDir.0);
        let rcallback = |handle, inter| {
            let result = RawRayColliderIntersection { handle, inter };
            match callback.call1(&JsValue::null(), &JsValue::from(result)) {
                Err(_) => true,
                Ok(val) => val.as_bool().unwrap_or(true),
            }
        };

        let rfilter = wrap_filter(filter);
        let rfilter = rfilter
            .as_ref()
            .map(|f| f as &dyn Fn(ColliderHandle) -> bool);

        self.0.intersections_with_ray(
            &colliders.0,
            &ray,
            maxToi,
            solid,
            crate::geometry::unpack_interaction_groups(groups),
            rfilter,
            rcallback,
        );
    }

    pub fn intersectionWithShape(
        &self,
        colliders: &RawColliderSet,
        shapePos: &RawVector,
        shapeRot: &RawRotation,
        shape: &RawShape,
        groups: u32,
        filter: &js_sys::Function,
    ) -> Option<FlatHandle> {
        let rfilter = wrap_filter(filter);
        let rfilter = rfilter
            .as_ref()
            .map(|f| f as &dyn Fn(ColliderHandle) -> bool);

        let pos = Isometry::from_parts(shapePos.0.into(), shapeRot.0);
        self.0
            .intersection_with_shape(
                &colliders.0,
                &pos,
                &*shape.0,
                crate::geometry::unpack_interaction_groups(groups),
                rfilter,
            )
            .map(|h| utils::flat_handle(h.0))
    }

    pub fn projectPoint(
        &self,
        colliders: &RawColliderSet,
        point: &RawVector,
        solid: bool,
        groups: u32,
        filter: &js_sys::Function,
    ) -> Option<RawPointColliderProjection> {
        let rfilter = wrap_filter(filter);
        let rfilter = rfilter
            .as_ref()
            .map(|f| f as &dyn Fn(ColliderHandle) -> bool);

        self.0
            .project_point(
                &colliders.0,
                &point.0.into(),
                solid,
                crate::geometry::unpack_interaction_groups(groups),
                rfilter,
            )
            .map(|(handle, proj)| RawPointColliderProjection {
                handle,
                proj,
                feature: FeatureId::Unknown,
            })
    }

    pub fn projectPointAndGetFeature(
        &self,
        colliders: &RawColliderSet,
        point: &RawVector,
        groups: u32,
        filter: &js_sys::Function,
    ) -> Option<RawPointColliderProjection> {
        let filtercb = |handle: ColliderHandle| match filter.call1(
            &JsValue::null(),
            &JsValue::from(handle.into_raw_parts().0 as u32),
        ) {
            Err(_) => true,
            Ok(val) => val.as_bool().unwrap_or(true),
        };
        let rfilter: Option<&dyn Fn(ColliderHandle) -> bool> = if filter.is_function() {
            Some(&filtercb)
        } else {
            None
        };

        self.0
            .project_point_and_get_feature(
                &colliders.0,
                &point.0.into(),
                crate::geometry::unpack_interaction_groups(groups),
                rfilter,
            )
            .map(|(handle, proj, feature)| RawPointColliderProjection {
                handle,
                proj,
                feature,
            })
    }

    // The callback is of type (u32) => bool
    pub fn intersectionsWithPoint(
        &self,
        colliders: &RawColliderSet,
        point: &RawVector,
        groups: u32,
        callback: &js_sys::Function,
        filter: &js_sys::Function,
    ) {
        let rcallback = |handle: ColliderHandle| match callback.call1(
            &JsValue::null(),
            &JsValue::from(utils::flat_handle(handle.0)),
        ) {
            Err(_) => true,
            Ok(val) => val.as_bool().unwrap_or(true),
        };
        let rfilter = wrap_filter(filter);
        let rfilter = rfilter
            .as_ref()
            .map(|f| f as &dyn Fn(ColliderHandle) -> bool);

        self.0.intersections_with_point(
            &colliders.0,
            &point.0.into(),
            crate::geometry::unpack_interaction_groups(groups),
            rfilter,
            rcallback,
        )
    }

    pub fn castShape(
        &self,
        colliders: &RawColliderSet,
        shapePos: &RawVector,
        shapeRot: &RawRotation,
        shapeVel: &RawVector,
        shape: &RawShape,
        maxToi: f32,
        groups: u32,
        filter: &js_sys::Function,
    ) -> Option<RawShapeColliderTOI> {
        let rfilter = wrap_filter(filter);
        let rfilter = rfilter
            .as_ref()
            .map(|f| f as &dyn Fn(ColliderHandle) -> bool);

        let pos = Isometry::from_parts(shapePos.0.into(), shapeRot.0);
        self.0
            .cast_shape(
                &colliders.0,
                &pos,
                &shapeVel.0,
                &*shape.0,
                maxToi,
                crate::geometry::unpack_interaction_groups(groups),
                rfilter,
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
        filter: &js_sys::Function,
    ) {
        let rcallback = |handle: ColliderHandle| match callback.call1(
            &JsValue::null(),
            &JsValue::from(utils::flat_handle(handle.0)),
        ) {
            Err(_) => true,
            Ok(val) => val.as_bool().unwrap_or(true),
        };

        let rfilter = wrap_filter(filter);
        let rfilter = rfilter
            .as_ref()
            .map(|f| f as &dyn Fn(ColliderHandle) -> bool);

        let pos = Isometry::from_parts(shapePos.0.into(), shapeRot.0);
        self.0.intersections_with_shape(
            &colliders.0,
            &pos,
            &*shape.0,
            crate::geometry::unpack_interaction_groups(groups),
            rfilter,
            rcallback,
        )
    }

    pub fn collidersWithAabbIntersectingAabb(
        &self,
        aabbCenter: &RawVector,
        aabbHalfExtents: &RawVector,
        callback: &js_sys::Function,
    ) {
        let rcallback = |handle: &ColliderHandle| match callback.call1(
            &JsValue::null(),
            &JsValue::from(utils::flat_handle(handle.0)),
        ) {
            Err(_) => true,
            Ok(val) => val.as_bool().unwrap_or(true),
        };

        let center = Point::from(aabbCenter.0);
        let aabb = AABB::new(center - aabbHalfExtents.0, center + aabbHalfExtents.0);

        self.0
            .colliders_with_aabb_intersecting_aabb(&aabb, rcallback)
    }
}

fn wrap_filter(filter: &js_sys::Function) -> Option<impl Fn(ColliderHandle) -> bool + '_> {
    if filter.is_function() {
        let filtercb = move |handle: ColliderHandle| match filter.call1(
            &JsValue::null(),
            &JsValue::from(utils::flat_handle(handle.0)),
        ) {
            Err(_) => true,
            Ok(val) => val.as_bool().unwrap_or(true),
        };

        Some(filtercb)
    } else {
        None
    }
}
