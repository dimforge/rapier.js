export function initWorld(RAPIER, testbed) {
    let gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
    let world = new RAPIER.World(gravity);
    let bodies = new Array();
    let colliders = new Array();

    /*
     * The ground
     */
    let ground_size = 1.5;
    let ground_height = 0.1;

    let bodyDesc = new RAPIER.RigidBodyDesc(RAPIER.BodyStatus.Static)
        .setTranslation(new RAPIER.Vector3(0.0, -ground_height, 0.0));
    let body = world.createRigidBody(bodyDesc);
    let colliderDesc = RAPIER.ColliderDesc.cuboid(ground_size, ground_height, ground_size);
    let collider = world.createCollider(colliderDesc, body.handle);
    bodies.push(body);
    colliders.push(collider);

    /*
     * A rectangle that only rotates along the `x` axis.
     */
    bodyDesc = new RAPIER.RigidBodyDesc(RAPIER.BodyStatus.Dynamic)
        .setTranslation(new RAPIER.Vector3(0.0, 3.0, 0.0))
        .lockTranslations()
        .setPrincipalAngularInertia(new RAPIER.Vector3(0.0, 0.0, 0.0), true, false, false);
    body = world.createRigidBody(bodyDesc);
    colliderDesc = RAPIER.ColliderDesc.cuboid(0.2, 0.6, 2.0);
    collider = world.createCollider(colliderDesc, body.handle);
    bodies.push(body);
    colliders.push(collider);


    /*
     * A cylinder that cannot rotate.
     */
    bodyDesc = new RAPIER.RigidBodyDesc(RAPIER.BodyStatus.Dynamic)
        .setTranslation(new RAPIER.Vector3(0.2, 5.0, 0.4))
        .lockRotations();
    body = world.createRigidBody(bodyDesc);
    colliderDesc = RAPIER.ColliderDesc.cylinder(0.6, 0.4);
    collider = world.createCollider(colliderDesc, body.handle);
    bodies.push(body);
    colliders.push(collider);

    /*
     * Setup the testbed.
     */
    testbed.setWorld(world, bodies, colliders);
    let cameraPosition = {
        eye: {x: -10.0, y: 3.0, z: 0.0},
        target: {x: 0.0, y: 3.0, z: 0.0}
    };
    testbed.lookAt(cameraPosition)
}