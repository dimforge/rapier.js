use crate::dynamics::{
    RawCCDSolver, RawIntegrationParameters, RawIslandManager, RawJointSet, RawRigidBodySet,
};
use crate::geometry::{RawBroadPhase, RawColliderSet, RawNarrowPhase};
use crate::math::RawVector;
use crate::pipeline::RawEventQueue;
use crate::rapier::pipeline::PhysicsPipeline;
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
        islands: &mut RawIslandManager,
        broadPhase: &mut RawBroadPhase,
        narrowPhase: &mut RawNarrowPhase,
        bodies: &mut RawRigidBodySet,
        colliders: &mut RawColliderSet,
        joints: &mut RawJointSet,
        ccd_solver: &mut RawCCDSolver,
    ) {
        self.0.step(
            &gravity.0,
            &integrationParameters.0,
            &mut islands.0,
            &mut broadPhase.0,
            &mut narrowPhase.0,
            &mut bodies.0,
            &mut colliders.0,
            &mut joints.0,
            &mut ccd_solver.0,
            &(),
            &(),
        );
    }

    pub fn stepWithEvents(
        &mut self,
        gravity: &RawVector,
        integrationParameters: &RawIntegrationParameters,
        islands: &mut RawIslandManager,
        broadPhase: &mut RawBroadPhase,
        narrowPhase: &mut RawNarrowPhase,
        bodies: &mut RawRigidBodySet,
        colliders: &mut RawColliderSet,
        joints: &mut RawJointSet,
        ccd_solver: &mut RawCCDSolver,
        eventQueue: &mut RawEventQueue,
    ) {
        if eventQueue.auto_drain {
            eventQueue.clear();
        }

        self.0.step(
            &gravity.0,
            &integrationParameters.0,
            &mut islands.0,
            &mut broadPhase.0,
            &mut narrowPhase.0,
            &mut bodies.0,
            &mut colliders.0,
            &mut joints.0,
            &mut ccd_solver.0,
            &(),
            &eventQueue.collector,
        );
    }

    // TODO: BREAKING, remove this, and add the corresponding remove/maintain method to the sets
    // and narrow/broad phases.
    pub fn removeRigidBody(
        &mut self,
        handle: u32,
        islands: &mut RawIslandManager,
        bodies: &mut RawRigidBodySet,
        colliders: &mut RawColliderSet,
        joints: &mut RawJointSet,
    ) {
        if let Some((_, handle)) = bodies.0.get_unknown_gen(handle) {
            bodies
                .0
                .remove(handle, &mut islands.0, &mut colliders.0, &mut joints.0);
        }
    }

    // TODO: BREAKING, remove this, and add the corresponding remove/maintain method to the sets
    // and narrow/broad phases.
    pub fn removeCollider(
        &mut self,
        handle: u32,
        islands: &mut RawIslandManager,
        bodies: &mut RawRigidBodySet,
        colliders: &mut RawColliderSet,
    ) {
        if let Some((_, handle)) = colliders.0.get_unknown_gen(handle) {
            colliders
                .0
                .remove(handle, &mut islands.0, &mut bodies.0, true);
        }
    }
}
