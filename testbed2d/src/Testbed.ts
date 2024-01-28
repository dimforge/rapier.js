import {Graphics} from "./Graphics";
import {Gui} from "./Gui";
import type {DebugInfos} from "./Gui";
import * as md5 from "md5";
import type * as RAPIER from "@dimforge/rapier2d";

type RAPIER_API = typeof import("@dimforge/rapier2d");

type Builders = Map<string, (RAPIER: RAPIER_API, testbed: Testbed) => void>;

class SimulationParameters {
    backend: string;
    prevBackend: string;
    demo: string;
    numSolverIters: number;
    running: boolean;
    stepping: boolean;
    debugRender: boolean;
    step: () => void;
    restart: () => void;
    takeSnapshot: () => void;
    restoreSnapshot: () => void;
    backends: Array<string>;
    builders: Builders;
    debugInfos: boolean;

    constructor(backends: Array<string>, builders: Builders) {
        this.backend = "rapier";
        this.prevBackend = "rapier";
        this.demo = "collision groups";
        this.numSolverIters = 4;
        this.running = true;
        this.stepping = false;
        this.debugRender = false;
        this.step = function () {};
        this.restart = function () {};
        this.takeSnapshot = function () {};
        this.restoreSnapshot = function () {};
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
    lastMessageTime: number;
    snap: Uint8Array;
    snapStepId: number;

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
        document.onkeyup = null;
        document.onkeydown = null;
        this.preTimestepAction = null;
        this.world = world;
        this.world.numSolverIterations = this.parameters.numSolverIters;
        this.demoToken += 1;
        this.stepId = 0;
        this.gui.resetTiming();

        world.forEachCollider((coll) => {
            this.graphics.addCollider(this.RAPIER, world, coll);
        });

        this.lastMessageTime = new Date().getTime();
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
        this.stepId = 0;

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
        if (this.parameters.running || this.parameters.stepping) {
            this.world.numSolverIterations = this.parameters.numSolverIters;

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
