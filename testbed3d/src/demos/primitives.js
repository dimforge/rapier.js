export function initWorld(RAPIER, testbed) {
    let gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
    let world = new RAPIER.World(gravity);
    let bodies = new Array();
    let colliders = new Array();

    // Create Ground.
    let bodyDesc = new RAPIER.RigidBodyDesc(RAPIER.BodyStatus.Static);
    let body = world.createRigidBody(bodyDesc);
    let colliderDesc = RAPIER.ColliderDesc.cuboid(100.0, 0.1, 100.0);
    let collider = world.createCollider(colliderDesc, body.handle);
    bodies.push(body);
    colliders.push(collider);

    // Dynamic cubes.
    let num = 8;
    let numy = 10;
    let rad = 1.0;

    let shift = rad * 2.0 + rad;
    let centerx = shift * (num / 2);
    let centery = shift / 2.0;
    let centerz = shift * (num / 2);

    let offset = -num * (rad * 2.0 + rad) * 0.5;
    let i, j, k;

    for (j = 0; j < numy; ++j) {
        for (i = 0; i < num; ++i) {
            for (k = 0; k < num; ++k) {
                let x = i * shift - centerx + offset;
                let y = j * shift + centery + 3.0;
                let z = k * shift - centerz + offset;

                // Create dynamic cube.
                let bodyDesc = new RAPIER.RigidBodyDesc(RAPIER.BodyStatus.Dynamic)
                    .setTranslation(new RAPIER.Vector3(x, y, z));
                let body = world.createRigidBody(bodyDesc);
                let colliderDesc;

                switch (j % 4) {
                    case 0:
                        colliderDesc
                            = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
                        break;
                    case 1:
                        colliderDesc
                            = RAPIER.ColliderDesc.ball(rad);
                        break;
                    case 2:
                        colliderDesc
                            = RAPIER.ColliderDesc.roundCylinder(rad, rad, rad / 10.0);
                        break;
                    case 3:
                        colliderDesc
                            = RAPIER.ColliderDesc.cone(rad, rad);
                        break;
                }

                let collider = world.createCollider(colliderDesc, body.handle);
                bodies.push(body);
                colliders.push(collider);
            }
        }

        offset -= 0.05 * rad * (num - 1.0);
    }

    testbed.setWorld(world, bodies, colliders);
    let cameraPosition = {
        eye: {x: -88.48024008669711, y: 46.911325612198354, z: 83.56055570254844},
        target: {x: -40.54730666382427, y: 12.208423050588094, z: -24.423676285239814}
    };
    testbed.lookAt(cameraPosition)
}