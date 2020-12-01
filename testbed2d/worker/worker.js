import {MatterBackend} from "./MatterBackend";
import {RapierBackend} from "./RapierBackend";
import {Box2DJSBackend, Box2DWASMBackend} from "./Box2DBackend";
import {PlanckBackend} from "./PlanckBackend";

const RAPIER = import('@dimforge/rapier2d');
var interval = null;


export class Worker {
    constructor(postMessage) {
        this.stepId = 0;
        this.postMessage = postMessage;
        this.backends = new Map([
            ["rapier", (R, w, b, c, j) => new RapierBackend(R, w, b, c, j)],
            // ["matter.js", (R, w, b, c, j) => new MatterBackend(R, w, b, c, j)],
            // ["planck.js", (R, w, b, c, j) => new PlanckBackend(R, w, b, c, j)],
            // ["box2d.js", (R, w, b, c, j) => new Box2DJSBackend(R, w, b, c, j)],
            // ["box2d.wasm", (R, w, b, c, j) => new Box2DWASMBackend(R, w, b, c, j)],
        ]);
    }

    handleMessage(event) {
        switch (event.data.type) {
            case 'setWorld':
                this.snapshot = undefined;
                this.token = event.data.token;
                let backend = this.backends.get(event.data.backend);
                this.backend = null;
                RAPIER.then(R => {
                    this.backend = backend(R);
                    this.backend.restoreSnapshot(event.data.world);
                });
                this.stepId = 0;
                break;
            case 'step':
                this.step(event.data);
                break;
            case 'takeSnapshot':
                this.snapshot = this.backend.takeSnapshot();
                this.snapshotStepId = this.stepId;
                break;
            case 'restoreSnapshot':
                this.backend.restoreSnapshot(this.snapshot);
                this.stepId = this.snapshotStepId;
                break;
        }
    }

    step(params) {
        if (!!this.backend && params.running) {
            let ok = this.backend.step(params.maxVelocityIterations, params.maxPositionIterations);
            if (ok)
                this.stepId += 1;
        }

        if (!!this.backend) {
            let pos = this.backend.colliderPositions();

            if (!!pos) {
                pos.token = this.token;
                pos.stepId = this.stepId;

                if (!!params.debugInfos) {
                    if (!!this.backend.worldHash) {
                        pos.worldHash = this.backend.worldHash();
                    }
                }
            }

            postMessage(pos);
        } else {
            postMessage(null);
        }
    }
}

var worker = new Worker(postMessage);

onmessage = (event) => {
    worker.handleMessage(event);
};
