use crate::dynamics::{RawIntegrationParameters, RawJointSet, RawRigidBodySet};
use crate::geometry::{RawBroadPhase, RawColliderSet, RawNarrowPhase};
use crate::math::RawVector;
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

    pub fn step(
        &mut self,
        gravity: &RawVector,
        integrationParameters: &RawIntegrationParameters,
        broadPhase: &mut RawBroadPhase,
        narrowPhase: &mut RawNarrowPhase,
        bodies: &mut RawRigidBodySet,
        colliders: &mut RawColliderSet,
        joints: &mut RawJointSet,
    ) {
        self.0.step(
            &gravity.0,
            &integrationParameters.0,
            &mut broadPhase.0,
            &mut narrowPhase.0,
            &mut bodies.0,
            &mut colliders.0,
            &mut joints.0,
            &(), // FIXME: events
        );
    }

    pub fn removeRigidBody(
        &mut self,
        handle: usize,
        broadPhase: &mut RawBroadPhase,
        narrowPhase: &mut RawNarrowPhase,
        bodies: &mut RawRigidBodySet,
        colliders: &mut RawColliderSet,
        joints: &mut RawJointSet,
    ) {
        if let Some((_, handle)) = bodies.0.get_unknown_gen(handle) {
            self.0.remove_rigid_body(
                handle,
                &mut broadPhase.0,
                &mut narrowPhase.0,
                &mut bodies.0,
                &mut colliders.0,
                &mut joints.0,
            );
        }
    }

    pub fn removeCollider(
        &mut self,
        handle: usize,
        broadPhase: &mut RawBroadPhase,
        narrowPhase: &mut RawNarrowPhase,
        bodies: &mut RawRigidBodySet,
        colliders: &mut RawColliderSet,
    ) {
        if let Some((_, handle)) = colliders.0.get_unknown_gen(handle) {
            self.0.remove_collider(
                handle,
                &mut broadPhase.0,
                &mut narrowPhase.0,
                &mut bodies.0,
                &mut colliders.0,
            );
        }
    }
}
