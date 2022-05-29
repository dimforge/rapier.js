use rapier::data::Index;
use rapier::dynamics::{ImpulseJointHandle, MultibodyJointHandle, RigidBodyHandle};
use rapier::geometry::ColliderHandle;

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
pub fn fuse_handle(id: Index) -> FlatHandle {
    let (i, g) = id.into_raw_parts();
    FlatHandle::from_bits(i as u64 | ((g as u64) << 32))
}
