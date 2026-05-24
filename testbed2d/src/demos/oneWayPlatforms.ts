import { Graphics } from "../Graphics";
import type { Testbed } from "../Testbed";

type RAPIER_API = typeof import("@dimforge/rapier2d");

export function initWorld(RAPIER: RAPIER_API, testbed: Testbed) {
    const physics_hooks = {
        filterContactPair() {
            return RAPIER.SolverFlags.COMPUTE_IMPULSE;
        },
        filterIntersectionPair() {
            return true;
        },
        modifySolverContacts: (
            rawContext: any,
        ) => {
            const context = new RAPIER.ContactModificationContext(rawContext);
            let allowed_local_n1 = { x: 0.0, y: 0.0 };

            if (context.collider1 == platform1Collider.handle) {
                allowed_local_n1 = { x: 0.0, y: 1.0 };
            } else if (context.collider2 == platform1Collider.handle) {
                // Flip the allowed direction.
                allowed_local_n1 = { x: 0.0, y: -1.0 };
            }

            if (context.collider1 == platform2Collider.handle) {
                allowed_local_n1 = { x: 0.0, y: -1.0 };
            } else if (context.collider2 == platform2Collider.handle) {
                // Flip the allowed direction.
                allowed_local_n1 = { x: 0.0, y: 1.0 };
            }

            // Call the helper function that simulates one-way platforms.
            context.updateAsOnewayPlatform(
                allowed_local_n1,
                0.1,
            );

            // Set the surface velocity of the accepted contacts.
            let tangent_velocity =
                (context.collider1 == platform1Collider.handle ||
                        context.collider2 == platform2Collider.handle)
                    ? -12.0
                    : 12.0;

            for (let i = 0; i < context.numSolverContacts; ++i) {
                context.setSolverContactTangentVelocity(
                    i,
                    {
                        x: tangent_velocity,
                        y: 0.0,
                    },
                );
            }
        },
    };

    let gravity = new RAPIER.Vector2(0.0, -9.81);
    let world = new RAPIER.World(gravity);

    let groundBody = RAPIER.RigidBodyDesc.fixed().setTranslation(0.0, 0.0);
    let groundHandle = world.createRigidBody(groundBody);

    let platform1 = RAPIER.ColliderDesc.cuboid(25.0, 0.5)
        .setTranslation(30.0, 2.0)
        .setActiveHooks(RAPIER.ActiveHooks.MODIFY_SOLVER_CONTACTS);
    let platform1Collider = world.createCollider(platform1, groundHandle);

    let platform2 = RAPIER.ColliderDesc.cuboid(25.0, 0.5)
        .setTranslation(-30.0, -2.0)
        .setActiveHooks(RAPIER.ActiveHooks.MODIFY_SOLVER_CONTACTS);
    let platform2Collider = world.createCollider(platform2, groundHandle);

    // Note: The OneWayPlatformHook implementation is omitted for brevity.
    // let physicsHooks = new OneWayPlatformHook(/* platform1, platform2 */);

    let boxCollDesc = RAPIER.ColliderDesc.cuboid(1.5, 2.0);
    let boxBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
        20.0,
        10.0,
    );
    let box0 = world.createRigidBody(boxBodyDesc);
    world.createCollider(
        boxCollDesc,
        box0,
    );
    let box1 = world.createRigidBody(
        boxBodyDesc.setTranslation(40.0, -10.0).setGravityScale(-1),
    );
    world.createCollider(
        boxCollDesc,
        box1,
    );
    let box2 = world.createRigidBody(
        boxBodyDesc.setTranslation(-20.0, 10.0).setGravityScale(1),
    );
    world.createCollider(
        boxCollDesc,
        box2,
    );
    let box3 = world.createRigidBody(
        boxBodyDesc.setTranslation(-40.0, -10.0).setGravityScale(-1),
    );
    world.createCollider(
        boxCollDesc,
        box3,
    );

    testbed.hooks = physics_hooks;
    testbed.setpreTimestepAction((graphics: Graphics) => {
        testbed.world.forEachActiveRigidBody((body) => {
            if (body.translation().y > 1.0) {
                body.setGravityScale(1.0, false);
            } else if (body.translation().y < -1.0) {
                body.setGravityScale(-1.0, false);
            }
        });
    });

    testbed.setWorld(world);
    testbed.lookAt({
        target: { x: -10.0, y: -30.0 },
        zoom: 7.0,
    });
}
