import {CannonJSBackend /* , CannonESBackend */} from "./CannonBackend";
import {AmmoJSBackend, AmmoWASMBackend} from "./AmmoBackend";
import {PhysXBackend} from "./PhysXBackend";
import {OimoBackend} from "./OimoBackend";
import {RapierBackend} from "./RapierBackend";
import crc32 from 'buffer-crc32'

const RAPIER = import('@dimforge/rapier3d');
var interval = null;

export class Worker {
    constructor(postMessage) {
        this.stepId = 0;
        this.postMessage = postMessage;
        this.backends = new Map([
            ["rapier", (R, w, b, c, j) => new RapierBackend(R, w, b, c, j)],
            ["ammo.js", (R, w, b, c, j) => new AmmoJSBackend(R, w, b, c, j)],
            ["ammo.wasm", (R, w, b, c, j) => new AmmoWASMBackend(R, w, b, c, j)],
            ["cannon.js", (R, w, b, c, j) => new CannonJSBackend(R, w, b, c, j)],
            // ["cannon-es", (R, w, b, c, j) => new CannonESBackend(R, w, b, c, j)], // FIXME: this does not work in a web worker?
            ["oimo.js", (R, w, b, c, j) => new OimoBackend(R, w, b, c, j)],
            ["physx.release.wasm", (R, w, b, c, j) => new PhysXBackend(R, w, b, c, j)]
        ]);
    }

    handleMessage(event) {
        switch (event.data.type) {
            case 'setWorld':
                this.snapshot = undefined;
                this.token = event.data.token;
                let backend = this.backends.get(event.data.backend);
                if (!!this.backend)
                    this.backend.free();

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
            case 'castRay':
                this.castRay(event.data);
                break;
        }
    }

    castRay(params) {
        if (!!this.backend && !!this.backend.castRay) {
            let hit = this.backend.castRay(params.ray);
            postMessage({
                token: params.token,
                type: "collider.highlight",
                handle: !!hit ? hit.colliderHandle : null,
            });
        }
    }

    step(params) {
        if (!!this.backend && params.running) {
            this.backend.applyModifications(params.modifications);
            let ok = this.backend.step(params.maxVelocityIterations, params.maxPositionIterations);
            if (ok)
                this.stepId += 1;
        }

        if (!!this.backend) {
            let pos = this.backend.colliderPositions();

            if (!!pos) {
                pos.type = "colliders.setPositions";
                pos.token = this.token;
                pos.stepId = this.stepId;

                if (!!params.debugInfos) {
                    if (!!this.backend.worldHash) {

                        let t0 = performance.now();
                        let snapshot = this.backend.takeSnapshot();
                        let t1 = performance.now();
                        let snapshotTime = t1 - t0;

                        t0 = performance.now();
                        pos.worldHash = crc32(new Buffer(snapshot));
                        t1 = performance.now();
                        let worldHashTime = t1 - t0;

                        pos.worldHashTime = worldHashTime;
                        pos.snapshotTime = snapshotTime;
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
