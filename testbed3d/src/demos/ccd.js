function createWall(RAPIER, testbed, world, offset, stackHeight, ) {
    let i, j;

    let shiftY = 1.0;
    let shiftZ = 2.0;

    for (i = 0; i < stackHeight; ++i) {
        for (j = i; j < stackHeight; ++j) {
            let x = offset.x;
            let y = i * shiftY + offset.y;
            let z = (i * shiftZ / 2.0) + (j - i) * shiftZ + offset.z - stackHeight;

            // Create dynamic cube.
            let bodyDesc = RAPIER.RigidBodyDesc.newDynamic()
                .setTranslation(x, y, z);
            let body = world.createRigidBody(bodyDesc);
            let colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 1.0);
            world.createCollider(colliderDesc, body.handle);
        }
    }
}


export function initWorld(RAPIER, testbed) {
    let gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
    let world = new RAPIER.World(gravity);

    // Create Ground.
    let groundHeight = 0.1;
    let bodyDesc = RAPIER.RigidBodyDesc.newStatic();
    let body = world.createRigidBody(bodyDesc);
    let colliderDesc = RAPIER.ColliderDesc.cuboid(30.0, 0.1, 30.0);
    world.createCollider(colliderDesc, body.handle);

    let numX = 5;
    let numZ = 8;
    let shiftY = groundHeight + 0.5;

    let i;
    for (i = 0; i < numX; ++i) {
        let x = i * 6.0;
        createWall(RAPIER, testbed, world, {x: x, y: shiftY, z: 0.0}, numZ);
    }

    // A very fast rigid-body with CCD enabled.
    // Create dynamic cube.
    bodyDesc = RAPIER.RigidBodyDesc.newDynamic()
        .setTranslation(-20.0, shiftY + 2.0, 0.0)
        .setLinvel(1000.0, 0.0, 0.0)
        .setCcdEnabled(true);
    body = world.createRigidBody(bodyDesc);
    colliderDesc = RAPIER.ColliderDesc.ball(1.0)
        .setDensity(10.0);
    world.createCollider(colliderDesc, body.handle);


    testbed.setWorld(world);
    let cameraPosition = {
        eye: {x: -31.96000000000001, y: 19.730000000000008, z: -27.86},
        target: {x: -0.0505, y: -0.4126, z: -0.0229}
    };
    testbed.lookAt(cameraPosition)
}