export function initWorld(RAPIER, testbed) {
    let gravity = new RAPIER.Vector2(0.0, -9.81);
    let world = new RAPIER.World(gravity);
    let i, j;

    /*
     * Ground
     */
    let ground_size = {x: 50.0, y: 1.0};
    let nsubdivs = 100;
    let heights = [];

    heights.push(40.0);
    for (i = 1; i < nsubdivs; ++i) {
        heights.push(Math.cos(i * ground_size.x / (nsubdivs)) * 2.0);
    }
    heights.push(40.0);

    let bodyDesc = RAPIER.RigidBodyDesc.newStatic();
    let body = world.createRigidBody(bodyDesc);
    let colliderDesc = RAPIER.ColliderDesc.heightfield(heights, ground_size);
    world.createCollider(colliderDesc, body.handle);

    /*
     * Create the cubes
     */
    let num = 15;
    let rad = 0.5;

    let shift = rad * 2.0;
    let centerx = shift * (num / 2);
    let centery = shift / 2.0;

    for (i = 0; i < num; ++i) {
        for (j = 0; j < num * 5; ++j) {
            let x = i * shift - centerx;
            let y = j * shift + centery + 3.0;

            // Build the rigid body.
            let bodyDesc = RAPIER.RigidBodyDesc.newDynamic().setTranslation(x, y);
            let body = world.createRigidBody(bodyDesc);

            if (j % 2 == 0) {
                let colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad);
                world.createCollider(colliderDesc, body.handle);
            } else {
                let colliderDesc = RAPIER.ColliderDesc.ball(rad);
                world.createCollider(colliderDesc, body.handle);
            }
        }
    }

    testbed.setWorld(world);
    testbed.lookAt({
        target: {x: -10.0, y: -15.0},
        zoom: 10.0
    });
}