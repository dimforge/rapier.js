export function initWorld(RAPIER, testbed) {
    let gravity = new RAPIER.Vector2(0.0, -9.81);
    let world = new RAPIER.World(gravity);

    /*
     * The ground
     */
    let ground_size = 1.8;
    let ground_height = 1.0;

    let bodyDesc = RAPIER.RigidBodyDesc.newStatic()
        .setTranslation(0.0, -ground_height);
    let body = world.createRigidBody(bodyDesc);
    let colliderDesc = RAPIER.ColliderDesc.cuboid(ground_size, ground_height);
    world.createCollider(colliderDesc, body.handle);

    /*
     * A rectangle that only rotates along the `x` axis.
     */
    bodyDesc = RAPIER.RigidBodyDesc.newDynamic()
        .setTranslation(0.0, 3.0)
        .lockTranslations();
    body = world.createRigidBody(bodyDesc);
    colliderDesc = RAPIER.ColliderDesc.cuboid(2.0, 0.6);
    world.createCollider(colliderDesc, body.handle);


    /*
     * A cuboid that cannot rotate.
     */
    bodyDesc = RAPIER.RigidBodyDesc.newDynamic()
        .setTranslation(0.4, 5.0)
        .lockRotations();
    body = world.createRigidBody(bodyDesc);
    colliderDesc = RAPIER.ColliderDesc.cuboid(0.4, 0.6);
    world.createCollider(colliderDesc, body.handle);

    /*
     * Setup the testbed.
     */
    testbed.setWorld(world);
    testbed.lookAt({
        target: {x: 0.0, y: -2.0},
        zoom: 50.0
    });
}