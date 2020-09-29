import {Vector, World, RigidBodyDesc, ColliderDesc, JointParams, BodyStatus} from '@dimforge/rapier3d'

export function initWorld(RAW_RAPIER, testbed) {
    let gravity = new Vector(0.0, -9.81, 0.0);
    let world = new World(RAW_RAPIER, gravity);
    let bodies = new Array();
    let colliders = new Array();
    let joints = new Array();

    let rad = 0.4;
    let num = 31;
    let shift = 1.0;
    let i, k;

    for (k = 0; k < num; ++k) {
        for (i = 0; i < num; ++i) {
            let status = i == 0 && (k % 4 == 0 || k == num - 1) ? BodyStatus.Static : BodyStatus.Dynamic;

            let bodyDesc = new RigidBodyDesc(status)
                .withTranslation(new Vector(k * shift, 0.0, i * shift));
            let child = world.createRigidBody(bodyDesc);
            let colliderDesc = ColliderDesc.ball(rad);
            let collider = world.createCollider(colliderDesc, child.handle);
            let joint;

            // Vertical joint.
            if (i > 0) {
                let parent = bodies[bodies.length - 1];
                let anchor1 = new Vector(0.0, 0.0, 0.0);
                let anchor2 = new Vector(0.0, 0.0, -shift);
                let jointParams = JointParams.ball(anchor1, anchor2);
                joint = world.createJoint(jointParams, parent, child);
                joints.push(joint);
            }

            // Horizontal joint.
            if (k > 0) {
                let parentIndex = bodies.length - num;
                let parent = bodies[parentIndex];
                let anchor1 = new Vector(0.0, 0.0, 0.0);
                let anchor2 = new Vector(-shift, 0.0, 0.0);
                let jointParams = JointParams.ball(anchor1, anchor2);
                joint = world.createJoint(jointParams, parent, child);
                joints.push(joint);
            }

            bodies.push(child);
            colliders.push(collider);
        }
    }

    testbed.setWorld(world, bodies, colliders, joints);
    let cameraPosition = {
        eye: {x: -76.24096608044253, y: 4.647984060151934, z: 49.1960115355001},
        target: {x: -7.103281826034137, y: -22.073277339427364, z: 7.9264025035129535}
    };
    testbed.lookAt(cameraPosition)
}