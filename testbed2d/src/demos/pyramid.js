export function initWorld(RAPIER, testbed) {
    let gravity = new RAPIER.Vector2(0.0, -9.81);
    let world = new RAPIER.World(gravity);

    // Create Ground.
    let bodyDesc = RAPIER.RigidBodyDesc.newStatic();
    let body = world.createRigidBody(bodyDesc);
    let colliderDesc = RAPIER.ColliderDesc.cuboid(50.0, 0.1);
    world.createCollider(colliderDesc, body.handle);

    // Dynamic cubes.
    let rad = 0.5;
    let num = 50;
    let i, j;
    let shift = rad * 2.0;
    let center = num * rad;
    let height = rad;

    for (i = 0; i < num; ++i) {
        for (j = i; j < num; ++j) {
            let x = (i * shift / 2.0) + (j - i) * shift - center;
            let y = i * shift + height;

            // Create dynamic cube.
            let bodyDesc = RAPIER.RigidBodyDesc.newDynamic()
                .setTranslation(x, y);
            let body = world.createRigidBody(bodyDesc);
            let colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad);
            world.createCollider(colliderDesc, body.handle);
        }
    }

    testbed.setWorld(world);
    testbed.lookAt({
        target: {x: -10.0, y: -15.0},
        zoom: 10.0
    });
}