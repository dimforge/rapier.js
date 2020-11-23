/*
fn create_prismatic_joints(
    bodies: &mut RigidBodySet,
    colliders: &mut ColliderSet,
    joints: &mut JointSet,
    origin: Point3<f32>,
    num: usize,
) {
    let rad = 0.4;
    let shift = 1.0;

    let ground = RigidBodyBuilder::new_static()
        .translation(origin.x, origin.y, origin.z)
        .build();
    let mut currParent = bodies.insert(ground);
    let collider = ColliderBuilder::cuboid(rad, rad, rad).build();
    colliders.insert(collider, currParent, bodies);

    for i in 0..num {
        let z = origin.z + (i + 1) as f32 * shift;
        let rigid_body = RigidBodyBuilder::new_dynamic()
            .translation(origin.x, origin.y, z)
            .build();
        let curr_child = bodies.insert(rigid_body);
        let collider = ColliderBuilder::cuboid(rad, rad, rad)
            .build();
        colliders.insert(collider, curr_child, bodies);

        let axis = if i % 2 == 0 {
            Unit::new_normalize(Vector3::new(1.0, 1.0, 0.0))
        } else {
            Unit::new_normalize(Vector3::new(-1.0, 1.0, 0.0))
        };

        let z = Vector3::z();
        let mut prism = PrismaticJoint::new(
            Point3::origin(),
                axis,
                z,
                Point3::new(0.0, 0.0, -shift),
                axis,
                z,
        );
        prism.limits_enabled = true;
        prism.limits[0] = -2.0;
        prism.limits[1] = 2.0;
        joints.insert(bodies, currParent, curr_child, prism);

        currParent = curr_child;
    }
}
*/

function create_revolute_joints(
    RAPIER,
    world,
    bodies,
    colliders,
    joints,
    origin,
    num,
) {
    let rad = 0.4;
    let shift = 2.0;

    let groundDesc = new RAPIER.RigidBodyDesc(RAPIER.BodyStatus.Static)
        .setTranslation(new RAPIER.Vector3(origin.x, origin.y, 0.0));
    let currParent = world.createRigidBody(groundDesc);
    let colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
    let collider = world.createCollider(colliderDesc, currParent.handle);
    bodies.push(currParent);
    colliders.push(collider);

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
            let rigidBodyDesc = new RAPIER.RigidBodyDesc(RAPIER.BodyStatus.Dynamic)
                .setTranslation(positions[k]);
            let rigidBody = world.createRigidBody(rigidBodyDesc);
            let colliderDesc = new RAPIER.ColliderDesc.cuboid(rad, rad, rad);
            let collider = world.createCollider(colliderDesc, rigidBody.handle);

            parents[k] = rigidBody;
            bodies.push(rigidBody);
            colliders.push(collider);
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

        joints.push(world.createJoint(revs[0], currParent, parents[0]));
        joints.push(world.createJoint(revs[1], parents[0], parents[1]));
        joints.push(world.createJoint(revs[2], parents[1], parents[2]));
        joints.push(world.createJoint(revs[3], parents[2], parents[3]));

        currParent = parents[3];
    }
}

/*
fn create_fixed_joints(
    bodies: &mut RigidBodySet,
    colliders: &mut ColliderSet,
    joints: &mut JointSet,
    origin: Point3<f32>,
    num: usize,
) {
    let rad = 0.4;
    let shift = 1.0;

    let mut parents = Vec::new();

    for k in 0..num {
        for i in 0..num {
            let fk = k as f32;
            let fi = i as f32;

            // NOTE: the num - 2 test is to avoid two consecutive
            // fixed bodies. Because physx will crash if we add
            // a joint between these.
            let status = if i == 0 && (k % 4 == 0 && k != num - 2 || k == num - 1) {
                BodyStatus::Static
            } else {
                BodyStatus::Dynamic
            };

            let rigid_body = RigidBodyBuilder::new(status)
                .translation(origin.x + fk * shift, origin.y, origin.z + fi * shift)
                .build();
            let childHandle = bodies.insert(rigid_body);
            let collider = ColliderBuilder::ball(rad).build();
            colliders.insert(collider, childHandle, bodies);

            // Vertical joint.
            if i > 0 {
                let parentHandle = *parents.last().unwrap();
                let joint = FixedJoint::new(
                    Isometry3::identity(),
                        Isometry3::translation(0.0, 0.0, -shift),
                );
                joints.insert(bodies, parentHandle, childHandle, joint);
            }

            // Horizontal joint.
            if k > 0 {
                let parent_index = parents.len() - num;
                let parentHandle = parents[parent_index];
                let joint = FixedJoint::new(
                    Isometry3::identity(),
                        Isometry3::translation(-shift, 0.0, 0.0),
                );
                joints.insert(bodies, parentHandle, childHandle, joint);
            }

            parents.push(childHandle);
        }
    }
}
*/

function create_ball_joints(
    RAPIER,
    world,
    bodies,
    colliders,
    joints,
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
                .setTranslation(new RAPIER.Vector3(fk * shift, 0.0, fi * shift));
            let child = world.createRigidBody(bodyDesc);
            let colliderDesc = RAPIER.ColliderDesc.ball(rad);
            let collider = world.createCollider(colliderDesc, child.handle);

            bodies.push(child);
            colliders.push(collider);

            // Vertical joint.
            let o = new RAPIER.Vector3(0.0, 0.0, 0.0);

            if (i > 0) {
                let parent =
                    parents[parents.length - 1];
                let params = RAPIER.JointParams.ball(o, new RAPIER.Vector3(0.0, 0.0, -shift));
                joints.push(world.createJoint(params, parent, child));
            }

            // Horizontal joint.
            if (k > 0) {
                let parent_index = parents.length - num;
                let parent = parents[parent_index];
                let params = RAPIER.JointParams.ball(o, new RAPIER.Vector3(-shift, 0.0, 0.0));
                joints.push(world.createJoint(params, parent, child));
            }

            parents.push(child);
        }
    }
}


export function initWorld(RAPIER, testbed) {
    let gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
    let world = new RAPIER.World(gravity);
    let bodies = new Array();
    let colliders = new Array();
    let joints = new Array();

    create_revolute_joints(
        RAPIER,
        world,
        bodies,
        colliders,
        joints,
        new RAPIER.Vector3(20.0, 0.0, 0.0),
        3
    );
    create_ball_joints(RAPIER, world, bodies, colliders, joints, 15);

    testbed.setWorld(world, bodies, colliders, joints);
    let cameraPosition = {
        eye: {x: 15.0, y: 5.0, z: 42.0},
        target: {x: 13.0, y: 1.0, z: 1.0}
    };
    testbed.lookAt(cameraPosition)
}