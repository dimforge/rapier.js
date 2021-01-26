function create_prismatic_joints(
    RAPIER,
    world,
    origin,
    num,
) {
    let rad = 0.4;
    let shift = 1.0;

    let groundDesc = RAPIER.RigidBodyDesc.newStatic()
        .setTranslation(origin.x, origin.y, origin.z);
    let currParent = world.createRigidBody(groundDesc);
    let colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
    world.createCollider(colliderDesc, currParent.handle);

    let i;
    let z;

    for (i = 0; i < num; ++i) {
        z = origin.z + (i + 1) * shift;
        let rigidBodyDesc = RAPIER.RigidBodyDesc.newDynamic()
            .setTranslation(origin.x, origin.y, z);
        let currChild = world.createRigidBody(rigidBodyDesc);
        let colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
        world.createCollider(colliderDesc, currChild.handle);

        let axis;

        if (i % 2 == 0) {
            axis = new RAPIER.Vector3(1.0, 1.0, 0.0);
        } else {
            axis = new RAPIER.Vector3(-1.0, 1.0, 0.0);
        }

        z = new RAPIER.Vector3(0.0, 0.0, 1.0);
        let prism = RAPIER.JointParams.prismatic(
            new RAPIER.Vector3(0.0, 0.0, 0.0),
            axis,
            z,
            new RAPIER.Vector3(0.0, 0.0, -shift),
            axis,
            z,
        );
        prism.limitsEnabled = true;
        prism.limits = [-2.0, 2.0];
        world.createJoint(prism, currParent, currChild);

        currParent = currChild;
    }
}


function create_revolute_joints(
    RAPIER,
    world,
    origin,
    num,
) {
    let rad = 0.4;
    let shift = 2.0;

    let groundDesc = RAPIER.RigidBodyDesc.newStatic()
        .setTranslation(origin.x, origin.y, 0.0);
    let currParent = world.createRigidBody(groundDesc);
    let colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
    world.createCollider(colliderDesc, currParent.handle);

    let i, k;
    let z;

    for (i = 0; i < num; ++i) {
        // Create four bodies.
        z = origin.z + i * shift * 2.0 + shift;

        let positions = [
            new RAPIER.Vector3(origin.x, origin.y, z),
            new RAPIER.Vector3(origin.x + shift, origin.y, z),
            new RAPIER.Vector3(origin.x + shift, origin.y, z + shift),
            new RAPIER.Vector3(origin.x, origin.y, z + shift),
        ];

        let parents = [currParent, currParent, currParent, currParent];

        for (k = 0; k < 4; ++k) {
            let rigidBodyDesc = RAPIER.RigidBodyDesc.newDynamic()
                .setTranslation(positions[k].x, positions[k].y, positions[k].z);
            let rigidBody = world.createRigidBody(rigidBodyDesc);
            let colliderDesc = new RAPIER.ColliderDesc.cuboid(rad, rad, rad);
            world.createCollider(colliderDesc, rigidBody.handle);

            parents[k] = rigidBody;
        }

        // Setup four joints.
        let o = new RAPIER.Vector3(0.0, 0.0, 0.0);
        let x = new RAPIER.Vector3(1.0, 0.0, 0.0);
        z = new RAPIER.Vector3(0.0, 0.0, 1.0);

        let revs = [
            RAPIER.JointParams.revolute(o, z, new RAPIER.Vector3(0.0, 0.0, -shift), z),
            RAPIER.JointParams.revolute(o, x, new RAPIER.Vector3(-shift, 0.0, 0.0), x),
            RAPIER.JointParams.revolute(o, z, new RAPIER.Vector3(0.0, 0.0, -shift), z),
            RAPIER.JointParams.revolute(o, x, new RAPIER.Vector3(shift, 0.0, 0.0), x),
        ];

        world.createJoint(revs[0], currParent, parents[0]);
        world.createJoint(revs[1], parents[0], parents[1]);
        world.createJoint(revs[2], parents[1], parents[2]);
        world.createJoint(revs[3], parents[2], parents[3]);

        currParent = parents[3];
    }
}


function create_fixed_joints(
    RAPIER,
    world,
    origin,
    num,
) {
    let rad = 0.4;
    let shift = 1.0;
    let i, k;
    let parents = [];

    for (k = 0; k < num; ++k) {
        for (i = 0; i < num; ++i) {
            let fk = k;
            let fi = i;

            // NOTE: the num - 2 test is to avoid two consecutive
            // fixed bodies. Because physx will crash if we add
            // a joint between these.
            let status;

            if (i == 0 && (k % 4 == 0 && k != num - 2 || k == num - 1)) {
                status = RAPIER.BodyStatus.Static;
            } else {
                status = RAPIER.BodyStatus.Dynamic;
            }

            let rigidBody = new RAPIER.RigidBodyDesc(status)
                .setTranslation(origin.x + fk * shift, origin.y, origin.z + fi * shift);
            let child = world.createRigidBody(rigidBody);
            let colliderDesc = RAPIER.ColliderDesc.ball(rad);
            world.createCollider(colliderDesc, child.handle);

            // Vertical joint.
            if (i > 0) {
                let parent = parents[parents.length - 1];
                let params = RAPIER.JointParams.fixed(
                    new RAPIER.Vector3(0.0, 0.0, 0.0),
                    new RAPIER.Quaternion(0.0, 0.0, 0.0, 1.0),
                    new RAPIER.Vector3(0.0, 0.0, -shift),
                    new RAPIER.Quaternion(0.0, 0.0, 0.0, 1.0),
                );

                world.createJoint(params, parent, child);
            }

            // Horizontal joint.
            if (k > 0) {
                let parent_index = parents.length - num;
                let parent = parents[parent_index];
                let params = RAPIER.JointParams.fixed(
                    new RAPIER.Vector3(0.0, 0.0, 0.0),
                    new RAPIER.Quaternion(0.0, 0.0, 0.0, 1.0),
                    new RAPIER.Vector3(-shift, 0.0, 0.0),
                    new RAPIER.Quaternion(0.0, 0.0, 0.0, 1.0),
                );

                world.createJoint(params, parent, child);
            }

            parents.push(child);
        }
    }
}


function create_ball_joints(
    RAPIER,
    world,
    num,
) {
    let rad = 0.4;
    let shift = 1.0;
    let i, k;
    let parents = [];

    for (k = 0; k < num; ++k) {
        for (i = 0; i < num; ++i) {
            let fk = k;
            let fi = i;

            let status;

            if (i == 0 && (k % 4 == 0 || k == num - 1)) {
                status = RAPIER.BodyStatus.Static;
            } else {
                status = RAPIER.BodyStatus.Dynamic;
            }

            let bodyDesc = new RAPIER.RigidBodyDesc(status)
                .setTranslation(fk * shift, 0.0, fi * shift);
            let child = world.createRigidBody(bodyDesc);
            let colliderDesc = RAPIER.ColliderDesc.ball(rad);
            world.createCollider(colliderDesc, child.handle);

            // Vertical joint.
            let o = new RAPIER.Vector3(0.0, 0.0, 0.0);

            if (i > 0) {
                let parent =
                    parents[parents.length - 1];
                let params = RAPIER.JointParams.ball(o, new RAPIER.Vector3(0.0, 0.0, -shift));
                world.createJoint(params, parent, child);
            }

            // Horizontal joint.
            if (k > 0) {
                let parent_index = parents.length - num;
                let parent = parents[parent_index];
                let params = RAPIER.JointParams.ball(o, new RAPIER.Vector3(-shift, 0.0, 0.0));
                world.createJoint(params, parent, child);
            }

            parents.push(child);
        }
    }
}


export function initWorld(RAPIER, testbed) {
    let gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
    let world = new RAPIER.World(gravity);

    create_prismatic_joints(
        RAPIER,
        world,
        new RAPIER.Vector3(20.0, 10.0, 0.0),
        5
    );
    create_fixed_joints(
        RAPIER,
        world,
        new RAPIER.Vector3(0.0, 10.0, 0.0),
        5
    );
    create_revolute_joints(
        RAPIER,
        world,
        new RAPIER.Vector3(20.0, 0.0, 0.0),
        3
    );
    create_ball_joints(RAPIER, world, 15);

    testbed.setWorld(world);
    let cameraPosition = {
        eye: {x: 15.0, y: 5.0, z: 42.0},
        target: {x: 13.0, y: 1.0, z: 1.0}
    };
    testbed.lookAt(cameraPosition)
}