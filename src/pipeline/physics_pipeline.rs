use crate::dynamics::{
    RawCCDSolver, RawImpulseJointSet, RawIntegrationParameters, RawIslandManager,
    RawMultibodyJointSet, RawRigidBodySet,
};
use crate::geometry::{RawBroadPhase, RawColliderSet, RawNarrowPhase};
use crate::math::RawVector;
use crate::pipeline::{RawEventQueue, RawPhysicsHooks};
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
        joints: &mut RawImpulseJointSet,
        articulations: &mut RawMultibodyJointSet,
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
            &mut articulations.0,
            &mut ccd_solver.0,
            None,
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
        joints: &mut RawImpulseJointSet,
        articulations: &mut RawMultibodyJointSet,
        ccd_solver: &mut RawCCDSolver,
        eventQueue: &mut RawEventQueue,
        hookObject: js_sys::Object,
        hookFilterContactPair: js_sys::Function,
        hookFilterIntersectionPair: js_sys::Function,
    ) {
        if eventQueue.auto_drain {
            eventQueue.clear();
        }

        let hooks = RawPhysicsHooks {
            this: hookObject,
            filter_contact_pair: hookFilterContactPair,
            filter_intersection_pair: hookFilterIntersectionPair,
        };

        self.0.step(
            &gravity.0,
            &integrationParameters.0,
            &mut islands.0,
            &mut broadPhase.0,
            &mut narrowPhase.0,
            &mut bodies.0,
            &mut colliders.0,
            &mut joints.0,
            &mut articulations.0,
            &mut ccd_solver.0,
            None,
            &hooks,
            &eventQueue.collector,
        );
    }
}
