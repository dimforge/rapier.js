import { MatterBackend } from "./MatterBackend";
import { RapierBackend } from "./RapierBackend";
import { Box2DJSBackend, Box2DWASMBackend } from "./Box2DBackend";
import { PlanckBackend } from "./PlanckBackend";

var interval = null;

export class Worker {
    constructor(postMessage) {
        this.stepId = 0;
        this.postMessage = postMessage;
        this.backends = new Map([
            ["rapier", (w, b, c, j) => new RapierBackend(w, b, c, j)],
            ["matter.js", (w, b, c, j) => new MatterBackend(w, b, c, j)],
            ["planck.js", (w, b, c, j) => new PlanckBackend(w, b, c, j)],
            ["box2d.js", (w, b, c, j) => new Box2DJSBackend(w, b, c, j)],
            ["box2d.wasm", (w, b, c, j) => new Box2DWASMBackend(w, b, c, j)],
            // ["cannon.js", (w, b, c, j) => new CannonJSBackend(w, b, c, j)],
            // ["oimo.js", (w, b, c, j) => new OimoBackend(w, b, c, j)],
            // ["physx.release.wasm", (w, b, c, j) => new PhysXBackend(w, b, c, j)]
        ]);
    }

    handleMessage(event) {
        switch (event.data.type) {
            case 'setWorld':
                this.snapshot = undefined;
                this.token = event.data.token;
                let backend = this.backends.get(event.data.backend);
                this.backend = null;
                this.backend = backend(event.data.world, event.data.bodies, event.data.colliders, event.data.joints);
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
        }
    }
}

var worker = new Worker(postMessage);

onmessage = (event) => {
    worker.handleMessage(event);
};
