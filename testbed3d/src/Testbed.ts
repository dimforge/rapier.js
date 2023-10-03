import {Graphics} from "./Graphics";
import {Gui} from "./Gui";
import type {DebugInfos} from "./Gui";
import md5 from "md5";
import type * as RAPIER from "@dimforge/rapier3d";

type RAPIER_API = typeof import("@dimforge/rapier3d");

type Builders = Map<string, (RAPIER: RAPIER_API, testbed: Testbed) => void>;

class SimulationParameters {
    backend: string;
    prevBackend: string;
    demo: string;
    numVelocityIter: number;
    running: boolean;
    stepping: boolean;
    debugInfos: boolean;
    debugRender: boolean;
    step: () => void;
    restart: () => void;
    takeSnapshot: () => void;
    restoreSnapshot: () => void;
    backends: Array<string>;
    builders: Builders;

    constructor(backends: Array<string>, builders: Builders) {
        this.backend = "rapier";
        this.prevBackend = "rapier";
        this.demo = "collision groups";
        this.numVelocityIter = 4;
        this.running = true;
        this.stepping = false;
        this.debugRender = false;
        this.step = () => {};
        this.restart = () => {};
        this.takeSnapshot = () => {};
        this.restoreSnapshot = () => {};
        this.backends = backends;
        this.builders = builders;
        this.debugInfos = false;
    }
}

export class Testbed {
    RAPIER: RAPIER_API;
    gui: Gui;
    graphics: Graphics;
    inhibitLookAt: boolean;
    parameters: SimulationParameters;
    demoToken: number;
    mouse: {x: number; y: number};
    events: RAPIER.EventQueue;
    world: RAPIER.World;
    preTimestepAction?: (gfx: Graphics) => void;
    stepId: number;
    prevDemo: string;
    snap: Uint8Array;
    snapStepId: number;
    frameTime: number;
    accumulator: number;
    alpha: number;
    maxSubsteps: number;

    constructor(RAPIER: RAPIER_API, builders: Builders) {
        let backends = ["rapier"];
        this.RAPIER = RAPIER;
        let parameters = new SimulationParameters(backends, builders);
        this.gui = new Gui(this, parameters);
        this.graphics = new Graphics();
        this.inhibitLookAt = false;
        this.parameters = parameters;
        this.demoToken = 0;
        this.mouse = {x: 0, y: 0};
        this.events = new RAPIER.EventQueue(true);
        this.frameTime = 0;
        this.accumulator = 0;
        this.alpha = 0;
        this.maxSubsteps = 6;

        this.switchToDemo(builders.keys().next().value);

        window.addEventListener("mousemove", (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = 1 - (event.clientY / window.innerHeight) * 2;
        });
    }

    setpreTimestepAction(action: (gfx: Graphics) => void) {
        this.preTimestepAction = action;
    }

    setWorld(world: RAPIER.World) {
        document.onkeydown = null; // Reset key events.
        document.onkeyup = null; // Reset key events.

        this.preTimestepAction = null;
        this.world = world;
        this.world.maxVelocityIterations = this.parameters.numVelocityIter;
        this.demoToken += 1;
        this.stepId = 0;
        this.gui.resetTiming();

        world.forEachCollider((coll) => {
            this.graphics.addCollider(this.RAPIER, world, coll);
        });
    }

    lookAt(pos: Parameters<Graphics["lookAt"]>[0]) {
        if (!this.inhibitLookAt) {
            this.graphics.lookAt(pos);
        }

        this.inhibitLookAt = false;
    }

    switchToDemo(demo: string) {
        if (demo == this.prevDemo) {
            this.inhibitLookAt = true;
        }

        this.prevDemo = demo;
        this.graphics.reset();

        this.parameters.prevBackend = this.parameters.backend;
        this.parameters.builders.get(demo)(this.RAPIER, this);
    }

    switchToBackend(backend: string) {
        this.switchToDemo(this.parameters.demo);
    }

    takeSnapshot() {
        this.snap = this.world.takeSnapshot();
        this.snapStepId = this.stepId;
    }

    restoreSnapshot() {
        if (!!this.snap) {
            this.world.free();
            this.world = this.RAPIER.World.restoreSnapshot(this.snap);
            this.stepId = this.snapStepId;
        }
    }

    run() {
        let time = performance.now();
        let fixedStep = this.world.timestep;
        let deltaTime = (time - this.frameTime) / 1000;
        let substeps = 0;

        this.frameTime = time;
        this.accumulator += deltaTime;

        if (this.accumulator >= fixedStep && substeps < this.maxSubsteps) {
            this.accumulator -= fixedStep;
            substeps++;

            if (this.parameters.running || this.parameters.stepping) {
                this.world.maxVelocityIterations =
                    this.parameters.numVelocityIter;

                if (!!this.preTimestepAction) {
                    this.preTimestepAction(this.graphics);
                }

                let t = performance.now();
                this.world.step(this.events);
                this.gui.setTiming(performance.now() - t);
                this.stepId += 1;

                if (!!this.parameters.debugInfos) {
                    let t0 = performance.now();
                    let snapshot = this.world.takeSnapshot();
                    let t1 = performance.now();
                    let snapshotTime = t1 - t0;

                    let debugInfos: DebugInfos = {
                        token: this.demoToken,
                        stepId: this.stepId,
                        worldHash: "",
                        worldHashTime: 0,
                        snapshotTime: 0,
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

            this.accumulator = this.accumulator % fixedStep;
            this.alpha = this.accumulator / fixedStep;
        }

        if (this.parameters.stepping) {
            this.parameters.running = false;
            this.parameters.stepping = false;
        }

        this.gui.stats.begin();
        this.graphics.render(
            this.world,
            this.parameters.debugRender,
            this.alpha,
        );
        this.gui.stats.end();

        requestAnimationFrame(() => this.run());
    }
}
