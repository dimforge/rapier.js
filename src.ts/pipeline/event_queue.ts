import {RawEventQueue} from "../raw";
import {RigidBodyHandle} from "../dynamics";
import {Collider, ColliderHandle} from "../geometry";

/// Flags indicating what events are enabled for colliders.
export enum ActiveEvents {
    /// Enable collision events.
    COLLISION_EVENTS = 0b0001,
}

/**
 * A structure responsible for collecting events generated
 * by the physics engine.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `eventQueue.free()`
 * once you are done using it.
 */
export class EventQueue {
    raw: RawEventQueue;

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
     * Applies the given javascript closure on each collision event of this collector, then clear
     * the internal collision event buffer.
     *
     * @param f - JavaScript closure applied to each collision event. The
     * closure must take three arguments: two integers representing the handles of the colliders
     * involved in the collision, and a boolean indicating if the collision started (true) or stopped
     * (false).
     */
    public drainCollisionEvents(
        f: (
            handle1: ColliderHandle,
            handle2: ColliderHandle,
            started: boolean,
        ) => void,
    ) {
        this.raw.drainCollisionEvents(f);
    }

    /**
     * Removes all events contained by this collector
     */
    public clear() {
        this.raw.clear();
    }
}
