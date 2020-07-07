import { Graphics } from './Graphics'
import { Gui } from './Gui'

const PHYSX_BACKEND_NAME = "physx.release.wasm";

class SimulationParameters {
    constructor(backends, builders) {
        this.backend = 'rapier';
        this.prevBackend = 'rapier';
        this.demo = 'cubes';
        this.numVelocityIter = 4;
        this.numPositionIter = 1;
        this.running = true;
        this.stepping = false;
        this.step = function() {}
        this.restart = function() {}
        this.backends = backends;
        this.builders = builders;
    }
}

function extractWorldDescription(world, bodies, colliders, joints) {
    let meta_world = {
        max_velocity_iterations: world.max_velocity_iterations,
        max_position_iterations: world.max_position_iterations,
    };

    let meta_bodies = bodies.map(body => {
        let pos = body.translation();

        return {
            handle: body.handle(),
            type: body.body_type(),
            translation: { x: pos.x, y: pos.y, z: pos.z },
            mass: body.mass()
        };
    });

    let meta_colliders = colliders.map(coll => {
        let meta = {
            handle: coll.handle(),
            parent_handle: coll.parent_handle(),
            type: coll.shape_type(),
            radius: coll.radius(),
            density: coll.density(),
            friction: coll.friction(),
        };

        let he = coll.half_extents();
        if (!!he) {
            meta.half_extents = { x: he.x, y: he.y, z: he.z };
        }

        return meta;
    });

    let meta_joints = !joints ? [] : joints.map(joint => {
        let a1 = joint.anchor1();
        let a2 = joint.anchor2();
        let ax1 = joint.axis1() || { x: 0.0, y: 0.0, z: 0.0 };
        let ax2 = joint.axis2() || { x: 0.0, y: 0.0, z: 0.0 };
        let fx1 = joint.frame_x_1() || { x: 0.0, y: 0.0, z: 0.0, w: 1.0 };
        let fx2 = joint.frame_x_2() || { x: 0.0, y: 0.0, z: 0.0, w: 1.0 };

        return {
            handle1: joint.body_handle1(),
            handle2: joint.body_handle2(),
            type: joint.joint_type(),
            anchor1: { x: a1.x, y: a1.y, z: a1.z },
            anchor2: { x: a2.x, y: a2.y, z: a2.z },
            axis1: { x: ax1.x, y: ax1.y, z: ax1.z },
            axis2: { x: ax2.x, y: ax2.y, z: ax2.z },
            frame_x_1: { x: fx1.x, y: fx1.y, z: fx1.z, w: fx1.w },
            frame_x_2: { x: fx2.x, y: fx2.y, z: fx2.z, w: fx2.w },
        };
    });

    return {
        world: meta_world,
        bodies: meta_bodies,
        colliders: meta_colliders,
        joints: meta_joints,

    }
}

export class Testbed {
    constructor(Rapier, builders, worker) {
        let backends = [
            "rapier",
            "ammo.js",
            "ammo.wasm",
            "cannon.js",
            "oimo.js",
            PHYSX_BACKEND_NAME
        ];
        let parameters = new SimulationParameters(backends, builders);
        this.gui = new Gui(this, parameters);
        this.graphics = new Graphics();
        this.inhibitLookAt = false;
        this.parameters = parameters;
        this.worker = worker;
        this.rapier = Rapier;
        this.demoToken = 0;
        this.switchToDemo(builders.keys().next().value);

        this.worker.onmessage = msg => {
            if (!!msg.data && msg.data.token == this.demoToken) {
                this.graphics.updatePositions(msg.data.positions);
                this.gui.setTiming(msg.data.stepTime);
            }

            let now = new Date().getTime();
            let stepMessage = this.stepMessage();

            /// Don't step the physics world faster than the real world.
            if (now - this.lastMessageTime >= this.world.timestep * 1000) {
                this.worker.postMessage(stepMessage);
                this.lastMessageTime = now;
            } else {
                setTimeout(() => {
                    this.worker.postMessage(stepMessage);
                    this.lastMessageTime = new Date().getTime();
                }, now - this.lastMessageTime);
            }
        };
    }

    stepMessage() {
        let res = {
            type: 'step',
            max_velocity_iterations: this.parameters.numVelocityIter,
            max_position_iterations: this.parameters.numPositionIter,
            running: this.parameters.running || this.parameters.stepping,
        };

        if (this.parameters.stepping) {
            this.parameters.running = false;
            this.parameters.stepping = false;
        }

        return res;
    }

    setWorld(world, bodies, colliders, joints) {
        this.world = world;
        this.world.max_velocity_iterations = this.parameters.numVelocityIter;
        this.world.max_position_iterations = this.parameters.numPositionIter;
        this.demoToken += 1;
        this.bodies = bodies;
        this.colliders = colliders;
        this.joints = !!joints ? joints : new Array();
        this.gui.resetTiming();

        colliders.forEach((coll, i, arr) => {
            this.graphics.addCollider(coll);
        });

        let desc = extractWorldDescription(world, bodies, colliders, joints);
        let message = {
            type: 'setWorld',
            backend: this.parameters.backend,
            token: this.demoToken,
            ...desc,
        };
        this.worker.postMessage(message);
        this.worker.postMessage(this.stepMessage());
        this.lastMessageTime = new Date().getTime();
    }

    lookAt(pos) {
        if (!this.inhibitLookAt) {
            this.graphics.lookAt(pos)
        }

        this.inhibitLookAt = false;
    }

    switchToDemo(demo) {
        if (demo == this.prevDemo) {
            this.inhibitLookAt = true;
        }

        this.prevDemo = demo;
        this.graphics.reset();

        // TODO: the PhysX bindings don't allow the number of solver iterations to be modified yet.
        if (this.parameters.backend != PHYSX_BACKEND_NAME && this.parameters.prevBackend == PHYSX_BACKEND_NAME) {
            this.parameters.numVelocityIter = 4;
            this.parameters.numPositionIter = 1;
            this.gui.velIter.domElement.style.pointerEvents = "auto";
            this.gui.velIter.domElement.style.opacity = 1;
            this.gui.posIter.domElement.style.pointerEvents = "auto";
            this.gui.posIter.domElement.style.opacity = 1;
        }

        // Initialize the other backend if it is enabled.
        switch (this.parameters.backend) {
            case 'rapier':
                this.otherWorld = undefined;
                break;
            case PHYSX_BACKEND_NAME:
                this.parameters.numVelocityIter = 1;
                this.parameters.numPositionIter = 4;
                this.gui.velIter.domElement.style.pointerEvents = "none";
                this.gui.velIter.domElement.style.opacity = .5;
            default:
                break;
        }

        if (this.parameters.backend == "rapier") {
            this.gui.posIter.domElement.style.pointerEvents = "auto";
            this.gui.posIter.domElement.style.opacity = 1;
        } else {
            this.gui.posIter.domElement.style.pointerEvents = "none";
            this.gui.posIter.domElement.style.opacity = .5;
        }

        this.parameters.prevBackend = this.parameters.backend;
        this.parameters.builders.get(demo)(this.rapier, this);
    }

    switchToBackend(backend) {
        this.otherWorld = undefined;
        this.switchToDemo(this.parameters.demo);
    }

    run() {
        // if (this.parameters.running || this.parameters.stepping) {
        //     this.world.max_velocity_iterations = this.parameters.numVelocityIter;
        //     this.world.max_position_iterations = this.parameters.numPositionIter;
        // }
        //
        // if (this.parameters.stepping) {
        //     this.parameters.running = false;
        //     this.parameters.stepping = false;
        // }

        this.gui.stats.begin();
        this.graphics.render();
        this.gui.stats.end();

        requestAnimationFrame(() => this.run());
    }
}