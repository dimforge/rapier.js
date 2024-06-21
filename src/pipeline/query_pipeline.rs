use crate::dynamics::RawRigidBodySet;
use crate::geometry::{
    RawColliderSet, RawColliderShapeCastHit, RawPointColliderProjection, RawRayColliderHit,
    RawRayColliderIntersection, RawShape,
};
use crate::math::{RawRotation, RawVector};
use crate::utils::{self, FlatHandle};
use rapier::geometry::{Aabb, ColliderHandle, Ray};
use rapier::math::{Isometry, Point};
use rapier::parry::query::ShapeCastOptions;
use rapier::pipeline::{QueryFilter, QueryFilterFlags, QueryPipeline};
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

    pub fn update(&mut self, colliders: &RawColliderSet) {
        self.0.update(&colliders.0);
    }

    pub fn castRay(
        &self,
        bodies: &RawRigidBodySet,
        colliders: &RawColliderSet,
        rayOrig: &RawVector,
        rayDir: &RawVector,
        maxToi: f32,
        solid: bool,
        filter_flags: u32,
        filter_groups: Option<u32>,
        filter_exclude_collider: Option<FlatHandle>,
        filter_exclude_rigid_body: Option<FlatHandle>,
        filter_predicate: &js_sys::Function,
    ) -> Option<RawRayColliderHit> {
        let (handle, timeOfImpact) = utils::with_filter(filter_predicate, |predicate| {
            let query_filter = QueryFilter {
                flags: QueryFilterFlags::from_bits(filter_flags)
                    .unwrap_or(QueryFilterFlags::empty()),
                groups: filter_groups.map(crate::geometry::unpack_interaction_groups),
                exclude_collider: filter_exclude_collider.map(crate::utils::collider_handle),
                exclude_rigid_body: filter_exclude_rigid_body.map(crate::utils::body_handle),
                predicate,
            };

            let ray = Ray::new(rayOrig.0.into(), rayDir.0);
            self.0
                .cast_ray(&bodies.0, &colliders.0, &ray, maxToi, solid, query_filter)
        })?;

        Some(RawRayColliderHit {
            handle,
            timeOfImpact,
        })
    }

    pub fn castRayAndGetNormal(
        &self,
        bodies: &RawRigidBodySet,
        colliders: &RawColliderSet,
        rayOrig: &RawVector,
        rayDir: &RawVector,
        maxToi: f32,
        solid: bool,
        filter_flags: u32,
        filter_groups: Option<u32>,
        filter_exclude_collider: Option<FlatHandle>,
        filter_exclude_rigid_body: Option<FlatHandle>,
        filter_predicate: &js_sys::Function,
    ) -> Option<RawRayColliderIntersection> {
        let (handle, inter) = utils::with_filter(filter_predicate, |predicate| {
            let query_filter = QueryFilter {
                flags: QueryFilterFlags::from_bits(filter_flags)
                    .unwrap_or(QueryFilterFlags::empty()),
                groups: filter_groups.map(crate::geometry::unpack_interaction_groups),
                exclude_collider: filter_exclude_collider.map(crate::utils::collider_handle),
                exclude_rigid_body: filter_exclude_rigid_body.map(crate::utils::body_handle),
                predicate,
            };

            let ray = Ray::new(rayOrig.0.into(), rayDir.0);
            self.0.cast_ray_and_get_normal(
                &bodies.0,
                &colliders.0,
                &ray,
                maxToi,
                solid,
                query_filter,
            )
        })?;

        Some(RawRayColliderIntersection { handle, inter })
    }

    // The callback is of type (RawRayColliderIntersection) => bool
    pub fn intersectionsWithRay(
        &self,
        bodies: &RawRigidBodySet,
        colliders: &RawColliderSet,
        rayOrig: &RawVector,
        rayDir: &RawVector,
        maxToi: f32,
        solid: bool,
        callback: &js_sys::Function,
        filter_flags: u32,
        filter_groups: Option<u32>,
        filter_exclude_collider: Option<FlatHandle>,
        filter_exclude_rigid_body: Option<FlatHandle>,
        filter_predicate: &js_sys::Function,
    ) {
        utils::with_filter(filter_predicate, |predicate| {
            let query_filter = QueryFilter {
                flags: QueryFilterFlags::from_bits(filter_flags)
                    .unwrap_or(QueryFilterFlags::empty()),
                groups: filter_groups.map(crate::geometry::unpack_interaction_groups),
                exclude_collider: filter_exclude_collider.map(crate::utils::collider_handle),
                exclude_rigid_body: filter_exclude_rigid_body.map(crate::utils::body_handle),
                predicate,
            };

            let ray = Ray::new(rayOrig.0.into(), rayDir.0);
            let rcallback = |handle, inter| {
                let result = RawRayColliderIntersection { handle, inter };
                match callback.call1(&JsValue::null(), &JsValue::from(result)) {
                    Err(_) => true,
                    Ok(val) => val.as_bool().unwrap_or(true),
                }
            };

            self.0.intersections_with_ray(
                &bodies.0,
                &colliders.0,
                &ray,
                maxToi,
                solid,
                query_filter,
                rcallback,
            );
        });
    }

    pub fn intersectionWithShape(
        &self,
        bodies: &RawRigidBodySet,
        colliders: &RawColliderSet,
        shapePos: &RawVector,
        shapeRot: &RawRotation,
        shape: &RawShape,
        filter_flags: u32,
        filter_groups: Option<u32>,
        filter_exclude_collider: Option<FlatHandle>,
        filter_exclude_rigid_body: Option<FlatHandle>,
        filter_predicate: &js_sys::Function,
    ) -> Option<FlatHandle> {
        utils::with_filter(filter_predicate, |predicate| {
            let query_filter = QueryFilter {
                flags: QueryFilterFlags::from_bits(filter_flags)
                    .unwrap_or(QueryFilterFlags::empty()),
                groups: filter_groups.map(crate::geometry::unpack_interaction_groups),
                exclude_collider: filter_exclude_collider.map(crate::utils::collider_handle),
                exclude_rigid_body: filter_exclude_rigid_body.map(crate::utils::body_handle),
                predicate,
            };

            let pos = Isometry::from_parts(shapePos.0.into(), shapeRot.0);
            self.0
                .intersection_with_shape(&bodies.0, &colliders.0, &pos, &*shape.0, query_filter)
                .map(|h| utils::flat_handle(h.0))
        })
    }

    pub fn projectPoint(
        &self,
        bodies: &RawRigidBodySet,
        colliders: &RawColliderSet,
        point: &RawVector,
        solid: bool,
        filter_flags: u32,
        filter_groups: Option<u32>,
        filter_exclude_collider: Option<FlatHandle>,
        filter_exclude_rigid_body: Option<FlatHandle>,
        filter_predicate: &js_sys::Function,
    ) -> Option<RawPointColliderProjection> {
        utils::with_filter(filter_predicate, |predicate| {
            let query_filter = QueryFilter {
                flags: QueryFilterFlags::from_bits(filter_flags)
                    .unwrap_or(QueryFilterFlags::empty()),
                groups: filter_groups.map(crate::geometry::unpack_interaction_groups),
                exclude_collider: filter_exclude_collider.map(crate::utils::collider_handle),
                exclude_rigid_body: filter_exclude_rigid_body.map(crate::utils::body_handle),
                predicate,
            };

            self.0
                .project_point(
                    &bodies.0,
                    &colliders.0,
                    &point.0.into(),
                    solid,
                    query_filter,
                )
                .map(|(handle, proj)| RawPointColliderProjection {
                    handle,
                    proj,
                    feature: FeatureId::Unknown,
                })
        })
    }

    pub fn projectPointAndGetFeature(
        &self,
        bodies: &RawRigidBodySet,
        colliders: &RawColliderSet,
        point: &RawVector,
        filter_flags: u32,
        filter_groups: Option<u32>,
        filter_exclude_collider: Option<FlatHandle>,
        filter_exclude_rigid_body: Option<FlatHandle>,
        filter_predicate: &js_sys::Function,
    ) -> Option<RawPointColliderProjection> {
        utils::with_filter(filter_predicate, |predicate| {
            let query_filter = QueryFilter {
                flags: QueryFilterFlags::from_bits(filter_flags)
                    .unwrap_or(QueryFilterFlags::empty()),
                groups: filter_groups.map(crate::geometry::unpack_interaction_groups),
                exclude_collider: filter_exclude_collider.map(crate::utils::collider_handle),
                exclude_rigid_body: filter_exclude_rigid_body.map(crate::utils::body_handle),
                predicate,
            };

            self.0
                .project_point_and_get_feature(
                    &bodies.0,
                    &colliders.0,
                    &point.0.into(),
                    query_filter,
                )
                .map(|(handle, proj, feature)| RawPointColliderProjection {
                    handle,
                    proj,
                    feature,
                })
        })
    }

    // The callback is of type (u32) => bool
    pub fn intersectionsWithPoint(
        &self,
        bodies: &RawRigidBodySet,
        colliders: &RawColliderSet,
        point: &RawVector,
        callback: &js_sys::Function,
        filter_flags: u32,
        filter_groups: Option<u32>,
        filter_exclude_collider: Option<FlatHandle>,
        filter_exclude_rigid_body: Option<FlatHandle>,
        filter_predicate: &js_sys::Function,
    ) {
        utils::with_filter(filter_predicate, |predicate| {
            let query_filter = QueryFilter {
                flags: QueryFilterFlags::from_bits(filter_flags)
                    .unwrap_or(QueryFilterFlags::empty()),
                groups: filter_groups.map(crate::geometry::unpack_interaction_groups),
                exclude_collider: filter_exclude_collider.map(crate::utils::collider_handle),
                exclude_rigid_body: filter_exclude_rigid_body.map(crate::utils::body_handle),
                predicate,
            };

            let rcallback = |handle: ColliderHandle| match callback.call1(
                &JsValue::null(),
                &JsValue::from(utils::flat_handle(handle.0)),
            ) {
                Err(_) => true,
                Ok(val) => val.as_bool().unwrap_or(true),
            };
            self.0.intersections_with_point(
                &bodies.0,
                &colliders.0,
                &point.0.into(),
                query_filter,
                rcallback,
            )
        });
    }

    pub fn castShape(
        &self,
        bodies: &RawRigidBodySet,
        colliders: &RawColliderSet,
        shapePos: &RawVector,
        shapeRot: &RawRotation,
        shapeVel: &RawVector,
        shape: &RawShape,
        target_distance: f32,
        maxToi: f32,
        stop_at_penetration: bool,
        filter_flags: u32,
        filter_groups: Option<u32>,
        filter_exclude_collider: Option<FlatHandle>,
        filter_exclude_rigid_body: Option<FlatHandle>,
        filter_predicate: &js_sys::Function,
    ) -> Option<RawColliderShapeCastHit> {
        utils::with_filter(filter_predicate, |predicate| {
            let query_filter = QueryFilter {
                flags: QueryFilterFlags::from_bits(filter_flags)
                    .unwrap_or(QueryFilterFlags::empty()),
                groups: filter_groups.map(crate::geometry::unpack_interaction_groups),
                exclude_collider: filter_exclude_collider.map(crate::utils::collider_handle),
                exclude_rigid_body: filter_exclude_rigid_body.map(crate::utils::body_handle),
                predicate,
            };

            let pos = Isometry::from_parts(shapePos.0.into(), shapeRot.0);
            self.0
                .cast_shape(
                    &bodies.0,
                    &colliders.0,
                    &pos,
                    &shapeVel.0,
                    &*shape.0,
                    ShapeCastOptions {
                        max_time_of_impact: maxToi,
                        stop_at_penetration,
                        compute_impact_geometry_on_penetration: true,
                        target_distance,
                    },
                    query_filter,
                )
                .map(|(handle, hit)| RawColliderShapeCastHit { handle, hit })
        })
    }

    // The callback has type (u32) => boolean
    pub fn intersectionsWithShape(
        &self,
        bodies: &RawRigidBodySet,
        colliders: &RawColliderSet,
        shapePos: &RawVector,
        shapeRot: &RawRotation,
        shape: &RawShape,
        callback: &js_sys::Function,
        filter_flags: u32,
        filter_groups: Option<u32>,
        filter_exclude_collider: Option<FlatHandle>,
        filter_exclude_rigid_body: Option<FlatHandle>,
        filter_predicate: &js_sys::Function,
    ) {
        utils::with_filter(filter_predicate, |predicate| {
            let query_filter = QueryFilter {
                flags: QueryFilterFlags::from_bits(filter_flags)
                    .unwrap_or(QueryFilterFlags::empty()),
                groups: filter_groups.map(crate::geometry::unpack_interaction_groups),
                exclude_collider: filter_exclude_collider.map(crate::utils::collider_handle),
                exclude_rigid_body: filter_exclude_rigid_body.map(crate::utils::body_handle),
                predicate,
            };

            let rcallback = |handle: ColliderHandle| match callback.call1(
                &JsValue::null(),
                &JsValue::from(utils::flat_handle(handle.0)),
            ) {
                Err(_) => true,
                Ok(val) => val.as_bool().unwrap_or(true),
            };

            let pos = Isometry::from_parts(shapePos.0.into(), shapeRot.0);
            self.0.intersections_with_shape(
                &bodies.0,
                &colliders.0,
                &pos,
                &*shape.0,
                query_filter,
                rcallback,
            )
        })
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
        let aabb = Aabb::new(center - aabbHalfExtents.0, center + aabbHalfExtents.0);

        self.0
            .colliders_with_aabb_intersecting_aabb(&aabb, rcallback)
    }
}
