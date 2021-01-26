export function initWorld(RAPIER, testbed) {
    let gravity = new RAPIER.Vector2(0.0, -9.81);
    let world = new RAPIER.World(gravity);

    /*
     * Ground
     */
    let ground_size = 5.0;
    let ground_height = 0.1;

    let groundBodyDesc = RAPIER.RigidBodyDesc.newStatic()
        .setTranslation(0.0, -ground_height);
    let groundBody = world.createRigidBody(groundBodyDesc);
    let colliderDesc = RAPIER.ColliderDesc.cuboid(ground_size, ground_height);
    world.createCollider(colliderDesc, groundBody.handle);

    /*
     * Setup groups
     */
    let group1 = 0x00010001;
    let group2 = 0x00020002;

    /*
     * A green floor that will collide with the first group only.
     */
    colliderDesc = RAPIER.ColliderDesc.cuboid(1.0, 0.1)
        .setTranslation(0.0, 1.0)
        .setCollisionGroups(group1);
    world.createCollider(colliderDesc, groundBody.handle);

    /*
     * A blue floor that will collide with the second group only.
     */
    colliderDesc = RAPIER.ColliderDesc.cuboid(1.0, 0.1)
        .setTranslation(0.0, 2.0)
        .setCollisionGroups(group2);
    world.createCollider(colliderDesc, groundBody.handle);

    /*
     * Create the cubes
     */
    let num = 8;
    let rad = 0.1;

    let shift = rad * 2.0;
    let centerx = shift * (num / 2);
    let centery = 2.5;
    let i, j;

    for (j = 0; j < 4; ++j) {
        for (i = 0; i < num; ++i) {
            let x = i * shift - centerx;
            let y = j * shift + centery;

            // Alternate between the green and blue groups.
            let group = (i % 2 == 0) ? group1 : group2;

            let bodyDesc = RAPIER.RigidBodyDesc.newDynamic().setTranslation(x, y);
            let body = world.createRigidBody(bodyDesc);
            let colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad)
                .setCollisionGroups(group);
            world.createCollider(colliderDesc, body.handle);
        }
    }

    testbed.setWorld(world);
    testbed.lookAt({
        target: {x: 0.0, y: -1.0},
        zoom: 100.0
    });
}