import {PhysicsModifications} from "../PhysicsModifications"
import seedrandom from 'seedrandom'

function generateTriMesh(nsubdivs, wx, wy, wz) {
    let vertices = [];
    let indices = [];

    let elementWidth = 1.0 / nsubdivs;
    let rng = seedrandom('trimesh');

    let i, j;
    for (i = 0; i <= nsubdivs; ++i) {
        for (j = 0; j <= nsubdivs; ++j) {
            let x = (j * elementWidth - 0.5) * wx;
            let y = rng() * wy;
            let z = (i * elementWidth - 0.5) * wz;

            vertices.push(x, y, z);
        }
    }

    for (i = 0; i < nsubdivs; ++i) {
        for (j = 0; j < nsubdivs; ++j) {
            let i1 = (i + 0) * (nsubdivs + 1) + (j + 0);
            let i2 = (i + 0) * (nsubdivs + 1) + (j + 1);
            let i3 = (i + 1) * (nsubdivs + 1) + (j + 0);
            let i4 = (i + 1) * (nsubdivs + 1) + (j + 1);

            indices.push(i1, i3, i2);
            indices.push(i3, i4, i2);
        }
    }

    return {
        vertices: new Float32Array(vertices),
        indices: new Uint32Array(indices),
    }
}

export function initWorld(RAPIER, testbed) {
    let gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
    let world = new RAPIER.World(gravity);

    // Create Ground.
    let bodyDesc = RAPIER.RigidBodyDesc.newStatic();
    let body = world.createRigidBody(bodyDesc);
    let trimesh = generateTriMesh(20, 40.0, 4.0, 40.0)
    let colliderDesc = RAPIER.ColliderDesc.trimesh(trimesh.vertices, trimesh.indices);
    world.createCollider(colliderDesc, body.handle);

    /*
     * Create the polyhedra
     */
    let num = 5;
    let scale = 2.0;
    let border_rad = 0.1;

    let shift = border_rad * 2.0 + scale;
    let centerx = shift * (num / 2);
    let centery = shift / 2.0;
    let centerz = shift * (num / 2);

    let rng = seedrandom('convexPolyhedron');
    let i, j, k, l;

    for (j = 0; j < 15; ++j) {
        for (i = 0; i < num; ++i) {
            for (k = 0; k < num; ++k) {
                let x = i * shift - centerx;
                let y = j * shift + centery + 3.0;
                let z = k * shift - centerz;

                let vertices = [];
                for (l = 0; l < 10; ++l) {
                    vertices.push(rng() * scale, rng() * scale, rng() * scale);
                }
                vertices = new Float32Array(vertices);

                // Build the rigid body.
                bodyDesc = RAPIER.RigidBodyDesc.newDynamic().setTranslation(x, y, z);
                body = world.createRigidBody(bodyDesc);
                colliderDesc = RAPIER.ColliderDesc.roundConvexHull(vertices, border_rad);
                world.createCollider(colliderDesc, body.handle);
            }
        }
    }

    testbed.setWorld(world);

    let cameraPosition = {
        eye: {x: -88.48024008669711, y: 46.911325612198354, z: 83.56055570254844},
        target: {x: 0.0, y: 0.0, z: 0.0}
    };
    testbed.lookAt(cameraPosition)
}