import {PhysicsModifications} from "../PhysicsModifications"

export function initWorld(RAPIER, testbed) {
    let gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
    let world = new RAPIER.World(gravity);
    let bodies = new Array();
    let colliders = new Array();
    let removableBodies = new Array();

    // Create Ground.
    let groundBodyDesc = new RAPIER.RigidBodyDesc(RAPIER.BodyStatus.Static);
    let groundBody = world.createRigidBody(groundBodyDesc);
    let groundColliderDesc = RAPIER.ColliderDesc.cuboid(40.0, 0.1, 40.0);
    let groundCollider = world.createCollider(groundColliderDesc, groundBody.handle);
    bodies.push(groundBody);
    colliders.push(groundCollider);

    // Dynamic cubes.
    let rad = 1.0;
    let j = 0;

    let spawnBodies = () => {
        j += 1;
        let modifications = new PhysicsModifications();

        let bodyDesc = new RAPIER.RigidBodyDesc(RAPIER.BodyStatus.Dynamic)
            .setLinvel(new RAPIER.Vector3(0.0, 15.0, 0.0))
            .setTranslation(new RAPIER.Vector3(0.0, 10.0, 0.0));
        let colliderDesc;

        switch (j % 4) {
            case 0:
                colliderDesc
                    = RAPIER.ColliderDesc.cuboid(rad, rad, rad);
                break;
            case 1:
            // colliderDesc
            //     = RAPIER.ColliderDesc.ball(rad);
            // break;
            case 2:
                colliderDesc
                    = RAPIER.ColliderDesc.roundCylinder(rad, rad, rad / 10.0);
                break;
            case 3:
                colliderDesc
                    = RAPIER.ColliderDesc.cone(rad, rad);
                break;
        }

        let body = world.createRigidBody(bodyDesc);
        let collider = world.createCollider(colliderDesc, body.handle);

        removableBodies.push(body.handle);
        modifications.addRigidBody(body);
        modifications.addCollider(collider);

        // We reached the max number, delete the oldest rigid-body.
        if (removableBodies.length > 400) {
            let rb = world.getRigidBody(removableBodies[0]);
            world.removeRigidBody(rb);
            modifications.removeRigidBody(removableBodies[0]);
            removableBodies.shift();
        }

        return modifications.commands;
    }

    testbed.setWorld(world, bodies, colliders);
    testbed.setpreTimestepAction(spawnBodies);

    let cameraPosition = {
        eye: {x: -88.48024008669711, y: 46.911325612198354, z: 83.56055570254844},
        target: {x: 0.0, y: 10.0, z: 0.0}
    };
    testbed.lookAt(cameraPosition)
}