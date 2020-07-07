export function init_world(Rapier, testbed) {
    let world = new Rapier.World(0.0, -9.81, 0.0);
    let bodies = new Array();
    let colliders = new Array();

    // Create Ground.
    let body_desc = new Rapier.RigidBodyDesc("static");
    let body = world.create_rigid_body(body_desc);
    let collider_desc = Rapier.ColliderDesc.cuboid(100.0, 0.1, 100.0);
    let collider = body.create_collider(collider_desc);
    bodies.push(body);
    colliders.push(collider);

    // Dynamic cubes.
    let num = 8;
    let rad = 1.0;

    let shift = rad * 2.0 + rad;
    let centerx = shift * (num / 2);
    let centery = shift / 2.0;
    let centerz = shift * (num / 2);

    let offset = -num * (rad * 2.0 + rad) * 0.5;
    let i, j, k;

    for (j = 0; j < 30; ++j) {
        for (i = 0; i < num; ++i) {
            for (k = 0; k < num; ++k) {
                let x = i * shift - centerx + offset;
                let y = j * shift + centery + 3.0;
                let z = k * shift - centerz + offset;

                // Create dynamic cube.
                let body_desc = new Rapier.RigidBodyDesc("dynamic");
                body_desc.set_translation(x, y, z);
                let body = world.create_rigid_body(body_desc);
                let collider_desc = Rapier.ColliderDesc.cuboid(rad, rad, rad);
                collider_desc.density = 1.0;
                let collider = body.create_collider(collider_desc);
                bodies.push(body);
                colliders.push(collider);
            }
        }

        offset -= 0.05 * rad * (num - 1.0);
    }

    testbed.setWorld(world, bodies, colliders);
    let cameraPosition = {
        eye: { x: -88.48024008669711, y: 46.911325612198354, z: 83.56055570254844 },
        target: { x: -40.54730666382427, y: 12.208423050588094, z: -24.423676285239814 }
    };
    testbed.lookAt(cameraPosition)
}