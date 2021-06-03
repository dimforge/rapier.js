use crate::math::RawVector;
use rapier::geometry::{ContactManifold, ContactPair, NarrowPhase};
use rapier::math::Real;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawNarrowPhase(pub(crate) NarrowPhase);

#[wasm_bindgen]
impl RawNarrowPhase {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        RawNarrowPhase(NarrowPhase::new())
    }

    pub fn contacts_with(&self, handle1: u32, f: js_sys::Function) {
        let this = JsValue::null();
        for pair in self.0.contacts_with_unknown_gen(handle1) {
            let handle2 = if pair.collider1.into_raw_parts().0 == handle1 {
                pair.collider2.into_raw_parts().0
            } else {
                pair.collider1.into_raw_parts().0
            };

            let _ = f.call1(&this, &JsValue::from(handle2));
        }
    }

    pub fn contact_pair(&self, handle1: u32, handle2: u32) -> Option<RawContactPair> {
        self.0
            .contact_pair_unknown_gen(handle1, handle2)
            .map(|p| RawContactPair(p as *const ContactPair))
    }

    pub fn intersections_with(&self, handle1: u32, f: js_sys::Function) {
        let this = JsValue::null();
        for (h1, h2, inter) in self.0.intersections_with_unknown_gen(handle1) {
            if inter {
                let handle2 = if h1.into_raw_parts().0 == handle1 {
                    h2.into_raw_parts().0
                } else {
                    h1.into_raw_parts().0
                };

                let _ = f.call1(&this, &JsValue::from(handle2));
            }
        }
    }

    pub fn intersection_pair(&self, handle1: u32, handle2: u32) -> bool {
        self.0.intersection_pair_unknown_gen(handle1, handle2) == Some(true)
    }
}

#[wasm_bindgen]
pub struct RawContactPair(*const ContactPair);
#[wasm_bindgen]
pub struct RawContactManifold(*const ContactManifold);

// SAFETY: the use of a raw pointer is very unsafe.
//         We need this because wasm-bindgen doesn't support
//         lifetimes. So for the moment, we have to make sure
//         that our TypeScript wrapper properly free the pair
//         before the user has a chance to invalidate this pointer.
#[wasm_bindgen]
impl RawContactPair {
    pub fn collider1(&self) -> u32 {
        unsafe { (*self.0).collider1.into_raw_parts().0 }
    }

    pub fn collider2(&self) -> u32 {
        unsafe { (*self.0).collider2.into_raw_parts().0 }
    }

    pub fn numContactManifolds(&self) -> usize {
        unsafe { (*self.0).manifolds.len() }
    }
    pub fn contactManifold(&self, i: usize) -> Option<RawContactManifold> {
        unsafe {
            (*self.0)
                .manifolds
                .get(i)
                .map(|m| RawContactManifold(m as *const ContactManifold))
        }
    }
}

#[wasm_bindgen]
impl RawContactManifold {
    pub fn normal(&self) -> RawVector {
        unsafe { RawVector((*self.0).data.normal) }
    }

    // pub fn user_data(&self) -> u32 {
    //     unsafe { (*self.0).data.user_data }
    // }

    pub fn local_n1(&self) -> RawVector {
        unsafe { (*self.0).local_n1.into() }
    }

    pub fn local_n2(&self) -> RawVector {
        unsafe { (*self.0).local_n1.into() }
    }

    pub fn subshape1(&self) -> u32 {
        unsafe { (*self.0).subshape1 }
    }

    pub fn subshape2(&self) -> u32 {
        unsafe { (*self.0).subshape1 }
    }

    pub fn num_contacts(&self) -> usize {
        unsafe { (*self.0).points.len() }
    }

    pub fn contact_local_p1(&self, i: usize) -> Option<RawVector> {
        unsafe { (*self.0).points.get(i).map(|c| c.local_p1.coords.into()) }
    }

    pub fn contact_local_p2(&self, i: usize) -> Option<RawVector> {
        unsafe { (*self.0).points.get(i).map(|c| c.local_p1.coords.into()) }
    }

    pub fn contact_dist(&self, i: usize) -> Real {
        unsafe { (*self.0).points.get(i).map(|c| c.dist).unwrap_or(0.0) }
    }

    pub fn contact_fid1(&self, i: usize) -> u32 {
        unsafe { (*self.0).points.get(i).map(|c| c.fid1).unwrap_or(0) }
    }

    pub fn contact_fid2(&self, i: usize) -> u32 {
        unsafe { (*self.0).points.get(i).map(|c| c.fid2).unwrap_or(0) }
    }

    pub fn contact_impulse(&self, i: usize) -> Real {
        unsafe {
            (*self.0)
                .points
                .get(i)
                .map(|c| c.data.impulse)
                .unwrap_or(0.0)
        }
    }

    #[cfg(feature = "dim2")]
    pub fn contact_tangent_impulse(&self, i: usize) -> Real {
        unsafe {
            (*self.0)
                .points
                .get(i)
                .map(|c| c.data.tangent_impulse)
                .unwrap_or(0.0)
        }
    }

    #[cfg(feature = "dim3")]
    pub fn contact_tangent_impulse_x(&self, i: usize) -> Real {
        unsafe {
            (*self.0)
                .points
                .get(i)
                .map(|c| c.data.tangent_impulse.x)
                .unwrap_or(0.0)
        }
    }

    #[cfg(feature = "dim3")]
    pub fn contact_tangent_impulse_y(&self, i: usize) -> Real {
        unsafe {
            (*self.0)
                .points
                .get(i)
                .map(|c| c.data.tangent_impulse.y)
                .unwrap_or(0.0)
        }
    }

    pub fn num_solver_contacts(&self) -> usize {
        unsafe { (*self.0).data.solver_contacts.len() }
    }

    pub fn solver_contact_point(&self, i: usize) -> Option<RawVector> {
        unsafe {
            (*self.0)
                .data
                .solver_contacts
                .get(i)
                .map(|c| c.point.coords.into())
        }
    }

    pub fn solver_contact_dist(&self, i: usize) -> Real {
        unsafe {
            (*self.0)
                .data
                .solver_contacts
                .get(i)
                .map(|c| c.dist)
                .unwrap_or(0.0)
        }
    }

    pub fn solver_contact_friction(&self, i: usize) -> Real {
        unsafe { (*self.0).data.solver_contacts[i].friction }
    }

    pub fn solver_contact_restitution(&self, i: usize) -> Real {
        unsafe { (*self.0).data.solver_contacts[i].restitution }
    }

    pub fn solver_contact_tangent_velocity(&self, i: usize) -> RawVector {
        unsafe { (*self.0).data.solver_contacts[i].tangent_velocity.into() }
    }
}
