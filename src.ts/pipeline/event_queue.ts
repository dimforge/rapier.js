import {RawEventQueue} from '../raw'
import {RigidBodyHandle} from '../dynamics'
import {ColliderHandle} from '../geometry'

/// Flags indicating what events are enabled for colliders.
export enum ActiveEvents {
    /// Enable intersection events.
    INTERSECTION_EVENTS = 0b0001,
    /// Enable contact events.
    CONTACT_EVENTS = 0b0010,
}

/**
 * A structure responsible for collecting events generated
 * by the physics engine.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `eventQueue.free()`
 * once you are done using it.
 */
export class EventQueue {
    raw: RawEventQueue

    /**
     * Creates a new event collector.
     *
     * @param autoDrain -setting this to `true` is strongly recommended. If true, the collector will
     * be automatically drained before each `world.step(collector)`. If false, the collector will
     * keep all events in memory unless it is manually drained/cleared; this may lead to unbounded use of
     * RAM if no drain is performed.
     */
    constructor(autoDrain: boolean, raw?: RawEventQueue) {
        this.raw = raw || new RawEventQueue(autoDrain);
    }

    /**
     * Release the WASM memory occupied by this event-queue.
     */
    public free() {
        this.raw.free();
        this.raw = undefined;
    }

    /**
     * Applies the given javascript closure on each contact event of this collector, then clear
     * the internal contact event buffer.
     *
     * @param f - JavaScript closure applied to each contact event. The
     * closure should take three arguments: two integers representing the handles of the colliders
     * involved in the contact, and a boolean indicating if the contact started (true) or stopped
     * (false).
     */
    public drainContactEvents(f: (handle1: ColliderHandle, handle2: ColliderHandle, started: boolean) => void) {
        this.raw.drainContactEvents(f)
    }

    /**
     * Applies the given javascript closure on each intersection event of this collector, then clear
     * the internal intersection event buffer.
     *
     * @param f - JavaScript closure applied to each intersection event. The
     * closure should take four arguments: two integers representing the handles of the colliders
     * involved in the intersection, and a boolean indicating if they started intersecting (true) or
     * stopped intersecting (false).
     */
    public drainIntersectionEvents(f: (handle1: ColliderHandle, handle2: ColliderHandle, intersecting: boolean) => void) {
        this.raw.drainIntersectionEvents(f)
    }

    /**
     * Removes all events contained by this collector
     */
    public clear() {
        this.raw.clear();
    }
}