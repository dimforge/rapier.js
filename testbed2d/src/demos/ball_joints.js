export function initWorld(RAPIER, testbed) {
    let world = new RAPIER.World(0.0, -9.81, 0.0);
    let bodies = new Array();
    let colliders = new Array();
    let joints = new Array();

    let rad = 0.4;
    let num = 31;
    let shift = 1.0;
    let i, k;

    for (k = 0; k < num; ++k) {
        for (i = 0; i < num; ++i) {
            let status = i == 0 && (k % 4 == 0 || k == num - 1) ? 'static' : 'dynamic';

            let bodyDesc = new RAPIER.RigidBodyDesc(status);
            bodyDesc.setTranslation(k * shift, 0.0, i * shift);
            let child = world.createRigidBody(bodyDesc);
            let colliderDesc = RAPIER.ColliderDesc.ball(rad);
            colliderDesc.density = 1.0;
            let collider = child.createCollider(colliderDesc);
            let joint;

            // Vertical joint.
            if (i > 0) {
                let parent = bodies[bodies.length - 1];
                let anchor1 = new RAPIER.Vector(0.0, 0.0, 0.0);
                let anchor2 = new RAPIER.Vector(0.0, 0.0, -shift);
                let jointDesc = RAPIER.JointDesc.ball(anchor1, anchor2);
                joint = world.createJoint(jointDesc, parent, child);
                joints.push(joint);
            }

            // Horizontal joint.
            if (k > 0) {
                let parentIndex = bodies.length - num;
                let parent = bodies[parentIndex];
                let anchor1 = new RAPIER.Vector(0.0, 0.0, 0.0);
                let anchor2 = new RAPIER.Vector(-shift, 0.0, 0.0);
                let jointDesc = RAPIER.JointDesc.ball(anchor1, anchor2);
                joint = world.createJoint(jointDesc, parent, child);
                joints.push(joint);
            }

            bodies.push(child);
            colliders.push(collider);
        }
    }

    testbed.setWorld(world, bodies, colliders, joints);
    let cameraPosition = {
        eye: { x: -76.24096608044253, y: 4.647984060151934, z: 49.1960115355001 },
        target: { x: -7.103281826034137, y: -22.073277339427364, z: 7.9264025035129535 }
    };
    testbed.lookAt(cameraPosition)
}