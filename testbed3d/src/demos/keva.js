function build_block(
    Rapier,
    world,
    bodies,
    colliders,
    half_extents,
    shift,
    numx,
    numy,
    numz
) {
    let dimensions = [half_extents.xyz(), half_extents.zyx()];
    let block_width = 2.0 * half_extents.z * numx;
    let block_height = 2.0 * half_extents.y * numy;
    let spacing = (half_extents.z * numx - half_extents.x) / (numz - 1.0);

    let i;
    let j;
    let k;

    for (i = 0; i < numy; ++i) {
        [numx, numz] = [numz, numx];
        let dim = dimensions[i % 2];
        let y = dim.y * i * 2.0;

        for (j = 0; j < numx; ++j) {
            let x = i % 2 == 0 ? spacing * j * 2.0 : dim.x * j * 2.0;

            for (k = 0; k < numz; ++k) {
                let z = (i % 2) == 0 ? dim.z * k * 2.0 : spacing * k * 2.0;
                // Build the rigid body.
                let body_desc = new Rapier.RigidBodyDesc("dynamic");
                body_desc.set_translation(
                    x + dim.x + shift.x,
                    y + dim.y + shift.y,
                    z + dim.z + shift.z
                );
                let body = world.create_rigid_body(body_desc);
                let collider_desc = Rapier.ColliderDesc.cuboid(dim.x, dim.y, dim.z);
                collider_desc.density = 1.0;
                let collider = body.create_collider(collider_desc);
                bodies.push(body);
                colliders.push(collider);
            }
        }
    }

    // Close the top.
    let dim = half_extents.zxy();

    for (i = 0; i < block_width / (dim.x * 2.0); ++i) {
        for (j = 0; j < block_width / (dim.z * 2.0); ++j) {
            // Build the rigid body.
            let body_desc = new Rapier.RigidBodyDesc("dynamic");
            body_desc.set_translation(
                i * dim.x * 2.0 + dim.x + shift.x,
                dim.y + shift.y + block_height,
                j * dim.z * 2.0 + dim.z + shift.z,
            );
            let body = world.create_rigid_body(body_desc);
            let collider_desc = Rapier.ColliderDesc.cuboid(dim.x, dim.y, dim.z);
            collider_desc.density = 1.0;
            let collider = body.create_collider(collider_desc);
            bodies.push(body);
            colliders.push(collider);
        }
    }
}


export function init_world(Rapier, testbed) {
    let world = new Rapier.World(0.0, -9.81, 0.0);
    let bodies = new Array();
    let colliders = new Array();

    // Create Ground.
    let ground_size = 50.0;
    let ground_height = 0.1;
    let body_desc = new Rapier.RigidBodyDesc("static");
    body_desc.set_translation(0.0, -ground_height, 0.0);
    let body = world.create_rigid_body(body_desc);
    let collider_desc = Rapier.ColliderDesc.cuboid(ground_size, ground_height, ground_size);
    let collider = body.create_collider(collider_desc);
    bodies.push(body);
    colliders.push(collider);

    // Keva tower.
    let half_extents = new Rapier.Vector(0.1, 0.5, 2.0);
    let block_height = 0.0;
    // These should only be set to odd values otherwise
    // the blocks won't align in the nicest way.
    let numy_arr = [0, 3, 5, 5, 7, 9];
    let num_blocks_built = 0;
    let i;

    for (i = 5; i >= 1; --i) {
        let numx = i;
        let numy = numy_arr[i];
        let numz = numx * 3 + 1;
        let block_width = numx * half_extents.z * 2.0;
        build_block(
            Rapier,
            world,
            bodies,
            colliders,
            half_extents,
            new Rapier.Vector(-block_width / 2.0, block_height, -block_width / 2.0),
            numx,
            numy,
            numz,
        );
        block_height += numy * half_extents.y * 2.0 + half_extents.x * 2.0;
        num_blocks_built += numx * numy * numz;
    }

    testbed.setWorld(world, bodies, colliders);
    let cameraPosition = {
        eye: { x: -70.38553832116718, y: 17.893810295517365, z: 29.34767842147597 },
        target: { x: 0.5890869353464383, y: 3.132044603021203, z: -0.2899937806661885 }
    };
    testbed.lookAt(cameraPosition)
}