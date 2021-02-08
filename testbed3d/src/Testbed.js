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

export class Testbed {
    constructor(RAPIER, builders, worker) {
        let backends = [
            "rapier",
            // "ammo.js",
            // "ammo.wasm",
            // "cannon.js",
            // "oimo.js",
            // PHYSX_BACKEND_NAME
        ];
        this.RAPIER = RAPIER;
        let parameters = new SimulationParameters(backends, builders);
        this.gui = new Gui(this, parameters);
        this.graphics = new Graphics();
        this.inhibitLookAt = false;
        this.parameters = parameters;
        this.worker = worker;
        this.demoToken = 0;
        this.mouse = {x: 0, y: 0};
        this.switchToDemo(builders.keys().next().value);

        this.worker.onmessage = msg => {
            if (!!msg.data && msg.data.token != this.demoToken) {
                // This messages comes from an older demo update loop
                // so we can stop the loop now.
                return;
            }

            let modifications;

            if (!!msg.data && msg.data.token == this.demoToken) {
                switch (msg.data.type) {
                    case 'collider.highlight':
                        this.graphics.highlightCollider(msg.data.handle);
                        return;
                    case 'colliders.setPositions':
                        this.graphics.updatePositions(msg.data.positions);
                        break;
                }
                this.gui.setTiming(msg.data.stepTime);
                this.gui.setDebugInfos(msg.data);
            }

            let now = new Date().getTime();
            let raycastMessage = this.raycastMessage();
            let timestepTimeMS = this.world.timestep * 1000 * 0.75;
            /// Don't step the physics world faster than the real world.
            if (now - this.lastMessageTime >= timestepTimeMS) {
                if (!!this.preTimestepAction && this.parameters.running) {
                    modifications = this.preTimestepAction();
                }
                let stepMessage = this.stepMessage(modifications);

                this.graphics.applyModifications(this.RAPIER, this.world, modifications);
                this.worker.postMessage(raycastMessage);
                this.worker.postMessage(stepMessage);
                this.lastMessageTime = now;
            } else {
                setTimeout(() => {
                    if (!!this.preTimestepAction && this.parameters.running) {
                        modifications = this.preTimestepAction();
                    }
                    let stepMessage = this.stepMessage(modifications);

                    this.graphics.applyModifications(this.RAPIER, this.world, modifications);
                    this.worker.postMessage(raycastMessage);
                    this.worker.postMessage(stepMessage);
                    this.lastMessageTime = new Date().getTime();
                }, timestepTimeMS - (now - this.lastMessageTime));
            }
        };

        window.addEventListener('mousemove', event => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = 1 - (event.clientY / window.innerHeight) * 2;
        });
    }

    raycastMessage() {
        let ray = this.graphics.rayAtMousePosition(this.mouse);
        return {
            type: 'castRay',
            token: this.demoToken,
            ray: ray
        };
    }

    stepMessage(modifications) {
        let res = {
            type: 'step',
            maxVelocityIterations: this.parameters.numVelocityIter,
            maxPositionIterations: this.parameters.numPositionIter,
            modifications: modifications,
            running: this.parameters.running || this.parameters.stepping,
            debugInfos: this.parameters.debugInfos
        };

        if (this.parameters.stepping) {
            this.parameters.running = false;
            this.parameters.stepping = false;
        }

        return res;
    }

    setpreTimestepAction(action) {
        this.preTimestepAction = action;
    }

    setWorld(world) {
        this.preTimestepAction = null;
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
            world: world.takeSnapshot(),
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