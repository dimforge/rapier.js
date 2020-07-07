import * as PhysX from 'physx-js'

export class PhysXBackend {
    constructor(world, bodies, colliders, joints) {
        var me = this;
        PhysX().then(function(PhysX) {
            const version = PhysX.PX_PHYSICS_VERSION;
            const defaultErrorCallback = new PhysX.PxDefaultErrorCallback();
            const allocator = new PhysX.PxDefaultAllocator();
            const foundation = PhysX.PxCreateFoundation(
                version,
                allocator,
                defaultErrorCallback
            );
            const triggerCallback = {
                onContactBegin: () => {},
                onContactEnd: () => {},
                onContactPersist: () => {},
                onTriggerBegin: () => {},
                onTriggerEnd: () => {},
            };
            const physxSimulationCallbackInstance = PhysX.PxSimulationEventCallback.implement(
                triggerCallback
            );

            me.physics = PhysX.PxCreatePhysics(
                version,
                foundation,
                new PhysX.PxTolerancesScale(),
                false,
                null
            );
            PhysX.PxInitExtensions(me.physics, null);
            let sceneDesc = PhysX.getDefaultSceneDesc(
                me.physics.getTolerancesScale(),
                0,
                physxSimulationCallbackInstance
            );
            me.world = me.physics.createScene(sceneDesc);

            me.bodyMap = new Map(bodies.map(body => {
                let pos = body.translation;
                let px_pos = {
                    translation: { x: pos.x, y: pos.y, z: pos.z },
                    rotation: { w: 1.0, x: 0.0, y: 0.0, z: 0.0 }
                };

                let px_body = body.type == "dynamic" ? me.physics.createRigidDynamic(px_pos) : me.physics.createRigidStatic(px_pos);
                me.world.addActor(px_body, null);
                return [ body.handle, px_body ];
            }));

            me.colliderMap = new Map(colliders.map(coll => {
                let handle = coll.parent_handle;
                let px_body = me.bodyMap.get(handle);
                let px_geom;

                switch (coll.type) {
                    case 'Cuboid':
                        let he = coll.half_extents;
                        px_geom = new PhysX.PxBoxGeometry(he.x, he.y, he.z);
                        break;
                    case 'Ball':
                        let r = coll.radius;
                        px_geom = new PhysX.PxSphereGeometry(r);
                        break;
                }

                let px_material = me.physics.createMaterial(coll.friction, coll.friction, 0.0);
                const px_flags = new PhysX.PxShapeFlags(PhysX.PxShapeFlag.eSIMULATION_SHAPE.value);
                const px_shape = me.physics.createShape(px_geom, px_material, false, px_flags);
                px_body.attachShape(px_shape);

                return [ coll.handle, px_body ];
            }));

            joints.forEach(joint => {
                let handle1 = joint.handle1;
                let handle2 = joint.handle2;
                let px_body1 = me.bodyMap.get(handle1);
                let px_body2 = me.bodyMap.get(handle2);
                let anchor1, anchor2, px_anchor1, px_anchor2;
                let px_constraint;

                switch (joint.type) {
                    case "Ball":
                        anchor1 = joint.anchor1;
                        anchor2 = joint.anchor2;
                        px_anchor1 = {
                            translation: { x: anchor1.x, y: anchor1.y, z: anchor1.z },
                            rotation: { w: 1.0, x: 0.0, y: 0.0, z: 0.0 }
                        };
                        px_anchor2 = {
                            translation: { x: anchor2.x, y: anchor2.y, z: anchor2.z },
                            rotation: { w: 1.0, x: 0.0, y: 0.0, z: 0.0 }
                        };
                        px_constraint = PhysX.PxSphericalJointCreate(me.physics, px_body1, px_anchor1, px_body2, px_anchor2);
                        break;
                    case "Revolute":
                        anchor1 = joint.anchor1;
                        anchor2 = joint.anchor2;
                        let frame1 = joint.frame_x_1;
                        let frame2 = joint.frame_x_2;

                        px_anchor1 = {
                            translation: { x: anchor1.x, y: anchor1.y, z: anchor1.z },
                            rotation: { w: frame1.w, x: frame1.x, y: frame1.y, z: frame1.z }
                        };
                        px_anchor2 = {
                            translation: { x: anchor2.x, y: anchor2.y, z: anchor2.z },
                            rotation: { w: frame2.w, x: frame2.x, y: frame2.y, z: frame2.z }
                        };
                        px_constraint = PhysX.PxRevoluteJointCreate(me.physics, px_body1, px_anchor1, px_body2, px_anchor2);
                        break;
                    default:
                        return;
                }
            });

            me.PHYSX = PhysX;

        });
    }

    step(numVelIters, numPosIters) {
        if (!!this.PHYSX && !!this.world) {
            // TODO: it appears we can't change the number of iterations
            // for the PhysX backend yet. It has to be changed on each body
            // but the relevant bindings don't appear to be there.
            var t0 = new Date().getTime();
            this.world.simulate(0.016, true);
            this.world.fetchResults(true);
            this.stepTime = new Date().getTime() - t0;
        }
    }

    colliderPositions() {
        if (!!this.PHYSX && !!this.world) {
            let result = [];

            if (this.colliderMap) {
                this.colliderMap.forEach((px_body, handle) => {
                    let px_pos = px_body.getGlobalPose();
                    let t = px_pos.translation;
                    let r = px_pos.rotation;
                    let entry = {
                        handle: handle,
                        translation: {x: t.x, y: t.y, z: t.z},
                        rotation: {x: r.x, y: r.y, z: r.z, w: r.w}
                    };

                    result.push(entry);
                });
            }

            return {
                stepTime: this.stepTime,
                positions: result
            }
        }
    }
}
