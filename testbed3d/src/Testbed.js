import {Graphics} from './Graphics'
import {Gui} from './Gui'
import md5 from "md5";

class SimulationParameters {
    constructor(backends, builders) {
        this.backend = 'rapier';
        this.prevBackend = 'rapier';
        this.demo = 'collision groups';
        this.numVelocityIter = 4;
        this.numPositionIter = 1;
        this.running = true;
        this.stepping = false;
        this.debugRender = false;
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
        this.events = new RAPIER.EventQueue(true);
        this.switchToDemo(builders.keys().next().value);

        // this.worker.onmessage = msg => {
        //     if (!!msg.data && msg.data.token != this.demoToken) {
        //         // This messages comes from an older demo update loop
        //         // so we can stop the loop now.
        //         return;
        //     }
        //
        //     let modifications;
        //
        //     if (!!msg.data && msg.data.token == this.demoToken) {
        //         switch (msg.data.type) {
        //             case 'collider.highlight':
        //                 this.graphics.highlightCollider(msg.data.handle);
        //                 return;
        //             case 'colliders.setPositions':
        //                 this.graphics.updatePositions(msg.data.positions);
        //                 break;
        //         }
        //         this.gui.setTiming(msg.data.stepTime);
        //         this.gui.setDebugInfos(msg.data);
        //     }
        //
        //     let now = new Date().getTime();
        //     let raycastMessage = this.raycastMessage();
        //     let timestepTimeMS = this.world.timestep * 1000 * 0.75;
        //     /// Don't step the physics world faster than the real world.
        //     if (now - this.lastMessageTime >= timestepTimeMS) {
        //         if (!!this.preTimestepAction && this.parameters.running) {
        //             modifications = this.preTimestepAction();
        //         }
        //         let stepMessage = this.stepMessage(modifications);
        //
        //         this.graphics.applyModifications(this.RAPIER, this.world, modifications);
        //         this.worker.postMessage(raycastMessage);
        //         this.worker.postMessage(stepMessage);
        //         this.lastMessageTime = now;
        //     } else {
        //         setTimeout(() => {
        //             if (!!this.preTimestepAction && this.parameters.running) {
        //                 modifications = this.preTimestepAction();
        //             }
        //             let stepMessage = this.stepMessage(modifications);
        //
        //             this.graphics.applyModifications(this.RAPIER, this.world, modifications);
        //             this.worker.postMessage(raycastMessage);
        //             this.worker.postMessage(stepMessage);
        //             this.lastMessageTime = new Date().getTime();
        //         }, timestepTimeMS - (now - this.lastMessageTime));
        //     }
        // };

        window.addEventListener('mousemove', event => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = 1 - (event.clientY / window.innerHeight) * 2;
        });
    }

    // raycastMessage() {
    //     let ray = this.graphics.rayAtMousePosition(this.mouse);
    //     return {
    //         type: 'castRay',
    //         token: this.demoToken,
    //         ray: ray
    //     };
    // }

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
        this.stepId = 0;

        this.parameters.prevBackend = this.parameters.backend;
        this.parameters.builders.get(demo)(this.RAPIER, this);
    }

    switchToBackend(backend) {
        this.otherWorld = undefined;
        this.switchToDemo(this.parameters.demo);
    }

    takeSnapshot() {
        this.snap = this.world.takeSnapshot();
    }

    restoreSnapshot() {
        if (!!this.snap) {
            this.world.free();
            this.world = this.RAPIER.World.restoreSnapshot(this.snap);
        }
    }

    run() {
        if (this.parameters.running || this.parameters.stepping) {
            this.world.maxVelocityIterations = this.parameters.numVelocityIter;
            this.world.maxPositionIterations = this.parameters.numPositionIter;

            if (!!this.preTimestepAction) {
                this.preTimestepAction(this.graphics);
            }

            let t0 = new Date().getTime();
            this.world.step(this.events);
            this.gui.setTiming(new Date().getTime() - t0);
            this.stepId += 1;

            if (!!this.parameters.debugInfos) {
                let t0 = performance.now();
                let snapshot = this.world.takeSnapshot();
                let t1 = performance.now();
                let snapshotTime = t1 - t0;

                let debugInfos = {
                    token: this.demoToken,
                    stepId: this.stepId,
                };
                t0 = performance.now();
                debugInfos.worldHash = md5(snapshot);
                t1 = performance.now();
                let worldHashTime = t1 - t0;

                debugInfos.worldHashTime = worldHashTime;
                debugInfos.snapshotTime = snapshotTime;

                this.gui.setDebugInfos(debugInfos);
            }
        }


        if (this.parameters.stepping) {
            this.parameters.running = false;
            this.parameters.stepping = false;
        }

        this.gui.stats.begin();
        this.graphics.render(this.world, this.parameters.debugRender);
        this.gui.stats.end();

        requestAnimationFrame(() => this.run());
    }
}