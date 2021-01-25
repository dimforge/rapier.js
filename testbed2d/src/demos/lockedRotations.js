export function initWorld(RAPIER, testbed) {
    let gravity = new RAPIER.Vector2(0.0, -9.81);
    let world = new RAPIER.World(gravity);
    let bodies = new Array();
    let colliders = new Array();

    /*
     * The ground
     */
    let ground_size = 1.8;
    let ground_height = 1.0;

    let bodyDesc = new RAPIER.RigidBodyDesc(RAPIER.BodyStatus.Static)
        .setTranslation(0.0, -ground_height);
    let body = world.createRigidBody(bodyDesc);
    let colliderDesc = RAPIER.ColliderDesc.cuboid(ground_size, ground_height);
    let collider = world.createCollider(colliderDesc, body.handle);
    bodies.push(body);
    colliders.push(collider);

    /*
     * A rectangle that only rotates along the `x` axis.
     */
    bodyDesc = new RAPIER.RigidBodyDesc(RAPIER.BodyStatus.Dynamic)
        .setTranslation(0.0, 3.0)
        .lockTranslations();
    body = world.createRigidBody(bodyDesc);
    colliderDesc = RAPIER.ColliderDesc.cuboid(2.0, 0.6);
    collider = world.createCollider(colliderDesc, body.handle);
    bodies.push(body);
    colliders.push(collider);


    /*
     * A cuboid that cannot rotate.
     */
    bodyDesc = new RAPIER.RigidBodyDesc(RAPIER.BodyStatus.Dynamic)
        .setTranslation(0.4, 5.0)
        .lockRotations();
    body = world.createRigidBody(bodyDesc);
    colliderDesc = RAPIER.ColliderDesc.cuboid(0.4, 0.6);
    collider = world.createCollider(colliderDesc, body.handle);
    bodies.push(body);
    colliders.push(collider);

    /*
     * Setup the testbed.
     */
    testbed.setWorld(world, bodies, colliders);
    testbed.lookAt({
        target: {x: 0.0, y: -2.0},
        zoom: 50.0
    });
}