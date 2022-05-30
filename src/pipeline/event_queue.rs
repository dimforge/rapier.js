use crate::utils;
use rapier::crossbeam::channel::Receiver;
use rapier::geometry::CollisionEvent;
use rapier::pipeline::ChannelEventCollector;
use wasm_bindgen::prelude::*;

/// A structure responsible for collecting events generated
/// by the physics engine.
#[wasm_bindgen]
pub struct RawEventQueue {
    pub(crate) collector: ChannelEventCollector,
    collision_events: Receiver<CollisionEvent>,
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
        let collision_channel = rapier::crossbeam::channel::unbounded();
        let collector = ChannelEventCollector::new(collision_channel.0);

        Self {
            collector,
            collision_events: collision_channel.1,
            auto_drain: autoDrain,
        }
    }

    /// Applies the given javascript closure on each collision event of this collector, then clear
    /// the internal collision event buffer.
    ///
    /// # Parameters
    /// - `f(handle1, handle2, started)`:  JavaScript closure applied to each collision event. The
    /// closure should take three arguments: two integers representing the handles of the colliders
    /// involved in the collision, and a boolean indicating if the collision started (true) or stopped
    /// (false).
    pub fn drainCollisionEvents(&mut self, f: &js_sys::Function) {
        let this = JsValue::null();
        while let Ok(event) = self.collision_events.try_recv() {
            match event {
                CollisionEvent::Started(co1, co2, _) => {
                    let h1 = utils::flat_handle(co1.0);
                    let h2 = utils::flat_handle(co2.0);
                    let _ = f.call3(
                        &this,
                        &JsValue::from(h1),
                        &JsValue::from(h2),
                        &JsValue::from_bool(true),
                    );
                }
                CollisionEvent::Stopped(co1, co2, _) => {
                    let h1 = utils::flat_handle(co1.0);
                    let h2 = utils::flat_handle(co2.0);
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

    /// Removes all events contained by this collector.
    pub fn clear(&self) {
        while let Ok(_) = self.collision_events.try_recv() {}
    }
}
