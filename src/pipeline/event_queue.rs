use rapier::crossbeam::channel::Receiver;
use rapier::geometry::{ContactEvent, IntersectionEvent};
use rapier::pipeline::ChannelEventCollector;
use wasm_bindgen::prelude::*;

/// A structure responsible for collecting events generated
/// by the physics engine.
#[wasm_bindgen]
pub struct RawEventQueue {
    pub(crate) collector: ChannelEventCollector,
    contact_events: Receiver<ContactEvent>,
    proximity_events: Receiver<IntersectionEvent>,
    pub(crate) auto_drain: bool,
}

// #[wasm_bindgen]
// /// The proximity state of a sensor collider and another collider.
// pub enum RawIntersection {
//     /// The sensor is intersecting the other collider.
//     Intersecting = 0,
//     /// The sensor is within tolerance margin of the other collider.
//     WithinMargin = 1,
//     /// The sensor is disjoint from the other collider.
//     Disjoint = 2,
// }

#[wasm_bindgen]
impl RawEventQueue {
    /// Creates a new event collector.
    ///
    /// # Parameters
    /// - `autoDrain`: setting this to `true` is strongly recommended. If true, the collector will
    /// be automatically drained before each `world.step(collector)`. If false, the collector will
    /// keep all events in memory unless it is manually drained/cleared; this may lead to unbounded use of
    /// RAM if no drain is performed.
    #[wasm_bindgen(constructor)]
    pub fn new(autoDrain: bool) -> Self {
        let contact_channel = rapier::crossbeam::channel::unbounded();
        let proximity_channel = rapier::crossbeam::channel::unbounded();
        let collector = ChannelEventCollector::new(proximity_channel.0, contact_channel.0);

        Self {
            collector,
            contact_events: contact_channel.1,
            proximity_events: proximity_channel.1,
            auto_drain: autoDrain,
        }
    }

    /// Applies the given javascript closure on each contact event of this collector, then clear
    /// the internal contact event buffer.
    ///
    /// # Parameters
    /// - `f(handle1, handle2, started)`:  JavaScript closure applied to each contact event. The
    /// closure should take three arguments: two integers representing the handles of the colliders
    /// involved in the contact, and a boolean indicating if the contact started (true) or stopped
    /// (false).
    pub fn drainContactEvents(&mut self, f: &js_sys::Function) {
        let this = JsValue::null();
        while let Ok(event) = self.contact_events.try_recv() {
            match event {
                ContactEvent::Started(co1, co2) => {
                    let h1 = co1.into_raw_parts().0 as u32;
                    let h2 = co2.into_raw_parts().0 as u32;
                    let _ = f.call3(
                        &this,
                        &JsValue::from(h1),
                        &JsValue::from(h2),
                        &JsValue::from_bool(true),
                    );
                }
                ContactEvent::Stopped(co1, co2) => {
                    let h1 = co1.into_raw_parts().0 as u32;
                    let h2 = co2.into_raw_parts().0 as u32;
                    let _ = f.call3(
                        &this,
                        &JsValue::from(h1),
                        &JsValue::from(h2),
                        &JsValue::from_bool(false),
                    );
                }
            }
        }
    }

    /// Applies the given javascript closure on each proximity event of this collector, then clear
    /// the internal proximity event buffer.
    ///
    /// # Parameters
    /// - `f(handle1, handle2, prev_prox, new_prox)`:  JavaScript closure applied to each proximity event. The
    /// closure should take four arguments: two integers representing the handles of the colliders
    /// involved in the proximity, and one boolean representing the intersection status.
    pub fn drainIntersectionEvents(&mut self, f: &js_sys::Function) {
        let this = JsValue::null();
        while let Ok(event) = self.proximity_events.try_recv() {
            let h1 = event.collider1.into_raw_parts().0 as u32;
            let h2 = event.collider2.into_raw_parts().0 as u32;
            let intersecting = event.intersecting;

            let _ = f
                .bind2(&this, &JsValue::from(h1), &JsValue::from(h2))
                .call1(&this, &JsValue::from(intersecting));
        }
    }

    /// Removes all events contained by this collector.
    pub fn clear(&self) {
        while let Ok(_) = self.contact_events.try_recv() {}
        while let Ok(_) = self.proximity_events.try_recv() {}
    }
}
