export function init_world(Rapier, testbed) {
    let world = new Rapier.World(0.0, -9.81, 0.0);
    let bodies = new Array();
    let colliders = new Array();

    // Create Ground.
    let body_desc = new Rapier.RigidBodyDesc("static");
    let body = world.create_rigid_body(body_desc);
    let collider_desc = Rapier.ColliderDesc.cuboid(30.0, 1.0, 30.0);
    let collider = body.create_collider(collider_desc);
    bodies.push(body);
    colliders.push(collider);

    // Dynamic cubes.
    let rad = 0.5;
    let num = 12;
    let center = rad * num;
    let i, j, k;

    for (i = 0; i < num; ++i) {
        for (j = 0; j < num; ++j) {
            for (k = 0; k < num; ++k) {
                let x = i * rad * 2.2 - center;
                let y = j * rad * 2.2 + 10.0;
                let z = k * rad * 2.2 - center;

                // Create dynamic cube.
                let body_desc = new Rapier.RigidBodyDesc("dynamic");
                body_desc.set_translation(x, y, z);
                let body = world.create_rigid_body(body_desc);
                let collider_desc = Rapier.ColliderDesc.ball(rad);
                collider_desc.density = 1.0;
                let collider = body.create_collider(collider_desc);
                bodies.push(body);
                colliders.push(collider);
            }
        }
    }

    testbed.setWorld(world, bodies, colliders);
    let cameraPosition = {
        eye: { x: -42.24990257933313, y: 8.132848746272764, z: 18.552093649856243 },
        target: { x: -0.0505, y: -0.4126, z: -0.0229 }
    };
    testbed.lookAt(cameraPosition)
}