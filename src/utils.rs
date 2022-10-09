use rapier::data::Index;
use rapier::dynamics::{ImpulseJointHandle, MultibodyJointHandle, RigidBodyHandle};
use rapier::geometry::{Collider, ColliderHandle};
use wasm_bindgen::JsValue;

pub type FlatHandle = f64;

#[inline(always)]
pub fn collider_handle(id: FlatHandle) -> ColliderHandle {
    ColliderHandle::from_raw_parts(id.to_bits() as u32, (id.to_bits() >> 32) as u32)
}

#[inline(always)]
pub fn body_handle(id: FlatHandle) -> RigidBodyHandle {
    RigidBodyHandle::from_raw_parts(id.to_bits() as u32, (id.to_bits() >> 32) as u32)
}

#[inline(always)]
pub fn impulse_joint_handle(id: FlatHandle) -> ImpulseJointHandle {
    ImpulseJointHandle::from_raw_parts(id.to_bits() as u32, (id.to_bits() >> 32) as u32)
}

#[inline(always)]
pub fn multibody_joint_handle(id: FlatHandle) -> MultibodyJointHandle {
    MultibodyJointHandle::from_raw_parts(id.to_bits() as u32, (id.to_bits() >> 32) as u32)
}

#[inline(always)]
pub fn flat_handle(id: Index) -> FlatHandle {
    let (i, g) = id.into_raw_parts();
    FlatHandle::from_bits(i as u64 | ((g as u64) << 32))
}

// pub type FlatHandle = u32;
//
// #[inline(always)]
// pub fn collider_handle(id: FlatHandle) -> ColliderHandle {
//     ColliderHandle::from_raw_parts(id as u32, (id >> 16) as u32)
// }
//
// #[inline(always)]
// pub fn body_handle(id: FlatHandle) -> RigidBodyHandle {
//     RigidBodyHandle::from_raw_parts(id as u32, (id >> 16) as u32)
// }
//
// #[inline(always)]
// pub fn impulse_joint_handle(id: FlatHandle) -> ImpulseJointHandle {
//     ImpulseJointHandle::from_raw_parts(id as u32, (id >> 16) as u32)
// }
//
// #[inline(always)]
// pub fn multibody_joint_handle(id: FlatHandle) -> MultibodyJointHandle {
//     MultibodyJointHandle::from_raw_parts(id as u32, (id >> 16) as u32)
// }
//
// #[inline(always)]
// pub fn flat_handle(id: Index) -> FlatHandle {
//     let (i, g) = id.into_raw_parts();
//     i as u32 | ((g as u32) << 16)
// }

pub fn wrap_filter(
    filter: &js_sys::Function,
) -> Option<impl Fn(ColliderHandle, &Collider) -> bool + '_> {
    if filter.is_function() {
        let filtercb = move |handle: ColliderHandle, _: &Collider| match filter
            .call1(&JsValue::null(), &JsValue::from(flat_handle(handle.0)))
        {
            Err(_) => true,
            Ok(val) => val.as_bool().unwrap_or(true),
        };

        Some(filtercb)
    } else {
        None
    }
}
