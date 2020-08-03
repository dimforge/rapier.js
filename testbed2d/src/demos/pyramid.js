export function initWorld(RAPIER, testbed) {
    let world = new RAPIER.World(0.0, -9.81);
    let bodies = new Array();
    let colliders = new Array();

    // Create Ground.
    let bodyDesc = new RAPIER.RigidBodyDesc("static");
    let body = world.createRigidBody(bodyDesc);
    let colliderDesc = RAPIER.ColliderDesc.cuboid(30.0, 0.1);
    let collider = body.createCollider(colliderDesc);
    bodies.push(body);
    colliders.push(collider);

    // Dynamic cubes.
    let rad = 0.5;
    let num = 10;
    let i, j;
    let shift = rad * 2.5;
    let center = num * rad;
    let height = 25.0;

    for (i = 0; i < num; ++i) {
        for (j = i; j < num; ++j) {
            let x = (i * shift / 2.0) - height * rad - center;
            let y = i * shift + height;

            // Create dynamic cube.
            let bodyDesc = new RAPIER.RigidBodyDesc("dynamic");
            bodyDesc.setTranslation(x, y);
            let body = world.createRigidBody(bodyDesc);
            let colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad);
            colliderDesc.density = 1.0;
            let collider = body.createCollider(colliderDesc);
            bodies.push(body);
            colliders.push(collider);
        }
    }

    testbed.setWorld(world, bodies, colliders);
}