//! Structures related to geometry: colliders, shapes, etc.

pub use self::broad_phase::*;
pub use self::collider::*;
pub use self::collider_set::*;
pub use self::narrow_phase::*;
pub use self::point::*;
pub use self::ray::*;
pub use self::shape::*;
pub use self::toi::*;

mod broad_phase;
mod collider;
mod collider_set;
mod narrow_phase;
mod point;
mod ray;
mod shape;
mod toi;

use rapier::geometry::InteractionGroups;

pub const fn unpack_interaction_groups(memberships_filter: u32) -> InteractionGroups {
    InteractionGroups::new(
        (memberships_filter >> 16) as u32,
        (memberships_filter & 0x0000_ffff) as u32,
    )
}

pub const fn pack_interaction_groups(groups: InteractionGroups) -> u32 {
    (groups.memberships << 16) | groups.filter
}
