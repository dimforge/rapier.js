use crate::dynamic::RigidBody;
use crate::math::{Rotation, Vector};
use rapier::dynamics::RigidBodySet;
use rapier::geometry::{
    Collider as RCollider, ColliderBuilder, ColliderHandle, ColliderSet, Shape,
};
use rapier::math::Isometry;
use std::cell::RefCell;
use std::rc::Rc;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub enum ShapeType {
    Ball = "Ball",
    Polygon = "Polygon",
    Cuboid = "Cuboid",
    Capsule = "Capsule",
    Triangle = "Triangle",
    Trimesh = "Trimesh",
    HeightField = "HeightField",
}

#[wasm_bindgen]
pub struct Collider {
    pub(crate) bodies: Rc<RefCell<RigidBodySet>>,
    pub(crate) colliders: Rc<RefCell<ColliderSet>>,
    pub(crate) handle: ColliderHandle,
}

impl Collider {
    pub fn map<T>(&self, f: impl FnOnce(&RCollider) -> T) -> T {
        let colliders = self.colliders.borrow();
        let body = colliders
            .get(self.handle)
            .expect("Invalid Collider reference. It may have been removed from its parent body.");
        f(body)
    }

    pub fn apply(&mut self, f: impl FnOnce(&mut RCollider)) {
        let mut colliders = self.colliders.borrow_mut();
        let body = colliders
            .get_mut(self.handle)
            .expect("Invalid Collider reference. It may have been removed from its parent body.");
        f(body)
    }
}

#[wasm_bindgen]
impl Collider {
    pub fn translation(&self) -> Vector {
        self.map(|co| Vector(co.position().translation.vector))
    }

    pub fn rotation(&self) -> Rotation {
        self.map(|co| Rotation(co.position().rotation))
    }

    pub fn shape_type(&self) -> ShapeType {
        self.map(|co| match co.shape() {
            Shape::Ball(_) => ShapeType::Ball,
            Shape::Polygon(_) => ShapeType::Polygon,
            Shape::Cuboid(_) => ShapeType::Cuboid,
            Shape::Capsule(_) => ShapeType::Capsule,
            Shape::Triangle(_) => ShapeType::Triangle,
            Shape::Trimesh(_) => ShapeType::Trimesh,
            Shape::HeightField(_) => ShapeType::HeightField,
        })
    }

    /// The half-extents of this collider if it is has a cuboid shape.
    pub fn half_extents(&self) -> Option<Vector> {
        self.map(|co| match co.shape() {
            Shape::Cuboid(c) => Some(Vector(c.half_extents)),
            _ => None,
        })
    }

    /// The radius of this collider if it is has a ball shape.
    pub fn radius(&self) -> Option<f32> {
        self.map(|co| match co.shape() {
            Shape::Ball(b) => Some(b.radius),
            _ => None,
        })
    }

    pub fn parent(&self) -> RigidBody {
        self.map(|co| RigidBody {
            bodies: self.bodies.clone(),
            colliders: self.colliders.clone(),
            handle: co.parent(),
        })
    }

    pub fn handle(&self) -> usize {
        self.handle.into_raw_parts().0
    }

    pub fn parent_handle(&self) -> usize {
        self.map(|co| co.parent().into_raw_parts().0)
    }

    pub fn friction(&self) -> f32 {
        self.map(|co| co.friction)
    }

    #[cfg(feature = "dim3")]
    pub fn set_position_debug(
        &mut self,
        x: f32,
        y: f32,
        z: f32,
        ri: f32,
        rj: f32,
        rk: f32,
        rw: f32,
    ) {
        let tra = na::Translation3::new(x, y, z);
        let rot = na::Unit::new_unchecked(na::Quaternion::new(ri, rj, rk, rw));
        let iso = tra * rot;
        self.apply(|co| co.set_position_debug(iso));
    }

    pub fn density(&self) -> f32 {
        self.map(|co| co.density())
    }
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct ColliderDesc {
    shape: Shape,
    pub density: f32,
    pub friction: f32,
    pub restitution: f32,
    delta: Isometry<f32>,
    pub is_sensor: bool,
}

impl From<ColliderDesc> for ColliderBuilder {
    fn from(desc: ColliderDesc) -> Self {
        Self {
            shape: desc.shape,
            density: desc.density,
            friction: desc.friction,
            restitution: desc.restitution,
            delta: desc.delta,
            is_sensor: desc.is_sensor,
        }
    }
}

impl From<ColliderBuilder> for ColliderDesc {
    fn from(bldr: ColliderBuilder) -> Self {
        Self {
            shape: bldr.shape,
            density: bldr.density,
            friction: bldr.friction,
            restitution: bldr.restitution,
            delta: bldr.delta,
            is_sensor: bldr.is_sensor,
        }
    }
}

#[wasm_bindgen]
impl ColliderDesc {
    pub fn ball(radius: f32) -> Self {
        ColliderBuilder::ball(radius).into()
    }

    #[cfg(feature = "dim2")]
    pub fn cuboid(hx: f32, hy: f32) -> Self {
        ColliderBuilder::cuboid(hx, hy).into()
    }

    #[cfg(feature = "dim3")]
    pub fn cuboid(hx: f32, hy: f32, hz: f32) -> Self {
        ColliderBuilder::cuboid(hx, hy, hz).into()
    }
}
