import { CannonJSBackend /* , CannonESBackend */ } from "./CannonBackend";
import { AmmoJSBackend, AmmoWASMBackend } from "./AmmoBackend";
import { PhysXBackend } from "./PhysXBackend";
import { OimoBackend } from "./OimoBackend";
import { RapierBackend } from "./RapierBackend";

const PHYSX_BACKEND_NAME = "physx.release.wasm";

var interval = null;

export class Worker {
    constructor(postMessage) {
        this.postMessage = postMessage;
        this.backends = new Map([
            ["rapier", (w, b, c, j) => new RapierBackend(w, b, c, j)],
            ["ammo.js", (w, b, c, j) => new AmmoJSBackend(w, b, c, j)],
            ["ammo.wasm", (w, b, c, j) => new AmmoWASMBackend(w, b, c, j)],
            ["cannon.js", (w, b, c, j) => new CannonJSBackend(w, b, c, j)],
            // ["cannon-es", (w, b, c, j) => new CannonESBackend(w, b, c, j)], // FIXME: this does not work in a web worker?
            ["oimo.js", (w, b, c, j) => new OimoBackend(w, b, c, j)],
            [PHYSX_BACKEND_NAME, (w, b, c, j) => new PhysXBackend(w, b, c, j)]
        ]);
    }

    handleMessage(event) {
        switch (event.data.type) {
            case 'setWorld':
                this.token = event.data.token;
                let backend = this.backends.get(event.data.backend);
                this.world = null;
                this.world = backend(event.data.world, event.data.bodies, event.data.colliders, event.data.joints);
                break;
            case 'step':
                this.step(event.data);
                break;
        }
    }

    step(params) {
        if (!!this.world && params.running) {
            this.world.step(params.max_velocity_iterations, params.max_position_iterations);
        }

        if (!!this.world) {
            let pos = this.world.colliderPositions();

            if (!!pos)
                pos.token = this.token;

            postMessage(pos);
        }
    }
}

var worker = new Worker(postMessage);

onmessage = (event) => {
    worker.handleMessage(event);
};

// interval = setInterval(() => worker.mainLoop(), 1000.0 / 60.0);
