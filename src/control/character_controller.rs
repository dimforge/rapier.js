use crate::dynamics::RawRigidBodySet;
use crate::geometry::RawColliderSet;
use crate::math::RawVector;
use crate::pipeline::RawQueryPipeline;
use crate::utils::FlatHandle;
use na::Unit;
use rapier::control::{
    CharacterAutostep, CharacterLength, EffectiveCharacterMovement, KinematicCharacterController,
};
use rapier::geometry::{Collider, ColliderHandle};
use rapier::math::{Real, Vector};
use rapier::pipeline::{QueryFilter, QueryFilterFlags};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawEffectiveCharacterMovement(pub(crate) EffectiveCharacterMovement);

#[wasm_bindgen]
impl RawEffectiveCharacterMovement {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self(EffectiveCharacterMovement {
            translation: Vector::zeros(),
            grounded: false,
        })
    }
    pub fn translation(&self) -> RawVector {
        RawVector(self.0.translation)
    }

    pub fn grounded(&self) -> bool {
        self.0.grounded
    }
}

#[wasm_bindgen]
pub struct RawKinematicCharacterController(pub(crate) KinematicCharacterController);

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
        Self(KinematicCharacterController {
            offset: CharacterLength::Absolute(offset),
            autostep: None,
            snap_to_ground: None,
            ..KinematicCharacterController::default()
        })
    }

    pub fn up(&self) -> RawVector {
        self.0.up.into_inner().into()
    }

    pub fn setUp(&mut self, vector: &RawVector) {
        self.0.up = Unit::new_normalize(vector.0);
    }

    pub fn offset(&self) -> Real {
        length_value(self.0.offset)
    }

    pub fn setOffset(&mut self, value: Real) {
        self.0.offset = CharacterLength::Absolute(value);
    }

    pub fn slideEnabled(&self) -> bool {
        self.0.slide
    }

    pub fn setSlideEnabled(&mut self, enabled: bool) {
        self.0.slide = enabled
    }

    pub fn autostepMaxHeight(&self) -> Option<Real> {
        self.0.autostep.map(|e| length_value(e.max_height))
    }

    pub fn autostepMinWidth(&self) -> Option<Real> {
        self.0.autostep.map(|e| length_value(e.min_width))
    }

    pub fn autostepIncludesDynamicBodies(&self) -> Option<bool> {
        self.0.autostep.map(|e| e.include_dynamic_bodies)
    }

    pub fn autostepEnabled(&self) -> bool {
        self.0.autostep.is_some()
    }

    pub fn enableAutostep(&mut self, maxHeight: Real, minWidth: Real, includeDynamicBodies: bool) {
        self.0.autostep = Some(CharacterAutostep {
            min_width: CharacterLength::Absolute(minWidth),
            max_height: CharacterLength::Absolute(maxHeight),
            include_dynamic_bodies: includeDynamicBodies,
        })
    }

    pub fn disableAutostep(&mut self) {
        self.0.autostep = None;
    }

    pub fn maxSlopeClimbAngle(&self) -> Real {
        self.0.max_slope_climb_angle
    }

    pub fn setMaxSlopeClimbAngle(&mut self, angle: Real) {
        self.0.max_slope_climb_angle = angle;
    }

    pub fn minSlopeSlideAngle(&self) -> Real {
        self.0.min_slope_slide_angle
    }

    pub fn setMinSlopeSlideAngle(&mut self, angle: Real) {
        self.0.min_slope_slide_angle = angle
    }

    pub fn snapToGroundDistance(&self) -> Option<Real> {
        self.0.snap_to_ground.map(length_value)
    }

    pub fn enableSnapToGround(&mut self, distance: Real) {
        self.0.snap_to_ground = Some(CharacterLength::Absolute(distance));
    }

    pub fn disableSnapToGround(&mut self) {
        self.0.snap_to_ground = None;
    }

    pub fn snapToGroundEnabled(&self) -> bool {
        self.0.snap_to_ground.is_some()
    }

    pub fn computeColliderMovement(
        &self,
        dt: Real,
        bodies: &RawRigidBodySet,
        colliders: &RawColliderSet,
        queries: &RawQueryPipeline,
        collider_handle: FlatHandle,
        desired_translation: &RawVector,
        filter_flags: u32,
        filter_groups: Option<u32>,
        filter_predicate: &js_sys::Function,
        // mut events: impl FnMut(CharacterCollision),
        out: &mut RawEffectiveCharacterMovement,
    ) {
        let handle = crate::utils::collider_handle(collider_handle);
        if let Some(collider) = colliders.0.get(handle) {
            let predicate = crate::utils::wrap_filter(filter_predicate);
            let predicate = predicate
                .as_ref()
                .map(|f| f as &dyn Fn(ColliderHandle, &Collider) -> bool);
            let query_filter = QueryFilter {
                flags: QueryFilterFlags::from_bits(filter_flags)
                    .unwrap_or(QueryFilterFlags::empty()),
                groups: filter_groups.map(crate::geometry::unpack_interaction_groups),
                exclude_collider: Some(handle),
                exclude_rigid_body: collider.parent(),
                predicate,
            };

            out.0 = self.0.move_shape(
                dt,
                &bodies.0,
                &colliders.0,
                &queries.0,
                collider.shape(),
                collider.position(),
                desired_translation.0,
                query_filter,
                |_| {},
            );
        } else {
            out.0.translation.fill(0.0);
        }
    }
}
