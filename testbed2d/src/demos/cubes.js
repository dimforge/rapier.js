export function initWorld(RAPIER, testbed) {
    let world = new RAPIER.World(0.0, -9.81);
    let bodies = new Array();
    let colliders = new Array();

    // Create Ground.
    let bodyDesc = new RAPIER.RigidBodyDesc("static");
    let body = world.createRigidBody(bodyDesc);
    let colliderDesc = RAPIER.ColliderDesc.cuboid(100.0, 0.1);
    let collider = body.createCollider(colliderDesc);
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
            let x = i * shift - centerx + offset;
            let y = j * shift + centery + 3.0;

            // Create dynamic cube.
            let bodyDesc = new RAPIER.RigidBodyDesc("dynamic");
            bodyDesc.setTranslation(x, y);
            let body = world.createRigidBody(bodyDesc);
            let colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
            colliderDesc.density = 1.0;
            let collider = body.createCollider(colliderDesc);
            bodies.push(body);
            colliders.push(collider);
        }

        offset -= 0.05 * rad * (num - 1.0);
    }

    testbed.setWorld(world, bodies, colliders);
}