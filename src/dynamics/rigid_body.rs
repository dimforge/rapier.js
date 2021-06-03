use crate::dynamics::{RawRigidBodySet, RawRigidBodyType};
use crate::math::{RawRotation, RawVector};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
impl RawRigidBodySet {
    /// The world-space translation of this rigid-body.
    pub fn rbTranslation(&self, handle: u32) -> RawVector {
        self.map(handle, |rb| RawVector(rb.position().translation.vector))
    }

    /// The world-space orientation of this rigid-body.
    pub fn rbRotation(&self, handle: u32) -> RawRotation {
        self.map(handle, |rb| RawRotation(rb.position().rotation))
    }

    /// Put the given rigid-body to sleep.
    pub fn rbSleep(&mut self, handle: u32) {
        self.map_mut(handle, |rb| rb.sleep());
    }

    /// Is this rigid-body sleeping?
    pub fn rbIsSleeping(&self, handle: u32) -> bool {
        self.map(handle, |rb| rb.is_sleeping())
    }

    /// Is the velocity of this rigid-body not zero?
    pub fn rbIsMoving(&self, handle: u32) -> bool {
        self.map(handle, |rb| rb.is_moving())
    }

    /// The world-space predicted translation of this rigid-body.
    ///
    /// If this rigid-body is kinematic this value is set by the `setNextKinematicTranslation`
    /// method and is used for estimating the kinematic body velocity at the next timestep.
    /// For non-kinematic bodies, this value is currently unspecified.
    pub fn rbNextTranslation(&self, handle: u32) -> RawVector {
        self.map(handle, |rb| {
            RawVector(rb.next_position().translation.vector)
        })
    }

    /// The world-space predicted orientation of this rigid-body.
    ///
    /// If this rigid-body is kinematic this value is set by the `setNextKinematicRotation`
    /// method and is used for estimating the kinematic body velocity at the next timestep.
    /// For non-kinematic bodies, this value is currently unspecified.
    pub fn rbNextRotation(&self, handle: u32) -> RawRotation {
        self.map(handle, |rb| RawRotation(rb.next_position().rotation))
    }

    /// Sets the translation of this rigid-body.
    ///
    /// # Parameters
    /// - `x`: the world-space position of the rigid-body along the `x` axis.
    /// - `y`: the world-space position of the rigid-body along the `y` axis.
    /// - `z`: the world-space position of the rigid-body along the `z` axis.
    /// - `wakeUp`: forces the rigid-body to wake-up so it is properly affected by forces if it
    /// wasn't moving before modifying its position.
    #[cfg(feature = "dim3")]
    pub fn rbSetTranslation(&mut self, handle: u32, x: f32, y: f32, z: f32, wakeUp: bool) {
        self.map_mut(handle, |rb| {
            rb.set_translation(na::Vector3::new(x, y, z), wakeUp);
        })
    }

    /// Sets the translation of this rigid-body.
    ///
    /// # Parameters
    /// - `x`: the world-space position of the rigid-body along the `x` axis.
    /// - `y`: the world-space position of the rigid-body along the `y` axis.
    /// - `wakeUp`: forces the rigid-body to wake-up so it is properly affected by forces if it
    /// wasn't moving before modifying its position.
    #[cfg(feature = "dim2")]
    pub fn rbSetTranslation(&mut self, handle: u32, x: f32, y: f32, wakeUp: bool) {
        self.map_mut(handle, |rb| {
            rb.set_translation(na::Vector2::new(x, y), wakeUp);
        })
    }

    /// Sets the rotation quaternion of this rigid-body.
    ///
    /// This does nothing if a zero quaternion is provided.
    ///
    /// # Parameters
    /// - `x`: the first vector component of the quaternion.
    /// - `y`: the second vector component of the quaternion.
    /// - `z`: the third vector component of the quaternion.
    /// - `w`: the scalar component of the quaternion.
    /// - `wakeUp`: forces the rigid-body to wake-up so it is properly affected by forces if it
    /// wasn't moving before modifying its position.
    #[cfg(feature = "dim3")]
    pub fn rbSetRotation(&mut self, handle: u32, x: f32, y: f32, z: f32, w: f32, wakeUp: bool) {
        if let Some(q) = na::Unit::try_new(na::Quaternion::new(w, x, y, z), 0.0) {
            self.map_mut(handle, |rb| rb.set_rotation(q.scaled_axis(), wakeUp))
        }
    }

    /// Sets the rotation angle of this rigid-body.
    ///
    /// # Parameters
    /// - `angle`: the rotation angle, in radians.
    /// - `wakeUp`: forces the rigid-body to wake-up so it is properly affected by forces if it
    /// wasn't moving before modifying its position.
    #[cfg(feature = "dim2")]
    pub fn rbSetRotation(&mut self, handle: u32, angle: f32, wakeUp: bool) {
        self.map_mut(handle, |rb| rb.set_rotation(angle, wakeUp))
    }

    /// Sets the linear velocity of this rigid-body.
    pub fn rbSetLinvel(&mut self, handle: u32, linvel: &RawVector, wakeUp: bool) {
        self.map_mut(handle, |rb| {
            rb.set_linvel(linvel.0, wakeUp);
        });
    }

    /// Sets the angular velocity of this rigid-body.
    #[cfg(feature = "dim2")]
    pub fn rbSetAngvel(&mut self, handle: u32, angvel: f32, wakeUp: bool) {
        self.map_mut(handle, |rb| {
            rb.set_angvel(angvel, wakeUp);
        });
    }

    /// Sets the angular velocity of this rigid-body.
    #[cfg(feature = "dim3")]
    pub fn rbSetAngvel(&mut self, handle: u32, angvel: &RawVector, wakeUp: bool) {
        self.map_mut(handle, |rb| {
            rb.set_angvel(angvel.0, wakeUp);
        });
    }

    /// If this rigid body is kinematic, sets its future translation after the next timestep integration.
    ///
    /// This should be used instead of `rigidBody.setTranslation` to make the dynamic object
    /// interacting with this kinematic body behave as expected. Internally, Rapier will compute
    /// an artificial velocity for this rigid-body from its current position and its next kinematic
    /// position. This velocity will be used to compute forces on dynamic bodies interacting with
    /// this body.
    ///
    /// # Parameters
    /// - `x`: the world-space position of the rigid-body along the `x` axis.
    /// - `y`: the world-space position of the rigid-body along the `y` axis.
    /// - `z`: the world-space position of the rigid-body along the `z` axis.
    #[cfg(feature = "dim3")]
    pub fn rbSetNextKinematicTranslation(&mut self, handle: u32, x: f32, y: f32, z: f32) {
        self.map_mut(handle, |rb| {
            rb.set_next_kinematic_translation(na::Vector3::new(x, y, z));
        })
    }

    /// If this rigid body is kinematic, sets its future translation after the next timestep integration.
    ///
    /// This should be used instead of `rigidBody.setTranslation` to make the dynamic object
    /// interacting with this kinematic body behave as expected. Internally, Rapier will compute
    /// an artificial velocity for this rigid-body from its current position and its next kinematic
    /// position. This velocity will be used to compute forces on dynamic bodies interacting with
    /// this body.
    ///
    /// # Parameters
    /// - `x`: the world-space position of the rigid-body along the `x` axis.
    /// - `y`: the world-space position of the rigid-body along the `y` axis.
    #[cfg(feature = "dim2")]
    pub fn rbSetNextKinematicTranslation(&mut self, handle: u32, x: f32, y: f32) {
        self.map_mut(handle, |rb| {
            rb.set_next_kinematic_translation(na::Vector2::new(x, y));
        })
    }

    /// If this rigid body is kinematic, sets its future rotation after the next timestep integration.
    ///
    /// This should be used instead of `rigidBody.setRotation` to make the dynamic object
    /// interacting with this kinematic body behave as expected. Internally, Rapier will compute
    /// an artificial velocity for this rigid-body from its current position and its next kinematic
    /// position. This velocity will be used to compute forces on dynamic bodies interacting with
    /// this body.
    ///
    /// # Parameters
    /// - `x`: the first vector component of the quaternion.
    /// - `y`: the second vector component of the quaternion.
    /// - `z`: the third vector component of the quaternion.
    /// - `w`: the scalar component of the quaternion.
    #[cfg(feature = "dim3")]
    pub fn rbSetNextKinematicRotation(&mut self, handle: u32, x: f32, y: f32, z: f32, w: f32) {
        if let Some(q) = na::Unit::try_new(na::Quaternion::new(w, x, y, z), 0.0) {
            self.map_mut(handle, |rb| {
                rb.set_next_kinematic_rotation(q.scaled_axis());
            })
        }
    }

    /// If this rigid body is kinematic, sets its future rotation after the next timestep integration.
    ///
    /// This should be used instead of `rigidBody.setRotation` to make the dynamic object
    /// interacting with this kinematic body behave as expected. Internally, Rapier will compute
    /// an artificial velocity for this rigid-body from its current position and its next kinematic
    /// position. This velocity will be used to compute forces on dynamic bodies interacting with
    /// this body.
    ///
    /// # Parameters
    /// - `angle`: the rotation angle, in radians.
    #[cfg(feature = "dim2")]
    pub fn rbSetNextKinematicRotation(&mut self, handle: u32, angle: f32) {
        self.map_mut(handle, |rb| {
            rb.set_next_kinematic_rotation(angle);
        })
    }

    /// The linear velocity of this rigid-body.
    pub fn rbLinvel(&self, handle: u32) -> RawVector {
        self.map(handle, |rb| RawVector(*rb.linvel()))
    }

    /// The angular velocity of this rigid-body.
    #[cfg(feature = "dim2")]
    pub fn rbAngvel(&self, handle: u32) -> f32 {
        self.map(handle, |rb| rb.angvel())
    }

    /// The angular velocity of this rigid-body.
    #[cfg(feature = "dim3")]
    pub fn rbAngvel(&self, handle: u32) -> RawVector {
        self.map(handle, |rb| RawVector(*rb.angvel()))
    }

    /// The mass of this rigid-body.
    pub fn rbMass(&self, handle: u32) -> f32 {
        self.map(handle, |rb| rb.mass())
    }

    /// Wakes this rigid-body up.
    ///
    /// A dynamic rigid-body that does not move during several consecutive frames will
    /// be put to sleep by the physics engine, i.e., it will stop being simulated in order
    /// to avoid useless computations.
    /// This methods forces a sleeping rigid-body to wake-up. This is useful, e.g., before modifying
    /// the position of a dynamic body so that it is properly simulated afterwards.
    pub fn rbWakeUp(&mut self, handle: u32) {
        self.map_mut(handle, |rb| rb.wake_up(true))
    }

    /// Is Continuous Collision Detection enabled for this rigid-body?
    pub fn rbIsCcdEnabled(&self, handle: u32) -> bool {
        self.map(handle, |rb| rb.is_ccd_enabled())
    }

    /// The number of colliders attached to this rigid-body.
    pub fn rbNumColliders(&self, handle: u32) -> usize {
        self.map(handle, |rb| rb.colliders().len())
    }

    /// Retrieves the `i-th` collider attached to this rigid-body.
    ///
    /// # Parameters
    /// - `at`: The index of the collider to retrieve. Must be a number in `[0, this.numColliders()[`.
    ///         This index is **not** the same as the unique identifier of the collider.
    pub fn rbCollider(&self, handle: u32, at: usize) -> u32 {
        self.map(handle, |rb| rb.colliders()[at].into_raw_parts().0)
    }

    /// The status of this rigid-body: static, dynamic, or kinematic.
    pub fn rbBodyStatus(&self, handle: u32) -> RawRigidBodyType {
        self.map(handle, |rb| rb.body_type().into())
    }

    /// Is this rigid-body static?
    pub fn rbIsStatic(&self, handle: u32) -> bool {
        self.map(handle, |rb| rb.is_static())
    }

    /// Is this rigid-body kinematic?
    pub fn rbIsKinematic(&self, handle: u32) -> bool {
        self.map(handle, |rb| rb.is_kinematic())
    }

    /// Is this rigid-body dynamic?
    pub fn rbIsDynamic(&self, handle: u32) -> bool {
        self.map(handle, |rb| rb.is_dynamic())
    }

    /// The linear damping coefficient of this rigid-body.
    pub fn rbLinearDamping(&self, handle: u32) -> f32 {
        self.map(handle, |rb| rb.linear_damping())
    }

    /// The angular damping coefficient of this rigid-body.
    pub fn rbAngularDamping(&self, handle: u32) -> f32 {
        self.map(handle, |rb| rb.angular_damping())
    }

    pub fn rbSetLinearDamping(&mut self, handle: u32, factor: f32) {
        self.map_mut(handle, |rb| rb.set_linear_damping(factor));
    }

    pub fn rbSetAngularDamping(&mut self, handle: u32, factor: f32) {
        self.map_mut(handle, |rb| rb.set_angular_damping(factor));
    }

    pub fn rbGravityScale(&self, handle: u32) -> f32 {
        self.map(handle, |rb| rb.gravity_scale())
    }

    pub fn rbSetGravityScale(&mut self, handle: u32, factor: f32, wakeUp: bool) {
        self.map_mut(handle, |rb| rb.set_gravity_scale(factor, wakeUp));
    }

    /// Applies a force at the center-of-mass of this rigid-body.
    ///
    /// # Parameters
    /// - `force`: the world-space force to apply on the rigid-body.
    /// - `wakeUp`: should the rigid-body be automatically woken-up?
    pub fn rbApplyForce(&mut self, handle: u32, force: &RawVector, wakeUp: bool) {
        self.map_mut(handle, |rb| {
            rb.apply_force(force.0, wakeUp);
        })
    }

    /// Applies an impulse at the center-of-mass of this rigid-body.
    ///
    /// # Parameters
    /// - `impulse`: the world-space impulse to apply on the rigid-body.
    /// - `wakeUp`: should the rigid-body be automatically woken-up?
    pub fn rbApplyImpulse(&mut self, handle: u32, impulse: &RawVector, wakeUp: bool) {
        self.map_mut(handle, |rb| {
            rb.apply_impulse(impulse.0, wakeUp);
        })
    }

    /// Applies a torque at the center-of-mass of this rigid-body.
    ///
    /// # Parameters
    /// - `torque`: the torque to apply on the rigid-body.
    /// - `wakeUp`: should the rigid-body be automatically woken-up?
    #[cfg(feature = "dim2")]
    pub fn rbApplyTorque(&mut self, handle: u32, torque: f32, wakeUp: bool) {
        self.map_mut(handle, |rb| {
            rb.apply_torque(torque, wakeUp);
        })
    }

    /// Applies a torque at the center-of-mass of this rigid-body.
    ///
    /// # Parameters
    /// - `torque`: the world-space torque to apply on the rigid-body.
    /// - `wakeUp`: should the rigid-body be automatically woken-up?
    #[cfg(feature = "dim3")]
    pub fn rbApplyTorque(&mut self, handle: u32, torque: &RawVector, wakeUp: bool) {
        self.map_mut(handle, |rb| {
            rb.apply_torque(torque.0, wakeUp);
        })
    }

    /// Applies an impulsive torque at the center-of-mass of this rigid-body.
    ///
    /// # Parameters
    /// - `torque impulse`: the torque impulse to apply on the rigid-body.
    /// - `wakeUp`: should the rigid-body be automatically woken-up?
    #[cfg(feature = "dim2")]
    pub fn rbApplyTorqueImpulse(&mut self, handle: u32, torque_impulse: f32, wakeUp: bool) {
        self.map_mut(handle, |rb| {
            rb.apply_torque_impulse(torque_impulse, wakeUp);
        })
    }

    /// Applies an impulsive torque at the center-of-mass of this rigid-body.
    ///
    /// # Parameters
    /// - `torque impulse`: the world-space torque impulse to apply on the rigid-body.
    /// - `wakeUp`: should the rigid-body be automatically woken-up?
    #[cfg(feature = "dim3")]
    pub fn rbApplyTorqueImpulse(&mut self, handle: u32, torque_impulse: &RawVector, wakeUp: bool) {
        self.map_mut(handle, |rb| {
            rb.apply_torque_impulse(torque_impulse.0, wakeUp);
        })
    }

    /// Applies a force at the given world-space point of this rigid-body.
    ///
    /// # Parameters
    /// - `force`: the world-space force to apply on the rigid-body.
    /// - `point`: the world-space point where the impulse is to be applied on the rigid-body.
    /// - `wakeUp`: should the rigid-body be automatically woken-up?
    pub fn rbApplyForceAtPoint(
        &mut self,
        handle: u32,
        force: &RawVector,
        point: &RawVector,
        wakeUp: bool,
    ) {
        self.map_mut(handle, |rb| {
            rb.apply_force_at_point(force.0, point.0.into(), wakeUp);
        })
    }

    /// Applies an impulse at the given world-space point of this rigid-body.
    ///
    /// # Parameters
    /// - `impulse`: the world-space impulse to apply on the rigid-body.
    /// - `point`: the world-space point where the impulse is to be applied on the rigid-body.
    /// - `wakeUp`: should the rigid-body be automatically woken-up?
    pub fn rbApplyImpulseAtPoint(
        &mut self,
        handle: u32,
        impulse: &RawVector,
        point: &RawVector,
        wakeUp: bool,
    ) {
        self.map_mut(handle, |rb| {
            rb.apply_impulse_at_point(impulse.0, point.0.into(), wakeUp);
        })
    }
}
