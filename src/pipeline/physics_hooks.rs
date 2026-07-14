use crate::geometry::RawContactManifold;
use crate::math::RawVector;
use crate::utils::{self, FlatHandle};
use na::ComplexField;
use rapier::geometry::SolverFlags;
use rapier::math::{Real, Vector};
use rapier::pipeline::{ContactModificationContext, PairFilterContext, PhysicsHooks};
use rapier::prelude::{ContactManifold, SolverContact};
use wasm_bindgen::prelude::*;

pub struct RawPhysicsHooks {
    pub this: js_sys::Object,
    pub filter_contact_pair: js_sys::Function,
    pub filter_intersection_pair: js_sys::Function,
    pub modify_solver_contacts: Option<js_sys::Function>,
}

// HACK: the RawPhysicsHooks is no longer Send+Sync because the JS objects are
//       no longer Send+Sync since https://github.com/rustwasm/wasm-bindgen/pull/955
//       As far as this is confined to the bindings this should be fine since we
//       never use threading in wasm.
unsafe impl Send for RawPhysicsHooks {}
unsafe impl Sync for RawPhysicsHooks {}

#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

impl PhysicsHooks for RawPhysicsHooks {
    fn filter_contact_pair(&self, ctxt: &PairFilterContext) -> Option<SolverFlags> {
        let rb1 = ctxt
            .rigid_body1
            .map(|rb| JsValue::from(utils::flat_handle(rb.0)))
            .unwrap_or(JsValue::NULL);
        let rb2 = ctxt
            .rigid_body2
            .map(|rb| JsValue::from(utils::flat_handle(rb.0)))
            .unwrap_or(JsValue::NULL);

        let result = self
            .filter_contact_pair
            .bind2(
                &self.this,
                &JsValue::from(utils::flat_handle(ctxt.collider1.0)),
                &JsValue::from(utils::flat_handle(ctxt.collider2.0)),
            )
            .call2(&self.this, &rb1, &rb2)
            .ok()?;
        let flags = result.as_f64()?;
        // TODO: not sure exactly why we have to do `flags as u32` instead
        //       of `flags.to_bits() as u32`.
        SolverFlags::from_bits(flags as u32)
    }

    fn filter_intersection_pair(&self, ctxt: &PairFilterContext) -> bool {
        let rb1 = ctxt
            .rigid_body1
            .map(|rb| JsValue::from(utils::flat_handle(rb.0)))
            .unwrap_or(JsValue::NULL);
        let rb2 = ctxt
            .rigid_body2
            .map(|rb| JsValue::from(utils::flat_handle(rb.0)))
            .unwrap_or(JsValue::NULL);

        self.filter_intersection_pair
            .bind2(
                &self.this,
                &JsValue::from(utils::flat_handle(ctxt.collider1.0)),
                &JsValue::from(utils::flat_handle(ctxt.collider2.0)),
            )
            .call2(&self.this, &rb1, &rb2)
            .ok()
            .and_then(|res| res.as_bool())
            .unwrap_or(false)
    }

    fn modify_solver_contacts(&self, ctxt: &mut ContactModificationContext) {
        let Some(modify_solver_contacts) = &self.modify_solver_contacts else {
            return;
        };
        let raw_context = RawContactModificationContext {
            collider1: utils::flat_handle(ctxt.collider1.0),
            collider2: utils::flat_handle(ctxt.collider2.0),
            rigid_body1: ctxt.rigid_body1.map(|rb| utils::flat_handle(rb.0)),
            rigid_body2: ctxt.rigid_body2.map(|rb| utils::flat_handle(rb.0)),
            manifold: ctxt.manifold as *const ContactManifold,
            solver_contacts: ctxt.solver_contacts as *mut Vec<SolverContact>,
            normal: ctxt.normal as *mut Vector<Real>,
            user_data: ctxt.user_data as *mut u32,
        };
        let _ = modify_solver_contacts.call1(&self.this, &JsValue::from(raw_context));
    }
}

#[wasm_bindgen]
pub struct RawContactModificationContext {
    collider1: FlatHandle,
    collider2: FlatHandle,
    rigid_body1: Option<FlatHandle>,
    rigid_body2: Option<FlatHandle>,
    manifold: *const ContactManifold,
    solver_contacts: *mut Vec<SolverContact>,
    normal: *mut Vector<Real>,
    user_data: *mut u32,
}

#[wasm_bindgen]
impl RawContactModificationContext {
    // Simple getters and setters for the fields.
    pub fn collider1(&self) -> FlatHandle {
        self.collider1
    }

    pub fn collider2(&self) -> FlatHandle {
        self.collider2
    }

    pub fn rigid_body1(&self) -> Option<FlatHandle> {
        self.rigid_body1
    }

    pub fn rigid_body2(&self) -> Option<FlatHandle> {
        self.rigid_body2
    }

    #[wasm_bindgen(getter)]
    pub fn normal(&self) -> RawVector {
        unsafe { RawVector(*self.normal) }
    }

    #[wasm_bindgen(setter)]
    pub fn set_normal(&mut self, normal: &RawVector) {
        unsafe {
            *self.normal = normal.0.into();
        }
    }

    #[wasm_bindgen(getter)]
    pub fn user_data(&self) -> u32 {
        unsafe { *self.user_data }
    }

    #[wasm_bindgen(setter)]
    pub fn set_user_data(&mut self, user_data: u32) {
        unsafe {
            *self.user_data = user_data;
        }
    }

    // Solver contacts manipulation methods.
    pub fn num_solver_contacts(&self) -> usize {
        unsafe { (*self.solver_contacts).len() }
    }

    pub fn clear_solver_contacts(&mut self) {
        unsafe { (*self.solver_contacts).clear() }
    }

    pub fn remove_solver_contact(&mut self, i: usize) {
        unsafe {
            if i < self.num_solver_contacts() {
                (*self.solver_contacts).swap_remove(i);
            }
        }
    }

    pub fn solver_contact_point(&self, i: usize) -> Option<RawVector> {
        unsafe {
            (&(*self.solver_contacts))
                .get(i)
                .map(|c| c.point.coords.into())
        }
    }

    pub fn set_solver_contact_point(&mut self, i: usize, pt: &RawVector) {
        unsafe {
            if let Some(c) = (&mut (*self.solver_contacts)).get_mut(i) {
                c.point = pt.0.into()
            }
        }
    }

    pub fn solver_contact_dist(&self, i: usize) -> Real {
        unsafe {
            (&(*self.solver_contacts))
                .get(i)
                .map(|c| c.dist)
                .unwrap_or(0.0)
        }
    }

    pub fn set_solver_contact_dist(&mut self, i: usize, dist: Real) {
        unsafe {
            if let Some(c) = (&mut (*self.solver_contacts)).get_mut(i) {
                c.dist = dist
            }
        }
    }

    pub fn solver_contact_friction(&self, i: usize) -> Real {
        unsafe { (&(*self.solver_contacts))[i].friction }
    }

    pub fn set_solver_contact_friction(&mut self, i: usize, friction: Real) {
        unsafe {
            if let Some(c) = (&mut (*self.solver_contacts)).get_mut(i) {
                c.friction = friction
            }
        }
    }

    pub fn solver_contact_restitution(&self, i: usize) -> Real {
        unsafe { (&(*self.solver_contacts))[i].restitution }
    }

    pub fn set_solver_contact_restitution(&mut self, i: usize, restitution: Real) {
        unsafe {
            if let Some(c) = (&mut (*self.solver_contacts)).get_mut(i) {
                c.restitution = restitution
            }
        }
    }

    pub fn solver_contact_tangent_velocity(&self, i: usize) -> RawVector {
        unsafe { (&(*self.solver_contacts))[i].tangent_velocity.into() }
    }

    pub fn set_solver_contact_tangent_velocity(&mut self, i: usize, vel: &RawVector) {
        unsafe {
            if let Some(c) = (&mut (*self.solver_contacts)).get_mut(i) {
                c.tangent_velocity = vel.0.into()
            }
        }
    }

    pub fn solver_contact_warmstart_impulse(&self, i: usize) -> Real {
        unsafe { (&(*self.solver_contacts))[i].warmstart_impulse }
    }

    pub fn set_solver_contact_warmstart_impulse(&mut self, i: usize, impulse: Real) {
        unsafe {
            if let Some(c) = (&mut (*self.solver_contacts)).get_mut(i) {
                c.warmstart_impulse = impulse
            }
        }
    }

    pub fn solver_contact_warmstart_tangent_impulse(&self, i: usize) -> Real {
        unsafe { (&(*self.solver_contacts))[i].warmstart_tangent_impulse.x }
    }

    pub fn set_solver_contact_warmstart_tangent_impulse(&mut self, i: usize, impulse: Real) {
        unsafe {
            if let Some(c) = (&mut (*self.solver_contacts)).get_mut(i) {
                c.warmstart_tangent_impulse.x = impulse;
            }
        }
    }

    pub fn solver_contact_warmstart_twist_impulse(&self, i: usize) -> Real {
        unsafe { (&(*self.solver_contacts))[i].warmstart_twist_impulse }
    }

    pub fn set_solver_contact_warmstart_twist_impulse(&mut self, i: usize, impulse: Real) {
        unsafe {
            if let Some(c) = (&mut (*self.solver_contacts)).get_mut(i) {
                c.warmstart_twist_impulse = impulse
            }
        }
    }

    pub fn solver_contact_is_new(&self, i: usize) -> bool {
        unsafe { (&(*self.solver_contacts))[i].is_new == 1.0 }
    }

    pub fn set_solver_contact_is_new(&mut self, i: usize, is_new: bool) {
        unsafe {
            if let Some(c) = (&mut (*self.solver_contacts)).get_mut(i) {
                c.is_new = if is_new { 1.0 } else { 0.0 };
            }
        }
    }

    #[wasm_bindgen(getter)]
    pub fn contact_manifold(&self) -> RawContactManifold {
        RawContactManifold(self.manifold)
    }

    /// Helper function to update `self` to emulate a oneway-platform.
    ///
    /// Duplicated from ContactModificationContext::update_as_oneway_platform
    pub fn update_as_oneway_platform(&mut self, allowed_local_n1: &RawVector, allowed_angle: Real) {
        const CONTACT_CONFIGURATION_UNKNOWN: u32 = 0;
        const CONTACT_CURRENTLY_ALLOWED: u32 = 1;
        const CONTACT_CURRENTLY_FORBIDDEN: u32 = 2;

        let cang = ComplexField::cos(allowed_angle);

        // Test the allowed normal with the local-space contact normal that
        // points towards the exterior of context.collider1.
        unsafe {
            let contact_is_ok = (*self.manifold).local_n1.dot((&allowed_local_n1.0).into()) >= cang;

            match *self.user_data {
                CONTACT_CONFIGURATION_UNKNOWN => {
                    if contact_is_ok {
                        // The contact is close enough to the allowed normal.
                        *self.user_data = CONTACT_CURRENTLY_ALLOWED;
                    } else {
                        // The contact normal isn't close enough to the allowed
                        // normal, so remove all the contacts and mark further contacts
                        // as forbidden.
                        (&mut (*self.solver_contacts)).clear();

                        // NOTE: in some very rare cases `local_n1` will be
                        // zero if the objects are exactly touching at one point.
                        // So in this case we can't really conclude.
                        // If the norm is non-zero, then we can tell we need to forbid
                        // further contacts. Otherwise we have to wait for the next frame.
                        if (*self.manifold).local_n1.norm_squared() > 0.1 {
                            *self.user_data = CONTACT_CURRENTLY_FORBIDDEN;
                        }
                    }
                }
                CONTACT_CURRENTLY_FORBIDDEN => {
                    // Contacts are forbidden so we need to continue forbidding contacts
                    // until all the contacts are non-penetrating again. In that case, if
                    // the contacts are OK with respect to the contact normal, then we can
                    // mark them as allowed.
                    if contact_is_ok && (&mut (*self.solver_contacts)).iter().all(|c| c.dist > 0.0)
                    {
                        *self.user_data = CONTACT_CURRENTLY_ALLOWED;
                    } else {
                        // Discard all the contacts.
                        (&mut (*self.solver_contacts)).clear();
                    }
                }
                CONTACT_CURRENTLY_ALLOWED => {
                    // We allow all the contacts right now. The configuration becomes
                    // uncertain again when the contact manifold no longer contains any contact.
                    if (&mut (*self.solver_contacts)).is_empty() {
                        *self.user_data = CONTACT_CONFIGURATION_UNKNOWN;
                    }
                }
                _ => unreachable!(),
            }
        }
    }
}
