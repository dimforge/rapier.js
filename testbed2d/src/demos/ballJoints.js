export function initWorld(RAPIER, testbed) {
    let gravity = new RAPIER.Vector2(0.0, -9.81);
    let world = new RAPIER.World(gravity);
    let bodies = [];

    let rad = 0.4;
    let numi = 50; // Num vertical nodes.
    let numk = 50; // Num horizontal nodes.
    let shift = 1.0;
    let i, k;

    for (k = 0; k < numk; ++k) {
        for (i = 0; i < numi; ++i) {
            let status = (k >= numk / 2 - 3 && k <= numk / 2 + 3 && i == 0) ? RAPIER.BodyStatus.Static : RAPIER.BodyStatus.Dynamic;

            let bodyDesc = new RAPIER.RigidBodyDesc(status)
                .setTranslation(k * shift, -i * shift);
            let child = world.createRigidBody(bodyDesc);
            let colliderDesc = RAPIER.ColliderDesc.ball(rad);
            world.createCollider(colliderDesc, child.handle);

            // Vertical joint.
            if (i > 0) {
                let parent = bodies[bodies.length - 1];
                let anchor1 = new RAPIER.Vector2(0.0, 0.0);
                let anchor2 = new RAPIER.Vector2(0.0, shift);
                let jointParams = RAPIER.JointParams.ball(anchor1, anchor2);
                world.createJoint(jointParams, parent, child);
            }

            // Horizontal joint.
            if (k > 0) {
                let parentIndex = bodies.length - numi;
                let parent = bodies[parentIndex];
                let anchor1 = new RAPIER.Vector2(0.0, 0.0);
                let anchor2 = new RAPIER.Vector2(-shift, 0.0);
                let jointParams = RAPIER.JointParams.ball(anchor1, anchor2);
                world.createJoint(jointParams, parent, child);
            }

            bodies.push(child);
        }
    }

    testbed.setWorld(world);
    testbed.lookAt({
        target: {x: 30.0, y: 30.0},
        zoom: 10.0
    });
}