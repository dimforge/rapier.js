export function init_world(RAPIER, testbed) {
    let world = new RAPIER.World(0.0, -9.81, 0.0);
    let bodies = new Array();
    let colliders = new Array();
    let joints = new Array();


    let rad = 0.4;
    let num = 3;
    let shift = 2.0;
    let i, j, k, l;

    for (l = 0; l < 5; ++l) {
        let y = l * shift * num * 3.0;

        for (j = 0; j < 25; ++j) {
            let x = j * shift * 4.0;

            let body_desc = new RAPIER.RigidBodyDesc("static");
            body_desc.set_translation(x, y, 0.0);
            let curr_parent = world.create_rigid_body(body_desc);

            let collider_desc = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
            let collider = curr_parent.create_collider(collider_desc);

            bodies.push(curr_parent);
            colliders.push(collider);

            for (i = 0; i < num; ++i) {
                // Create four bodies.
                let z = i * shift * 2.0 + shift;
                let positions = [
                    new RAPIER.Vector(x, y, z),
                    new RAPIER.Vector(x + shift, y, z),
                    new RAPIER.Vector(x + shift, y, z + shift),
                    new RAPIER.Vector(x, y, z + shift),
                ];

                let parents = [curr_parent, curr_parent, curr_parent, curr_parent];
                for (k = 0; k < 4; ++k) {
                    let density = 1.0;
                    let p = positions[k];
                    let body_desc = new RAPIER.RigidBodyDesc("dynamic");
                    body_desc.set_translation(p.x, p.y, p.z);
                    parents[k] = world.create_rigid_body(body_desc);

                    let collider_desc = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
                    collider_desc.density = density;
                    let collider = parents[k].create_collider(collider_desc);
                    bodies.push(parents[k]);
                    colliders.push(collider);
                }

                // Setup four joints.
                let o = new RAPIER.Vector(0.0, 0.0, 0.0);
                let x_axis = new RAPIER.Vector(1.0, 0.0, 0.0);
                let z_axis = new RAPIER.Vector(0.0, 0.0, 1.0);

                let revs = [
                    RAPIER.JointDesc.revolute(o, z_axis, new RAPIER.Vector(0.0, 0.0, -shift), z_axis),
                    RAPIER.JointDesc.revolute(o, x_axis, new RAPIER.Vector(-shift, 0.0, 0.0), x_axis),
                    RAPIER.JointDesc.revolute(o, z_axis, new RAPIER.Vector(0.0, 0.0, -shift), z_axis),
                    RAPIER.JointDesc.revolute(o, x_axis, new RAPIER.Vector(shift, 0.0, 0.0), x_axis),
                ];

                joints.push(world.create_joint(revs[0], curr_parent, parents[0]));
                joints.push(world.create_joint(revs[1], parents[0], parents[1]));
                joints.push(world.create_joint(revs[2], parents[1], parents[2]));
                joints.push(world.create_joint(revs[3], parents[2], parents[3]));

                curr_parent = parents[3];
            }
        }
    }

    testbed.setWorld(world, bodies, colliders, joints);
    let cameraPosition = {
        eye: { x: -51.470132013355254, y: 36.42820470562974, z: 101.86333640106977 },
        target: { x: 26.536430977264782, y: 30.320536835519317, z: 10.348050888417388 }
    };
    testbed.lookAt(cameraPosition)
}