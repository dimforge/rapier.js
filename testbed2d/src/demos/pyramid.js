import {Vector, World, RigidBodyDesc, ColliderDesc, BodyStatus} from '@dimforge/rapier2d'

export function initWorld(RAPIER_CORE, testbed) {
    let gravity = new Vector(0.0, -9.81);
    let world = new World(RAPIER_CORE, gravity);
    let bodies = new Array();
    let colliders = new Array();

    // Create Ground.
    let bodyDesc = new RigidBodyDesc(BodyStatus.Static);
    let body = world.createRigidBody(bodyDesc);
    let colliderDesc = ColliderDesc.cuboid(50.0, 0.1);
    let collider = world.createCollider(colliderDesc, body.handle);
    bodies.push(body);
    colliders.push(collider);

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
            let bodyDesc = new RigidBodyDesc(BodyStatus.Dynamic)
                .setTranslation(new Vector(x, y));
            let body = world.createRigidBody(bodyDesc);
            let colliderDesc = ColliderDesc.cuboid(rad, rad);
            let collider = world.createCollider(colliderDesc, body.handle);
            bodies.push(body);
            colliders.push(collider);
        }
    }

    testbed.setWorld(world, bodies, colliders);
    testbed.lookAt({
        target: {x: -10.0, y: -15.0},
        zoom: 10.0
    });
}