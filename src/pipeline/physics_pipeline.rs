use crate::dynamics::{RawIntegrationParameters, RawJointSet, RawRigidBodySet};
use crate::geometry::{RawBroadPhase, RawColliderSet, RawNarrowPhase};
use crate::rapier::pipeline::PhysicsPipeline;
use rapier::math::Vector;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawPhysicsPipeline(pub(crate) PhysicsPipeline);

#[wasm_bindgen]
impl RawPhysicsPipeline {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        RawPhysicsPipeline(PhysicsPipeline::new())
    }

    #[cfg(feature = "dim2")]
    pub fn step(
        &mut self,
        gravity_x: f32,
        gravity_y: f32,
        integration_parameters: &RawIntegrationParameters,
        broad_phase: &mut RawBroadPhase,
        narrow_phase: &mut RawNarrowPhase,
        bodies: &mut RawRigidBodySet,
        colliders: &mut RawColliderSet,
        joints: &mut RawJointSet,
    ) {
        let gravity = Vector::new(gravity_x, gravity_y);
        self.0.step(
            &gravity,
            &integration_parameters.0,
            &mut broad_phase.0,
            &mut narrow_phase.0,
            &mut bodies.0,
            &mut colliders.0,
            &mut joints.0,
            &(), // FIXME: events
        );
    }

    #[cfg(feature = "dim3")]
    pub fn step(
        &mut self,
        gravity_x: f32,
        gravity_y: f32,
        gravity_z: f32,
        integration_parameters: &RawIntegrationParameters,
        broad_phase: &mut RawBroadPhase,
        narrow_phase: &mut RawNarrowPhase,
        bodies: &mut RawRigidBodySet,
        colliders: &mut RawColliderSet,
        joints: &mut RawJointSet,
    ) {
        let gravity = Vector::new(gravity_x, gravity_y, gravity_z);
        self.0.step(
            &gravity,
            &integration_parameters.0,
            &mut broad_phase.0,
            &mut narrow_phase.0,
            &mut bodies.0,
            &mut colliders.0,
            &mut joints.0,
            &(), // FIXME: events
        );
    }

    pub fn remove_collider(
        &mut self,
        handle: usize,
        broad_phase: &mut RawBroadPhase,
        narrow_phase: &mut RawNarrowPhase,
        bodies: &mut RawRigidBodySet,
        colliders: &mut RawColliderSet,
    ) {
        if let Some((_, handle)) = bodies.0.get_unknown_gen(handle) {
            self.0.remove_collider(
                handle,
                &mut broad_phase.0,
                &mut narrow_phase.0,
                &mut bodies.0,
                &mut colliders.0,
            );
        }
    }
}
