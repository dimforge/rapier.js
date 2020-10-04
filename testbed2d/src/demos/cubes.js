import {Vector, World, RigidBodyDesc, ColliderDesc, BodyStatus} from '@dimforge/rapier2d'

export function initWorld(RAPIER_CORE, testbed) {
    let gravity = new Vector(0.0, -9.81);
    let world = new World(RAPIER_CORE, gravity);
    let bodies = new Array();
    let colliders = new Array();

    // Create Ground.
    let groundSize = 40.0;
    let grounds = [
        {x: 0.0, y: 0.0, hx: groundSize, hy: 0.1},
        {x: -groundSize, y: groundSize * 2.0, hx: 0.1, hy: groundSize * 2.0},
        {x: groundSize, y: groundSize * 2.0, hx: 0.1, hy: groundSize * 2.0},
    ];

    grounds.forEach(ground => {
        let bodyDesc = new RigidBodyDesc(BodyStatus.Static)
            .setTranslation(new Vector(ground.x, ground.y));
        let body = world.createRigidBody(bodyDesc);
        let colliderDesc = ColliderDesc.cuboid(ground.hx, ground.hy);
        let collider = world.createCollider(colliderDesc, body.handle);
        bodies.push(body);
        colliders.push(collider);
    });

    // Dynamic cubes.
    let num = 20;
    let numy = 100;
    let rad = 1.0;

    let shift = rad * 2.0 + rad;
    let centerx = shift * (num / 2);
    let centery = shift / 2.0;
    let centerz = shift * (num / 2);

    let i, j, k;

    for (j = 0; j < numy; ++j) {
        for (i = 0; i < num; ++i) {
            let x = i * shift - centerx;
            let y = j * shift + centery + 3.0;

            // Create dynamic cube.
            let bodyDesc = new RigidBodyDesc(BodyStatus.Dynamic)
                .setTranslation(new Vector(x, y));
            let body = world.createRigidBody(bodyDesc);
            let colliderDesc = ColliderDesc.cuboid(rad, rad, rad);
            let collider = world.createCollider(colliderDesc, body.handle);
            bodies.push(body);
            colliders.push(collider);
        }
    }

    testbed.setWorld(world, bodies, colliders);
    testbed.lookAt({
        target: {x: -10.0, y: -30.0},
        zoom: 7.0
    });
}