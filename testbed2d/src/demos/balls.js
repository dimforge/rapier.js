export function initWorld(RAPIER, testbed) {
    let world = new RAPIER.World(0.0, -9.81);
    let bodies = new Array();
    let colliders = new Array();

    // Create Ground.
    let bodyDesc = new RAPIER.RigidBodyDesc("static");
    let body = world.createRigidBody(bodyDesc);
    let colliderDesc = RAPIER.ColliderDesc.cuboid(30.0, 1.0);
    let collider = body.createCollider(colliderDesc);
    bodies.push(body);
    colliders.push(collider);

    // Dynamic cubes.
    let rad = 0.5;
    let num = 50;
    let center = rad * num;
    let i, j, k;

    for (i = 0; i < num; ++i) {
        for (j = 0; j < num; ++j) {
            let x = i * rad * 2.2 - center;
            let y = j * rad * 2.2 + 10.0;

            // Create dynamic cube.
            let bodyDesc = new RAPIER.RigidBodyDesc("dynamic");
            bodyDesc.setTranslation(x, y);
            let body = world.createRigidBody(bodyDesc);
            let colliderDesc = RAPIER.ColliderDesc.ball(rad);
            colliderDesc.density = 1.0;
            let collider = body.createCollider(colliderDesc);
            bodies.push(body);
            colliders.push(collider);
        }
    }

    testbed.setWorld(world, bodies, colliders);
    testbed.lookAt({
        target: { x: -10.0, y: -15.0 },
        zoom: 10.0
    });
}