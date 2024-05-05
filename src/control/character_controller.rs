use crate::dynamics::RawRigidBodySet;
use crate::geometry::RawColliderSet;
use crate::math::RawVector;
use crate::pipeline::RawQueryPipeline;
use crate::utils::{self, FlatHandle};
use na::{Isometry, Unit};
use rapier::control::{
    CharacterAutostep, CharacterCollision, CharacterLength, EffectiveCharacterMovement,
    KinematicCharacterController,
};
use rapier::geometry::{ColliderHandle, ShapeCastHit};
use rapier::math::{Point, Real, Vector};
use rapier::parry::query::ShapeCastStatus;
use rapier::pipeline::{QueryFilter, QueryFilterFlags};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawKinematicCharacterController {
    controller: KinematicCharacterController,
    result: EffectiveCharacterMovement,
    events: Vec<CharacterCollision>,
}

fn length_value(length: CharacterLength) -> Real {
    match length {
        CharacterLength::Absolute(val) => val,
        CharacterLength::Relative(val) => val,
    }
}
#[wasm_bindgen]
impl RawKinematicCharacterController {
    #[wasm_bindgen(constructor)]
    pub fn new(offset: Real) -> Self {
        let controller = KinematicCharacterController {
            offset: CharacterLength::Absolute(offset),
            autostep: None,
            snap_to_ground: None,
            ..KinematicCharacterController::default()
        };

        Self {
            controller,
            result: EffectiveCharacterMovement {
                translation: Vector::zeros(),
                grounded: false,
                is_sliding_down_slope: false,
            },
            events: vec![],
        }
    }

    pub fn up(&self) -> RawVector {
        self.controller.up.into_inner().into()
    }

    pub fn setUp(&mut self, vector: &RawVector) {
        self.controller.up = Unit::new_normalize(vector.0);
    }

    pub fn normalNudgeFactor(&self) -> Real {
        self.controller.normal_nudge_factor
    }

    pub fn setNormalNudgeFactor(&mut self, value: Real) {
        self.controller.normal_nudge_factor = value;
    }

    pub fn offset(&self) -> Real {
        length_value(self.controller.offset)
    }

    pub fn setOffset(&mut self, value: Real) {
        self.controller.offset = CharacterLength::Absolute(value);
    }

    pub fn slideEnabled(&self) -> bool {
        self.controller.slide
    }

    pub fn setSlideEnabled(&mut self, enabled: bool) {
        self.controller.slide = enabled
    }

    pub fn autostepMaxHeight(&self) -> Option<Real> {
        self.controller.autostep.map(|e| length_value(e.max_height))
    }

    pub fn autostepMinWidth(&self) -> Option<Real> {
        self.controller.autostep.map(|e| length_value(e.min_width))
    }

    pub fn autostepIncludesDynamicBodies(&self) -> Option<bool> {
        self.controller.autostep.map(|e| e.include_dynamic_bodies)
    }

    pub fn autostepEnabled(&self) -> bool {
        self.controller.autostep.is_some()
    }

    pub fn enableAutostep(&mut self, maxHeight: Real, minWidth: Real, includeDynamicBodies: bool) {
        self.controller.autostep = Some(CharacterAutostep {
            min_width: CharacterLength::Absolute(minWidth),
            max_height: CharacterLength::Absolute(maxHeight),
            include_dynamic_bodies: includeDynamicBodies,
        })
    }

    pub fn disableAutostep(&mut self) {
        self.controller.autostep = None;
    }

    pub fn maxSlopeClimbAngle(&self) -> Real {
        self.controller.max_slope_climb_angle
    }

    pub fn setMaxSlopeClimbAngle(&mut self, angle: Real) {
        self.controller.max_slope_climb_angle = angle;
    }

    pub fn minSlopeSlideAngle(&self) -> Real {
        self.controller.min_slope_slide_angle
    }

    pub fn setMinSlopeSlideAngle(&mut self, angle: Real) {
        self.controller.min_slope_slide_angle = angle
    }

    pub fn snapToGroundDistance(&self) -> Option<Real> {
        self.controller.snap_to_ground.map(length_value)
    }

    pub fn enableSnapToGround(&mut self, distance: Real) {
        self.controller.snap_to_ground = Some(CharacterLength::Absolute(distance));
    }

    pub fn disableSnapToGround(&mut self) {
        self.controller.snap_to_ground = None;
    }

    pub fn snapToGroundEnabled(&self) -> bool {
        self.controller.snap_to_ground.is_some()
    }

    pub fn computeColliderMovement(
        &mut self,
        dt: Real,
        bodies: &mut RawRigidBodySet,
        colliders: &RawColliderSet,
        queries: &RawQueryPipeline,
        collider_handle: FlatHandle,
        desired_translation_delta: &RawVector,
        apply_impulses_to_dynamic_bodies: bool,
        character_mass: Option<Real>,
        filter_flags: u32,
        filter_groups: Option<u32>,
        filter_predicate: &js_sys::Function,
    ) {
        let handle = crate::utils::collider_handle(collider_handle);
        if let Some(collider) = colliders.0.get(handle) {
            crate::utils::with_filter(filter_predicate, |predicate| {
                let query_filter = QueryFilter {
                    flags: QueryFilterFlags::from_bits(filter_flags)
                        .unwrap_or(QueryFilterFlags::empty()),
                    groups: filter_groups.map(crate::geometry::unpack_interaction_groups),
                    exclude_collider: Some(handle),
                    exclude_rigid_body: collider.parent(),
                    predicate,
                };

                self.events.clear();
                let events = &mut self.events;
                self.result = self.controller.move_shape(
                    dt,
                    &bodies.0,
                    &colliders.0,
                    &queries.0,
                    collider.shape(),
                    collider.position(),
                    desired_translation_delta.0,
                    query_filter,
                    |event| events.push(event),
                );

                if apply_impulses_to_dynamic_bodies {
                    let character_mass = character_mass
                        .or_else(|| {
                            collider
                                .parent()
                                .and_then(|h| bodies.0.get(h))
                                .map(|b| b.mass())
                        })
                        .unwrap_or(0.0);
                    for collision in &self.events {
                        self.controller.solve_character_collision_impulses(
                            dt,
                            &mut bodies.0,
                            &colliders.0,
                            &queries.0,
                            collider.shape(),
                            character_mass,
                            collision,
                            query_filter,
                        );
                    }
                }
            });
        } else {
            self.result.translation.fill(0.0);
        }
    }

    pub fn computedMovement(&self) -> RawVector {
        self.result.translation.into()
    }

    pub fn computedGrounded(&self) -> bool {
        self.result.grounded
    }

    pub fn numComputedCollisions(&self) -> usize {
        self.events.len()
    }

    pub fn computedCollision(&self, i: usize, collision: &mut RawCharacterCollision) -> bool {
        if let Some(coll) = self.events.get(i) {
            collision.0 = *coll;
        }

        i < self.events.len()
    }
}

#[wasm_bindgen]
pub struct RawCharacterCollision(CharacterCollision);

#[wasm_bindgen]
impl RawCharacterCollision {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self(CharacterCollision {
            handle: ColliderHandle::invalid(),
            character_pos: Isometry::identity(),
            translation_applied: Vector::zeros(),
            translation_remaining: Vector::zeros(),
            hit: ShapeCastHit {
                time_of_impact: 0.0,
                witness1: Point::origin(),
                witness2: Point::origin(),
                normal1: Vector::y_axis(),
                normal2: Vector::y_axis(),
                status: ShapeCastStatus::Failed,
            },
        })
    }

    pub fn handle(&self) -> FlatHandle {
        utils::flat_handle(self.0.handle.0)
    }

    pub fn translationDeltaApplied(&self) -> RawVector {
        self.0.translation_applied.into()
    }

    pub fn translationDeltaRemaining(&self) -> RawVector {
        self.0.translation_remaining.into()
    }

    pub fn toi(&self) -> Real {
        self.0.hit.time_of_impact
    }

    pub fn worldWitness1(&self) -> RawVector {
        self.0.hit.witness1.coords.into() // Already in world-space.
    }

    pub fn worldWitness2(&self) -> RawVector {
        (self.0.character_pos * self.0.hit.witness2).coords.into()
    }

    pub fn worldNormal1(&self) -> RawVector {
        self.0.hit.normal1.into_inner().into() // Already in world-space.
    }

    pub fn worldNormal2(&self) -> RawVector {
        (self.0.character_pos * self.0.hit.normal2.into_inner()).into()
    }
}
