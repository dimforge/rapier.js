//! The physics pipeline elements.

use js_sys::Uint8Array;
use rapier::dynamics::{JointSet, RigidBodyBuilder, RigidBodySet};
use rapier::geometry::ColliderSet;
use rapier::math::Vector;
use rapier::world::World as RWorld;
use wasm_bindgen::prelude::*;

use crate::dynamic::{Joint, JointDesc, RigidBody, RigidBodyDesc};
use crate::geometry::Collider;
use std::cell::RefCell;
use std::rc::Rc;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
/// The physics world.
///
/// This contains all the data-structures necessary for creating and simulating
/// bodies with contacts, joints, and external forces.
pub struct World {
    world: RWorld,
    bodies: Rc<RefCell<RigidBodySet>>,
    colliders: Rc<RefCell<ColliderSet>>,
    joints: Rc<RefCell<JointSet>>,
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
        let world = RWorld::new(Vector::new(gravity_x, gravity_y));
        Self {
            world,
            bodies: Rc::new(RefCell::new(RigidBodySet::new())),
            colliders: Rc::new(RefCell::new(ColliderSet::new())),
            joints: Rc::new(RefCell::new(JointSet::new())),
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
        let world = RWorld::new(Vector::new(gravity_x, gravity_y, gravity_z));
        Self {
            world,
            bodies: Rc::new(RefCell::new(RigidBodySet::new())),
            colliders: Rc::new(RefCell::new(ColliderSet::new())),
            joints: Rc::new(RefCell::new(JointSet::new())),
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
    pub fn step(&mut self) {
        self.world.step(
            &mut *self.bodies.borrow_mut(),
            &mut *self.colliders.borrow_mut(),
            &mut *self.joints.borrow_mut(),
            &(),
        )
    }

    /// The current simulation timestep.
    #[wasm_bindgen(getter)]
    pub fn timestep(&self) -> f32 {
        self.world.integration_parameters.dt()
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
        self.world.integration_parameters.set_dt(timestep)
    }

    /// The maximum velocity iterations the velocity-based force constraint solver can make.
    #[wasm_bindgen(getter)]
    pub fn maxVelocityIterations(&self) -> usize {
        self.world.integration_parameters.max_velocity_iterations
    }

    /// The maximum position iterations the position-based constraint regularization solver can make.
    #[wasm_bindgen(getter)]
    pub fn maxPositionIterations(&self) -> usize {
        self.world.integration_parameters.max_position_iterations
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
        self.world.integration_parameters.max_velocity_iterations = niter
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
        self.world.integration_parameters.max_position_iterations = niter
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

    /// Removes the given rigid-body from this physics world.
    ///
    /// This will remove this rigid-body as wall as all its attached colliders and joints.
    /// Every other bodies touching or attached by joints to this rigid-body will be woken-up.
    ///
    /// # Parameters
    /// - `body`: the rigid-body to remove.
    pub fn removeRigidBody(&mut self, body: &RigidBody) {
        let mut bodies = self.bodies.borrow_mut();
        let mut colliders = self.colliders.borrow_mut();
        let mut joints = self.joints.borrow_mut();
        let _ = self.world.remove_rigid_body(body.handle, &mut *bodies, &mut *colliders, &mut *joints);
    }

    /// Applies the given JavaScript function to each collider managed by this physics world.
    ///
    /// # Parameters
    /// - `f`: the function to apply to each collider managed by this physics world. Called as `f(collider)`.
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
    /// - `f`: the function to apply to each rigid-body managed by this physics world. Called as `f(collider)`.
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
    /// - `f`: the function to apply to the integer handle of each rigid-body managed by this physics world. Called as `f(collider)`.
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
    /// - `f`: the function to apply to the integer handle of each active rigid-body managed by this
    ///   physics world. Called as `f(collider)`.
    pub fn forEachActiveRigidBodyHandle(&self, f: &js_sys::Function) {
        let this = JsValue::null();
        for (handle, _) in self.bodies.borrow().iter_active_dynamic() {
            let _ = f.call1(&this, &JsValue::from(handle.into_raw_parts().0 as u32));
        }
    }
}
