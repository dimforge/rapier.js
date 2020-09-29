import {Vector, World, RigidBodyDesc, ColliderDesc, BodyStatus, JointParams} from '@dimforge/rapier3d'

export function initWorld(RAW_RAPIER, testbed) {
    let gravity = new Vector(0.0, -9.81, 0.0);
    let world = new World(RAW_RAPIER, gravity);
    let bodies = new Array();
    let colliders = new Array();
    let joints = new Array();


    let rad = 0.4;
    let num = 3;
    let shift = 2.0;
    let i, j, k, l;

    for (l = 0; l < 5; ++l) {
        let y = l * shift * num * 3.0;

        for (j = 0; j < 10; ++j) {
            let x = j * shift * 4.0;

            let bodyDesc = new RigidBodyDesc(BodyStatus.Static)
                .withTranslation(new Vector(x, y, 0.0));
            let currParent = world.createRigidBody(bodyDesc);

            let colliderDesc = ColliderDesc.cuboid(rad, rad, rad);
            let collider = world.createCollider(colliderDesc, currParent.handle);

            bodies.push(currParent);
            colliders.push(collider);

            for (i = 0; i < num; ++i) {
                // Create four bodies.
                let z = i * shift * 2.0 + shift;
                let positions = [
                    new Vector(x, y, z),
                    new Vector(x + shift, y, z),
                    new Vector(x + shift, y, z + shift),
                    new Vector(x, y, z + shift),
                ];

                let parents = [currParent, currParent, currParent, currParent];
                for (k = 0; k < 4; ++k) {
                    let p = positions[k];
                    let bodyDesc = new RigidBodyDesc(BodyStatus.Dynamic)
                        .withTranslation(p);
                    parents[k] = world.createRigidBody(bodyDesc);

                    let colliderDesc = ColliderDesc.cuboid(rad, rad, rad);
                    let collider = world.createCollider(colliderDesc, parents[k].handle);
                    bodies.push(parents[k]);
                    colliders.push(collider);
                }

                // Setup four joints.
                let o = new Vector(0.0, 0.0, 0.0);
                let xAxis = new Vector(1.0, 0.0, 0.0);
                let zAxis = new Vector(0.0, 0.0, 1.0);

                let revs = [
                    JointParams.revolute(o, zAxis, new Vector(0.0, 0.0, -shift), zAxis),
                    JointParams.revolute(o, xAxis, new Vector(-shift, 0.0, 0.0), xAxis),
                    JointParams.revolute(o, zAxis, new Vector(0.0, 0.0, -shift), zAxis),
                    JointParams.revolute(o, xAxis, new Vector(shift, 0.0, 0.0), xAxis),
                ];

                joints.push(world.createJoint(revs[0], currParent, parents[0]));
                joints.push(world.createJoint(revs[1], parents[0], parents[1]));
                joints.push(world.createJoint(revs[2], parents[1], parents[2]));
                joints.push(world.createJoint(revs[3], parents[2], parents[3]));

                currParent = parents[3];
            }
        }
    }

    testbed.setWorld(world, bodies, colliders, joints);
    let cameraPosition = {
        eye: {x: -51.470132013355254, y: 36.42820470562974, z: 101.86333640106977},
        target: {x: 26.536430977264782, y: 30.320536835519317, z: 10.348050888417388}
    };
    testbed.lookAt(cameraPosition)
}