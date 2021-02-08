import {Graphics} from './Graphics'
import {Gui} from './Gui'

const PHYSX_BACKEND_NAME = "physx.release.wasm";

class SimulationParameters {
    constructor(backends, builders) {
        this.backend = 'rapier';
        this.prevBackend = 'rapier';
        this.demo = 'collision groups';
        this.numVelocityIter = 4;
        this.numPositionIter = 1;
        this.running = true;
        this.stepping = false;
        this.step = function () {
        }
        this.restart = function () {
        }
        this.takeSnapshot = function () {
        }
        this.restoreSnapshot = function () {
        }
        this.backends = backends;
        this.builders = builders;
        this.debugInfos = false;
    }
}

function canSetPosIters(backend) {
    return backend == "rapier" || backend == "box2d.js" || backend == "box2d.wasm";
}

export class Testbed {
    constructor(RAPIER, builders, worker) {
        let backends = [
            "rapier",
            // "matter.js",
            // "planck.js",
            // "box2d.js",
            // "box2d.wasm"
        ];
        this.RAPIER = RAPIER;
        let parameters = new SimulationParameters(backends, builders);
        this.gui = new Gui(this, parameters);
        this.graphics = new Graphics();
        this.inhibitLookAt = false;
        this.parameters = parameters;
        this.worker = worker;
        this.demoToken = 0;
        this.switchToDemo(builders.keys().next().value);

        this.worker.onmessage = msg => {
            if (!!msg.data && msg.data.token != this.demoToken) {
                // This messages comes from an older demo update loop
                // so we can stop the loop now.
                return;
            }

            if (!!msg.data && msg.data.token == this.demoToken) {
                this.graphics.updatePositions(msg.data.positions);
                this.gui.setTiming(msg.data.stepTime);
                this.gui.setDebugInfos(msg.data);
            }

            let now = new Date().getTime();
            let stepMessage = this.stepMessage();
            ;
            let timestepTimeMS = this.world.timestep * 1000 * 0.75;

            /// Don't step the physics world faster than the real world.
            if (now - this.lastMessageTime >= timestepTimeMS) {
                this.worker.postMessage(stepMessage);
                this.lastMessageTime = now;
            } else {
                setTimeout(() => {
                    this.worker.postMessage(stepMessage);
                    this.lastMessageTime = new Date().getTime();
                }, timestepTimeMS - (now - this.lastMessageTime));
            }
        };
    }

    stepMessage() {
        let res = {
            type: 'step',
            maxVelocityIterations: this.parameters.numVelocityIter,
            maxPositionIterations: this.parameters.numPositionIter,
            running: this.parameters.running || this.parameters.stepping,
            debugInfos: this.parameters.debugInfos
        };

        if (this.parameters.stepping) {
            this.parameters.running = false;
            this.parameters.stepping = false;
        }

        return res;
    }

    setWorld(world) {
        this.world = world;
        this.world.maxVelocityIterations = this.parameters.numVelocityIter;
        this.world.maxPositionIterations = this.parameters.numPositionIter;
        this.demoToken += 1;
        this.gui.resetTiming();

        world.forEachCollider(coll => {
            this.graphics.addCollider(this.RAPIER, world, coll);
        });

        let message = {
            type: 'setWorld',
            backend: this.parameters.backend,
            token: this.demoToken,
            world: world.takeSnapshot()
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

        // Initialize the other backend if it is enabled.
        switch (this.parameters.backend) {
            case 'rapier':
                this.otherWorld = undefined;
                break;
            default:
                break;
        }

        if (canSetPosIters(this.parameters.backend)) {
            this.gui.posIter.domElement.style.pointerEvents = "auto";
            this.gui.posIter.domElement.style.opacity = 1;
        } else {
            this.gui.posIter.domElement.style.pointerEvents = "none";
            this.gui.posIter.domElement.style.opacity = .5;
        }

        this.parameters.prevBackend = this.parameters.backend;
        this.parameters.builders.get(demo)(this.RAPIER, this);
    }

    switchToBackend(backend) {
        this.otherWorld = undefined;
        this.switchToDemo(this.parameters.demo);
    }

    takeSnapshot() {
        this.worker.postMessage({type: 'takeSnapshot'});
    }

    restoreSnapshot() {
        this.worker.postMessage({type: 'restoreSnapshot'});
    }

    run() {
        // if (this.parameters.running || this.parameters.stepping) {
        //     this.world.maxVelocityIterations = this.parameters.numVelocityIter;
        //     this.world.maxPositionIterations = this.parameters.numPositionIter;
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