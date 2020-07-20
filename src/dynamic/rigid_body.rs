use crate::geometry::{Collider, ColliderDesc};
use crate::math::Vector;
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

    pub fn handle(&self) -> usize {
        self.handle.into_raw_parts().0
    }

    pub fn numColliders(&self) -> usize {
        self.map(|rb| rb.colliders().len())
    }

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

    pub fn bodyType(&self) -> String {
        self.map(|rb| match rb.body_type {
            BodyStatus::Static => "static".to_string(),
            BodyStatus::Dynamic => "dynamic".to_string(),
            BodyStatus::Kinematic => "kinematic".to_string(),
        })
    }

    pub fn isStatic(&self) -> bool {
        self.map(|rb| rb.is_static())
    }

    pub fn isKinematic(&self) -> bool {
        self.map(|rb| rb.is_kinematic())
    }

    pub fn isDynamic(&self) -> bool {
        self.map(|rb| rb.is_dynamic())
    }
}

#[wasm_bindgen]
#[derive(Copy, Clone)]
pub struct RigidBodyDesc {
    pub(crate) bodyType: BodyStatus,
    pub position: Vector,
    linvel: Vector,
    angvel: Vector,
    can_sleep: bool,
}

impl From<RigidBodyDesc> for RRigidBodyBuilder {
    fn from(desc: RigidBodyDesc) -> Self {
        RRigidBodyBuilder::new(desc.bodyType)
            .can_sleep(desc.can_sleep)
            .linvel(desc.linvel.0)
            .angvel(desc.angvel.0)
            .translation(desc.position.0.x, desc.position.0.y, desc.position.0.z)
    }
}

#[wasm_bindgen]
impl RigidBodyDesc {
    #[wasm_bindgen(constructor)]
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
            linvel: Vector::zero(),
            angvel: Vector::zero(),
            can_sleep: true,
        }
    }

    pub fn setTranslation(&mut self, x: f32, y: f32, z: f32) {
        self.position = Vector::new(x, y, z)
    }
}
