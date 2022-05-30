use crate::geometry::shape::SharedShapeUtility;
use crate::geometry::{
    RawColliderSet, RawPointProjection, RawRayIntersection, RawShape, RawShapeColliderTOI,
    RawShapeContact, RawShapeTOI, RawShapeType,
};
use crate::math::{RawRotation, RawVector};
use crate::utils::{self, FlatHandle};
use rapier::geometry::{ActiveCollisionTypes, ShapeType};
use rapier::math::{Isometry, Point};
use rapier::parry::query;
use rapier::pipeline::{ActiveEvents, ActiveHooks};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
impl RawColliderSet {
    /// The world-space translation of this collider.
    pub fn coTranslation(&self, handle: FlatHandle) -> RawVector {
        self.map(handle, |co| co.position().translation.vector.into())
    }

    /// The world-space orientation of this collider.
    pub fn coRotation(&self, handle: FlatHandle) -> RawRotation {
        self.map(handle, |co| co.position().rotation.into())
    }

    /// Sets the translation of this collider.
    ///
    /// # Parameters
    /// - `x`: the world-space position of the collider along the `x` axis.
    /// - `y`: the world-space position of the collider along the `y` axis.
    /// - `z`: the world-space position of the collider along the `z` axis.
    /// - `wakeUp`: forces the collider to wake-up so it is properly affected by forces if it
    /// wasn't moving before modifying its position.
    #[cfg(feature = "dim3")]
    pub fn coSetTranslation(&mut self, handle: FlatHandle, x: f32, y: f32, z: f32) {
        self.map_mut(handle, |co| {
            co.set_translation(na::Vector3::new(x, y, z));
        })
    }

    /// Sets the translation of this collider.
    ///
    /// # Parameters
    /// - `x`: the world-space position of the collider along the `x` axis.
    /// - `y`: the world-space position of the collider along the `y` axis.
    /// - `wakeUp`: forces the collider to wake-up so it is properly affected by forces if it
    /// wasn't moving before modifying its position.
    #[cfg(feature = "dim2")]
    pub fn coSetTranslation(&mut self, handle: FlatHandle, x: f32, y: f32) {
        self.map_mut(handle, |co| {
            co.set_translation(na::Vector2::new(x, y));
        })
    }

    #[cfg(feature = "dim3")]
    pub fn coSetTranslationWrtParent(&mut self, handle: FlatHandle, x: f32, y: f32, z: f32) {
        self.map_mut(handle, |co| {
            co.set_translation_wrt_parent(na::Vector3::new(x, y, z));
        })
    }

    #[cfg(feature = "dim2")]
    pub fn coSetTranslationWrtParent(&mut self, handle: FlatHandle, x: f32, y: f32) {
        self.map_mut(handle, |co| {
            co.set_translation_wrt_parent(na::Vector2::new(x, y));
        })
    }

    /// Sets the rotation quaternion of this collider.
    ///
    /// This does nothing if a zero quaternion is provided.
    ///
    /// # Parameters
    /// - `x`: the first vector component of the quaternion.
    /// - `y`: the second vector component of the quaternion.
    /// - `z`: the third vector component of the quaternion.
    /// - `w`: the scalar component of the quaternion.
    /// - `wakeUp`: forces the collider to wake-up so it is properly affected by forces if it
    /// wasn't moving before modifying its position.
    #[cfg(feature = "dim3")]
    pub fn coSetRotation(&mut self, handle: FlatHandle, x: f32, y: f32, z: f32, w: f32) {
        if let Some(q) = na::Unit::try_new(na::Quaternion::new(w, x, y, z), 0.0) {
            self.map_mut(handle, |co| co.set_rotation(q.scaled_axis()))
        }
    }

    /// Sets the rotation angle of this collider.
    ///
    /// # Parameters
    /// - `angle`: the rotation angle, in radians.
    /// - `wakeUp`: forces the collider to wake-up so it is properly affected by forces if it
    /// wasn't moving before modifying its position.
    #[cfg(feature = "dim2")]
    pub fn coSetRotation(&mut self, handle: FlatHandle, angle: f32) {
        self.map_mut(handle, |co| co.set_rotation(angle))
    }

    #[cfg(feature = "dim3")]
    pub fn coSetRotationWrtParent(&mut self, handle: FlatHandle, x: f32, y: f32, z: f32, w: f32) {
        if let Some(q) = na::Unit::try_new(na::Quaternion::new(w, x, y, z), 0.0) {
            self.map_mut(handle, |co| co.set_rotation_wrt_parent(q.scaled_axis()))
        }
    }

    #[cfg(feature = "dim2")]
    pub fn coSetRotationWrtParent(&mut self, handle: FlatHandle, angle: f32) {
        self.map_mut(handle, |co| co.set_rotation_wrt_parent(angle))
    }

    /// Is this collider a sensor?
    pub fn coIsSensor(&self, handle: FlatHandle) -> bool {
        self.map(handle, |co| co.is_sensor())
    }

    /// The type of the shape of this collider.
    pub fn coShapeType(&self, handle: FlatHandle) -> RawShapeType {
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
    pub fn coHalfExtents(&self, handle: FlatHandle) -> Option<RawVector> {
        self.map(handle, |co| {
            co.shape()
                .as_cuboid()
                .map(|c| c.half_extents.into())
                .or_else(|| {
                    co.shape()
                        .as_round_cuboid()
                        .map(|c| c.inner_shape.half_extents.into())
                })
        })
    }

    /// The radius of this collider if it is a ball, capsule, cylinder, or cone shape.
    pub fn coRadius(&self, handle: FlatHandle) -> Option<f32> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::Ball => co.shape().as_ball().map(|b| b.radius),
            ShapeType::Capsule => co.shape().as_capsule().map(|b| b.radius),
            #[cfg(feature = "dim3")]
            ShapeType::Cylinder => co.shape().as_cylinder().map(|b| b.radius),
            #[cfg(feature = "dim3")]
            ShapeType::RoundCylinder => {
                co.shape().as_round_cylinder().map(|b| b.inner_shape.radius)
            }
            #[cfg(feature = "dim3")]
            ShapeType::Cone => co.shape().as_cone().map(|b| b.radius),
            _ => None,
        })
    }

    /// The radius of this collider if it is a capsule, cylinder, or cone shape.
    pub fn coHalfHeight(&self, handle: FlatHandle) -> Option<f32> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::Capsule => co.shape().as_capsule().map(|b| b.half_height()),
            #[cfg(feature = "dim3")]
            ShapeType::Cylinder => co.shape().as_cylinder().map(|b| b.half_height),
            #[cfg(feature = "dim3")]
            ShapeType::RoundCylinder => co
                .shape()
                .as_round_cylinder()
                .map(|b| b.inner_shape.half_height),
            #[cfg(feature = "dim3")]
            ShapeType::Cone => co.shape().as_cone().map(|b| b.half_height),
            _ => None,
        })
    }

    /// The radius of the round edges of this collider.
    pub fn coRoundRadius(&self, handle: FlatHandle) -> Option<f32> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::RoundCuboid => co.shape().as_round_cuboid().map(|b| b.border_radius),
            ShapeType::RoundTriangle => co.shape().as_round_triangle().map(|b| b.border_radius),
            #[cfg(feature = "dim3")]
            ShapeType::RoundCylinder => co.shape().as_round_cylinder().map(|b| b.border_radius),
            #[cfg(feature = "dim3")]
            ShapeType::RoundCone => co.shape().as_round_cone().map(|b| b.border_radius),
            #[cfg(feature = "dim3")]
            ShapeType::RoundConvexPolyhedron => co
                .shape()
                .as_round_convex_polyhedron()
                .map(|b| b.border_radius),
            #[cfg(feature = "dim2")]
            ShapeType::RoundConvexPolygon => co
                .shape()
                .as_round_convex_polygon()
                .map(|b| b.border_radius),
            _ => None,
        })
    }

    /// The vertices of this triangle mesh, polyline, convex polyhedron, segment, triangle or convex polyhedron, if it is one.
    pub fn coVertices(&self, handle: FlatHandle) -> Option<Vec<f32>> {
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
                .map(|p| flatten(p.inner_shape.points())),
            #[cfg(feature = "dim2")]
            ShapeType::ConvexPolygon => co.shape().as_convex_polygon().map(|p| flatten(p.points())),
            #[cfg(feature = "dim2")]
            ShapeType::RoundConvexPolygon => co
                .shape()
                .as_round_convex_polygon()
                .map(|p| flatten(p.inner_shape.points())),
            ShapeType::Segment => co.shape().as_segment().map(|s| flatten(&[s.a, s.b])),
            ShapeType::RoundTriangle => co
                .shape()
                .as_round_triangle()
                .map(|t| flatten(&[t.inner_shape.a, t.inner_shape.b, t.inner_shape.c])),
            ShapeType::Triangle => co.shape().as_triangle().map(|t| flatten(&[t.a, t.b, t.c])),
            _ => None,
        })
    }

    /// The indices of this triangle mesh, polyline, or convex polyhedron, if it is one.
    pub fn coIndices(&self, handle: FlatHandle) -> Option<Vec<u32>> {
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
                p.inner_shape
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
    pub fn coHeightfieldHeights(&self, handle: FlatHandle) -> Option<Vec<f32>> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::HeightField => co
                .shape()
                .as_heightfield()
                .map(|h| h.heights().as_slice().to_vec()),
            _ => None,
        })
    }

    /// The scaling factor applied of this heightfield if it is one.
    pub fn coHeightfieldScale(&self, handle: FlatHandle) -> Option<RawVector> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::HeightField => co.shape().as_heightfield().map(|h| RawVector(*h.scale())),
            _ => None,
        })
    }

    /// The number of rows on this heightfield's height matrix, if it is one.
    #[cfg(feature = "dim3")]
    pub fn coHeightfieldNRows(&self, handle: FlatHandle) -> Option<usize> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::HeightField => co.shape().as_heightfield().map(|h| h.nrows()),
            _ => None,
        })
    }

    /// The number of columns on this heightfield's height matrix, if it is one.
    #[cfg(feature = "dim3")]
    pub fn coHeightfieldNCols(&self, handle: FlatHandle) -> Option<usize> {
        self.map(handle, |co| match co.shape().shape_type() {
            ShapeType::HeightField => co.shape().as_heightfield().map(|h| h.ncols()),
            _ => None,
        })
    }

    /// The unique integer identifier of the collider this collider is attached to.
    pub fn coParent(&self, handle: FlatHandle) -> Option<FlatHandle> {
        self.map(handle, |co| co.parent().map(|p| utils::flat_handle(p.0)))
    }

    /// The friction coefficient of this collider.
    pub fn coFriction(&self, handle: FlatHandle) -> f32 {
        self.map(handle, |co| co.material().friction)
    }
    /// The restitution coefficient of this collider.
    pub fn coRestitution(&self, handle: FlatHandle) -> f32 {
        self.map(handle, |co| co.material().restitution)
    }

    /// The density of this collider.
    pub fn coDensity(&self, handle: FlatHandle) -> Option<f32> {
        self.map(handle, |co| co.density())
    }

    /// The collision groups of this collider.
    pub fn coCollisionGroups(&self, handle: FlatHandle) -> u32 {
        self.map(handle, |co| {
            super::pack_interaction_groups(co.collision_groups())
        })
    }

    /// The solver groups of this collider.
    pub fn coSolverGroups(&self, handle: FlatHandle) -> u32 {
        self.map(handle, |co| {
            super::pack_interaction_groups(co.solver_groups())
        })
    }

    /// The physics hooks enabled for this collider.
    pub fn coActiveHooks(&self, handle: FlatHandle) -> u32 {
        self.map(handle, |co| co.active_hooks().bits())
    }

    /// The collision types enabled for this collider.
    pub fn coActiveCollisionTypes(&self, handle: FlatHandle) -> u16 {
        self.map(handle, |co| co.active_collision_types().bits())
    }

    /// The events enabled for this collider.
    pub fn coActiveEvents(&self, handle: FlatHandle) -> u32 {
        self.map(handle, |co| co.active_events().bits())
    }

    pub fn coContainsPoint(&self, handle: FlatHandle, point: &RawVector) -> bool {
        self.map(handle, |co| {
            co.shared_shape()
                .containsPoint(co.position(), &point.0.into())
        })
    }

    pub fn coCastShape(
        &self,
        handle: FlatHandle,
        colliderVel: &RawVector,
        shape2: &RawShape,
        shape2Pos: &RawVector,
        shape2Rot: &RawRotation,
        shape2Vel: &RawVector,
        maxToi: f32,
    ) -> Option<RawShapeTOI> {
        let pos2 = Isometry::from_parts(shape2Pos.0.into(), shape2Rot.0);

        self.map(handle, |co| {
            let pos1 = co.position();
            co.shared_shape().castShape(
                pos1,
                &colliderVel.0.into(),
                &*shape2.0,
                &pos2,
                &shape2Vel.0.into(),
                maxToi,
            )
        })
    }

    pub fn coCastCollider(
        &self,
        handle: FlatHandle,
        collider1Vel: &RawVector,
        collider2handle: FlatHandle,
        collider2Vel: &RawVector,
        max_toi: f32,
    ) -> Option<RawShapeColliderTOI> {
        let handle2 = utils::collider_handle(collider2handle);
        let co2 = self
            .0
            .get(handle2)
            .expect("Invalid Collider reference. It may have been removed from the physics World.");

        self.map(handle, |co| {
            query::time_of_impact(
                co.position(),
                &collider1Vel.0,
                co.shape(),
                co2.position(),
                &collider2Vel.0,
                co2.shape(),
                max_toi,
            )
            .unwrap_or(None)
            .map_or(None, |toi| {
                Some(RawShapeColliderTOI {
                    handle: handle2,
                    toi,
                })
            })
        })
    }

    pub fn coIntersectsShape(
        &self,
        handle: FlatHandle,
        shape2: &RawShape,
        shapePos2: &RawVector,
        shapeRot2: &RawRotation,
    ) -> bool {
        let pos2 = Isometry::from_parts(shapePos2.0.into(), shapeRot2.0);

        self.map(handle, |co| {
            co.shared_shape()
                .intersectsShape(co.position(), &*shape2.0, &pos2)
        })
    }

    pub fn coContactShape(
        &self,
        handle: FlatHandle,
        shape2: &RawShape,
        shapePos2: &RawVector,
        shapeRot2: &RawRotation,
        prediction: f32,
    ) -> Option<RawShapeContact> {
        let pos2 = Isometry::from_parts(shapePos2.0.into(), shapeRot2.0);

        self.map(handle, |co| {
            co.shared_shape()
                .contactShape(co.position(), &*shape2.0, &pos2, prediction)
        })
    }

    pub fn coContactCollider(
        &self,
        handle: FlatHandle,
        collider2handle: FlatHandle,
        prediction: f32,
    ) -> Option<RawShapeContact> {
        let co2 = self
            .0
            .get(utils::collider_handle(collider2handle))
            .expect("Invalid Collider reference. It may have been removed from the physics World.");

        self.map(handle, |co| {
            query::contact(
                co.position(),
                co.shape(),
                &co2.position(),
                co2.shape(),
                prediction,
            )
            .ok()
            .flatten()
            .map(|contact| RawShapeContact { contact })
        })
    }

    pub fn coProjectPoint(
        &self,
        handle: FlatHandle,
        point: &RawVector,
        solid: bool,
    ) -> RawPointProjection {
        self.map(handle, |co| {
            co.shared_shape()
                .projectPoint(co.position(), &point.0.into(), solid)
        })
    }

    pub fn coIntersectsRay(
        &self,
        handle: FlatHandle,
        rayOrig: &RawVector,
        rayDir: &RawVector,
        maxToi: f32,
    ) -> bool {
        self.map(handle, |co| {
            co.shared_shape().intersectsRay(
                co.position(),
                rayOrig.0.into(),
                rayDir.0.into(),
                maxToi,
            )
        })
    }

    pub fn coCastRay(
        &self,
        handle: FlatHandle,
        rayOrig: &RawVector,
        rayDir: &RawVector,
        maxToi: f32,
        solid: bool,
    ) -> f32 {
        self.map(handle, |co| {
            co.shared_shape().castRay(
                co.position(),
                rayOrig.0.into(),
                rayDir.0.into(),
                maxToi,
                solid,
            )
        })
    }

    pub fn coCastRayAndGetNormal(
        &self,
        handle: FlatHandle,
        rayOrig: &RawVector,
        rayDir: &RawVector,
        maxToi: f32,
        solid: bool,
    ) -> Option<RawRayIntersection> {
        self.map(handle, |co| {
            co.shared_shape().castRayAndGetNormal(
                co.position(),
                rayOrig.0.into(),
                rayDir.0.into(),
                maxToi,
                solid,
            )
        })
    }

    pub fn coSetSensor(&mut self, handle: FlatHandle, is_sensor: bool) {
        self.map_mut(handle, |co| co.set_sensor(is_sensor))
    }

    pub fn coSetRestitution(&mut self, handle: FlatHandle, restitution: f32) {
        self.map_mut(handle, |co| co.set_restitution(restitution))
    }

    pub fn coSetFriction(&mut self, handle: FlatHandle, friction: f32) {
        self.map_mut(handle, |co| co.set_friction(friction))
    }

    pub fn coFrictionCombineRule(&self, handle: FlatHandle) -> u32 {
        self.map(handle, |co| co.friction_combine_rule() as u32)
    }

    pub fn coSetFrictionCombineRule(&mut self, handle: FlatHandle, rule: u32) {
        let rule = super::combine_rule_from_u32(rule);
        self.map_mut(handle, |co| co.set_friction_combine_rule(rule))
    }

    pub fn coRestitutionCombineRule(&self, handle: FlatHandle) -> u32 {
        self.map(handle, |co| co.restitution_combine_rule() as u32)
    }

    pub fn coSetRestitutionCombineRule(&mut self, handle: FlatHandle, rule: u32) {
        let rule = super::combine_rule_from_u32(rule);
        self.map_mut(handle, |co| co.set_restitution_combine_rule(rule))
    }

    pub fn coSetCollisionGroups(&mut self, handle: FlatHandle, groups: u32) {
        let groups = super::unpack_interaction_groups(groups);
        self.map_mut(handle, |co| co.set_collision_groups(groups))
    }

    pub fn coSetSolverGroups(&mut self, handle: FlatHandle, groups: u32) {
        let groups = super::unpack_interaction_groups(groups);
        self.map_mut(handle, |co| co.set_solver_groups(groups))
    }

    pub fn coSetActiveHooks(&mut self, handle: FlatHandle, hooks: u32) {
        let hooks = ActiveHooks::from_bits(hooks).unwrap_or(ActiveHooks::empty());
        self.map_mut(handle, |co| co.set_active_hooks(hooks));
    }

    pub fn coSetActiveEvents(&mut self, handle: FlatHandle, events: u32) {
        let events = ActiveEvents::from_bits(events).unwrap_or(ActiveEvents::empty());
        self.map_mut(handle, |co| co.set_active_events(events))
    }

    pub fn coSetActiveCollisionTypes(&mut self, handle: FlatHandle, types: u16) {
        let types = ActiveCollisionTypes::from_bits(types).unwrap_or(ActiveCollisionTypes::empty());
        self.map_mut(handle, |co| co.set_active_collision_types(types));
    }

    pub fn coSetShape(&mut self, handle: FlatHandle, shape: &RawShape) {
        self.map_mut(handle, |co| co.set_shape(shape.0.clone()));
    }
}
