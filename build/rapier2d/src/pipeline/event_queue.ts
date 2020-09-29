import {RawEventQueue} from '@dimforge/raw-rapier2d'
import {RigidBodyHandle} from '../dynamics'
import {ColliderHandle} from '../geometry'

export enum Proximity {
    /// The sensor is intersecting the other collider.
    Intersecting = 0,
    /// The sensor is within tolerance margin of the other collider.
    WithinMargin = 1,
    /// The sensor is disjoint from the other collider.
    Disjoint = 2,
}

export class EventQueue {
    raw: RawEventQueue

    /// Creates a new event collector.
    ///
    /// # Parameters
    /// - `autoDrain`: setting this to `true` is strongly recommended. If true, the collector will
    /// be automatically drained before each `world.step(collector)`. If false, the collector will
    /// keep all events in memory unless it is manually drained/cleared; this may lead to unbounded use of
    /// RAM if no drain is performed.
    constructor(RAPIER: any, autoDrain: boolean, raw?: RawEventQueue) {
        this.raw = raw || new RAPIER.RawEventQueue(autoDrain);
    }

    public free() {
        this.raw.free();
        this.raw = undefined;
    }

    /// Applies the given javascript closure on each contact event of this collector, then clear
    /// the internal contact event buffer.
    ///
    /// # Parameters
    /// - `f(handle1, handle2, started)`:  JavaScript closure applied to each contact event. The
    /// closure should take three arguments: two integers representing the handles of the colliders
    /// involved in the contact, and a boolean indicating if the contact started (true) or stopped
    /// (false).
    public drainContactEvents(f: (handle1: ColliderHandle, handle2: ColliderHandle, started: boolean) => void) {
        this.raw.drainContactEvents(f)
    }

    /// Applies the given javascript closure on each proximity event of this collector, then clear
    /// the internal proximity event buffer.
    ///
    /// # Parameters
    /// - `f(handle1, handle2, prevProx, newProx)`:  JavaScript closure applied to each proximity event. The
    /// closure should take four arguments: two integers representing the handles of the colliders
    /// involved in the proximity, and two `Proximity` enums representing the previous proximity
    /// status and the new proximity status.
    public drainProximityEvents(f: (handle1: ColliderHandle, handle2: ColliderHandle, prevProx: Proximity, newProx: Proximity) => void) {
        this.raw.drainProximityEvents(f)
    }

    /// Removes all events contained by this collector.
    public clear() {
        this.raw.clear();
    }
}