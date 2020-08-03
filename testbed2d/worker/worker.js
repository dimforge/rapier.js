// import { CannonJSBackend /* , CannonESBackend */ } from "./CannonBackend";
// import { AmmoJSBackend, AmmoWASMBackend } from "./AmmoBackend";
// import { PhysXBackend } from "./PhysXBackend";
// import { OimoBackend } from "./OimoBackend";
import { RapierBackend } from "./RapierBackend";

var interval = null;

export class Worker {
    constructor(postMessage) {
        this.stepId = 0;
        this.postMessage = postMessage;
        this.backends = new Map([
            ["rapier", (w, b, c, j) => new RapierBackend(w, b, c, j)],
            // ["ammo.js", (w, b, c, j) => new AmmoJSBackend(w, b, c, j)],
            // ["ammo.wasm", (w, b, c, j) => new AmmoWASMBackend(w, b, c, j)],
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
