use crate::geometry::{Collider, ColliderDesc};
use crate::math::Vector;
use crate::world::World;
use js_sys::Array;
use rapier::dynamics::{
    BodyStatus, RigidBody as RRigidBody, RigidBodyBuilder as RRigidBodyBuilder, RigidBodyHandle,
    RigidBodySet,
};
use rapier::geometry::{ColliderBuilder, ColliderSet};
use std::cell::RefCell;
use std::rc::Rc;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RigidBody {
    pub(crate) bodies: Rc<RefCell<RigidBodySet>>,
    pub(crate) colliders: Rc<RefCell<ColliderSet>>,
    pub(crate) handle: RigidBodyHandle,
}

impl RigidBody {
    pub fn map<T>(&self, f: impl FnOnce(&RRigidBody) -> T) -> T {
        let bodies = self.bodies.borrow();
        let body = bodies.get(self.handle).expect(
            "Invalid RigidBody reference. It may have been removed from the physics World.",
        );
        f(body)
    }
}

#[wasm_bindgen]
impl RigidBody {
    pub fn translation(&self) -> Vector {
        self.map(|rb| Vector(rb.position.translation.vector))
    }

    pub fn linvel(&self) -> Vector {
        self.map(|rb| Vector(rb.linvel))
    }

    pub fn mass(&self) -> f32 {
        self.map(|rb| rb.mass())
    }

    pub fn create_collider(&mut self, collider: &ColliderDesc) -> Collider {
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

    pub fn handle(&self) -> usize {
        self.handle.into_raw_parts().0
    }

    pub fn num_colliders(&self) -> usize {
        self.map(|rb| rb.colliders().len())
    }

    pub fn collider(&self, at: usize) -> Collider {
        self.map(|rb| {
            let h = rb.colliders()[at];
            Collider {
                colliders: self.colliders.clone(),
                bodies: self.bodies.clone(),
                handle: self.handle.clone(),
            }
        })
    }

    pub fn body_type(&self) -> String {
        self.map(|rb| match rb.body_type {
            BodyStatus::Static => "static".to_string(),
            BodyStatus::Dynamic => "dynamic".to_string(),
            BodyStatus::Kinematic => "kinematic".to_string(),
        })
    }

    pub fn is_static(&self) -> bool {
        self.map(|rb| rb.is_static())
    }

    pub fn is_kinematic(&self) -> bool {
        self.map(|rb| rb.is_kinematic())
    }

    pub fn is_dynamic(&self) -> bool {
        self.map(|rb| rb.is_dynamic())
    }
}

#[wasm_bindgen]
#[derive(Copy, Clone)]
pub struct RigidBodyDesc {
    pub(crate) body_type: BodyStatus,
    pub position: Vector,
    linvel: Vector,
    angvel: Vector,
    can_sleep: bool,
}

impl From<RigidBodyDesc> for RRigidBodyBuilder {
    fn from(desc: RigidBodyDesc) -> Self {
        RRigidBodyBuilder::new(desc.body_type)
            .can_sleep(desc.can_sleep)
            .linvel(desc.linvel.0)
            .angvel(desc.angvel.0)
            .translation(desc.position.0.x, desc.position.0.y, desc.position.0.z)
    }
}

#[wasm_bindgen]
impl RigidBodyDesc {
    #[wasm_bindgen(constructor)]
    pub fn new(body_type: String) -> Self {
        let body_type = match body_type.as_str() {
            "static" => BodyStatus::Static,
            "dynamic" => BodyStatus::Dynamic,
            "kinematic" => BodyStatus::Kinematic,
            _ => panic!(
                "Invalid body type: {}. Must be static|dynamic|kinematic.",
                body_type
            ),
        };

        Self {
            body_type,
            position: Vector::zero(),
            linvel: Vector::zero(),
            angvel: Vector::zero(),
            can_sleep: true,
        }
    }

    pub fn set_translation(&mut self, x: f32, y: f32, z: f32) {
        self.position = Vector::new(x, y, z)
    }
}
