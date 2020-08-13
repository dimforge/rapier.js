use crate::geometry::{Collider, ColliderDesc};
use crate::math::{Vector, Rotation};
use rapier::dynamics::{
    BodyStatus, RigidBody as RRigidBody, RigidBodyBuilder as RRigidBodyBuilder, RigidBodyHandle,
    RigidBodySet, RigidBodyMut as RRigidBodyMut
};
use rapier::geometry::{ColliderBuilder, ColliderSet};
use std::cell::RefCell;
use std::rc::Rc;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
/// A rigid body.
///
/// To create a new rigid-body, use the `RigidBodyBuilder` structure.
pub struct RigidBody {
    pub(crate) bodies: Rc<RefCell<RigidBodySet>>,
    pub(crate) colliders: Rc<RefCell<ColliderSet>>,
    pub(crate) handle: RigidBodyHandle,
}

impl RigidBody {
    pub(crate) fn map<T>(&self, f: impl FnOnce(&RRigidBody) -> T) -> T {
        let bodies = self.bodies.borrow();
        let body = bodies.get(self.handle).expect(
            "Invalid RigidBody reference. It may have been removed from the physics World.",
        );
        f(body)
    }

    pub(crate) fn map_mut<T>(&mut self, f: impl FnOnce(RRigidBodyMut) -> T) -> T {
        let mut bodies = self.bodies.borrow_mut();
        let body = bodies.get_mut(self.handle).expect(
            "Invalid RigidBody reference. It may have been removed from the physics World.",
        );
        f(body)
    }
}

#[wasm_bindgen]
impl RigidBody {
    /// The world-space translation of this rigid-body.
    pub fn translation(&self) -> Vector {
        self.map(|rb| Vector(rb.position.translation.vector))
    }

    /// The world-space orientation of this rigid-body.
    pub fn rotation(&self) -> Rotation {
        self.map(|rb| Rotation(rb.position.rotation))
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
    pub fn setTranslation(&mut self, x: f32, y: f32, z: f32, wakeUp: bool) {
        self.map_mut(|mut rb| {
            let mut pos = rb.position;
            pos.translation.vector = na::Vector3::new(x, y, z);
            rb.set_position(pos);

            if wakeUp {
                rb.wake_up()
            }
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
    pub fn setTranslation(&mut self, x: f32, y: f32, wakeUp: bool) {
        self.map_mut(|mut rb| {
            let mut pos = rb.position;
            pos.translation.vector = na::Vector2::new(x, y);
            rb.set_position(pos);

            if wakeUp {
                rb.wake_up()
            }
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
    pub fn setRotation(&mut self, x: f32, y: f32, z: f32, w: f32, wakeUp: bool) {
        if let Some(q) = na::Unit::try_new(na::Quaternion::new(w, x, y, z), 0.0) {
            self.map_mut(|mut rb| {
                let mut pos = rb.position;
                pos.rotation = q;
                rb.set_position(pos);

                if wakeUp {
                    rb.wake_up()
                }
            })
        }
    }

    /// Sets the rotation angle of this rigid-body.
    ///
    /// # Parameters
    /// - `angle`: the rotation angle, in radians.
    /// - `wakeUp`: forces the rigid-body to wake-up so it is properly affected by forces if it
    /// wasn't moving before modifying its position.
    #[cfg(feature = "dim2")]
    pub fn setRotation(&mut self, angle: f32, wakeUp: bool) {
        self.map_mut(|mut rb| {
            let mut pos = rb.position;
            pos.rotation = na::UnitComplex::new(angle);
            rb.set_position(pos);

            if wakeUp {
                rb.wake_up()
            }
        })
    }

    /// The linear velocity of this rigid-body.
    pub fn linvel(&self) -> Vector {
        self.map(|rb| Vector(rb.linvel))
    }

    /// The mass of this rigid-body.
    pub fn mass(&self) -> f32 {
        self.map(|rb| rb.mass())
    }

    /// Wakes this rigid-body up.
    ///
    /// A dynamic rigid-body that does not move during several consecutive frames will
    /// be put to sleep by the physics engine, i.e., it will stop being simulated in order
    /// to avoid useless computations.
    /// This methods forces a sleeping rigid-body to wake-up. This is useful, e.g., before modifying
    /// the position of a dynamic body so that it is properly simulated afterwards.
    pub fn wakeUp(&mut self) {
        self.map_mut(|mut rb| rb.wake_up())
    }

    /// Creates a new collider attached to his rigid-body from the given collider descriptor.
    ///
    /// # Parameters
    /// - `collider`: The collider description used to create the collider.
    pub fn createCollider(&mut self, collider: &ColliderDesc) -> Collider {
        let builder: ColliderBuilder = collider.clone().into();
        let collider = builder.build(self.handle);
        let colliders = self.colliders.clone();
        let bodies = self.bodies.clone();
        let handle = colliders
            .borrow_mut()
            .insert(collider, &mut *bodies.borrow_mut());
        Collider {
            colliders,
            bodies,
            handle,
        }
    }

    /// The unique integer identifier of this rigid-body.
    pub fn handle(&self) -> usize {
        self.handle.into_raw_parts().0
    }

    /// The number of colliders attached to this rigid-body.
    pub fn numColliders(&self) -> usize {
        self.map(|rb| rb.colliders().len())
    }

    /// Retrieves the `i-th` collider attached to this rigid-body.
    ///
    /// # Parameters
    /// - `at`: The index of the collidder to retrieve. Must be a number in `[0, this.numColliders()[`.
    ///         This index is **not** the same as the unique identifier of the collider.
    pub fn collider(&self, at: usize) -> Collider {
        self.map(|rb| {
            let handle = rb.colliders()[at];
            Collider {
                colliders: self.colliders.clone(),
                bodies: self.bodies.clone(),
                handle,
            }
        })
    }

    /// The type of this rigid-body: static, dynamic, or kinematic.
    pub fn bodyType(&self) -> String {
        self.map(|rb| match rb.body_type {
            BodyStatus::Static => "static".to_string(),
            BodyStatus::Dynamic => "dynamic".to_string(),
            BodyStatus::Kinematic => "kinematic".to_string(),
        })
    }

    /// Is this rigid-body static?
    pub fn isStatic(&self) -> bool {
        self.map(|rb| rb.is_static())
    }

    /// Is this rigid-body kinematic?
    pub fn isKinematic(&self) -> bool {
        self.map(|rb| rb.is_kinematic())
    }

    /// Is this rigid-body dynamic?
    pub fn isDynamic(&self) -> bool {
        self.map(|rb| rb.is_dynamic())
    }
}

#[wasm_bindgen]
#[derive(Copy, Clone)]
/// The description used to build a rigid-body.
pub struct RigidBodyDesc {
    pub(crate) bodyType: BodyStatus,
    /// The world-space rigid-body position.
    pub position: Vector,
    rotation: Rotation,
    linvel: Vector,
    #[cfg(feature = "dim2")]
    angvel: f32,
    #[cfg(feature = "dim3")]
    angvel: Vector,
    can_sleep: bool,
}

impl From<RigidBodyDesc> for RRigidBodyBuilder {
    fn from(desc: RigidBodyDesc) -> Self {
        let pos = na::Isometry::from_parts(desc.position.0.into(), desc.rotation.0);
        let res = RRigidBodyBuilder::new(desc.bodyType)
            .position(pos)
            .can_sleep(desc.can_sleep);

        #[cfg(feature = "dim2")]
        return res
            .linvel(desc.linvel.0.x, desc.linvel.0.y)
            .angvel(desc.angvel);
        #[cfg(feature = "dim3")]
        return res
            .linvel(desc.linvel.0.x, desc.linvel.0.y, desc.linvel.0.z)
            .angvel(desc.angvel.0);
    }
}

#[wasm_bindgen]
impl RigidBodyDesc {
    #[wasm_bindgen(constructor)]
    /// Create a new rigid-body with the given type.
    ///
    /// # Parameters
    /// - `bodyType`: the rigid-body type. Can be `static`, `dynamic` or `kinematic`. Dynamic bodies
    ///               are affected by all forces. Kinematic bodies are not affected by any force but can be
    ///               user-controlled by setting its position. A `static` is not affected by any forces, and
    ///               cannot be controlled by the user without potentially introducing insabilities with
    ///               the other bodies it interactd with.
    pub fn new(bodyType: String) -> Self {
        let bodyType = match bodyType.as_str() {
            "static" => BodyStatus::Static,
            "dynamic" => BodyStatus::Dynamic,
            "kinematic" => BodyStatus::Kinematic,
            _ => panic!(
                "Invalid body type: {}. Must be static|dynamic|kinematic.",
                bodyType
            ),
        };

        Self {
            bodyType,
            position: Vector::zero(),
            rotation: Rotation::identity(),
            linvel: Vector::zero(),
            #[cfg(feature = "dim2")]
            angvel: 0.0,
            #[cfg(feature = "dim3")]
            angvel: Vector::zero(),
            can_sleep: true,
        }
    }

    /// Sets the world-space position of the rigid-body to be created.
    ///
    /// # Parameters
    /// - `x`: the position of the rigid-body to be created along the `x` axis.
    /// - `y`: the position of the rigid-body to be created along the `y` axis.
    #[cfg(feature = "dim2")]
    pub fn setTranslation(&mut self, x: f32, y: f32) {
        self.position = Vector::new(x, y)
    }

    /// Sets the world-space position of the rigid-body to be created.
    ///
    /// # Parameters
    /// - `x`: the position of the rigid-body to be created along the `x` axis.
    /// - `y`: the position of the rigid-body to be created along the `y` axis.
    /// - `z`: the position of the rigid-body to be created along the `z` axis.
    #[cfg(feature = "dim3")]
    pub fn setTranslation(&mut self, x: f32, y: f32, z: f32) {
        self.position = Vector::new(x, y, z)
    }

    /// Sets the rotation quaternion of the rigid-body to be created.
    ///
    /// This does nothing if a zero quaternion is provided.
    ///
    /// # Parameters
    /// - `x`: the first vector component of the quaternion.
    /// - `y`: the second vector component of the quaternion.
    /// - `z`: the third vector component of the quaternion.
    /// - `w`: the scalar component of the quaternion.
    #[cfg(feature = "dim3")]
    pub fn setRotation(&mut self, x: f32, y: f32, z: f32, w: f32) {
        if let Some(q) = na::Unit::try_new(na::Quaternion::new(w, x, y, z), 0.0) {
            self.rotation = Rotation(q);
        }
    }

    /// Sets the rotation angle of the rigid-body to be created.
    ///
    /// # Parameters
    /// - `angle`: the rotation angle.
    #[cfg(feature = "dim2")]
    pub fn setRotation(&mut self, angle: f32) {
        self.rotation = Rotation(na::UnitComplex::new(angle));
    }
}
