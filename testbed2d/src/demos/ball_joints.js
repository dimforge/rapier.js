export function initWorld(RAPIER, testbed) {
    let world = new RAPIER.World(0.0, -9.81);
    let bodies = new Array();
    let colliders = new Array();
    let joints = new Array();

    let rad = 0.4;
    let numi = 70; // Num vertical nodes.
    let numk = 70; // Num horizontal nodes.
    let shift = 1.0;
    let i, k;

    for (k = 0; k < numk; ++k) {
        for (i = 0; i < numi; ++i) {
            let status = (k >= numk / 2 - 3 && k <= numk / 2 + 3 && i == 0) ? 'static' : 'dynamic';

            let bodyDesc = new RAPIER.RigidBodyDesc(status);
            bodyDesc.setTranslation(k * shift, -i * shift);
            let child = world.createRigidBody(bodyDesc);
            let colliderDesc = RAPIER.ColliderDesc.ball(rad);
            colliderDesc.density = 1.0;
            let collider = child.createCollider(colliderDesc);
            let joint;

            // Vertical joint.
            if (i > 0) {
                let parent = bodies[bodies.length - 1];
                let anchor1 = new RAPIER.Vector(0.0, 0.0);
                let anchor2 = new RAPIER.Vector(0.0, shift);
                let jointDesc = RAPIER.JointDesc.ball(anchor1, anchor2);
                joint = world.createJoint(jointDesc, parent, child);
                joints.push(joint);
            }

            // Horizontal joint.
            if (k > 0) {
                let parentIndex = bodies.length - numi;
                let parent = bodies[parentIndex];
                let anchor1 = new RAPIER.Vector(0.0, 0.0);
                let anchor2 = new RAPIER.Vector(-shift, 0.0);
                let jointDesc = RAPIER.JointDesc.ball(anchor1, anchor2);
                joint = world.createJoint(jointDesc, parent, child);
                joints.push(joint);
            }

            bodies.push(child);
            colliders.push(collider);
        }
    }

    testbed.setWorld(world, bodies, colliders, joints);
    testbed.lookAt({
        target: { x: 30.0, y: 30.0 },
        zoom: 10.0
    });
}