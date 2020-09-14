//! The physics pipeline elements.

use js_sys::Uint8Array;
use rapier::dynamics::{IntegrationParameters, JointSet, RigidBodyBuilder, RigidBodySet};
use rapier::geometry::{BroadPhase, ColliderSet, ContactEvent, NarrowPhase, ProximityEvent};
use rapier::math::Vector;
use rapier::pipeline::{ChannelEventCollector, PhysicsPipeline, QueryPipeline};
use wasm_bindgen::prelude::*;

use crate::dynamics::{Joint, JointDesc, RigidBody, RigidBodyDesc};
use crate::geometry::{Collider, Ray, RayIntersection};
use crossbeam_channel::Receiver;
use std::cell::RefCell;
use std::rc::Rc;

/// A structure responsible for collecting events generated
/// by the physics engine.
#[wasm_bindgen]
pub struct EventQueue {
    collector: ChannelEventCollector,
    contact_events: Receiver<ContactEvent>,
    proximity_events: Receiver<ProximityEvent>,
    auto_drain: bool,
}

#[wasm_bindgen]
/// The proximity state of a sensor collider and another collider.
pub enum Proximity {
    /// The sensor is intersecting the other collider.
    Intersecting = 0,
    /// The sensor is within tolerance margin of the other collider.
    WithinMargin = 1,
    /// The sensor is disjoint from the other collider.
    Disjoint = 2,
}

#[wasm_bindgen]
impl EventQueue {
    /// Creates a new event collector.
    ///
    /// # Parameters
    /// - `autoDrain`: setting this to `true` is strongly recommended. If true, the collector will
    /// be automatically drained before each `world.step(collector)`. If false, the collector will
    /// keep all events in memory unless it is manually drained/cleared; this may lead to unbounded use of
    /// RAM if no drain is performed.
    #[wasm_bindgen(constructor)]
    pub fn new(autoDrain: bool) -> Self {
        let contact_channel = crossbeam_channel::unbounded();
        let proximity_channel = crossbeam_channel::unbounded();
        let collector = ChannelEventCollector::new(proximity_channel.0, contact_channel.0);

        Self {
            collector,
            contact_events: contact_channel.1,
            proximity_events: proximity_channel.1,
            auto_drain: autoDrain,
        }
    }

    /// Applies the given javascript closure on each contact event of this collector, then clear
    /// the internal contact event buffer.
    ///
    /// # Parameters
    /// - `f(handle1, handle2, started)`:  JavaScript closure applied to each contact event. The
    /// closure should take three arguments: two integers representing the handles of the colliders
    /// involved in the contact, and a boolean indicating if the contact started (true) or stopped
    /// (false).
    pub fn drainContactEvents(&mut self, f: &js_sys::Function) {
        let this = JsValue::null();
        while let Ok(event) = self.contact_events.try_recv() {
            match event {
                ContactEvent::Started(co1, co2) => {
                    let h1 = co1.into_raw_parts().0 as u32;
                    let h2 = co2.into_raw_parts().0 as u32;
                    let _ = f.call3(
                        &this,
                        &JsValue::from(h1),
                        &JsValue::from(h2),
                        &JsValue::from_bool(true),
                    );
                }
                ContactEvent::Stopped(co1, co2) => {
                    let h1 = co1.into_raw_parts().0 as u32;
                    let h2 = co2.into_raw_parts().0 as u32;
                    let _ = f.call3(
                        &this,
                        &JsValue::from(h1),
                        &JsValue::from(h2),
                        &JsValue::from_bool(false),
                    );
                }
            }
        }
    }

    /// Applies the given javascript closure on each proximity event of this collector, then clear
    /// the internal proximity event buffer.
    ///
    /// # Parameters
    /// - `f(handle1, handle2, prev_prox, new_prox)`:  JavaScript closure applied to each proximity event. The
    /// closure should take four arguments: two integers representing the handles of the colliders
    /// involved in the proximity, and two `RAPIER.Proximity` enums representing the previous proximity
    /// status and the new proximity status.
    pub fn drainProximityEvents(&mut self, f: &js_sys::Function) {
        let this = JsValue::null();
        while let Ok(event) = self.proximity_events.try_recv() {
            let h1 = event.collider1.into_raw_parts().0 as u32;
            let h2 = event.collider2.into_raw_parts().0 as u32;
            let prev_status = event.prev_status as u32;
            let new_status = event.new_status as u32;

            let _ = f
                .bind2(&this, &JsValue::from(h1), &JsValue::from(h2))
                .call2(
                    &this,
                    &JsValue::from(prev_status),
                    &JsValue::from(new_status),
                );
        }
    }

    /// Removes all events contained by this collector.
    pub fn clear(&self) {
        while let Ok(_) = self.contact_events.try_recv() {}
        while let Ok(_) = self.proximity_events.try_recv() {}
    }
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
/// The physics world.
///
/// This contains all the data-structures necessary for creating and simulating
/// bodies with contacts, joints, and external forces.
pub struct World {
    gravity: Vector<f32>,
    integration_parameters: IntegrationParameters,
    broad_phase: BroadPhase,
    narrow_phase: NarrowPhase,
    bodies: Rc<RefCell<RigidBodySet>>,
    colliders: Rc<RefCell<ColliderSet>>,
    joints: Rc<RefCell<JointSet>>,
    #[serde(skip)]
    pipeline: PhysicsPipeline,
    #[serde(skip)]
    query_pipeline: QueryPipeline,
}

#[wasm_bindgen]
impl World {
    #[cfg(feature = "dim2")]
    #[wasm_bindgen(constructor)]
    /// Creates a new physics World with the given initial gravity affecting all rigid bodies with
    /// non-zero mass.
    ///
    /// # Arguments
    ///
    /// - `gravity_x` − The `x` component of the gravity.
    /// - `gravity_y` − The `y` component of the gravity.
    pub fn new(gravity_x: f32, gravity_y: f32) -> Self {
        let gravity = Vector::new(gravity_x, gravity_y);
        Self {
            gravity,
            integration_parameters: IntegrationParameters::default(),
            broad_phase: BroadPhase::new(),
            narrow_phase: NarrowPhase::new(),
            bodies: Rc::new(RefCell::new(RigidBodySet::new())),
            colliders: Rc::new(RefCell::new(ColliderSet::new())),
            joints: Rc::new(RefCell::new(JointSet::new())),
            pipeline: PhysicsPipeline::new(),
            query_pipeline: QueryPipeline::new(),
        }
    }

    /// Creates a new physics World with the given initial gravity affecting all rigid bodies with
    /// non-zero mass.
    ///
    /// # Arguments
    ///
    /// - `gravity_x` − The `x` component of the gravity.
    /// - `gravity_y` − The `y` component of the gravity.
    /// - `gravity_z` − The `z` component of the gravity.
    #[cfg(feature = "dim3")]
    #[wasm_bindgen(constructor)]
    pub fn new(gravity_x: f32, gravity_y: f32, gravity_z: f32) -> World {
        let gravity = Vector::new(gravity_x, gravity_y, gravity_z);
        Self {
            gravity,
            integration_parameters: IntegrationParameters::default(),
            broad_phase: BroadPhase::new(),
            narrow_phase: NarrowPhase::new(),
            bodies: Rc::new(RefCell::new(RigidBodySet::new())),
            colliders: Rc::new(RefCell::new(ColliderSet::new())),
            joints: Rc::new(RefCell::new(JointSet::new())),
            pipeline: PhysicsPipeline::new(),
            query_pipeline: QueryPipeline::new(),
        }
    }

    /// Takes a snapshot of this world.
    ///
    /// Use `World.restoreSnapshot` to create a new physics world with a state identical to
    /// the state when `.takeSnapshot()` is called.
    pub fn takeSnapshot(&self) -> Option<Uint8Array> {
        let snap = bincode::serialize(self).ok()?;
        Some(Uint8Array::from(&snap[..]))
    }

    /// Creates a new physics world from a snapshot.
    ///
    /// This new physics world will be an identical copy of the snapshoted physics world.
    pub fn restoreSnapshot(data: Uint8Array) -> Option<World> {
        let data = data.to_vec();
        bincode::deserialize(&data).ok()
    }

    /// Advance the simulation by one time step.
    ///
    /// All events generated by the physics engine are ignored.
    ///
    /// # Parameters
    /// - `EventQueue`: (optional) structure responsible for collecting
    ///   events generated by the physics engine.
    pub fn step(&mut self) {
        self.pipeline.step(
            &self.gravity,
            &self.integration_parameters,
            &mut self.broad_phase,
            &mut self.narrow_phase,
            &mut *self.bodies.borrow_mut(),
            &mut *self.colliders.borrow_mut(),
            &mut *self.joints.borrow_mut(),
            &(),
        )
    }

    /// Advance the simulation by one time step and keep track of the simulation events.
    ///
    /// # Parameters
    /// - `EventQueue`: (optional) structure responsible for collecting
    ///   events generated by the physics engine.
    pub fn stepWithEvents(&mut self, eventQueue: &EventQueue) {
        if eventQueue.auto_drain {
            eventQueue.clear();
        }

        self.pipeline.step(
            &self.gravity,
            &self.integration_parameters,
            &mut self.broad_phase,
            &mut self.narrow_phase,
            &mut *self.bodies.borrow_mut(),
            &mut *self.colliders.borrow_mut(),
            &mut *self.joints.borrow_mut(),
            &eventQueue.collector,
        )
    }

    /// The current simulation timestep.
    #[wasm_bindgen(getter)]
    pub fn timestep(&self) -> f32 {
        self.integration_parameters.dt()
    }

    /// Sets the new simulation timestep.
    ///
    /// The simulation timestep governs by how much the physics state of the world will
    /// be integrated. A simulation timestep should:
    /// - be as small as possible. Typical values evolve around 0.016 (assuming the chosen unit is milliseconds,
    /// corresponds to the time between two frames of a game running at 60FPS).
    /// - not vary too much during the course of the simulation. A timestep with large variations may
    /// cause instabilities in the simulation.
    ///
    /// # Parameters
    /// - `timestep`: The timestep length, in milliseconds.
    #[wasm_bindgen(setter)]
    pub fn set_timestep(&mut self, timestep: f32) {
        self.integration_parameters.set_dt(timestep)
    }

    /// The maximum velocity iterations the velocity-based force constraint solver can make.
    #[wasm_bindgen(getter)]
    pub fn maxVelocityIterations(&self) -> usize {
        self.integration_parameters.max_velocity_iterations
    }

    /// The maximum position iterations the position-based constraint regularization solver can make.
    #[wasm_bindgen(getter)]
    pub fn maxPositionIterations(&self) -> usize {
        self.integration_parameters.max_position_iterations
    }

    /// Sets the maximum number of velocity iterations (default: 4).
    ///
    /// The greater this value is, the most rigid and realistic the physics simulation will be.
    /// However a greater number of iterations is more computationally intensive.
    ///
    /// # Parameters
    /// - `niter`: The new maximum number of velocity iterations.
    #[wasm_bindgen(setter)]
    pub fn set_maxVelocityIterations(&mut self, niter: usize) {
        self.integration_parameters.max_velocity_iterations = niter
    }

    /// Sets the maximum number of position iterations (default: 1).
    ///
    /// The greater this value is, the less penetrations will be visible after one timestep where
    /// the velocity solver did not converge entirely. Large values will degrade significantly
    /// the performance of the simulation.
    ///
    /// To increase realism of the simulation it is recommanded, more efficient, and more effecive,
    /// to increase the number of velocity iterations instead of this number of position iterations.
    ///
    /// # Parameters
    /// - `niter`: The new maximum number of position iterations.
    #[wasm_bindgen(setter)]
    pub fn set_maxPositionIterations(&mut self, niter: usize) {
        self.integration_parameters.max_position_iterations = niter
    }

    /// Creates a new rigid-body from the given rigd-body descriptior.
    ///
    /// # Parameters
    /// - `body`: the description of the rigid-body to create.
    pub fn createRigidBody(&mut self, body: &RigidBodyDesc) -> RigidBody {
        let builder: RigidBodyBuilder = (*body).into();
        let rb = builder.build();
        let bodies = self.bodies.clone();
        let colliders = self.colliders.clone();
        let handle = bodies.borrow_mut().insert(rb);
        RigidBody {
            bodies,
            colliders,
            handle,
        }
    }

    /// Creates a new joint from the given joint descriptior.
    ///
    /// # Parameters
    /// - `joint`: the description of the joint to create.
    /// - `parent1`: the first rigid-body attached to this joint.
    /// - `parent2`: the second rigid-body attached to this joint.
    pub fn createJoint(
        &mut self,
        joint: &JointDesc,
        parent1: &RigidBody,
        parent2: &RigidBody,
    ) -> Joint {
        let mut bodies = self.bodies.borrow_mut();
        let handle =
            self.joints
                .borrow_mut()
                .insert(&mut *bodies, parent1.handle, parent2.handle, joint.0);

        Joint {
            bodies: self.bodies.clone(),
            joints: self.joints.clone(),
            handle,
        }
    }

    /// Retrieves a rigid-body from its handle.
    ///
    /// # Parameters
    /// - `handle`: the integer handle of the rigid-body to retrieve.
    pub fn getRigidBody(&self, handle: usize) -> Option<RigidBody> {
        let bodies = self.bodies.borrow();
        let (_, handle_with_gen) = bodies.get_unknown_gen(handle)?;

        Some(RigidBody {
            bodies: self.bodies.clone(),
            colliders: self.colliders.clone(),
            handle: handle_with_gen,
        })
    }

    /// Retrieves a joint from its handle.
    ///
    /// # Parameters
    /// - `handle`: the integer handle of the rigid-body to retrieve.
    pub fn getJoint(&self, handle: usize) -> Option<Joint> {
        let joints = self.joints.borrow();
        let (_, handle_with_gen) = joints.get_unknown_gen(handle)?;

        Some(Joint {
            bodies: self.bodies.clone(),
            joints: self.joints.clone(),
            handle: handle_with_gen,
        })
    }

    /// Retrieves a collider from its handle.
    ///
    /// # Parameters
    /// - `handle`: the integer handle of the collider to retrieve.
    pub fn getCollider(&self, handle: usize) -> Option<Collider> {
        let colliders = self.colliders.borrow();
        let (_, handle_with_gen) = colliders.get_unknown_gen(handle)?;

        Some(Collider {
            bodies: self.bodies.clone(),
            colliders: self.colliders.clone(),
            handle: handle_with_gen,
        })
    }

    /// Removes the given collider from this physics world.
    ///
    /// The rigid-body this collider is attached to will be woken-up.
    ///
    /// # Parameters
    /// - `body`: the collider to remove.
    pub fn removeCollider(&mut self, collider: &Collider) {
        let mut bodies = self.bodies.borrow_mut();
        let mut colliders = self.colliders.borrow_mut();
        let _ = self.pipeline.remove_collider(
            collider.handle,
            &mut self.broad_phase,
            &mut self.narrow_phase,
            &mut *bodies,
            &mut *colliders,
        );
    }

    /// Removes the given rigid-body from this physics world.
    ///
    /// This will remove this rigid-body as well as all its attached colliders and joints.
    /// Every other bodies touching or attached by joints to this rigid-body will be woken-up.
    ///
    /// # Parameters
    /// - `body`: the rigid-body to remove.
    pub fn removeRigidBody(&mut self, body: &RigidBody) {
        let mut bodies = self.bodies.borrow_mut();
        let mut colliders = self.colliders.borrow_mut();
        let mut joints = self.joints.borrow_mut();
        let _ = self.pipeline.remove_rigid_body(
            body.handle,
            &mut self.broad_phase,
            &mut self.narrow_phase,
            &mut *bodies,
            &mut *colliders,
            &mut *joints,
        );
    }

    /// Applies the given JavaScript function to each collider managed by this physics world.
    ///
    /// # Parameters
    /// - `f(collider)`: the function to apply to each collider managed by this physics world. Called as `f(collider)`.
    pub fn forEachCollider(&self, f: &js_sys::Function) {
        let this = JsValue::null();
        for (handle, _) in self.colliders.borrow().iter() {
            let collider = Collider {
                bodies: self.bodies.clone(),
                colliders: self.colliders.clone(),
                handle,
            };
            let collider = JsValue::from(collider);
            let _ = f.call1(&this, &collider);
        }
    }

    /// Applies the given JavaScript function to each rigid-body managed by this physics world.
    ///
    /// # Parameters
    /// - `f(body)`: the function to apply to each rigid-body managed by this physics world. Called as `f(collider)`.
    pub fn forEachRigidBody(&self, f: &js_sys::Function) {
        let this = JsValue::null();
        for (handle, _) in self.bodies.borrow().iter() {
            let body = RigidBody {
                bodies: self.bodies.clone(),
                colliders: self.colliders.clone(),
                handle,
            };
            let body = JsValue::from(body);
            let _ = f.call1(&this, &body);
        }
    }

    /// Applies the given JavaScript function to the integer handle of each rigid-body managed by this physics world.
    ///
    /// # Parameters
    /// - `f(handle)`: the function to apply to the integer handle of each rigid-body managed by this physics world. Called as `f(collider)`.
    pub fn forEachRigidBodyHandle(&self, f: &js_sys::Function) {
        let this = JsValue::null();
        for (handle, _) in self.bodies.borrow().iter() {
            let _ = f.call1(&this, &JsValue::from(handle.into_raw_parts().0 as u32));
        }
    }

    /// Applies the given JavaScript function to each active rigid-body managed by this physics world.
    ///
    /// After a short time of inactivity, a rigid-body is automatically deactivated ("asleep") by
    /// the physics engine in order to save computational power. A sleeping rigid-body never moves
    /// unless it is moved manually by the user.
    ///
    /// # Parameters
    /// - `f`: the function to apply to each active rigid-body managed by this physics world. Called as `f(collider)`.
    pub fn forEachActiveRigidBody(&self, f: &js_sys::Function) {
        let this = JsValue::null();
        for (handle, _) in self.bodies.borrow().iter_active_dynamic() {
            let body = RigidBody {
                bodies: self.bodies.clone(),
                colliders: self.colliders.clone(),
                handle,
            };
            let body = JsValue::from(body);
            let _ = f.call1(&this, &body);
        }
    }

    /// Applies the given JavaScript function to the integer handle of each active rigid-body
    /// managed by this physics world.
    ///
    /// After a short time of inactivity, a rigid-body is automatically deactivated ("asleep") by
    /// the physics engine in order to save computational power. A sleeping rigid-body never moves
    /// unless it is moved manually by the user.
    ///
    /// # Parameters
    /// - `f(handle)`: the function to apply to the integer handle of each active rigid-body managed by this
    ///   physics world. Called as `f(collider)`.
    pub fn forEachActiveRigidBodyHandle(&self, f: &js_sys::Function) {
        let this = JsValue::null();
        for (handle, _) in self.bodies.borrow().iter_active_dynamic() {
            let _ = f.call1(&this, &JsValue::from(handle.into_raw_parts().0 as u32));
        }
    }

    /// Cast a ray against this physics world and return the first collider it hits.
    ///
    /// This returns null if no hit is found.
    ///
    /// # Parameter
    /// - `ray`: the ray to cast.
    /// - `max_toi`: the maximum time-of-impact that can be reported by this cast. This effectively
    ///   limits the length of the ray to `ray.dir.norm() * max_toi`. Use `f32::MAX` for an
    ///   unbounded ray.
    pub fn castRay(&self, ray: &Ray, maxToi: f32) -> Option<RayIntersection> {
        let colliders = self.colliders.borrow();
        let (collider, _, intersection) =
            self.query_pipeline.cast_ray(&*colliders, &ray.0, maxToi)?;
        Some(RayIntersection {
            collider,
            intersection,
        })
    }
}
