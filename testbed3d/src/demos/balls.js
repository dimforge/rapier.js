import {Vector, World, RigidBodyDesc, ColliderDesc, BodyStatus} from '@dimforge/rapier3d'

export function initWorld(RAW_RAPIER, testbed) {
    let gravity = new Vector(0.0, -9.81, 0.0);
    let world = new World(RAW_RAPIER, gravity);
    let bodies = new Array();
    let colliders = new Array();

    // Create Ground.
    let bodyDesc = new RigidBodyDesc(BodyStatus.Static);
    let body = world.createRigidBody(bodyDesc);
    let colliderDesc = ColliderDesc.cuboid(30.0, 1.0, 30.0);
    let collider = world.createCollider(colliderDesc, body.handle);
    bodies.push(body);
    colliders.push(collider);

    // Dynamic cubes.
    let rad = 0.5;
    let num = 10;
    let center = rad * num;
    let i, j, k;

    for (i = 0; i < num; ++i) {
        for (j = 0; j < num; ++j) {
            for (k = 0; k < num; ++k) {
                let x = i * rad * 2.2 - center;
                let y = j * rad * 2.2 + 10.0;
                let z = k * rad * 2.2 - center;

                // Create dynamic cube.
                let bodyDesc = new RigidBodyDesc(BodyStatus.Dynamic)
                    .withTranslation(new Vector(x, y, z));
                let body = world.createRigidBody(bodyDesc);
                let colliderDesc = ColliderDesc.ball(rad);
                let collider = world.createCollider(colliderDesc, body.handle);
                bodies.push(body);
                colliders.push(collider);
            }
        }
    }

    testbed.setWorld(world, bodies, colliders);
    let cameraPosition = {
        eye: {x: -42.24990257933313, y: 8.132848746272764, z: 18.552093649856243},
        target: {x: -0.0505, y: -0.4126, z: -0.0229}
    };
    testbed.lookAt(cameraPosition)
}